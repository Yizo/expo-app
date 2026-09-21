# 039｜Jetpack Compose LazyColumn（next SDK）

**翻页：**[上一页：Jetpack Compose IconButton（next SDK）](./038-Jetpack-Compose-IconButton.md) · [目录](./README.md) · [下一页：Jetpack Compose LazyRow（next SDK）](./040-Jetpack-Compose-LazyRow.md)

**官方页面：**[Jetpack Compose LazyColumn · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/lazycolumn/)

**版本边界：**此页来自 Expo unversioned / next SDK 分支。Stable Latest（SDK57）推荐 @expo/ui ~57.0.19；SDK v56 精确 reference 推荐 ~56.0.18。Expo 的 LazyColumn 目前还没有在 React 层真正惰性创建 children，因此超大数据集仍需评估 FlashList / Legend List。

## 纵向可滚动列表

LazyColumn 是 Compose 的垂直滚动容器，会在 Android 原生侧只组合可见区域附近的项目。它和普通 Column 不同：Column 会把所有 children 一次铺开，LazyColumn 会滚动并按可见窗口绘制。

一个基本示例先创建 items 数组，再映射为带稳定 key 的 ListItem：

```tsx
import {
  Host,
  LazyColumn,
  ListItem,
  Text,
} from '@expo/ui/jetpack-compose';

const items = Array.from({ length: 100 }, (_, index) => 'Item ' + (index + 1));

export default function BasicLazyColumn() {
  return (
    <Host style={{ height: 400 }}>
      <LazyColumn>
        {items.map(item => (
          <ListItem key={item}>
            <ListItem.HeadlineContent>
              <Text>{item}</Text>
            </ListItem.HeadlineContent>
          </ListItem>
        ))}
      </LazyColumn>
    </Host>
  );
}
```

Host 必须提供有限高度，使 LazyColumn 知道它能滚动的 viewport 范围。若包在 matchContents 的 Host 中，不要在竖直滚动轴上让内容无边界扩张。

## 排列、间距和对齐

verticalArrangement 控制竖直主轴上的顺序和间隔；horizontalAlignment 控制每个 item 的水平位置。spacedBy(8) 用 dp 为相邻项目留出固定间距：

```tsx
import { Host, LazyColumn, ListItem, Text } from '@expo/ui/jetpack-compose';

export function SpacedLazyColumn() {
  return (
    <Host style={{ height: 400 }}>
      <LazyColumn
        verticalArrangement={{ spacedBy: 8 }}
        horizontalAlignment="center">
        <ListItem>
          <ListItem.HeadlineContent><Text>间隔项目 1</Text></ListItem.HeadlineContent>
        </ListItem>
        <ListItem>
          <ListItem.HeadlineContent><Text>间隔项目 2</Text></ListItem.HeadlineContent>
        </ListItem>
        <ListItem>
          <ListItem.HeadlineContent><Text>间隔项目 3</Text></ListItem.HeadlineContent>
        </ListItem>
      </LazyColumn>
    </Host>
  );
}
```

verticalArrangement 还支持 top、bottom、center、spaceBetween、spaceAround 和 spaceEvenly。

## 给滚动内容设置 padding

contentPadding 设置列表内容离四周视口边缘的距离，而不是改变 LazyColumn 外部 Host 的大小：

```tsx
import { Host, LazyColumn, ListItem, Text } from '@expo/ui/jetpack-compose';

export function PaddedLazyColumn() {
  return (
    <Host style={{ height: 400 }}>
      <LazyColumn
        contentPadding={{ start: 16, top: 8, end: 16, bottom: 8 }}>
        <ListItem>
          <ListItem.HeadlineContent><Text>内缩项目 1</Text></ListItem.HeadlineContent>
        </ListItem>
        <ListItem>
          <ListItem.HeadlineContent><Text>内缩项目 2</Text></ListItem.HeadlineContent>
        </ListItem>
        <ListItem>
          <ListItem.HeadlineContent><Text>内缩项目 3</Text></ListItem.HeadlineContent>
        </ListItem>
      </LazyColumn>
    </Host>
  );
}
```

## “Lazy” 的性能边界

LazyColumn 的原生 Compose renderer 只显示视口附近的 row，但 Expo UI 当前仍会在 React 侧先创建传入的所有 children。对几千条数据使用 items.map 时，首次渲染和 JS 内存仍可能有成本；它不是一比一等同于 RN FlatList / FlashList 的虚拟列表 API。

官方建议在超大数据集上评估 FlashList 或 Legend List。项目在 v56 使用 Expo UI LazyColumn 时，先测量真实数据量、首屏挂载时间和滚动体验，再判断是否适合。

## API 与 content padding

| 属性 | 默认 / 含义 |
| --- | --- |
| children | 要显示在纵向列表中的 Compose 节点。 |
| contentPadding | 列表内容的 dp 内边距。 |
| horizontalAlignment | start、end、center 三种水平对齐。 |
| verticalArrangement | top、bottom、center、spaceBetween、spaceAround、spaceEvenly，或 { spacedBy: number }。 |
| modifiers | Compose ModifierConfig[]，用于布局与绘制。 |

ContentPadding 对象可分别写 start、top、end、bottom 四边数值，单位均为 dp。

## 关键名词

- **Lazy composition**：Compose 只对当前可视窗口附近的原生 item 进行组合。
- **Viewport**：滚动容器可见的视口区域，由父 Host 提供有限尺寸。
- **ListItem**：Material 3 的一行列表内容组件，常通过 HeadlineContent 包含标题。
- **Arrangement**：设置垂直主轴项目顺序、间距或空间分配规则。
- **Alignment**：决定每行内容在水平交叉轴上的对齐方式。
- **ContentPadding**：滚动内容和 viewport 四周之间的内部留白。
- **Stable key**：每个列表子项的稳定身份标识，用于 React 更新期间匹配节点。
- **FlashList / Legend List**：可针对大量 React Native 数据列表优化的替代组件。

## 官方代码主题覆盖

源页所有示例均已重写：@expo/ui 安装和裸 RN app 前置条件、100 个动态 item 的基本 LazyColumn、verticalArrangement / horizontalAlignment、dp 间距预设、contentPadding 四边。LazyColumn 原生惰性组合但 React children 仍全部创建的当前限制、替代 list libraries 和完整 API 属性也已说明。

## 下一页

页脚 **Next** 指向 [Jetpack Compose LazyRow](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/lazyrow/)，介绍使用相同 lazy list 模型进行横向滚动。

**翻页：**[上一页：Jetpack Compose IconButton（next SDK）](./038-Jetpack-Compose-IconButton.md) · [返回目录](./README.md) · [下一页：Jetpack Compose LazyRow（next SDK）](./040-Jetpack-Compose-LazyRow.md)
