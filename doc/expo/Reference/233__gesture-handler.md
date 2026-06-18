# react-native-gesture-handler（手势处理库）

## 文档解决的问题

在移动端应用中，用户的手势交互（滑动、捏合、旋转、长按等）远比 Web 端的鼠标点击和简单触摸复杂。React Native 内置的触摸系统（如 `TouchableOpacity`、`PanResponder`）虽然能处理基础交互，但在复杂手势场景下存在性能不足、手势冲突难管理、响应不够精准等问题。

`react-native-gesture-handler` 正是为了解决这些问题而生。它提供了一套完整的手势识别 API，能够调用移动平台原生的触摸和手势处理能力，让手势识别逻辑完全运行在原生线程（Native Thread）中，从而保证行为的确定性和高性能。

**对于有 React Web 经验的开发者来说：** 在 Web 端，你可能用过 `onTouchStart`、`onTouchMove` 等事件或第三方手势库（如 `hammer.js`、`@use-gesture/react`）。`react-native-gesture-handler` 的定位类似于这些 Web 手势库，但它的底层实现和架构思路完全不同——它直接调用 iOS/Android 的原生手势识别器，而不是在 JavaScript 层模拟。

## 阅读前需要理解的背景知识

### 什么是"原生线程"（Native Thread）

在 React Native 架构中，JavaScript 代码运行在独立的 JS 线程中，而 UI 渲染和原生交互运行在主线程（即原生线程）。React Web 中没有这个区分——浏览器中 JavaScript 和渲染都在同一个线程（虽然有 Web Worker，但通常不用于 UI 事件处理）。

`react-native-gesture-handler` 的核心优势在于：手势识别逻辑直接在原生线程执行，不需要等待 JS 线程响应。这意味着即使 JS 线程繁忙（比如正在执行复杂的状态更新或动画），手势识别仍然能流畅响应。

### 什么是 Expo Go

Expo Go 是 Expo 提供的一个"沙盒"应用，它预装了大量常用的原生模块。开发者无需自己编译原生代码，就能在手机上预览和测试项目。`react-native-gesture-handler` 已经内置在 Expo Go 中，这意味着如果你使用 Expo Go 进行开发，安装后无需额外配置原生代码。

**Web 对比：** 这类似于 Web 开发中使用 CDN 引入一个库就能直接用，而不需要配置 webpack 或构建工具。

### 什么是"确定性行为"（Deterministic Behavior）

原文档提到手势识别逻辑"runs 100% in the native thread and is therefore deterministic"。这里的"确定性"是指：由于手势识别在原生线程执行，不受 JS 线程的异步调度影响，因此手势的识别顺序、触发时机和响应行为是稳定可预测的。在复杂的多手势场景中，这一点尤为重要——你不会遇到"同样的操作有时触发 A 手势、有时触发 B 手势"的竞态问题。

## 核心内容

### 库的定位与功能

`react-native-gesture-handler` 由 [Software Mansion](https://github.com/software-mansion) 团队维护（这也是 React Native 生态中 `react-native-reanimated` 等核心库的开发者），源码托管在 GitHub 的 `software-mansion` 组织下。

它提供的核心能力包括：

- **基础手势识别器**：如点击（Tap）、长按（Long Press）、拖拽（Pan）、捏合（Pinch）、旋转（Rotation）、轻扫（Fling）等
- **手势组合与冲突管理**：允许多个手势同时存在或互斥，开发者可以精确控制手势之间的优先级和依赖关系
- **原生性能**：所有手势识别逻辑在原生线程执行，避免了 JS 线程的延迟和丢帧
- **跨平台支持**：支持 Android、iOS、Web 三个平台

**Web 对比：** 如果你在 Web 端用过 `@use-gesture/react`，它提供类似的 API（如 `useDrag`、`usePinch`），但完全在 JavaScript 层实现。`react-native-gesture-handler` 的优势在于底层直接调用原生手势系统，性能和精度更高。

### 支持的平台

| 平台 | 支持状态 |
| --- | --- |
| Android | 支持 |
| iOS | 支持 |
| Web | 支持 |
| Expo Go | 内置（无需额外原生配置） |

这意味着你可以在 Expo 项目中直接使用这个库，而不需要弹出（eject）到裸 React Native 项目或使用 EAS Build 进行自定义构建。

## 安装配置

### 安装命令

根据你使用的包管理器，选择对应的安装命令：

```sh
# 使用 npm
npx expo install react-native-gesture-handler

# 使用 yarn
yarn expo install react-native-gesture-handler

# 使用 pnpm
pnpm expo install react-native-gesture-handler

# 使用 bun
bun expo install react-native-gesture-handler
```

**命令说明：** `expo install` 是 Expo 提供的专用安装命令，它会自动选择与当前 Expo SDK 版本兼容的包版本。这与 Web 开发中直接 `npm install xxx` 不同——在 Expo 项目中，应该始终优先使用 `expo install` 而不是 `npm install`，因为 Expo 对每个 SDK 版本支持的原生模块版本有明确的对应关系，使用错误的版本可能导致原生代码不兼容、应用崩溃等问题。

### 已有 React Native 项目的注意事项

如果你是在一个**已有的 React Native 项目**中添加 `react-native-gesture-handler`（而不是从零开始的 Expo 项目），需要：

1. **先安装 `expo` 模块**：已有项目可能尚未集成 Expo 相关模块，需要先完成这一步
2. **按照官方文档或仓库 README 中的配置指南完成额外设置**：这通常涉及修改原生代码（如 Android 的 `MainActivity.java` 中包裹 `ReactActivityDelegate`，iOS 的相关配置等）

**Web 对比：** 在 Web 项目中，安装一个 npm 包通常只需要一行命令就能完成。但在移动端项目中，许多库包含原生代码（C++/Java/Swift/Kotlin），安装后可能还需要修改平台特定的配置文件。这是移动端开发与 Web 开发的一个根本区别。

## 关键概念解释

### Gesture Handler（手势处理器）

这是库的核心抽象。在 Web 端，你通过 `addEventListener` 给 DOM 元素绑定事件。在 `react-native-gesture-handler` 中，你通过声明式的 API 创建手势处理器（Gesture Handler），然后将它们绑定到 React Native 的组件上。每个手势处理器负责识别一种特定的手势类型。

### 原生线程执行 vs JS 线程执行

| 特性 | JS 线程执行（React Native 内置） | 原生线程执行（Gesture Handler） |
| --- | --- | --- |
| 手势识别位置 | JavaScript 层 | 原生层（iOS UIKit / Android Gesture System） |
| 性能 | 受 JS 线程负载影响 | 不受 JS 线程影响 |
| 确定性 | 可能出现竞态和延迟 | 行为稳定、可预测 |
| 适用场景 | 简单触摸（点击、滚动） | 复杂手势（拖拽、捏合、多手势组合） |

### Reanimated 的关系

虽然当前文档没有详细展开，但值得了解：`react-native-gesture-handler` 经常与 `react-native-reanimated` 配合使用。Reanimated 是另一个由 Software Mansion 开发的动画库，它同样在原生线程执行。两者结合可以实现极其流畅的手势驱动动画（如拖拽卡片、下拉刷新、滑动删除等）。

**基于文档内容推导：** 原文档的"Related pages"（相关页面）列表中同时包含 `reanimated`，且这两个库由同一团队维护，在 Expo 生态中是常见的搭配组合。

## 注意事项、限制条件和坑点

### 1. 版本兼容性

原文档标注了一个版本提示（Version Notice），说明当前页面内容针对的是即将发布的 SDK 版本（unversioned），而非当前稳定版 SDK 56。在实际项目中，应参考与你使用的 Expo SDK 版本对应的文档，避免 API 不匹配。

### 2. 已有项目集成的额外步骤

如前文所述，已有 React Native 项目需要额外的原生配置步骤。如果跳过这些步骤，手势处理器可能无法正确初始化，导致手势完全无响应或应用崩溃。

### 3. Web 平台的支持

虽然库声明支持 Web 平台，但 Web 端的实现通常是通过 JavaScript 模拟原生手势（因为浏览器没有真正的"原生手势系统"）。这意味着 Web 端的手势体验和性能可能与 iOS/Android 原生端有差异。如果你的项目同时需要支持 Web，建议在 Web 端充分测试手势交互。

### 4. Expo Go 的内置限制

Expo Go 中内置的是特定版本的 `react-native-gesture-handler`。如果你需要使用最新版本中刚添加的功能，可能需要使用 EAS Build 进行自定义构建，而不是依赖 Expo Go。

## React Web 开发者需要特别注意的地方

### 思维模式的转变

在 Web 开发中，几乎所有交互都通过 DOM 事件系统处理。你习惯了用 `onClick`、`onMouseDown`、`onTouchStart` 等事件属性来实现交互逻辑。但在 React Native 中：

- **没有 DOM**：React Native 使用原生视图组件（`View`、`Text` 等）代替 HTML 元素
- **事件系统不同**：React Native 有自己的事件系统，而 `react-native-gesture-handler` 在此基础上提供了更底层、更强大的手势处理能力
- **手势和动画常常需要联动**：在 Web 端，你可以用 CSS 动画或 Framer Motion 轻松实现动画效果；在 React Native 中，手势驱动的动画通常需要 `react-native-gesture-handler` + `react-native-reanimated` 配合

### 不要在 Web 端和移动端之间直接复制手势逻辑

即使 `react-native-gesture-handler` 支持 Web 平台，它的 API 设计与 Web 端的手势库完全不同。你不能直接把 Web 端的 `@use-gesture` 代码迁移过来，需要按照 `react-native-gesture-handler` 的声明式 API 重新编写。

### 安装命令的区别

在 Web 项目中，你习惯用 `npm install` 或 `yarn add`。在 Expo 项目中，应该改用 `npx expo install`（或对应的包管理器变体）。这个命令会自动锁定与当前 Expo SDK 兼容的版本，是避免原生代码版本冲突的关键。

## 实际开发建议

### 何时需要引入这个库

- 应用中有**拖拽排序**（如看板、列表项拖动）
- 需要**滑动操作**（如左滑删除、右滑返回）
- 需要**捏合缩放**或**旋转**（如图片查看器、地图交互）
- 需要**复杂的多手势组合**（如同时支持点击、长按、拖拽）
- 需要**高性能的手势响应**（如游戏中的人物控制、绘图应用）

### 何时可以不用

如果只是简单的按钮点击、页面滚动等基础交互，React Native 内置的 `TouchableOpacity`、`Pressable`、`ScrollView` 等组件已经足够，不需要额外引入 `react-native-gesture-handler`。

### 学习路径建议

1. **先掌握基础**：了解 React Native 内置的触摸事件系统（`Pressable`、`onPress` 等）
2. **再学习本库**：阅读 [react-native-gesture-handler 官方文档](https://docs.swmansion.com/react-native-gesture-handler/) 中的 Getting Started 和基础手势类型
3. **结合 Reanimated**：学习如何将手势与动画结合，实现流畅的交互效果
4. **在 Expo Go 中快速验证**：利用 Expo Go 的内置支持，快速在真机上测试手势效果

## 总结

`react-native-gesture-handler` 是 React Native / Expo 生态中处理复杂手势的核心库。它的核心价值在于：

1. **原生线程执行**：手势识别逻辑不经过 JS 线程，性能优异且行为确定
2. **声明式 API**：用 React 风格的 API 声明手势处理器，与 React Native 组件无缝集成
3. **跨平台支持**：一套 API 覆盖 Android、iOS 和 Web
4. **Expo Go 内置**：在 Expo 项目中开箱即用，无需额外原生配置

对于从 React Web 转向移动端的开发者，这个库代表了移动端手势处理与 Web 端事件处理的本质区别——移动端的手势系统更底层、更复杂，但也更强大。理解"原生线程 vs JS 线程"这一核心架构差异，是掌握这个库的关键前提。

**当前文档未涉及的内容：** 原文档是一篇概述和安装指南性质的页面，没有提供具体的 API 用法示例、手势类型详细说明或代码教程。完整的 API 文档和使用教程需要参考 [react-native-gesture-handler 的官方文档站点](https://docs.swmansion.com/react-native-gesture-handler/)。

---

## 文档导航

- **上一页**：[stripe](./232__stripe.md)
- **下一页**：[keyboard controller](./234__keyboard-controller.md)
