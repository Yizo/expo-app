# react-native-webview — 在原生应用中嵌入网页内容

> 文档地址：https://docs.expo.dev/versions/unversioned/sdk/webview.md

---

## 文档解决的问题

在 React Web 开发中，如果你想在页面里嵌入另一个网页，通常会使用 `<iframe>` 标签。但在 React Native 中没有 `<iframe>`，因为原生移动端没有浏览器 DOM 环境。

`react-native-webview` 就是 React Native 生态中用来替代 `<iframe>` 的组件。它可以在你的原生应用界面中嵌入一个完整的浏览器引擎视图，用来：

- 加载并显示一个外部网址（类似 `<iframe src="...">`）
- 渲染一段原始 HTML 字符串（类似 `<iframe srcdoc="...">`）

该组件同时支持 **Android** 和 **iOS** 平台，并且已经预装在 **Expo Go** 中（Expo Go 是 Expo 提供的手机端预览工具，类似一个"沙盒 App"，让你无需编译原生代码就能在真机上预览项目）。

---

## 阅读前需要理解的背景知识

### 什么是 WebView

WebView 是移动端操作系统（Android / iOS）内置的浏览器引擎组件：

- **Android** 上使用基于 Chromium 的 Android WebView
- **iOS** 上使用 WebKit 引擎（和 Safari 同源）

你可以把它理解为"一个嵌在你 App 里的迷你浏览器"。它有自己独立的渲染进程和 JavaScript 运行环境，和你 App 的原生代码是隔离的。

对于 React Web 开发者来说，可以把它类比为功能更强大的 `<iframe>`——不仅能加载网页，还能和原生代码进行双向通信（虽然本文档只涉及基础用法）。

### 为什么需要单独安装这个包

在 React Web 中，`<iframe>` 是浏览器内置的 HTML 元素，不需要安装任何东西。但在 React Native 中，所有 UI 组件都需要通过原生代码桥接到对应的平台视图。`react-native-webview` 就是这样一个"桥接组件"——它在底层调用了 Android/iOS 的原生 WebView API，并通过 React Native 的桥接机制暴露为 React 组件供你在 JSX 中使用。

### StyleSheet 和 Constants

文档示例中使用了两个 Expo / React Native 的基础模块：

- **`StyleSheet`**：React Native 的样式工具，类似 Web 中的 CSS，但使用 JavaScript 对象来定义样式。`StyleSheet.create()` 方法会创建优化后的样式对象。这和 Web 开发中写 CSS 的目的相同，只是语法不同。
- **`Constants`**（来自 `expo-constants`）：提供设备和应用级别的常量信息。示例中使用的 `Constants.statusBarHeight` 是手机顶部状态栏的高度（单位为逻辑像素），用来避免 WebView 内容被状态栏遮挡。在 Web 开发中没有对应的概念，因为浏览器页面不会被系统状态栏覆盖。

---

## 安装

在 Expo 项目中，使用以下命令安装（根据你使用的包管理器选择）：

```sh
# 使用 npm
npx expo install react-native-webview

# 使用 yarn
yarn expo install react-native-webview

# 使用 pnpm
pnpm expo install react-native-webview

# 使用 bun
bun expo install react-native-webview
```

### 命令说明

- **`npx expo install`**：这是 Expo 提供的专用安装命令。和直接 `npm install` 的区别在于，`expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本，避免版本冲突导致的运行时错误。
- 对于 React Web 开发者：你可以把它理解为 `npm install` 的"安全版本"，它会帮你做版本兼容性检查。

### 非 Expo 项目的注意事项

如果你的项目是纯 React Native 项目（不使用 Expo），文档指出需要**先确保已安装 `expo` 包**，然后再参考 `react-native-webview` 的[官方安装指南](https://github.com/react-native-webview/react-native-webview/tree/master/docs)完成额外的原生配置步骤。

这是因为在非 Expo 的纯 React Native 项目中，原生模块（Native Module）需要手动在 iOS 的 `Podfile` 和 Android 的 `build.gradle` 中进行链接配置，而 Expo 项目会自动处理这些原生配置。

---

## 核心用法

### 用法一：加载外部 URL

这是最常见的使用场景——在 App 中打开一个网页。

```jsx
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <WebView
      style={styles.container}
      source={{ uri: 'https://expo.dev' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
```

#### 代码逐行解析

| 代码 | 作用 | Web 开发对比 |
|------|------|-------------|
| `import { WebView } from 'react-native-webview'` | 引入 WebView 组件 | 类似在 HTML 中使用 `<iframe>` |
| `source={{ uri: 'https://expo.dev' }}` | 指定要加载的网页地址 | 类似 `<iframe src="https://expo.dev">` |
| `flex: 1` | 让 WebView 占满父容器的全部可用空间 | 类似 Web 中 `flex: 1` 或 `height: 100%` |
| `marginTop: Constants.statusBarHeight` | 顶部留出状态栏的空间，防止内容被遮挡 | Web 中没有对应概念，浏览器内容不会被系统 UI 覆盖 |

#### 关键点：`source` 属性

`source` 是 WebView 的数据源属性，接受一个对象。当加载外部 URL 时，使用 `{ uri: '网址字符串' }` 的形式。这和 Web 中 `<iframe>` 的 `src` 属性作用相同，但语法不同——React Native 中采用对象形式是因为 WebView 还支持其他类型的数据源（如内联 HTML）。

### 用法二：渲染内联 HTML

如果你不需要加载远程网页，而是想直接渲染一段 HTML 字符串：

```jsx
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <WebView
      style={styles.container}
      originWhitelist={['*']}
      source={{ html: '<h1><center>Hello world</center></h1>' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
```

#### 与加载 URL 的差异

| 差异点 | 加载 URL | 渲染内联 HTML |
|--------|---------|--------------|
| `source` 属性 | `{ uri: 'https://...' }` | `{ html: '<h1>...</h1>' }` |
| `originWhitelist` | 不需要 | 需要设置为 `['*']` |
| Web 类比 | `<iframe src="...">` | `<iframe srcdoc="...">` |

#### `originWhitelist` 是什么

`originWhitelist` 是一个字符串数组，用来指定哪些来源（origin）的内容可以被 WebView 加载。设置为 `['*']` 表示允许所有来源。

在使用内联 HTML 时，必须设置这个属性，否则 WebView 可能会因为安全策略而拒绝渲染内容。这与 Web 开发中的 CORS（跨域资源共享）策略有些类似——移动端 WebView 同样有安全沙箱限制，`originWhitelist` 是控制这一限制的配置项。

> **基于经验建议**：在生产环境中，如果内联 HTML 中不需要加载外部资源，可以考虑将 `originWhitelist` 设置为更具体的值（如只允许你自己的域名），而不是 `['*']` 全部放行，以降低安全风险。

---

## 注意事项、限制条件和坑点

### 1. WebView 是一个"重量级"组件

与 React Web 中的普通 DOM 元素不同，WebView 在底层会创建一个完整的浏览器引擎实例。这意味着：

- **内存消耗大**：每个 WebView 实例都相当于打开了一个浏览器标签页
- **启动较慢**：首次渲染需要初始化浏览器引擎
- **不要在列表（如 FlatList）中大量使用**：如果在长列表中每行都放一个 WebView，会导致严重的性能问题

### 2. 状态栏遮挡问题

文档示例中使用了 `marginTop: Constants.statusBarHeight` 来避免内容被状态栏遮挡。在 React Native 中，默认情况下应用内容会延伸到状态栏下方（全屏布局），这和 Web 中浏览器内容区域自动在地址栏下方开始是不同的。如果你忘记处理这个问题，WebView 的顶部内容会被状态栏覆盖。

### 3. `flex: 1` 是必须的

在 React Native 中，如果一个组件没有明确的高度或 `flex` 值，它可能不会占据任何空间（这和 Web 中 `<div>` 默认会根据内容撑开高度不同）。WebView 必须设置 `flex: 1` 或明确的高度值，否则你可能看到一个空白区域。

### 4. 内联 HTML 的限制

使用 `source={{ html: '...' }}` 渲染内联 HTML 时，渲染的是纯 HTML 片段。它不像在 Web 开发中直接操作 DOM 那样灵活。如果需要更复杂的内联内容渲染（例如包含外部 JavaScript 或 CSS 文件），需要使用 `source` 的其他配置方式（如 `baseUrl`），这些高级用法需要参考 react-native-webview 的完整 API 文档。

### 5. 平台差异

Android 和 iOS 的 WebView 引擎不同（Chromium vs WebKit），因此在 CSS 渲染、JavaScript API 支持等方面可能存在细微差异。这与 Web 开发中不同浏览器之间的兼容性问题是同一类问题，但在移动端更加明显，因为你无法像桌面浏览器那样方便地调试。

---

## React Web 开发者需要特别注意的地方

### WebView ≠ iframe

虽然概念上 WebView 类似 `<iframe>`，但有几个根本性差异：

1. **独立的原生视图**：WebView 不是 DOM 元素，它是一个原生平台视图（Native View）。你不能对它使用 Web DOM API（如 `document.getElementById`）。
2. **通信方式不同**：在 Web 中，父页面和 iframe 通过 `postMessage` 通信。在 React Native 中，原生代码和 WebView 之间也有类似的 `postMessage` 机制，但 API 和用法不同，需要专门学习。
3. **样式系统不同**：WebView 外部的样式用 React Native 的 StyleSheet，内部渲染的 HTML 用标准 CSS，两套样式系统完全独立。

### 不要混淆两套样式系统

WebView 组件本身的样式（如宽高、边距）使用 React Native 的 `StyleSheet`，而 WebView 内部渲染的 HTML 内容使用标准 CSS。这两套样式互不影响，也不要混用。

### Expo Go 中的可用性

文档明确指出 `react-native-webview` 已经预装在 Expo Go 中。这意味着如果你使用 Expo Go 进行开发预览，不需要额外的原生配置就可以直接使用这个组件。但如果你后续需要脱离 Expo Go 构建独立 App（即进行"预构建"或"裸工作流"），可能需要额外的原生工程配置。

---

## 实际开发建议

### 典型使用场景

1. **显示服务条款 / 隐私政策**：从服务器加载网页版的协议文本
2. **嵌入第三方页面**：如支付页面、OAuth 登录页面
3. **展示富文本内容**：将后端返回的 HTML 内容渲染到 App 中
4. **渐进式迁移**：在将 Web 应用迁移到原生 App 的过程中，暂时用 WebView 承载还未原生化的页面

### 性能建议

- 避免在同一屏幕中创建多个 WebView 实例
- 如果 WebView 只是临时使用（如打开一个链接），用完后卸载组件以释放内存
- 对于简单的富文本展示，考虑使用 `react-native-render-html` 等轻量替代方案，将 HTML 转换为原生组件渲染，而不是启动完整的 WebView

### 安全建议

- 加载外部 URL 时，确保 URL 来源可信
- `originWhitelist={['*']}` 虽然方便，但在安全敏感场景中应该限制为具体的域名
- WebView 中加载的网页默认无法直接访问设备的原生 API（如摄像头、文件系统），这是沙箱安全机制

### 深入学习方向

当前文档只涵盖了 `react-native-webview` 最基础的用法。该组件还有大量高级功能（如导航事件监听、JavaScript 注入、文件上传/下载、Cookie 管理等），文档末尾建议查阅 [react-native-webview 的 GitHub 官方文档](https://github.com/react-native-webview/react-native-webview/tree/master/docs) 获取完整的 API 参考。

---

## 总结

`react-native-webview` 是 React Native / Expo 生态中用于在原生应用内嵌入网页内容的核心组件，功能上对标 Web 开发中的 `<iframe>`。本文档介绍了两种最基本的用法：加载外部 URL 和渲染内联 HTML。

对于 React Web 开发者来说，最需要转变的认知是：

1. WebView 是一个**原生视图组件**，不是 DOM 元素，不能使用 Web API 操作
2. 需要处理移动端特有的**状态栏遮挡**问题
3. 必须正确设置 **`flex: 1`** 或明确高度，否则组件可能不可见
4. 内联 HTML 需要配置 **`originWhitelist`** 才能正常渲染
5. 安装时应使用 **`npx expo install`** 而非 `npm install`，以确保版本兼容性

---

## 文档导航

- **上一页**：[captureRef](./241__captureRef.md)
- **下一页**：[expo updates 1](./243__expo-updates-1.md)
