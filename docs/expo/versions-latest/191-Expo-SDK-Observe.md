# 191｜Expo SDK Observe 性能观测与自定义事件

**翻页：**[上一页：Expo SDK Notifications 本地与推送通知](./190-Expo-SDK-Notifications.md) · [目录](./README.md) · [下一页：Expo SDK Pedometer](./192-Expo-SDK-Pedometer.md)

**官方页面：**[Expo Observe · Latest](https://docs.expo.dev/versions/latest/sdk/observe/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/observe/)

**版本与平台：**Latest 页面推荐 `expo-observe ~57.0.23`，SDK v56.0.0 页面推荐 `~56.0.29`。文档列出的原生平台为 Android、iOS、tvOS；Expo Go 不含此原生模块，需安装后创建 development build。本文以项目当前 SDK v56 为落地基线，Latest 新增 API 单独标注。

## 这个模块解决什么问题

`expo-observe` 收集真实设备上的启动性能指标、导航耗时和应用事件，可发送到 Expo 的 EAS Observe，也可接入符合 OpenTelemetry（OTEL）标准的后端。它面向线上观测，不只是开发时的 `console.log`。

- **可观测性（observability）：**通过外部系统中的指标、日志和错误记录，了解应用运行状况。
- **TTR（Time to First Render）：**从启动到应用第一次绘制界面的时间。冷启动和热启动可能分别形成 `cold_ttr`、`warm_ttr` 指标。
- **TTI（Time to Interactive）：**启动后应用真正能够响应用户操作的时间。数据、权限或登录状态仍在初始化时，不应过早报告 TTI。
- **指标（metric）与事件（event）：**指标用于测量数值和耗时；事件记录“发生了什么”，例如用户完成同步。
- **采样（sampling）：**只让一定比例的安装实例上报，控制数据量。`sampleRate` 按安装实例稳定选择，未进入样本的设备会丢弃待发指标。
- **集成（integration）：**把路由库或其它包产生的数据接入 Observe。Latest 可为 Expo Router / React Navigation 设定参数过滤。

页面当前说明 EAS Observe Free 每月含 100,000 条事件、付费计划含 500,000 条，超过后按使用量计费；这类产品额度可能变化，应以官方页面和价格页为准。

## 安装、原生构建与启动指标

优先使用 Expo CLI 选择与 SDK 匹配的包版本。官方还列出其它包管理器的 Expo CLI 命令：

```sh
npx expo install expo-observe
yarn expo install expo-observe
pnpm expo install expo-observe
bun expo install expo-observe
```

已有 React Native 工程需先集成 `expo`。安装原生模块后要重新生成 / 构建 development build；不能只在 Expo Go 中验证。

在 Expo Router 根布局中包装 `ObserveRoot`，自动记录启动首次绘制；当初始化工作完成、界面可以交互时调用 `markInteractive`。下例把异步初始化作为 TTI 门槛，实际项目可替换成自己的启动流程：

```tsx
// src/app/_layout.tsx
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { ObserveRoot, useObserve } from 'expo-observe';

function RootLayout() {
  const { markInteractive } = useObserve();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void initializeApp().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) {
      markInteractive({ params: { startupFlow: 'complete' } });
    }
  }, [ready, markInteractive]);

  if (!ready) return <View style={{ flex: 1 }} />;
  return <Stack />;
}

export default ObserveRoot.wrap(RootLayout);
```

`initializeApp` 是应用自己的初始化函数。不要照搬成“组件 mount 就是可交互”：如果 splash 后仍在加载首屏数据，应该等这些关键工作完成后再标记。

## 页面级 TTI 标记

Latest 还提供 `ObserveInteractiveMarker`。它本身不渲染 UI，在首次挂载时把 `params` 附到 TTI 指标。它只触发一次；首次渲染后才知道的参数应改用 `useObserve().markInteractive(...)`：

```tsx
import { ObserveInteractiveMarker } from 'expo-observe';

function Feed({ items }: { items?: FeedItem[] }) {
  if (!items) return <LoadingState />;

  return (
    <>
      <FeedList items={items} />
      <ObserveInteractiveMarker params={{ cacheHit: true }} />
    </>
  );
}
```

`params` 应使用可 JSON 序列化值。避免放入函数、`Date` 或 `undefined` 等无法稳定写入遥测数据的值。

## 路由性能与敏感参数

Latest 可启用 Expo Router 或 React Navigation 集成，记录冷 / 热启动及路由 TTI。React Navigation 集成要求用 Observe 文档规定的 `ObserveNavigationContainer` 替换普通 `NavigationContainer`。下面展示 Latest 的配置形式：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  integrations: {
    'expo-router': {
      filteredParams: ['accessToken', 'email'],
    },
  },
});
```

`filteredParams` 是 Latest 新增的导航集成配置：列出的 route / query 参数不会进入导出的 `routeParams`；一旦有配置项被过滤，导出的完整 URL / path 会被替换为 `urlHidden: true`，但 `routeName` 保留。SDK v56 的 `integrations` 只接受 `true` / `false`，不支持以上对象配置；不要在当前 v56 app 中直接使用此段 Latest 写法。

启用配置的框架应已安装。若同时处理用户标识或隐私字段，可结合下方全局属性策略，避免将个人信息写入日志与路由参数。

## 自定义事件、全局属性与错误

### 记录业务事件

`Observe.logEvent(name, options?)` 在当前主会话创建事件。事件先存储在本地，之后随批次发送；严重度默认 `info`。

```ts
import { Observe } from 'expo-observe';

Observe.logEvent('checkout_completed', {
  body: '用户完成结账',
  severity: 'info',
  attributes: { item_count: 2, payment_method: 'card' },
});
```

Latest 的 `LogEventOptions` 还支持供仪表盘显示的 `displayName`；v56 类型没有此字段。`name` 是稳定的程序标识，`displayName` 是面向人的标签。

### 设置通用属性

全局属性会并入后续 metric 与 log；单条记录同名字段优先。传 `null`、`undefined` 或空对象可清除：

```ts
Observe.setGlobalAttributes({
  app_area: 'checkout',
  release_channel: 'preview',
});

Observe.logEvent('payment_started', {
  attributes: { app_area: 'one-time-override' },
});

Observe.setGlobalAttributes(null);
```

支持字符串、数字、布尔值及嵌套的 JSON 数据。避免把密码、token 等敏感内容加入全局或单条属性。

### 主动报告已处理错误（Latest）

捕获后恢复的异常不会进入全局未处理错误处理器，可通过 `reportError` 保留观测记录：

```ts
try {
  await syncCart();
} catch (error) {
  Observe.reportError(error);
  showOfflineMessage();
}
```

通常传 `Error` 以保留名称、消息与堆栈。Latest 会把普通字符串或对象转成消息内容；此 API 不存在于 v56 的页面 API 中。

### 捕获渲染阶段错误（Latest）

React error boundary 捕获子树渲染错误并显示 fallback，同时把错误和组件堆栈作为非致命 exception 记录。可传静态元素、渲染函数或 `null`；不存在“只收集错误但仍继续原界面”的模式：

```tsx
import { ObserveErrorBoundary } from 'expo-observe';

<ObserveErrorBoundary
  fallback={({ error, resetError }) => (
    <RecoverableErrorPanel error={error} onRetry={resetError} />
  )}
>
  <ProfileScreen />
</ObserveErrorBoundary>
```

`resetError` 清掉边界状态并重新挂载子组件。也可给 Latest 的 `ObserveRoot` 传 `errorBoundaryFallback` 在应用根部安装边界；省略时不自动安装，仍保留 React Native 全局错误处理器的行为。事件处理器、异步回调中的异常仍需自行 `try/catch`；error boundary 不能代替它们。

## 配置与 API

Latest 与 v56 均可通过 `Observe.configure` 设置环境、发送开关、采样率和集成：

```ts
Observe.configure({
  environment: __DEV__ ? 'development' : 'production',
  dispatchingEnabled: true,
  sampleRate: 0.25,
  integrations: { 'expo-router': true },
});
```

主要规则：

- Release build 安装后会自动收集启动指标；TTI 仍需在实际就绪时显式标记。Debug build 默认不 dispatch；两版类型都列出 `dispatchInDebug` 来选择是否在 debug 环境上报。
- `dispatchingEnabled: false` 时，待发指标会被标记为已处理但不会上传，重新开启后不等于补发已丢弃数据。
- `sampleRate` 范围为 `[0, 1]`，越界会被限制；选择对某次安装稳定。未被采样的安装会丢弃待发指标，不会一直积累。
- 通常在应用切到后台时自动发送：Android 由后台 worker 等待网络，iOS 在应用失活或即将结束时发送。需要立即确认上传时可 `await Observe.dispatchEvents()`。
- `Observe.setBundleDefaults(...)` 由包初始化时自动调用，不应由宿主 app 手动调用。

| API | 作用 |
| --- | --- |
| `ObserveRoot.wrap(Component)` / `<ObserveRoot>` | 包装根视图，采集首次绘制；Latest 组件可通过 `errorBoundaryFallback` 安装错误边界。 |
| `useObserve()` | 返回 `markInteractive(attributes?)`；有路由集成时 hook 能填当前 `routeName`，原始 `Observe.markInteractive` 不会自动填。 |
| `Observe.markFirstRender()` | 标记首次绘制时间；`ObserveRoot` 通常会负责。 |
| `Observe.markInteractive(attributes?)` | 标记 TTI，可带 `routeName` 与 `params`。 |
| `Observe.logEvent(name, options?)` | 记录 OTEL log；`LogEventOptions` 有 `body`、`attributes`、`severity`，Latest 另有 `displayName`。 |
| `Observe.setGlobalAttributes(attributes \| null)` | 设置 / 清理全局属性。 |
| `Observe.configure(config)` | 更新环境、发送、采样和 integration 配置。 |
| `Observe.dispatchEvents()` | 返回 `Promise<void>`，立即 flush 待发事件。 |
| `Observe.clearStoredEntries()` | 返回 `Promise<void>`，清理本地暂存记录。 |
| `Observe.getIntegrations()`（Latest） | 读出最近一次 configure 的 integration 配置；未配置则为空对象。 |
| `Observe.registerIntegration(name, callback)`（Latest） | 对指定 integration 配置注册一次性回调。 |
| `Observe.reportError(error)`（Latest） | 记录已捕获且已处理的非致命异常。 |
| `ObserveErrorBoundary`（Latest） | 捕获 React render-phase 错误，并在 fallback 中提供 `error`、`resetError`。 |
| `ObserveInteractiveMarker`（Latest） | 首次挂载时 declarative 标记 TTI；可传 `params`。 |
| `ObserveErrorBoundary.getDerivedStateFromError(error)`（Latest） | error boundary 的静态错误状态转换方法。 |
| `NetworkRequestObserver`（Latest 类型） | 订阅原生网络拦截器的 `requestStarted` / `requestCompleted`；持有实例开始监听，释放引用后停止。官方页给出能力说明，未附可运行示例。 |

`ObserveModuleEvents` 的 `configure` 事件会在每次配置时发出，payload 带已解析的 `integrations`。`clearStoredEntries` 适用于清空测试 / 暂存队列，不要误当作远端仪表盘删除 API。

## 常用类型速查

| 类型 | 关键字段或取值 | 说明 |
| --- | --- | --- |
| `ObserveConfig` | `dispatchInDebug?`、`dispatchingEnabled?`、`environment?`、`integrations?`、`sampleRate?` | Observe 运行配置。 |
| `ObserveIntegrationsConfig` | `expo-router`、`react-navigation` | v56 为布尔值；Latest 可传 `boolean \| ObserveNavigationIntegrationConfig`。 |
| `ObserveNavigationIntegrationConfig`（Latest） | `filteredParams?: string[]` | 从导航指标中移除指定路由 / query 参数。 |
| `MetricAttributes` | `params?: Record<string, unknown>`、`routeName?: string \| null` | 指标附加维度；route 集成可推断 route name。 |
| `ObserveAttributes` / `ObserveAttribute` | 属性映射 / 属性值 | 支持基本 JSON 值和嵌套数组、对象。 |
| `LogEventOptions` | `attributes?`、`body?`、`severity?`；Latest 另有 `displayName?` | 单条日志配置。 |
| `LogSeverity` | `trace`、`debug`、`info`、`warn`、`error`、`fatal` | 从细粒度追踪到严重故障。默认 `info`。 |
| `ObserveModuleEvents` | `configure({ integrations })` | 原生模块发出的配置事件。 |
| `AppMetricsErrorBoundaryProps`（Latest） | `children`、`fallback` | fallback 可为 element、render 函数或 `null`。 |
| `AppMetricsErrorBoundaryFallbackProps`（Latest） | `error: unknown`、`resetError(): void` | fallback 函数收到的错误和重试入口。 |
| `AppMetricsRootProps`（Latest） | `children`、`errorBoundaryFallback?` | 根包装组件可选的错误 fallback。 |
| `LogAttributeValue` | `string \| number \| boolean \| JSON object` | 函数、`Date`、`undefined` 等不保证保留。 |

## Latest 与 SDK v56 对照

| 项目 | Latest 页面 | SDK v56.0.0 页面 |
| --- | --- | --- |
| 推荐包 | `expo-observe ~57.0.23` | `expo-observe ~56.0.29` |
| 基础 TTR / TTI、事件、全局属性、采样、flush | 有 | 有 |
| `dispatchInDebug` | 有 | 有 |
| Expo Router / React Navigation | 配置值可为布尔或对象；对象支持 `filteredParams` | 只能通过布尔值启用；没有参数过滤配置 |
| `ObserveErrorBoundary`、`ObserveInteractiveMarker` | 有 | 未列出 |
| `getIntegrations`、`registerIntegration`、`reportError` | 有 | 未列出 |
| `LogEventOptions.displayName` | 有 | 未列出 |
| `NetworkRequestObserver` | 有 API 类型说明 | 未列出 |
| `ObserveRoot.errorBoundaryFallback` | 有 | v56 `ObserveRoot` 只列 children |

因此在 SDK v56 项目中按 v56 API 使用：采用 boolean integrations；不要直接引用 Latest-only 的过滤、marker、错误边界、手动报告错误和网络观察 API。即使两个页面 API 基础相似，也应以当前项目安装的 `expo-observe ~56.0.29` 类型声明为准。

## 官方源页代码主题覆盖

- 安装命令：保留 npx、Yarn、pnpm、Bun 的 `expo install` 变体。
- 根布局 Usage：重写 `ObserveRoot.wrap`、`useObserve`、等待初始化结束再报告 TTI 的路由布局示例。
- `ObserveInteractiveMarker`：覆盖数据准备后挂载、附带 `params` 的 declarative 示例及 fire-once 限制。
- API 示例：覆盖全局属性、`Observe.configure`、手动 `dispatchEvents`、`registerIntegration`、`reportError`；原始全局属性片段已改用现行 `Observe` 名称。
- 另增加 error boundary fallback、路由参数过滤、业务 `logEvent` 的等价示例，帮助说明 Latest 新 API。NetworkRequestObserver 只在源页以类型能力说明呈现，没有 runnable 示例，故不臆造构造函数代码。
- 源页没有可运行的 Activity/权限/原生配置片段；代码覆盖按该页实际 Usage 与 API 示例核对。

**翻页：**[上一页：Expo SDK Notifications 本地与推送通知](./190-Expo-SDK-Notifications.md) · [目录](./README.md) · [下一页：Expo SDK Pedometer](./192-Expo-SDK-Pedometer.md)
