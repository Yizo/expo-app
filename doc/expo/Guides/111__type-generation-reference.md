# Expo 类型生成参考文档

> 原文地址：https://docs.expo.dev/modules/type-generation-reference/

本文档详细介绍了 `expo-type-information` 工具库，该库用于自动从 Swift Expo 模块中生成 TypeScript 类型定义。

> **重要限制**：此工具 **仅可在 macOS 上使用**，且需要 Expo SDK 56 或更高版本。

## 概述

`expo-type-information` 是一个自动化工具，它的核心架构由以下四个部分组成：

| 组件 | 说明 |
|------|------|
| **Swift 解析器** | 基于 [sourcekitten](https://github.com/jpsim/SourceKitten) 的 Swift 源码解析引擎 |
| **类型抽象层** | 将 Swift 类型系统映射为中间表示（抽象类型节点） |
| **TypeScript AST 发射器** | 将抽象类型转换为 TypeScript 代码输出 |
| **命令行接口（CLI）** | 提供多种命令用于生成类型定义、Mock 文件等 |

> **初学者须知**：
> - **sourcekitten**：一个开源的 Swift 代码解析工具，能够分析 Swift 源码并提取结构化信息（如函数签名、类型声明等）。
> - **AST（抽象语法树）**：编译器用来表示代码结构的数据结构。这里指工具将 Swift 代码解析为树状结构，再转换为 TypeScript。
> - **DSL（领域特定语言）**：Expo 模块定义中使用的一套特定 API 语法，如 `AsyncFunction`、`View`、`Constant` 等。

---

## 配置安装

### 安装 expo-type-information

使用你常用的 Node.js 包管理器安装该库：

```sh
# npm
npx expo install expo-type-information

# yarn
yarn expo install expo-type-information

# pnpm
pnpm expo install expo-type-information

# bun
bun expo install expo-type-information
```

### 安装 SourceKitten

SourceKitten 是底层 Swift 解析器依赖，需要通过 Homebrew 安装：

```sh
brew install sourcekitten
```

> **初学者须知**：[Homebrew](https://brew.sh/) 是 macOS 上的包管理器，如果你尚未安装，可访问其官网获取安装指引。

---

## CLI 参考

### 通用 CLI 选项

除 `inline-modules-interface` 命令外，大部分命令共享以下标准选项：

| 标志 | 说明 | 默认值 |
|------|------|--------|
| `-i, --input-paths <filePaths...>` | Swift 文件路径；支持 glob 通配符模式。 | 无 |
| `-m --module-path <modulePath>` | Expo 模块的根目录路径。 | 无 |
| `-o, --output-path <filePath>` | 输出文件的目标路径；若未指定，结果将打印到终端。 | 无 |
| `-t, --type-inference <typeInference>` | 类型推断级别，可选值：`NO_INFERENCE`（无推断）、`SIMPLE_INFERENCE`（简单推断）、`PREPROCESS_AND_INFERENCE`（预处理并推断）。 | `SIMPLE_INFERENCE` |
| `-s, --skip-unicode-character-mapping` | 跳过非 ASCII 字符的映射处理。 | 无 |
| `-w --watcher` | 监听输入文件路径的变更并自动重新生成。 | 无 |

> **初学者须知**：
> - **glob 通配符**：一种文件名匹配模式，例如 `*.swift` 匹配所有 Swift 文件，`src/**/*.swift` 匹配 src 目录下所有层级的 Swift 文件。
> - **类型推断**：工具自动分析 Swift 代码并推断出函数返回类型等类型信息的过程，级别越高分析越深入但耗时也越长。

> **注意**：`PREPROCESS_AND_INFERENCE` 推断级别偶尔可能会失败。当遇到此情况时，需要回退到 `SIMPLE_INFERENCE` 或 `NO_INFERENCE` 模式。

### 主要命令

#### `module-interface`

生成完整的 TypeScript 接口定义。该命令会为 Swift 模块输出一组完整的文件：

- **`types.ts`** — 包含所有模块类型定义
- **`module.ts`** — 定义原生模块的包装器
- **`view.tsx`** — 为模块中定义的每个 View 生成一个文件
- **`index.ts`** — 重新导出所有定义的索引文件

使用上述通用 CLI 选项。

#### `inline-modules-interface`

为内联 Swift 模块生成 TypeScript 定义。该命令会创建两个文件：

- **`Module.generated.ts`** — 每次运行都会被覆盖的重新生成文件（不要手动修改此文件）
- **`Module.tsx`** — 跨运行保留的稳定用户文件（可在此文件中添加自定义逻辑）

该命令使用专属选项而非通用选项：

| 标志 | 说明 | 默认值 |
|------|------|--------|
| `-a --app-json <appJsonPath>` | 应用配置文件（`app.json`）的路径，用于定义监听目录。 | 无 |
| `-w --watcher` | 监听内联模块文件的变更。 | 无 |
| `-t, --type-inference <typeInference>` | 类型推断级别，可选值：`NO_INFERENCE`、`SIMPLE_INFERENCE`、`PREPROCESS_AND_INFERENCE`。 | `SIMPLE_INFERENCE` |

> **基于经验建议**：内联模块是直接在应用项目中定义的模块（而非独立的库模块），因此需要 `app.json` 来确定模块位置。如果你使用的是独立模块项目，请使用 `module-interface` 命令。

#### `short-module-interface`

生成简短的 TypeScript 接口定义。该命令会：

- 覆盖重新生成的文件（`ModuleName.generated.ts`）
- 如果稳定文件（`ModuleName.ts`）不存在，则创建它

兼容内联模块，使用通用 CLI 选项。

#### `generate-mocks-for-file`

为指定模块生成 Mock（模拟）实现。使用通用 CLI 选项。

> **初学者须知**：**Mock** 是一种测试用的替身对象，它模拟真实模块的接口行为，让你可以在不依赖原生代码的情况下进行 JavaScript/TypeScript 层的测试。

### 其他命令

以下为内部工具命令，均接受通用 CLI 选项：

| 命令 | 说明 |
|------|------|
| `other type-information` | 提取并以 JSON 格式输出 `FileTypeInformation` 对象 |
| `other generate-module-types` | 生成模块类型声明的内容 |
| `other generate-view-types` | 生成原生 View 类型声明的内容 |
| `other generate-jsx-intrinsics` | 使用 View 的 props 更新全局 JSX 内联元素声明 |
| `other preprocess-file` | 显示解析前的文件状态，用于调试类型推断选项 |

> **基于文档内容推导**：`other preprocess-file` 命令主要用于排查类型生成失败的问题——通过查看预处理后的文件内容，可以判断 `PREPROCESS_AND_INFERENCE` 模式为何在某些文件上失败。

---

## 编程式 API

除了 CLI 之外，`expo-type-information` 还提供了可编程的 API，方便在代码中直接调用。

### 类型信息抽象

#### `deserializeTypeInformation(fileTypeinformationSerialized)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileTypeinformationSerialized` | [FileTypeInformationSerialized](#filetypeinformationserialized) | 需要反序列化的 `FileTypeInformationSerialized` 对象。 |

用于测试目的，将数组映射为 Set 和 Map（根据字段不同），并返回 `FileTypeInformation` 对象。

**返回值**：`FileTypeInformation` 对象。

#### `getFileTypeInformation(options)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `options` | [GetFileTypeInformationOptions](#getfiletypeinformationoptions) | 配置对象，包含输入源（文件或字符串）以及所需的类型推断级别。 |

从提供的文件路径或原始源代码字符串中读取并提取 `FileTypeInformation`。如果提供了原始字符串，或者选择了 `PREPROCESS_AND_INFERENCE` 推断选项，该函数将创建一个临时文件来辅助解析。

**返回值**：`Promise<FileTypeInformation>` — 如果输入被成功解析，返回一个解析为 `FileTypeInformation` 对象的 Promise；否则返回 `null`。

#### `serializeTypeInformation(fileTypeinformation)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileTypeinformation` | [FileTypeInformation](#filetypeinformation) | 需要序列化的 `FileTypeInformation` 对象。 |

用于测试目的，将 Set 和 Map 映射为数组，返回可以写入 JSON 的 `FileTypeInformationSerialized` 对象。

**返回值**：`FileTypeInformationSerialized` 对象。

### TypeScript 生成

#### `generateConciseTsInterface(fileTypeInformation)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileTypeInformation` | [FileTypeInformation](#filetypeinformation) | Expo 模块的抽象类型信息。 |

为 Expo 模块生成简短的 TypeScript 接口。创建两个文件的内容：一个易变的生成文件（包含原始类型定义），以及一个稳定的面向用户的文件（包装并导出原生模块方法）。

**返回值**：`Promise<{ moduleTypescriptInterfaceFileContent: string, volatileGeneratedFileContent: string }>` — 包含易变生成文件和稳定 TypeScript 接口文件的字符串内容。

#### `generateFullTsInterface(fileTypeInformation)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileTypeInformation` | [FileTypeInformation](#filetypeinformation) | Expo 模块的抽象类型信息。 |

为 Expo 模块生成完整的多文件 TypeScript 接口。生成的接口分为：类型定义文件、原生模块包装文件、每个 View 的独立文件、以及重新导出所有定义的索引文件。

**返回值**：`Promise<{ indexFile: OutputFile, moduleNativeFile: OutputFile, moduleTypesFile: OutputFile, moduleViewsFiles: OutputFile[] } | null>` — 包含所有生成文件的字符串内容的对象；如果生成失败则返回 `null`。

#### `generateJSXIntrinsicsFileContent(fileTypeInformation)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileTypeInformation` | [FileTypeInformation](#filetypeinformation) | Expo 模块的抽象类型信息。 |

生成原生 View 类型声明文件的 TypeScript 字符串内容，该文件将 View 的 props 挂载到全局 `JSXIntrinsics` 上。

**返回值**：`Promise<string>` — 包含 TypeScript 声明文件内容的字符串；如果生成失败则返回 `null`。

> **初学者须知**：**JSX Intrinsics** 是 TypeScript 中用于定义 JSX 元素（如 `<MyView />`）的类型接口。通过挂载到全局 JSX Intrinsics 上，你可以在 JSX 中直接使用自定义 View 组件并获得完整的类型检查和自动补全。

#### `generateModuleTypesFileContent(fileTypeInformation)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileTypeInformation` | [FileTypeInformation](#filetypeinformation) | Expo 模块的抽象类型信息。 |

生成原生模块类型声明文件的 TypeScript 字符串内容。

**返回值**：`Promise<string>` — 包含 TypeScript 模块声明文件内容的字符串；如果生成失败则返回 `null`。

#### `generateViewTypesFileContent(fileTypeInformation)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileTypeInformation` | [FileTypeInformation](#filetypeinformation) | Expo 模块的抽象类型信息。 |

生成原生 View 类型声明文件的 TypeScript 字符串内容。

**返回值**：`Promise<string>` — 包含 TypeScript 声明文件内容的字符串；如果生成失败则返回 `null`。

### Mock 生成

#### `generateMocks(files, outputLanguage)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `files` | [FileTypeInformation[]](#filetypeinformation) | 包含多个模块类型信息的 `FileTypeInformation` 对象列表 |
| `outputLanguage`（可选） | `'typescript' \| 'javascript'` | 输出 Mock 的语言。默认值：`'javascript'` |

为每个提供的 `FileTypeInformation` 对象生成 JavaScript/TypeScript Mock 实现。

**返回值**：`Promise<void>`

#### `getAllExpoModulesInWorkingDirectory()`

获取当前工作目录下的所有 Expo 模块。

**返回值**：`Promise<FileTypeInformation[]>`

---

## 组件

### `withPreparedSingleFile`

类型：`React.Element<[GetFileTypeInformationOptions](#getfiletypeinformationoptions)>`

一个用于准备单文件的 React 元素包装器。

---

## 类型定义

### `AnonymousType`

字面量类型：`union`

表示匿名类型——即没有名称、直接写在代码中的类型，例如内联泛型、数组或可选类型。

可接受的值：[ParametrizedType](#parametrizedtype) | [SumType](#sumtype) | [OptionalType](#optionaltype) | [DictionaryType](#dictionarytype) | [ArrayType](#arraytype)

### `Argument`

表示传递给函数或构造函数的参数。

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| undefined` | 参数名称 |
| `type` | [Type](#type) | 参数类型 |

### `ArrayType`

类型：[Type](#type)

表示某种特定类型的列表或数组。

> **注意**：该类型为数组的信息是**隐式的**，仅存在于类型系统和父类型上。`ArrayType` 对象上没有显式指示此信息的字段。

### `ClassDeclaration`

表示 DSL 原生类声明。

继承自 [DefinitionOffset](#definitionoffset)，扩展属性如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| `asyncMethods` | [FunctionDeclaration[]](#functiondeclaration) | 异步方法列表 |
| `constructor` | [ConstructorDeclaration](#constructordeclaration) \| `null` | 构造函数声明 |
| `methods` | [FunctionDeclaration[]](#functiondeclaration) | 同步方法列表 |
| `name` | `string` | 类名 |
| `properties` | [PropertyDeclaration[]](#propertydeclaration) | 属性列表 |

### `ConstantDeclaration`

表示 DSL 常量声明。

继承自 [DefinitionOffset](#definitionoffset)，扩展属性如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 常量名 |
| `type` | [Type](#type) | 常量类型 |

### `ConstructorDeclaration`

表示 DSL 类构造函数声明。

继承自 [DefinitionOffset](#definitionoffset)，扩展属性如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| `arguments` | [Argument[]](#argument) | 构造函数参数列表 |

### `DefinitionOffset`

记录元素在文件中的定义位置。由于类型信息收集是异步进行的，结果具有非确定性。为了使其具有确定性，工具会按照 `definitionOffset` 排序声明，以保持与原始文件相同的顺序。

| 属性 | 类型 | 说明 |
|------|------|------|
| `definitionOffset` | `number` | 在文件中的定义偏移量 |

> **初学者须知**：**偏移量（offset）** 是指某个字符在文件中的位置索引（从文件开头算起的字符数）。工具用它来确定声明在原始文件中的先后顺序。

### `DictionaryType`

表示字典类型，显式定义其键和值的类型。

| 属性 | 类型 | 说明 |
|------|------|------|
| `key` | [Type](#type) | 键的类型 |
| `value` | [Type](#type) | 值的类型 |

### `EnumCase`

表示枚举声明中的单个 case（情况/成员）。

类型：`string`

### `EnumType`

表示枚举类型，包含其名称和所有关联的 case。

| 属性 | 类型 | 说明 |
|------|------|------|
| `cases` | [EnumCase[]](#enumcase) | 枚举成员列表 |
| `name` | `string` | 枚举名称 |

### `EventDeclaration`

表示 DSL 事件声明。

类型：`string`

### `Field`

类型：[Argument](#argument)

表示 record（记录）或 struct（结构体）中的单个字段。

### `FileInputOption`

定义从一组物理文件中提取类型信息的输入选项。

| 属性 | 类型 | 说明 |
|------|------|------|
| `inputFileAbsolutePaths` | `string[]` | 输入文件的绝对路径数组 |
| `type` | `'file'` | 输入类型标识 |

### `FileTypeInformation`

`FileTypeInformation` 对象抽象了文件中与类型相关的信息。该抽象与 TypeScript 和 Expo NativeModules 密切相关（既独立于实际的原生端，又能准确提供关于模块可用信息和使用方式）。

| 属性 | 类型 | 说明 |
|------|------|------|
| `declaredTypeIdentifiers` | `Set<string>` | 已声明的类型标识符集合 |
| `enums` | [EnumType[]](#enumtype) | 枚举类型列表 |
| `inferredTypeParametersCount` | `Map<string, number>` | 推断的类型参数数量映射 |
| `moduleClasses` | [ModuleClassDeclaration[]](#moduleclassdeclaration) | 模块类声明列表 |
| `records` | [RecordType[]](#recordtype) | 记录类型列表 |
| `typeIdentifierDefinitionMap` | [TypeIdentifierDefinitionMap](#typeidentifierdefinitionmap) | 类型标识符定义映射 |
| `usedTypeIdentifiers` | `Set<string>` | 已使用的类型标识符集合 |

### `FileTypeInformationSerialized`

`FileTypeInformation` 的序列化版本，适用于 JSON 存储或测试环境。

| 属性 | 类型 | 说明 |
|------|------|------|
| `declaredTypeIdentifiersList` | `string[]` | 已声明的类型标识符列表 |
| `enums` | [EnumType[]](#enumtype) | 枚举类型列表 |
| `inferredTypeParametersCountList` | `undefined` | 推断的类型参数数量（序列化时为 undefined） |
| `moduleClasses` | [ModuleClassDeclaration[]](#moduleclassdeclaration) | 模块类声明列表 |
| `records` | [RecordType[]](#recordtype) | 记录类型列表 |
| `typeIdentifierDefinitionList` | [TypeIdentifierDefinitionList](#typeidentifierdefinitionlist) | 类型标识符定义列表 |
| `usedTypeIdentifiersList` | `string[]` | 已使用的类型标识符列表 |

### `FunctionDeclaration`

表示 DSL 函数声明。

继承自 [DefinitionOffset](#definitionoffset)，扩展属性如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| `arguments` | [Argument[]](#argument) | 函数参数列表 |
| `name` | `string` | 函数名 |
| `parameters` | [Type[]](#type) | 函数泛型参数列表 |
| `returnType` | [Type](#type) | 函数返回类型 |

### `GetFileTypeInformationOptions`

指定输入源和推断级别的配置选项。

| 属性 | 类型 | 说明 |
|------|------|------|
| `input` | [StringInputOption](#stringinputoption) \| [FileInputOption](#fileinputoption) | 输入源，可以以直接字符串或文件路径的形式提供。 |
| `mapUnicodeCharacters` | `boolean` | 是否将 Unicode 码点映射为 ASCII 字符串，以修复底层 SourceKit 的问题。 |
| `typeInference`（可选） | [TypeInferenceOption](#typeinferenceoption) | 所需的类型推断级别。如果省略，默认为 `PREPROCESS_AND_INFERENCE`。 |

### `IdentifierDefinition`

表示一个标识符的定义。

| 属性 | 类型 | 说明 |
|------|------|------|
| `definition` | `string` \| [RecordType](#recordtype) \| [EnumType](#enumtype) \| [ClassDeclaration](#classdeclaration) | 标识符的定义内容 |
| `kind` | [IdentifierKind](#identifierkind) | 标识符的种类 |

### `ModuleClassDeclaration`

表示 DSL 模块声明。

继承自 [DefinitionOffset](#definitionoffset)，扩展属性如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| `asyncFunctions` | [FunctionDeclaration[]](#functiondeclaration) | 异步函数列表 |
| `classes` | [ClassDeclaration[]](#classdeclaration) | 嵌套类列表 |
| `constants` | [ConstantDeclaration[]](#constantdeclaration) | 常量列表 |
| `constructor` | [ConstructorDeclaration](#constructordeclaration) \| `null` | 构造函数声明 |
| `events` | [EventDeclaration[]](#eventdeclaration) | 事件列表 |
| `functions` | [FunctionDeclaration[]](#functiondeclaration) | 同步函数列表 |
| `name` | `string` | 模块名 |
| `properties` | [PropertyDeclaration[]](#propertydeclaration) | 属性列表 |
| `props` | [PropDeclaration[]](#propdeclaration) | Prop 列表 |
| `views` | [ViewDeclaration[]](#viewdeclaration) | View 列表 |

### `OptionalType`

类型：[Type](#type)

表示可选类型——即值也可以是 `null` 或 `undefined` 的类型。

> **注意**：该类型为可选的信息是**隐式的**，仅存在于类型系统和父类型上。`OptionalType` 对象上没有显式指示此信息的字段。

### `OutputFile`

辅助类型，包含生成的文件内容和文件名。

| 属性 | 类型 | 说明 |
|------|------|------|
| `content` | `string` | 文件内容 |
| `name` | `string` | 文件名 |

### `ParametrizedType`

表示参数化类型——即带有指定参数的泛型类型，例如 `Map<string, number>`。

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | [TypeIdentifier](#typeidentifier) | 类型名称标识符 |
| `types` | [Type[]](#type) | 泛型参数类型列表 |

### `PropDeclaration`

表示 DSL Prop 声明。

继承自 [DefinitionOffset](#definitionoffset)，扩展属性如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| `arguments` | [Argument[]](#argument) | Prop 参数列表 |
| `name` | `string` | Prop 名称 |

### `PropertyDeclaration`

类型：[ConstantDeclaration](#constantdeclaration)

表示 DSL 属性声明。

### `RecordType`

表示 struct（结构体）或类字典的记录，由命名字段组成。

| 属性 | 类型 | 说明 |
|------|------|------|
| `fields` | [Field[]](#field) | 字段列表 |
| `name` | `string` | 记录名称 |

### `StringInputOption`

定义从原始源代码字符串中直接提取类型信息的输入选项。

| 属性 | 类型 | 说明 |
|------|------|------|
| `fileContent` | `string` | 源代码字符串内容 |
| `language` | `'Swift'` | 源代码语言 |
| `type` | `'string'` | 输入类型标识 |

### `SumType`

表示联合类型或和类型——即一个值可以是多种不同类型之一。

| 属性 | 类型 | 说明 |
|------|------|------|
| `types` | [Type[]](#type) | 组成联合类型的类型列表 |

### `Type`

表示抽象类型节点。

| 属性 | 类型 | 说明 |
|------|------|------|
| `kind` | [TypeKind](#typekind) | 类型节点的种类 |
| `type` | [BasicType](#basictype) \| [TypeIdentifier](#typeidentifier) \| [AnonymousType](#anonymoustype) | 具体的类型数据 |

### `TypeIdentifier`

表示以字符串引用形式存在的类型标识符。

类型：`string`

### `TypeIdentifierDefinitionList`

类型：`undefined`

`TypeIdentifierDefinitionMap` 的序列化版本。

### `TypeIdentifierDefinitionMap`

类型：`Map<string, [IdentifierDefinition](#identifierdefinition)>`

将类型标识符字符串映射到其定义对象。

### `ViewDeclaration`

类型：[ModuleClassDeclaration](#moduleclassdeclaration)

表示 DSL View 声明。与 `ModuleClassDeclaration` 结构相同，因为 View 本质上是一种特殊的模块类。

---

## 枚举

### `BasicType`

表示非用户自定义的基本类型。

| 枚举值 | 数值 | 说明 |
|--------|------|------|
| `ANY` | `0` | 任意类型 |
| `STRING` | `1` | 字符串类型 |
| `NUMBER` | `2` | 数字类型 |
| `BOOLEAN` | `3` | 布尔类型 |
| `VOID` | `4` | 空类型（无返回值） |
| `UNDEFINED` | `5` | 未定义类型 |
| `UNRESOLVED` | `6` | 表示无法解析的类型 |

### `IdentifierKind`

表示从原生文件解析出的标识符种类。

| 枚举值 | 数值 | 说明 |
|--------|------|------|
| `BASIC` | `0` | 基本标识符 |
| `ENUM` | `1` | 枚举标识符 |
| `RECORD` | `2` | 记录标识符 |
| `CLASS` | `3` | 类标识符 |

### `TypeInferenceOption`

定义提取类型信息时应用的类型推断级别。

> **注意**：当启用类型推断时，计算类型信息**可能需要超过两倍的时间**。

| 枚举值 | 数值 | 说明 |
|--------|------|------|
| `NO_INFERENCE` | `0` | 不执行任何类型推断。 |
| `SIMPLE_INFERENCE` | `1` | 应用基本的类型推断。 |
| `PREPROCESS_AND_INFERENCE` | `2` | 通过预处理文件（注入 return 语句）来从 sourcekitten 提取更多类型信息。 |

### `TypeKind`

对抽象语法树中的类型节点进行分类。

| 枚举值 | 数值 | 说明 |
|--------|------|------|
| `BASIC` | `0` | 基本类型 |
| `IDENTIFIER` | `1` | 标识符类型 |
| `SUM` | `2` | 联合/和类型 |
| `PARAMETRIZED` | `3` | 参数化/泛型类型 |
| `OPTIONAL` | `4` | 可选类型 |
| `ARRAY` | `5` | 数组类型 |
| `DICTIONARY` | `6` | 字典类型 |

---

## Swift 解析器限制

由于解析 Swift 代码的复杂性，当前的解析器存在以下已知限制。

### 当前版本的已知问题

1. **嵌套类解析不完整**：由于 sourcekitten 在处理嵌套闭包方面存在局限，DSL `Class` 方法的返回类型可能会被标记为"未解析"（`UNRESOLVED`）。

2. **返回类型推断失败**：`PREPROCESS_AND_INFERENCE` 模式通过注入变量来捕获返回类型表达式，但这种代码重写可能在以下情况失败：
   - 遇到包含特定字符串的代码时
   - 遇到注释时
   - 无法处理尾部表达式（tail expression）

3. **不支持的 DSL 声明上下文**：某些上下文中的 DSL 声明无法被正确解析。例如，`Events` 可以在 View 中被解析，但不能在 Module 定义中被解析。

4. **Unicode 字符偏移问题**：非 ASCII 字符会干扰偏移量计算，可能导致类型信息提取不准确。

> **基于经验建议**：如果你在使用 `PREPROCESS_AND_INFERENCE` 模式时遇到生成失败，可以尝试以下排查步骤：
> 1. 使用 `other preprocess-file` 命令查看预处理后的文件内容
> 2. 检查文件中是否含有复杂字符串或特殊注释
> 3. 尝试回退到 `SIMPLE_INFERENCE` 模式
> 4. 确保 Swift 源文件中的非 ASCII 字符不会导致问题（可尝试使用 `-s` 标志跳过 Unicode 映射）

### 支持的 Expo 模块 DSL 声明

| 特性 | 说明和限制 |
|------|-----------|
| **Expo DSL 声明** | 支持解析以下声明：`AsyncFunction`、`Constant`、`Constructor`、`Events`、`Function`、`Name`、`Prop`、`Property`、`View` |
| **Swift `struct` 和 `class`** | 需要遵循 `Record` 协议。仅处理使用 `@Field` 注解的属性。 |
| **Swift `enum`** | 支持基本的枚举 case；不支持带有**关联值**的 case。 |

> **初学者须知**：
> - **Record 协议**：Expo 模块中定义数据传输对象（DTO）的协议，Swift 的 struct 和 class 必须遵循此协议才能被类型生成工具识别。
> - **`@Field` 注解**：用于标记 struct/class 中需要被 Expo 模块系统管理的属性。
> - **关联值（associated values）**：Swift 枚举的高级特性，例如 `case success(String)` 中的 `String` 就是关联值。当前工具不支持此特性。

> **基于经验建议**：如果你的 Swift 模块中使用了带有 `Events` 的 Module 定义，需要注意 `Events` 在 Module 上下文中可能无法被正确解析。建议将事件相关的声明放在 View 上下文中，或者手动编写对应的 TypeScript 类型定义。

---

## 文档导航

- **上一页**：[inline modules reference](./110__inline-modules-reference.md)
- **下一页**：[android lifecycle listeners](./112__android-lifecycle-listeners.md)
