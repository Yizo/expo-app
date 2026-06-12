# Expo Brightness：获取与控制设备屏幕亮度

> 本文对应 Expo **下一 SDK 版本**的未发布文档。原文注明当前最新稳定文档为 **SDK 56**。实际项目应优先查阅与项目 Expo SDK 版本一致的文档。

`expo-brightness` 是 Expo 提供的屏幕亮度 API，可以读取或修改设备主屏幕的亮度。

支持平台：

- Android
- iOS
- Expo Go

不支持 Web。因此，即使代码可以放在跨平台 React Native 项目中，也需要避免在 Web 环境直接调用相关 API。

## 文档解决的问题

该模块主要用于以下需求：

- 获取当前屏幕亮度。
- 临时修改当前应用显示期间的亮度。
- 在 Android 上读取或修改系统全局亮度。
- 在 Android 上切换自动亮度和手动亮度模式。
- 检查或申请修改系统亮度所需的权限。
- 在 iOS 上监听文档所描述的亮度更新事件。

适合的实际场景包括二维码展示、阅读器、相机辅助界面、视频播放器等需要临时提高或降低亮度的移动端功能。

当前文档未涉及：

- Web 浏览器亮度控制。
- 根据环境光传感器自行计算亮度。
- React Native 原生模块的内部实现。
- 后台运行时持续控制亮度。
- 多屏幕或外接显示器的亮度控制。

## 阅读前需要理解的概念

### Activity

Android 的 `Activity` 可以近似理解为一个原生页面容器。React Native 应用的界面通常运行在某个 Activity 中。

因此，“修改当前 Activity 的亮度”并不等于修改整个手机的系统亮度：它只是在当前应用位于前台时覆盖系统亮度。

### 应用亮度与系统亮度

Android 同时存在两层亮度值：

- **系统全局亮度**：整个设备默认使用的亮度。
- **当前应用亮度**：当前 Activity 可以临时覆盖系统亮度。

对应 API：

| 目标 | 主要 API | 平台 |
| --- | --- | --- |
| 当前屏幕或应用亮度 | `getBrightnessAsync()`、`setBrightnessAsync()` | Android、iOS |
| 系统全局亮度 | `getSystemBrightnessAsync()`、`setSystemBrightnessAsync()` | 仅 Android |

iOS 不允许应用通过此 API永久修改系统亮度。应用设置的亮度会持续到设备锁屏或关机，此后恢复为用户的默认设置。

### 自动亮度与手动亮度

Android 系统亮度具有模式：

- `AUTOMATIC`：操作系统根据环境光自动调节。
- `MANUAL`：亮度保持固定，不再由操作系统自动调节。
- `UNKNOWN`：当前模式无法确定。

调用 `setSystemBrightnessAsync()`不仅会修改全局亮度，还会把系统亮度模式切换为 `MANUAL`。

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install expo-brightness

# yarn
yarn expo install expo-brightness

# pnpm
pnpm expo install expo-brightness

# bun
bun expo install expo-brightness
```

`expo install` 与普通的 `npm install` 类似，但它会为当前 Expo SDK 选择兼容的软件包版本。

如果是在已有的原生 React Native 项目中使用，而不是标准 Expo 项目，需要先安装并配置 `expo` 模块支持。

## Android 原生配置

如果项目不使用 Continuous Native Generation（CNG），或者手动维护 Android 原生工程，需要在 `AndroidManifest.xml` 中加入：

```xml
<uses-permission android:name="android.permission.WRITE_SETTINGS" />
```

`AndroidManifest.xml` 是 Android 应用声明权限和原生组件的配置文件，可以类比为 Web 项目构建配置与权限声明的结合体，但它最终会被编译进原生应用。

对于由 Expo 配置生成原生工程的项目，则需要在 `app.json` 的 `expo.android.permissions` 中声明：

```json
{
  "expo": {
    "android": {
      "permissions": ["WRITE_SETTINGS"]
    }
  }
}
```

`WRITE_SETTINGS` 允许应用读取或写入 Android 系统设置。只修改当前 Activity 亮度和修改系统全局亮度是不同操作；全局系统亮度操作需要相应权限。

iOS 不需要额外权限配置。

## 基本使用流程

```jsx
import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Brightness from 'expo-brightness';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();

      if (status === 'granted') {
        await Brightness.setSystemBrightnessAsync(1);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Brightness Module Example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

该示例的执行过程是：

1. 组件挂载后执行 `useEffect`。
2. 请求访问系统亮度的权限。
3. 权限状态为 `granted` 时，将 Android 系统全局亮度设置为 `1`，即最大亮度。

这里使用异步立即执行函数，是因为 `useEffect` 的回调本身不应直接声明为 `async`。

需要特别注意：示例调用的是 `setSystemBrightnessAsync()`，这是仅 Android 支持的全局操作。跨平台应用不能不加判断地照搬该示例。

## 权限处理

### 使用 Hook

```ts
const [permissionResponse, requestPermission, getPermission] =
  Brightness.usePermissions();
```

`usePermissions()` 封装了权限查询和申请流程，返回：

- 当前权限响应；初始化期间可能为 `null`。
- 请求权限的方法。
- 重新查询权限的方法。

它适合在 React 组件中根据权限状态渲染不同界面。

### 使用普通方法

```ts
const currentPermission = await Brightness.getPermissionsAsync();
const requestedPermission = await Brightness.requestPermissionsAsync();
```

- `getPermissionsAsync()`：只检查当前权限，不主动弹出申请流程。
- `requestPermissionsAsync()`：向用户申请权限。

权限结果 `PermissionResponse` 包含：

| 字段 | 含义 |
| --- | --- |
| `status` | `granted`、`denied` 或 `undetermined` |
| `granted` | 是否已经获得权限的便捷布尔值 |
| `canAskAgain` | 是否还可以再次向用户申请 |
| `expires` | 权限过期时间；当前权限均为永久授权 |

当 `canAskAgain` 为 `false` 时，文档建议引导用户前往系统设置手动开启或关闭权限。

## 亮度读写 API

### 获取当前屏幕亮度

```ts
const brightness = await Brightness.getBrightnessAsync();
```

返回 `0` 到 `1` 之间的数字：

- `0`：最低亮度。
- `1`：最高亮度。
- `0.5`：范围中间值。

这里使用的是归一化数值，而不是 CSS 百分比或 `0` 到 `255` 的颜色通道值。

### 设置当前应用亮度

```ts
await Brightness.setBrightnessAsync(0.8);
```

参数必须在 `0` 到 `1` 之间。

平台行为存在明显差异：

- Android：只修改当前 Activity 的亮度；应用在前台时覆盖系统亮度。
- iOS：修改持续到设备锁屏，之后恢复为用户默认亮度。

### Android 系统全局亮度

```ts
const systemBrightness =
  await Brightness.getSystemBrightnessAsync();

await Brightness.setSystemBrightnessAsync(0.8);
```

这两个方法仅支持 Android。

设置系统亮度：

- 会影响系统全局亮度。
- 需要系统亮度权限。
- 会将亮度模式切换为 `MANUAL`。

因此，若需求只是让二维码页面临时变亮，通常应优先考虑 `setBrightnessAsync()`，避免永久改变用户的系统偏好。

> **基于文档内容推导：** 临时页面效果与全局系统设置属于不同影响范围。选择 API 时应以“是否需要影响应用之外的界面”为判断依据。

### 恢复使用系统亮度

```ts
await Brightness.restoreSystemBrightnessAsync();
```

仅支持 Android。它会取消当前 Activity 对系统亮度的覆盖，使当前应用重新使用系统全局亮度值。

这不是“恢复之前保存的某个数值”，而是停止覆盖系统亮度。

### 判断是否正在使用系统亮度

```ts
const isUsingSystem =
  await Brightness.isUsingSystemBrightnessAsync();
```

仅支持 Android：

- `true`：当前 Activity 使用系统全局亮度。
- `false`：当前 Activity 使用自己的覆盖值。

## Android 亮度模式

### 获取模式

```ts
const mode = await Brightness.getSystemBrightnessModeAsync();
```

该方法仅支持 Android，并且需要系统亮度权限。

### 设置模式

```ts
await Brightness.setSystemBrightnessModeAsync(
  Brightness.BrightnessMode.AUTOMATIC
);
```

允许设置的值只有：

```ts
Brightness.BrightnessMode.AUTOMATIC
Brightness.BrightnessMode.MANUAL
```

不能将模式设置为 `UNKNOWN`。传入该值或其他非法参数会产生 `ERR_INVALID_ARGUMENT`。

## 检查 API 可用性

```ts
const available = await Brightness.isAvailableAsync();
```

该方法判断当前设备是否启用了 Brightness API，但**不会检查应用权限**。

因此：

- `available === true` 不代表已经获得修改系统亮度的权限。
- 需要权限的操作仍应检查或申请权限。
- 当前文档说明该方法只在 Android 和 iOS 上返回 `true`。

## iOS 事件监听

```ts
const subscription = Brightness.addBrightnessListener(event => {
  console.log(event.brightness);
});

// 不再需要监听时
subscription.remove();
```

事件对象结构如下：

```ts
type BrightnessEvent = {
  brightness: number;
};
```

`brightness` 同样位于 `0` 到 `1` 之间。

该监听器仅在 iOS 上实际触发；Web 和 Android 上事件不会触发。原文进一步说明，该事件会在电源模式切换时触发。使用时不能假设它会在 Android 上提供实时亮度变化通知。

React 组件中应在 effect 清理函数里取消订阅：

```tsx
useEffect(() => {
  const subscription = Brightness.addBrightnessListener(event => {
    console.log(event.brightness);
  });

  return () => subscription.remove();
}, []);
```

## 错误码

| 错误码 | 含义 |
| --- | --- |
| `ERR_BRIGHTNESS` | 获取或设置应用亮度时发生错误 |
| `ERR_BRIGHTNESS_MODE` | 获取或设置系统亮度模式失败，可检查异常的 `nativeError` |
| `ERR_BRIGHTNESS_PERMISSIONS_DENIED` | 未获得系统亮度权限，却尝试设置系统亮度 |
| `ERR_BRIGHTNESS_SYSTEM` | 获取或设置系统全局亮度时发生错误 |
| `ERR_INVALID_ARGUMENT` | 参数无效，例如设置了不允许的亮度模式 |

> **基于经验建议：** 亮度修改属于原生异步操作，生产代码应使用 `try/catch` 处理权限拒绝、非法参数和设备执行失败，而不是只判断一次权限状态。

## 限制条件与常见坑点

### `0` 到 `1` 是固定范围

所有亮度值都必须位于闭区间 `[0, 1]`。不要传入 `50` 表示 50%，应传入 `0.5`。

### Android 的两类设置不能混淆

`setBrightnessAsync()`只覆盖当前 Activity；`setSystemBrightnessAsync()`修改整个 Android 系统，而且会关闭自动亮度模式。

这是本 API 最重要的行为差异。

### iOS 不能永久修改系统亮度

iOS 上的亮度变化会在设备锁屏后恢复。不能依靠该 API保存长期系统设置。

### 可用性检查不等于权限检查

`isAvailableAsync()`只检查 API 是否可用，不表示 `WRITE_SETTINGS` 权限已经授予。

### 权限声明与用户授权不是同一件事

在 `app.json` 或 `AndroidManifest.xml` 中声明权限，只代表应用构建时申请使用该能力。运行时仍应通过权限 API检查和请求用户授权。

### API 存在平台限制

虽然部分类型在文档中标记为 Android、iOS 均支持，但操作系统全局亮度和亮度模式的方法明确只支持 Android。跨平台调用前应根据平台或功能能力进行分支处理。

### 事件监听不是跨平台能力

`addBrightnessListener()`在 Android 和 Web 上不会触发。不能以它为基础实现通用的跨平台亮度同步逻辑。

## React Web 开发者需要特别注意的地方

Web 开发中通常无法直接修改用户设备的物理屏幕亮度，而 React Native 的该模块调用的是 Android 或 iOS 原生能力。

它与修改 CSS 的 `filter: brightness()`完全不同：

- CSS 亮度只改变页面像素的视觉效果。
- `expo-brightness` 控制设备实际屏幕亮度。
- 原生亮度操作可能需要系统权限。
- 全局操作可能影响应用之外的系统界面。
- iOS 与 Android 对相同 API 的生命周期处理不同。

React Native 也没有浏览器 DOM。示例中的 `View`、`Text` 和 `StyleSheet` 分别是 React Native 的原生 UI 抽象，不是 `div`、文本节点和 CSS 样式表。

## 实际开发建议

下面内容属于**基于文档内容推导**或**基于经验建议**，不是原文直接给出的完整业务方案。

### 临时提高页面亮度

二维码、票码等页面可以：

1. 进入页面时读取当前亮度。
2. 使用 `setBrightnessAsync()`临时提高亮度。
3. 离开页面时调用 `restoreSystemBrightnessAsync()`恢复 Android 的系统亮度继承状态。
4. iOS 需要根据其锁屏恢复机制设计页面生命周期处理。

### 谨慎修改 Android 全局亮度

只有业务明确要求改变整个设备的亮度时，才使用 `setSystemBrightnessAsync()`。调用前应说明影响，并考虑用户原本开启了自动亮度的情况，因为该方法会切换到手动模式。

### 做好平台分支

```ts
import { Platform } from 'react-native';
import * as Brightness from 'expo-brightness';

if (Platform.OS === 'android') {
  await Brightness.setSystemBrightnessAsync(0.8);
} else if (Platform.OS === 'ios') {
  await Brightness.setBrightnessAsync(0.8);
}
```

平台分支不能消除权限要求，Android 全局操作仍需先处理权限。

## 明确信息与推导信息

### 文档明确说明

- 亮度值范围是 `0` 到 `1`。
- Android 同时存在系统全局亮度和当前应用亮度。
- Android 应用亮度只覆盖当前 Activity。
- Android 全局亮度操作需要系统亮度权限。
- 设置 Android 系统亮度会切换到手动模式。
- iOS 设置的亮度会在锁屏后恢复。
- iOS 不需要额外权限。
- 亮度事件只在 iOS 上触发。
- Web 和 Android 不会触发亮度监听事件。
- `isAvailableAsync()`不检查应用权限。

### 基于文档内容推导

- 只需临时增强当前页面亮度时，应优先修改应用亮度，而不是 Android 系统全局亮度。
- 调用全局亮度 API 可能改变用户原有的自动亮度使用习惯。
- 跨平台业务必须区分 Android 和 iOS 的 API 支持范围与恢复时机。
- 声明 Android 权限后，仍需要在运行时处理授权状态和拒绝结果。

## 总结

`expo-brightness` 提供了读取和设置移动设备屏幕亮度的能力。使用时最关键的是区分：

- 当前应用亮度与 Android 系统全局亮度。
- Android Activity 级临时覆盖与系统级永久设置。
- Android 与 iOS 不同的权限、持续时间和 API 支持范围。
- API 可用性与用户授权状态。

对于多数临时提亮场景，应优先使用 `setBrightnessAsync()`，并妥善处理页面离开、权限拒绝、平台差异和异步错误。只有确实需要修改整个 Android 系统时，才应使用系统亮度及亮度模式相关 API。

---

## 文档导航

- **上一页**：[blur view](./150__blur-view.md)
- **下一页**：[brownfield](./152__brownfield.md)
