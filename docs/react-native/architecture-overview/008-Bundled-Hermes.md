# 008 Bundled Hermes（随 RN 配套的 Hermes）

**翻页：** [上一页：007 Threading Model](007-Threading-Model.md) · [目录](README.md) · [下一页：009 Glossary](009-术语表.md)

**官方页面：** [Bundled Hermes · React Native](https://reactnative.dev/architecture/bundled-hermes)  
**阅读定位：** 这是一篇偏框架贡献者和扩展开发者的构建技术说明。普通 React Native app 开发者通常不需要手动构建 Hermes。
**源页代码覆盖：** Android Gradle Hermes 依赖差异与 `fbjni` 排除、Windows New Architecture 编译工具、Hermes debug/release Gradle 任务、iOS 预编译产物/源码构建与 `CI=true pod install`。

## Bundled Hermes 是什么

**Hermes** 是 React Native 常用的 JavaScript 引擎。过去 React Native 与 Hermes 有各自独立的版本号和发布节奏，开发者需要查表确认两者是否兼容。**Bundled Hermes** 是从 React Native 0.69 起采用的发布方式：每个 RN 版本会和经过配套构建、测试的 Hermes 一起发布。

两者共享 **JSI** 相关接口代码。如果 Hermes 与 RN 包含的 JSI 定义不一致，可能出现 ABI（应用二进制接口）不兼容。Bundled Hermes 让 React Native 发布过程同时构建 Hermes，减少开发者手动挑选配对版本的风险。

## 对普通 app 开发者的影响

通常无需自行下载或编译 Hermes。若使用当前 RN 模板，依赖与构建脚本已按所选 RN 版本配置；Expo 项目还应让 Expo SDK 选择匹配依赖。可以在已有项目选择其它 JavaScript engine，但要按当前 RN / Expo 文档配置 Android 的 `enableHermes` 或 iOS 的 `hermes_enabled`，不要直接抄旧版模板。

React Native 0.70 起，官方说明这些开关默认启用 Hermes。本文后面的 Gradle 差异针对 RN 0.69 发布当时的模板变更，目的是解释 Bundled Hermes 怎样工作，不代表 RN 0.87 或 Expo SDK 56 应照搬旧配置。

## Android：依赖如何变化

旧版 RN 通过 npm 包里的 debug/release AAR 文件提供 Hermes；Bundled Hermes 改用随 `react-native` 发布的 variant-aware Maven artifacts。官方页面展示的历史配置形状如下：

旧模板分别引用 Hermes 的 debug 与 release AAR（下方是改写后的结构示例）：

~~~gradle
def oldHermesDirectory = "../../node_modules/hermes-engine/android/"
debugImplementation files(oldHermesDirectory + "hermes-debug.aar")
releaseImplementation files(oldHermesDirectory + "hermes-release.aar")
~~~

Bundled Hermes 模板使用下面的 variant-aware 依赖：

~~~gradle
dependencies {
  if (enableHermes) {
    implementation("com.facebook.react:hermes-engine:+") {
      exclude group: 'com.facebook.fbjni'
    }
  } else {
    implementation jscFlavor
  }
}
~~~

这里用 Gradle variant 选择与 Debug/Release 对应的 Hermes artifact；排除 `fbjni` 是当时 Hermes 采用 Prefab、RN 采用非 Prefab 消费方式所需的兼容处理。最新版本的 Gradle Plugin 可能已经调整了写法，项目应以自己的 React Native 模板为准。

## Android：New Architecture 与 Windows 构建

Android 新架构项目可能需要从源码构建 Hermes，因此首次构建可能较慢。源页面向 RN 仓库维护者给出的任务包括：

~~~sh
# 在 React Native 源代码仓库中构建 Hermes debug 版本
./gradlew :ReactAndroid:hermes-engine:assembleDebug

# 构建 Hermes release 版本
./gradlew :ReactAndroid:hermes-engine:assembleRelease
~~~

Windows 上构建 New Architecture 还需 Android SDK / Node 环境、CMake、Visual Studio C++ Build Tools，并使用配置好 C++ 编译器环境的 Visual Studio Command Prompt 运行：

~~~sh
npx react-native run-android
~~~

这些步骤面向在 Windows 上从源码构建 RN/Hermes 的工程师；普通 app 项目安装 React Native 包时不需要执行 ReactAndroid 子模块 Gradle 任务。

## iOS：预编译产物和源码构建

RN 稳定版可使用随 React Native release 提供的 Hermes 预编译 tarball。iOS 在 `pod install` 时由 Hermes podspec 下载并配置产物。若在 `main` 分支构建、缺少预编译产物，或需要 Hermes dSYM 调试符号，则需从源码构建。文档展示用 `CI=true` 强制 CocoaPods 走源码构建路径：

~~~sh
CI=true pod install
~~~

预编译 Hermes 通常不包含 dSYM；从源码构建会在构建目录生成符号文件。`dSYM` 是供 Xcode 符号化崩溃堆栈的调试信息。RN iOS 模块通常使用 CocoaPods 管理，修改依赖后需重新安装 Pods。

## 关键名词

- **Hermes**：为 React Native app 执行 JavaScript 的引擎。
- **Bundled Hermes**：将 Hermes 与 RN 版本同步构建、发布的分发方式。
- **JSI**：JavaScript Interface，连接 JavaScript 与 C++ / 原生对象的接口。
- **ABI**：Application Binary Interface，约定编译后二进制组件如何互相调用。
- **AAR**：Android Archive，Android 平台打包原生库和资源的文件格式。
- **Maven artifact**：按 group/artifact/version 方式分发的 Android 构建依赖。
- **dSYM**：iOS 调试符号文件，用于把崩溃地址还原为函数和行号。
- **源码构建**：从源码编译依赖，而不是直接下载预先编译好的二进制产物。

## 官方代码主题覆盖

源页的 Android Gradle 新旧依赖思路、`fbjni` 排除、Windows 环境工具列表和启动命令、Hermes Gradle 构建任务、iOS podspec/预编译流程、源码构建触发条件与 dSYM 已分别说明并提供重写示例。配置例子标注为 RN 0.69 时期的历史模板，避免与当前 app 依赖混用。

**翻页：** [上一页：007 Threading Model](007-Threading-Model.md) · [目录](README.md) · [下一页：009 Glossary](009-术语表.md)
