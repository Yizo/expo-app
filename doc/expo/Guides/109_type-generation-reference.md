# Expo Swift 模块 TypeScript 类型生成参考

## 能力与平台限制

`expo-type-information` 从 Swift Expo 模块提取类型并生成 TypeScript 接口。它包含 SourceKitten 解析器、Expo 模块类型抽象、TypeScript AST 输出器和 CLI。

该库从 **SDK 56** 开始提供，并且 **只能在 macOS 工作**。文档未提供 Kotlin 到 TypeScript 的同等生成能力。

## 安装

```sh
npx expo install expo-type-information
brew install sourcekitten
```

前者安装 Expo 包，后者安装底层 Swift 解析器。

## CLI 通用选项

| 选项 | 作用 | 注意事项 |
| --- | --- | --- |
| `-i, --input-paths` | Swift 文件路径，可用 glob | 无默认值 |
| `-m, --module-path` | Expo 模块根目录 | 无默认值 |
| `-o, --output-path` | 输出路径 | 不传则打印到控制台 |
| `-t, --type-inference` | 三档推断 | 默认 `SIMPLE_INFERENCE`；最高档失败时降级 |
| `-s, --skip-unicode-character-mapping` | 跳过非 ASCII 映射 | 默认映射以修复 SourceKitten 偏移问题 |
| `-w, --watcher` | 监听输入变化 | 默认关闭 |

除 `inline-modules-interface` 外，命令使用这些通用选项。

## 主要命令

### `module-interface`

生成完整接口：`types.ts`、原生模块 `module.ts`、每个视图的 `view.tsx` 和重新导出的 `index.ts`。

### `inline-modules-interface`

为每个 Swift inline module 生成 `Module.generated.ts` 和 `Module.tsx`。前者每次重写；后者已存在时不重写，可作为稳定编辑层。专用选项包括指向 app config 的 `--app-json`、`--watcher` 和推断级别。

### `short-module-interface`

覆盖 `ModuleName.generated.ts`，仅在不存在时创建 `ModuleName.ts`，也可用于 inline modules。

### `generate-mocks-for-file`

为给定 Expo 模块生成 mocks。

### 辅助命令

`other type-information` 输出 `FileTypeInformation` JSON；`other generate-module-types`、`other generate-view-types`、`other generate-jsx-intrinsics` 生成对应声明；`other preprocess-file` 展示 SourceKitten 解析前的源码，便于排查路径与推断配置。

## 编程 API

- `getFileTypeInformation(options)` 从 Swift 文件或源码字符串提取类型；字符串输入或最高推断级别会创建临时文件，失败返回 `null`。
- `serializeTypeInformation`/`deserializeTypeInformation` 在 Set、Map 与可 JSON 化数组结构间转换，主要用于测试。
- `generateConciseTsInterface` 生成稳定包装与易失生成文件。
- `generateFullTsInterface` 生成 index、模块、类型和视图文件，失败返回 `null`。
- `generateModuleTypesFileContent`、`generateViewTypesFileContent`、`generateJSXIntrinsicsFileContent` 分别生成模块、视图和全局 JSX 声明字符串。
- `generateMocks(files, outputLanguage)` 生成 JS/TS mock，默认 JavaScript。
- `getAllExpoModulesInWorkingDirectory()` 收集工作目录中的 Expo 模块。

## 类型抽象

`FileTypeInformation` 汇总模块类、Record、枚举、类型标识符和定义映射。声明带 `definitionOffset`，用于在异步收集后恢复源码顺序。

`TypeKind` 包括基础类型、标识符、联合、泛型参数化、可选、数组、字典；`BasicType` 包括 any、string、number、boolean、void、undefined、unresolved。模块声明可包含函数、类、构造器、事件、常量、属性、props 和 views。

`ArrayType`/`OptionalType` 的类别隐含于父类型系统，对象本身没有显式标识字段。

## 推断级别

- `NO_INFERENCE`：不推断。
- `SIMPLE_INFERENCE`：基础推断，CLI 默认。
- `PREPROCESS_AND_INFERENCE`：改写返回表达式后再推断，可能得到更多信息，也可能失败。

启用推断可能让计算耗时超过两倍。

## Swift 解析限制

- SourceKitten 对嵌套 closure 有限，DSL `Class` 方法返回类型可能为 `unresolved`。
- 最高推断会改写 `return expression`；字符串、注释可能令改写失败，尾表达式返回也无法解析。
- DSL 支持不完整。例如 `Events` 可在 `View` 内解析，但模块定义中的事件当前不解析。
- Unicode 会破坏 SourceKitten 偏移，因此默认映射字符。
- 当前支持解析 `AsyncFunction`、`Constant`、`Constructor`、`Events`、`Function`、`Name`、`Prop`、`Property`、`View`。
- Swift `struct`/`class` 必须遵循 `Record`，仅解析 `@Field`。
- enum 支持普通 case，不解析关联值。

## 建议与信息边界

- 不要手改 `*.generated.ts`，把自定义包装放入不会重写的文件。
- **基于文档内容推导：** 公共 API 显式写 Swift 返回类型，减少对推断的依赖。
- **基于文档内容推导：** 因工具仅支持 macOS，CI 需安排 macOS job 或管理预生成产物。
- 文档未说明生成文件是否提交 Git、Android 对齐策略和完整端到端示例。

