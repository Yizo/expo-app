# 121｜EAS Observe Metrics Reference

**翻页：**[上一页：为第三方 Package 集成 EAS Observe](./120-EAS-Observe-Third-Party-Integration.md) · [目录](./README.md) · [下一页：EAS Observe Client ID](./122-EAS-Observe-Client-ID.md)

**官方页面：**[Metrics reference](https://docs.expo.dev/eas/observe/reference/metrics/)

**版本边界：**这是当前未版本化 reference。SDK v56.0.0 的 Observe 参考推荐 `expo-observe ~56.0.29`，确认 `ObserveRoot`、`useObserve().markInteractive()`、`routeName` / `params` 属性、导航 integration 与 `Observe.configure()`。SDK 55 的 `AppMetrics` 分支仅作历史对照；SDK 57+ memory warnings 和 SDK58+ network trace 功能不能当作 SDK56 支持能力。当前页面列出的多项 TTI 自动设备 / network 参数在 SDK v56 versioned reference 未列出，本文明确标为当前在线参考字段，不保证 SDK56 可获得。

## Session 与 User 的定义

- **Session：**一次 App process 启动到 process 结束的区间；每次 launch 有新的 session ID，包含这次运行期间采集的所有指标。
- **User：**匿名 installation ID，首次需要 EAS client ID 时生成，原生 preferences 保存。App 更新和 Expo Update 后保持不变；卸载重装或清除 App data 后通常会变。它不是硬件 ID / 账号 ID，但仍应按 pseudonymous identifier 处理。

除另有说明外，持续时间指标统一以秒计。

## App 启动指标

### Cold launch

从操作系统创建 process 开始，到准备好首次渲染前为止，包括 runtime 初始化、读取磁盘中的原生资源以及初始化组件。它由 native 层自动收集，JS 代码不会直接改变 native 部分的测量，但 React Native runtime 初始化时间仍包含其中。常见冷启动场景：重启设备、App 更新、OS 清理进程后再次打开。

当前官方建议低于 **1.5s**。减少无用 native modules；避免 Objective-C `+load`、C++ static constructors、会生成静态 initializer 的模块 / config plugin；降低后台资源占用，减少 OS 因内存压力杀进程的机会。

若 `expo-updates` 设置非零 `fallbackToCacheTimeout`，launch 会等待网络 Update check；想避免这类等待，可保留默认 0，或将 check on launch 策略改为 `NEVER` / `ERROR_RECOVERY_ONLY`。

### Warm launch

App process 还在内存时，OS 将其切回前台并恢复原生 view hierarchy。大部分原生资源已加载，通常明显快于 cold launch。系统决定何时保留进程，App 无法强制把自己变成 warm launch；App 只能缩短已发生的 warm launch 时间。

当前建议低于 **0.5s**。移除不需要的 native modules，避免过深 / 过大的 view tree，减少恢复时要重建的 hierarchy。

### Bundle load

衡量 JavaScript bytecode 加载和执行时间：bundle 开始 load 到 evaluation 完成、调用 `runApplication` 之前。SDK 会自动收集。当前建议低于 **0.3s**。

可从这些方向减少耗时：

- 控制 bundle size；SDK 54+ 默认启用 tree shaking，按 Expo 的代码移除规则拆掉未用代码。
- 用 Expo Atlas 检查大依赖与未使用模块。
- 用 `React.lazy()` 延迟载入较大的 screen / component。
- 避免在 JS 模块顶层做重计算或同步 I/O；存储读写尽量延后。

## TTR 与 TTI

### Time to First Render（TTR）

从 native launch 完成到 root React component 首次把 App 内容画到屏幕的时间；时钟起点已排除 splash 之前的 native launch 部分。`ObserveRoot` 包装 root layout 后自动记录。先给用户显示有意义的 skeleton / 首屏内容，一般比等待全部 API 请求后再渲染更好。当前建议 cold launch 总体（包含 TTR）低于 **2s**。

改善方向：降低 bundle load，避免同步 I/O 与等待 network，保持初始 view tree 小，初始 route 用轻量屏幕，减少阻塞首次内容的 `useEffect` / `useLayoutEffect` 链。

### Time to Interactive（TTI）

从 cold / warm launch 到用户能实际点击、滚动、操作的时间。它是用户感知“App 已经好了”的启动指标；SDK 不会自动判断业务 UI 是否可用，需在内容显示、触摸处理器已响应且导航正常后调用 `markInteractive()`。

SDK 56+ 在 screen / root scope 通过 hook 获取函数：

```tsx
import { useObserve } from 'expo-observe';

function HomeScreen() {
  const { markInteractive } = useObserve();

  // 等该屏幕数据和交互都就绪后，在 effect 中调用。
  // markInteractive();
  return null; // 此处替换为真实页面 UI。
}
```

SDK 55 旧 API 使用 `AppMetrics.markInteractive()`：

```ts
import { AppMetrics } from 'expo-observe';

AppMetrics.markInteractive();
```

Deep link、onboarding、login 等可能成为 App 初始屏的场景，也要覆盖各自的 ready 时机；若只在 Home screen 标记，其他入口启动就没有 TTI。当前建议低于 **3s**，并包含 cold launch 起点。

## 给 TTI 附加自定义信息

SDK 56+ 可用 `params` 把 cohort、租户、缓存命中等业务维度附加到 TTI：

```tsx
const { markInteractive } = useObserve();

markInteractive({
  params: {
    tenant: 'acme',
    cohort: 'beta',
    cacheHit: true,
  },
});
```

SDK 55 可将相同形态的 `params` 传给 `AppMetrics.markInteractive()`。所有参数需要是 JSON 可序列化值。

如果逻辑屏幕名与 router path 不同、是动态路由或没有 Expo Router，可以在 SDK 56+ 改写该事件的 `routeName`：

```tsx
const { markInteractive } = useObserve();

markInteractive({
  routeName: '/feed',
  params: { cacheHit: true },
});
```

### Declarative Marker 版本差异

当前 unversioned metrics reference 介绍 `ObserveInteractiveMarker`：只要把它 render 到 screen content ready 的位置，mount 时会调用一次 `markInteractive()`，并且不渲染可视内容：

```tsx
import { ObserveInteractiveMarker } from 'expo-observe';

function FeedScreen({ items }) {
  if (!items) return <Spinner />;

  return (
    <>
      <FeedList items={items} />
      <ObserveInteractiveMarker />
    </>
  );
}
```

但是 SDK v56.0.0 versioned Observe API reference 未列该 component。SDK 56 项目优先使用前面的 `useObserve().markInteractive()`；不要仅凭当前 unversioned 页面推断本地 ~56.0.29 包一定暴露 declarative marker。

## 自动附加的 TTI 诊断信息

当前 Metrics Reference 列出以下 TTI event params，帮助区分“慢但平滑”与“卡顿”：

| Param | 意义与排查线索 |
| --- | --- |
| `expo.frameRate.slowFrames` | 渲染耗时至少 17ms 的 frame 数。相对 TTI 很高时可能有重 layout、同步桥接调用或过多组件渲染。 |
| `expo.frameRate.frozenFrames` | 至少 700ms 的卡死 frame 数；即使只有一个也值得调查同步 I/O、巨量 JSON 解析、主线程等网络。 |
| `expo.frameRate.totalDelay` | 所有 frame 超出目标帧时长的累计秒数；适合衡量启动期间整体不流畅程度。 |
| `expo.device.lowPowerMode` | OS 省电模式是否开启；可分辨代码回退与系统 CPU / GPU 降频。 |
| `expo.device.batteryLevel` / `batteryCharging` | TTI 时电量比例与充电状态，可观察降频造成的环境差异。 |
| `expo.device.thermalState` | iOS / Android thermal state：nominal、fair、serious、critical、unknown。严重过热会限频。 |
| `expo.network.connected` / `type` | 是否有网络，以及 wifi / cellular / ethernet 等网络类型。 |
| `expo.network.isExpensive` | OS 是否认为网络按流量计费，例如 cellular / personal hotspot。 |
| `expo.network.isConstrained` | iOS Low Data Mode 状态。 |
| `expo.network.dataSaverEnabled` | Android Data Saver 状态。 |

诊断思路：高 TTI、低 delay 通常是初始化链太长但动画流畅；高 TTI 加高 delay / slow frames 多为 JS 主线程争用；frozen frames 则优先查同步文件访问、大 JSON 或阻塞请求。

**SDK 56 适用范围提醒：**上表来自当前 unversioned Metrics Reference；SDK v56.0.0 versioned Expo Observe API reference 未列出全部这些自动附加字段。做 SDK56 实际数据分析时先检查 Dashboard 中真实存在的属性，不要依赖未确认的环境字段。

## TTI 时间窗内的 Network Request 汇总

当前参考还列出从 native launch 结束到 `markInteractive()` 之间的 HTTP 请求摘要。原理上通过 iOS URLSession / Android OkHttp 观察请求，覆盖 React Native `fetch`，并排除 Observe 自己的 telemetry upload。没有请求时不附带这些字段。

- `expo.network.requests.count` / `failed`：请求数量与失败数；失败包含异常和非 2xx 状态。
- `bytesReceived` / `bytesSent`：传输字节总量。
- `totalDuration`：所有 request duration 累加，可能大于实际墙钟时间，因为请求能并行。
- `throughputBytesPerSecond`：实际传输字节与 transfer 时间的估值；不包含 DNS、连接建立和服务器等待时间，cache hit / failure 不算吞吐。
- `slowest.*`：最长一次已完成请求的 duration、host、statusCode、timeToFirstByte、bytesReceived。用它区分服务端迟迟不返回与大 body 下载慢。

为一个 launch 提供的请求摘要最多来自最近 200 条 request；超过时是高负载窗口抽样，不是全量账本。官方网络流量 Trace 配置要求 SDK 58+，且该 Metrics reference 未说明以上聚合字段何版本引入；本地 SDK 56 不要把它们当成已验证能力。

## Update、Navigation 与 Memory Metrics

- **EAS Update download：**使用 EAS Update 且有 `expo-observe` 后自动收集，无需另加 instrumentation。
- **Navigation：**SDK 56+ 开启 Expo Router / React Navigation integration 后记录每 route `cold_ttr`、`warm_ttr`、`tti`。
- **Memory warnings：**SDK 57+ 的 iOS 低内存事件自动记录为 `expo.memory.warning`。附带 allocated / physical / available memory 与 session warning count；App 因 OOM 被系统结束本身不作为 crash 上报。

遇到低内存事件可压缩大图，后台时释放不可见缓存，分块处理 network / file response，检查 listener 和 retain cycles。

## Data Handling

- Offline 时 metrics 暂存在设备；有网络且 App 转入后台会自动发送，也能调用 `Observe.dispatchEvents()` 主动 flush。
- 指标至少保留 60 天。
- 默认对所有 installations 派发；通过 `sampleRate` 固定抽样某一安装。
- Debug 指标默认丢弃；要测试时 `dispatchInDebug: true`。
- `dispatchingEnabled: false` 全局关闭派发并清除等待发送的指标；恢复为 true 后才会继续新数据派发。

## 关键名词

- **Cold / Warm Launch：**App process 从无到有创建与已在内存中的应用回前台。
- **Bundle load：**JavaScript bundle 开始读取到执行完毕的时间段。
- **TTR：**首次在屏幕上显示 React 内容的时刻。
- **TTI：**内容和主要交互 ready、用户真的能操作的时刻。
- **Frame delay：**帧错过显示节奏的延迟；慢帧表示卡顿，frozen frame 表示严重停顿。
- **Native-only metric：**主要由原生启动阶段决定，不直接对应某个 React component 的 render 调用时间。

## 官方代码主题覆盖

源页代码主题全部覆盖：SDK56+ / SDK55 两种 `markInteractive` 写法；给 TTI 传 params 与覆盖 routeName；`ObserveInteractiveMarker` declarative marker（同时注明 v56 reference 未列）；指标阈值与优化方向；自动 TTI 设备 / 网络参数、网络请求窗口、离线、采样、环境、debug、dispatch 配置。所有超出 v56 versioned API 参考的当前文档字段均单独说明，不当作本地 SDK56 保证能力。

## 下一页

官方页脚 **Next** 是 [Client ID](https://docs.expo.dev/eas/observe/reference/client-id/)，说明 EAS client ID 如何作为 installation 级匿名标识串联性能指标和其他服务数据。

**翻页：**[上一页：为第三方 Package 集成 EAS Observe](./120-EAS-Observe-Third-Party-Integration.md) · [返回目录](./README.md) · [下一页：EAS Observe Client ID](./122-EAS-Observe-Client-ID.md)
