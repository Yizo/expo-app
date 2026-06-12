# Expo MailComposer 学习指南

`expo-mail-composer` 用于调用操作系统提供的邮件界面，让用户在预填收件人、主题、正文和附件后，检查并发送邮件。

> 本文对应 **Expo 下一版本 SDK 的未发布文档**，原文修改日期为 **2026 年 1 月 15 日**。文档提示：当前稳定版本为 **SDK 56**，实际项目应根据所用 Expo SDK 查阅对应版本文档。

## 这篇文档解决什么问题

本文主要说明：

- 如何在 Expo 或 React Native 项目中安装 `expo-mail-composer`
- 如何打开系统邮件编辑界面
- 如何预填邮件内容与附件
- 如何检测当前环境能否发送邮件
- 如何获取设备上可用的邮件客户端
- Android、iOS 和 Web 之间有哪些行为差异

这个库适合以下场景：

- “联系我们”或“反馈问题”
- 预填客服邮箱、邮件主题和诊断信息
- 让用户通过自己选择的邮件客户端发送邮件
- 引导用户打开邮箱，查看应用发送的确认邮件

它并不是一个后台邮件发送服务。调用该 API 会打开操作系统或邮件客户端提供的界面，最终操作仍由用户完成。

最后一句是**基于文档内容推导**：文档将其描述为使用操作系统 UI “compose and send emails”，并明确说明会打开邮件模态框或邮件应用 Intent，而不是由应用服务器直接投递邮件。

## React Web 开发者需要先理解的概念

### Expo 与 React Native

React Native 使用 React 的组件和状态管理方式开发移动应用，但运行环境不是浏览器 DOM，而是 iOS 或 Android 原生应用。

Expo 是围绕 React Native 提供的一套开发工具和原生能力封装。`expo-mail-composer` 就是其中一个模块，用 JavaScript API 封装了各平台的邮件功能。

### 系统邮件 UI

在 Web 项目中，开发者可能使用 `mailto:` 链接打开邮件软件。`expo-mail-composer` 提供了更结构化的 API，可以传入收件人、抄送、密送、主题、正文和附件。

但实际界面由操作系统或邮件应用提供，因此：

- 应用不能完全控制界面样式
- 各平台的返回结果和能力可能不同
- 用户仍然可以修改预填内容或取消操作

后两点中的“用户可以修改预填内容”属于**基于文档内容推导**；原文只明确说明这些字段会被填入系统邮件界面。

### Android Intent

Android Intent 可以理解为一种系统级“调用其他应用完成某个动作”的机制。

`composeAsync()` 在 Android 上通过邮件应用 Intent 打开可处理邮件的应用。它与 React Web 中跳转到外部协议地址有些相似，但由 Android 系统负责寻找和启动对应应用。

### iOS URL Scheme

URL Scheme 是应用注册的专用链接协议。其他应用可以通过该 URL 启动目标应用。

`getClients()` 返回的 iOS 邮件客户端可能包含 `url`，可以交给 `expo-linking` 的 `openURL()`，直接打开该客户端。

### Android 包名

Android 使用包名唯一标识应用，例如类似：

```text
com.example.mail
```

`getClients()` 返回的 Android 邮件客户端可能包含 `packageName`。它可以与 `expo-intent-launcher` 配合，用于：

- 获取邮件客户端图标
- 直接打开指定邮件客户端

## 支持平台与重要限制

文档列出的支持范围为：

- Android
- iOS，仅真机
- Web
- Expo Go

### iOS 模拟器不能使用

`expo-mail-composer` 不能在 iOS Simulator 中使用，因为模拟器无法登录邮件账户。

这意味着即使应用代码本身没有问题，在 iOS 模拟器上也无法完成真实的邮件编写与发送测试。涉及该功能的 iOS 测试需要使用真机，并确保系统 Mail 应用已经登录邮件账户。

### iOS 必须配置邮件账户

调用 `composeAsync()` 时，iOS 会打开邮件编辑模态框。用户需要已经登录系统 Mail 应用，否则无法正常使用该功能。

### Android 无法提供可靠的发送结果

Android 不会向该模块提供邮件究竟是发送、保存还是取消的信息。因此，Android 上返回的状态始终会表现为邮件已经发送。

这是最重要的行为限制之一：

```ts
const result = await MailComposer.composeAsync(options);

if (result.status === MailComposer.MailComposerStatus.SENT) {
  // 在 Android 上，这不能证明邮件真的已经发送。
}
```

不要把 Android 的 `SENT` 状态作为以下业务逻辑的可靠依据：

- 确认用户已经联系了客服
- 发放奖励
- 标记工单已经提交
- 记录邮件投递成功

这些业务影响属于**基于文档内容推导**，依据是文档明确说明 Android 始终按已发送返回状态。

### HTML 正文在 Android 上支持不完善

`isHtml: true` 表示正文包含 HTML 标签，需要按 HTML 格式显示。但文档明确指出，该功能在 Android 上表现并不完美。

因此，不应假设同一段复杂 HTML 能在不同 Android 邮件客户端中保持一致格式。

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install expo-mail-composer

# yarn
yarn expo install expo-mail-composer

# pnpm
pnpm expo install expo-mail-composer

# bun
bun expo install expo-mail-composer
```

这里使用的是 `expo install`，它会根据项目的 Expo SDK 选择兼容的依赖版本。

如果是在已有的纯 React Native 项目中使用，还必须先安装并配置 `expo`，使该项目能够加载 Expo Modules。当前文档没有展开具体配置步骤，只链接到了“在现有 React Native 项目中安装 Expo Modules”的相关文档。

## 导入模块

```js
import * as MailComposer from 'expo-mail-composer';
```

这种写法会把模块导出的函数、枚举等统一放在 `MailComposer` 命名空间下，例如：

```js
MailComposer.composeAsync(...)
MailComposer.isAvailableAsync()
MailComposer.MailComposerStatus.SENT
```

## 核心使用流程

一个稳妥的基本流程是：

1. 使用 `isAvailableAsync()` 检查当前环境是否可用。
2. 准备收件人、主题、正文和附件等参数。
3. 调用 `composeAsync()` 打开系统邮件界面。
4. 根据平台能力处理返回状态，不在 Android 上把 `SENT` 当作真实发送凭证。

示例：

```tsx
import * as MailComposer from 'expo-mail-composer';

async function contactSupport() {
  const available = await MailComposer.isAvailableAsync();

  if (!available) {
    return;
  }

  const result = await MailComposer.composeAsync({
    recipients: ['support@example.com'],
    subject: '问题反馈',
    body: '请在这里描述遇到的问题。',
  });

  console.log(result.status);
}
```

示例只演示 API 的组合方式。当前文档没有规定不可用时应显示什么界面或采用哪种替代方案。

## API 方法

### `MailComposer.composeAsync(options)`

支持 Android、iOS 和 Web。

```ts
MailComposer.composeAsync(options)
```

作用：

- iOS：打开邮件编辑模态框
- Android：触发邮件应用 Intent
- 使用传入的 `options` 预填邮件字段

返回：

```ts
Promise<MailComposerResult>
```

返回对象包含 `status` 字段，用于表示邮件被发送、保存、取消，或者结果无法确定。

需要注意：

- iOS 需要登录系统 Mail 应用
- Android 不提供真实操作结果，状态始终按已发送处理
- 文档没有进一步说明 Web 平台具体会打开什么界面，以及各状态在 Web 上如何判定

### `MailComposer.getClients()`

支持 Android、iOS 和 Web。

```ts
const clients = MailComposer.getClients();
```

返回设备上可用的邮件客户端：

```ts
MailClient[]
```

可用于：

- 显示邮件客户端选择列表
- 让用户选择偏好的客户端发送邮件
- 打开邮箱查看确认邮件

返回值不是 Promise。应以当前文档给出的类型签名为准，不要习惯性地对所有原生 API 都使用 `await`。

### `MailComposer.isAvailableAsync()`

支持 Android、iOS 和 Web。

```ts
const available = await MailComposer.isAvailableAsync();
```

返回：

```ts
Promise<boolean>
```

结果规则：

- 设备已经设置默认发件邮箱时，返回 `true`
- iOS 设备如果通过 MDM 策略禁止发送邮件，可能返回 `false`
- 浏览器中始终返回 `true`

#### 什么是 MDM

MDM（Mobile Device Management，移动设备管理）通常用于企业或学校集中管理设备。管理员可以通过配置策略限制设备能力，包括禁止发送外部邮件。

当 iOS 因 MDM 限制而返回 `false` 时，文档建议可以考虑改用 Linking API。

需要注意，浏览器中始终返回 `true` 只表示 API 被认为可用，不等于用户一定配置了可正常发送邮件的客户端。这一点属于**基于文档内容推导**。

## 参数类型：`MailComposerOptions`

`MailComposerOptions` 用来描述需要预填的邮件数据，所有字段都是可选的。

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `recipients` | `string[]` | 主收件人邮箱列表 |
| `ccRecipients` | `string[]` | 抄送收件人邮箱列表 |
| `bccRecipients` | `string[]` | 密送收件人邮箱列表 |
| `subject` | `string` | 邮件主题 |
| `body` | `string` | 邮件正文 |
| `isHtml` | `boolean` | 正文是否包含需要按 HTML 处理的标签 |
| `attachments` | `string[]` | 应用内部文件 URI 列表 |

完整示例：

```ts
await MailComposer.composeAsync({
  recipients: ['support@example.com'],
  ccRecipients: ['team@example.com'],
  bccRecipients: ['audit@example.com'],
  subject: '应用问题反馈',
  body: '<p>这里是问题描述。</p>',
  isHtml: true,
  attachments: [fileUri],
});
```

### 附件必须使用文件 URI

`attachments` 接收的是应用内部文件 URI，而不是 React Web 中常见的：

- 浏览器 `File` 对象
- `Blob`
- 文件输入框返回的对象
- 普通远程 HTTP URL

文档只明确说明它需要应用内部文件 URI，没有说明如何下载远程文件、生成文件或处理权限。这些工作需要结合 Expo 的文件相关 API 另行实现。

### 收件人字段都是数组

即使只有一个收件人，也需要写成数组：

```ts
recipients: ['user@example.com']
```

不能写成：

```ts
recipients: 'user@example.com'
```

## 返回类型与状态

### `MailComposerResult`

返回对象结构为：

```ts
{
  status: MailComposerStatus;
}
```

### `MailComposerStatus`

状态枚举包含四种值：

| 枚举 | 字符串值 | 含义 |
| --- | --- | --- |
| `MailComposerStatus.CANCELLED` | `"cancelled"` | 用户取消 |
| `MailComposerStatus.SAVED` | `"saved"` | 邮件已保存 |
| `MailComposerStatus.SENT` | `"sent"` | 邮件已发送 |
| `MailComposerStatus.UNDETERMINED` | `"undetermined"` | 无法确定结果 |

使用示例：

```ts
const result = await MailComposer.composeAsync(options);

switch (result.status) {
  case MailComposer.MailComposerStatus.CANCELLED:
    break;
  case MailComposer.MailComposerStatus.SAVED:
    break;
  case MailComposer.MailComposerStatus.SENT:
    break;
  case MailComposer.MailComposerStatus.UNDETERMINED:
    break;
}
```

再次注意：在 Android 上，`SENT` 不能证明用户实际发送了邮件。

## 邮件客户端类型：`MailClient`

`getClients()` 返回的每个客户端包含以下信息：

| 属性 | 平台 | 说明 |
| --- | --- | --- |
| `label` | Android、iOS、Web | 客户端显示名称 |
| `packageName?` | Android | Android 应用包名 |
| `url?` | iOS | 邮件客户端 URL Scheme |

### Android：打开指定客户端

文档说明，可以把 `packageName` 交给 `expo-intent-launcher`：

- `getApplicationIconAsync(packageName)`：获取应用图标
- `openApplication(packageName)`：打开指定应用

### iOS：打开指定客户端

文档说明，可以把客户端的 `url` 交给 `expo-linking`：

```ts
Linking.openURL(client.url);
```

由于 `packageName` 和 `url` 都是可选属性，使用前应检查其是否存在。这是**基于类型定义直接推导**出的必要处理。

## 容易踩坑的地方

### 不能通过该 API 静默发送邮件

该模块的定位是打开系统邮件 UI。它不等同于后端邮件服务，也不适合需要自动发送验证码、通知或交易邮件的场景。

“不能静默发送”是**基于文档内容推导**，当前文档没有提供任何绕过系统 UI 的发送 API。

### 不要只在 iOS 模拟器中测试

iOS 模拟器不能登录邮件账户，因此无法验证该模块。需要安排 iOS 真机测试。

### 检查可用性不能替代错误处理

`isAvailableAsync()` 可以用于提前判断，但文档没有承诺检查通过后，后续调用一定成功。

**基于经验建议**：调用 `composeAsync()` 时仍应使用 `try/catch`，并为用户提供失败提示。

```ts
try {
  const available = await MailComposer.isAvailableAsync();

  if (!available) {
    return;
  }

  await MailComposer.composeAsync(options);
} catch (error) {
  console.error('Unable to open mail composer', error);
}
```

### 不要依赖复杂 HTML

Android 的 HTML 支持并不完善。

**基于经验建议**：优先使用纯文本或简单 HTML，并在目标 Android 邮件客户端中进行真机验证。

### 平台支持不代表行为完全一致

三个平台都支持这些方法和类型，但具体实现不同：

- iOS 使用系统邮件模态框
- Android 使用 Intent
- Web 的具体交互细节在当前文档中没有展开
- Android 无法提供可靠的操作结果

因此，不能仅凭 TypeScript 接口一致，就假设各平台用户体验和返回语义完全相同。

## 实际开发中的使用建议

### 客服与反馈功能

可以预填客服地址、主题和正文模板：

```ts
await MailComposer.composeAsync({
  recipients: ['support@example.com'],
  subject: '应用反馈',
  body: [
    '请描述遇到的问题：',
    '',
    '应用版本：',
    '设备信息：',
  ].join('\n'),
});
```

这可以降低用户填写成本，但邮件是否真正发送仍由系统邮件客户端和用户决定。

### 将邮件作为辅助渠道，而不是可靠业务提交渠道

如果业务必须确保数据到达服务器，例如提交工单、错误报告或订单申诉，应优先通过应用自己的 HTTP API 提交结构化数据。

邮件编辑功能更适合作为补充入口。该建议属于**基于文档限制推导**，尤其考虑到 Android 无法确认真实发送结果。

### 提供不可用时的替代路径

iOS 可能因为没有配置邮件账户或受到 MDM 限制而不可用。

**基于经验建议**：界面中可以提供以下替代方式之一：

- 显示客服邮箱供用户手动复制
- 使用 Linking API
- 提供应用内反馈表单
- 跳转到 Web 客服页面

当前文档只明确提到 MDM 场景下可以考虑 Linking API，其他方式属于经验性补充。

## 文档未涉及的内容

当前文档未说明：

- Web 平台内部如何实现邮件编辑功能
- Web 平台各个返回状态的具体判定规则
- 附件的大小、数量或文件类型限制
- 如何创建、下载或管理附件文件
- Android 各邮件客户端的兼容性差异
- HTML 正文具体有哪些标签或样式不受支持
- 是否需要额外的 iOS 或 Android 原生权限配置
- 邮件发送失败、退信或最终投递状态的追踪方式
- 完整的错误类型与异常处理规则

这些内容不能仅凭当前文档确定，需要查阅相关平台文档或通过目标设备测试。

## 总结

`expo-mail-composer` 的核心价值是通过统一的 JavaScript API，调用 Android、iOS 和 Web 的邮件能力，并预填收件人、主题、正文和附件。

实际使用时最需要记住四点：

1. 它打开的是系统或邮件客户端 UI，不是后台邮件发送服务。
2. iOS 模拟器不能使用，iOS 真机还需要配置 Mail 账户。
3. Android 返回 `SENT` 不代表邮件真的已经发送。
4. HTML 正文在 Android 上支持不完善，跨客户端显示效果需要实测。

---

## 文档导航

- **上一页**：[magnetometer](./189__magnetometer.md)
- **下一页**：[manifests](./191__manifests.md)
