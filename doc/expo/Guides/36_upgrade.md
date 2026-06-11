# Expo 原生工程升级辅助工具

## 文档解决的问题

这篇文档解决的是：当你自己维护 `android` 和 `ios` 原生目录时，升级 Expo SDK 后，应该去哪些原生文件里改什么。

## 适用场景

- 项目不是完全依赖 CNG 自动生成原生工程，而是手动维护原生代码。
- 你准备从一个 Expo SDK 版本升级到另一个版本。
- 你希望获得类似 React Native Upgrade Helper 的“文件级 diff 参考”。

## 核心概念

- `native project upgrade helper`：一个对比工具，不是自动升级器。
- `from SDK version` / `to SDK version`：当前版本和目标版本。
- `diff`：逐文件差异，用于手动把模板变更同步到你的项目。

对 React Web 开发者来说，它更像“框架升级时的模板变更对照表”，而不是 `npm update` 那种自动完成的升级。

## 按原文结构整理的核心内容

### 1. 为什么需要这个工具

文档明确说：如果你管理原生工程，升级 Expo SDK 时需要同步修改原生文件，而这件事本身很复杂。

复杂点在于：

- 不是所有变更都发生在 JS 依赖层
- Android 和 iOS 工程文件会跟着模板演进
- 你需要知道哪些文件该改、怎么改

### 2. 这个工具怎么用

流程很清楚：

1. 先升级 Expo SDK 和相关依赖。
2. 在工具里选择 `from` 和 `to` SDK 版本。
3. 查看生成的文件 diff。
4. 手动把变更应用到自己的原生工程里。

它给的是“参考差异”，不是“一键补丁”。

### 3. 文档示例里展示了什么类型的改动

当前页展示了从 SDK 55 到 56 的一些变化，包括：

- Gradle 版本更新
- `gradlew` / `gradlew.bat` 脚本调整
- iOS 最低版本从 `15.1` 提升到 `16.4`
- 新增 `MACOSX_DEPLOYMENT_TARGET`
- `Podfile` 中 React Native 依赖和预编译模块相关环境变量变化
- `package.json` 中 Expo、React、React Native 等版本变化

这说明升级 Expo SDK 往往会连带：

- 构建工具版本
- 原生平台最低版本
- 原生脚本行为
- npm 依赖版本

一起变化。

## 关键流程、命令、配置和文件说明

本页没有给 CLI 命令，而是给使用流程。

文档明确涉及的文件类型包括：

- `android/.gitignore`
- `android/gradle/wrapper/gradle-wrapper.properties`
- `android/gradlew`
- `android/gradlew.bat`
- iOS 工程配置文件
- `ios/Podfile`
- `package.json`

这些文件分别对应：

- 构建缓存与产物忽略规则
- Gradle 版本
- Gradle 启动脚本
- iOS 部署目标
- Pod 依赖和环境变量
- JS/Native 依赖版本

## 注意事项、限制条件和坑点

- 这是“对照工具”，不是自动修复器。
- 你必须先知道自己当前 SDK 版本和目标 SDK 版本。
- 文档明确面向“管理原生工程”的项目；如果你想减少这类升级工作，页面明确建议考虑 CNG。
- diff 需要结合你自己的项目改动人工判断，不能机械覆盖。

## React Web 开发者易误解点

- 容易把“升级 Expo SDK”理解成只改 `package.json`。当前页清楚表明这不够。
- 容易把模板 diff 理解成可以直接全量覆盖。实际上你的项目很可能有自己的原生定制。
- 容易忽略 iOS/Gradle/JDK 等平台层版本门槛，这些和 Web 项目升级差异很大。

## 实际开发建议

- 升级前先记录当前 SDK 版本、React Native 版本和主要原生定制点。
- 升级时按文件维度逐个应用 diff，不要一次性大面积复制。
- 基于经验建议：优先处理平台最低版本、Gradle/Podfile 这类会直接影响构建的改动，再处理模板细节。

## 文档明确说明

- 管理原生工程时，升级 Expo SDK 需要改原生文件。
- 本页提供从当前版本到目标版本的文件级 diff。
- 工具类似 React Native Upgrade Helper，但面向 Expo modules 和相关工具链。
- 如果想减少手动原生升级工作，可以考虑 CNG。

## 基于文档内容推导

- 基于文档内容推导：只做 JS 依赖升级而不对照原生 diff，很容易产生“能装包但不能编译”的情况。
- 基于文档内容推导：项目越偏离 Expo 模板，升级时越需要谨慎逐项比对。

## 当前文档未涉及

- 当前文档未涉及完整的 SDK 升级步骤。
- 当前文档未涉及如何解决升级冲突。
- 当前文档未涉及自动化升级脚本。

<!-- NAVIGATION START -->
---
[← 上一页：在现有 React Native 项目中安装 expo-dev-client](./35_install-dev-builds-in-bare.md) | [下一页：在现有原生 App 中集成 Expo 工具总览 →](./37_overview.md)
<!-- NAVIGATION END -->
