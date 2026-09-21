# 121｜Expo UI Universal Row

**翻页：**[上一页：Universal RNHostView](./120-Universal-RNHostView.md) · [目录](./README.md) · [下一页：Universal ScrollView](./122-Universal-ScrollView.md)

**官方 Latest 页面：**[Row](https://docs.expo.dev/versions/latest/sdk/ui/universal/row/)

**SDK 56 对照：**[SDK v56.0.0 Row](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/row/)

**版本边界：**Latest 的 `@expo/ui` 推荐 `~57.0.18`；SDK v56.0.0 推荐 `~56.0.26`。Row 的布局、alignment、spacing 与基础示例一致；Latest example 加入系统 dark mode 下的 text colors。Latest 对 `modifiers` 如何取代相同类型 style-derived modifiers 有更具体说明，v56 页面仅说明 modifier escape hatch。

## Row 是什么

`Row` 是把子控件从 start 到 end 水平排列的布局容器，类似 React Native `flexDirection: 'row'` 的常见用途。Android 下对应 Jetpack Compose `Row`，iOS 对应 SwiftUI `HStack`，Web 对应有 flex 行布局的 React Native `View`。

安装当前 SDK 对应版本的 Expo UI package：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基础水平排列

用 `spacing` 控制相邻 children 的水平间距。SDK 56 可以用 Host 的普通 `style` 布局；Latest 官方例子另外用 `matchContents` 让 Host 按内容测量：

```tsx
import { Host, Row, Text } from '@expo/ui';

export default function BasicRow() {
  return (
    <Host style={{ flex: 1 }}>
      <Row spacing={8}>
        <Text>One</Text>
        <Text>Two</Text>
        <Text>Three</Text>
      </Row>
    </Host>
  );
}
```

Latest source 使用 `Host matchContents`；该容器是 Native UI 树的根。若你页面需要撑满 flex 布局，请像 v56 示例一样给 Host 具体 `flex: 1` 或 width / height。

## Cross-axis 对齐

Row 的主轴是水平，因此 `alignment` 控制垂直 cross-axis：

```tsx
import { Host, Row, Text } from '@expo/ui';

export default function RowAlignment() {
  return (
    <Host style={{ width: '100%', height: 160 }}>
      <Row spacing={8} alignment="center">
        <Text textStyle={{ fontSize: 30 }}>Large</Text>
        <Text>centered</Text>
      </Row>
    </Host>
  );
}
```

可选值：`start`（默认）、`center`、`end`。对齐的是各 child 的垂直位置，不影响它们沿水平方向的排列顺序。

## 用 Spacer 把两端内容推开

`Spacer flexible` 吸收 Row 可用的剩余空间，把首尾内容推向相反两端：

```tsx
import { Host, Row, Spacer, Text } from '@expo/ui';

export default function RowWithSpacer() {
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

如果项目支持深色模式，可从 React Native 读取 `useColorScheme()`，为文本指定适合当前系统主题的 `textStyle.color`，Latest 官方三个示例都包含了这类颜色处理；SDK v56 的代码示例以结构布局为重点，没有改变 Row API。

## Row API

| Prop | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode` | Row 内部要水平排列的任意 React nodes。 |
| `alignment` | `'start' \| 'center' \| 'end'` / `'start'` | 子元素沿垂直 cross-axis 对齐方式。 |
| `spacing` | `number` | 相邻 children 的水平 gap，单位为 density-independent points。 |
| `style` | 受限的 `ViewStyle` | padding、background、border、opacity、宽高等跨平台样式。 |
| `disabled` / `hidden` | `boolean` | 禁用或隐藏 Row。 |
| `onPress` | `() => void` | row pressed 时执行；若要获得整条 tappable row 语义，可优先看 `ListItem`。 |
| `onAppear` / `onDisappear` | `() => void` | Row 显示 / 移除时调用。 |
| `testID` | `string` | 用于测试查找。 |
| `modifiers` | `ModifierConfig[]` | SwiftUI / Jetpack Compose modifier 逃生口；Latest 页说明其会替换与之同型的 style-derived modifier。 |

## 关键名词

- **Main axis 主轴：**Row 的横向排列方向，children 从 start 到 end 排列。
- **Cross-axis 交叉轴：**与主轴垂直的方向；Row 中就是垂直方向，受 `alignment` 控制。
- **Spacing：**Row 内相邻子项间隔；不是 Row 外边距或 padding。
- **Flexible Spacer：**会扩张吸收剩余布局空间的元素；常用来分开左右两端内容。
- **Density-independent points：**与设备密度无关的逻辑布局单位，不等于物理像素。

## 官方代码主题覆盖

Latest 与 v56 Row 源页代码主题全部覆盖：四种包管理器安装 `@expo/ui`；基础水平列表；cross-axis alignment；用 `Spacer flexible` 把内容推向两端；暗色主题文本（Latest example）；以及 Row 的 alignment / spacing / style / visibility / callbacks / modifiers / testID API。

## 下一页

官方页脚 **Next** 是 [Universal ScrollView](https://docs.expo.dev/versions/latest/sdk/ui/universal/scrollview/)，介绍 Expo UI 平台原生滚动容器与横向 / 纵向滚动模式。

**翻页：**[上一页：Universal RNHostView](./120-Universal-RNHostView.md) · [返回目录](./README.md) · [下一页：Universal ScrollView](./122-Universal-ScrollView.md)
