# 212｜Expo SDK VideoThumbnails 视频缩略图（已弃用）

**翻页：**[上一页：Expo SDK Video 视频播放](./211-Expo-SDK-Video.md) · [目录](./README.md) · [下一页：Expo SDK WebBrowser 系统浏览器](./213-Expo-SDK-WebBrowser.md)

**官方页面：**[VideoThumbnails · Latest](https://docs.expo.dev/versions/latest/sdk/video-thumbnails/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/video-thumbnails/)

**版本与状态：**Latest 推荐 `expo-video-thumbnails ~57.0.1`；SDK v56.0.0 页面推荐 `~56.0.3`。Android、iOS、tvOS 可生成视频缩略图，Expo Go 中可用。**此库已弃用且不再接收补丁；官方建议迁移到 `expo-video` 的 `generateThumbnailsAsync`。**官方 Deprecated 提示称它会从 SDK 56 移除，但 SDK v56 页面本身仍保留此参考并列出 `~56.0.3`，该版本说明与移除提示存在不一致；新项目应优先使用 `expo-video` 的替代 API。

## 从视频生成一张预览图

`expo-video-thumbnails` 根据本地或远程视频 URI，在给定时间点截取一帧图片。`time` 的单位是毫秒，例如 `15000` 表示第 15 秒。下面保留官方 JavaScript 示例，生成后把图片 `uri` 放进 React Native 的 `<Image />`：

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

## 安装与导入

```sh
npx expo install expo-video-thumbnails
yarn expo install expo-video-thumbnails
pnpm expo install expo-video-thumbnails
bun expo install expo-video-thumbnails
```

已有的纯 React Native 项目还需要安装 `expo`。模块导入方式：

```ts
import * as VideoThumbnails from 'expo-video-thumbnails';
```

## API

### `VideoThumbnails.getThumbnailAsync(sourceFilename, options?)`

| 参数 / 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `sourceFilename` | `string` | 视频 URI，可以是本地 URI 或远程 URL。 |
| `options` | `VideoThumbnailsOptions` | 缩略图生成参数；默认 `{}`。 |
| 返回值 | `Promise<VideoThumbnailsResult>` | 成功后包含生成图片的 `uri`、宽度和高度。 |

### `VideoThumbnailsOptions`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `headers` | `Record<string, string>` | `sourceFilename` 为远程 URI 时，作为视频网络请求的 headers。 |
| `quality` | `number` | 图片质量范围 `0.0`–`1.0`；`1` 不压缩、质量最高，`0` 压缩最大、质量最低。 |
| `time` | `number` | 从视频读取帧的位置，毫秒。 |

### `VideoThumbnailsResult`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `height` | `number` | 生成图片的高度。 |
| `uri` | `string` | 图片 URI，可作为 `<Image />` 或 `<Video />` 的资源。 |
| `width` | `number` | 生成图片的宽度。 |

## 新手名词解释

- **Thumbnail（缩略图）：**从视频某一时间点截取的一张静态图，常用于视频列表或播放前预览。
- **URI：**资源位置标识。本地视频和网络视频都可以用 URI 作为输入；生成后的 `uri` 可以交给 React Native `Image` 显示。
- **毫秒：**一秒等于 1000 毫秒，所以 `time: 15000` 表示在视频播放到 15 秒时截帧。
- **已弃用（Deprecated）：**旧 API 暂时仍可在某些版本引用，但官方停止维护并建议迁移；文档提示此库不再接收补丁。

## 源页代码主题覆盖

- Installation：覆盖 npx、Yarn、pnpm、Bun 安装命令。
- Usage：保留完整的 `getThumbnailAsync()`、错误处理、React state、`Image` 展示和样式示例。
- API / Types：覆盖导入、方法参数 / Promise 返回、`VideoThumbnailsOptions` 和 `VideoThumbnailsResult` 所有属性。
- Latest 与 SDK v56 的代码和 Next 顺序一致；分别标注文档推荐版本并解释 SDK56 移除提示与 v56 页面仍列版本之间的不一致。

**翻页：**[上一页：Expo SDK Video 视频播放](./211-Expo-SDK-Video.md) · [目录](./README.md) · [下一页：Expo SDK WebBrowser 系统浏览器](./213-Expo-SDK-WebBrowser.md)
