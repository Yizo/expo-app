# Expo ImageManipulator 学习笔记

## 文档解决的问题

`expo-image-manipulator` 是 Expo 提供的本地图片处理库，用于修改设备本地文件系统中的图片。

它主要支持：

- 旋转图片
- 水平或垂直翻转图片
- 调整图片尺寸
- 裁剪图片
- 在 Web 平台扩展画布
- 将处理结果保存到缓存目录
- 按 JPEG、PNG 或 WebP 格式输出
- 可选返回 Base64 数据

典型使用场景包括头像裁剪、上传前压缩、修正拍照方向、生成缩略图，以及对用户选择的图片进行预处理。

> 本文对应的是“下一版本 SDK”的未发布文档。原文标明当前最新稳定版本为 SDK 56。实际项目应确认所使用 Expo SDK 对应版本的 API。

## 支持平台

文档声明该库支持：

- Android
- iOS
- tvOS
- Web
- Expo Go

其中，大部分操作支持所有平台，但 `extent()` 仅支持 Web。

## 阅读前需要理解的概念

### Expo 模块

Expo 模块是可以在 React Native 应用中调用的跨平台功能库。它可能在 JavaScript 层提供统一 API，但底层会连接 Android、iOS 或 Web 的具体实现。

对于 React Web 开发者，可以将它理解为一个封装了浏览器 API和原生平台能力的跨平台 npm 包。

### 本地 URI

React Web 中经常使用：

- `https://...` 网络地址
- `blob:` 地址
- `data:` URI

在 React Native 中，图片也经常通过 URI 引用，但 URI 可能指向设备本地文件，例如缓存目录中的图片，而不一定是公网 URL。

本库处理的是已经能够在本地访问的图片。旧版 `manipulateAsync()` 明确要求输入为本地文件 URI 或 Base64 data URI。

### 原生图片引用

新 API 使用 `ImageRef` 表示已经渲染完成的原生图片实例。它不是图片二进制数据本身，也不是 React Native 的 `<Image>` 组件，而是指向底层图片资源的引用。

需要调用 `ImageRef.saveAsync()`，才能将它保存为缓存目录中的文件并取得结果 URI。

### 缓存目录

`saveAsync()` 将结果保存到文件系统的缓存目录。

缓存文件适合临时展示、上传或继续处理。文档没有说明缓存文件的保留期限，也没有提供将其永久保存到相册或应用持久目录的方法。

如需持久保存，应结合其他文件系统或媒体库 API；这部分当前文档未涉及。

## 安装

根据包管理器执行对应命令：

```sh
# npm
npx expo install expo-image-manipulator

# yarn
yarn expo install expo-image-manipulator

# pnpm
pnpm expo install expo-image-manipulator

# bun
bun expo install expo-image-manipulator
```

这里使用的是 `expo install`，而不是普通的 `npm install`。它会按照当前 Expo SDK 选择兼容的依赖版本。

如果项目是已有的非 Expo React Native 工程，需要先安装并配置 `expo`，使工程能够使用 Expo Modules。具体原生工程集成过程不属于当前文档的内容。

## 推荐的新 API 工作流

新 API 的核心流程是：

```text
加载图片
  ↓
创建 ImageManipulatorContext
  ↓
按顺序登记一个或多个变换
  ↓
renderAsync() 执行变换
  ↓
得到 ImageRef
  ↓
saveAsync() 保存文件
  ↓
得到 ImageResult
```

对应代码结构：

```jsx
const context = useImageManipulator(imageUri);

context.rotate(90).flip(FlipType.Vertical);

const renderedImage = await context.renderAsync();

const result = await renderedImage.saveAsync({
  format: SaveFormat.PNG,
});

console.log(result.uri);
```

### 为什么分成“登记变换、渲染、保存”

`rotate()`、`flip()` 等方法不会直接返回最终文件，而是在操作上下文中登记待执行的变换。

这些方法具有两个特征：

- 同步调用
- 可以链式调用

真正等待所有图片处理完成的是：

```js
await context.renderAsync();
```

渲染完成后得到 `ImageRef`，再通过：

```js
await renderedImage.saveAsync();
```

写入缓存目录。

对于 React Web 开发者，这类似于先构建一条图片处理流水线，然后统一执行，而不是每调用一个方法就立即生成一个新文件。

## 文档示例解析

原文示例先顺时针旋转图片 90 度，再对旋转后的图片进行垂直翻转，最后保存为 PNG：

```jsx
context.rotate(90).flip(FlipType.Vertical);

const renderedImage = await context.renderAsync();

const result = await renderedImage.saveAsync({
  format: SaveFormat.PNG,
});

setImageUri(result.uri);
```

操作具有顺序性：

1. 先旋转。
2. 再对旋转后的结果翻转。
3. 渲染全部操作。
4. 保存渲染结果。
5. 使用新 URI 更新界面。

### 示例为什么先调用 `downloadAsync()`

示例图片通过 Expo Asset 加载：

```jsx
const IMAGE = Asset.fromModule(require('./assets/snack-icon.png'));
```

随后执行：

```jsx
await IMAGE.downloadAsync();
setImageUri(IMAGE.localUri ?? IMAGE.uri);
```

这样可以确保资源在本地可用，并优先使用 `localUri`。在资源准备完成前，页面显示加载状态，避免图片尚未就绪时开始处理。

`expo-asset` 的完整行为和配置不属于当前文档范围。

## 创建图片处理上下文

有两种新 API 入口。

### `useImageManipulator(source)`

```jsx
const context = useImageManipulator(source);
```

它是 React Hook，适合在函数组件中使用。

`source` 可以是：

- 图片 URI 字符串
- 图片类型的 `SharedRef`

返回值为 `ImageManipulatorContext`。

由于它是 Hook，必须遵守 React Hook 的调用规则，不能在事件回调、条件语句或普通工具函数中随意调用。

### `ImageManipulator.manipulate(source)`

```js
import * as ImageManipulator from 'expo-image-manipulator';

const context = ImageManipulator.ImageManipulator.manipulate(source);
```

该方法同样加载指定 URI 的图片并创建处理上下文。它不是 React Hook，更适合组件之外的业务逻辑。

> 文档同时展示了命名空间 `ImageManipulator` 和其中的 `ImageManipulator` 类，因此完整访问形式可能出现 `ImageManipulator.ImageManipulator.manipulate(...)`。也可以根据实际导出方式采用具名导入，以减少名称混淆。

## `ImageManipulatorContext` 图片操作

### 裁剪：`crop(rect)`

```js
context.crop({
  originX: 20,
  originY: 30,
  width: 200,
  height: 150,
});
```

参数含义：

| 字段 | 含义 |
| --- | --- |
| `originX` | 裁剪区域左上角的横坐标 |
| `originY` | 裁剪区域左上角的纵坐标 |
| `width` | 裁剪区域宽度 |
| `height` | 裁剪区域高度 |

坐标和尺寸描述的是一个以左上角为起点的矩形。

文档没有说明越界裁剪、负坐标或非法尺寸会产生什么结果，开发时不应依赖未说明的行为。

### 扩展画布：`extent(options)`

```js
context.extent({
  originX: 20,
  originY: 20,
  width: 400,
  height: 400,
  backgroundColor: '#ffffff',
});
```

该操作可以设置新的画布尺寸，并通过 `originX`、`originY` 决定原图在新画布中的位置。画布扩大后，未被原图填充的区域使用 `backgroundColor`。

参数包括：

- `width`：新画布宽度
- `height`：新画布高度
- `originX`：原图的水平偏移
- `originY`：原图的垂直偏移
- `backgroundColor`：空白区域背景色，可以为 `null`

> 重要限制：`extent()` 仅支持 Web，不能把它作为 Android、iOS 通用图片处理流程的一部分。

### 翻转：`flip(flipType)`

```js
context.flip(FlipType.Horizontal);
context.flip(FlipType.Vertical);
```

可用方向：

| 枚举 | 值 | 效果 |
| --- | --- | --- |
| `FlipType.Horizontal` | `"horizontal"` | 水平翻转 |
| `FlipType.Vertical` | `"vertical"` | 垂直翻转 |

一次 `flip()` 只能指定一个方向。如果需要同时沿两个轴翻转，必须登记两次变换：

```js
context
  .flip(FlipType.Horizontal)
  .flip(FlipType.Vertical);
```

### 调整尺寸：`resize(size)`

```js
context.resize({
  width: 800,
  height: null,
});
```

`width` 和 `height` 表示结果图片尺寸。只提供一个有效尺寸时，另一个尺寸会自动计算，以保持原始宽高比。

例如，将 `1200 × 600` 的图片宽度调整为 `600`，自动计算出的高度应为 `300`。

新 API 的类型允许：

```ts
{
  width: number | null;
  height: number | null;
}
```

文档没有说明宽高同时为 `null`、为零或为负数时的行为，调用前应验证输入。

### 旋转：`rotate(degrees)`

```js
context.rotate(90);
context.rotate(-45);
```

规则如下：

- 正数：顺时针旋转
- 负数：逆时针旋转

参数是任意 `number`，文档没有将角度限制为 90 度的倍数。

### 重置：`reset()`

```js
context.reset();
```

它会将上下文恢复到最初加载的图片，而不是最近一次渲染或保存的结果。

适合实现图片编辑界面的“恢复原图”功能。

### 执行处理：`renderAsync()`

```js
const imageRef = await context.renderAsync();
```

该方法等待当前上下文中的所有图片处理任务完成，并返回 `ImageRef`。

图片处理会被安排到后台线程。这里的“后台线程”不等于远程服务器：操作仍在本地执行，只是不需要由 JavaScript 主执行流程同步完成。

## `ImageRef` 与保存结果

`ImageRef` 表示对原生图片实例的引用，包含：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `width` | `number` | 当前图片宽度 |
| `height` | `number` | 当前图片高度 |
| `nativeRefType` | `string` | 原生引用类型 |

通过 `saveAsync()` 保存图片：

```js
const result = await imageRef.saveAsync({
  format: SaveFormat.JPEG,
  compress: 0.8,
  base64: false,
});
```

返回值是 `Promise<ImageResult>`。

## 保存选项 `SaveOptions`

### `format`

支持三种输出格式：

| 枚举 | 值 |
| --- | --- |
| `SaveFormat.JPEG` | `"jpeg"` |
| `SaveFormat.PNG` | `"png"` |
| `SaveFormat.WEBP` | `"webp"` |

默认格式为 JPEG。

文档明确指出：

- PNG 是无损格式，但处理较慢。
- JPEG 更快，但可能出现可见压缩瑕疵。
- `format` 同时决定压缩类型和结果文件扩展名。

文档列出了 WebP，但没有进一步说明其压缩特性或各平台的差异。

### `compress`

```js
{ compress: 0.8 }
```

有效范围是 `0.0` 到 `1.0`：

- `1`：不压缩，质量最高
- `0`：压缩程度最高，质量最低

需要注意，这里的数值表达的是质量保留程度。数值越低，压缩越强，而不是文件质量越高。

### `base64`

```js
{ base64: true }
```

启用后，返回结果中会额外包含 Base64 图片数据。

Base64 会增加返回数据量。仅需展示或上传文件时，通常可以直接使用 `uri`，不必同时获取 Base64。

> “通常不必获取 Base64”属于基于经验建议。原文只说明了该选项的返回行为。

## `ImageResult` 返回结果

保存完成后会得到：

```ts
{
  uri: string;
  width: number;
  height: number;
  base64?: string;
}
```

字段含义：

| 字段 | 说明 |
| --- | --- |
| `uri` | 修改后图片的 URI，可作为 `Image` 或 `Video` 的资源地址 |
| `width` | 结果宽度 |
| `height` | 结果高度 |
| `base64` | 仅在保存时启用 `base64` 后返回 |

返回的 `base64` 字段只是编码内容，不包含 data URI 前缀。若要作为图片 data URI 使用，需要自行拼接：

```js
const dataUri = `data:image/png;base64,${result.base64}`;
```

JPEG 对应 `image/jpeg`，PNG 对应 `image/png`。原文只明确以 `jpeg` 或 `png` 为例，没有说明 WebP data URI 的具体处理。

## 已废弃的 `manipulateAsync()`

旧 API：

```js
ImageManipulator.manipulateAsync(uri, actions, saveOptions);
```

已被标记为废弃。文档要求改用：

- `ImageManipulator.manipulate()`
- `useImageManipulator()`

旧 API 示例：

```js
const result = await ImageManipulator.manipulateAsync(
  uri,
  [
    { rotate: 90 },
    { flip: FlipType.Vertical },
  ],
  {
    format: SaveFormat.PNG,
  }
);
```

### 参数

| 参数 | 说明 |
| --- | --- |
| `uri` | 本地文件 URI 或 Base64 data URI |
| `actions` | 按顺序执行的操作数组，默认为 `[]` |
| `saveOptions` | 保存选项，默认为 `{}` |

每个 action 对象只能包含一个变换键。正确形式如下：

```js
[
  { rotate: 90 },
  { resize: { width: 800, height: 600 } },
]
```

不要合并成：

```js
[
  {
    rotate: 90,
    resize: { width: 800, height: 600 },
  },
]
```

一次调用可以提交多个操作，但每次调用都会产生一个新文件。

文档还特别指出，不应依赖覆盖源文件来刷新显示结果，因为图片存在缓存。应使用返回的新 URI 展示处理后的图片。

## 旧 API 的 Action 类型

`Action` 是以下操作类型的联合：

- `ActionResize`
- `ActionRotate`
- `ActionFlip`
- `ActionCrop`
- `ActionExtent`

它们分别对应：

```js
{ resize: { width, height } }
{ rotate: degrees }
{ flip: FlipType.Horizontal }
{ crop: { originX, originY, width, height } }
{ extent: { originX, originY, width, height, backgroundColor } }
```

其中 `ActionExtent` 仍然仅支持 Web。

旧版 `ActionResize` 表格将宽高标为 `number`，但描述又说明只指定一个值时会自动按比例计算。原文没有进一步解释省略字段时的精确 TypeScript 写法，使用旧 API 时应以项目安装版本的类型声明为准。

## React Web 开发者容易误解的地方

### 处理结果不是浏览器中的临时对象

新 API 先返回原生 `ImageRef`，保存后才得到文件 URI。它不同于浏览器中通过 Canvas 立即生成 Blob URL 的常见流程。

### `<Image>` 不是 HTML `<img>`

示例中的组件来自：

```js
import { Image } from 'react-native';
```

需要通过对象形式指定 URI：

```jsx
<Image source={{ uri: imageUri }} />
```

而不是：

```jsx
<img src={imageUri} />
```

### 操作调用和执行是两个阶段

以下代码只是登记操作：

```js
context.rotate(90).flip(FlipType.Vertical);
```

必须继续调用 `renderAsync()` 才能等待结果，再调用 `saveAsync()` 才会得到缓存文件。

### 变换顺序会影响结果

先旋转后裁剪，与先裁剪后旋转通常不是同一个结果。

这是基于文档链式操作和操作数组顺序推导出的开发影响。原文示例也明确按“先旋转、再翻转”的顺序描述执行过程。

### 本地处理不等于自动持久化

`saveAsync()` 保存到缓存目录，不代表图片已经进入系统相册，也不代表文件会永久存在。相册授权、持久文件管理和缓存清理当前文档均未涉及。

### Web 支持不代表所有操作完全一致

库整体支持 Web，但 `extent()` 明确是 Web 专属操作。开发跨平台功能时，需要逐项检查 API 的平台标记。

## 实际开发中的使用方式

### 上传前缩放并压缩

```js
const context = ImageManipulator.ImageManipulator.manipulate(localUri);

context.resize({
  width: 1280,
  height: null,
});

const imageRef = await context.renderAsync();

const result = await imageRef.saveAsync({
  format: SaveFormat.JPEG,
  compress: 0.8,
});

// 使用 result.uri 上传
```

这样可以在上传前降低图片尺寸和质量。

> 减少上传体积属于基于文档能力推导出的应用场景。最终文件大小以及压缩收益没有在文档中给出保证。

### 保留透明背景

需要保留透明区域时，可以选择 PNG：

```js
const result = await imageRef.saveAsync({
  format: SaveFormat.PNG,
});
```

> PNG 通常用于保留透明度属于基于经验建议。原文仅明确说明 PNG 无损且较慢，没有明确讨论透明通道。

### 实现编辑预览与重置

```js
context.rotate(90);
const preview = await context.renderAsync();

// 用户选择恢复原图
context.reset();
```

需要注意，文档没有说明同一上下文在多次渲染、连续快速操作或并发调用时的具体状态规则。复杂编辑器应根据实际 SDK 版本进行验证。

## 限制与注意事项

1. 当前页面是下一 SDK 版本的文档，不一定与稳定项目中的 API 完全一致。
2. `extent()` 和 `ActionExtent` 仅支持 Web。
3. 每次翻转只能指定一个轴；双轴翻转需要两次操作。
4. `resize()` 只给出一个尺寸时，会自动保持宽高比。
5. 正角度顺时针旋转，负角度逆时针旋转。
6. `saveAsync()` 保存到缓存目录，不是持久存储。
7. `base64` 只有在保存选项启用后才会返回。
8. Base64 结果不包含 data URI 前缀。
9. 默认保存格式为 JPEG。
10. `compress` 必须位于 `0.0` 到 `1.0` 之间。
11. 旧版 `manipulateAsync()` 已废弃，新代码应使用上下文 API。
12. 旧 API 的每个 action 对象只能包含一种变换。
13. 旧 API 每次调用都会创建新文件。
14. 图片存在缓存，覆盖源文件不一定会刷新界面，应使用新结果 URI。
15. 裁剪越界、非法尺寸、文件生命周期、权限要求和错误处理策略，当前文档均未明确说明。

## 文档明确内容与推导内容

### 文档明确说明

- 库的支持平台和主要图片操作能力
- 安装命令
- 新上下文 API 的调用方式
- 操作会安排到后台线程
- `renderAsync()` 和 `saveAsync()` 的职责
- 裁剪、旋转、翻转、缩放及 Web 画布扩展的参数
- 输出格式、压缩范围和 Base64 返回规则
- 保存结果位于缓存目录
- `manipulateAsync()` 已废弃
- 图片缓存可能导致覆盖源文件后无法刷新显示

### 基于文档内容推导

- 可以将多个操作组织成一条有顺序的图片处理流水线。
- 变换顺序可能改变最终结果。
- 该库适合在上传前执行尺寸和质量处理。
- 跨平台业务不能直接依赖 `extent()`。
- 使用新返回 URI 更新界面比复用源 URI 更可靠。

### 基于经验建议

- 优先使用 `expo install` 维护 Expo SDK 版本兼容性。
- 仅在确实需要文本形式图片数据时启用 Base64。
- 处理用户输入前验证裁剪范围、尺寸和压缩参数。
- 需要长期保存时，结合文件系统或媒体库模块管理结果文件。
- 对较大图片增加加载状态和错误处理，避免用户重复触发处理。
- 选择 JPEG、PNG 或 WebP 前，应结合透明度、画质、文件大小和目标平台进行实际测试。

## 总结

`expo-image-manipulator` 的新 API 采用“创建上下文、登记变换、异步渲染、保存文件”的工作模式：

```js
const context = useImageManipulator(uri);

context
  .rotate(90)
  .resize({ width: 800, height: null })
  .flip(FlipType.Horizontal);

const imageRef = await context.renderAsync();
const result = await imageRef.saveAsync({
  format: SaveFormat.JPEG,
  compress: 0.8,
});
```

需要重点记住：

- 操作登记、渲染和保存是不同阶段。
- 变换按照登记顺序执行。
- 保存结果位于缓存目录。
- `extent()` 仅支持 Web。
- `manipulateAsync()` 已废弃。
- 当前页面属于下一 SDK 版本，实际代码应与项目安装版本的文档和类型声明保持一致。

---

## 文档导航

- **上一页**：[image](./177__image.md)
- **下一页**：[imagepicker](./179__imagepicker.md)
