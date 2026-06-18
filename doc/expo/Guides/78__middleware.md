# 服务端中间件（Server Middleware）

> **原文地址**：https://docs.expo.dev/router/web/middleware/

**简介**：了解如何在 Expo Router 中构建针对每个服务端请求执行的中间件。

> **⚠️ Alpha 功能警告**
>
> 此功能目前处于 **alpha（内测）** 阶段，从 **SDK 54** 开始可用。在生产环境中，需要一个**已部署的服务端（deployed server）** 才能使用。

---

## 概述

Expo Router 的服务端中间件允许开发者在请求到达路由之前执行自定义逻辑。这使得你可以实现强大的服务端功能，例如跨所有请求的**日志记录（logging）**和**身份认证（authentication）**。

与针对特定端点的 **API 路由（API Routes）** 不同，此中间件会在**每一个**应用请求时触发。因此，它必须**快速执行**，以避免影响性能。

> **⚠️ 重要提示**
>
> 客户端导航（client-side navigation）——包括原生端转场动画或使用 `<Link />` 组件的 Web 应用——**不会**经过此服务端中间件。

**关键术语解释（面向初学者）**：

| 术语 | 解释 |
|---|---|
| **中间件（Middleware）** | 在请求到达最终处理逻辑之前执行的一段代码，类似于"守门员"或"过滤器" |
| **API 路由（API Routes）** | Expo Router 中定义的服务端端点，用于处理特定 URL 的请求 |
| **客户端导航（Client-side navigation）** | 在前端通过 JavaScript 切换页面，而非向服务器发起完整的 HTTP 请求 |
| **不可变请求（Immutable Request）** | 只读的请求对象，你可以查看但不能修改它 |

---

## 配置（Setup）

### 第一步：在应用配置中启用

首先，在你的 **app config（应用配置文件）** 中添加服务端相关设置，以启用服务端输出。

```json
{
  "expo": {
    ...
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

> **术语解释**：`unstable_useServerMiddleware` 中的 `unstable_` 前缀表示该功能尚未稳定，API 可能会在未来版本中发生变化。`"output": "server"` 表示 Web 端采用服务端渲染模式而非纯静态输出。

### 第二步：创建中间件文件

在 `src/app` 目录下创建一个 `+middleware.ts` 文件，导出服务端中间件函数。

```ts
export default function middleware(request) {
  console.log(`Middleware executed for: ${request.url}`);
  // 你的中间件逻辑写在这里
}
```

该函数**必须使用默认导出（default export）**。它接收一个**不可变的 `request`（请求）对象**，可以返回一个 `Response` 对象，也可以不返回任何内容（此时请求将继续原样传递到后续路由处理）。

> **不可变性（immutability）** 的意义在于防止副作用：你可以检查请求的 headers（标头）和属性，但**不能**修改 headers 或消费请求体（body）。

### 第三步：启动开发服务器

启动开发服务器来验证中间件是否生效。

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

中间件现在将对所有应用请求执行。

### 第四步：测试功能

在浏览器中打开你的应用或发送请求，确保中间件正常运行。查看中间件函数输出的控制台日志。

### 第五步（可选）：配置匹配器（Matchers）

默认情况下，中间件会在**所有**服务端请求上运行。你可以通过 `unstable_settings` 添加匹配器（matcher）来控制中间件的执行时机。

```ts
export const unstable_settings = {
  matcher: {
    // 仅在 GET 请求时运行
    methods: ['GET'],
    // 仅在 API 路由和特定路径上运行
    patterns: ['/api', '/admin/[...path]'],
  },
};

export default function middleware(request) {
  console.log(`Middleware executed for: ${request.url}`);
}
```

匹配器允许你：

- **按 HTTP 方法过滤**：指定哪些 HTTP 方法（如 GET、POST 等）会触发中间件。
- **按路径模式过滤**：使用精确路径、命名参数或正则表达式来指定匹配的 URL 模式。

> **基于经验建议**：在高流量应用中，务必使用匹配器来限制中间件的执行范围，避免对每个请求都执行不必要的逻辑，这对性能至关重要。

---

## 工作原理（How It Works）

中间件函数在路由处理器（route handlers）之前运行，便于执行修改响应、身份认证或日志记录等任务。执行仅发生在**服务端**，且仅针对**真实的 HTTP 请求**。

### 请求/响应流程

当收到请求时，Expo Router 按以下顺序处理：

1. **中间件函数首先执行**，接收一个不可变的 `request` 对象。
2. 如果中间件返回了一个 `Response` 对象，该响应将**立即发送给客户端**。
3. 如果中间件**不返回任何内容**，请求将被传递给匹配的路由。
4. 路由处理器处理请求并返回响应。

```
客户端请求 → 中间件执行 → 是否返回 Response？
                              ├── 是 → 直接返回给客户端
                              └── 否 → 传递给路由处理器 → 路由返回响应
```

> **基于文档内容推导**：这意味着中间件可以充当"拦截器"角色——如果请求不合法（如未通过认证），可以直接返回错误响应，无需让请求继续到达路由处理器。

### 模式匹配（Pattern Matching）

匹配器支持多种模式类型来控制中间件的执行。

```ts
export const unstable_settings = {
  matcher: {
    patterns: [
      '/api',                    // 精确路径
      '/posts/[postId]',         // 命名参数
      '/blog/[...slug]',         // 通配参数（catch-all）
      /^\/api\/v\d+\/users$/,    // 正则表达式
    ],
  },
};
```

各模式类型的说明：

- **精确路径（Exact paths）**：仅匹配指定的路由。`/api` 匹配 `/api`，但**不匹配** `/api/users`。
- **命名参数（Named parameters）**：捕获单个路径段。`/posts/[postId]` 匹配 `/posts/123`。
- **通配参数（Catch-all parameters）**：捕获多个路径段。`/blog/[...slug]` 匹配 `/blog/2024/12/post`。
- **正则表达式（Regular expressions）**：处理复杂模式。示例中的正则表达式匹配 `/api/v1/users`，但**不匹配** `/api/users`。

> **匹配规则**：只要**任意一个**模式匹配了 URL，中间件就会执行。当同时指定了 `methods` 和 `patterns` 时，**两个条件必须同时满足**才会执行。

### 中间件执行顺序

Expo Router 允许为所有服务端请求设置**一个** `+middleware.ts` 文件。配合匹配器使用时，中间件仅在匹配的请求到达路由渲染或匹配之前运行。

### 中间件何时运行

中间件**仅在真实 HTTP 服务端请求**时执行，包括：

- ✅ 初始页面加载（initial page loads）
- ✅ 完整页面刷新（full page refreshes）
- ✅ 直接 URL 导航（direct URL navigation）
- ✅ 来自任何客户端的 API 路由调用
- ✅ 服务端渲染请求

中间件**不会**在以下情况执行：

- ❌ 通过 `<Link />` 或 `router` 进行的客户端导航
- ❌ 原生端转场动画（native screen transitions）
- ❌ 预加载的路由（prefetched routes）
- ❌ 静态资源请求（如字体和图片）

> **基于经验建议**：这一点非常关键——很多初学者会困惑"为什么我的中间件没有执行"。如果你在使用 `<Link />` 组件进行页面间跳转，中间件不会触发，因为这是客户端导航。要测试中间件，请直接在浏览器地址栏输入 URL 或刷新页面。

---

## 示例（Examples）

### 身份认证（Authentication）

身份认证是中间件最常见的用途之一——在路由加载之前进行权限检查。你可以通过检查 cookies、headers 或查询参数来验证用户是否有权限访问。

```ts
import { jwtVerify } from 'jose';

export default function middleware(request) {
  const token = request.headers.get('authorization');

  const decoded = jwtVerify(token, process.env.SECRET_KEY);
  if (!decoded.payload) {
    return new Response('Forbidden', { status: 403 });
  }
}
```

> **术语解释**：`jwtVerify` 是来自 `jose` 库的函数，用于验证 JSON Web Token（JWT）。JWT 是一种常见的身份认证方式，客户端在请求头中携带令牌（token），服务端验证其有效性。`process.env.SECRET_KEY` 是存储在环境变量中的密钥。

### 日志记录（Logging）

通过记录请求来追踪用户活动或调试问题。

```ts
export default function middleware(request) {
  console.log(`${request.method} ${request.url}`);
}
```

### 动态重定向（Dynamic Redirects）

根据特定条件控制导航跳转。

```ts
export default function middleware(request) {
  if (request.headers.has('specific-header')) {
    return Response.redirect('https://expo.dev');
  }
}
```

### 仅针对 API 路由的中间件（API-only Middleware）

使用匹配器将中间件限制在 API 路由上执行。

```ts
export const unstable_settings = {
  matcher: {
    patterns: ['/api'],
  },
};

export default function middleware(request) {
  // 记录所有 API 请求以便调试
  console.log(`API request: ${request.method} ${request.url}`);

  // 为 API 路由添加 CORS 头
  const response = new Response();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

> **术语解释**：**CORS（Cross-Origin Resource Sharing，跨域资源共享）** 是一种浏览器安全机制。`Access-Control-Allow-Origin: *` 允许任何来源的客户端访问你的 API。在生产环境中，通常应将其限制为特定的域名。

### 按 HTTP 方法进行身份认证（Method-specific Authentication）

保护写操作（POST、PUT、DELETE），同时允许公开的读操作（GET）。

```ts
export const unstable_settings = {
  matcher: {
    methods: ['POST', 'PUT', 'DELETE'],
    patterns: ['/api', '/admin/[...path]'],
  },
};

export default function middleware(request) {
  const token = request.headers.get('authorization');

  if (!token || !isValidToken(token)) {
    return new Response('Unauthorized', { status: 401 });
  }
}

function isValidToken(token: string): boolean {
  // 你的令牌验证逻辑
  return token.startsWith('Bearer ');
}
```

> **基于经验建议**：这是一种常见的安全模式——读操作对外开放，写操作需要认证。配合 `methods` 匹配器使用可以精确控制哪些请求需要验证，避免对 GET 请求产生不必要的性能开销。

### 选择性日志记录（Selective Logging）

监控特定端点，而非记录所有请求。

```ts
export const unstable_settings = {
  matcher: {
    patterns: ['/api/users/[userId]', '/admin', /^\/webhook/],
  },
};

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent');
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${request.method} ${request.url} - ${userAgent}`);
}
```

---

## 补充说明（Additional Notes）

### 最佳实践

- **保持轻量**：中间件在每个请求上同步运行，直接影响响应时间。避免在中间件中执行耗时操作。
- **善用匹配器**：通过匹配器跳过不必要的执行，对高流量应用尤为重要。
- **优先使用简单模式**：优先使用精确路径和命名参数，而非正则表达式——简单模式计算更快且更易于维护。
- **组合方法 + 模式过滤**：同时使用 `methods` 和 `patterns` 来实现精确的执行控制。
- **原生应用建议**：对于原生应用，使用 API 路由进行安全的数据获取。原生端对 API 路由的调用会先经过此中间件。

### 类型化中间件（Typed Middleware）

使用 TypeScript 为中间件函数添加类型约束：

```ts
import { MiddlewareFunction } from 'expo-router/server';

const middleware: MiddlewareFunction = request => {
  if (request.headers.has('specific-header')) {
    return Response.redirect('https://expo.dev');
  }
};

export default middleware;
```

> **术语解释**：`MiddlewareFunction` 是 Expo Router 提供的 TypeScript 类型，用于确保中间件函数的签名正确。使用类型可以在编写代码时获得自动补全和编译期错误检查。

### 限制（Limitations）

- **仅服务端执行**：中间件仅在服务端的 HTTP 请求上运行。客户端导航（如原生转场或 `<Link />` 组件跳转）不会触发中间件。
- **请求对象不可变**：`request` 对象是不可变的，以避免副作用。你不能修改 headers 或消费请求体，以确保后续路由处理器能正常使用。
- **仅支持一个中间件文件**：每个应用只允许有一个根级别的 `+middleware.ts` 文件。
- **API 路由的限制同样适用**：API 路由的已知限制也适用于中间件。

### 请求不可变性（Request Immutability）

为了避免意外的副作用并确保请求体可供后续路由处理器使用，`Request` 对象是**不可变的**。

**你可以做的**：

- ✅ 读取 `method`、`url`、`headers` 等属性
- ✅ 通过 `request.headers.get()` 获取 header 值
- ✅ 使用 `request.headers.has()` 检查 header 是否存在
- ✅ 访问查询字符串（query string）和 URL 参数

**你不能做的**：

- ❌ 使用 `delete()`、`append()` 或 `set()` 修改 headers
- ❌ 通过 `formData()`、`json()` 或 `text()` 消费请求体
- ❌ 直接访问 body 属性

> **基于文档内容推导**：请求不可变性的设计是为了保证中间件的"只读观察"特性——中间件应当仅用于检查和决策，而不是修改请求。如果你需要修改请求信息再传递给路由处理器，应考虑使用其他方式（如在返回的 Response 中携带信息，或通过环境变量/上下文传递）。

---

## 文档导航

- **上一页**：[data loaders](./77__data-loaders.md)
- **下一页**：[server headers](./79__server-headers.md)
