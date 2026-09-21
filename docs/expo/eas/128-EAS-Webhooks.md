# 128｜EAS Webhooks

**翻页：**[上一页：理解 App Size](./127-Understanding-App-Size.md) · [目录](./README.md) · [下一页：Expo Account Types](./129-Expo-Account-Types.md)

**官方页面：**[Webhooks](https://docs.expo.dev/eas/webhooks/)

**版本边界：**Webhook 是当前未版本化的 EAS Build / Submit 服务功能；payload 示例中的 build ID、CLI、SDK、runtime 等值来自官方旧样例，字段可能按事件类型与服务版本增减。下文把必需的处理思路和示例字段列出，生产 webhook 端点应对不完整字段做容错。

## EAS Webhook 能做什么

Webhook 可在某个 Expo 项目的 EAS Build 或 EAS Submit 完成时，向开发团队自己的 HTTP endpoint 发 POST 请求。它按 project 配置；若一个账号有多个项目，要为每个项目分别设置。

## 创建与管理 Webhook

在项目目录创建，交互式选择 `BUILD` 或 `SUBMIT` 事件类型、接收 URL 与签名密钥：

```sh
# 交互式创建
eas webhook:create

# 也可以传事件、URL、secret 参数
eas webhook:create --event BUILD --url https://api.example.com/webhook --secret YOUR_WEBHOOK_SECRET
```

Webhook secret 至少 16 个字符，EAS 用它计算 POST body 签名，并通过 `expo-signature` header 发送。后续可查看 webhook id、更新 URL / secret，或删除配置：

```sh
eas webhook:list
eas webhook:update --id WEBHOOK_ID
eas webhook:delete
```

URL 要公开可访问且处理 HTTP POST。Receiver 返回 200–399 表示接收成功；其他状态码会导致 EAS 过一段时间按指数退避重试。因此服务端应先校验、可靠接收、快速响应成功，再异步处理较重任务。

## 验证 `expo-signature`

签名为 webhook 原始 request body 的 HMAC-SHA1 hex digest，格式 `sha1=<hex>`，key 是在 `eas webhook:create` 提供的 secret。要验证它必须对**未经 JSON parse / 重编码的 raw body**计算签名。

下面用 Node 原生 crypto 做 timing-safe compare，示例仅作服务端集成说明，没有在本机运行：

```js
import crypto from 'node:crypto';
import express from 'express';

const app = express();

function signaturesMatch(received, expected) {
  const actual = Buffer.from(received);
  const target = Buffer.from(expected);
  return actual.length === target.length && crypto.timingSafeEqual(actual, target);
}

app.post('/webhook', express.text({ type: '*/*' }), (req, res) => {
  const secret = process.env.EAS_WEBHOOK_SECRET;
  const received = req.get('expo-signature') ?? '';
  const expected = `sha1=${crypto
    .createHmac('sha1', secret)
    .update(req.body)
    .digest('hex')}`;

  if (!signaturesMatch(received, expected)) {
    return res.sendStatus(401);
  }

  const payload = JSON.parse(req.body);
  // 验证通过后，按 payload.event/status 分派处理。
  console.log(payload);
  return res.sendStatus(204);
});

app.listen(8080);
```

Express `text()` 先保留原始 body 字符串，校验后再 parse JSON。不要把 webhook secret 放到公开 repo；服务端接收地址也应要求 HTTPS。

## Build Webhook Payload 字段

Build 事件 body 描述一次构建状态。以下是官方 JSON 示例涵盖字段的分类摘要：

| 字段 | 含义或出现条件 |
| --- | --- |
| `id`、`accountName`、`projectName`、`appId` | build、Expo account / project、EAS App 标识。 |
| `buildDetailsPageUrl` | Dashboard build 详情链接。 |
| `parentBuildId` | 重试 build 时关联到父 build。 |
| `initiatingUserId`、`cancelingUserId` | 发起或取消 build 的用户；取消用户只在适用事件出现。 |
| `platform`、`status` | Android / iOS 与 `finished` / `errored` / `canceled` 等状态。 |
| `artifacts.buildUrl`、`artifacts.logsS3KeyPrefix` | 成功 build 的产物链接 / 日志位置；产物 URL 仅成功时提供。 |
| `metadata.appName` / `username` / `workflow` | 项目与构建 workflow 描述。 |
| `metadata.appVersion` / `appBuildVersion` / `cliVersion` / `sdkVersion` | App / build / EAS CLI / Expo SDK 版本信息。 |
| `metadata.buildProfile` / `distribution` / `appIdentifier` | eas.json profile、分发方式、Android package / iOS bundle identifier。 |
| `metadata.gitCommitHash` / `gitCommitMessage` / `isGitWorkingTreeDirty` / `runFromCI` | 源码版本、工作区状态和构建触发来源。 |
| `metadata.runtimeVersion` / `channel` / `releaseChannel` | EAS Update runtime / 新旧 channel metadata；`releaseChannel` 主要是 legacy updates 兼容字段。 |
| `metadata.trackingContext` | platform、account / project IDs、dev client、tracking ID、project type 等追踪上下文。 |
| `metadata.credentialsSource` / `message` | 签名凭据来自 remote / local，及用户附在 build 上的备注。 |
| `metrics.*` | memory、build start / end / enqueue timestamp、disk / network 读写量、active CPU 毫秒等构建资源数据。 |
| `error.message` / `error.errorCode` | 仅失败 build 提供的错误说明与代码。 |
| 时间戳与资源字段 | `createdAt`、`enqueuedAt`、`provisioningStartedAt`、`workerStartedAt`、`completedAt`、`updatedAt`、`expirationDate`、`priority`、`resourceClass`、`actualResourceClass`、`maxRetryTimeMinutes` 等。 |

当前 Webhook 的实际字段以收到的 JSON 为准；按可能缺少的属性读 payload，不要写成所有字段对每个 status / platform 都必有。

## Submit Webhook Payload 字段

Submit 事件记录向商店上传或提交的状态，与 Build payload 结构不同：

| 字段 | 含义或出现条件 |
| --- | --- |
| `id`、`accountName`、`projectName`、`appId` | submission、Expo account / project、EAS App 标识。 |
| `submissionDetailsPageUrl` | Dashboard submission 详情链接。 |
| `parentSubmissionId` | 重试 submission 时关联父 submission。 |
| `archiveUrl`、`turtleBuildId` | 提交的 binary archive / 从 EAS Build 得到的 build 标识。 |
| `initiatingUserId`、`cancelingUserId` | 发起 / 取消提交的用户；取消项仅在适用情形提供。 |
| `platform`、`status` | Android / iOS 与 `finished` / `errored` / `canceled` 等状态。 |
| `submissionInfo.error.message` / `.errorCode` | 失败原因及平台代码，仅失败时提供。 |
| `submissionInfo.logsUrl` | submission service 日志链接，失败时提供。 |
| `createdAt`、`updatedAt`、`completedAt`、`maxRetryTimeMinutes` | 时间与失败 / 取消任务的重试时限。 |

Build 与 Submit webhook 是不同 event type，分别注册和处理。处理失败后还可以根据 payload 状态提示团队成员或触发内部流程。

## 关键名词

- **Webhook：**服务端事件发生后，以 HTTP 请求主动通知另一个系统的机制。
- **Webhook Secret：**只有 EAS 与接收方保存的共享密钥，用来确认请求未伪造。
- **HMAC-SHA1：**用密钥和 message body 生成的签名摘要；EAS 将其作为 `expo-signature` header 发送。
- **Raw body：**HTTP body 原始字节 / 文本。JSON parse 再序列化可能改动空白和转义，因此必须先用 raw body 校验签名。
- **Exponential backoff：**失败后逐渐延长重试间隔，减少接收端过载。
- **Payload：**随 POST body 送达的 JSON 构建 / 提交流程详情。

## 官方代码主题覆盖

源页的代码主题全部覆盖：`eas webhook:create` 的 BUILD / SUBMIT、`--event`、`--url`、`--secret` 选项；`webhook:update` / `list` / `delete` 管理命令；Build / Submit payload 的主要字段和状态条件；raw JSON body、`expo-signature` HMAC-SHA1 验证、Node HTTP endpoint 示例。原始页使用一个额外的 safe-compare package；本页用 Node crypto 的 timing-safe compare 改写相同校验步骤。

## 下一页

官方页脚 **Next** 离开 EAS Webhooks Reference，进入 [Expo account types](https://docs.expo.dev/accounts/account-types/)，概览 Expo 账户和组织帐户的角色差异。

**翻页：**[上一页：理解 App Size](./127-Understanding-App-Size.md) · [返回目录](./README.md) · [下一页：Expo Account Types](./129-Expo-Account-Types.md)
