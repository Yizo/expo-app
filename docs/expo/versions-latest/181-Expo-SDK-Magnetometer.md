# 181｜Expo SDK Magnetometer 磁力计传感器

**翻页：**[上一页：Expo SDK Location 定位、权限与后台跟踪](./180-Expo-SDK-Location.md) · [目录](./README.md) · [下一页：Expo SDK MailComposer](./182-Expo-SDK-MailComposer.md)

**官方页面：**[Magnetometer · Latest](https://docs.expo.dev/versions/latest/sdk/magnetometer/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/magnetometer/)

**版本与平台：**Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。支持 Android、iOS，并可在 Expo Go 使用。部分低端设备可能没有磁力计，应先查询可用性。

## 磁力计测量什么

磁力计测量设备周围磁场的 X、Y、Z 三轴分量，单位是微特斯拉（`μT`）。`Magnetometer` 给出校准后的数值；`MagnetometerUncalibrated` 则提供原始、未校准读数。三轴读数本身不是屏幕上直接可用的“北 / 南”角度；设备朝向、磁场干扰与校准都会影响数值。Expo Location 的 heading API 更适合直接读取罗盘方向。

这是连续传感器流：订阅后会反复收到新样本。组件不再需要数据时应调用订阅对象的 `remove()`；更新间隔越短会得到更多样本、耗电也更多。

## 安装

```sh
npx expo install expo-sensors
yarn expo install expo-sensors
pnpm expo install expo-sensors
bun expo install expo-sensors
```

在已有 React Native 工程中接入前需先安装 `expo`。磁力计和相关 API 从 `expo-sensors` 导入：

```ts
import { Magnetometer, MagnetometerUncalibrated } from 'expo-sensors';
```

## 订阅传感器并控制速率

以下改写示例覆盖源页 UI 示例主题：用 state 显示三轴值，订阅 / 取消订阅传感器，在组件卸载时清理订阅，并提供慢速 1000ms 与较快 16ms 两种更新间隔。

```tsx
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Magnetometer, type Subscription } from 'expo-sensors';

type Vector = { x: number; y: number; z: number };

export default function CompassSensorScreen() {
  const [reading, setReading] = useState<Vector>({ x: 0, y: 0, z: 0 });
  const subscriptionRef = useRef<Subscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribe = () => {
    if (subscriptionRef.current) return;
    subscriptionRef.current = Magnetometer.addListener(setReading);
    setIsSubscribed(true);
  };

  const unsubscribe = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsSubscribed(false);
  };

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      const available = await Magnetometer.isAvailableAsync();
      if (!available || !mounted) return;
      subscriptionRef.current = Magnetometer.addListener(setReading);
      setIsSubscribed(true);
    };

    void start();
    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  const setSlowRate = () => Magnetometer.setUpdateInterval(1000);
  const setFastRate = () => Magnetometer.setUpdateInterval(16);

  return (
    <View style={styles.container}>
      <Text style={styles.reading}>磁场强度（μT）</Text>
      <Text style={styles.reading}>x: {reading.x}</Text>
      <Text style={styles.reading}>y: {reading.y}</Text>
      <Text style={styles.reading}>z: {reading.z}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={isSubscribed ? unsubscribe : subscribe}>
          <Text>{isSubscribed ? '停止' : '开始'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={setSlowRate}>
          <Text>慢速</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={setFastRate}>
          <Text>较快</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  reading: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 16,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderColor: '#ccc',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
```

一个 `EventSubscription` 保存了这一条监听关系；用组件自己的 `subscription.remove()` 清理更安全。代码中 `16ms` 约为每秒 62.5 次更新，低于 Android 12 的 200Hz 限制。

## 可用性与权限

API 参考建议每次使用前调用 `isAvailableAsync()`；磁力计支持 Android 2.3（API 9）及以上、iOS 8 及以上。`getPermissionsAsync()` 可读当前权限，`requestPermissionsAsync()` 会请求传感器权限，二者均返回 `Promise<PermissionResponse>`。

```ts
const available = await Magnetometer.isAvailableAsync();
const permission = await Magnetometer.getPermissionsAsync();

if (available && !permission.granted) {
  await Magnetometer.requestPermissionsAsync();
}
```

权限对象中的 `granted` 表示是否已授权；`canAskAgain` 表示是否还能再次询问；若为 false，可引导用户到系统设置。`status` 是 `denied`、`granted` 或 `undetermined`。

## 类方法

`Magnetometer` 是继承 `DeviceSensor<MagnetometerMeasurement>` 的类，页面列出的方法均适用于 Android、iOS：

| 方法 | 返回值 | 行为 |
| --- | --- | --- |
| `addListener(listener)` | `EventSubscription` | 注册磁场读数回调；每次更新传入一个 `MagnetometerMeasurement`。移除监听调用返回对象的 `remove()`。 |
| `getListenerCount()` | `number` | 返回当前注册的监听数量。 |
| `getPermissionsAsync()` | `Promise<PermissionResponse>` | 查询传感器权限。 |
| `hasListeners()` | `boolean` | 返回是否存在监听器。 |
| `isAvailableAsync()` | `Promise<boolean>` | 查询设备是否有磁力计；文档建议使用前先检查。 |
| `removeAllListeners()` | `void` | 移除该传感器所有监听；已弃用，优先只移除自己的订阅。 |
| `removeSubscription(subscription)` | `void` | 按传入的 `EventSubscription` 移除监听。 |
| `requestPermissionsAsync()` | `Promise<PermissionResponse>` | 请求传感器权限。 |
| `setUpdateInterval(intervalMs)` | `void` | 设置期望采样间隔，单位毫秒。 |

Android 12（API 31）及以上对每个传感器的更新速率设有 200Hz 上限。若应用确实需要高于 200Hz 的读取速率，需在 `app.json` 的 Android `permissions` 加入 `android.permission.HIGH_SAMPLING_RATE_SENSORS`；纯原生 Android 工程则在 `AndroidManifest.xml` 添加：

```xml
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
```

## 接口与数据类型

| 类型 | 字段 / 行为 |
| --- | --- |
| `Subscription` | 订阅接口提供 `remove(): void`；调用后该监听不再接收事件。 |
| `MagnetometerMeasurement` | `{ x: number; y: number; z: number; timestamp: number }`。`x/y/z` 是对应设备轴的磁场强度，单位 `μT`；`timestamp` 是测量时间，单位秒。 |
| `PermissionExpiration` | `'never' \| number`；页面说明当前权限会永久授予。 |
| `PermissionResponse` | `canAskAgain: boolean`、`expires: PermissionExpiration`、`granted: boolean`、`status: PermissionStatus`。 |

API 页概述提及 `MagnetometerUncalibrated` 可读取未校准原始值，并在 API 导入行展示该导出；当前页面的类方法 / 类型目录只展开了 `Magnetometer` 与校准后的 `MagnetometerMeasurement`，未列出 Uncalibrated 的独立属性表。

## 权限状态枚举

| 成员 | 字符串值 | 含义 |
| --- | --- | --- |
| `DENIED` | `'denied'` | 用户已拒绝。 |
| `GRANTED` | `'granted'` | 用户已授权。 |
| `UNDETERMINED` | `'undetermined'` | 尚未授予或拒绝。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。
- 两版平台支持、示例流程、类方法、订阅接口、数据字段、权限结构和 Android 12 高采样率说明一致。
- Latest 和 v56 的页脚 Next 都是 Expo SDK MailComposer。

## 源页代码主题覆盖

- Installation / API import：列出 `expo-sensors` 的 npm、Yarn、pnpm、Bun 安装命令，已有 React Native 工程需接入 Expo；保留 `Magnetometer` / `MagnetometerUncalibrated` 命名导入。
- Usage：重写 x/y/z 状态、设置 1000ms / 16ms 更新间隔、订阅 / 移除 listener、React effect 装载 / 卸载清理、开始 / 停止和速度按钮及布局样式。
- Sensor methods：覆盖订阅管理、权限、availability、采样间隔和 Android 12 超 200Hz 的权限要求。
- Types / permissions：覆盖测量三轴、μT、时间戳秒、订阅 remove、PermissionResponse 字段和所有 PermissionStatus 值。
- 版本说明：源码指出有校准 / 原始未校准传感器；但本参考页未展开 `MagnetometerUncalibrated` 的独立方法和类型表，文中明确此文档边界。

**翻页：**[上一页：Expo SDK Location 定位、权限与后台跟踪](./180-Expo-SDK-Location.md) · [目录](./README.md) · [下一页：Expo SDK MailComposer](./182-Expo-SDK-MailComposer.md)
