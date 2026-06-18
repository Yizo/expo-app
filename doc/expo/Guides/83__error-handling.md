# 错误处理与加载状态

> **原文地址**：<https://docs.expo.dev/router/error-handling/>
>
> **最后修改日期**：2026 年 6 月 11 日

---

## 概述

本文档介绍在 Expo Router 应用中如何管理**缺失路径**（unmatched routes）、**异常处理**（error handling）以及**加载指示器**（loading indicators）。

---

## 一、未匹配路由（Unmatched Routes）

### 1.1 背景说明

由于原生应用没有传统意义上的服务器，真正的 **404 错误**在原生应用中并不存在。但通用路由器（universal router）仍然需要一种策略来处理缺失的路径。

> **关键术语解释（面向初学者）**：
>
> - **404 错误**：HTTP 协议中的标准状态码，表示"未找到资源"。在 Web 开发中，当用户访问一个不存在的页面时，服务器通常返回 404 状态码。
> - **Unmatched Route（未匹配路由）**：当用户导航到一个应用中不存在的路径时，路由器无法找到对应的页面组件，这条路径就被称为"未匹配路由"。

### 1.2 框架默认行为

Expo Router 框架默认会自动处理未匹配路由。但开发者也可以自行提供自定义实现。

**使用框架内置的 Unmatched 组件：**

```tsx
import { Unmatched } from 'expo-router';
export default Unmatched;
```

上述代码会渲染框架默认的 `"Unmatched"` 视图。

**自定义未匹配页面：**

开发者可以导出任意偏好的组件来替代默认视图。**基于经验建议**：自定义的未匹配页面最好包含一个返回主页的链接，以帮助用户回到主屏幕，避免用户迷失在应用中。

```tsx
// 示例：自定义未匹配页面
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function CustomNotFound() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>页面未找到</Text>
      <Link href="/">
        <Text style={{ color: 'blue', marginTop: 16 }}>返回首页</Text>
      </Link>
    </View>
  );
}
```

### 1.3 Web 端资源优先级

在 Web 环境中，资源按照以下特定顺序进行匹配和交付：

1. **`public` 文件夹中的静态资源**（如图片、字体等）
2. **`app` 文件夹中的标准路径和动态路径**（普通页面和带参数的页面）
3. **`app` 文件夹中的 API 端点**（以 `+api` 结尾的文件）
4. **未匹配路径**（返回 404 状态码）

> **基于文档内容推导**：这意味着如果你有同名的静态资源和路由，静态资源会优先被匹配。在设计项目结构时需要注意这一点，避免命名冲突。

---

## 二、错误处理（Error Handling）

### 2.1 背景说明

Expo Router 提供了细粒度的异常管理机制，旨在为未来更具针对性的数据获取策略（opinionated data-fetching strategies）铺路。

> **关键术语解释（面向初学者）**：
>
> - **Error Boundary（错误边界）**：React 提供的一种机制，用于捕获子组件树中发生的 JavaScript 错误，防止整个应用崩溃。它可以"捕获"错误并展示降级 UI，而不是让整个页面白屏。
> - **opinionated data-fetching**：一种有明确规范和约束的数据获取模式，框架会对数据获取的方式做出更多规定，而非完全自由发挥。

### 2.2 导出 ErrorBoundary 组件

开发者可以从任何路由文件中导出一个 `"ErrorBoundary"` 组件，来捕获并美化组件级别的错误。该组件使用 React 原生的错误边界机制。

`ErrorBoundary` 组件接收两个属性（props）：

- **`error`**：捕获到的错误对象，包含错误信息（如 `error.message`）
- **`retry`**：一个恢复函数，调用后可以重新尝试渲染组件

**完整代码示例：**

```tsx
import { View, Text } from 'react-native';
import { type ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>{error.message}</Text>
      <Text onPress={retry}>Try Again?</Text>
    </View>
  );
}

export default function Page() {
  // 页面正常内容
}
```

> **关键术语解释（面向初学者）**：
>
> - **`ErrorBoundaryProps`**：Expo Router 提供的 TypeScript 类型，定义了错误边界组件接收的属性结构，包含 `error`（错误对象）和 `retry`（重试函数）。

### 2.3 工作原理

导出 `ErrorBoundary` 组件后，实际上等同于将该路由页面包裹在一个类似 try-catch 的 React 错误边界中：

```tsx
function Route({ ErrorBoundary, Component }) {
  return (
    <Try catch={ErrorBoundary}>
      <Component />
    </Try>
  );
}
```

> **基于文档内容推导**：这里的 `<Try>` 并非真实的 React 组件，而是文档用来**概念性说明**错误边界的工作方式——类似于传统编程中的 `try-catch` 语句。当 `<Component />` 渲染时抛出错误，`ErrorBoundary` 会捕获错误并展示降级 UI。

### 2.4 错误冒泡机制

如果当前路由没有导出 `ErrorBoundary` 组件，错误会**向上冒泡**（bubble up），传递到最近的父级错误边界进行处理。

> **基于经验建议**：建议在根布局（root layout）中始终设置一个全局的 `ErrorBoundary`，作为最后的兜底防线。这样即使子路由忘记设置错误边界，用户也不会看到白屏崩溃。

```tsx
// app/_layout.tsx - 根布局中的全局错误边界示例
import { View, Text, Pressable } from 'react-native';
import { type ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        出了点问题
      </Text>
      <Text style={{ color: 'gray', marginBottom: 20 }}>{error.message}</Text>
      <Pressable onPress={retry} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white' }}>重试</Text>
      </Pressable>
    </View>
  );
}
```

### 2.5 当前开发中的已知问题

> **注意**：React Native 的 **LogBox**（调试工具面板）目前触发条件过于敏感——对于普通的警告（warnings）和标准错误（console.error）都会弹出。理想的行为应该是：**仅在出现未捕获的异常时才显示 LogBox**。这是框架团队正在改进的方向。

> **关键术语解释（面向初学者）**：
>
> - **LogBox**：React Native 内置的调试面板，会在应用运行时显示错误和警告信息。在开发阶段很有用，但如果过于频繁弹出，会影响开发体验。

---

## 三、使用 Suspense 回退实现加载状态（Loading States）

### 3.1 版本要求

> **注意**：自定义 Suspense 回退组件需要 **SDK 56 或更高版本**。

### 3.2 基本用法

Expo Router 框架会自动将每个路由包裹在 React 的 **Suspense 边界**内。开发者可以从**布局文件**（layout file）中导出一个 `"SuspenseFallback"` 组件，来定义子路由处于加载挂起状态时展示的加载界面。

> **关键术语解释（面向初学者）**：
>
> - **Suspense（悬挂/暂停）**：React 提供的一种机制，允许组件在等待某些异步操作（如数据加载、代码拆分加载）完成时"暂停"渲染，并展示一个回退 UI（fallback）。
> - **SuspenseFallback**：当子组件处于"暂停"状态时，展示的回退/加载界面。
> - **Layout（布局）**：Expo Router 中的布局文件（如 `_layout.tsx`），用于定义一组路由的共享结构和导航方式。

**完整代码示例：**

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

> **关键术语解释（面向初学者）**：
>
> - **`ActivityIndicator`**：React Native 内置的加载指示器组件，显示一个旋转的圆圈，表示正在进行加载操作。
> - **`Stack`**：Expo Router 提供的堆栈导航器，用于管理页面间的堆栈式导航（前进/后退）。

### 3.3 多层布局的回退优先级

> **注意**：如果多个父级布局都定义了自己的 Suspense 回退组件，**最近的父级布局**（最近的祖先）的版本会被使用。

> **基于文档内容推导**：这与 CSS 的就近原则类似——在嵌套布局中，React 会使用组件树中距离最近的 Suspense 回退组件。这意味着你可以在不同层级定义不同的加载体验：根布局展示全局加载动画，而子布局展示更具体的加载状态。

### 3.4 访问路由参数

`SuspenseFallback` 组件接收 `route` 和 `params` 两个属性（通过 `SuspenseFallbackProps` 类型），允许为动态路由渲染具有上下文感知能力的加载界面。

**完整代码示例：**

```tsx
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack, type SuspenseFallbackProps } from 'expo-router';

export function SuspenseFallback({ params }: SuspenseFallbackProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading profile {params.id}...</Text>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function AppLayout() {
  return <Stack />;
}
```

> **关键术语解释（面向初学者）**：
>
> - **`SuspenseFallbackProps`**：Expo Router 提供的 TypeScript 类型，定义了 Suspense 回退组件接收的属性结构，包含 `route`（当前路由信息）和 `params`（路由的动态参数）。
> - **`params.id`**：动态路由中的路径参数。例如，路由 `/profile/[id]` 中，`id` 就是动态参数，访问 `/profile/123` 时 `params.id` 的值为 `"123"`。

> **基于经验建议**：利用路由参数在加载界面中展示具体的上下文信息（如"正在加载用户 xxx 的资料..."），可以显著提升用户体验，让用户知道应用正在加载正确的内容，而不是一个泛泛的加载动画。

### 3.5 已知限制

- **异步路由**（async routes，即导出了异步函数的路由文件）**不支持自定义 Suspense 回退组件**。

> **基于文档内容推导**：异步路由自身已经通过 `async/await` 机制处理了加载状态，框架在等待异步路由解析时会使用自身的加载逻辑，因此无法再叠加自定义的 Suspense 回退界面。如果你需要异步路由的加载状态，应在路由组件内部自行处理。

---

## 四、最佳实践总结

| 场景 | 建议 |
|---|---|
| 未匹配路由 | 提供自定义 404 页面，包含返回主页的链接 |
| 错误边界 | 在根布局设置全局 `ErrorBoundary` 作为兜底 |
| 加载状态 | 在布局中导出 `SuspenseFallback`，展示有意义的加载信息 |
| 动态路由加载 | 利用 `params` 属性在加载界面中显示具体参数信息 |
| 异步路由加载 | 在路由组件内部自行管理加载状态 |

---

## 文档导航

- **上一页**：[async routes](./82__async-routes.md)
- **下一页**：[url parameters](./84__url-parameters.md)
