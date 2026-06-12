# Expo Blob 学习指南

`expo-blob` 是 Expo 为 React Native 提供的、符合 Web 标准的 `Blob` 实现，用于统一处理文本、二进制数据和流式读取。

> 本文对应 **下一版本 Expo SDK** 的文档，修改日期为 **2026 年 1 月 20 日**。文档指出，当前稳定版本是 **SDK 56**。实际项目应优先确认所用 Expo SDK 对应的文档版本。

## 文档解决的问题

在 Web 开发中，浏览器原生提供 `Blob`，可以把文本、文件内容或二进制数据包装成一个统一的数据对象。

React Native 虽然也导出了 `Blob`，但文档明确指出，其实现存在以下问题：

- `slice()` 等功能存在限制。
- 部分 Web API 行为不完整。
- 不同平台上的可靠性和一致性不足。

`expo-blob` 的目标是提供一个：

- 符合 Web 标准的 `Blob` API。
- 在 Android、iOS 和 Web 上行为一致的实现。
- 相比 React Native 自带实现性能更好、可靠性更高的实现。

它包含在 Expo Go 中，支持：

- Android
- iOS
- Web

## 适用场景

适合使用 `expo-blob` 的场景包括：

- 将文本包装成可以上传或传递的二进制对象。
- 处理接口返回的二进制数据。
- 组合字符串与 `Uint8Array` 等多种数据。
- 按字节截取二进制内容。
- 将 Blob 读取为文本、字节数组或 `ArrayBuffer`。
- 使用与浏览器接近的 API 编写跨平台代码。

当前文档没有介绍以下内容：

- 如何通过 `fetch` 上传或下载 Blob。
- Blob 与本地文件系统之间如何转换。
- 如何生成对象 URL。
- Blob 的持久化和缓存策略。
- 大文件的性能测试结果。
- 原生 Android 或 iOS 工程中的底层实现细节。

## React Web 开发者需要理解的背景

### Blob 不是文件路径

`Blob` 表示内存中一段具有大小和可选 MIME 类型的数据。它不等同于：

- 本地文件路径
- React Native 静态资源引用
- 浏览器中的 `<input type="file">` 返回值
- Expo 文件系统中的文件对象

Blob 可以表示一个文件的内容，但它本身不说明这些内容来自哪个文件。

### MIME 类型

MIME 类型用于描述数据格式，例如：

- `text/plain`：普通文本
- `text/html`：HTML
- `application/octet-stream`：未指定具体格式的通用二进制数据

Blob 的 `type` 只是数据类型说明。设置 `type` 不会转换实际内容：

```ts
const blob = new Blob(['Hello'], { type: 'text/html' });
```

这段代码只是把数据标记为 HTML，并不会自动生成或校验 HTML。

### ArrayBuffer 与 Uint8Array

`ArrayBuffer` 表示一块原始二进制内存，本身不提供方便的逐字节访问方式。

`Uint8Array` 是这块内存上的一种视图，把数据解释为一组 `0` 到 `255` 的无符号字节。

可以类比为：

- `ArrayBuffer`：原始内存区域
- `Uint8Array`：查看和操作这块内存的一种方式

### 字符长度不一定等于字节数

`blob.size` 统计字节数，而不是 JavaScript 字符串的 `length`。

文档示例中的 `"Hello, World!"` 全部是 ASCII 字符，因此字符数和 UTF-8 字节数碰巧都是 13。中文和部分特殊字符通常会占用多个 UTF-8 字节。

> **基于文档内容推导：** 使用 `size` 判断文本长度时，应明确你需要的是字节数还是 JavaScript 字符数量。

## 安装

根据包管理器执行对应命令：

```sh
# npm
npx expo install expo-blob

# yarn
yarn expo install expo-blob

# pnpm
pnpm expo install expo-blob

# bun
bun expo install expo-blob
```

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。其作用是让 Expo 为当前项目选择合适的依赖版本。

如果项目是已有的裸 React Native 应用，需要先在项目中安装和配置 Expo Modules，才能使用 `expo-blob`。

> 对 React Web 开发者来说，“裸 React Native 应用”可以理解为项目直接维护 Android 和 iOS 原生工程，而不是完全由 Expo 托管。当前文档只要求先安装 `expo`，没有展开原生工程配置步骤。

## 创建 Blob

从包中导入 `Blob`：

```ts
import { Blob } from 'expo-blob';
```

### 创建空 Blob

```ts
const emptyBlob = new Blob();
```

没有传入内容时，得到一个空 Blob。

### 从文本创建

```ts
const textBlob = new Blob(['Hello, World!'], {
  type: 'text/plain',
});
```

构造函数第一个参数是由多个 `BlobPart` 组成的数组，第二个参数可以指定 MIME 类型。

### 从二进制数据创建

```ts
const binaryBlob = new Blob(
  [new Uint8Array([1, 2, 3, 4])],
  {
    type: 'application/octet-stream',
  }
);
```

这里使用 `Uint8Array` 明确提供四个字节的数据。

### 组合多种内容

```ts
const mixedBlob = new Blob(
  [
    'Text content',
    new Uint8Array([65, 66, 67]),
    'More text',
  ],
  { type: 'text/plain' }
);
```

`65`、`66`、`67` 分别是 ASCII 编码中的 `A`、`B`、`C`。

构造 Blob 时可以组合：

- `string`
- `ArrayBuffer`
- `ArrayBufferView`
- 另一个 `Blob`

`Uint8Array` 属于 `ArrayBufferView`。

> **基于文档内容推导：** 各部分会按照数组中的顺序组成最终数据，因此顺序会直接影响 Blob 的内容。

## 属性

### `size`

```ts
const blob = new Blob(['Hello, World!'], {
  type: 'text/plain',
});

console.log(blob.size); // 13
```

类型：

```ts
number
```

表示 Blob 的字节数，只读。

### `type`

```ts
console.log(blob.type); // "text/plain"
```

类型：

```ts
string
```

表示 Blob 的 MIME 类型，只读。如果无法确定类型，则为空字符串。

## 读取 Blob 内容

读取操作都是异步的，需要使用 `await` 或 Promise。

### 读取为文本

```ts
const text = await blob.text();
console.log(text);
```

`text()` 返回：

```ts
Promise<string>
```

它将 Blob 的全部内容作为 UTF-8 文本读取。

需要注意，`text()` 会把全部内容解释成 UTF-8。对于图片等二进制数据，通常不应该使用该方法。

### 读取为字节数组

```ts
const bytes = await blob.bytes();
console.log(bytes);
```

`bytes()` 返回：

```ts
Promise<Uint8Array>
```

适合需要逐字节读取或修改数据的场景。

### 读取为 ArrayBuffer

```ts
const arrayBuffer = await blob.arrayBuffer();
```

`arrayBuffer()` 返回：

```ts
Promise<ArrayBuffer>
```

适合传递给需要原始二进制缓冲区的 API。

### 三种读取方式的选择

| 方法 | 返回值 | 适用场景 |
| --- | --- | --- |
| `text()` | `string` | 内容明确是 UTF-8 文本 |
| `bytes()` | `Uint8Array` | 需要查看或操作具体字节 |
| `arrayBuffer()` | `ArrayBuffer` | 下游 API 要求原始二进制缓冲区 |

文档没有说明这些读取方法是否会复制底层数据，也没有给出大文件读取的内存开销数据。

## 按字节截取 Blob

`slice()` 可以创建一个包含原 Blob 部分数据的新 Blob：

```ts
const blob = new Blob(['Hello, World!'], {
  type: 'text/plain',
});

const first = blob.slice(0, 5);
console.log(await first.text()); // "Hello"

const second = blob.slice(7);
console.log(await second.text()); // "World!"
```

方法签名：

```ts
blob.slice(start?, end?, contentType?)
```

参数含义：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `start` | `number` | 起始字节索引，包含该位置 |
| `end` | `number` | 结束字节索引，不包含该位置 |
| `contentType` | `string` | 新 Blob 的 MIME 类型 |

返回值是一个新的 `Blob`，原 Blob 不会被修改。

### 边界规则

截取区间为左闭右开：

```text
[start, end)
```

例如 `slice(0, 5)` 包含索引 `0` 到 `4` 的字节。

`start` 和 `end` 使用有符号 32 位整数表示，文档列出的最大值为：

```text
2^31 - 1
```

不传 `end` 时，会一直截取到 Blob 末尾。

### 新 Blob 的 MIME 类型

```ts
const part = blob.slice(0, 5, 'text/html');

console.log(part.type); // "text/html"
```

如果没有提供 `contentType`，新 Blob 的类型默认为空字符串，而不是自动继承原 Blob 的类型。

这是容易忽略的行为：

```ts
const original = new Blob(['Hello'], {
  type: 'text/plain',
});

const part = original.slice(0, 2);

console.log(part.type); // ""
```

### 中文截取风险

`slice()` 使用的是字节索引，不是 JavaScript 字符索引。

> **基于文档内容推导：** 如果截取位置落在一个多字节 UTF-8 字符的中间，随后调用 `text()` 时可能无法得到原本期望的文本。因此，按文本字符截取字符串时，应先处理字符串，再创建 Blob；只有确实需要二进制分片时才按 Blob 字节截取。

## 流式读取

可以通过 `stream()` 获取 `ReadableStream`：

```ts
const blob = new Blob(['Large content...'], {
  type: 'text/plain',
});

const stream = blob.stream();
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();

  if (done) {
    break;
  }

  console.log('Chunk:', value);
}
```

基本流程是：

1. 调用 `blob.stream()` 创建可读流。
2. 调用 `getReader()` 获取读取器。
3. 循环调用异步的 `reader.read()`。
4. `done` 为 `true` 时结束读取。
5. `value` 是当前读取到的数据块。

对于 React Web 开发者，这与浏览器 Web Streams API 的使用方式接近，但不能据此假定底层实现也和浏览器完全相同。

### 重要内存限制

文档明确警告：

> 当前实现会先把整个 Blob 加载到内存中，然后才进行流式读取。

因此，`stream()` 当前并不意味着数据会从文件或其他来源逐块加载。

其实际影响包括：

- 不能依赖它降低 Blob 初始加载的内存占用。
- 超大 Blob 仍可能带来明显内存压力。
- 移动设备通常比桌面浏览器具有更严格的内存限制。

> **基于经验建议：** 处理大文件前，应在目标 Android 和 iOS 设备上测试峰值内存，而不能只验证 Web 或模拟器中的行为。

## API 汇总

### `BlobPart`

Blob 构造函数可接受的数据部分类型为：

```ts
type BlobPart =
  | string
  | ArrayBuffer
  | ArrayBufferView
  | Blob;
```

### `Blob` 属性与方法

| 成员 | 返回类型 | 说明 |
| --- | --- | --- |
| `size` | `number` | Blob 的字节数，只读 |
| `type` | `string` | MIME 类型，只读；无法确定时为空字符串 |
| `arrayBuffer()` | `Promise<ArrayBuffer>` | 读取全部二进制数据 |
| `bytes()` | `Promise<Uint8Array>` | 读取全部字节 |
| `text()` | `Promise<string>` | 以 UTF-8 读取全部内容 |
| `slice()` | `Blob` | 创建指定字节范围的新 Blob |
| `stream()` | `ReadableStream` | 创建 Blob 数据的可读流 |

所有列出的 API 均支持 Android、iOS 和 Web。

## 容易踩坑的地方

### 不要误用 React Native 自带的 Blob

文档推荐的是：

```ts
import { Blob } from 'expo-blob';
```

不要因为 Web 项目中 `Blob` 是全局对象，就默认 React Native 环境中的全局实现与 `expo-blob` 等价。文档正是因为 React Native 实现存在限制，才提供这个包。

### `slice()` 按字节而不是字符截取

ASCII 文本示例中，一个字符对应一个字节，容易让人误以为参数是字符串位置。处理中文等 UTF-8 文本时，两者不能等同。

### `slice()` 默认不继承 MIME 类型

没有传入第三个参数时，新 Blob 的 `type` 是空字符串。

### `text()` 会读取并解码全部内容

该方法不是逐行读取，也不适用于任意二进制格式。

### `stream()` 不会降低初始内存占用

当前实现会先加载完整 Blob。这是本文最重要的性能限制。

### 包含在 Expo Go 不代表无需安装

文档同时给出了明确的安装命令。项目代码要导入 `expo-blob`，仍应把它声明为项目依赖。

> **基于文档内容推导：** “Included in Expo Go”表示 Expo Go 客户端已经具备对应原生能力，而不是可以省略 JavaScript 包依赖。

## 实际开发建议

1. 需要在 Android、iOS 和 Web 间共享 Blob 逻辑时，统一从 `expo-blob` 导入。
2. 文本内容使用 `text()`，二进制处理使用 `bytes()` 或 `arrayBuffer()`。
3. 分片上传等场景使用 `slice()` 时，以字节偏移量设计协议。
4. 截取后如果下游依赖 MIME 类型，应显式传入 `contentType`。
5. 不要把当前的 `stream()` 当作大文件低内存方案。
6. 在已有 React Native 原生项目中，先完成 Expo Modules 的安装。
7. 采用本文 API 前，确认项目 Expo SDK 版本与文档版本匹配。

其中第 1 至第 6 点来自文档 API 和限制的直接应用；第 7 点是根据本文属于下一 SDK 版本文档这一信息作出的版本管理建议。

## 总结

`expo-blob` 为 React Native 提供了接近浏览器标准的 Blob 能力，主要价值是跨 Android、iOS 和 Web 的一致性，以及比 React Native 自带 Blob 更可靠的 `slice()` 和 Web API 支持。

需要重点记住：

- Blob 表示一段带有大小和 MIME 类型信息的数据，不是文件路径。
- `size` 和 `slice()` 都以字节为单位。
- `text()`、`bytes()` 和 `arrayBuffer()` 分别对应文本、字节视图和原始缓冲区。
- `slice()` 返回新 Blob，且默认 MIME 类型为空字符串。
- `stream()` 当前仍会先把整个 Blob 加载进内存。
- 本文对应下一 SDK 版本，使用前需要核对项目实际 SDK 版本。

---

## 文档导航

- **上一页**：[battery](./148__battery.md)
- **下一页**：[blur view](./150__blur-view.md)
