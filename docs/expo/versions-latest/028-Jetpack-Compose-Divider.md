# 028｜Jetpack Compose Divider

**翻页：**[上一页：Jetpack Compose DateTimePicker](./027-Jetpack-Compose-DateTimePicker.md) · [目录](./README.md) · [下一页：Jetpack Compose DockedSearchBar](./029-Jetpack-Compose-DockedSearchBar.md)

**官方页面：**[Jetpack Compose Divider](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/divider/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.10。本地应用使用 Expo SDK56；这篇 Divider 的 v56 精确子页当前未能从官方版本 reference cache 读取，因此要以 Expo UI v56 overview / 当前安装包核对属性。本组件在 Android Expo UI 中提供 HorizontalDivider 与 VerticalDivider。

## 水平分割线

HorizontalDivider 常放在 Column 的两个内容区块之间。它负责 Material 视觉分隔，不包含业务点击状态：

```tsx
import {
  Column,
  Host,
  HorizontalDivider,
  Text,
} from '@expo/ui/jetpack-compose';

export default function SectionDivider() {
  return (
    <Host matchContents>
      <Column>
        <Text>上半部分</Text>
        <HorizontalDivider />
        <Text>下半部分</Text>
      </Column>
    </Host>
  );
}
```

## 细线、粗线与颜色

两个 Divider 都支持 thickness 与 color。若要一像素细线，可使用 React Native StyleSheet.hairlineWidth；Android 的 Compose 布局会根据设备密度映射线宽：

```tsx
import { StyleSheet } from 'react-native';
import {
  Column,
  Host,
  HorizontalDivider,
  Text,
} from '@expo/ui/jetpack-compose';

export function DividerStyles() {
  return (
    <Host matchContents>
      <Column>
        <Text>hairline 细分割线</Text>
        <HorizontalDivider thickness={StyleSheet.hairlineWidth} />
        <Text>加粗的粉色分割线</Text>
        <HorizontalDivider thickness={4} color="#E91E63" />
        <Text>后续内容</Text>
      </Column>
    </Host>
  );
}
```

## 纵向分割线

并排内容可用 VerticalDivider 分隔；通常给 Row 一个明确高度，方便垂直分割线计算自身长度：

```tsx
import { Host, Row, Text, VerticalDivider } from '@expo/ui/jetpack-compose';
import { height } from '@expo/ui/jetpack-compose/modifiers';

export function SideBySideActions() {
  return (
    <Host matchContents>
      <Row verticalAlignment="center" modifiers={[height(48)]}>
        <Text>返回</Text>
        <VerticalDivider />
        <Text>继续</Text>
      </Row>
    </Host>
  );
}
```

## API

HorizontalDivider 和 VerticalDivider 共用 DividerCommonConfig：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| color | ColorValue | 分割线颜色。 |
| modifiers | ModifierConfig[] | Compose modifier 列表。 |
| thickness | number | 分割线粗细；可用 StyleSheet.hairlineWidth 表示一像素细线。 |

两个组件都是 Android Jetpack Compose 实现：

- **HorizontalDivider**：水平线，用于列表 / 区块之间。
- **VerticalDivider**：垂直线，用于横向排列的 Row。

## 关键名词

- **Divider**：不承载内容的线条，用于说明相邻内容之间的分组关系。
- **HorizontalDivider / VerticalDivider**：分别在横向或纵向的两个布局区块之间绘制分隔。
- **hairlineWidth**：尽可能接近屏幕物理一像素的细线宽度。
- **thickness**：线条粗细，Compose 数值使用 dp 逻辑尺寸。
- **Row / Column**：Compose 横排 / 竖排容器。
- **Modifier**：控制 Compose 组件尺寸、间距和绘制的修饰链。

## 官方代码主题覆盖

源页所有代码示例均已重写：@expo/ui 安装命令和 existing RN app 的 Expo 前置条件、Column 内水平分隔、hairline 与自定义粗细 / 颜色、Row 中带高度的 VerticalDivider。DividerCommonConfig 的 color、modifiers、thickness 属性已纳入表格。

## 下一页

官方页脚 **Next** 指向 [Jetpack Compose DockedSearchBar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dockedsearchbar/)，介绍不会扩展为全屏的内嵌搜索栏。

**翻页：**[上一页：Jetpack Compose DateTimePicker](./027-Jetpack-Compose-DateTimePicker.md) · [返回目录](./README.md) · [下一页：Jetpack Compose DockedSearchBar](./029-Jetpack-Compose-DockedSearchBar.md)
