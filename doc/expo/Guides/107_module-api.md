# Expo Modules API 参考

## 定位

Expo Modules API 是 React Native JSI 等底层能力之上的原生模块抽象层，用 Swift/Kotlin 的声明式 DSL 向 JavaScript 暴露函数、属性、视图、事件和生命周期。

对 React Web 开发者，可把它理解为“由原生代码实现的类型化 JavaScript 接口”。但调用会跨 runtime/线程，参数必须可转换，视图是真实原生 View 而非 DOM。

## 模块定义组件

每个模块实现 `definition`。

- `Name` 设置 JavaScript 使用的模块名；可推断，但建议显式声明。
- `Constant` 首次访问时计算并缓存。
- `Constants` 已弃用，应改用 `Constant`。
- `Property` 类似 `Object.defineProperty`，可定义 getter/setter。

### `Function` 与 `AsyncFunction`

`Function` 同步执行并阻塞 JavaScript，最多 8 个参数，只适合很短的内存操作。

`AsyncFunction` 在 JS 侧始终返回 Promise，原生代码默认调度到不同线程，也最多 8 个参数。网络、文件 I/O、长任务和 UI 线程任务应优先使用它；可用 `.runOnQueue(.main)`/`.runOnQueue(Queues.MAIN)` 指定队列。

最后一个参数可为原生 `Promise`。Android 也支持 `AsyncFunction(...) Coroutine { ... }`：挂起体不能接收 `Promise`，返回值/异常自动完成 Promise，协程作用域随模块释放而取消。Kotlin `Promise` 要从 `expo.modules.kotlin` 导入。

### `View`

`View` 导出原生 UI，可包含 `Prop`、`Events`、`GroupView`、`AsyncFunction`。Android 视图必须继承 `ExpoView`。视图异步函数挂在 React ref 上，自动接收视图实例并默认运行在 UI 线程。

文档明确：直接渲染 SwiftUI 仍在规划中，当前可用 `UIHostingController` 嵌入 UIKit。

## 事件与生命周期

`Events` 声明事件名；模块用 `sendEvent` 发送。`OnStartObserving(eventName)` 在第一个监听器加入时调用，`OnStopObserving(eventName)` 在该事件监听器全部移除后调用。

通用生命周期有 `OnCreate`、`OnDestroy`、`OnAppContextDestroys`。iOS 有 `OnAppEntersForeground`、`OnAppEntersBackground`、`OnAppBecomesActive`；Android 有 `OnActivityEntersForeground`、`OnActivityEntersBackground`、`OnActivityDestroys`、`OnActivityResult`、`OnNewIntent`、`OnUserLeavesActivity`。

Android 的 `RegisterActivityContracts` 注册类型安全的 Activity Result contract，是 `startActivityForResult` 的现代替代。

## 视图定义

- `Prop` 定义 prop setter，可设置 `null` 时的默认值；函数类型 prop 当前不支持，回调应使用事件。
- `PropGroup` 仅 Android，用共同 handler 批量处理 props，主要供 CSS prop decorators 内部使用。
- `OnViewDidUpdateProps` 在全部 props 更新后调用。
- `OnViewDestroys` 仅 Android；iOS 可通过视图析构实现类似清理。
- 视图 `AsyncFunction` 总在主队列执行。

Android `GroupView` 把 `ViewGroup` 暴露为容器，通过 `AddChildView`、`GetChildCount`、`GetChildViewAt`、`RemoveChildView`、`RemoveChildViewAt` 管理 React 子视图。

## 参数与类型转换

跨 runtime 原则上只能传基础、可序列化数据。Swift/Kotlin 支持常见数字、布尔、字符串、数组、映射和可选类型。

iOS 类型可实现 `Convertible.convert(from:appContext:)`；无效值应抛异常。Android 模块重写 `converters()`，用 `ModuleConverters` 和多个 `.from<T>` 注册转换。内置转换覆盖 URL/URI、路径、颜色、几何类型、Pair、`Uint8Array`、基础数组和 Kotlin `Duration`。iOS 无 scheme 的 URL 按文件 URL 处理，Android URL/URI 要求 scheme。

`Record` 用 `@Field` 把 JS 对象映射为有默认值和自动验证的强类型结构。实验性 `Formatter` 可用 `map` 转换字段、用 `skip` 排除字段，并支持条件/链式处理。

enum 要实现 `Enumerable` 且底层为基础类型；Kotlin 构造参数必须叫 `value`。`Either` 系列允许一个参数接收最多四种类型。

实验性 `ValueOrUndefined` 可区分未传入、显式 `null` 和实际值。

`JavaScriptValue`、`JavaScriptObject`、`JavaScriptFunction` 可直接操作 JS 值，但只能用于同步函数；跨线程访问会崩溃。

## 原生类与上下文

`Module.appContext` 指向单个 Expo app。`AppContext` 可访问 legacy constants、permissions、activity provider、React context、React 实例状态和 utilities。`ExpoView.appContext` 是视图与模块/JS runtime 通信入口。不要改变 `ExpoView` 构造参数，因为实例由 `expo-modules-core` 创建。

## 模块事件与视图事件

模块先用 `Events` 声明，再用 `sendEvent` 发送；JS 可用 `addListener`、`useEvent` 或 `useEventListener`。

视图事件属于具体视图实例，原生视图声明同名 `EventDispatcher`，React 把回调作为 prop 传入，payload 位于 `event.nativeEvent`。Android 非对象 payload 会包为 `{ payload: value }`。

## 易误解点与建议

- `AsyncFunction` 的异步包含原生线程调度，不只是套 Promise。
- React Native 没有 DOM；prop setter、UI 线程和 ref 都对应原生视图。
- `Events` 只声明能力，不会自动发送。
- iOS App 与 Android Activity 生命周期不是一一对应。
- **基于文档内容推导：** 默认将 I/O、耗时或 UI 工作设计为 `AsyncFunction`。
- **基于文档内容推导：** 优先用 `Record`、枚举和转换器在桥接边界完成校验。

## 信息边界

本文档明确覆盖 DSL、类型转换、上下文和事件。未完整讲解脚手架、原生工程接入、发布、权限、测试和性能基准。

<!-- NAVIGATION START -->
---
[← 上一页：为 Expo 模块增加 macOS 与 tvOS 支持](./106_additional-platform-support.md) | [下一页：Expo Inline Modules 参考 →](./108_inline-modules-reference.md)
<!-- NAVIGATION END -->
