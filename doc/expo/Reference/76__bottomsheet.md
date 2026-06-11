# BottomSheet：从屏幕底部展示 SwiftUI 内容

> 原文档更新时间：2026 年 6 月 10 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS  
> 可在 Expo Go 中使用

## 文档解决的问题

`BottomSheet` 用于从屏幕底部弹出一块原生 SwiftUI 内容区域，常见场景包括：

- 操作菜单
- 筛选面板
- 简短表单
- 内容详情
- 可拖动高度的辅助页面
- 包含 React Native 列表的底部面板

它的 API 与 Apple 官方 SwiftUI `sheet` API 对应，因此最终呈现的是 Apple 平台原生组件，而不是用 JavaScript 和 CSS 模拟出来的浮层。

> **版本提醒：**原文是下一个 Expo SDK 版本的未发布版本文档。文档明确指出，当前最新稳定版本是 SDK 56。用于正式项目时，应同时核对 SDK 56 对应的稳定文档，避免使用尚未进入当前 SDK 的 API。

## React Web 开发者需要先理解的概念

### Bottom Sheet 与 Web 弹窗的区别

可以把 Bottom Sheet 大致理解为从视口底部出现的 `dialog` 或 Drawer，但移动端原生组件还包含以下行为：

- 用户可以通过拖动改变面板高度。
- 面板可以停靠在几个预设高度。
- 用户通常可以向下滑动关闭面板。
- 是否允许操作面板后方的内容可以单独控制。
- 高度和手势行为由原生系统管理。

因此，它不只是一个设置了 `position: fixed; bottom: 0` 的 React 组件。

### SwiftUI 与 React Native

SwiftUI 是 Apple 的原生声明式 UI 框架。`@expo/ui/swift-ui` 允许 React Native 代码声明和控制部分 SwiftUI 组件。

文档中的组件分为两类：

- `Host`、`BottomSheet`、`VStack`、`Group` 等来自 `@expo/ui/swift-ui`，属于 SwiftUI 组件包装。
- `View`、`Pressable`、`FlatList` 等来自 `react-native`，属于 React Native 组件。

这两套组件不能在所有位置直接混用。需要在 SwiftUI 内容中嵌入 React Native 组件时，要通过 `RNHostView` 建立承载边界。

### Host

`Host` 是 SwiftUI 内容的宿主容器，可以将它理解为 React Native 页面中承载 SwiftUI 组件的根节点。

示例通常使用：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

`flex: 1` 让宿主占据 React Native 父容器提供的可用空间。

### Group 与 modifier

`Group` 用于包装 Bottom Sheet 的内容，并通过 `modifiers` 应用 SwiftUI 展示行为：

```tsx
<Group
  modifiers={[
    presentationDetents(['medium', 'large']),
    presentationDragIndicator('visible'),
  ]}>
  {/* 内容 */}
</Group>
```

对 React Web 开发者而言，可以将 modifier 粗略理解为一组作用于原生视图的行为配置。但它并不等同于 CSS：

- modifier 会影响原生 SwiftUI 视图的布局或展示行为。
- modifier 的顺序和作用对象可能具有语义。
- Bottom Sheet 的高度、拖动指示器和关闭行为都通过 modifier 控制。

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它会根据当前 Expo SDK 选择兼容的软件包版本。

如果是在已有的纯 React Native 工程中使用，还必须先安装并配置 Expo Modules，也就是文档所说的“install `expo`”。仅安装 `@expo/ui` 并不足以让非 Expo 工程获得相应的原生模块能力。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, BottomSheet, Button, Text, VStack } from '@expo/ui/swift-ui';

export default function BasicBottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <Button label="Open Sheet" onPress={() => setIsPresented(true)} />

        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}>
          <Text>Hello, world!</Text>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
```

其中的状态控制方式与 React Web 的受控组件相似：

1. `isPresented` 决定面板是否显示。
2. 点击按钮后，将状态设置为 `true`。
3. 用户通过原生手势关闭面板时，`onIsPresentedChange` 会收到新的状态。
4. 将 `setIsPresented` 直接传入回调，使 React 状态与原生展示状态保持同步。

`onIsPresentedChange` 不能省略。否则用户通过手势关闭后，React 中的状态可能无法正确反映原生组件的状态。

## 控制 Bottom Sheet 高度

文档提供了两种主要策略：

- 内容决定高度：`fitToContents`
- 提前指定可停靠高度：`presentationDetents`

二者适合不同的内容布局。

### 根据内容自动调整高度

```tsx
<BottomSheet
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}
  fitToContents>
  <VStack>
    <Text>This sheet automatically sizes to fit its content.</Text>
    <Button label="Close" onPress={() => setIsPresented(false)} />
  </VStack>
</BottomSheet>
```

`fitToContents` 为 `true` 时，Bottom Sheet 会根据子内容的高度设置对应的停靠高度。

适合：

- 内容数量较少且高度可以确定
- 简短提示
- 少量操作按钮
- 不需要占据半屏或全屏的内容

默认值为 `false`。

### 配置多个停靠高度

`presentationDetents` 用于声明用户可以将面板拖动到哪些高度：

```tsx
<Group
  modifiers={[
    presentationDetents([
      'medium',
      'large',
      { fraction: 0.3 },
      { height: 200 },
    ]),
  ]}>
  <Text>This sheet can snap to multiple heights.</Text>
</Group>
```

文档列出了四种高度形式：

| 配置 | 含义 |
| --- | --- |
| `'medium'` | 系统中等高度，大约为屏幕的一半 |
| `'large'` | 系统大高度，接近全屏 |
| `{ fraction: 0.3 }` | 屏幕高度的 30% |
| `{ height: 200 }` | 固定为 200 points |

这里的 `point` 是 Apple 平台的逻辑布局单位，不应直接理解为物理像素。它更接近 Web 中经过设备缩放抽象后的 CSS 像素。

### 跟踪和控制当前高度

`presentationDetents` 的第二个参数可以接收：

- `selection`：当前选中的停靠高度
- `onSelectionChange`：用户拖动到其他高度时触发的回调

```tsx
const detents: PresentationDetent[] = [
  { height: 300 },
  { fraction: 0.3 },
  'medium',
  'large',
];

const [selectedDetent, setSelectedDetent] =
  useState<PresentationDetent>('medium');

<Group
  modifiers={[
    presentationDetents(detents, {
      selection: selectedDetent,
      onSelectionChange: setSelectedDetent,
    }),
  ]}>
  {/* 内容 */}
</Group>
```

这同样是受控状态模式：

- 调用 `setSelectedDetent('large')` 可以让面板切换到大高度。
- 用户拖动面板时，`onSelectionChange` 会更新 React 状态。

文档示例中的 `PresentationDetent` 是联合类型，因此格式化当前值时要区分字符串和对象：

```tsx
const formatDetent = (detent: PresentationDetent): string => {
  if (typeof detent === 'string') return detent;
  if ('fraction' in detent) return `Fraction ${detent.fraction}`;
  return `Height ${detent.height}`;
};
```

> **基于文档内容推导：**程序设置的 `selection` 应当与 `detents` 中声明的某个值相匹配。文档没有说明传入列表外的值会发生什么，因此不要依赖未声明高度的行为。

## 控制背景交互

Bottom Sheet 默认会覆盖在原页面上。`presentationBackgroundInteraction` 可以控制用户在面板显示时是否仍能操作后方内容：

```tsx
<Group
  modifiers={[
    presentationDetents(['medium', 'large']),
    presentationBackgroundInteraction({
      type: 'enabledUpThrough',
      detent: 'medium',
    }),
  ]}>
  <Text>Content</Text>
</Group>
```

该示例表示：

- 面板处于 `medium` 高度时，允许操作后方内容。
- 面板超过该高度后，不再允许操作后方内容。

适合地图、画布或其他需要在底部面板展开时继续交互的界面。

> **基于文档内容推导：**启用背景交互后，要避免面板和背景同时提供含义相近的操作，否则用户可能无法判断触摸事件会作用于哪一层。

## 禁止通过滑动关闭

默认情况下，用户可以通过原生手势关闭面板。使用 `interactiveDismissDisabled()` 可以禁止这种行为：

```tsx
<Group modifiers={[interactiveDismissDisabled()]}>
  <VStack>
    <Text>This sheet cannot be dismissed by swiping.</Text>
    <Button label="Close" onPress={() => setIsPresented(false)} />
  </VStack>
</Group>
```

禁止手势关闭后，必须提供明确的程序化关闭入口：

```tsx
setIsPresented(false);
```

适合尚未完成就不能退出的流程，例如必须确认的操作或需要保护未保存数据的表单。

> **基于经验建议：**不要无必要地禁止滑动关闭。它会改变用户熟悉的系统交互，并可能造成“无法退出”的体验。确需禁用时，应始终提供可见的关闭、取消或完成按钮。

## 在 Bottom Sheet 中嵌入 React Native 内容

### 内容高度由自身决定

使用 `RNHostView` 将 React Native 组件嵌入 SwiftUI Bottom Sheet：

```tsx
<BottomSheet
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}
  fitToContents>
  <Group modifiers={[presentationDragIndicator('visible')]}>
    <RNHostView matchContents>
      <View style={{ padding: 24 }}>
        <RNText>React Native Content</RNText>
        <Pressable onPress={() => setIsPresented(false)}>
          <RNText>Close</RNText>
        </Pressable>
      </View>
    </RNHostView>
  </Group>
</BottomSheet>
```

这里存在两层内容适配：

- `RNHostView matchContents`：SwiftUI 宿主视图匹配内部 React Native 内容尺寸。
- `BottomSheet fitToContents`：Bottom Sheet 再匹配其子内容高度。

适合固定高度或可以测量出自然高度的 React Native 内容。

### 内容使用 `flex: 1`

如果 React Native 内容使用 `flex: 1`，文档要求：

1. 不要为 `RNHostView`设置 `matchContents`。
2. 使用 `presentationDetents` 给 Bottom Sheet 提供明确的可用高度。

```tsx
<Group
  modifiers={[
    presentationDetents(['medium', 'large']),
    presentationDragIndicator('visible'),
  ]}>
  <RNHostView>
    <View style={{ flex: 1 }}>
      <RNText>Flexible React Native Content</RNText>
    </View>
  </RNHostView>
</Group>
```

原因是 `flex: 1` 表示填满父容器，而 `matchContents` 又要求父容器根据子内容决定高度。两者组合会形成不明确的尺寸依赖：

- 子内容要求父容器先提供高度。
- 父容器又等待子内容确定自身高度。

通过 `presentationDetents` 先确定 Bottom Sheet 高度后，内部 `flex: 1` 才有明确的可用空间。

这是 React Web 开发者最容易误解的地方之一。Web 浏览器通常会在布局过程中自动处理许多尺寸约束，但跨 SwiftUI 与 React Native 的宿主边界需要显式选择尺寸策略。

## 放置可滚动列表

React Native 的以下滚动组件可以通过 `RNHostView` 放入 Bottom Sheet：

- `FlatList`
- `ScrollView`
- FlashList
- Legend List

示例结构如下：

```tsx
<Group
  modifiers={[
    presentationDetents(['medium', 'large']),
    presentationDragIndicator('visible'),
  ]}>
  <RNHostView>
    <View style={{ padding: 16 }}>
      <FlatList
        data={DATA}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <RNText style={{ paddingVertical: 16 }}>{item}</RNText>
        )}
      />
    </View>
  </RNHostView>
</Group>
```

Bottom Sheet 的高度由 `presentationDetents` 决定，列表在这个有限高度内滚动。

这类内容不适合使用 `fitToContents` 将整个列表完全展开，否则就失去了列表内部滚动的意义。

> **基于文档内容推导：**对于数量较多或高度不可预测的数据，应优先采用“固定停靠高度 + 内部滚动”的结构，而不是让 Bottom Sheet 匹配全部内容。

## API 说明

导入方式：

```tsx
import { BottomSheet } from '@expo/ui/swift-ui';
```

### `children`

```ts
React.ReactNode
```

Bottom Sheet 中展示的内容。

如果需要设置停靠高度、拖动指示器、背景交互或手势关闭行为，应使用 `Group` 包裹内容，并把对应 modifier 应用到 `Group`。

### `fitToContents`

```ts
boolean
```

- 可选
- 默认值：`false`

设置为 `true` 后，根据子内容高度调整 Bottom Sheet 高度。

### `isPresented`

```ts
boolean
```

必填。控制 Bottom Sheet 当前是否显示。

### `onIsPresentedChange`

```ts
(isPresented: boolean) => void
```

必填。当 Bottom Sheet 的展示状态发生变化时调用。

它不仅用于接收代码触发的变化，也用于同步用户通过原生交互造成的状态变化。

### `onDismiss`

```ts
() => void
```

可选。在 Bottom Sheet 已经完全关闭后调用。

`onDismiss` 与 `onIsPresentedChange` 的用途不同：

- `onIsPresentedChange` 用于同步展示状态。
- `onDismiss` 用于执行必须等关闭动画和关闭过程完全结束后才能执行的逻辑。

原文档没有进一步说明二者的精确触发顺序。

### 继承属性

`BottomSheet` 还继承 `CommonViewModifierProps`。当前文档没有列出这些继承属性的完整内容，需要参考 `@expo/ui/swift-ui/modifiers` 文档。

## 展示相关 modifier

文档示例涉及以下 modifier：

| modifier | 作用 |
| --- | --- |
| `presentationDetents` | 设置可用高度，并可控制当前高度 |
| `presentationDragIndicator` | 控制顶部拖动指示器是否显示 |
| `presentationBackgroundInteraction` | 控制面板后方内容是否可以交互 |
| `interactiveDismissDisabled` | 禁止用户通过滑动关闭面板 |
| `foregroundStyle` | 示例中用于设置文本前景样式 |

当前文档只展示了这些 modifier 与 Bottom Sheet 的组合用法，没有完整列出每个 modifier 的所有参数和平台差异。

## 限制、注意事项与文档问题

### 仅支持 Apple 平台

SwiftUI 版本的 `BottomSheet` 支持 iOS 和 tvOS，文档没有声明 Android 支持。

需要同时支持 iOS 和 Android 时，应查看文档提到的通用版 `BottomSheet`。通用版会根据平台渲染对应的原生组件。

不要因为组件是在 React 中使用，就认为它自动具备 React Native 的跨平台能力。

### 文档属于未发布 SDK

页面路径是 `unversioned`，并明确说明它面向下一个 SDK 版本。正式项目必须以项目实际使用的 Expo SDK 文档为准。

### `fitToContents` 与弹性布局用途不同

- 自然高度、固定内容：使用 `fitToContents`。
- `flex: 1` 内容：使用 `presentationDetents`，不要设置 `RNHostView matchContents`。
- 可滚动长列表：使用 `presentationDetents` 限定高度，让列表内部滚动。

### 修改展示行为时应使用 `Group`

文档明确要求用 `Group` 包装内容，再将展示 modifier 应用于 `Group`。不要假设这些 modifier 可以随意放在任意内部组件上。

### 部分原文示例缺少 `Group` 导入

原文中的以下示例使用了 `<Group>`，但对应 import 没有包含 `Group`：

- 配置 `presentationDetents` 的示例
- 配置背景交互的示例
- 禁止滑动关闭的示例
- 使用 `RNHostView matchContents` 的示例
- 使用弹性 React Native 内容的示例

实际代码需要补充：

```tsx
import {
  Host,
  BottomSheet,
  Button,
  Group,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
```

否则 TypeScript 或 JavaScript 会报告 `Group is not defined`。

### 当前文档未涉及的内容

原文没有明确说明：

- Android 上 SwiftUI `BottomSheet` 的降级行为
- 无障碍属性和焦点管理细节
- 键盘弹出时的高度变化
- 横竖屏切换行为
- 多个 Bottom Sheet 嵌套或同时显示的行为
- `fitToContents` 与 `presentationDetents` 同时使用时的优先级
- 固定高度超出屏幕时的处理方式
- 不同 iOS 和 tvOS 版本之间的行为差异
- 自动化测试方法
- 性能限制
- 服务端渲染或 React Web 支持

这些行为不能根据本页内容自行假定。

## 实际开发中的选择方式

可以按内容类型选择布局策略：

| 内容场景 | 推荐配置 |
| --- | --- |
| 少量文本和按钮 | `fitToContents` |
| 需要半屏与全屏切换 | `presentationDetents(['medium', 'large'])` |
| 需要代码控制当前高度 | `selection` + `onSelectionChange` |
| React Native 固定内容 | `RNHostView matchContents` + `fitToContents` |
| React Native `flex: 1` 内容 | `RNHostView` + `presentationDetents` |
| 长列表 | `RNHostView` + `FlatList` + `presentationDetents` |
| 必须完成后才能退出 | `interactiveDismissDisabled()` + 明确关闭按钮 |
| 面板展开时仍需操作背景 | `presentationBackgroundInteraction` |
| iOS 与 Android 共用业务页面 | 优先评估通用版 `BottomSheet` |

## 总结

`@expo/ui/swift-ui` 的 `BottomSheet` 是由 React 状态驱动的 Apple 原生底部面板。掌握它需要重点理解三个边界：

1. 使用 `isPresented` 和 `onIsPresentedChange` 保持 React 状态与原生展示状态同步。
2. 在 `fitToContents` 和 `presentationDetents` 之间选择明确的高度策略。
3. 使用 `RNHostView` 在 SwiftUI 与 React Native 组件之间建立正确的承载和尺寸关系。

对于 React Web 开发者，最重要的认知变化是：这里不只是 React 组件布局，还涉及 SwiftUI 与 React Native 两套布局系统之间的尺寸协调，以及移动端原生的拖动、停靠和关闭手势。

---

## 文档导航

- **上一页**：[alert](./75__alert.md)
- **下一页**：[button](./77__button.md)
