# 083｜SwiftUI Label

**翻页：**[上一页：SwiftUI Image](./082-SwiftUI-Image.md) · [目录](./README.md) · [下一页：SwiftUI LazyHStack](./084-SwiftUI-LazyHStack.md)

**官方页面：**[SwiftUI Label · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/label/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/label/)推荐 `~56.0.26`。原生 Label 支持 iOS、tvOS，可在 Expo Go 中使用。

## 图标与标题的语义组合

SwiftUI `Label` 将图标和标题组合成一个完整语义单元，常用于列表、菜单和设置项。可以传 SF Symbols 名称，或提供自定义图标视图。若把可见标题隐藏为纯图标，仍应保留有意义的 `title`，让辅助功能能描述该操作。

安装：

~~~sh
npx expo install @expo/ui
~~~

## SF Symbol 与文字标题

`systemImage` 设置系统符号名，`title` 设置面向用户的标签：

~~~tsx
import { Host, Label } from '@expo/ui/swift-ui';

export default function BasicLabelExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Label title="Favorites" systemImage="star.fill" />
    </Host>
  );
}
~~~

## 自定义图标视图

`icon` 接收 React 节点，可传入 Expo UI 的 `Image`，并自定义大小和颜色：

~~~tsx
import { Host, Label, Image } from '@expo/ui/swift-ui';

export default function LabelCustomIconExample() {
  return (
    <Host matchContents>
      <Label
        title="Custom Icon"
        icon={
          <Image systemName="sparkles" size={20} color="purple" />
        }
      />
    </Host>
  );
}
~~~

## 只显示图标

`labelStyle('iconOnly')` 隐藏可见文字。即使视觉上不显示标题，也保留有意义的 `title` 供无障碍服务使用：

~~~tsx
import { Host, Label } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

export default function LabelIconOnlyExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Label
        title="Settings"
        systemImage="gear"
        modifiers={[labelStyle('iconOnly')]}
      />
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string`（可选） | 要显示的文字标题；图标模式下仍可作为无障碍名称。 |
| `systemImage` | SF Symbols 名称（可选） | 用 Apple 系统图标库中的符号名称显示图标。 |
| `icon` | `React.ReactNode`（可选） | 自定义图标视图；优先于 `systemImage`。 |
| `children` | `React.ReactNode`（可选） | 自定义标题视图，优先于 `title`；官方 API 页面标注了 `foregroundStyle` 相关弃用提示，颜色样式优先用 modifier。 |
| `color` | `ColorValue`（可选） | 图标颜色。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **Label**：让图标与名称作为同一语义元素呈现，读屏辅助功能也能更容易理解它代表什么。
- **SF Symbols**：Apple 的系统图标集合；名称如 `star.fill`、`gear`。
- **iconOnly**：只隐藏视觉标题的显示样式，不代表可以省略语义名称。

## 源页代码主题覆盖

已覆盖四种安装命令和官方三个示例：系统符号与标题、自定义图标视图、仅显示图标的 labelStyle；保留隐藏图标标题的无障碍要求和组件属性说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/label/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/label/)

**翻页：**[上一页：SwiftUI Image](./082-SwiftUI-Image.md) · [目录](./README.md) · [下一页：SwiftUI LazyHStack](./084-SwiftUI-LazyHStack.md)
