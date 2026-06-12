# Expo BuildProperties 学习指南

> 原文档更新时间：2026 年 4 月 2 日  
> 适用平台：Android、iOS、tvOS  
> 包名：`expo-build-properties`

## 文档解决的问题

`expo-build-properties` 是一个 Expo Config Plugin，用来在执行 **Prebuild** 时定制 Android 和 iOS 原生工程的构建属性。

它主要解决以下问题：

- 修改 Android SDK、Build Tools、Kotlin 等构建版本。
- 调整 Android APK 的压缩、混淆、资源裁剪和打包方式。
- 添加 Android Maven 仓库、认证信息和 Proguard 规则。
- 配置 Android 应用可查询的其他应用。
- 修改 iOS CocoaPods 的链接方式和额外依赖。
- 控制 React Native、Hermes 和 Expo Modules 使用源码还是预编译产物。
- 将这些原生配置声明在 Expo 配置文件中，由 Prebuild 自动写入原生工程。

对于 React Web 开发者，可以将它理解为：

> 一个运行在“生成原生工程”阶段的配置工具。它不是浏览器运行时配置，也不是普通 JavaScript API，而更接近通过配置自动生成 Webpack、Gradle、Podfile 等底层构建文件。

## 版本状态

原文档明确说明：该页面描述的是“下一个 Expo SDK 版本”，不是当前稳定版文档。

原文档同时指出，当时最新稳定版本是 **SDK 56**。实际项目应根据自己使用的 Expo SDK 版本查看对应文档，不应直接假设本页所有配置在旧版本中都可用。

特别需要注意：

- `ios.deploymentTarget` 在此插件中已经被标记为废弃。
- 从 SDK 56 开始，应优先使用 Expo 内置的 `ios.deploymentTarget` 配置。
- Hermes V1、预编译 React Native Core 等配置与具体 React Native 版本有关。

## 阅读前需要理解的背景

### Expo Config Plugin

Expo 项目通常通过 `app.json`、`app.config.js` 或 `app.config.ts` 声明应用配置。

Config Plugin 会在 Prebuild 阶段读取这些配置，然后修改生成的 Android、iOS 原生工程。`expo-build-properties` 就属于这类插件。

它不是 React 组件，也不会参与页面渲染。

### Prebuild

运行：

```sh
npx expo prebuild
```

Expo 会根据应用配置生成或更新：

```text
android/
ios/
```

这些目录包含真正交给 Android Gradle 和 Xcode 构建的原生工程。

`expo-build-properties` 主要影响：

```text
android/gradle.properties
android/build.gradle
android/app/proguard-rules.pro
ios/Podfile
ios/Podfile.properties.json
```

不同配置项实际修改的文件并不完全相同。

### Gradle、Maven 和 CocoaPods

- **Gradle**：Android 的构建系统，作用近似于 Web 项目的构建工具加包管理流程。
- **Maven 仓库**：Android/JVM 依赖的下载来源，类似 npm registry。
- **CocoaPods**：iOS 原生依赖管理工具，`Podfile` 的地位近似于原生依赖声明文件。
- **Pod**：由 CocoaPods 管理的一项 iOS 原生依赖。
- **ABI**：Android 原生二进制支持的 CPU 架构，例如 `arm64-v8a`。
- **Deployment Target**：应用允许安装的最低 iOS 版本。
- **Compile SDK**：Android 编译时使用的 API 版本。
- **Target SDK**：应用声明自己针对哪个 Android API 版本适配。
- **Min SDK**：应用支持的最低 Android API 版本。

## 适用场景和前提限制

### 适合使用的场景

该插件适用于：

- 使用 Expo Prebuild 生成原生工程的项目。
- 使用 Expo Continuous Native Generation 工作流的项目。
- 需要通过 Expo 配置统一管理原生构建参数的项目。
- 已有 React Native 应用，但已经安装 Expo Modules，并且会执行 Prebuild 的项目。

### 不能使用的场景

原文档明确说明：

> 该插件依赖 `npx expo prebuild`，不能用于不运行 Prebuild 的 bare 项目。

这里的 bare 项目指直接维护 Android 和 iOS 原生工程、不会通过 Expo Prebuild 重新生成它们的项目。

容易产生的误解是：已有 `android/` 和 `ios/` 目录并不自动意味着插件可用。关键条件是项目是否通过 Expo Prebuild 应用 Config Plugin。

## 安装

根据包管理器选择一条命令：

```sh
# npm
npx expo install expo-build-properties

# yarn
yarn expo install expo-build-properties

# pnpm
pnpm expo install expo-build-properties

# bun
bun expo install expo-build-properties
```

`expo install` 会结合当前 Expo SDK 选择兼容的依赖版本，因此不应简单地将它等同于普通的 `npm install`。

如果是在现有 React Native 应用中安装，必须先按照 Expo 文档为项目安装 `expo` 和 Expo Modules 支持。

## 基本配置

在 `app.json` 中将插件加入 `expo.plugins`：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 36,
            "targetSdkVersion": 36,
            "buildToolsVersion": "36.0.0"
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

这个配置表示：

- Android 使用 API 36 编译。
- Android 将目标 API 声明为 36。
- Android 使用 `36.0.0` Build Tools。
- iOS 最低部署目标设为 16.4。

配置不会像 React state 一样在运行时生效，而是在 Prebuild 阶段转换为原生工程配置。

## 配置结构与覆盖规则

完整配置类型是 `PluginConfigType`：

```text
PluginConfigType
├── 顶层共享配置
├── android：Android 专属配置及共享配置覆盖
└── ios：iOS 专属配置及共享配置覆盖
```

共享配置既可以写在顶层，也可以写进 `android` 或 `ios`。

当同一个共享属性同时存在于顶层和平台配置中时：

> 平台专属值优先于顶层值。

例如：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "buildReactNativeFromSource": false,
          "android": {
            "buildReactNativeFromSource": true
          }
        }
      ]
    ]
  }
}
```

最终效果是：

- Android 从源码构建 React Native。
- iOS 使用顶层的 `false`。
- 未被平台覆盖的共享值继续使用顶层设置。

## 共享构建配置

### `buildReactNativeFromSource`

类型：

```ts
boolean
```

默认值：

```text
false
```

控制是否从源码构建 React Native。

开启后会显著增加构建时间。iOS 上，该属性还会关闭预编译 React Native 依赖：

- React Native 0.80 及以上、新架构项目中，控制是否使用 `ReactNativeDependencies.xcframework`。
- 从 React Native 0.81 开始，还会控制是否使用预编译的 `React.xcframework`。

通常只有兼容性、调试或底层定制确实需要源码构建时才应开启。

### `reactNativeReleaseLevel`

类型：

```ts
"stable" | "canary" | "experimental"
```

默认值：

```text
stable
```

用于选择 React Native 的发布级别，并启用不同的内部功能标志集合：

- `stable`：稳定功能。
- `canary`：较新的预发布功能。
- `experimental`：实验功能。

原文档没有列出各级别具体启用了哪些功能标志。

### `useHermesV1`

类型：

```ts
boolean
```

默认值：

```text
true
```

控制是否启用 Hermes V1 JavaScript 引擎。原文档称其可以改善：

- 启动速度。
- 运行时性能。
- 内存占用。

Hermes V1 从 React Native 0.84 开始成为默认 JavaScript 引擎。

若设置为 `false` 以使用旧版 Hermes，还必须同时设置：

```json
{
  "buildReactNativeFromSource": true,
  "useHermesV1": false
}
```

## Android 构建配置

### SDK 与工具链版本

| 配置项 | 类型 | 作用 |
| --- | --- | --- |
| `compileSdkVersion` | `number` | 覆盖 `build.gradle` 中用于编译应用的 Android SDK 版本 |
| `targetSdkVersion` | `number` | 覆盖应用声明适配的目标 Android SDK 版本 |
| `minSdkVersion` | `number` | 覆盖应用支持的最低 Android SDK 版本 |
| `buildToolsVersion` | `string` | 覆盖 Android Build Tools 版本 |
| `kotlinVersion` | `string` | 覆盖构建应用使用的 Kotlin 版本 |

这些版本并不是越新越好。修改后，原生依赖、Gradle 插件和 Expo SDK 都必须与之兼容。

React Web 开发者尤其需要注意：`compileSdkVersion`、`targetSdkVersion` 和 `minSdkVersion` 是三个不同概念，不能互相替代。

### `buildArchs`

类型：

```ts
string[]
```

默认值：

```json
["armeabi-v7a", "arm64-v8a", "x86", "x86_64"]
```

覆盖 `gradle.properties` 中的 `reactNativeArchitectures`，决定构建哪些 Android ABI。

示例：

```json
["arm64-v8a", "x86_64"]
```

- `arm64-v8a` 常用于现代 ARM64 Android 真机。
- `x86_64` 常用于对应架构的模拟器。

减少 ABI 数量可以减少构建工作和部分产物体积，但不再支持被移除的 CPU 架构。

### `buildFromSource`

类型：

```ts
boolean
```

默认值：

```text
false
```

已废弃，应改用：

```text
buildReactNativeFromSource
```

开启后从源码构建 React Native，并显著增加构建时间。

### `enableBundleCompression`

类型：

```ts
boolean
```

默认值：

```text
false
```

启用 JavaScript Bundle 压缩：

- 优点：APK 更小。
- 代价：应用启动可能更慢。

这是安装包体积和启动性能之间的取舍。

### Release 包优化

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `enableMinifyInReleaseBuilds` | 文档未说明 | 在 Release 构建中启用 R8，混淆 Java 代码并减小应用体积 |
| `enableShrinkResourcesInReleaseBuilds` | 文档未说明 | 删除未使用的 Android 资源 |
| `enablePngCrunchInReleaseBuilds` | `true` | 使用 `crunchPngs` 优化 PNG |
| `extraProguardRules` | 文档未说明 | 向 `android/app/proguard-rules.pro` 追加自定义 Proguard 规则 |

`enableShrinkResourcesInReleaseBuilds` 应与 `enableMinifyInReleaseBuilds` 配合使用。

PNG crunch 默认开启，但原文档警告：它可能使已经压缩过的 PNG 文件反而变大。如果项目已有自己的图片优化流程，可以考虑关闭。

R8、Proguard 和资源裁剪可能删除或改写原生代码，因此需要使用 Release 构建验证依赖是否正常，不能只测试开发模式。

### `packagingOptions`

该配置处理 APK 打包时的文件冲突和原生库行为。

| 子配置 | 类型 | 作用 |
| --- | --- | --- |
| `doNotStrip` | `string[]` | 匹配的原生库保留调试符号，不进行 strip |
| `exclude` | `string[]` | 匹配文件不打入 APK |
| `merge` | `string[]` | 将所有匹配文件拼接后打包 |
| `pickFirst` | `string[]` | 同一路径出现多个文件时只选择第一个 |

这些值是文件匹配模式。错误配置可能使必要文件未被打包，或通过 `pickFirst` 掩盖依赖版本冲突。

### Maven 仓库配置

#### `extraMavenRepos`

类型：

```ts
(string | AndroidMavenRepository)[]
```

向所有 Gradle 项目添加额外 Maven 仓库。

简单形式：

```json
{
  "android": {
    "extraMavenRepos": [
      "https://foo.com/maven-releases"
    ]
  }
}
```

字符串会被视为没有认证信息的仓库 URL。

对象形式允许配置认证：

```json
{
  "android": {
    "extraMavenRepos": [
      {
        "url": "https://foo.com/maven-releases",
        "authentication": "basic",
        "credentials": {
          "username": "System.getenv('MAVEN_USERNAME')",
          "password": "System.getenv('MAVEN_PASSWORD')"
        }
      }
    ]
  }
}
```

仓库对象字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `url` | `string` | Maven 仓库地址，必填 |
| `authentication` | `"basic" \| "digest" \| "header"` | 认证方式 |
| `credentials` | 凭据联合类型 | 密码、HTTP Header 或 AWS S3 凭据 |

支持三种凭据结构。

密码凭据：

```ts
{
  username: string;
  password: string;
}
```

HTTP Header 凭据：

```ts
{
  name: string;
  value: string;
}
```

AWS S3 凭据：

```ts
{
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
}
```

每个凭据值都可以写成：

```text
System.getenv('ENV_VAR_NAME')
```

这样 Gradle 会从环境变量中读取敏感信息。

#### `exclusiveMavenMirror`

类型：

```ts
string
```

指定唯一的 Maven 镜像。

设置后：

- 其他 Maven 仓库全部被忽略。
- 所有依赖只能从该镜像下载。

这适合必须统一经过企业镜像的环境，但要求镜像完整代理项目所需的全部依赖，否则构建会因找不到依赖而失败。

### `manifestQueries`

Android 会限制应用查询设备上其他应用的能力。该配置声明当前应用准备与哪些应用、Intent 或 Content Provider 交互。

支持三种查询方式：

```ts
{
  package?: string[];
  intent?: AndroidQueryIntent[];
  provider?: string[];
}
```

#### `package`

直接列出准备访问的其他应用包名：

```json
{
  "package": ["com.example.app"]
}
```

#### `provider`

列出 Content Provider 的 authority：

```json
{
  "provider": ["com.example.provider"]
}
```

这里只能指定 `android:authorities`。

#### `intent`

按 Intent 特征查询可处理相应操作的应用：

```ts
{
  action?: string;
  category?: string | string[];
  data?: {
    host?: string;
    mimeType?: string;
    scheme?: string;
  };
}
```

- `action`：要执行的动作，例如 `SEND` 或 `VIEW`。
- `category`：进一步描述处理该 Intent 的 Activity。
- `data.scheme`：URI 协议，例如 `https`。
- `data.host`：URI 主机。
- `data.mimeType`：数据 MIME 类型。

原文档提醒，这里的 Intent 和 Provider 声明比普通 Manifest 中的对应元素有更多限制。

### 网络、主题与打包行为

#### `networkInspector`

类型：

```ts
boolean
```

默认值：

```text
true
```

控制是否启用 Network Inspector。Android 和 iOS 都有同名配置。

#### `useDayNightTheme`

类型：

```ts
boolean
```

将 Android 应用主题改为 DayNight 变体，使应用能够正确支持深色模式。

它影响原生主题，不等同于 React Web 中通过 CSS media query 切换颜色。React Native 页面本身仍需正确处理颜色和主题状态。

#### `usesCleartextTraffic`

类型：

```ts
boolean
```

声明应用是否允许明文网络流量，例如未加密的 HTTP。

平台默认行为：

- Android 8 及以下：默认 `true`。
- Android 9 及以上：默认 `false`。

即使 Web 开发环境可以访问 `http://` 地址，Android 应用也可能因系统安全策略拒绝相同请求。

#### `useLegacyPackaging`

类型：

```ts
boolean
```

默认值：

```text
false
```

要求 Android Gradle Plugin 使用旧版打包系统，将原生库压缩进 APK。

该配置主要用于处理原生库打包兼容性问题，原文档没有提供应当开启它的通用场景。

#### `usePrecompiledHeaders`

类型：

```ts
boolean
```

默认值：

```text
false
```

为 Android 原生构建启用 C/C++ 预编译头（PCH）。插件会创建带 PCH 支持的自定义 `CMakeLists.txt`，预编译常用 React Native 头文件，从而加快自动链接原生库的 C++ 编译。

也可以通过环境变量启用：

```sh
EXPO_USE_ANDROID_PRECOMPILED_HEADERS=1
```

这是实验功能，原文档明确警告它可能无法兼容所有原生库。

## iOS 构建配置

### `deploymentTarget`

类型：

```ts
string
```

用于设置应用和 CocoaPods 项目的最低 iOS 版本。

它会影响：

- CocoaPods 生成的项目。
- 应用项目中产品类型为 `com.apple.product-type.application` 的 `PBXNativeTarget`。

此插件中的属性已经废弃。从 SDK 56 开始，应使用 Expo 内置的：

```json
{
  "expo": {
    "ios": {
      "deploymentTarget": "16.4"
    }
  }
}
```

降低 Deployment Target 会扩大可安装设备范围，但所有原生依赖必须支持对应的旧 iOS 版本。

### `extraPods`

类型：

```ts
ExtraIosPodDependency[]
```

向所有 iOS targets 添加额外 CocoaPods 依赖，并生成对应的 `ios/Podfile` 条目。

示例：

```json
{
  "ios": {
    "extraPods": [
      {
        "name": "Protobuf",
        "version": "~> 3.14.0"
      }
    ]
  }
}
```

生成的 Podfile 内容相当于：

```ruby
pod 'Protobuf', '~> 3.14.0'
```

单项依赖支持：

| 字段 | 作用 |
| --- | --- |
| `name` | Pod 名称，必填 |
| `version` | CocoaPods 版本约束 |
| `git` | 从 Git 仓库获取 Pod |
| `branch` | 指定 Git 分支 |
| `commit` | 指定 Git commit |
| `tag` | 指定 Git tag |
| `path` | 使用本地文件系统中的 Pod |
| `podspec` | 使用指定的 podspec 文件 |
| `source` | 指定依赖搜索源 |
| `configurations` | 只在指定构建配置中安装，例如 `Debug`、`Release` |
| `modular_headers` | 是否使用 modular headers |
| `testspecs` | 包含指定的 Pod 测试规格 |

Git 示例：

```json
{
  "name": "AFNetworking",
  "git": "https://github.com/gowalla/AFNetworking.git",
  "tag": "0.7.0"
}
```

其效果相当于：

```ruby
pod 'AFNetworking',
  :git => 'https://github.com/gowalla/AFNetworking.git',
  :tag => '0.7.0'
```

原文档只说明这些字段会转换成 Podfile 依赖声明，没有说明冲突解决、版本选择或安装失败时的处理策略。

### `useFrameworks`

类型：

```ts
"static" | "dynamic"
```

在 Podfile 中启用 `use_frameworks!`，让 Pods 以 framework 方式集成：

- `static`：静态 framework。
- `dynamic`：动态 framework。

这不是 JavaScript 的 ESM/CJS 模块选择，而是 iOS 原生二进制的链接方式。部分 Pod 对特定链接方式有要求。

### `forceStaticLinking`

类型：

```ts
string[]
```

当 `use_frameworks!` 已启用时，强制列表中的 Pods 使用静态链接。

部分 Pod，特别是 React Native 预编译二进制，在作为动态 framework 构建时可能因 modular header 问题失败。将其加入该列表可以避免这类兼容性问题。

该配置由 `expo-modules-autolinking` 中的 `use_expo_modules` 函数处理。

### `ccacheEnabled`

类型：

```ts
boolean
```

为 iOS 构建启用 C++ 编译缓存。

它会缓存之前的编译结果，从而加快后续 C++ 编译。原文档没有说明缓存位置、CI 缓存策略或清理方式。

### `privacyManifestAggregationEnabled`

类型：

```ts
boolean
```

控制是否聚合 CocoaPods 资源包中的 `PrivacyInfo.xcprivacy` 隐私清单：

- 开启：将多个隐私清单合并成一个文件。
- 未开启：开发者需要手动完成聚合。

这是 iOS 原生隐私合规相关配置，不等同于网页中的隐私政策页面。

### `usePrecompiledModules`

类型：

```ts
boolean
```

默认值：

```text
true
```

控制是否使用预编译的 Expo Modules XCFramework，而不是从源码构建。

开启后，插件会在 `pod install` 期间设置：

```sh
EXPO_USE_PRECOMPILED_MODULES=1
```

匹配的 Expo Modules 将作为预编译 framework 链接。

通常可以缩短构建时间，但如果需要修改或调试相应模块的原生源码，就不能仅依赖预编译产物。

### `networkInspector`

类型：

```ts
boolean
```

默认值：

```text
true
```

控制 iOS 是否启用 Network Inspector。

## 编程 API

大多数应用只需在 Expo 配置文件中注册插件。原文档还公开了两个方法，主要用于插件开发或程序化组合配置。

### `BuildProperties.resolveConfigValue`

```ts
BuildProperties.resolveConfigValue(config, platform, key)
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `config` | `PluginConfigType` | 完整插件配置 |
| `platform` | `"android" \| "ios"` | 目标平台 |
| `key` | 泛型键 `K` | 要解析的共享配置键 |

作用是解析共享配置，并应用平台覆盖规则。平台值优先于顶层值。

返回值类型为：

```ts
SharedBuildConfigFields[K]
```

文档页面将 tvOS 列为支持平台，但该方法的 `platform` 参数类型只列出了 Android 和 iOS。原文档没有进一步解释这一差异。

### `BuildProperties.withBuildProperties`

```ts
BuildProperties.withBuildProperties(config, props)
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `config` | `ExpoConfig` | 应用的 Expo 配置 |
| `props` | `PluginConfigType` | Build Properties 插件配置 |

该方法把原生构建属性处理逻辑应用到 Expo 配置，并返回：

```ts
ExpoConfig
```

它主要适用于组合或编写 Config Plugin。普通项目通常直接在 `plugins` 数组中声明插件。

## 关键执行流程

配置生效流程可以概括为：

1. 安装 `expo-build-properties`。
2. 在 `app.json`、`app.config.js` 或 `app.config.ts` 中注册插件。
3. 设置共享配置以及 `android`、`ios` 平台配置。
4. 执行 Expo Prebuild。
5. 插件将配置转换为 Gradle、Manifest、Podfile 等原生工程内容。
6. Android 使用 Gradle 构建，iOS 使用 Xcode 和 CocoaPods 构建。
7. 使用对应平台的实际构建产物验证结果。

**基于文档内容推导：** 仅修改插件配置而不重新运行会应用 Config Plugin 的 Prebuild 流程，已存在的原生工程不一定会自动更新。

## React Web 开发者最容易误解的地方

### 这些不是前端运行时配置

配置项不会通过 JavaScript 在应用启动后动态切换。它们影响编译、链接、打包和系统权限声明，通常需要重新生成并构建原生应用。

### 原生依赖不等于 npm 依赖

`extraMavenRepos` 和 `extraPods` 分别服务于 Android 和 iOS 原生依赖。安装 npm 包并不代表其原生代码已经正确完成 Gradle 或 CocoaPods 集成。

### 开发模式正常不代表 Release 正常

以下配置主要影响 Release 或原生编译：

- R8 混淆。
- Proguard 规则。
- 资源裁剪。
- PNG 优化。
- framework 链接方式。
- ABI 选择。
- 预编译模块。
- 源码构建。

因此，浏览器测试、Expo Go 测试或开发构建不能完全覆盖这些风险。

### Prebuild 生成的是可编译工程

`android/` 和 `ios/` 不是类似 `dist/` 的纯静态输出目录，其中包含 Gradle、Xcode、CocoaPods 和原生源码。插件配置会直接决定这些工程如何生成。

### 系统版本配置存在兼容链

修改 SDK、Kotlin、Deployment Target 或 React Native 构建方式时，需要同时考虑：

- Expo SDK 支持范围。
- React Native 版本。
- Android Gradle Plugin 和 Gradle 版本。
- Xcode 和 CocoaPods。
- 第三方原生依赖。
- 应用商店要求。

原文档提供的是覆盖能力，并不保证任意版本组合都兼容。

## 注意事项与限制

1. 插件只在 Prebuild 工作流中生效。
2. 本页是下一个 SDK 版本的文档，配置可用性需要和项目版本核对。
3. `buildFromSource` 已废弃，应使用 `buildReactNativeFromSource`。
4. 插件中的 `ios.deploymentTarget` 已废弃，SDK 56 及以上应使用 Expo 内置配置。
5. 从源码构建 React Native 会显著增加构建时间。
6. 关闭 Hermes V1 时还必须启用 React Native 源码构建。
7. JavaScript Bundle 压缩会减小 APK，但可能减慢启动。
8. `shrinkResources` 应与 Release 代码压缩配合使用。
9. PNG crunch 可能增大已经压缩过的 PNG。
10. 独占 Maven 镜像会完全忽略其他仓库。
11. Maven 认证信息可以从环境变量读取，避免直接写入配置。
12. Android PCH 是实验功能，可能不兼容部分原生库。
13. `useFrameworks` 会改变 iOS 原生链接方式，可能导致 Pod 兼容问题。
14. Privacy Manifest 未自动聚合时，需要开发者自行聚合。
15. ABI、打包排除项和资源裁剪配置错误可能产生缺文件或设备不兼容问题。

## 实际开发建议

以下内容属于**基于经验建议**：

- 优先使用 Expo SDK 默认构建版本，仅在依赖或商店要求明确需要时覆盖。
- 不要在配置文件中写入 Maven 用户名、密码或 AWS 密钥，使用环境变量。
- 修改 ABI、R8、资源裁剪、Pod 链接方式后，至少构建一次 Android 和 iOS Release 包。
- 对 `packagingOptions.pickFirst` 保持谨慎，它可能隐藏真正的依赖冲突。
- 开启实验性的 Android PCH 前，保留一套关闭该功能的构建验证结果。
- 修改 `extraPods` 或 `extraMavenRepos` 时记录引入原因，避免配置长期积累后无人知道哪些项仍然必要。
- 使用动态 Expo 配置时，可以根据环境生成不同配置，但生产构建应保持结果可追踪和可复现。

## 文档未涉及的内容

当前文档未具体说明：

- Expo Go 是否支持这些构建配置。
- EAS Build 中每个配置项的完整执行细节。
- 修改配置后应使用哪些具体清理命令。
- 每个 Expo SDK 支持的 Android、iOS、Kotlin 和 Gradle 版本范围。
- Maven、CocoaPods 依赖冲突的系统排查流程。
- `reactNativeReleaseLevel` 各级别具体启用的功能标志。
- Ccache 的缓存目录、CI 缓存和清理策略。
- tvOS 各配置项最终写入哪些文件。
- 各项配置对应用商店审核的具体影响。

## 总结

`expo-build-properties` 的核心作用，是把 Android 和 iOS 的底层构建配置声明在 Expo 配置中，再由 Prebuild 写入原生工程。

使用时应抓住三个重点：

1. 它只作用于会运行 Expo Prebuild 的项目。
2. 它修改的是原生编译和打包行为，不是 React 运行时行为。
3. 配置能力不代表版本一定兼容；凡是修改 SDK、编译器、链接、压缩或依赖来源，都需要使用真实原生构建验证。

---

## 文档导航

- **上一页**：[brownfield](./152__brownfield.md)
- **下一页**：[calendar](./154__calendar.md)
