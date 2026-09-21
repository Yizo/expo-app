# 210｜Expo SDK Updates OTA 更新机制

**翻页：**[上一页：Expo SDK TrackingTransparency 跟踪透明度](./209-Expo-SDK-TrackingTransparency.md) · [目录](./README.md) · [下一页：Expo SDK Video](./211-Expo-SDK-Video.md)

**官方页面：**[Updates · Latest](https://docs.expo.dev/versions/latest/sdk/updates/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/updates/)

**版本与平台：**Latest 推荐 expo-updates ~57.0.23；SDK v56.0.0 推荐 ~56.0.27。页面列出 Android、iOS、tvOS。expo-updates 可集成在 Expo Go，但多数运行时 API 要在 release build 测试。

## OTA 更新与关键概念

expo-updates 让已安装 app 从更新服务器下载兼容的 JavaScript bundle 和静态资源。不替换已经编进二进制的原生代码、原生模块、权限或配置；这些变化仍需生成新 app binary。

- **Embedded update：**安装包内置的 JS / assets，作为首次启动和应急 fallback。
- **Remote update：**从更新服务下载到设备的 bundle / assets。
- **Runtime version：**原生代码 + 原生配置的兼容标识；服务端只把匹配 runtimeVersion 的 update 给对应 app binary。
- **Manifest：**描述 update bundle、assets 和兼容元信息的清单。
- **Channel：**EAS Update 为 build 选择更新流的标签。Expo Go / development build 没有固定 channel。
- **Rollback directive：**服务端下发回滚指令，让 app 使用内置 update，而非下载一个新 JS bundle。

默认启动时检查更新；发现 update 后下载，通常在下次冷启动时应用。fallbackToCacheTimeout 默认 0，启动时不等待网络更新；checkAutomatically 默认 ON_LOAD。

## 安装与更新服务器

最简单的安装路径是 EAS Update 配置向导。自建更新服务或仅使用原生文件配置时，可手动安装：

```sh
npx expo install expo-updates
yarn expo install expo-updates
pnpm expo install expo-updates
bun expo install expo-updates
```

已有原生 React Native 工程要按 Expo 官方手动安装 / 配置指南接入。app config 至少要设 updates.url（服务 URL）与 runtimeVersion；服务端必须实现 Expo Updates protocol。EAS Update 向导会自动配置这些属性。

## Build-time 配置

多数更新配置放在 app config 的 updates 属性下；runtimeVersion 为根级属性。

| Expo app config 属性 | 默认值 | iOS 原生 key | Android meta-data |
| --- | --- | --- | --- |
| updates.enabled | true | EXUpdatesEnabled | expo.modules.updates.ENABLED |
| updates.url | 无，必填核心项 | EXUpdatesURL | expo.modules.updates.EXPO_UPDATE_URL |
| updates.requestHeaders | 无 | EXUpdatesRequestHeaders | expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY |
| runtimeVersion | 无，必填核心项 | EXUpdatesRuntimeVersion | expo.modules.updates.EXPO_RUNTIME_VERSION |
| updates.checkAutomatically | ON_LOAD | EXUpdatesCheckOnLaunch | expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH |
| updates.fallbackToCacheTimeout | 0 | EXUpdatesLaunchWaitMs | expo.modules.updates.EXPO_UPDATES_LAUNCH_WAIT_MS |
| updates.useEmbeddedUpdate | true | EXUpdatesHasEmbeddedUpdate | expo.modules.updates.HAS_EMBEDDED_UPDATE |
| updates.codeSigningCertificate / updates.codeSigningMetadata | 无 | EXUpdatesCodeSigningCertificate / EXUpdatesCodeSigningMetadata | 对应 CODE_SIGNING_CERTIFICATE / CODE_SIGNING_METADATA |
| updates.assetPatternsToBeBundled | 无 | N/A | N/A |
| updates.disableAntiBrickingMeasures | false | EXUpdatesDisableAntiBrickingMeasures | expo.modules.updates.DISABLE_ANTI_BRICKING_MEASURES |
| updates.enableBsdiffPatchSupport | true | EXUpdatesEnableBsdiffPatchSupport | expo.modules.updates.ENABLE_BSDIFF_PATCH_SUPPORT |

非 CNG 原生工程可把这些值写入 AndroidManifest meta-data 或 iOS Expo.plist；也能通过 Android UpdatesController.overrideConfiguration() / iOS AppController.overrideConfiguration 原生覆写。

## Runtime version policy

Runtime version 将 binary 分成可接收相同 update 的兼容组。原生代码或原生依赖变化时，应确保版本组也变化。

### 手动配置

```json
{
  "expo": {
    "runtimeVersion": "1.4.0-native-3"
  }
}
```

### 选择 runtime version policy

也可以通过一个已有配置值自动推导 runtime version。在 `runtimeVersion` 中写入 policy 对象：

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "<policy_name>"
    }
  }
}
```

### appVersion policy

以 app config 的 version 作为 runtime version；适合每次公开 release 都更新 version 的自定义原生项目：

```json
{
  "expo": {
    "runtimeVersion": { "policy": "appVersion" },
    "version": "1.0.0",
    "ios": { "buildNumber": "1" },
    "android": { "versionCode": 1 }
  }
}
```

该 appVersion 示例会生成 runtimeVersion 1.0.0；采用此策略时要在每次公开 release 手动更新 app config 的 version。

### nativeVersion policy

以 version 加 iOS buildNumber / Android versionCode 形成兼容版本。需要手动维护各平台原生 build 号；Android / iOS 的原生号不同会得到不同 runtime group：

```json
{
  "expo": {
    "runtimeVersion": { "policy": "nativeVersion" },
    "version": "1.0.0",
    "ios": { "buildNumber": "1" },
    "android": { "versionCode": 1 }
  }
}
```

该 nativeVersion 示例生成类似 1.0.0(1) 的兼容 runtime 字符串。

### fingerprint policy

使用 @expo/fingerprint 根据项目内容自动计算 runtime hash，覆盖 SDK 升级和原生依赖 / 配置变化，适用于有 / 没有自定义原生代码的项目：

```json
{
  "expo": {
    "runtimeVersion": { "policy": "fingerprint" }
  }
}
```

## Objective-C++ 原生配置

iOS 原生入口或 AppDelegate.mm 若使用 Objective-C++ 并调用 Updates 原生 override API，需要引用以下 Swift generated headers：

```objective-c++
#import "ExpoModulesCore-Swift.h"
#import "EXUpdatesInterface-Swift.h"
#import "EXUpdates-Swift.h"
```

## Usage：手动检查、下载、重载

把 checkAutomatically 设为 ON_ERROR_RECOVERY 或 NEVER 可关闭 / 减少默认 launch check。手动检查只查询，不下载；fetchUpdateAsync 下载；reloadAsync 立即重启使用下载的 JS。若不 reload，新包下次冷启动应用：

```tsx
import * as Updates from 'expo-updates';
import { Alert, Button, View } from 'react-native';

export default function UpdateActions() {
  async function checkAndApply() {
    try {
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) {
        Alert.alert('当前没有可用更新');
        return;
      }
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      // 不要假设 reloadAsync resolve 后还会继续执行 JS。
    } catch (error) {
      Alert.alert('检查更新失败', String(error));
    }
  }
  return <View><Button title="检查并应用更新" onPress={() => void checkAndApply()} /></View>;
}
```

## Usage：useUpdates hook

useUpdates 汇总当前更新、检查 / 下载错误和进度。新 update 下载成功后 isUpdatePending 为 true，可以自动 reload 或提示用户：

```tsx
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export function UpdatesStatus() {
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) void Updates.reloadAsync();
  }, [isUpdatePending]);

  const showDownloadButton = isUpdateAvailable;
  const launchText = currentlyRunning.isEmbeddedLaunch
    ? '当前运行安装包内置代码'
    : '当前运行下载的更新代码';

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Updates Demo</Text>
      <Text>{launchText}</Text>
      <Button title="手动检查更新" onPress={() => Updates.checkForUpdateAsync()} />
      {showDownloadButton ? (
        <Button title="下载并运行更新" onPress={() => Updates.fetchUpdateAsync()} />
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  headerText: { fontSize: 20, fontWeight: 'bold' },
});
```

## Testing 与 Debug / Release 边界

大多数 Updates API 只能在 release build 真正使用：

- **Debug build：**默认从开发 server 取最新 JS，不走 published update 的常规加载路径；可以构建一个采用 release-style updates 行为的 debug build，用于断开 dev server 后排查。
- **Development build：**用 eas update 发布后能浏览模拟 update 内容，但多数 Updates API 不可用。
- **Expo Go：**只支持使用 Expo Go-compatible libraries 的更新预览；多数 API 仍不可用。
- **Release build：**完整 Updates API 可用；本地 release build 无需提交商店即可测试。

```sh
# 发布 / 获取一个 update
eas update

# 本地 release variant
npx expo run:android --variant release
npx expo run:ios --configuration Release
```

## 常量与主要方法

| API | 作用 / 限制 |
| --- | --- |
| Updates.channel: string 或 null | EAS Update channel；Expo Go / development build 为 null。 |
| Updates.checkAutomatically | 当前自动检查策略。 |
| Updates.createdAt: Date 或 null | 当前 update 创建时间；development / disabled 时 null。 |
| Updates.emergencyLaunchReason | emergency fallback 时错误描述。 |
| Updates.isEmbeddedLaunch | 是否运行安装包内置 update。 |
| Updates.isEmergencyLaunch | 是否由于更高版本无法启动而回退 embedded update。 |
| Updates.isEnabled | 更新功能是否启用；缺 URL、runtime version 或原生初始化问题会为 false。 |
| Updates.latestContext | 最新原生状态机 context。 |
| Updates.launchDuration | 启动耗时，单位毫秒。 |
| Updates.manifest | 当前 update manifest；development / disabled 时为空对象。 |
| Updates.runtimeVersion / updateId | 当前运行兼容组 / 更新 UUID；本地开发时 updateId 为 null。 |
| checkForUpdateAsync() | 只查询是否有兼容 update；dev / Expo Go / disabled 会 reject。避免频繁轮询，消耗网络、电量且服务可能限流。 |
| fetchUpdateAsync() | 下载最近发布的 update；dev / Expo Go / disabled 会 reject。 |
| reloadAsync(options?) | 用最近下载的 update 重启 JS app；resolve 在原生 reload 指令发出前，不依赖之后还会运行 JS。 |
| getExtraParamsAsync() / setExtraParamAsync(key, value) | 读 / 写 Expo-Extra-Params request header；value 为 null / undefined 时移除该项；dev / Expo Go 不可用。 |
| readLogEntriesAsync(maxAge?) | 读取最近更新日志；maxAge 默认 3,600,000ms（一小时）。 |
| clearLogEntriesAsync() | 当前客户端实现是 no-op，未来持久化时才会清日志。 |
| setUpdateRequestHeadersOverride(headers) | Experimental：运行时覆写 update 请求 headers，可能导致意外行为。 |
| setUpdateURLAndRequestHeadersOverride(config) | Experimental：同时覆写 URL / headers；需 disableAntiBrickingMeasures=true。 |

ExpoUpdatesModule 还提供 reload screen native methods：showReloadScreen(options?) 与 hideReloadScreen()。

`UpdatesModuleInterface` 是平台原生模块共同的接口类型，包含 channel、自动检查策略、check/fetch/reload、日志、extra params、runtimeVersion、launch state、manifest / manifestString 和 updateId 等字段。`UpdatesEvents` 暴露原生 updates 状态变化事件；一般 app 代码优先使用 `expo-updates` 的导出 API 和 `useUpdates()`。

## 主要返回类型与状态

| 类型 | 关键字段 |
| --- | --- |
| CurrentlyRunningInfo | channel、createdAt、emergencyLaunchReason、isEmbeddedLaunch、isEmergencyLaunch、launchDuration、manifest、runtimeVersion、updateId。 |
| UpdatesEvents | `Expo.nativeUpdatesStateChangeEvent(params)` 原生状态变化事件。 |
| UpdateCheckResult | Available / NotAvailable / RollBack union；用 isAvailable、isRollBackToEmbedded、manifest、reason 区分。 |
| UpdateCheckResultAvailable | isAvailable=true、isRollBackToEmbedded=false、manifest。 |
| UpdateCheckResultNotAvailable | isAvailable=false、rollback=false、manifest undefined、带 no-update reason。 |
| UpdateCheckResultRollBack | isAvailable=false、isRollBackToEmbedded=true、manifest undefined。 |
| UpdateFetchResult | Success: isNew=true / rollback=false / 有 manifest；Failure: false / false / 无 manifest；RollBackToEmbedded: false / true / 无 manifest。 |
| UpdateInfo | NEW 有 manifest / updateId；ROLLBACK 的 manifest / updateId undefined。 |
| Manifest | ExpoUpdatesManifest 或 EmbeddedManifest。 |
| UpdatesLogEntry | code、level、message、timestamp，以及可选 assetId、stacktrace、updateId。 |
| UseUpdatesReturnType | availableUpdate、downloadedUpdate、currentlyRunning、checkError、downloadError、downloadProgress (0-1)、isChecking、isDownloading、isRestarting、isStartupProcedureRunning、isUpdateAvailable、isUpdatePending、lastCheckForUpdateTimeSinceRestart、restartCount。 |
| ReloadScreenOptions | backgroundColor、fade、image、imageFullScreen、imageResizeMode、spinner。 |
| ReloadScreenImageSource | url、width、height、scale。 |

## 自动检查策略、日志枚举、Error codes

| 类型 | 可能的值 / 含义 |
| --- | --- |
| UpdatesCheckAutomaticallyValue | NEVER、ON_ERROR_RECOVERY、ON_LOAD（默认）、WIFI_ONLY。 |
| UpdatesCheckAutomaticallyNativeValue | ALWAYS、ERROR_RECOVERY_ONLY、NEVER、WIFI_ONLY。 |
| UpdateInfoType | NEW、ROLLBACK。 |
| UpdatesLogEntryLevel | DEBUG、ERROR、FATAL、INFO、TRACE、WARN。 |
| UpdatesLogEntryCode | ASSETS_FAILED_TO_LOAD、INITIALIZATION_ERROR、JS_RUNTIME_ERROR、NONE、NO_UPDATES_AVAILABLE、UNKNOWN、UPDATE_ASSETS_NOT_AVAILABLE、UPDATE_CODE_SIGNING_ERROR、UPDATE_FAILED_TO_LOAD、UPDATE_HAS_INVALID_SIGNATURE、UPDATE_SERVER_UNREACHABLE。 |
| UpdateCheckResultNotAvailableReason | NO_UPDATE_AVAILABLE_ON_SERVER、ROLLBACK_NO_EMBEDDED、ROLLBACK_REJECTED_BY_SELECTION_POLICY、UPDATE_PREVIOUSLY_FAILED、UPDATE_REJECTED_BY_SELECTION_POLICY。 |

| Error code | 含义 |
| --- | --- |
| ERR_UPDATES_DISABLED | Updates disabled 或 development mode 调用了 release-only 方法。 |
| ERR_UPDATES_RELOAD | app reload 失败；bare React Native app 检查原生安装 / 初始化。 |
| ERR_UPDATES_CHECK | 检查更新时发生意外错误。 |
| ERR_UPDATES_FETCH | 下载更新时发生意外错误。 |
| ERR_UPDATES_READ_LOGS | 读取 Updates 日志时发生意外错误。 |
| ERR_NOT_AVAILABLE_IN_DEV_CLIENT | 方法不支持 development build；需用 release build 验证。 |

## Latest 与 SDK v56 对照

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐依赖 | expo-updates ~57.0.23 | ~56.0.27 |
| Installation、config / runtime policies、Usage 代码、主要 API / enums / error codes | 两页相同 | 两页相同 |
| 官方页脚 Next | Video | Video |

## 官方源页代码覆盖

- Installation：四种包管理器安装命令。
- Config / runtimeVersion：手动版本字符串、policy 通用形式、appVersion / nativeVersion / fingerprint 示例均已覆盖。
- Native override：Android / iOS native config 说明与 Objective-C++ 三个 Swift generated header import。
- Usage：手动 check / fetch / reload 流程与 useUpdates hook pending 状态示例。
- Testing：debug / development build / Expo Go / release 限制和本地 release build 命令。
- API：Constants、主要方法、UseUpdatesReturnType、结果 union、策略 / 日志 enums 与六个错误码均已列出。

**翻页：**[上一页：Expo SDK TrackingTransparency 跟踪透明度](./209-Expo-SDK-TrackingTransparency.md) · [目录](./README.md) · [下一页：Expo SDK Video](./211-Expo-SDK-Video.md)
