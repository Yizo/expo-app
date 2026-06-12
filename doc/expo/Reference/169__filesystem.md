# Expo FileSystem 学习指南

> 原文档修改日期：2026 年 5 月 27 日  
> 适用平台：Android、iOS、tvOS，并包含在 Expo Go 中  
> 包名：`expo-file-system`
>
> **版本提醒：**原文属于下一个 Expo SDK 版本的未发布文档；当前最新稳定文档对应 SDK 56。实际项目应根据所使用的 Expo SDK 版本核对 API。

## 文档解决的问题

`expo-file-system` 为 Expo 和 React Native 应用提供设备本地文件系统访问能力，主要用于：

- 创建、读取、修改、复制、移动和删除文件或目录。
- 保存缓存文件和需要长期保留的文档。
- 访问打包进原生应用的资源。
- 从网络下载文件以及向服务器上传文件。
- 使用系统文件选择器选择文件。
- 监听文件和目录变化。
- 通过流或 `FileHandle` 分段读写二进制数据。
- 管理支持暂停、恢复、取消和进度监听的网络传输任务。

它解决的是移动应用中的本地文件管理问题。React Web 中通常由浏览器限制文件系统访问，而 React Native 应用可以通过原生模块访问应用沙盒内的目录以及用户授权的外部文件。

## 阅读前需要理解的背景

### 应用沙盒

移动应用通常只能直接访问系统分配给自己的存储区域，不能像 Node.js 程序一样任意读取整个设备。

`Paths.cache` 和 `Paths.document` 都属于应用可访问的目录，但用途不同：

- `Paths.cache`：缓存目录。系统存储不足时可以删除其中的文件。
- `Paths.document`：文档目录。适合保存不应被系统自动清理的数据。
- `Paths.bundle`：应用安装包中的资源目录，保存随应用一起打包的资源。

这与 React Web 中的 `localStorage`、IndexedDB 或浏览器 Cache API 不同：这里操作的是实际文件和目录，并使用 URI 标识位置。

### URI 不一定是普通文件路径

API 使用 `uri` 表示文件位置，常见形式包括：

- `file://`：应用可以直接访问的文件系统 URI。
- `content://`：Android Storage Access Framework（SAF）提供的内容 URI。

`content://` 不是普通磁盘路径，能力可能受内容提供方限制。例如，它不支持 `FileMode.ReadWrite`。

### 同步与异步 API

该库同时提供同步和异步方法，例如：

- `file.text()` 与 `file.textSync()`
- `file.write()` 与 `file.writeSync()`
- `file.copy()` 与 `file.copySync()`

同步调用会阻塞当前 JavaScript 执行。对于大文件或频繁操作，通常应优先使用异步 API，避免影响界面响应。

> **基于经验建议：**同步 API 更适合少量、很小且必须立即取得结果的数据。大文件读写、复制和移动应优先使用异步 API。

### MIME 类型

MIME 类型描述文件内容，例如：

- `image/*`：任意图片。
- `application/pdf`：PDF 文件。
- `*/*`：任意文件。

它既用于文件选择器过滤，也可用于上传时声明文件类型。MIME 类型不能仅靠扩展名完全可靠地判断。

## 安装

根据项目使用的包管理器执行：

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

`expo install` 会选择与当前 Expo SDK 兼容的依赖版本，比直接运行 `npm install` 更适合 Expo 项目。

如果是在已有的纯 React Native 工程中使用，还必须先安装并配置 Expo Modules 所需的 `expo` 包。

## 原生配置

### 使用 Config Plugin

采用 Continuous Native Generation（CNG）的项目，可以在 `app.json` 中使用内置 Config Plugin：

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

Config Plugin 用于修改 iOS、Android 等原生工程配置。这里的设置不能在 JavaScript 运行时动态改变，修改后需要重新构建应用二进制文件。

两个配置目前都只影响 iOS：

| 配置 | 默认值 | 作用 |
| --- | --- | --- |
| `supportsOpeningDocumentsInPlace` | `false` | 设置 `LSSupportsOpeningDocumentsInPlace`，允许应用直接在文件原位置打开文档 |
| `enableFileSharing` | `false` | 设置 `UIFileSharingEnabled`，让应用的 Documents 目录可通过 iOS“文件”应用、iTunes 文件共享等工具访问 |

`enableFileSharing` 并不是 JavaScript 中的“共享文件”函数，而是决定用户和外部文件管理工具能否看到应用的 Documents 目录。

### 手动维护 iOS 原生工程

如果项目不使用 CNG，或者手动维护 `ios` 工程，需要在 `ios/[app]/Info.plist` 中加入：

```xml
<key>LSSupportsOpeningDocumentsInPlace</key>
<true/>
<key>UIFileSharingEnabled</key>
<true/>
```

当前文档没有说明 Android 需要对应的静态配置。

## 核心对象模型

推荐的新 API 以对象为中心：

```ts
import { File, Directory, Paths } from 'expo-file-system';
```

### `File`

`File` 表示一个文件引用，同时实现了 Web `Blob` 接口的部分能力。

```ts
const file = new File(Paths.cache, 'subdir', 'example.txt');
```

创建 `File` 对象不等于在磁盘上创建文件。路径可以暂时不存在，只有调用 `create()` 或写入等操作后，实际文件才会出现。

如果路径已经存在，但它实际是目录，却使用 `File` 表示，构造时会抛出错误。反过来，用 `Directory` 表示一个已经存在的文件也属于类型不匹配。

### `Directory`

`Directory` 表示目录引用：

```ts
const directory = new Directory(Paths.cache, 'subdir');
```

目录也不需要在实例构造时就存在。调用 `directory.create()` 才执行实际创建。

### `Paths`

`Paths` 提供系统预定义目录、磁盘容量信息以及路径处理工具。可以把它类比为：

- React Web 中不存在的“应用存储目录入口”；
- 加上一部分 Node.js `path` 模块的路径处理能力。

### 引用对象会随移动操作更新

`File.uri` 和 `Directory.uri` 是只读属性，不能直接赋值，但执行 `move()` 后，同一个对象的 `uri` 会更新为新位置：

```ts
const file = new File(Paths.document, 'example.txt');
await file.move(Paths.cache);

console.log(file.uri); // 已指向缓存目录
```

因此，移动后不应继续假设该对象仍指向旧路径。

## 路径与存储位置

### 预定义目录

| 属性 | 含义 | 开发用途 |
| --- | --- | --- |
| `Paths.cache` | 可被系统清理的缓存目录 | 下载预览、缩略图、可重新生成的数据 |
| `Paths.document` | 系统不会按缓存策略自动清理的文档目录 | 用户数据、离线文件、需要长期保留的内容 |
| `Paths.bundle` | 应用打包资源所在目录 | 读取随应用发布的资源 |
| `Paths.appleSharedContainers` | Apple 平台共享容器映射 | 访问已配置的共享容器 |
| `Paths.availableDiskSpace` | 内部存储剩余空间，单位为字节 | 下载或生成大文件前检查容量 |
| `Paths.totalDiskSpace` | 内部存储总空间，单位为字节 | 展示或计算存储使用情况 |

选择目录时最关键的判断是文件能否重新生成。能够重新下载或生成的内容适合放入 `cache`；不能丢失的数据应放入 `document`。

### 路径工具

`Paths` 提供以下方法：

| 方法 | 用途 |
| --- | --- |
| `join(...paths)` | 拼接路径片段 |
| `normalize(path)` | 规范化路径 |
| `basename(path, ext?)` | 获取末尾文件名 |
| `dirname(path)` | 获取父目录路径 |
| `extname(path)` | 获取扩展名 |
| `parse(path)` | 拆分为 `root`、`dir`、`base`、`name`、`ext` |
| `isAbsolute(path)` | 判断是否为绝对路径 |
| `relative(from, to)` | 计算两个位置之间的相对路径 |
| `info(...uris)` | 判断路径是否存在以及是否为目录 |

应使用这些结构化工具处理路径，避免手工拼接 `/`。移动端 URI 可能存在不同 scheme，手工字符串处理容易产生错误。

## 文件的创建、读写与元数据

### 创建并读写文本

```ts
import { File, Paths } from 'expo-file-system';

try {
  const file = new File(Paths.cache, 'example.txt');

  file.create();
  await file.write('Hello, world!');

  console.log(await file.text());
} catch (error) {
  console.error(error);
}
```

默认情况下，目标已存在时，`create()` 可能抛出错误。创建文件可配置：

| `FileCreateOptions` | 默认值 | 含义 |
| --- | --- | --- |
| `intermediates` | `false` | 是否自动创建缺失的中间目录 |
| `overwrite` | `false` | 目标已存在时是否覆盖 |

写入配置如下：

| `FileWriteOptions` | 默认值 | 含义 |
| --- | --- | --- |
| `append` | `false` | 是否追加到末尾；否则覆盖原内容 |
| `encoding` | UTF-8 | 使用 `utf8` 或 `base64` 编码 |

### 读取格式

`File` 支持多种读取方式：

| 方法 | 返回值 | 适用场景 |
| --- | --- | --- |
| `text()` / `textSync()` | 字符串 | 文本、JSON、日志 |
| `json()` | 解析后的值 | JSON 文件 |
| `bytes()` / `bytesSync()` | `Uint8Array` | 二进制处理 |
| `arrayBuffer()` | `ArrayBuffer` | 与 Web 二进制 API 对接 |
| `base64()` / `base64Sync()` | Base64 字符串 | 需要文本形式传输二进制数据 |
| `stream()` / `readableStream()` | `ReadableStream` | 流式读取 |
| `slice()` | `Blob` | 只取得部分二进制内容 |
| `formData()` | `FormData` | 表单上传相关处理 |

整个文件读取方法会把内容装入内存。大文件更适合使用流或 `FileHandle` 分段读取。

### 文件属性

常用属性包括：

- `exists`：文件存在且当前应用有读取权限时为 `true`。
- `size`：字节数；不存在或不可读时为 `0`。
- `type`：MIME 类型；不存在或不可读时为空字符串。
- `name`：包含扩展名的文件名。
- `extension`：扩展名，例如 `.png`。
- `parentDirectory`：父目录。
- `uri`：文件 URI。
- `creationTime`：Unix Epoch 起算的毫秒时间；Android API 26 以下可能为 `null`。
- `lastModified`：最后修改时间。
- `md5`：MD5 值；不存在或不可读时为 `null`。
- `contentUri`：仅 Android，用于向外部应用共享的内容 URI。

`modificationTime` 已被弃用，应改用更接近 Web `File` 命名的 `lastModified`。

注意，`exists === false` 不一定表示文件物理上不存在，也可能表示应用没有读取权限。类似地，`size === 0` 既可能是空文件，也可能是不存在或不可读。

如需一次取得元数据，可调用：

```ts
const info = file.info({ md5: true });
```

启用 MD5 计算需要额外读取文件内容，大文件上可能增加开销。

## 目录管理

### 创建目录

```ts
const directory = new Directory(Paths.document, 'reports');

directory.create({
  intermediates: true,
  idempotent: true,
});
```

`DirectoryCreateOptions` 包含：

| 配置 | 默认值 | 含义 |
| --- | --- | --- |
| `idempotent` | `false` | 已存在时是否静默成功 |
| `intermediates` | `false` | 是否创建缺失的中间目录 |
| `overwrite` | `false` | 已存在时是否覆盖 |

需要反复执行的初始化流程通常适合使用 `idempotent: true`，否则应用每次启动时重复创建目录可能抛出错误。

目录还可以直接创建子项：

```ts
const childDirectory = directory.createDirectory('images');
const childFile = directory.createFile('data.json', 'application/json');
```

### 列出目录

```ts
const contents = directory.list();

for (const item of contents) {
  if (item instanceof Directory) {
    console.log('目录：', item.name);
  } else {
    console.log('文件：', item.name, item.size);
  }
}
```

`list()` 返回 `(File | Directory)[]`。调用时父目录不存在会抛出错误，因此不能把空数组当作“不存在”的统一结果。

### 删除目录

```ts
directory.delete();
```

删除目录时，其中所有文件和子目录也会被删除。该操作影响整个目录树，应在调用前确认目标 URI。

目录的 `size` 在目录不存在或不可读时为 `null`，与文件的 `size` 回退为 `0` 不同。

## 复制、移动、重命名与删除

```ts
const file = new File(Paths.document, 'example.txt');
file.create();

const copy = new File(Paths.cache, 'example-copy.txt');
await file.copy(copy);

await file.move(Paths.cache);
file.rename('renamed.txt');
file.delete();
```

文件和目录均提供：

- `copy()` / `copySync()`
- `move()` / `moveSync()`
- `rename()`
- `delete()`

复制和移动接受 `RelocationOptions`：

```ts
await file.copy(destination, {
  overwrite: true,
});
```

默认 `overwrite` 为 `false`，目标已存在时不会自动覆盖。

复制保留原对象的位置；移动会改变原对象的 `uri`。目录删除是递归删除，而文件删除只删除当前文件。

## 文件选择器

### 使用 `expo-document-picker`

```ts
import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

const result = await DocumentPicker.getDocumentAsync({
  copyToCacheDirectory: true,
});

if (!result.canceled) {
  const file = new File(result.assets[0].uri);
  console.log(await file.text());
}
```

`copyToCacheDirectory: true` 会把用户选择的文件复制到应用缓存目录，使 `expo-file-system` 能立即访问该副本。

### 使用内置文件选择器

```ts
const result = await File.pickFileAsync({
  multipleFiles: true,
  mimeTypes: ['image/*', 'application/pdf'],
});

if (!result.canceled) {
  for (const file of result.result) {
    console.log(file.uri);
  }
}
```

配置包括：

| 配置 | 默认值 | 含义 |
| --- | --- | --- |
| `initialUri` | 未指定 | 选择器初始目录 |
| `mimeTypes` | `*/*` | 可选择的 MIME 类型 |
| `multipleFiles` | `false` | 是否允许多选 |

返回结果使用可辨识联合类型：

- 单选成功：`{ result: File, canceled: false }`
- 多选成功：`{ result: File[], canceled: false }`
- 取消：`{ result: null, canceled: true }`

必须先检查 `canceled`，不能假设用户一定选择了文件。

旧式的 `pickFileAsync(initialUri, mimeType)` 重载已弃用，应改为选项对象形式。旧重载在 iOS 上返回原文件的临时副本，不修改原文件。

> 原文示例中出现了 `new File.pickFileAsync()`。结合 API 定义，`pickFileAsync` 是 `File` 的静态异步方法，正确调用形式应为 `await File.pickFileAsync(...)`，不应使用 `new`。

## 文件下载

### 简单下载

```ts
import { Directory, File, Paths } from 'expo-file-system';

const destination = new Directory(Paths.cache, 'pdfs');
destination.create({ idempotent: true });

const output = await File.downloadFileAsync(
  'https://pdfobject.com/pdf/sample.pdf',
  destination
);

console.log(output.exists);
console.log(output.uri);
```

当目标是目录时，输出文件名会根据响应头或 URL 决定。

下载选项包括：

| 配置 | 作用 |
| --- | --- |
| `headers` | 添加请求头 |
| `idempotent` | 目标已存在时是否覆盖 |
| `onProgress` | 接收下载进度 |
| `signal` | 通过 `AbortSignal` 取消下载 |

`idempotent` 默认为 `false`。目标文件已存在时会抛出错误；设为 `true` 后会覆盖已有文件。

进度数据包含：

- `bytesWritten`：已经写入的字节数。
- `totalBytes`：预期总字节数。

如果服务器没有返回 `Content-Length`，`totalBytes` 为 `-1`，此时不能可靠计算百分比，只能展示已下载字节数或不确定进度。

### 使用 `expo/fetch`

```ts
import { fetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';

const response = await fetch('https://pdfobject.com/pdf/sample.pdf');
const file = new File(Paths.cache, 'file.pdf');

await file.write(await response.bytes());
```

这种方式先取得响应字节，再写入文件，适合需要自行处理响应内容的场景。对于大文件，是否采用该方式还需考虑完整响应进入内存的成本。

## 可暂停和恢复的下载任务

需要进度、暂停、恢复或取消时，可以创建 `DownloadTask`：

```ts
const destination = new File(Paths.document, 'video.mp4');

const task = File.createDownloadTask(
  'https://example.com/video.mp4',
  destination,
  {
    onProgress: ({ bytesWritten, totalBytes }) => {
      console.log(bytesWritten, totalBytes);
    },
  }
);

const file = await task.downloadAsync();
```

### 状态机

下载任务状态为：

```text
idle -> active -> completed
              -> paused -> active
              -> cancelled
              -> error
```

- 新任务初始为 `idle`。
- `downloadAsync()` 只能在 `idle` 状态调用一次。
- `pause()` 或 `pauseAsync()` 将活动任务转为 `paused`。
- `resumeAsync()` 恢复暂停任务。
- `cancel()` 取消任务。
- `release()` 释放原生任务资源。

任务在传输完成时返回文件；如果完成前被暂停，`downloadAsync()` 或 `resumeAsync()` 返回 `null`。失败或取消会使 Promise 拒绝。

`pause()` 只发起暂停请求；`pauseAsync()` 会等待原生层生成恢复数据并真正进入 `paused`。如果准备持久化暂停状态，应使用 `pauseAsync()`。

### 持久化暂停状态

任务暂停后，可以取得可序列化状态：

```ts
await task.pauseAsync();
const state = task.savable();
```

随后可以恢复：

```ts
const restoredTask = DownloadTask.fromSavable(state, {
  onProgress: progress => {
    console.log(progress);
  },
});

const file = await restoredTask.resumeAsync();
```

保存状态包含 URL、目标 URI、请求头和平台特定恢复数据，但不包含回调函数或 `AbortSignal`。恢复任务时需要重新提供这些运行时对象。

### iOS 后台会话限制

`sessionType` 可设置为：

- `'background'`
- `'foreground'`

该设置只实际影响 iOS；Android 接受它只是为了保持 API 一致。

当 iOS 使用后台会话时，应用暂停后原生传输可能继续。但是，如果应用被终止或重新启动，JavaScript `DownloadTask` 实例不会自动恢复，因此原 Promise、进度回调和取消状态只在原 JavaScript 运行时仍存在时有效。

这意味着“原生下载可能继续”不等于“React 状态和 JavaScript 任务对象能够跨应用重启继续存在”。

## 文件上传

### 使用 `expo/fetch`

由于 `File` 可以作为 `Blob` 使用，可以直接作为请求体上传：

```ts
import { fetch } from 'expo/fetch';

const response = await fetch('https://example.com/upload', {
  method: 'POST',
  body: file,
});
```

也可以加入 `FormData`：

```ts
const formData = new FormData();
formData.append('data', file);

const response = await fetch('https://example.com/upload', {
  method: 'POST',
  body: formData,
});
```

这与 React Web 中上传 `Blob` 或 `File` 的思路接近，但这里的 `File` 指向设备文件系统中的文件。

### 立即上传

```ts
const result = await file.upload('https://example.com/upload', {
  httpMethod: 'POST',
  uploadType: UploadType.MULTIPART,
  fieldName: 'file',
});
```

即使服务器返回非 2xx 状态码，只要 HTTP 响应正常完成，Promise 仍会成功解析。调用方必须检查：

```ts
if (result.status < 200 || result.status >= 300) {
  // 按业务失败处理
}
```

只有文件无法读取、网络请求失败、任务被取消等情况才会使 Promise 拒绝。

### 可追踪上传任务

```ts
const task = file.createUploadTask('https://example.com/upload', {
  uploadType: UploadType.MULTIPART,
  onProgress: ({ bytesSent, totalBytes }) => {
    console.log(bytesSent, totalBytes);
  },
});

const result = await task.uploadAsync();
```

上传任务状态不包含 `paused`：

```text
idle -> active -> completed | cancelled | error
```

`uploadAsync()` 只能在 `idle` 状态调用一次。任务支持进度监听、取消和 `release()`，但当前文档没有提供上传暂停或恢复能力。

### 上传配置

| 配置 | 默认值 | 含义 |
| --- | --- | --- |
| `httpMethod` | `POST` | 可使用 `POST`、`PUT` 或 `PATCH` |
| `uploadType` | `BINARY_CONTENT` | 原始二进制或 multipart 上传 |
| `fieldName` | `file` | multipart 中的文件字段名 |
| `mimeType` | 未指定 | 文件 MIME 类型 |
| `parameters` | 未指定 | multipart 的其他表单字段 |
| `headers` | 未指定 | 自定义请求头 |
| `onProgress` | 未指定 | 进度回调 |
| `signal` | 未指定 | 使用 `AbortSignal` 取消 |
| `sessionType` | `background` | iOS 原生会话类型 |

`UploadType` 包含：

- `BINARY_CONTENT`：文件内容直接作为整个 HTTP 请求体。
- `MULTIPART`：文件作为 `multipart/form-data` 中的一个字段。

multipart 上传的进度字节数可能包含 boundary、字段头和其他表单参数，因此可能大于文件自身大小。

上传的 iOS 后台会话具有与下载类似的限制：原生传输可能在应用暂停后继续，但 JavaScript 任务对象不会在应用被终止并重启后自动恢复。

## 流与 `FileHandle`

### 流式读写

`File` 提供：

- `readableStream()`
- `writableStream()`
- `stream()`

它们允许按块处理文件，而不是一次把整个文件读入内存。其概念与 Web Streams API 接近。

### 使用 `FileHandle`

```ts
const handle = file.open(FileMode.ReadWrite);

try {
  const bytes = await handle.readBytes(1024);
  handle.offset = 0;
  await handle.writeBytes(bytes);
} finally {
  handle.close();
}
```

`FileHandle` 的重要属性：

- `offset`：下一次读写开始的字节位置。
- `size`：文件大小。
- 关闭后两者为 `null`。

每次调用 `readBytes` 或 `writeBytes` 后，`offset` 会根据实际处理的字节数自动增加。若把 `offset` 设置到文件末尾之后，下一次写入会追加到末尾。

必须在使用完成后调用 `close()`。关闭后继续读写会抛出错误；关闭还允许其他进程读取文件，或者允许文件被移动和删除。

单次读取受平台 `ArrayBuffer` 最大尺寸限制，但可以反复读取多个分块。

### 文件打开模式

| 模式 | 值 | 行为 |
| --- | --- | --- |
| `ReadOnly` | `r` | 只读，游标位于开头 |
| `ReadWrite` | `rw` | 可读写，游标位于开头 |
| `WriteOnly` | `w` | 只写，游标位于开头 |
| `Append` | `wa` | 只写，游标位于末尾 |
| `Truncate` | `wt` | 只写，并先清空文件 |

默认模式取决于 URI：

- SAF `content://` URI 默认使用 `ReadOnly`。
- 普通 `file://` URI 默认使用 `ReadWrite`。

Android SAF 的 `content://` URI 不支持 `ReadWrite`。对于 SAF 文件，`Append` 是严格追加模式，不能通过移动游标改写已有内容。

`Truncate` 会把文件长度清零，等同于清空内容，不能把它当作普通写入模式使用。

## 监听文件系统变化

文件和目录都支持 `watch()`：

```ts
const subscription = file.watch(event => {
  console.log(event.type, event.target.uri);
});

// 不再需要时
subscription.remove();
```

事件类型包括：

- `created`
- `modified`
- `deleted`
- `renamed`

监听选项：

| 配置 | 默认值 | 含义 |
| --- | --- | --- |
| `debounce` | `100` 毫秒 | 合并短时间内连续发生的事件 |
| `events` | 全部 | 只监听指定事件类型 |

监听目标被删除或重命名后，监听器会自动停止。正常业务流程中仍应在组件卸载或不再需要监听时调用 `remove()`，释放原生资源。

Android 的重命名事件可能提供 `newTarget`。该字段是 Android 专有能力，且依赖系统在 debounce 时间窗口内关联移动前后的事件。

iOS 目录监听只提供较粗粒度的“目录发生变化”通知。子项创建、删除或重命名可能只表现为目录自身的 `modified` 事件，因此不能依赖 iOS 对目录子项事件进行精确过滤。

> **基于文档内容推导：**跨平台业务若需要准确掌握目录内容变化，应在收到目录变化通知后重新执行 `list()` 并比较结果，而不是完全依赖事件类型。

## 新旧 API 的关系

当前推荐 API 使用 `File`、`Directory`、`Paths`、`DownloadTask` 和 `UploadTask` 等对象：

```ts
const file = new File(Paths.cache, 'example.txt');
const content = await file.text();
```

旧版函数式 API 可以从以下入口导入：

```ts
import * as FileSystem from 'expo-file-system/legacy';
```

例如：

```ts
const content = await FileSystem.readAsStringAsync(file.uri);
```

直接从新版 `expo-file-system` 调用下列旧方法会在运行时抛出错误，而不只是产生弃用警告：

| 旧 API | 推荐替代 |
| --- | --- |
| `copyAsync` | `File.copy()` 或对应目录方法 |
| `deleteAsync` | `File.delete()` / `Directory.delete()` |
| `downloadAsync` | `File.downloadFileAsync()` |
| `getFreeDiskStorageAsync` | `Paths.availableDiskSpace` |
| `getInfoAsync` | `File.info()` |
| `getTotalDiskCapacityAsync` | `Paths.totalDiskSpace` |
| `makeDirectoryAsync` | `Directory.create()` |
| `moveAsync` | `File.move()` 或目录方法 |
| `readAsStringAsync` | `File.text()` |
| `readDirectoryAsync` | `Directory.list()` |
| `uploadAsync` | `expo/fetch` 或新版上传 API |
| `writeAsStringAsync` | `File.write()` / `writeSync()` |

`createDownloadResumable`、旧 `createUploadTask` 和 `getContentUriAsync` 等 API 也只能从 legacy 入口使用。

迁移时不能只消除 TypeScript 的弃用提示，还必须确认导入路径；错误地从新版入口调用旧函数会直接导致运行时失败。

## 容易踩坑的地方

### 对象存在不代表磁盘文件存在

```ts
const file = new File(Paths.cache, 'a.txt');
```

这只创建引用。应根据业务调用 `create()`、`write()`，或者先检查 `exists`。

### “不存在”和“没有权限”可能得到相同结果

`exists` 在目标不存在或当前应用没有读取权限时都可能是 `false`。不能仅凭它向用户断言文件已被删除。

### 缓存目录不能保存关键数据

`Paths.cache` 中的数据可能被系统删除。用户文档、离线编辑结果等不能只保存在缓存目录。

### 默认不覆盖已有目标

文件创建、目录创建、复制、移动和下载通常默认不会覆盖已有目标。重复执行流程时，应明确选择：

- 使用唯一文件名；
- 先检查目标；
- 启用 `overwrite`；
- 或在支持的操作中启用 `idempotent`。

### 删除目录会递归删除内容

`Directory.delete()` 会删除整个目录树。动态拼接删除路径时必须确认目标目录。

### 同步 API 可能阻塞 UI

React Native 的 JavaScript 同时负责应用业务和界面更新。读取大文件或执行大量同步操作可能造成界面卡顿。

### 非 2xx 上传不会自动抛错

上传请求收到 `400` 或 `500` 等响应时，Promise 仍可能正常解析。必须检查 `UploadResult.status`。

### 进度总量可能未知或包含额外数据

- 下载缺少 `Content-Length` 时，`totalBytes === -1`。
- multipart 上传进度可能包含协议封装开销。

进度 UI 不应无条件使用 `已完成字节 / 总字节`。

### URI 类型会影响可用能力

Android 的 `content://` URI 不能当作普通 `file://` 路径处理，并且不支持 `FileMode.ReadWrite`。

### 文件选择可能被取消

选择器返回结果必须先检查 `canceled`。在用户取消时访问 `result.uri` 会产生错误。

### 监听行为存在平台差异

尤其是在 iOS 上，目录监听不能保证提供精确的子文件创建、删除和重命名事件。

### 后台网络任务不等于跨重启恢复 JavaScript 状态

iOS 后台会话可能继续原生传输，但应用终止后原有 Promise、回调和任务实例不会自动恢复。

## React Web 开发者需要转换的认知

### 这里不是浏览器的 `<input type="file">`

Web 中的 `File` 通常由用户选择产生，并受浏览器沙盒限制。`expo-file-system` 的 `File` 是设备文件引用，可以创建、修改、移动和删除应用有权访问的文件。

同时，由于它实现 `Blob`，许多熟悉的 Web API 思路仍然适用，例如：

- `arrayBuffer()`
- `slice()`
- `stream()`
- 作为 `fetch` 请求体
- 加入 `FormData`

### 这里也不是 Node.js 的完整 `fs`

应用仍受移动系统沙盒、用户授权、URI 类型和平台 API 限制，不能假设任意绝对路径都可访问。

### 配置变更可能要求重新构建

React Web 的多数配置部署后刷新页面即可生效，而 `Info.plist` 等配置属于原生应用二进制的一部分。修改 Config Plugin 配置后通常需要重新构建应用，仅刷新 JavaScript Bundle 不够。

### 组件卸载时需要释放原生资源

文件监听订阅和手动管理的任务句柄会占用原生资源。可在 React effect 清理函数中释放：

```ts
useEffect(() => {
  const subscription = file.watch(handleChange);

  return () => {
    subscription.remove();
  };
}, [file]);
```

`FileHandle` 应使用 `try/finally` 保证关闭；不再需要的网络任务可以调用 `release()`。

## 实际开发中的使用方式

一个常见的离线文件流程可以按以下步骤设计：

1. 根据文件是否允许被系统清理，选择 `Paths.cache` 或 `Paths.document`。
2. 使用 `Directory` 创建业务目录，并根据重复执行需求配置 `idempotent`。
3. 下载前检查剩余磁盘空间，并决定同名文件的覆盖策略。
4. 小文件直接使用 `text()`、`bytes()` 或 `write()`。
5. 大文件使用流或 `FileHandle` 分块处理。
6. 简单网络传输使用 `File.downloadFileAsync` 或 `expo/fetch`。
7. 需要进度、取消、暂停或恢复时使用任务对象。
8. 上传完成后检查 HTTP 状态码，而不只依赖 Promise 是否成功。
9. 文件选择结果先检查 `canceled`，再读取 `result`。
10. 组件卸载时移除 watcher，并释放不再使用的原生句柄。

> **基于经验建议：**业务代码中可以封装统一的文件服务，集中管理目录选择、命名规则、覆盖策略、错误分类和资源释放，避免各组件直接散落调用文件系统 API。

## 文档明确内容与推导内容

### 文档明确说明

- 库支持 Android、iOS 和 tvOS，并包含在 Expo Go 中。
- 文件和目录对象可以在目标尚不存在时创建。
- `cache` 中的文件可能被系统删除，`document` 中的文件不会按缓存策略自动清理。
- 新 API 同时提供同步和异步操作。
- `File` 实现 `Blob`，可以参与 `fetch` 和 `FormData` 上传。
- 下载任务支持暂停、恢复、取消、进度和状态持久化。
- 上传任务支持进度和取消，但没有暂停状态。
- iOS 后台任务不会自动恢复 JavaScript 任务实例。
- iOS 目录 watcher 只能可靠提供粗粒度变化通知。
- Android SAF `content://` URI 不支持 `ReadWrite` 模式。
- 多个旧版函数从新版入口调用时会在运行时抛出错误。
- 原生静态配置修改后需要重新构建应用。

### 基于文档内容推导

- 关键数据不应只保存在 `Paths.cache`。
- 跨平台目录同步不能完全依赖 watcher 的具体事件类型。
- 大文件应优先采用流或 `FileHandle`，避免整文件进入内存。
- 上传调用必须自行检查 HTTP 状态码。
- 移动文件后，持有旧 URI 字符串的其他代码可能失效，需要同步更新引用。
- 需要跨应用重启保存下载状态时，应持久化 `savable()` 的结果，并在新运行时重新创建回调和取消信号。

## 当前文档未涉及

当前文档没有详细说明：

- 各平台应用沙盒目录在设备上的具体物理路径。
- Android 外部存储权限和媒体库权限的完整配置流程。
- iCloud、Google Drive 等云文件提供方的具体兼容性。
- 文件加密、密钥管理和敏感数据保护方案。
- 磁盘配额以及单个文件大小上限。
- 下载重试、断网恢复和校验失败的完整策略。
- watcher 在应用进入后台后的生命周期细节。
- Apple Shared Containers 的原生配置步骤。
- `expo-file-system` 的 Web 平台支持。
- 不同 Expo SDK 版本间的完整迁移清单。

这些问题需要结合相应平台文档、Expo SDK 版本文档或其他 Expo 模块进一步确认。

## 总结

新版 `expo-file-system` 以 `File`、`Directory` 和 `Paths` 为核心，把设备文件操作组织成面向对象 API。其基本使用思路是：

```ts
const directory = new Directory(Paths.document, 'data');
directory.create({ intermediates: true, idempotent: true });

const file = new File(directory, 'settings.json');
await file.write(JSON.stringify({ theme: 'dark' }));

const settings = await file.json();
```

实际开发中最重要的不是记住所有方法，而是理解以下边界：

- 文件引用和磁盘实体是两回事。
- `cache` 与 `document` 的生命周期不同。
- URI 类型和平台差异会限制操作能力。
- 同步操作、大文件和原生资源都需要谨慎管理。
- 下载与上传任务有明确的状态机和后台限制。
- 旧函数式 API 不能继续从新版入口直接调用。

---

## 文档导航

- **上一页**：[document picker](./168__document-picker.md)
- **下一页**：[filesystem legacy](./170__filesystem-legacy.md)
