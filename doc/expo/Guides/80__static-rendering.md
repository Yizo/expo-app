# 静态渲染（Static Rendering）

> **原文地址**：https://docs.expo.dev/router/web/static-rendering/

---

## 概述

静态渲染是指在建阶段（build time）为 Web 路由预先生成 HTML 和 CSS 文件。这是实现 Web 端 SEO（搜索引擎优化）的关键手段——在构建时执行数据获取函数，将其输出直接嵌入到生成的 HTML 标记中。

> **关键术语解释**：
> - **静态渲染（Static Rendering）**：在构建时而非运行时生成页面内容。每个路由都会生成一个独立的 HTML 文件。
> - **SEO（Search Engine Optimization）**：搜索引擎优化，帮助搜索引擎更好地索引和展示你的网页内容。
> - **预渲染（Pre-rendering）**：在用户请求之前就生成好页面内容，与客户端渲染（CSR）相对。
> - **SPA（Single Page Application）**：单页应用，整个应用只有一个 HTML 入口页面，通过 JavaScript 动态更新内容。静态渲染生成的不是 SPA，而是多个独立的 HTML 文件。

---

## 初始配置

修改应用配置文件（`app.json`），将 Web 输出模式设置为 `static`：

```json
{
  "expo": {
    "web": {
      "output": "static"
    }
  }
}
```

> **关键术语解释**：
> - **`web.output`**：Expo 的 Web 输出模式配置项。设置为 `"static"` 表示生成静态 HTML 文件。其他可选值包括 `"server"`（服务端渲染）和 `"single"`（单页应用模式）。

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

构建完成后会生成一个 `dist` 文件夹，其中包含生成的站点文件以及复制的公共资产（public assets）。可以使用 `serve` 包在本地预览构建结果：

```sh
# npm
npx serve dist

# yarn
yarn dlx serve dist

# pnpm
pnpm dlx serve dist

# bun
bunx serve dist
```

> **注意**：由于此方式不会创建单页应用（SPA），也不包含后端 API，因此动态 URL 段（dynamic URL segments）需要单独的无服务器函数（serverless functions）才能正常工作。

---

## 处理动态路径

由于静态渲染需要为每个路径预先生成 HTML 标记，动态段（dynamic segments）需要一个特定的工具函数来定义要预构建哪些页面。

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export async function generateStaticParams(): Promise<Record<string, string>[]> {
  const posts = await getPosts();
  // 返回一个参数数组，用于生成对应的静态 HTML 文件。
  // 数组中的每个条目都会生成一个新页面。
  return posts.map(post => ({ id: post.id }));
}

export default function Page() {
  const { id } = useLocalSearchParams();

  return <Text>Post {id}</Text>;
}
```

> **关键术语解释**：
> - **`generateStaticParams`**：一个在构建时执行的异步函数，返回一个参数对象数组。构建系统会为数组中的每个参数对象生成一个独立的 HTML 文件。
> - **动态段（Dynamic Segment）**：路由路径中的可变部分，例如 `/blog/[id]` 中的 `[id]`。
> - **`useLocalSearchParams`**：Expo Router 提供的 Hook，用于获取当前路由的搜索参数（包括动态段参数）。

构建系统会为每个返回的参数对象创建单独的文件，并将它们组织到对应的子目录中。例如，博客文章 `alpha` 会生成 `dist/blog/alpha.html`。

### generateStaticParams 函数详解

`generateStaticParams` 是一个**仅在构建时**运行的函数，它运行在 Node.js 环境中（通过 CLI 执行）。它可以访问系统变量和文件系统目录，但**无法**使用浏览器 API 或原生模块。

```tsx
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  console.log(process.cwd());

  return [];
}
```

> **重要限制**：
> - 该函数仅在 Node.js 环境中运行
> - 可以使用 `process.cwd()`、`process.env` 等 Node.js API
> - **不能**使用 `window`、`document` 等浏览器 API
> - **不能**使用 React Native 的原生模块

#### 嵌套路由中的参数传递

参数会在嵌套路由中**向下传递**。父级路由定义的参数值会传递给子级路由的 `generateStaticParams` 函数，子级函数必须处理所有从父级继承的参数变体。

父级路由示例：

```tsx
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return [{ id: 'one' }, { id: 'two' }];
}
```

子级路由接收继承的参数值，并必须为所有变体生成组合：

```tsx
export async function generateStaticParams(params: {
  id: 'one' | 'two';
}): Promise<Record<string, string>[]> {
  const comments = await getComments(params.id);
  return comments.map(comment => ({
    ...params,
    comment: comment.id,
  }));
}
```

> **基于文档内容推导**：如果父级生成了 2 个 `id`（`one` 和 `two`），而每个 `id` 下分别有 3 条评论，那么最终会生成 2 × 3 = 6 个静态页面。子级的 `generateStaticParams` 必须返回包含所有父级参数的完整组合。

### 文件系统读取

> **警告**：避免使用 `__dirname` 等目录名变量作为文件路径，因为编译过程会改变这些值。应始终使用 `process.cwd()` 来获取当前工作目录。

```tsx
import fs from 'node:fs/promises';
import path from 'node:path';

export async function generateStaticParams(params: {
  id: string;
}): Promise<Record<string, string>[]> {
  const directory = await fs.readdir(path.join(process.cwd(), './posts/'));
  const posts = directory.filter(fileOrSubDirectory => {
    return path.extname(fileOrSubDirectory) === '.md';
  });

  return [{
    id,
    posts,
  }];
}
```

> **关键术语解释**：
> - **`process.cwd()`**：Node.js 方法，返回当前工作目录的绝对路径。这是获取文件路径的可靠方式。
> - **`__dirname`**：Node.js 全局变量，返回当前模块文件所在目录的路径。在构建工具编译后，该值可能发生变化，因此不推荐使用。

---

## 基础 HTML 文档

Expo Router 提供了一个默认的 HTML 模板（boilerplate），用于包裹每个页面。你可以通过在应用目录中添加一个特定的 TSX 文件来覆盖此默认模板。

> **文件位置**：`app/+html.tsx`

这个组件**仅在 Node.js 环境中运行**，它会包裹所有路由，适合用于全局 `<head>` 标签的修改。

> **注意**：Context Provider（上下文提供者）应该放在根布局（root layout）中，而不是放在 `+html.tsx` 中。

```tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// 此文件仅用于 Web 端，用于在静态渲染期间配置每个
// Web 页面的根 HTML。
// 此函数中的内容仅在 Node.js 环境中运行，
// 无法访问 DOM 或浏览器 API。
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          在 Web 端禁用 body 滚动。这使得 ScrollView 组件的行为
          更接近原生平台的表现。
          但 body 滚动在移动 Web 端通常是需要的。
          如果要启用它，请移除此行。
        */}
        <ScrollViewStyleReset />

        {/* 在此添加你希望在全局 Web 端可用的额外 <head> 元素... */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

> **重要细节**：
> - `children` 属性包含主要的根 `div` 元素
> - 脚本（scripts）在渲染之后加载
> - React Native 的样式会自动注入
> - 全局样式表应在根布局（root layout）中引入，以防止 CSS 优先级问题
> - 此处**无法**访问浏览器的 `window` 对象

### Router HTML 工具函数

`expo-router/html` 模块导出了工具函数，例如 `ScrollViewStyleReset`，用于确保全屏 Web 应用中 ScrollView 的行为更接近原生平台。

---

## 元数据注入

使用 `expo-router/head` 包中的 `Head` 组件来注入页面元数据。预渲染这些元素可以改善搜索引擎的可见性。

```tsx
import Head from 'expo-router/head';
import { Text } from 'react-native';

export default function Page() {
  return (
    <>
      <Head>
        <title>My Blog Website</title>
        <meta name="description" content="This is my blog." />
      </Head>
      <Text>About my blog</Text>
    </>
  );
}
```

> **关键术语解释**：
> - **`Head` 组件**：来自 `expo-router/head` 的组件，用于在页面的 `<head>` 中注入 `<title>`、`<meta>` 等标签。
> - **元数据（Metadata）**：描述页面内容的信息，如标题、描述、关键词等，对 SEO 至关重要。

> **基于经验建议**：为每个页面设置独特的 `title` 和 `meta description`，这对于搜索引擎排名和用户在搜索结果中的点击率有显著影响。

---

## 公共资产

CLI 会在构建过程中将 `public` 文件夹的内容复制到最终的 `dist` 分发目录中。

`public` 文件夹结构示例：

```text
public
├── favicon.ico
├── logo.png
└── .well-known
    └── apple-app-site-association
```

> **警告**：避免使用保留目录名称，例如 `assets` 文件夹，因为 Expo 内部已经使用了该名称。

构建后文件会被复制到 `dist` 目录：

```text
dist
├── index.html
├── favicon.ico
├── logo.png
├── .well-known
│   └── apple-app-site-association
└── _expo
    └── static
        ├── js
        │   └── index-xxx.js
        └── css
            └── index-xxx.css
```

在运行时代码中，可以使用相对 URL 来引用这些文件：

```tsx
import { Image } from 'react-native';

export default function Page() {
  return <Image source={{ uri: '/logo.png' }} />;
}
```

---

## 字体优化

`expo-font` 模块会自动为 Web 端优化字体加载。同步加载时，会提取字体资源并直接嵌入到 HTML 标记中，从而避免字体加载闪烁（FOUT）。

```tsx
import { Text } from 'react-native';
import { useFonts } from 'expo-font';

export default function App() {
  const [isLoaded] = useFonts({
    inter: require('@/assets/inter.ttf'),
  });

  if (!isLoaded) {
    return null;
  }

  return <Text style={{ fontFamily: 'inter' }}>Hello Universe</Text>;
}
```

构建后会生成预加载的 HTML 标记：

```html
<!-- 在 JavaScript 加载之前预加载字体 -->
<link rel="preload" href="/assets/inter.ttf" as="font" crossorigin />
<style id="expo-generated-fonts" type="text/css">
  @font-face {
    font-family: inter;
    src: url(/assets/inter.ttf);
    font-display: auto;
  }
</style>
```

> **重要限制**：
> - 如果字体加载是延迟执行的（deferred），此优化将**无法生效**
> - 仅支持 `expo-font` 包提供的标准异步加载方法和 `useFonts` Hook
> - 不支持第三方字体加载方案

> **关键术语解释**：
> - **`<link rel="preload">`**：HTML 标签，告诉浏览器提前加载指定的资源，提升页面渲染性能。
> - **`font-display: auto`**：CSS 属性，控制字体加载期间文本的显示方式。`auto` 由浏览器决定显示策略。
> - **FOUT（Flash of Unstyled Text）**：字体加载过程中，文本先以系统默认字体显示，加载完成后再切换为目标字体的闪烁现象。

---

## 常见问题

### 自定义服务器实现

自定义服务器目前没有预定义的实现方案。开发者需要手动管理动态路径，直到未来的 API 更新提供官方支持。

### 动态请求渲染

请求时渲染（request-time rendering）与静态输出模式**不兼容**。如果需要在请求时动态渲染页面，必须使用 `server` 模式（服务端渲染模式）。

> **基于文档内容推导**：如果你的应用需要用户个性化内容（如登录后的用户面板）或实时数据（如股票行情），则静态渲染不适用，应考虑使用服务端渲染（`output: "server"`）。

### 托管平台

静态渲染的产出可以部署到多种静态托管平台，包括但不限于：

- **EAS Hosting**（Expo 官方托管）
- **Netlify**
- **Cloudflare Pages**
- **AWS**（S3 + CloudFront 等）
- **Vercel**
- **GitHub Pages**
- **Render**
- **Surge**

> **注意**：由于输出是独立的文档（而非 SPA），因此**不需要**配置单页应用的重定向规则。每个页面都是独立的 HTML 文件，可以直接由静态服务器提供服务。

> **基于经验建议**：部署到上述平台时，建议配置 CDN（内容分发网络）来缓存静态资源，以进一步提升全球用户的访问速度。

---

## 文档导航

- **上一页**：[server headers](./79__server-headers.md)
- **下一页**：[server rendering](./81__server-rendering.md)
