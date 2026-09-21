# 137｜付款历史、Invoices 与 Receipts

**翻页：**[上一页：管理 EAS Plans 与 Billing 信息](./136-Billing-Manage.md) · [目录](./README.md) · [下一页：Usage-based Pricing](./138-Billing-Usage-Based-Pricing.md)

**官方页面：**[View payment history, invoices, and receipts](https://docs.expo.dev/billing/invoices-and-receipts/)

**版本边界：**账单下载与退款状态以 EAS Dashboard / Stripe 当前界面为准。本页最后更新于 2026-08-12；后附的账单行金额是官方示例中的 2025 计费例子，仅用于解释 credits / overage 算法，不代表当前定价。

## Receipts 页面能看什么

EAS Dashboard Subscription > **Receipts** 提供付款历史，包含日期、支付状态、金额，并链接到 Invoice / Receipt。该页面仅对账户 **Owner / Admin** 开放。你可以认为 Invoice 是应付费用的账单，Receipt 是付款完成证明。

### 下载 Invoice / Receipt PDF

打开 Receipts，点击对应账期日期，会跳转到 Stripe 页面：

- 选择 **Download invoice** 下载 invoice PDF。
- 选择 **Download receipt** 下载 receipt PDF。

Invoice 会列出公司法定名称、地址、Tax ID、invoice number、due date、收费说明和总金额；典型账单可包含当前订阅费、超额费用与已抵扣 plan credits。

## 申请 Refund

在收据右侧打开三点菜单，选择 **Request Refund**，填写请求表并提交。退款由人工审核；批准后退到原支付方式，官方页面称处理一般要 5–10 个工作日，不保证每个请求都获批。

## 如何理解 Invoice 行项目

页面使用 2025 年某几个示例说明 build usage / credit / subscription 组合方式。数字只解释计算，不应作为本年度套餐价格依据：

| 历史示例 | Billing period usage | Plan credit | 下期订阅费 | 示例 total |
| --- | ---: | ---: | ---: | ---: |
| Production 用量低于 credit | $210 | -$210（该 plan 示例 credit cap $225） | $199 | $199 |
| Production 超过 credit | $300 | -$225 | $199 | $274 |
| Starter 用量 | $30 | -$30（来源示例说 Starter build credit $45） | $19 | $19 |

以超额 Production 例子来说，$300 build usage 减掉 $225 plan credit 后余 $75，再加下一账期的 $199 subscription fee，总 invoice 示例为 $274。订阅费与 build usage 对应的账期可能前后错开，因此阅读 invoice 要看每条 line item 的日期范围。

## 关键名词

- **Invoice：**列出某计费周期费用、信用额抵扣与应付总额的账单。
- **Receipt：**完成付款后由支付流程提供的收据凭证。
- **Plan credit：**订阅中可用于抵扣特定 build usage 的额度；未超过时不代表 subscription fee 免除。
- **Overage charge：**usage 超过 plan credit / allowance 后的额外收费。
- **Billing period：**周期范围；invoice 可能同时出现已结束期间的 usage 与下个期间的订阅费。
- **Stripe portal：**EAS Dashboard 链接到的账单 / payment 管理页面。

## 官方代码主题覆盖

源页没有代码或 CLI 示例；Invoice / Receipt PDF 下载、退款请求 UI 流程、2025 历史账单表格都已整理。所有金额和额度都标为历史演算示例，不能代替当前官方 Pricing。

## 下一页

官方页脚 **Next** 是 [Usage-based pricing](https://docs.expo.dev/billing/usage-based-pricing/)，详细解释 EAS Build credits 和 EAS Update 月活 / 全球边缘带宽的超额计费。

**翻页：**[上一页：管理 EAS Plans 与 Billing 信息](./136-Billing-Manage.md) · [返回目录](./README.md) · [下一页：Usage-based Pricing](./138-Billing-Usage-Based-Pricing.md)
