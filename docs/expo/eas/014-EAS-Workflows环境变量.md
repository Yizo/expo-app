# 014｜EAS Workflows 的环境变量与上下文

**翻页：**[上一页：EAS Workflow 自定义函数](./013-EAS-Workflows自定义函数.md) · [目录](./README.md) · [下一页：自动化 EAS CLI 命令](./015-自动化EAS-CLI命令.md)

**官方页面：**[Environment variables in EAS Workflows](https://docs.expo.dev/eas/workflows/environment/)

## 在 Workflow job 中读取变量

每个 job 都在 worker 上运行，可以在 YAML 表达式中写 `${{ env.NAME }}`，也可以在 `run` shell 里用 `$NAME` 或 Node 的 `process.env.NAME`：

```yaml
name: Print build information
jobs:
  show_project:
    steps:
      - run: echo 'Project: ${{ env.EAS_BUILD_PROJECT_ID }}'
      - run: echo "Project: $EAS_BUILD_PROJECT_ID"
```

内插上下文有执行时机：job 的 `params`、`if`、`outputs` 在 job 发到 worker 前解析，此时可读 EAS environment variables；worker / job `env` 还没出现。`run` steps 在 worker 上解析，可读 EAS variables、job `env` 与 worker built-in values。像 `EAS_BUILD_ID` 这类值应从 `run` step 读，而不是在 job `params` 生成前内插。

## 环境变量优先级

同名变量合并时，优先级从高到低是：

1. job YAML 里的 `env`（普通文本）；
2. `eas.json` 对应 build profile 的 `env`（Build job）；
3. 被 job 选中的 EAS Environment（development / preview / production）；
4. worker 自动加入的 `EAS_BUILD_ID`、`CI` 等系统变量。

不同 Job 对 `environment` 默认值略有差异：Build 从 build profile 取得，Submit 继承 build，Maestro / Maestro Cloud 默认 preview，其它 job 默认 production。要确保 update / fingerprint / deploy 与 build 用同一组 values，最好显式配置。

```yaml
jobs:
  build_preview:
    type: build
    params:
      platform: ios
      profile: preview
  publish_update:
    needs: [build_preview]
    type: update
    environment: preview
    env:
      APP_VARIANT: preview
```

## Workflow 表达式的上下文

`${{ ... }}` 支持多个运行数据对象：

| Context | 提供的信息 |
| --- | --- |
| `env` | EAS / job / runtime 环境变量。仅在 job 范围内有定义，不能放 workflow 顶层 trigger。 |
| `github` | GitHub event 类型、commit SHA、ref、repository、PR 号 / 分支 / labels 等；手动触发时部分字段为空。 |
| `inputs` | 手动 `workflow_dispatch` 提供的输入值。 |
| `needs` | 成功依赖 job 的 status 和 outputs。 |
| `after` | 已完成的 job 状态与 outputs，即使前置 job 失败也可读取。 |
| `steps` | 当前 job 里有 `id` 的步骤及 `set-output` 返回值。 |
| `metadata` | Build job 的 app version、SDK/runtime version、build profile、build number 等元数据。 |
| `workflow` | 当前运行的 workflow id、name、file name、dashboard URL。 |
| `app_store_connect` | 仅在 App Store Connect event 触发时存在的 app / version / build upload / beta 状态。 |

需要排查变量内容时可在 job 内打印 JSON context；日志可能包含敏感环境变量值，要避免将 secrets 输出到日志。

## Job 之间共享值

`set-env` 只让同一 job 的后续 steps 看见一个 runtime 环境变量；不能跨 jobs。跨 job 使用 Job `outputs` / `needs`：

```yaml
jobs:
  generate:
    outputs:
      release_tag: ${{ steps.make.outputs.release_tag }}
    steps:
      - id: make
        run: set-output release_tag "release-2026-09"
  deploy:
    needs: [generate]
    env:
      RELEASE_TAG: ${{ needs.generate.outputs.release_tag }}
    steps:
      - run: echo "$RELEASE_TAG"
```

worker 自动提供的构建变量和标准工具链变量可在 runtime step 读取，例如项目 / build ID、平台、profile、working directory、`ANDROID_HOME` / `JAVA_HOME`。不要自己复用 `EAS_` 前缀，避免覆盖平台值。

## 关键名词

- **Interpolation**：在 Workflow 执行前 / worker 上用 `${{ ... }}` 把表达式替换成变量值。
- **Precedence**：多个来源定义同名值时采用的优先级顺序。
- **Context object**：描述触发事件、依赖 job 或 build metadata 的运行期数据对象。
- **`set-env`**：把值传给同一 job 的后续 steps。
- **`set-output`**：命名 step / job 输出，使后续步骤 / jobs 可读取。

## 官方代码主题覆盖

源页示例主题都有改写：shell / `${{ env }}` 两种读取、EAS/job/build-profile env 优先级、Job environment defaults、`github`/`inputs`/`needs`/`after`/`steps`/`metadata`/`workflow`/`app_store_connect` contexts、runtime built-ins、`set-env` 单 job 传值与 `set-output` 跨 job 传值。敏感变量在日志中打码的边界也已解释。

## 下一页

页脚 **Next** 指向 [Automating EAS CLI commands](https://docs.expo.dev/eas/workflows/automating-eas-cli/)，示范把 `eas build` / `submit` / `update` 写成 Workflow。

**翻页：**[上一页：EAS Workflow 自定义函数](./013-EAS-Workflows自定义函数.md) · [返回目录](./README.md) · [下一页：自动化 EAS CLI 命令](./015-自动化EAS-CLI命令.md)
