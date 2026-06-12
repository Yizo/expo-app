# Expo Battery 学习指南

`expo-battery` 是 Expo 提供的设备电池信息库，用于读取物理设备的电量、充电状态和低电量模式，并监听这些状态的变化。

支持平台：

- Android
- iOS，但部分能力仅适用于真机
- Web
- Expo Go

> 本页描述的是下一版本 SDK 的文档，修改日期为 2026 年 5 月 26 日。文档提示：当前稳定版本为 SDK 56，应优先参考对应的 latest 文档。

## 文档解决的问题

通过 `expo-battery`，应用可以：

- 获取剩余电量。
- 判断设备是否正在充电。
- 判断系统是否启用了省电模式。
- 一次性获取完整的电源状态。
- 监听电量、充电状态和省电模式变化。
- 在 Android 上检查应用是否受到系统电池优化限制。

典型使用场景包括：

- 在低电量或省电模式下减少动画、定位或后台任务。
- 提醒用户充电后再执行耗电操作。
- 分析 Android 后台任务是否可能被系统限制。
- 在界面中展示设备电量和充电状态。

## 阅读前需要理解的概念

### Expo 模块

`expo-battery` 并不是浏览器中的普通 npm 工具库。它需要通过 Expo 的原生模块能力访问 Android 或 iOS 系统 API。

对于 React Web 开发者，可以将其理解为：

- React 组件负责界面和状态更新。
- `expo-battery` 负责与设备操作系统通信。
- Android、iOS 和 Web 的底层能力不同，因此相同 API 的结果和事件行为也可能不同。

### 物理设备与模拟器

iOS 模拟器不提供完整的真实电池信息。`isAvailableAsync()` 在物理 iOS 设备上返回 `true`，在 iOS 模拟器上返回 `false`。

因此，涉及 iOS 电池功能时，最终验证必须在真机上进行。

### 电量与电池状态

这两个概念不同：

- `batteryLevel`：剩余电量比例，例如 `0.75` 表示约 75%。
- `batteryState`：电池当前处于未接电源、充电中、已充满等哪种状态。

仅凭电量数值不能判断设备是否正在充电。

### 省电模式与 Android 电池优化

它们不是同一个概念：

- `lowPowerMode`：用户或系统启用的全局省电模式。Android 称 Power Saver Mode，iOS 称 Low Power Mode。
- Android 电池优化：Android 针对单个应用实施的后台运行限制，可能影响后台任务。

## 安装

根据项目使用的包管理器选择一条命令：

```sh
# npm
npx expo install expo-battery

# yarn
yarn expo install expo-battery

# pnpm
pnpm expo install expo-battery

# bun
bun expo install expo-battery
```

`expo install` 会按照当前 Expo SDK 选择兼容的包版本。它不是另一个包管理器，最终仍会调用 npm、Yarn、pnpm 或 Bun。

如果项目是已有的裸 React Native 工程，必须先安装并配置 Expo Modules，也就是文档所说的先安装 `expo`。仅执行普通的 `npm install expo-battery` 并不代表原生工程已经具备调用该模块的条件。

当前文档未涉及：

- iOS Pod 安装的具体步骤。
- Android Gradle 配置。
- 权限声明。
- Expo 配置插件或 `app.json` 配置。
- EAS Build 和应用商店发布流程。

## 基本用法

文档首先演示了 React Hook：

```tsx
import { useBatteryLevel } from 'expo-battery';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const batteryLevel = useBatteryLevel();

  return (
    <View style={styles.container}>
      <Text>Current Battery Level: {batteryLevel}</Text>
    </View>
  );
}
```

这里的 `View` 和 `Text` 是 React Native 组件，可以分别近似理解为 React Web 中承担布局和文本展示职责的元素，但它们不是 HTML 的 `div` 和文本节点。

`useBatteryLevel()` 的使用方式与普通 React Hook 类似：组件订阅电量变化，值发生变化时触发重新渲染。

需要注意，返回值是比例而不是百分数：

```tsx
const batteryLevel = useBatteryLevel();

const displayLevel =
  batteryLevel < 0 ? '未知' : `${Math.round(batteryLevel * 100)}%`;
```

## 导入 API

如果需要调用方法或注册事件监听器，可以整体导入模块：

```ts
import * as Battery from 'expo-battery';
```

Hook 也可以使用具名导入：

```ts
import {
  useBatteryLevel,
  useBatteryState,
  useLowPowerMode,
  usePowerState,
} from 'expo-battery';
```

## Hooks

Hooks 适合直接在 React 组件中消费电池状态。

### `useBatteryLevel()`

```ts
const batteryLevel = useBatteryLevel();
```

返回 `number`，语义与 `getBatteryLevelAsync()` 相同。

正常值位于 `0` 到 `1` 之间；无法获取时可能为 `-1`。显示前不能直接假设它一定是合法百分比。

### `useBatteryState()`

```ts
const batteryState = useBatteryState();
```

返回 `BatteryState` 枚举，用于判断设备是否正在充电、已充满或未连接电源。

### `useLowPowerMode()`

```ts
const lowPowerMode = useLowPowerMode();
```

返回 `boolean`：

- `true`：系统报告已启用省电模式。
- `false`：系统报告未启用，或者当前平台不支持读取此状态。

因此，`false` 不一定能证明设备确实没有开启省电模式。

### `usePowerState()`

```ts
const { lowPowerMode, batteryLevel, batteryState } =
  usePowerState();
```

一次返回完整电源状态，适合同时需要电量、充电状态和省电模式的组件。

相比分别调用三个 Hook，它能让代码围绕一个统一的 `PowerState` 对象组织。

## 异步查询方法

这些方法返回 `Promise`，适合事件处理函数、服务层代码或一次性检查。

### `getBatteryLevelAsync()`

```ts
const batteryLevel = await Battery.getBatteryLevelAsync();
// 例如 0.759999
```

返回值：

- `0` 到 `1`：当前电量比例。
- `-1`：设备不支持获取电量或电量未知。

不要使用精确相等判断处理小数，例如不要假设 76% 一定返回 `0.76`。文档示例中可能返回 `0.759999`。

### `getBatteryStateAsync()`

```ts
const batteryState = await Battery.getBatteryStateAsync();
// 例如 Battery.BatteryState.CHARGING
```

返回 `BatteryState` 枚举，而不是 `"charging"` 这样的字符串。

文档的返回类型写作 `Promise<batterystate>`，实际语义是返回 `BatteryState` 枚举值。

### `getPowerStateAsync()`

```ts
const powerState = await Battery.getPowerStateAsync();

// {
//   batteryLevel: 0.759999,
//   batteryState: BatteryState.UNPLUGGED,
//   lowPowerMode: true,
// }
```

返回结构：

```ts
type PowerState = {
  batteryLevel: number;
  batteryState: BatteryState;
  lowPowerMode: boolean;
};
```

该方法在读取任意电源状态时发生错误，会将错误继续抛给调用方。因此应根据业务要求使用 `try/catch`：

```ts
try {
  const powerState = await Battery.getPowerStateAsync();
  // 使用 powerState
} catch (error) {
  // 提供降级行为
}
```

### `isAvailableAsync()`

```ts
const available = await Battery.isAvailableAsync();
```

用于判断当前设备或浏览器是否支持电池 API：

- Android：`true`
- iOS 真机：`true`
- iOS 模拟器：`false`
- Web：取决于浏览器是否支持 Battery Status API

在依赖电池数据决定重要业务行为前，应先检查可用性。

### `isBatteryOptimizationEnabledAsync()`

```ts
const enabled =
  await Battery.isBatteryOptimizationEnabledAsync();
```

用于检查系统是否对当前应用启用了电池优化。实际有效范围是 Android 6.0 及以上。

当结果为 `true` 时，应用进入 Doze 模式后，后台任务可能受影响。

虽然文档页面的平台标签列出了 Android、iOS 和 Web，但返回值说明明确标注该能力仅适用于 Android。跨平台代码不应把它当作 iOS 或 Web 的通用能力。

当前文档没有说明：

- 如何引导用户关闭电池优化。
- 哪些具体后台任务会受影响。
- 是否需要额外 Android 权限。
- Doze 模式的完整工作机制。

### `isLowPowerModeEnabledAsync()`

```ts
const lowPowerMode =
  await Battery.isLowPowerModeEnabledAsync();
```

用于读取：

- Android 的 Power Saver Mode。
- iOS 的 Low Power Mode。

对于不支持该能力的平台，例如 Web 或较旧的 Android 设备，结果始终为 `false`，即使设备实际上处于省电状态。

因此，该方法表达的是“平台报告省电模式已开启”，而不是“可以绝对确认省电模式未开启”。

## 事件监听

事件监听适合在状态变化发生时执行逻辑，而不是定时重复查询。

所有监听方法都返回一个订阅对象，应在不再需要时调用 `remove()`。

### 监听电量变化

```ts
const subscription = Battery.addBatteryLevelListener(event => {
  console.log(event.batteryLevel);
});

subscription.remove();
```

事件对象类型：

```ts
type BatteryLevelEvent = {
  batteryLevel: number;
};
```

不同平台的触发策略差异很大：

| 平台 | 触发行为 |
| --- | --- |
| Android | 只在出现显著变化时触发，例如进入低电量状态，或从低电量恢复到正常状态 |
| iOS | 电量至少下降 1% 时可能触发，但最多每分钟触发一次 |
| Web | 永远不会触发 |

这不是一个适合实现实时、精细电量曲线的事件源。

### 监听电池状态变化

```ts
const subscription = Battery.addBatteryStateListener(event => {
  console.log(event.batteryState);
});

subscription.remove();
```

事件对象：

```ts
type BatteryStateEvent = {
  batteryState: BatteryState;
};
```

它用于监听充电、未连接电源、已充满等状态变化。Web 上事件永远不会触发。

### 监听省电模式变化

```ts
const subscription = Battery.addLowPowerModeListener(event => {
  console.log(event.lowPowerMode);
});

subscription.remove();
```

事件对象：

```ts
type PowerModeEvent = {
  lowPowerMode: boolean;
};
```

Android 或 iOS 切换省电模式时触发。Web 上事件永远不会触发。

### 在 React 组件中正确清理监听器

对 React Web 开发者而言，可以把 `EventSubscription` 理解为浏览器 `addEventListener` 对应的清理句柄。

```tsx
import { useEffect } from 'react';
import * as Battery from 'expo-battery';

function BatteryWatcher() {
  useEffect(() => {
    const subscription = Battery.addBatteryStateListener(event => {
      console.log(event.batteryState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
```

组件卸载时必须移除监听器，否则可能产生重复回调或资源泄漏。

## `BatteryState` 枚举

| 枚举值 | 数值 | 含义 |
| --- | ---: | --- |
| `UNKNOWN` | `0` | 电池状态未知或不可访问 |
| `UNPLUGGED` | `1` | 正在使用电池供电，通常表示未连接电源 |
| `CHARGING` | `2` | 正在充电 |
| `FULL` | `3` | 电池已充满 |
| `NOT_CHARGING` | `4` | 已连接电源，但当前没有充电 |

`NOT_CHARGING` 仅会在 Android 上返回。例如：

- 电池保护功能将充电上限设置为 80%。
- 优化充电策略暂时停止充电。

它与 `UNPLUGGED` 不同：

- `UNPLUGGED`：通常没有连接外部电源，设备正在放电。
- `NOT_CHARGING`：已经连接 AC、USB 或无线电源，但没有继续充电。

iOS 和 Web 永远不会返回 `NOT_CHARGING`。

判断状态时应使用枚举成员，不要依赖其底层数字：

```ts
if (batteryState === Battery.BatteryState.CHARGING) {
  // 设备正在充电
}
```

## Web 平台限制与文档差异

Web 端依赖浏览器的 Battery Status API。文档说明该 API 仅由基于 Chromium 的浏览器实现，例如 Chrome、Edge 和 Opera。

Firefox、Safari 等不支持的浏览器需要降级处理。

本页对 Web 返回值存在前后不一致：

- 页面顶部说明：不支持时，`getBatteryLevelAsync()` 返回 `-1`，`getBatteryStateAsync()` 返回 `UNKNOWN`。
- 方法说明又写道：Web 上 `getBatteryLevelAsync()` 始终返回 `1`，`getBatteryStateAsync()` 始终返回 `UNKNOWN`。

因此，仅根据当前文档无法确定所有 Web 环境下电量方法的精确返回规则。可以确定的是：

- Web 上电池状态应按 `UNKNOWN` 处理。
- Web 上三个事件监听器都不会触发。
- 业务代码必须接受 `-1`、占位电量或不可用状态。
- 不能把 Web 端结果用于必须准确执行的业务判断。

这是原文档自身的信息差异，并非可以从本文可靠消解的结论。

## React Web 开发者最容易误解的地方

### “支持 Web”不等于各平台行为一致

API 的平台标签包含 Web，但事件在 Web 上永远不触发，部分查询也只能返回占位值或未知状态。

跨平台应用需要区分“方法可以调用”和“结果具有完整业务意义”。

### Hook 与异步方法用途不同

- Hook：用于组件渲染，并随状态变化更新。
- 异步方法：用于一次性读取。
- Listener：用于变化发生时执行副作用。

不要在每次组件渲染时直接调用异步方法，也不要为了显示一个简单状态就手动实现不必要的订阅逻辑。

### 电量不是整数百分比

`0.759999` 表示约 76%，不是 `0.759999%`。展示时需要乘以 100，并处理 `-1`。

### `false` 可能表示“不支持”

`isLowPowerModeEnabledAsync()` 返回 `false` 时，可能是省电模式未开启，也可能是平台无法报告这一状态。

### iOS 模拟器不能代替真机验证

模拟器上的电池 API 不可用。应用应能在不可用时正常显示降级界面，最终功能则应通过 iOS 真机测试。

### 移动端事件不保证高频触发

Android 只报告显著电量变化；iOS 也有变化幅度和每分钟触发次数限制。因此不能按照 React Web 中高频 DOM 事件的思路理解电池监听器。

## 实际开发建议

以下为根据文档能力整理出的应用方式。

### 先处理不可用状态

**基于文档内容推导：** 如果某项功能依赖准确电量，应先调用 `isAvailableAsync()`，并同时处理电量为 `-1` 和状态为 `UNKNOWN` 的情况。

不要因为无法获取电池信息而阻断登录、支付或内容浏览等核心流程。

### 将电池信息用于性能降级，而非关键授权

**基于文档内容推导：** 省电状态在部分平台无法可靠读取，Web 事件也不会触发，因此更适合用来调整非关键功能，例如：

- 减少动画。
- 降低非必要刷新频率。
- 延迟高耗电操作。
- 提示用户连接电源。

不应仅凭这些信息决定是否允许用户执行关键业务操作。

### 不要在后台持续轮询电量

**基于经验建议：** 优先使用 Hook 或系统事件。在平台事件无法满足要求时，也应谨慎设计查询频率，避免为了监测电量而额外耗电。

### 集中封装平台差异

**基于经验建议：** 可以在项目中建立统一的电源状态服务，集中处理：

- `-1`
- `UNKNOWN`
- Web 降级
- iOS 模拟器不可用
- `NOT_CHARGING` 仅限 Android
- Listener 清理

这样业务组件不必重复理解各平台差异。

### 在真实目标环境中测试

**基于文档内容推导：** 至少应覆盖：

- Android 真机。
- iOS 真机。
- iOS 模拟器的不可用降级。
- 支持 Battery Status API 的 Chromium 浏览器。
- 不支持该 API 的浏览器。

## 文档明确说明与推导内容

### 文档明确说明

- 电量正常范围为 `0` 到 `1`，未知时可能为 `-1`。
- iOS 模拟器上的电池 API 不可用。
- Web 依赖 Battery Status API。
- Web 上电量、电池状态和省电模式事件均不会触发。
- Android 与 iOS 的电量事件触发频率不同。
- 不支持省电状态报告的平台会返回 `false`。
- Android 电池优化可能影响 Doze 模式下的后台任务。
- `NOT_CHARGING` 仅在 Android 上返回。
- `getPowerStateAsync()` 会继续抛出读取过程中发生的错误。

### 基于文档内容推导

- 调用方必须为未知值和不可用平台设计降级行为。
- Web 上不能依赖事件保持电池状态实时更新。
- 需要精确验证 iOS 功能时必须使用真机。
- 电池状态适合作为性能和体验优化信号，不适合作为关键业务的唯一依据。

### 当前文档未涉及

- 是否需要用户授权或系统权限。
- 如何请求用户关闭 Android 电池优化。
- 后台任务受到限制时的具体恢复方案。
- 原生工程的详细安装和链接步骤。
- 电池 API 的测试模拟方案。
- 电池信息是否涉及隐私合规要求。
- 各平台最低系统版本的完整要求。

## 总结

`expo-battery` 提供了三种访问电池信息的方式：

- React Hooks：直接驱动组件渲染。
- 异步方法：执行一次性查询。
- Event Listener：响应设备状态变化。

使用时最重要的不是记住 API 名称，而是正确处理平台差异：iOS 模拟器不可用，Web 能力有限且事件不触发，Android 和 iOS 的电量事件也不是高频实时事件。

实际应用应把电池状态视为一种可选的设备能力信号，并始终为未知、不可用和读取失败设计降级路径。

---

## 文档导航

- **上一页**：[barometer](./147__barometer.md)
- **下一页**：[blob](./149__blob.md)
