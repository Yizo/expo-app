# Expo Audio（`expo-audio`）学习指南

> 原文更新时间：2026 年 6 月 8 日  
> 文档版本：下一版本 Expo SDK 的未发布文档。当前稳定版本为 SDK 56，实际项目应核对稳定版文档。  
> 支持平台：Android、iOS、tvOS、Web、Expo Go

## 文档解决的问题

`expo-audio` 是 Expo 提供的跨平台音频库，用于访问设备的原生音频能力，主要覆盖：

- 播放单个音频；
- 管理无缝播放列表；
- 使用麦克风录音；
- 在后台播放或录音；
- 在锁屏和 Android 通知栏提供媒体控制；
- 获取实时播放、录音状态；
- 获取音频波形或实时 PCM 麦克风数据；
- 预加载音频，降低首次播放延迟。

对于 React Web 开发者，可以把它理解为 React Native 环境中的“音频播放器、MediaRecorder 和设备音频会话管理”的统一封装。但它不只是 `<audio>`：在移动端还必须处理系统权限、后台服务、锁屏控制、音频焦点和原生工程配置。

## 适用场景

适合：

- 提示音、音效和语音播放；
- 音乐、播客、有声内容播放器；
- 多曲目播放列表；
- 语音留言、采访、会议或创作类录音；
- 锁屏后继续播放或录音；
- 波形可视化和音频分析；
- 获取实时 PCM 数据，用于音频处理。

当前文档未涉及：

- 音频编辑、裁剪、拼接或格式转换；
- 将录音上传到服务器的完整流程；
- DRM 音频；
- 通话、VoIP 信令或实时网络传输；
- 完整的音频转写和语音识别方案。

## 阅读前需要理解的概念

### Expo、React Native 与原生配置

React Web 通常只需修改 JavaScript、CSS 和服务器配置。React Native 的 JavaScript 最终会调用 Android/iOS 原生模块，因此部分功能必须写入应用安装包中的原生配置。

`expo-audio` 的配置分为两层：

1. **构建期配置**：写在 `app.json` 等 Expo app config 中，通过 config plugin 修改 Android/iOS 原生工程，修改后必须重新构建应用。
2. **运行时配置**：通过 `setAudioModeAsync()` 设置当前应用如何播放、录音以及与其他应用的音频交互。

仅设置其中一层，通常不足以启用后台播放或后台录音。

### CNG 与 config plugin

Continuous Native Generation（CNG）表示由 Expo 根据 app config 生成和维护原生工程。使用 CNG 时，可以通过 `expo-audio` 的 config plugin 自动配置权限、后台模式和原生服务。

如果项目直接维护 `android/` 和 `ios/` 目录，不使用 CNG，则必须手动编辑：

- Android：`android/app/src/main/AndroidManifest.xml`
- iOS：`ios/YourApp/Info.plist`

### 音频会话和音频焦点

移动系统会协调多个应用的音频。例如，播放音乐时收到电话，或者打开另一个播放器时，系统需要决定哪些声音暂停、降低音量或同时播放。

`setAudioModeAsync()` 用于设置这种全局行为。它更接近“应用级音频策略”，不是某个播放器实例的局部属性。

## 安装

```sh
# npm
npx expo install expo-audio

# yarn
yarn expo install expo-audio

# pnpm
pnpm expo install expo-audio

# bun
bun expo install expo-audio
```

应优先使用 `expo install`，因为它会选择与当前 Expo SDK 兼容的包版本。

如果是已有的普通 React Native 项目，还必须先安装并配置 Expo Modules 所需的 `expo` 包。

## 构建期配置

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone.",
          "enableBackgroundPlayback": true,
          "enableBackgroundRecording": false
        }
      ]
    ]
  }
}
```

| 配置项 | 默认值 | 平台与作用 |
| --- | --- | --- |
| `microphonePermission` | `"Allow $(PRODUCT_NAME) to access your microphone"` | 仅 iOS。设置系统麦克风权限弹窗中的用途说明；设为 `false` 会禁用该权限配置。 |
| `recordAudioAndroid` | `true` | 仅 Android。决定是否加入 `RECORD_AUDIO` 权限。 |
| `enableBackgroundRecording` | `false` | 启用后台录音。Android 会增加前台服务、权限和常驻通知；iOS 会加入 `audio` 后台模式。 |
| `enableBackgroundPlayback` | `true` | 启用后台播放。Android 会增加媒体播放前台服务，并支持锁屏控制；iOS 会加入 `audio` 后台模式。 |

这些选项不能依靠运行时代码完成，变更后需要生成并安装新的应用二进制文件。

## 播放单个音频

```tsx
import { Button } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

const source = require('./assets/hello.mp3');

export default function Player() {
  const player = useAudioPlayer(source);

  return (
    <>
      <Button title="播放" onPress={() => player.play()} />
      <Button
        title="从头播放"
        onPress={async () => {
          await player.seekTo(0);
          player.play();
        }}
      />
    </>
  );
}
```

`useAudioPlayer()` 会立即开始加载音频，并在组件卸载时自动释放播放器。它类似 React Hook 管理的外部资源，而不是普通 React state。

音频源支持：

- `require('./audio.mp3')` 引入的本地资源；
- HTTP/HTTPS URL；
- 本地文件 URI；
- 带 `uri`、`headers`、`name` 的对象；
- `null`，表示暂不加载。

### 播放状态

```tsx
const player = useAudioPlayer(source);
const status = useAudioPlayerStatus(player);
```

`status` 可用于进度条、加载提示和播放按钮，包含：

- `currentTime`、`duration`；
- `playing`、`isLoaded`、`isBuffering`；
- `didJustFinish`；
- `error`；
- `isLive`、`currentOffsetFromLive`；
- `playbackRate`、`playbackState`；
- `reasonForWaitingToPlay`。

播放器自身也暴露 `playing`、`paused`、`volume`、`loop`、`muted`、`currentTime` 等属性，但需要界面实时响应变化时，应使用 `useAudioPlayerStatus()` 订阅状态。

### 常用播放器操作

| API | 作用 |
| --- | --- |
| `play()` / `pause()` | 播放或暂停。 |
| `seekTo(seconds)` | 跳转到指定秒数；额外的容差参数仅对 iOS 有效。 |
| `replace(source)` | 替换当前音源。 |
| `volume = 0...1` | 设置音量。 |
| `loop = true/false` | 设置单曲循环。 |
| `setPlaybackRate(rate, quality?)` | 调整倍速，可选音高修正质量。 |
| `remove()` | 从内存中移除并释放资源。 |

倍速范围并不完全一致：

- Android：`0.1`～`2.0`；
- iOS：`0.0`～`2.0`；
- Web：取决于浏览器。

`shouldCorrectPitch` 控制变速时是否修正音高；`PitchCorrectionQuality` 的 `low`、`medium`、`high` 仅适用于 iOS。

## 播放列表

```tsx
const playlist = useAudioPlaylist({
  sources: [
    require('./track1.mp3'),
    require('./track2.mp3'),
    'https://example.com/track3.mp3',
  ],
  loop: 'all',
});

const status = useAudioPlaylistStatus(playlist);
```

`AudioPlaylist` 管理多个音源，并支持无缝播放。核心操作包括：

- `play()`、`pause()`；
- `next()`、`previous()`、`skipTo(index)`；
- `seekTo(seconds)`；
- `add(source)`、`insert(source, index)`；
- `remove(index)`、`clear()`；
- `destroy()` 释放资源。

循环模式：

| 模式 | 行为 |
| --- | --- |
| `none` | 播放到最后一首后停止。 |
| `single` | 无限循环当前曲目。 |
| `all` | 播放到末尾后回到第一首。 |

`currentIndex` 是从 `0` 开始的数组索引。UI 显示“第几首”时通常需要加 `1`。

## 录音流程

录音至少包含四个步骤：

1. 请求麦克风权限；
2. 配置音频模式；
3. 准备录音器；
4. 开始并最终停止录音。

```tsx
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
const state = useAudioRecorderState(recorder);

const initialize = async () => {
  const permission = await AudioModule.requestRecordingPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  await setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: true,
  });
};

const start = async () => {
  await recorder.prepareToRecordAsync();
  recorder.record();
};

const stop = async () => {
  await recorder.stop();
  console.log(recorder.uri);
};
```

`prepareToRecordAsync()` 不是可省略的初始化细节：部分输入设备查询也只有准备完成后才能执行。

录音状态可通过两种方式获得：

- 向 `useAudioRecorder()` 传入 `statusListener`；
- 使用 `useAudioRecorderState(recorder, interval)` 定期轮询，默认每 500ms 一次。

通常界面展示录音时长和录音状态时使用后者。状态包含 `isRecording`、`canRecord`、`durationMillis`、`metering` 和输出文件 URL。

### 录音文件保存位置

Android 和 iOS 默认把录音保存到应用缓存目录。设备存储不足时，系统可能删除缓存文件。

需要持久保留新录音时：

```tsx
const recorder = useAudioRecorder({
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document',
});
```

目录含义：

- `cache`：临时缓存，可能被系统删除；
- `document`：应用文档目录，不会作为系统缓存被自动清理。

已存在于缓存中的录音，需要使用录音 URI 配合 `expo-file-system` 移动到持久位置。

### 录音预设

`RecordingPresets.HIGH_QUALITY` 的主要配置：

- 44.1kHz；
- 双声道；
- 128kbps；
- Android 使用 MPEG-4/AAC；
- iOS 使用 MPEG-4 AAC 和最高质量；
- Web 使用 `audio/webm`。

`LOW_QUALITY` 主要降低到 64kbps；Android 使用 3GP/AMR-NB。Web 预设仍为 `audio/webm`、128kbps，因此“低质量”并不代表每个平台都采用同样的参数。

自定义录音时可以配置：

- `sampleRate`：采样率；
- `numberOfChannels`：声道数；
- `bitRate`：目标码率；
- `extension`：扩展名；
- `isMeteringEnabled`：是否提供当前音量值；
- Android 的编码器、容器格式和音频来源；
- iOS 的质量、PCM 位深、字节序和格式；
- Web 的 MIME 类型与每秒比特数。

格式、编码器、扩展名必须合理匹配。文档提供可配置项，但没有保证任意组合都受设备支持。

### 定时录音

推荐使用：

```tsx
recorder.record({ forDuration: 30 });
recorder.record({ atTime: 2 });
```

- `forDuration`：指定若干秒后自动停止；
- `atTime`：仅 iOS 支持精确定时开始，Android 和 Web 会忽略并立即开始。

`recordForDuration()` 和 `startRecordingAtTime()` 已废弃，应改用 `record()` 的选项。

### 选择录音输入设备

准备录音器后，可以：

```tsx
const inputs = await recorder.getAvailableInputs();
const current = await recorder.getCurrentInput();
recorder.setInput(inputs[0].uid);
```

输入可能是内置麦克风或外接麦克风。`getAvailableInputs()` 和 `getCurrentInput()` 只能在完成准备后调用。

## 后台播放

后台播放表示应用进入后台或锁屏后仍继续播放。

### 构建期配置

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "enableBackgroundPlayback": true
        }
      ]
    ]
  }
}
```

该配置会自动：

- Android：添加 `FOREGROUND_SERVICE`、`FOREGROUND_SERVICE_MEDIA_PLAYBACK` 权限，并在 `AndroidManifest.xml` 注册 `AudioControlsService`；
- iOS：在 `UIBackgroundModes` 中加入 `audio`。

### 运行时配置

```tsx
await setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'doNotMix',
});

player.setActiveForLockScreen(true, {
  title: '标题',
  artist: '艺术家',
  albumTitle: '专辑',
  artworkUrl: 'https://example.com/cover.jpg',
});

player.play();
```

Android 上，为了持续后台播放，必须调用 `setActiveForLockScreen()`。否则受系统限制，音频进入后台约三分钟后会停止。

启用后，Android 会：

- 展示带播放控制的媒体通知；
- 使用前台服务维持播放；
- 允许从通知栏和锁屏控制播放器。

iOS 只要正确配置构建期后台模式，并设置 `shouldPlayInBackground: true`，即可继续播放。锁屏控制不是持续播放的必要条件，但能改善体验。

同一时间只有一个播放器能成为锁屏活动播放器。结束播放后可以调用：

```tsx
player.setActiveForLockScreen(false);
// 或
player.clearLockScreenControls();
```

只有活动播放器调用 `updateLockScreenMetadata()` 才会更新锁屏信息。直播可设置 `isLiveStream: true`，系统将隐藏时长、进度条和跳转控制。

锁屏控制要求 `interruptionMode: 'doNotMix'`，否则操作系统可能无法把锁屏控制与播放器正确关联。

### 非 CNG 项目

Android 需要在 `AndroidManifest.xml` 中手动加入前台服务权限并注册：

```xml
<service
  android:name="expo.modules.audio.service.AudioControlsService"
  android:exported="false"
  android:foregroundServiceType="mediaPlayback">
  <intent-filter>
    <action android:name="androidx.media3.session.MediaSessionService" />
  </intent-filter>
</service>
```

iOS 需要在 `Info.plist` 中加入：

```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

## 后台录音

后台录音会显著增加耗电，只应在产品功能确实需要时启用。

### 构建期配置

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to record audio.",
          "enableBackgroundRecording": true
        }
      ]
    ]
  }
}
```

自动配置内容：

- Android：增加前台服务、麦克风前台服务和通知权限，并注册录音服务；
- iOS：加入 `audio` 后台模式。

非 CNG 项目需手动配置 Android 的 `FOREGROUND_SERVICE_MICROPHONE`、`POST_NOTIFICATIONS`，以及 iOS 的 `UIBackgroundModes: audio`。文档示例只列出这一节特有的权限，仍需结合正常录音和前台服务所需配置理解。

### 运行时配置

```tsx
await setAudioModeAsync({
  playsInSilentMode: true,
  allowsRecording: true,
  allowsBackgroundRecording: true,
});
```

完成配置后，仍要正常执行 `prepareToRecordAsync()` 和 `record()`。

平台表现：

- Android 必须运行前台服务，会显示不可手动关闭的常驻“Recording audio”通知和停止按钮；录音停止后通知自动消失。
- iOS 在后台或锁屏时继续录音，除系统状态栏外，应用不会额外展示通知。

## 全局音频模式

`setAudioModeAsync()` 接收部分配置，只更新传入字段。

| 属性 | 含义 |
| --- | --- |
| `allowsRecording` | 允许录音；文档标记为 iOS 音频会话属性。 |
| `allowsBackgroundRecording` | Android/iOS 后台继续录音，默认 `false`。 |
| `playsInSilentMode` | 静音模式下是否播放，默认 `true`。 |
| `shouldPlayInBackground` | 应用进入后台后维持音频会话，默认 `false`。 |
| `shouldRouteThroughEarpiece` | 是否走听筒；iOS 仅在允许录音时生效，默认走扬声器。 |
| `interruptionMode` | 与其他应用音频之间的竞争或混合策略。 |

`interruptionMode` 有三种：

- `doNotMix`：申请独占音频焦点，其他应用暂停；
- `duckOthers`：其他应用继续播放，但降低音量；
- `mixWithOthers`：与其他应用同时播放。

Android 使用 `mixWithOthers` 时不会请求音频焦点，因此电话等场景下也不会收到音频焦点丢失回调。它更适合短音效和 UI 反馈，不适合需要严谨处理中断的长音频播放器。

`interruptionModeAndroid` 已废弃，应统一使用跨平台的 `interruptionMode`。

还可以通过以下方法全局关闭音频：

```tsx
await setIsAudioActiveAsync(false);
```

关闭后会暂停所有播放，并阻止新的音频开始播放。重新传入 `true` 才会恢复音频子系统。

## 音频预加载

```tsx
import { preload, useAudioPlayer } from 'expo-audio';

const source = 'https://example.com/track.mp3';

preload(source);

export default function App() {
  const player = useAudioPlayer(source);
  // ...
}
```

`preload()` 应在模块作用域、React 组件渲染前调用。之后相同音源用于 `useAudioPlayer()`、`createAudioPlayer()` 或 `replace()` 时，可显著降低开始播放的等待时间。

缓存管理 API：

- `getPreloadedSources()`：查看已预加载的 URI；
- `clearPreloadedSource(source)`：释放单个预加载源；
- `clearAllPreloadedSources()`：释放全部预加载源。

平台差异：

- iOS：预加载源被播放器消费后，会从预加载列表移除；
- Android/Web：会继续保留，直到显式清理。

`preferredForwardBufferDuration` 越大，播放稳定性通常越高，但会使用更多内存和网络流量。Web 由浏览器管理缓冲，该选项不适用。

## `downloadFirst` 与播放缓冲

```tsx
const player = useAudioPlayer(source, {
  downloadFirst: true,
  updateInterval: 1000,
});
```

`downloadFirst: true` 表示先下载完整资源，再交给播放器加载：

- 能减少播放中缓冲；
- 会增加首次等待时间；
- Android/iOS 下载到临时目录，系统可自行清理；
- Web 下载到内存，刷新或内存压力下可能被清理；
- Web 服务器必须正确返回 CORS 响应头。

`updateInterval` 控制状态更新频率，默认 500ms。频率越高，进度条越流畅，但 JS 更新和渲染开销也越大。

## 波形采样与实时 PCM 流

### 对正在播放的音频采样

```tsx
useAudioSampleListener(player, sample => {
  const frames = sample.channels[0].frames;
});
```

每个 `AudioSample` 包含：

- `timestamp`：相对于音轨的秒数；
- `channels`：声道数组；
- `frames`：归一化到 `-1.0`～`1.0` 的 PCM 数据。

适合播放波形、频谱分析或可视化。Android 上即使采样对象是正在播放的音频，也需要 `RECORD_AUDIO` 权限；同时该能力并非所有平台都支持，应先检查 `player.isAudioSamplingSupported`。

### 实时采集麦克风 PCM

`useAudioStream()` 面向需要直接处理麦克风原始 PCM 缓冲区的场景：

```tsx
const { stream, isStreaming } = useAudioStream({
  sampleRate: 48000,
  channels: 1,
  encoding: 'float32',
  onBuffer(buffer) {
    // 处理 buffer.data
  },
});

await stream.start();
stream.stop();
```

开始前必须请求麦克风权限。

选项包括：

- `sampleRate`：期望采样率，默认 48000Hz；
- `channels`：1 为单声道，2 为立体声，默认 1；
- `encoding`：`float32` 或 `int16`；
- `onBuffer`：收到新 PCM 数据时调用。

实际采样率和声道数可能因硬件能力而不同，应读取启动后的 `stream.sampleRate` 和 `stream.channels`，不能假定设备一定接受请求值。

多声道数据是交错排列的，例如立体声为 `[L, R, L, R, ...]`。

## 权限处理

权限相关 API：

```tsx
const current = await getRecordingPermissionsAsync();

if (!current.granted) {
  const requested = await requestRecordingPermissionsAsync();
}
```

`PermissionResponse` 包含：

- `status`：`undetermined`、`granted` 或 `denied`；
- `granted`：是否已授权；
- `canAskAgain`：能否再次弹出系统授权请求；
- `expires`：当前文档说明权限均永久有效。

当 `canAskAgain` 为 `false` 时，继续调用请求方法通常不能解决问题，应引导用户前往系统设置。

`requestNotificationPermissionsAsync()` 仅用于 Android 通知权限，其他平台调用会抛出异常。媒体通知和后台录音通知是否能正常展示，需要结合 Android 系统版本及该权限处理。

## 直接创建播放器或播放列表

大多数 React 组件内应使用：

- `useAudioPlayer()`；
- `useAudioPlaylist()`；
- `useAudioRecorder()`。

这些 Hook 会将原生资源生命周期绑定到组件卸载。

需要资源跨组件持续存在时，可以使用：

```tsx
const player = createAudioPlayer(source);
const playlist = createAudioPlaylist(options);
```

这类实例不会自动释放。播放器不再使用时必须调用 `release()`；播放列表需调用 `destroy()`。否则可能产生内存和原生资源泄漏。

对 React Web 开发者而言，这类似手动创建 Web Audio 节点、订阅器或 Worker：React 不会自动替你清理组件外创建的对象。

## Web 平台限制

虽然 `expo-audio` 支持 Web，但底层仍受浏览器 API 限制：

1. Chrome 的 `MediaRecorder` 可能生成缺失时长元数据的 WebM 文件。
2. 不同浏览器的编码格式和配置支持不一致。
3. 可考虑使用 `opus-media-recorder` 或 `audio-recorder-polyfill` 改善一致性。
4. `prepareToRecordAsync()` 的 Web 配置会直接传给 `MediaRecorder` 或对应 polyfill。
5. 浏览器只允许安全上下文访问麦克风，生产环境通常必须使用 HTTPS。
6. 远程音源、自定义请求头、`downloadFirst` 和音频数据访问都可能受到 CORS 限制。
7. 设置 `crossOrigin: 'anonymous'` 后，如果 CDN 未正确配置 CORS，原本可播放的音频反而可能加载失败。

这与 React Web 项目中的浏览器媒体限制一致：库可以统一接口，但不能绕过浏览器安全模型。

## 平台格式与编码差异

Android 播放格式取决于 Android Media3/ExoPlayer 支持范围；Apple 平台格式取决于系统 Core Audio 支持范围。

Android 录音可选择：

- 容器：3GP、MPEG-4、AAC ADTS、MPEG-TS、WebM 等；
- 编码器：AAC、HE-AAC、AMR-NB、AMR-WB 等；
- 输入来源：普通麦克风、语音通信、语音识别、低处理原始声音、低延迟演出等。

iOS 提供更细粒度的格式和质量控制，包括 AAC、Apple Lossless、Linear PCM、AMR 等，以及 PCM 位深、大小端和浮点格式设置。

**文档明确说明：**可配置项存在平台差异。  
**基于文档内容推导：**如果产品要求 Android、iOS 和 Web 生成完全相同的文件格式，应先在目标设备上验证，不能只根据统一 TypeScript API 假设输出一致。

## 最容易踩坑的地方

### 构建配置和运行时配置不是一回事

后台播放、后台录音需要同时满足：

- app config 或原生工程中的构建期配置；
- `setAudioModeAsync()` 的运行时设置；
- Android 后台播放还需要锁屏控制；
- 权限已经获得。

只修改 JavaScript 无法补上安装包中缺失的原生权限和服务声明。

### 耳机或蓝牙设备断开会自动停止音频

文档明确说明：耳机或蓝牙音频设备断开时，音频会自动停止。业务状态不能假定播放会自动继续，应通过状态更新同步 UI。

### 缓存目录不是永久存储

录音成功且拿到 URI，不代表文件会永久存在。重要录音应直接使用 `document` 目录，或及时通过 `expo-file-system` 转移。

### Android 后台播放必须激活锁屏控制

仅设置 `shouldPlayInBackground: true` 不够。没有 `setActiveForLockScreen()` 时，Android 后台播放大约三分钟后会停止。

### 资源需要释放

Hook 创建的对象会自动清理；组件外手动创建的对象不会。选择创建方式实际上是在选择资源所有权。

### API 标注“全平台”不代表行为完全相同

例如：

- 倍速范围不同；
- `atTime` 仅 iOS 真正生效；
- 缓冲由 Web 浏览器自行管理；
- 通知权限方法只允许在 Android 调用；
- 后台服务和用户可见通知仅是 Android 机制；
- Web 编码格式受浏览器实现影响。

## React Web 开发者需要特别注意

1. React Native 没有浏览器 DOM。示例使用的是 `View`、`Button`、`StyleSheet`，而不是 `<div>` 和 `<button>`。
2. `require('./audio.mp3')` 返回的是原生资源标识，不一定是 Web 中熟悉的 URL 字符串。
3. 麦克风权限不仅是一次 API 调用，还涉及构建期用途描述和原生权限声明。
4. 后台运行不是浏览器标签页后台执行的概念。Android 通常要求前台服务和常驻通知；iOS 要声明后台能力。
5. 播放器和录音器持有原生资源，应关注创建、组件卸载和释放。
6. `setAudioModeAsync()` 修改的是应用级音频行为，多页面分别设置时可能相互影响。
7. 状态更新不是读取对象属性就会自动触发 React 渲染；需要使用状态 Hook 或监听器。

## 实际开发建议

以下为**基于经验建议**：

- 在应用启动或音频功能入口集中设置音频模式，避免多个页面互相覆盖全局策略。
- 普通组件优先使用 Hook，只有明确需要跨组件持久播放时才手动创建实例。
- 录音开始按钮应根据权限、`canRecord` 和准备结果决定是否可用。
- 对播放器至少处理加载中、缓冲中、播放失败和播放完成四类状态。
- 对 Android 后台功能，应在真机上测试锁屏、切后台、来电、耳机断开和通知权限被拒绝等场景。
- 对重要录音直接选择 `document`，并另外设计上传、清理和失败恢复策略。
- 上线前分别验证 Android、iOS 和目标浏览器的格式可播放性，不要仅在开发机浏览器中测试。
- 波形和 PCM 回调频率可能很高，不要在每个缓冲回调中直接触发昂贵的 React 渲染。
- 调整 `updateInterval` 和缓冲时长时，应同时评估界面流畅度、耗电、内存和网络消耗。

## 明确内容与推导内容

### 文档明确说明

- `expo-audio` 支持播放、录音、播放列表、预加载、采样和 PCM 流；
- Android 持续后台播放必须启用锁屏控制；
- 后台录音会显著影响电池续航；
- Android 后台录音会显示不可关闭的常驻通知；
- 默认录音目录是可能被系统清理的缓存目录；
- 手动创建的播放器必须自行释放；
- Web 录音存在格式、元数据、安全上下文和浏览器兼容问题；
- 耳机或蓝牙音频设备断开后，音频会自动停止。

### 基于文档内容推导

- 音频模块应被视为带原生资源和全局系统状态的功能，而不只是一个 React UI 组件；
- 后台能力的验收必须使用重新构建后的真机应用，单纯刷新 JavaScript 无法验证所有配置；
- 跨平台录音输出格式不能只依赖扩展名判断，应结合编码器、容器和实际设备测试；
- 重要音频文件需要独立的持久化和生命周期管理策略；
- 多页面音频应用应明确谁负责设置全局音频模式以及谁拥有播放器实例。

## 总结

`expo-audio` 为 Expo 和 React Native 应用提供了统一的跨平台音频接口。基础播放代码很简单，但真正影响应用可靠性的部分是权限、音频会话、后台服务、锁屏控制、文件存储和资源释放。

普通播放优先使用 `useAudioPlayer()`，多曲目使用 `useAudioPlaylist()`，录音使用 `useAudioRecorder()` 并先处理权限和音频模式。后台播放或录音则必须同时完成构建期原生配置和运行时配置，并特别处理 Android 的前台服务、通知和锁屏控制要求。

---

## 文档导航

- **上一页**：[asset](./142__asset.md)
- **下一页**：[auth session](./144__auth-session.md)
