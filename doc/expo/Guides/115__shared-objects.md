# 共享对象（Shared Objects）

> **原始文档地址**：[https://docs.expo.dev/modules/shared-objects/](https://docs.expo.dev/modules/shared-objects/)

---

## 概述

本文档详细介绍如何在 Expo Modules API 中使用**共享对象（Shared Objects）**，在多个 React 组件之间保持持久化的原生对象引用，避免直接管理生命周期，并防止对解码位图等重量级状态进行冗余的原生实例化。

### 关键术语说明（面向初学者）

| 术语 | 含义 |
|------|------|
| **Shared Object（共享对象）** | 一种特殊的类，它将原生平台（iOS/Android）上的实例桥接到 JavaScript/TypeScript 环境中。它在原生端长期存活，但不会将生命周期控制权转移给 JS 端。 |
| **SharedRef（共享引用）** | 对共享对象所持有的原生资源的一个轻量级引用，可以安全地传递给 UI 组件使用。 |
| **Native Module（原生模块）** | 用 Swift（iOS）或 Kotlin（Android）编写的、可供 JavaScript 调用的平台原生功能封装。 |
| **Module Definition（模块定义）** | 使用 DSL（领域特定语言）描述模块的公开接口，包括函数、类、属性等。 |
| **Class() DSL** | 在模块定义中注册共享对象类的语法块，用于绑定方法、属性、构造函数等。 |
| **RuntimeContext（运行时上下文）** | 提供对 Expo 运行时环境的访问，在创建共享对象时需要传入。 |

---

## 什么是共享对象

共享对象是一种自定义类，它将原生 iOS 或 Android 上的实例桥接到前端代码中。开发者通过继承特定的基类（`SharedObject`）来创建它们，并在模块定义中通过 `Class()` 进行注册。当所有引用都消失时，内存会被**自动回收**。

> **基于文档内容推导**：共享对象的核心设计理念是"一次创建，多处引用"——在原生端只保留一份实例，而 JavaScript 端可以有多个指针指向它，从而避免重复创建高开销的原生对象。

---

## 为什么需要共享对象

解码大型媒体文件（如高分辨率图片）会消耗大量内存。传统方式下，每次操作都需要重新从磁盘读取并解码，导致以下问题：

- **内存压力**：同一文件被多次解码，占用多份内存
- **I/O 延迟**：反复的磁盘读取拖慢整体性能
- **电池消耗**：CPU 密集型的重复解码加速电量消耗
- **UI 卡顿（掉帧）**：主线程被阻塞，导致界面不流畅

共享对象通过在 RAM 中维护**单一原生实例**、让多个前端引用指向它的方式，彻底解决了上述问题。

---

## 场景：无需磁盘操作的图像修改

### 传统的无状态方式

历史上，模块的函数设计是**无状态**的——每个函数独立执行，无法在调用之间保留状态。这意味着：

1. 图片选择器（Image Picker）从磁盘读取并解码图片
2. 图片处理器（Image Manipulator）再次从磁盘读取并解码同一张图片
3. 保存变换结果时需要写回磁盘
4. UI 组件渲染时又需要再次从磁盘解码

这导致了多次**读盘 → 解码**的冗余循环。

### 使用共享对象的有状态方式

使用共享对象后，整个流程被极大简化：

1. 图片选择器**仅解码一次**，将结果存入共享对象实例
2. 旋转、翻转等变换**直接在内存中的位图上操作**，无需写入磁盘
3. UI 组件直接从内存引用中渲染，只需要**最初的一次磁盘读取**

这种面向对象的方式还支持**链式调用（Method Chaining）**，使 API 更加简洁优雅。

> **基于经验建议**：如果你的模块需要在多次调用之间传递大量二进制数据（如图片、音频、视频帧），优先考虑使用共享对象模式，而非将数据序列化后在 JS 和原生层之间来回传递。

---

## 完整实现示例

下面展示一个最小化的完整实现，涵盖加载图片、应用内存内变换、以及暴露可共享引用的全过程。

### Android 端实现（Kotlin）

在 Android 端，需要继承 `SharedObject` 基类来管理位图。`sharedObjectDidRelease()` 回调在 JS 端释放所有引用时负责清理原生资源。

```kotlin
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.sharedobjects.SharedObject

// SharedRef 用于将原生的 Bitmap 引用安全传递给 JS 端
class ImageRef : SharedRef<Bitmap>()

// SimpleImageContext 是共享对象，在内存中持有一个 Bitmap 实例
class SimpleImageContext(
  runtimeContext: RuntimeContext,
  bitmap: Bitmap
) : SharedObject(runtimeContext) {
  private var current: Bitmap = bitmap

  // 旋转操作：直接在内存中的位图上执行
  fun rotate(degrees: Float) = apply {
    val matrix = Matrix().apply { postRotate(degrees) }
    current = Bitmap.createBitmap(current, 0, 0, current.width, current.height, matrix, true)
  }

  // 水平翻转操作
  fun flipX() = apply {
    val matrix = Matrix().apply { preScale(-1f, 1f) }
    current = Bitmap.createBitmap(current, 0, 0, current.width, current.height, matrix, true)
  }

  // 渲染：返回一个 SharedRef，可传递给 UI 组件
  fun render(): ImageRef = ImageRef(current, runtimeContext)

  // 当 JS 端释放所有引用时，回收位图内存
  override fun sharedObjectDidRelease() {
    if (!current.isRecycled) current.recycle()
  }
}
```

模块定义部分，暴露一个异步函数来创建上下文，以及一个 `Class` 定义来绑定方法：

```kotlin
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SimpleImageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SimpleImageModule")

    // 异步函数：从文件路径解码位图，创建共享对象上下文
    AsyncFunction("createContextAsync") { path: String ->
      val bitmap = BitmapFactory.decodeFile(path)
        ?: throw Exceptions.IllegalArgument("Unable to decode image at $path")
      SimpleImageContext(runtimeContext, bitmap)
    }

    // Class 定义：将共享对象的方法暴露给 JS 端
    Class<SimpleImageContext>("Context") {
      Function("rotate") { ctx: SimpleImageContext, degrees: Float -> ctx.rotate(degrees) }
      Function("flipX") { ctx: SimpleImageContext -> ctx.flipX() }
      AsyncFunction("renderAsync") Coroutine { ctx: SimpleImageContext -> ctx.render() }
    }
  }
}
```

> **注意**：`Function` 是同步方法，`AsyncFunction` 是异步方法（返回 Promise）。`Coroutine` 标记表示该异步函数使用 Kotlin 协程执行。`rotate` 和 `flipX` 返回的是共享对象本身（通过 `apply` 函数），因此支持链式调用。

### iOS 端实现（Swift）

在 iOS 端，使用来自 `ExpoModulesCore` 的 `SharedObject` 基类，在内存中管理 `UIImage` 实例。

```swift
import ExpoModulesCore
import UIKit

// SharedRef 用于将 UIImage 引用安全传递给 JS 端
final class ImageRef: SharedRef<UIImage> {}

// SimpleImageContext 是共享对象，在内存中持有一个 UIImage 实例
final class SimpleImageContext: SharedObject {
  private var current: UIImage

  init(path: String) throws {
    guard let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
          let image = UIImage(data: data) else {
      throw Exceptions.InvalidArgument()
    }
    self.current = image
    super.init()
  }

  // 旋转操作：直接在内存中的图像上执行
  func rotate(by degrees: Double) {
    current = current.rotated(degrees: degrees)
  }

  // 水平翻转操作
  func flipX() {
    current = current.withHorizontallyFlippedOrientation()
  }

  // 渲染：返回一个 SharedRef，可传递给 UI 组件
  func render() -> ImageRef {
    return ImageRef(current)
  }
}
```

模块定义部分，映射异步创建函数和同步修改方法：

```swift
public final class SimpleImageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SimpleImageModule")

    // 异步函数：从文件路径创建共享对象上下文
    AsyncFunction("createContextAsync") { (path: String) -> SimpleImageContext in
      return try SimpleImageContext(path: path)
    }

    // Class 定义：将共享对象的方法暴露给 JS 端
    Class("Context", SimpleImageContext.self) {
      Function("rotate") { (ctx, degrees: Double) -> SimpleImageContext in
        ctx.rotate(by: degrees)
        return ctx
      }

      Function("flipX") { (ctx: SimpleImageContext) -> SimpleImageContext in
        ctx.flipX()
        return ctx
      }

      AsyncFunction("renderAsync") { (ctx: SimpleImageContext) -> ImageRef in
        return ctx.render()
      }
    }
  }
}
```

> **注意**：在 Swift 中，`Function` 的闭包需要显式返回 `SimpleImageContext`，以支持 JS 端的链式调用。这与 Kotlin 端使用 `apply` 自动返回 `this` 的方式略有不同。

### 前端使用（TypeScript/React）

前端组件可以直接消费这些原生实例。一个 React 组件可以选择文件、初始化上下文、链式调用修改方法，并将结果引用传递给图片查看器。

```tsx
import { useState } from 'react';
import { Button } from 'react-native';
import { Image } from 'expo-image';
import type { SharedRef } from 'expo';
import SimpleImageModule from 'simple-image-module'; // 原生自定义模块

import { pickImageAsync } from './pickImage'; // 自定义 TypeScript 函数

export function SharedImageExample() {
  const [context, setContext] = useState(null);
  const [result, setResult] = useState<SharedRef<'image'> | null>(null);

  const load = async () => {
    const uri = await pickImageAsync();
    if (!uri) {
      return;
    }

    // 创建原生上下文——图片在此步骤中被解码到内存
    const ctx = await SimpleImageModule.createContextAsync(uri);

    setContext(ctx);
    // 渲染为 SharedRef，可直接传递给 <Image> 组件
    setResult(await ctx.renderAsync());
  };

  const rotateAndFlip = async () => {
    if (!context) {
      return;
    }

    // 链式调用：旋转 90° + 水平翻转 + 渲染
    // 所有操作都在原生内存中完成，无需返回磁盘
    setResult(await context.rotate(90).flipX().renderAsync());
  };

  return (
    <>
      <Button title="Pick image" onPress={load} />
      <Button title="Rotate 90° + flip X" onPress={rotateAndFlip} disabled={!context} />
      {result && <Image source={result} style={{ width: 200, height: 200 }} />}
    </>
  );
}
```

图片选择器函数仅返回标准的文件 URI，将 URI 到共享对象的转换交由原生模块处理：

```tsx
import * as ImagePicker from 'expo-image-picker';

export async function pickImageAsync() {
  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 1,
    allowsMultipleSelection: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  // 此时我们拿到的仍然是一个磁盘 URI。
  // 原生模块会将其"提升"为共享对象。
  return result.assets[0].uri;
}
```

> **基于经验建议**：在前端代码中，`SharedRef<'image'>` 类型中的 `'image'` 是一个类型标签（type tag），用于标识引用的资源类型。确保你的 TypeScript 类型声明与实际原生模块返回的 `SharedRef` 类型匹配，否则 `expo-image` 等组件可能无法正确识别。

---

## 使用共享对象的官方库

以下 Expo 官方 SDK 包已经采用了共享对象架构：

| 库名 | 用途 |
|------|------|
| **expo-image** | 保持已解码的图像操作存活，在模块之间传递引用时无需重新解码 |
| **expo-image-manipulator** | 处理异步队列，向 JS 端暴露简洁的接口 |
| **expo-sqlite** | 在多次调用之间保持数据库连接和预处理语句句柄 |
| **expo/fetch** | 管理流式传输和请求取消的生命周期 |

> **基于文档内容推导**：从上述官方库的使用场景可以看出，共享对象特别适合以下三类场景：(1) 需要跨模块共享重量级原生资源；(2) 需要在多次调用之间保持有状态的原生句柄；(3) 需要管理具有复杂生命周期的原生操作（如流式传输）。

---

## 优化优势总结

采用共享对象架构带来的核心优势：

- **最小化磁盘读取**：只需一次初始读取，后续操作全在内存中完成
- **单次解码**：避免了重复的高开销解码过程
- **降低内存占用**：多份 JS 引用共享同一份原生实例
- **加速内存内修改**：变换操作直接在原生位图上执行，无需序列化/反序列化
- **防止 UI 卡顿**：减少主线程阻塞，渲染更流畅

---

## Class 定义的 DSL 参考

除了标准的 `Function` 和 `AsyncFunction`，`Class()` 代码块还支持以下结构化元素：

### Constructor（构造函数）

允许 JS 端通过 `new` 关键字直接实例化共享对象。

**Swift：**

```swift
Class(MySharedObject.self) {
  Constructor { (date: Date) in
    // 初始化逻辑
    ...
  }
}
```

**Kotlin：**

```kotlin
Class(MySharedObject::class) {
  Constructor { date: Date ->
    // 初始化逻辑
    ...
  }
}
```

> **注意**：通过 `Constructor` 创建的对象会自动被 Expo Modules 框架管理引用计数和内存回收。

### StaticFunction（静态同步函数）

绑定在类原型上（而非实例上）的同步方法。调用时不会接收实例上下文。

**Swift：**

```swift
StaticFunction("myStaticFunction") { in
  ...
}
```

**Kotlin：**

```kotlin
StaticFunction("myStaticFunction") { ->
  ...
}
```

### StaticAsyncFunction（静态异步函数）

类级别的异步方法，返回 Promise。

**Swift：**

```swift
StaticAsyncFunction("myStaticAsyncFunction") { in
  ...
}
```

**Kotlin：**

```kotlin
StaticAsyncFunction("myStaticAsyncFunction") { ->
  ...
}
```

### Property（属性）

在实例上暴露计算属性或可读写属性。支持只读属性和读写属性两种模式。

**Swift：**

```swift
Class(VideoPlayer.self) {
  // 只读属性
  Property("isPlaying") { (player: VideoPlayer) -> Bool in
    return player.isPlaying
  }

  // 读写属性
  Property("volume")
    .get { (player: VideoPlayer) -> Float in
      return player.volume
    }
    .set { (player: VideoPlayer, volume: Float) in
      player.volume = volume
    }
}
```

**Kotlin：**

```kotlin
Class(VideoPlayer::class) {
  // 只读属性
  Property("isPlaying") { player: VideoPlayer ->
    return@Property player.isPlaying
  }

  // 读写属性
  Property("volume")
    .get { player: VideoPlayer ->
      return@get player.volume
    }
    .set { player: VideoPlayer, volume: Float ->
      player.volume = volume
    }
}
```

**JavaScript 端使用方式：**

```js
const player = new VideoPlayer(source);

// 读取只读属性
console.log(player.isPlaying); // false

// 读写属性
player.volume = 0.5;
console.log(player.volume); // 0.5
```

> **基于经验建议**：在 Kotlin 的 `Property` 中，注意使用 `return@Property` 和 `return@get` 等标签化的返回语句，因为 Kotlin 的 lambda 默认不支持裸 `return`。遗漏标签会导致编译错误。

---

## DSL 元素速查表

| DSL 元素 | 作用 | 是否需要实例 | 同步/异步 |
|----------|------|:------------:|:---------:|
| `Function` | 绑定实例同步方法 | 是 | 同步 |
| `AsyncFunction` | 绑定实例异步方法 | 是 | 异步 |
| `Constructor` | JS 端 `new` 实例化 | 否（创建实例） | 同步 |
| `StaticFunction` | 类级别同步方法 | 否 | 同步 |
| `StaticAsyncFunction` | 类级别异步方法 | 否 | 异步 |
| `Property` | 暴露实例属性 | 是 | 同步 |

---

## 内存管理注意事项

- 共享对象的生命周期由 **引用计数** 自动管理
- 当 JS 端的所有引用被垃圾回收后，原生端的 `sharedObjectDidRelease()` 会被自动调用
- 在 `sharedObjectDidRelease()` 中应释放所有原生资源（如回收位图内存、关闭文件句柄等）
- **不要**在共享对象中持有对 JS 回调的强引用，否则可能导致循环引用和内存泄漏

> **基于经验建议**：如果你在 Android 端遇到 `sharedObjectDidRelease()` 未被调用的情况，检查是否存在 JS 端的闭包或全局变量仍然持有该共享对象的引用。在 iOS 端，Swift 的自动引用计数（ARC）通常能更可靠地触发释放，但仍需注意 JS 侧的引用清理。

---

## 延伸阅读

官方 Expo 博客讨论了共享对象架构对 API 设计和实际性能的影响，建议进一步阅读以深入理解这一模式的最佳实践。

---

## 文档导航

- **上一页**：[autolinking](./114__autolinking.md)
- **下一页**：[module config](./116__module-config.md)
