# Expo Print：在 Expo 应用中打印 HTML 与生成 PDF

`expo-print` 是 Expo 提供的打印库，用于：

- 在 Android 和 iOS 上调起系统原生打印功能。
- 在 iOS 上使用 AirPrint 并选择打印机。
- 将 HTML 内容渲染为 PDF 文件。
- 在 Web 上调起浏览器打印对话框。

> 本文对应的是 **下一个 Expo SDK 版本（unversioned）** 的文档，而不是当前稳定版。原文指出当前最新稳定文档为 **SDK 56**。实际项目应根据所用 Expo SDK 版本查阅对应文档，避免 API 差异。

## 适用场景

`expo-print` 适合处理以下需求：

- 打印订单、票据、报表或富文本内容。
- 使用 HTML 和 CSS 生成可打印页面。
- 将 HTML 导出为 PDF，随后分享或保存。
- 打印已有的本地或远程 PDF。
- 在 iOS 上预先选择 AirPrint 打印机。

它不是通用文档转换工具。文档明确说明，`uri` 方式只支持 PDF，不能直接打印图片或其他文档格式。

## React Web 开发者需要先理解的背景

### 系统打印窗口

在 React Web 中，打印通常通过 `window.print()` 调起浏览器打印窗口。

在 React Native 中没有浏览器 DOM，也不能直接调用 `window.print()`。`expo-print` 负责连接 JavaScript 与 iOS、Android 的原生打印能力，调用后会显示操作系统提供的打印界面。

### HTML 在这里是待打印内容

React Native UI 使用 `<View>`、`<Text>` 等原生组件，不会自动转换成 HTML。

因此：

```tsx
<Invoice />
```

不能直接作为 `expo-print` 的打印内容。通常需要单独构造 HTML 字符串：

```ts
const html = `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>订单详情</h1>
    </body>
  </html>
`;
```

再将其传给：

```ts
await Print.printAsync({ html });
```

可以把这理解为：应用另外创建了一份适合打印的 HTML 模板，而不是对当前 React Native 页面截图或打印。

### URI 与 Web URL 不完全相同

移动端的 `uri` 可能表示：

- 远程文件地址。
- 应用沙盒中的本地文件。
- 通过文件选择器得到的文件。
- Base64 Data URI。

它不一定是浏览器中的 `https://` URL。

### 应用缓存目录

`printToFileAsync()` 生成的 PDF 保存在应用的缓存目录中。缓存文件不能被视为永久保存的业务文件。

> **基于文档内容推导：** 如果 PDF 需要长期保留或交给其他应用，应在生成后继续执行复制、保存或分享操作。示例使用 `expo-sharing` 分享生成的 PDF。

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install expo-print

# yarn
yarn expo install expo-print

# pnpm
pnpm expo install expo-print

# bun
bun expo install expo-print
```

`expo install` 会选择与当前 Expo SDK 兼容的软件包版本，比直接执行普通的 `npm install` 更适合 Expo 项目。

如果项目是已有的纯 React Native 原生工程，还必须先安装并配置 `expo`，使工程能够使用 Expo Modules。

文档没有涉及以下内容：

- iOS 原生工程的手动配置步骤。
- Android 原生工程的手动配置步骤。
- 打印权限配置。
- EAS Build 或应用商店发布配置。

## 基本使用流程

### 1. 导入模块

```ts
import * as Print from 'expo-print';
```

如果需要分享生成的 PDF，还可以使用：

```ts
import { shareAsync } from 'expo-sharing';
```

`expo-sharing` 是示例中的辅助库，并不是 `expo-print` 本身的一部分。

### 2. 准备 HTML

```ts
const html = `
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0,
               maximum-scale=1.0, minimum-scale=1.0,
               user-scalable=no"
    />
  </head>
  <body style="text-align: center;">
    <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
      Hello Expo!
    </h1>
  </body>
</html>
`;
```

这部分与 Web 开发较为接近，可以使用 HTML 和 CSS 控制打印内容。不过内容最终由移动端 WebView 或原生格式化器渲染，不能假定其表现与桌面 Chrome 完全一致。

### 3. 调起打印窗口

```ts
await Print.printAsync({ html });
```

在 Android 和 iOS 上，这会打印传入的 HTML；在 Web 上，打印的是当前页面，而不是传入的 HTML 字符串。

### 4. 生成并分享 PDF

```ts
const { uri } = await Print.printToFileAsync({ html });

await shareAsync(uri, {
  UTI: '.pdf',
  mimeType: 'application/pdf',
});
```

在 Android 和 iOS 上，该方法把 HTML 渲染为 PDF，并返回缓存文件的 URI。

在 Web 上，它不会返回与移动端相同的本地 PDF 生成流程，而是打开打印对话框。

### 5. 在 iOS 上选择打印机

```ts
const printer = await Print.selectPrinterAsync();

await Print.printAsync({
  html,
  printerUrl: printer.url,
});
```

`selectPrinterAsync()` 仅支持 iOS。它返回打印机的名称和 URL，后续可通过 `printerUrl` 指定该打印机。

实际 UI 应通过平台判断避免在 Android 上调用：

```tsx
{Platform.OS === 'ios' && (
  <Button title="Select printer" onPress={selectPrinter} />
)}
```

## API 说明

## `Print.printAsync(options)`

```ts
await Print.printAsync(options);
```

支持 Android、iOS 和 Web，返回：

```ts
Promise<void>
```

可使用两种主要输入：

```ts
await Print.printAsync({ html });
```

或者打印 PDF：

```ts
await Print.printAsync({ uri: pdfUri });
```

### `PrintOptions`

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `html` | Android、iOS | 要打印的 HTML 字符串 |
| `uri` | Android、iOS | 要打印的 PDF URI |
| `width` | Android、iOS | HTML 单页宽度，默认 `612` 像素 |
| `height` | Android、iOS | HTML 单页高度，默认 `792` 像素 |
| `margins` | iOS | 页面四边边距 |
| `orientation` | iOS | 页面方向 |
| `printerUrl` | iOS | 指定由 `selectPrinterAsync()` 返回的打印机 |
| `useMarkupFormatter` | iOS | 使用原生 HTML 标记格式化器，但不显示图片 |
| `markupFormatterIOS` | iOS | 已弃用，应改用 `useMarkupFormatter` |

`width` 和 `height` 只在提供 `html` 时有效。默认的 `612 × 792` 对应 72 PPI 下的 US Letter 页面尺寸。

`uri` 支持：

- 远程 PDF。
- 本地 PDF，例如通过 DocumentPicker 选择的文件。
- 以 `data:application/pdf;base64,` 开头的 Base64 Data URI。

`uri` 只支持 PDF，不能传入图片 URI。

### 不同平台的 Promise 行为

iOS 未指定 `printerUrl` 时：

- 用户在系统窗口中开始打印，Promise 才会成功完成。
- 用户关闭打印窗口且没有开始打印，Promise 会被拒绝。

Android：

- 系统打印窗口一显示，Promise 就会成功完成。
- 用户随后关闭窗口且没有打印，Promise 也不会被拒绝。

因此，下面的代码不能跨平台证明纸张已经真正打印：

```ts
await Print.printAsync({ html });
console.log('打印完成');
```

> **基于文档内容推导：** 更准确的业务文案应是“已打开打印窗口”或“打印流程已启动”，尤其是在 Android 上。

## `Print.printToFileAsync(options?)`

```ts
const result = await Print.printToFileAsync({
  html,
});
```

支持 Android、iOS 和 Web。参数可省略，默认值为 `{}`。

在 Android 和 iOS 上，它将 HTML 渲染为 PDF，并保存到应用缓存目录。

返回结果包含：

```ts
type FilePrintResult = {
  uri: string;
  numberOfPages: number;
  base64?: string;
};
```

| 属性 | 说明 |
| --- | --- |
| `uri` | 生成的 PDF 文件 URI |
| `numberOfPages` | 内容渲染后得到的页数 |
| `base64` | PDF 的 Base64 数据，仅当请求参数 `base64: true` 时存在 |

请求 Base64：

```ts
const result = await Print.printToFileAsync({
  html,
  base64: true,
});
```

返回的 `base64` 不包含以下 Data URI 前缀：

```text
data:application/pdf;base64,
```

如果某个 API 要求完整 Data URI，需要自行拼接：

```ts
const dataUri = `data:application/pdf;base64,${result.base64}`;
```

### `FilePrintOptions`

| 属性 | 平台限制 | 作用 |
| --- | --- | --- |
| `html` | 无单独限制 | 要转换为 PDF 的 HTML |
| `base64` | 无单独限制 | 是否在结果中包含 PDF Base64 |
| `width` | 无单独限制 | 单页宽度，默认 `612` |
| `height` | 无单独限制 | 单页高度，默认 `792` |
| `margins` | iOS | 页面边距 |
| `textZoom` | Android | 文字缩放百分比，默认 `100` |
| `useMarkupFormatter` | iOS | 改用 `UIMarkupTextPrintFormatter`，但不显示图片 |

## `Print.selectPrinterAsync()`

```ts
const printer = await Print.selectPrinterAsync();
```

仅支持 iOS，返回：

```ts
type Printer = {
  name: string;
  url: string;
};
```

- `name`：打印机名称，用于界面展示。
- `url`：打印机地址，可传给 `printAsync()` 的 `printerUrl`。

文档没有说明打印机 URL 是否适合跨应用重启长期保存，也没有提供 Android 端选择指定打印机的 API。

## 页面方向

`Print.Orientation` 提供两个值：

```ts
Print.Orientation.portrait
Print.Orientation.landscape
```

分别表示：

- `portrait`：纵向。
- `landscape`：横向。

使用方式：

```ts
await Print.printAsync({
  html,
  orientation: Print.Orientation.landscape,
});
```

虽然常量表标记为 Android、iOS、Web 支持，但 `PrintOptions.orientation` 的属性说明明确标注为 iOS。实际使用时应按照具体参数的平台标记处理，即不要依赖 Android 或 Web 接受该选项。

## 页面边距

`PageMargins` 包含四个必填数值：

```ts
type PageMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
```

### iOS 边距

iOS 可以直接通过 `margins` 设置：

```ts
const { uri } = await Print.printToFileAsync({
  html: 'This page is printed with margins',
  margins: {
    left: 20,
    top: 50,
    right: 20,
    bottom: 100,
  },
});
```

当 `useMarkupFormatter: true` 时，边距设置可能导致打印结果末尾多出空白页。

文档给出的规避方式是提供格式完整的 HTML，并在开头包含：

```html
<!DOCTYPE html>
```

推荐写成完整文档：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    打印内容
  </body>
</html>
```

### Android 边距

Android 使用 HTML 打印或生成 PDF 时，WebView 引擎可能自动添加页面边距。可以通过 CSS `@page` 覆盖：

```html
<style>
  @page {
    margin: 20px;
  }
</style>
```

这与普通网页元素的 `margin` 不同：`@page` 控制打印纸张页面区域，而不是某个 HTML 元素的外边距。

## iOS 本地图片限制

iOS 从 HTML 打印时，由于 `WKWebView` 的限制，不支持在 HTML 中直接引用本地资源 URL。

以下方式可能无法显示图片：

```html
<img src="file:///path/to/icon.png" />
```

文档提供的解决方法是：

1. 获取 Expo Asset。
2. 确保资源已经下载到本地。
3. 使用 `expo-image-manipulator` 读取并导出 Base64。
4. 将 Base64 以内联 Data URI 的形式写入 HTML。
5. 调用 `printAsync()`。

核心形式如下：

```html
<img src="data:image/png;base64,BASE64_DATA" />
```

示例中的关键代码为：

```tsx
const IMAGE = Asset.fromModule(require('@/assets/images/icon.png'));
const context = useImageManipulator(IMAGE.uri);

await IMAGE.downloadAsync();

const manipulatedImage = await context.renderAsync();
const result = await manipulatedImage.saveAsync({ base64: true });

const html = `
  <html>
    <img
      src="data:image/png;base64,${result.base64}"
      style="width: 90vw;"
    />
  </html>
`;

await printAsync({ html });
```

这里的 `require()` 不是 Webpack 中普通静态资源 URL 的直接等价物。Expo Asset 会管理打包进移动应用的资源，而 `downloadAsync()` 确保后续处理时资源在本地可用。

### `useMarkupFormatter` 与图片冲突

iOS 的 `useMarkupFormatter` 会使用 `UIMarkupTextPrintFormatter` 替代默认 WebView 渲染，但该模式不显示图片。

因此，如果打印内容包含 Logo、二维码或商品图片，不应启用该选项。

## 平台差异汇总

| 能力 | Android | iOS | Web |
| --- | --- | --- | --- |
| 调起打印 | 支持 | 支持 | 支持 |
| 打印传入的 HTML | 支持 | 支持 | 不支持，打印当前页面 |
| HTML 转本地 PDF | 支持 | 支持 | 打开打印对话框 |
| 通过 `uri` 打印 PDF | 支持 | 支持 | 未提供 |
| 选择指定打印机 | 不支持 | 支持 | 不支持 |
| `printerUrl` | 不支持 | 支持 | 不支持 |
| `margins` 参数 | 不支持 | 支持 | 不支持 |
| `textZoom` | 支持 | 不支持 | 不支持 |
| `orientation` 参数 | 未标注支持 | 支持 | 未标注支持 |
| HTML 直接引用本地图片 | 文档未指出限制 | 不支持 | 文档未涉及 |

“API 在某平台存在”不表示每个参数在该平台都有效。开发时必须继续检查每个参数的平台标记。

## 容易踩坑的地方

### Web 行为与移动端不同

在 Web 上：

- `printAsync({ html })` 打印当前页面，不打印传入的 HTML。
- `printToFileAsync()` 打开打印对话框，不等同于在应用缓存中生成 PDF。

因此，不能只在浏览器中验证后就假定 Android 和 iOS 行为一致。

### Promise 成功不表示打印完成

尤其在 Android 上，Promise 在原生打印窗口显示后便会完成。它不能作为打印成功凭证，也不能证明用户没有取消。

### iOS 本地图片必须内联

移动端本地文件 URI 不等同于浏览器可直接访问的资源 URL。iOS HTML 打印中的本地图片需要转换为 Base64 Data URI。

### Base64 返回值没有前缀

`printToFileAsync({ base64: true })` 返回的是纯 Base64 数据，不是可以直接放进 `src` 或网络请求中的完整 Data URI。

### PDF URI 不能指向其他文件类型

`PrintOptions.uri` 只支持 PDF。即使图片有合法 URI，也不能按 PDF 的方式直接传入打印。

### 废弃参数不要继续使用

```ts
markupFormatterIOS
```

已经废弃，应改用：

```ts
useMarkupFormatter
```

前者可能在未来版本中移除。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 将打印 HTML 模板与 React Native 页面组件分开维护，因为二者使用不同的渲染体系。
2. 为 HTML 动态数据进行转义，避免用户输入破坏 HTML 结构。
3. 使用包含 `<!DOCTYPE html>`、`<html>`、`<head>` 和 `<body>` 的完整文档，降低平台渲染差异。
4. 对 Android、iOS 和 Web 分别测试，不要把浏览器打印预览当作移动端最终效果。
5. 测试长文本、分页、图片尺寸、缺失图片和多页边距，而不只是测试短示例。
6. 如果业务需要记录“打印成功”，需要重新定义成功标准；该 API 无法在所有平台确认物理打印是否完成。
7. 使用 `Platform.OS` 隔离 `selectPrinterAsync`、`printerUrl`、`margins` 和 `textZoom` 等平台专属逻辑。
8. 对缓存目录中的 PDF 明确设计后续处理，例如立即分享、复制到持久目录或上传服务器。

## 文档明确内容与推导结论

### 文档明确说明

- `expo-print` 支持 Android、iOS、Web，并包含在 Expo Go 中。
- iOS 使用 AirPrint。
- 可以调起打印，也可以把 HTML 渲染为 PDF。
- Web 会打印当前页面或打开打印对话框。
- iOS HTML 打印不支持本地资源 URL，图片需要转换为 Base64 后内联。
- `useMarkupFormatter` 不显示图片。
- `uri` 只支持 PDF。
- iOS 和 Android 对打印 Promise 的完成与取消行为不同。
- `printToFileAsync()` 的 PDF 保存在应用缓存目录。
- iOS 可使用参数设置边距，Android 可通过 CSS `@page` 调整边距。
- `markupFormatterIOS` 已废弃。
- 文档属于下一个 SDK 版本，而当前稳定版本为 SDK 56。

### 基于文档内容推导

- 打印 Promise 不适合作为跨平台的物理打印成功凭证。
- 需要长期保留的 PDF 不应只停留在缓存目录。
- 包含图片的 iOS 打印内容不适合启用 `useMarkupFormatter`。
- 打印模板应作为独立 HTML 内容维护，不能直接复用 React Native 组件树。
- 平台能力判断应细化到具体参数，而不能只看方法整体的平台支持列表。

## 总结

`expo-print` 提供了三条主要路径：

```ts
// 打印 HTML 或 PDF
Print.printAsync(...)

// 将 HTML 生成 PDF
Print.printToFileAsync(...)

// iOS 选择 AirPrint 打印机
Print.selectPrinterAsync()
```

对 React Web 开发者而言，最重要的是理解：React Native 页面不是 HTML 页面；传入的 HTML 是一份独立的打印文档；Web、Android 和 iOS 的实现及完成语义并不一致。

实际开发中的重点风险集中在平台差异、iOS 本地图片、PDF 缓存生命周期、页面边距以及 Promise 无法统一证明物理打印成功这几个方面。

---

## 文档导航

- **上一页**：[pedometer](./199__pedometer.md)
- **下一页**：[screen capture](./201__screen-capture.md)
