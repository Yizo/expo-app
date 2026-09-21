# 041｜Jetpack Compose ListItem（next SDK 文档链）

**翻页：**[上一页：Jetpack Compose LazyRow](./040-Jetpack-Compose-LazyRow.md) · [目录](./README.md) · [下一页：Jetpack Compose LoadingIndicator](./042-Jetpack-Compose-LoadingIndicator.md)

**官方页面：**[Jetpack Compose ListItem · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/listitem/)

**版本边界：**本链从 Expo `versions/latest` 出发，当前官方 `unversioned` / next SDK 页无法被浏览工具直接读取；本页代码和 API 对照了[当前 Latest ListItem](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/listitem/)及[项目使用版本 SDK 56 的 ListItem 文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/listitem/)。Latest 推荐 `@expo/ui ~57.0.18`，SDK 56 推荐 `~56.0.18`。项目若运行 SDK 56，应优先按 v56 文档和本地包版本实现。

## 用于结构化行项目的组件

Expo UI 的 `ListItem` 对应 Android Jetpack Compose Material 3 的同名组件。它把一行拆成标题、上方标签、辅助说明、前置内容和尾随内容等区域，适合设置行、消息列表条目、菜单项等。

本组件目前是 Android 原生 UI；`Host` 把 Expo UI 的 Compose 内容放进 React Native 页面。先安装 Expo UI：

```sh
npx expo install @expo/ui
# 也可以按项目使用的包管理器执行：
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

已有的纯 React Native 工程还需要先安装并配置 `expo`。

## 最简标题行

每个 `ListItem` 通过复合子组件指定内容槽位。最简示例只提供标题：

```tsx
import { Host, ListItem, Text } from '@expo/ui/jetpack-compose';

export default function BasicListItem() {
  return (
    <Host matchContents>
      <ListItem>
        <ListItem.HeadlineContent>
          <Text>Settings</Text>
        </ListItem.HeadlineContent>
      </ListItem>
    </Host>
  );
}
```

`matchContents` 让 Host 的尺寸跟随子内容。`HeadlineContent` 是 ListItem 的主标题槽；示例显示一行“Settings”。

## 使用所有常见内容槽

复合子组件可以分别设置 overline、headline、supporting、leading 和 trailing 内容。下面示例把通知设置标题、账号标签、说明和两侧图标组合到一行：

```tsx
import {
  Host,
  ListItem,
  Icon,
  Text,
} from '@expo/ui/jetpack-compose';

export default function ListItemWithSlots() {
  return (
    <Host matchContents>
      <ListItem>
        <ListItem.HeadlineContent>
          <Text>Notifications</Text>
        </ListItem.HeadlineContent>
        <ListItem.OverlineContent>
          <Text>ACCOUNT</Text>
        </ListItem.OverlineContent>
        <ListItem.SupportingContent>
          <Text>Manage notification preferences</Text>
        </ListItem.SupportingContent>
        <ListItem.LeadingContent>
          <Icon source={require('./assets/notifications.xml')} />
        </ListItem.LeadingContent>
        <ListItem.TrailingContent>
          <Icon source={require('./assets/chevron.xml')} />
        </ListItem.TrailingContent>
      </ListItem>
    </Host>
  );
}
```

XML 图标文件需要存在于对应路径，并符合 Expo UI Icon 的资源格式。Leading 表示行内容的前侧，Trailing 表示末侧；在 RTL 语言布局中它们指逻辑方向，不应简单理解成固定的屏幕左边和右边。

## 点击整行

官方示例使用 `clickable` modifier 为整行添加点击回调：

```tsx
import { Host, ListItem, Text } from '@expo/ui/jetpack-compose';
import { clickable } from '@expo/ui/jetpack-compose/modifiers';

export default function ClickableListItem() {
  return (
    <Host matchContents>
      <ListItem modifiers={[clickable(() => console.log('Tapped!'))]}>
        <ListItem.HeadlineContent>
          <Text>Tap me</Text>
        </ListItem.HeadlineContent>
      </ListItem>
    </Host>
  );
}
```

业务页面通常会在回调中执行导航或状态更新。若整行可操作，也应确保用户能看出它可点击，并为屏幕阅读器提供符合语义的内容和操作反馈。

## 标题槽里组合自定义内容

一个槽不局限于单个 `Text`，也可以使用 Row 等 Compose 组件组合图标和文字：

```tsx
import {
  Host,
  ListItem,
  Text,
  Row,
  Icon,
} from '@expo/ui/jetpack-compose';

export default function ListItemCustomHeadline() {
  return (
    <Host matchContents>
      <ListItem>
        <ListItem.HeadlineContent>
          <Row
            horizontalArrangement={{ spacedBy: 8 }}
            verticalAlignment="center">
            <Text>Premium Feature</Text>
            <Icon source={require('./assets/star.xml')} size={16} />
          </Row>
        </ListItem.HeadlineContent>
      </ListItem>
    </Host>
  );
}
```

`spacedBy: 8` 让 Row 的子元素间距为 8 dp；`verticalAlignment="center"` 垂直居中对齐图标与文本。

## API 摘要

```tsx
import { ListItem } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`，可选 | 放置 `HeadlineContent`、`SupportingContent` 等槽位内容。 |
| `colors` | `ListItemColors`，可选 | 分别为容器和各内容槽配置颜色。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose 修饰器，例如点击交互。 |
| `shadowElevation` | `number`，默认 `ListItemDefaults.Elevation` | 阴影高度，单位 dp。 |
| `tonalElevation` | `number`，默认 `ListItemDefaults.Elevation` | 色调高度，影响 Material 色彩表面效果，单位 dp。 |

`ListItemColors` 可逐项设定以下颜色，均为可选 `ColorValue`：

| 字段 | 着色区域 |
| --- | --- |
| `containerColor` | 行的容器背景。 |
| `contentColor` | 主要内容。 |
| `leadingContentColor` | 前置内容。 |
| `overlineContentColor` | 上方标签内容。 |
| `supportingContentColor` | 辅助说明。 |
| `trailingContentColor` | 尾随内容。 |

## 关键名词

- **ListItem**：Material 3 的结构化单行列表组件，不等同于 React Native 的任意 View。
- **复合组件 / Compound component**：父组件和配套子组件协作描述 UI；此处用 `ListItem.HeadlineContent` 等子组件声明每块内容的角色。
- **内容槽 / Slot**：预留给特定用途的区域。Overline 常作眉题或分类标签，Headline 是主标题，Supporting 是次要说明，Leading / Trailing 是行两侧的辅助内容。
- **Modifier**：Compose 的布局、绘制或交互修饰器；Expo UI 通过 `modifiers` 数组应用，例如 `clickable`。
- **dp**：Android 独立于屏幕物理像素密度的布局单位。API 的 elevation 和 Compose spacing 通常以 dp 表示。
- **阴影高度与色调高度**：前者描述投影的视觉高度；后者控制 Material 表面与主题色的混合层次，两者是不同的视觉参数。
- **逻辑前后侧**：Leading / Trailing 会配合从左到右或从右到左的语言方向布局。

## 官方代码主题覆盖

本页保留官方安装命令和四个示例：基础标题、五种 compound slots 与 XML 图标、clickable 点击、Row + 图标的自定义 headline。API 表覆盖 children、colors、modifiers、两类 elevation 及 `ListItemColors` 六种颜色字段。代码路径里的图标资源需由项目提供。

## 下一页

Latest 参考页页脚 **Next** 指向 [Jetpack Compose LoadingIndicator](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/loadingindicator/)，介绍无进度值的连续加载动画与传入进度的加载指示器。

**翻页：**[上一页：Jetpack Compose LazyRow](./040-Jetpack-Compose-LazyRow.md) · [返回目录](./README.md) · [下一页：Jetpack Compose LoadingIndicator](./042-Jetpack-Compose-LoadingIndicator.md)
