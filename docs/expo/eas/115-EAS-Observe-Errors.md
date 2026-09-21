# 115｜EAS Observe 错误报告

**翻页：**[上一页：在 EAS Observe 记录自定义 Events](./114-EAS-Observe-User-Events.md) · [目录](./README.md) · [下一页：配置 EAS Observe](./116-EAS-Observe-Configuration.md)

**官方页面：**[Error reporting](https://docs.expo.dev/eas/observe/errors/)

**版本边界：**官方明确 EAS Observe error reporting 目前处于 preview，要求 Expo SDK 57+；原生 crash 还要求 `expo-observe` 57.0.21+。本地项目 Expo ~56.0.11，不能启用此页的错误采集代码。这里的 SDK57 snippets 是未来版本参考，不应当作 SDK56 的可用 API。下方通用原理用于理解监控分类、源码映射与 native crash 边界。

## 有哪些错误会被采集

在满足 SDK 版本后，JavaScript error 有三种进入 Observe 的路径：

1. **未处理错误：**模块首次导入时会注册全局 handler，自动记录；React Native 原有开发红屏和生产 fatal 崩溃行为不改变。
2. **渲染错误：**`ObserveErrorBoundary` 捕获 React tree 渲染时的异常，连同 component stack 写入报告，并用 fallback 替代出错子树。
3. **已处理错误：**应用代码 catch 后继续运行时，不会被全局 handler 看见；用 `Observe.reportError(error)` 主动上报。

报告先写入本机，之后按批次派发。SDK 56 项目中这些错误 API 不可用；下面代码仅描述 SDK 57+ preview 用法。

## 全局关闭未处理 JS error 记录

若需要停用自动记录未处理 JS error，可把 `errorHandlingEnabled` 设为 `false`：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  errorHandlingEnabled: false,
});
```

该选项只关闭全局 unhandled error。`ObserveErrorBoundary` 内的错误、`Observe.reportError()` 上报的错误和 native crash 仍会记录。配置时应合并进应用唯一的 `Observe.configure()` 调用。

## 渲染错误 fallback

给子树包 `ObserveErrorBoundary`，fallback 可以是 React element、`null` 或接收 error 与 `resetError` 的 render function。调用 `resetError()` 会清除异常并重新挂载 children：

```tsx
import { ObserveErrorBoundary } from 'expo-observe';

export default function FeedScreen() {
  return (
    <ObserveErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorScreen error={error} onRetry={resetError} />
      )}
    >
      <Feed />
    </ObserveErrorBoundary>
  );
}
```

如需给整个应用加边界，可在 Root Layout 使用 `ObserveRoot` 的组件形式传 `errorBoundaryFallback`：

```tsx
import { ObserveRoot } from 'expo-observe';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ObserveRoot errorBoundaryFallback={<FallbackScreen />}>
      <Stack />
    </ObserveRoot>
  );
}
```

注意这里用 `ObserveRoot` component form；`ObserveRoot.wrap()` 不接受 fallback props。未被任何 ErrorBoundary 捕获的渲染异常仍会交给全局 handler。

## 已处理错误上报

错误被 catch 并恢复后，不会到达全局 handler，也不会由 render boundary 捕获；在 catch 中显式上报：

```ts
import { Observe } from 'expo-observe';

async function syncCart() {
  try {
    await sendCartToServer();
  } catch (error) {
    Observe.reportError(error);
  }
}
```

`reportError` 接受任意 JS value。传入 Error 会保留 name、message、stack；传入 string、plain object、number 等其他类型时会转成 message，但没有 stack trace。错误信息会离开设备并出现在 Dashboard，不要带入 email、access token 等个人信息。

## Native crash 的收集边界

Native crash 终止 App，JS 来不及处理，因此在设备本地记录，下一次 App launch 时派发。要求 expo-observe 57.0.21+，Android 和 iOS 自动收集，无需应用代码：

- **Android：**读取未捕获的 Java / Kotlin exceptions 及 `Caused by`；Android 11+ 还能读取操作系统保存的部分 native crash，如 `SIGSEGV`、`SIGABRT`。
- **iOS：**利用 MetricKit；收集系统提供的 Mach exceptions 与 signals。iOS 17+ 另含未捕获的 Objective-C / Swift exceptions。
- **不支持：**tvOS 与 iOS Simulator native crash；App Not Responding（ANR）与 out-of-memory termination 不会记录。

## JavaScript Stack Trace 与 Source Map

Production JavaScript 会 bundle / minify，线上 stack 常只有生成 bundle 的行列号。Source map 可把压缩代码位置映射回原始文件、行号与列号；没有 map 时可能看到 `index.android.bundle:1:481231`，难以找到业务代码。

通过 EAS Build 时，可在 eas.json 的 production profile 让 build 上传它生成的 Source map：

```json
{
  "build": {
    "production": {
      "uploadSourceMaps": true
    }
  }
}
```

该开关需要 EAS CLI 22.0.0+，且只适用于跑在 EAS Build server 的 build；`eas build --local` 不会上传 source map。构建仍会完成，但若上传失败，build log 会有 warning。上传前会移除 source map 的 `sourcesContent`，仅保留文件名和位置映射。对 EAS Update OTA 错误的 source map 支持仍未提供。

Source map 只还原 JavaScript stack。Native frames 不会在 Dashboard symbolicate：Android Java / Kotlin 通常已带 class、method、行号；iOS device 原地解析 symbol name，但无文件行号，无法解析时显示 binary name + offset，如 `MyApp + 19160`。ProGuard mapping / iOS dSYM 等 native symbol 上传当时仍未支持。

## Dashboard 错误调查

Observe > Errors 中：

- **Crash-free sessions** 卡片给出当前时间范围里未发生 fatal error 的 session 比例，也展示 crash-free users、fatal / non-fatal 数与受影响用户数。
- **Distinct errors** 将相同错误分组；Source 区分 JavaScript、Native 与 Other。
- 错误详情给出发生次数、受影响用户、首次 / 最后出现时间及平台分布。
- 单个 occurrence 会记录 App version、设备和 OS；Stack trace 展示该次 stack；Before the crash 列出之前 session records；Session timeline 查看完整时间线。
- Breakdown 可按 App version、OS、设备、国家分析；也可按 source、severity、platform、environment、release 筛选。Fatal error 在下一次 App launch 才派发，所以最新崩溃可能稍后出现。
- **Hand off to AI** 会把 stack、过滤条件和版本 / OS / 设备 / 国家 breakdown 汇成 prompt，可交给 coding agent 再用 `eas observe:` 命令查询 session。

## 关键名词

- **Unhandled error：**未被 try/catch、Error Boundary 等处理的 JavaScript 异常，由全局 handler 自动记录。
- **Render error：**React 渲染期间抛出的错误，Error Boundary 可隔离该子树并显示 fallback。
- **Handled error：**代码捕获并自行恢复的异常；需调用 `Observe.reportError` 才会进入 Observe。
- **Native crash：**原生线程 / runtime 直接终止进程，JavaScript 没机会补救。
- **Source map / Symbolication：**source map 将压缩 JS stack 还原到 TS / JSX 文件；native crash symbolication 需要另一类平台调试符号。
- **Crash-free session：**选定观察范围里没有 fatal error 的 App session 占比。
- **Preview 功能：**仍在预览阶段的产品能力，版本支持范围和限制需看官方当前页面。

## 官方代码主题覆盖

源页代码主题均已覆盖并明确标记 SDK 57+：`Observe.configure({ errorHandlingEnabled: false })`；子树 `ObserveErrorBoundary` fallback 中的 `error` / `resetError`；Root 层 `ObserveRoot errorBoundaryFallback`；`Observe.reportError()` catch 示例；eas.json `uploadSourceMaps: true`。Native crash 采集、Stack symbolication、错误 Dashboard 及支持限制以文字完整说明。SDK 56 不适用的示例没有标作本地可运行代码。

## 下一页

官方页脚 **Next** 是 [Configure EAS Observe](https://docs.expo.dev/eas/observe/configuration/)，介绍采样、开发 build 指标、环境标签、自定义 OTLP endpoint 与服务器端 ingestion 开关。

**翻页：**[上一页：在 EAS Observe 记录自定义 Events](./114-EAS-Observe-User-Events.md) · [返回目录](./README.md) · [下一页：配置 EAS Observe](./116-EAS-Observe-Configuration.md)
