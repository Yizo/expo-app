# Expo App 配置参考：`app.json` / `app.config.js`

## 文档解决的问题

本文档说明 Expo 应用配置中可用的字段。这些字段用于描述应用身份、版本、图标、平台能力、原生构建参数、OTA 更新以及 Web/PWA 行为。

配置位置如下：

- `app.json`、`app.config.json`：字段放在 `"expo"` 对象内。
- `app.config.js`、`app.config.ts`：字段可以直接放在导出的顶层对象中。

> **文档明确说明**：本页是配置字段参考，不负责完整讲解不同配置文件的差异和动态配置方法，也没有提供完整的项目创建、构建或发布教程。

## 阅读前的核心概念

### Expo App Config

它可以类比为 React Web 项目中 `package.json`、构建工具配置、PWA Manifest 和部署配置的组合，但影响范围更大：部分字段最终会写入 iOS、Android 原生工程。

配置大致分为两类：

- **运行时可读取的数据**：例如 `extra`。
- **构建时原生配置**：例如应用标识、权限、URL Scheme。修改后通常需要重新构建，不能只刷新 JavaScript。

### Expo Go、Development Client 与独立应用

- **Expo Go**：通用的 Expo 容器，用于快速运行项目，但不能反映所有自定义原生配置。
- **Development Client**：包含项目原生能力的开发版应用。
- **Standalone App**：最终安装或发布到商店的独立应用。

因此，文档中出现“在 Expo Go 中无效”，通常意味着必须生成自己的原生构建才能验证。

### 原生工程对应关系

| Expo 配置 | iOS 原生位置 | Android 原生位置 |
|---|---|---|
| 应用显示名 | Xcode Display Name | `strings.xml` 中的 `app_name` |
| 应用标识 | `CFBundleIdentifier` | Gradle `applicationId` |
| 用户版本 | `CFBundleShortVersionString` | `versionName` |
| 构建版本 | `CFBundleVersion` | `versionCode` |
| 深度链接 | `Info.plist` | `AndroidManifest.xml` |
| 原生权限/能力 | plist、entitlements、Xcode Capabilities | `AndroidManifest.xml` |

## 通用配置

| 字段 | 作用与注意事项 |
|---|---|
| `name` | Expo Go 和独立应用主屏幕中显示的应用名称。 |
| `description` | 应用的简短说明。 |
| `slug` | 账号内唯一、适合 URL 的项目名称。它不是应用商店中的原生标识。 |
| `owner` | 项目所属 Expo 账号；未设置时使用当前用户名，团队项目尤其重要。 |
| `currentFullName` | 自动生成的 `@username/slug`，用于展示，不应手动设置；转移或重命名项目后可能变化。 |
| `originalFullName` | 同样由系统生成，但用于通知、AuthSession 代理等服务；发布后不会因项目转移或重命名而改变。 |
| `sdkVersion` | 项目使用的 Expo SDK 版本，应与 `package.json` 中安装的版本一致。 |
| `version` | 面向用户的版本；对应 iOS `CFBundleShortVersionString` 和 Android `versionName`。 |
| `platforms` | 明确支持的平台，默认是 iOS、Android；安装 `react-dom` 后默认还会包含 Web。 |
| `githubUrl` | Expo 项目页所链接的 GitHub 仓库地址。 |
| `orientation` | 锁定为 `portrait`、`landscape`，或使用不锁定方向的 `default`。 |
| `userInterfaceStyle` | `light`、`dark` 或 `automatic`；Android 生效需要安装 `expo-system-ui`。 |
| `backgroundColor` | React 根视图后面的原生背景色，默认 `#ffffff`；iOS 生效需要 `expo-system-ui`。 |
| `primaryColor` | Android 最近任务界面中的应用颜色；当前 iOS 不使用。 |
| `icon` | 通用应用图标，推荐使用 `1024x1024` PNG；平台字段可以覆盖它。 |
| `locales` | 配置系统权限弹窗等原生文本的本地化，可在 `ios`、`android` 下分别设置。 |
| `plugins` | Config Plugin 列表，用于在预构建期间修改原生工程。已有 RN 工程只有通过 Prebuild 或托管 EAS Build 才能使用这些修改。 |
| `buildCacheProvider` | 启用远程构建缓存下载；原文类型标记为 `undefined`，未进一步说明具体结构。 |

### URL Scheme 与深度链接

`scheme` 可以是字符串或字符串数组，例如：

```json
{ "scheme": "demo" }
```

构建后的应用可以响应 `demo://...`。Scheme 必须以小写字母开头，后续只能使用小写字母、数字、`+`、`.`、`-`。

> **关键限制**：这是构建时配置，在 Expo Go 中无效。顶层 `scheme` 会与 `ios.scheme`、`android.scheme` 合并。

### 自定义运行时数据

`extra` 可以保存项目自定义字段，运行时通过 `Constants.expoConfig.extra` 读取。

> **基于文档内容推导**：它适合传递非敏感环境标记和业务配置。文档没有保证这些内容保密，因此不应仅凭该字段存放客户端必须无法获取的密钥。

## 版本与 OTA 兼容性

### 三套容易混淆的版本

- `version` / `ios.version` / `android.version`：用户看到的版本号。
- `ios.buildNumber`：iOS 每次提交构建使用的构建版本字符串。
- `android.versionCode`：Google Play 要求的正整数，每次发布递增。
- `runtimeVersion`：判断某个 OTA 更新是否与当前原生构建兼容。

`runtimeVersion` 可以直接指定字符串，也可以使用策略：

- `nativeVersion`
- `sdkVersion`
- `appVersion`
- `fingerprint`

平台级 `ios.runtimeVersion`、`android.runtimeVersion` 会覆盖顶层值。

> **React Web 类比**：OTA 更新类似替换服务器上的 JS 和资源，但移动应用还包含已经安装在设备上的原生二进制代码。`runtimeVersion` 是两者之间的兼容边界，不等同于 npm 包版本或用户版本号。

## `updates`：OTA 更新配置

| 字段 | 作用与风险 |
|---|---|
| `enabled` | 默认 `true`；关闭后只运行构建时嵌入的代码和资源。 |
| `checkAutomatically` | `ON_LOAD`、`ON_ERROR_RECOVERY`、`WIFI_ONLY` 或 `NEVER`；默认每次启动检查。 |
| `useEmbeddedUpdate` | 默认使用安装包内嵌更新。设为 `false` 会在启动时拉取远程更新，文档明确要求不要用于生产环境。 |
| `fallbackToCacheTimeout` | 启动时等待新更新的毫秒数，范围 `0`～`300000`，默认 `0`；超时下载的更新下次启动才应用。 |
| `url` | 获取更新 Manifest 的地址。 |
| `codeSigningCertificate` | 验证更新签名的本地 PEM X.509 证书；设置后所有下载更新都必须签名。 |
| `codeSigningMetadata` | 签名算法仅列出 `rsa-v1_5-sha256`，并通过 `keyid` 标识密钥。 |
| `requestHeaders` | 获取 Manifest 或资源时附加的 HTTP Header，可能覆盖预设 Header。 |
| `assetPatternsToBeBundled` | 用相对项目根目录的 glob 选择更新中包含的资源；不设置时包含所有资源，`["**"]` 匹配全部资源。 |
| `disableAntiBrickingMeasures` | 关闭防止应用因错误更新而无法启动的保护；文档明确禁止在生产环境使用。 |
| `useNativeDebug` | 在启用更新系统时调试原生代码，同时禁用 Dev Client/Packager 的 JS 调试；不得用于生产环境。 |
| `enableBsdiffPatchSupport` | 是否支持通过 bsdiff 下载和应用 Bundle 差异，默认 `true`。 |

## Android 状态栏与键盘

`androidStatusBar` 已被废弃，文档建议改用 `expo-status-bar` 插件配置。旧字段包括：

- `barStyle`：状态栏图标使用亮色或暗色。
- `backgroundColor`：支持 `#RRGGBB` 和带透明度的 `#RRGGBBAA`。
- `hidden`：是否隐藏状态栏，默认 `false`。
- `translucent`：默认 `true`，状态栏浮在内容上方，效果类似 Web 的绝对定位。

当 `translucent: true` 与 `android.softwareKeyboardLayoutMode: "resize"` 同时使用时，可能出现异常键盘布局，需要使用 `KeyboardAvoidingView` 管理。

## iOS 配置

### 身份、版本与构建

- `ios.appleTeamId`：Apple Developer Team ID。
- `ios.bundleIdentifier`：App Store 唯一标识，通常采用反向域名格式，例如 `com.example.app`。
- `ios.version`：覆盖顶层 `version`。
- `ios.buildNumber`：对应 `CFBundleVersion`；Transporter 的 Version Number 来自 `expo.version`，不是该字段。
- `ios.deploymentTarget`：最低支持的 iOS 版本，如 `"18.6"` 或 `"26"`。
- `ios.publishManifestPath`、`ios.publishBundlePath`：发布时 Manifest 和 Bundle 的输出路径。

### 外观与设备支持

- `ios.backgroundColor`、`ios.userInterfaceStyle`、`ios.scheme`、`ios.icon` 会覆盖或扩展对应顶层配置。
- `ios.icon` 支持普通图片、`.icon` 目录，以及 `light`、`dark`、`tinted` 多外观图标。
- `ios.supportsTablet` 默认 `false`；`isTabletOnly` 表示仅支持平板。
- `requireFullScreen: true` 会关闭 iPad Slide Over 和 Split View。
- `appStoreUrl` 用于从公开 Expo 项目页链接到 App Store。
- `bitcode` 原文类型标记为 `undefined`，Expo Go 不支持，默认使用模板设置。

### 原生能力与敏感配置

- `ios.config` 仅在构建过程中使用，不会进入生产 Manifest，运行时读取结果是 `undefined`。
- `ios.config.usesNonExemptEncryption` 设置出口加密声明。
- `ios.config.googleMapsApiKey` 配置 Google Maps iOS SDK。
- `ios.googleServicesFile` 指向 Firebase 的 `GoogleService-Info.plist`。
- `ios.associatedDomains` 配置 Universal Links 等关联域名，格式为 `applinks:<domain>[:port]`。
- `usesIcloudStorage`、`usesAppleSignIn`、`usesBroadcastPushNotifications` 用于声明对应 Apple 能力。
- `accessesContactNotes` 需要先得到 Apple 授权，否则不能带此能力提交审核。

`usesBroadcastPushNotifications` 只有在 EAS CLI 执行能力同步或其他工具处理时才产生效果，否则必须在 Apple Developer Portal 手动启用。

### 直接写入原生配置

- `ios.infoPlist`：任意写入 `Info.plist`。
- `ios.entitlements`：任意写入 entitlements。
- `ios.privacyManifests`：生成 `PrivacyInfo.xcprivacy`，声明受限 API 使用理由、追踪域名、是否追踪以及收集的数据类型和用途。

> **高风险提醒**：`infoPlist` 和 `entitlements` 不执行额外验证，错误配置可能导致 App Store 拒审。

## Android 配置

### 身份、版本与外观

- `android.package`：Play Store 唯一 Application ID，例如 `com.example.app`；各段应以小写字母开头。
- `android.version`：覆盖顶层 `version`。
- `android.versionCode`：每次发布递增的正整数。
- `android.backgroundColor`、`userInterfaceStyle`、`scheme`、`icon`：Android 平台覆盖或扩展配置。
- `predictiveBackGestureEnabled`：启用 Android 13 及以上的预测性返回手势，默认 `false`。
- `allowBackup`：默认遵循 Android 的 `true`；敏感应用可以设为 `false`。
- `softwareKeyboardLayoutMode`：`resize` 或 `pan`，默认 `resize`。

### Adaptive Icon

`android.adaptiveIcon` 将图标拆成前景和背景，以适配不同厂商的图标形状：

- `foregroundImage`：前景图，优先级高于顶层 `icon` 和 `android.icon`。
- `backgroundImage`：背景图，必须与前景图尺寸相同；设置后覆盖背景色。
- `backgroundColor`：默认白色；没有前景图时不生效。
- `monochromeImage`：Android 13+ 主题图标使用的单色图。

### 权限、链接与第三方服务

- `android.permissions`：Prebuild 时添加到 `AndroidManifest.xml` 的权限。
- `android.blockedPermissions`：从最终 Manifest 中删除依赖自动合并进来的权限；Expo Go 不支持。
- `android.intentFilters`：配置 Android Intent Filter，可处理网页链接或自定义行为。
- `intentFilters.autoVerify: true`：尝试将应用设为链接的默认处理程序，但服务器还必须提供域名所有权验证 JSON。
- `android.googleServicesFile`：Firebase 的 `google-services.json`；设置后会为独立应用启用 FCM。
- `android.config.googleMaps.apiKey`：Google Maps Android SDK Key；`android.config` 不进入生产 Manifest，运行时为 `undefined`。
- `playStoreUrl`：公开 Expo 项目页中的 Play Store 链接。
- `publishManifestPath`、`publishBundlePath`：Android 发布产物路径。

## Web 配置

`web` 部分主要对应 Web 构建方式和 PWA Manifest：

- `output`：`single` 为单页 SPA；`static` 为 Expo Router 每个路由生成 HTML；`server` 生成静态 HTML 和需要自定义 Node.js 服务器承载的 API Routes。
- `favicon`、`name`、`shortName`、`description`、`lang`、`dir`：浏览器和 PWA 展示信息，其中 `shortName` 最多 12 个字符。
- `scope`、`startUrl`：约束 PWA 启动和导航范围；`startUrl` 必须是相对 Manifest 的相对 URL。
- `display`：`fullscreen`、`standalone`、`minimal-ui` 或 `browser`。
- `orientation`：比移动端顶层配置提供更细的方向选项。
- `themeColor`、`backgroundColor`、`barStyle`：控制启动过程、任务切换器和状态栏外观。
- `preferRelatedApplications`：提示用户优先使用 `ios`、`android` 中定义的原生应用。
- `web.splash`：PWA 启动画面；图片必须为 PNG，`resizeMode` 为 `cover` 或 `contain`。
- `web.config.firebase`：Firebase Web 初始化参数。
- `web.bundler`：使用 `webpack` 或 `metro`，仅本地 `npx expo` CLI 支持。
- `web.dangerous`：实验功能，可能在没有弃用通知的情况下发生破坏性变化。

## 实验性配置

`experiments` 中的能力可能不稳定、不受支持或直接移除：

- `onDemandFilesystem`：允许 Metro 在 `watchFolders` 外和包管理器全局虚拟存储中打包。
- `autolinkingModuleResolution`：让 Metro 使用 Expo Autolinking 的解析结果，避免 monorepo 中 React、React Native 和原生模块版本错位。
- `baseUrl`：部署到域名子路径时给资源链接增加前缀；推荐以 `/` 开头，否则资源相对位置可能异常。
- `supportsTVOnly`：项目仅支持 Apple TV 和 Android TV。
- `tsconfigPaths`：让 Metro 支持 `tsconfig`/`jsconfig` 的路径别名。
- `typedRoutes`：为 Expo Router v2 启用类型化链接，需要 TypeScript。
- `turboModules`：启用新的 JS 与原生通信方式；不支持远程调试，启用后会关闭远程调试。
- `reactCanary`、`reactCompiler`：测试 React Canary 和 React Compiler。
- `reactServerComponentRoutes`、`reactServerFunctions`：实验性启用 Expo Router 的 RSC 路由和 Server Functions。
- `inlineModules.watchedDirectories`：启用 Inline Modules 并指定监听目录。
- `experiments.buildCacheProvider`：已弃用，应改用顶层 `buildCacheProvider`。

`_internal.pluginHistory` 是开发工具记录已运行插件的内部字段，不属于常规业务配置。

## React Web 开发者最容易误解的地方

1. 修改原生字段不等于修改普通前端环境变量。应用标识、权限、图标、Scheme、Entitlements 等通常需要重新生成或构建原生应用。
2. Expo Go 不是最终应用。它无法验证自定义 Scheme、被阻止的 Android 权限、Bitcode 等构建级行为。
3. `version`、原生构建号和 `runtimeVersion` 解决三个不同问题，不能用一个字段代替。
4. iOS `bundleIdentifier` 与 Android `package` 类似 Web 的唯一应用身份，但发布后不应当随意更改。
5. Android 权限可能由原生依赖自动加入，不能只检查 `android.permissions`；必要时需要 `blockedPermissions`。
6. `ios.infoPlist`、`ios.entitlements` 和实验字段属于低层逃生口，Expo 不会替你保证商店审核或版本兼容性。
7. `ios.config`、`android.config` 不进入生产 Manifest，并不代表客户端配置文件中的所有值天然安全。

## 实际开发中的配置顺序

> **基于文档内容推导**

1. 先确定 `name`、`slug`、`owner`、`ios.bundleIdentifier` 和 `android.package` 等项目身份。
2. 配置 `version`、`ios.buildNumber`、`android.versionCode` 和适合更新策略的 `runtimeVersion`。
3. 添加平台图标、颜色、方向、深色模式和设备支持范围。
4. 根据功能配置权限、URL Scheme、Associated Domains、Intent Filters、Firebase 和 Apple 能力。
5. 决定是否使用 OTA 更新，并重点验证启动等待、回退和签名策略。
6. 使用开发构建验证原生配置，不能只在 Expo Go 或 Web 环境中检查。
7. 发布前审核隐私 Manifest、权限、备份策略、原生 API Key 和实验性开关。

> **基于经验建议**：将生产、测试环境差异放入 `app.config.js` 或 `app.config.ts` 的动态逻辑中，并在 CI 中输出最终解析后的配置进行核对。本页只列出可用字段，未具体讲解动态配置实现。

## 当前文档未涉及的内容

- 没有提供创建 Expo 项目、安装依赖、Prebuild、EAS Build 或商店发布的完整命令。
- 没有系统解释 Config Plugin 的编写方式。
- 没有提供 OTA 更新服务器的部署教程。
- 没有完整说明各权限对应的运行时申请 API。
- 没有说明所有配置变更是否需要重新构建，应结合相应功能文档确认。

## 总结

`app.json` / `app.config.js` 是 Expo 项目的统一配置入口：顶层字段提供跨平台默认值，`ios`、`android`、`web` 提供平台覆盖，`updates` 管理 OTA，`experiments` 则承载不稳定能力。

对 React Web 开发者而言，最重要的认知是：这不只是前端构建配置。许多字段会改变最终安装包中的原生 Manifest、plist、entitlements、权限和平台能力，因此必须通过实际原生构建进行验证。

---

## 文档导航

- **上一页**：无
- **下一页**：[babel](./2__babel.md)
