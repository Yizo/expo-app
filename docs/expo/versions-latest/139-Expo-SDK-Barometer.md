# 139｜Expo SDK Barometer 气压计

**翻页：**[上一页：Expo SDK BackgroundTask](./138-Expo-SDK-BackgroundTask.md) · [目录](./README.md) · [下一页：Expo SDK Battery](./140-Expo-SDK-Battery.md)

**官方页面：**[Barometer · Latest](https://docs.expo.dev/versions/latest/sdk/barometer/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/barometer/)

**版本边界：**Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。两版 API 和示例一致。气压计支持 Android 与 iOS 真机；iOS 模拟器、Web 不提供此传感器。库被 Expo Go 包含。

## 气压计测量什么

`Barometer` 从设备的气压传感器读取压力，以 **hPa（hectopascal，百帕）**表示。它适合观察气压变化；**相对高度**只在 iOS 提供，表示相对于测量起点的高度变化，不是 GPS 给出的绝对海拔。Android 读取压力值，没有 `relativeAltitude` 字段。Web 上传感器不可用，尝试读取会抛 `UnavailabilityError`。

安装整个 `expo-sensors` 包：

```sh
npx expo install expo-sensors
# 也可使用 yarn / pnpm / bun expo install expo-sensors
```

## 开始 / 停止监听

用 `Barometer.addListener(callback)` 订阅数据；它返回一个 `EventSubscription`，调用 `.remove()` 可取消该监听。通常应在不再需要数据时清除订阅，避免不必要的传感器更新。

```tsx
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Barometer } from 'expo-sensors';

export default function BarometerScreen() {
  const [measurement, setMeasurement] = useState({ pressure: 0, relativeAltitude: 0 });
  const [subscription, setSubscription] = useState<ReturnType<typeof Barometer.addListener> | null>(null);

  async function subscribe() {
    if (!(await Barometer.isAvailableAsync())) return;
    const permission = await Barometer.requestPermissionsAsync();
    if (!permission.granted) return;
    Barometer.setUpdateInterval(1000);
    setSubscription(Barometer.addListener(setMeasurement));
  }

  function unsubscribe() {
    subscription?.remove();
    setSubscription(null);
  }

  function toggleListener() {
    if (subscription) unsubscribe();
    else void subscribe();
  }

  return (
    <View style={styles.wrapper}>
      <Text>气压计监听：{subscription ? '运行中' : '未启动'}</Text>
      <Text>气压：{measurement.pressure} hPa</Text>
      <Text>
        相对高度：{Platform.OS === 'ios'
          ? `${measurement.relativeAltitude} m`
          : 'Android 不提供相对高度'}
      </Text>
      <TouchableOpacity onPress={toggleListener} style={styles.button}>
        <Text>切换监听</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    marginTop: 15,
  },
  wrapper: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
```

上例先检查传感器是否存在，再请求权限；不同设备 / 系统的可用能力会不同。`setUpdateInterval(1000)` 请求每秒更新一次；这是期望值，传感器与操作系统可限制实际采样频率。

## Android 高采样率限制

Android 12（API 31）及更新版本默认限制每个传感器约 200Hz。若应用确实需要更高采样频率，需声明 `android.permission.HIGH_SAMPLING_RATE_SENSORS`。Expo app config 示例：

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

若维护原生 Android 工程，则添加到 `AndroidManifest.xml`：

```xml
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
```

这项声明只在需要高于平台默认速率时添加，不代表每个传感器或设备都能提供该速率。

## Barometer API 速查

| 方法 | 返回 | 用途 |
| --- | --- | --- |
| `addListener(listener)` | `EventSubscription` | 注册压力更新回调；参数是 `BarometerMeasurement`。 |
| `isAvailableAsync()` | `Promise<boolean>` | 检查当前设备是否有可用气压计；尝试使用前应先查。 |
| `getPermissionsAsync()` | `Promise<PermissionResponse>` | 读取传感器访问权限状态。 |
| `requestPermissionsAsync()` | `Promise<PermissionResponse>` | 请求传感器访问权限。 |
| `getListenerCount()` / `hasListeners()` | `number` / `boolean` | 查看当前订阅数量或是否存在监听。 |
| `removeAllListeners()` | `void` | 清除所有订阅；已弃用，优先清理自己的 subscription。 |
| `removeSubscription(subscription)` | `void` | 按订阅对象移除；新代码可直接用 `subscription.remove()`。 |
| `setUpdateInterval(intervalMs)` | `void` | 设定传感器期望的更新间隔（毫秒）。 |

每次 `addListener` 返回的 `Subscription` 都有 `remove(): void`。管理单个订阅优先保存返回对象，再在组件卸载或界面关闭时调用 `remove()`，避免使用全局 `removeAllListeners()` 误删其他代码创建的监听。

## 数据、权限与平台实现

- `BarometerMeasurement.pressure: number`：压力值，单位 hPa。
- `relativeAltitude?: number`：仅 iOS 提供，单位米，表示相对高度变化。
- `timestamp: number`：测量时间戳，单位秒。
- `PermissionExpiration`：`'never' | number`；`PermissionResponse` 包括 `canAskAgain`、`expires`、`granted`、`status`。
- `PermissionStatus`：`DENIED`、`GRANTED`、`UNDETERMINED`，分别对应未授予、已授予、尚未决定。
- iOS 由 Core Motion 的气压 / 高度传感器支持，`relativeAltitude` 是基于起始点的高度变化；Android 读取 `Sensor.TYPE_PRESSURE`。Web 无传感器提供者。

### 直接订阅示例

```ts
const subscription = Barometer.addListener(({ pressure, relativeAltitude }) => {
  console.log({ pressure, relativeAltitude });
});

// 结束订阅
subscription.remove();
```

## 页面代码主题覆盖

官方代码已按主题重写：四类包管理器安装；完整 React Native 监听开关 UI、pressure / iOS relative altitude 显示和 subscription 清理；显式 `addListener` callback 示例；`setUpdateInterval`；Android 12 高采样权限在 app config 与原生 Manifest 两种写法。API 的可用性检查、请求权限、listener 管理、measurement / permission 类型、iOS / Android / Web 传感器提供者也在上文说明。

**来源：**[Expo Barometer · Latest](https://docs.expo.dev/versions/latest/sdk/barometer/) · [Expo Barometer · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/barometer/)

**翻页：**[上一页：Expo SDK BackgroundTask](./138-Expo-SDK-BackgroundTask.md) · [目录](./README.md) · [下一页：Expo SDK Battery](./140-Expo-SDK-Battery.md)
