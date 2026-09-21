# 135｜Subscriptions、Plans 与 Add-ons

**翻页：**[上一页：Billing 总览](./134-Billing-Overview.md) · [目录](./README.md) · [下一页：管理 Plan 与 Billing 信息](./136-Billing-Manage.md)

**官方页面：**[Subscriptions, plans, and add-ons](https://docs.expo.dev/billing/plans/)

**版本边界：**EAS plan 额度、价格、overage rate 与 add-on 可用资格均可能变化。以下套餐范围按 Expo 官方页面 2026-09-07 的说明概括；本文保留当时页面公布的 Starter 价格作示例，实际订阅前需回 Expo 当前 Pricing 与 Billing Dashboard 确认。

## EAS Plan 基本计费模式

EAS 有免费服务配额和多种付费订阅。Free plan 每月提供有限的 EAS Build 低优先级构建与 EAS Update 用量；月度额度到期会重置。Paid plan 提供月度 build credits、额外 EAS Update unique users / bandwidth / storage，并允许超额后按量付费。Free account 不产生 overage 费用；用完免费额度后服务会受限。

订阅按月计费，官方页面说明税前价格全球一致；Annual contract 可通过 Expo Support 按需沟通。Account Owner / Admin 可从 Dashboard Billing 页面查看当前 plan、额度和 usage。

## 页面列出的 Plan 定位

| Plan | 面向对象 | 主要说明 |
| --- | --- | --- |
| **Free** | 学习、个人项目与原型 | 有限量、低优先级构建和免费 OTA updates；超额时不会产生付费 overage。 |
| **Starter** | 准备发布真实应用的开发者 | 官方页面当时列出的价格是 `$19 / 月`，含 `$45` priority build credit；能超过 Free 的 EAS Update 配额并按使用计费。具体额度与价格请以官方当前报价为准。 |
| **Production** | 专业开发者和小型业务 | Production-grade 服务，build priority credit；比 Free 更高的 Update 用户数、带宽与存储；超限后按量收费。 |
| **Enterprise** | 大型组织 / 企业 | Enterprise-grade 额度、企业级 support 选项与更高资源配额；官方页面称其 build credits 和 Update 带宽高于其他 plan；超限仍可按量计费。 |

“Monthly build credit” 是套餐内供 EAS Build priority build 使用的额度；“MAU / unique users”、bandwidth、storage 是 EAS Update 等服务的用量资源，不能等同于每次发布固定价格。

## Usage-based Billing

付费计划超出 plan quota 时，usage-based billing 为可选的继续用量机制，没有长期合同约束。EAS Billing Dashboard 显示预计 usage / overage charges；Expo 会在账号达到当月 build credits 的 80% 和 100% 时发提醒邮件。

具体超额费率和订阅是否适合某个项目，应查看当前 Pricing、账户当前套餐与真实 usage。

## Add-on：Enterprise Support

页面列出 Enterprise Support add-on，当前仅面向新 Enterprise plan 订阅者，且受可用性限制。功能包括：

- Expo 专家提供长期专业支持。
- 通过直接沟通渠道提供有 SLA 的 support。
- 分配专属 account manager。

Support add-on 可用资格与实际 SLA 需要向官方报价页或 Support 核对。

## 关键名词

- **Build credit：**可用于优先级构建的月度额度 / credit；免费构建与 priority build 不一定使用同一种额度。
- **Quota：**套餐内每月资源上限，如 Update MAU、带宽、存储或 build credits。
- **Overage / usage-based charge：**Paid plan 超出套餐用量后按当前费率额外计费。
- **Add-on：**主 plan 之外另购、用于额外服务 / support 能力的选项。
- **Billing period：**每月订阅周期；套餐页面和账单须以用户账户的实际周期为准。

## 官方代码主题覆盖

源页没有源代码或 CLI 命令。Plan 额度、订阅周期、超额付费和 Enterprise Support 功能均按源页总结；唯一明确金额 `$19 / 月` 与 `$45 build credit` 标注官方页面当时日期，避免视为长期不变的定价。

## 下一页

官方页脚 **Next** 是 [Manage plans and billing](https://docs.expo.dev/billing/manage/)，演示如何在 EAS Dashboard 升级、降级、取消套餐和更新账单信息。

**翻页：**[上一页：Billing 总览](./134-Billing-Overview.md) · [返回目录](./README.md) · [下一页：管理 Plan 与 Billing 信息](./136-Billing-Manage.md)
