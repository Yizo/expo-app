# Android 生命周期监听器

## 为什么需要

深链接、配置变化、返回键等 Android 系统事件通常要求修改 `MainActivity`/`MainApplication`。React Native 模块 API 没有统一挂接机制，传统库常让使用者复制原生代码。Expo Modules API 用 listener 自动接入这些回调，降低宿主工程维护成本。

前提是已创建 Expo 模块，或把 Expo Modules API 集成进现有 React Native 原生库。

## Package 注册

创建实现 `expo.modules.core.interfaces.Package` 的类，通常只实现：

- `createReactActivityLifecycleListeners`：注册 Activity listener。
- `createApplicationLifecycleListeners`：注册 Application listener。

Activity 类似当前原生页面/窗口实例；Application 更接近进程级应用对象。

## Activity listener

`ReactActivityLifecycleListener` 通过 `ReactActivityDelegate` 接入。当前支持 `onCreate`、`onResume`、`onPause`、`onDestroy`、`onNewIntent`、`onBackPressed`。

```kotlin
class MyLibPackage : Package {
  override fun createReactActivityLifecycleListeners(
    activityContext: Context
  ) = listOf(MyLibReactActivityLifecycleListener())
}
```

只覆写需要的方法。首次创建可从 `activity.intent.data` 读取初始深链接；运行中由 `onNewIntent` 接收新 Intent；`onBackPressed` 返回 `true` 会阻止默认返回行为。

## 桥接到 JavaScript

listener 是独立于 Expo 模块实例的单例。文档示例的事件流是：

1. 在 `onCreate`/`onNewIntent` 捕获 URL。
2. 保存初始 URL，并通知观察者集合。
3. 模块声明 `Events("onUrlReceived")` 和 `getInitialUrl`。
4. `OnStartObserving` 注册 observer，以弱引用获取模块并 `sendEvent`。
5. `OnStopObserving` 移除 observer。
6. TypeScript 声明事件类型，React hook 用 `addListener` 订阅并在卸载时 `remove()`。

弱引用避免单例 observer 强持有模块导致泄漏。初始 URL 单独保存，是因为 JS listener 建立前系统事件可能已发生。

模块类还要写入 `expo-module.config.json`：

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.deeplinkhandler.DeepLinkHandlerModule"]
  }
}
```

## Application listener

`ApplicationLifecycleListener` 当前支持 `onCreate` 和 `onConfigurationChanged`。在 `createApplicationLifecycleListeners` 返回实例，只覆写实际需要的方法。

## 已知限制

- 没有 Activity `onStart`/`onStop`，因为挂接点 `ReactActivityDelegate` 不提供它们。
- listener 接口可能随 SDK 变化。Expo 会新增接口，并用 `@Deprecated` 标记计划移除的接口。
- 基于 Java 8 默认方法，不应实现所有回调。
- `onNewIntent`/`onBackPressed` 返回值会改变默认处理，不要无条件返回 `true`。

## 易误解点与建议

- Intent 是 Android 系统动作/数据容器，不等于浏览器路由事件。
- Activity 可能被重建，不是永久应用单例。
- **基于文档内容推导：** 使用“初始状态读取 + 后续事件推送”避免冷启动事件丢失。
- **基于文档内容推导：** observer 注册/移除成对，并避免强引用模块或 Activity。

文档未涉及 Manifest 深链接声明、权限、后台限制、持久化和测试。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Swift 模块 TypeScript 类型生成参考](./109_type-generation-reference.md) | [下一页：iOS AppDelegate Subscribers →](./111_appdelegate-subscribers.md)
<!-- NAVIGATION END -->
