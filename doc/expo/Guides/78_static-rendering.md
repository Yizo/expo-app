# Expo Router Static Rendering

## 文档解决的问题

这篇文档讲的是：如何把 Expo Router 的 Web 页面在构建时预先生成成 HTML。它解决的是 SEO、首屏直出、静态托管部署、构建期注入数据等问题。

## 适用场景

- 你的站点主要是内容展示型，适合静态导出。
- 你想把页面部署到任意静态托管平台。
- 你希望构建时就拿到完整 HTML，而不是每次请求都在服务器现算。
- 你需要让 Web 搜索引擎直接抓到页面内容。

## 先建立正确心智模型

- Static Rendering 更接近 React/Next 里的 SSG。
- 页面 HTML 在构建时生成，不是在用户请求时生成。
- React Native/Expo 项目里虽然也写 React 组件，但这里最终得到的是 `dist` 里的静态 Web 产物。
- 对 React Web 开发者来说，最关键的区别是：服务端不再参与逐请求渲染，所以动态 URL 的可用范围会受限。

## 核心概念

### 1. 输出模式是 `web.output: "static"`

这是静态渲染的总开关。

### 2. 构建时执行数据逻辑

文档明确说明：与静态渲染配套时，数据加载会在构建期执行，然后把结果嵌入 HTML。

### 3. 动态路由需要 `generateStaticParams`

静态导出时，构建器不知道有哪些动态参数，必须显式列出要生成哪些路径。

### 4. `+html.tsx` 是根 HTML 模板

你可以用 `src/app/+html.tsx` 自定义所有页面的外层 HTML。

### 5. 字体可静态优化

`expo-font` 在同步加载字体时，Expo CLI 会自动把字体预加载与 `@font-face` 注入 HTML。

## 关键流程

### 1. 启用静态输出

```json
{
  "expo": {
    "web": {
      "output": "static"
    }
  }
}
```

### 2. 本地开发

```bash
npx expo start
```

### 3. 导出 Web 产物

```bash
npx expo export --platform web
```

导出后会生成 `dist` 目录，文档说明其中包含预渲染 HTML，同时会复制 `public` 目录内容。

### 4. 本地预览导出结果

文档展示了通过静态文件服务器查看 `dist` 的方式，用来验证导出效果。

## 动态路由的关键流程

静态渲染下，动态路由必须导出 `generateStaticParams`，返回构建时要生成的所有参数组合。

对 React Web 开发者来说，这一点非常重要：

- 在 SSR 中，用户访问什么 URL，服务器就可以当场渲染。
- 在静态渲染中，构建时没列出来的动态参数，通常就没有对应 HTML。

基于文档内容推导：

- 如果你的内容列表来自 CMS、博客或文档系统，构建阶段通常要先拉一遍 slug 列表，再喂给 `generateStaticParams`。

## `+html.tsx` 的作用

文档说明可以通过 `src/app/+html.tsx` 自定义根 HTML。

它适合放：

- 全局 `<html>` / `<body>` 属性
- 全局 `<head>` 内容
- Web 专用根模板结构

但要注意：

- 这是 Node.js 侧运行的模板，不是普通客户端组件。
- 文档明确说明：不能在 `+html.tsx` 导入全局 CSS。
- 文档明确说明：不能调用浏览器 API，如 `window` 或 `document`。

## Metadata 与 Head

文档展示了可以通过 `<Head>` 这类方式为静态页面注入元信息。

开发影响：

- 对 SEO、分享卡片、预渲染标题描述很重要。
- 静态导出时，这些内容会直接进入生成后的 HTML。

## 字体静态优化

文档明确说明，使用 `expo-font` 的 `Font.loadAsync` 或 `useFonts` 并且同步触发时，Expo CLI 会自动提取字体资源，并在 HTML 中生成：

- 预加载 `<link rel="preload">`
- `@font-face`

文档强调的限制：

- 字体必须同步加载。
- 如果在 `useEffect`、延迟组件或异步函数里加载，可能无法静态优化。
- 包装函数可以用，但包装本身必须是同步的。

## 命令、配置、文件说明

### 命令

```bash
npx expo start
npx expo export --platform web
```

### 文件与目录

- `app.json`
  配置 `web.output: "static"`。
- `src/app/+html.tsx`
  自定义根 HTML。
- `public/`
  静态资源目录，导出时会复制到产物中。
- `dist/`
  导出结果目录。

### 动态路由相关

- `generateStaticParams`
  列出需要在构建时产出的动态页面参数。

## 注意事项、限制条件和坑点

- 动态路由不是天然全部可用，必须显式提供静态参数。
- `+html.tsx` 不能当普通客户端组件写。
- 不能在 `+html.tsx` 导入全局 CSS。
- 不能在 `+html.tsx` 使用浏览器 API。
- 字体静态优化要求同步加载。
- 当前文档未涉及增量静态再生成、按需重建等高级能力。

## React Web 开发者容易误解的地方

- 不要把 Expo 的静态渲染理解成“只是把 SPA build 一下”。
  这里会真正输出预渲染 HTML。
- 不要默认动态路由会像 SSR 一样自动工作。
  静态渲染需要提前枚举参数。
- 不要把 `+html.tsx` 当成任意 React 页面。
  它属于根 HTML 模板层，不是普通客户端组件层。
- 不要以为字体只要能显示就算完成。
  文档明确提到静态优化和是否同步加载有关，这会影响预加载与布局抖动。

## 实际开发建议

- 基于经验建议：营销页、博客、文档站、落地页优先考虑静态渲染。
- 基于经验建议：如果动态参数集合可枚举，静态渲染通常能换来更简单部署和更快首屏。
- 基于文档内容推导：如果业务高度依赖“请求时实时决定页面内容”，那更适合看服务端渲染而不是纯静态导出。
- 基于文档内容推导：对字体、SEO 元信息、公共模板的处理，应尽量在构建时就稳定下来。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- 静态渲染在构建时生成 HTML。
- 动态路由需要 `generateStaticParams`。
- `src/app/+html.tsx` 可自定义根 HTML。
- `+html.tsx` 不能导入全局 CSS，也不能使用浏览器 API。
- `expo-font` 支持静态字体优化，但要求同步加载。

### 基于文档内容推导

- 静态渲染更适合“可提前确定页面集合”的内容型项目。
- 如果路由参数无法在构建时穷举，静态渲染会带来很大限制。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router Server Headers](./77_server-headers.md) | [下一页：Expo Router Server Rendering →](./79_server-rendering.md)
<!-- NAVIGATION END -->
