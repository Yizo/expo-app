# 143｜Expo SDK Brightness 屏幕亮度

**翻页：**[上一页：Expo SDK BlurView 背景模糊](./142-Expo-SDK-BlurView.md) · [目录](./README.md) · [下一页：Expo SDK Brownfield](./144-Expo-SDK-Brownfield.md)

**官方页面：**[Brightness · Latest](https://docs.expo.dev/versions/latest/sdk/brightness/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/brightness/)

**版本边界：**Latest 推荐 `expo-brightness ~57.0.2`；SDK v56.0.0 推荐 `~56.0.5`。两版接口与示例相同。该库可在 Android、iOS 与 Expo Go 使用；但全局系统亮度控制只有 Android 提供。iOS 可改变当前显示亮度，屏幕锁定或关机后会恢复用户默认设置。

## 屏幕亮度和系统亮度不是一回事

屏幕亮度值范围是 `0` 到 `1`，分别接近最低和最高亮度。Android 有两种设置：

- **当前 App Activity 亮度：**`setBrightnessAsync()` 对当前 Activity 生效，App 在前台时会覆盖系统亮度值。
- **全局系统亮度：**实验性的 `setSystemBrightnessAsync()` 会更改全局值并把自动亮度模式切成手动；需要用户授予修改系统设置的权限。

iOS 不允许 App 程序化修改系统全局亮度。`setBrightnessAsync()` 修改当前屏幕亮度，直到设备锁定后还原。改变全局亮度可能影响用户在 App 外的显示设置，应明确告知用户并在合适时恢复原值。

安装：

```sh
npx expo install expo-brightness
# 也可使用 yarn / pnpm / bun expo install expo-brightness
```

## Android 权限

若使用 Android 全局亮度 API，app config 的 `expo.android.permissions` 需要包含 `android.permission.WRITE_SETTINGS`。CNG 会从 app config 生成原生配置；手动维护工程时把权限加入 Manifest：

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.WRITE_SETTINGS"]
    }
  }
}
```

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.WRITE_SETTINGS" />
```

API 的授权状态以 `SYSTEM_BRIGHTNESS` 权限表示。全局修改还要通过 `requestPermissionsAsync()` 请求用户许可；iOS 不需要该权限。

## 基础用法

官方示例先请求权限，再将 Android 全局亮度设置为最大值。因为 `setSystemBrightnessAsync()` 是 Android 专用的实验 API，iOS 示例应使用 `setBrightnessAsync()` 修改当前屏幕亮度：

```tsx
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Brightness from 'expo-brightness';

export default function BrightnessExample() {
  useEffect(() => {
    async function setInitialBrightness() {
      if (Platform.OS === 'android') {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          // Android：实验性的系统级设置，影响 App 外亮度。
          await Brightness.setSystemBrightnessAsync(1);
        }
      } else if (Platform.OS === 'ios') {
        // iOS：影响当前屏幕，锁屏后恢复用户设置。
        await Brightness.setBrightnessAsync(1);
      }
    }

    void setInitialBrightness();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Brightness Module Example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

权限 Hook `usePermissions()` 同时读取并请求系统亮度权限。它返回 `[permissionResponse, requestPermission, getPermission]`；文档示例只解构前两项：

```ts
const [permissionResponse, requestPermission] = Brightness.usePermissions();
```

## 局部亮度、全局亮度和亮度模式

| API | 平台 | 作用 |
| --- | --- | --- |
| `getBrightnessAsync()` | Android / iOS | 读取主屏幕当前亮度，范围 `0`–`1`。 |
| `setBrightnessAsync(value)` | Android / iOS | 设置主屏幕 / 当前 Activity 亮度。Android 前台 Activity 会盖过系统亮度；iOS 锁屏后恢复用户默认。 |
| `getSystemBrightnessAsync()` | Android | 读取全局系统亮度，范围 `0`–`1`。 |
| `isUsingSystemBrightnessAsync()` | Android | 查看当前 Activity 是否沿用系统亮度，而非自己的覆盖值。 |
| `restoreSystemBrightnessAsync()` | Android | 让当前 Activity 恢复使用系统全局亮度。 |
| `getSystemBrightnessModeAsync()` | Android | 读取自动 / 手动系统亮度模式；需要系统亮度权限。 |
| `setSystemBrightnessAsync(value)` | Android，实验性 | 设置全局亮度并切换为手动模式；需要系统亮度权限。 |
| `setSystemBrightnessModeAsync(mode)` | Android | 设置系统自动 / 手动亮度模式。 |

```ts
const appBrightness = await Brightness.getBrightnessAsync();
await Brightness.setBrightnessAsync(0.6); // 当前 App 显示亮度

if (Platform.OS === 'android') {
  const systemBrightness = await Brightness.getSystemBrightnessAsync();
  const isUsingGlobal = await Brightness.isUsingSystemBrightnessAsync();
  const mode = await Brightness.getSystemBrightnessModeAsync();

  await Brightness.restoreSystemBrightnessAsync();
  await Brightness.setSystemBrightnessModeAsync(Brightness.BrightnessMode.AUTOMATIC);
}
```

`isAvailableAsync()` 返回 Brightness API 在设备上是否可用；它**不检查权限**，当前仅在 Android / iOS 返回 `true`。调用系统亮度方法前，还应分别检查 API 可用性和权限状态。

## 亮度变化事件

`Brightness.addBrightnessListener(listener)` 只在 iOS 触发；Android 与 Web 不发事件。回调对象的字段是 `{ brightness }`，订阅结束后要调用 `.remove()`：

```ts
const subscription = Brightness.addBrightnessListener(({ brightness }) => {
  console.log('屏幕亮度变化：', brightness);
});

// 不再监听时
subscription.remove();
```

## 权限与类型

- `BrightnessEvent` 包含 `brightness: number`，范围 `0` 到 `1`。
- `PermissionExpiration` 为 `'never' | number`；当前权限是永久授权。
- `PermissionHookOptions` 是通用 permission hook behavior / options 的联合类型。
- `PermissionResponse` 字段：`canAskAgain`、`expires`、`granted`、`status`。`PermissionStatus` 值为 `DENIED`、`GRANTED`、`UNDETERMINED`。
- `BrightnessMode.UNKNOWN`（`0`）表示未知；`AUTOMATIC`（`1`）允许系统按环境光调整；`MANUAL`（`2`）固定在程序设置的亮度。系统模式不可设置为 `UNKNOWN`。

### 错误码

| 错误码 | 说明 |
| --- | --- |
| `ERR_BRIGHTNESS` | 读 / 写当前 App 的亮度失败。 |
| `ERR_BRIGHTNESS_MODE` | 读取或设置系统亮度模式失败；可查看抛出错误的 `nativeError`。 |
| `ERR_BRIGHTNESS_PERMISSIONS_DENIED` | 没有用户授权却尝试修改系统级亮度。 |
| `ERR_BRIGHTNESS_SYSTEM` | 读 / 写全局系统亮度失败。 |
| `ERR_INVALID_ARGUMENT` | 传入无效模式；模式只接受 `MANUAL` 或 `AUTOMATIC`。 |

## 页面代码主题覆盖

已重写官方页面的四类安装命令、手动 Android `WRITE_SETTINGS` 配置、完整初始化组件、权限 Hook 使用方式、局部 / 全局亮度读写、BrightnessMode 切换、还原全局亮度与 iOS 亮度监听示例。其余静态 API、权限返回类型、错误码和枚举值在速查表覆盖。

**来源：**[Expo Brightness · Latest](https://docs.expo.dev/versions/latest/sdk/brightness/) · [Expo Brightness · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/brightness/)

**翻页：**[上一页：Expo SDK BlurView 背景模糊](./142-Expo-SDK-BlurView.md) · [目录](./README.md) · [下一页：Expo SDK Brownfield](./144-Expo-SDK-Brownfield.md)
