# Expo UI SwiftUI `Image` 学习文档

> 原文档更新时间：2026 年 5 月 26 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含  
> 文档状态：面向下一版本 SDK 的未版本化文档；原文指出当前最新稳定版本为 SDK 56。

## 文档解决的问题

本文介绍如何在 Expo 应用中使用 `@expo/ui/swift-ui` 提供的 `Image` 组件，显示以下内容：

- Apple 提供的 SF Symbols 系统符号。
- 导入到 Apple Asset Catalog 中的自定义 SF Symbol。
- 本地图片文件。
- 带尺寸、颜色、变量值和符号动画效果的 SF Symbol。

这里的 `Image` 是 SwiftUI 原生组件的 React 封装，不等同于 React Native 常规的 `Image` 组件，也不是 Web 中的 `<img>`。

## 适用场景与平台限制

该组件适合：

- 开发只面向 iOS 或 tvOS 的界面。
- 希望使用 Apple 原生 SF Symbols。
- 希望获得 SwiftUI 原生符号渲染与动画能力。
- 在 Expo Go 中验证相关功能。
- 已有 React Native 项目需要接入 Expo UI。

该组件不适合直接用于：

- Android。
- Web。
- 需要同一套图标代码跨 iOS、Android 等平台运行的场景。

对于跨平台图标需求，原文建议使用通用的 `Icon` 组件。它会根据平台渲染对应的原生组件。

> **文档明确说明：** `Image` 组件支持 iOS 和 tvOS。  
> **基于文档内容推导：** 如果业务需要 Android 或 Web 支持，应使用通用 `Icon`，或者自行编写平台分支，不能假设 `@expo/ui/swift-ui` 的 `Image` 能跨平台工作。

## 阅读前需要理解的概念

### Expo UI 与 SwiftUI

`@expo/ui` 提供对原生 UI 组件的 React 接口。本页使用的是：

```tsx
import { Image } from '@expo/ui/swift-ui';
```

其中 `swift-ui` 表示组件最终由 Apple 的 SwiftUI 渲染，而不是浏览器 DOM。

对于 React Web 开发者，可以将其理解为：

- JSX 仍然负责描述界面。
- React 仍然负责组件组合和状态更新。
- 最终渲染目标不是 `<img>` 或 `<svg>`，而是 iOS/tvOS 原生 SwiftUI 视图。

### SF Symbols

SF Symbols 是 Apple 提供的一套可配置系统符号库，例如：

- `photo`
- `heart.fill`
- `star.circle`
- `bell.fill`

它更接近 Web 项目里的系统图标库，而不是普通 JPG 或 PNG 图片。符号可以支持颜色、尺寸、变量值和系统动画，但具体能力取决于符号及操作系统版本。

### `Host`

示例都使用了 `Host`：

```tsx
<Host matchContents>
  <Image systemName="star.fill" />
</Host>
```

`Host` 用来承载 SwiftUI 组件，使其能够出现在 React Native 界面中。

示例中的 `matchContents` 表示宿主尺寸匹配内部内容。当前文档使用了该属性，但没有进一步解释其完整布局行为。

### points 与 CSS pixels

`size` 的单位是 points，而不是 CSS `px`。

points 是 Apple 原生布局使用的逻辑单位。它与 React Native 的设备无关布局单位概念相近，不应简单理解为屏幕物理像素。

### Dynamic Type

Dynamic Type 是 Apple 的系统字体缩放功能。用户可以在系统设置中调大或调小文字。

`Image` 的固定 `size` 不会随 Dynamic Type 缩放。如需让符号跟随系统文字大小，应使用带 `textStyle` 的 `font` modifier。

### Asset Catalog

Asset Catalog 是 iOS/tvOS 原生工程管理图片、颜色和符号等资源的目录系统。

React Web 项目通常通过 `public`、`assets` 或模块导入管理资源；Apple 工程则会将部分原生资源放入 Asset Catalog。自定义 SF Symbol 必须以 symbol set 的形式导入其中，之后才能通过 `assetName` 使用。

### modifier

modifier 是 SwiftUI 中为视图追加样式、行为或动画的机制。可类比为 React 中向组件传入一组增强配置，但它不是 CSS class。

例如：

```tsx
modifiers={[
  symbolEffect({
    effect: 'variableColor',
  }),
]}
```

`Image` 会继承 `CommonViewModifierProps`，完整的通用 modifier 列表不在当前文档中展开。

## 安装

根据包管理器选择一条命令：

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

`expo install` 与直接执行 `npm install` 的主要区别是：Expo 会为当前项目选择兼容的依赖版本。

如果是在已有 React Native 原生项目中使用，还必须先安装并配置 `expo`，使项目能够使用 Expo Modules。

> **文档明确说明：** 已有 React Native 应用需要先安装 `expo`。  
> 当前文档没有提供完整的原生接入步骤，而是链接到 Expo Modules 安装文档。

## 基本用法

### 显示系统 SF Symbol

```tsx
import { Host, Image } from '@expo/ui/swift-ui';

export default function BasicImageExample() {
  return (
    <Host matchContents>
      <Image systemName="star.fill" />
    </Host>
  );
}
```

`systemName` 是 Apple 系统符号的名称。这里显示填充样式的星形符号。

它不是图片 URL，也不是项目中的文件路径：

```tsx
<Image systemName="star.fill" />
```

不能按 Web `<img src="...">` 的思路理解 `systemName`。

### 显示自定义 SF Symbol

```tsx
import { Host, Image } from '@expo/ui/swift-ui';

export default function CustomImageExample() {
  return (
    <Host matchContents>
      <Image assetName="acme.mark" />
    </Host>
  );
}
```

`assetName` 对应已导入 Apple Asset Catalog 的 symbol set 名称。

这不是加载任意项目图片资源的通用属性。资源必须是以符号集形式导入的自定义 SF Symbol。

当前文档没有涉及：

- 如何创建自定义 SF Symbol。
- 如何打开或修改 iOS Asset Catalog。
- Expo 托管项目如何自动化导入 symbol set。
- `assetName` 和 `systemName` 同时传入时的优先级。

因此，实际使用时不要依赖文档未定义的组合行为。

## 设置尺寸与颜色

```tsx
import { Host, HStack, Image } from '@expo/ui/swift-ui';

export default function ImageSizeColorExample() {
  return (
    <Host matchContents>
      <HStack spacing={16}>
        <Image systemName="heart.fill" size={24} color="red" />
        <Image systemName="star.fill" size={32} color="orange" />
        <Image systemName="bell.fill" size={40} color="blue" />
      </HStack>
    </Host>
  );
}
```

`HStack` 是 SwiftUI 风格的水平布局容器，可类比为：

```css
display: flex;
flex-direction: row;
gap: 16px;
```

但它是原生 SwiftUI 布局，并不是 CSS Flexbox。

### `size`

`size` 为符号设置固定的 point 尺寸：

```tsx
<Image systemName="heart.fill" size={24} />
```

需要特别注意：

- `size` 不会随 Dynamic Type 缩放。
- 如果同时提供 `font` modifier，`size` 会被忽略。
- 需要适配系统字体缩放时，应使用带 `textStyle` 的 `font` modifier。

### `color`

`color` 接受 React Native 的 `ColorValue`，例如：

```tsx
<Image systemName="heart.fill" color="red" />
<Image systemName="heart.fill" color="#ff00ff" />
```

当前文档只明确展示了颜色名称和十六进制颜色，没有展开其他 `ColorValue` 形式。

## 使用变量值改变符号外观

部分 SF Symbols 会根据数值显示不同状态：

```tsx
import { Host, HStack, Image } from '@expo/ui/swift-ui';

export default function ImageVariableExample() {
  return (
    <Host matchContents>
      <HStack spacing={16}>
        <Image systemName="chart.bar.fill" size={32} variableValue={0.3} />
        <Image systemName="chart.bar.fill" size={32} variableValue={0.6} />
        <Image systemName="chart.bar.fill" size={32} variableValue={1.0} />
      </HStack>
    </Host>
  );
}
```

`variableValue` 的有效范围是 `0.0` 到 `1.0`。它可以表达进度、强度或填充程度，但实际视觉变化由具体符号决定。

限制条件：

- 仅支持具有 variable value 能力的 SF Symbol。
- 需要 SF Symbols 4.0 或更高版本。
- 需要 iOS 16.0+ 或 tvOS 16.0+。
- 当前文档没有说明传入范围外数值时会截断、报错还是产生未定义结果，因此应主动限制到 `0.0` 至 `1.0`。

## 添加 SF Symbol 动画效果

符号动画通过 `symbolEffect` modifier 实现：

```tsx
import { symbolEffect } from '@expo/ui/swift-ui/modifiers';
```

所有 symbol effect 都要求 iOS 17.0 或更高版本。原文此处只明确写出 iOS 版本要求，没有明确列出 tvOS 对应的最低版本。

### 默认连续动画

```tsx
<Image
  systemName="wifi"
  size={48}
  color="blue"
  modifiers={[
    symbolEffect({
      effect: 'variableColor',
      fillStyle: 'iterative',
      playbackStyle: 'reversing',
    }),
  ]}
/>
```

该配置包含：

| 配置 | 作用 |
|---|---|
| `effect: 'variableColor'` | 使用可变颜色动画 |
| `fillStyle: 'iterative'` | 以逐步变化的方式应用效果 |
| `playbackStyle: 'reversing'` | 动画播放到末端后反向播放 |

文档说明：未提供额外控制参数时，效果默认持续运行。

### 通过 `value` 离散触发动画

当动画应该由事件触发一次，例如每次点击按钮让铃铛弹跳，可以将原生状态传给 `value`：

```tsx
import { Button, Host, Image, useNativeState, VStack } from '@expo/ui/swift-ui';
import { symbolEffect } from '@expo/ui/swift-ui/modifiers';
import { scheduleOnUI } from 'react-native-worklets';

export default function ImageSymbolEffectValueExample() {
  const trigger = useNativeState(0);

  return (
    <Host matchContents>
      <VStack spacing={16}>
        <Image
          systemName="bell.fill"
          size={48}
          color="orange"
          modifiers={[
            symbolEffect(
              { effect: 'bounce', direction: 'up' },
              { value: trigger }
            ),
          ]}
        />

        <Button
          label="Bounce"
          onPress={() =>
            scheduleOnUI(() => {
              'worklet';
              trigger.value = trigger.value + 1;
            })
          }
        />
      </VStack>
    </Host>
  );
}
```

关键流程是：

1. `useNativeState(0)` 创建原生侧可用的状态。
2. `value: trigger` 将该状态作为效果触发值。
3. 点击按钮后，通过 `scheduleOnUI` 在 UI 线程执行 worklet。
4. 每次修改 `trigger.value`，`bounce` 效果播放一次。

#### worklet 与 UI 线程

Web 开发中通常只需要考虑 JavaScript 主线程。React Native 应用还涉及 JavaScript 与原生 UI 的执行边界。

worklet 是可以在特定运行时，通常是 UI 线程相关运行时中执行的函数。函数体中的：

```tsx
'worklet';
```

用于标记该函数应按 worklet 处理。

原文明确要求从 worklet 中写入 `state.value`，也可以借助 `scheduleOnUI` 将更新调度到 UI 线程。不要直接将这个状态当作普通 React `useState` 使用。

### 通过 `isActive` 控制持续动画

```tsx
import {
  Host,
  Image,
  SyncToggle,
  useNativeState,
  VStack,
} from '@expo/ui/swift-ui';
import { symbolEffect } from '@expo/ui/swift-ui/modifiers';

export default function ImageSymbolEffectIsActiveExample() {
  const isActive = useNativeState(true);

  return (
    <Host matchContents>
      <VStack spacing={16}>
        <Image
          systemName="cloud.fill"
          size={48}
          color="cyan"
          modifiers={[
            symbolEffect(
              { effect: 'breathe' },
              { isActive }
            ),
          ]}
        />

        <SyncToggle label="Breathe" isOn={isActive} />
      </VStack>
    </Host>
  );
}
```

这里使用布尔状态控制动画：

- `isActive.value` 为 `true` 时运行 `breathe` 效果。
- 通过 `SyncToggle` 切换同一个原生状态。
- 适合“开启期间持续播放，关闭时停止”的交互。

### 三种动画控制方式

| 方式 | 行为 | 适用场景 |
|---|---|---|
| 不传控制参数 | 默认持续运行 | 加载、呼吸或循环提示 |
| `value` | 值每次变化时触发一次 | 点击反馈、通知到达 |
| `isActive` | 为 `true` 时持续运行 | 可开关的动态状态 |

## API 属性说明

组件导入方式：

```tsx
import { Image } from '@expo/ui/swift-ui';
```

### 属性总览

| 属性 | 类型 | 平台或版本 | 作用与限制 |
|---|---|---|---|
| `systemName` | `SFSymbols7_0` | iOS、tvOS | 显示 Apple 系统 SF Symbol |
| `assetName` | `string` | iOS、tvOS | 显示 Asset Catalog 中的自定义 symbol set |
| `uiImage` | `string` | iOS、tvOS | 显示本地图片 URI，但会同步读取并阻塞主线程 |
| `color` | `ColorValue` | iOS、tvOS | 设置系统符号颜色 |
| `size` | `number` | iOS、tvOS | 设置固定 point 尺寸；不支持 Dynamic Type；存在 `font` modifier 时被忽略 |
| `variableValue` | `number` | iOS 16+、tvOS 16+ | 用 `0.0` 至 `1.0` 改变支持该能力的符号外观 |
| `onPress` | `() => void` | iOS、tvOS | 视图被按下时调用 |
| `modifiers` 等继承属性 | `CommonViewModifierProps` | 参见 modifiers 文档 | 添加通用 SwiftUI modifier |

### `systemName`

```tsx
<Image systemName="photo" />
<Image systemName="heart.fill" />
<Image systemName="star.circle" />
```

其 TypeScript 类型为 `SFSymbols7_0`，有助于在开发阶段约束符号名称。

> **基于文档内容推导：** 类型列表面向 SF Symbols 7.0，但具体符号能否在目标设备显示仍可能受到操作系统所内置 SF Symbols 版本的影响。当前文档没有说明不存在或不受支持的符号将如何降级。

### `assetName`

```tsx
<Image assetName="acme.mark" />
```

值必须对应 Asset Catalog 中已导入的自定义符号集名称，而不是普通文件名。

### `uiImage`

```tsx
<Image uiImage="file:///path/to/image.jpg" />
```

该属性接收本地图片文件 URI。最重要的警告是：

> `uiImage` 会执行同步读取，并阻塞主线程。

阻塞主线程可能导致：

- 点击或滚动响应延迟。
- 动画掉帧。
- 界面短暂卡住。

因此它不应被当作 React Native 通用图片加载方案，尤其不适合频繁加载、大图片或列表中的大量图片。

当前文档没有说明：

- 是否支持网络 URL。
- 是否提供缓存。
- 支持哪些图片格式。
- 文件不存在时如何处理。
- 是否会自动缩放或裁剪。

不要根据 `uiImage` 名称推断这些行为。

### `onPress`

```tsx
<Image
  systemName="heart.fill"
  onPress={() => {
    // 处理点击
  }}
/>
```

`onPress` 在视图被按下时触发。当前文档没有进一步说明无障碍角色、焦点样式、点击区域扩展或禁用状态。

> **基于经验建议：** 如果符号承担关键操作，应评估使用语义更明确的按钮组件，而不是仅给图片添加 `onPress`，并补充适当的无障碍信息。

## React Web 开发者最容易误解的地方

### 它不是 Web `<img>`

Web 中通常使用：

```tsx
<img src="/images/star.svg" alt="Star" />
```

此处 `systemName` 指向 Apple 系统符号名称，并不对应 URL。只有 `uiImage` 用于本地图片 URI，而且存在同步读取的性能警告。

### 它不是跨平台 React Native 图片组件

虽然代码使用 JSX 和 React 组件形式，但底层是 SwiftUI，只支持 Apple 平台。组件的 React 外观并不意味着它能在 Android 或 Web 上运行。

### `size` 不会自动响应系统字体设置

固定 `size` 类似固定字号。若符号与文字共同表达语义，用户调大系统字体后，文字可能变大而符号保持原尺寸。

需要响应 Dynamic Type 时，应使用 `font` modifier 的 `textStyle`，并且不要期待 `size` 继续生效。

### `useNativeState` 不等同于 `useState`

普通 React 状态通常在 JavaScript 侧更新；符号动画示例使用的 `useNativeState` 服务于原生状态与 UI 线程交互。

特别是 `value` 触发动画时，文档要求从 worklet 中更新状态，或通过 `scheduleOnUI` 调度更新。

### 原生系统版本是功能边界

Web 开发者通常关注浏览器兼容性；这里需要关注 iOS/tvOS 版本：

- variable value：iOS/tvOS 16.0+。
- symbol effect：文档明确要求 iOS 17.0+。
- 具体符号还必须支持相应能力。

在较低系统版本上，不能假设所有属性和动画都有效。

## 实际开发中的使用方式

### 选择正确的图像来源

可以按照以下顺序判断：

1. Apple 已提供对应符号：使用 `systemName`。
2. 需要品牌化的矢量符号，并已导入 Asset Catalog：使用 `assetName`。
3. 需要读取本地位图文件：可以使用 `uiImage`，但必须评估同步读取造成的卡顿。
4. 需要跨平台图标：优先使用 Expo UI 的通用 `Icon`。
5. 需要常规网络图片或复杂图片加载能力：当前文档没有提供对应方案，应选择专门的图片组件。

### 为系统版本设计降级方案

> **基于文档内容推导：** 使用 `variableValue` 或 `symbolEffect` 时，应根据应用支持的最低系统版本规划降级显示。

例如，在不支持动画效果的系统上，至少应保证基础符号仍能表达相同语义。具体版本判断 API 和降级实现不在当前文档范围内。

### 控制 `uiImage` 的使用范围

由于它同步读取文件并阻塞主线程：

- 避免在长列表中批量使用。
- 避免在动画或高频交互期间读取。
- 避免重复读取同一大文件。
- 上线前在真实设备上观察卡顿情况。

以上是基于文档警告产生的工程建议，具体性能阈值未在文档中说明。

### 提前确认符号能力

不是所有 SF Symbol 都支持 variable value，也不是所有动画和符号都能在所有系统版本中使用。

开发前应确认：

- 符号名称是否正确。
- 目标系统是否包含该符号。
- 符号是否支持 variable value。
- 最低系统版本是否满足效果要求。
- 自定义符号是否已正确导入 Asset Catalog。

## 文档未涉及的内容

当前文档没有说明：

- Android 和 Web 的替代实现细节。
- 自定义 SF Symbol 的创建与导入完整流程。
- `systemName`、`assetName` 和 `uiImage` 同时传入时的优先级。
- 网络图片加载。
- 图片缓存、预加载和错误占位。
- 图片缩放、裁剪和内容模式。
- `uiImage` 支持的文件格式。
- 无障碍标签和交互语义配置。
- 低版本系统上的具体失败或降级行为。
- symbol effect 的完整效果及参数列表。
- tvOS 上 symbol effect 的最低版本。
- `CommonViewModifierProps` 的完整属性列表。
- 测试这些原生组件的方法。

这些问题需要查阅对应的 Expo UI modifier、通用 `Icon`、Apple SwiftUI 或 React Native 图片文档，不能从本页直接得出结论。

## 总结

`@expo/ui/swift-ui` 的 `Image` 是面向 iOS 和 tvOS 的 SwiftUI 原生图像组件，核心用途是显示和控制 SF Symbols。

使用时应重点记住：

- `systemName` 显示 Apple 系统符号。
- `assetName` 显示 Asset Catalog 中的自定义符号。
- `size` 是固定 point 尺寸，不跟随 Dynamic Type，并会被 `font` modifier 覆盖。
- `variableValue` 只适用于支持该能力的符号，要求 iOS/tvOS 16.0+。
- `symbolEffect` 可以持续运行，也可以通过 `value` 或 `isActive` 控制，要求 iOS 17.0+。
- 动画状态可能需要通过 worklet 和 UI 线程更新。
- `uiImage` 会同步读取本地文件并阻塞主线程，需要谨慎使用。
- 该组件不是跨平台图片方案；跨平台图标应考虑通用 `Icon`。

---

## 文档导航

- **上一页**：[hstack](./89__hstack.md)
- **下一页**：[label](./91__label.md)
