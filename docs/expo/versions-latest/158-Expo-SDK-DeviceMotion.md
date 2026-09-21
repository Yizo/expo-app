# 158｜Expo SDK DeviceMotion 设备运动传感器

**翻页：**[上一页：Expo SDK Device 设备信息](./157-Expo-SDK-Device.md) · [目录](./README.md) · [下一页：Expo SDK DevMenu 开发者菜单](./159-Expo-SDK-DevMenu.md)

**官方页面：**[DeviceMotion · Latest](https://docs.expo.dev/versions/latest/sdk/devicemotion/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/devicemotion/)

**版本与平台：**Latest 推荐 `expo-sensors ~57.0.3`，SDK v56.0.0 推荐 `~56.0.6`。DeviceMotion 支持 Android、iOS 和 Web，包含在 Expo Go 中。两版传感器数据、权限、事件订阅和 Next 内容相同；安装版本号不同。

## 传感器读数与坐标轴

DeviceMotion 从设备的运动 / 方向传感器读取加速度与旋转信息。它不是屏幕 UI 组件，而是持续产生测量值的传感器类；通常订阅一次 `addListener`，收到读数后更新 React state，组件卸载时再取消订阅。

设备处于**竖屏方向**时，三轴定义为：X 从左向右，Y 从底部向顶部，Z 垂直穿过屏幕，从机身背面指向屏幕正面。横竖屏旋转时，`orientation` 会说明屏幕旋转角度。

安装 `expo-sensors`（DeviceMotion 位于这个包内）：

```sh
npx expo install expo-sensors
# 也可以使用：yarn expo install expo-sensors
# 或：pnpm expo install expo-sensors
# 或：bun expo install expo-sensors
```

### iOS 权限说明

CNG 项目可在 config plugin 中设置 `motionPermission` 文案；它会配置 iOS 的 `NSMotionUsageDescription`，修改后需要重新构建原生 app：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sensors",
        {
          "motionPermission": "允许 $(PRODUCT_NAME) 访问设备运动数据。"
        }
      ]
    ]
  }
}
```

如果项目手动维护 iOS 工程，则在 `ios/<App>/Info.plist` 写用途说明：

```xml
<key>NSMotionUsageDescription</key>
<string>允许应用访问设备运动数据。</string>
```

## 请求权限、订阅并显示读数

Web 的设备运动 API 受浏览器和安全上下文限制。移动 Web 页面应从用户触摸等交互事件里调用 `requestPermissionsAsync()`；通常也需要 HTTPS。先检查权限和传感器可用性，再订阅更新。React effect 清理函数通过 `subscription.remove()` 取消监听：

```tsx
import { useEffect, useRef, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';

export default function MotionSensorExample() {
  const [measurement, setMeasurement] = useState<DeviceMotionMeasurement | null>(null);
  const [message, setMessage] = useState('尚未读取传感器');
  const subscription = useRef<{ remove: () => void } | null>(null);

  async function startListening() {
    const permission = await DeviceMotion.requestPermissionsAsync();
    if (!permission.granted) {
      setMessage('没有获得运动数据权限');
      return;
    }

    const available = await DeviceMotion.isAvailableAsync();
    if (!available) {
      setMessage('当前设备或浏览器无法提供运动数据');
      return;
    }

    DeviceMotion.setUpdateInterval(100);
    subscription.current?.remove();
    subscription.current = DeviceMotion.addListener(setMeasurement);
    setMessage('正在读取运动数据');
  }

  useEffect(() => () => subscription.current?.remove(), []);

  return (
    <View style={{ padding: 20 }}>
      <Button title="开始读取" onPress={() => void startListening()} />
      <Text>{message}</Text>
      <Text>
        加速度：{measurement?.acceleration
          ? `${measurement.acceleration.x.toFixed(2)}, ${measurement.acceleration.y.toFixed(2)}, ${measurement.acceleration.z.toFixed(2)}`
          : '暂无值'}
      </Text>
      <Text>屏幕方向：{measurement?.orientation ?? '未知'}</Text>
    </View>
  );
}
```

`getPermissionsAsync()` 可先检查授权；`requestPermissionsAsync()` 发起请求。权限响应有 `granted`、`status`、`canAskAgain` 和 `expires`。若拒绝后不能再次询问，应提示用户前往系统设置。Web 的 `isAvailableAsync()` 会等待一段时间看是否有事件，用来推测 Safari 中 Motion & Orientation Access 是否关闭；网页未通过 HTTPS 提供、部分浏览器限制等都会让检查不稳定。

## 数据结构和单位

| 字段 | 类型 / 单位 | 说明 |
| --- | --- | --- |
| `acceleration` | `null \| { x, y, z, timestamp }`；m/s² | 去掉重力后的设备加速度；某些平台可能是 `null`。 |
| `accelerationIncludingGravity` | `{ x, y, z, timestamp }`；m/s² | 包含重力影响的加速度。 |
| `rotation` | `{ alpha, beta, gamma, timestamp }`；角度 | 设备在空间中的方向角：alpha 绕 Z 轴，beta 绕 X 轴，gamma 绕 Y 轴。 |
| `rotationRate` | `null \| { alpha, beta, gamma, timestamp }`；度 / 秒 | 设备绕三个轴的旋转速度；某些平台可能为 `null`。 |
| `interval` | `number`；毫秒 | 原生平台采集数据的间隔。 |
| `orientation` | `DeviceMotionOrientation` | 根据屏幕旋转的朝向值：竖屏、横屏、倒置等。 |

竖屏坐标与朝向枚举值：`Portrait = 0`、`RightLandscape = 90`、`UpsideDown = 180`、`LeftLandscape = -90`。`Gravity` 常量（模块导出值以及 `DeviceMotion.Gravity` 属性）是地球标准重力加速度 `9.80665 m/s²`。

## 类方法和传感器更新

| 方法 | 返回 / 平台 | 用途 |
| --- | --- | --- |
| `DeviceMotion.addListener(listener)` | `EventSubscription`；Android / iOS / Web | 注册监听；回调收到 `DeviceMotionMeasurement`。完成后调用订阅对象的 `remove()`。 |
| `DeviceMotion.getListenerCount()` | `number` | 当前已注册的监听数。 |
| `DeviceMotion.hasListeners()` | `boolean` | 是否有监听器注册。 |
| `DeviceMotion.getPermissionsAsync()` | `Promise<PermissionResponse>` | 检查传感器权限。 |
| `DeviceMotion.requestPermissionsAsync()` | `Promise<PermissionResponse>` | 请求访问运动传感器权限；移动 Web 必须由用户手势触发。 |
| `DeviceMotion.isAvailableAsync()` | `Promise<boolean>` | 检查传感器是否可用；Web 上只是通过等待事件进行推测，可能不可靠。 |
| `DeviceMotion.setUpdateInterval(intervalMs)` | `void` | 设置希望的更新间隔，单位毫秒。 |
| `DeviceMotion.removeSubscription(subscription)` | `void` | 按订阅对象移除监听。 |
| `DeviceMotion.removeAllListeners()` | `void`，已弃用 | 删除所有监听；推荐用各自的 `subscription.remove()`。 |

Android 12（API 31）起，每个传感器默认限制为最高 200Hz。若应用确实要超过 200Hz，需在 app config 声明 `android.permission.HIGH_SAMPLING_RATE_SENSORS`；手动维护 Android 工程时则加到 Manifest：

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

```xml
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
```

## 源页代码覆盖与版本差异

- Installation：覆盖 npm / Yarn / pnpm / Bun 安装命令。
- Configuration：覆盖 iOS config plugin `motionPermission` 和 `NSMotionUsageDescription` Info.plist；覆盖 Android 12+ 高采样率权限的 app config / Manifest 写法。
- API import：覆盖 `import { DeviceMotion } from 'expo-sensors'`；类属性 `Gravity` 以及 `DeviceMotion.Gravity` 都有说明。
- Methods：以 React state + 用户交互的例子覆盖权限请求、可用性检查、设置采样间隔、订阅传感器更新与订阅清理；方法表覆盖 listener count、hasListeners、get/request permission、remove subscription、已弃用 removeAllListeners。
- Types / enums：覆盖 `DeviceMotionMeasurement` 每个字段、单位、null 情况、坐标轴、朝向枚举，以及 PermissionResponse / PermissionExpiration / PermissionStatus。
- Latest `expo-sensors ~57.0.3` 与 SDK v56 `~56.0.6` 的 API、平台 / 权限和示例主题一致；Next 两版均为 DevMenu。

**翻页：**[上一页：Expo SDK Device 设备信息](./157-Expo-SDK-Device.md) · [目录](./README.md) · [下一页：Expo SDK DevMenu 开发者菜单](./159-Expo-SDK-DevMenu.md)
