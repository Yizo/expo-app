# 为电视（TV）构建 Expo 应用

> 原文地址：https://docs.expo.dev/guides/building-for-tv/

本文介绍如何使用 Expo 框架开发面向 Android TV 和 Apple TV 平台的应用。Expo 通过 React Native TV 分支（`react-native-tvos`）来支持电视设备，开发者可以在同一套代码中同时支持手机和电视两种形态。

---

## 原生项目需要的改动

Expo 使用 [react-native-tvos](https://github.com/react-native-tvos/react-native-tvos) 这个 React Native 的电视分支来提供电视支持，它包含了现代架构特性。只需将标准的 `react-native` 依赖替换为 `react-native-tvos`，应用就可以同时面向手持设备和电视设备。

原生层面的改动很小，并且在 prebuild（预构建）阶段通过 [config plugin（配置插件）](https://github.com/react-native-tvos/config-tv/tree/main/packages/config-tv) 自动完成。

### Android

- **AndroidManifest.xml**：移除默认的竖屏方向设置，并添加电视相关的 Intent 过滤器，使应用能在电视启动器中被发现和启动。
- **MainApplication.kt**：移除不被电视平台支持的调试相关调用（例如 Flipper 调试工具）。

### iOS

- **Podfile 和 Xcode 项目配置**：目标平台从 iOS 切换为 tvOS。
- **SplashScreen.storyboard**：启动画面（Splash Screen）会适配 tvOS 的显示方式。

---

## 电视开发的系统要求

### Android TV

#### 前提条件

| 软件 | 要求 |
|---|---|
| **Node.js** | LTS（长期支持）版本，从 [nodejs.org](https://nodejs.org/en/) 下载 |
| **Android Studio** | Iguana 或更新版本 |
| **Android TV 系统镜像** | API 31 及以上，需匹配你的处理器架构（ARM 64 或 Intel x86_64） |
| **Android TV 模拟器** | 在 Android Studio 的 AVD Manager 中配置一个电视模拟器 |

### Apple TV

#### 前提条件

| 软件 | 要求 |
|---|---|
| **Node.js** | LTS（长期支持）版本，仅限 macOS |
| **Xcode** | 16 或更新版本 |
| **tvOS SDK** | 17 或更新版本 |

tvOS SDK 可能需要手动下载，执行以下命令下载所有平台 SDK：

```sh
xcodebuild -downloadAllPlatforms
```

> **说明**：该命令会下载 Xcode 支持的所有平台 SDK（包括 iOS、tvOS、watchOS 等），确保 tvOS SDK 可用。

---

## 快速开始

最快的方式是通过官方提供的模板项目来创建电视应用。Expo 提供了两个模板：

- **`with-tv`**：标准的电视项目模板
- **`with-router-tv`**：集成了 [Expo Router](https://docs.expo.dev/router/introduction.md)（基于文件系统的路由）的电视项目模板

### 使用标准电视模板创建项目

```sh
# npm
npx create-expo-app MyTVProject -e with-tv

# yarn
yarn create expo-app MyTVProject -e with-tv

# pnpm
pnpm create expo-app MyTVProject -e with-tv

# bun
bun create expo MyTVProject -e with-tv
```

### 使用带路由的电视模板创建项目

```sh
# npm
npx create-expo-app MyTVProject -e with-router-tv

# yarn
yarn create expo-app MyTVProject -e with-router-tv

# pnpm
pnpm create expo-app MyTVProject -e with-router-tv

# bun
bun create expo MyTVProject -e with-router-tv
```

> **说明**：`-e` 参数指定使用 [Expo 示例仓库](https://github.com/expo/examples) 中的模板。`with-router-tv` 模板适合需要文件系统路由的项目。

---

## 查看哪些库受支持

大量 Expo 内置模块可以在电视平台上正常工作，以下是受支持的模块列表：

| 模块 | 说明 |
|---|---|
| AppleAuthentication | Apple 身份验证 |
| Application | 应用管理 |
| Audio | 音频录制 |
| Asset | 资源管理 |
| AsyncStorage | 异步键值存储 |
| AV | 音视频播放（AV SDK v54.0.0 及以上） |
| BackgroundTask | 后台任务 |
| BlurView | 模糊视图 |
| BuildProperties | 构建属性 |
| Constants | 系统常量 |
| Crypto | 加密 |
| DevClient | 开发客户端 |
| Device | 设备信息 |
| Expo UI | Expo 用户界面组件 |
| FileSystem | 文件系统操作 |
| FlashList | 高性能列表 |
| Font | 字体加载 |
| GlassEffect | 玻璃效果 |
| Image | 图片组件 |
| ImageManipulator | 图片处理 |
| KeepAwake | 保持屏幕常亮 |
| LinearGradient | 线性渐变 |
| Localization | 本地化 |
| Manifests | 应用清单 |
| MediaLibrary | 媒体库 |
| NetInfo | 网络信息 |
| Network | 网络请求 |
| Reanimated | 动画库 |
| SafeAreaContext | 安全区域 |
| SecureStore | 安全存储 |
| Skia | 2D 图形引擎 |
| SplashScreen | 启动画面 |
| SQLite | 数据库 |
| Svg | SVG 矢量图 |
| SystemUI | 系统界面 |
| TaskManager | 任务管理 |
| TrackingTransparency | 追踪透明度 |
| Updates | OTA 更新 |
| Video | 视频播放 |
| VideoThumbnails | 视频缩略图 |

第三方库方面，[React Navigation](https://reactnavigation.org/) 和 [React Native Skia](https://shopify.github.io/react-native-skia/) 也可以在电视上使用。

你可以在 [React Native Directory](https://reactnative.directory/?tvos=true) 中筛选查看支持 tvOS 的库。

### 限制

- **开发客户端（DevClient）** 需要 SDK 54 及以上版本。
- **Android TV** 支持所有客户端操作。
- **Apple TV** 仅支持基础的本地或隧道打包器操作，不支持云构建认证功能。

> **注意（Monorepo 场景）**：如果你使用 monorepo 结构，并且其中任一项目需要面向电视构建，那么所有项目都必须使用 `react-native-tvos` 包。

---

## 集成到现有 Expo 项目

如果你的项目已经存在，需要逐步添加电视支持，请按以下步骤操作。

### 修改依赖以支持电视

#### SDK 56 及更新版本

在 `package.json` 中将 `react-native` 替换为 `react-native-tvos`：

```json
{
  "dependencies": {
    "react-native": "npm:react-native-tvos@0.85-stable"
  }
}
```

> **说明**：`"npm:react-native-tvos@0.85-stable"` 表示通过 npm 的包别名机制，将 `react-native` 包实际替换为 `react-native-tvos` 的 0.85 稳定版本。SDK 56 对应 React Native 0.85。

#### SDK 55 及更早版本

除了替换依赖外，还需要将其排除在 Expo 自动版本验证之外：

```json
{
  "dependencies": {
    "react-native": "npm:react-native-tvos@0.83-stable"
  },
  "expo": {
    "install": {
      "exclude": ["react-native"]
    }
  }
}
```

> **说明**：`expo.install.exclude` 配置告诉 Expo CLI 在执行 `npx expo install expo@latest --fix` 等命令时，不要自动检查或覆盖 `react-native` 的版本。这是因为 `react-native-tvos` 的版本号与标准 `react-native` 不同，自动修复会破坏电视支持。

### 添加电视配置插件

安装 `@react-native-tvos/config-tv` 作为开发依赖：

```sh
# npm
npx expo install @react-native-tvos/config-tv -- --dev

# yarn
yarn expo install @react-native-tvos/config-tv -- --dev

# pnpm
pnpm expo install @react-native-tvos/config-tv -- --dev

# bun
bun expo install @react-native-tvos/config-tv -- --dev
```

安装后，在 `app.json`（或 `app.config.js`）的 `plugins` 数组中添加该插件：

```json
{
  "plugins": ["@react-native-tvos/config-tv"]
}
```

> **说明**：该 config plugin 会在 prebuild 阶段自动修改原生项目配置（如 AndroidManifest.xml、Podfile 等），使项目适配电视平台。它只在环境变量 `EXPO_TV=1` 时生效。

### 运行 prebuild

首先设置环境变量 `EXPO_TV=1` 来启用电视模式，然后执行预构建：

```sh
export EXPO_TV=1
npx expo prebuild --clean
```

> **说明**：
> - `EXPO_TV=1`：启用电视构建配置，config plugin 检测到该变量后会应用电视相关的原生改动。
> - `--clean`：清除已有的原生目录后重新生成，确保之前的手机配置不会残留。

如果需要调试 prebuild 过程中的问题，可以在执行前开启 debug 日志（参考 [debug-js](https://github.com/debug-js/debug#conventions) 的规范）：

```sh
export DEBUG=expo:*
export DEBUG=expo:react-native-tvos:config-tv
```

### 在 Android TV 模拟器上运行

```sh
# npm
npx expo run:android

# yarn
yarn expo run:android

# pnpm
pnpm expo run:android

# bun
bun expo run:android
```

### 在 Apple TV 模拟器上运行

```sh
# npm
npx expo run:ios

# yarn
yarn expo run:ios

# pnpm
pnpm expo run:ios

# bun
bun expo run:ios
```

### 撤销电视改动，恢复为手机构建

如果需要切回手机开发，只需取消 `EXPO_TV` 环境变量并重新执行干净的预构建：

```sh
unset EXPO_TV
npx expo prebuild --clean
```

> **说明**：`unset EXPO_TV` 移除环境变量后，config plugin 将不再应用电视相关的改动，`prebuild --clean` 会重新生成面向手机的原生项目。

---

## 为电视和手机分别创建 EAS Build 配置

通过 EAS Build 的配置文件 `eas.json`，可以在同一项目中为电视和手机分别定义构建 profile。核心思路是创建继承自现有 profile 的电视变体，并注入 `EXPO_TV` 环境变量。

以下是一个完整的 `eas.json` 示例：

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "base": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk",
        "withoutCredentials": true
      },
      "channel": "base"
    },
    "development": {
      "extends": "base",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      },
      "channel": "development"
    },
    "development_tv": {
      "extends": "development",
      "env": {
        "EXPO_TV": "1"
      },
      "channel": "development"
    },
    "preview": {
      "extends": "base",
      "channel": "preview"
    },
    "preview_tv": {
      "extends": "preview",
      "env": {
        "EXPO_TV": "1"
      },
      "channel": "preview"
    }
  },
  "submit": {}
}
```

各 profile 的作用：

| Profile | 用途 |
|---|---|
| `base` | 基础配置，被其他 profile 继承 |
| `development` | 面向手机的开发构建（Debug 模式） |
| `development_tv` | 面向电视的开发构建，继承 `development` 并注入 `EXPO_TV=1` |
| `preview` | 面向手机的预览构建 |
| `preview_tv` | 面向电视的预览构建，继承 `preview` 并注入 `EXPO_TV=1` |

> **说明**：`extends` 字段实现 profile 之间的继承，`env` 字段注入环境变量。这样你只需维护一套基础配置，电视 profile 自动继承并覆盖需要的部分。执行 `eas build --profile development_tv` 即可构建电视版本。

---

## 示例和演示项目

以下开源仓库展示了电视开发的具体实践：

| 项目 | 说明 | 链接 |
|---|---|---|
| **IgniteTV** | 通过 CLI 生成的电视样板项目 | [GitHub](https://github.com/react-native-tvos/IgniteTV) |
| **SkiaMultiplatform** | 跨平台 Skia 图形演示 | [GitHub](https://github.com/react-native-tvos/SkiaMultiplatform) |
| **NativewindMultiplatform** | 使用 Nativewind（实用优先 CSS）的跨平台样式示例 | [GitHub](https://github.com/react-native-tvos/NativewindMultiplatform) |

---

## 文档导航

- **上一页**：[typescript](./145__typescript.md)
- **下一页**：[using nextjs](./147__using-nextjs.md)
