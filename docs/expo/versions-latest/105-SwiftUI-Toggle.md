# 105｜SwiftUI Toggle

**翻页：**[上一页：SwiftUI TextField](./104-SwiftUI-TextField.md) · [目录](./README.md) · [下一页：SwiftUI useNativeState](./106-SwiftUI-useNativeState.md)

**官方页面：**[SwiftUI Toggle · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/toggle/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/toggle/)推荐 `~56.0.26`。此 SwiftUI 原生开关支持 iOS、tvOS，并可在 Expo Go 使用；跨平台用 Expo UI universal `Switch`。

## 两态原生开关

`Toggle` 在 on/off 间切换，常用于通知、偏好或系统设置。`isOn` 是当前布尔值，`onIsOnChange` 把原生切换的新状态同步回 React state。样式用 `toggleStyle` modifier 改变。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本开关

~~~tsx
import { useState } from 'react';
import { Host, Toggle } from '@expo/ui/swift-ui';

export default function BasicToggleExample() {
  const [isOn, setIsOn] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Toggle
        isOn={isOn}
        onIsOnChange={setIsOn}
        label="Enable feature"
      />
    </Host>
  );
}
~~~

## 添加系统图标

`systemImage` 使用 SF Symbols 系统图标名称：

~~~tsx
import { useState } from 'react';
import { Host, Toggle } from '@expo/ui/swift-ui';

export default function ToggleWithImageExample() {
  const [airplaneMode, setAirplaneMode] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Toggle
        isOn={airplaneMode}
        onIsOnChange={setAirplaneMode}
        label="Airplane Mode"
        systemImage="airplane"
      />
    </Host>
  );
}
~~~

## 切换显示样式

`toggleStyle` 支持 `automatic`、`switch`、`button`。button 样式在 tvOS 不可用：

~~~tsx
import { useState } from 'react';
import { Host, Toggle, VStack } from '@expo/ui/swift-ui';
import { toggleStyle } from '@expo/ui/swift-ui/modifiers';

export default function ToggleStylesExample() {
  const [isOn, setIsOn] = useState(true);

  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Toggle
          isOn={isOn}
          onIsOnChange={setIsOn}
          label="Switch Style"
          modifiers={[toggleStyle('switch')]}
        />
        <Toggle
          isOn={isOn}
          onIsOnChange={setIsOn}
          label="Button Style"
          modifiers={[toggleStyle('button')]}
        />
      </VStack>
    </Host>
  );
}
~~~

## 修改开关强调色

`tint` modifier 设置当前 Toggle 颜色：

~~~tsx
import { useState } from 'react';
import { Host, Toggle } from '@expo/ui/swift-ui';
import { tint } from '@expo/ui/swift-ui/modifiers';

export default function TintedToggleExample() {
  const [isOn, setIsOn] = useState(true);

  return (
    <Host style={{ flex: 1 }}>
      <Toggle
        isOn={isOn}
        onIsOnChange={setIsOn}
        label="Custom Color"
        modifiers={[tint('#FF9500')]}
      />
    </Host>
  );
}
~~~

## 自定义标题和副标题

传 children 可自定义标签；多个 `Text` 中第一个作标题，第二个作副标题：

~~~tsx
import { useState } from 'react';
import { Host, Toggle, Text } from '@expo/ui/swift-ui';

export default function CustomLabelExample() {
  const [vibrateOnRing, setVibrateOnRing] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Toggle isOn={vibrateOnRing} onIsOnChange={setVibrateOnRing}>
        <Text>Vibrate on ring</Text>
        <Text>Enable vibration when the phone rings</Text>
      </Toggle>
    </Host>
  );
}
~~~

## 隐藏视觉标签但保留无障碍标签

`labelsHidden()` 隐藏屏幕上显示的文字；仍要传 `label` 供辅助功能识别用途：

~~~tsx
import { useState } from 'react';
import { Host, Toggle } from '@expo/ui/swift-ui';
import { labelsHidden } from '@expo/ui/swift-ui/modifiers';

export default function HiddenLabelExample() {
  const [isOn, setIsOn] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Toggle
        isOn={isOn}
        onIsOnChange={setIsOn}
        label="Hidden Label"
        modifiers={[labelsHidden()]}
      />
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `isOn` | `boolean`（可选） | 当前开关值。 |
| `onIsOnChange` | `(isOn: boolean) => void`（可选） | 状态变化时回调，参数为新值。 |
| `label` | `string`（可选） | 描述开关用途的标题。 |
| `systemImage` | SF Symbols 名称（可选） | 和标签一起显示的系统图标。 |
| `children` | `React.ReactNode`（可选） | 自定义标签视图；多个 Text 的第一个为标题、第二个为副标题。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **受控开关**：React 的布尔 state 保存 Toggle 的 on/off 状态；回调用新值更新 state。
- **SF Symbols**：Apple 系统图标库，名称如 `airplane`。
- **labelsHidden**：隐藏可见标签，不会移除标签的辅助功能语义。

## 源页代码主题覆盖

已覆盖四种安装命令和官方六种示例：受控开关、系统图标、Switch / Button 外观、tint 着色、自定义标题 / 副标题、隐藏可见标签但保留无障碍名称；API 与平台限制均已说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/toggle/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/toggle/)

**翻页：**[上一页：SwiftUI TextField](./104-SwiftUI-TextField.md) · [目录](./README.md) · [下一页：SwiftUI useNativeState](./106-SwiftUI-useNativeState.md)
