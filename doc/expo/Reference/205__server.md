# Expo Server 学习指南

> 原文档更新时间：2026 年 1 月 20 日  
> 适用平台：Server  
> 包名：`expo-server`

> **版本提醒：**原文档属于“下一个 Expo SDK 版本”的未发布版本文档。稳定项目应优先核对 SDK 56 对应的最新稳定文档，避免使用尚未进入稳定版或接口可能继续变化的能力。

## 文档解决的问题

`expo-server` 是 Expo Router 项目的服务端 API 与运行时库，主要提供两类能力：

1. 在 API Route、中间件、数据加载器等服务端代码中：
   - 读取当前请求的信息；
   - 设置响应头；
   - 抛出可转换为 HTTP 响应的错误；
   - 调度与请求关联的异步任务。
2. 通过不同适配器，将 Expo Router 导出的服务端代码运行在 Node.js、Bun、Express、Vercel、Netlify、Cloudflare Workers 等环境中。

对于 React Web 开发者，可以暂时将它理解为：

- Expo Router 类似一个同时管理页面路由和服务端路由的框架；
- `expo-server` 类似框架提供的服务端运行时 API；
- Adapter 类似把框架产物接入 Node.js Server、Express 或 Serverless Function 的启动层。

它不是用于构建 React Native 原生界面的客户端组件库，也不能在浏览器或移动端组件代码中直接调用。

## 适用场景

这篇文档适合以下需求：

- 使用 Expo Router 创建 API Endpoint；
- 在服务端渲染 SSR 时读取请求头；
- 在 SSR 或 SSG 阶段为页面加载数据；
- 配置 Expo Router 服务端中间件；
- 在请求完成前后执行日志、分析上报等异步任务；
- 为响应统一添加 Header；
- 将 Expo Router 服务端产物部署到第三方运行环境；
- 生成网页的 SEO 与社交分享元数据。

当前文档未涉及：

- React Native 原生 UI 开发；
- iOS 或 Android 原生工程配置；
- 数据库、身份认证系统的具体实现；
- API Route、数据加载器和中间件的完整项目教程；
- 各云平台的具体部署步骤；
- `Metadata` 中所有子类型的完整字段结构。

## 阅读前需要理解的背景

### Expo Router

Expo Router 是 Expo 项目的文件路由系统。除了 React Native 页面路由，它还可以管理 Web 页面、API Route、服务端中间件和服务端渲染相关逻辑。

本文讨论的是其中的**服务端部分**。

### API Route

API Route 是运行在服务器上的 HTTP 处理函数。例如：

```ts
export async function GET() {
  return Response.json({ success: true });
}
```

这和 React Web 项目中的 Next.js Route Handler、Serverless Function 或 Express 路由作用相近。

### SSR 与 SSG

- **SSR（Server-Side Rendering）**：用户请求到达服务器时生成页面，因此存在真实的 HTTP 请求。
- **SSG（Static Site Generation）**：构建项目时预先生成页面，此时没有用户请求。

这个区别直接决定数据加载器能否读取 Header 等请求信息。

### Fetch API 服务端模型

文档中的 `Request`、`Response` 和 `Headers` 都采用 Web Fetch API 模型，而不是 Express 的 `req`、`res` 模型。

例如：

```ts
const authorization = request.headers.get('Authorization');

return Response.json({ authorization });
```

这套 API 与浏览器中的 Fetch API 很接近，因此 React Web 开发者通常比较容易理解。但这里的代码运行在服务器上，不会打进客户端 Bundle。

### Adapter

不同部署平台接收和返回 HTTP 请求的方式可能不同。Adapter 负责把平台请求转换为 Expo Router 能处理的形式，再把生成的响应交还给平台。

它相当于 Expo Router 服务端产物与具体运行环境之间的连接层。

## 安装与项目配置

根据使用的包管理器执行：

```sh
# npm
npx expo install expo-server

# yarn
yarn expo install expo-server

# pnpm
pnpm expo install expo-server

# bun
bun expo install expo-server
```

这里使用 `expo install`，而不是直接使用 `npm install`。它会按照当前 Expo SDK 选择兼容的软件包版本。

仅安装依赖还不够。项目必须配置为以 `server` 模式导出，并按照 Expo Router API Routes 指南启用相关服务端能力。

> **明确限制：**如果项目没有以 `server` 模式导出，无法仅凭安装 `expo-server` 获得完整的 Expo Router 服务端运行环境。

## 运行时 API 的使用范围

`expo-server` 的运行时 API 只能用于服务端代码，并且部分函数依赖当前请求处理器的异步上下文。

这意味着它们通常应当在 API Route、Middleware 或其他由 Expo Server 执行的请求代码中调用：

```ts
import { environment, origin } from 'expo-server';

export async function GET() {
  return Response.json({
    environment: environment(),
    origin: origin(),
  });
}
```

不要在普通 React 客户端组件的渲染逻辑、事件处理函数或浏览器代码中调用这些 API。

## 读取请求上下文

### `environment()`

```ts
function environment(): string | null
```

返回当前请求所属的环境名称，前提是运行平台支持该能力。

在 EAS Hosting 中，结果是环境别名或部署标识；其他 Provider 可能使用不同含义。

```ts
const currentEnvironment = environment();

const isProduction = currentEnvironment == null;
const isStaging = currentEnvironment === 'staging';
```

文档明确规定：生产环境返回 `null`。

因此，不能用常见的真值判断方式区分“没有环境信息”和“生产环境”；在该 API 的约定中，`null` 本身代表生产环境。

### `origin()`

```ts
function origin(): string | null
```

返回当前请求的 URL，某些平台可能只返回请求的 Origin。不同 Adapter 或部署平台的结果粒度可能不同，因此不要未经确认就假定返回值一定包含完整路径和查询参数。

开发环境中，该函数不会使用请求的 `Origin` Header，因为该 Header 可能包含不可信值。

> **开发影响：**如果需要构造绝对 URL，应先处理 `null`，并确认目标部署平台返回完整 URL 还是仅返回 Origin。

### `requestHeaders()`

```ts
function requestHeaders(): ImmutableHeaders
```

返回当前请求 Header 的不可变副本。

可以读取：

```ts
const headers = requestHeaders();
const authorization = headers.get('Authorization');
```

但不能修改。需要修改的是最终响应 Header 时，应使用 `setResponseHeaders()`。

## 设置响应 Header

### `setResponseHeaders(updateHeaders)`

该函数用于向当前请求处理器最终返回的 `Response` 合并 Header。

它支持三类输入：

- `Headers` 对象；
- `Record<string, string | string[]>`；
- 接收 `Headers` 的更新函数。该函数可以原地更新 Header，也可以返回另一个 `Headers` 对象用于合并。

示意用法：

```ts
import { setResponseHeaders } from 'expo-server';

export async function GET() {
  setResponseHeaders({
    'Cache-Control': 'public, max-age=60',
  });

  return Response.json({ success: true });
}
```

Header 不会在调用函数时立即写出，而是在请求处理器完成并返回 `Response` 后合并。

这与直接创建响应时传入 Header 的区别是：它允许位于调用链其他位置的服务端代码对最终响应进行统一补充。

## 请求生命周期中的异步任务

普通的“启动 Promise 但不等待”在 Serverless 环境中并不可靠。客户端收完响应后，平台可能立即终止请求处理器，未处理的 Promise rejection 也可能无法正确记录。

`expo-server` 提供了两种受运行时管理的任务方式。

### `runTask(fn)`

```ts
function runTask(
  fn: () => Promise<unknown>
): void
```

立即启动任务，并通知运行时保持请求处理器存活，直到任务完成。

```ts
runTask(async () => {
  await performImportantWork();
});
```

它适合与请求处理并发执行、但必须尽量保证完成的任务。

`runTask()` 自身返回 `void`，任务完成由运行时追踪，不是通过 `await runTask()` 等待。

### `deferTask(fn)`

```ts
function deferTask(
  fn: () => void | Promise<unknown>
): void
```

请求处理器成功解析出 `Response` 后才启动任务，并保持处理器存活到任务完成。

```ts
deferTask(async () => {
  await recordAnalytics();
});
```

适合响应生成之后执行的非关键工作，例如分析数据记录。

如果请求处理器抛出错误或返回 Promise rejection，延迟任务不会执行。

### 两者的区别

| API | 任务开始时间 | 是否保持处理器存活 | 适合场景 |
| --- | --- | --- | --- |
| `runTask()` | 调用后立即开始 | 是 | 可与请求并发执行的任务 |
| `deferTask()` | 成功生成响应后开始 | 是 | 日志、分析等非关键后置任务 |

> **容易踩坑：**“保持请求处理器存活”不等于任务一定能在所有异常、平台故障或进程退出场景下完成。原文只保证 Expo Server 运行时会等待任务完成，没有提供持久化任务队列的语义。

## 使用 `StatusError` 返回 HTTP 错误

`StatusError` 继承自 JavaScript `Error`，用于表达可转换为 HTTP 响应的服务端错误。

```ts
import { StatusError } from 'expo-server';

export function GET(request, { postId }) {
  if (!postId) {
    throw new StatusError(400, 'postId parameter is required');
  }
}
```

Expo Server 运行时会捕获它，并生成包含指定状态码和正文的 `Response`。

构造参数表达：

- `status`：HTTP 状态码，类型为 `number`；
- `body`：响应正文，类型为 `string`。

这类似在 Express 中调用：

```ts
res.status(400).send('postId parameter is required');
```

不同之处在于，`StatusError` 可以从较深的服务端调用链中抛出，由运行时统一转换。

> **安全注意：**不要把数据库错误、Token、堆栈信息等敏感内容直接放进 `body`，因为它会成为客户端可见的响应正文。此项属于基于该响应机制得出的安全影响。

## 数据加载器

Loader 在服务器端为路由获取数据，可运行于 SSR 或 SSG。

### `createServerLoader(fn)`

用于必须读取当前 HTTP 请求的数据加载逻辑：

```ts
import { createServerLoader } from 'expo-server';

export const loader = createServerLoader(async (request, params) => {
  const authHeader = request.headers.get('Authorization');

  return {
    authenticated: Boolean(authHeader),
  };
});
```

回调参数包括：

- `request`：不可变的 `ImmutableRequest`；
- `params`：路由参数，类型为 `Record<string, string | string[]>`。

Server Loader 会在每次 SSR 请求时运行。

由于 SSG 构建阶段没有 HTTP 请求，如果在 SSG 中调用这种 Loader，会抛出错误。

适用场景包括：

- 读取 Cookie 或 Authorization Header；
- 根据请求来源返回不同数据；
- 执行依赖当前用户请求的服务端逻辑。

### `createStaticLoader(fn)`

用于只依赖路由参数的数据加载逻辑：

```ts
import { createStaticLoader } from 'expo-server';

export const loader = createStaticLoader(async params => {
  const post = await fetchPost(params.id);
  return { post };
});
```

它不会接收 `request`，因此可以同时用于 SSR 和 SSG。

适合：

- 根据文章 ID 加载公开文章；
- 根据静态路由参数获取可预生成内容；
- 不依赖 Cookie、Header 或当前登录用户的数据。

### 如何选择

| 数据需求 | 推荐方式 |
| --- | --- |
| 需要读取请求 Header | `createServerLoader()` |
| 依赖当前登录用户 | `createServerLoader()` |
| 只依赖 URL 路由参数 | `createStaticLoader()` |
| 必须支持 SSG | `createStaticLoader()` |
| 只在 SSR 中执行 | 可以使用 `createServerLoader()` |

> **基于文档内容推导：**只要数据加载逻辑可能参与 SSG，就应优先将其设计为不依赖请求对象；否则构建阶段会因为不存在 HTTP 请求而失败。

### `LoaderFunction`

这是通用 Loader 函数类型：

```ts
import type { LoaderFunction } from 'expo-server';

export const loader: LoaderFunction = async (request, params) => {
  const data = await fetchData(params.id);
  return { data };
};
```

参数为：

- `request`：SSR 中是 `ImmutableRequest`，SSG 中为 `undefined`；
- `params`：从 URL 路径提取的参数。

如果直接使用 `LoaderFunction` 类型，而不是两个创建函数，代码必须自行处理 SSG 中 `request === undefined` 的情况。

## 不可变请求对象

### `ImmutableHeaders`

它是 Fetch API `Headers` 的只读版本。可以调用读取方法，但不能添加、修改或删除 Header。

### `ImmutableRequest`

它是只读的 Fetch API `Request`，具有以下限制：

- Request 本身不能修改；
- Header 不能修改；
- 无法读取请求 Body；
- 文档明确列出的可用属性包括 `method` 和 `url`。

```ts
const method = request.method;
const url = request.url;
const token = request.headers.get('Authorization');
```

这与 API Route 中可能接收到的完整 `Request` 不应混为一谈。本文定义的 `ImmutableRequest` 主要用于 Loader、Middleware 和 Metadata 等受限服务端接口。

> **React Web 开发者易误解点：**不可变并不只是 TypeScript 的只读提示，而是接口能力本身受限。尤其不能假定可以调用 `request.json()` 或 `request.formData()` 读取 Body。

## 服务端中间件

### `MiddlewareFunction`

中间件可以在应用请求进入具体路由之前执行。

```ts
import type { MiddlewareFunction } from 'expo-server';

const middleware: MiddlewareFunction = async request => {
  console.log(`Middleware executed for: ${request.url}`);
};

export default middleware;
```

参数是不可变且不能读取 Body 的 `ImmutableRequest`。

中间件可以返回：

- `Response`：直接产生响应；
- `void`：不直接产生响应；
- 上述两种结果的 Promise。

文档说明中间件默认可作用于应用的每个请求，也可以通过 Matcher 限制执行范围。

### `MiddlewareSettings`

在 `+middleware.ts` 文件中导出 `unstable_settings`：

```ts
import type { MiddlewareSettings } from 'expo-server';

export const unstable_settings: MiddlewareSettings = {
  matcher: {
    methods: ['GET'],
    patterns: ['/api', '/admin/[...path]'],
  },
};
```

`matcher` 是可选配置。

`unstable_settings` 的命名包含 `unstable`。原文没有进一步说明稳定性承诺或未来迁移方式，因此不应自行假定该配置名称已经稳定。

### `MiddlewareMatcher`

支持两个可选字段。

#### `methods`

类型：

```ts
string[]
```

限制中间件只匹配指定 HTTP Method：

```ts
methods: ['POST', 'PUT', 'DELETE']
```

不配置时匹配所有 HTTP Method。

#### `patterns`

类型：

```ts
(string | RegExp)[]
```

可使用：

- 精确路径；
- 带参数的路径；
- Catch-all 路径；
- 正则表达式。

例如：

```ts
patterns: [
  '/api',
  '/posts/[id]',
  '/blog/[...slug]',
  /^\/internal\//,
]
```

路由参数形式如 `/posts/[postId]`；Catch-all 形式如 `/blog/[...slug]`。

> 原文表格中的 Catch-all 示例存在排版空格，但其余示例使用的是 `[...path]` 形式。本文按代码示例中的正常路由写法展示，不扩展其匹配规则。

## 部署适配器

Expo Router 服务端导出需要适配实际运行环境。文档列出的 Adapter 包括：

| 导入路径 | 目标环境 |
| --- | --- |
| `expo-server/adapter/bun` | Bun |
| `expo-server/adapter/express` | Express |
| `expo-server/adapter/http` | Node.js HTTP Server |
| `expo-server/adapter/netlify` | Netlify Functions |
| `expo-server/adapter/vercel` | Vercel Functions |
| `expo-server/adapter/workerd` | Cloudflare Workers |

每种 Runtime 通常都需要自己的 Adapter，不能因为它们都运行 JavaScript 就随意混用。

### 导出服务端产物

部署前需要理解并执行：

```sh
npx expo export
```

该命令会生成导出产物。Adapter 所需的服务端构建目录是：

```text
dist/server
```

### `createRequestHandler`

按照约定，所有 Adapter 都导出 `createRequestHandler`：

```ts
import path from 'node:path';
import { createRequestHandler } from 'expo-server/adapter/http';

const onRequest = createRequestHandler({
  build: path.join(process.cwd(), 'dist/server'),
  environment: process.env.NODE_ENV,
});
```

关键配置：

| 配置项 | 作用 |
| --- | --- |
| `build` | 指向 `npx expo export` 生成的 `dist/server` 目录 |
| `environment` | 传递运行环境名称，是否支持以及具体含义取决于 Adapter |

`build` 必须设置为服务端输出目录的路径。示例使用 `path.join()` 生成绝对路径，但文档对参数的描述是相对于 `dist/server` 输出位置进行配置。

部分 Adapter 还可能接受额外参数，用于配置相应 Runtime API；当前文档没有列出各 Adapter 的完整参数。

## Metadata 类型

`Metadata` 用于描述网页元数据，包括 SEO、搜索引擎抓取、图标以及社交平台分享信息。

主要可选字段包括：

| 类别 | 字段 |
| --- | --- |
| 基础信息 | `title`、`description`、`applicationName`、`category`、`keywords` |
| 作者与发布信息 | `authors`、`creator`、`publisher`、`generator` |
| 搜索引擎 | `robots`、`referrer`、`alternates`、`archives` |
| 社交分享 | `openGraph`、`twitter`、`facebook`、`pinterest` |
| 应用集成 | `appleWebApp`、`appLinks`、`itunes`、`manifest` |
| 图标和资源 | `icons`、`assets`、`bookmarks` |
| 验证与扩展 | `verification`、`other`、`formatDetection` |

当前文档只列出了大部分字段对应的类型名称，没有给出所有子类型的详细结构，不能仅根据本页推断每个字段支持哪些属性。

### `MetadataIconDescriptor`

图标可以直接使用字符串，也可以使用对象：

```ts
type MetadataIconDescriptor =
  | string
  | {
      url: string;
      media?: string;
      rel?: string;
      sizes?: string;
      type?: string;
    };
```

只有 `url` 是对象形式下的必填字段。

### `MetadataImage`

元数据图片同样可以使用字符串或对象：

```ts
type MetadataImage =
  | string
  | {
      url: string;
      alt?: string;
      height?: number;
      secureUrl?: string;
      type?: string;
      width?: number;
    };
```

可用于表达图片地址、替代文本、尺寸、HTTPS 地址和 MIME 类型等信息。

### 自定义元数据值

`MetadataValue` 支持：

```ts
string | number | boolean
```

`MetadataValueArray` 是上述值的数组。

`Metadata.other` 可以保存自定义元数据，值还可为 `null` 或 `undefined`。

### `GenerateMetadataFunction`

动态元数据生成函数接收：

- `request: ImmutableRequest`；
- `params: Record<string, string | string[]>`。

它可以同步或异步返回：

- `Metadata`；
- `null`；
- `undefined`。

由于参数包含请求对象，它运行在服务端；请求对象仍然具有不可变、不能读取 Body 的限制。

## 关键限制与坑点

1. **仅限服务端。**  
   `expo-server` 的 Runtime API 不能放进 React Native 页面或浏览器端组件中。

2. **必须启用 Server Export。**  
   安装包并不等于完成服务端配置，Expo Router 项目还需要以 `server` 模式导出。

3. **当前页面是下一 SDK 版本文档。**  
   API 可能与 SDK 56 稳定文档不同，生产项目必须核对所用 Expo SDK。

4. **请求上下文并非随处可用。**  
   `origin()`、`requestHeaders()` 等函数依赖请求处理器的异步上下文，不应作为普通全局工具任意调用。

5. **`environment()` 的生产值是 `null`。**  
   不要照搬 `process.env.NODE_ENV === 'production'` 的判断习惯。

6. **`origin()` 可能不是完整 URL。**  
   文档明确表示某些平台可能只返回 Origin。

7. **Loader 的请求对象不能读取 Body。**  
   它也不能修改 Request 或 Header。

8. **SSG 阶段没有请求。**  
   `createServerLoader()` 不能用于 SSG；通用 `LoaderFunction` 的 `request` 在 SSG 中为 `undefined`。

9. **`deferTask()` 不在错误请求后执行。**  
   不能依赖它记录每一次失败请求。

10. **未受管理的后台 Promise 不可靠。**  
    Serverless Runtime 可能在响应完成后终止处理器，应使用 `runTask()` 或 `deferTask()`。

11. **不同运行环境需要对应 Adapter。**  
    Adapter 的附加配置可能不同，本页没有提供其完整配置说明。

12. **Middleware 默认匹配全部请求。**  
    只希望处理部分接口时，应明确配置 `methods` 和 `patterns`。

## React Web 开发者的理解对照

| 熟悉的 React Web 概念 | Expo Server 中的对应概念 |
| --- | --- |
| Next.js Route Handler / API Route | Expo Router API Route |
| Express Middleware | `MiddlewareFunction` |
| Next.js 数据加载或服务端 Loader | Expo Router Loader |
| Node/Serverless 部署入口 | Adapter 的 `createRequestHandler()` |
| `req.headers` | `ImmutableRequest.headers` 或 `requestHeaders()` |
| `res.setHeader()` | `setResponseHeaders()` |
| `res.status(...).send(...)` | 抛出 `StatusError` |
| 后台异步工作 | `runTask()` / `deferTask()` |
| 静态页面构建 | SSG |
| 每次请求时服务端渲染 | SSR |

最重要的区别不是语法，而是运行边界：

- React 组件可能运行在客户端；
- Loader、Middleware、API Route 和 Expo Server Runtime API 运行在服务端；
- SSG 虽然也在服务端执行，但发生在构建期，没有真实用户请求。

## 实际开发中的使用方式

一个合理的使用顺序是：

1. 配置 Expo Router 的 API Routes 和 `server` 导出模式。
2. 使用 `expo install` 安装 `expo-server`。
3. 根据代码所处阶段选择 API：
   - API Route 中读取请求上下文；
   - SSR 使用 `createServerLoader()`；
   - SSR 与 SSG 共用数据时使用 `createStaticLoader()`；
   - 全局请求逻辑放进 `+middleware.ts`。
4. 使用 `setResponseHeaders()` 统一补充缓存、安全或业务 Header。
5. 使用 `runTask()` 和 `deferTask()` 管理与请求生命周期关联的异步任务。
6. 执行 `npx expo export` 生成 `dist/server`。
7. 根据部署目标选择 Adapter，并将 `build` 指向服务端产物目录。

### 基于经验建议

- 将依赖 Cookie、Authorization Header 或用户身份的数据明确限制在 SSR，不要让它进入 SSG。
- 关键业务写入仍应在返回响应前完成，不要将必须成功的数据保存放进 `deferTask()`。
- 为 Middleware Matcher 编写覆盖路径和 HTTP Method 的测试，防止中间件意外作用于全部请求。
- 将 Adapter 相关代码保持在部署入口，避免业务模块依赖某个特定云平台。
- 使用环境信息时封装明确的环境判断函数，避免在业务代码中重复处理生产环境为 `null` 的特殊约定。

## 明确内容与推导内容

### 文档明确说明

- `expo-server` 是 Expo Router 的服务端 API 与 Runtime Library；
- Runtime API 只能用于服务端代码；
- 项目需要以 `server` 模式导出；
- Loader、任务调度、请求元数据、响应 Header 和 Adapter 的接口行为；
- `ImmutableRequest` 不可修改且不能读取 Body；
- `createServerLoader()` 在 SSG 中会报错；
- `deferTask()` 不会在请求处理器失败时执行；
- 各官方列出的 Adapter 与目标 Provider；
- `Metadata`、Middleware 和 Loader 的类型定义。

### 基于文档内容推导

- 需要构造绝对 URL 时，应处理 `origin()` 返回 `null` 或仅返回 Origin 的情况；
- 可能参与 SSG 的数据逻辑应尽量避免依赖 Request；
- `StatusError.body` 不应包含敏感错误信息；
- 不同 Adapter 不能因都支持 JavaScript 而随意替换；
- `runTask()` 和 `deferTask()` 不是持久化任务队列，不能覆盖进程退出等所有故障场景。

## 总结

`expo-server` 为 Expo Router 提供了统一的服务端编程模型：

- 使用 Fetch API 风格处理请求和响应；
- 使用 Loader 区分 SSR 与 SSG 数据需求；
- 使用 Middleware 处理跨路由逻辑；
- 使用任务 API 管理请求生命周期中的异步工作；
- 使用 Adapter 将同一份服务端导出部署到不同 Runtime；
- 使用 Metadata 类型描述 Web 页面元数据。

对 React Web 开发者而言，最大的学习重点是区分客户端、SSR 请求期和 SSG 构建期，并理解 Serverless 环境中的请求生命周期。掌握这些边界后，`expo-server` 的多数概念都可以映射到已有的 React Web、Fetch API 和 Node.js 服务端经验。

---

## 文档导航

- **上一页**：[sensors](./204__sensors.md)
- **下一页**：[sharing](./206__sharing.md)
