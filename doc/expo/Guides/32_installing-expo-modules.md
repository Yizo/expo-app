# 在现有 React Native 项目中安装 Expo Modules

## 文档解决的问题

这篇文档解决的是：如何把 `expo` 包安装进一个已有的 React Native 项目，并把工程配置到可以继续安装其他 Expo SDK 模块的状态。

## 适用场景

- 项目原本不是 Expo 项目，但你想开始使用 Expo SDK。
- 你要给现有 React Native 工程接入 Expo CLI、`expo-dev-client`、`expo-updates` 等能力。
- 你需要一个“先把基础设施装好”的入口文档。

## 阅读前需要理解的背景

- `expo` 包不是“整套 Expo App”，而是接入 Expo 模块体系的基础包。
- `autolinking` 可以理解为“自动把原生依赖接入 Android/iOS 工程”的机制，类似前端构建工具自动发现插件，但这里作用在原生层。
- CocoaPods 是 iOS 依赖管理工具；`pod install` 不是可选装饰步骤，而是原生依赖真正落地的一部分。

## 按原文结构整理的核心内容

### 1. 先安装 `expo` 包

文档明确说：要使用任意 Expo module，先安装并配置 `expo` 包。它本身体积不大，主要包含：

- 几乎所有 App 都会用到的少量基础模块
- 模块系统基础设施
- autolinking 基础设施

装好以后，才可以继续用 `npx expo install` 安装更多 Expo SDK 包。

### 2. 自动安装优先

最推荐的方式是：

```sh
npx install-expo-modules@latest
```

它会尽量自动修改项目。如果成功，说明项目已经进入“可安装更多 Expo 模块”的状态。

如果失败，文档明确说要走手动安装，因为很多现有项目已经偏离默认模板，自动改代码不一定可靠。

### 3. 手动安装的重点

手动安装从：

```sh
npm install expo
```

开始，然后把文档提供的 Android、iOS diff 应用到工程里。

这里的核心不是“装一个 npm 包”这么简单，而是让原生工程认识 Expo 模块系统。

### 4. iOS 额外要求

文档明确给出两个重要点：

- 建议在 `AppDelegate.swift` 添加额外 delegate methods，因为部分库会依赖它们。
- iOS Deployment Target 需要升到 `iOS 16.4`。

对 React Web 开发者来说，这意味着“依赖兼容范围”不只是 npm 包版本，还包含原生平台最低版本。

### 5. CocoaPods 和本地运行

改完配置后需要：

```sh
npx pod-install
npx expo run:ios
```

`use_expo_modules!` 会让 CocoaPods 把检测到的 Expo 模块拉进 iOS 工程。

### 6. 让 Android/iOS 改用 Expo CLI 打包

文档强烈建议用 Expo CLI 负责 JS 和静态资源打包。原因包括：

- 支持 `package.json` 的 `"main"` 字段
- 这是 Expo Router 等能力的基础
- 不这样做可能会出现“行为不符合预期”

这部分涉及：

- `babel.config.js` 使用 `babel-preset-expo`
- `metro.config.js` 继承 `expo/metro-config`
- Android 构建改为使用 Expo CLI
- iOS Xcode 的 “Bundle React Native code and images” 脚本替换为 Expo CLI 版本
- `AppDelegate.swift` 中开发环境的 bundle 入口从 `index` 改成 `.expo/.virtual-metro-entry`

## 关键命令、配置、文件说明

关键命令：

- `npx install-expo-modules@latest`：自动接入 Expo 模块体系。
- `npm install expo`：手动安装基础包。
- `npx pod-install`：重新安装 iOS Pods。
- `npx expo run:ios`：本地编译并运行 iOS。
- `npx expo install expo-constants`：验证安装是否成功。

关键文件：

- `AppDelegate.swift`：iOS 原生入口，可能需要补 delegate methods，也需要调整 bundle 入口。
- `Podfile`：通过 `use_expo_modules!` 接入 Expo 模块。
- `babel.config.js`：改用 `babel-preset-expo`。
- `metro.config.js`：扩展 `expo/metro-config`。
- `package.json`：`"main"` 字段会影响入口解析。

验证方式：

```tsx
import Constants from 'expo-constants';
console.log(Constants.systemFonts);
```

如果能跑通，说明基础接入成功。

## 注意事项、限制条件和坑点

- 自动安装失败不代表 Expo 不能用，往往只是项目定制太多，需要手动接。
- 文档明确针对 React Native `0.85` 的“最新安装方式”；更旧版本要看 upgrade helper。
- 不使用 Expo CLI 打包，某些功能可能异常，尤其是与入口解析相关的能力。
- `expo` 包虽然“体积小”，但接入它仍然会触及 Android、iOS、Babel、Metro、Xcode 构建脚本多个层面。
- iOS 最低版本要求被提升到 `16.4`，这是实际兼容性边界，不只是建议。

## React Web 开发者易误解点

- 容易把 `npm install expo` 理解成“已经安装完成”。其实这只是第一步，真正难点在原生配置。
- 容易把 `pod install` 当作类似前端锁文件更新；实际上它会影响 iOS 原生依赖图。
- 容易以为 bundle 入口永远都是 `index.js`。这里文档明确说明接入 Expo CLI 后，开发态入口会变成 `.expo/.virtual-metro-entry`。
- 容易误解 `expo install` 和 `npm install` 没区别。当前文档明确说明 Expo 推荐用前者安装 Expo SDK 包，以保证兼容版本。

## 实际开发建议

- 优先尝试 `npx install-expo-modules@latest`，失败再切手动。
- 如果项目已经 heavily customized，预期要改原生工程，不要把这项工作排得过于轻量。
- 基于经验建议：在接入前先确认 iOS 最低版本升级不会影响现有业务发布要求。
- 基于经验建议：完成配置后先用 `expo-constants` 做最小验证，再继续接入其他 Expo 模块。

## 文档明确说明

- 使用 Expo modules 必须先安装并配置 `expo` 包。
- 自动安装是首选方案。
- 手动安装需要改 Android、iOS、Babel、Metro 和打包脚本。
- iOS Deployment Target 需要设为 `16.4`。
- 建议使用 Expo CLI 负责 bundling。

## 基于文档内容推导

- 基于文档内容推导：这篇文档本质上是在把项目从“普通 React Native 工程”升级为“可运行 Expo 工具链的 React Native 工程”。
- 基于文档内容推导：后续 Expo 能力是否稳定，和这里的基础接入是否完整关系很大。

## 当前文档未涉及

- 当前文档未完整展开 Android、iOS 的所有 diff 细节。
- 当前文档未涉及如何处理已有复杂原生自定义与这些改动冲突。

<!-- NAVIGATION START -->
---
[← 上一页：Expo 在现有 React Native 项目中的总览](./31_overview.md) | [下一页：从 React Native CLI 迁移到 Expo CLI →](./33_using-expo-cli.md)
<!-- NAVIGATION END -->
