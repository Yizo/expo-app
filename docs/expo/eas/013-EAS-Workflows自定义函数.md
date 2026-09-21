# 013｜在 EAS Workflows 中封装可复用函数

**翻页：**[上一页：Workflow YAML 语法](./012-EAS-Workflows语法.md) · [目录](./README.md) · [下一页：Workflow 环境变量](./014-EAS-Workflows环境变量.md)

**官方页面：**[Custom functions in EAS Workflows](https://docs.expo.dev/eas/workflows/custom-functions/)

## Custom function 是什么

Custom function 把重复的 workflow steps 封装成一个目录，后续 job / hook 通过相对路径 `uses:` 调用。它比重复复制 shell commands 更容易维护，例如不同 workflow 共用 setup、缓存或检查步骤。

目录例子：

```text
.eas/
  workflows/
    preview.yml
  functions/
    setup/
      function.yml
```

`uses` 路径必须以 `./` 或 `../` 开头，并指向含 `function.yml` / `function.yaml` 的目录。`../` 可以在 EAS 项目目录外，但 function 仍须留在同一个 repository。`working_directory` 相对 job default working directory，而不是相对 function 文件本身。

## Function schema

Function 文件支持 `name`、`description`、`inputs`、`outputs`、`runs`；`runs.steps` 是必填且至少包含一步。输入默认是字符串，可声明类型、默认值、可接受值和必填项；输出是 string-valued expression：

```yaml
name: Greet
description: Greet a workflow caller.

inputs:
  - name: who
    type: string
    default_value: World
outputs:
  message:
    value: ${{ steps.make.outputs.message }}
    description: Rendered greeting.
runs:
  steps:
    - id: make
      run: set-output message 'Hello, ${{ inputs.who }}!'
```

调用时 `with` 传输入，并用 call step id 暴露 output：

```yaml
jobs:
  greet:
    type: custom
    steps:
      - id: greet
        uses: ./.eas/functions/setup
        with:
          who: Expo
      - run: echo '${{ steps.greet.outputs.message }}'
```

Function 内 `steps.*` 针对它自己的步骤；`with` / `env` / `if` 在调用方作用域解析；function step 会继承 call step 环境变量。自定义函数也可在 Build job hooks / `defaults.hooks` 中调用。

## Nesting / 限制

Custom function 能调用另一个本地 custom function 和内置 `eas/*` function。嵌套最多 10 层，不能递归。官方明确列出不允许自定义函数调用 `eas/build` 或 `eas/maestro_test`；构建和 Maestro job 应放在 workflow 的 job 层，再通过 `needs` 连接。

## 关键名词

- **Function scope**：可复用 function 自己的 `inputs`、`steps`、outputs 表达式上下文。
- **Caller scope**：workflow 引用 function 的那个 step / job 作用域。
- **Step output**：某一步用 `set-output` 发布的值，可给后面 steps 或 jobs 使用。
- **Nested function**：另一个 function 内再次 `uses` 调用本地 function。

## 官方代码主题覆盖

源页所有代码用途都覆盖：`.eas/functions` 目录布局、`uses: ./...` 调用路径规则、`function.yml` 的 name / description / inputs / outputs / runs、默认值与类型、读写 step output、在 Workflow job 调用，以及 Build hook 调用。嵌套最大深度与禁止 build / maestro 调用的限制也已说明。

## 下一页

页脚 **Next** 指向 [Environment variables in EAS Workflows](https://docs.expo.dev/eas/workflows/environment/)，介绍 YAML job / function 的环境变量作用域。

**翻页：**[上一页：Workflow YAML 语法](./012-EAS-Workflows语法.md) · [返回目录](./README.md) · [下一页：Workflow 环境变量](./014-EAS-Workflows环境变量.md)
