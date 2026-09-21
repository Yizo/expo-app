# 200｜Expo SDK SMS 发送短信

**翻页：**[上一页：Expo SDK Sharing 系统分享与接收内容](./199-Expo-SDK-Sharing.md) · [目录](./README.md) · [下一页：Expo SDK Speech 文本转语音](./201-Expo-SDK-Speech.md)

**官方页面：**[SMS · Latest](https://docs.expo.dev/versions/latest/sdk/sms/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/sms/)

**版本与平台：**Latest 推荐 `expo-sms ~57.0.2`，SDK v56.0.0 推荐 `~56.0.3`。Android 和 iOS 支持；浏览器及 iOS Simulator 的可用性检查恒为 false。该模块打开系统短信撰写界面，由用户决定是否发送；它不会在后台静默发送短信，也无法确认运营商是否最终送达。

## 检查短信功能是否可用

安装（任选一个包管理器）：

```sh
npx expo install expo-sms
yarn expo install expo-sms
pnpm expo install expo-sms
bun expo install expo-sms
```

在没有 Expo 的 React Native 工程中，还要先安装 `expo`。

用 `isAvailableAsync()` 检查设备是否有可用短信应用，再决定是否展示入口：

```tsx
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as SMS from 'expo-sms';

export default function SmsAction() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    SMS.isAvailableAsync().then(value => {
      if (active) setAvailable(value);
    });
    return () => { active = false; };
  }, []);

  if (!available) return <Text>此设备暂不支持短信</Text>;

  return <Button title="发送短信" onPress={composeSms} />;
}
```

`isAvailableAsync()` 返回 `Promise<boolean>`。它只判断是否可以调用系统的短信界面，不会测试 SIM 卡余额、收件人号码或消息最后是否发送成功。

## 打开系统短信撰写界面

`sendSMSAsync(addresses, message, options?)` 会打开系统 SMS app，并预填收件人、正文和可选附件。它返回 `Promise<SMSResponse>`：

```tsx
import * as SMS from 'expo-sms';

async function composeSms() {
  if (!(await SMS.isAvailableAsync())) return;

  const response = await SMS.sendSMSAsync(
      ['+15551234567', '+15557654321'],
      '你好，这是来自 Expo 的短信草稿。',
      {
        attachments: {
          // 替换为应用内真实且可由短信 app 访问的文件 URI。
          uri: 'content://your.app/share/photo.png',
        mimeType: 'image/png',
        filename: 'photo.png',
      },
    },
  );

  if (response.result === 'cancelled') {
    console.log('用户取消了短信操作');
  } else if (response.result === 'sent') {
    console.log('用户触发了发送');
  } else {
    console.log('系统没有提供是否发送的状态');
  }
}
```

`addresses` 可以是单个号码字符串，也可以是号码数组。附件使用文件 URI、MIME type 和文件名描述；跨应用访问的 Android 文件通常需要 `content://` URI。实际支持哪些附件和格式由目标短信应用决定。

### 返回状态和平台差异

| `result` | 含义 |
| --- | --- |
| `'cancelled'` | 用户取消了撰写 / 发送流程，例如关闭短信界面。 |
| `'sent'` | 系统报告用户已触发发送或排程。它不等于对端确认收到。 |
| `'unknown'` | 当前平台无法确定短信状态。Android 会始终返回该值。 |

应用只收到用户操作的粗粒度结果，不会读取短信正文或收件人列表；不要把这个 Promise 当作短信送达回执。

## API 与数据类型

导入命名空间：

```ts
import * as SMS from 'expo-sms';
```

| API | 平台 / 返回 | 说明 |
| --- | --- | --- |
| `SMS.isAvailableAsync()` | Android / iOS；`Promise<boolean>` | 检查是否可以启动短信功能。iOS Simulator 和 Web 返回 `false`。 |
| `SMS.sendSMSAsync(addresses, message, options?)` | Android / iOS；`Promise<SMSResponse>` | 打开系统短信界面，预填收件人、正文及选项。 |

### `SMSAttachment`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `filename` | `string` | 分享给短信应用显示的文件名。 |
| `mimeType` | `string` | 文件 MIME type，例如 `image/png`。 |
| `uri` | `string` | 附件 URI；系统外的应用需要能够访问它。 |

### `SMSOptions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `attachments` | `SMSAttachment \| SMSAttachment[]`（可选） | 要随短信撰写界面提供的附件。 |

### `SMSResponse`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `result` | `'unknown' \| 'sent' \| 'cancelled'` | 用户的短信操作结果；Android 固定为 `unknown`。 |

关键概念：

- **系统撰写界面**：短信内容交给操作系统 / 默认短信应用显示，最终由用户检查和确认。
- **Promise**：异步操作的结果；此 API 在用户退出系统界面后才给出操作状态。
- **MIME type**：文件格式标识。系统可按它判断短信应用是否支持该附件。
- **content URI**：Android 授权给其它应用读取文件的 URI；普通 app 沙盒路径不一定能直接被外部短信应用读取。

## 源页代码主题覆盖

- Installation：覆盖 npx、Yarn、pnpm、Bun 安装命令及已有 React Native 工程需安装 `expo` 的说明。
- Methods：重写 `isAvailableAsync()` 平台检查和 `sendSMSAsync()` 打开短信撰写界面的示例。
- Attachment：覆盖 `attachments`、`uri`、`mimeType`、`filename` 参数，并解释跨应用 URI 限制。
- Result / Types：覆盖取消、发送、未知三种 `SMSResponse` 值、Android 恒为 `unknown`、`SMSAttachment` 和 `SMSOptions` 字段。
- Latest 与 SDK v56 的 API 和 Next 相同；仅推荐包版本分别为 `~57.0.2` 与 `~56.0.3`。

**翻页：**[上一页：Expo SDK Sharing 系统分享与接收内容](./199-Expo-SDK-Sharing.md) · [目录](./README.md) · [下一页：Expo SDK Speech 文本转语音](./201-Expo-SDK-Speech.md)
