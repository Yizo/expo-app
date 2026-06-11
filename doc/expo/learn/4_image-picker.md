# 使用 Expo Image Picker 选择并显示图片

> 原文标题：Use an image picker  
> 文档更新时间：2026 年 6 月 3 日  
> 本文严格基于所提供的官方文档整理。

## 文档解决的问题

React Native 的核心组件提供了 `<View>`、`<Text>`、`<Pressable>` 等基础 UI 能力，但不能直接打开设备相册。

本教程使用 Expo SDK 中的 `expo-image-picker` 库，实现以下流程：

1. 安装图片选择库。
2. 点击按钮打开设备的媒体库。
3. 允许用户选择并裁剪图片。
4. 获取所选图片的 URI。
5. 将 URI 保存到 React state。
6. 在应用中显示用户选择的图片。

这适合头像选择、图片编辑、内容发布、贴纸制作等需要从设备媒体库获取图片的场景。

---

## 阅读前需要理解的概念

### React Native 核心组件

React Native 提供一些标准 UI 构建组件：

- `<View>`：类似 Web 中用于布局的 `<div>`。
- `<Text>`：用于显示文字，类似文本元素。
- `<Pressable>`：用于处理按压操作，可类比带点击事件的按钮。
- `<Image>`：用于显示图片。

但是，打开手机系统相册不属于普通 UI 组件的能力，需要额外的库。

### Expo SDK

Expo SDK 提供 React Native 核心组件之外的功能。本教程使用的 `expo-image-picker` 就是其中一个库。

根据文档，`expo-image-picker` 可以打开手机系统提供的界面，让用户从媒体库中选择图片或视频。

### URI

用户选择的图片不是项目中通过 `require()` 引入的静态资源，而是以 URI 字符串表示，例如：

```text
file:///data/user/0/.../ImagePicker/example.jpeg
```

React Web 开发者可以将它理解为图片的资源地址。不过这里展示的是设备文件 URI，而不是常见的 HTTP URL。

---

## 安装 `expo-image-picker`

安装前先在终端中按 `Ctrl + C` 停止开发服务器，然后根据包管理器运行对应命令：

```sh
# npm
npx expo install expo-image-picker

# yarn
yarn expo install expo-image-picker

# pnpm
pnpm expo install expo-image-picker

# bun
bun expo install expo-image-picker
```

安装命令会：

- 安装 `expo-image-picker`。
- 将其添加到项目的 `package.json` 依赖中。

安装完成后重新启动开发服务器：

```sh
npx expo start
```

### 为什么使用 `expo install`

文档明确要求使用 `npx expo install` 或对应包管理器的 Expo 安装命令，而不是直接展示普通的 `npm install`。

文档没有进一步解释两者的差异，因此不要仅根据本文推测其版本选择规则。

### 安装注意事项

文档给出的通用建议是：

> 每次安装新库之前，都先停止开发服务器；安装完成后，再运行 `npx expo start`。

---

## 打开设备媒体库

主要修改文件：

```text
app/(tabs)/index.tsx
```

首先导入整个 `expo-image-picker` 模块：

```tsx
import * as ImagePicker from 'expo-image-picker';
```

然后在 `Index` 组件中定义异步函数：

```tsx
const pickImageAsync = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    console.log(result);
  } else {
    alert('You did not select any image.');
  }
};
```

### `launchImageLibraryAsync()`

这个方法会打开系统提供的媒体选择界面，让用户选择图片或视频。

它是异步方法，因此代码使用：

```tsx
await ImagePicker.launchImageLibraryAsync(...)
```

这类似于 React Web 中等待文件选择或异步 API 完成，但界面由设备系统提供，而不是应用自己实现 `<input type="file">`。

### 选项说明

传入的对象属于文档所说的 `ImagePickerOptions`：

```tsx
{
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 1,
}
```

| 配置 | 本教程中的值 | 作用 |
|---|---:|---|
| `mediaTypes` | `['images']` | 将本次选择限制为图片 |
| `allowsEditing` | `true` | 在 Android 和 iOS 的选择过程中允许用户裁剪图片 |
| `quality` | `1` | 本教程传入的图片质量配置 |

原文没有进一步解释 `quality` 的取值范围、压缩行为或平台差异，因此当前文档无法提供这些细节。

---

## 将选择函数连接到按钮

### 修改 Button 的 Props

文件：

```text
components/Button.tsx
```

为按钮增加可选的 `onPress` 属性：

```tsx
type Props = {
  label: string;
  theme?: 'primary';
  onPress?: () => void;
};
```

并从 Props 中取出它：

```tsx
export default function Button({ label, theme, onPress }: Props) {
```

将它传给主按钮内部的 `<Pressable>`：

```tsx
<Pressable
  style={[styles.button, { backgroundColor: '#fff' }]}
  onPress={onPress}
>
```

对于 React Web 开发者，这相当于：

```tsx
<button onClick={handler}>Choose a photo</button>
```

React Native 使用的是 `onPress`，而不是 DOM 中的 `onClick`。

### 在页面中传入函数

回到：

```text
app/(tabs)/index.tsx
```

把 `pickImageAsync` 传给主按钮：

```tsx
<Button
  theme="primary"
  label="Choose a photo"
  onPress={pickImageAsync}
/>
```

这里传递的是函数本身，而不是立即调用函数：

```tsx
// 正确：按下按钮时执行
onPress={pickImageAsync}
```

不要写成：

```tsx
// 会在渲染时调用，并且类型也不符合当前 Props
onPress={pickImageAsync()}
```

后一点属于**基于文档代码推导**。

### Button 组件中的特殊行为

教程代码只让 `theme="primary"` 的按钮使用传入的 `onPress`。

普通按钮仍然使用固定逻辑：

```tsx
onPress={() => alert('You pressed a button.')}
```

因此：

```tsx
<Button label="Use this photo" />
```

当前还没有实现真正的“使用图片”功能。

这是**根据文档代码可以直接观察到的行为**。

---

## 理解图片选择结果

`launchImageLibraryAsync()` 返回一个结果对象。

成功选择图片时，结果示例为：

```json
{
  "assets": [
    {
      "assetId": null,
      "base64": null,
      "duration": null,
      "exif": null,
      "fileName": "example.jpeg",
      "fileSize": 4513577,
      "height": 4570,
      "mimeType": "image/jpeg",
      "rotation": null,
      "type": "image",
      "uri": "file:///data/user/0/.../ImagePicker/example.jpeg",
      "width": 2854
    }
  ],
  "canceled": false
}
```

### 顶层字段

#### `canceled`

表示用户是否取消了选择：

```tsx
if (!result.canceled) {
  // 用户完成了选择
} else {
  // 用户取消了选择
}
```

必须先判断该字段，再读取所选资源。

#### `assets`

所选媒体资源组成的数组。教程从第一个元素中获取图片：

```tsx
result.assets[0]
```

### 图片资源字段

示例结果包含：

- `uri`：图片资源地址。
- `fileName`：文件名。
- `fileSize`：文件大小。
- `width`、`height`：图片尺寸。
- `mimeType`：媒体 MIME 类型。
- `type`：资源类型，本例为 `image`。
- `assetId`、`base64`、`duration`、`exif`、`rotation`：示例中为 `null`。

当前教程只使用 `uri`。文档没有讲解其他字段的具体用法，也没有保证它们一定非空。

---

## 使用 state 保存所选图片

在页面中导入 React 的 `useState`：

```tsx
import { useState } from 'react';
```

声明状态：

```tsx
const [selectedImage, setSelectedImage] =
  useState<string | undefined>(undefined);
```

这个状态可能是：

- `undefined`：用户尚未选择图片。
- `string`：用户已经选择图片，值为图片 URI。

对于 React Web 开发者，这仍然是熟悉的 React state 模型。区别主要在于保存的是设备图片 URI。

### 保存图片 URI

修改成功分支：

```tsx
if (!result.canceled) {
  setSelectedImage(result.assets[0].uri);
} else {
  alert('You did not select any image.');
}
```

完整的数据流是：

```text
点击按钮
  ↓
调用 pickImageAsync
  ↓
打开系统媒体库
  ↓
用户选择图片
  ↓
取得 result.assets[0].uri
  ↓
调用 setSelectedImage
  ↓
组件重新渲染
```

---

## 将图片传给 ImageViewer

页面把 `selectedImage` 作为 prop 传给图片组件：

```tsx
<ImageViewer
  imgSource={PlaceholderImage}
  selectedImage={selectedImage}
/>
```

这里同时保留了两种图片来源：

```tsx
const PlaceholderImage =
  require('@/assets/images/background-image.png');
```

- `imgSource`：项目中内置的占位图片。
- `selectedImage`：用户从设备媒体库选择的图片 URI。

---

## 显示本地图片或占位图片

修改文件：

```text
components/ImageViewer.tsx
```

Props 定义：

```tsx
type Props = {
  imgSource: ImageSourcePropType;
  selectedImage?: string;
};
```

根据是否存在 `selectedImage` 计算图片来源：

```tsx
const imageSource = selectedImage
  ? { uri: selectedImage }
  : imgSource;
```

最后传给 `Image`：

```tsx
return <Image source={imageSource} style={styles.image} />;
```

### 为什么两种来源的格式不同

项目内置图片使用：

```tsx
require('@/assets/images/background-image.png')
```

用户选择的图片使用：

```tsx
{ uri: selectedImage }
```

因此不能直接把 URI 字符串作为当前代码中的 `source` 值，而是需要包装成：

```tsx
{ uri: selectedImage }
```

最终逻辑为：

```text
存在 selectedImage
  → 显示用户选择的图片

不存在 selectedImage
  → 显示项目中的占位图片
```

---

## React Web 开发者容易误解的地方

### 1. 没有使用文件输入框

Web 中通常通过下面的方式选择文件：

```html
<input type="file" accept="image/*" />
```

本教程没有 DOM，也没有文件输入框，而是调用：

```tsx
ImagePicker.launchImageLibraryAsync()
```

系统随后负责展示媒体选择界面。

### 2. 使用 `onPress` 而不是 `onClick`

React Native 的交互事件为：

```tsx
<Pressable onPress={pickImageAsync} />
```

而不是 Web 中的 `onClick`。

### 3. `source` 不等同于 Web 的 `src`

Web 中通常写：

```tsx
<img src={url} />
```

本教程使用：

```tsx
<Image source={{ uri: selectedImage }} />
```

`source` 接收的是 React Native/`expo-image` 对应的图片来源格式。

### 4. 选择结果是数组

即使本教程只使用一张图片，结果也位于：

```tsx
result.assets[0]
```

不能直接写成：

```tsx
result.uri
```

### 5. 用户取消不等于程序出错

用户可能关闭系统选择界面而不选图片。教程通过：

```tsx
result.canceled
```

处理这个分支，而不是把它作为异常处理。

### 6. `app/(tabs)` 的含义未解释

教程修改了：

```text
app/(tabs)/index.tsx
```

但当前文档没有解释 `(tabs)` 的目录语义，也没有介绍项目路由结构。

### 7. `@/` 路径别名未解释

代码使用了：

```tsx
import Button from '@/components/Button';
```

当前文档没有说明 `@/` 如何配置，因此不能从本文推导其配置方式。

---

## 注意事项与限制

### 文档明确说明

- React Native 核心组件无法直接完成设备媒体库选择功能。
- 需要安装 `expo-image-picker`。
- 安装新库前应停止开发服务器，安装后重新启动。
- `launchImageLibraryAsync()` 会打开系统媒体选择界面。
- `allowsEditing: true` 可在 Android 和 iOS 选择过程中允许裁剪。
- 返回结果包含 `canceled` 和 `assets`。
- 所选图片的 URI 位于 `result.assets[0].uri`。
- 所选图片 URI 与通过 `require()` 加载的本地占位资源不是同一种来源格式。

### 当前文档未涉及

以下内容无法仅根据当前教程确定：

- 相册权限如何声明或请求。
- 用户拒绝权限时如何处理。
- `quality` 的完整取值及平台差异。
- 是否支持一次选择多张图片。
- 视频选择的具体实现。
- 图片 URI 的长期有效性。
- 如何上传、复制、保存或删除所选图片。
- 如何处理选择器调用失败等异常。
- Android 与 iOS 除裁剪之外的行为差异。
- Web 平台上的具体行为。
- 图片大小、格式和分辨率限制。
- `expo-image-picker` 的完整 API。
- `assets` 数组为空时的处理方式。

不要把这些内容当作本教程已经解决的问题。

---

## 实际开发中的使用方式

根据教程，可以把实现拆成三层：

1. `Button` 负责触发操作。
2. 页面组件负责调用 Image Picker、处理结果并保存状态。
3. `ImageViewer` 负责根据 prop 显示占位图片或所选图片。

这种职责划分让 UI 组件不需要知道图片选择器的具体实现。

### 基于文档内容推导

实际使用结果前，应保持以下判断顺序：

```tsx
if (!result.canceled) {
  setSelectedImage(result.assets[0].uri);
}
```

先判断用户是否取消，再访问 `assets[0]`，可以避免在取消分支中读取不存在的选择结果。

### 基于经验建议

以下建议不是当前文档明确说明的内容：

- 在正式项目中，异步调用通常还需要考虑异常处理。
- 若后续需要上传或永久保存图片，应进一步确认 URI 的生命周期。
- 需要查阅完整 API 文档，确认权限、多选、格式和平台差异。
- 可以考虑为图片选择过程增加加载状态或重复点击保护。

---

## 总结

本教程完成了一个完整的图片选择和预览流程：

```text
安装 expo-image-picker
  ↓
调用 launchImageLibraryAsync()
  ↓
处理取消或成功结果
  ↓
读取 result.assets[0].uri
  ↓
保存到 selectedImage state
  ↓
通过 props 传给 ImageViewer
  ↓
使用 { uri: selectedImage } 显示图片
```

核心代码可以概括为：

```tsx
const [selectedImage, setSelectedImage] =
  useState<string | undefined>(undefined);

const pickImageAsync = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
  } else {
    alert('You did not select any image.');
  }
};
```

图片显示逻辑为：

```tsx
const imageSource = selectedImage
  ? { uri: selectedImage }
  : imgSource;
```

本章只解决“从设备媒体库选择图片并显示”的问题；图片上传、持久化、权限处理和完整错误处理均未在当前文档中展开。

<!-- NAVIGATION START -->
---
[← 上一页：使用 React Native 与 Expo 构建 StickerSmash 首屏](./3_build-a-screen.md) | [下一页：使用 React Native Modal 创建 Emoji 选择器 →](./5_create-a-modal.md)
<!-- NAVIGATION END -->
