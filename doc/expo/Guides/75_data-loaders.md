# Expo Router Data Loaders

## 文档解决的问题

Data Loaders 允许路由组件在服务端预取数据：路由文件导出 `loader`，组件通过 `useLoaderData` 获取其序列化结果。这样可以在不暴露 API 密钥或数据库访问代码的情况下，为页面提供首屏数据。

适合静态博客、营销页、文档站，也适合按请求读取身份信息的个性化服务端页面。

> **文档明确说明：** Data Loaders 是 Alpha 功能，从 SDK 55 起可用，并且必须配合静态渲染或服务端渲染。

## 配置

在 `app.json` 中启用 Loader 和服务端渲染能力：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "unstable_useServerDataLoaders": true,
          "unstable_useServerRendering": true
        }
      ]
    ],
    "web": {
      "output": "server"
    }
  }
}
```

`web.output` 可设为 `"static"` 或 `"server"`。启动命令：

```sh
npx expo start
```

## 基础用法

```tsx
import { useLoaderData } from 'expo-router';
import { Text } from 'react-native';

export async function loader() {
  const response = await fetch('https://api.example.com/data');
  return response.json();
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  return <Text>{JSON.stringify(data)}</Text>;
}
```

`loader` 在服务端执行，其返回值被序列化后传给组件。`useLoaderData<typeof loader>()` 会从 Loader 推导返回类型。

`useLoaderData` 不必写在路由组件本身，可在该路由组件树的任意子组件中调用。

## 加载与错误状态

### Suspense

当调用 `useLoaderData` 时数据仍未就绪，React 会挂起该组件，并向上寻找最近的 `<Suspense>`：

```tsx
<Suspense fallback={<Text>Loading...</Text>}>
  <DataSection />
</Suspense>
```

因此可通过边界位置控制加载占位影响页面的范围。

### Error Boundary

Loader 抛出的错误传播到最近的错误边界。路由文件可导出 Expo Router `ErrorBoundary`：

```tsx
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View>
      <Text>Error: {error.message}</Text>
      <Text onPress={retry}>Try again</Text>
    </View>
  );
}
```

未导出时，错误继续交给最近的父路由错误边界。也可以在组件树内部放置自定义 React Error Boundary。

## 参数与请求对象

动态路由参数作为第二个参数传入：

```tsx
export async function loader(request, params) {
  const response = await fetch(
    `https://api.example.com/posts/${params.postId}`
  );
  return response.json();
}
```

服务端渲染时，第一个参数是当前 HTTP 请求，可读取 Header、Cookie 等信息。静态渲染发生在构建阶段，没有请求，因此 `request` 为 `undefined`。

## 返回值要求

Loader 只能返回可被 `JSON.stringify`/`JSON.parse` 处理的数据，包括对象、数组和基本类型。返回 `undefined` 或 `null` 时统一归一化为 `null`。

不能返回流或异步迭代器。

## 静态渲染与服务端渲染

| 方面 | 静态渲染 | 服务端渲染 |
| --- | --- | --- |
| 执行时机 | `expo export` 构建时 | 每次 HTTP 请求时 |
| `request` | `undefined` | 不可变的请求对象 |
| 数据更新 | 重新构建后更新 | 每次请求可变化 |
| 适合 | 博客、营销页、文档 | 个性化、依赖登录状态的页面 |

静态渲染会把数据嵌入生成的 HTML 和 JSON 文件。服务端渲染生产部署需要 `expo-server`。

## Runtime API 与环境变量

Loader 可使用 `expo-server` Runtime API，例如：

- `StatusError`：抛出 HTTP 错误。
- `setResponseHeaders`：设置缓存等响应头。
- 后台任务相关 helper。

Loader 可访问 `process.env`，其中使用的环境变量不会进入客户端 bundle，适合读取 API Key 等秘密。

## 类型安全 Loader

### `createStaticLoader`

```tsx
import { createStaticLoader } from 'expo-router/server';

export const loader = createStaticLoader(async params => {
  return fetchPost(params.postId);
});
```

回调只接收路由参数，可同时用于静态和服务端渲染。

### `createServerLoader`

```tsx
import { createServerLoader } from 'expo-router/server';

export const loader = createServerLoader(async (request, params) => {
  const token = request.headers.get('Authorization');
  return { token, postId: params.postId };
});
```

它保证存在请求对象，仅适用于服务端渲染；在 SSG 中调用会报错。

### `LoaderFunction`

需要自己控制 `request`、`params` 和返回类型时，可直接使用 `LoaderFunction<T>` 标注函数。

## Bundle、安全与缓存限制

- `loader` 导出会从客户端 bundle 中移除。
- 但如果服务端逻辑位于其他模块，并且该模块也被 `src/app` 外的客户端代码导入，它仍可能进入客户端 bundle。
- Loader 数据在客户端导航期间会被缓存，目前没有内置失效方法。
- 只支持 JSON 可序列化返回值，不支持 stream 或 async iterable。

## React Web 开发者容易误解的地方

- Loader 不是浏览器 `useEffect` 请求，而是在构建服务器或请求服务器执行。
- `web.output: "static"` 下没有当前用户请求，因此不能读取登录 Cookie 或 Header。
- `useLoaderData` 会通过 Suspense 挂起组件，不需要手写 `isLoading` 才能显示 fallback。
- 服务端函数从客户端 bundle 中移除，不代表其导入的任意共享模块都自动安全；共享模块仍需检查客户端引用关系。

## 实际开发建议

> **基于文档内容推导：** 内容是否依赖当前请求，是选择 `createStaticLoader` 与 `createServerLoader` 的首要判断标准。纯参数驱动内容优先使用前者，认证和 Cookie 驱动内容使用后者。

> **基于文档内容推导：** 由于客户端缓存暂时无法主动失效，不应把 Loader 当成频繁写入后立即刷新的一般数据层；更适合首屏或导航级读取。

当前文档未涉及：表单提交/Mutation API、缓存失效方案、流式 Loader、重新验证时间配置、原生端离线缓存策略。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router API Routes](./74_api-routes.md) | [下一页：Expo Router Server Middleware →](./76_middleware.md)
<!-- NAVIGATION END -->
