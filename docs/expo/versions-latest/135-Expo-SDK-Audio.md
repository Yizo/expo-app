# 135｜Expo SDK Audio（expo-audio）

**翻页：**[上一页：Expo SDK Asset](./134-Expo-SDK-Asset.md) · [目录](./README.md) · [下一页：Expo SDK AuthSession](./136-Expo-SDK-AuthSession.md)

**官方页面：**[Audio · Latest](https://docs.expo.dev/versions/latest/sdk/audio/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/audio/)

**版本边界：**Latest 推荐 `expo-audio ~57.0.5`，SDK v56.0.0 推荐 `~56.0.13`。两版都提供播放、录音、播放列表、后台音频、权限和 PCM 采样 API，支持 Android、iOS、tvOS 与 Web，并可在 Expo Go 中使用。下面按 Latest 当前页面整理；在项目中请安装与 SDK 匹配的版本并以 v56 页面为准。平台编解码器能力、后台限制和 Web 录音能力并不完全相同。

## 这是什么

`expo-audio` 是跨平台音频接口：用 `AudioPlayer` 播放本地或远端声音，用 `AudioRecorder` 录音，也能管理播放队列或读取实时 PCM 音频。**PCM** 是尚未压缩的采样数据，常用于波形、音量分析或语音处理。接入后如耳机或蓝牙音频设备断开，播放会自动停止。

安装时使用 `expo install`，它会选择与当前 Expo SDK 相配的包版本：

```sh
npx expo install expo-audio
# 也可使用：yarn expo install expo-audio
# pnpm expo install expo-audio
# bun expo install expo-audio
```

## 原生配置与麦克风权限

Expo Config Plugin 可以在 CNG（Continuous Native Generation）生成 iOS / Android 原生工程时写入权限与后台模式。插件配置属于**构建期配置**：改变后要重新生成并构建原生 App；若项目手动维护 `ios/`、`android/` 工程，则需把相同设置写进原生文件。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "允许 $(PRODUCT_NAME) 使用麦克风。",
          "recordAudioAndroid": true,
          "enableBackgroundPlayback": true,
          "enableBackgroundRecording": false
        }
      ]
    ]
  }
}
```

| 插件选项 | 默认值 | 作用 |
| --- | --- | --- |
| `microphonePermission` | iOS 权限说明字符串 | 设置 `NSMicrophoneUsageDescription`；设为 `false` 会关闭该权限声明。 |
| `recordAudioAndroid` | `true` | 是否添加 Android `RECORD_AUDIO` 权限。 |
| `enableBackgroundPlayback` | `true` | 配置后台播放。Android 会声明媒体播放前台服务，iOS 会添加 `audio` 后台模式。 |
| `enableBackgroundRecording` | `false` | 配置后台录音。Android 会启用录音前台服务，录音时持续显示系统通知；iOS 会添加 `audio` 后台模式。后台录音明显增加耗电。 |

**前台服务**是 Android 允许长时间在后台工作的服务类型，系统会持续显示通知。iOS 的 `UIBackgroundModes` 是 App 声明可在后台继续执行的能力。

手动维护原生工程时，后台播放至少需要在 Android Manifest 中声明媒体服务与权限，并在 iOS `Info.plist` 中加入音频后台模式：

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

<application>
  <service
    android:name="expo.modules.audio.service.AudioControlsService"
    android:exported="false"
    android:foregroundServiceType="mediaPlayback">
    <intent-filter>
      <action android:name="androidx.media3.session.MediaSessionService" />
    </intent-filter>
  </service>
</application>
```

```xml
<!-- ios/YourApp/Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

后台录音的 Android 原生权限还包括 `FOREGROUND_SERVICE_MICROPHONE` 和 `POST_NOTIFICATIONS`；iOS 同样需要 `UIBackgroundModes` 的 `audio` 项。手动维护原生工程时可这样配置：

```xml
<!-- AndroidManifest.xml：将这些项放在 manifest 根节点下 -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

```xml
<!-- ios/YourApp/Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

录音场景的插件配置把 `enableBackgroundRecording` 设为 `true`，并可自定义麦克风权限提示：

```json
{
  "expo": {
    "plugins": [[
      "expo-audio",
      {
        "microphonePermission": "允许 $(PRODUCT_NAME) 录制音频。",
        "enableBackgroundRecording": true
      }
    ]]
  }
}
```

## 基础播放

`useAudioPlayer` 创建并管理播放器；组件卸载时会自动释放。音源可以是静态 `require()` 资源、URL、带 `uri` 的对象，或 `null`。播放器状态可由 `useAudioPlayerStatus` 订阅：

```tsx
import { Button, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export default function PlayerExample() {
  const player = useAudioPlayer(require('./assets/hello.mp3'));
  const status = useAudioPlayerStatus(player);

  return (
    <View>
      <Text>{status.playing ? '正在播放' : '已暂停'} · {status.currentTime}s / {status.duration}s</Text>
      <Button title="播放" onPress={() => player.play()} />
      <Button title="暂停" onPress={() => player.pause()} />
      <Button title="从头播放" onPress={() => { player.seekTo(0); player.play(); }} />
      <Button title="播放远程音频" onPress={() => player.replace({ uri: 'https://example.com/audio.mp3' })} />
    </View>
  );
}
```

播放器还可直接设置 `volume`（`0` 静音、`1` 最大音量）和 `playbackRate`（移动端通常在 `0.1` 到 `2` 之间；iOS 最低可为 `0`）。改变倍速时可选是否校正音高：

```ts
player.volume = 0; // 静音
player.volume = 0.5; // 一半音量
player.volume = 1; // 最大音量
player.setPlaybackRate(1, 'medium'); // 正常速度
player.setPlaybackRate(0.5, 'medium'); // 慢速
player.setPlaybackRate(1.5, 'medium'); // 快速
player.setPlaybackRate(2, 'medium'); // 移动端常见最大倍速
```

远端播放配置可控制 Web CORS、预先下载、是否让 iOS 音频会话在暂停后保持，以及播放状态更新频率。`updateInterval` 默认为 500 毫秒；更短的间隔适合进度条，更长的间隔可减少频繁状态更新：

```ts
const player = useAudioPlayer('https://example.com/audio.mp3', {
  downloadFirst: true,
  updateInterval: 100, // 高频刷新进度条
  preferredForwardBufferDuration: 8,
});
// 默认频率：{ updateInterval: 500 }
// 降低更新频率：{ updateInterval: 1000 }
```

## 录音与录音状态

开始录音前先请求麦克风权限、允许录音的音频模式，再准备录音器。默认高质量配置可换成低质量配置；Android 与 iOS 默认把录音文件放在系统可清理的缓存目录，需长期保留时把 `directory` 设为 `'document'`。结束录音后从 `recorder.uri` 读取文件 URI：

```tsx
import { useEffect } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export default function RecorderExample() {
  const recorder = useAudioRecorder(
    { ...RecordingPresets.HIGH_QUALITY, directory: 'document' },
    status => console.log('录音事件', status)
  );
  const state = useAudioRecorderState(recorder);

  useEffect(() => {
    async function prepareAudio() {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('需要麦克风权限');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    }
    prepareAudio();
  }, []);

  async function start() {
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stop() {
    await recorder.stop();
    console.log('录音文件：', recorder.uri);
  }

  return (
    <View>
      <Text>{state.isRecording ? '录音中' : '未录音'} · {Math.round(state.durationMillis / 1000)} 秒</Text>
      <Button title="开始" onPress={start} />
      <Button title="停止并保存 URI" onPress={stop} />
    </View>
  );
}
```

`useAudioRecorder` 可接收状态监听器；`useAudioRecorderState(recorder, interval)` 会轮询状态，间隔默认为 500ms。常用状态有 `canRecord`、`durationMillis`、`isRecording`、`metering`、`mediaServicesDidReset` 和 `url`。**metering** 是当前录音音量值，需在录音配置中启用测量。

## 后台播放与锁屏控制

后台播放必须同时有构建期原生配置和运行时音频会话配置。用锁屏控制时设置标题、艺术家、专辑和封面，并激活当前播放器：

```tsx
import { useEffect } from 'react';
import { Button, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

export function BackgroundPlayer() {
  const player = useAudioPlayer(require('./assets/podcast.mp3'));

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  function play() {
    player.setActiveForLockScreen(true, {
      title: '节目标题', artist: '播客作者', albumTitle: '节目名称',
      artworkUrl: 'https://example.com/cover.jpg',
    }, { showSeekBackward: true, showSeekForward: true });
    player.play();
  }

  function stop() {
    player.pause();
    player.clearLockScreenControls();
  }

  return <View><Button title="播放" onPress={play} /><Button title="停止" onPress={stop} /></View>;
}
```

锁屏控制一次只能由一个播放器激活；更新当前锁屏信息可用 `updateLockScreenMetadata()`。需将 `interruptionMode` 设为 `'doNotMix'`，否则系统可能无法把锁屏控件关联到播放器。Android 长时间后台播放还需锁屏控件与媒体前台服务；否则系统可能在约 3 分钟后停止播放。Android 的媒体通知权限接口 `requestNotificationPermissionsAsync()` 只在 Android 可调用，其他平台调用会报错。

后台录音要在插件中启用 `enableBackgroundRecording`，运行时也要允许后台录音：

```ts
await setAudioModeAsync({
  playsInSilentMode: true,
  allowsRecording: true,
  allowsBackgroundRecording: true,
});
await recorder.prepareToRecordAsync();
recorder.record();
```

Android 后台录音会显示无法在录制中关闭的持续通知，停止后通知消失；iOS 则使用系统音频后台模式。后台录音耗电明显，应仅在确有需要时启用。

## 播放列表、预加载与实时采样

播放列表 Hook 同样随组件卸载释放资源。`loop` 可选 `'none'`（不循环）、`'single'`（循环当前曲目）、`'all'`（循环整个列表），支持混合本地资源和远端 URL：

```tsx
import { Button, Text, View } from 'react-native';
import { useAudioPlaylist, useAudioPlaylistStatus } from 'expo-audio';

function PlaylistExample() {
  const playlist = useAudioPlaylist({
    sources: [require('./assets/one.mp3'), 'https://example.com/two.mp3'],
    loop: 'all',
  });
  const status = useAudioPlaylistStatus(playlist);
  return (
    <View>
      <Text>曲目 {status.currentIndex + 1} / {status.trackCount} · {status.currentTime}s / {status.duration}s</Text>
      <Button title="上一首" onPress={() => playlist.previous()} />
      <Button title={playlist.playing ? '暂停' : '播放'} onPress={() => playlist.playing ? playlist.pause() : playlist.play()} />
      <Button title="下一首" onPress={() => playlist.next()} />
      <Button title="跳到第 2 首" onPress={() => playlist.skipTo(1)} />
    </View>
  );
}
```

`Audio.preload(source, options)` 可在模块作用域提前缓冲音频，之后传给 `useAudioPlayer` 等接口可减少首次播放等待；结束使用后用 `clearPreloadedSource(source)` 或 `clearAllPreloadedSources()` 释放预加载资源。iOS 在资源被播放器消费后会从预加载列表移除，Android / Web 需要显式清除。

```ts
import { preload } from 'expo-audio';

const opening = require('./assets/opening.mp3');
preload(opening);
preload('https://example.com/next.mp3', { preferredForwardBufferDuration: 20 });
```

`useAudioSampleListener(player, listener)` 可订阅播放器的 PCM 波形采样；Android 上需要麦克风 `RECORD_AUDIO` 权限，而且并非所有平台都支持采样。若要直接从麦克风获取实时 PCM，可用 `useAudioStream(options)` 创建流，授权后调用 `stream.start()` / `stream.stop()`。

```tsx
useAudioSampleListener(player, sample => {
  const leftChannelFrames = sample.channels[0]?.frames ?? [];
  updateWaveform(leftChannelFrames); // 帧值范围 -1 到 1，0 代表静音
});

const { stream } = useAudioStream({
  channels: 1,
  encoding: 'float32',
  sampleRate: 48000,
  onBuffer: buffer => processPcm(buffer.data),
});
await stream.start();
// 不再需要录入时：stream.stop();
```

## 全局 API 与类成员速查

| 接口 | 用途 |
| --- | --- |
| `useAudioPlayer(source?, options?)` / `useAudioPlayerStatus(player)` | 创建随组件生命周期管理的播放器；订阅进度与播放状态。 |
| `useAudioPlaylist(options?)` / `useAudioPlaylistStatus(playlist)` | 创建并订阅播放队列，支持添加 / 插入 / 删除 / 跳曲与循环。 |
| `useAudioRecorder(options, statusListener?)` / `useAudioRecorderState(recorder, interval?)` | 创建录音器、接收事件或轮询录音状态。 |
| `useAudioSampleListener(player, listener)` / `useAudioStream(options?)` | 播放中的 PCM 采样，或实时麦克风 PCM 流。 |
| `Audio.createAudioPlayer(source?, options?)` / `Audio.createAudioPlaylist(options?)` | 命令式创建实例，不会随组件卸载自动释放；需自行清理。优先用相应 Hook。 |
| `Audio.preload(source, options?)` / `getPreloadedSources()` | 预载音频并读取预载 URI。 |
| `clearPreloadedSource(source)` / `clearAllPreloadedSources()` | 释放单个或全部预载缓存。 |
| `getRecordingPermissionsAsync()` / `requestRecordingPermissionsAsync()` | 查询或请求麦克风权限；请求通知权限的接口仅适用于 Android。 |
| `setAudioModeAsync(mode)` / `setIsAudioActiveAsync(active)` | 更新全局会话策略，或关闭 / 打开整个音频子系统。设为 `false` 会暂停播放并阻止新音频播放。 |

`AudioPlayer` 可读写 `currentTime`、`volume`、`loop`、`muted`、`playbackRate`、`shouldCorrectPitch`，并读取 `duration`、`id`、`isAudioSamplingSupported`、`isBuffering`、`isLoaded`、`paused`、`playing`。方法包括 `play()`、`pause()`、`replace(source)`、`seekTo(seconds, toleranceMillisBefore?, toleranceMillisAfter?)`、`setPlaybackRate(rate, pitchCorrectionQuality?)`、`setActiveForLockScreen(active, metadata?, options?)`、`updateLockScreenMetadata(metadata)`、`clearLockScreenControls()` 和 `remove()`。

大多数界面用 Hook 管理播放器即可。只有需要播放器寿命超出当前组件时才直接创建；此时要负责停止并释放，避免原生播放器对象泄漏：

```ts
import { Audio } from 'expo-audio';

const player = Audio.createAudioPlayer(require('./assets/effect.mp3'));
player.play();
// 生命周期结束时：
player.pause();
player.remove();
```

查询麦克风权限不会弹窗；只有状态尚未授权时才调用请求方法。Android 通知权限接口只给锁屏 / 通知栏媒体控件使用：

```ts
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  requestNotificationPermissionsAsync,
} from 'expo-audio';

async function ensureMicrophoneAccess() {
  const current = await getRecordingPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await requestRecordingPermissionsAsync();
  return requested.granted;
}

async function askAndroidMediaNotificationAccess() {
  const result = await requestNotificationPermissionsAsync(); // Android only
  return result.granted;
}
```

`setIsAudioActiveAsync(false)` 可全局暂停并禁止开始新播放；App 回到前台时再设回 `true`：

```ts
import { setIsAudioActiveAsync } from 'expo-audio';

async function handleAppStateChange(nextState: string) {
  if (nextState === 'background') await setIsAudioActiveAsync(false);
  if (nextState === 'active') await setIsAudioActiveAsync(true);
}
```

`AudioPlaylist` 的属性为 `currentIndex`、`currentTime`、`duration`、`id`、`isBuffering`、`isLoaded`、`loop`、`muted`、`playbackRate`、`playing`、`sources`、`trackCount`、`volume`。方法为 `add(source)`、`insert(source, index)`、`remove(index)`、`clear()`、`destroy()`、`play()`、`pause()`、`next()`、`previous()`、`skipTo(index)` 和 `seekTo(seconds)`。

`AudioRecorder` 有 `currentTime`、`id`、`isRecording`、`uri` 属性；方法包括 `getAvailableInputs()`、`getCurrentInput()`、`getStatus()`、`pause()`、`prepareToRecordAsync(options?)`、`record(options?)`、`recordForDuration(seconds)`、`setInput(inputUid)`、`startRecordingAtTime(seconds)` 与 `stop()`。旧的 `recordForDuration()` / `startRecordingAtTime()` 被标为弃用；改用 `record({ forDuration })` / `record({ atTime })`。`AudioStream` 有 `channels`、`id`、`isStreaming`、`sampleRate`，并用 `start()` / `stop()` 控制采集。

## 类型与平台差异

- **来源与状态：**`AudioSource` 可为 `string | number | null`，也可为含 `assetId?`、`uri?`、`headers?`、`name?` 的对象；`assetId` 与 `uri` 不应同时指定。`AudioSourceInfo` 暴露可选 `name` / `uri`。`AudioStatus` 记录 `currentTime`、`duration`、`didJustFinish`、`error`、`id`、`isBuffering`、`isLive`、`isLoaded`、`loop`、`mute`、`playbackRate`、`playbackState`、`playing`、`reasonForWaitingToPlay`、`timeControlStatus`、`shouldCorrectPitch?`、iOS 的 `mediaServicesDidReset?`，以及 Android/iOS 的 `currentOffsetFromLive`。
- **播放器配置：**`AudioPlayerOptions` 含 Web 的 `crossOrigin?`、`downloadFirst?`、iOS 的 `keepAudioSessionActive?`、Android/iOS 的 `preferredForwardBufferDuration?`、`updateInterval?`。缓冲值越大通常越抗网络抖动，也越占内存 / 网络资源。旧 `AudioLoadOptions` 已弃用，等价于新配置类型。
- **锁屏 / 会话：**`AudioMetadata` 字段为 `title?`、`artist?`、`albumTitle?`、`artworkUrl?`；`AudioLockScreenOptions` 有 `isLiveStream?`、`showSeekBackward?`、`showSeekForward?`。`AudioMode` 有 `allowsBackgroundRecording?`、`allowsRecording?`、`interruptionMode?`、`interruptionModeAndroid?`（弃用）、`playsInSilentMode?`、`shouldPlayInBackground?`、`shouldRouteThroughEarpiece?`。`InterruptionMode` 可选 `'mixWithOthers'`、`'doNotMix'`、`'duckOthers'`；锁屏播放要求 `'doNotMix'`。旧 Android 专用中断类型只是别名并已弃用。
- **播放列表：**`AudioPlaylistLoopMode` 是 `'none' | 'single' | 'all'`；`AudioPlaylistOptions` 含 Web `crossOrigin?`、`loop?`、`sources?`、`updateInterval?`。`AudioPlaylistStatus` 包含当前序号 / 时间、曲目时长 / 总数、缓冲 / 加载 / 播放 / 循环 / 静音 / 倍速 / 音量状态与 `didJustFinish`。`AudioPlaylistEvents` 的事件是 `playlistStatusUpdate`、`trackChanged({ currentIndex, previousIndex })`。
- **PCM 流与采样：**`AudioSample` 含 `channels: AudioSampleChannel[]`、`timestamp`；每个 channel 有 `frames: number[]`（范围 -1 到 1）。`AudioEvents` 有 `audioSampleUpdate`、`playbackStatusUpdate`。`AudioStreamOptions` 有 `channels?`（默认单声道 1）、`encoding?`（`'float32' | 'int16'`，默认 float32）、`onBuffer?`、`sampleRate?`（请求值默认 48000Hz，实际硬件值可能不同）。`AudioStreamBuffer` 包含 PCM `data: ArrayBuffer`、声道数、实际采样率、时间戳；多声道数据交错排列。`AudioStreamResult` 为 `stream` 与 `isStreaming`，`AudioStreamStatus` 为 `isStreaming`。`AudioStreamEvents` 有 `audioStreamBuffer`。
- **录音状态 / 设备：**`RecorderState` 含 `canRecord`、`durationMillis`、`isRecording`、`mediaServicesDidReset`、`metering?`、`url`。`RecordingStatus` 含 `error`、`hasError`、`id`、`isFinished`、`url` 及 iOS `mediaServicesDidReset?`；一般使用状态 Hook。`RecordingInput` 有设备名 `name`、类型 `type`、唯一输入 ID `uid`。`RecordingDirectory` 可选 `'cache' | 'document'`；缓存可能被 OS 清理，document 目录更适合持久文件。
- **录音参数：**`RecordingOptions` 汇总平台的 `android` / `ios` / `web` 子选项及 `bitRate`、`directory?`、`extension`、`isMeteringEnabled?`、`numberOfChannels`、`sampleRate`。Android 子项：`audioEncoder`、`audioSource?`、`extension?`、`maxFileSize?`、`outputFormat`、`sampleRate?`。iOS 子项：`audioQuality`、`bitDepthHint?`、`bitRateStrategy?`、`extension?`、`linearPCMBitDepth?`、`linearPCMIsBigEndian?`、`linearPCMIsFloat?`、`outputFormat?`、`sampleRate?`。Web 子项：`bitsPerSecond?`、`mimeType?`。`RecordingStartOptions` 有 iOS 才生效的 `atTime?` 与各平台支持的 `forDuration?`；`RecordingSource` 可选 `camcorder`、`default`、`mic`、`remote_submix`、`unprocessed`、`voice_communication`、`voice_performance`、`voice_recognition`。
- **类型 / 枚举：**`AndroidAudioEncoder` 为 `default | amr_nb | amr_wb | aac | he_aac | aac_eld`；`AndroidOutputFormat` 为 `default | 3gp | mpeg4 | amrnb | amrwb | aac_adts | mpeg2ts | webm`。`BitRateStrategy` 可选 `constant | longTermAverage | variableConstrained | variable`；`PitchCorrectionQuality` 可选 `low | medium | high`（iOS）；`PermissionExpiration` 为 `'never' | number`；`PermissionResponse` 包含 `canAskAgain`、`expires`、`granted`、`status`，状态枚举为 `denied | granted | undetermined`。`RecordingEvents` 发出 `recordingStatusUpdate`。
- **质量与 iOS 容器格式：**`AudioQuality` 有 `MIN`、`LOW`、`MEDIUM`、`HIGH`、`MAX`（从最小文件 / 最低音质到最大文件 / 最高音质）。`IOSOutputFormat` 完整枚举：`MPEGLAYER1`、`MPEGLAYER2`、`MPEGLAYER3`、`MPEG4AAC`、`MPEG4AAC_ELD`、`MPEG4AAC_ELD_SBR`、`MPEG4AAC_ELD_V2`、`MPEG4AAC_HE`、`MPEG4AAC_LD`、`MPEG4AAC_HE_V2`、`MPEG4AAC_SPATIAL`、`AC3`、`AES3`、`APPLELOSSLESS`、`ALAW`、`AUDIBLE`、`60958AC3`、`MPEG4CELP`、`ENHANCEDAC3`、`MPEG4HVXC`、`ILBC`、`APPLEIMA4`、`LINEARPCM`、`MACE3`、`MACE6`、`AMR`、`AMR_WB`、`DVIINTELIMA`、`MICROSOFTGSM`、`QUALCOMM`、`QDESIGN2`、`QDESIGN`、`MPEG4TWINVQ`、`ULAW`。常用 AAC 格式可通过 `IOSOutputFormat.MPEG4AAC` 选择。

### 两种内置录音预设

`RecordingPresets.HIGH_QUALITY` 和 `LOW_QUALITY` 都是跨平台 `RecordingOptions`。以下保留源页给出的编码参数，方便按需覆盖后传给 `useAudioRecorder()`：

```ts
const HIGH_QUALITY = {
  extension: '.m4a', sampleRate: 44100, numberOfChannels: 2, bitRate: 128000,
  android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC, audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false,
  },
  web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
};

const LOW_QUALITY = {
  extension: '.m4a', sampleRate: 44100, numberOfChannels: 2, bitRate: 64000,
  android: { extension: '.3gp', outputFormat: '3gp', audioEncoder: 'amr_nb' },
  ios: {
    audioQuality: AudioQuality.MIN, outputFormat: IOSOutputFormat.MPEG4AAC,
    linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false,
  },
  web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
};
```

## 页面代码主题覆盖

本页把官方代码按行为重新组织为上面的示例，覆盖：四种包管理器安装命令；Config Plugin 和权限配置；本地音频播放、从头重播、远端 source / player 替换；录音授权、音频模式、开始 / 停止 / 状态回调 / 缓存与 document 保存；后台播放的 config plugin、锁屏元数据及手动 Android Manifest / iOS plist；后台录音的插件、手动原生配置与运行时 API；命令式创建播放器；高 / 低录音预设；Hook 创建本地或远端播放器、轮询状态、播放列表与列表状态、录音状态、波形监听和实时麦克风 PCM 流；倍速 / 音量 / 状态更新频率；预加载和缓冲；查询与请求录音权限、请求 Android 通知权限；切换全局音频开关。官方关于 Chrome WebM 时长元数据、浏览器 `MediaRecorder` 配置差异与麦克风安全来源的注意事项已在 Web 限制中概述。

## 给 React Web 开发者的术语

- **音频会话（audio session）：**设备范围的播放 / 录音策略，会决定与其他 App 混音、静音开关、耳机路由和后台行为。
- **音源（source）：**本地静态资源、远程 URL 或资源对象；静态 `require()` 让 Metro 在打包时找到音频文件。
- **播放状态 Hook：**将原生播放器变化订阅成 React 可读取的数据，避免自己维护播放时间与原生状态同步。
- **CORS / 安全上下文：**Web 麦克风要在 HTTPS 或浏览器认可的本地开发来源下授权；跨域音频与读取波形还受服务端 CORS 响应头影响。
- **采样率 / 位深 / 比特率：**采样率是每秒采集的音频点数；位深表示每个采样点精度；比特率影响压缩音频的大小和质量。平台支持格式不同，实际输出要按目标设备确认。

**来源：**[Expo Audio · Latest](https://docs.expo.dev/versions/latest/sdk/audio/) · [Expo Audio · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/audio/)

**翻页：**[上一页：Expo SDK Asset](./134-Expo-SDK-Asset.md) · [目录](./README.md) · [下一页：Expo SDK AuthSession](./136-Expo-SDK-AuthSession.md)
