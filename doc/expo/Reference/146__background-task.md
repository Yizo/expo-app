# Expo BackgroundTask 学习指南

> 原文档对应 **下一版本 Expo SDK** 的未发布文档，修改日期为 **2026 年 5 月 26 日**。当前稳定版本请参考 Expo SDK 56 的对应文档。本文严格依据所提供的原文整理。

## 文档解决的问题

`expo-background-task` 用于在应用进入后台后，执行可以延迟完成的 JavaScript 任务，例如：

- 与服务器同步数据
- 预取新内容
- 检查 `expo-updates` 是否存在更新
- 执行不要求立即完成的后台处理

它解决的不是“每隔固定时间准确运行一次代码”，而是：

> 将任务交给 iOS 或 Android，由操作系统在满足电量、网络和系统调度条件时选择合适的执行时间。

因此，它适用于允许延迟、允许执行时间存在误差的工作，不适合依赖精确定时或立即执行的业务。

## 阅读前需要理解的背景知识

### 后台任务是什么

在 React Web 中，只要页面被关闭，页面中的 JavaScript 通常就不再运行。移动应用也有类似限制：应用进入后台后，React 组件和普通 JavaScript 代码不能假定会持续执行。

后台任务是脱离当前页面和 React 组件生命周期，由操作系统择机启动的一小段工作。

这里的“后台”不表示应用拥有一个永久运行的 JavaScript 进程。真正负责调度的是原生平台：

| 平台 | 底层调度 API |
| --- | --- |
| Android | `WorkManager` |
| iOS | `BGTaskScheduler` |

Expo 使用 `expo-task-manager` 执行最终的 JavaScript 任务。

### 可延迟不等于定时执行

文档将后台任务称为 **deferrable unit of work**，即“可以延迟的工作单元”。

假设设置：

```ts
minimumInterval: 60
```

它表示任务在至少 60 分钟后才具备再次执行的可能，并不表示每 60 分钟准时执行。操作系统可以因为电量、网络、用户使用习惯等因素继续推迟任务。

### Expo、React Native 和原生配置

- **React Native**：使用 JavaScript/TypeScript 编写跨平台移动应用，但最终仍运行在 iOS 和 Android 原生应用中。
- **Expo**：在 React Native 之上提供模块、构建工具和统一 API。
- **原生配置**：iOS 的 `Info.plist`、Android 的包名等配置不属于 React 组件代码，而属于最终生成的原生工程。
- **CNG（Continuous Native Generation）**：Expo 根据应用配置生成原生工程的工作流。使用 CNG 时，一些原生配置可以由 Expo 自动写入。
- **prebuild**：根据 Expo 配置生成或更新 `ios`、`android` 原生工程，使配置插件的修改真正进入原生应用。

## 运行机制

### 任务何时运行

注册任务后，系统不会立即执行它。任务需要同时满足以下条件：

- 已超过设置的最小执行间隔
- 设备电量足够，或者正在充电
- 网络可用
- 操作系统认为当前适合执行

实际行为由操作系统决定，并且可能因平台和设备而异。

### 任务何时停止或恢复

文档说明：

- 用户主动杀死应用后，后台任务会停止；重新启动应用后恢复。
- 如果应用被系统终止，或者设备重启，后台任务会恢复，并且应用会被重新启动。
- Android 从最近任务列表移除应用，通常不代表彻底终止应用。
- iOS 从应用切换器中划掉应用，会彻底终止应用。

Android 厂商可能修改系统行为。部分设备会将“从最近任务列表移除”视为杀死应用，因此不能假定所有 Android 设备的行为完全一致。

## 平台差异

### Android

Android 使用 `WorkManager`：

- 最小间隔不能低于 15 分钟。
- 超过最小间隔后，任务只是具备运行资格。
- 是否真正执行仍取决于电量、网络和系统约束。
- 不同设备厂商可能增加额外的后台限制。

### iOS

iOS 使用 `BGTaskScheduler`：

- 系统会综合电量、网络和用户使用习惯安排任务。
- 可以提供最小间隔，但 iOS 可以将任务推迟到更晚。
- 较短的间隔经常会被忽略。
- 系统可能只在特定时间窗口执行任务，例如夜间。
- 系统可以在任务执行过程中随时中断任务。

### iOS 模拟器限制

iOS 的 Background Tasks API 不能在模拟器上使用，只能在真机上运行。

这意味着 iOS 后台任务不能只依靠模拟器完成验证，必须准备物理设备。

### Web 平台

API 方法列表主要标注支持 Android、iOS 和 tvOS。`getStatusAsync()` 在 Web 上始终返回：

```ts
BackgroundTaskStatus.Restricted
```

因此，这不是浏览器后台任务方案，不能将它理解为 Web Worker、Service Worker 或浏览器定时器的替代品。

## 安装

根据包管理器选择命令：

```sh
# npm
npx expo install expo-background-task

# yarn
yarn expo install expo-background-task

# pnpm
pnpm expo install expo-background-task

# bun
bun expo install expo-background-task
```

`expo install` 会根据当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的裸 React Native 工程中使用，需要先安装和配置 `expo` 模块支持。仅安装 `expo-background-task` 不一定足够。

## iOS 原生配置

iOS 需要在 `Info.plist` 中配置两个项目：

```xml
<key>UIBackgroundModes</key>
<array>
  <string>processing</string>
</array>
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
  <string>com.expo.modules.backgroundtask.processing</string>
</array>
```

它们的作用分别是：

| 配置 | 作用 |
| --- | --- |
| `UIBackgroundModes` 中的 `processing` | 声明应用需要后台处理能力 |
| `BGTaskSchedulerPermittedIdentifiers` | 向 iOS 注册允许调度的后台任务标识符 |
| `com.expo.modules.backgroundtask.processing` | Expo BackgroundTask 使用的原生任务标识符 |

使用 CNG 时，prebuild 会自动应用这些配置。

未使用 CNG 时，需要手动修改 `Info.plist`。这类配置属于原生构建配置，不是运行时 JavaScript 配置。

## 定义、注册与执行任务

后台任务分为两个不同步骤：

1. 使用 `TaskManager.defineTask()` 定义 JavaScript 执行逻辑。
2. 使用 `BackgroundTask.registerTaskAsync()` 将任务注册给操作系统。

只定义而不注册，系统不会调度任务；只尝试注册一个未定义的任务，也不符合 API 要求。

### 在全局作用域定义任务

```tsx
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_TASK_IDENTIFIER = 'background-task';

TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    console.log(
      `Got background task call at date: ${new Date().toISOString()}`
    );

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('Failed to execute the background task:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
```

`defineTask()` 必须在模块的全局作用域调用，不能放进 React 组件、`useEffect` 或事件处理函数。

原因是后台任务可能在对应界面没有渲染时由系统启动。此时不能依赖某个组件先挂载，再定义任务。

这与 React Web 中把逻辑写进组件生命周期的习惯不同。后台任务入口必须在加载模块时即可完成定义。

### 注册任务

```ts
await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER);
```

也可以传入选项：

```ts
await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {
  minimumInterval: 60,
});
```

注册操作不要求位于全局作用域，可以从组件、按钮事件或其他业务流程中调用。

注册信息会保存到持久化存储，并在应用初始化后恢复。因此，注册并不只是当前 React 组件状态中的临时信息。

### 注销任务

```ts
await BackgroundTask.unregisterTaskAsync(
  BACKGROUND_TASK_IDENTIFIER
);
```

注销后，与该名称匹配的任务不会再被调度执行。注销操作同样可以从 React 组件中调用。

### 返回执行结果

任务执行函数应返回：

```ts
BackgroundTask.BackgroundTaskResult.Success
```

或者：

```ts
BackgroundTask.BackgroundTaskResult.Failed
```

枚举值如下：

| 枚举 | 数值 | 含义 |
| --- | ---: | --- |
| `Success` | `1` | 任务执行成功 |
| `Failed` | `2` | 任务执行失败 |

不要让异常未经处理地离开任务执行函数。应捕获错误并明确返回 `Failed`。

## 查询服务和注册状态

### 查询 BackgroundTask 是否可用

```ts
const status = await BackgroundTask.getStatusAsync();
```

返回值可能是：

| 状态 | 数值 | 含义 |
| --- | ---: | --- |
| `Restricted` | `1` | 后台任务不可用 |
| `Available` | `2` | 后台任务可用 |

返回类型还允许 `null`，表示状态不可获取。

文档说明原生平台返回 `Available`，Web 返回 `Restricted`。

### 查询特定任务是否已经注册

```ts
const isRegistered =
  await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_TASK_IDENTIFIER
  );
```

这与 `getStatusAsync()` 检查的不是同一件事：

- `getStatusAsync()`：当前平台的后台任务能力是否可用。
- `isTaskRegisteredAsync()`：指定名称的任务是否已经注册。

实际界面中可以根据两者分别决定是否禁用按钮，以及显示“注册”还是“取消注册”。

## `BackgroundTaskOptions`

注册任务时可以传入：

```ts
type BackgroundTaskOptions = {
  minimumInterval?: number;
};
```

### `minimumInterval`

表示两次后台任务之间不精确的最小间隔，单位为分钟。

关键规则：

- 默认值为 12 小时。
- 最小值为 15 分钟。
- 设置值只是最小延迟，不是准确周期。
- 最终间隔可能更长，以减少设备唤醒和电量消耗。
- iOS 经常忽略较短间隔，并在系统选择的时间窗口运行任务。

因此，不应使用它实现倒计时、准点提醒、严格轮询或必须在特定时刻发生的业务。

## 多个后台任务

虽然可以定义多个 JavaScript 后台任务，但 Expo 在两个平台上都只使用一个原生 worker。

原因是 iOS Background Tasks API 和 Android WorkManager 都限制单个应用可调度的任务数量。

这会产生两个重要影响：

- 多个 JavaScript 任务最终都通过同一个原生 worker 运行。
- 最后注册的后台任务决定整个 worker 的最小执行间隔。

例如，先注册一个 12 小时任务，再注册一个 30 分钟任务，最后注册的任务会影响统一 worker 的最小间隔。不能把每个 JavaScript 任务理解为拥有完全独立的原生定时器。

## iOS 任务到期处理

iOS 提供：

```ts
const subscription =
  BackgroundTask.addExpirationListener(() => {
    // 清理资源或保存状态
  });
```

取消监听：

```ts
subscription.remove();
```

iOS 后台任务可能运行数分钟，但系统可以随时中断。到期监听器适合用于：

- 保存当前处理进度
- 释放资源
- 将未完成状态写入持久化存储
- 停止正在进行的工作

到期处理器被调用后，主任务 runner 会自动重新调度。

不能假设后台函数一定拥有充足时间执行完整批次。任务逻辑应能够处理中途停止。

## 开发环境测试

可以在开发模式下主动触发已注册任务：

```tsx
import * as BackgroundTask from 'expo-background-task';

await BackgroundTask.triggerTaskWorkerForTestingAsync();
```

该方法：

- Android 上会直接运行所有已注册任务。
- iOS 上会调用 `BGTaskScheduler`。
- 只在开发或 debug 构建中可用。
- 生产构建中不可用。
- 返回 `Promise<boolean>`。

它用于避免等待操作系统自然调度，但不能证明生产环境会在某个精确时间执行任务。

## Android 调试

文档建议使用 Android SDK 中的 `adb` 查看 JobScheduler 状态：

```sh
adb shell dumpsys jobscheduler | grep -A 40 -m 1 -E "JOB #.* "
```

需要结合应用在 app config 中配置的 Android package name 查找对应任务。

输出中的重要字段包括：

| 字段 | 含义 |
| --- | --- |
| `JOB #.../275` | Job ID，示例中为 `275` |
| `Required constraints` | 任务必须满足的条件 |
| `Satisfied constraints` | 当前已满足的条件 |
| `Unsatisfied constraints` | 当前尚未满足的条件 |
| `Enqueue time` | 任务已入队多久 |
| `Run time: earliest` | 最早可能运行的时间 |
| `Ready` | 任务当前是否可以运行 |

如果看到：

```text
Unsatisfied constraints: TIMING_DELAY
```

表示最小等待时间尚未结束。

强制运行前，需要先把应用切到后台，因为应用位于前台时任务不会运行。

原文给出的强制执行命令为：

```sh
adb shell cmd jobscheduler run -f
```

但原文同时说明命令应使用前一步找到的 `JOB_ID`，示例命令本身却没有包含包名和 Job ID。这里存在参数说明与示例不完整的问题。执行时应以当前 Android SDK 的 `jobscheduler` 命令格式为准，不能直接假定该示例是完整命令。

## iOS 调试与常见错误

iOS 没有类似 `adb` 的后台任务检查工具。文档建议在 debug 模式中调用：

```ts
await BackgroundTask.triggerTaskWorkerForTestingAsync();
```

如果 Xcode 控制台出现：

```text
No task request with identifier com.expo.modules.backgroundtask.processing has been scheduled
```

文档给出的排查方向是：

1. 运行 prebuild，将后台任务配置应用到原生工程。
2. 确认已经通过 `TaskManager.defineTask()` 定义任务。
3. 确认已经通过 `registerTaskAsync()` 注册任务。

仅修改 JavaScript 代码不能补齐缺失的 iOS 原生配置。原生配置发生变化后，需要重新生成并构建应用。

## API 速查

### `getStatusAsync()`

```ts
BackgroundTask.getStatusAsync()
```

查询后台任务 API 的可用状态。

返回：

```ts
Promise<BackgroundTaskStatus | null>
```

### `registerTaskAsync()`

```ts
BackgroundTask.registerTaskAsync(taskName, options?)
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `taskName` | `string` | 已通过 `TaskManager.defineTask()` 定义的任务名称 |
| `options` | `BackgroundTaskOptions` | 可选注册配置，默认为 `{}` |

返回：

```ts
Promise<void>
```

### `unregisterTaskAsync()`

```ts
BackgroundTask.unregisterTaskAsync(taskName)
```

取消指定名称的后台任务。

返回：

```ts
Promise<void>
```

### `triggerTaskWorkerForTestingAsync()`

```ts
BackgroundTask.triggerTaskWorkerForTestingAsync()
```

仅在开发/debug 构建中主动触发 worker。

返回：

```ts
Promise<boolean>
```

### `addExpirationListener()`

```ts
BackgroundTask.addExpirationListener(listener)
```

仅支持 iOS，用于监听系统即将终止后台执行的情况。

返回：

```ts
{ remove: () => void }
```

## React Web 开发者最容易误解的地方

### 它不是 `setInterval`

下面这种理解是错误的：

```ts
minimumInterval: 15
// 错误理解：每隔 15 分钟准时执行
```

正确理解是：至少等待 15 分钟后，操作系统可能在未来某个合适时机执行。

### 任务不能依赖组件生命周期

后台任务触发时，相关页面可能根本没有挂载。因此任务定义不能依赖：

- 组件 state
- `useEffect`
- React Context 必须已完成初始化
- 某个界面当前可见
- 用户仍停留在原页面

需要使用数据库、文件或 AsyncStorage 等持久化机制保存任务所需状态。

### 注册任务不等于执行任务

`registerTaskAsync()` 只是告诉系统以后可以调度该任务。调用成功不表示任务已经运行，也不表示马上会运行。

### 应用进程并非一直存在

移动端后台任务由原生系统调度。系统可能启动、停止或重新启动应用进程，不能依赖长期保存在内存中的变量。

### 多任务不等于多个独立调度器

多个 JavaScript 任务共享一个原生 worker，并且最后注册的任务决定最小间隔。设计任务频率时必须统一考虑，而不是分别把它们当作独立 cron job。

## 注意事项和限制

1. 后台任务执行时间不精确，可能被显著推迟。
2. Android 的最小间隔为 15 分钟，默认间隔为 12 小时。
3. iOS 可能忽略较短间隔。
4. 电量不足、无网络或系统约束未满足时，任务不会执行。
5. 用户主动杀死应用后，任务停止，直到应用重新启动。
6. Android 厂商可能实施不同的进程终止和省电策略。
7. iOS 模拟器不支持 Background Tasks API，必须使用真机。
8. iOS 可以随时中断正在运行的任务。
9. 测试触发 API 不能用于生产构建。
10. Web 平台始终报告 `Restricted`。
11. 多个任务共享单个 worker。
12. iOS 原生配置缺失时，需要运行 prebuild 或手动修改 `Info.plist`。
13. 原文没有给出后台任务可运行时长的固定保证，也没有给出任务自然执行的最大延迟。
14. 当前文档未涉及失败任务的自动重试策略、任务执行顺序、并发规则以及数据传参机制，不应自行假定这些行为。

## 实际开发建议

以下内容为根据文档机制整理的开发建议。

### 选择允许延迟的业务

**基于文档内容推导：** 适合后台同步、缓存刷新、内容预取等即使晚一些执行也不会破坏业务正确性的任务。

支付确认、准点提醒或必须立刻上传的数据，不应只依赖此 API。

### 让任务可以重复执行

**基于经验建议：** 系统调度、应用重启和异常恢复可能使执行时机难以预测。任务应尽量具有幂等性，即重复执行不会产生重复订单、重复写入等错误。

### 持久化任务进度

**基于文档内容推导：** 由于 iOS 可以中断任务，且应用进程并非持续存在，应将关键进度写入持久化存储，而不是只保存在内存变量中。

### 控制单次工作量

**基于经验建议：** 将大任务拆成可恢复的小批次。每完成一批就保存进度，以便系统中断后继续处理。

### 同时记录业务日志和任务结果

**基于经验建议：** 至少记录任务开始时间、结束时间、处理数量、失败原因和上次成功时间。仅返回 `Success` 或 `Failed` 不足以排查真实设备上的调度问题。

### 在真机上验证平台行为

**基于文档明确说明：** iOS 必须使用真机验证。Android 还应覆盖存在严格省电策略的厂商设备，因为不同厂商的后台限制可能不同。

## 总结

`expo-background-task` 是对 Android `WorkManager` 和 iOS `BGTaskScheduler` 的 Expo 封装，并通过 `expo-task-manager` 执行 JavaScript 任务。

使用时应掌握四个关键步骤：

1. 在全局作用域通过 `TaskManager.defineTask()` 定义任务。
2. 通过 `registerTaskAsync()` 注册任务并设置可选的最小间隔。
3. 正确配置 iOS 后台能力，并在需要时运行 prebuild。
4. 在开发构建和真机上测试，同时接受系统拥有最终调度权。

最重要的设计前提是：后台任务只能保证“条件合适时择机执行”，不能保证“按照指定时间准时执行”。

---

## 文档导航

- **上一页**：[background fetch](./145__background-fetch.md)
- **下一页**：[barometer](./147__barometer.md)
