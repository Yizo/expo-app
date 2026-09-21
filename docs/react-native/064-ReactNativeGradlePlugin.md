# 064 React Native Gradle Plugin

**翻页：** [上一页：063 Communication between native and React Native](063-CommunicationBetweenNativeAndReactNative.md) · [目录](README.md) · [下一页：065 Linking Libraries](065-LinkingLibraries.md)

**官方页面：** [React Native Gradle Plugin · React Native](https://reactnative.dev/docs/react-native-gradle-plugin)  
**平台范围：** Android only。  
**源页代码覆盖：** Gradle `react` block 的所有主要配置项、debuggable build variants、Hermes flags、bundle compression、flavor 示例及 RNGP 自动生成任务职责。

## RNGP 是什么

**React Native Gradle Plugin（RNGP）** 是 RN 独立 npm package 的 Android Gradle 插件。新建 RN 工程已默认安装与配置，不需要重复添加；把 RN 集成到既有 Android 工程时，应按集成指南配置插件。

插件负责在 Gradle 中协调 JS bundling、Hermes bytecode、Codegen、`react-android`/Hermes 依赖、NDK 和 Metro 开发服务器端口等。默认值适用于一般工程；只在 monorepo、特殊入口、产品 flavor 或 bundle 定制时改配置。

## `android/app/build.gradle` 的 `react` 配置块

```gradle
apply plugin: "com.facebook.react"

react {
  // 仅列出需要覆盖默认值的配置。
}
```

页面列出以下可配置项：

| 配置项 | 用途 | 示例形状 |
|---|---|---|
| `root` | RN 项目根目录，即 package.json 所在位置；默认相对 App 模块为 `..` | `root = file("../")` |
| `reactNativeDir` | react-native npm package 目录；monorepo/其他包管理器可能需指定 | `file("../node_modules/react-native")` |
| `codegenDir` | Codegen package 目录 | `file("../node_modules/@react-native/codegen")` |
| `cliFile` | CLI 入口，插件调用它执行 bundling/build tasks | `file("../node_modules/react-native/cli.js")` |
| `debuggableVariants` | 不生成内嵌 JS bundle、需连接 Metro 的变体；默认只有 `debug` | `['fullDebug', 'fullStaging']` |
| `nodeExecutableAndArgs` | 构建脚本调用的 Node 命令及参数 | `['node', '--max-old-space-size=4096']` |
| `bundleCommand` | Metro bundle 子命令名；默认 `bundle` | `'ram-bundle'`（仅 legacy/非 Hermes 场景） |
| `bundleConfig` | 传给 bundle 的配置文件路径 | `file('../rn-cli.config.js')` |
| `bundleAssetName` | 生成 JS bundle 文件名；默认 `index.android.bundle` | `'MyApp.android.bundle'` |
| `entryFile` | bundle 入口；默认查找 `index.android.js`/`index.js` | `file('../js/index.android.js')` |
| `extraPackagerArgs` | 传给 bundler 的额外命令行参数 | `['--reset-cache']` |
| `hermesCommand` | Hermes 编译器路径；一般用 RN bundle 的对应版本 | 仅自定义 toolchain 时设置 |
| `hermesFlags` | 传给 `hermesc` 的编译参数；默认优化并生成 source map | `['-O', '-output-source-map']` |
| `enableBundleCompression` | 是否压缩 bundle APK asset；默认关闭 | `true` 可能节省磁盘空间，影响直接映射加载 |

根路径/CLI 路径错了会导致 CLI 与 Codegen 找不到；debuggableVariants 设错则会导致包里缺少 JS bundle。无需特殊场景时保留默认值。

## Build Type、Flavors 和 debug bundles

Android build type（如 debug/release）和 flavor（如 full/lite）组合成变体：`fullDebug`、`fullStaging`、`fullRelease` 等。RNGP 默认只把 `debug` 当作 debuggable。若自定义 staging 也打算用 Metro 开发，应添加到 `debuggableVariants`。

```gradle
react {
  debuggableVariants = ['fullDebug', 'fullStaging']
}
```

被标成 debuggable 的变体**不会打包 JavaScript bundle**，必须有 Metro 提供 JS。因此不要把需要上架的 Release 变体标为 debuggable，否则 Play Store 包可能没有 JS。

## 插件构建职责

对每个非 debuggable 变体，RNGP 建立 `createBundle<Variant>JsAndAssets` task，执行 Metro bundle、Hermes 和 source map 工具；设置匹配 RN 版本的 Android/Hermes Maven 依赖和仓库；配置 NDK 以构建 New Architecture；生成可查询 Hermes/New Architecture 的 `BuildConfig` 字段；把 Metro 端口作为 Android resource 写进 App；若 App/依赖声明 Codegen spec，则执行 Codegen。

## 默认参数和源码映射

Hermes 编译器路径会随 RN 版本捆绑，通常不必定制。默认 Hermes flags 包含 `-O` 与 `-output-source-map`，便于 release stack trace 符号化。Bundle compression 默认关闭：关闭时 Android 可直接将 bundle 以内存映射方式读入，压缩会增加运行时解压工作；除非磁盘空间是明确问题，官方建议先保留默认值。

**翻页：** [上一页：063 Communication between native and React Native](063-CommunicationBetweenNativeAndReactNative.md) · [目录](README.md) · [下一页：065 Linking Libraries](065-LinkingLibraries.md)
