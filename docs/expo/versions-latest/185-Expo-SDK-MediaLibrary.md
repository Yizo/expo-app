# 185｜Expo SDK MediaLibrary 系统媒体库

**翻页：**[上一页：Expo SDK Maps 原生地图](./184-Expo-SDK-Maps.md) · [目录](./README.md) · [下一页：Expo SDK MediaLibrary legacy](./186-Expo-SDK-MediaLibrary-Legacy.md)

**官方页面：**[MediaLibrary · Latest](https://docs.expo.dev/versions/latest/sdk/media-library/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/media-library/)

**版本与平台：**Latest 推荐 `expo-media-library ~57.0.5`；SDK v56.0.0 推荐 `~56.0.11`。支持 Android、iOS、tvOS 和 Expo Go。Android 广泛读取用户媒体需是应用的核心功能，并要遵循官方页面链接的 Google Play 照片 / 视频权限政策。

## 这个模块管理什么

`expo-media-library` 读写系统媒体库中的照片、视频和音频：查询既有素材、创建 `Asset`、组织 `Album`、读取文件元数据、保存新媒体、订阅媒体变化。用户授权后应用才可以访问对应范围。

当前参考页介绍两层 API：

- **对象 API：**`Asset`、`Album` 和链式 `Query` 类，是主参考中的新式调用方式。
- **旧静态 API：**`MediaLibrary.getAssetsAsync()` 等历史函数仍在迁移章节出现；许多主入口导出已弃用且会在运行时抛错。维护旧项目时按需从 `expo-media-library/legacy` 导入；新代码优先使用对象 API。

Android 13+ 可按照片、视频、音频分别请求权限。iOS 14+ 和 Android 14+ 可能只授予用户挑选的部分媒体（limited）。权限结果的 `accessPrivileges` 能区分全部、部分或无权限。

## 安装

```sh
npx expo install expo-media-library
yarn expo install expo-media-library
pnpm expo install expo-media-library
bun expo install expo-media-library
```

现有 React Native 工程还需接入 `expo`。源页示例额外依赖 `expo-image` 和新版 FileSystem；若项目尚未安装，可用 `npx expo install expo-image expo-file-system`。

## 下载文件并存入媒体库

`Asset.create(localFileUri)` 把本地文件加入系统媒体库并返回 `Asset`。因此先把网络图片下载到应用缓存目录，再请求写入权限；只有缓存文件存在时才创建媒体项。

```tsx
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { File, Paths } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';

export function SaveDownloadedImage() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [message, setMessage] = useState('正在下载…');

  useEffect(() => {
    const saveImage = async () => {
      const destination = new File(Paths.cache, 'sample-photo.jpg');
      const file = destination.exists
        ? destination
        : await File.downloadFileAsync('https://picsum.photos/200/300', destination);

      const permission = await requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setMessage('没有媒体库写入权限');
        return;
      }

      const created = await Asset.create(file.uri);
      setAsset(created);
      setMessage('已保存');
    };

    void saveImage().catch(error => setMessage(String(error)));
  }, []);

  return (
    <View>
      <Text>{message}</Text>
      {asset && (
        <>
          <Text>Asset ID: {asset.id}</Text>
          <Image source={{ uri: asset.id }} style={{ width: 200, height: 300 }} />
        </>
      )}
    </View>
  );
}
```

`Asset.id` 是系统媒体库标识，不一定是普通文件路径：Android 是 content URI，iOS 是 PHAsset local identifier URI。渲染可把这个 id 作为图片资源 URI 使用；若要读取其他属性，调用 `Asset` getters。

## 查询素材和元数据

`Query` 使用链式筛选，最后用 `.exe()` 取完整 `Asset[]`，或 `.exeForMetadata()` 只取轻量字段。后者不解析文件路径、不解码文件，适合列表先加载；需要 URI 或 EXIF 等较重字段时再用 `Asset` 对象。

```ts
import { AssetField, MediaType, Query } from 'expo-media-library';

const images = await new Query()
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .lte(AssetField.HEIGHT, 1080)
  .orderBy(AssetField.CREATION_TIME)
  .limit(20)
  .exe();

const lightweightRows = await new Query()
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .lte(AssetField.HEIGHT, 1080)
  .orderBy(AssetField.CREATION_TIME)
  .limit(20)
  .exeForMetadata();
```

媒体属性示例代码读取 `id`、文件名、media type、宽高和创建 / 修改时间：

```ts
const [asset] = await new Query()
  .limit(1)
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .exe();

if (asset) {
  const details = {
    id: asset.id,
    filename: await asset.getFilename(),
    mediaType: await asset.getMediaType(),
    width: await asset.getWidth(),
    height: await asset.getHeight(),
    createdAt: await asset.getCreationTime(),
    updatedAt: await asset.getModificationTime(),
  };
  console.log(details);
}
```

时间 getter 返回 Unix epoch 毫秒或 `null`，可用 `new Date(milliseconds).toLocaleString()` 显示；媒体库可能没有时间值。

## 创建和管理相册

`Album.create(title, assets?)` 创建新相册，可同时加入素材；Android `moveAssets` 默认 true，会把素材移入该相册，设 false 或平台不支持移动时会复制。可读取标题与素材列表。

```tsx
import { useState } from 'react';
import { Button, FlatList, Image, Text, View } from 'react-native';
import { Album, AssetField, MediaType, Query, requestPermissionsAsync } from 'expo-media-library';

export function CreatePhotoAlbum() {
  const [album, setAlbum] = useState<Album | null>(null);
  const [title, setTitle] = useState('');
  const [assets, setAssets] = useState<Awaited<ReturnType<Album['getAssets']>>>([]);

  const createAlbum = async () => {
    const permission = await requestPermissionsAsync();
    if (permission.status !== 'granted') return;

    const [photo] = await new Query()
      .limit(1)
      .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
      .exe();
    if (!photo) return;

    const created = await Album.create('Favorite Samples', [photo]);
    setAlbum(created);
    setTitle(await created.getTitle());
    setAssets(await created.getAssets());
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="创建相册并加入一张图片" onPress={createAlbum} />
      <Text>{album ? `相册：${title}` : '尚未创建相册'}</Text>
      <FlatList
        data={assets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.id }} style={{ width: 100, height: 100, marginVertical: 8 }} />
        )}
      />
    </View>
  );
}
```

`Album` 实例可添加素材、读取素材、读取标题、删除相册。iOS `album.removeAssets()` 只把素材移出相册，不会从整个图库删除；Android 的一个 asset 通常只属于一个 album，不能单独移出，可删掉或加入其他相册。删除 album 的系统差异要谨慎：Android 删除相册会连素材一起删除；iOS 默认保留图库素材，静态 `Album.delete(albums, deleteAssets)` 的 `deleteAssets` 默认 false。

```ts
const album = await Album.get('Camera'); // 找不到时为 null
const allAlbums = await Album.getAll();

if (album) {
  const existingAssets = await album.getAssets();
  await album.add(newAsset);
  await album.add([firstAsset, secondAsset]);
  await album.removeAssets(existingAssets.slice(0, 2)); // 仅 iOS
  console.log(await album.getTitle());
}

await Album.delete(allAlbums, false);
// 删除单个相册可调用：await album.delete();
```

Album 标题不保证唯一。`Album.delete(albums, false)` 在 iOS 保留素材；Android 删除 album 时素材会随之删除，不受 `deleteAssets` 参数影响。

## Asset 对象操作与媒体变化

`Asset` 可以从本地文件创建、读取属性、删除、管理收藏，也可取得它属于的 album。如下代码覆盖源页展示的 create / delete / favorite / subscriptions 主题：

```ts
import { Asset, MediaLibrary, requestPermissionsAsync } from 'expo-media-library';

const permission = await requestPermissionsAsync();
if (permission.status === 'granted') {
  const newAsset = await Asset.create('file:///path/to/report-photo.jpg');
  await newAsset.setFavorite(true);

  const favorite = await newAsset.getFavorite();
  const relatedAlbums = await newAsset.getAlbums();
  const fullInfo = await newAsset.getInfo();
  console.log(favorite, relatedAlbums.length, fullInfo.filename);

  // 删除一个对象或一组对象：
  await newAsset.delete();
  await Asset.delete([anotherAsset]);
}

const subscription = MediaLibrary.addListener(event => {
  if (!event.hasIncrementalChanges) {
    console.log('图库变化范围较大，需重新加载列表');
    return;
  }
  console.log(event.insertedAssets, event.deletedAssets, event.updatedAssets);
});
subscription.remove();
```

Android 10+ 可更新 MediaStore 收藏字段，旧版设置收藏会 no-op；第三方图库可能维护自己的收藏状态。Android 读取图片 EXIF / 位置信息需要 `ACCESS_MEDIA_LOCATION`。iOS 可查素材是否仅存 iCloud、提取 Live Photo 配对视频、读取 media subtypes / orientation。方法细节见下表。

## 权限与有限媒体范围

Hook 版和 Promise 方法都可查询 / 请求访问权限：

```tsx
import * as MediaLibrary from 'expo-media-library';

const [permission, requestPermission, getPermission] = MediaLibrary.usePermissions({
  writeOnly: false,
  granularPermissions: ['photo', 'video'],
});
```

`writeOnly` 默认为 false；Android 13+ 的 `granularPermissions` 可为 `'audio'`、`'photo'`、`'video'`，默认请求所有可用类别。若用 config plugin 自定义 Android 权限，必须包含代码请求的类别。Android 批量读取照片 / 视频权限只适合核心功能确实需要广泛访问媒体的应用。

| API | 返回 / 用途 |
| --- | --- |
| `usePermissions(options?)` | `[PermissionResponse \| null, requestPermission, getPermission]`。 |
| `getPermissionsAsync(writeOnly?, granularPermissions?)` | 查询当前权限。 |
| `requestPermissionsAsync(writeOnly?, granularPermissions?)` | 请求用户授权。 |
| `presentPermissionsPicker(mediaTypes?)` | Android 14+ / iOS 仅当用户原先只授予 limited 权限时显示系统选择器，可限制 `'photo'` / `'video'`。它本身不告知用户改选了哪些素材；iOS 需监听图库更新。 |

## 查询 API

`Query` 每个筛选 / 排序 / 分页方法都返回更新后的 Query，最后调用 execute 方法。

| 方法 | 用途 |
| --- | --- |
| `album(album)` | 只查询相册内素材。 |
| `eq(field, value)` | 字段等于指定值；值类型随 AssetField 确定。 |
| `gt(field, value)` / `gte(field, value)` | 数值字段大于 / 大于等于。 |
| `lt(field, value)` / `lte(field, value)` | 数值字段小于 / 小于等于。 |
| `within(field, values)` | 字段值匹配给定数组之一。 |
| `orderBy(fieldOrDescriptor)` | 排序；直接传 AssetField 默认升序，也可传 `{ key, ascending? }`。 |
| `limit(n)` / `offset(n)` | 限制最多返回数 / 跳过前 n 条。 |
| `exe()` | `Promise<Asset[]>`，返回完整 Asset 对象。 |
| `exeForMetadata()` | `Promise<AssetMetadata[]>`，读取轻量字段，不解析路径或解码文件。 |

## Album 与 Asset 方法

### `Album`

| 方法 | 行为与平台差异 |
| --- | --- |
| `Album.create(name, assetsRefs?, moveAssets?)` | 静态创建 album；Android 素材默认移入新 album，无法移动或设置 false 时复制。 |
| `Album.get(title)` / `Album.getAll()` | 按名称读取一个 album（可能 null）/ 读取全部。标题不保证唯一。 |
| `album.add(assetOrAssets)` | 向相册增加一个或一组 `Asset`。 |
| `album.delete()` | 删除一个 album；Android 连素材一起删除，iOS 保留图库素材。 |
| `Album.delete(albums, deleteAssets?)` | 静态批量删除；iOS `deleteAssets` 默认 false；Android 会连素材一起删除。 |
| `album.getAssets()` / `album.getTitle()` | 读取相册内素材 / 显示标题。 |
| `album.removeAssets(assets)` | iOS-only：从 album 移除但保留在库中；Android 一个 asset 通常只属一个 album。 |

### `Asset`

| 方法 | 返回 / 含义 |
| --- | --- |
| `Asset.create(filePath, album?)` | `Promise<Asset>`；从本地 `file://` 文件导入；Android 未传 album 时加入 Pictures 默认目录。 |
| `asset.delete()` / `Asset.delete(assets)` | 删除单个或批量素材，返回完成 Promise。 |
| `asset.getAlbums()` | 所属相册数组；Android 通常一个，iOS 可以多个。 |
| `asset.getCreationTime()` / `getModificationTime()` | Unix 毫秒时间戳或 `null`。 |
| `asset.getDuration()` | 音视频时长毫秒；其他类型返回 null。 |
| `asset.getExif()` | 图片 EXIF；Android 读取位置信息需 `ACCESS_MEDIA_LOCATION`；无数据时空对象。 |
| `asset.getFavorite()` / `asset.setFavorite(boolean)` | 读写收藏。Android 10+ 使用 MediaStore 收藏位，旧 Android 返回 false / no-op。 |
| `asset.getFilename()` | 文件名（含扩展名）。 |
| `asset.getHeight()` / `getWidth()` | 图片或视频像素尺寸。 |
| `asset.getInfo()` | `Promise<AssetInfo>`，取得较完整元信息。 |
| `asset.getIsInCloud()` | iOS-only：是否仅在 iCloud；此检查不会下载文件。 |
| `asset.getLivePhotoVideoUri()` | iOS-only：取 Live Photo 配对视频临时文件 URI；不是 Live Photo 时返回 null。 |
| `asset.getLocation()` | 获取素材位置或 null；Android 需 `ACCESS_MEDIA_LOCATION`。 |
| `asset.getMediaSubtypes()` | iOS-only：Live Photo、全景、HDR 等子类型数组。 |
| `asset.getMediaType()` | image / video / audio / unknown 枚举。 |
| `asset.getOrientation()` | iOS image-only EXIF 方向 1–8 或 null。 |
| `asset.getShape()` | 宽高对象；任一维缺失时为 null。 |
| `asset.getUri()` | 媒体文件 URI。 |

## 旧静态 API 与兼容边界

主参考在 `MediaLibrary` 静态方法章节标注多项 API 已弃用；在根模块导入时可能直接 runtime throw。新代码按“Album / Asset / Query 方法”迁移；若维护依赖旧签名的代码，页面建议从 `expo-media-library/legacy` 导入。

该章节仍列出的旧函数名包括：`addAssetsToAlbumAsync`、`albumNeedsMigrationAsync`、`createAlbumAsync`、`createAssetAsync`、`deleteAlbumsAsync`、`deleteAssetsAsync`、`getAlbumAsync`、`getAlbumsAsync`、`getAssetContentUriAsync`、`getAssetInfoAsync`、`getAssetsAsync`、`getMomentsAsync`、`isAvailableAsync`、`migrateAlbumIfNeededAsync`、`presentPermissionsPickerAsync`、`removeAssetsFromAlbumAsync`、`removeSubscription`、`saveToLibraryAsync`、`setAssetFavoriteAsync`。本页当前权限访问仍用 `getPermissionsAsync()` / `requestPermissionsAsync()`；`presentPermissionsPicker()` 为非 Async 新方法。

## 类型与枚举

### Asset / Query 类型

| 类型 | 字段 / 说明 |
| --- | --- |
| `AssetField` | `CREATION_TIME='creationTime'`、`DURATION='duration'`、`HEIGHT='height'`、`IS_FAVORITE='isFavorite'`、`MEDIA_TYPE='mediaType'`、`MODIFICATION_TIME='modificationTime'`、`WIDTH='width'`。 |
| `AssetFieldValueMap` | 将 creation / modification time、duration、height、width 对应 number；favorite 对应 boolean；mediaType 对应 `MediaType`。 |
| `AssetInfo` | `creationTime` / `duration` / `modificationTime` 可 null；`filename`、`id`、`uri` string；`height` / `width` number；`isFavorite` boolean；`mediaType` enum。 |
| `AssetMetadata` | 轻量列表字段；`creationTime`、`duration`、`filename`、`height`、`modificationTime`、`width` 可 null；`id` string、favorite boolean、mediaType enum。Android 宽高未入库时可 null。 |
| `SortDescriptor` | `{ key: AssetField; ascending?: boolean }`。 |
| `Shape` | `{ width: number; height: number }`。 |

### 其它结构

| 类型 | 字段 / 平台差异 |
| --- | --- |
| `EXPermissionResponse` | `canAskAgain`、`expires`、`granted`、`status`。 |
| `PermissionResponse` | 继承权限响应，并有 `accessPrivileges?: 'all' \| 'limited' \| 'none'`；`limited` 表示只选了部分媒体，在 Android 14+ / iOS 14+ 可用。 |
| `GranularPermission` | `'audio' \| 'photo' \| 'video'`。 |
| `PermissionExpiration` | `'never' \| number`；当前系统权限通常永久授予。 |
| `PermissionHookOptions` | `PermissionHookBehavior \| Options`。 |
| `Location` | `{ latitude: number; longitude: number }`。 |
| `MediaTypeFilter` | `'photo' \| 'video'`，供权限 picker 筛选。 |
| `MediaLibraryAssetsChangeEvent` | `hasIncrementalChanges: boolean`；iOS 可附 `insertedAssets` / `deletedAssets` / `updatedAssets` 的 `ph://` ID 列表。Android 通常给空对象，且 incremental 为 false；false 时应完整重载素材列表。 |
| `EventSubscription` | `remove(): void` 用于停止事件监听。 |

### `MediaSubtype` / `MediaType` / `PermissionStatus`

| 枚举 | 成员和值 |
| --- | --- |
| `MediaSubtype`（iOS） | `DEPTH_EFFECT='depthEffect'`、`HDR='hdr'`、`HIGH_FRAME_RATE='highFrameRate'`、`LIVE_PHOTO='livePhoto'`、`PANORAMA='panorama'`、`SCREENSHOT='screenshot'`、`SPATIAL_MEDIA='spatialMedia'`、`STREAM='stream'`、`TIME_LAPSE='timelapse'`、`VIDEO_CINEMATIC='videoCinematic'`。 |
| `MediaType` | `AUDIO='audio'`、`IMAGE='image'`、`UNKNOWN='unknown'`、`VIDEO='video'`。 |
| `PermissionStatus` | `DENIED='denied'`、`GRANTED='granted'`、`UNDETERMINED='undetermined'`。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-media-library ~57.0.5`；SDK v56.0.0 推荐 `~56.0.11`。
- 两版都提供 Asset / Album / Query 对象模型、查询过滤、权限粒度、limited library picker，以及弃用的 `MediaLibrary` 静态 API 迁移章节；页面主体代码主题一致。
- Android 13+ granular permissions、Android 14+ limited media picker、iOS limited library / 媒体变化回调的字段与平台边界一致。
- 两版页脚 Next 均为 Expo SDK MediaLibrary (legacy)。

## 源页代码主题覆盖

- Installation：列出四种 `expo-media-library` 安装命令和现有 RN 工程需要 Expo。
- Usage 示例 1：改写从 Web 下载到 FileSystem cache、检查写权限、`Asset.create()` 保存、展示 Asset ID / 图片的流程。
- Usage 示例 2：改写用 `Query` 查找图片，再通过 getters 读取 id、文件名、类型、尺寸、创建 / 修改时间并格式化显示。
- Usage 示例 3：改写请求权限、查询首张图片、创建 Album、读取标题与素材、通过 `FlatList` 显示内容的流程。
- Permission hook：保留 `writeOnly` / `granularPermissions` Hook 示例，另覆盖 limited permission picker 与事件更新。
- Class / Query 示例：逐类覆盖 Album / Asset 的新增、查询、收藏、删除、移入 / 移出、相册创建和查询过滤；完整方法名与平台差异列在表中。
- Deprecated static API：列全主参考中的旧静态函数名，并说明 legacy 子路径 / 运行时抛错边界。
- Types / Enums：覆盖 Asset / Metadata / Permission / ChangeEvent 字段、排序字段、MediaSubtype、MediaType 与权限枚举。
- 源页中的 getter / CRUD 短示例按操作类别改写到上述代码块与方法表中；平台特有的迁移 / 删除语义另行标出。

**翻页：**[上一页：Expo SDK Maps 原生地图](./184-Expo-SDK-Maps.md) · [目录](./README.md) · [下一页：Expo SDK MediaLibrary legacy](./186-Expo-SDK-MediaLibrary-Legacy.md)
