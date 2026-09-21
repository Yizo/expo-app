# 182｜Expo SDK MailComposer 系统邮件撰写

**翻页：**[上一页：Expo SDK Magnetometer 磁力计传感器](./181-Expo-SDK-Magnetometer.md) · [目录](./README.md) · [下一页：Expo SDK Manifests](./183-Expo-SDK-Manifests.md)

**官方页面：**[MailComposer · Latest](https://docs.expo.dev/versions/latest/sdk/mail-composer/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/mail-composer/)

**版本与平台：**Latest 推荐 `expo-mail-composer ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。支持 Android、iOS 真机和 Web，可在 Expo Go 使用。iOS 模拟器无法登录系统 Mail 账户，所以此模块不能在 iOS Simulator 中验证。

## MailComposer 的作用

`expo-mail-composer` 调起操作系统的邮件撰写界面，并预填主题、正文、收件人或附件。它不在后台直接替用户发送邮件：用户会看到系统 UI，再自行发送、存草稿或取消。iOS 需要设备已登录 Mail 应用；Android 则通过系统邮件应用 Intent 打开。

## 安装与导入

```sh
npx expo install expo-mail-composer
yarn expo install expo-mail-composer
pnpm expo install expo-mail-composer
bun expo install expo-mail-composer
```

已有 React Native 工程需先接入 `expo`。模块使用命名空间导入：

```ts
import * as MailComposer from 'expo-mail-composer';
```

## 先检查可用性并撰写邮件

`isAvailableAsync()` 返回 `Promise<boolean>`。默认邮件设置可用时，iOS / Android 通常返回 true；受 MDM（移动设备管理）策略限制的 iOS 设备可能返回 false；浏览器始终返回 true。若不可用，文档建议考虑 `expo-linking` 的 `mailto:` 作为 fallback。

`composeAsync(options)` 会打开邮件 UI，返回 `Promise<MailComposerResult>`。iOS 显示邮件撰写弹窗，用户必须登录 Mail；Android 发起邮件应用 Intent。`attachments` 需要应用内部文件 URI。

```tsx
import * as Linking from 'expo-linking';
import * as MailComposer from 'expo-mail-composer';

export async function prepareSupportEmail() {
  const available = await MailComposer.isAvailableAsync();
  if (!available) {
    await Linking.openURL('mailto:support@example.com?subject=应用问题');
    return null;
  }

  return MailComposer.composeAsync({
    recipients: ['support@example.com'],
    ccRecipients: ['team@example.com'],
    bccRecipients: ['archive@example.com'],
    subject: '应用问题反馈',
    body: '你好，\n\n我遇到的问题是：',
    isHtml: false,
    attachments: ['file:///data/user/0/example/cache/diagnostic.txt'],
  });
}
```

用户可能发送、存草稿或关闭界面；调用方应读取 result，而不要认为“调用了 composeAsync”就等于邮件已送达。Android 邮件 Intent 不会告诉应用用户最后做了什么：文档说明 Android 的 status 会始终按已发送处理。

## 获取设备邮件客户端

`getClients()` 同步返回设备上可用的 `MailClient[]`。可以把名称呈现给用户选择：

```ts
const clients = MailComposer.getClients();
const options = clients.map(client => ({
  label: client.label,
  androidPackage: client.packageName,
  iosScheme: client.url,
}));
```

`MailClient` 的 `label` 是显示名称；`packageName` 仅 Android 有，文档提示可传给 `expo-intent-launcher` 读取图标或直接打开应用；`url` 仅 iOS 有，是该邮件客户端的 URL scheme，可交给 `expo-linking` 的 `openURL()`。跨平台 UI 需按当前字段是否存在来显示。

## 邮件字段

`MailComposerOptions` 的字段都可选：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `recipients` | `string[]` | 收件人地址列表。 |
| `ccRecipients` | `string[]` | 抄送地址列表。 |
| `bccRecipients` | `string[]` | 密送地址列表。 |
| `subject` | `string` | 邮件主题。 |
| `body` | `string` | 邮件正文。 |
| `isHtml` | `boolean` | `true` 表示正文按 HTML 排版；Android 上并非所有 HTML 格式都稳定支持。 |
| `attachments` | `string[]` | 要附加的应用内部文件 URI 数组。 |

## 结果与状态

`MailComposerResult` 只有 `status: MailComposerStatus`：

| 枚举成员 | 字符串值 | 含义 |
| --- | --- | --- |
| `CANCELLED` | `'cancelled'` | 用户取消撰写。 |
| `SAVED` | `'saved'` | 邮件保存为草稿。 |
| `SENT` | `'sent'` | 邮件已发送。 |
| `UNDETERMINED` | `'undetermined'` | 无法确定最终状态。 |

iOS 可区分系统邮件 UI 的发送、保存或取消结果；Android 不提供这些反馈，返回的 `status` 一律按 `SENT` 处理。业务逻辑应据此避免对 Android 把 `SENT` 当作可靠投递回执。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-mail-composer ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。
- 两版平台支持、iOS Simulator 限制、可用性检测、三个方法和 options / result 类型一致。
- 两版页脚 Next 均为 Expo SDK Manifests。

## 源页代码主题覆盖

- Installation / API：覆盖四种 `expo-mail-composer` 安装命令、已有 React Native 工程需有 Expo，以及 `import * as MailComposer` 导入。
- `composeAsync`：新增原创使用示例覆盖收件人、CC、BCC、主题、正文、HTML 标记、附件 URI、系统撰写 UI 与 Promise 结果。
- `getClients`：覆盖同步获取客户端列表、`MailClient.label`、Android `packageName` 与 iOS `url` 的平台用途，并说明 Linking / IntentLauncher 后续集成边界。
- `isAvailableAsync`：覆盖默认邮件账户、iOS MDM 阻止、Web 恒为 true 和 `mailto:` fallback。
- Types / Enums：列出全部 7 个 `MailComposerOptions` 字段、`MailClient` 三个字段、`MailComposerResult.status` 和四种 `MailComposerStatus`。
- 源页没有独立 runnable Usage 代码块；代码围栏只提供安装命令和命名空间导入。本文据 API 参数重写邮件使用示例。

**翻页：**[上一页：Expo SDK Magnetometer 磁力计传感器](./181-Expo-SDK-Magnetometer.md) · [目录](./README.md) · [下一页：Expo SDK Manifests](./183-Expo-SDK-Manifests.md)
