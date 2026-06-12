# Expo Brownfield：在现有原生应用中集成 Expo 与 React Native

> 本文对应 Expo 下一版本 SDK 的未发布文档。原文提示：如需当前稳定版本，请查看 SDK 56 对应的最新文档。

## 文档解决的问题

`expo-brownfield` 用于将 React Native 页面嵌入已经存在的 Android 或 iOS 原生应用。

这种开发方式称为 **Brownfield（棕地开发）**：不是从零创建一个完整的 React Native 应用，而是在已有原生项目中逐步引入 React Native。

它主要提供三类能力：

1. **运行时 API**：在原生应用与 React Native 之间发送消息、共享状态和控制返回导航。
2. **Config Plugin**：自动配置用于 Brownfield 集成的 iOS Target 和 Android Library。
3. **CLI**：构建可交付给原生工程的 Android Maven 产物或 iOS XCFramework。

支持平台仅包括：

- Android
- iOS

当前文档未涉及 Web 平台，也未说明如何在 Web 环境中使用该库。

## 适用场景

这套工具适合以下情况：

- 已有一个 Android 或 iOS 原生应用，希望逐步使用 React Native 开发部分页面。
- React Native 页面需要与宿主原生应用双向通信。
- React Native 页面需要读取或修改双方共享的状态。
- React Native 页面完成操作后，需要关闭并返回原生页面。
- React Native 代码需要被打包成原生工程可以依赖的库，而不是独立安装的完整应用。

**基于文档内容推导：** 典型应用方式是由 React Native/Expo 项目负责实现一个或多个业务模块，再将构建产物交给已有原生应用集成。这与直接通过 Expo 创建并发布完整移动应用不同。

## React Web 开发者需要先理解的背景

### 宿主原生应用

这里的“宿主”是已经存在的 Android 或 iOS 应用。它负责启动应用、管理原生页面，并在需要时展示 React Native 页面。

可以将其类比为 Web 应用中的外层容器，但移动端的集成边界不是普通组件边界，而是跨越了：

- JavaScript/TypeScript 代码
- Android Kotlin/Java 代码
- iOS Swift/Objective-C 代码
- 原生构建系统及产物管理

### Brownfield 与普通 Expo 应用

普通 Expo/React Native 项目通常以整个移动应用为交付单位。Brownfield 项目则需要生成能被已有原生应用使用的原生库：

| 平台 | 交付形式 |
| --- | --- |
| Android | 发布到 Maven 仓库的 Android Library 及其依赖 |
| iOS | XCFramework，或者可选的 Swift Package |

### Maven 仓库

Maven 仓库是 Android/Gradle 生态中存储和分发依赖包的位置。其作用与 npm registry 类似，但服务于 Android/JVM 依赖。

一个 Maven 依赖通常通过以下信息标识：

- `group`：组织或命名空间
- 库名称
- `version`：版本号

### XCFramework

XCFramework 是 Apple 平台用于分发二进制框架的格式，可以包含面向不同设备和架构的构建结果。

对 Web 开发者而言，可以将它粗略理解为“供 iOS 原生工程链接的已编译依赖”，但它不是 npm 包，也不能直接被 JavaScript 导入。

### CNG 与 Config Plugin

**Continuous Native Generation（CNG）** 是 Expo 根据应用配置生成和维护原生工程的工作流。

Config Plugin 会在生成原生工程时修改 Android 或 iOS 配置。它类似于构建期插件，而不是 React 运行时插件：

- 不负责渲染组件。
- 不在浏览器或 JavaScript 运行时执行。
- 负责改变原生工程结构及构建配置。

### Xcode Target 与 Scheme

- **Target**：Xcode 中一个独立的构建目标，定义要构建什么产物以及使用哪些源码和配置。
- **Scheme**：指定要构建的 Target、构建模式及运行方式。

`expo-brownfield` 会为 React Native 代码建立单独的 Brownfield Target。

## 安装

根据所用包管理器执行对应命令：

```sh
# npm
npx expo install expo-brownfield

# yarn
yarn expo install expo-brownfield

# pnpm
pnpm expo install expo-brownfield

# bun
bun expo install expo-brownfield
```

这里使用 `expo install` 而不是直接使用包管理器的普通安装命令。它会根据当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的裸 React Native 项目中安装，还必须先安装并配置 `expo`，从而让该项目能够使用 Expo Modules。

## 原生与 React Native 双向通信

Communication API 使用基于消息的方式连接宿主原生应用与 React Native。

消息是 `Record<string, any>` 类型，即由字符串键和任意值组成的普通对象。库本身没有要求固定的业务消息结构。

### React Native 向原生发送消息

```ts
import * as Brownfield from 'expo-brownfield';

Brownfield.sendMessage({
  type: 'MyMessage',
  data: {
    language: 'TypeScript',
    expo: true,
    platforms: ['android', 'ios'],
  },
});
```

原生端需要注册监听器才能接收该消息。

**基于文档内容推导：** `type` 和 `data` 是示例中的业务约定，不是文档声明的强制字段。实际项目应由原生和 React Native 团队共同定义消息协议。

### React Native 接收原生消息

```ts
import * as Brownfield, { type MessageEvent } from 'expo-brownfield';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event);
    };

    Brownfield.addMessageListener(handleMessage);

    return () => {
      Brownfield.removeMessageListener(handleMessage);
    };
  }, []);

  // ...
}
```

这里的使用方式类似 React Web 中订阅 `window` 事件：

1. 组件挂载后注册监听器。
2. 原生端发送消息时执行回调。
3. 组件卸载时移除监听器。

清理监听器非常重要，否则重新挂载组件后可能出现重复回调或无效订阅残留。

### Android 向 React Native 发送消息

宿主 Android 工程使用 Kotlin API：

```kotlin
import expo.modules.brownfield.BrownfieldMessaging

BrownfieldMessaging.sendMessage(mapOf(
    "type" to "MyAndroidMessage",
    "timestamp" to System.currentTimeMillis(),
    "data" to mapOf(
        "platform" to "android"
    )
))
```

Kotlin 的 `mapOf(...)` 在这里承担了类似 JavaScript 对象字面量的作用。

### Android 接收 React Native 消息

```kotlin
import expo.modules.brownfield.BrownfieldMessaging

val listenerId = BrownfieldMessaging.addListener { event ->
    println("Message from React Native: $event")
}

// 不再需要时移除监听器
BrownfieldMessaging.removeListener(listenerId)
```

Android API 返回 `listenerId`，移除监听器时需要使用这个 ID。

原文只给出了 Android 端通信示例，没有提供对应的 iOS Swift/Objective-C 示例。

## 共享状态

除一次性消息外，`expo-brownfield` 还提供按字符串键保存和监听状态的能力。

### 使用 `useSharedState`

```ts
const [value, setValue] = useSharedState(key, initialValue);
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 共享状态的键 |
| `initialValue` | `T`，可选 | 尚未设置共享值时使用的初始值 |

返回值：

```ts
[
  T | undefined,
  (value: T | ((prev: T | undefined) => T)) => void
]
```

它的使用体验与 React 的 `useState` 接近：

- 第一个值是当前共享状态。
- 第二个值是更新函数。
- 更新函数既可接收新值，也可接收基于旧值计算新值的函数。

主要区别在于，`useState` 管理组件内部状态，而 `useSharedState` 观察的是由指定 `key` 标识的共享状态。

### 直接读写共享状态

```ts
Brownfield.getSharedStateValue(key);
Brownfield.setSharedStateValue(key, value);
Brownfield.deleteSharedState(key);
```

对应作用：

| API | 作用 |
| --- | --- |
| `getSharedStateValue` | 同步读取指定键的值；不存在时返回 `undefined` |
| `setSharedStateValue` | 设置指定键的值 |
| `deleteSharedState` | 删除指定键对应的状态 |

### 监听共享状态变化

```ts
const subscription = Brownfield.addSharedStateListener(
  'user',
  (event) => {
    console.log(event);
  }
);

// 不再需要时
subscription.remove();
```

回调参数类型为：

```ts
SharedStateChangeEvent<T> | undefined
```

原文没有进一步列出 `SharedStateChangeEvent` 的字段结构，因此不能仅根据本文确定事件对象中有哪些属性。

### 何时使用消息，何时使用共享状态

**基于文档内容推导：**

- “用户点击了提交按钮”这类一次性动作更适合消息。
- “当前登录用户”“主题设置”等需要持续读取和观察的数据更适合共享状态。

文档没有定义消息可靠性、消息缓存、共享状态持久化、进程重启行为或并发更新策略。不能假定它们具备网络消息队列或持久化数据库的能力。

## 返回原生页面与返回键处理

### 关闭 React Native 页面

```ts
Brownfield.popToNative(animated);
```

该方法关闭当前 React Native View，并返回应用的原生部分。

- `animated` 可选，默认是 `false`。
- 动画选项仅对 iOS 生效。

### 控制原生返回行为

```ts
Brownfield.setNativeBackEnabled(enabled);
```

启用后，用户按下返回按钮时会返回原生应用，而不是执行默认的 React Navigation 返回操作。

这意味着 Brownfield 环境中可能同时存在两套导航层级：

1. React Native 内部由 React Navigation 管理的页面栈。
2. 宿主原生应用管理的原生页面栈。

**基于文档内容推导：** 开发时需要明确某次“返回”究竟应返回 React Native 内部上一页，还是直接退出整个 React Native 模块。错误配置可能让用户提前离开 React Native 流程。

原文没有说明：

- `setNativeBackEnabled` 应在哪个生命周期调用。
- Android 与 iOS 返回手势的具体差异。
- 它与不同 React Navigation 版本的详细交互方式。

## Config Plugin 配置

使用 CNG 时，可以在应用配置中加入 `expo-brownfield` 插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-brownfield",
        {
          "ios": {
            "targetName": "MyBrownfieldTarget",
            "bundleIdentifier": "com.example.brownfield"
          },
          "android": {
            "group": "com.example",
            "libraryName": "brownfield",
            "package": "com.example.brownfield",
            "version": "1.0.0"
          }
        }
      ]
    ]
  }
}
```

这段配置决定 Expo 项目如何被打包，以及生成的内容如何被已有原生应用集成。

### iOS 配置

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `ios.targetName` | `"<scheme>brownfield"` 或 `"<slug>brownfield"` | Brownfield Xcode Target 名称 |
| `ios.bundleIdentifier` | `"<ios.bundleIdentifier base>.<targetName>"` 或 `"com.example.<targetName>"` | Brownfield Target 的 Bundle Identifier |
| `ios.buildReactNativeFromSource` | `false` | 是否从源码构建 React Native，而不是使用预构建 Framework |

`ios.bundleIdentifier` 必须：

- 唯一；
- 与主应用的 Bundle Identifier 不同。

启用 `ios.buildReactNativeFromSource` 会显著增加构建时间。原文没有说明应该在哪些具体情况下开启，因此不应默认启用。

### Android 配置

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `android.group` | Android 包名去掉最后一段 | 生成库的 Maven Group ID |
| `android.libraryName` | `"brownfield"` | 生成的 Android Library 模块名称 |
| `android.package` | `"<android.package>.brownfield"` 或 `"com.example.brownfield"` | 生成的 Java/Kotlin 代码包名 |
| `android.version` | `"1.0.0"` | 发布到 Maven 仓库时使用的库版本 |
| `android.publishing` | `[{ "type": "localMaven" }]` | 配置库发布到何处以及如何发布 |

`android.publishing` 支持以下发布类型：

- `localMaven`
- `localDirectory`
- `remotePublic`
- `remotePrivate`

原文未列出每种类型的完整配置结构，只说明不同类型具有各自的位置和发布方式选项。实际配置这些类型时需要继续查阅对应文档或类型定义，不能根据本文自行猜测字段。

## CLI：构建和发布原生产物

CLI 的通用调用格式为：

```sh
npx expo-brownfield [command] [options]
```

### 构建 Android 产物

```sh
npx expo-brownfield build:android [options]
```

该命令构建 Brownfield Android Library 及其依赖，并将它们发布到 Maven 仓库。

| 选项 | 作用 |
| --- | --- |
| `-d, --debug` | 仅构建 Debug 版本 |
| `-r, --release` | 仅构建 Release 版本 |
| `-a, --all` | 同时构建 Debug 和 Release，默认行为 |
| `-l, --library` | 指定 Brownfield Library 名称 |
| `--repo, --repository` | 指定发布目标 Maven 仓库 |
| `-t, --task` | 指定需要运行的 Gradle Publish Task |
| `--verbose` | 输出子进程的全部日志 |

Debug 通常用于开发调试，Release 用于正式交付。本文没有进一步说明两种产物在运行行为或优化配置上的区别。

### 查看 Android 发布任务

```sh
npx expo-brownfield tasks:android
```

该命令列出：

- 当前可用的 Gradle 发布任务；
- 当前可用的 Maven 仓库。

当不确定 `build:android` 的 `--task` 或 `--repository` 参数可使用哪些值时，可以先运行该命令。

### 构建 iOS 产物

```sh
npx expo-brownfield build:ios [options]
```

该命令：

1. 构建 Brownfield XCFramework。
2. 将 Hermes XCFramework 复制到产物目录。

Hermes 是 React Native 使用的 JavaScript 引擎。对 React Web 开发者而言，它承担的角色类似浏览器中的 JavaScript 引擎，但运行于移动应用内部。

| 选项 | 作用 |
| --- | --- |
| `-d, --debug` | 构建 Debug 版本 |
| `-r, --release` | 构建 Release 版本，默认行为 |
| `-a, --artifacts` | 指定产物目录，默认为 `./artifacts` |
| `-s, --scheme` | 指定要构建的 Xcode Scheme |
| `-x, --xcworkspace` | 指定 Xcode Workspace 路径 |
| `-p, --package` | 将产物打包为 Swift Package，可选指定名称 |
| `--verbose` | 输出子进程的全部日志 |

需要注意，Android 的 `-a` 表示 `--all`，而 iOS 的 `-a` 表示 `--artifacts`，两个命令中的同一短选项含义不同。

## API 参考

统一导入方式：

```ts
import * as Brownfield from 'expo-brownfield';
```

### 消息相关 API

| API | 返回值 | 说明 |
| --- | --- | --- |
| `sendMessage(message)` | `void` | 向原生端发送对象消息 |
| `addMessageListener(listener)` | `EventSubscription` | 监听原生端发来的消息 |
| `removeMessageListener(listener)` | `void` | 移除指定消息监听函数 |
| `removeAllMessageListeners()` | `void` | 移除全部消息监听器 |
| `getMessageListenerCount()` | `number` | 获取当前注册的消息监听器数量 |

`addMessageListener` 返回订阅对象，因此可以采用另一种清理方式：

```ts
const subscription = Brownfield.addMessageListener((event) => {
  console.log('Received message from native:', event);
});

subscription.remove();
```

两种单个监听器清理方式分别是：

```ts
Brownfield.removeMessageListener(listener);
```

以及：

```ts
subscription.remove();
```

使用 `removeMessageListener` 时，必须传入注册时的同一个函数引用。使用订阅对象可以避免手动保存和匹配函数引用。

`MessageEvent` 在该库中的类型定义为：

```ts
Record<string, any>
```

虽然文档链接到了 Web API 的 `MessageEvent`，但这里明确列出的类型是普通字典对象。不要直接假定它一定具有浏览器 `MessageEvent` 的 `origin`、`source` 或 `ports` 等字段。

### `EventSubscription`

`EventSubscription` 表示一次事件订阅，提供：

```ts
subscription.remove();
```

调用后，对应监听器不再接收事件。

### 导航与返回行为

| API | 返回值 | 说明 |
| --- | --- | --- |
| `popToNative(animated?)` | `void` | 关闭 React Native View 并返回原生部分 |
| `setNativeBackEnabled(enabled)` | `void` | 控制返回按钮是否直接返回原生部分 |

### 共享状态

| API | 返回值 | 说明 |
| --- | --- | --- |
| `useSharedState(key, initialValue?)` | 状态与更新函数组成的元组 | 以 React Hook 方式观察和更新状态 |
| `getSharedStateValue(key)` | `T \| undefined` | 同步读取状态 |
| `setSharedStateValue(key, value)` | `void` | 设置状态 |
| `deleteSharedState(key)` | `void` | 删除状态 |
| `addSharedStateListener(key, callback)` | `EventSubscription` | 监听指定键的状态变化 |

## 关键限制与容易踩坑的地方

### 文档面向下一版本 SDK

该页面是未发布的下一版本 SDK 文档，而不是当前稳定 SDK 56 文档。API、配置或行为在正式发布前可能发生变化。

### 不能只安装 npm 包就完成集成

`expo-brownfield` 涉及原生 Target、Android Library、Maven、XCFramework 和宿主应用代码。安装 JavaScript 依赖只是第一步，不等于原生应用已经能够展示 React Native 页面。

### 双方必须约定消息协议

消息载荷类型为 `Record<string, any>`，没有静态约束。字段名、消息类型和数据结构不一致时，TypeScript 无法替原生端兜底。

**基于经验建议：** 在双方代码中定义明确的消息名称、字段结构和版本策略，并在运行时校验来自另一端的数据。

### 监听器需要及时清理

React 组件重复挂载但未清理监听器，可能导致同一条原生消息触发多次回调。优先保存 `EventSubscription` 并在 `useEffect` 清理函数中调用 `remove()`。

不要随意使用 `removeAllMessageListeners()` 清理单个组件的订阅，因为它会影响其他模块注册的监听器。

### `any` 不代表所有值都一定可以跨端传输

API 类型允许 `Record<string, any>`，但原文没有说明函数、类实例、循环引用对象等值的跨端转换能力。

**基于经验建议：** 消息和共享状态应使用容易序列化的基础数据结构，例如字符串、数字、布尔值、数组、普通对象和 `null`。

### iOS Bundle Identifier 不能与主应用重复

Brownfield Target 必须拥有独立且唯一的 Bundle Identifier。直接复用主应用标识不符合文档要求。

### iOS 源码构建成本较高

`ios.buildReactNativeFromSource` 默认为 `false`。开启后会显著延长构建时间，因此应在有明确需求时使用。

### Android 发布坐标会影响宿主工程依赖

`group`、`libraryName` 和 `version` 共同影响原生工程如何定位构建产物。修改这些配置后，宿主 Android 工程的依赖声明也可能需要同步更新。

此结论属于**基于文档内容推导**。

### 返回操作跨越两套餐导航

React Navigation 的返回与宿主原生导航的返回不是同一件事。开启原生返回处理后，返回按钮会离开 React Native，而不是默认返回 React Native 内部上一页。

### 当前文档没有完整覆盖宿主集成步骤

本文重点说明工具能力、配置、构建命令和 API，但没有完整展示：

- Android 宿主工程如何声明 Maven 依赖并展示 React Native View。
- iOS 宿主工程如何引入 XCFramework 或 Swift Package。
- iOS 原生端如何收发 Brownfield 消息。
- 原生应用如何初始化 React Native 运行环境。
- 远程 Maven 发布配置的完整字段。
- 产物签名、发布认证和 CI 配置。
- 错误处理、线程模型及状态持久化规则。

这些内容不能仅凭本文补全。

## 实际开发中的使用方式

**基于文档内容推导：** 一套合理的接入流程如下：

1. 在 Expo 或已有 React Native 项目中安装 `expo-brownfield`。
2. 如果是未启用 Expo Modules 的裸 React Native 项目，先安装并配置 `expo`。
3. 在 `app.json` 等应用配置中加入 Config Plugin。
4. 为 iOS 配置独立 Target 和 Bundle Identifier。
5. 为 Android 配置 Maven Group、库名、包名、版本及发布位置。
6. 使用消息 API 或共享状态设计 React Native 与原生之间的数据交互。
7. 明确 React Native 内部返回和退出到原生页面的行为。
8. 使用 `build:android` 或 `build:ios` 生成原生交付产物。
9. 在宿主原生工程中接入 Maven Library 或 XCFramework。
10. 分别验证 Debug、Release、事件清理、重复进入页面和返回导航等场景。

其中第 9 步的具体操作未在当前文档中展开，需要结合宿主 Android/iOS 工程的集成文档完成。

## 明确信息与推导信息的边界

### 文档明确说明

- `expo-brownfield` 用于向现有 Android/iOS 原生应用添加 React Native View。
- 它提供双向消息通信、Config Plugin 和构建发布 CLI。
- Android 产物发布到 Maven 仓库。
- iOS 构建 XCFramework，并复制 Hermes XCFramework。
- API 支持共享状态、消息订阅及返回原生页面。
- iOS Brownfield Target 的 Bundle Identifier 应与主应用不同。
- 从源码构建 React Native 会显著增加 iOS 构建时间。
- 开启原生返回行为后，返回按钮不再执行默认的 React Navigation 返回。
- 该页面面向下一版本 SDK，当前稳定文档为 SDK 56。

### 基于文档内容推导

- Brownfield 适合渐进式迁移已有原生应用。
- Android 的 Maven 坐标变化需要与宿主依赖声明同步。
- 项目需要明确区分 React Native 导航栈和原生导航栈。
- 一次性动作适合消息，持续性数据适合共享状态。
- 原生与 React Native 团队应共同维护消息协议。
- 构建产物通常需要作为版本化依赖交付给宿主工程。

## 总结

`expo-brownfield` 解决的核心问题不是“如何创建一个 Expo 应用”，而是“如何把 Expo/React Native 模块嵌入已经存在的原生应用”。

从 React Web 开发者的角度，最重要的变化是：开发边界不再局限于 React 组件和 npm 包，还包括原生工程配置、二进制产物、依赖仓库以及跨运行时通信。

掌握本文内容后，应能够理解：

- Brownfield 集成的目标和基本交付形式；
- 原生端与 React Native 端如何双向发送消息；
- 如何共享、读取和监听状态；
- 如何从 React Native 返回原生页面；
- Config Plugin 中 Android 与 iOS 配置的作用；
- 如何通过 CLI 构建 Maven Library 和 XCFramework；
- 当前文档尚未覆盖哪些宿主工程集成细节。

---

## 文档导航

- **上一页**：[brightness](./151__brightness.md)
- **下一页**：[build properties](./153__build-properties.md)
