# 141｜Expo SDK Blob 二进制数据

**翻页：**[上一页：Expo SDK Battery 电池状态](./140-Expo-SDK-Battery.md) · [目录](./README.md) · [下一页：Expo SDK BlurView](./142-Expo-SDK-BlurView.md)

**官方页面：**[Blob · Latest](https://docs.expo.dev/versions/latest/sdk/blob/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/blob/)

**版本边界：**Latest 与 SDK v56.0.0 的 Blob API 与代码示例一致；两页没有单独列出推荐包版本，项目中用 `npx expo install expo-blob` 获取当前 Expo SDK 配套版本。库支持 Android、iOS、Web，并包含在 Expo Go。

## Blob 是什么

**Blob（Binary Large Object）** 是一段不可变的二进制数据，并可附上 MIME 类型。常用来装文本、图片、下载内容或由不同二进制片段拼成的数据。React Native 自带的 `Blob` 对一些 Web API 功能（例如 `slice()`）支持不足；`expo-blob` 提供更接近浏览器标准的跨平台实现。

安装：

```sh
npx expo install expo-blob
# 也可使用 yarn / pnpm / bun expo install expo-blob
```

## 创建 Blob

构造参数由片段数组和可选类型组成。片段可混合字符串、`ArrayBuffer`、`ArrayBufferView`（例如 `Uint8Array`）以及其他 Blob：

```ts
import { Blob } from 'expo-blob';

const emptyBlob = new Blob();
const textBlob = new Blob(['你好，世界'], { type: 'text/plain' });
const binaryBlob = new Blob([new Uint8Array([1, 2, 3, 4])], {
  type: 'application/octet-stream',
});
const mixedBlob = new Blob(
  ['文字', new Uint8Array([65, 66, 67]), '后续文字'],
  { type: 'text/plain' }
);
```

读取 `size` 可得到数据字节数，`type` 是 MIME 类型（如 `text/plain`）；若没有提供或不能判断，`type` 为空字符串：

```ts
const message = new Blob(['Hello, World!'], { type: 'text/plain' });
console.log(message.size); // 13 字节
console.log(message.type); // text/plain
```

## 读取文本和二进制内容

Blob 的读取方法异步返回不同表示：

```ts
const message = new Blob(['Hello, World!'], { type: 'text/plain' });

const text = await message.text();
// "Hello, World!"（按 UTF-8 解码）

const bytes = await message.bytes();
// Uint8Array，适合逐字节处理

const buffer = await message.arrayBuffer();
// ArrayBuffer，可传给 Web / 二进制 API
```

`text()` 用 UTF-8 解码整个 Blob；`bytes()` 返回 `Uint8Array`；`arrayBuffer()` 返回 `ArrayBuffer`。

## 按字节切片

`slice(start?, end?, contentType?)` 返回新的 Blob，不修改原对象。起始位置包含在片段里，结束位置不包含；索引按**字节**计算，而不是文本字符数。`start` 与 `end` 按有符号 32 位整数处理，MIME 类型可用第三个参数指定：

```ts
const message = new Blob(['Hello, World!'], { type: 'text/plain' });

const hello = message.slice(0, 5);
console.log(await hello.text()); // "Hello"

const world = message.slice(7);
console.log(await world.text()); // "World!"

const htmlPart = message.slice(0, 5, 'text/html');
console.log(htmlPart.type); // text/html
```

对中文或 emoji 等多字节 UTF-8 内容，按字节切片可能切到字符编码的中间；如需按字符切片，应先读取文本、按字符串处理，再创建新的 Blob。

## 读取流

`stream()` 返回 Web 标准 `ReadableStream`，可通过 reader 分块读取：

```ts
const blob = new Blob(['较长的数据内容……'], { type: 'text/plain' });
const reader = blob.stream().getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('数据块：', value); // value 是字节数据
}
```

**实现限制：**当前 `stream()` 实现会先把整个 Blob 放进内存，然后才提供 ReadableStream；它不会让一个巨大 Blob 自动变成低内存的磁盘流式读取。处理大文件时要考虑整段内容驻留内存的成本。

## API 与类型速查

`Blob` 类的只读属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `size` | `number` | Blob 的数据字节数。 |
| `type` | `string` | MIME 类型；不可确定时是空字符串。 |

方法：

| 方法 | 返回 | 用途 |
| --- | --- | --- |
| `arrayBuffer()` | `Promise<ArrayBuffer>` | 以 ArrayBuffer 形式读取全部数据。 |
| `bytes()` | `Promise<Uint8Array>` | 以字节数组形式读取全部数据。 |
| `text()` | `Promise<string>` | 以 UTF-8 字符串形式读取全部数据。 |
| `slice(start?, end?, contentType?)` | `Blob` | 创建选定字节范围的新 Blob，可覆盖 MIME 类型。 |
| `stream()` | `ReadableStream` | 返回可读流；当前实现先将整块内容载入内存。 |

构造类型 `BlobPart` 是联合类型：`string | ArrayBuffer | ArrayBufferView | Blob`。`ArrayBufferView` 包含 `Uint8Array` 等 typed array 视图。

## 给 React Web 开发者的术语

- **MIME type：**描述内容格式的字符串，例如 `text/plain`、`application/octet-stream`；它是元信息，不会自动校验 Blob 里的数据格式。
- **ArrayBuffer：**一段原始二进制内存；`Uint8Array` 是带字节索引的视图，适合读写或处理这些数据。
- **ReadableStream：**按数据块读取的异步接口；这里的 `stream()` API 兼容该形态，但当前实现仍会先加载完整 Blob。
- **字节索引：**`slice()` 的 start/end 以字节计数，end 不包含在返回内容中。多字节文字不等同于同样数量的字节。

## 页面代码主题覆盖

官方代码示例已按行为改写：安装四种包管理器命令；空 Blob、文本、二进制和混合片段创建；查询 `size` / `type`；读取 text / Uint8Array / ArrayBuffer；从头和中间切片、指定新 MIME 类型；通过 reader 循环读取流块。类属性、方法返回值、`BlobPart` 联合类型以及 stream 的整段内存行为均已列出。

**来源：**[Expo Blob · Latest](https://docs.expo.dev/versions/latest/sdk/blob/) · [Expo Blob · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/blob/)

**翻页：**[上一页：Expo SDK Battery 电池状态](./140-Expo-SDK-Battery.md) · [目录](./README.md) · [下一页：Expo SDK BlurView](./142-Expo-SDK-BlurView.md)
