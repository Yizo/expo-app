# Expo BlurView 学习文档

`expo-blur` 提供了用于实现背景模糊效果的 React 组件。它通常用于导航栏、标签栏和模态框等需要“毛玻璃”视觉效果的界面。

支持平台：

- Android
- iOS
- tvOS
- Web
- Expo Go

> 本文原始页面对应的是**下一个 Expo SDK 版本的未发布文档**，不是当前稳定版本文档。页面注明当前最新稳定版本为 SDK 56。实际项目应根据所用 Expo SDK 版本查看对应文档，避免直接使用尚未发布的 API。

## 文档解决的问题

这篇文档主要说明：

1. 如何安装 `expo-blur`。
2. 如何使用 `BlurView` 创建背景模糊效果。
3. Android 平台为什么需要额外配置 `BlurTargetView`。
4. Android 不同系统版本下的模糊实现和性能差异。
5. `BlurView`、`BlurTargetView` 的属性和相关类型。
6. 如何处理动态内容不更新、圆角无效等问题。

它适合以下场景：

- 为导航栏或底部标签栏添加毛玻璃背景。
- 在模态框、浮层或卡片后面显示模糊内容。
- 在 iOS、Android 和 Web 之间实现尽可能一致的模糊效果。
- 将现有的 iOS 模糊实现迁移为支持 Android 的实现。

## 阅读前需要理解的背景

### `BlurView` 模糊的是什么

`BlurView` 不是模糊自己的子元素，而是模糊它视觉上覆盖的背景内容。

可以将它理解为 Web 中类似下面的效果：

```css
.overlay {
  backdrop-filter: blur(10px);
}
```

但 React Native 并不直接使用 DOM 和 CSS。不同平台由各自的原生实现完成模糊，因此 iOS、Android 和 Web 的行为及性能可能不同。

`BlurView` 内部仍然可以放置文本、按钮等子组件，这些前景内容不会被当作背景一起模糊。

### Expo、React Native 和原生模块

- **React Native**：使用 React 编写 iOS 和 Android 应用，但最终渲染的是原生界面组件，而不是 HTML。
- **Expo**：围绕 React Native 提供工具链和一系列跨平台模块。
- **`expo-blur`**：Expo 提供的模糊效果模块，底层会调用各平台对应的实现。
- **Expo Go**：用于快速运行 Expo 项目的客户端。本模块已包含在 Expo Go 中。

对于 React Web 开发者，可以将 `expo-blur` 理解为一个封装了 iOS、Android 和 Web 平台差异的跨平台 UI 组件库。

### Android SDK 版本

文档中的 Android SDK 31 指 Android 12.0。

这里的“SDK 版本”指 Android 系统 API 级别，不是 Expo SDK 版本：

- Expo SDK：Expo 框架的版本。
- Android SDK/API Level：Android 系统能力的版本。

二者不要混淆。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-blur

# yarn
yarn expo install expo-blur

# pnpm
pnpm expo install expo-blur

# bun
bun expo install expo-blur
```

### 为什么使用 `expo install`

`expo install` 会根据当前项目的 Expo SDK 版本选择兼容的软件包版本。它和直接执行 `npm install expo-blur` 的意义不完全相同。

对于 Expo 项目，应优先使用文档给出的 `expo install` 命令。

### 现有 React Native 项目的额外要求

如果项目是已有的普通 React Native 项目，而不是标准 Expo 项目，需要先在工程中安装和配置 `expo`，才能使用 `expo-blur`。

这意味着 `expo-blur` 并不是一个在任意 React Native 工程中安装后便一定可以直接运行的纯 JavaScript 组件。现有原生工程还需要具备 Expo Modules 的运行环境。

文档没有展开说明原生 iOS、Android 工程的具体配置步骤，而是指向了“在现有 React Native 应用中安装 Expo Modules”的独立文档。

## 基础用法：iOS 和 Web

导入组件：

```jsx
import { BlurView } from 'expo-blur';
```

基本结构如下：

```jsx
<View>
  <View>{/* 背景内容 */}</View>

  <BlurView intensity={80} tint="light">
    <Text>显示在模糊背景上方的内容</Text>
  </BlurView>
</View>
```

完整示例中的三个 `BlurView` 分别展示：

- 默认色调、强度为 `100`。
- 浅色色调、强度为 `80`。
- 深色色调、强度为 `90`。

```jsx
<BlurView intensity={100} style={styles.blurContainer}>
  <Text style={styles.text}>{text}</Text>
</BlurView>

<BlurView intensity={80} tint="light" style={styles.blurContainer}>
  <Text style={styles.text}>{text}</Text>
</BlurView>

<BlurView intensity={90} tint="dark" style={styles.blurContainer}>
  <Text style={[styles.text, { color: '#fff' }]}>{text}</Text>
</BlurView>
```

### 这种写法在 Android 上的实际结果

文档将这种方式称为旧版用法：

- iOS：产生真正的背景模糊。
- Web：文档将其列入该示例的适用平台。
- Android：默认不会产生真正的模糊，只会显示半透明背景。

原因是 Android 的 `blurMethod` 默认值为 `'none'`。要在 Android 上启用真正的模糊，需要使用下一节介绍的 `BlurTargetView` 和 Android 模糊方法。

## 支持 Android 的完整用法

Android 需要明确告诉 `BlurView`：应该采集并模糊哪一部分背景。

实现流程如下：

1. 使用 `BlurTargetView` 包裹需要被模糊的内容。
2. 使用 `useRef` 创建指向该 `BlurTargetView` 的引用。
3. 将这个引用传给 `BlurView` 的 `blurTarget`。
4. 通过 `blurMethod` 启用 Android 原生模糊。

核心代码：

```tsx
import { BlurView, BlurTargetView } from 'expo-blur';
import { useRef } from 'react';
import { Text, View } from 'react-native';

export default function App() {
  const targetRef = useRef<View | null>(null);

  return (
    <View>
      <BlurTargetView ref={targetRef}>
        {/* 需要被模糊的背景内容 */}
      </BlurTargetView>

      <BlurView
        blurTarget={targetRef}
        blurMethod="dimezisBlurView"
        intensity={80}
        tint="light">
        <Text>前景内容</Text>
      </BlurView>
    </View>
  );
}
```

### `BlurTargetView` 的作用

`BlurTargetView` 用于标记模糊效果的数据来源。它包裹的是“需要被采集并作为模糊背景的内容”。

`BlurView` 则负责显示最终的模糊区域。

对 React Web 开发者来说，可以将二者理解为：

- `BlurTargetView`：明确指定背景采集范围。
- `BlurView`：显示经过模糊处理的覆盖层。

这比 Web 的 `backdrop-filter` 更显式，因为 Android 实现需要通过组件引用建立目标关系。

### 为什么需要 `useRef`

```tsx
const targetRef = useRef<View | null>(null);
```

这里的 `ref` 不是保存业务状态，而是引用一个实际的 React Native `View` 实例。

随后建立关联：

```tsx
<BlurTargetView ref={targetRef}>
  {/* 背景 */}
</BlurTargetView>

<BlurView blurTarget={targetRef}>
  {/* 前景 */}
</BlurView>
```

这和 React Web 中通过 `ref` 获取 DOM 元素的概念类似，但这里引用的是 React Native 原生视图，不是 HTML 元素。

### 多个 `BlurView` 可以共享目标

只要多个 `BlurView` 都位于同一个 `BlurTargetView` 的范围内，就可以共享同一个目标引用：

```tsx
<BlurTargetView ref={targetRef}>
  {/* 背景内容 */}
</BlurTargetView>

<BlurView blurTarget={targetRef} />
<BlurView blurTarget={targetRef} />
<BlurView blurTarget={targetRef} />
```

文档明确指出，共享一个 `BlurTargetView` 比为每个 `BlurView` 创建独立目标更加高效。

## Android 模糊方式与性能

Android 平台支持三种 `BlurMethod`：

```ts
type BlurMethod =
  | 'none'
  | 'dimezisBlurView'
  | 'dimezisBlurViewSdk31Plus';
```

### `'none'`

不执行真正的背景模糊，而是渲染一个半透明视图。

它也是 Android 上的默认值。

适合：

- 不需要真正模糊效果的场景。
- 希望完全避开 Android 模糊性能开销的场景。
- 作为旧版 Android 系统的降级效果。

### `'dimezisBlurView'`

基于 Dimezis BlurView 原生库实现背景模糊。

```tsx
<BlurView
  blurTarget={targetRef}
  blurMethod="dimezisBlurView"
/>
```

其行为是：

- Android SDK 31 及以上：使用效率较高的 `RenderNode` API。
- Android SDK 30 及以下：使用效率明显较低的 `RenderScript` API。

因此，它能够覆盖更多 Android 版本，但旧系统可能面临性能下降。

### `'dimezisBlurViewSdk31Plus'`

只在 Android SDK 31，即 Android 12.0 及以上启用真正的模糊：

```tsx
<BlurView
  blurTarget={targetRef}
  blurMethod="dimezisBlurViewSdk31Plus"
/>
```

其行为是：

- Android SDK 31 及以上：使用原生模糊。
- 更旧的 Android：自动退化为 `'none'`，显示半透明视图。

这种方式牺牲了旧系统上的真实模糊效果，以避免旧版 `RenderScript` 带来的性能成本。

### 如何选择

| 需求 | 推荐方式 |
| --- | --- |
| Android 不需要真实模糊 | `'none'` |
| 所有支持的 Android 版本都需要真实模糊 | `'dimezisBlurView'` |
| 更重视性能，允许旧系统降级 | `'dimezisBlurViewSdk31Plus'` |

> **基于文档内容推导：** 如果应用包含滚动、动画或多个模糊区域，旧版 Android 上的计算压力可能更加明显。此时应优先评估 `'dimezisBlurViewSdk31Plus'` 是否符合产品的降级要求。

## `BlurView` API

`BlurView` 支持 Android、iOS、tvOS 和 Web，并继承 React Native `View` 的属性。

### `intensity`

```ts
intensity?: number;
```

- 支持平台：Android、iOS、tvOS、Web
- 默认值：`50`
- 文档规定范围：`1` 到 `100`
- 作用：控制模糊强度

示例：

```tsx
<BlurView intensity={80} />
```

该属性可以通过 `react-native-reanimated` 制作动画。

> 当前文档只说明可以使用 `react-native-reanimated` 动画化该属性，没有提供具体动画代码和配置流程。

### `tint`

```ts
tint?: BlurTint;
```

- 支持平台：Android、iOS、tvOS、Web
- 默认值：`'default'`
- 作用：设置模糊视图的色调模式

常见取值：

```tsx
<BlurView tint="light" />
<BlurView tint="dark" />
<BlurView tint="default" />
```

完整可选值为：

```ts
type BlurTint =
  | 'light'
  | 'dark'
  | 'default'
  | 'extraLight'
  | 'regular'
  | 'prominent'
  | 'systemUltraThinMaterial'
  | 'systemThinMaterial'
  | 'systemMaterial'
  | 'systemThickMaterial'
  | 'systemChromeMaterial'
  | 'systemUltraThinMaterialLight'
  | 'systemThinMaterialLight'
  | 'systemMaterialLight'
  | 'systemThickMaterialLight'
  | 'systemChromeMaterialLight'
  | 'systemUltraThinMaterialDark'
  | 'systemThinMaterialDark'
  | 'systemMaterialDark'
  | 'systemThickMaterialDark'
  | 'systemChromeMaterialDark';
```

这些名称中包含大量 Apple 系统材质风格。虽然类型标记为多平台支持，但文档没有逐项说明每个值在 Android、Web 和 tvOS 上的具体视觉差异。

> **基于经验建议：** 跨平台项目应在真机或对应平台模拟器中逐个平台检查 `tint` 效果，不要仅根据属性名称假设所有平台显示一致。

### `blurMethod`

```ts
blurMethod?: BlurMethod;
```

- 仅支持 Android
- 默认值：`'none'`
- 作用：选择 Android 的模糊实现方式

这是决定 Android 是否执行真实模糊的关键配置。仅设置 `intensity` 并不会自动启用 Android 原生模糊。

### `blurTarget`

```ts
blurTarget?: RefObject<View | null>;
```

- 仅支持 Android
- 作用：指定当前 `BlurView` 应该模糊哪个 `BlurTargetView`

使用真正的 Android 模糊时，需要同时建立目标引用：

```tsx
const targetRef = useRef<View | null>(null);

<BlurTargetView ref={targetRef} />

<BlurView
  blurTarget={targetRef}
  blurMethod="dimezisBlurView"
/>
```

### `blurReductionFactor`

```ts
blurReductionFactor?: number;
```

- 仅支持 Android
- 默认值：`4`
- 作用：Android 上的模糊强度会除以该数值

Android 实验性模糊方法在相同 `intensity` 下，视觉强度可能和 iOS 不一致。该属性用于微调 Android 的效果，使其更接近 iOS。

例如：

```tsx
<BlurView
  intensity={80}
  blurReductionFactor={4}
/>
```

从属性定义看，Android 实际使用的强度会按照该因子缩减。但文档没有给出不同设备和强度下的推荐数值。

> **基于文档内容推导：** `blurReductionFactor` 更适合用于跨平台视觉校准，而不是作为日常调节模糊强度的首选参数。一般效果调整应先使用 `intensity`。

## `BlurTargetView` API

`BlurTargetView` 支持 Android、iOS、tvOS 和 Web，也继承 React Native `View` 的属性。

其专门列出的属性是：

```ts
ref?: RefObject<View | null>;
```

在本文场景中，这个 `ref` 主要用于将目标视图传给 Android 的 `BlurView`。

虽然组件本身被标记为支持多个平台，但文档要求使用目标引用的 Android 模糊流程主要是为 Android 准备的。

## 样式和布局

由于 `BlurView` 和 `BlurTargetView` 都继承 React Native `View` 的属性，因此可以使用常见的 React Native 布局和样式属性，例如：

```tsx
const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    padding: 20,
    margin: 16,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 20,
  },
});
```

### `StyleSheet.absoluteFill`

示例背景使用：

```tsx
background: {
  flex: 1,
  flexWrap: 'wrap',
  ...StyleSheet.absoluteFill,
}
```

`StyleSheet.absoluteFill` 是一组用于铺满父容器的绝对定位样式。对 Web 开发者来说，接近：

```css
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
```

它使背景内容铺满容器，让后续的 `BlurView` 可以覆盖在背景上方。

### 圆角必须配合 `overflow: 'hidden'`

在 Android 和 iOS 上，只为 `BlurView` 设置 `borderRadius` 不会自动裁剪模糊内容：

```tsx
blurContainer: {
  borderRadius: 20,
  overflow: 'hidden',
}
```

必须添加：

```tsx
overflow: 'hidden'
```

才能让模糊效果按照圆角边界裁剪。

这和 Web 中只设置 `border-radius` 通常就能看到圆角的直觉不同，是 React Web 开发者容易遗漏的地方。

## 已知问题：动态内容与渲染顺序

文档明确指出，如果先渲染 `BlurView`，再渲染 `FlatList` 等动态内容，模糊效果可能不会随着动态内容更新。

错误风险来自渲染顺序，而不只是视觉上的层级样式。

推荐结构：

```jsx
<View>
  <FlatList />
  <BlurView />
</View>
```

也就是先声明动态背景内容，再声明覆盖它的 `BlurView`。

### `FlatList` 是什么

`FlatList` 是 React Native 中用于高效渲染长列表的组件，作用接近经过虚拟化优化的 Web 列表。它会按需渲染列表项，因此内容可能在 `BlurView` 初次创建之后才出现。

如果 `BlurView` 没有重新捕获这些内容，用户看到的模糊背景就可能缺失或过期。

### 开发影响

当背景包含以下内容时，需要特别关注组件顺序：

- `FlatList` 等虚拟化列表。
- 异步请求完成后才出现的内容。
- 运行过程中动态增加或变化的背景元素。

> 文档明确给出的修复方式是让 `BlurView` 在动态内容组件之后渲染。文档没有提供手动刷新模糊缓存或强制重新捕获背景的 API。

## React Web 开发者容易误解的地方

### 1. 组件顺序不仅影响层叠关系

在 Web 中，开发者可能主要通过 `position` 和 `z-index` 控制前后层级。但这里的 JSX 渲染顺序还可能影响 `BlurView` 能否捕获动态背景。

因此，不能只确认“界面看起来覆盖正确”，还要确认背景组件先于 `BlurView` 渲染。

### 2. Android 默认不执行真实模糊

下面的代码在 iOS 上可以模糊，但 Android 默认只显示半透明视图：

```tsx
<BlurView intensity={80} />
```

Android 真实模糊需要：

- `BlurTargetView`
- `ref`
- `blurTarget`
- 非 `'none'` 的 `blurMethod`

### 3. `BlurTargetView` 包裹的是背景，不是模糊层内容

正确关系：

```tsx
<BlurTargetView ref={targetRef}>
  {/* 被模糊的背景 */}
</BlurTargetView>

<BlurView blurTarget={targetRef}>
  {/* 清晰显示的前景 */}
</BlurView>
```

如果把前景文字错误地放进目标区域并期待它保持清晰，就可能得到不符合预期的视觉结构。

### 4. 相同数值不保证跨平台视觉一致

即使各平台都使用：

```tsx
intensity={80}
```

实际模糊观感也可能不同。Android 为此专门提供了 `blurReductionFactor`。

跨平台 UI 不能只通过属性值判断是否一致，仍需进行视觉测试。

### 5. 原生效果会受到系统版本影响

Web 开发中通常关注浏览器兼容性；React Native 中还需要关注 Android 系统 API 级别。

Android 12.0 之前的模糊实现效率较低。选择模糊方法时，需要同时考虑：

- 支持哪些系统版本。
- 是否必须保留真实模糊。
- 是否可以接受半透明降级。
- 页面是否存在滚动、动画或多个模糊区域。

## 实际开发建议

### 跨平台组件应显式处理 Android

> **基于经验建议：** 可以根据平台设置不同的模糊参数，但应保留统一的业务组件接口。例如，对外只暴露 `intensity` 和 `tint`，在组件内部处理 Android 的目标引用和 `blurMethod`。

不要因为基础示例在 iOS 上有效，就认为 Android 已经获得同样效果。

### 优先复用 `BlurTargetView`

当多个模糊区域使用同一片背景，并且都位于同一个目标范围内时，应共享目标：

```tsx
const targetRef = useRef<View | null>(null);
```

这不仅减少组件数量，也是文档明确推荐的性能优化方式。

### 根据产品要求决定旧 Android 的降级策略

如果真实模糊不是核心功能，可采用：

```tsx
blurMethod="dimezisBlurViewSdk31Plus"
```

这样 Android 12.0 之前会退化为半透明背景，避免效率较低的旧版模糊实现。

如果设计要求所有支持版本都必须显示真实模糊，则需要使用：

```tsx
blurMethod="dimezisBlurView"
```

同时应重点测试旧版 Android 的滚动和动画性能。

### 对动态背景进行专门验证

测试时不要只使用静态色块。还应覆盖：

- 列表滚动。
- 异步加载。
- 背景内容更新。
- 多个 `BlurView` 共享目标。
- 模糊层尺寸或位置变化。

确保 `BlurView` 位于动态内容组件之后。

### 同时测试视觉和性能

> **基于经验建议：** 模糊属于计算成本较高的视觉效果。除了检查样式，还应在 Android 12.0 之前和之后的设备上观察帧率、滚动流畅度和页面响应。

当前文档未提供性能指标、设备基准或测试工具，因此无法仅根据文档判断某个页面可以安全使用多少个模糊视图。

## 文档未涉及的内容

当前文档未涉及以下内容：

- 如何创建或配置完整的 Expo 项目。
- iOS 和 Android 原生工程的手动链接细节。
- `react-native-reanimated` 动画 `intensity` 的完整示例。
- 各个 `BlurTint` 值在不同平台上的具体视觉对照。
- 无障碍模式或系统“减少透明度”设置的处理方式。
- 模糊效果的内存、耗电量和具体性能数据。
- 自动化测试 `BlurView` 的方法。
- 服务端渲染环境中的行为。
- Web 端使用的具体浏览器 API及浏览器兼容范围。

这些问题不能根据当前文档得出确定结论，需要查阅对应版本的其他官方文档或进行实际平台测试。

## 明确结论与推导结论

### 文档明确说明

- `BlurView` 用于模糊视图下方的内容。
- 常见用途包括导航栏、标签栏和模态框。
- Android 从 Expo SDK 55 开始获得稳定支持，但需要调整代码。
- Android 真实模糊需要 `BlurTargetView`、目标引用和对应的模糊方法。
- Android SDK 31 及以上可以使用效率较高的 `RenderNode`。
- 更旧的 Android 使用效率明显较低的 `RenderScript`。
- `'dimezisBlurViewSdk31Plus'` 会在旧系统上退化为 `'none'`。
- 多个 `BlurView` 可以共享一个 `BlurTargetView`，并且这样更高效。
- 动态内容应在 `BlurView` 之前渲染。
- 圆角需要配合 `overflow: 'hidden'`。
- `intensity` 可以通过 `react-native-reanimated` 动画化。

### 基于文档内容推导

- 对性能敏感且允许视觉降级的应用，更适合使用 `'dimezisBlurViewSdk31Plus'`。
- `blurReductionFactor` 主要用于跨平台视觉校准。
- 动态背景越多，越需要验证模糊内容是否能及时更新。
- 使用多个目标视图会比共享目标增加额外处理成本。
- Android 旧系统上的滚动或动画场景更容易受到模糊性能影响。

以上推导建立在文档描述的 API 行为和性能差异之上，但不等同于官方提供的具体性能保证。

## 总结

`expo-blur` 的基本目标是提供跨平台背景模糊组件，但各平台并非使用完全相同的实现。

使用时需要记住四个关键点：

1. iOS 和 Web 可以直接使用 `BlurView`，但 Android 默认只显示半透明背景。
2. Android 真实模糊需要通过 `BlurTargetView`、`ref` 和 `blurTarget` 明确指定背景。
3. Android 12.0 之前的模糊实现性能较低，应根据产品要求选择真实模糊或半透明降级。
4. 动态内容必须先于 `BlurView` 渲染，圆角必须配合 `overflow: 'hidden'`。

对于跨平台项目，不能只确认代码能够运行，还需要分别检查各平台的视觉效果、动态更新行为和 Android 旧系统性能。

---

## 文档导航

- **上一页**：[blob](./149__blob.md)
- **下一页**：[brightness](./151__brightness.md)
