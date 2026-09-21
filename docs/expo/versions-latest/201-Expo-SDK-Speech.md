# 201｜Expo SDK Speech 文本转语音

**翻页：**[上一页：Expo SDK SMS 发送短信](./200-Expo-SDK-SMS.md) · [目录](./README.md) · [下一页：Expo SDK SplashScreen 启动画面](./202-Expo-SDK-SplashScreen.md)

**官方页面：**[Speech · Latest](https://docs.expo.dev/versions/latest/sdk/speech/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/speech/)

**版本与平台：**Latest 推荐 `expo-speech ~57.0.3`，SDK v56.0.0 推荐 `~56.0.3`。Android、iOS、Web 均提供文本转语音；iOS 真机在静音模式下不会朗读。Web 语音能力取决于浏览器可用的系统语音。

## 让系统朗读一段文字

`expo-speech` 调用设备的 Text-to-Speech（TTS，文本转语音）能力。它把文字交给系统语音引擎朗读；这是系统播放，不代表 app 正在录制或识别用户语音。

安装（任选一个包管理器）：

```sh
npx expo install expo-speech
yarn expo install expo-speech
pnpm expo install expo-speech
bun expo install expo-speech
```

没有使用 Expo 的 React Native 工程还需要先安装 `expo`。

官方基础流程是用户按下按钮后调用 `Speech.speak()`：

```tsx
import { Button, StyleSheet, View } from 'react-native';
import * as Speech from 'expo-speech';

export default function SpeakButton() {
  function speak() {
    Speech.speak('你好，欢迎使用这个应用。', {
      language: 'zh-CN',
      rate: 1,
      pitch: 1,
    });
  }

  return (
    <View style={styles.container}>
      <Button title="朗读欢迎语" onPress={speak} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
```

`Speech.speak(text, options?)` 返回 `void`，会把朗读任务放进语音队列。再次调用会追加 utterance；如需立即停止当前任务并清空队列，使用 `Speech.stop()`。

## 选择语音并观察朗读状态

设备可用的 voice 名称、语言和 quality 会随操作系统变化。调用 `getAvailableVoicesAsync()` 取得实际清单，再把选中的 `identifier` 传给 `voice`：

```tsx
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as Speech from 'expo-speech';

export default function VoiceStatus() {
  const [voice, setVoice] = useState<Speech.Voice | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let active = true;
    Speech.getAvailableVoicesAsync().then(voices => {
      if (active) setVoice(voices.find(item => item.language.startsWith('zh')) ?? null);
    });
    return () => { active = false; };
  }, []);

  async function speak() {
    Speech.speak('正在使用设备提供的中文语音。', {
      voice: voice?.identifier,
      onStart: () => setSpeaking(true),
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  return (
    <View>
      <Text>{speaking ? '正在朗读' : '语音已停止'}</Text>
      <Button title="试听" onPress={speak} />
    </View>
  );
}
```

`isSpeakingAsync()` 查询当前是否正朗读；语音暂停时也可能返回 `true`。在 iOS 和 Web 上，`pause()` 暂停当前语音，`resume()` 接着读；Android 不提供这两种方法。`onDone`、`onStopped`、`onError` 等回调适合更新界面状态。

## 方法、选项与返回类型

导入命名空间：

```ts
import * as Speech from 'expo-speech';
```

| API | 平台 / 返回 | 作用 |
| --- | --- | --- |
| `Speech.maxSpeechInputLength` | Android / iOS / Web；`number` | 当前平台 `speak()` 可接受的最大文本长度；iOS 为 `Number.MAX_VALUE`。 |
| `Speech.getAvailableVoicesAsync()` | 全平台；`Promise<Voice[]>` | 读取当前设备可用语音清单。 |
| `Speech.isSpeakingAsync()` | 全平台；`Promise<boolean>` | 查询是否在朗读；暂停状态也可能仍为 `true`。 |
| `Speech.pause()` | iOS / Web；`Promise<void>` | 暂停当前朗读；Android 不支持。 |
| `Speech.resume()` | iOS / Web；`Promise<void>` | 恢复已暂停的朗读；Android 不支持。 |
| `Speech.speak(text, options?)` | 全平台；`void` | 启动或排队朗读任务。 |
| `Speech.stop()` | 全平台；`Promise<void>` | 中断当前朗读并清空待读队列。 |

### `SpeechOptions`

| 选项 | 类型 | 说明 / 平台 |
| --- | --- | --- |
| `_voiceIndex` | `number`（可选） | 旧版语音索引选项；优先按 `voice` identifier 选择。 |
| `language` | `string`（可选） | BCP 47 语言标签，例如 `zh-CN`。 |
| `voice` | `string`（可选） | 从 `Voice.identifier` 取得的语音 ID。 |
| `rate` / `pitch` | `number`（可选） | 语速 / 音高；`1.0` 为系统正常值。 |
| `volume` | `number`（可选，默认 `1.0`） | 音量范围 `0.0` 至 `1.0`。 |
| `onStart` / `onDone` | `() => void` 或 Web speech event callback | 开始 / 完成朗读时触发。 |
| `onStopped` | `() => void` 或 Web speech event callback | 通过 `Speech.stop()` 停止时触发。 |
| `onError` | `(error: Error) => void` 或 Web speech event callback | Android / iOS 朗读失败时触发。 |
| `onBoundary` / `onMark` / `onPause` / `onResume` | `SpeechEventCallback`（部分可为 `null`） | 词边界、自定义 mark、暂停和恢复事件；具体事件支持随平台而异。 |
| `useApplicationAudioSession` | `boolean`（可选） | iOS 专属；`false` 时由系统使用独立 audio session 管理打断与混音。 |

### 可用语音类型

| 类型 | 字段 |
| --- | --- |
| `Voice` | `identifier`、`language`、`name`、`quality`。 |
| `WebVoice` | 扩展 `Voice`，另含 `isDefault`、`localService`、`voiceURI`。 |
| `VoiceQuality` | `Default`、`Enhanced`。 |
| `SpeechEventCallback` | Web speech callback；接收 `SpeechSynthesisUtterance` 与 `SpeechSynthesisEvent`。 |

## 平台注意事项与新手术语

- iOS 真机在静音开关打开时不会从 `expo-speech` 输出声音；测试时检查设备静音状态。
- Android 不实现 `pause()` / `resume()`，跨平台 UI 应根据平台隐藏或禁用对应控制项。
- **TTS（Text-to-Speech）：**把文字合成为语音并播放的系统能力。
- **Voice（语音）：**操作系统提供的语言 / 声音配置；应用只能选择设备实际列出的 voice。
- **Utterance（朗读任务）：**一次要朗读的文字及其语言、语速、事件回调等配置。
- **BCP 47：**语言标签标准；如 `zh-CN` 表示中文（中国大陆），用于提示系统选择合适语音。
- **Audio session：**iOS 对播放、其它音频、静音和系统中断进行协调的一组运行规则。

## 源页代码主题覆盖

- Installation：覆盖 npx、Yarn、pnpm、Bun 安装命令。
- Usage：重写官方按钮调用 `Speech.speak()` 的完整示例，并加入可用 voice 查询与 `SpeechOptions` 回调示例。
- API：列出可用语音查询、是否正在朗读、暂停 / 恢复、朗读、停止和最大输入长度；注明 Android 不支持 pause / resume。
- Types：覆盖 `SpeechOptions` 回调与语音配置、`Voice` / `WebVoice` 字段、`SpeechEventCallback` 和 `VoiceQuality` 枚举。
- Latest 与 SDK v56 内容 / Next 一致；推荐包版本分别为 `~57.0.3` / `~56.0.3`。

**翻页：**[上一页：Expo SDK SMS 发送短信](./200-Expo-SDK-SMS.md) · [目录](./README.md) · [下一页：Expo SDK SplashScreen 启动画面](./202-Expo-SDK-SplashScreen.md)
