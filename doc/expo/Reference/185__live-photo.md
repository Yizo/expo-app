# Expo LivePhoto 学习指南

`expo-live-photo` 是一个用于在 **iOS** 应用中显示和播放 Live Photo（实况照片）的 Expo 库。

> 本页是下一版本 Expo SDK 的未发布文档。文档标注的当前稳定版本为 **SDK 56**，实际项目应优先核对对应 SDK 版本的文档。

## 文档解决的问题

这篇文档主要说明：

- 如何安装 `expo-live-photo`
- 如何从系统相册选择 Live Photo
- 如何在 React Native 页面中显示它
- 如何通过手势或代码控制播放
- 如何监听加载、播放及错误事件
- Live Photo 的图片与视频资源需要满足什么条件

它适合需要在 iOS 应用中预览或播放用户实况照片的场景，例如：

- 相册选择器
- 图片预览页
- 社交媒体内容编辑器
- iOS 照片管理应用
- 支持 Live Photo 的上传前预览

当前文档只涉及 Live Photo 的**显示和播放**，未涉及拍摄、编辑、压缩、上传、下载或创建 Live Photo。

## 阅读前需要理解的概念

### Live Photo 不是普通视频

一张 Live Photo 由两部分组成：

1. 一张静态照片
2. 一段与照片配对的短视频

这两部分通过拍摄时写入的原生元数据建立关联。因此，组件接收的不是一个普通图片 URL，而是：

```ts
type LivePhotoAsset = {
  photoUri: string;
  pairedVideoUri: string;
};
```

对于 React Web 开发者，可以将它理解为一份必须同时包含“封面图片地址”和“配套视频地址”的资源描述。不过，它们之间还有 iOS 原生元数据关联，不能随意用两份普通媒体文件代替。

### Expo 与 React Native 的关系

React Native 使用原生组件构建 iOS 和 Android 界面，而不是像 React Web 那样渲染 HTML DOM。

Expo 在 React Native 之上提供了开发工具和原生能力封装。`expo-live-photo` 封装的是 iOS 原生 Live Photo 能力，所以：

- 它不是浏览器组件；
- 它不支持 Web；
- 当前文档只标注支持 iOS；
- JavaScript API 最终会调用 iOS 原生实现。

### URI

`photoUri` 和 `pairedVideoUri` 中的 URI 表示资源位置。示例中的 URI 来自 `expo-image-picker` 返回的本地媒体资源。

当前文档没有说明是否支持远程 HTTP URL，因此不能据此认定网络图片和网络视频可以直接使用。

## 安装

根据包管理器选择一条命令：

```sh
# npm
npx expo install expo-live-photo

# yarn
yarn expo install expo-live-photo

# pnpm
pnpm expo install expo-live-photo

# bun
bun expo install expo-live-photo
```

这里使用的是 `expo install`，而不是普通的 `npm install`。它会根据项目使用的 Expo SDK 选择兼容的依赖版本。

如果项目是已有的原生 React Native 工程，即通常所说的 bare React Native 项目，还需要先安装并配置 `expo`，使该工程能够使用 Expo Modules。

文档标注该库：

- 支持 iOS
- 已包含在 Expo Go 中

因此，在匹配版本的 Expo Go 中通常不需要自行编译该原生模块。对于自定义原生工程，仍需遵循 Expo Modules 的安装流程。

## 基本使用流程

文档示例将 `expo-live-photo` 与 `expo-image-picker` 组合使用，完整流程如下：

1. 从 iOS 系统相册选择 Live Photo。
2. 检查用户是否取消选择。
3. 检查返回结果中是否存在配套视频。
4. 将照片 URI 和视频 URI 组合成 `LivePhotoAsset`。
5. 把资源传给 `LivePhotoView`。
6. 通过手势或组件引用控制播放。

### 1. 导入依赖

```tsx
import * as ImagePicker from 'expo-image-picker';
import {
  LivePhotoAsset,
  LivePhotoView,
  LivePhotoViewType,
} from 'expo-live-photo';
import { useRef, useState } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
```

其中：

- `LivePhotoView`：负责显示和播放 Live Photo。
- `LivePhotoAsset`：Live Photo 资源的 TypeScript 类型。
- `LivePhotoViewType`：组件实例公开的方法类型。
- `expo-image-picker`：从系统媒体库选择 Live Photo。
- `View`、`Text`、`Button`：React Native 原生 UI 组件，不是 HTML 标签。

### 2. 保存资源并取得组件引用

```tsx
const viewRef = useRef<LivePhotoViewType>(null);
const [livePhoto, setLivePhoto] = useState<LivePhotoAsset | null>(null);
```

`livePhoto` 保存当前选择的资源。初始值为 `null`，表示尚未选择 Live Photo。

`viewRef` 类似 React Web 中通过 `ref` 调用组件实例方法，但这里调用的是原生组件暴露出来的播放控制方法：

```tsx
viewRef.current?.startPlayback('full');
viewRef.current?.stopPlayback();
```

### 3. 从相册选择 Live Photo

```tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['livePhotos'],
});
```

`mediaTypes: ['livePhotos']` 将可选择的媒体类型限制为 Live Photo。

选择结果仍需经过检查：

```tsx
if (!result.canceled && result.assets[0].pairedVideoAsset?.uri) {
  setLivePhoto({
    photoUri: result.assets[0].uri,
    pairedVideoUri: result.assets[0].pairedVideoAsset.uri,
  });
} else {
  console.error('Failed to pick a live photo');
}
```

这里验证了两个条件：

- 用户没有取消选择；
- 返回资源包含配套视频 URI。

不能只使用 `result.assets[0].uri`，因为它只代表静态照片部分。缺少 `pairedVideoAsset.uri` 时，无法构造完整的 Live Photo。

### 4. 检查当前设备是否支持

```tsx
if (!LivePhotoView.isAvailable()) {
  return (
    <View style={styles.container}>
      <Text>expo-live-photo is not available on this platform</Text>
    </View>
  );
}
```

即使应用运行在 iOS 上，也应通过 `isAvailable()` 做运行时能力检测。平台支持和当前设备实际具备该能力不是完全相同的判断。

对于 React Web 开发者，可以把它类比为在调用浏览器 API 前检查功能是否存在，而不是只根据浏览器名称推断。

### 5. 渲染组件

```tsx
<LivePhotoView
  ref={viewRef}
  source={livePhoto}
  style={[
    styles.livePhotoView,
    { display: livePhoto ? 'flex' : 'none' },
  ]}
  onLoadComplete={() => {
    console.log('Live photo loaded successfully!');
  }}
  onLoadError={error => {
    console.error('Failed to load the live photo: ', error.message);
  }}
/>
```

`source` 可以是 `LivePhotoAsset` 或 `null`。示例在没有资源时传入 `null`，并通过样式隐藏组件。

`style` 使用 React Native 样式对象和 `StyleSheet`，不是 CSS。虽然 `display`、`height` 等属性看起来接近 CSS，但不能据此认为所有 CSS 能力都可用。

### 6. 控制播放

```tsx
<Button
  title="Start Playback Hint"
  onPress={() => viewRef.current?.startPlayback('hint')}
/>

<Button
  title="Start Playback"
  onPress={() => viewRef.current?.startPlayback('full')}
/>

<Button
  title="Stop Playback"
  onPress={() => viewRef.current?.stopPlayback()}
/>
```

播放模式包括：

| 模式 | 含义 |
| --- | --- |
| `'hint'` | 只播放一小段，用来提示用户当前内容是 Live Photo |
| `'full'` | 播放完整的视频部分 |

`startPlayback` 的文档说明允许不提供播放模式；省略时默认播放完整视频。不过在 TypeScript API 表格中，参数形式显示为必传。为避免类型定义与文字描述之间可能存在的差异，示例显式传入 `'hint'` 或 `'full'`。

## `LivePhotoView` 属性

`LivePhotoView` 继承 React Native 的 `ViewProps`，因此除下列专用属性外，也可以接收常规 `View` 属性，例如 `style`。

### `source`

```ts
source?: LivePhotoAsset | null
```

指定要显示的 Live Photo：

```tsx
<LivePhotoView
  source={{
    photoUri: photoUri,
    pairedVideoUri: videoUri,
  }}
/>
```

它是可选属性，也可以显式传入 `null`。

### `contentFit`

```ts
contentFit?: 'contain' | 'cover'
```

默认值为 `'contain'`，用于决定内容如何适配组件容器。

| 值 | 效果 | Web 类比 |
| --- | --- | --- |
| `'contain'` | 保持比例，完整显示内容，可能产生留白 | `object-fit: contain` |
| `'cover'` | 保持比例并填满容器，部分内容可能被裁切 | `object-fit: cover` |

### `isMuted`

```ts
isMuted?: boolean
```

默认值为 `true`，即默认不播放 Live Photo 视频部分的音频。

需要声音时应显式设置：

```tsx
<LivePhotoView isMuted={false} />
```

### `useDefaultGestureRecognizer`

```ts
useDefaultGestureRecognizer?: boolean
```

默认值为 `true`。

开启时，用户在 `LivePhotoView` 上长按便会触发播放。这是 iOS 的默认 Live Photo 交互方式。

设为 `false` 后，可以通过按钮或其他业务交互调用 `startPlayback()`。当前文档没有说明关闭默认手势后应如何自行实现按压手势。

### 加载事件

| 属性 | 触发时机 |
| --- | --- |
| `onLoadStart` | Live Photo 开始加载 |
| `onPreviewPhotoLoad` | 预览静态照片加载完成 |
| `onLoadComplete` | 整个 Live Photo 加载完成并可播放 |
| `onLoadError` | 加载失败 |

`onLoadError` 接收以下对象：

```ts
type LivePhotoLoadError = {
  message: string;
};
```

静态预览图加载完成不代表视频部分已经可以播放。需要判断完整资源是否准备好时，应使用 `onLoadComplete`。

### 播放事件

| 属性 | 触发时机 |
| --- | --- |
| `onPlaybackStart` | 开始播放 |
| `onPlaybackStop` | 停止播放 |

这些事件可用于同步播放按钮状态、统计播放行为或更新界面提示。

## 实例方法与静态方法

### `LivePhotoView.isAvailable()`

```ts
LivePhotoView.isAvailable(): boolean
```

判断当前设备是否能够显示 Live Photo。

这是组件本身的静态方法，不需要先渲染组件或创建 `ref`。

### `startPlayback()`

```ts
viewRef.current?.startPlayback('hint');
viewRef.current?.startPlayback('full');
```

启动视频部分的播放。

`'hint'` 适合轻量提示，`'full'` 适合用户主动要求完整播放的场景。

### `stopPlayback()`

```ts
viewRef.current?.stopPlayback();
```

停止视频部分的播放。

可选链 `?.` 很重要，因为组件尚未挂载、已卸载或引用尚未赋值时，`viewRef.current` 可能为 `null`。

## 最重要的原生限制

文档明确指出：Live Photo 的照片和视频必须来自一份有效的 Live Photo，并且两部分都不能被修改。

拍摄 Live Photo 时，iOS 会通过元数据把照片与视频配对。如果这种配对关系被破坏，就无法再将它们组合为 Live Photo。

因此，以下做法不能被认为可行：

- 随意选择一张图片和一段视频进行组合；
- 修改图片后继续搭配原视频；
- 修改或转码视频后继续搭配原图片；
- 在处理媒体文件时丢弃原始配对元数据。

即使两个 URI 都存在，也不代表它们一定构成有效的 Live Photo。加载失败时，应通过 `onLoadError` 获取错误原因。

## React Web 开发者容易误解的地方

### 这不是“图片加视频”的 Web 组件

在 Web 中，可以自行组合 `<img>` 和 `<video>`。Live Photo 则依赖 iOS 原生格式和配对元数据，不能通过两个视觉上匹配的文件模拟出有效资源。

### “支持 iOS”不等于可以省略能力检测

组件仅支持 iOS，但代码仍应调用：

```ts
LivePhotoView.isAvailable()
```

这与 Web 中同时进行环境判断和 feature detection 的思路一致。

### `LivePhotoView` 不是 DOM 元素

它没有 HTML 标签、CSS 类名或浏览器事件。其样式和事件遵循 React Native API，并通过原生模块执行。

### `ref` 不指向 HTML 节点

这里的 `ref` 用于调用：

```ts
startPlayback()
stopPlayback()
```

它不是 `HTMLElement`，不能调用 `querySelector`、`focus` 或读取 DOM 布局属性。

### 相册选择结果可能不完整

用户未取消操作并不代表一定获得有效 Live Photo。代码还必须检查 `pairedVideoAsset?.uri`。

### 音频默认关闭

`isMuted` 默认是 `true`。如果期望播放声音，必须显式改为 `false`，同时还应结合应用的产品设计决定是否适合自动出声。

## 实际开发中的使用方式

一个较完整的页面通常需要维护以下状态：

- 是否正在选择资源
- 是否正在加载
- 是否加载完成
- 是否播放中
- 加载错误信息
- 当前 `LivePhotoAsset`

推荐的业务流程是：

1. 先调用 `isAvailable()`，为不支持的环境提供替代界面。
2. 使用 `expo-image-picker` 并限定 `mediaTypes: ['livePhotos']`。
3. 同时检查 `canceled`、照片 URI 和配套视频 URI。
4. 将两个 URI 原样保存为 `LivePhotoAsset`，避免分别编辑或转换。
5. 通过 `onLoadStart`、`onLoadComplete` 和 `onLoadError` 管理加载状态。
6. 根据产品交互选择默认长按播放或使用按钮控制播放。
7. 使用 `onPlaybackStart` 和 `onPlaybackStop` 同步界面状态。

> **基于文档内容推导：** 如果业务需要上传并在之后重新展示 Live Photo，应保证图片、视频以及维持二者配对关系所需的信息不被破坏。当前文档没有提供上传、存储和下载方案，具体实现需要查阅对应后端存储及 iOS 媒体格式文档。

> **基于经验建议：** 应在真机上验证相册选择、长按手势、声音和播放事件。Live Photo 属于 iOS 原生媒体能力，仅依靠 Web 开发习惯或静态类型检查无法覆盖真实设备行为。

## 当前文档未涉及的内容

原文没有说明以下事项：

- 如何拍摄或创建 Live Photo
- 如何编辑 Live Photo
- 如何上传、下载或持久化 Live Photo
- 是否支持远程 URL
- 是否支持 Android 或 Web 的替代方案
- 如何申请相册访问权限
- 如何自定义长按手势
- 加载失败的错误码分类
- 视频播放进度、循环播放或播放完成事件
- Live Photo 的尺寸、编码格式和文件大小限制
- `expo-image-picker` 的完整安装及配置流程

这些问题不能仅凭当前文档确定，需要查阅对应库或 iOS 平台文档。

## 总结

`expo-live-photo` 的核心职责是在 iOS 上显示和播放一份已经存在且有效的 Live Photo。

使用时最关键的三点是：

1. 同时提供未经修改的照片 URI 和配套视频 URI。
2. 渲染前使用 `LivePhotoView.isAvailable()` 检查设备能力。
3. 通过默认长按手势或 `ref` 暴露的方法控制播放。

对于 React Web 开发者，最大的认知差异在于：Live Photo 不是前端自由组合的图片和视频，而是一种依赖 iOS 原生元数据配对关系的媒体资产。

---

## 文档导航

- **上一页**：[linking](./184__linking.md)
- **下一页**：[local authentication](./186__local-authentication.md)
