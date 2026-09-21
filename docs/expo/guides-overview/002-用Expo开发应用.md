# 002｜用 Expo 开发应用：整体心智模型

**翻页：**[上一页：Guides 总览](./001-Guides总览.md) · [目录](./README.md) · [下一页：用 app config 配置项目](./003-使用app-config配置.md)

**官方页面：**[Develop an app with Expo](https://docs.expo.dev/workflow/overview/)

> 指南 URL 未固定 SDK 版本。当前项目是 Expo `~56.0.11`；Prebuild / Expo Modules 概念适用于该工作流，具体命令与原生 API 要按项目锁定的 SDK 和工具版本复核。

## Expo app 与 EAS 的关系

Expo app 是使用 React Native、并采用一个或多个 Expo 工具的应用。可只使用 Expo SDK 的一个包，也可使用 Expo Router、Expo CLI、Prebuild 或它们的组合。

**Expo 开源工具**包含 CLI、Router、SDK 等，能本地使用；**EAS** 是可选的托管云服务，处理 Build、Submit、Update、团队协作与自动化。Expo 不强制使用 EAS；EAS 也能为普通 React Native 项目服务。

## Expo Go 与 Development Build

- **Expo Go** 是包含一组预装原生模块的通用练习客户端，适合快速学习和简单原型。它不能动态添加任意自定义 Swift / Kotlin 原生代码。
- **Development Build（开发构建）**是为你的 app 编译的调试客户端，通常带有 `expo-dev-client`。它可以装入项目需要的原生库、app 配置和插件，更接近真实 app 的开发环境。

Expo Go 相当于共享运行容器；Development Build 则是自己的原生二进制。需要摄像头 SDK 以外的自定义模块、真实应用标识或原生配置时，通常要构建自己的 Development Build。

## JavaScript 应用与原生工程

React Native app 由相互配合的两部分组成：

1. **JS / TS 应用**：React 组件与大部分业务逻辑，与 React Web 的职责接近。
2. **Android / iOS 原生工程**：负责启动 JS bundle、绘制原生组件、接入系统功能并编译分发安装包。

默认 `create-expo-app` 模板通常不把 `android/` 和 `ios/` 放进源码目录。CNG 项目需要时再通过 Prebuild 生成；使用云构建时开发者也可能不必自行安装 Android Studio 或 Xcode。

## 创建工程与选择工作流

Expo 推荐的起步方式，以及从 React Native CLI 工程加入 Expo 支持，分别是：

```sh
# 新建 Expo 工程并生成原生工程
npx create-expo-app@latest MyApp
cd MyApp
npx expo prebuild

# 从 React Native Community CLI 工程加入 Expo Modules
npx @react-native-community/cli@latest init MyApp
cd MyApp
npx install-expo-modules
```

官方页面也列了 `--template bare-minimum` 和 yarn / pnpm / bun 的等价命令。包管理器命令前缀会变化，Expo 操作的语义相同。

### CNG 与手工维护原生工程

**Continuous Native Generation（CNG）**把 app config、依赖和插件当成原生目录的生成输入。要改原生配置时优先通过 app config 或 Config Plugin 表达，然后再次 Prebuild。直接修改生成目录能立即试验，但再生成会覆盖这些修改。

现有 RN 工程若一直手工维护 `android/`、`ios/`，可以继续使用 Expo SDK / EAS，但每次都跑 Prebuild 会覆盖原生工程变更；应先明确工程管理方式。

## 本地和云端构建

本地构建适合接入 Android Studio / Xcode 原生调试工具，云构建便于共享、减少本机平台工具安装。两种方式可按每次构建选择：

```sh
# 本地原生构建
npx expo run:android
npx expo run:ios

# 云端构建
eas build --platform android
```

新增原生依赖或改变影响原生工程的配置后要重新构建。只有 JS / 资源改动时，Metro 开发循环会更快地更新运行中的 app。

## Expo app 的核心开发循环

1. 编写 JS / TS 或安装无需原生改动的包，观察 Fast Refresh。
2. 更改应用配置，如图标、启动画面、权限、URL scheme。
3. 必要时写原生代码或原生工程配置。
4. 加入需要原生修改的库，然后生成 / 重建 Development Build。
5. 调试、给测试人员分发、提交商店、监控错误与指标，再发布兼容的 OTA 更新。

原生依赖 / 原生配置变化会改变二进制；OTA 主要覆盖兼容的 JavaScript 和资源内容，不是新的原生编译器。

## 关键名词

- **Bundle**：Metro 将 JS 模块与资源组织成设备可加载的产物。
- **Native project**：Android Gradle / Xcode 工程，最终编译原生应用的输入。
- **CNG**：从 Expo 配置和插件重复生成原生工程的管理方式。
- **Fast Refresh**：开发时尽可能保留 React 状态并即时刷新改动的机制。
- **EAS Update**：将符合已安装二进制 runtime 兼容条件的 JS 更新发布给用户。

## 官方代码主题覆盖

源页命令主题均有等价例子：创建 Expo 工程并 Prebuild、从 RN CLI 工程加入 Expo Modules、本地 Android / iOS `run` 命令，以及云端 EAS Build。源页还按 npm / yarn / pnpm / bun 列举 Prebuild、Run、平台过滤、跳过依赖更新、强制包管理器、跳过安装、Clean 和自定义 template 的变体；正文已解释其类别，并在下一页完整示例中继续列出关键 Prebuild 开关。源页没有独立 TSX 界面代码。

## 下一页

页脚 **Next** 指向 [Configure with app config](https://docs.expo.dev/workflow/configuration/)，介绍 Expo 应用配置文件。

**翻页：**[上一页：Guides 总览](./001-Guides总览.md) · [返回目录](./README.md) · [下一页：用 app config 配置项目](./003-使用app-config配置.md)
