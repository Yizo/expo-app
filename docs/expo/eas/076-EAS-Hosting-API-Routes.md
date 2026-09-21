# 076｜EAS Hosting API Routes Monitoring

**翻页：**[上一页：为 EAS Hosting 配置 Custom Domain](./075-EAS-Hosting-Custom-Domain.md) · [目录](./README.md) · [下一页：用 EAS Workflows 部署 Web](./077-EAS-Hosting-Workflows.md)

**官方页面：**[API Routes](https://docs.expo.dev/eas/hosting/api-routes/)

**版本边界：**本页专注 EAS Hosting Dashboard 对 Expo Router API Routes / Server Functions 的 observability。一般 route handlers 的编写方法应另看 Expo Router API Routes guide；Dashboard 能力会随 EAS 服务更新。

## Crash / Log / Request 看板

在 EAS Hosting Dashboard 可以检查：

| 数据 | 在哪里看 | 内容 |
| --- | --- | --- |
| Crashes | Hosting > Crashes | 请求处理时未捕获、导致无法返回响应的异常。相似 crash 会分组；详情显示 stack trace 和最早 / 最近 occurrence 的 metadata。 |
| Logs | 某个 deployment > Logs | Server functions / API routes 的 console.log、console.info、console.error 等输出。 |
| Requests | 项目 Hosting > Requests，或某 deployment > Requests | 所有服务请求的 metadata，例如 HTTP status、browser、region、duration。 |

例如 route handler 抛出未捕获 Error("Request failed") 且没有 catch / 返回 response，会计入 crash。日志可以提供额外 context，request list 可按 deployment 定位一条具体请求。

## 用 Request ID 查某次请求

所有响应 header 都包含 Cloudflare Cf-Ray header，形如 8ffb63895cf6779b-LHR。前面的部分是 request ID，可复制到 EAS Hosting > Requests 的过滤器中查找；该 ID 也可能显示在服务级错误页面上。

## 采样行为

Deployment 流量很高时，EAS Hosting 会对详细 telemetry downsample，因而 dashboard 不一定逐条列出每个 request / log / crash。汇总统计会做比例估算，仍用于近似反映全部请求量与 crash 数量。

## 关键名词

- **API Route：**应用内提供 HTTP handler 的服务端路由；EAS Hosting server output mode 可托管。
- **Uncaught Error：**没有被代码处理、阻止 handler 返回响应的异常。
- **Request ID / Cf-Ray：**Cloudflare 为 request 加入的 correlation 标识，可用于查询对应 telemetry。
- **Downsampling：**高流量下减少保存的单条事件数量，再按统计方法估算整体 count。

## 官方代码主题覆盖

源页没有代码块；文字涉及的唯一错误示例是未捕获异常 throw，本页已说明它如何出现在 crash list。Dashboard Logs、Requests、Cf-Ray ID 查询与 high-volume sampling 均已概括。

## 下一页

官方页脚 **Next** 是 [Web deployments with EAS Workflows](https://docs.expo.dev/eas/hosting/workflows/)，将生产部署与 PR Preview URL / comment 自动化。

**翻页：**[上一页：为 EAS Hosting 配置 Custom Domain](./075-EAS-Hosting-Custom-Domain.md) · [返回目录](./README.md) · [下一页：用 EAS Workflows 部署 Web](./077-EAS-Hosting-Workflows.md)
