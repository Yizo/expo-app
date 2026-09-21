# 151｜Expo SDK Clipboard 剪贴板

**翻页：**[上一页：Expo SDK Checkbox 复选框](./150-Expo-SDK-Checkbox.md) · [目录](./README.md) · [下一页：Expo SDK Constants 常量](./152-Expo-SDK-Constants.md)

**官方页面：**[Clipboard · Latest](https://docs.expo.dev/versions/latest/sdk/clipboard/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/clipboard/)

**版本与平台：**Latest 推荐 `expo-clipboard ~57.0.2`，SDK v56.0.0 推荐 `~56.0.4`。字符串和图片剪贴板操作支持 Android、iOS、Web，并包含在 Expo Go 中；URL 专用方法在 Latest 文档标为 iOS / macOS，而 v56 文档只列 iOS。下面同时记录平台差异和 iOS 系统粘贴按钮的限制。

## 基本概念与安装

剪贴板是系统提供的临时复制 / 粘贴区域。`expo-clipboard` 提供异步 API，所以调用通常要放在 `async` 函数里并 `await`。安装时让 Expo 按当前 SDK 选择兼容版本：

```sh
npx expo install expo-clipboard
# 也可以使用：yarn expo install expo-clipboard
# 或：pnpm expo install expo-clipboard
# 或：bun expo install expo-clipboard
```

在没有 Expo 的 React Native 工程中，先按 Expo 官方方式集成 `expo`，再安装这个模块。使用命名空间导入后，`Clipboard.setStringAsync()` 与 `Clipboard.getStringAsync()` 分别负责写入和读取文本：

```tsx
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function ClipboardExample() {
  const [text, setText] = useState('');

  const copy = async () => {
    await Clipboard.setStringAsync('你好，剪贴板');
  };

  const read = async () => {
    const value = await Clipboard.getStringAsync();
    setText(value);
  };

  return (
    <View>
      <Button title="复制文字" onPress={copy} />
      <Button title="读取剪贴板" onPress={read} />
      <Text>{text}</Text>
    </View>
  );
}
```

API 的入口如下：

```ts
import * as Clipboard from 'expo-clipboard';
```

Web 使用浏览器的 Async Clipboard API。不同浏览器的实现与权限策略可能不同；官方特别提醒 WebKit 对异步代码中的该 API 有已知限制。Web 上读取剪贴板或检查内容时，浏览器可能要求用户授权。

## iOS 系统 Paste 按钮

`ClipboardPasteButton` 使用 iOS 的系统 `UIPasteControl`，可在用户点按时粘贴而不先请求读取剪贴板的权限。先检查 `Clipboard.isPasteButtonAvailable`：它要求 iOS 16 或更新版本；不可用时组件不会显示，并会在开发模式输出警告。

该系统按钮的文字和图标不能自行替换。需要给它显式宽高，否则可能不可见；`style` 不要写 `backgroundColor`、`color` 或 `borderRadius`，对应外观改用 `backgroundColor`、`foregroundColor` 和 `cornerStyle` 属性。`acceptedContentTypes` 默认接受纯文本和图片，不要同时设置 `plain-text` 与 `html`，否则文本会按 HTML 处理。

下面的示例覆盖源页 `onPress` 中按 `data.type` 分辨文本 / 图片的代码主题，并把粘贴出来的数据放进 React state：

```tsx
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function SystemPasteButton() {
  const [pastedText, setPastedText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  return (
    <View>
      {Clipboard.isPasteButtonAvailable ? (
        <Clipboard.ClipboardPasteButton
          acceptedContentTypes={['plain-text', 'image']}
          imageOptions={{ format: 'png' }}
          displayMode="iconAndLabel"
          cornerStyle="capsule"
          style={{ width: 150, height: 44 }}
          onPress={(data) => {
            if (data.type === 'image') {
              setImageUri(data.data);
            } else {
              setPastedText(data.text);
            }
          }}
        />
      ) : (
        <Text>当前系统没有可用的 Paste 按钮</Text>
      )}

      <Text>{pastedText}</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
```

`ClipboardPasteButton` 的主要属性：

| 属性 | 类型 / 默认值 | 作用 |
| --- | --- | --- |
| `acceptedContentTypes` | `AcceptedContentType[]`；默认 `['plain-text', 'image']` | 决定剪贴板里哪些数据类型会使按钮可用。支持 `plain-text`、`image`、`url`、`html`。 |
| `backgroundColor` | `string \| null` | 背景色；不设置时可随系统主题调整。 |
| `foregroundColor` | `string \| null`；默认 `'white'` | 前景色。 |
| `cornerStyle` | `CornerStyleType \| null`；默认 `'capsule'` | 按钮圆角样式。 |
| `displayMode` | `DisplayModeType \| null`；默认 `'iconAndLabel'` | 显示图标和文字、仅图标或仅文字。 |
| `imageOptions` | `GetImageOptions \| null` | 指定粘贴图片时的格式和 JPEG 质量。 |
| `onPress` | `(data: PasteEventPayload) => void` | 粘贴后收到 `type: 'text'` 或 `type: 'image'` 的数据。 |
| `style` | 继承 View 样式，但排除 `backgroundColor`、`borderRadius`、`color` | 设置大小和布局；按钮至少需要宽高。 |
| 继承属性 | `ViewProps` | 其它 React Native View 属性。 |

## 方法一览

| 方法 | 平台 | 参数与返回值 | 用途和限制 |
| --- | --- | --- | --- |
| `getStringAsync(options?)` | Android / iOS / Web | `GetStringOptions?` → `Promise<string>` | 读取文本；空剪贴板或 iOS 16+ 拒绝粘贴权限时会返回空字符串。Web 可能弹出读取权限请求。 |
| `setStringAsync(text, options?)` | Android / iOS / Web | `string`, `SetStringOptions?` → `Promise<boolean>` | 写入字符串。原生端 Promise 总是解析为 `true`；Web 的布尔值表示写入是否成功。 |
| `getImageAsync(options)` | Android / iOS / Web | `GetImageOptions` → `Promise<ClipboardImage \| null>` | 读取图片；无图片或 iOS 16+ 粘贴权限被拒时返回 `null`。Web 可能询问查看剪贴板内容的权限。 |
| `setImageAsync(base64Image)` | Android / iOS / Web | 不带 MIME 前缀的 Base64 字符串 → `Promise<void>` | 将图片写入剪贴板。 |
| `hasStringAsync()` | Android / iOS / Web | → `Promise<boolean>` | 检查是否包含文字；纯文本和 HTML 富文本都会算作文字。Web 需要剪贴板访问权限。 |
| `hasImageAsync()` | Android / iOS / Web | → `Promise<boolean>` | 检查是否包含图片；Web 需要剪贴板访问权限。 |
| `getUrlAsync()` | Latest：iOS / macOS；v56：iOS | → `Promise<string \| null>` | 读取 URL；无 URL 或 iOS 16+ 权限被拒时为 `null`。 |
| `hasUrlAsync()` | Latest：iOS / macOS；v56：iOS | → `Promise<boolean>` | 检查是否有 URL。 |
| `setUrlAsync(url)` | Latest：iOS / macOS；v56：iOS | `string` → `Promise<void>` | 以 URL 类型写入，令接收应用知道剪贴板内容是 URL。 |
| `addClipboardListener(listener)` | 主要用于 Android / iOS | `(event: ClipboardEvent) => void` → `EventSubscription` | 剪贴板变化时通知可用内容类型；Latest 在 Web 和 macOS 是 no-op，v56 说明 Web 是 no-op。 |
| `removeClipboardListener(subscription)` | Android / iOS；Web no-op | `EventSubscription` → `void` | 旧式删除方法已弃用，应改用返回对象的 `subscription.remove()`。 |

读取剪贴板图片的源页示例会把返回的 `data` 交给 React Native `Image`。`ClipboardImage.data` 已包含 `data:image/png;base64,` 或 `data:image/jpeg;base64,` 前缀，因此可以作为图片 URI：

```tsx
const clipboardImage = await Clipboard.getImageAsync({ format: 'png' });

if (clipboardImage) {
  setImageUri(clipboardImage.data);
  // 等价的直接渲染：
  // <Image source={{ uri: clipboardImage.data }} style={{ width: 200, height: 200 }} />
}
```

向剪贴板写图片时，源页通过 `expo-image-picker` 选择图片并请求 Base64，然后调用 `setImageAsync`。以下采用 SDK v56 ImagePicker 文档中的 `mediaTypes: ['images']` 形式；需另外安装 `expo-image-picker`。这也说明写入时传的是 Base64 数据，而读取结果中的 `data` 是可直接用作 URI 的 Data URL：

```tsx
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';

async function chooseAndCopyImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    base64: true,
  });

  if (!result.canceled) {
    const base64Image = result.assets[0]?.base64;
    if (base64Image) {
      await Clipboard.setImageAsync(base64Image);
    }
  }
}
```

## 监听剪贴板变化

事件里的 `contentTypes` 是 `ContentType[]`。监听 API 返回订阅对象；在 React 中应在 effect 清理函数里调用 `remove()`，避免组件卸载后仍保留监听。源页示例按剪贴板内容类型读取文本或提示图片：

```tsx
import { useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';

useEffect(() => {
  const subscription = Clipboard.addClipboardListener(({ contentTypes }) => {
    if (contentTypes.includes(Clipboard.ContentType.PLAIN_TEXT)) {
      Clipboard.getStringAsync().then((value) => {
        console.log('剪贴板文字：', value);
      });
    } else if (contentTypes.includes(Clipboard.ContentType.IMAGE)) {
      console.log('剪贴板包含图片');
    }
  });

  return () => subscription.remove();
}, []);
```

## 数据类型与枚举

| 类型 | 字段 / 取值 | 说明 |
| --- | --- | --- |
| `ClipboardEvent` | `contentTypes: ContentType[]` | 当前剪贴板中可用内容类型。 |
| `ClipboardImage` | `data: string`；`size: { width: number; height: number }` | 图片 Data URL 与宽高。选择转换格式后，`data` 可能是 PNG 或 JPEG。 |
| `TextPasteEvent` | `type: 'text'`；`text: string` | Paste 按钮粘贴文字时的载荷。 |
| `ImagePasteEvent` | `type: 'image'`，并继承 `ClipboardImage` | Paste 按钮粘贴图片时的载荷。 |
| `PasteEventPayload` | `TextPasteEvent \| ImagePasteEvent` | `ClipboardPasteButton.onPress` 的联合载荷；通过 `type` 区分。 |
| `AcceptedContentType` | `'plain-text' \| 'image' \| 'url' \| 'html'` | Paste 按钮可接受的内容分类。 |
| `GetImageOptions` | `format: 'png' \| 'jpeg'`；`jpegQuality?: number`（0–1，默认 1） | 设置读图输出格式；JPEG 质量只在 `format: 'jpeg'` 时生效。 |
| `GetStringOptions` | `preferredFormat?: StringFormat`，默认 `StringFormat.PLAIN_TEXT` | 指定读取剪贴板文字时优先转换到的格式。 |
| `SetStringOptions` | `inputFormat?: StringFormat`，默认 `StringFormat.PLAIN_TEXT` | 声明写入文本的格式，供其它应用识别。 |
| `CornerStyleType` | `dynamic`、`fixed`、`capsule`、`large`、`medium`、`small` | Paste 按钮的系统圆角样式。 |
| `DisplayModeType` | `iconAndLabel`、`iconOnly`、`labelOnly` | Paste 按钮内容显示模式。 |
| `Subscription` | `remove(): void` | 取消事件监听。 |

`ContentType` 枚举表示内容种类：`HTML = 'html'`、`IMAGE = 'image'`、`PLAIN_TEXT = 'plain-text'`，以及 iOS 的 `URL = 'url'`。`StringFormat` 表示字符串编码格式：`HTML = 'html'`、`PLAIN_TEXT = 'plainText'`。注意 `ContentType.PLAIN_TEXT` 与 `StringFormat.PLAIN_TEXT` 的字符串值不同，它们属于不同用途的枚举。

## 源页代码覆盖与版本差异

- Installation：覆盖 npm / Yarn / pnpm / Bun 对应的 `expo install` 命令。
- Usage：覆盖复制并读取文本、将结果放入 React state 并显示的完整流程。
- API import：覆盖 `import * as Clipboard from 'expo-clipboard'`。
- Paste 按钮：覆盖可用性检查、`acceptedContentTypes`、`imageOptions`、宽高样式、按 `data.type` 分支处理文本 / 图片，以及自定义显示和系统颜色属性。
- 图片方法：覆盖 `getImageAsync` 后将 `ClipboardImage.data` 传给 `<Image>`；覆盖从图片选择器取得 Base64 并调用 `setImageAsync`。
- 事件监听：覆盖根据 `contentTypes` 处理文字 / 图片，并通过 `subscription.remove()` 清理；同时记录弃用的 `removeClipboardListener`。
- 其余 API 没有独立示例代码；本篇列出了剪贴板方法、参数、平台、返回值、类型、枚举及 Web / iOS 权限边界。

Latest 推荐 `~57.0.2`，SDK v56 推荐 `~56.0.4`。API 主体、组件属性和示例行为一致。Latest 文档额外将 `getUrlAsync`、`hasUrlAsync`、`setUrlAsync` 标注为 macOS 可用；v56 文档只列 iOS。Latest 还明确说剪贴板监听在 macOS 和 Web 是 no-op，v56 仅说明 Web 是 no-op。图片选择示例按 SDK v56 `expo-image-picker` 的 `mediaTypes: ['images']` 写法重写，以免沿用剪贴板页代码片段中的旧字段。

**翻页：**[上一页：Expo SDK Checkbox 复选框](./150-Expo-SDK-Checkbox.md) · [目录](./README.md) · [下一页：Expo SDK Constants 常量](./152-Expo-SDK-Constants.md)
