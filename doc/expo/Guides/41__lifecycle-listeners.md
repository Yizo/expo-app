# 配置生命周期监听器（Configuring Lifecycle Listeners）

> 原文地址：https://docs.expo.dev/brownfield/lifecycle-listeners/

## 概述

部分 Expo 库需要处理系统级事件，例如**深度链接（Deep Links）**、**推送通知（Push Notifications）**和**配置变更（Configuration Changes）**。这些库通过实现 `Activity`/`Application` 或 `AppDelegate` 的生命周期回调方法来响应这些事件。

**关键术语解释：**

- **生命周期（Lifecycle）**：应用或界面组件从创建、运行到销毁的完整过程。操作系统会在不同阶段触发不同的回调方法，例如应用启动时、配置变更时、收到外部事件时等。
- **生命周期监听器（Lifecycle Listener）**：一种设计模式，允许外部代码"订阅"生命周期事件，在特定事件发生时自动执行预定义的逻辑。类似于"事件监听器"——你告诉系统"当 X 发生时，请执行 Y"。
- **深度链接（Deep Link）**：一种通过 URL 直接打开应用内特定页面的技术。例如，点击 `myapp://product/123` 可以直接打开应用中的商品详情页面，而不是仅仅打开应用首页。
- **推送通知（Push Notification）**：由服务器端发起、通过操作系统推送服务发送到用户设备的消息通知，即使应用未在前台运行也能送达。
- **回调方法（Callback Method）**：由操作系统或框架在特定时机自动调用的方法。开发者在这些方法中编写响应逻辑。
- **棕地应用（Brownfield App）**：已经存在的原生应用，正在逐步引入 Expo/React Native 功能。

Expo Modules API 提供了一套便捷的机制来管理这些回调：

- **Android 平台**：`ApplicationLifecycleDispatcher` 和 `ReactActivityHandler` 会将 `Application` 和 `Activity` 的生命周期事件转发给已注册的监听器。模块可以通过 `Package` 类提供 `ReactActivityLifecycleListener` 和 `ApplicationLifecycleListener` 的实现来注册回调。
- **iOS 平台**：`ExpoAppDelegate` 会将 `AppDelegate` 的调用转发给已注册的订阅者。模块可以提供 `ExpoAppDelegateSubscriber` 的实现来注册回调。

**关键术语解释：**

- **`ApplicationLifecycleDispatcher`**：Expo 提供的 Android 端工具类，负责将 Android `Application` 类的生命周期事件（如应用创建、配置变更）分发给所有已注册的 Expo 模块。
- **`ReactActivityHandler`**：Expo 提供的 Android 端工具类，负责将 `Activity`（界面组件）的生命周期事件转发给相关模块。
- **`Package` 类**：Expo 模块系统的核心概念。每个 Expo 模块都通过一个 `Package` 类来向应用注册自身，包括它需要的生命周期监听器。
- **`ExpoAppDelegate`**：Expo 提供的 iOS 端基类，替代标准的 `UIApplicationDelegate`，自动将代理方法调用转发给所有已注册的 Expo 模块。
- **`ExpoAppDelegateSubscriber`**：iOS 端的订阅者协议/类，Expo 模块通过实现此协议来接收 `AppDelegate` 的事件通知。
- **Delegate（委托）**：iOS 开发中的核心设计模式。一个对象将某些职责委托给另一个对象来处理。`AppDelegate` 就是应用将启动、进入后台、收到通知等事件的处理职责委托给的对象。

使用这些机制的好处是：模块可以自行注册所需的行为，而不需要你反复修改原生的入口文件（如 `MainApplication.kt` 或 `AppDelegate.swift`）。

> **基于文档内容推导**：生命周期监听器机制是 Expo 模块系统的关键基础设施之一。它解决了棕地应用集成中的一个核心矛盾——Expo 模块需要响应系统事件，但棕地应用的原生入口文件由开发者自行管理，无法像托管工作流（Managed Workflow）那样自动注入代码。通过"转发"模式，开发者只需做一次性配置，之后所有 Expo 模块都能自动工作。

## 配置原生项目

### Android

要在 Android 端集成 `Application` 生命周期监听器，需要将 `onCreate()` 和 `onConfigurationChanged()` 的调用从你的 `Application` 类转发给 `ApplicationLifecycleDispatcher`。

**关键术语解释：**

- **`Application` 类**：Android 应用的入口类，在整个应用进程创建时被系统调用。每个 Android 应用有且仅有一个 `Application` 实例。它通常用于进行全局初始化工作。
- **`onCreate()`**：`Application` 类中最早被调用的生命周期方法，在应用进程启动时执行。通常在这里进行全局初始化，如初始化数据库、配置日志系统等。
- **`onConfigurationChanged()`**：当设备配置发生变更时被调用，例如屏幕旋转、语言切换、深色模式切换等。
- **`ApplicationLifecycleDispatcher`**：Expo 提供的分发器，接收到事件后会将调用传递给所有已注册的 `ApplicationLifecycleListener`。

以下是需要在 `MainApplication.kt` 中进行的修改（`+` 标记的行是需要添加的代码）：

```kotlin
class MainApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    ...
    // 添加以下代码：将 Application 创建事件转发给 Expo 的分发器
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ...
    // 添加以下代码：将配置变更事件转发给 Expo 的分发器
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
```

> **术语说明**：
> - **`super.onCreate()` / `super.onConfigurationChanged()`**：调用父类的对应方法，确保 Android 系统的基础生命周期处理逻辑被正确执行。必须在调用自定义逻辑之前执行。
> - **`this`**：在 Kotlin 中指向当前对象实例。这里传递 `this` 是为了让分发器知道是哪个 `Application` 实例触发了事件。
> - **`Configuration`**：Android 的类，包含当前设备配置信息，如屏幕方向、语言、字体缩放比例等。

> **基于经验建议**：`ApplicationLifecycleDispatcher.onApplicationCreate(this)` 必须放在 `super.onCreate()` 之后，因为某些 Expo 模块可能依赖父类初始化完成后的状态。同样，`onConfigurationChanged` 中的转发调用也应放在 `super` 调用之后。如果你的 `MainApplication` 中已经有其他初始化代码，建议将 `ApplicationLifecycleDispatcher` 的调用放在所有初始化逻辑的最后。

### iOS

要在 iOS 端集成 `AppDelegate` 订阅者，需要将相关调用转发给 `ExpoAppDelegateSubscriberManager`，以便订阅者能够响应这些事件。

**关键术语解释：**

- **`AppDelegate`**：iOS 应用的核心委托对象，负责处理应用级别的事件，如应用启动、进入后台、收到推送通知、处理深度链接 URL 等。每个 iOS 应用有且仅有一个 `AppDelegate`。
- **`UIApplicationDelegate`**：iOS 系统定义的协议（Protocol），规定了 `AppDelegate` 可以实现的所有方法。它是一个庞大的接口，包含数十个可选方法。
- **`ExpoAppDelegateSubscriberManager`**：Expo 提供的管理器类，负责接收 `AppDelegate` 的事件并将它们分发给所有已注册的 `ExpoAppDelegateSubscriber`。
- **`willFinishLaunchingWithOptions`**：应用即将完成启动时调用的方法，是进行早期初始化的时机。
- **`didFinishLaunchingWithOptions`**：应用已完成启动时调用的方法，通常在这里进行主要的初始化工作和界面配置。
- **`@main`**：Swift 的属性标记，指定该类是应用的入口点（entry point），系统将从这里开始执行。

#### 方式一：手动转发（推荐在已有自定义 AppDelegate 时使用）

在现有的 `AppDelegate` 实现中，将相关调用转发给 `ExpoAppDelegateSubscriberManager`：

```swift
import Expo

public class AppDelegate: UIApplicationDelegate {

  open func application(
    _ application: UIApplication,
    willFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // 将调用转发给 Expo 的订阅者管理器
    return ExpoAppDelegateSubscriberManager.application(
      application,
      willFinishLaunchingWithOptions: launchOptions
    )
  }

  open func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // 将调用转发给 Expo 的订阅者管理器
    return ExpoAppDelegateSubscriberManager.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )
  }

  ...
}
```

> **术语说明**：
> - **`import Expo`**：导入 Expo 框架模块，使 `ExpoAppDelegateSubscriberManager` 等 Expo 类可用。
> - **`open func`**：Swift 中的访问控制修饰符。`open` 是最高级别的访问权限，表示该方法可以被其他模块继承和重写。
> - **`UIApplication`**：iOS 中代表应用实例的核心类，提供应用级别的操作，如管理应用的生命周期、处理事件循环等。
> - **`LaunchOptionsKey`**：字典键类型，用于从 `launchOptions` 中获取应用启动的原因和附带信息（例如是否因为推送通知或深度链接而启动）。
> - **`... `**：省略号表示你的 `AppDelegate` 中可能还有其他方法，它们也需要根据需要转发给 `ExpoAppDelegateSubscriberManager`。

> **基于经验建议**：如果你的 `AppDelegate` 中已有自定义逻辑（例如第三方 SDK 的初始化），需要将 `ExpoAppDelegateSubscriberManager` 的调用与你的自定义逻辑结合。注意 `return` 语句——如果 `ExpoAppDelegateSubscriberManager` 返回 `false`，表示某个订阅者处理失败，你需要根据业务需求决定如何处理这种情况。通常直接返回其返回值即可。

#### 方式二：继承 ExpoAppDelegate（推荐在无需自定义 AppDelegate 时使用）

如果你的 `AppDelegate` 当前没有继承其他类，可以通过直接继承 `ExpoAppDelegate` 来简化配置——它会自动处理所有转发逻辑：

```swift
import Expo

@main
public class AppDelegate: ExpoAppDelegate {
  // 无需手动编写转发代码，ExpoAppDelegate 会自动处理
}
```

> **术语说明**：
> - **`ExpoAppDelegate`**：Expo 提供的 `UIApplicationDelegate` 基类实现。它内部已经实现了所有需要转发的 `UIApplicationDelegate` 方法，并自动调用 `ExpoAppDelegateSubscriberManager` 进行分发。继承它等同于自动完成了方式一中的所有手动转发工作。

> **注意**：并非所有可能产生重大副作用的 `UIApplicationDelegate` 方法都被支持转发。如果你需要依赖某个特定的代理方法，请查看 Expo 源代码中的 **ExpoAppDelegate.swift** 文件，确认完整的支持方法列表。

> **基于文档内容推导**：方式二（继承 `ExpoAppDelegate`）是最简洁的集成方式，代码量最少且不容易出错。但它要求你的 `AppDelegate` 没有其他父类——由于 Swift 是单继承语言，一个类只能继承一个父类。如果你的 `AppDelegate` 已经继承了某个第三方库提供的基类，就只能使用方式一进行手动转发。在项目初期规划时建议考虑这一点，避免后期需要重构。

## 测试集成

要验证生命周期回调是否正常工作，可以安装一个依赖这些回调的模块进行测试。这里我们安装 `expo-linking`，它使用生命周期监听器来处理深度链接。

**关键术语解释：**

- **`expo-linking`**：Expo 提供的链接处理库，用于处理应用内外的 URL 跳转，包括深度链接（Deep Links）和通用链接（Universal Links）。它依赖生命周期监听器来捕获系统传入的 URL 事件。

### 步骤 1：安装 expo-linking

使用你偏好的包管理器安装：

```sh
# npm
npx expo install expo-linking

# yarn
yarn expo install expo-linking

# pnpm
pnpm expo install expo-linking

# bun
bun expo install expo-linking
```

> **术语说明**：`npx expo install` 是 Expo 提供的安装命令，它会自动选择与当前 Expo SDK 版本兼容的包版本，避免版本冲突问题。相比直接使用 `npm install`，这是推荐的安装方式。

### 步骤 2：添加深度链接监听器

在代码中添加深度链接的监听器，并观察打开深度链接时的控制台输出：

```jsx
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

useEffect(() => {
  // 注册 URL 事件监听器
  const listener = Linking.addEventListener('url', ({ url }) => {
    console.log('Received deep link:', url);
  });

  // 在组件卸载时移除监听器，防止内存泄漏
  return listener.remove;
}, []);
```

> **术语说明**：
> - **`useEffect`**：React 的 Hook（钩子函数），用于在函数组件中执行副作用操作。这里用于在组件挂载时注册监听器，在组件卸载时清理监听器。
> - **`Linking.addEventListener('url', ...)`**：注册一个监听器，当应用收到 URL 事件（即深度链接被打开）时触发回调函数。`'url'` 是事件类型名称。
> - **`listener.remove`**：`addEventListener` 返回一个订阅对象，调用其 `remove` 方法可以取消订阅。在 `useEffect` 的清理函数中返回 `listener.remove` 确保组件卸载时自动移除监听器。
> - **`[]`**（空依赖数组）：告诉 React 这个 Effect 只在组件首次挂载时执行一次，不需要在依赖变更时重新执行。
> - **深度链接 URL 格式**：深度链接通常有两种格式——自定义 URL Scheme（如 `myapp://somepath/details`）和通用链接（如 `https://example.com/somepath/details`）。前者使用应用自定义的协议名，后者使用标准 HTTP/HTTPS 协议但需要在服务端配置关联文件。

> **基于经验建议**：在实际项目中，收到深度链接 URL 后通常不会直接 `console.log`，而是将其传递给导航库（如 React Navigation 或 Expo Router）进行路由解析。建议在应用架构设计阶段就规划好深度链接的路由映射表，确保所有需要被外部打开的页面都有对应的 URL 模式。

### 步骤 3：触发深度链接进行测试

运行以下命令来触发一个指向你的应用的深度链接：

```sh
# npm
# 如果你在 app.json 中配置了 android.package 或 ios.bundleIdentifier
npx uri-scheme open com.example.app://somepath/details --android

# 如果你在 app.json 中配置了 scheme
npx uri-scheme open myapp://somepath/details --ios

# yarn
yarn dlx uri-scheme open com.example.app://somepath/details --android
yarn dlx uri-scheme open myapp://somepath/details --ios

# pnpm
pnpm dlx uri-scheme open com.example.app://somepath/details --android
pnpm dlx uri-scheme open myapp://somepath/details --ios

# bun
bunx uri-scheme open com.example.app://somepath/details --android
bunx uri-scheme open myapp://somepath/details --ios
```

> **术语说明**：
> - **`uri-scheme`**：一个命令行工具，用于在开发环境中模拟深度链接的打开。它会将指定的 URL 发送到模拟器或已连接的真机上，触发应用的深度链接处理逻辑。
> - **`com.example.app`**：Android 应用的包名（Package Name），需要替换为你在 `app.json` 中 `android.package` 字段配置的实际包名。
> - **`myapp`**：自定义 URL Scheme，需要替换为你在 `app.json` 中 `scheme` 字段配置的实际值。
> - **`--android` / `--ios`**：指定目标平台，工具会将 URL 发送到对应平台的设备或模拟器上。
> - **`npx` / `yarn dlx` / `pnpm dlx` / `bunx`**：各包管理器提供的"临时执行"命令，可以在不全局安装包的情况下直接运行 `uri-scheme`。

> **基于经验建议**：测试深度链接时需要注意以下几点：
> - **Android 模拟器**：确保模拟器已启动并且应用已安装。如果 `uri-scheme` 报错，可以尝试使用 `adb` 命令直接发送 intent：`adb shell am start -a android.intent.action.VIEW -d "myapp://somepath/details"`。
> - **iOS 模拟器**：确保模拟器已启动。也可以通过 Safari 浏览器在地址栏输入深度链接 URL 来测试。
> - **真机测试**：需要通过 `npx uri-scheme open` 配合已连接的设备。确保设备已通过 USB 连接并信任了开发机器。
> - **`app.json` 配置**：在测试前，确保 `app.json` 中已正确配置了 `scheme`（自定义 URL Scheme）和 `android.package` / `ios.bundleIdentifier`。这些配置告诉 `uri-scheme` 工具将 URL 发送给哪个应用。

## 常见问题与注意事项

1. **Android 端遗漏配置**：如果忘记在 `MainApplication.kt` 中添加 `ApplicationLifecycleDispatcher` 的调用，Expo 模块将无法接收到 `Application` 级别的生命周期事件。这可能导致 `expo-linking` 无法处理深度链接、`expo-notifications` 无法处理推送通知等问题，且通常不会有明显的错误提示。

2. **iOS 端转发不完整**：`ExpoAppDelegateSubscriberManager` 需要在所有相关的 `UIApplicationDelegate` 方法中被调用。如果只在 `didFinishLaunchingWithOptions` 中调用而遗漏了其他方法（如 `application(_:open:options:)` 用于处理 URL 打开），部分功能将无法正常工作。

3. **`ExpoAppDelegate` 的局限性**：使用方式二（继承 `ExpoAppDelegate`）虽然简单，但并非所有 `UIApplicationDelegate` 方法都被支持。如果你的应用依赖某个未被转发的代理方法，需要切换为方式一进行手动转发，并在其中同时处理你的自定义逻辑和 `ExpoAppDelegateSubscriberManager` 的调用。

4. **与第三方 SDK 的兼容**：如果你的项目同时使用了其他需要修改 `AppDelegate` 或 `Application` 的第三方 SDK（如 Firebase、Branch、AppsFlyer 等），需要确保它们的生命周期回调也得到正确处理。通常可以在同一个方法中依次调用各 SDK 的初始化代码和 `ExpoAppDelegateSubscriberManager` 的转发方法。

5. **构建后的验证**：每次修改原生代码后，需要重新构建应用（而非仅仅刷新 JavaScript）才能看到效果。在 Android 上运行 `npx expo run:android`，在 iOS 上运行 `npx expo run:ios`。

> **基于文档内容推导**：生命周期监听器的配置是一次性工作——一旦完成，所有后续安装的 Expo 模块都会自动获得接收系统事件的能力，无需再修改原生入口文件。这正是 Expo Modules API 的核心设计目标之一：最小化对原生代码的手动干预。对于棕地应用来说，这意味着可以在不破坏现有原生架构的前提下，逐步引入 Expo 生态中的各种功能模块。

---

## 文档导航

- **上一页**：[integrated approach](./40__integrated-approach.md)
- **下一页**：[monorepos](./42__monorepos.md)
