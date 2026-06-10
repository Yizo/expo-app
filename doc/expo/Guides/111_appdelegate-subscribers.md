# iOS AppDelegate Subscribers

## 解决的问题

iOS 深链接、通知和应用状态变化通常需要在 `AppDelegate` 实现 `UIApplicationDelegate` 方法。React Native 模块 API 无统一挂接机制，Expo Modules API 通过 subscriber 自动订阅这些调用。

宿主应用的 `AppDelegate` 必须继承 `ExpoAppDelegate`，这是使用 Expo Modules 的要求。`ExpoAppDelegate` 实现大部分 `UIApplicationDelegate` 方法，并把调用转发给所有 subscriber。

## 注册流程

1. 已有 Expo 模块，或已把 Expo Modules API 集成进 React Native 库。
2. 创建 `public` Swift 类并继承 `ExpoAppDelegateSubscriber`。
3. 将类名加入 `expo-module.config.json` 的 `apple.appDelegateSubscribers`。
4. 运行 `pod install`，subscriber 会进入应用工程生成的 `ExpoModulesProvider.swift`。
5. 在 subscriber 中实现需要的 delegate 方法。

```json
{
  "apple": {
    "appDelegateSubscribers": ["AppLifecycleDelegate"]
  }
}
```

Objective-C 类不受支持。可能因实现而产生副作用的 AppDelegate 方法当前也不支持。

## 多 subscriber 返回值合并

多个 subscriber 可能响应同一个方法，因此 `ExpoAppDelegate` 必须协调结果。

### 启动结果

`application(_:didFinishLaunchingWithOptions:) -> Bool` 中，只要至少一个 subscriber 返回 `true`，`ExpoAppDelegate` 就返回 `true`。Apple 语义是：无法处理 URL 资源或继续 user activity 时返回 `false`；远程通知启动时返回值会被忽略。

### 后台远程通知

`application(_:didReceiveRemoteNotification:fetchCompletionHandler:)` 会给每个 subscriber 独立 completion block，等待全部完成再调用原始 block，优先级为：

1. 任一结果为 `failed`，最终为 `failed`。
2. 否则任一结果为 `newData`，最终为 `newData`。
3. 否则为 `noData`。

这不是“最后一个回调覆盖前面结果”。其他方法的合并规则，文档建议直接查看 `ExpoAppDelegate.swift`。

## 可订阅的应用状态示例

subscriber 可实现 `applicationDidBecomeActive`、`applicationWillResignActive`、`applicationDidEnterBackground`、`applicationWillEnterForeground`、`applicationWillTerminate`、`applicationDidReceiveMemoryWarning` 等。

对 Web 开发者，这些比 `visibilitychange` 更接近操作系统级应用生命周期，并可能影响资源释放、通知和后台任务。

## 坑点与建议

- 仅创建 Swift 类不够，必须配置、`pod install`，且宿主继承 `ExpoAppDelegate`。
- 多 subscriber 的返回值由框架合并，不能假设自己的值直接成为最终值。
- completion handler 必须完成，否则聚合调用可能无法结束。
- **基于文档内容推导：** subscriber 应只实现必要方法，减少副作用与结果冲突。
- **基于文档内容推导：** 对有返回值的方法，先确认 Expo 的聚合语义再设计逻辑。

文档未涉及把这些事件继续发送到 JavaScript、通知权限、后台模式配置、SceneDelegate 和测试。

