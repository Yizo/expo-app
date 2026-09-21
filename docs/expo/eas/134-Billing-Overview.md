# 134｜Billing 总览

**翻页：**[上一页：Expo / EAS Audit Logs](./133-Expo-Audit-Logs.md) · [目录](./README.md) · [下一页：Subscriptions、Plans 与 Add-ons](./135-Billing-Plans.md)

**官方页面：**[Billing: Overview](https://docs.expo.dev/billing/overview/)

**版本边界：**这是 EAS 账单 / 订阅入口说明，套餐、价格、额度都可能更新；官方总览最后修改于 2026-07-29。只有 Expo account 的 **Owner** 与 **Admin** 可访问 Billing and Receipts 页面。

## 账单页面管理什么

Expo Application Services（EAS）提供多种托管订阅服务。EAS Dashboard 的 Billing and Receipts 页面集中查看与管理：

- 当前订阅计划和添加的 add-ons。
- 支付方式与账单信息。
- 付款历史、invoice 与 receipt。
- EAS Build / EAS Update usage，以及超出套餐额度后的 usage-based charges。

Owner / Admin 角色决定组织成员是否有权查看或更改这些财务设置。Developer / Viewer 不会因能访问项目就自动获得管理 Billing 页面权限。

## 官方 Billing 分支

| 文档 | 解决的问题 |
| --- | --- |
| **Subscriptions, plans, and add-ons** | 订阅类型、资源额度、额外服务、计费方式。 |
| **Manage plans and billing** | 更新、降级、取消 plan 或修改账号账单信息。 |
| **Payment history / invoices / receipts** | 查看付款历史、下载 invoice / receipt 或理解账单条目。 |
| **Usage-based pricing** | 超出 EAS Build / EAS Update 套餐 quota 后如何计费与查看 usage。 |
| **Billing FAQs** | 常见计划、账单与付款问题。 |

## 关键名词

- **Subscription plan：**EAS 帐户当前订阅的套餐，规定服务额度和可使用功能。
- **Add-on：**在 plan 之外开启的可选服务或支持能力。
- **Usage-based billing：**Paid plan 使用量超过已含额度后按额外量计费的方式。
- **Invoice：**账单凭证，列出一个账期的应付费用。
- **Receipt：**付款完成后的付款凭证。

## 官方代码主题覆盖

源页没有代码或 CLI 命令；内容仅用于链接到当前 Billing 功能入口和访问角色说明。

## 下一页

官方页脚 **Next** 是 [Subscriptions, plans, and add-ons](https://docs.expo.dev/billing/plans/)，继续讲订阅计划及其额度、按量计费和附加服务。

**翻页：**[上一页：Expo / EAS Audit Logs](./133-Expo-Audit-Logs.md) · [返回目录](./README.md) · [下一页：Subscriptions、Plans 与 Add-ons](./135-Billing-Plans.md)
