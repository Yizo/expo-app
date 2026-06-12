# Expo IntentLauncher：从 React Native 启动 Android Intent

> 原文档更新时间：2026 年 1 月 15 日  
> 包名：`expo-intent-launcher`  
> 支持平台：Android、Expo Go  
> 文档版本：下一版 Expo SDK 的未发布文档；文档明确指出，当前最新稳定版为 SDK 56。

## 文档解决的问题

`expo-intent-launcher` 为 React Native / Expo 应用提供了调用 Android Intent 的能力，主要用于：

- 打开 Android 系统设置页面，例如定位、Wi-Fi、蓝牙或应用详情设置。
- 根据 Android 包名启动另一个应用。
- 获取已安装应用的图标。
- 启动指定 Android Activity，并在用户返回当前应用后获得执行结果。

这是一个 **Android 专用 API**。文档没有提供 iOS 或 Web 实现。

典型场景是：应用检测到某项系统设置不符合要求，然后引导用户直接进入对应的 Android 设置页面进行修改。

## 阅读前需要理解的 Android 概念

### Intent

Intent 是 Android 组件之间传递“操作请求”的机制。

可以将它粗略理解为浏览器中的 URL 导航：

```ts
window.location.href = '/settings';
```

但 Intent 不只是页面跳转，它还可以携带：

- 要执行的动作，即 `action`
- 要操作的数据 URI，即 `data`
- 数据的 MIME 类型，即 `type`
- 额外参数，即 `extras`
- 目标应用或组件
- 控制启动行为的标志位，即 `flags`

Intent 最终由 Android 系统解析，并找到能够处理该请求的 Activity。

### Activity

Activity 通常对应 Android 应用中的一个可交互界面。

对于 React Web 开发者，可以暂时将其理解成一个能够独立打开的原生页面，但它不是 React Router 中的路由组件。Activity 属于 Android 原生应用模型，由操作系统负责启动、暂停和恢复。

调用：

```ts
startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
```

会暂时打开 Android 系统的定位设置 Activity。用户从设置页面返回后，原来的 React Native 应用重新回到前台。

### Action

Action 是描述 Intent 要做什么的字符串，例如：

```text
android.settings.LOCATION_SOURCE_SETTINGS
```

Expo 将大量常用的设置 Action 封装到了 `ActivityAction` 枚举中，因此通常不需要手写这些字符串。

### 包名与组件

Android 包名是应用的唯一标识，例如 Gmail 的包名：

```text
com.google.android.gm
```

它类似 Web 世界里的 npm 包名或域名，但其实际作用是标识设备上的 Android 应用。

Android 的 `ComponentName` 用于精确指定目标组件，由包名和类名组成：

- `packageName`：目标应用的包名
- `className`：目标 Activity 的原生类名

只有在需要明确指定处理组件时，才应设置这些字段。

## 安装

根据使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-intent-launcher

# yarn
yarn expo install expo-intent-launcher

# pnpm
pnpm expo install expo-intent-launcher

# bun
bun expo install expo-intent-launcher
```

`expo install` 与直接执行 `npm install` 的重要区别是：它会根据当前 Expo SDK 选择兼容的包版本。

如果项目是已有的普通 React Native 原生工程，而不是已经配置好的 Expo 项目，必须先安装并配置 `expo`，才能使用这个 Expo Module。

当前文档未涉及额外的 `app.json`、`app.config.js`、AndroidManifest 或 Gradle 配置。

## 基础用法

以下代码打开 Android 的定位设置页面：

```ts
import {
  startActivityAsync,
  ActivityAction,
} from 'expo-intent-launcher';

await startActivityAsync(
  ActivityAction.LOCATION_SOURCE_SETTINGS
);
```

也可以使用命名空间形式导入：

```ts
import * as IntentLauncher from 'expo-intent-launcher';

await IntentLauncher.startActivityAsync(
  IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
);
```

两种导入方式调用的是同一个模块。第一种适合只使用少量 API；第二种能更直观地体现 API 来源。

## 核心 API

### `startActivityAsync(activityAction, params?)`

```ts
IntentLauncher.startActivityAsync(
  activityAction,
  params?
): Promise<IntentLauncherResult>
```

启动能够处理指定 Action 的 Android Activity。

#### 参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `activityAction` | `string` | 要执行的 Android Action，可使用 `ActivityAction` 中的预定义常量 |
| `params` | `IntentLauncherParams` | 可选的 Intent 参数，默认值为 `{}` |

#### 返回时机

该方法返回 Promise，但它不是在 Activity 一打开时就代表整个交互完成。

文档明确说明：Promise 会在用户返回当前应用时完成，并返回 `IntentLauncherResult`。

```ts
const result = await IntentLauncher.startActivityAsync(
  IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
);

console.log(result.resultCode);
```

对于系统设置页面，用户是否真的修改了设置，不能简单地根据“成功打开页面”判断。

> **基于文档内容推导：** 用户返回应用后，如果业务依赖定位、通知或其他系统状态，应重新查询对应状态，而不是认为 `startActivityAsync` 已经替用户完成设置。

### `openApplication(packageName)`

```ts
IntentLauncher.openApplication(packageName): void
```

根据 Android 包名打开应用：

```ts
IntentLauncher.openApplication('com.google.android.gm');
```

该方法返回 `void`，文档没有说明它能够返回目标应用的执行结果，也没有说明目标应用不存在时的具体行为。

因此，不应把它当成类似 `await router.push()` 的可等待导航 API。

### `getApplicationIconAsync(packageName)`

```ts
IntentLauncher.getApplicationIconAsync(
  packageName
): Promise<string>
```

读取指定应用的图标，并返回 Base64 编码的 PNG Data URL：

```text
data:image/png;base64,...
```

示例：

```tsx
import { Image } from 'expo-image';
import * as IntentLauncher from 'expo-intent-launcher';

const icon = await IntentLauncher.getApplicationIconAsync(
  'com.google.android.gm'
);

<Image source={icon} />;
```

如果无法取得图标，Promise 会返回空字符串，而不是文档所描述的异常。

使用前应检查：

```ts
const icon = await IntentLauncher.getApplicationIconAsync(packageName);

if (icon) {
  // 显示图标
}
```

这与 React Web 中使用 `<img src="data:image/png;base64,...">` 类似，但示例目标组件是 `expo-image` 的 `Image`，不是浏览器 DOM 的 `<img>`。

## `IntentLauncherParams`

`IntentLauncherParams` 用于补充 Action 所需的目标、数据和参数。

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `category` | `string` | 进一步描述 Intent 的动作类别 |
| `className` | `string` | `ComponentName` 中目标原生组件的类名 |
| `data` | `string` | Intent 要处理的数据 URI |
| `extra` | `Record<string, any>` | 传给目标 Activity 的额外键值参数 |
| `flags` | `number` | 控制 Activity 启动行为的位掩码 |
| `packageName` | `string` | `ComponentName` 中目标应用的包名 |
| `type` | `string` | `data` 所表示数据的 MIME 类型 |

所有属性都是可选的。

### `data`

`data` 是目标 Action 要操作的 URI，例如指向某个资源或应用的 URI。

文档特别提醒：Android 要求 URI scheme 使用小写，即使正式 RFC 并没有同样的限制。

正确形式：

```text
package:com.example.app
```

容易出错的形式：

```text
PACKAGE:com.example.app
```

### `type`

`type` 是数据的 MIME 类型，例如：

```text
image/png
```

如果省略，Android 可以尝试根据 `data` 推断 MIME 类型。文档建议在希望 Android 自动推断时忽略该参数。

### `extra`

`extra` 是传递给目标 Activity 的附加键值数据：

```ts
{
  extra: {
    'com.example.app.SomeOption': true,
  },
}
```

文档明确要求 key 包含包名前缀。例如 `com.android.contacts` 应使用类似：

```text
com.android.contacts.ShowAll
```

而不是宽泛的：

```text
ShowAll
```

这与 Web 中向函数传递普通对象不同。Extras 是跨 Android 组件传输的数据，键名需要避免与其他应用或系统参数发生冲突。

### `flags`

`flags` 是数字形式的位掩码，用于控制 Activity 的启动和任务栈行为。

位掩码通常通过按位或组合：

```ts
const flags = FLAG_A | FLAG_B;
```

当前文档没有列出具体 Flag 常量及适用方式，只指向 Android 的 `Intent.setFlags` 文档。因此不能仅根据本页确定应该使用哪些数值。

### `packageName` 与 `className`

这两个字段用于显式指定处理 Intent 的组件。

文档明确建议：只有在确实想要显式设置处理组件时才设置 `packageName`。

> **基于文档内容推导：** 如果只希望系统选择合适的处理程序，通常应提供 Action 和必要数据，而不是无条件绑定某个包名或原生类名。显式绑定会增加对目标应用内部实现的依赖。

## 返回结果 `IntentLauncherResult`

`startActivityAsync` 返回：

```ts
interface IntentLauncherResult {
  resultCode: ResultCode;
  data?: string;
  extra?: object;
}
```

| 属性 | 说明 |
| --- | --- |
| `resultCode` | Activity 返回的结果码 |
| `data` | Activity 可选返回的数据 URI |
| `extra` | Activity 可选返回的附加数据 |

### `ResultCode`

| 枚举值 | 数值 | 含义 |
| --- | ---: | --- |
| `ResultCode.Success` | `-1` | Activity 操作成功 |
| `ResultCode.Canceled` | `0` | 操作被取消，例如用户点击返回按钮 |
| `ResultCode.FirstUser` | `1` | Activity 可使用的第一个自定义结果值 |

不要按照 JavaScript 常见习惯把正数理解为成功、负数理解为失败。Android 的成功值在这里是 `-1`。

可以使用枚举比较：

```ts
const result = await IntentLauncher.startActivityAsync(action);

switch (result.resultCode) {
  case IntentLauncher.ResultCode.Success:
    break;
  case IntentLauncher.ResultCode.Canceled:
    break;
}
```

文档没有保证所有系统设置 Activity 都会返回有业务意义的 `data`、`extra` 或结果状态。

## `ActivityAction`

`ActivityAction` 收录了大量 Android 设置 Action 常量。其来源包括 Android `Settings` Provider，以及部分 `com.android.settings.*` 设置组件。

常用类别包括：

| 类别 | 代表常量 |
| --- | --- |
| 通用设置 | `SETTINGS`、`APPLICATION_SETTINGS` |
| 当前应用设置 | `APPLICATION_DETAILS_SETTINGS`、`APP_NOTIFICATION_SETTINGS`、`APP_LOCALE_SETTINGS` |
| 网络与无线 | `WIRELESS_SETTINGS`、`WIFI_SETTINGS`、`BLUETOOTH_SETTINGS`、`NFC_SETTINGS` |
| 定位 | `LOCATION_SOURCE_SETTINGS`、`LOCATION_SCANNING_SETTINGS` |
| 通知 | `NOTIFICATION_SETTINGS`、`CHANNEL_NOTIFICATION_SETTINGS`、`NOTIFICATION_HISTORY` |
| 显示与声音 | `DISPLAY_SETTINGS`、`DARK_THEME_SETTINGS`、`SOUND_SETTINGS` |
| 电池与后台运行 | `BATTERY_SAVER_SETTINGS`、`IGNORE_BATTERY_OPTIMIZATION_SETTINGS` |
| 权限和特殊访问 | `MANAGE_OVERLAY_PERMISSION`、`MANAGE_UNKNOWN_APP_SOURCES`、`USAGE_ACCESS_SETTINGS` |
| 隐私与安全 | `PRIVACY_SETTINGS`、`SECURITY_SETTINGS`、`BIOMETRIC_ENROLL` |
| 存储 | `INTERNAL_STORAGE_SETTINGS`、`APP_STORAGE_SETTINGS`、`MANAGE_ALL_FILES_ACCESS_PERMISSION` |
| 辅助功能 | `ACCESSIBILITY_SETTINGS`、`CAPTIONING_SETTINGS`、`COLOR_INVERSION_SETTINGS` |
| 语言与输入 | `LOCALE_SETTINGS`、`LANGUAGE_SETTINGS`、`INPUT_METHOD_SETTINGS` |
| 勿扰模式 | `ZEN_MODE_SETTINGS`、`NOTIFICATION_POLICY_ACCESS_SETTINGS` |
| 系统面板 | `PANEL_WIFI`、`PANEL_NFC`、`PANEL_VOLUME`、`PANEL_INTERNET_CONNECTIVITY` |

其他预定义 Action 还覆盖：

- 账户、同步和添加账户
- 飞行模式、移动网络、漫游、VPN、热点和 SIM
- 生物识别、指纹、人脸、锁屏和凭据
- 画中画、悬浮窗、全屏 Intent 和精确闹钟
- 打印、投屏、媒体控制和音频共享
- 键盘、语音输入、文字转语音和用户词典
- 开发者选项、设备信息、备份和恢复出厂设置
- 无障碍颜色、动作、听力设备和文本阅读
- Android 新版本中的私密空间、卫星、区域偏好等设置

完整常量名和字符串值以 `expo-intent-launcher/src/IntentLauncher.ts` 为准。常量值主要采用以下形式：

```text
android.settings.*
android.settings.action.*
android.settings.panel.action.*
com.android.settings.*
com.android.settings.action.*
```

例如：

```ts
ActivityAction.WIFI_SETTINGS
// "android.settings.WIFI_SETTINGS"

ActivityAction.PANEL_WIFI
// "android.settings.panel.action.WIFI"

ActivityAction.APP_STORAGE_SETTINGS
// "com.android.settings.APP_STORAGE_SETTINGS"
```

文档只是列出了可用常量，没有逐项解释它们需要的参数、Android 版本要求和设备兼容性，也没有保证每个常量都能在所有 Android 设备上打开。

## 一个更完整的使用流程

下面的示例体现了实际开发时较合理的调用流程：

```ts
import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export async function openLocationSettings() {
  if (Platform.OS !== 'android') {
    return;
  }

  const result = await IntentLauncher.startActivityAsync(
    IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
  );

  if (
    result.resultCode === IntentLauncher.ResultCode.Canceled
  ) {
    console.log('用户返回了应用');
  }
}
```

完整业务流程通常是：

1. 检查当前平台是否为 Android。
2. 检查业务所需的系统状态。
3. 只有在需要用户修改设置时才展示说明。
4. 用户确认后调用 `startActivityAsync`。
5. 等待用户返回应用。
6. 重新检查系统状态。
7. 根据新的状态继续业务或再次提供说明。

其中第 1、2、3、6、7 步属于基于文档 API 行为推导出的应用层流程，不是本页提供的完整示例。

## 限制条件与容易踩坑的地方

### 仅支持 Android

所有方法、接口和枚举都标记为 Android 支持。

不要在共享代码中无条件调用：

```ts
if (Platform.OS === 'android') {
  await IntentLauncher.startActivityAsync(
    IntentLauncher.ActivityAction.WIFI_SETTINGS
  );
}
```

当前文档未说明 iOS 的替代 API。

### 当前页面不是稳定版文档

该页面属于下一版 SDK 的 `unversioned` 文档。页面明确建议需要最新稳定信息时查看 SDK 56 对应的最新版本文档。

项目实际使用的包版本可能不包含未发布文档中的全部 Action。开发时应以项目安装版本的类型声明和源代码为准。

### 打开设置不等于修改成功

`startActivityAsync` 负责启动 Activity。它不会自动修改系统设置，也不能保证用户完成目标操作。

用户可能：

- 进入设置后未做修改。
- 点击返回。
- 进入了设备厂商提供的不同页面。
- 无法访问某项受限制的设置。

### Action 可能需要配套参数

部分设置 Action 只描述页面类型，还需要通过 `data`、`extra`、`packageName` 等参数指定具体应用或资源。

当前文档没有逐项给出每个 `ActivityAction` 的参数要求。因此不能假设所有常量都像 `LOCATION_SOURCE_SETTINGS` 一样可以无参数调用。

### 设备和 Android 版本兼容性未说明

常量列表包含大量较新或较具体的系统页面，但文档没有提供最低 Android API Level、厂商适配情况或不可用时的行为。

> **基于经验建议：** 对关键跳转使用 `try/catch`，并在目标页面无法打开时提供用户可执行的文字说明或较通用的设置入口。

```ts
try {
  await IntentLauncher.startActivityAsync(
    IntentLauncher.ActivityAction.WIFI_SETTINGS
  );
} catch (error) {
  // 展示手动打开系统设置的说明
}
```

### 包名不是应用显示名称

`openApplication('Gmail')` 不符合 API 要求。必须传递实际包名：

```ts
IntentLauncher.openApplication(
  'com.google.android.gm'
);
```

文档没有提供根据显示名称查找包名的 API。

### Data URL 可能较大

`getApplicationIconAsync` 返回 Base64 字符串，而不是文件路径或网络 URL。

> **基于经验建议：** 不要在持久化状态或大型应用列表中无控制地重复保存 Base64 图标，否则可能增加内存和序列化开销。

## React Web 开发者最容易误解的地方

### 这不是浏览器导航

Intent 由 Android 操作系统处理，不属于 React Navigation，也不会在 React 组件树中渲染新页面。打开系统设置后，当前应用会进入后台；用户返回时应用重新进入前台。

### Promise 不代表权限或设置已经改变

Promise 完成只说明用户已经从目标 Activity 返回，并提供该 Activity 返回的结果。业务需要自行重新检查真实系统状态。

### `extra` 不是任意对象参数

虽然 TypeScript 类型是 `Record<string, any>`，但数据最终需要跨原生组件边界传输。目标 Activity 必须认识相应键名和值，且文档要求键名带包名前缀。

### Action 常量不是跨平台能力

`ActivityAction.WIFI_SETTINGS` 表示 Android 系统 Action，不是 Expo 抽象出的跨平台“打开 Wi-Fi 设置”接口。因此不能期待同一常量在 iOS 或 Web 上工作。

### 原生配置存在于 JavaScript 之外

包名、Activity 类名、Intent Flag 和 MIME 类型都属于 Android 原生平台契约。它们不像普通 React props 那样只由当前组件决定，必须与 Android 系统或目标应用支持的格式匹配。

## 文档明确说明与合理推导的边界

### 文档明确说明

- `expo-intent-launcher` 用于启动 Android Intent。
- 该库支持 Android，并包含在 Expo Go 中。
- 可以使用它打开特定系统设置页面。
- 普通 React Native 工程需要先安装 Expo Modules。
- `startActivityAsync` 在用户返回应用后完成 Promise。
- `openApplication` 根据包名打开应用。
- `getApplicationIconAsync` 返回带 PNG Data URL 前缀的 Base64 字符串，失败时返回空字符串。
- `data` 的 URI scheme 在 Android 中必须使用小写。
- `extra` 的 key 必须包含包名前缀。
- `packageName` 只应在需要显式设置处理组件时使用。
- `type` 可以省略，让 Android推断 MIME 类型。
- `ResultCode.Success`、`Canceled` 和 `FirstUser` 分别为 `-1`、`0` 和 `1`。

### 基于文档内容推导

- 用户从设置页面返回后，应重新检查真实系统状态。
- 共享代码应先进行 Android 平台判断。
- 显式设置包名和类名会增加对目标组件实现的依赖。
- Activity 的成功启动不代表用户完成了业务要求。
- 项目使用稳定 SDK 时，不应直接假设未发布文档中的所有常量均可用。

### 当前文档未涉及

- iOS 或 Web 的替代方案。
- 各 `ActivityAction` 对应的最低 Android 版本。
- 不同 Android 厂商设备的兼容性。
- 各 Action 所需参数的完整示例。
- 目标应用不存在或 Activity 无法解析时的明确错误类型。
- AndroidManifest 权限或 `<queries>` 配置要求。
- 如何检测某个 Intent 是否能被当前设备处理。
- 如何取得设备上所有已安装应用的包名。
- 自动化测试或模拟器测试方式。

## 总结

`expo-intent-launcher` 是 Expo 对 Android Intent 启动能力的封装。最直接的用途是从 React Native 应用打开 Android 系统设置，也可以启动指定应用、读取应用图标，并传递原生 Intent 参数。

实际使用时需要记住三个边界：

1. 它只支持 Android，不是跨平台导航 API。
2. 它负责打开目标 Activity，不负责替用户完成设置。
3. Action、URI、包名、Extras 和 Flags 都必须符合 Android 或目标应用定义的原生契约。

对于依赖系统设置的功能，可靠的实现方式是“检查状态、解释原因、打开设置、等待返回、重新检查”，而不是把 Intent 调用结果直接视为业务成功。

---

## 文档导航

- **上一页**：[imagepicker](./179__imagepicker.md)
- **下一页**：[keep awake](./181__keep-awake.md)
