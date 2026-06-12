# Expo Video（`expo-video`）学习文档

> 原文档修改日期：2026 年 5 月 20 日  
> 文档版本：下一版 Expo SDK 的未发布文档  
> 当前稳定版本：SDK 56  
> 支持平台：Android、iOS、tvOS、Web、Expo Go

## 文档解决的问题

`expo-video` 是 Expo 提供的跨平台视频播放库，用于在 React Native、Expo 和 Web 应用中实现：

- 网络视频与本地视频播放
- 播放、暂停、跳转、循环和倍速控制
- 原生播放控件、全屏与画中画
- 后台播放和系统“正在播放”通知
- 音轨、字幕轨和视频轨管理
- 视频预加载与缓存
- 直播状态和延迟信息
- DRM 受保护内容播放
- 视频缩略图生成
- iOS 原生视频资源加载扩展

对于 React Web 开发者，可以将它理解为以下三部分的组合：

- `VideoView`：类似 HTML `<video>` 元素的可视区域。
- `VideoPlayer`：独立于界面的播放器控制器，类似对 `<video>` DOM 对象的命令式控制。
- 事件系统：把原生播放器状态同步到 React 组件。

但它并不只是对 `<video>` 的简单封装。Android 和 iOS 会使用各自的原生媒体框架，因此部分功能需要修改原生工程配置并重新构建应用。

## 阅读前需要理解的概念

### Expo、React Native 与 Expo Go

React Native 使用 React 编写界面，但最终渲染的是 Android、iOS 等平台的原生视图，而不是浏览器 DOM。

Expo 在 React Native 之上提供构建工具、原生模块和统一 API。Expo Go 是一个预先编译好的通用客户端，可以直接运行许多 Expo 功能，但不能包含任意自定义原生代码。

因此：

- 普通 `expo-video` 播放功能包含在 Expo Go 中。
- 需要自定义 iOS 原生模块的资源拦截功能不能在 Expo Go 中使用。
- 修改画中画、后台播放等原生配置后，通常需要重新构建应用二进制文件。

### 播放器与视图分离

`expo-video` 将播放状态和画面显示拆成两个对象：

```text
VideoPlayer：加载媒体、保存播放状态、执行播放控制
      ↓
VideoView：把指定 VideoPlayer 的画面显示到界面中
```

这和 React Web 中直接通过一个 `<video>` 元素同时管理资源、状态及渲染有所不同。

拆分后可以：

- 在视频尚未显示时创建播放器并预加载。
- 切换 `VideoView` 连接的播放器，实现快速换片。
- 在组件生命周期之外持有高级场景所需的播放器。

与此同时，也必须正确管理 `VideoPlayer` 的生命周期，否则可能造成原生资源和内存泄漏。

### 运行时配置与构建期配置

播放器的 `loop`、`muted`、`volume` 等可以在 JavaScript 运行时修改。

后台播放、画中画支持等能力涉及 `Info.plist`、`AndroidManifest.xml` 和 Android 前台服务权限，属于构建期配置。修改后必须重新生成或构建原生应用，仅修改 React 状态不会生效。

## 安装

根据包管理器执行一种命令：

```sh
# npm
npx expo install expo-video

# yarn
yarn expo install expo-video

# pnpm
pnpm expo install expo-video

# bun
bun expo install expo-video
```

这里使用 `expo install`，而不是普通的 `npm install`，目的是让 Expo 选择与当前 SDK 兼容的包版本。

如果是在已有的裸 React Native 工程中安装，还必须先为项目安装 Expo Modules 所需的 `expo` 包。当前文档没有展开手动链接原生依赖的完整步骤。

## 构建期配置

使用 Continuous Native Generation（CNG）和 config plugin 的项目，可以在 `app.json` 中配置：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-video",
        {
          "supportsBackgroundPlayback": true,
          "supportsPictureInPicture": true
        }
      ]
    ]
  }
}
```

Config plugin 可以理解为“构建期间自动修改 iOS 和 Android 原生配置文件的脚本”。

如果项目不使用 CNG，则需要手动修改原生工程。当前文档说明了这一要求，但没有给出完整的手动修改流程。

### `supportsBackgroundPlayback`

默认值为 `undefined`。

| 值 | 作用 |
| --- | --- |
| `true` | 启用后台播放所需的原生配置 |
| `false` | 删除对应配置 |
| `undefined` | 不修改已有原生配置 |

平台影响：

- iOS：向 `Info.plist` 的 `UIBackgroundModes` 添加 `audio`。
- Android：添加前台服务权限，并在 `AndroidManifest.xml` 中创建 `expo-video` 前台服务。

配置这一项并不代表播放器会自动在后台播放。运行时还需要设置：

```ts
player.staysActiveInBackground = true;
```

### `supportsPictureInPicture`

默认值为 `undefined`。

启用后：

- Android：配置 `android:supportsPictureInPicture`。
- iOS：向 `UIBackgroundModes` 添加 `audio`。

运行时仍需通过以下方式允许或启动画中画：

- `VideoView` 的 `allowsPictureInPicture`
- `startsPictureInPictureAutomatically`
- `startPictureInPicture()`

画中画只能同时由一个播放器占用。

## 基本播放流程

```tsx
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Button, StyleSheet, View } from 'react-native';

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function VideoScreen() {
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
      />

      <Button
        title={isPlaying ? 'Pause' : 'Play'}
        onPress={() => {
          if (isPlaying) {
            player.pause();
          } else {
            player.play();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: 350,
    height: 275,
  },
});
```

这一流程包含四个关键步骤：

1. 使用 `useVideoPlayer(source, setup)` 创建播放器。
2. 在 `setup` 回调中设置初始行为。
3. 把播放器传给 `VideoView`。
4. 监听播放器事件，把原生状态转换成 React 可响应状态。

`useVideoPlayer` 会在组件卸载时自动释放播放器，应当作为默认创建方式。

## 事件与 React 状态同步

直接读取：

```ts
player.playing
player.status
player.currentTime
```

只能获得读取瞬间的值。播放器属性变化不会自动触发 React 重新渲染。

这与 React Web 中直接读取 `videoRef.current.currentTime` 类似：DOM 或原生对象发生变化，并不等于 React state 发生变化。

### `useEvent`

适合将事件的最新结果直接用于渲染：

```tsx
const { status, error } = useEvent(player, 'statusChange', {
  status: player.status,
});
```

特点：

- 返回可触发组件更新的状态值。
- 组件卸载时自动移除监听器。
- 适合播放按钮、加载状态和错误提示等 UI。

### `useEventListener`

适合在事件发生时执行自定义逻辑：

```tsx
useEventListener(player, 'statusChange', ({ status, error }) => {
  setPlayerStatus(status);
  setPlayerError(error);
});
```

它基于 `addListener` 和 `removeListener`，但会自动清理监听器。

### `player.addListener`

提供最灵活的底层监听方式，需要手动清理：

```tsx
useEffect(() => {
  const subscription = player.addListener(
    'statusChange',
    ({ status, error }) => {
      setPlayerStatus(status);
      setPlayerError(error);
    }
  );

  return () => subscription.remove();
}, [player]);
```

忘记调用 `remove()` 会留下无效监听器，可能导致重复回调或内存问题。

### 常用事件

| 事件 | 用途 |
| --- | --- |
| `playingChange` | 播放和暂停状态变化 |
| `statusChange` | `idle`、`loading`、`readyToPlay`、`error` 状态变化 |
| `sourceChange` | 播放源被替换 |
| `sourceLoad` | 视频元数据加载完成 |
| `playToEnd` | 播放到结尾 |
| `timeUpdate` | 定时获得进度和直播信息 |
| `volumeChange` | 音量或静音属性变化 |
| `audioTrackChange` | 当前音轨变化 |
| `subtitleTrackChange` | 当前字幕轨变化 |
| `videoTrackChange` | 当前视频轨变化 |
| `isExternalPlaybackActiveChange` | iOS AirPlay 状态变化 |

`sourceLoad` 只表示元数据加载完成，不代表已经缓冲了足够数据可以立即播放。

`timeUpdate` 默认不会发出，因为 `timeUpdateEventInterval` 默认是 `0`。需要先设置非零秒数：

```ts
player.timeUpdateEventInterval = 0.5;
```

## 视频来源

`VideoSource` 可以是：

```ts
string | number | null | VideoSourceObject
```

- `string`：通常是网络 URL 或本地 URI。
- `number`：`require()` 返回的本地资源 ID。
- `null`：暂时不加载资源，可稍后调用 `replaceAsync()`。
- 对象：配置 URI、请求头、媒体类型、缓存、DRM 和系统元数据。

### 本地 assets 视频

```tsx
import { VideoSource } from 'expo-video';

const assetId = require('./assets/bigbuckbunny.mp4');

const videoSource: VideoSource = {
  assetId,
  metadata: {
    title: 'Big Buck Bunny',
    artist: 'The Open Movie Project',
  },
};

const player1 = useVideoPlayer(assetId);
const player2 = useVideoPlayer(videoSource);
```

`assetId` 和 `uri` 是互斥选项。如果同时提供，`assetId` 会被忽略。

### 用户媒体库视频

需要先请求媒体权限，再通过 `expo-media-library/legacy` 获得资源：

```tsx
const { granted } = await MediaLibrary.requestPermissionsAsync(false, ['video']);

if (!granted) {
  return;
}

const pagedAssets = await MediaLibrary.getAssetsAsync({
  mediaType: 'video',
});

const asset = pagedAssets.assets[0];

await player.replaceAsync({
  uri: asset.uri,
  metadata: {
    title: asset.filename,
  },
});

player.play();
```

iOS 上不要使用资源信息中的 `localUri`，因为它不包含读取该媒体资源所需的权限。应使用 `Asset.uri`。

`PHAsset` URI 只能通过默认 `VideoPlayer` 构造流程或 `replaceAsync()` 加载。

### `VideoSourceObject` 关键字段

| 字段 | 作用 |
| --- | --- |
| `uri` | 视频 URI |
| `assetId` | `require()` 获得的本地资源 ID |
| `contentType` | 指定 progressive、HLS、DASH 等媒体类型 |
| `headers` | 视频资源请求头 |
| `drm` | DRM 类型和许可证服务器配置 |
| `metadata` | 系统“正在播放”界面展示的标题、作者和封面 |
| `useCaching` | Android、iOS 是否启用缓存 |

`headers` 用于视频资源请求；DRM 许可证请求头必须放在 `drm.headers` 中。

### `contentType`

可选值：

| 值 | 含义 |
| --- | --- |
| `auto` | 自动判断，默认值 |
| `progressive` | 普通渐进式下载 |
| `hls` | HLS 流媒体 |
| `dash` | DASH，仅 Android |
| `smoothStreaming` | SmoothStreaming，仅 Android |

当 URL 没有标准扩展名时，应显式填写媒体类型。例如 HLS URL 不以 `.m3u8` 结尾时，设置：

```ts
const source = {
  uri: signedUrl,
  contentType: 'hls',
};
```

iOS HLS 源如果既没有 `.m3u8` 扩展名，也没有声明 `contentType: 'hls'`，视频轨信息可能无法获得。

## 预加载与切换视频

即使 `VideoPlayer` 没有连接到 `VideoView`，它仍会加载视频并填充缓冲区。因此可以同时创建：

- 当前播放的播放器
- 下一个视频的预加载播放器

切换时只需把 `VideoView` 的 `player` 属性换成已预加载的实例。

如果不希望播放器创建后立刻加载，可以先传入 `null`：

```tsx
const player = useVideoPlayer(null);

// 需要开始预加载时
await player.replaceAsync(nextSource);
```

**基于文档内容推导：** 该模式适合短视频流、课程章节切换和轮播视频，但同时保留多个播放器会增加网络、内存及解码资源占用，不应无上限预加载。

## 播放器生命周期

### 推荐：`useVideoPlayer`

```tsx
const player = useVideoPlayer(source, player => {
  player.loop = true;
});
```

组件卸载时会自动释放原生资源。

### 高级方式：`createVideoPlayer`

```tsx
import { createVideoPlayer } from 'expo-video';

const player = createVideoPlayer(videoSource);
```

该播放器不会自动释放。使用结束后必须调用：

```ts
player.release();
```

否则可能内存泄漏。

Android 还有一项平台限制：不能同时把同一个 `VideoPlayer` 实例挂载到多个 `VideoView` 中。

Web 提供了实验性的 `useAudioNodePlayback`，用于避免同一播放器显示在多个视图时音量叠加。不过它可能破坏部分视频源的音频，并且不能在运行时切换。

## `VideoView`：视频显示组件

`VideoView` 是继承 React Native `ViewProps` 的原生视图组件。

### 显示与缩放

```tsx
<VideoView
  player={player}
  contentFit="contain"
  nativeControls
/>
```

`contentFit` 对应 Web 中常见的 `object-fit` 思路：

| 值 | 效果 |
| --- | --- |
| `contain` | 保持比例完整显示，可能留黑边 |
| `cover` | 保持比例铺满容器，可能裁剪 |
| `fill` | 拉伸填满，可能变形 |

Android 上如果两个 `VideoView` 重叠并使用 `contentFit="cover"`，其中一个视频可能越界显示。这是已知上游问题，可改用：

```tsx
<VideoView surfaceType="textureView" />
```

默认的 `surfaceView` 性能更好、耗电更低、功能更多。只有发生重叠等兼容问题时才应使用 `textureView`，并且 `surfaceType` 不应在运行时更改。

### 原生控件

```tsx
<VideoView nativeControls={false} />
```

- 默认显示平台原生控件。
- 全屏模式受平台限制，原生控件始终启用。
- Android 可使用 `buttonOptions` 控制播放、快进、字幕、设置等按钮。
- Android 的全屏按钮应通过 `fullscreenOptions.enable` 控制，不属于 `buttonOptions`。
- Android 的 `controllerAutoShow={false}` 可以阻止控件在自动播放、暂停或结束时反复闪现，但用户仍可点击画面显示控件。

### 首帧事件

```tsx
<VideoView
  player={player}
  onFirstFrameRender={() => setShowPoster(false)}
/>
```

该事件适合在首帧出现后隐藏封面图。

它可能在播放过程中因视频轨切换再次触发，例如播放器切换清晰度时。因此不要把它当作“每个视频只执行一次”的保证。

### 全屏

可以通过 ref 调用：

```tsx
await ref.current?.enterFullscreen();
await ref.current?.exitFullscreen();
```

Android 进入全屏后 JavaScript 运行时会暂停，因此普通 JS 计时器无法可靠地在全屏期间调用 `exitFullscreen()`：

```tsx
// Android 上不能按预期工作
setTimeout(() => {
  ref.current?.exitFullscreen();
}, 5000);

ref.current?.enterFullscreen();
```

从原生播放器事件监听器中调用则可以，例如在 `playToEnd` 时退出全屏。

### 画中画

相关入口包括：

```tsx
<VideoView
  allowsPictureInPicture
  startsPictureInPictureAutomatically
/>
```

以及：

```ts
await ref.current?.startPictureInPicture();
await ref.current?.stopPictureInPicture();
```

调用前可以检查：

```ts
Video.isPictureInPictureSupported();
```

限制：

- 必须启用 config plugin 的 `supportsPictureInPicture`。
- 设备本身必须支持画中画。
- 同一时间只能有一个播放器处于画中画。
- 自动进入画中画支持 Android 12+ 和 iOS。

### Web 专用属性

- `playsInline`：让视频在元素区域内播放。
- `crossOrigin`：可设置为 `anonymous` 或 `use-credentials`。
- 开启 CORS 后，CDN 如果没有正确返回跨域响应头，视频可能无法播放。

这与 React Web 使用 `<video crossorigin>` 的约束基本一致。

## `VideoPlayer` 的主要状态与控制

### 基础播放控制

```ts
player.play();
player.pause();
player.replay();
player.seekBy(10);
player.currentTime = 30;
```

- `play()`：继续播放。
- `pause()`：暂停。
- `replay()`：跳到开头。
- `seekBy(seconds)`：相对当前位置跳转，允许因编码和缓冲而存在偏差。
- 设置 `currentTime`：跳到绝对时间，适合要求更精确的定位。

### 常用属性

| 属性 | 含义 |
| --- | --- |
| `playing` | 是否正在播放，只读 |
| `status` | 当前加载与播放状态，只读 |
| `currentTime` | 当前秒数，写入会触发 seek |
| `duration` | 总时长，只读 |
| `bufferedPosition` | 已缓冲到的秒数 |
| `loop` | 是否循环 |
| `muted` | 是否静音 |
| `volume` | `0` 到 `1` |
| `playbackRate` | `0` 到 `16` |
| `preservesPitch` | 倍速时是否校正音高 |
| `isLive` | 是否为直播 |
| `keepScreenOnWhilePlaying` | 播放时是否保持屏幕亮起 |

`muted` 和 `volume` 相互独立：

- 静音不会把 `volume` 改为 `0`。
- 修改音量不会自动取消静音。

Android 的 `keepScreenOnWhilePlaying` 只有在 `VideoView` 可见时生效。如果需要应用始终保持亮屏，应使用 `expo-keep-awake`。

### 播放器状态

`status` 可能为：

| 状态 | 含义 |
| --- | --- |
| `idle` | 没有播放或加载媒体 |
| `loading` | 正在加载 |
| `readyToPlay` | 已有足够数据开始或继续播放 |
| `error` | 加载或播放失败 |

错误详情通过 `statusChange` 事件中的 `error.message` 获取。

### 更换资源

推荐使用：

```ts
await player.replaceAsync(newSource);
```

旧的同步方法：

```ts
player.replace(newSource);
```

在 iOS 上会在 UI 线程同步加载资源，可能长时间阻塞界面，而且未来将被弃用。Android 和 Web 中，`replaceAsync()` 当前等价于 `replace()`，但跨平台代码仍应优先使用异步版本。

## Seek 与拖动进度条

### `seekTolerance`

默认精确跳转，即前后容差均为 `0`：

```ts
player.seekTolerance = {
  toleranceBefore: 0.5,
  toleranceAfter: 0.5,
};
```

更大的容差通常可以更快定位，但实际位置可能落在目标时间前后。

### `scrubbingModeOptions`

Scrubbing 指用户连续拖动进度条，短时间内产生大量 seek。

```ts
player.scrubbingModeOptions = {
  scrubbingModeEnabled: true,
};
```

注意：

- 只应在高频拖动期间开启。
- Android 开启后会抑制正常播放，交互结束时必须恢复为 `false`。
- Android 可能消耗更多资源。
- iOS 为获得更好效果，拖动时应暂停播放。
- 其他 scrubbing 优化项仅在 `scrubbingModeEnabled` 为 `true` 时生效。

**基于文档内容推导：** 普通的“快进 10 秒”不需要开启 scrubbing 模式，调整 `seekTolerance` 通常已经足够。

## 音频、字幕与视频轨

可读取：

```ts
player.availableAudioTracks;
player.availableSubtitleTracks;
player.availableVideoTracks;
```

选择音轨：

```ts
player.audioTrack = player.availableAudioTracks[0];
```

选择字幕时，必须使用 `availableSubtitleTracks` 数组中实际存在的对象：

```ts
player.subtitleTrack = player.availableSubtitleTracks[0];

// 关闭字幕
player.subtitleTrack = null;
```

不要自行构造一个字段相同的字幕对象代替播放器返回的对象。

`VideoTrack` 可提供：

- 分辨率
- 帧率
- 平均与峰值码率
- MIME 类型
- SDR、HLG 或 PQ 动态范围
- Android 设备是否支持该轨道
- HLS 轨道 URL

`bitrate` 字段已经弃用，应改用 `peakBitrate` 或 `averageBitrate`。

## 音频混合与系统播放

`audioMixingMode` 决定视频声音如何与其他应用的声音共存：

| 模式 | 行为 |
| --- | --- |
| `mixWithOthers` | 与其他应用同时播放 |
| `duckOthers` | 降低其他应用音量 |
| `auto` | 静音时允许其他应用继续播放 |
| `doNotMix` | 暂停其他应用声音，即使当前播放器静音 |

多个播放器使用不同模式时，整个应用采用优先级最高的模式：

```text
doNotMix > auto > duckOthers > mixWithOthers
```

iOS 的系统 Now Playing 通知要求音频模式为 `doNotMix` 或 `auto`。当 `showNowPlayingNotification` 为 `true` 时，iOS 的系统要求还会使 `auto` 中断其他应用音频。

要显示系统播放通知：

```ts
player.showNowPlayingNotification = true;
```

Android 同时要求 config plugin 的 `supportsBackgroundPlayback: true`。

`metadata` 可设置通知中的标题、作者和封面：

```ts
const source = {
  uri,
  metadata: {
    title: '课程第 1 节',
    artist: '讲师名称',
    artwork: 'https://example.com/cover.jpg',
  },
};
```

## 后台播放和 AirPlay

后台播放需要同时满足：

```json
{
  "supportsBackgroundPlayback": true
}
```

以及：

```ts
player.staysActiveInBackground = true;
```

iOS 默认允许外部播放：

```ts
player.allowsExternalPlayback = true;
```

`VideoAirPlayButton` 是 iOS 专用组件，会显示系统 AirPlay 设备选择器。使用它时必须确保 `allowsExternalPlayback` 为 `true`。

可配置：

- 非活动和活动状态图标颜色
- 是否优先显示视频设备
- 路由选择弹窗开始及结束回调

## 视频缓存

缓存仅支持 Android 和 iOS：

```ts
const source = {
  uri: videoUrl,
  useCaching: true,
};
```

缓存特性：

- 默认期望容量为 1 GB。
- 持久保存，并按最近最少使用（LRU）策略淘汰。
- 系统存储空间不足时可能主动清除。
- 已缓存部分可离线播放，直到缓存数据耗尽。
- 实际缓存占用可能略大于设置值。
- 缓存不能作为关键数据的可靠存储。

限制：

- iOS 不支持缓存 HLS 视频源。
- Android 和 iOS 均不支持缓存 DRM 视频。

缓存管理 API：

```ts
await Video.setVideoCacheSizeAsync(sizeBytes);
const bytes = Video.getCurrentVideoCacheSize();
await Video.clearVideoCacheAsync();
```

`setVideoCacheSizeAsync()` 和 `clearVideoCacheAsync()` 只能在不存在任何 `VideoPlayer` 实例时调用。这意味着通常应在创建播放器之前设置容量，并在确保所有播放器已经释放后清空缓存。

## 缓冲配置

`bufferOptions` 需要作为完整对象整体赋值，不能逐项修改：

```ts
player.bufferOptions = {
  preferredForwardBufferDuration: 20,
  minBufferForPlayback: 2,
};
```

主要配置包括：

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `preferredForwardBufferDuration` | Android、iOS | 希望提前缓冲的秒数 |
| `minBufferForPlayback` | Android | 开始或恢复播放所需的最小缓冲 |
| `maxBufferBytes` | Android | 最大网络缓冲字节数，`0` 表示自动决定 |
| `prioritizeTimeOverSizeThreshold` | Android | 是否优先满足时间而不是容量阈值 |
| `waitsToMinimizeStalling` | iOS | 是否允许延迟播放以减少卡顿 |

这些参数会影响首播速度、卡顿概率、网络使用和内存占用。当前文档没有提供针对具体业务的推荐参数。

## DRM 受保护视频

`VideoSourceObject.drm` 用于配置数字版权保护：

```ts
const source = {
  uri: videoUrl,
  drm: {
    type: 'widevine',
    licenseServer: 'https://example.com/license',
    headers: {
      Authorization: 'Bearer token',
    },
  },
};
```

平台支持：

- Android：ClearKey、PlayReady、Widevine
- iOS：FairPlay

FairPlay 还可配置证书 URL、Base64 证书数据和内容 ID。若提供了 `base64CertificateData`，`certificateUrl` 会被忽略。

DRM 视频不能使用 `expo-video` 缓存。当前文档没有说明许可证服务端实现、密钥管理和完整 DRM 部署流程。

## 直播信息

直播资源可读取：

```ts
player.isLive;
player.currentLiveTimestamp;
player.currentOffsetFromLive;
```

- `currentLiveTimestamp`：当前画面对应的服务器发送时间。
- `currentOffsetFromLive`：当前播放位置距离直播最新位置的延迟秒数。
- `targetOffsetFromLive`：iOS 上设置目标直播延迟。

这些信息依赖流媒体元数据中的 `EXT-X-PROGRAM-DATE-TIME`。缺少所需元数据时会返回 `null`。

## 生成视频缩略图

Android 和 iOS 可以从当前资源生成缩略图：

```ts
const thumbnails = await player.generateThumbnailsAsync(
  [1, 5, 10],
  {
    maxWidth: 320,
    maxHeight: 180,
  }
);
```

返回的 `VideoThumbnail` 是原生图片引用，可直接作为 `expo-image` 的 `Image` source，而不是普通网络 URL。

它提供：

- `requestedTime`：要求截图的时间
- `actualTime`：iOS 实际生成截图的时间
- `width`、`height`
- `nativeRefType`

由于视频编码关键帧等原因，实际截图时间可能与请求时间不同。

## iOS 原生资源加载拦截

`VideoAssetTransportProvider` 是面向高级原生集成的 iOS 扩展点。普通视频播放业务通常不需要它。

适用场景包括：

- 改写视频 URL
- 添加自定义 `AVAssetResourceLoaderDelegate`
- 启动本地代理服务器
- 播放前预处理资源
- 把一种流媒体格式转换成另一种格式
- 处理 `AVKit` 无法直接加载的来源

它需要创建自定义 Expo 原生模块并重新编译应用，因此不能在 Expo Go 中使用，应使用 development build。

### 工作流程

1. 使用 `create-expo-module` 创建 Expo 模块。
2. 编写符合 `VideoAssetTransportProvider` 的 Swift 类。
3. 在模块的 `OnCreate` 中注册 provider。
4. 构建应用，使原生模块编译进二进制文件。
5. 在 `OnDestroy` 中注销 provider。

如果只供单个应用使用，可创建 local Expo module；需要跨应用复用时，可创建 standalone Expo module。

### Provider 匹配机制

加载视频时，`expo-video` 会：

1. 创建 `VideoAssetSourceDescriptor`。
2. 按 `priority` 从高到低询问已注册 provider。
3. Provider 不处理该资源时返回 `nil`。
4. 第一个返回 `VideoAssetLoadPlan` 的 provider 获得处理权。

主要字段：

| 字段 | 作用 |
| --- | --- |
| `identifier` | 稳定唯一名称，用于替换和注销 |
| `priority` | 决定多个 provider 的匹配优先级 |
| `makeLoadPlan(for:)` | 判断是否匹配并返回加载计划 |

加载计划可控制：

- 创建 `AVURLAsset` 使用的 URL 和选项
- 转换后的实际内容类型
- 资源加载代理及回调队列
- 正式加载前的异步准备工作
- 需要随资源保持存活的辅助对象
- 异步错误转发
- 资源销毁时的清理逻辑

示例中通过识别 `.mpd` DASH 来源，将其转换成本地代理提供的 HLS `.m3u8` 地址。

## 平台限制与重点坑点

1. 当前页面属于下一版 SDK 文档，而不是 SDK 56 的稳定文档。实际项目使用稳定 SDK 时，应以对应版本 API 为准。
2. 播放器属性变化不会自动触发 React 渲染，必须监听事件。
3. 后台播放和画中画同时依赖构建期配置与运行时属性。
4. 修改 config plugin 后需要重新构建应用。
5. `createVideoPlayer()` 创建的播放器必须手动 `release()`。
6. Android 不能把同一播放器同时挂载到多个 `VideoView`。
7. Android 全屏期间 JS 运行时暂停，普通计时器不能可靠退出全屏。
8. Android 视频重叠且使用 `cover` 时可能越界，需要考虑 `textureView`。
9. `surfaceType` 和实验性的 `useAudioNodePlayback` 不应在运行时更改。
10. iOS 应使用 `replaceAsync()`，同步 `replace()` 可能阻塞 UI 且未来会弃用。
11. iOS 媒体库资源应使用 `asset.uri`，不能使用 `localUri`。
12. iOS HLS 缓存不受支持，DRM 视频在 Android、iOS 均不能缓存。
13. 清空缓存和设置缓存容量时不能存在任何播放器实例。
14. 原生控件在全屏模式下始终启用。
15. `onFirstFrameRender` 可能因视频轨切换重复触发。
16. `sourceLoad` 不代表已经缓冲到可播放状态。
17. 字幕轨必须从 `availableSubtitleTracks` 中选择。
18. HLS URL 缺少 `.m3u8` 扩展名时应显式声明 `contentType: 'hls'`。
19. 开启 Web CORS 后，视频服务端配置不正确可能反而导致无法播放。
20. 自定义 iOS 资源加载扩展不能在 Expo Go 中运行。

## React Web 开发者最容易误解的地方

### 不存在浏览器 DOM API

React Native 中没有：

```ts
document.querySelector('video')
videoElement.addEventListener(...)
```

控制入口是 `VideoPlayer` 实例，画面入口是 `VideoView`，状态同步依赖 Expo 事件 hooks。

### `VideoView` 不是播放器本身

卸载或替换 `VideoView` 不一定意味着播放资源对象已经销毁。真正持有原生播放器资源的是 `VideoPlayer`。

使用 `useVideoPlayer` 时生命周期由 hook 管理；使用 `createVideoPlayer` 时必须自行管理。

### 权限和能力不仅是前端状态

媒体库访问需要系统权限。后台播放、画中画和前台服务还需要原生清单配置。这些配置不能通过运行时布尔变量临时赋予应用。

### “跨平台”不等于完全一致

同一 API 在不同平台可能：

- 根本不支持
- 具有不同默认行为
- 受原生播放器限制
- 需要不同的媒体格式
- 只在特定系统版本生效

因此实现功能时应逐项检查 API 标注的平台范围，而不能只在 Web 或单一模拟器上验证。

## 实际开发建议

以下属于**基于经验建议**：

1. 默认使用 `useVideoPlayer`，只有确实需要跨组件生命周期共享播放器时才使用 `createVideoPlayer`。
2. 播放按钮、加载提示和错误 UI 应由事件驱动，不要依赖 render 时直接读取播放器属性。
3. 统一使用 `replaceAsync()`，避免为 iOS 单独维护同步替换逻辑。
4. 只预加载最可能立即播放的少量视频，并在列表离开可视区域时释放不再需要的播放器。
5. 将后台播放、画中画、缓存、DRM 和媒体库权限分别作为独立功能测试。
6. 同时在 Android 真机、iOS 真机和 Web 验证视频格式、全屏、音频焦点及生命周期行为。
7. 为 `status === 'error'`、权限拒绝、网络断开和 PiP 不支持提供明确的降级界面。
8. 自定义进度条拖动时，在交互开始和结束阶段成对开启、关闭 scrubbing 模式。
9. 不要把缓存视为离线下载系统；需要可靠离线视频时应设计独立的下载、完整性和存储管理方案。
10. 使用远程签名 URL、HLS 或 DRM 时，显式配置 `contentType` 和请求头，并分别验证资源请求与许可证请求。

## 文档明确内容与推导内容

### 文档明确说明

- 支持的平台、安装命令和 config plugin 配置。
- `VideoView`、`VideoPlayer`、hooks、事件和各类型的 API 行为。
- 播放器属性变化不会自动更新 React state。
- `useVideoPlayer` 自动清理，`createVideoPlayer` 需要手动释放。
- 缓存、画中画、后台播放、HLS、DRM 和 Android 全屏的限制。
- iOS 原生资源加载扩展的注册、匹配和清理机制。
- 各属性的默认值及平台支持情况。

### 基于文档内容推导

- 播放器与视图分离适合预加载和快速切换，但多个播放器会增加资源占用。
- 构建期能力和运行时开关应作为两层配置管理。
- 需要根据平台差异制定测试矩阵，而不能把跨平台 API 理解为行为完全一致。
- 普通低频跳转通常不需要开启高成本的 scrubbing 模式。

文档未涉及服务端视频转码策略、CDN 选型、完整离线下载方案、DRM 服务器实现、应用商店审核要求和生产环境性能指标，因此这里不对这些内容作进一步假设。

## 总结

`expo-video` 的核心模型是“一个负责播放状态的 `VideoPlayer`，连接到一个负责显示画面的 `VideoView`”。常规开发应通过 `useVideoPlayer` 创建播放器，并通过事件 hooks 将原生播放状态同步到 React。

实现基础播放并不复杂，但画中画、后台播放、缓存、媒体库、DRM 和原生资源转换都受到平台能力及构建配置约束。开发时最重要的是区分 JavaScript 运行时属性与必须重新构建才能生效的原生配置，并逐项处理 Android、iOS 和 Web 的差异。

---

## 文档导航

- **上一页**：[updates](./217__updates.md)
- **下一页**：[video thumbnails](./219__video-thumbnails.md)
