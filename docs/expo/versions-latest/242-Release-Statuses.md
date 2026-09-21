# 242｜Expo 发布状态与稳定性等级

**翻页：**[上一页：qr.expo.dev EAS Update 二维码](./241-QR-Expo-Dev.md) · [目录](./README.md) · [下一页：Expo 术语表](./243-Glossary-of-Terms.md)

**官方页面：**[Release statuses](https://docs.expo.dev/more/release-statuses/)

**版本范围：**Expo 当前未版本化的术语页面；官方页面标注更新于 2026-08-06。发布状态表示功能成熟度和变更风险，不是一个所有产品都必须逐级通过的发布流水线。

## 不同产品使用不同状态

| 产品区域 | 常见状态 |
| --- | --- |
| Expo SDK 库与 Expo Router | Alpha、Beta |
| EAS 服务 | Preview、Beta |
| Expo CLI 与其他开发工具 | Experimental |

一个稳定库内部的某个 API 仍可能标记 Experimental。Deprecated 也可以在功能生命周期后段出现；状态应按具体功能和页面徽标理解，不能仅凭所属库的整体状态推断。

## Experimental：实验中

这是最早期的探索阶段，团队还在验证方向和是否要长期保留该功能。

- 任何版本都可能大幅改变或移除。
- API 可能随时变化，且不保证事先有 breaking-change / deprecation 警告。
- 实现可能只是 proof of concept（概念验证），有已知 bug、缺少功能或性能问题。
- 不建议用于生产 App；适合开发环境试验和反馈。

**容易混淆：**发布状态 Experimental 和 app config 中的 `experiments` 字段不是一回事。`experiments` 是 opt-in（显式开启）功能的配置区；它开启的功能并不必然标记为 Experimental。例如 `experiments.typedRoutes` 开启的是 Beta 状态的类型路由。

## Alpha：早期测试

Alpha 功能已经提供给社区试用，但仍可能有明显限制：

- 即使不发新 SDK，API 也可能发生破坏性改动。
- 实现可能依据反馈大幅重做。
- 不建议直接用于生产 App；可以在开发环境测试并提供反馈。

## Preview：预览版

Preview 通常适用于尚未完整覆盖所有场景的一块新能力，常见于 EAS 新服务：

- 范围聚焦、功能集不一定完整。
- 功能建设期间仍可能有 breaking change。
- 经过充分测试后可用于生产，但要评估功能边界和升级成本。
- 反馈可以帮助 Expo 决定后续要补全哪些部分。

## Beta：功能接近完成

Beta 通常表示主要功能已完成，正在做最后验证；EAS 服务和接近稳定的 SDK 库常使用此标记：

- 核心功能已完成。
- 除发现关键问题外，通常不太会有破坏性改变，但仍有可能。
- 完整测试后可用于生产。
- 对生产场景应做好跟踪变更和升级的准备。

## Stable：稳定正式版

页面中没有状态徽标的功能默认视为 Stable：

- 已达到生产可用状态，并按官方产品支持范围维护。
- 按语义化版本规则，稳定功能的破坏性改动只会出现在新的主版本。
- 用户可以把它作为常规生产依赖；仍需按具体 API 文档满足平台与版本前提。

## Deprecated：已弃用

Deprecated 表示该功能不再推荐给新代码使用，并将在未来某个版本移除：

- 文档和代码会显示弃用提示，帮助用户迁移。
- Expo 可能不再接受该 API 的问题反馈。
- 移除会在某个新 SDK release 中进行；弃用提示不等于当前版本已经立即移除。

## 新手名词解释

- **Breaking change（破坏性改动）：**升级后现有代码可能不能继续运行或类型检查，需要按新 API 改写。
- **Semantic versioning（语义化版本）：**通常用 major.minor.patch 表示版本；稳定 API 的破坏性变化约定只进入新的 major 主版本。
- **Deprecation（弃用）：**旧 API 暂时可能仍能运行，但官方建议迁移，并可能在未来 SDK 移除。
- **Preview 与 Beta：**两者都能帮助开发者提前试用；Preview 通常功能面较窄且仍在扩充，Beta 则更接近功能完整和稳定发布。
- **Status badge（状态徽标）：**官方页面标题或 API 附近标出的成熟度标签。没有徽标的功能视为 Stable，但单项 API 可有独立状态。
- **Feedback（反馈）：**使用者将实际问题与需求报告给 Expo，帮助团队决定下一步开发或修复优先级。

## 源页代码覆盖

官方页面没有代码块或命令示例；本页覆盖各发布状态定义、适用产品区域、变更风险、生产使用建议、Deprecated 生命周期，以及 `experiments` 配置字段和 Experimental 状态的区别。

**翻页：**[上一页：qr.expo.dev EAS Update 二维码](./241-QR-Expo-Dev.md) · [目录](./README.md) · [下一页：Expo 术语表](./243-Glossary-of-Terms.md)

