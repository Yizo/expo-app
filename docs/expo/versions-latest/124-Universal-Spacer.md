# 124｜Expo UI Universal Spacer

**翻页：**[上一页：Universal Slider](./123-Universal-Slider.md) · [目录](./README.md) · [下一页：Universal Switch](./125-Universal-Switch.md)

**官方 Latest 页面：**[Spacer](https://docs.expo.dev/versions/latest/sdk/ui/universal/spacer/)

**SDK 56 对照：**[SDK v56.0.0 Spacer](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/spacer/)

**版本边界：**Latest `@expo/ui` 推荐 `~57.0.14`；SDK v56.0.0 推荐 `~56.0.25`。`size` 固定间距与 `flexible` 剩余空间填充在两版一致；Latest 示例额外用 `useColorScheme()` 设置明暗文字色，本地 SDK56 可沿用原 API。

## Spacer 用来做什么

`Spacer` 在 Expo UI 的 `Row` 或 `Column` 两个兄弟元素之间制造空隙。它有两种模式：

- `size={32}`：固定 32 个 density-independent pixels 的空间。在 `Row` 中解释为宽度；在 `Column` 中解释为高度。
- `<Spacer flexible />`：沿父布局主轴吸收剩余空间，让两端的 sibling 被推开。

## 固定尺寸的 Vertical Gap

在 Column 里的 fixed Spacer 会形成固定竖向间距：

```tsx
import { Host, Column, Text, Spacer } from '@expo/ui';

export default function FixedSpacer() {
  return (
    <Host style={{ flex: 1 }}>
      <Column>
        <Text>Top</Text>
        <Spacer size={32} />
        <Text>Bottom</Text>
      </Column>
    </Host>
  );
}
```

数值不是在 Spacer 上画出来的内容；Spacer 本身渲染为空白，只参与布局尺寸。

## Flexible Spacer：推开首尾内容

在 Row 中间加 flexible spacer，Leading 与 Trailing 会尽量靠近容器两端：

```tsx
import { Host, Row, Text, Spacer } from '@expo/ui';

export default function FlexibleSpacer() {
  return (
    <Host style={{ flex: 1 }}>
      <Row>
        <Text>Leading</Text>
        <Spacer flexible />
        <Text>Trailing</Text>
      </Row>
    </Host>
  );
}
```

若 Row / Column 没有多余空间，flexible Spacer 没有可吸收的剩余尺寸；先保证父布局有合适的 available width / height。

## Spacer Props

| Prop | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `size` | `number` | 固定空白尺寸：Row 内当宽度、Column 内当高度，单位 density-independent pixels。 |
| `flexible` | `boolean` / `false` | `true` 时填满父级主轴剩余空间，将旁边节点推向两端。 |
| `disabled` / `hidden` | `boolean` | 禁用或隐藏元素。 |
| `onPress` | `() => void` | Spacer 被按下时的回调。 |
| `onAppear` / `onDisappear` | `() => void` | 出现 / 离开屏幕时回调。 |
| `style` | 受限 `ViewStyle` | 支持 padding、background、border、opacity、宽高等共用样式。 |
| `modifiers` | `ModifierConfig[]` | 平台特定 SwiftUI / Jetpack Compose modifier。 |
| `testID` | `string` | E2E 测试定位。 |

## 选择 `size` 还是 `flexible`

| 需求 | 选择 | 理由 |
| --- | --- | --- |
| 固定的图文行间距 | `size={8}` | 容器大小变化时仍维持同样的空隙。 |
| Tool bar 左右两端分布 | `flexible` | 剩余宽度按布局动态填满。 |
| Column 中把标题推到上、按钮推到底 | `flexible` | 填满竖向空间、将上下内容分离。 |

## 关键名词

- **Main axis 主轴：**Row 是横向，Column 是竖向；Spacer 尺寸沿此方向发挥作用。
- **Fixed spacer：**明确大小的空白控件，不随父容器剩余尺寸增长。
- **Flexible spacer：**消费父布局剩余主轴空间的弹性空白节点。
- **Density-independent pixel：**平台布局逻辑尺寸；设备密度决定如何映射成实际像素。

## 官方代码主题覆盖

Latest / SDK v56.0.0 源页代码示例全部覆盖：四种包管理器安装 `@expo/ui`；Column 固定 size=32 Spacer；Row flexible Spacer；明暗主题文本（Latest 示例）；以及 size / flexible 默认和 Spacer Props。Host 样式使用 SDK56 的 flex 布局写法，避免把 Latest Host matchContents 示例混入旧版代码。

## 下一页

官方页脚 **Next** 是 [Universal Switch](https://docs.expo.dev/versions/latest/sdk/ui/universal/switch/)，介绍由 React state 控制的开关与带标签样式。

**翻页：**[上一页：Universal Slider](./123-Universal-Slider.md) · [返回目录](./README.md) · [下一页：Universal Switch](./125-Universal-Switch.md)
