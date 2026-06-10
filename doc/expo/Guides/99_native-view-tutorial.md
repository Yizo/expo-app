# 创建 Expo 原生视图：封装系统 WebView

> 对应文档：`https://docs.expo.dev/modules/native-view-tutorial.md`（页面修改日期：2026-05-23）

## 教程目标

本文把 Android `WebView` 与 iOS `WKWebView` 封装为统一的 React Native `<WebView>` 组件，并逐步增加布局、`url` prop 和 `onLoad` 事件。

Web 平台可用 `iframe` 实现，但当前教程将其留作练习。

## 初始化与最小视图

```sh
npx create-expo-module expo-web-view
cd expo-web-view
```

删除未使用的默认模块与 Web 文件后，原生模块分别通过以下声明注册视图：

```kotlin
View(ExpoWebView::class) {}
```

```swift
View(ExpoWebView.self) {}
```

TypeScript 使用 `requireNativeViewManager('ExpoWebView')` 得到可渲染组件，并透传 `ViewProps`。先运行：

```sh
npm run build
cd example
npx expo run:android
npx expo run:ios
```

初始 example 只显示一个占满屏幕的紫色空视图，用于验证注册、链接和布局已工作。

## 将系统 WebView 放进 ExpoView

`ExpoWebView` 继承 `ExpoView`。`ExpoView` 最终落到 Android `View` 或 iOS `UIView`，可理解为 React Native 布局树中的原生容器节点。

### Android 布局

创建系统 `WebView`，设置 `MATCH_PARENT`，安装 `WebViewClient`，再 `addView`。这样子视图跟随 React Native 为父视图计算出的尺寸。

### iOS 布局

创建 `WKWebView`，设置 `clipsToBounds = true` 并 `addSubview`；在 `layoutSubviews()` 中令 `webView.frame = bounds`，确保 React Native 布局变化后子视图同步尺寸。

修改原生视图后运行：

```sh
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

若变化未体现，文档建议尝试重装应用。

## 增加 `url` prop

在 `View` 定义内部用 `Prop("url")` 注册属性 setter。Expo Modules API 能把 JavaScript 字符串转换为原生 `URL` 类型。

```kotlin
Prop("url") { view: ExpoWebView, url: URL? ->
  view.webView.loadUrl(url.toString())
}
```

```swift
Prop("url") { (view, url: URL) in
  if view.webView.url != url {
    view.webView.load(URLRequest(url: url))
  }
}
```

TypeScript 同时把 `url?: string` 加入 props。教程特别建议：真实项目应尽量把行为封装在视图类内，不要让 Module 了解过多内部实现。

## 增加 `onLoad` 视图事件

视图事件在 React 侧表现为回调 prop，与 Web 的 `<img onLoad>` 类似，但事件来自原生组件。

1. Module 的 `View` 块声明 `Events("onLoad")`。
2. Android 在 `WebViewClient.onPageFinished` 中派发事件。
3. iOS 实现 `WKNavigationDelegate`，在 `webView(_:didFinish:)` 中派发事件。
4. TypeScript 声明 `onLoad?: (event: { nativeEvent: { url: string } }) => void`。
5. React 代码从 `event.nativeEvent.url` 读取负载。

Android 使用 `EventDispatcher` 委托；iOS 创建 `EventDispatcher` 实例。两端最终都发送包含 `url` 的对象。

## 示例浏览器 UI

文档最后用 `TextInput`、React state、`ActivityIndicator` 和原生 WebView 拼出简单浏览器：用户提交地址后更新 `url`，设置 loading；收到 `onLoad` 后关闭 loading。输入缺少协议时自动补 `https://`。

## 限制与坑点

- 原生子视图不会自动匹配父容器尺寸；Android/iOS 都必须显式处理布局。
- 原生代码和注册信息变化后需要重建，而非仅刷新 Metro。
- iOS 示例避免重复加载同一 URL；Android 示例没有同等判断。
- 事件负载位于 `nativeEvent`，不是直接位于回调参数顶层。
- 文档示例是教学 WebView，未讨论安全策略、导航拦截、下载、权限、Cookie 或进程崩溃。

## React Web 开发者易误解点

- `style={{ flex: 1 }}` 只决定原生容器布局，容器内部的系统视图仍需原生代码铺满。
- React props 不会天然写入任意原生对象；必须通过 `Prop` 声明转换与 setter。
- DOM 事件常见的 `event.target` 模型在这里不适用，React Native 原生事件数据放在 `nativeEvent`。

## 文档边界

**文档明确说明**：模块初始化、两端视图层级与布局、prop 类型转换、视图事件注册和一个组合 UI 示例。

**基于文档内容推导**：设计原生视图时，应把布局、平台代理回调和原生对象管理留在视图类中，让 Module 只描述公开契约。

**当前文档未涉及**：Web `iframe` 实现、完整浏览器能力、无障碍、测试、错误事件和安全加固。
