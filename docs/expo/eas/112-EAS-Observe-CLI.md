# 112｜用 EAS CLI 查询 Observe 指标

**翻页：**[上一页：EAS Observe Dashboard](./111-EAS-Observe-Dashboard.md) · [目录](./README.md) · [下一页：EAS Update 下载性能](./113-EAS-Observe-Update-Downloads.md)

**官方页面：**[Querying with EAS CLI](https://docs.expo.dev/eas/observe/eas-cli/)

**版本边界：**EAS CLI 查询接口由服务 / CLI 更新，不锁在 SDK 56。Expo SDK 56 的启动指标可直接查询；route 指标需 SDK 56+ 并安装 Expo Router 或 React Navigation integration。若 CLI 参数与本文不同，以安装版本的 `--help` 为准。项目的 expo-observe API 以 [SDK v56.0.0 参考](https://docs.expo.dev/versions/v56.0.0/sdk/observe/)为准。

## 查询前准备

需要安装并登录 EAS CLI，应用已接入 EAS Observe 且建过带 `expo-observe` 的 build。进入项目目录后，命令默认从 app config 读取 EAS project ID；从其他目录查询可传 `--project-id`，但登录用户必须有权访问目标 project。

```sh
eas login
eas observe:metrics-summary --project-id PROJECT_ID
```

任何命令都可加 `--help` 查看当前安装版可用参数。部分查询需要账户计划支持；额度不足时 CLI 会显示升级信息。没有指定时间范围时默认看最近 60 天。

## 所有命令通用的筛选项

| 参数 | 作用 |
| --- | --- |
| `--platform android` / `--platform ios` | 按平台过滤。默认包括两平台；`observe:session` 不接受此参数，因为它只查询一个 session。 |
| `--days N` | 查询最近 N 天。 |
| `--start ISO_DATE` 与 `--end ISO_DATE` | 指定时间范围；两者与 `--days` 互斥。 |
| `--project-id ID` | 从当前目录之外查询一个 project。 |
| `--json` | 输出机器可读 JSON；同时启用 non-interactive。 |
| `--non-interactive` | 无法确定选择项时直接失败，不启动交互式 picker。 |

## 指标名称

App 启动与 Update 下载指标由 SDK 自动采集：

| CLI metric 名 | 含义 |
| --- | --- |
| `tti` | Time to Interactive。 |
| `ttr` | Time to First Render。 |
| `cold_launch` | 冷启动耗时。 |
| `warm_launch` | 热启动耗时。 |
| `bundle_load` | JavaScript bundle 加载耗时。 |
| `update_download` | EAS Update 下载耗时。 |

SDK 56+ 加导航 integration 后还可查 per-route 指标：

| CLI metric 名 | 含义 |
| --- | --- |
| `nav_cold_ttr` | 页面首次出现时间。 |
| `nav_warm_ttr` | 页面再次呈现时间。 |
| `nav_tti` | 路由页面变为可交互的时间。 |

`observe:metrics` 与 `observe:metrics-summary` 支持上述九个指标；`observe:routes` 只支持三个 `nav_*` 指标。

## 汇总统计：metrics-summary

按 App version 分组汇总指标，可比较 release 的 median / percentiles。官方示例的等价查询：

```sh
# 所有指标，默认近 60 天、双平台
eas observe:metrics-summary

# 近 14 天 iOS TTI
eas observe:metrics-summary --metric tti --days 14 --platform ios

# 一次查询多个指标，每个指标一个表
eas observe:metrics-summary --metric tti --metric cold_launch

# 只显示 median 和 p90
eas observe:metrics-summary --metric tti --stat median --stat p90
```

参数说明：

- `--metric NAME`：指定要汇总的指标，可重复。
- `--stat NAME`：指定展示统计值，可重复。支持 `min`、`median`、`max`、`average`、`p80`、`p90`、`p99`、`eventCount`。
- 默认显示 median 与 eventCount，可能合并成一格，如 `0.45s (150)`。
- App version 列也会显示 build number。为减少表格宽度，默认省略 update ID；使用 `--json` 会在版本记录里带出 ID 数组。

## 单次指标样本：metrics

`observe:metrics` 返回单个事件样本，不是聚合。可以筛选最慢 / 最新数据，继续用 session ID 追查：

```sh
# 最近一周最慢的 20 个 TTI 样本
eas observe:metrics tti --sort slowest --days 7 --limit 20

# 限定某个 App version
eas observe:metrics tti --app-version 1.2.0

# 根据上一次响应的 endCursor 翻到下一页
eas observe:metrics tti --after CURSOR
```

metric 是必需的位置参数。交互式 shell 里省略时 CLI 会提示选择；non-interactive 必须显式给出。其他参数：

- `--sort`：`oldest`（默认）、`newest`、`slowest`、`fastest`。
- `--limit`：每页样本数，默认 10，最大 100。
- `--after CURSOR`：用上次结果的 `endCursor` 读取下一页。
- `--app-version VERSION`、`--update-id ID`：限定 release。
- JSON 结果还会含 `sessionId`、`easClientId` 和自定义样本参数。

若仍有结果，CLI 会提示下一页命令需要的游标。

## 按路线查看导航指标：routes

前提是 SDK 56+ 并配置了 Expo Router 或 React Navigation integration。它按 route name 汇总，Android / iOS 分开列出：

```sh
# 近 7 天全部路线导航指标
eas observe:routes --days 7

# 每个路由的 TTI 中位数与 p90
eas observe:routes --metric nav_tti --stat median --stat p90

# 只查询指定路由
eas observe:routes --route-name /home --route-name /checkout
```

参数：`--metric` 接受 `nav_cold_ttr`、`nav_warm_ttr`、`nav_tti`，可重复，默认全选；`--stat` 接受 `median`、`p90`、`count`；`--route-name` 可重复；还可用 `--app-version`、`--build-number`、`--update-id` 限定 release。每页默认 50 个 routes，最多 200；`--after CURSOR` 分页。路由路径使用结构化模式，例如 `/(tabs)/sessions/[sessionId]`，不同 sessionId 会聚合在相同 route 下；每个平台分别分页。

## 检查一个 Session 完整时间线

如果单个样本显示某次启动很慢，可用完整 session 看该次运行期间按顺序发生了什么：

```sh
# 已知 session ID
eas observe:session SESSION_ID

# 从最近一周最慢 TTI 事件中交互选择 session
eas observe:session --event-name tti --sort slowest --days 7
```

session ID 是位置参数。交互式模式允许省略并从候选项选择；non-interactive（包括 `--json`）必须提供 ID。`--event-name` 可用 `tti` 或用户事件名等筛选候选；`--sort` 接受 `slowest`、`fastest`、`newest`、`oldest`。

筛候选的 `--event-name`、`--sort`、`--days`、`--start`、`--end` 不能和已知 session ID 同时使用：前者用于“找一条 session”，给了 ID 则直接查看该会话。`observe:metrics` 与 `observe:events` 的 JSON 也会返回 session ID。

## 查询自定义 / SDK 事件：events

这个命令列出 `Observe.logEvent()` 自定义事件，也包含 SDK 与 integration 发出的事件，例如 `expo.memory.warning`、`expo-image.oversized`：

```sh
# 先查看事件名称与数量
eas observe:events

# 取某个事件的样本
eas observe:events report.exported --limit 50

# 查询一周内所有名称的事件
eas observe:events --all-events --days 7

# 查某一个 session 中的事件
eas observe:events --all-events --session-id SESSION_ID
```

无参数时显示事件名和次数；输入没有样本的事件名时，会列出同时间范围的可用名称，帮助发现拼写错误。`--all-events` 不能与具体事件名称一起用；还可用 `--session-id`、`--app-version`、`--update-id`、`--limit`、`--after` 做筛选与分页。需要同时看 metrics / logs 全序列时改用 `observe:session`。

## 列出版本：versions

`observe:versions` 可先查到过滤其他命令需要的 App version、build number 和 update ID：

```sh
# 默认双平台、最近 60 天
eas observe:versions

# 近 14 天 iOS
eas observe:versions --days 14 --platform ios
```

表格含 version、首次观测时间、events、users、builds、updates。JSON 会返回完整层级，并把对应 EAS Build / Update 细节嵌套在 version 下面。

## 常见排查工作流

| 目的 | 命令 |
| --- | --- |
| 对比近一周当前 / 历史 release 的启动表现 | `eas observe:metrics-summary --days 7 --stat median --stat p90` |
| 找出近一周最慢 launch | `eas observe:metrics tti --sort slowest --days 7 --json`，再用返回的 ID 查看 `eas observe:session SESSION_ID` |
| 看哪些 route 变得难以交互 | `eas observe:routes --metric nav_tti --stat median --stat p90 --days 7` |
| 检查 OTA Update 下载 | `eas observe:metrics-summary --metric update_download --days 7` |
| 在脚本 / CI 中机器读取 TTI | `eas observe:metrics-summary --metric tti --json --non-interactive` |

## 关键名词

- **Cursor / `endCursor`：**分页位置标记；取下一页时把上一响应给出的 cursor 传给 `--after`。
- **Percentile：**P90 / P99 表示 90% / 99% 的采样值低于该点，用来观察慢尾，而不是只看平均数。
- **Metric sample：**单次性能事件。`metrics` 查样本；`metrics-summary` 做聚合；`session` 串起同一次运行的全部事件。
- **Route pattern：**页面路径模板，如 `/sessions/[sessionId]`；不同参数值仍合并为一个 route。
- **Non-interactive：**不能弹出终端选择器的执行模式，适合 CI；参数缺失时失败而不是等待人工选择。

## 官方代码主题覆盖

源页代码示例与参数主题全部覆盖：`--project-id`、`eas login`、`--help`；所有通用平台 / 时间 / JSON 参数；九种 metric names；`metrics-summary` 的默认、多指标、统计值；`metrics` 的 slowest、App version、游标分页；`routes` 的天数、路由指标 / 统计值 / route filter；`session` 的已知 ID与交互筛选；`events` 的事件名、all-events、session filter；`versions` 按平台 / 天数过滤；五种 common workflows。本文示例参数如 PROJECT_ID、CURSOR 是占位符，不是可用真实项目标识。

## 下一页

官方页脚 **Next** 是 [EAS Update download performance](https://docs.expo.dev/eas/observe/eas-update/)，说明如何从 Dashboard 的图表和 per-update 表格查看真实设备上的 OTA 下载表现。

**翻页：**[上一页：EAS Observe Dashboard](./111-EAS-Observe-Dashboard.md) · [返回目录](./README.md) · [下一页：EAS Update 下载性能](./113-EAS-Observe-Update-Downloads.md)
