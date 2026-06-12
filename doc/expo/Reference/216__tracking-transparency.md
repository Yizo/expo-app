# Expo TrackingTransparency 学习指南

> 原文档修改日期：2026 年 5 月 26 日  
> 包名：`expo-tracking-transparency`  
> 支持平台：Android、iOS、tvOS、Expo Go  
> 文档状态：本文对应下一版本 Expo SDK 的未版本化文档；原文指出当前最新稳定版本为 SDK 56。

## 文档解决的问题

`expo-tracking-transparency` 用于：

- 请求和查询用户的追踪授权。
- 获取设备的广告标识符。
- 配置 iOS 系统权限提示文案。
- 处理 iOS App Tracking Transparency（ATT）要求。
- 在 Android 上读取 Android Advertising ID（AAID）。

这里的“追踪”包括使用电子邮箱、设备 ID、广告 ID 等数据，在不同应用、网站或服务之间识别用户或设备。

这套 API 主要适合以下场景：

- 个性化广告。
- 广告归因和转化统计。
- 广告展示频率控制。
- 估算独立用户数量。
- 广告欺诈检测。
- 与广告有关的调试。

如果应用完全不进行此类追踪，也不需要读取广告标识符，当前文档没有要求必须安装该库。

## React Web 开发者需要先理解的背景

### 权限由操作系统管理

在 React Web 中，权限通常通过浏览器 API 请求，例如通知、摄像头和地理位置权限。

React Native 中的权限请求虽然也是异步函数，但实际对话框由 iOS 或 Android 系统控制，而不是 React 组件。应用只能发起请求并接收结果，不能自由控制系统弹窗的样式和重复展示。

### 广告标识符

广告标识符是操作系统提供、主要用于广告用途的 UUID：

- Android 使用 AAID（Android Advertising ID）。
- iOS 使用 IDFA（Identifier for Advertisers）。

它不是用户账号 ID，也不应该作为应用自身用户系统的主键。用户可以重置广告标识符，也可以限制应用访问它。

### 原生配置文件

React Web 项目主要通过 JavaScript、环境变量和构建工具配置应用。移动端还存在平台原生配置文件：

- Android：`AndroidManifest.xml`
- iOS：`Info.plist`

权限声明可能必须写入这些文件，并重新构建应用安装包才能生效。仅修改运行时 JavaScript 代码并不能完成这类配置。

### Expo Config Plugin 与 CNG

Expo 的 config plugin 可以根据 `app.json` 等应用配置，在生成原生工程时自动修改 `AndroidManifest.xml` 和 `Info.plist`。

CNG（Continuous Native Generation，持续原生工程生成）表示原生 `android`、`ios` 工程由 Expo 配置生成。使用 CNG 时，通常应通过 config plugin 管理原生配置。

如果项目不使用 CNG，而是手动维护 `android` 和 `ios` 目录，则必须直接修改原生文件。

## 安装

根据项目所使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install expo-tracking-transparency

# yarn
yarn expo install expo-tracking-transparency

# pnpm
pnpm expo install expo-tracking-transparency

# bun
bun expo install expo-tracking-transparency
```

`expo install` 与普通的 `npm install` 不完全相同。它会为当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的非 Expo React Native 工程中使用该库，需要先按照 Expo Modules 的接入方式安装 `expo`，否则不能直接把它当作普通 JavaScript 包使用。

## 原生配置

### 使用 CNG 或 Config Plugin

在 `app.json` 中注册插件：

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

`userTrackingPermission` 仅适用于 iOS，它会设置 `Info.plist` 中的 `NSUserTrackingUsageDescription`。

默认值是：

```text
Allow this app to collect app-related data that can be used for tracking you or your device.
```

这段文字会显示在 iOS 系统权限对话框中，用来向用户解释为什么请求追踪权限。

Config plugin 修改的是构建期原生配置，不能在应用运行时动态改变。修改该配置后，需要重新构建应用二进制文件。

### 不使用 CNG

如果项目手动维护原生工程，需要自行完成以下配置。

#### Android

在 `android/app/src/main/AndroidManifest.xml` 中添加：

```xml
<uses-permission android:name="com.google.android.gms.permission.AD_ID"/>
```

该权限允许应用访问 Google Play 服务提供的广告 ID。对于目标版本为 Android 13（API 33）或更高且使用 Advertising ID 的应用，这是必要配置。

库自己的 `AndroidManifest.xml` 会自动加入该权限。原文同时提供手动配置方式，主要面向不通过 CNG 管理原生工程的项目。

#### iOS

在 `ios/[app]/Info.plist` 中添加：

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Your custom usage description string here.</string>
```

`[app]` 表示实际的 iOS 应用工程目录名，不是要原样创建的目录。

缺少 `NSUserTrackingUsageDescription` 会导致应用无法正确说明追踪用途。原文特别警告：如果没有添加该字段，应用会被 Apple 拒绝。

另外，如果用户在系统设置中关闭了全局的“Allow Apps to Request to Track”，应用的追踪权限请求会被拒绝。

## 基本使用流程

原文示例在组件挂载后请求权限：

```jsx
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

这段代码与 React Web 中的 `useEffect` 用法相似，但有两个移动端特点：

1. 调用后可能出现操作系统权限对话框。
2. 用户的选择由操作系统保存，并不是组件卸载或应用重启后就会重置。

原文说明，系统不会反复弹出请求。通常只有用户卸载并重新安装应用后，才会重新询问。

更完整的业务流程通常是：

```ts
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
  getAdvertisingId,
} from 'expo-tracking-transparency';

async function getAuthorizedAdvertisingId() {
  let permission = await getTrackingPermissionsAsync();

  if (permission.status === 'undetermined') {
    permission = await requestTrackingPermissionsAsync();
  }

  if (!permission.granted) {
    return null;
  }

  return getAdvertisingId();
}
```

其中，先查询再请求可以区分：

- 用户还没有作出选择。
- 用户已经允许。
- 用户已经拒绝。

> **基于文档内容推导：** 即使权限结果是 `granted`，调用方仍应处理 `getAdvertisingId()` 返回 `null` 的情况，因为广告 ID 还会受到平台设置、模拟器和设备策略限制。

## API 导入方式

可以将全部 API 导入到一个命名空间：

```ts
import * as ExpoTrackingTransparency from 'expo-tracking-transparency';
```

调用示例：

```ts
const available = ExpoTrackingTransparency.isAvailable();
const advertisingId = ExpoTrackingTransparency.getAdvertisingId();
```

也可以像基本示例一样直接导入具体函数。

## 权限 Hook

### `useTrackingPermissions(options?)`

```ts
const [status, requestPermission] = useTrackingPermissions();
```

该 Hook 用于在 React 组件中读取和请求追踪权限，支持 Android、iOS 和 tvOS。

可选参数 `options` 的类型为 `PermissionHookOptions<object>`。当前文档没有进一步解释各个选项的具体字段。

返回值包含：

- 当前的 `PermissionResponse`；初始阶段可能是 `null`。
- 请求权限的方法。
- 重新查询权限的方法。

iOS 用户拒绝后，系统会记住选择，不会在每次调用时重新弹窗。Android 上该权限 Hook 始终报告权限已授予。

## 权限查询与请求方法

### `getTrackingPermissionsAsync()`

查询当前追踪权限，不主动要求用户作出选择：

```ts
const { granted } = await getTrackingPermissionsAsync();

if (granted) {
  // 可以进行已获授权的追踪操作
}
```

返回：

```ts
Promise<PermissionResponse>
```

适合在执行追踪操作前检查现有状态。

### `requestTrackingPermissionsAsync()`

请求用户允许或拒绝追踪：

```ts
const { granted } = await requestTrackingPermissionsAsync();

if (granted) {
  // 用户已授权
}
```

返回：

```ts
Promise<PermissionResponse>
```

在 iOS 上，用户拒绝后无法通过反复调用该函数继续弹窗。此时应根据 `canAskAgain` 判断是否需要引导用户前往系统设置。

Android 上该方法始终返回已授权。这并不代表 Android 广告 ID 一定可用；用户仍可能关闭广告个性化，导致 `getAdvertisingId()` 返回 `null`。

### `isAvailable()`

```ts
const available = ExpoTrackingTransparency.isAvailable();
```

返回当前设备是否提供 Tracking Transparency API：

```ts
boolean
```

在 API 不可用的设备上，权限查询和请求方法会始终解析为 `granted`。

因此，`granted` 只表示该权限 API 的结果，不能单独证明广告标识符一定存在。

## 获取广告标识符

### `getAdvertisingId()`

```ts
const advertisingId =
  ExpoTrackingTransparency.getAdvertisingId();
```

返回：

```ts
string | null
```

成功时返回 UUID，例如：

```text
E9228286-4C4E-4789-9D95-15827DCB291B
```

该 ID 仅应用于广告相关用途，例如：

- 广告频率限制。
- 归因。
- 转化事件。
- 独立用户估算。
- 广告欺诈检测。
- 调试。

### Android 行为

Android 返回 AAID。

支持多用户或访客用户的 Android 设备，可能在同一台物理设备上返回不同的广告 ID，因为不同系统用户拥有各自的标识符。

当用户启用 Limit Ad Tracking、退出广告个性化时，该方法返回 `null`。

### iOS 行为

iOS 返回 IDFA。在读取之前，应用必须先调用 `requestTrackingPermissionsAsync()` 请求授权。

以下情况返回 `null`：

- 在 iOS 模拟器中调用。
- 尚未取得追踪权限。
- 用户拒绝授权。
- 配置描述文件限制访问广告标识符。
- 用户关闭系统级“Allow Apps to Request to Track”。

权限 API 部分还说明，iOS 用户拒绝后，尝试收集 IDFA 会得到全零字符串；而 `getAdvertisingId()` 的返回值说明将拒绝等情况列为 `null`。应用在使用 Expo API 时，应按照其公开类型同时处理有效 UUID 和 `null`，不要依赖全零字符串判断授权状态。

### 不要持久化广告 ID

原文建议不要将广告 ID保存到本地数据库、AsyncStorage 或应用自己的长期缓存中。每次需要时应重新调用 `getAdvertisingId()`，原因包括：

- 用户可以重置广告 ID。
- 用户可以随时修改追踪设置。
- 之前保存的 ID 可能已经失效。
- 权限和广告 ID 可用性可能发生变化。

读取前还应调用 `getTrackingPermissionsAsync()`，确认用户当前的授权意图。

## 权限结果结构

### `PermissionResponse`

权限查询和请求都会返回该对象：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `status` | `PermissionStatus` | 完整的权限状态 |
| `granted` | `boolean` | 是否已授权的便捷布尔值 |
| `canAskAgain` | `boolean` | 是否还能再次向用户请求该权限 |
| `expires` | `PermissionExpiration` | 权限失效时间 |

示例：

```ts
const permission = await getTrackingPermissionsAsync();

switch (permission.status) {
  case 'granted':
    break;
  case 'denied':
    if (!permission.canAskAgain) {
      // 应考虑引导用户前往系统设置
    }
    break;
  case 'undetermined':
    // 尚未作出选择，可以请求权限
    break;
}
```

### `PermissionStatus`

| 枚举成员 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未允许或拒绝 |

不要把 `undetermined` 当成 `denied`。前者通常意味着还可以展示权限请求，后者表示用户已经作出拒绝选择。

### `PermissionExpiration`

类型为：

```ts
'never' | number
```

当前所有权限都永久有效，因此实际结果目前是 `never`。这里的“永久”是权限模型中的过期语义，不代表用户不能通过系统设置修改授权。

### `PermissionHookOptions`

类型可以是：

```ts
PermissionHookBehavior | Options
```

当前文档仅列出了类型名称，没有说明其字段和行为细节。

## 平台差异

| 行为 | Android | iOS | tvOS |
| --- | --- | --- | --- |
| 权限查询和请求 | 始终返回已授权 | 取决于用户和系统设置 | 文档声明支持 |
| 广告 ID | 返回 AAID 或 `null` | 授权后返回 IDFA，否则通常为 `null` | 当前文档未详细说明具体标识符行为 |
| 必要原生配置 | `AD_ID` 权限 | `NSUserTrackingUsageDescription` | 当前文档未提供单独配置说明 |
| 模拟器限制 | 当前文档未说明 | 始终无法取得广告 ID | 当前文档未说明 |

“Android 权限始终为已授权”最容易造成误解。它只是该 Expo 权限接口的统一返回行为，不能取代广告 ID 的可用性检查。

## 注意事项与常见坑点

### iOS 配置缺失会影响审核

必须提供 `NSUserTrackingUsageDescription`，解释数据为何用于追踪。原文明确警告，缺少该字段会导致 Apple 拒绝应用。

提示文案应与应用真实的数据用途一致。文档没有提供审核文案编写规范，也没有说明哪些数据行为在 Apple 政策下属于追踪，相关细节需要参考 Apple ATT 文档。

### 配置修改需要重新构建

`userTrackingPermission` 和原生权限声明属于构建期配置。修改 `app.json` 后仅刷新 JavaScript Bundle 不足以生效，需要生成并安装新的应用二进制文件。

这与 React Web 修改配置后重新部署类似，但移动端还需要重新编译原生工程。

### 系统弹窗不能反复请求

系统会保存用户选择。调用请求函数不等于每次都能弹窗：

- `undetermined`：用户尚未选择，可以请求。
- `denied` 且 `canAskAgain` 为 `false`：应考虑引导至系统设置。
- `granted`：可以继续检查并读取广告 ID。

### 不要只检查 `granted`

正确处理需要同时考虑：

- Tracking Transparency API 是否可用。
- 权限状态是否允许。
- 广告 ID 是否实际返回。
- 用户是否在系统层面限制广告追踪。
- 当前是否运行在 iOS 模拟器中。

### 不要使用 iOS 模拟器验证成功读取 IDFA

原文明确说明，iOS 模拟器始终返回 `null`。验证广告 ID 获取流程需要使用符合条件的真实设备。

### Expo Go 不代表生产配置已经完成

文档标明该库包含在 Expo Go 中，因此可以在 Expo Go 环境中调用。但 `Info.plist` 和 config plugin 属于应用二进制配置。

> **基于文档内容推导：** Expo Go 中能够导入或调用模块，不代表自定义生产应用已经包含正确的权限说明。正式发布前仍需检查独立构建产物的原生配置。

## 实际开发建议

> 以下内容标注为“基于经验建议”，不是当前文档的明确要求。

### 在合适的业务时机请求

**基于经验建议：** 不要仅因为组件首次挂载就立即展示 ATT 弹窗。可以先向用户解释追踪用途，再触发系统请求，使用户能理解授权带来的影响。

### 将拒绝作为正常分支

**基于经验建议：** 广告和分析逻辑不应假设一定能取得广告 ID。建议将 `null` 作为正常结果处理，并准备不依赖广告标识符的降级路径。

```ts
const advertisingId = getAdvertisingId();

if (advertisingId === null) {
  // 使用不依赖广告标识符的功能路径
  return;
}

// 执行已经获得授权的广告相关操作
```

### 不要将广告 ID 当成账号身份

**基于经验建议：** 用户可以重置广告 ID，同一台 Android 设备也可能因为多用户环境产生多个 ID。因此不能用它实现登录、账号绑定或永久设备识别。

## 文档明确内容与推导内容

### 原文档明确说明

- 该库用于管理追踪权限和访问广告标识符。
- 支持 Android、iOS 和 tvOS，并包含在 Expo Go 中。
- iOS 必须配置 `NSUserTrackingUsageDescription`。
- 缺少该 iOS 配置可能导致 Apple 拒绝应用。
- Android 权限查询和请求始终返回已授权。
- iOS 必须先请求授权才能读取 IDFA。
- 用户选择会被系统记住。
- `getAdvertisingId()` 可能返回 `null`。
- iOS 模拟器无法取得广告 ID。
- 不建议存储广告 ID。
- 原生配置变更需要重新构建应用。

### 基于文档内容推导

- 权限为 `granted` 不等于一定可以取得广告 ID。
- Expo Go 中模块可用不等于独立构建的权限配置正确。
- 业务代码应把广告 ID 的 `null` 返回值作为正常分支。
- `PermissionExpiration` 为 `never` 不代表用户无法在系统设置中改变授权。

## 总结

`expo-tracking-transparency` 同时处理两类问题：追踪权限和广告标识符访问。

iOS 是这篇文档的重点平台。应用需要配置 `NSUserTrackingUsageDescription`、请求 ATT 授权，并处理用户拒绝、系统全局限制和模拟器不可用等情况。

Android 虽然在权限 API 中始终返回已授权，但 AAID 仍可能因为用户限制广告个性化而返回 `null`。

实际实现中应遵循以下顺序：

1. 完成构建期原生配置。
2. 查询当前权限状态。
3. 仅在状态适合时请求权限。
4. 获得授权后再读取广告 ID。
5. 始终处理广告 ID 为 `null` 的情况。
6. 不要长期保存广告 ID，也不要将它当作永久用户身份。

---

## 文档导航

- **上一页**：[task manager](./215__task-manager.md)
- **下一页**：[updates](./217__updates.md)
