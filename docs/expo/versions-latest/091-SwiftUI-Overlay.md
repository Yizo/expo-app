# 091｜SwiftUI Overlay

**翻页：**[上一页：SwiftUI Namespace](./090-SwiftUI-Namespace.md) · [目录](./README.md) · [下一页：SwiftUI Picker](./092-SwiftUI-Picker.md)

**官方页面：**[SwiftUI Overlay · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/overlay/)

**版本边界：**Latest 两次读取显示的 `@expo/ui` 推荐版本有差异（`~57.0.18` 与 `~57.0.16`）；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/overlay/)列为 `~56.0.21`。版本号会变动，安装时按当前项目 SDK 使用 `npx expo install @expo/ui`。

## 在原生视图上覆盖第二层内容

`Overlay` 对应 SwiftUI overlay modifier：第一个子视图作为底层内容，`Overlay.Content` 包裹叠加在其上的内容。通过 `alignment` 选择覆盖层相对底层的位置。例如，图标右上角显示通知数字角标。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 图标右上角通知角标

~~~tsx
import { Host, Overlay, Text, Image } from '@expo/ui/swift-ui';
import {
  foregroundStyle,
  frame,
  font,
  background,
  clipShape,
  offset,
} from '@expo/ui/swift-ui/modifiers';

export default function OverlayExample() {
  return (
    <Host
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Overlay alignment="topTrailing">
        <Image
          systemName="bell.fill"
          modifiers={[
            font({ size: 28 }),
            foregroundStyle('#007AFF'),
          ]}
        />
        <Overlay.Content>
          <Text
            modifiers={[
              font({ size: 11, weight: 'bold' }),
              foregroundStyle('#FFFFFF'),
              frame({ width: 18, height: 18 }),
              background('#FF3B30'),
              clipShape('circle'),
              offset({ x: 8, y: -8 }),
            ]}>
            3
          </Text>
        </Overlay.Content>
      </Overlay>
    </Host>
  );
}
~~~

## API 速查

导入路径：`@expo/ui/swift-ui`。

| 属性 / 子内容 | 类型 | 说明 |
| --- | --- | --- |
| `alignment` | SwiftUI `Alignment`（可选，默认 `center`） | 覆盖内容相对底层视图的对齐位置，例如 `topTrailing`。 |
| `children` | `React.ReactNode` | 底层视图以及要叠加的 `Overlay.Content`。 |
| `Overlay.Content` | 复合子组件 | 包裹覆盖在 base content 上的第二层视图。 |

`Overlay` 继承 `CommonViewModifierProps`。

### 新手术语

- **Overlay / 覆盖层**：把一个小视图画在另一视图上方，不改变底层组件本身；通知角标是常见用法。
- **Alignment**：相对底层视图摆放叠加内容的锚点；`topTrailing` 指上边缘和阅读方向末端的角。
- **offset**：视觉上移动视图的位置。这里把角标向右上微调，不会改变底层铃铛的布局。

## 源页代码主题覆盖

已覆盖四种安装命令和官方完整通知角标示例：用 `Overlay.Content` 将红色数字 badge 对齐到铃铛图标右上角；alignment 与内容结构均在 API 表说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/overlay/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/overlay/)

**翻页：**[上一页：SwiftUI Namespace](./090-SwiftUI-Namespace.md) · [目录](./README.md) · [下一页：SwiftUI Picker](./092-SwiftUI-Picker.md)
