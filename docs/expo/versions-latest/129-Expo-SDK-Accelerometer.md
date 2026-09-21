# 129｜Expo SDK Accelerometer 加速度计

**翻页：**[上一页：Expo SDK Expo 通用 API](./128-Expo-SDK-Expo.md) · [目录](./README.md) · [下一页：Expo SDK AgeRange](./130-Expo-SDK-AgeRange.md)

**官方页面：**[Accelerometer · Latest](https://docs.expo.dev/versions/latest/sdk/accelerometer/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/accelerometer/)

**版本边界：**Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。此模块支持 Android、iOS 真机和 Web；iOS Simulator 不提供真实加速度计数据。两个版本的主要示例和 API 结构一致。

## 读取设备运动

`Accelerometer` 来自 `expo-sensors`，用于读取设备沿三维坐标轴的加速度 / 振动数据。数据以 g-force（g）为单位，`1g = 9.81 m/s²`。使用前要确认当前设备、权限及平台环境允许访问传感器。

安装（选择一个包管理器）：

~~~sh
npx expo install expo-sensors
yarn expo install expo-sensors
pnpm expo install expo-sensors
bun expo install expo-sensors
~~~

## 基本用法：订阅加速度并调节频率

示例在 mount 时订阅传感器，显示 `x` / `y` / `z`，用按钮切换监听、慢速（1 秒一次）和快速（16 毫秒一次）；卸载组件时移除订阅：

~~~tsx
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(16);

  const _subscribe = () => {
    setSubscription(Accelerometer.addListener(setData));
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});
~~~

`addListener` 返回一个订阅对象。停止监听时调用 `subscription.remove()`；若订阅由 React 组件创建，要在 effect cleanup 时移除，避免组件卸载后仍持续收集传感器数据。

## API 方法速查

~~~tsx
import { Accelerometer } from 'expo-sensors';
~~~

| 方法 | 参数 / 返回值 | 说明 |
| --- | --- | --- |
| `addListener(listener)` | `(measurement) => void`；返回 `EventSubscription` | 订阅新测量数据；listener 收到一个 `AccelerometerMeasurement`。对返回订阅调用 `remove()` 可取消。 |
| `getListenerCount()` | 返回 `number` | 已注册监听器数量。 |
| `getPermissionsAsync()` | `Promise<PermissionResponse>` | 查询传感器权限。 |
| `hasListeners()` | 返回 `boolean` | 是否已有传感器监听器。 |
| `isAvailableAsync()` | `Promise<boolean>` | 检查加速度计是否可用。调用传感器前应先检查。 |
| `removeAllListeners()` | 返回 `void` | 删除所有监听器；**已弃用**，优先移除每个 `addListener` 返回的 subscription。 |
| `removeSubscription(subscription)` | 接收 `EventSubscription`；返回 `void` | 删除指定订阅。 |
| `requestPermissionsAsync()` | `Promise<PermissionResponse>` | 请求访问传感器的权限。 |
| `setUpdateInterval(intervalMs)` | 毫秒数 `number`；返回 `void` | 设置传感器更新间隔。 |

## 平台与权限注意事项

- iOS 仅设备支持；模拟器没有可用的真实加速度计。
- 移动 Web 需要先在用户手势（如触摸事件）中调用 `requestPermissionsAsync()`。如果授权状态不是 `granted`，需告知用户检查系统设置。
- Web 的 `isAvailableAsync()` 会等待传感器事件来判断功能是否可用；iOS Safari 的 Motion & Orientation Access 关闭、浏览器设备实现差异、站点未通过 HTTPS 提供等情况，可能导致结果不可靠。
- Android 12（API 31）开始，每个传感器默认受 200Hz 采样率限制。若要请求高于 200Hz 的采样频率，需在 `app.json` 的 `android.permissions` 加入 `android.permission.HIGH_SAMPLING_RATE_SENSORS`；手动维护原生工程则在 `AndroidManifest.xml` 加 `<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS"/>`。

## 测量值与权限对象

### `AccelerometerMeasurement`

每条传感器测量包含时间戳和三个轴向的 g-force：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `timestamp` | `number` | 测量时间戳，单位秒。 |
| `x` | `number` | X 轴加速度，单位 g。 |
| `y` | `number` | Y 轴加速度，单位 g。 |
| `z` | `number` | Z 轴加速度，单位 g。 |

### `PermissionResponse`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `canAskAgain` | `boolean` | 是否还能再次请求该权限；若不能，可引导用户前往设置。 |
| `expires` | `PermissionExpiration` | 权限到期规则。 |
| `granted` | `boolean` | 便捷的已授权判断。 |
| `status` | `PermissionStatus` | 权限状态：`DENIED`（拒绝）、`GRANTED`（允许）、`UNDETERMINED`（尚未决定）。 |

`PermissionExpiration` 可为 `'never'` 或 `number`；Expo 当前权限通常是永久授权 (`'never'`)。`Subscription.remove()` 用于移除该订阅创建的监听器；调用后不再接收事件。

### Android 高采样率配置示例

Expo 配置中可显式声明权限：

~~~json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
~~~

原生 Android manifest 形式为：

~~~xml
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
~~~

## 新手术语

- **加速度计（accelerometer）：**测量设备相对空间的加速度变化，可用于倾斜控制、运动感知等功能。
- **三轴（X / Y / Z）：**沿设备三个互相垂直方向测得的加速度分量。
- **g-force / g：**相对地球重力加速度的单位；`1g` 约等于 `9.81 m/s²`。
- **事件订阅（subscription）：**注册一个回调以持续接收测量；不再需要时应调用 `remove()` 清理。
- **采样间隔（update interval）：**传感器两次推送数据之间的期望时间；间隔越短，数据越频繁，也越可能耗电或受系统上限约束。
- **采样率：**每秒采集的次数；约 `16ms` 间隔对应每秒约 62.5 次更新。

## 源页代码主题覆盖

已重写官方完整传感器示例（订阅、显示三轴数据、切换采样间隔、卸载时清理），并列出四种包管理器的安装命令；补充 API 导入、高采样率的 app config 与原生 Manifest 配置。其它 API 方法和测量 / 权限结构按源页参考表逐项说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/accelerometer/) · [SDK v56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/accelerometer/)

**翻页：**[上一页：Expo SDK Expo 通用 API](./128-Expo-SDK-Expo.md) · [目录](./README.md) · [下一页：Expo SDK AgeRange](./130-Expo-SDK-AgeRange.md)
