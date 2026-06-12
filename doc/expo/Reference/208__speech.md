# Expo Speech：在 Expo 应用中实现文本转语音

`expo-speech` 是 Expo 提供的文本转语音（Text-to-Speech，TTS）库，可以让 Android、iOS 和 Web 设备朗读指定文本，并提供语音选择、语速调整、状态监听和停止播放等能力。

> 本文基于下一版本 Expo SDK 的未发布文档整理。原文指出，截至文档修改日期 2026 年 1 月 15 日，稳定版参考文档对应 SDK 56。

## 文档解决的问题

这篇文档主要说明：

- 如何安装和导入 `expo-speech`
- 如何让设备朗读一段文本
- 如何获取设备可用的语音列表
- 如何判断、暂停、恢复或停止朗读
- 如何配置语言、声音、音调、语速和音量
- 如何监听朗读开始、结束、停止和错误等事件
- Android、iOS 和 Web 之间有哪些能力差异

它适合需要实现以下功能的应用：

- 文章或消息朗读
- 无障碍辅助阅读
- 单词发音和语言学习
- 导航或操作提示
- 无需用户持续查看屏幕的语音通知

`expo-speech` 负责的是“把文字转换为声音”，不负责语音识别，也不会把用户说的话转换成文字。

## 阅读前需要理解的背景

### Expo 与 React Native

React Native 使用 React 的组件和状态管理方式开发移动应用，但界面最终由原生控件渲染，而不是浏览器 DOM。

Expo 是围绕 React Native 提供的一套开发工具和原生能力封装。`expo-speech` 就是其中一个 Expo 模块，它为不同平台的文本转语音能力提供相对统一的 JavaScript API。

对于 React Web 开发者，可以将它理解为：

- React Web 通过浏览器 API 使用系统能力。
- React Native 通常需要通过原生模块调用 iOS 或 Android 能力。
- Expo 模块封装了这层平台通信，使业务代码可以直接调用 JavaScript API。

### 文本转语音

文本转语音的基本过程是：

1. 应用提供一段字符串。
2. 系统选择指定或默认的语音。
3. 系统按照语言、语速和音调等配置合成语音。
4. 设备扬声器播放合成结果。

可用语音以及具体播放效果取决于用户设备和操作系统。`expo-speech` 提供调用接口，但语音本身来自对应平台。

### Expo Go

文档标明 `expo-speech` 已包含在 Expo Go 中。这意味着使用 Expo Go 运行项目时，可以直接测试该模块，不需要为了这个库单独构建自定义原生客户端。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-speech

# yarn
yarn expo install expo-speech

# pnpm
pnpm expo install expo-speech

# bun
bun expo install expo-speech
```

这里使用的是 `expo install`，而不是普通的 `npm install`。它会按照当前 Expo SDK 选择兼容的包版本。

如果是在已有的纯 React Native 工程中使用该库，需要先按照 Expo 文档为项目安装并配置 `expo` 模块。仅安装 `expo-speech` 并不一定足够。

原文没有涉及以下内容：

- 是否需要修改 `app.json` 或 `app.config.js`
- 是否需要申请系统权限
- 是否需要修改 iOS 或 Android 原生配置文件
- EAS Build 或应用商店发布配置

因此，不能根据当前文档断言这些场景需要额外配置。

## 基础用法

```jsx
import { View, StyleSheet, Button } from 'react-native';
import * as Speech from 'expo-speech';

export default function App() {
  const speak = () => {
    const thingToSay = '1';
    Speech.speak(thingToSay);
  };

  return (
    <View style={styles.container}>
      <Button title="Press to hear some words" onPress={speak} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
});
```

模块通过命名空间方式导入：

```js
import * as Speech from 'expo-speech';
```

点击 `Button` 后会触发 `onPress`，随后调用：

```js
Speech.speak('1');
```

设备将尝试朗读字符串 `"1"`。

对于 React Web 开发者，需要注意：

- `View` 类似布局容器，但不是 `<div>`。
- `Button` 不是 HTML `<button>`。
- React Native 使用 `onPress`，而不是 `onClick`。
- `StyleSheet.create()` 用于声明 React Native 样式，不是 CSS 样式表。
- `Speech.speak()` 会触发设备能力，不会返回可供页面播放的音频 URL。

## 核心 API

### 获取允许的最大文本长度

```js
Speech.maxSpeechInputLength
```

类型：

```ts
number
```

支持 Android、iOS 和 Web。

该常量表示单次调用 `Speech.speak()` 所能接受的最大文本长度，具体值取决于平台。在 iOS 上返回 `Number.MAX_VALUE`。

```js
if (text.length <= Speech.maxSpeechInputLength) {
  Speech.speak(text);
}
```

传入的文本不能超过这个限制。处理长文章时，不能假定所有平台都可以一次朗读全文。

> **基于文档内容推导：** 跨平台应用应在调用前检查长度，必要时将长文本拆分成多段。原文没有规定拆分算法、合适的分段长度或标点处理方式。

### 开始朗读

```ts
Speech.speak(text, options?): void
```

支持 Android、iOS 和 Web。

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 需要朗读的文本，不能超过 `Speech.maxSpeechInputLength` |
| `options` | `SpeechOptions` | 可选的朗读配置，默认值为 `{}` |

示例：

```js
Speech.speak('你好，欢迎使用语音功能。', {
  language: 'zh-CN',
  rate: 1,
  pitch: 1,
  volume: 1,
});
```

`Speech.speak()` 的返回值是 `void`，不是 `Promise`。因此下面这种写法不能表示“等待朗读完成”：

```js
await Speech.speak('Hello');
```

如果调用时已有文本正在朗读，新内容会作为一个 utterance 加入队列。这里的 utterance 可以理解为“一条待朗读的语音任务”。

如果需要在朗读完成后执行操作，应使用 `onDone` 回调，而不是等待 `speak()` 的返回值。

### 判断是否正在朗读

```ts
Speech.isSpeakingAsync(): Promise<boolean>
```

支持 Android、iOS 和 Web。

```js
const speaking = await Speech.isSpeakingAsync();
```

结果含义：

- `true`：当前正在朗读，或者朗读处于暂停状态。
- `false`：当前没有朗读任务。

暂停后仍然返回 `true`，因此该方法不能区分“正在发声”和“已暂停”。

### 获取可用语音

```ts
Speech.getAvailableVoicesAsync(): Promise<Voice[]>
```

支持 Android、iOS 和 Web。

```js
const voices = await Speech.getAvailableVoicesAsync();
```

它返回当前设备提供的所有语音。每项通常包含：

```ts
type Voice = {
  identifier: string;
  language: string;
  name: string;
  quality: VoiceQuality;
};
```

可以将 `identifier` 传给 `Speech.speak()` 的 `voice` 选项：

```js
const voices = await Speech.getAvailableVoicesAsync();

if (voices.length > 0) {
  Speech.speak('Hello', {
    voice: voices[0].identifier,
  });
}
```

设备的语音列表可能不同，因此不能仅根据一台开发设备的结果假定所有用户都拥有相同的语音标识。

> **基于文档内容推导：** 如果应用允许用户选择声音，应从当前设备动态读取列表，并保存 `identifier`，而不是在代码中写死某个语音名称。

### 暂停朗读

```ts
Speech.pause(): Promise<void>
```

仅支持 iOS 和 Web，不支持 Android。

```js
await Speech.pause();
```

这意味着不能在 Android 上直接使用同一套暂停交互。文档没有提供 Android 的等价暂停 API。

### 恢复朗读

```ts
Speech.resume(): Promise<void>
```

仅支持 iOS 和 Web，不支持 Android。

```js
await Speech.resume();
```

它会恢复之前暂停的朗读。如果当前没有已暂停的内容，则不会执行任何操作。

### 停止朗读

```ts
Speech.stop(): Promise<void>
```

支持 Android、iOS 和 Web。

```js
await Speech.stop();
```

该方法会：

1. 中断当前朗读。
2. 删除队列中的所有待朗读内容。

它不是“暂停”。调用后，不能通过 `Speech.resume()` 从原位置继续。

## `SpeechOptions` 配置

### 语言

```ts
language?: string
```

用于指定朗读文本的语言，格式参考 IETF BCP 47 语言代码，例如：

```js
Speech.speak('Hello', {
  language: 'en-US',
});

Speech.speak('你好', {
  language: 'zh-CN',
});
```

`language` 表示语言代码，不是语音的唯一标识。如果需要选择具体声音，应使用 `voice`。

### 具体语音

```ts
voice?: string
```

该值是语音标识符，通常来自 `getAvailableVoicesAsync()` 返回项的 `identifier`。

```js
Speech.speak(text, {
  voice: selectedVoice.identifier,
});
```

### 音调

```ts
pitch?: number
```

`1.0` 表示正常音调：

```js
Speech.speak(text, {
  pitch: 1,
});
```

原文没有明确说明有效范围，也没有承诺各个平台对相同数值产生完全相同的效果。

### 语速

```ts
rate?: number
```

`1.0` 表示正常语速：

```js
Speech.speak(text, {
  rate: 0.8,
});
```

原文没有给出有效范围以及不同平台之间的语速换算关系。

### 音量

```ts
volume?: number
```

取值范围为：

- `0.0`：静音
- `1.0`：最大音量

默认值为 `1.0`。

```js
Speech.speak(text, {
  volume: 0.5,
});
```

### iOS 音频会话

```ts
useApplicationAudioSession?: boolean
```

仅支持 iOS。

如果将其设置为 `false`，系统会创建独立的音频会话，自动管理：

- 语音播放
- 音频中断
- 与其他音源的混音
- 播放语音时降低其他音源音量，即 ducking

该选项涉及 iOS 原生音频会话。对于只熟悉 React Web 的开发者，可以将“音频会话”理解为 iOS 对一个应用如何使用扬声器、如何与音乐等其他声音共存的系统级管理机制。

原文只明确解释了值为 `false` 时的行为，没有在当前页面进一步说明默认值以及设置为 `true` 时的完整行为。

### 生命周期回调

#### 开始

```ts
onStart?: () => void | SpeechEventCallback
```

朗读开始时调用。

#### 完成

```ts
onDone?: () => void | SpeechEventCallback
```

正常朗读完成时调用。

#### 主动停止

```ts
onStopped?: () => void | SpeechEventCallback
```

通过 `Speech.stop()` 停止朗读时调用。

#### 错误

```ts
onError?: (error: Error) => void | SpeechEventCallback
```

朗读发生错误时调用。文档明确标注该回调支持 Android 和 iOS，没有标注 Web 支持。

示例：

```js
Speech.speak('Hello', {
  onStart: () => {
    console.log('朗读开始');
  },
  onDone: () => {
    console.log('朗读完成');
  },
  onStopped: () => {
    console.log('朗读被停止');
  },
  onError: error => {
    console.error('朗读失败', error);
  },
});
```

#### 单词边界

```ts
onBoundary?: NativeBoundaryEventCallback | SpeechEventCallback | null
```

当朗读到一个单词边界时触发。它可以用于跟踪朗读进度，例如同步高亮当前单词。

当前文档没有说明：

- 回调参数的完整跨平台结构
- 中文等不以空格分词的语言如何触发
- 各平台触发边界事件的精确一致性

因此，不能仅根据本页假定它在所有语言和平台上行为一致。

#### 其他事件

`SpeechOptions` 还声明了：

```ts
onMark?: SpeechEventCallback | null
onPause?: SpeechEventCallback | null
onResume?: SpeechEventCallback | null
```

当前文档没有进一步解释这些事件的触发条件，也没有单独列出平台差异。使用前需要结合实际目标平台验证。

此外还有一个内部风格的可选字段：

```ts
_voiceIndex?: number
```

原文没有提供说明。字段名以下划线开头，也没有公开用法示例，因此当前文档不足以支持将它作为常规业务配置使用。

## 语音数据类型

### `Voice`

`Voice` 描述设备上的一个可用语音：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `identifier` | `string` | 语音的唯一标识 |
| `language` | `string` | 语音使用的语言 |
| `name` | `string` | 语音名称 |
| `quality` | `VoiceQuality` | 语音质量 |

### `VoiceQuality`

语音质量枚举包含两个值：

```ts
VoiceQuality.Default = 'Default'
VoiceQuality.Enhanced = 'Enhanced'
```

- `Default`：默认质量。
- `Enhanced`：增强质量。

原文没有说明增强语音是否需要额外下载、是否占用更多资源或哪些设备一定支持。

### `WebVoice`

Web 平台的语音类型在 `Voice` 基础上增加：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `isDefault` | `boolean` | 是否为默认语音 |
| `localService` | `boolean` | 原文未进一步解释 |
| `name` | `string` | 语音名称 |
| `voiceURI` | `string` | 语音 URI |

### `SpeechEventCallback`

Web 相关事件回调使用以下形式：

```ts
SpeechEventCallback(this, ev)
```

其中：

- `this` 是浏览器的 `SpeechSynthesisUtterance`。
- `ev` 是浏览器的 `SpeechSynthesisEvent`。
- 返回值类型为 `any`。

这说明 Web 实现的一部分事件类型直接来自浏览器 Web Speech API。React Native 开发中通常不应假设 iOS 和 Android 回调也会提供完全相同的浏览器对象。

## 队列与状态管理

连续调用 `Speech.speak()` 不会自动替换当前内容，而是将新任务加入队列：

```js
Speech.speak('第一段');
Speech.speak('第二段');
```

第二段会排在第一段后面。

如果业务要求用户每次点击都只朗读最新内容，可以先清空现有任务：

```js
await Speech.stop();
Speech.speak(latestText);
```

> **基于文档内容推导：** 频繁触发 `speak()` 而不管理队列，可能导致用户听到过时内容。搜索建议、列表点击或连续通知等场景需要明确采用“排队”还是“替换”策略。

## 平台差异与关键限制

| 能力 | Android | iOS | Web |
| --- | --- | --- | --- |
| 开始朗读 | 支持 | 支持 | 支持 |
| 获取语音列表 | 支持 | 支持 | 支持 |
| 查询朗读状态 | 支持 | 支持 | 支持 |
| 停止并清空队列 | 支持 | 支持 | 支持 |
| 暂停 | 不支持 | 支持 | 支持 |
| 恢复 | 不支持 | 支持 | 支持 |
| `useApplicationAudioSession` | 不支持 | 支持 | 不支持 |
| `onError` | 文档明确支持 | 文档明确支持 | 文档未标注支持 |

### iOS 静音模式

在 iOS 真机上，如果设备处于静音模式，`expo-speech` 不会产生声音。测试时必须关闭静音模式。

这是非常容易误判的问题：代码可能已经成功执行，但设备没有声音。原文特别限定的是 iOS 物理设备，因此不能直接把模拟器表现当作真机表现。

### 暂停与恢复不是跨平台能力

Android 不支持 `Speech.pause()` 和 `Speech.resume()`。如果产品要求三个平台提供完全一致的播放控制，需要在设计阶段处理这个差异。

当前文档没有提供 Android 暂停的替代方案，也没有说明能否获取精确朗读位置后重新开始。

### 朗读状态不等于正在发声

`isSpeakingAsync()` 在暂停时仍返回 `true`。如果界面需要分别显示“正在播放”和“已暂停”，不能只使用这个方法，需要由应用自己维护暂停状态。

### 文本长度由平台决定

`maxSpeechInputLength` 是平台相关的。不能因为 iOS 返回 `Number.MAX_VALUE`，就假定 Android 和 Web 也能接受同样长度的文本。

### `stop()` 会清空整个队列

调用 `stop()` 不仅会终止当前内容，还会删除所有排队任务。如果应用将多段内容依次加入队列，停止操作会影响剩余全部段落。

## React Web 开发者容易误解的地方

### 不是直接使用浏览器 API

虽然 Web 实现涉及 `SpeechSynthesisUtterance` 和 `SpeechSynthesisEvent`，但业务代码使用的是 Expo 提供的统一接口：

```js
import * as Speech from 'expo-speech';
```

不要默认 React Native 原生平台存在 `window.speechSynthesis`、`SpeechSynthesisUtterance` 或其他浏览器全局对象。

### API 并非完全跨平台一致

“支持 Android、iOS 和 Web”不代表每个方法和选项都在三端可用。暂停、恢复、错误事件和音频会话都有明确的平台差异。

### 声音来自用户设备

React Web 项目中也可能遇到浏览器和操作系统语音差异。在移动端，这种差异同样存在。语音名称、标识、语言和质量不应被视为固定资源。

### `speak()` 不是异步完成信号

尽管朗读过程需要时间，`Speech.speak()` 本身返回 `void`。需要使用 `onDone`、`onStopped` 和 `onError` 来管理朗读生命周期。

### 系统静音状态会影响实际输出

代码调用成功不代表用户一定听得到声音，尤其是 iOS 真机静音模式。排查问题时需要同时检查代码状态和设备状态。

## 实际开发建议

以下属于**基于经验建议**，不是当前文档明确要求：

1. 在组件中维护 `idle`、`speaking`、`paused` 等业务状态，并通过回调更新界面。
2. 卸载语音播放页面时，根据业务需要调用 `Speech.stop()`，避免离开页面后仍继续朗读。
3. 从 `getAvailableVoicesAsync()` 动态生成声音选项，不要写死设备相关的 `identifier`。
4. 对长文本按句子或段落拆分，并确保每段不超过 `maxSpeechInputLength`。
5. 在 Android 上隐藏或禁用暂停、恢复按钮，避免提供实际不可用的交互。
6. 在 iOS 真机测试时把静音开关加入检查清单。
7. 对 `speak()` 的连续触发做防抖、禁用或队列策略，防止重复点击不断积压朗读任务。
8. 分别在 Android 真机、iOS 真机和目标浏览器中验证语音、事件和播放控制，不要仅依赖单个平台测试。

一个包含基本状态处理的示例：

```jsx
import { useState } from 'react';
import { Button, View } from 'react-native';
import * as Speech from 'expo-speech';

export default function SpeechExample() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    Speech.speak('你好，欢迎使用文本转语音功能。', {
      language: 'zh-CN',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stop = async () => {
    await Speech.stop();
  };

  return (
    <View>
      <Button
        title={isSpeaking ? '正在朗读' : '开始朗读'}
        onPress={speak}
        disabled={isSpeaking}
      />
      <Button title="停止朗读" onPress={stop} />
    </View>
  );
}
```

## 文档明确说明与合理推导

### 文档明确说明

- `expo-speech` 提供文本转语音能力。
- 支持 Android、iOS 和 Web，并包含在 Expo Go 中。
- iOS 真机处于静音模式时不会产生声音。
- `speak()` 会把新任务加入现有朗读队列。
- `stop()` 会中断当前朗读并清空队列。
- Android 不支持暂停和恢复。
- `isSpeakingAsync()` 在暂停状态下仍返回 `true`。
- 单次朗读文本不能超过 `maxSpeechInputLength`。
- 可通过 `getAvailableVoicesAsync()` 获取设备语音列表。
- 可以配置语言、语音、音调、语速、音量和相关事件回调。

### 基于文档内容推导

- 长文本需要在跨平台场景下考虑拆分。
- 允许连续触发朗读的界面需要设计队列策略。
- 声音选择应基于当前设备返回的语音列表。
- 应用若需要区分播放和暂停状态，需要自行维护额外状态。
- Android 与 iOS/Web 的控制能力不同，界面不能无条件提供相同按钮。

## 当前文档未涉及

当前页面没有说明：

- 文本转语音是否需要网络连接
- 各平台是否需要额外下载语音包
- 所有可用 BCP 47 语言代码
- `pitch` 和 `rate` 的完整有效范围
- Android 暂停和恢复的替代实现
- 后台运行或锁屏后的朗读行为
- 耳机、蓝牙和音频路由行为
- 与录音、音乐播放等其他音频模块同时使用的完整规则
- 原生权限、构建和应用商店审核要求
- 无障碍规范以及朗读内容设计规则
- `onMark`、`onPause`、`onResume` 和 `_voiceIndex` 的详细行为

这些问题需要参考其他 Expo 文档、目标平台文档或通过实际设备测试确认，不能从本页内容直接得出结论。

## 总结

`expo-speech` 提供了简洁的文本转语音接口：使用 `Speech.speak()` 开始朗读，通过选项控制语言和声音，通过回调处理生命周期，并使用状态、停止、暂停和恢复 API 管理播放。

实际开发时最重要的是处理平台差异和队列行为：Android 不支持暂停与恢复，iOS 真机受静音模式影响，`stop()` 会清空所有任务，而语音列表和文本长度限制都取决于设备与平台。对于跨平台应用，应将这些差异直接纳入界面和状态设计，而不是假设三端行为完全一致。

---

## 文档导航

- **上一页**：[sms](./207__sms.md)
- **下一页**：[splash screen](./209__splash-screen.md)
