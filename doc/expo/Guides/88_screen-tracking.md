# Expo Router 屏幕埋点追踪

## 文档解决的问题

这篇文档讲的是：如何在 Expo Router 中做 screen tracking，也就是在路由变化时把当前页面路径和参数上报给分析平台。它解决的是“进入哪个页面了”“URL 和参数是什么”“如何像 Web 一样追踪页面访问”这些问题。

## 适用场景

- 你要接入分析平台做页面浏览埋点。
- 你希望在路由变化时统一发送屏幕访问事件。
- 你想把 Web 上熟悉的 URL 追踪方式迁移到 Expo Router。

## 核心概念

### 1. Expo Router 始终有 URL

文档明确指出：与 React Navigation 不同，Expo Router 始终可以访问 URL，因此 screen tracking 会像 Web 一样简单。

### 2. 用布局层观察路由变化

文档推荐在根布局中观察当前 pathname 与全局 search params。

### 3. 上报的是“路径 + 参数”

这意味着你不仅能知道用户在哪个页面，还能知道该页面附带了哪些 URL 参数。

## 关键流程

文档给出的流程非常直接：

1. 创建一个观察当前 URL 的高阶组件或布局层逻辑。
2. 在你的 analytics provider 中追踪该 URL。

示例代码：

```tsx
import { useEffect } from 'react';
import { usePathname, useGlobalSearchParams, Slot } from 'expo-router';

export default function Layout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    analytics.track({ pathname, params });
  }, [pathname, params]);

  return <Slot />;
}
```

文档说明：当用户切换路由时，analytics provider 就会收到通知。

## 命令、配置、文件说明

### 文件

- `src/app/_layout.tsx`
  文档示例把追踪逻辑放在根布局中。

### 常用 API

- `usePathname()`
  读取当前路径。
- `useGlobalSearchParams()`
  读取全局查询参数。
- `Slot`
  继续渲染子路由。

当前文档未涉及 CLI 命令、SDK 配置或具体分析平台接入细节。

## 注意事项、限制条件和坑点

- 当前文档只展示了最基础的 URL 级埋点，没有展开去重、节流、首屏补报等高级策略。
- 示例依赖 `useEffect` 监听 `[pathname, params]`，意味着参数变化也可能触发上报。
- 当前文档未涉及如何把文件系统路由名映射成业务埋点名。

## React Web 开发者容易误解的地方

- 不要以为移动端一定只能按 screen name 埋点。
  Expo Router 由于始终有 URL，可以直接沿用 URL 视角。
- 不要把 `useGlobalSearchParams()` 和页面本地参数混用。
  埋点层更适合全局视角，本页示例也是这么做的。
- 不要忽略布局层的价值。
  在根布局观测 URL，往往比在每个页面手工埋点更稳定。

## 实际开发建议

- 基于经验建议：优先在根布局统一做页面访问埋点，减少页面级重复代码。
- 基于经验建议：正式接分析平台时，建议在 `analytics.track` 外再封装一层，统一处理脱敏、去重与环境开关。
- 基于文档内容推导：如果 query 参数变化很多，应提前定义哪些参数值得上报，避免埋点维度爆炸。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo Router 始终有 URL，因此 screen tracking 像 Web 一样简单。
- 推荐观察 `pathname` 与全局参数。
- 示例将逻辑放在 `src/app/_layout.tsx`。

### 基于文档内容推导

- Expo Router 的 URL 一致性让 Web 与原生端的页面追踪模型更容易统一。
- 把埋点放在布局层，比散落在多个页面组件里更容易维护。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router Typed Routes](./87_typed-routes.md) | [下一页：Expo Router 顶层 `src` 目录 →](./89_src-directory.md)
<!-- NAVIGATION END -->
