# 使用 Expo 创建 Web 应用

> 原文地址：https://docs.expo.dev/workflow/web/

---

## 概述

Expo 提供了**一流的（first-class）** Web 支持，帮助你基于 React 构建全栈网站。你可以选择以下两种渲染方式之一：

- **客户端渲染（Client-Side Rendering, CSR）**：页面在浏览器中通过 JavaScript 动态生成内容，适合需要类似"应用体验"的交互场景。
- **静态渲染（Static Rendering）**：在构建时预先生成 HTML 文件，有利于搜索引擎优化（SEO）和页面加载速度。

> **关键术语解释**
>
> - **Expo**：一个围绕 React Native 构建的开源框架，它简化了跨平台（iOS、Android、Web）应用开发的流程。
> - **React Native**：Facebook 开发的框架，允许你使用 React 语法编写原生移动应用。在 Web 端，它通过 `react-native-web` 库将 React Native 组件映射为标准 HTML 元素。
> - **Metro**：React Native 官方的 JavaScript 打包工具（bundler），类似于 Webpack。Expo 在其基础上做了封装和优化。

---

## 跨平台兼容性

### 通用渲染

你可以使用 React Native for Web（简称 RNW）提供的 `<Text>` 组件，在不同环境（Web、iOS、Android）中显示文本，无需为每个平台编写不同代码。

```jsx
import { Text } from 'react-native';

export default function Page() {
  return <Text>Home page</Text>;
}
```

RNW 库提供了诸如 `<View>` 和 `<Text>` 等组件，它们内部封装了标准的 DOM 元素（如 `<div>`、`<p>`、`<img>` 等）。

> **为什么推荐使用 RNW？**
>
> 虽然你也可以直接使用标准 React DOM，但在多平台项目中，使用 RNW 可以最大化代码共享。一个典型例子是：整个 X（原 Twitter）平台网站就是基于此技术构建的。

> **基于经验建议**
>
> 如果你的项目从一开始就计划同时支持移动端和 Web 端，强烈建议统一使用 RNW 提供的组件，而不是混用 React DOM。混用会增加维护成本并导致平台间表现不一致。

### 仅 Web 端的元素

你也可以直接使用标准 DOM 标签，但它们**无法在原生移动平台上运行**。

```jsx
export default function Page() {
  return <p>Home page</p>;
}
```

Expo 完全支持浏览器专属元素。但是，建议合理组织项目结构以同时处理两种环境。详情请参阅平台特定模块（platform-specific modules）的相关文档。

> **基于文档内容推导**
>
> 使用纯 DOM 标签意味着放弃了跨平台能力。如果你确定项目只面向 Web，可以直接使用 DOM 标签；否则，应优先使用 RNW 组件，仅在必要时通过平台判断引入 Web 专属代码。

---

## SDK 库的全平台支持

Expo SDK 中的每个库在涉及 Web 场景时，都同时支持**服务端（server）**和**浏览器（browser）**环境，并针对各目标进行了优化。以下工具在所有平台上通用：

- **环境变量（Environment Variables）**
- **调试工具（Debugging）**
- **快速刷新（Fast Refresh）** —— 代码变更后页面自动热更新
- **打包（Bundling）**

在生产构建中，CLI 工具会通过**平台摇树优化（platform shaking）**自动为每个平台剔除不需要的代码。

> **关键术语解释**
>
> - **平台摇树优化（Platform Shaking）**：在打包时，自动识别并移除当前目标平台不需要的代码。例如，构建 Web 版本时，iOS/Android 专属的代码会被自动排除，从而减小产物体积。
> - **快速刷新（Fast Refresh）**：Expo 的热更新机制，修改代码后无需手动刷新浏览器，页面会即时更新。

---

## 初始设置

### 安装 Web 依赖包

使用你的包管理器运行以下命令，安装 Web 开发所需的核心依赖：

```sh
# npm
npx expo install react-dom react-native-web @expo/metro-runtime

# yarn
yarn expo install react-dom react-native-web @expo/metro-runtime

# pnpm
pnpm expo install react-dom react-native-web @expo/metro-runtime

# bun
bun expo install react-dom react-native-web @expo/metro-runtime
```

> **关键术语解释 —— 三个核心包**
>
> | 包名 | 作用 |
> |------|------|
> | `react-dom` | React 的 DOM 渲染器，负责将 React 组件渲染为浏览器中的 HTML。这是任何 React Web 应用的基础。 |
> | `react-native-web` | 将 React Native 组件（如 `View`、`Text`）映射为对应的 HTML 元素的桥接层。 |
> | `@expo/metro-runtime` | Expo 对 Metro 打包器的运行时增强，提供 Web 端的热更新、错误覆盖等功能。 |

### 集成到已有项目

如果你的 React Native 项目中尚未包含 Expo 框架，有两种方式可以添加 Web 支持：

1. **推荐方式**：安装 Expo 模块（完整 SDK 能力）。
2. **轻量方式**：仅安装核心 `expo` 包并调整入口文件。这种方式可以启用 Web 目标，但不具备完整的 SDK 功能。

**第一步**：在项目中安装 Expo CLI：

```sh
# npm
npm install expo

# yarn
yarn add expo

# pnpm
pnpm add expo

# bun
bun add expo
```

**第二步**：更新入口文件，使用 `registerRootComponent` 替代原生的 `AppRegistry` 注册方式：

```diff
- import {AppRegistry} from 'react-native';
- import {name as appName} from './app.json';
+ import {registerRootComponent} from 'expo';
  import App from './App';
- AppRegistry.registerComponent(appName, () => App);
+ registerRootComponent(App);
```

> **关键术语解释**
>
> - **AppRegistry**：React Native 原生的应用注册机制，用于将根组件注册到原生运行时。
> - **registerRootComponent**：Expo 提供的替代方案，同时兼容原生和 Web 环境，使用更简洁。

> **基于经验建议**
>
> 如果你正在将一个纯 React Native 项目迁移到 Expo 体系，建议采用推荐方式（完整安装 Expo 模块），而不仅仅是添加核心包。完整的 Expo 集成能让你获得自动 OTA 更新、EAS Build 等强大功能，长期收益远大于初期的迁移成本。

---

## 启动开发环境

运行以下命令，在浏览器中启动本地开发服务器：

```sh
# npm
npx expo start --web

# yarn
yarn expo start --web

# pnpm
pnpm expo start --web

# bun
bun expo start --web
```

该命令会启动 Metro 开发服务器并自动在默认浏览器中打开应用。你可以像开发普通 React 应用一样，享受快速刷新等开发体验。

### 生成生产构建

当你准备部署时，执行以下命令生成可用于生产环境的静态文件：

```sh
# npm
npx expo export --platform web

# yarn
yarn expo export --platform web

# pnpm
pnpm expo export --platform web

# bun
bun expo export --platform web
```

> **基于经验建议**
>
> `expo export --platform web` 命令会在项目根目录下生成 `dist/` 文件夹，其中包含优化后的静态文件（HTML、CSS、JavaScript）。这些文件可以直接部署到任何静态托管服务（如 Vercel、Netlify、GitHub Pages 等）。部署前务必检查 `dist/` 目录的内容是否符合预期。

---

## 进阶阅读

以下是后续可以深入学习的方向：

- **基于文件的路由（File-based Routing）**：利用 Expo Router 创建导航结构，通过文件系统自动生成路由。
- **静态渲染与 SEO**：生成静态 HTML 文件，提升搜索引擎可见性和页面加载速度。
- **使用 EAS Hosting 即时部署**：利用 Expo 的托管服务进行快速部署，支持 SSL 证书和自定义域名。
- **自定义 JavaScript 打包器**：根据项目需求定制 Metro 配置。

> **基于文档内容推导**
>
> 从文档结构来看，Expo 的 Web 开发工作流被设计为一个渐进式的学习路径：先理解跨平台组件 → 安装依赖 → 启动开发 → 构建生产版本 → 部署与优化。建议按此顺序逐步实践，而非一开始就试图掌握所有高级功能。

---

## 文档导航

- **上一页**：[prebuilt expo modules](./20__prebuilt-expo-modules.md)
- **下一页**：[publishing websites](./22__publishing-websites.md)
