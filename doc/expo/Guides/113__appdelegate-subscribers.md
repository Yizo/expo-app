# iOS AppDelegate 订阅者（AppDelegate Subscribers）

> 原始文档地址：https://docs.expo.dev/modules/appdelegate-subscribers/

## 概述

管理特定的 Apple 操作系统事件（如推送通知、深度链接等）需要在主应用委托（AppDelegate）中实现相应的方法。由于标准的 React Native 模块缺少对这些生命周期事件的原生钩子（hooks），第三方库的安装指南通常要求开发者手动将代码片段粘贴到 AppDelegate 文件中。

Expo 通过允许外部包直接监听 AppDelegate 的方法调用来简化这一流程。你的主 AppDelegate 类必须继承自 Expo 提供的基类（`ExpoAppDelegate`）。该基类覆盖了 Apple `UIApplicationDelegate` 协议中的大部分方法，并将传入的调用路由到所有已注册的订阅者。

> **关键术语解释（面向初学者）：**
>
> - **AppDelegate（应用委托）**：iOS 应用的核心类，负责处理应用级别的生命周期事件，如启动、进入后台、收到通知等。可以把它理解为 iOS 应用的"总调度员"。
> - **订阅者（Subscriber）**：一种设计模式，允许你注册一个"监听器"来接收特定事件的通知，而无需修改主调度逻辑。
> - **UIApplicationDelegate 协议**：Apple 定义的一组方法规范，描述了应用如何处理系统级事件。协议类似于接口（interface），规定了必须或可选实现的方法。
> - **深度链接（Deep Link）**：通过 URL 直接导航到应用内特定页面的技术，类似于网页中的直接链接。

## 初始设置

在开始之前，请确保你已经创建了一个 Expo 模块，或者已经将 API 集成到了你的库中。以下是具体步骤：

### 步骤一：定义 Swift 类

创建一个公共的 Swift 类，该类继承自 `ExpoAppDelegateSubscriber`（核心订阅者基类）。

### 步骤二：在配置文件中注册

将类名注册到模块配置文件（`expo-module.config.json`）中的 `apple.appDelegateSubscribers` 数组内。

### 步骤三：安装 CocoaPods

执行 CocoaPods 安装命令（`npx pod-install` 或在 `ios` 目录下执行 `pod install`），系统会自动在你的项目中生成提供程序文件（provider file）。

### 步骤四：实现委托方法

在你的新类中实现所需的委托方法来监听特定事件。你可以查阅 Expo 核心仓库中 `ExpoAppDelegate` 的源代码，获取所有可重写方法的完整列表。

> **注意**：Objective-C 类不受支持——你只能使用 Swift 来编写 AppDelegate 订阅者。

> **注意**：某些可能引发意外副作用的方法目前仍不受支持。

> **基于经验建议**：如果你不确定哪些方法可用，可以先在 Xcode 中输入 `func application` 触发自动补全，查看所有可用的 UIApplicationDelegate 方法。同时建议直接阅读 `ExpoAppDelegate.swift` 源码（位于 `node_modules/expo-modules-core/ios/` 目录下）来获取最准确的方法列表。

## 处理返回值

当委托方法需要返回值时，系统使用特殊的逻辑来合并来自多个订阅者的输出。以下是两种主要场景：

### `application(_:didFinishLaunchingWithOptions:) -> Bool`

**方法说明**：这是应用启动完成后调用的方法，用于决定是否继续启动流程。

Apple 的建议是：如果应用无法处理传入的 URL 或用户活动（user activity），则返回 `false`；否则返回 `true`。

**合并逻辑**：当存在多个订阅者时，只要任何一个订阅者返回 `true`，主 AppDelegate 也会返回 `true`。

> **基于文档内容推导**：这意味着如果你同时使用了多个需要处理启动事件的库（例如推送通知库和深度链接库），只要其中一个库成功处理了启动事件，整个应用就会继续正常启动，不会因为其他库返回 `false` 而中断。

> **注意**：当应用是通过远程通知启动时，该返回值会被绕过（即 Apple 系统不会根据此返回值做决策）。

### `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)`

**方法说明**：该方法处理传入的推送通知和后台数据获取机会。它提供了一个完成处理器（completion handler），要求返回一个 `UIBackgroundFetchResult` 枚举值。

**关键术语**：`UIBackgroundFetchResult` 是 Apple 定义的枚举，包含三种可能的值：

| 枚举值 | 含义 |
|--------|------|
| `.newData` | 成功获取到新数据 |
| `.noData` | 没有新数据可获取 |
| `.failed` | 数据获取失败 |

**合并逻辑**：主 AppDelegate 为每个订阅者分配一个独立的完成处理器，等待所有订阅者执行完毕后，按照以下优先级聚合结果：

1. **只要有一个订阅者返回 `failed`**，主 AppDelegate 就返回 `failed`（失败优先）。
2. **如果没有失败，但至少有一个订阅者返回 `newData`**，则返回 `newData`。
3. **如果以上都不满足**，则默认返回 `noData`。

> **基于文档内容推导**：这种聚合策略的设计思路是"最悲观优先"——失败状态具有最高优先级，因为 Apple 会根据此结果决定是否继续为应用提供后台执行时间。如果一个订阅者报告失败，系统会认为整个后台获取过程出了问题。

> **基于经验建议**：如果你有多个订阅者处理远程通知，建议仔细设计每个订阅者的错误处理逻辑。一个写得不好、总是返回 `failed` 的订阅者会影响所有其他订阅者的结果，可能导致系统减少对你应用的后台唤醒频率。

### 其他方法

> **提示**：要了解更多方法如何处理订阅者返回值的聚合逻辑，建议查阅 Expo 核心仓库中 `ExpoAppDelegate` 的源代码。

## 代码示例

### AppLifecycleDelegate.swift

以下示例展示了一个完整的 AppDelegate 订阅者实现，涵盖了常见的应用生命周期事件：

```swift
import ExpoModulesCore

public class AppLifecycleDelegate: ExpoAppDelegateSubscriber {
  public func applicationDidBecomeActive(_ application: UIApplication) {
    // 应用已变为活跃状态（前台可交互）
  }

  public func applicationWillResignActive(_ application: UIApplication) {
    // 应用即将变为非活跃状态（如来电、下拉通知栏时触发）
  }

  public func applicationDidEnterBackground(_ application: UIApplication) {
    // 应用已进入后台
  }

  public func applicationWillEnterForeground(_ application: UIApplication) {
    // 应用即将进入前台（从后台恢复到前台的过程中）
  }

  public func applicationWillTerminate(_ application: UIApplication) {
    // 应用即将终止（用户强制关闭或系统回收时触发）
  }

  public func applicationDidReceiveMemoryWarning(_ application: UIApplication) {
    // 应用收到内存警告（应尽快释放不必要的缓存和资源）
  }
}
```

> **关键术语解释（面向初学者）：**
>
> - **`import ExpoModulesCore`**：导入 Expo 模块核心库，该库提供了 `ExpoAppDelegateSubscriber` 基类和其他基础设施。
> - **`public class`**：`public` 表示该类对外可见，是 Expo 模块系统能够发现和实例化它的前提条件。如果忘记写 `public`，订阅者将不会被注册。
> - **`ExpoAppDelegateSubscriber`**：Expo 提供的订阅者基类，继承它后即可获得接收 AppDelegate 事件的能力。
> - **`UIApplication`**：iOS 中表示整个应用实例的类，每个方法都会收到它作为参数。

> **生命周期事件触发顺序说明**：
>
> 以下是常见场景下方法的调用顺序：
>
> **应用启动**：`didFinishLaunchingWithOptions` → `applicationDidBecomeActive`
>
> **用户按 Home 键进入后台**：`applicationWillResignActive` → `applicationDidEnterBackground`
>
> **用户从后台切回应用**：`applicationWillEnterForeground` → `applicationDidBecomeActive`
>
> **应用被系统杀死**：`applicationWillResignActive` → `applicationDidEnterBackground` → `applicationWillTerminate`

### expo-module.config.json

在模块配置文件中注册上面定义的订阅者类：

```json
{
  "apple": {
    "appDelegateSubscribers": ["AppLifecycleDelegate"]
  }
}
```

> **说明**：`appDelegateSubscribers` 是一个数组，因此你可以同时注册多个订阅者类。例如：
>
> ```json
> {
>   "apple": {
>     "appDelegateSubscribers": ["AppLifecycleDelegate", "PushNotificationDelegate"]
>   }
> }
> ```

> **基于经验建议**：每个订阅者类应保持职责单一。例如，一个专门处理生命周期日志，另一个专门处理推送通知，这样更易于维护和调试。

## 限制与注意事项

| 限制项 | 说明 |
|--------|------|
| 仅支持 Swift | Objective-C 类不能作为 AppDelegate 订阅者使用 |
| 部分方法不受支持 | 可能引发意外副作用的方法目前无法使用 |
| 必须继承基类 | 主 AppDelegate 必须继承自 `ExpoAppDelegate` 才能将调用转发给订阅者 |
| 返回值合并逻辑 | 多个订阅者的返回值会按照特定规则合并，不能单独控制最终返回值 |

> **基于经验建议**：在 managed workflow（托管工作流）中，Expo 已经为你配置好了 `ExpoAppDelegate`，无需额外操作。但在 bare workflow（裸工作流）中，你需要确认你的 `AppDelegate` 确实继承自 `ExpoAppDelegate`。可以在 `AppDelegate.swift`（或 `AppDelegate.m`）文件中检查类声明。

> **基于文档内容推导**：由于所有订阅者的返回值会被合并，在团队协作开发中，不同模块的开发者需要注意不要在订阅者中返回可能影响其他模块的意外值。建议在代码审查中特别关注 AppDelegate 订阅者的返回值逻辑。

## 总结

Expo 的 AppDelegate 订阅者机制为 iOS 原生事件监听提供了一套优雅的解决方案：

- **对库开发者而言**：无需让用户手动修改 AppDelegate 文件，只需编写订阅者类并在配置文件中注册即可。
- **对应用开发者而言**：安装包含 AppDelegate 订阅者的库后，只需执行 `pod install`，无需任何手动代码修改。
- **对多库协作而言**：系统自动处理多个订阅者之间的返回值冲突，确保各库可以和谐共存。

---

## 文档导航

- **上一页**：[android lifecycle listeners](./112__android-lifecycle-listeners.md)
- **下一页**：[autolinking](./114__autolinking.md)
