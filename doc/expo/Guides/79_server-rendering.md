# Expo Router Server Rendering

## 文档解决的问题

这篇文档讲的是：如何让 Expo Router 在 Web 上按请求实时生成 HTML，也就是 SSR。它解决的是动态内容、动态 metadata、请求时数据获取、不能提前静态穷举路由等问题。

## 适用场景

- 你需要在每次请求时根据 URL、请求头、参数、服务端数据生成页面。
- 动态路由很多，无法在构建时全部枚举。
- 你需要在 HTML 流开始前就确定 metadata。
- 你准备部署到支持服务端运行时的平台，而不是纯静态托管。

## 先建立正确心智模型

- 这里的 SSR 是“请求到来时在服务器渲染 HTML”，不是客户端 hydration 本身。
- Expo Router 在 SSR 模式下仍然是 React 组件开发体验，但会额外产出服务端渲染入口。
- 对 React Web 开发者来说，它更接近现代 React SSR/流式输出，而不是传统 SPA。

## 核心概念

### 1. 这是 `alpha` 能力

文档明确说明：

- Server rendering 处于 `alpha`
- SDK 55+ 可用
- 生产环境需要已部署服务器

### 2. 输出模式是 `web.output: "server"`

这表示应用会生成面向服务端运行时的产物，而不是纯静态 HTML。

### 3. Data loaders 在每次请求时执行

文档明确说明：SSR 下 data loaders 在服务器上针对每个请求执行，并把结果嵌入 HTML 响应。

### 4. 动态路由按请求实时渲染

SSR 下不需要 `generateStaticParams`，文档还明确说应移除它。

### 5. `+html.tsx` 是服务端根 HTML 模板

通过 `src/app/+html.tsx` 自定义外层 HTML，但这是纯服务端运行逻辑。

### 6. `generateMetadata` 更适合 SSR

文档推荐在 SSR 中优先使用 `generateMetadata`，因为它能在 HTML 流最开始的字节里就把 metadata 放进去。

## 关键流程

### 1. 启用 SSR

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

### 2. 启动开发服务器

```bash
npx expo start
```

### 3. 导出生产产物

```bash
npx expo export --platform web
```

文档明确说明：和静态渲染不同，这里不会预生成所有 HTML 文件。

### 4. 本地验证生产构建

```bash
npx expo serve
```

这个命令会启动本地服务端，按请求渲染页面，模拟生产环境。

## 产物结构

文档给出的 `dist` 结构核心包括：

- `dist/client`
  客户端 hydration 所需的 JS/CSS bundle
- `dist/server`
  服务端渲染模块与路由清单
- `dist/server/render.js`
  服务端渲染入口
- `dist/server/routes.json`
  路由 manifest

对 React Web 开发者来说，这意味着产物天然分为“客户端资源”和“服务端执行代码”两部分。

## 动态路由

文档明确说明：

- SSR 下动态路由按请求实时渲染。
- `generateStaticParams` 不需要，应该删除。
- 即使你还导出了它，这些路由仍会按请求动态处理。

这和静态渲染的差异非常关键。

## `+html.tsx` 的作用与限制

文档说明你可以创建 `src/app/+html.tsx`，并通过 `useServerDocumentContext` 获取：

- `htmlAttributes`
- `bodyAttributes`
- `headNodes`
- `bodyNodes`

文档明确强调：这些值都必须正确渲染进去，否则 SSR 输出可能损坏，应用也可能无法正常工作。

同时，文档明确说明：

- `+html.tsx` 只在服务端使用，不会进入客户端 rehydrate。
- 只能使用 `useServerDocumentContext` 这个 React hook。
- 不能在这里导入全局 CSS。
- 不能使用 `window`、`document` 这类浏览器 API。
- 必须渲染收到的 `children`。

## Metadata

### 推荐方式：`generateMetadata`

文档说明可以在路由文件中导出 `generateMetadata`，它运行在服务端，接收 request 与 route params，返回 metadata 对象。

适合生成：

- `title`
- `description`
- Open Graph 信息

文档明确说明：`generateMetadata` 会从客户端 bundle 中剥离，只在服务端执行。

### `<Head>` 的定位

文档也允许同时使用 `<Head>`，但明确推荐 SSR 场景优先使用 `generateMetadata`，因为它能在 HTML 流开始前完成 metadata 注入，而 `<Head>` 更适合 hydration 后的动态更新。

## 部署

文档明确说明：SSR 需要运行时服务器，不能部署到 GitHub Pages 这类纯静态托管。

支持的平台适配器包括：

- EAS Hosting
- Node.js / Express
- Cloudflare Workers
- Vercel Edge Functions
- Netlify Edge Functions
- Bun

文档给出的 EAS Hosting 示例命令：

```bash
npx expo export --platform web
npx eas-cli@latest hosting:deploy dist
```

## 与静态渲染的对比

文档明确对比了两者差异：

- HTML 生成时机
  Static 在构建时，Server 在请求时
- HTML 交付方式
  Static 直接给完整文档，Server 可渐进流式输出
- 动态路由
  Static 依赖 `generateStaticParams`，Server 自动支持
- Metadata
  Static 更依赖 `<Head>`，Server 推荐 `generateMetadata`
- 托管方式
  Static 可用任意静态托管，Server 必须有运行时服务器

## 常见问题

文档明确回答了几件事：

- SSR 可以和 data loaders 一起使用。
- 目前不能在同一个项目里混用 server rendering 与 static rendering。
- 缓存要在服务器或 CDN 层处理。
- API Routes 与渲染模式相互独立，始终在服务器上执行。

## 命令、配置、文件说明

### 命令

```bash
npx expo start
npx expo export --platform web
npx expo serve
npx eas-cli@latest hosting:deploy dist
```

### 配置

- `web.output: "server"`
  开启服务端输出模式。
- `unstable_useServerRendering: true`
  开启 SSR 实验能力。

### 文件

- `src/app/+html.tsx`
  自定义根 HTML。
- `dist/client`
  客户端资源。
- `dist/server/render.js`
  服务端渲染入口。
- `dist/server/routes.json`
  路由清单。

## 注意事项、限制条件和坑点

- 当前文档明确说明：这是 `alpha` 功能。
- 生产环境需要服务端运行时。
- 不能和 static rendering 混用。
- `+html.tsx` 里不能用浏览器 API，也不能导入全局 CSS。
- 必须正确渲染 `useServerDocumentContext` 提供的全部上下文值。
- 纯静态托管平台不适用。

## React Web 开发者容易误解的地方

- 不要把 SSR 只理解成“SEO 更好”。
  在这套模型里，它还影响动态路由、metadata 生成方式、部署平台选择。
- 不要保留 `generateStaticParams` 的旧习惯。
  SSR 模式下它不再是主路径。
- 不要把 `+html.tsx` 当成浏览器可执行组件。
  它只在服务端执行。
- 不要以为缓存由 Expo Router 自动处理。
  文档明确说缓存要由服务器或 CDN 层负责。

## 实际开发建议

- 基于经验建议：内容强依赖请求时数据、用户上下文、实时 metadata 时优先考虑 SSR。
- 基于经验建议：如果部署平台无法稳定提供服务端运行时，就不要选 SSR。
- 基于文档内容推导：如果你的项目主要是固定内容页，Static Rendering 会更简单；如果 URL 数量大且难以穷举，SSR 会更自然。
- 基于文档内容推导：SSR 项目应尽早明确缓存策略，否则性能和成本都可能不理想。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- SSR 是 SDK 55+ 的 `alpha` 能力。
- 生产环境需要已部署服务器。
- data loaders 会在每次请求时运行。
- 动态路由不需要 `generateStaticParams`。
- 不能和 static rendering 混用。
- 缓存由服务器或 CDN 层处理。

### 基于文档内容推导

- SSR 更适合动态内容与动态 metadata 较多的项目。
- 在 SSR 模式下，部署平台能力与缓存策略会直接影响最终体验。
