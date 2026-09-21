# 026｜用 EAS Build 创建第一个 Binary

**翻页：**[上一页：EAS Build 导言](./025-EAS-Build导言.md) · [目录](./README.md) · [下一页：配置 eas.json](./027-eas-json配置.md)

**官方页面：**[Create your first build](https://docs.expo.dev/build/setup/)

**版本说明：**EAS Build 是持续更新的云服务。本地 Expo SDK56 项目会由 Expo CLI 选择相应 native dependencies；若 package / toolchain 有自定义 pin，需在 eas.json 或 SDK reference 另行检查。

## 需要准备什么

开始 build 前需要一个 Android / iOS React Native project，以及能登录 EAS 的 Expo account。可用 Expo 模板创建项目；EAS Build 也支持其他原生 React Native 工具生成的项目：

```sh
npx create-expo-app@latest my-app
yarn create expo-app my-app
pnpm create expo-app my-app
bun create expo my-app
```

如果 app 是由社区 RN CLI 或 Ignite 一类工具生成，也可在集成 Expo package 后接入 EAS Build。

## 安装 / 登录 EAS CLI 并初始化项目

EAS CLI 可全局安装；也能用 npx eas-cli@latest 临时运行，后者要求每条文档命令都替换成这个入口：

```sh
npm install --global eas-cli
yarn global add eas-cli
pnpm add --global eas-cli
bun add --global eas-cli

eas login
eas whoami
eas build:configure
```

Expo CLI 已登录账号时可跳过 EAS login。eas build:configure 生成 EAS 构建所需的基础配置，并提醒选择 Android、iOS 或 All。

开发期间可以先安装 Expo Development Client：

```sh
npx expo install expo-dev-client
yarn expo install expo-dev-client
pnpm expo install expo-dev-client
bun expo install expo-dev-client
```

如果项目依赖环境变量、monorepo/private npm packages 或特定 Node / package-manager / CocoaPods / Xcode 版本，在开始构建前按 EAS Build 对应配置页设置。

## 构建手机安装包或商店 Binary

### Android / iOS 一次或分别构建

最简单的云端 build 命令示例：

```sh
eas build --platform android
eas build --platform ios
eas build --platform all
```

也可以给某次任务加消息，便于团队在 Dashboard 区分目的：

```sh
eas build --platform ios --message "Preview candidate"
```

### Android Emulator / iOS Simulator

若目标是 Android 设备 / emulator 或 iOS Simulator，应选能直接安装的 profile / artifact；常见 Android 使用 APK，iOS simulator 使用 simulator 专用构建。这条路径不用 app store developer membership，相关配置见各平台的 installable build 指南。

### 应用商店 build

Apple App Store / Google Play release binary 需要各平台的 app signing credentials。EAS CLI 可提示自动生成并安全保存新 keystore / provisioning profile / distribution certificate，或使用已有签名凭证。过去用 Expo classic build 的 credentials 也可以迁移复用。

商店提交会员条件和签名要求按目标平台分别准备；只有构建面向商店的 binary，才可继续进入 EAS Submit / Apple / Google 商店交付。手动签名凭证生成方式链接在 Expo 官方 build guide。

## 等待构建并下载 / 提交

EAS CLI 默认等待 build 完成；若已离开终端，可查看 build 历史及进度：

```sh
eas build:list
```

从命令行打印的 Dashboard link 查看 builder 日志、profile、app 版本与产物。当 build 成功：

- Store binary：继续使用 EAS Submit 或手动提交到商店。
- Internal / development binary：在 Dashboard build details 里点 Install，或用支持的 device install 工具安装。
- 只想调试原生编译时：EAS Build 也支持在本机运行的 local build 模式；该命令和云构建 profile 仍需看对应官方文档。

不能把商店 .aab / store .ipa 和内部可安装 APK / simulator .app 当成同一种构建目标。先确定安装方式，再选 build profile。

## 关键名词

- **EAS CLI**：本机命令行工具，负责触发 EAS services、登录、初始化项目和读取 build。
- **Signing credentials**：用于证明 publisher 身份的签名密钥和 provisioning 配置。
- **Development Build**：包含 expo-dev-client 的 app 专属调试 binary。
- **Store build**：为商店签名、分发设置和应用审核准备的 release binary。
- **APK / AAB / .app / .ipa**：不同平台 / 用途的包格式，不能互换安装。
- **Build Dashboard**：EAS 显示 build 状态、步骤日志和下载产物的网页页面。

## 官方代码主题覆盖

源页所有命令 / 配置主题均有等价改写：四种 package manager 创建 Expo app、安装 EAS CLI 与 npx 替代方式、eas login / whoami / build:configure、expo-dev-client 安装、Android / iOS / all / message build 命令、已有 credentials 和自动签名流程、eas build:list、内测产物安装与商店提交路径。没有触发 EAS build 或商店提交。

## 下一页

页脚 **Next** 指向 [Configure EAS Build with eas.json](https://docs.expo.dev/build/eas-json/)，解释 build profile、平台字段、继承、工具版本、资源等级与环境变量。

**翻页：**[上一页：EAS Build 导言](./025-EAS-Build导言.md) · [返回目录](./README.md) · [下一页：配置 eas.json](./027-eas-json配置.md)
