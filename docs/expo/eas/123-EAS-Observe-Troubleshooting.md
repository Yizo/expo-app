# 123｜排查 EAS Observe

**翻页：**[上一页：EAS Observe Client ID](./122-EAS-Observe-Client-ID.md) · [目录](./README.md) · [下一页：Distribution 总览](./124-Distribution-Overview.md)

**官方页面：**[Troubleshooting EAS Observe](https://docs.expo.dev/eas/observe/reference/troubleshooting/)

**版本边界：**该未版本化 troubleshooting 页含 SDK 55 与 SDK 56+ 两组 API。本地项目 Expo ~56.0.11；SDK v56.0.0 Observe reference 推荐 `expo-observe ~56.0.29`，新项目应使用 `ObserveRoot` / `useObserve()`，不是 SDK55 的 `AppMetrics` 用法。官方页涉及的旧 `expo-eas-observe` / `expo-eas-client` 为 private preview 迁移路径。

## Dashboard 没有任何指标

按这个顺序检查：

1. 安装 `expo-observe` 后新建 App build；已装在用户手机的旧 native binary 不会因为 Metro bundle 更新就突然包含这个原生模块。
2. 确认 Dashboard 打开的是正确 EAS project。
3. 若用 debug build 调试，SDK 56 需要在 `Observe.configure()` 中设置 `dispatchInDebug: true`；release build 默认派发（还受 dispatching / sample settings 影响）。

## TTR / Time to First Render 缺失

SDK 56+ 的 Root Layout 应用 `ObserveRoot.wrap()`：

```tsx
import { ObserveRoot } from 'expo-observe';

function RootLayout() {
  return <AppNavigation />;
}

export default ObserveRoot.wrap(RootLayout);
```

SDK 55 旧例子使用 `AppMetricsRoot.wrap()`；若是 SDK56 项目，不要照旧 import。

## TTI / Time to Interactive 缺失

TTI 需手动测量。SDK56 在启动画面隐藏、屏幕内容和 touch handlers 都准备好后，调用 `useObserve()` 的 `markInteractive()`；确认逻辑分支实际执行，可以暂时加 `console.log` 验证。

## 从 expo-eas-observe Private Preview 迁移

旧 private preview package 用 `expo-eas-observe` 与单独的 `expo-eas-client`；公开包换成 `expo-observe`：

```sh
npx expo install expo-observe
npm uninstall expo-eas-observe
npm uninstall expo-eas-client
```

如果项目未单独装 `expo-eas-client`，不需要卸载不存在的依赖。旧的 default import 需要改成 named import：

```diff
- import AppMetrics from 'expo-eas-observe';
+ import { AppMetrics } from 'expo-observe';
```

对于 SDK 56+，应把手动 `markFirstRender()` 改为自动 root wrapper。SDK 56+ 的根 layout：

```tsx
import { ObserveRoot } from 'expo-observe';

function RootLayout() {
  return <AppNavigation />;
}

export default ObserveRoot.wrap(RootLayout);
```

SDK 55 的历史写法使用 `AppMetricsRoot`：

```tsx
import { AppMetricsRoot } from 'expo-observe';

function RootLayout() {
  return <AppNavigation />;
}

export default AppMetricsRoot.wrap(RootLayout);
```

完成包和组件迁移后要建新原生 build：

```sh
eas build
```

旧 JS 入口里调用 `AppMetrics.markFirstRender()` 的手动埋点应删除，避免与 Root HOC 重复或造成测量偏移。

## 关键名词

- **Native Build：**打包时决定项目含哪些原生模块的 iOS / Android app binary；安装依赖后必须重建才会把新原生库编入。
- **TTR：**root layout 第一次渲染内容的时间，由 `ObserveRoot` 自动测量。
- **TTI：**应用可交互的时间，由 `markInteractive()` 手动标记。
- **expo-eas-observe：**EAS Observe 公开发布前的 private preview 包名；迁移需同时更新 package、import 和 instrumentation。

## 官方代码主题覆盖

源页代码主题全部覆盖：验证 metric build / project / debug dispatch；SDK56+ / SDK55 的 root HOC；手动 TTI 检查；从旧 package 移除与新包安装命令；default import 转 named import；移除 `markFirstRender()` 并用 Root HOC；重建 App 的 `eas build`。

## 下一页

官方页脚 **Next** 离开 EAS Observe，进入 [Distribution: Overview](https://docs.expo.dev/distribution/introduction/)，概览通过 App Store、Google Play、Internal Distribution 等渠道分发 App。

**翻页：**[上一页：EAS Observe Client ID](./122-EAS-Observe-Client-ID.md) · [返回目录](./README.md) · [下一页：Distribution 总览](./124-Distribution-Overview.md)
