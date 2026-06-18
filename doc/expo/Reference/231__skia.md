# @shopify/react-native-skia — 在 React Native 中使用 Skia 绘制图形

## 文档解决的问题

在移动端应用中，有时需要实现高性能的自定义图形绘制，例如：图表、动画、图像处理、游戏界面、复杂的自定义 UI 组件等。传统的 CSS 样式或 React Native 内置的 `View`、`Text` 等组件无法满足这类需求。

`@shopify/react-native-skia` 提供了一套基于 **Skia 图形引擎** 的 React Native 组件和 API，让开发者可以像在 Web 端使用 `<canvas>` 和 Canvas 2D API 一样，在 React Native 中声明式地创建高性能图形。

**与 Web 的类比：** 在 Web 开发中，你可能用过 `<canvas>` 元素配合 `CanvasRenderingContext2D` 或 WebGL 来绘制图形。Skia 提供的能力类似，但它是原生级别的 2D 图形引擎，性能更强，且 API 设计更现代化。

## 阅读前需要理解的背景知识

### 什么是 Skia？

**Skia** 是一个开源的 2D 图形库（Graphics Library），由 Google 维护。它是许多知名产品的底层图形引擎，包括：

- Google Chrome 和 Chrome OS
- Android 操作系统
- Flutter 框架
- Mozilla Firefox 和 Firefox OS

简单理解：Skia 就是这些产品"画图"的底层工具。当 Chrome 渲染网页、Android 绘制界面、Flutter 渲染 Widget 时，底层都在使用 Skia 来完成像素级别的图形绘制。

### 为什么 React Native 需要 Skia？

React Native 默认的渲染管线基于各平台的原生 UI 组件（iOS 的 UIKit、Android 的 View 系统）。这对于标准 UI 组件已经够用，但如果需要：

- 自定义绘制任意图形（路径、贝塞尔曲线、渐变填充）
- 实现复杂的图像滤镜和处理效果
- 高性能动画（60fps 甚至更高）
- 实现类似 Figma、Photoshop 的绘图功能

就需要一个更底层、更强大的图形引擎。`@shopify/react-native-skia` 将 Skia 引入 React Native，填补了这个空白。

### 声明式 vs 命令式绘图

在 Web 的 `<canvas>` 中，绘图是**命令式**的——你需要一步步调用 `ctx.fillRect()`、`ctx.arc()` 等方法。而 `@shopify/react-native-skia` 采用**声明式**的方式——你用 JSX 组件描述要画什么，框架负责渲染：

```tsx
// 声明式：用组件描述图形
<Canvas>
  <Circle cx={100} cy={100} r={50} color="blue" />
</Canvas>
```

这与你熟悉的 React 组件化思维一致，不需要手动管理 Canvas 上下文。

## 核心内容

### 库的基本信息

| 属性 | 说明 |
|------|------|
| 包名 | `@shopify/react-native-skia` |
| 维护方 | Shopify |
| 支持平台 | Android、iOS、tvOS、Web |
| Expo Go 支持 | 是（已内置在 Expo Go 中） |
| 核心能力 | 将 Skia 图形引擎引入 React Native，支持声明式图形绘制 |

**Expo Go 内置支持的含义：** 这意味着你不需要退出 Expo 托管工作流（Managed Workflow）就能使用这个库。在 Expo Go 应用扫描你的项目后，就可以直接运行包含 Skia 的代码，无需自行编译原生代码。

> **对 React Web 开发者的说明：** 在 React Web 中，你习惯了 `npm install` 之后一切就能工作。在 React Native 中，很多库包含原生代码（Objective-C/Swift/Kotlin/Java），通常需要重新编译原生应用。Expo Go 内置了这个库的原生代码，所以你仍然可以像 Web 开发一样"安装即用"。

### 安装

根据你使用的包管理器，运行对应的安装命令：

```bash
# 使用 npm
npx expo install @shopify/react-native-skia

# 使用 yarn
yarn expo install @shopify/react-native-skia

# 使用 pnpm
pnpm expo install @shopify/react-native-skia

# 使用 bun
bun expo install @shopify/react-native-skia
```

**命令说明：**

- `npx expo install` 是 Expo 提供的专用安装命令，它会自动选择与当前 Expo SDK 版本兼容的包版本。
- 这与直接使用 `npm install` 不同——`expo install` 会查询 Expo 的版本兼容表，确保安装的版本经过测试、可以正常工作。
- **建议始终使用 `expo install` 而非直接 `npm install`**，以避免版本不兼容导致原生模块无法加载的问题。

### 在非 Expo 管理的 React Native 项目中使用

如果你是在一个已有的纯 React Native 项目（未使用 Expo）中添加此库，需要注意：

1. **先在项目中安装 `expo`**——`@shopify/react-native-skia` 依赖 Expo 的基础设施。
2. 然后按照库的 README 中的设置步骤完成原生配置（如 iOS 的 `pod install`、Android 的 Gradle 配置等）。

> **对 React Web 开发者的说明：** 在纯 Web 项目中，安装一个 npm 包通常只需要 `npm install`。但在 React Native 中，如果库包含原生代码，你可能还需要修改 iOS 的 Podfile、Android 的 build.gradle 等原生配置文件。这是移动端开发比 Web 开发复杂的地方之一。使用 Expo 可以大幅简化这个过程。

### Web 平台支持

如果你需要在浏览器中运行包含 Skia 的应用，还需要**额外配置 CanvasKit 的加载**。

**CanvasKit 是什么？** CanvasKit 是 Skia 编译为 WebAssembly (WASM) 的版本，它让 Skia 可以在浏览器中运行。在 Web 端使用 `@shopify/react-native-skia` 时，浏览器需要下载并加载 CanvasKit WASM 文件。

> **对 React Web 开发者的说明：** 这类似于你在 Web 项目中使用某些需要异步加载 WASM 或大型 JS 库的场景（例如加载 FFmpeg.wasm）。你需要确保 CanvasKit 文件能被正确访问，通常需要在构建配置中指定其 CDN 地址或本地路径。

具体配置方法需要参考库官方文档中的 Web 安装指南（原文档中未详细展开）。

## 关键概念解释

### Canvas 组件

`<Canvas>` 是 `@shopify/react-native-skia` 的核心容器组件，类似 Web 中的 `<canvas>` 元素，但功能更强大。所有 Skia 绘图操作都在 `<Canvas>` 内部进行。

### 声明式图形

不同于 Web Canvas 的命令式 API（`ctx.beginPath()`、`ctx.lineTo()` 等），Skia for React Native 让你用组件来描述图形：

- `<Circle>` — 圆形
- `<Rect>` — 矩形
- `<Path>` — 自定义路径
- `<Text>` — 文字（使用 Skia 的文字渲染引擎，不同于 React Native 的 `<Text>`）
- `<Image>` — 图片（Skia 处理的图片，支持滤镜和变换）

### 滤镜与着色器

Skia 支持丰富的图像处理能力，包括：

- **模糊（Blur）**
- **颜色矩阵（Color Matrix）**
- **混合模式（Blend Modes）**
- **自定义着色器（Shaders）** — 支持编写 GPU 着色器实现高级视觉效果

这些能力远超 CSS 滤镜（`filter: blur(5px)` 等），可以实现接近 Photoshop 级别的图像效果。

## 注意事项、限制条件和坑点

### 1. Web 平台必须额外配置

Web 平台不会开箱即用。如果忽略 CanvasKit 的配置步骤，在浏览器中运行时会报错或显示空白。务必按照官方 Web 安装指南完成配置。

### 2. 版本兼容性

使用 `expo install` 而非 `npm install` 来确保安装与当前 SDK 兼容的版本。版本不匹配可能导致原生模块加载失败，应用启动即崩溃。

### 3. 文档和 API 参考在外部

原文档本身是一个简要介绍页面，详细的 API 文档、教程和示例代码需要访问 `@shopify/react-native-skia` 的官方文档站点。学习这个库时，不能只看 Expo 文档，必须结合官方文档。

### 4. tvOS 支持

该库支持 tvOS（Apple TV），这在 Web 开发中是完全不涉及的领域。如果你有 Apple TV 应用的需求，这个库可以使用，但需要了解 tvOS 平台的特殊交互方式（如遥控器焦点管理）。

### 5. 性能考量

虽然 Skia 是高性能图形引擎，但在 React Native 中使用时，JS 线程和原生线程之间的通信仍然有开销。对于极端性能要求的场景（如实时视频处理），需要注意 JS 端逻辑的优化，避免在渲染循环中做大量计算。

## React Web 开发者需要特别注意的地方

### 1. 思维模式的转换

在 Web 中处理图形通常用 `<canvas>` + 命令式 JavaScript，或者用 SVG。`@shopify/react-native-skia` 虽然提供了声明式 API，但它的组件不是 HTML 元素，而是原生渲染的图形对象。不要试图用 CSS 思维去理解它们的样式属性。

### 2. 没有 CSS 布局系统

Skia 的图形不受 CSS 盒模型影响。`<Canvas>` 内部的坐标系是像素坐标，不是 flexbox 布局。你需要手动计算图形的位置和大小，或者使用 Skia 提供的布局辅助工具。

### 3. 调试方式不同

Web Canvas 可以用浏览器 DevTools 检查元素，但 Skia 图形是原生渲染的，无法用 React DevTools 检查每个图形元素。调试时需要依赖日志、截图对比等方式。

### 4. 包体积影响

Skia 是一个体积较大的原生库。在 Web 端，CanvasKit WASM 文件约 2-3 MB（gzip 后），会影响首屏加载时间。在移动端，它也会增加应用包体积。对于对包体积敏感的项目需要评估影响。

## 实际开发建议

### 何时使用 @shopify/react-native-skia

- 需要绘制自定义图表（折线图、柱状图、饼图等），且现有图表库不满足需求
- 需要实现复杂的动画效果，如粒子系统、路径动画
- 需要图像处理功能，如滤镜、裁剪、合成
- 需要实现自定义绘图工具或画板应用
- 需要高性能的自定义 UI 组件

### 何时不需要使用

- 简单的 UI 布局和样式——使用 React Native 内置的 `View`、`Text`、`StyleSheet` 即可
- 标准图表需求——可以使用 `react-native-chart-kit`、`victory-native` 等更简单的图表库
- 简单的图片显示——使用 React Native 内置的 `<Image>` 组件

### 学习路径建议

1. 先安装并在 Expo Go 中运行一个简单示例，确认环境正常
2. 阅读 `@shopify/react-native-skia` 官方文档的 Getting Started 教程
3. 从简单的图形（圆形、矩形）开始，逐步过渡到路径、动画
4. 如果需要 Web 支持，提前配置好 CanvasKit 加载

## 总结

`@shopify/react-native-skia` 是将 Google 的 Skia 2D 图形引擎引入 React Native 的库，由 Shopify 维护。它支持声明式 API，让你用 React 组件的方式绘制高性能图形，支持 Android、iOS、tvOS 和 Web 平台，并且已内置在 Expo Go 中。

对 React Web 开发者来说，核心差异在于：Skia 的图形是原生渲染的，不依赖 CSS 布局系统，Web 平台需要额外配置 CanvasKit，且调试方式与 Web DevTools 不同。安装时务必使用 `expo install` 确保版本兼容，学习时需结合库的官方文档（Expo 文档页面仅提供简介）。

---

## 文档导航

- **上一页**：[flash list](./230__flash-list.md)
- **下一页**：[stripe](./232__stripe.md)
