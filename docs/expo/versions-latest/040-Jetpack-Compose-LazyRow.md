# 040｜Jetpack Compose LazyRow（next SDK）

**翻页：**[上一页：Jetpack Compose LazyColumn（next SDK）](./039-Jetpack-Compose-LazyColumn.md) · [目录](./README.md) · [下一页：Jetpack Compose ListItem（next SDK）](./041-Jetpack-Compose-ListItem.md)

**官方页面：**[Jetpack Compose LazyRow · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/lazyrow/)

**版本边界：**本页来自 Expo unversioned / next SDK 文档。Stable Latest（SDK57）LazyRow 推荐 @expo/ui ~57.0.12；SDK v56 精确 reference 推荐 ~56.0.26。和 LazyColumn 一样，原生可视项会 lazy compose，但 React 侧仍会先创建传入的全部 children。

## 横向滚动的惰性列表

LazyRow 让内容沿水平方向滚动，原生侧只组合 viewport 附近的项目。Host 需要有限高度，LazyRow 才能计算横向滚动区域。

Basic LazyRow 示例用 100 条文字项展示一行可水平滚动的列表：

```tsx
import { Host, LazyRow, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { border, padding } from '@expo/ui/jetpack-compose/modifiers';

const items = Array.from({ length: 100 }, (_, index) => 'Item ' + (index + 1));

export default function BasicLazyRow() {
  const colors = useMaterialColors();

  return (
    <Host style={{ height: 100 }}>
      <LazyRow>
        {items.map(item => (
          <Text
            key={item}
            style={{ fontSize: 28 }}
            color={colors.onBackground}
            modifiers={[
              border(1, colors.outline),
              padding(12, 6, 12, 6),
            ]}>
            {item}
          </Text>
        ))}
      </LazyRow>
    </Host>
  );
}
```

列表可以比视口长，触摸横向滑动以浏览内容。

## 横向间距和垂直对齐

horizontalArrangement 控制主轴的 spacing / 分布，verticalAlignment 控制单行内容的上下对齐：

```tsx
import { Host, LazyRow, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { border, padding } from '@expo/ui/jetpack-compose/modifiers';

export function SpacedLazyRow() {
  const colors = useMaterialColors();

  return (
    <Host style={{ height: 100 }}>
      <LazyRow
        horizontalArrangement={{ spacedBy: 16 }}
        verticalAlignment="center">
        {['First', 'Second', 'Third'].map(label => (
          <Text
            key={label}
            style={{ fontSize: 28 }}
            color={colors.onBackground}
            modifiers={[border(1, colors.outline), padding(12, 6, 12, 6)]}>
            {label}
          </Text>
        ))}
      </LazyRow>
    </Host>
  );
}
```

horizontalArrangement 也接受 start、end、center、spaceBetween、spaceAround 和 spaceEvenly 等预设项。

## 滚动内容边缘 padding

contentPadding 为滚动区域的内容设置内边距，不改变 Host 的外层尺寸：

```tsx
import { Host, LazyRow, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { border, padding } from '@expo/ui/jetpack-compose/modifiers';

export function PaddedLazyRow() {
  const colors = useMaterialColors();

  return (
    <Host style={{ height: 100 }}>
      <LazyRow
        contentPadding={{ start: 16, top: 8, end: 16, bottom: 8 }}>
        {['One', 'Two', 'Three'].map(label => (
          <Text
            key={label}
            style={{ fontSize: 28 }}
            color={colors.onBackground}
            modifiers={[border(1, colors.outline), padding(12, 6, 12, 6)]}>
            {label}
          </Text>
        ))}
      </LazyRow>
    </Host>
  );
}
```

## API 属性

| Prop | 默认 / 含义 |
| --- | --- |
| children | 水平列表的 Compose items。 |
| contentPadding | number dp 或 start / top / end / bottom 四边值对象。 |
| horizontalArrangement | start、end、center、spaceBetween、spaceAround、spaceEvenly 或 spacedBy(number)。 |
| verticalAlignment | top、bottom、center。 |
| modifiers | Expo ModifierConfig[]。 |

如 LazyColumn，LazyRow 仅在 native Compose 一侧减少可见 item 组合；若 JS 侧产生数万节点，仍会有 React memory / mount 成本，可考虑 FlashList 或 Legend List。

## 关键名词

- **LazyRow**：可水平滚动、原生侧按可视区域惰性组合内容的行布局。
- **HorizontalArrangement**：控制滚动主轴的项目间隔和分布。
- **VerticalAlignment**：控制同一行项目在垂直方向的对齐。
- **ContentPadding**：列表内容到左右 / 上下视口边界的内边距。
- **Viewport / 有限约束**：滚动容器可视区域的有限宽高。
- **Stable key**：列表项身份标识，帮助 React 在数组改变后正确对应旧节点。
- **React lazy limit**：当前 Expo UI 仍先构造 React children，原生 lazy rendering 不等于 JS 虚拟列表。

## 官方代码主题覆盖

源页所有代码示例均有改写：@expo/ui 安装 / RN 前置条件、100-item 横向 LazyRow、Arrangement 的 horizontal spacing 与 vertical alignment、contentPadding 四边。API children、横向预设值、垂直对齐和 ModifierConfig 均有列举；Native Compose 与 React node 构造的性能边界已说明。

## 下一页

页脚 **Next** 指向 [Jetpack Compose ListItem](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/listitem/)，展示可组合 headline / supporting / leading / trailing 内容的单行列表项。

**翻页：**[上一页：Jetpack Compose LazyColumn（next SDK）](./039-Jetpack-Compose-LazyColumn.md) · [返回目录](./README.md) · [下一页：Jetpack Compose ListItem（next SDK）](./041-Jetpack-Compose-ListItem.md)
