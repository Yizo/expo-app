# Expo Go 中的第三方库概览

> 文档版本说明：原文修改于 2026 年 1 月 29 日，描述的是**下一个 Expo SDK 版本（unversioned）**，并非当前稳定版本。原文指出当前最新稳定版本为 **SDK 56**。实际项目应核对所使用 SDK 对应的文档版本。

## 文档解决的问题

这篇文档回答一个核心问题：**在 Expo Go 沙盒环境中，哪些第三方 npm 包可以直接使用，而不需要自己构建原生代码？**

对于刚从 React Web 转到 React Native / Expo 的开发者来说，这是一个关键问题。在 Web 开发中，`npm install` 一个包之后就可以直接使用，因为浏览器就是运行环境。但在移动端，很多 npm 包包含**原生代码**（即 iOS 的 Swift/ObjC 代码和 Android 的 Java/Kotlin 代码），这些代码需要编译进最终的应用才能运行。

Expo Go 是一个预编译好的移动端沙盒应用，它**预先内置**了一批常用的第三方库。这些库的原生代码已经被编译进去了，你可以直接 `npm install` 并在代码中 `import` 使用，无需自己配置 Xcode 或 Android Studio。

但如果某个库**不在**这个预置列表中，且它包含原生代码，你就无法在 Expo Go 中使用它——必须转向**自定义开发构建（Development Build）**。

## 阅读前需要理解的背景知识

### Expo Go 是什么

Expo Go 可以理解为一个"移动端 playground"。它是一个预先构建好的 iOS/Android 应用，你可以通过手机扫码来运行自己写的项目代码。

对 React Web 开发者来说，它类似于：你写的前端代码可以在浏览器的开发者工具中即时预览，而不需要配置 Webpack、启动服务器、打包部署。Expo Go 做了类似的事情，只不过运行环境从浏览器变成了手机。

**关键限制**：Expo Go 只能运行它已经内置了原生代码的那些库。就像浏览器只能运行浏览器支持的 API 一样，Expo Go 只能运行它预装了原生模块的库。

### 什么是"原生代码"

在 React Web 中，所有代码都是 JavaScript/TypeScript，运行在浏览器引擎中。但在 React Native 中，部分功能（如相机、地图、动画引擎）需要调用操作系统提供的原生 API，这就需要用到原生代码。

一个 npm 包如果**只包含 JavaScript/TypeScript 代码**，那么它在 Expo Go 中可以直接使用，无需预置。但如果一个包**包含原生代码**（如 `react-native-maps` 需要调用 Google Maps / Apple Maps 的 SDK），它就必须被预先编译进 Expo Go 才能使用。

### 自定义开发构建（Development Build）

自定义开发构建是指：你不再使用 Expo Go 这个预编译的沙盒应用，而是自己编译一个包含所有需要的原生代码的客户端应用。

这类似于 React Web 中从"使用 Create React App 的默认配置"过渡到"自己配置 Webpack"。你可以安装任何包含原生代码的库，但代价是需要管理原生构建流程。

文档末尾提供了相关资源链接，帮助你在需要时过渡到自定义开发构建。

### SDK 版本与库兼容性

文档中列出的库列表对应的是下一个 SDK 版本。每个 Expo SDK 版本都会对这些第三方库进行**验证**，确保它们与当前版本的 Expo 兼容。

这意味着：
- 升级 Expo SDK 时，这些预置库的版本可能也会变化。
- 如果你使用的是 SDK 56，应查看 SDK 56 对应的文档来确认库列表。

## Expo Go 预置的第三方库列表

以下 20 个库的原生代码已被预编译进 Expo Go，可以直接使用：

| 包名 | 用途简述 |
|---|---|
| `@react-native-async-storage/async-storage` | 设备本地持久化存储（类似 Web 的 `localStorage`） |
| `@react-native-community/datetimepicker` | 日期和时间选择器组件 |
| `@react-native-community/netinfo` | 获取设备网络连接状态信息 |
| `@react-native-community/slider` | 滑块（Slider）输入组件 |
| `@react-native-masked-view/masked-view` | 遮罩视图，用于创建不规则形状的裁剪效果 |
| `@react-native-picker/picker` | 下拉选择器组件（类似 Web 的 `<select>`） |
| `@react-native-segmented-control/segmented-control` | 分段控制器组件（类似 iOS 的 Tab 切换栏） |
| `@shopify/flash-list` | 高性能列表组件，是 React Native 内置 `FlatList` 的优化替代品 |
| `@shopify/react-native-skia` | 基于 Skia 引擎的 2D 图形绘制库 |
| `@stripe/stripe-react-native` | Stripe 支付集成 |
| `react-native-gesture-handler` | 手势识别和处理库 |
| `react-native-keyboard-controller` | 键盘行为控制（如键盘弹出时自动调整布局） |
| `react-native-maps` | 地图组件（Google Maps / Apple Maps） |
| `react-native-pager-view` | 可左右滑动的分页视图（类似 Web 的轮播/Swiper） |
| `react-native-reanimated` | 高性能动画库，支持在 UI 线程运行动画 |
| `react-native-safe-area-context` | 安全区域上下文，处理刘海屏、底部手势条等区域 |
| `react-native-screens` | 原生屏幕导航优化，提升页面切换性能 |
| `react-native-svg` | SVG 矢量图形渲染 |
| `react-native-view-shot` | 将视图截图为图片 |
| `react-native-webview` | 在应用中嵌入网页内容的 WebView 组件 |

> **基于文档内容推导**：这个列表在每次 SDK 更新时会进行验证，具体可用版本以你当前使用的 SDK 版本对应的文档为准。

## 如何使用这些库

### 安装方式

这些库和其他 npm 包一样安装：

```bash
npx expo install @react-native-async-storage/async-storage
```

使用 `npx expo install` 而不是 `npm install` 的原因是：Expo 会自动选择与当前 SDK 版本兼容的包版本。这是一个重要的区别——在 React Web 中你通常直接用 `npm install`，但在 Expo 项目中推荐使用 `npx expo install` 来确保版本匹配。

### 使用方式

安装后直接在代码中导入即可：

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储数据
await AsyncStorage.setItem('userToken', 'abc123');

// 读取数据
const token = await AsyncStorage.getItem('userToken');
```

不需要进行任何额外的原生配置（如修改 `Podfile`、`build.gradle` 或链接原生模块），因为 Expo Go 已经内置了这些库的原生代码。

## 超出预置列表的库怎么办

如果你需要的库**不在**上述 20 个预置库中，有两种情况：

### 纯 JavaScript/TypeScript 库

如果这个库不包含原生代码（例如 `lodash`、`date-fns`、`zustand` 等），可以直接 `npm install` 使用，不受 Expo Go 的限制。

判断方法：查看包的 `README` 或安装说明，如果它没有要求你修改原生配置文件（如 `ios/` 或 `android/` 目录下的文件），通常是纯 JS 库。

### 包含原生代码的库

如果这个库包含原生代码且不在预置列表中（例如 `react-native-bluetooth-classic`、`react-native-nfc-manager` 等），你**无法在 Expo Go 中使用它**。

解决方案是切换到**自定义开发构建（Development Build）**。自定义开发构建允许你安装任何包含原生代码的库，但需要自己管理原生编译流程。

> **对 React Web 开发者的类比**：这就像在 Web 项目中，所有纯 JS 库都可以直接 `npm install`，但如果某个库需要浏览器原生不支持的插件（比如一个需要本地 C++ 编译的 Node.js addon），你就需要自己配置构建环境。

## 注意事项、限制条件和坑点

### 1. 版本锁定

Expo Go 预置的库版本是与 SDK 版本绑定的。你不能在 Expo Go 中使用与 SDK 不匹配的库版本。例如，如果 SDK 56 预置了 `react-native-reanimated@3.x`，你不能在 Expo Go 中使用 `react-native-reanimated@2.x`。

在 React Web 中，你通常可以自由升降包版本。但在 Expo Go 环境中，版本由 SDK 决定。

### 2. 文档版本陷阱

当前文档页面标注的是 **unversioned**（下一个版本），如果你正在使用稳定版 SDK（如 SDK 56），务必查看对应版本的文档，否则库列表可能存在差异。

### 3. "预置"不等于"自动配置"

虽然这些库的原生代码已经预装在 Expo Go 中，但你在 JavaScript 层面仍然需要正确安装和使用它们。`npx expo install` 安装的是 JavaScript 包，原生代码部分由 Expo Go 应用本身提供。

### 4. 从 Expo Go 迁移到自定义构建时的变化

当你从 Expo Go 迁移到自定义开发构建后，这些库不再"免费预装"——你需要将它们作为普通依赖安装，并管理原生构建流程。但好消息是，Expo 的预构建配置（Prebuild）会自动处理大部分原生配置工作。

### 5. 社区维护

文档明确指出这些库是 **community-driven（社区驱动）** 的。这意味着：
- 它们不是 Expo 官方开发的库，而是由社区维护。
- 质量、更新频率和文档完善程度可能参差不齐。
- 遇到问题时，可能需要去对应库的 GitHub 仓库查找解决方案。

## React Web 开发者需要特别注意的地方

### 生态差异

在 React Web 中，npm 生态中的包几乎都可以直接安装使用，因为运行环境（浏览器）是固定的。但在 React Native + Expo 生态中，包分为三类：

1. **纯 JS/TS 包**：可以直接使用，和 Web 一样。
2. **包含原生代码、但已被 Expo Go 预置的包**：可以直接使用，就是本文列出的这些。
3. **包含原生代码、未被 Expo Go 预置的包**：需要自定义开发构建才能使用。

这个分类在 React Web 中不存在，是移动端开发特有的概念。

### 安装命令的区别

- `npm install <package>`：只安装 JavaScript 包，不处理原生代码。
- `npx expo install <package>`：安装 JavaScript 包，并自动选择与当前 SDK 兼容的版本。

在 Expo 项目中，**始终推荐使用 `npx expo install`** 来安装依赖。

### 不要混淆"Expo 官方库"和"第三方库"

Expo 官方库（如 `expo-camera`、`expo-location`）是 Expo 团队开发和维护的。本文列出的第三方库（如 `react-native-reanimated`、`react-native-maps`）是社区开发但被 Expo Go 预置的。两者在使用方式上类似（都可以在 Expo Go 中直接使用），但维护方和更新节奏不同。

## 实际开发建议

1. **项目初期优先使用 Expo Go**：如果你刚开始学习 Expo，先用 Expo Go 快速原型验证，充分利用这 20 个预置库。

2. **提前规划库选型**：在选择第三方库之前，先确认它是否在 Expo Go 的预置列表中，或者是否是纯 JS 库。如果一个核心功能依赖于不在列表中的原生库，你可能需要从一开始就使用自定义开发构建。

3. **使用 `npx expo install`**：养成习惯，所有依赖都通过 `npx expo install` 安装，避免版本不兼容问题。

4. **关注 SDK 升级**：每次升级 Expo SDK 时，检查这些预置库是否有版本变化或行为变更。SDK 升级日志（Changelog）通常会列出相关变化。

5. **基于经验建议**：在项目早期就评估是否需要自定义开发构建。如果你的项目需要大量不在预置列表中的原生库（如蓝牙、NFC、特定硬件 SDK），建议直接使用自定义开发构建，避免后期迁移成本。

## 总结

这篇文档是 Expo Go 生态中第三方库的"入口索引"。它告诉你：

- Expo Go 预装了 20 个社区维护的第三方库，涵盖存储、UI 组件、地图、支付、动画、手势、WebView 等常见需求。
- 这些库可以直接使用，无需自定义原生构建。
- 如果需要其他包含原生代码的库，必须使用自定义开发构建。
- 每个库都有独立的详细文档页面（本系列文档中的后续页面）。

对于 React Web 开发者来说，核心认知转变是：**移动端的 npm 包不只是 JavaScript 代码，还可能包含原生代码，而原生代码需要编译环境的支持**。Expo Go 通过预置一批常用库来降低入门门槛，但这同时也意味着库的选择范围受到限制。当你需要更多自由度时，自定义开发构建是下一步。

---

## 文档导航

- **上一页**：[widgets](./221__widgets.md)
- **下一页**：[async storage](./223__async-storage.md)
