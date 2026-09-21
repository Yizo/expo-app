# 137｜Expo SDK BackgroundFetch（已弃用）

**翻页：**[上一页：Expo SDK AuthSession](./136-Expo-SDK-AuthSession.md) · [目录](./README.md) · [下一页：Expo SDK BackgroundTask](./138-Expo-SDK-BackgroundTask.md)

**官方页面：**[BackgroundFetch · Latest](https://docs.expo.dev/versions/latest/sdk/background-fetch/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/background-fetch/)

**版本边界：**Latest 推荐 `expo-background-fetch ~57.0.17`；SDK v56.0.0 推荐 `~56.0.27`。两个版本的参考页都把该库标为**已弃用**：它不再接收修复，之后会移除，官方指出替代库为 `expo-background-task`。这里只整理旧接口的现状，新增后台任务应优先查看下一页 BackgroundTask。

## 它做什么，以及不能保证什么

`expo-background-fetch` 允许 App 在后台周期性执行短任务，例如刷新缓存。它通过 `expo-task-manager` 注册任务。**周期是系统调度建议**，不是闹钟：iOS 与 Android 会基于电量、使用情况等决定实际执行时间，不能依靠它保证精确每隔 N 分钟运行。

需要记住这些平台限制：

- iOS 只会在 App 被放到后台后调度，不会在 App 被强制结束或设备重启后运行。
- iOS Expo Go 未启用 Background Fetch，必须用 development build 验证。
- 系统给每次任务约 30 秒完成工作；超时可能终止 App，并影响后续调度。
- iOS 用 `BackgroundFetchResult` 返回本次结果，系统会据此安排后续执行。

## 安装与 iOS 配置

该旧库可用 `expo install` 安装与当前 SDK 匹配的版本；长期维护或新开发应改用官方替代项：

```sh
npx expo install expo-background-fetch
# 也可用 yarn / pnpm / bun expo install expo-background-fetch
```

iOS 需要在 `UIBackgroundModes` 声明 `fetch`。使用 CNG 时，prebuild 会配置；手动维护 iOS 原生工程时加到 `Expo.plist`：

```xml
<!-- ios/project-name/Supporting/Expo.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
</array>
```

在 Android 上若使用设备开机后恢复任务，插件会自动添加 `RECEIVE_BOOT_COMPLETED`；保持设备唤醒以完成任务时会添加 `WAKE_LOCK`。前者接收系统开机广播，后者允许短暂持有 CPU 唤醒锁；额外开机启动会影响启动体验，因此按产品实际需要设置 `startOnBoot`。

## 定义、注册和取消任务

任务定义必须放在**模块顶层 / 全局作用域**，也就是组件渲染之前。后台启动时，系统会重新加载 JS 模块并通过任务名找到处理函数；把 `defineTask` 放在组件里可能来不及注册。

注册和取消任务可以由组件触发，但任务名要完全一致。每次后台回调都必须返回 `NewData`、`NoData` 或 `Failed` 其中一个结果：

```tsx
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch';

// 必须位于模块顶层，不要放进 React 组件。
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const receivedNewData = await refreshAppCache();
    return receivedNewData
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false, // 仅 Android
    startOnBoot: true, // 仅 Android
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export default function BackgroundFetchScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState<BackgroundFetch.BackgroundFetchStatus | null>(null);

  async function checkStatusAsync() {
    const currentStatus = await BackgroundFetch.getStatusAsync();
    const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setStatus(currentStatus);
    setIsRegistered(registered);
  }

  useEffect(() => {
    void checkStatusAsync();
  }, []);

  async function toggleTask() {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }
    await checkStatusAsync();
  }

  return (
    <View>
      <Text>Background fetch status: {status == null ? '未知' : BackgroundFetch.BackgroundFetchStatus[status]}</Text>
      <Text>Task: {isRegistered ? BACKGROUND_FETCH_TASK : '尚未注册'}</Text>
      <Button
        title={isRegistered ? 'Unregister task' : 'Register task'}
        onPress={toggleTask}
      />
    </View>
  );
}
```

例子中的 `refreshAppCache()` 代表业务代码：向服务器取少量更新、保存缓存并及时返回。后台任务不适合长时间上传、持续定位或精确闹钟。

### API 行为和选项

| API | 输入 / 返回 | 说明 |
| --- | --- | --- |
| `TaskManager.defineTask(name, callback)` | 名称 + 异步回调 | 在全局定义执行体；同一任务必须先定义再注册。 |
| `BackgroundFetch.registerTaskAsync(taskName, options?)` | `BackgroundFetchOptions`，返回 `Promise<void>` | 注册持久任务；App 下次启动时会恢复注册。 |
| `BackgroundFetch.unregisterTaskAsync(taskName)` | 返回 `Promise<void>` | 取消该任务后，不再接收后续后台回调。 |
| `BackgroundFetch.getStatusAsync()` | `Promise<BackgroundFetchStatus \| null>` | 查询系统是否允许后台刷新。 |
| `BackgroundFetch.setMinimumIntervalAsync(seconds)` | `number`，返回 `Promise<void>` | 设置全局最小间隔；是建议值，Android 不生效。 |
| `TaskManager.isTaskRegisteredAsync(taskName)` | 返回 `Promise<boolean>` | 查询任务当前是否已注册。 |

`BackgroundFetchOptions` 属性：

| 属性 | 平台 | 说明 |
| --- | --- | --- |
| `minimumInterval?` | Android / iOS | 两次调度的建议间隔，单位秒。Android 默认约 10 分钟；iOS 默认采用系统最短支持间隔，约 10–15 分钟。系统可为省电而延长。 |
| `startOnBoot?` | Android | 重启后继续调度；默认 `false`。启用时需要开机广播能力。 |
| `stopOnTerminate?` | Android | 用户结束 App 后是否停止任务；默认 `true`。设 `false` 可让任务继续，但不能作为 iOS 行为来理解。 |

`setMinimumIntervalAsync` 是全局值，在 Expo Go 中可能覆盖同一环境下其他 App 的设置。Android 上该方法没有效果；Android 的间隔通常通过注册选项设置。

## 状态和结果枚举

| 枚举 | 值 | 含义 |
| --- | --- | --- |
| `BackgroundFetchResult.NoData` | `1` | 本次没有新内容。 |
| `BackgroundFetchResult.NewData` | `2` | 成功下载或获取了新数据。 |
| `BackgroundFetchResult.Failed` | `3` | 本次工作失败。 |
| `BackgroundFetchStatus.Denied` | `1` | 用户或系统关闭了后台行为。 |
| `BackgroundFetchStatus.Restricted` | `2` | 设备策略限制后台刷新，用户也不能打开；例如家长控制。 |
| `BackgroundFetchStatus.Available` | `3` | 当前系统允许后台刷新。 |

独立 `setMinimumIntervalAsync()` 的完整调用形式：

```ts
await BackgroundFetch.setMinimumIntervalAsync(15 * 60);
```

该方法已弃用，且 Android 无效果；优先在注册参数中设置间隔，迁移时参阅 `expo-background-task` 的对应设置。

## 开发期间如何触发

后台调度由系统决定，因此等待它自然触发并不可靠。官方文档给出的开发途径：

- **iOS：**用 Xcode 的 Instruments → Time Profiler，选择运行中的目标 App，在 Document 菜单触发 “Simulate Background Fetch”。文档的菜单示例提到 Expo Go，但同页指出 iOS Expo Go 未启用该功能，所以测试时应使用 development build。
- **Android：**可暂时将 `minimumInterval` 调低并把 App 放到后台观察回调；这只是开发测试提示，不代表上线后任务会按固定分钟数执行。

```ts
async function registerForShortTestInterval() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60, // 测试建议值，系统仍可能延后
  });
}
```

## 已弃用的边界

当前参考页将整个 `expo-background-fetch` 包以及 `getStatusAsync()`、`registerTaskAsync()`、`setMinimumIntervalAsync()`、`unregisterTaskAsync()` 标为弃用，并建议转向 `expo-background-task`。兼容旧项目时可以读懂这些 API；新实现请继续阅读下一页背景任务文档，再决定迁移方案。

## 页面代码主题覆盖

官方示例代码主题均已改写：包管理器安装；手动 iOS `Expo.plist`；全局 `TaskManager.defineTask`、任务结果分支、注册选项与注销；React 状态 / Effect 查询任务注册和系统状态、切换注册状态的 UI；Android 缩短间隔测试；独立设置全局 interval。iOS Instruments 的手工触发步骤、Android / iOS 能力限制、自动权限及枚举返回值也已整理。页面 API 中每个弃用方法与替代包提示均在上文标注。

**来源：**[Expo BackgroundFetch · Latest](https://docs.expo.dev/versions/latest/sdk/background-fetch/) · [Expo BackgroundFetch · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/background-fetch/)

**翻页：**[上一页：Expo SDK AuthSession](./136-Expo-SDK-AuthSession.md) · [目录](./README.md) · [下一页：Expo SDK BackgroundTask](./138-Expo-SDK-BackgroundTask.md)
