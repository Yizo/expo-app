# Expo Modules API 参考指南

> 原始文档地址：https://docs.expo.dev/modules/module-api/

---

## 概述

Expo Modules API 是一个原生接口层，充当 JSI（JavaScript Interface）及其他底层原语的封装器。它使用 **Swift**（iOS）和 **Kotlin**（Android）开发，为开发者提供友好的、跨平台一致的原生模块开发体验。

> **关键术语说明（面向初学者）：**
> - **JSI（JavaScript Interface）**：React Native 的底层通信机制，允许 JavaScript 直接调用 C++ 原生代码，无需异步桥接。
> - **原生模块（Native Module）**：用平台原生语言（Swift/Kotlin）编写的代码模块，可被 JavaScript 层调用。
> - **DSL（领域特定语言）**：这里指 Expo Modules API 提供的一套声明式语法，用于定义模块的功能和行为。

---

## 模块定义组件

每个模块类都需要实现一个 `definition` 函数。该定义使用 DSL 元素来描述模块的行为和能力。

### Name（名称）

为模块设置 JavaScript 交互时使用的标识符。接受一个字符串参数。虽然可以从类名自动推导，但**建议显式声明**以提高可读性。

```swift
Name("MyModuleName")
```

> **基于经验建议**：始终显式指定模块名称，避免依赖类名推导。这在重构代码或跨平台命名不一致时能避免难以排查的 bug。

### Constant（常量）

在 JavaScript 对象上创建一个**静态属性**。该值在首次访问时计算并缓存，后续调用直接返回缓存值。

**Swift：**
```swift
Constant("PI") {
  Double.pi
}
```

**Kotlin：**
```kotlin
Constant("PI") {
  Math.PI
}
```

### Constants（多常量）【已弃用】

> **⚠️ 已弃用**：请改用上面的 `Constant` 代替。

使用字典或闭包批量分配多个静态属性。

**Swift：**
```swift
// 从字典创建
Constants([
  "PI": Double.pi
])

// 或通过闭包返回
Constants {
  return [
    "PI": Double.pi
  ]
}
```

**Kotlin：**
```kotlin
// 作为参数传入
Constants(
  "PI" to kotlin.math.PI
)

// 或通过闭包返回
Constants {
  return@Constants mapOf(
    "PI" to kotlin.math.PI
  )
}
```

### Function（同步函数）

将一个**同步**原生方法导出给 JavaScript。执行在同一线程上进行，会**阻塞脚本执行**直到原生操作完成。

#### 参数说明

- **name**：字符串标识符，用于 JavaScript 端调用。
- **body**：调用时执行的闭包。

> **限制**：由于 Swift 和 Kotlin 的泛型约束，最多接受 **8 个参数**，每种参数数量需要单独的实现。有效的参数类型请参阅下方"参数类型"章节。

**Swift：**
```swift
Function("mySyncFunction") { (message: String) in
  return message
}
```

**Kotlin：**
```kotlin
Function("mySyncFunction") { message: String ->
  return@Function message
}
```

**JavaScript 端调用：**
```js
import { requireNativeModule } from 'expo-modules-core';

// 假设模块命名为 "MyModule"
const MyModule = requireNativeModule('MyModule');

function getMessage() {
  return MyModule.mySyncFunction('bar');
}
```

> **基于经验建议**：同步函数会阻塞 JavaScript 线程，仅适用于计算量小、不涉及 I/O 的操作。对于耗时操作，请使用 `AsyncFunction`。

### AsyncFunction（异步函数）

创建一个返回 `Promise` 的 JavaScript 方法。其原生实现**默认在后台线程**上运行，与 JavaScript 运行时线程分离。

#### 参数说明

- **name**：字符串标识符，用于 JavaScript 端调用。
- **body**：调用时执行的闭包。

当最后一个参数为 `Promise` 类型时，函数会等待其 resolve 或 reject 后再向 JavaScript 返回结果。否则，函数会立即以返回值 resolve，或在异常时 reject。最多支持 **8 个参数**（含 Promise）。

> **基于经验建议**：对于 I/O 操作、需要在 UI 线程执行的任务，或可能阻塞 JavaScript 线程的长时间运行任务，优先使用 `AsyncFunction` 而非同步 `Function`。

**Swift：**
```swift
AsyncFunction("myAsyncFunction") { (message: String) in
  return message
}

// 或者使用 Promise 参数

AsyncFunction("myAsyncFunction") { (message: String, promise: Promise) in
  promise.resolve(message)
}
```

**Kotlin：**
```kotlin
AsyncFunction("myAsyncFunction") { message: String ->
  return@AsyncFunction message
}

// 或者使用 Promise 参数
// 注意：请确保从 `expo.modules.kotlin` 导入 `Promise`，而不是 `expo.modules.core`
AsyncFunction("myAsyncFunction") { message: String, promise: Promise ->
  promise.resolve(message)
}
```

**JavaScript 端调用：**
```js
import { requireNativeModule } from 'expo-modules-core';

// 假设模块命名为 "MyModule"
const MyModule = requireNativeModule('MyModule');

async function getMessageAsync() {
  return await MyModule.myAsyncFunction('bar');
}
```

#### 更改执行队列

可以通过追加 `.runOnQueue` 来更改异步函数的执行队列。

**Swift：**
```swift
AsyncFunction("myAsyncFunction") { (message: String) in
  return message
}.runOnQueue(.main)
```

**Kotlin：**
```kotlin
AsyncFunction("myAsyncFunction") { message: String ->
  return@AsyncFunction message
}.runOnQueue(Queues.MAIN)
```

#### Kotlin 协程支持

在 Android 上，异步函数支持使用 `Coroutine` 代码块后的中缀（infix）语法来接受可挂起（suspendable）的函数体。

> **关键术语说明**：
> - **协程（Coroutine）**：Kotlin 的轻量级并发机制，允许以同步风格编写异步代码。
> - **可挂起函数（Suspendable Function）**：使用 `suspend` 关键字标记的函数，可以在不阻塞线程的情况下暂停执行。

可挂起版本**不能**接受 `Promise` 参数。它们依赖挂起机制实现异步执行，以代码块的返回值 resolve，或在出错时 reject，最多支持 8 个参数。

这些协程默认在模块的协程作用域（coroutine scope）上调度。嵌套的可挂起调用共享此作用域，当模块被释放时，未完成的任务会被自动取消。

```kotlin
AsyncFunction("suspendFunction") Coroutine { message: String ->
  // 你可以在这里调用其他可挂起函数
  // 例如，使用 `kotlinx.coroutines.delay` 延迟 resolve 底层的 Promise
  delay(5000)
  return@Coroutine message
}
```

### Property（属性）

向 JavaScript 模块对象添加属性，行为与 `Object.defineProperty` 类似。

#### 只读属性

需要两个参数：
- **name**：字符串标识符，供 JavaScript 端使用。
- **getter**：访问属性时执行的闭包。

**Swift：**
```swift
Property("foo") {
  return "bar"
}
```

**Kotlin：**
```kotlin
Property("foo") {
  return@Property "bar"
}
```

#### 可读写属性

需要同时提供 getter 和 setter 闭包：
- **name**：字符串标识符。
- **getter**：访问闭包。
- **setter**：修改闭包，接收新值作为参数。

**Swift：**
```swift
Property("foo")
  .get { return "bar" }
  .set { (newValue: String) in
    // 对新值进行处理
  }
```

**Kotlin：**
```kotlin
Property("foo")
  .get { return@get "bar" }
  .set { newValue: String ->
    // 对新值进行处理
  }
```

**JavaScript 端使用：**
```js
import { requireNativeModule } from 'expo-modules-core';

// 假设模块命名为 "MyModule"
const MyModule = requireNativeModule('MyModule');

// 获取属性值
MyModule.foo;

// 设置新值
MyModule.foo = 'foobar';
```

### View（视图）

允许模块作为原生 UI 组件运行。`View` 块内可包含的有效子组件包括 `Prop`、`Events`、`GroupView` 和 `AsyncFunction`。

绑定到视图的异步方法会附加到 React ref 上，自动将原生视图实例作为第一个参数，并在 **UI 线程**上执行。

#### 参数说明

- **viewType**：原生视图类。Android 要求继承自 `ExpoView`；iOS 对此为可选。
- **definition**：视图的构建器闭包。

**Swift：**
```swift
View(UITextView.self) {
  Prop("text") { ...  }

  AsyncFunction("focus") { (view: UITextView) in
    view.becomeFirstResponder()
  }
}
```

**Kotlin：**
```kotlin
View(TextView::class) {
  Prop("text") { ...  }

  AsyncFunction("focus") { view: TextView ->
    view.requestFocus()
  }
}
```

> **注意**：SwiftUI 渲染支持即将推出。目前需要将 SwiftUI 包装在 `UIHostingController` 中，并将其内容添加到 UIKit 视图。

---

## 事件监听

### Events（事件声明）

指定可传输到 JavaScript 的事件标识符。在 `View` 块内使用时，它建立回调名称。

**Swift：**
```swift
Events("onCameraReady", "onPictureSaved", "onBarCodeScanned")
```

**Kotlin：**
```kotlin
Events("onCameraReady", "onPictureSaved", "onBarCodeScanned")
```

事件的具体发送方式请参阅下方"发送事件"指南章节。

### OnStartObserving（开始监听）

当某个事件的**第一个**监听器被添加时触发。可提供事件名称以限制仅在该特定事件被监听时触发。

**Swift：**
```swift
// 当 "onURLReceived" 的监听器被添加时调用
OnStartObserving("onURLReceived") {
  ... 
}
```

**Kotlin：**
```kotlin
// 当 "onURLReceived" 的监听器被添加时调用
OnStartObserving("onURLReceived") {
  ... 
}
```

### OnStopObserving（停止监听）

当指定事件的**所有**监听器都被移除时执行。需要提供事件名称以确定作用域。

**Swift：**
```swift
// 当 "onURLReceived" 的所有监听器被移除时调用
OnStopObserving("onURLReceived") {
  ... 
}
```

**Kotlin：**
```kotlin
// 当 "onURLReceived" 的所有监听器被移除时调用
OnStopObserving("onURLReceived") {
  ... 
}
```

---

## 生命周期监听器

### OnCreate（模块创建）

在模块初始化完成后**立即**触发。**建议优先使用此回调而非类构造函数**来执行初始化设置任务。

> **基于经验建议**：在 `OnCreate` 中执行初始化操作比在构造函数中更安全，因为此时模块的 `appContext` 已完全可用。

### OnDestroy（模块销毁）

在模块被释放前调用。**建议优先使用此回调而非类析构函数**。

### OnAppContextDestroys（应用上下文销毁）

当父级应用上下文（App Context）被释放时触发。

### OnAppEntersForeground（应用进入前台）

**支持平台：iOS**

当应用切换到前台时触发。Android 开发者请使用对应的 Activity 生命周期回调。

### OnAppEntersBackground（应用进入后台）

**支持平台：iOS**

当应用进入后台时执行。Android 开发者请使用对应的 Activity 生命周期回调。

### OnAppBecomesActive（应用变为活跃）

**支持平台：iOS**

当应用在进入前台后重新变为活跃状态时运行。Android 开发者请使用对应的 Activity 生命周期回调。

### OnActivityEntersForeground（Activity 进入前台）

**支持平台：Android**

在 Activity 恢复（resume）后立即触发。iOS 开发者请使用对应的应用生命周期回调。

### OnActivityEntersBackground（Activity 进入后台）

**支持平台：Android**

在 Activity 暂停（pause）后立即触发。iOS 开发者请使用对应的应用生命周期回调。

### OnActivityDestroys（Activity 销毁）

**支持平台：Android**

当承载 JavaScript 上下文的 Activity 即将被销毁时调用。iOS 开发者请使用对应的应用生命周期回调。

### OnActivityResult（Activity 结果）

**支持平台：Android**

当通过 `startActivityForResult` 启动的 Activity 返回结果时执行。

#### 参数说明

- **activity**：接收结果的 Android Activity。
- **payload**：数据对象，包含：
  - **requestCode**：整数，标识请求来源。
  - **resultCode**：整数，由子 Activity 返回。
  - **data**：可选的 Intent，携带结果数据。

```kotlin
AsyncFunction('someFunc') {
  ... 
  activity.startActivityForResult(someIntent, SOME_REQUEST_CODE)
}

OnActivityResult { activity, payload ->
  ... 
}
```

### OnNewIntent（新 Intent）

**支持平台：Android**

当接收到新的 Intent 时触发，例如深度链接（Deep Link）。

#### 参数说明

- **intent**：传入的 Intent 对象。

```kotlin
OnNewIntent { intent ->
  val data = intent.data
  // 处理传入的 Intent
}
```

### OnUserLeavesActivity（用户离开 Activity）

**支持平台：Android**

当用户**主动**将 Activity 置于后台时运行，不包括系统级中断（如来电）。

```kotlin
OnUserLeavesActivity {
  // 你的实现代码
}
```

### RegisterActivityContracts（注册 Activity 合约）

**支持平台：Android**

设置类型安全的 Activity 结果合约，是 `startActivityForResult` 的**现代替代方案**。在此块中使用 `registerForActivityResult`。

```kotlin
class ImagePickerModule : Module() {
  private lateinit var cameraLauncher: ActivityResultLauncher<CameraContractOptions>
  private lateinit var imageLibraryLauncher: ActivityResultLauncher<ImageLibraryContractOptions>

  override fun definition() = ModuleDefinition {
    Name("ImagePicker")

    RegisterActivityContracts {
      cameraLauncher = registerForActivityResult(
        CameraContract(this@ImagePickerModule)
      ) { input, result ->
        handleResult(result, input.options)
      }

      imageLibraryLauncher = registerForActivityResult(
        ImageLibraryContract(this@ImagePickerModule)
      ) { input, result ->
        handleResult(result, input.options)
      }
    }

    AsyncFunction("launchCameraAsync") { options: PickerOptions ->
      cameraLauncher.launch(CameraContractOptions(options))
    }
  }
}
```

---

## 视图定义组件

以下 DSL 元素用于定义视图行为，**仅可在 `View` 闭包内使用**。

### Name（视图名称）

为视图分配 JavaScript 端的标识符。建议显式声明字符串，而非依赖类名推断。

```swift
Name("MyViewName")
```

### Prop（属性）

为特定视图属性建立 setter。

#### 参数说明

- **name**：属性标识符。
- **defaultValue**：可选，当输入为 null 时的默认值。
- **setter**：重新渲染时调用的闭包。

**Swift：**
```swift
Prop("background") { (view: UIView, color: UIColor) in
  view.backgroundColor = color
}
```

**Kotlin：**
```kotlin
Prop("background") { view: View, @ColorInt color: Int ->
  view.setBackgroundColor(color)
}
```

**带默认值的用法：**

**Swift：**
```swift
Prop("background", UIColor.black) { (view: UIView, color: UIColor) in
  view.backgroundColor = color
}
```

**Kotlin：**
```kotlin
Prop("background", Color.BLACK) { view: View, @ColorInt color: Int ->
  view.setBackgroundColor(color)
}
```

> **⚠️ 限制**：不支持函数类型的属性（Function-type properties）。

### PropGroup（属性组）

**支持平台：Android**

将多个共享相同 setter 逻辑的属性进行分组。支持基于 Pair 和基于字符串的两种重载形式。

```kotlin
// 基于 Pair：将每个属性名映射到自定义值
PropGroup(
  "borderTopColor" to LogicalEdge.TOP,
  "borderBottomColor" to LogicalEdge.BOTTOM,
  "borderLeftColor" to LogicalEdge.LEFT,
  "borderRightColor" to LogicalEdge.RIGHT
) { view: View, edge: LogicalEdge, color: Int? ->
  BackgroundStyleApplicator.setBorderColor(view, edge, color)
}

// 基于字符串：使用位置索引
PropGroup(
  "borderWidth", "borderLeftWidth", "borderRightWidth",
  "borderTopWidth", "borderBottomWidth"
) { view: View, index: Int, width: Float? ->
  val edge = LogicalEdge.entries[index]
  BackgroundStyleApplicator.setBorderWidth(view, edge, width ?: Float.NaN)
}
```

> **基于文档内容推导**：`PropGroup` 主要用于内部 CSS 装饰器场景。标准模块应优先使用单独的 `Prop` 定义，除非确实需要共享 setter 逻辑。

### OnViewDidUpdateProps（视图属性更新完成）

在视图完成所有属性更新后触发。

**Swift：**
```swift
OnViewDidUpdateProps { view: MyView in
  ... 
}
```

**Kotlin：**
```kotlin
OnViewDidUpdateProps { view: MyView ->
  ... 
}
```

### OnViewDestroys（视图销毁）

**支持平台：Android**

当 React Native 不再使用该视图时触发。iOS 用户请使用原生视图的析构函数。

```kotlin
View(MyView::class) {
  OnViewDestroys { view: MyView ->
    ... 
  }
}
```

### AsyncFunction（视图异步函数）

将方法附加到视图 ref 上，用于直接操作原生视图。这些方法**始终在主队列上运行**，并接受视图实例作为第一个参数。

**Swift：**
```swift
View(MyView.self) {
  AsyncFunction("myAsyncFunction") { (view: MyView, message: String) in
    view.displayMessage(message)
  }
}
```

**Kotlin：**
```kotlin
View(MyView::class) {
  AsyncFunction("myAsyncFunction") { view: MyView, message: String ->
    view.displayMessage(message);
  }
}
```

**JavaScript 端调用：**
```js
const MyNativeView = requireNativeViewManager('MyView');

function MyComponent() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    ref.current?.myAsyncFunction();
  }, [ref]);

  return <MyNativeView ref={ref} />;
}
```

---

## 视图组（View Groups）

### GroupView（组视图）

**支持平台：Android**

允许视图充当容器。要求原生类继承自 `ViewGroup`。可包含子视图管理组件。

```kotlin
GroupView<ViewGroup> {
  AddChildView { parent, child, index -> ... }
}
```

### AddChildView（添加子视图）

**支持平台：Android**

指定将子视图插入组中的逻辑。

```kotlin
AddChildView { parent, child: View, index ->
  parent.addView(child, index)
}
```

### GetChildCount（获取子视图数量）

**支持平台：Android**

返回子视图的总数。

```kotlin
GetChildCount { parent ->
  return@GetChildCount parent.childCount
}
```

### GetChildViewAt（按索引获取子视图）

**支持平台：Android**

获取指定索引处的子视图。

```kotlin
GetChildViewAt { parent, index ->
  parent.getChildAt(index)
}
```

### RemoveChildView（移除子视图）

**支持平台：Android**

从组中移除指定的子视图。

```kotlin
RemoveChildView { parent, child: View ->
  parent.removeView(child)
}
```

### RemoveChildViewAt（按索引移除子视图）

**支持平台：Android**

删除指定索引处的子视图。

```kotlin
RemoveChildViewAt { parent, index ->
  parent.removeViewAt(index)
}
```

---

## 参数类型

虽然只有基本类型和可序列化的数据能在运行时之间原生传输，但 API 提供了多种协议来方便、类型安全地处理复杂数据结构，并自动进行验证。

### 基础类型（Primitives）

函数和属性 setter 支持标准基础类型，包括数组、Map 和可选类型。

- **Swift**：`Bool`、`Int`、`Int8`、`Int16`、`Int32`、`Int64`、`UInt`、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Float32`、`Double`、`String`
- **Kotlin**：`Boolean`、`Int`、`Long`、`Float`、`Double`、`String`、`Pair`

### 可转换类型（Convertibles）

这些是可以从特定 JavaScript 数据格式实例化的原生类型。例如，`CGPoint` 可以从一个包含两个数字的数组或一个带有 x/y 坐标的对象创建。

#### Convertible 协议

**支持平台：iOS**

一个 Swift 协议，要求实现一个静态转换方法，将动态 JavaScript 值转换为原生实例，无效输入时抛出异常。

**`convert(value, appContext)` 方法：**
- **value**：动态 JavaScript 输入。
- **appContext**：当前 Expo 应用上下文。
- **返回值**：Self 实例。

```swift
import ExpoModulesCore

extension CMTime: @retroactive Convertible {
  public static func convert(from value: Any?, appContext: AppContext) throws -> CMTime {
    if let seconds = value as? Double {
      return CMTime(seconds: seconds, preferredTimescale: .max)
    }
    throw Conversions.ConvertingException<CMTime>(value)
  }
}
```

#### ModuleConverters

**支持平台：Android**

由于 Kotlin 不支持协议扩展，需要通过重写 `converters()` 方法，使用构建器通过 `.from<SourceType> { }` 链注册自定义类型转换。

```kotlin
class MyModule : Module() {
  override fun converters() = ModuleConverters {
    TypeConverter(CustomType::class)
      .from { number: Int ->
        CustomType.fromInt(number)
      }
      .from { string: String ->
        CustomType.parse(string)
      }
  }

  override fun definition() = ModuleDefinition {
    Name("MyModule")

    // CustomType 现在可以作为参数类型使用
    Function("process") { value: CustomType ->
      value.doSomething()
    }
  }
}
```

### 内置可转换类型

常用系统框架类型已预配置好转换规则。

**iOS 映射：**

| 原生类型 | JavaScript 来源 |
|---|---|
| `URL` | 字符串（无 scheme 时假定为文件 URL） |
| `CGFloat` | 数字 |
| `CGPoint`、`CGSize`、`CGVector`、`CGRect` | 带有特定数字键（x、y、width、height、dx、dy 等）的对象或数字数组 |
| `CGColor`、`UIColor` | 十六进制颜色码、CSS3/SVG 颜色名称或 "transparent" |
| `Data` | `Uint8Array`（SDK 50+） |

**Android 映射：**

| 原生类型 | JavaScript 来源 |
|---|---|
| `java.net.URL`、`Uri`、`URI` | 字符串（需有显式 scheme，不能有未编码的百分号） |
| `File`、`Path` | 文件路径字符串 |
| `Color` | 十六进制颜色码、CSS3/SVG 名称或 "transparent" |
| `Pair` | 两元素数组 |
| `ByteArray` | `Uint8Array`（SDK 50+） |
| `BooleanArray` | 布尔数组 |
| 基础类型数组（`IntArray`、`FloatArray`、`LongArray`、`DoubleArray`） | 数字数组 |
| `Duration` | 数字（表示秒数，SDK 52+） |

### Records（记录）

Records 是一种类型安全的结构体，等价于字典或 Map，允许定义带有默认值的类型化字段，更好地表示 JavaScript 对象。

**Swift：**
```swift
struct FileReadOptions: Record {
  @Field
  var encoding: String = "utf8"

  @Field
  var position: Int = 0

  @Field
  var length: Int?
}

// 现在这个 Record 可以作为函数或视图 Prop setter 的参数
Function("readFile") { (path: String, options: FileReadOptions) -> String in
  // 使用给定的 `options` 读取文件
}
```

**Kotlin：**
```kotlin
class FileReadOptions : Record {
  @Field
  val encoding: String = "utf8"

  @Field
  val position: Int = 0

  @Field
  val length: Int? = null
}

// 现在这个 Record 可以作为函数或视图 Prop setter 的参数
Function("readFile") { path: String, options: FileReadOptions ->
  // 使用给定的 `options` 读取文件
}
```

### Formatter（格式化器）

> **⚠️ 此功能为实验性功能。**

修改 `Record` 在返回给原生端时的序列化方式。支持两种操作：
- **`map`**：转换值
- **`skip`**：排除属性

#### 基本用法 — 跳过属性

**Swift：**
```swift
struct UserInfo: Record {
  @Field var id: Int = 0
  @Field var email: String = ""
  @Field var password: String = ""
}

Function("getUser") {
  let user = UserInfo(id: 1, email: "user@example.com", password: "secret123")

  // 返回用户信息但不暴露密码
  return user.format { formatter in
    formatter.property("password", keyPath: \.password).skip()
  }
}
```

**Kotlin：**
```kotlin
class UserInfo(
  @Field val id: Int = 0,
  @Field val email: String = "",
  @Field val password: String = ""
) : Record

Function("getUser") {
  val user = UserInfo(id = 1, email = "user@example.com", password = "secret123")

  // 返回用户信息但不暴露密码
  formatter {
    property(UserInfo::password).skip()
  }.format(user)
}
```

**JavaScript 端结果：**
```js
const user = MyModule.getUser();
console.log(user);
// 输出: { id: 1, email: "user@example.com" }
// 注意: password 不在对象中
```

#### 转换值

**Swift：**
```swift
struct Product: Record {
  @Field var name: String = ""
  @Field var price: Double = 0.0
}

Function("getProduct") {
  let product = Product(name: "Widget", price: 19.99)

  return product.format { formatter in
    // 转换价格以包含货币符号
    formatter.property("price", keyPath: \.price).map { value in
      "$\(String(format: "%.2f", value))"
    }
  }
}
```

**Kotlin：**
```kotlin
class Product(
  @Field val name: String = "",
  @Field val price: Double = 0.0
) : Record

Function("getProduct") {
  val product = Product(name = "Widget", price = 19.99)

  formatter {
    // 转换价格以包含货币符号
    property(Product::price).map { value ->
      "${"$"}${String.format("%.2f", value)}"
    }
  }.format(product)
}
```

#### 条件排除

**Swift：**
```swift
struct Settings: Record {
  @Field var theme: String = "light"
  @Field var debugMode: Bool = false
  @Field var apiKey: String? = nil
}

Function("getSettings") {
  let settings = Settings(theme: "dark", debugMode: true, apiKey: "secret")

  return settings.format { formatter in
    // 当 apiKey 为 nil 时跳过
    formatter.property("apiKey", keyPath: \.apiKey).skip { value in
      value == nil
    }
  }
}
```

**Kotlin：**
```kotlin
class Settings(
  @Field val theme: String = "light",
  @Field val debugMode: Boolean = false,
  @Field val apiKey: String? = null
) : Record

Function("getSettings") {
  val settings = Settings(theme = "dark", debugMode: true, apiKey = "secret")

  formatter {
    // 当 apiKey 为 null 时跳过
    property(Settings::apiKey).skip { value ->
      value == null
    }
  }.format(settings)
}
```

#### 链式操作

**Swift：**
```swift
struct Data: Record {
  @Field var value: Int? = nil
}

Function("getData") {
  let data = Data(value: nil)

  return data.format { formatter in
    formatter.property("value", keyPath: \.value)
      .map { $0 ?? 0 }  // 如果为 nil 则默认为 0
      .map { $0 * 2 }   // 将值翻倍
  }
}
```

**Kotlin：**
```kotlin
class Data(
  @Field val value: Int? = null
) : Record

Function("getData") {
  val data = Data(value = null)

  formatter {
    property(Data::value)
      .map { it ?: 0 }  // 如果为 null 则默认为 0
      .map { it * 2 }   // 将值翻倍
  }.format(data)
}
```

### Enums（枚举）

通过遵循 `Enumerable` 协议，将值限制为特定的基础类型。

**Swift：**
```swift
enum FileEncoding: String, Enumerable {
  case utf8
  case base64
}

struct FileReadOptions: Record {
  @Field
  var encoding: FileEncoding = .utf8
  ... 
}
```

**Kotlin：**
```kotlin
// 注意：构造函数必须有一个名为 value 的参数
enum class FileEncoding(val value: String) : Enumerable {
  utf8("utf8"),
  base64("base64")
}

class FileReadOptions : Record {
  @Field
  val encoding: FileEncoding = FileEncoding.utf8
  ... 
}
```

### Eithers（联合类型）

用于可能是多种类型之一的值的容器。通过 `Either`、`EitherOfThree` 和 `EitherOfFour` 最多支持四种子类型。

**Swift：**
```swift
Function("foo") { (bar: Either<String, Int>) in
  if let bar: String = bar.get() {
    // `bar` 是 String 类型
  }
  if let bar: Int = bar.get() {
    // `bar` 是 Int 类型
  }
}
```

**Kotlin：**
```kotlin
Function("foo") { bar: Either<String, Int> ->
  bar.get(String::class).let {
    // `it` 是 String 类型
  }
  bar.get(Int::class).let {
    // `it` 是 Int 类型
  }
}
```

### ValueOrUndefined（值或 Undefined）

> **⚠️ 此功能为实验性功能。**

区分 JavaScript 的 `undefined` 与实际值，克服了原生端将 `undefined` 转换为 `null` 的限制。

#### 属性

- **isUndefined**：返回布尔值，指示输入是否为 undefined。
- **optional**：返回解包后的值或 null。

**Swift：**
```swift
Function("configure") { (timeout: ValueOrUndefined<Int>) in
  if timeout.isUndefined {
    // 参数未提供，使用默认行为
  } else if let value = timeout.optional {
    // 参数已提供且有值
  }
}
```

**Kotlin：**
```kotlin
Function("configure") { timeout: ValueOrUndefined<Int> ->
  if (timeout.isUndefined) {
    // 参数未提供，使用默认行为
  } else {
    timeout.optional?.let { value ->
      // 参数已提供且有值
    }
  }
}
```

区分三种状态可以分别处理：undefined（未提供）、显式 null 和实际值。

### JavaScript 值类型

`JavaScriptValue` 持有任意 JavaScript 可表示的数据，**绕过类型验证**。**仅限于同步函数**中使用，以防止跨线程崩溃。

相关类型包括：
- **`JavaScriptObject`**：JavaScript 对象引用
- **`JavaScriptFunction<ReturnType>`**：JavaScript 函数引用

**Swift：**
```swift
Function("mutateMe") { (value: JavaScriptValue) in
  if value.isObject() {
    let jsObject = value.getObject()
    jsObject.setProperty("expo", value: "modules")
  }
}

// 或者

Function("mutateMe") { (jsObject: JavaScriptObject) in
  jsObject.setProperty("expo", value: "modules")
}
```

**Kotlin：**
```kotlin
Function("mutateMe") { value: JavaScriptValue ->
  if (value.isObject()) {
    val jsObject = value.getObject()
    jsObject.setProperty("expo", "modules")
  }
}

// 或者

Function("mutateMe") { jsObject: JavaScriptObject ->
  jsObject.setProperty("expo", "modules")
}
```

> **基于经验建议**：`JavaScriptValue` 虽然灵活，但绕过了类型安全检查，应谨慎使用。在可能的情况下，优先使用 `Record` 或具体的可转换类型来获得编译时安全保障。

---

## 原生类

### Module（模块基类）

所有原生模块的基础类。

#### 属性

- **appContext**：返回 `AppContext` 实例，提供对应用上下文的访问。

#### 方法

- **sendEvent(eventName, payload)**：向 JavaScript 发送带有数据负载的命名事件。返回 void。

### AppContext（应用上下文）

与单个 Expo 应用实例交互的接口。

#### 属性

- **constants**：旧版注册表常量。
- **permissions**：旧版权限管理器。
- **activityProvider**：旧版 Activity 提供器。
- **reactContext**：React 应用上下文。
- **hasActiveReactInstance**：布尔值，检查是否有存活的 React Native 实例。
- **utilities**：旧版工具类。

### ExpoView（视图基类）

导出视图的必需基类。在 iOS 上，它继承自 `RCTView`，处理样式和无障碍功能。

#### 属性

- **appContext**：返回 `AppContext` 实例。

#### 扩展 ExpoView

自定义类必须继承此类以访问 `AppContext` 并与 JavaScript 通信。构造函数参数不可更改。

**Swift：**
```swift
class LinearGradientView: ExpoView {}

public class LinearGradientModule: Module {
  public func definition() -> ModuleDefinition {
    View(LinearGradientView.self) {
      ... 
    }
  }
}
```

**Kotlin：**
```kotlin
class LinearGradientView(
  context: Context,
  appContext: AppContext,
) : ExpoView(context, appContext)

class LinearGradientModule : Module() {
  override fun definition() = ModuleDefinition {
    View(LinearGradientView::class) {
      ... 
    }
  }
}
```

---

## 指南

### 发送事件

要通知 JavaScript 端关于系统事件，需要使用 `Events` 组件声明事件名称，然后在模块实例上调用 `sendEvent` 方法。

以下是实现剪贴板变化监听的完整示例：

**Swift：**
```swift
let CLIPBOARD_CHANGED_EVENT_NAME = "onClipboardChanged"

public class ClipboardModule: Module {
  public func definition() -> ModuleDefinition {
    Events(CLIPBOARD_CHANGED_EVENT_NAME)

    OnStartObserving {
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.clipboardChangedListener),
        name: UIPasteboard.changedNotification,
        object: nil
      )
    }

    OnStopObserving {
      NotificationCenter.default.removeObserver(
        self,
        name: UIPasteboard.changedNotification,
        object: nil
      )
    }
  }

  @objc
  private func clipboardChangedListener() {
    sendEvent(CLIPBOARD_CHANGED_EVENT_NAME, [
      "contentTypes": availableContentTypes()
    ])
  }
}
```

**Kotlin：**
```kotlin
const val CLIPBOARD_CHANGED_EVENT_NAME = "onClipboardChanged"

class ClipboardModule : Module() {
  override fun definition() = ModuleDefinition {
    Events(CLIPBOARD_CHANGED_EVENT_NAME)

    OnStartObserving {
      clipboardManager?.addPrimaryClipChangedListener(listener)
    }

    OnStopObserving {
      clipboardManager?.removePrimaryClipChangedListener(listener)
    }
  }

  private val clipboardManager: ClipboardManager?
    get() = appContext.reactContext?.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager

  private val listener = ClipboardManager.OnPrimaryClipChangedListener {
    clipboardManager?.primaryClipDescription?.let { clip ->
      this@ClipboardModule.sendEvent(
        CLIPBOARD_CHANGED_EVENT_NAME,
        bundleOf(
          "contentTypes" to availableContentTypes(clip)
        )
      )
    }
  }
}
```

**TypeScript 端订阅：**
```ts
import { requireNativeModule, NativeModule } from 'expo';

type ClipboardChangeEvent = {
  contentTypes: string[];
};

type ClipboardModuleEvents = {
  onClipboardChanged(event: ClipboardChangeEvent): void;
};

declare class ClipboardModule extends NativeModule<ClipboardModuleEvents> {}

const Clipboard = requireNativeModule<ClipboardModule>('Clipboard');

Clipboard.addListener('onClipboardChanged', (event: ClipboardChangeEvent) => {
  alert('Clipboard has changed');
});
```

> **基于经验建议**：在 JavaScript 端可以使用 `addListener`、`useEvent` 或 `useEventListener` 来订阅事件。在组件卸载时务必移除监听器，避免内存泄漏。

### 视图回调

对于视图特定的事件，需要在视图定义内通过 `Events` 声明名称，并在视图类中添加一个与事件名匹配的 `EventDispatcher` 属性。调用时传入数据字典/映射作为负载。

**Swift：**
```swift
class CameraViewModule: Module {
  public func definition() -> ModuleDefinition {
    View(CameraView.self) {
      Events(
        "onCameraReady"
      )
      ... 
    }
  }
}

class CameraView: ExpoView {
  let onCameraReady = EventDispatcher()

  func callOnCameraReady() {
    onCameraReady([
      "message": "Camera was mounted"
    ]);
  }
}
```

**Kotlin：**
```kotlin
class CameraViewModule : Module() {
  override fun definition() = ModuleDefinition {
    View(ExpoCameraView::class) {
      Events(
        "onCameraReady"
      )
      ... 
    }
  }
}

class CameraView(
  context: Context,
  appContext: AppContext
) : ExpoView(context, appContext) {
  val onCameraReady by EventDispatcher()

  fun callOnCameraReady() {
    onCameraReady(mapOf(
      "message" to "Camera was mounted"
    ));
  }
}
```

**TSX 端使用：**
```tsx
import { requireNativeViewManager } from 'expo-modules-core';

const CameraView = requireNativeViewManager('CameraView');

export default function MainView() {
  const onCameraReady = event => {
    console.log(event.nativeEvent);
  };

  return <CameraView onCameraReady={onCameraReady} />;
}
```

> **注意**：视图回调的数据负载在 JavaScript 端可通过 `nativeEvent` 键访问（即 `event.nativeEvent`）。

---

## 示例

以下是一个基础模块的实现示例，展示了一个返回问候语的同步函数。

**Swift：**
```swift
public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyFirstExpoModule")

    Function("hello") { (name: String) in
      return "Hello \(name)!"
    }
  }
}
```

**Kotlin：**
```kotlin
class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyFirstExpoModule")

    Function("hello") { name: String ->
      return "Hello $name!"
    }
  }
}
```

### 真实项目参考

以下开源 Expo 包可作为实际实现的参考：

- `expo-battery` — 电池状态
- `expo-cellular` — 蜂窝网络信息
- `expo-clipboard` — 剪贴板操作
- `expo-crypto` — 加密功能
- `expo-device` — 设备信息
- `expo-haptics` — 触觉反馈
- `expo-image-manipulator` — 图像操作
- `expo-image-picker` — 图像选择器
- `expo-linear-gradient` — 线性渐变
- `expo-localization` — 本地化
- `expo-store-review` — 应用商店评价
- `expo-system-ui` — 系统 UI
- `expo-video-thumbnails` — 视频缩略图
- `expo-web-browser` — 网页浏览器

> **基于经验建议**：学习 Expo Modules API 的最佳方式之一是阅读上述开源包的源码。它们展示了各种 API 的实际用法和最佳实践。

---

## 文档导航

- **上一页**：[additional platform support](./108__additional-platform-support.md)
- **下一页**：[inline modules reference](./110__inline-modules-reference.md)
