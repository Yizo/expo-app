# 057｜Jetpack Compose Spacer

**翻页：**[上一页：Jetpack Compose Snackbar](./056-Jetpack-Compose-Snackbar.md) · [目录](./README.md) · [下一页：Jetpack Compose Surface](./058-Jetpack-Compose-Surface.md)

**官方页面：**[Jetpack Compose Spacer · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/spacer/)

**版本边界：**Latest 页快照推荐 `@expo/ui ~57.0.10`，搜索索引另一份快照为 `~57.0.19`；Expo 的 v56 reference 索引列有 Jetpack Compose Spacer，但检索工具未取到其单独版本化页面。SDK 56 通用 Spacer 采用 `size` / `flexible` props；本页 Compose 专用 Spacer 采用 modifiers。项目中请对照安装包的实际版本。

## Row / Column 内的空白布局项

Compose `Spacer` 是一个没有可视内容的布局子项，用来在 `Row` / `Column` 兄弟节点间留空。使用 `weight()` 可填充父布局剩余空间；也可以用宽度、高度等固定尺寸 modifier 创建固定 gap。

安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 用权重填充剩余空间

在 Row 两端放文字，中间的 Spacer 用 `weight(1)` 占据剩余宽度：

```tsx
import { Host, Row, Spacer, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';

export default function SpacerWeightExample() {
  return (
    <Host matchContents>
      <Row modifiers={[fillMaxWidth()]}>
        <Text>Left</Text>
        <Spacer modifiers={[weight(1)]} />
        <Text>Right</Text>
      </Row>
    </Host>
  );
}
```

`weight(1)` 代表按剩余空间中的权重比例参与分配；若其他兄弟也设 weight，会按总权重比例分摊。此 spacer 放在 Row 内，填充水平方向剩余空间；放在 Column 内时则填充纵向主轴空间。

## 固定尺寸间隔

在 Column 中设置 24 dp 高的 Spacer，可在上下文本之间增加垂直空隙：

```tsx
import { Host, Column, Spacer, Text } from '@expo/ui/jetpack-compose';
import { height } from '@expo/ui/jetpack-compose/modifiers';

export default function SpacerFixedSizeExample() {
  return (
    <Host matchContents>
      <Column>
        <Text>Above</Text>
        <Spacer modifiers={[height(24)]} />
        <Text>Below (24dp gap)</Text>
      </Column>
    </Host>
  );
}
```

需要在 Row 里留固定水平间距时，同样可以对 Spacer 使用 `width(value)` modifier。

## API

```tsx
import { Spacer } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 / 说明 |
| --- | --- |
| `modifiers` | `ModifierConfig[]`，可选。使用 `weight()` 让 Spacer 灵活撑开，也可传 `width()` / `height()` 固定尺寸。 |

官方 API 还展示最小用法：

```tsx
<Row>
  <Text>Left</Text>
  <Spacer modifiers={[weight(1)]} />
  <Text>Right</Text>
</Row>
```

Expo UI 的 universal `Spacer` 是另一层跨平台组件，其 API 使用 `<Spacer flexible />` 或 `<Spacer size={32} />`；不要把它与当前 Compose 子路径下的 modifiers API 混在一起。

## 关键名词

- **Spacer**：参与布局、但不绘制内容的空白项。和 Margin 不同，它是父 Row / Column 里的一个子节点。
- **Weight / 权重**：分配剩余主轴空间的比例因子；权重 1 不是固定 1 dp。
- **主轴 / Main axis**：Row 的水平轴，Column 的垂直轴。Spacer 的 flex 方向由父容器决定。
- **固定 gap**：用 height 或 width modifier 设定具体大小，例如 `height(24)` 的 24 dp。
- **Modifier**：以数组形式传递给 Compose 原生视图的布局 / 绘制修饰器。
- **Expo UI universal component**：从 `@expo/ui` 根入口导入的跨平台组件，属性和 Compose 专用组件可能不同。

## 官方代码主题覆盖

保留安装命令、weight Spacer 推开 Row 两端子项的示例、height 固定间隔的 Column 示例和 API 最小片段。注明 Latest / universal 与 SDK 56 通用 Spacer 的属性差异。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Surface](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/surface/)，介绍 Material 3 表面容器、颜色和高度。

**翻页：**[上一页：Jetpack Compose Snackbar](./056-Jetpack-Compose-Snackbar.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Surface](./058-Jetpack-Compose-Surface.md)
