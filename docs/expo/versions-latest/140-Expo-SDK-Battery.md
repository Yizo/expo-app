# 140｜Expo SDK Battery 电池状态

**翻页：**[上一页：Expo SDK Barometer 气压计](./139-Expo-SDK-Barometer.md) · [目录](./README.md) · [下一页：Expo SDK Blob](./141-Expo-SDK-Blob.md)

**官方页面：**[Battery · Latest](https://docs.expo.dev/versions/latest/sdk/battery/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/battery/)

**版本边界：**Latest 推荐 `expo-battery ~57.0.3`；SDK v56.0.0 推荐 `~56.0.4`。两版原生 API / hooks 基本一致，但 v56 文档额外说明 Web Battery Status API 只在部分 Chromium 浏览器实现；不支持的浏览器返回电量 `-1`、状态 `UNKNOWN`。Latest 页面说明 Web 不可用时电量可能固定为 `1`。处理 Web 电池数据时应根据实际返回值判定“未知”，不要将 `1` 一概当作真实满电。

## 读取当前电量和状态

`expo-battery` 可读取电量百分比、电池状态和低电量模式，也能订阅变化。安装包名是 `expo-battery`：

```sh
npx expo install expo-battery
# 也可使用 yarn / pnpm / bun expo install expo-battery
```

电量值为 `0` 到 `1` 的小数，例如 `0.75` 是 75%；若设备无法提供读数会返回 `-1`。下面用 hooks 把原生电池变化映射成 React 可读取的状态：

```tsx
import { StyleSheet, Text, View } from 'react-native';
import {
  BatteryState,
  useBatteryLevel,
  useBatteryState,
  useLowPowerMode,
  usePowerState,
} from 'expo-battery';

export default function BatteryScreen() {
  const batteryLevel = useBatteryLevel();
  const batteryState = useBatteryState();
  const lowPowerMode = useLowPowerMode();
  const powerState = usePowerState();

  const batteryText = batteryLevel < 0
    ? '未知'
    : `${Math.round(batteryLevel * 100)}%`;

  return (
    <View style={styles.container}>
      <Text>电量：{batteryText}</Text>
      <Text>充电状态：{BatteryState[batteryState]}</Text>
      <Text>低电量模式：{lowPowerMode ? '已开启' : '未开启'}</Text>
      <Text>电池状态快照：{JSON.stringify(powerState)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

> 上例的状态名展示需要从 `expo-battery` 导入 `BatteryState` 枚举；真实界面可以用自己的文案映射。

## 查询 API 与监听变化

需要在异步流程中读取一份快照时，使用静态方法。`getPowerStateAsync()` 把电量、插电状态和低电量模式合并成一个对象；获取这些信息过程中的错误会原样抛出：

```ts
import * as Battery from 'expo-battery';

const batteryLevel = await Battery.getBatteryLevelAsync();
// 示例：0.759999

const batteryState = await Battery.getBatteryStateAsync();
// 示例：Battery.BatteryState.CHARGING

const powerState = await Battery.getPowerStateAsync();
// 示例：
// {
//   batteryLevel: 0.759999,
//   batteryState: Battery.BatteryState.UNPLUGGED,
//   lowPowerMode: true,
// }

const apiAvailable = await Battery.isAvailableAsync();
const lowPowerMode = await Battery.isLowPowerModeEnabledAsync();
```

Android 6.0 及更新版本还可查询 App 是否受电池优化影响；系统 Doze（设备闲置省电模式）可能延迟后台任务：

```ts
const optimizationEnabled = await Battery.isBatteryOptimizationEnabledAsync();
// 示例：true（此方法仅 Android 可用）
```

监听器接收的是带字段的事件对象，不是直接传一个数值。使用完要调用对应 subscription 的 `remove()`：

```ts
const levelSubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
  console.log('新电量值：', batteryLevel);
});

const stateSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
  console.log('电池状态：', batteryState);
});

const powerModeSubscription = Battery.addLowPowerModeListener(({ lowPowerMode }) => {
  console.log('低电量模式：', lowPowerMode);
});

// 清理各自的订阅；组件中通常放进 useEffect cleanup。
levelSubscription.remove();
stateSubscription.remove();
powerModeSubscription.remove();
```

## API 速查

### Hooks

| Hook | 返回 | 用途 |
| --- | --- | --- |
| `useBatteryLevel()` | `number` | 响应电量变化，等同订阅 `getBatteryLevelAsync()` 数据。 |
| `useBatteryState()` | `BatteryState` | 响应插电 / 充电状态变化。 |
| `useLowPowerMode()` | `boolean` | 响应 Power Saver（Android）或 Low Power Mode（iOS）。 |
| `usePowerState()` | `PowerState` | 一次读取电量、充电状态和低电量模式。 |

### 方法与平台差异

| 方法 | 返回 | 重要行为 |
| --- | --- | --- |
| `getBatteryLevelAsync()` | `Promise<number>` | `0`–`1` 表示电量比例；设备不支持时 `-1`。Latest 当前页面称 Web 固定返回 `1`；v56 页面称不支持 Battery Status API 的浏览器返回 `-1`。 |
| `getBatteryStateAsync()` | `Promise<BatteryState>` | Web 固定为 `UNKNOWN`。 |
| `getPowerStateAsync()` | `Promise<PowerState>` | 组合查询 battery level、state、lowPowerMode；读取失败会 reject。 |
| `isAvailableAsync()` | `Promise<boolean>` | Android 和 iOS 真机为可用；iOS 模拟器不可用；Web 取决于浏览器能力。 |
| `isBatteryOptimizationEnabledAsync()` | `Promise<boolean>` | Android 6.0+ 专用，检查 App 是否开启电池优化。 |
| `isLowPowerModeEnabledAsync()` | `Promise<boolean>` | 读取省电模式；不支持的浏览器或旧 Android 设备始终返回 `false`。 |
| `addBatteryLevelListener(listener)` | `EventSubscription` | Android 只在明显跨越低电量阈值时触发；iOS 至少变化约 1% 才触发且最多每分钟一次；Web 不触发。 |
| `addBatteryStateListener(listener)` | `EventSubscription` | 状态改变时传入 `{ batteryState }`；Web 不触发。 |
| `addLowPowerModeListener(listener)` | `EventSubscription` | 省电模式切换时传入 `{ lowPowerMode }`；Web 不触发。 |

## 类型与状态枚举

- `BatteryLevelEvent`：`batteryLevel: number`，范围 `0` 到 `1`，未知时为 `-1`。
- `BatteryStateEvent`：`batteryState: BatteryState`。
- `PowerModeEvent`：`lowPowerMode: boolean`。
- `PowerState`：`batteryLevel`、`batteryState`、`lowPowerMode`。
- `Subscription.remove()`：移除创建它的单个事件监听。

`BatteryState` 包含：

| 枚举 | 值 | 说明 |
| --- | --- | --- |
| `UNKNOWN` | `0` | 状态无法读取。Web 总是这个状态。 |
| `UNPLUGGED` | `1` | 正在由电池放电。 |
| `CHARGING` | `2` | 正在充电。 |
| `FULL` | `3` | 电池已满。 |
| `NOT_CHARGING` | `4` | **仅 Android**：连接电源但当前未充电，例如充电保护暂停在 80%。iOS / Web 不返回此值。 |

## 给 React Web 开发者的提示

- Hook 的数据会在原生事件到达时更新，效果类似用 `useEffect` 建立并清理订阅，但不需要自己维护订阅对象。
- Web 依赖浏览器 Battery Status API，支持范围受浏览器实现限制；也不能依赖网页事件来实时追踪电量。
- 电池状态变化的通知频率由系统控制。Android 的电量事件不是每掉 1% 都触发，iOS 最多每分钟发送一次；App 应按“偶尔更新的设备状态”设计，而不是高频计时器。
- `isBatteryOptimizationEnabledAsync()` 只适用于 Android；它是检查状态，不会自行关闭系统优化。

## 页面代码主题覆盖

本页重写官方代码主题：四种包管理器安装；基础电量 Hook + React Native 页面；四个 hooks 的各自取值；battery level / state / power state 的异步样例值；电量优化与低功耗模式方法；电量 / 充电状态 / 省电模式三类事件监听及取消订阅。页面方法、事件与 PowerState 类型、BatteryState 全部枚举和 Latest / v56 Web 表现差异均已列出。

**来源：**[Expo Battery · Latest](https://docs.expo.dev/versions/latest/sdk/battery/) · [Expo Battery · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/battery/)

**翻页：**[上一页：Expo SDK Barometer 气压计](./139-Expo-SDK-Barometer.md) · [目录](./README.md) · [下一页：Expo SDK Blob](./141-Expo-SDK-Blob.md)
