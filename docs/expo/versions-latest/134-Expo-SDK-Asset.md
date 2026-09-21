# 134｜Expo SDK Asset 资源文件

**翻页：**[上一页：Expo SDK Application](./133-Expo-SDK-Application.md) · [目录](./README.md) · [下一页：Expo SDK Audio](./135-Expo-SDK-Audio.md)

**官方页面：**[Asset · Latest](https://docs.expo.dev/versions/latest/sdk/asset/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/asset/)

**版本边界：**Latest 推荐 `expo-asset ~57.0.18`；SDK v56.0.0 推荐 `~56.0.24`。两版 `useAssets`、`Asset` 类、Config Plugin 和资源类型说明相同。

## App 中的静态 / 运行时资源

`expo-asset` 提供 Expo 资源系统的接口。**Asset（资源）**是随源码或构建产物提供、App 运行时要使用的文件，例如图片、字体、声音；React Native 的静态资源可通过 `require('./assets/image.png')` 引用，并直接传给 `<Image source={...} />`。

安装：

~~~sh
npx expo install expo-asset
yarn expo install expo-asset
pnpm expo install expo-asset
bun expo install expo-asset
~~~

## 使用 Config Plugin 预打包资源

如果项目使用 Config Plugins / Continuous Native Generation（CNG），`expo-asset` 插件可以把资源文件内嵌到原生项目；这类配置在运行时不能动态修改，变更后需要重新生成 / 构建原生 App。配置示例：

~~~json
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
~~~

`assets` 是项目根目录相对路径的文件或目录数组。插件列出的支持类型包括：

- 图片：`.png`、`.jpg`、`.gif`
- 媒体：`.mp4`、`.mp3`、`.lottie`、`.riv`
- SQLite 数据库：`.db`
- 3D 模型：`.glb`

若配置里内嵌 `.db` 数据库，按 expo-sqlite 资源导入文档操作。`.lottie` / `.riv` 等类型可能还要把扩展名加入 Metro `assetExts`。

如果项目不使用 CNG，需在原生项目里手动配置插件效果；单纯修改 app config 不会自动改手动维护的原生目录。

## Hook：预加载并读取本地资源

`useAssets(moduleIds)` 会下载并本地缓存一个或多个资源，返回 `[assets, error]`：资源尚未载完时 `assets` 为 `undefined`；成功时是 `Asset[]`；加载失败时 `error` 为 `Error`。hook 不会因为之后动态修改 `moduleIds` 而重新加载：

~~~tsx
const [assets, error] = useAssets([
  require('path/to/asset.jpg'),
  require('path/to/other.png'),
]);

return assets ? <Image source={assets[0]} /> : null;
~~~

本地缓存中的 `localUri` 可供原生代码或其他库读取。若要动态刷新资源集合，应改用组件状态和相应的 Asset 方法控制加载。

## `Asset` 类：查询元数据与下载文件

导入：

~~~ts
import { Asset } from 'expo-asset';
~~~

### 属性

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `downloaded` | `boolean`（默认 `false`） | 是否已由 `downloadAsync()` 下载完成。 |
| `hash` | `string \| null`（只读，默认 `null`） | 资源数据的 MD5 哈希值。 |
| `height` | `number \| null`（默认 `null`） | 图片高度除以文件名中的 scale factor；无 `@2x` 等倍率时使用 1。 |
| `localUri` | `string \| null`（默认 `null`） | 下载完成后指向设备缓存目录中资源文件的 `file://` URI。 |
| `name` | `string` | 不含扩展名及 `@2x` 倍率部分的文件名。 |
| `type` | `string`（只读） | 文件扩展名。 |
| `uri` | `string`（只读） | 服务器 / 开发服务器上的资源 URI；在启用现代 Updates 流程时通常不应依赖其网络可访问性。 |
| `width` | `number \| null`（默认 `null`） | 图片宽度除以 scale factor；无倍率时使用 1。 |

### 方法速查

| 方法 | 输入 | 返回 | 说明 |
| --- | --- | --- | --- |
| `downloadAsync()` | 无 | `Promise<Asset>` | 把资源下载到设备缓存目录并返回已更新的 Asset。若已有最新本地文件则复用。 |
| `fromMetadata(meta)` | `AssetMetadata` | `Asset` | 根据打包器元数据创建资源对象。 |
| `fromModule(virtualAssetModule)` | `require(...)` 的结果或网络 URL | `Asset` | 从资源 module / 外部 URL 构造 Asset。 |
| `fromURI(uri)` | `string` URI | `Asset` | 从 URI 创建资源对象。 |
| `loadAsync(moduleId)` | 一个或多个 module / URL | `Promise<Asset[]>` | 对每个资源执行 `fromModule(...).downloadAsync()` 的便捷包装。 |

下载示例从内嵌图标获取缓存文件地址：

~~~ts
const [{ localUri }] = await Asset.loadAsync(require('./assets/snack-icon.png'));
~~~

**缓存文件不保证跨 App 启动保留。** `downloadAsync()` 把文件存在 OS 可随时清理的 cache 目录，文件名类似 `ExponentAsset-{cacheFileId}.{extension}`。若要持久保存，下载后还需要使用 `expo-file-system` 把文件复制到 document 目录。

## 类型速查

### `AssetDescriptor`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `hash` | `string \| null`（可选） | 数据哈希。 |
| `height` | `number \| null`（可选） | 图片高度。 |
| `name` | `string` | 文件名。 |
| `type` | `string` | 扩展名。 |
| `uri` | `string` | 资源 URI。 |
| `width` | `number \| null`（可选） | 图片宽度。 |

### `AssetMetadata`

基于 Metro `PackagerAsset` 元数据的选取子集，保留 `httpServerLocation`、`name`、`hash`、`type`、`scales`、`width`、`height`，并可附带：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `fileHashes` | `string[]`（可选） | 各资源文件哈希。 |
| `fileUris` | `string[]`（可选） | 文件 URI 集合。 |
| `uri` | `string`（可选） | 资源 URI。 |

### 新手术语

- **Metro bundler：**React Native 的打包器；`require('./asset.png')` 会被它分析并记录进资源清单。
- **`require()` 静态资源：**构建时能被 bundler 确认的路径；运行时动态拼接字符串路径通常不能以同样方式打包。
- **Scale factor：**文件名中的 `@2x` / `@3x` 倍率，用于适配不同像素密度屏幕。
- **Local URI：**App sandbox 内本地文件的地址，通常以 `file://` 开头。
- **Cache 与持久目录：**缓存数据可被系统清理；持久 document 文件应用退出后仍需保留。
- **Config Plugin：**生成原生 iOS / Android 工程时修改原生配置的 Expo 插件。

## 源页代码主题覆盖

已覆盖四种安装命令、`expo-asset` config plugin 的资源列表 JSON、`useAssets` 预加载示例、`Asset` 导入及通过 `Asset.loadAsync` 下载并读取 `localUri` 的示例。Asset 方法、属性、`AssetDescriptor` 与 `AssetMetadata` 字段均在正文 / 表格中逐项说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/asset/) · [SDK v56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/asset/)

**翻页：**[上一页：Expo SDK Application](./133-Expo-SDK-Application.md) · [目录](./README.md) · [下一页：Expo SDK Audio](./135-Expo-SDK-Audio.md)
