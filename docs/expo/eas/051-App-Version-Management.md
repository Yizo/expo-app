# 051｜EAS App Version Management

**翻页：**[上一页：用 EAS Build 构建 iOS Simulator App](./050-iOS-Simulators.md) · [目录](./README.md) · [下一页：排查 Build 错误与崩溃](./052-Build-Troubleshooting.md)

**官方页面：**[App version management](https://docs.expo.dev/build-reference/app-versions/)

**版本边界：**本页介绍 EAS CLI 的 app version source / autoIncrement 服务功能。remote version source 从 EAS CLI 12.0.0 起为官方推荐。项目 Expo ~56.0.11 需检查其 EAS CLI 与 SDK56 app config；本文只记录配置和命令，没有改写项目版本号。

## 面向用户的 App Version 与 Build Version

Android 与 iOS 都有两种版本标识：

| 用途 | app config 字段 | 原生平台字段 | 典型变化 |
| --- | --- | --- | --- |
| 用户 / 商店看到的版本 | version | Android versionName；iOS CFBundleShortVersionString | 你准备发新产品版本时手动更新。 |
| 开发者看到的构建序号 | Android versionCode；iOS buildNumber | Android versionCode；iOS CFBundleVersion | 每份商店上传包需要唯一，常设自动递增。 |

在 App 内展示版本时，Expo 建议用 expo-application 读取 native application version 与 native build version，而不是假设 app config 与原生值永远同步。

## 官方推荐的版本循环

Production release 时，开发者明确更新用户看到的 version。应用发布后，新开发周期开始；而 Android versionCode / iOS buildNumber 可在每次 build 自动递增，避免提交重复 build number 被商店拒绝。

EAS 有两种 source：

- **remote：**EAS 服务器维护 Android versionCode / iOS buildNumber，推荐。
- **local：**版本源保留在项目代码中，手工维护或由 EAS 在本地源码递增。

用户可见的 version 与 developer-facing build number 是两类不同值；autoIncrement 只对构建序号起作用，不会替你决定 App 产品版本。

## Remote Version Source

在 eas.json 里将 cli.appVersionSource 设置为 remote，在 production profile 设 autoIncrement：

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "development": {},
    "preview": {},
    "production": {
      "autoIncrement": true
    }
  }
}
```

第一次启用 remote 时，EAS 用项目 app config 已有版本初始化远端值；如果本地没填，首次建立值为 1。之后 build 读取 remote source，并在自动递增时把新版本写入本次原生构建。app config 中 Android versionCode / iOS buildNumber 会被忽略，也不会被更新；一旦 remote 已成为 source of truth，可移除本地这两个字段。

### 把已有版本同步到 Remote

若已上架 App 或本地已有明确 build number，先把平台现有版本同步到 EAS：

```sh
eas build:version:set
```

交互式命令会让你选 Android / iOS，确认切换 appVersionSource 为 remote，再输入商店中最近使用的版本号。设置好后 production profile 的 autoIncrement 才能从正确序号递增。

### 把 Remote 版本拉回本地

如果要在 Android Studio / Xcode 本地原生构建，并希望沿用 EAS 远端 build number，可同步到项目的 app config：

```sh
eas build:version:sync
```

限制：

- Android 多 flavor 的既有 React Native 项目不支持该 version:sync 命令；其他 remote versioning 功能仍可使用。
- autoIncrement 不递增用户可见的 version 字段。
- EAS Update 使用 runtimeVersion policy = nativeVersion 时不支持 remote auto-increment；如需类似行为，使用 appVersion policy。

## Local Version Source

若希望项目源码一直作为版本源，可明确写 appVersionSource: local：

```json
{
  "cli": {
    "appVersionSource": "local"
  },
  "build": {
    "development": {},
    "preview": {},
    "production": {
      "autoIncrement": true
    }
  }
}
```

EAS 读取并构建当前 local 值。启用 autoIncrement 时，它会更改本地 app config；需要把变更提交，才能让下次 build 延续这个序号。CI 上若多个 build 并行，很容易出现版本修改、重试与提交之间的协调问题。

已生成原生目录的既有 React Native 工程里，native project 配置里的版本可能覆盖 app config 值。expo-constants 和 expo-updates 读取 app config；如果更新兼容性依赖 runtimeVersion policy: nativeVersion，应保持 app config 和 iOS / Android 原生版本完全一致。官方推荐用 expo-application 读取实际安装应用里的原生版本值。

Local source 的限制：

- 想要改动后的 autoIncrement 值持久化，每次 build 后都需要 commit 项目配置；在 CI 上不一定方便。
- 多 Gradle flavor 的已有 React Native 工程中，EAS CLI 无法读取 / 修改版本，因此不支持 autoIncrement，build detail 页面也不显示版本。

## 关键名词

- **User-facing version：**商店展示的 App 版本，例如 1.2.0。
- **Build version：**平台用来识别某个上传包的序号；Android 对应 versionCode，iOS 对应 buildNumber。
- **Version source：**构建时由 EAS remote 还是项目 local 文件决定 build number。
- **autoIncrement：**自动提高 build number，减少重复上传的商店拒绝。
- **Runtime version policy：**EAS Update 依据的 native runtime 兼容策略；nativeVersion 依赖原生版本号变化。
- **Multiple flavors：**Android 同一 app project 的多个变体 / application ID，现有 RN 项目里的 Gradle flavor 可能无法由 EAS 版本读取逻辑处理。

## 官方代码主题覆盖

源页 code / command themes 均覆盖：eas.json 的 remote/local appVersionSource；production autoIncrement；remote version set 与 version:sync CLI；字段 version / android.versionCode / ios.buildNumber 的区别；nativeVersion policy 的限制和 appVersion 的替代方向。expo-application 的读取建议按当前 SDK 包文档复核，本页没有新增 API code。

## 下一页

官方页脚 **Next** 是 [Troubleshoot build errors and crashes](https://docs.expo.dev/build-reference/troubleshooting/)，介绍从 EAS 日志定位构建失败、运行崩溃和 bundle 问题。

**翻页：**[上一页：用 EAS Build 构建 iOS Simulator App](./050-iOS-Simulators.md) · [返回目录](./README.md) · [下一页：排查 Build 错误与崩溃](./052-Build-Troubleshooting.md)
