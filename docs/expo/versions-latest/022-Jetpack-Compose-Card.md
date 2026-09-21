# 022｜Jetpack Compose Card

**翻页：**[上一页：Jetpack Compose Button](./021-Jetpack-Compose-Button.md) · [目录](./README.md) · [下一页：Jetpack Compose Carousel](./023-Jetpack-Compose-Carousel.md)

**官方页面：**[Jetpack Compose Card](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/card/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.18；SDK v56 精确 reference [Card](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/card/) 中 bundled 版本为 ~56.0.19。本组件只运行在 Android Jetpack Compose，也可以在 Expo Go 预览。

## Card 是什么

Card 是 Material 3 样式的内容容器，用于将文字、图片或其它 Compose children 放在有背景、层级或边框的表面内：

- Card：filled surface，带默认 tonal elevation。
- ElevatedCard：用阴影表现更高的层级。
- OutlinedCard：用描边突出边界。

这些是 Android 专属 Jetpack Compose 组件。跨平台 app 可使用 Expo UI 的 universal Card，再由 Expo 选择适配当前平台的原生组件。

## 安装

通过 Expo CLI 安装与 SDK 配套的 @expo/ui 版本：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

既有 bare React Native app 还要先接入 Expo package，才能使用 Expo UI。

## 基础 Card 与内容间距

Host 将 Compose 原生视图树嵌入 RN layout。matchContents 会让 Host 按子内容计算尺寸；paddingAll 是一个 Compose Modifier helper：

```tsx
import { Card, Host, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function BasicCard() {
  return (
    <Host matchContents>
      <Card>
        <Text modifiers={[paddingAll(16)]}>
          这是一个带默认样式的 Material 卡片。
        </Text>
      </Card>
    </Host>
  );
}
```

## 填充、Elevated 和 Outlined

使用不同组件表达内容的强调层级。Column 将三个例子垂直排列，spacedBy 设置它们之间的间距：

```tsx
import {
  Card,
  Column,
  ElevatedCard,
  Host,
  OutlinedCard,
  Text,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export function CardVariants() {
  return (
    <Host matchContents>
      <Column verticalArrangement={{ spacedBy: 12 }}>
        <Card>
          <Text modifiers={[paddingAll(16)]}>Filled card</Text>
        </Card>
        <ElevatedCard>
          <Text modifiers={[paddingAll(16)]}>Elevated card</Text>
        </ElevatedCard>
        <OutlinedCard>
          <Text modifiers={[paddingAll(16)]}>Outlined card</Text>
        </OutlinedCard>
      </Column>
    </Host>
  );
}
```

## 调整 elevation

ElevatedCard 的 elevation 以 dp 为单位。Material 3 默认约为 1dp，提高到 8dp 会产生更明显的投影。filled Card 使用 tonal elevation，所以提高数值时阴影可能变化较轻：

```tsx
import { ElevatedCard, Host, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export function RaisedCard() {
  return (
    <Host matchContents>
      <ElevatedCard elevation={8}>
        <Text modifiers={[paddingAll(16)]}>Elevation 为 8dp</Text>
      </ElevatedCard>
    </Host>
  );
}
```

## 自定义边框

Card 与 OutlinedCard 接受 border，可设置边线宽度和颜色：

```tsx
import { Host, OutlinedCard, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export function BorderedCard() {
  return (
    <Host matchContents>
      <OutlinedCard border={{ width: 2, color: '#6200EE' }}>
        <Text modifiers={[paddingAll(16)]}>紫色描边卡片</Text>
      </OutlinedCard>
    </Host>
  );
}
```

## API 属性

| 属性 | 含义 |
| --- | --- |
| children | 组成卡片内容的 React / Compose 节点。 |
| colors | 设置卡片容器与内容的核心颜色。 |
| elevation | 设置 dp 单位的高度 / 阴影层级。 |
| modifiers | Compose 的布局和绘制修饰器数组。 |
| border | Card 或 OutlinedCard 的边线配置。 |

| 组件 | 默认外观 | 属性差异 |
| --- | --- | --- |
| Card | 填充 surface | 使用 tonal elevation；支持 colors、elevation、modifiers。 |
| ElevatedCard | 抬高 surface | 默认约 1dp 阴影；支持 elevation、colors、modifiers。 |
| OutlinedCard | 描边 surface | 支持 border、elevation、colors、modifiers。 |

CardBorder 的 width 默认 1dp，color 是描边颜色：

| CardBorder 字段 | 类型 | 说明 |
| --- | --- | --- |
| width | number | 描边宽度，单位 dp。 |
| color | ColorValue | 描边颜色。 |

CardColors 可设置表面与内容颜色：

| CardColors 字段 | 类型 | 说明 |
| --- | --- | --- |
| containerColor | ColorValue | 卡片容器背景色。 |
| contentColor | ColorValue | 卡片内容前景色。 |

## 关键名词

- **Material 3**：Android Material Design 的新一代组件体系。
- **Elevation**：表面层级提示，会改变阴影表现。
- **dp**：density-independent pixels，按逻辑尺寸表达的 Android 单位。
- **Tonal elevation**：通过表面色调变化表示层级；数值变化时阴影可能不明显。
- **Modifier**：Compose 的布局 / 绘制 / 间距修饰链。
- **Host**：Expo UI 在 React Native layout 中承载 Compose 原生控件的容器。
- **Outlined**：通过边框标明容器边界的视觉变体。

## 官方代码主题覆盖

源页所有示例均已改写：@expo/ui 安装命令、已有 RN app 的 Expo package 前置说明、Host + Card + paddingAll 基本用法、Card / ElevatedCard / OutlinedCard 变体和 Column spacing、ElevatedCard 的 8dp 高度、OutlinedCard 自定义 2dp 紫色描边。API 中 children、colors、elevation、modifiers、border 以及 CardBorder / CardColors 类型字段都已说明。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Carousel](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/carousel/)，介绍 Android 横向轮播组件和三种浏览布局。

**翻页：**[上一页：Jetpack Compose Button](./021-Jetpack-Compose-Button.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Carousel](./023-Jetpack-Compose-Carousel.md)
