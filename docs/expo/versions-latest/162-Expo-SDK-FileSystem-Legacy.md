# 162｜Expo SDK FileSystem（legacy）旧版文件系统 API

**翻页：**[上一页：Expo SDK FileSystem 文件系统](./161-Expo-SDK-FileSystem.md) · [目录](./README.md) · [下一页：Expo SDK Fingerprint](./163-Expo-SDK-Fingerprint.md)

**官方页面：**[FileSystem (legacy) · Latest](https://docs.expo.dev/versions/latest/sdk/filesystem-legacy/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/filesystem-legacy/)

**版本与平台：**Latest 推荐 `expo-file-system ~57.0.7`，SDK v56.0.0 推荐 `~56.0.11`。文档列出 Android、iOS、tvOS，并标记包含在 Expo Go 中。该 API 是 `expo-file-system` 包为向后兼容保留的函数式接口；当前新代码优先学习上一页的 `File` / `Directory` 类，维护旧代码时从 `expo-file-system/legacy` 导入。

## Legacy 的边界与文件 URI

Legacy API 主要用字符串 URI 表示本地文件，而不是现代 API 的 `File` / `Directory` 对象。应用通常可读写自己的 `documentDirectory` 与 `cacheDirectory`；打包资源位于 `bundleDirectory`。在 Expo Go 中，每个项目有独立文件系统作用域，不能读取另一个 Expo Go 项目的文件。

| 路径常量 | 用途 |
| --- | --- |
| `FileSystem.documentDirectory` | 用户期望保留的应用文档目录，URI 以 `/` 结尾；文件由应用显式删除。 |
| `FileSystem.cacheDirectory` | 缓存目录，设备存储不足时系统可清理；适合可重新下载的临时文件。 |
| `FileSystem.bundleDirectory` | 随原生 App 打包的资源目录，可能为 `null`；它不是普通的可写用户目录。 |

传给方法的字符串 URI 必须符合该方法支持的平台 scheme。比如 Android `content://`（SAF 文件 URI）可被 `copyAsync` 复制进应用目录，但不能直接传给 `readAsStringAsync` 的所有路径组合；详见下方平台表。不要把 Web URL、Android SAF URI 和应用私有 `file://` 路径当成同一种东西。

安装（Expo 项目建议由 Expo 选择兼容版本）：

```sh
npx expo install expo-file-system
```

旧函数从 legacy 子路径导入：

```ts
import * as FileSystem from 'expo-file-system/legacy';
```

## 可恢复的网络下载

`createDownloadResumable(url, fileUri, options, callback)` 创建任务，但要调用 `downloadAsync()` 才开始。进度对象的 `totalBytesExpectedToWrite` 若为 `-1`，服务端没有提供 `Content-Length`，不能计算可靠百分比。暂停后可用 `savable()` 保存恢复所需参数；重新启动 App 后，以该状态重新创建 `DownloadResumable` 并调用 `resumeAsync()`。

```ts
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const localUri = `${FileSystem.documentDirectory}clip.mp4`;
const onProgress = ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
  const percent = totalBytesExpectedToWrite > 0
    ? totalBytesWritten / totalBytesExpectedToWrite
    : null; // -1 表示服务器未告知总大小
  console.log('下载进度', percent);
};

const task = FileSystem.createDownloadResumable(
  'https://example.com/media/clip.mp4',
  localUri,
  {},
  onProgress
);

void task.downloadAsync()
  .then((result) => console.log('下载到', result?.uri))
  .catch((error) => console.error('下载失败', error));

// 由界面按钮回调调用；暂停任务后保存可在 App 重启后恢复的快照。
async function pauseAndPersist() {
  await task.pauseAsync();
  await AsyncStorage.setItem('paused-download', JSON.stringify(task.savable()));
}

// 同一 App 进程内可以继续已暂停的任务。
async function resumeInCurrentSession() {
  const result = await task.resumeAsync();
  console.log('继续下载到', result?.uri);
}

// App 重启后，从持久化快照重建 DownloadResumable，再继续下载。
async function restoreAfterRestart() {
  const json = await AsyncStorage.getItem('paused-download');
  if (!json) return;

  const saved = JSON.parse(json);
  const restoredTask = new FileSystem.DownloadResumable(
    saved.url,
    saved.fileUri,
    saved.options,
    onProgress,
    saved.resumeData
  );
  const result = await restoredTask.resumeAsync();
  console.log('恢复下载到', result?.uri);
}
```

`DownloadResumable` 的 `downloadAsync()` / `resumeAsync()` 完成时返回下载结果；取消时可能得到 `undefined`。`pauseAsync()` 产生可保存的 `DownloadPauseState`，`savable()` 返回可用于下一次构造的快照。下载目标所在的目录必须预先存在；目标文件若已存在，其内容会被替换。

## 缓存 GIF 的完整流程

官方示例把目录创建、批量下载、按需缓存、生成可分享的 Android 内容 URI 和清理目录组合起来。下面保留这些代码主题，并为 URI 拼接与异常处理补上上下文：

```ts
import * as FileSystem from 'expo-file-system/legacy';

const gifDirectory = `${FileSystem.cacheDirectory}gifs/`;
const gifUri = (id: string) => `${gifDirectory}${id}_200.gif`;
const gifUrl = (id: string) => `https://media.example.com/${id}/200.gif`;

async function ensureGifDirectory() {
  const info = await FileSystem.getInfoAsync(gifDirectory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(gifDirectory, { intermediates: true });
  }
}

export async function cacheManyGifs(ids: string[]) {
  await ensureGifDirectory();
  await Promise.all(ids.map((id) => FileSystem.downloadAsync(gifUrl(id), gifUri(id))));
}

export async function getGif(id: string) {
  await ensureGifDirectory();
  const path = gifUri(id);
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) await FileSystem.downloadAsync(gifUrl(id), path);
  return path;
}

export async function getShareableGifUri(id: string) {
  return FileSystem.getContentUriAsync(await getGif(id));
}

export async function clearGifCache() {
  await FileSystem.deleteAsync(gifDirectory, { idempotent: true });
}
```

`Promise.all` 并发执行独立下载；`getInfoAsync` 先检查缓存，避免重复请求。Android `file://` 给外部 App 使用时要转成 `content://`，可用 `getContentUriAsync()`；SAF / URI 权限必须按实际来源处理。

## 二进制和 multipart 上传

`uploadAsync(url, fileUri, options)` 发送既有本地文件。`BINARY_CONTENT` 把文件原样作为请求 body；`MULTIPART` 将文件和表单参数封装为 multipart/form-data。源页代码展示 `PATCH` + 二进制上传；服务端分别展示如何接收原始 body 和 `photo` 字段。

```ts
import * as FileSystem from 'expo-file-system/legacy';

const response = await FileSystem.uploadAsync(
  'https://example.com/binary-upload',
  `${FileSystem.documentDirectory}photo.png`,
  {
    fieldName: 'file',
    httpMethod: 'PATCH',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  }
);
console.log(response.status, response.body);
```

下面是源页中的 Node.js 服务端两种处理方式的重写：

```js
const express = require('express');
const fs = require('node:fs');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

// 接收未经 multipart 包装的二进制 body。
app.patch('/binary-upload', (req, res) => {
  const output = `uploads/image-${Date.now()}.bin`;
  req.pipe(fs.createWriteStream(output));
  res.status(200).send('OK');
});

// 从 multipart/form-data 中提取名为 photo 的文件，并读取普通表单字段。
app.patch('/multipart-upload', upload.single('photo'), (req, res) => {
  console.log(req.body);
  res.status(200).send('OK');
});

app.listen(3000, () => console.log('Upload server listening on port 3000'));
```

`FileSystemUploadOptions` 的 `httpMethod` 支持 `POST`、`PUT`、`PATCH`；multipart 可配置字段名、MIME type 和额外字符串参数。上传结果包含 HTTP status、response headers 与 body。

## Android Storage Access Framework（SAF）

SAF 是 Android 系统文档选择器提供的授权访问方式。`content://` SAF URI 代表用户挑选的外部目录 / 文件，应用只能在用户许可范围内读写；它不是可随意拼接的本地 `file://` 路径。`StorageAccessFramework` 命名空间仅面向 Android。

先让用户选择目录，再读取其中完整 SAF URI 列表：

```ts
import { StorageAccessFramework } from 'expo-file-system/legacy';

const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
if (permission.granted) {
  const directoryUri = permission.directoryUri;
  const files = await StorageAccessFramework.readDirectoryAsync(directoryUri);
  console.log(files);
}
```

迁移已有 Android 媒体相册的流程是：定位 root 下的目录、申请用户授权、确认用户确实选择目标目录、申请 MediaLibrary 权限、复制进应用 Documents，然后把图片登记到媒体库并创建相册。下面保留官方示例所有主要阶段；`expo-media-library/legacy` 对应 Latest 源页写法，SDK v56 页面示例导入路径为 `expo-media-library`：

```ts
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';

const SAF = FileSystem.StorageAccessFramework;

async function importAlbum(albumName: string) {
  const suggestedUri = SAF.getUriForDirectoryInRoot(albumName);
  const folderPermission = await SAF.requestDirectoryPermissionsAsync(suggestedUri);
  if (!folderPermission.granted) return;

  const selectedUri = folderPermission.directoryUri;
  if (!selectedUri.includes(albumName)) return;

  const mediaPermission = await MediaLibrary.requestPermissionsAsync();
  if (!mediaPermission.granted) return;

  await SAF.moveAsync({
    from: selectedUri,
    to: FileSystem.documentDirectory,
  });

  const copiedDirectory = `${FileSystem.documentDirectory}${albumName}`;
  const names = await FileSystem.readDirectoryAsync(copiedDirectory);
  const [firstAsset, ...remainingAssets] = await Promise.all(
    names.map((name) => MediaLibrary.createAssetAsync(`${copiedDirectory}/${name}`))
  );

  if (!firstAsset) return; // 空目录没有可用于创建相册的首个 asset。
  const album = await MediaLibrary.createAlbumAsync(albumName, firstAsset, false);
  if (remainingAssets.length > 0) {
    await MediaLibrary.addAssetsToAlbumAsync(remainingAssets, album, false);
  }
}
```

SAF 还提供 `createFileAsync(parentUri, fileName, mimeType)`、`makeDirectoryAsync(parentUri, dirName)`、`getUriForDirectoryInRoot(folderName)`。后两个创建方法返回新 SAF URI。移动 SAF 内容到内部目录时使用 legacy `moveAsync({ from, to })`；若只需复制则用 `copyAsync`。

## Legacy API 参考

### `DownloadResumable` 与 `UploadTask`

| 类 / 方法 | 用途 |
| --- | --- |
| `DownloadResumable.fileUri` | 本地目标 URI。 |
| `downloadAsync()` / `resumeAsync()` | 开始或继续下载，返回下载结果；取消后可为 `undefined`。 |
| `pauseAsync()` | 暂停并返回可持久化 `DownloadPauseState`；恢复数据在成功暂停后写入任务。 |
| `savable()` | 返回恢复下载所需的 URL、目标 URI、options 与可选 resume data。 |
| `FileSystemCancellableNetworkTask.cancelAsync()` | 取消基础网络任务。 |
| `UploadTask.uploadAsync()` / `cancelAsync()` | 启动上传 / 取消上传；结果为上传响应或 `null` / `undefined`。 |

### 模块级方法

所有这些方法都要从 `expo-file-system/legacy` 导入；现代包主入口中同名旧方法可能抛运行时错误。`fileUri` / `from` / `to` 是 URI 字符串。

| 方法 | 行为和重要边界 |
| --- | --- |
| `copyAsync({ from, to })` | 复制文件或目录；递归复制目录，也可将其它应用分享的内容复制进私有目录。 |
| `createDownloadResumable(uri, fileUri, options?, callback?, resumeData?)` | 创建支持进度、暂停、恢复的下载对象。目标父目录必须先存在；已存在的目标内容会被替换。 |
| `createUploadTask(url, fileUri, options?, callback?)` | 创建可监听进度 / 取消的上传任务。 |
| `deleteAsync(fileUri, options?)` | 删除文件或目录；目录会连同子项递归删除。`idempotent: true` 可令目标不存在时不报错。 |
| `deleteLegacyDocumentDirectoryAndroid()` | 旧 Android Documents 清理入口。 |
| `downloadAsync(uri, fileUri, options?)` | 一次性下载；目标目录必须预先存在，已存在文件会被覆盖。 |
| `getContentUriAsync(fileUri)` | Android：将应用内 `file://` 转成可分享给外部 App 的 `content://`。 |
| `getFreeDiskStorageAsync()` / `getTotalDiskCapacityAsync()` | 返回设备内部存储可用 / 总容量，单位字节。 |
| `getInfoAsync(fileUri, options?)` | 查询文件、目录、外部内容 / asset 的元数据；不存在时返回 `exists: false` 的结果。 |
| `makeDirectoryAsync(fileUri, options?)` | 创建空目录；`intermediates` 控制是否创建缺少的父目录。 |
| `moveAsync({ from, to })` | 将文件或目录移动到新位置。 |
| `readAsStringAsync(fileUri, options?)` | 读取整个文件；`encoding` 可选 UTF-8 / Base64。 |
| `readDirectoryAsync(fileUri)` | 返回目录子项名称字符串数组。 |
| `uploadAsync(url, fileUri, options?)` | 上传已存在文件，返回状态、headers、response body。 |
| `writeAsStringAsync(fileUri, contents, options?)` | 覆盖或追加字符串；SAF URI 必须指向已经存在的文件，不能用此方法创建新 SAF 文件。 |

`StorageAccessFramework` 的 Android API：

| 方法 | 行为 |
| --- | --- |
| `requestDirectoryPermissionsAsync(initialFileUrl?)` | Android 11+ 打开系统目录选择器并请求整个子树的访问权；成功时得到 `directoryUri`。 |
| `readDirectoryAsync(dirUri)` | 读取 SAF 目录，返回子文件 / 目录的完整 SAF URI 数组。 |
| `createFileAsync(parentUri, fileName, mimeType)` | 在 SAF 目录创建空文件并返回 URI。参数文件名不带扩展名，MIME type 单独传入。 |
| `makeDirectoryAsync(parentUri, dirName)` | 新建空目录并返回 URI。 |
| `getUriForDirectoryInRoot(folderName)` | 构造 Android root 下目录的 SAF URI，可作为系统 picker 的初始位置提示。 |

## 类型与枚举速查

| 类型 | 关键内容 |
| --- | --- |
| `DeletingOptions` | `idempotent`，目标不存在时是否视作成功；默认 `false`。 |
| `DownloadOptions` | `cache`、请求 `headers`、可选 `md5`、iOS `sessionType`。下载会话默认 `BACKGROUND`；Android 总是后台 session。 |
| `DownloadPauseState` | `url`、`fileUri`、`options`、可选 `resumeData`。 |
| `DownloadProgressData` | `totalBytesWritten` 与 `totalBytesExpectedToWrite`；期望值为 `-1` 表示服务器没返回 Content-Length。 |
| `DownloadProgressCallback` / `DownloadResult` | 旧别名；官方文档标为 deprecated，使用 `FileSystemNetworkTaskProgressCallback<DownloadProgressData>` / `FileSystemDownloadResult`。 |
| `FileInfo` | 存在时含 `exists: true`、`isDirectory`、`uri`、`size`、以秒计的 `modificationTime`，请求 MD5 后可带 `md5`；不存在时 `exists: false`。 |
| `FileSystemDownloadResult` | HTTP 结果基础字段加下载后本地 `uri` 和可选 MD5。 |
| `FileSystemHttpResult` / `FileSystemUploadResult` | `headers`、`mimeType`、`status`；上传结果再加服务器响应 `body`。 |
| `FileSystemRequestDirectoryPermissionsResult` | 联合类型：无权时 `{ granted: false }`；授权时 `{ granted: true, directoryUri }`。 |
| `FileSystemUploadOptions` | Binary / Multipart 选项联合，加 `headers`、`httpMethod`、iOS `sessionType`。 |
| `UploadOptionsBinary` | `uploadType: BINARY_CONTENT`，请求只携带原始文件体。 |
| `UploadOptionsMultipart` | `uploadType: MULTIPART`、`fieldName`、`mimeType`、字符串 `parameters`。 |
| `UploadProgressData` | `totalBytesSent`、`totalBytesExpectedToSend`。 |
| `MakeDirectoryOptions` | `intermediates`，创建不存在的中间目录；默认 `false`。 |
| `InfoOptions` | `md5`，是否返回 MD5，默认 `false`。 |
| `ReadingOptions` | `encoding`（UTF-8 / Base64）；Base64 可用 `position` 与 `length` 读取局部字节范围。 |
| `WritingOptions` | `append`、`encoding`；默认覆盖，UTF-8 编码。 |
| `RelocatingOptions` | `from` 源 URI 与 `to` 目标 `file://` URI。 |
| `FileSystemAcceptedUploadHttpMethod` | `POST`、`PUT`、`PATCH`。 |
| `ProgressEvent<T>` | `{ uuid, data: T }`。 |
| `FileSystemNetworkTaskProgressCallback<T>` | 接收进度数据并返回 `void` 的回调。 |

枚举：`EncodingType.UTF8` / `Base64`；`FileSystemSessionType.BACKGROUND` / `FOREGROUND`（iOS 上传下载会话）；`FileSystemUploadType.BINARY_CONTENT` / `MULTIPART`。

## URI scheme 与权限边界

Legacy 支持的 URI scheme 因平台和方法而不同。下表是官方支持矩阵的学习版摘要；不要因为一个 API 接受某种 URI 就推断其它函数也接受。

| 操作 | Android 来源 → 目标 | iOS 来源 → 目标 |
| --- | --- | --- |
| `getInfoAsync` | `file://`、`content://`、`asset://`、无 scheme | `file://`、`ph://`、`assets-library://` |
| `readAsStringAsync` | `file://`、`asset://`、SAF URI | `file://` |
| `writeAsStringAsync` / `deleteAsync` | `file://`、SAF URI | `file://` |
| `moveAsync` | `file://` / SAF → `file://` | `file://` → `file://` |
| `copyAsync` | `file://`、`content://`、`asset://`、SAF、无 scheme → `file://` | `file://`、`ph://`、`assets-library://` → `file://` |
| `makeDirectoryAsync` / `readDirectoryAsync` | `file://` | `file://` |
| `downloadAsync` / `createDownloadResumable` | HTTP(S) → `file://` | HTTP(S) → `file://` |
| `uploadAsync` | `file://` → HTTP(S) | `file://` → HTTP(S) |

Android 未带 scheme 的资源默认按打包资源处理。Legacy 文档列出的 Android manifest 权限是 `READ_EXTERNAL_STORAGE`、`WRITE_EXTERNAL_STORAGE` 和 `INTERNET`；iOS 页写明不需要权限。读取外部 Android 目录时，优先走 SAF 的用户授权，不要把旧 manifest 权限说明理解为可绕过系统访问控制。

## Latest 与 SDK v56 差异

- 两页推荐安装版本不同：Latest `~57.0.7`，SDK v56 `~56.0.11`；两页的 Next 都进入 Expo SDK Fingerprint。
- 本页的 legacy 方法、SAF 方法、URI scheme 矩阵、主要类型与枚举在两版页面中基本一致。
- SAF 相册迁移代码的 `expo-media-library` 导入路径有变化：Latest 示例用 `expo-media-library/legacy`，SDK v56 示例用 `expo-media-library`。若照搬到 SDK v56，请以 v56 页和本地安装版本的导出为准。
- 两版源码对同一套 API 的说明仍保留在独立 `/legacy` 入口。使用现代 `expo-file-system` 主入口时，旧函数可能在运行时报错；需要旧行为时显式导入 `expo-file-system/legacy`。

## 源页代码主题覆盖

- Installation 与入口：保留 Expo 安装命令和 `expo-file-system/legacy` 导入。
- Downloading files：覆盖进度百分比、`createDownloadResumable`、开始 / 暂停 / 恢复、保存 `savable()` 状态、从持久化快照重建任务。
- Giphy 缓存案例：覆盖检查 / 创建缓存目录、批量并发下载、按需检查后下载、获取外部可分享 URI、递归删除缓存目录。
- 上传案例：覆盖 `uploadAsync` Binary + `PATCH` 客户端；覆盖 Node/Express 原始 body 接收和 multer multipart 单文件处理。
- SAF Basic Usage：覆盖 Android 目录授权、权限判定与目录 URI 枚举；SAF API 方法逐项列出。
- SAF album migration：覆盖系统选目录、校验授权目录、MediaLibrary 权限、将 SAF 目录移入文档目录、列文件创建资产、创建相册并追加资产。Latest / v56 不同的 MediaLibrary 导入路径已明确标注。
- API 参考：覆盖所有旧模块方法、`DownloadResumable` / `UploadTask` 生命周期、全部 legacy 类型和枚举、Android / iOS URI scheme 支持矩阵及页面权限说明。

**翻页：**[上一页：Expo SDK FileSystem 文件系统](./161-Expo-SDK-FileSystem.md) · [目录](./README.md) · [下一页：Expo SDK Fingerprint](./163-Expo-SDK-Fingerprint.md)
