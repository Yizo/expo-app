# 136｜管理 EAS Plans 与 Billing 信息

**翻页：**[上一页：Subscriptions、Plans 与 Add-ons](./135-Billing-Plans.md) · [目录](./README.md) · [下一页：付款历史、Invoices 与 Receipts](./137-Billing-Payment-History.md)

**官方页面：**[Manage plans and billing](https://docs.expo.dev/billing/manage/)

**版本边界：**账单 Dashboard UI、可购买计划、降级目标可能变化。本文按官方管理步骤整理；提交付款、降级或取消会影响账户服务，应由账户 Owner / Admin 在 Billing 页面核对当前条款。

## 查看当前 Plan

在 EAS Dashboard 导航点 Subscription 下的 **Billing**。Current Plan 显示该 Expo account 当前订阅和状态。

## Upgrade 到新 Plan

1. 打开 Billing。
2. 已在付费 plan 时点 Current Plan > **Change Plan**；Free plan 用户先点 **See plans > Select your account** 打开 Upgrade plan。
3. 选择目标套餐，点对应 **Upgrade**。
4. Checkout 页面输入账单邮箱、卡信息与账单地址，确认金额后选择 **Pay Now**。

可购买 plan 与 quota 以账户页面实时列出为准；这里没有复制套餐价目表，避免把随时间变化的金额当成固定规则。

## Downgrade Plan

官方当前页面描述从 Production、Enterprise 或 Legacy 降级到 Starter；降级不会立刻取消现有权益，而是在当前 billing period 结束后生效。

Dashboard 路径大致为：Billing > Current Plan > Change Plan > 选账户 > Starter > Change > 确认。确认后 Billing 页面会在 **Upcoming Plan** 显示待生效套餐。

## Cancel Plan

- **Production / Enterprise：**Billing > **Cancel all subscriptions** > Continue to Stripe，按 Stripe 当前 plan cancellation 流程完成。取消通常在当前 billing period 结束后生效。
- **Starter → Free：**在 Billing > Cancel all subscriptions 遵循取消 prompt；本周期剩余期间依然会按 Starter 相关规则结算。官方特别说明，取消 Starter 时仍需支付当前 period 已发生的 usage。

取消不会自动清除项目或已发布 App；变化的是该 account 后续可使用的 EAS plan 权益。

## 修改 Billing Details

Billing > **Manage billing** 会打开 Stripe portal：

- 更新账单 name、email 和地址。
- 添加或调整有效 tax ID。
- 增加新的 payment method。

这些资料会展示在订阅账单 invoice 上。完成更新前核对账户与账单主体一致。

## 关键名词

- **Current Plan：**当前已生效的订阅。
- **Upcoming Plan：**已安排、要等当前账期结束才生效的套餐变化。
- **Billing period：**本轮订阅计费时间段；多数取消 / 降级按 period end 生效。
- **Stripe portal：**Expo Dashboard 跳转到的账单信息管理页面，用于更新 payment details。
- **Usage charge：**当 period 内产生的超额使用费用；Starter 取消时本周期已有 usage 仍应结算。

## 官方代码主题覆盖

源页为 Billing Dashboard / Stripe 页面步骤，没有 CLI、JavaScript 或配置文件示例；计划升降级、生效时间、取消以及账单 / Tax ID / 支付方式操作都已概括。

## 下一页

官方页脚 **Next** 是 [Payment history, invoices, and receipts](https://docs.expo.dev/billing/invoices-and-receipts/)，解释如何看付款记录、下载 invoice / receipt 及提交退款请求。

**翻页：**[上一页：Subscriptions、Plans 与 Add-ons](./135-Billing-Plans.md) · [返回目录](./README.md) · [下一页：付款历史、Invoices 与 Receipts](./137-Billing-Payment-History.md)
