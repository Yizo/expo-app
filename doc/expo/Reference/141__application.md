# Expo Application 学习笔记

`expo-application` 是 Expo 提供的通用运行时信息库，用于读取当前原生应用的标识、名称、版本、安装时间和分发环境等信息。

> 本文原始页面属于“下一版本 SDK”的未发布文档。页面注明当前最新稳定版本为 **Expo SDK 56**。实际开发时应核对项目使用的 Expo SDK 版本及对应文档。

## 这篇文档解决什么问题

在 React Web 中，我们通常可以从构建环境变量或 `package.json` 获取应用版本；但在移动端，用户实际安装的是一个经过原生构建、签名并发布的应用二进制文件。

`expo-application` 主要用于在 JavaScript/TypeScript 运行期间查询这个原生应用的信息，例如：

- Android Application ID 或 iOS Bundle ID
- 安装在桌面上的应用名称
- 面向用户展示的版本号
- 应用商店用于区分构建产物的内部构建号
- 安装与更新时间
- Android 安装来源参数
- Android 或 iOS 提供的设备相关标识
- iOS 应用的发布类型和推送环境

它适合设置页、关于页、问题反馈、日志上报、安装归因和运行环境诊断等场景。

## 阅读前需要理解的概念

### 原生应用标识

移动应用需要一个由操作系统和应用商店识别的唯一标识：

- Android 称为 **Application ID**
- iOS 称为 **Bundle ID**

常见形式如下：

```text
com.example.myapp
```

这与 Web 应用的域名或 npm 包名不是同一个概念。它标识的是安装到设备上的原生应用。

### 展示版本与构建版本

移动应用通常有两套版本信息：

| 类型 | Android | iOS | 用途 |
| --- | --- | --- | --- |
| 展示版本 | `version` 对应的 version name | `CFBundleShortVersionString` | 展示给用户，例如 `2.11.0` |
| 构建版本 | `android.versionCode` | `CFBundleVersion`，通常由 `ios.buildNumber` 设置 | 应用商店区分不同二进制构建，例如 `114` |

可以将展示版本理解为 npm 包中的语义化版本，将构建版本理解为每次发布时递增的内部流水号。不过这只是帮助 React Web 开发者理解的类比，两者实际由原生平台和应用商店管理。

### Expo 应用配置与原生配置

使用 Expo 构建应用时，通常在 Expo app config 中设置版本：

```js
export default {
  version: '2.11.0',
  android: {
    versionCode: 114,
  },
  ios: {
    buildNumber: '114',
  },
};
```

这些配置会在原生构建时写入 Android 或 iOS 工程。`expo-application` 读取的是构建产物中的原生值，而不是动态读取配置文件。

> **基于文档内容推导：** 修改 app config 后，如果没有重新进行原生构建，已经安装的应用不会自动获得新的原生版本信息。

## 安装与导入

### Expo 项目

根据使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-application

# yarn
yarn expo install expo-application

# pnpm
pnpm expo install expo-application

# bun
bun expo install expo-application
```

`expo install` 会为当前 Expo SDK 选择兼容的包版本，这一点不同于直接使用普通的 `npm install`。

### 已有 React Native 项目

如果项目不是由 Expo 创建，而是已有的 React Native 原生项目，需要先按照 Expo 文档安装 `expo` 和 Expo Modules 支持，然后才能使用该库。

这通常会涉及 Android 和 iOS 原生工程配置，不只是安装一个 JavaScript 依赖。

### 导入

```ts
import * as Application from 'expo-application';
```

之后通过 `Application.applicationId` 或 `Application.getInstallationTimeAsync()` 等成员读取信息。

## 应用基础信息常量

这些值作为模块常量同步提供，不需要使用 `await`。

### `Application.applicationId`

```ts
const applicationId = Application.applicationId;
```

类型：

```ts
string | null
```

平台行为：

| 平台 | 返回内容 |
| --- | --- |
| Android | Application ID |
| iOS / tvOS | Bundle ID |
| Web | `null` |

示例：

```text
com.cocoacasts.scribbles
com.apple.Pages
```

适合用于日志上报、区分不同应用或构建目标。

不要把它当作用户标识或设备标识：同一个应用的所有用户通常拥有相同的应用 ID。

### `Application.applicationName`

```ts
const applicationName = Application.applicationName;
```

类型：

```ts
string | null
```

它返回设备桌面上与应用图标一起显示的人类可读名称，例如：

```text
Expo
Yelp
Instagram
```

在 Android 和 iOS 上通常返回字符串，但无法读取名称时也可能返回 `null`；Web 始终返回 `null`。

该名称不一定等于代码仓库名称、npm 包名或应用 ID。

### `Application.nativeApplicationVersion`

```ts
const version = Application.nativeApplicationVersion;
```

类型：

```ts
string | null
```

它是面向用户的原生应用版本，例如：

```text
2.11.0
```

构建时的来源：

- Android：app config 中的 `version`
- iOS：`Info.plist` 中的 `CFBundleShortVersionString`
- Web：`null`

适合显示在“关于”页面或附加到问题反馈中。

### `Application.nativeBuildVersion`

```ts
const buildVersion = Application.nativeBuildVersion;
```

类型：

```ts
string | null
```

它是应用商店用于区分不同二进制构建的内部版本，例如：

```text
114
```

构建时的来源：

- Android：app config 中的 `android.versionCode`
- iOS：`Info.plist` 中的 `CFBundleVersion`
- Expo 独立 iOS 应用通常通过 `ios.buildNumber` 设置
- Web：`null`

即使 Android 配置中的 `versionCode` 是数字，该 API 在 Android 和 iOS 上仍返回字符串。

## Android 专用能力

以下方法不能在 iOS 或 Web 上调用。跨平台代码应先判断平台，或将调用封装到 Android 专用模块中。

### 获取 Android ID

```ts
const androidId = Application.getAndroidId();
```

返回类型：

```ts
string
```

示例：

```text
dd96dec43fb81c97
```

该方法同步读取 `Settings.Secure.ANDROID_ID`。在 Android 8.0（API 26）及以上，它对以下组合具有唯一性：

- 应用签名密钥
- 用户
- 设备

它可能在以下情况下发生变化：

- 设备恢复出厂设置
- APK 签名密钥改变

低于 Android 8.0 时，文档说明该值在设备生命周期内保持不变。

因此，它不是永不变化的全局设备 ID，也不应在没有容错机制的情况下作为账户主键。

### 获取安装来源参数

```ts
const referrer = await Application.getInstallReferrerAsync();
```

返回类型：

```ts
Promise<string>
```

示例：

```text
utm_source=google-play&utm_medium=organic
```

该方法通过 Google Play Store 的 Install Referrer API 获取安装来源参数，常用于广告或渠道归因。

返回值可能不是完整的绝对 URL，不能直接假设它满足：

```text
https://example.com/path?... 
```

示例中的值实际上更像查询字符串。解析前应根据业务约定验证格式，并处理调用失败。

### 获取最后更新时间

```ts
const updatedAt = await Application.getLastUpdateTimeAsync();
```

返回结果是 `Date` 对象，表示应用最后一次通过 Google Play Store 更新的时间。

```text
2019-07-18T21:20:16.887Z
```

文档只将该方法描述为 Google Play Store 更新时间接口，没有说明其他安装渠道下的行为，不应据此推断侧载 APK 或其他应用商店也能得到同等语义的结果。

## iOS 专用能力

### 获取应用发布类型

```ts
const releaseType =
  await Application.getIosApplicationReleaseTypeAsync();
```

返回 `ApplicationReleaseType` 枚举值：

| 枚举成员 | 数值 |
| --- | ---: |
| `ApplicationReleaseType.UNKNOWN` | `0` |
| `ApplicationReleaseType.SIMULATOR` | `1` |
| `ApplicationReleaseType.ENTERPRISE` | `2` |
| `ApplicationReleaseType.DEVELOPMENT` | `3` |
| `ApplicationReleaseType.AD_HOC` | `4` |
| `ApplicationReleaseType.APP_STORE` | `5` |

这些值用于区分模拟器、企业分发、开发构建、Ad Hoc 分发和 App Store 分发等环境。

原文档没有进一步说明每种发布方式的签名、证书及适用范围。

### 获取 IDFV

```ts
const idfv = await Application.getIosIdForVendorAsync();
```

返回类型：

```ts
Promise<string>
```

示例：

```text
68753A44-4D6F-1226-9C60-0050E4C00067
```

IDFV，即 Identifier for Vendor，是 iOS 为同一供应商应用提供的设备标识。同一供应商的应用会得到相同 ID。

需要注意：

- 当用户卸载当前供应商的所有应用后，系统会更改该供应商标识。
- 设备重启后、用户首次解锁设备之前，方法有时可能返回 `nil`。
- 遇到 `nil` 时，文档要求稍后重新调用。

虽然文档的返回类型写作 `Promise<string>`，但正文明确说明原生系统可能暂时返回 `nil`。业务代码不应将其视为永久存在且永远不变的用户身份。

### 获取 APNs 环境

```ts
const environment =
  await Application.getIosPushNotificationServiceEnvironmentAsync();
```

返回值类型为：

```ts
'development' | 'production' | null
```

它对应 iOS 原生 target entitlement 中的 `aps-environment`：

- `development`：开发推送环境
- `production`：生产推送环境
- `null`：iOS 模拟器不支持向 APNs 注册，因此返回空值

APNs 是 Apple Push Notification service，即苹果推送通知服务。开发环境与生产环境需要匹配相应的推送配置。

## 跨平台安装时间

### `Application.getInstallationTimeAsync()`

```ts
const installedAt =
  await Application.getInstallationTimeAsync();
```

文档中的返回类型写作：

```ts
Promise<date>
```

实际兑现值是 JavaScript `Date` 对象，例如：

```text
2019-07-18T18:08:26.121Z
```

平台实现不同：

| 平台 | 信息来源 |
| --- | --- |
| Android | `PackageInfo.firstInstallTime` |
| iOS / tvOS | 应用文档根目录的 `NSFileCreationDate` |
| Web | `null` |

该时间表示本次安装发生的时间，不包含后续更新。如果用户卸载后重新安装，返回的是重新安装时间，而不是用户最早使用应用的时间。

因此，它不能可靠表示账户注册时间、用户首次使用产品的时间或设备首次激活时间。

## 平台差异总览

| API | Android | iOS / tvOS | Web |
| --- | --- | --- | --- |
| `applicationId` | 支持 | 支持 | `null` |
| `applicationName` | 支持，失败时可能为 `null` | 支持，失败时可能为 `null` | `null` |
| `nativeApplicationVersion` | 支持 | 支持 | `null` |
| `nativeBuildVersion` | 支持 | 支持 | `null` |
| `getInstallationTimeAsync()` | 支持 | 支持 | `null` |
| `getAndroidId()` | 支持 | 不可用 | 不可用 |
| `getInstallReferrerAsync()` | 支持 | 不可用 | 不可用 |
| `getLastUpdateTimeAsync()` | 支持 | 不可用 | 不可用 |
| `getIosApplicationReleaseTypeAsync()` | 不可用 | 支持 | 不可用 |
| `getIosIdForVendorAsync()` | 不可用 | 支持 | 不可用 |
| `getIosPushNotificationServiceEnvironmentAsync()` | 不可用 | 支持 | 不可用 |

虽然包本身支持 Web，但多个基础字段在 Web 上只会返回 `null`。这里的“支持”不代表所有平台提供相同数据，而是模块能够在对应平台存在并按文档定义返回结果。

## 错误码与失败处理

### 包信息读取失败

`ERR_APPLICATION_PACKAGE_NAME_NOT_FOUND`

可能由以下方法抛出：

- `getInstallationTimeAsync`
- `getLastUpdateTimeAsync`

表示无法获取应用包信息或包名。

### Install Referrer 错误

| 错误码 | 含义 |
| --- | --- |
| `ERR_APPLICATION_INSTALL_REFERRER_UNAVAILABLE` | 当前 Play Store 不提供 Install Referrer API，或设备没有安装 Play Store |
| `ERR_APPLICATION_INSTALL_REFERRER_CONNECTION` | 无法连接 Google Play Store |
| `ERR_APPLICATION_INSTALL_REFERRER_REMOTE_EXCEPTION` | 连接后发生 Android `RemoteException`，远程服务进程可能已不可用或崩溃 |
| `ERR_APPLICATION_INSTALL_REFERRER` | 未匹配到其他精确类型的一般错误，同时提供 Install Referrer `responseCode` |
| `ERR_APPLICATION_INSTALL_REFERRER_SERVICE_DISCONNECTED` | 建立 Install Referrer 服务期间连接丢失 |

某些 Android 虚拟设备（AVD）镜像没有预装 Play Store，例如文档提及的部分 Google Pixel 3 和 Nexus 6 模拟器配置。在这类环境中测试安装来源功能，可能出现 `ERR_APPLICATION_INSTALL_REFERRER_UNAVAILABLE`。

调用相关异步方法时应使用 `try/catch`，不能假设测试设备一定具备 Google Play 服务：

```ts
try {
  const referrer = await Application.getInstallReferrerAsync();
  // 使用或解析 referrer
} catch (error) {
  // 将“无法获取来源”作为可预期状态处理
}
```

## React Web 开发者容易误解的地方

### “通用库”不等于 API 完全跨平台

`expo-application` 可以安装在 Android、iOS、tvOS 和 Web 项目中，但部分 API 是平台专用的，Web 上很多字段固定返回 `null`。

这不同于常见的浏览器 API 渐进增强：错误平台上的方法可能不可用，而不仅仅是返回空数据。

### 版本信息由原生构建决定

`nativeApplicationVersion` 和 `nativeBuildVersion` 不是前端部署后可以随意修改的运行时变量。它们在原生应用构建时写入二进制包。

只更新 JavaScript 代码并不一定会改变这些原生版本值。

### 设备标识不是稳定的用户 ID

Android ID 和 iOS IDFV 都可能因系统、签名或卸载行为而变化。它们也具有不同的平台语义，不能把两者简单拼成一个永久跨平台用户 ID。

### 安装时间不是用户首次使用时间

卸载并重新安装会重置安装时间。iOS 和 Android 获取该时间的底层机制也不同，因此它更适合诊断或辅助分析，而不是关键业务判断。

### 模拟器不完全等同于真机

- iOS 模拟器无法注册 APNs，因此推送环境返回 `null`。
- Android 模拟器可能没有 Play Store，导致 Install Referrer 调用失败。
- iOS 可以通过发布类型 API识别 `SIMULATOR`。

## 实际开发方式

### 在“关于”页面显示版本

```tsx
import { Text, View } from 'react-native';
import * as Application from 'expo-application';

export function AboutScreen() {
  const version =
    Application.nativeApplicationVersion ?? '未知版本';
  const build =
    Application.nativeBuildVersion ?? '未知构建';

  return (
    <View>
      <Text>
        版本 {version} ({build})
      </Text>
    </View>
  );
}
```

这里需要处理 `null`，因为 API 类型明确允许空值，且 Web 平台会返回 `null`。

### 收集诊断信息

```ts
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export async function getApplicationDiagnostics() {
  const installedAt =
    await Application.getInstallationTimeAsync();

  return {
    platform: Platform.OS,
    applicationId: Application.applicationId,
    applicationName: Application.applicationName,
    version: Application.nativeApplicationVersion,
    buildVersion: Application.nativeBuildVersion,
    installedAt: installedAt?.toISOString() ?? null,
  };
}
```

> **基于经验建议：** 上传诊断数据前，应检查隐私政策和数据最小化要求，尤其是 Android ID、IDFV、安装来源等可能与设备或用户行为关联的信息。

### 隔离平台专用调用

```ts
import { Platform } from 'react-native';
import * as Application from 'expo-application';

export async function getPlatformIdentifier() {
  if (Platform.OS === 'android') {
    return Application.getAndroidId();
  }

  if (Platform.OS === 'ios') {
    return await Application.getIosIdForVendorAsync();
  }

  return null;
}
```

这段代码只是统一调用入口，并不意味着 Android ID 与 IDFV 具有相同含义或稳定性。

## 文档明确内容与合理推导

### 文档明确说明

- 库用于在运行时读取原生应用 ID、名称和构建版本等信息。
- Web 上多个字段和安装时间返回 `null`。
- 展示版本和构建版本来源于构建时的原生配置。
- Android ID 会受到设备恢复出厂设置和签名密钥变化影响。
- iOS IDFV 在同一供应商应用之间共享，并可能在该供应商所有应用卸载后变化。
- 重新安装应用会重置安装时间。
- Install Referrer 返回值不一定是完整绝对 URL。
- iOS 模拟器的 APNs 环境为 `null`。
- Install Referrer 依赖 Play Store，并定义了多种连接和服务错误。

### 基于文档内容推导

- 修改 Expo app config 后，需要新的原生构建才能让已构建应用读取到新的原生版本值。
- 这些设备相关标识不适合作为永久账户主键。
- 跨平台代码必须同时处理平台可用性、`null` 和异步异常。
- 安装时间只能表示当前这次安装，不能替代账户注册时间或可靠的首次使用时间。
- 应用版本与构建号适合附加到错误日志和用户反馈中，以定位具体二进制版本。

## 当前文档未涉及

原文档没有说明以下内容：

- 如何创建 Expo 或 React Native 项目
- 如何配置 EAS Build 或提交应用商店
- 如何设计版本号递增策略
- 如何申请、配置和发送推送通知
- 如何处理设备标识相关的隐私合规与用户授权
- Expo Updates 与原生应用版本之间的具体关系
- 各发布类型对应的证书和签名配置流程
- 自动化测试或 Mock 这些 API 的方法

## 总结

`expo-application` 的核心价值是让 JavaScript 层读取已经安装到设备上的原生应用信息。

实际使用时需要抓住三个重点：

1. 展示版本和构建版本是不同概念，并且在原生构建时确定。
2. 不同平台提供的能力不同，Web 上很多值为 `null`，Android 和 iOS 也各有专用方法。
3. 安装时间、Android ID、IDFV 和安装来源都存在平台限制或变化条件，必须处理空值、异常和不稳定性。

---

## 文档导航

- **上一页**：[apple authentication](./140__apple-authentication.md)
- **下一页**：[asset](./142__asset.md)
