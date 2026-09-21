# 063｜Jetpack Compose Tooltip

**翻页：**[上一页：Jetpack Compose ToggleButton](./062-Jetpack-Compose-ToggleButton.md) · [目录](./README.md) · [下一页：Jetpack Compose useNativeState](./064-Jetpack-Compose-useNativeState.md)

**官方页面：**[Jetpack Compose Tooltip · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/tooltip/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.12`；[SDK 56 文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/tooltip/)推荐 `~56.0.26`。两者均支持 Plain / Rich tooltip、action slot 和 ref 的 show / dismiss 方法。

## 锚点上的上下文提示

`TooltipBox` 包裹一个锚点控件和一个提示内容槽。默认长按锚点显示提示；RichTooltip 可以提供标题、正文和操作 action。也可以用 ref 命令式显示或关闭。

安装：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## Plain tooltip

短提示使用 `TooltipBox.PlainTooltip`；用户长按 Favorite 按钮后显示说明：

```tsx
import { Host, TooltipBox, Button, Text } from '@expo/ui/jetpack-compose';

export default function PlainTooltipExample() {
  return (
    <Host matchContents>
      <TooltipBox>
        <TooltipBox.PlainTooltip>
          <Text>Add to favorites</Text>
        </TooltipBox.PlainTooltip>
        <Button onClick={() => {}}>
          <Text>Favorite</Text>
        </Button>
      </TooltipBox>
    </Host>
  );
}
```

除了明确命名的 PlainTooltip / RichTooltip slot，其余子元素用作锚点或触发内容。

## 带标题和正文的 Rich tooltip

RichTooltip 使用嵌套的 Title 与 Text 内容槽组织多层信息：

```tsx
import { Host, TooltipBox, Button, Text } from '@expo/ui/jetpack-compose';

export default function RichTooltipExample() {
  return (
    <Host matchContents>
      <TooltipBox>
        <TooltipBox.RichTooltip>
          <TooltipBox.RichTooltip.Title>
            <Text>Camera</Text>
          </TooltipBox.RichTooltip.Title>
          <TooltipBox.RichTooltip.Text>
            <Text>Take photos and record videos with your device camera.</Text>
          </TooltipBox.RichTooltip.Text>
        </TooltipBox.RichTooltip>
        <Button onClick={() => {}}>
          <Text>Open Camera</Text>
        </Button>
      </TooltipBox>
    </Host>
  );
}
```

## 带操作按钮的 Rich tooltip

加入 `TooltipBox.RichTooltip.Action` 可交给用户一个“Learn More”动作。`isPersistent` 保持提示可见，以便用户有时间点击；存在 Action slot 时 `hasAction` 会自动推导：

```tsx
import {
  Host,
  TooltipBox,
  Button,
  TextButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function RichTooltipActionExample() {
  return (
    <Host matchContents>
      <TooltipBox isPersistent>
        <TooltipBox.RichTooltip>
          <TooltipBox.RichTooltip.Title>
            <Text>Permissions required</Text>
          </TooltipBox.RichTooltip.Title>
          <TooltipBox.RichTooltip.Text>
            <Text>This feature requires camera and microphone access.</Text>
          </TooltipBox.RichTooltip.Text>
          <TooltipBox.RichTooltip.Action>
            <TextButton onClick={() => {}}>
              <Text>Learn more</Text>
            </TextButton>
          </TooltipBox.RichTooltip.Action>
        </TooltipBox.RichTooltip>
        <Button onClick={() => {}}>
          <Text>Record video</Text>
        </Button>
      </TooltipBox>
    </Host>
  );
}
```

## 通过 ref 程序化显示 / 关闭

无需等用户长按，父组件可以调用 TooltipBoxRef 的 show 和 dismiss：

```tsx
import { useRef } from 'react';
import {
  Host,
  TooltipBox,
  type TooltipBoxRef,
  Button,
  Text,
  Column,
  Row,
} from '@expo/ui/jetpack-compose';

export default function ProgrammaticTooltipExample() {
  const tooltipRef = useRef<TooltipBoxRef>(null);

  return (
    <Host matchContents>
      <Column verticalArrangement={{ spacedBy: 8 }}>
        <TooltipBox ref={tooltipRef} isPersistent>
          <TooltipBox.PlainTooltip>
            <Text>Shown programmatically!</Text>
          </TooltipBox.PlainTooltip>
          <Button onClick={() => {}}>
            <Text>Anchor</Text>
          </Button>
        </TooltipBox>
        <Row horizontalArrangement={{ spacedBy: 8 }}>
          <Button onClick={() => tooltipRef.current?.show()}>
            <Text>Show</Text>
          </Button>
          <Button onClick={() => tooltipRef.current?.dismiss()}>
            <Text>Dismiss</Text>
          </Button>
        </Row>
      </Column>
    </Host>
  );
}
```

## API 属性与 ref

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode` | 必需内容：PlainTooltip / RichTooltip 槽和其余 anchor trigger 子项。长按锚点时显示提示。 |
| `enableUserInput` | `boolean`，默认 `true` | 是否由长按、hover 等用户输入触发。 |
| `focusable` | `boolean`，默认 `false` | 提示浮层是否可获取焦点。 |
| `hasAction` | `boolean`，可选 | 提示是否包含操作，会影响无障碍与关闭行为；有 RichTooltip.Action 时自动推导。 |
| `isPersistent` | `boolean`，默认 `false` | 是否保持显示，而不是短时间后自动关闭。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `ref` | `Ref<TooltipBoxRef>`，可选 | 程序化操控 tooltip。 |

`TooltipBoxRef.show()` / `dismiss()` 均返回 `Promise<void>`。

## 关键名词

- **Tooltip / 工具提示**：与某个锚点关联的简短说明，通常由长按或 hover 调出。
- **Anchor / 锚点**：包裹在 TooltipBox 中的按钮等 UI，用户通过操作它查看提示。
- **PlainTooltip / RichTooltip**：前者适合短句，后者可以有标题、正文和可点击操作区域。
- **复合组件 / Compound component**：通过层级子组件声明槽角色，如 RichTooltip.Title / Text / Action。
- **Persistent**：让 tooltip 不因短时超时自动关闭；适合有可点击 Action 时避免提示消失太快。
- **TooltipBoxRef**：父组件可以通过 ref 调用原生提示框的 show / dismiss 方法。
- **用户触发 / Programmatic trigger**：开启 enableUserInput 时支持长按 / hover；ref 可以由代码直接触发。

## 官方代码主题覆盖

保留 Expo UI 安装命令和官方四个示例：PlainTooltip、标题 + 正文 RichTooltip、带 TextButton 的持久提示、ref 命令式显示与关闭。API 覆盖 children、用户输入、focusable、hasAction、isPersistent、modifiers、ref 及 show / dismiss。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose useNativeState](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/usenativestate/)，介绍 JavaScript 与 Jetpack Compose 共享的可观察状态及 worklet 同步写入。

**翻页：**[上一页：Jetpack Compose ToggleButton](./062-Jetpack-Compose-ToggleButton.md) · [返回目录](./README.md) · [下一页：Jetpack Compose useNativeState](./064-Jetpack-Compose-useNativeState.md)
