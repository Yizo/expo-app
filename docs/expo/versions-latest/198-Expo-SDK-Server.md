# 198｜Expo SDK Server 服务端运行时与 API 路由

**翻页：**[上一页：Expo SDK Sensors 设备传感器总览](./197-Expo-SDK-Sensors.md) · [目录](./README.md) · [下一页：Expo SDK Sharing](./199-Expo-SDK-Sharing.md)

**官方页面：**[Server · Latest](https://docs.expo.dev/versions/latest/sdk/server/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/server/)

**版本与范围：**Latest 推荐 `expo-server ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。这是 Expo Router 项目的**服务端** API / runtime，只能在 server request handler 等服务端异步上下文调用，不属于客户端 React Native app API。使用前要把 Expo Router 配为 `server` output；参考 [Expo Router API Routes 官方指南](https://docs.expo.dev/router/web/api-routes/)。两版参考页 API 相同。

## 从 React 客户端切换到服务端思维

- **API Route：**收到 HTTP 请求后运行在服务器的函数，可以验证输入、读密钥、调用数据库并返回 HTTP `Response`。与手机里的 React component 不同，它不应访问 `View`、设备传感器等客户端原生 UI API。
- **Request / Response：**Fetch 标准的 HTTP 请求 / 响应对象。路由 handler 用 `Request` 读取 method、URL、headers 等，再返回 `Response`。
- **SSR 与 SSG：**SSR（服务端渲染）按每次请求执行；SSG（静态生成）在构建时生成，没有当下的 incoming request。
- **`expo-server` runtime：**从当前请求上下文读取 origin / environment / headers、设置返回响应头、安排和请求并行的任务，并提供 loader、错误与部署适配器。
- **Adapter：**把 Expo Router 导出的 `dist/server` 运行在某个服务器 / serverless 平台上的适配函数。

`expo-server` 的 API Routes 需要 Expo Router 用 `server` output 生成 server bundle。Expo 官方指南说明 server feature 需要自定义服务器环境，可部署到 EAS Hosting 或支持的其它运行时。

## 安装与配置

```sh
npx expo install expo-server
yarn expo install expo-server
pnpm expo install expo-server
bun expo install expo-server
```

使用时需要按 [Expo Router API Routes 指南](https://docs.expo.dev/router/web/api-routes/)启用 `server` export mode。

## 在 API Route 读取当前请求元数据

`environment()` 可用于区分生产和预览环境；`origin()` 读取当前请求的 URL / origin。生产环境常返回 `null`，EAS Hosting 返回的环境名称是 alias 或 deployment identifier；其他 provider 可能不同：

```ts
import { environment, origin } from 'expo-server';

export async function GET() {
  const currentEnvironment = environment();
  return Response.json({
    isProduction: currentEnvironment === null,
    isStaging: currentEnvironment === 'staging',
    origin: origin(),
  });
}
```

这些 helper 依赖当前 HTTP request 的 async context，不能在客户端组件或没有正在处理的请求时调用。`origin()` 在开发环境不信任 `Origin` 请求头，避免使用可伪造的 header 作为来源依据。

## 调度 handler 期间任务

直接 `await` 一项任务会拖慢 API response。`runTask` 允许任务和 handler 并行运行，并告诉 server runtime 保持 handler 活着直到任务完成；`deferTask` 则等 handler 已经解析 `Response` 后才运行，例如上报非关键 analytics。handler 本身失败时 deferred task 不会执行：

```ts
import { deferTask, runTask } from 'expo-server';

export async function GET() {
  runTask(async () => {
    await recordRequestStarted(); // 并行开始，但 runtime 会等待完成
  });

  const result = await loadImportantData();

  deferTask(async () => {
    await recordResponseSent(); // 等 Response 解析后再执行
  });

  return Response.json(result);
}
```

`runTask` 与不带 `await` 的 Promise 不同：服务端 runtime 知道这个任务存在，不会因为 response 已发给客户端就立刻提前结束函数。`deferTask` 适合成功返回后再做的非关键工作，不适用于必须参与返回值 / 错误状态的任务。

## 运行导出的 Expo Router Server

`expo-server` 提供各运行时 adapter。通常每种 runtime 要用自己的 adapter；先通过 `npx expo export` 创建 `dist/server`，然后以 `createRequestHandler({ build })` 接入 HTTP server：

| Adapter | Provider / runtime |
| --- | --- |
| `expo-server/adapter/bun` | Bun |
| `expo-server/adapter/express` | Express |
| `expo-server/adapter/http` | Node.js |
| `expo-server/adapter/netlify` | Netlify Functions |
| `expo-server/adapter/vercel` | Vercel Functions |
| `expo-server/adapter/workerd` | Cloudflare Workers |

官方 Node HTTP adapter 示例：

```ts
import path from 'node:path';
import { createRequestHandler } from 'expo-server/adapter/http';

const onRequest = createRequestHandler({
  build: path.join(process.cwd(), 'dist/server'),
  environment: process.env.NODE_ENV,
});
```

`createRequestHandler` 的 `build` 是 `expo export` 生成的 `dist/server` 相对路径。Adapter 可接受其它 runtime 配置值；具体运行和部署方式参照 Expo Router API Routes 官方指南。这里列出 provider 名称仅为 Expo 文档能力概览，不代表本地环境已配置这些服务。

## `StatusError` 统一生成 HTTP 错误

在路由 handler 或 server-side helper 中抛出 `StatusError(status, body)` 时，`expo-server` runtime 会将其转换成指定 HTTP 状态与 body 的 `Response`：

```ts
import { StatusError } from 'expo-server';

export function GET(request: Request, { postId }: { postId?: string }) {
  if (!postId) {
    throw new StatusError(400, 'postId 参数必填');
  }
  return Response.json({ postId });
}
```

`StatusError` 是扩展 `Error` 的类，实例字段为 `status: number` 与 `body: string`。错误会中断当前 handler 路径并提前返回错误响应。需要重定向或自定义响应头 / 响应体时，也可以直接抛出 `Response`；两种方式适用场景不同。

## Route loaders：请求专用与静态安全版本

### `createServerLoader(fn)`

为需要访问 incoming request 的路由创建 loader，例如从只读 headers 里检查认证信息。Server loader 在 SSR 每次请求执行；若 SSG 构建时没有真实 Request，就会抛错：

```ts
import { createServerLoader } from 'expo-server';

export const loader = createServerLoader(async (request, params) => {
  const authHeader = request.headers.get('Authorization');
  return { authenticated: Boolean(authHeader), routeParams: params };
});
```

### `createStaticLoader(fn)`

如果 loader 只需路径参数、不读 headers / body，使用 `createStaticLoader`。callback 只收到 `params`，因此能在 SSG 和 SSR 两种场景运行：

```ts
import { createStaticLoader } from 'expo-server';

export const loader = createStaticLoader(async params => {
  const post = await fetchPost(params.id);
  return { post };
});
```

路径参数的类型是 `Record<string, string | string[]>`，catch-all 路由可能得到数组。两种 loader 都返回泛型 `LoaderFunction<T>`；`LoaderFunction` 在 SSG 中的 request 参数是 `undefined`，请求专用代码应选 server loader。

页面还展示了直接给 loader 声明类型的形式：

```ts
import type { LoaderFunction } from 'expo-server';

export const loader: LoaderFunction = async (request, params) => {
  const data = await fetchData(params.id);
  return { data };
};
```

## Middleware 配置与 matcher

`MiddlewareSettings` 从 `+middleware.ts` 导出 `unstable_settings`，使用 `matcher.methods` 限制 HTTP 方法、`matcher.patterns` 限制 URL 路径。pattern 可是精确路径、动态路由路径（`/posts/[id]`、`/blog/[...slug]`）或正则：

```ts
import type { MiddlewareSettings } from 'expo-server';

export const unstable_settings: MiddlewareSettings = {
  matcher: {
    methods: ['GET'],
    patterns: ['/api', '/admin/[...path]'],
  },
};
```

若不提供 `methods`，middleware 默认匹配所有 HTTP method。middleware handler 类型是 `MiddlewareFunction(request)`；接收不可变请求，可返回 `Response` 或 `void`，也可以返回 Promise。

`MiddlewareFunction` 的类型化函数示例：

```ts
import type { MiddlewareFunction } from 'expo-server';

const middleware: MiddlewareFunction = async request => {
  console.log(`middleware 收到请求：${request.url}`);
};

export default middleware;
```

## API 方法速查

| API | 作用 |
| --- | --- |
| `createServerLoader(fn)` | 创建每次 SSR 请求执行、可访问 `ImmutableRequest` 的 loader；用于 SSG 时没有 request 会抛错。 |
| `createStaticLoader(fn)` | 创建只用路径参数、兼容 SSR / SSG 的 loader。 |
| `deferTask(fn)` | 等 handler 解析 Response 后执行任务；handler 出错时不执行。 |
| `environment()` | 获取当前 request 的 environment string，生产通常为 `null`。 |
| `origin()` | 当前请求 URL / origin，返回 `string \| null`；开发环境不读取不可信的 `Origin` header。 |
| `requestHeaders()` | 返回当前请求的只读 header 副本 `ImmutableHeaders`。 |
| `runTask(fn)` | 与 handler 并行开始任务，通知 runtime 等待它结束。 |
| `setResponseHeaders(updateHeaders)` | 修改当前 handler 最后返回的 Response headers。参数可为 `Headers`、普通 record 或接收 Headers 的更新函数；在 Response resolve 后合并生效。 |
| `StatusError(status, body)` | 抛出后由 runtime 变成带对应 status / body 的 Response；包含 `body` 与 `status` 属性。 |

## Request、middleware 与 loader 类型

- `ImmutableRequest` 是 Fetch `Request` 的只读版本：header 不可变，没有 request body 访问权限。页面列明 `method: string`、`url: string`。
- `ImmutableHeaders` 是不可变的 Fetch `Headers`，不能追加 / 修改字段。
- `MiddlewareMatcher` 包含 `methods?: string[]` 与 `patterns?: (string | RegExp)[]`。
- `MiddlewareSettings` 为 `+middleware.ts` 导出的 `unstable_settings` 配置，属性 `matcher?: MiddlewareMatcher`。
- `GenerateMetadataFunction(request, params)` 接收 immutable request 与 route params，返回 `Metadata`、null / undefined 或其 Promise。
- `LoaderFunction(request, params)` 在 SSR/SSG 侧执行并返回 `T` 或 `Promise<T>`；SSG 时 request 为 `undefined`。
- `MetadataValue` 是 `string | number | boolean`；`MetadataValueArray` 是 MetadataValue 数组。

## `Metadata` 类型速查

`Metadata` 是 server renderer 使用的页面 metadata 字段集合。页面列出这些可选项：

`alternates`、`appleWebApp`、`applicationName`、`appLinks`、`archives`、`assets`、`authors`、`bookmarks`、`category`、`creator`、`description`、`facebook`、`formatDetection`、`generator`、`icons`、`itunes`、`keywords`、`manifest`、`openGraph`、`other`、`pinterest`、`publisher`、`referrer`、`robots`、`title`、`twitter`、`verification`。

其他页面类型：

| 类型 | 字段 |
| --- | --- |
| `MetadataIconDescriptor` | `url` 必填；`media?`、`rel?`、`sizes?`、`type?`。 |
| `MetadataImage` | `url` 必填；`alt?`、`height?`、`secureUrl?`、`type?`、`width?`。 |
| `MetadataValue` / `MetadataValueArray` | string / number / boolean，或这些值组成的数组。 |

`Metadata.referrer` 可取 `no-referrer`、`no-referrer-when-downgrade`、`origin`、`origin-when-cross-origin`、`same-origin`、`strict-origin`、`strict-origin-when-cross-origin`、`unsafe-url`。

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐依赖 | `expo-server ~57.0.3` | `~56.0.6` |
| runtime helpers、adapters、loader / middleware / Metadata API | 与 v56 页面一致 | 与 Latest 页面一致 |
| 官方页脚 Next | Sharing | Sharing |

## 官方源页代码主题覆盖

- 安装：覆盖 npx、Yarn、pnpm、Bun。
- Request metadata：改写 `origin()` / `environment()` 的 GET handler 示例。
- Task scheduling：覆盖同一 handler 中 `runTask` 和 `deferTask` 两种执行时机。
- Adapters：覆盖 Node `createRequestHandler` 初始化、build 路径及 environment，并列出 Bun / Express / Node / Netlify / Vercel / workerd。
- API 示例：覆盖 StatusError、server loader、static loader、`unstable_settings` matcher、LoaderFunction 和 MiddlewareFunction 等价代码。
- API 表无示例的 `requestHeaders` / `setResponseHeaders` 以参数表解释；Metadata 及请求 / middleware 类型字段已按官方定义列出。

**翻页：**[上一页：Expo SDK Sensors 设备传感器总览](./197-Expo-SDK-Sensors.md) · [目录](./README.md) · [下一页：Expo SDK Sharing](./199-Expo-SDK-Sharing.md)
