# 渐进式 Web 应用（Progressive Web Apps）

> **原文地址**：https://docs.expo.dev/guides/progressive-web-apps/
>
> 本文基于 Expo SDK 56 版本文档翻译整理。

---

## 什么是 PWA？

**渐进式 Web 应用**（Progressive Web App，简称 **PWA**）是一种利用现代 Web 技术（HTML、CSS、JavaScript）构建的网页应用，它能够提供类似原生应用的体验。PWA 的核心特性包括：

- **可安装**：用户可以像安装原生 App 一样将网页"安装"到设备桌面或主屏幕上。
- **离线可用**：通过 Service Worker 技术缓存资源，即使没有网络也能正常使用。
- **推送通知**：支持向用户发送通知消息（本文不深入讨论）。

> **初学者须知**：PWA 本质上还是一个网页，但它通过一些额外的配置（如 Web App Manifest 和 Service Worker）获得了"升级"为类原生应用的能力。你可以把它理解为"网页 + 配置文件 + 缓存脚本 = 类 App 体验"。

---

## Expo 中的 PWA 支持

Expo 项目可以在 Web 端利用 PWA 能力来增强用户体验。虽然原生应用在离线功能方面表现更好，但 PWA 对于面向桌面端用户的项目来说是一个很好的补充——它允许用户安装应用并支持离线使用。

> **基于文档内容推导**：Expo 官方认为原生应用在离线能力上优于 PWA，因此如果你的应用以移动端为主，建议优先考虑原生能力；如果主要面向桌面浏览器用户，PWA 是更合适的方案。

---

## 网站图标（Site Icons）

### 概念说明

**网站图标**（Favicon）是浏览器标签页、书签栏等位置显示的小图标，是应用品牌形象的一部分。

### 配置方式

Expo CLI 会自动根据应用配置文件中的 `web` 配置项来构建网站图标。你只需要在应用配置（`app.json` 或 `app.config.js/ts`）中指定 favicon 的路径：

```json
{
  "web": {
    "favicon": "./assets/favicon.png"
  }
}
```

> **说明**：`favicon` 字段指向的是项目中的图片文件路径，Expo 会自动处理不同尺寸的生成工作。

你也可以手动将图标文件放置在 `public` 目录下，Expo 构建时会自动将其包含在最终产物中。

---

## 元数据配置（Metadata Configuration）

### 什么是 Web App Manifest？

**Web App Manifest** 是一个 JSON 文件（通常命名为 `manifest.json`），它定义了 Web 应用的元数据信息，包括应用名称、图标、启动方式、主题色等。浏览器通过读取这个文件来决定如何"安装"你的应用。

> **初学者须知**：可以把 `manifest.json` 想象成原生应用中的"应用信息"——它告诉浏览器"我的应用叫什么名字、用什么图标、打开后是什么样子"。

### 创建 manifest.json

在项目根目录下创建 `public/manifest.json` 文件，内容如下：

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

### 各字段详解

| 字段 | 说明 |
|------|------|
| `short_name` | 应用简称，在空间有限时显示（如手机桌面） |
| `name` | 应用全称，在安装提示等场景下显示 |
| `icons` | 应用图标数组，需要提供多种尺寸 |
| `start_url` | 应用启动时加载的初始 URL，`.` 表示当前目录 |
| `display` | 显示模式。`standalone` 表示以独立应用的形式运行（隐藏浏览器地址栏等 UI） |
| `theme_color` | 主题色，影响浏览器工具栏、任务栏等位置的颜色 |
| `background_color` | 背景色，在应用加载过程中显示的背景颜色 |

> **重要**：确保 `192x192` 和 `512x512` 像素的图标文件已放置在 `public` 目录下，与 `manifest.json` 同级。这两个尺寸是 PWA 安装所必需的——192px 用于桌面图标，512px 用于启动画面（splash screen）。

---

## 链接元数据文件（Linking the Metadata）

配置好 `manifest.json` 后，需要在 HTML 中通过 `<link>` 标签引用它。根据你使用的渲染模式，操作方式有所不同。

> **初学者须知**：Expo Router 支持多种渲染模式。**单页应用（SPA）** 是最常见的模式，整个页面只在客户端渲染。**静态渲染（Static）** 在构建时生成 HTML。**服务端渲染（SSR）** 在每次请求时由服务器生成 HTML。如果不确定自己用的是哪种模式，默认通常是单页应用。

### 单页应用（SPA）模式

首先，使用你偏好的包管理器生成自定义 HTML 模板：

```sh
# npm
npx expo customize public/index.html

# yarn
yarn expo customize public/index.html

# pnpm
pnpm expo customize public/index.html

# bun
bun expo customize public/index.html
```

然后在生成的 `public/index.html` 文件的 `<head>` 区域中添加 manifest 链接：

```html
<link rel="manifest" href="/manifest.json" />
```

### 静态渲染 / 服务端渲染模式

需要修改根 HTML 组件（通常是 `app/+html.tsx`），在 `<head>` 中添加 manifest 链接：

```tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <link rel="manifest" href="/manifest.json" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

> **代码说明**：
> - `ScrollViewStyleReset` 是 Expo Router 提供的组件，用于重置 ScrollView 的默认样式。
> - `PropsWithChildren` 是 React 的类型工具，表示该组件接受 `children` 属性。
> - `<meta>` 标签设置了字符编码、IE 兼容性和视口配置，这些都是标准的 Web 开发最佳实践。

---

## 离线工作线程（Offline Workers / Service Workers）

### 什么是 Service Worker？

**Service Worker** 是一种运行在浏览器后台的脚本，它充当应用与网络之间的"代理"。通过拦截网络请求并返回缓存的资源，Service Worker 可以让你的应用在离线状态下也能正常运行。

> **初学者须知**：你可以把 Service Worker 想象成一个"本地仓库管理员"——当用户访问你的应用时，它会提前把需要的文件（HTML、JS、CSS 等）存储到本地。下次用户再访问（甚至在断网情况下），管理员直接从本地仓库取文件给用户，不需要再从服务器下载。

### 推荐工具：Workbox

Google 的 [Workbox](https://developer.chrome.com/docs/workbox/) 是配置 Service Worker 的推荐工具。它提供了丰富的缓存策略，可以大大简化离线功能的实现。

> **警告**：激进的缓存策略可能导致更新问题。当你在应用中修复了 Bug 或发布了新功能时，用户浏览器可能仍然使用旧的缓存版本，导致看不到更新。用户需要手动清除浏览器缓存才能获取最新内容。相比之下，原生应用通过应用商店更新，不存在这个问题。
>
> **基于经验建议**：在生产环境中使用 Service Worker 时，务必实现版本管理机制。可以考虑：
> - 使用 Workbox 的 `skipWaiting` 和 `clientsClaim` 选项让新版本立即生效
> - 在应用中检测 Service Worker 更新，并提示用户刷新页面
> - 对 API 请求使用 `NetworkFirst` 策略（优先网络，失败时回退到缓存），对静态资源使用 `CacheFirst` 策略

### 第一步：创建项目

以 tabs 模板创建一个新项目（如果已有项目可跳过）：

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

### 第二步：注册 Service Worker

Service Worker 需要在 HTML 中进行注册。根据渲染模式选择对应的方式：

#### 单页应用（SPA）模式

在自定义的 `public/index.html` 文件的 `<head>` 中添加以下脚本：

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
</script>
```

> **代码说明**：
> - `'serviceWorker' in navigator`：检查当前浏览器是否支持 Service Worker
> - `window.addEventListener('load', ...)`：在页面完全加载后再注册，避免影响页面首次渲染性能
> - `navigator.serviceWorker.register('/sw.js')`：注册位于根路径的 `sw.js` 文件作为 Service Worker
> - `registration.scope`：Service Worker 的控制范围，默认是 `sw.js` 所在的目录

#### 静态渲染 / 服务端渲染模式

通过根组件中的 `dangerouslySetInnerHTML` 注入脚本（文件路径通常为 `app/+html.tsx`）：

```tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <script dangerouslySetInnerHTML={{ __html: sw }} />

        <ScrollViewStyleReset />
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

> **为什么使用 `dangerouslySetInnerHTML`？** 在 React/JSX 中，不能直接在 `<script>` 标签内写 JavaScript 代码。`dangerouslySetInnerHTML` 是 React 提供的将原始 HTML 字符串注入 DOM 的方式。名字中的"dangerously"是在提醒开发者注意 XSS（跨站脚本攻击）风险——不过在这里，脚本内容是我们自己编写的，所以是安全的。

### 第三步：构建 Web 产物

使用 Expo 的 export 命令构建 Web 版本：

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

### 第四步：使用 Workbox 生成 Service Worker

运行 Workbox 配置向导，按照交互式提示进行配置：

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

### 向导选项说明

| 问题 | 推荐回答 | 说明 |
|------|----------|------|
| Web 应用的根目录 | `dist/` | Expo export 的默认输出目录 |
| 预缓存的文件类型 | `js, html, ttf, ico, json` | 包含脚本、页面、字体、图标和配置文件 |
| Service Worker 保存位置 | `dist/sw.js` | 放在输出目录根路径，确保控制范围最大 |
| 配置文件保存位置 | `workbox-config.js` | 保存在项目根目录，方便后续重复使用 |
| start_url 是否包含搜索参数 | `No` | 除非你自定义了带参数的 start_url |

### 第五步：生成最终的 Service Worker

使用保存的配置文件生成 Service Worker：

```sh
npx workbox-cli generateSW workbox-config.js
```

### 第六步：配置构建脚本

为了方便后续使用，建议将构建和生成 Service Worker 的命令合并为一个脚本，添加到 `package.json` 中：

```json
{
  "scripts": {
    "build:web": "expo export -p web && npx workbox-cli generateSW workbox-config.js"
  }
}
```

之后只需运行 `npm run build:web`（或对应的包管理器命令）即可一键完成构建和 Service Worker 生成。

---

## 调试与验证

使用 Chrome 浏览器打开构建后的应用，通过以下步骤验证 Service Worker 是否正常工作：

1. 打开 Chrome 开发者工具（`F12` 或 `Cmd+Option+I`）
2. 切换到 **Application（应用）** 标签页
3. 在左侧导航栏中找到 **Service Workers** 部分
4. 确认 Service Worker 状态为 `activated`（已激活）
5. 在 **Cache Storage**（缓存存储）部分可以查看已缓存的资源列表

> **基于经验建议**：开发阶段可以在 Service Workers 面板中勾选 "Update on reload"（重新加载时更新），这样每次刷新页面都会获取最新的 Service Worker，避免缓存干扰开发调试。

---

## 常见问题与注意事项

### 1. PWA 安装提示不出现

浏览器对 PWA 安装有严格的要求，必须同时满足以下条件才会显示安装提示：
- 有效的 `manifest.json`，包含 `name`、`icons`（至少 192px 和 512px）、`start_url`、`display`
- 已注册并激活的 Service Worker
- 通过 HTTPS 访问（localhost 开发环境除外）

### 2. 缓存更新问题

> **警告**：这是 PWA 最常见的痛点。Service Worker 的缓存策略过于激进时，用户可能无法及时获取更新内容。

**基于经验建议**：
- 为 HTML 文件使用 `NetworkFirst` 策略，确保始终获取最新页面
- 为带 hash 的静态资源（JS/CSS）使用 `CacheFirst` 策略，因为它们的内容变化会体现在文件名变化上
- 设置合理的缓存过期时间

### 3. iOS 上的限制

> **基于文档内容推导**：虽然文档未明确提及，但需要注意 Apple 对 iOS 上 PWA 的支持有限制。例如 iOS Safari 对 Web Push API 的支持较晚，且对 PWA 的存储容量有上限。如果你的目标用户主要在 iOS 上，建议优先使用 Expo 的原生应用能力。

---

## 完整配置流程总结

```
1. 配置 favicon → app.json 中设置 web.favicon
2. 创建 manifest.json → public/manifest.json
3. 准备图标文件 → public/logo192.png, public/logo512.png
4. 链接 manifest → 在 HTML 中添加 <link rel="manifest">
5. 构建 Web 产物 → npx expo export -p web
6. 配置 Workbox → npx workbox-cli wizard
7. 生成 Service Worker → npx workbox-cli generateSW workbox-config.js
8. 添加构建脚本 → package.json scripts
9. 部署并验证 → Chrome DevTools 检查 Service Worker
```

---

## 文档导航

- **上一页**：[dom components](./23__dom-components.md)
- **下一页**：[tailwind](./25__tailwind.md)
