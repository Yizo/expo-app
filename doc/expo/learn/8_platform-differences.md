# 在 Expo 通用应用中处理平台差异

> 原文标题：**Handle platform differences**  
> 文档修改日期：**2026 年 6 月 3 日**

## 文档解决的问题

Android、iOS 和 Web 的运行环境及能力并不完全相同。即使使用同一套 React Native / Expo 代码，也可能无法依靠同一个库实现所有功能。

本教程以“保存编辑后的图片”为例：

- Android 和 iOS：使用 `react-native-view-shot` 截取 React Native 视图。
- Web：浏览器不能使用相同方式截图，因此改用 `dom-to-image` 截取 DOM 节点。
- 通过 React Native 的 `Platform` 模块，在运行时选择对应平台的实现。

最终目标是：虽然底层实现不同，但三个平台都能完成“截取并保存图片”的功能。

## 适用场景

这篇文档适合以下情况：

- 使用 Expo 开发同时运行于 Android、iOS 和 Web 的通用应用。
- 某个 React Native 库只支持原生平台，不支持浏览器。
- 希望保留统一的用户功能，同时允许不同平台使用不同实现。
- 需要在 Web 中将某块界面导出为 JPEG 图片。

当前文档只讨论截图保存功能的平台差异，没有系统介绍所有平台适配方案。

---

## 阅读前需要理解的概念

### 通用应用

这里的“通用应用”指同一个 Expo 项目可以运行在：

- Android
- iOS
- Web 浏览器

“同一个项目”不代表每个平台的能力和底层 API 都完全相同。某些功能仍然需要平台专用代码。

### Native 与 Web

本文中的 `native` 主要指 Android 和 iOS。

React Web 开发者可以这样理解：

| 平台 | 界面基础 |
|---|---|
| Web | 浏览器 DOM，例如 `div`、`a` |
| Android / iOS | React Native 视图和原生平台能力 |

React Native 的 `<View>` 在 Web 上运行时会对应浏览器中的 DOM 结构，但在 Android 和 iOS 上不是浏览器 DOM。

因此：

- `dom-to-image` 面向浏览器 DOM。
- `react-native-view-shot` 面向 React Native 原生视图。
- 两者不能在所有平台上直接互换。

### DOM 节点

DOM 节点是浏览器页面中的元素节点。对 React Web 开发者来说，就是 React 组件最终渲染出来的 HTML 元素。

`dom-to-image` 可以把某个 DOM 节点转换成：

- SVG 矢量图
- PNG 位图
- JPEG 位图

本教程使用 JPEG。

### `Platform` 模块

`Platform` 是 React Native 提供的平台判断模块。

```tsx
Platform.OS
```

本文涉及的值包括：

- `'web'`
- Android 或 iOS 对应的非 `'web'` 值

教程使用：

```tsx
if (Platform.OS !== 'web') {
  // Android 和 iOS
} else {
  // Web
}
```

这类似于 React Web 项目中根据浏览器环境选择不同实现，但判断依据是 Expo / React Native 当前运行的平台。

---

## 实现流程

## 1. 安装 `dom-to-image`

首先停止开发服务器，然后选择项目正在使用的包管理器执行一条安装命令。

```sh
# npm
npm install dom-to-image

# yarn
yarn add dom-to-image

# pnpm
pnpm add dom-to-image

# bun
bun add dom-to-image
```

这些命令作用相同，只需要执行其中一条。

安装完成后：

1. 重新启动开发服务器。
2. 在终端中按 `W`，在 Web 浏览器中运行应用。

### 重要说明

> **文档明确说明：**本教程使用 `dom-to-image` 是为了演示平台差异处理。对于生产应用，应该根据具体需求评估其他解决方案或 API。

也就是说，教程并没有将 `dom-to-image` 推荐为所有生产场景下的默认选择。

---

## 2. 在页面中导入平台相关依赖

修改文件：

```text
app/(tabs)/index.tsx
```

导入 React Native 的 `Platform`：

```tsx
import {
  ImageSourcePropType,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
```

导入 Web 截图库：

```tsx
import domtoimage from 'dom-to-image';
```

原生端继续使用已有的库：

```tsx
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library/legacy';
```

各依赖的职责如下：

| 模块 | 用途 |
|---|---|
| `Platform` | 判断应用当前运行平台 |
| `dom-to-image` | 在 Web 中把 DOM 节点转换成图片 |
| `react-native-view-shot` | 在 Android 和 iOS 中截取 React Native 视图 |
| `expo-media-library/legacy` | 将原生端生成的图片保存到设备媒体库 |

文档没有介绍这些原生库的安装过程，说明它们来自教程前面的章节。

---

## 3. 获取需要截图的视图

组件中创建了一个 ref：

```tsx
const imageRef = useRef<View>(null);
```

然后将其绑定到需要截图的 `<View>`：

```tsx
<View ref={imageRef} collapsable={false}>
  <ImageViewer
    imgSource={PlaceholderImage}
    selectedImage={selectedImage}
  />
  {pickedEmoji && (
    <EmojiSticker
      imageSize={40}
      stickerSource={pickedEmoji}
    />
  )}
</View>
```

`imageRef` 指向包含以下内容的视图：

- 用户选择或默认显示的图片
- 用户添加的表情贴纸

保存时，程序截取的是这块组合后的界面。

### `imageRef.current`

对于熟悉 React Web 的开发者，可以将它理解为：

```tsx
const elementRef = useRef(null);
```

绑定后，通过 `elementRef.current` 获取实际渲染对象。

在 Web 分支中，`dom-to-image` 接收的是：

```tsx
imageRef.current
```

### `collapsable={false}`

原文代码保留了：

```tsx
collapsable={false}
```

但当前文档没有进一步解释它的作用，因此不能仅基于本文给出更详细结论。

---

## 4. 根据平台选择截图实现

核心逻辑位于：

```tsx
const onSaveImageAsync = async () => {
  // ...
};
```

整体结构如下：

```tsx
if (Platform.OS !== 'web') {
  // Android 和 iOS
} else {
  // Web
}
```

这里分离的是底层实现，而不是用户功能：

- 用户操作仍然是点击 Save。
- `onSaveImageAsync()` 仍然是统一入口。
- 函数内部根据平台选择不同截图和保存方式。

---

## Android 和 iOS 的处理流程

```tsx
if (Platform.OS !== 'web') {
  try {
    const localUri = await captureRef(imageRef, {
      height: 440,
      quality: 1,
    });

    await MediaLibrary.saveToLibraryAsync(localUri);

    if (localUri) {
      alert('Saved!');
    }
  } catch (e) {
    console.log(e);
  }
}
```

处理过程为：

1. `captureRef()` 截取 `imageRef` 对应的视图。
2. 返回图片在本地设备上的 URI。
3. `saveToLibraryAsync()` 将图片保存到设备媒体库。
4. 保存后显示 `Saved!`。
5. 失败时将错误输出到控制台。

### 截图参数

```tsx
{
  height: 440,
  quality: 1,
}
```

| 参数 | 本文中的值 | 含义 |
|---|---:|---|
| `height` | `440` | 截图高度 |
| `quality` | `1` | 截图质量 |

当前文档没有进一步说明参数单位、可选范围或默认值。

---

## Web 的处理流程

```tsx
const dataUrl = await domtoimage.toJpeg(imageRef.current, {
  quality: 0.95,
  width: 320,
  height: 440,
});
```

`toJpeg()` 将 `imageRef.current` 对应的 DOM 节点转换为 JPEG，并返回 Data URL。

### 转换参数

| 参数 | 本文中的值 | 作用 |
|---|---:|---|
| `quality` | `0.95` | JPEG 输出质量 |
| `width` | `320` | 输出图片宽度 |
| `height` | `440` | 输出图片高度 |

当前文档没有进一步说明这些参数的可选范围和单位。

### Data URL

`dataUrl` 是可以直接作为图片地址使用的数据字符串，不是原生设备上的文件路径。

这就是为什么 Web 分支不能直接复用原生分支的：

```tsx
MediaLibrary.saveToLibraryAsync(localUri)
```

浏览器需要通过下载机制保存生成的图片。

---

## 5. 在浏览器中触发图片下载

生成 JPEG 后，代码创建一个 `<a>` 元素：

```tsx
let link = document.createElement('a');
link.download = 'sticker-smash.jpeg';
link.href = dataUrl;
link.click();
```

处理过程为：

1. 通过 `document.createElement('a')` 创建链接元素。
2. 通过 `download` 指定下载文件名。
3. 将生成的 Data URL 设置为链接地址。
4. 调用 `click()` 模拟点击，触发浏览器下载。

下载文件名为：

```text
sticker-smash.jpeg
```

这部分代码使用了浏览器专属 API：

```tsx
document.createElement(...)
```

它只能放在 Web 分支中执行，不能假设 Android 或 iOS 存在浏览器的 `document` 对象。

---

## 6. 修复 TypeScript 模块声明错误

安装并导入 `dom-to-image` 后，TypeScript 可能无法找到该模块的类型定义。

教程要求在项目根目录创建：

```text
types.d.ts
```

文件内容为：

```tsx
declare module 'dom-to-image';
```

这条声明的作用是告诉 TypeScript：

> 项目中存在名为 `dom-to-image` 的模块，允许代码导入它。

### 需要注意

这种写法只声明了模块存在，并没有为 `domtoimage` 的方法、参数和返回值提供完整类型。

因此，TypeScript 可以不再报告“找不到模块声明”，但无法为这个库提供完整的类型检查和自动补全。

其中后半部分属于**基于该声明方式推导**，原文只明确要求添加声明来解决 TypeScript 模块错误。

---

## 完整调用链

点击保存按钮后的流程可以概括为：

```text
用户点击 Save
    ↓
调用 onSaveImageAsync()
    ↓
读取 Platform.OS
    ↓
判断是否为 Web
    ├─ Android / iOS
    │    ↓
    │  captureRef(imageRef)
    │    ↓
    │  获得本地 URI
    │    ↓
    │  保存到设备媒体库
    │
    └─ Web
         ↓
       domtoimage.toJpeg(imageRef.current)
         ↓
       获得 Data URL
         ↓
       创建 <a download>
         ↓
       触发浏览器下载
```

---

## 注意事项与限制

### 不同平台不能强行使用同一底层 API

文档的核心不是简单地添加一次平台判断，而是承认各平台能力不同：

- 原生端截取 React Native 视图并写入媒体库。
- Web 端截取 DOM 节点并通过浏览器下载。

应用可以提供一致的功能，但实现不一定一致。

### `dom-to-image` 只是演示方案

文档明确警告：生产应用应评估更适合具体需求的方案或 API。

当前文档没有提供其他候选库，也没有比较兼容性、性能或维护状态。

### 安装后必须重启开发服务器

文档明确要求：

1. 安装前停止开发服务器。
2. 安装后重新启动。
3. 按 `W` 启动 Web 版本。

### 浏览器下载不等于写入设备媒体库

原生分支使用媒体库 API，Web 分支使用浏览器下载。

因此，三个平台的用户结果相似，但保存位置和底层交互机制不同。这是**基于代码流程推导**出的开发影响。

### 错误处理较简单

两个分支都只执行：

```tsx
catch (e) {
  console.log(e);
}
```

文档没有介绍：

- 如何向用户显示失败信息
- 如何重试
- 如何分类处理错误
- 浏览器拒绝下载时如何处理

### 当前文档未涉及的内容

本文没有说明：

- `dom-to-image` 在不同浏览器中的兼容性
- 截取远程图片时是否存在跨域限制
- 大尺寸图片的性能或内存影响
- 如何为 Android、iOS 和 Web 分别创建独立文件
- 如何测试不同平台的截图结果
- 如何定制下载目录
- 如何处理保存权限被拒绝
- `react-native-view-shot` 和媒体库相关依赖的安装步骤
- `collapsable={false}` 的详细作用

不能仅根据当前文档为这些问题给出确定结论。

---

## React Web 开发者容易误解的地方

### React Native 的 `<View>` 不总是 DOM

在 Web 上，它最终可以对应 DOM；但在 Android 和 iOS 上，它不是浏览器元素。

因此下面的代码只能放在 Web 路径：

```tsx
document.createElement('a');
```

### `Platform.OS` 不是浏览器特性检测

它判断当前运行平台，不是在检测某个具体 API 是否存在。

本文只用它区分：

```tsx
Platform.OS !== 'web'
```

### 一个 ref 在不同平台上对应不同底层对象

同一个 `imageRef`：

- 原生端传给 `captureRef()`。
- Web 端通过 `imageRef.current` 传给 `domtoimage.toJpeg()`。

调用方式不同，是因为两个库面向的运行环境不同。

### “通用代码”不等于“完全没有平台分支”

本文展示的模式是：

- 尽可能共享组件、状态和用户交互。
- 只在平台能力确实不同的位置分支。
- 对外保留统一的业务操作入口。

这一结论属于**基于文档代码结构推导**。

---

## 实际开发中如何运用

### 文档明确展示的做法

1. 先确认功能在各平台上的支持情况。
2. 为缺少支持的平台选择替代实现。
3. 使用 `Platform.OS` 在统一函数中选择实现。
4. 将平台专属 API 限制在对应分支内。
5. 保持用户操作和业务目标一致。
6. 为没有 TypeScript 类型声明的库补充模块声明。

### 基于文档内容推导

实际项目中可以将这种模式应用于其他平台差异，例如：

- 某个功能在原生端使用设备 API，在 Web 端使用浏览器 API。
- 同一个按钮根据平台调用不同服务。
- 共享 UI 和状态，只替换平台相关的底层实现。

这篇教程体现的关键设计原则是：

> 统一的是产品功能和调用入口，不一定是底层实现。

### 基于经验建议

当平台分支不断增多时，可以考虑把不同实现拆到独立模块中，避免业务组件中出现大量 `Platform.OS` 判断。

不过，当前文档没有介绍这种拆分方式，不能将其视为本文规定的实现。

---

## 明确内容与推导内容

### 文档明确说明

- Android 和 iOS 可以使用 `react-native-view-shot` 截图，Web 浏览器不能。
- Web 使用 `dom-to-image` 截取 DOM 节点。
- 使用 `Platform.OS` 区分 Web 和原生平台。
- Web 端使用 `domtoimage.toJpeg()` 生成 JPEG。
- Web 端通过 `<a>` 元素触发下载。
- 原生端继续使用 `captureRef()` 和媒体库保存逻辑。
- 需要创建 `types.d.ts` 并声明 `dom-to-image` 模块。
- `dom-to-image` 在这里主要用于演示，生产应用应评估其他方案。

### 基于文档内容推导

- 通用应用可以共享业务入口，但允许平台使用不同底层实现。
- Web 下载和原生媒体库保存的最终位置及交互机制不同。
- `declare module 'dom-to-image'` 只能消除模块缺失错误，不能提供完整类型安全。
- 平台专属浏览器 API 必须被限制在 Web 分支内。

---

## 总结

本教程通过截图保存功能说明了 Expo 通用应用处理平台差异的基本方式：

```tsx
if (Platform.OS !== 'web') {
  // 使用原生能力
} else {
  // 使用浏览器能力
}
```

Android 和 iOS 使用 `react-native-view-shot` 截取视图，并通过媒体库 API 保存；Web 使用 `dom-to-image` 将 DOM 节点转换为 JPEG，再通过浏览器链接触发下载。

对于 React Web 开发者，最重要的认识是：Expo 可以共享 React 组件和业务逻辑，但 Android、iOS 与 Web 并不是相同的运行环境。遇到能力差异时，应保持功能和调用入口一致，同时为各平台选择合适的底层实现。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 应用中截取指定视图并保存到系统相册](./7_screenshot.md) | [下一页：配置状态栏、启动屏幕和应用图标 →](./9_configuration.md)
<!-- NAVIGATION END -->
