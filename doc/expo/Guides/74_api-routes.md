# Expo Router API Routes

## 文档解决的问题

API Routes 允许直接在 Expo Router 的 `src/app` 中编写服务器端 HTTP 端点，用于保存密钥、交换认证凭证、访问数据库或执行不能放进客户端 bundle 的业务逻辑。它可以服务 Web，也可以作为原生应用的远端后端。

生产环境必须部署自定义服务器；仅打包客户端应用并不会让 API Route 自动存在于用户设备上。

## API Route 是什么

在 `app` 路由目录中创建以 `+api.ts` 结尾的文件。例如：

```text
src/app/hello+api.ts  ->  /hello
```

文件按 HTTP 方法导出处理函数：

```ts
export function GET(request: Request) {
  return Response.json({ hello: 'world' });
}
```

支持 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD` 和 `OPTIONS`。没有导出的请求方法会自动返回 `405 Method Not Allowed`；处理函数抛出未处理错误时自动返回 `500 Internal Server Error`。

API Routes 应运行在 WinterCG 兼容环境中，并使用标准 Web `Request`/`Response` API。

## 创建与本地调用

先把 Web 输出设为服务器模式：

```json
{
  "expo": {
    "web": {
      "output": "server"
    }
  }
}
```

启动开发服务器：

```sh
npx expo
```

测试端点：

```sh
curl http://localhost:8081/hello
```

客户端可使用相对地址：

```tsx
const response = await fetch('/hello');
const data = await response.json();
```

开发环境下，相对请求自动指向 Expo 开发服务器。生产环境可在 `app.json` 的 `expo-router` 插件中设置服务器 `origin`：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://example.com/"
        }
      ]
    ]
  }
}
```

> **文档明确说明：** API Route 文件不能使用平台后缀，例如 `hello+api.web.ts` 不会工作。

## 读取请求与返回响应

### Body

```ts
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json(body);
}
```

### 查询参数

```ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const post = url.searchParams.get('post');
  return Response.json({ post });
}
```

### 自定义错误响应

```ts
return new Response('No post found', {
  status: 404,
  headers: { 'Content-Type': 'text/plain' },
});
```

## `expo-server` Runtime API

SDK 54 及以上可安装 `expo-server`：

```sh
npx expo install expo-server
```

该库不仅能用于 API Routes，也能用于其他 Expo 服务端代码。

### 提前终止并返回错误

`StatusError` 适合在深层 helper 中直接中断请求：

```ts
import { StatusError } from 'expo-server';

if (!post) {
  throw new StatusError(404, 'No post found');
}
```

它会生成带 `error` 字段的 JSON 响应。若需要完全控制响应，例如重定向，可以直接 `throw Response.redirect(...)`。

### 请求元数据

- `origin()`：取得用户实际访问 API 时的来源 URL，代理部署时可能不同于服务器内部 URL。
- `environment()`：取得运行环境名称；返回值取决于实际运行平台。

这些 helper 只能在服务端且当前请求仍在处理时调用。

### 后台任务

- `runTask(fn)`：与请求逻辑并发执行，不阻塞响应，同时通知 serverless runtime 不要过早终止任务。
- `deferTask(fn)`：等 API Route 完成并解析出 `Response` 后再运行。

直接 `await` 会延迟响应；完全不 `await` 又无法保证 serverless 实例保持存活，这两个 helper 用于明确表达任务时机。

### 预设响应头

`setResponseHeaders()` 可以在中间件或 helper 中修改未来生成的 Response，例如设置 `Retry-After` 或追加 `Set-Cookie`。

## Bundle 与安全边界

API Routes 由 Expo CLI 和 Metro 打包，支持 TypeScript、`tsconfig` 路径别名、Node.js 标准库、环境变量、`babel.config.js` 和 `metro.config.js`。

服务端路由可以访问所有环境变量，不限于 `EXPO_PUBLIC_` 前缀。

安全规则非常关键：

- 客户端代码只要导入了含密钥的模块，密钥就会进入客户端 bundle。
- `src/app` 中不是 `+api.ts` 的普通文件也不自动安全，因为它们可能进入客户端。
- 放在 `+api.ts` 中的密钥，以及仅被该 handler 导入的代码，不会进入客户端 bundle。
- 密钥剥离由 `expo/metro-config` 完成，因此 `metro.config.js` 必须使用它。

## 导出与部署

生成 Web 客户端和服务器 bundle：

```sh
npx expo export --platform web
```

输出位于 `dist`，可用以下命令本地测试：

```sh
npx expo serve
```

如果只想导出 API/服务器代码，不生成网站静态页面：

```sh
npx expo export --platform web --no-ssg
```

可部署到 EAS Hosting，也可通过 `expo-server` adapter 部署到 Bun、Express、Netlify 或 Vercel。第三方 adapter 属于非官方或实验支持，可能发生破坏性变更，Expo 也没有持续测试所有 adapter。

`expo-server` 不会自动从 `.env` 文件注入生产环境变量，必须由托管平台或开发者加载；部署后的服务器也不包含 Metro。

## 原生应用连接生产服务器

原生环境中的 `fetch('/endpoint')` 需要一个远端 `origin`。开发时 Expo 自动指向开发服务器；生产时必须部署到安全主机，并在 Router 插件配置中设置 `origin`。

自动部署属于 Alpha：

1. 不要手动设置 `origin`，也不要使用动态 `app.config.js`/`app.config.ts`。
2. 先完成一次 EAS Hosting 部署。
3. 在 `.env` 设置 `EXPO_UNSTABLE_DEPLOY_SERVER=1`。
4. 运行 `eas build` 或 release 模式的 `expo run:*`。

注意事项：

- 配置错误可能在 EAS Build 的 `Bundle JavaScript` 阶段失败。
- `EXPO_NO_DEPLOY=1` 可强制跳过自动部署。
- 自动部署日志写入 `.expo/logs/deploy.log`。
- `EXPO_OFFLINE` 模式不会执行部署。
- 本地测试生产原生包时可暂时把 `origin` 指向 `http://localhost:8081`，发布前必须删除该值并进行干净构建。

## 已知限制

- API Routes 当前打成单文件，不能使用无法被打包的外部依赖，例如带多平台原生二进制的 `sharp`。
- 当前输出会转译为 CommonJS，不支持真正的 ESM 运行；文档仍建议以 ESM `import/export` 风格编写源代码。

## React Web 开发者容易误解的地方

- 这不是浏览器中的 React Router loader，也不是随原生 App 安装到设备里的本地 API；它是真正需要托管的服务器代码。
- 相对 `fetch('/hello')` 在原生环境没有天然的网页 origin，必须由 Expo Router 配置远端服务器地址。
- 同在 `src/app` 不代表共享同一个安全边界，只有 `+api.ts` 及其服务端专用依赖不会进入客户端。
- 标准 `Request`/`Response` 很像 Edge Runtime，但具体托管平台仍需要 Expo adapter。

## 实际开发建议

> **基于文档内容推导：** 将数据库、密钥和认证交换代码放在明确的服务端专用模块中，并确保这些模块只由 `+api.ts` 导入；不要依赖“文件看起来像后端代码”来判断是否安全。

> **基于文档内容推导：** 在选择第三方托管前，先用 `expo export` 和 `expo serve` 验证 bundle，再确认目标 adapter、环境变量注入和静态文件目录是否匹配。

当前文档未涉及：数据库连接池的具体方案、认证框架选择、限流实现、各托管平台的生产 SLA。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router iOS 缩放转场](./73_zoom-transition.md) | [下一页：Expo Router Data Loaders →](./75_data-loaders.md)
<!-- NAVIGATION END -->
