# 133｜Expo SDK Application 应用信息

**翻页：**[上一页：Expo SDK AppleAuthentication](./132-Expo-SDK-AppleAuthentication.md) · [目录](./README.md) · [下一页：Expo SDK Asset](./134-Expo-SDK-Asset.md)

**官方页面：**[Application · Latest](https://docs.expo.dev/versions/latest/sdk/application/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/application/)

**版本边界：**Latest 推荐 `expo-application ~57.0.3`；SDK v56.0.0 推荐 `~56.0.3`。两版 API 和平台行为基本相同。`Application` 读取安装时写入的原生应用标识 / 名称 / 构建版本，以及部分 Android / iOS 系统信息；Web 上多个属性不支持并返回 `null`。

## 读取 App 自身与设备相关信息

`expo-application` 可读取应用在操作系统中的 ID、用户可见名称、商店版本与内部构建版本，也能查询安装时间、Android 安装来源、iOS vendor ID 等信息。安装：

~~~sh
npx expo install expo-application
yarn expo install expo-application
pnpm expo install expo-application
bun expo install expo-application
~~~

非 Expo 的 React Native 工程需要先安装 `expo`。API 导入方式：

~~~ts
import * as Application from 'expo-application';
~~~

## 常量属性速查

| 属性 | 平台 / 类型 | 说明 |
| --- | --- | --- |
| `applicationId` | Android / iOS / tvOS / Web；`string \| null` | Android application ID、iOS bundle ID；Web 返回 `null`。示例：`"com.cocoacasts.scribbles"`、`"com.apple.Pages"`。 |
| `applicationName` | Android / iOS / tvOS / Web；`string \| null` | 桌面或主屏幕图标下的用户可读名称；Web 返回 `null`，原生拿不到名称时也可为 `null`。示例：`"Expo"`、`"Yelp"`、`"Instagram"`。 |
| `nativeApplicationVersion` | Android / iOS / tvOS / Web；`string \| null` | 商店展示版本；Android 对应 app config 的 `version`，iOS 对应 `CFBundleShortVersionString`。Web 返回 `null`。示例：`"2.11.0"`。 |
| `nativeBuildVersion` | Android / iOS / tvOS / Web；`string \| null` | 区分安装包的内部构建号；Android 对应 `android.versionCode`，iOS 对应 `CFBundleVersion` / `ios.buildNumber`。原生返回 string；Web 返回 `null`。示例：`"114"`。 |

## 方法速查

### Android 方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `Application.getAndroidId()` | `string` | 读取 Android `Settings.Secure.ANDROID_ID`。Android 8+ 对每个 app 签名 key / 用户 / 设备组合唯一；恢复出厂设置或 APK 签名 key 变化时可能改变。Android 8 以下通常在设备生命周期内保持不变。iOS / Web 无此方法。 |
| `Application.getInstallReferrerAsync()` | `Promise<string>` | 从 Google Play Install Referrer API 读取安装来源字符串；结果不保证是完整绝对 URL。 |
| `Application.getLastUpdateTimeAsync()` | `Promise<Date>` | 读取 Android app 最近一次经 Google Play Store 更新的时间。 |

示例结果：

~~~ts
Application.getAndroidId();
// "dd96dec43fb81c97"
~~~

~~~ts
await Application.getInstallReferrerAsync();
// "utm_source=google-play&utm_medium=organic"
~~~

~~~ts
await Application.getLastUpdateTimeAsync();
// 2019-07-18T21:20:16.887Z
~~~

安装来源 API 可能因为 Play Store 不存在、连接失败或远程服务异常而抛出对应错误码，详见本页“Error codes”。

### Android / iOS 安装时间

`getInstallationTimeAsync()` 不会因普通 App 更新而变化；卸载后重装会返回重新安装时间。Android 使用 PackageInfo `firstInstallTime`；iOS 读取应用 documents 根目录的 `NSFileCreationDate`；Web 返回 `null`。

~~~ts
await Application.getInstallationTimeAsync();
// 2019-07-18T18:08:26.121Z
~~~

返回 `Promise<Date>`。

### iOS / tvOS 方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `Application.getIosApplicationReleaseTypeAsync()` | `Promise<ApplicationReleaseType>` | 返回 App 分发 / 构建类型。 |
| `Application.getIosIdForVendorAsync()` | `Promise<string \| null>` | 读取 IDFV（identifier for vendor）。同一 vendor 的 App 共享 ID；卸载该 vendor 所有 App 后，系统可能更换。设备刚重启且用户尚未解锁时可能暂时为 `null`，稍后可重试。 |
| `Application.getIosPushNotificationServiceEnvironmentAsync()` | `Promise<PushNotificationServiceEnvironment>` | 返回 APNs 的 `'development'` 或 `'production'` 环境；Simulator 不支持注册 APNs 时为 `null`。 |

示例调用：

~~~ts
await Application.getIosIdForVendorAsync();
// "68753A44-4D6F-1226-9C60-0050E4C00067"
~~~

## 类型与枚举

### `PushNotificationServiceEnvironment`

iOS 的 `aps-environment` entitlement 值：`'development'`、`'production'` 或 `null`。

### `ApplicationReleaseType`

| 枚举值 | 数字 | 含义 |
| --- | ---: | --- |
| `UNKNOWN` | 0 | 未知类型。 |
| `SIMULATOR` | 1 | 模拟器运行。 |
| `ENTERPRISE` | 2 | Enterprise 发行版。 |
| `DEVELOPMENT` | 3 | Development 构建。 |
| `AD_HOC` | 4 | Ad Hoc 分发。 |
| `APP_STORE` | 5 | App Store 版本。 |

### Error codes

| 错误码 | 含义 |
| --- | --- |
| `ERR_APPLICATION_PACKAGE_NAME_NOT_FOUND` | `getInstallationTimeAsync()` 或 `getLastUpdateTimeAsync()` 无法取到 package 信息 / 名称。 |
| `ERR_APPLICATION_INSTALL_REFERRER_UNAVAILABLE` | 当前 Play Store App 不提供 Install Referrer API 或未安装 Play Store。 |
| `ERR_APPLICATION_INSTALL_REFERRER_CONNECTION` | 无法与 Play Store 建立连接。 |
| `ERR_APPLICATION_INSTALL_REFERRER_REMOTE_EXCEPTION` | Play Store 远程服务异常，可能是服务进程崩溃或中断。 |
| `ERR_APPLICATION_INSTALL_REFERRER` | 其他未被更具体错误覆盖的 Install Referrer 错误；异常中还会带 `responseCode`。 |
| `ERR_APPLICATION_INSTALL_REFERRER_SERVICE_DISCONNECTED` | 已连接后 Install Referrer 服务断开。 |

### 新手术语

- **Application ID / Bundle ID：**Android / iOS 系统用来识别应用的反向域名字符串。
- **Native application version：**给用户 / 商店展示的版本号，例如 `2.11.0`。
- **Build version：**区分不同上传二进制文件的内部构建号；同一 app version 可迭代不同 build。
- **IDFV：**iOS Identifier for Vendor；同一 Apple 开发团队的应用在同一设备可共享的标识。
- **Install referrer：**Google Play 记录的安装来源参数，如来源渠道或活动标签。
- **APNs：**Apple Push Notification service，苹果推送通知服务。
- **nullable / `null`：**值可能不存在或平台不支持；调用处要判断后再显示或运算。

## 源页代码主题覆盖

已覆盖安装命令与导入方式，并重写 `getAndroidId`、`getInstallReferrerAsync`、`getLastUpdateTimeAsync`、`getInstallationTimeAsync`、`getIosIdForVendorAsync` 的调用示例和返回值说明。其它平台方法、常量与错误码在速查表中完整归类。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/application/) · [SDK v56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/application/)

**翻页：**[上一页：Expo SDK AppleAuthentication](./132-Expo-SDK-AppleAuthentication.md) · [目录](./README.md) · [下一页：Expo SDK Asset](./134-Expo-SDK-Asset.md)
