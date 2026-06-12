# Expo LocalAuthentication：在 Expo 应用中使用生物识别认证

> 本文对应 Expo **下一版本 SDK（unversioned）** 的文档，原文修改日期为 2026 年 6 月 11 日。用于当前稳定项目时，应同时核对 Expo SDK 56 的正式文档，避免 API 或行为差异。

## 文档解决的问题

`expo-local-authentication` 用于调用设备操作系统提供的本地认证能力：

- Android：Biometric Prompt，包括指纹、人脸等设备支持的方式。
- iOS：Touch ID 和 Face ID。
- 认证失败一定次数后，还可由系统回退到设备密码，具体行为受配置影响。

它适合以下场景：

- 进入支付、隐私设置等敏感页面前验证当前设备使用者。
- 用户重新打开应用时快速解锁。
- 执行敏感操作前进行二次确认。
- 使用设备生物识别代替应用内重复输入密码。

需要明确的是，这个库负责的是**设备本地身份验证**。文档没有说明它可以代替服务端登录、签发登录凭证或验证用户的网络账户身份。

> **基于文档内容推导：** 生物识别成功只能说明操作系统完成了本地认证，不能单独证明某个服务端账号的真实身份。实际项目仍需自行管理登录状态、Token 和服务端授权。

## React Web 开发者需要先理解的概念

### Expo 与 React Native

React Native 使用 React 的组件和状态模型开发移动应用，但最终运行的是 iOS 或 Android 应用，不是浏览器页面。

与 React Web 调用浏览器 API 不同，本库会进入原生系统能力：

```text
JavaScript / React Native
        ↓
expo-local-authentication
        ↓
iOS LocalAuthentication / Android Biometric Prompt
        ↓
系统管理的 Face ID、Touch ID、指纹或设备密码界面
```

因此，部分设置无法在 JavaScript 运行时修改，必须写入原生应用配置并重新构建安装包。

### 生物识别数据不会交给应用

应用请求系统进行验证，并接收成功或失败结果。原文没有提供读取、保存或上传指纹和面部数据的 API。

> **基于文档内容推导：** 不应把这个库理解成摄像头识别人脸或扫描并保存指纹。真正的生物特征匹配由操作系统处理。

### CNG 和 config plugin

**Continuous Native Generation（CNG）** 是 Expo 根据应用配置生成或维护原生工程的工作流。

**Config plugin** 会在构建阶段修改 iOS、Android 原生配置。它与 React Web 中的运行时配置不同：

- 修改配置后通常要重新构建应用。
- JavaScript 热更新不能让原生配置立即生效。
- 不使用 CNG 时，需要直接修改原生工程文件。

### Expo Go 与 development build

- **Expo Go**：通用的 Expo 测试客户端，只内置固定的原生能力。
- **Development build**：包含项目自身原生配置和依赖的开发版应用。

虽然该库包含在 Expo Go 中，但原文明确指出：**iOS Face ID 无法在 Expo Go 中测试，必须创建 development build。**

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install expo-local-authentication

# yarn
yarn expo install expo-local-authentication

# pnpm
pnpm expo install expo-local-authentication

# bun
bun expo install expo-local-authentication
```

`expo install` 会按照当前 Expo SDK 选择兼容的包版本，不应简单等同于任意安装最新版 npm 包。

如果是在已有的裸 React Native 项目中使用，还必须先安装并配置 Expo Modules 所需的 `expo` 包。当前文档没有展开具体安装步骤。

## iOS Face ID 配置

### 使用 CNG 和 config plugin

在 `app.json` 中加入插件配置：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
        }
      ]
    ]
  }
}
```

`faceIDPermission` 仅用于 iOS，对应原生配置中的 `NSFaceIDUsageDescription`，也就是系统向用户说明“应用为什么需要 Face ID”的文字。

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `faceIDPermission` | `"Allow $(PRODUCT_NAME) to use Face ID"` | 设置 `NSFaceIDUsageDescription` |
| `faceIDPermission: false` | 无 | 从 `Info.plist` 中省略该键，适用于不使用 Face ID 的应用 |

`$(PRODUCT_NAME)` 是 iOS 构建系统提供的产品名称占位符，不是 JavaScript 模板字符串。

### 不使用 CNG

如果项目手动维护原生 `ios` 工程，需要在 `ios/[app]/Info.plist` 中加入：

```xml
<key>NSFaceIDUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to use FaceID</string>
```

### 缺少 Face ID 用途说明的影响

Apple 要求使用 Face ID 的应用声明用途。如果在支持 Face ID 的 iPhone 上调用认证，却没有配置 `NSFaceIDUsageDescription`，原文说明该模块将改用**设备密码**认证。

这意味着：

- 安装包可能仍能运行，但没有按预期调用 Face ID。
- 仅检查 `authenticateAsync()` 是否成功，可能无法发现配置遗漏。
- 修改该配置后需要重新构建应用二进制文件。

## 引入模块

```js
import * as LocalAuthentication from 'expo-local-authentication';
```

模块提供设备能力检测、录入状态检查、认证等级查询和实际认证等 API。

## 推荐的认证流程

调用认证弹窗前，通常应依次判断硬件能力和录入状态：

```js
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticate() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();

  if (!hasHardware) {
    return { ok: false, reason: '设备不支持生物识别' };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!isEnrolled) {
    return { ok: false, reason: '设备尚未录入生物识别信息' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '验证身份以继续',
  });

  if (result.success) {
    return { ok: true };
  }

  return { ok: false, reason: result.error };
}
```

> **基于文档内容推导：** 预检查不是调用 `authenticateAsync()` 的强制前置条件，但可以区分“不支持”“未录入”和“用户认证失败”，便于设计正确的界面提示。

## 能力检测 API

### `hasHardwareAsync()`

```ts
LocalAuthentication.hasHardwareAsync(): Promise<boolean>
```

判断设备是否提供面部或指纹扫描硬件。

返回 `true` 只说明存在相应硬件，不代表用户已经录入了指纹或面部信息。

### `isEnrolledAsync()`

```ts
LocalAuthentication.isEnrolledAsync(): Promise<boolean>
```

判断设备是否已经保存可用于认证的指纹或面部数据。

React Web 开发者容易把“浏览器支持某 API”和“用户已配置该功能”混为一谈。移动端需要分别检查：

```text
设备是否有硬件 → 用户是否已录入 → 发起认证
```

### `supportedAuthenticationTypesAsync()`

```ts
LocalAuthentication.supportedAuthenticationTypesAsync():
  Promise<AuthenticationType[]>
```

返回设备支持的认证类型数组：

| 枚举 | 数值 | 含义 |
| --- | ---: | --- |
| `AuthenticationType.FINGERPRINT` | `1` | 指纹 |
| `AuthenticationType.FACIAL_RECOGNITION` | `2` | 人脸识别 |
| `AuthenticationType.IRIS` | `3` | 虹膜识别，仅 Android |

一个设备可能同时支持多种方式。例如 `[1, 2]` 表示同时支持指纹和人脸识别；空数组表示没有支持的类型。

不要依赖裸数值判断，优先使用枚举：

```js
const types =
  await LocalAuthentication.supportedAuthenticationTypesAsync();

const supportsFace = types.includes(
  LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
);
```

### `getEnrolledLevelAsync()`

```ts
LocalAuthentication.getEnrolledLevelAsync(): Promise<SecurityLevel>
```

返回设备已经设置的认证等级：

| 枚举 | 数值 | 含义 |
| --- | ---: | --- |
| `SecurityLevel.NONE` | `0` | 未录入认证方式 |
| `SecurityLevel.SECRET` | `1` | PIN、图案等非生物识别方式 |
| `SecurityLevel.BIOMETRIC_WEAK` | `2` | 弱生物识别，例如基于二维图像的人脸解锁 |
| `SecurityLevel.BIOMETRIC_STRONG` | `3` | 强生物识别，例如指纹或 3D 人脸识别 |

iOS 当前没有弱生物识别选项。

Android M 以前的设备存在特殊情况：如果只设置了 SIM 卡锁，也可能返回 `SECRET`，但 `authenticateAsync()` 并不会提示使用 SIM 卡锁。因此，不能把 `SECRET` 直接理解为“一定可以作为本库认证弹窗的回退方式”。

## 发起认证

### `authenticateAsync(options)`

```ts
LocalAuthentication.authenticateAsync(options?):
  Promise<LocalAuthenticationResult>
```

该方法尝试使用设备上的指纹、Touch ID 或 Face ID 完成认证。

结果是一个可按 `success` 区分的对象：

```ts
{ success: true }
```

或者：

```ts
{
  success: false;
  error: LocalAuthenticationError;
  warning?: string;
}
```

建议先判断 `success`，再访问 `error`：

```js
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: '请验证身份',
});

if (result.success) {
  // 执行已授权的操作
} else {
  console.log(result.error, result.warning);
}
```

### 认证选项

| 选项 | 平台 | 作用 |
| --- | --- | --- |
| `promptMessage` | Android、iOS | 系统认证提示中的主要消息 |
| `cancelLabel` | Android、iOS | 自定义取消按钮文字 |
| `promptSubtitle` | Android | 主消息下方的副标题 |
| `promptDescription` | Android | 提示框中部的描述文字 |
| `fallbackLabel` | iOS | 自定义多次失败后显示的“使用密码”按钮；空字符串可隐藏该按钮 |
| `disableDeviceFallback` | Android、iOS | 禁用认证失败后的设备密码回退，由应用自行处理后续流程；默认 `false` |
| `biometricsSecurityLevel` | Android | 限制允许使用的生物识别安全等级；默认 `'weak'` |
| `requireConfirmation` | Android | 提示系统认证后是否要求用户再次确认；默认 `true` |

#### `biometricsSecurityLevel`

可选值：

- `'weak'`：允许 Android Class 2 和 Class 3 生物识别。
- `'strong'`：只允许 Class 3 生物识别，例如指纹或 3D 人脸扫描。

基于普通摄像头的面部解锁可能属于安全性较低的 Class 2。

> **基于文档内容推导：** 涉及支付或高敏感操作时，应根据业务安全要求评估是否设置为 `'strong'`，不能只判断设备“支持人脸识别”。

#### `disableDeviceFallback`

默认值为 `false`。多次认证失败后，系统可以回退到设备密码。

设置为 `true` 后，应用需要自行处理失败后的业务流程。在 iOS 中，这对应仅使用生物识别的系统认证策略，而不是允许设备所有者通过生物识别或密码认证的策略。

#### `fallbackLabel`

这是 iOS 的“使用密码”按钮文字。设置为空字符串会隐藏该按钮。

需要区分：

- `fallbackLabel: ''`：隐藏提示框中的回退按钮。
- `disableDeviceFallback: true`：禁用设备密码回退策略。

二者不是同一个配置。

#### `requireConfirmation`

该选项仅向 Android 系统表达是否希望认证后再次确认。原文明确指出，系统可能忽略它，例如：

- 用户在系统设置中禁用了隐式认证。
- 当前生物识别方式不适用该设置。

因此，不能把它当作应用能够绝对控制的 UI 行为。

## 取消认证

```ts
LocalAuthentication.cancelAuthenticate(): Promise<void>
```

该方法仅支持 Android，用于取消正在进行的认证流程。

原文未提供对应的 iOS 取消方法，也没有说明组件卸载时是否必须主动调用，因此不应假定两端具有完全一致的取消机制。

## 认证失败类型

`LocalAuthenticationError` 可能为：

| 错误值 | 含义 |
| --- | --- |
| `not_enrolled` | 用户尚未录入可用认证信息 |
| `user_cancel` | 用户取消认证 |
| `app_cancel` | 应用取消认证 |
| `not_available` | 认证能力不可用 |
| `lockout` | 因失败次数等原因被系统锁定 |
| `no_space` | 没有可用空间 |
| `timeout` | 认证超时 |
| `unable_to_process` | 系统无法处理认证 |
| `unknown` | 未知错误 |
| `system_cancel` | 系统取消认证 |
| `user_fallback` | 用户选择回退认证方式 |
| `invalid_context` | 原生认证上下文无效 |
| `passcode_not_set` | 设备未设置密码 |
| `authentication_failed` | 身份验证失败 |

原文只列出了错误值，没有逐项规定 UI、重试次数或恢复策略。

> **基于经验建议：** 不要把所有失败都提示成“指纹错误”。用户主动取消、系统取消、未录入、锁定和普通认证失败应采用不同处理方式；`unknown` 等内部信息不宜直接展示给用户。

## 权限与原生配置

### Android

库的 `AndroidManifest.xml` 会自动加入：

| 权限 | 作用 |
| --- | --- |
| `USE_BIOMETRIC` | 允许应用使用设备支持的生物识别方式 |
| `USE_FINGERPRINT` | 原文未提供进一步说明 |

通常不需要像 Web 权限 API 那样在业务代码中手动声明这些 Manifest 权限。

### iOS

使用的 `Info.plist` 键为：

| 键 | 作用 |
| --- | --- |
| `NSFaceIDUsageDescription` | 告知用户应用请求 Face ID 的原因 |

该配置属于构建产物的一部分，不是调用认证方法时动态传入的提示文字。它与 `promptMessage` 的职责不同：

- `NSFaceIDUsageDescription`：iOS 权限用途说明。
- `promptMessage`：每次发起认证时显示的认证提示。

## 关键限制与容易踩坑的地方

1. **Expo Go 不能测试 iOS Face ID。** 即使库显示为 Included in Expo Go，也必须使用 development build 测试 Face ID。
2. **有硬件不等于已录入。** `hasHardwareAsync()` 和 `isEnrolledAsync()` 解决的是不同问题。
3. **支持类型不等于安全等级。** “支持人脸识别”不能说明它属于弱认证还是强认证。
4. **缺少 iOS 用途说明会改变认证行为。** 在支持 Face ID 的 iPhone 上可能回退到设备密码。
5. **原生配置修改后要重新构建。** 修改 config plugin 或 `Info.plist` 不能依靠热重载生效。
6. **Android 和 iOS 的选项并不对称。** 例如 `promptSubtitle` 仅 Android，`fallbackLabel` 仅 iOS，取消 API 也仅 Android。
7. **系统拥有最终控制权。** Android 可能忽略 `requireConfirmation`。
8. **认证结果不是服务端登录结果。** 本库没有提供账号识别、Token 签发或服务端授权功能。

## 实际开发中的使用方式

一个完整业务流程通常可以组织为：

```text
检查设备硬件
    ↓
检查是否已录入
    ↓
按业务需要检查认证类型或安全等级
    ↓
调用 authenticateAsync()
    ↓
根据 success 和 error 分支处理
    ↓
认证成功后执行受保护操作
```

对于普通应用解锁，可以允许系统回退到设备密码；对于必须使用特定等级生物识别的操作，可以在 Android 上设置 `biometricsSecurityLevel: 'strong'`，并根据业务要求考虑关闭设备密码回退。

> **基于经验建议：** 应在真实设备上覆盖以下测试：未录入生物信息、用户取消、连续失败、系统锁定、设备未设置密码、Face ID 用途说明缺失，以及 Android 弱认证与强认证差异。模拟器不能完整代表真实传感器和系统安全策略。

## 文档未涉及的内容

当前文档未涉及以下内容：

- 完整页面或 Hook 的状态管理实现。
- 服务端登录、Token 刷新和会话管理。
- 生物识别成功后的数据加密或密钥存储。
- Android 与 iOS 各错误码的详细恢复策略。
- 测试框架中的自动化模拟方式。
- 模拟器如何配置指纹或 Face ID。
- 应用商店审核要求和隐私政策编写方式。
- 后台切换、组件卸载时的完整生命周期处理。
- Web 平台支持；文档中的 API 只标注 Android 和 iOS。

## 总结

`expo-local-authentication` 是对 Android Biometric Prompt、iOS Touch ID 和 Face ID 的 Expo 封装。使用时应区分四件事：

1. 设备是否具备生物识别硬件。
2. 用户是否已经录入生物信息。
3. 当前认证方式及其安全等级。
4. 实际认证是否成功，以及失败原因是什么。

对 Expo 项目而言，最重要的构建期要求是正确配置 iOS 的 `NSFaceIDUsageDescription`；最重要的测试限制是 iOS Face ID 无法在 Expo Go 中验证，必须使用 development build。业务上则不能把本地认证成功直接等同于服务端账号登录成功。

---

## 文档导航

- **上一页**：[live photo](./185__live-photo.md)
- **下一页**：[localization](./187__localization.md)
