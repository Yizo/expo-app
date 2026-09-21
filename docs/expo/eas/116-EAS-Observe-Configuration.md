# 116｜配置 EAS Observe

**翻页：**[上一页：EAS Observe 错误报告](./115-EAS-Observe-Errors.md) · [目录](./README.md) · [下一页：Expo Router 性能 Integration](./117-EAS-Observe-Expo-Router.md)

**官方页面：**[Configure EAS Observe](https://docs.expo.dev/eas/observe/configuration/)

**版本边界：**本页是当前未版本化的配置指南。Expo SDK v56.0.0 的 Observe 参考确认 `sampleRate`、`dispatchInDebug`、`dispatchingEnabled`、`environment`、`integrations` 等配置；SDK 58+ 才支持 Network Traces。`endpointUrl` 在本页作为 app config 原生配置项介绍，但 v56 SDK Observe API 页未列该字段，SDK 56 项目需要按安装的 expo-observe 包与当前 EAS 配置指南核实；修改原生配置须重建 App。

## 采样：只向服务端发送部分安装实例

默认每个安装实例都会派发指标。流量很大的项目可以使用 `sampleRate` 只发送一部分安装实例，例如 0.25 表示约四分之一设备：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  sampleRate: 0.25,
});
```

选择按 installation 固定：同一设备每次启动仍属于同一采样组，而不是每个 session 随机一次。取值范围是 0–1，范围外会 clamp 到最近边界；0 不发、1 全发。Out-of-sample 安装的待发指标会直接丢弃，不积累等待后续提高比例再上传。`dispatchingEnabled: false` 会关闭所有派发，即使 `sampleRate` 大于零也不会送出。

## 测试 Development Build 的指标派发

Debug build 默认不派发指标。临时验证 Observe 接入时，可以开 `dispatchInDebug`：

```ts
Observe.configure({
  dispatchInDebug: true,
});
```

是否为 debug build 由原生 build 类型或 JS bundle 的 `__DEV__ === true` 决定，和 `environment` 标签相互独立。Release build 会派发（仍受 `dispatchingEnabled` / `sampleRate` 影响）。Debug 下启动速度与生产不同，测试结束时应移除 debug 派发，避免把不代表真实用户的数据加到生产分析里。

上面的配置选项应并入单个 `Observe.configure()` 对象，避免重复调用后将先前完整配置替换掉。

## 自定义 OpenTelemetry Endpoint

EAS Observe 使用 OTLP/HTTP JSON 格式。默认 endpoint 面向 Expo EAS；可在 app config 指定自建 OpenTelemetry-compatible 服务或 Collector：

```json
{
  "expo": {
    "extra": {
      "eas": {
        "observe": {
          "endpointUrl": "https://otel.example.com"
        }
      }
    }
  }
}
```

请求会加上 EAS project ID 与 OTLP resource 路径，例如：

```text
https://otel.example.com/PROJECT_ID/v1/metrics
https://otel.example.com/PROJECT_ID/v1/logs
```

如果目标后端只收不带 project ID 前缀的标准 `/v1/metrics`、`/v1/logs`，可先发往 OpenTelemetry Collector，再由 Collector 转发。`endpointUrl` 烘焙进 App 原生层，app config 修改后需要运行 `npx expo prebuild` 并创建新 build；现有用户安装包不会立即改走新 endpoint。

## 用 Environment 区分指标

所有 metrics 都带 environment 标签。默认值从 `process.env.NODE_ENV` 获取，未定义时回退 `production`；可在同一个 `Observe.configure()` 设置自定义 `environment`，例如 preview / staging / production。

该值是每条 metric 的 metadata，**不**决定当前 bundle 是 debug 还是 release。要控制 debug 指标派发，应使用 `dispatchInDebug`。

## Network Traces：仅 SDK 58+

Network traces 把已完成的网络请求记为 trace spans，默认关闭；每个 span 都会占用服务额度。Expo 当前页面要求 SDK 58 或更高，Expo SDK 56 项目不能照抄使用。

SDK 58+ 可全部采集：

```ts
Observe.configure({ networkTraces: true });
```

也可按 host / HTTP method 过滤：

```ts
Observe.configure({
  networkTraces: {
    filter: {
      hosts: ['api.example.com'],
      methods: ['GET', 'POST'],
    },
  },
});
```

过滤规则：host 必须完全匹配、忽略大小写；`api.example.com` 不会自动包含 `v2.api.example.com`。省略字段表示匹配所有值；传空数组表示不匹配任何值。对象形式的过滤默认启用记录，设置 `enabled: false` 可保留筛选配置但暂不采集。

关掉或过滤掉的 request 不写入本地数据库，也不会导出；设置应用于未来请求，之前本次启动已记录的 trace 仍会派发。该设置会跨启动保存，因此下次启动在 `configure()` 运行前发生的请求仍按上一次配置。

Network trace URL 会隐藏 URL 内的 username / password，以及 query keys `AWSAccessKeyId`、`Signature`、`sig`、`X-Amz-Signature`、`X-Amz-Credential`、`X-Amz-Security-Token`、`X-Goog-Signature`。其他未列出的 query 参数将原样保存；不要把 secret 放入 URL query，并按 SDK 版本文档核对隐私策略。

## 在 Dashboard 暂停数据接收

除客户端配置外，也可以从 EAS Dashboard 暂停 server ingestion，不需先发 App 更新：

- **Account level：**Account Settings 关闭 Observe data ingestion，暂停该账户所有项目。
- **Project level：**Project Settings 关闭 ingestion，只暂停当前项目。

暂停时服务端拒收 App 的 events、metrics 和 logs；此前已经入库的数据仍可在 Dashboard / CLI 查询。再次开启 ingestion 后恢复接收。

## 关键名词

- **Sample rate：**采集数据向服务端派发的 installation 比例；决定设备是否进入采样组，不是每条事件抽样概率。
- **dispatchingEnabled：**全局控制是否将本地 Observe 数据上传。
- **Debug build：**原生 build 调试模式或 JS 开发 bundle (`__DEV__`)；它和 environment label 是独立维度。
- **OTLP：**OpenTelemetry Protocol；EAS Observe 用 HTTP JSON 形式发送 metrics 与 logs。
- **Collector：**接收 OTLP 后再做处理 / 路由的 OpenTelemetry 组件，可转发到路径结构不同的后端。
- **Network trace：**某一次网络请求的链路记录。因为它按请求产生 span，启用后会增加 event 用量。
- **Data ingestion：**服务端接收并保存客户端派发数据的入口；关闭后停止新数据入库，但不删除历史数据。

## 官方代码主题覆盖

源页代码主题全部覆盖：`sampleRate` 配置与 25% 采样；`dispatchInDebug`；`extra.eas.observe.endpointUrl` 的 app config 与两个 OTLP path；SDK58+ `networkTraces: true` 与 host / method filter 对象；sample rate / debug 配置与全局 enable 的关系；Environment 行为；Dashboard account/project ingestion switch。Network trace 样例明示 SDK58+，不是 SDK56 示例。

## 下一页

官方页脚 **Next** 是 [Expo Router integration](https://docs.expo.dev/eas/observe/integrations/expo-router/)，介绍如何按路由记录冷 / 热首帧与页面交互耗时。

**翻页：**[上一页：EAS Observe 错误报告](./115-EAS-Observe-Errors.md) · [返回目录](./README.md) · [下一页：Expo Router 性能 Integration](./117-EAS-Observe-Expo-Router.md)
