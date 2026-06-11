# BottomSheet：兼容 `@gorhom/bottom-sheet` 的跨平台底部面板

## 文档解决的问题

`@expo/ui/community/bottom-sheet` 提供了一个与 `@gorhom/bottom-sheet` 部分 API 兼容的 `BottomSheet` 组件，用于在 Android、iOS 和 Web 中实现从屏幕底部出现的模态面板。

它主要适合：

- 在 Expo 项目中创建操作菜单、筛选面板、详情面板等模态式底部界面。
- 将现有的 `@gorhom/bottom-sheet` 用法迁移到 `@expo/ui`。
- 希望交互和动画由 Android、iOS 的原生 UI 系统负责。
- 同时支持 Android、iOS 和 Web，并接受一定的平台行为差异。

它不适合：

- 需要面板长期嵌在页面底部，并始终露出一部分内容的场景。
- 深度依赖 `@gorhom/bottom-sheet` 自定义动画、手势、背景、把手或底栏能力的项目。
- 要求三个平台拥有完全一致的视觉效果和交互细节的场景。

## 阅读前需要理解的概念

### Bottom Sheet 是什么

Bottom Sheet 是从屏幕底部出现的面板。它通常不会像新页面一样完全替换当前界面，而是覆盖在当前内容之上。

对于 React Web 开发者，可以将其近似理解为：

- 从底部滑入的 modal；
- 带多个停靠高度；
- 通常可以通过向下拖动关闭。

但它不是普通的 DOM 弹窗。Android 和 iOS 版本由各自的原生 UI 框架负责展示、动画和手势处理。

### Snap Point 是什么

`snapPoints` 定义面板可以停靠的高度，例如：

```tsx
snapPoints={['25%', '50%', '90%']}
```

这些停靠点按从低到高排列：

| 索引 | 高度 |
| --- | --- |
| `0` | `25%` |
| `1` | `50%` |
| `2` | `90%` |

因此：

```tsx
sheetRef.current?.snapToIndex(0);
```

表示将面板移动到第一个停靠点，而不是关闭面板。

`index={-1}` 才表示初始关闭。

### 命令式 Ref

文档通过 React `ref` 调用 `present()`、`dismiss()` 和 `snapToIndex()` 等方法。

这类似于 Web 中通过 ref 调用某个 UI 组件暴露的方法，但这里的实际展示行为由原生平台或 Web drawer 实现：

```tsx
const sheetRef = useRef<BottomSheet>(null);

sheetRef.current?.present();
sheetRef.current?.close();
```

### 原生模态展示

该组件在各平台使用不同的底层实现：

| 平台 | 底层实现 |
| --- | --- |
| Android | Jetpack Compose `ModalBottomSheet` |
| iOS | SwiftUI Sheet |
| Web | `vaul` drawer |

Jetpack Compose 和 SwiftUI 分别是 Android 与 iOS 的声明式原生 UI 框架，可以近似类比为原生平台中的组件化 UI 系统。

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

`expo install` 会根据当前 Expo SDK 选择兼容的依赖版本，因此在 Expo 项目中应优先使用它，而不是直接执行普通的 `npm install`。

如果是在已有的 React Native 原生项目中安装，还必须先为项目安装并配置 `expo`，使其能够使用 Expo Modules。

文档没有涉及：

- iOS CocoaPods 的手动配置步骤；
- Android Gradle 的手动配置步骤；
- 具体版本兼容矩阵。

## 基本用法

```tsx
import { useRef } from 'react';
import { Button, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetView,
} from '@expo/ui/community/bottom-sheet';

export default function BottomSheetExample() {
  const sheetRef = useRef<BottomSheet>(null);

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Open"
        onPress={() => sheetRef.current?.snapToIndex(0)}
      />

      <BottomSheet
        ref={sheetRef}
        snapPoints={['25%', '50%', '90%']}
        index={-1}
        onChange={index => {
          console.log('onChange', index);
        }}
        onClose={() => {
          console.log('closed');
        }}
        enablePanDownToClose
      >
        <BottomSheetView
          style={{
            flex: 1,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <Text>Sheet content</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
```

这个示例的流程是：

1. `index={-1}` 让面板初始保持关闭。
2. 用户点击按钮。
3. `snapToIndex(0)` 将面板打开到 `25%` 高度。
4. 用户可以继续拖动到其他停靠点。
5. `onChange` 在当前停靠点索引变化时执行。
6. `enablePanDownToClose` 允许向下拖动关闭。
7. 面板完全关闭后执行 `onClose`。

`BottomSheetView` 是内容容器，尤其在使用动态高度时应当用它包裹面板内容。

## 使用 `BottomSheetModal`

从 `@gorhom/bottom-sheet` 的 Modal API 迁移时，可以使用 `BottomSheetModal`：

```tsx
import { useRef } from 'react';
import { Button, Text, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
} from '@expo/ui/community/bottom-sheet';

export default function BottomSheetModalExample() {
  const modalRef = useRef<BottomSheetModal>(null);

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Present"
        onPress={() => modalRef.current?.present()}
      />

      <BottomSheetModal
        ref={modalRef}
        snapPoints={['50%', '90%']}
        enablePanDownToClose
      >
        <BottomSheetView style={{ padding: 24 }}>
          <Text>Modal content</Text>
          <Button
            title="Dismiss"
            onPress={() => modalRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
```

`BottomSheetModal` 默认从关闭状态开始：

- `present()`：打开到第一个停靠点。
- `dismiss()`：关闭模态面板。

普通 `BottomSheet` 默认使用 `index={0}`，会在挂载时直接打开到第一个停靠点。如果希望初始关闭，需要显式设置 `index={-1}`。

## 动态高度

不提供 `snapPoints` 时，面板默认根据内容计算高度：

```tsx
<BottomSheet
  ref={sheetRef}
  index={-1}
  enablePanDownToClose
>
  <BottomSheetView style={{ padding: 24 }}>
    <Text>This sheet sizes itself to its content.</Text>
  </BottomSheetView>
</BottomSheet>
```

相关配置为：

```tsx
enableDynamicSizing={true}
```

其默认值就是 `true`。

这适合高度较小且相对稳定的内容，例如确认操作或简短菜单。

文档明确要求动态高度场景使用 `BottomSheetView` 作为内容包装器。

> **基于文档内容推导：** 如果业务需要明确、可预测的多个展开高度，应提供 `snapPoints`；如果只希望面板包住内容，可以省略它。

## 平台行为差异

### 不是内嵌式面板

`@gorhom/bottom-sheet` 会在父视图底部以内嵌方式渲染，而 Expo 的兼容组件采用：

- Android、iOS：原生模态展示；
- Web：覆盖页面的 drawer。

因此，即使组件名称和部分 API 相同，布局语义也不同。

它更适合模态 Bottom Sheet 流程，包括代码中使用 `BottomSheet` 而不是 `BottomSheetModal` 的调用位置。

### 为什么会有差异

`@gorhom/bottom-sheet` 自己通过以下库控制手势和动画：

- `react-native-gesture-handler`
- `react-native-reanimated`

Expo 的实现则将这些行为交给 Jetpack Compose、SwiftUI 和 Web drawer。因此，它能复用原生行为，但不能完整复刻 `@gorhom/bottom-sheet` 的全部定制能力。

### 平台能力对照

| 能力 | Android | iOS | Web |
| --- | --- | --- | --- |
| 展示方式 | Compose 模态 Bottom Sheet | SwiftUI Sheet | `vaul` drawer |
| 停靠点 | 映射为部分展开和完全展开状态 | 支持提供的停靠点 | 支持提供的停靠点 |
| 不设置 `snapPoints` | 适应内容高度 | 适应内容高度 | 适应内容高度 |
| 向下拖动关闭 | 同时启用返回键和遮罩点击关闭 | 同时启用背景点击关闭 | 启用 drawer 关闭 |
| 长期内嵌并露出一部分 | 不支持 | 不支持 | 不支持 |

Android 的停靠点会映射到原生的“部分展开”和“完全展开”状态。文档没有保证 Android 可以像 iOS 或 Web 一样精确表现任意数量的自定义高度。

## 从 `@gorhom/bottom-sheet` 迁移

### 修改导入路径

迁移前：

```tsx
import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';
```

迁移后：

```tsx
import BottomSheet, {
  BottomSheetView,
} from '@expo/ui/community/bottom-sheet';
```

### `GestureHandlerRootView` 不再是必需项

此实现不要求使用 `react-native-gesture-handler` 的 `GestureHandlerRootView`。

如果应用的其他功能仍依赖手势处理库，可以继续保留它。不能仅因为 Bottom Sheet 不再需要就直接断定整个应用都可以删除。

### 迁移不是完全兼容

以下组件和 Hook 不受支持：

- `BottomSheetBackdrop`
- `BottomSheetHandle`
- `BottomSheetFooter`
- `BottomSheetDraggableView`
- `BottomSheetVirtualizedList`
- `BottomSheetFlashList`
- `useBottomSheetModal`
- `useBottomSheetSpringConfigs`
- `useBottomSheetTimingConfigs`

部分相关 Prop 类型仍可能被导出，以维持 API 或 TypeScript 兼容，但这不表示对应功能实际有效。

迁移时不能只检查代码是否能够编译，还要验证相关配置是否真的改变了运行行为。

## 支持的导出

| 导出 | 状态 | 说明 |
| --- | --- | --- |
| `BottomSheet` | 支持 | 原生端为模态面板，Web 为 drawer |
| `BottomSheetModal` | 支持 | 初始关闭，通过 `present()` 打开 |
| `BottomSheetModalProvider` | 支持 | 仅为兼容 API，直接渲染子节点 |
| `BottomSheetView` | 支持 | 面板内容容器 |
| `BottomSheetScrollView` | 支持 | React Native `ScrollView` 的再导出 |
| `BottomSheetFlatList` | 支持 | React Native `FlatList` 的再导出 |
| `BottomSheetSectionList` | 支持 | React Native `SectionList` 的再导出 |
| `BottomSheetTextInput` | 支持 | React Native `TextInput` 的再导出 |
| `useBottomSheet` | 支持 | 从上下文取得面板的命令式方法 |
| `BottomSheetBackdrop` | 不支持 | 背景遮罩由底层实现管理 |
| `BottomSheetHandle` | 不支持 | 拖动指示器由底层实现管理 |
| `BottomSheetFooter` | 不支持 | 当前实现没有等价能力 |

“再导出”表示 Expo 没有为这些列表或输入框实现专用版本，只是通过相同模块路径导出了 React Native 原组件。

## 核心 Props

### `children`

```ts
React.ReactNode
```

需要显示在 Bottom Sheet 内部的内容。

### `snapPoints`

```ts
(string | number)[]
```

定义停靠位置，并按照从低到高排列。

百分比示例：

```tsx
snapPoints={['25%', '50%', '90%']}
```

也可以使用数字位置，但文档没有进一步说明数字单位的计算细节。

### `index`

```ts
number
```

默认值为 `0`，表示组件挂载后显示在第一个停靠点。

```tsx
index={-1}
```

表示初始关闭。

### `enableDynamicSizing`

```ts
boolean
```

默认值为 `true`，控制面板是否自动适应内容高度。

### `enablePanDownToClose`

```ts
boolean
```

默认值为 `false`。启用后允许向下拖动关闭。

它在不同平台还会启用相关关闭入口：

- Android：系统返回键和遮罩点击。
- iOS：背景点击。
- Web：drawer 的关闭行为。

### `onChange`

```ts
(index: number) => void
```

当前停靠点索引改变时调用。

### `onClose`

```ts
() => void
```

面板完全关闭时调用。

### `onDismiss`

```ts
() => void
```

为兼容 `BottomSheetModal` API 提供的 `onClose` 别名。

## 命令式方法

`BottomSheet` 和 `BottomSheetModal` 的 ref 会暴露以下方法：

| 方法 | 作用 |
| --- | --- |
| `present()` | 打开面板并移动到第一个停靠点 |
| `dismiss()` | 关闭模态面板 |
| `close()` | 关闭面板 |
| `forceClose()` | 强制关闭面板 |
| `collapse()` | 移动到最低停靠点 |
| `expand()` | 移动到最高停靠点 |
| `snapToIndex(index)` | 按索引移动到指定停靠点 |
| `snapToPosition(position)` | 移动到指定像素值或百分比位置 |

也可以在面板内部使用：

```tsx
const methods = useBottomSheet();
```

它返回距离当前组件最近的 `BottomSheet` 的命令式方法。

## 兼容但不生效的配置

下列 Props 可以被传入，以降低迁移时的类型和接口改动，但不会改变实际行为：

- 动画配置；
- over-drag 配置；
- 内容区域拖动配置；
- handle 拖动配置；
- 键盘行为配置；
- 自定义 backdrop；
- 自定义 background；
- 自定义 footer；
- animated value；
- detached 模式。

这是迁移中最需要注意的限制之一：“接受某个 Prop”不等于“实现某项功能”。

### 把手配置

```tsx
handleComponent={null}
```

可以隐藏原生端或 Web 的拖动指示器。

如果传入自定义 handle 组件，原生平台不会渲染它。

### 背景样式

`backgroundStyle` 的支持程度因平台而异：

- Web：完整应用。
- Android：只使用其中的 `backgroundColor` 设置原生容器颜色。
- iOS：继续使用系统 Sheet 背景。

因此，不能依靠同一个 `backgroundStyle` 实现三个平台完全一致的背景效果。

## React Web 开发者容易误解的地方

### API 兼容不等于实现完全相同

这个组件主要提供迁移友好的调用形式，不会完整复制 `@gorhom/bottom-sheet` 的渲染、动画和扩展能力。

迁移后即使没有 TypeScript 错误，部分 Props 也可能只是被接受而没有实际效果。

### `BottomSheet` 也采用模态行为

在 Web 开发中，组件写在某个父容器内部，通常会让人认为它受该容器布局约束。但这个组件在 Android 和 iOS 上使用原生模态展示，不是普通的父容器底部子元素。

### React Native 样式不是 CSS

示例中的：

```tsx
style={{ flex: 1, padding: 24, alignItems: 'center' }}
```

是 React Native 样式对象，不是 CSS：

- 没有 `px` 字符串；
- 数字单位由 React Native 解释；
- 不能默认使用全部 CSS 属性；
- 原生模态的系统外观不一定受内容样式控制。

### 关闭状态不是索引 `0`

索引 `0` 表示最低的有效停靠点。关闭状态使用 `-1`，或者调用 `close()`、`dismiss()`。

### `BottomSheetModalProvider` 不提供额外管理能力

该 Provider 只是为了兼容现有 API，内部会直接渲染 `children`。不能假设它具有 `@gorhom/bottom-sheet` Provider 的完整协调能力。

## 实际开发建议

以下内容属于**基于文档内容推导**或**基于经验建议**，不是原文直接给出的强制要求。

1. **基于文档内容推导：** 新功能应优先将该组件用于真正的模态流程，不要设计为页面布局中长期可见的抽屉。
2. **基于经验建议：** 从 `@gorhom/bottom-sheet` 迁移前，搜索所有相关组件、Hook 和高级 Props，建立不支持功能清单。
3. **基于经验建议：** 分别在 Android、iOS 和 Web 真机或对应运行环境中测试，不能只根据 Web 表现判断原生行为。
4. **基于文档内容推导：** 需要高度定制的原生样式、modifier 或布局行为时，应直接使用 `@expo/ui` 的 Jetpack Compose 或 SwiftUI 底层组件。
5. **基于经验建议：** 对自定义动画、键盘交互和背景外观有硬性产品要求时，应先制作小型验证示例，再决定是否迁移。
6. **基于经验建议：** 如果只需要一个由内容撑开的简单操作面板，可以省略 `snapPoints`，但应测试动态内容变化以及长内容的滚动行为。

## 文档明确内容与推导内容

### 文档明确说明

- 支持 Android、iOS、Web，并包含在 Expo Go 中。
- API 与 `@gorhom/bottom-sheet` 部分兼容。
- 三个平台使用不同的底层展示实现。
- 原生端采用模态展示，不支持长期内嵌的 peek 状态。
- 不提供 `snapPoints` 时默认适应内容高度。
- 多个高级组件、Hook 和 Props 不受支持或不会生效。
- `BottomSheet` 默认 `index={0}`。
- `BottomSheetModal` 初始关闭，通过 `present()` 打开。
- `GestureHandlerRootView` 不是此实现的必需项。

### 基于文档内容推导

- 迁移工作不能只替换 import，还必须进行行为回归测试。
- 该组件更重视原生平台行为，而不是三个平台完全一致。
- 需要高度自定义交互时，兼容层可能无法满足需求。
- 对只需要标准模态 Bottom Sheet 的 Expo 项目，该组件可以减少手势和动画层的额外依赖。

## 当前文档未涉及

- 无障碍属性和屏幕阅读器行为。
- 键盘弹出时各平台的具体布局表现。
- 数字类型 `snapPoints` 的精确单位及计算规则。
- 多个 Bottom Sheet 同时展示时的管理方式。
- 设备安全区域和刘海区域的处理细节。
- 服务端渲染行为。
- 性能指标及与 `@gorhom/bottom-sheet` 的性能对比。
- Android、iOS 和 Web 的最低系统版本。
- 测试 Bottom Sheet 的推荐方案。
- 从复杂 `@gorhom/bottom-sheet` 项目迁移的完整替代方案。

## 总结

`@expo/ui/community/bottom-sheet` 是一个面向模态底部面板的跨平台兼容层。它保留了 `@gorhom/bottom-sheet` 的部分组件、Props 和命令式方法，但将实际展示交给 Android、iOS 和 Web 各自的底层组件。

使用时应重点记住：

- `index={-1}` 表示初始关闭；
- 不设置 `snapPoints` 时默认适应内容高度；
- `BottomSheetModal` 使用 `present()` 和 `dismiss()` 控制；
- 原生端不是内嵌式面板；
- API 被接受不代表功能一定生效；
- 自定义动画、背景、把手、底栏等高级能力受到明显限制；
- 迁移后必须进行跨平台行为测试。

---

## 文档导航

- **上一页**：[drop in replacements](./14__drop-in-replacements.md)
- **下一页**：[datetimepicker](./16__datetimepicker.md)
