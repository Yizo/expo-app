# react-native-screens -- 原生屏幕组件

## 文档信息

- **文档地址**：https://docs.expo.dev/versions/unversioned/sdk/screens.md
- **适用平台**：Android、iOS、tvOS、Web、Expo Go
- **所属库**：`react-native-screens`

---

## 文档解决的问题

在 React Web 中，页面切换通常通过 DOM 操作或 CSS 动画来实现，浏览器对页面的渲染和回收有一套成熟的机制。但在 React Native 中，情况有所不同。

React Native 默认的 `<View>` 组件是一个通用的容器，它并不具备"屏幕"（Screen）的语义。当你使用多个 `<View>` 来代表不同的页面时，操作系统无法知道哪些视图是当前活跃的屏幕、哪些已经不在屏幕上。这会导致以下问题：

- **内存无法及时释放**：不在屏幕上的 `<View>` 仍然占用内存和系统资源。
- **动画和转场性能差**：系统无法针对屏幕级别的视图做优化。
- **与原生导航行为不一致**：iOS 和 Android 都有自己的原生屏幕管理机制（如 iOS 的 `UIViewController`、Android 的 `Activity` / `Fragment`），纯 `<View>` 无法利用这些能力。

`react-native-screens` 就是为了解决这个问题而诞生的。它提供**原生原语（native primitives）**来代替普通的 `<View>` 组件表示屏幕，让操作系统能正确识别和管理屏幕的生命周期，从而提升性能。

---

## 核心概念

### 什么是"原生原语（Native Primitives）"

在 React Web 开发中，你使用的 `<div>`、`<span>` 等标签最终会映射为浏览器的 DOM 节点。类似地，React Native 的 `<View>` 最终映射为平台原生的视图组件（iOS 上是 `UIView`，Android 上是 `android.view.View`）。

"原生原语"指的是 `react-native-screens` 在原生层提供了专门的屏幕组件，这些组件带有"屏幕"语义，操作系统能够：

- 知道哪些视图是屏幕容器
- 在屏幕不可见时暂停或回收资源
- 使用原生的转场动画进行屏幕切换

你可以把它理解为：普通的 `<View>` 是一个通用的"盒子"，而 `react-native-screens` 提供的组件是一个有明确"页面"身份的"盒子"，操作系统能区别对待它们。

### 它与 React Navigation 的关系

`react-native-screens` 不仅是一个独立的库，它还是 **React Navigation**（React Native 生态中最主流的路由导航库）底层依赖的核心组件。

具体来说，React Navigation 的 **Native Stack Navigator**（原生堆栈导航器）就是基于 `react-native-screens` 构建的。Native Stack Navigator 使用原生平台的导航栈（iOS 的 `UINavigationController`、Android 的 `Fragment`）来管理页面，而 `react-native-screens` 提供了这些原生导航栈所需的屏幕元素。

> **对 React Web 开发者的类比**：在 Web 中，React Router 负责路由管理，但它并不关心底层 DOM 如何优化。而在 React Native 中，React Navigation 相当于 React Router，`react-native-screens` 则相当于底层的 DOM 优化层，让路由切换时能利用原生能力。

### 主要使用者

文档指出，这个库**主要面向库开发者**（library developers），即开发导航库或其他需要管理屏幕的框架的开发者。对于普通应用开发者来说，你通常不需要直接操作 `react-native-screens` 的 API，而是通过 React Navigation 间接使用它。

---

## 安装方法

根据你使用的包管理器，选择对应的安装命令：

### npm

```sh
npx expo install react-native-screens
```

### yarn

```sh
yarn expo install react-native-screens
```

### pnpm

```sh
pnpm expo install react-native-screens
```

### bun

```sh
bun expo install react-native-screens
```

**命令说明**：

- `expo install` 是 Expo 提供的依赖安装命令，它会自动选择与当前 Expo SDK 版本兼容的包版本，避免版本冲突。这与直接用 `npm install` 不同 -- 后者可能安装不兼容的版本导致运行时错误。
- 安装完成后，在 Expo 托管的项目中（Managed Workflow），不需要额外的原生配置，Expo 会自动链接原生模块。

> **对 React Web 开发者的提醒**：在 Web 项目中，`npm install` 通常就够了，不需要考虑原生链接。但在 React Native / Expo 项目中，很多库包含原生代码（Objective-C、Swift、Java、Kotlin），需要正确链接到原生工程中。`expo install` 帮你处理了这件事。

---

## 已有 React Native 项目中的集成

如果你不是从零开始的 Expo 项目，而是在**已有的 React Native 项目**中集成，文档指出需要：

1. **先添加 Expo 核心模块**：已有的纯 React Native 项目没有 Expo 的基础设施，需要先引入 Expo 核心模块。
2. **然后按照 `react-native-screens` 官方仓库中的设置步骤进行配置**：官方仓库（由 Software Mansion 维护）中有详细的原生工程配置说明，包括 iOS 的 Pod 安装和 Android 的 Gradle 配置。

> **背景说明**：Expo 项目分为"托管工作流"（Managed Workflow）和"裸工作流"（Bare Workflow）。托管工作流中 Expo 帮你管理原生代码，安装即用；裸工作流（包括已有 RN 项目）需要你手动管理原生工程，所以步骤更多。

---

## 注意事项与限制

### 平台兼容性

`react-native-screens` 支持以下平台：

| 平台 | 支持状态 |
|------|---------|
| Android | 支持 |
| iOS | 支持 |
| tvOS | 支持 |
| Web | 支持 |
| Expo Go | 支持 |

> **tvOS 说明**：tvOS 是 Apple TV 的操作系统。如果你开发的应用需要在 Apple TV 上运行，`react-native-screens` 也提供了支持。这在 Web 开发中没有对应概念。

### 文档版本说明

文档开头标注"This guide applies to the upcoming SDK iteration"，意思是本指南适用于即将发布的 SDK 版本。如果你使用的是当前稳定版 SDK（文档中提到参考 SDK 56），部分内容可能有差异，建议查阅对应版本的文档。

---

## React Web 开发者需要特别注意的地方

1. **"屏幕"不等于"页面"**：在 Web 中，"页面"通常指一个 URL 对应的 HTML 文档或一个路由对应的 React 组件。在 React Native 中，"屏幕"（Screen）是一个原生视图容器，它不仅承载 UI 内容，还参与操作系统的视图管理和生命周期控制。不要简单地把 Web 中的"页面"概念套用到"屏幕"上。

2. **你大概率不需要直接使用这个库**：如果你是应用开发者（而非库开发者），你通常通过 React Navigation 间接使用 `react-native-screens`。只要正确安装了它，React Navigation 会自动利用其原生优化能力。

3. **`expo install` 与 `npm install` 的区别**：Web 项目中 `npm install` 是标准做法，但在 Expo 项目中应始终使用 `expo install` 来安装依赖，以确保原生兼容性。

4. **Web 平台的降级处理**：虽然 `react-native-screens` 支持 Web 平台，但在 Web 上它不会使用原生原语（因为浏览器没有对应的概念），而是降级为普通的 HTML 元素。这意味着在 Web 端你不会获得与移动端相同的原生性能优化，但代码仍然可以正常运行。

---

## 实际开发建议

1. **确保安装即可**：对于大多数 Expo + React Navigation 项目，你只需要运行 `npx expo install react-native-screens` 完成安装，不需要编写额外的配置代码。React Navigation 的 Native Stack Navigator 会自动使用它。

2. **不要跳过这个依赖**：如果你在项目中使用了 React Navigation 的 Native Stack Navigator（`@react-navigation/native-stack`），但忘记安装 `react-native-screens`，导航器将回退到纯 JavaScript 实现，性能会明显下降。

3. **查阅完整 API 文档**：Expo 文档页面只提供概览。如果你需要深入了解 `react-native-screens` 的具体 API（如 `Screen`、`ScreenContainer`、`enableScreens` 等），文档建议访问 **Software Mansion 的文档站点**获取完整的 API 参考和实现指南。

4. **已有项目迁移时注意原生配置**：如果你从纯 React Native 项目迁移到 Expo，或需要在已有项目中添加此库，除了 `expo install` 之外，还需按照官方仓库的说明完成原生工程配置，否则可能出现编译错误或运行时崩溃。

---

## 总结

`react-native-screens` 是一个底层性能优化库，它通过提供带有"屏幕"语义的原生组件，让操作系统能更高效地管理视图资源和执行转场动画。它是 React Navigation 原生堆栈导航器的核心依赖。

对于应用开发者来说，核心行动点是：**使用 `expo install` 正确安装它，然后交给 React Navigation 去使用**。除非你在开发导航相关的库，否则不需要深入研究其底层 API。

---

## 文档导航

- **上一页**：[safe area context](./238__safe-area-context.md)
- **下一页**：[svg](./240__svg.md)
