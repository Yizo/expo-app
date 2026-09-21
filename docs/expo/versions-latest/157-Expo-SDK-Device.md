# 157｜Expo SDK Device 设备信息

**翻页：**[上一页：Expo SDK DevClient 开发客户端](./156-Expo-SDK-DevClient.md) · [目录](./README.md) · [下一页：Expo SDK DeviceMotion 设备运动](./158-Expo-SDK-DeviceMotion.md)

**官方页面：**[Device · Latest](https://docs.expo.dev/versions/latest/sdk/device/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/device/)

**版本与平台：**Latest 推荐 `expo-device ~57.0.2`，SDK v56.0.0 推荐 `~56.0.4`。支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中。两版页面的属性、方法和平台说明一致，只有推荐安装的包版本不同。

## 读取设备与系统信息

`expo-device` 提供设备型号、制造商、操作系统版本、可用内存、设备类型等信息。它读取的是当前物理设备 / 模拟器的硬件与系统属性；不要把这些字段当成项目的 app config 或构建版本。

安装时使用 `expo install` 选择与当前 SDK 匹配的版本：

```sh
npx expo install expo-device
# 也可以使用：yarn expo install expo-device
# 或：pnpm expo install expo-device
# 或：bun expo install expo-device
```

官方 Usage 示例读取制造商和更易读的型号名称，再显示在 React Native 页面中：

```tsx
import { Text, View } from 'react-native';
import * as Device from 'expo-device';

export default function DeviceSummary() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>
        {Device.manufacturer ?? '未知制造商'}：{Device.modelName ?? '未知型号'}
      </Text>
    </View>
  );
}
```

API 命名空间导入：

```ts
import * as Device from 'expo-device';
```

## 设备属性

表中 `null` 表示平台无法提供或无法识别该字段。浏览器环境下某些字段固定为 `null`，而 `Device.isDevice` 在 Web 固定为 `true`，所以它不是判断用户是否真的使用手机的通用方法。

| 属性 | 类型 / 平台 | 说明 |
| --- | --- | --- |
| `brand` | `string \| null`；Android、iOS；Web 为 `null` | 面向消费者的设备品牌，例如 Android 的 `google` / `xiaomi`、iOS 的 `Apple`。 |
| `designName` | `string \| null`；Android；iOS / Web 为 `null` | Android 工业设计 / 设备代号，映射 `Build.DEVICE`。 |
| `deviceName` | `string \| null`；Android / iOS / tvOS / Web | 用户可能修改的人类可读设备名；不能取到时为 `null`。iOS 16+ 未加入相应 entitlement 时会显示通用名称 `iPhone`。 |
| `deviceType` | `DeviceType \| null`；四个平台 | 当前设备类型枚举值；Android 普通设备根据屏幕对角线估算，可能不准确。 |
| `deviceYearClass` | `number \| null`；四个平台；Web 为 `null` | Expo 提供的设备性能年代类别估计。 |
| `isDevice` | `boolean`；四个平台 | 真机为 `true`，模拟器 / 仿真器为 `false`；Web 始终为 `true`。 |
| `manufacturer` | `string \| null`；四个平台 | 实际设备制造商；Android 的 `brand` 和 `manufacturer` 含义不同。 |
| `modelId` | 文档类型 `any`；仅 iOS | Apple 内部型号 ID（例如 `iPhone7,2`），供程序识别型号，不适合直接展示给用户；Android / Web 为 `null`。 |
| `modelName` | `string \| null`；四个平台 | 面向人的设备型号名称，例如 Pixel 2、iPhone XS Max；无法识别时为 `null`。 |
| `osBuildFingerprint` | `string \| null`；仅 Android | Android 系统构建指纹；iOS / Web 为 `null`。 |
| `osBuildId` | `string \| null`；Android / iOS / tvOS | 系统的详细构建 ID；Web 为 `null`。Android 映射 `Build.DISPLAY`，iOS 对应 `kern.osversion`。 |
| `osInternalBuildId` | `string \| null`；Android / iOS / tvOS | 系统内部构建 ID；Android 对应 `Build.ID`，iOS 与 `osBuildId` 相同；Web 为 `null`。 |
| `osName` | `string \| null`；四个平台 | 操作系统名称。Android 的底层字段可能是 `Android`，也可能是构建指纹；若要区分 Android / iOS 系列，应使用 `Platform.OS`。 |
| `osVersion` | `string \| null`；四个平台 | 面向人的系统版本字符串，不保证始终是三个点分隔的数字。 |
| `platformApiLevel` | `number \| null`；仅 Android | 当前 Android SDK API level；不是直接的 Android 营销版本号。iOS / Web 为 `null`。 |
| `productName` | `string \| null`；仅 Android | 设备实现方设置的产品 / 代号，对应 `Build.PRODUCT`；iOS / Web 为 `null`。 |
| `supportedCpuArchitectures` | `string[] \| null`；四个平台 | 当前设备支持的 CPU 架构列表；浏览器或无法检测时可能为 `null`。 |
| `totalMemory` | `number \| null`；四个平台；Web 为 `null` | 设备可由内核访问的总内存，单位是**字节**；这不等于单个应用可用的内存上限。 |

### 一次读取多个属性

官方属性示例是读取 `Device.brand`、`Device.designName` 等单项值。下面合并这些代码主题为一个快照对象；各平台不支持的字段仍可能是 `null`：

```ts
import * as Device from 'expo-device';

const snapshot = {
  brand: Device.brand,
  designName: Device.designName,
  deviceName: Device.deviceName,
  deviceType: Device.deviceType,
  deviceYearClass: Device.deviceYearClass,
  isDevice: Device.isDevice,
  manufacturer: Device.manufacturer,
  modelId: Device.modelId,
  modelName: Device.modelName,
  osBuildFingerprint: Device.osBuildFingerprint,
  osBuildId: Device.osBuildId,
  osInternalBuildId: Device.osInternalBuildId,
  osName: Device.osName,
  osVersion: Device.osVersion,
  platformApiLevel: Device.platformApiLevel,
  productName: Device.productName,
  supportedCpuArchitectures: Device.supportedCpuArchitectures,
  totalMemory: Device.totalMemory,
};
```

`manufacturer` 是硬件实际生产者；`brand` 是产品对用户使用的品牌；`modelName` 是易读型号名称；`modelId` 是平台内部标识。业务 UI 通常显示 `manufacturer` 和 `modelName`，而设备诊断、分群统计才可能需要构建 ID、ABI 或设备类型。

## 异步查询方法

| 方法 | 平台 | 返回 | 用途与边界 |
| --- | --- | --- | --- |
| `Device.getDeviceTypeAsync()` | Android / iOS / tvOS / Web | `Promise<DeviceType>` | 异步取得设备类型。Android 非电视设备按屏幕尺寸估算：对角线约 3–6.9 英寸是 PHONE，7–18 英寸是 TABLET，其它返回 UNKNOWN；这只是启发式判断。 |
| `Device.getMaxMemoryAsync()` | Android | `Promise<number>` | Java VM 尝试使用的最大内存，单位字节；无限制时返回 `Number.MAX_SAFE_INTEGER`。 |
| `Device.getPlatformFeaturesAsync()` | Android | `Promise<string[]>` | 读取 Android 系统特性名称；iOS / Web 总是返回空数组。 |
| `Device.getUptimeAsync()` | Android / iOS | `Promise<number>` | 设备上次重启后的毫秒数；Android 不计算深度休眠时间。 |
| `Device.hasPlatformFeatureAsync(feature)` | Android | `Promise<boolean>` | 判断设备是否支持给定 Android system feature；iOS / Web 总是 `false`。 |
| `Device.isRootedExperimentalAsync()` | Android / iOS / tvOS / Web | `Promise<boolean>` | 实验性检查 Android root / iOS jailbreak；不可靠且可绕过，Web 总是 `false`。 |
| `Device.isSideLoadingEnabledAsync()` | Android | `Promise<boolean>` | 检查是否允许通过 `ACTION_INSTALL_PACKAGE` 等系统机制从默认应用商店以外安装包；需要 Android `REQUEST_INSTALL_PACKAGES` 权限。 |

示例覆盖源页中的每个方法：

```ts
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const deviceType = await Device.getDeviceTypeAsync();
const rootCheck = await Device.isRootedExperimentalAsync();

if (Platform.OS === 'android') {
  const maxMemory = await Device.getMaxMemoryAsync();
  const systemFeatures = await Device.getPlatformFeaturesAsync();
  const hasFireTVFeature = await Device.hasPlatformFeatureAsync('amazon.hardware.fire_tv');
  const canSideLoad = await Device.isSideLoadingEnabledAsync();
  console.log({ maxMemory, systemFeatures, hasFireTVFeature, canSideLoad });
}

let uptimeMs: number | null = null;
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  uptimeMs = await Device.getUptimeAsync();
}

console.log({ deviceType, rootCheck, uptimeMs });
```

`getPlatformFeaturesAsync()` 是列出 Android 功能名的方法。源页的 `hasPlatformFeatureAsync` 描述里误提 `getSystemFeatureAsync()`；同页 API 列表中实际方法名为 `getPlatformFeaturesAsync()`，本篇按 API 标题使用。

Root / jailbreak 检测仅作为信号，不是安全保证。Android 检测会搜索 `su` 文件路径，未 root 的设备也可能有同名文件；iOS 检测可被 hook / 绕过；源页还指出 Web 永远返回 `false`。当无法读取系统文件时，可能抛出 `ERR_DEVICE_ROOT_DETECTION`。

## `DeviceType` 枚举

| 成员 | 数值 | 含义 |
| --- | --- | --- |
| `UNKNOWN` | `0` | 无法识别设备类型。 |
| `PHONE` | `1` | 手机。 |
| `TABLET` | `2` | 平板电脑。 |
| `DESKTOP` | `3` | 台式或笔记本电脑。 |
| `TV` | `4` | 电视设备。 |

## 源页代码覆盖与版本差异

- Installation：覆盖 npm / Yarn / pnpm / Bun 安装命令。
- Usage：覆盖显示制造商和型号名的 React Native 示例。
- Constants：把 `brand`、`designName`、`deviceName`、`deviceType`、`deviceYearClass`、`isDevice`、`manufacturer`、`modelId`、`modelName`、各 OS build 字段、`osName`、`osVersion`、`platformApiLevel`、`productName`、架构和总内存的属性读取片段合并到一个快照示例，并在属性表保留所有平台返回差异。
- Methods：逐个覆盖 `getDeviceTypeAsync`、`getMaxMemoryAsync`、`getPlatformFeaturesAsync`、`getUptimeAsync`、`hasPlatformFeatureAsync`、`isRootedExperimentalAsync`、`isSideLoadingEnabledAsync` 示例主题。
- Enums / Errors：覆盖 `DeviceType` 五种值和 `ERR_DEVICE_ROOT_DETECTION`。
- Latest `~57.0.2` 与 SDK v56 `~56.0.4` 的属性、方法和代码内容一致；Next 两版均为 DeviceMotion。

**翻页：**[上一页：Expo SDK DevClient 开发客户端](./156-Expo-SDK-DevClient.md) · [目录](./README.md) · [下一页：Expo SDK DeviceMotion 设备运动](./158-Expo-SDK-DeviceMotion.md)
