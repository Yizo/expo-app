# Expo Fingerprint：为 React Native 项目生成原生兼容性指纹

> 本文对应 Expo 下一版本 SDK 的未发布文档。原文提示：当前最新稳定文档为 SDK 56。  
> 文档修改日期：2026 年 6 月 3 日。

## 文档解决的问题

`@expo/fingerprint` 用于为 React Native 项目生成一个指纹，也就是根据项目关键内容计算出的哈希值。

它主要解决以下问题：

- 判断应用的 JavaScript 层是否与当前原生层兼容。
- 检测依赖、原生代码、原生工程文件或 Expo 配置是否发生变化。
- 对比两次指纹，定位哪些输入源发生了增加、删除或修改。
- 在自动化脚本、CLI 或更新发布流程中生成稳定的项目标识。

默认情况下，指纹会综合以下内容计算：

- 项目依赖。
- 自定义原生代码。
- Android、iOS 原生工程文件。
- Expo 应用配置。

这里的“指纹”不是设备指纹，也不是用户追踪技术，而是项目构建输入的哈希摘要。

## 阅读前需要理解的背景

### JavaScript 层与原生层

React Web 项目通常由浏览器提供底层运行环境。部署新的 JavaScript、CSS 和静态资源后，浏览器可以直接加载。

React Native 应用则包含两个需要配合工作的部分：

- **JavaScript 层**：React 组件、业务逻辑及 JavaScript 依赖。
- **原生层**：编译进 iOS 或 Android 安装包的原生模块、工程配置和平台代码。

如果 JavaScript 开始调用一个新安装的原生模块，而用户设备中的安装包没有编译该模块，仅更新 JavaScript 通常无法解决问题。Fingerprint 的核心用途就是识别这种原生兼容边界。

### 哈希与指纹源

哈希函数将输入数据转换成固定形式的摘要。输入发生变化时，摘要通常也会变化。

`@expo/fingerprint` 不只是给整个目录简单计算一个哈希，而是先收集一组 `source`，再分别计算这些来源的哈希，最后生成整个项目的最终哈希。

来源可以是：

- 一个文件。
- 一个目录。
- 一段由工具生成的内存内容，例如经过解析的 Expo 配置。
- 使用 `extraSources` 补充的自定义来源。

### Node 平台的含义

文档中的 API 均标记为仅支持 **Node**。

这表示该库用于开发机、构建服务器或 CLI 环境，而不是在 React Native 应用运行时调用。不要在移动端组件中导入它并期待其在 iOS 或 Android 设备上运行。

## 安装

`@expo/fingerprint` 已默认包含在以下包中：

- `expo`
- `expo-updates`

如果需要将其作为直接依赖单独使用，可以执行：

```sh
# npm
npx expo install @expo/fingerprint

# yarn
yarn expo install @expo/fingerprint

# pnpm
pnpm expo install @expo/fingerprint

# bun
bun expo install @expo/fingerprint
```

使用 `expo install` 而不是直接执行包管理器的普通安装命令，可以让 Expo 根据项目环境选择合适的依赖版本。

如果 `@expo/fingerprint` 是直接依赖，配置文件中的类型可以这样引用：

```js
/** @type {import('@expo/fingerprint').Config} */
```

如果通过 `expo` 间接使用它，则可以写成：

```js
/** @type {import('expo/fingerprint').Config} */
```

## CLI 用法

不同包管理器对应的 CLI 调用方式如下：

```sh
# npm
npx @expo/fingerprint --help

# yarn
yarn dlx @expo/fingerprint --help

# pnpm
pnpm dlx @expo/fingerprint --help

# bun
bunx @expo/fingerprint --help
```

原文只展示了 `--help` 入口，没有列出其他 CLI 参数和完整工作流。

## 配置指纹计算

默认配置适合大多数项目。项目结构或发布流程有特殊需求时，可以通过以下两类配置调整：

- `.fingerprintignore`：排除不应参与哈希的文件和目录。
- `fingerprint.config.js`：配置更高级的计算行为。

### `.fingerprintignore`

该文件放在项目根目录中，语法类似 `.gitignore`。所有路径均相对于项目根目录。

```ignore
# 忽略整个 Android 目录
android/**/*

# 忽略 iOS 目录，但保留 Podfile 和 Podfile.lock
ios/**/*
!ios/Podfile
!ios/Podfile.lock

# 忽略 node_modules 中指定位置的包
node_modules/some-package/**/*

# 忽略任意嵌套层级 node_modules 中的指定包
**/node_modules/some-package/**/*
```

它与 `.gitignore` 并不完全相同，因为底层使用 `minimatch` 匹配。

尤其需要注意：

```text
build
```

不能匹配：

```text
android/build
```

需要使用类似下面的模式：

```text
**/build
```

这意味着不能因为熟悉 Git 就默认所有 `.gitignore` 写法在这里都具有相同行为。

### `fingerprint.config.js`

该文件也放在项目根目录，用于设置无法仅通过忽略规则表达的行为。

```js
/** @type {import('@expo/fingerprint').Config} */
const config = {
  sourceSkips: [
    'ExpoConfigRuntimeVersionIfString',
    'ExpoConfigVersions',
    'PackageJsonAndroidAndIosScriptsIfNotContainRun',
  ],
};

module.exports = config;
```

在配置文件中，`sourceSkips` 可以使用跳过项名称数组。通过 API 的 `Options` 使用时，它对应的是按位或组合的 `SourceSkips` 位掩码。

## 在哈希前转换来源内容

`fileHookTransform` 可以在数据进入哈希函数之前修改它。

适用场景包括：

- 从 Expo 配置中删除敏感信息。
- 将动态配置值转换成稳定值。
- 将某些文件内容或文件哈希标准化。
- 缓冲大文件的多个数据块，然后统一转换。

函数签名为：

```ts
type FileHookTransformFunction = (
  source,
  chunk,
  isEndOfFile,
  encoding
) => Buffer | string | null;
```

参数含义：

| 参数 | 说明 |
| --- | --- |
| `source` | 当前来源，可能是文件或内存内容 |
| `chunk` | 当前读取到的数据块，可能是 `Buffer`、字符串或 `null` |
| `isEndOfFile` | 是否已经到达该来源末尾 |
| `encoding` | 字符串数据使用的 Buffer 编码 |

来源有两种形式：

```ts
{ type: 'file', filePath: string }
```

```ts
{ type: 'contents', id: string }
```

### 转换 Expo 配置

```js
if (source.type === 'contents' && source.id === 'expoConfig') {
  const config = JSON.parse(chunk);
  delete config.updates;
  return JSON.stringify(config);
}
```

这会让 `updates` 配置不参与最终哈希。

### 排除一段内存内容

```js
if (source.type === 'contents' && source.id === 'packageJson:scripts') {
  return '';
}
```

返回空字符串意味着该来源仍经过处理，但其原始内容不再影响哈希。

### 替换文件中的动态值

```js
if (source.type === 'file' && source.filePath === 'eas.json') {
  return chunk.toString().replace(/MyApp-Dev/g, 'MyApp');
}
```

例如开发环境和正式环境只有应用名称不同，但希望二者在该差异上保持相同指纹时，可以先标准化名称。

### 处理分块读取的大文件

大文件可能不会一次传入完整内容。需要自行缓存每个 `chunk`，直到 `isEndOfFile` 为 `true`。

```js
const fileChunkMap = {};

if (
  source.type === 'file' &&
  source.filePath === 'assets/large-image.jpg'
) {
  let receivedBuffer =
    fileChunkMap[source.filePath] ?? Buffer.alloc(0);

  if (chunk != null) {
    const buffer =
      typeof chunk === 'string'
        ? Buffer.from(chunk, encoding)
        : chunk;

    receivedBuffer = Buffer.concat([receivedBuffer, buffer]);
    fileChunkMap[source.filePath] = receivedBuffer;
  }

  if (!isEndOfFile) {
    return null;
  }

  fileChunkMap[source.filePath] = null;

  return receivedBuffer
    .toString()
    .replace(/SensitiveData/g, 'StableData');
}
```

返回 `null` 在这里表示暂时不输出内容，等待后续数据块。其他不需要转换的来源应直接返回原始 `chunk`。

> **基于文档内容推导：** `fileHookTransform` 会直接改变哈希输入，因此转换规则本身必须稳定、确定。若转换依赖当前时间、随机数或不同机器上的环境变量，相同项目可能生成不同指纹。

## 主要 API

```ts
import * as Fingerprint from '@expo/fingerprint';
```

### `createFingerprintAsync()`

```ts
Fingerprint.createFingerprintAsync(projectRoot, options?)
```

为项目生成完整指纹。

```js
const fingerprint =
  await Fingerprint.createFingerprintAsync('/app');

console.log(fingerprint);
```

返回值包含：

```ts
interface Fingerprint {
  hash: string;
  sources: FingerprintSource[];
}
```

- `hash`：整个项目的最终哈希。
- `sources`：用于生成最终哈希的来源及各自的哈希。

适合需要检查计算明细或后续进行差异比较的场景。

### `createProjectHashAsync()`

```ts
Fingerprint.createProjectHashAsync(projectRoot, options?)
```

只生成项目的原生哈希字符串：

```ts
const hash =
  await Fingerprint.createProjectHashAsync('/app');

console.log(hash);
```

返回 `Promise<string>`。如果只需要最终兼容性标识而不关心来源明细，这个接口更直接。

### `diffFingerprintChangesAsync()`

```ts
Fingerprint.diffFingerprintChangesAsync(
  fingerprint,
  projectRoot,
  options?
)
```

将一个已有指纹与项目当前状态进行比较：

```ts
const fingerprint =
  await Fingerprint.createFingerprintAsync('/app');

// 修改项目

const diff =
  await Fingerprint.diffFingerprintChangesAsync(
    fingerprint,
    '/app'
  );

console.log(diff);
```

适合回答“项目修改后，哪些指纹来源发生了变化”。

### `diffFingerprints()`

```ts
Fingerprint.diffFingerprints(fingerprint1, fingerprint2)
```

比较两个已经生成的指纹：

```ts
const before =
  await Fingerprint.createFingerprintAsync('/app');

// 修改项目

const after =
  await Fingerprint.createFingerprintAsync('/app');

const diff = Fingerprint.diffFingerprints(before, after);
console.log(diff);
```

该实现假定两个指纹中的 `sources` 已经排序。自行构造或修改 `Fingerprint` 对象时需要保留这一前提。

差异项包括三种形式：

| `op` | 含义 | 附带数据 |
| --- | --- | --- |
| `added` | 新增来源 | `addedSource` |
| `removed` | 删除来源 | `removedSource` |
| `changed` | 来源内容发生变化 | `beforeSource`、`afterSource` |

## `Options` 配置说明

| 配置项 | 作用与默认行为 |
| --- | --- |
| `concurrentIoLimit` | 限制并发 I/O 数量，默认使用 CPU 核心数 |
| `debug` | 在来源输出中包含详细调试信息 |
| `dirExcludes` | 已弃用，使用 `ignorePaths`；旧默认值会排除 Android 构建目录、`.cxx` 和 `ios/Pods` |
| `enableReactImportsPatcher` | 将 `#import "RCTBridge.h"` 标准化为 `#import <React/RCTBridge.h>`；Expo SDK 51 及以下默认启用 |
| `extraSources` | 加入额外的文件、目录或内存内容来源 |
| `fileHookTransform` | 在计算哈希前转换来源内容 |
| `hashAlgorithm` | 传给 Node `crypto.createHash()` 的算法，默认为 `sha1` |
| `ignorePaths` | 从哈希中排除匹配的文件和目录 |
| `platforms` | 限制参与计算的原生平台，默认为 `['android', 'ios']` |
| `silent` | 禁止函数产生控制台输出，适合只允许输出指纹的 CLI |
| `sourceSkips` | 跳过指定来源，API 中通过位掩码组合；默认为 `DEFAULT_SOURCE_SKIPS` |
| `useRNCoreAutolinkingFromExpo` | 使用 `expo-modules-autolinking` 提供的 React Native 核心自动链接来源；Expo SDK 52 及以上默认启用 |

### `extraSources`

支持三类额外来源：

- `HashSourceFile`
- `HashSourceDir`
- `HashSourceContents`

文件和目录来源包含：

- `filePath`：路径。
- `reasons`：该来源被加入的原因。
- `overrideHashKey`：可选，用于覆盖默认以 `filePath` 作为哈希键的行为。

内存内容来源包含：

- `id`：来源标识。
- `contents`：字符串或 `Buffer`。
- `reasons`：来源产生的原因。

### `debug`

启用后，来源可以附带面向开发者阅读的 `debugInfo`。调试信息可能包含：

- 文件或目录路径。
- 当前来源的哈希。
- 目录中的子节点。
- 是否经过 `fileHookTransform` 转换。

文档明确说明，`debugInfo` 面向人类排查问题，不应被视为稳定的程序化接口。

## `SourceSkips`：跳过指定来源

`SourceSkips` 是位掩码枚举。API 调用中可以用按位或组合多个值：

```ts
const sourceSkips =
  Fingerprint.SourceSkips.ExpoConfigVersions |
  Fingerprint.SourceSkips.GitIgnore;
```

在 `fingerprint.config.js` 中则可使用对应名称数组。

| 名称 | 值 | 跳过内容 |
| --- | ---: | --- |
| `None` | 0 | 不跳过任何内容 |
| `ExpoConfigVersions` | 1 | `version`、`android.versionCode`、`ios.buildNumber` |
| `ExpoConfigRuntimeVersionIfString` | 2 | 字符串形式的 `runtimeVersion` |
| `ExpoConfigNames` | 4 | `name`、`description` 及 Web 名称和描述 |
| `ExpoConfigAndroidPackage` | 8 | Android 包名 |
| `ExpoConfigIosBundleIdentifier` | 16 | iOS Bundle Identifier |
| `ExpoConfigSchemes` | 32 | URL schemes |
| `ExpoConfigEASProject` | 64 | EAS 项目信息 |
| `ExpoConfigAssets` | 128 | 图标、启动图等 Expo 配置资源 |
| `ExpoConfigAll` | 256 | 整个 Expo 配置 |
| `PackageJsonAndroidAndIosScriptsIfNotContainRun` | 512 | 当 `android`、`ios` 脚本不包含 `run` 时跳过相关脚本 |
| `PackageJsonScriptsAll` | 1024 | 整个 `package.json` 的 `scripts` |
| `GitIgnore` | 2048 | `.gitignore` 文件 |
| `ExpoConfigExtraSection` | 4096 | Expo 配置中的 `extra` 部分 |

`PackageJsonAndroidAndIosScriptsIfNotContainRun` 用于减少 Expo Prebuild 前后的指纹差异。Prebuild 会生成或修改原生项目，同时可能调整 `package.json` 中的脚本。

### 谨慎使用 `ExpoConfigAll`

原文明确建议优先使用更细粒度的 Expo 配置跳过项。

跳过整个 Expo 配置可能遗漏本应改变原生指纹的修改，例如：

- 新增 config plugin。
- 修改应用图标。
- 修改应用名称。

这可能导致原生层已经变化，但最终哈希仍未变化。

## Config Plugin 原始函数的限制

Expo config plugin 可以在生成或修改原生工程时改写 `Info.plist`、Android Manifest 等配置。

当插件直接以 JavaScript 函数形式写入配置时，Fingerprint 无法完整序列化函数实现，因此只能尽力生成标识：

1. 命名函数使用 `Function.name`。
2. 没有函数名的匿名函数统一使用 `withAnonymous`。

例如：

```js
const withMyPlugin = (config) => {
  // 修改原生配置
  return config;
};

config.plugins.push(withMyPlugin);
config.plugins.push((config) => config);
```

哈希中对应的插件属性可能是：

```text
withMyPlugin
withAnonymous
```

### 关键风险

如果只修改函数内部实现，而函数名保持不变，指纹可能仍然生成相同哈希。

例如将 `withMyPlugin` 写入 `Info.plist` 的值从 A 改成 B，但函数名仍为 `withMyPlugin`，Fingerprint 不一定能够识别这次原生变化。

匿名函数的风险更明显：多个不同实现都可能只表示为 `withAnonymous`。

### 文档给出的处理方式

- 尽量避免匿名原始 config plugin 函数。
- 使用命名函数。
- 将本地 config plugin 拆分成独立模块并导出。
- 修改插件实现时，可以调整其函数名，使指纹输入发生变化。

本地插件示例：

```js
const { withInfoPlist } = require('expo/config-plugins');

const withMyPlugin = config => {
  return withInfoPlist(config, config => {
    config.modResults.NSLocationWhenInUseUsageDescription =
      'Allow $(PRODUCT_NAME) to use your location';
    return config;
  });
};

module.exports = withMyPlugin;
```

在 Expo 配置中通过模块路径引用：

```json
{
  "expo": {
    "plugins": ["./plugins/withMyPlugin"]
  }
}
```

需要注意，文档示例正文展示的是字符串形式，但 Expo 的 `plugins` 配置通常是插件列表；上例以数组表达其实际位置。

## 数据类型关系

### `FingerprintSource`

`FingerprintSource` 是原始 `HashSource` 加上计算结果：

```ts
type FingerprintSource = HashSource & {
  hash: string | null;
  debugInfo?: DebugInfo;
};
```

如果来源被排除，`hash` 为 `null`。

### `HashSource`

`HashSource` 是三种来源的联合类型：

```ts
type HashSource =
  | HashSourceFile
  | HashSourceDir
  | HashSourceContents;
```

使用 `type` 字段进行区分：

- `file`
- `dir`
- `contents`

这与前端常见的 TypeScript 可辨识联合类型相同。

### `HashResult`

计算结果同样分为：

- `HashResultFile`
- `HashResultDir`
- `HashResultContents`

每项包含：

- `type`
- `id`
- `hex`
- 可选的 `debugInfo`

### 其他类型

`Platform` 只接受：

```ts
'android' | 'ios'
```

`ProjectWorkflow` 只接受：

```ts
'generic' | 'managed' | 'unknown'
```

当前文档列出了 `ProjectWorkflow` 类型，但没有说明它在哪个公开方法或具体流程中使用。

## 常量

### `DEFAULT_IGNORE_PATHS`

```ts
Fingerprint.DEFAULT_IGNORE_PATHS
```

类型为 `string[]`，表示默认忽略路径。当前文档没有列出其完整内容。

### `DEFAULT_SOURCE_SKIPS`

```ts
Fingerprint.DEFAULT_SOURCE_SKIPS
```

表示默认跳过的来源集合。

原文 API 表格将其类型显示为 `PackageJsonAndroidAndIosScriptsIfNotContainRun`，但没有进一步解释该类型标注。实际使用时应将它理解为库提供的默认 `SourceSkips` 配置常量，不应根据该表格推断它只能表示一个跳过项。

## React Web 开发者容易误解的地方

### 指纹不是前端构建产物哈希

Web 构建工具常为 JavaScript、CSS 文件生成内容哈希，用于缓存失效。Expo Fingerprint 关注的重点是 React Native 项目的原生兼容性，而不是浏览器静态资源缓存。

### 修改 JavaScript 不一定改变原生指纹

指纹默认关注依赖、原生代码、原生工程和相关配置。普通业务组件的文本或样式变化是否影响最终指纹，取决于它是否属于实际收集的来源。

不能把它当作整个 Git 仓库的提交哈希。

### `android` 和 `ios` 不是普通输出目录

在 React Native 项目中，这两个目录是原生工程，类似可以由 Android Studio 或 Xcode 打开的完整应用项目。排除它们可能使真实的原生代码变化无法反映到指纹中。

### 自动链接会影响原生工程

React Native 原生依赖通常需要链接到 iOS 或 Android 工程。Expo 的自动链接工具会发现依赖并生成相应配置，因此文档提供了与 SDK 版本相关的自动链接选项，以减少工具行为差异造成的不稳定哈希。

### 忽略差异不代表消除兼容性风险

`.fingerprintignore`、`sourceSkips` 和 `fileHookTransform` 都可以让某些变化不再改变哈希，但它们只改变判断方式，并不会让原生变更自动变得兼容。

## 实际开发中的使用方式

以下流程是**基于文档内容推导**的典型用法：

1. 在发布原生安装包时生成并保存完整 `Fingerprint`。
2. 修改依赖、Expo 配置或原生代码后重新生成指纹。
3. 比较新旧最终哈希，判断原生兼容边界是否变化。
4. 哈希变化时使用 diff API 定位具体来源。
5. 只有确认某项差异不影响原生兼容性时，才通过忽略规则、`sourceSkips` 或转换钩子将其稳定化。
6. 在 CI 中只输出哈希时启用 `silent`，避免日志污染机器可读结果。
7. 排查异常变化时启用 `debug`，检查来源、路径及是否经过转换。

**基于经验建议：**

- 将指纹配置纳入版本控制，使本地和 CI 使用同一套规则。
- 对 `sourceSkips` 和 `.fingerprintignore` 的修改进行代码审查，因为过度排除可能隐藏真实的原生变化。
- 不要轻易更换 `hashAlgorithm`，否则未修改项目内容也可能产生全新的最终哈希。
- 为重要的本地 config plugin 使用独立模块，并避免匿名函数。
- 升级 Expo SDK 后重新确认与自动链接及 React import 标准化相关的默认值。

## 文档未涉及的内容

当前文档没有明确说明：

- 指纹与 `expo-updates`、EAS Update 的完整集成步骤。
- CLI 除 `--help` 以外的完整参数。
- 指纹应该存储在哪里。
- 指纹哈希变化后是否必须重新构建安装包。
- `DEFAULT_IGNORE_PATHS` 和 `DEFAULT_SOURCE_SKIPS` 的完整实际值。
- 哈希计算的性能基准。
- SHA-1 在安全认证场景中的适用性。

因此，不能仅根据本页推断完整的 OTA 更新发布策略或安全校验方案。

## 总结

`@expo/fingerprint` 是一个运行在 Node 环境中的项目分析工具。它通过对依赖、原生工程、原生代码和相关配置进行哈希，生成用于判断 React Native 原生层与 JavaScript 层兼容性的项目指纹。

使用时应重点掌握：

- 完整 `Fingerprint` 同时包含最终哈希和来源明细。
- `.fingerprintignore` 使用 `minimatch`，与 `.gitignore` 不完全相同。
- `sourceSkips` 应优先使用细粒度选项。
- `fileHookTransform` 可以稳定动态值，但也可能隐藏真实变化。
- 原始 config plugin 函数无法完整序列化，仅修改函数实现可能不会改变指纹。
- 所有公开 API 均面向 Node 工具环境，而不是移动端运行时。

---

## 文档导航

- **上一页**：[filesystem legacy](./170__filesystem-legacy.md)
- **下一页**：[font](./172__font.md)
