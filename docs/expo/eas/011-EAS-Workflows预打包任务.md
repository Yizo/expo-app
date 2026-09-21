# 011｜EAS Workflows 预打包 Jobs

**翻页：**[上一页：EAS Workflows 入门](./010-EAS-Workflows入门.md) · [目录](./README.md) · [下一页：Workflow 语法](./012-EAS-Workflows语法.md)

**官方页面：**[Pre-packaged jobs in EAS Workflows](https://docs.expo.dev/eas/workflows/pre-packaged-jobs/)

## 预打包 Job 是什么

Job 是 workflow 中的单个任务；预打包类型替你定义好云服务集成，例如构建 app 或运行 Maestro 测试。YAML 可通过 `type` 选 Job，由 `params` 给它输入；任务输出放到 `needs.<job_id>.outputs` 供后续 job 引用。

## Android / iOS Build

`type: build` 需要 `platform`，可指定 `profile`、构建消息和 iOS ad hoc profile refresh。它可带 `hooks` 在安装依赖前后运行；输出包括 build ID、版本、bundle identifier、fingerprint、SDK / runtime 版本、channel、distribution 等。

```yaml
jobs:
  build_ios:
    type: build
    params:
      platform: ios
      profile: production
  submit_ios:
    type: submit
    needs: [build_ios]
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
      profile: production
```

Production Build 需要 `eas.json` profile 与签名凭证；可以为 Android / iOS 各自建 build job。Build 还可设置 custom hook、环境变量与资源规格。

## Deploy / Fingerprint / Get Build

| Job | 作用 | 常见输入 / 输出 |
| --- | --- | --- |
| `deploy` | 部署 Web 项目至 EAS Hosting | `prod`、`alias`、`source_maps`；返回 deployment URL、alias URL、dashboard URL 与 ID。 |
| `fingerprint` | 计算 Android / iOS 原生输入 fingerprint | 只支持 CNG；环境须与 Build profile 一致；返回两个平台 hash。 |
| `get-build` | 查找匹配条件的既有 Build | 可按 platform、profile、distribution、channel、identifier、版本、commit、fingerprint、SDK / runtime version 等过滤。 |
| `repack` | 重打已有兼容 build 的 JS / 资源部分 | 适用于不需新原生代码的改动；可避免重复构建，但仍受 runtime / native compatibility 约束。 |

源页展示了 fingerprint → get-build → repack / 新 build → Maestro 的连续发布例子。代码结构的核心是使用 `needs` 输出连接 job，并为 fingerprint 与 Build 传相同 environment；这样计算结果和构建输入一致。

## Submit 与 TestFlight

- `submit` job 将指定 `build_id` 上传商店，可按 profile 获取 Play / App Store 配置。
- `testflight` job 面向更细的 TestFlight 控制：上传 Build ID 或提交已上传的 App Store Connect build、设置 internal / external groups、changelog、是否申请 Beta App Review。应只提供 `build_id` 或 `asc_build_id` 其中一个。
- Production iOS / Android 先要有 store distribution 的 app build 和商店凭证；外部 TestFlight review 还要求补全商店测试信息。

## EAS Update Jobs

- `update` job 用 branch / channel 发布 app JavaScript update；可设置 rollout percentage 和 private signing key path。它返回 update group id 和 update JSON，可供下游步骤通知团队。
- `update-rollout` job 更新已有发布的分阶段 rollout。
- `branch-delete` job 删除 EAS Update branch。

OTA 只能发与已安装 native runtime 兼容的 JS / assets；若依赖变更或原生 config 改动，Workflow 要走新的 Build job。

## Maestro 与 Maestro Cloud

`maestro` job 在 EAS Linux nested virtualization 或 iOS Simulator 环境运行 Maestro flow，参数可包括 `build_id`、`flow_path`、shards、重试次数、设备型号、屏幕录像和环境变量；hook 可在测试前生成 flow。截图和录像进入 workflow artifact。

`maestro-cloud` job 上传测试到 Maestro Cloud，输入 build ID、project ID、flow 目录，可指定 device、OS、locale、tag、config 和异步上传等选项；需要外部 Maestro Cloud 帐号与 API key。这里仅记录 Expo 文档能力，不操作第三方测试服务。

## 通知、审批与文档类 Jobs

- **Slack**：以 `webhook_url` 与 message / Block Kit payload 发通知；webhook 要用 EAS Environment variable 保管。
- **GitHub Comment**：在触发 workflow 的 PR 上评论；适合写 Build / E2E 结果。
- **Apple device registration request**：为内部 iOS 安装流程收集测试设备注册请求。
- **Require approval**：等待指定 reviewer 批准后继续后续 job，作为人工发布门禁。
- **Doc**：在 workflow run 页面显示 Markdown 帮助或后续操作说明。

示例通知结构如下，敏感 webhook 通过环境变量引用：

```yaml
jobs:
  notify:
    needs: [build_ios]
    type: slack
    environment: production
    params:
      webhook_url: ${{ env.SLACK_WEBHOOK_URL }}
      message: 'Build complete: ${{ needs.build_ios.outputs.app_version }}'
```

## 关键名词

- **Pre-packaged job**：EAS 为常见 Build / Submit / Update / Test / Deploy 任务定义的 Job 类型。
- **Job output**：任务完成后生成的 ID、URL、计数等结果，供依赖 job 使用。
- **Hook**：Job 的生命周期节点，可在 checkout、依赖安装、提交 / 测试前后执行附加步骤。
- **CNG fingerprint**：源代码、配置和依赖推导出的原生工程指纹；用于判断原生二进制能否复用。
- **Repack**：重用已有原生构建并更新兼容 JS 资源的过程。
- **Sharding**：把 E2E 测试分拆成多个批次并行跑。

## 官方代码主题覆盖

源页所有预打包 Job 类型已逐一说明：Build、Deploy、Fingerprint、Get Build、Submit、TestFlight、Update、Update Rollout、Branch Delete、Maestro、Maestro Cloud、Slack、GitHub Comment、Apple device registration request、Require Approval、Doc 和 Repack。示例代码覆盖 Build → Submit、变量驱动通知及 fingerprint / repack 流程；每种 Job 的参数组、输出 / hook、平台条件和第三方服务所需凭证类别已分组概括。该官方页有大量长 YAML 样例和参数字段表，精确 schema 可从原页查询。

## 下一页

页脚 **Next** 指向 [EAS Workflows syntax](https://docs.expo.dev/eas/workflows/syntax/)，说明 workflow YAML 的完整通用语法。

**翻页：**[上一页：EAS Workflows 入门](./010-EAS-Workflows入门.md) · [返回目录](./README.md) · [下一页：Workflow 语法](./012-EAS-Workflows语法.md)
