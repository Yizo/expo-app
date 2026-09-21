# 167｜Expo SDK Gyroscope 陀螺仪

**翻页：**[上一页：Expo SDK GLView OpenGL 渲染视图](./166-Expo-SDK-GLView.md) · [目录](./README.md) · [下一页：Expo SDK Haptics 触觉反馈](./168-Expo-SDK-Haptics.md)

**官方页面：**[Gyroscope · Latest](https://docs.expo.dev/versions/latest/sdk/gyroscope/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/gyroscope/)

**版本与平台：**Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。支持 Android、真实 iOS 设备和 Web，并标记可在 Expo Go 中使用。

## 陀螺仪数据的含义

陀螺仪传感器测量设备绕三条空间轴旋转的角速度；Expo 返回 `x`、`y`、`z` 三个方向的数据，单位为弧度每秒（rad/s），不是角度，也不是已校正的屏幕方向。`timestamp` 是该次测量的秒级时间戳。需要方向角时，通常要对角速度随时间积分；这会受到传感器噪声与漂移影响。

`expo-sensors` 以事件订阅方式提供连续数据：调用 `Gyroscope.addListener()` 开始接收更新，组件卸载或用户停止时调用订阅的 `.remove()`。陀螺仪值是高频连续数据，别在每次回调里执行昂贵渲染或重计算。

安装：

```sh
npx expo install expo-sensors
```

## 订阅、取消和采样间隔

源页例子显示三个轴值、开 / 关订阅，并切换慢速 `1000ms` / 快速 `16ms` 更新。以下版本额外把 Web 权限请求放到用户按钮事件里，使用 ref 保存订阅句柄，并保证组件卸载时清理：

```tsx
import { useEffect, useRef, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';

type Measurement = { x: number; y: number; z: number; timestamp?: number };

export default function GyroscopePanel() {
  const [data, setData] = useState<Measurement>({ x: 0, y: 0, z: 0 });
  const [message, setMessage] = useState('尚未开始');
  const subscription = useRef<ReturnType<typeof Gyroscope.addListener> | null>(null);

  async function start() {
    // Web 的权限必须由点击等用户交互触发。
    const permission = await Gyroscope.requestPermissionsAsync();
    if (!permission.granted) {
      setMessage('未获传感器权限；可按提示前往系统 / 浏览器设置');
      return;
    }

    const available = await Gyroscope.isAvailableAsync();
    if (!available) {
      setMessage('当前设备或浏览器未开放陀螺仪');
      return;
    }

    subscription.current?.remove();
    subscription.current = Gyroscope.addListener(setData);
    setMessage('正在读取传感器');
  }

  function stop() {
    subscription.current?.remove();
    subscription.current = null;
    setMessage('已停止');
  }

  useEffect(() => () => subscription.current?.remove(), []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
      <Text>{message}</Text>
      <Text>x: {data.x}</Text>
      <Text>y: {data.y}</Text>
      <Text>z: {data.z}</Text>
      <Text>timestamp: {data.timestamp ?? '—'}</Text>
      <Button title="开始 / 授权" onPress={() => void start()} />
      <Button title="停止" onPress={stop} />
      <Button title="慢速 1000ms" onPress={() => Gyroscope.setUpdateInterval(1000)} />
      <Button title="快速 16ms" onPress={() => Gyroscope.setUpdateInterval(16)} />
    </View>
  );
}
```

`setUpdateInterval(intervalMs)` 的单位是毫秒。源页的 16ms 约等于 62.5Hz，1000ms 等于每秒一次。处理应用权限时看 `granted`；若 `canAskAgain` 为 `false`，应说明需要到系统设置打开，而不是无限重试请求。

## Web 与 Android 注意事项

- **Mobile Web**：需在点击等用户操作中调用 `requestPermissionsAsync()`。如果权限状态不是 `granted`，提示用户查看浏览器 / 系统设置。iOS Safari 的 Motion & Orientation Access 可能被关闭；网页通常还需通过 HTTPS 提供。`isAvailableAsync()` 在 Web 会通过等待传感器事件推测可用性，并不完全可靠。
- **Android 12+**：系统对每个传感器默认限制为最高 200Hz。如果需要高于 200Hz 的更新频率（短于约 5ms 的间隔），需加入 `android.permission.HIGH_SAMPLING_RATE_SENSORS`；原生工程直接编辑 Manifest，Expo 项目可在 app config 加权限并重建：

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

这项权限不会把硬件能力提高到超过设备支持范围；通常 16ms 的采样已适用于一般 UI 反馈。

## API 参考

| API | 作用 |
| --- | --- |
| `Gyroscope.addListener(listener)` | 订阅数据更新；回调收到 `GyroscopeMeasurement`，返回可 `.remove()` 的 `EventSubscription`。 |
| `Gyroscope.getListenerCount()` / `Gyroscope.hasListeners()` | 获取监听器数量 / 是否至少有一个监听器。 |
| `Gyroscope.getPermissionsAsync()` | 查询现有传感器权限状态。 |
| `Gyroscope.requestPermissionsAsync()` | 请求传感器权限，返回 `PermissionResponse`。Web 应从用户事件中调用。 |
| `Gyroscope.isAvailableAsync()` | 异步检查当前设备 / 浏览器是否能提供陀螺仪数据。应在订阅前检查。 |
| `Gyroscope.setUpdateInterval(intervalMs)` | 设置更新间隔，单位毫秒。Android 12+ 默认频率上限 200Hz。 |
| `subscription.remove()` | 取消该订阅，不再接收事件；推荐使用。 |
| `Gyroscope.removeSubscription(subscription)` | 旧式按句柄清理 API。 |
| `Gyroscope.removeAllListeners()` | 清除全部监听器；已 deprecated，优先逐个调用 `subscription.remove()`，避免误清其他组件订阅。 |

## 测量数据与权限类型

`GyroscopeMeasurement`：

| 字段 | 含义 |
| --- | --- |
| `timestamp: number` | 测量时间，秒。 |
| `x: number` / `y: number` / `z: number` | 绕对应轴的角速度，rad/s。 |

`PermissionResponse` 包含 `granted`（是否已授权）、`canAskAgain`（能否再次弹窗）、`expires`（权限到期信息）和 `status`。`PermissionExpiration` 为 `'never' | number`；当前 Expo Sensors 权限通常长期有效。`PermissionStatus` 可为 `DENIED`、`GRANTED`、`UNDETERMINED`。`Subscription.remove()` 用于取消单个事件订阅。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-sensors ~57.0.3`，SDK v56 推荐 `~56.0.6`。
- 两版的测量字段、订阅 / 权限 / 可用性方法、Web 权限说明、Android 200Hz 限制和 Next 内容一致。
- 两版页脚均进入 Expo SDK Haptics。

## 源页代码主题覆盖

- Installation：覆盖 `expo-sensors` 安装命令。
- Basic Gyroscope：覆盖 x/y/z 初始状态、订阅 / 取消、React effect 清理、显示测量值，以及慢 / 快采样间隔按钮；为 Web 手势授权补上权限与可用性处理。
- Configuration：覆盖 Android 12+ 200Hz 边界与 `HIGH_SAMPLING_RATE_SENSORS` app config 权限片段。
- API reference：覆盖所有 Gyroscope 方法、subscription 清理、`GyroscopeMeasurement`、`PermissionResponse` / `PermissionExpiration` / `PermissionStatus`。
- Latest / v56 对照：标出推荐版本差异并确认两版 Next 都是 Haptics。

**翻页：**[上一页：Expo SDK GLView OpenGL 渲染视图](./166-Expo-SDK-GLView.md) · [目录](./README.md) · [下一页：Expo SDK Haptics 触觉反馈](./168-Expo-SDK-Haptics.md)
