# 139｜EAS Plans、Billing 与 Payment FAQs

**翻页：**[上一页：EAS Usage-based Pricing](./138-Billing-Usage-Based-Pricing.md) · [目录](./README.md) · **已到官方 Next 链终点**

**官方页面：**[Plans, billing, and payment FAQs](https://docs.expo.dev/billing/faq/)

**版本边界：**EAS 价格、计划额度、Starter MAU 与支持方式可能变化。本 FAQ 页面最后更新于 2026-09-03；价格数值仅作来源页当时说明，不是长期套餐保证。

## Plan 管理常见问题

### 谁能更新 Plan？

Organization account 需要 Owner 或 Admin；Personal account 的账户持有人具有 Owner 权限。升级和降级都在 EAS Billing 页面完成。

### 在错误账号买了 Plan 怎么办？

先在 EAS Dashboard 顶部 account switcher 切到预期 account 并给目标账户订阅，再返回错误 account 的 Receipts 页提交退款请求。计划属于 Expo account，不属于你个人的浏览器 session 或本地 App。

### Free Plan 用完只差几个 Build / Update 怎么办？

官方 FAQ（2026-09-03）说明 Starter 当时为每月 $19，含 $45 EAS Build credit 与 3,000 Update MAU；Free 示例含 1,000 Update MAU。这个额度通常适合希望偶尔超出 Free quota 的 App，但实际售价 / quota 应查询 Pricing Dashboard。

### Free Plan quota 用完会怎样？

- Free plan 不产生 overage 账单。
- 用完免费 build quota 后，新的云端 build 会停用，到下一个 calendar month 的第一天恢复，或升级到付费计划。
- 如果要继续构建，也可考虑符合自身环境与构建方式的 local build。

### Paid plan credits 用完后能切到 Free 用 Free credits 吗？

不能在已付费订阅中途使用 Free build quota；付费 plan credits 用完后，额外使用会按 usage-based pricing 计费。取消订阅后，Free plan 在当前 billing period 结束后生效，之后可按 Free quota 与重置规则使用免费额度。

### 升级时 Free Plan credits 会转过去吗？

不会。Free plan credits 不能转移到其他订阅套餐；Paid plans 有各自的 priority build credit 与更大的 Update 用户 / 带宽额度。

## Billing 常见问题

### Billing period 何时开始？

Free plan 按 calendar month 计费周期，在每个月第一天开始；付费计划从订阅该 plan 的日期开始。

### Billing 地址、Email 或 Tax ID 更改后会影响已经开的 Invoice 吗？

不会。新资料通常反映在下一张 invoice，不会改写已开出账单。Organization 账户要由 Owner / Admin 管理；通过 Billing > Manage billing 进入 Stripe portal 修改。

### Expo 会把 Receipts 邮件发给所有成员吗？

官方 FAQ 说不会将收据邮件发给所有账号成员；Owner / Admin 可以在 Dashboard Receipts 页面下载。

### 怎么减少 EAS Build usage？

使用 development build 和 EAS Update 发布 JS-only 改动，减少为每次 JavaScript 调整重新构建 native binary。CI 可以基于 Expo Fingerprint 判断原生代码 / 配置是否变化：native 有变化再触发 build；没变化时发布 update。

### 如何知道快用完 Build credit？

Expo 会在 account 达到该 plan included build credit 的 80% 与 100% 时给 Owner / Admin 发邮件通知。可以在 Dashboard 的 Email notifications 调整通知。

### 从哪估算下一张账单？

到 Billing > Usage 查看 EAS Build 各 `resource class` 使用量，以及 EAS Update MAU 与 global edge bandwidth 摘要和已花费用。估算最多可能延迟约 24 小时。

### EAS Update 的 MAU 怎么算？

MAU 是一个 billing period 内至少下载过一次 EAS Update 的 unique installation；同一安装在当月下载多次 update 仍只计一个 MAU。

## Payment 常见问题

- **年付：**官方 FAQ 页面说明当时 Enterprise plan 可申请 annual plan；具体合同与付款方式联系 Expo Support。
- **更新 Payment Method：**Owner / Admin 在 Billing > Manage billing 进入 Stripe portal 添加付款方式。
- **银行转账 / ACH：**页面当时仅 Enterprise annual plan 可联系 Support 申请 ACH；普通套餐按 Dashboard 当前支持方式支付。
- **W-9 / 法律文档：**按官方流程联系 Expo Support。
- **卡号：**Expo 不自行存储付款卡数据，付款系统由 Stripe 处理。
- **某次 large build 花费多少：**在 Billing > Usage 按 build resource class 查看当前与历史费用。

## Add-ons 常见问题：增加 Build Concurrency

已订阅 Paid plan 的 account 可在 Billing > Add-ons 购买额外 build concurrencies。Free plan 需要先选择一个付费套餐。套餐本身含有不同的 concurrency 数量；如需要超过官方 FAQ 所说的最多 5 个额外 concurrency，要联系 Support。

## 关键名词

- **Credit：**plan 内用于抵扣相应 EAS Build usage 的额度；和 subscription fee 分开计算。
- **Quota：**每个 billing period 的 included usage limit。
- **Concurrency：**同时执行的构建数量能力；额外并发属于 Add-on。
- **MAU：**每月下载过至少一个 EAS Update 的唯一 installation。
- **Calendar month 与 Billing period：**Free quota 随每月第一天重置；Paid billing period 通常从订阅日开始。

## 官方代码主题覆盖

本页没有源代码或 CLI 示例。升级 / 取消账户计划、Free quota、Invoice、MAU、Build / Update usage 与额外并发等 FAQ 已逐项整理；随套餐变化的额度均标注来源更新时间。

## 官方 Next 链终点

本页页脚只有 **Previous: Usage-based pricing**，没有 **Next** 链接。本地 EAS 连续页链到此结束；其余 Expo 文档站主题并列在导航中，未纳入这个 Next 连续链。

**翻页：**[上一页：EAS Usage-based Pricing](./138-Billing-Usage-Based-Pricing.md) · [返回目录](./README.md) · **已到官方 Next 链终点**
