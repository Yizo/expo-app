# 109｜EAS Observe 导言

**翻页：**[上一页：在已有原生应用中集成 EAS Update](./108-已有原生App集成Update.md) · [目录](./README.md) · [下一页：设置 EAS Observe](./110-EAS-Observe-Get-Started.md)

**官方页面：**[Introduction to EAS Observe](https://docs.expo.dev/eas/observe/introduction/)

**版本边界：**EAS Observe 入门页未锁 SDK 版本。本地 Expo 为 ~56.0.11；SDK v56.0.0 Expo Observe 参考推荐 `expo-observe ~56.0.29`，支持 `ObserveRoot`、`useObserve()` 与 SDK 56 的导航指标。官方导言中的 JavaScript 错误 / 原生崩溃上报要求 SDK 57 或更高，不能当成 SDK 56 已支持能力。额度与计费会变，页面下述数字仅对应官方页 2026-09-11 更新时的说明。

## EAS Observe 解决什么问题

EAS Observe 是面向**生产环境真实用户**的性能监控服务。开发机的 profiling 看不到真实设备、网络、版本、启动条件的完整差异；Observe 汇总真机启动和渲染指标、EAS Update 下载耗时，也可比较不同 App release 与 OTA update，调查特定会话，并通过 Expo Router / React Navigation 查看逐 route 性能。

在 SDK 56 及更新版中，可记录页面级 render 与 interactive timings。应用还能记录自定义事件，例如关键用户流程节点；页面提到 JavaScript 错误与 native crash 上报处于 preview，但 SDK 57+ 才支持，项目 SDK 56 暂不能使用这部分能力。

## SDK 56 的基础安装与启动指标代码

按项目包管理器安装匹配当前 Expo SDK 的原生模块。SDK 56 项目使用 `npx expo install` 可按 Expo SDK 选择兼容版本：

```sh
npx expo install expo-observe
yarn expo install expo-observe
pnpm expo install expo-observe
bun expo install expo-observe
```

`ObserveRoot.wrap()` 自动记录 Time to First Render；`useObserve()` 返回 `markInteractive()`，应用准备好供用户操作后再调用，记录 Time to Interactive。下面示例在认证和首屏数据加载完成、关闭启动画面后再标记：

```tsx
import { ObserveRoot, useObserve } from 'expo-observe';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

function RootLayout() {
  const [ready, setReady] = useState(false);
  const { markInteractive } = useObserve();

  useEffect(() => {
    void prepareApp().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) markInteractive();
  }, [ready, markInteractive]);

  return ready ? <Stack /> : null;
}

export default ObserveRoot.wrap(RootLayout);
```

`prepareApp()` 是示意函数，项目中可把检查 EAS Update、用户认证、首屏数据加载等放在它管理的启动任务中。`markInteractive()` 应在 Splash 屏幕结束且界面可操作之后调用；同一个 session 调用多次只记录第一次。如果 App 能从登录、引导、deep link 等多个入口启动，需要在每种 entry screen 完成准备后标记，否则从未覆盖的入口进入时不会有对应 TTI。

## 从真实用户会话得到哪些信息

- **启动性能：**cold / warm launch、Time to First Render（TTR）、Time to Interactive（TTI）、bundle load time。
- **更新性能：**EAS Update 下载耗时。
- **页面级性能：**SDK 56+ 的 Expo Router / React Navigation integration 按 route 汇总渲染与交互耗时。
- **自定义事件：**用 `Observe.logEvent` 记录需要跟指标一起观察的产品 / 性能信号。
- **版本比较与会话调查：**对比 App version / OTA update，打开慢会话，按设备、平台、网络条件查问题。

默认可先在 Dashboard 的 Observe tab 看数据，也可用 EAS CLI 查询 Observe metrics。

## 构建、平台、隐私与离线行为

`expo-observe` 含原生模块，所以它**不能在 Expo Go 中运行**。需要为已安装的 native module 建立 development build 或 production build；导言主要讲 production 指标。支持平台是 Android、iOS 与 tvOS。

用户按该 App 安装实例以匿名 ID 区分，不通过它收集可识别个人身份的用户名；卸载重装会生成新 ID。离线收集的指标先保存在设备，本地网络恢复并进入后台时自动发送。SDK v56 还提供 `Observe.dispatchEvents()` 手动 flush 待发送事件。

Debug build 默认不派发 metrics；需要临时调试时，可在 `Observe.configure()` 设置 `dispatchInDebug: true`。生产环境的表现应以 production build 为准，debug 行为会影响指标代表性。官方说明指标至少保留 60 天。

## SDK 版本能力边界

| 能力 | 官方导言标注 | 本地 SDK 56 项目 |
| --- | --- | --- |
| `ObserveRoot` 与 `useObserve().markInteractive()` | SDK 56+ 使用新 `Observe` API | SDK v56 参考支持；安装推荐约 56.0.30。 |
| 按 route 的渲染 / interactive metrics | SDK 56+ | 可使用 Expo Router / React Navigation integration。 |
| JavaScript 错误与 native crash 上报 | Preview，SDK 57+ | SDK 56 不适用。 |
| Expo Go | 不支持原生模块 | 必须装 development build / production build。 |

## 费用提示

官方页在 2026-09-11 写明 Free plan 每月包含 100,000 events、付费计划 500,000 events，并粗略对应约 10,000 / 50,000 月活用户；超出后按用量计费。这里保留官方页面的当时口径，具体套餐、事件额度与价格请以当前 Expo Pricing 为准，不把这些额度视为固定 SDK 属性。

## 关键名词

- **EAS Observe：**面向已发布 App 的性能监控与数据查询服务。
- **Real-user monitoring：**从用户真实设备与网络收集运行指标，不等同于本地模拟器 profiling。
- **TTR（Time to First Render）：**启动后首次呈现有效画面的耗时；ObserveRoot 负责自动标记。
- **TTI（Time to Interactive）：**启动后主要初始化完成、用户可以操作的时间；应由应用在 ready 时调用 `markInteractive()` 标记。
- **Route metric：**把性能指标按导航页面 / route 分组，用于比较哪一屏更慢。
- **Event：**应用额外上报的结构化事件。EAS Observe 的事件数量受账户套餐额度约束。
- **Expo Go：**预先构建好的通用客户端，不含任意项目原生依赖；使用原生 `expo-observe` 必须构建专用 Development Build。

## 官方代码主题覆盖

源页的代码主题全部覆盖：npx、Yarn、pnpm、Bun 安装 `expo-observe`；将 Expo SDK 56+ 的 `ObserveRoot` 包装根 layout；在准备完成后通过 `useObserve().markInteractive()` 记录 TTI；介绍 `Observe.logEvent`、`dispatchEvents()` 与 `Observe.configure({ dispatchInDebug: true })` 的 API / 调试设置主题。SDK 55 的 `AppMetricsRoot` 命名及 SDK 57 的错误上报只作为版本对照，不当成本地 SDK 56 示例。

## 下一页

官方页脚 **Next** 是 [Set up EAS Observe](https://docs.expo.dev/eas/observe/get-started/)，逐步安装原生模块、标记 App ready 并在 Dashboard / CLI 查看首批指标。

**翻页：**[上一页：在已有原生应用中集成 EAS Update](./108-已有原生App集成Update.md) · [返回目录](./README.md) · [下一页：设置 EAS Observe](./110-EAS-Observe-Get-Started.md)
