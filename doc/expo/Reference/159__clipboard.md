# Expo Clipboard 学习指南

`expo-clipboard` 是 Expo 提供的跨平台剪贴板库，用于在 Android、iOS 和 Web 应用中读取、写入及监听剪贴板内容。它支持文本、HTML、图片和 URL，但不同平台的能力、权限行为及返回结果存在明显差异。

> 本页是“下一版本 Expo SDK”的未发布版本文档。文档明确提示：当前最新稳定文档对应 SDK 56。实际项目应根据所使用的 Expo SDK 版本查阅匹配的文档。

## 文档解决的问题

通过 `expo-clipboard`，应用可以实现：

- 将文本、HTML、图片或 URL 写入系统剪贴板。
- 从系统剪贴板读取文本、图片或 URL。
- 判断剪贴板中是否存在某种内容。
- 监听剪贴板内容变化。
- 使用系统提供的粘贴按钮，在不直接请求粘贴权限的情况下接收内容。

常见使用场景包括：

- “复制链接”“复制邀请码”等复制按钮。
- 从剪贴板粘贴验证码或文本。
- 读取用户复制的图片并显示。
- 根据剪贴板内容类型提供不同操作。
- 在 iOS 16 及以上版本使用系统粘贴按钮，降低权限弹窗带来的干扰。

## React Web 开发者需要理解的背景

### 剪贴板不是应用内部状态

剪贴板属于操作系统或浏览器，而不是当前 React 组件。它可以被其他应用读取或修改，并且通常受到权限与安全策略限制。

React Web 中常见的 `navigator.clipboard`，在 Expo 项目中对应由 `expo-clipboard` 封装的跨平台接口。组件状态仍然只用于保存读取结果：

```tsx
const [copiedText, setCopiedText] = useState('');

const text = await Clipboard.getStringAsync();
setCopiedText(text);
```

`getStringAsync()` 读取系统剪贴板，`setCopiedText()` 才是更新 React 状态和界面。

### React Native 不使用 DOM

React Native 中没有 HTML 的 `<div>`、`<button>` 或 CSS 文件。示例中的组件来自 `react-native`：

| React Web | React Native |
| --- | --- |
| `<div>` | `<View>` |
| `<span>`、`<p>` | `<Text>` |
| `<button>` | `<Button>` |
| CSS class | `StyleSheet` 或 `style` |
| `onClick` | `onPress` |

### 剪贴板操作是异步的

主要 API 返回 `Promise`，因此需要使用 `await` 或 `.then()`：

```tsx
await Clipboard.setStringAsync('hello world');
const text = await Clipboard.getStringAsync();
```

不能把读取结果当作同步返回值：

```tsx
// 错误：得到的是 Promise，而不是字符串
const text = Clipboard.getStringAsync();
```

## 安装与导入

### Expo 项目

根据包管理器执行对应命令：

```sh
# npm
npx expo install expo-clipboard

# yarn
yarn expo install expo-clipboard

# pnpm
pnpm expo install expo-clipboard

# bun
bun expo install expo-clipboard
```

`expo install` 会根据当前 Expo SDK 选择兼容的包版本，比直接执行普通的 `npm install` 更适合 Expo 项目。

### 已有 React Native 项目

如果项目不是由 Expo 创建，而是已有的原生 React Native 项目，文档要求先安装并配置 `expo`，才能使用该 Expo Module。

这通常意味着项目不仅涉及 JavaScript 依赖，还可能涉及 iOS 和 Android 原生工程配置。当前文档没有展开具体安装步骤，而是指向“在已有 React Native 项目中安装 Expo Modules”的独立文档。

### 导入

```tsx
import * as Clipboard from 'expo-clipboard';
```

这里将模块导出内容统一放入 `Clipboard` 命名空间，例如：

```tsx
Clipboard.getStringAsync();
Clipboard.setStringAsync('text');
Clipboard.ContentType.IMAGE;
```

## 基础用法

文档给出的基本流程是：

1. 调用 `setStringAsync()` 将文本写入剪贴板。
2. 调用 `getStringAsync()` 读取剪贴板。
3. 将读取结果保存到 React 状态。
4. 通过 `<Text>` 显示结果。

```tsx
import { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function App() {
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync('hello world');
  };

  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    setCopiedText(text);
  };

  return (
    <View style={styles.container}>
      <Button
        title="复制到剪贴板"
        onPress={copyToClipboard}
      />
      <Button
        title="读取剪贴板"
        onPress={fetchCopiedText}
      />
      <Text style={styles.copiedText}>{copiedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copiedText: {
    marginTop: 10,
    color: 'red',
  },
});
```

复制操作不会自动更新组件状态。只有再次读取剪贴板并调用 `setCopiedText()`，界面才会显示内容。

## 文本操作

### 写入文本

```tsx
const success = await Clipboard.setStringAsync('hello world');
```

签名：

```ts
setStringAsync(
  text: string,
  options?: SetStringOptions
): Promise<boolean>
```

平台差异：

- Web：返回值表示文本是否成功写入剪贴板。
- iOS、Android：Promise 总是解析为 `true`。

因此，不能在 iOS 或 Android 上把 `true` 当成精确的写入验证结果。

### 指定文本格式

`SetStringOptions` 支持：

```ts
{
  inputFormat?: Clipboard.StringFormat
}
```

可用格式：

```ts
Clipboard.StringFormat.PLAIN_TEXT // "plainText"
Clipboard.StringFormat.HTML       // "html"
```

默认格式是纯文本。指定输入格式可以帮助其他应用正确解释复制内容：

```tsx
await Clipboard.setStringAsync('<strong>Hello</strong>', {
  inputFormat: Clipboard.StringFormat.HTML,
});
```

这表示剪贴板中的字符串应被视为 HTML，而不是要求当前应用立即渲染 HTML。

### 读取文本

```tsx
const text = await Clipboard.getStringAsync();
```

也可以请求目标格式：

```tsx
const text = await Clipboard.getStringAsync({
  preferredFormat: Clipboard.StringFormat.PLAIN_TEXT,
});
```

`preferredFormat` 表示“如果可能，将剪贴板字符串转换为目标格式”，默认是纯文本。

#### iOS 16 及以上的返回值歧义

如果用户拒绝粘贴权限，`getStringAsync()` 返回空字符串。但空剪贴板也会返回空字符串。

因此：

```tsx
const text = await Clipboard.getStringAsync();

if (text === '') {
  // 不能确定是剪贴板为空，还是用户拒绝了权限
}
```

这是 iOS 平台限制，文档明确说明应用无法区分这两种情况。

### 判断是否存在文本

```tsx
const hasText = await Clipboard.hasStringAsync();
```

纯文本和富文本（例如 HTML）都会返回 `true`。

在 Web 上，这项检查也需要用户授予查看剪贴板中文本和图片的权限。

## 图片操作

### 写入图片

```tsx
await Clipboard.setImageAsync(base64Image);
```

参数必须是：

- Base64 编码字符串。
- 不包含 MIME 类型前缀。

也就是说，传入内容不应以以下形式开头：

```text
data:image/png;base64,
```

文档示例通过图片选择器取得 Base64 数据：

```tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  base64: true,
});

await Clipboard.setImageAsync(result.base64);
```

当前文档没有介绍 `ImagePicker` 的安装、权限配置及结果取消处理。

### 读取图片

```tsx
const image = await Clipboard.getImageAsync({
  format: 'png',
});
```

`GetImageOptions`：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `format` | `'png' \| 'jpeg'` | 返回图片的目标格式 |
| `jpegQuality` | `number` | JPEG 质量，范围为 `0` 到 `1`，默认为 `1` |

`jpegQuality` 仅在 `format: 'jpeg'` 时有效，使用 PNG 时会被忽略。

成功时返回的 `ClipboardImage` 包含：

| 属性 | 说明 |
| --- | --- |
| `data` | 带有 `data:image/...;base64,` 前缀的图片 URI |
| `size.width` | 图片宽度 |
| `size.height` | 图片高度 |

虽然 `setImageAsync()` 要求传入不带 MIME 前缀的 Base64 字符串，但 `getImageAsync()` 返回的 `data` 已包含前缀，可以直接交给 React Native `<Image>`：

```tsx
const image = await Clipboard.getImageAsync({ format: 'png' });

<Image
  source={{ uri: image?.data }}
  style={{ width: 200, height: 200 }}
/>
```

这是容易混淆的输入输出差异：

- 写入图片：不带前缀。
- 读取图片：返回值已经带前缀。

#### 无图片与拒绝权限无法区分

在 iOS 16 及以上版本，如果用户拒绝粘贴权限，方法返回 `null`。剪贴板没有图片时同样返回 `null`。

```tsx
const image = await Clipboard.getImageAsync({ format: 'png' });

if (image === null) {
  // 无法确定是没有图片，还是权限被拒绝
}
```

Web 调用该方法时，会提示用户授予查看剪贴板文本和图片的权限。

### 判断是否存在图片

```tsx
const hasImage = await Clipboard.hasImageAsync();
```

返回 `Promise<boolean>`。在 Web 上同样需要剪贴板读取权限。

## URL 操作

URL 专用 API 仅支持 iOS 和 macOS，不支持 Android 与 Web。

### 写入 URL

```tsx
await Clipboard.setUrlAsync('https://example.com');
```

它与 `setStringAsync()` 的主要区别是：剪贴板内容会被标记为 URL，使当前应用或其他应用能够按照 URL 类型处理该内容。

### 读取 URL

```tsx
const url = await Clipboard.getUrlAsync();
```

如果剪贴板没有 URL，或者 iOS 16 及以上版本中用户拒绝权限，则返回 `null`。应用无法区分这两种情况。

### 判断是否存在 URL

```tsx
const hasUrl = await Clipboard.hasUrlAsync();
```

返回剪贴板中是否存在 URL 内容。

> 对于需要同时支持 Android、iOS 和 Web 的业务，不能无条件调用 URL 专用 API。需要根据平台设计降级方案，例如使用普通字符串接口。该结论属于**基于文档内容推导**。

## 系统粘贴按钮 `ClipboardPasteButton`

`ClipboardPasteButton` 显示系统的 `UIPasteControl` 粘贴按钮。其主要价值是让用户主动点击系统控件完成粘贴，而不需要应用直接请求粘贴权限。

### 可用性检查

渲染前必须检查：

```tsx
Clipboard.isPasteButtonAvailable
```

文档说明该组件要求用户设备至少运行 iOS 16。不可用时：

- 组件不会渲染任何内容。
- 开发模式下会产生警告。

推荐写法：

```tsx
{Clipboard.isPasteButtonAvailable && (
  <Clipboard.ClipboardPasteButton
    style={{ width: 200, height: 44 }}
    onPress={(data) => {
      // 处理粘贴结果
    }}
  />
)}
```

### 必须设置尺寸

必须通过 `style` 设置 `width` 和 `height`，否则按钮不会显示：

```tsx
style={{ width: 200, height: 44 }}
```

这与 React Web 中按钮通常由文字自然撑开不同，是使用该原生控件时的重要限制。

### 不能通过 `style` 设置的属性

虽然该组件继承 `View` 的属性，但 Apple 限制了控件的自定义方式。不要在 `style` 中设置：

- `backgroundColor`
- `borderRadius`
- `color`

应使用组件专用属性：

| 需求 | 应使用的属性 |
| --- | --- |
| 背景颜色 | `backgroundColor` |
| 前景颜色 | `foregroundColor` |
| 圆角样式 | `cornerStyle` |
| 图标与文字显示方式 | `displayMode` |

按钮中的 “Paste” 文案和图标不可修改。

### 接受的内容类型

```tsx
acceptedContentTypes={['plain-text', 'image']}
```

默认值：

```ts
['plain-text', 'image']
```

可选内容：

```ts
'plain-text' | 'image' | 'url' | 'html'
```

只有剪贴板包含指定类型时，按钮才会变为可操作状态。

不要同时设置 `'plain-text'` 和 `'html'`，否则所有文本都会被当作 HTML。

### 显示方式

`displayMode` 支持：

```ts
'iconAndLabel' | 'iconOnly' | 'labelOnly'
```

默认值是：

```ts
'iconAndLabel'
```

### 圆角样式

`cornerStyle` 支持：

```ts
'dynamic' | 'fixed' | 'capsule' | 'large' | 'medium' | 'small'
```

默认值是 `'capsule'`。

### 处理粘贴结果

`onPress` 收到的是联合类型，需要先检查 `type`：

```tsx
onPress={(data) => {
  if (data.type === 'image') {
    setImageData(data);
  } else {
    setTextData(data);
  }
}}
```

文本结果：

```ts
{
  type: 'text';
  text: string;
}
```

图片结果：

```ts
{
  type: 'image';
  data: string;
  size: {
    width: number;
    height: number;
  };
}
```

这与 TypeScript 中常见的可辨识联合类型相同：检查 `type` 后，TypeScript 才能确定其他字段。

## 监听剪贴板变化

### 添加监听器

```tsx
const subscription = Clipboard.addClipboardListener(
  ({ contentTypes }) => {
    // 处理剪贴板变化
  }
);
```

事件对象包含 `contentTypes`，表示剪贴板当前可用的内容类型。

```tsx
const subscription = Clipboard.addClipboardListener(
  ({ contentTypes }) => {
    if (contentTypes.includes(Clipboard.ContentType.PLAIN_TEXT)) {
      Clipboard.getStringAsync().then((content) => {
        console.log(content);
      });
    }

    if (contentTypes.includes(Clipboard.ContentType.IMAGE)) {
      console.log('剪贴板中包含图片');
    }
  }
);
```

`ContentType` 枚举包括：

```ts
Clipboard.ContentType.PLAIN_TEXT // "plain-text"
Clipboard.ContentType.HTML       // "html"
Clipboard.ContentType.IMAGE      // "image"
Clipboard.ContentType.URL        // "url"，仅 iOS
```

### 平台限制

`addClipboardListener()` 在 Web 和 macOS 上是 no-op，也就是调用后不会执行有效监听。

虽然 API 的平台标记包含 Web，但这不表示 Web 上真的能够接收剪贴板变化事件。跨平台支持声明与具体功能行为必须结合方法说明一起判断。

### 移除监听器

推荐通过订阅对象移除：

```tsx
subscription.remove();
```

在 React 组件中应放入副作用清理函数：

```tsx
useEffect(() => {
  const subscription = Clipboard.addClipboardListener((event) => {
    console.log(event.contentTypes);
  });

  return () => {
    subscription.remove();
  };
}, []);
```

旧方式：

```tsx
Clipboard.removeClipboardListener(subscription);
```

已被弃用。文档要求改用 `subscription.remove()`。旧方法在 Web 上同样是 no-op。

## Web 平台的特殊限制

Web 实现使用浏览器的异步 Clipboard API，即 `AsyncClipboard` API。其行为可能因浏览器不同而变化，也可能未被完整支持。

需要重点注意：

- 读取剪贴板通常会触发浏览器权限请求。
- 不同浏览器的支持范围与行为可能不同。
- WebKit 存在异步代码中无法正常使用该 API 的已知问题。
- 剪贴板变化监听在 Web 上不生效。
- `setStringAsync()` 在 Web 上通过布尔返回值报告是否写入成功。

对于 React Web 开发者，最大的误区是认为 Expo 的统一 API 会完全消除浏览器差异。它统一了调用形式，但无法消除浏览器自身的权限、安全策略和实现限制。

## 平台能力对照

| 能力 | Android | iOS | Web | 关键限制 |
| --- | --- | --- | --- | --- |
| 读写文本 | 支持 | 支持 | 支持 | Web 读取需要权限 |
| 读写图片 | 支持 | 支持 | 支持 | 图片 Base64 输入输出格式不同 |
| URL 专用 API | 不支持 | 支持 | 不支持 | 文档同时标记支持 macOS |
| 判断文本或图片 | 支持 | 支持 | 支持 | Web 需要读取权限 |
| 监听剪贴板变化 | 支持 | 支持 | 实际无操作 | Web 不会触发监听器 |
| 系统粘贴按钮 | 文档标记支持 | 需要至少 iOS 16 | 文档标记支持 | 渲染前必须检查可用性 |

> 文档页总体平台列表是 Android、iOS、Web 和 Expo Go，但个别 URL API 还标记了 macOS。当前文档没有进一步解释 macOS 的整体支持范围。

## 注意事项与常见坑点

### 空值不一定表示剪贴板为空

在 iOS 16 及以上版本：

| 方法 | 权限被拒绝时的结果 | 结果还可能表示 |
| --- | --- | --- |
| `getStringAsync()` | `''` | 剪贴板没有文本 |
| `getImageAsync()` | `null` | 剪贴板没有图片 |
| `getUrlAsync()` | `null` | 剪贴板没有 URL |

应用不能根据这些返回值判断用户是否拒绝了权限。

### 读取检查本身也可能需要权限

在 Web 上，`hasStringAsync()` 和 `hasImageAsync()` 并不是无权限的预检查，它们也需要用户授权读取剪贴板。

因此，不能假定先调用 `hasStringAsync()` 就能避免权限请求。

### 统一 API 不代表能力完全一致

同一个方法可能：

- 在某个平台正常工作。
- 在另一个平台需要权限。
- 在 Web 上变成 no-op。
- 返回相同值但代表不同状态。
- 仅在特定系统版本可用。

实际开发时需要同时阅读“支持平台”和方法正文中的限制说明。

### 不要同时接受纯文本和 HTML

`ClipboardPasteButton` 的 `acceptedContentTypes` 不应同时包含：

```ts
['plain-text', 'html']
```

否则所有文本都会被视为 HTML。

### 不要忘记清理监听器

组件卸载后应执行：

```tsx
subscription.remove();
```

否则可能残留事件回调或产生重复监听。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 将读取剪贴板设计为明确的用户操作，例如点击“粘贴”，不要在页面加载时自动读取。
2. 对 `getStringAsync()`、`getImageAsync()` 等异步调用使用 `try/catch`，避免权限或平台错误造成未处理的 Promise rejection。
3. 对 Web、iOS 和 Android 分别进行真机测试，不要仅依赖单个平台或模拟器。
4. 图片写入前检查 Base64 数据是否存在，并确认没有 `data:image/...;base64,` 前缀。
5. 图片读取后先检查是否为 `null`，再渲染 `<Image>`。
6. 对只在 iOS/macOS 提供的 URL API增加平台判断或字符串降级方案。
7. 将“读取不到内容”描述为中性结果，不要直接提示“剪贴板为空”，因为它也可能来自权限拒绝。

## 文档未涉及的内容

当前文档未涉及：

- iOS 或 Android 的原生权限配置文件修改。
- `app.json`、`app.config.js` 或原生工程的插件配置。
- 剪贴板内容的容量限制。
- 敏感数据在剪贴板中的安全保存时间。
- Android 与 iOS 各版本的完整兼容矩阵。
- WebKit 已知问题的具体规避方案。
- Expo Go 与自定义 Development Build 之间的行为差异。
- `ImagePicker` 的安装、权限和错误处理。
- 自动化测试剪贴板功能的方法。

这些内容不能仅根据当前文档确定，需要结合对应平台或相关库的文档进一步确认。

## 总结

`expo-clipboard` 提供了统一的剪贴板调用入口，覆盖文本、HTML、图片、URL、内容检测、变化监听和系统粘贴按钮。

实际使用时最关键的不是记住方法名称，而是理解平台差异：

- Web 受到浏览器权限、兼容性和 WebKit 问题影响。
- iOS 16 及以上可能将“权限拒绝”和“无内容”表现为相同返回值。
- URL 专用 API 只适用于 iOS 和 macOS。
- Web 不支持有效的剪贴板变化监听。
- 系统粘贴按钮必须先检查可用性并显式设置尺寸。
- 图片写入和读取所使用的 Base64 格式不同。

对于只熟悉 React Web 的开发者，可以把该库理解为对浏览器 Clipboard API 和移动端原生剪贴板能力的统一封装，但业务代码仍然必须针对权限、系统版本和平台能力进行防御性处理。

---

## 文档导航

- **上一页**：[checkbox](./158__checkbox.md)
- **下一页**：[constants](./160__constants.md)
