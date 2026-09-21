# 186｜Expo SDK MediaLibrary Legacy 旧版图库 API

**翻页：**[上一页：Expo SDK MediaLibrary 系统媒体库](./185-Expo-SDK-MediaLibrary.md) · [目录](./README.md) · [下一页：Expo SDK MeshGradient](./187-Expo-SDK-MeshGradient.md)

**官方页面：**[MediaLibrary (legacy) · Latest](https://docs.expo.dev/versions/latest/sdk/media-library-legacy/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/media-library-legacy/) · [新版对象 API](./185-Expo-SDK-MediaLibrary.md)

**版本与平台：**Latest 推荐 `expo-media-library ~57.0.5`；SDK v56.0.0 推荐 `~56.0.11`。支持 Android、iOS、tvOS 和 Expo Go。本页专门保留旧版 `MediaLibrary` 静态 API；它与新版 `Album` / `Asset` / `Query` API 共存，但新项目优先使用新版，旧版从 `expo-media-library/legacy` 导入。

## 什么时候读 Legacy API

Legacy 兼容层适合迁移历史调用或维护依赖旧方法的功能。导入路径必须是：

```ts
import * as MediaLibrary from 'expo-media-library/legacy';
```

不要从 `expo-media-library` 根路径导入这些旧静态方法：新版文档指出其中多项根导出已弃用并会在运行时抛错。具体的 class API 见上一页。

Android 上广泛访问图库只适合图库管理等核心功能，应用商店对照片 / 视频权限有额外政策要求。Android 13 起还可按照片、视频、音频请求权限；iOS 14+ 和 Android 14+ 支持 limited media access。

## 安装、config plugin 与原生权限

```sh
npx expo install expo-media-library
yarn expo install expo-media-library
pnpm expo install expo-media-library
bun expo install expo-media-library
```

在现有 React Native 工程中要先接入 `expo`。CNG 工程可用 app config 插件声明权限与权限范围：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "允许应用读取你的照片",
          "savePhotosPermission": "允许应用保存照片",
          "isAccessMediaLocationEnabled": true,
          "granularPermissions": ["photo", "audio"]
        }
      ]
    ]
  }
}
```

| 插件属性 | 默认值 / 平台 | 作用 |
| --- | --- | --- |
| `photosPermission` | iOS | `NSPhotoLibraryUsageDescription` 读取图库提示。 |
| `savePhotosPermission` | iOS | `NSPhotoLibraryAddUsageDescription` 仅添加媒体提示。 |
| `preventAutomaticLimitedAccessAlert` | `false`，iOS | 不自动弹有限图库访问提醒；适用于只想使用有限授权范围的应用。 |
| `isAccessMediaLocationEnabled` | `false`，Android | 请求 `ACCESS_MEDIA_LOCATION`，用于读取照片 EXIF 经纬度。 |
| `granularPermissions` | 默认 `['photo', 'video', 'audio']`，Android | 指定 Android manifest 中加入的细粒度媒体权限；运行时请求也要与这里一致。 |

插件通常会自动声明本库所需权限。Android 旧 / 新版本常见权限分别是 `READ_EXTERNAL_STORAGE`、`WRITE_EXTERNAL_STORAGE`、`READ_MEDIA_IMAGES`、`READ_MEDIA_VIDEO`、`READ_MEDIA_AUDIO`；Android 14 的 photo picker 还使用 `READ_MEDIA_VISUAL_USER_SELECTED` 表示用户只选了部分媒体。读取照片 GPS EXIF 时另需 `ACCESS_MEDIA_LOCATION`。iOS 权限用途由下面两条说明字符串描述。

未使用 CNG、手动管理 Android / iOS 原生工程时，按项目实际功能加入原生权限。源码还列了 Android scoped storage 的兼容示例：

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_MEDIA_LOCATION" />

<manifest ...>
  <application android:requestLegacyExternalStorage="true" ...>
  </application>
</manifest>
```

`requestLegacyExternalStorage` 是该旧版文档为 scoped storage 兼容列出的配置；Android R 起访问存储的范围变化。iOS 用途说明：

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>允许应用访问照片</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>允许应用保存照片</string>
```

## 浏览相册并显示媒体

旧 API 的典型组合是先通过 `usePermissions()` 检查 / 请求权限，`getAlbumsAsync()` 读取相册，再针对每个相册调用 `getAssetsAsync({ album })` 并显示其素材：

```tsx
import { useEffect, useState } from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';

export default function GalleryBrowser() {
  const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
  const [permission, requestPermission] = MediaLibrary.usePermissions();

  const loadAlbums = async () => {
    if (permission?.status !== 'granted') {
      const result = await requestPermission();
      if (result.status !== 'granted') return;
    }
    setAlbums(await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true }));
  };

  return (
    <View style={styles.container}>
      <Button title="读取相册" onPress={loadAlbums} />
      <ScrollView>
        {albums?.map(album => <AlbumRow key={album.id} album={album} />)}
      </ScrollView>
    </View>
  );
}

function AlbumRow({ album }: { album: MediaLibrary.Album }) {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    void MediaLibrary.getAssetsAsync({ album }).then(page => setAssets(page.assets));
  }, [album]);

  return (
    <View style={styles.album}>
      <Text>{album.title} · {album.assetCount ?? 0} 项</Text>
      <View style={styles.thumbnails}>
        {assets.map(asset => (
          <Image key={asset.id} source={{ uri: asset.uri }} style={styles.thumbnail} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 8 },
  album: { paddingHorizontal: 20, marginBottom: 12, gap: 4 },
  thumbnails: { flexDirection: 'row', flexWrap: 'wrap' },
  thumbnail: { width: 50, height: 50 },
});
```

`getAlbumsAsync({ includeSmartAlbums: true })` 让 iOS Smart Albums（系统自动分组，例如 Favorites / Moments）也出现在列表里。`getAssetsAsync()` 返回 `PagedInfo`，其中图片数组在 `assets` 字段，翻页游标用 `endCursor` 传回 `after`。

## 权限 Hook、常量与核心方法

### `usePermissions(options?)`

```ts
const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
  writeOnly: true,
  granularPermissions: ['photo'],
});
```

它返回 `[PermissionResponse | null, requestPermission, getPermission]`。`writeOnly` 表示只申请写入、不读图库；`granularPermissions` 仅影响 Android 13+。自定义插件配置时要确保插件声明了代码请求的权限类型。

Legacy 命名空间中 `MediaLibrary.MediaType` 暴露 `audio` / `photo` / `unknown` / `video`；`MediaLibrary.SortBy` 暴露 getAssetsAsync 排序键。主要方法：

| 方法 | 作用与平台差异 |
| --- | --- |
| `getAlbumsAsync({ includeSmartAlbums? })` | 查询用户创建的相册；iOS 可包含 smart albums。 |
| `getAssetsAsync(options?)` | 按过滤、日期、相册、类型和游标分页读取素材。 |
| `createAssetAsync(localUri, album?)` | 从含扩展名的本地 URI 创建 Asset；Android 路径须为 `file:///...`；可直接指定 album。 |
| `saveToLibraryAsync(localUri)` | 把本地图片 / 视频 URI 存图库，不返回 Asset。iOS 11+ 仅添加权限可以不申请读权限。 |
| `createAlbumAsync(name, asset?, copyAsset?, initialAssetLocalUri?)` | 创建相册。Android 必须给素材或本地文件，因为系统不能创建空相册。 |
| `addAssetsToAlbumAsync(assets, album, copy?)` | 添加素材；Android 默认复制，可设 false 移动；复制后查询会看到重复条目。 |
| `removeAssetsFromAlbumAsync(assets, album)` | 从相册移除；Android 空相册会自动删除。 |
| `deleteAlbumsAsync(albums, assetRemove?)` | 批量删相册；Android 默认连相册素材删掉，iOS 默认保留，`assetRemove: true` 时 iOS 也删素材。 |
| `deleteAssetsAsync(assets)` | 删除图库素材；iOS 删除其所属全部 album 中记录并弹确认框；Android 可能保留其 album 副本。 |
| `getAlbumAsync(title)` | 按名称查询相册，不存在返回 `null`。 |
| `getAssetContentUriAsync(asset)` | Android 获取 `content://` URI，可用于转到 class API 的 Asset ID。 |
| `getAssetInfoAsync(asset, options?)` | 查询 EXIF、GPS、本地 URI 等；为性能优先用具体 Asset getter。 |
| `getMomentsAsync()` | iOS 获取按地点 / 时间分组的 Moments。 |
| `getPermissionsAsync(writeOnly?, granularPermissions?)` / `requestPermissionsAsync(...)` | 读取 / 请求权限。 |
| `isAvailableAsync()` | 检查当前设备上媒体库 API 是否可用。 |
| `migrateAlbumIfNeededAsync(album)` | Android R+ 将相册内容迁至 scoped storage 支持目录；不适用时无操作，不兼容内容则 reject。 |
| `presentPermissionsPickerAsync(mediaTypes?)` | Android 14+ / iOS 有限权限素材选择器；只在 limited 授权时显示，不会直接告诉调用方选择变化。 |
| `setAssetFavoriteAsync(asset, isFavorite)` | 旧 iOS 方法，把 Asset 加入 / 移出系统 Favorites 智能相册。 |
| `addListener(callback)` / `removeSubscription(subscription)` / `removeAllListeners()` | 订阅媒体插入 / 删除 / iOS 权限范围变化，移除单个 Subscription 或清除全部监听。 |

## 常见 Legacy 用法

### 保存拍摄文件

```ts
const { uri } = await Camera.takePictureAsync();
const asset = await MediaLibrary.createAssetAsync(uri);
```

Android 11 起移动文件到 album 会要求用户逐次确认。若要将新拍摄文件放进相册，直接把 album 参数传给 `createAssetAsync()`，比先创建再搬运更合适。

### 创建相册和素材

```ts
const album = await MediaLibrary.createAlbumAsync('My Album', asset);
console.log(album.title);

const image = await MediaLibrary.createAssetAsync('file:///storage/emulated/0/DCIM/new-photo.jpg', album);
await MediaLibrary.addAssetsToAlbumAsync([image], album, false); // Android: 移动而非复制
```

Android 不允许空相册，因此传入已有 Asset 或本地文件 URI。若图片来自 Android，`getAssetsAsync()` 默认不解析完整 EXIF，朝向可能不正确；为完整元数据设置 `resolveWithFullInfo: true`。

### 分页查询和排序

```ts
const firstPage = await MediaLibrary.getAssetsAsync({
  album,
  first: 30,
  mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
  sortBy: [[MediaLibrary.SortBy.creationTime, false]],
});

if (firstPage.hasNextPage) {
  const nextPage = await MediaLibrary.getAssetsAsync({
    album,
    first: 30,
    after: firstPage.endCursor,
  });
}
```

`AssetsOptions` 还支持 `createdAfter` / `createdBefore` 日期过滤、iOS `mediaSubtypes` 和 Android `resolveWithFullInfo`。`sortBy` 可传一个键或 `[key, ascending]`；多排序键按数组顺序优先，默认平台排序在前，默认降序。

## 旧 API 的限制

- Android 无法创建空相册，必须放一个既有 Asset 或本地文件 URI。
- Android 11 移动素材到其他相册每次都可能弹确认；优先在创建 Asset 时指定目标 album。
- Android 使用 `getAssetsAsync()` 时，`resolveWithFullInfo` 默认 false，不读取 EXIF 朝向，显示图片可能旋转错误。
- `migrateAlbumIfNeededAsync()` 仅 Android R+ 处理 scoped storage 迁移；只迁移可兼容的文件类型，失败时需用 FileSystem 手动搬迁。iOS / Web / Android R 以下是 no-op。
- `presentPermissionsPickerAsync()` 只在用户原先选择 limited access 时显示；iOS 的 listener 可报告权限选择变化，Android 返回空事件对象。

## 类型参考

### `Album`、`Asset` 与分页结构

| 类型 | 字段 / 平台差异 |
| --- | --- |
| `Album` | `id`、`title`、`assetCount`；iOS Moment 额外含 `approximateLocation`、`locationNames`、`startTime`、`endTime`；iOS `type: 'album' \| 'moment' \| 'smartAlbum'`。 |
| `AlbumsOptions` | `includeSmartAlbums?: boolean`。 |
| `Asset` | `id`、`creationTime`、`modificationTime`、`duration` 秒、`filename`、`height`、`width`、`uri`；Android 可选 `albumId`；iOS 可选 `mediaSubtypes`。URI 通常为 iOS `ph://`、Android `file://`。 |
| `AssetInfo` | 扩展 Asset，增加可选 `exif`、iOS `isFavorite` / `isNetworkAsset` / `orientation`、`localUri`、`location`、iOS Live Photo `pairedVideoAsset`。 |
| `AssetsOptions` | `after` 游标、`album`、`createdAfter` / `createdBefore`、`first` 默认 20、iOS `mediaSubtypes`、`mediaType` 默认 photo、Android `resolveWithFullInfo` 默认 false、`sortBy`。 |
| `PagedInfo<T>` | `assets: T[]`、`endCursor`、`hasNextPage`、`totalCount` 估算值；Android cursor 是结果索引，iOS 是最后 Asset ID。 |
| `MediaLibraryAssetInfoQueryOptions` | iCloud 资源时 `shouldDownloadFromNetwork?: boolean`，默认 true。 |

### 权限、事件和其它类型

| 类型 | 字段 / 含义 |
| --- | --- |
| `EXPermissionResponse` | `canAskAgain`、`expires`、`granted`、`status`。 |
| `PermissionResponse` | 扩展权限响应，含 `accessPrivileges?: 'all' \| 'limited' \| 'none'`；limited 表示只允许所选照片 / 视频（Android 14+ / iOS 14+）。 |
| `GranularPermission` | Android 13+：`'audio' \| 'photo' \| 'video'`。 |
| `PermissionExpiration` | `'never' \| number`；当前权限通常永久有效。 |
| `PermissionHookOptions` | `PermissionHookBehavior \| Options`。 |
| `Location` | `{ latitude: number; longitude: number }`。 |
| `MediaLibraryAssetInfoQueryOptions` | `shouldDownloadFromNetwork?: boolean`，iCloud Asset 的网络下载开关。 |
| `MediaLibraryAssetsChangeEvent` | `hasIncrementalChanges`；变更可增量时有 `insertedAssets`、`deletedAssets`、`updatedAssets`；iOS 内容是 Asset 数组，Android 可为空。 |
| `MediaTypeFilter` | `'photo' \| 'video'`，给 limited picker 过滤素材类别。 |
| `MediaTypeValue` | `'audio' \| 'photo' \| 'video' \| 'unknown' \| 'pairedVideo'`；用于 Asset 的 mediaType / legacy 查询参数。 |
| `Subscription` | `remove(): void`，取消事件监听。 |

### 常量枚举

| 常量 | 取值 |
| --- | --- |
| `MediaLibrary.MediaType` | `audio`、`photo`、`unknown`、`video`。 |
| `MediaSubtype`（iOS） | `depthEffect`、`hdr`、`highFrameRate`、`livePhoto`、`panorama`、`screenshot`、`stream`、`timelapse`、`spatialMedia`、`videoCinematic`。 |
| `SortByKey` | `default`、`mediaType`、`width`、`height`、`creationTime`、`modificationTime`、`duration`。 |
| `SortByObject` / `MediaLibrary.SortBy` | 同名属性映射到排序键字符串。 |
| `SortByValue` | `SortByKey`，或 `[SortByKey, boolean]`；布尔值指定升序。 |
| `PermissionStatus` | `DENIED='denied'`、`GRANTED='granted'`、`UNDETERMINED='undetermined'`。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-media-library ~57.0.5`；SDK v56.0.0 推荐 `~56.0.11`。
- 两版同为 `expo-media-library/legacy` 导入路径；配置插件、Hook、静态函数、AssetsOptions、limited access、事件及枚举字段相同。
- 两版 Next 均是 Expo SDK MeshGradient。

## 源页代码主题覆盖

- Installation / Config：覆盖四种包管理器安装命令、config plugin JSON 的五个配置项、手动 Android Manifest scoped-storage / EXIF 权限片段、iOS 两个 Info.plist 权限键。
- Fetch albums：改写源页完整 Album 列表 / Smart Albums / 对每个相册读取素材并用 Image 网格展示的 React Native 示例。
- Permission Hook：覆盖 `usePermissions({ writeOnly, granularPermissions })` 返回值和代码形态。
- Legacy methods：覆盖 Camera URI 建 Asset、相册创建 / 移动 / 复制、分页 query / 排序、权限 picker、权限状态与 media change listener 代码主题。
- Known limitations：列出 Android 空相册、移动素材确认、EXIF 图片朝向和 Android R scoped-storage 迁移边界。
- Types / Enums：完整列出 Album / Asset / AssetInfo / AssetsOptions / PagedInfo / Permissions / events / filter / sort / media types 与权限枚举。
- 源页方法中的单条代码示例按 CRUD、Album 查询 / 删除、Asset 查询 / 收藏、分页查询类别合并为等价示例，所有方法名和平台差异在表中保留。

**翻页：**[上一页：Expo SDK MediaLibrary 系统媒体库](./185-Expo-SDK-MediaLibrary.md) · [目录](./README.md) · [下一页：Expo SDK MeshGradient](./187-Expo-SDK-MeshGradient.md)
