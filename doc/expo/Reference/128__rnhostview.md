# RNHostView：在 SwiftUI 中承载 React Native 视图

> 原文修改日期：2026 年 4 月 29 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含  
> 文档状态：面向下一个 Expo SDK 版本；原文提示当前最新稳定文档为 SDK 56。

## 文档解决的问题

`RNHostView` 用于把 React Native 视图放进 SwiftUI 组件，同时让两套布局系统正确交换尺寸信息。

例如，将 React Native 的 `<View>`、`<Text>` 或 `<Pressable>` 放入以下 SwiftUI 组件时，可以使用 `RNHostView`：

- `BottomSheet`
- `Popover`
- `HStack`
- 其他 SwiftUI 容器

这里的关键问题不是“能否渲染”，而是“由谁决定最终尺寸”。

React Native 通常使用 Yoga 布局系统计算尺寸；SwiftUI 则使用自己的布局机制。如果二者不知道对方算出的尺寸，可能无法正确实现以下效果：

- SwiftUI 容器随 React Native 内容自动调整大小。
- React Native 内容填满 SwiftUI 提供的空间。
- React Native 中的 `flex: 1` 获得明确的可用高度。

`RNHostView` 会在两套布局系统之间同步尺寸信息，并更新 React Native shadow node 的大小。

## 阅读前需要理解的概念

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台界面的原生 UI 框架。

对 React Web 开发者而言，可以把 SwiftUI 组件粗略理解为另一套独立于 DOM 和 CSS 的原生组件及布局系统。本文中的 `BottomSheet`、`Popover` 和 `HStack` 都属于 SwiftUI 侧的组件。

### React Native 与 Yoga

React Native 不使用浏览器 DOM 和 CSS 布局引擎。React Native 组件的布局主要由 Yoga 计算。

虽然 `style={{ flex: 1 }}` 看起来类似 Web CSS，但其运行环境和尺寸计算过程不同，不能假设它会像浏览器中的元素一样自然获得父容器高度。

### Shadow node

Shadow node 是 React Native 布局树中的内部节点。Yoga 在这棵布局树上计算组件的尺寸和位置。

本文所说的“更新 shadow node 大小”，可以理解为：

> `RNHostView` 把 SwiftUI 侧确定的尺寸反馈给 React Native 布局树，使 Yoga 能基于正确的边界继续布局。

它不是浏览器中的 shadow DOM，也与 Web Components 的 Shadow DOM 无关。

### intrinsic size

`intrinsic size` 指内容根据自身需要得到的自然尺寸。

例如，一个带有文字、内边距和按钮的 React Native `<View>`，在不要求它填满父容器时，可以根据这些内容计算出自身所需的宽高。

## 两种布局模式

`RNHostView` 的核心配置是 `matchContents`。它决定尺寸同步的方向。

| 用法 | 尺寸来源 | 适合场景 |
|---|---|---|
| `<RNHostView matchContents>` | React Native 子内容的自然尺寸 | SwiftUI 父容器需要随内容调整大小 |
| `<RNHostView>` | SwiftUI 父视图提供的尺寸 | React Native 内容需要填满可用空间 |

### 使用 `matchContents`

启用 `matchContents` 后，`RNHostView` 会让 React Native 布局树中的对应节点匹配子内容的尺寸。SwiftUI 父组件因此可以根据 React Native 内容决定自身大小。

典型场景包括：

- 内容高度由文字、按钮和内边距决定。
- 弹层只需要包裹实际内容。
- 不希望内容占满整个可用区域。

```tsx
<RNHostView matchContents>
  <View style={{ padding: 24 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
      React Native Content
    </Text>
  </View>
</RNHostView>
```

这类似于 Web 中让容器根据普通文档流里的内容自然撑开，但实际实现依赖 React Native 与 SwiftUI 之间的尺寸同步，而不是浏览器布局。

### 不使用 `matchContents`

省略 `matchContents` 时，其默认值为 `false`。此时 `RNHostView` 使用 SwiftUI 父视图的尺寸，并将该尺寸提供给 React Native 布局。

这适用于 React Native 内容需要占满可用空间的情况，尤其是内容使用 `flex: 1` 时：

```tsx
<RNHostView>
  <View style={{ flex: 1 }}>
    <Text>This content fills the available space</Text>
  </View>
</RNHostView>
```

此模式下，尺寸流向可以理解为：

1. SwiftUI 父视图确定可用空间。
2. `RNHostView` 获得父视图尺寸。
3. React Native 的 Yoga 布局系统使用这个尺寸。
4. 子组件的 `flex: 1` 填满相应空间。

## 安装

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

以上命令使用 `expo install` 安装 `@expo/ui`。与直接执行包管理器的普通安装命令相比，`expo install` 用于选择与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生工程，而不是已经配置好的 Expo 项目，原文要求先在项目中安装并配置 `expo`，以便使用 Expo Modules。

## 导入方式

```tsx
import { RNHostView } from '@expo/ui/swift-ui';
```

注意导入路径是 `@expo/ui/swift-ui`，不是仅从 `@expo/ui` 导入。

示例中的相关 SwiftUI 组件也来自同一路径：

```tsx
import {
  Host,
  BottomSheet,
  Button,
  Popover,
  RNHostView,
} from '@expo/ui/swift-ui';
```

其中 `Host` 是示例中承载 SwiftUI 组件的外层组件。当前文档展示了它的使用方式，但没有进一步说明其完整 API。

## 在 BottomSheet 中使用

### 内容决定弹层尺寸

当 `BottomSheet` 应根据 React Native 内容调整大小时，使用 `matchContents`：

```tsx
<BottomSheet
  isOpened={isPresented}
  onIsOpenedChange={setIsPresented}>
  <RNHostView matchContents>
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        React Native Content
      </Text>

      <Pressable onPress={() => setIsPresented(false)}>
        <Text>Close</Text>
      </Pressable>
    </View>
  </RNHostView>
</BottomSheet>
```

示例中的状态流转如下：

1. React state `isPresented` 保存弹层是否打开。
2. SwiftUI `Button` 将其设置为 `true`。
3. `BottomSheet` 通过 `isOpened` 接收当前状态。
4. `onIsOpenedChange` 将原生侧的状态变化同步回 React。
5. React Native `Pressable` 可以把状态重新设置为 `false`。
6. `RNHostView matchContents` 让弹层根据内部 React Native 内容计算尺寸。

### 内容填满弹层空间

如果 React Native 内容使用 `flex: 1`，则不要设置 `matchContents`：

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

这里 `presentationDetents={['medium', 'large']}` 为 Bottom Sheet 提供中等和较大的展示档位。`RNHostView` 接收弹层给出的空间，内部 `flex: 1` 才能据此填满区域。

当前文档没有展开说明 `presentationDetents` 的完整取值、默认行为或平台差异，需要参考 `BottomSheet` 的独立文档。

## 在 Popover 中使用

`RNHostView` 也可以在 `Popover.Content` 中承载可交互的 React Native 内容：

```tsx
<Popover
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}>
  <Popover.Trigger>
    <Button
      label="Show Popover"
      onPress={() => setIsPresented(true)}
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

- `Popover` 和触发按钮来自 SwiftUI 组件层。
- 弹出内容内部可以继续使用 React Native 的 `View`、`Text` 和 `Pressable`。
- React Native 事件仍可以更新 React state。
- `matchContents` 使 Popover 根据内容所需尺寸布局。

因此，`RNHostView` 不只是静态视图包装器，也能承载具有状态和交互行为的 React Native 内容。

## API

### `RNHostView`

```tsx
<RNHostView matchContents>
  {child}
</RNHostView>
```

支持平台：

- iOS
- tvOS

### `children`

```ts
React.ReactElement
```

表示要承载的 React Native 视图。

类型是单个 `ReactElement`，不是任意数量的节点。因此需要把多个兄弟节点放在一个共同的 React Native 容器中：

```tsx
<RNHostView matchContents>
  <View>
    <Text>First</Text>
    <Text>Second</Text>
  </View>
</RNHostView>
```

不要直接传入多个并列子节点：

```tsx
{/* 不符合文档给出的 children 类型 */}
<RNHostView matchContents>
  <Text>First</Text>
  <Text>Second</Text>
</RNHostView>
```

### `matchContents`

```ts
boolean | undefined
```

- 可选属性
- 默认值：`false`
- 支持平台：iOS、tvOS

行为如下：

- `true`：使 React Native 布局树中的 RNHost 尺寸匹配子内容尺寸。
- `false`：使用 SwiftUI 父视图的尺寸。

原文明确指出，`matchContents` **只能在挂载时设置一次**。

这意味着不要把它当作可以在组件已挂载后动态切换的普通 React prop：

```tsx
// 不应依赖这种动态切换来改变布局模式
<RNHostView matchContents={shouldWrapContent}>
  <View />
</RNHostView>
```

如果业务确实需要切换布局模式，当前文档没有提供官方操作方案。

## 选择布局模式

可以按照以下问题进行判断：

1. SwiftUI 容器应该由 React Native 内容撑开吗？
   - 是：使用 `matchContents`。
2. React Native 内容应该填满 SwiftUI 已经提供的区域吗？
   - 是：省略 `matchContents`。
3. React Native 根内容是否使用 `flex: 1`？
   - 通常应省略 `matchContents`，让它获得父级的明确尺寸。
4. 内容只是文字、按钮和固定内边距组成的小型弹层吗？
   - 通常适合使用 `matchContents`。

> **基于文档内容推导：** `matchContents` 和“让内容填满父空间”代表相反的尺寸策略。不要因为属性名称看起来像“适配内容”就默认在所有场景中启用。

## 注意事项与限制

### 仅支持 Apple 平台

API 部分明确列出的支持平台是 iOS 和 tvOS。本文没有说明 Android 或 Web 支持，因此不应将它用于跨平台通用布局逻辑而不做平台隔离。

页面顶部还标注该组件包含在 Expo Go 中，但这不改变其平台范围。

### 文档面向下一个 SDK 版本

原文明确提示，这一页面描述的是下一个 Expo SDK 版本，而当前最新稳定文档是 SDK 56。

实际开发时应根据项目使用的 Expo SDK 版本核对 API。未发布版本中的接口和行为不能直接视为当前稳定版本能力。

### `matchContents` 只能在挂载时确定

该属性只能在组件 mount 时设置一次。React Web 开发者容易把它理解成可随 state 任意更新的展示属性，但它实际上决定了底层布局同步模式。

### `flex: 1` 不会凭空产生可用高度

`flex: 1` 表示占用父布局提供的剩余空间。如果父级没有把 SwiftUI 尺寸同步给 React Native，子视图就缺少可靠的布局边界。

因此，文档专门要求在需要填满空间时省略 `matchContents`。

### 当前文档未涉及的内容

当前文档没有说明：

- Android 和 Web 的替代实现。
- `RNHostView` 的性能开销。
- 多层嵌套 `RNHostView` 的行为。
- 动态切换 `matchContents` 的官方方案。
- 子内容尺寸持续变化时的详细更新机制。
- 键盘、滚动、Safe Area 和屏幕旋转的处理方式。
- 错误处理与故障排查方法。
- `Host`、`BottomSheet` 和 `Popover` 的完整 API。
- 是否需要额外的 iOS 原生工程配置。
- tvOS 上的具体交互差异。

对这些内容不能仅根据本文作出确定结论。

## React Web 开发者容易误解的地方

### 这不是普通的 DOM 包装组件

在 React Web 中，父子元素通常共享同一套浏览器布局系统。这里的父组件和子内容分别由 SwiftUI 与 React Native Yoga 布局，必须显式桥接尺寸信息。

因此，`RNHostView` 的主要价值是协调布局，而不是简单增加一层组件结构。

### `matchContents` 不是 CSS 的通用替代品

它不会替代 `padding`、`flex`、宽高等 React Native 样式。它决定的是 SwiftUI 与 React Native 之间以哪一侧的尺寸为依据。

内部内容仍然需要正常编写 React Native 样式。

### SwiftUI 组件和 React Native 组件来自不同体系

示例中：

```tsx
import { Pressable, Text, View } from 'react-native';
import { Host, BottomSheet, Button, RNHostView } from '@expo/ui/swift-ui';
```

`View`、`Text` 和 `Pressable` 是 React Native 组件；`Host`、`BottomSheet`、`Button` 和 `Popover` 是 Expo 暴露的 SwiftUI 组件。

即使它们都通过 JSX 编写，也不代表它们使用同一套底层布局系统。

### “Included in Expo Go”不等于全平台可用

Expo Go 包含该模块，只表示在受支持的平台上可以使用预置的原生能力。本文明确支持的是 iOS 和 tvOS，不能由此推断 Android 也支持。

## 实际开发建议

以下是基于本文信息整理出的使用步骤：

1. 确认项目运行在 iOS 或 tvOS。
2. 核对项目 Expo SDK 版本对应的稳定文档。
3. 使用 `expo install` 安装 `@expo/ui`。
4. 从 `@expo/ui/swift-ui` 导入 `RNHostView`。
5. 将 React Native 内容整理为单个根元素。
6. 根据尺寸归属选择是否启用 `matchContents`。
7. 如果根内容依赖 `flex: 1`，让 `RNHostView` 使用默认的 `matchContents={false}`。
8. 不要依赖运行时修改 `matchContents`。
9. 分别测试短内容、长内容和动态内容下的实际尺寸表现。

> **基于经验建议：** 对弹层类界面，应在真机或对应平台模拟器上检查尺寸和交互。React Web 的浏览器预览无法完整反映 SwiftUI 与 React Native 原生布局系统之间的行为。

## 明确结论与推导结论

### 文档明确说明

- `RNHostView` 用于在 SwiftUI 中承载 React Native 视图。
- 它通过更新 shadow node 尺寸同步两套布局系统。
- `matchContents={true}` 时，以 React Native 子内容尺寸为依据。
- `matchContents={false}` 时，以 SwiftUI 父视图尺寸为依据。
- 使用 React Native `flex: 1` 时，应省略 `matchContents`。
- `matchContents` 默认为 `false`，且只能在挂载时设置一次。
- `children` 类型为单个 `React.ReactElement`。
- 支持 iOS 和 tvOS。
- 组件包含在 Expo Go 中。
- 已有 React Native 工程需要先配置 Expo Modules。
- 本页属于下一个 SDK 版本的文档。

### 基于文档内容推导

- `matchContents` 本质上是在选择尺寸信息的主导方。
- 自适应内容的小型弹层通常适合启用 `matchContents`。
- 需要占满弹层或父容器的页面区域通常应使用默认模式。
- 动态改变布局策略时，不能依赖直接更新 `matchContents`。
- 跨平台业务需要为 Android 和 Web 设计其他实现或平台分支，但具体替代方案不在本文范围内。

## 总结

`RNHostView` 解决的是 React Native Yoga 布局与 SwiftUI 布局之间的尺寸协调问题。

使用时只需要抓住一个核心判断：

- **让 SwiftUI 包裹 React Native 内容：** 使用 `matchContents`。
- **让 React Native 内容填满 SwiftUI 空间：** 不使用 `matchContents`。

同时需要牢记：它仅支持 iOS 和 tvOS，`children` 应为单个 React 元素，并且 `matchContents` 必须在组件挂载时确定，不能作为普通动态属性随意切换。

---

## 文档导航

- **上一页**：[picker](./127__picker.md)
- **下一页**：[slider](./129__slider.md)
