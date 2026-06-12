# Expo SystemUI 学习笔记

## 文档解决的问题

`expo-system-ui` 用于操作 **React 组件树之外的系统界面元素**。

当前文档主要介绍两个能力：

1. 读取和修改应用根视图的背景颜色。
2. 在 Android 上全局锁定用户界面的明暗样式。

支持平台：

- Android
- iOS
- tvOS
- Web

> **版本提醒：**原文是“下一个 Expo SDK 版本”的未发布版本文档。文档建议实际项目优先查看当前最新版本，即 SDK 56 对应的文档。不同 SDK 版本的 API 或配置方式可能存在差异。

## 阅读前需要理解的概念

### React 树之外的 UI

在 React Web 中，大多数界面都位于 React 渲染的 DOM 节点内。但浏览器页面还存在 `<html>`、`<body>`、浏览器窗口背景等外围区域。

React Native 也有类似边界：

- React 组件负责渲染应用内容。
- 原生应用还存在承载 React 内容的根视图。
- 某些系统界面行为不属于普通 React 组件。

`expo-system-ui` 操作的就是这类外围 UI，而不是某个 `<View>` 组件的 `style`。

### 根视图背景颜色

根视图是原生应用中承载 React Native 界面的最外层视图。

它的背景色可能在以下场景中短暂可见：

- React 界面尚未完成首次渲染。
- 页面或导航切换时出现透明区域。
- 根组件没有完全覆盖屏幕。
- 界面执行过渡或加载操作。

因此，设置根视图背景色与给最外层 React 组件设置背景色并不完全等价。

### 用户界面样式

`userInterfaceStyle` 表示应用采用的系统界面样式，常见值为：

- `light`：浅色模式
- `dark`：深色模式

当前文档重点说明的是在 Android 上进行全局锁定，而不是在 React 组件内部动态切换主题。

### CNG 与 config plugin

**Continuous Native Generation（CNG）** 是 Expo 根据应用配置生成或同步 iOS、Android 原生工程的工作流。

**Config plugin** 是在生成原生工程时修改原生配置的插件。它的作用类似构建阶段的自动化配置脚本，并不是浏览器运行时插件。

使用 CNG 时，可以在 `app.json` 等应用配置中声明属性，再由 `expo-system-ui` 的 config plugin 写入原生工程。没有使用 CNG 时，则需要手动修改 Android 或 iOS 原生文件。

## 安装

根据包管理器选择对应命令：

```sh
# npm
npx expo install expo-system-ui

# yarn
yarn expo install expo-system-ui

# pnpm
pnpm expo install expo-system-ui

# bun
bun expo install expo-system-ui
```

这里使用 `expo install`，而不是直接使用包管理器的普通安装命令。它会为当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用该库，必须先为项目安装并配置 `expo`，使项目具备使用 Expo Modules 的能力。

## 构建期配置

### 使用 CNG 和 config plugin

`expo-system-ui` 内置 config plugin，可以从 Expo app config 配置：

- Android 的 `userInterfaceStyle`
- iOS 的 `backgroundColor`

示意配置如下：

```json
{
  "expo": {
    "backgroundColor": "#ffffff",
    "userInterfaceStyle": "light",
    "ios": {
      "backgroundColor": "#ffffff"
    },
    "android": {
      "userInterfaceStyle": "light"
    },
    "plugins": ["expo-system-ui"]
  }
}
```

> 原文示例存在 JSON 语法问题，包括属性之间缺少逗号以及尾随逗号。以上代码已修正为合法 JSON，但没有改变配置含义。

各配置的职责如下：

| 配置 | 作用 |
| --- | --- |
| `backgroundColor` | 设置应用的默认背景颜色 |
| `userInterfaceStyle` | 设置默认用户界面样式 |
| `ios.backgroundColor` | 设置 iOS 平台背景颜色 |
| `android.userInterfaceStyle` | 设置 Android 平台用户界面样式 |
| `plugins` | 启用 `expo-system-ui` 的 config plugin |

### 配置何时生效

上述原生属性不能在运行时修改。修改配置后，必须重新构建应用二进制文件才能生效。

这与 React Web 中修改 CSS 后刷新页面不同。配置插件修改的是原生工程和应用包中的静态配置，因此仅重新加载 JavaScript、Fast Refresh 或发布 JavaScript 更新通常不足以应用这些变化。

### 不使用 CNG 时的手动配置

如果项目属于以下情况，需要手动修改原生工程：

- 不使用 CNG。
- 自己维护 `android` 和 `ios` 原生目录。
- 在已有 React Native 原生项目中集成该库。

#### Android

在以下文件中加入 `expo_system_ui_user_interface_style`：

```text
android/app/src/main/res/values/strings.xml
```

```xml
<resources>
  <!-- ... -->
  <string
    name="expo_system_ui_user_interface_style"
    translatable="false"
  >light</string>
</resources>
```

也可以将值改为 `dark`。

这不是 React Native 的 JavaScript 配置，而是 Android 原生资源。修改后需要重新构建 Android 应用。

#### iOS

原文要求修改：

```text
ios/your-app/Info.plist
```

并加入：

```xml
<plist>
  <dict>
    <!-- ... -->
    <key>UIUserInterfaceStyle</key>
    <string>Light</string>
  </dict>
</plist>
```

也可以将值改为 `Dark`。

`Info.plist` 是 iOS 应用的原生配置文件，作用类似应用包的静态元数据。

> **原文不一致：**配置章节前文称 iOS 手动配置的目标是 `backgroundColor`，但给出的 `UIUserInterfaceStyle` 实际表示用户界面明暗样式，并非背景颜色。当前文档没有给出手动配置 iOS 根视图背景色的明确原生步骤，因此不能仅凭该示例推断其配置方式。

## API 使用

导入整个模块：

```ts
import * as SystemUI from 'expo-system-ui';
```

### 读取根视图背景色

```ts
const color = await SystemUI.getBackgroundColorAsync();
```

方法签名：

```ts
SystemUI.getBackgroundColorAsync()
```

支持 Android、iOS、tvOS 和 Web。

返回一个 Promise：

- 已设置背景色时，返回十六进制格式的当前颜色。
- 未设置背景色时，返回 `null`。

因此实际使用时需要处理 `null`：

```ts
const color = await SystemUI.getBackgroundColorAsync();

if (color === null) {
  // 当前没有显式设置根视图背景色
}
```

### 修改根视图背景色

```ts
SystemUI.setBackgroundColorAsync('black');
```

方法签名：

```ts
SystemUI.setBackgroundColorAsync(color)
```

支持 Android、iOS、tvOS 和 Web，返回 `Promise<void>`。

`color` 接受 React Native 的 `ColorValue`，文档说明可以使用有效的 CSS 3 / SVG 颜色，例如：

```ts
SystemUI.setBackgroundColorAsync('#000000');
SystemUI.setBackgroundColorAsync('black');
```

原文参数表将类型写作 `ColorValue | null`，但描述只说明了有效颜色，没有进一步解释传入 `null` 的具体效果。因此，不应自行假定 `null` 会恢复默认颜色或清除现有配置。

### 调用位置

原文明确要求在应用的根文件中、组件外部调用：

```ts
import * as SystemUI from 'expo-system-ui';

SystemUI.setBackgroundColorAsync('black');

export default function App() {
  // ...
}
```

这样可以避免组件重新渲染时重复调用，也能让设置尽早生效。

如果业务必须等待调用结果，可以显式处理 Promise：

```ts
void SystemUI.setBackgroundColorAsync('black');
```

> **基于经验建议：**如果项目启用了严格的未处理 Promise 检查，应使用 `void`、`await` 或 `.catch()` 明确处理异步调用。但原文没有规定具体错误处理方式。

## 构建期配置与运行时 API的区别

文档中存在两类能力，不能混为一谈：

| 类型 | 示例 | 生效方式 |
| --- | --- | --- |
| 构建期配置 | `userInterfaceStyle`、config plugin 配置 | 重新构建应用二进制文件 |
| 运行时 API | `setBackgroundColorAsync()` | JavaScript 执行时生效 |

`setBackgroundColorAsync()` 可以在运行时修改根视图背景色，但这并不意味着 app config 中的所有属性也能动态修改。

文档明确指出，config plugin 处理的 Android `userInterfaceStyle` 和 iOS `backgroundColor` 属性不能在运行时设置。

## React Web 开发者容易误解的地方

### 它不是普通组件样式工具

以下代码修改的是 React Native 组件：

```tsx
<View style={{ backgroundColor: 'black' }} />
```

而以下代码修改的是承载 React 界面的系统根视图：

```ts
SystemUI.setBackgroundColorAsync('black');
```

二者作用层级不同，不能互相替代。

### 修改 app.json 不等于修改前端运行时配置

在 Web 项目中，一些配置文件可以被开发服务器实时读取。Expo config plugin 配置最终会进入原生工程，因此修改后需要重新生成或构建原生应用。

### Android 和 iOS 配置并不完全对称

当前文档明确列出的 config plugin 能力是：

- Android：`userInterfaceStyle`
- iOS：`backgroundColor`

不要因为两个平台都支持 JavaScript API，就假定它们的原生静态配置项也完全一致。

### Web 支持不代表行为与浏览器 CSS 完全相同

文档将 Web 列为 API 支持平台，但没有进一步说明它映射到哪个 DOM 元素、是否影响 `<body>`，以及与现有 CSS 的优先级关系。

因此只能确认 API 支持 Web，不能根据当前文档断言其底层 DOM 实现。

## 注意事项与限制

1. 当前页面属于下一个 Expo SDK 版本，而不是稳定版文档。
2. 在已有 React Native 项目中使用前，需要先安装和配置 Expo Modules。
3. config plugin 适用于使用 CNG 或其他 config plugin 工作流的项目。
4. 不使用 CNG 时，需要直接维护 Android 和 iOS 原生配置。
5. 构建期属性修改后必须重新生成并构建应用。
6. `setBackgroundColorAsync()` 应在根文件的组件外部调用。
7. `getBackgroundColorAsync()` 可能返回 `null`。
8. 原文没有说明 API 的异常类型和失败处理方式。
9. 原文没有说明动态切换全局 `userInterfaceStyle` 的运行时 API。
10. 原文没有说明 `setBackgroundColorAsync(null)` 的确切行为。
11. 原文的 iOS 手动配置说明与示例配置项含义不一致。
12. 原文没有涉及状态栏、导航栏、启动屏或应用内部主题系统的配置。

## 实际开发中的使用方式

### 固定应用根背景色

如果应用始终使用深色界面，可以在入口文件尽早设置：

```ts
import * as SystemUI from 'expo-system-ui';

void SystemUI.setBackgroundColorAsync('#000000');
```

这有助于减少 React 内容尚未覆盖屏幕时出现不协调背景的情况。

其中“减少不协调背景”属于**基于文档内容推导**：文档明确说明该 API 修改根视图背景色，但没有具体列举所有视觉场景。

### 固定原生界面样式

如果 Android 应用只允许浅色或深色模式，可以通过 app config 与 config plugin 写入全局样式，并重新构建应用。

如果项目手动维护原生目录，则需要修改 Android 的 `strings.xml`。

### 选择配置方式

可以按项目类型判断：

| 项目情况 | 推荐方式 |
| --- | --- |
| Expo 项目并使用 CNG | app config 加 `expo-system-ui` plugin |
| 已有 React Native 项目并使用 Expo Modules | 根据项目工作流选择 config plugin 或手动配置 |
| 手动维护原生工程 | 修改 Android/iOS 原生文件 |
| 仅需在运行时设置根视图背景色 | 使用 `setBackgroundColorAsync()` |

## 文档明确内容与推导内容

### 文档明确说明

- 库用于操作 React 树之外的系统 UI。
- 可处理根视图背景色。
- 可在 Android 上全局锁定用户界面样式。
- API 支持 Android、iOS、tvOS 和 Web。
- 可以通过 config plugin 配置指定原生属性。
- 这些原生配置不能在运行时设置，需要重新构建应用。
- 不使用 CNG 时需要手动配置原生工程。
- 设置背景色的方法应在根文件的组件外调用。

### 基于文档内容推导

- 根视图背景色与 React 根组件背景色处于不同层级。
- 修改构建期配置后，仅 Fast Refresh 或重新加载 JavaScript 不足以生效。
- 在入口文件尽早设置根背景色，可以降低界面初始化或透明区域暴露默认背景的概率。
- 在组件外调用可以避免因重新渲染而重复执行设置操作。

## 总结

`expo-system-ui` 是一个作用范围较小但层级特殊的 Expo 模块。它不是应用内部的主题或样式系统，而是用于管理 React 组件树之外的根视图和部分原生界面配置。

使用时需要先区分两类操作：

- 根视图背景色可通过异步 API 在运行时读取或修改。
- config plugin 和原生文件中的静态属性需要重新构建应用。

对于 React Web 开发者，最重要的认知是：React Native 应用除了 JavaScript 组件树，还存在 Android 和 iOS 原生工程层。`app.json`、config plugin、`strings.xml` 和 `Info.plist` 都属于这一原生构建链路，而不是普通的 React 运行时状态。

---

## 文档导航

- **上一页**：[symbols](./213__symbols.md)
- **下一页**：[task manager](./215__task-manager.md)
