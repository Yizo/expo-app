# 016｜EAS Workflows REST API

**翻页：**[上一页：用 Workflows 自动化 EAS CLI](./015-自动化EAS-CLI命令.md) · [目录](./README.md) · [下一页：排查 EAS Workflows](./017-EAS-Workflows故障排查.md)

**官方页面：**[Workflows REST API](https://docs.expo.dev/eas/workflows/rest-api/)

**版本说明：**REST API 属于 EAS 服务，不由某个 Expo SDK 单独定义。请求需要 EAS access token；本文只有带占位符的示例，未发送任何请求。

## API 能做什么

EAS Workflows REST API 提供两个主要操作：按某个 Git ref 找到 workflow 文件并触发新 run；按 run ID 读取总状态和每个 job 的结果。请求与响应格式为 JSON，API host 是 `https://api.expo.dev`。

生产集成建议用项目所属 Expo account 下的 robot user，并授予足够但有限的角色权限。临时脚本也可用个人 access token。两者都应放进 CI secret 环境，不要写进仓库或日志：

```sh
export EXPO_TOKEN='由安全凭证管理器注入'
```

请求头采用 Bearer token：

```http
Authorization: Bearer <EXPO_TOKEN>
Content-Type: application/json
```

## 触发 workflow

`POST /v2/workflows/dispatch` 的必填 JSON 字段：

| 字段 | 用途 |
| --- | --- |
| `appId` | EAS 项目 UUID；可从 app config 的 `extra.eas.projectId` 找到。 |
| `gitRef` | 分支名、tag、commit SHA 或完整 Git ref。 |
| `fileName` | workflow 文件名，不写 `.eas/workflows/` 前缀。 |
| `inputs` | 可选；必须匹配该 YAML 的 `on.workflow_dispatch.inputs` schema。 |

下面的改写示例展示触发请求。`appId`、workflow 文件名和 inputs 必须对应自己的 Expo 项目以及 Git ref：

```sh
curl --fail-with-body --request POST \
  'https://api.expo.dev/v2/workflows/dispatch' \
  --header "Authorization: Bearer $EXPO_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "appId": "<EAS-project-uuid>",
    "gitRef": "main",
    "fileName": "deploy.yml",
    "inputs": { "environment": "preview" }
  }'
```

成功时会回传新的 workflow run ID 和 Expo dashboard 的详情链接。注意这项 API 会在服务端真实排队执行 workflow；运行前应确认 Git ref 上有目标文件、inputs 合法，并由有权限的 token 发起。

## 查询状态与轮询

`GET /v2/workflows/runs/:workflowRunId` 会返回 run、job、Git 提交、触发方式、时间戳、outputs 和错误数组。可用 run ID 构造查询：

```sh
curl --fail-with-body \
  "https://api.expo.dev/v2/workflows/runs/$RUN_ID" \
  --header "Authorization: Bearer $EXPO_TOKEN"
```

以下示意脚本按十秒间隔检查 run，并在 success、failure 或 canceled 时停止。真实接入还要处理 HTTP 错误、超时与 rate limit：

```sh
while true; do
  response=$(curl --fail-with-body --silent \
    "https://api.expo.dev/v2/workflows/runs/$RUN_ID" \
    --header "Authorization: Bearer $EXPO_TOKEN")
  status=$(printf '%s' "$response" | jq -r '.data.status')
  printf 'Workflow status: %s\n' "$status"

  case "$status" in
    success|failure|canceled) break ;;
  esac
  sleep 10
done
```

Run 状态包含 `new`（排队）、`in-progress`（有 job 正在执行）、`action-required`（等待人工审批）、`success`、`failure`、`canceled`。Job 还可能有 `pending-cancel`、`skipped`。Build 类 job 含 `buildId`，Submit 类 job 含 `submissionId`；job `outputs` 可在后续自动化中使用，secret 字段在 API 回传内容中会遮罩。

| HTTP 状态 | 常见原因 |
| --- | --- |
| 400 | dispatch body schema 不合法；或 run ID 不是 UUID。 |
| 403 | token 对目标 project / run 没有存取权。 |
| 404 | Git ref 或 workflow 文件不存在；或 run ID 找不到。 |

## 关键名词

- **Bearer token**：放在 Authorization header 中的存取凭证。
- **Robot user**：专为自动化建立、可独立撤权的 Expo 使用者。
- **Git ref**：指向一次程式码状态的名称，例如 branch、tag 或 commit SHA。
- **Workflow run / job**：一次 workflow 执行及其内部的单个工作步骤。
- **Terminal status**：代表该次 run 已结束，不会再进入执行中状态。

## 官方代码主题覆盖

源页各类代码均由重写示例覆盖：Bearer 请求头、触发 endpoint 与四个请求字段、成功返回的 run ID 概念、查 run endpoint、run / job 状态枚举、从 build / submission job 读取 ID 和 outputs，以及触发后轮询直到终止状态。错误表覆盖 400 / 403 / 404；没有执行真实 API 请求。

## 下一页

页脚 **Next** 指向 [Troubleshoot EAS Workflows](https://docs.expo.dev/eas/workflows/troubleshooting/)，整理 workflow 不启动和 job 失败的常见原因。

**翻页：**[上一页：用 Workflows 自动化 EAS CLI](./015-自动化EAS-CLI命令.md) · [返回目录](./README.md) · [下一页：排查 EAS Workflows](./017-EAS-Workflows故障排查.md)
