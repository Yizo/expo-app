# 193｜Expo SDK Print HTML 打印与 PDF

**翻页：**[上一页：Expo SDK Pedometer 计步器](./192-Expo-SDK-Pedometer.md) · [目录](./README.md) · [下一页：Expo SDK ScreenCapture](./194-Expo-SDK-ScreenCapture.md)

**官方页面：**[Print · Latest](https://docs.expo.dev/versions/latest/sdk/print/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/print/)

**版本与平台：**Latest 推荐 `expo-print ~57.0.2`，SDK v56.0.0 推荐 `~56.0.4`。页面列出 Android、iOS 和 Web，且支持 Expo Go。iOS 使用 AirPrint；Web 行为与原生系统打印面板不同。

## 作用与差异

`expo-print` 可把 HTML / PDF 送入系统打印界面，也能将 HTML 渲染为 PDF 文件。对熟悉 Web 的开发者来说，可以先用 HTML/CSS 排版，再让 iOS / Android 打开系统打印预览。

- **`printAsync`：**打开打印流程；Android/iOS 可打印传入 HTML，Web 则打印当前网页。
- **`printToFileAsync`：**把 HTML 写成 PDF。Android/iOS 文件落在应用缓存目录；Web 会打开浏览器打印对话框。
- **`selectPrinterAsync`：**iOS 专用，选择 AirPrint 打印机并返回名称和 `url`；在调用 `printAsync` 时用 `printerUrl` 指定。
- **本地图片：**iOS 从 HTML 打印时受 `WKWebView` 限制，不支持 HTML 中的本地 asset URL；先将图片编码成 Base64 data URL，再放进 HTML。
- **Promise 行为：**iOS 未传 `printerUrl` 时，系统打印窗口开始后 Promise resolve；关闭窗口且未开始打印会 reject。Android 在显示原生打印窗口后 resolve，即使用户随后未真正打印，也不会因此 reject。

## 安装

```sh
npx expo install expo-print
yarn expo install expo-print
pnpm expo install expo-print
bun expo install expo-print
```

若要把生成的 PDF 分享出去，还需要安装 Expo 官方 `expo-sharing`：

```sh
npx expo install expo-sharing
```

已有 React Native 项目同样需要先接入 `expo`。

## 打印 HTML、生成 PDF 和选择打印机

示例展示同一份 HTML 可直接打印、导出 PDF 后分享，以及 iOS 选择打印机。实际项目把 `HTML` 替换成自己的发票、报告或收据模板：

```tsx
import { useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

const HTML = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: sans-serif; text-align: center; }
      h1 { font-size: 34px; font-weight: 500; }
    </style>
  </head>
  <body><h1>订单确认单</h1><p>订单 #EX-1042</p></body>
</html>
`;

export default function PrintScreen() {
  const [printer, setPrinter] = useState<Print.Printer | null>(null);

  async function printDocument() {
    await Print.printAsync({
      html: HTML,
      printerUrl: printer?.url, // 仅 iOS 使用
    });
  }

  async function createAndSharePdf() {
    const result = await Print.printToFileAsync({ html: HTML });
    console.log('PDF URI:', result.uri, '页数:', result.numberOfPages);
    await shareAsync(result.uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  }

  async function choosePrinter() {
    const selected = await Print.selectPrinterAsync(); // 仅 iOS
    setPrinter(selected);
  }

  return (
    <View style={styles.container}>
      <Button title="打开打印面板" onPress={() => void printDocument()} />
      <View style={styles.spacer} />
      <Button title="生成并分享 PDF" onPress={() => void createAndSharePdf()} />
      {Platform.OS === 'ios' && (
        <>
          <View style={styles.spacer} />
          <Button title="选择打印机" onPress={() => void choosePrinter()} />
          {printer && <Text style={styles.printer}>已选择：{printer.name}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
  },
  spacer: { height: 8 },
  printer: { marginTop: 8, textAlign: 'center' },
});
```

Web 调用 `printAsync` / `printToFileAsync` 会进入浏览器打印流程；传入的 native HTML 内容不是 Web 上重绘新文档的方式。生成的 `uri` 指向本机缓存内 PDF；需要长期保留时，应在缓存清理前复制或分享文件。

## iOS 打印带本地图片的 HTML

本地文件地址直接写进 HTML 的 `<img src>` 在 iOS 打印时不可用。下例用 `expo-asset` 取得打包图片，等待资源下载后经 ImageManipulator 导出 Base64，再以内嵌 `data:` URL 打印。`expo-asset` 和 `expo-image-manipulator` 也是 Expo 官方包，需通过 `npx expo install` 安装：

```tsx
import { useImageManipulator } from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import * as Print from 'expo-print';
import { useState } from 'react';
import { Button } from 'react-native';

const logoAsset = Asset.fromModule(require('../assets/brand-mark.png'));

export function PrintImageExample() {
  const imageContext = useImageManipulator(logoAsset.uri);
  const [error, setError] = useState<string | null>(null);

  async function printWithImage() {
    try {
      await logoAsset.downloadAsync();
      const imageRef = await imageContext.renderAsync();
      const { base64 } = await imageRef.saveAsync({ base64: true });
      const html = `
        <!doctype html>
        <html><body>
          <img src="data:image/png;base64,${base64}" style="width: 90vw" />
        </body></html>
      `;
      await Print.printAsync({ html });
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return <Button title={error ? `重试：${error}` : '打印图片'} onPress={() => void printWithImage()} />;
}
```

Base64 会增大 HTML 字符串；适合小图片或确有需要的打印资源。`useMarkupFormatter: true` 会改用 iOS `UIMarkupTextPrintFormatter`，但官方说明此模式不显示图片。

## 页面尺寸与页边距

`FilePrintOptions` / `PrintOptions` 的 HTML 页面默认按 US Letter 尺寸约 612 × 792 像素（72 PPI）计算，可传 `width`、`height` 调整。iOS 可在 API 参数中设置 margin：

```ts
const pdf = await Print.printToFileAsync({
  html: '<!doctype html><html><body>带页边距的页面</body></html>',
  margins: { left: 20, top: 50, right: 20, bottom: 100 }, // 仅 iOS
});
console.log(pdf.uri);
```

Android 使用 HTML 时，最终边距可能受 WebView 实现影响；可用 CSS `@page` 覆盖：

```html
<style>
  @page {
    margin: 20px;
  }
</style>
```

若 iOS 使用 `useMarkupFormatter: true` 并设置 margin，可能在末尾出现空白页。官方建议传完整、格式正确并以 `<!DOCTYPE html>` 开始的 HTML 文档。

## API 与平台属性

| API / 常量 | 平台 | 说明 |
| --- | --- | --- |
| `Print.printAsync(options)` | Android、iOS、Web | 打印文档 / HTML；Web 打印当前页面，返回 `Promise<void>`。 |
| `Print.printToFileAsync(options?)` | Android、iOS、Web | 原生将 HTML 生成为缓存 PDF；Web 打开打印对话框，返回 `Promise<FilePrintResult>`。 |
| `Print.selectPrinterAsync()` | iOS | 选择 AirPrint 打印机，返回 `{ name, url }`；`url` 可作为 `printerUrl` 传给 `printAsync`。 |
| `Print.Orientation` | Android、iOS、Web 类型可见 | 方向常量 `portrait`、`landscape`；`PrintOptions.orientation` 文档标为仅 iOS。 |

### `PrintOptions`

传给 `printAsync` 的主选项：

| 字段 | 类型 / 平台 | 说明 |
| --- | --- | --- |
| `html?` | `string`，仅 Android/iOS | 要打印的 HTML。 |
| `uri?` | `string`，Android/iOS | 要打印的 PDF 地址：可远程、可本地，也可 `data:application/pdf;base64,...`。此处只支持 PDF，不支持图片等其他文档。 |
| `width?`、`height?` | `number` | 配合 HTML 设置页面尺寸，默认约 612 × 792。 |
| `margins?` | `PageMargins`，仅 iOS | 上下左右页面边距。 |
| `orientation?` | portrait / landscape，仅 iOS | 打印方向。 |
| `printerUrl?` | `string`，仅 iOS | `selectPrinterAsync` 返回的打印机 URL。 |
| `useMarkupFormatter?` | `boolean`，仅 iOS | 使用系统 markup formatter 而不是 WebView；不显示图片。 |
| `markupFormatterIOS?` | `string`，仅 iOS，已弃用 | 已弃用参数，迁移到 `useMarkupFormatter`。 |

### `FilePrintOptions`、结果与其它类型

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `FilePrintOptions` | `html?`、`base64?`、`width?`、`height?`、`margins?`、`textZoom?`、`useMarkupFormatter?` | `base64` 决定结果是否包含 PDF Base64；`textZoom` 仅 Android、默认 100%；`margins` 和 `useMarkupFormatter` 仅 iOS。 |
| `FilePrintResult` | `uri`、`numberOfPages`、`base64?` | `uri` 是 PDF 文件地址；`numberOfPages` 是渲染页数；开启 `base64` 才返回编码字符串，且不带 `data:application/pdf;base64,` 前缀。 |
| `PageMargins` | `top`、`right`、`bottom`、`left`：number | 页面四边距离。 |
| `Printer` | `name`、`url`：string | 系统找到的打印机名称和 URL。 |
| `OrientationType` | `portrait`、`landscape`：string | 支持的打印方向值。 |

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐包 | `expo-print ~57.0.2` | `expo-print ~56.0.4` |
| 平台、方法、选项和类型 | 与 v56 页面一致 | 与 Latest 页面一致 |
| 源页代码主题 | HTML 打印 / PDF 分享、iOS 选打印机、本地图片内嵌、iOS margin、Android `@page` | 同样的代码主题 |
| 官方页脚 Next | ScreenCapture | ScreenCapture |

SDK v56 项目应安装 `expo-print ~56.0.4`。使用 `expo-sharing`、`expo-asset`、`expo-image-manipulator` 时，也应由 `npx expo install` 选择本 SDK 兼容的版本。

## 官方源页代码主题覆盖

- 安装命令：覆盖 npx、Yarn、pnpm、Bun 的 `expo install expo-print`。
- Print Usage：原创 HTML、直接打印、生成 PDF、缓存 URI 与页数、通过 `expo-sharing` 分享、iOS 打印机选择，以及 `StyleSheet` 页面布局均已改写。
- Local images：覆盖 `Asset.fromModule`、下载资源、`useImageManipulator`、`renderAsync` / `saveAsync({ base64: true })`、Base64 data URL 内嵌并打印的完整处理路径。
- Page margins：保留 iOS `margins` 代码和 Android CSS `@page` 代码，并修正源页示例里的 CSS 数值单位空格。
- API 的 HTML / PDF、宽高、base64、printer URL、平台限定、orientation、markup formatter 与类型字段都列在本地表中；源页 API 区无额外 runnable 示例。

**翻页：**[上一页：Expo SDK Pedometer 计步器](./192-Expo-SDK-Pedometer.md) · [目录](./README.md) · [下一页：Expo SDK ScreenCapture](./194-Expo-SDK-ScreenCapture.md)
