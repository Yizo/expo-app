# 094｜EAS Update Alternative Deployment Patterns

**翻页：**[上一页：优化 EAS Update JavaScript 与 Image Assets](./093-EAS-Update-Optimize-Assets.md) · [目录](./README.md) · [下一页：How EAS Update Works](./095-EAS-Update-How-It-Works.md)

**官方页面：**[Alternative deployment patterns](https://docs.expo.dev/eas-update/deployment-patterns/)

**版本边界：**本文对比 EAS Update 的发布策略，不绑定特定 Expo SDK。示例中的 channels / runtimeVersion、内部构建类型要匹配 Expo ~56.0.11 项目的 binary。

## 设计 Update Release Process 时要决定什么

一个团队的发布策略通常由三类决策组成：

1. **创建哪些 Builds：**只建 production build；或生产 / 预发布都单独 build。
2. **怎样测更新：**Expo Go / development build、internal distribution、Play Internal Testing、TestFlight。
3. **向哪里发布：**只用一个 update branch；按 environment 建 staging / production branches；或按 app version 建 version-specific branches。

简单流程减少命名与手工 bookkeeping、提交快；增加独立 staging / channel / version 步骤会提高验证安全性，但要管理更多 profile、runtime 和分支。选择团队所需的平衡。

## Pattern 1：Two-Command Flow

适合小项目或刚开始试 Expo Update、追求最少概念的团队：

1. 本地用 Expo Go / development build 测试。
2. 只建 production native build 并提交商店。
3. 有 JS hotfix 时直接发 production branch：

```sh
eas build
eas update --branch production
```

优点：不用另建 staging 环境，团队沟通成本低，更新很快。缺点：正式用户拿到 JS bundle 前缺少专门的测试 build；Go/dev build 与 production native runtime 并非始终完全相同。

## Pattern 2：Persistent Staging

适合要让团队在应用商店测试轨道提前体验的项目：

1. 创建 production build，以及一份预发布 staging build。
2. Production profile 使用 production channel；TestFlight / Play Internal Track build 指向 staging channel。
3. GitHub Actions 在 Git staging branch 上自动发 staging update。
4. 验证后将改动合并至 production branch，再发布 production update。

这种方式把开发速度与 production release 节奏拆开；缺点是 merge 到 production 通常会重编并重新发布 bundle，而非直接 promote 在 staging 上验证的同一份 artifact。回看历史版本也要定位对应 commit。

## Pattern 3：按 Platform 拆分

适合 iOS / Android 发布节奏、原生代码或审核要求差异很大的团队。为每个平台分别准备 build profile / channel / branch，例如：

- ios-staging 与 ios-production。
- android-staging 与 android-production。

分别把 iOS staging 放 TestFlight、Android staging 放 Play Internal Track；验证后再分别向 production channel 发布。优点是能精确控制每个平台接受的 update；缺点是双平台同时修复通常要跑两套发布命令和验证。

## Pattern 4：Branch Promotion / Versioned Release

适合要确保“验过的那份 bundle 原样进生产”并保存版本化发布记录的团队，配置最精细：

1. 每个 release major/runtime 建对应 production builds，例如 production-rtv-1；另建 staging builds。
2. Git / EAS 上用 version-1.0 等 branch 保存这一版源码。
3. 将 staging channel 指向 version-1.0 branch，先让 internal / TestFlight / Play Internal 测试。
4. 验证后将 production-rtv-1 channel 指向同一 branch。
5. 新 JS-only 版本创建 version-2 branch，继续测试后再把 channel mapping 更新到 production。
6. 如果版本包含 native dependency 或 SDK 改动，先 bump runtimeVersion、生成新的 staging build；随后再生成新 production runtime build。旧 runtime 用户继续留在旧 production branch，直到更新 binary。

此模式支持“先验证 update，之后改 channel mapping”，尽可能将同一个 tested update 交给 production。代价是需要手动管理 runtimeVersion / version branch / channels，官方指出这一路径不适用自动 runtime version policy（sdkVersion、appVersion、nativeVersion、fingerprint）。

### 版本与 Channel Mapping 示例

一个 channel 可以按发布阶段指向一个 branch，例如 staging channel → version-2，production-runtime-1 → version-1。切换 mapping 的 EAS CLI 主题为：

```sh
eas channel:edit production --branch version-2
eas channel:edit staging --branch version-3
```

此处示例体现“升 promotion 时改变 channel 指向”的操作；branch contents 需与对应 native runtime compatibility 匹配。

## 关键名词

- **Persistent staging：**长期存在的 staging / production 环境分支。
- **Platform-specific flow：**iOS 与 Android 使用独立 channel / build / update 轨道。
- **Branch promotion：**把已验证的 EAS Update branch 从 staging channel 改指向 production channel。
- **Bookkeeping：**维护版本 branch、channel mapping、runtime 与 build 之间的对应记录。
- **Runtime-specific channel：**为一个 native runtime 单独保留的 production channel。

## 官方代码主题覆盖

源页的 CLI / configuration themes 均已覆盖：two-command 的 eas build / eas update --branch production；Git merge / channel pattern 的 staging / production 策略；platform-specific channel 命名；version-specific branch、manual runtime version、channel mapping 与 eas channel:edit 命令；不同模式的安全 / 速度 / bookkeeping tradeoff。

## 下一页

官方页脚 **Next** 是 [How EAS Update works](https://docs.expo.dev/eas-update/how-it-works/)，深入说明 build / update layer、channel、branch 与 runtime/platform 的匹配关系。

**翻页：**[上一页：优化 EAS Update JavaScript 与 Image Assets](./093-EAS-Update-Optimize-Assets.md) · [返回目录](./README.md) · [下一页：How EAS Update Works](./095-EAS-Update-How-It-Works.md)
