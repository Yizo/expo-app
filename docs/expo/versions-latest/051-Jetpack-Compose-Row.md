# 051｜Jetpack Compose Row

**翻页：**[上一页：Jetpack Compose RNHostView](./050-Jetpack-Compose-RNHostView.md) · [目录](./README.md) · [下一页：Jetpack Compose SearchBar](./052-Jetpack-Compose-SearchBar.md)

**官方页面：**[Jetpack Compose Row · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/row/)

**版本边界：**Latest 页面推荐值在官方抓取快照中分别出现过 `@expo/ui ~57.0.10` 和 `~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/row/)推荐 `~56.0.26`。SDK-aware 安装请执行 `npx expo install @expo/ui`。

## 水平放置子组件

Expo UI Jetpack Compose `Row` 把子项沿水平方向排列，可配置水平方向分布和垂直方向对齐。如果需要同一份组件在 Android、iOS、Web 运行，官方建议看 Expo UI 通用 `Row`；本页只讲 Compose 组件。

安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 等距布局和垂直居中

下面让 Row 占满宽度、高度 60 dp；三个文字标签沿主轴平均分布，并在交叉轴上居中：

```tsx
import { Host, Row, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, height } from '@expo/ui/jetpack-compose/modifiers';

export default function RowExample() {
  return (
    <Host matchContents>
      <Row
        horizontalArrangement="spaceEvenly"
        verticalAlignment="center"
        modifiers={[fillMaxWidth(), height(60)]}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Row>
    </Host>
  );
}
```

## API

```tsx
import { Row } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`，可选 | Row 中要水平排列的子元素。 |
| `horizontalAlignment` | `HorizontalAlignment`，可选 | 子元素水平方向对齐方式。 |
| `horizontalArrangement` | `HorizontalArrangement`，可选 | 子元素沿水平主轴如何分布、间距如何设置。 |
| `verticalAlignment` | `VerticalAlignment`，可选 | 子元素沿垂直交叉轴如何对齐。 |
| `verticalArrangement` | `VerticalArrangement`，可选 | API 类型列表同时暴露此属性，用于设置纵向 arrangement。 |
| inherited props | `PrimitiveBaseProps` | Expo UI 原语的共享属性。 |

实际布局仍受父组件传来的宽高约束。例如 `spaceEvenly` 要先有多余的水平空间可分配；如果 Row 只按内容宽度测量，视觉上不会拉开到全屏宽。

## 关键名词

- **主轴 / Main axis**：Row 中为水平方向，决定子项从左到右（或 RTL 逻辑方向）如何排列。
- **交叉轴 / Cross axis**：Row 中为垂直方向，决定各子项相对行高如何对齐。
- **Arrangement**：主轴项目分布方式，如起始、居中、等距或设置固定间隔。
- **Alignment**：交叉轴对齐方式，例如 `center` 让 Row 中子项垂直居中。
- **Modifier**：Compose 布局配置。例中的 `fillMaxWidth()` 填满父级可用宽度，`height(60)` 设定高度。
- **dp**：Android 密度无关布局单位；这里 `height(60)` 以 dp 表示。
- **Compose Row 与通用 Row**：前者通过 `@expo/ui/jetpack-compose` 使用，只覆盖 Android Compose；后者通过 `@expo/ui` 提供跨平台统一 API。

## 官方代码主题覆盖

保留安装命令和官方完整 Row 示例，包含 `spaceEvenly`、垂直居中、fillMaxWidth、高度 modifier、三个子项与 Host。API 摘要列出官方页面展示的所有对齐、排列和内容 props。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose SearchBar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/searchbar/)，介绍原生搜索输入和占位内容槽。

**翻页：**[上一页：Jetpack Compose RNHostView](./050-Jetpack-Compose-RNHostView.md) · [返回目录](./README.md) · [下一页：Jetpack Compose SearchBar](./052-Jetpack-Compose-SearchBar.md)
