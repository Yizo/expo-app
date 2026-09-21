# 152｜Expo SDK Constants 应用与运行时信息

**翻页：**[上一页：Expo SDK Clipboard 剪贴板](./151-Expo-SDK-Clipboard.md) · [目录](./README.md) · [下一页：Expo SDK Contacts 联系人](./153-Expo-SDK-Contacts.md)

**官方页面：**[Constants · Latest](https://docs.expo.dev/versions/latest/sdk/constants/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/constants/)

**版本与平台：**Latest 推荐 `expo-constants ~57.0.19`，SDK v56.0.0 推荐 `~56.0.26`。此模块在 Android、iOS、tvOS 和 Web 可用，并包含在 Expo Go 中。两版类型和多数字段一致；`expoVersion` 的 null 说明文字略有差异，含义都是 Web 或未在 Expo Go 中运行时可能没有 Expo Go 版本。

## 这个模块解决什么问题

`expo-constants` 读取应用配置、当前运行环境和系统启动时提供的信息。名字里的 “Constants” 容易让人误以为每个字段永远不变：应用配置与原生构建字段相对稳定，运行环境、会话 ID 等则描述当前运行状态。部分旧字段已经弃用，设备型号等信息应从 `expo-device` 读取。

按 Expo SDK 安装并默认导入：

```sh
npx expo install expo-constants
# 也可以使用：yarn expo install expo-constants
# 或：pnpm expo install expo-constants
# 或：bun expo install expo-constants
```

```ts
import Constants from 'expo-constants';
```

实际使用时常见的是 `Constants.expoConfig` 和 `Constants.executionEnvironment`。前者可读取 Expo 配置，后者说明当前 JS bundle 跑在 Expo Go、开发客户端还是独立发布包中。`expoConfig` 可能为 `null`，所以读取配置字段应使用可选链或后备值：

```tsx
import Constants from 'expo-constants';
import { Text, View } from 'react-native';

export default function RuntimeInfo() {
  const config = Constants.expoConfig;

  return (
    <View>
      <Text>应用：{config?.name ?? '未提供 Expo 配置'}</Text>
      <Text>版本：{config?.version ?? '未配置'}</Text>
      <Text>运行环境：{Constants.executionEnvironment}</Text>
      <Text>运行时版本：{Constants.expoRuntimeVersion ?? '当前平台无值'}</Text>
    </View>
  );
}
```

这是根据 API 字段编写的入门示例；官方源页只有安装命令和模块导入，没有独立的 Usage 代码示例。

## NativeConstants 常用字段

`Constants` 暴露的平台信息属于 `NativeConstants`。它可粗略理解为 Expo 启动时将原生应用、设备和打包配置提供给 JavaScript 的数据集合。下表覆盖源页列出的字段：

| 字段 | 类型 / 平台 | 说明 |
| --- | --- | --- |
| `appOwnership` | `AppOwnership \| null` | 旧字段，已弃用；改看 `Constants.executionEnvironment`。在 Expo Go 返回 `'expo'`，其它情况为 `null`。 |
| `debugMode` | `boolean` | 调试模式为 `true`（与 `__DEV__` 一致），否则为 `false`。 |
| `deviceName` | 可选 `string` | 人类可读的设备类型名称。 |
| `deviceYearClass` | `number \| null` | 已迁到 `expo-device` 的 `Device.deviceYearClass`。 |
| `easConfig` | `EASConfig \| null` | 使用 EAS 时填充的 EAS 配置对象。 |
| `executionEnvironment` | `ExecutionEnvironment` | 当前 JS bundle 的运行环境，见下方枚举。 |
| `experienceUrl` | `string` | 当前体验 / 应用的 URL。 |
| `expoConfig` | `(ExpoConfig & { hostUri: string }) \| null` | `app.json` / `app.config.js` 中的标准 Expo 配置；经典和现代 manifest、内嵌或远端配置都应优先从这里读取。 |
| `expoGoConfig` | `ExpoGoConfig \| null` | 运行于 Expo Go 时提供的 Expo Go 配置。 |
| `expoRuntimeVersion` | `string \| null` | Expo Updates 使用的 runtime version；文档说明 Web 上可为 `null`。 |
| `expoVersion` | `string \| null` | 当前运行的 Expo Go 应用版本；不是项目 SDK 版本。现有 React Native / bare 工程和 Web 上为 `null`。 |
| `getWebViewUserAgentAsync()` | `() => Promise<string \| null>` | 读取 WebView 发起请求时使用的 user agent；它可能不同于 JS `fetch` 请求的 user agent。 |
| `intentUri` | 可选 `string` | 当前 intent URI 字段。 |
| `isDetached` | 可选 `boolean` | 指示 detached 状态的字段。 |
| `isHeadless` | `boolean` | 是否在 headless 模式运行。 |
| `linkingUri` | `string` | 当前体验的 Linking URI。 |
| `manifest2` | `ExpoUpdatesManifest \| null` | 使用现代 Expo Updates 时的更新 manifest；它不是 app config，读取应用配置应使用 `expoConfig`。 |
| `platform` | 可选 `PlatformManifest` | 平台专属 manifest 数据；和 `manifest`、`manifest2` 是不同字段。 |
| `sessionId` | `string` | 本次应用会话的唯一 ID；同一应用不同启动也会变化。 |
| `statusBarHeight` | `number` | 默认状态栏高度；不随定位状态或通话中的状态栏变化而更新。 |
| `systemFonts` | `string[]` | 当前设备可用的系统字体名称。 |
| `systemVersion` | 可选 `number` | NativeConstants 中列出的字段；源页未给出具体说明。iOS manifest 的 `systemVersion` 是另一字段，类型为字符串且已弃用。 |

## 平台 manifest 与构建号

Manifest（清单）是随原生应用或更新传递的元数据集合。它和 Expo 配置有关联，但不是同一对象。Android 与 iOS manifest 的重要字段如下：

| 类型 / 字段 | 说明 |
| --- | --- |
| `AndroidManifest.versionCode` | 对应 app config 的 `android.versionCode`；Expo Go 中为 `null`。此字段已弃用，推荐 `expo-application` 的 `Application.nativeBuildVersion`。 |
| `IOSManifest.buildNumber` | 来自原生二进制 `Info.plist` 的 `CFBundleVersion`，可在配置中用 `ios.buildNumber` 设置；Expo Go 中为 `null`。远端更新的 `expoConfig.ios.buildNumber` 可能变化，但嵌入二进制的构建号不会随 OTA 改变。 |
| `IOSManifest.model` | 旧的人类可读设备型号，例如 iPhone 名称；已迁到 `expo-device` 的 `Device.modelName`。 |
| `IOSManifest.platform` | Apple 内部设备型号标识，如 `iPhone1,1`；已弃用，改用 `Device.modelId`。 |
| `IOSManifest.systemVersion` | iOS 系统版本字符串；已弃用，改用 `Device.osVersion`。 |
| `IOSManifest.userInterfaceIdiom` | 设备界面类型；已弃用，改用 `Device.getDeviceTypeAsync()`。 |

源页还列出一些与 manifest 配套的类型名：`Manifest` 对应 `ExpoUpdatesManifest`；`ManifestAsset`、`ManifestExtra` 描述 manifest 的资源和额外字段；`ClientScopingConfig`、`EASConfig`、`ExpoGoConfig`、`ExpoGoPackagerOpts` 分别表示客户端作用域、EAS、Expo Go 与打包器选项配置。源页将这些类型作为独立 schema 引用，本页记录名称和用途，不展开其外部 schema 字段。

`PlatformManifest` 是 `Record<string, any>` 的平台联合结构，可能包含 `android?: AndroidManifest`、`ios?: IOSManifest`、`web?: WebManifest`，以及 `detach?: { scheme: string }`、`developer?: string`、`hostUri?: string`、`scheme?: string`。`WebManifest` 也以 `Record<string, any>` 表示。

## 运行环境枚举

`AppOwnership` 已弃用，建议使用 `Constants.executionEnvironment`。旧枚举唯一列出的 `AppOwnership.Expo` 值为 `'expo'`，表示当前在 Expo Go 里运行。

| `ExecutionEnvironment` 成员 | 字符串值 | 意义 |
| --- | --- | --- |
| `Bare` | `'bare'` | 项目直接维护 iOS / Android 等原生工程目录的 React Native 项目。 |
| `Standalone` | `'standalone'` | 生产 / 发布构建，可由 EAS Build 或其它构建方式生成。 |
| `StoreClient` | `'storeClient'` | Expo Go，或使用 `expo-dev-client` 构建的开发客户端。 |

开发客户端是为当前项目预构建的原生客户端，可包含 Expo Go 没有的原生模块；所以枚举把 Expo Go 和开发客户端都归在 `StoreClient`，而不是只看应用名字。

`UserInterfaceIdiom` 描述设备交互形态：`Handset = 'handset'`、`Tablet = 'tablet'`、`Desktop = 'desktop'`、`TV = 'tv'`、`Unsupported = 'unsupported'`。文档列出的当前支持值为 handset、tablet、desktop 和 tv；CarPlay 会被识别为 unsupported。

## 源页代码覆盖与版本差异

- Installation：覆盖 `npx`、Yarn、pnpm、Bun 四种安装命令。
- API：覆盖 `import Constants from 'expo-constants'`。
- 官方页没有其它代码示例；本篇另写了读取 `expoConfig`、`executionEnvironment`、runtime version 的小例子，并按官方字段表覆盖主要 NativeConstants、平台 manifest、所有列出的类型名和枚举。
- 明确记录废弃字段和替代 API：`AppOwnership`、`AndroidManifest.versionCode`、iOS 设备信息、`NativeConstants.appOwnership`、`deviceYearClass`。

Latest 推荐 `~57.0.19`，SDK v56 推荐 `~56.0.26`。两版 API 字段和枚举基本一致。`expoVersion` 在 Latest 的说明是现有 React Native 项目 / Web 返回 `null`，v56 写作 bare workflow / Web 返回 `null`；对使用原生目录的现有 React Native 项目，这描述的是同一边界。执行环境的 `Bare` 说明在两版有措辞差异，但枚举值和含义相同。

**翻页：**[上一页：Expo SDK Clipboard 剪贴板](./151-Expo-SDK-Clipboard.md) · [目录](./README.md) · [下一页：Expo SDK Contacts 联系人](./153-Expo-SDK-Contacts.md)
