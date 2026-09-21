# 209｜Expo SDK TrackingTransparency 跟踪授权

**翻页：**[上一页：Expo SDK TaskManager 后台任务](./208-Expo-SDK-TaskManager.md) · [目录](./README.md) · [下一页：Expo SDK Updates 应用更新](./210-Expo-SDK-Updates.md)

**官方页面：**[TrackingTransparency · Latest](https://docs.expo.dev/versions/latest/sdk/tracking-transparency/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/tracking-transparency/)

**版本与平台：**Latest 与 SDK v56 文档均标明 `expo-tracking-transparency ~56.0.5`。库支持 Android、iOS、tvOS，并包含在 Expo Go 中。平台之间的授权语义不同：iOS 使用 App Tracking Transparency 授权；Android / Web 的此库 API 会报告授权状态为 `granted`。

## App Tracking Transparency 是什么

`expo-tracking-transparency` 管理应用访问可用于跟踪用户或设备的数据时所需的跟踪授权，并提供广告标识符 API。官方举例包括电子邮件地址、设备 ID 和广告 ID 等可用于跨服务关联的信息。

iOS 系统设置 **Allow Apps to Request to Track** 关闭时，请求会被拒绝。应用必须配置 `NSUserTrackingUsageDescription`，说明为什么需要跟踪用户或设备；Expo 官方文档提示，没有这段用途说明会导致 App 被 Apple 拒绝。

安装：

```sh
npx expo install expo-tracking-transparency
yarn expo install expo-tracking-transparency
pnpm expo install expo-tracking-transparency
bun expo install expo-tracking-transparency
```

## 配置权限用途说明

推荐通过 config plugin 在 `app.json` 中设置用户可读的 iOS 提示文案。Config plugin（配置插件）会在 Expo 生成原生工程时写入配置；修改后需要重新构建原生应用。以下字符串会成为 iOS 系统授权弹窗中的解释：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-tracking-transparency",
        {
          "userTrackingPermission": "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ]
  }
}
```

| 插件属性 | 默认值 | 作用 |
| --- | --- | --- |
| `userTrackingPermission` | `Allow this app to collect app-related data that can be used for tracking you or your device.` | iOS 专属；写入 Info.plist 的 `NSUserTrackingUsageDescription`。应改成符合本应用真实用途的解释。 |

### 不使用 CNG 时的原生配置

如果使用手动维护的 React Native 原生工程，需要在 Android Manifest 声明 Google Advertising ID 权限，并在 iOS Info.plist 设置用途说明。

Android：`android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

iOS：`ios/[app]/Info.plist`

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Your custom usage description string here.</string>
```

## 请求授权

```tsx
import { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        console.log('Yay! I have user permission to track data');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Tracking Transparency Module Example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

系统会记住用户的选择；官方说明一般只有卸载后重新安装 App 才会再次显示授权请求。Android 和 Web 上 `requestTrackingPermissionsAsync()` 始终返回 granted，这表示该 API 在这些平台的状态结果，并不等价于 iOS 式系统弹窗。

## API

```ts
import * as ExpoTrackingTransparency from 'expo-tracking-transparency';
```

### `useTrackingPermissions(options?)`

| 方面 | 说明 |
| --- | --- |
| 参数 | 可选 `PermissionHookOptions<object>`。 |
| 返回 | `[PermissionResponse \| null, requestPermission, getPermission]`。 |
| 平台 | Android、iOS、tvOS。 |
| 行为 | 检查当前状态并提供请求 / 再读取权限的方法。iOS 用户拒绝后，文档说明尝试读取 IDFA 会返回由系统保护的全零字符串。Android / Web 此权限 API 始终报告 granted。 |

基础 Hook 示例：

```ts
import { useTrackingPermissions } from 'expo-tracking-transparency';

const [status, requestPermission] = useTrackingPermissions();
```

### 方法

| 方法 | 返回值 | 作用与平台行为 |
| --- | --- | --- |
| `getAdvertisingId()` | `string \| null` | 读取用于广告的 UUID。Android 返回 AAID；iOS 返回 IDFA。不要把它长期保存；用户可以重置 ID 或更改跟踪设置，需要使用时再读取。 |
| `getTrackingPermissionsAsync()` | `Promise<PermissionResponse>` | 检查当前授权状态。Android / Web 始终报告 granted。 |
| `isAvailable()` | `boolean` | 检查当前设备是否提供 Tracking Transparency API。API 不可用时，读取和请求权限的方法会返回 granted。 |
| `requestTrackingPermissionsAsync()` | `Promise<PermissionResponse>` | 请求用户授权或拒绝跟踪。iOS 会显示系统授权；Android / Web 始终报告 granted。系统会记住 iOS 用户的选择。 |

获取广告 ID 的官方示例：

```ts
import * as ExpoTrackingTransparency from 'expo-tracking-transparency';

ExpoTrackingTransparency.getAdvertisingId();
// "E9228286-4C4E-4789-9D95-15827DCB291B"
```

检查现有权限：

```ts
import * as ExpoTrackingTransparency from 'expo-tracking-transparency';

const { granted } = await ExpoTrackingTransparency.getTrackingPermissionsAsync();
if (granted) {
  // 应用有权跟踪用户或其设备。
}
```

请求权限并判断结果：

```ts
import * as ExpoTrackingTransparency from 'expo-tracking-transparency';

const { granted } = await ExpoTrackingTransparency.requestTrackingPermissionsAsync();

if (granted) {
  // 应用有权跟踪用户或其设备。
}
```

### 广告 ID 的 `null` 条件

`getAdvertisingId()` 返回 `UUID string` 或 `null`。文档列出的 `null` 条件包括：

- Android 开启限制广告跟踪（`isLimitAdTrackingEnabled()`）。
- iOS 模拟器（无论其它设置如何）。
- iOS 尚未请求授权、用户拒绝，或配置文件限制了广告标识符访问。
- iOS 系统级 **Allow Apps to Request to Track** 开关已关闭。

需要注意：页面一方面说明 iOS 拒绝后读取 IDFA 会得到全零字符串，另一方面 `getAdvertisingId()` 的返回说明列出了拒绝后返回 `null`。调用 Expo API 时应按 `string | null` 处理返回值，不要依赖拒绝状态下某种具体 ID 内容。

## 权限类型

| 类型 | 字段 / 取值 | 说明 |
| --- | --- | --- |
| `PermissionExpiration` | `'never' \| number` | 权限过期时间；当前此类权限会永久授权。 |
| `PermissionHookOptions` | `PermissionHookBehavior \| Options` | Hook 行为 / 配置选项联合类型。 |
| `PermissionResponse` | `canAskAgain: boolean`、`expires: PermissionExpiration`、`granted: boolean`、`status: PermissionStatus` | 权限查询或请求的结果。`canAskAgain` 为 `false` 时应引导用户到系统设置修改。 |
| `PermissionStatus` | `'undetermined'`、`'granted'`、`'denied'` | 用户尚未选择、已授权、已拒绝。 |

### 原生权限清单

| 平台 | 权限 / Info.plist 键 | 说明 |
| --- | --- | --- |
| Android | `com.google.android.gms.permission.AD_ID` | 此权限由库的 AndroidManifest 自动添加。使用 Google Play services Advertising ID 且目标 Android 13（API 33）以上时需要。 |
| iOS | `NSUserTrackingUsageDescription` | 用系统文字说明请求访问可用于跟踪用户 / 设备的数据的原因。 |

## 新手名词解释

- **ATT（App Tracking Transparency）：**Apple 的应用跟踪透明度框架；iOS 在读取广告 ID 等跟踪标识符前要求获得用户授权。
- **IDFA：**Identifier for Advertisers，iOS 的广告标识符。是否可读取受 ATT 授权和系统设置控制。
- **AAID：**Android Advertising ID，Android 上可重置的广告标识符；支持多用户的设备可能为同一台硬件上的不同用户提供不同 ID。
- **`NSUserTrackingUsageDescription`：**iOS 系统授权提示中的用途说明键；面向用户解释数据将怎样用于跟踪。
- **CNG / config plugin：**Expo 生成原生工程时运行插件；它写入原生构建配置，更新后需要重新构建 App。

## 源页代码主题覆盖

- Installation：覆盖 npx、Yarn、pnpm、Bun 四种安装命令。
- Configuration：覆盖 config plugin、Android Manifest 与 iOS Info.plist 示例。
- Usage：保留官方完整 React Native 权限请求示例。
- Hooks：覆盖 `useTrackingPermissions()` 的返回值说明和代码示例。
- Methods：覆盖 API 导入、广告 ID、读取 / 请求授权、检测 API 可用性及所有源页代码示例。
- Types / Permissions：覆盖授权结果字段、过期类型、状态枚举以及 Android / iOS 原生权限。
- Latest 与 SDK v56 均标明 `~56.0.5`，主要 API / 类型 / Next 一致；Latest 的文档格式和表格略有更新。

**翻页：**[上一页：Expo SDK TaskManager 后台任务](./208-Expo-SDK-TaskManager.md) · [目录](./README.md) · [下一页：Expo SDK Updates 应用更新](./210-Expo-SDK-Updates.md)
