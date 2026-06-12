# Expo Asset 学习指南

> 原文修改日期：2026 年 3 月 19 日  
> 包名：`expo-asset`  
> 支持平台：Android、iOS、tvOS、Web、Expo Go

> **版本提醒：**本文对应尚未正式发布的下一版本 SDK 文档。原文指出，当前最新稳定文档是 SDK 56。实际项目应优先查看与项目 Expo SDK 版本匹配的文档。

## 文档解决的问题

`expo-asset` 是 Expo 的通用资源管理库，用于：

- 表示应用运行时需要的静态资源。
- 获取资源的名称、类型、尺寸、哈希值和 URI 等元数据。
- 将资源下载到设备本地缓存。
- 把资源交给图片、音频、字体等其他库使用。
- 在构建原生应用时，将指定资源嵌入原生工程。

这里的“资源（Asset）”是与应用源码一起维护、运行时需要使用的文件，例如：

- 图片
- 字体
- 音频
- 视频
- SQLite 数据库
- Lottie、Rive 动画
- 3D 模型

## React Web 开发者需要先理解的背景

### Asset 不等同于 Web 静态目录

在 React Web 项目中，静态文件通常来自：

- `public` 目录中的固定 URL；
- `import logo from './logo.png'`；
- 构建工具生成的带哈希 URL。

React Native 没有浏览器的 `public` 目录和普通 HTTP 静态资源模型。它通过打包器识别资源：

```tsx
<Image source={require('./assets/logo.png')} />
```

这里的 `require()` 不是在运行时读取任意路径，而是让打包器在构建阶段识别一个静态文件，并返回相应的资源模块标识。

Expo 的资源系统与 React Native 的资源机制集成，因此这种写法可以直接使用。

### 远程 URI 与本地 URI

`Asset` 中有两个容易混淆的属性：

- `uri`：资源数据所在位置，可能指向开发服务器或远程资源服务器。
- `localUri`：资源下载到设备缓存后，对应的本地 `file://` 地址。

在 Web 中，组件通常直接消费 HTTP URL；移动端原生库有时要求文件已经存在于设备上，此时通常需要使用 `localUri`。

### 构建时嵌入与运行时下载

资源有两种主要准备方式：

1. **构建时嵌入**：通过 config plugin 将资源链接到原生工程，需要重新构建应用。
2. **运行时下载**：通过 `downloadAsync()`、`loadAsync()` 或 `useAssets()` 将资源保存到缓存目录。

两者的生命周期不同：

- 构建时配置属于应用二进制的一部分。
- 运行时下载的文件只是缓存，可能被操作系统删除。

## 安装

根据包管理器执行对应命令：

```sh
# npm
npx expo install expo-asset

# yarn
yarn expo install expo-asset

# pnpm
pnpm expo install expo-asset

# bun
bun expo install expo-asset
```

`expo install` 会为当前 Expo SDK 选择兼容的软件包版本。它与直接执行 `npm install expo-asset` 的意义并不完全相同。

如果是在已有的纯 React Native 原生工程中安装，还必须先按照 Expo 文档为项目安装 `expo` 和 Expo Modules 基础设施。只安装 `expo-asset` 并不足以让它在这种工程中工作。

## 使用 Config Plugin 嵌入资源

### 适用条件

当项目使用 config plugins 和 Continuous Native Generation（CNG，持续原生工程生成）时，可以通过 `expo-asset` 内置的 config plugin 配置资源。

CNG 可以理解为：Expo 根据 `app.json` 等配置生成或更新 iOS、Android 原生工程。Config plugin 则是在生成过程中修改原生工程的配置插件。

这些配置：

- 无法在 JavaScript 运行时动态设置；
- 修改后必须重新构建应用二进制；
- 不使用 CNG 时需要手动完成相应的原生工程配置。

### `app.json` 示例

```json
{
  "expo": {
    "plugins": [
      [
        "expo-asset",
        {
          "assets": ["path/to/file.png", "path/to/directory"]
        }
      ]
    ]
  }
}
```

`assets` 可以同时包含文件和目录。路径必须相对于项目根目录。

### `assets` 配置项

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `assets` | `[]` | 指定需要链接到原生工程的资源文件或目录 |

文档明确列出的文件类型如下：

| 类别 | 扩展名 |
| --- | --- |
| 图片 | `.png`、`.jpg`、`.gif` |
| 媒体 | `.mp4`、`.mp3`、`.lottie`、`.riv` |
| SQLite 数据库 | `.db` |
| 3D 模型 | `.glb` |

需要特别注意：

- 文件路径或目录中的文件名会成为原生资源名称，因此命名会影响生成后的原生资源。
- 导入已有 `.db` 数据库需要参考 Expo SQLite API 的专门说明。
- `.lottie`、`.riv` 等文件可能还需要在 Metro 配置的 `assetExts` 中添加扩展名。
- 当前文档没有给出不使用 CNG 时的具体手动配置步骤。

## API 入口

文档给出的主要导入方式为：

```js
import { Asset } from 'expo-asset';
```

`Asset` 类用于表示、检查和下载资源。

## 使用 `useAssets` 加载资源

```tsx
const [assets, error] = useAssets([
  require('path/to/asset.jpg'),
  require('path/to/other.png')
]);

return assets ? <Image source={assets[0]} /> : null;
```

### 参数

```ts
useAssets(moduleIds: number | number[])
```

`moduleIds` 是单个或多个静态资源模块 ID，通常来自：

```ts
require('./assets/image.png')
```

### 返回值

```ts
[Asset[] | undefined, Error | undefined]
```

数组中：

1. 第一项是已经加载的 `Asset` 列表。加载完成前为 `undefined`。
2. 第二项是加载错误。没有错误时为 `undefined`。

该返回形式类似 React Web 中常见的“数据与错误状态”，但加载阶段没有单独的 `loading` 字段，需要通过 `assets === undefined && error === undefined` 判断。

### 重要限制

文档明确指出：动态修改传给 `useAssets` 的资源列表，不会使资源重新加载。

因此，不能把它理解成会自动响应依赖变化的通用数据请求 Hook。它更适合加载在组件生命周期中保持固定的一组静态资源。

## `Asset` 类

`Asset` 表示一个资源，既包含资源元数据，也提供将资源加载到本地的方法。

### 属性

| 属性 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `downloaded` | `boolean` | `false` | 是否已经通过 `downloadAsync()` 完成下载 |
| `hash` | `string \| null` | `null` | 资源数据的 MD5 哈希，只读 |
| `height` | `number \| null` | `null` | 图片的逻辑高度；非图片可能为 `null` |
| `localUri` | `string \| null` | `null` | 下载后指向设备本地文件的 `file://` URI |
| `name` | `string` | — | 不包含扩展名和图片缩放后缀的资源名称 |
| `type` | `string` | — | 文件扩展名，只读 |
| `uri` | `string` | — | 指向资源数据位置的 URI，只读 |
| `width` | `number \| null` | `null` | 图片的逻辑宽度；非图片可能为 `null` |

### 图片尺寸与缩放倍数

对于图片，`width` 和 `height` 不是原始像素尺寸，而是原始尺寸除以缩放倍数后的逻辑尺寸。

缩放倍数来自文件名中的 `@` 后缀：

```text
icon.png      → scale = 1
icon@2x.png   → scale = 2
icon@3x.png   → scale = 3
```

例如，一张 `icon@2x.png` 的实际像素尺寸为 `200 × 100`，其逻辑尺寸会是 `100 × 50`。

`name` 同样会移除缩放部分。例如，`icon@2x.png` 的 `name` 是 `icon`，`type` 是 `png`。

### `uri` 的环境差异

`uri` 的值取决于应用运行方式：

- 开发期间通过 Expo CLI 运行时，通常指向开发计算机上的 Expo CLI 服务器。
- 已发布应用中，可能指向 Expo 资源服务器。
- 文档指出，如果没有使用旧版 Classic Updates，应忽略该字段，因为 Expo 会在应用逻辑运行前确保资源已位于设备上。

这意味着业务代码不应无条件假设 `uri` 永远是稳定的公网 URL。

## 下载资源：`downloadAsync()`

```ts
const asset = Asset.fromModule(require('./assets/image.png'));
await asset.downloadAsync();

console.log(asset.localUri);
```

该方法会：

1. 检查是否已经存在最新的本地资源文件。
2. 需要时将资源下载到设备缓存目录。
3. 下载成功后更新 `localUri`。
4. 返回对应的 `Asset` 实例。

返回类型：

```ts
Promise<Asset>
```

如果之前已经下载过最新版本，方法不会重复下载。

### 缓存并非持久存储

这是该 API 最重要的限制：

- 下载结果位于缓存目录。
- 操作系统可以自行清理缓存。
- 用户也可以手动清理缓存。
- 无法保证文件跨应用会话持续存在。

缓存文件名采用类似以下格式：

```text
ExponentAsset-{cacheFileId}.{extension}
```

因此，不能仅凭曾经执行过 `downloadAsync()`，就永久保存 `localUri` 并假设文件以后仍然存在。

如需手动清除缓存资源，可以使用 `expo-file-system`：

```ts
Paths.cache.delete();
```

旧版 API 对应：

```ts
deleteAsync(cacheDirectory);
```

> **基于文档内容推导：**如果业务要求文件必须长期存在，例如离线资料或用户明确下载的媒体，不能只依赖 `expo-asset` 的缓存目录。当前文档没有给出持久化方案，需要结合文件系统相关文档另外设计。

## 创建和批量加载 Asset

### `Asset.fromModule()`

```ts
Asset.fromModule(virtualAssetModule)
```

参数支持：

```ts
string | number | {
  height: number;
  uri: string;
  width: number;
}
```

可传入：

- `require('path/to/file')` 的返回值；
- 外部网络 URL；
- 包含 `uri`、`width`、`height` 的资源对象。

它只负责取得表示该资源的 `Asset` 实例。需要确保资源已下载到本地时，还应调用 `downloadAsync()`。

### `Asset.fromURI()`

```ts
Asset.fromURI(uri: string)
```

根据 URI 创建并返回一个 `Asset` 实例。

当前文档没有进一步说明 URI 协议限制、网络失败行为或缓存策略。

### `Asset.fromMetadata()`

```ts
Asset.fromMetadata(meta: AssetMetadata)
```

根据资源元数据创建并返回 `Asset`。

该方法更接近底层资源描述转换。当前文档未提供使用示例，也未说明普通业务代码何时应优先使用它。

### `Asset.loadAsync()`

```ts
const [{ localUri }] = await Asset.loadAsync(
  require('./assets/snack-icon.png')
);
```

参数支持：

```ts
string | number | string[] | number[]
```

因此既可以加载：

- 单个 `require()` 资源；
- 多个 `require()` 资源；
- 单个外部网络 URL；
- 多个外部网络 URL。

返回类型：

```ts
Promise<Asset[]>
```

即使只传一个资源，返回值仍然是数组。

它本质上是以下调用过程的便捷封装：

```ts
Asset.fromModule(module).downloadAsync()
```

当资源保存到磁盘后，Promise 才会完成。

## 如何选择加载方式

| 场景 | 推荐 API | 原因 |
| --- | --- | --- |
| React 组件需要加载固定资源 | `useAssets()` | 提供适合组件渲染的资源和错误状态 |
| 普通异步流程中加载一个或多个资源 | `Asset.loadAsync()` | 自动完成创建和下载 |
| 需要先读取元数据，再决定是否下载 | `Asset.fromModule()` | 可以先获得 `Asset`，然后按需调用 `downloadAsync()` |
| 已有资源 URI | `Asset.fromURI()` | 根据 URI 创建 `Asset` |
| 已有完整打包资源元数据 | `Asset.fromMetadata()` | 从底层元数据创建 `Asset` |
| 资源必须随原生应用构建 | config plugin 的 `assets` | 在构建阶段将资源链接到原生工程 |

## 类型定义

### `AssetDescriptor`

资源的基础描述结构：

```ts
type AssetDescriptor = {
  hash?: string | null;
  height?: number | null;
  name: string;
  type: string;
  uri: string;
  width?: number | null;
};
```

其中 `name`、`type` 和 `uri` 必填；哈希及尺寸信息可选。

### `AssetMetadata`

`AssetMetadata` 从 React Native 的 `PackagerAsset` 中选取以下字段：

- `httpServerLocation`
- `name`
- `hash`
- `type`
- `scales`
- `width`
- `height`

并扩展：

```ts
type AdditionalMetadata = {
  fileHashes?: string[];
  fileUris?: string[];
  uri?: string;
};
```

当前文档没有逐项解释这些底层字段，也没有提供手动构造 `AssetMetadata` 的完整示例。

## 容易踩坑的地方

### `require()` 不是普通字符串路径

下面传入的是打包器识别出来的资源模块：

```ts
require('./assets/icon.png')
```

它与下面的普通字符串不是同一种输入：

```ts
'./assets/icon.png'
```

对于动态拼接的本地路径，当前文档没有声明支持：

```ts
require(`./assets/${name}.png`)
```

因此不应根据本文假设这种写法可用。

### 下载完成不代表永久保存

`downloaded === true` 只说明当前 `Asset` 完成过下载，不代表缓存文件永远存在。缓存可能由操作系统或用户清理。

### `localUri` 在下载前可能是 `null`

需要本地文件路径时，应先等待下载完成：

```ts
const asset = Asset.fromModule(require('./assets/data.bin'));
await asset.downloadAsync();

if (asset.localUri) {
  // 将本地 URI 交给其他库
}
```

### `loadAsync()` 始终返回数组

即使只加载一个资源，也需要从数组中取值：

```ts
const [asset] = await Asset.loadAsync(require('./assets/icon.png'));
```

### 修改原生配置后需要重新构建

Config plugin 修改的是原生工程和应用二进制。只刷新 JavaScript、重新加载开发页面或发布普通 JS 更新，不能让新的原生资源配置生效。

### 非标准扩展名可能需要 Metro 配置

Config plugin 支持某种扩展名，不一定意味着 Metro 已经自动将其识别为资源。文档特别提示 `.lottie`、`.riv` 等类型可能需要加入 Metro 的 `assetExts`。

## 实际开发建议

以下内容属于**基于文档内容推导**或**基于经验建议**，不是原文直接给出的完整方案。

### 预加载应用启动所需资源

**基于文档内容推导：**可以在启动流程中使用 `Asset.loadAsync()` 等待关键图片或媒体资源写入本地，再进入依赖这些文件的界面。

应避免无差别预加载全部资源，否则可能增加启动等待时间和缓存占用。

### 对加载失败进行显式处理

**基于经验建议：**使用 `useAssets()` 时同时处理加载、成功和失败状态：

```tsx
const [assets, error] = useAssets([
  require('./assets/illustration.png')
]);

if (error) {
  return <Text>资源加载失败</Text>;
}

if (!assets) {
  return <Text>正在加载资源</Text>;
}

return <Image source={assets[0]} />;
```

### 不要长期保存缓存 URI

**基于文档内容推导：**不要把 `localUri` 当作永久路径写入业务数据库。再次使用时应重新取得 `Asset` 并确认本地资源仍然可用。

### 区分“打包资源”和“用户文件”

**基于经验建议：**

- 应用自带图片、音频、字体等适合交给 Asset 系统管理。
- 用户创建、导入或要求长期保留的文件，应使用专门的文件存储方案。

`expo-asset` 的核心职责是应用资源管理，不是通用的用户文件持久化系统。

## 文档未涉及的内容

当前文档未具体说明：

- 不使用 CNG 时，iOS 和 Android 原生工程的手动配置步骤。
- 资源下载的进度监听、超时和重试机制。
- 远程资源请求的鉴权 Header 配置。
- 缓存容量上限和操作系统具体清理时机。
- 如何把缓存资源迁移到持久目录。
- Metro `assetExts` 的完整配置代码。
- SQLite 数据库导入的具体步骤。
- `AssetMetadata` 各底层字段的详细语义。
- `useAssets()` 的完整导入语句。
- `fromURI()` 支持哪些 URI 协议。

这些问题需要查阅对应版本的 Expo FileSystem、SQLite、Metro 配置或原生工程相关文档，不能仅依据本文作出结论。

## 总结

`expo-asset` 为 Expo 和 React Native 应用提供统一的资源抽象：

- 使用 `require()` 引用随源码维护的静态资源。
- 使用 `Asset` 获取资源元数据。
- 使用 `downloadAsync()` 或 `loadAsync()` 将资源准备到本地缓存。
- 在 React 组件中可使用 `useAssets()` 加载固定资源列表。
- 使用 config plugin 将资源嵌入原生工程，但修改后必须重新构建应用。
- 下载目录属于缓存，不能承担长期持久化职责。
- `uri` 和 `localUri` 含义不同，不能按照 React Web 中普通静态 URL 的思路混用。

---

## 文档导航

- **上一页**：[application](./141__application.md)
- **下一页**：[audio](./143__audio.md)
