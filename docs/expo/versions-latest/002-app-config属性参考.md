# 002｜Expo app config 属性参考（Latest）

**翻页：**[上一页：SDK 版本总览](./001-SDK版本总览.md) · [目录](./README.md) · [下一页：Babel 配置参考](./003-Babel配置参考.md)

**官方页面：**[app.json / app.config.js](https://docs.expo.dev/versions/latest/config/app/)

**版本边界：**这是 `versions/latest` 的配置属性参考，页面当前对应 SDK 57.0.0。项目为 Expo `~56.0.11`；字段名、类型、平台支持和默认值要对照 [SDK v56.0.0 app config reference](https://docs.expo.dev/versions/v56.0.0/config/app/)。下例反映 Latest schema，不承诺所有字段在 SDK 56 都已支持。

## 顶层字段分组

app config 常见形式是 `app.json` 的 `expo` 对象，或 JS / TS config 中直接返回该对象：

```json
{
  "expo": {
    "name": "Sample App",
    "slug": "sample-app",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "icon": "./assets/icon.png",
    "scheme": "sampleapp",
    "runtimeVersion": { "policy": "fingerprint" },
    "extra": { "feature": "sample" },
    "updates": { "checkAutomatically": "ON_LOAD" },
    "plugins": [],
    "ios": {
      "bundleIdentifier": "com.example.sampleapp",
      "icon": {
        "light": "./assets/ios-light.png",
        "dark": "./assets/ios-dark.png"
      }
    },
    "android": {
      "package": "com.example.sampleapp",
      "versionCode": 1
    },
    "web": { "output": "static", "favicon": "./assets/favicon.png" }
  }
}
```

示例只展示字段类别。不要将 store identifier、权限或平台能力直接复制到另一 SDK；先核对目标版本 schema。

### 身份、版本与支持平台

常见全局属性包括 `name`、`description`、`slug`、`owner`、`version`、`platforms`、`githubUrl`、`orientation`。`currentFullName` / `originalFullName` 是 Expo 自动生成值，通常不直接设置。`sdkVersion` 要与 package.json 的 Expo 版本配套。

`runtimeVersion` 是 OTA 更新兼容策略：可以给明确字符串，或使用 `nativeVersion`、`sdkVersion`、`appVersion`、`fingerprint` policy。它表达原生二进制与 JS update 是否兼容，不等同于商店中的 app `version`。

### 外观、启动和 URL

全局 `icon`、`backgroundColor`、`primaryColor`、`userInterfaceStyle` 和旧 Android `androidStatusBar` 会影响应用品牌与系统外观。Android 状态栏对象在参考页标为 deprecated，应优先用专门模块配置。

`scheme` 决定 `sampleapp://...` deep link 协议；该设置会写进构建时原生配置，Expo Go 不会根据这个字段修改其通用 binary。`developmentClient.silentLaunch` 影响开发客户端启动提示。

### OTA / Updates 与扩展字段

`updates` 控制远程 update 是否启用、启动检查策略、是否先用嵌入 bundle、超时、manifest URL、code signing、请求 header、捆绑资源匹配与调试选项。`assetPatternsToBeBundled` 是相对项目根目录的 glob 列表。

`extra` 可把 JSON 兼容的附加配置传给 app（运行时通过 expo-constants 读取），不适合放密码。`locales` 定义系统弹窗等多语言内容；`plugins` 配置 Prebuild 插件；`buildCacheProvider` 配置远程缓存；`_internal` 是内部开发工具字段，不应作为一般应用设置使用。

## iOS 专属配置

| 字段类别 | 代表字段与用途 |
| --- | --- |
| App identity | `appleTeamId`、`bundleIdentifier`、`buildNumber`、`version` |
| Minimum OS / appearance | `deploymentTarget`、`backgroundColor`、`userInterfaceStyle` |
| URL / icon | `scheme`、`icon`；Latest 支持单独描述 light / dark / tinted 图标外观，v56 要查对应版本 schema |
| 商店及平台能力 | `appStoreUrl`、`supportsTablet`、`isTabletOnly`、`requireFullScreen`、`usesNonExemptEncryption` |
| Firebase / maps | `googleServicesFile`、`googleMapsApiKey` |
| 原生扩展 | `infoPlist`、`entitlements`、`privacyManifests` |

`infoPlist` 和 `entitlements` 可传任意原生键值；错误或未获授权的平台声明可能影响 App Store 审核。`privacyManifests` 对应 `PrivacyInfo.xcprivacy`，可声明 tracking、收集数据和 required-reason API 类别、理由与域名。

## Android 专属配置

常用字段包括 `package`、`versionCode`、`backgroundColor`、`userInterfaceStyle`、`scheme`、Android 图标、`permissions` / `blockedPermissions`、`googleServicesFile`、`intentFilters`、`allowBackup`、`softwareKeyboardLayoutMode`、`runtimeVersion`、`version` 与 `predictiveBackGestureEnabled`。

- `package` 是商店中唯一的 Android application ID；`versionCode` 是 Google Play 使用、每次发布递增的正整数。
- `permissions` 添加额外 Manifest 权限，`blockedPermissions` 屏蔽依赖声明的权限。
- `intentFilters` 声明 Android 可接收的 URL / action；`autoVerify` 可让 Android 验证域名并设为链接处理 app。
- `softwareKeyboardLayoutMode` 选择软键盘弹出后页面 `resize` 或 `pan` 的行为。
- `predictiveBackGestureEnabled` 控制 Android 新版预测返回手势能力。

## Web 配置

`web.output` 选择 Web 导出形式：`single` 是单页应用，`static` 为 Expo Router 路由生成静态 HTML，`server` 包含服务器 API Route 运行形式。其它可查属性包括 `favicon`、`name` / `shortName`、语言 `lang`、网站 `scope`、主题颜色、启动页和 Firebase web config。`web.bundler` 在 webpack 与 Metro 间选择，本地 CLI 默认取决于安装包。

## Experimental 与内部字段

`experiments` 可开启不稳定选项，包括 out-of-tree 平台、on-demand filesystem、Autolinking module resolution、Web subpath `baseUrl`、TV-only、`tsconfigPaths`、`typedRoutes`、Turbo Modules、React Canary / Compiler / Server Components / Server Functions 和 inline modules。它们可能更改或移除；不要把试验性字段当稳定 API。

`_internal.pluginHistory` 用于开发工具记录插件执行历史。一般 app config 不应依赖 `_internal` 内部字段。

## 关键名词

- **App config schema**：Expo CLI 验证配置对象的结构、字段类型和允许值。
- **Application ID / Bundle ID**：Android 的 `package`、iOS 的 `bundleIdentifier`，分别标识商店应用。
- **Runtime version**：更新匹配二进制原生代码的规则。
- **Intent filter / URL scheme**：Android 接收系统 Intent 与 iOS / Android 深链回跳的配置。
- **Manifest / entitlements**：iOS 描述隐私与系统功能声明的原生清单及权限集合。
- **Experimental field**：预览能力，稳定性与兼容范围未承诺。

## 官方代码主题覆盖

源页是属性参考，主要代码是各字段的 JSON 值、平台结构和枚举值，不是一个独立程序。此页示例覆盖全局 metadata / version / runtime / URL / plugin、iOS、Android、Web 和实验字段结构，并解释 `updates`、`privacyManifests`、`intentFilters`、permissions 和 Web 输出类别。Latest 新字段尤其是 iOS icon variants、Android 预测返回与实验 API，只按 Latest 记载，不能直接推定 v56 支持。

## 下一页

页脚 **Next** 指向 [`babel.config.js`](https://docs.expo.dev/versions/latest/config/babel/)，介绍 JavaScript 转译配置。

**翻页：**[上一页：SDK 版本总览](./001-SDK版本总览.md) · [返回目录](./README.md) · [下一页：Babel 配置参考](./003-Babel配置参考.md)
