# Expo MediaLibrary 学习指南

> 原文档更新时间：2026 年 5 月 20 日  
> 包名：`expo-media-library`  
> 支持平台：Android、iOS、tvOS、Expo Go

## 文档解决的问题

`expo-media-library` 用于访问设备的系统媒体库，也就是用户在“相册”“照片”或系统媒体存储中看到的图片、视频和音频资源。

它主要提供以下能力：

- 请求系统媒体库权限。
- 查询已有图片、视频和音频。
- 将本地文件保存为系统媒体资源。
- 创建、查询和删除相册。
- 在相册中添加或移除资源。
- 读取文件名、尺寸、时间、EXIF、位置等元数据。
- 标记或取消收藏资源。
- 监听媒体库变化。

这不同于 React Web 中通过 `<input type="file">` 选择文件。Web 页面通常只能访问用户主动选择的文件，而原生应用在获得权限后，可以通过系统 API 查询和修改媒体库。

> 本文对应 Expo 的 **next SDK（尚未正式发布的下一版本）** 文档。原文指出，当前最新稳定版本是 SDK 56。本文介绍的新类 API 与旧版 API 存在明显差异，不能直接假设它们已经在稳定版本中可用。

## 适用场景

适合使用该库的场景包括：

- 将应用生成或下载的图片保存到系统相册。
- 制作图片选择器、相册浏览器或媒体管理页面。
- 查询指定尺寸、类型或时间范围内的媒体。
- 创建应用专属相册并向其中添加资源。
- 读取图片尺寸、拍摄时间、EXIF 或地理位置。
- 监听用户新增、删除或修改媒体资源。
- 处理 iOS Live Photo、HDR、全景图等媒体子类型。

如果只是展示随应用打包的静态图片，或者只操作应用沙盒中的临时文件，通常不需要访问系统媒体库。

## 安装

根据项目使用的包管理器执行对应命令：

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

`expo install` 会根据当前 Expo SDK 选择兼容版本，这一点不同于直接执行普通的 `npm install`。

如果项目是已有的裸 React Native 工程，而不是由 Expo 创建或管理的工程，需要先安装并配置 Expo Modules：

```text
https://docs.expo.dev/bare/installing-expo-modules/
```

当前文档没有给出完整的 iOS、Android 原生工程手动配置步骤。

## 阅读前需要理解的概念

### 媒体库与应用文件系统

移动应用通常至少会接触两个不同的存储范围：

- **应用文件系统**：应用自己的缓存、文档等目录。
- **系统媒体库**：系统相册或 Android MediaStore 管理的公共媒体资源。

通过 `expo-file-system` 下载的文件，最初可能只存在于应用缓存中。调用 `Asset.create(fileUri)` 后，它才会被导入系统媒体库。

因此，下载文件与保存到相册是两个独立步骤。

### Asset

`Asset` 表示系统媒体库中的一项资源，例如：

- 图片
- 视频
- 音频
- 未知类型的媒体

它类似于前端应用中的领域对象，不只是普通文件路径。它包含稳定标识，并提供读取属性、删除、收藏等方法。

### Album

`Album` 表示媒体库中的相册。它可以包含一个或多个 `Asset`。

需要特别注意：Android 和 iOS 对“资源属于相册”的底层模型并不完全相同，因此移动、复制、移除和删除行为存在平台差异。

### URI 与 ID

`Asset.id` 不是 Web 中可公开访问的 HTTP URL：

- Android 上通常是 `contentUri`。
- iOS 上通常是基于 `PHAsset localIdentifier` 的 URI。
- `getUri()` 返回系统中的资源位置 URI。
- Live Photo 的配对视频等特定接口可能返回临时 `file://` URI。

不要把这些值当作能够上传到服务器或长期跨设备保存的普通 URL。

### 权限

访问系统媒体库需要操作系统授权。权限可能处于：

- `undetermined`：用户还没有选择。
- `granted`：已授权。
- `denied`：已拒绝。

`PermissionResponse` 还包含：

- `granted`：是否已授权的便捷布尔值。
- `canAskAgain`：应用是否还能再次弹出权限请求。
- `expires`：权限何时过期。

当 `canAskAgain` 为 `false` 时，继续调用请求权限方法通常无法解决问题，应引导用户前往系统设置。

## 核心使用流程

## 从网络下载图片并保存到媒体库

原文示例的流程是：

1. 使用 `expo-file-system` 将网络图片下载到应用缓存。
2. 请求媒体库权限。
3. 使用 `Asset.create(file.uri)` 将文件导入系统媒体库。
4. 保存返回的 `Asset`，用于显示或继续操作。

```tsx
const file = await downloadFile();

const { status } = await requestPermissionsAsync();
if (status !== 'granted') {
  return;
}

const asset = await Asset.create(file.uri);
```

示例还会先检查缓存文件是否已经存在：

```tsx
const destinationFile = new File(Paths.cache, 'test_image.jpg');

if (destinationFile.exists) {
  return destinationFile;
}

return File.downloadFileAsync(url, destinationFile);
```

这里的缓存复用只避免重复下载，不代表资源一定没有被重复导入媒体库。原文没有说明 `Asset.create()` 会根据文件内容自动去重。

> **基于文档内容推导：** 如果组件多次执行导入流程，应用需要自行记录导入状态，否则可能重复创建媒体资源。

### 权限失败处理

原文示例在权限未授予时直接返回：

```tsx
if (status !== 'granted') {
  return;
}
```

实际界面应区分加载中、权限被拒绝和操作失败，否则用户可能一直看到“正在下载”的提示。

> **基于经验建议：** 为权限拒绝、网络失败、文件导入失败分别维护明确的 UI 状态，并捕获异步异常。

## 查询媒体资源及其属性

查询一张图片的示例：

```tsx
const [asset] = await new Query()
  .limit(1)
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .exe();
```

查询返回的是 `Asset[]`。即使限制为一条，也需要从数组中取出第一项，并处理没有结果的情况。

获得 `Asset` 后，可以异步读取属性：

```tsx
const filename = await asset.getFilename();
const mediaType = await asset.getMediaType();
const width = await asset.getWidth();
const height = await asset.getHeight();
const creationTime = await asset.getCreationTime();
const modificationTime = await asset.getModificationTime();
```

这些属性通过异步方法读取，而不是直接访问对象字段。对 React Web 开发者来说，可以将其理解为每次调用都可能需要访问原生系统媒体数据库。

### Query 查询构造器

`Query` 使用链式 API 构建查询，最后通过 `exe()` 执行。

```tsx
const assets = await new Query()
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .lte(AssetField.HEIGHT, 1080)
  .orderBy(AssetField.CREATION_TIME)
  .limit(20)
  .exe();
```

常用查询方法如下：

| 方法 | 作用 |
| --- | --- |
| `album(album)` | 只查询指定相册内的资源 |
| `eq(field, value)` | 字段等于指定值 |
| `gt(field, value)` | 字段大于指定值 |
| `gte(field, value)` | 字段大于或等于指定值 |
| `lt(field, value)` | 字段小于指定值 |
| `lte(field, value)` | 字段小于或等于指定值 |
| `within(field, values)` | 字段值位于给定值集合中 |
| `orderBy(descriptor)` | 指定排序方式 |
| `limit(count)` | 限制返回数量 |
| `offset(count)` | 跳过指定数量 |
| `exe()` | 执行查询并返回 `Asset[]` |
| `exeForMetadata()` | 执行轻量元数据查询 |

可以参与查询的 `AssetField` 包括：

- `CREATION_TIME`
- `DURATION`
- `HEIGHT`
- `IS_FAVORITE`
- `MEDIA_TYPE`
- `MODIFICATION_TIME`
- `WIDTH`

排序可以直接传字段，此时默认升序：

```tsx
query.orderBy(AssetField.CREATION_TIME);
```

也可以使用 `SortDescriptor`：

```tsx
query.orderBy({
  key: AssetField.CREATION_TIME,
  ascending: false,
});
```

### `exe()` 与 `exeForMetadata()`

`exe()` 返回完整的 `Asset` 对象，之后可以继续调用各种 getter。

`exeForMetadata()` 返回轻量的 `AssetMetadata[]`，只读取媒体存储中成本较低的字段，不解析文件路径，也不解码文件。

轻量元数据包括：

- ID
- 文件名
- 媒体类型
- 创建和修改时间
- 宽高
- 时长
- 收藏状态

Android 的媒体数据库可能没有记录宽高，因此 `AssetMetadata.width` 和 `height` 可能为 `null`。

> **基于文档内容推导：** 列表首屏、分页浏览和只展示基础信息时，应优先考虑 `exeForMetadata()`；只有需要 URI、EXIF 等较重信息时，再使用 `Asset` getter。

## 创建和管理相册

### 创建相册

```tsx
const album = await Album.create('My Album', [asset]);
```

参数含义：

| 参数 | 说明 |
| --- | --- |
| `name` | 新相册名称 |
| `assetsRefs` | 要加入相册的 `Asset` 或 `file://` 文件路径列表 |
| `moveAssets` | Android 是否将资源移动到新相册，默认 `true` |

在 Android 上：

- `moveAssets` 为 `true` 时，资源会被移动。
- 为 `false` 或平台不支持移动时，资源会被复制。

创建后可以读取标题和资源：

```tsx
const title = await album.getTitle();
const assets = await album.getAssets();
```

相册标题不保证唯一，因此不能将标题当作数据库主键。`Album.id` 才是相册的唯一标识。

### 查询相册

```tsx
const album = await Album.get('Camera');
const albums = await Album.getAll();
```

`Album.get(title)` 找不到时返回 `null`。

### 添加资源

```tsx
await album.add(asset);
await album.add([asset1, asset2]);
```

### 从相册移除资源

```tsx
await album.removeAssets(assets);
```

该方法只支持 iOS，并且只解除资源与相册的关系，不会删除媒体库中的资源。

Android 上资源通常只能属于一个相册。要将它从当前相册移出，需要删除资源，或者将其添加到另一个相册。

### 删除相册

删除单个相册：

```tsx
await album.delete();
```

批量删除：

```tsx
await Album.delete([album]);
```

平台行为存在重要差异：

| 平台 | 删除相册时的资源行为 |
| --- | --- |
| Android | 删除相册，并删除其中所有资源 |
| iOS | 默认只删除相册，保留主媒体库中的资源 |

批量删除时，iOS 可通过 `deleteAssets` 决定是否同时删除资源，默认值为 `false`。Android 无论该参数是什么，资源都会随相册删除。

这是具有数据丢失风险的操作，不能仅根据 iOS 测试结果推断 Android 行为。

## Asset 的主要能力

### 创建与删除

```tsx
const asset = await Asset.create(fileUri, optionalAlbum);
await asset.delete();
await Asset.delete([asset1, asset2]);
```

如果 Android 上没有指定相册，新资源会被放入默认的 `Pictures` 目录。

删除操作会从设备媒体存储中删除资源，不只是从当前 React 状态或应用列表中移除。

### 基础信息

常用方法包括：

| 方法 | 返回内容 |
| --- | --- |
| `getFilename()` | 包含扩展名的文件名 |
| `getMediaType()` | 图片、视频、音频或未知类型 |
| `getWidth()` / `getHeight()` | 图片或视频的像素尺寸 |
| `getShape()` | 包含宽高的对象 |
| `getDuration()` | 音频或视频时长，单位毫秒 |
| `getCreationTime()` | 创建时间，UNIX 毫秒时间戳 |
| `getModificationTime()` | 修改时间，UNIX 毫秒时间戳 |
| `getUri()` | 系统资源 URI |
| `getInfo()` | 汇总后的详细 `AssetInfo` |
| `getAlbums()` | 包含该资源的相册 |

Android 上资源通常属于一个相册；iOS 上同一资源可以属于多个相册。

部分属性可能不可用。文档描述创建时间、修改时间、时长和部分尺寸结果可能为 `null`，业务代码应做好空值处理。

### EXIF 与位置

```tsx
const exif = await asset.getExif();
const location = await asset.getLocation();
```

Android 读取 EXIF 中的位置元数据或资源位置时，需要 `ACCESS_MEDIA_LOCATION` 权限。

`Location` 包含：

```ts
{
  latitude: number;
  longitude: number;
}
```

原文中 `getExif()` 的返回类型标成了 `Promise<undefined>`，但文字说明称其返回 EXIF 对象或空对象。这两处信息不一致。

> 使用该 API 前应以实际安装版本的 TypeScript 类型和对应稳定版本文档为准，不能只依赖本页的返回类型标注。

### 收藏

```tsx
const favorite = await asset.getFavorite();
await asset.setFavorite(true);
```

iOS 通过系统“Favorites”智能相册表示收藏状态。

Android 通过 MediaStore 的 `IS_FAVORITE` 字段处理：

- Android 10 及以上支持。
- 更早版本读取时始终返回 `false`。
- 更早版本设置时不执行实际操作。
- 部分第三方图库维护自己的收藏列表，可能不会显示这里的修改。

### iOS 专属信息

以下能力只支持 iOS：

- `getIsInCloud()`：判断资源是否只在 iCloud 中、尚未下载到本地；调用不会触发下载。
- `getLivePhotoVideoUri()`：将 Live Photo 的配对视频提取到临时文件。
- `getMediaSubtypes()`：读取 Live Photo、HDR、全景等子类型。
- `getOrientation()`：读取值为 1 至 8 的 EXIF 显示方向。
- `Album.removeAssets()`：只从相册移除资源，不删除资源本身。

iOS 媒体子类型包括：

- Live Photo
- HDR
- 全景图
- 截图
- 景深效果
- 高帧率视频
- 延时摄影
- 电影效果视频
- 空间媒体
- 流媒体

## 权限管理

### Hook 方式

在 React 组件中可以使用：

```tsx
const [permissionResponse, requestPermission, getPermission] =
  MediaLibrary.usePermissions({
    writeOnly: true,
    granularPermissions: ['photo'],
  });
```

它组合了权限检查与权限请求功能。

`writeOnly: true` 表示只请求写入媒体库所需的权限，而不申请读取权限。对于只需要“保存图片”的应用，这可以减少权限范围。

`granularPermissions` 可选值为：

```ts
'audio' | 'photo' | 'video'
```

该参数只在 Android 13 及以上产生作用。默认情况下，库会请求所有可能的媒体权限。

### 函数方式

```tsx
const current = await MediaLibrary.getPermissionsAsync(
  writeOnly,
  granularPermissions
);

const requested = await MediaLibrary.requestPermissionsAsync(
  writeOnly,
  granularPermissions
);
```

如果项目通过自定义 config plugin 声明 Android 权限，那么运行时请求的每个细粒度权限也必须包含在插件配置中。

当前文档没有提供具体的 config plugin 配置字段或 `app.json` 示例。

### 有限访问与权限选择器

```tsx
await MediaLibrary.presentPermissionsPicker(['photo', 'video']);
```

支持 Android 14 及以上和 iOS。

只有用户最初授予的是 `limited` 有限访问时，系统选择器才会显示；否则调用不会产生效果。该选择器允许用户重新决定应用可以访问哪些资源。

方法不会直接告诉调用方用户是否修改了可访问资源。iOS 可以通过媒体库监听事件判断：如果事件的 `hasIncrementalChanges` 为 `false`，可能表示用户改变了授权范围。

## 监听媒体库变化

注册监听器：

```tsx
const subscription = MediaLibrary.addListener(event => {
  // 处理媒体库变化
});
```

取消监听：

```tsx
subscription.remove();
```

也可以移除全部监听器：

```tsx
MediaLibrary.removeAllListeners();
```

事件可能包含：

- `insertedAssets`
- `deletedAssets`
- `updatedAssets`
- `hasIncrementalChanges`

当 `hasIncrementalChanges` 为 `true` 时，可以根据这些 ID 增量更新界面。

当其为 `false` 时，变化无法可靠地用增删改列表表达，应重新加载完整数据。

平台差异如下：

- iOS 可以提供具体的新增、删除和更新资源 ID。
- Android 监听回调收到空对象，且 `hasIncrementalChanges` 始终为 `false`。

> **基于文档内容推导：** 跨平台实现不能依赖精细的增量事件。Android 发生变化时，应重新执行查询；iOS 才适合根据资源 ID 做增量更新。

在 React 组件中应于卸载时取消订阅：

```tsx
useEffect(() => {
  const subscription = MediaLibrary.addListener(handleChange);

  return () => {
    subscription.remove();
  };
}, []);
```

## 类型与枚举速查

### 媒体类型

```ts
MediaType.IMAGE
MediaType.VIDEO
MediaType.AUDIO
MediaType.UNKNOWN
```

权限选择器使用的 `MediaTypeFilter` 只有：

```ts
'photo' | 'video'
```

注意 `MediaType.IMAGE` 的值是 `"image"`，而权限相关值使用 `"photo"`，两者不能混用。

### AssetInfo

`AssetInfo` 汇总以下信息：

- `id`
- `uri`
- `filename`
- `mediaType`
- `width`
- `height`
- `duration`
- `creationTime`
- `modificationTime`
- `isFavorite`

### 时间和时长单位

文档明确说明：

- 创建时间和修改时间是 UNIX 毫秒时间戳。
- 音频和视频时长使用毫秒。

可以直接用于：

```tsx
new Date(creationTime)
```

但应先判断时间是否为 `null`。

## 旧 API 与 Legacy 模块

该 next SDK 文档正在从旧式顶层函数迁移到面向对象 API。

典型替换关系如下：

| 旧 API | 新 API |
| --- | --- |
| `addAssetsToAlbumAsync()` | `album.add()` |
| `createAlbumAsync()` | `Album.create()` |
| `createAssetAsync()` | `Asset.create()` |
| `deleteAlbumsAsync()` | `album.delete()` / `Album.delete()` |
| `deleteAssetsAsync()` | `asset.delete()` / `Asset.delete()` |
| `getAlbumAsync()` | `Album.get()` |
| `getAlbumsAsync()` | `Album.getAll()` |
| `getAssetInfoAsync()` | `asset.getInfo()` |
| `getAssetsAsync()` | `Query` |
| `presentPermissionsPickerAsync()` | `presentPermissionsPicker()` |
| `removeAssetsFromAlbumAsync()` | `album.removeAssets()` |
| `removeSubscription()` | `subscription.remove()` |
| `saveToLibraryAsync()` | `Asset.create()` |
| `setAssetFavoriteAsync()` | `asset.setFavorite()` |

文档对这些废弃方法的警告不是“未来可能删除”，而是：

> 它们从主入口调用时会在运行时抛出异常。

如果必须继续使用旧 API，需要从以下入口导入：

```ts
expo-media-library/legacy
```

部分旧方法没有对应的新 API，文档只要求从 legacy 模块导入，例如：

- `albumNeedsMigrationAsync()`
- `getMomentsAsync()`
- `isAvailableAsync()`
- `migrateAlbumIfNeededAsync()`

迁移时不能只消除 TypeScript 的 deprecated 警告，还必须修改导入位置或改用新类 API。

## Android 的重要限制

### Google Play 权限政策

原文明确警告：Android 应用只有在确实需要广泛访问照片时，才允许申请完整媒体库访问权限。

这不仅是技术权限问题，也是 Google Play 上架政策问题。应用能在开发设备上成功请求权限，不代表它一定符合商店审核要求。

> **基于文档内容推导：** 如果产品只需要用户选择少量图片，应评估是否应使用系统照片选择器，而不是申请整个媒体库读取权限。本页没有展开照片选择器的具体 API。

### Android 相册模型

需要记住以下差异：

- 资源通常只属于一个相册。
- 将资源加入新相册可能意味着移动，而不只是增加一个关联。
- 无法像 iOS 一样只从相册中移除资源。
- 删除相册会删除其中的所有资源。
- 媒体库变化事件不提供具体变化详情。

### Android 版本差异

- 细粒度媒体权限只对 Android 13 及以上有效。
- 权限选择器支持 Android 14 及以上。
- 收藏功能需要 Android 10 及以上。
- 位置和 EXIF 位置数据需要 `ACCESS_MEDIA_LOCATION`。

## React Web 开发者最容易误解的地方

### 权限不是一次性的浏览器弹窗逻辑

移动端权限属于系统状态，用户可能：

- 首次拒绝。
- 只授权部分照片。
- 禁止应用再次请求。
- 稍后在系统设置中修改权限。
- 修改应用可以访问的资源集合。

因此，不能只在应用首次启动时请求一次，然后永久假设权限存在。

### `Asset` 不是浏览器的 `File`

浏览器 `File` 通常是用户选择后得到的临时 JavaScript 对象，而 `Asset` 是对系统媒体数据库中资源的原生封装。

它的属性很多需要异步读取，ID 和 URI 也由操作系统决定。

### 相册不是普通数组或目录抽象

尤其在 iOS 上，一项资源可以同时属于多个相册；删除相册默认不删除资源。在 Android 上，资源通常只属于一个相册，删除相册还会删除资源。

不能用统一的“文件夹”心智模型解释两个平台。

### 删除具有真实设备副作用

`asset.delete()` 删除的是设备媒体库中的资源。它不像 React 中从列表 state 里过滤一项，也不像删除应用缓存那样只影响应用自身。

删除前应提供明确确认，并根据实际系统行为测试。

### URI 不等于可公开访问的 URL

`content://`、`ph://` 和 `file://` 都不是普通的 `https://` URL。上传、分享或交给其他库之前，需要确认目标 API 是否支持对应 URI 类型。

### 原生平台能力无法只靠 Web 环境验证

媒体权限、系统相册、iCloud、MediaStore 和 Live Photo 都依赖真实原生平台。即使包包含在 Expo Go 中，最终仍应分别在 Android 和 iOS 上验证平台差异。

## 实际开发建议

以下为基于文档内容整理出的实现顺序：

1. 根据实际功能决定只写入还是同时读取媒体库。
2. 在执行查询、导入或修改前检查并请求权限。
3. 明确处理 `granted`、`denied`、`undetermined` 和 `canAskAgain`。
4. 用 `Query` 限制类型、数量和排序，避免无条件读取全部媒体。
5. 列表页面优先使用 `exeForMetadata()`。
6. 需要 URI、EXIF 或位置时，再读取完整 `Asset` 信息。
7. 对所有可能不可用的时间、尺寸、位置和时长进行空值处理。
8. 将 Android 与 iOS 的相册删除、资源移动和监听逻辑分别测试。
9. 在组件卸载时调用 `subscription.remove()`。
10. 使用 next SDK 时清理旧顶层 API，避免运行时异常。

> **基于经验建议：** 不要在组件首次渲染后立即申请范围过大的权限。最好由用户触发“保存到相册”或“浏览设备照片”等明确操作后，再说明用途并请求必要权限。

> **基于经验建议：** 对删除资源、删除 Android 相册和移动资源等操作，使用真机和测试媒体验证，不要用包含用户重要照片的设备进行早期测试。

## 文档未涉及的内容

当前文档未详细说明：

- `app.json` 或 `app.config.js` 的完整 config plugin 配置。
- iOS 权限说明文案的配置方式。
- Android Manifest 中各权限的具体声明。
- 系统照片选择器的实现方式。
- 大型媒体库的推荐分页策略和性能基准。
- 资源上传服务器前如何转换不同平台的 URI。
- iCloud 资源不在本地时如何主动下载。
- 删除、收藏等操作是否会触发额外的系统确认框。
- tvOS 上各项能力的实际使用场景。
- Expo Go 与自定义开发构建在权限配置方面的具体差异。
- 新类 API 从哪个正式 Expo SDK 开始稳定提供。

这些问题需要结合所使用 SDK 的稳定版文档及相关平台文档确认，不能仅根据本页推断。

## 总结

`expo-media-library` 将系统媒体库抽象为三个核心部分：

- `Asset`：表示单个媒体资源，并负责读取、删除和收藏等操作。
- `Album`：表示相册，并负责创建、查询和管理相册资源。
- `Query`：负责筛选、排序和限制查询结果。

使用时最重要的不是记住所有 API，而是理解以下边界：

- 应用缓存文件与系统媒体资源是两回事。
- 所有媒体库操作都受到系统权限控制。
- Android 与 iOS 的相册关系和删除行为不同。
- 媒体 ID、URI 和普通 Web URL 不同。
- next SDK 的旧顶层 API 已不能继续从主入口安全调用。
- 大范围读取 Android 照片还受到 Google Play 政策限制。

---

## 文档导航

- **上一页**：[maps](./192__maps.md)
- **下一页**：[media library legacy](./194__media-library-legacy.md)
