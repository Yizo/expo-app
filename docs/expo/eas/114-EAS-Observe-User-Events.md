# 114｜在 EAS Observe 记录自定义 Events

**翻页：**[上一页：EAS Update 下载性能](./113-EAS-Observe-Update-Downloads.md) · [目录](./README.md) · [下一页：EAS Observe 错误报告](./115-EAS-Observe-Errors.md)

**官方页面：**[User-defined events](https://docs.expo.dev/eas/observe/events/)

**版本边界：**这是未版本化的 Observe 指南。SDK v56.0.0 的 expo-observe 参考推荐 `expo-observe ~56.0.29`，并支持 `Observe.logEvent(name, { attributes, body, severity })`。当前事件指南还介绍 `displayName`；该字段没有出现在 SDK v56 的 `LogEventOptions` 中，所以仅标注为当前 unversioned 页面能力，不把它放进 SDK 56 可直接复制示例。

## 自定义事件是什么

当 TTR、TTI、启动、更新下载等内建指标不能描述产品事件时，可使用 `Observe.logEvent()` 记录一个有名称的事件，例如完成 onboarding 或导出报表。事件先持久化在设备上，按批次在下一次 flush 时作为 OpenTelemetry log record 发送。Dashboard 的 Events 页与 EAS CLI 都能查询。

## 记录事件名

第一个参数是事件名。建议使用小写、稳定、点号分隔的 ID；Dashboard 按**完全相同的名字**分组：

```ts
import { Observe } from 'expo-observe';

function handleOnboardingComplete() {
  Observe.logEvent('onboarding.completed');
}
```

`report_exported` 与 `report.exported` 会当成两个不同事件，因此团队应选一个命名词汇并保持一致。

## 附加结构化属性

用 `attributes` 携带事件上下文，例如导出格式、行数、持续时间和过滤条件：

```ts
Observe.logEvent('report.exported', {
  attributes: {
    format: 'csv',
    rowCount: 1248,
    durationMs: 532,
    filters: ['status:active', 'region:us-west'],
  },
});
```

SDK v56 允许字符串、数字、布尔值、数组和嵌套对象。其他 JS 值如 `Date`、`undefined`、函数不在受支持类型中，可能被丢弃。只发送有分析价值的上下文，不把个人可识别信息放进 key 或 value。

## 使用 Severity 区分重要程度

默认 severity 是 `info`；可把可恢复的警告或失败事件标成其他级别：

```ts
Observe.logEvent('sync.failed', {
  severity: 'error',
  attributes: { reason: 'network_timeout' },
});
```

从轻到重的类型是 `trace`、`debug`、`info`、`warn`、`error`、`fatal`。例如 `trace` 用于精细排查，`warn` 表示有异常但可以恢复，`fatal` 表示严重错误并可能导致应用退出。

## 搭配自由文本 Body

`body` 用于补充一句人类可读说明，`attributes` 保留方便过滤的结构化信息：

```ts
Observe.logEvent('cache.evicted', {
  body: '磁盘空间压力超过设定阈值，清除了部分缓存。',
  severity: 'warn',
  attributes: {
    evictedItemCount: 42,
    freedBytes: 1048576,
  },
});
```

如果同一问题要做分组统计，优先将稳定信息放入属性；不要把每个请求 ID 都拼进事件名，否则 Dashboard 会出现大量彼此不同的名称。

## 使用 Display Name 的版本差异

当前未版本化事件页提供 `displayName`，例如把机器名 `onboarding.completed` 显示为更好读的 **Onboarding completed**；该 label 仅用于 session timeline。示例按当前指南形态如下：

```ts
Observe.logEvent('onboarding.completed', {
  displayName: 'Onboarding completed',
});
```

但 SDK v56.0.0 的 `LogEventOptions` 只列出 `attributes`、`body`、`severity`。因此本地 SDK 56 代码不要依赖这个字段；需要它时先升级并按目标 SDK 版本文档核对类型和行为。

## 保留事件命名空间与隐私边界

SDK 使用 `expo.` 前缀作为内部事件命名空间，例如 iOS 收到低内存提醒时记录 `expo.memory.warning`。`expo-image` integration 也可能记录 `expo-image.oversized`。应用不要使用 `expo.` 起始的自定义 event name，也不要使用该命名空间的 attribute key；当前文档说明这些输入会被丢弃并在开发模式警告。

事件名、属性名和属性值最终都会显示在 Dashboard 并离开设备发往服务端。避免把 email、token、手机号、姓名、用户输入原文等个人信息写入事件。可以传不含身份的信息，如格式、耗时区间、错误类别或布尔状态。

## 查看事件

Dashboard 的 **Observe > Events** 默认按时间范围列出不同事件名及次数。点某个名称可查看每次事件的时间戳、attributes、所属 session。

对应 CLI 示例：

```sh
# 列出可用事件名和数量
eas observe:events

# 展开指定事件的单条记录
eas observe:events report.exported

# JSON 形式读取所有事件名的事件
eas observe:events --all-events --json
```

用 `eas observe:events --help` 查看当前 CLI 的时间范围、平台、session ID 等筛选参数。

## 关键名词

- **User-defined event：**应用主动记录的具名产品 / 性能事件，不同于 EAS Observe 自动产生的启动指标。
- **OpenTelemetry log record：**EAS Observe 对事件采用的结构化日志表示；事件本地批量保存并在 flush 时派发。
- **Attributes：**可用于查询 / 分组的结构化 key-value 上下文，值保持原始类型。
- **Severity：**事件严重等级，用于区分追踪信息、正常事件、可恢复警告和严重失败。
- **Body：**供人阅读的自由文本补充信息；不要代替可过滤的结构化字段。
- **Display name：**Dashboard session timeline 中显示的易读名称；当前页面示例包含此功能，但 SDK v56 类型参考没有该选项。

## 官方代码主题覆盖

源页代码主题全部覆盖：基础 `Observe.logEvent`；附带 attributes；severity 和默认 info；body 与 severity 同时使用；`displayName` current docs 示例及其 SDK v56 类型差异；三类 `eas observe:events` 查询：列出名称、读取具体事件、JSON 展开所有事件。个人信息禁区、SDK reserved prefix 与 Dashboard 视图均有说明。

## 下一页

官方页脚 **Next** 是 [Error reporting](https://docs.expo.dev/eas/observe/errors/)，说明 JavaScript 错误、React render 错误与 native crash 的采集及 Dashboard 排查；该页面声明 SDK 57+ preview 能力。

**翻页：**[上一页：EAS Update 下载性能](./113-EAS-Observe-Update-Downloads.md) · [返回目录](./README.md) · [下一页：EAS Observe 错误报告](./115-EAS-Observe-Errors.md)
