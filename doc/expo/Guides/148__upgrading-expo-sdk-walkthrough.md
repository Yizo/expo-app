# 升级 Expo SDK 完整指南

> 原文地址：[https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/](https://docs.expo.dev/workflow/upgrading-sdk-walkthrough/)

本文档详细介绍如何将 Expo 项目逐步升级到最新的 SDK 版本。这是一份面向实践操作的指南，覆盖了从使用 AI 编码助手自动升级、到手动升级的完整流程，以及原生代码管理和发布说明查阅等关键步骤。

---

## 核心升级理念：逐步升级

> **官方建议：** 我们建议逐版本递增升级（incrementally, one at a time），这样可以更容易定位升级过程中出现的问题。

这意味着如果你的项目当前是 SDK 50，目标是 SDK 56，不建议直接跳到 56，而应该 50 → 51 → 52 → ... → 56 逐步升级。每次升级后运行项目、检查错误，确认无误后再进行下一版本升级。

*（基于文档内容推导）*

---

## 了解 Expo Go 与开发构建的关系

每次新的 Expo SDK 发布后：

- **Expo Go**（用于快速测试的客户端应用）会将新版本设为当前活跃版本，**旧版本将不再被 Expo Go 支持**。
- 对于**生产环境应用**，建议使用自定义的**开发构建（development builds）**，因为 EAS（Expo Application Services）服务的向后兼容期要长得多。

> **关于 iOS 真机的注意事项：** 如果你需要下载特定版本的 Expo Go，可以访问 [Expo Go 官方下载页面](https://expo.dev/go)。但请注意，在 Apple 物理设备上**只能安装最新版本**的 Expo Go。

*（基于文档内容推导）*

---

## 升级方法概览

文档提供了两种升级方式：

1. **使用 AI 编码助手升级** — 自动化方式，适合使用 Cursor 等 AI 编码工具
2. **手动升级** — 传统方式，逐步执行命令

---

## 方法一：使用 AI 编码助手升级

如果你使用 AI 编码工具（如 Cursor），可以通过以下方式升级：

1. 安装 **Expo Skills** 包
2. 使用其中的 **`upgrading-expo`** 技能模块

该工具会提供版本升级和解决依赖冲突的指引。

> **注意事项：** 即使使用 AI 助手，你也应该**审查（Review）所有建议的更改**，并查阅对应版本的发布日志（changelog）以了解重要变更。AI 助手可能会遗漏某些版本特定的调整。

*（基于文档内容推导）*

---

## 方法二：手动升级（逐步详解）

手动升级分为以下四个步骤：

### 第一步：升级 Expo 核心包

使用你偏好的包管理器安装目标版本的 `expo` 包。以下命令以 SDK 56 为例：

```sh
# npm
npm install expo@^56.0.0

# yarn
yarn add expo@^56.0.0

# pnpm
pnpm add expo@^56.0.0

# bun
bun install expo@^56.0.0
```

> **命令说明：**
> - `npm install` / `yarn add` / `pnpm add` / `bun install`：分别对应四种主流 JavaScript 包管理器的安装命令
> - `expo@^56.0.0`：指定安装 expo 包的 56.x 版本范围（`^` 表示兼容 56.0.0 及以上的 56.x 版本）
> - **请将 `56` 替换为你实际想要升级到的目标版本号**

*（基于文档内容推导）*

### 第二步：对齐依赖版本

安装核心包后，需要将项目中所有相关依赖同步到与新 SDK 版本兼容的版本，然后运行诊断工具检查常见问题：

```sh
npx expo install --fix
npx expo-doctor
```

> **命令说明：**
> - `npx expo install --fix`：自动将项目中的依赖包版本调整为与当前 Expo SDK 版本兼容的版本。它会读取 Expo 的版本映射表，确保每个依赖库都使用经过验证的兼容版本。
> - `npx expo-doctor`：Expo 的诊断工具，用于扫描项目中的常见问题，例如依赖版本不匹配、配置错误等。类似于一个"项目健康检查"工具。

*（基于文档内容推导）*

### 第三步：更新原生项目代码

这一步根据你的项目是否使用**持续原生生成（CNG，Continuous Native Generation）** 分为两种情况：

#### 情况 A：使用持续原生生成（CNG）

如果你的项目使用了 CNG（即通过 `expo prebuild` 自动管理原生代码），处理方式很简单：

> **删除 `android` 和 `ios` 目录**（如果它们是为旧版 SDK 本地生成的），下次构建时它们会自动重新生成。

```sh
# 删除旧的原生目录（基于文档内容推导）
rm -rf ios android
```

> **什么是 CNG（持续原生生成）？**
> CNG 是 Expo 的一种工作模式：原生项目代码（`ios/` 和 `android/` 目录）不由你手动维护，而是通过 `npx expo prebuild` 命令根据项目配置自动生成。这样升级 SDK 时，只需删除旧目录，让新版本重新生成即可。

*（基于文档内容推导）*

#### 情况 B：未使用持续原生生成

如果你的项目手动维护原生代码（不使用 CNG），则需要：

1. 在 iOS 目录下执行 **`npx pod-install`** 来更新 CocoaPods 依赖（iOS 原生依赖管理工具）
2. 查看 [原生升级助手（Native Upgrade Helper）](https://docs.expo.dev/bare/upgrade.md) 获取需要的具体修改
3. 或者考虑[采用 prebuild 工作流](https://docs.expo.dev/guides/adopting-prebuild.md)，以简化未来的升级过程

> **什么是 `npx pod-install`？**
> 这是 CocoaPods（iOS 的原生依赖管理器）的便捷命令。它会在 `ios/` 目录下执行 `pod install`，确保所有原生库的版本正确。

> **关于 prebuild 的建议：** 如果你的项目频繁需要升级 SDK，文档建议考虑迁移到 prebuild 工作流。prebuild 会让原生代码管理自动化，大幅降低未来升级的复杂度。

*（基于文档内容推导）*

### 第四步：查阅发布说明（Release Notes）

升级的最后一步是**查阅目标版本的发布日志**：

> 发布日志中包含关于**破坏性变更（breaking changes）、已弃用的功能（deprecations）**以及该版本特有的其他重要信息。请特别关注日志底部的 **"Upgrading your app"**（升级你的应用）部分，其中可能包含额外的升级步骤。

这一步非常重要，因为某些版本的升级可能涉及 API 变更、配置格式调整等需要手动处理的事项。

---

## SDK 版本发布日志索引

以下是各版本的发布日志链接，记录了每个版本的破坏性变更、新增功能和特殊修改。**每次升级前务必查阅对应版本的发布日志。**

### 当前支持的版本

| 版本 | 发布日志链接 |
|------|------------|
| **SDK 56** | [https://expo.dev/changelog/sdk-56](https://expo.dev/changelog/sdk-56) |
| **SDK 55** | [https://expo.dev/changelog/sdk-55](https://expo.dev/changelog/sdk-55) |
| **SDK 54** | [https://expo.dev/changelog/sdk-54](https://expo.dev/changelog/sdk-54) |

### 已归档的历史版本

> **注意：** 以下旧版本的发布日志可能包含过时的信息，但如果你的项目落后多个版本，它们仍然有参考价值。

| 版本 | 发布日志链接 | 备注 |
|------|------------|------|
| **SDK 53** | [https://expo.dev/changelog/sdk-53](https://expo.dev/changelog/sdk-53) | |
| **SDK 52** | [https://expo.dev/changelog/2024-11-12-sdk-52](https://expo.dev/changelog/2024-11-12-sdk-52) | 包含 React Native 0.77 支持；另见 [RN 0.77 更新说明](https://expo.dev/changelog/2025/01-21-react-native-0.77) |
| **SDK 51** | [https://expo.dev/changelog/2024-05-07-sdk-51](https://expo.dev/changelog/2024-05-07-sdk-51) | |
| **SDK 50** | [https://expo.dev/changelog/2024-01-18-sdk-50](https://expo.dev/changelog/2024-01-18-sdk-50) | |
| **SDK 49** | [https://blog.expo.dev/expo-sdk-49-c6d398cdf740](https://blog.expo.dev/expo-sdk-49-c6d398cdf740) | |
| **SDK 48** | [https://blog.expo.dev/expo-sdk-48-ccb8302e231](https://blog.expo.dev/expo-sdk-48-ccb8302e231) | |
| **SDK 47** | [https://blog.expo.dev/expo-sdk-47-a0f6f5c038af](https://blog.expo.dev/expo-sdk-47-a0f6f5c038af) | |
| **SDK 46** | [https://blog.expo.dev/expo-sdk-46-c2a1655f63f7](https://blog.expo.dev/expo-sdk-46-c2a1655f63f7) | |
| **SDK 45** | [https://blog.expo.dev/expo-sdk-45-f4e332954a68](https://blog.expo.dev/expo-sdk-45-f4e332954a68) | |
| **SDK 44** | [https://blog.expo.dev/expo-sdk-44-4c4b8306584a](https://blog.expo.dev/expo-sdk-44-4c4b8306584a) | |
| **SDK 43** | [https://blog.expo.dev/expo-sdk-43-aa9b3c7d5541](https://blog.expo.dev/expo-sdk-43-aa9b3c7d5541) | |
| **SDK 42** | [https://blog.expo.dev/expo-sdk-42-579aee2348b6](https://blog.expo.dev/expo-sdk-42-579aee2348b6) | |
| **SDK 41** | [https://blog.expo.dev/expo-sdk-41-12cc5232f2ef](https://blog.expo.dev/expo-sdk-41-12cc5232f2ef) | |
| **SDK 40** | [https://dev.to/expo/expo-sdk-40-is-now-available-1in0](https://dev.to/expo/expo-sdk-40-is-now-available-1in0) | |
| **SDK 39** | [https://dev.to/expo/expo-sdk-39-is-now-available-1lm8](https://dev.to/expo/expo-sdk-39-is-now-available-1lm8) | |
| **SDK 38** | [https://dev.to/expo/expo-sdk-38-is-now-available-5aa0](https://dev.to/expo/expo-sdk-38-is-now-available-5aa0) | |
| **SDK 37** | [https://dev.to/expo/expo-sdk-37-is-now-available-69g](https://dev.to/expo/expo-sdk-37-is-now-available-69g) | |
| **SDK 36** | [https://blog.expo.dev/expo-sdk-36-is-now-available-b91897b437fe](https://blog.expo.dev/expo-sdk-36-is-now-available-b91897b437fe) | |
| **SDK 35** | [https://blog.expo.dev/expo-sdk-35-is-now-available-beee0dfafbf4](https://blog.expo.dev/expo-sdk-35-is-now-available-beee0dfafbf4) | |

---

## 完整升级流程总结

以下是手动升级的完整步骤清单，便于快速参考：

```
1. 安装目标版本的 expo 包
   → npm install expo@^XX.0.0

2. 对齐所有依赖版本
   → npx expo install --fix

3. 运行诊断工具检查问题
   → npx expo-doctor

4. 处理原生代码
   → CNG 项目：删除 ios/ 和 android/ 目录，下次构建自动重建
   → 非 CNG 项目：运行 npx pod-install，参考原生升级助手

5. 查阅目标版本的发布日志
   → 关注 breaking changes 和 "Upgrading your app" 部分
```

*（基于文档内容推导）*

---

## 常见问题与注意事项

- **为什么不直接跳版本？** 每个版本的升级可能引入破坏性变更，逐版本升级可以逐个排查问题，避免一次性面对大量变更无从下手。*（基于经验建议）*
- **Expo Go vs 开发构建：** 如果你的应用已经发布到应用商店，使用开发构建（development builds）配合 EAS 是更稳妥的方案，因为 EAS 的向后兼容支持比 Expo Go 持久得多。*（基于文档内容推导）*
- **考虑迁移到 prebuild：** 如果你的项目还在手动管理原生代码，迁移到 prebuild 工作流可以大幅简化后续每次 SDK 升级的工作量。这是 Expo 官方推荐的原生代码管理方式。*（基于文档内容推导）*
- **升级前务必备份：** 在开始升级前，确保你的代码已经提交到版本控制系统（如 Git），以便在出现问题时可以回退。*（基于经验建议）*

---

## 相关文档链接

- [开发构建介绍](https://docs.expo.dev/develop/development-builds/introduction.md)
- [持续原生生成（CNG）](https://docs.expo.dev/workflow/continuous-native-generation.md)
- [Bare 工作流原生升级](https://docs.expo.dev/bare/upgrade.md)
- [采用 Prebuild 工作流](https://docs.expo.dev/guides/adopting-prebuild.md)
- [Expo Doctor 诊断工具](https://docs.expo.dev/develop/tools.md#expo-doctor)
- [Expo Go 下载](https://expo.dev/go)

---

## 文档导航

- **上一页**：[using nextjs](./147__using-nextjs.md)
- **下一页**：[media library](./149__media-library.md)
