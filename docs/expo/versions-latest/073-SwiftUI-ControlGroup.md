# 073｜SwiftUI ControlGroup

**翻页：**[上一页：SwiftUI ContextMenu](./072-SwiftUI-ContextMenu.md) · [目录](./README.md) · [下一页：SwiftUI DatePicker](./074-SwiftUI-DatePicker.md)

**官方页面：**[SwiftUI ControlGroup · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/controlgroup/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/controlgroup/)推荐 `~56.0.26`。控件支持 iOS、tvOS 并可在 Expo Go 中使用；tvOS 至少要求 tvOS 17。`label` 与 `systemImage` 最低要求为 iOS 16 / tvOS 17。

## 将相关控件组合在一起

`ControlGroup` 是 SwiftUI 的交互控件容器。在 `Menu` 中使用时，多个子控件会压缩成一排紧凑的图标按钮，适合常见快捷操作。它本身不会打开菜单，下面的 `Menu` 才负责点击后展开操作列表。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 菜单中的快捷按钮组

下面把添加、收藏和分享放在同一组，再单独列出其他操作。`Menu` 的 `label` 与 `systemImage` 组成菜单入口；`ControlGroup` 的 children 可以是 Button、Toggle、Picker 等交互控件：

~~~tsx
import {
  Host,
  Menu,
  ControlGroup,
  Button,
} from '@expo/ui/swift-ui';

export default function BasicControlGroupExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu label="Options" systemImage="ellipsis.circle">
        <ControlGroup>
          <Button
            systemImage="plus"
            label="Add"
            onPress={() => console.log('Add')}
          />
          <Button
            systemImage="star"
            label="Favorite"
            onPress={() => console.log('Favorite')}
          />
          <Button
            systemImage="square.and.arrow.up"
            label="Share"
            onPress={() => console.log('Share')}
          />
        </ControlGroup>
        <Button
          label="Other Action"
          onPress={() => console.log('Other')}
        />
      </Menu>
    </Host>
  );
}
~~~

## API 速查

导入路径为 `@expo/ui/swift-ui`。

| 属性 | 类型 / 平台 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode`；tvOS 17+ | 控件组内容。可以包含 `Button`、`Toggle`、`Picker` 或其他交互控件。 |
| `label` | `React.ReactNode`，可选；iOS 16+ / tvOS 17+ | 控件组标签，可传简单字符串或自定义 `Label` 组件。省略时不显示标签。 |
| `systemImage` | SF Symbol 名称，可选；iOS 16+ / tvOS 17+ | 与字符串 `label` 一起显示的系统图标；label 为自定义 React 节点时不会使用此属性。 |

组件继承 Expo UI 的 `CommonViewModifierProps`。

### 新手术语

- **ControlGroup**：把多个相关的交互控件编成一组的 SwiftUI 组件。
- **SF Symbols**：Apple 系统图标库；例如 `ellipsis.circle` 是圆圈内的省略号。
- **平台最低版本**：属性或控件能运行所需的最低操作系统版本；目标系统过旧时要选择其他 UI 或做平台判断。

## 源页代码主题覆盖

已覆盖四种安装命令，以及官方将 `ControlGroup` 放入 `Menu`、并以系统图标按钮组合操作的完整示例；组件子节点、标签与 `systemImage` 的平台版本限制在属性表中说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/controlgroup/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/controlgroup/)

**翻页：**[上一页：SwiftUI ContextMenu](./072-SwiftUI-ContextMenu.md) · [目录](./README.md) · [下一页：SwiftUI DatePicker](./074-SwiftUI-DatePicker.md)
