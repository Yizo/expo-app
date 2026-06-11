# RNHostView：在 SwiftUI 中正确承载 React Native 视图

> 原文档修改日期：2026 年 4 月 29 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本；原文建议生产开发参考最新稳定版本（当时为 SDK 56）。

## 文档解决的问题

`RNHostView` 用于把 React Native 视图放入 SwiftUI 组件，并让两套布局系统正确交换尺寸信息。

典型场景包括把 React Native 的 `View`、`Text`、`Pressable` 放入以下 SwiftUI 组件：

- `BottomSheet`
- `Popover`
- `HStack`
- 其他由 `@expo/ui/swift-ui` 提供的 SwiftUI 容器

这里的主要问题不是组件能否渲染，而是 SwiftUI 和 React Native 使用不同的布局系统：

- SwiftUI 按自己的布局规则计算原生视图尺寸。
- React Native 使用 Yoga 布局系统处理 `flex`、宽高和子元素布局。
- 如果两套系统没有正确同步尺寸，父容器可能不知道 React Native 内容需要多大，React Native 内容也可能不知道 SwiftUI 提供了多少空间。

`RNHostView` 通过更新 React Native shadow node 的尺寸，在两套布局系统之间同步信息。

## 阅读前需要理解的背景

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的 UI 框架。

对于 React Web 开发者，可以暂时将 SwiftUI 组件理解为浏览器之外的“原生 UI 组件树”。不过，它不是 DOM，也不使用 CSS 布局。

### React Native 与 Yoga

React Native 使用 JavaScript/TypeScript 编写组件，但最终渲染的是平台原生视图，不是 HTML 元素。

Yoga 是 React Native 使用的布局引擎，负责处理：

- Flexbox 布局
- 宽度和高度
- 内外边距
- 子元素排列
- `flex: 1` 等空间分配规则

Yoga 的 Flexbox 与 Web CSS Flexbox 概念相近，但运行环境和部分默认行为并不相同。

### Shadow node

shadow node 是 React Native 在布局计算阶段使用的内部节点，可以把它理解为“不直接显示，但记录组件布局信息的结构”。

本文中的关键点是：`RNHostView` 会更新 shadow node 的尺寸，使 React Native 的 Yoga 布局能够获得来自 SwiftUI 的尺寸信息。

### intrinsic size

intrinsic size 指内容在没有被强制拉伸时，根据自身内容自然需要的尺寸。

例如，一个带内边距的 React Native 文本区域，其 intrinsic size 通常由以下内容共同决定：

- 文本尺寸
- 字体大小
- 内边距
- 子元素尺寸

它近似于 Web 中由内容自然撑开的尺寸，但底层计算机制不同。

## 核心工作模式

`RNHostView` 有两种尺寸同步模式，区别由 `matchContents` 控制。

| 模式 | shadow node 使用的尺寸 | 适合场景 |
| --- | --- | --- |
| `matchContents={true}` | React Native 子内容的自然尺寸 | 让 SwiftUI 父组件被内容撑开 |
| 不传或设置为 `false` | SwiftUI 父视图提供的尺寸 | 让 React Native 内容填满可用空间 |

选择时可以先判断尺寸由谁决定：

- 内容决定容器大小：使用 `matchContents`
- 容器决定内容可用空间：不使用 `matchContents`

## 安装

根据项目使用的包管理器执行对应命令：

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

`expo install` 与直接执行 `npm install` 的关注点不同：它用于安装与当前 Expo SDK 兼容的包版本。因此，即使项目使用 npm，文档给出的命令也是：

```sh
npx expo install @expo/ui
```

如果是在已有的裸 React Native 项目中安装，还必须先按照 Expo 文档为项目安装 `expo`，使该项目能够使用 Expo Modules。

> 文档明确说明：已有 React Native 项目需要安装 `expo`。  
> 当前文档未展开原生 iOS 工程配置、Pod 安装或 Android 配置流程。

## 基本用法：让内容撑开 SwiftUI 容器

当 SwiftUI 父组件的尺寸应由 React Native 内容决定时，使用：

```tsx
<RNHostView matchContents>
  {/* React Native 内容 */}
</RNHostView>
```

原文以 `BottomSheet` 为例：

```tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Host, BottomSheet, Button, RNHostView } from '@expo/ui/swift-ui';

function Example() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Button label="Open Sheet" onPress={() => setIsPresented(true)} />

      <BottomSheet
        isOpened={isPresented}
        onIsOpenedChange={setIsPresented}>
        <RNHostView matchContents>
          <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              React Native Content
            </Text>

            <Pressable
              style={{
                backgroundColor: '#007AFF',
                padding: 12,
                borderRadius: 8,
                marginTop: 16,
              }}
              onPress={() => setIsPresented(false)}>
              <Text style={{ color: 'white', textAlign: 'center' }}>
                Close
              </Text>
            </Pressable>
          </View>
        </RNHostView>
      </BottomSheet>
    </Host>
  );
}
```

这个例子中的职责如下：

- `Host`：承载 SwiftUI 组件树。
- `Button`：来自 `@expo/ui/swift-ui` 的 SwiftUI 按钮。
- `BottomSheet`：SwiftUI 底部弹层。
- `RNHostView`：在 SwiftUI 弹层中承载 React Native 组件。
- `View`、`Text`、`Pressable`：React Native 组件。
- `matchContents`：让弹层布局参考 React Native 内容的自然尺寸。

`isOpened` 控制弹层是否打开；`onIsOpenedChange` 将 SwiftUI 侧的状态变化同步回 React state。

## 弹性布局：填满 SwiftUI 提供的空间

如果 React Native 内容使用 `flex: 1`，并且目标是填满 SwiftUI 父容器提供的空间，则不要传入 `matchContents`：

```tsx
<RNHostView>
  <View style={{ flex: 1 }}>
    {/* 内容 */}
  </View>
</RNHostView>
```

原文示例：

```tsx
<BottomSheet
  isOpened={isPresented}
  onIsOpenedChange={setIsPresented}
  presentationDetents={['medium', 'large']}>
  <RNHostView>
    <View
      style={{
        flex: 1,
        backgroundColor: '#007AFF',
        padding: 24,
      }}>
      <Text style={{ color: 'white', fontSize: 18 }}>
        This content fills the available space
      </Text>
    </View>
  </RNHostView>
</BottomSheet>
```

这里的尺寸传递方向是：

1. `BottomSheet` 确定当前可用空间。
2. `RNHostView` 获取 SwiftUI 父视图的尺寸。
3. 该尺寸被同步到 React Native 布局树。
4. 子 `View` 的 `flex: 1` 填满这块空间。

`presentationDetents={['medium', 'large']}` 表示示例中的底部弹层提供中等和较大的展示尺寸。当前文档没有进一步解释该属性的完整 API。

### 为什么此时不应使用 `matchContents`

`flex: 1` 表达的是“使用父容器分配的可用空间”，而 `matchContents` 表达的是“让宿主尺寸跟随子内容”。

两者代表相反的尺寸主导方向。

> 基于文档内容推导：如果需要父容器先确定可用空间，再让 React Native 内容填充它，启用 `matchContents` 会与这一布局目标不一致。

原文没有描述错误组合会产生的具体表现，因此不能断言一定会出现哪一种布局故障。

## 在 Popover 中承载交互内容

`RNHostView` 也可以放在 `Popover.Content` 内，显示可交互的 React Native 内容：

```tsx
<Popover
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}>
  <Popover.Trigger>
    <Button
      onPress={() => setIsPresented(true)}
      label="Show Popover"
    />
  </Popover.Trigger>

  <Popover.Content>
    <RNHostView matchContents>
      <View style={{ padding: 24 }}>
        <Text>Counter: {counter}</Text>

        <Pressable onPress={() => setCounter(counter + 1)}>
          <Text>Increment</Text>
        </Pressable>
      </View>
    </RNHostView>
  </Popover.Content>
</Popover>
```

这个示例说明：

- `RNHostView` 内可以包含带 React state 的内容。
- React Native 的 `Pressable` 可以响应交互。
- 状态变化后，内容可以重新渲染。
- `matchContents` 让 Popover 根据 React Native 内容确定所需尺寸。

因此，`RNHostView` 不只是展示静态内容，也可承载交互式 React Native 组件。

## API 说明

导入方式：

```tsx
import { RNHostView } from '@expo/ui/swift-ui';
```

### `RNHostView`

类型：

```ts
React.Element<RNHostViewProps>
```

支持平台：

- iOS
- tvOS

### `children`

```ts
children: React.ReactElement
```

用于指定需要承载的 React Native 视图。

文档将其描述为“The RN View to be hosted”。

需要注意，其类型是单个 `React.ReactElement`，不是任意数量的节点。需要放置多个同级组件时，可以先使用一个 `View` 包裹：

```tsx
<RNHostView matchContents>
  <View>
    <Text>第一项</Text>
    <Text>第二项</Text>
  </View>
</RNHostView>
```

### `matchContents`

```ts
matchContents?: boolean
```

默认值：

```ts
false
```

行为：

- `true`：`RNHostView` 在 React Native 视图树中的尺寸跟随子内容尺寸。
- `false`：`RNHostView` 使用 SwiftUI 父视图的尺寸。

最重要的限制是：

> `matchContents` 只能在组件挂载时设置一次。

也就是说，不应把它当作可在组件存续期间随意切换的响应式布局开关。

以下模式不符合文档描述的使用约束：

```tsx
<RNHostView matchContents={someChangingState}>
  <View />
</RNHostView>
```

如果 `someChangingState` 在挂载后发生变化，不能假设 `RNHostView` 会切换尺寸同步模式。

> 基于文档内容推导：应在渲染 `RNHostView` 前确定布局策略，并在其生命周期内保持不变。文档没有提供运行时切换模式的推荐方案。

## React Web 开发者容易误解的地方

### 它不是普通的布局容器

在 Web 中，把一个元素包进 `div` 通常仍处于同一套 DOM/CSS 布局系统中。

这里的 `RNHostView` 位于 React Native Yoga 与 SwiftUI 两套布局系统之间。它的核心职责是尺寸桥接，而不只是增加一层组件结构。

### `matchContents` 不是 CSS 的 `width: fit-content`

两者都有“尺寸跟随内容”的表面效果，但实现完全不同：

- `fit-content` 属于浏览器 CSS 布局规则。
- `matchContents` 会修改 React Native shadow node 的尺寸，以协调 SwiftUI 与 Yoga。

因此，不能直接套用浏览器对 CSS intrinsic sizing 的全部理解。

### `flex: 1` 必须有可用空间来源

与 Web Flexbox 类似，`flex: 1` 只有在父级提供了可分配空间时才有意义。

本文的无 `matchContents` 模式正是让 SwiftUI 父级尺寸进入 React Native 布局树，从而为子组件的 `flex: 1` 提供空间依据。

### JSX 不代表所有组件来自同一 UI 系统

示例中虽然所有内容都写在 JSX 里，但组件来源不同：

```tsx
import { Pressable, Text, View } from 'react-native';
import { Host, BottomSheet, Button, RNHostView } from '@expo/ui/swift-ui';
```

前一组是 React Native 组件，后一组与 SwiftUI 集成有关。阅读代码时需要关注导入来源，而不能仅根据 JSX 外观判断底层 UI 类型。

### 平台支持不等于跨平台支持

该组件的 API 明确标注支持 iOS 和 tvOS。页面还标注它包含在 Expo Go 中。

当前文档没有声明支持：

- Android
- Web

因此，不应假设同一代码可以在 Android 或 React Native Web 上获得相同行为。

## 注意事项与限制

1. 文档页面面向下一个 Expo SDK 版本，而不是当时的稳定 SDK 文档。实际项目应核对当前 SDK 对应版本的 API。
2. `matchContents` 默认为 `false`，省略时会采用 SwiftUI 父视图尺寸。
3. `matchContents` 只能在挂载时设置一次，不能依赖挂载后的属性变化切换布局模式。
4. `children` 的类型是单个 `React.ReactElement`；多个同级内容应使用 React Native 容器包裹。
5. 内容自然撑开容器时使用 `matchContents`；内容填充父级空间时省略它。
6. 该组件仅明确支持 iOS 和 tvOS，当前文档未涉及 Android 和 Web 支持。
7. 裸 React Native 项目必须先安装和配置 Expo Modules。
8. 当前文档未提供性能特征、嵌套限制、动画行为、错误处理或故障排查说明。

## 实际开发中的选择方法

可以按以下顺序决定是否使用 `matchContents`：

1. 确认 React Native 视图是否被放入 SwiftUI 组件。
2. 判断最终尺寸由哪一侧决定。
3. 如果 React Native 内容需要撑开 `Popover` 或内容型弹层，使用 `matchContents`。
4. 如果 SwiftUI 容器先提供固定或可变空间，React Native 内容需要以 `flex: 1` 填满它，则不使用 `matchContents`。
5. 在组件挂载前确定模式，不要在挂载后动态切换。
6. 检查目标平台是否为 iOS 或 tvOS。

可以将其简化为：

```text
React Native 内容决定尺寸
    -> RNHostView matchContents

SwiftUI 父容器决定尺寸
    -> RNHostView
    -> React Native 子视图可使用 flex: 1
```

> 基于经验建议：将 `RNHostView` 尽量放在 SwiftUI 与 React Native 内容的直接边界处，有助于从组件结构中识别尺寸由哪一侧主导。这不是当前文档明确规定的要求。

## 文档明确内容与推导内容

### 文档明确说明

- `RNHostView` 用于在 SwiftUI 中承载 React Native 视图。
- 它通过更新 shadow node 尺寸协调 SwiftUI 与 Yoga 布局。
- `matchContents={true}` 时尺寸跟随 React Native 子内容。
- `matchContents={false}` 时使用 SwiftUI 父视图尺寸。
- 使用 `flex: 1` 填充空间时应省略 `matchContents`。
- 它可用于 `BottomSheet`、`Popover`、`HStack` 等 SwiftUI 组件。
- `matchContents` 默认为 `false`，并且只能在挂载时设置一次。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 现有 React Native 项目需要安装 `expo`。

### 基于文档内容推导

- 选择模式的本质是确定 React Native 内容与 SwiftUI 父容器谁主导尺寸。
- 不应依赖 state 在挂载后动态切换 `matchContents`。
- 多个同级子节点应先用单个 React Native 容器包装，以满足 `React.ReactElement` 类型要求。
- `matchContents` 与 `flex: 1` 填充父级代表不同的尺寸传递方向。

## 总结

`RNHostView` 是 React Native Yoga 布局与 SwiftUI 布局之间的尺寸桥梁。

使用时最重要的是确定尺寸的主导方：

- 希望 SwiftUI 容器跟随 React Native 内容：使用 `matchContents`。
- 希望 React Native 内容填满 SwiftUI 提供的空间：省略 `matchContents`，子内容可使用 `flex: 1`。

此外，需要在挂载时确定 `matchContents`，并注意该 API 当前明确支持的平台只有 iOS 和 tvOS。

---

## 文档导航

- **上一页**：[progressview](./102__progressview.md)
- **下一页**：[scrollview](./104__scrollview.md)
