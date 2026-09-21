# 163｜Expo SDK Fingerprint 项目指纹

**翻页：**[上一页：Expo SDK FileSystem（legacy）旧版文件系统 API](./162-Expo-SDK-FileSystem-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK Font 字体加载](./164-Expo-SDK-Font.md)

**官方页面：**[Fingerprint · Latest](https://docs.expo.dev/versions/latest/sdk/fingerprint/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/fingerprint/)

**版本与平台：**Latest 推荐 `@expo/fingerprint ~0.20.13`；SDK v56.0.0 推荐 `~0.19.10`。这是 **Node 工具**，用于计算 React Native / Expo 工程的原生项目指纹，不是手机端可调用的 UI API。

## Fingerprint 解决什么问题

`@expo/fingerprint` 根据项目原生依赖、原生代码、原生工程文件和配置等输入计算 hash（哈希值）。EAS Update 等工作流可用它判断现有安装包的原生层是否与目标 JavaScript 更新兼容。

这里的 fingerprint 是构建兼容性工具生成的项目摘要，不是账号身份验证、设备证明或安全签名。默认哈希来源可配置；排除过多原生输入会让本应不同的工程得到相同摘要，因此 `.fingerprintignore`、`ignorePaths` 和 `sourceSkips` 必须谨慎设置。

SDK 项目中 `@expo/fingerprint` 随 `expo` / `expo-updates` 提供。需要直接使用它时，按当前 SDK 安装匹配版本；独立安装的命令为：

```sh
npx expo install @expo/fingerprint
npx @expo/fingerprint --help
```

v56 页面也列出 Yarn、pnpm、Bun 对应的安装 / `dlx` 命令；Latest 文档只展示 npx 命令。项目若通过 `expo` 间接依赖 Fingerprint，文档还给出 `expo/fingerprint` 类型模块名示例；要在自定义 Node 脚本中直接调用 API，可显式安装后从 `@expo/fingerprint` 导入。

## 忽略不参与哈希的文件

项目根目录可放 `.fingerprintignore`，排除变化频繁、不会影响原生兼容性的文件。它类似 `.gitignore`，但使用 minimatch 路径匹配，某些规则有差异；例如 `!` 可在忽略目录内重新包含少数文件。

```gitignore
# 忽略整棵 android 目录
android/**/*

# 忽略 iOS 工程文件，但保留 CocoaPods 的锁定配置
ios/**/*
!ios/Podfile
!ios/Podfile.lock

# 针对可能嵌套安装的依赖，使用更宽的匹配路径
**/node_modules/example-package/**/*
```

源页另有针对 `node_modules` 中某个包的忽略规则；此处通过 `**/` 形式覆盖依赖嵌套安装的情形。必须确认被忽略路径的变化不会改变原生二进制行为。

## `fingerprint.config.js`

此文件放在项目根目录，用于配置比 `.fingerprintignore` 更细的行为。以下示例跳过部分配置与脚本来源，使 Prebuild 前后的计算更稳定：

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

使用 `@expo/fingerprint` 的间接依赖时，Latest 文档展示了 `import('expo/fingerprint').Config` 作为类型引用；可在同一 JSDoc 位置将类型路径替换成该入口。

### 自定义参与哈希的内容

`fileHookTransform(source, chunk, isEndOfFile, encoding)` 会在内容参与哈希前收到一个文件 / 内容来源及其一块数据。它可用于稳定动态配置、从参与计算的 App config 中删去易变区块，或把大文件的多块内容聚合后转换。

```js
const assert = require('node:assert');
const buffersByPath = new Map();

/** @type {import('@expo/fingerprint').Config} */
const config = {
  fileHookTransform(source, chunk, isEndOfFile, encoding) {
    // expoConfig 是 contents 来源；示例将 updates 字段排除出哈希输入。
    if (source.type === 'contents' && source.id === 'expoConfig') {
      assert(isEndOfFile, '该 contents 来源应只提供一个 chunk');
      const parsed = JSON.parse(chunk.toString());
      delete parsed.updates;
      return JSON.stringify(parsed);
    }

    // 将 package.json scripts 这一 contents 来源视为空字符串。
    if (source.type === 'contents' && source.id === 'packageJson:scripts') {
      return '';
    }

    if (source.type === 'file' && source.filePath === 'eas.json') {
      return String(chunk).replace(/SampleApp-Dev/g, 'SampleApp');
    }

    // 大文件可能分多次传入：先缓存每块，到 EOF 再一次性处理完整内容。
    if (source.type === 'file' && source.filePath === 'assets/large-image.jpg') {
      let buffer = buffersByPath.get(source.filePath) ?? Buffer.alloc(0);
      if (chunk != null) {
        const next = typeof chunk === 'string' ? Buffer.from(chunk, encoding) : chunk;
        buffer = Buffer.concat([buffer, next]);
        buffersByPath.set(source.filePath, buffer);
      }
      if (!isEndOfFile) return null;

      buffersByPath.delete(source.filePath);
      return buffer.toString().replace(/PrivateMarker/g, 'StableMarker');
    }

    return chunk;
  },
};

module.exports = config;
```

`source.type` 为 `contents` 时用 `source.id` 标识配置 / 内容；为 `file` 时用 `source.filePath` 标识文件。`chunk` 可以是字符串、Buffer 或 `null`；文件可能分块，因此只在 `isEndOfFile` 为 `true` 时才能确定收齐。回调返回转换后的内容；返回 `null` 表示暂不输出，适合等待后续 chunk。

## Raw config plugin 函数的限制

动态 app config 中的 raw config plugin 函数不能直接序列化进 hash。Fingerprint 会尽力用函数名标识具名函数；匿名函数会使用通用的 `withAnonymous` 标识。结果是：**修改同名函数内部的实现，未必会让 hash 改变**。如插件实现变化需要反映在 fingerprint 中，应使用具名函数，或将本地 config plugin 拆成单独模块并以模块导出。

下面的示例展示同一个 config 中同时追加具名和匿名 raw plugin 的写法：

```js
const { withInfoPlist } = require('expo/config-plugins');

const withLocationPurpose = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.NSLocationWhenInUseUsageDescription =
      'Allow $(PRODUCT_NAME) to use your location';
    return config;
  });

module.exports = ({ config }) => {
  config.plugins ||= [];
  config.plugins.push(withLocationPurpose);
  config.plugins.push((config) => config); // 匿名函数会被通用名称标识
  return config;
};
```

更稳定的方案是把插件导出到本地模块，再让 App config 引用模块路径：

```js
// plugins/withLocationPurpose.js
const { withInfoPlist } = require('expo/config-plugins');

const withLocationPurpose = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.NSLocationWhenInUseUsageDescription =
      'Allow $(PRODUCT_NAME) to use your location';
    return config;
  });

module.exports = withLocationPurpose;
```

```json
{
  "expo": {
    "plugins": ["./plugins/withLocationPurpose"]
  }
}
```

## API 用法

在 Node 脚本中可直接导入 npm 包：

```js
import * as Fingerprint from '@expo/fingerprint';

async function inspectProject() {
  const detailed = await Fingerprint.createFingerprintAsync(process.cwd());
  console.log(detailed.hash, detailed.sources.length);

  const nativeHash = await Fingerprint.createProjectHashAsync(process.cwd());
  console.log(nativeHash);
}
```

| 方法 | 用途与结果 |
| --- | --- |
| `createFingerprintAsync(projectRoot, options?)` | 为项目计算完整 `Fingerprint`，含最终 `hash` 与来源条目数组 `sources`。 |
| `createProjectHashAsync(projectRoot, options?)` | 为项目计算简化的原生项目 hash 字符串。 |
| `diffFingerprintChangesAsync(fingerprint, projectRoot, options?)` | 用已有 fingerprint 与当前项目比较，返回新增 / 删除 / 修改的 `FingerprintDiffItem[]`。 |
| `diffFingerprints(fingerprint1, fingerprint2)` | 比较两个已计算的 fingerprint；文档说明输入来源应已排序。 |

```js
const before = await Fingerprint.createFingerprintAsync(projectRoot);

// 在此期间修改工程文件或配置。
const changes = await Fingerprint.diffFingerprintChangesAsync(before, projectRoot);
console.log(changes);

const after = await Fingerprint.createFingerprintAsync(projectRoot);
const betweenSnapshots = Fingerprint.diffFingerprints(before, after);
console.log(betweenSnapshots);
```

`FingerprintDiffItem` 是判别联合，`op` 为 `added`、`removed` 或 `changed`，分别带新增 source、删除 source 或 `beforeSource` / `afterSource`。`Fingerprint` 的 `hash` 是整个项目指纹，`sources` 是参与计算的来源及各自哈希。

## 选项和数据类型

| 选项 | 含义 |
| --- | --- |
| `concurrentIoLimit` | 并发文件 I/O 上限；默认按 CPU 核心数。 |
| `debug` | 在来源输出中附带人类可读的 hash 调试信息。 |
| `dirExcludes` | 旧排除目录配置，已 deprecated；改用 `ignorePaths`。 |
| `enableReactImportsPatcher` | 规范化旧式 React 原生头文件导入；文档注明 SDK 51 及以前默认开启。 |
| `extraSources` | 额外加入哈希的文件、目录或内容来源。 |
| `fileHookTransform` | 在内容参与哈希前转换来源内容。 |
| `hashAlgorithm` | Node `crypto.createHash()` 使用的算法；默认 `sha1`。该项目 hash 用于兼容性判断，不应用作安全证明。 |
| `ignorePaths` | 排除路径；匹配规则和 `.gitignore` 不完全相同，部分路径不自动匹配，例如用 `**/build` 匹配 `android/build`。可用 `!` 覆盖内置忽略项。 |
| `platforms` | 限制扫描原生平台，默认 `['android', 'ios']`。 |
| `silent` | 静默函数内部输出，适合 CLI 只输出 hash 的场景。 |
| `sourceSkips` | 以 `SourceSkips` 位掩码跳过特定来源；默认采用 `DEFAULT_SOURCE_SKIPS`。 |
| `useRNCoreAutolinkingFromExpo` | 使用 Expo autolinking 收集 React Native core 原生模块；SDK 52 及以后默认为 `true`。 |

来源模型便于理解结果：

| 类型 | 关键字段 |
| --- | --- |
| `HashSourceFile` / `HashSourceDir` | `filePath`、可选 `overrideHashKey`、`reasons`、`type`。 |
| `HashSourceContents` | `id`、原始 `contents`、`reasons`、`type: 'contents'`。 |
| `HashResultFile` / `HashResultDir` / `HashResultContents` | 来源 `id`、哈希十六进制字符串 `hex`、来源 `type`、可选人类可读 `debugInfo`。 |
| `FingerprintSource` | `HashSource` 加 `hash` 和可选 `debugInfo`；被排除的来源 hash 为 `null`。 |
| `DebugInfoFile` / `DebugInfoDir` / `DebugInfoContents` | 用于解释路径 / 子目录 / 内容来源的 hash，且可标记是否经过 transform。 |
| `FileHookTransformSource` | 文件来源 `{ type: 'file', filePath }` 或内容来源 `{ type: 'contents', id }`。 |
| `FileHookTransformFunction` | 参数为来源、chunk、EOF 标志和编码；返回 `Buffer`、字符串或 `null`。 |
| `Config` | 根目录 `fingerprint.config.js` 支持的 `Options` 子集，并额外允许 `sourceSkips` 用字符串名称配置。 |
| `Platform` / `ProjectWorkflow` | 平台 `'android' | 'ios'`；workflow `'generic' | 'managed' | 'unknown'`。 |

## `SourceSkips` 位掩码

这些值可按位 OR 组合。它们控制哪些 app config / package 文件部分不参与 hash；值越宽，越可能漏掉原生兼容性变化。

| 枚举 | 值 | 跳过内容 |
| --- | ---: | --- |
| `None` | `0` | 不跳过。 |
| `ExpoConfigVersions` | `1` | `version`、Android versionCode、iOS buildNumber。 |
| `ExpoConfigRuntimeVersionIfString` | `2` | 字符串形式的 runtimeVersion。 |
| `ExpoConfigNames` | `4` | App 名称、描述与 Web 名称字段。 |
| `ExpoConfigAndroidPackage` | `8` | Android package 名称。 |
| `ExpoConfigIosBundleIdentifier` | `16` | iOS bundle identifier。 |
| `ExpoConfigSchemes` | `32` | app config 的 schemes。 |
| `ExpoConfigEASProject` | `64` | EAS project 信息。 |
| `ExpoConfigAssets` | `128` | app config 中 icon、splash 等资源。 |
| `ExpoConfigAll` | `256` | 跳过整个 ExpoConfig；文档特别提醒慎用。 |
| `PackageJsonAndroidAndIosScriptsIfNotContainRun` | `512` | `package.json` 的 android / ios scripts 中不含 `run` 的项。 |
| `PackageJsonScriptsAll` | `1024` | 整个 `package.json` scripts 区域。 |
| `GitIgnore` | `2048` | `.gitignore` 文件。 |
| `ExpoConfigExtraSection` | `4096` | app config 的 `extra` 区域。 |

其它 API 类型还包括 `HashSource` / `HashResult`（对应 File、Dir、Contents 三种联合）、`DebugInfo`、`FingerprintDiffItem`（added / removed / changed 联合）。这几组类型分别描述输入、逐项哈希结果、调试树和两次指纹的差异。

## Latest 与 SDK v56 差异

- Latest 推荐 `@expo/fingerprint ~0.20.13`，SDK v56 推荐 `~0.19.10`。请按本地 Expo SDK 版本使用匹配依赖。
- 两版都是 Node API，主要 hash 方法、`Options`、`Config`、`SourceSkips` 值和 raw config plugin 限制一致。
- 安装和 CLI 示例存在文档快照差异：Latest 只列 npx，v56 页面同时列 Yarn / pnpm / Bun 命令。
- Latest 和 v56 页面 Next 都指向 Expo SDK Font。

## 源页代码主题覆盖

- Installation / CLI：覆盖 standalone 安装命令、CLI `--help` 用法与 SDK 内置依赖说明。
- `.fingerprintignore`：覆盖 Android / iOS 目录排除、保留 Podfile / lockfile、依赖包全局匹配规则。
- `fingerprint.config.js`：覆盖 `sourceSkips` 示例、间接依赖类型引用及 `fileHookTransform` 的 app config / package scripts / 普通配置文件 / 分块大型文件转换。
- Raw config plugin：覆盖具名 + 匿名 plugin 示例、`withAnonymous` 限制、独立本地插件文件与 app.json 模块引用方案。
- Fingerprint API：覆盖 `createFingerprintAsync`、`createProjectHashAsync`、`diffFingerprintChangesAsync`、`diffFingerprints` 四种官方代码主题和返回模型。
- Reference：覆盖 `Options`、`Config`、source / result / debug interfaces、平台与 workflow 联合类型、所有 `SourceSkips` 枚举值。
- Latest / SDK v56 校对：标出包版本与 CLI 包管理器示例差异；两版 API Next 均为 Font。

**翻页：**[上一页：Expo SDK FileSystem（legacy）旧版文件系统 API](./162-Expo-SDK-FileSystem-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK Font 字体加载](./164-Expo-SDK-Font.md)
