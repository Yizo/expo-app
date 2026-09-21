# 026｜Jetpack Compose Column

**翻页：**[上一页：Jetpack Compose Chip](./025-Jetpack-Compose-Chip.md) · [目录](./README.md) · [下一页：Jetpack Compose DateTimePicker](./027-Jetpack-Compose-DateTimePicker.md)

**官方页面：**[Jetpack Compose Column](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/column/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.18；SDK v56 精确 reference [Column](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/column/) 推荐 ~56.0.26。本页是 Android Jetpack Compose 控件，可在 Expo Go 使用。Latest 示例的 Material theme helpers 应先与本地 Expo UI 版本核对。

## Column 负责竖向布局

Compose Column 将 children 沿垂直方向依次放置，和 React Native / Flexbox 默认竖排布局的视觉结果相似。它可以设定两项：

- verticalArrangement：控制沿垂直主轴的排列、间隔方式。
- horizontalAlignment：控制各 child 在水平交叉轴的位置。

Expo UI 的 Modifier helpers 可给 Column 设置填满宽度、padding 等布局属性。Host 把 Compose 原生 view tree 放到 RN layout 中。

## 示例：垂直堆叠并居中

```tsx
import {
  Column,
  Host,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  paddingAll,
} from '@expo/ui/jetpack-compose/modifiers';

export default function ColumnExample() {
  const colors = useMaterialColors();

  return (
    <Host style={{ flex: 1 }}>
      <Column
        verticalArrangement={{ spacedBy: 8 }}
        horizontalAlignment="center"
        modifiers={[fillMaxWidth(), paddingAll(16)]}>
        <Text style={{ fontSize: 28 }} color={colors.onBackground}>First</Text>
        <Text style={{ fontSize: 28 }} color={colors.onBackground}>Second</Text>
        <Text style={{ fontSize: 28 }} color={colors.onBackground}>Third</Text>
      </Column>
    </Host>
  );
}
```

spacedBy(8) 表示每一行之间增加 8dp 间距。fillMaxWidth() 让 Column 占据 Host 可用宽度；paddingAll(16) 在四周留出内部空间。useMaterialColors() 读取 Material 主题颜色，避免把 text color 与当前主题割裂。

## Column API

| Prop | 用途 |
| --- | --- |
| children | 沿垂直方向排列的 React / Compose children。 |
| verticalArrangement | 纵向主轴排列规则，常用来设置项间距。 |
| horizontalAlignment | children 的水平对齐方式，例如 center。 |
| verticalAlignment | 在适用的 Compose layout scope 中设置 child 垂直对齐。 |
| horizontalArrangement | 在适用的 Compose layout scope 中设置水平排列。 |

Column 还继承 PrimitiveBaseProps，例如 modifiers。属性来自 Jetpack Compose 布局模型，与 React Native StyleSheet 的写法不同。

## 关键名词

- **Column**：Compose 的竖向布局容器。
- **主轴**：当前布局的主要排列方向；Column 的主轴是垂直方向。
- **交叉轴**：垂直于主轴的方向；Column 的交叉轴是水平方向。
- **Arrangement**：设置同一方向上 children 的间距 / 排列方式。
- **Alignment**：设置 children 在某个轴上的对齐位置。
- **Modifier**：Compose 的尺寸、间距、布局或绘制修饰链。
- **Host**：Expo UI 在 React Native layout 中承载 Compose 原生控件的容器。
- **Material theme**：Material Design 的语义颜色和主题 token。

## 官方代码主题覆盖

源页唯一 usage 示例已重写：Expo UI Column 与 Host、读取 Material colors、3 个 Text children、verticalArrangement 的 spacedBy、horizontalAlignment、fillMaxWidth 和 paddingAll modifiers。ColumnProps 中 children、horizontal / vertical Alignment 与 Arrangement 以及 PrimitiveBaseProps 继承关系均有说明。

## 下一页

官方页脚 **Next** 指向 [Jetpack Compose DateTimePicker](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/datetimepicker/)，介绍原生日期和时间选择控件。

**翻页：**[上一页：Jetpack Compose Chip](./025-Jetpack-Compose-Chip.md) · [返回目录](./README.md) · [下一页：Jetpack Compose DateTimePicker](./027-Jetpack-Compose-DateTimePicker.md)
