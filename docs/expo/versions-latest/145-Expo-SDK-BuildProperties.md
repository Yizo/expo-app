# 145｜Expo SDK BuildProperties 原生构建属性

**翻页：**[上一页：Expo SDK Brownfield 原生工程集成](./144-Expo-SDK-Brownfield.md) · [目录](./README.md) · [下一页：Expo SDK Calendar](./146-Expo-SDK-Calendar.md)

**官方页面：**[BuildProperties · Latest](https://docs.expo.dev/versions/latest/sdk/build-properties/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/build-properties/)

**版本边界：**Latest 推荐 `expo-build-properties ~57.0.21`；SDK v56.0.0 推荐 `~56.0.27`。它是**构建配置插件**，在 Prebuild 生成 Android / iOS 原生工程时改写 Gradle / Podfile 配置；它不能靠 JavaScript 在运行时生效。未使用 Prebuild、手动维护原生工程的项目需直接维护原生配置，不能只改插件配置。

两版示例值不同：Latest 的 Android 样例用 `compileSdkVersion: 37`、`targetSdkVersion: 36`、Build Tools `37.0.0`；SDK v56 页面样例用 compile / target `36`、Build Tools `36.0.0`。请不要从 Latest 样例复制版本号到 SDK 56 项目。

## 它控制什么

`expo-build-properties` 让 app config 能覆盖 Prebuild 生成目录中的 Android Gradle 属性和 iOS `Podfile.properties.json` 设置。**Compile SDK** 是编译时使用的 Android API；**Target SDK** 是 App 声明面向的 Android API 级别；**Min SDK** 是 App 可安装的最低 Android 版本；iOS **Deployment Target** 是原生 App 支持的最低 iOS 版本。

安装：

```sh
npx expo install expo-build-properties
# 也可使用 yarn / pnpm / bun expo install expo-build-properties
```

## 在 app config 中设置

SDK 57 Latest 页面提供的插件配置示例：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 37,
            "targetSdkVersion": 36,
            "buildToolsVersion": "37.0.0"
          },
          "ios": {
            "deploymentTarget": "16.4"
          }
        }
      ]
    ]
  }
}
```

同样的配置可写为 `app.config.js`：

```js
export default {
  expo: {
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 37,
            targetSdkVersion: 36,
            buildToolsVersion: '37.0.0',
          },
          ios: {
            deploymentTarget: '16.4',
          },
        },
      ],
    ],
  },
};
```

精确 SDK v56.0.0 页面里的等价 Android 数值是：

```json
{
  "android": {
    "compileSdkVersion": 36,
    "targetSdkVersion": 36,
    "buildToolsVersion": "36.0.0"
  }
}
```

Android 与 iOS 各自的配置都可以覆盖顶层共享配置；如果同一属性同时出现在根层和平台块中，平台专属值优先。

## 常见 Android 属性

| 属性 | 作用与重要默认 / 备注 |
| --- | --- |
| `buildArchs?` | 覆盖原生 ABI 构建列表；默认 `armeabi-v7a`、`arm64-v8a`、`x86`、`x86_64`。例如只产出 64 位包可设 `['arm64-v8a', 'x86_64']`。 |
| `buildFromSource?` | 旧字段，已弃用，改用共享 `buildReactNativeFromSource`；从源码构建显著增加构建时间。 |
| `buildToolsVersion?`、`compileSdkVersion?`、`targetSdkVersion?`、`minSdkVersion?` | 覆盖 Android Build Tools、编译 SDK、Target SDK 和最低系统版本。 |
| `cmakeVersion?` | Latest 配置支持，用于覆盖 CMake 版本并应用到 App 与 autolink 原生模块；v56 精确页没有该字段。 |
| `enableBundleCompression?` | Latest 配置支持，压缩 JS bundle 可减小 APK，但可能增加启动耗时；v56 精确页未列此字段。 |
| `enableMinifyInReleaseBuilds?` | 在 release 构建启用 R8，混淆 Java 代码并缩小 App。 |
| `enableShrinkResources?` | 移除未使用资源；应配合 `enableMinifyInReleaseBuilds` 使用。 |
| `enablePngCrunchInReleaseBuilds?` | PNG crunch 优化；默认 `true`，若自有流程已优化 PNG 可考虑关闭。 |
| `exclusiveMavenMirror?` | 为所有依赖解析指定唯一 Maven 镜像；设置后其他仓库不再参与下载。 |
| `extraMavenRepos?` | 在所有 Gradle project 添加 Maven 仓库，可给 URL 字符串或带认证 / 凭据对象。 |
| `extraProguardRules?` | 把自定义 Proguard 规则追加到 `android/app/proguard-rules.pro`。 |
| `gifEnabled?`、`webpEnabled?`、`webpAnimated?` | 开启 React Native `<Image>` 的 GIF / WebP / 动画 WebP 支持；动画 WebP 还要求 `webpEnabled: true`。`expo-image` 不受其中部分开关影响。 |
| `kotlinVersion?` | 覆盖 Android 构建使用的 Kotlin 版本。 |
| `manifestQueries?` | 声明 App 需要与哪些其他应用、intent 或 content provider 交互。 |
| `networkInspector?` | 控制 Network Inspector，默认 `true`。 |
| `packagingOptions?` | 配置 Android Gradle 插件如何处理打包时遇到的原生库文件。 |
| `useDayNightTheme?` | 使用 DayNight 原生 theme 支持深浅色模式。 |
| `useLegacyPackaging?` | APK 中原生库采用旧的压缩打包方式；默认 `false`。 |
| `usePrecompiledHeaders?` | **Latest 实验字段**：C++ 原生构建使用预编译头提升速度；默认 `false`，并非所有原生库都兼容；v56 文档未列出。 |
| `usesCleartextTraffic?` | Android 是否允许明文网络流量；Android 9+ 默认禁止，Android 8 及以下平台默认不同。 |

Android 构建 ABI 可用列表覆盖默认值：

```json
{
  "expo": {
    "plugins": [[
      "expo-build-properties",
      { "android": { "buildArchs": ["arm64-v8a", "x86_64"] } }
    ]]
  }
}
```

### Maven 仓库与凭据

向所有 Gradle 项目追加一个公开 Maven URL：

```json
{
  "expo": {
    "plugins": [[
      "expo-build-properties",
      {
        "android": {
          "extraMavenRepos": ["https://example.com/maven-releases"]
        }
      }
    ]]
  }
}
```

如果仓库要认证，可以配置认证方式与凭据。真实 token / 密码应通过构建环境注入，不要硬编码到源码：

```js
{
  android: {
    extraMavenRepos: [{
      url: 'https://example.com/maven-releases',
      authentication: 'basic',
      credentials: {
        username: "System.getenv('MAVEN_USER')",
        password: "System.getenv('MAVEN_PASSWORD')",
      },
    }],
  },
}
```

插件会把仓库配置写入生成的 `android/build.gradle`，概念上类似：

```gradle
allprojects {
  repositories {
    maven {
      url "https://example.com/maven-releases"
      credentials {
        username = "..."
        password = "..."
      }
      authentication {
        basic(BasicAuthentication)
      }
    }
  }
}
```

`AndroidMavenRepository` 凭据可用基本用户名密码、HTTP Header 凭据或 AWS S3 凭据。字符串仓库 URL 不含凭据和认证 scheme。

### Android Manifest queries

Android 11 及以后对 App 可查询的其他 package 有过滤声明。`manifestQueries` 可按包名、Intent 或 provider authority 声明查询范围：

```json
{
  "expo": {
    "plugins": [[
      "expo-build-properties",
      {
        "android": {
          "manifestQueries": {
            "package": ["com.example.partner"],
            "provider": ["com.example.partner.files"],
            "intent": [{
              "action": "android.intent.action.VIEW",
              "data": { "scheme": "https", "host": "example.com" },
              "category": "android.intent.category.BROWSABLE"
            }]
          }
        }
      }
    ]]
  }
}
```

`manifestQueries` 下有 `package?`、`provider?`、`intent?` 数组；intent 项有 `action?`、`category?`（字符串或字符串数组）和 `data?`；data 可写 `host?`、`mimeType?`、`scheme?`。

## 常见 iOS 属性

| 属性 | 作用与版本边界 |
| --- | --- |
| `ccacheEnabled?` | 开启 C++ 编译缓存，重复构建可复用之前的编译结果。 |
| `deploymentTarget?` | 设置最低支持 iOS 版本；SDK 56 起已弃用，应改用内建 `ios.deploymentTarget`。 |
| `enableSceneSupport?` | **Latest / Expo SDK 57 专属**：为 iOS 27 / Xcode 27 scene lifecycle 配置 AppDelegate、ExpoReactNativeFactory 与 manifest；仅标准 Swift AppDelegate 模板，需 SDK 57.0.23+。SDK 58+ 默认支持后不再需要此插件字段。v56 不可用。 |
| `extraPods?` | 在生成的 Podfile 中添加 CocoaPods 依赖。 |
| `forceStaticLinking?` | `useFrameworks!` 开启时，将特定 Pod 强制静态链接；可绕开部分动态 framework / modular header 问题。 |
| `networkInspector?` | 控制 Network Inspector，默认 `true`。 |
| `privacyManifestAggregationEnabled?` | 汇总 Pods 的 `PrivacyInfo.xcprivacy` 到单个 manifest；关闭时需要手动汇总。 |
| `useFrameworks?` | `'static' \| 'dynamic'`，决定 CocoaPods 使用 framework 而非静态库。 |
| `usePrecompiledModules?` | 使用 Expo 模块 XCFramework 而不是从源码构建；Latest 默认 `true`，SDK v56 默认 `false`。 |

附加 Pod 的完整配置可以带版本、Git ref、本地路径或自定义 podspec；示例：

```js
{
  ios: {
    extraPods: [
      { name: 'Protobuf', version: '~> 3.14.0' },
      {
        name: 'AFNetworking',
        git: 'https://github.com/example/AFNetworking.git',
        tag: '1.0.0',
      },
    ],
  },
}
```

像 `{ name: 'Protobuf', version: '~> 3.14.0' }` 的项会生成类似 `pod 'Protobuf', '~> 3.14.0'` 的 Podfile 语句。

`ExtraIosPodDependency` 还支持 `branch?`、`commit?`、`configurations?`、`modular_headers?`、`path?`、`podspec?`、`source?`、`testspecs?`。对 Git 依赖可用 `git` 与 `tag` / `branch` / `commit` 锁定来源。

## iOS / Android 通用构建字段

根级共享字段可以在 `android`、`ios` 子对象中单独覆盖：

| 字段 | 作用与默认 / 版本边界 |
| --- | --- |
| `buildReactNativeFromSource?` | 从源码构建 React Native；会显著增加构建时间。默认 `false`。 |
| `reactNativeReleaseLevel?` | `'stable' \| 'canary' \| 'experimental'`，控制 React Native 内部发布级别；默认 `'stable'`。 |
| `useHermesV1?` | 使用 Hermes V1。SDK v56 默认 `false`；SDK 57 Latest 默认 `true`，作为版本迁移时的重点差异。 |

调用插件实现时的 API 有 `BuildProperties.withBuildProperties(config, props)`（给 Expo config 加入插件配置）以及 `BuildProperties.resolveConfigValue(config, platform, key)`（读取某个共享项并让 platform 专用值优先）。正常 app config 多用插件，不需要直接调用这两个 helper。

## 类型速查

- `PluginConfigType`：根插件类型，含可选 `android` 与 `ios` 两部分，继承 `SharedBuildConfigFields`。
- `PluginConfigTypeAndroid` / `PluginConfigTypeIos`：各平台原生构建属性。
- `PluginConfigTypeAndroidPackagingOptions`：`doNotStrip?`、`exclude?`、`merge?`、`pickFirst?` 四个字符串 pattern 数组，用于处理 APK 中原生库冲突 / 符号。
- `PluginConfigTypeAndroidQueries`：`package?`、`provider?`、`intent?`；intent data 类型为 `PluginConfigTypeAndroidQueriesData`（`host?`、`mimeType?`、`scheme?`），intent 类型 `PluginConfigTypeAndroidQueriesIntent` 有 `action?`、`category?`、`data?`。
- `AndroidMavenRepository`：`url`、`authentication?`、`credentials?`；认证值 `'basic' | 'digest' | 'header'`。凭据联合类型 `AndroidMavenRepositoryCredentials` 包含用户名密码型（`username` / `password`）、Header 型（`name` / `value`）、AWS 型（`accessKey` / `secretKey` / `sessionToken?`）。
- `ExtraIosPodDependency`：依赖名 `name` 及 `version?`、`git?`、`branch?`、`tag?`、`commit?`、`path?`、`podspec?`、`source?`、`configurations?`、`modular_headers?`、`testspecs?`。
- `SharedBuildConfigFields`：`buildReactNativeFromSource?`、`reactNativeReleaseLevel?`、`useHermesV1?`；共享字段可被平台字段覆盖。

## 给 React Web 开发者的新手词汇

- **Config Plugin：**读取 app config，并在 `npx expo prebuild` 阶段修改原生 Xcode / Gradle 工程的代码插件。它不是运行时 UI 包。
- **Prebuild / CNG：**Expo 通过配置重新生成 `ios/` 和 `android/` 原生项目的流程；BuildProperties 只参与这个阶段。
- **Maven / CocoaPods：**Android 与 Apple 平台常用的原生依赖仓库 / 管理工具；本插件能为它们写仓库或依赖声明。
- **Release 构建：**准备发布给用户的构建类型，常启用 R8 / 资源裁剪等压缩步骤；这些开关会改变包体与编译行为。

## 页面代码主题覆盖

本页重写官方示例主题：四种方式安装；`app.json` 与 `app.config.js` 配置；SDK 56 / Latest 两版构建版本值；`buildArchs` 示例；Android Maven URL 与认证凭据、生成 Gradle 配置示意；额外 Pod 配置与生成的 Podfile 行；SDK 57 scene support 等版本字段。所有 Android / iOS / shared build properties、repository credential 类型、manifest queries、packagingOptions、方法签名和 SDK56 / Latest 字段差异均已在 API 表中列明。

**来源：**[Expo BuildProperties · Latest](https://docs.expo.dev/versions/latest/sdk/build-properties/) · [Expo BuildProperties · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/build-properties/)

**翻页：**[上一页：Expo SDK Brownfield 原生工程集成](./144-Expo-SDK-Brownfield.md) · [目录](./README.md) · [下一页：Expo SDK Calendar](./146-Expo-SDK-Calendar.md)
