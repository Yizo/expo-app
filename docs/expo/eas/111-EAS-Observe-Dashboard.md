# 111｜EAS Observe Dashboard

**翻页：**[上一页：设置 EAS Observe](./110-EAS-Observe-Get-Started.md) · [目录](./README.md) · [下一页：用 EAS CLI 查询 Observe 指标](./112-EAS-Observe-CLI.md)

**官方页面：**[EAS Observe dashboard](https://docs.expo.dev/eas/observe/dashboard/)

**版本边界：**Dashboard 是未版本化的 EAS 服务界面指南。当前项目 SDK 56 支持导言、启动 / Update 指标、SDK 56+ Events 与 Navigation 页；Errors 页面需要 SDK 57+ 及相关 preview 能力，不能据此推断当前 SDK 56 会显示错误上报数据。筛选器选项和图表可能随 EAS 页面版本调整。

## Dashboard 怎么组织指标

在 Expo 项目 EAS Dashboard 导航选择 **Observe**。页首摘要展示筛选条件下的 active users、releases、builds 与 updates 数量；点 **Show all** 可清除 release filter，回到聚合数据视图。

## 用筛选器限定比较范围

| 筛选器 | 可以选择什么 | 排查用途 |
| --- | --- | --- |
| Platform | Android 或 iOS | 判断问题是否只发生于一个移动平台。 |
| Environment | 例如 `production`、`preview` | 对比生产用户与内部预览的行为。默认显示全部环境。 |
| Time range | 1 小时、12 小时、1 / 3 / 7 / 14 / 21 / 30 / 60 天 | 把图表范围缩小到某个发布窗口。默认近 14 天。 |
| Release | App version、具体原生 build 或 OTA update | 定位一次发布前后性能变化。 |

筛选器会影响下方卡片中的 events、人数和统计值，所以比较 release 前后时应确认平台、环境和时间范围一致。

## 五类 Dashboard 页面

- **App startup：**cold / warm launch、bundle load、TTR、TTI 等启动性能。
- **EAS Update：**OTA 更新下载耗时与按 update 查看下载表现的列表。
- **Events：**SDK 56+ 支持查看 `Observe.logEvent` 上报的用户事件，以及 SDK / integration 发出的其他事件，并可点入事件详情。
- **Navigation：**SDK 56+ 按页面查看 cold / warm TTR 与 TTI。需要启用 Expo Router 或 React Navigation integration。
- **Errors：**处于 preview；JavaScript 错误需 SDK 57+，原生崩溃需 `expo-observe` 57.0.21+。SDK 56 项目不满足此页来源数据要求。

## 阅读统计卡片与长尾

每个指标卡片包含趋势图和统计值：

- **Median：**中位数，通常比平均值更能代表一般用户体验。
- **Average：**平均值；少数极慢会话会显著拉高它。
- **Min / Max：**当前范围最快与最慢样本。
- **P90 / P99：**90% / 99% 样本低于此值，可用来判断慢尾用户体验。

App startup 可以切换列表 / 网格布局；使用 **Show builds**、**Show updates** 控制图表上的发布标记，避免版本过多时图表拥挤。

## 用 Release marker 比较版本

每次发布原生 build 或 OTA update，图表会在发布时间显示 marker。时间接近的多个 marker 会聚合显示；点击 marker 可查看该次 release 的版本、build number 或 update ID、用户 / events 数与当时指标。未限定 release 时，App startup 卡片也会列出最新和上一 release 的比较值，可以较快发现性能回退。

## 调查某次 Session

从 Events 页面或 release marker 可进入单个 session 时间线。时间线按顺序列出启动指标、用户自定义事件与 EAS Update 下载事件，并显示平台、App 版本、build number、OS、时间戳及各类事件数。用它回答“哪个版本 / 设备 / 网络条件下变慢”比只看聚合中位数更有效。

同一 session 可在终端查看：

```sh
eas observe:session SESSION_ID
```

## Handoff to AI

页面顶部的 **Handoff to AI** 会将当前 Dashboard 状态整理为结构化 prompt，方便把同一筛选范围交给 AI 辅助分析，例如询问某个 release 为什么回退、哪些 routes 较慢。分享前要确认当前 Dashboard 内容可向所选工具提供。

## 关键名词

- **Release marker：**图表上的发布时间标记，可关联到 build 或 OTA update。
- **Percentile / 百分位：**P90 表示 90% 样本不高于该值，P99 用于观察更少数的极慢用户。
- **Session：**一次 App 使用过程中收集的一组按时间排列事件，可把启动、路由、用户事件和 Update 下载串在一起分析。
- **Handoff：**把当前工具页面筛选状态转成 prompt 的入口；它不替代原始性能数据，也不会自行修复应用。

## 官方代码主题覆盖

源页唯一明确的 CLI 示例是通过 `eas observe:session` 查看完整 session timeline，已在本页覆盖。其他内容是 Dashboard 的过滤器、指标图表和会话导航，没有额外源代码块。

## 下一页

官方页脚 **Next** 是 [Querying with EAS CLI](https://docs.expo.dev/eas/observe/eas-cli/)，系统介绍命令参数、指标名称、分页游标与常见查询组合。

**翻页：**[上一页：设置 EAS Observe](./110-EAS-Observe-Get-Started.md) · [返回目录](./README.md) · [下一页：用 EAS CLI 查询 Observe 指标](./112-EAS-Observe-CLI.md)
