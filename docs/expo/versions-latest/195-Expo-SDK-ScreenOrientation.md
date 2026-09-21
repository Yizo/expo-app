# 195｜Expo SDK ScreenOrientation 屏幕方向

**翻页：**[上一页：Expo SDK ScreenCapture 防止截图与录屏](./194-Expo-SDK-ScreenCapture.md) · [目录](./README.md) · [下一页：Expo SDK SecureStore](./196-Expo-SDK-SecureStore.md)

**官方页面：**[ScreenOrientation · Latest](https://docs.expo.dev/versions/latest/sdk/screen-orientation/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/screen-orientation/)

**版本与平台：**Latest 推荐 `expo-screen-orientation ~57.0.2`；SDK v56.0.0 推荐 `~56.0.5`。文档列出 Android、iOS、Web，支持 Expo Go；Web 对方向锁定的支持有限。v56 与 Latest 的主要 API 和代码主题一致。

## 屏幕方向与设备朝向

**屏幕方向（screen orientation）**表示界面图像以纵向还是横向绘制；**设备物理朝向**是传感器检测机身如何旋转，属于 Device Motion 概念。将手机横拿，屏幕不一定横向，因为系统或 app 可能锁定了方向。

- **当前方向（`Orientation`）：**屏幕绘制方向，例如 `LANDSCAPE_LEFT`。
- **方向锁定（`OrientationLock`）：**系统可以采用的方向范围，例如只竖屏、所有横屏或恢复默认策略。
- **平台锁（`PlatformOrientationInfo`）：**分别向 iOS、Android、Web 传平台原生格式的锁定值。
- **方向变化事件：**仅当屏幕在 portrait 与 landscape 两大方向间切换才触发；`PORTRAIT_UP` 转为 `PORTRAIT_DOWN` 不会触发。
- **CNG / config plugin：**在构建时写入原生工程的配置。改动不能仅靠 JS 热更新生效，需重新构建 app binary。

改变 Android / iOS 屏幕方向会覆盖系统设置或用户偏好。iOS app 不能读取用户的方向偏好；Android 可以选择考虑系统偏好的锁定策略。

## 安装与 iPad 限制

```sh
npx expo install expo-screen-orientation
yarn expo install expo-screen-orientation
pnpm expo install expo-screen-orientation
bun expo install expo-screen-orientation
```

已有 React Native 项目需先集成 `expo`。iPad 的 Split View 会影响方向锁定；若要锁定 iPad 方向，需要关闭 iPad 多任务 Split View（`Requires Full Screen`）。

## 构建时的初始方向配置

使用 CNG / config plugins 时，插件可以指定 iOS 初始方向，并通过 `ios.requireFullScreen` 关闭 Split View。改动这类构建配置后要重新构建应用：

```json
{
  "expo": {
    "ios": {
      "requireFullScreen": true
    },
    "plugins": [
      [
        "expo-screen-orientation",
        {
          "initialOrientation": "DEFAULT"
        }
      ]
    ]
  }
}
```

`initialOrientation` 只用于 iOS，可填 `DEFAULT`、`ALL`、`PORTRAIT`、`PORTRAIT_UP`、`PORTRAIT_DOWN`、`LANDSCAPE`、`LANDSCAPE_LEFT`、`LANDSCAPE_RIGHT`。插件只适用于使用 config plugin 的工程；没有使用 CNG 的项目要手动配置。

已有原生 iOS 项目的官方流程是使用 Xcode 打开 `ios` 目录（`xed ios`）；若还未生成则运行 `npx expo prebuild -p ios`，随后到 Project Target → General → Deployment Info 勾选 **Requires Full Screen**。

## Expo Router 按页面设置方向

Expo Router 的 stack navigator 支持给每个 screen 使用 `options.orientation`，由 `react-native-screens` 提供能力；官方推荐此方式设置栈内单页方向：

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ orientation: 'portrait' }} />
      <Stack.Screen name="landscape" options={{ orientation: 'landscape' }} />
    </Stack>
  );
}
```

## 运行时锁定和监听方向

运行时锁定前可用 `supportsOrientationLockAsync` 检查设备能否实现该策略。`unlockAsync()` 会恢复 `OrientationLock.DEFAULT`。示例切换到横屏左侧、监听方向变化，并在组件卸载时解除监听与锁定：

```tsx
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export function OrientationControls() {
  const [current, setCurrent] = useState<ScreenOrientation.Orientation | null>(null);

  useEffect(() => {
    let active = true;
    const subscription = ScreenOrientation.addOrientationChangeListener(event => {
      if (active) setCurrent(event.orientationInfo.orientation);
    });

    void ScreenOrientation.getOrientationAsync().then(value => {
      if (active) setCurrent(value);
    });

    return () => {
      active = false;
      subscription.remove();
      void ScreenOrientation.unlockAsync();
    };
  }, []);

  async function rotateToLandscape() {
    const supported = await ScreenOrientation.supportsOrientationLockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
    );
    if (supported) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    }
  }

  return (
    <View>
      <Text>当前方向枚举值：{current ?? '读取中'}</Text>
      <Button title="横向左侧" onPress={() => void rotateToLandscape()} />
      <Button title="恢复系统默认" onPress={() => void ScreenOrientation.unlockAsync()} />
    </View>
  );
}
```

`OrientationChangeEvent.orientationInfo` 提供当前 `ScreenOrientationInfo`，`orientationLock` 是当前策略。方向变化 listener 收到的是事件对象，不是单独的枚举值。每个 `addOrientationChangeListener()` 返回的 subscription 都应调用 `.remove()`；不要依赖旧的 remove-listener helper。

如需平台原生格式，`lockPlatformAsync(options)` 接收 `PlatformOrientationInfo`，无效参数 / 值会 reject：

```ts
await ScreenOrientation.lockPlatformAsync({
  screenOrientationArrayIOS: [
    ScreenOrientation.Orientation.PORTRAIT_UP,
    ScreenOrientation.Orientation.LANDSCAPE_LEFT,
  ],
});
```

`PlatformOrientationInfo` 的字段按平台使用：iOS 的 `screenOrientationArrayIOS` 是 `Orientation[]`；Android 的 `screenOrientationConstantAndroid` 是原生整数常量，例如 `-1` 表示 unspecified；Web 的 `screenOrientationLockWeb` 是 `WebOrientationLock`。Web 浏览器支持有限，不应预设所有浏览器都能锁方向。

## 方法速查

| API | 返回值 | 作用 |
| --- | --- | --- |
| `getOrientationAsync()` | `Promise<Orientation>` | 读取当前屏幕方向。 |
| `getOrientationLockAsync()` | `Promise<OrientationLock>` | 读取当前通用方向锁定值。 |
| `getPlatformOrientationLockAsync()` | `Promise<PlatformOrientationInfo>` | 读取平台专属的锁定配置。 |
| `lockAsync(orientationLock)` | `Promise<void>` | 应用通用 `OrientationLock`。 |
| `lockPlatformAsync(options)` | `Promise<void>` | 应用 iOS / Android / Web 原生格式方向锁；无效配置 reject。 |
| `supportsOrientationLockAsync(orientationLock)` | `Promise<boolean>` | 检查设备支持情况。 |
| `unlockAsync()` | `Promise<void>` | 恢复 `OrientationLock.DEFAULT`。 |
| `addOrientationChangeListener(listener)` | `EventSubscription` | 监听 portrait 与 landscape 间切换；同一大方向内翻转不触发。 |
| `subscription.remove()` | `void` | 移除此订阅对应的 listener。 |
| `removeOrientationChangeListener(subscription)` | `void`，已弃用 | 旧式单 listener 清理方式；改用 `.remove()`。 |
| `removeOrientationChangeListeners()` | `void`，已弃用 | 一次移除全部方向监听器；优先逐个调用 subscription 的 `.remove()`。 |

## 类型与枚举

### `Orientation`：当前方向

| 成员 | 数值 | 含义 |
| --- | --- | --- |
| `UNKNOWN` | `0` | 方向未知，例如设备平放。 |
| `PORTRAIT_UP` | `1` | 正向竖屏。 |
| `PORTRAIT_DOWN` | `2` | 倒置竖屏。 |
| `LANDSCAPE_LEFT` | `3` | 左侧横屏。 |
| `LANDSCAPE_RIGHT` | `4` | 右侧横屏。 |

### `OrientationLock`：通用方向策略

| 成员 | 数值 | 含义 / 限制 |
| --- | --- | --- |
| `DEFAULT` | `0` | iOS 允许除倒置竖屏外的方向；Android 交由系统决定。 |
| `ALL` | `1` | 四种方向均可。 |
| `PORTRAIT` | `2` | 任一种竖屏。 |
| `PORTRAIT_UP` | `3` | 只允许正向竖屏。 |
| `PORTRAIT_DOWN` | `4` | 只允许倒置竖屏。 |
| `LANDSCAPE` | `5` | 任一种横屏。 |
| `LANDSCAPE_LEFT` | `6` | 只允许左侧横屏。 |
| `LANDSCAPE_RIGHT` | `7` | 只允许右侧横屏。 |
| `OTHER` | `8` | 平台专属方向；不能作为 `lockAsync` 策略。 |
| `UNKNOWN` | `9` | 未知锁定；不能作为 `lockAsync` 策略。 |

`ALL` 与 `PORTRAIT` 在不支持 `PORTRAIT_DOWN` 的设备上无效。调用前可查询设备支持情况，或用更具体的策略。

### 事件、信息与平台类型

- `OrientationChangeEvent`：`orientationInfo: ScreenOrientationInfo`、`orientationLock: OrientationLock`。
- `OrientationChangeListener(event)`：接收上述 event、无返回值的回调。
- `ScreenOrientationInfo`：必有 `orientation`；iOS 还可有 `horizontalSizeClass` 与 `verticalSizeClass`。
- `PlatformOrientationInfo`：`screenOrientationArrayIOS?`、`screenOrientationConstantAndroid?`、`screenOrientationLockWeb?`，每个平台只使用对应字段。
- `Subscription.remove()`：取消该 emitter listener 的方法，返回 `void`。
- `SizeClassIOS`：`UNKNOWN=0`、`COMPACT=1`、`REGULAR=2`，用于描述 iOS 窗口的水平 / 垂直尺寸分类，可辅助布局判断。
- `WebOrientation`：`LANDSCAPE_PRIMARY='landscape-primary'`、`LANDSCAPE_SECONDARY='landscape-secondary'`、`PORTRAIT_PRIMARY='portrait-primary'`、`PORTRAIT_SECONDARY='portrait-secondary'`，表示浏览器当前方向值。
- `WebOrientationLock`：`ANY='any'`、`LANDSCAPE='landscape'`、`LANDSCAPE_PRIMARY='landscape-primary'`、`LANDSCAPE_SECONDARY='landscape-secondary'`、`NATURAL='natural'`、`PORTRAIT='portrait'`、`PORTRAIT_PRIMARY='portrait-primary'`、`PORTRAIT_SECONDARY='portrait-secondary'`、`UNKNOWN='unknown'`。这些 Web 策略通过 `lockPlatformAsync` 使用，不属于 `lockAsync` 的原生 enum。

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐依赖 | `expo-screen-orientation ~57.0.2` | `~56.0.5` |
| 安装、config plugin、Expo Router screen 选项 | 相同 | 相同 |
| 方法、事件、类型与 enum 表 | 两版一致 | 两版一致 |
| 官方页脚 Next | SecureStore | SecureStore |

## 官方源页代码主题覆盖

- 安装：覆盖 npx、Yarn、pnpm、Bun 命令。
- app config config-plugin：改写 `ios.requireFullScreen` 与 `initialOrientation: 'DEFAULT'` JSON；列出全部允许的初始方向，并说明改动后要重建。
- 原生 iOS 项目：覆盖 `xed ios` / `npx expo prebuild -p ios` 和 Xcode **Requires Full Screen** 设置流程。
- Expo Router：改写 `Stack.Screen` 针对 screen 设置 portrait / landscape 的例子。
- API Usage：改写 `lockAsync(OrientationLock.LANDSCAPE_LEFT)`；补充 listener subscription 清理与 `lockPlatformAsync` 示例，解释同页 API。
- 源页其余 API 表无单独 runnable 示例；本页列出方法、平台字段及 Orientation / OrientationLock / SizeClassIOS / WebOrientation / WebOrientationLock 枚举值。

**翻页：**[上一页：Expo SDK ScreenCapture 防止截图与录屏](./194-Expo-SDK-ScreenCapture.md) · [目录](./README.md) · [下一页：Expo SDK SecureStore](./196-Expo-SDK-SecureStore.md)
