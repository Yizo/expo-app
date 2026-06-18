> **原文地址**：https://docs.expo.dev/router/web/api-routes/

# API 路由（API Routes）

## 什么是 API 路由

API 路由是在路由匹配时在服务器上执行的函数。它们可以帮助你：

- **安全管理敏感数据**，例如 API 密钥等凭证信息
- **实现自定义服务端逻辑**，例如身份验证令牌处理、数据聚合等

API 路由应在 **WinterCG 兼容环境**中执行。

> **初学者说明**：**WinterCG**（Web-interoperable Runtimes Community Group）是一个致力于让不同 JavaScript 运行时（如 Deno、Cloudflare Workers、Node.js 等）在 Web API 层面保持互通的社区组织。WinterCG 兼容意味着你的代码可以运行在遵循这些标准的各种服务端环境中。

API 路由运行在**沙盒化环境**中，与客户端代码完全隔离，因此你可以在路由处理函数中安全地存放敏感数据。

> **基于文档内容推导**：API 路由本质上就是"放在前端项目目录中的后端接口"，类似于 Next.js 中的 API Routes 概念。区别在于 Expo Router 使用 `+api.ts` 后缀文件来标识，而非特殊的目录结构。

---

## 创建 API 路由

### 前提条件

首先，你需要确保项目的 Web 输出模式设置为 `server`（服务端渲染）。在 `app.json` 中进行如下配置：

```json
{
  "web": {
    "output": "server"
  }
}
```

> **初学者说明**：`app.json` 是 Expo 项目的核心配置文件。`web.output` 设为 `"server"` 意味着 Web 端会使用服务端渲染模式，而非默认的静态导出模式。只有在这种模式下，API 路由才能工作。

### 文件命名规则

API 路由通过在 `app` 目录中创建带有 `+api.ts` 后缀的文件来定义。当匹配的 URL 路径被访问时，对应的处理函数将被执行。

**目录结构示例：**

```text
src
 app
  index.tsx
  hello+api.ts
```

在上述示例中：
- `index.tsx` 是普通的路由页面
- `hello+api.ts` 是一个 API 路由，对应路径 `/hello`

> **⚠️ 重要限制**：API 路由文件名**不能使用平台特定的扩展名**。例如，`hello+api.web.ts` 是无效的。你必须使用 `+api.ts`（或 `+api.js`）作为后缀，不能区分 Web、iOS、Android 平台。

> **初学者说明**：Expo 通常支持通过 `.web.ts`、`.ios.ts`、`.android.ts` 等平台后缀来为不同平台提供不同实现。但 API 路由文件**不支持**这种机制，因为 API 路由只在服务端运行，不存在跨平台问题。

### 基本示例

在 `app/hello+api.ts` 中编写以下代码：

```ts
export function GET(request: Request) {
  return Response.json({ hello: 'world' });
}
```

> **初学者说明**：
> - `Request` 和 `Response` 是 Web 标准 API，不需要额外导入。它们是浏览器和现代 JavaScript 运行时（如 Node.js 18+）内置的全局对象。
> - `export function GET` 表示导出一个名为 `GET` 的函数。函数名对应 HTTP 方法（GET、POST、PUT、DELETE 等）。
> - `Response.json()` 是一个便捷方法，用于创建包含 JSON 数据的 HTTP 响应，并自动设置 `Content-Type: application/json` 头。

### 启动开发服务器

使用以下命令启动项目：

```sh
# npm
npx expo

# yarn
yarn expo

# pnpm
pnpm expo

# bun
bun expo
```

### 测试 API 路由

你可以通过 `curl` 命令来测试：

```sh
curl http://localhost:8081/hello
```

预期返回：

```json
{ "hello": "world" }
```

### 在前端代码中调用 API 路由

```tsx
import { Button } from 'react-native';

async function fetchHello() {
  const response = await fetch('/hello');
  const data = await response.json();
  alert('Hello ' + data.hello);
}

export default function App() {
  return <Button onPress={() => fetchHello()} title="Fetch hello" />;
}
```

> **基于经验建议**：在实际项目中，建议将 API 调用封装为统一的请求函数，并添加错误处理、超时控制和重试逻辑，不要直接在组件中写裸 `fetch` 调用。

---

## 请求（Requests）

API 路由使用标准的 Web `Request` 对象来处理入站请求。

### 请求体（Request Body）

对于 `POST`、`PUT` 等方法，可以使用 `request.json()` 解析 JSON 请求体：

```ts
export async function POST(request: Request) {
  const body = await request.json();

  return Response.json({ ... });
}
```

> **初学者说明**：`request.json()` 是一个异步方法，会解析请求体中的 JSON 字符串并返回 JavaScript 对象。请确保客户端发送请求时设置了 `Content-Type: application/json` 请求头。

### 请求查询参数（Request Query Parameters）

有两种方式获取 URL 中的查询参数：

**方式一：通过函数第二个参数（适用于动态路由段）**

```ts
export async function GET(request: Request, { post }: Record<string, string>) {
  // const postId = new URL(request.url).searchParams.get('post')
  // 获取 'post' 对应的数据
  return Response.json({ ... });
}
```

**方式二：通过 `URL` 对象手动解析**

```ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const post = url.searchParams.get('post');

  // 获取 'post' 对应的数据
  return Response.json({ ... });
}
```

> **初学者说明**：
> - `new URL(request.url)` 将请求的 URL 字符串解析为 `URL` 对象，方便提取各部分信息。
> - `searchParams.get('post')` 用于获取 URL 查询字符串中 `?post=xxx` 对应的值。
> - 第二个参数 `{ post }` 是 Expo Router 提供的**动态路由参数**，当你的文件名使用方括号语法（如 `[post]+api.ts`）时，该参数会自动传入。

---

## 响应（Response）

API 路由使用标准的 Web `Response` 对象来返回数据。

### 返回 JSON 数据

```ts
export function GET() {
  return Response.json({ hello: 'universe' });
}
```

### 自定义响应状态码和内容

你可以创建带有任意状态码和响应体的 `Response`：

```ts
export async function GET(request: Request, { post }: Record<string, string>) {
  if (!post) {
    return new Response('No post found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  // 获取 `post` 对应的数据
  return Response.json({ ... });
}
```

> **初学者说明**：
> - `status: 404` 表示"未找到"的 HTTP 状态码。常见状态码：`200`（成功）、`201`（已创建）、`400`（请求错误）、`401`（未授权）、`404`（未找到）、`500`（服务器内部错误）。
> - `headers` 用于设置 HTTP 响应头，`Content-Type: text/plain` 表示返回纯文本内容。

### 自动错误处理

- 使用不支持的 HTTP 方法时，会自动返回 **`405: Method not allowed`**
- 路由中抛出的未捕获异常会自动返回 **`500: Internal server error`**

### 错误处理

推荐使用 `expo-server` 包中的 `StatusError` 类来抛出结构化错误：

首先安装 `expo-server`：

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

然后使用 `StatusError`：

```ts
import { StatusError } from 'expo-server';

export async function GET(request: Request, { post }: Record<string, string>) {
  if (!post) {
    throw new StatusError(404, 'No post found');
  }
  // ...
}
```

你也可以抛出 `Response` 对象来执行重定向：

```ts
import { StatusError } from 'expo-server';

export async function GET(request: Request, { post }: Record<string, string>) {
  if (!post) {
    throw Response.redirect('https://expo.dev', 302);
  }
  // ...
}
```

> **初学者说明**：
> - `StatusError` 是一个特殊的错误类，会自动将错误转换为带有对应状态码的 HTTP 响应。
> - `Response.redirect(url, statusCode)` 创建一个重定向响应。`302` 表示临时重定向，`301` 表示永久重定向。
> - `throw` 关键字用于抛出异常，在这里它会被 Expo Router 捕获并转换为合适的 HTTP 响应。

---

## 运行时 API（Runtime API）

`expo-server` 包提供了一系列服务端辅助函数，安装方式如下：

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

### 错误处理（Error Handling）

如上所述，使用 `StatusError` 可以抛出带有状态码的结构化错误，或抛出 `Response` 对象执行重定向。

### 请求元数据（Request Metadata）

**获取请求原始 URL：**

使用 `origin()` 函数可以获取请求的原始 URL：

```ts
import { origin } from 'expo-server';

export async function GET(request: Request) {
  const target = new URL('/help', origin() ?? request.url);
  return Response.redirect('https://expo.dev', 302);
}
```

> **初学者说明**：`origin()` 返回当前请求的原始来源地址。在某些代理场景下，`request.url` 可能不是真实的请求地址，此时 `origin()` 可以获取正确的来源。

**获取部署环境：**

使用 `environment()` 函数可以获取当前部署环境标识：

```ts
import { environment } from 'expo-server';

export async function GET(request: Request) {
  const env = environment();
  if (env === 'staging') {
    return Response.json({ isStaging: true });
  } else if (!env) {
    return Response.json({ isProduction: true });
  } else {
    return Response.json({ env });
  }
}
```

> **初学者说明**：`environment()` 返回一个字符串标识当前运行环境，例如 `"staging"`（预发布环境）或 `undefined`（生产环境）。你可以根据不同环境返回不同的数据或执行不同的逻辑。

### 任务调度（Task Scheduling）

`expo-server` 提供了两种方式来管理后台任务：

**问题场景：同步执行会阻塞响应**

```ts
export async function GET(request: Request) {
  // 这会延迟响应返回：
  await pingAnalytics(...);

  const data = await fetchExampleData(...);
  return Response.json({ data });
}
```

**解决方案一：`runTask` — 并发执行，不阻塞响应**

```ts
import { runTask } from 'expo-server';

export async function GET(request: Request) {
  // 不会延迟响应：
  runTask(async () => {
    await pingAnalytics(...);
  });

  const data = await fetchExampleData(...);
  return Response.json({ data });
}
```

**解决方案二：`deferTask` — 在响应完全返回后执行**

```ts
import { deferTask } from 'expo-server';

export async function GET(request: Request) {
  // 会在整个函数解析完成后运行：
  deferTask(async () => {
    await pingAnalytics(...);
  });

  const data = await fetchExampleData(...);
  return Response.json({ data });
}
```

> **初学者说明**：
> - `runTask`：立即启动一个后台任务，与主响应**并发执行**。适用于不阻塞响应但也不需要等响应完成的场景（如发送分析事件）。
> - `deferTask`：**延迟到响应完全发送后**才执行。适用于需要确保响应已送达客户端后再执行的场景。
> - 两者的关键区别在于：`runTask` 在主函数执行期间就开始运行；`deferTask` 等到响应完全 resolve 后才开始。

> **基于经验建议**：在需要记录日志、发送分析数据、触发异步通知等"非关键路径"操作时，优先使用 `runTask` 或 `deferTask`，避免拖慢用户请求的响应时间。

### 响应头（Response Headers）

你可以在**服务端中间件**中修改响应头，这会在 API 路由代码执行之前生效：

**设置响应头（覆盖式）：**

```ts
import { setResponseHeaders } from 'expo-server';

export default function middleware(request: Request) {
  // 速率限制器通常会添加 `Retry-After` 头
  setResponseHeaders({ 'Retry-After': '3600' });
}
```

**追加响应头（增量式）：**

```ts
import { setResponseHeaders } from 'expo-server';

export default function middleware(request: Request) {
  // 将 cookie 追加到响应头
  setResponseHeaders(headers => {
    headers.append('Set-Cookie', 'token=123; Secure');
  });
}
```

> **初学者说明**：
> - **中间件（Middleware）** 是在请求到达路由处理函数之前执行的代码。你可以用它来做身份验证、速率限制、日志记录等通用逻辑。
> - `setResponseHeaders` 接受一个对象（直接设置头）或一个函数（通过回调操作 `Headers` 对象）。函数形式更适合需要 `append`（追加）而非覆盖的场景。
> - `Set-Cookie` 头用于向客户端发送 Cookie，`Secure` 标志表示该 Cookie 只通过 HTTPS 传输。

---

## 打包（Bundling）

API 路由文件使用 **Metro**（Expo 的默认打包工具）进行打包。这意味着 API 路由文件具有以下能力：

- 完整的 **TypeScript** 支持
- 可以访问 **Node.js 内置模块**（如 `path`、`fs` 等）
- 可以访问**所有环境变量**（包括 `.env` 文件中的变量）

> **初学者说明**：**Metro** 是 React Native 生态中的 JavaScript 打包器（类似于 Web 开发中的 Webpack）。Expo 使用 Metro 来打包你的应用代码，包括服务端代码。

---

## 安全性（Security）

API 路由处理函数在**沙盒化环境**中执行，与客户端代码完全隔离。

这意味着：
- 路由处理函数中引用的敏感数据（API 密钥、数据库凭证等）**不会被打包到客户端 bundle 中**
- 安全数据剥离发生在 `expo/metro-config` 中
- 你**必须**在 Metro 配置文件中使用 `expo/metro-config`，以确保安全机制生效

> **基于文档内容推导**：Metro 打包器会在构建客户端代码时，自动识别并剔除所有仅被 `+api.ts` 文件引用的代码和依赖。这是一个编译时优化，而不是运行时隔离。因此，如果你在 `+api.ts` 文件中导入了一个模块，而该模块没有被任何客户端文件引用，那么该模块的代码将不会出现在客户端 bundle 中。

> **基于经验建议**：即便如此，建议将敏感配置（如 API 密钥）放在环境变量中，而不是硬编码在代码里。这不仅更安全，还便于在不同环境中切换配置。

---

## 部署（Deployment）

### Web 端部署

使用以下命令生成生产环境的 Web 构建产物：

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

如果你只需要服务端渲染（不生成静态页面），可以添加 `--no-ssg` 标志：

```sh
# npm
npx expo export --platform web --no-ssg

# yarn
yarn expo export --platform web --no-ssg

# pnpm
pnpm expo export --platform web --no-ssg

# bun
bun expo export --platform web --no-ssg
```

### 使用 EAS 部署

```sh
# npm
npx expo export -p web
eas deploy

# yarn
yarn expo export -p web
eas deploy

# pnpm
pnpm expo export -p web
eas deploy

# bun
bun expo export -p web
eas deploy
```

> **初学者说明**：**EAS**（Expo Application Services）是 Expo 提供的云服务，包括构建（EAS Build）、更新（EAS Update）和部署（EAS Deploy）功能。`eas deploy` 命令可以将你的服务端应用部署到 Expo 的基础设施上。

### 原生应用部署（Native Deployment）

对于原生（iOS/Android）应用，你需要将服务端部署到一个安全的服务器，并在 `app.json` 中设置 `origin` 属性，让应用知道 API 请求应该发送到哪里：

```json
{
  "plugins": [
    [
      "expo-router",
      {
        "origin": "https://evanbacon.dev/"
      }
    ]
  ]
}
```

> **初学者说明**：`origin` 是你的服务端 API 的公开地址。原生应用在运行时会使用这个地址来发送 API 请求。如果你使用相对路径（如 `/hello`）来调用 API，原生应用会将其拼接为 `https://evanbacon.dev/hello`。

在 EAS 云构建中，你可以使用以下环境变量自动配置服务端部署：

```sh
EXPO_UNSTABLE_DEPLOY_SERVER=1
```

然后执行构建：

```sh
eas build
```

> **⚠️ 注意**：`EXPO_UNSTABLE_DEPLOY_SERVER` 是一个**实验性（alpha）功能**，其名称中包含 `UNSTABLE`，意味着 API 可能会在未来版本中发生变化。

### 本地测试原生生产应用

要在本地测试原生生产构建：

```sh
# npm
npx expo run:android --variant release
npx expo run:ios --configuration Release

# yarn
yarn expo run:android --variant release
yarn expo run:ios --configuration Release

# pnpm
pnpm expo run:android --variant release
pnpm expo run:ios --configuration Release

# bun
bun expo run:android --variant release
bun expo run:ios --configuration Release
```

本地开发时，可以将 `origin` 设置为本地服务器地址：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "http://localhost:8081"
        }
      ]
    ]
  }
}
```

如果你不想在本地构建时自动部署服务端，可以使用 `EXPO_NO_DEPLOY` 环境变量：

```sh
# npm
EXPO_NO_DEPLOY=1 npx expo run:ios --configuration Release

# yarn
EXPO_NO_DEPLOY=1 yarn expo run:ios --configuration Release

# pnpm
EXPO_NO_DEPLOY=1 pnpm expo run:ios --configuration Release

# bun
EXPO_NO_DEPLOY=1 bun expo run:ios --configuration Release
```

### 完整的构建与本地服务流程

```sh
# npm
npx expo export

# yarn
yarn expo export

# pnpm
pnpm expo export

# bun
bun expo export
```

然后启动本地服务器：

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

---

## 在第三方服务上托管（Hosting on Third-Party Services）

Expo Router 提供了多种适配器（adapter），可以将 API 路由部署到不同的托管平台上。

### Bun

安装 `expo-server`：

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

构建 Web 产物：

```sh
bunx expo export -p web
```

创建 `server.ts` 文件：

```ts
import { createRequestHandler } from 'expo-server/adapter/bun';

const CLIENT_BUILD_DIR = `${process.cwd()}/dist/client`;
const SERVER_BUILD_DIR = `${process.cwd()}/dist/server`;
const handleRequest = createRequestHandler({ build: SERVER_BUILD_DIR });

const port = process.env.PORT || 3000;

Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const url = new URL(req.url);
    console.log('Request URL:', url.pathname);

    const staticPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(CLIENT_BUILD_DIR + staticPath);

    if (await file.exists()) return new Response(await file.arrayBuffer());

    return handleRequest(req);
  },
  websocket,
});

console.log(`Bun server running at http://localhost:${port}`);
```

启动服务器：

```sh
bun run server.ts
```

> **初学者说明**：
> - `createRequestHandler` 是 `expo-server` 提供的适配器函数，它将入站请求转发给 Expo Router 构建的服务端代码。
> - 这段代码首先尝试提供静态文件（HTML、CSS、JS 等），如果找不到对应的静态文件，则将请求交给 Expo Router 的服务端处理。
> - **Bun** 是一个高性能的 JavaScript 运行时（类似 Node.js），具有极快的启动速度和内置的打包器。

### Express

安装依赖：

```sh
# npm
npm install --save-dev express compression morgan

# yarn
yarn add --dev express compression morgan

# pnpm
pnpm add --save-dev express compression morgan

# bun
bun add --dev express compression morgan
```

构建 Web 产物：

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

创建 `server.ts` 文件：

```ts
#!/usr/bin/env node

const path = require('path');
const { createRequestHandler } = require('expo-server/adapter/express');

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

const CLIENT_BUILD_DIR = path.join(process.cwd(), 'dist/client');
const SERVER_BUILD_DIR = path.join(process.cwd(), 'dist/server');

const app = express();

app.use(compression());

// 出于安全考虑，禁用 X-Powered-By 头
// 参考：http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

process.env.NODE_ENV = 'production';

app.use(
  express.static(CLIENT_BUILD_DIR, {
    maxAge: '1h',
    extensions: ['html'],
  })
);

app.use(morgan('tiny'));

app.all(
  '/{*all}',
  createRequestHandler({
    build: SERVER_BUILD_DIR,
  })
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
```

启动服务器：

```sh
node server.ts
```

> **初学者说明**：
> - **Express** 是最流行的 Node.js Web 框架之一。
> - `compression()` 中间件用于压缩 HTTP 响应，减小传输体积。
> - `morgan('tiny')` 是一个 HTTP 请求日志中间件，`'tiny'` 格式会输出精简的请求日志。
> - `/{*all}` 是通配符路由，匹配所有路径，确保未匹配到静态文件的请求都会被转发给 Expo Router 处理。
> - `app.disable('x-powered-by')` 移除响应中的 `X-Powered-By` 头，防止暴露服务器技术栈信息。

### Netlify

创建 Netlify Functions 入口文件 `netlify/functions/server.ts`：

```ts
import path from 'node:path';
import { createRequestHandler } from 'expo-server/adapter/netlify';

export default createRequestHandler({
  build: path.join(__dirname, '../../dist/server'),
});
```

创建 `netlify.toml` 配置文件：

```yaml
[build]
  command = "expo export -p web"
  functions = "netlify/functions"
  publish = "dist/client"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 404

[functions]
  # 包含所有文件以确保动态路由可以正常工作
  included_files = ["dist/server/**/*"]

[[headers]]
  for = "/dist/server/_expo/functions/*"
  [headers.values]
    # 以 60 秒为例
    "Cache-Control" = "public, max-age=60, s-maxage=60"
```

构建 Web 产物：

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

部署到 Netlify：

```sh
# npm
npm install --global netlify-cli
netlify deploy

# yarn
yarn global add netlify-cli
netlify deploy

# pnpm
pnpm add --global netlify-cli
netlify deploy

# bun
bun add --global netlify-cli
netlify deploy
```

> **初学者说明**：
> - **Netlify** 是一个提供自动化部署、CDN 托管和 Serverless Functions 的平台。
> - `netlify.toml` 是 Netlify 的项目配置文件。
> - `[[redirects]]` 规则将所有未匹配到静态文件的请求重定向到 Serverless Function。
> - `status = 404` 表示当 Netlify Function 返回 404 时，使用此重定向规则。
> - `included_files` 确保服务端构建产物被完整包含在 Netlify Function 中。

### Vercel

**方式一：使用 `vercel.json` 配置（推荐）**

创建 API 入口文件 `api/index.ts`：

```ts
const { createRequestHandler } = require('expo-server/adapter/vercel');

module.exports = createRequestHandler({
  build: require('path').join(__dirname, '../dist/server'),
});
```

创建 `vercel.json`：

```json
{
  "buildCommand": "expo export -p web",
  "outputDirectory": "dist/client",
  "functions": {
    "api/index.ts": {
      "runtime": "@vercel/node@5.1.8",
      "includeFiles": "dist/server/**"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

**方式二：使用 legacy builds（旧版构建）**

```json
{
  "version": 2,
  "outputDirectory": "dist",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/client"
      }
    },
    {
      "src": "api/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["dist/server/**"]
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

构建并部署：

```sh
# npm
npm install --global vercel
vercel build
vercel deploy --prebuilt

# yarn
yarn global add vercel
vercel build
vercel deploy --prebuilt

# pnpm
pnpm add --global vercel
vercel build
vercel deploy --prebuilt

# bun
bun add --global vercel
vercel build
vercel deploy --prebuilt
```

> **初学者说明**：
> - **Vercel** 是一个前端部署平台，以其与 Next.js 的深度集成和 Serverless Functions 功能闻名。
> - `vercel.json` 是 Vercel 的项目配置文件，定义了构建命令、输出目录和路由重写规则。
> - `rewrites` 将所有请求（`/(.*)`）转发给 `api/index` 函数处理。
> - `--prebuilt` 标志表示部署已构建好的产物，而不是在 Vercel 端重新构建。

---

## 已知限制（Known Limitations）

### 不支持动态导入（No Dynamic Imports）

当前实现会将所有代码（Node.js 内置模块除外）**打包到单个文件中**。这导致了以下限制：

- 无法使用 `import()` 进行动态导入
- 依赖外部原生二进制文件（native binaries）的第三方库将无法正常工作

> **基于文档内容推导**：这是因为 Metro 将服务端代码打包为单一 bundle 文件，动态导入需要独立的代码块（chunk），而单文件打包策略不支持拆分。对于需要原生二进制文件的库（如 `sharp`、`canvas` 等），它们依赖平台特定的 `.node` 文件，无法被嵌入到 JavaScript bundle 中。

### 不支持 ESM（ESM Not Supported）

由于 Node.js 对原生 ESM 支持的限制造成的限制被传递到了 API 路由中：

- 所有代码会被**转译为 CommonJS** 格式
- 目前不支持原生 ES 模块（`import`/`export` 在运行时层面）

> **基于经验建议**：虽然运行时不支持原生 ESM，但你仍然可以在代码中使用 `import`/`export` 语法编写代码——Metro 会在构建时自动将其转译为 `require`/`module.exports`。建议始终使用现代 ES 模块语法编写源代码，让打包工具处理转译。

> **⚠️ 注意**：以上限制针对的是当前 Beta 版本的实现。随着 Expo Router 服务端的持续开发，这些限制有望在后续版本中得到改善。

---

## 文档导航

- **上一页**：[zoom transition](./75__zoom-transition.md)
- **下一页**：[data loaders](./77__data-loaders.md)
