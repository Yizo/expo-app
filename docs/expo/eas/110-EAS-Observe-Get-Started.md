# 110｜设置 EAS Observe

**翻页：**[上一页：EAS Observe 导言](./109-EAS-Observe-Introduction.md) · [目录](./README.md) · [下一页：EAS Observe Dashboard](./111-EAS-Observe-Dashboard.md)

**官方页面：**[Set up EAS Observe](https://docs.expo.dev/eas/observe/get-started/)

**版本边界：**该入门指南未版本化，兼容 Expo SDK 55 及以上：SDK 56+ 使用 `ObserveRoot` / `useObserve()`，SDK 55 使用旧名 `AppMetricsRoot` / `AppMetrics`。本地 Expo ~56.0.11 对应 [SDK v56.0.0 Observe 参考](https://docs.expo.dev/versions/v56.0.0/sdk/observe/)，推荐 `expo-observe ~56.0.29`；以下示例选择 SDK 56 API。SDK 57+ 的错误上报配置不属于本地项目范围。

## 开始前检查

需要 Expo 账号、Expo SDK 55+，并且项目链接到 EAS project，app config 中有 `extra.eas.projectId`。指南建议先用 `npx expo-doctor` 检查 SDK 与依赖；需要修复时，`npx expo install --fix` 会按当前 Expo SDK 匹配依赖。如果没有 `projectId`，可通过 `eas init` 创建关联项目；这会在 Expo 账号下创建项目，应确认目标项目后再操作。

相关检查 / 初始化命令：

```sh
npx expo-doctor
npx expo install --fix
eas init
```

因为 `expo-observe` 含原生代码，Expo Go 不能加载它；集成后要重新构建 Development Build 或 Production Build。

## 安装 expo-observe

先确保 `expo` 与项目 SDK 对齐，再用 Expo 安装命令获取 SDK 对应版本。下面按指南列出包管理器变体：

```sh
npx expo install --fix
npx expo install expo-observe
yarn expo install --fix
yarn expo install expo-observe
pnpm expo install --fix
pnpm expo install expo-observe
bun expo install --fix
bun expo install expo-observe
```

该命令示例只用于说明流程，没有在本项目上执行。按 SDK v56.0.0 页面，`expo-observe` 的推荐版本是 `~56.0.30`；使用 `expo install` 可以按 SDK 版本选择对应包。

## 包装 Root Layout 并测量 TTR

对于 Expo Router 项目，根 layout 文件通常是 `app/_layout.tsx`。SDK 56+ 用 `ObserveRoot.wrap()` 包装 layout，EAS Observe 会自动测量 Time to First Render：

```tsx
import { ObserveRoot } from 'expo-observe';
import { Stack } from 'expo-router';

function RootLayout() {
  return <Stack />;
}

export default ObserveRoot.wrap(RootLayout);
```

SDK 55 的旧 API 是导入 `AppMetricsRoot` 并导出 `AppMetricsRoot.wrap(RootLayout)`。这只是版本差异对照，本地 SDK 56 代码应使用 `ObserveRoot`。

## App Ready 后记录 TTI

TTR 是首次渲染时间。TTI（Time to Interactive）应在启动画面后面的初始化完成、用户可以开始操作时标记，例如 EAS Update 检查、用户认证、首次数据请求与 splash 动画都结束后。不要在根组件一挂载时就过早标记。

下面示例在异步准备结束后关闭启动画面，再调用 `useObserve()` 返回的 `markInteractive()`：

```tsx
import { ObserveRoot, useObserve } from 'expo-observe';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { markInteractive } = useObserve();

  useEffect(() => {
    async function prepare() {
      try {
        await authenticateUser();
        await fetchInitialData();
      } catch (error) {
        console.warn(error);
      } finally {
        setIsReady(true);
      }
    }

    void prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
      markInteractive();
    }
  }, [isReady, markInteractive]);

  if (!isReady) return null;
  return <Stack />;
}

export default ObserveRoot.wrap(RootLayout);
```

`authenticateUser()` 与 `fetchInitialData()` 是项目函数占位符，应替换成真实初始化逻辑。SDK 56 的 SplashScreen 参考支持 `preventAutoHideAsync()` 与同步 `hide()`；`preventAutoHideAsync()` 建议放在全局 scope 调用。若 App 有 onboarding、login、deep link 等多个可直接进入的页面，每种入口的 ready 时刻都要调用该屏幕对应的 `markInteractive()`，避免某些启动方式没有 TTI。

SDK 55 的对照代码使用 `AppMetrics.markInteractive()`，没有 `useObserve()` hook：

```tsx
import { AppMetrics, AppMetricsRoot } from 'expo-observe';

// 准备工作完成并关闭 splash 后调用：
AppMetrics.markInteractive();

export default AppMetricsRoot.wrap(RootLayout);
```

## SDK 56+：按 Route 记录导航指标

根 layout 的 TTR / TTI 是 App 级指标。若要比较每个画面，要在模块加载、任何 screen mount 之前启用导航 integration。Expo Router 使用下面配置；直接使用 React Navigation 时改成 `'react-navigation': true`，并要求 `@react-navigation/native` v7 或更新版。一个项目只保留一次 `Observe.configure()`，把采样、debug dispatch 与 integrations 等选项合并到同一对象：后续调用会替换之前完整配置，mount 后再开关 integration 会报错。

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  integrations: { 'expo-router': true }
});
```

启用 navigation integration 后，要把 `markInteractive()` 从根 layout 移到具体 screen：hook 需要在当前路由组件内才能给事件附上 route name。

```tsx
import { useObserve } from 'expo-observe';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  return null; // 用此 screen 的实际界面替换。
}
```

React Navigation 动态配置需要把顶层 `NavigationContainer` 替换为 Expo Observe wrapper；它接受并转发原 container props / ref：

```tsx
import { ObserveNavigationContainer } from 'expo-observe/integrations/react-navigation';

export function App() {
  return (
    <ObserveNavigationContainer>
      {/* 在这里放项目的 navigator */}
    </ObserveNavigationContainer>
  );
}
```

React Navigation static configuration 没有显式 `NavigationContainer` 可替换。此时手动创建 navigation ref，把同一个 ref 传给 `createStaticNavigation()` 生成的 `Navigation` 与 `ObserveNavigationProvider`：

```tsx
import { createStaticNavigation, useNavigationContainerRef } from '@react-navigation/native';
import { ObserveNavigationProvider } from 'expo-observe/integrations/react-navigation';
import { RootStack } from './navigation';

const Navigation = createStaticNavigation(RootStack);

export function App() {
  const navigationRef = useNavigationContainerRef();

  return (
    <ObserveNavigationProvider navigationRef={navigationRef}>
      <Navigation ref={navigationRef} />
    </ObserveNavigationProvider>
  );
}
```

对应的官方详细说明：[Expo Router integration](https://docs.expo.dev/eas/observe/integrations/expo-router/) 与 [React Navigation integration](https://docs.expo.dev/eas/observe/integrations/react-navigation/)。SDK 57+ 才可配置 `filteredParams`，从导航事件中排除敏感的 `userId` / `token` 等参数；SDK 56 项目不要照搬该选项，应避免在 route/query 参数中放个人敏感数据。

## SDK 57+ 错误报告版本提示

Get Started 页的 agent prompt 还包括 SDK 57+ 的错误上报配置，官方标注为 preview，不能用于当前 SDK 56。该版本可使用 ObserveRoot 组件形式传入整页 fallback，或用 `ObserveErrorBoundary` 只包住某一子树；已捕获的异常则用 `Observe.reportError(error)` 显式提交。生产 eas.json profile 可设置 `uploadSourceMaps: true`，需要 EAS CLI 22+，且 build 必须跑在 EAS Build servers，Dashboard 才能把压缩后的 stack trace 映射回 source files。

SDK 57+ 代码形态仅作版本边界参考：

```tsx
import { Observe, ObserveRoot } from 'expo-observe';

<ObserveRoot errorBoundaryFallback={<FallbackScreen />}>
  <App />
</ObserveRoot>

try {
  await saveDraft();
} catch (error) {
  Observe.reportError(error);
}
```

只包某个子树时，SDK 57+ 可用 `ObserveErrorBoundary`：

```tsx
import { ObserveErrorBoundary } from 'expo-observe';

<ObserveErrorBoundary fallback={<FallbackScreen />}>
  <EditorScreen />
</ObserveErrorBoundary>
```

```json
{
  "build": {
    "production": {
      "uploadSourceMaps": true
    }
  }
}
```

本地 SDK 56 项目请使用当前安装版的配置与官方 SDK v56 参考；上方 SDK 57 示例不属于可用方案。

## 创建新 Build

安装原生模块、加入 instrumentation 后必须创建新 build，才能把 `expo-observe` 编进 App：

```sh
eas build
```

Release build 默认发送指标；debug build 默认不派发。若要在开发 build 调试，可在 SDK 56 `Observe.configure({ dispatchInDebug: true })` 中启用，测试结束后再决定是否保留；debug 的启动性能不代表商店用户的 release 行为。之后在 EAS Dashboard 项目的 Observe tab 检查真实 build 上传的指标。

## 从 EAS CLI 查指标

EAS CLI 可按版本、汇总指标、单个慢会话、route、session 或自定义事件查询。常见命令：

```sh
eas observe:versions
eas observe:metrics-summary
eas observe:metrics
eas observe:routes
eas observe:session
eas observe:events
```

`versions` 列出 App 版本、build / update group ID 和发布日期；`metrics-summary` 按版本看 median、p90、p99 启动统计；`metrics` 查具体事件及设备信息；`routes` 查看按页面分组的 TTR / TTI；`session` 展示某一个会话的事件时间线；`events` 查看 `Observe.logEvent` 发出的自定义事件。使用 `--help` 查看当前 EAS CLI 的参数；routes 查询要先启用 Expo Router 或 React Navigation integration。

## 关键名词

- **Project ID：**`extra.eas.projectId` 用于把本地 App 与 Expo 上的项目关联，不能随意留空或切到其他项目。
- **Root Layout：**Expo Router 应用的全局导航入口 `app/_layout.tsx`；包装它可以覆盖整个 App 的启动渲染。
- **HOC（高阶组件）：**接收一个 React component 并返回增强后组件的函数；`ObserveRoot.wrap(RootLayout)` 就是此模式。
- **Splash Screen：**原生启动画面。`preventAutoHideAsync()` 保持显示；初始化完毕后 `hide()` 隐藏，再标记 TTI。
- **TTR：**启动到首次呈现 App 内容的耗时，由 `ObserveRoot` 自动采集。
- **TTI：**App 初始化至可操作的耗时，由 `markInteractive()` 按应用 ready 状态记录。
- **Development Build：**带有当前项目原生依赖的定制调试 App；与 Expo Go 不同，可运行 `expo-observe` 这类 Expo Go 未内置的 native module。

## 官方代码主题覆盖

源页代码主题全部覆盖：SDK 对应的 expo-observe 安装与依赖修复命令（npx / Yarn / pnpm / Bun）；SDK 56 的 `ObserveRoot.wrap()` 与 SDK 55 `AppMetricsRoot.wrap()`；两种版本在 Ready 时标记 TTI 的 API；SplashScreen 延迟隐藏、async initialization、ready state 示例；创建 EAS build；`eas observe:versions`、`metrics-summary`、`metrics`、`routes`、`session`、`events` 与 `--help` 查询命令；debug build 的 dispatchInDebug 说明。

## 下一页

官方页脚 **Next** 是 [EAS Observe dashboard](https://docs.expo.dev/eas/observe/dashboard/)，介绍 Dashboard 的过滤器、图表统计、版本标记和会话调查。

**翻页：**[上一页：EAS Observe 导言](./109-EAS-Observe-Introduction.md) · [返回目录](./README.md) · [下一页：EAS Observe Dashboard](./111-EAS-Observe-Dashboard.md)
