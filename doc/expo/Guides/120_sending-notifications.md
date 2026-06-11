# 使用 Expo Push Service 发送通知

> 对应原文：<https://docs.expo.dev/push-notifications/sending-notifications.md>

## 文档解决的问题

客户端通过 `expo-notifications` 获取 `ExpoPushToken` 后，服务器如何调用 Expo Push API，把消息交给 FCM 或 APNs，并可靠地处理限流、临时失败、票据、回执和无效 token，是本页的核心。

如果直接连接 FCM/APNs，可以获得更细粒度控制和完整平台能力，但实现复杂度更高。本页只讲 Expo Push Service。

## 整体发送链路

1. 应用调用 `getExpoPushTokenAsync` 获得 `ExpoPushToken`，并上传到业务服务器。
2. 服务器向 Expo Push API 发送 HTTPS POST 请求。
3. Expo 接收并排队，把通知继续发送给 Android 的 FCM 或 iOS 的 APNs。
4. Expo 先返回 push ticket，表示请求是否被 Expo 接收。
5. 服务器稍后使用 ticket ID 查询 push receipt，确认 Expo 向 FCM/APNs 的交付结果。
6. FCM/APNs 再按各自策略向设备投递。

关键边界：ticket 成功不等于用户收到；receipt 成功也只表示 FCM/APNs 接收了消息，不保证设备最终展示。

## 服务端实现方式

可以使用带数据库的后端、命令行工具，甚至直接从应用发送。原文列出多种 Expo Push API 封装：Node.js 官方 SDK，以及 Python、Ruby、Rust、Symfony、PHP、Golang、Elixir、dotnet、Java、Laravel 等社区实现。

Node.js 项目可优先考虑 `expo-server-sdk-node`。它会自动限制并发、gzip 压缩请求、平滑负载，并处理部分限流和指数退避逻辑。

## 可靠发送的必要措施

### 限制并发连接

大量发送时不要无限并发。Node SDK 最多打开 6 个并发连接，以降低瞬时峰值并提高 Expo 服务接收请求的成功率。

### 对临时错误指数退避

把通知送到 Expo 队列这一步可能因网络、Expo 服务中断、凭据错误或 payload 无效而失败。

- 网络错误、HTTP `429` 和 HTTP `5xx` 通常可能是临时故障，应等待数秒后重试，并逐次延长等待时间。
- HTTP `400`、无凭据、payload 格式错误、单次请求混入不同项目等问题不会靠重试自行恢复，应先修正输入或配置。

### 必须检查 push receipt

Expo 成功接收消息后返回 push ticket，其中的 ID 用于查询 push receipt。receipt 是发现 FCM/APNs、Expo 服务、凭据或 payload 错误的主要依据。

原文建议发送后约 15 分钟检查回执。回执通常更早出现，但 15 分钟能留出较充足的处理时间；15 分钟后仍没有回执，可能表示 Expo Push Service 出现问题。回执会在 24 小时后清除。

如果回执返回 `DeviceNotRegistered`，应停止向该 token 发送，直到设备再次向服务器注册。卸载后何时被 Google/Apple 判定为未注册没有确定时间，因此很难通过“刚卸载就立即发送”稳定复现。

### 服务没有 SLA

Expo Push Service 没有 SLA，FCM 与 APNs 也可能中断。可靠性依赖限流、重试和回执处理，而不是假定链路永不失败。

## HTTP/2 API

发送端点：

```text
POST https://exp.host/--/api/v2/push/send
```

请求头：

```text
host: exp.host
accept: application/json
accept-encoding: gzip, deflate
content-type: application/json
```

最小请求：

```sh
curl -H "Content-Type: application/json" \
  -X POST "https://exp.host/--/api/v2/push/send" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "title": "hello",
    "body": "world"
  }'
```

请求体可以是单个消息对象，也可以是最多 100 个消息对象的数组，但同一请求中的消息必须属于同一项目。批量发送时推荐使用数组减少请求次数。服务还接受 gzip 压缩的请求体。

## Push ticket

响应对象可包含 `data` 和 `errors`：

- 单条消息成功时，ticket 的 `status` 为 `ok`，并带有用于查询回执的 `id`。
- 某条消息失败时，对应 ticket 的 `status` 为 `error`，并包含 `message` 和 `details`。
- 整个请求失败时，HTTP 状态为 4xx/5xx，并在 `errors` 数组中描述请求级错误。
- 整个请求有效时通常返回 HTTP 200，但仍需逐条检查 ticket。

`status: ok` 和 receipt ID 仅表示 Expo 服务器接收了消息。

## Push receipt

查询端点：

```text
POST https://exp.host/--/api/v2/push/getReceipts
```

请求体：

```json
{
  "ids": [
    "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY"
  ]
}
```

响应中的 `data` 是 receipt ID 到回执对象的映射。如果某个 ID 还没有回执，它会直接从映射中缺失。每个回执包含 `status`，失败时还会包含 `message` 和 `details`。

即使回执为 `ok`，也只说明 FCM/APNs 接收了消息。例如设备关机时，平台服务可能稍后再尝试投递，设备并不一定最终收到。

## 常见错误与处理

### 单条 ticket/receipt 错误

- `DeviceNotRegistered`：设备不再可接收，应停止向该 Expo push token 发送。
- `MessageTooBig`：Android 和 iOS 的总 payload 都必须不超过 4096 字节。
- `MessageRateExceeded`：向同一设备发送过于频繁，应指数退避后慢速重试。
- `MismatchSenderId`：FCM 服务账号凭据与 `google-services.json` 的 sender ID 不一致；应核对 EAS 中 FCM V1 service account key 与文件中的 `project_number`。
- `InvalidCredentials`：推送凭据无效或已撤销。Android 应重新检查 FCM V1 凭据；iOS 可通过 `eas credentials` 重新生成。若出现 `InvalidProviderToken`，问题可能同时涉及 APNs key 和 provisioning profile，需要重新构建并生成新的 push key 与描述文件。

撤销一个 APNs key 会影响所有依赖该 key 的应用，直到上传替代 key。更换 APNs key 不会改变用户已有的 Expo Push Token。

### 请求级错误

- `TOO_MANY_REQUESTS`：每个项目超过每秒 600 条通知，应在服务端限流。
- `PUSH_TOO_MANY_EXPERIENCE_IDS`：同一请求混入不同 Expo experience/项目的 token。
- `PUSH_TOO_MANY_NOTIFICATIONS`：单次请求超过 100 条通知。
- `PUSH_TOO_MANY_RECEIPTS`：单次回执查询超过 1000 个 ticket ID。
- `UNAUTHORIZED`：启用增强推送安全后，请求没有有效 access token。

## 可选的增强安全

默认情况下，知道 Expo Push Token 的一方即可尝试发送消息。如果 token 泄露，攻击者可能冒充服务器。可在 EAS Dashboard 开启 access token 校验。

启用后：

- `expo-server-sdk-node` 至少升级到 `v3.6.0`，并在构造函数传入 `accessToken`。
- 直接调用 API 时添加 `Authorization: Bearer ${accessToken}`。
- 缺少有效 token 的请求返回 `UNAUTHORIZED`。

## 消息字段

只有 `to` 必填。

| 字段 | 平台 | 作用与限制 |
| --- | --- | --- |
| `to` | Android、iOS | 单个 Expo push token 或 token 数组。 |
| `_contentAvailable` | iOS | 为 `true` 时尝试在后台启动应用执行任务；应用必须先配置后台通知。 |
| `data` | Android、iOS | 传给应用的 JSON；总 payload 必须不超过约 4 KiB。 |
| `title`、`body` | Android、iOS | 展示标题和正文。 |
| `ttl` | Android、iOS | 未送达时可保留重试的秒数；默认使用平台默认值，FCM/APNs 均为 1 个月。 |
| `expiration` | Android、iOS | Unix 时间戳形式的过期时间；与 `ttl` 同效，二者同时存在时 `ttl` 优先。 |
| `priority` | Android、iOS | `default`、`normal` 或 `high`；默认映射为 Android normal、iOS high。 |
| `subtitle` | iOS | 标题下方的副标题。 |
| `sound` | iOS | `default` 播放默认声音；省略则无声音。自定义声音需先通过配置插件加入，并包含扩展名。 |
| `badge` | iOS | App 图标角标数字，`0` 表示清除。 |
| `interruptionLevel` | iOS | `active`、`critical`、`passive`、`time-sensitive`。 |
| `channelId` | Android | 通知渠道 ID；若设备上尚未创建对应渠道，通知不会显示。 |
| `icon` | Android | Android drawable 资源名，默认使用配置插件指定的图标。 |
| `richContent.image` | Android、iOS | 通知图片 URL；Android 可直接显示，iOS 需增加 Notification Service Extension target。 |
| `categoryId` | Android、iOS | 关联交互式通知类别。 |
| `collapseId` | Android、iOS | 合并传输中的通知；iOS 还会替换设备上已显示的同 ID 通知。 |
| `tag` | Android | 替换设备上已经显示的同 tag 通知，与只合并传输中消息的 `collapseId` 不同。 |
| `mutableContent` | iOS | 是否允许客户端拦截并修改通知内容，默认 `false`。 |

### `ttl`、`priority` 与 `channelId` 的坑点

- Android 上 `ttl: 0` 会尽力立即发送且不节流，但普通优先级消息可能因 Doze 无法及时到达；若要等待设备唤醒，TTL 必须足够长。
- Android normal 不会为休眠设备主动打开网络连接，high 更可能立即投递，但会增加能耗。
- iOS normal 会考虑电量、可能合并批量发送，甚至被 Apple 限流而不投递；high 通常立即发送。它们分别对应 APNs 优先级 5 和 10。
- 未提供 `channelId` 时会使用并可能创建用户可见的 `Default` 渠道，该渠道之后可能无法被完全删除。

## 投递保证与网络排查

Expo 对 Google/Apple 平台服务采用尽力而为并至少尝试一次的交付设计。极少情况下可能重复交付或完全未交付。业务如果不能接受重复，应在自己的 `data` 中携带消息 ID 并在客户端做幂等处理，这是**基于文档内容推导**。

服务器必须能访问位于美国区域的 Google Cloud Platform 服务，因为 Expo Push Service 托管在那里。原文建议排查：

```sh
dig exp.host
dig @8.8.8.8 exp.host
traceroute exp.host
ping exp.host
curl --verbose https://exp.host/
openssl s_client -connect exp.host:443 -servername exp.host
```

同时检查出站 HTTPS 443、防火墙、企业代理、云网络 ACL/安全组和 MTU 导致的分片问题。Expo 使用由 Cloudflare、Google、Let's Encrypt 等主要服务商签发的标准 TLS 证书。

## React Web 开发者最容易误解的地方

- HTTP 200、ticket `ok`、receipt `ok` 是三个不同层次的成功，都不等于“用户看到了通知”。
- push token 应视为可失效的投递地址，服务端必须根据 `DeviceNotRegistered` 清理，而不是永久保存后不再维护。
- 推送可能重复，应像处理 Webhook 一样考虑幂等；推送也可能丢失，不应作为唯一的数据一致性机制。
- `collapseId` 与 Android `tag` 作用阶段不同，一个处理传输中消息，一个替换已展示消息。

## 当前文档未涉及

本页未提供 token 数据库表结构、用户分群模型、业务级送达/已读确认、通知文案策略或直接连接 FCM/APNs 的完整实现。

<!-- NAVIGATION START -->
---
[← 上一页：配置 Expo 推送通知](./119_push-notifications-setup.md) | [下一页：在 Expo 应用中处理收到的通知 →](./121_receiving-notifications.md)
<!-- NAVIGATION END -->
