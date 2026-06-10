# Expo Router 错误处理与加载状态

## 文档解决的问题

这篇文档讲的是：在 Expo Router 中如何处理未匹配路由、组件级错误以及 Suspense 加载状态。它解决的是“访问不存在页面怎么办”“某个路由组件抛错怎么办”“子路由挂起时显示什么加载 UI”这些问题。

## 适用场景

- 你需要定义 404 或未匹配页面的展示方式。
- 你希望给某个页面或某个布局下的页面提供独立错误边界。
- 你使用 Suspense 或会出现路由挂起，希望提供统一 loading fallback。

## 先建立正确心智模型

- 在 Web 上，未匹配路由可以对应 404。
- 在原生 App 上没有传统服务器，因此严格来说没有 HTTP 404，但 Expo Router 仍然提供统一的“未匹配路由页面”概念。
- `ErrorBoundary` 是 React Error Boundary 机制在 Expo Router 路由文件里的落地方式。
- `SuspenseFallback` 是布局级的路由加载占位 UI，不是任意组件都自动拥有的 loading 方案。

## 核心概念

### 1. `+not-found.tsx`

这个文件用于定义未匹配路由时展示的界面。

文档最小示例：

```tsx
import { Unmatched } from 'expo-router';
export default Unmatched;
```

你也可以导出自己的组件。文档建议提供一个回到 `/` 的链接。

### 2. 路由优先级

文档明确说明 Web 上的优先级顺序：

1. `public` 目录静态文件
2. `app` 目录普通路由与动态路由
3. `app` 目录 API Routes
4. 最后才是 not-found 路由，并返回 404 状态码

### 3. `ErrorBoundary`

任意路由文件都可以导出 `ErrorBoundary`，用于拦截并格式化该路由组件级错误。

它会收到：

- `error`
- `retry`

如果当前路由没有自己的 `ErrorBoundary`，错误会继续冒泡到最近的父级 `ErrorBoundary`。

### 4. `SuspenseFallback`

布局文件可以导出 `SuspenseFallback`，当任意子路由进入 Suspense 挂起状态时，显示自定义加载 UI。

文档明确说明：

- 该能力在 SDK 56+ 可用。
- 如果多个父布局都定义了 fallback，最近的父级优先。
- `SuspenseFallback` 会收到 `route` 与 `params`。

## 关键流程

### 未匹配路由

1. 创建 `src/app/+not-found.tsx`
2. 导出默认 `Unmatched` 或自定义组件
3. 用户访问不存在的路由时自动展示

### 组件级错误处理

1. 在某个路由文件中导出 `ErrorBoundary`
2. 在边界组件中读取 `error.message`
3. 用 `retry` 让用户重试

示意代码：

```tsx
import { View, Text } from 'react-native';
import { type ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: 'red' }}>
      <Text>{error.message}</Text>
      <Text onPress={retry}>Try Again?</Text>
    </View>
  );
}
```

### 加载状态

1. 在布局文件中导出 `SuspenseFallback`
2. 返回你希望显示的 loading UI
3. 子路由挂起时由 Expo Router 自动使用它

示意代码：

```tsx
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';

export function SuspenseFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function RootLayout() {
  return <Stack />;
}
```

## 命令、配置、文件说明

### 文件

- `src/app/+not-found.tsx`
  未匹配路由页面。
- 路由文件，例如 `src/app/home.tsx`
  可以导出 `ErrorBoundary`。
- 布局文件，例如 `src/app/_layout.tsx`
  可以导出 `SuspenseFallback`。

### 参数与 API

- `ErrorBoundaryProps`
  提供 `error` 与 `retry`。
- `SuspenseFallbackProps`
  提供 `route` 与 `params`。

当前文档未涉及额外命令配置。

## 注意事项、限制条件和坑点

- 原生端没有真正的 HTTP 404，但仍应处理未匹配路由。
- `ErrorBoundary` 只处理组件级错误，不等于所有运行时问题都会自动按你想的方式落到这里。
- 文档提到 React Native LogBox 目前仍然较激进，对 `console.error` 和 `console.warn` 都会展示，说明错误开发体验仍在改进中。
- 当前文档明确说明：Async Routes 不支持自定义 `SuspenseFallback`。
- 如果多个父布局都定义 fallback，最近父级优先。

## React Web 开发者容易误解的地方

- 不要把 `+not-found.tsx` 只理解成 Web 404 页面。
  Expo Router 试图在原生和 Web 上统一“未匹配路由”的体验。
- 不要把 `ErrorBoundary` 理解成全局异常处理器。
  它是按路由树层级工作的。
- 不要把 `SuspenseFallback` 当成页面里任意 loading state 的替代品。
  它只处理 Suspense 挂起场景。

## 实际开发建议

- 基于经验建议：未匹配页应提供回首页或回上一级入口，避免用户被困住。
- 基于经验建议：路由级 `ErrorBoundary` 最适合兜住页面渲染错误，并提供重试按钮。
- 基于文档内容推导：如果你用 Async Routes，就不要依赖自定义 `SuspenseFallback`，应准备其他加载体验方案。
- 基于文档内容推导：动态路由的 fallback 可以利用 `params` 提示当前正在加载哪个资源，提升感知质量。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- 未匹配路由可用 `+not-found.tsx` 自定义。
- Web 上 not-found 路由最终返回 404 状态码。
- 路由可导出 `ErrorBoundary` 捕获组件级错误。
- 布局可导出 `SuspenseFallback`。
- 多个 fallback 时最近父级优先。
- Async Routes 不支持自定义 `SuspenseFallback`。

### 基于文档内容推导

- Expo Router 把“未匹配、错误、加载”分别放在不同层级处理，实际开发时不要混成一个机制。
- 原生与 Web 的错误展示虽然共享路由抽象，但底层语义并不完全相同。
