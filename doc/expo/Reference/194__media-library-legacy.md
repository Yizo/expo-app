# Expo MediaLibrary（Legacy）学习指南

> 文档更新时间：2026 年 6 月 2 日  
> 适用平台：Android、iOS、tvOS、Expo Go  
> 包名：`expo-media-library`

> **版本提示**：原文属于下一个 Expo SDK 版本的文档。当前最新稳定版本为 SDK 56，应注意不同 SDK 版本之间可能存在 API 或权限行为差异。

## 文档解决的问题

`expo-media-library` 用于访问设备的系统媒体库，使应用能够：

- 查询用户已有的照片、视频和音频。
- 查询及管理系统相册。
- 将应用生成的图片或视频保存到媒体库。
- 创建、删除或迁移相册。
- 删除、移动或复制媒体资源。
- 读取资源的 EXIF、GPS、尺寸等信息。
- 监听媒体库及授权范围的变化。

本文介绍的是 **Legacy API**。它仍包含在 `expo-media-library` 包中，但必须从下面的子路径导入：

```ts
import * as MediaLibrary from 'expo-media-library/legacy';
```

基于类的新版 API 则从包的根路径导入。两套 API 可以在同一个项目中并存。

## 适用场景

这套 API 适合以下需求：

- 保存相机拍摄的照片或视频。
- 展示用户设备中的照片、视频或音频。
- 实现相册选择器或媒体管理页面。
- 按时间、类型、相册等条件分页查询媒体。
- 读取照片拍摄位置和 EXIF 信息。
- 监听用户新增、删除或更新媒体文件。
- 管理 Android 旧相册在分区存储机制下的迁移。

如果应用只需要用户临时选择少量照片，而不需要广泛浏览或管理整个媒体库，应重新评估是否确实需要完整媒体库权限。原文特别指出，Google Play 只允许确实需要广泛照片访问能力的应用申请 Android 完整媒体库权限。

## React Web 开发者需要先理解的概念

### 系统媒体库不是应用自己的文件目录

在 Web 中，应用通常通过 `<input type="file">` 获得用户主动选择的文件，无法任意浏览用户设备上的全部照片。

移动端的“媒体库”是操作系统统一管理的照片、视频和音频集合。应用需要：

1. 在原生工程中声明可能使用的权限。
2. 在运行时向用户请求授权。
3. 只能在用户授予的范围内查询或修改媒体。

因此，安装 npm 包本身并不足以获得访问能力。

### Asset 与 Album

- `Asset`：一项媒体资源，例如照片、视频或音频。
- `Album`：相册，即媒体资源的分组。

`Asset.id` 是媒体库内部标识；`Asset.uri` 是操作系统提供的资源 URI。它不一定是普通文件路径：

- iOS 通常为 `ph://...`
- Android 通常为 `file://...`

不能按照 Web URL 的思路假设所有 URI 都可以直接上传、拼接或转换为磁盘路径。需要本地文件时，应使用 `getAssetInfoAsync()` 获取 `localUri`，同时考虑 iCloud 资源可能尚未下载到设备。

### Manifest 与 Info.plist

它们相当于移动应用构建阶段的系统级配置：

- Android 使用 `AndroidManifest.xml` 声明权限和组件能力。
- iOS 使用 `Info.plist` 配置权限用途说明等信息。

这些配置会编译进应用二进制，不能像 React 状态或远程配置一样在运行时动态改变。修改后通常需要重新构建应用。

### Config Plugin 与 CNG

Expo config plugin 可以根据 `app.json` 或 `app.config.*` 自动修改原生工程配置。

CNG（Continuous Native Generation）表示 Expo 根据应用配置持续生成或更新 `android`、`ios` 原生工程。使用 CNG 时，通常通过 config plugin 管理原生配置；不使用 CNG、手动维护原生工程时，则要直接编辑 Manifest 和 Info.plist。

### 分区存储

Android 10 开始引入 scoped storage（分区存储），Android 11 进一步限制应用随意写入公共存储目录。

这会影响旧版本应用创建的相册目录：应用可能仍能读取其中的资源，却失去继续写入该目录的权限。`albumNeedsMigrationAsync()` 和 `migrateAlbumIfNeededAsync()` 就是为此提供的兼容能力。

## 安装与导入

### 安装依赖

根据项目使用的包管理器选择一个命令：

```sh
# npm
npx expo install expo-media-library

# yarn
yarn expo install expo-media-library

# pnpm
pnpm expo install expo-media-library

# bun
bun expo install expo-media-library
```

`expo install` 会根据当前 Expo SDK 选择兼容版本，这与直接安装任意最新版 npm 包不同。

在已有的裸 React Native 项目中使用时，必须先安装并配置 Expo Modules 所需的 `expo` 包。

### 导入 Legacy API

```ts
import * as MediaLibrary from 'expo-media-library/legacy';
```

不要误写成：

```ts
import * as MediaLibrary from 'expo-media-library';
```

后者导入的是包根路径暴露的基于类的 API，而不是本文描述的 Legacy API。

## 构建阶段配置

### 使用 Config Plugin

```json
{
  "expo": {
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
          "isAccessMediaLocationEnabled": true,
          "granularPermissions": ["audio", "photo"]
        }
      ]
    ]
  }
}
```

各配置项含义如下：

| 配置项 | 平台 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `photosPermission` | iOS | `"Allow $(PRODUCT_NAME) to access your photos."` | 设置 `NSPhotoLibraryUsageDescription`，说明为什么需要读取照片库 |
| `savePhotosPermission` | iOS | `"Allow $(PRODUCT_NAME) to save photos."` | 设置 `NSPhotoLibraryAddUsageDescription`，说明为什么需要向照片库写入内容 |
| `preventAutomaticLimitedAccessAlert` | iOS | `false` | 阻止系统自动显示“有限照片访问”提示，适合由应用自行管理有限授权体验 |
| `isAccessMediaLocationEnabled` | Android | `false` | 是否声明 `ACCESS_MEDIA_LOCATION`，用于读取媒体中的位置数据 |
| `granularPermissions` | Android | `["photo", "video", "audio"]` | 决定 Manifest 中包含哪些 Android 细粒度媒体读取权限 |

`$(PRODUCT_NAME)` 会在 iOS 构建时替换为应用名称。

配置中的 `granularPermissions` 必须覆盖运行时可能请求的权限。例如，运行时请求 `video`，但插件配置只包含 `photo`，原生 Manifest 中可能没有相应权限声明。

修改这些配置后，需要重新构建应用，刷新 JavaScript 页面不能使其生效。

### 手动维护 Android 工程

如果项目不使用 CNG，需要直接配置：

```text
android/app/src/main/AndroidManifest.xml
```

读取照片 EXIF 中的经纬度需要：

```xml
<uses-permission android:name="android.permission.ACCESS_MEDIA_LOCATION" />
```

原文还要求为 Android 10 的分区存储兼容添加：

```xml
<manifest ...>
  <application android:requestLegacyExternalStorage="true" ...>
</manifest>
```

这属于原生构建配置，不是 JavaScript API 参数。

### 手动维护 iOS 工程

编辑：

```text
ios/[app]/Info.plist
```

加入：

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Give $(PRODUCT_NAME) permission to access your photos</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Give $(PRODUCT_NAME) permission to save photos</string>
```

前者用于读取媒体库，后者用于仅添加媒体。文案会直接显示给用户，应清楚说明应用为什么需要权限。

## 权限模型

### 检查和请求权限

React 组件中可以使用 Hook：

```ts
const [permissionResponse, requestPermission, getPermission] =
  MediaLibrary.usePermissions();
```

它在内部结合了：

- `getPermissionsAsync()`：检查当前权限。
- `requestPermissionsAsync()`：触发系统授权流程。

也可以直接调用：

```ts
const current = await MediaLibrary.getPermissionsAsync(
  false,
  ['photo', 'video']
);

const result = await MediaLibrary.requestPermissionsAsync(
  false,
  ['photo', 'video']
);
```

参数含义：

- `writeOnly`：是否只申请写入权限，默认为 `false`。
- `granularPermissions`：要访问的媒体类别，仅在 Android 13 及以上生效；不传时默认请求所有可能权限。

### 权限状态

`PermissionResponse` 主要包含：

| 字段 | 含义 |
| --- | --- |
| `status` | `granted`、`denied` 或 `undetermined` |
| `granted` | 是否已获得权限的便捷布尔值 |
| `canAskAgain` | 是否还能再次弹出系统授权请求 |
| `expires` | 权限过期时间；当前权限均为永久授权 |
| `accessPrivileges` | 可访问全部、部分还是无媒体资源 |

`accessPrivileges` 可能为：

- `all`：可访问整个媒体库。
- `limited`：只能访问用户选中的资源。
- `none`：未授权或已拒绝。

当 `canAskAgain` 为 `false` 时，继续调用请求权限 API 通常无法解决问题，需要引导用户进入系统设置修改权限。

### 更新有限访问范围

Android 14+ 和 iOS 支持：

```ts
await MediaLibrary.presentPermissionsPickerAsync(['photo', 'video']);
```

只有用户原本授予 `limited` 权限时才会显示系统选择界面，否则不会执行操作。

该方法不会通过返回值告知用户是否改变了可访问资源。iOS 上需要监听媒体库事件；如果事件中的 `hasIncrementalChanges` 为 `false`，应重新加载完整资源列表。

## 查询相册和媒体资源

### 查询相册

```ts
const albums = await MediaLibrary.getAlbumsAsync({
  includeSmartAlbums: true,
});
```

`includeSmartAlbums` 控制是否包含系统智能相册。

按名称查找单个相册：

```ts
const album = await MediaLibrary.getAlbumAsync('Screenshots');
```

不存在时返回 `null`。

iOS 还支持 `getMomentsAsync()`，用于获取按相近时间和地点分组的“时刻”。该 API 返回类型较宽泛，原文标记为 `Promise<any>`。

### 分页查询资源

```ts
const page = await MediaLibrary.getAssetsAsync({
  album,
  first: 50,
  mediaType: ['photo', 'video'],
  sortBy: [[MediaLibrary.SortBy.creationTime, false]],
});
```

返回的 `PagedInfo` 包含：

| 字段 | 含义 |
| --- | --- |
| `assets` | 当前页资源 |
| `endCursor` | 下一页起点 |
| `hasNextPage` | 是否还有下一页 |
| `totalCount` | 符合条件的资源估算总数 |

加载下一页时：

```ts
const nextPage = await MediaLibrary.getAssetsAsync({
  first: 50,
  after: page.endCursor,
});
```

这与常见 GraphQL Cursor Pagination 类似，但 `endCursor` 的底层含义有平台差异：

- iOS：最后一项资源的 ID。
- Android：最后一项资源在查询结果中的索引。

业务代码应把它视为不透明游标，只传回 `after`，不要解析或计算它。

### `AssetsOptions` 常用筛选项

| 参数 | 作用 |
| --- | --- |
| `album` | 只查询指定相册 |
| `first` | 每页最大数量，默认 `20` |
| `after` | 上一页的 `endCursor` |
| `createdAfter` | 只返回指定时间之后创建的资源 |
| `createdBefore` | 只返回指定时间之前创建的资源 |
| `mediaType` | 按照片、视频、音频等类型过滤，默认仅照片 |
| `mediaSubtypes` | 按截图、全景图、Live Photo 等细分类型过滤，仅 iOS |
| `resolveWithFullInfo` | Android 上读取完整 EXIF 信息，也可修正图片方向 |
| `sortBy` | 设置一个或多个排序字段 |

排序可以传单个字段：

```ts
sortBy: MediaLibrary.SortBy.creationTime
```

也可以传 `[字段, 是否升序]`：

```ts
sortBy: [
  [MediaLibrary.SortBy.creationTime, false],
  [MediaLibrary.SortBy.width, true],
]
```

前面的字段优先级更高。使用 `SortBy.default` 时，升序参数不起作用。

### 获取完整资源信息

```ts
const info = await MediaLibrary.getAssetInfoAsync(asset, {
  shouldDownloadFromNetwork: true,
});
```

它可以返回：

- 本地 URI。
- EXIF 元数据。
- GPS 位置。
- iOS 收藏状态。
- iOS 图片方向。
- Live Photo 配对视频。
- 资源是否只存在于 iCloud。

`shouldDownloadFromNetwork` 仅影响 iOS iCloud 资源，默认值为 `true`。

原文建议，为了性能，应优先使用新版资源对象提供的独立 getter（如位置或 EXIF getter），只获取真正需要的数据。Legacy API 的 `getAssetInfoAsync()` 可能一次加载较多信息。

## 创建与保存资源

### 保存文件但不需要返回 Asset

```ts
await MediaLibrary.saveToLibraryAsync(localUri);
```

要求：

- 文件 URI 必须包含扩展名。
- Android 必须是以 `file:///` 开头的本地路径。
- 返回 `void`，不会返回新创建的 `Asset`。

iOS 11+ 可以只配置 `NSPhotoLibraryAddUsageDescription`，在不申请完整照片库读取权限的情况下保存文件。

### 创建 Asset 并获取结果

```ts
const asset = await MediaLibrary.createAssetAsync(localUri);
```

典型场景是保存相机拍摄结果：

```ts
const { uri } = await Camera.takePictureAsync();
const asset = await MediaLibrary.createAssetAsync(uri);
```

也可以创建时直接加入相册：

```ts
const asset = await MediaLibrary.createAssetAsync(uri, album);
```

`localUri` 同样必须带文件扩展名，Android 上必须以 `file:///` 开头。指定的相册必须已经存在。

Android 11 以后，应优先在创建资源时传入 `album`，避免先创建资源、再移动到相册时触发额外的用户确认。

## 相册管理

### 创建相册

```ts
const album = await MediaLibrary.createAlbumAsync(
  'My Album',
  asset,
  true
);
```

参数依次为：

1. 相册名称。
2. 初始资源或资源 ID。
3. Android 上是否复制资源，默认 `true`。
4. 可选的初始本地文件 URI。

Android 不允许创建空相册，所以必须提供：

- 一个已有资源；或
- 一个本地媒体文件 URI。

如果同时传入 `asset` 和 `initialAssetLocalUri`，本地 URI 会被忽略。

Android 上复制资源会产生一个新的资源副本，之后查询时可能看到重复内容。传入 `false` 则会移动资源。

### 向相册添加资源

```ts
await MediaLibrary.addAssetsToAlbumAsync(assets, album, true);
```

Android 上第三个参数决定复制还是移动：

- `true`：复制，默认行为，查询结果可能出现副本。
- `false`：移动；Android 11 后可能要求用户确认。

### 从相册移除资源

```ts
await MediaLibrary.removeAssetsFromAlbumAsync(assets, album);
```

Android 上，如果移除后相册中没有任何资源，相册会被系统自动删除。

### 删除相册

```ts
await MediaLibrary.deleteAlbumsAsync(albums, false);
```

不同平台语义不同：

- Android：默认同时删除相册内的资源。
- iOS：默认只删除相册，不删除其中的资源；第二个参数传 `true` 才同时删除资源。

这是高风险的平台差异，不能假设删除相册在 iOS 和 Android 上具有相同效果。

### 删除资源

```ts
await MediaLibrary.deleteAssetsAsync(assets);
```

- iOS：从资源所属的所有相册中删除，并显示额外的系统确认对话框。
- Android：相册与具体资源副本紧密关联，删除一个资源不会自动删除其其他副本。

## Android 相册迁移

### 判断是否需要迁移

```ts
const needsMigration =
  await MediaLibrary.albumNeedsMigrationAsync(album);
```

该方法检查应用是否拥有相册目录的写权限。

在以下环境中始终返回 `false`：

- Android 11 以下。
- iOS。
- Web。

### 执行迁移

```ts
await MediaLibrary.migrateAlbumIfNeededAsync(album);
```

它会在 Android 11 及以上将相册内容迁移到符合 `MediaStore` 和分区存储要求的目录。

以下情况不会执行任何操作：

- 运行在 iOS 或 Web。
- Android 版本低于 11。
- 应用仍然具有相册目录写权限。

自动迁移要求相册中的文件类型兼容。例如：

- 图片和视频可以一起迁移。
- 音乐和图片不能作为同一兼容类别自动迁移。

无法自动迁移时 Promise 会被拒绝，需要使用 `expo-file-system` 手动处理文件迁移。

如果应用只读取相册，从不向相册添加资源，则原文明确说明通常不需要迁移。

## 监听媒体库变化

```ts
const subscription = MediaLibrary.addListener(event => {
  if (!event.hasIncrementalChanges) {
    // 重新加载完整资源列表
    return;
  }

  console.log(event.insertedAssets);
  console.log(event.updatedAssets);
  console.log(event.deletedAssets);
});

// 组件卸载或不再需要监听时
subscription.remove();
```

事件行为存在平台差异：

- Android 回调收到空对象，不能依赖增量详情。
- iOS 会返回 `MediaLibraryAssetsChangeEvent`。
- iOS 用户通过有限权限选择器更改可访问资源时，也会触发监听器。

当 `hasIncrementalChanges` 为：

- `true`：可以使用 `insertedAssets`、`updatedAssets` 和 `deletedAssets` 局部更新界面。
- `false`：变更无法用增量数据完整描述，应重新查询全部资源。

还可以使用：

```ts
MediaLibrary.removeSubscription(subscription);
MediaLibrary.removeAllListeners();
```

通常优先调用当前订阅对象的 `remove()`，避免误删其他模块注册的监听器。

## 其他平台专用能力

### iOS 收藏

```ts
await MediaLibrary.setAssetFavoriteAsync(asset, true);
```

该方法仅支持 iOS，用于把资源加入或移出系统“收藏”智能相册。

### API 可用性检查

```ts
const available = await MediaLibrary.isAvailableAsync();
```

在调用媒体库功能前，可以通过它判断当前设备是否启用了对应 API。

## 核心数据类型

### `Asset`

常用字段包括：

| 字段 | 含义 |
| --- | --- |
| `id` | 系统媒体库内部 ID |
| `uri` | 资源 URI |
| `filename` | 文件名 |
| `mediaType` | 照片、视频、音频等类型 |
| `width` / `height` | 图片或视频尺寸 |
| `duration` | 视频或音频时长，单位为秒 |
| `creationTime` | 创建时间戳 |
| `modificationTime` | 最后修改时间戳 |
| `albumId` | 所属相册 ID，仅 Android |
| `mediaSubtypes` | 截图、全景图、Live Photo 等细分类型，仅 iOS |

### `Album`

常用字段包括：

- `id`：相册 ID。
- `title`：相册名称。
- `assetCount`：估算的资源数量。
- `type`：普通相册、时刻或智能相册，主要用于 iOS。

iOS 的 `moment` 相册还可能包含起止时间、近似位置和地点名称。

### 媒体类型

`MediaLibrary.MediaType` 包含：

```ts
MediaLibrary.MediaType.photo
MediaLibrary.MediaType.video
MediaLibrary.MediaType.audio
MediaLibrary.MediaType.unknown
```

返回值还可能出现 `pairedVideo`，用于照片配对的视频资源。

### iOS 媒体子类型

iOS 可以区分截图、全景图、Live Photo、HDR、延时摄影、高帧率视频、空间媒体和电影效果视频等类型。Android 不支持这组 `MediaSubtype` 筛选能力。

## 完整基础流程示例

下面是原文示例所表达的主要流程：

```tsx
import { useEffect, useState } from 'react';
import {
  Button,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';

export default function App() {
  const [albums, setAlbums] = useState(null);
  const [permissionResponse, requestPermission] =
    MediaLibrary.usePermissions();

  async function getAlbums() {
    if (permissionResponse?.status !== 'granted') {
      const response = await requestPermission();

      if (!response.granted) {
        return;
      }
    }

    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });

    setAlbums(fetchedAlbums);
  }

  return (
    <View>
      <Button onPress={getAlbums} title="Get albums" />

      <ScrollView>
        {albums?.map(album => (
          <AlbumEntry key={album.id} album={album} />
        ))}
      </ScrollView>
    </View>
  );
}

function AlbumEntry({ album }) {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    async function loadAssets() {
      const page = await MediaLibrary.getAssetsAsync({ album });
      setAssets(page.assets);
    }

    loadAssets();
  }, [album]);

  return (
    <View>
      <Text>
        {album.title} - {album.assetCount ?? 'no'} assets
      </Text>

      <View>
        {assets.map(asset => (
          <Image
            key={asset.id}
            source={{ uri: asset.uri }}
            style={{ width: 50, height: 50 }}
          />
        ))}
      </View>
    </View>
  );
}
```

其关键流程是：

1. 获取当前权限状态。
2. 在用户触发操作后请求权限。
3. 确认授权成功后查询相册。
4. 根据相册分页查询资源。
5. 使用 React Native 的 `Image` 组件展示本地 URI。

与 React Web 不同，这里的 `Button`、`View`、`Text`、`Image` 和 `ScrollView` 都是 React Native 组件，不会渲染为 HTML 元素。

## 已知限制与高频坑点

### Android 无法创建空相册

创建 Android 相册时必须提供已有资源或本地媒体 URI。资源全部移除后，相册还会被系统自动删除。

### Android 复制资源会产生重复项

创建相册或向相册添加资源时，Android 默认执行复制。之后 `getAssetsAsync()` 可能返回看似相同的多个资源，它们实际上是不同副本。

### Android 11 移动资源需要用户确认

不要把“创建资源后再移动到相册”作为默认流程。创建时直接给 `createAssetAsync()` 传入目标 `album`，可以减少系统确认。

### Android 图片方向可能错误

Android 查询资源时默认不会读取完整 EXIF：

```ts
await MediaLibrary.getAssetsAsync({
  resolveWithFullInfo: true,
});
```

如果未启用该选项，依赖 EXIF 方向的图片可能显示旋转错误。读取完整信息也可能增加查询成本，不应在不需要时盲目开启。

### URI 必须有文件扩展名

`createAssetAsync()`、`createAlbumAsync()` 的初始 URI 和 `saveToLibraryAsync()` 都要求 URI 包含扩展名。Android 还要求本地路径以 `file:///` 开头。

### 有限权限不等于完整授权

`status === 'granted'` 时仍应检查 `accessPrivileges`。用户可能只授权了部分照片，查询结果并不代表完整媒体库。

### 删除行为存在平台差异

删除相册、删除资源及从相册移除资源，在 Android 和 iOS 上可能影响不同范围的数据。涉及删除操作时，应分别测试两个平台，不能只根据方法名推断结果。

### 平台支持标记不代表行为完全相同

多数 API 标记支持 Android、iOS 和 tvOS，但事件内容、权限系统、相册模型、URI 格式和删除语义仍有差异。共享 TypeScript 接口不等于共享底层实现。

## Android 权限声明

该库会通过自身的 `AndroidManifest.xml` 自动添加以下权限：

| 权限 | 作用 |
| --- | --- |
| `READ_EXTERNAL_STORAGE` | 读取旧版 Android 外部存储 |
| `WRITE_EXTERNAL_STORAGE` | 写入旧版 Android 外部存储 |
| `READ_MEDIA_IMAGES` | 读取图片 |
| `READ_MEDIA_VIDEO` | 读取视频 |
| `READ_MEDIA_AUDIO` | 读取音频 |
| `READ_MEDIA_VISUAL_USER_SELECTED` | 读取用户通过系统照片选择器选中的图片或视频 |

不同权限适用于不同 Android 版本。通过 config plugin 的 `granularPermissions` 可以控制图片、视频和音频权限是否加入 Manifest。

## iOS 权限说明

该库使用两个 Info.plist 配置：

| Key | 作用 |
| --- | --- |
| `NSPhotoLibraryUsageDescription` | 说明为什么需要访问照片库 |
| `NSPhotoLibraryAddUsageDescription` | 说明为什么只需要向照片库添加内容 |

如果业务仅保存图片、不读取用户现有照片，可以考虑只申请添加权限，以减少权限范围。

## 对 React Web 开发者最重要的认知差异

1. **权限分为构建声明和运行时授权。**  
   `app.json`、Manifest 或 Info.plist 决定应用可以申请什么；JavaScript API 负责实际询问用户。

2. **本地资源 URI 不是普通 HTTP URL。**  
   `ph://` 和 `file://` 由原生系统处理，不应直接套用 Web 文件上传和 URL 处理方式。

3. **同一 API 在不同操作系统上的副作用可能不同。**  
   特别是复制、移动、删除相册和删除资源。

4. **系统授权可能只有部分资源。**  
   不能把 `granted` 简化理解成“可以看到所有照片”。

5. **配置修改需要重新构建。**  
   React Web 中修改配置后刷新页面往往即可生效；原生权限声明属于应用二进制的一部分。

6. **媒体查询必须考虑分页。**  
   不应一次读取整个媒体库。默认每页只有 20 项，应基于 `endCursor` 和 `hasNextPage` 持续加载。

## 实际开发建议

以下内容属于**基于文档内容推导**：

- 应将权限检查、权限请求和媒体查询分开处理，避免在组件挂载时无条件弹出授权框。
- 查询下一页时保存原始 `endCursor`，不要依赖其平台相关格式。
- 删除、移动或迁移操作应捕获 Promise 拒绝，并向用户解释系统确认或权限限制。
- 使用 `accessPrivileges` 驱动界面：有限授权时提供“管理可访问照片”的入口。
- 只在需要 EXIF 或纠正 Android 图片方向时启用 `resolveWithFullInfo`。
- 监听到 `hasIncrementalChanges === false` 时，清空旧分页状态并执行完整刷新。
- 应在真实 Android 和 iOS 设备上分别验证权限与媒体管理流程，模拟器无法完全覆盖真实照片库、iCloud 和系统授权行为。

以下属于**基于经验建议**：

- 权限文案应描述具体功能，例如“用于选择头像”或“用于保存编辑后的图片”，不要只写“需要访问照片”。
- 删除和移动前增加应用内确认，并明确说明是否会影响系统相册中的原文件。
- 对大量缩略图使用虚拟列表，而不是在 `ScrollView` 中一次渲染全部资源。
- 将媒体权限、查询和相册管理封装到独立模块，集中处理 Android/iOS 差异。
- 上传媒体前先确认是否获得可读取的本地 URI，尤其要处理仅存储于 iCloud 的资源。
- 因本文描述的是 Legacy API，新项目在确定技术方案前应同时评估包根路径提供的新版类 API。

## 文档未涉及的内容

当前文档未涉及：

- Legacy API 迁移到新版类 API 的具体步骤。
- 媒体文件上传到服务端的方法。
- 图片压缩、裁剪和格式转换。
- Android 与 iOS 的完整发布审核流程。
- Google Play 权限政策的详细合规判断标准。
- 大规模媒体列表的性能基准。
- tvOS 上各项 API 的具体交互差异。
- Web 平台的完整实现；部分方法说明提到 Web，但该文档的平台支持列表不包含 Web。

## 总结

`expo-media-library/legacy` 提供了对系统媒体库的读取、保存、查询、相册管理和事件监听能力。它的难点不在 React 语法，而在移动操作系统的权限模型、原生构建配置以及 Android 与 iOS 的行为差异。

实际使用时应重点把握：

- 从 `expo-media-library/legacy` 导入 Legacy API。
- 同时完成构建阶段权限声明和运行时授权。
- 正确处理完整授权、有限授权和拒绝授权。
- 使用游标分页查询媒体资源。
- 区分保存文件和创建可返回的 `Asset`。
- 注意 Android 空相册、复制副本、图片方向和分区存储迁移限制。
- 注意 iOS 系统确认、iCloud 资源和有限照片访问。
- 对删除、移动及相册操作分别验证 Android 与 iOS 行为。

---

## 文档导航

- **上一页**：[media library](./193__media-library.md)
- **下一页**：[mesh gradient](./195__mesh-gradient.md)
