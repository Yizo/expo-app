# 168｜Expo SDK Haptics 触觉反馈

**翻页：**[上一页：Expo SDK Gyroscope 陀螺仪](./167-Expo-SDK-Gyroscope.md) · [目录](./README.md) · [下一页：Expo SDK Image 图像资源](./169-Expo-SDK-Image.md)

**官方页面：**[Haptics · Latest](https://docs.expo.dev/versions/latest/sdk/haptics/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/haptics/)

**版本与平台：**Latest 推荐 `expo-haptics ~57.0.3`；SDK v56.0.0 推荐 `~56.0.3`。支持 Android、iOS、Web；方法最终会调用系统振动服务、Apple Taptic Engine 或浏览器 Web Vibration API。

## 触觉反馈不是所有设备都必然触发

Haptics 用简短触觉提示强化 UI 事件，例如选项改变、任务成功 / 失败或按钮碰撞感：

- Android：通过系统 Vibrator 服务模拟反馈。`expo-haptics` 会自动加上 `VIBRATE` 权限。
- iOS 10+：由 Taptic Engine 提供。低电量模式、用户关闭触觉、相机启用或系统听写启用时，系统可能不产生触感。
- Web：使用 Web Vibration API；需要浏览器支持、设备有振动硬件且用户允许。浏览器可在后台标签页等情境忽略振动。

这些 API 返回 Promise，但这只代表调用完成，不是保证用户一定感受到振动。代码应让无反馈设备上的交互仍然完整。

安装：

```sh
npx expo install expo-haptics
```

## 选择合适的反馈类别

源页示例覆盖 selection、notification（Success / Error / Warning）和 impact（Light / Medium / Heavy / Rigid / Soft）。下例放在可点击控件中，展示这些常见类别，并包含更接近 Android 系统设计语言的 haptic preset：

```tsx
import { Button, Platform, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function HapticsDemo() {
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text>Selection：用户刚刚切换了选择项</Text>
      <Button title="Selection" onPress={() => void Haptics.selectionAsync()} />

      <Text>Notification：向用户反馈操作结果</Text>
      <Button
        title="Success"
        onPress={() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
      />
      <Button
        title="Error"
        onPress={() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)}
      />
      <Button
        title="Warning"
        onPress={() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)}
      />

      <Text>Impact：控件产生轻到重的碰撞感</Text>
      <Button title="Light" onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
      <Button title="Medium" onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} />
      <Button title="Heavy" onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)} />
      <Button title="Rigid" onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)} />
      <Button title="Soft" onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)} />

      {Platform.OS === 'android' ? (
        <Button
          title="Android confirm"
          onPress={() => void Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)}
        />
      ) : null}
    </View>
  );
}
```

## Android 专属预设

`impactAsync()` 在 Android 上基于 Vibrator 服务模拟碰撞效果；文档推荐 Android 优先考虑 `performAndroidHapticsAsync(type)`。它使用设备的 haptics engine、接近系统标准反馈，而且不需要 `VIBRATE` 权限。

| `AndroidHaptics` | 适用交互 |
| --- | --- |
| `Clock_Tick` | 时钟表盘的小时 / 分钟刻度。 |
| `Confirm` / `Reject` | 确认成功 / 拒绝或失败。 |
| `Context_Click` | Context click。 |
| `Drag_Start` | 拖拽对象刚被拾起。 |
| `Gesture_Start` / `Gesture_End` | 手势开始 / 结束，例如软件键盘交互。 |
| `Keyboard_Press` / `Keyboard_Release` / `Keyboard_Tap` | 虚拟键盘按下、释放或敲击。 |
| `Long_Press` | 长按对象触发操作。 |
| `No_Haptics` | 明确不执行触觉反馈。 |
| `Segment_Tick` | 列表项或滑块离散点切换。 |
| `Segment_Frequent_Tick` | 时钟分钟 / 百分比等高频刻度；预期很轻，设备无法提供足够柔和触感时可能不振动。 |
| `Text_Handle_Move` | 文本选区 / 插入光标拖柄移动。 |
| `Toggle_On` / `Toggle_Off` | 开关或按钮切换到开 / 关。 |
| `Virtual_Key` / `Virtual_Key_Release` | 屏幕虚拟按键按下 / 释放。 |

```ts
import * as Haptics from 'expo-haptics';

// Android：让滑块离散值变化时使用柔和刻度反馈。
function onPickerStepChanged() {
  return Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Frequent_Tick);
}
```

## API 速查

| 方法 | 行为 / 返回值 |
| --- | --- |
| `Haptics.impactAsync(style?)` | 播放碰撞反馈，默认 `Medium`；Android 走 Vibrator 模拟，iOS 映射至 UIImpactFeedbackStyle。返回 `Promise<void>`。 |
| `Haptics.notificationAsync(type?)` | 任务结果反馈，支持 `Success`、`Warning`、`Error`，默认 `Success`。返回 `Promise<void>`。 |
| `Haptics.performAndroidHapticsAsync(type)` | Android haptics engine 预设，参数为 `AndroidHaptics`。返回 `Promise<void>`。 |
| `Haptics.selectionAsync()` | 表示选项已改变的轻反馈，无参数。返回 `Promise<void>`。 |

`ImpactFeedbackStyle` 的五个值：`Light`（轻巧控件）、`Medium`（中等）、`Heavy`（较大 / 较重控件）、`Rigid`（刚硬、压缩少）和 `Soft`（柔软、压缩感更明显）。`NotificationFeedbackType` 的三个值是 `Success`、`Warning`、`Error`。

## 平台限制和使用建议

- 原生 Android manifest 会自动加入 `VIBRATE` 权限；使用 Android 专属 `performAndroidHapticsAsync` 不需要该权限。
- iOS 触觉是否发出由系统设置和当前系统状态控制；低电量模式等情况下静默是正常情况。
- Web 上优先检查目标浏览器和设备支持；用户无需通过独立的 Expo 权限 API 操作，浏览器授权大多自动处理，但后台页面可能忽略调用。
- Haptics 适合作为已有视觉 / 交互结果的补充。选择项变化用 `selectionAsync()`，任务结束用 notification，按钮边界 / 物体反馈用 impact；避免每帧或高频重复调用。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-haptics ~57.0.3`，SDK v56 推荐 `~56.0.3`。
- 两版的 iOS 静默条件、Web 支持限制、Android VIBRATE 配置、`performAndroidHapticsAsync`、全部 enum 与 API 方法保持一致。
- 两版页脚均进入 Expo SDK Image。

## 源页代码主题覆盖

- Installation / Configuration：覆盖 `expo-haptics` 安装命令与 Android `VIBRATE` 权限自动加入说明。
- Usage：覆盖按钮驱动的 selection、notification 的 success / error / warning，impact 的 Light / Medium / Heavy / Rigid / Soft 全部样式及 Android 专属 preset 示例。
- API：覆盖 `impactAsync`、`notificationAsync`、`performAndroidHapticsAsync`、`selectionAsync` 的平台、参数、默认行为和 Promise 返回。
- Enums：逐项列出 `AndroidHaptics` 预设及适用交互、Impact 与 Notification 类型。
- Runtime conditions：覆盖 iOS 不触发条件、Web Vibrator API 硬件 / 浏览器 / 权限 / 后台限制。
- Latest / v56 对照：列出推荐版本并确认 Next 都是 Image。

**翻页：**[上一页：Expo SDK Gyroscope 陀螺仪](./167-Expo-SDK-Gyroscope.md) · [目录](./README.md) · [下一页：Expo SDK Image 图像资源](./169-Expo-SDK-Image.md)
