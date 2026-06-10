# Expo Modules Shared Objects

## 什么是 Shared Object

Shared object 通过 Expo module 把 Android/iOS 中长期存在的原生实例暴露给 JavaScript/TypeScript。原生类继承 `SharedObject`，并在模块定义中用 `Class()` 暴露。

它适合保存已解码图片、数据库句柄、流式请求等重状态，而不是每次 React 组件挂载都创建新实例。只要 JavaScript 或原生仍持有引用，对象就存活；双方都不再引用时自动释放。JavaScript 可以引用它，但不直接控制其原生生命周期。

## 为什么需要

传统无状态原生函数常用文件 URI 交换数据。以图片为例，选择器、处理器和显示组件可能各自从磁盘读取并解码，变换后还会写新文件，造成重复 I/O、多个 bitmap、CPU/内存压力、掉帧和耗电。

Shared object 只读取/解码一次，后续旋转、翻转在内存中的同一实例上进行；仅在明确调用保存函数时落盘。对象式 API 还能提供 `rotate().flipX().renderAsync()` 这类链式操作。

## Android 实现

Android 类继承 `expo.modules.kotlin.sharedobjects.SharedObject`，构造器接收 `RuntimeContext`。示例用一个 `Bitmap` 字段保存当前图片，旋转/翻转时替换当前 bitmap，`render()` 返回专用 `SharedRef<Bitmap>`。

Android 提供 `sharedObjectDidRelease()`：当 JavaScript 释放全部引用时可回收 bitmap 等原生资源。

模块定义中的关键结构：

```kotlin
AsyncFunction("createContextAsync") { path: String ->
  val bitmap = BitmapFactory.decodeFile(path)
    ?: throw Exceptions.IllegalArgument("Unable to decode image")
  SimpleImageContext(runtimeContext, bitmap)
}

Class<SimpleImageContext>("Context") {
  Function("rotate") { ctx, degrees: Float -> ctx.rotate(degrees) }
  Function("flipX") { ctx -> ctx.flipX() }
  AsyncFunction("renderAsync") Coroutine { ctx -> ctx.render() }
}
```

文件读取/解码是 I/O，因此创建 context 用异步函数；纯内存变换可同步；render 标成异步以表达它可能复制或准备 bitmap。

## iOS 实现

iOS 类继承 `ExpoModulesCore.SharedObject`，保存 `UIImage`。初始化时从路径读取 `Data` 并解码，失败抛异常；旋转/翻转只更新内存中的图片；`render()` 返回 `SharedRef<UIImage>`。

通过 `Class("Context", SimpleImageContext.self)` 暴露方法。Swift 示例让 `rotate`/`flipX` 返回 context 本身，从而在 JavaScript 链式调用。

## JavaScript/React 使用

1. `expo-image-picker` 返回普通文件 URI。
2. 自定义原生模块用 URI 创建 shared context。
3. React state 保存 context 和 `SharedRef<'image'>`。
4. 调用 context 的内存变换并 `renderAsync()`。
5. 把 shared ref 直接交给 `expo-image` 的 `Image`。

选择器无需理解 shared object；把磁盘 URI 提升为共享原生对象，是自定义模块的职责。

## Expo 中的使用实例

- `expo-image` 保存已解码图片，避免模块间重复解码。
- `expo-image-manipulator` 排队执行异步/内存图片操作。
- `expo-sqlite` 跨调用保存数据库、session 和 statement 句柄。
- `expo/fetch` 保存流式、取消和重定向相关请求/响应生命周期。

直接收益包括减少磁盘 I/O、减少解码、降低内存压力、加快操作并降低掉帧风险。

## `Class()` DSL

- `Constructor` 允许 JS 用 `new ClassName(args)` 创建实例；没有构造器时，只能由原生函数返回实例。
- `StaticFunction` 定义类上的同步静态方法，不接收实例。
- `StaticAsyncFunction` 定义返回 Promise 的类静态方法；Kotlin 可配合 `Coroutine`。
- `Property` 在 Class 内接收实例，可定义只读或读写计算属性。

## 易误解点、限制与建议

- Shared object 不是把大型二进制序列化进 JS，而是让 JS 持有原生实例引用。
- 引用减少了重复副本，但长时间持有大型对象本身仍占原生内存。
- 同步函数只适合内存内的短操作；读取/解码应异步。
- Android 资源若需要显式释放，应在 `sharedObjectDidRelease()` 清理。
- **基于文档内容推导：** API 应明确区分“内存变换”和“显式持久化”，避免无意磁盘写入。
- **基于文档内容推导：** React state 保存 context 时，应在不再需要后释放 JS 引用，让自动释放生效。

文档未涉及线程安全、并发修改、手动 dispose API、内存上限和性能基准数据。

