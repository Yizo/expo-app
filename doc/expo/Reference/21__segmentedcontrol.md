# SegmentedControl

`SegmentedControl` 是 `@expo/ui` 提供的分段选择控件，适合在多个互斥选项之间进行单选。

它的 API 兼容 `@react-native-segmented-control/segmented-control`，可用于迁移已有代码，也可以直接在新的 Expo 项目中使用。

支持的平台：

- Android
- iOS
- Web
- Expo Go

## 文档解决的问题

本文档主要说明：

1. 如何安装并使用 `@expo/ui` 中的 `SegmentedControl`。
2. 如何从 `@react-native-segmented-control/segmented-control` 迁移。
3. 该兼容组件支持哪些属性和事件。
4. Android、iOS 和 Web 之间存在哪些能力差异。
5. 什么时候应该跳过兼容组件，直接使用更底层的平台组件。

它适合以下场景：

- 在多个互斥选项中选择一个，例如列表/网格视图、日/周/月周期。
- 将已有的第三方 `SegmentedControl` 迁移到 Expo UI。
- 希望尽量使用统一 API，同时保留原生平台外观。
- 需要在 Android、iOS 和 Web 中共享基本的分段选择逻辑。

## 阅读前需要理解的概念

### 分段选择控件

分段选择控件通常由一排相邻按钮组成，但同一时间只能选中一个选项。

它更接近 Web 中的单选按钮组，而不是多个相互独立的普通按钮：

```text
[ 日 ] [ 周 ] [ 月 ]
```

与 HTML `<select>` 相比，它会直接展示全部选项，适合选项数量较少、用户需要频繁切换的场景。

### `@expo/ui`

`@expo/ui` 是 Expo 提供的 UI 组件包。本文使用的是其中的社区兼容组件：

```tsx
import SegmentedControl from '@expo/ui/community/segmented-control';
```

需要注意，它不是从 `@expo/ui` 包根路径直接导入。

### 原生组件封装

该组件在不同平台上并不是完全相同的一套 UI 实现：

- Android：使用 Jetpack Compose 的 `SingleChoiceSegmentedButtonRow`。
- iOS：使用 SwiftUI `Picker`，并设置为 segmented 样式。
- Web：提供对应的 Web 支持。

Jetpack Compose 和 SwiftUI 分别是 Android 与 iOS 的原生声明式 UI 框架，可以类比为平台自己的组件渲染体系。虽然开发者使用的是统一 React API，底层实际渲染的是平台相关组件。

这意味着不同平台可能存在外观和属性能力差异，不能假设它们会像普通 CSS 组件一样完全一致。

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

`expo install` 与直接执行 `npm install` 的目的相似，但它会按照当前 Expo SDK 选择合适的依赖版本。对于 Expo 项目，应优先使用文档给出的安装方式。

### 现有 React Native 项目

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，文档要求先安装并配置 `expo`，才能使用 Expo Modules 和 `@expo/ui`。

本文档只指出了这一前置条件，没有展开说明如何修改 iOS 或 Android 原生工程。

## 基本用法

```tsx
import { useState } from 'react';
import SegmentedControl from '@expo/ui/community/segmented-control';

export default function SegmentedControlExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <SegmentedControl
      values={['One', 'Two', 'Three']}
      selectedIndex={selectedIndex}
      onChange={event => {
        setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
      }}
    />
  );
}
```

这里采用了 React Web 开发者熟悉的受控组件模式：

1. `values` 定义所有选项及其顺序。
2. `selectedIndex` 指定当前选中的选项。
3. 用户点击选项后触发 `onChange`。
4. 回调从原生事件中取得新索引。
5. 更新 state 后，新的 `selectedIndex` 再传回组件。

`selectedIndex` 是从 `0` 开始的数组索引：

| `selectedIndex` | 对应值 |
| ---: | --- |
| `0` | `One` |
| `1` | `Two` |
| `2` | `Three` |

与 React Web 的不同之处主要在事件结构。这里不能通过 `event.target.value` 读取值，而要使用：

```tsx
event.nativeEvent.selectedSegmentIndex
event.nativeEvent.value
```

## 属性说明

### `values`

```ts
values?: string[]
```

按照显示顺序提供各分段的文本标签：

```tsx
values={['日', '周', '月']}
```

文档明确说明这里只支持字符串数组，不支持图片值。

### `selectedIndex`

```ts
selectedIndex?: number
```

指定当前选中项的索引：

```tsx
selectedIndex={1}
```

以上代码表示选中 `values` 中的第二项。

文档没有说明索引越界时的行为。因此，应用代码应确保索引与 `values` 保持一致。

### `onChange`

```ts
onChange?: (
  event: NativeSegmentedControlChangeEvent
) => void
```

用户点击一个分段时触发。事件结构如下：

```ts
{
  nativeEvent: {
    selectedSegmentIndex: number;
    value: string;
  };
}
```

使用示例：

```tsx
onChange={event => {
  const { selectedSegmentIndex, value } = event.nativeEvent;

  setSelectedIndex(selectedSegmentIndex);
  console.log(value);
}}
```

`nativeEvent` 是 React Native 对底层平台事件的封装，可以将它理解为原生组件提供的事件数据。

### `onValueChange`

```ts
onValueChange?: (value: string) => void
```

同样在用户点击分段时触发，但直接返回选中的字符串值：

```tsx
onValueChange={value => {
  console.log(value);
}}
```

如果只关心业务值，`onValueChange` 比解析 `nativeEvent` 更直接；如果还需要选中项索引，则使用 `onChange`。

### `enabled`

```ts
enabled?: boolean
```

默认值为 `true`。设置为 `false` 后，用户不能操作控件：

```tsx
<SegmentedControl
  enabled={false}
  values={['One', 'Two']}
/>
```

它可以类比 Web 表单控件的 `disabled` 状态，但这里的属性名称是 `enabled`，逻辑方向相反。

### `appearance`

```ts
appearance?: 'dark' | 'light'
```

强制控件使用深色或浅色外观，而不跟随系统主题：

```tsx
appearance="dark"
```

允许值只有：

- `'dark'`
- `'light'`

文档没有说明该属性对应用其他区域、主题上下文或系统状态栏的影响。

### `tintColor`

```ts
tintColor?: string
```

用于设置控件的强调色。

迁移说明明确指出：

- Android：设置当前选中分段的容器颜色。
- iOS：不生效。

API 属性表将其标记为 Android 和 Web 支持，并称其为控件强调色。因此，Web 被列为支持平台，但迁移说明只明确解释了 Android 行为。

这是原文档中需要特别注意的平台说明差异。开发时不应依赖 `tintColor` 在 iOS 生效，并应分别验证 Android 和 Web 的实际视觉效果。

### `style`

```ts
style?: StyleProp<ViewStyle>
```

用于传入 React Native 的视图样式：

```tsx
<SegmentedControl
  style={{ marginHorizontal: 16 }}
  values={['One', 'Two']}
/>
```

它不是浏览器中的 CSS 属性对象，而是 React Native 的 `ViewStyle`。例如，不能默认所有 CSS 属性、选择器和伪类都可用。

文档没有列出该组件具体支持哪些内部视觉样式，也没有保证 `style` 可以修改每个分段的文本或选中状态。

### `testID`

```ts
testID?: string
```

为组件提供测试标识：

```tsx
<SegmentedControl
  testID="display-mode-control"
  values={['List', 'Grid']}
/>
```

文档没有进一步说明具体测试框架中的查询方式。

## 从第三方组件迁移

原来的导入方式：

```tsx
import SegmentedControl from
  '@react-native-segmented-control/segmented-control';
```

迁移后改为：

```tsx
import SegmentedControl from
  '@expo/ui/community/segmented-control';
```

虽然新组件强调 API 兼容，但并非所有旧功能都得到支持。

### 不支持图片值

旧组件的 `values` 可能包含图片，但 Expo UI 兼容组件只接受字符串：

```tsx
values={['One', 'Two']}
```

不能将迁移理解为只修改 import。如果旧代码使用了图片分段，需要重新设计该部分 UI，或者使用更底层的组件实现。

### 不支持的属性

以下旧组件属性不受支持：

- `momentary`
- `backgroundColor`
- `fontStyle`
- `activeFontStyle`

迁移前应搜索项目中是否使用了这些属性。直接保留它们不能保证产生原来的行为或样式。

本文档只说明这些属性不受支持，没有提供一一对应的替代方案。

### `tintColor` 存在平台差异

`tintColor` 在 Android 上设置选中分段的容器颜色，在 iOS 上不生效。迁移后不能假设原来的跨平台颜色设置仍会保持一致。

## 何时使用底层平台组件

`SegmentedControl` 的主要价值是提供与现有第三方组件兼容的统一 API。

如果需要以下能力，文档建议直接使用 `@expo/ui` 的底层平台组件：

- 自定义 modifier。
- 更细致的平台样式。
- 自定义布局。
- 使用平台组件特有能力。

对应关系为：

- Android：Jetpack Compose `SegmentedButton`。
- iOS：SwiftUI `Picker` 配合 `pickerStyle('segmented')`。

**基于文档内容推导：** 直接使用底层组件意味着 Android 和 iOS 的实现可能需要分别处理，代码共享程度会降低，但可以获得比兼容层更细粒度的控制。

## 事件类型

### `NativeSegmentedControlChangeEvent`

它描述 `onChange` 接收的原生事件：

```ts
type NativeSegmentedControlChangeEvent = {
  nativeEvent: {
    selectedSegmentIndex: number;
    value: string;
  };
};
```

该结构与 `@react-native-segmented-control/segmented-control` 匹配，有助于降低迁移时事件处理代码的修改量。

### `NativeSegmentedControlIOSChangeEvent`

该类型等同于：

```ts
NativeSegmentedControlChangeEvent
```

文档将其列为 Android、iOS 和 Web 均支持，尽管名称中包含 `IOS`。

原文还出现了“Deprecated: use NativeSegmentedControlChangeEvent”的提示，但其位置紧邻同名类型说明，存在表述或页面生成上的歧义。能够明确确认的是：新代码应使用 `NativeSegmentedControlChangeEvent`，不要继续依赖带 `IOS` 的旧类型名。

## 限制与容易踩坑的地方

### API 兼容不等于功能完全一致

兼容主要体现在组件接口和事件结构上。图片值、部分样式属性和 `momentary` 均不受支持。

迁移时必须进行属性级检查，不能只修改包名。

### 平台外观不保证完全一致

Android 和 iOS 使用不同原生 UI 框架实现。即使传入相同属性，视觉细节也可能遵循各自平台的设计系统。

**基于文档内容推导：** 测试时应分别检查 Android、iOS 和 Web，而不能只以某一个平台的截图作为验收标准。

### 样式能力有限

`style` 的类型是 `ViewStyle`，而旧组件用于控制背景和文字的多个属性不受支持。

需要精细控制内部文本、激活状态或布局时，应评估底层 Android/iOS 组件，而不是假设能用 Web CSS 思路覆盖原生样式。

### 事件不是 DOM 事件

错误的 Web 写法：

```tsx
onChange={event => {
  console.log(event.target.value);
}}
```

本文档对应的写法：

```tsx
onChange={event => {
  console.log(event.nativeEvent.value);
}}
```

或者直接使用：

```tsx
onValueChange={value => {
  console.log(value);
}}
```

### 文档未涉及的内容

当前文档未说明：

- 无障碍属性和屏幕阅读器行为。
- 键盘操作规则。
- 动画和过渡效果。
- `values` 为空时的行为。
- `selectedIndex` 越界时的行为。
- 文本过长时如何截断或换行。
- 分段数量上限。
- 从右到左语言的布局表现。
- 服务端渲染行为。
- 具体测试框架和测试方法。
- iOS、Android 原生工程的详细安装步骤。

这些问题不能仅根据当前文档得出结论，需要查阅对应组件或平台文档并进行实际验证。

## 实际开发建议

以下属于**基于经验建议**，不是当前文档明确规定的要求：

1. 将业务状态保存为稳定值，而不是长期只保存数组索引。选项顺序变化时，索引可能指向不同业务含义。
2. 如果组件需要 `selectedIndex`，可以根据业务值计算索引，并处理未找到时的情况。
3. 迁移前搜索所有旧属性，重点检查图片值以及不受支持的四个属性。
4. 在 Android、iOS 和 Web 上分别验证禁用状态、主题外观、选中状态和事件返回值。
5. 不要把 `tintColor` 作为保证 iOS 品牌色一致性的方案。
6. 当设计要求深度定制各分段内部结构时，应尽早评估底层组件，避免在兼容组件上反复尝试不受支持的样式。

## 总结

`@expo/ui/community/segmented-control` 提供了一个支持 Android、iOS 和 Web 的分段单选组件，并兼容 `@react-native-segmented-control/segmented-control` 的核心 API。

最重要的使用要点是：

- 使用 `values` 提供字符串选项。
- 使用 `selectedIndex` 管理选中状态。
- 通过 `onChange` 的 `nativeEvent` 或 `onValueChange` 获取结果。
- 迁移时检查不受支持的图片值和旧属性。
- 不要依赖 `tintColor` 在 iOS 生效。
- 精细的平台样式与布局需求应使用底层 Android 或 iOS 组件。

其中，属性、事件结构、底层实现、迁移限制和平台支持情况均为文档明确说明；关于跨平台测试、业务状态设计以及迁移检查方式的建议，已经分别标记为文档推导或经验建议。

---

## 文档导航

- **上一页**：[picker](./20__picker.md)
- **下一页**：[slider](./22__slider.md)
