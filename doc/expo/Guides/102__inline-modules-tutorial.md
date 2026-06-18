> **原始文档来源**：https://docs.expo.dev/modules/inline-modules-tutorial/
>
> 本文档基于 Expo Modules API 官方教程翻译整理，旨在帮助中文开发者学习如何在 Expo 应用内部直接创建内联原生模块和原生视图。

# 教程：创建内联模块（Inline Module）

本教程将演示如何直接在 Expo 应用的 **app 目录**内构建原生视图和模块——无需使用 `create-expo-module` 脚手架工具，也无需创建独立的 npm 包。Expo 会自动发现并与应用代码放在一起的 Swift 和 Kotlin 文件。

> **警告**：内联模块（Inline Modules）是一项**实验性功能**，需要 **Expo SDK 56 或更高版本**。这意味着该 API **可能会发生破坏性变更（breaking changes）**，在生产环境中使用时需谨慎。

> **关键术语解释（面向初学者）**：
> - **Inline Module（内联模块）**：直接放置在应用项目目录中（而非独立 npm 包中）的原生模块。与传统模块不同，内联模块不需要通过 `create-expo-module` 脚手架创建，也不需要发布为单独的库。
> - **Prebuild（预构建）**：Expo 提供的一种机制，根据你的应用配置（`app.json`/`app.config.js`）自动生成原生 iOS 和 Android 项目目录。这是使用内联模块的必要步骤。
> - **app 目录**：Expo Router 项目中的主目录，通常存放路由页面和组件文件。内联模块的 Swift/Kotlin 文件也可以放在这里。
> - **watchedDirectories（监听目录）**：配置中指定的目录列表，Expo 会在这些目录中搜索内联模块的原生文件。
> - **Native View（原生视图）**：用平台原生 UI 组件（Android 的 `WebView`、iOS 的 `WKWebView` 等）构建的视图，可以被 React Native 的 JSX 直接使用。
> - **Constant**：模块中定义的一个只读常量值，在模块初始化时计算，可以在 JavaScript 端直接访问。
> - **Prop**：原生视图的属性，允许从 React Native 的 JSX 向原生视图传递数据。
> - **EventDispatcher**：Expo Modules API 提供的事件分发器，用于从原生视图向 JavaScript 端发送事件回调。

---

## 第一步：配置项目

要启用内联模块功能，需要在应用配置文件（`app.json` 或 `app.config.js`/`app.config.ts`）中添加实验性功能配置，指定哪些文件夹包含你的内联模块：

```json
{
  "expo": {
    "experiments": {
      "inlineModules": {
        "watchedDirectories": ["app"]
      }
    }
  }
}
```

**配置项说明**：

| 配置项 | 说明 |
|--------|------|
| `expo.experiments.inlineModules` | 启用内联模块实验性功能 |
| `watchedDirectories` | 定义系统搜索内联模块原生文件的目录列表。本教程中设置为 `["app"]`，表示在 `app` 目录中查找 |

> **基于文档内容推导**：`watchedDirectories` 是一个数组，意味着你可以指定多个目录来组织内联模块。但需注意，只有被指定的目录中的 Swift/Kotlin 文件才会被 Expo 自动发现和注册。

> **基于经验建议**：建议初学者先使用 `app` 目录作为内联模块的存放位置，因为它已经是 Expo Router 项目的核心目录，便于管理和查找。随着项目规模增长，可以考虑将内联模块分散到专门的目录中。

---

## 第二步：运行预构建（Prebuild）

启用内联模块后，需要执行预构建步骤来生成带有正确配置的原生 iOS 和 Android 项目目录：

```sh
# npm
npx expo prebuild

# yarn
yarn expo prebuild

# pnpm
pnpm expo prebuild

# bun
bun expo prebuild
```

> **关键术语解释**：`npx expo prebuild` 命令会根据你的 `app.json` 配置自动生成 `ios/` 和 `android/` 目录。这些目录包含完整的原生项目结构，内联模块会被自动注册到原生层。如果你之前已经执行过 prebuild，可能需要添加 `--clean` 标志来重新生成。

> **基于经验建议**：预构建是连接 Expo 托管工作流与原生代码的关键桥梁。每次修改 `app.json` 中的原生相关配置后，都应重新运行 `prebuild` 以使更改生效。

---

## 第三步：创建内联模块

现在，我们在 `app` 目录中创建一个最简单的内联模块。该模块将暴露一个名为 `Hello` 的常量，供 JavaScript 端读取。

### Android 端（Kotlin）

在 `app` 目录下创建文件 `FirstInlineModule.kt`：

```kotlin
package app

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FirstInlineModule : Module() {
  override fun definition() = ModuleDefinition {
    Constant("Hello") { ->
      "Hello Android inline modules!"
    }
  }
}
```

**代码解析**：
- `package app`：声明该 Kotlin 文件所属的包名。由于文件在 `app` 目录下，包名设为 `app`。
- `class FirstInlineModule : Module()`：定义一个继承自 Expo `Module` 基类的原生模块类。类名 `FirstInlineModule` 将成为 JavaScript 端引用该模块时的名称。
- `override fun definition() = ModuleDefinition { ... }`：重写 `definition()` 方法，返回模块定义 DSL（领域特定语言）块。
- `Constant("Hello") { -> "Hello Android inline modules!" }`：定义一个名为 `"Hello"` 的常量，其值为字符串 `"Hello Android inline modules!"`。

### iOS 端（Swift）

在 `app` 目录下创建文件 `FirstInlineModule.swift`：

```swift
internal import ExpoModulesCore

class FirstInlineModule: Module {
  public func definition() -> ModuleDefinition {
    Constant("Hello") {
      return "Hello iOS inline modules!"
    }
  }
}
```

**代码解析**：
- `internal import ExpoModulesCore`：导入 Expo 模块核心框架。`internal` 关键字限制了该导入的可见范围，这是 Swift 6 的语法要求。
- `class FirstInlineModule: Module`：定义一个继承自 Expo `Module` 基类的原生模块类。
- `public func definition() -> ModuleDefinition`：实现 `definition()` 方法，返回模块定义。
- `Constant("Hello") { return "Hello iOS inline modules!" }`：定义名为 `"Hello"` 的常量。

> **基于文档内容推导**：内联模块与传统模块的一个关键区别是——内联模块**不需要**手动调用 `Name()` 来设置模块名称。Expo 会根据类名自动推断模块名称（即 `FirstInlineModule`）。

> **基于经验建议**：注意 Kotlin 文件中 `package app` 的声明——它需要与文件所在的目录结构匹配。对于内联模块，由于文件直接放在 `app/` 目录下，包名通常设为 `app`。如果目录结构发生变化，包名也需要相应调整。

---

## 第四步：在应用中使用模块

在 TypeScript/JavaScript 文件中导入并使用刚创建的内联模块：

```tsx
import { requireNativeModule } from 'expo';
import { Text } from 'react-native';

const FirstInlineModule = requireNativeModule('FirstInlineModule');

export default function InlineModulesDemoComponent() {
  return <Text> {FirstInlineModule.Hello} </Text>;
}
```

**代码解析**：
- `requireNativeModule('FirstInlineModule')`：通过模块名 `'FirstInlineModule'` 加载对应的原生模块实例。此名称必须与原生代码中的类名一致。
- `FirstInlineModule.Hello`：访问原生模块中定义的 `Hello` 常量，它会在模块加载时自动从原生端传递到 JavaScript 端。

> **基于经验建议**：`requireNativeModule` 是一个同步调用，它会立即返回原生模块的代理对象。常量（`Constant`）在模块加载时就已经计算好并缓存，因此访问它们的性能开销极小。

---

## 第五步：运行应用

使用你偏好的包管理器编译并运行应用：

```sh
# npm
npx expo run:android
npx expo run:ios

# yarn
yarn expo run:android
yarn expo run:ios

# pnpm
pnpm expo run:android
pnpm expo run:ios

# bun
bun expo run:android
bun expo run:ios
```

运行后，应用屏幕上将显示原生代码提供的文本常量（如 `"Hello Android inline modules!"` 或 `"Hello iOS inline modules!"`）。

> **基于经验建议**：首次运行 `run:android` 或 `run:ios` 时，编译过程可能需要较长时间（尤其是 Android）。这是因为需要编译完整的原生项目。后续增量编译会快得多。

---

## 第六步：创建原生视图（Native View）

接下来，我们将创建一个更复杂的内联组件——一个封装了平台原生 WebView 的自定义视图。这个视图将支持通过 `url` 属性加载网页，并在页面加载完成后触发 `onLoad` 事件。

### Android 端（Kotlin）

在 `app` 目录下创建文件 `FirstInlineView.kt`：

```kotlin
package app

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class FirstInlineView : Module() {
  override fun definition() = ModuleDefinition {
    View(ExpoWebView::class) {
      Events("onLoad")

      Prop("url") { view: ExpoWebView, url: URL? ->
        view.webView.loadUrl(url.toString())
      }
    }
  }
}

class ExpoWebView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onLoad by EventDispatcher()

  internal val webView = WebView(context).also {
    it.layoutParams = LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    )

    it.webViewClient = object : WebViewClient() {
      override fun onPageFinished(view: WebView, url: String) {
        onLoad(mapOf("url" to url))
      }
    }

    addView(it)
  }
}
```

**代码解析**：

1. **模块定义部分** (`FirstInlineView` 类)：
   - `View(ExpoWebView::class) { ... }`：注册一个原生视图，指定视图的实现类为 `ExpoWebView`。
   - `Events("onLoad")`：声明该视图会发出名为 `"onLoad"` 的事件。
   - `Prop("url") { view, url -> ... }`：定义一个名为 `"url"` 的属性。当 JavaScript 端设置该属性时，会调用此回调函数，使用传入的 URL 加载网页。

2. **视图实现部分** (`ExpoWebView` 类)：
   - `ExpoWebView(context, appContext) : ExpoView(context, appContext)`：继承 Expo 提供的 `ExpoView` 基类，它是对 Android 原生 `View` 的封装。
   - `private val onLoad by EventDispatcher()`：创建一个事件分发器实例，用于向 JavaScript 端发送 `onLoad` 事件。
   - `WebView(context)`：创建 Android 原生的 `WebView` 实例。
   - `it.layoutParams = LayoutParams(MATCH_PARENT, MATCH_PARENT)`：设置 WebView 填满父容器。
   - `it.webViewClient = object : WebViewClient() { ... }`：设置 WebView 客户端，在页面加载完成时触发 `onLoad` 事件。
   - `addView(it)`：将 WebView 添加到视图层级中。

### iOS 端（Swift）

在 `app` 目录下创建文件 `FirstInlineView.swift`：

```swift
internal import ExpoModulesCore
import WebKit

class FirstInlineView: Module {
  public func definition() -> ModuleDefinition {
    View(ExpoWebView.self) {
      Events("onLoad")

      Prop("url") { (view, url: URL) in
        if view.webView.url != url {
          let urlRequest = URLRequest(url: url)
          view.webView.load(urlRequest)
        }
      }
    }
  }
}

class ExpoWebView: ExpoView, WKNavigationDelegate {
  let webView = WKWebView()
  let onLoad = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    webView.navigationDelegate = self
    addSubview(webView)
  }

  override func layoutSubviews() {
    webView.frame = bounds
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    if let url = webView.url {
      onLoad([
        "url": url.absoluteString
      ])
    }
  }
}
```

**代码解析**：

1. **模块定义部分** (`FirstInlineView` 类)：
   - `import WebKit`：导入 Apple 的 WebKit 框架，提供 `WKWebView` 等 Web 渲染组件。
   - `View(ExpoWebView.self) { ... }`：注册原生视图，指定实现类为 `ExpoWebView`。
   - `Prop("url") { (view, url: URL) in ... }`：定义 `url` 属性。当 URL 发生变化时，才重新加载页面（通过 `view.webView.url != url` 判断避免重复加载）。

2. **视图实现部分** (`ExpoWebView` 类)：
   - `ExpoWebView: ExpoView, WKNavigationDelegate`：继承 `ExpoView` 并实现 `WKNavigationDelegate` 协议，用于接收 WebView 的导航事件。
   - `let webView = WKWebView()`：创建 iOS 原生的 `WKWebView` 实例。
   - `let onLoad = EventDispatcher()`：创建事件分发器。
   - `clipsToBounds = true`：确保 WebView 的内容不会超出视图边界。
   - `webView.navigationDelegate = self`：将当前对象设为 WebView 的导航代理。
   - `override func layoutSubviews()`：在布局时同步 WebView 的大小。
   - `func webView(_:didFinish:)`：`WKNavigationDelegate` 协议方法，在页面加载完成时调用，通过 `onLoad` 分发器发送包含 URL 的事件数据。

> **基于文档内容推导**：对比 Android 和 iOS 的实现，可以看到 Expo Modules API 提供了高度统一的抽象层。两端的模块定义 DSL（`View`、`Events`、`Prop`）几乎一致，而视图实现则使用了各平台的原生 API（Android 的 `WebView` vs iOS 的 `WKWebView`）。

> **基于经验建议**：iOS 端 `Prop` 回调中的 `if view.webView.url != url` 检查是一个重要的优化——它可以避免在 React Native 重新渲染时重复加载同一个 URL。这种"幂等性"设计在原生视图开发中非常常见，建议在所有 `Prop` 回调中考虑是否需要类似的防重复逻辑。

---

## 第七步：在应用中使用原生视图

将原生视图集成到 React Native 组件中，同时保留之前创建的模块：

```tsx
import { requireNativeModule, requireNativeView } from 'expo';
import { StyleSheet, Text, View } from 'react-native';

const FirstInlineModule = requireNativeModule('FirstInlineModule');
const FirstInlineView = requireNativeView('FirstInlineView');

export default function InlineModulesDemoComponent() {
  return (
    <>
      <View style={styles.textBox}>
        <Text style={styles.text}> {FirstInlineModule.Hello} </Text>
      </View>
      <FirstInlineView style={styles.inlineView} url="https://docs.expo.dev/modules/" />
    </>
  );
}

const styles = StyleSheet.create({
  textBox: { height: 100, justifyContent: 'flex-end', alignItems: 'center' },
  text: { fontSize: 26 },
  inlineView: { flex: 1 },
});
```

**代码解析**：

- `requireNativeModule('FirstInlineModule')`：加载原生模块，用于获取 `Hello` 常量。
- `requireNativeView('FirstInlineView')`：加载原生视图组件，使其可以在 JSX 中像普通 React Native 组件一样使用。
- `<FirstInlineView style={styles.inlineView} url="https://docs.expo.dev/modules/" />`：使用原生视图组件，传入 `style` 和 `url` 属性。`url` 属性会自动触发原生端 `Prop("url")` 的回调函数。
- `StyleSheet.create({ ... })`：使用 React Native 的样式表定义组件外观。`textBox` 设置固定高度并底部对齐，`inlineView` 使用 `flex: 1` 填满剩余空间。

> **关键术语解释**：
> - `requireNativeModule`：用于加载原生**模块**（提供函数、常量等逻辑能力的组件）。
> - `requireNativeView`：用于加载原生**视图**（提供可视 UI 元素的组件）。两者都来自 `'expo'` 包，但用途不同。

> **基于经验建议**：`requireNativeView` 返回的是一个可以直接在 JSX 中使用的 React 组件。你可以像使用 `<View>`、`<Text>` 等内置组件一样使用它，包括设置 `style`、传递自定义属性等。但要注意，原生视图的属性类型需要在原生端的 `Prop` 定义中明确声明。

---

## 第八步：运行完整应用

使用以下命令编译并运行应用：

```sh
# npm
npx expo run:android
npx expo run:ios

# yarn
yarn expo run:android
yarn expo run:ios

# pnpm
pnpm expo run:android
pnpm expo run:ios

# bun
bun expo run:android
bun expo run:ios
```

运行后，你将看到屏幕上同时显示：
1. 原生模块提供的文本常量（`Hello` 的值）
2. 原生 WebView 视图，加载 `https://docs.expo.dev/modules/` 页面

---

## 总结

恭喜你！你已经成功创建了第一个内联模块和原生视图组件。以下是本教程的核心要点回顾：

| 概念 | 说明 |
|------|------|
| **内联模块的优势** | 无需独立包、无需脚手架工具，原生代码直接放在应用目录中 |
| **启用方式** | 在 `app.json` 中配置 `expo.experiments.inlineModules.watchedDirectories` |
| **模块定义** | Kotlin/Swift 文件放在被监听的目录中，Expo 自动发现和注册 |
| **JS 端使用** | 通过 `requireNativeModule` 加载模块，`requireNativeView` 加载视图 |
| **Constant** | 模块级只读常量，初始化时计算 |
| **Prop** | 视图属性，从 JS 端向原生视图传递数据 |
| **Events** | 视图事件，从原生视图向 JS 端发送回调 |

---

## 下一步学习

- **深入参考**：查阅 [Expo 内联模块参考文档](https://docs.expo.dev/modules/inline-modules/)，了解 Kotlin 和 Swift 端更多可用的 API 和高级用法。
- **完整原生模块教程**：阅读 [教程：创建原生模块](https://docs.expo.dev/modules/native-module-tutorial/)，学习如何创建带有持久化存储功能的完整原生模块（本教程中的内联模块相对简化，不涉及数据持久化）。

> **基于经验建议**：内联模块非常适合快速原型开发和小型项目。如果你的模块需要在多个项目中复用，或者需要复杂的配置和发布流程，建议仍然使用 `create-expo-module` 创建独立的模块包。

---

## 文档导航

- **上一页**：[native view tutorial](./101__native-view-tutorial.md)
- **下一页**：[type generation tutorial](./103__type-generation-tutorial.md)
