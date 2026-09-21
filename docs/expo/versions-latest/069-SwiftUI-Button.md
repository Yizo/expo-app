# 069｜SwiftUI Button

**翻页：**[上一页：SwiftUI BottomSheet](./068-SwiftUI-BottomSheet.md) · [目录](./README.md) · [下一页：SwiftUI ColorPicker](./070-SwiftUI-ColorPicker.md)

**官方页面：**[SwiftUI Button · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/button/)推荐 ~56.0.26。glass / glassProminent 外观需要 iOS 26 且使用 Xcode 26 构建；extraLarge button controlSize 和 circle button border shape 需 iOS 17+。

## SwiftUI 原生按钮

@expo/ui/swift-ui 的 Button 使用 SwiftUI 原生按压控件，支持标题、SF Symbols 图标、系统按钮样式、尺寸、角色和禁用状态。SwiftUI Button 常用 label 属性提供简单文字；Jetpack Compose Button 用子组件、React Native Pressable 用 children 和 onPress。

安装：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 基础文字按钮

~~~tsx
import { Host, Button } from '@expo/ui/swift-ui';

export default function BasicButtonExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="Press me" onPress={() => alert('Pressed!')} />
    </Host>
  );
}
~~~

## 标题前加系统图标

systemImage 传入 SF Symbols 名称，系统会把图标和 label 组成按钮：

~~~tsx
import { Host, Button } from '@expo/ui/swift-ui';

export default function ButtonWithImageExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Button
        label="Download"
        systemImage="arrow.down.circle"
        onPress={() => alert('Downloading...')}
      />
    </Host>
  );
}
~~~

## 仅显示图标，同时保留无障碍标签

labelStyle('iconOnly') 隐藏可见文字，但仍保留 label 给屏幕阅读器识别：

~~~tsx
import { Host, Button } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

export default function IconOnlyButtonExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Button
        label="Settings"
        systemImage="gear"
        modifiers={[labelStyle('iconOnly')]}
        onPress={() => alert('Settings')}
      />
    </Host>
  );
}
~~~

## SwiftUI 系统按钮样式

buttonStyle modifier 支持 bordered、borderedProminent、borderless、plain、glass、glassProminent：

~~~tsx
import { Host, Button, VStack } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

export default function ButtonStylesExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Button
          label="Bordered"
          modifiers={[buttonStyle('bordered')]}
        />
        <Button
          label="Bordered Prominent"
          modifiers={[buttonStyle('borderedProminent')]}
        />
        <Button
          label="Borderless"
          modifiers={[buttonStyle('borderless')]}
        />
        <Button
          label="Plain"
          modifiers={[buttonStyle('plain')]}
        />
      </VStack>
    </Host>
  );
}
~~~

glass 和 glassProminent 只在 iOS 26 及更高版本、并使用 Xcode 26 构建时可用。

## 设定按钮边框形状

buttonBorderShape modifier 支持 automatic、capsule、roundedRectangle、circle。示例用 iOS 26 Liquid Glass 风格的大号圆形 icon-only button：

~~~tsx
import { Host, Button } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
  buttonBorderShape,
  labelStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function ButtonBorderShapeExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Button
        label="Favorite"
        systemImage="heart.fill"
        modifiers={[
          buttonStyle('glass'),
          controlSize('extraLarge'),
          labelStyle('iconOnly'),
          buttonBorderShape('circle'),
        ]}
        onPress={() => alert('Favorited')}
      />
    </Host>
  );
}
~~~

circle buttonBorderShape 需要 iOS 17+；这个示例所用 glass 样式另要求 iOS 26 + Xcode 26。

## SwiftUI 控件尺寸

controlSize 支持 mini、small、regular、large、extraLarge。官方示例展示前四种 bordered button：

~~~tsx
import { Host, Button, VStack } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
} from '@expo/ui/swift-ui/modifiers';

export default function ControlSizeExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Button
          label="Mini"
          modifiers={[controlSize('mini'), buttonStyle('bordered')]}
        />
        <Button
          label="Small"
          modifiers={[
            controlSize('small'),
            buttonStyle('bordered'),
          ]}
        />
        <Button
          label="Regular"
          modifiers={[
            controlSize('regular'),
            buttonStyle('bordered'),
          ]}
        />
        <Button
          label="Large"
          modifiers={[
            controlSize('large'),
            buttonStyle('bordered'),
          ]}
        />
      </VStack>
    </Host>
  );
}
~~~

extraLarge 仅 iOS 17+ 可用。

## Button 语义角色

role 帮助 SwiftUI 识别一般按钮、取消按钮或破坏性按钮：

~~~tsx
import { Host, Button, VStack } from '@expo/ui/swift-ui';

export default function ButtonRolesExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Button label="Default" role="default" />
        <Button label="Cancel" role="cancel" />
        <Button label="Delete" role="destructive" />
      </VStack>
    </Host>
  );
}
~~~

## 自定义 tint 和 disabled 状态

~~~tsx
import { Host, Button } from '@expo/ui/swift-ui';
import { tint } from '@expo/ui/swift-ui/modifiers';

export default function TintedButtonExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="Custom Color" modifiers={[tint('#FF6347')]} />
    </Host>
  );
}
~~~

~~~tsx
import { Host, Button } from '@expo/ui/swift-ui';
import { disabled } from '@expo/ui/swift-ui/modifiers';

export default function DisabledButtonExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="Disabled" modifiers={[disabled()]} />
    </Host>
  );
}
~~~

## 自定义 label 内容

需要复杂按钮标签时，可用嵌套 SwiftUI view 作为 children；children 必须是 React 元素，不接受纯字符串。下面把文件夹系统图标放在 Folder 文字上方：

~~~tsx
import {
  Host,
  Button,
  VStack,
  Image,
  Text,
} from '@expo/ui/swift-ui';

export default function CustomContentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Button onPress={() => console.log('Pressed!')}>
        <VStack spacing={4}>
          <Image systemName="folder" />
          <Text>Folder</Text>
        </VStack>
      </Button>
    </Host>
  );
}
~~~

## API

~~~tsx
import { Button } from '@expo/ui/swift-ui';
~~~

~~~tsx
import { Button } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
  tint,
  disabled,
} from '@expo/ui/swift-ui/modifiers';

<Button
  role="destructive"
  onPress={handlePress}
  label="Delete"
  modifiers={[
    buttonStyle('bordered'),
    controlSize('large'),
    tint('#FF0000'),
    disabled(true),
  ]}
/>;
~~~

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| label | string，可选 | 简单文字按钮标题。 |
| systemImage | SFSymbols7_0，可选 | SF Symbols 系统图标名；与 label 同时设置时才显示。 |
| onPress | () => void，可选 | 用户点击回调。 |
| role | ButtonRole，可选 | default、cancel、destructive。 |
| children | ReactElement 或 ReactElement[]，可选 | 自定义 label 内容；仅支持嵌套元素，不支持直接字符串。 |
| target | string，可选 | Widget / Live Activity 中识别被按下按钮的 target id。 |
| CommonViewModifierProps | - | Expo UI SwiftUI view 共用修饰属性。 |

ButtonRole 是 default、cancel、destructive 三值。destructive 用于删除数据等有破坏性的 action，cancel 用于取消当前操作。

## 关键名词

- **SF Symbols**：Apple 系统符号图标库。systemImage 传图标名，例如 gear、arrow.down.circle、heart.fill。
- **label**：SwiftUI Button 的可访问文本标签；icon-only 样式会隐藏可见标签但保留无障碍信息。
- **buttonStyle**：SwiftUI 样式 modifier，决定边框、填色、玻璃效果等系统按钮外观。
- **controlSize**：调整按钮的系统尺寸密度，不等于手写 width / height。
- **buttonBorderShape**：改变有样式 Button 的边框形状，如 capsule 或 circle。
- **ButtonRole**：告诉 SwiftUI 按钮在当前上下文承担默认、取消或破坏性动作角色。
- **tint**：用强调色改变 SwiftUI 控件颜色；最终外观由系统 buttonStyle 决定。
- **disabled**：将按钮标为不可交互；modifier 也可以通过参数显式开 / 关。
- **Custom label**：自定义 children 可以放图标、VStack 等 SwiftUI 内容，便于做多行 / 垂直按钮。
- **Widget target**：SwiftUI Button 的 target 字段可用于 Widget 或 Live Activity 确定触发了哪个按钮。
- **Universal Button**：从 @expo/ui 根路径导入的跨平台按钮 API；本页只讲平台专用 SwiftUI Button。

## 官方代码主题覆盖

保留官方安装命令和全部十个用法示例：基本按钮、SF Symbol 图标、icon-only 可访问标签、四种 buttonStyle、形状 + glass、四种 controlSize、三种 role、tint、disabled、自定义 VStack label。API 示例覆盖 destructive Button modifiers；props / role 类型及 iOS 版本限制均有记录。

## 下一页

Latest 页脚 Next 指向 [SwiftUI ColorPicker](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/colorpicker/)，介绍系统原生颜色选择器。

**翻页：**[上一页：SwiftUI BottomSheet](./068-SwiftUI-BottomSheet.md) · [返回目录](./README.md) · [下一页：SwiftUI ColorPicker](./070-SwiftUI-ColorPicker.md)
