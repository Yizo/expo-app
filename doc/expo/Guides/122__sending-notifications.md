# 发送推送通知

> 原始文档来源：https://docs.expo.dev/push-notifications/sending-notifications/

本指南详细介绍如何使用 **Expo Push Service**（Expo 推送服务）从服务器端发送推送通知。客户端的 `expo-notifications` 模块负责处理与设备的交互，而 Expo 负责将消息载荷路由到 Apple（APNs）和 Google（FCM）。你的后端服务器只需要发送一个包含设备令牌（device token）的请求即可。

如果你希望更精细地控制推送流程，也可以选择自定义服务器直接与 APNs 和 FCM 通信，但这会增加系统复杂度。

---

## 目录

- [概述](#概述)
- [服务器端发送通知](#服务器端发送通知)
  - [官方与社区 SDK](#官方与社区-sdk)
- [确保可靠的推送送达](#确保可靠的推送送达)
  - [限制并发连接数](#限制并发连接数)
  - [重试机制](#重试机制)
  - [检查推送回执中的错误](#检查推送回执中的错误)
  - [服务等级协议 (SLA)](#服务等级协议-sla)
- [HTTP/2 API 接口](#http2-api-接口)
  - [发送推送通知](#发送推送通知)
  - [推送票据（Push Tickets）](#推送票据push-tickets)
  - [推送回执（Push Receipts）](#推送回执push-receipts)
- [错误处理](#错误处理)
  - [票据错误](#票据错误)
  - [回执错误](#回执错误)
  - [提交错误（整个请求级别）](#提交错误整个请求级别)
- [安全增强措施](#安全增强措施)
- [消息载荷规格](#消息载荷规格)
  - [消息请求体字段](#消息请求体字段)
  - [票据数据结构](#票据数据结构)
  - [回执请求数据结构](#回执请求数据结构)
  - [回执响应数据结构](#回执响应数据结构)
- [送达保证](#送达保证)
- [网络故障排查](#网络故障排查)
  - [DNS 解析](#dns-解析)
  - [路由与连接测试](#路由与连接测试)
  - [TLS 证书验证](#tls-证书验证)
- [文档导航](#文档导航)

---

## 概述

在 Expo 推送通知架构中：

- **客户端**（`expo-notifications`）：负责请求用户权限、获取设备推送令牌、处理接收到的通知
- **Expo Push Service**：作为中间层，接收你的服务器请求，并将消息转发给 APNs（Apple Push Notification service）和 FCM（Firebase Cloud Messaging）
- **你的后端服务器**：负责存储设备令牌、构建消息内容、调用 Expo API 发送推送

> **初学者提示**：
> - **APNs**（Apple Push Notification service）：Apple 的推送通知服务，用于向 iOS 设备发送通知
> - **FCM**（Firebase Cloud Messaging）：Google 的推送通知服务，用于向 Android 设备发送通知
> - **设备令牌（Device Token）**：每个设备上唯一的标识字符串，用于指定通知的接收目标。通过 `getExpoPushTokenAsync` 方法获取
> - **Push Ticket（推送票据）**：当你发送推送请求后，Expo 返回的确认凭据，包含一个唯一 ID，后续可用于查询推送状态
> - **Push Receipt（推送回执）**：通过推送票据 ID 查询获取的详细送达状态报告，显示消息是否已成功交给 APNs/FCM

---

## 服务器端发送通知

在完成推送凭证配置并添加了获取设备令牌的逻辑之后，你可以通过 HTTPS POST 请求将令牌发送到 Expo Push Service。

这需要一个后端服务器（配合数据库），也可以使用命令行工具，甚至直接从应用内发送请求。

### 官方与社区 SDK

Expo 团队和社区提供了多种编程语言的后端封装库，方便你快速集成：

| 语言 | SDK | 维护方 |
|------|-----|--------|
| **Node.js** | `expo-server-sdk-node` | Expo 官方维护 |
| **Python** | 社区 SDK | 社区 |
| **Ruby** | 社区 SDK | 社区 |
| **Rust** | 社区 SDK | 社区 |
| **Symfony** | 社区 SDK | 社区 |
| **PHP** | 社区 SDK | 社区 |
| **Golang** | 社区 SDK | 社区 |
| **Elixir** | 社区 SDK | 社区 |
| **.NET (C#)** | 社区 SDK | 社区 |
| **Java** | 社区 SDK | 社区 |
| **Laravel** | 社区 SDK | 社区 |

> **基于经验建议**：Node.js SDK 是官方维护的，功能最完善、更新最及时，推荐 Node.js 后端项目优先使用。其他语言的社区 SDK 质量参差不齐，使用前建议检查其维护状态和 issue 列表。

---

## 确保可靠的推送送达

推送通知在传递过程中会经过多个网络和服务节点。虽然大部分情况下能成功送达，但偶尔会遇到网络故障或系统异常。以下最佳实践能帮助你构建更可靠的推送系统。

### 限制并发连接数

当需要同时发送大量推送通知时，应该**限制并发连接数**。官方 Node.js SDK 自动将并发连接数限制为 **6 个**，这有助于在高峰负载时保持服务稳定。

> **初学者提示**：并发连接数是指同一时刻向服务器发送的请求数量。如果一次性发送过多请求，可能导致服务器过载或触发限流（rate limiting），反而降低发送效率。

> **基于经验建议**：不要自己手动控制并发连接数，直接使用官方 Node.js SDK，它已经内置了连接池管理机制。如果你使用其他语言，参考 6 个并发连接的上限来实现连接池。

### 重试机制

消息首次投递到 Expo 队列时可能因以下原因失败：

- **临时性错误**（可重试）：
  - 网络瞬断
  - 服务暂时不可用
  - HTTP 429（请求过多 / 限流）
  - HTTP 5xx（服务器错误）

- **永久性错误**（不可重试）：
  - HTTP 400（请求格式错误 / 无效载荷）
  - 凭证无效
  - 设备令牌已注销

对于临时性错误，应使用**指数退避（Exponential Backoff）**策略进行重试。

> **初学者提示**：**指数退避**是一种重试策略——每次重试失败后，等待时间按指数增长（例如 1 秒 → 2 秒 → 4 秒 → 8 秒），避免在短时间内反复请求加重服务器负担。

> **基于经验建议**：实现重试时，务必区分临时性错误和永久性错误。对永久性错误进行重试只会浪费资源。建议设置最大重试次数（如 5 次），超过后记录日志并告警。

### 检查推送回执中的错误

Expo 在接收到你的推送请求后会返回**推送票据（Push Tickets）**，其中包含一个唯一 ID。你可以稍后使用该 ID 查询**推送回执（Push Receipts）**，以确认消息是否成功交给了 FCM 或 APNs。

**关键要点**：

- 必须在发送推送后**约 15 分钟**再查询回执（给 Expo 足够的时间处理）
- 回执在 **24 小时后过期**，过期后无法再查询
- **必须检查回执中的错误**，例如 `DeviceNotRegistered`（设备未注册）——遇到此错误后应停止向该令牌发送通知

> **基于经验建议**：建立一个定时任务（cron job），每隔 15-20 分钟批量检查一次回执。将已注销的设备令牌从数据库中移除或标记为失效，避免持续向无效令牌发送通知（这会浪费资源并可能影响你的推送信誉）。

### 服务等级协议 (SLA)

Expo、FCM 和 APNs **均不提供严格的服务等级协议（SLA）保证**。这意味着：

- 不保证 100% 的消息送达率
- 不保证服务的持续可用性

> **基于文档内容推导**：正因为没有任何一方提供 SLA 保证，所以你的应用逻辑必须具备足够的健壮性来处理各种失败场景。遵循上述最佳实践（限制并发、指数退避重试、检查回执）是保障推送可靠性的唯一途径。

---

## HTTP/2 API 接口

你可以直接使用 Expo 的 HTTP/2 API 发送推送通知，无需任何认证（除非你启用了访问令牌要求，见下文安全增强部分）。

### 发送推送通知

**API 端点**：`POST https://exp.host/--/api/v2/push/send`

**请求头**：`Content-Type: application/json`

#### 发送单条通知

使用 `curl` 发送单条推送通知的示例：

```sh
curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/send" -d '{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title":"hello",
  "body": "world"
}'
```

#### 批量发送通知

请求体可以是**单个消息对象**，也可以是**最多 100 个消息对象的数组**（必须属于同一项目）。使用数组形式可以减少 HTTP 请求次数。

```json
[
  {
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "sound": "default",
    "body": "Hello world!"
  },
  {
    "to": "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]",
    "badge": 1,
    "body": "You've got mail"
  },
  {
    "to": [
      "ExponentPushToken[zzzzzzzzzzzzzzzzzzzzzz]",
      "ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]"
    ],
    "body": "Breaking news!"
  }
]
```

> **初学者提示**：
> - `to` 字段可以是单个令牌字符串，也可以是令牌数组——这意味着同一条消息可以同时发送给多个设备
> - `sound: "default"` 会触发系统默认通知提示音
> - `badge: 1` 会在 iOS 应用图标上显示数字角标

**支持 Gzip 压缩**：API 支持 Gzip 压缩传输以节省带宽。Node.js SDK 会自动处理压缩。

> **基于经验建议**：当需要向大量用户发送通知时，使用批量发送（数组形式），每次最多 100 条。这比逐条发送效率高得多，也能减少网络开销。

### 推送票据（Push Tickets）

发送推送后，API 响应中的 `data` 数组包含与发送消息一一对应的票据。

#### 成功响应示例

`status: "ok"` 仅表示 Expo 已接收到你的推送请求，**不代表用户已收到通知**。

```json
{
  "data": [
    { "status": "ok", "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" },
    { "status": "ok", "id": "YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY" },
    { "status": "ok", "id": "ZZZZZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZZZZZZZZZ" },
    { "status": "ok", "id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA" }
  ]
}
```

> **重要提醒**：`status: "ok"` 仅仅意味着 Expo 服务器收到了你的消息请求，并将票据 ID 返回给你。真正的送达状态需要通过推送回执来确认。

#### 部分失败响应示例

单条消息的错误会返回 `error` 状态及详细信息，但不影响其他消息的处理：

```json
{
  "data": [
    {
      "status": "error",
      "message": "\"ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]\" is not a registered push notification recipient",
      "details": {
        "error": "DeviceNotRegistered"
      }
    },
    {
      "status": "ok",
      "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
    }
  ]
}
```

#### 整个请求失败

如果整个请求失败，会返回 HTTP 4xx 或 5xx 状态码，响应中会包含 `errors` 数组（详见下文"提交错误"部分）。

### 推送回执（Push Receipts）

当 Expo 将消息排入 APNs 或 FCM 的队列后，会生成一条推送回执。你可以通过票据 ID 来查询回执状态。

**API 端点**：`POST https://exp.host/--/api/v2/push/getReceipts`

#### 查询回执示例

```sh
curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/getReceipts" -d '{
  "ids": [
    "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY",
    "ZZZZZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZZZZZZZZZ"
  ]
}'
```

#### 回执响应示例

```json
{
  "data": {
    "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX": { "status": "ok" },
    "ZZZZZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZZZZZZZZZ": { "status": "ok" }
    // 当某个 ID 还没有对应的回执时（例如本例中的 YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY），
    // 该 ID 会被从响应中省略。这意味着回执尚未生成，稍后可以再次查询。
  }
}
```

> **重要提醒**：
> - 回执中的 `status: "ok"` 只表示消息已成功交给 APNs 或 FCM，**不代表物理设备已收到通知**
> - 如果设备处于离线状态，APNs/FCM 会在设备重新上线后尝试投递
> - 如果查询的某个票据 ID 未出现在响应中，说明该回执尚未生成，稍后再次查询即可

---

## 错误处理

Expo 在整个推送流程中提供详细的错误信息。在票据和回执中，查找 `details` 对象中的 `error` 字段以获取具体错误类型。

### 票据错误

| 错误类型 | 说明 | 处理方式 |
|----------|------|----------|
| `DeviceNotRegistered` | 设备无法接收推送通知（用户可能已卸载应用或禁用了推送权限） | **立即停止**向该令牌发送通知，从数据库中移除或标记为失效 |

### 回执错误

| 错误类型 | 说明 | 处理方式 |
|----------|------|----------|
| `DeviceNotRegistered` | 设备未注册，无法接收推送 | **立即停止**向该令牌发送通知 |
| `MessageTooBig` | 消息载荷超过 **4096 字节**的限制 | 减小消息体大小，将大数据通过 `data` 字段传递或改为从服务器拉取 |
| `MessageRateExceeded` | 发送速率过快，触发了限流 | 降低发送速率，使用**指数退避**策略重试 |
| `MismatchSenderId` | FCM 凭证不匹配 | 确保 FCM 服务器密钥和 `google-services.json` 中的 Sender ID 与 Firebase 控制台中的配置一致 |
| `InvalidCredentials` | 独立应用的推送凭证无效 | **Android**：重新上传 Firebase 服务器密钥；**iOS**：运行 `eas credentials` 重新生成 APN 密钥和配置文件（provisioning profile），然后重新构建应用 |

### 提交错误（整个请求级别）

这些错误表示整个请求失败（而非单条消息失败）：

| 错误码 | 说明 | 限制值 |
|--------|------|--------|
| `TOO_MANY_REQUESTS` | 超过每秒推送速率限制 | 每个项目每秒最多 **600** 条通知 |
| `PUSH_TOO_MANY_EXPERIENCE_IDS` | 一次请求中混合了不同 Expo 项目的令牌 | 同一批次只能包含**同一项目**的令牌 |
| `PUSH_TOO_MANY_NOTIFICATIONS` | 单次请求中的消息数量超过限制 | 每次请求最多 **100** 条消息 |
| `PUSH_TOO_MANY_RECEIPTS` | 单次查询的回执 ID 数量超过限制 | 每次查询最多 **1000** 个回执 ID |

> **基于经验建议**：建议在代码中对这些错误进行分类处理：
> 1. `DeviceNotRegistered`：自动清理令牌，无需人工干预
> 2. `MessageTooBig`：记录日志，通知开发者优化消息内容
> 3. `MessageRateExceeded` / `TOO_MANY_REQUESTS`：自动降速并指数退避重试
> 4. `MismatchSenderId` / `InvalidCredentials`：属于配置问题，需要人工介入修复

---

## 安全增强措施

为了防止推送令牌被泄露后被滥用，你可以在 **EAS Dashboard**（Expo Application Services 管理面板）中启用**访问令牌验证**。

启用后：

- 每次推送请求必须携带有效的访问令牌
- **Node.js SDK**：在构造函数中传入访问令牌
- **直接 HTTP 请求**：通过 `Authorization` 请求头以 Bearer Token 方式传递

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

如果缺少访问令牌，API 会返回 `UNAUTHORIZED` 错误。

> **基于经验建议**：强烈建议在生产环境中启用访问令牌验证。虽然这增加了一个配置步骤，但能有效防止恶意用户伪造推送请求。在开发和测试阶段可以暂时不启用，但上线前务必开启。

---

## 消息载荷规格

### 消息请求体字段

以下是发送推送通知时支持的所有字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `to` | `string \| string[]` | **是** | 接收推送通知的设备令牌。可以是单个令牌或令牌数组 |
| `_contentAvailable` | `boolean` | 否 | 设为 `true` 时，在 Apple 设备上触发后台执行（即"静默推送"） |
| `data` | `Object` | 否 | 自定义 JSON 数据载荷，传递给应用处理。最大约 **4KiB** |
| `title` | `string` | 否 | 通知标题，显示在通知正文上方 |
| `body` | `string` | 否 | 通知正文，主要文本内容 |
| `ttl` | `number` | 否 | 消息存活时间（秒）。超过此时间未送达的消息将被丢弃 |
| `expiration` | `number` | 否 | Unix 时间戳，指定消息过期的时间点 |
| `priority` | `'default' \| 'normal' \| 'high'` | 否 | 消息优先级，决定发送紧急程度 |
| `subtitle` | `string` | 否 | 副标题，显示在主标题下方（仅 iOS） |
| `sound` | `string \| null` | 否 | 通知提示音。`"default"` 使用系统默认提示音，也可指定自定义音频文件名 |
| `badge` | `number` | 否 | 应用图标上的数字角标（仅 iOS） |
| `interruptionLevel` | `'active' \| 'critical' \| 'passive' \| 'time-sensitive'` | 否 | 通知的中断级别，决定在 iOS 设备上的显示优先级和送达时机 |
| `channelId` | `string` | 否 | Android 通知渠道 ID，将通知路由到特定渠道 |
| `icon` | `string` | 否 | Android 通知图标的 drawable 资源名称 |
| `richContent` | `Object` | 否 | 富媒体内容。包含 `image` 键（值为图片 URL），用于在通知中显示图片 |
| `categoryId` | `string` | 否 | 关联预定义的交互式操作组（通知操作按钮） |
| `collapseId` | `string` | 否 | 合并传输中的通知，并在 Apple 设备上替换已有通知 |
| `tag` | `string` | 否 | 在 Android 设备上替换具有相同标识符的已显示通知 |
| `mutableContent` | `boolean` | 否 | 允许客户端应用在显示前修改通知内容（仅 iOS） |

> **重要注意事项**：
> - `ttl` 设为 `0` 可能导致处于 Android Doze 模式（省电模式）的设备无法收到通知
> - `priority` 设为 `high` 会增加电池消耗，仅在需要立即引起用户注意时使用
> - Android 如果未指定 `channelId`，通知会使用默认的 "Default" 渠道，该渠道一旦创建后很难删除

> **初学者提示**：
> - **Doze 模式**：Android 6.0 引入的省电功能，设备长时间不使用时会进入低功耗状态，限制网络活动
> - **通知渠道（Notification Channel）**：Android 8.0 引入的概念，允许用户对不同类型的通知进行分组管理（如开启/关闭特定类型的通知）
> - **静默推送（Silent Push）**：一种不显示通知界面但在后台唤醒应用执行任务的方式

### 票据数据结构

```js
{
  "data": [
    {
      "status": "error" | "ok",
      "id": string,           // 这就是回执 ID（Receipt ID）
      // 当 status === "error" 时，还包含以下字段：
      "message": string,      // 错误描述信息
      "details": JSON         // 错误详情对象
    },
    // ...更多票据
  ],
  // 仅当整个请求出错时才会填充此字段
  "errors": [{
    "code": string,
    "message": string
  }]
}
```

### 回执请求数据结构

```js
{
  "ids": string[]   // 要查询的票据 ID 数组，最多 1000 个
}
```

### 回执响应数据结构

```js
{
  "data": {
    // 键为票据 ID（Receipt ID），值为对应的回执状态
    [receiptId: string]: {
      "status": "error" | "ok",
      // 当 status === "error" 时，还包含以下字段：
      "message": string,
      "details": JSON
    },
    // ...更多回执
  },
  // 仅当整个请求出错时才会填充此字段
  "errors": [{
    "code": string,
    "message": string
  }]
}
```

---

## 送达保证

关于推送通知的送达，Expo 提供以下保证：

- Expo **至少会尝试一次**将消息递交给 Google（FCM）和 Apple（APNs）
- **重复投递**的概率虽然很低，但比**完全丢失**的概率更高（即：宁可能多发一次，也不会丢消息）
- 推送回执记录了消息从 Expo 到 APNs/FCM 的交接状态

> **重要提醒**：最终消息是否送达用户的物理设备，**完全取决于 Apple 和 Google 各自的内部策略**。Expo 无法控制也无法保证从 APNs/FCM 到设备这一段的成功率。

> **基于文档内容推导**：这意味着你的应用应该能够处理以下情况：
> 1. 用户可能偶尔收到重复通知——应用端应做去重处理
> 2. 即使回执显示成功，用户也可能未实际收到——不要依赖推送通知作为关键信息的唯一传递渠道
> 3. 通知可能延迟送达——在设备重新上线或退出省电模式后才到达

---

## 网络故障排查

你的后端服务器必须能够访问位于美国的 Google Cloud Platform（GCP）基础设施上的 Expo 服务。以下是常见的网络排查方法。

### DNS 解析

验证 `exp.host` 域名能否正确解析：

```bash
# 使用默认 DNS 服务器解析
dig exp.host

# 使用 Google 公共 DNS 服务器解析（排除本地 DNS 问题）
dig @8.8.8.8 exp.host
```

> **初学者提示**：`dig` 是一个 DNS 查询工具。如果两种 DNS 服务器都无法解析 `exp.host`，可能是你的网络环境存在 DNS 污染或屏蔽。

### 路由与连接测试

```bash
# 使用 traceroute 检查网络路由路径，识别路由问题
traceroute exp.host

# 测试基本网络连通性
ping exp.host

# 测试 HTTPS 连接
# 你应该收到 HTTP 响应头，状态码为 200
curl --verbose https://exp.host/
```

> **排查清单**：
> - 检查防火墙是否允许 **443 端口**的出站流量
> - 检查代理设置是否阻止了对 `exp.host` 的访问
> - 检查 ACL（访问控制列表）是否限制了连接
> - 检查 MTU（最大传输单元）是否导致数据包分片问题

### TLS 证书验证

验证 SSL/TLS 证书是否有效：

```bash
openssl s_client -connect exp.host:443 -servername exp.host
```

Expo 的证书由标准的证书颁发机构签发（如 Let's Encrypt、Cloudflare、Google），你的系统应默认信任这些证书。

> **基于经验建议**：如果你在服务器上使用自定义 CA 证书包（而非系统默认的），确保定期更新证书包，否则可能因为根证书过期而导致 TLS 握手失败。

---

## 完整发送流程总结

以下是推送通知的完整生命周期：

```
1. 客户端调用 getExpoPushTokenAsync() 获取设备令牌
2. 客户端将令牌发送到你的后端服务器并存储
3. 后端构建消息载荷，POST 到 https://exp.host/--/api/v2/push/send
4. Expo 返回推送票据（含 ID）
5. 后端保存票据 ID
6. 等待约 15 分钟
7. 后端使用票据 ID 查询回执：POST 到 https://exp.host/--/api/v2/push/getReceipts
8. 检查回执状态，处理错误（如移除已注销的令牌）
```

> **基于经验建议**：在生产环境中，建议将步骤 6-8 封装为一个独立的后台任务或服务，与主发送流程解耦。这样可以避免阻塞主流程，同时确保所有推送都能得到状态检查。

---

## 文档导航

- **上一页**：[push notifications setup](./121__push-notifications-setup.md)
- **下一页**：[receiving notifications](./123__receiving-notifications.md)
