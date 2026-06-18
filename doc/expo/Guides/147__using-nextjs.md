# 在 Web 平台中集成 Next.js 与 Expo

> 原文地址：https://docs.expo.dev/guides/using-nextjs/

本文档介绍如何将 Next.js 与 Expo 结合使用，用于构建浏览器端应用。

> **注意**：使用 Next.js 并非 Expo 官方标准跨平台开发流程的一部分。它是一个可选的集成方案，适用于有特定 Web 需求的项目。

Next.js 是一个 React 框架，提供简洁的基于文件的路由系统以及服务端渲染能力。将它与 Expo（移动端 SDK）结合使用时，需要通过专用的适配器包 `@expo/next-adapter` 来处理配置细节。

这种组合方式的核心价值在于：你可以在移动端和浏览器端之间**复用现有的 UI 组件和业务逻辑**。但由于 Next.js 使用自己独立的命令行工具（CLI），因此启动浏览器开发环境时必须使用 Next.js 的命令，而不是 `expo start`。

> **重要提示**：此集成方案仅支持浏览器端（Web）。移动应用（iOS/Android）无法使用 Next.js 的服务端渲染能力，因此移动端仍然通过 Expo 的标准方式运行。

---

## 快速开始：自动化配置

如果你希望快速上手，可以使用官方提供的示例模板来生成一个全新的项目：

```sh
# 使用 npm
npx create-expo-app -e with-nextjs

# 使用 yarn
yarn create expo-app -e with-nextjs

# 使用 pnpm
pnpm create expo-app -e with-nextjs

# 使用 bun
bun create expo -e with-nextjs
```

**命令说明**：
- `create-expo-app` 是 Expo 提供的项目脚手架工具，用于快速创建新项目。
- `-e with-nextjs` 参数指定使用 `with-nextjs` 示例模板，它已经预配置好了 Next.js 与 Expo 的集成环境。

创建完成后，项目会同时支持两个平台的开发：

- **移动端**：使用 Expo 的标准命令启动（如 `npx expo start`）。
- **浏览器端**：使用 Next.js 的开发命令启动（如 `npx next dev`）。

---

## 手动配置

如果你需要在已有项目中手动集成 Next.js 和 Expo，请按以下步骤操作。

### 第一步：安装依赖包

确保你的项目中安装了核心框架和适配器包：

```sh
# 使用 npm
npm install expo next @expo/next-adapter

# 使用 yarn
yarn add expo next @expo/next-adapter

# 使用 pnpm
pnpm add expo next @expo/next-adapter

# 使用 bun
bun add expo next @expo/next-adapter
```

**各包说明**：
- `expo`：Expo SDK 核心包，提供跨平台的 React Native 能力。
- `next`：Next.js 框架，提供 Web 端的路由、服务端渲染等功能。
- `@expo/next-adapter`：Expo 官方提供的 Next.js 适配器，负责处理 React Native Web 与 Next.js 之间的配置桥接。

### 第二步：配置代码转换

Next.js 需要对某些语法特性（如 JSX、TypeScript 等）进行代码转换（transpile）。你可以选择使用 SWC 或 Babel 来完成这项工作。

#### 方式一：使用 SWC（推荐）

SWC 是 Next.js 默认的代码转换工具，速度更快，是推荐的方式。

首先，确保你的 Babel 配置文件仅针对移动端环境生效。创建或修改 `babel.config.js`：

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

**说明**：
- `api.cache(true)` 表示缓存配置结果，提升后续构建速度。
- `babel-preset-expo` 是 Expo 专用的 Babel 预设，仅在移动端（Metro bundler）中使用。

然后，在 Next.js 的配置文件中强制启用 SWC 转换。创建或修改 `next.config.js`：

```js
module.exports = {
  experimental: {
    forceSwcTransforms: true,
  },
};
```

**说明**：
- `forceSwcTransforms: true` 强制 Next.js 使用 SWC 而非 Babel 进行代码转换，即使项目中存在 `.babelrc` 或 `babel.config.js` 文件。

#### 方式二：使用 Babel（不推荐）

如果你的项目有特殊需求必须使用 Babel，需要修改 Babel 配置，使其仅在 Webpack 打包时（即浏览器端）应用 Next.js 的 Babel 预设：

```js
module.exports = function (api) {
  // 检测当前是否为 Web 环境构建
  // 注意：如果 Next.js 未来更改 loader 名称，此判断条件可能需要调整
  const isWeb = api.caller(
    caller =>
      caller && (caller.name === 'babel-loader' || caller.name === 'next-babel-turbo-loader')
  );
  return {
    presets: [
      // 仅在浏览器端使用 next/babel 预设，在移动端使用会破坏原生项目
      isWeb && require('next/babel'),
      'babel-preset-expo',
    ].filter(Boolean),
  };
};
```

**说明**：
- `api.caller()` 用于获取当前调用 Babel 的工具信息，通过 `caller.name` 判断是否由 Webpack 的 `babel-loader` 触发。
- `next/babel` 预设仅在 Web 端生效；如果在移动端使用，会破坏原生项目的编译结果。
- `.filter(Boolean)` 用于移除数组中值为 `false` 的项（当 `isWeb` 为 `false` 时）。

> **不推荐使用 Babel 的原因**：使用 Babel 会导致 Next.js 放弃默认的 SWC 编译器，从而降低构建速度。同时，条件判断逻辑增加了配置出错的风险。

### 第三步：配置 Next.js

在 `next.config.js` 中引入 `@expo/next-adapter` 适配器，使 Next.js 能够正确处理 React Native 相关的包：

```js
const { withExpo } = require('@expo/next-adapter');

module.exports = withExpo({
  // transpilePackages 是 Next.js 13.1+ 的特性。
  // 旧版本可以使用 next-transpile-modules 插件替代。
  transpilePackages: [
    'react-native',
    'react-native-web',
    'expo',
    // 在此添加更多需要转换的 React Native/Expo 包...
  ],
});
```

**说明**：
- `withExpo()` 是适配器提供的高阶函数，它接收 Next.js 配置对象并返回增强后的配置。
- `transpilePackages` 告诉 Next.js 的 Webpack 需要额外编译这些 npm 包。默认情况下，Webpack 不会编译 `node_modules` 中的代码，但 React Native 生态中的许多包包含未编译的代码（如 JSX、Flow 类型注解等），需要被转换后才能被浏览器使用。

一个更完整的配置示例：

```js
const { withExpo } = require('@expo/next-adapter');

/** @type {import('next').NextConfig} */
const nextConfig = withExpo({
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    'react-native',
    'react-native-web',
    'expo',
    // 在此添加更多需要转换的 React Native/Expo 包...
  ],
  experimental: {
    forceSwcTransforms: true,
  },
});

module.exports = nextConfig;
```

**配置项说明**：
- `reactStrictMode: true`：启用 React 严格模式，帮助在开发阶段发现潜在问题。
- `swcMinify: true`：使用 SWC 进行生产构建时的代码压缩，比传统的 Terser 更快。
- `experimental.forceSwcTransforms: true`：强制使用 SWC 进行代码转换（如上文所述）。

### 第四步：配置浏览器端样式重置

React Native Web 的实现依赖于特定的 CSS 重置样式。你需要在 Next.js 的 `pages` 目录中创建自定义的 Document 和 App 组件来注入这些样式。

创建 `pages/_document.js`：

```jsx
import { Children } from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { AppRegistry } from 'react-native';

// 遵循 react-native-web 的初始化指南：
// https://necolas.github.io/react-native-web/docs/setup/#root-element
// 同时包含额外的 React Native 滚动和文本兼容性样式，
// 以适配各种浏览器。

// 强制 Next.js 生成的 DOM 元素填满父容器的高度
const style = `
html, body, #__next {
  -webkit-overflow-scrolling: touch;
}
#__next {
  display: flex;
  flex-direction: column;
  height: 100%;
}
html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}
body {
  /* 允许内容在视口之外继续滚动；默认值为 visible */
  overflow-y: auto;
  overscroll-behavior-y: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -ms-overflow-style: scrollbar;
}
`;

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }) {
    // 注册主组件，使 react-native-web 能够收集样式
    AppRegistry.registerComponent('main', () => Main);
    const { getStyleElement } = AppRegistry.getApplication('main');
    const page = await renderPage();
    const styles = [
      <style key="react-native-style" dangerouslySetInnerHTML={{ __html: style }} />,
      getStyleElement(),
    ];
    return { ...page, styles: Children.toArray(styles) };
  }

  render() {
    return (
      <Html style={{ height: '100%' }}>
        <Head />
        <body style={{ height: '100%', overflow: 'hidden' }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```

**关键逻辑说明**：
- `AppRegistry.registerComponent('main', () => Main)`：将 Next.js 的 `Main` 组件注册到 React Native 的应用注册表中。
- `getStyleElement()`：从 React Native Web 中收集所有需要的样式表，并将其注入到 HTML 中。
- 自定义的 `style` 字符串包含了浏览器兼容性修复，确保滚动行为和文本渲染在移动端和 Web 端表现一致。

创建 `pages/_app.js`：

```jsx
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
```

**说明**：
- 设置 `viewport` meta 标签确保页面在移动设备浏览器上正确缩放。
- `_app.js` 是 Next.js 的全局布局组件，所有页面都会经过这里。

---

## 第三方包的转换配置

React Native 生态系统中的第三方 npm 包默认不会被 Webpack 自动编译处理。在移动端，Metro bundler 会使用缓存机制实现快速的热重载；但在 Web 端，Webpack 缺少这种机制，因此需要你**手动将需要转换的包添加到配置中**：

```js
const { withExpo } = require('@expo/next-adapter');

module.exports = withExpo({
  experimental: {
    transpilePackages: [
      // 注意：即使在 Next.js 中从未直接使用 `react-native`，
      // 你仍然需要列出它，因为 `react-native-web` 是通过
      // 别名映射到 `react-native` 的。
      'react-native',
      'react-native-web',
      'expo',
      // 在此添加更多需要转换的 React Native/Expo 包...
    ],
  },
});
```

**说明**：
- 当你引入新的 React Native 相关库后，如果发现浏览器端报错（通常是模块解析错误或语法错误），需要将该包名添加到 `transpilePackages` 数组中。
- `react-native` 必须始终列在列表中，因为 `react-native-web` 通过 Webpack 的别名机制替代了 `react-native`，Webpack 在解析时需要先找到 `react-native` 再重定向到 `react-native-web`。

> **基于经验建议**：每当你安装一个新的与 React Native 或 Expo 相关的 npm 包时，建议同时将其添加到 `transpilePackages` 列表中，以避免运行时出现意外的编译错误。

---

## 生产环境部署

官方推荐的部署方式是使用 [Vercel](https://vercel.com)（Next.js 的创建者）进行托管。

首先，在 `package.json` 中添加构建命令：

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

**说明**：`next build` 会执行 Next.js 的生产构建流程，生成优化后的静态文件和服务器端渲染所需的服务端代码。

然后，全局安装 Vercel CLI 工具：

```sh
# 使用 npm
npm install --global vercel

# 使用 yarn
yarn global add vercel

# 使用 pnpm
pnpm add --global vercel

# 使用 bun
bun add --global vercel
```

最后，执行部署命令：

```sh
vercel
```

运行 `vercel` 命令后，CLI 会引导你完成项目关联、环境配置等步骤，最终将应用部署到 Vercel 的全球 CDN 网络上。

---

## 与标准 Expo Web 开发的区别

使用 Next.js（通过 Webpack 打包）与 Expo 标准的 Web 开发方式存在一些差异：

- **不兼容 App Directory**：`@expo/next-adapter` 目前不兼容 Next.js 的实验性 App Directory（`app/` 目录）功能，只能使用传统的 `pages/` 目录。
- **移动端路由方案**：对于移动端的基于文件的路由，官方建议使用 **Expo Router** 而非 Next.js 的路由系统。

> **基于文档内容推导**：这意味着在同一项目中，移动端和 Web 端实际上使用不同的路由方案——移动端使用 Expo Router，Web 端使用 Next.js 的 `pages/` 目录路由。开发者需要注意两套路由系统的维护和同步。

---

## 社区贡献

如果你希望改进 Next.js 与 Expo 的集成体验，可以向 `@expo/next-adapter` 的代码仓库提交 Pull Request 或 Issue。

---

## 常见问题排查

### 模块导入错误

当你在浏览器端遇到模块导入错误（如 `Module not found` 或语法解析错误）时，通常是因为某个 React Native 相关的包未被 Webpack 正确编译。

**解决方法**：找到报错涉及的包名，将其添加到 `next.config.js` 的 `transpilePackages` 列表中：

```js
const { withExpo } = require('@expo/next-adapter');

module.exports = withExpo({
  experimental: {
    transpilePackages: [
      'react-native',
      'react-native-web',
      'expo',
      // 将报错的包添加到这里，然后重启开发服务器...
    ],
  },
});
```

**注意**：修改配置后需要**重启 Next.js 开发服务器**才能生效。

> **基于经验建议**：遇到模块导入错误时，仔细阅读错误信息中的包名路径，准确定位问题包。有时错误可能来自某个包的依赖项（间接依赖），此时可能需要将间接依赖也添加到转换列表中。

---

## 文档导航

- **上一页**：[building for tv](./146__building-for-tv.md)
- **下一页**：[upgrading expo sdk walkthrough](./148__upgrading-expo-sdk-walkthrough.md)
