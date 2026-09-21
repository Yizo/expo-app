# 070｜SwiftUI ColorPicker

**翻页：**[上一页：SwiftUI Button](./069-SwiftUI-Button.md) · [目录](./README.md) · [下一页：SwiftUI ConfirmationDialog](./071-SwiftUI-ConfirmationDialog.md)

**官方页面：**[SwiftUI ColorPicker · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/colorpicker/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/colorpicker/)推荐 `~56.0.26`。本文依据 Latest 页面；项目应按其 Expo SDK 版本安装匹配的 `@expo/ui`。

## SwiftUI 系统颜色选择器

`ColorPicker` 让用户从系统调色面板中选择颜色，适合主题色、标注颜色或用户自定义外观。它由 iOS SwiftUI 渲染，因此需要放在 `Host` 中；与 Web 的 `<input type="color">` 不同，它呈现 iOS 原生选择界面。此控件仅支持 iOS，官方页面标注可在 Expo Go 中使用。

安装：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 基础颜色选择

`selection` 是当前颜色值，`onSelectionChange` 接收用户新选择的颜色并更新 React 状态。颜色字符串使用 `#RRGGBB` 格式：

~~~tsx
import { useState } from 'react';
import { Host, ColorPicker } from '@expo/ui/swift-ui';

export default function ColorPickerExample() {
  const [color, setColor] = useState('#FF6347');

  // ColorPicker 会填满分配给它的宽度；matchContents 让 Host 根据内容收缩。
  return (
    <Host style={{ flex: 1 }}>
      <ColorPicker
        label="Select a color"
        selection={color}
        onSelectionChange={setColor}
      />
    </Host>
  );
}
~~~

## 支持透明度

设置 `supportsOpacity` 后，用户可以调整 alpha 通道（透明度）。`#RRGGBBAA` 的最后两位 `AA` 是透明度十六进制值；例如 `80` 约为 50% 不透明度：

~~~tsx
import { useState } from 'react';
import { Host, ColorPicker } from '@expo/ui/swift-ui';

export default function ColorPickerOpacityExample() {
  const [color, setColor] = useState('#FF634780');

  return (
    <Host style={{ flex: 1 }}>
      <ColorPicker
        label="Select a color with opacity"
        selection={color}
        onSelectionChange={setColor}
        supportsOpacity
      />
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `label` | `string`（可选） | 显示给用户的控件标签；也有助于说明控件用途。 |
| `selection` | `string \| null` | 当前颜色，支持 `#RRGGBB` 或 `#RRGGBBAA`。 |
| `onSelectionChange` | `(value: string) => void`（可选） | 用户选择新颜色时调用。通常直接传 `useState` 的 setter。 |
| `supportsOpacity` | `boolean`（可选） | 是否开放透明度选择。 |

组件还继承 Expo UI 的 `CommonViewModifierProps`，可以使用通用视图 modifier。相关术语：

- **SwiftUI**：Apple 的原生 UI 框架，Expo UI 通过桥接让 React 组件使用系统控件。
- **Host**：Expo UI 原生控件的承载容器，负责在 React Native 布局中放置 SwiftUI 内容。
- **alpha 通道**：颜色的透明度部分；alpha 越低，颜色越透明。

## 源页代码主题覆盖

已覆盖四种安装命令，以及官方的基础颜色选择和开启透明度两个完整示例；`ColorPicker` 的标签、当前颜色、变更回调和 `supportsOpacity` 属性均在 API 表说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/colorpicker/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/colorpicker/)

**翻页：**[上一页：SwiftUI Button](./069-SwiftUI-Button.md) · [目录](./README.md) · [下一页：SwiftUI ConfirmationDialog](./071-SwiftUI-ConfirmationDialog.md)
