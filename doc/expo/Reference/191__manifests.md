# Expo Manifests 学习文档

> 原文修改日期：2026 年 1 月 15 日  
> 适用平台：Android、iOS、tvOS、Expo Go  
> 包名：`expo-manifests`

## 文档解决的问题

`expo-manifests` 是一个为 Expo Manifest 提供 TypeScript 类型定义的库。

这里的 **Manifest（清单）** 是描述 Expo 应用或更新内容的一组结构化元数据，例如：

- 当前更新的唯一 ID
- 运行时版本
- JavaScript 启动资源
- 其他静态资源
- Expo 项目 ID
- Expo 客户端配置
- Expo Go 开发配置

这篇文档主要用于查询这些 Manifest 数据结构的类型，而不是介绍如何创建、下载、验证或管理 Manifest。

当前文档适合以下场景：

- 使用 TypeScript 处理 Expo Manifest 数据。
- 开发与 `expo-updates` 相关的工具或底层功能。
- 读取 Expo、EAS 或 Expo Go 附加到 Manifest 中的配置。
- 维护使用旧类型名 `BareManifest` 或 `NewManifest` 的代码。
- 在原生构建流程中理解嵌入式 Manifest 的基本结构。

如果只是开发普通 React Native 页面，通常不会频繁直接使用这个包。

## 版本提示

原文明确说明：该页面对应的是**下一个 Expo SDK 版本**，不是当前稳定版本。原文同时指出，最新稳定文档对应 **SDK 56**。

因此，复制这里的类型或 API 到现有项目之前，需要先确认项目使用的 Expo SDK 版本。

> **基于文档内容推导：** 不同 SDK 版本中的类型名称、字段或弃用状态可能不同。项目开发应优先查阅与当前 SDK 版本匹配的文档，而不是直接以 `unversioned` 页面为准。

## React Web 开发者需要先理解的概念

### Manifest 不等同于 Web App Manifest

React Web 开发者看到 Manifest，可能首先想到 PWA 使用的 `manifest.json`。这里的 Expo Manifest 不是同一种规范。

PWA Manifest 主要描述网站名称、图标和启动方式；Expo Manifest 则服务于 Expo 应用运行、原生构建和 `expo-updates` 更新系统。

### Expo 与 React Native 的关系

React Native 使用 React 编写界面，但最终运行在 iOS、Android 等原生平台中。Expo 在 React Native 之上提供了工具链、原生模块、构建服务和更新能力。

`expo-manifests` 属于 Expo 基础设施相关的库，主要提供数据类型，并不是用于渲染 UI 的 React 组件库。

### EAS

EAS 是 Expo 的应用服务体系。当前文档只涉及 EAS 项目的 `projectId`，没有介绍 EAS Build、Submit 或 Update 的具体操作流程。

### Expo Go

Expo Go 是用于加载和调试 Expo 项目的客户端应用。Manifest 中可能包含仅供 Expo Go 或开发服务器使用的信息，例如调试主机、入口模块和打包参数。

### `expo-updates`

`expo-updates` 是 Expo 的应用更新系统。`ExpoUpdatesManifest` 描述一次更新所需的元数据和资源。

当前文档只定义其 Manifest 类型，没有说明更新发布、检查、下载、回滚或兼容性判断的流程。

### 嵌入式 Manifest

嵌入式 Manifest 是随原生应用构建产物一起生成并打包进去的 Manifest。

它与从更新服务获得的 `ExpoUpdatesManifest` 不同：

- `EmbeddedManifest` 在原生构建期间生成。
- `ExpoUpdatesManifest` 描述 `expo-updates` 更新内容。

## 安装

根据包管理器执行对应命令：

```sh
# npm
npx expo install expo-manifests

# yarn
yarn expo install expo-manifests

# pnpm
pnpm expo install expo-manifests

# bun
bun expo install expo-manifests
```

这里使用的是 `expo install`，而不是直接执行 `npm install expo-manifests`。

> **基于文档内容推导：** `expo install` 可以按照项目的 Expo SDK 选择兼容的包版本，因此比直接安装某个任意版本更适合 Expo 项目。

如果是在已有的 React Native 原生项目中安装，即通常所说的 bare React Native 项目，需要先按照 Expo 文档为项目安装并配置 `expo`。

这意味着：

- 一个已有 React Native 项目不会因为安装了 `expo-manifests` 就自动成为完整的 Expo 项目。
- Expo 模块需要必要的原生基础设施。
- React Web 项目不能直接通过安装这个包获得移动端 Manifest 能力。

## 导入方式

```js
import * as Manifests from 'expo-manifests';
```

该写法将包导出的内容统一放入 `Manifests` 命名空间。

不过，当前页面只列出了类型，没有展示任何运行时函数、常量或完整代码示例。

> **当前文档未涉及：** 如何在运行时取得 Manifest、如何调用相关 API，以及是否存在可直接调用的运行时方法。

## 类型结构

这些类型之间的主要关系如下：

```text
EmbeddedManifest
└── 旧名称：BareManifest（已弃用）

ExpoUpdatesManifest
├── assets: ManifestAsset[]
├── launchAsset: ManifestAsset
└── extra?: ManifestExtra
    ├── ClientScopingConfig
    ├── eas?: EASConfig
    ├── expoClient?: ExpoClientConfig
    └── expoGo?: ExpoGoConfig
        └── packagerOpts?: ExpoGoPackagerOpts

ExpoUpdatesManifest
└── 旧名称：NewManifest（已弃用）
```

### `EmbeddedManifest`

支持 Android、iOS 和 tvOS。

它表示构建时嵌入原生应用的 Manifest，由构建过程中的 `createManifest.js` 脚本步骤生成。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `assets` | `any[]` | Manifest 中包含的资源集合；原文未提供元素结构 |
| `commitTime` | `number` | 提交时间；原文未说明单位和具体语义 |
| `id` | `string` | Manifest 的标识符；原文未说明格式 |

`assets` 使用 `any[]`，意味着类型系统无法帮助开发者检查数组元素的结构。

> **注意：** 原文没有说明 `commitTime` 是秒、毫秒还是其他格式。不要仅根据字段名自行转换为 JavaScript `Date`，应结合实际数据来源或对应 SDK 的实现确认。

### `BareManifest`：已弃用

```ts
type BareManifest = EmbeddedManifest;
```

`BareManifest` 已重命名为 `EmbeddedManifest`，并将在之后几个版本中删除。

新代码应该使用 `EmbeddedManifest`。现有代码如果仍然引用 `BareManifest`，应安排迁移，避免未来升级 Expo SDK 时出现类型不存在的问题。

### `ExpoUpdatesManifest`

支持 Android、iOS 和 tvOS，表示一个 `expo-updates` Manifest。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `assets` | `ManifestAsset[]` | 更新包含的普通资源 |
| `createdAt` | `string` | 创建时间；原文未指定字符串格式 |
| `extra` | `ManifestExtra`，可选 | Expo、EAS 和客户端相关的附加信息 |
| `id` | `string` | 更新 Manifest 的标识符 |
| `launchAsset` | `ManifestAsset` | 应用启动所需的主要资源 |
| `metadata` | `object` | 更新元数据；原文未定义内部结构 |
| `runtimeVersion` | `string` | 该更新对应的运行时版本 |

`launchAsset` 与 `assets` 需要区分：

- `launchAsset` 是一个单独的启动资源。
- `assets` 是其他资源组成的数组。

> **基于文档内容推导：** 处理更新资源时，不应假设启动资源一定同时出现在 `assets` 中，因为类型将二者定义为独立字段。

`runtimeVersion` 是必填字符串，但当前页面没有说明它的生成规则或兼容性判断方式。

### `NewManifest`：已弃用

```ts
type NewManifest = ExpoUpdatesManifest;
```

`NewManifest` 已重命名为 `ExpoUpdatesManifest`，并将在之后几个版本中删除。

名称变化使类型用途更加明确：它描述的是 Expo Updates Manifest，而不只是一个含义模糊的“新 Manifest”。

### `ManifestAsset`

表示 Manifest 中的资源：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `url` | `string` | 资源地址 |

当前文档没有定义资源类型、哈希值、文件扩展名、请求头或缓存策略。

> **基于文档内容推导：** `url` 只是字符串类型，类型定义本身不保证地址有效、安全或可访问。真正下载资源时仍需处理网络错误和非法数据。

### `ManifestExtra`

`ManifestExtra` 在 `ClientScopingConfig` 的基础上增加了以下可选配置：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `scopeKey` | `string`，可选 | 继承自 `ClientScopingConfig` |
| `eas` | `EASConfig`，可选 | EAS 项目信息 |
| `expoClient` | `ExpoClientConfig`，可选 | Expo 客户端配置 |
| `expoGo` | `ExpoGoConfig`，可选 | Expo Go 配置 |

因为这些字段全部可选，所以不能假设 `extra` 中一定存在 EAS、Expo Client 或 Expo Go 信息。

```ts
const projectId = manifest.extra?.eas?.projectId;
```

以上代码只是根据文档类型展示安全访问方式，并非原文提供的完整示例。

### `ClientScopingConfig`

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `scopeKey` | `string`，可选 | 用于限定客户端数据所属项目范围的不透明唯一字符串 |

`scopeKey` 有两个重要特征：

1. 项目转移到其他账户后不会改变。
2. 项目重命名后不会改变。

“不透明字符串”意味着业务代码不应解析其内部格式，也不应从中推断账户名或项目名。它适合作为稳定标识使用，而不是作为面向用户展示的名称。

### `EASConfig`

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `projectId` | `string`，可选 | 使用 EAS 时的项目 UUID |

`projectId` 在项目转移账户或重命名后也不会改变。

需要注意：

- 字段是可选的，并非所有项目都使用 EAS。
- 文档明确其格式为 UUID。
- 不应使用项目名称替代 `projectId` 进行稳定身份识别。

### `ExpoClientConfig`

`ExpoClientConfig` 继承 Expo 的完整 `ExpoConfig` 类型，并额外提供：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `hostUri` | `string`，可选 | 使用 `@expo/cli` 开发时才会出现的主机地址 |

对 React Web 开发者，可以将 `hostUri` 类比为开发服务器地址，但它属于 Expo CLI 的移动端开发环境信息。

不要在生产逻辑中假设它一定存在，因为文档明确指出该字段只在使用 `@expo/cli` 开发时出现。

当前页面没有完整列出继承自 `ExpoConfig` 的字段，需要查阅对应的 Expo 配置类型定义。

### `ExpoGoConfig`

Expo Go 相关配置包括：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `debuggerHost` | `string`，可选 | 原文未进一步描述 |
| `developer` | `Record<string, any> & { tool: string }`，可选 | 开发工具信息，其中 `tool` 必填 |
| `mainModuleName` | `string`，可选 | 原文未进一步描述 |
| `packagerOpts` | `ExpoGoPackagerOpts`，可选 | 打包器选项 |

这些配置均为可选字段，且多个字段缺少语义说明。因此，使用它们之前需要结合对应 SDK 版本的 Expo Go 或 CLI 文档确认。

### `ExpoGoPackagerOpts`

这是一个开放对象类型：

```ts
Record<string, any>
```

并额外声明了以下可选字段：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `dev` | `boolean` | 原文未进一步描述 |
| `hostType` | `string` | 原文未进一步描述 |
| `lanType` | `string` | 原文未进一步描述 |
| `minify` | `boolean` | 原文未进一步描述 |
| `strict` | `boolean` | 原文未进一步描述 |
| `urlRandomness` | `string` | 原文未进一步描述 |
| `urlType` | `string` | 原文未进一步描述 |

由于它继承 `Record<string, any>`，对象还可能包含文档没有列出的任意属性。

> **开发影响：** 这是一个弱约束类型。TypeScript 可以检查已知字段的基本类型，但无法保证整个对象只包含这些字段，也无法验证未知字段的语义。

## 关键区别

### 构建时 Manifest 与更新 Manifest

| 对比项 | `EmbeddedManifest` | `ExpoUpdatesManifest` |
| --- | --- | --- |
| 主要用途 | 描述构建时嵌入应用的 Manifest | 描述 `expo-updates` 更新 |
| 生成或来源 | 构建期间由 `createManifest.js` 步骤生成 | 当前文档未说明 |
| 资源字段 | `assets: any[]` | `assets`、`launchAsset` |
| 运行时版本 | 未列出 | `runtimeVersion` |
| 附加 Expo 配置 | 未列出 | `extra` |
| 旧类型名 | `BareManifest` | `NewManifest` |

不要因为它们都叫 Manifest，就假设字段相同或能够直接互换。

### 类型定义不等于运行时校验

TypeScript 类型只在开发和编译检查阶段发挥作用。来自服务器、原生层或其他外部来源的数据，在运行时仍可能缺少字段或包含错误类型。

> **基于文档内容推导：** 如果 Manifest 来自不受信任或可能版本不一致的数据源，应在运行时进行结构校验，不能只使用 TypeScript 类型断言。

## 容易踩坑的地方

1. **使用了已弃用类型**

   `BareManifest` 和 `NewManifest` 都将在之后的版本删除。应分别迁移到 `EmbeddedManifest` 和 `ExpoUpdatesManifest`。

2. **把可选字段当作必填字段**

   `extra`、`eas`、`projectId`、`expoClient`、`expoGo` 以及其内部配置都有可选部分。读取时需要处理 `undefined`。

3. **依赖开发环境字段**

   `hostUri` 只在通过 `@expo/cli` 开发时存在，不能作为生产环境必需信息。

4. **过度信任弱类型字段**

   `assets: any[]`、`metadata: object` 和继承自 `Record<string, any>` 的配置都没有提供严格的内部结构。

5. **解析不透明标识符**

   `scopeKey` 被明确描述为不透明字符串。应用只能将其作为整体进行存储或比较，不应依赖其内部格式。

6. **混淆项目名称与稳定 ID**

   `scopeKey` 和 EAS `projectId` 都不会随项目改名或账户转移而变化。项目名称不具备文档中明确承诺的这种稳定性。

7. **使用了错误版本的文档**

   当前页面面向下一个 SDK 版本。现有项目应核对实际 Expo SDK，避免提前使用尚未进入稳定版本的类型变化。

## 实际开发中的使用方式

### 新代码使用正式类型名

```ts
import type {
  EmbeddedManifest,
  ExpoUpdatesManifest,
} from 'expo-manifests';
```

避免继续引入：

```ts
import type {
  BareManifest,
  NewManifest,
} from 'expo-manifests';
```

### 安全读取 EAS 项目 ID

```ts
function getEasProjectId(manifest: ExpoUpdatesManifest) {
  return manifest.extra?.eas?.projectId;
}
```

返回值可能是 `string | undefined`，调用方需要处理项目未关联 EAS 或数据未提供该字段的情况。

### 使用稳定的项目作用域标识

当客户端数据需要绑定到一个不会因项目改名或账户转移而变化的项目身份时，可以读取 `scopeKey`。

> **基于文档内容推导：** 适用数据可能包括本地缓存键或项目级数据命名空间。但原文没有提供具体存储方案，也没有要求必须将 `scopeKey` 用于这些用途。

### 对外部 Manifest 做运行时检查

以下属于**基于经验建议**，不是当前文档规定的 API：

- 在消费远程 Manifest 前验证必填字段。
- 校验 `launchAsset.url` 是否为应用允许访问的 URL。
- 不要用 `as ExpoUpdatesManifest` 跳过所有数据验证。
- 对 `metadata`、`assets: any[]` 和打包器扩展字段采用防御式读取。
- 升级 Expo SDK 时搜索已弃用类型名并运行 TypeScript 检查。

## 当前文档未涉及的内容

原文没有提供以下信息：

- 获取当前 Manifest 的运行时函数。
- Manifest 的网络请求方式。
- Manifest 的完整 JSON 示例。
- `createdAt` 和 `commitTime` 的具体格式或单位。
- `id` 的格式和唯一性范围。
- `metadata` 的内部字段。
- 嵌入式 Manifest 中 `assets` 元素的结构。
- 资源下载、缓存和完整性校验机制。
- `runtimeVersion` 的配置及兼容规则。
- `expo-updates` 的发布、回滚和错误处理流程。
- `createManifest.js` 的位置、参数和执行细节。
- Android、iOS 与 tvOS 之间的行为差异。
- Web 平台支持。
- 包内是否存在可在运行时调用的 API。

对于这些内容，不应只根据当前页面作出结论，需要查阅相应 Expo SDK 版本的其他官方文档或源码。

## 总结

`expo-manifests` 的主要价值是提供 Expo Manifest 相关的类型定义。当前页面中的两类核心结构是：

- `EmbeddedManifest`：构建时嵌入原生应用。
- `ExpoUpdatesManifest`：描述 `expo-updates` 更新及其资源、运行时版本和附加配置。

开发时需要重点注意：

- 使用 `EmbeddedManifest` 和 `ExpoUpdatesManifest` 替代已弃用的旧名称。
- 正确处理大量可选字段和弱类型字段。
- 不要依赖仅在 Expo CLI 开发环境出现的 `hostUri`。
- 将 `scopeKey` 和 EAS `projectId` 视为稳定但不可自行解析的标识。
- 当前页面属于下一个 SDK 版本，实际项目应匹配自身 Expo SDK 文档。

---

## 文档导航

- **上一页**：[mail composer](./190__mail-composer.md)
- **下一页**：[maps](./192__maps.md)
