# 161｜Expo SDK FileSystem 文件系统

**翻页：**[上一页：Expo SDK DocumentPicker 文档选择器](./160-Expo-SDK-DocumentPicker.md) · [目录](./README.md) · [下一页：Expo SDK FileSystem（legacy）](./162-Expo-SDK-FileSystem-Legacy.md)

**官方页面：**[FileSystem · Latest](https://docs.expo.dev/versions/latest/sdk/filesystem/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/filesystem/)

**版本与平台：**Latest 推荐 `expo-file-system ~57.0.7`；SDK v56.0.0 推荐 `~56.0.11`。文档列出 Android、iOS、tvOS，并标记可在 Expo Go 中使用。项目当前以 SDK v56 为准，安装时使用 `npx expo install expo-file-system`，让 Expo 选择与 SDK 匹配的版本；Latest 示例只作为对照。

## 先理解 Expo 文件 URI

`expo-file-system` 让 JavaScript 代码读写设备本地文件、列出目录、访问随 App 打包的资源，以及上传和下载文件。它不像 Web 的 `fs` 一样使用 Node 路径；文件由 URI 标识，常见前缀有应用内部的 `file://`，以及 Android Storage Access Framework（SAF，系统授权访问文档时使用）的 `content://`。

- `File` / `Directory` 是 URI 的对象引用。创建对象不代表磁盘上已经存在对应内容；用错类型指向现有目录/文件时，才会在构造时报告类型错误。
- `Paths.cache` 是可由系统清理的缓存位置；`Paths.document` 用于需要保留的应用文档；`Paths.bundle` 指向随原生 App 打包的资源目录。
- `File` 同时实现 Blob 接口，因此可以读成字符串、字节或流，也能直接作为 `fetch` 请求体。
- 同步方法返回时就完成读写，适合非常小的本地数据；大文件优先用异步 `text()` / `bytes()`、流或 `FileHandle`，避免阻塞 JS 线程。
- 写入、移动、删除等操作需要系统授予的文件访问能力。用户选择到的 URI 不一定等同于应用私有目录中的普通路径。

## 安装与 iOS 配置

安装时保持 SDK 对齐：

```sh
npx expo install expo-file-system
```

如果需要让用户通过 iOS「文件」App 访问应用文档，或允许文档在原位置打开，可在 `app.json` 使用 config plugin。Config plugin 会在生成原生工程时写入原生配置；这类设置不是运行时开关，变更后需要重新生成 / 构建原生 App。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-file-system",
        {
          "supportsOpeningDocumentsInPlace": true,
          "enableFileSharing": true
        }
      ]
    ]
  }
}
```

两个选项仅对 iOS 有效，默认均为 `false`：`supportsOpeningDocumentsInPlace` 对应 Info.plist 的 `LSSupportsOpeningDocumentsInPlace`；`enableFileSharing` 对应 `UIFileSharingEnabled`，让应用 `Documents` 目录可通过「文件」App、iTunes File Sharing 等方式查看。手动维护 iOS 原生工程且未使用 CNG 时，需要把键写入 `ios/<App>/<App>/Info.plist`：

```xml
<key>LSSupportsOpeningDocumentsInPlace</key>
<true/>
<key>UIFileSharingEnabled</key>
<true/>
```

## 常见用法

### 创建、写入和读取文本

`create()` 创建目标，`write()` 写入字符串，`text()` 异步读取；目标已存在或没有权限时应捕获异常。

```ts
import { File, Paths } from 'expo-file-system';

async function saveNote() {
  const file = new File(Paths.cache, 'example.txt');
  try {
    file.create();
    file.write('Hello from Expo FileSystem');
    const text = await file.text();
    console.log(text);
  } catch (error) {
    console.error('文件创建或读写失败', error);
  }
}
```

### 从 DocumentPicker 读取选中文件

Android / iOS 选出的文件可能来自系统文档提供者，不一定一开始就在 App 私有目录。`copyToCacheDirectory: true` 让 DocumentPicker 复制一份到 cache，便于 FileSystem 立即读取。必须先处理取消结果：

```ts
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

async function chooseTextFile() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: 'text/plain',
  });

  if (result.canceled) return;

  const pickedFile = new File(result.assets[0].uri);
  console.log(await pickedFile.text());
}
```

### 使用 FileSystem 内建文件选择器

源页把内建 picker 示例放在 Android 文件 / 目录选择说明下，但代码展示的是文件选择。源代码片段写成 `new File.pickFileAsync()`；API 参考明确这是静态异步方法，下面按其签名改写为 `await File.pickFileAsync()`。Latest API 的取消与成功结果通过 `canceled` 区分：

```ts
import { File } from 'expo-file-system';

async function pickTextFile() {
  const result = await File.pickFileAsync({ mimeTypes: ['text/plain'] });
  if (result.canceled) return;

  console.log(result.result.uri);
  console.log(await result.result.text());
}
```

多选版本必须传 `multipleFiles: true`，成功时 `result` 是 `File[]`：

```ts
const selection = await File.pickFileAsync({
  multipleFiles: true,
  mimeTypes: ['image/*', 'application/pdf'],
});

if (!selection.canceled) {
  for (const file of selection.result) {
    console.log(file.name, file.uri);
  }
}
```

### 下载到 cache

`File.downloadFileAsync(url, destination)` 是直接下载的便捷方法。若 destination 是目录，文件名由响应头或 URL 推断；目录需先创建。

```ts
import { Directory, File, Paths } from 'expo-file-system';

async function downloadPdf() {
  const destination = new Directory(Paths.cache, 'pdfs');
  destination.create({ idempotent: true, intermediates: true });

  const file = await File.downloadFileAsync(
    'https://example.com/guide.pdf',
    destination
  );
  console.log(file.exists, file.uri);
}
```

也可以用 Expo 提供的 `expo/fetch` 获取响应字节，再写到 `File`：

```ts
import { fetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';

async function downloadBytes() {
  const response = await fetch('https://example.com/guide.pdf');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const target = new File(Paths.cache, 'guide.pdf');
  target.create({ intermediates: true, overwrite: true });
  target.write(await response.bytes());
}
```

### 上传文件

文件可以直接作为请求体，也可以放进 `FormData`。前一种适合服务端期待原始二进制 body 的接口；后一种用于 `multipart/form-data` 表单上传。

```ts
import { fetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';

const file = new File(Paths.cache, 'report.txt');
file.create({ overwrite: true });
file.write('Report contents');

const binaryResponse = await fetch('https://example.com/upload-binary', {
  method: 'POST',
  body: file,
});

const form = new FormData();
form.append('attachment', file);
const multipartResponse = await fetch('https://example.com/upload-form', {
  method: 'POST',
  body: form,
});
```

若需要进度回调、取消或检查任务状态，可改用 `file.createUploadTask()`：

```ts
import { File, Paths, UploadType } from 'expo-file-system';

const photo = new File(Paths.document, 'photo.jpg');
const task = photo.createUploadTask('https://example.com/upload', {
  uploadType: UploadType.MULTIPART,
  onProgress: ({ bytesSent, totalBytes }) => {
    console.log(`${bytesSent} / ${totalBytes}`);
  },
});
const result = await task.uploadAsync();
console.log(result.status, result.body);
```

### 复制、移动与 URI

复制会留下源文件；移动后 `file.uri` 更新为新位置。将 `File` / `Directory` 对象传给目的参数比手工拼接 URI 更安全：

```ts
import { Directory, File, Paths } from 'expo-file-system';

const source = new File(Paths.document, 'example.txt');
source.create({ overwrite: true });

const copied = new File(Paths.cache, 'example-copy.txt');
await source.copy(copied);
console.log(copied.uri);

await source.move(new Directory(Paths.cache, 'newFolder'));
console.log(source.uri);
```

### 旧版 API 与新版类互操作

当前主入口提供 `File` / `Directory` 类。迁移旧项目时可从 `expo-file-system/legacy` 单独导入旧函数；这不等于旧函数仍应从包主入口调用：

```ts
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system';

const file = new File(Paths.cache, 'example.txt');
const contents = await FileSystemLegacy.readAsStringAsync(file.uri);
console.log(contents);
```

### 递归列出目录

`Directory.list()` 返回 `File | Directory` 联合数组。运行时可用 `instanceof Directory` 分流并递归进入子目录：

```ts
import { Directory, Paths } from 'expo-file-system';

function printTree(directory: Directory, indent = 0) {
  console.log(`${' '.repeat(indent)}+ ${directory.name}`);
  for (const item of directory.list()) {
    if (item instanceof Directory) {
      printTree(item, indent + 2);
    } else {
      console.log(`${' '.repeat(indent + 2)}- ${item.name} (${item.size} bytes)`);
    }
  }
}

try {
  printTree(new Directory(Paths.cache));
} catch (error) {
  console.error('目录不存在或无法读取', error);
}
```

## 核心 API

### `Directory`

构造形式 `new Directory(...segments)` 会拼接 URI；首段可传 `Paths.cache` 等 `Directory` 实例。对象可以先表示一个尚不存在的路径，再调用 `create()`。

| 成员 | 作用 |
| --- | --- |
| `exists`, `size`, `uri`, `name`, `parentDirectory` | 是否可访问、目录大小、URI、名称和父目录。`size` 不可读 / 不存在时为 `null`；移动后 URI 会变化。 |
| `create(options?)` / `createDirectory(name)` / `createFile(name, mimeType)` | 创建目录本身，或创建子目录 / 文件并返回对应对象。 |
| `list()` / `info()` | 枚举子项；若父目录不存在，`list()` 会抛错。`info()` 返回元数据。 |
| `copy(destination, options?)` / `copySync(...)` | 复制目录；异步与同步版本分别返回 Promise / `void`。 |
| `move(destination, options?)` / `moveSync(...)` / `rename(newName)` | 移动或改名；移动后对象的 `uri` 指向新位置。 |
| `delete()` | 删除目录及其所有子项，操作不可逆，调用前应确认目标 URI。 |
| `watch(callback, options?)` | 监听目录变化并返回订阅；用 `subscription.remove()` 停止。 |

目录 watcher 的核心用法：

```ts
import { Directory, Paths } from 'expo-file-system';

const cacheDirectory = new Directory(Paths.cache);
const subscription = cacheDirectory.watch((event) => {
  console.log(event.type, event.target.uri);
});

// 不再需要监听时释放订阅。
subscription.remove();
```

iOS 目录 watcher 对子项变化会发出较粗粒度的目录 `modified` 通知；不要假定可以可靠筛选每个子项的 create / delete / rename。目录自身删除或改名时 watcher 会自动停止。

### `File`

`new File(...segments)` 接受 URI 字符串、`Directory` 或 `File` 作为路径段；`File` 实现 Blob。

```ts
const nestedFile = new File(Paths.cache, 'subdirName', 'file.txt');
```

| 成员 | 作用 |
| --- | --- |
| `exists`, `size`, `type`, `extension`, `name`, `uri`, `parentDirectory` | 文件是否可访问、字节大小、MIME type、扩展名、名称、URI 和父目录。无读权限时 `exists` 也可能为 `false`，大小为 `0`，type 为空字符串。 |
| `creationTime`, `lastModified` / `modificationTime` | Unix epoch 毫秒时间；不可读或不存在时可为 `null`。Android API 26 以前的 `creationTime` 也可能为空。 |
| `contentUri` | Android `content://` URI，可用于向外部应用分享文件。 |
| `md5` | MD5 元数据已被文档标为 deprecated，推荐用 `lastModified` 判断文件是否变化。 |
| `create(options?)`, `delete()`, `rename(newName)` | 创建、删除或重命名文件。 |
| `copy(destination, options?)` / `copySync(...)`; `move(destination, options?)` / `moveSync(...)` | 复制 / 移动；同步方法会阻塞调用线程。移动会更新 `uri`。 |
| `text()` / `textSync()`; `bytes()` / `bytesSync()`; `base64()` / `base64Sync()` | 读取文本、`Uint8Array` 字节或 Base64 内容，带 `Sync` 的版本同步返回。 |
| `arrayBuffer()`, `slice()`, `stream()`, `readableStream()`, `writableStream()` | Blob 风格的二进制缓冲区、切片与流接口。 |
| `write(content, options?)`, `formData()`, `json()` | 写字符串 / 字节，生成 FormData，或将 JSON 文件解析为值。 |
| `open(mode?)` | 打开 `FileHandle` 供分段读写；Android SAF `content://` 不支持 `ReadWrite`。 |
| `upload(url, options?)` | 立即上传并返回 HTTP 状态、headers、body。完成的非 2xx 响应也会正常返回；网络 / 文件 / 取消错误才 reject。 |
| `watch(callback, options?)` | 监听文件变化，返回 `WatchSubscription`。 |
| `createDownloadTask(url, destination, options?)` | 创建但不立即启动可暂停 / 恢复的下载任务。 |
| `createUploadTask(url, options?)` | 创建可取消、可监听进度的上传任务。 |
| `File.downloadFileAsync(url, directory, options?)` | 直接下载到目录并返回 `File`。 |
| `File.pickFileAsync(options?)` | 打开系统文件选择器，返回成功 / 取消判别联合。 |

文件 watcher 示例：

```ts
import { File, Paths } from 'expo-file-system';

const watchedFile = new File(Paths.cache, 'data.json');
const fileSubscription = watchedFile.watch((event) => {
  console.log(`文件事件：${event.type}`);
});

// 页面卸载或不再监听时调用。
fileSubscription.remove();
```

下载任务示例：

```ts
import { File, Paths } from 'expo-file-system';

const target = new File(Paths.document, 'video.mp4');
const downloadUrl = 'https://example.com/video.mp4';
const downloadTask = File.createDownloadTask(
  downloadUrl,
  target,
  {
    onProgress: ({ bytesWritten, totalBytes }) => {
      console.log(bytesWritten, totalBytes);
    },
  }
);
const downloadedFile = await downloadTask.downloadAsync();
```

> 上面按 API 参考的 `File.createDownloadTask(url, destination, options)` 形式展示。Latest 源页的示例调用与参数表排版可能不一致，应以本地 SDK 对应的 TypeScript 类型和精确版本参考为准。

上传任务示例见前面的「上传文件」代码；API 参考列出的 `onProgress` 回调数据是 `{ bytesSent, totalBytes }`。

### 下载与上传任务生命周期

`DownloadTask` 支持 `idle → active → paused → completed / cancelled / error`。`downloadAsync()` 在 `idle` 时启动；`pause()` 请求暂停，`pauseAsync()` 等待暂停完成；`resumeAsync()` 继续任务；`cancel()` 取消；`addListener('progress', ...)` 可订阅进度，但通常使用 `options.onProgress` 更直接。任务只有在暂停时才能调用 `savable()` 取得可序列化的 `DownloadPauseState`；重启后用 `DownloadTask.fromSavable(state, options?)` 恢复。回调与 AbortSignal 不会保存，需在恢复时重新传入。`release()` 在不再需要任务时释放原生资源。

任务状态可持久化的基本形态：

```ts
import { DownloadTask, File, Paths } from 'expo-file-system';

const targetFile = new File(Paths.document, 'archive.zip');
const downloadUrl = 'https://example.com/archive.zip';
const onProgress = ({ bytesWritten, totalBytes }) => {
  console.log(bytesWritten, totalBytes);
};
const task = File.createDownloadTask(downloadUrl, targetFile, { onProgress });
const pendingDownload = task.downloadAsync();

// 由界面上的暂停操作触发；暂停后才能保存可恢复状态。
await task.pauseAsync();
const pausedResult = await pendingDownload; // 暂停时通常是 null
const savedState = task.savable();
const restored = DownloadTask.fromSavable(savedState, { onProgress });
await restored.resumeAsync();
```

`UploadTask` 的状态为 `idle → active → completed / cancelled / error`，不支持暂停。它提供 `addListener('progress', ...)`、`uploadAsync()`、`cancel()` 和 `release()`。`UploadResult` 的 `status`、`headers`、`body` 描述服务端已完成的响应；不要把 HTTP 4xx / 5xx 等同于传输异常。

### `Paths` 与路径工具

`Paths` 类提供常用目录以及路径操作方法：

| 属性 / 方法 | 用途 |
| --- | --- |
| `bundle`, `cache`, `document` | App 资源包目录、可被系统清理的缓存目录、应用文档目录。 |
| `availableDiskSpace`, `totalDiskSpace` | 设备内部存储可用 / 总字节数。 |
| `appleSharedContainers` | iOS 可访问的 Apple shared container 映射。 |
| `basename(path, ext?)`, `dirname(path)`, `extname(path)` | 取路径文件名、父路径或扩展名。 |
| `join(...paths)`, `normalize(path)`, `isAbsolute(path)` | 拼接、规范化并判断绝对路径。 |
| `parse(path)` | 拆出 `root`、`dir`、`base`、`ext`、`name`。 |
| `relative(from, to)` | 根据起点与目标计算路径。 |
| `info(...uris)` | 查询路径是否存在、是否为目录。 |

### `FileHandle`

`file.open(mode?)` 返回 `FileHandle`，其 `offset` 是读写游标，`size` 是文件字节数；关闭后相关值可能为 `null`。`readBytes(length)` 从当前游标读取指定长度，`writeBytes(bytes)` 从当前游标写入并推进游标；结束后调用 `close()`，释放句柄以便其它进程访问文件。

`FileMode` 包括 `ReadOnly` (`r`)、`ReadWrite` (`rw`)、`WriteOnly` (`w`)、`Append` (`wa`) 和 `Truncate` (`wt`)。SAF `content://` URI 默认只读，不能以 `ReadWrite` 打开；`Append` 是严格追加模式；`Truncate` 会清空原内容。

## 旧的模块级 `FileSystem.*Async` 方法

Latest 文档将旧模块级方法列为 deprecated。不要从包主入口直接使用这些旧函数；迁移代码应从 `expo-file-system/legacy` 导入旧 API，或切换到新类接口。主要方法和新接口对应关系：

| 旧 API | 新接口方向 |
| --- | --- |
| `copyAsync` / `moveAsync` | `File.copy()` / `Directory.copy()` 与 `.move()` |
| `createDownloadResumable` | `File.createDownloadTask()` 与 `DownloadTask` |
| `createUploadTask` / `uploadAsync` | `File.createUploadTask()` 或 `File.upload()` |
| `downloadAsync` | `File.downloadFileAsync()` 或 `File.createDownloadTask()` |
| `deleteAsync` | `File.delete()` / `Directory.delete()` |
| `makeDirectoryAsync` / `readDirectoryAsync` | `Directory.create()` / `Directory.list()` |
| `getInfoAsync` | `File.info()` / `Directory.info()` |
| `readAsStringAsync` / `writeAsStringAsync` | `File.text()` / `File.write()` |
| `getFreeDiskStorageAsync` / `getTotalDiskCapacityAsync` | `Paths.availableDiskSpace` / `Paths.totalDiskSpace` |
| `getContentUriAsync` | Android 上使用 `File.contentUri` |
| `deleteLegacyDocumentDirectoryAndroid` | 旧的 Android 清理入口；文档未给一对一的新方法。 |

## 类型与枚举速查

| 类型 | 关键字段 / 行为 |
| --- | --- |
| `DirectoryCreateOptions` | `idempotent`（已存在时不报错）、`intermediates`（递归创建父目录）、`overwrite`；默认均为 `false`。 |
| `FileCreateOptions` | `intermediates`、`overwrite`；默认 `false`。 |
| `RelocationOptions` | `overwrite`，决定复制 / 移动目标已存在时是否覆盖，默认 `false`。 |
| `DirectoryInfo` / `FileInfo` | `exists` 与可选 `creationTime`、`modificationTime`、`size`、`uri`；文件信息还可包含启用后返回的 `md5`，目录信息可带 `files`。 |
| `InfoOptions` | `md5` 布尔项，默认 `false`。 |
| `DownloadOptions` / `DownloadTaskOptions` | 请求 `headers`、`onProgress`、`AbortSignal`；任务选项还可通过 iOS `sessionType` 设定原生网络会话前台 / 后台行为。 |
| `DownloadProgress` | `bytesWritten`、`totalBytes`；服务端无 `Content-Length` 时 `totalBytes` 可为 `-1`。 |
| `DownloadPauseState` | URL、目标 URI、是否目标为目录、headers 及平台恢复数据；保存时不包含 JS 回调或 abort signal。 |
| `DownloadTaskState` | `idle`、`active`、`paused`、`completed`、`cancelled`、`error`。 |
| `UploadOptions` | `fieldName`（multipart 字段名，默认 `file`）、`headers`、`httpMethod`（POST / PUT / PATCH，默认 POST）、`mimeType`、`onProgress`、`sessionType`、`signal`、`uploadType`。 |
| `UploadProgress` / `UploadResult` | 进度为 `bytesSent` / `totalBytes`；响应含 `status`、`headers`、字符串 `body`。 |
| `UploadTaskState` | 除 paused 外的 `idle`、`active`、`completed`、`cancelled`、`error`。 |
| `PickFileGeneralOptions` | `initialUri`、`mimeTypes`（支持 `image/*` 等通配符）、`multipleFiles`。 |
| `PickSingleFileOptions` / `PickMultipleFilesOptions` | 单选要求 `multipleFiles` 缺省或 `false`；多选要求为 `true`。 |
| `PickSingleFileResult` / `PickMultipleFilesResult` | 成功时 `{ canceled: false, result: File 或 File[] }`；取消时 `{ canceled: true, result: null }`。这是 TypeScript 判别联合，检查 `canceled` 后再读取 `result`。 |
| `PathInfo` | `exists` 与 `isDirectory`；路径不可访问 / 不存在时后者可为 `null`。 |
| `WatchOptions` / `WatchEvent` / `WatchSubscription` | debounce 默认 100ms，可过滤 `created`、`modified`、`deleted`、`renamed`；事件包含 `type` / `target`，Android 可提供 `newTarget`；订阅的 `remove()` 停止监听。 |

枚举：`EncodingType.UTF8` / `Base64` 决定文本编码；`FileMode` 决定打开文件句柄的读写方式；`UploadType.BINARY_CONTENT` 将文件作为原始请求体，`UploadType.MULTIPART` 用 multipart/form-data 上传。

## Latest 与 SDK v56 差异

- 安装推荐版本不同：Latest `~57.0.7`，SDK v56 `~56.0.11`。本地 Expo SDK v56 项目应按 SDK 版本匹配依赖，不要因阅读 Latest 而升级 API 包。
- v56 页面额外导出 `FileSystem.DEFAULT_DEBOUNCE_MS`（文档类型标注 `'100'`），作为 watcher 默认 debounce；Latest 不再列出该常量，改为 `WatchOptions.debounce` 默认 `100`。
- v56 单独列出 `PickFileCanceledResult`、`PickSingleFileSuccessResult`、`PickMultipleFilesSuccessResult` 等结果类型；Latest 将相同的成功 / 取消结构内联在 `PickSingleFileResult` / `PickMultipleFilesResult` 中。
- v56 `UploadTask` 参考页还列出 `emit`、`listenerCount`、`removeAllListeners`、`removeListener` 和 `start` 等事件发射器方法；Latest 页面只列 `addListener`、`cancel`、`release`、`uploadAsync`。新代码以安装版本的类型定义为准，不依赖仅出现在 v56 页面中的成员。
- 两版都有 `File.md5` 的弃用提示、现代 `File` / `Directory` API、系统 picker、上传下载任务与 FileSystem (legacy) 的 Next 导航。

## 源页代码主题覆盖

- Installation：保留 Expo 对齐安装命令。
- Config plugin：覆盖 `supportsOpeningDocumentsInPlace` / `enableFileSharing` 的 app config JSON、两个 iOS Info.plist key 与不使用 CNG 时的手动配置。
- Usage 与 Examples：逐类覆盖文本文件写读、DocumentPicker 到 File、内建系统 picker、`File.downloadFileAsync`、`expo/fetch` 下载 bytes、以文件作为 fetch body、FormData 上传、文件复制 / 移动、`expo-file-system/legacy` 互操作和递归列目录。
- API 示例：覆盖 `Directory` 构造、目录 `watch` / `remove()`、`File` 构造、`createDownloadTask` / 进度回调、`createUploadTask` / multipart 进度、单 / 多文件 picker 与 File watcher / 取消订阅。
- API 参考：覆盖 `Directory`、`File`、`Paths`、`DownloadTask`、`UploadTask`、`FileHandle` 的成员组，旧模块级方法清单与现代替代方向、结果类型、任务状态、选项和枚举。重复的 CRUD 代码路径按方法组归纳，独有参数与行为分别列出。
- 版本校对：链接并对照 Latest 与 SDK v56.0.0 页面，列明版本推荐、watch debounce 常量、picker result 类型和 UploadTask 方法差异。

**翻页：**[上一页：Expo SDK DocumentPicker 文档选择器](./160-Expo-SDK-DocumentPicker.md) · [目录](./README.md) · [下一页：Expo SDK FileSystem（legacy）](./162-Expo-SDK-FileSystem-Legacy.md)
