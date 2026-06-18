# 数据加载器（Data Loaders）

> **原文地址**：https://docs.expo.dev/router/web/data-loaders/

---

## 概述

数据加载器（Data Loaders）是 Expo Router 提供的一种**实验性**服务端数据获取机制。它允许你在路由文件中定义一个异步的 `loader` 函数，该函数在服务端执行数据获取逻辑，然后将结果序列化后传递给前端组件。

**核心优势**：私密的凭证（如 API 密钥、数据库连接信息）始终保留在服务端，不会暴露给浏览器，同时前端 UI 可以通过专用 Hook 获取所需数据。

> **关键术语解释（面向初学者）**：
> - **Loader（加载器）**：一个在服务端运行的异步函数，负责从 API、数据库或其他后端来源获取数据。
> - **useLoaderData**：一个 React Hook，用于在前端组件中消费 loader 函数返回的数据。
> - **SSR（Server-Side Rendering，服务端渲染）**：页面内容在服务端生成，而非在浏览器中动态渲染。
> - **SSG（Static Site Generation，静态站点生成）**：页面在构建时（build time）预先生成为静态 HTML 文件。
> - **Suspense**：React 提供的组件，用于在异步数据加载期间显示备用 UI（如加载指示器）。
> - **ErrorBoundary（错误边界）**：一种 React 组件，用于捕获子组件树中的 JavaScript 错误，并显示备用 UI 而非让整个应用崩溃。

### 当前状态

此功能目前处于 **`alpha`（内测）阶段**，需要满足以下条件：

- **Expo SDK 55 或更高版本**
- 启用了预生成（static）或服务端渲染（server）模式

> **基于经验建议**：由于该功能仍处于 alpha 阶段，API 可能会在后续版本中发生变化。在生产环境中使用前，请务必关注官方文档的更新，并做好充分的测试。

---

## 配置

### 第一步：启用实验性功能

在应用配置文件（`app.json` 或 `app.config.js`）中，向 `expo-router` 插件添加实验性标志：

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
    ]
  }
}
```

> **关键术语解释**：
> - **`unstable_useServerDataLoaders`**：启用服务端数据加载器功能。前缀 `unstable_` 表示该功能尚不稳定，API 可能会变化。
> - **`unstable_useServerRendering`**：启用服务端渲染功能。

### 第二步：配置 Web 输出模式

设置 `web.output` 属性，选择渲染策略：

```json
{
  "expo": {
    "web": {
      "output": "server"
    }
  }
}
```

> **关键术语解释**：
> - **`web.output`**：控制 Web 端的输出模式。可选值包括 `"server"`（实时服务端渲染）和 `"static"`（预生成静态文件）。

两种模式对比：

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `"server"` | 每次请求时实时渲染 | 需要用户个性化内容的场景 |
| `"static"` | 构建时预生成 | 内容相对固定的场景 |

### 第三步：启动开发环境

使用你偏好的包管理器启动本地开发服务器：

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

---

## 基础用法

### 定义 Loader 并使用数据

在路由文件中导出一个异步的 `loader` 函数来获取后端数据。在 UI 组件中，调用 `useLoaderData` Hook 来消费该数据。

**工作流程**：
1. `loader` 函数在服务端执行数据获取逻辑
2. 返回的结果被序列化（转换为 JSON 格式）
3. 序列化后的数据被转发到前端
4. 前端组件通过 `useLoaderData` Hook 获取数据

```tsx
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';

export async function loader() {
  // 从 API、数据库或任何服务端来源获取数据
  const response = await fetch('https://api.example.com/data');
  return response.json();
}

export default function Home() {
  const data = useLoaderData<typeof loader>();

  return (
    <View>
      <Text>Data: {JSON.stringify(data)}</Text>
    </View>
  );
}
```

> **关键术语解释**：
> - **`typeof loader`**：TypeScript 的类型推断语法。将 `loader` 函数的返回类型传递给 `useLoaderData`，这样 `data` 变量就会自动获得正确的类型提示，无需手动定义接口。

> **基于经验建议**：同一路由树中的子组件也可以使用 `useLoaderData` 来获取父路由 loader 的数据，无需通过 props 层层传递。这对于深层嵌套的组件结构非常实用。

---

### 使用 Suspense 处理加载状态

当组件调用 `useLoaderData` 而数据尚未就绪时，React 会暂停（suspend）该组件的渲染。这个暂停会沿着组件树向上传播，直到遇到一个 `<Suspense>` 边界，此时会显示其 `fallback` 内容。

你可以策略性地放置 `<Suspense>` 边界来控制加载指示器的显示位置：

```tsx
import { Suspense } from 'react';
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';

export async function loader() {
  const response = await fetch('https://api.example.com/data');
  return response.json();
}

export default function Home() {
  return (
    <View>
      <Text>Welcome</Text>
      <Suspense fallback={<Text>Loading...</Text>}>
        <DataSection />
      </Suspense>
    </View>
  );
}

function DataSection() {
  const data = useLoaderData<typeof loader>();
  return <Text>{data.title}</Text>;
}
```

> **基于文档内容推导**：在上述示例中，`"Welcome"` 文本会立即渲染，而 `<DataSection />` 组件在数据加载期间会显示 `"Loading..."`。这种模式允许页面的不同部分独立加载，提升了用户体验——用户不会看到整个页面的空白等待。

> **基于经验建议**：建议将 `<Suspense>` 边界放在真正需要等待数据的最小范围内，而非包裹整个页面。这样可以实现渐进式加载（progressive loading），让用户更早看到部分内容。

---

### 处理错误（ErrorBoundary）

如果 loader 函数执行失败，异常会冒泡到最近的错误边界。你可以在同一文件中定义 `ErrorBoundary` 组件来显示错误信息并提供重试机制。如果当前文件没有定义 `ErrorBoundary`，异常会继续向父路由冒泡。

```tsx
import { Text, View } from 'react-native';
import { useLoaderData, type ErrorBoundaryProps } from 'expo-router';

export async function loader() {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View>
      <Text>Error: {error.message}</Text>
      <Text onPress={retry}>Try again</Text>
    </View>
  );
}

export default function DataPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <View>
      <Text>{data.title}</Text>
    </View>
  );
}
```

> **关键术语解释**：
> - **`ErrorBoundaryProps`**：从 `expo-router` 导入的类型，包含 `error`（捕获到的错误对象）和 `retry`（重试函数，调用后会重新执行 loader）。
> - **错误冒泡**：如果当前路由没有 `ErrorBoundary`，错误会向上传递到父路由的错误边界，直到被捕获或到达应用根部。

> **基于经验建议**：始终在包含 loader 的路由文件中定义 `ErrorBoundary`。网络请求天然不可靠，缺少错误处理会导致用户看到不友好的空白页面或崩溃。提供重试按钮是一种简单有效的用户体验改善。

---

## 路由参数（Route Parameters）

对于动态路由（如 `[postId].tsx`），URL 中的参数会作为 loader 函数的**第二个参数**传入：

```tsx
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';

export async function loader(request, params) {
  const response = await fetch(`https://api.example.com/posts/${params.postId}`);
  return response.json();
}

export default function Post() {
  const data = useLoaderData<typeof loader>();

  return (
    <View>
      <Text>{data.title}</Text>
      <Text>{data.content}</Text>
    </View>
  );
}
```

> **关键术语解释**：
> - **动态路由**：文件名使用方括号表示的路由，如 `[postId].tsx`。方括号中的部分会成为 URL 参数，通过 `params` 对象传入。
> - **`params`**：包含 URL 中所有动态参数的对象。例如 `/posts/123` 对应的 `params` 为 `{ postId: "123" }`。

> **基于文档内容推导**：`loader` 函数的第一个参数是 `request`（HTTP 请求对象），第二个参数是 `params`（路由参数）。即使你不需要 `request`，也需要保留第一个参数位置，才能正确接收 `params`。

---

## HTTP 请求信息（Request）

在使用实时渲染模式（`output: "server"`）时，loader 函数的第一个参数提供了传入的 HTTP 请求上下文，你可以访问请求头（headers）、Cookie 等信息。

> **警告**：在静态构建（预生成模式）中，`request` 参数**不存在**（为 `undefined`），因为构建时没有真实的 HTTP 请求发生。使用时应做好可选链（optional chaining）处理。

```tsx
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';

export async function loader(request) {
  // 访问授权令牌
  const authToken = request?.headers.get('Authorization');

  if (!authToken) {
    return { user: null };
  }

  // 使用令牌获取用户数据
  const response = await fetch('https://api.example.com/user', {
    headers: { Authorization: authToken },
  });

  return { user: await response.json() };
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user.name}</Text>
    </View>
  );
}
```

> **基于经验建议**：注意代码中使用了 `request?.headers`（可选链操作符）而非 `request.headers`。这是一种防御性编程实践，确保代码在静态构建模式下不会因为 `request` 为 `undefined` 而崩溃。如果你明确只在服务端渲染模式下运行，可以省略可选链。

---

## 数据格式要求

loader 函数的返回值必须是**标准的 JSON 兼容数据结构**。这意味着：

- 支持：字符串、数字、布尔值、数组、普通对象、`null`
- 不支持：函数、类实例、`Date` 对象、`Map`、`Set`、`Stream` 等
- 任何 `null` 或 `undefined` 的返回值会自动转换为 `null`

```tsx
export async function loader() {
  const response = await fetch('https://api.example.com/data');
  return response.json();
}
```

> **基于经验建议**：如果你需要返回 `Date` 类型的数据，建议在 loader 中将其转换为 ISO 字符串（`date.toISOString()`），在前端组件中再解析回 `Date` 对象。这是处理日期序列化的常见模式。

---

## 服务端工具函数

loader 函数可以使用 `expo-server` 包提供的服务端工具函数来：

- **修改响应头**（如设置缓存策略）
- **抛出 HTTP 异常**（如 401 未授权、404 未找到）
- **执行后台操作**

```tsx
import { setResponseHeaders, StatusError } from 'expo-server';

export async function loader(request) {
  const authToken = request?.headers.get('Authorization');

  if (!authToken) {
    throw new StatusError(401, 'Unauthorized');
  }

  setResponseHeaders({ 'Cache-Control': 'private, max-age=60' });

  return { user: 'authenticated' };
}
```

> **关键术语解释**：
> - **`setResponseHeaders`**：设置 HTTP 响应头的工具函数。例如 `Cache-Control` 可以控制浏览器和 CDN 如何缓存响应。
> - **`StatusError`**：用于抛出带有 HTTP 状态码的错误。`new StatusError(401, 'Unauthorized')` 会抛出一个 401 未授权错误。
> - **`Cache-Control: private, max-age=60`**：表示响应是私有的（不应被共享缓存存储），且浏览器可以缓存 60 秒。

---

## 安全配置（环境变量）

loader 函数可以直接读取系统环境变量。这些敏感信息（如 API 密钥、数据库密码）**严格限制在服务端**，绝不会泄露到浏览器打包文件中。

```tsx
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';

export async function loader() {
  const apiKey = process.env.API_SECRET_KEY;

  const response = await fetch('https://api.example.com/data', {
    headers: { 'X-API-Key': apiKey },
  });

  return response.json();
}

export default function ApiData() {
  const data = useLoaderData<typeof loader>();

  return (
    <View>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}
```

> **警告**：虽然 loader 函数本身不会泄露到浏览器，但如果你在 `app` 目录之外不小心共享了包含服务端逻辑的导入，这些服务端代码仍有可能泄露到客户端打包文件中。请保持服务端逻辑仅在路由文件的 loader 中使用，或放在专用的服务端模块中。

> **基于经验建议**：建议在 `.env` 文件中管理环境变量，并将 `.env` 添加到 `.gitignore` 中，避免敏感信息被提交到版本控制系统。在部署时通过平台的环境变量配置功能注入这些值。

---

## 渲染模式差异

loader 函数的行为会因你选择的输出模式而显著不同：

| 特性 | 预生成模式（Static） | 实时模式（Server） |
|------|---------------------|-------------------|
| **执行时机** | 构建时（编译期间） | 每次请求时 |
| **HTTP 上下文** | 不可用（`request` 为 `undefined`） | 完整的只读请求对象 |
| **适用场景** | 文章、营销页面、文档站点 | 用户个性化仪表盘、实时数据 |
| **数据时效性** | 构建时固定，需重新构建才能更新 | 每次请求实时获取 |
| **部署依赖** | 仅需静态文件服务器 | 需要服务端运行时 |

### 预生成模式（Static）

使用静态生成时，loader 在执行 `export` 命令期间运行。获取的数据直接嵌入到生成的文件中，这意味着：

- 数据在下次构建之前保持不变
- 没有 HTTP 请求上下文（无法读取 headers、cookies 等）
- 适合内容更新频率低的页面

### 实时模式（Server）

使用实时渲染时，loader 在每次用户请求时运行。这意味着：

- 提供完整的 HTTP 请求上下文
- 数据始终最新
- 生产部署需要 `expo-server` 包

> **基于文档内容推导**：选择哪种模式取决于你的数据特征。如果数据是公开的、变化不频繁的（如博客文章、产品说明），预生成模式更合适——它更快且部署更简单。如果数据是用户特定的、实时变化的（如用户个人资料、实时通知），则应选择实时模式。

---

## 类型安全的辅助工具

`expo-router/server` 包提供了类型安全的辅助工具函数，根据你的渲染策略强制更严格的类型约束。

### 静态辅助工具：`createStaticLoader`

当你**只需要路由参数**而不需要 HTTP 请求上下文时，使用 `createStaticLoader`。它在两种渲染模式下都能安全运行：

```tsx
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';
import { createStaticLoader } from 'expo-router/server';

export const loader = createStaticLoader(async params => {
  const response = await fetch(`https://api.example.com/posts/${params.postId}`);
  return response.json();
});

export default function Post() {
  const data = useLoaderData<typeof loader>();

  return (
    <View>
      <Text>{data.title}</Text>
    </View>
  );
}
```

> **关键术语解释**：
> - **`createStaticLoader`**：创建一个类型安全的静态加载器。它的回调函数只接收 `params` 参数（没有 `request`），从类型层面确保你不会意外使用 HTTP 请求上下文。

### 实时辅助工具：`createServerLoader`

当你**需要 HTTP 请求上下文**时，使用 `createServerLoader`。如果在静态生成期间意外使用，它会抛出错误：

```tsx
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';
import { createServerLoader } from 'expo-router/server';

export const loader = createServerLoader(async (request, params) => {
  const authToken = request.headers.get('Authorization');

  if (!authToken) {
    return { user: null };
  }

  const response = await fetch('https://api.example.com/user', {
    headers: { Authorization: authToken },
  });

  return { user: await response.json() };
});

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user.name}</Text>
    </View>
  );
}
```

> **警告**：`createServerLoader` 在静态生成模式下会导致构建失败。确保只在 `output: "server"` 的项目中使用。

> **基于经验建议**：优先使用 `createStaticLoader` 或 `createServerLoader` 而非直接导出 `async function loader()`。这些辅助工具在编译期就能捕获模式不匹配的问题，避免运行时才暴露错误。

### 直接类型标注：`LoaderFunction`

如果你需要最大的签名灵活性，可以直接使用 `LoaderFunction` 类型：

```tsx
import { Text, View } from 'react-native';
import { useLoaderData } from 'expo-router';
import { type LoaderFunction } from 'expo-router/server';

type PostData = {
  title: string;
  content: string;
};

export const loader: LoaderFunction<PostData> = async (request, params) => {
  const response = await fetch(`https://api.example.com/posts/${params.postId}`);
  return response.json();
};

export default function Post() {
  const data = useLoaderData<typeof loader>();

  return (
    <View>
      <Text>{data.title}</Text>
      <Text>{data.content}</Text>
    </View>
  );
}
```

> **关键术语解释**：
> - **`LoaderFunction<PostData>`**：泛型类型，`PostData` 指定了 loader 的返回数据类型。这样 TypeScript 可以在编译时检查返回值的类型是否正确。

### 三种类型工具对比

| 工具 | 参数 | 静态模式 | 实时模式 | 适用场景 |
|------|------|---------|---------|----------|
| `createStaticLoader` | `(params)` | 安全 | 安全 | 仅需路由参数 |
| `createServerLoader` | `(request, params)` | 构建失败 | 安全 | 需要 HTTP 上下文 |
| `LoaderFunction` 类型 | `(request, params)` | 需手动处理 | 安全 | 需要最大灵活性 |

---

## 当前限制

以下是目前已知的限制，在使用时需要注意：

1. **数据格式限制**：返回值必须是严格兼容 JSON 的数据结构。**不支持流式传输（Streams）**。
2. **缓存限制**：浏览器在页面导航期间会缓存 loader 数据，目前**尚不支持手动清除缓存**。

> **基于文档内容推导**：由于缓存无法手动失效，当底层数据发生变化时，用户可能需要通过页面刷新（而非 SPA 导航）才能获取最新数据。在 alpha 阶段，这可能需要在前端通过轮询或其他机制来补充。后续版本预计会提供缓存失效的 API。

---

## 常见问题

### 实时渲染是使用数据加载器的必要条件吗？

**不是**。预生成的静态模式同样完全受支持。你可以在静态模式下使用 loader 来获取构建时数据。

### loader 中的服务端代码会泄露到浏览器打包文件中吗？

`loader` 导出会被从浏览器打包文件中**完全剥离**。但需要注意的是，如果在 `app` 目录之外不小心共享了包含服务端逻辑的导入，这些服务端代码仍有可能泄露。

> **基于经验建议**：为了确保服务端代码不会泄露，建议将敏感的服务端逻辑（如数据库查询、密钥使用）直接放在路由文件的 loader 函数中，或封装到专用的服务端模块中，避免在客户端组件中导入这些模块。

---

## 文档导航

- **上一页**：[api routes](./76__api-routes.md)
- **下一页**：[middleware](./78__middleware.md)
