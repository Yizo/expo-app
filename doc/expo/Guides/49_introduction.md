# Expo Router 简介

## 文档解决的问题

这篇文档解决的是：Expo Router 是什么、为什么值得在 Expo 项目里使用、它相对传统 React Native 导航方式的优势是什么，以及如何快速开始。

## 适用场景

- 你是 React Web 开发者，第一次接触 Expo Router。
- 你想理解“文件路由”在 React Native / Web 通用应用中的作用。
- 你正在比较 Expo Router、React Navigation、React Native CLI / Expo 之间的关系。

## React Web 开发者先要补的背景

- `Expo Router` 是路由库 / 路由框架能力，不是 Expo 本身。
- `Expo` 是构建和开发应用的一整套平台与工具。
- `React Native` 是跨平台 UI 运行时。
- 对 Web 开发者来说，可以把 Expo Router 理解成“把 Next.js / Remix 风格的文件路由思想带到 React Native + Web 的通用应用里”。

## 文档中的核心定义

文档明确说明：

- Expo Router 是一个开源路由库。
- 它面向 Universal React Native applications。
- 它是文件路由系统。
- 当你在 `app` 目录里新增文件时，这个文件会自动成为一个路由。

## 它主要解决什么问题

### 1. 统一 Android、iOS、Web 的导航方式

文档强调，你可以用同一套路由结构管理多个平台的页面切换。

### 2. 让每个页面天然拥有 URL

这对 Web 很自然，但对原生 App 并不是默认状态。Expo Router 把“页面可被 URL 访问”带到了移动端。

### 3. 把深链、分享链接、Web 静态渲染等能力提前内建

文档反复强调的优势包括：

- deep link
- universal link
- static rendering
- typed routes
- bundle splitting

## 快速开始

文档推荐直接创建新项目：

```sh
# npm
npx create-expo-app@latest --template default@sdk-56
```

然后启动：

```sh
# npm
npx expo start
```

文档还明确提示：

- `W`：在浏览器打开
- `A`：在 Android 打开
- `I`：在 iOS 打开

### 关于 SDK 56 过渡期的特别说明

文档明确说明：在 SDK 56 过渡期，`create-expo-app@latest` 如果不带 `--template`，会创建 SDK 54 项目。

它还补充：

- 如果你计划在真机上使用 Expo Go，使用 SDK 54 项目。
- 否则使用 `--template default@sdk-56` 创建 SDK 56 项目。

## 核心特性整理

### Native

文档说明其导航构建在 `React Native Screens` 之上，因此原生平台默认是偏原生体验的。

### Shareable

文档说明每个页面天然支持 deep link，所以页面可以被分享。

### Offline-first

文档说明应用会被缓存、可离线运行，并在你发布新版本后自动更新。

### Optimized

文档提到生产环境可做 lazy-evaluation，开发环境有 deferred bundling。

### Universal

Android、iOS、Web 共享统一导航结构，但仍可在路由层面下沉到平台特定 API。

### Discoverable

文档说明 Web 侧支持 static rendering，因此内容可被搜索引擎索引。

## 为什么文件路由值得用

文档给出很多理由，核心可以归纳为以下几点：

### 1. 心智模型简单

文件系统本身就是成熟、直观的组织方式，更容易让团队新人理解。

### 2. 深链和分享能力天然成立

文档强调，每一页都有链接，因此：

- 分享内容更简单
- bug 回放更容易
- E2E 测试更自然
- 自动化截图更方便

### 3. 重构成本更低

文档明确说明，移动文件位置时，不必像手写路由表那样到处改 import 和注册代码。

### 4. 类型化路由与静态渲染

文档说明 Expo Router 能自动静态类型化路由，也能在 Web 自动静态渲染页面。

### 5. Expo CLI 能做更多自动推断

比如：

- 自动 bundle splitting
- 自动 sitemap 生成

文档明确说明，如果项目只有一个统一入口点，这类推断就做不到。

## 和其他方案的关系

### Expo Router vs React Navigation

文档说明：

- Expo Router：以文件结构推导路由
- React Navigation：手动在代码中定义 navigator 和 routes

文档态度是：两者都能用，但新项目更推荐 Expo Router。

### Expo Router vs Expo vs React Native CLI

文档给出的类比是：

- Expo Router 对 React Native 的关系，类似 Remix / Next.js 对 React 的关系

这是很适合 React Web 开发者理解的一句。

### 现有 React Native 项目能不能用

文档明确说明可以，但必须是：

- Expo CLI 项目
- 使用 Metro bundler

## 关于服务端渲染

文档明确说明：

- 基础静态渲染（SSG）支持。
- 真正的服务器渲染（SSR）目前需要自定义基础设施。

## React Web 开发者最容易误解的点

### 1. Expo Router 不是“只给 Web 用的路由”

它首先是通用路由系统，Web 只是其中一个运行平台。

### 2. 文件路由在原生端更有价值

在 Web 里文件路由已经常见；在原生端，它还额外带来了 deep link、一致 URL、跨平台导航对齐这些价值。

### 3. 不是所有导航库都天然支持这些能力

文档明确暗示：如果不用 Expo Router，你可能要自己补很多能力。

## 实际开发建议

- 基于经验建议：新项目如果本来就要同时覆盖 Web 和移动端，优先从 Expo Router 起步。
- 基于经验建议：先接受“路由由文件结构驱动”这个约束，再享受它带来的自动化收益。
- 基于文档内容推导：如果团队非常依赖深链、SEO、分享链接或 typed routes，Expo Router 的收益会更明显。

## 文档明确说明

- Expo Router 是文件路由系统。
- `app` 目录新增文件会自动成为路由。
- 支持 Android、iOS、Web 通用导航。
- 推荐新项目通过 `create-expo-app` 创建。
- 具备 deep linking、typed routes、static rendering 等优势。
- 现有 React Native 项目也可接入，但要求 Expo CLI + Metro。
- 基础 SSG 支持，SSR 需要自定义基础设施。

## 基于文档内容推导

- Expo Router 更像“通用应用框架的一部分”，不只是一个跳转 API。
- 你的目录结构会直接影响可维护性，因为它就是路由结构本身。
- 如果团队本来就熟悉 Next.js 的文件路由，上手 Expo Router 会更快。

## 当前文档未涉及

- 手动安装 Expo Router 的详细步骤。
- 各种特殊文件命名规则。
- 鉴权、布局、嵌套路由等更深入主题。
