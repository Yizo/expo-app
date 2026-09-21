# 138｜EAS Usage-based Pricing 与用量监控

**翻页：**[上一页：付款历史、Invoices 与 Receipts](./137-Billing-Payment-History.md) · [目录](./README.md) · [下一页：Plans、Billing 与 Payments FAQ](./139-Billing-FAQ.md)

**官方页面：**[Usage-based pricing](https://docs.expo.dev/billing/usage-based-pricing/)

**版本边界：**价格、plan quotas 和 build resource classes 都可能变动。该页最后更新于 2026-08-13；以下金额 / 配额按官方当时 Starter / Production 示例计算，订阅或预算应复核当前 Pricing 与 Billing Usage 页面。

## 什么时候发生 Usage-based Billing

Paid plan 的用量超过套餐内 quota 后，EAS Build 与 EAS Update 的额外使用按量计费，金额每月汇总，Billing 页面显示 usage estimate / overage charges。它允许项目超过套餐额度继续使用，而不必在额度用完时停止服务。

## EAS Build：按优先级构建收费并应用 Credits

EAS Build 的额外用量是每次高优先级 build 的固定费用，取决于平台与 resource class。费用按月合计，并在 billing period 结束时扣款；取消订阅时也可能提前结算。尚未开始任何实际工作的 cancelled build 不收费。

Starter、Production、Enterprise、Legacy 计划中的 build credit 在每个计费周期开始重置、结束到期；build 使用费先由当期 credit 抵扣。

### Production Plan Credits 示例（官方示例单位 / 价格）

| Build 类型 | 单价 | 数量 | 费用 |
| --- | ---: | ---: | ---: |
| Android medium | $1 | 15 | $15 |
| iOS large | $4 | 10 | $40 |
| 合计 usage |  | 25 | $55 |
| Production EAS Build credit |  |  | -$55 |
| 本例额外应付 |  |  | $0 |

这个例子的 25 builds 用量低于计划提供的 build credits，因此 build usage 由 credit 抵销。

### 超出 Build Credits 示例

| Build 类型 | 单价 | 数量 | 费用 |
| --- | ---: | ---: | ---: |
| Android medium | $1 | 20 | $20 |
| Android large | $2 | 10 | $20 |
| iOS medium | $2 | 30 | $60 |
| iOS large | $4 | 40 | $160 |
| 合计 usage |  | 100 | $260 |
| Production EAS Build credit |  |  | -$225 |
| 超出 credit 后费用 |  |  | $35 |

`$260 - $225 = $35`；示例说明费用先抵 credit，剩余部分作为 overage。真实 unit price 应查看用户 build 使用的平台和资源规格当前价格。

## EAS Update：MAU 加 Global Edge Bandwidth

EAS Update 的 usage based price 有两个衡量维度：

- **Monthly Active User（MAU / Updated users）：**每一个计费月里下载至少一次 update 的 unique app installation。一个设备无论下载几次更新，在同一个计费月只计一个 MAU。
- **Global edge bandwidth：**update bundle / assets 的全球 CDN 下载带宽。计划先提供 base bandwidth；超出部分按 GiB 收费。

如果月活用户数超过套餐 base MAU allocation，每个额外用户附带 40 MiB bandwidth；额外用户数量与真正传输总带宽分别参与计费，所以**重复更新同一安装不会再增加 MAU 数，但会继续增加带宽**。

### Starter Plan 20 Updates 示例

官方样例参数：Starter plan 自带 3,000 MAU 与 100 GiB；当月对 10,000 个安装发布 20 次、每个更新 5 MiB。官方当时的示例费率是每额外 MAU `$0.005`，每额外 GiB `$0.10`。

| 描述 | 计算 | 数量 / 费用 |
| --- | --- | ---: |
| Extra updated users | 10,000 - 3,000 included | 7,000 × $0.005 = $35 |
| 额外 MAU 附带流量 | 7,000 × 40 MiB | 273.4375 GiB included |
| Update 下载带宽 | 20 × 5 MiB × 10,000 installs | 976.5625 GiB |
| 用量扣除套餐 / 用户附带带宽 | 976.5625 - 100 - 273.4375 | 603.125 GiB × $0.10 = $60.31 |
| 合计 extra usage | $35 + $60.31 | **$95.31** |

### 同一批 Users 再下载第 21 次 Update

同一计费月内下载第 21 次 update，MAU 仍是 7,000 个额外安装，不重复收用户费，但还会产生新带宽：

```text
总传输：21 × 5 MiB × 10,000 ≈ 1,025.39 GiB
带宽 overage：1,025.39 - 100 - 273.4375 ≈ 651.95 GiB
Extra users：仍为 7,000 × $0.005 = $35
Bandwidth：651.95 × $0.10 ≈ $65.20
总 extra usage ≈ $100.20
```

同一例子若使用官方页面所述 Production plan，其 baseline 50,000 MAU / 1 TiB 可覆盖该流量，因此该示例没有额外费用。实际 plan 配额和当前费率以官方现价页为准。

## 查看使用量与超额提醒

Billing > Usage 页面按 EAS Build、EAS Update 等服务展示本期用量摘要，也能看历史 period 的 details：

- EAS Build 区按 platform / resource class 查看构建数量与已执行 build。
- EAS Update 区查看 updated users 与 global edge bandwidth。
- Billing 的预测可能延迟最多 24 小时，不一定与刚触发的操作实时一致。
- 账户达到 build credit 的 80% / 100% 时，默认会给 Owners / Admins 发 email，可在 Dashboard Email notifications 管理。

## 减少 Build 使用

多数 App 的 JS 更新频率高于原生层。用 development build 与 EAS Update 预览、发布 JS-only 改动，可减少重复构建新的 binary。

在 CI 中可用 Expo Fingerprint 判断 iOS / Android native code 是否变化：发生 native 变化才创建 EAS Build；仅 JS 改动可发布 EAS Update。多条兼容测试 channel 也可以让测试者共享同一 development build。

## 减少 Update 带宽

用 Asset Selection 从 OTA update 中排除未变化、且已包含在当前 native build 的图片 / 视频，避免重复传输。确保被排除文件确实已打包进设备本地 binary；asset 不在 update 或 build 内会导致运行时资源缺失。

用 Expo Updates CLI 检查 update 必需的资源是否都存在：

```sh
npx expo-updates assets:verify APP_DIRECTORY
```

设备已下载过且仍被后续 update 使用的 asset 不会再次下载，也不重复占用带宽。

## 关键名词

- **Resource class：**云端构建机器的资源规格，影响一次高优先级 build 的费用。
- **Plan credit：**套餐每个 billing period 分配的 build 消费额度；用尽后 paid account 可按量收费。
- **MAU / Updated user：**当月下载至少一次 EAS Update 的不同安装实例，一个 installation 每个月计一次。
- **Global edge bandwidth：**EAS Update CDN 向设备传输更新文件所用总带宽。
- **Asset Selection：**在 OTA update 中只打包满足文件匹配条件的 assets，可降低重复资源上传 / 下载量。
- **Expo Fingerprint：**计算 native 项目输入变化的方法，可用于 CI 判断本次是否需要新 binary。

## 官方代码主题覆盖

源页公式 / examples 全部覆盖：两组 EAS Build credits / overage 计算表；Starter MAU、每额外 MAU 带宽与双算账期公式；同用户新增第 21 次更新只继续计带宽；Production 示例 plan 额度；检查资源用 `npx expo-updates assets:verify <dir>`。所有价格数字标成来源 2026-08-13 示例值，不视为当前报价。

## 下一页

官方页脚 **Next** 是 [Plans, billing, and payment FAQs](https://docs.expo.dev/billing/faq/)，集中回答套餐切换、额度重置、付费记录与计划使用问题。

**翻页：**[上一页：付款历史、Invoices 与 Receipts](./137-Billing-Payment-History.md) · [返回目录](./README.md) · [下一页：Plans、Billing 与 Payments FAQ](./139-Billing-FAQ.md)
