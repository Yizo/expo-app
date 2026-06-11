# ModalBottomSheet：Android 原生底部模态面板

> 文档修改日期：2026 年 6 月 10 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本；当前最新稳定版本为 SDK 56。

## 文档解决的问题

`ModalBottomSheet` 用于在 Android 应用中展示一个从屏幕底部滑出的模态面板。它适合承载操作选项、表单、列表或临时补充内容。

该组件由 Expo UI 提供，底层匹配 Android 官方 Jetpack Compose Bottom Sheet API。因此，它不是用 React Native `View` 模拟出来的浮层，而是 Android 原生 Compose 组件。

如果需要同时支持 Android 和 iOS，应优先查看 Expo UI 的跨平台 `BottomSheet`。跨平台版本会根据运行平台渲染对应的原生组件。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。可以将它粗略理解为“Android 原生开发中的 React”，但两者的组件、布局和运行环境并不相同。

本文中的：

```tsx
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
```

这些组件最终对应的是 Android Compose UI，而不是 React DOM，也不是常规 React Native 视图。

### Host

`Host` 是承载 Compose 组件的容器，用来连接 React Native 与 Android Compose UI。

示例使用：

```tsx
<Host matchContents>
  {/* Compose 组件 */}
</Host>
```

`matchContents` 表示让 `Host` 的尺寸匹配其内容。本文没有进一步说明 `Host` 的完整布局规则。

### Modal 和 scrim

底部面板属于模态界面：出现后，它会覆盖当前界面的一部分，并暂时成为用户的主要交互区域。

`scrim` 是面板背后覆盖在原页面上的半透明遮罩。它通常用于：

- 弱化背景内容；
- 表示背景暂时不可直接操作；
- 接收“点击外部关闭面板”的操作。

### 部分展开与完全展开

底部面板可以有不同状态：

- 隐藏；
- 部分展开，文档描述为约 50% 高度；
- 完全展开。

`skipPartiallyExpanded` 决定打开面板时是否跳过部分展开状态。

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

`expo install` 与普通的 `npm install` 类似，但会帮助 Expo 项目选择与当前 SDK 兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用，而不是标准 Expo 项目，必须先安装并配置 `expo`，使项目能够加载 Expo Modules。当前文档没有展开原生工程的具体配置步骤。

## 基本使用流程

### 1. 使用状态控制是否挂载

```tsx
const [visible, setVisible] = useState(false);
```

```tsx
{visible && (
  <ModalBottomSheet onDismissRequest={() => setVisible(false)}>
    {/* 面板内容 */}
  </ModalBottomSheet>
)}
```

这里的 `visible` 不是传给组件的可见性属性，而是直接决定组件是否存在于 React 组件树中。

这与 React Web 中条件渲染 Modal 类似：

- `true`：挂载并显示；
- `false`：卸载。

### 2. 通过 ref 执行带动画的关闭

```tsx
const sheetRef = useRef<ModalBottomSheetRef>(null);

const hideSheet = async () => {
  await sheetRef.current?.hide();
  setVisible(false);
};
```

```tsx
<ModalBottomSheet ref={sheetRef}>
  {/* 内容 */}
</ModalBottomSheet>
```

关闭顺序很重要：

1. 调用 `hide()`；
2. 等待关闭动画完成；
3. 再将 `visible` 设置为 `false`，卸载组件。

如果直接执行 `setVisible(false)`，组件可能在关闭动画开始前就被移除。

### 3. 处理用户触发的关闭

```tsx
onDismissRequest={() => setVisible(false)}
```

用户通过以下方式请求关闭时，会调用该回调：

- 向下滑动面板；
- 按 Android 返回键；
- 点击面板外部的遮罩。

`onDismissRequest` 是通知应用更新 React 状态的回调，不应将它误解成普通的关闭按钮事件。

## 展开状态控制

### 跳过部分展开状态

```tsx
<ModalBottomSheet skipPartiallyExpanded>
  {/* 内容 */}
</ModalBottomSheet>
```

默认值为 `false`。启用后，面板打开时会直接进入完全展开状态，不会先停留在半高位置。

文档的属性说明使用了“full screen”，示例说明使用了“fully expanded”。当前文档没有进一步定义完全展开是否在所有情况下都严格等于占满整个屏幕。

### 通过 ref 切换状态

`ModalBottomSheetRef` 提供三个异步方法：

| 方法 | 作用 | 限制 |
| --- | --- | --- |
| `expand()` | 通过动画完全展开面板 | 文档未说明调用时的其他前置条件 |
| `hide()` | 通过动画隐藏面板 | Promise 在关闭动画完成后 resolve |
| `partialExpand()` | 通过动画切换到约 50% 高度 | 仅在 `skipPartiallyExpanded={false}` 时有效 |

例如：

```tsx
await sheetRef.current?.expand();
await sheetRef.current?.partialExpand();
await sheetRef.current?.hide();
```

## 外观配置

### 颜色

```tsx
<ModalBottomSheet
  containerColor="#1a1a2e"
  contentColor="#e0e0e0"
  scrimColor="#806200EE"
>
  {/* 内容 */}
</ModalBottomSheet>
```

| 属性 | 含义 |
| --- | --- |
| `containerColor` | 面板容器的背景色 |
| `contentColor` | 面板内部内容的首选颜色 |
| `scrimColor` | 面板后方遮罩的颜色 |

颜色类型为 React Native 的 `ColorValue`。

`contentColor` 是 Compose 内容使用的首选颜色，不应简单理解为 Web CSS 中自动继承到所有后代元素的 `color`。具体哪些子组件使用该颜色，当前文档未展开说明。

### 默认拖动手柄

面板顶部默认显示拖动手柄：

```tsx
showDragHandle={true}
```

隐藏默认手柄：

```tsx
<ModalBottomSheet showDragHandle={false}>
  {/* 内容 */}
</ModalBottomSheet>
```

### 自定义拖动手柄

使用专用插槽：

```tsx
<ModalBottomSheet>
  <ModalBottomSheet.DragHandle>
    {/* 自定义 Compose UI */}
  </ModalBottomSheet.DragHandle>

  {/* 面板正文 */}
</ModalBottomSheet>
```

如果提供了自定义 `ModalBottomSheet.DragHandle`，`showDragHandle` 会被忽略。

“插槽”可以类比为一种具有明确语义的 React `children` 区域：组件会识别该子节点，并将其放在拖动手柄对应的位置。

## Compose 与 React Native 内容混合

### 为什么需要 RNHostView

Compose 组件和 React Native 组件属于不同的原生 UI 体系，不能假定它们可以任意直接嵌套。

以下内容来自 Compose：

```tsx
import { Column, Text, Button } from '@expo/ui/jetpack-compose';
```

以下内容来自 React Native：

```tsx
import { Pressable, Text, View } from 'react-native';
```

要在 Compose 底部面板中放入 React Native 内容，需要使用 `RNHostView` 作为桥接容器：

```tsx
<RNHostView>
  <View>
    <RNText>React Native Content</RNText>
    <Pressable onPress={hideSheet}>
      <RNText>Close</RNText>
    </Pressable>
  </View>
</RNHostView>
```

这使得 `Pressable` 等 React Native 组件能够在 Compose 面板中保持交互能力。

### 让 React Native 内容填充剩余空间

文档要求：

1. `RNHostView` 不使用 `matchContents`；
2. 父级 `Column` 设置固定高度；
3. React Native 子视图使用 `flex: 1`。

```tsx
<Column modifiers={[height(400), padding(16, 16, 16, 16)]}>
  <Text>RN View with flex: 1</Text>

  <RNHostView>
    <View style={{ flex: 1 }}>
      {/* React Native 内容 */}
    </View>
  </RNHostView>
</Column>
```

Compose 父容器需要先提供一个可计算的高度，React Native 的 `flex: 1` 才有明确的剩余空间可以填充。

这不同于 Web 中只要设置 `flex: 1` 就通常能参与同一套 CSS Flexbox 布局。这里跨越了 Compose 和 React Native 两套布局系统。

## 在面板中使用可滚动列表

React Native 的 `FlatList`、`ScrollView`、FlashList 或 Legend List 可以通过 `RNHostView` 放入面板。

关键配置是：

```tsx
<FlatList
  nestedScrollEnabled
  style={{ flex: 1 }}
  data={DATA}
  renderItem={...}
/>
```

`nestedScrollEnabled` 用于协调列表滚动手势与底部面板拖动手势：

1. 列表优先滚动自己的内容；
2. 列表到达顶部后，剩余的拖动继续作用于底部面板。

如果不启用该属性，列表会消费拖动手势，导致面板保持不动。

这是本文最重要的手势处理限制。React Web 开发者不能用 DOM 事件冒泡或 CSS `overflow` 的思路直接理解它，因为这里涉及两个原生滚动和手势系统之间的协作。

## 创建只能通过代码关闭的面板

需要同时禁用三种用户关闭方式：

```tsx
<ModalBottomSheet
  ref={sheetRef}
  sheetGesturesEnabled={false}
  properties={{
    shouldDismissOnBackPress: false,
    shouldDismissOnClickOutside: false,
  }}
>
  {/* 内容 */}
</ModalBottomSheet>
```

| 配置 | 禁用的行为 |
| --- | --- |
| `sheetGesturesEnabled={false}` | 滑动关闭 |
| `shouldDismissOnBackPress: false` | Android 返回键关闭 |
| `shouldDismissOnClickOutside: false` | 点击遮罩关闭 |

然后提供显式按钮，通过 ref 关闭：

```tsx
const hideSheet = async () => {
  await sheetRef.current?.hide();
  setVisible(false);
};
```

只设置其中一个属性并不能实现完全不可由用户关闭。例如，禁用滑动后，返回键和点击遮罩仍可能关闭面板。

## API 汇总

导入方式：

```tsx
import { ModalBottomSheet } from '@expo/ui/jetpack-compose';
```

所有以下 API 均仅支持 Android。

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | 必填 | 面板内容，可包含自定义拖动手柄插槽 |
| `containerColor` | `ColorValue` | 未说明 | 面板背景色 |
| `contentColor` | `ColorValue` | 未说明 | 内部内容的首选颜色 |
| `modifiers` | `ModifierConfig[]` | 未说明 | 为组件应用 Compose Modifier |
| `onDismissRequest` | `() => void` | 必填 | 用户请求关闭面板时调用 |
| `properties` | `ModalBottomSheetProperties` | 未说明 | 配置模态窗口关闭行为 |
| `ref` | `Ref<ModalBottomSheetRef>` | 未说明 | 命令式控制面板状态 |
| `scrimColor` | `ColorValue` | 未说明 | 背景遮罩颜色 |
| `sheetGesturesEnabled` | `boolean` | `true` | 是否启用滑动关闭 |
| `showDragHandle` | `boolean` | `true` | 是否显示默认拖动手柄 |
| `skipPartiallyExpanded` | `boolean` | `false` | 是否跳过部分展开状态 |

`properties` 的结构如下：

```ts
type ModalBottomSheetProperties = {
  shouldDismissOnBackPress?: boolean; // 默认 true
  shouldDismissOnClickOutside?: boolean; // 默认 true
};
```

本文示例还使用了来自以下入口的 Compose Modifier：

```tsx
import {
  padding,
  paddingAll,
  height,
  width,
  fillMaxWidth,
  fillMaxHeight,
  background,
  clip,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';
```

它们用于设置 Compose 组件的尺寸、间距、背景和裁剪效果。本文没有完整介绍这些 Modifier 的参数规则和组合顺序。

## React Web 开发者容易误解的地方

### 它仅支持 Android

当前 `ModalBottomSheet` 是 Jetpack Compose 版本，API 明确标记为 Android。不能因为代码使用 TSX 和 React Hooks，就认为它可以直接运行于 Web 或 iOS。

跨平台需求应考虑 Expo UI 的 universal `BottomSheet`。

### 显示状态由挂载关系控制

示例没有使用类似 Web 组件库常见的：

```tsx
<Modal open={visible} />
```

而是通过条件渲染挂载和卸载组件。为了保留关闭动画，程序化关闭时需要先 `await hide()`，再卸载。

### Compose Modifier 不是 CSS

```tsx
modifiers={[paddingAll(24), height(600)]}
```

这里的 `modifiers` 属于 Jetpack Compose 布局和绘制系统，不是 React Native `style`，也不是 Web CSS。

React Native 内容仍然使用：

```tsx
<View style={{ flex: 1 }} />
```

两种样式系统不能混为一谈。

### `onClick` 与 `onPress` 来自不同组件体系

Compose Button：

```tsx
<Button onClick={hideSheet}>
```

React Native Pressable：

```tsx
<Pressable onPress={hideSheet}>
```

事件属性不同，是因为它们分别属于 Compose 和 React Native 组件。

### Android 返回键是独立关闭入口

Web Modal 通常没有“系统返回键关闭”这一原生行为。在 Android 上，即使禁用了点击遮罩和滑动，也必须单独处理 `shouldDismissOnBackPress`。

## 注意事项与限制

1. 本页面是下一个 Expo SDK 版本的文档，不是当前稳定 SDK 56 的对应页面。实际项目应核对所用 Expo SDK 是否已经包含这里描述的 API。
2. 组件及其 API 仅支持 Android；文档没有给出 iOS 或 Web 支持。
3. 已有 React Native 原生项目必须先安装并配置 Expo Modules。
4. 程序化关闭时，应等待 `hide()` 的动画完成后再卸载组件。
5. `partialExpand()` 仅在 `skipPartiallyExpanded={false}` 时有效。
6. 自定义拖动手柄存在时，`showDragHandle` 会被忽略。
7. React Native 可滚动内容必须启用 `nestedScrollEnabled`，否则列表会消费手势，面板无法随剩余拖动移动。
8. 完全不可由用户关闭的面板需要同时禁用滑动、返回键和点击遮罩。
9. 当前文档没有说明无障碍属性、键盘避让、屏幕旋转、系统栏处理、尺寸单位以及动画自定义方式。

## 实际开发建议

以下内容是对文档示例的整理与推导，不是文档逐字给出的要求。

### 基于文档内容推导：统一关闭函数

建议将程序化关闭集中在一个异步函数中：

```tsx
const hideSheet = async () => {
  await sheetRef.current?.hide();
  setVisible(false);
};
```

这样可以避免不同关闭按钮分别实现状态更新，导致部分路径没有等待动画。

对于系统返回、点击遮罩和滑动关闭，继续在 `onDismissRequest` 中同步 React 状态：

```tsx
onDismissRequest={() => setVisible(false)}
```

### 基于文档内容推导：先明确内容属于哪个 UI 体系

开发前应决定每部分内容使用：

- Compose 组件；
- React Native 组件；
- Compose 外壳加 `RNHostView` 中的 React Native 内容。

如果已有大量 React Native 表单、列表或业务组件，通过 `RNHostView` 复用通常比全部改写为 Compose 更直接。但文档没有提供两种方案的性能比较。

### 基于经验建议：谨慎使用不可关闭面板

完全禁用滑动、返回键和点击外部后，必须保证程序化关闭按钮始终可见、可点击，并覆盖错误和加载失败等状态，否则用户可能被困在面板中。

这是移动端交互设计建议，不是当前文档明确提出的要求。

### 基于经验建议：在真机上验证手势冲突

包含 `FlatList`、`ScrollView` 或第三方高性能列表时，应在 Android 真机上检查：

- 列表能否正常滚动；
- 列表到顶后能否拖动面板；
- 快速滑动是否出现冲突；
- 不同内容高度下部分展开状态是否合理。

当前文档只明确要求 `nestedScrollEnabled`，没有覆盖所有设备和列表库的行为差异。

## 文档明确内容与推导内容

### 文档明确说明

- `ModalBottomSheet` 匹配 Android 官方 Jetpack Compose Bottom Sheet API。
- 组件支持 Android，并包含在 Expo Go 中。
- 可使用 ref 执行 `expand()`、`partialExpand()` 和 `hide()`。
- `hide()` 返回的 Promise 会在关闭动画完成后 resolve。
- 可以配置颜色、拖动手柄和关闭行为。
- `RNHostView` 可以在 Compose 面板中承载交互式 React Native 内容。
- React Native 滚动列表需要启用 `nestedScrollEnabled` 来协调列表和面板手势。
- 跨平台需求可使用 universal `BottomSheet`。

### 基于文档内容推导

- 条件渲染承担了 React 层的可见性状态管理。
- `hide()` 后再卸载可以避免关闭动画被组件卸载打断。
- Compose 与 React Native 是两套布局系统，跨体系填充空间时需要明确父容器尺寸。
- 完全不可由用户关闭，需要同时覆盖所有关闭入口。

## 总结

`ModalBottomSheet` 是 Expo UI 提供的 Android 原生 Compose 底部模态面板。其核心使用模式是：

1. 用 React 状态控制挂载；
2. 用 `onDismissRequest`同步用户关闭后的状态；
3. 用 ref 执行带动画的展开、部分展开和隐藏；
4. 用 Compose Modifier 设置 Compose 内容布局；
5. 用 `RNHostView` 嵌入 React Native 内容；
6. 用 `nestedScrollEnabled` 处理滚动列表与面板的手势协作；
7. 同时配置手势、返回键和遮罩行为，才能完整控制关闭方式。

当前文档未涉及 iOS、Web、无障碍、键盘处理和动画参数等内容，不能据此推断这些能力的具体行为。

---

## 文档导航

- **上一页**：[colors](./51__colors.md)
- **下一页**：[modifiers](./53__modifiers.md)
