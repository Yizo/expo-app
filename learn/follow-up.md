# Expo 与 React Native 后续学习资源指南

> 原文标题：Learning resources  
> 文档更新时间：2026 年 5 月 21 日  
> 文档定位：完成 Expo 示例应用之后的后续学习路线

## 文档解决的问题

这篇文档并不继续实现某个具体功能，而是为已经完成 Expo 教程示例应用的开发者提供下一阶段的学习路线。

它主要帮助你：

1. 创建一个新的 Expo 项目。
2. 选择 SDK 54 或 SDK 56。
3. 了解 Expo 应用开发中的核心工具和流程。
4. 补充 React Native、布局、手势和动画知识。
5. 了解构建、调试、发布和应用商店提交流程。
6. 找到 Expo 社区支持渠道。

这是一篇**学习资源导航文档**，不是完整的环境安装、API 使用或应用发布教程。具体操作需要进入它列出的对应文档继续学习。

## 适用场景

这篇文档适合：

- 已完成 Expo 入门教程，希望继续系统学习的开发者。
- 熟悉 React Web，但不熟悉 React Native 和 Expo 的开发者。
- 准备从示例项目转向真实移动应用开发的开发者。
- 需要了解 Expo 学习路线、开发流程和发布入口的开发者。

当前文档未详细涉及：

- Node.js、Android Studio、Xcode 等环境的具体安装步骤。
- iOS 和 Android 原生工程结构。
- Expo 项目的完整目录结构。
- 应用签名、证书和商店审核的具体操作。
- 文档中各个 API 的详细参数。
- 生产项目的架构设计和状态管理方案。

## 从教程项目转向真实应用

### 创建 SDK 56 项目

文档给出的命令是：

```bash
npx create-expo-app@latest --template default@sdk-56
```

随后需要按照开发环境配置文档设置本地环境。

### 命令说明

- `npx`：下载并临时运行 npm 包提供的命令，不要求全局安装该工具。
- `create-expo-app@latest`：使用最新版 Expo 项目创建工具。
- `--template default@sdk-56`：明确要求使用基于 Expo SDK 56 的默认模板。
- Expo SDK：Expo 提供的一组版本化 JavaScript API、原生模块及相关工具。项目使用的 SDK 版本会影响可用能力和兼容性。

这里的“创建应用”是生成一个可继续开发的 Expo 工程，并不意味着已经生成可以提交到 App Store 或 Google Play 的最终安装包。

### SDK 56 过渡期的重要限制

原文明确警告：

> 在 SDK 56 过渡期，不添加 `--template` 参数的 `create-expo-app@latest` 会创建 SDK 54 项目。

因此，下面两条命令在当前过渡期并不等价：

```bash
# 创建 SDK 54 项目
npx create-expo-app@latest

# 创建 SDK 56 项目
npx create-expo-app@latest --template default@sdk-56
```

具体选择取决于运行方式：

| 使用场景 | 文档建议 |
| --- | --- |
| 使用 Expo Go 在真实手机上运行 | 创建 SDK 54 项目 |
| 不依赖 Expo Go 在真实手机上运行 | 使用 `--template default@sdk-56` 创建 SDK 56 项目 |

这里最容易误解的是：`@latest` 表示创建工具使用最新版本，不代表生成的项目一定使用最新 Expo SDK。过渡期内，项目 SDK 版本由默认行为或 `--template` 参数决定。

原文没有说明 SDK 56 过渡期何时结束，也没有进一步解释 Expo Go 使用 SDK 54 的技术原因。

## Expo 应用开发的后续学习路线

### 1. 开发工具

Expo 提供了覆盖应用开发不同阶段的工具。

原文将“Development tools”作为工具参考入口，但没有逐一列出具体工具，也没有给出每个工具的命令或配置方法。

对 React Web 开发者来说，可以将这类工具暂时理解为移动端项目中的开发服务器、运行环境、设备调试工具和构建工具集合。但具体组成需要阅读对应文档确认。

### 2. Development Build

Development Build 可以让开发者：

- 更完整地控制应用的构建过程。
- 在真实设备或模拟器上测试应用。

它不是普通浏览器中的开发页面，而是专门为开发和调试生成的应用构建版本。

React Web 项目通常只需要启动开发服务器并在浏览器中打开页面；移动应用则需要让 JavaScript 代码运行在具有 iOS 或 Android 原生能力的应用容器中。Development Build 是进入这一开发模式的重要学习内容。

原文没有给出创建 Development Build 的具体命令。

### 3. Expo 开发流程总览

“Development overview”提供：

- Expo 应用开发的关键概念。
- 核心开发循环的整体流程。

它适合在学习零散 API 之前阅读，用来建立从编写代码、运行、测试到构建应用的全局认识。

**基于文档内容推导：**对于没有移动开发经验的 React Web 开发者，应优先学习这一部分，因为移动应用的运行和构建流程与浏览器应用不同。

### 4. Expo Router

教程项目已经使用 Expo Router：

- 完成了基础路由。
- 实现了标签页导航器，即 tab navigator。

Expo Router 是 Expo 应用中的路由方案。对于 React Web 开发者，可以先将它类比为 React Router，但两者面向的界面载体和导航行为并不完全相同：

- Web 路由主要对应 URL 和浏览器历史记录。
- 移动端路由还对应屏幕切换、导航栈和底部标签栏等移动界面结构。

原文没有介绍 Expo Router 的文件路由规则、动态路由参数或导航 API，需要阅读对应文档。

### 5. App Icon、Splash Screen 和应用配置

文档建议继续学习：

- App Icon：安装后显示在设备桌面或应用列表中的图标。
- Splash Screen：应用启动过程中显示的启动画面。
- `app.json`：Expo 应用配置文件。

`app.json` 中可以配置应用属性。原文没有列出具体配置项，只指向了应用配置参考文档。

对 React Web 开发者来说，这些内容不应简单理解为网页中的 favicon 或首屏组件：

- App Icon 属于应用安装包和操作系统展示的一部分。
- Splash Screen 出现在应用原生启动阶段，不只是 React 渲染后的普通页面。
- 修改这些配置可能会影响应用构建结果，而不只是运行时 UI。

### 6. 构建、分发与商店提交

文档将发布流程分成两个学习方向：

- App distribution：构建并分发应用。
- Submission：向应用商店提交应用。

构建应用和提交商店不是同一步：

1. 先生成可以安装或发布的应用构建产物。
2. 再将符合要求的产物提交到对应应用商店。

原文没有详细说明：

- iOS 和 Android 分别生成什么文件。
- 如何处理证书、签名和开发者账号。
- App Store 和 Google Play 的审核要求。
- 构建和提交所需的具体命令。

### 7. 调试

文档指出，开发过程中出现问题时，可以使用调试工具定位并修复错误。

当前文档只提供运行时问题调试文档入口，没有介绍：

- 调试器的具体使用方式。
- 如何查看原生日志。
- 如何区分 JavaScript 错误与原生错误。
- iOS 和 Android 是否存在不同调试流程。

**基于文档内容推导：**从 React Web 转向移动开发时，不能只依赖浏览器 DevTools 的经验，需要继续学习 Expo 和 React Native 对应的调试工具。

## 需要补充的基础知识

### React

Expo 应用仍然使用 React 组件和 React API。原文明确指出，扎实的 React 基础是使用 Expo 构建应用的重要前提。

建议复习：

- React Quick Start。
- React Hooks。

你已有 React Web 开发经验，因此组件、Props、State 和 Hooks 等知识仍然适用。但 React 只负责组件模型，并不意味着 Web DOM、HTML 标签和浏览器 API 也能直接用于 React Native。

### React Native

教程应用大量使用了 React Native。原文建议从 React Native 基础指南开始，并重点学习以下内容。

#### `View`

`View` 是 React Native 的基础容器组件。

可以初步类比为 Web 中用于布局的 `<div>`，但它不是 DOM 元素，也不会最终生成 HTML。

#### `Text`

`Text` 用于显示文本。

React Web 中可以直接把文本放入很多 HTML 元素；React Native 有自己的文本组件和文本布局规则，因此需要专门学习 `Text` API。

#### 平台特定代码

React Native 应用可能需要根据 iOS 和 Android 使用不同代码。

原文建议学习 platform-specific code，但没有说明具体文件命名规则或判断 API。

这意味着“同一套 React 代码可以开发多个平台”不等于“所有代码在每个平台上的表现都完全一致”。

#### 列表数据展示

原文提供了列表数据展示相关文档入口。

移动端列表需要考虑屏幕空间、滚动和大量数据的渲染效率，不能简单照搬 Web 中对数组执行 `map()` 并生成任意 DOM 节点的思路。

当前文档没有明确介绍具体列表组件和性能策略。

## React Native 布局与 Flexbox

教程使用 Flexbox 布局组件。原文建议继续学习：

- Height and Width。
- Layout with Flexbox。

React Web 开发者虽然熟悉 CSS Flexbox，但需要注意：React Native 的布局系统不是浏览器 CSS 的完整实现。

当前文档没有列出 React Native Flexbox 与 Web Flexbox 的具体差异，因此不能仅根据本文断定默认方向、属性支持范围或单位规则。需要进入对应 React Native 文档确认。

**基于经验建议：**不要把现有 Web CSS 代码直接复制到 React Native 项目中。应逐项确认样式属性是否受支持，以及属性值的写法是否一致。

## 手势与动画

文档推荐两个独立工具。

### React Native Gesture Handler

用于学习和实现不同类型的手势交互。

移动端手势可能包括点击、拖动、滑动等操作。它们不应简单等同于 Web 中的鼠标事件，因为移动设备以触摸输入为主。

### React Native Reanimated

用于实现 React Native 动画。

文档建议从 Reanimated 的基础入门内容开始，但没有给出具体动画示例、配置步骤或 API 说明。

**基于文档内容推导：**Gesture Handler 负责识别和处理用户手势，Reanimated 负责动画表现；复杂交互可能同时使用两者。但当前文档没有明确描述二者的组合方式。

## React Web 开发者最容易误解的地方

### `@latest` 不代表最新 Expo SDK

`create-expo-app@latest` 中的 `latest` 指创建工具版本。在 SDK 56 过渡期，不指定模板仍会创建 SDK 54 项目。

### Expo Go 和 Development Build 不是同一个概念

原文分别提到了：

- 在真实设备上使用 Expo Go。
- 使用 Development Build 在设备或模拟器上测试。

文档没有完整解释二者差异，但不能把它们视为同一种运行方式。

### React Native 不运行在浏览器 DOM 上

虽然仍然编写 React 组件，但基础 UI 使用 `View`、`Text` 等 React Native 组件，而不是 `<div>`、`<span>` 等 HTML 元素。

### 熟悉 Web Flexbox 不代表已掌握 React Native 布局

概念可以迁移，但具体支持能力和行为需要查阅 React Native 文档。

### “写完代码”不等于“可以发布”

真实移动应用还需要经过构建、分发和商店提交。当前文档将它们作为独立学习主题。

### `app.json` 不只是普通前端运行时配置

其中部分配置会影响应用图标、启动画面以及应用构建结果。修改配置后是否需要重新构建，当前文档没有说明。

## 建议的实际学习顺序

以下顺序是**基于文档内容推导**，不是原文给出的强制顺序：

1. 确认是使用 Expo Go，还是使用 SDK 56 和 Development Build。
2. 使用明确的 SDK 模板创建项目。
3. 配置本地开发环境。
4. 阅读 Expo development overview，建立完整开发流程认知。
5. 学习 `View`、`Text`、列表和 React Native Flexbox。
6. 深入学习 Expo Router 和标签页导航。
7. 学习 Development Build，在设备或模拟器上测试。
8. 根据项目需要学习手势和动画。
9. 配置 App Icon、Splash Screen 和 `app.json`。
10. 学习运行时调试。
11. 应用准备完成后，再学习构建、分发和商店提交。

## 社区支持

文档建议加入 Expo Discord 社区，可以：

- 与其他 Expo 用户交流。
- 在遇到问题时提问。

当前文档没有列出论坛、GitHub Issues 或其他官方支持渠道。

## 明确内容与推导内容边界

### 文档明确说明

- 可以通过指定 SDK 56 模板创建新项目。
- SDK 56 过渡期内，无模板参数会创建 SDK 54 项目。
- 使用真实设备上的 Expo Go 时应选择 SDK 54 项目。
- 不采用上述 Expo Go 场景时，可以明确创建 SDK 56 项目。
- Development Build 提供更完整的构建控制，并可用于设备或模拟器测试。
- 教程使用了 Expo Router 和标签页导航。
- `app.json` 可以配置应用属性。
- 应继续学习构建、商店提交和调试。
- React 基础对 Expo 开发非常重要。
- 教程大量使用 React Native 和 Flexbox。
- 推荐使用 Gesture Handler 和 Reanimated 学习手势与动画。
- 可以通过 Expo Discord 参与社区交流。

### 基于文档内容推导

- React Web 开发者应优先建立移动应用开发流程的整体认知。
- Expo Router 可以帮助理解移动端屏幕导航，但不能与 Web 路由完全等同。
- Gesture Handler 和 Reanimated 在复杂交互中可能配合使用。
- `app.json` 中部分配置会影响构建产物，而不只是运行时页面。
- 构建应用与提交应用商店是两个不同阶段。
- 移动端调试不能完全依赖浏览器 DevTools 经验。

### 基于经验建议

- 创建项目时显式指定模板，避免仅根据 `@latest` 判断 SDK 版本。
- 不要直接复制 Web HTML、DOM API 或 CSS 到 React Native。
- 修改原生相关配置后，应查阅对应版本文档确认是否需要重新构建。
- 涉及平台行为时，应分别在 iOS 和 Android 上验证。

## 总结

这篇文档的核心作用是把开发者从“完成一个教程示例”引向真实 Expo 应用开发。

最重要的信息是 SDK 56 过渡期的版本选择：使用真实设备上的 Expo Go 时，文档建议使用 SDK 54；其他情况下，可通过 `--template default@sdk-56` 明确创建 SDK 56 项目。

后续学习应覆盖四个层次：

1. React 和 React Native 基础。
2. Expo 开发流程、Development Build 与 Expo Router。
3. 布局、列表、手势、动画和调试。
4. 应用配置、构建、分发与商店提交。

当前文档只提供学习地图和资源入口，并不包含上述主题的完整操作细节。
