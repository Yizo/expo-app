# Expo UI SwiftUI BottomSheet 学习文档

> 原文档更新时间：2026 年 6 月 10 日  
> 文档版本：下一版本 SDK 的未发布文档  
> 对应包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已内置

## 文档解决的问题

`BottomSheet` 用于从屏幕底部弹出一块原生内容区域，常见用途包括：

- 操作菜单
- 筛选面板
- 详情预览
- 辅助表单
- 可拖动到不同高度的内容面板

该组件基于 SwiftUI，并与 Apple 官方的 SwiftUI `sheet` API 保持一致。它不是通过 React Native `View` 模拟出来的底部弹层，而是对 Apple 原生 SwiftUI Sheet 能力的封装。

本文档主要说明：

1. 如何安装并显示 `BottomSheet`
2. 如何控制弹层高度
3. 如何追踪和切换当前高度
4. 如何控制背景交互和滑动关闭
5. 如何在 SwiftUI BottomSheet 中嵌入 React Native 内容
6. 固定内容、自适应内容和滚动内容应如何布局

## 阅读前需要理解的背景

### Expo、React Native 与 SwiftUI 的关系

对于 React Web 开发者，可以这样理解：

| 技术 | 类比与作用 |
| --- | --- |
| React | 负责组件声明和状态管理 |
| React Native | 使用 React 编写移动端界面，但基础组件不是 HTML DOM |
| Expo | 围绕 React Native 提供开发工具、原生模块和运行环境 |
| SwiftUI | Apple 提供的 iOS、tvOS 等平台原生 UI 框架 |
| `@expo/ui/swift-ui` | 允许 React 代码声明和使用部分 SwiftUI 原生组件 |

虽然示例仍使用 JSX、`useState` 和事件回调，但 `Host`、`VStack`、`BottomSheet` 等组件最终对应的是 SwiftUI 视图，而不是网页 DOM 或普通 React Native 视图。

### `Host` 的作用

`Host` 是 SwiftUI 内容与 React Native 应用之间的承载边界。SwiftUI 组件通常需要放在 `Host` 中。

可以粗略类比为：在 React Web 页面中挂载一个由其他渲染系统管理的 UI 区域。不过这里连接的是 React Native 与 SwiftUI，而不是两个 Web DOM 根节点。

### `VStack` 与 `Group`

- `VStack`：SwiftUI 的垂直布局容器，作用类似纵向排列的 Flexbox。
- `Group`：用于组合 SwiftUI 内容，并承载 `presentationDetents` 等 presentation modifier。
- `modifier`：SwiftUI 中为视图附加布局、样式或交互行为的机制。它不完全等同于 CSS，更接近对原生视图行为进行声明式配置。

### 受控状态模型

`BottomSheet` 使用受控组件模式：

```tsx
const [isPresented, setIsPresented] = useState(false);

<BottomSheet
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}
/>
```

这与 React Web 中受控 `Dialog` 的模式相似：

- `isPresented` 决定是否显示。
- `onIsPresentedChange` 接收由原生交互导致的状态变化，例如用户下滑关闭弹层。
- 应用也可以调用 `setIsPresented(false)` 主动关闭弹层。

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

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它会按照当前 Expo SDK 选择兼容的依赖版本。

如果项目是已有的、不由 Expo 创建的 React Native 原生工程，还必须先安装并配置 `expo`，使工程能够加载 Expo Modules。

> React Web 项目不能仅安装 `@expo/ui` 后直接使用该组件。它依赖 React Native、Expo Modules 以及 Apple 平台的原生运行环境。

## 基础用法

```tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Text,
  VStack,
} from '@expo/ui/swift-ui';

export default function BasicBottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <Button
          label="Open Sheet"
          onPress={() => setIsPresented(true)}
        />

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

基本流程如下：

1. 使用 `useState` 保存弹层是否显示。
2. 点击按钮，将 `isPresented` 设置为 `true`。
3. `BottomSheet` 根据该状态显示。
4. 用户关闭弹层时，`onIsPresentedChange` 更新 React 状态。

不要只提供 `isPresented` 而忽略 `onIsPresentedChange`。否则用户通过原生手势关闭后，React 状态可能无法与实际界面保持同步。

## 控制 BottomSheet 高度

文档提供两种主要方式：

- `fitToContents`：根据内容计算高度。
- `presentationDetents`：声明一个或多个允许停靠的高度。

两种方式面向不同布局需求。

### 根据内容自动调整高度

```tsx
<BottomSheet
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}
  fitToContents>
  <VStack>
    <Text>This sheet automatically sizes to fit its content.</Text>
    <Button
      label="Close"
      onPress={() => setIsPresented(false)}
    />
  </VStack>
</BottomSheet>
```

`fitToContents` 默认为 `false`。设置为 `true` 后，BottomSheet 会根据子内容高度设置对应的 presentation detent。

适合以下场景：

- 内容高度明确且较小
- 简短操作菜单
- 少量文本和按钮
- 内容不需要填满可用空间

### 使用 `presentationDetents` 设置停靠高度

“Detent” 指弹层可以停留或吸附的位置。用户拖动弹层时，它会在声明的高度之间切换。

支持四种高度：

| 配置 | 含义 |
| --- | --- |
| `'medium'` | 系统中等高度，约为半屏 |
| `'large'` | 系统大高度，接近全屏 |
| `{ fraction: number }` | 屏幕高度的比例，范围为 `0` 到 `1` |
| `{ height: number }` | 固定高度，单位为 point |

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

Modifier 需要应用在 BottomSheet 内容中的 `Group` 上，而不是直接写成 `BottomSheet` 的 prop：

```tsx
<BottomSheet ...>
  <Group modifiers={[presentationDetents(['medium', 'large'])]}>
    {/* 内容 */}
  </Group>
</BottomSheet>
```

#### point 不是 CSS pixel

`{ height: 200 }` 中的 `200` 是 Apple 布局体系里的 point，而不是浏览器 CSS 像素。

对开发者而言通常可以将它理解为逻辑布局单位：系统会结合设备显示密度将 point 转换为实际物理像素。

## 追踪和控制当前 Detent

`presentationDetents` 的第二个参数可以接收：

- `selection`：当前选择的高度。
- `onSelectionChange`：当前高度发生变化时执行的回调。

```tsx
const detents: PresentationDetent[] = [
  { height: 300 },
  { fraction: 0.3 },
  'medium',
  'large',
];

const [selectedDetent, setSelectedDetent] =
  useState<PresentationDetent>('medium');
```

```tsx
<Group
  modifiers={[
    presentationDetents(detents, {
      selection: selectedDetent,
      onSelectionChange: setSelectedDetent,
    }),
    presentationDragIndicator('visible'),
  ]}>
  {/* 内容 */}
</Group>
```

这形成了另一组受控状态：

- 用户拖动弹层时，`onSelectionChange` 更新当前 detent。
- 应用调用 `setSelectedDetent(...)` 时，可以主动切换高度。

`PresentationDetent` 是联合类型，值可能是字符串或对象：

```tsx
const formatDetent = (detent: PresentationDetent): string => {
  if (typeof detent === 'string') return detent;
  if ('fraction' in detent) return `Fraction ${detent.fraction}`;
  return `Height ${detent.height}`;
};
```

对 React Web 开发者而言，这类似受控 Tabs 或受控 Select：组件既能响应用户操作，也能由外部状态主动控制。

## 拖动指示器

```tsx
presentationDragIndicator('visible')
```

该 modifier 显示弹层顶部的拖动指示器，向用户表明弹层可以上下拖动。

文档示例将它与多级 `presentationDetents` 搭配使用。当前页面没有完整列出该 modifier 的所有取值和默认行为。

## 允许与弹层后方内容交互

默认情况下，弹层通常会阻止用户操作其后方界面。可以使用 `presentationBackgroundInteraction` 改变这一行为：

```tsx
<Group
  modifiers={[
    presentationDetents(['medium', 'large']),
    presentationBackgroundInteraction({
      type: 'enabledUpThrough',
      detent: 'medium',
    }),
  ]}>
  <Text>
    Interact with content behind when at medium height.
  </Text>
</Group>
```

以上配置表示：当弹层高度不超过 `'medium'` 时，允许操作弹层后面的内容。

适合需要同时操作主界面与辅助面板的场景，例如：

- 地图上方的地点详情面板
- 媒体播放控制面板
- 不遮断主操作流程的辅助工具

> 基于文档内容推导：允许背景交互会改变常规模态弹层的交互语义。使用前需要确认用户是否能清楚判断当前操作作用于弹层还是背景页面。

当前文档没有完整说明 `presentationBackgroundInteraction` 的其他模式及取值。

## 禁止通过滑动关闭

```tsx
<Group modifiers={[interactiveDismissDisabled()]}>
  <VStack>
    <Text>This sheet cannot be dismissed by swiping.</Text>
    <Button
      label="Close"
      onPress={() => setIsPresented(false)}
    />
  </VStack>
</Group>
```

`interactiveDismissDisabled()` 会阻止用户通过滑动手势关闭 BottomSheet。

它只禁止交互式滑动关闭，不代表弹层永远无法关闭。应用仍然可以：

```tsx
setIsPresented(false);
```

因此，在禁用滑动关闭后，应当提供明确的关闭、取消或完成按钮，避免用户被困在弹层中。

适合以下场景：

- 必须明确确认或取消的流程
- 未保存内容需要保护
- 不能被意外中断的操作

## 在 BottomSheet 中嵌入 React Native 内容

SwiftUI 组件和 React Native 组件属于不同 UI 系统。不能把任意 React Native `View` 当作普通 SwiftUI 子视图直接混用。

文档使用 `RNHostView` 作为桥接容器：

```tsx
<RNHostView matchContents>
  <View style={{ padding: 24 }}>
    <RNText>React Native Content</RNText>
    <Pressable onPress={() => setCounter(counter + 1)}>
      <RNText>Increment</RNText>
    </Pressable>
  </View>
</RNHostView>
```

其中：

- 外层 `BottomSheet`、`Group` 等由 SwiftUI 渲染。
- `RNHostView` 建立 SwiftUI 到 React Native 内容的承载区域。
- 内部可以使用 `View`、`Text`、`Pressable` 等 React Native 组件。

### 固定或内容驱动型布局

内容高度由内部元素决定时，可以组合使用：

```tsx
<BottomSheet fitToContents>
  <Group modifiers={[presentationDragIndicator('visible')]}>
    <RNHostView matchContents>
      {/* React Native 内容 */}
    </RNHostView>
  </Group>
</BottomSheet>
```

两个配置作用在不同层级：

| 配置 | 作用 |
| --- | --- |
| `RNHostView matchContents` | 让 RN 承载视图匹配内部 RN 内容高度 |
| `BottomSheet fitToContents` | 让整个弹层匹配其子内容高度 |

### 使用 `flex: 1` 的弹性布局

如果 React Native 内容使用 `flex: 1`，文档明确要求：

1. 不要给 `RNHostView` 设置 `matchContents`。
2. 使用 `presentationDetents` 确定 BottomSheet 可用高度。

```tsx
<BottomSheet
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}>
  <Group
    modifiers={[
      presentationDetents(['medium', 'large']),
      presentationDragIndicator('visible'),
    ]}>
    <RNHostView>
      <View style={{ flex: 1 }}>
        {/* 填满弹层可用空间 */}
      </View>
    </RNHostView>
  </Group>
</BottomSheet>
```

原因可以从布局约束理解：

- `matchContents` 要求外部根据内容固有高度决定尺寸。
- `flex: 1` 要求内容根据外部提供的空间扩展。
- 两者同时使用会形成“外部等内部、内部又等外部”的尺寸依赖。

> 上述原因属于基于文档示例与布局关系的推导；原文明确给出了配置要求，但没有进一步解释底层测量机制。

## 可滚动的 React Native 内容

BottomSheet 中可以通过 `RNHostView` 放入以下滚动组件：

- `FlatList`
- `ScrollView`
- FlashList
- Legend List

典型结构如下：

```tsx
<BottomSheet
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}>
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
            <RNText style={{ paddingVertical: 16 }}>
              {item}
            </RNText>
          )}
        />
      </View>
    </RNHostView>
  </Group>
</BottomSheet>
```

这里由 `presentationDetents` 确定弹层高度，列表则在该高度提供的区域内滚动。

这种布局适合：

- 长列表
- 搜索结果
- 联系人或选项选择器
- 数据量较大的详情面板

对于滚动内容，不应依赖 `fitToContents` 无限扩张弹层，而应先限定弹层高度，再让列表在内部滚动。

> 最后一句属于基于文档内容推导。原文示例明确采用 detent 限高，但没有将其表述为所有场景下的强制规则。

## API 说明

导入方式：

```tsx
import { BottomSheet } from '@expo/ui/swift-ui';
```

### `children`

```ts
React.ReactNode
```

BottomSheet 中显示的内容。

文档建议使用 `Group` 包裹内容，以便应用以下 presentation modifier：

- `presentationDetents`
- `presentationDragIndicator`
- `presentationBackgroundInteraction`
- `interactiveDismissDisabled`

### `fitToContents`

```ts
boolean
```

- 可选
- 默认值：`false`
- 支持 iOS、tvOS

为 `true` 时，BottomSheet 自动匹配子内容高度，并将 presentation detent 设置为该高度。

### `isPresented`

```ts
boolean
```

- 必填
- 支持 iOS、tvOS

控制 BottomSheet 是否显示。

### `onIsPresentedChange`

```ts
(isPresented: boolean) => void
```

- 必填
- 支持 iOS、tvOS

BottomSheet 显示状态变化时调用。应使用它同步 React 状态。

### `onDismiss`

```ts
() => void
```

- 可选
- 支持 iOS、tvOS

BottomSheet 完全关闭后调用。

`onDismiss` 与 `onIsPresentedChange` 的职责不同：

- `onIsPresentedChange`：同步“是否显示”的状态变化。
- `onDismiss`：在关闭动画和原生关闭流程完成后执行后续操作。

> 基于文档内容推导：如果需要在界面完全消失后清理临时数据或触发后续流程，`onDismiss` 比仅监听布尔状态更符合语义。

### 继承属性

`BottomSheet` 继承 `CommonViewModifierProps`。

当前页面没有展开这些继承属性的完整列表，需要查看 SwiftUI modifiers 文档。

## 注意事项与限制

### 这是未发布 SDK 的文档

页面明确说明它属于“下一版本 SDK”，不是当前稳定版本。页面同时指向 SDK 56 的最新稳定文档。

因此，本文中的 API 在未发布版本中可能继续变化。实际项目应以所使用 Expo SDK 对应的版本文档为准。

### 平台范围有限

组件 API 明确支持：

- iOS
- tvOS

页面没有声明 Android 或 Web 支持，因此不能将 `@expo/ui/swift-ui` 的 `BottomSheet` 当作跨平台组件。

如果需要跨平台使用，原文建议使用 universal `BottomSheet`，由它根据平台渲染适当的原生组件。

### SwiftUI 内容与 RN 内容不能直接混用

SwiftUI 组件来自：

```tsx
@expo/ui/swift-ui
```

React Native 组件来自：

```tsx
react-native
```

将 React Native 内容放进 SwiftUI BottomSheet 时，需要通过 `RNHostView` 承载。

### Modifier 应放在 `Group` 上

Presentation modifier 通过 `Group` 的 `modifiers` 数组应用：

```tsx
<Group modifiers={[/* modifiers */]}>
  {/* 内容 */}
</Group>
```

这与 React Web 中将所有配置写成组件 prop 的习惯不同。

### 文档部分示例缺少 `Group` 导入

原文中的若干示例使用了 `<Group>`，但对应的 import 列表没有导入 `Group`。实际代码应包含：

```tsx
import { Group } from '@expo/ui/swift-ui';
```

否则 TypeScript 或 JavaScript 会报告 `Group` 未定义。

### 高度策略需要与 RN 布局方式匹配

- 内容有明确固有高度：可使用 `matchContents` 和 `fitToContents`。
- 内容使用 `flex: 1`：省略 `matchContents`，使用 detent 提供外部高度。
- 内容需要滚动：使用 detent 限定弹层高度，让列表在内部滚动。

这是本页最重要的布局关系之一。

## React Web 开发者最容易误解的地方

### BottomSheet 不是 DOM 浮层

它不是使用 `position: fixed` 和 CSS 动画实现的网页抽屉，而是 Apple 平台原生 Sheet。其高度吸附、手势关闭和背景交互由原生 presentation 系统参与管理。

### `VStack` 不是普通 RN `View`

`VStack` 属于 SwiftUI 组件体系；React Native 的 `View` 属于 RN 组件体系。两者不能因为都写成 JSX 就被视为同一种节点。

### Detent 不是 CSS 断点

Detent 表示弹层可停靠的高度，不是响应式设计中的 viewport breakpoint。

### `onPress` 对应移动端交互

示例中的按钮使用 `onPress`，而不是 Web React 的 `onClick`。移动端交互需要同时考虑触摸手势和原生拖动行为。

### `style={{ flex: 1 }}` 不是浏览器 CSS

React Native 的 style 使用 JavaScript 对象，但它不是完整 CSS。`flex: 1` 表示占据父布局提供的可用空间，最终由 React Native 或桥接后的原生布局系统计算。

### Expo Go 内置不等于所有平台都可用

页面标记组件 Included in Expo Go，表示可以在 Expo Go 提供的相应原生环境中使用，并不意味着它因此支持 Android 或 Web。

## 实际开发建议

以下内容是基于文档示例整理的使用决策：

| 需求 | 建议方案 |
| --- | --- |
| 简短、固定内容 | `fitToContents` |
| SwiftUI 内容需要多个高度 | `presentationDetents` |
| 代码需要主动切换高度 | `selection` + `onSelectionChange` |
| 需要显示可拖动提示 | `presentationDragIndicator('visible')` |
| 较低高度时允许操作背景 | `presentationBackgroundInteraction` |
| 必须通过按钮完成或取消 | `interactiveDismissDisabled()` |
| 嵌入普通 RN 内容 | `RNHostView matchContents` |
| RN 内容使用 `flex: 1` | `RNHostView` 不设置 `matchContents`，并配置 detents |
| RN 长列表 | `RNHostView` + 列表组件 + detents |
| 同时支持多个平台 | 优先评估 universal `BottomSheet` |

### 基于经验建议

- 将 `isPresented` 保持为单一状态来源，不要同时维护多个含义相同的显示状态。
- 禁止滑动关闭时，始终提供清晰可见的关闭路径。
- 固定 point 高度可能不适合所有屏幕和动态字体设置，优先考虑系统 detent 或比例高度。
- 对包含表单或长列表的 BottomSheet，应在真实设备上测试键盘、滚动和拖动手势之间的配合。
- 使用未发布 SDK API 前，应确认项目 SDK 版本以及 `@expo/ui` 的实际类型定义。

这些是工程实践建议，并非当前原文档明确提出的要求。

## 文档明确内容与推导内容边界

### 文档明确说明

- BottomSheet 基于 SwiftUI Sheet API。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- `fitToContents` 可以按内容自动确定高度。
- `presentationDetents` 支持系统高度、比例高度和固定 point 高度。
- detent 可以被追踪和程序化控制。
- 可以允许与弹层后方内容交互。
- 可以禁止通过滑动关闭。
- React Native 内容需要放入 `RNHostView`。
- `flex: 1` 的 RN 内容不应使用 `matchContents`。
- 可滚动 RN 列表可以在由 detent 限定的高度内滚动。
- 该页面属于下一版本 SDK 文档。
- 跨平台需求可以查看 universal `BottomSheet`。

### 基于文档内容推导

- `fitToContents` 与 `flex: 1` 分别代表内容驱动和父容器驱动的两种布局方向。
- 滚动列表通常应由 detent 限高，而不是让弹层随列表无限增长。
- `onDismiss` 适合执行要求在弹层完全消失后发生的操作。
- 背景交互会弱化传统模态弹层的交互边界，需要谨慎设计。
- RN 与 SwiftUI 的 JSX 外观相似，但属于不同原生视图体系。

## 当前文档未涉及

当前页面没有说明以下内容：

- Android 上 SwiftUI BottomSheet 的替代实现
- Web 平台实现
- universal `BottomSheet` 的具体 API
- 各 modifier 的完整参数列表
- 最低 iOS 或 tvOS 系统版本
- 无障碍属性和焦点管理
- 键盘弹出时的详细行为
- 横竖屏切换行为
- 多个 BottomSheet 嵌套或同时显示
- 错误处理方式
- 自动化测试方法
- BottomSheet 动画的自定义方式
- detent 高度冲突时的处理规则

这些内容不能仅根据当前页面确定，需要查阅对应版本的其他 Expo 文档或 Apple SwiftUI 文档。

## 总结

Expo UI 的 SwiftUI `BottomSheet` 通过 React 状态控制 Apple 平台的原生 Sheet。学习它时需要掌握三组关系：

1. `isPresented` 与 `onIsPresentedChange` 负责同步显示状态。
2. `fitToContents` 与 `presentationDetents` 分别处理内容驱动和指定高度的布局。
3. SwiftUI 内容可以直接放入 Sheet；React Native 内容必须通过 `RNHostView` 桥接。

实际使用时，首先确定平台需求，然后根据内容是否固定、是否使用 `flex: 1`、是否需要滚动来选择高度策略。若项目需要 Android 等平台，应评估文档中提到的 universal `BottomSheet`，而不是直接依赖 SwiftUI 专用组件。

---

## 文档导航

- **上一页**：[alert](./75__alert.md)
- **下一页**：[button](./121__button.md)
