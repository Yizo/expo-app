# 172｜Expo SDK IntentLauncher Android Intent

**翻页：**[上一页：Expo SDK ImagePicker 图片选择器](./171-Expo-SDK-ImagePicker.md) · [目录](./README.md) · [下一页：Expo SDK KeepAwake 保持屏幕常亮](./173-Expo-SDK-KeepAwake.md)

**官方页面：**[IntentLauncher · Latest](https://docs.expo.dev/versions/latest/sdk/intent-launcher/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/intent-launcher/)

**版本与平台：**Latest 推荐 `expo-intent-launcher ~57.0.1`；SDK v56.0.0 推荐 `~56.0.4`。此 API **仅支持 Android**，文档标记可在 Expo Go 中使用。

## Android Intent 是什么

Intent 是 Android 用来请求系统或其它 App 执行动作的消息。例如打开定位设置、Wi-Fi 面板，或跳转指定 package。`expo-intent-launcher` 是调用 Android intent / activity 的桥接 API，不能当作 iOS URL scheme 或 Web 路由使用。

安装：

```sh
npx expo install expo-intent-launcher
```

现有 React Native 工程使用 Expo modules 时，需先安装并配置 `expo`。

## 打开系统设置

源页的最小示例直接使用 `ActivityAction.LOCATION_SOURCE_SETTINGS` 打开定位设置：

```ts
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';

async function openLocationSettings() {
  await startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
}
```

`ActivityAction` 是一组 Android Settings provider 提供的动作常量；官方页面包含很多系统设置动作，例如：

| 场景 | 常见 action |
| --- | --- |
| 定位 | `LOCATION_SOURCE_SETTINGS`、`LOCATION_SCANNING_SETTINGS` |
| 网络 / 无线 | `WIFI_SETTINGS`、`WIRELESS_SETTINGS`、`PANEL_WIFI`、`PANEL_INTERNET_CONNECTIVITY`、`BLUETOOTH_SETTINGS`、`NFC_SETTINGS` |
| App / 通知权限 | `APPLICATION_DETAILS_SETTINGS`、`APPLICATION_SETTINGS`、`APP_NOTIFICATION_SETTINGS`、`NOTIFICATION_SETTINGS` |
| 文件 / 特殊权限 | `MANAGE_APP_ALL_FILES_ACCESS_PERMISSION`、`MANAGE_OVERLAY_PERMISSION`、`MANAGE_UNKNOWN_APP_SOURCES` |
| 设备与显示 | `DISPLAY_SETTINGS`、`DARK_THEME_SETTINGS`、`DATE_SETTINGS`、`LANGUAGE_SETTINGS`、`BATTERY_SAVER_SETTINGS` |
| 辅助功能 | `ACCESSIBILITY_SETTINGS`、`ACCESSIBILITY_COLOR_CONTRAST_SETTINGS`、`CAPTIONING_SETTINGS` |

`ActivityAction` 的枚举很长，官方页面列出 Android Settings provider 的完整 action 名和字符串。不同 OS 版本 / 厂商提供的具体设置页可能不同；调用前端应处理 intent 启动失败，并避免在 unsupported 平台导入后调用。

## 传递 Intent 参数并读取返回结果

`startActivityAsync(activityAction, params?)` 打开目标 activity，Promise 在用户返回应用后 resolve。`params` 可设置类别、组件信息、URI、extras、flags 和 MIME type：

```ts
import * as IntentLauncher from 'expo-intent-launcher';

async function openAppNotificationSettings(packageName: string) {
  try {
    const result = await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS,
      {
        data: `package:${packageName}`,
        extra: { 'android.provider.extra.APP_PACKAGE': packageName },
      }
    );

    console.log(result.resultCode, result.data, result.extra);
  } catch (error) {
    console.error('无法打开对应设置页', error);
  }
}
```

Intent URI 的 scheme 在 Android 要用小写。`extra` 的 key 需要带 package prefix（例如 `com.android.contacts.ShowAll` 或系统文档列出的键），不要随意用无前缀键。

## 打开 App 并读取 App 图标

`openApplication(packageName)` 通过 Android package name 启动应用；`getApplicationIconAsync(packageName)` 返回该 App 的 PNG Base64 data URI，可直接用 Expo Image：

```tsx
import { useEffect, useState } from 'react';
import { Button, Image, View } from 'react-native';
import { getApplicationIconAsync, openApplication } from 'expo-intent-launcher';

export default function ExternalAppShortcut() {
  const [iconUri, setIconUri] = useState('');
  const packageName = 'com.example.targetapp';

  useEffect(() => {
    void getApplicationIconAsync(packageName).then(setIconUri);
  }, []);

  return (
    <View>
      {iconUri ? <Image source={{ uri: iconUri }} style={{ width: 48, height: 48 }} /> : null}
      <Button title="打开目标 App" onPress={() => openApplication(packageName)} />
    </View>
  );
}
```

如果系统找不到图标，`getApplicationIconAsync` 返回空字符串；启动 App 的 `openApplication` 返回 `void`。

## API 参数与返回类型

### 方法

| 方法 | 参数 / 返回 | 说明 |
| --- | --- | --- |
| `getApplicationIconAsync(packageName)` | package name → `Promise<string>` | 取目标 App 图标的 Base64 PNG data URI；失败时空字符串。 |
| `openApplication(packageName)` | package name → `void` | 直接打开 Android App。 |
| `startActivityAsync(activityAction, params?)` | action string、可选 `IntentLauncherParams` → `Promise<IntentLauncherResult>` | 打开指定 activity；Promise 在用户回到本 App 时完成。 |

### `IntentLauncherParams`

| 参数 | 含义 |
| --- | --- |
| `category` | Intent category，进一步说明 action 的使用类别。 |
| `className` | Android `ComponentName` 的 class 部分。 |
| `packageName` | `ComponentName` 的 package 部分；仅当要显式指定处理组件时使用。 |
| `data` | Intent 操作的 URI；Android 要求 URI scheme 小写。 |
| `type` | `data` 表示内容的 MIME type；省略可让 Android 推断。 |
| `extra` | 要随 Intent 传递的 key/value map；键应包含 app / 系统 package 前缀。 |
| `flags` | Android Intent flags 位掩码。 |

`IntentLauncherResult` 在 activity 返回时包含 `resultCode`，并可选提供 `data` URI 与 `extra` 对象。`ResultCode`：`Success = -1` 表示成功；`Canceled = 0` 表示被取消（例如按返回键）；`FirstUser = 1` 是首个可供自定义 activity 使用的返回值。

## 使用范围与版本差异

- IntentLauncher 本身仅 Android 可用。需要 iOS / Web 同类导航时应根据目标 API 选对应平台方案。
- `ActivityAction` 指向 Android 系统设置 / activity。系统可能因 OS 版本或厂商实现不同而无法处理所有 action，因此保留错误处理。
- Latest 推荐 `expo-intent-launcher ~57.0.1`，SDK v56 推荐 `~56.0.4`；方法、参数与 ResultCode 在两页中一致。
- Latest 和 v56 页脚 Next 都是 Expo SDK KeepAwake。

## 源页代码主题覆盖

- Installation：覆盖 `expo-intent-launcher` 安装命令。
- Usage：覆盖通过 `ActivityAction.LOCATION_SOURCE_SETTINGS` 打开系统定位设置。
- API 方法：覆盖 `getApplicationIconAsync`（Base64 data URI）、`openApplication`（package name 启动）、`startActivityAsync`（ActivityAction + params + Promise 返回）等价用法。
- API 参数：覆盖 `IntentLauncherParams` 的 category / className / data / extra / flags / packageName / type，以及 URI scheme 小写与 extras package prefix 约束。
- Result 与 Enum：覆盖 IntentLauncherResult 的 data / extra / resultCode，ResultCode 成功 / 取消 / 用户值和 ActivityAction 常见分类。
- Latest / SDK v56 对照：标明 Android-only、推荐版本差异及共同 Next KeepAwake。

**翻页：**[上一页：Expo SDK ImagePicker 图片选择器](./171-Expo-SDK-ImagePicker.md) · [目录](./README.md) · [下一页：Expo SDK KeepAwake 保持屏幕常亮](./173-Expo-SDK-KeepAwake.md)
