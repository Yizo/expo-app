# Expo Haptics：在 Android、iOS 和 Web 中提供触觉反馈

## 文档解决的问题

`expo-haptics` 用于在用户操作时触发设备的振动或触觉反馈，例如：

- 用户切换选项时给予轻微反馈。
- 操作成功、失败或产生警告时给予不同反馈。
- 模拟界面元素碰撞、按压、拖动、开关切换等触感。
- 在 Android 上使用更具体的系统触觉效果。

该库统一封装了不同平台的底层能力：

| 平台 | 底层能力 |
| --- | --- |
| Android | `Vibrator` 系统服务或设备触觉引擎 |
| iOS 10+ | Taptic Engine |
| Web | Web Vibration API |

> 当前页面属于“下一个 SDK 版本”的未正式版本文档。文档提示：当前最新稳定版本为 SDK 56。实际项目应核对自己使用的 Expo SDK 版本，并查看对应版本的文档。

## 适用场景

触觉反馈适合作为用户操作后的辅助提示，例如：

- Picker、分段控件或滑块的选项发生变化。
- 表单提交成功、失败或需要警告。
- 用户长按、拖动或完成手势。
- 开关从开启变为关闭，或从关闭变为开启。
- 移动端界面需要表现轻、重、柔软或刚性的碰撞感。

触觉反馈不应被当作唯一的信息传递方式。因为设备、系统设置和运行环境可能导致反馈完全不执行。

> **基于文档内容推导：** 成功、失败等关键状态仍应通过文字、颜色、图标或其他界面变化表达，触觉反馈只适合作为增强体验的补充。

## 阅读前需要理解的概念

### 触觉反馈与普通振动

React Web 开发者可能会把所有设备振动都理解成“让手机震一下”，但移动端触觉反馈通常具有更明确的交互语义。

`expo-haptics` 提供的反馈主要分为：

1. **选择反馈**：表示系统已接收到一次选项变更。
2. **通知反馈**：表示任务成功、失败或产生警告。
3. **碰撞反馈**：模拟不同质量或材质的界面元素碰撞。
4. **Android 语义化反馈**：直接表达确认、拒绝、长按、拖动开始等具体操作。

### 原生能力

React Web 代码通常运行在浏览器中，只能调用浏览器开放的 API。React Native 应用则可以通过 JavaScript 模块调用 Android 或 iOS 提供的原生系统能力。

`expo-haptics` 相当于一层跨平台封装：业务代码调用统一的 JavaScript API，由库负责连接各平台的振动或触觉系统。

### Taptic Engine

Taptic Engine 是 iOS 设备提供触觉反馈的硬件与系统能力。它可以产生具有不同交互含义的反馈，而不只是简单、持续地振动。

文档明确支持 iOS 10 及以上设备，但实际是否产生反馈还会受到系统状态和用户设置影响。

### Web Vibration API

Web Vibration API 是浏览器提供的振动接口。它同时依赖：

- 浏览器实现该 API。
- 当前设备具有振动硬件。
- 用户允许网页使用振动。
- 浏览器认为当前页面和调用场景适合执行振动。

因此，Web 支持不能只根据 `expo-haptics` 的平台列表判断，还需要检查实际浏览器兼容性。

## 安装

根据项目使用的包管理器选择一条命令：

```sh
# npm
npx expo install expo-haptics

# yarn
yarn expo install expo-haptics

# pnpm
pnpm expo install expo-haptics

# bun
bun expo install expo-haptics
```

这里使用的是 `expo install`，而不是直接执行普通的 `npm install`。它用于安装与当前 Expo SDK 兼容的包版本。

如果是在已有的 React Native 原生项目中使用该库，需要先按照 Expo 文档为项目安装 `expo` 和 Expo Modules 支持。当前文档没有展开具体的原生工程接入步骤。

## 平台配置

### Android 权限

Android 上控制设备振动需要 `VIBRATE` 权限。`expo-haptics` 会自动添加该权限，不需要开发者在这里手动配置。

不过，文档特别指出：使用 Android `Vibrator` API 模拟触觉反馈并不是推荐方案。Android 项目应优先考虑：

```js
Haptics.performAndroidHapticsAsync(type);
```

该方法使用设备的触觉引擎，效果更接近 iOS 的语义化触觉反馈，并且不需要 `VIBRATE` 权限。

### iOS 和 Web 配置

当前文档没有提供需要手动修改的 iOS 配置项，也没有列出 Web 构建配置。

## 基本用法

首先导入整个模块：

```js
import * as Haptics from 'expo-haptics';
```

然后在用户交互事件中调用相应的异步方法：

```jsx
import { Button } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function SubmitButton() {
  return (
    <Button
      title="提交"
      onPress={() =>
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        )
      }
    />
  );
}
```

对于 React Web 开发者，可以将 React Native 的 `onPress` 理解为按钮的点击事件入口，作用类似 Web React 中的 `onClick`。

这些 API 都返回 `Promise<void>`。Promise 会在原生触觉功能被触发后完成，但这不代表开发者能够通过返回值确认用户一定感受到了振动。

> **基于文档内容推导：** 调用方通常不应等待触觉反馈完成后再执行主要业务逻辑。触觉调用应配合已经发生或已经确认的用户操作。

## API 方法

### `selectionAsync()`

```js
await Haptics.selectionAsync();
```

支持 Android、iOS 和 Web。

用于告知用户：一次选择变化已经被系统接收。适合选项切换、离散滑块移动或选择器变化等场景。

该方法没有参数，返回 `Promise<void>`。

### `notificationAsync(type)`

```js
await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);
```

支持 Android、iOS 和 Web。

它用于表达具有结果语义的通知反馈：

| 类型 | 值 | 含义 |
| --- | --- | --- |
| `Success` | `"success"` | 任务成功完成 |
| `Warning` | `"warning"` | 任务产生警告 |
| `Error` | `"error"` | 任务执行失败 |

`type` 参数可选，默认值为 `NotificationFeedbackType.Success`。

在 Android 上，该方法通过 `Vibrator` 模拟效果；在 iOS 上则直接映射到系统的 `UINotificationFeedbackType`。

典型用法：

```js
try {
  await submitForm();

  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
  );
} catch {
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Error
  );
}
```

### `impactAsync(style)`

```js
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

支持 Android、iOS 和 Web。

该方法模拟界面元素发生碰撞时的触感。`style` 参数可选，默认值为 `ImpactFeedbackStyle.Medium`。

| 样式 | 值 | 表达的触感 |
| --- | --- | --- |
| `Light` | `"light"` | 小而轻的界面元素发生碰撞 |
| `Medium` | `"medium"` | 中等大小的界面元素发生碰撞 |
| `Heavy` | `"heavy"` | 大而重的界面元素发生碰撞 |
| `Rigid` | `"rigid"` | 刚性元素碰撞，压缩或弹性较小 |
| `Soft` | `"soft"` | 柔软元素碰撞，压缩或弹性较大 |

在 Android 上，该方法使用 `Vibrator` 模拟；在 iOS 上直接映射到 `UIImpactFeedbackStyle`。

文档明确建议：Android 触觉反馈优先使用 `performAndroidHapticsAsync()`，而不是依赖 `impactAsync()` 所使用的 `Vibrator` 模拟方案。

### `performAndroidHapticsAsync(type)`

```js
await Haptics.performAndroidHapticsAsync(
  Haptics.AndroidHaptics.Confirm
);
```

仅支持 Android，且 `type` 为必填参数。

该方法使用设备触觉引擎产生物理反馈，效果定位更接近 iOS 触觉反馈，并且不需要 Android 的 `VIBRATE` 权限。

如果代码同时运行在多个平台，需要避免在 iOS 或 Web 上直接无条件调用它。当前文档没有给出平台分支代码，但 React Native 通常可以根据运行平台选择不同实现。

## Android 触觉类型

`AndroidHaptics` 提供了比跨平台 API 更具体的操作语义。

### 结果与决定

| 枚举 | 值 | 使用语义 |
| --- | --- | --- |
| `Confirm` | `"confirm"` | 确认操作或交互成功完成 |
| `Reject` | `"reject"` | 操作被拒绝或交互失败 |
| `No_Haptics` | `"no-haptics"` | 不执行触觉反馈 |

### 手势与直接操作

| 枚举 | 值 | 使用语义 |
| --- | --- | --- |
| `Context_Click` | `"context-click"` | 对对象执行上下文点击 |
| `Long_Press` | `"long-press"` | 长按对象并触发操作 |
| `Drag_Start` | `"drag-start"` | 开始拖放，目标刚被“拿起” |
| `Gesture_Start` | `"gesture-start"` | 手势开始，例如软键盘手势 |
| `Gesture_End` | `"gesture-end"` | 手势结束 |
| `Text_Handle_Move` | `"text-handle-move"` | 移动文本选择或插入手柄 |

### 选择、刻度与开关

| 枚举 | 值 | 使用语义 |
| --- | --- | --- |
| `Clock_Tick` | `"clock-tick"` | 选择时钟的小时或分钟刻度 |
| `Segment_Tick` | `"segment-tick"` | 在列表项目或滑块离散点之间切换 |
| `Segment_Frequent_Tick` | `"segment-frequent-tick"` | 在大量密集选项之间频繁切换 |
| `Toggle_On` | `"toggle-on"` | 将开关或按钮切换到开启状态 |
| `Toggle_Off` | `"toggle-off"` | 将开关或按钮切换到关闭状态 |

`Segment_Frequent_Tick` 被设计为非常轻柔，以避免快速、重复触发时造成不适。如果设备无法产生足够轻的反馈，系统可能完全不振动。

### 虚拟按键

| 枚举 | 值 | 使用语义 |
| --- | --- | --- |
| `Keyboard_Press` | `"keyboard-press"` | 按下虚拟或软件键盘按键 |
| `Keyboard_Release` | `"keyboard-release"` | 松开虚拟键盘按键 |
| `Keyboard_Tap` | `"keyboard-tap"` | 点击软键盘按键 |
| `Virtual_Key` | `"virtual-key"` | 按下屏幕虚拟按键 |
| `Virtual_Key_Release` | `"virtual-key-release"` | 松开虚拟按键 |

这些类型具有具体的系统交互语义，不应只根据“哪个震感更明显”来选择。

## 平台限制与容易踩坑的地方

### iOS 可能静默不执行

即使调用成功，以下情况也会使 iOS Taptic Engine 不产生反馈：

- 设备开启了低电量模式。
- 用户在系统设置中关闭了 Taptic Engine。
- iOS 相机正在工作，以避免触觉引擎影响相机稳定。
- iOS 听写功能正在工作，以免干扰麦克风输入。

低电量模式可以通过 `expo-battery` 检测。当前文档没有说明如何检测其他三种状态。

这意味着“Promise 已完成”和“用户感受到了触觉反馈”不是同一件事。

### Web 支持具有条件

Web 端必须同时满足以下条件：

- 浏览器支持 Web Vibration API。
- 设备具有振动硬件。
- 用户允许使用振动，通常会自动授权。
- 当前上下文没有被浏览器限制。

某些浏览器可能忽略特定场景中的振动，例如页面位于后台标签页时。因此，同一套代码在桌面浏览器、移动浏览器和不同厂商浏览器中的表现可能不同。

### 平台支持不等于效果一致

`selectionAsync()`、`notificationAsync()` 和 `impactAsync()` 虽然都标记为支持 Android、iOS 和 Web，但底层实现不同：

- iOS 直接映射系统触觉类型。
- Android 的部分跨平台方法使用 `Vibrator` 模拟。
- Web 使用浏览器的振动 API。

> **基于文档内容推导：** 跨平台支持表示 API 可以调用，不代表三个平台能够产生完全相同的力度、节奏或触感。

### 不要滥用高频反馈

文档对 `Segment_Frequent_Tick` 特别强调了轻柔和舒适性，说明频繁触觉反馈需要关注用户体验。

> **基于经验建议：** 不要为每次普通点击都添加强烈反馈。应优先用于有明确交互意义的操作，并在真实设备上测试频率和强度。

## React Web 开发者需要特别注意的地方

1. **浏览器模拟器不能完全代表真机。**  
   触觉反馈依赖设备硬件。仅观察控制台没有办法确认真实触感。

2. **API 返回 Promise，但反馈可能没有发生。**  
   系统设置、低电量模式、相机、听写、浏览器兼容性和后台标签页都可能阻止反馈。

3. **触觉类型表达的是交互语义。**  
   `Success`、`Long_Press`、`Toggle_On` 等并不是随意命名的振动样式，应与真实操作含义匹配。

4. **Android 存在推荐 API。**  
   `impactAsync()` 和 `notificationAsync()` 在 Android 上使用 `Vibrator` 模拟，而文档建议 Android 优先使用 `performAndroidHapticsAsync()`。

5. **Android 专用 API需要平台分支。**  
   `performAndroidHapticsAsync()` 不能被视为通用的跨平台方法。

6. **Expo 管理项目与已有原生项目不同。**  
   Expo 项目可以直接通过 `expo install` 安装。已有 React Native 原生项目还需要先接入 Expo Modules，当前文档未提供完整步骤。

## 实际开发中的使用方式

可以先按照交互意图建立简单规则：

| 交互 | 建议 API |
| --- | --- |
| 选项发生变化 | `selectionAsync()` |
| 操作成功、失败或产生警告 | `notificationAsync()` |
| 表达轻重或材质碰撞 | `impactAsync()` |
| Android 上的确认、拒绝、拖动或开关等操作 | `performAndroidHapticsAsync()` |

跨平台业务可以封装统一入口，并让 Android 使用更合适的专用反馈。

> **基于文档内容推导：** 这种封装可以避免业务组件到处判断平台，同时确保 Android 优先采用文档推荐的触觉引擎 API。

实际测试至少应覆盖：

- iOS 真机的正常模式和低电量模式。
- Android 真机上的关键交互。
- 支持和不支持 Web Vibration API 的浏览器。
- Web 页面处于前台和后台标签页的情况。

> **基于经验建议：** 测试时应关注触觉是否与操作时机一致，以及连续触发是否令人不适，而不只是确认代码没有抛出异常。

## 当前文档未涉及的内容

当前文档没有说明：

- 各反馈效果对应的精确振动时长或振动波形。
- 如何自定义振动节奏。
- 如何统一不同设备的实际触感强度。
- 如何检测用户是否关闭了 iOS Taptic Engine。
- 如何检测 iOS 相机或听写导致的触觉禁用状态。
- Android 各触觉类型所要求的系统版本或设备兼容范围。
- 自动化测试中如何验证触觉反馈。
- 触觉反馈相关的无障碍设置和产品设计规范。
- 已有 React Native 原生工程接入 Expo Modules 的完整操作步骤。

## 总结

`expo-haptics` 为 Android、iOS 和 Web 提供了统一的触觉反馈接口。开发时应根据交互语义选择 API：

- `selectionAsync()` 表达选择变化。
- `notificationAsync()` 表达成功、警告或失败。
- `impactAsync()` 表达不同质量和材质的碰撞。
- `performAndroidHapticsAsync()` 提供 Android 专用的语义化触觉效果，也是文档在 Android 上更推荐的实现。

触觉反馈受硬件、系统状态、用户设置和浏览器环境影响，因此必须被视为增强体验，而不能成为传递关键状态的唯一方式。

---

## 文档导航

- **上一页**：[gyroscope](./175__gyroscope.md)
- **下一页**：[image](./177__image.md)
