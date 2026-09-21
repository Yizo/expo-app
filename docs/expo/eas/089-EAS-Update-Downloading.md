# 089｜EAS Update 检查、下载与应用策略

**翻页：**[上一页：EAS Update Deployment：Staging 到 Production](./088-EAS-Update-Deployment.md) · [目录](./README.md) · [下一页：EAS Update Rollouts](./090-EAS-Update-Rollouts.md)

**官方页面：**[Downloading updates](https://docs.expo.dev/eas-update/download-updates/)

**版本边界：**本文所述 expo-updates runtime behavior 适用于 release build 与启用 EX_UPDATES_NATIVE_DEBUG 的 debug build；普通 development build / Expo Go 不包含大部分同一更新 API 行为。本地 Expo ~56.0.11 的 exact API 以 [SDK v56.0.0 Updates reference](https://docs.expo.dev/versions/v56.0.0/sdk/updates/) 为准。

## Default Update Strategy

默认 expo-updates 在 App 从彻底退出状态 cold launch 时异步检查并下载 update，不阻塞当前启动。用户通常需要下一次冷启动 / 重启后才应用已经下载的 update。

这种策略避免弱网时用户卡在 splash screen 等待网络；代价是变更不会在发布后立即给每个打开 App 的用户运行。若不希望使用默认自动 check，可设 updates.checkAutomatically 为 NEVER，再调用 API 自己安排检查时间。

不建议永远阻塞 App 启动直到网络拉取最新 update：用户网络慢或离线时会明显降低启动体验。

## Foreground Check / Fetch / Reload

App 运行时可主动检查更新。checkForUpdateAsync 返回结果的 isAvailable / manifest 描述是否有兼容 update；有更新时 fetchUpdateAsync 下载，然后 reloadAsync 重新加载 app：

```ts
import * as Updates from "expo-updates";

export async function checkAndApplyUpdate() {
  const result = await Updates.checkForUpdateAsync();
  if (!result.isAvailable) {
    return;
  }

  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync();
}
```

也可在 App 进入 foreground 时检查，或显示确认 Dialog 后再应用。useUpdates hook 可在 React component 中观察更新状态。不要高频轮询，网络请求会消耗用户数据 / battery；expo-updates server 也可能限流。

## Background Fetch

expo-background-task 可以在后台调用相同 check / fetch 方法，以提高 App 下次打开时已下载最新 update 的概率。下面示意在顶层组件 / 模块注册任务：

```ts
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import * as Updates from "expo-updates";

const TASK_NAME = "check-expo-update";

TaskManager.defineTask(TASK_NAME, async () => {
  const result = await Updates.checkForUpdateAsync();
  if (result.isAvailable) {
    await Updates.fetchUpdateAsync();
  }
  return Promise.resolve();
});

export async function setupBackgroundUpdates() {
  await BackgroundTask.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 24,
  });
}
```

后台下载后不立即 reload 也有帮助；下一次 cold launch 会较快应用。后台调用 reloadAsync 属于 experimental，能让之后再次打开时加载已下载版本，但会 cold boot 并丢掉没有持久化的临时界面状态。

## Critical / Mandatory Update

expo-updates 没有原生提供专门的 mandatory-update feature。App 可自行查看 update manifest / metadata，并在 update 必须安装时显示产品 UI；官方 Updates API Demo 有实现示例。强制更新策略也应考虑离线、低电量、应用流程中状态如何保存。

## 客户端运行时决定加载目标

默认 build URL / request headers（如 channel）写入 binary；可通过新的服务端更新来改变该 channel 内容。若要在运行期间选择另一个 URL / channel，可用 Updates.setUpdateURLAndRequestHeadersOverride，但要满足兼容性和安全要求，细节见前面的 runtime override 页。

## 监控 Update Adoption

- Update details 页面显示哪些用户运行该 update，以及下载 / 启动失败次数。
- Deployments 页面按 channel + runtimeVersion 图表展示一定时期里各 update 的运行用户数。

这些数据用于观察 adoption 和失败风险；要监控 crashes / installs / users 与 rollout 状态，也可以结合 EAS Insights。

## 关键名词

- **Cold Launch / Cold Boot：**App 完全退出后重新启动，与从后台切回前台不同。
- **检查 / 下载 / 应用：**check 查询 update；fetch 将 bundle 保存到设备；reload 重新加载当前进程。
- **Fallback to cache timeout：**控制启动时等待远端检查的时间；默认 strategy 尽量不阻塞界面。
- **Background Task：**操作系统允许应用在后台有限时间执行的任务；不保证精确触发时点。
- **Mandatory Update：**用户在继续使用之前必须更新的产品策略，需 App 自己设计，不是 expo-updates 一键功能。

## 官方代码主题覆盖

源页所有 API/code topics 都有示例或说明：checkAutomatically=NEVER；Foreground checkForUpdateAsync、fetchUpdateAsync、reloadAsync、useUpdates；BackgroundTask.defineTask/registerTaskAsync；后台 reload 为 experimental 的边界；运行时 URL/header override；更新 users / failed installs adoption metrics。

## 下一页

官方页脚 **Next** 是 [Rollouts](https://docs.expo.dev/eas-update/rollouts/)，介绍逐步把 update 推向一部分用户，并持续增加发布比例。

**翻页：**[上一页：EAS Update Deployment：Staging 到 Production](./088-EAS-Update-Deployment.md) · [返回目录](./README.md) · [下一页：EAS Update Rollouts](./090-EAS-Update-Rollouts.md)
