# Expo BackgroundFetch 学习笔记

> `expo-background-fetch` 用于让应用进入后台后，周期性执行少量代码，例如拉取新数据并更新应用状态。  
> **该库已经废弃，不再接收补丁，并将在后续版本中移除。新项目应改用 `expo-background-task`。**

## 文档解决的问题

移动应用进入后台后，JavaScript 通常不能像网页中的定时器那样持续运行。操作系统会暂停应用，以减少耗电和资源占用。

`expo-background-fetch` 提供了一套 Android 和 iOS API，使开发者可以：

1. 定义需要在后台执行的任务。
2. 向操作系统注册该任务。
3. 在系统允许的时间执行数据获取等操作。
4. 查询系统是否允许后台更新。
5. 注销不再需要的任务。

适合的典型场景包括：

- 定期检查服务端是否有新数据。
- 在应用重新进入前台前更新少量本地数据。
- 执行耗时较短、允许延迟的后台同步。

它不适合：

- 要求精确时间触发的定时任务。
- 需要持续运行的后台服务。
- 应用被终止后仍必须可靠执行的关键任务。
- 超过几十秒的长时间计算或网络操作。

## 当前状态与平台支持

| 项目 | 说明 |
| --- | --- |
| npm 包 | `expo-background-fetch` |
| 支持平台 | Android、iOS |
| 底层依赖 | Expo `TaskManager` 原生 API |
| 当前状态 | 已废弃 |
| 替代方案 | `expo-background-task` |
| 文档版本 | 面向下一个 Expo SDK 版本，而不是当前稳定版 |
| 稳定版提示 | 原文指出当前最新稳定文档对应 SDK 56 |

由于该包已经废弃，新项目不应再将它作为首选方案。本文仍然整理其 API，是为了理解已有项目、维护旧代码以及掌握 Expo 后台任务的基本模型。

## React Web 开发者需要先理解的背景

### “后台”不是浏览器标签页切到后台

在 React Web 中，即使页面失去焦点，JavaScript 运行环境通常仍然存在，只是浏览器可能限制 `setTimeout` 或 `setInterval` 的执行频率。

在移动端，“应用进入后台”意味着：

- 应用界面不再位于前台。
- 操作系统可能暂停应用进程。
- JavaScript 不能自由持续运行。
- 何时唤醒应用由 Android 或 iOS 决定。

因此，后台抓取不是一个可靠的 JavaScript 定时器。

### `minimumInterval` 不是精确定时器

例如：

```ts
minimumInterval: 60 * 15
```

它表达的是“至少间隔约 15 分钟后，系统可以再次安排任务”，而不是“每 15 分钟准时执行一次”。

实际触发时间可能受以下因素影响：

- 电量和省电策略。
- 系统调度策略。
- 应用使用频率。
- 是否存在网络连接。
- 系统是否希望合并多个应用的唤醒操作。

### Expo Go、开发构建与原生工程

- **Expo Go**：预先安装了一组 Expo 原生能力的通用客户端。
- **Development Build（开发构建）**：为当前项目生成的自定义原生应用，包含项目需要的原生模块和配置。
- **原生工程**：项目中的 `ios`、`android` 工程，由 Xcode 和 Android 构建工具处理。
- **CNG（Continuous Native Generation）**：Expo 根据应用配置自动生成或更新原生工程的流程，常通过 prebuild 完成。

iOS 的 Background Fetch 能力未在 Expo Go 中启用，因此实际使用该功能需要开发构建。

## 安装

根据包管理器选择一个命令：

```sh
# npm
npx expo install expo-background-fetch

# yarn
yarn expo install expo-background-fetch

# pnpm
pnpm expo install expo-background-fetch

# bun
bun expo install expo-background-fetch
```

这里使用 `expo install`，是因为它会按照当前 Expo SDK 选择兼容版本，而不是简单安装 npm 上的任意版本。

如果是在已有的普通 React Native 工程中使用，还需要先安装并配置 `expo`，使工程具备加载 Expo Modules 的能力。

> 当前文档未涉及 `expo-task-manager` 是否需要单独安装，也未提供完整的现有 React Native 工程集成步骤。

## iOS 原生配置

iOS 必须在应用的 `UIBackgroundModes` 数组中加入 `fetch`，否则 Background Fetch 无法正常工作。

### 使用 CNG

使用 Continuous Native Generation 时，prebuild 会自动应用所需的 `UIBackgroundModes` 配置。

### 手动维护 iOS 工程

如果没有使用 CNG，或者手动维护原生 `ios` 工程，则需要添加：

```xml
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
</array>
```

原文配置章节先称该配置位于 `Info.plist`，随后手动配置说明中又写作 `Expo.plist`。两处文件名存在不一致。可以确认的要求是：最终构建出的 iOS 应用配置必须包含 `UIBackgroundModes` 的 `fetch` 值；原文没有进一步解释不同工程中具体应修改哪个文件。

这类 plist 配置类似 Web 项目中的构建配置，但它属于 iOS 应用包的原生元数据，修改后通常需要重新生成或构建原生应用，仅刷新 JavaScript 并不足以应用配置。

## 核心使用流程

后台任务分为两个独立阶段：

1. 使用 `TaskManager.defineTask` 定义任务执行逻辑。
2. 使用 `BackgroundFetch.registerTaskAsync` 向系统注册任务。

两处必须使用完全相同的任务名称。

```ts
const BACKGROUND_FETCH_TASK = 'background-fetch';
```

这个名称可以理解为任务的持久化 ID，而不是 React 组件名或普通函数名。

### 第一步：在全局作用域定义任务

```tsx
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();

  console.log(
    `Got background fetch call at date: ${new Date(now).toISOString()}`
  );

  return BackgroundFetch.BackgroundFetchResult.NewData;
});
```

`defineTask` 必须在全局作用域调用，例如模块顶层，不能放在 React 组件、事件回调或 `useEffect` 中。

原因是后台任务可能在没有渲染当前页面组件的情况下启动。原生系统需要在 JavaScript 模块初始化时就能找到任务定义。

这与 React Web 中“组件挂载后再注册副作用”的习惯不同。这里的任务执行入口不依赖组件生命周期。

### 第二步：注册任务

```tsx
async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
```

注册操作不要求位于全局作用域，可以在 React 组件事件、初始化流程或业务服务中调用。

注册后的任务会保存在持久化存储中，并在应用初始化时恢复。因此，“定义任务”和“注册任务”不能混为一谈：

- 定义任务：声明收到系统回调时执行什么代码。
- 注册任务：告诉系统需要调度这个任务。
- 只定义不注册：系统不会调度。
- 只注册但没有对应定义：运行时无法找到任务执行逻辑。

### 第三步：返回执行结果

任务完成后必须返回一个 `BackgroundFetchResult`：

```ts
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const receivedNewData = await fetchData();

    return receivedNewData
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
```

返回值用于告诉 iOS 本次后台执行是否有效，以便系统优化后续调度。

| 返回值 | 数值 | 含义 |
| --- | ---: | --- |
| `NoData` | `1` | 请求成功，但没有新数据 |
| `NewData` | `2` | 成功获取了新数据 |
| `Failed` | `3` | 尝试获取数据，但执行失败 |

不要在没有获得新数据时一律返回 `NewData`。系统会根据真实结果判断后台执行是否有价值。

### 第四步：查询状态及注册情况

```tsx
const status = await BackgroundFetch.getStatusAsync();

const isRegistered =
  await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
```

这两个查询回答不同问题：

- `getStatusAsync()`：系统是否允许应用执行后台更新。
- `isTaskRegisteredAsync()`：指定名称的任务是否已经注册。

系统允许后台更新，不代表当前任务已经注册；任务已注册，也不代表系统当前一定允许执行。

### 第五步：注销任务

```tsx
async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}
```

注销后，系统不再为该名称的任务安排后续 Background Fetch。

这适用于：

- 用户关闭后台同步。
- 用户退出账号。
- 某项业务功能被禁用。
- 任务配置需要重新建立。

## 注册配置说明

`registerTaskAsync` 接收一个可选的 `BackgroundFetchOptions` 对象：

```ts
await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
  minimumInterval: 60 * 15,
  stopOnTerminate: false,
  startOnBoot: true,
});
```

### `minimumInterval`

类型：`number`，单位为秒。

表示两次后台抓取之间期望的最小间隔，但只是提供给系统的建议值。

| 平台 | 默认行为 |
| --- | --- |
| Android | 默认约 10 分钟 |
| iOS | 默认使用系统支持的最小间隔，约 10～15 分钟 |

最终间隔可能不同于配置值，因为系统会尽量减少设备唤醒和电量消耗。

后台任务不会自动收到业务数据。任务被唤醒后，需要自行发起请求、读取存储并判断是否获得新数据。

### `startOnBoot`

类型：`boolean`，仅支持 Android，默认值为 `false`。

表示设备完成启动后，是否恢复 Background Fetch 事件。

### `stopOnTerminate`

类型：`boolean`，仅支持 Android，默认值为 `true`。

表示用户终止应用后，是否停止接收 Background Fetch 事件。

> 原文存在需要特别注意的不一致：已知问题明确表示，该库在应用被终止或设备重启后不能工作；但 API 又提供了 `stopOnTerminate` 和 `startOnBoot`。文档没有解释两者适用范围或冲突原因。因此不能仅凭这两个选项假定终止后或重启后一定可靠执行。

## 状态枚举

`getStatusAsync()` 返回 `BackgroundFetchStatus`：

| 状态 | 数值 | 含义 |
| --- | ---: | --- |
| `Denied` | `1` | 用户关闭了当前应用或整个系统的后台行为 |
| `Restricted` | `2` | 后台更新不可用，并且用户无法自行重新开启，例如受到家长控制 |
| `Available` | `3` | 当前应用可以使用后台更新 |

状态为 `Available` 只表示功能可用，不表示任务会立即触发，也不表示会按照指定间隔精确触发。

## `setMinimumIntervalAsync`

```ts
await BackgroundFetch.setMinimumIntervalAsync(60 * 15);
```

该方法设置两次后台抓取之间的全局最小秒数。

需要注意：

- 该值只是建议值，不代表精确执行间隔。
- 在 Android 上调用没有效果。
- 它是全局值。
- 在 Expo Go 中，它可能覆盖通过同一个 Expo Go 打开的其他应用设置。
- `registerTaskAsync` 的 iOS `minimumInterval` 配置会在内部调用此方法。

该方法已经废弃。迁移到 `expo-background-task` 后，应通过其 `registerTaskAsync` 和 `BackgroundTaskOptions` 配置间隔。

## 后台任务的时间限制

应用最多有 **30 秒**执行后台任务。超过时间后：

- 应用可能被系统终止。
- 后续后台抓取可能被延迟。

因此任务应尽量保持轻量：

- 发起必要的网络请求。
- 处理少量数据。
- 更新本地缓存或持久化存储。
- 及时返回正确的结果枚举。

不应在其中执行大型计算、长时间轮询或无法控制结束时间的操作。

## 测试后台抓取

后台任务由操作系统调度，触发时间不稳定，因此普通等待测试可能很低效。

### Android

开发阶段可以将 `minimumInterval` 调小，然后将应用切换到后台：

```tsx
async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 1 * 60,
  });
}
```

这里的注释表示任务会在应用进入后台约一分钟后触发，但结合该参数“非精确间隔”的定义，不应将一分钟理解为严格保证。

### iOS

原文给出的手动触发流程是：

1. 在 macOS 打开 Instruments。
2. 选择 `Time Profiler`。
3. 选择设备或模拟器以及 Expo Go。
4. 点击左上角的 `Record`。
5. 在 `Document` 菜单中选择 `Simulate Background Fetch - Expo Go`。

不过，同一文档也明确指出 iOS Expo Go 没有启用 Background Fetch，必须使用开发构建。这两部分说明存在冲突，可能是测试步骤尚未随开发构建要求更新。原文没有给出针对开发构建的替代操作步骤，因此本文不进一步推测。

## 已知限制与坑点

### 只能在应用处于后台时工作

原文的已知问题明确说明：

- 应用处于后台时可以工作。
- 应用被终止后不能工作。
- 设备重启后不能工作。

因此它不是可靠的离线任务调度系统。对于必须在应用关闭后仍完成的业务，当前文档没有提供解决方案。

### 系统决定真正的执行时间

`minimumInterval` 只是建议值。即使设置为 15 分钟，系统也可能更晚执行。

不要用它实现：

- 整点提醒。
- 严格的周期上报。
- 精确到分钟的同步。
- 对执行时限有业务承诺的任务。

### iOS 需要开发构建和原生配置

仅安装 npm 包并编写 JavaScript 不足以让 iOS 后台抓取工作，还需要：

- 使用 Development Build。
- 在最终 iOS 配置中启用 `UIBackgroundModes: fetch`。
- 修改原生配置后重新构建应用。

### Android 配置不适用于 iOS

`startOnBoot` 和 `stopOnTerminate` 是 Android 专属配置。在跨平台代码中保留它们不会让 iOS 获得对应能力。

### 注册持久化不等于执行可靠

任务注册信息会持久化并在应用初始化时恢复，但这只说明 Expo 能记住注册状态，不代表操作系统一定会按期执行任务。

### 包已经废弃

`getStatusAsync`、`registerTaskAsync`、`setMinimumIntervalAsync` 和 `unregisterTaskAsync` 均已标记为废弃，并分别指向 `expo-background-task` 中的替代 API。

维护旧项目时可以继续理解和识别这些调用，但新功能应优先评估迁移。

## Android 自动添加的权限

该模块会自动添加两个 Android 权限：

| 权限 | 作用 |
| --- | --- |
| `RECEIVE_BOOT_COMPLETED` | 接收设备完成启动后的系统广播，用于支持与 `startOnBoot` 相关的行为 |
| `WAKE_LOCK` | 临时阻止处理器过快休眠，以提高后台任务可靠性 |

这意味着开发者通常不需要手动将它们加入 Android Manifest。

权限的开发影响包括：

- 应用具备监听设备启动完成事件的声明能力。
- 应用可以在执行相关任务时保持处理器唤醒。
- 使用这些能力可能影响电量，因此系统仍会控制后台调度。

当前文档没有涉及运行时权限申请，因为这两个权限由模块自动添加，并不是这里需要通过弹窗向用户动态申请的权限。

## React Web 开发者最容易误解的地方

### 不要用 `setInterval` 的思维理解它

Web 中的定时器由当前 JavaScript 运行环境调度；Background Fetch 则由移动操作系统决定是否以及何时唤醒应用。

### 任务定义不能依赖页面是否挂载

`TaskManager.defineTask` 必须放在模块全局作用域。后台回调发生时，用户可能根本没有打开对应页面。

因此任务函数不应依赖：

- 某个页面组件的 state。
- 某个组件已经执行 `useEffect`。
- 页面导航到特定路由。
- 某个组件内创建的临时闭包数据。

### 注册成功不等于马上执行

`registerTaskAsync` 的 `Promise<void>` 成功，只表示注册完成，不表示任务已经执行或即将立即执行。

### 后台任务不等于 Service Worker

它与 Web 的 Service Worker 都可能在页面不可见时工作，但生命周期、调度方式和平台保证不同，不能直接套用 Service Worker 的行为预期。

## 实际开发中的使用方式

以下结论均为**基于文档内容推导**：

1. 将任务名称定义为稳定常量，避免定义和注册使用不同字符串。
2. 在应用入口可加载的模块中调用 `TaskManager.defineTask`，确保后台启动时可以找到任务。
3. 将注册和注销封装成普通异步函数，由设置页面、登录流程或功能开关调用。
4. 任务内部捕获异常，并准确返回 `NewData`、`NoData` 或 `Failed`。
5. 将单次任务控制在 30 秒以内，不把后台抓取设计成长时间常驻进程。
6. UI 中同时展示系统状态和任务注册状态，避免把二者混为一个布尔值。
7. 不要将业务正确性建立在精确触发时间上。
8. 新项目直接评估 `expo-background-task`，旧项目则制定迁移计划。

**基于经验建议：** 后台任务中的关键步骤应记录时间、执行结果和错误信息，并写入可持久化的位置。仅依赖开发控制台日志，可能难以排查真机上由系统触发的间歇性问题。

## 文档明确说明与推导内容

### 文档明确说明

- 包支持 Android 和 iOS。
- 包已废弃，将由 `expo-background-task` 替代。
- 底层使用 `TaskManager` 原生 API。
- 任务定义必须位于全局作用域。
- 注册和注销可以在 React 组件相关代码中调用。
- 注册信息会持久化，并在应用初始化时恢复。
- `minimumInterval` 不是精确间隔。
- iOS 需要启用 `UIBackgroundModes` 中的 `fetch`。
- iOS 不能使用 Expo Go，需要开发构建。
- 后台任务最多可执行 30 秒。
- Android 自动添加 `RECEIVE_BOOT_COMPLETED` 和 `WAKE_LOCK`。
- 已知问题指出应用终止后及设备重启后不能执行。

### 基于文档内容推导

- 不能依靠该 API 实现严格定时业务。
- 任务逻辑不应依赖 React 组件生命周期或临时 state。
- 注册状态、系统可用状态和实际执行状态是三个不同概念。
- 对应用关闭后仍必须执行的关键任务，该库缺乏足够的可靠性保证。
- 新项目继续采用该包会增加后续迁移和维护成本。

## 总结

`expo-background-fetch` 的核心模型是：在全局作用域定义任务，再向操作系统注册该任务，由系统在应用处于后台时择机执行。

掌握该 API 时最重要的不是记住函数名称，而是理解移动端后台调度的限制：

- 调度时间不精确。
- 执行机会由系统控制。
- 单次执行最多约 30 秒。
- iOS 需要开发构建和原生后台模式配置。
- 应用终止或设备重启后的执行存在明确限制。
- 该包已经废弃，新开发应转向 `expo-background-task`。

---

## 文档导航

- **上一页**：[auth session](./144__auth-session.md)
- **下一页**：[background task](./146__background-task.md)
