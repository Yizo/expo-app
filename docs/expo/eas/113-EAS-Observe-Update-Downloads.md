# 113｜EAS Update 下载性能

**翻页：**[上一页：用 EAS CLI 查询 Observe 指标](./112-EAS-Observe-CLI.md) · [目录](./README.md) · [下一页：记录自定义 Events](./114-EAS-Observe-User-Events.md)

**官方页面：**[EAS Update download performance](https://docs.expo.dev/eas/observe/eas-update/)

**版本边界：**本页是未版本化的 EAS Observe 服务说明。SDK v56.0.0 `expo-observe` 参考包含 Update download metrics；当 App 安装并启用 `expo-updates` 与匹配版本 `expo-observe` 后，Observe 自动采集每次远程 Update 下载耗时。它不需要为下载时长再添加自己的 instrumentation。

## 采集与入口

只要应用使用 EAS Update，并且 binary 包含 `expo-observe`，每次客户端 fetch update 时都会记录真实设备下载耗时。Observe Dashboard 的 **EAS Update** 页面有两个部分：所有更新的聚合曲线和逐 update 表格；同一指标也能用 EAS CLI 查询。

## 聚合下载时间曲线

曲线在所选时间范围汇总全部 update 下载，提供 median、平均值、min、max、P90、P99。用中位数 / 百分位查看典型与慢尾体验；如果数值突然上升，可能是 bundle 变大或 CDN 网络变慢，需要结合 release marker 查看对应更新。

曲线中的 marker 表示某个 update 首次被设备下载的时间；点击可看到 update ID、App version 与当时的统计指标。

## Recent updates 表格

| 列 | 表示什么 |
| --- | --- |
| Update | update ID 与发布 message。 |
| Downloads | 下载该 update 的唯一设备数。 |
| Median download | 该 update 的下载耗时中位数；条形长度相对当前表格里最慢 update。 |
| P90 | 此次 update 下载耗时的第 90 百分位。 |
| First downloaded | 第一台设备拉取该 update 的时间。 |

表格可按 Downloads、Median download、P90、First downloaded 升序或降序排序。打开一行可检查该 update 的单个下载事件。

## 用 EAS CLI 查询

按 App version 观察 update_download 汇总，或提取具体最慢的下载样本：

```sh
# 按 App version 汇总 Update 下载耗时
eas observe:metrics-summary --metric update_download

# 列出最慢的单次下载
eas observe:metrics update_download --sort slowest
```

时间范围、平台、App version、update ID 等其他筛选通过 `--help` 查看：

```sh
eas observe:metrics-summary --help
eas observe:metrics --help
```

## 关键名词

- **Update download time：**App 从 EAS Update 拉取可用更新所花的时间，是实际用户网络下的测量值。
- **Update ID：**单个 update 的标识，可用于在 EAS Dashboard / CLI 过滤版本表现。
- **Aggregate chart：**跨时间范围聚合各次 update 下载，适合发现趋势或发布后回归。
- **Unique device：**按安装实例计数的一台设备；Downloads 不等于累计请求次数。
- **P90 / P99：**用于观察慢尾用户体验。平均值与中位数可能掩盖少数网络很慢的设备。

## 官方代码主题覆盖

源页的 CLI 代码示例全部覆盖：按 App version 聚合的 `eas observe:metrics-summary --metric update_download`；单次慢下载排序的 `eas observe:metrics update_download --sort slowest`；以及查询可用参数的两个 `--help` 命令。页面其余为 Dashboard 表格 / 图表说明，没有 JS 代码示例。

## 下一页

官方页脚 **Next** 是 [User-defined events](https://docs.expo.dev/eas/observe/events/)，介绍用稳定事件名、属性、severity 与 body 记录产品自定义信号。

**翻页：**[上一页：用 EAS CLI 查询 Observe 指标](./112-EAS-Observe-CLI.md) · [返回目录](./README.md) · [下一页：记录自定义 Events](./114-EAS-Observe-User-Events.md)
