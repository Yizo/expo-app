# 在 Expo 应用中截取指定视图并保存到系统相册

> 原文档：**Take a screenshot**  
> 文档修改日期：**2026 年 6 月 3 日**  
> 本文仅基于所提供的官方文档内容整理。

## 文档解决的问题

这篇教程讲解如何在 Expo 应用中完成下面的流程：

1. 截取应用界面中的一个指定区域。
2. 将这个区域生成为图片文件。
3. 获取生成图片的本地 URI。
4. 将图片保存到 Android 或 iOS 设备的媒体库，也就是用户通常理解的系统相册。

这里的“截图”不是截取整个手机屏幕，而是把一个指定的 React Native `<View>` 渲染为图片。

最终实现的用户流程是：

```text
选择照片
  ↓
在照片上添加贴纸
  ↓
点击 Save
  ↓
截取“照片 + 贴纸”区域
  ↓
保存到设备相册
```

## 适用场景

这套方案适用于需要将应用内某块 UI 导出为图片的功能，例如：

- 图片编辑器
- 海报或卡片生成器
- 照片与贴纸合成
- 分享图片生成
- 将应用中的某个结果保存到相册

**基于文档内容推导：**因为截图目标是一个 `<View>`，所以这套方法也可以理解为 React Web 中将某个 DOM 匵域导出为图片，而不是调用操作系统的全屏截图功能。

当前文档只演示了 Android 和 iOS 上保存到媒体库的流程。Web 平台差异将在下一章处理，本章没有给出 Web 实现。

---

## 阅读前需要理解的背景

### Expo 与 React Native

React Native 使用 React 的组件和状态模型开发移动应用，但最终渲染的不是浏览器 DOM，而是移动端原生视图。

例如：

| React Web | React Native |
|---|---|
| `<div>` | `<View>` |
| CSS | `StyleSheet` 或组件样式 |
| 浏览器文件 URL | 设备本地文件 URI |
| 浏览器下载 | 保存到系统媒体库 |

因此，Web 中操作 DOM 的截图工具不能直接用于 React Native。

### 第三方库与 Expo 模块

本教程使用两个主要依赖：

| 依赖 | 作用 |
|---|---|
| `react-native-view-shot` | 将指定的 React Native `<View>` 截取为图片 |
| `expo-media-library` | 将生成的图片保存到设备媒体库 |

权限申请则使用已有的：

```ts
expo-image-picker
```

文档通过 `expo-image-picker` 提供的 `useMediaLibraryPermissions()` Hook 请求媒体库读写权限。

Expo 本身不会覆盖所有移动端能力。文档指出，可以根据具体需求在 React Native Directory 中寻找第三方库。本教程此前也使用过 `react-native-gesture-handler` 和 `react-native-reanimated`。

---

## 第一步：安装所需库

根据项目使用的包管理器执行对应命令。

### npm

```sh
npx expo install react-native-view-shot expo-media-library
```

### Yarn

```sh
yarn expo install react-native-view-shot expo-media-library
```

### pnpm

```sh
pnpm expo install react-native-view-shot expo-media-library
```

### Bun

```sh
bun expo install react-native-view-shot expo-media-library
```

### 为什么使用 `expo install`

`expo install` 用于安装与当前 Expo 项目兼容的依赖版本。

**当前文档明确说明：**需要安装 `react-native-view-shot` 和 `expo-media-library`。

**当前文档未涉及：**

- 具体安装了哪些版本
- 是否需要重新生成原生工程
- 是否需要重新构建开发客户端
- Android 或 iOS 的额外原生配置
- `app.json` 或 `app.config.js` 权限配置

不能仅根据本章判断这些配置是否在所有项目环境中都不需要。

---

## 第二步：请求媒体库权限

### 为什么需要权限

访问设备媒体库属于敏感操作。应用必须请求用户授权，用户可以允许或拒绝。

教程使用：

```tsx
ImagePicker.useMediaLibraryPermissions()
```

示例：

```tsx
import { useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

const [permissionResponse, requestPermission] =
  ImagePicker.useMediaLibraryPermissions();

useEffect(() => {
  if (!permissionResponse?.granted) {
    requestPermission();
  }
}, []);
```

### Hook 返回的内容

```ts
const [permissionResponse, requestPermission] =
  ImagePicker.useMediaLibraryPermissions();
```

| 返回值 | 含义 |
|---|---|
| `permissionResponse` | 当前媒体库权限状态 |
| `requestPermission` | 触发系统权限请求的方法 |

这个 Hook 请求媒体库的读取和写入权限，覆盖：

- 从媒体库选择图片
- 将截图保存到媒体库

### 权限状态变化

根据文档描述：

```text
应用首次加载
  ↓
permissionResponse 为 null
  ↓
调用 requestPermission()
  ↓
用户允许或拒绝
  ↓
允许后 permissionResponse.granted 为 true
```

代码使用了可选链：

```ts
permissionResponse?.granted
```

当 `permissionResponse` 为 `null` 时，这个表达式得到 `undefined`，因此：

```ts
!permissionResponse?.granted
```

结果为 `true`，会触发权限请求。

### 容易踩坑的地方

文档中的效果是：组件第一次挂载时，只要权限不是已授予状态，就立即请求权限。

这意味着应用可能在用户还没有点击“保存”时就弹出系统权限窗口。

**基于文档内容推导：**权限被拒绝后，当前代码没有向用户解释原因，也没有展示替代界面或引导用户前往系统设置。

**当前文档未涉及：**

- 用户永久拒绝权限后的处理
- 如何判断是否还能再次弹出权限请求
- 如何跳转到系统设置
- 不同 Android/iOS 版本的权限差异
- 权限申请失败后的错误提示
- 权限 Hook 是否应放入 `useEffect` 依赖数组

---

## 第三步：使用 ref 标记需要截图的视图

### 什么是 ref

React Web 中，ref 通常用于获取一个 DOM 节点：

```tsx
const ref = useRef<HTMLDivElement>(null);
```

React Native 中没有 DOM，但可以通过 ref 引用一个原生视图。本教程通过 ref 告诉截图工具：

> 需要截取的是这个 `<View>`。

### 创建 ref

```tsx
import { useRef } from 'react';
import { View } from 'react-native';

const imageRef = useRef<View>(null);
```

这里的 `View` 是 TypeScript 类型参数，表示这个 ref 指向 React Native 的 `<View>`。

### 将 ref 绑定到截图区域

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

这个 `<View>` 包含：

- 背景图片组件 `ImageViewer`
- 用户选择的贴纸组件 `EmojiSticker`

因此，最终生成的图片包含“背景图片 + 贴纸”。

### `collapsable={false}` 的作用

React Native 可能会优化掉某些仅用于布局、没有必要对应原生节点的 `<View>`。

这里设置：

```tsx
collapsable={false}
```

文档说明，这样可以让截图目标保持为包含背景图片和贴纸的 `<View>`。

**对 React Web 开发者的类比：**可以把它理解为确保这个包装元素确实存在于可捕获的原生视图树中，而不是被渲染优化合并掉。

不要将 `collapsable` 理解为 Web CSS 中控制元素折叠或展开的属性，它与 `display: none`、折叠菜单没有关系。

---

## 第四步：截取视图

教程从 `react-native-view-shot` 导入：

```tsx
import { captureRef } from 'react-native-view-shot';
```

调用方式：

```tsx
const localUri = await captureRef(imageRef, {
  height: 440,
  quality: 1,
});
```

### `captureRef()` 的职责

`captureRef()` 接收目标视图的 ref，并将它生成一张图片。

它返回一个 Promise。Promise 完成后得到截图文件的 URI：

```ts
const localUri: string
```

这里的 URI 表示设备上的本地图片文件地址，不是浏览器中的远程 HTTP URL。

### 截图选项

文档说明可以通过第二个参数传入截图区域的宽度和高度。示例实际传入：

```ts
{
  height: 440,
  quality: 1,
}
```

| 配置 | 文档中的用途 |
|---|---|
| `height` | 指定截图区域高度 |
| `width` | 可以指定截图区域宽度，但示例没有设置 |
| `quality` | 示例设置为 `1` |

**当前文档未明确说明：**

- `height` 和 `width` 使用什么单位
- `quality` 的完整取值范围
- 默认图片格式
- 默认宽度如何确定
- 截图尺寸与设备像素密度的关系
- 图片质量对文件大小和性能的影响

文档将其他可用选项交由 `react-native-view-shot` 的库文档说明。

---

## 第五步：保存到设备媒体库

导入媒体库模块：

```tsx
import * as MediaLibrary from 'expo-media-library/legacy';
```

保存截图：

```tsx
await MediaLibrary.saveToLibraryAsync(localUri);
```

完整的保存函数是：

```tsx
const onSaveImageAsync = async () => {
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
};
```

### 执行顺序

```text
用户点击 Save
  ↓
调用 onSaveImageAsync()
  ↓
captureRef(imageRef) 截取指定 View
  ↓
获得截图文件的 localUri
  ↓
saveToLibraryAsync(localUri)
  ↓
图片进入设备媒体库
  ↓
显示 Saved!
```

### 为什么需要 `async/await`

截图和保存文件都不是同步完成的：

- `captureRef()` 返回 Promise
- `saveToLibraryAsync()` 返回 Promise

因此函数需要声明为：

```ts
async
```

并使用：

```ts
await
```

等待每一步完成。

这与 React Web 中等待 `fetch()` 或文件上传完成的写法相同。

### 错误处理

两步操作都放在 `try...catch` 中：

```tsx
try {
  // 截图并保存
} catch (e) {
  console.log(e);
}
```

因此截图失败或保存失败都会进入 `catch`。

不过当前实现只把错误打印到控制台，没有向用户显示保存失败提示。

---

## 完整功能中各状态的作用

示例包含以下状态：

| 状态 | 作用 |
|---|---|
| `selectedImage` | 保存用户选择图片的 URI |
| `showAppOptions` | 控制是否显示编辑操作区域 |
| `isModalVisible` | 控制贴纸选择弹窗是否显示 |
| `pickedEmoji` | 保存用户选择的贴纸资源 |
| `permissionResponse` | 保存媒体库权限状态 |

与截图直接相关的核心对象是：

```tsx
const imageRef = useRef<View>(null);
```

选择图片、显示弹窗和选择贴纸属于前面章节建立的编辑功能，本章是在此基础上增加“保存合成结果”。

---

## 文件与目录说明

文档先要求将权限代码加入：

```text
src/app/(tabs)/index.tsx
```

后面又要求在以下文件更新保存函数：

```text
app/(tabs)/index.tsx
```

这两个路径在原文中不一致。

**文档明确内容：**两处都指向标签页中的 `index.tsx` 页面。

**基于文档内容推导：**实际应修改项目中真实存在的那个页面文件，而不是同时创建两份文件。仅凭当前文档无法确定示例项目最终使用了 `src/app` 还是根目录下的 `app`。

路径中的：

```text
(tabs)
```

通常表示一个用于组织标签页路由的目录。括号是路由结构的一部分，不表示普通 URL 路径片段。

本章还引用了以下项目内容：

```text
components/Button
components/CircleButton
components/EmojiList
components/EmojiPicker
components/IconButton
components/ImageViewer
components/EmojiSticker
assets/images/background-image.png
```

这些组件和资源不是本章新建的。本章假设它们已经由教程前面的章节实现。

---

## React Web 开发者最容易误解的地方

### 1. 这不是全屏截图

截取目标由下面的 ref 决定：

```tsx
<View ref={imageRef}>
```

按钮、底部操作栏和弹窗不会自动进入截图。只有这个 `<View>` 内渲染的内容会被捕获。

### 2. `<View>` 不是 `<div>`

虽然两者都常用于布局，但 `<View>` 是 React Native 组件，最终对应移动端原生视图，不是浏览器 DOM。

因此不能使用：

```ts
document.querySelector()
```

获取它，也不能使用只支持 DOM 的截图工具。

### 3. 本地 URI 不等于网页 URL

`captureRef()` 返回的 `localUri` 是设备本地文件的位置。它随后被传给原生媒体库 API：

```tsx
MediaLibrary.saveToLibraryAsync(localUri);
```

它不是用于在浏览器中访问的普通 URL。

### 4. 生成文件不等于保存到相册

`captureRef()` 只负责生成截图文件并返回 URI。

真正将文件保存到用户媒体库的是：

```tsx
MediaLibrary.saveToLibraryAsync(localUri);
```

这是两个独立步骤。

### 5. 移动端敏感能力需要系统权限

React Web 经常由浏览器统一处理下载，而移动应用访问相册时需要操作系统权限。

用户拒绝后，代码不能假设保存仍然可以完成。

### 6. `collapsable` 不是 UI 展开状态

```tsx
collapsable={false}
```

与菜单折叠无关。它影响的是 React Native 是否可以在原生视图树中优化掉这个 `<View>`。

### 7. 本章没有实现 Web 端

文档明确表示下一章才会处理移动端与 Web 平台的差异。因此不能认为当前方案已经是 Android、iOS 和 Web 通用实现。

---

## 注意事项与限制

### 文档明确说明的内容

- 使用 `react-native-view-shot` 截取指定 `<View>`。
- `captureRef()` 返回截图文件的 URI。
- 使用 `expo-media-library` 将截图保存到设备媒体库。
- 保存前需要请求媒体库权限。
- 权限 Hook 同时请求读写权限。
- 用户可以允许或拒绝权限。
- 可以为 `captureRef()` 设置截图宽度和高度。
- `collapsable={false}` 用于保证目标 `<View>` 可以被截图。
- 本章结果面向 Android 和 iOS。
- Web 平台差异由下一章处理。

### 基于文档内容推导

- 截图范围完全由 `imageRef` 所绑定的 `<View>` 决定。
- 目标 `<View>` 外面的按钮和操作栏不会出现在结果中。
- 当前代码缺少面向用户的权限拒绝提示。
- 当前代码缺少保存失败提示。
- `alert('Saved!')` 只能说明程序执行到了保存完成之后，不能替代完善的状态展示。
- 保存过程中没有禁用按钮，用户可能连续触发多次保存。
- 文件路径 `src/app/(tabs)/index.tsx` 与 `app/(tabs)/index.tsx` 存在不一致，应以实际项目结构为准。

### 当前文档未涉及

- 权限被永久拒绝后的恢复流程
- 保存到指定相册
- 自定义文件名
- 截图文件格式
- 截图宽高与像素密度
- 大尺寸视图的性能和内存影响
- 滚动区域或屏幕外内容的截图
- 截图透明背景
- 分享截图
- 保存进度状态
- 自动化测试方法
- 模拟器和真机之间的行为差异
- Web 平台的具体实现
- 应用商店权限说明配置
- `expo-media-library/legacy` 与非 legacy API 的区别

---

## 实际开发中如何使用

在类似图片编辑器的功能中，可以按以下职责划分代码：

```text
可编辑内容区域
  └── 使用 ref 标记为截图目标

Save 按钮
  └── 调用 captureRef()

captureRef()
  └── 返回本地 URI

MediaLibrary.saveToLibraryAsync()
  └── 将 URI 对应的图片保存到系统媒体库
```

最小核心实现可以概括为：

```tsx
const imageRef = useRef<View>(null);

const onSaveImageAsync = async () => {
  try {
    const localUri = await captureRef(imageRef, {
      height: 440,
      quality: 1,
    });

    await MediaLibrary.saveToLibraryAsync(localUri);
    alert('Saved!');
  } catch (error) {
    console.log(error);
  }
};

return (
  <>
    <View ref={imageRef} collapsable={false}>
      {/* 需要导出为图片的内容 */}
    </View>

    <Button onPress={onSaveImageAsync} />
  </>
);
```

**基于经验建议：**实际产品中应在保存前确认权限状态，并为权限拒绝、截图失败、保存失败以及保存中状态提供明确 UI。该建议不是当前文档给出的实现要求。

---

## 总结

本章建立了一个清晰的移动端图片导出流程：

```text
useMediaLibraryPermissions()
  → 获取媒体库权限

useRef<View>()
  → 标记需要截图的界面区域

captureRef()
  → 将该区域生成图片并返回本地 URI

MediaLibrary.saveToLibraryAsync()
  → 将图片保存到设备媒体库
```

对 React Web 开发者来说，最重要的是区分三个概念：

1. ref 指向的是 React Native 原生视图，不是 DOM。
2. 截图只覆盖 ref 对应的 `<View>`，不是整个屏幕。
3. 生成截图文件和保存到系统相册是两个独立步骤。

本章完成的是 Android 和 iOS 上的截图保存功能；如何在 Web 上实现相同功能，当前文档未涉及。
