# 174｜Expo SDK LightSensor 光线传感器

**翻页：**[上一页：Expo SDK KeepAwake 保持屏幕常亮](./173-Expo-SDK-KeepAwake.md) · [目录](./README.md) · [下一页：Expo SDK LinearGradient 渐变](./175-Expo-SDK-LinearGradient.md)

**官方页面：**[LightSensor · Latest](https://docs.expo.dev/versions/latest/sdk/light-sensor/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/light-sensor/)

**版本与平台：**Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。此传感器只在 Android 提供，并包含在 Expo Go 中。

## 环境光照度

`LightSensor` 从 Android 设备的环境光传感器读取 `illuminance`（照度，单位 lux，lx）。它提供环境明暗数值，不是相机曝光值；设备可能没有传感器或暂时无法访问，所以开启订阅前先调用 `isAvailableAsync()`。连续监听会持续发事件，离开页面时需移除订阅。

安装：

```sh
npx expo install expo-sensors
```

## 订阅、显示与停止

官方基础例子显示照度值并用 Toggle 按钮启停监听。下面保留这一流程，以 ref 管理订阅并在卸载时清理，避免状态闭包导致监听没有被移除：

```tsx
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { LightSensor } from 'expo-sensors';

type LightMeasurement = { illuminance: number; timestamp?: number };

export default function AmbientLightPanel() {
  const [measurement, setMeasurement] = useState<LightMeasurement>({ illuminance: 0 });
  const [isListening, setIsListening] = useState(false);
  const subscription = useRef<ReturnType<typeof LightSensor.addListener> | null>(null);

  async function subscribe() {
    if (!(await LightSensor.isAvailableAsync())) {
      setIsListening(false);
      return;
    }
    subscription.current?.remove();
    subscription.current = LightSensor.addListener(setMeasurement);
    setIsListening(true);
  }

  function unsubscribe() {
    subscription.current?.remove();
    subscription.current = null;
    setIsListening(false);
  }

  async function toggle() {
    if (isListening) unsubscribe();
    else await subscribe();
  }

  useEffect(() => () => subscription.current?.remove(), []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
      <Text>环境光传感器：</Text>
      <Text>
        {Platform.OS === 'android'
          ? `${measurement.illuminance} lx`
          : 'LightSensor 仅支持 Android'}
      </Text>
      <TouchableOpacity onPress={() => void toggle()} style={{ marginTop: 16, padding: 12, backgroundColor: '#eee' }}>
        <Text>{isListening ? '停止监听' : '开始监听'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

`addListener` 返回 `EventSubscription`；`.remove()` 会停止该回调。源页的实现将状态放在 React state 中，订阅数据更新时会重新渲染 UI；应用离开页面时必须清理订阅。

## API 速查

| API | 作用 |
| --- | --- |
| `LightSensor.addListener(listener)` | 订阅测量事件，收到 `LightSensorMeasurement`；返回带 `.remove()` 的订阅。 |
| `LightSensor.getListenerCount()` / `LightSensor.hasListeners()` | 查询当前注册监听数量 / 是否有监听器。 |
| `LightSensor.isAvailableAsync()` | 检查设备上的传感器是否可用且已启用；至少要求 Android 2.3 / API 9。官方建议订阅前先检查。 |
| `LightSensor.getPermissionsAsync()` / `requestPermissionsAsync()` | 查询 / 请求传感器访问权限，返回 PermissionResponse。 |
| `LightSensor.setUpdateInterval(intervalMs)` | 设置更新间隔，单位毫秒。 |
| `LightSensor.removeSubscription(subscription)` | 旧式按句柄清理接口。 |
| `LightSensor.removeAllListeners()` | 清除全部订阅；已 deprecated，优先逐个调用订阅 `.remove()`。 |

Android 12 / API 31+ 默认对每个传感器的更新频率限制为 200Hz。若应用确实需要更高频率，Expo 文档要求把 `android.permission.HIGH_SAMPLING_RATE_SENSORS` 加进 app config permissions 或原生 AndroidManifest；多数自动亮度 / 明暗状态 UI 无需超过此限制。

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

## 测量与权限类型

| 类型 | 字段 / 值 | 含义 |
| --- | --- | --- |
| `LightSensorMeasurement` | `illuminance: number` | 环境光照度，单位 lux。 |
| `LightSensorMeasurement` | `timestamp: number` | 测量时间，秒。 |
| `Subscription` | `remove(): void` | 取消该订阅，不再接收事件。 |
| `PermissionResponse` | `canAskAgain`、`expires`、`granted`、`status` | 权限能否再询问、失效时间、授权布尔值和状态。 |
| `PermissionExpiration` | `'never' \| number` | 权限期限；传感器权限目前文档标注永久授权。 |
| `PermissionStatus` | `DENIED` / `GRANTED` / `UNDETERMINED` | 拒绝 / 已授予 / 尚未决定。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-sensors ~57.0.3`，SDK v56.0.0 推荐 `~56.0.6`。
- 两版的平台范围、单位、Android API 最低要求、订阅方法和 200Hz 说明一致。
- 两版页脚 Next 都进入 Expo SDK LinearGradient。

## 源页代码主题覆盖

- Installation：覆盖安装 `expo-sensors` 的 Expo 命令。
- Basic usage：覆盖 illuminance 初值 / 回调更新、订阅 / 取消、React effect 清理，以及非 Android 平台提示。
- API：覆盖 Listener、listener count / hasListeners、可用性、权限、更新间隔、弃用清理方法与 Subscription。
- Android configuration：覆盖 200Hz 上限和 `HIGH_SAMPLING_RATE_SENSORS` app config 示例。
- Types：覆盖照度 / 时间测量、PermissionResponse / Expiration / Status。
- Latest / SDK v56 对照：记录包版本并确认 Next 同为 LinearGradient。

**翻页：**[上一页：Expo SDK KeepAwake 保持屏幕常亮](./173-Expo-SDK-KeepAwake.md) · [目录](./README.md) · [下一页：Expo SDK LinearGradient 渐变](./175-Expo-SDK-LinearGradient.md)
