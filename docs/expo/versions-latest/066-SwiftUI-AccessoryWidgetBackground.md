# 066｜SwiftUI AccessoryWidgetBackground

**翻页：**[上一页：Expo UI SwiftUI 概览](./065-SwiftUI概览.md) · [目录](./README.md) · [下一页：SwiftUI Alert](./067-SwiftUI-Alert.md)

**官方页面：**[SwiftUI AccessoryWidgetBackground · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/accessorywidgetbackground/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/accessorywidgetbackground/)推荐 ~56.0.23。该 SwiftUI 组件目前用于 iOS。

## 随 Widget 环境自适应的背景

AccessoryWidgetBackground 对应 SwiftUI 同名 API。它根据小组件的环境提供标准自适应背景；通过 ZStack 将背景放在下层，再叠加具体内容。

安装：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 基本 Widget 背景

示例用 AccessoryWidgetBackground 作为底层背景，用 VStack 将 MON 文字叠放在其上：

~~~tsx
import {
  AccessoryWidgetBackground,
  VStack,
  Text,
  ZStack,
} from '@expo/ui/swift-ui';

export default function BasicAccessoryWidgetBackground() {
  return (
    <ZStack>
      <AccessoryWidgetBackground />
      <VStack>
        <Text>MON</Text>
      </VStack>
    </ZStack>
  );
}
~~~

ZStack 按层级把子视图叠在同一空间；后面的 VStack 内容绘制在 AccessoryWidgetBackground 上方。

## API

~~~tsx
import { AccessoryWidgetBackground } from '@expo/ui/swift-ui';
~~~

组件类型为 ReactElement<AccessoryWidgetBackgroundProps>，继承 Expo UI 的 CommonViewModifierProps。此页没有列出专属 props；背景外观会从 SwiftUI widget environment 自动适配。

## 关键名词

- **SwiftUI**：Apple 用于 iOS / tvOS 原生 UI 的声明式框架。
- **Accessory widget**：iOS WidgetKit 为小组件提供的配件类展示环境；背景需适配不同 widget family。
- **AccessoryWidgetBackground**：SwiftUI 原生背景 view，根据 widget 环境选择系统提供的标准背景样式。
- **ZStack**：SwiftUI 层叠容器，将子视图放置在同一位置并依次叠画。
- **VStack**：SwiftUI 垂直布局容器，将子视图从上到下排列。
- **CommonViewModifierProps**：Expo UI 提供给 SwiftUI view 的共用 modifier / 布局属性。

## 官方代码主题覆盖

保留安装命令和官方完整示例：AccessoryWidgetBackground 作为 ZStack 的背景层，VStack + Text 内容显示在前景。API 类型及继承的通用 modifier 属性边界已标出。

## 下一页

Latest 页脚 Next 指向 [SwiftUI Alert](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/alert/)，介绍原生警告对话框。

**翻页：**[上一页：Expo UI SwiftUI 概览](./065-SwiftUI概览.md) · [返回目录](./README.md) · [下一页：SwiftUI Alert](./067-SwiftUI-Alert.md)
