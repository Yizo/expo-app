# Expo FileSystem（legacy）学习指南

## 文档解决的问题

`expo-file-system` 用于访问设备上的本地文件系统，并支持通过网络下载、上传文件。

本文档介绍其中的 **legacy（旧版）API**，主要覆盖：

- 在应用专属目录中创建、读取、写入、复制、移动和删除文件。
- 下载文件，包括进度监听、暂停、恢复和跨应用重启续传。
- 将本地文件上传到服务器。
- 在 Android 上通过 Storage Access Framework（SAF）访问用户选择的外部目录。
- 理解不同文件 URI、存储目录、平台限制和权限要求。

> 本页是下一版本 SDK 的文档，页面提示当前最新稳定版本为 **SDK 56**。实际项目应根据所使用的 Expo SDK 版本查阅对应文档。

## 适用场景

legacy API 适合以下情况：

- 维护已经使用旧版 FileSystem API 的项目。
- 迁移期间需要让旧版 API 与新版 API 共存。
- 依赖 `downloadAsync()`、`uploadAsync()`、`DownloadResumable` 等旧接口。
- 需要兼容旧代码或旧依赖。

文档明确说明：legacy API 仍包含在 `expo-file-system` 包中，可以出于向后兼容目的与现代 API 同时使用。

对于完全新建的项目，本文档没有明确要求优先使用哪套 API；是否采用 legacy API，应结合当前 SDK 对现代 FileSystem API 的说明决定。

## React Web 开发者需要先理解的背景

### 移动端文件不是浏览器中的 File 对象

在 React Web 中，通常通过以下方式处理文件：

- `<input type="file">`
- `File`、`Blob`
- `URL.createObjectURL()`
- 浏览器下载行为
- IndexedDB 或 Cache Storage

React Native 没有浏览器 DOM，也不能依赖浏览器的文件选择框或下载目录。文件通常由一个 URI 标识，例如：

```text
file:///data/user/0/.../my-file.txt
```

FileSystem API 的参数通常不是 Web `File` 对象，而是指向设备文件的 URI 字符串。

### 应用运行在文件系统沙箱中

移动操作系统通常为每个应用分配独立存储区域。应用不能随意读取其他应用的数据或整个设备文件系统。

在 Expo Go 中，每个项目也有独立的文件系统作用域，不能访问其他 Expo Go 项目的文件。

这与浏览器的同源隔离目标类似，但隔离对象从“网站来源”变成了“移动应用或 Expo 项目”。

### URI 不一定是普通路径

本文涉及多种 URI：

- `file://`：应用可以直接访问的本地文件。
- `content://`：Android 通过内容提供者暴露的资源。
- SAF URI：Android Storage Access Framework 返回的授权资源地址。
- `asset://`：Android 应用内资源。
- `ph://`、`assets-library://`：iOS 照片或媒体资源。
- `http://`、`https://`：网络资源。

不能把这些 URI 当作可任意互换的普通字符串路径。不同 API 支持的 URI 类型不同。

## 安装与导入

### Expo 项目

```sh
# npm
npx expo install expo-file-system

# yarn
yarn expo install expo-file-system

# pnpm
pnpm expo install expo-file-system

# bun
bun expo install expo-file-system
```

`expo install` 会根据当前 Expo SDK 选择兼容的包版本，这一点不同于直接使用 `npm install` 安装任意最新版。

### 已有 React Native 项目

如果项目不是由 Expo 创建，而是已有的原生 React Native 工程，需要先安装并配置 Expo Modules 所需的 `expo` 包。

这通常意味着项目中存在 Android 和 iOS 原生工程，不能只把它理解为安装一个普通 JavaScript 依赖。

### 导入 legacy API

```js
import * as FileSystem from 'expo-file-system/legacy';
```

不要误写为：

```js
import * as FileSystem from 'expo-file-system';
```

后者对应现代 API 入口，两套 API 可以共存，但接口并不完全相同。

## 应用可写的核心目录

FileSystem 主要允许应用读写自己的沙箱目录。

### `documentDirectory`

```ts
FileSystem.documentDirectory: string | null
```

用户需要长期保留的文件目录：

- 文件会一直保留，直到应用显式删除。
- URI 以 `/` 结尾。
- 适合用户保存、下次仍希望看到的文件。

例如：

```js
const fileUri = FileSystem.documentDirectory + 'myDirectory/myFile';
```

典型用途包括离线文档、用户导出的内容和需要长期保存的下载结果。

### `cacheDirectory`

```ts
FileSystem.cacheDirectory: string | null
```

应用临时缓存目录：

- 系统存储空间不足时，文件可能被自动删除。
- 适合可以重新下载或重新生成的内容。
- 不适合保存唯一副本或用户必须长期保留的数据。

典型用途包括图片缓存、临时下载和一次性生成文件。

### `bundleDirectory`

```ts
FileSystem.bundleDirectory: string | null
```

指向随应用一起打包的资源目录。

文档只说明该常量表示打包资源所在目录，没有承诺其中资源可写。不要将它当作应用持久化目录。

### 目录选择原则

| 文件性质 | 推荐目录 |
| --- | --- |
| 可以重新下载或生成 | `cacheDirectory` |
| 用户以后仍需要访问 | `documentDirectory` |
| 随应用打包的静态资源 | `bundleDirectory` |

这些常量类型包含 `null`。TypeScript 代码需要进行空值检查，或者仅在已经确认运行平台支持时使用非空断言。

## 文件操作的基本流程

多数文件处理任务可以归纳为：

1. 决定使用缓存目录还是文档目录。
2. 拼接目标 URI。
3. 使用 `getInfoAsync()` 检查文件或目录。
4. 必要时通过 `makeDirectoryAsync()` 创建目录。
5. 执行读、写、下载、上传、移动或删除。
6. 捕获异常并处理失败状态。

### 检查文件信息

```js
const info = await FileSystem.getInfoAsync(fileUri);
```

文件存在时，返回的信息可能包括：

- `exists: true`
- `isDirectory`
- `uri`
- `size`
- `modificationTime`
- 可选的 `md5`

文件不存在时不会因此自动抛错，而是返回：

```js
{
  exists: false,
  isDirectory: false,
  uri: fileUri
}
```

如需 MD5：

```js
const info = await FileSystem.getInfoAsync(fileUri, {
  md5: true,
});
```

MD5 可以用于下载后完整性检查，但本文档没有将其描述为安全签名机制。

### 创建目录

```js
await FileSystem.makeDirectoryAsync(directoryUri, {
  intermediates: true,
});
```

示例使用 `intermediates: true` 创建所需的中间目录，作用类似 Node.js：

```js
fs.mkdir(path, { recursive: true });
```

> 文档的 `MakeDirectoryOptions` 表格将该选项描述为“URI 不存在时不抛错”，但这与选项名称及示例用途并不完全一致。本文仅保留文档示例能够确认的结论：创建嵌套路径时使用 `intermediates: true`。

### 读取和写入字符串

读取整个文件：

```js
const contents = await FileSystem.readAsStringAsync(fileUri, {
  encoding: FileSystem.EncodingType.UTF8,
});
```

写入整个文件：

```js
await FileSystem.writeAsStringAsync(fileUri, contents, {
  encoding: FileSystem.EncodingType.UTF8,
});
```

默认写入会覆盖原内容。追加写入需要：

```js
await FileSystem.writeAsStringAsync(fileUri, contents, {
  append: true,
});
```

支持的编码：

- `EncodingType.UTF8`：普通文本。
- `EncodingType.Base64`：二进制数据的 Base64 表示。

使用 Base64 读取时，可以通过 `position` 和 `length` 跳过一定字节并限制读取长度；这两个选项需要配合使用。

如果读取的是图片 Base64，返回值只是原始 Base64 内容。用于图片数据 URI 时需要自行添加前缀，例如：

```js
const imageSource = `data:image/png;base64,${base64}`;
```

### 读取目录

```js
const names = await FileSystem.readDirectoryAsync(directoryUri);
```

普通 FileSystem 版本返回目录中各文件或子目录的**名称**，不是完整 URI。

如需继续操作，应自行与目录 URI 拼接。

### 复制和移动

```js
await FileSystem.copyAsync({
  from: sourceUri,
  to: destinationUri,
});

await FileSystem.moveAsync({
  from: sourceUri,
  to: destinationUri,
});
```

- `copyAsync()` 可以递归复制目录及其全部内容。
- `moveAsync()` 将文件或目录移动到新位置。
- 目标必须是 `file://` URI。
- `copyAsync()` 还可以把其他应用分享的内容复制进应用本地文件系统。

### 删除

```js
await FileSystem.deleteAsync(fileUri);
```

如果目标是目录，会递归删除目录及全部内容。

默认情况下，目标不存在可能导致错误。需要让重复删除保持幂等时：

```js
await FileSystem.deleteAsync(fileUri, {
  idempotent: true,
});
```

“幂等”表示执行一次和执行多次产生相同最终结果，不会因为文件已经被删除而失败。

`deleteLegacyDocumentDirectoryAndroid()` 也存在于 API 中，但当前文档没有解释其具体使用场景和风险，不应仅凭名称调用。

## 文件下载

### 简单下载

```js
const result = await FileSystem.downloadAsync(
  remoteUrl,
  FileSystem.documentDirectory + 'small.mp4'
);

console.log(result.uri);
```

下载来源必须是 `http://` 或 `https://`，目标必须是本地 `file://` URI。

必须提前创建目标文件所在的目录。API 可以创建目标文件，但不会自动创建其父目录。

如果目标文件已经存在，其内容会被替换。

返回结果包含：

- `uri`
- HTTP `status`
- 响应 `headers`
- `mimeType`
- 启用 `md5` 时的 `md5`

可配置下载请求头：

```js
await FileSystem.downloadAsync(url, fileUri, {
  headers: {
    Authorization: 'Bearer token',
  },
  md5: true,
});
```

`DownloadOptions` 中还存在 `cache` 属性，但当前文档没有解释其行为。

### 可暂停和恢复的下载

创建任务：

```js
const task = FileSystem.createDownloadResumable(
  remoteUrl,
  localFileUri,
  {},
  progress => {
    const ratio =
      progress.totalBytesWritten /
      progress.totalBytesExpectedToWrite;
  }
);
```

创建对象并不会立即开始下载，必须调用：

```js
const result = await task.downloadAsync();
```

暂停：

```js
const pauseState = await task.pauseAsync();
```

恢复：

```js
const result = await task.resumeAsync();
```

取消：

```js
await task.cancelAsync();
```

任务被取消时，`downloadAsync()` 或 `resumeAsync()` 可能解析为 `undefined`，调用方不能始终直接解构返回值。

### 下载进度的限制

进度数据包括：

```ts
{
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}
```

如果服务器没有返回 `Content-Length`，`totalBytesExpectedToWrite` 会是 `-1`。此时不能可靠计算百分比。

因此，下面的代码需要先检查分母：

```js
if (data.totalBytesExpectedToWrite > 0) {
  const progress =
    data.totalBytesWritten / data.totalBytesExpectedToWrite;
}
```

应用进入后台后，进度回调不会继续触发，直到应用回到前台。这不一定意味着原生下载任务已经停止。

### 跨应用重启续传

暂停后，使用 `savable()` 获得可序列化状态：

```js
const snapshot = task.savable();
await AsyncStorage.setItem(
  'pausedDownload',
  JSON.stringify(snapshot)
);
```

恢复应用后重新创建任务：

```js
const json = await AsyncStorage.getItem('pausedDownload');
const snapshot = JSON.parse(json);

const task = new FileSystem.DownloadResumable(
  snapshot.url,
  snapshot.fileUri,
  snapshot.options,
  progressCallback,
  snapshot.resumeData
);

await task.resumeAsync();
```

保存状态不等于保存文件本身。续传依赖目标文件、下载状态以及服务器对断点续传的实际支持。

后一句是**基于文档内容推导**：文档提供了恢复数据机制，但没有保证所有服务器都能完成断点续传。

## 缓存文件示例：管理 GIF

文档示例展示了一套完整缓存流程：

1. 使用 `cacheDirectory + 'giphy/'` 建立缓存目录。
2. `getInfoAsync()` 判断目录是否存在。
3. `makeDirectoryAsync(..., { intermediates: true })` 创建目录。
4. 使用 `Promise.all()` 并发下载多个 GIF。
5. 获取单个 GIF 时先检查本地缓存。
6. Android 上通过 `getContentUriAsync()` 将文件分享给其他应用。
7. 删除整个缓存目录来清空缓存。

核心逻辑可以概括为：

```js
const fileInfo = await FileSystem.getInfoAsync(fileUri);

if (!fileInfo.exists) {
  await FileSystem.downloadAsync(remoteUrl, fileUri);
}

return fileUri;
```

这相当于移动端文件级缓存：命中时返回本地 URI，未命中时先下载。

> **基于经验建议：** `Promise.all()` 会同时发起全部下载。文件数量较多时应设置并发限制，以避免带宽、内存和服务器压力过大。

## 文件上传

### 简单上传

```js
const response = await FileSystem.uploadAsync(
  serverUrl,
  fileUri,
  options
);
```

要求：

- 本地文件必须已经存在。
- 上传目标是远程 HTTP 或 HTTPS URL。
- HTTP 方法只支持 `POST`、`PUT`、`PATCH`。
- 返回结果包含响应 `status`、`headers`、`mimeType` 和字符串形式的 `body`。

### 二进制上传

```js
await FileSystem.uploadAsync(url, fileUri, {
  httpMethod: 'PATCH',
  uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
});
```

`BINARY_CONTENT` 会把文件直接作为整个 HTTP 请求体，不能携带额外表单数据。

服务端示例通过 Node.js 流直接保存请求体：

```js
req.pipe(fs.createWriteStream('./uploads/image.png'));
```

### multipart 上传

```js
await FileSystem.uploadAsync(url, fileUri, {
  uploadType: FileSystem.FileSystemUploadType.MULTIPART,
  fieldName: 'photo',
  mimeType: 'image/png',
  parameters: {
    userId: '123',
  },
});
```

multipart 模式可以同时提交：

- 文件字段。
- MIME 类型。
- 额外表单字段。

文档的 Express 服务端示例使用 `multer` 读取名为 `photo` 的文件字段：

```js
app.patch('/multipart-upload', upload.single('photo'), handler);
```

客户端的 `fieldName` 必须与服务端期望的字段名一致。

### 带进度和取消能力的上传

```js
const task = FileSystem.createUploadTask(
  url,
  fileUri,
  options,
  progressCallback
);

const result = await task.uploadAsync();
await task.cancelAsync();
```

上传进度包括：

- `totalBytesSent`
- `totalBytesExpectedToSend`

## iOS 和 Android 的后台网络任务差异

`DownloadOptions` 和 `FileSystemUploadOptions` 支持 `sessionType`。

### `BACKGROUND`

```js
FileSystem.FileSystemSessionType.BACKGROUND
```

iOS 原生下载或上传会在应用进入后台后继续运行。

如果任务完成时 JavaScript 应用仍可执行，Promise 会立即完成；如果应用执行已经停止，Promise 会在应用回到前台后完成。

后台会话在服务器不可用或连接中断时不会立即失败，而是持续重试，直到成功或被手动取消。

这可能带来一个容易忽略的问题：网络错误不一定迅速表现为 Promise rejection。

### `FOREGROUND`

```js
FileSystem.FileSystemSessionType.FOREGROUND
```

应用变为非活跃状态或进入后台时，原生任务会终止；应用重新回到前台后，Promise 会被拒绝。

### Android

Android 网络任务始终可以在后台工作，不能通过 `sessionType` 改变这一行为。

## Android 文件共享：`content://`

Android 通常不允许直接把应用私有的 `file://` 地址交给其他应用访问。

可以转换为 `content://`：

```js
const contentUri =
  await FileSystem.getContentUriAsync(fileUri);
```

随后可交给 Android Intent：

```js
await IntentLauncher.startActivityAsync(
  'android.intent.action.VIEW',
  {
    data: contentUri,
    flags: 1,
  }
);
```

该 API：

- 仅支持 Android。
- 要求输入文件确实存在。
- 返回同一文件的 `content://` 表示形式。
- 主要用于让 Expo 应用之外的其他 Android 应用访问文件。

这类似于 Web 中把内部资源转换成可交给外部消费者的 URL，但 Android 的 URI 还涉及跨应用访问授权。

## Android Storage Access Framework

### SAF 解决什么问题

应用私有的 `documentDirectory` 和 `cacheDirectory` 不允许用户任意选择位置，也不能代表整个设备存储。

Android 的 Storage Access Framework（SAF）提供系统目录选择器。用户选择目录并授权后，应用可以访问该目录及其子目录。

典型 SAF URI 类似：

```text
content://com.android.externalstorage...
```

SAF 只适用于 Android。

### 请求目录权限

```js
const permissions =
  await StorageAccessFramework.requestDirectoryPermissionsAsync();

if (permissions.granted) {
  const directoryUri = permissions.directoryUri;
}
```

返回值是联合类型：

```ts
{ granted: false }
```

或：

```ts
{
  granted: true;
  directoryUri: string;
}
```

必须先判断 `granted`，不能假设 `directoryUri` 永远存在。

Android 11 及以上支持传入初始目录：

```js
await StorageAccessFramework.requestDirectoryPermissionsAsync(
  initialFileUrl
);
```

如果初始 URI 错误或目标不存在，系统会忽略它。

### SAF 文件和目录操作

创建目录：

```js
const directoryUri =
  await StorageAccessFramework.makeDirectoryAsync(
    parentUri,
    'new-directory'
  );
```

创建文件：

```js
const fileUri =
  await StorageAccessFramework.createFileAsync(
    parentUri,
    'report',
    'application/json'
  );
```

`fileName` 不包含扩展名，创建时还必须提供 MIME 类型。

列出目录：

```js
const uris =
  await StorageAccessFramework.readDirectoryAsync(directoryUri);
```

与普通 `FileSystem.readDirectoryAsync()` 不同，SAF 版本返回目录内容的**完整 SAF URI**，而不只是名称。

### SAF 写入限制

普通 `writeAsStringAsync()` 可以接受 SAF URI，但目标文件必须已经存在，不能用它直接创建新的 SAF 文件。

正确流程是：

1. 通过 `StorageAccessFramework.createFileAsync()` 创建文件。
2. 获取返回的 SAF URI。
3. 再通过 `writeAsStringAsync()` 写入内容。

### 迁移 Android 相册

文档示例的迁移流程是：

1. 通过 `getUriForDirectoryInRoot(albumName)` 生成根目录下相册文件夹的 SAF URI。
2. 请求用户授权目录访问。
3. 检查用户是否选择了预期目录。
4. 请求媒体库权限。
5. 将外部目录中的文件移动到应用 `documentDirectory`。
6. 从本地文件创建新的媒体资源。
7. 创建新相册。
8. 将其余资源加入相册。

这一流程说明：获得一个目录 URI 不等于应用自动获得全部外部存储权限，授权和媒体库写入权限需要分别处理。

## URI 支持范围

不同方法支持的 URI 不同，调用前必须检查来源和目标类型。

| 方法 | Android | iOS |
| --- | --- | --- |
| `getInfoAsync` | `file:///`、`content://`、`asset://`、无 scheme | `file://`、`ph://`、`assets-library://` |
| `readAsStringAsync` | `file:///`、`asset://`、SAF | `file://` |
| `writeAsStringAsync` | `file:///`、SAF | `file://` |
| `deleteAsync` | `file:///`、SAF | `file://` |
| `moveAsync` 来源 | `file:///`、SAF | `file://` |
| `moveAsync` 目标 | `file://` | `file://` |
| `copyAsync` 来源 | `file:///`、`content://`、`asset://`、SAF、无 scheme | `file://`、`ph://`、`assets-library://` |
| `copyAsync` 目标 | `file://` | `file://` |
| `makeDirectoryAsync` | `file:///` | `file://` |
| `readDirectoryAsync` | `file:///` | `file://` |
| `downloadAsync` 来源 | HTTP、HTTPS | HTTP、HTTPS |
| `downloadAsync` 目标 | `file:///` | `file://` |
| `uploadAsync` 来源 | `file:///` | `file://` |
| `uploadAsync` 目标 | HTTP、HTTPS | HTTP、HTTPS |
| `createDownloadResumable` 来源 | HTTP、HTTPS | HTTP、HTTPS |
| `createDownloadResumable` 目标 | `file:///` | `file://` |

Android 上不带 scheme 的 URI 默认表示应用打包资源。

最常见的误区是认为所有 `content://` URI 都能直接读取。实际上：

- `getInfoAsync()` 支持普通 `content://`。
- `copyAsync()` 可以将其复制到应用本地。
- `readAsStringAsync()` 不能处理任意普通 `content://`，只明确支持 SAF URI 等列出的类型。

因此，处理其他应用返回的 `content://` 资源时，复制到 `documentDirectory` 或 `cacheDirectory` 往往是更通用的处理方式。该结论属于**基于文档内容推导**。

## 磁盘容量

获取设备内部存储总容量：

```js
const total = await FileSystem.getTotalDiskCapacityAsync();
```

获取可用容量：

```js
const free = await FileSystem.getFreeDiskStorageAsync();
```

单位均为字节。

这里返回的是承载所有应用内部存储的数据分区容量，不是当前应用单独可独占的配额。

## 权限

### Android

库的 `AndroidManifest.xml` 会自动添加：

- `READ_EXTERNAL_STORAGE`
- `WRITE_EXTERNAL_STORAGE`
- `INTERNET`

开发者不需要仅为了使用此库而手动重复声明这些权限。

但“Manifest 中声明权限”不等于“用户已经授予某个外部目录访问权”。SAF 目录仍需要通过系统选择器获得用户授权。

### iOS

文档说明不需要额外权限。

这指 FileSystem 本身的文件操作。若文件来源涉及相册、相机等其他系统能力，相应模块仍可能有自己的权限要求。此结论属于**基于文档内容推导**。

## API 分类速查

### 文件和目录

| API | 作用 |
| --- | --- |
| `getInfoAsync()` | 查询文件、目录或资源信息 |
| `makeDirectoryAsync()` | 创建本地目录 |
| `readDirectoryAsync()` | 列出本地目录内容 |
| `readAsStringAsync()` | 将整个文件读取为字符串 |
| `writeAsStringAsync()` | 以字符串形式覆盖或追加文件 |
| `copyAsync()` | 复制文件或递归复制目录 |
| `moveAsync()` | 移动文件或目录 |
| `deleteAsync()` | 删除文件或递归删除目录 |

### 网络文件传输

| API | 作用 |
| --- | --- |
| `downloadAsync()` | 一次性下载文件 |
| `createDownloadResumable()` | 创建支持暂停、恢复和进度的下载任务 |
| `uploadAsync()` | 一次性上传文件 |
| `createUploadTask()` | 创建支持进度和取消的上传任务 |

### Android 专用能力

| API | 作用 |
| --- | --- |
| `getContentUriAsync()` | 将本地 `file://` 转成可供其他应用访问的 `content://` |
| `StorageAccessFramework.*` | 请求并操作用户授权的外部目录 |

### 网络任务类

- `DownloadResumable`：下载、暂停、恢复、取消和生成可保存状态。
- `UploadTask`：上传和取消。
- `FileSystemCancellableNetworkTask`：提供 `cancelAsync()` 的公共基类。

## 已弃用类型

以下类型被文档标记为 deprecated：

- `DownloadProgressCallback`：改用 `FileSystemNetworkTaskProgressCallback<DownloadProgressData>`。
- `DownloadResult`：改用 `FileSystemDownloadResult`。

legacy API 本身是为了向后兼容，但即使继续使用 legacy 入口，也应避免继续引入已经单独标记为 deprecated 的类型。

## 关键限制与坑点

1. **父目录不会自动创建**  
   下载目标目录必须提前存在。

2. **缓存文件可能被系统删除**  
   `cacheDirectory` 不能承担永久存储职责。

3. **同名下载目标会被覆盖**  
   `downloadAsync()` 和可恢复下载会替换目标文件已有内容。

4. **删除目录是递归操作**  
   `deleteAsync()` 指向目录时会删除全部内容。

5. **URI 类型决定 API 是否可用**  
   `file://`、`content://` 和 SAF URI 不能随意互换。

6. **SAF 写入不能自动创建文件**  
   必须先调用 `StorageAccessFramework.createFileAsync()`。

7. **下载总大小可能未知**  
   没有 `Content-Length` 时，不能显示可靠的百分比进度。

8. **后台时进度回调可能停更**  
   不应把 JavaScript 回调是否执行当作原生任务是否仍在运行的唯一依据。

9. **取消任务后结果可能是 `undefined`**  
   调用方需要进行空值处理。

10. **上传模式必须与服务端协议一致**  
    二进制请求体和 multipart 表单的服务端解析方式不同。

11. **平台能力不完全一致**  
    SAF 和 `getContentUriAsync()` 是 Android 专用；`sessionType` 配置只对 iOS 有意义。

12. **Expo Go 项目之间互相隔离**  
    一个项目不能读取另一个 Expo Go 项目的文件。

## React Web 开发者最容易误解的地方

### 本地 URI 不是可公开访问的 URL

`file://` URI 只是在设备本地标识文件，不能直接发送给后端作为可下载地址，也不能假设其他应用能够读取它。

上传文件时需要让原生模块读取该 URI 指向的内容，并真正发送文件字节。

### 文件持久化不等于组件状态持久化

React state、Context 或 Redux 保存的是 JavaScript 状态；FileSystem 保存的是设备上的文件。组件卸载不会自动删除文件，反过来文件存在也不会自动恢复界面状态。

### `AsyncStorage` 不是文件存储替代品

文档使用 AsyncStorage 保存的是可恢复下载的少量元数据，不是视频或图片本身。

大型二进制内容应保存为文件，AsyncStorage 更适合保存 URI、任务状态和业务元数据。

### “进入后台”不是切换浏览器标签页

移动端进入后台可能导致 JavaScript 执行暂停，甚至进程被系统终止。网络任务是否继续由原生平台和会话类型决定，不能只依赖 React 组件生命周期。

### 路径拼接要考虑结尾斜杠

`documentDirectory` 明确以 `/` 结尾，因此可以直接拼接：

```js
FileSystem.documentDirectory + 'reports/report.json'
```

但其他 API 返回的目录 URI 是否带 `/`，不能仅凭经验假设。

> **基于经验建议：** 将 URI 拼接集中到少量工具函数中，并为文件名进行校验，避免散落的字符串拼接。

## 实际开发建议

以下内容属于**基于经验建议**：

- 新项目先确认现代 FileSystem API 是否已经覆盖需求，只有兼容旧代码时再继续依赖 legacy API。
- 将文件目录按用途拆分，例如 `images/`、`downloads/`、`exports/`，不要把所有文件直接放在根目录。
- 下载前检查父目录，下载后检查 HTTP 状态和文件信息。
- 对重要下载启用 MD5，并与可信来源提供的摘要进行比较。
- 对缓存文件设计重新下载机制，不要假设缓存永远存在。
- 为上传和下载任务提供取消入口，并处理应用进入后台后的界面状态。
- 不要把访问令牌写入文件名、URI、日志或错误上报。
- 使用 SAF 时，将“请求授权被拒绝”视为正常业务分支。
- 批量下载应控制并发数量，并记录单个文件的失败结果。
- 删除目录前再次确认 URI，特别是执行递归删除时。
- 将平台专用逻辑封装起来，例如只在 Android 调用 SAF 或 `getContentUriAsync()`。

## 文档明确说明与推导内容

### 文档明确说明

- legacy API 包含在 `expo-file-system` 中，可与现代 API 共存。
- 应用主要读写 `documentDirectory` 和 `cacheDirectory`。
- `cacheDirectory` 中的文件可能被系统自动删除。
- 下载目标目录必须提前存在。
- 可恢复下载能够通过保存 `savable()` 状态跨应用重启恢复。
- 后台时下载进度回调不会触发，直到应用回到前台。
- SAF 允许 Android 用户选择目录并授予访问权限。
- 不同 API 支持的 URI scheme 不同。
- Android 自动声明相关存储和网络权限；iOS 无额外 FileSystem 权限要求。

### 基于文档内容推导

- 处理来源复杂的 Android `content://` 资源时，可以先复制到应用本地目录，再使用只支持 `file://` 的 API。
- 可恢复下载虽然保存了恢复数据，但不能由此断言所有服务器都支持断点续传。
- 相册、相机等文件来源可能仍需要对应模块自己的权限，即使 FileSystem 在 iOS 上不要求额外权限。
- 文件 URI 应与业务元数据分别管理：文件保存在文件系统，URI、下载状态等信息保存在状态存储中。

## 总结

Expo FileSystem legacy API 是一组面向设备文件的旧版兼容接口。掌握它的关键不是记住所有方法，而是理解四个边界：

1. 应用只能直接操作自己有权访问的存储区域。
2. 不同 URI scheme 对应不同资源来源和访问方式。
3. 文件传输任务受到移动端前后台生命周期影响。
4. Android 外部文件访问需要通过 `content://`、SAF 和用户授权处理。

实际开发时，先确定文件应该存入缓存目录还是文档目录，再根据 URI 类型选择支持它的 API，并对目录不存在、权限拒绝、任务取消、进度未知和平台差异进行显式处理。

---

## 文档导航

- **上一页**：[filesystem](./169__filesystem.md)
- **下一页**：[fingerprint](./171__fingerprint.md)
