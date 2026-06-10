# 升级 Expo SDK

> 来源：<https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough.md>（页面标注更新日期：2026-05-22）

## 文档解决的问题

本文给出 Expo SDK 的增量升级流程：升级 `expo` 包、对齐依赖、运行诊断、处理原生工程，并阅读目标 SDK 的发布说明。

最重要的原则是：**一次只升级一个 SDK 大版本**。这样更容易定位某一步引入的破坏性变更或兼容问题。

## Expo Go 与开发构建的版本现实

新 SDK 发布后会成为当前版本。Expo Go 只支持最新 SDK，旧 SDK 不再受支持。生产应用更推荐 development build，因为 EAS 服务对旧 SDK 的向后兼容通常更久，但也不是永久支持。

需要特定 Expo Go 版本时，可从 `expo.dev/go` 获取 Android 设备/模拟器和 iOS 模拟器版本。受 iOS 平台限制，实体 iPhone 只能安装最新版 Expo Go。

## 可选：使用 AI 编码代理

文档建议使用 AI 编码代理时安装 Expo Skills，并使用 `upgrading-expo` skill。即使使用技能，也要审查代理提出的修改，并阅读目标 SDK changelog 中的版本专属说明。

## 手动升级流程

### 1. 升级 Expo SDK 包

升级到 SDK 56 的示例：

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

升级其他 SDK 时，应把 `expo@^56.0.0` 替换为目标版本范围。这里的 `^56.0.0` 表示 Expo SDK 56，不应机械用于其他目标版本。

### 2. 对齐依赖并运行诊断

```sh
npx expo install --fix
npx expo-doctor
```

`expo install --fix` 将依赖调整到与当前 SDK 兼容的版本；`expo-doctor` 检查常见项目问题。仅升级 `expo` 包而不对齐周边依赖不是完整升级。

### 3. 更新原生工程

使用 Continuous Native Generation（CNG）时：删除由旧 SDK 生成的 `android` 和 `ios` 目录。之后执行 `npx expo run:ios`、`npx expo prebuild` 或 EAS Build 时会重新生成。

不使用 CNG 时：

- 项目存在 `ios` 目录时运行 `npx pod-install`。
- 根据 Native project upgrade helper 手工应用相关原生变更。
- 也可考虑采用 prebuild，让未来升级更容易。

对 React Web 开发者来说，原生目录不是普通构建缓存：若项目没有采用 CNG，里面可能包含需要人工迁移的 Xcode、Gradle 和平台代码，不能按 CNG 流程直接删除。

### 4. 阅读目标 SDK 发布说明

发布说明会列出弃用、破坏性变更和版本特有事项。尤其要阅读页面底部的 “Upgrading your app” 部分，完成额外步骤。

当前页面列出的当前版本发布说明包括 SDK 56、55、54；SDK 53 至 35 等旧版本被归入 deprecated changelogs。旧文章可能含过时信息，但落后多个版本时仍可作为逐级升级参考。SDK 52 还单独提示 React Native 0.77 的升级说明。

## 推荐执行顺序

1. 确认当前 SDK 与下一个目标 SDK，只跨一个大版本。
2. 阅读目标版本 changelog 和 “Upgrading your app”。
3. 安装目标 `expo` 版本。
4. 运行 `npx expo install --fix`。
5. 运行 `npx expo-doctor` 并解决问题。
6. 根据是否使用 CNG，重新生成或手工升级原生工程。
7. 对升级结果进行项目验证，再进入下一个 SDK 版本。

第 7 步中的“先验证再继续”是基于“一次升级一个版本以定位问题”的文档原则推导；当前页面没有提供具体测试命令或验收清单。

## 限制、坑点与未涉及内容

- Expo Go 的旧 SDK 支持窗口很短，不能把它当作长期生产运行环境。
- EAS 对旧 SDK 的兼容更久，但文档明确说明并非永久。
- CNG 与非 CNG 项目的原生工程处理完全不同，选择错误可能丢失手工原生修改。
- `expo-doctor` 用于发现常见问题，不代表自动修复所有破坏性变更。
- 当前文档未涉及 Git 分支策略、回滚、自动化测试、第三方库逐项兼容验证、EAS Update runtime version 和商店发布步骤。

## 实践结论

**文档明确说明：**逐版本升级；对齐依赖并运行 doctor；按 CNG 使用情况处理原生目录；每次都阅读目标 SDK 发布说明。

**基于文档内容推导：**升级应被视为包含 JavaScript 依赖、原生工程和运行环境的迁移，而不是单次 `package.json` 改版。对落后多个 SDK 的项目，重复执行每个版本的完整流程比直接跳到最新版本更容易隔离故障。
