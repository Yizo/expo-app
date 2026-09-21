# 086｜SwiftUI Link

**翻页：**[上一页：SwiftUI LazyVStack](./085-SwiftUI-LazyVStack.md) · [目录](./README.md) · [下一页：SwiftUI List](./087-SwiftUI-List.md)

**官方页面：**[SwiftUI Link · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/link/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/link/)推荐 `~56.0.25`。此原生链接支持 iOS、tvOS，可在 Expo Go 中使用。

## 可点击的原生链接

SwiftUI `Link` 用系统原生控件呈现可点击 URL，适合“打开帮助”“访问官网”等跳转。简单链接使用 `label` 文字；复杂链接可传嵌套 React 视图作为 children，但不能直接给 children 一个纯字符串。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本文字链接

`destination` 必须传目标 URL：

~~~tsx
import { Host, Link } from '@expo/ui/swift-ui';

export default function BasicLinkExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Link label="Visit Expo" destination="https://expo.dev" />
    </Host>
  );
}
~~~

## 自定义链接标签

用嵌套视图组合图标和文字；下面将系统 link 符号放在 Expo 标题上方：

~~~tsx
import { Host, Link, VStack, Image, Text } from '@expo/ui/swift-ui';

export default function CustomContentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Link destination="https://expo.dev">
        <VStack spacing={4}>
          <Image systemName="link" />
          <Text>Expo</Text>
        </VStack>
      </Link>
    </Host>
  );
}
~~~

## 自定义链接颜色和字号

Link 支持通用 modifier；下面通过 `foregroundStyle` 和 `font` 修改颜色与字重：

~~~tsx
import { Link } from '@expo/ui/swift-ui';
import { foregroundStyle, font } from '@expo/ui/swift-ui/modifiers';

<Link
  label="Open"
  destination="https://expo.dev"
  modifiers={[
    foregroundStyle('red'),
    font({ size: 24, weight: 'bold' }),
  ]}
/>
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `destination` | `string` | 链接目标 URL。 |
| `label` | `string`（可选） | 简单文字链接的标签。 |
| `children` | `React.ReactElement \| React.ReactElement[]`（可选） | 自定义标签内容；只能传嵌套 React 元素，不能传裸字符串；设置后使用自定义视图作为链接标签。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **destination**：链接目标地址。
- **嵌套元素 children**：像 `<VStack><Text>...</Text></VStack>` 这样的 React 组件树；官方 API 不接受 `<Link>纯文字</Link>` 这种裸字符串 children。
- **modifier**：给 SwiftUI 原生视图附加样式或交互修饰的 Expo UI 函数。

## 源页代码主题覆盖

已覆盖四种安装命令、官方两个完整用法（文字链接与自定义 React 标签），以及 API 区的 `foregroundStyle` / `font` modifier 链接样式片段；`destination`、`label`、受限 children 与无障碍语义均已解释。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/link/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/link/)

**翻页：**[上一页：SwiftUI LazyVStack](./085-SwiftUI-LazyVStack.md) · [目录](./README.md) · [下一页：SwiftUI List](./087-SwiftUI-List.md)
