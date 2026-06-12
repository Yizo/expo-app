# Expo VideoThumbnails 学习文档

## 文档解决的问题

`expo-video-thumbnails` 是一个 Expo 库，用于从视频的指定时间位置提取一帧，并生成可作为缩略图使用的图片。

典型场景包括：

- 为视频列表生成封面图
- 上传视频后展示预览图
- 在播放视频前显示静态占位图
- 从远程或本地视频中截取指定时间点的画面

支持平台：

- Android
- iOS
- tvOS
- Expo Go

当前文档未说明 Web 平台支持，因此不要假设它可以在 React Web 浏览器环境中使用。

## 重要状态：该库已废弃

文档明确说明，`expo-video-thumbnails` 已被废弃，替代方案是 `expo-video` 提供的 `generateThumbnailsAsync`。

同时需要注意：

- `expo-video-thumbnails` 不再接收补丁更新。
- 该库将在 Expo SDK 56 中移除。
- 当前页面属于“下一个 SDK 版本”的未版本化文档。
- 文档建议通过 Expo SDK 56 的最新版本文档获取当前信息。

因此，这篇文档主要适合：

- 阅读或维护仍然使用 `expo-video-thumbnails` 的旧项目
- 理解旧代码中视频缩略图的生成方式
- 为迁移到 `expo-video` 做准备

**基于文档内容推导：** 新项目不应再引入该库。即使旧 API 目前仍然能够使用，也应优先评估迁移到 `expo-video` 的 `generateThumbnailsAsync`。

本文只介绍当前页面提供的旧 API。关于 `generateThumbnailsAsync` 的参数、返回值和迁移步骤，当前文档未展开说明。

## 阅读前需要理解的概念

### Expo 与 React Native

React Native 使用 React 的组件模型开发原生移动应用，但渲染目标不是浏览器 DOM。

例如：

| React Web | React Native |
| --- | --- |
| `<div>` | `<View>` |
| `<button>` | `<Button>` 或可点击组件 |
| `<img src="...">` | `<Image source={{ uri: '...' }}>` |
| CSS 文件 | `StyleSheet` 或组件样式对象 |
| `onClick` | `onPress` |

Expo 是围绕 React Native 提供的一套开发工具和原生模块体系。`expo-video-thumbnails` 就是一个 Expo 原生模块，其底层工作需要 Android、iOS 或 tvOS 的原生能力完成，而不是浏览器 API。

### Expo Go

Expo Go 是用于运行和调试 Expo 项目的客户端应用。文档中的“Included in Expo Go”表示该模块已包含在 Expo Go 中，使用 Expo Go 调试时通常不需要为了这个模块单独构建原生客户端。

这不等于“无需安装 npm 包”。项目代码仍然需要安装并导入 `expo-video-thumbnails`。

### URI

这里的 URI 是视频或生成图片的位置标识，可以指向：

- 本地文件
- 远程网络资源
- 原生模块生成的临时图片文件

React Web 开发者容易把 URI 直接理解为浏览器中的 HTTP URL，但在 React Native 中，它也可能是 `file://` 等本地文件 URI。

### 异步原生操作

生成缩略图不是同步计算。JavaScript 代码需要调用原生模块处理视频，因此 API 返回 `Promise`，必须使用 `await` 或 `.then()` 获取结果。

## 安装

根据包管理器选择对应命令：

```sh
# npm
npx expo install expo-video-thumbnails

# yarn
yarn expo install expo-video-thumbnails

# pnpm
pnpm expo install expo-video-thumbnails

# bun
bun expo install expo-video-thumbnails
```

这里使用的是 `expo install`，而不是普通的 `npm install`。它的作用是按照当前 Expo SDK 选择兼容的包版本。

不过，由于该库已经废弃并计划在 SDK 56 中移除，这些命令主要适用于维护尚未迁移的旧项目。

### 在已有 React Native 项目中安装

如果项目是一个现有的 React Native 原生项目，而不是标准 Expo 项目，需要先安装并配置 `expo`，使项目具备使用 Expo Modules 的能力。

这类项目有时也被称为 bare React Native 项目。与 React Web 项目不同，安装一个包含原生代码的依赖可能不仅是修改 `package.json`，还会影响 iOS 和 Android 原生工程。

具体的 Expo Modules 安装步骤当前文档未涉及。

## 基本用法

### 导入模块

```js
import * as VideoThumbnails from 'expo-video-thumbnails';
```

这里采用命名空间导入，之后通过 `VideoThumbnails.getThumbnailAsync()` 调用 API。

### 完整示例

```jsx
import { useState } from 'react';
import { StyleSheet, Button, View, Image, Text } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

export default function App() {
  const [image, setImage] = useState(null);

  const generateThumbnail = async () => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        {
          time: 15000,
        }
      );

      setImage(uri);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View style={styles.container}>
      <Button onPress={generateThumbnail} title="Generate thumbnail" />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Text>{image}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    width: 200,
    height: 200,
  },
});
```

执行流程如下：

1. 用户点击 `Button`。
2. `onPress` 调用异步函数 `generateThumbnail`。
3. `getThumbnailAsync()`读取远程视频。
4. 原生模块尝试获取视频第 `15000` 毫秒，也就是第 15 秒附近的画面。
5. API 返回生成图片的信息。
6. 示例取出其中的 `uri` 并保存到 React state。
7. `<Image>` 使用该 URI 显示图片。
8. `<Text>` 显示 URI 字符串，便于观察生成文件的位置。

`Image` 的写法与 Web 不同：

```jsx
<Image source={{ uri: image }} />
```

React Web 通常使用 `src`，而 React Native 使用 `source` 对象。

## 核心 API

### `VideoThumbnails.getThumbnailAsync(sourceFilename, options)`

支持平台：

- Android
- iOS
- tvOS

调用形式：

```js
const result = await VideoThumbnails.getThumbnailAsync(
  sourceFilename,
  options
);
```

该方法从 `sourceFilename` 指定的视频中生成一张图片缩略图。

返回值类型为：

```ts
Promise<VideoThumbnailsResult>
```

这意味着调用成功后得到的不是单纯的 URI，而是包含图片 URI、宽度和高度的结果对象。

### `sourceFilename`

类型：

```ts
string
```

它表示视频的 URI，可以是：

- 本地视频 URI
- 远程视频 URI

例如：

```js
const sourceFilename = 'https://example.com/video.mp4';
```

虽然参数名中包含 `Filename`，但它并不只接受普通文件名，也接受完整 URI。这是 React Web 开发者容易误解的地方。

当前文档没有进一步说明：

- 支持哪些视频格式
- 本地 URI 必须采用什么协议
- 远程服务器需要支持哪些请求特性
- 是否存在视频大小或时长限制
- 缩略图文件的保存期限和清理策略

### `options`

类型：

```ts
VideoThumbnailsOptions
```

该参数可选，默认值为：

```js
{}
```

它用于控制截取时间、图片质量以及远程请求头。

## `VideoThumbnailsOptions`

### `time`

类型：

```ts
number
```

指定从视频的哪个时间位置获取图片，单位是毫秒。

```js
{
  time: 15000
}
```

表示在视频第 15 秒的位置获取画面。

React Web 开发者需要特别注意单位：这里不是秒。假设希望截取第 5 秒，应传入：

```js
{
  time: 5000
}
```

当前文档没有说明以下边界行为：

- `time` 为负数时如何处理
- `time` 超过视频总时长时如何处理
- 未设置 `time` 时具体截取哪个时间点
- 是否保证得到与指定毫秒完全一致的帧

因此，不能仅根据本文档对这些行为作出保证。

### `quality`

类型：

```ts
number
```

取值范围：

```text
0.0 ～ 1.0
```

含义：

- `1`：不压缩，质量最高
- `0`：压缩程度最高，质量最低

示例：

```js
{
  time: 5000,
  quality: 0.8
}
```

图片质量通常会影响清晰度和文件体积。不过，当前文档没有给出不同质量值对应的具体文件大小，也没有说明超出合法范围时的行为。

### `headers`

类型：

```ts
Record<string, string>
```

仅在 `sourceFilename` 是远程 URI 时使用。该对象会作为网络请求头传递。

例如，访问需要身份认证的视频：

```js
{
  headers: {
    Authorization: 'Bearer <token>'
  }
}
```

它类似于 React Web 中通过 `fetch` 传递 `headers`：

```js
fetch(url, {
  headers: {
    Authorization: 'Bearer <token>'
  }
});
```

区别在于，这里的网络请求由缩略图模块内部执行，而不是由业务代码先通过 `fetch` 下载视频。

当前文档没有说明 Cookie、重定向、跨域、缓存或请求超时等行为。尤其不要直接套用浏览器的 CORS 认知，因为该 API 运行在原生环境中，不是浏览器页面。

## 返回结果 `VideoThumbnailsResult`

成功后返回如下结构：

```ts
{
  uri: string;
  width: number;
  height: number;
}
```

### `uri`

生成图片的 URI，可以作为图片或视频元素的资源地址。

在 React Native 中可直接用于：

```jsx
<Image source={{ uri: result.uri }} />
```

文档示例只解构了 `uri`：

```js
const { uri } = await VideoThumbnails.getThumbnailAsync(...);
```

如果布局需要保持缩略图的原始比例，也可以同时读取宽高：

```js
const { uri, width, height } =
  await VideoThumbnails.getThumbnailAsync(videoUri, {
    time: 15000,
  });
```

### `width` 与 `height`

两者都是 `number`，表示生成图片的宽度和高度。

**基于文档内容推导：** 可以使用这两个值计算图片宽高比，减少使用固定正方形尺寸时造成的拉伸或裁切问题。

当前文档没有说明返回值的尺寸单位。由于它们描述生成图片的尺寸，可以用于布局判断，但不应在缺乏额外文档依据的情况下假定其与 CSS 像素完全等价。

## 错误处理

文档示例使用 `try...catch`：

```js
try {
  const result = await VideoThumbnails.getThumbnailAsync(videoUri);
} catch (e) {
  console.warn(e);
}
```

生成过程可能失败，因此不能假设 Promise 一定成功。示例没有列出具体错误类型或错误码，也没有区分网络错误、视频解析错误和参数错误。

**基于经验建议：** 在实际界面中，应维护生成中、成功和失败状态，避免用户重复点击，并在失败时展示可理解的提示：

```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const generateThumbnail = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 5000,
      quality: 0.8,
    });

    setImage(result.uri);
  } catch (error) {
    setError('缩略图生成失败');
  } finally {
    setLoading(false);
  }
};
```

这里的状态设计属于经验性补充，并非当前文档规定的 API 用法。

## 限制与容易踩坑的地方

### 1. 该库已废弃

这是最重要的限制。它不再接收补丁，并将在 SDK 56 中移除。新代码继续依赖它会增加升级 Expo SDK 时的迁移成本。

### 2. 不支持 Web

API 表格只列出了 Android、iOS 和 tvOS。即使项目使用 React，也不能因此认为 API 可以在浏览器中运行。

如果同一项目同时面向 Web 和原生平台，需要自行设计平台分支。具体 Web 替代方案当前文档未涉及。

### 3. 时间单位是毫秒

`time: 15000` 表示 15 秒，而不是 15000 秒，也不是第 15000 帧。

### 4. 远程视频可能需要请求头

如果视频地址需要 Token 等认证信息，应使用 `headers`。仅传入 URL 可能无法访问受保护资源。

### 5. 返回的是结果对象

API 返回：

```js
{
  uri,
  width,
  height
}
```

不能把整个返回值直接当作图片 URI：

```js
// 错误理解
const imageUri = await VideoThumbnails.getThumbnailAsync(videoUri);
```

应该读取：

```js
const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri);
```

### 6. 生成操作必须异步处理

它不是类似字符串转换的即时操作。远程视频还可能涉及网络请求，因此应处理等待和失败状态。

### 7. 文档没有承诺精确帧定位

文档只说明 `time` 是获取图片的时间位置，没有承诺逐帧精确，也没有描述不同平台间是否存在差异。

### 8. 文件生命周期没有说明

返回的 `uri` 指向生成图片，但文档没有说明：

- 文件保存在哪里
- 是否为临时文件
- 何时会被清理
- 是否适合长期持久化
- 是否需要应用主动删除

因此，不应仅凭本文档把该 URI 当作永久资源地址。

## 实际开发中的使用方式

对于仍在维护旧项目的开发者，可以按以下流程使用：

1. 确认项目所用 Expo SDK 仍然包含该库。
2. 使用 `expo install` 安装兼容版本。
3. 获取本地或远程视频 URI。
4. 确定要截取的时间位置，并换算为毫秒。
5. 如果远程资源需要认证，通过 `headers` 传递请求头。
6. 调用 `getThumbnailAsync()`。
7. 使用返回的 `uri` 显示图片。
8. 根据 `width` 和 `height` 处理图片比例。
9. 捕获异常，并处理加载与失败状态。
10. 规划迁移到 `expo-video` 的 `generateThumbnailsAsync`。

一个包含主要参数的调用示例：

```js
const thumbnail = await VideoThumbnails.getThumbnailAsync(videoUri, {
  time: 10_000,
  quality: 0.8,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log(thumbnail.uri);
console.log(thumbnail.width);
console.log(thumbnail.height);
```

其中：

- `10_000` 毫秒表示第 10 秒。
- `quality: 0.8` 设置输出质量。
- `headers` 用于访问受保护的远程视频。
- 返回值包含图片 URI 和实际尺寸。

## 文档明确内容与推导内容

### 文档明确说明

- 该库用于从视频生成图片缩略图。
- 支持 Android、iOS 和 tvOS。
- 该库包含在 Expo Go 中。
- 视频来源可以是本地或远程 URI。
- `time` 的单位是毫秒。
- `quality` 范围为 `0.0` 至 `1.0`。
- 远程请求可以携带 `headers`。
- 返回结果包含 `uri`、`width` 和 `height`。
- 该库已经废弃，不再接收补丁，并将在 SDK 56 中移除。
- 官方替代方案是 `expo-video` 的 `generateThumbnailsAsync`。

### 基于文档内容推导

- 新项目不应继续采用该库。
- 旧项目需要为 Expo SDK 升级提前安排迁移。
- `width` 和 `height` 可以用于计算宽高比，避免缩略图显示变形。
- 同时支持 Web 和原生平台的项目需要为 Web 准备其他实现。

### 当前文档未涉及

- `generateThumbnailsAsync` 的具体迁移代码
- 支持的视频格式
- 最大文件大小或视频时长
- 缩略图生成的性能开销
- 精确到帧的定位保证
- 各平台之间的行为差异
- 缩略图文件的存储位置和生命周期
- 缓存与文件清理机制
- Web 平台的替代实现
- 完整错误类型和错误码

## 总结

`expo-video-thumbnails` 的核心 API 很简单：向 `getThumbnailAsync()` 提供视频 URI，并通过 `time`、`quality` 和 `headers` 控制生成过程，最后获得缩略图的 URI、宽度和高度。

对于 React Web 开发者，最需要建立的认知是：这是一个运行在移动端原生环境中的异步模块，不是浏览器视频或 Canvas API；本地资源通常通过 URI 表示，图片也需要使用 React Native 的 `Image` 组件显示。

但该库已经进入废弃状态，并将在 SDK 56 中移除。学习它的主要价值是理解和维护旧代码。新开发及后续升级应转向 `expo-video` 的 `generateThumbnailsAsync`。

---

## 文档导航

- **上一页**：[video](./218__video.md)
- **下一页**：[webbrowser](./220__webbrowser.md)
