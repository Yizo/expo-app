# 178｜Expo SDK LocalAuthentication 本地生物识别

**翻页：**[上一页：Expo SDK LivePhoto iOS 动态照片](./177-Expo-SDK-LivePhoto.md) · [目录](./README.md) · [下一页：Expo SDK Localization](./179-Expo-SDK-Localization.md)

**官方页面：**[LocalAuthentication · Latest](https://docs.expo.dev/versions/latest/sdk/local-authentication/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/local-authentication/)

**版本与平台：**Latest 推荐 `expo-local-authentication ~57.0.3`；SDK v56.0.0 推荐 `~56.0.5`。支持 Android、iOS 和 Expo Go；iOS Face ID 不支持在 Expo Go 测试，需要 development build。

## 本地认证的用途

`expo-local-authentication` 调用操作系统提供的生物识别界面：Android 使用系统 Biometric Prompt，iOS 使用 Face ID 或 Touch ID。应用获得的是“成功 / 失败”结果和错误原因，不会从 API 获得用户的指纹或面部样本。它适合在本机确认用户后继续操作，例如重新打开已解锁的功能；它本身不是服务端登录，也不能代替服务器身份验证。

几个检查方法代表不同状态：

- `hasHardwareAsync()`：设备有没有面部或指纹识别硬件。
- `supportedAuthenticationTypesAsync()`：设备支持哪些认证类型。
- `isEnrolledAsync()`：用户是否已在系统设置里录入可用的生物识别数据。
- `getEnrolledLevelAsync()`：返回已录入认证的安全级别。

“有硬件”不代表“已有录入”。开始弹出系统认证前，应分别处理硬件不支持、没有录入、系统锁定等情况。

## 安装与配置

```sh
npx expo install expo-local-authentication
yarn expo install expo-local-authentication
pnpm expo install expo-local-authentication
bun expo install expo-local-authentication
```

在已有的 React Native 工程中接入时，需要先安装 `expo`。如果项目使用 config plugin / Continuous Native Generation（CNG），在 app config 配置 iOS Face ID 权限提示：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "允许 $(PRODUCT_NAME) 使用 Face ID"
        }
      ]
    ]
  }
}
```

`faceIDPermission` 只影响 iOS，对应原生 `NSFaceIDUsageDescription`。此配置属于构建时配置，改动后需要重新生成 / 构建应用二进制文件；运行时改 JS 无法修改原生权限说明。未使用 CNG 或手动维护 iOS 工程时，在 `ios/<应用目录>/Info.plist` 加入等价条目：

```xml
<key>NSFaceIDUsageDescription</key>
<string>允许应用使用 Face ID 验证身份</string>
```

Apple 要求使用 Face ID 的应用提供用途说明。在支持 Face ID 的 iPhone 上没有配置 `NSFaceIDUsageDescription` 时，模块会使用设备密码进行认证。Expo Go 不支持测试 Face ID；配置、提示文案或真实 Face ID 行为需要通过 development build 验证。

## 检查设备并发起认证

```tsx
import * as LocalAuthentication from 'expo-local-authentication';

export async function verifyWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return { ok: false, reason: '设备没有兼容的生物识别硬件' };
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    return { ok: false, reason: '用户尚未在系统中录入生物识别信息' };
  }

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
  console.log('支持的方式 / 已录入级别：', types, enrolledLevel);

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '请确认是你本人',
    cancelLabel: '取消',
    fallbackLabel: '使用设备密码',
  });

  if (result.success) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: result.error,
    warning: result.warning,
  };
}
```

`authenticateAsync(options?)` 返回 `Promise<LocalAuthenticationResult>`。成功时是 `{ success: true }`；失败时含 `{ success: false, error, warning? }`。失败是正常流程的一部分：用户可能取消、未录入、达到系统锁定次数，或认证被系统中断。产品应依据 `error` 处理，不要只判断硬件支持后就假设认证必然成功。

Android 还可用 `cancelAuthenticate()` 取消正在显示的认证流程；iOS 页面不提供此方法。示意：

```ts
import * as LocalAuthentication from 'expo-local-authentication';

export async function cancelAndroidPrompt() {
  await LocalAuthentication.cancelAuthenticate();
}
```

## 方法一览

| 方法 | 返回值 / 用途 | 平台 |
| --- | --- | --- |
| `authenticateAsync(options?)` | `Promise<LocalAuthenticationResult>`；显示系统生物识别认证提示。 | Android、iOS |
| `cancelAuthenticate()` | `Promise<void>`；取消正在进行的认证。 | Android |
| `getEnrolledLevelAsync()` | `Promise<SecurityLevel>`；查询已录入方式的安全级别。 | Android、iOS |
| `hasHardwareAsync()` | `Promise<boolean>`；检测设备上是否有面部或指纹识别器。 | Android、iOS |
| `isEnrolledAsync()` | `Promise<boolean>`；检测是否已有认证数据录入。 | Android、iOS |
| `supportedAuthenticationTypesAsync()` | `Promise<AuthenticationType[]>`；获取支持的认证方式。 | Android、iOS；无支持类型时返回空数组，可同时返回多种。 |

## 选项、错误与结果类型

`LocalAuthenticationOptions` 的属性均可选：

| 选项 | 平台 / 默认值 | 作用 |
| --- | --- | --- |
| `biometricsSecurityLevel` | 仅 Android，默认 `'weak'` | 可用值 `'weak'` / `'strong'`。`strong` 只接受 Android Class 3；`weak` 接受 Class 2 和 Class 3。Class 2 可包含基于摄像头的面部识别，安全强度低于 Class 3。 |
| `cancelLabel` | Android、iOS | 自定义系统提示中的取消按钮文字。 |
| `disableDeviceFallback` | 默认 `false`；iOS 行为 | 多次失败后系统通常允许改用设备密码；设为 `true` 后关闭这项系统 fallback，应用可自行控制后续认证流程。 |
| `fallbackLabel` | 仅 iOS | 自定义多次失败后出现的“使用设备密码”按钮；设空字符串会隐藏按钮。 |
| `promptDescription` | 仅 Android | Biometric Prompt 中央的说明文字。 |
| `promptMessage` | Android、iOS | 显示在认证提示中的主消息。 |
| `promptSubtitle` | 仅 Android | 显示在主消息下方的副标题。 |
| `requireConfirmation` | 仅 Android，默认 `true` | 提示系统认证后是否要求用户确认；系统设置或当前认证方式可能使系统忽略该值。 |

认证错误 `LocalAuthenticationError` 是字符串联合类型，结果可能返回以下值：

| 错误值 | 含义 |
| --- | --- |
| `not_enrolled` | 没有录入生物识别信息。 |
| `user_cancel` | 用户主动取消。 |
| `app_cancel` | 应用取消了认证。 |
| `not_available` | 当前不可用。 |
| `lockout` | 系统因多次失败锁定认证。 |
| `no_space` | 系统报告空间不足。 |
| `timeout` | 认证超时。 |
| `unable_to_process` | 系统无法处理本次认证数据。 |
| `unknown` | 未分类错误。 |
| `system_cancel` | 系统中断了认证。 |
| `user_fallback` | 用户选择了 fallback 方式。 |
| `invalid_context` | 当前认证上下文无效。 |
| `passcode_not_set` | 设备没有设置锁屏密码。 |
| `authentication_failed` | 本次生物识别未通过。 |

`LocalAuthenticationResult` 是一个按 `success` 区分的结果对象：成功支只有 `success: true`；失败支有 `success: false`、`error: LocalAuthenticationError` 和可选 `warning: string`。

## 枚举与安全级别

### `AuthenticationType`

`supportedAuthenticationTypesAsync()` 会返回数值枚举，可同时有多个值；例如 `[1, 2]` 表示指纹和面部识别均受支持；不支持时返回 `[]`。

| 成员 | 值 | 含义 |
| --- | ---: | --- |
| `FINGERPRINT` | `1` | 指纹。 |
| `FACIAL_RECOGNITION` | `2` | 面部识别。 |
| `IRIS` | `3` | 虹膜识别；仅 Android。 |

### `SecurityLevel`

`getEnrolledLevelAsync()` 返回的级别描述已登记方法，不是本次认证是否成功：

| 成员 | 值 | 含义 |
| --- | ---: | --- |
| `NONE` | `0` | 没有已录入认证方式。 |
| `SECRET` | `1` | 非生物识别方式，如 PIN、图案或设备密码。 |
| `BIOMETRIC_WEAK` | `2` | 弱生物识别，例如基于二维图像的人脸解锁；iOS 当前没有弱生物识别选项。 |
| `BIOMETRIC_STRONG` | `3` | 强生物识别，例如指纹或三维人脸识别。 |

Android M 之前的旧设备如果只登记了 SIM 卡锁，`getEnrolledLevelAsync()` 可能返回 `SECRET`；这不代表 `authenticateAsync()` 会提示用户通过 SIM 锁完成认证。

## 原生权限

| 平台 | 权限 / 用途说明 | 备注 |
| --- | --- | --- |
| Android | `USE_BIOMETRIC` | 允许应用调用设备支持的生物识别类型，由库的 Android Manifest 自动加入。 |
| Android | `USE_FINGERPRINT` | 兼容权限；Android API 28 已弃用，应优先使用 `USE_BIOMETRIC`。 |
| iOS | `NSFaceIDUsageDescription` | 向用户解释应用为什么请求使用 Face ID；由 config plugin 或手动 `Info.plist` 配置。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-local-authentication ~57.0.3`；SDK v56.0.0 推荐 `~56.0.5`。
- 两版官方页面的 Face ID Expo Go 限制、配置插件 / 手动 Info.plist 配置、六个方法、选项、错误类型、枚举与权限说明一致。
- Latest 和 v56 页脚 Next 均进入 Expo SDK Localization。本地项目使用 SDK 56 时，按 v56 文档和 `npx expo install` 选择匹配包版本。

## 源页代码主题覆盖

- Known limitation：说明 iOS Face ID 不能在 Expo Go 测试，需 development build。
- Installation：列出官方 `npx`、Yarn、pnpm、Bun 安装命令，并说明现有 React Native 工程需要 Expo。
- Configuration：改写完整 config plugin JSON 示例和 `faceIDPermission` 属性；同时保留手动 `Info.plist` XML 配置方法及未配置时回退设备密码的行为。
- API usage：加入检查硬件、已录入状态、支持类型、安全级别，再调用 `authenticateAsync` 并分别处理成功 / 失败的示例；另覆盖 Android `cancelAuthenticate()`。
- Methods：覆盖全部六个公开方法的返回类型、行为和平台差异。
- Types / Enums：列全 `BiometricsSecurityLevel`、14 种错误字符串、`LocalAuthenticationOptions` 全部字段、`LocalAuthenticationResult` 两种形态、认证类型和安全级别成员 / 数值。
- Permissions：覆盖 Android 自动添加的两个权限及弃用边界，以及 iOS Face ID 用途说明键。

**翻页：**[上一页：Expo SDK LivePhoto iOS 动态照片](./177-Expo-SDK-LivePhoto.md) · [目录](./README.md) · [下一页：Expo SDK Localization](./179-Expo-SDK-Localization.md)
