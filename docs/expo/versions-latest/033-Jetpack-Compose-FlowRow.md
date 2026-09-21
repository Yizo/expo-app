# 033｜Jetpack Compose FlowRow（next SDK）

**翻页：**[上一页：Jetpack Compose FloatingActionButton（next SDK）](./032-Jetpack-Compose-FloatingActionButton.md) · [目录](./README.md) · [下一页：Jetpack Compose HorizontalFloatingToolbar（next SDK）](./034-Jetpack-Compose-HorizontalFloatingToolbar.md)

**官方页面：**[FlowRow · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/flowrow/)

**版本边界：**本页沿上页 Next 进入 Expo unversioned / next SDK 文档，不属于当前 SDK57 Latest 稳定参考。访问时 next SDK 文档显示推荐 @expo/ui ~58.0.2；SDK57 稳定 FlowRow 为 ~57.0.16，SDK v56 精确页为 ~56.0.21。本地项目使用 SDK56，应以 npx expo install 选择兼容包，并确认 useMaterialColors 等新增字段是否已安装。

## FlowRow 用来自动换行

FlowRow 按水平方向排列 children；当前行空间放不下时，会将剩余项目流到下一行。它适合数量变化的标签、筛选 chips、属性 badge 等布局。

这与普通 Compose Row 不同：Row 不会自动折到下一行；FlowRow 像 CSS 的 flex-wrap，但尺寸、modifier 和 Arrangement 服从 Compose 布局规则。

## Material 标签的环绕布局

horizontalArrangement 控制同一行里标签的水平间距；verticalArrangement 控制多行之间的垂直间距：

```tsx
import {
  FlowRow,
  Host,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  border,
  padding,
  paddingAll,
} from '@expo/ui/jetpack-compose/modifiers';

export default function TagFlow() {
  const colors = useMaterialColors();
  const tags = [
    'React Native',
    'Expo',
    'Android',
    'Jetpack Compose',
    'Material 3',
    'Kotlin',
  ];

  return (
    <Host style={{ flex: 1 }}>
      <FlowRow
        horizontalArrangement={{ spacedBy: 8 }}
        verticalArrangement={{ spacedBy: 8 }}
        modifiers={[paddingAll(16)]}>
        {tags.map(tag => (
          <Text
            key={tag}
            style={{ fontSize: 28 }}
            color={colors.onBackground}
            modifiers={[
              border(1, colors.outline),
              padding(12, 6, 12, 6),
            ]}>
            {tag}
          </Text>
        ))}
      </FlowRow>
    </Host>
  );
}
```

Host 占用可分配的屏幕空间，FlowRow 根据实际宽度决定每一行放多少标签；不能预先假设某个项目总在同一行。

## API

| Prop | 用途 |
| --- | --- |
| children | 要参与流式排列的 React / Compose 节点。 |
| horizontalArrangement | 同一行内 child 的排列 / 间距规则。 |
| verticalArrangement | 多行之间的排列 / 间距规则。 |
| modifiers | 从 PrimitiveBaseProps 继承的布局、绘制或边距 modifiers。 |

## 关键名词

- **Flow layout / flex-wrap**：主方向剩余空间不足时，将后续子项折到下一行的布局模式。
- **HorizontalArrangement**：设置同一行内元素的顺序、间距及对齐。
- **VerticalArrangement**：设置换行后各行之间的距离。
- **Modifier**：Compose 的尺寸、padding、border、绘制等修饰链。
- **Material colors**：由 Material theme 提供的语义颜色，便于适配亮色 / 暗色主题。
- **next SDK / unversioned**：Expo 提前发布的下一版开发文档，接口可能尚未进入稳定 SDK。

## 官方代码主题覆盖

源页代码均已重写：@expo/ui 安装与已有 RN app 前置条件、Host 与 FlowRow、动态 tags array、Material theme colors、horizontal / vertical spacedBy、border、padding / paddingAll modifiers。Component API 的 children、horizontalArrangement、verticalArrangement 和 PrimitiveBaseProps 继承关系也已说明。

## 下一页

沿官方 Jetpack Compose 导航继续到 next SDK 的 [HorizontalFloatingToolbar](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/horizontalfloatingtoolbar/)，用于把一组操作悬浮在可滚动内容上。

**翻页：**[上一页：Jetpack Compose FloatingActionButton（next SDK）](./032-Jetpack-Compose-FloatingActionButton.md) · [返回目录](./README.md) · [下一页：Jetpack Compose HorizontalFloatingToolbar（next SDK）](./034-Jetpack-Compose-HorizontalFloatingToolbar.md)
