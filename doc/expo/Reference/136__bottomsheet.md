# BottomSheet：从屏幕底部弹出的模态面板

> 原文档修改日期：2026 年 5 月 23 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、iOS、Web  
> 可在 Expo Go 中使用

> **版本提醒：**原文是下一版本 Expo SDK 的未发布版本文档（`unversioned`），不代表当前稳定版 API。文档明确指出，当前稳定版本为 SDK 56。实际开发时应根据项目使用的 Expo SDK 版本查看对应文档，避免直接照搬尚未发布的 API。

## 文档解决的问题

`BottomSheet` 用于创建一种从屏幕底部向上滑出的模态面板。常见用途包括：

- 展示操作菜单；
- 补充当前页面的信息；
- 承载简短表单或筛选条件；
- 提供不需要跳转页面的临时交互界面；
- 让用户通过下滑或点击遮罩关闭内容。

它与 React Web 中的底部抽屉或模态框比较接近，但增加了移动端常见的拖拽关闭和多高度停靠能力。

这篇文档主要说明：

1. 如何安装 `@expo/ui`；
2. 如何使用 React state 控制面板；
3. 如何隐藏顶部拖拽指示器；
4. 如何配置多个停靠高度；
5. Android、iOS 和 Web 在停靠高度方面的差异；
6. `BottomSheet` 的属性和相关类型。

## 阅读前需要理解的概念

### Expo 与 React Native

React Native 使用 React 的组件和状态模型开发原生移动应用，但最终渲染的是原生界面，而不是浏览器 DOM。

Expo 是围绕 React Native 提供的一套工具和运行环境。`@expo/ui` 则提供跨平台 UI 组件，其中包括本文介绍的 `BottomSheet`。

对于 React Web 开发者，可以暂时这样建立对应关系：

| React Web 概念 | 本文中的对应概念 |
| --- | --- |
| npm 包 | `@expo/ui` |
| `<div>` 等 DOM 元素 | `Host`、`Column`、`Text` 等 UI 组件 |
| `onClick` | `onPress` |
| CSS 滚动容器 | `ScrollView` |
| 受控弹窗的 `open` 属性 | `BottomSheet` 的 `isPresented` |
| 弹窗关闭回调 | `onDismiss` |
| `data-testid` 一类测试标识 | `testID` |

这些概念只是方便理解，并不意味着两边的实现机制完全相同。

### 什么是模态面板

“模态”表示面板出现后，它会成为当前交互的重点，通常还会在其余界面上方显示遮罩。

`BottomSheet` 从屏幕底部出现。用户可以通过以下方式关闭它：

- 向下拖动面板；
- 点击面板之外的遮罩；
- 点击应用提供的关闭按钮。

### 什么是受控组件

本文中的 `BottomSheet` 是受 React state 控制的：

```tsx
const [isPresented, setIsPresented] = useState(false);
```

- `false`：面板隐藏；
- `true`：面板显示。

组件不会替你永久维护业务状态。用户通过手势关闭面板后，应用还需要在 `onDismiss` 中把 state 更新为 `false`。

这与 React Web 中受控的 `Dialog` 或 `Modal` 相同：外部 state 是界面是否打开的最终状态来源。

### 什么是停靠点

停靠点（snap point）是面板拖动后可以稳定停留的高度。

例如：

```tsx
snapPoints={['half', 'full']}
```

表示面板可以停留在：

- 大约半屏高度；
- 完全展开的高度。

如果不提供 `snapPoints`，面板会根据内容自动确定尺寸。

## 安装

根据项目使用的包管理器执行对应命令。

### npm

```sh
npx expo install @expo/ui
```

### Yarn

```sh
yarn expo install @expo/ui
```

### pnpm

```sh
pnpm expo install @expo/ui
```

### Bun

```sh
bun expo install @expo/ui
```

这里使用的是 `expo install`，而不只是普通的 `npm install`。

**基于文档内容推导：**Expo 项目中优先使用 `expo install`，可以让依赖安装流程与项目的 Expo SDK 环境配合。原文没有进一步说明版本选择规则。

如果是在已有的 React Native 原生工程中使用该组件，必须先把 `expo` 安装到工程中，即完成 Expo Modules 的接入。本文没有展开原生工程接入步骤。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, Column, Button, BottomSheet, Text } from '@expo/ui';

export default function BottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Button label="Open sheet" onPress={() => setIsPresented(true)} />

      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}>
        <Column spacing={12}>
          <Text textStyle={{ fontSize: 18, fontWeight: '700' }}>
            Sheet contents
          </Text>

          <Text>Drag down or tap the overlay to dismiss.</Text>

          <Button
            label="Close"
            onPress={() => setIsPresented(false)}
          />
        </Column>
      </BottomSheet>
    </Host>
  );
}
```

### 代码流程

1. 初始状态为 `false`，所以面板不显示。
2. 用户点击 `Open sheet`。
3. `setIsPresented(true)` 更新状态。
4. `BottomSheet` 根据 `isPresented={true}` 显示。
5. 用户向下拖动、点击遮罩，或者点击关闭按钮。
6. `setIsPresented(false)` 使 React state 与关闭后的界面保持一致。

### 示例中的组件

#### `Host`

`Host` 是 `@expo/ui` 示例中的外层承载组件。

```tsx
<Host style={{ flex: 1 }}>
```

`flex: 1` 表示占满父容器提供的可用空间。它不是 Web CSS 中完全等价的 `flex: 1` DOM 样式，但理解上可以把它看作“让根容器填满可用区域”。

原文没有进一步说明 `Host` 的完整职责和 API。

#### `Column`

`Column` 用于按垂直方向排列子元素：

```tsx
<Column spacing={12}>
```

`spacing={12}` 表示子元素之间保留间距。可以把它类比为 Web 纵向 Flexbox 布局中的 `gap: 12px`，但底层并不是浏览器 Flexbox。

#### `Button`

```tsx
<Button label="Open sheet" onPress={...} />
```

这里通过 `label` 提供按钮文字，通过 `onPress` 处理点击或触摸操作。React Native 体系通常使用 `onPress`，而不是 DOM 按钮的 `onClick`。

#### `Text`

在 React Native 和 Expo UI 中，文字通常需要放在专门的文字组件内，而不是像 Web 那样直接把文本放进任意容器。

#### `ScrollView`

`ScrollView` 是可滚动内容容器。它承担的角色类似 Web 中设置了 `overflow: auto` 的区域，但使用方式和底层实现不同。

## 隐藏拖拽指示器

默认情况下，面板顶部会显示拖拽指示器，也就是提示用户可以拖动面板的短横条。

使用以下属性可以隐藏它：

```tsx
showDragIndicator={false}
```

完整示例：

```tsx
import { useState } from 'react';
import { Host, Button, BottomSheet, Text } from '@expo/ui';

export default function BottomSheetNoIndicatorExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Button
        label="Open"
        onPress={() => setIsPresented(true)}
      />

      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        showDragIndicator={false}>
        <Text>No drag handle.</Text>
      </BottomSheet>
    </Host>
  );
}
```

隐藏指示器并不等同于文档明确禁止用户拖动。原文只说明该属性控制指示器是否显示，没有说明它会关闭拖拽手势。

因此，不应把它当作“禁止手势关闭”的配置。

## 配置停靠高度

通过 `snapPoints` 可以让用户在多个高度之间拖动面板。

```tsx
<BottomSheet
  isPresented={isPresented}
  onDismiss={() => setIsPresented(false)}
  snapPoints={['half', 'full']}>
  {/* 内容 */}
</BottomSheet>
```

### 跨平台语义值

文档推荐使用以下语义值获得较一致的跨平台行为：

| 值 | 含义 |
| --- | --- |
| `'half'` | 大约半屏高度 |
| `'full'` | 完全展开 |

例如：

```tsx
snapPoints={['half', 'full']}
```

允许用户在半屏和全屏之间拖动。

```tsx
snapPoints={['full']}
```

表示面板始终使用完全展开的高度。

“`half` 大约为半屏”并不承诺所有平台都具有完全相同的像素高度。

### 自定义比例高度

在 iOS 和 Web 上，可以使用屏幕高度比例：

```tsx
snapPoints={[{ fraction: 0.4 }, { fraction: 0.8 }]}
```

`fraction` 的取值范围为 `0` 到 `1`。例如，`0.4` 表示屏幕高度的 40%。

原文类型说明只定义了该数值范围，没有说明越界值会被截断、报错还是产生其他行为，因此不应依赖越界输入。

### 固定像素高度

在 iOS 和 Web 上，也可以指定固定高度：

```tsx
snapPoints={[{ height: 320 }]}
```

文档将 `height` 描述为固定像素高度。原文没有进一步说明它与设备像素密度、系统安全区域或屏幕边界之间的处理方式。

### 不提供停靠点

省略 `snapPoints` 时：

```tsx
<BottomSheet
  isPresented={isPresented}
  onDismiss={handleDismiss}>
  {/* 内容 */}
</BottomSheet>
```

面板会根据内容自动调整尺寸。

## 可滚动内容

当内容可能高于最小停靠点时，需要使用 `ScrollView` 包裹内容：

```tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Column,
  ScrollView,
  Text,
} from '@expo/ui';

export default function BottomSheetSnapPointsExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Button
        label="Open"
        onPress={() => setIsPresented(true)}
      />

      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        snapPoints={['half', 'full']}>
        <ScrollView>
          <Column spacing={12}>
            <Text textStyle={{ fontSize: 20, fontWeight: '700' }}>
              Half / full sheet
            </Text>

            <Text>
              Drag the sheet between half and full screen height.
            </Text>
          </Column>
        </ScrollView>
      </BottomSheet>
    </Host>
  );
}
```

这里需要区分两种手势：

- 拖动面板，在不同停靠高度之间切换；
- 滚动面板内部内容。

文档明确要求：当内容可能超过最小停靠高度时，使用 `ScrollView` 承载内容，使溢出部分能够正确滚动。

对于 React Web 开发者，不要只依赖内容自然溢出。在原生 UI 中，可滚动区域通常需要通过明确的滚动组件表达。

## Android 平台限制

这是本文最重要的跨平台差异。

Android 底层使用的 `ModalBottomSheet` 只支持两个稳定状态。因此，以下自定义配置不能像 iOS 和 Web 那样被精确执行：

```tsx
{ fraction: 0.4 }
```

```tsx
{ height: 320 }
```

在 Android 上，它们会被映射到最接近的：

- `'half'`
- `'full'`

因此，如果业务要求面板精确停在屏幕高度的 40% 或固定的 320 像素处，当前文档中的 `BottomSheet` 无法保证 Android 与 iOS、Web 行为一致。

### Android 半屏状态的显示条件

Android 的部分展开状态只有在内容足够高、超过 Material 组件的部分展开阈值时才会出现。

这意味着，即使配置了：

```tsx
snapPoints={['half', 'full']}
```

如果面板内容很短，也不一定能看到半屏状态。

文档给出的处理方式是：

- 为内容设置明确高度；或者
- 让内容填满可用空间。

本文没有提供具体的高度样式代码，也没有说明 Material 阈值的数值。

## API 参考

### 导入

```tsx
import { BottomSheet } from '@expo/ui';
```

### `children`

```ts
children?: ReactNode
```

面板内部渲染的内容，可选。

支持 Android、iOS 和 Web。

### `isPresented`

```ts
isPresented: boolean
```

控制面板当前是否显示，必填。

建议始终由 React state 提供：

```tsx
const [isPresented, setIsPresented] = useState(false);
```

### `onDismiss`

```ts
onDismiss: () => void
```

用户关闭面板时调用，必填。用户关闭方式包括向下滑动和点击遮罩。

典型写法：

```tsx
onDismiss={() => setIsPresented(false)}
```

需要特别注意：这个回调描述的是用户触发的关闭。应用自己的关闭按钮可以直接把 `isPresented` 设置为 `false`。

### `showDragIndicator`

```ts
showDragIndicator?: boolean
```

控制是否显示面板顶部的拖拽指示器。

默认值：

```ts
true
```

隐藏方式：

```tsx
showDragIndicator={false}
```

### `snapPoints`

```ts
snapPoints?: SnapPoint[]
```

定义面板可以停留的高度。

支持的值为：

```ts
type SnapPoint =
  | 'half'
  | 'full'
  | { fraction: number }
  | { height: number };
```

其中：

- `'half'`：大约半屏；
- `'full'`：完全展开；
- `{ fraction }`：屏幕高度比例，仅 iOS 和 Web 精确支持；
- `{ height }`：固定像素高度，仅 iOS 和 Web 精确支持。

省略时，面板根据内容自动调整尺寸。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

用于传入平台特有的 modifier 配置，属于处理平台差异的扩展入口。

配置来源包括：

```tsx
@expo/ui/swift-ui/modifiers
```

```tsx
@expo/ui/jetpack-compose/modifiers
```

其中 SwiftUI 对应 iOS UI 技术体系，Jetpack Compose 对应 Android UI 技术体系。

对于没有原生开发经验的 React Web 开发者，可以把它理解为“原生平台级高级配置入口”。它不是 CSS，也不是普通 React DOM 属性。

当前文档没有说明具体支持哪些 modifier、如何组合或各平台有哪些限制。需要使用时应查阅对应 modifier 文档，不能仅根据本文自行构造配置。

### `testID`

```ts
testID?: string
```

用于在端到端测试中定位组件。

可以把它类比为 Web 测试中的稳定元素标识，但本文没有指定应搭配哪一种测试框架，也没有提供测试示例。

## React Web 开发者容易误解的地方

### `onDismiss` 不能替代状态更新

错误的理解是：用户关闭面板后，组件内部自然会永久保持关闭。

本文要求在 `onDismiss` 中同步 React state：

```tsx
onDismiss={() => setIsPresented(false)}
```

否则外部的 `isPresented` 仍然是 `true`，受控状态与用户操作就可能不一致。

### `showDragIndicator={false}` 只控制视觉元素

它只表示不显示拖拽短横条。文档没有说它会禁用拖动关闭，因此不能用它实现“强制用户只能点击按钮关闭”。

### 自定义高度不是完全跨平台的

`{ fraction }` 和 `{ height }` 虽然属于 `SnapPoint` 类型，但只有 iOS 和 Web 会精确采用其数值。

Android 会转换为最近的半屏或全屏状态。TypeScript 类型一致不代表运行效果一致。

### 配置 `'half'` 不保证 Android 一定显示半屏

Android 是否提供部分展开状态，还受到内容高度和 Material 阈值的影响。内容过短时，组件可能直接采用完全展开状态。

### 原生滚动不是普通 DOM 溢出

内容超过最小停靠高度时，需要显式使用 `ScrollView`。不能照搬 Web 中“内容溢出后设置一条 CSS”这样的思路。

### 固定高度可能带来跨设备差异

**基于文档内容推导：**固定的 `{ height }` 在不同尺寸的手机、平板和浏览器窗口上占据的屏幕比例会不同。如果业务关注跨设备一致的相对视觉效果，语义值或比例值通常更容易表达意图。

同时要记住，Android 不会精确采用比例值或固定高度。

## 实际开发中的使用方式

### 优先使用语义停靠点

需要 Android、iOS 和 Web 表现尽量一致时，优先选择：

```tsx
snapPoints={['half', 'full']}
```

这是文档明确推荐用于跨平台一致性的形式。

### 长内容始终考虑滚动

只要内容可能超过最小高度，就应使用：

```tsx
<ScrollView>
  {/* 内容 */}
</ScrollView>
```

尤其是以下内容：

- 表单；
- 筛选条件；
- 动态加载的列表；
- 会受本地化文字长度影响的内容；
- 字体放大后可能变高的内容。

前两项使用方式直接来自文档；后三项属于**基于经验建议**。

### 把显示状态放在业务组件中

推荐保持单一状态来源：

```tsx
const openSheet = () => setIsPresented(true);
const closeSheet = () => setIsPresented(false);
```

然后让按钮和 `onDismiss` 复用同一个关闭逻辑：

```tsx
<BottomSheet
  isPresented={isPresented}
  onDismiss={closeSheet}>
  <Button label="Close" onPress={closeSheet} />
</BottomSheet>
```

这是**基于经验建议**，可以减少多个关闭入口产生状态差异的可能性。

### 在真实 Android 设备上验证停靠行为

**基于文档内容推导：**由于 Android 存在底层组件限制和内容高度阈值，仅在 Web 或 iOS 上验证不足以确认 Android 的实际停靠行为。

尤其需要验证：

- 短内容是否出现半屏状态；
- 自定义高度被映射到哪个状态；
- 内容滚动和面板拖动是否符合预期。

### 不要把 `modifiers` 作为常规跨平台样式系统

`modifiers` 是平台特有的逃生通道。使用 SwiftUI 或 Jetpack Compose modifier 后，代码可能产生明确的平台依赖。

**基于经验建议：**只有在通用属性无法满足需求时再使用它，并分别验证 iOS 和 Android 行为。

## 文档未涉及的内容

当前文档没有说明：

- 无障碍属性及焦点管理；
- 键盘弹出时面板如何调整；
- 如何禁用向下滑动关闭；
- 如何禁用点击遮罩关闭；
- 如何监听当前停靠点变化；
- 如何设置初始停靠点；
- 动画时长和动画曲线配置；
- 遮罩颜色或透明度配置；
- 安全区域与刘海屏适配细节；
- 多个 `BottomSheet` 嵌套或同时显示的行为；
- 服务端渲染行为；
- 端到端测试框架及测试示例；
- `modifiers` 的具体配置清单；
- Android 部分展开阈值的具体数值。

这些能力不能仅凭本文确认是否存在，需要查阅 `@expo/ui` 的其他文档或对应版本的源代码。

## 明确信息与推导结论

### 文档明确说明

- `BottomSheet` 是从屏幕底部滑出的模态面板；
- 支持 Android、iOS 和 Web，并包含在 Expo Go 中；
- 使用 `isPresented` 控制显示状态；
- 用户关闭后会触发 `onDismiss`；
- 用户可以通过下滑或点击遮罩关闭面板；
- 拖拽指示器默认显示；
- 可以使用 `snapPoints` 配置停靠高度；
- 省略 `snapPoints` 时根据内容自动确定尺寸；
- `'half'` 和 `'full'` 用于获得跨平台语义上的一致性；
- `{ fraction }` 和 `{ height }` 仅在 iOS、Web 上精确生效；
- Android 会把自定义比例或高度映射到最近的半屏或全屏状态；
- Android 的部分展开状态受到内容高度阈值影响；
- 内容可能超过最小停靠点时应使用 `ScrollView`；
- `testID` 用于端到端测试定位；
- 已有 React Native 工程需要先安装并接入 `expo`。

### 基于文档内容推导

- TypeScript 接受某种停靠点写法，不代表三个平台具有完全相同的运行结果；
- 精确高度属于平台相关需求，不能直接当作跨平台保证；
- Android 必须作为停靠高度功能的独立验收平台；
- 固定高度在不同屏幕尺寸上的相对视觉效果可能不同；
- `isPresented` 应当作为显示状态的单一数据来源。

## 总结

`BottomSheet` 的基础使用方式很直接：通过 `isPresented` 控制显示，在 `onDismiss` 中同步关闭状态，并将内容作为子节点传入。

真正需要重点关注的是跨平台高度行为：

- 跨平台开发优先使用 `'half'` 和 `'full'`；
- iOS 和 Web 可以精确使用比例或固定高度；
- Android 只提供半屏和全屏两类稳定状态；
- Android 的半屏状态还依赖内容是否足够高；
- 内容可能溢出时必须使用 `ScrollView`。

此外，本文属于下一版本 SDK 的文档。正式使用前应根据项目实际安装的 Expo SDK 版本核对对应 API。

---

## 文档导航

- **上一页**：[universal](./135__universal.md)
- **下一页**：[button](./137__button.md)
