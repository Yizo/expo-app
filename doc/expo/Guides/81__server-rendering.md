# 服务端渲染（Server Rendering）

> **原文地址**：https://docs.expo.dev/router/web/server-rendering/

---

> **警告**：服务端渲染目前处于 **Alpha（内测）** 阶段，需要 **SDK 55 或更高版本**。生产环境需要一个实时运行的后端服务（live backend）。

## 概述

服务端渲染（Server Rendering，简称 SSR）是指在每次网络请求到达时，实时为 Web 路由生成 HTML 标记。与静态渲染（在构建阶段预先生成页面）不同，服务端渲染在**每次请求时**动态生成页面内容。数据获取的 loader 函数在后端执行，其结果直接嵌入到返回的 HTML 响应中。

> **关键术语解释**：
> - **服务端渲染（SSR, Server-Side Rendering）**：在服务器端接收到请求时实时生成 HTML 内容，然后将完整的 HTML 发送给客户端浏览器。与静态渲染（构建时生成）和客户端渲染（CSR，浏览器端生成）形成对比。
> - **Alpha 阶段**：软件开发周期中的早期内测阶段，功能可能不完整，API 可能发生变化，不建议在生产环境中无谨慎评估即使用。
> - **Hydration（注水/激活）**：客户端 JavaScript 接管服务端渲染的 HTML，为其添加交互能力的过程。React 中称为"水合"。
> - **Data Loader（数据加载器）**：Expo Router 中用于在路由加载时获取数据的函数。在服务端渲染模式下，它在后端执行。
> - **Streaming（流式传输）**：服务端不必等待整个页面渲染完成，而是逐步将已渲染的部分 HTML 发送给客户端，提升用户感知性能。

---

## 初始配置

修改应用配置文件（`app.json`），将 Web 输出模式设置为 `server`，并在 `expo-router` 插件中启用不稳定特性标志：

```json
{
  "expo": {
    "web": {
      "output": "server"
    },
    "plugins": [
      [
        "expo-router",
        {
          "unstable_useServerRendering": true
        }
      ]
    ]
  }
}
```

> **关键术语解释**：
> - **`web.output`**：Expo 的 Web 输出模式配置项。设置为 `"server"` 表示启用服务端渲染模式。其他可选值包括 `"static"`（静态渲染）和 `"single"`（单页应用模式）。
> - **`unstable_useServerRendering`**：`expo-router` 插件的实验性配置标志。`unstable_` 前缀表明该 API 可能在未来版本中发生变更。

使用以下命令启动本地开发环境：

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

---

## 生产构建

通过执行 export 命令并指定 `web` 平台来生成生产环境的构建产物：

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

构建完成后会生成一个 `dist` 文件夹，其中包含 `client` 和 `server` 两个子目录——而非预构建的静态 HTML 文件。`client` 目录包含用于 hydration 的脚本和样式表，`server` 目录包含路由清单（routing manifest）和渲染逻辑。

可以使用 `serve` 命令在本地模拟生产环境，它会启动一个本地后端来处理请求：

```sh
# npm
npx expo serve

# yarn
yarn expo serve

# pnpm
pnpm expo serve

# bun
bun expo serve
```

> **注意**：与静态渲染不同，服务端渲染的产物**不能**直接用静态文件服务器（如 `npx serve dist`）来提供。你需要一个能够执行服务端渲染逻辑的运行时环境。`expo serve` 命令正是为此设计的本地开发工具。

---

## 处理动态路径

在服务端渲染模式下，带有可变参数（variable parameters）的页面会在请求到达时即时处理。你**不需要**定义 `generateStaticParams` 函数（如果在静态渲染模式中有该函数，应将其删除），因为系统会自动使用实际的 URL 参数值。

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { id } = useLocalSearchParams();

  return <Text>Post {id}</Text>;
}
```

> **关键术语解释**：
> - **`useLocalSearchParams`**：Expo Router 提供的 Hook，用于获取当前路由的搜索参数（包括动态段参数）。在服务端渲染模式下，它会自动获取实际请求 URL 中的参数值。
> - **`generateStaticParams`**：静态渲染模式下用于在构建时声明所有参数组合的函数。在服务端渲染模式下**不再需要**，因为每次请求都会根据实际 URL 实时生成页面。

例如，访问 `/blog/hello-world` 时，系统会自动将 `hello-world` 作为 `id` 参数传递给组件进行后端渲染。

> **基于文档内容推导**：服务端渲染模式消除了静态渲染中 `generateStaticParams` 带来的限制——你不再需要预先知道所有可能的路径组合。这对于内容频繁变化的应用（如 UGC 平台、电商商品页）特别有价值，因为你无法在构建时枚举所有可能的 URL。

---

## 自定义基础 HTML 文档

在应用目录中创建一个特定的 TSX 文件来定义基础 HTML 结构。此文件**仅在后端执行**。

> **文件位置**：`app/+html.tsx`

你必须使用 `useServerDocumentContext` Hook 来获取并注入必要的属性和节点。**必须**展开（spread）该 Hook 提供的所有属性，否则可能导致样式异常或元数据缺失。

```tsx
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } =
    useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
```

> **关键术语解释**：
> - **`useServerDocumentContext`**：服务端渲染专用的 Hook，来自 `expo-router/html` 模块。它返回一组属性和节点，用于正确构建 HTML 文档结构。与静态渲染模式的 `+html.tsx` 不同，服务端渲染版本需要额外处理 `htmlAttributes`、`bodyAttributes`、`headNodes` 和 `bodyNodes`。
> - **`ScrollViewStyleReset`**：来自 `expo-router/html` 的组件，用于在 Web 端禁用 body 滚动，使 ScrollView 组件的行为更接近原生平台的表现。
> - **展开运算符（Spread Operator, `...`）**：JavaScript/JSX 语法，用于将对象的所有属性一次性传递给组件。此处必须使用它来展开服务端上下文提供的属性。

> **重要限制**：
> - 此文件**仅在 Node.js 环境中执行**，无法访问浏览器 API（如 `window`、`document`）
> - **不能**在此文件中导入全局样式表——全局样式应在根布局（root layout）中引入
> - 必须使用 `useServerDocumentContext` Hook（而非静态渲染模式中的手动编写方式）
> - 必须渲染传入的 `children` 属性
> - 必须展开 `htmlAttributes` 和 `bodyAttributes`，并渲染 `headNodes` 和 `bodyNodes`

> **警告**：如果遗漏了 `useServerDocumentContext` 返回的任何一个属性（如忘记展开 `bodyAttributes` 或忘记渲染 `bodyNodes`），可能会导致应用样式异常、脚本加载失败或元数据丢失。

---

## 管理页面元数据

通过从路由文件中导出一个异步的元数据生成函数来定义页面标题、描述和社交分享标签（Open Graph tags）。该函数在渲染之前执行，将数据注入到文档的 `<head>` 中。

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';

export const generateMetadata: GenerateMetadataFunction = async (req, params) => {
  const response = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await response.json();

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage,
    },
  };
};

export default function BlogPost() {
  const { id } = useLocalSearchParams();
  return <Text>Post {id}</Text>;
}
```

> **关键术语解释**：
> - **`generateMetadata`**：一个异步函数，在服务端渲染时于后端执行。它接收请求对象（`req`）和路由参数（`params`），返回一个描述页面元数据的对象。该函数会从前端打包中被移除（tree-shaken），因此不会增加客户端代码体积。
> - **`GenerateMetadataFunction`**：来自 `expo-router/server` 的 TypeScript 类型定义，用于确保 `generateMetadata` 函数具有正确的参数和返回类型。
> - **Open Graph**：由 Facebook 提出的协议，用于在社交媒体平台（如微信、微博、Twitter、Facebook）上分享链接时展示丰富的预览信息（标题、描述、图片等）。

> **注意**：`generateMetadata` 函数会从前端打包中被完全移除（removed from frontend bundles），因此其中使用的服务端逻辑不会泄露到客户端。

### 使用 Head 组件

你仍然可以使用 `expo-router/head` 中的 `Head` 组件来在客户端更新元数据。但是，**推荐使用 `generateMetadata` 函数**，因为它在流式传输开始之前就已解析好标签信息，有利于 SEO 和社交分享爬虫的抓取。

> **基于经验建议**：对于需要 SEO 的页面（如博客文章、商品详情页），优先使用 `generateMetadata` 函数而非 `Head` 组件。`generateMetadata` 在 HTML 流式传输前就已完成元数据解析，确保搜索引擎爬虫和社交平台爬虫能正确抓取完整的 meta 标签。`Head` 组件更适合仅在客户端交互时才需要更新的场景（如用户操作后修改页面标题）。

---

## 托管要求

由于页面是在每次请求时动态构建的，**静态托管平台不兼容**服务端渲染模式。你需要一个运行时环境（runtime environment）来执行服务端代码。

支持的平台及其适配器（adapter）如下：

| 平台 | 适配器路径 | 说明 |
|------|-----------|------|
| **EAS Hosting** | 内置支持 | Expo 官方托管平台，无需额外配置适配器 |
| **Node.js / Express** | `expo-server/adapter/node` | 传统 Node.js 服务器环境 |
| **Cloudflare Workers** | `expo-server/adapter/cloudflare` | Cloudflare 边缘计算平台 |
| **Vercel Edge Functions** | `expo-server/adapter/vercel` | Vercel 边缘函数平台 |
| **Netlify Edge Functions** | `expo-server/adapter/netlify` | Netlify 边缘函数平台 |
| **Bun** | `expo-server/adapter/bun` | Bun 运行时环境 |

> **关键术语解释**：
> - **适配器（Adapter）**：一种中间层代码，负责将 Expo Router 的服务端渲染逻辑转换为特定托管平台所需的格式。不同平台有不同的 API 规范，适配器负责抹平这些差异。
> - **边缘函数（Edge Function）**：部署在全球分布式边缘节点上的无服务器函数，能够在离用户最近的地理位置执行代码，降低延迟。
> - **EAS Hosting**：Expo Application Services 提供的托管服务，与 Expo 项目深度集成。

使用 EAS Hosting 部署的命令：

```sh
npx expo export --platform web
npx eas-cli@latest hosting:deploy dist
```

> **基于经验建议**：如果你的团队已经在使用 Expo 生态系统，EAS Hosting 是最省事的选择，因为它与 Expo Router 内置集成，无需配置适配器。如果需要部署到已有的基础设施（如已有的 Express 服务器或 Cloudflare Workers），则选择对应的适配器。

---

## 服务端渲染 vs. 静态渲染对比

以下表格详细对比了两种渲染模式的关键差异：

| 对比维度 | 静态渲染（Static） | 服务端渲染（Server） |
|---------|-------------------|---------------------|
| **HTML 生成时机** | 构建阶段（Build time） | 请求阶段（Request time） |
| **传输方式** | 完整文档一次性传输 | 渐进式流式传输（Progressive streaming） |
| **配置项** | `output: "static"` | `output: "server"` |
| **动态路径处理** | 需要 `generateStaticParams` 显式声明 | 自动处理，无需额外声明 |
| **元数据管理** | 使用 `Head` 组件 | 使用 `generateMetadata` 函数 |
| **后端需求** | 不需要后端 | 需要后端运行时 |
| **首字节时间（TTFB）** | 最快（已缓存的静态文件） | 较慢（每次请求需实时处理） |
| **托管平台** | 任何静态托管服务商 | 需要支持运行时环境的平台 |

> **关键术语解释**：
> - **TTFB（Time To First Byte）**：从客户端发起请求到收到服务器第一个字节响应之间的时间。是衡量服务器响应速度的关键性能指标。静态渲染因为直接返回缓存文件，TTFB 通常更短；服务端渲染需要实时计算，TTFB 相对较长。
> - **渐进式流式传输（Progressive Streaming）**：服务器不必等待整个页面渲染完成才开始发送响应，而是将已渲染的部分逐步流式传输给客户端，用户可以更早看到部分内容。

> **基于文档内容推导**：选择渲染模式时的核心考量是——你的内容是否频繁变化且无法在构建时枚举？如果是，选服务端渲染；如果你的页面内容相对固定或可以在构建时预知所有路径，静态渲染能提供更好的性能和更简单的部署方式。两者也可以在不同的项目中分开使用，但同一项目内**不能混合使用**。

---

## 常见问题

### Data Loader 是否兼容？

**是的。** Data Loader（数据加载器）在服务端渲染模式下正常工作。它们在后端渲染之前获取数据，确保数据在页面渲染时已经可用。

> **关键术语解释**：
> - **Data Loader**：Expo Router 提供的数据获取机制，用于在路由加载时提前获取数据。在服务端渲染模式下，loader 在后端执行，获取的数据直接嵌入到 HTML 响应中。

### 能否混合使用渲染模式？

**不能。** 项目必须在 `static` 和 `server` 输出模式中选择其一。Expo Router 目前不支持在同一项目中混合使用两种模式。

> **基于文档内容推导**：如果你的应用同时包含静态页面（如首页、关于我们）和动态页面（如用户面板），你需要选择一个统一的渲染模式。一种折中方案是选择服务端渲染模式，然后利用 CDN 缓存来为"静态"页面模拟静态渲染的性能表现。

### 如何缓存响应？

缓存通过你的 CDN（内容分发网络）或后端基础设施来管理。可以使用 URL 匹配模式（URL patterns）和 HTTP 缓存头（cache headers）来控制哪些页面被缓存以及缓存多久。

> **关键术语解释**：
> - **CDN（Content Delivery Network）**：内容分发网络，通过在全球多个节点缓存内容来加速用户访问。
> - **缓存头（Cache Headers）**：HTTP 响应头（如 `Cache-Control`、`ETag`），用于告知浏览器和中间代理如何缓存响应内容。

### API 路由是否兼容？

**是的。** API 路由独立运行，无论选择哪种渲染模式，它们始终在后端执行。

> **注意**：API 路由（API Routes）与服务端渲染是独立的特性。即使选择静态渲染模式，API 路由仍然在后端执行。这意味着你可以用 API 路由来处理表单提交、Webhook 等后端逻辑，而不受渲染模式选择的影响。

---

## 文档导航

- **上一页**：[static rendering](./80__static-rendering.md)
- **下一页**：[async routes](./82__async-routes.md)
