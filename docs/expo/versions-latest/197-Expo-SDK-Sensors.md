# 197｜Expo SDK Sensors 设备传感器总览

**翻页：**[上一页：Expo SDK SecureStore 安全键值存储](./196-Expo-SDK-SecureStore.md) · [目录](./README.md) · [下一页：Expo SDK Server](./198-Expo-SDK-Server.md)

**官方页面：**[Sensors · Latest](https://docs.expo.dev/versions/latest/sdk/sensors/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/sensors/)

**版本与平台：**Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。模块支持 Android、iOS、Web，包含在 Expo Go 中。两版总览页 API / 平台表相同。

## 模块总览

`expo-sensors` 提供读取设备物理传感器的 API。传感器产生的数据不同于浏览器 DOM 的屏幕尺寸，也不同于 Expo Router 屏幕方向锁定；它来自设备的加速度计、陀螺仪等硬件或系统服务。

| 传感器 | 读数 / 用途 | 平台 |
| --- | --- | --- |
| `Accelerometer` | 设备线性加速度变化，可用于运动 / 摇动等交互。 | Android、iOS、Web |
| `Barometer` | 气压。 | Android、iOS |
| `DeviceMotion` | 综合设备运动与方向信息。 | Android、iOS、Web |
| `Gyroscope` | 设备绕轴旋转速度 / 旋转变化。 | Android、iOS、Web |
| `LightSensor` | 环境光照强度。 | Android |
| `Magnetometer` | 磁场读数，可用于磁方向估计。 | Android、iOS |
| `MagnetometerUncalibrated` | 未校准磁力计接口。 | 导出项；具体平台能力见对应传感器页 |
| `Pedometer` | 步数。 | Android、iOS |

每个传感器页面分别说明权限、数据结构、更新间隔以及订阅清理方式。没有传感器的模拟器、浏览器或设备可能回报不可用；功能代码应处理不可用 / 权限拒绝，而非假设硬件始终存在。

## 安装与导入

```sh
npx expo install expo-sensors
yarn expo install expo-sensors
pnpm expo install expo-sensors
bun expo install expo-sensors
```

已有 React Native 工程要先集成 `expo`。可用命名空间导入整个模块，也可以只导入需要的传感器：

```ts
import * as Sensors from 'expo-sensors';

// 或只导入实际使用的 API
import {
  Accelerometer,
  Barometer,
  DeviceMotion,
  Gyroscope,
  LightSensor,
  Magnetometer,
  MagnetometerUncalibrated,
  Pedometer,
} from 'expo-sensors';
```

## 原生权限与构建配置

使用 CNG / config plugins 时，`expo-sensors` 插件的 `motionPermission` 为 iOS 设置 `NSMotionUsageDescription` 用户提示，也可设为 `false` 关闭该权限说明：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sensors",
        {
          "motionPermission": "允许 $(PRODUCT_NAME) 读取设备运动数据。"
        }
      ]
    ]
  }
}
```

`motionPermission` 默认是系统英文说明，只有 iOS 使用。插件设置属于构建配置，修改后要重新构建 app binary。已有原生 iOS 项目 / 不使用 CNG 时，在 `Info.plist` 手动添加 usage description：

```xml
<key>NSMotionUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 读取设备运动数据。</string>
```

## Android 高采样率

Android 12（API 31）开始，系统对每种传感器的更新采样率限制为 200Hz。若确实需要高于 200Hz 的更新频率，app config 的 `expo.android.permissions` 数组要添加 `HIGH_SAMPLING_RATE_SENSORS`：

```json
{
  "expo": {
    "android": {
      "permissions": ["HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

不使用 CNG 或手动维护原生 Android 工程时，将权限加到 `android/app/src/main/AndroidManifest.xml`：

```xml
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
```

普通传感器 UI 通常不需超过 200Hz；仅在确有高频采样需要时配置权限。原生 manifest / app config 变更后需要重新构建。

## 订阅数据时的通用模式

该总览页没有完整的数据读取 Demo；各传感器采用各自 API。通常在组件 mount 时添加 subscription，在卸载时调用 `subscription.remove()`，并在设置更新间隔时控制 CPU / 电量成本。可参考单项页面：[Accelerometer](https://docs.expo.dev/versions/latest/sdk/accelerometer/)、[DeviceMotion](https://docs.expo.dev/versions/latest/sdk/devicemotion/) 和 [Pedometer](https://docs.expo.dev/versions/latest/sdk/pedometer/)。

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐依赖 | `expo-sensors ~57.0.3` | `~56.0.6` |
| 导出项、平台清单、配置和 200Hz 权限说明 | 与 v56 页面一致 | 与 Latest 页面一致 |
| 官方页脚 Next | Server | Server |

## 官方源页代码主题覆盖

- 安装命令：覆盖 npx、Yarn、pnpm、Bun。
- Config plugin：重写 `motionPermission` / `NSMotionUsageDescription` app config 和 iOS Info.plist 示例。
- 导入示例：保留 namespace import 和八个 sensor 导入项，包括 `MagnetometerUncalibrated`。
- Android permissions：重写 `expo.android.permissions` 和原生 manifest 的高采样率权限代码，解释 Android 12 的 200Hz 限制。
- Available sensors：本地表列出每个 API 的用途和官方平台标注；该源页没有传感器事件订阅的 runnable demo。

**翻页：**[上一页：Expo SDK SecureStore 安全键值存储](./196-Expo-SDK-SecureStore.md) · [目录](./README.md) · [下一页：Expo SDK Server](./198-Expo-SDK-Server.md)
