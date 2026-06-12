# Expo Updates 学习指南

> 原文档更新时间：2026 年 5 月 23 日  
> 包名：`expo-updates`  
> 支持平台：Android、iOS、tvOS；部分内容可在 Expo Go 中体验  
> 注意：原文属于“下一 SDK 版本”的未发布稳定文档；当前稳定版本为 SDK 56。实际项目应优先核对对应 SDK 版本的文档。

## 文档解决的问题

`expo-updates` 用于管理应用 JavaScript 代码和相关资源的远程更新。它会连接配置好的更新服务，检查、下载并运行与当前原生应用兼容的更新。

对于 React Web 开发者，可以将它近似理解为：

- 应用商店安装包是预先构建好的“浏览器运行环境 + 初始前端资源”。
- 远程更新类似部署新的前端 bundle。
- 但移动端更新不能像 Web 静态资源一样任意发布，新 bundle 必须与安装包中的原生代码兼容。
- 这种兼容关系由 `runtimeVersion` 标识。

本文适合以下场景：

- 使用 EAS Update 向已安装的 Expo 应用发布远程更新。
- 自定义应用何时检查、下载和启用更新。
- 判断当前运行的是安装包内置代码还是远程更新。
- 测试、诊断更新失败、回滚和紧急启动。
- 使用自建服务实现 Expo Updates 协议。
- 在 bare React Native 工程中手动集成更新模块。

## 阅读前需要理解的背景

### 原生安装包与 JavaScript 更新

React Native 应用包含两部分：

1. **原生部分**：iOS/Android 工程、原生模块、权限和系统配置等，需要生成新的安装包。
2. **JavaScript 与资源部分**：React Native 业务代码、图片等，可以由更新服务远程下发。

`expo-updates` 主要更新第二部分。它不能通过远程更新为旧安装包凭空添加新的原生模块。

例如，新 JS 代码调用了某个刚安装的原生库，但用户设备上的安装包没有包含该库，这次更新就不兼容。此时应先构建并发布新的应用安装包。

### 内置更新

构建应用安装包时，会将一份可运行的更新嵌入安装包，这就是 **embedded update（内置更新）**。

它相当于应用的本地保底版本：

- 首次安装后即使没有网络也能启动。
- 远程更新不可用或初始化失败时可以回退使用。
- `Updates.isEmbeddedLaunch` 可用于判断当前是否运行该版本。

### 冷启动与重新加载

- **冷启动**：应用进程从未运行状态开始启动，不只是页面重新渲染。
- **重新加载**：重启 React Native 的 JavaScript 运行环境，并加载另一份 bundle。
- `Updates.reloadAsync()` 不等同于 React Web 中的 `window.location.reload()`，它涉及 JS 与原生运行时的协作。

## 安装与服务配置

### 推荐方式：EAS Update

EAS Update 是 Expo 托管的更新服务，可以自动配置 `expo-updates`。多数项目应按照 EAS Update 的入门流程配置。

### 手动安装

需要自定义更新服务或直接管理原生配置时，可以安装：

```sh
# npm
npx expo install expo-updates

# yarn
yarn expo install expo-updates

# pnpm
pnpm expo install expo-updates

# bun
bun expo install expo-updates
```

`expo install` 会尽量安装与当前 Expo SDK 兼容的包版本，不应简单地把它等同于普通的 `npm install`。

bare React Native 或手动维护原生代码的通用应用还必须完成对应的 Android、iOS 原生安装步骤。只安装 npm 包并不代表原生模块已经正确初始化。

### 自定义更新服务

自建服务必须实现 **Expo Updates protocol**。EAS Update 是该协议的一种服务实现，Expo 也提供了 Custom Expo Updates Server 示例。

这意味着 `expo-updates` 并不强制依赖 EAS Update，但不能连接一个任意返回 JavaScript 文件的普通 HTTP 接口。

## 核心配置

大多数项目在 Expo app config 的 `updates` 字段中配置更新行为。配置通常发生在构建阶段，会进入最终的原生安装包。

两个必需配置是：

```json
{
  "expo": {
    "updates": {
      "url": "https://example.com/update-service"
    },
    "runtimeVersion": "1.0.0"
  }
}
```

- `updates.url`：远程更新服务地址。
- `runtimeVersion`：当前安装包及其兼容更新的运行时版本。

使用 EAS Update 入门流程时，这两项通常会自动配置。

### 配置项总览

| App config 配置 | 默认值 | 必需 | 作用 |
| --- | --- | --- | --- |
| `updates.enabled` | `true` | 否 | 是否启用更新模块 |
| `updates.url` | 无 | 是 | 更新服务地址 |
| `updates.requestHeaders` | 无 | 否 | 更新请求携带的自定义请求头 |
| `runtimeVersion` | 无 | 是 | 原生运行时兼容标识 |
| `updates.checkAutomatically` | `ON_LOAD` | 否 | 启动时何时自动检查更新 |
| `updates.fallbackToCacheTimeout` | `0` | 否 | 启动时等待远程更新的时间，单位毫秒 |
| `updates.useEmbeddedUpdate` | `true` | 否 | 是否包含并使用内置更新 |
| `updates.codeSigningCertificate` | 无 | 否 | 更新代码签名证书 |
| `updates.codeSigningMetadata` | 无 | 否 | 代码签名元数据 |
| `updates.assetPatternsToBeBundled` | 无 | 否 | 指定构建时打包的资源模式 |
| `updates.disableAntiBrickingMeasures` | `false` | 否 | 是否关闭防止应用因错误更新而无法启动的保护措施 |
| `updates.enableBsdiffPatchSupport` | `true` | 否 | 是否支持 bsdiff 差量补丁 |

`disableAntiBrickingMeasures` 属于高风险配置。关闭保护措施后，错误的运行时更新配置可能导致应用无法正常启动。

原文列出了配置名称及默认值，但没有在本页完整展开代码签名、资源打包模式和 bsdiff 的配置流程，应查阅各配置项的专门文档，不能只根据本页自行推断。

## Runtime Version：更新兼容性的边界

每次构建应用安装包时，其中都会包含当时的原生代码和原生配置。`runtimeVersion` 用一个字符串表示这套运行环境。

远程更新会指定目标 `runtimeVersion`，只有运行时版本匹配的安装包才能加载它。

这与 React Web 的主要区别是：Web bundle 通常只需适配浏览器，而 React Native bundle 还必须适配安装包内置的原生模块及配置。

### 手动指定

```json
{
  "expo": {
    "runtimeVersion": "<runtime_version_string>"
  }
}
```

手动方式最直接，但团队必须自行保证：原生兼容性发生变化时同步修改该值。

### `appVersion` 策略

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

此时 Android、iOS 构建和更新的 `runtimeVersion` 都是：

```text
1.0.0
```

它适合：

- 项目包含自定义原生代码。
- 每次公开发布都修改 `version`。
- 希望同一个公开版本共享相同运行时兼容范围。

每次公开发布都需要更新 `version`。对于 Play Store Internal Test Track 和 TestFlight，可以利用 `eas.json` 中的 `autoIncrement` 管理版本，但原文特别说明的是版本管理能力，不能据此忽略运行时兼容性检查。

### `nativeVersion` 策略

该策略组合应用版本和平台原生构建编号：

```text
[version]([buildNumber|versionCode])
```

以上配置会得到：

```text
1.0.0(1)
```

适合每次构建都会递增原生编号，并希望每个上传到测试分发平台的构建拥有独立 `runtimeVersion` 的项目。

限制如下：

- 必须在每次构建之间管理 `buildNumber` 和 `versionCode`。
- 如果 Android 与 iOS 使用不同的原生版本号，两端会得到不同的 `runtimeVersion`。
- 不同运行时版本意味着对应更新需要分别匹配。

### `fingerprint` 策略

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "fingerprint"
    }
  }
}
```

该策略使用 `@expo/fingerprint` 根据项目内容计算哈希，SDK 升级、添加自定义原生代码等变化会反映在兼容性标识中。

它同时适用于有、无自定义原生代码的项目，可以减少人工维护版本与实际原生兼容性不一致的问题。

**基于文档内容推导：** 如果团队无法稳定地保证每次原生变更都手动修改版本，`fingerprint` 更能直接表达构建与更新的真实兼容关系；具体选型仍应结合发布和回滚策略。

## 原生配置与覆盖

如果项目没有使用 Continuous Native Generation，即原生工程不是由 Expo 配置持续生成，则配置也可以直接写入原生文件：

- Android：`AndroidManifest.xml` 中的 `meta-data`。
- iOS：`Expo.plist`。
- Android 运行时覆盖：`UpdatesController.overrideConfiguration()`。
- iOS 运行时覆盖：`AppController.overrideConfiguration()`。

如果 iOS 的 `AppDelegate.mm` 或相关代码使用 Objective-C++，调用 `EXUpdatesAppController` 的运行时覆盖方法时需要导入：

```objc
#import "ExpoModulesCore-Swift.h"
#import "EXUpdatesInterface-Swift.h"
#import "EXUpdates-Swift.h"
```

这是原生工程集成要求，不是 JavaScript 组件中的 import。

## 默认更新流程

默认情况下，应用启动时会：

1. 检查是否存在兼容的新更新。
2. 如果存在，则下载到设备本地。
3. 当前启动通常继续运行已有版本。
4. 下一次应用重新启动时加载已下载的更新。

可通过以下配置调整启动行为：

- `updates.checkAutomatically`
- `updates.fallbackToCacheTimeout`

`fallbackToCacheTimeout` 会影响启动时等待更新的时间。等待过久可能拖慢启动；等待时间较短时，启动流程可能在界面已经运行后继续处理更新。

## 启动时自动检查策略

`UpdatesCheckAutomaticallyValue` 提供以下值：

| 值 | 行为 |
| --- | --- |
| `ON_LOAD` | 每次加载应用时检查，默认值 |
| `ON_ERROR_RECOVERY` | 仅在错误恢复后启动时检查 |
| `NEVER` | 完全关闭自动检查，只能通过 JS API 检查 |
| `WIFI_ONLY` | 启动且连接 Wi-Fi 时才检查 |

原生接口中可能看到对应名称：

- `ALWAYS`
- `ERROR_RECOVERY_ONLY`
- `NEVER`
- `WIFI_ONLY`

不要因为两组名称不同而认为它们是两套独立的更新机制：一组属于公开配置/API 表达，另一组属于原生接口类型。

## 手动检查、下载与应用更新

先将 `checkAutomatically` 设置为 `ON_ERROR_RECOVERY` 或 `NEVER`，避免启动时执行默认检查，再从业务代码控制更新：

```jsx
import { View, Button } from 'react-native';
import * as Updates from 'expo-updates';

function App() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  return (
    <View>
      <Button title="Fetch update" onPress={onFetchUpdateAsync} />
    </View>
  );
}
```

三步分别具有独立含义：

1. `checkForUpdateAsync()`：只询问服务器，不下载。
2. `fetchUpdateAsync()`：下载更新到设备本地存储，不会自动切换当前 JS。
3. `reloadAsync()`：重新加载应用，并使用最近下载的更新。

如果下载后不调用 `reloadAsync()`，更新将在下一次冷启动时生效。

### 检查频率限制

检查更新是一种网络请求，会消耗：

- 用户流量
- 电池
- 服务端请求额度

Expo 服务还可能限流。文档建议在应用启动或进入前台时适度检查，不要通过高频循环持续轮询。

### `reloadAsync()` 的控制流风险

不要在以下调用之后安排关键逻辑：

```ts
await Updates.reloadAsync();
```

Promise 在系统真正执行重新加载之前完成，但此后 JS 是否还能继续执行取决于操作系统、原生模块和主线程状态。

错误示例：

```ts
await Updates.reloadAsync();
await saveCriticalData(); // 不能保证执行
```

关键数据必须在调用 `reloadAsync()` 之前保存。

它与 `Expo.reloadAppAsync()` 也不相同：`Updates.reloadAsync()` 会切换到最近下载的 JavaScript bundle。

## 使用 `useUpdates()` 驱动界面

`useUpdates()` 提供当前版本、检查状态和下载状态，适合用 React 状态驱动更新提示界面。

```tsx
const {
  currentlyRunning,
  isUpdateAvailable,
  isUpdatePending
} = Updates.useUpdates();
```

常用状态包括：

| 字段 | 含义 |
| --- | --- |
| `currentlyRunning` | 当前运行版本的信息 |
| `availableUpdate` | 已检查到的可用更新 |
| `downloadedUpdate` | 已下载的更新 |
| `isChecking` | 正在检查更新 |
| `isDownloading` | 正在下载更新 |
| `downloadProgress` | 下载进度，范围为 `0` 到 `1` |
| `isRestarting` | 正在重新启动 JS |
| `isUpdateAvailable` | 已发现可用更新 |
| `isUpdatePending` | 更新已经下载并等待启用 |
| `checkError` | 启动检查或手动检查错误 |
| `downloadError` | 下载错误 |
| `restartCount` | 本次冷启动后 JS 被重新启动的次数 |
| `lastCheckForUpdateTimeSinceRestart` | 本次启动后最后一次检查时间 |
| `isStartupProcedureRunning` | 原生启动更新流程仍在运行 |

如果资源响应包含 `Content-Length`，`downloadProgress` 通常会更新得更连续。

下面的效果会在下载完成后应用更新：

```tsx
useEffect(() => {
  if (isUpdatePending) {
    Updates.reloadAsync();
  }
}, [isUpdatePending]);
```

**基于文档内容推导：** 自动重载可能打断用户正在编辑或操作的内容。业务应用通常需要在立即更新、提示用户确认和等待下次启动之间做产品层面的选择。

## 当前运行版本信息

主要常量如下：

| 常量 | 含义 |
| --- | --- |
| `Updates.channel` | 当前构建的 EAS Update channel；未配置时为 `null` |
| `Updates.createdAt` | 当前更新的创建时间 |
| `Updates.runtimeVersion` | 当前构建的运行时版本 |
| `Updates.updateId` | 当前更新的 UUID |
| `Updates.manifest` | 当前更新的 manifest |
| `Updates.isEmbeddedLaunch` | 是否运行安装包内置更新 |
| `Updates.isEmergencyLaunch` | 是否因为异常而紧急回退 |
| `Updates.emergencyLaunchReason` | 紧急启动原因 |
| `Updates.isEnabled` | 更新模块是否启用 |
| `Updates.launchDuration` | 启动耗时，单位毫秒 |
| `Updates.checkAutomatically` | 当前自动检查策略 |
| `Updates.latestContext` | 原生更新状态机的最新上下文 |

开发模式或模块禁用时：

- `createdAt`、`updateId` 等值可能为 `null`。
- `manifest` 为空对象。
- 不应假设所有元数据始终存在。

Expo Go 和 development build 不绑定固定 channel，可以运行任何与其原生运行时兼容的更新，因此 `Updates.channel` 始终为 `null`。

### `isEnabled` 为什么可能为 `false`

常见原因包括：

- 配置中将 `enabled` 设为 `false`。
- 更新 URL 缺失或无效。
- `runtimeVersion` 或 SDK version 缺失。
- 初始化时无法访问设备存储。

此时应用加载内置更新。

## 更新结果与回滚

### 检查结果

`checkForUpdateAsync()` 返回联合类型 `UpdateCheckResult`：

| 情况 | `isAvailable` | `isRollBackToEmbedded` | `manifest` |
| --- | ---: | ---: | --- |
| 找到新更新 | `true` | `false` | 存在 |
| 没有可用更新 | `false` | `false` | `undefined` |
| 收到回滚指令 | `false` | `true` | `undefined` |

因此，不能只用 `isAvailable === false` 表示“服务器没有内容”，它还可能是回滚场景。

没有新更新时，`reason` 可能为：

- `NO_UPDATE_AVAILABLE_ON_SERVER`：服务端没有更新 manifest 或回滚指令。
- `ROLLBACK_NO_EMBEDDED`：收到回滚指令，但应用没有内置更新。
- `ROLLBACK_REJECTED_BY_SELECTION_POLICY`：回滚不满足选择策略。
- `UPDATE_PREVIOUSLY_FAILED`：该更新曾在此设备启动，但从未成功启动。
- `UPDATE_REJECTED_BY_SELECTION_POLICY`：更新不可启动或不符合选择策略。

### 下载结果

`fetchUpdateAsync()` 返回 `UpdateFetchResult`：

- 成功获取新更新：`isNew: true`，并包含 `manifest`。
- 下载未得到新更新：`isNew: false`。
- 回滚到内置更新：`isRollBackToEmbedded: true`，不包含 `manifest`。

### 紧急启动

`expo-updates` 尽量保证运行版本单调向前，但极少数情况下可能退回安装包内置更新，即 **emergency launch**。

此时：

```ts
Updates.isEmergencyLaunch === true
```

并可通过 `Updates.emergencyLaunchReason` 获取初始化失败原因。

这意味着应用可能在运行过较新更新后重新运行较旧的内置代码。若数据结构已经被新版本迁移，旧代码能否继续读取这些数据需要应用自行考虑。

## Extra Params 与请求覆盖

### Extra Params

```ts
await Updates.setExtraParamAsync(key, value);
```

- 非空值：设置参数。
- `null` 或 `undefined`：删除参数。
- 参数会以 `Expo-Extra-Params` 请求头发送。
- 服务端可以据此选择返回哪个更新。

读取当前值：

```ts
const params = await Updates.getExtraParamsAsync();
```

这些 API 不能在 Expo Go 或开发模式中使用，模块未启用时也会失败。

### 覆盖请求头

```ts
Updates.setUpdateRequestHeadersOverride(requestHeaders);
```

它可在运行时覆盖构建阶段设置的更新请求头，用于请求特定更新。文档明确要求自行承担风险，因为它可能引发非预期行为。

### 覆盖 URL 和请求头

```ts
Updates.setUpdateURLAndRequestHeadersOverride({
  updateUrl,
  requestHeaders
});
```

传入 `null` 可取消覆盖。

该方法会改变更新来源，风险更高，必须在 `app.json` 中设置：

```json
{
  "expo": {
    "updates": {
      "disableAntiBrickingMeasures": true
    }
  }
}
```

这会关闭防止应用因错误更新而无法启动的保护措施，不适合被当作普通的环境切换功能。

## 重新加载界面

`showReloadScreen()`、`hideReloadScreen()` 和 `ReloadScreenOptions` 可控制重新加载时的过渡界面。

可配置：

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `backgroundColor` | `#ffffff` | 背景颜色 |
| `fade` | `false` | 隐藏时是否淡出 |
| `image` | 无 | 自定义图片 |
| `imageFullScreen` | `false` | 图片是否全屏 |
| `imageResizeMode` | `contain` | 图片缩放方式 |
| `spinner` | 无 | 加载指示器配置 |

图片可使用字符串、数字或包含 `url`、`width`、`height`、`scale` 的对象。缩放方式包括 `contain`、`cover`、`center` 和 `stretch`。

原文仅列出接口，没有给出完整的应用层调用流程。

## 日志与故障诊断

读取最近一小时日志：

```ts
const entries = await Updates.readLogEntriesAsync();
```

指定最长日志年龄：

```ts
const entries = await Updates.readLogEntriesAsync(10 * 60 * 1000);
```

每条日志可能包含：

- `timestamp`
- `level`
- `code`
- `message`
- `updateId`
- `assetId`
- 原生 `stacktrace`

日志级别包括 `trace`、`debug`、`info`、`warn`、`error` 和 `fatal`。

常见日志代码包括：

- 初始化失败：`INITIALIZATION_ERROR`
- JS 运行时错误：`JS_RUNTIME_ERROR`
- 更新服务不可达：`UPDATE_SERVER_UNREACHABLE`
- 更新加载失败：`UPDATE_FAILED_TO_LOAD`
- 资源加载失败：`ASSETS_FAILED_TO_LOAD`
- 资源不可用：`UPDATE_ASSETS_NOT_AVAILABLE`
- 代码签名错误：`UPDATE_CODE_SIGNING_ERROR`
- 签名无效：`UPDATE_HAS_INVALID_SIGNATURE`
- 没有可用更新：`NO_UPDATES_AVAILABLE`

`clearLogEntriesAsync()` 当前在客户端实际上不会清除日志；文档说明要等日志持久化功能实现后才会真正生效。

## 测试更新

这是最容易被 React Web 开发者误解的部分：开发服务器中的热更新结果不能证明生产 OTA 更新流程正常。

### 普通 debug build

debug build 默认总是从开发服务器加载最新 JavaScript，因此大多数常量和 API 不能在其中使用或测试。

可以专门构建一个具有 release 更新行为的 debug 版本，用来在不连接开发服务器的情况下调试原生代码。此时应用会像 release build 一样加载已发布更新。

### Development build

可以运行 `eas update` 发布更新，再在 development build 中浏览更新内容。

限制：

- 这主要模拟更新内容在应用中的表现。
- 大部分 Updates API 不可用。
- 不能把“内容显示正常”等同于完整更新流程已经验证。

### Release build

完整 Updates API 可在 release build 中使用。可选择：

- 构建 Android `.apk`。
- 构建 iOS 模拟器版本。
- 本地构建 Android release：

```sh
npx expo run:android --variant release
```

- 本地构建 iOS Release：

```sh
npx expo run:ios --configuration Release
```

测试不要求先提交到应用商店。

### Expo Go

运行 `eas update` 后，可以在 Expo Go 中浏览更新内容。

限制：

- 只能模拟更新内容。
- 大部分 Updates API 不可用。
- 仅支持使用 Expo Go 兼容库的更新。
- 包含 Expo Go 未内置原生库的更新无法借此完整验证。

## API 可用环境

以下方法不能在普通开发模式中使用，并会拒绝 Promise：

- `checkForUpdateAsync()`
- `fetchUpdateAsync()`
- `reloadAsync()`
- `getExtraParamsAsync()`
- `setExtraParamAsync()`

其中部分方法在 Expo Go 中也不可用。模块未启用时同样会失败。

常见错误码：

| 错误码 | 含义 |
| --- | --- |
| `ERR_UPDATES_DISABLED` | 模块被禁用，或应用运行在开发模式 |
| `ERR_UPDATES_RELOAD` | 无法重新加载，bare 工程尤其需要检查原生初始化 |
| `ERR_UPDATES_CHECK` | 检查更新时发生意外错误 |
| `ERR_UPDATES_FETCH` | 下载更新时发生意外错误 |
| `ERR_UPDATES_READ_LOGS` | 读取日志失败 |
| `ERR_NOT_AVAILABLE_IN_DEV_CLIENT` | API 在 development build 中不可用，应使用 release build 测试 |

bare React Native 工程中，如果生产环境的 `reloadAsync()` 被拒绝，通常意味着原生安装或初始化不完整：

- iOS 需要为 `EXUpdatesAppController` 的 `bridge` 设置正确的 `RCTBridge`。
- Android 需要使用正确的 `ReactApplication` 初始化 `UpdatesController`，或设置正确的 `ReactNativeHost`。

## React Web 开发者容易误解的地方

### 远程更新不等于 Web 部署

Web 前端更新通常部署后刷新页面即可获得。移动端更新还受到安装包内原生代码、应用商店版本和 `runtimeVersion` 的约束。

### npm 包变化不一定只是 JavaScript 变化

React Native 依赖可能包含 iOS/Android 原生实现。添加或升级这类依赖后，通常需要重新构建安装包，不能只发布远程更新。

### 检查、下载和启用是三个阶段

`checkForUpdateAsync()` 不下载，`fetchUpdateAsync()` 不立即启用，`reloadAsync()` 才会切换运行 bundle。

### 开发环境行为与生产环境不同

Metro 开发服务器、Expo Go、development build 和 release build 的更新行为及 API 可用性不同。最终验证必须在符合生产更新行为的构建中完成。

### `channel` 不是 React 的发布环境变量

它是 EAS Update 分发体系中的构建关联信息。Expo Go 和 development build 不绑定固定 channel，因此该值为 `null`。

### 回滚不只是“再发布一个旧版本”

协议可以返回回滚到内置 bundle 的指令。回滚结果具有独立类型，需要与“无更新”和“普通新更新”分开处理。

## 实际开发建议

以下为**基于经验建议**：

1. 优先使用 EAS Update 的标准配置流程，只有明确需要自建服务或动态覆盖时才进入底层配置。
2. 将“是否修改原生代码或原生配置”作为每次发布前的检查项；发生修改时重新构建安装包。
3. 在自动重载前处理草稿、表单和事务状态，避免更新中断用户操作。
4. 更新失败时记录 `runtimeVersion`、`updateId`、`isEmbeddedLaunch`、`isEmergencyLaunch` 和更新日志，便于定位设备实际运行版本。
5. 使用 release build 验证完整的检查、下载、重载、失败恢复和回滚流程。
6. 不要高频轮询更新；通常在启动、进入前台或由用户主动触发时检查。
7. 除非已有严格的服务端选择、签名和恢复方案，不要关闭 anti-bricking 保护或动态覆盖更新 URL。

## 文档明确内容与推导内容

### 文档明确说明

- `expo-updates` 用于管理远程应用代码更新。
- 更新服务必须实现 Expo Updates 协议。
- `updates.url` 和 `runtimeVersion` 是两个核心必需配置。
- 远程更新只能由 `runtimeVersion` 匹配的安装包加载。
- 默认在应用启动时检查并下载更新，在下次启动时应用。
- 大部分 API 只能在 release build 中完整使用。
- 不应频繁轮询更新。
- `reloadAsync()` 后的 JS 代码不能保证继续执行。
- 更新系统在极少数情况下可能紧急回退到内置更新。
- 动态覆盖 URL 风险较高，并要求关闭 anti-bricking 保护。

### 基于文档内容推导

- 原生依赖发生变化时，旧安装包通常不能只靠远程 JS 更新获得相应能力。
- `runtimeVersion` 实际上是远程 bundle 与原生安装包之间的兼容契约。
- 自动重载可能影响用户正在进行的操作，需要产品层面的启用时机设计。
- 紧急回退可能让旧代码面对新版本迁移后的本地数据，因此数据演进应考虑向后兼容。
- development build 中内容可见不代表完整生产更新链路已经验证。

## 当前文档未涉及

原文档没有完整说明以下内容：

- EAS Update 的 channel、branch 和发布环境如何规划。
- `eas update` 的完整命令参数。
- 更新代码签名证书的生成与轮换流程。
- 自定义更新服务器的完整协议实现。
- 应用商店审核政策对远程更新内容的具体限制。
- 更新资源缓存的容量、清理策略和生命周期。
- 生产环境灰度发布、监控指标和回滚审批流程。

这些内容不能仅根据本页补全，需要查阅对应专题文档。

## 总结

`expo-updates` 的核心不是“把 React Native 当成 Web 一样部署”，而是在原生安装包允许的兼容范围内远程更新 JavaScript 和资源。

掌握该模块需要抓住四点：

1. 用 `runtimeVersion` 建立安装包与远程更新的兼容边界。
2. 区分检查、下载、重载三个阶段。
3. 区分 Expo Go、development build、debug build 与 release build 的行为。
4. 始终保留内置更新、错误恢复和回滚能力，谨慎使用会绕过安全保护的运行时覆盖配置。

---

## 文档导航

- **上一页**：[tracking transparency](./216__tracking-transparency.md)
- **下一页**：[video](./218__video.md)
