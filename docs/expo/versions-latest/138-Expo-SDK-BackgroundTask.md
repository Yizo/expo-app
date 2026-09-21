# 138｜Expo SDK BackgroundTask 后台任务

**翻页：**[上一页：Expo SDK BackgroundFetch（已弃用）](./137-Expo-SDK-BackgroundFetch.md) · [目录](./README.md) · [下一页：Expo SDK Barometer](./139-Expo-SDK-Barometer.md)

**官方页面：**[BackgroundTask · Latest](https://docs.expo.dev/versions/latest/sdk/background-task/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/background-task/)

**版本边界：**Latest 推荐 `expo-background-task ~57.0.19`；SDK v56.0.0 推荐 `~56.0.27`。本 API 是 `expo-background-fetch` 的新版替代方向；两版都提供相同的任务定义、注册、手动触发测试与过期监听功能，支持 Android、iOS、tvOS，并可在 Expo Go 使用。iOS Background Tasks API 不能在模拟器运行，需实体设备验证。

## 后台任务是“延后工作”

`expo-background-task` 用于在 App 不活跃时安排可延后的短工作，例如同步少量数据、预取内容、检查 Updates。它把 JavaScript 任务交给原生调度器：Android 使用 **WorkManager**，iOS 使用 **BGTaskScheduler**，并通过 `expo-task-manager` 调用 JS 函数。

后台任务**不会按固定闹钟时间执行**。App 指定的 `minimumInterval` 是系统的最短延迟要求，系统还会考虑电量、是否接电、网络、App 使用习惯等条件。设备条件不合适时任务不会运行；iOS 常常把任务排在之后更合适的时间窗口。Android 最小间隔为 15 分钟，iOS 可能忽略很短的间隔，默认大约每 12 小时安排一次。

系统管理任务生命周期：用户强制结束 App 时任务停止，重新打开 App 后再恢复注册任务；系统停止 App 或设备重启时，可重新启动 App 并恢复任务。iOS 在 App Switcher 中上滑会终止 App；Android 从最近应用列表移除通常不会完全结束进程，但厂商行为不一。

## 安装与 iOS 原生配置

使用 `expo install` 安装当前 SDK 匹配的模块：

```sh
npx expo install expo-background-task
# 也可使用 yarn / pnpm / bun expo install expo-background-task
```

iOS 需要允许 `processing` 后台模式，并登记系统允许启动的 task identifier。CNG 的 prebuild 会自动写入；手动维护原生工程时添加到 `Info.plist`：

```xml
<!-- ios/project-name/Supporting/Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>processing</string>
</array>
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
  <string>com.expo.modules.backgroundtask.processing</string>
</array>
```

## 定义、注册和查看任务状态

像 `expo-background-fetch` 一样，`TaskManager.defineTask()` 必须放在模块的全局作用域。操作系统可能在 App UI 没有打开时启动 JS runtime，因此不能等 React 组件挂载后才定义任务。

```tsx
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

const BACKGROUND_TASK_IDENTIFIER = 'background-task';

// 全局定义：App 不在前台显示这个页面时也能被系统调用。
TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    const now = Date.now();
    console.log('后台任务开始时间：', new Date(now).toISOString());
    await syncSmallAmountOfData();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('后台任务失败：', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

async function registerBackgroundTaskAsync() {
  return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {
    minimumInterval: 12 * 60, // 分钟；系统至少延迟这么久，可能更晚
  });
}

async function unregisterBackgroundTaskAsync() {
  return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);
}

export default function BackgroundTaskScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState<BackgroundTask.BackgroundTaskStatus | null>(null);

  async function updateStatus() {
    const currentStatus = await BackgroundTask.getStatusAsync();
    const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_IDENTIFIER);
    setStatus(currentStatus);
    setIsRegistered(registered);
  }

  useEffect(() => {
    void updateStatus();
  }, []);

  async function toggleTask() {
    if (isRegistered) {
      await unregisterBackgroundTaskAsync();
    } else {
      await registerBackgroundTaskAsync();
    }
    await updateStatus();
  }

  return (
    <View>
      <Text>
        系统状态：{status == null ? '未知' : BackgroundTask.BackgroundTaskStatus[status]}
      </Text>
      <Button
        disabled={status === BackgroundTask.BackgroundTaskStatus.Restricted}
        title={isRegistered ? '取消任务' : '安排后台任务'}
        onPress={toggleTask}
      />
      <Button title="重新查询状态" onPress={updateStatus} />
    </View>
  );
}
```

代码中的 `syncSmallAmountOfData()` 是业务数据同步占位函数。任务回调应及时保存需要的状态并结束，不能依赖 React UI 存在。

## 多个 JavaScript 任务如何调度

iOS 的 BGTaskScheduler 与 Android WorkManager 都限制单个 App 能安排的原生任务数量，因此 Expo 把所有 JS 任务放到一个共享 worker 上依次运行。可定义多个不同任务名，但它们并非各有独立原生时钟；**最后注册的任务会决定这个共享 worker 的最小间隔**。设计多个任务时应把工作合并或协调间隔。

## 开发期间手动测试与排错

`triggerTaskWorkerForTestingAsync()` 会在开发模式手动触发已注册任务，适合不想等待系统调度时验证回调。它仅限 development / debug build，在 production build 不会执行。iOS 也只有实体设备支持 Background Tasks API：

```tsx
import * as BackgroundTask from 'expo-background-task';
import { Button } from 'react-native';

function TriggerBackgroundTasksButton() {
  async function trigger() {
    const didTrigger = await BackgroundTask.triggerTaskWorkerForTestingAsync();
    console.log('是否触发：', didTrigger);
  }

  return <Button title="开发环境立即触发后台任务" onPress={trigger} />;
}
```

Android 可用 Android SDK 的 `adb` 查看 JobScheduler 中排队任务。先查询包名对应的 job，再把 App 放入后台后手动请求执行：

```sh
adb shell dumpsys jobscheduler | grep -A 40 -m 1 -E "JOB #.* <package-name>"
adb shell cmd jobscheduler run -f <package-name> <JOB_ID>
```

命令输出中会有类似的工作项摘要：

```text
JOB #u0a123/275: <package-name>/androidx.work.impl.background.systemjob.SystemJobService
  Enqueue time: -8m12s
  Run time: earliest=+6m47s, latest=none
  Satisfied constraints: CONNECTIVITY DEVICE_NOT_DOZING
  Unsatisfied constraints: TIMING_DELAY
```

`JOB_ID` 是 `JOB #` 后的编号。输出中重点看 `Enqueue time`、最早 `Run time`、满足 / 未满足的约束。设备需满足网络、电量 / 供电、Doze 等调度条件；强制命令用于开发排错。

如果 iOS 日志出现 `No task request with identifier com.expo.modules.backgroundtask.processing has been scheduled`，检查是否按当前原生配置运行过 prebuild，并确认任务已在模块作用域定义且在 App 生命周期中注册。

## 过期监听：系统准备结束后台执行时保存状态

iOS 运行中的 worker 可能在完成前被系统中断。`addExpirationListener(listener)` 会在执行窗口即将结束时通知，可用于释放资源、保存部分进度；过期之后系统会重新安排 worker。返回值有 `remove()` 方法，页面卸载或监听不再需要时应移除：

```ts
import * as BackgroundTask from 'expo-background-task';

const expirationSubscription = BackgroundTask.addExpirationListener(() => {
  savePartialProgress();
  closeOpenResources();
});

// 不再监听时
expirationSubscription.remove();
```

这个事件仅在 iOS 提供。

## API、选项与状态

| 接口 | 作用 |
| --- | --- |
| `TaskManager.defineTask(taskName, taskExecutor)` | 在模块级定义异步处理器，必须早于注册。 |
| `BackgroundTask.getStatusAsync()` | 返回系统状态：native 通常为 `Available` 或 `Restricted`；Web 固定返回 `Restricted`；不可用时可能是 `null`。 |
| `BackgroundTask.registerTaskAsync(taskName, options?)` | 注册并持久保存任务，App 再次启动时恢复。 |
| `BackgroundTask.unregisterTaskAsync(taskName)` | 取消指定注册。 |
| `BackgroundTask.triggerTaskWorkerForTestingAsync()` | 开发环境触发 worker，返回 `Promise<boolean>`；production 不可用。 |
| `BackgroundTask.addExpirationListener(listener)` | iOS 临近系统中止时发事件，返回带 `remove()` 的订阅句柄。 |
| `TaskManager.isTaskRegisteredAsync(taskName)` | 查询给定名字的 JS task 是否已注册。 |

`BackgroundTaskOptions` 当前包含 `minimumInterval?: number`，单位为**分钟**。默认大约 12 小时；最短 15 分钟，但它仍是调度约束而不是准点承诺。系统可基于省电将执行推迟，iOS 短间隔尤其常被忽略。

| 枚举 | 值 | 含义 |
| --- | --- | --- |
| `BackgroundTaskResult.Success` | `1` | 任务成功。 |
| `BackgroundTaskResult.Failed` | `2` | 任务失败。 |
| `BackgroundTaskStatus.Restricted` | `1` | 当前不可使用后台任务。 |
| `BackgroundTaskStatus.Available` | `2` | 当前系统允许安排后台任务。 |

## 页面代码主题覆盖

官方示例已按主题重写：四种包管理器安装；手动 iOS Info.plist 两个键；顶层定义任务与成功 / 失败结果、注册 / 注销、Hook 状态 UI；手动触发测试按钮；Android `dumpsys jobscheduler` 检查和强制执行命令 / 输出字段；TaskManager expiration listener 及清理订阅。页面 API 的方法、单 worker / 多任务策略、间隔语义、状态与结果枚举、iOS 实体设备限制和 prebuild 故障提示也一并覆盖。

**来源：**[Expo BackgroundTask · Latest](https://docs.expo.dev/versions/latest/sdk/background-task/) · [Expo BackgroundTask · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/background-task/)

**翻页：**[上一页：Expo SDK BackgroundFetch（已弃用）](./137-Expo-SDK-BackgroundFetch.md) · [目录](./README.md) · [下一页：Expo SDK Barometer](./139-Expo-SDK-Barometer.md)
