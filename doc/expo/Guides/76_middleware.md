# Expo Router Server Middleware

## 文档解决的问题

这篇文档讲的是：如何在 Expo Router 的服务端请求入口前统一执行一段逻辑。它解决的是“每个请求都要先做鉴权、日志记录、动态重定向、API 入口过滤”这类问题，而不是某个单独接口的业务处理问题。

## 适用场景

- 你在做 Expo Router 的 Web 服务端输出，并且希望在请求进入具体路由前先做统一处理。
- 你需要对 API 路由、SSR 请求、首次页面加载做统一鉴权或日志记录。
- 你想做“按请求条件决定是否直接返回 Response”的逻辑。
- 当前文档明确说明：这是 `alpha` 能力，SDK 54+ 可用，生产环境需要已部署的服务器。

## 先建立正确心智模型

- `middleware` 不是 React 组件，它运行在服务器上，不运行在客户端组件树里。
- 它和 Web 框架里的请求中间件很像，作用点在“HTTP 请求到达服务器之后、命中具体路由之前”。
- 它和 API Route 不一样。
  API Route 处理某个具体端点。
  Middleware 会对命中的服务器请求统一执行。
- React Web 开发者最容易误解的点是：Expo Router 的客户端导航并不会经过这里。
  文档明确说明：使用 `<Link />` 或 `router` 的客户端导航、原生端页面切换、prefetch、静态资源请求都不会运行 middleware。

## 核心概念

### 1. 只有一个 `+middleware.ts`

Expo Router 目前支持单个 `src/app/+middleware.ts` 文件，它对所有服务端请求生效，再通过 matcher 做过滤。

### 2. `request` 是不可变的

默认导出的 middleware 函数会收到一个 immutable request。

- 你可以读 `url`、`headers` 等信息。
- 你不能修改 request header。
- 你不能消费 request body。
- 这样做是为了避免副作用。

### 3. 返回 `Response` 或返回空

- 返回 `Response`：请求到这里就结束，直接把该响应发给客户端。
- 不返回任何内容：请求继续进入后续路由处理。

### 4. matcher 控制执行范围

可以通过 `unstable_settings.matcher` 限制：

- 只对某些 HTTP 方法执行。
- 只对某些路径模式执行。

支持的路径模式包括：

- 精确路径，如 `/api`
- 命名参数，如 `/posts/[postId]`
- catch-all，如 `/blog/[...slug]`
- 正则表达式

当前文档明确说明：如果同时配置 `methods` 和 `patterns`，两个条件必须同时满足。

## 关键流程

### 1. 打开服务端输出并启用 middleware

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
          "unstable_useServerMiddleware": true
        }
      ]
    ]
  }
}
```

含义：

- `web.output: "server"` 表示 Web 不是纯静态导出，而是需要服务端参与响应。
- `unstable_useServerMiddleware: true` 用来显式开启该实验能力。

### 2. 创建 `src/app/+middleware.ts`

```ts
export default function middleware(request) {
  console.log(`Middleware executed for: ${request.url}`);
}
```

这是最小可用版本，默认导出函数就是入口。

### 3. 启动开发服务器

```bash
npx expo start
```

### 4. 在真实 HTTP 请求下验证

文档建议通过浏览器访问、直接输入 URL、刷新页面或发起请求来测试，并查看控制台输出。

## 请求处理顺序

文档明确说明，请求顺序如下：

1. 先执行 middleware。
2. 如果 middleware 返回 `Response`，立即返回该响应。
3. 如果 middleware 没返回内容，请求继续进入匹配到的路由。
4. 最终由路由处理器生成响应。

## 命令、配置、文件说明

### 文件

- `app.json`
  用来声明 Web 输出模式和插件配置。
- `src/app/+middleware.ts`
  middleware 的唯一入口文件。

### 命令

```bash
npx expo start
```

作用：启动开发服务器，验证 middleware 是否在实际请求中生效。

### matcher 配置示例

```ts
export const unstable_settings = {
  matcher: {
    methods: ['GET'],
    patterns: ['/api', '/admin/[...path]'],
  },
};

export default function middleware(request) {
  console.log(`Middleware executed for: ${request.url}`);
}
```

含义：

- 只拦截 `GET`
- 只命中 `/api` 与 `/admin/...`

## 文档中的典型用途

### 鉴权

可以读取 `authorization` header，验证 token，不通过就直接返回 `401` 或 `403`。

### 日志记录

可以对请求方法、URL、时间戳、`user-agent` 做统一日志。

### 动态重定向

可以根据请求头等条件返回 `Response.redirect(...)`。

### 仅保护 API

通过 matcher 让 middleware 只对 API 路由生效，不影响页面请求。

## 注意事项、限制条件和坑点

- 当前文档明确说明：这是 `alpha` 特性。
- 生产环境必须有已部署的服务器，纯静态托管不适用。
- middleware 只在“实际 HTTP 请求”上运行，不在客户端页面跳转上运行。
- `prefetch` 不会触发 middleware。
- 图片、字体等静态资源请求不会触发 middleware。
- 由于它会影响每个命中的请求，文档强调必须尽量轻量、尽量快。
- 文档建议优先使用精确路径和命名参数，而不是复杂正则，因为更快也更易维护。

## React Web 开发者容易误解的地方

- 不要把它当成 React 组件生命周期。
  它更接近服务端网关层。
- 不要假设 `Link` 跳转一定会经过它。
  在 Expo Router 中，客户端导航不会重新走服务器 middleware。
- 不要把它当成“所有业务都能在这里统一处理”的万能层。
  需要和 API Route、页面路由各自职责分开。
- 原生 App 的页面切换也不会经过这里。
  只有原生 App 去请求 API Route 时，请求才会先过 middleware。

## 实际开发建议

- 基于经验建议：把 middleware 主要用于鉴权前置、审计日志、动态重定向、API 安全入口，不要塞重计算逻辑。
- 基于经验建议：高流量项目应尽量通过 matcher 缩小命中范围。
- 基于文档内容推导：如果你需要“客户端跳页时也执行逻辑”，那通常要在页面层、布局层或导航钩子里补一套客户端逻辑，不能只依赖 middleware。
- 基于文档内容推导：如果你的移动端 App 需要安全访问后端，优先让 App 调 API Route，再由 middleware 做统一保护，会比把敏感逻辑放客户端更合理。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- middleware 在每个服务端请求到达路由前执行。
- 这是 SDK 54+ 的 `alpha` 功能。
- 生产环境需要已部署服务器。
- `request` 是不可变的。
- 返回 `Response` 会直接结束请求。
- 客户端导航、原生页面切换、prefetch、静态资源请求不会触发 middleware。

### 基于文档内容推导

- 如果你的应用大量依赖客户端导航，middleware 只能覆盖“首次进入”和“真实请求”，不能覆盖全部导航行为。
- middleware 更适合作为服务端入口守卫，而不是页面内部业务编排层。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router Data Loaders](./75_data-loaders.md) | [下一页：Expo Router Server Headers →](./77_server-headers.md)
<!-- NAVIGATION END -->
