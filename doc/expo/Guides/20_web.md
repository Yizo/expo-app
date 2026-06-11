# Develop websites with Expo 学习整理

## 文档解决的问题

这篇文档解决的是：如何用 Expo 开发 Web 站点，并把同一套项目尽量做成跨 Web、iOS、Android 的通用应用。

对 React Web 开发者来说，这篇文档最重要的价值不是“教你怎么写网页”，而是解释 Expo 的 Web 能力在整个多端体系里的位置。

## 适用场景

- 你想把 Expo 项目跑在浏览器里。
- 你想理解 React Native for web 在 Expo 中扮演什么角色。
- 你要把现有 React Native / Expo 应用扩展到 Web。
- 你希望同一个项目同时支持客户端渲染和静态渲染。

## 核心概念

### Expo 网站的两种渲染方向

文档开头说明：

- Expo 网站可以做 **静态渲染**，用于更好的 SEO 和性能。
- 也可以做 **客户端渲染**，提供更像 App 的浏览器体验。

这意味着 Expo 的 Web 支持不是“把原生组件硬翻译成网页”，而是完整考虑了网站构建形态。

### React Native for web（RNW）

文档给出的定义是：

- RNW 提供 `View`、`Text` 这类组件
- 它们会包装 `react-dom` 的底层能力，例如 `div`、`p`、`img`

因此对 React Web 开发者来说，可以把 RNW 理解成一个跨平台组件层。你不一定非用它，但如果你想最大化代码复用，它很重要。

文档也明确说了：

- RNW **不是强制的**
- 只做 Web 时，你仍然可以直接写 React DOM

## 文档的关键流程

### 1. 安装 Web 依赖

```sh
npx expo install react-dom react-native-web @expo/metro-runtime
```

这些依赖分别承担：

- `react-dom`：浏览器渲染
- `react-native-web`：React Native 组件到 Web 的桥接层
- `@expo/metro-runtime`：Expo 在 Web 上的 Metro 运行时支持

### 2. 如果项目还没接入 `expo` 包

文档说明，如果你的 React Native 项目还没有 `expo` 包：

1. 先安装 `expo`
2. 把入口文件从 `AppRegistry.registerComponent` 改成 `registerRootComponent`

示例迁移：

```diff
- import {AppRegistry} from 'react-native';
- import {name as appName} from './app.json';
+ import {registerRootComponent} from 'expo';
  import App from './App';
- AppRegistry.registerComponent(appName, () => App);
+ registerRootComponent(App);
```

这一步的意义是：让项目入口对齐 Expo 的运行方式，从而具备 Web 目标支持。

### 3. 启动 Web 开发服务器

```sh
npx expo start --web
```

### 4. 导出生产网站

```sh
npx expo export --platform web
```

这对应的是“把项目导出为 Web 生产构建”。

## 关键概念解释

### `<Text>` 不是只给原生用的

文档直接用 `<Text>` 举例，强调 Expo / React Native 的跨平台组件并不局限于移动端。它们在 Web 上也有对应实现。

### Expo SDK 的跨环境支持

文档明确说明：

- Expo SDK 中的库在适用时会同时支持浏览器和服务端渲染环境。
- 构建生产版本时，Expo CLI 会按平台做自动优化，例如 platform shaking。

这说明 Expo 的目标不是“Web 能跑就行”，而是让一套依赖在不同目标环境尽可能合理工作。

## 命令、配置、文件说明

### 命令

```sh
npx expo install react-dom react-native-web @expo/metro-runtime
npm install expo
npx expo start --web
npx expo export --platform web
```

### 入口文件改动

- 原本用 `AppRegistry.registerComponent`
- 接入 Expo 后改为 `registerRootComponent`

## 注意事项、限制条件与坑点

- RNW 是可选的，不是强制要求。
- 如果你只安装 `expo` 包并改入口文件，文档说明这能让应用面向 Web，但**不代表你已经拥有完整 Expo SDK 支持**。
- 文档虽然提到静态渲染和 SEO，但并没有在本页展开具体做法，而是把后续阅读指向 Expo Router 和静态渲染文档。

## React Web 开发者最容易误解的点

- **误解 1：Expo Web 就是把 React Native “转成网页”。**
  更准确地说，它是通过统一工具链和组件层，让多平台共享代码成为可能。
- **误解 2：既然是 Web，就一定要写 `div` / `span`。**
  文档鼓励在跨平台场景下使用 `Text`、`View` 这类 RNW 组件来复用代码。
- **误解 3：接入 Web 支持就等于已经完成部署方案。**
  本页只覆盖开发与导出，不展开部署。

## 实际开发建议

- 基于文档内容推导：如果你的目标是多端复用，尽量优先使用 React Native for web 组件层，而不是从一开始就完全写成纯 React DOM。
- 基于经验建议：如果项目是“先移动端、再补 Web”，先确认入口已经切换到 `registerRootComponent`。
- 基于文档内容推导：把 `expo start --web` 视为开发入口，把 `expo export --platform web` 视为生产构建入口。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo 对网站开发有一等支持。
- 网站既可以静态渲染，也可以客户端渲染。
- RNW 包装了 `react-dom` 原语，并且是可选的。
- 要启用 Web 目标，需要安装 `react-dom`、`react-native-web`、`@expo/metro-runtime`。
- 还未接入 Expo 的 React Native 项目，需要安装 `expo` 并改入口文件。

### 基于文档内容推导

- Expo 的 Web 能力不是附属功能，而是整个通用应用架构的一部分。
- 对团队而言，是否使用 RNW 取决于你更重视代码复用还是纯 Web 语义控制。
- 生产构建阶段的平台优化，是 Expo 统一多端体验的重要组成。

## 当前文档未涉及

- Web 部署平台细节
- Expo Router 的具体路由写法
- 静态渲染配置细节
- SEO 优化具体策略

<!-- NAVIGATION START -->
---
[← 上一页：Precompiled Expo Modules 学习整理](./19_prebuilt-expo-modules.md) | [下一页：Publish websites 学习整理 →](./21_publishing-websites.md)
<!-- NAVIGATION END -->
