# 117｜Expo Router EAS Observe Integration

**翻页：**[上一页：配置 EAS Observe](./116-EAS-Observe-Configuration.md) · [目录](./README.md) · [下一页：React Navigation EAS Observe Integration](./118-EAS-Observe-React-Navigation.md)

**官方页面：**[Expo Router integration](https://docs.expo.dev/eas/observe/integrations/expo-router/)

**版本边界：**Expo Router navigation metrics 要求 SDK 56+，本地 Expo ~56.0.11 符合版本门槛；SDK v56.0.0 `expo-observe` 参考推荐 ~56.0.29，并支持 `Observe.configure({ integrations: ... })` 与 screen-scoped `useObserve()`。`filteredParams` 要求 SDK 57+，本地 SDK 56 不可用。

## 导航 Metrics 与前提

该 integration 为 Expo Router 的每条 route 记录 render / interactive timing，route 用**路径模式**标记，例如 `/(tabs)/sessions/[sessionId]`。这比只看全 App 启动平均值更容易定位哪一屏较慢。

需要 SDK 56+、已接入 EAS Observe，并且 `expo-router` 在运行时可用。没有安装 expo-router 时，整合不会发出导航指标，但 app-wide Observe 指标仍可用。

## 在 Root Layout 启用 Integration

在 `app/_layout.tsx` 的模块 scope、任何 screen mount 之前启用：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  integrations: { 'expo-router': true },
});
```

Integration 必须在 mount 前启用，不能运行时开关；screen 已经挂载后再调用 `Observe.configure()` 切换它会报错。应把该配置和 sample / environment / dispatch 等选项合并到一个 `Observe.configure()` 调用里。

## 在 Screen 内标记 Interactive

在 screen 组件内使用 `useObserve()`；integration 会把 `markInteractive()` 关联到当前 route pattern：

```tsx
import { useObserve } from 'expo-observe';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  return null; // 换成实际的 screen UI。
}
```

使用 Router integration 时，调用应留在 route screen 自身而不是更高层 wrapper；这样 metrics 会带当前 route 信息。若 integration 未启用或 expo-router 没有安装，hook 退回全局 `Observe.markInteractive` 行为。

## SDK 57+ 才能过滤敏感 URL 参数

默认事件含解析后的 URL 与序列化后的 route / query params。如果 URL 参数里存在敏感值，可将其 key 配到 `filteredParams`；事件会删除对应参数、省略 resolved `url` 并添加 `urlHidden: true`。此能力要 SDK 57+；以下仅供升级后的配置参考，不能当成本地 SDK 56 代码：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  integrations: {
    'expo-router': {
      filteredParams: ['userId', 'token'],
    },
  },
});
```

`routeName` 仍保留 route pattern，因为它不是参数值，也能让相同页面的不同 session key 聚合到一起。SDK 56 项目需要避免把敏感内容放在 route / query params 中。

## 三种 Navigation Metrics

| metric | 何时记录 | 常见含义 |
| --- | --- | --- |
| `cold_ttr` | 导航 action 发起，到目的 screen 首次获得焦点 | 从未渲染过的页面初次打开耗时；App 初次 route 以 JS bundle 加载为起点，并带 `isAppLaunch: true`。每个 screen instance / session 最多一次。 |
| `warm_ttr` | 目标 screen 之前渲染过，本次再次 focus | 从其他 screen 返回、或 Link prefetch 过的页面再次呈现；缓存 / 已挂载的页面通常会走该指标。 |
| `tti` | 导航 action 发起，到目标 screen 调用 `markInteractive()` | 进入新 route 到该页数据 / 初始化完成并可操作的耗时；每次导航只记录首个 marker。 |

Events 会含 route pattern、resolved URL、route params、是否为 app launch 等上下文；SDK 57+ 过滤敏感参数后用 `urlHidden` 表示 URL 已隐藏。

`router.prefetch()` 本身不是用户导航，不会产生 TTR；用户之后真正打开已预取 screen 时，它会视为 warm render。非聚焦 screen 中调用 `markInteractive()` 会等到该 screen focus 后才产出 TTI；若 screen 已卸载或 hook 在 screen 外部调用，会出现没有 route metadata 的 warning。

## 查看 Route Metrics

Dashboard 的 Observe > Navigation 页展示 cold / warm TTR 与 TTI。CLI 可按 route 查询：

```sh
# 按 route 聚合导航指标
eas observe:routes

# 查指定 route 的首次渲染指标
eas observe:routes --metric cold_ttr --route-name "/(tabs)/sessions/[sessionId]"

# 查看完整筛选参数
eas observe:routes --help
```

版本提醒：本页的 Expo Router integration 示例使用 `--metric cold_ttr`；EAS Observe CLI reference 的 route metric 名称表列出 `nav_cold_ttr`、`nav_warm_ttr` 与 `nav_tti`。两个官方页面当前示例命名不一致，运行时应以已安装 EAS CLI 的 `eas observe:routes --help` 为准；本文分别保留来源用法，不把差异当成 SDK API 变化。

## 关键名词

- **Route pattern：**Expo Router 路由模板，如 `/sessions/[sessionId]`，不同 ID 的页面记录会放在同一路由下。
- **Resolved URL / route params：**用户实际打开的路径和值；通常用于帮助定位一次具体访问。
- **Cold render / warm render：**首次展示与已渲染页面再次展示的区分，不等同于应用 cold / warm launch。
- **`prefetch`：**在用户点击前预加载目标页面；它不是实际导航事件，但会让用户之后首次点击时页面已预渲染。
- **Integration：**Observe 对导航库的适配层，自动订阅路线切换并写 route-level metrics。

## 官方代码主题覆盖

源页代码主题全部覆盖：SDK 56+ Expo Router prereqs；模块 scope 的 `Observe.configure({ integrations: { 'expo-router': true } })`；Screen 内 `useObserve().markInteractive()`；SDK57 `filteredParams` 配置及不适用 v56 的版本说明；`eas observe:routes`、按 `cold_ttr` / route name 过滤与 `--help` CLI 示例。冷 / 热首帧和 TTI event fields、prefetch 与路由 pattern 行为均有解释。

## 下一页

官方页脚 **Next** 是 [React Navigation integration](https://docs.expo.dev/eas/observe/integrations/react-navigation/)，说明在不使用 Expo Router、直接使用 React Navigation 的 App 中测量逐屏性能。

**翻页：**[上一页：配置 EAS Observe](./116-EAS-Observe-Configuration.md) · [返回目录](./README.md) · [下一页：React Navigation EAS Observe Integration](./118-EAS-Observe-React-Navigation.md)
