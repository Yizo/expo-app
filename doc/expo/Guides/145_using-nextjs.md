# 将 Next.js 与 Expo Web 集成

> 来源：<https://docs.expo.dev/guides/using-nextjs.md>（页面标注更新日期：2026-05-23）

## 先理解官方定位

Next.js 与 Expo Web 的组合**不是 Expo 官方通用应用开发工作流的一部分**。它可以让移动端与 Web 共享部分组件和 API，但 Web 端由 Next.js 自己的 CLI 和 webpack 构建。

- 原生开发：`npx expo start`
- Web 开发：`npx next dev`

不能用 `npx expo start` 启动 Next.js Web 项目。Next.js 的服务端渲染（SSR）只适用于 Web，不支持原生应用。

## 自动创建项目

```sh
npx create-expo-app -e with-nextjs
```

该模板是最快的起点，已经处理 Expo 与 Next.js 的基础组合。

## 手动配置

### 1. 安装依赖

```sh
yarn add expo next @expo/next-adapter
```

`@expo/next-adapter` 用于处理 Next.js 与 Expo SDK 的配置衔接。

### 2. 配置转译

文档推荐 Next.js 使用 SWC。`babel.config.js` 只保留原生 Expo preset：

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

并在 `next.config.js` 强制 SWC 转换：

```js
module.exports = {
  experimental: {
    forceSwcTransforms: true,
  },
};
```

页面也给出不推荐的 Babel 方案：根据 `api.caller` 判断 Next.js Web 打包，仅在 Web 条件下加入 `next/babel`，再保留 `babel-preset-expo`。原因是把 `next/babel` 无条件用于原生会破坏原生项目。

### 3. 配置 Next.js adapter

```js
const { withExpo } = require('@expo/next-adapter');

module.exports = withExpo({
  transpilePackages: [
    'react-native',
    'react-native-web',
    'expo',
  ],
  experimental: {
    forceSwcTransforms: true,
  },
});
```

React Native 生态包默认不一定能直接在浏览器运行。Metro 会处理并缓存这些转换，而 Next.js webpack 默认不转译 `node_modules`，因此每个需要转换的 React Native/Expo 包都要加入 `transpilePackages`。

即使 Next.js 代码不直接导入 `react-native`，也要列出它，因为 `react-native-web` 会被别名到 `react-native`。

### 4. 重置 React Native Web 样式

`react-native-web` 假设页面存在 reset CSS。原文针对 Next.js `pages` 目录给出自定义 Document：

- 用 `AppRegistry` 获取 React Native Web 样式元素。
- 让 `html`、`body`、`#__next` 填满高度。
- 设置滚动、字体平滑、文字缩放与 overscroll 行为。
- 在应用入口加入 `width=device-width, initial-scale=1` viewport。

这些样式用于让 Next.js DOM 容器的尺寸和滚动行为更接近 React Native Web 预期。当前文档的完整代码基于 `pages/_document` 与应用入口结构。

## 部署到 Vercel

在 `package.json` 加入：

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

安装并运行 Vercel CLI：

```sh
npm i -g vercel
vercel
```

## 限制与故障排查

- Expo Next.js adapter 不支持实验性的 Next.js `app` 目录。
- 原生端需要文件路由时，页面推荐 Expo Router。
- Next.js Web 使用其 webpack 配置，与默认 Expo Web/Metro 工作流存在核心差异。
- 遇到 `Cannot use import statement outside a module`，应找出报错依赖，将其加入 `next.config.js` 的 `transpilePackages`，然后重启服务器。

## React Web 开发者容易误解的地方

- “共享组件”不等于原生应用获得 SSR；SSR 仍只发生在 Next.js Web。
- Expo 与 Next.js 共存时有两套 CLI 和两套打包路径，不能把 Metro 配置直接当成 webpack 配置。
- Node 模块转译需要显式维护，新增 React Native 依赖后可能必须更新 `transpilePackages`。

**文档明确说明：**该方案非官方 universal workflow，推荐 SWC，Web 必须由 Next.js CLI 启动，adapter 不支持实验性 `app` 目录。

**基于文档内容推导：**只有在确实需要 Next.js SSR/生态且愿意维护双构建链时才应采用；若目标只是 Expo 的跨平台 Web，默认 Expo Web 工作流通常更简单。当前文档未涉及 App Router、React Server Components、数据获取策略、认证和 monorepo 配置。
