# Expo Media Library 迁移指南：从旧版函数式 API 到新版面向对象 API

> **原文地址**：[https://docs.expo.dev/guides/sdk-libraries-migration/media-library/](https://docs.expo.dev/guides/sdk-libraries-migration/media-library/)

本文档详细介绍如何将 `expo-media-library` 从旧的**函数式调用方式**迁移到新的**面向对象设计**。新版 API 使用 `Asset`（媒体资源）、`Album`（相册）和 `Query`（查询构建器）三个核心类，已完全可用于生产环境。旧版 API 仍可通过 legacy 子路径访问，但建议尽快迁移到新版以获取持续更新和改进。

**核心变化概述**：

- 不再向独立函数传递配置对象，而是通过**对象实例**（包含原生标识符）进行交互
- 数据获取通过**异步访问器（async getters）** 而非预加载属性
- 搜索采用**链式构建器（fluent builder）** 模式

---

## 安装依赖包

将对应版本的库添加到项目中：

```sh
npx expo install expo-media-library
```

> **初学者提示**：`npx expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本，比手动指定版本号更安全。

---

## 导入模块

将所需的模块引入文件：

```ts
import { Asset, Album, Query } from 'expo-media-library';
```

新版 API 的三个核心类：

| 类名 | 作用 |
|------|------|
| `Asset` | 表示一个媒体资源（照片、视频等），提供创建、查询属性、删除等实例方法 |
| `Album` | 表示一个相册，提供创建、获取资源、添加/移除资源等实例方法 |
| `Query` | 查询构建器，使用链式调用构建搜索条件 |

---

## 媒体资源（Asset）操作

### 从本地文件创建媒体资源

旧版使用 `saveToLibraryAsync` 或 `createAssetAsync` 保存文件到媒体库，新版统一使用 `Asset.create`：

```ts
// 旧版
await MediaLibrary.saveToLibraryAsync(localUri);
// 或者，获取返回的引用：
const asset = await MediaLibrary.createAssetAsync(localUri);

// 新版
const asset = await Asset.create(localUri);
```

**变化说明**：

- 旧版的 `saveToLibraryAsync`（仅保存不返回引用）已被废弃
- 新版统一使用 `Asset.create(localUri)` 方法，既会持久化文件，也会返回一个对象引用

### 搜索媒体资源

旧版通过 `getAssetsAsync` 传入配置对象进行搜索，新版使用 `Query` 链式构建器：

```ts
// 旧版
const { assets } = await MediaLibrary.getAssetsAsync({
  mediaType: MediaLibrary.MediaType.photo,
  first: 20,
  sortBy: [['creationTime', false]],
});

// 新版
const assets = await new Query()
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .limit(20)
  .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
  .exe();
```

**变化说明**：

- 新版使用 `.eq()` 设置筛选条件、`.limit()` 限制数量、`.orderBy()` 设置排序、`.exe()` 执行查询
- 新版直接返回对象数组，**不再包含包装元数据或分页游标**
- 如需分页，可通过组合使用 `.limit()` 和 `.skip()` 方法来实现

### 获取媒体资源属性

旧版通过 `getAssetInfoAsync` 获取一个包含所有属性的信息对象，新版提供两种获取方式：

```ts
// 旧版
const info = await MediaLibrary.getAssetInfoAsync(asset);
console.log(info.filename, info.width, info.height);

// 新版 - 方式一：逐个获取（异步访问器）
const filename = await asset.getFilename();
const width = await asset.getWidth();
const height = await asset.getHeight();
const mediaType = await asset.getMediaType();

// 新版 - 方式二：一次性获取所有属性
const info = await asset.getInfo();
```

**变化说明**：

- 属性不再是预加载的同步变量，而是通过**异步访问器**获取
- 如果只需要个别属性，可以使用对应的 `get` 方法
- 如果需要全部元数据，可以使用 `getInfo()` 一次性获取

### 获取照片 EXIF 元数据

```ts
// 旧版
const info = await MediaLibrary.getAssetInfoAsync(asset);
const exif = info.exif;

// 新版
const exif = await asset.getExif();
```

**变化说明**：新版将 EXIF 数据提取为独立的异步方法，更加语义化。

### 删除媒体资源

```ts
// 旧版
await MediaLibrary.deleteAssetsAsync([asset]);

// 新版 - 删除单个资源
await asset.delete();

// 新版 - 批量删除多个资源
await Asset.delete([asset1, asset2]);
```

**变化说明**：

- 单个资源可直接调用实例方法 `asset.delete()`
- 批量删除使用静态方法 `Asset.delete([...])`，传入资源数组

### 旧版对象与新版系统的互操作

> 理想情况下，建议一次性将整个应用迁移到新版 API。以下工具函数适用于新旧 API 共存的渐进式迁移场景。

当你持有一个旧版对象时，在 iOS 上使用其 URI，在 Android 上通过解析数字标识符来转换：

```ts
import { Asset } from 'expo-media-library';
import * as LegacyMediaLibrary from 'expo-media-library/legacy';
import { Platform } from 'react-native';

async function toNewAsset(legacyAsset: LegacyMediaLibrary.Asset): Promise<Asset> {
  switch (Platform.OS) {
    case 'ios':
      return new Asset(legacyAsset.uri);
    case 'android': {
      const contentUri = await LegacyMediaLibrary.getAssetContentUriAsync(legacyAsset);
      return new Asset(contentUri);
    }
    default:
      throw new Error(`Unsupported platform: ${Platform.OS}`);
  }
}
```

**代码解读**：

- 导入新版 `Asset` 类，同时以别名导入旧版模块 `expo-media-library/legacy`
- iOS 上旧版资产的 URI 可直接传入 `new Asset(uri)` 构造新版对象
- Android 上需要先通过 `getAssetContentUriAsync` 获取 content URI，再构造新版对象

类似地，如果数据库中存储的是旧版标识符（ID），需要在前面加上适当的协议前缀（iOS）或解析数字 ID（Android）后再实例化新版对象：

```ts
async function convertStoredId(legacyId: string): Promise<Asset> {
  switch (Platform.OS) {
    case 'ios':
      return new Asset(`ph://${legacyId}`);
    case 'android': {
      const contentUri = await LegacyMediaLibrary.getAssetContentUriAsync(legacyId);
      return new Asset(contentUri);
    }
    default:
      throw new Error(`Unsupported platform: ${Platform.OS}`);
  }
}
```

**代码解读**：

- iOS 上旧版 ID 需要加上 `ph://` 协议前缀（`ph` 代表 PhotoKit，是 iOS 的照片框架）
- Android 上同样需要先解析为 content URI

---

## 相册（Album）操作

### 按名称获取相册

```ts
// 旧版
const album = await MediaLibrary.getAlbumAsync('MyAlbum');

// 新版
const album = await Album.get('MyAlbum');
if (album) {
  // 找到相册
}
```

**变化说明**：从 `MediaLibrary.getAlbumAsync` 变为 `Album.get`，调用更加简洁直观。

### 获取所有相册

```ts
// 旧版
const albums = await MediaLibrary.getAlbumsAsync();

// 新版
const albums = await Album.getAll();
```

### 创建新相册

```ts
// 旧版
const album = await MediaLibrary.createAlbumAsync('MyNewAlbum', asset, false);

// 新版
const album = await Album.create('MyNewAlbum', [asset]);
```

**变化说明**：

- 旧版第三个参数 `false` 表示如果相册已存在是否报错
- 新版 `Album.create` 接受相册名称和资源数组，语法更清晰

### 列出相册内的媒体资源

```ts
// 旧版
const { assets } = await MediaLibrary.getAssetsAsync({ album: album.id });

// 新版
const assets = await album.getAssets();
```

**变化说明**：新版直接在相册实例上调用 `getAssets()`，无需再通过 album ID 进行关联查询。

### 获取相册名称

```ts
// 旧版 - title 是同步属性，但需要先获取完整的相册对象
const album = await MediaLibrary.getAlbumAsync('MyAlbum');
console.log(album.title);

// 新版
const title = await album.getTitle();
```

**变化说明**：旧版中 `title` 虽然是同步属性，但前提是已经通过异步调用获取了完整的相册对象。新版改为异步访问器 `getTitle()`，设计更一致。

### 向相册中添加资源

```ts
// 旧版
await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);

// 新版
await album.add([asset]);
```

**变化说明**：新版直接在相册实例上调用 `add` 方法，传入资源数组即可。

### 从相册中移除资源（仅 iOS）

```ts
// 旧版
await MediaLibrary.removeAssetsFromAlbumAsync(assets, album);

// 新版
await album.removeAssets(assets);
```

> 此功能仅在 Apple 设备（iOS）上可用。

### 删除相册

```ts
// 旧版
await MediaLibrary.deleteAlbumsAsync([album], false);

// 新版 - 删除单个相册
await album.delete();

// 新版 - 批量删除多个相册
await Album.delete([album1, album2]);
```

**变化说明**：与删除媒体资源的模式一致——单个用实例方法，批量用静态方法。

---

## 权限管理

大多数钩子和工具函数保持原名不变，唯一的修改是移除了权限选择器展示函数的 `Async` 后缀。请求权限、检查权限和基于 Hook 的权限方法保持不变。

```ts
// 旧版
await MediaLibrary.presentPermissionsPickerAsync(mediaTypes);

// 新版
await presentPermissionsPicker(mediaTypes);
```

**变化说明**：`presentPermissionsPicker` 从 `MediaLibrary` 对象的方法变为独立导出的函数，同时移除了 `Async` 后缀。

---

## 监听媒体库变更

```ts
// 旧版
const subscription = MediaLibrary.addListener(event => { ... });
subscription.remove();

// 新版
const subscription = addListener(event => { ... });
subscription.remove();

// 新版 - 一次性移除所有监听器
removeAllListeners();
```

**变化说明**：

- `addListener` 从 `MediaLibrary` 对象的方法变为独立导出的函数
- 事件结构保持不变，但订阅和清理函数现在是独立函数
- 新增了 `removeAllListeners()` 方法，方便一次性清理所有监听器

---

## 核心行为变化总结

以下是新旧版 API 之间的关键行为差异：

| 变化点 | 旧版 | 新版 |
|--------|------|------|
| **属性访问** | 同步变量（预加载） | 异步访问器（async getters）；也可一次性获取全部属性 |
| **异步后缀** | 方法名带 `Async` 后缀 | 全面移除 `Async` 后缀，因为整个包都是异步的 |
| **搜索方式** | 传入配置对象 | 链式构建器（fluent builder），使用 `skip` 和 `limit` 代替游标分页 |
| **修改操作** | 独立函数 + 传入 ID | 实例方法，直接在对象上调用 |
| **保存文件** | `saveToLibraryAsync`（无返回值） | `Asset.create()`，返回对象引用 |
| **废弃功能** | moments 相关工具和相册迁移工具 | 已完全废弃，应移除相关代码 |

> **基于文档内容推导**：迁移时最需要关注的三个核心变化是：(1) 函数式调用变为面向对象调用，(2) 同步属性变为异步访问器，(3) 配置对象变为链式构建器。建议按模块逐步迁移，利用 legacy 子路径实现渐进式迁移。

---

## 文档导航

- **上一页**：[upgrading expo sdk walkthrough](./148__upgrading-expo-sdk-walkthrough.md)
- **下一页**：[calendar](./150__calendar.md)
