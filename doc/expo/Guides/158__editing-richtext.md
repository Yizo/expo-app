# 富文本编辑（Editing Rich Text）

> 原文地址：https://docs.expo.dev/guides/editing-richtext/

---

## 概述

许多应用都依赖基础的文本输入功能。React Native 提供了 `<TextInput>` 组件来处理简单的文本场景。然而，当应用涉及更复杂的用例——例如笔记应用或社交平台——就需要高级格式化功能，比如标题、列表和嵌入式媒体等。

构建一个健壮的富文本编辑器是出了名的困难，目前生态系统中也缺少一个通用的默认方案。本文档将帮助你了解在 Expo / React Native 项目中实现富文本的各种策略和可用工具。

> 官方提供了一个视频教程演示了如何使用 DOM 组件构建富文本界面，可参考：https://www.youtube.com/watch?v=CxORa1tXMjw

---

## 展示格式化内容

在讨论"编辑"之前，先了解如何"展示"格式化文本。Expo 提供了多种策略：

### 方式一：使用 Markdown 渲染库

如果你的内容是 Markdown 格式，可以使用专门的渲染库将 Markdown 转换为原生的 React Native 组件来展示。

推荐库：

- [react-native-enriched-markdown](https://github.com/software-mansion/react-native-enriched-markdown) — Software Mansion 出品，可将 Markdown 渲染为原生组件

### 方式二：使用 HTML 元素库或 WebView

如果你的内容是 HTML 格式，有以下选择：

- [@expo/html-elements](https://www.npmjs.com/package/@expo/html-elements) — 提供一组 HTML 元素对应的 React Native 组件
- [react-native-webview](https://docs.expo.dev/versions/latest/sdk/webview/) — 通过 WebView 组件直接渲染 HTML 内容

### 方式三：嵌套 Text 组件实现自定义样式

通过嵌套 `<Text>` 组件，可以为不同部分应用不同的样式：

```jsx
<TextInput>
  <Text>
    <Text style={{ fontWeight: 900 }}>Some bold text</Text>Some regular text
  </Text>
</TextInput>
```

**说明**：外层的 `<TextInput>` 包裹了 `<Text>` 组件，内层嵌套的 `<Text>` 通过 `fontWeight: 900` 设置了粗体效果，后面的文本则以默认样式显示。

### 方式四：使用 Expo Modules API 封装原生渲染器

通过 [Expo Modules API](https://docs.expo.dev/modules/overview/)，你可以封装各平台原生的富文本渲染能力：

- **iOS**：使用 `AttributedString`（苹果原生的富文本表示方式）
- **Android**：使用 [Markwon](https://github.com/noties/Markwon)（Android 端的 Markdown 渲染库）

这种方式可以获得最佳的原生渲染性能，但需要分别处理两个平台的差异。

---

## 编辑富文本的策略

编辑格式化文本有多种路径，每种方案都有其优缺点。下面逐一介绍。

### 策略一：WebView 方案

与直接封装原生元素的常规组件不同，WebView 方案将一个基于 JavaScript 的 Web 编辑器嵌入到 WebView 中。

**优点**：
- 跨平台兼容性好
- 功能丰富（可复用大量 Web 端编辑器）

**缺点**：
- 存在性能和用户体验问题（WebView 渲染开销较大）
- 在编辑器内集成原生 UI 元素（如 @提及）需要重复实现功能

#### 现成的 WebView 库

如果对性能要求不严格，可以直接使用以下预封装好的库：

| 库名 | 说明 |
|---|---|
| [react-native-rich-editor](https://github.com/wxik/react-native-rich-editor) | 基于 Web 的富文本编辑器，开箱即用 |
| [react-native-cn-quill](https://github.com/imnapo/react-native-cn-quill) | 基于 [Quill](https://quilljs.com/) 编辑器的 React Native 封装 |
| [@10play/tentap-editor](https://github.com/10play/10Tap-Editor) | 另一个基于 Web 的富文本编辑器方案 |

这些库适合快速原型开发或对性能要求不高的场景。

#### 自定义 WebView 方案

如果需要更强的控制力，可以自行集成 Web 端编辑器（如 [Lexical](https://github.com/facebook/lexical)、[Slate](https://github.com/ianstormtaylor/slate) 或 [Quill](https://quilljs.com/)）。

关键注意事项：

1. **消息传递**：需要在原生层和 WebView 之间管理双向通信
2. **性能优化**：在长时间编辑会话中，建议将输入视为**非受控组件**（uncontrolled component），避免在每次按键时发送完整的编辑器状态，以维持性能

> **基于文档内容推导**：所谓"非受控组件"方式，就是让 WebView 内部的编辑器自行管理状态，React Native 端只在需要时（如提交表单）才获取最终内容，而不是实时同步每一次输入。

### 策略二：使用原生 TextInput 组件

React Native 的 `<TextInput>` 支持嵌套带样式的 `<Text>` 组件来渲染格式化文本。在新架构（New Architecture）下，嵌套内容的同步是即时的。

然而，**核心限制**在于：`onChange` 回调只会返回一个纯文本字符串，丢失了所有格式化信息。

示例说明这个问题：

```jsx
<TextInput>
  <Text>
    {/* 以下代码将渲染为粗体的 "aa" 后跟普通文本 "aa"，
        显示效果类似：**aa**aa */}
    <Text style={{ fontWeight: 900 }}>aa</Text>aa
  </Text>
</TextInput>
```

**问题解析**：假设用户在上述输入框中输入了一个新字符，`onChange` 回调只会返回类似 `"aaXaa"` 的纯字符串，无法告知你新输入的字符 `"X"` 是否应该继承粗体样式。

虽然可以通过 `onSelectionChange` 事件来追踪光标位置并推断格式化信息，但这会使状态管理变得非常复杂——尤其是在插入换行符等结构性字符时。

社区有一些尝试解决这个问题的项目，但目前还没有被广泛采用的方案。

### 策略三：可见的 Markdown 编辑模式

如果可以接受显示原始 Markdown 语法，这是一种实用的方案：

- 用户在一个区域输入原始 Markdown 语法
- 在另一个区域（或同一区域的不同部分）实时展示格式化后的预览效果

**适用场景**：适合技术用户群体，他们对 Markdown 语法较为熟悉。

**可用库**：

| 库名 | 说明 |
|---|---|
| [markdown-editor](https://github.com/shakogegia/markdown-editor) | Markdown 编辑器组件 |
| [rn-text-editor](https://github.com/amjadbouhouch/rn-text-editor) | React Native 文本编辑器 |
| [react-native-markdown-editor](https://github.com/kunall17/react-native-markdown-editor) | React Native Markdown 编辑器 |

也可以自行构建这种编辑器，或者采用混合方案——仅在光标所在区域显示原始语法标记，其他部分则显示格式化后的效果。

> **基于经验建议**：可见 Markdown 编辑模式在开发者工具、笔记应用中效果很好，但面向普通用户的应用中可能接受度不高。选择此方案前请考虑目标用户群体。

### 策略四：原生平台编辑器

另一种路径是直接封装 iOS 和 Android 各自的原生富文本编辑组件。

**可用的原生编辑器**：

| 项目 | 说明 |
|---|---|
| [react-native-aztec](https://github.com/WordPress/gutenberg/tree/trunk/packages/react-native-aztec) | WordPress 出品的原生富文本编辑器封装 |
| [gutenberg-mobile](https://github.com/wordpress-mobile/gutenberg-mobile) | WordPress 的 Gutenberg 移动端编辑器 |
| [react-native-live-markdown](https://github.com/Expensify/react-native-live-markdown) | Expensify 出品的实时 Markdown 编辑器 |
| [react-native-enriched-html](https://github.com/software-mansion/react-native-enriched-html) | Software Mansion 出品的富文本 HTML 编辑器 |

开发者也可以使用 Expo Modules API 封装任何原生编辑器，但需要注意：

- **平台 API 差异**：iOS 和 Android 的富文本 API 不同，需要在 React Native 层进行统一
- **输入格式统一**：不同平台使用不同的富文本表示格式

#### 关于抽象语法树（AST）

格式化文本通常被结构化为**抽象语法树**（Abstract Syntax Tree，[AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)），其中各种元素（如列表、标题等）被表示为层次化的节点。这种结构可以跨平台统一表示文档内容。

此外，社区正在进行将 [Lexical](https://github.com/facebook/lexical/discussions/2410) 移植到原生移动平台的工作，未来可能会提供更多选择。

---

## 总结与方案选择

展示格式化文本有很多选择，但编辑格式化文本目前还没有统一的标准方案。开发者需要根据自身需求权衡各方案的利弊：

| 方案 | 优点 | 缺点 | 适用场景 |
|---|---|---|---|
| WebView 方案 | 跨平台、功能丰富、开发快 | 性能差、UX 不够原生 | 快速原型、内部工具 |
| 原生 TextInput | 原生性能好、轻量 | onChange 只返回纯文本，功能受限 | 简单格式化需求 |
| Markdown 可见编辑 | 实现简单、技术用户友好 | 普通用户难以接受 | 开发者工具、笔记应用 |
| 原生平台编辑器 | 最佳性能和体验 | 开发维护成本高、平台差异 | 大型应用、核心功能 |

> **基于文档内容推导**：文档明确指出目前"没有放之四海而皆准的解决方案"。团队需要根据具体的功能需求和可用资源，在原生编辑器的维护负担与框架原语的局限性之间做出取舍。

---

## 文档导航

- **上一页**：[using bun](./157__using-bun.md)
- **下一页**：[store assets](./159__store-assets.md)
