# "Application has not been registered" 错误排查

> 原文地址：https://docs.expo.dev/troubleshooting/application-has-not-been-registered/

在使用 React Native 或 Expo 构建应用时，开发者经常会遇到一个特定的注册失败错误。错误信息如下：

```sh
Application "main" has not been registered.
Invariant Violation: "main" has not been registered.
```

> **说明**：错误信息中的占位文本（上面显示的是 `"main"`）可以是任意字符串，不一定只是默认值。如果你看到引号内是其他名称（比如你的自定义组件名），原理和排查方式完全相同。

---

## 这个错误的含义

这个错误本质上是在告诉你：**你的应用未能在原生层成功注册**。导致这一结果的原因主要有两大类，下面逐一展开。

### 原因一：异常阻止了应用的注册

这是最常见的情况。React Native 项目的初始化过程分为两个步骤：

1. **加载 JavaScript Bundle**：系统首先加载 JS 代码包。如果加载成功，应用就会完成注册。但如果在加载过程中发生了崩溃（例如某个模块抛出未捕获的异常），整个执行流程会中断，注册步骤无法完成。
2. **启动已注册的应用**：系统尝试启动已注册的应用组件。如果第一步失败了，注册未完成，就会触发本文讨论的错误信息。

> **基于文档内容推导**：在这种情况下，你看到的 "Application has not been registered" 其实是一条**误导性的错误信息**（原文称之为 "red herring"，即转移注意力的假线索）。真正的根因发生在注册之前——是某个未被捕获的异常导致了注册流程中断。

#### 排查方法

**检查控制台日志中排在错误之前的输出**，那里通常隐藏着真正的触发原因。

一个典型的例子是：项目中安装了重复的原生模块版本，并且这些模块被注册为视图组件——比如同时存在多个版本的 `react-native-safe-area-context` 包，就会产生冲突并导致初始化失败。

```sh
# 检查项目中是否存在重复依赖（基于经验建议）
npm ls react-native-safe-area-context
# 或
yarn why react-native-safe-area-context
```

> **基于经验建议**：如果你使用 `npm` 或 `yarn`，可以用上面的命令查看某个包是否被多次安装。如果发现多个版本，尝试统一版本后重新安装依赖。

### 原因二：根组件未正确注册

另一种可能的原因是：**你在 JavaScript 端传给组件注册函数的标识符，与 iOS 或 Android 原生端配置的标识符不一致**。

#### Managed Workflow（托管工作流）

在托管工作流中，系统会自动使用一个默认标识符（即 `"main"`），通常无需手动干预。除非你在配置文件中修改了相关入口配置项，否则不会出现这个问题。如果需要修改入口点，请参阅对应的 API 文档。

#### Bare Workflow（裸工作流）

在包含原生目录的裸工作流中，主 JavaScript 文件（通常是 `index.js`）通常包含以下导入和函数调用：

```js
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

> **说明**：`registerRootComponent` 是 Expo 提供的辅助函数，用于将你的根组件注册到 React Native 的 `AppRegistry` 中。

该辅助函数的底层实现大致如下：

```js
function registerRootComponent(component) {
  AppRegistry.registerComponent('main', () => component);
}
```

这里的关键点是：注册时使用的名称是 `'main'`。

#### iOS 原生端配置

在 iOS 原生代码中，根视图初始化时需要指定正确的模块名称：

```objectivec
RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"main" initialProperties:nil];
```

> **说明**：`moduleName:@"main"` 这个值必须与 JavaScript 端注册时使用的名称完全一致。

#### Android 原生端配置

类似地，Android 的主 Activity 必须返回匹配的组件名称：

```java
@Override
protected String getMainComponentName() {
  return "main";
}
```

> **说明**：`getMainComponentName()` 返回的字符串同样必须与 JavaScript 端注册的名称完全一致。

#### 排查方法

通常，默认标识符在所有文件中是一致的（都是 `"main"`）。如果这个错误出现了，说明这些值很可能已经产生了分歧。

**请逐一检查以下位置，确保名称完全匹配：**

| 位置 | 文件 | 需要检查的值 |
|------|------|-------------|
| JavaScript 注册 | `index.js` | `registerRootComponent(App)` 内部使用的名称 |
| iOS 原生 | `AppDelegate.mm` 或类似文件 | `moduleName:@"main"` |
| Android 原生 | `MainActivity.java/kt` | `getMainComponentName()` 返回值 |

> **基于经验建议**：如果你曾经使用 `react-native-rename` 等工具重命名过项目，或者手动修改过原生代码，很容易造成这些名称不一致。

---

## 其他需要考虑的情况

这个问题也可能在一些不太常见的场景下出现，需要针对性的解决方案。以下是文档提到的额外场景：

### 设备连接到了错误的本地服务器

你的设备可能正在连接到一个错误的本地开发服务器（例如另一个项目的 Metro 服务），导致加载了错误的 JS Bundle。

```sh
# 查找并终止冲突的 CLI 后台进程
ps -A | grep "expo\|react-native"
```

> **说明**：这条命令的作用是列出所有正在运行的进程，并过滤出包含 `expo` 或 `react-native` 关键词的进程。如果你发现有不相关的 Expo 或 React Native 进程在后台运行，可以使用 `kill` 命令终止它们，然后重新启动你的开发服务器。
>
> ```sh
> # 终止指定进程（将 <PID> 替换为实际的进程 ID）
> kill <PID>
> ```

### 问题仅在生产构建中出现

如果这个问题只在生产构建（production build）中出现，而开发模式下正常，可以用以下命令在本地模拟生产环境来隔离问题：

```sh
npx expo start --no-dev --minify
```

> **说明**：
> - `--no-dev`：关闭开发模式，使 Metro 以生产模式运行（不会包含开发专用的错误提示和热重载等功能）。
> - `--minify`：对 JS Bundle 进行压缩混淆，与生产构建的行为一致。
>
> 这样可以在本地复现生产环境的行为，帮助你定位到底是哪段代码在生产模式下出了问题。

---

## 快速排查清单

基于以上文档内容，整理出以下排查步骤供参考：

1. **查看控制台日志**：在 "Application has not been registered" 错误之前，是否有其他错误或警告信息？那通常才是真正的根因。
2. **检查重复依赖**：使用 `npm ls <package-name>` 或 `yarn why <package-name>` 检查是否存在重复安装的原生模块。
3. **核对注册名称一致性**（仅裸工作流）：确保 JavaScript、iOS、Android 三端使用的组件名称完全相同。
4. **终止冲突的后台进程**：使用 `ps -A | grep "expo\|react-native"` 排查是否有其他开发服务器在干扰。
5. **模拟生产环境**：如果问题仅在生产构建中出现，使用 `npx expo start --no-dev --minify` 本地复现。

---

## 文档导航

- **上一页**：[overview](./165__overview.md)
- **下一页**：[clear cache macos linux](./167__clear-cache-macos-linux.md)
