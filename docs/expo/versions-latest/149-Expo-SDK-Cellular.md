# 149｜Expo SDK Cellular 蜂窝网络信息

**翻页：**[上一页：Expo SDK Camera 相机](./148-Expo-SDK-Camera.md) · [目录](./README.md) · [下一页：Expo SDK Checkbox](./150-Expo-SDK-Checkbox.md)

**官方页面：**[Cellular · Latest](https://docs.expo.dev/versions/latest/sdk/cellular/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/cellular/)

**版本边界：**Latest 推荐 `expo-cellular ~57.0.2`；SDK v56.0.0 推荐 `~56.0.5`。主要接口一致，提供 SIM / 运营商与蜂窝网络代际信息。大部分运营商字段仅 Android 可读；iOS 和 Web 对多数运营商信息返回 `null`。

## 能读取哪些信息

`expo-cellular` 可查询当前服务商名称、移动国家 / 网络代码、连接的蜂窝代际，以及运营商是否允许 VoIP。**MCC**（Mobile Country Code）代表移动国家代码；**MNC**（Mobile Network Code）代表移动网络代码；它们与网络代际如 2G / 3G / 4G / 5G 是不同信息。

安装：

```sh
npx expo install expo-cellular
# 也可使用 yarn / pnpm / bun expo install expo-cellular
```

## 权限

Android 查询 phone state 需要 `READ_PHONE_STATE`。CNG 项目可在 app config 声明；手动维护 Android 工程时加到 Manifest。此库不需要风险更高的 `READ_PRIVILEGED_PHONE_STATE` 权限。

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.READ_PHONE_STATE"]
    }
  }
}
```

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

iOS 与 Web 不需要这项 Android 权限。Android 读取运营商等数据前要确保用户已授予 phone state 权限。

## 查询权限

`usePermissions()` 同时检查和请求 phone state 权限；它返回 `[permissionResponse, requestPermission, getPermission]`：

```tsx
import { Button } from 'react-native';
import * as Cellular from 'expo-cellular';

function CellularPermissionButton() {
  const [permission, requestPermission] = Cellular.usePermissions();
  return (
    <Button
      title={permission?.granted ? '已授权' : '请求电话状态权限'}
      onPress={requestPermission}
    />
  );
}
```

## 读取蜂窝代际与运营商信息

这些接口返回 Promise；SIM 未就绪、设备无 SIM 或无服务时，一些运营商字段会返回 `null`。`null` / `UNKNOWN` 表示无法取得数据，不能直接解释为用户没连接网络。

```ts
import * as Cellular from 'expo-cellular';

const permission = await Cellular.getPermissionsAsync();
if (permission.granted) {
  const generation = await Cellular.getCellularGenerationAsync();
  // 例如 CellularGeneration.CELLULAR_4G
  const carrier = await Cellular.getCarrierNameAsync();
  // Android 且 SIM_READY 时可能得到运营商名；iOS / Web 为 null
  const countryCode = await Cellular.getIsoCountryCodeAsync();
  const mobileCountryCode = await Cellular.getMobileCountryCodeAsync();
  const mobileNetworkCode = await Cellular.getMobileNetworkCodeAsync();

  console.log({ generation, carrier, countryCode, mobileCountryCode, mobileNetworkCode });
}
```

### 网页行为与 SIM 状态

- Android 运营商名称和 MCC / MNC 在 SIM 状态为 `SIM_STATE_READY` 时可用；双 SIM 设备只返回当前激活 SIM 的服务商名称。
- iOS 的 MCC / MNC 在无 SIM、飞行模式、脱离服务区域等情况下为 `null`；iOS / Web 运营商名称和国家 / 网络码为 `null`。
- Web 的 `getCellularGenerationAsync()` 会基于 `navigator.connection.effectiveType` 估算网络连接类型；这反映有效网络质量 / 类型，不保证是蜂窝电台真实制式。浏览器需要实现 Network Information API。
- 权限被拒绝时，`getCellularGenerationAsync()` 返回 `CellularGeneration.UNKNOWN`。

## Cellular API 速查

| 方法 | 返回 | 行为 |
| --- | --- | --- |
| `getPermissionsAsync()` | `Promise<PermissionResponse>` | 查询 phone state 权限。 |
| `requestPermissionsAsync()` | `Promise<PermissionResponse>` | 请求 phone state 权限。 |
| `getCellularGenerationAsync()` | `Promise<CellularGeneration>` | 返回当前连接代际；无连接 / 无权限 / 无法识别时为 `UNKNOWN`。Web 按 effective connection type 推断。 |
| `getCarrierNameAsync()` | `Promise<string \| null>` | Android 当前激活 SIM 的运营商名；SIM 未 ready 时 `null`，iOS / Web 为 `null`。 |
| `getIsoCountryCodeAsync()` | `Promise<string \| null>` | 运营商所属 ISO 国家代码；iOS / Web 为 `null`，设备无 SIM / 无服务等状态也可能为 `null`。 |
| `getMobileCountryCodeAsync()` | `Promise<string \| null>` | MCC；主要来自 Android ready 的 SIM，iOS / Web 及 SIM / 信号不可用时为 `null`。 |
| `getMobileNetworkCodeAsync()` | `Promise<string \| null>` | MNC；平台与 SIM 可用性限制同 MCC。 |
| `allowsVoipAsync()` | `Promise<boolean \| null>` | **已弃用**；Android 查询是否支持 SIP VoIP；iOS / Web 返回 `null`。VoIP 不再广泛使用，且 Google 正从 Android 平台移除 SIP API，该方法将来会移除。 |

`PermissionResponse` 包括 `canAskAgain`、`expires`、`granted`、`status`。`PermissionExpiration` 为 `'never' | number`。

## `CellularGeneration` 枚举

| 成员 | 数值 | 说明 |
| --- | --- | --- |
| `UNKNOWN` | `0` | 当前没有连接蜂窝网络或无法确定类型。 |
| `CELLULAR_2G` | `1` | 2G，包括 CDMA、EDGE、GPRS、IDEN。 |
| `CELLULAR_3G` | `2` | 3G，包括 EHRPD、EVDO、HSPA、HSUPA、HSDPA、HSPAP、UTMS。 |
| `CELLULAR_4G` | `3` | 4G / LTE。 |
| `CELLULAR_5G` | `4` | 5G / NR / NRNSA。 |

如果无法识别网络类型，方法还可能以错误码 `ERR_CELLULAR_GENERATION_UNKNOWN_NETWORK_TYPE` 拒绝 Promise。

## 给 React Web 开发者的术语

- **运营商信息：**服务商、MCC / MNC 来自 SIM / telephony API，浏览器出于权限与隐私限制通常不会暴露。
- **蜂窝代际：**2G 到 5G 是移动网络技术代际。Wi-Fi 的吞吐或 RTT 不等于蜂窝网络代际。
- **VoIP：**Voice over IP，通过数据网络进行语音通话；这里的 `allowsVoipAsync` 专指系统 / 运营商是否支持旧式 SIP VoIP 能力。
- **SIM_READY：**Android 系统表示 SIM 已就绪的状态；SIM 还未激活或尚未识别时，运营商代码 / 名称可能为空。

## 页面代码主题覆盖

官方代码主题已重写：四种安装命令；手动 Android `READ_PHONE_STATE` 权限；权限 Hook 请求；运营商 / MCC / MNC / 网络代际的异步读取与返回样例；`allowsVoipAsync` 及弃用警告。所有返回值、平台限制、浏览器 effectiveType 行为、CellularGeneration 枚举与错误码均已说明。

**来源：**[Expo Cellular · Latest](https://docs.expo.dev/versions/latest/sdk/cellular/) · [Expo Cellular · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/cellular/)

**翻页：**[上一页：Expo SDK Camera 相机](./148-Expo-SDK-Camera.md) · [目录](./README.md) · [下一页：Expo SDK Checkbox](./150-Expo-SDK-Checkbox.md)
