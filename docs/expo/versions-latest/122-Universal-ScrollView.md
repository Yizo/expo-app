# 122｜Expo UI Universal ScrollView

**翻页：**[上一页：Universal Row](./121-Universal-Row.md) · [目录](./README.md) · [下一页：Universal Slider](./123-Universal-Slider.md)

**官方 Latest 页面：**[ScrollView](https://docs.expo.dev/versions/latest/sdk/ui/universal/scrollview/)

**SDK 56 对照：**[SDK v56.0.0 ScrollView](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/scrollview/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；SDK v56.0.0 推荐 `~56.0.26`。方向、children 与核心 style props 两版一致；Latest 示例还加入系统主题文字颜色并使用 `Host.matchContents` 参数形式，本地 SDK 56 参考样例采用 `Host.style={{ flex: 1 }}`。

## ScrollView 做什么

`ScrollView` 是把一组内容放在可滚动视口中的容器；默认纵向滚动，可用 `direction="horizontal"` 改成横向。

| Platform | 底层实现 |
| --- | --- |
| Android | Jetpack Compose `Column` / `Row` 加 `verticalScroll` / `horizontalScroll` Modifier。内容不是 Lazy container，会渲染全部 children。 |
| iOS | SwiftUI `ScrollView`。 |
| Web | React Native `ScrollView`。 |

和网页 DOM 容器类似，ScrollView 适用于数量有限或内容需要一次性布局的区域；如果 rows 多到影响 mount / 内存，要考虑 virtualization list，避免 ScrollView 一口气构建全部内容。

## 安装

用 Expo installer 获取匹配 SDK 的 Expo UI package：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

若安装到既有 React Native 工程，需先在项目中加入 `expo`。

## 纵向滚动内容

可以在 ScrollView 中放一个 `Column`，其 children 按垂直方向排列。下面创建 30 行，Latest 示例根据系统 dark / light mode 切换文字色：

```tsx
import { useColorScheme } from 'react-native';
import { Host, ScrollView, Column, Text } from '@expo/ui';

export default function VerticalFeed() {
  const dark = useColorScheme() === 'dark';
  const textColor = dark ? '#fff' : '#000';

  return (
    <Host style={{ flex: 1 }}>
      <ScrollView>
        <Column spacing={8}>
          {Array.from({ length: 30 }).map((_, index) => (
            <Text key={index} textStyle={{ color: textColor }}>
              Row {index + 1}
            </Text>
          ))}
        </Column>
      </ScrollView>
    </Host>
  );
}
```

## 横向滚动内容

把方向改为 horizontal，内容行放在 `Row` 内，即可左右滑动一串横向 item：

```tsx
import { useColorScheme } from 'react-native';
import { Host, ScrollView, Row, Text } from '@expo/ui';

export default function HorizontalCards() {
  const dark = useColorScheme() === 'dark';
  const textColor = dark ? '#fff' : '#000';

  return (
    <Host style={{ width: '100%', flex: 1 }}>
      <ScrollView direction="horizontal">
        <Row spacing={12}>
          {Array.from({ length: 20 }).map((_, index) => (
            <Text key={index} textStyle={{ color: textColor }}>
              Item {index + 1}
            </Text>
          ))}
        </Row>
      </ScrollView>
    </Host>
  );
}
```

Latest source 用 `Host.matchContents={{ vertical: true }}` 表示 Host 高度按内容匹配、宽度由父级撑满。SDK 56 对照页采用 flex style；关键是给滚动区域一个有边界的宽 / 高，让内容超出时可以滚动。

## ScrollView Props

| Prop | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode` | 要滚动展示的内容。 |
| `direction` | `'vertical' \| 'horizontal'` / `'vertical'` | 主滚动方向。 |
| `disabled` / `hidden` | `boolean` | 禁用交互或隐藏整个容器。 |
| `showsIndicators` | `boolean` / `true`；iOS / Web | 是否显示滚动条 indicator。 |
| `style` | 受限 `ViewStyle` | padding、backgroundColor、border、opacity、宽高等共有样式。 |
| `modifiers` | `ModifierConfig[]` | iOS SwiftUI / Android Compose 原生修饰器 escape hatch。 |
| `onAppear` / `onDisappear` | `() => void` | 进入 / 离开屏幕时回调。 |
| `onPress` | `() => void` | 容器被按下时回调。 |
| `testID` | `string` | E2E / 自动化测试定位标识。 |

## 重要性能边界

虽然 ScrollView 能让长内容滚动，但 Android 实现的 Column / Row 会渲染所有子项，并不是按可见区域做 Lazy rendering。列表数据量大时，所有 React 子项会立即 mount，可能增加首屏时间和内存。应根据用途选择真正按视窗复用 cell 的 `FlatList`、`FlashList` 或其他虚拟列表。

## 关键名词

- **Scroll container：**定义一个有限视窗，并让超出范围的子内容通过手势滚动访问。
- **Main axis：**ScrollView 的主要滚动方向，vertical 表示上下、horizontal 表示左右。
- **Non-lazy children：**容器初次 render 就构造全部子节点的行为；与按 viewport 按需渲染的虚拟列表不同。
- **Native ScrollView：**iOS SwiftUI / Android Compose 实现的滚动容器；不是浏览器 DOM 的 `<div overflow:auto>`。

## 官方代码主题覆盖

源页代码主题全部覆盖：四种包管理器安装 `@expo/ui`；纵向 ScrollView + Column + 30 行；横向 ScrollView + Row + 20 项；`direction`；Host 填充 / match contents；深浅色文字（Latest example）；以及 ScrollView 所有 props 与 Android / iOS / Web 原生实现说明。

## 下一页

官方页脚 **Next** 是 [Universal Slider](https://docs.expo.dev/versions/latest/sdk/ui/universal/slider/)，介绍 controlled numeric range slider 与连续 / step 模式。

**翻页：**[上一页：Universal Row](./121-Universal-Row.md) · [返回目录](./README.md) · [下一页：Universal Slider](./123-Universal-Slider.md)
