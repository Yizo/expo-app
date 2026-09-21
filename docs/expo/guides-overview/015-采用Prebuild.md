# 015｜让 React Native CLI 项目采用 Expo Prebuild

**翻页：**[上一页：添加自定义原生代码](./014-添加自定义原生代码.md) · [目录](./README.md) · [下一页：本地构建概览](./016-本地构建概览.md)

**官方页面：**[Adopt Prebuild](https://docs.expo.dev/guides/adopting-prebuild/)

**版本提醒：**这篇是未版本化迁移指南。它要求选与项目已装 React Native 匹配的 Expo SDK；本地项目是 SDK56，不代表所有 RN CLI 项目都能直接装 `expo ~56`。先核对 RN / Expo 配套表和已有 native customization。

## Adopt Prebuild 会做什么

**Prebuild** 从 app config、SDK 模板与插件生成 Android / iOS 原生项目。把 React Native CLI 项目迁到 Prebuild 后，团队可把原生设置存为 app config / plugin，而不是每次手工维护 AndroidManifest、Info.plist、Gradle、Podfile 或 Xcode project。

迁移工作量取决于既有 `android/` / `ios/` 修改。先梳理 app identifier、图标、启动画面、权限、原生依赖和平台自定义内容，再迁移规则。

## 安装适配的 Expo package

Expo package 提供 `npx expo prebuild` 并决定使用哪份 native template。现有 React Native 与 Expo SDK 必须配套，不能只装当前最新 Expo package：

```sh
# 新增 Expo 基础包；之后按配套版本安装 SDK 模块
npm install expo
npx expo install expo-dev-client
```

Yarn / pnpm / Bun 项目分别会使用 `yarn add expo`、`pnpm add expo`、`bun add expo`。确定 Expo 版本前先根据 React Native 版本选择 SDK，再由 `npx expo install` 添加 Expo SDK libraries。

## 更新 JavaScript entry file

React Native CLI 默认通常通过 `AppRegistry.registerComponent` 注册 root app。Adopt Prebuild 的 Expo 入口改为 `registerRootComponent`：

```ts
// index.js
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

Expo 注册入口会处理 Expo runtime 所需初始化，让同一 app entry 适配本地 `expo start` 与原生构建环境。

## Prebuild 再生成原生目录

准备 app config 与 entry file 后，运行 clean Prebuild 让模板 / 配置重新生成 native projects：

```sh
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

Yarn / pnpm / Bun 可用 `yarn expo prebuild --clean` 等效命令。`--clean` 会删除并重新生成 `android/` / `ios/`，仅在迁移自定义都已经表达或备份后运行；本文不执行这些命令。

## 迁移之前 native customization

对照生成结果和旧原生项目：

- app 名、bundle / application ID、图标、启动画面、权限等尽量填到 `expo` app config。
- app config 不能表达、但要在每次 Prebuild 重现的 plist / Manifest / Gradle / Xcode 修改，迁为 Config Plugin。
- 生命周期 callback 适合 Expo Modules lifecycle subscriber；不要把订阅逻辑散落到被重建的原生入口文件。
- 安装需要原生项目变更的库或 Config Plugin 后，重新 Prebuild / rebuild。

如果原生目录还要手工长期维护，也可只采用 Expo SDK / CLI 的其它能力而不运行 Prebuild。项目在 `package.json` 的 `scripts` 可切换成 Expo run commands，以便更早报告 bundler 问题和使用 Expo 的设备 / signing 流程。

## 检查 ignore 与 app config

项目常将 `.expo` 和 CNG 生成的 `android/` / `ios/` 目录加入忽略文件，以免与每次 Prebuild 的输出冲突。app config 中 Expo 字段应在顶层 `expo` 对象里，否则 Prebuild 不会应用。

## 关键名词

- **React Native CLI 项目**：用 RN Community CLI 初始化、由团队直接维护原生工程的项目。
- **Entry file**：JavaScript runtime 开始执行并注册根 React app 的文件。
- **CNG**：从模板 / app config 连续重新生成原生项目的工作流。
- **Native customization**：当前原生目录中已有的自定义代码、Manifest / plist / build settings。
- **Expo config plugin**：把原生工程改动描述成可重复运行的 JavaScript 配置插件。

## 官方代码主题覆盖

源页代码 / 命令都有改写示例：安装 `expo` 的 npm / Yarn / pnpm / Bun 命令类别、入口注册替换、Clean Prebuild、Android/iOS 本机构建；并解释 `.gitignore` / `.easignore`、app config 规范、native customization 迁移与 Expo run scripts。

## 下一页

页脚 **Next** 指向 [Build locally: Overview](https://docs.expo.dev/guides/local-app-overview/)，介绍如何用 Android Studio 与 Xcode 本机编译。

**翻页：**[上一页：添加自定义原生代码](./014-添加自定义原生代码.md) · [返回目录](./README.md) · [下一页：本地构建概览](./016-本地构建概览.md)
