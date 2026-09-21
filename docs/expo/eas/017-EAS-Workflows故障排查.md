# 017｜排查 EAS Workflows

**翻页：**[上一页：EAS Workflows REST API](./016-EAS-Workflows-REST-API.md) · [目录](./README.md) · [下一页：EAS Workflows 限制](./018-EAS-Workflows限制.md)

**官方页面：**[Troubleshoot EAS Workflows](https://docs.expo.dev/eas/workflows/troubleshooting/)

**版本说明：**这是 EAS 服务指南，与 Expo SDK 主版本无直接绑定。GitHub 触发和配置字段会随 EAS Workflows 更新；遇到差异时以页面顶部对应官方说明为准。

## 从 run 详情开始

如果 workflow 没启动或某个 job 失败，先到 Expo 项目的 Workflows 页面查看本次 run：逐个 job 检查状态、日志与错误。接着在运行之前用 CLI 检查 YAML 语法、workflow schema 和自定义函数引用：

```sh
eas workflow:validate .eas/workflows/my-workflow.yml
```

验证命令不会发起真实构建；它适合在本地或 CI 中先挡住 YAML 结构错误。

## GitHub 事件没有触发

对于 `push`、`pull_request`、`ref_delete` 等 GitHub event，依次核对：

1. EAS 项目已关联触发 workflow 的 GitHub 仓库。
2. YAML 文件位于 `.eas/workflows`。`push` / `pull_request` 会读取事件对应 commit 中的 workflow；`schedule` / `ref_delete` 则从默认分支读取。
3. `branches`、`tags`、`paths`、`types`、`labels` 等 filter 与当前事件相符。
4. commit message 没含跳过标记：`[eas skip]`、`[skip eas]` 或 `[no eas]`。
5. 定时 workflow 只从默认分支运行，使用 GMT 时区，并可能因系统负载延迟。

下面是可本地核对的触发配置形状；它只表示监听 main 分支 push：

```yaml
name: Validate on main
on:
  push:
    branches: [main]
jobs:
  check:
    type: custom
    steps:
      - run: echo "workflow event received"
```

## Build profile 缺失

预打包 Build job 会读取项目 `eas.json` 中定义的 build profile；默认 profile 是 `production`。若提示找不到 profile，应创建 job 所需 profile，或用 EAS CLI 初始化默认配置：

```json
{
  "build": {
    "production": {
      "channel": "production"
    }
  }
}
```

缺少文件时，官方命令是：

```sh
eas build:configure
```

Build job 还必须有对应平台的签名凭证。首次使用某个平台 / profile 时，可以先通过 EAS CLI 完成一次相同配置的 build，以设置签名。

## 环境变量为空

EAS env 变量归属于 `development`、`preview` 或 `production` 环境；Workflow job 的 `environment` 决定它从哪个环境读取变量，缺省为 production。检查 variable 是否创建在该环境，或者把 job 的 environment 改成预期值：

```yaml
jobs:
  preview_build:
    type: build
    environment: preview
    params:
      platform: android
      profile: preview
```

另外，`env` 属性不是所有 job type 都支持；官方列出以下类型不支持该配置：

```text
apple-device-registration-request
branch-delete
doc
get-build
github-comment
require-approval
slack
```

## 关键名词

- **Trigger filter**：对分支、标签、文件路径或事件类型加限制；不匹配则不会运行。
- **Default branch**：GitHub 仓库配置的默认分支，某些定时事件从它读取 workflow 文件。
- **Build profile**：`eas.json` 中定义的一套构建参数，例如 development、preview、production。
- **EAS Environment**：存放一组环境变量的作用域；Workflow 需要选择对应环境。
- **Validation**：检查 YAML 与配置 schema，不等同于执行 workflow 或完成原生构建。

## 官方代码主题覆盖

源页代码和配置主题均有重写示例：`eas workflow:validate` 命令、`on.push.branches` event filter、`eas.json` 的 production build profile、`eas build:configure` 命令，以及 job 的 `environment` 选择。commit skip markers、默认分支 / GMT 定时行为和 `env` 不支持的 job types 也逐项列出。

## 下一页

页脚 **Next** 指向 [EAS Workflows limitations](https://docs.expo.dev/eas/workflows/limitations/)，总结 workflow 配置复用和 matrix 的当前限制。

**翻页：**[上一页：EAS Workflows REST API](./016-EAS-Workflows-REST-API.md) · [返回目录](./README.md) · [下一页：EAS Workflows 限制](./018-EAS-Workflows限制.md)
