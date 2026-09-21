# 208｜Expo SDK TaskManager 后台任务

**翻页：**[上一页：Expo SDK SystemUI 系统界面](./207-Expo-SDK-SystemUI.md) · [目录](./README.md) · [下一页：Expo SDK TrackingTransparency 跟踪授权](./209-Expo-SDK-TrackingTransparency.md)

**官方页面：**[TaskManager · Latest](https://docs.expo.dev/versions/latest/sdk/task-manager/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/task-manager/)

**版本与平台：**Latest 推荐 `expo-task-manager ~57.0.17`；SDK v56.0.0 推荐 `~56.0.27`。TaskManager 被 Location、BackgroundTask、BackgroundFetch 和 Notifications 等模块用于执行后台任务。Expo Go 可以测试 TaskManager，但各模块对 Expo Go 的支持不同；Android Expo Go 不提供 TaskManager，iOS Expo Go 不支持后台执行，正式验证请使用 development build。

## 后台任务如何运行

TaskManager 为其它 Expo 模块提供长时间任务的执行入口。触发后台事件时，系统可以重新启动 JavaScript bundle、调用已定义的任务，再在任务结束后关闭 JavaScript 环境；此时不会挂载 React 页面。因此任务必须在 bundle 的**全局作用域**定义，不能放进 React 组件或生命周期方法。

常用的调用模块包括 `expo-location`、`expo-background-task`、旧版 `expo-background-fetch` 和 `expo-notifications`。TaskManager 本身定义任务函数和查看注册状态；具体模块负责请求权限、注册 / 启动后台功能，也决定了 iOS 所需的 `UIBackgroundModes` 配置。

安装：

```sh
npx expo install expo-task-manager
yarn expo install expo-task-manager
pnpm expo install expo-task-manager
bun expo install expo-task-manager
```

## 后台位置更新示例

下面的官方示例使用 `expo-location` 请求前台、后台定位权限，然后注册后台位置更新。示例文件也定义了任务处理函数。请把任务定义保留在模块顶层；React Router 项目可以将任务放入 `tasks.ts`，并在根布局最先导入该文件，确保导航加载前完成注册。

```tsx
import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};

const PermissionsButton = () => (
  <View style={styles.container}>
    <Button onPress={requestPermissions} title="Enable background location" />
  </View>
);

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // 检查 error.message 可了解错误详情。
    return;
  }
  if (data) {
    const { locations } = data;
    // 在这里处理后台采集的位置。
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PermissionsButton;
```

`LOCATION_TASK_NAME` 必须与 `Location.startLocationUpdatesAsync()` 和 `TaskManager.defineTask()` 使用的名称完全一致。页面 / 按钮负责请求权限并启动更新；任务函数只在系统交付后台位置数据时处理 `data` 或 `error`。

## iOS 配置

独立 iOS App 中，每种后台功能都需要在 `Info.plist` 的 `UIBackgroundModes` 数组声明对应系统能力。具体键值因功能而异，请查看使用 TaskManager 的模块（例如 Location 或 BackgroundTask）各自的配置说明；TaskManager 本身不提供一个通用配置值覆盖所有功能。

## API

```ts
import * as TaskManager from 'expo-task-manager';
```

### 方法

| 方法 | 返回类型 | 说明 |
| --- | --- | --- |
| `TaskManager.defineTask(taskName, taskExecutor)` | `void` | 定义任务处理函数；必须在 JavaScript bundle 全局作用域调用。`taskName` 要与负责注册任务的模块使用的名称一致。 |
| `TaskManager.getRegisteredTasksAsync()` | `Promise<TaskManagerTask[]>` | 查询当前应用中已持久化注册的任务清单。 |
| `TaskManager.getTaskOptionsAsync(taskName)` | `Promise<TaskOptions \| null>` | 读取指定任务注册时传给功能模块的 options；任务不存在时为 `null`。 |
| `TaskManager.isAvailableAsync()` | `Promise<boolean>` | 查询当前运行环境能否使用 TaskManager。Web 固定为 `false`；Expo Go 的后台运行能力有限。 |
| `TaskManager.isTaskDefined(taskName)` | `boolean` | 检查当前 bundle 是否已定义该任务。 |
| `TaskManager.isTaskRegisteredAsync(taskName)` | `Promise<boolean>` | 查询任务是否已经注册。已注册信息会持久化，并在 App 后续启动后保留。 |
| `TaskManager.unregisterAllTasksAsync()` | `Promise<void>` | 注销当前应用的所有 TaskManager 任务；例如用户退出登录后不再需要后台定位。 |
| `TaskManager.unregisterTaskAsync(taskName)` | `Promise<void>` | 注销一个任务；通常优先调用注册该任务的模块专用停止方法，例如 `Location.stopLocationUpdatesAsync()`。 |

`getRegisteredTasksAsync()` 的返回结构示例：

```ts
[
  {
    taskName: 'location-updates-task-name',
    taskType: 'location',
    options: {
      accuracy: Location.Accuracy.High,
      showsBackgroundLocationIndicator: false,
    },
  },
  {
    taskName: 'geofencing-task-name',
    taskType: 'geofencing',
    options: {
      regions: [...],
    },
  },
]
```

### 数据类型

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `TaskManagerError` | `code: string \| number`、`message: string` | 后台任务执行失败时提供的错误。 |
| `TaskManagerTask` | `options: any`、`taskName: string`、`taskType: string` | 描述一个已经注册的任务。`taskType` 取决于注册任务的功能模块。 |
| `TaskManagerTaskBody<T>` | `data: T`、`error: TaskManagerError \| null`、`executionInfo: TaskManagerTaskBodyExecutionInfo` | 传入任务执行函数的事件对象；`data` 的字段随任务种类而变化。 |
| `TaskManagerTaskBodyExecutionInfo` | `appState?`、`eventId`、`taskName` | 执行元信息；`appState` 仅 iOS 提供，值为 `'active'`、`'background'` 或 `'inactive'`。 |
| `TaskManagerTaskExecutor<T>` | `(body: TaskManagerTaskBody<T>) => Promise<any>` | 接收任务事件并执行处理逻辑的函数类型。 |

## 新手名词解释

- **后台任务（Background task）：**App 处在后台或没有 React 页面时，由系统唤醒 JavaScript 处理的工作，例如定位更新。
- **任务定义（Define）：**用 `defineTask()` 将名称绑定到处理函数；定义发生在模块加载阶段，不能等用户打开某个组件后才注册。
- **任务注册（Register）：**由 Location 等功能模块把已定义任务交给原生系统运行；已注册清单会跨 App 会话保存。
- **全局 / 模块作用域：**组件渲染前执行的文件顶层代码。后台启动 JS 时不一定存在任何 React 组件实例，所以系统只能找到在此处定义的 task。
- **Development build：**包含项目原生依赖的开发版 App。TaskManager 在 Expo Go 中的后台能力受限，开发版更适合验证完整后台行为。

## 源页代码主题覆盖

- Libraries using Expo TaskManager：列出 Location、BackgroundTask、BackgroundFetch 和 Notifications。
- Installation：覆盖 npx、Yarn、pnpm、Bun 安装命令和 Expo Go 限制说明。
- Configuration：覆盖 iOS `UIBackgroundModes` 配置要求。
- Example：保留完整后台定位权限、启动定位、定义任务和处理回调代码。
- API：覆盖导入语句、所有任务查询 / 注册 / 注销方法及 `getRegisteredTasksAsync()` 返回数组示例。
- Interfaces / Types：覆盖错误、任务对象、执行事件、执行信息与 executor 类型。
- SDK v56 还明确说明 Expo Router 中应在根布局导入任务定义文件；Latest 与 v56 Next 均为 TrackingTransparency。

**翻页：**[上一页：Expo SDK SystemUI 系统界面](./207-Expo-SDK-SystemUI.md) · [目录](./README.md) · [下一页：Expo SDK TrackingTransparency 跟踪授权](./209-Expo-SDK-TrackingTransparency.md)
