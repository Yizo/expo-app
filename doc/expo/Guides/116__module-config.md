# expo-module.config.json 配置文件

> **原文地址**：https://docs.expo.dev/modules/module-config/
>
> **适用版本**：Expo SDK 56
>
> **最后更新日期**：2025 年 2 月 10 日

---

## 概述

Expo 模块（Expo Modules）的核心配置文件是 **`expo-module.config.json`**。该文件位于你的模块包根目录下，用于控制两个关键功能：

1. **自动链接（Autolinking）**：告诉 Expo 的自动链接机制该模块支持哪些平台，从而自动将原生代码集成到 Android 和 iOS 构建中。
2. **模块注册（Module Registration）**：声明哪些原生类需要被注册为 Expo 模块，使其在 JavaScript/TypeScript 端可用。

> **关键术语解释（面向初学者）**：
>
> - **Expo 模块**：一个包含原生（平台特定）代码和 JavaScript 接口的包，它允许你在 React Native 应用中调用设备功能（如相机、位置、通知等）。
> - **自动链接（Autolinking）**：Expo 提供的一种机制，可以自动将第三方原生依赖集成到你的项目中，无需手动修改 **build.gradle**（Android）、**Podfile**（iOS）等构建配置文件。你只需通过 `npm install` 安装依赖，再运行 `pod install` 即可。
> - **模块注册**：将 Swift（Apple 平台）或 Kotlin（Android 平台）编写好的原生类"告知"Expo 运行时，使其能够在 JavaScript 端通过 `requireNativeModule` 被调用。

---

## 配置属性一览

`expo-module.config.json` 文件目前支持以下属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `platforms` | 字符串数组 | 声明该模块支持的平台列表 |
| `apple` | 对象 | Apple 平台（iOS/macOS/tvOS）的专属配置 |
| `android` | 对象 | Android 平台的专属配置 |

下面逐一详细说明。

---

## `platforms` — 支持的平台列表

`platforms` 是一个字符串数组，用于声明你的模块所支持的目标平台。自动链接机制会根据此数组来决定是否为某个平台链接该模块。

### 可选值

| 值 | 说明 |
|----|------|
| `"android"` | Android 平台 |
| `"apple"` | 所有 Apple 平台（iOS、macOS、tvOS 的统称） |
| `"ios"` | 仅 iOS 平台（`"apple"` 的细粒度替代） |
| `"macos"` | 仅 macOS 平台（`"apple"` 的细粒度替代） |
| `"tvos"` | 仅 tvOS 平台（`"apple"` 的细粒度替代） |
| `"web"` | Web 平台 |
| `"devtools"` | 开发者工具插件平台（详见 [创建开发者工具插件](https://docs.expo.dev/debugging/create-devtools-plugins/)） |

> **注意**：你可以使用 `"apple"` 作为所有 Apple 平台的统称，也可以使用更细粒度的 `"ios"`、`"macos"`、`"tvos"` 来精确指定目标平台。如果你的模块同时支持 iOS 和 macOS，使用 `"apple"` 更为简洁。

### 示例

**同时支持 Apple 和 Android 平台：**

```json
{
  "platforms": ["apple", "android"]
}
```

**支持 Apple、Android 和 Web 平台：**

```json
{
  "platforms": ["apple", "android", "web"]
}
```

**仅支持 Apple 平台（例如 Apple 身份认证模块）：**

```json
{
  "platforms": ["apple"]
}
```

> **基于文档内容推导**：如果你的模块仅支持 Apple 平台（如 Apple 登录、Apple 支付等 Apple 独有功能），你只需在 `platforms` 中写入 `"apple"`，无需再配置 `android` 字段。

---

## `apple` — Apple 平台配置

`apple` 对象包含 Apple 平台（iOS / macOS / tvOS）特有的配置选项。

### `apple.modules`

- **类型**：字符串数组
- **说明**：需要注册到自动生成的模块提供者文件（modules provider file）中的 **Swift 原生模块类名列表**。

当自动链接机制运行时，它会读取这个列表，并在构建时自动生成 Swift 代码来注册这些模块。这意味着你**不需要手动**在 Swift 代码中注册模块。

> **关键术语解释**：
>
> - **模块提供者文件（Modules Provider File）**：由 Expo 自动链接自动生成的一个 Swift 文件，它包含所有需要注册的模块类。开发者无需手动维护此文件。
> - **Swift 类名**：这里填写的是 Swift 代码中定义的类名（不含模块前缀），例如 `"CameraViewModule"` 而非 `"ExpoCamera.CameraViewModule"`。

### `apple.appDelegateSubscribers`

- **类型**：字符串数组
- **说明**：需要接收 `ExpoAppDelegate` 生命周期事件的 **Swift 类名列表**。这些类会"订阅"AppDelegate 的生命周期回调（如应用启动、进入后台、收到推送通知等）。

> **关键术语解释**：
>
> - **AppDelegate**：iOS 应用的核心委托类，负责处理应用的生命周期事件（如启动、暂停、终止等）。
> - **ExpoAppDelegate**：Expo 框架对 AppDelegate 的封装。通过 `appDelegateSubscribers`，你的模块可以"监听"这些生命周期事件并做出响应，而无需修改应用的 AppDelegate 代码。
> - **生命周期事件**：应用在运行过程中经历的状态变化，例如从后台切换到前台、收到远程推送通知等。

### 示例

**基本用法——注册单个模块：**

```json
{
  "platforms": ["apple", "android"],
  "apple": {
    "modules": ["LocationModule"]
  }
}
```

**注册多个模块并添加 AppDelegate 订阅者：**

以 `expo-notifications`（通知模块）为例，它注册了大量模块和一个 AppDelegate 订阅者来处理推送通知等生命周期事件：

```json
{
  "platforms": ["apple", "android"],
  "apple": {
    "modules": [
      "BackgroundModule",
      "BadgeModule",
      "CategoriesModule",
      "EmitterModule",
      "HandlerModule",
      "PermissionsModule",
      "PresentationModule",
      "PushTokenModule",
      "SchedulerModule",
      "ServerRegistrationModule"
    ],
    "appDelegateSubscribers": ["NotificationsAppDelegateSubscriber"]
  },
  "android": {
    "modules": [
      "expo.modules.notifications.badge.BadgeModule",
      "expo.modules.notifications.notifications.background.ExpoBackgroundNotificationTasksModule",
      "expo.modules.notifications.notifications.categories.ExpoNotificationCategoriesModule",
      "expo.modules.notifications.notifications.channels.NotificationChannelGroupManagerModule",
      "expo.modules.notifications.notifications.channels.NotificationChannelManagerModule",
      "expo.modules.notifications.notifications.emitting.NotificationsEmitter",
      "expo.modules.notifications.notifications.handling.NotificationsHandler",
      "expo.modules.notifications.permissions.NotificationPermissionsModule",
      "expo.modules.notifications.notifications.presentation.ExpoNotificationPresentationModule",
      "expo.modules.notifications.notifications.scheduling.NotificationScheduler",
      "expo.modules.notifications.serverregistration.ServerRegistrationModule",
      "expo.modules.notifications.tokens.PushTokenModule",
      "expo.modules.notifications.topics.TopicSubscriptionModule",
      "expo.modules.notifications.notifications.channels.AndroidXNotificationsChannelsProvider"
    ]
  }
}
```

> **基于文档内容推导**：注意 Apple 端的 `modules` 只填写 Swift 类名（如 `"BadgeModule"`），而 Android 端需要填写完整的包名+类名（如 `"expo.modules.notifications.badge.BadgeModule"`）。这是因为两种平台的模块发现和注册机制不同。

---

## `android` — Android 平台配置

`android` 对象包含 Android 平台特有的配置选项。

### `android.modules`

- **类型**：字符串数组
- **说明**：需要注册到自动生成的包提供者文件（package provider file）中的 **Kotlin 原生模块类的完整名称列表**（包含包名 + 类名）。

> **关键术语解释**：
>
> - **完整类名（Full Qualified Name）**：由 Java/Kotlin 包名和类名组成的完整路径，例如 `expo.modules.camera.CameraViewModule`，其中 `expo.modules.camera` 是包名，`CameraViewModule` 是类名。
> - **包提供者文件（Package Provider File）**：由 Expo 自动链接自动生成的一个 Kotlin 文件，包含所有需要注册的模块类信息。

### 示例

**注册单个 Android 模块：**

```json
{
  "platforms": ["apple", "android"],
  "android": {
    "modules": ["expo.modules.location.LocationModule"]
  }
}
```

**注册多个 Android 模块（相机模块示例）：**

```json
{
  "platforms": ["apple", "android", "web"],
  "apple": {
    "modules": ["CameraViewModule"]
  },
  "android": {
    "modules": ["expo.modules.camera.CameraViewModule"]
  }
}
```

---

## 完整配置示例

以下展示几种典型的配置模式：

### 最小配置——仅声明平台（无原生模块注册）

适用于纯 JavaScript/TypeScript 模块，或者模块的原生注册由其他方式处理：

```json
{
  "platforms": ["apple", "android"]
}
```

> **基于经验建议**：如果你的模块暂时还没有原生代码（纯 JS 工具库），或者你使用的是 `expo-dev-client` 这种架构模式，这种最小配置就足够了。

### 标准配置——跨平台模块

最常见的配置模式，同时支持 Apple 和 Android：

```json
{
  "platforms": ["apple", "android"],
  "apple": {
    "modules": ["HapticsModule"]
  },
  "android": {
    "modules": ["expo.modules.haptics.HapticsModule"]
  }
}
```

### 全平台配置——含 Web 支持

```json
{
  "platforms": ["apple", "android", "web"],
  "apple": {
    "modules": ["CameraViewModule"]
  },
  "android": {
    "modules": ["expo.modules.camera.CameraViewModule"]
  }
}
```

### 含 AppDelegate 订阅者的复杂配置

适用于需要监听应用生命周期事件的模块（如推送通知）：

```json
{
  "platforms": ["apple", "android"],
  "apple": {
    "modules": [
      "NotificationModule",
      "PushTokenModule"
    ],
    "appDelegateSubscribers": ["NotificationsAppDelegateSubscriber"]
  },
  "android": {
    "modules": [
      "expo.modules.notifications.NotificationModule",
      "expo.modules.notifications.PushTokenModule"
    ]
  }
}
```

---

## 自动链接与配置文件的关系

`expo-module.config.json` 是 Expo 自动链接机制的核心输入之一。当你运行 `npx expo install` 或 `pod install` 时，自动链接 CLI 工具会：

1. 扫描所有依赖包中的 `expo-module.config.json` 文件
2. 根据 `platforms` 字段判断该依赖是否支持当前构建平台
3. 读取 `apple.modules` 或 `android.modules` 列表，生成对应的模块注册代码
4. 如果存在 `apple.appDelegateSubscribers`，还会将其集成到 AppDelegate 的生命周期链中

> **基于文档内容推导**：自动链接的模块解析会在四个步骤中搜索候选依赖：首先检查 **react-native.config.js** 中的显式路径、然后搜索配置的 `searchPaths`、接着搜索本地模块目录（默认 `./modules/`）、最后递归解析 `node_modules` 中的依赖。`expo-module.config.json` 是判断一个包是否为 Expo 模块的关键标志文件。

---

## 注意事项与限制

1. **文件名固定**：配置文件必须命名为 `expo-module.config.json`（注意大小写和拼写），且位于模块包的根目录下。

2. **Apple 端类名 vs Android 端完整类名**：
   - Apple 配置中 `modules` 只需填写 Swift 类名（例如 `"LocationModule"`）
   - Android 配置中 `modules` 必须填写完整类名（例如 `"expo.modules.location.LocationModule"`）

3. **`platforms` 决定链接行为**：如果你的模块声明了 `"android"` 但未提供 `android.modules`，自动链接仍会尝试将该模块作为 Android 依赖处理，但不会注册任何原生模块类。

4. **`"apple"` 与 `"ios"` / `"macos"` / `"tvos"` 的关系**：使用 `"apple"` 等同于同时支持所有 Apple 子平台。如果你只需要支持 iOS，建议使用 `"ios"` 以获得更精确的平台控制。

5. **配置文件变更需重新构建**：修改 `expo-module.config.json` 后，通常需要重新运行 `pod install`（iOS）和/或重新构建 Android 项目，以使变更生效。

6. **DevTools 平台**：`"devtools"` 是一个特殊平台值，用于创建 Expo 开发者工具的插件。详见官方文档 [创建开发者工具插件](https://docs.expo.dev/debugging/create-devtools-plugins/)。

> **基于经验建议**：在开发过程中，每次修改 `expo-module.config.json` 后，建议执行以下操作以确保变更生效：
>
> ```bash
> # iOS 端
> cd ios && pod install && cd ..
>
> # Android 端（通常 Gradle 会自动检测变更，但如有问题可执行）
> cd android && ./gradlew clean && cd ..
>
> # 然后重新运行应用
> npx expo run:ios
> npx expo run:android
> ```

---

## 相关文档

- **[自动链接（Autolinking）](https://docs.expo.dev/modules/autolinking/)**：深入了解自动链接的工作原理和高级配置选项
- **[共享对象（Shared Objects）](https://docs.expo.dev/modules/shared-objects/)**：学习如何使用共享对象在 JavaScript 和原生代码之间共享长生命周期的原生实例
- **[模拟原生调用（Mocking）](https://docs.expo.dev/modules/mocking/)**：了解如何在单元测试中模拟 Expo 模块的原生调用
- **[创建开发者工具插件](https://docs.expo.dev/debugging/create-devtools-plugins/)**：了解如何使用 `"devtools"` 平台创建 Expo 开发者工具插件
- **[设计考量（Design）](https://docs.expo.dev/modules/design/)**：Expo 模块的 API 设计原则和最佳实践

---

## 文档导航

- **上一页**：[shared objects](./115__shared-objects.md)
- **下一页**：[mocking](./117__mocking.md)
