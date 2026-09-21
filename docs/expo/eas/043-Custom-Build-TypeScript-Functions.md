# 043｜Custom Build：编写 TypeScript Functions

**翻页：**[上一页：Custom Build 配置 Schema](./042-Custom-Build-Config-Schema.md) · [目录](./README.md) · [下一页：Build Lifecycle Hooks](./044-Build-Lifecycle-Hooks.md)

**官方页面：**[TypeScript functions](https://docs.expo.dev/custom-builds/functions/)

**版本边界：**本页讲 EAS Build custom function 的作者工具与运行时接口，属于 Custom Builds 文档而非 Expo SDK API。官方 generator / 编译命令可能更新；项目 Expo ~56.0.11 不会自动固定 create-eas-build-function 或 ncc 的版本。示例仅用于学习，没有创建真实 function 或触发构建。

## TypeScript Function 是什么

Custom Build Function 是可复用的构建步骤。它可以封装 Bash 不好表达的复杂逻辑，也可以声明结构化 inputs / outputs，在 build YAML 中多次调用。函数在 EAS builder 运行，因此必须编译成不依赖安装额外 npm packages 的单个 JavaScript 文件。

本地开发主要经历：创建模块 → 写 TypeScript → 用 ncc 打包 → 从 custom build YAML 引用编译产物。

## 初始化模块

从 eas.json 所在项目目录运行 Expo 官方 generator：

```sh
npx create-eas-build-function@latest ./.eas/build/myFunction
```

它会在 .eas/build/myFunction 下生成模块配置和 src/index.ts 默认模板。函数实现接收 BuildStepContext，可以通过 logger 向 EAS build logs 输出消息：

```ts
import { BuildStepContext } from "@expo/steps";

async function myFunction(ctx: BuildStepContext): Promise<void> {
  ctx.logger.info("Hello from a custom TypeScript function");
}

export default myFunction;
```

## 编译为单个 JavaScript 文件

默认 package.json 的 build script 使用 @vercel/ncc 将 TypeScript 和依赖打包成一个文件。如果本机尚未安装 ncc，可以安装 CLI，再从 function 模块目录运行 build：

```sh
npm install -g @vercel/ncc
cd .eas/build/myFunction
npm run build
```

生成的脚本使用下面的 package.json script：

```json
{
  "scripts": {
    "build": "ncc build ./src/index.ts -o build/ --minify --no-cache --no-source-map-register"
  }
}
```

编译结果是 build/index.js。这个文件必须包含在项目上传给 EAS Build 的 archive 里；检查 .gitignore 和 .easignore，不要把编译目录排除掉。修改 src/index.ts 后需要重新编译。

## 在 Custom Build YAML 中注册并调用

在 .eas/build/config.yml 中，functions.my_function 指向相对于 config.yml 的 function 目录；之后可以把该名称作为一个 step：

```yaml
build:
  name: Custom function demo
  steps:
    - eas/checkout
    - eas/install_node_modules
    - my_function
    - run:
        name: Finished
        command: echo "Finished"

functions:
  my_function:
    name: My function
    path: ./myFunction
```

例如，上面的 YAML 位于 .eas/build，而函数模块位于 .eas/build/myFunction，所以 path 写成 ./myFunction。若目录关系变化，必须一并校准相对路径。

## 编写一个带 Inputs / Outputs 的函数

示例函数接收两个 number inputs，把它们相加并以字符串 output 返回。在 build YAML 中用 id 给步骤命名，再从后续 step 引用结果：

```yaml
build:
  name: Add two numbers
  steps:
    - eas/checkout
    - eas/install_node_modules
    - my_function:
        inputs:
          num1: 1
          num2: 2
        id: sum_function
    - run:
        name: Print the sum
        inputs:
          sum: ${ steps.sum_function.sum }
        command: echo "Sum is ${ inputs.sum }"

functions:
  my_function:
    name: Add two values
    inputs:
      - name: num1
        type: number
      - name: num2
        type: number
    outputs:
      - name: sum
    path: ./myFunction
```

在 TypeScript 中用 Expo Steps 提供的泛型描述输入输出类型。ctx 是 BuildStepContext；inputs 的每项通过 value 读取；outputs.sum.set 写入值。当前 outputs 需要传 string，因此 number 要先转换：

```ts
import {
  BuildStepContext,
  BuildStepInput,
  BuildStepInputValueTypeName,
  BuildStepOutput,
} from "@expo/steps";

interface FunctionInputs {
  num1: BuildStepInput<BuildStepInputValueTypeName.NUMBER, true>;
  num2: BuildStepInput<BuildStepInputValueTypeName.NUMBER, true>;
}

interface FunctionOutputs {
  sum: BuildStepOutput<true>;
}

async function myFunction(
  ctx: BuildStepContext,
  {
    inputs,
    outputs,
  }: {
    inputs: FunctionInputs;
    outputs: FunctionOutputs;
  }
): Promise<void> {
  const sum = inputs.num1.value + inputs.num2.value;
  ctx.logger.info(${inputs.num1.value} + " + " + ${inputs.num2.value} + " = " + sum);
  outputs.sum.set(sum.toString());
}

export default myFunction;
```

Build YAML 中的 id 让后续 step 用 steps.sum_function.sum 读取结果；自定义 TypeScript 函数可重复注册到其他 build config。

## 关键名词

- **BuildStepContext：**EAS function 的运行上下文，提供日志与构建步骤能力。
- **Input / Output：**YAML caller 向函数传参 / 函数向后续步骤返回值的接口。
- **ncc：**将 Node.js / TypeScript 函数及其依赖打包为可独立运行单文件的工具。
- **Function module：**包括源文件、package.json、编译结果的目录；path 从 custom build config 所在目录计算。
- **Project archive：**EAS Build 上传到云端的项目内容；被 ignore 的 build/index.js 不会出现在云构建器上。

## 官方代码主题覆盖

源页代码步骤均有重写示例：create-eas-build-function generator；默认 BuildStepContext TypeScript 模板；ncc CLI 安装与 npm run build；package.json build script；.eas/build/config.yml 的 functions.path 注册和 step 调用；number inputs / sum output 的 YAML 声明、步骤 id 和表达式；TypeScript 泛型、logger 与 outputs.set。生成的 build/index.js 必须包含在 EAS archive 中也已注明。

## 下一页

官方页脚 **Next** 是 [Build lifecycle hooks](https://docs.expo.dev/build-reference/npm-hooks/)，讲解 EAS Build 在安装 npm 依赖时触发的生命周期脚本。

**翻页：**[上一页：Custom Build 配置 Schema](./042-Custom-Build-Config-Schema.md) · [返回目录](./README.md) · [下一页：Build Lifecycle Hooks](./044-Build-Lifecycle-Hooks.md)
