# 211｜Expo SDK Video（expo-video）视频播放

**翻页：**[上一页：Expo SDK Updates OTA 更新机制](./210-Expo-SDK-Updates.md) · [目录](./README.md) · [下一页：Expo SDK VideoThumbnails（已弃用）](./212-Expo-SDK-VideoThumbnails.md)

**官方页面：**[Video (expo-video) · Latest](https://docs.expo.dev/versions/latest/sdk/video/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/video/)

**版本与平台：**Latest 推荐 expo-video ~57.0.4；SDK v56.0.0 推荐 ~56.1.4。支持 Android、iOS、tvOS、Web，并包含在 Expo Go。

## 核心对象与术语

- **VideoPlayer：**管理媒体 source、播放状态、音量、seek、tracks、事件。
- **VideoView：**将 VideoPlayer 的画面绘制到 React Native 视图；可设置裁切、native controls、fullscreen 和 PiP。
- **VideoSource：**可为网络 URI、本地 require() 得到的 asset ID、null 或包含 DRM / metadata 等字段的对象。
- **Event listener：**播放器属性变化不会自动触发 React render；用 Expo 的 useEvent / useEventListener 将事件连接到组件状态。
- **Preload：**先创建播放器并缓冲资源，切换 VideoView 时更快显示画面。
- **PiP（Picture-in-Picture）：**画中画浮窗；Android / iOS 同一时间只能有一个 player 进入 PiP。
- **HLS / DASH：**自适应串流格式；若 URL 没标准扩展名，要在 source 的 contentType 明确声明。
- **Native controls：**平台播放器控件；全屏时平台限制会让 controls 保持可见。

Android 已知问题：两个 VideoView 重叠且 contentFit 为 cover 时，视频可能越出边界。可把 surfaceType 设为 textureView。默认 surfaceView 通常更省电、性能更好。

## 安装与构建配置

```sh
npx expo install expo-video
yarn expo install expo-video
pnpm expo install expo-video
bun expo install expo-video
```

已有 React Native app 需先集成 expo。开启后台播放 / PiP 要用 CNG config plugin 并重建原生 binary：

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

- supportsBackgroundPlayback 为 true 时，iOS 在 UIBackgroundModes 中启用 audio；Android 增加 foreground-service 权限并注册 expo-video foreground service。
- supportsPictureInPicture 为 true 时，Android 启用 supportsPictureInPicture，iOS 配 audio background mode。
- 未配置时插件不修改原生设置；设 false 时移除对应项。

## 基础播放与控件

useVideoPlayer 创建 player，在组件卸载时自动清理。VideoView 显示图像；useEvent 订阅 playingChange 并返回响应式状态：

```tsx
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Button, StyleSheet, View } from 'react-native';

const source = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function VideoScreen() {
  const player = useVideoPlayer(source, createdPlayer => {
    createdPlayer.loop = true;
    createdPlayer.play();
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
        title={isPlaying ? '暂停' : '播放'}
        onPress={() => isPlaying ? player.pause() : player.play()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, alignItems: 'center', justifyContent: 'center' },
  video: { width: 350, height: 275 },
});
```

## 接收播放事件

VideoPlayer 的属性变化不会自动同步到 React state。可选事件监听方式：

1. useEvent(player, event, initialValue)：给组件提供 stateful value，unmount 自动清理。
2. useEventListener(player, event, callback)：基于 player addListener / removeListener，自动清理。
3. player.addListener(event, callback)：最灵活，但自己在 useEffect cleanup 中调用 subscription.remove()。

useEvent 读取状态变化：

```tsx
import { useEvent } from 'expo';

const { status, error } = useEvent(player, 'statusChange', {
  status: player.status,
  error: null,
});
```

useEventListener 自动管理 subscription：

```tsx
import { useEventListener } from 'expo';

useEventListener(player, 'statusChange', ({ status, error }) => {
  setPlayerStatus(status);
  setPlayerError(error);
  console.log('播放状态变化：', status);
});
```

手动监听需要自己清理：

```tsx
useEffect(() => {
  const subscription = player.addListener('statusChange', ({ status, error }) => {
    setPlayerStatus(status);
    setPlayerError(error);
  });
  return () => subscription.remove();
}, [player]);
```

常见事件有 statusChange、playingChange、playToEnd、sourceChange、sourceLoad、timeUpdate、mutedChange、playbackRateChange、subtitleTrackChange、videoTrackChange、volumeChange、external playback 状态变化。timeUpdateEventInterval 默认 0，表示不开启定时事件。

## 本地 assets 与媒体库

### 播放本地视频文件

require() 得到的 asset ID 可直接作为 VideoSource；若还需显示 now-playing metadata，可包装成对象：

```tsx
import { useVideoPlayer, type VideoSource } from 'expo-video';

const assetId = require('./assets/sample.mp4');
const source: VideoSource = {
  assetId,
  metadata: { title: '示例影片', artist: '本地影视库' },
};

const playerFromAsset = useVideoPlayer(assetId);
const playerWithMetadata = useVideoPlayer(source);
```

VideoSource 的 assetId 与 uri 互斥；同时提供时 assetId 优先。

### 播放系统媒体库中的视频

需要先请求 video 权限，再用 MediaLibrary.getAssetsAsync 取 Asset；将 asset.uri 放入视频源。iOS 不要用 localUri，它没有读取该系统媒体资源需要的权限。官方示例使用 expo-media-library/legacy：

```tsx
import * as MediaLibrary from 'expo-media-library/legacy';
import { useVideoPlayer, type VideoSource } from 'expo-video';

async function loadFirstLibraryVideo(player: ReturnType<typeof useVideoPlayer>) {
  const { granted } = await MediaLibrary.requestPermissionsAsync(false, ['video']);
  if (!granted) return;

  const result = await MediaLibrary.getAssetsAsync({ mediaType: 'video' });
  if (result.assets.length === 0) return;

  const asset = result.assets[0];
  const source: VideoSource = {
    uri: asset.uri,
    metadata: { title: asset.filename },
  };
  await player.replaceAsync(source);
  player.play();
}
```

## Preload 与播放器生命周期

可先创建一个未连接到 VideoView 的 player，使它开始缓冲。两段视频各有 player，切换 View 时不需要重新开始缓冲：

```tsx
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';

const sourceA: VideoSource = 'https://example.com/video-a.mp4';
const sourceB: VideoSource = 'https://example.com/video-b.mp4';

export function PreloadedPlayers() {
  const playerA = useVideoPlayer(sourceA, player => player.play());
  const playerB = useVideoPlayer(sourceB, player => { player.currentTime = 20; });
  const [currentPlayer, setCurrentPlayer] = useState(playerA);

  const switchVideo = useCallback(() => {
    currentPlayer.pause();
    if (currentPlayer === playerA) {
      setCurrentPlayer(playerB);
      playerB.play();
    } else {
      setCurrentPlayer(playerA);
      playerA.play();
    }
  }, [currentPlayer, playerA, playerB]);

  return (
    <View>
      <VideoView player={currentPlayer} style={{ width: 300, height: 169 }} nativeControls={false} />
      <TouchableOpacity onPress={switchVideo}>
        <Text>切换预加载视频</Text>
      </TouchableOpacity>
    </View>
  );
}
```

如果想等到屏幕后续生命周期再 preload，可以用 null source 创建 player，并在需要时调用 replace / replaceAsync。

多数项目应使用 useVideoPlayer；它会在组件卸载时清理。高级场景可 createVideoPlayer 创建独立实例，但必须调用 release() 防止内存泄漏：

```ts
import { createVideoPlayer } from 'expo-video';

const player = createVideoPlayer(source);
// 不再需要时由 app 自己释放。
player.release();
```

Android 同一 VideoPlayer instance 不能同时挂到多个 VideoView。

## Cache、后台播放与 PiP

### 缓存

Android / iOS 支持 VideoSource 的 useCaching。cache 可减少重复播放的流量并支持离线使用已缓存部分，但占用设备空间；系统可能低存储时清理，也不是可靠文件归档。iOS HLS cache 不可用；iOS / Android 都不支持 DRM 视频缓存。

```ts
const cachedSource = {
  uri: 'https://example.com/movie.mp4',
  useCaching: true,
};
const cachedPlayer = useVideoPlayer(cachedSource);

const currentBytes = Video.getCurrentVideoCacheSize();
// 设置 / 清空 cache 要先释放所有 VideoPlayer。
await Video.setVideoCacheSizeAsync(512 * 1024 * 1024);
await Video.clearVideoCacheAsync();
```

cache 默认上限 1GB，按 least-recently-used 清除；设定大小是持久配置但实际大小略有浮动。setVideoCacheSizeAsync / clearVideoCacheAsync 只能在没有现存 VideoPlayer instance 时调用。

### 后台播放 / Now Playing

需先在 config plugin 启用 supportsBackgroundPlayback，再设置 player staysActiveInBackground；Android Now Playing notification 同样要求此配置：

```tsx
const player = useVideoPlayer(source, createdPlayer => {
  createdPlayer.staysActiveInBackground = true;
  createdPlayer.showNowPlayingNotification = true;
});
```

### Picture in Picture

需启用 supportsPictureInPicture config plugin 并在 VideoView 允许 PiP；Android 12+ / iOS 可设置切后台自动进入 PiP。一次只能有一个 player 进入该状态：

```tsx
<VideoView
  player={player}
  allowsPictureInPicture
  startsPictureInPictureAutomatically
  onPictureInPictureStart={() => setIsInPip(true)}
  onPictureInPictureStop={() => setIsInPip(false)}
/>

await player.startPictureInPicture();
await player.stopPictureInPicture();
```

### Fullscreen 限制

VideoView 可通过 ref 调 enterFullscreen / exitFullscreen。Android 全屏会暂停 JS runtime，所以退出全屏应从原生事件 listener（例如播放结束）触发；JS setTimeout 等待无法在 Android fullscreen 期间可靠执行：

```tsx
const viewRef = useRef<VideoView>(null);
useEventListener(player, 'playToEnd', () => {
  viewRef.current?.exitFullscreen();
});

const enterFullscreen = useCallback(() => {
  viewRef.current?.enterFullscreen();
}, []);
```

## 高级 iOS Native Asset Transport

这是原生高级扩展点，要求 custom native module 和 development build，Expo Go 不可用。iOS VideoAssetTransportProvider 可在 source load 前改写 URL、定制 AVURLAsset、挂载 resource loader / 本地代理、转换播放协议。系统按 priority 从高到低匹配，首个返回 VideoAssetLoadPlan 的 provider 生效。

Provider 主要字段：
- identifier：稳定唯一 ID。
- priority：多个 provider 匹配时的优先级。
- makeLoadPlan(for:)：检查 VideoAssetSourceDescriptor，返回 nil 代表忽略，返回 plan 代表接管 source。
- VideoAssetLoadPlan 有 assetURL、assetOptions、reportedContentTypeHint、resourceLoaderDelegate / queue、prepareAsset、retainedObjects、attachErrorHandler、onAssetDeinit。

定义一个把 DASH playlist URL 转成本地 HLS proxy 的 provider：

```swift
import ExpoVideo

final class ExampleVideoTransportProvider: VideoAssetTransportProvider {
  static let providerIdentifier = "com.example.video-transport"
  let identifier = Self.providerIdentifier
  let priority = 500

  func makeLoadPlan(for source: VideoAssetSourceDescriptor) -> VideoAssetLoadPlan? {
    guard source.contentTypeHint == .dash, source.url.pathExtension == "mpd" else {
      return nil
    }
    let playlist = URL(string: "http://127.0.0.1:8080/master.m3u8")!
    return VideoAssetLoadPlan(assetURL: playlist, reportedContentTypeHint: .hls)
  }
}
```

在 Expo module 的 OnCreate 注册、OnDestroy 注销：

```swift
import ExpoModulesCore
import ExpoVideo

public final class CustomVideoTransportModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CustomVideoTransport")
    OnCreate {
      VideoAssetTransportRegistry.registerProvider(ExampleVideoTransportProvider())
    }
    OnDestroy {
      VideoAssetTransportRegistry.unregisterProvider(
        withId: ExampleVideoTransportProvider.providerIdentifier
      )
    }
  }
}
```

## VideoView 与 VideoPlayer API 速查

### VideoView Props

| Prop | 平台 / 默认 | 含义 |
| --- | --- | --- |
| player | Android / iOS / tvOS / Web；VideoPlayer 或 null | 将该 player 的画面挂到 view。 |
| contentFit | 全平台；contain | contain 留黑边保比例；cover 裁切铺满；fill 拉伸。 |
| nativeControls | 全平台；true | 系统播放控件；全屏时始终会显示。 |
| fullscreenOptions | 多平台 | 全屏配置。 |
| allowsPictureInPicture | Android / iOS / Web | 允许 PiP；需 config plugin 开启 PiP。 |
| startsPictureInPictureAutomatically | Android 12+ / iOS；false | app 后台后自动启动 PiP。 |
| onPictureInPictureStart / Stop | Android / iOS / Web | PiP 进入 / 退出时回调。 |
| onFirstFrameRender | 多平台 | 首帧绘制时回调；切换视频轨 / 画质也可能再次触发。 |
| onFullscreenEnter / Exit | 多平台 | 进入 / 离开全屏回调。 |
| buttonOptions | Android | native control buttons 显示设置。 |
| contentPosition | iOS；dx/dy | 视频在容器内的位置偏移。 |
| allowsVideoFrameAnalysis | iOS 16+；true | 允许 Live Text 分析视频帧。 |
| playsInline | Web | 在元素的播放区域内联播放。 |
| crossOrigin | Web | undefined 不启用 CORS；anonymous / use-credentials 会开启 CORS，CDN 设置可能影响播放。 |
| requiresLinearPlayback | Android / iOS；false | 禁止用户跳过内容。 |
| showsTimecodes | iOS；true | 显示时间码。 |
| surfaceType | Android；surfaceView | textureView 可规避重叠视频越界问题；不能运行时改。 |
| useAudioNodePlayback | Web；实验功能 | 多 view 共享 player 时避免音量重复叠加；部分 source 可能无声，不建议改运行时。 |
| useExoShutter | Android；false | 使用 ExoPlayer 首帧前遮罩。 |

VideoAirPlayButton 仅 iOS，显示 AirPlay route picker；player 要允许 external playback。props 有 activeTint / tint、popup 显示前后 callback、prioritizeVideoDevices。

### VideoPlayer Properties

| 属性 | 说明 |
| --- | --- |
| currentTime / duration | 当前播放位置 / 视频长度，单位秒；currentTime 可 seek。 |
| playing / status | 只读播放状态；status 是 idle / loading / readyToPlay / error。 |
| bufferedPosition | 已缓冲到的时间，不能确定时可能为 -1。 |
| isLive / currentLiveTimestamp / currentOffsetFromLive | 直播标志、帧时间戳、live 延迟。缺少 HLS 时间标签则后两者可能 null。 |
| loop / muted / playbackRate / volume | 循环、静音、播放速度 0–16（默认1）、音量 0–1（默认1）。静音不更改 volume。 |
| preservesPitch | 倍速时校正音高，默认 true。 |
| keepScreenOnWhilePlaying | 默认 true；Android 仅在 VideoView 可见时生效。 |
| staysActiveInBackground | Android / iOS 默认 false；需 supportsBackgroundPlayback=true。 |
| showNowPlayingNotification | Android / iOS 默认 false；Android 需后台播放配置；iOS 受 audioMixingMode 限制。 |
| audioMixingMode | auto / doNotMix / duckOthers / mixWithOthers；多播放器优先级 doNotMix > auto > duckOthers > mixWithOthers。 |
| audioTrack / subtitleTrack / videoTrack | 当前音轨 / 字幕 / 视频轨；先从 availableAudioTracks / availableSubtitleTracks / availableVideoTracks 选。 |
| seekTolerance / scrubbingModeOptions | 控 seek 精度与频繁拖动体验。 |
| timeUpdateEventInterval | 秒数间隔，默认 0 不发 timeUpdate。 |
| bufferOptions | 必须整个 BufferOptions 对象赋值，不支持单独更新字段。 |
| allowsExternalPlayback | iOS 默认 true，控制 AirPlay 等外部播放。 |

### 常用 Methods / Cache

| API | 作用 |
| --- | --- |
| play() / pause() / replay() | 播放、暂停、回到开头。 |
| replace(source) | 同步换 source；iOS 可能阻塞 UI thread，未来将 deprecated。 |
| replaceAsync(source) | 异步换 source；Android / Web 与 replace 等效。 |
| seekBy(seconds) | 相对当前播放时间跳转；精确 seek 请设置 currentTime。 |
| generateThumbnailsAsync(times, options?) | Android / iOS 生成 native thumbnail references，可给 expo-image 用。 |
| useVideoPlayer(source, setup?, playerBuilderOptions?) | 创建 player 并在 React unmount 自动清理。 |
| createVideoPlayer(source) | 手动创建且不会自动 release；应用需负责生命周期。 |
| player.release() | 清理直接创建的 VideoPlayer。 |
| VideoView.enterFullscreen() / exitFullscreen() | 控制全屏。Android 退出要从 native event 回调执行。 |
| player.startPictureInPicture() / stopPictureInPicture() | 开始 / 结束 PiP；不支持时 start 会抛异常。 |
| Video.isPictureInPictureSupported() | Android / iOS 查询 PiP 支持。 |
| Video.setVideoCacheSizeAsync(bytes) / getCurrentVideoCacheSize() / clearVideoCacheAsync() | 管理缓存大小 / 占用 / 清空；set 和 clear 时必须没有 active VideoPlayer。 |

## VideoSource 与 Track 类型速查

- VideoSource 是 string URL、number assetId、null 或 VideoSourceObject。
- VideoSourceObject：assetId 与 uri 互斥；还有 contentType、drm、headers（Android / iOS）、metadata、useCaching（Android / iOS）。iOS PHAsset 要用 uri 并用默认 player constructor 或 replaceAsync 加载；不要用 MediaLibrary localUri。
- ContentType：auto、progressive、hls、dash、smoothStreaming；DASH / SmoothStreaming 仅 Android。iOS HLS 视频轨要有 .m3u8 扩展名或设置 contentType='hls'。
- AudioTrack / SubtitleTrack：label、language、isDefault、autoSelect、平台 track ID。
- VideoTrack：averageBitrate、peakBitrate、frameRate、id、mimeType、size、url(HLS)、videoRange，另有 Android isSupported；旧 bitrate 字段 deprecated。
- DRMOptions：licenseServer 必填；可设 license headers；FairPlay 的 certificateUrl / base64CertificateData / contentId；Android multiKey；DRMType 有 clearkey / fairplay / playready / widevine（平台支持各异）。
- VideoThumbnail：native image reference，含 requestedTime / actualTime / width / height；VideoThumbnailOptions 可限 maxWidth / maxHeight。
- VideoPlayerEvents 包括 external playback、muted、playback rate、playing、play end、source change/load、status、subtitle/video track、time update、volume change。
- 常见 event payload：statusChange 含 status / oldStatus / error；playingChange 含 isPlaying / oldIsPlaying；sourceLoad 含 tracks / duration / source；timeUpdate 含 currentTime / buffered/live 信息。

## Latest 与 SDK v56.0.0 对照

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐包 | expo-video ~57.0.4 | ~56.1.4 |
| 平台 / Expo Go、Usage code topics、VideoView / VideoPlayer 主要 API | 两版对照相同 | 与 Latest 一致 |
| 官方 Next | VideoThumbnails（legacy） | VideoThumbnails（legacy） |

## 官方源页代码主题覆盖

- Installation 与 config plugin：包管理器命令和 background / PiP 原生能力配置。
- Usage 播放：VideoPlayer / VideoView play-pause 示例和 event state。
- Events：useEvent、useEventListener、手动 addListener 及 cleanup。
- Source：本地 require asset、MediaLibrary 权限 / asset.uri、预加载双 player 切换。
- Lifecycle：手动 createVideoPlayer 后 release；Android fullscreen JS 暂停限制。
- Cache / background / PiP：useCaching 与缓存清理、后台播放 / Now Playing、PiP props / API。
- Advanced native transport：Swift provider 实现与 Expo Module 注册两个原生代码示例。
- API 表整理 VideoView / VideoPlayer props、player methods、cache / PiP APIs 和主要 source / event / track / DRM 类型。

**翻页：**[上一页：Expo SDK Updates OTA 更新机制](./210-Expo-SDK-Updates.md) · [目录](./README.md) · [下一页：Expo SDK VideoThumbnails（已弃用）](./212-Expo-SDK-VideoThumbnails.md)
