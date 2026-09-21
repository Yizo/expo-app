# 034｜EAS Workflows：运行第一个 Job

**翻页：**[上一页：CI/CD Tutorial 导言](./033-CICD-Tutorial导言.md) · [目录](./README.md) · [下一页：Development Builds](./035-CICD-Development-Builds.md)

**官方页面：**[Run your first EAS Workflows job](https://docs.expo.dev/tutorial/cicd/first-workflow/)

**版本边界：**EAS Workflows 是云端服务；本页 YAML 语法依照官方当前教程，SDK v56 项目的原生构建部分需结合 [SDK v56.0.0 参考](https://docs.expo.dev/versions/v56.0.0/)和项目的 `eas.json`。教程会让读者创建文件、提交并推送 GitHub；此处只保留重写示例，不运行命令、不修改仓库、不触发任何工作流。

## 本章会完成什么

在 Expo 项目中创建一个自定义工作流，先手动运行并在 Dashboard 查看输出，然后设置 push 到 `main` 时自动执行。最后用 job 输出连接两个任务，让后一个任务把前一个的值显示到 EAS Dashboard。

**Workflow file** 是项目里的 YAML 配置；文件可包含一个或多个 **job**。job 可由 `type` 指定 EAS 预打包动作，也可通过 `steps` 执行自定义 shell 命令。

## 准备工作流目录

EAS 只会扫描 Expo 项目根目录下 `.eas/workflows/` 中的 workflow 文件：

```sh
mkdir -p .eas/workflows
```

在此目录创建 `hello.yml`。下面是一个自定义 job，它只打印一句消息：

```yaml
name: Hello

jobs:
  greet:
    steps:
      - run: echo "Hello from EAS Workflows"
```

- `name` 是 Dashboard 展示的工作流名称。
- `jobs` 是任务集合，`greet` 是其中一个唯一 ID。
- `steps` 按顺序执行一组步骤。
- `run` 调用 shell 命令；没有 `type` 而有 `steps` 的 job 就是 custom job。

## 手动运行与查看日志

从项目根目录把工作流提交给 EAS 并运行：

```sh
eas workflow:run .eas/workflows/hello.yml
```

EAS CLI 会上传文件并运行任务，随后输出 Dashboard 页面链接。打开链接可查看 `greet` job 状态、日志和保存下来的 workflow 文件。Dashboard 的 workflow graph 会展示触发信息与 job 关系。

## 加入自动触发器

在 YAML 中添加 `on.push.branches`，使 `main` 有新提交推送时触发：

```yaml
name: Hello

on:
  push:
    branches: [main]

jobs:
  greet:
    steps:
      - run: echo "Hello from EAS Workflows"
```

branches 可以包含一个或多个分支，例如 `['main', 'develop', 'staging']`。确认 Expo project 已关联 GitHub repository 后，团队通常会把工作流文件提交并推送到相应分支；对应命令主题如下（仅展示，不执行）：

```sh
git add .eas/workflows/hello.yml
git commit -m "Add hello workflow"
git push origin main
```

本地排查连接时，官方教程也建议查看 remote URL：

```sh
git remote -v
```

EAS Dashboard 的 Workflows 页面可显示 push 触发的运行，并提供对应 commit、branch、job 图和状态。

## 其他触发类型

- `on.pull_request`：PR 创建或更新时启动。
- `on.push.tags`：指定标签推送后启动。
- `on.pull_request_labeled`：PR 添加匹配 label 时启动。

触发规则需与 GitHub repository 连接和 branch/tag 条件相符；手动执行 `eas workflow:run` 适合临时运行一次，自动触发则把规则保存在项目配置中。

## 串联 Job、参数与输出

job 默认可以并行执行。用 `needs` 声明依赖后，后续 job 等待前置 job 成功；前置失败时依赖 job 会跳过。下面第一个 job 用 `set-output` 暴露字符串，第二个 EAS 预打包的 `doc` job 等待它完成，再把字符串渲染为 Markdown：

```yaml
name: Greeting report

jobs:
  greet:
    outputs:
      greeting: ${{ steps.set_greeting.outputs.greeting }}
    steps:
      - id: set_greeting
        run: set-output greeting "Hello from EAS Workflows"

  show_info:
    needs: [greet]
    type: doc
    params:
      md: |
        # Workflow Output
        **${{ needs.greet.outputs.greeting }}**
```

这段配置展示了几种不同层级的值：

1. 自定义 step 的 `id` 让 job 能引用该步骤。
2. `set-output` 写入名为 `greeting` 的 step 输出。
3. job 的 `outputs` 把 step 输出映射成 job 级别的输出。
4. `needs: [greet]` 等待 `greet` 成功，并允许后续任务读取其结果。
5. `type: doc` 是预打包任务，它把 `params.md` 内容显示在 Dashboard。

再次通过 CLI 手动运行同一文件，就能在图和日志中观察先后关系：

```sh
eas workflow:run .eas/workflows/hello.yml
```

本章结束后可删除临时文件；若保留，则去掉 `on.push`，避免每次推送 `main` 都继续运行示例。

## 关键名词

- **预打包 Job（pre-packaged job）：**通过 `type` 使用 EAS 提供的 `build`、`submit`、`update`、`doc` 等现成动作。
- **自定义 Job（custom job）：**通过 `steps` 和 `run` 执行项目需要的 shell 命令或脚本。
- **Trigger：**自动启动 workflow 的事件规则；`on` 是 YAML 中定义触发器的字段。
- **Job output：**job 对后续 job 暴露的数据；与某个 shell 命令的标准输出日志不是同一个概念。
- **Job dependency：**用 `needs` 表达的先后关系；没有依赖时任务可并行。

## 官方代码主题覆盖

源页的代码与命令均在本页有对应示例：创建 `.eas/workflows/`；最小 `hello.yml` 自定义 job；`eas workflow:run` 手动执行；`on.push.branches` 自动触发与多分支写法；提交/推送工作流文件及 `git remote -v` 检查；`pull_request`、tag、PR label 触发主题；通过 `steps`、`outputs`、`needs`、表达式及预打包 `doc` job 串联任务；再次手动运行链式任务。Git 命令是官方教程示例内容，没有在工作区执行。

## 下一页

官方 **Next** 是 [Development builds](https://docs.expo.dev/tutorial/cicd/development-builds/)，用 fingerprinting 自动化开发构建并避免没有原生变化时重复 build。

**翻页：**[上一页：CI/CD Tutorial 导言](./033-CICD-Tutorial导言.md) · [返回目录](./README.md) · [下一页：Development Builds](./035-CICD-Development-Builds.md)
