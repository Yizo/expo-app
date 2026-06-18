# 教程：创建原生视图（Native View）

> 原文地址：https://docs.expo.dev/modules/native-view-tutorial/

## 概述

本教程将指导你通过 **Expo Modules API** 构建一个展示网页内容的**原生视图（Native View）**模块。

**原生视图**是指由平台原生 UI 组件（而非 JavaScript 渲染的组件）构成的视图。在本教程中：

- **Android** 端使用系统内置的 `WebView`（安卓系统自带的网页渲染引擎）
- **iOS** 端使用 `WKWebView`（苹果 WebKit 框架提供的网页视图组件）

> **基于文档内容推导**：如果你还需要支持 Web 端，可以考虑使用 `iframe` 实现兼容的网页展示功能，这也是官方建议的练习方向。

---

## 前置知识（关键术语说明）

| 术语 | 说明 |
|------|------|
| **Expo Modules API** | Expo 提供的跨平台原生模块开发框架，允许开发者用 Kotlin（Android）和 Swift（iOS）编写原生代码，并通过统一接口暴露给 JavaScript/React Native |
| **Native View（原生视图）** | 直接使用平台原生 UI 系统渲染的视图组件，性能优于纯 JavaScript 渲染 |
| **WebView** | 在应用内嵌入网页内容的组件。Android 使用 `android.webkit.WebView`，iOS 使用 `WebKit.WKWebView` |
| **ExpoView** | Expo Modules API 提供的基础视图类，是所有自定义原生视图的父类。Android 端继承自 `FrameLayout`，iOS 端继承自 `UIView` |
| **Module（模块）** | Expo 中对原生功能的封装单元，通过 `ModuleDefinition` 定义模块的名称、属性、事件、方法等 |
| **Prop（属性）** | 从 JavaScript 端传递到原生视图的配置参数，类似于 React 组件的 props |
| **Event（事件）** | 从原生端发送到 JavaScript 端的回调通知，用于告知 JS 端原生状态的变化 |
| **EventDispatcher** | Expo Modules API 提供的事件分发器，用于在原生视图中定义和触发可被 JS 端监听的事件 |
| **prebuild** | Expo 的预构建命令，根据 app 配置生成原生项目代码（android/ 和 ios/ 目录） |

---

## 第一步：初始化新模块

使用你偏好的包管理器生成一个名为 `expo-web-view` 的新模块。

> **注意**：由于这是一个示例库，不会发布到 npm，所以在所有提示中直接按回车键（Return）接受默认值即可。

```sh
# 使用 npm
npx create-expo-module expo-web-view

# 使用 yarn
yarn create expo-module expo-web-view

# 使用 pnpm
pnpm create expo-module expo-web-view

# 使用 bun
bun create expo-module expo-web-view
```

> **基于经验建议**：`create-expo-module` 会自动生成包含 Android（Kotlin）、iOS（Swift）、TypeScript 类型定义、示例项目等完整脚手架。即使你只需要某一个平台，也建议保留完整结构，方便后续扩展。

---

## 第二步：设置工作区

### 2.1 清理默认模板文件

进入模块目录，删除自动生成的默认 TypeScript 和 Web 相关文件，以便从零开始：

```sh
cd expo-web-view
rm src/ExpoWebView.types.ts src/ExpoWebViewModule.ts
rm src/ExpoWebView.web.tsx src/ExpoWebViewModule.web.ts
```

### 2.2 创建 Android 模块定义

创建 `android/src/main/java/expo/modules/webview/ExpoWebViewModule.kt`：

```kotlin
package expo.modules.webview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoWebViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWebView")

    View(ExpoWebView::class) {}
  }
}
```

**代码解读**：
- `Module()` 是所有 Expo 模块的基类
- `definition()` 方法返回模块的定义
- `Name("ExpoWebView")` 设置模块名称，**这个名称必须与 TypeScript 端 `requireNativeViewManager` 的参数一致**
- `View(ExpoWebView::class) {}` 注册一个原生视图，`ExpoWebView` 是自定义视图类

### 2.3 创建 iOS 模块定义

创建 `ios/ExpoWebViewModule.swift`：

```swift
import ExpoModulesCore

public class ExpoWebViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoWebView")

    View(ExpoWebView.self) {}
  }
}
```

**代码解读**：
- `Module` 是 Swift 端所有 Expo 模块的基类协议
- `View(ExpoWebView.self) {}` 注册原生视图，使用 Swift 的 `.self` 语法传递类型引用

### 2.4 创建 TypeScript 包装组件

创建 `src/ExpoWebView.tsx`：

```tsx
import { ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

export type Props = ViewProps;

const NativeView: React.ComponentType<Props> = requireNativeViewManager('ExpoWebView');

export default function ExpoWebView(props: Props) {
  return <NativeView {...props} />;
}
```

**代码解读**：
- `requireNativeViewManager('ExpoWebView')` 通过模块名称获取原生视图管理器
- `ViewProps` 从 React Native 导入基础视图属性（如 `style`、`onLayout` 等）
- 组件将所有 props 透传给原生视图

### 2.5 创建导出入口文件

创建 `src/index.ts`：

```tsx
export { default as WebView, Props as WebViewProps } from './ExpoWebView';
```

### 2.6 更新示例应用

修改 `example/App.tsx`：

```tsx
import { WebView } from 'expo-web-view';

export default function App() {
  return <WebView style={{ flex: 1, backgroundColor: 'purple' }} />;
}
```

> **说明**：此时组件仅接受基础视图属性（如 `style`），紫色背景用于验证组件是否正常挂载。

---

## 第三步：运行示例项目

### 3.1 启动 TypeScript 编译器

在模块根目录启动 TypeScript 监听模式，自动编译并重建 JavaScript：

```sh
# 使用 npm
npm run build

# 使用 yarn
yarn run build

# 使用 pnpm
pnpm run build

# 使用 bun
bun run build
```

### 3.2 在 Android 和 iOS 上运行

```sh
# 使用 npm
cd example
npx expo run:android
npx expo run:ios

# 使用 yarn
cd example
yarn expo run:android
yarn expo run:ios

# 使用 pnpm
cd example
pnpm expo run:android
pnpm expo run:ios

# 使用 bun
cd example
bun expo run:android
bun expo run:ios
```

**预期结果**：你应该看到一个**纯紫色屏幕**。虽然看起来不太令人兴奋，但这表明原生视图已经成功挂载，是一个很好的起点。

> **基于经验建议**：如果看不到紫色屏幕，请检查：(1) TypeScript 编译是否成功；(2) 模块名称在原生端和 JS 端是否完全一致；(3) 尝试删除并重新安装应用。

---

## 第四步：添加系统 WebView 作为子视图

现在我们将真正的网页渲染组件添加为 `ExpoWebView` 的子视图。

> **关键概念**：`ExpoWebView` 继承自 `ExpoView`，而 `ExpoView` 最终继承自平台的标准原生视图（Android 的 `FrameLayout` / iOS 的 `UIView`）。我们需要确保子组件的尺寸与 React Native 布局系统计算的父容器尺寸匹配。

### 4.1 Android 视图实现

创建 `android/src/main/java/expo/modules/webview/ExpoWebView.kt`：

```kotlin
package expo.modules.webview

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class ExpoWebView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  internal val webView = WebView(context).also {
    it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    it.webViewClient = object : WebViewClient() {}
    addView(it)

    it.loadUrl("https://docs.expo.dev/modules/")
  }
}
```

**代码解读**：
- `ExpoView(context, appContext)` 构造函数需要 `Context`（Android 上下文）和 `AppContext`（Expo 应用上下文）
- `LayoutParams.MATCH_PARENT` 让 WebView 填满父容器（即 React Native 布局系统分配的整个区域）
- `WebViewClient` 是 WebView 的事件回调类，这里创建了一个空实现以防止链接在外部浏览器打开
- `addView(it)` 将 WebView 添加为子视图
- `loadUrl(...)` 加载默认的 Expo Modules API 文档页面

> **注意**：`internal` 修饰符使 `webView` 属性在模块包内可见但对外部不可见，这是 Kotlin 的访问控制机制。

### 4.2 iOS 视图实现

创建 `ios/ExpoWebView.swift`：

```swift
import ExpoModulesCore
import WebKit

class ExpoWebView: ExpoView {
  let webView = WKWebView()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    addSubview(webView)

    let url = URL(string: "https://docs.expo.dev/modules/")!
    let urlRequest = URLRequest(url: url)
    webView.load(urlRequest)
  }

  override func layoutSubviews() {
    webView.frame = bounds
  }
}
```

**代码解读**：
- `WKWebView()` 创建 WebKit 的网页视图实例
- `clipsToBounds = true` 启用边界裁剪，防止 WebView 内容溢出到父视图之外（**这在 iOS 上非常重要**）
- `layoutSubviews()` 是 iOS 布局回调方法，每当视图尺寸变化时调用。将 `webView.frame` 设为 `bounds`（父视图的内部区域），确保子视图始终匹配父容器
- `URLRequest` 封装了网络请求，`webView.load()` 开始加载

> **基于经验建议**：Android 使用 `MATCH_PARENT` 而 iOS 需要手动在 `layoutSubviews` 中同步 frame，这是因为两个平台的布局系统有本质区别。Android 的布局系统会自动传递父容器尺寸给子视图，而 iOS 的 Auto Layout / frame 布局需要开发者手动管理。

### 4.3 构建并运行

无需修改示例应用代码。先清理再预构建，然后运行：

```sh
# 使用 npm
npx expo prebuild --clean
npx expo run:android
npx expo run:ios

# 使用 yarn
yarn expo prebuild --clean
yarn expo run:android
yarn expo run:ios

# 使用 pnpm
pnpm expo prebuild --clean
pnpm expo run:android
pnpm expo run:ios

# 使用 bun
bun expo prebuild --clean
bun expo run:android
bun expo run:ios
```

**预期结果**：应用应该显示 Expo Modules API 概览页面。

> **提示**：如果更改没有反映出来，请尝试**重新安装应用**。`--clean` 参数会清除旧的预构建产物，确保使用最新代码。

---

## 第五步：添加 URL 属性（Prop）

目前 WebView 只能加载硬编码的 URL。我们通过添加 `url` 属性使其支持动态配置。

> **重要特性**：Expo Modules API 会**自动将 JavaScript 端的字符串转换为原生 URL 对象**，无需手动解析。

### 5.1 Android 模块更新

更新 `ExpoWebViewModule.kt`：

```kotlin
package expo.modules.webview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class ExpoWebViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWebView")

    View(ExpoWebView::class) {
      Prop("url") { view: ExpoWebView, url: URL? ->
        view.webView.loadUrl(url.toString())
      }
    }
  }
}
```

**代码解读**：
- `Prop("url")` 定义一个名为 `url` 的属性设置器
- 回调接收两个参数：视图实例和属性值（类型为 `URL?`，即可空的 Java URL 对象）
- `url.toString()` 将 URL 对象转回字符串供 `loadUrl()` 使用

> **基于文档内容推导**：虽然这里直接访问了 `view.webView` 内部属性很方便，但在生产环境中，建议将加载逻辑封装在 `ExpoWebView` 类内部，通过公开方法（如 `loadUrl()`）来操作，以保持**封装性**。

### 5.2 iOS 模块更新

更新 `ExpoWebViewModule.swift`：

```swift
import ExpoModulesCore

public class ExpoWebViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoWebView")

    View(ExpoWebView.self) {
      Prop("url") { (view, url: URL) in
        if view.webView.url != url {
          let urlRequest = URLRequest(url: url)
          view.webView.load(urlRequest)
        }
      }
    }
  }
}
```

**代码解读**：
- iOS 端额外添加了 **URL 变更检查**（`if view.webView.url != url`），避免重复加载相同的 URL
- 这是因为 React Native 可能在每次 re-render 时重新设置 props，如果没有去重检查，会导致页面不断重新加载

> **基于经验建议**：Android 端没有做去重检查，这在实际使用中可能导致不必要的页面刷新。建议在 Android 端也添加类似逻辑，例如记录上次加载的 URL 进行比较。

### 5.3 TypeScript 组件更新

更新 `src/ExpoWebView.tsx`：

```tsx
import { ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

export type Props = {
  url?: string;
} & ViewProps;

const NativeView: React.ComponentType<Props> = requireNativeViewManager('ExpoWebView');

export default function ExpoWebView(props: Props) {
  return <NativeView {...props} />;
}
```

**代码解读**：
- 使用交叉类型 `&` 将自定义的 `url` 属性与 React Native 的 `ViewProps` 合并
- `url?: string` 标记为可选属性，类型为字符串（Expo Modules API 会在原生端自动转换为 URL 对象）

### 5.4 更新示例应用

```tsx
import { WebView } from 'expo-web-view';

export default function App() {
  return <WebView style={{ flex: 1 }} url="https://expo.dev" />;
}
```

### 5.5 构建并运行

```sh
# 使用 npm
npx expo prebuild --clean
npx expo run:android
npx expo run:ios

# 使用 yarn
yarn expo prebuild --clean
yarn expo run:android
yarn expo run:ios

# 使用 pnpm
pnpm expo prebuild --clean
pnpm expo run:android
pnpm expo run:ios

# 使用 bun
bun expo prebuild --clean
bun expo run:android
bun expo run:ios
```

**预期结果**：应用应该显示 Expo 官网首页。

---

## 第六步：添加页面加载完成事件

接下来我们添加一个 `onLoad` 事件回调，当页面导航完成时触发。

> **关键概念**：**视图回调（View Callbacks）** 类似于标准的 React Native props，允许原生视图在特定事件发生时通知 JavaScript 端。

### 6.1 Android 视图和模块

更新 `ExpoWebView.kt`（视图文件），添加事件分发器：

```kotlin
package expo.modules.webview

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

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

**代码解读**：
- `private val onLoad by EventDispatcher()` 使用 Kotlin 的**属性委托**语法创建事件分发器
- `onPageFinished` 是 `WebViewClient` 的回调方法，在页面加载完成时触发
- `onLoad(mapOf("url" to url))` 触发事件，传递一个包含当前 URL 的 Map 作为事件数据
- `mapOf("url" to url)` 是 Kotlin 创建 Map 的简洁语法，`to` 是中缀函数

更新 `ExpoWebViewModule.kt`，注册事件：

```kotlin
package expo.modules.webview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class ExpoWebViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWebView")

    View(ExpoWebView::class) {
      Events("onLoad")

      Prop("url") { view: ExpoWebView, url: URL? ->
        view.webView.loadUrl(url.toString())
      }
    }
  }
}
```

**代码解读**：
- `Events("onLoad")` 声明视图支持的事件名称列表，**必须与视图中 `EventDispatcher` 的名称一致**

### 6.2 iOS 视图和模块

更新 `ExpoWebView.swift`（视图文件），采用导航代理协议：

```swift
import ExpoModulesCore
import WebKit

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

**代码解读**：
- `WKNavigationDelegate` 是 WebKit 的导航代理协议，用于监听网页加载的各个生命周期事件
- `webView.navigationDelegate = self` 将当前实例设为导航代理
- `func webView(_:didFinish:)` 是代理方法，在页面加载完成时调用
- `if let url = webView.url` 使用 Swift 的可选绑定安全地获取当前 URL
- `onLoad(["url": url.absoluteString])` 触发事件，传递字典作为事件数据

更新 `ExpoWebViewModule.swift`，注册事件：

```swift
import ExpoModulesCore

public class ExpoWebViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoWebView")

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
```

### 6.3 TypeScript 组件更新

更新 `src/ExpoWebView.tsx`：

```tsx
import { ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

export type OnLoadEvent = {
  url: string;
};

export type Props = {
  url?: string;
  onLoad?: (event: { nativeEvent: OnLoadEvent }) => void;
} & ViewProps;

const NativeView: React.ComponentType<Props> = requireNativeViewManager('ExpoWebView');

export default function ExpoWebView(props: Props) {
  return <NativeView {...props} />;
}
```

**代码解读**：
- `OnLoadEvent` 定义了事件负载的类型，包含一个 `url` 字段
- `onLoad?: (event: { nativeEvent: OnLoadEvent }) => void` 定义回调函数类型

> **重要细节**：原生端发送的事件数据会被嵌套在 `nativeEvent` 属性中，这是 React Native 事件系统的标准行为。因此在回调中需要通过 `event.nativeEvent.url` 访问数据，而不是直接 `event.url`。

> **基于经验建议**：忘记通过 `nativeEvent` 访问数据是初学者最常见的错误之一。如果你发现回调参数中直接访问属性返回 `undefined`，请检查是否遗漏了 `nativeEvent`。

### 6.4 更新示例应用

```tsx
import { WebView } from 'expo-web-view';

export default function App() {
  return (
    <WebView
      style={{ flex: 1 }}
      url="https://expo.dev"
      onLoad={event => alert(`loaded ${event.nativeEvent.url}`)}
    />
  );
}
```

**预期结果**：页面加载完成后，会弹出一个 alert 提示框，显示已加载的 URL 地址。

---

## 附加练习：构建浏览器 UI

作为进阶练习，你可以围绕 WebView 构建一个完整的浏览器界面，包括导航按钮、URL 输入框和加载指示器。

以下是一个完整的示例，包含 URL 输入框和加载遮罩层：

```tsx
import { useState } from 'react';
import { ActivityIndicator, Platform, Text, TextInput, View } from 'react-native';
import { WebView } from 'expo-web-view';

export default function App() {
  const [inputUrl, setInputUrl] = useState('https://docs.expo.dev/modules/');
  const [url, setUrl] = useState(inputUrl);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 80 : 30 }}>
      <TextInput
        value={inputUrl}
        onChangeText={setInputUrl}
        returnKeyType="go"
        autoCapitalize="none"
        onSubmitEditing={() => {
          if (inputUrl !== url) {
            setUrl(inputUrl);
            setIsLoading(true);
          }
        }}
        keyboardType="url"
        style={{
          color: '#fff',
          backgroundColor: '#000',
          borderRadius: 10,
          marginHorizontal: 10,
          paddingHorizontal: 20,
          height: 60,
        }}
      />

      <WebView
        url={url.startsWith('https://') || url.startsWith('http://') ? url : `https://${url}`}
        onLoad={() => setIsLoading(false)}
        style={{ flex: 1, marginTop: 20 }}
      />
      <LoadingView isLoading={isLoading} />
    </View>
  );
}

function LoadingView({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}>
      <ActivityIndicator animating={isLoading} color="#fff" style={{ marginRight: 10 }} />
      <Text style={{ color: '#fff' }}>Loading...</Text>
    </View>
  );
}
```

**代码解读**：

- **`inputUrl` vs `url` 双状态设计**：`inputUrl` 追踪输入框中的文本（用户正在输入时实时更新），`url` 追踪当前正在加载的 URL（仅在用户按下回车后才更新）。这种分离避免了输入过程中触发不必要的页面加载。
- **`Platform.OS`**：根据平台（`'ios'` 或 `'android'`）设置不同的顶部间距，iOS 需要额外空间避开状态栏。
- **URL 协议补全**：`url.startsWith('https://') || url.startsWith('http://')` 检查确保 URL 包含协议前缀，如果没有则自动添加 `https://`。
- **`LoadingView` 组件**：使用 `position: 'absolute'` 覆盖在 WebView 底部，半透明黑色背景加上旋转加载动画。
- **`ActivityIndicator`**：React Native 内置的加载指示器组件。
- **`keyboardType="url"`**：将键盘切换为 URL 输入模式，显示 `.com` 等快捷按键。

> **基于经验建议**：在实际项目中构建浏览器 UI 时，还建议添加：(1) 前进/后退导航按钮；(2) 错误处理（网页加载失败时的友好提示）；(3) 进度条（利用 WebView 的 `onProgress` 事件）；(4) HTTPS 安全警告。

---

## 总结

恭喜你！你已经成功构建了你的第一个跨平台原生视图模块。以下是本教程涵盖的核心知识点回顾：

| 知识点 | Android (Kotlin) | iOS (Swift) | TypeScript |
|--------|------------------|-------------|------------|
| 模块定义 | `Module` 基类 + `ModuleDefinition` | `Module` 协议 + `ModuleDefinition` | `requireNativeViewManager()` |
| 自定义视图 | 继承 `ExpoView` | 继承 `ExpoView` | `React.ComponentType<Props>` |
| 属性 (Props) | `Prop("name") { view, value -> ... }` | `Prop("name") { (view, value) in ... }` | 扩展 `Props` 类型 |
| 事件 (Events) | `EventDispatcher()` + `Events("name")` | `EventDispatcher()` + `Events("name")` | `nativeEvent` 包装 |
| 布局同步 | `LayoutParams.MATCH_PARENT` | `layoutSubviews()` + `bounds` | `style` 属性 |

---

## 后续学习

- 查看 **API 参考文档**，深入了解 Kotlin 和 Swift 模块创建的完整 API
- 回顾 **原生模块教程**（Native Module Tutorial），学习如何持久化存储设置等数据

---

## 文档导航

- **上一页**：[native module tutorial](./100__native-module-tutorial.md)
- **下一页**：[inline modules tutorial](./102__inline-modules-tutorial.md)
