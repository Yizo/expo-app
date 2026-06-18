> 原文地址：https://docs.expo.dev/modules/inline-modules-reference/

# 内联模块参考文档（Inline Modules Reference）

## 概述

内联模块（Inline Modules）是 Expo 提供的一项功能，允许开发者直接在 Expo 项目目录中编写原生模块代码（Kotlin 和 Swift），而无需创建独立的 Expo 模块包。Expo 会自动发现这些文件并将其纳入构建流程。

> **重要警告**：内联模块目前处于[实验性（Experimental）](https://docs.expo.dev/more/release-statuses/#experimental)阶段，从 **Expo SDK 56** 及更高版本开始可用。该 API 可能会发生破坏性变更（Breaking Changes），请在生产项目中谨慎使用。

### 关键术语说明（面向初学者）

| 术语 | 含义 |
|---|---|
| **Inline Module（内联模块）** | 直接写在应用主项目目录中的原生模块代码，不需要像传统模块那样作为独立 npm 包发布 |
| **Expo Module Package（Expo 模块包）** | 传统的原生模块发布方式，需要创建独立的项目和 npm 包，内联模块省去了这一步 |
| **Kotlin** | Android 平台的主要开发语言，内联模块允许你直接在项目中编写 Kotlin 原生代码 |
| **Swift** | iOS 平台的主要开发语言，内联模块允许你直接在项目中编写 Swift 原生代码 |
| **Autolinking（自动链接）** | Expo 的自动链接系统，能自动发现并注册项目中的原生模块，无需手动配置 |
| **Expo CLI** | Expo 的命令行工具，提供项目构建、开发、调试等功能 |
| **App Config（应用配置）** | 即 `app.json` 或 `app.config.js/ts` 文件，用于配置 Expo 项目的各项参数 |
| **Prebuild（预构建）** | `npx expo prebuild` 命令，根据应用配置生成本地原生项目文件（android/ 和 ios/ 目录） |
| **package.json** | Node.js 项目的配置文件，定义了项目依赖、脚本等信息，内联模块要求监控目录所在的层级必须存在此文件 |
| **Native Module Name（原生模块名）** | 模块的唯一标识符，在整个应用中必须唯一，且需要与文件名完全匹配 |
| **Module Definition（模块定义）** | 通过 `Module()` 类和 `definition()` 方法定义模块的功能接口 |

### 内联模块 vs 传统模块包

> **基于文档内容推导**：传统的 Expo 原生模块开发流程要求开发者创建一个独立的 npm 包项目（包含 `expo-module.config.json`、原生代码目录等），然后通过 npm 安装到主项目中使用。内联模块将这一流程大幅简化——你只需在主项目目录下创建原生代码文件，Expo 的自动链接系统会自动发现并编译它们。这对于快速原型开发、小型功能模块或不想维护独立包的场景非常有用。

---

## 配置

### 启用内联模块：`expo.experiments.inlineModules`

当在应用配置中定义此属性时，将在 Expo CLI 和 Expo Modules Autolinking（自动链接系统）中启用内联模块功能。

```json
{
  "expo": {
    "experiments": {
      "inlineModules": {}
    }
  }
}
```

> **关键术语——`experiments`（实验性功能）**：Expo 使用 `experiments` 配置项来管理尚未稳定的实验性功能。将某个功能放在 `experiments` 下意味着它的 API 可能会在未来版本中发生变化。即使 `inlineModules` 的值是一个空对象 `{}`，只要该键存在，就表示启用了此功能。

> **基于经验建议**：虽然只需要写一个空对象 `{}`，但建议始终搭配 `watchedDirectories` 一起使用（见下文），明确指定要监控的目录可以避免意外扫描到不需要的文件。

### 配置监控目录：`expo.experiments.inlineModules.watchedDirectories`

此选项配置内联模块可以创建在哪些目录中。系统会监控这些目录，自动发现其中的原生模块文件。

```json
{
  "expo": {
    "experiments": {
      "inlineModules": {
        "watchedDirectories": ["app", "src"]
      }
    }
  }
}
```

**嵌套目录自动扫描**：被监控目录内的嵌套子目录中的文件也会被自动使用。例如，如果配置了 `watchedDirectories = ["app"]`，并且存在一个模块文件 **app/nested/directory/SomeModule.kt**，那么 `SomeModule` 同样可以在你的应用中使用。

> **基于文档内容推导**：这意味着你不需要为每一层子目录都单独配置监控路径。只需指定顶层目录，系统会自动递归扫描所有子目录中的原生模块文件。

#### 示例：目录结构与自动发现

假设你的项目结构如下：

```
my-expo-app/
├── app.json
├── package.json
├── app/                          ← 被监控的目录
│   ├── MyModule.kt               ← 会被自动发现
│   ├── MySwiftModule.swift       ← 会被自动发现
│   ├── (tabs)/
│   │   └── TabModule.kt          ← 会被自动发现（即使在含特殊字符的目录中）
│   └── features/
│       └── deep/
│           └── DeepModule.kt     ← 会被自动发现（深层嵌套也能识别）
├── src/                          ← 另一个被监控的目录
│   └── Utils/
│       └── UtilModule.kt        ← 会被自动发现
└── lib/                          ← 未被监控
    └── IgnoredModule.kt          ← 不会被发现（不在监控目录中）
```

---

## 监控目录的规则与限制

`watchedDirectories` 中的每个目录必须严格遵守以下规则：

### 规则一：必须位于 TypeScript/JavaScript 项目中

目录所在的目录树中，必须有一个祖先目录包含 **package.json** 文件。

**合法示例：**

```json
{
  "watchedDirectories": ["app", "src/some/directory", "pathToOtherProject"]
}
```

以上路径都能正常工作，因为它们所在的目录层级中都有 `package.json`。

**不合法示例：**

```json
{
  "watchedDirectories": ["/", "pathToFolderNotInNodeProject"]
}
```

以上路径无法工作，因为根目录 `/` 或不在 Node 项目中的文件夹没有 `package.json` 祖先。

> **关键术语——祖先目录（Ancestor Directory）**：指从当前目录向上逐级查找的父级目录。例如对于路径 `my-app/app/features/`，其祖先目录包括 `my-app/app/`、`my-app/` 以及更上层的目录。只要其中任何一个包含 `package.json`，就满足此规则。

### 规则二：不能是整个项目目录或其祖先

不能将项目根目录本身（如 `"./"`) 或其父级目录（如 `"../"`）设为监控目录。

> **基于文档内容推导**：这条规则的存在是为了避免扫描整个项目目录树（包括 `node_modules`、`.git` 等目录），这不仅会严重拖慢构建速度，还可能导致意外编译不应被处理的文件。

### 规则三：路径不能重叠

一个被监控的目录不能是另一个被监控目录的子目录。

**不合法示例：**

```json
{
  "watchedDirectories": ["app", "app/nested/directory"]
}
```

**正确做法：** 只需设置 `["app"]` 即可，因为系统会自动扫描 `app` 下所有子目录，无需重复指定。

> **基于经验建议**：如果你发现自己在 `watchedDirectories` 中写了多个有包含关系的路径，说明配置存在冗余。简化为最顶层的路径即可，系统会递归扫描所有子目录。

### 规则四：不能包含特殊字符

目录名中不能包含以下特殊字符：空格 `" "`、圆括号 `"("` `")"` 、美元符号 `"$"` 等。

**不合法示例：**

```json
{
  "watchedDirectories": ["app/(tabs)"]
}
```

包含圆括号的路径 `"app/(tabs)"` 不能直接放在 `watchedDirectories` 中。

**正确做法：**

```json
{
  "watchedDirectories": ["app"]
}
```

设置为 `"app"` 即可，系统仍会扫描 `app/(tabs)/` 目录中的原生文件。

> **关键术语——Expo Router 与特殊目录名**：在 Expo Router 文件路由系统中，`(tabs)`、`(auth)` 等带圆括号的目录名被广泛用作路由分组（Route Groups）。这些特殊字符在文件系统中是合法的，但在 `watchedDirectories` 配置中不被允许。解决办法是将其父目录（如 `"app"`）设为监控目录，系统会自动递归扫描这些含特殊字符的子目录。

### 规则汇总

| 规则 | 说明 | 合法示例 | 不合法示例 |
|---|---|---|---|
| 必须在 TS/JS 项目中 | 祖先目录中必须有 `package.json` | `["app"]`（项目中有 `package.json`） | `["/"]`（根目录无 `package.json`） |
| 不能是项目根目录 | `"./"` 和 `"../"` 都不允许 | `["app"]` | `["./"]` 或 `["../"]` |
| 路径不能重叠 | 一个路径不能是另一个的子目录 | `["app", "src"]` | `["app", "app/sub"]` |
| 不能含特殊字符 | 空格、圆括号、美元符号等均不允许 | `["app"]` | `["app/(tabs)"]` |

---

> **重要提示**：修改[应用配置](https://docs.expo.dev/workflow/configuration/)后，必须运行 `npx expo prebuild` 命令才能使更改生效。

```bash
npx expo prebuild
```

> **基于经验建议**：每次修改 `app.json` 或 `app.config.js/ts` 中与内联模块相关的配置后，都务必执行 `npx expo prebuild`。否则自动链接系统不会感知到配置变化，新添加的模块将不会出现在原生构建中。如果你使用的是开发构建（Development Build），修改配置后也需要重新构建。

---

## 命名约定

内联模块的文件名必须与原生模块名完全匹配。模块名在整个应用中必须是唯一的。

如果你有一个名为 **SimpleModule.kt** 的文件，那么其中的内联模块也必须使用相同的名称。例如：

```kotlin
// SimpleModule.kt
// ...
class SimpleModule: Module() { // 注意：类名必须与文件名一致
    public func definition() -> ModuleDefinition {
        // Name("SimpleModule") // `Name` 也必须与文件名一致，因此可以直接省略它
    }
}
```

### 命名规则详解

| 要素 | 要求 | 说明 |
|---|---|---|
| **文件名** | 必须与模块名完全一致 | 例如 `SimpleModule.kt` 或 `SimpleModule.swift` |
| **类名** | 必须与文件名完全一致 | Kotlin 中的 `class SimpleModule: Module()` |
| **`Name` 声明** | 必须与文件名一致，或可直接省略 | 省略时，系统会自动使用文件名作为模块名 |
| **唯一性** | 模块名在整个应用中必须唯一 | 不能有两个模块使用相同的名称，包括内联模块和传统模块之间也不能重复 |

> **关键术语——`Name()`（名称声明）**：在 Expo 模块定义中，`Name("SomeModule")` 用于显式指定模块的名称。对于内联模块，由于文件名已经确定了模块名，因此可以省略 `Name()` 声明，系统会自动从文件名推断。

> **基于文档内容推导**：这种"文件名即模块名"的设计使得模块的识别和管理更加直观。开发者无需在代码中额外声明名称，减少了配置负担和名称不匹配的风险。同时也意味着重命名文件时必须同步更新类名。

> **基于经验建议**：为避免命名冲突，建议使用具有项目特征前缀的模块名，例如 `MyAppCameraModule` 而不是简单的 `CameraModule`。特别是在团队开发中，明确的命名约定能显著减少模块名冲突问题。

---

## 常见问题与注意事项

### 修改配置后模块未生效

确保在修改 `app.json` 或 `app.config.js/ts` 后执行了 `npx expo prebuild`。配置更改不会自动同步到原生层。

### 模块名冲突

如果内联模块的名称与已安装的传统模块名称相同，会导致冲突。确保所有模块名在整个应用中保持唯一。

### 含特殊字符的目录

Expo Router 的路由分组目录（如 `(tabs)`、`(auth)`）包含圆括号，不能直接写入 `watchedDirectories`。将其父目录设为监控目录即可，系统会自动扫描这些子目录。

### Swift 代码的命名约定

与 Kotlin 示例类似，Swift 内联模块也遵循相同的命名约定：

```swift
// SimpleModule.swift
// ...
class SimpleModule: Module { // 类名必须与文件名一致
    public func definition() -> ModuleDefinition {
        // Name("SimpleModule") // 同样可以省略，系统自动从文件名推断
    }
}
```

> **基于经验建议**：在同时使用 Kotlin 和 Swift 编写同一功能的内联模块时，确保两端的文件使用完全一致的命名（除了文件扩展名不同）。这有助于保持代码的可维护性和一致性。

---

## 文档导航

- **上一页**：[module api](./109__module-api.md)
- **下一页**：[type generation reference](./111__type-generation-reference.md)
