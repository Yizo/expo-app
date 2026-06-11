# Brownfield：用 Isolated 方式把 Expo 打成原生库

## 文档解决的问题

这篇文档解决的是：如何把独立的 Expo/React Native 项目构建成 Android AAR 和 iOS XCFramework，然后像普通原生依赖一样接入现有原生 App。

## 适用场景

- 原生团队和 React Native 团队分开协作。
- 你想尽量降低 React Native 对原生主工程构建流程的影响。
- 你希望原生团队只消费“构建产物”，而不是直接参与 Node/Metro 环境。

## 核心概念

- `isolated approach`：React Native/Expo 工程独立开发、独立发布，再以原生库形式提供给宿主。
- `AAR`：Android Library 的发布产物。
- `XCFramework`：iOS 的二进制框架产物。
- `expo-brownfield`：负责把 Expo 项目导出成这些原生库并提供桥接能力的库。
- `BrownfieldActivity` / `ReactNativeHostManager` 等：由生成的 brownfield 目标提供的原生接入层。

## 按原文结构整理的核心内容

### 1. 先创建独立 Expo 项目

文档建议用：

```sh
npx create-expo-app@latest my-project --template default@sdk-56
```

这个项目不需要和现有原生 App 放在同一目录里，可以独立仓库，也可以放在 monorepo。

### 2. 安装 `expo-brownfield`

```sh
npx expo install expo-brownfield
```

它负责提供：

- 导出原生库的构建能力
- 与宿主 App 集成所需的目标和桥接组件

### 3. 通过 config plugin 配置导出信息

默认情况下，`expo-brownfield` 会自动往 `app.json` 的 `plugins` 里加一项。

也可以自定义：

- iOS `targetName`
- iOS `bundleIdentifier`
- Android `libraryName`
- Android `group`
- Android `package`
- Android `version`

这意味着导出结果不是固定命名，而是可以按现有原生体系要求定制。

### 4. 生成原生库

文档以 Android 为例，使用：

```sh
npx expo-brownfield build:android
```

它会生成 AAR，并发布到 Maven 仓库。默认是本地 Maven：`~/.m2`，也可以配置远程仓库。

### 5. 如需调试原生 target，可执行 prebuild

```sh
npx expo prebuild
```

这会在 Expo 工程里生成 `android` 和 `ios` 目录，并带上 brownfield 目标。

生成内容包括：

- Android：`ReactNativeHostManager`、`BrownfieldActivity`、`ReactNativeFragment`、`ReactNativeViewFactory`、`BrownfieldMessaging`
- iOS：`ReactNativeHostManager`、`ReactNativeViewController`、`ReactNativeView`、`BrownfieldMessaging`、`ReactNativeDelegate`

### 6. 接入现有原生 App

Android 示例里需要：

- 在 `build.gradle.kts` 里添加 Maven 依赖
- 如使用本地 Maven，则在仓库配置中加入 `mavenLocal()`

然后创建继承 `BrownfieldActivity` 的 Activity，并调用 `showReactNativeFragment()`。

还要在 `AndroidManifest.xml` 注册该 Activity，并使用非 ActionBar 主题。

## 关键命令、配置、文件说明

关键命令：

- `npx create-expo-app@latest my-project --template default@sdk-56`
- `npx expo install expo-brownfield`
- `npx expo-brownfield build:android`
- `npx expo prebuild`
- `npx expo start`

关键配置：

- `app.json` 的 `plugins`
- `expo-brownfield` 的 iOS/Android 自定义项

关键文件：

- `app.json`
- 宿主 Android 的 `build.gradle.kts`
- 宿主 Android 的 `AndroidManifest.xml`

## 注意事项、限制条件和坑点

- 宿主原生 App 依赖的是“构建产物”，不是直接运行 Expo 源码。
- 若发布到本地 Maven，宿主工程必须能访问到 `mavenLocal()`。
- `BrownfieldActivity` 需要非 ActionBar 主题，否则 React Native 页面上方会叠出原生 ActionBar。
- Debug 模式依赖 Metro；Release 模式则使用嵌入在 AAR/XCFramework 中的 bundle。

## React Web 开发者易误解点

- 容易把它理解成“发一个 npm 包给原生团队”。这里实际发的是原生二进制/库产物。
- 容易以为开发时也完全不需要原生环境。文档明确说调试原生 target 时仍可能需要 `expo prebuild`。
- 容易忽略 Debug 和 Release 行为不同：前者走 Metro，后者走内嵌 bundle。

## 实际开发建议

- 如果组织上是“RN 团队产出组件，原生团队消费”，这条路线非常契合。
- 优先确定 Maven/XCFramework 的发布和版本命名规则，再开始集成。
- 基于经验建议：先跑通一个最小 React Native 页面，再逐步引入复杂通信和导航。

## 文档明确说明

- isolated 方案是把 Expo/React Native 打包为原生库供宿主 App 使用。
- 使用 `expo-brownfield` 完成导出和集成。
- Android 可导出 AAR 并发布到 Maven。
- Debug 依赖 Metro，Release 使用内嵌 bundle。

## 基于文档内容推导

- 基于文档内容推导：isolated 更强调“产物边界清晰”，适合稳定交付给原生团队。
- 基于文档内容推导：一旦产物发布流程建立好，原生团队可以较少感知 Node/Expo 细节。

## 当前文档未涉及

- 当前文档未给出 iOS 宿主工程接入 XCFramework 的完整步骤。
- 当前文档未涉及 JavaScript 与宿主原生之间复杂消息通信细节。

<!-- NAVIGATION START -->
---
[← 上一页：在现有原生 App 中集成 Expo 工具总览](./37_overview.md) | [下一页：Brownfield：用 Integrated 方式把 Expo 直接接入原生工程 →](./39_integrated-approach.md)
<!-- NAVIGATION END -->
