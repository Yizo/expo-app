# Expo Autolinking

## 它解决什么问题

原生移动依赖可能同时涉及 npm、Android Gradle 和 iOS CocoaPods。Expo Autolinking 在构建时发现 React Native/Expo 原生模块并接入 Gradle、CocoaPods，通常把安装简化为安装 npm 包并重新运行 `pod install`。

实现由解析 CLI、Android Gradle 集成和 iOS CocoaPods 集成三部分组成。Expo Autolinking 同时处理 Expo modules 和 React Native modules。

## 解析顺序

构建时按以下顺序找候选模块：

1. 仅 React Native 模块：读取根目录可选的 `react-native.config.js` 中显式 `root`。
2. 搜索 `searchPaths`。
3. 搜索 `nativeModulesDir`，默认 `./modules/`。
4. 按 Node 解析算法递归解析应用依赖及其 dependency/peer dependency。

找到的原生模块自动加入应用构建。

## 配置优先级

从低到高：`package.json` 的 `expo.autolinking`；`android`、`ios`、`apple` 平台覆盖；CLI、Podfile `use_expo_modules!` 或 settings.gradle `useExpoModules` 参数。缺少 `apple` 时回退到 `ios`。

### `searchPaths`

指定额外的类 `node_modules` 目录。SDK 54 前默认包含应用及 monorepo 上层 `node_modules`；要恢复旧行为需显式列出。

### `nativeModulesDir`

本地 Expo 模块目录，默认 `./modules`。

### `exclude`

按包名排除自动链接，可缩小不使用平台的二进制。React Native 模块也可在 `react-native.config.js` 把对应平台设为 `null`。SDK 54 前 `exclude` 只作用于 Expo modules。

### `include`

SDK 55+ 可把非原生但要求单例/内部状态唯一的工具包加入重复检测。平台 `include` 与根列表合并，不是覆盖。

### 其他选项

- `flags`：仅 iOS，向 autolinked pods 传 CocoaPods flags，常用 `inhibit_warnings`。
- `buildFromSource`：仅 Android，让指定包退出预构建 Expo module。
- `legacy_shallowReactNativeLinking`：React Native 模块只搜索应用直接依赖，恢复 SDK 54 前行为；不影响 Expo modules。

## CLI

```sh
npx expo-modules-autolinking search
npx expo-modules-autolinking resolve --platform apple
npx expo-modules-autolinking verify
npx expo-modules-autolinking react-native-config
```

`search` 输出发现的 Expo modules 和低优先级重复项；`resolve` 输出平台专属 podspec/Gradle、原生类和 subscriber 等；`verify` 报告重复安装，`--verbose` 列出全部模块；`react-native-config` 输出 React Native 社区格式的平台信息。

## 重复依赖冲突

Node/Metro 与 autolinking 目标不同。若存在同一原生模块多个版本，JS bundle 可能包含多个版本，而原生应用只链接一个版本，导致运行时崩溃或 API 不兼容，monorepo/隔离依赖尤其常见。

SDK 54 起可启用 `experiments.autolinkingModuleResolution`，让 Expo CLI/Metro 与原生自动链接解析一致；SDK 55 起，该能力在 monorepo 应用默认启用。

## 常见问题

`create-expo-app` 项目默认已配置。模块要可自动链接，包根目录必须在 `package.json` 旁包含 `expo-module.config.json`，并在 `platforms` 中声明当前平台，否则搜索会跳过。

Expo Autolinking 支持 monorepo、workspace、传递依赖和 isolated installs，速度更快，并能检测重复依赖。

SDK 52 起默认替代 React Native community CLI。若只想让 React Native modules 改用社区 CLI，设置 `EXPO_USE_COMMUNITY_AUTOLINKING=1` 并安装 `@react-native-community/cli`；Expo modules 仍由 Expo Autolinking 处理。

## 建议与信息边界

- 安装 npm 包不代表原生构建已刷新；iOS 通常仍需 `pod install`。
- `searchPaths` 目录结构仍须类似 `node_modules`。
- **基于文档内容推导：** monorepo 升级后先运行 `verify`，再处理重复原生包。
- **基于文档内容推导：** `exclude` 前确认 JS 不会在该平台调用对应原生 API。
- 文档未涉及每种包管理器的 hoisting 配置、具体去重命令和 CI 缓存。

