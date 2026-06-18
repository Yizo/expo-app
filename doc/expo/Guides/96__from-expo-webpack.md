# 从 Expo Webpack 迁移到 Expo Router

> 原始文档地址：https://docs.expo.dev/router/migrate/from-expo-webpack/

---

## 概述

Expo 最初在 Web 平台上依赖 **Webpack 4** 来构建**单页应用（SPA）**（Single Page Application，即整个应用只有一个 HTML 入口页面，页面切换由 JavaScript 动态完成，不会重新加载整个页面），其灵感来源于 **Create React App**。随着 Expo Router 的推出，现在有了更强大的路由方案，能够在**原生（Native）**（iOS/Android 等移动端平台）和 **Web** 环境下统一构建**跨平台应用**（Universal Application，即一套代码同时运行在多个平台上）。

本文档将详细说明如何将基于旧版 Webpack 构建的 Web 项目迁移到现代化的 Expo Router 框架。

---

## 迁移理由（Pitch）

旧版配置包 `@expo/webpack-config` 已被标记为**已弃用**（Deprecated，意味着官方不再积极维护，不建议在新项目中使用），并且不再接收功能更新。

迁移到 Expo Router 可以带来以下优势：

- **Web 端的静态渲染**（Static Rendering）：为每个路由生成独立的 HTML 文件，有利于 **SEO**（搜索引擎优化）和**社交分享预览**，同时提升页面加载速度
- **自动深度链接**（Deep Linking，即通过 URL 直接跳转到应用内的特定页面）
- **类型安全**（Typed Routes）：路由自动生成 TypeScript 类型定义，减少导航相关错误
- **延迟打包**（Deferred/Async Bundling）：按需加载路由代码，减小初始包体积
- **模块化模板**：更灵活的项目结构
- **跨平台导航**：解决了原生与 Web 平台之间的导航差异，且不牺牲性能

---

## 迁移代价与局限（Anti-pitch）

> **基于文档内容推导**：迁移并非毫无成本，需要了解以下潜在问题。

Expo Router 底层使用 **Metro** 作为打包工具（与原生端使用的打包器一致）。这样做的好处是最大化代码共享、防止平台间的行为差异。但也意味着：

- 某些 Webpack 特有的功能可能在 Metro 中**不可用或实现方式不同**
- 如果你高度依赖 Webpack 生态中的特定插件，迁移后可能需要寻找替代方案
- 尽管如此，相比旧版的 Webpack 集成，Expo Router 仍然是一个**更强大的全栈框架**

---

## Expo CLI 命令对比

Expo CLI（命令行工具）统一了 Web 和原生端的开发工作流，**两个平台使用相同的命令**。

| 功能 | 现代方案（Expo Router） | 旧版方案（Expo Webpack） |
|---|---|---|
| 启动开发服务器 | `npx expo start` | `npx expo start` |
| 打包命令 | `npx expo export` | `npx expo export:web` |
| 输出目录 | **dist** | **web-build** |
| 静态资源目录 | **public** | **web** |
| 配置文件 | **metro.config.js** | **webpack.config.js** |
| 默认配置包 | `@expo/metro-config` | `@expo/webpack-config` |
| 代码分割（Bundle Splitting） | ✅（SDK 50，Web） | ✅ |
| 全局 CSS | ✅（SDK 50，Web） | ✅ |
| CSS Modules | ✅（SDK 50，Web） | ❌ |
| 静态字体优化 | ✅（SDK 50，Web） | ❌ |
| API 路由 | ✅（SDK 50） | ❌ |
| 多平台支持 | ✅ | ❌ |
| Fast Refresh（快速刷新） | ✅ | ❌ |
| 错误覆盖层（Error Overlay） | ✅ | ❌ |
| 延迟打包（Lazy Bundling） | ✅ | ❌ |
| 静态生成（Static Generation） | ✅ | ❌ |
| 环境变量 | ✅ | ❌ |
| `tsconfig.json` 路径别名 | ✅ | ❌ |
| Tree Shaking（无用代码消除） | 部分支持 | ✅ |

> **基于经验建议**：从表格可以看出，Expo Router 在绝大多数功能上都优于旧版 Webpack 方案。唯一需要注意的是 **Tree Shaking**，目前 Expo Router 仅部分支持。如果你的项目对最终包体积非常敏感，建议迁移后仔细检查 Tree Shaking 的实际效果。

---

## HTML 模板

### 旧版方式

旧版 Webpack 方案使用**单个 HTML 文件**为所有路由提供服务（即典型的 SPA 模式）。

### 现代方式

Expo Router 提供两种渲染模式：

1. **静态模式（Static）**（推荐）：为每个路由生成独立的 HTML 文件，使用动态模板渲染
2. **单页模式（Single）**：生成传统的 SPA，使用 `public` 目录下的 `index.html` 作为入口

> **基于经验建议**：强烈推荐使用静态模式，它对 SEO 和首屏加载性能有明显优势。只有在你的应用确实需要纯 SPA 行为时才选择单页模式。

---

## 静态资源

### 旧版方式

旧版项目使用**特定文件夹**（通常是 `web` 目录）来存放根级别的静态资源（如图片、字体等不需要经过打包处理的文件）。

### 现代方式

Expo Router 使用 `public` 目录来存放静态资源，该目录**同时适用于原生和 Web 平台**。

> **注意**：在生产环境中使用前，请确保静态文件已通过服务器正确托管（即部署后可通过 URL 直接访问）。

---

## 生产环境打包

### 旧版方式

```sh
npx expo export:web
```

### 现代方式

使用统一的导出命令并指定 Web 平台：

```sh
npx expo export -p web
```

- 输出目录：`dist`（而非旧版的 `web-build`）
- 可通过特定标志导出 **Source Maps**（源码映射文件，用于调试时定位原始代码位置）
- `public` 目录中的静态资源会在构建时**自动复制**到输出目录

---

## Babel 配置

根目录下的 Babel 配置文件（`babel.config.js`）仍然**适用于所有平台**。你可以通过 API 调用者（caller）的平台属性来**条件性地应用**仅 Web 端使用的插件：

```js
module.exports = api => {
  // 从 API 调用者中获取当前平台信息
  const platform = api.caller(caller => caller && caller.platform);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 添加仅在 Web 端生效的插件
      platform === 'web' && 'custom-web-only-plugin',
    ].filter(Boolean),
  };
};
```

> **初学者说明**：`api.caller` 是 Babel 提供的一种机制，允许配置文件根据调用环境（如目标平台是 Web 还是原生）做出不同的配置决策。`.filter(Boolean)` 用于移除数组中值为 `false` 的项（当 `platform` 不是 `'web'` 时，该表达式返回 `false`）。

---

## 开发服务器

### 旧版方式

Web 和原生端可能使用**不同的开发服务器和端口**。

### 现代方式

所有平台现在共享**同一个开发服务器和端口**，这带来了以下好处：

- 简化了**生产环境模拟**（在本地测试接近生产环境的构建产物）
- 统一了**热重载**（Hot Reloading，代码修改后浏览器/模拟器自动刷新）的体验

> **注意**：原生端不支持伪 HTTPS，但现代浏览器允许在 `localhost` 上测试需要安全上下文（Secure Context）的 API（如 Service Worker、Geolocation 等）。

---

## Expo Constants（常量配置）

`expo-constants` 库通过将**应用清单**（Manifest，即 `app.json` / `app.config.js` 中的配置信息）注入到环境变量中来访问应用配置。

在新方案中，这一过程通过 **Babel preset**（`babel-preset-expo`）自动处理。

> **注意**：修改配置文件后，请**清除缓存**（clear the cache）以使更改生效。可以使用 `npx expo start --clear` 来启动并清除缓存。

---

## 基础路径与子路径托管

> **此功能为实验性（Experimental）**，API 可能在未来版本中发生变化。

### 旧版方式

通过环境变量或 `package.json` 中的 `homepage` 字段来设置。

### 现代方式

在应用配置文件的 `experiments` 块中定义 `baseUrl`：

```json
{
  "expo": {
    "experiments": {
      "baseUrl": "/evanbacon/my-website"
    }
  }
}
```

设置后，路由会自动添加指定的前缀。例如，如果 `baseUrl` 为 `/evanbacon/my-website`，则 `/about` 路由的实际 URL 会变为 `/evanbacon/my-website/about`。

> **初学者说明**：子路径托管（Sub-path Hosting）是指将应用部署在域名的子路径下而非根路径。例如，不是部署在 `example.com/`，而是部署在 `example.com/my-app/`。这在同一域名下托管多个应用时非常常见。

---

## Fast Refresh（快速刷新）

### 旧版方式

开发者需要**手动安装并配置** Webpack 的热重载插件：

```js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 在开发模式下使用 React Refresh 插件
  if (env.mode === 'development') {
    config.plugins.push(new ReactRefreshWebpackPlugin({ disableRefreshCheck: true }));
  }

  return config;
};
```

### 现代方式

Expo Router 内置了 **Meta 官方的 Fast Refresh** 实现，**开箱即用**，无需额外安装或配置任何插件。

> **基于经验建议**：Fast Refresh 相比旧方案的热重载体验更稳定，能保留组件状态（State），在大多数代码修改后无需完全重新加载页面。这是迁移后你会立即感受到的体验提升之一。

---

## Favicons（网站图标）

图标生成方式与旧版类似，通过主应用清单（`app.json` / `app.config.js`）中的 **Web 配置块**来定义。

---

## Service Workers（服务工作线程）

> **警告**：实现 Service Worker 时需要格外小心。过于激进的**缓存策略**可能会导致用户**无法获取到应用的新版本**。原生应用通过应用商店更新机制天然避免了这个问题。

> **初学者说明**：Service Worker 是一种在浏览器后台运行的脚本，可以拦截网络请求并实现离线缓存等功能，是 **PWA**（Progressive Web App，渐进式 Web 应用）的核心技术之一。

### 旧版方式

旧版 Webpack 方案**没有内置** Service Worker 支持，需要手动集成第三方插件。

### 现代方式

由于 **Workbox**（Google 提供的 Service Worker 工具库）目前缺乏 Metro 集成，建议将其作为**构建后步骤**（Post-build Step）通过 CLI 使用。

**第一步：创建项目**

```sh
# npm
npm create expo -t tabs my-app
cd my-app

# yarn
yarn create expo -t tabs my-app
cd my-app

# pnpm
pnpm create expo -t tabs my-app
cd my-app

# bun
bun create expo -t tabs my-app
cd my-app
```

**第二步：配置根 HTML 模板**

在项目的根布局文件中注册 Service Worker：

```tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// 此文件仅在 Web 端使用，用于配置静态渲染时
// 每个 Web 页面的根 HTML。
// 此函数中的内容仅在 Node.js 环境中运行，
// 无法访问 DOM 或浏览器 API。
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 引导启动 Service Worker */}
        <script dangerouslySetInnerHTML={{ __html: sw }} />

        {/*
          在 Web 端禁用 body 滚动。这使得 ScrollView 组件的行为
          更接近原生端。但移动端 Web 通常需要 body 滚动。
          如果你想启用它，请删除此行。
        */}
        <ScrollViewStyleReset />

        {/* 添加任何你想在 Web 端全局可用的 <head> 元素... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const sw = `
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}
`;
```

**第三步：构建 Web 版本**

```sh
# npm
npx expo export -p web

# yarn
yarn expo export -p web

# pnpm
pnpm expo export -p web

# bun
bun expo export -p web
```

**第四步：使用 Workbox CLI 生成 Service Worker**

```sh
# npm
npx workbox-cli wizard
? What is the root of your web app (that is which directory do you deploy)? dist/
? Which file types would you like to precache? js, html, ttf, ico, json
? Where would you like your service worker file to be saved? dist/sw.js
? Where would you like to save these configuration options? workbox-config.js
? Does your web app manifest include search parameter(s) in the 'start_url', other than 'utm_' or 'fbclid' (like '?source=pwa')? No

# yarn
yarn dlx workbox-cli wizard
? What is the root of your web app (that is which directory do you deploy)? dist/
? Which file types would you like to precache? js, html, ttf, ico, json
? Where would you like your service worker file to be saved? dist/sw.js
? Where would you like to save these configuration options? workbox-config.js
? Does your web app manifest include search parameter(s) in the 'start_url', other than 'utm_' or 'fbclid' (like '?source=pwa')? No

# pnpm
pnpm dlx workbox-cli wizard
? What is the root of your web app (that is which directory do you deploy)? dist/
? Which file types would you like to precache? js, html, ttf, ico, json
? Where would you like your service worker file to be saved? dist/sw.js
? Where would you like to save these configuration options? workbox-config.js
? Does your web app manifest include search parameter(s) in the 'start_url', other than 'utm_' or 'fbclid' (like '?source=pwa')? No

# bun
bunx workbox-cli wizard
? What is the root of your web app (that is which directory do you deploy)? dist/
? Which file types would you like to precache? js, html, ttf, ico, json
? Where would you like your service worker file to be saved? dist/sw.js
? Where would you like to save these configuration options? workbox-config.js
? Does your web app manifest include search parameter(s) in the 'start_url', other than 'utm_' or 'fbclid' (like '?source=pwa')? No
```

**第五步：将 Service Worker 生成集成到构建脚本中**

在 `package.json` 中添加组合构建命令：

```json
{
  "scripts": {
    "build:web": "expo export -p web && npx workbox-cli generateSW workbox-config.js"
  }
}
```

> **基于经验建议**：Service Worker 的缓存策略需要谨慎设计。建议使用 Workbox 的 `StaleWhileRevalidate` 或 `NetworkFirst` 策略，而非简单的 `CacheFirst`，以确保用户能及时获取到应用的更新内容。

---

## PWA 清单（Manifest）

Expo Router **不会自动生成** PWA 清单文件，需要手动创建。

### 第一步：创建清单文件

在 `public` 目录下创建 `manifest.json` 文件：

```json
{
  "short_name": "Expo App",
  "name": "Expo Router Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

> **初学者说明**：`manifest.json` 是 PWA 的核心配置文件，它告诉浏览器你的应用名称、图标、启动方式等信息。`"display": "standalone"` 表示应用以独立应用的方式显示（不显示浏览器地址栏）。

### 第二步：在根 HTML 模板中引用清单

```tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// 此文件仅在 Web 端使用，用于配置静态渲染时
// 每个 Web 页面的根 HTML。
// 此函数中的内容仅在 Node.js 环境中运行，
// 无法访问 DOM 或浏览器 API。
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 链接 PWA 清单文件 */}
        <link rel="manifest" href="/manifest.json" />

        {/*
          在 Web 端禁用 body 滚动。这使得 ScrollView 组件的行为
          更接近原生端。但移动端 Web 通常需要 body 滚动。
          如果你想启用它，请删除此行。
        */}
        <ScrollViewStyleReset />

        {/* 添加任何你想在 Web 端全局可用的 <head> 元素... */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 打包器插件（Bundler Plugins）

如果你需要自定义打包管线（Pipeline），请参阅 [Metro 配置文档](/versions/latest/config/metro.md)。

> **基于文档内容推导**：旧版 Webpack 中通过 `webpack.config.js` 添加的自定义插件，在迁移后需要在 `metro.config.js` 中寻找对应的 Metro 配置方式。Metro 的插件体系与 Webpack 不同，可能需要调整实现方式。

---

## 导航

如果你之前使用的是 **React Navigation** 库进行页面导航，请参阅专门的 [React Navigation 迁移指南](/router/migrate/from-react-navigation/)。

---

## 部署

有关将 Web 应用部署到各种托管平台的详细说明，请参阅 [网站发布指南](/guides/publishing-websites/)。

---

## 完整迁移清单

> **基于文档内容推导**：以下是从旧版 Expo Webpack 迁移到 Expo Router 的完整步骤清单，供快速参考。

1. **卸载旧依赖**：移除 `@expo/webpack-config` 及相关 Webpack 插件
2. **安装新依赖**：确保安装 `expo-router` 和 `@expo/metro-config`
3. **更新配置文件**：
   - 将 `webpack.config.js` 替换为 `metro.config.js`
   - 将 `web` 静态资源目录重命名为 `public`
4. **更新命令**：
   - 将 `npx expo export:web` 替换为 `npx expo export -p web`
   - 将输出目录从 `web-build` 更新为 `dist`
5. **调整项目结构**：按照 Expo Router 的文件系统路由约定组织页面文件
6. **更新 Babel 配置**：利用 `api.caller` 实现平台条件判断
7. **配置 HTML 模板**：在 `app/+html.tsx` 中设置根 HTML 结构
8. **处理 PWA 功能**：手动创建 `manifest.json` 并配置 Service Worker（如需要）
9. **更新部署脚本**：确保 CI/CD 流水线使用新的构建命令和输出目录
10. **测试验证**：在开发环境中充分测试所有平台的导航和功能

---

## 文档导航

- **上一页**：[from react navigation](./95__from-react-navigation.md)
- **下一页**：[sdk 55 to 56](./97__sdk-55-to-56.md)
