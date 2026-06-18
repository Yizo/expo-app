# captureRef - 将 React Native 视图截图保存为图片

> 文档地址：https://docs.expo.dev/versions/unversioned/sdk/captureRef.md

## 文档解决的问题

在 Web 开发中，如果需要把一个 DOM 区域保存为图片，通常会使用 `html2canvas` 或 `dom-to-image` 这类库。但在 React Native 中，视图并不是 DOM 元素，无法直接使用这些 Web 端方案。

`captureRef` 来自 `react-native-view-shot` 库，它的作用就是：**对一个 React Native 视图（View）进行截图，将截图保存为图片文件**。这对于签名板、海报生成、分享卡片等需要"把屏幕上的一块区域导出为图片"的场景非常实用。

该库已预装在 Expo Go 中，兼容 Android 和 iOS。

## 阅读前需要理解的背景知识

### 什么是 Ref（引用）

在 React 中，`ref` 用于获取对组件实例或 DOM 节点的直接引用。在 React Native 中同理，`ref` 可以获取对一个原生视图组件的引用。`captureRef` 的名字即表示"对某个 ref 指向的视图进行截图捕获"。

如果你熟悉 Web 端的 `useRef` + `ref.current`，那么概念上是完全一致的，只是 React Native 中 `ref` 指向的是原生视图而非 DOM 节点。

### 什么是 PixelRatio（像素密度比）

这是移动端开发中非常重要的概念，Web 开发者可能不太熟悉：

- **逻辑像素（Logical Pixel / dp / pt）**：你在代码中写的尺寸值，比如 `width: 100`，单位是逻辑像素。
- **物理像素（Physical Pixel）**：屏幕实际的像素点数量。
- **PixelRatio**：物理像素与逻辑像素的比值。例如 iPhone 的 Retina 屏幕通常是 2x 或 3x。

这意味着：如果你在代码中设置视图宽为 360 逻辑像素，在 3x 屏幕上实际渲染出的物理像素是 1080px。截图生成图片文件时，使用的是物理像素，因此需要特别注意这个换算关系。

### 什么是 Expo Go

Expo Go 是 Expo 提供的一个"沙盒"应用，可以在手机上直接运行 Expo 项目而无需配置原生编译环境。`react-native-view-shot` 已经预装在 Expo Go 中，无需额外配置。

## 安装

使用你习惯的包管理器安装：

```sh
# npm
npx expo install react-native-view-shot

# yarn
yarn expo install react-native-view-shot

# pnpm
pnpm expo install react-native-view-shot

# bun
bun expo install react-native-view-shot
```

**说明**：`expo install` 命令会自动选择与当前 Expo SDK 版本兼容的库版本，这比直接用 `npm install` 更安全。在 Web 开发中你通常直接 `npm install xxx`，但在 Expo 项目中推荐始终使用 `expo install`。

如果你是在一个已有的纯 React Native 项目（非 Expo 项目）中使用这个库，需要先安装 `expo` 模块，然后参考该库的 GitHub 仓库进行额外的原生配置。

## 核心用法

### 基本调用方式

`captureRef` 的核心用法是：传入一个视图的 ref，函数会对该视图进行截图并返回一个图片结果。

```js
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';
import { View, Text } from 'react-native';

function MyComponent() {
  const viewRef = useRef(null);

  const handleCapture = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      console.log('截图已保存到:', uri);
    } catch (error) {
      console.error('截图失败:', error);
    }
  };

  return (
    <View ref={viewRef}>
      <Text>这段内容会被截图保存</Text>
    </View>
  );
}
```

### 配置参数说明

`captureRef` 的第二个参数是一个配置对象，以下是常用配置项：

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `format` | `'png'` / `'jpg'` / `'webm'` | 输出图片格式。`png` 无损但文件较大，`jpg` 有损但文件较小 |
| `quality` | `0` 到 `1` 之间的数字 | 图片质量，仅对 `jpg` 格式有效。`1` 为最高质量 |
| `result` | `'tmpfile'` / `'base64'` / `'data-uri'` | 返回结果的类型。`tmpfile` 返回临时文件路径，`base64` 返回 base64 编码字符串，`data-uri` 返回 data URI 字符串 |
| `width` | 数字 | 输出图片的宽度（逻辑像素） |
| `height` | 数字 | 输出图片的高度（逻辑像素） |

**关于 `result` 选项的对比理解**（基于文档内容推导）：

- `'tmpfile'`：返回一个临时文件路径（类似 `/data/.../tmp_xxx.png`），适合需要上传到服务器或保存到相册的场景。
- `'base64'`：返回纯 base64 字符串，适合需要直接嵌入 JSON 传输的场景。
- `'data-uri'`：返回类似 `data:image/png;base64,...` 的完整 data URI，可以直接赋给 `<Image>` 组件的 `source` 属性来预览。

## 关键知识点：像素值与 PixelRatio 的换算

这是本文档中最重要也最容易被 Web 开发者忽略的部分。

### 问题

UI 布局中使用的是逻辑像素，而图片文件使用的是物理像素。如果你希望生成一张特定物理像素尺寸的图片（比如 1080x1080 的全高清图片），你不能直接把 `width` 和 `height` 设为 1080，因为那会被理解为逻辑像素，最终实际生成的物理像素会是 `1080 * PixelRatio`，远大于你的预期。

### 解决方案

需要将目标物理像素除以 PixelRatio，得到应该传入的逻辑像素值：

```js
import { PixelRatio } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const targetPixelCount = 1080; // 目标：生成 1080x1080 的全高清图片
const pixelRatio = PixelRatio.get(); // 获取设备的像素密度比

// 换算公式：逻辑像素 * pixelRatio = 物理像素
// 所以：逻辑像素 = 物理像素 / pixelRatio
const pixels = targetPixelCount / pixelRatio;

const result = await captureRef(viewRef, {
  result: 'tmpfile',
  height: pixels,
  width: pixels,
  quality: 1,
  format: 'png',
});
```

**举例说明**：

- 在 PixelRatio 为 3 的设备上（如 iPhone 14），要生成 1080x1080 的图片，应设置 `width: 360, height: 360`（1080 / 3 = 360）。
- 在 PixelRatio 为 2 的设备上（如某些 Android 设备），应设置 `width: 540, height: 540`（1080 / 2 = 540）。

如果不做这个换算，生成的图片尺寸会因设备不同而差异很大，这在需要固定输出尺寸（比如上传头像要求 512x512）的场景中会产生问题。

## 关于 OpenGL 视图的特殊说明

如果你需要截图的是 OpenGL 渲染的内容（如 3D 场景、GPU 加速的动画），**不要使用 `captureRef`**，而应该使用 `GLView` 自带的 `takeSnapshotAsync` 方法。这是因为 OpenGL 内容在标准的视图截图流程中可能无法被正确捕获。

> 基于文档内容推导：这类似于 Web 端对 `<canvas>` 或 `<video>` 元素截图时的限制——普通的 DOM 截图方法无法捕获 WebGL 渲染的内容，需要调用 canvas 自身的 `toDataURL()` 方法。

## 注意事项、限制条件和坑点

1. **必须使用 `expo install` 而非 `npm install`**：`expo install` 会确保安装的库版本与你的 Expo SDK 版本兼容，直接 `npm install` 可能引入不兼容的版本，导致运行时错误。

2. **PixelRatio 换算是必须的**：如果忽略这一点，在不同设备上生成的图片尺寸会不一致。所有对图片输出尺寸有明确要求的场景（如社交分享图片、打印素材），都必须做换算。

3. **`ref` 必须挂载到可截图的视图上**：确保 `ref` 指向的是一个实际渲染了内容的视图组件。如果视图还没有完成渲染（例如在 `useEffect` 的首次执行中），截图可能得到空白图片或报错。（基于经验建议）

4. **临时文件会被系统清理**：使用 `result: 'tmpfile'` 得到的文件路径是临时的，系统可能会在某个时刻清理它。如果需要持久保存，应该及时将文件移动到应用文档目录或上传到服务器。（基于经验建议）

5. **纯 React Native 项目需要额外配置**：如果你的项目不是通过 Expo 创建的，而是纯 React Native 项目（使用 `react-native init` 创建），需要先安装 `expo` 模块并按照库的 GitHub 仓库文档完成原生端配置。

## React Web 开发者需要特别注意的地方

1. **没有 `html2canvas` 可用**：Web 端的截图方案完全不适用于 React Native。`react-native-view-shot` 通过调用原生平台的截图 API 实现，是一个"原生级别"的截图，而非 JS 层面的像素模拟，因此截图质量更高、更可靠。

2. **PixelRatio 是移动端独有的核心概念**：Web 开发中虽然也有 `window.devicePixelRatio`，但大多数情况下不需要手动处理，浏览器和 CSS 会自动处理。而在移动端生成图片时，你必须主动考虑 PixelRatio。

3. **`ref` 的用法与 Web 一致，但指向不同**：在 Web 中 `ref.current` 是一个 DOM 元素，在 React Native 中它是一个原生视图句柄。虽然 API 使用方式相同（`useRef`、`ref={viewRef}`），但底层对象不同，你不能对它调用 DOM 方法（如 `getBoundingClientRect`）。

4. **文件系统路径 vs URL**：`result: 'tmpfile'` 返回的是本地文件系统路径（如 `file:///data/user/0/...`），不是 HTTP URL。在 Web 开发中你习惯用 URL 引用资源，但在移动端你需要用文件系统路径或者 base64。

## 实际开发建议

- **签名板场景**：用户在 Canvas 上手写签名后，使用 `captureRef` 将签名区域导出为 PNG 图片，然后上传到服务器。建议使用 `result: 'base64'` 方便直接通过 API 传输。
- **海报/分享卡片生成**：先在屏幕上用 React Native 组件布局一张"海报"（可以隐藏显示），然后用 `captureRef` 导出为图片。记得用 PixelRatio 换算确保输出尺寸正确。
- **调试辅助**：开发阶段可以将截图保存到本地来调试 UI 布局问题，特别是在不同屏幕尺寸下验证渲染效果。（基于经验建议）

## 总结

`captureRef`（来自 `react-native-view-shot`）是 Expo / React Native 中将视图截图保存为图片的核心工具。它已预装在 Expo Go 中，安装简单，使用方式直观——传入视图 ref 和配置选项即可获得图片结果。

最关键的两个知识点是：
1. **PixelRatio 换算**——确保输出图片的物理像素尺寸符合预期。
2. **`result` 类型的选择**——根据后续用途（上传、预览、保存）选择合适的返回格式。

对于有 Web 开发背景的开发者来说，这个 API 可以理解为"React Native 版的 html2canvas"，但性能更好、质量更高，因为它调用的是原生平台的截图能力。

---

## 文档导航

- **上一页**：[svg](./240__svg.md)
- **下一页**：[webview](./242__webview.md)
