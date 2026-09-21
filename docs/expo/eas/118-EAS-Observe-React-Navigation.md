# 118｜React Navigation EAS Observe Integration

**翻页：**[上一页：Expo Router EAS Observe Integration](./117-EAS-Observe-Expo-Router.md) · [目录](./README.md) · [下一页：Expo Image 性能 Integration](./119-EAS-Observe-Expo-Image.md)

**官方页面：**[React Navigation integration](https://docs.expo.dev/eas/observe/integrations/react-navigation/)

**版本边界：**该 integration 要求 Expo SDK 56+、已配置 EAS Observe，并要求运行时依赖 `@react-navigation/native` 7.0.0+。本地 SDK ~56.0.11 达到 Expo 版本门槛；请核对项目实际 React Navigation 主版本。`filteredParams` 是 SDK 57+ 功能，不可作为 SDK 56 示例。

## 什么时候用这条 Integration

如果 App 用 React Navigation 本身，不是 Expo Router，EAS Observe 可以按 screen 的 route-name path 收集渲染与交互耗时。若项目用 Expo Router，应使用上一页的 Expo Router integration；两者不会重复开启。

前提是 EAS Observe 已安装并构建；`@react-navigation/native` 必须在运行时存在。未安装该依赖时，可见全局启动 metrics 仍然可能正常，但逐屏 navigation events 不发出。

## 在任何 Screen Mount 前启用

在模块 scope 调用一次 `Observe.configure()`：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  integrations: { 'react-navigation': true },
});
```

必须在首个 screen mount 之前启用。mount 后再调用 configure 或运行时切换开关会抛错。把 integration、环境、采样和其他选项合并进同一配置对象。

## 动态 React Navigation 配置

若 app 用动态配置，顶层 `<NavigationContainer>` 改为 `<ObserveNavigationContainer>`。它接受和转发原 NavigationContainer 相同的 props 与 ref，并监听 route changes：

```tsx
import { ObserveNavigationContainer } from 'expo-observe/integrations/react-navigation';

export default function App() {
  return (
    <ObserveNavigationContainer>
      {/* 挂载项目现有的 Stack / Tab navigators */}
    </ObserveNavigationContainer>
  );
}
```

## Static React Navigation 配置

静态导航使用 `createStaticNavigation()` 自动创建容器，不直接渲染 `<NavigationContainer>`。此时手动创建 ref，将同一个 ref 传给生成的 `<Navigation>` 和 Observe provider：

```tsx
import { createStaticNavigation, useNavigationContainerRef } from '@react-navigation/native';
import { ObserveNavigationProvider } from 'expo-observe/integrations/react-navigation';
import { RootStack } from './navigation';

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  const navigationRef = useNavigationContainerRef();

  return (
    <ObserveNavigationProvider navigationRef={navigationRef}>
      <Navigation ref={navigationRef} />
    </ObserveNavigationProvider>
  );
}
```

`ObserveNavigationProvider` 自身不生成 navigator；它监听传入的 navigationRef。必须是所有 screens 的祖先，这样 screen 内 `useObserve()` 才能取得导航上下文。Provider 和 Navigation 要共享同一个有效 ref。

## 在 Screen 里记录 TTI

在 screen component 内取 `markInteractive()`，这样 event 自动按 screen path 标记：

```tsx
import { useObserve } from 'expo-observe';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  return null; // 换成当前 screen 的实际内容。
}
```

Screen 不在 focus 时调用只更新状态，不会立即产生 TTI；focus 后才记录。每次 navigation 只记录第一次 `markInteractive()`。即使没开启 integration，hook 仍能回退为全 App 全局 `Observe.markInteractive`。

## Navigation Metrics

| metric | 计时起点 / 终点 | 注意事项 |
| --- | --- | --- |
| `cold_ttr` | navigation action 发出到目标 screen 首次 focus | 进程启动后的首个 focus 从 JS bundle ready 起算，并带 `isAppLaunch: true`；每个 screen instance / session 最多一次。 |
| `warm_ttr` | 与 cold 相同，但 screen 曾经 render 后再次 focus | 预加载、返回页面、已 mount tab 等情况；React Navigation v7 默认 lazy，未 mount 的 tab 首次打开仍为 cold。 |
| `tti` | navigation action 发出到 screen 调用 `markInteractive()` | 第一个 marker 生效，可安全多次调用。 |

Event 会含 route-name path、focused route params、首屏 launch 标记、以及可选自定义 params。`routeName` 用结构路径分桶，如 `/Tabs/Sessions`；route 参数默认仍会随事件传输。

## SDK 57+ 的敏感参数过滤

如果参数含 `userId`、`token` 等敏感值，SDK 57+ 可在 integration config 里用 `filteredParams` 指明要过滤的 keys。匹配项会从 `routeParams` 移除，并添加 `urlHidden: true`；`routeName` 仍保留，因为它只由 route names 构成，不含参数值。

```ts
Observe.configure({
  integrations: {
    'react-navigation': {
      filteredParams: ['userId', 'token'],
    },
  },
});
```

SDK 56 不支持该过滤选项；SDK 56 项目应避免将敏感值放进 route params。

## 查看 Navigation 指标

在 Dashboard 打开 Observe > Navigation。CLI 示例：

```sh
# 按 route 汇总
eas observe:routes

# 过滤指定指标 / 路由
eas observe:routes --metric cold_ttr --route-name /Tabs/Sessions

# 查询当前 CLI 版本的全部 flags
eas observe:routes --help
```

EAS Observe CLI reference 的 route metric 表使用 `nav_cold_ttr`、`nav_warm_ttr`、`nav_tti`，此 integration 页面示例使用 `cold_ttr`。两处官方页面示例暂不一致；以本地安装 CLI 的 `eas observe:routes --help` 为准，具体命名还会由 CLI 版本决定。

## 故障排查

- Integration 没数据时，先检查 `@react-navigation/native` 7+ 是否在 runtime 真正安装、配置是否在 module scope 且早于 screen mount。
- 没有依赖时，`useObserve()` 可回退全局行为，但不会发 per-screen events；`ObserveNavigationContainer` / `ObserveNavigationProvider` 缺少依赖则会抛错。
- Static mode 中 Provider 与 Navigation 必须共享同一个 ref；ref 没连到 navigation container 就不会产生路线指标。
- `markInteractive()` 应放在屏幕组件内部 effect。若看到 screen unmounted / missing metadata warning，通常是 hook 在页面外调用或页面已经卸载。

## 关键名词

- **Dynamic configuration：**应用显式渲染 `NavigationContainer` 的 React Navigation 组织方式。
- **Static configuration：**通过 `createStaticNavigation()` 生成导航树的组织方式。
- **Navigation ref：**指向实际 navigation container 的引用；静态模式下 Observe provider 靠它监听切屏。
- **Per-screen metric：**按每个 screen route 分组的 cold / warm first render 与 TTI。
- **Lazy tab：**默认未访问的 Tab 可能尚未 mount，因此首次打开算冷渲染。

## 官方代码主题覆盖

源页代码主题全部覆盖：模块 scope `Observe.configure`；动态模式 `ObserveNavigationContainer`；静态模式 `createStaticNavigation`、`useNavigationContainerRef` 与共享 ref 的 ObserveNavigationProvider；screen 内的 `useObserve().markInteractive()`；SDK57 `filteredParams` 示例与 SDK56 版本限制；`eas observe:routes` 及按指标 / route name 过滤命令。三种 navigation metrics、Dashboard 使用与缺失依赖行为均已整理。

## 下一页

官方页脚 **Next** 是 [Expo Image integration](https://docs.expo.dev/eas/observe/integrations/expo-image/)，介绍定位 production 中加载像素远超屏幕所需尺寸的大图。

**翻页：**[上一页：Expo Router EAS Observe Integration](./117-EAS-Observe-Expo-Router.md) · [返回目录](./README.md) · [下一页：Expo Image 性能 Integration](./119-EAS-Observe-Expo-Image.md)
