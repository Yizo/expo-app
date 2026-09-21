# 012｜EAS Workflows YAML 语法

**翻页：**[上一页：Workflow 预打包 Jobs](./011-EAS-Workflows预打包任务.md) · [目录](./README.md) · [下一页：自定义 Workflow 函数](./013-EAS-Workflows自定义函数.md)

**官方页面：**[Syntax for EAS Workflows](https://docs.expo.dev/eas/workflows/syntax/)

## Workflow 文件

EAS Workflow 用 YAML 描述，文件放在项目根目录的 `.eas/workflows/`，扩展名为 `.yml` / `.yaml`，官方语法页限制单个文件不超过 16 KiB。文件至少包含 human-readable `name` 和 `jobs`；可用 `run_name` 给单次运行加动态标题。

```yaml
name: Preview build
run_name: Preview for ${{ github.ref_name }}

jobs:
  build_android:
    name: Android preview
    type: build
    params:
      platform: android
      profile: preview
```

Workflow YAML 与 `eas.json` 放在相邻目录；`eas.json` 配构建档案，`.eas/workflows/*.yml` 编排多个 job。

## 触发器 `on`

| Trigger | 触发时间 |
| --- | --- |
| `push` | push branch / tag，可按名称过滤。 |
| `ref_delete` | 删除 branch / tag 时。 |
| `pull_request` | 新建 / 更新 PR，可限制 base / head branch。 |
| `pull_request_labeled`、`pull_request_comment` | PR 加 label 或添加特定评论。 |
| `app_store_connect` | App version、build upload、external beta、feedback 等状态变化。 |
| `schedule.cron` | GMT 定时任务。 |
| `workflow_dispatch.inputs` | 手动运行时提示输入或从 CLI 传参。 |

例如只在 main push 构建，并允许手动选择环境：

```yaml
on:
  push:
    branches: ['main']
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [preview, production]
        required: true
```

手动触发时可用 `eas workflow:run FILE -F environment=production`、JSON stdin 或交互提示提供 inputs。定时 workflow 只从 repository default branch 触发，时间按 GMT；有副作用的定时任务要留意重复运行。

## Jobs 与依赖关系

`jobs` 是 key / value map，key 是 workflow 内 job ID。常用字段：

| 字段 | 含义 |
| --- | --- |
| `type` | 选择预打包任务，如 `build`、`update`、`submit`、`maestro`、`deploy` 或 `custom`。 |
| `name` | Dashboard 显示名。 |
| `needs` | 等依赖 job 成功后才开始；未相互依赖的 job 默认可并行。 |
| `after` | 等前置 job 结束（无论 success / failure）后运行，常用于报告失败。 |
| `if` | 用表达式条件判断是否执行 job / step。 |
| `environment`、`env` | 选择 EAS variables 环境和 workflow inline variables。 |
| `runs_on` | 选择 Linux、macOS、Android emulator nested virtualization 等 worker。 |
| `params` | 传给相应 prepackaged job 的参数；按 Job 类型 schema 校验。 |
| `outputs` | 声明下游可引用的命名输出。 |
| `steps` | 在 custom job 中运行 shell command 或复用 function。 |
| `hooks` | Build / Deploy / Submit / Maestro 等 job 的生命周期扩展步骤。 |

## `needs` 与 `after` 示例

```yaml
jobs:
  build_ios:
    type: build
    params:
      platform: ios
      profile: preview
  publish_update:
    needs: [build_ios]
    type: update
    environment: preview
    params:
      channel: preview
  report_result:
    after: [build_ios]
    type: doc
    params:
      md: 'Build finished with status ${{ after.build_ios.status }}'
```

`needs.<job_id>.outputs.*` 引用成功依赖的产物；`after.<job_id>.status` 可在失败后报告状态。判断表达式不等于 shell command，二者在 YAML 中位置不同。

## Inputs、Outputs 与表达式上下文

Workflow expression 用 `${{ ... }}` 插入字符串 / 值。常见上下文有 `github`、`app_store_connect`、`inputs`、`workflow`、`account`、`app`、`needs`、`steps` 和 `after`。可在 run title、trigger filter、job `if`、params、env 和消息模板中引用。

用 job outputs 把一个 job 结果传给另一个：

```yaml
jobs:
  inspect:
    type: custom
    outputs:
      result: ${{ steps.inspect.outputs.result }}
    steps:
      - id: inspect
        run: set-output result 'ready'
  deploy:
    needs: [inspect]
    type: custom
    steps:
      - run: echo ${{ needs.inspect.outputs.result }}
```

workflow dispatch inputs 支持 string / number / boolean / choice 等输入形式；缺少 required input 且没有 `--non-interactive` 时，EAS CLI 可提示用户填写。

## Steps 与内置 functions

Custom job steps 常见属性有 `id`、`name`、`run`、`shell`、`uses`、`with`、`env`、`if`、`working_directory`。`uses` 可调用 `eas/checkout`、`eas/install_node_modules`、`eas/prebuild` 等内置步骤；step output 用 `${{ steps.<id>.outputs.<name> }}` 引用。

```yaml
jobs:
  check_project:
    type: custom
    steps:
      - uses: eas/checkout
      - uses: eas/install_node_modules
      - name: Inspect source
        run: pwd && ls
```

## 常见字段与高级配置

大型语法参考还包含：

- 文件级 `defaults` / runner 设置和 job concurrency；
- retry、timeout、cancel-in-progress、debug logging；
- job / step `env`、EAS Environment 与 secret handling；
- `steps` 的 `run` shell、`uses` function、working directory、outputs 和 `if` 条件；
- GitHub compatible context（actor、ref、sha、event type）；
- App Store Connect event context、cron / manual dispatch 等 event-specific data；
- built-in expression functions，如条件逻辑 / string / JSON / array utilities；
- `set-output` 在 step/job 之间传值，`set-env` 在同一个 job 后续 steps 之间传值。

`set-env` 不会自动让当前 step 立即读到新变量；在当前 shell step 也要用时，还需自己 `export`。跨 job 共享值则经 `outputs` → `needs` / job `env`，不是共享 shell process。

## 关键名词

- **YAML**：可读的缩进式配置格式；空格层级决定数据结构。
- **Context**：EAS 在 workflow 执行时提供的上下文对象，例如 event / job / step outputs。
- **`needs` / `after`**：控制 job 的成功依赖和结束依赖。
- **Step**：Job 中一条可执行命令或已封装的 EAS function。
- **Output**：step / job 执行后显式导出的字符串值，不会自动成为其它 job 的变量。
- **Cron**：周期运行的 schedule 字符串。

## 官方代码主题覆盖

源页含文件名 / 大小限制、workflow fields、所有触发器、workflow_dispatch inputs / 三种传参方式、jobs / dependencies / environment / env / hooks、steps / built-ins、contexts / expressions、GitHub context 迁移字段、cron、outputs、`set-output`、`set-env`、custom steps 等大量 YAML / CLI 示例。本页给出核心同构示例并逐类概括完整字段与事件组，完整逐属性 schema 仍以官方页面为准。

## 下一页

页脚 **Next** 指向 [Custom functions](https://docs.expo.dev/eas/workflows/custom-functions/)，讲如何封装可复用 workflow step 序列。

**翻页：**[上一页：Workflow 预打包 Jobs](./011-EAS-Workflows预打包任务.md) · [返回目录](./README.md) · [下一页：自定义 Workflow 函数](./013-EAS-Workflows自定义函数.md)
