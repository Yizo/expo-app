# Expo ScreenCapture 学习指南

`expo-screen-capture` 是 Expo 提供的屏幕隐私保护库，用于：

- 阻止用户截取应用截图或录制屏幕。
- 监听应用在前台运行时发生的截图行为。
- 在 iOS 应用失去焦点时，通过模糊层隐藏敏感内容。

支持 Android 和 iOS，并包含在 Expo Go 中。

> 当前页面记录的是“下一版本 SDK”的 API，不是稳定版 SDK 56 文档。实际项目应根据所使用的 Expo SDK 版本查阅对应文档。

## 文档解决的问题

这个库主要应对两类场景：

1. 页面正在展示密码、信用卡数据等敏感信息。
2. 页面正在展示不希望被录制、传播的付费内容。

Android 尤其需要注意：第三方应用可以通过 `android.media.projection` API 捕获或共享屏幕，即使被捕获的应用处于后台。

对于 React Web 开发者，可以将它理解为一种操作系统级的隐私控制。它不是通过 CSS 隐藏元素，也不是拦截浏览器事件，而是调用 Android 和 iOS 的原生能力控制截图、录屏及系统任务预览。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-screen-capture

# yarn
yarn expo install expo-screen-capture

# pnpm
pnpm expo install expo-screen-capture

# bun
bun expo install expo-screen-capture
```

`expo install` 与普通 `npm install` 的主要区别是：它会根据当前 Expo SDK 选择兼容的软件包版本。

如果项目是已有的非 Expo React Native 工程，还需要先按照 Expo Modules 的安装流程将 `expo` 集成进项目。仅安装 `expo-screen-capture` 并不一定足够。

当前文档没有涉及：

- iOS 原生工程的手动配置步骤。
- Android 原生工程的完整接入流程。
- Web 平台支持。
- Config Plugin 配置。
- EAS Build 或应用商店发布流程。

## 三种核心能力

### 阻止截图和录屏

可以使用 Hook：

```jsx
import { usePreventScreenCapture } from 'expo-screen-capture';
import { Text, View } from 'react-native';

export default function ScreenCaptureExample() {
  usePreventScreenCapture();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>
        只要这个组件仍然挂载，当前应用就会阻止截图和录屏。
      </Text>
    </View>
  );
}
```

`usePreventScreenCapture()` 的保护范围与组件生命周期绑定：

- 组件挂载时启用保护。
- 组件卸载时结束该组件申请的保护。

这与 React Web 中在 `useEffect` 内注册资源，并在清理函数中释放资源的模式相似。不过，这里管理的是原生系统的屏幕捕获状态，而不是 DOM 或浏览器事件。

适合在敏感页面组件中使用，例如支付详情页、身份认证页或付费内容页。

### 命令式控制

如果保护状态不完全由组件是否存在决定，可以直接调用异步方法：

```jsx
import * as ScreenCapture from 'expo-screen-capture';
import { Button, StyleSheet, View } from 'react-native';

export default function ScreenCaptureExample() {
  const activate = async () => {
    await ScreenCapture.preventScreenCaptureAsync();
  };

  const deactivate = async () => {
    await ScreenCapture.allowScreenCaptureAsync();
  };

  return (
    <View style={styles.container}>
      <Button title="Activate" onPress={activate} />
      <Button title="Deactivate" onPress={deactivate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

这里的 `Button`、`View` 和 `StyleSheet` 都是 React Native 组件或 API，不是 HTML 元素：

- `View` 类似于布局容器，但不是 `<div>`。
- `Button` 的点击回调是 `onPress`，不是 `onClick`。
- `StyleSheet.create()` 用 JavaScript 对象定义原生样式，不使用 CSS 文件。

`preventScreenCaptureAsync()` 会持续阻止截图和录屏，直到出现以下情况之一：

- 调用匹配的 `allowScreenCaptureAsync()`。
- 应用重新启动。

如果尚未启用保护，调用 `allowScreenCaptureAsync()` 不会产生效果。

### 监听截图

应用可以监听其处于前台期间发生的截图：

```jsx
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';

export default function useScreenCaptureCallback() {
  const hasPermissions = async () => {
    const { status } = await ScreenCapture.requestPermissionsAsync();
    return status === 'granted';
  };

  useEffect(() => {
    let subscription;

    const addListenerAsync = async () => {
      if (await hasPermissions()) {
        subscription = ScreenCapture.addScreenshotListener(() => {
          alert('检测到截图');
        });
      } else {
        console.error('缺少监听截图所需的权限');
      }
    };

    addListenerAsync();

    return () => {
      subscription?.remove();
    };
  }, []);
}
```

这里必须区分两个概念：

- **阻止截图或录屏**：控制是否允许捕获屏幕。
- **监听截图**：在截图发生后收到通知。

权限要求主要影响“监听截图”，不等于阻止截图也总要申请相册权限。

监听器返回一个订阅对象。组件卸载时应调用 `subscription.remove()`，否则监听器可能继续存在或被重复注册。

## Android 权限要求

### Android 14 及以上

文档明确说明：

- 截图回调不需要额外权限。
- 阻止屏幕捕获不需要申请或检查权限。
- 使用截图回调也不需要申请或检查权限。

### Android 13 及以下

页面开头说明：若要监听截图，需要在 `AndroidManifest.xml` 中加入 `READ_MEDIA_IMAGES`，Expo 项目可以通过应用配置中的 `android.permissions` 添加。

概念上，`AndroidManifest.xml` 相当于 Android 应用向操作系统声明能力和权限的核心配置文件。使用 Expo 配置时，通常不直接编辑该文件，而是由 Expo 根据应用配置生成原生内容。

但需要特别注意：当前页面内部存在权限描述不一致的问题。

- 页面开头将 Android 13 及以下统一描述为需要 `READ_MEDIA_IMAGES`。
- `addScreenshotListener()` 的 API 说明则写明：
  - Android 13 以前需要 `READ_EXTERNAL_STORAGE`。
  - Android 13 使用 `READ_MEDIA_IMAGES`。
  - Android 13 以后不需要额外权限。

因此，不能直接认为所有 Android 13 以下版本都应该声明 `READ_MEDIA_IMAGES`。实际实现时，应结合项目的目标 Android 版本、对应 Expo SDK 版本及稳定版权限文档确认。

另外，Google Play 对照片和视频权限有用途限制。`READ_MEDIA_IMAGES` 只能用于确实需要广泛访问照片的应用。仅为了监听截图而添加该权限，可能受到 Google Play 权限政策影响。

> 基于文档内容推导：如果监听截图不是业务必需能力，应谨慎为旧版 Android 添加广泛照片访问权限，以免增加审核风险。

### iOS 权限行为

在 iOS 上，截图检测不要求额外权限：

- `getPermissionsAsync()` 始终返回已授权。
- `requestPermissionsAsync()` 也始终返回已授权。

这不代表相关 API 在所有 iOS 版本上都一定有效。权限状态与系统版本是否支持某项能力是两个不同问题。

## Hook API

### `usePreventScreenCapture(key?)`

```js
ScreenCapture.usePreventScreenCapture(key);
```

只要调用它的组件处于挂载状态，就会阻止截图和录屏。

可选参数：

| 参数 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `key` | `string` | `'default'` | 标识当前保护请求，防止多个组件或方法调用相互干扰 |

当多个组件都可能申请屏幕保护时，建议为每个调用方使用不同的 `key`。

```jsx
usePreventScreenCapture('payment-page');
```

### `useScreenshotListener(listener)`

```js
ScreenCapture.useScreenshotListener(() => {
  console.log('检测到截图');
});
```

该 Hook 会自动：

- 在组件挂载时开始监听。
- 在组件卸载时停止监听。

回调函数不接收截图文件、图片路径或截图内容，只表示检测到了一次截图。

### `usePermissions(options?)`

```js
const [permission, requestPermission, getPermission] =
  ScreenCapture.usePermissions();
```

它封装了：

- `getPermissionsAsync()`：查询权限。
- `requestPermissionsAsync()`：申请权限。

返回值包括当前权限状态、申请权限的方法和重新查询权限的方法。

`options` 的类型为 `PermissionHookOptions<object>`。当前文档未进一步解释其具体配置字段。

## 命令式 API

### `preventScreenCaptureAsync(key?)`

```js
await ScreenCapture.preventScreenCaptureAsync('payment-page');
```

启用截图和录屏保护。

重复使用同一个 `key` 调用时不会重复增加保护；使用新的唯一 `key` 则会增加一项独立的保护请求。

要恢复屏幕捕获，需要释放所有仍然生效的 `key`：

```js
await ScreenCapture.preventScreenCaptureAsync('payment-page');
await ScreenCapture.preventScreenCaptureAsync('premium-content');

await ScreenCapture.allowScreenCaptureAsync('payment-page');
// premium-content 仍未释放，所以屏幕捕获仍然被阻止

await ScreenCapture.allowScreenCaptureAsync('premium-content');
// 所有保护请求均已释放
```

在 iOS 上：

- 阻止录屏要求 iOS 11 及以上。
- 阻止截图要求 iOS 13 及以上。
- 更早的 iOS 版本调用该方法不会产生效果。

### `allowScreenCaptureAsync(key?)`

```js
await ScreenCapture.allowScreenCaptureAsync('payment-page');
```

解除对应 `key` 建立的保护。

传入的 `key` 必须与启用保护时使用的值一致。否则，原有保护不会被解除。

如果没有传入 `key`，则使用默认值 `'default'`。

### `isAvailableAsync()`

```js
const available = await ScreenCapture.isAvailableAsync();
```

检查当前设备是否支持 Screen Capture API，返回 `Promise<boolean>`。

> 基于文档内容推导：如果应用需要兼容较旧的 iOS 系统或复杂设备环境，可以在调用保护能力前先检查可用性，并为不支持的设备准备降级行为。

当前文档未说明“不支持”时应该采用哪种具体降级方案。

### `getPermissionsAsync()`

```js
const permission = await ScreenCapture.getPermissionsAsync();
```

查询截图检测权限，返回 `PermissionResponse`。

此权限针对的是检测截图，不是启用屏幕捕获保护。

### `requestPermissionsAsync()`

```js
const permission = await ScreenCapture.requestPermissionsAsync();
```

请求截图检测所需权限。

在 Android 旧版本上，请求之前仍需要确保对应权限已经声明在原生配置中。运行时调用权限 API不能代替 Manifest 中的权限声明。

## 截图事件订阅

### `addScreenshotListener(listener)`

```js
const subscription = ScreenCapture.addScreenshotListener(() => {
  console.log('用户截取了屏幕');
});
```

只有应用处于前台时，监听器才会响应截图事件。

返回值是 `EventSubscription`，可以用来取消监听：

```js
subscription.remove();
```

监听回调不接收参数，因此不能通过这个 API直接获得：

- 截图图片。
- 截图保存路径。
- 截图涉及的具体页面区域。
- 截图者身份。

当前文档也没有说明截图事件能否被取消、拦截或删除。该能力应理解为“收到通知”，而不是“撤销已经发生的截图”。

### `removeScreenshotListener(subscription)`

```js
ScreenCapture.removeScreenshotListener(subscription);
```

该方法已经弃用。应改用：

```js
subscription.remove();
```

新代码不应继续依赖已弃用的方法。

## iOS 应用切换器隐私保护

### 为什么需要单独保护

即使用户没有主动截图，iOS 也可能为以下系统界面生成应用画面快照：

- 应用切换器预览。
- 应用进入后台时的快照。
- 来电、Siri、控制中心等中断期间的画面。

如果当前页面包含敏感信息，这些系统预览也可能造成信息暴露。

### `enableAppSwitcherProtectionAsync(blurIntensity?)`

```js
await ScreenCapture.enableAppSwitcherProtectionAsync(0.7);
```

该方法仅支持 iOS。

它会在应用失去焦点时添加隐私模糊层，并在应用重新变为活跃状态时自动移除。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `blurIntensity` | `number` | `0.5` | 模糊强度，范围为 `0.0` 到 `1.0` |

- `0.0` 表示不模糊。
- `1.0` 表示最大模糊程度。

### `disableAppSwitcherProtectionAsync()`

```js
await ScreenCapture.disableAppSwitcherProtectionAsync();
```

关闭此前启用的 iOS 应用切换器隐私模糊层。

Android 没有对应的独立方法。调用 `preventScreenCaptureAsync()` 后，Android 会通过 `FLAG_SECURE` 自动保护最近任务预览，并显示空白画面。

对于 React Web 开发者，这类似于浏览器标签页失去焦点时覆盖一个遮罩层，但实际实现位于原生系统层，并会影响系统生成的应用预览。

## 权限返回值

`PermissionResponse` 包含以下字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `status` | `PermissionStatus` | 当前权限状态 |
| `granted` | `boolean` | 是否已授权的便捷布尔值 |
| `canAskAgain` | `boolean` | 是否还能再次向用户发起权限请求 |
| `expires` | `PermissionExpiration` | 权限过期时间 |

`status` 可能为：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未选择 |

如果 `canAskAgain` 为 `false`，应用不能继续通过系统弹窗申请该权限，需要引导用户进入系统设置修改。

当前文档没有说明 `PermissionExpiration` 的具体可能值。

## 测试方法

### Android Emulator

在单独的终端中执行：

```sh
adb shell input keyevent 120
```

该命令会向 Android 模拟器发送截图按键事件。

`adb` 是 Android Debug Bridge，即开发机与 Android 设备或模拟器通信的命令行工具。使用前需要安装并配置 Android 开发工具。

### iOS Simulator

从模拟器菜单选择：

```text
Device > Trigger Screenshot
```

测试时应分别验证：

- 截图是否被正确阻止。
- 录屏是否被正确阻止。
- 截图监听器是否触发。
- 组件卸载后监听器是否停止。
- 应用进入后台后，系统任务预览是否隐藏敏感内容。
- Android 不同系统版本下的权限行为。

最后一项属于基于文档内容推导出的测试范围，因为 Android 权限规则随系统版本变化。

## 容易踩坑的地方

### 把阻止截图与监听截图混为一谈

这是最容易误解的地方。

阻止捕获通常不需要截图检测权限；监听截图在旧版 Android 上可能需要媒体或存储权限。不要因为使用了 `preventScreenCaptureAsync()`，就无条件申请照片访问权限。

### 多个保护调用使用了错误的 `key`

如果使用以下方式启用保护：

```js
await ScreenCapture.preventScreenCaptureAsync('checkout');
```

就必须用相同的 `key` 解除：

```js
await ScreenCapture.allowScreenCaptureAsync('checkout');
```

使用默认值或其他字符串不会释放 `checkout` 对应的保护。

### 仍有其他保护请求未释放

屏幕捕获采用按 `key` 管理的多请求机制。只释放一个 `key`，不代表全局保护一定关闭。

这在多个页面、弹窗或业务模块同时调用 API 时尤其重要。

### 忘记取消事件订阅

使用 `addScreenshotListener()` 时，应在组件卸载或功能关闭时调用：

```js
subscription.remove();
```

如果希望自动绑定 React 生命周期，可以优先使用 `useScreenshotListener()`。

### 认为监听器可以获得截图文件

监听回调没有参数，只通知“发生了截图”。当前 API 没有提供截图内容，也没有说明可以删除或修改用户保存的截图。

### 忽略应用切换器中的敏感画面

在 iOS 上，阻止普通截图并不等于已经配置应用切换器模糊层。若后台预览也需要隐藏，应明确调用 `enableAppSwitcherProtectionAsync()`。

### 将 Expo Go 支持等同于生产构建无需验证

文档说明该库包含在 Expo Go 中，但生产应用仍会受到操作系统版本、原生权限声明和应用商店政策的影响。

> 基于经验建议：最终验证应在真实 Android 和 iOS 设备以及生产构建中完成，不能只依赖 Expo Go 或模拟器结果。

## 实际开发中的使用方式

一个清晰的业务划分可以是：

- 页面整个生命周期都敏感：使用 `usePreventScreenCapture(key)`。
- 根据用户操作动态切换保护：使用 `preventScreenCaptureAsync()` 和 `allowScreenCaptureAsync()`。
- 需要记录或提示截图行为：使用 `useScreenshotListener()` 或 `addScreenshotListener()`。
- iOS 后台预览也必须隐藏：使用应用切换器保护 API。
- 面向旧版 Android 提供截图监听：确认对应权限及 Google Play 政策后再接入。

建议让每个业务模块使用稳定且明确的 `key`：

```js
const SCREEN_CAPTURE_KEYS = {
  PAYMENT: 'payment',
  IDENTITY: 'identity',
  PREMIUM_CONTENT: 'premium-content',
};
```

这是基于经验的工程组织建议，不是当前文档规定的必要写法。它可以减少字符串不一致导致保护无法解除的问题。

## 总结

`expo-screen-capture` 提供了三组相互关联但用途不同的能力：

1. 通过 Hook 或异步方法阻止截图和录屏。
2. 监听应用处于前台时发生的截图。
3. 在 iOS 应用失去焦点时模糊敏感画面。

实际开发中最需要注意的是：

- 截图保护与截图监听不是同一能力。
- Android 截图监听的权限要求随系统版本变化。
- `key` 必须成对、完整地申请和释放。
- 手动注册的监听器必须取消订阅。
- iOS 旧版本对截图和录屏保护的支持不同。
- `READ_MEDIA_IMAGES` 受到 Google Play 权限政策限制。
- 当前页面属于下一版本 SDK 文档，并且其中旧版 Android 权限描述存在不一致，实施时需要结合项目实际 SDK 文档核对。

---

## 文档导航

- **上一页**：[print](./200__print.md)
- **下一页**：[screen orientation](./202__screen-orientation.md)
