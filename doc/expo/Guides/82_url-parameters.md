# Expo Router URL 参数

## 文档解决的问题

这篇文档讲的是：如何在 Expo Router 中读取和修改 URL 参数，包括路径参数与查询参数。它解决的是“怎么从路由中拿到动态段”“怎么读写 query string”“在嵌套路由里该用本地参数还是全局参数”这些问题。

## 适用场景

- 你使用动态路由，例如 `/profile/[user]`。
- 你需要通过 query 参数传递筛选条件、搜索词、附加状态。
- 你在栈导航或嵌套导航里，需要分辨当前屏幕参数和全局 URL 参数。

## 先建立正确心智模型

- Expo Router 里的 URL 参数分两类：
  路径参数 `route parameters` 和 查询参数 `search parameters`。
- 路径参数来自文件系统路由。
- 查询参数来自 URL 的 `?key=value`。
- React Web 开发者最容易忽略的一点是：在原生 App 的导航栈里，多个页面可能同时挂载在内存里，因此 Expo Router 区分 local 与 global 参数读取。

## 核心概念

### 1. Route parameters

例如路由文件是 `/profile/[user]`，那么 `user` 就是路径参数，用于匹配路由。

### 2. Search parameters

例如 `/profile?extra=info`，`extra` 就是查询参数，常用于页面间传递可序列化数据。

### 3. Local vs Global URL parameters

文档明确说明，因为嵌套导航里可能有多个页面同时存在，所以提供了两套 hook：

- `useLocalSearchParams`
  读取“当前路由匹配到的本地参数”
- `useGlobalSearchParams`
  读取“当前全局 URL”

开发影响：

- 当前屏幕只关心自己这条路由时，优先本地参数。
- 顶层分析、埋点、全局观察 URL 时，更适合全局参数。

### 4. catch-all 参数返回数组

如果使用 `[...everything]` 这类 rest 语法，读出来的是字符串数组，而不是单个字符串。

## 关键流程

### 读取本地参数

```tsx
const { user, query } = useLocalSearchParams<{ user: string; query?: string }>();
```

文档示例说明：

- `/evanbacon` 得到 `{ user: "evanbacon" }`
- `/evanbacon?query=hello` 得到 `{ user: "evanbacon", query: "hello" }`

### 读取 catch-all 参数

```tsx
const { everything } = useLocalSearchParams<{
  everything: string[];
}>();
```

如果 URL 是 `/evanbacon/123`，则得到：

```ts
{ everything: ["evanbacon", "123"] }
```

### 修改查询参数

文档展示了通过 `router.setParams` 更新 query 的方式：

```tsx
router.setParams({ query: search });
```

### 修改路径参数

文档也展示了修改路径参数：

```tsx
router.setParams({ user: 'evan' });
```

这会让当前基于参数的路由状态发生变化。

## 命令、配置、文件说明

### 常用 API

- `useLocalSearchParams`
  读取当前路由局部参数。
- `useGlobalSearchParams`
  读取全局 URL 参数。
- `router.setParams`
  更新当前路由参数。

### 文件

- `src/app/[user].tsx`
  动态单段参数示例。
- `src/app/[...everything].tsx`
  catch-all 参数示例。

当前文档未涉及额外 CLI 命令或 app config 配置。

## 注意事项、限制条件和坑点

- 路径参数和查询参数不是一回事。
- catch-all 参数是数组，不是字符串。
- 在嵌套导航里，多个页面可能同时挂载，不能想当然地把“当前 URL”与“当前组件参数”视为完全等价。
- 当前文档未涉及复杂对象参数的序列化规范。

## React Web 开发者容易误解的地方

- 不要把 `useLocalSearchParams` 只理解成浏览器里单一页面的 `location` 解析。
  在 Expo Router 中，它带有“当前路由实例”的语义。
- 不要默认修改参数只会影响地址栏。
  在文件系统路由模型里，路径参数本身就是路由匹配条件。
- 不要忘记 catch-all 参数是数组。
  Web 开发者常把路径剩余段拼成字符串，但这里文档明确给的是数组。

## 实际开发建议

- 基于经验建议：页面内部业务读取参数时优先 `useLocalSearchParams`，避免被全局 URL 变化误伤。
- 基于经验建议：埋点、调试、全局 URL 观察适合 `useGlobalSearchParams`。
- 基于文档内容推导：搜索页、筛选页等高频更新 query 的场景，`router.setParams` 会比手动拼 URL 更自然。
- 基于文档内容推导：如果你的动态路由有多级剩余段，最好在类型上明确声明为 `string[]`，避免把数组当字符串用。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- URL 参数分为 route parameters 与 search parameters。
- Expo Router 提供 `useLocalSearchParams` 与 `useGlobalSearchParams`。
- `router.setParams` 可更新参数。
- catch-all 参数返回字符串数组。

### 基于文档内容推导

- 选择 local 还是 global 参数读取方式，实质上是在选择“当前路由视角”还是“全局 URL 视角”。
- 对原生导航场景友好的参数模型，是 Expo Router 与纯浏览器单页面心智的关键区别之一。
