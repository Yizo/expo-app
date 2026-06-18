# 屏幕追踪（用于分析统计）

> **原始文档地址**：https://docs.expo.dev/router/reference/screen-tracking/
>
> **最后修改日期**：2026-05-15

---

## 概述

本文档介绍如何在 Expo Router 中启用分析统计（Analytics）的屏幕追踪功能。

由于 Expo Router 始终保持对 URL 的访问能力，因此屏幕追踪的方式与 Web 端的追踪方式非常相似——这与 React Navigation 的传统做法有明显不同。

> **关键术语解释（面向初学者）**：
>
> - **屏幕追踪（Screen Tracking）**：在用户导航到不同页面时，将当前页面信息发送给分析服务（如 Google Analytics、Segment、Mixpanel 等），用于统计用户行为。
> - **Analytics（分析统计）**：通过收集用户行为数据（如访问了哪些页面、停留时间等），帮助开发者了解用户使用习惯的工具或服务。
> - **HOC（Higher-Order Component / 高阶组件）**：一个接收组件并返回新组件的函数，用于复用组件逻辑。在本文语境中，指创建一个"包装"组件来监听路由变化。
> - **URL（统一资源定位符）**：在 Expo Router 中，每个屏幕都对应一个 URL 路径，例如 `/home`、`/profile/123`。
> - **pathname（路径名）**：URL 中不包含查询参数的部分，例如 `/profile/123`。
> - **params（参数）**：URL 中的动态参数，例如 `id=123`。

---

## 实现步骤

实现屏幕追踪只需完成以下两个步骤：

1. **创建一个高阶组件（HOC）** 来监听当前活跃的 URL。
2. **将该 URL 记录到你选择的分析服务中。**

---

## 代码示例

在根布局文件 `_layout.tsx` 中实现屏幕追踪：

**文件路径**：`src/app/_layout.tsx`

```tsx
import { useEffect } from 'react';
import { usePathname, useGlobalSearchParams, Slot } from 'expo-router';

export default function Layout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  // 在你的分析服务提供商中追踪位置信息
  useEffect(() => {
    analytics.track({ pathname, params });
  }, [pathname, params]);

  // 以最简单的方式渲染所有子路由
  return <Slot />;
}
```

> **代码要点解析**：
>
> - **`usePathname()`**：Expo Router 提供的 Hook，返回当前路由的路径名（如 `/home`）。每当用户导航到新页面时，该值会更新。
> - **`useGlobalSearchParams()`**：Expo Router 提供的 Hook，返回当前路由的全局搜索参数（如 `{ id: '123' }`）。
> - **`useEffect()`**：React 的副作用 Hook。当 `pathname` 或 `params` 发生变化时，`useEffect` 会重新执行，从而触发分析追踪。
> - **`<Slot />`**：Expo Router 的组件，用于渲染所有子路由。它相当于一个"占位符"，将匹配到的子页面渲染在此处。
> - **`analytics.track()`**：此处是伪代码，你需要替换为你实际使用的分析服务的 API 调用。例如 Segment 的 `analytics.track()`、Google Analytics 的 `gtag()` 等。

---

## 工作原理

完成上述设置后，每当用户导航到不同的路由时，分析服务都会收到通知。这是因为：

- `usePathname()` 和 `useGlobalSearchParams()` 会在路由变化时返回新值。
- `useEffect` 的依赖数组 `[pathname, params]` 确保在值变化时重新执行追踪逻辑。

> **基于文档内容推导**：由于 Expo Router 基于文件系统路由，每个文件对应一个 URL，因此 `usePathname()` 能可靠地反映当前屏幕状态，无需手动维护屏幕名称映射表。

---

## 从 React Navigation 迁移的注意事项

> **警告**：
>
> React Navigation 官方的屏幕追踪文档依赖于不同的导航状态假设，因此它使用了 `onReady` 和 `onStateChange` 回调函数。

**在 Expo Router 中，你应该避免使用这些回调。** 原因如下：

- Expo Router 中的顶层 `<NavigationContainer />` 并不直接暴露给开发者。
- Expo Router 允许级联（cascading）导航容器，这意味着可能有多个嵌套的导航上下文。

> **基于经验建议**：
>
> - 如果你正在将现有的 React Navigation 项目迁移到 Expo Router，请务必移除 `onReady` 和 `onStateChange` 回调中的追踪代码，改用上述基于 `usePathname()` + `useEffect` 的方式。
> - 不要尝试通过 `useNavigationContainerRef()` 来获取导航容器的引用来做屏幕追踪——这在 Expo Router 中不可靠，且可能导致追踪数据不完整。
> - React Navigation 官方屏幕追踪指南地址：https://reactnavigation.org/docs/screen-tracking/ ，其中的方法**不适用于** Expo Router 项目。

---

## 实践建议

> **基于经验建议**：
>
> 1. **替换 `analytics` 对象**：示例中的 `analytics` 是一个占位符。你需要将其替换为你实际使用的分析 SDK 实例。常见的选择包括：
>    - [Segment](https://segment.com/)：`analytics.screen(pathname, params)`
>    - [Google Analytics (GA4)](https://analytics.google.com/)：通过 `gtag` 或 `firebase/analytics` 发送 `screen_view` 事件
>    - [Mixpanel](https://mixpanel.com/)：`mixpanel.track('Screen View', { pathname, params })`
>    - [Amplitude](https://amplitude.com/)：`amplitude.track('Screen View', { pathname, params })`
>
> 2. **避免重复追踪**：确保追踪逻辑只在根布局（`_layout.tsx`）中实现一次。如果在嵌套布局中重复添加，可能会导致同一页面被多次记录。
>
> 3. **考虑添加屏幕名称映射**：原始 pathname（如 `/user/[id]`）可能对分析报表不够友好。你可以维护一个映射表将路径转换为可读名称：
>    ```tsx
>    const screenNames: Record<string, string> = {
>      '/': '首页',
>      '/profile': '个人资料',
>      '/settings': '设置',
>    };
>    ```
>
> 4. **处理 params 中的敏感信息**：在将 `params` 发送到分析服务前，检查是否包含用户 ID、令牌等敏感数据，必要时进行脱敏处理。

---

## 局限性

> **基于文档内容推导**：
>
> - 此方案依赖于 Expo Router 的 URL 状态管理。如果页面使用了模态（Modal）或覆盖层（Overlay）而非路由跳转，则可能不会被 `usePathname()` 捕获到变化。
> - 对于使用 `<Stack>` 导航器中的模态屏幕（`presentation: 'modal'`），URL 会改变，因此可以被追踪。但对于通过状态控制的弹出层（如 `Modal` 组件），则需要手动补充追踪逻辑。

---

## 相关参考

- **React Navigation 屏幕追踪文档**（注意：其中的方法不适用于 Expo Router）：https://reactnavigation.org/docs/screen-tracking/
- **Expo Router URL 参数**：https://docs.expo.dev/router/reference/url-parameters/
- **Expo Router 类型化路由**：https://docs.expo.dev/router/reference/typed-routes/

---

## 文档导航

- **上一页**：[typed routes](./89__typed-routes.md)
- **下一页**：[src directory](./91__src-directory.md)
