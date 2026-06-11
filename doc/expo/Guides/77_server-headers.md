# Expo Router Server Headers

## 文档解决的问题

这篇文档讲的是：如何在 Expo Router 中统一给服务端返回的 HTML 或 API 响应加上 HTTP 响应头。它解决的是缓存、安全策略、跨域隔离、版本标记这类“响应级配置”问题。

## 适用场景

- 你想给所有页面响应统一加安全头。
- 你想给 API Route 统一设置某些 header。
- 你在 Web 上使用需要跨源隔离的能力，例如文档中提到的 `SharedArrayBuffer` 或 `expo-sqlite` 的某些 Web 场景。
- 你需要为响应增加缓存策略或自定义业务头。

## 核心概念

### 1. 这是全局 header 配置，不是单个路由逻辑

文档中的能力来自 `expo-router` config plugin。它会把配置的 header 应用到服务端响应中。

### 2. 同时支持两种输出模式

文档明确说明：

- `static` 模式下，通过 `expo-server` 提供预渲染 HTML 时可以应用 header。
- `server` 模式下，对动态渲染响应也可以应用 header。

### 3. API Route 自己设置的 header 优先级更高

如果插件里配置了全局 header，而某个 API Route 自己又返回了同名 header，那么路由自己的 header 会覆盖全局值。

## 关键流程

### 1. 在 `app.json` 中配置 `expo-router` 插件

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "X-App-Version": "1.0.0",
            "X-Environment": "production"
          }
        }
      ]
    ]
  }
}
```

### 2. 启动或导出应用

文档展示的是配置型能力，没有单独的运行时代码入口。它会在服务端输出时自动生效。

## 命令、配置、文件说明

### 文件

- `app.json`
  通过 `expo-router` 插件声明全局 header。

### 配置项

- `headers`
  一个 key-value 对象，用来定义全局响应头。

文档中的示例场景包括：

- 安全头
- 跨源隔离相关头
- 缓存头
- 自定义业务头

## 文档中的典型配置方向

### 安全头

可用于统一加诸如 CSP、`X-Frame-Options`、`X-Content-Type-Options` 之类的安全相关 header。

### 跨源隔离头

文档提到可以设置 `Cross-Origin-Opener-Policy`、`Cross-Origin-Embedder-Policy` 这类 header，以支持特定 Web 能力。

### 缓存头

可以全局配置 `Cache-Control` 之类的缓存策略。

### 自定义头

可以统一附加版本号、环境标识等 header，例如：

```json
{
  "headers": {
    "X-App-Version": "1.0.0",
    "X-Environment": "production"
  }
}
```

## 注意事项、限制条件和坑点

- 文档明确说明：这套 header 不会覆盖 API Route 自己显式返回的同名 header。
- 文档明确说明：redirect 响应不应用这些 header。
- 文档明确说明：这些 header 只作用于 HTML 和 API Route 响应，不作用于图片、字体、JavaScript bundle 等静态资源。
- 文档明确说明：`static` 模式下依赖 `expo-server` 来提供这些 header，不是“把文件丢到任意静态托管”就一定有同样效果。

## React Web 开发者容易误解的地方

- 不要把它理解成 CDN 或 Nginx 层的全部替代方案。
  它是 Expo Router 自己提供的一层全局响应头配置。
- 不要默认它会覆盖所有资源类型。
  文档明确说它不作用于静态资源。
- 不要默认 redirect 也会继承这些 header。
  当前文档明确说明不会。
- 不要默认全局配置一定是最终值。
  API Route 自己返回的同名 header 优先。

## 实际开发建议

- 基于经验建议：适合把全站一致的 header 放在这里，例如安全策略、环境标识、默认缓存策略。
- 基于经验建议：API Route 如果有更精细的缓存或实时性要求，应在路由里显式返回自己的 header。
- 基于文档内容推导：如果你需要给静态资源单独配 header，通常还需要在部署平台或上层服务器/CDN 配置，而不能只依赖这里。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- `server headers` 支持 `static` 与 `server` 两种输出模式。
- API Route 自定义 header 优先于插件全局 header。
- redirect 响应不应用这些 header。
- 静态资源响应不应用这些 header。

### 基于文档内容推导

- 这套能力更适合作为应用级默认策略，而不是资源级或边缘缓存级最终方案。
- 复杂部署场景下，Expo Router header 配置通常要和托管平台的响应头策略一起设计。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router Server Middleware](./76_middleware.md) | [下一页：Expo Router Static Rendering →](./78_static-rendering.md)
<!-- NAVIGATION END -->
