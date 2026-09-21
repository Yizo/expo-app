# 025｜EAS Build 导言

**翻页：**[上一页：在 EAS Workflows 中运行 E2E 测试](./024-运行E2E测试.md) · [目录](./README.md) · [下一页：用 EAS Build 创建第一个 Build](./026-EAS-Build创建首个Build.md)

**官方页面：**[EAS Build](https://docs.expo.dev/build/introduction/)

**版本说明：**EAS Build 是云端原生构建服务，不等同于 Expo SDK 的一个版本。服务行为、CLI 和套餐可能更新；本地项目 Expo 为 SDK56，原生依赖与 app config 仍应按 SDK56 精确文档校对。

## EAS Build 是什么

EAS Build 会把 Expo 或 React Native project 编译为 Android / iOS app binary。它管理云构建环境、签名凭证、内部测试分发，并可和 EAS Submit、EAS Update、EAS Workflows 集成。也支持未使用 Expo / React Native 的原生项目，但最常见路径是 Expo app。

用 EAS Build 可以避免每位团队成员在本机配置 Android SDK / Xcode；也可以选择让服务保管或使用自己提供的 app signing credentials。

## 最短路径与项目准备

EAS CLI quick start 会同时构建 Android 与 iOS：

```sh
eas build --platform all
```

新项目可先创建 Expo app。既有 RN app 也可使用其他 bootstrapper 创建；这说明 EAS Build 不要求项目一定来自 Expo template：

```sh
npx create-expo-app@latest my-app
yarn create expo-app my-app
pnpm create expo-app my-app
bun create expo my-app

npx create-react-native-app my-app
npx react-native init my-app
```

项目需要 Expo account 与 EAS CLI。EAS CLI 可全局安装；若不想全局安装，也可以始终使用 npx eas-cli@latest 运行命令：

```sh
npm install --global eas-cli
yarn global add eas-cli
pnpm add --global eas-cli
bun add --global eas-cli

eas login
eas whoami
```

Android / iOS 原生项目准备 EAS build 配置：

```sh
eas build:configure
```

开发期间可安装 development client：

```sh
npx expo install expo-dev-client
yarn expo install expo-dev-client
pnpm expo install expo-dev-client
bun expo install expo-dev-client
```

## Store release 与签名

提交到 Google Play / Apple App Store 前，需要各 store 的 developer account 和签名凭证。EAS CLI 可以生成 / 管理 Android keystore、iOS distribution certificate 与 provisioning profile，也能导入已有凭证。

单平台构建：

```sh
eas build --platform android
eas build --platform ios
```

提交 build job 时可附 message，或者一次构建全平台：

```sh
eas build --platform ios --message "Production candidate"
eas build --platform all
```

为设备 / emulator 提供的安装 build 要选适合安装的 Android APK 或 iOS simulator binary；Store binary 则按商店签名规则打包。不能把专为商店生成的产物当成可直接安装到任意 Android device / iOS Simulator 的包。

EAS 可以自动生成并安全保管新 Android keystore，或让用户上传自己的凭证；iOS 需要 Apple signing certificates 与 provisioning profiles。Google Play 和 Apple 对正式分发分别要求其 developer membership；具体资质与商店流程请查看链接中的当前官方要求。

## 构建状态与交付

EAS build 默认会在 CLI 等待到完成；也可打断等待，然后用 dashboard link 或 CLI 查看历史和日志：

```sh
eas build:list
```

若 production build 成功，可交给 EAS Submit 上传 app store；如果为 internal / development build，则从 dashboard 安装链接分发。Workflow build job 可复用同一个 EAS Build 服务。

## 与 EAS Workflows / CI 集成

Workflow 中的 build job 示例：

```yaml
jobs:
  build_ios:
    type: build
    params:
      platform: ios
```

可以根据 GitHub branch 动态选择 profile：

```yaml
jobs:
  build_for_branch:
    type: build
    params:
      platform: all
      profile: ${{ github.ref_name == 'main' && 'production' || 'preview' }}
```

EAS Build 也能从 CI pipeline 触发，不局限于 EAS Workflows。Android 构建由 Expo 云端 Linux runner 执行；iOS build 由 Expo 托管的 macOS runner 执行。

## 关键名词

- **Binary / standalone app**：完成编译、安装到设备或上架的原生二进制产物。
- **Build profile**：eas.json 内一组命名构建设置，可在 development / preview / production 之间切换。
- **Signing credentials**：证明 app / team 发布身份的密钥、证书与 provisioning profile。
- **Internal distribution**：可通过 URL 分享安装包给团队或测试者，不用先公开发布到商店。
- **Expo Update**：不改原生代码时向兼容 runtime 的已安装 app 推送 JS / assets 更新。
- **EAS CLI**：本机命令行工具，负责初始化 EAS project、触发 build、查看日志和凭证。

## 官方代码主题覆盖

源页所有 code themes 都由改写示例覆盖：create Expo app 的 npm / Yarn / pnpm / Bun 命令；EAS CLI 安装、npx 运行替代、登录与 whoami；eas build:configure；expo-dev-client 安装；Android / iOS / all 构建和 build message；凭证与设备安装差异；eas build:list；EAS Workflows build job 与 Git branch 动态 profile。未触发云端构建、没有提交任何商店。

## 下一页

页脚 **Next** 指向 [Create your first build](https://docs.expo.dev/build/setup/)，从 Expo project 开始逐步登录、配置并生成第一个 binary。

**翻页：**[上一页：在 EAS Workflows 中运行 E2E 测试](./024-运行E2E测试.md) · [返回目录](./README.md) · [下一页：用 EAS Build 创建第一个 Build](./026-EAS-Build创建首个Build.md)
