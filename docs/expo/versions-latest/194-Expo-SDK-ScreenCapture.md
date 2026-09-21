# 194｜Expo SDK ScreenCapture 防止截图与录屏

**翻页：**[上一页：Expo SDK Print HTML 打印与 PDF](./193-Expo-SDK-Print.md) · [目录](./README.md) · [下一页：Expo SDK ScreenOrientation](./195-Expo-SDK-ScreenOrientation.md)

**官方页面：**[ScreenCapture · Latest](https://docs.expo.dev/versions/latest/sdk/screen-capture/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/screen-capture/)

**版本与平台：**Latest 推荐 `expo-screen-capture ~57.0.3`；SDK v56.0.0 推荐 `~56.0.5`。API 支持 Android 和 iOS，包含在 Expo Go 中。两版页面功能、平台边界和代码示例主题一致。

## 能做什么

`expo-screen-capture` 可以阻止屏幕截图 / 录屏，或在应用前台发现截图时通知应用。常见用途是登录凭据、支付信息或付费内容页面。不要把它理解为完整的 DRM 或万能防泄露机制；能否阻止取决于平台与系统版本。

- **保护截图 / 录屏：**`preventScreenCaptureAsync` 阻止捕获；`allowScreenCaptureAsync` 重新允许。也有与 React 组件生命周期绑定的 `usePreventScreenCapture`。
- **截图事件：**`addScreenshotListener` / `useScreenshotListener` 检测用户在应用前台截屏；它不是录屏事件监听器。
- **App Switcher 预览：**应用切到后台时保护最近任务预览中的敏感内容。iOS 可显示可调强度的模糊覆盖；Android 的截图保护会使用 `FLAG_SECURE`，最近任务中显示空白预览。
- **权限：**截图事件在 Android 依系统版本涉及媒体权限；阻止截图不等同于读取用户相册，不要因为调用保护 API 就无条件申请相册权限。iOS 的截图权限查询 / 请求始终返回 granted。

## 安装与平台权限

```sh
npx expo install expo-screen-capture
yarn expo install expo-screen-capture
pnpm expo install expo-screen-capture
bun expo install expo-screen-capture
```

如在已有 React Native 项目中安装，需先集成 `expo`。

Android 14 及以上，官方说明截图回调和阻止捕获均不需额外权限。截图监听所需权限随 Android 版本变化：API 详细说明为 Android 13 之前使用 `READ_EXTERNAL_STORAGE`、Android 13 使用 `READ_MEDIA_IMAGES`、之后无需额外权限；页面概述也提示 Android 13 及以下监听需要配置 `READ_MEDIA_IMAGES`。请按应用 target SDK、设备版本和实际 listener 行为核对 manifest，不能把该能力误当成全量相册读取授权。`READ_MEDIA_IMAGES` 只适用于确实需要广泛照片权限的应用，还要符合 Google Play 的照片 / 视频权限政策。

当需要配置 Android 权限时，Expo app config 的 `android.permissions` 对应合并进原生 manifest；改动后要重新构建原生 app：

```json
{
  "expo": {
    "android": {
      "permissions": ["READ_EXTERNAL_STORAGE", "READ_MEDIA_IMAGES"]
    }
  }
}
```

不要机械地给所有版本都加这两个权限；只在应用确需截图事件监听且目标系统要求时配置。

## 路由页面挂载期间保护

对特定页面，hook 会在组件挂载时启用捕获保护，并在卸载时解除。使用唯一 key 可以避免多个安全页面 / 命令相互覆盖：

```tsx
import { Text, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';

export function PrivatePaymentDetails() {
  usePreventScreenCapture('payment-details');

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text>敏感支付资料仅在此页面显示。</Text>
    </View>
  );
}
```

这是适合 Expo Router / React Navigation 屏幕的声明式写法：只要保护组件仍挂载，该 key 的捕获保护就有效。默认 key 是 `'default'`。

## 命令式开启与关闭

如果要由按钮或业务状态控制，可使用异步方法，并在拥有它的生命周期结束时用相同 key 解除：

```tsx
import { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

const protectionKey = 'secure-document';

export function ScreenCaptureControls() {
  const [protectedScreen, setProtectedScreen] = useState(false);

  async function enable() {
    await ScreenCapture.preventScreenCaptureAsync(protectionKey);
    setProtectedScreen(true);
  }

  async function disable() {
    await ScreenCapture.allowScreenCaptureAsync(protectionKey);
    setProtectedScreen(false);
  }

  useEffect(() => () => {
    if (protectedScreen) void ScreenCapture.allowScreenCaptureAsync(protectionKey);
  }, [protectedScreen]);

  return (
    <View style={styles.container}>
      <Button title="开启截图保护" onPress={() => void enable()} />
      <Button title="关闭截图保护" onPress={() => void disable()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
```

`preventScreenCaptureAsync(key)` 和 `allowScreenCaptureAsync(key)` 必须用同一个 key 配对。调用时没有传 key 会使用 `'default'`；多个 key 同时启用时，需逐个解除保护后才能恢复捕获。`allowScreenCaptureAsync` 未匹配到启用状态时不会报错。

## 监听截图事件与清理

事件监听只在 app 前台收到截图通知。下面的代码先查询 / 请求权限，通过后注册 listener；卸载时优先调用返回订阅的 `remove()`：

```tsx
import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';

export function ScreenshotNotice() {
  useEffect(() => {
    let cancelled = false;
    let subscription: ReturnType<typeof ScreenCapture.addScreenshotListener> | undefined;

    async function listen() {
      const current = await ScreenCapture.getPermissionsAsync();
      const permission = current.granted
        ? current
        : await ScreenCapture.requestPermissionsAsync();

      if (cancelled) return;
      if (!permission.granted) {
        console.warn('没有截图监听权限');
        return;
      }

      subscription = ScreenCapture.addScreenshotListener(() => {
        console.info('检测到用户在前台截屏');
      });
    }

    void listen().catch(error => console.warn('注册截图监听失败', error));
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return null;
}
```

在 Android 14 及以上，listener 按页面说明无需额外权限；iOS 权限 API 总是返回 granted。截图 listener 只报告用户截图事件，不能拦截该动作。

### 用权限 hook 与截图 hook

`usePermissions()` 会返回当前权限、请求函数和查询函数；`useScreenshotListener` 在 hook 所属组件挂载时开始监听，卸载后自动停止：

```tsx
import * as ScreenCapture from 'expo-screen-capture';

function CapturePermissionStatus() {
  const [permission, requestPermission, getPermission] = ScreenCapture.usePermissions();

  ScreenCapture.useScreenshotListener(() => {
    console.info('当前页面检测到截图');
  });

  return (
    <PermissionPanel
      status={permission?.status ?? 'unknown'}
      onRequest={requestPermission}
      onRefresh={getPermission}
    />
  );
}
```

`PermissionPanel` 是应用自己的 UI。权限 hook 的选项类型为 `PermissionHookOptions<object>`；返回 tuple 分别对应 response / request / get。

## iOS App Switcher 隐私覆盖

iOS 可以对最近任务卡片、后台快照、系统中断期间添加模糊覆盖；`blurIntensity` 范围为 0 到 1，默认 0.5。应用恢复前台后覆盖会自动移除；需要结束整段保护时，可调用 `disableAppSwitcherProtectionAsync()`：

```tsx
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

export function usePrivateAppPreview() {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void ScreenCapture.enableAppSwitcherProtectionAsync(0.7);
    return () => {
      void ScreenCapture.disableAppSwitcherProtectionAsync();
    };
  }, []);
}
```

## API 速查

| API | 平台 | 用途 |
| --- | --- | --- |
| `usePreventScreenCapture(key?)` | Android、iOS | 组件挂载期间阻止截图 / 录屏，卸载后释放；默认 key 为 `'default'`。 |
| `preventScreenCaptureAsync(key?)` | Android、iOS | 命令式阻止捕获，直到配对 allow 或应用重启。iOS 录屏要求 iOS 11+、截图要求 iOS 13+；更旧系统不执行。 |
| `allowScreenCaptureAsync(key?)` | Android、iOS | 解除匹配 key 的捕获保护。 |
| `usePermissions(options?)` | Android、iOS | hook 形式检查 / 请求截图检测权限，返回 `[response, requestPermission, getPermission]`。 |
| `getPermissionsAsync()` / `requestPermissionsAsync()` | Android、iOS | 查询 / 请求截图检测权限；iOS 始终返回 granted。 |
| `isAvailableAsync()` | Android、iOS | 查询当前设备是否有 Screen Capture API，返回 `Promise<boolean>`。 |
| `useScreenshotListener(listener)` | Android、iOS | 组件挂载期间监听截图，卸载自动停止。 |
| `addScreenshotListener(listener)` | Android、iOS | 监听 app 前台截图，返回 `EventSubscription`。Android 权限按系统版本处理。 |
| `subscription.remove()` | Android、iOS | 从事件 emitter 移除监听器。 |
| `removeScreenshotListener(subscription)` | Android、iOS，已弃用 | 旧式移除函数；改用 `subscription.remove()`。 |
| `enableAppSwitcherProtectionAsync(blurIntensity?)` | iOS | 显示应用切到后台或系统中断时的模糊隐私层，默认强度 0.5。 |
| `disableAppSwitcherProtectionAsync()` | iOS | 关闭此前启用的模糊保护。 |

`PermissionResponse` 包含 `canAskAgain`、`expires`、`granted` 和 `status`。`PermissionStatus` 是 `denied`、`granted`、`undetermined` 之一。若不可再次请求权限，应引导用户前往系统设置。

## 测试与限制

- Android 模拟器可在终端运行 `adb shell input keyevent 120` 触发截图；iOS Simulator 使用菜单栏 `Device > Trigger Screenshot`。
- Android 14+ 不需要截图监听权限；Android 较早版本应按 API 文档的系统版本表配置权限。页面概览的 Android 13-or-lower 权限描述与 listener API 细表的版本拆分略有差异，项目配置前要按实际目标 SDK 确认。
- iOS `preventScreenCaptureAsync` 的防护能力依系统版本：低于 iOS 11 的录屏和低于 iOS 13 的截图不受该方法保护。
- 截图保护不是访问控制。敏感数据仍应遵循最少展示、及时清除和服务端授权等应用安全设计。

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐依赖 | `expo-screen-capture ~57.0.3` | `~56.0.5` |
| 平台 / Expo Go | Android、iOS；Expo Go 可用 | 相同 |
| Hook、方法、类型和权限边界 | 与 v56 页面一致 | 与 Latest 页面一致 |
| 官方页脚 Next | ScreenOrientation | ScreenOrientation |

## 官方源页代码主题覆盖

- 安装命令：覆盖 npx、Yarn、pnpm、Bun 四种命令。
- Hook 示例：重写 `usePreventScreenCapture` 的组件挂载期间保护。
- Imperative 示例：覆盖 `preventScreenCaptureAsync` / `allowScreenCaptureAsync` 配对 key、按钮控制和布局。
- Screenshot callback 示例：覆盖权限查询 / 请求、注册前台截图 listener、无权限分支和卸载 `subscription.remove()`。
- API `usePermissions()` 示例：列出 response / request / get 三个返回位；同时覆盖 `useScreenshotListener` 生命周期自动清理。
- 另增加 app config 权限、iOS app-switcher 模糊层用法；原文没有额外 runnable 代码示例，扩展示例用来解释文档列出的配置与 API。
- 源页没有 Expo config plugin 配置代码；权限设置依 `android.permissions` manifest 合并项说明。

**翻页：**[上一页：Expo SDK Print HTML 打印与 PDF](./193-Expo-SDK-Print.md) · [目录](./README.md) · [下一页：Expo SDK ScreenOrientation](./195-Expo-SDK-ScreenOrientation.md)
