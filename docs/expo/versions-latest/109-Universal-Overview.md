# 109｜Expo UI Universal Overview

**翻页：**[上一页：SwiftUI ZStack](./108-SwiftUI-ZStack.md) · [目录](./README.md) · [下一页：Expo UI Universal BottomSheet](./110-Universal-BottomSheet.md)

**官方页面：**[Expo UI Universal · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/)推荐 `~56.0.26`。通用组件面向 Android、iOS、Web，也可在 Expo Go 使用；具体组件仍应查目标 SDK 版本的属性与平台支持。

## 一个 API 覆盖多个平台的原生控件

Expo UI universal 组件通过一个 API 描述跨平台 UI：Android 下转到 `@expo/ui/jetpack-compose`，iOS 下转到 `@expo/ui/swift-ui`，Web 下按组件选用 JavaScript 的 `react-dom` 或 `react-native-web` 实现。

即使使用 universal 组件，也要用从 `@expo/ui` 根包导入的 `Host` 包住内容。这个 Host 会在 Android / iOS 选择对应的原生承载组件，业务界面通常无需直接引入平台专用子路径。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 跨平台 Hello World

示例根据系统颜色模式在深色 / 浅色外观之间调整文字色：

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Column, Button, Text } from '@expo/ui';

export default function UniversalExample() {
  const colorScheme = useColorScheme();

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={12} alignment="center">
        <Text
          textStyle={{
            color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
          }}>
          Hello, world!
        </Text>
        <Button label="Press me" onPress={() => alert('Pressed')} />
      </Column>
    </Host>
  );
}
~~~

## Universal 可用组件

| 组件 | 用途 |
| --- | --- |
| `BottomSheet` | 从屏幕底部滑出的模态面板。 |
| `Button` | 多种原生外观的可点击按钮。 |
| `Checkbox` | 勾选 / 未勾选状态输入。 |
| `Collapsible` | 点击标题切换子内容可见性。 |
| `Column` | 通用纵向布局容器。 |
| `FieldGroup` | 可滚动的分组设置行容器。 |
| `Host` | 包装并承载 universal Expo UI 内容。 |
| `Icon` | 平台原生符号：iOS SF Symbol，Android Material Symbol。 |
| `List` | 有虚拟化能力的纵向行容器，搭配 `ListItem` primitive。 |
| `Picker` | 单选输入，支持 menu 和 wheel 外观。 |
| `RNHostView` | 在 Expo UI 视图里承载 React Native 子视图。 |
| `Row` | 通用横向布局容器。 |
| `ScrollView` | 纵向或横向滚动容器。 |
| `Slider` | 连续值或 step 区间输入。 |
| `Spacer` | 在兄弟视图之间产生弹性空白。 |
| `Switch` | 开 / 关切换控件。 |
| `Text` | 带样式的文字。 |
| `TextInput` | 基于 SwiftUI / Jetpack Compose、并提供 RN 兼容 API 的文字输入控件。 |

## 何时用 Universal，何时用平台专用组件

- **使用 Universal**：同一个组件树需要不经修改地运行在 Android、iOS 和 Web，同时希望原生平台保留各自的控件观感。
- **直接使用 `@expo/ui/swift-ui` 或 `@expo/ui/jetpack-compose`**：需要某个平台专有的控件、modifier 或 Universal API 暂未暴露的行为。
- **平台组件不是跨平台承诺**：例如上面刚整理的 SwiftUI `ProgressView`、`SecureField`、`TabView` API 与 universal `TextInput`、`Switch`、`List` 的属性不完全相同，应按具体用法选择。

## 源页代码主题覆盖

已覆盖四种安装命令和官方跨平台 Hello World 示例，展示从 `@expo/ui` 根入口导入 Host、Column、Button、Text，并根据系统颜色模式调整文字颜色；也列出官方 Universal 组件与选型边界。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/)

**翻页：**[上一页：SwiftUI ZStack](./108-SwiftUI-ZStack.md) · [目录](./README.md) · [下一页：Expo UI Universal BottomSheet](./110-Universal-BottomSheet.md)
