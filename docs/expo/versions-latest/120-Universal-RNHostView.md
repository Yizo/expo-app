# 120｜Expo UI Universal RNHostView

**翻页：**[上一页：Universal Picker](./119-Universal-Picker.md) · [目录](./README.md) · [下一页：Universal Row](./121-Universal-Row.md)

**官方 Latest 页面：**[RNHostView](https://docs.expo.dev/versions/latest/sdk/ui/universal/rnhostview/)

**SDK 56 对照：**[SDK v56.0.0 RNHostView](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/rnhostview/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`，SDK v56.0.0 推荐 `~56.0.25`；此功能在 SDK56 已存在。两版基本 API / Props 相同，Latest 的示例额外使用 `useColorScheme` 做文字颜色适配。本地 Expo 56 应使用 `npx expo install @expo/ui` 安装匹配版本。

## RNHostView 用来做什么

`RNHostView` 是在 Expo UI（SwiftUI / Jetpack Compose）原生布局中**嵌入一个 React Native View 子树**的桥接容器。它用于增量迁移或混合界面：大布局由 Expo UI native components 负责，其中一个区域继续复用现有 React Native 组件。

- **iOS / Android：**容器连接 SwiftUI / Jetpack Compose 与 RN subtree。
- **Web：**没有 native component tree 可以桥接，退化为包住 children 的 React Native `View`。
- **Children 限制：**只测量、布局第一个 React Native element。要放多个 RN views，先用一个 `View` 将它们组合，再把这个单一 View 作为 child。

安装 `@expo/ui`；现有 React Native app 还必须先安装 Expo `expo` package：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基本用法：在 native layout 放入 RN Content

外层 `Text` / `Column` 是 Expo UI 原生组件；内层 `View` / `Text` 从 `react-native` 导入，属于 React Native 内容。注意同一文件里两个体系的 `Text` 不同，所以 RN 版特意别名为 `RNText`：

```tsx
import { Host, Column, RNHostView, Text } from '@expo/ui';
import { Text as RNText, View, useColorScheme } from 'react-native';

export default function MixedViewExample() {
  const colorScheme = useColorScheme();

  return (
    <Host matchContents>
      <Column spacing={12} style={{ padding: 16 }}>
        <Text
          textStyle={{
            color: colorScheme === 'dark' ? '#fff' : '#000',
            fontWeight: 'bold',
          }}
        >
          Native UI label
        </Text>
        <RNHostView matchContents>
          <View
            style={{
              alignSelf: 'flex-start',
              padding: 16,
              backgroundColor: '#9B59B6',
              borderRadius: 10,
            }}
          >
            <RNText style={{ color: 'white' }}>Plain React Native content</RNText>
          </View>
        </RNHostView>
      </Column>
    </Host>
  );
}
```

## `matchContents` 与 Fill-parent 尺寸

默认 `RNHostView` 使用 parent native view 提供的尺寸；设置 `matchContents` 后，host 按它的 React Native child 子树内容缩小 / 伸展。两种 sizing 可按场景并存：

```tsx
import { Host, Column, Row, Text, RNHostView } from '@expo/ui';
import { View } from 'react-native';

export default function HostSizingExample() {
  return (
    <Host matchContents>
      <Column spacing={24} style={{ padding: 16 }}>
        <Column spacing={8}>
          <Text textStyle={{ fontSize: 18, fontWeight: 'bold' }}>Fill parent size</Text>
          <Text>The RNHostView fills the native parent's 100×100 frame.</Text>
          <Row style={{ width: 100, height: 100 }}>
            <RNHostView>
              <View style={{ flex: 1, backgroundColor: '#9B59B6', borderRadius: 10, margin: 4 }} />
            </RNHostView>
          </Row>
        </Column>

        <Column spacing={8}>
          <Text textStyle={{ fontSize: 18, fontWeight: 'bold' }}>Match child size</Text>
          <Text>The host shrinks to wrap its 50×50 child.</Text>
          <Row style={{ padding: 8 }}>
            <RNHostView matchContents>
              <View style={{ width: 50, height: 50, backgroundColor: '#9B59B6', borderRadius: 10 }} />
            </RNHostView>
          </Row>
        </Column>
      </Column>
    </Host>
  );
}
```

`matchContents` 只能在 component mount 时设置；动态切换会 remount 容器，所以不要把它当成普通动画尺寸 props。

## RNHostView Props

| Prop | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactElement` | 被嵌进 host 的单个 React Native view。 |
| `matchContents` | `boolean` / 默认 `false` | true 时按 RN child 子树尺寸布局；false 时占用 native parent 尺寸。仅首次 mount 时设置。 |
| `disabled` | `boolean` | 禁用组件交互。 |
| `hidden` | `boolean` | 隐藏组件。 |
| `onAppear` / `onDisappear` | `() => void` | 容器出现 / 离开屏幕时回调。 |
| `onPress` | `() => void` | 容器被按下时回调。 |
| `style` | 受限制的 `ViewStyle` | padding、background、border、opacity、width、height 等平台通用样式。 |
| `modifiers` | `ModifierConfig[]` | SwiftUI / Jetpack Compose 原生 Modifier escape hatch。Latest reference 表明同类型 modifier 可替换从 style / 其他 props 派生的值；v56 API page 描述较简略。 |
| `testID` | `string` | E2E 组件查找 ID。 |

## 关键名词

- **Native tree：**由 iOS SwiftUI 或 Android Jetpack Compose 管理的平台 UI 节点树；它不等同于 RN View hierarchy。
- **Bridge / Host view：**让一种 UI tree 将另一种 UI runtime 的 view 挂入布局的容器。
- **React Native subtree：**一个 React Native 元素及其内部 RN children；Host 会把该子树作为整体嵌入原生布局。
- **`matchContents`：**把 native wrapper 尺寸交给 child content 决定，而不是撑满 parent。
- **`Modifier`：**SwiftUI / Compose 风格的平台原生布局修饰器。
- **Platform fallback：**Web 没有原生 UI tree 时，RNHostView 用 React Native View 容器包住 children。

## 官方代码主题覆盖

Latest 与 SDK v56.0.0 两个源页代码主题全部覆盖：安装 `@expo/ui` 四类包管理器；native `Host / Column / Text` 中嵌套 RN `View / Text`；dark mode label（Latest 示例）与 v56 原版无 hook 布局；native parent fill 与 match-child 尺寸对照；单一 child / 组合 View 规则；及完整 RNHostView props。Latest 与 v56 的推荐版本、Host 文字配色例子、modifier 描述差异均已注明。

## 下一页

官方页脚 **Next** 是 [Universal Row](https://docs.expo.dev/versions/latest/sdk/ui/universal/row/)，讲用于并排布局与对齐的 Expo UI 行容器。

**翻页：**[上一页：Universal Picker](./119-Universal-Picker.md) · [返回目录](./README.md) · [下一页：Universal Row](./121-Universal-Row.md)
