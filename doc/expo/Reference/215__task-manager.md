# Expo TaskManager 学习指南

`expo-task-manager` 是 Expo 提供的后台任务管理库。它允许应用定义可由原生系统触发的 JavaScript 任务，尤其适用于应用进入后台后仍需处理的工作。

> 本文对应 Expo **下一个 SDK 版本**的未正式发布文档，原文建议需要稳定、最新版本信息时参考 SDK 56 文档。

## 文档解决的问题

在 React Web 中，JavaScript 通常依赖浏览器页面运行。页面关闭后，相关逻辑一般不会继续执行。

移动应用则存在另一类需求：

- 应用进入后台后继续接收位置更新
- 响应地理围栏事件
- 执行系统调度的后台任务
- 处理后台通知

`expo-task-manager` 解决的核心问题是：**定义和管理这些可由移动端原生系统触发的 JavaScript 任务。**

它主要提供：

- 定义任务执行函数
- 查询任务是否已定义或注册
- 查询任务的注册配置
- 获取所有已注册任务
- 注销一个或全部任务

需要注意，`TaskManager` 主要负责通用的任务管理机制。位置监听、后台调度和通知等具体任务，通常由对应的 Expo 功能库负责注册和停止。

## 适用场景

文档明确列出了以下依赖 `TaskManager` 的 Expo SDK 库：

| 功能库 | 典型用途 |
| --- | --- |
| `expo-location` | 后台位置更新和地理围栏 |
| `expo-background-task` | 系统调度的后台工作 |
| `expo-background-fetch` | 后台获取数据 |
| `expo-notifications` | 处理通知，包括后台远程通知 |

因此，在实际开发中，你通常不会单独使用 `TaskManager` 启动某类后台能力，而是：

1. 使用 `TaskManager.defineTask()` 定义任务收到事件后执行什么逻辑。
2. 使用具体功能库注册或启动任务。
3. 由操作系统在满足条件时触发任务。

## React Web 开发者需要先理解的概念

### 前台、后台和未激活状态

移动应用具有不同的运行状态：

- `active`：应用位于前台，用户正在使用。
- `background`：应用已经进入后台。
- `inactive`：应用暂时处于非活动状态。本文档中的该状态信息仅支持 iOS。

后台任务并不表示应用拥有一个像服务器进程一样永久运行的 JavaScript 环境。原生系统会根据任务类型和系统状态启动或唤醒应用，并执行已经定义的任务。

### 定义任务与注册任务是两件事

这是本文最重要的概念。

**定义任务**是提供 JavaScript 执行函数：

```ts
TaskManager.defineTask(TASK_NAME, taskExecutor);
```

**注册任务**是告诉原生系统需要监听或调度这类任务。例如后台位置任务通过以下方法注册：

```ts
Location.startLocationUpdatesAsync(TASK_NAME, options);
```

两者通过相同的 `taskName` 关联。

可以将它类比为 React Web 开发中的事件系统：

- `defineTask()` 类似准备事件处理函数。
- `startLocationUpdatesAsync()` 类似真正订阅事件。
- 操作系统触发任务类似运行时派发事件。

不过，后台任务的注册信息会持久化，并且任务可能在没有挂载任何 React 组件的情况下执行。

### 已定义与已注册的区别

`TaskManager` 为这两个状态分别提供了查询方法：

```ts
TaskManager.isTaskDefined(taskName);
TaskManager.isTaskRegisteredAsync(taskName);
```

| 状态 | 含义 | 是否持久化 |
| --- | --- | --- |
| 已定义 | 当前 JavaScript bundle 已加载任务执行函数 | 文档未说明持久化 |
| 已注册 | 任务已经通过某个功能库注册到应用中 | 是，跨应用会话保留 |

**基于文档内容推导：** 一个任务可能已经在 JavaScript 中定义，但尚未注册到原生系统；也可能原生注册信息仍然存在，但本次启动没有正确加载任务定义。因此，任务名称和模块加载位置必须保持稳定。

### 模块作用域

模块作用域指 React 组件和普通函数之外、模块加载时直接执行的位置：

```ts
const TASK_NAME = 'background-location-task';

TaskManager.defineTask(TASK_NAME, executor);
```

以下写法不正确：

```tsx
function App() {
  TaskManager.defineTask('my-task', executor);

  return null;
}
```

原因是应用被后台启动时，React 组件不会被挂载。如果任务定义位于组件内部，后台运行环境就无法找到它。

## 安装

根据项目使用的包管理器选择一条命令：

```sh
# npm
npx expo install expo-task-manager

# yarn
yarn expo install expo-task-manager

# pnpm
pnpm expo install expo-task-manager

# bun
bun expo install expo-task-manager
```

这里使用 `expo install`，它会为当前 Expo SDK 选择兼容的包版本。

如果是在已有的原生 React Native 项目中使用，还必须先安装并配置 Expo Modules 所需的 `expo` 包。当前文档没有展开具体安装步骤。

## 原生配置

独立应用在 iOS 上使用后台能力时，需要额外的原生配置。

不同后台功能要求在原生工程的 `Info.plist` 文件中，将对应值加入 `UIBackgroundModes` 数组。

对于没有接触过 iOS 开发的 React Web 开发者：

- `Info.plist` 是 iOS 应用的原生配置文件。
- `UIBackgroundModes` 用于声明应用需要使用哪些后台运行能力。
- 仅在 JavaScript 中调用 API，并不一定足以获得相应的后台能力。

具体需要声明什么值，取决于位置、通知或后台任务等实际功能，应查阅负责注册任务的功能库文档。当前 `TaskManager` 文档没有列出各功能对应的完整配置值。

## 后台位置任务示例

下面的流程展示了 `TaskManager` 与 `expo-location` 如何配合。

### 1. 声明稳定的任务名称

```ts
const LOCATION_TASK_NAME = 'background-location-task';
```

任务定义和位置任务注册必须使用同一个名称。名称不一致时，原生系统无法找到对应的 JavaScript 执行函数。

### 2. 请求权限并注册任务

```ts
const requestPermissions = async () => {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};
```

流程为：

1. 请求前台位置权限。
2. 只有前台权限获批后，才请求后台位置权限。
3. 只有后台权限也获批后，才启动后台位置更新。
4. 注册时传入任务名称和位置精度配置。

`accuracy: Location.Accuracy.Balanced` 属于 `expo-location` 的配置，不是 `TaskManager` 自身的配置。它会作为任务注册选项被保存。

### 3. 在模块作用域定义执行逻辑

```ts
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    return;
  }

  if (data) {
    const { locations } = data;
    // 处理后台捕获的位置
  }
});
```

任务执行函数接收一个对象，其中包括：

- `data`：本次任务事件的数据，具体结构取决于任务类型。
- `error`：任务失败时的错误信息，否则为 `null`。
- `executionInfo`：本次执行的事件 ID、任务名称等信息。

位置任务的 `locations` 字段由 `expo-location` 提供。其他类型任务的 `data` 结构可能完全不同。

## Expo Router 中的任务定义

普通、非 Router 项目可以在屏幕模块顶层调用 `defineTask()`。

Expo Router 项目应采用更明确的加载方式：

1. 将任务定义放入独立文件，例如 `tasks.ts`。
2. 在根布局 `app/_layout.tsx` 顶部导入该文件。
3. 确保导航开始运行之前完成任务注册代码的加载。

例如：

```ts
// tasks.ts
import * as TaskManager from 'expo-task-manager';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    return;
  }

  if (data) {
    // 处理任务数据
  }
});
```

```tsx
// app/_layout.tsx
import '../tasks';

export default function RootLayout() {
  // 返回路由布局
}
```

这里导入 `tasks.ts` 的目的不是使用其导出值，而是让模块顶层的 `defineTask()` 在应用初始化时执行。

## API 方法

使用统一的命名空间导入：

```ts
import * as TaskManager from 'expo-task-manager';
```

### `TaskManager.defineTask(taskName, taskExecutor)`

定义指定名称的任务执行函数。

```ts
TaskManager.defineTask('my-task', async body => {
  // 处理任务
});
```

- `taskName` 必须与注册任务时使用的名称完全相同。
- 必须在 JavaScript bundle 的全局模块作用域调用。
- 不能放在 React 组件内部。
- 返回值为 `void`。
- 支持 Android、iOS 和 tvOS。

### `TaskManager.getRegisteredTasksAsync()`

返回应用当前已经注册的全部任务：

```ts
const tasks = await TaskManager.getRegisteredTasksAsync();
```

返回值类型为：

```ts
Promise<TaskManagerTask[]>
```

每个任务包含：

- `taskName`：注册名称。
- `taskType`：任务类型。
- `options`：注册任务时传入的配置。

适合用于调试、状态检查或诊断重复注册问题。

### `TaskManager.getTaskOptionsAsync(taskName)`

获取指定任务注册时保存的配置：

```ts
const options =
  await TaskManager.getTaskOptionsAsync('background-location-task');
```

这些配置来自注册任务的方法，例如：

```ts
Location.startLocationUpdatesAsync(taskName, options);
```

如果找不到任务，则返回 `null`。

### `TaskManager.isAvailableAsync()`

判断当前环境能否使用 `TaskManager`：

```ts
const available = await TaskManager.isAvailableAsync();
```

平台限制非常重要：

| 环境 | 结果或限制 |
| --- | --- |
| Android Expo Go | `TaskManager` 不可用 |
| iOS Expo Go | 不支持后台执行 |
| Web | 始终返回 `false` |
| Development Build | 文档建议使用，以避开 Expo Go 的限制 |

虽然页面元信息标记了 Expo Go，但这不代表所有平台、所有底层功能都能在 Expo Go 中完整测试。还需要查看位置、通知等具体功能库是否支持 Expo Go。

### `TaskManager.isTaskDefined(taskName)`

同步检查任务执行函数是否已经定义：

```ts
const defined = TaskManager.isTaskDefined('my-task');
```

返回 `boolean`。它检查的是 JavaScript 定义状态，不等同于任务已经向原生系统注册。

### `TaskManager.isTaskRegisteredAsync(taskName)`

检查任务是否已经注册：

```ts
const registered =
  await TaskManager.isTaskRegisteredAsync('my-task');
```

返回 `Promise<boolean>`。

注册信息存储在持久化存储中，可以跨应用会话保留。不要因为应用重新启动就假定任务一定处于未注册状态。

### `TaskManager.unregisterTaskAsync(taskName)`

从应用中注销指定任务：

```ts
await TaskManager.unregisterTaskAsync('my-task');
```

注销后，应用不会再接收该任务的更新。

文档明确建议优先使用注册任务的功能库提供的停止方法。例如位置任务应优先使用：

```ts
await Location.stopLocationUpdatesAsync(taskName);
```

这样可以让任务的启动和停止都由对应功能模块负责。

### `TaskManager.unregisterAllTasksAsync()`

注销当前应用注册的所有任务：

```ts
await TaskManager.unregisterAllTasksAsync();
```

适合用户退出登录后不应再执行位置跟踪或其他后台任务的场景。

该方法会移除所有任务，调用前应确认应用不存在仍需保留的其他后台能力。

## 数据结构

### `TaskManagerTask`

表示一个已经注册的任务：

```ts
interface TaskManagerTask {
  taskName: string;
  taskType: string;
  options: any;
}
```

Expo SDK 库产生的标准 `taskType` 包括：

| 值 | 来源 |
| --- | --- |
| `location` | `expo-location` 位置更新 |
| `geofencing` | `expo-location` 地理围栏 |
| `backgroundFetch` | `expo-background-fetch` |
| `expo-background-task` | Android 上的 `expo-background-task` |
| `backgroundTask` | iOS 上的 `expo-background-task` |
| `remote-notification` | `expo-notifications` |

用户自行注册的任务可以使用其他字符串类型。

### `TaskManagerTaskBody`

任务执行函数接收的数据对象：

```ts
interface TaskManagerTaskBody<T> {
  data: T;
  error: TaskManagerError | null;
  executionInfo: TaskManagerTaskBodyExecutionInfo;
}
```

`data` 的结构由任务类型决定。不能因为某个位置任务包含 `locations`，就假定所有任务都包含该字段。

### `TaskManagerError`

任务失败时的错误对象：

```ts
interface TaskManagerError {
  code: string | number;
  message: string;
}
```

任务执行函数应优先检查 `error`，需要诊断时可读取 `error.message`。

### `TaskManagerTaskBodyExecutionInfo`

提供任务本次执行的附加信息：

```ts
interface TaskManagerTaskBodyExecutionInfo {
  eventId: string;
  taskName: string;
  appState?: 'active' | 'background' | 'inactive';
}
```

- `eventId`：本次任务事件的唯一 ID。
- `taskName`：当前任务名称。
- `appState`：应用状态，仅支持 iOS，因此是可选字段。

### `TaskManagerTaskExecutor`

任务执行函数的类型：

```ts
type TaskManagerTaskExecutor<T> = (
  body: TaskManagerTaskBody<T>
) => Promise<any>;
```

执行函数返回一个 Promise。异步任务应等待必要操作完成，而不是启动异步工作后立即结束执行函数。

## 注意事项与限制

### 后台任务不是无限期运行的进程

文档将该库描述为支持长时间任务，尤其是后台任务，但没有承诺任务可以永久运行，也没有给出执行频率、最长时间或必定触发的保证。

这些调度行为取决于具体功能库和操作系统。当前文档未涉及精确的系统调度规则。

### Expo Go 存在明显限制

不能仅凭前台开发环境正常工作，就判断后台任务已经正确配置：

- Android Expo Go 中 `TaskManager` 不可用。
- iOS Expo Go 不支持后台执行。
- 各功能库还可能有自己的 Expo Go 限制。
- 文档建议使用 Development Build 进行开发和测试。

### Web 平台不可用

`isAvailableAsync()` 在 Web 上始终返回 `false`。因此，这套 API 不能作为浏览器后台任务、Web Worker 或 Service Worker 的替代方案。

对于同时支持 Web 与原生端的项目，应在调用前进行能力判断：

```ts
if (await TaskManager.isAvailableAsync()) {
  // 执行原生端 TaskManager 逻辑
}
```

### iOS 需要原生能力声明

独立应用若缺少对应的 `UIBackgroundModes` 配置，即使 JavaScript 代码正确，也可能无法按预期获得后台能力。

具体配置应以注册任务的功能库文档为准。

### 任务名称必须保持一致

以下位置必须使用相同的任务名称：

- `TaskManager.defineTask()`
- 功能库的任务注册方法
- 查询或注销任务的方法

建议将名称定义成共享常量，避免字符串拼写不一致。

### 注册状态会跨会话保留

`isTaskRegisteredAsync()` 检查的是持久化注册状态。开发时若修改任务逻辑或配置，不应默认重新加载应用就会清除旧任务。

### 优先使用功能库的注销方法

虽然 `TaskManager.unregisterTaskAsync()` 可以直接注销任务，但文档建议使用注册任务的功能库提供的专用停止方法，例如：

```ts
Location.stopLocationUpdatesAsync(taskName);
```

这可以保持功能模块内部状态和通用任务注册状态的一致性。

## 对 React Web 开发者最容易误解的地方

1. **任务不是由 React 组件生命周期驱动。**  
   后台启动时不会挂载组件，因此不能依赖 `useEffect()` 定义任务。

2. **定义任务不等于启动任务。**  
   `defineTask()` 只声明处理逻辑，真正注册通常由 `expo-location` 等功能库完成。

3. **应用重新启动不等于任务被清除。**  
   原生注册信息会跨会话持久保存。

4. **Expo Go 能打开项目不等于支持真实后台执行。**  
   可靠测试通常需要 Development Build，并检查具体功能库的平台限制。

5. **Web 与原生平台的后台机制不同。**  
   `TaskManager` 在 Web 上不可用，不能直接映射为浏览器后台 API。

6. **JavaScript 配置并不是全部。**  
   iOS 后台能力还涉及 `Info.plist` 和系统权限等原生配置。

## 实际开发建议

以下内容是结合文档接口得出的应用方式。

### 建立独立任务模块

**基于文档内容推导：** 将后台任务统一放在独立模块中，并在应用入口尽早导入，可以减少任务因路由或组件未挂载而没有定义的问题。

```text
src/
  tasks/
    location-task.ts
app/
  _layout.tsx
```

### 让任务注册具备幂等检查

**基于经验建议：** 注册前检查当前状态，避免无意中重复注册：

```ts
const registered =
  await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

if (!registered) {
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, options);
}
```

是否允许或需要重复注册仍应以具体功能库文档为准。

### 在退出登录时明确清理

如果后台任务与当前用户身份相关，应在退出登录流程中停止对应任务。只有确认全部后台能力都应移除时，才使用：

```ts
await TaskManager.unregisterAllTasksAsync();
```

否则应调用具体功能库的单任务停止方法。

### 记录任务执行上下文

**基于经验建议：** 调试后台任务时可以记录：

- `executionInfo.eventId`
- `executionInfo.taskName`
- `executionInfo.appState`
- `error.code`
- `error.message`

但日志和持久化操作应避免包含敏感位置或用户隐私数据。

## 当前文档未涉及的内容

本文档没有明确说明以下事项，需要查阅具体功能库或平台文档：

- Android 后台能力所需的具体原生配置
- 各类任务的系统调度频率
- 单次任务允许执行的最长时间
- 操作系统在省电模式下的具体行为
- 应用被用户强制结束后的任务行为
- 后台任务中的网络请求、重试和超时策略
- 各任务类型中 `data` 的完整字段定义
- 生产构建中的权限文案和应用商店审核要求
- tvOS 上各类实际后台任务的功能范围

## 总结

`expo-task-manager` 是 Expo 后台任务体系中的通用管理层。使用它时需要区分三个环节：

1. 在模块作用域通过 `defineTask()` 定义处理函数。
2. 通过 `expo-location` 等具体功能库注册任务。
3. 在不再需要时优先通过对应功能库停止任务。

对于 React Web 开发者，最关键的认知变化是：后台任务不依赖 React 组件是否挂载，而是依赖模块加载时完成的任务定义、持久化的原生注册信息，以及 iOS、Android 操作系统提供的后台执行机制。

---

## 文档导航

- **上一页**：[system ui](./214__system-ui.md)
- **下一页**：[tracking transparency](./216__tracking-transparency.md)
