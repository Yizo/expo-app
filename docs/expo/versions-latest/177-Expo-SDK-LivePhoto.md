# 177｜Expo SDK LivePhoto iOS 动态照片

**翻页：**[上一页：Expo SDK Linking 深度链接与 URL 处理](./176-Expo-SDK-Linking.md) · [目录](./README.md) · [下一页：Expo SDK LocalAuthentication](./178-Expo-SDK-LocalAuthentication.md)

**官方页面：**[LivePhoto · Latest](https://docs.expo.dev/versions/latest/sdk/live-photo/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/live-photo/)

**版本与平台：**Latest 推荐 `expo-live-photo ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。仅支持 iOS，并可在 Expo Go 使用。若组件当前不可用，需先判断设备能力，再展示替代界面。

## Live Photo 是什么

Live Photo 是 iOS 相册中的一张静态照片与一小段关联视频的组合。屏幕上平时展示照片预览，播放时再显示动态片段。Expo 的 `LivePhotoView` 负责呈现和播放；选取素材可以配合 `expo-image-picker`。

它不是把任意照片和任意视频拼在一起的播放器。系统依赖原 Live Photo 中的配对元数据；照片和视频必须来自有效、未被改动的 Live Photo。若两部分配对关系丢失，无法通过 `LivePhotoAsset` 重建。`LivePhotoAsset` 因此只携带两个原始资源 URI。

## 安装

```sh
npx expo install expo-live-photo
yarn expo install expo-live-photo
pnpm expo install expo-live-photo
bun expo install expo-live-photo
```

在已有的 React Native 工程中安装时，也要先接入 `expo` 和 Expo 模块环境。示例同时使用图片选择器，因此示例工程还需要：

```sh
npx expo install expo-image-picker
```

## 选取并播放 Live Photo

下面示例覆盖源页主要流程：只选取 Live Photo；验证操作没有取消且照片带有关联视频；检测设备能力；将照片与视频 URI 作为 `source`；在加载失败时读取错误信息；通过 ref 播放短提示、完整视频或停止播放。`LivePhotoViewType` 是组件 ref 的类型。

```tsx
import * as ImagePicker from 'expo-image-picker';
import { LivePhotoView, type LivePhotoAsset, type LivePhotoViewType } from 'expo-live-photo';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function LivePhotoScreen() {
  const viewRef = useRef<LivePhotoViewType>(null);
  const [asset, setAsset] = useState<LivePhotoAsset | null>(null);

  const chooseLivePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['livePhotos'],
    });
    const picked = result.assets[0];
    const pairedVideoUri = picked?.pairedVideoAsset?.uri;

    if (!result.canceled && picked?.uri && pairedVideoUri) {
      setAsset({ photoUri: picked.uri, pairedVideoUri });
    } else {
      setAsset(null);
      console.warn('未选择有效的 Live Photo');
    }
  };

  if (!LivePhotoView.isAvailable()) {
    return (
      <View style={styles.container}>
        <Text>此设备无法显示 Live Photo。</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LivePhotoView
        ref={viewRef}
        source={asset}
        style={[styles.preview, { display: asset ? 'flex' : 'none' }]}
        contentFit="contain"
        onLoadStart={() => console.log('开始加载')}
        onPreviewPhotoLoad={() => console.log('静态照片预览已加载')}
        onLoadComplete={() => console.log('Live Photo 已就绪')}
        onLoadError={error => console.warn('加载失败：', error.message)}
        onPlaybackStart={() => console.log('开始播放')}
        onPlaybackStop={() => console.log('停止播放')}
      />

      <View style={asset ? styles.compactPicker : styles.emptyPicker}>
        <Button title={asset ? '更换动态照片' : '选择动态照片'} onPress={chooseLivePhoto} />
      </View>
      <Button title="播放短提示" onPress={() => viewRef.current?.startPlayback('hint')} />
      <Button title="播放完整片段" onPress={() => viewRef.current?.startPlayback('full')} />
      <Button title="停止播放" onPress={() => viewRef.current?.stopPlayback()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  preview: {
    alignSelf: 'stretch',
    height: 300,
  },
  emptyPicker: {
    alignSelf: 'stretch',
    height: 300,
    justifyContent: 'center',
  },
  compactPicker: {
    marginVertical: 10,
  },
});
```

ref 和 state 的作用不同：state 保存当前选中的两个资源 URI，改变后 React 重新渲染；ref 指向原生 `LivePhotoView` 实例，供按钮直接调用 `startPlayback()` / `stopPlayback()`，不会因为 ref 改变触发重新渲染。若要自定义按住手势，可设置 `useDefaultGestureRecognizer`；默认 `true` 时用户按住视图会触发播放。

## `LivePhotoView` 属性与回调

组件为 iOS 原生视图，类型可理解为 `React.Element<LivePhotoViewProps & { ref: Ref<LivePhotoViewType> }>`。它还继承 React Native `ViewProps`，因此接受常规布局、样式和无障碍属性。

| 属性 | 类型 / 默认值 | 作用 |
| --- | --- | --- |
| `source` | `LivePhotoAsset \| null`，可选 | 指定照片 URI 与配对视频 URI；`null` 时无素材。 |
| `contentFit` | `ContentFit`，默认 `'contain'` | `contain` 保持内容比例并让较长边适配视图；`cover` 缩放到铺满视图。 |
| `isMuted` | `boolean`，默认 `true` | 控制 Live Photo 视频部分的音频静音状态。 |
| `useDefaultGestureRecognizer` | `boolean`，默认 `true` | 是否使用默认 iOS 手势识别；启用时按住视图开始播放。 |
| `onLoadStart` | `() => void` | 开始载入动态照片时触发。 |
| `onPreviewPhotoLoad` | `() => void` | 静态照片预览加载完成时触发。 |
| `onLoadComplete` | `() => void` | Live Photo 加载完成、可播放时触发。 |
| `onLoadError` | `(error: LivePhotoLoadError) => void` | 载入失败时触发；错误对象包含 `message`。 |
| `onPlaybackStart` | `() => void` | 开始播放时触发。 |
| `onPlaybackStop` | `() => void` | 播放停止时触发。 |
| `style` 等 | 继承 `ViewProps` | 可设置尺寸、布局与其它普通 RN View 属性。 |

`LivePhotoView.isAvailable(): boolean` 是静态能力检查。即使 SDK 页面标记支持 iOS，也应在使用前检查当前设备是否能呈现 Live Photo，并提供 fallback。它不是 Android / Web 上的跨平台视频组件。

## 公开类型与 ref 方法

| 类型 | 含义 |
| --- | --- |
| `ContentFit` | `'contain' \| 'cover'`。前者完整缩放适配，后者铺满容器。 |
| `LivePhotoAsset` | `{ photoUri: string; pairedVideoUri: string }`。两个 URI 必须指向配对且未被破坏的原始 Live Photo 资源。 |
| `LivePhotoLoadError` | `{ message: string }`，`message` 是加载失败原因。 |
| `LivePhotoViewStatics` | 包含 `isAvailable: () => boolean`。 |
| `LivePhotoViewType` | 原生视图 ref 类型，提供 `startPlayback(playbackStyle)` 与 `stopPlayback()`。 |
| `PlaybackStyle` | `'hint' \| 'full'`。`hint` 播放较短片段提示它是动态照片；`full` 播放完整视频部分。省略样式时默认播放完整视频。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-live-photo ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。
- 两版都只支持 iOS、可在 Expo Go 使用，且 `LivePhotoView`、选取 Live Photo 的 ImagePicker 参数、组件属性、事件和类型相同。
- 两版示例都通过 `pairedVideoAsset.uri` 和照片 `uri` 组装 `LivePhotoAsset`，并提供 `hint` / `full` / stop 三种播放操作；源码只存在文本大小写与按钮标题差异。
- Latest 与 v56 页脚 Next 均为 Expo SDK LocalAuthentication。

## 源页代码主题覆盖

- Installation：覆盖 `expo-live-photo` 的 npm、Yarn、pnpm、Bun 安装方式，并补上 Usage 所依赖的 `expo-image-picker` 安装说明。
- Usage：改写源页完整流程，覆盖 ImagePicker 的 `livePhotos` media type、取消 / 缺少 paired video 的错误分支、`LivePhotoAsset` 构造、`isAvailable()` 能力判断、带 ref 的视图呈现、隐藏空视图、加载完成 / 失败回调和控件布局。
- Playback：覆盖 `'hint'`、`'full'` 两种播放样式和 `stopPlayback()`；说明 `useRef` 控制视图、React state 保存当前资源。
- Component API：列出 `contentFit`、`isMuted`、`source`、`useDefaultGestureRecognizer`、六种加载 / 预览 / 播放回调及继承的 `ViewProps`。
- Types：覆盖 `ContentFit`、`LivePhotoAsset`、`LivePhotoLoadError`、`LivePhotoViewStatics`、`LivePhotoViewType`、`PlaybackStyle` 的字段和取值。
- Latest / v56 对照：列出两版建议包版本、平台边界和一致的 API / Usage 主题。

**翻页：**[上一页：Expo SDK Linking 深度链接与 URL 处理](./176-Expo-SDK-Linking.md) · [目录](./README.md) · [下一页：Expo SDK LocalAuthentication](./178-Expo-SDK-LocalAuthentication.md)
