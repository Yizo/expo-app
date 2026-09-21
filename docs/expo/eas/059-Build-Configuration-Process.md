# 059｜Build Configuration Process：初始化 EAS Build

**翻页：**[上一页：EAS Build 的 iOS 构建流程](./058-iOS-Build-Process.md) · [目录](./README.md) · [下一页：Build Server Infrastructure](./060-Build-Server-Infrastructure.md)

**官方页面：**[Build configuration process](https://docs.expo.dev/build-reference/build-configuration/)

**版本边界：**本页讲 EAS CLI 初始化 project / eas.json 的过程。Expo SDK 56 项目 app identifiers 仍按 SDK v56 app config 规则填写；CLI 实际提示与默认值可能随 CLI 版本演进。本文只展示生成的配置与流程，没有运行 CLI 或执行 Git commit。

## 配置命令

从项目根目录运行 eas build:configure。若首次直接执行 eas build 且项目还未初始化，也会触发相同的配置流程。

首次运行时选择要配置的平台，可以只选 Android 或 iOS，以后再补另一个平台。CLI 会关联 / 创建 EAS project，并在项目根生成 eas.json。

## 默认 Build Profiles

首次配置通常生成 development、preview、production 三个 profile：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

Profile 名称只是配置 key。Development profile 默认加入 development client 并用于内部分发，preview 也配置 internal distribution，production 留给商店构建。团队可按项目增减 profile。

## Expo Project 与 Existing React Native Project

对 Expo app，首次 Build 若 app config 尚未填写平台 identifier，EAS CLI 会询问：

- android.package：Android application ID，用于识别 Google Play 中的 App。
- ios.bundleIdentifier：Apple App Store / Developer 项目中的唯一 Bundle ID。

这两个值要匹配 Apple / Google 后台注册的 App ID。已有 React Native native project 的 CLI 流程没有额外配置步骤。

## cli.requireCommit

如果 eas.json 启用 cli.requireCommit，初始化产生的变更需要进入 Git commit 后才能构建。CLI 会提示 review 它生成的更改，可自选 commit message，也可使用默认文本；如果不打算提交，可在提示中中止。本文没有运行此工作流。

## 关键名词

- **EAS Project：**与 Expo 账号关联的云端构建 / update 项目。
- **eas.json：**EAS Build 与 Submit 使用的 profile / CLI 配置文件。
- **App Identifier：**Android package 与 iOS bundle ID，用于唯一识别应用。
- **Build profile：**把构建类型、分发方式、版本和环境配置组合到一起的命名项。
- **cli.requireCommit：**要求本地 Git 工作区先达到提交状态才能启动 EAS build 的设置。

## 官方代码主题覆盖

源页全部 code / process themes 均覆盖：eas build:configure 与 eas build 自动初始化；平台选择；development / preview / production 默认 eas.json；Expo app 补 android.package / ios.bundleIdentifier；existing React Native project 无额外初始化；cli.requireCommit 确认更改并选 commit message 的提示。

## 下一页

官方页脚 **Next** 是 [Build server infrastructure](https://docs.expo.dev/build-reference/infrastructure/)，查看托管 runner、build image、资源规格和平台工具版本。

**翻页：**[上一页：EAS Build 的 iOS 构建流程](./058-iOS-Build-Process.md) · [返回目录](./README.md) · [下一页：Build Server Infrastructure](./060-Build-Server-Infrastructure.md)
