# Expo Symbols 学习文档

## 文档解决的问题

`expo-symbols` 是 Expo 提供的原生符号图标库，用于在 React Native 应用中访问不同平台的系统符号：

- iOS、tvOS：使用 Apple 的 **SF Symbols**
- Android、Web：使用 Google 的 **Material Symbols**

它主要解决以下问题：

1. 在 Expo/React Native 项目中渲染接近原生系统风格的图标。
2. 使用同一个 `SymbolView` 组件，为不同平台指定对应的图标。
3. 配置图标尺寸、颜色、字重和 iOS 特有的渲染效果。
4. 在 Android 上将 Material Symbol 转换为图片源，供只能接收 `ImageSourcePropType` 的 API 使用。

> 当前文档描述的是 **下一版本 Expo SDK** 中的 API，而不是稳定的最新 SDK 56 文档。并且 `expo-symbols` 目前处于 **Beta** 阶段，未来可能发生破坏性变更。

## 适用场景

适合使用 `expo-symbols` 的场景包括：

- Expo 应用需要使用系统风格图标。
- 希望 iOS 使用 SF Symbols，而 Android/Web 使用 Material Symbols。
- 需要为不同平台选择语义相同、名称不同的图标。
- 需要通过尺寸、颜色、字重统一控制图标外观。
- iOS 应用需要使用分层、多色或动画符号。
- Android 原生 API 需要图片源，而不能直接接收 React 组件。

以下场景需要谨慎：

- 项目要求所有平台的图标像素级一致。
- 不希望维护不同平台的图标名称映射。
- 依赖长期稳定、不会发生破坏性变化的 API。

最后一点尤其重要，因为该库当前仍处于 Beta 阶段。

## 阅读前需要理解的背景知识

### 原生符号不是普通图片

SF Symbols 和 Material Symbols 都是由平台提供的符号系统。它们通常具有以下能力：

- 根据尺寸进行适配；
- 调整颜色和字重；
- 与平台界面风格保持一致；
- 某些符号包含多个图层；
- 某些平台支持符号动画。

这与 React Web 中直接使用 PNG 图片不同，也不完全等同于普通 SVG 图标组件。

### SF Symbols 与 Material Symbols 名称不通用

同一个语义在不同符号库中通常有不同名称。例如：

```jsx
name={{
  ios: 'info.circle',
  android: 'info',
  web: 'info',
}}
```

这里的 `info.circle` 是 SF Symbol 名称，`info` 是 Material Symbol 名称。`expo-symbols` 不会自动把其中一个名称翻译成另一个平台的名称。

### `SymbolView` 是 React Native 组件

`SymbolView` 可以理解为 React Web 中的图标组件，但它继承的是 React Native `ViewProps`，样式也遵循 React Native 的规则：

```jsx
const styles = StyleSheet.create({
  symbol: {
    width: 35,
    height: 35,
    margin: 5,
  },
});
```

React Native 样式使用 JavaScript 对象，不使用 CSS 类名，也不能直接套用浏览器中的 CSS 选择器和样式机制。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-symbols

# yarn
yarn expo install expo-symbols

# pnpm
pnpm expo install expo-symbols

# bun
bun expo install expo-symbols
```

这里使用的是 `expo install`，而不是直接运行普通的 `npm install`。它的作用是安装与当前 Expo SDK 兼容的软件包版本。

如果是在已有的普通 React Native 项目中使用，还必须先按照 Expo 文档将 `expo` 和 Expo Modules 支持安装到项目中。

> 当前文档没有提供 iOS Pod、Android Gradle 或原生权限配置，说明本页面未要求额外配置这些内容。对于已有 React Native 工程，Expo Modules 的具体接入步骤需要参考文档中的相关链接。

## 跨平台使用

首先导入组件：

```jsx
import { SymbolView } from 'expo-symbols';
```

一个完整的跨平台示例：

```jsx
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <SymbolView
        name={{ ios: 'info.circle', android: 'info', web: 'info' }}
        tintColor="#007AFF"
        size={35}
      />

      <SymbolView
        name={{
          ios: 'pencil.tip.crop.circle.badge.plus',
          android: 'home_and_garden',
          web: 'home_and_garden',
        }}
        style={styles.symbol}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    width: 35,
    height: 35,
    margin: 5,
  },
});
```

### `name` 的两种传值方式

#### 跨平台对象

```jsx
<SymbolView
  name={{
    ios: 'star.fill',
    android: 'star',
    web: 'star',
  }}
/>
```

对象中的每个字段都是对应平台实际使用的符号名称。

可通过以下来源查找名称：

- iOS：Apple SF Symbols 应用
- Android/Web：Google Material Symbols 网站

#### 直接传字符串

```jsx
<SymbolView
  name="airpods.chargingcase"
  style={styles.symbol}
  type="hierarchical"
/>
```

字符串会被当作 SF Symbol 名称处理，因此只在 iOS 上渲染。Android 和 Web 不会自动寻找同名 Material Symbol。

这是 React Web 开发者最容易误解的行为之一：字符串不是跨平台图标名称，而是 **iOS 专用的 SF Symbol 名称**。

## 缺失图标与 `fallback`

当当前平台没有定义符号时，可以通过 `fallback` 渲染替代内容：

```jsx
import { Text } from 'react-native';

<SymbolView name={{}} fallback={<Text>?</Text>} />
```

`fallback` 接收任意 `React.ReactNode`，因此可以传入：

- 文本；
- 其他图标组件；
- 图片；
- 自定义 React Native 组件。

如果某个平台没有对应的 `name`，并且没有提供 `fallback`，该平台将不会渲染该符号。

> 基于文档内容推导：跨平台项目最好集中管理符号映射，并对可能缺失的符号提供 fallback，否则可能出现某个平台上的图标位置为空。

## 图标字重

### iOS 字重

iOS 可以直接使用字符串：

```jsx
weight="bold"
```

### Android 字重

Android 需要从 `expo-symbols/androidWeights` 导入对应的字重对象：

```jsx
import bold from 'expo-symbols/androidWeights/bold';

<SymbolView
  name={{ ios: 'star.fill', android: 'star', web: 'star' }}
  weight={{ ios: 'bold', android: bold }}
  tintColor="gold"
  size={35}
/>
```

可导入的 Android 字重包括：

- `bold`
- `semiBold`
- `medium`
- `regular`
- `light`
- `extraLight`
- `thin`

需要注意两个容易混淆的细节：

1. Android 使用导入值，而不是直接传入普通字符串。
2. Android 导入名是 `semiBold`，而 `SymbolWeight` 的 iOS 字符串值是 `semibold`，大小写不同。

Web 的 `weight` 也被文档描述为需要从 `expo-symbols/androidWeights/{weight}` 导入，但示例只展示了 Android 字段，没有展示 Web 字段的具体写法。

## `SymbolView` 属性

`SymbolView` 支持 Android、iOS、tvOS 和 Web，并继承 React Native 的 `ViewProps`。

### 跨平台属性

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `name` | SF Symbol 字符串或平台名称对象 | 必填 | 指定要渲染的符号 |
| `fallback` | `React.ReactNode` | 无 | 当前平台未定义符号时显示的替代内容 |
| `size` | `number` | `24` | 设置符号尺寸 |
| `tintColor` | `ColorValue` | 无 | 设置符号着色颜色 |
| `weight` | 字重或平台字重对象 | `'unspecified'` | 设置符号笔画粗细 |

`name` 支持的结构为：

```ts
SFSymbol
```

或者：

```ts
{
  android: AndroidSymbol;
  ios: SFSymbol;
  web: AndroidSymbol;
}
```

这里的类型定义意味着跨平台对象要求提供 `android`、`ios` 和 `web` 名称。文档没有在该对象类型中列出单独的 `tvOS` 字段；tvOS 使用的是 Apple 符号体系。

### 文档标记为 iOS 专用的属性

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `animationSpec` | `AnimationSpec` | 无 | 配置符号动画 |
| `colors` | `ColorValue` 或 `ColorValue[]` | 无 | 为 `palette` 类型提供颜色 |
| `resizeMode` | `ContentMode` | `'scaleAspectFit'` | 控制符号如何适应容器 |
| `scale` | `SymbolScale` | `'unspecified'` | 设置符号比例等级 |
| `type` | `SymbolType` | `'monochrome'` | 设置符号的颜色呈现模式 |

虽然后面的部分类型定义标记了多个平台，但在 `SymbolViewProps` 中，上述属性明确标记为 iOS 支持。实际开发时应以具体属性的支持平台说明为准，不应仅根据类型章节中的平台标签假设 Android 或 Web 已实现对应能力。

## 符号颜色模式

`type` 决定符号使用哪种颜色变体，默认为 `monochrome`。

| 值 | 含义 |
| --- | --- |
| `monochrome` | 单色显示 |
| `hierarchical` | 从一个主色生成具有层级关系的颜色效果 |
| `palette` | 使用多种指定颜色构成调色板 |
| `multicolor` | 使用符号自身的多色版本，前提是该符号提供这种版本 |

使用调色板模式时，可以通过 `colors` 提供颜色：

```jsx
<SymbolView
  name="example.symbol"
  type="palette"
  colors={['red', 'blue']}
/>
```

`colors` 在文档中明确标记为 iOS 属性。不同符号是否具有层级或多色版本，取决于 SF Symbol 本身。

## 尺寸、容器与缩放

### `size`

```jsx
<SymbolView name="star" size={35} />
```

`size` 是符号自身的尺寸，默认值为 `24`。

### `style`

```jsx
<SymbolView
  name="star"
  style={{ width: 35, height: 35 }}
/>
```

`style` 来源于继承的 `ViewProps`，用于控制组件容器布局。

`size` 和容器的 `width`、`height` 不是完全相同的概念：前者控制符号尺寸，后者控制组件在布局中的空间。

### `resizeMode`

`resizeMode` 控制符号内容如何适应容器，默认使用 `scaleAspectFit`。

可选值包括：

- `scaleToFill`
- `scaleAspectFit`
- `scaleAspectFill`
- `redraw`
- `center`
- `top`
- `bottom`
- `left`
- `right`
- `topLeft`
- `topRight`
- `bottomLeft`
- `bottomRight`

### `scale`

`scale` 可选值包括：

- `default`
- `unspecified`
- `small`
- `medium`
- `large`

`resizeMode` 和 `scale` 在 `SymbolViewProps` 中均标记为 iOS 专用。

## 符号动画

`animationSpec` 用于配置符号动画，在组件属性说明中标记为 iOS 支持。

基本结构如下：

```ts
{
  effect?: {
    type: 'bounce' | 'pulse' | 'scale';
    direction?: 'up' | 'down';
    wholeSymbol?: boolean;
  };
  repeatCount?: number;
  repeating?: boolean;
  speed?: number;
  variableAnimationSpec?: VariableAnimationSpec;
}
```

### 普通动画效果

`effect.type` 支持：

- `bounce`：弹跳效果；
- `pulse`：脉冲效果；
- `scale`：缩放效果。

其他配置：

| 字段 | 作用 |
| --- | --- |
| `direction` | 动画方向，支持 `up` 或 `down` |
| `wholeSymbol` | 是否让整个符号一起动画；默认只处理单独图层 |
| `repeatCount` | 重复次数 |
| `repeating` | 是否重复 |
| `speed` | 动画持续时间，单位为秒 |

### 可变图层动画

可变颜色动画通过改变符号各图层的透明度来吸引用户注意。

```ts
type VariableAnimationSpec = {
  cumulative?: boolean;
  dimInactiveLayers?: boolean;
  hideInactiveLayers?: boolean;
  iterative?: boolean;
  nonReversing?: boolean;
  reversing?: boolean;
};
```

各字段含义如下：

| 字段 | 含义 |
| --- | --- |
| `cumulative` | 逐层启用，已启用图层保持状态直到本轮动画结束 |
| `iterative` | 按顺序短暂启用各图层，随后恢复原状态 |
| `dimInactiveLayers` | 降低未激活图层的透明度，但不完全隐藏 |
| `hideInactiveLayers` | 完全隐藏未激活图层 |
| `nonReversing` | 重复时不反向 |
| `reversing` | 每次重复时反向 |

文档明确指出：

- `cumulative` 会取消 `iterative` 变体；
- 多个设置为 `true` 的效果会叠加。

因此不应在不了解组合行为的情况下同时启用大量配置。

## Android 图片源方法

```js
Symbol.unstable_getMaterialSymbolSourceAsync(symbol, size, color)
```

该方法仅支持 Android，用于把 Material Symbol 渲染为图片源。

参数：

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `symbol` | Material Symbol | 指定符号 |
| `size` | `number` | 指定图片尺寸 |
| `color` | `string` | 指定颜色 |

返回值：

```ts
Promise<ImageSourcePropType>
```

由于它返回 Promise，因此必须异步获取结果。该方法适合用于不能直接接收 React 组件、只能接收图片源的 API，例如标签栏图标。

React Web 开发者可以将其理解为：先把图标“渲染成图片资源描述”，再把结果交给原生 API，而不是直接把 `<SymbolView />` 传进去。

方法名带有 `unstable_`，表示其稳定性较低。再结合整个库处于 Beta 阶段，不应假设该方法的名称、参数或行为会长期保持不变。

## 注意事项与限制

### 文档对应下一版本 SDK

页面明确说明这是下一版本 SDK 的文档，当前稳定最新版文档是 SDK 56。项目使用稳定 SDK 时，应核对对应版本文档，不能直接假设本页所有 API 都已可用。

### 库仍处于 Beta

Beta API 可能发生破坏性变更。升级 Expo SDK 或 `expo-symbols` 后，需要重新检查：

- 属性名称和类型；
- 平台支持范围；
- Android 字重导入路径；
- `unstable_` 方法；
- 动画配置。

### 图标名称必须按平台维护

SF Symbols 与 Material Symbols 是不同的图标库。即使图标语义相同，也不能假设名称、造型或可用范围相同。

### 字符串名称只支持 iOS

以下写法不是跨平台写法：

```jsx
<SymbolView name="airpods.chargingcase" />
```

Android 和 Web 不会渲染它，除非提供对应的平台名称或 `fallback`。

### 平台能力并不完全一致

基础属性可以跨平台使用，但以下高级能力在组件属性说明中属于 iOS：

- 动画；
- 调色板颜色；
- 符号颜色模式；
- 内容缩放模式；
- 符号比例等级。

这意味着不能把 iOS 上的所有视觉效果直接视为 Android/Web 上也能生效。

### 类型章节与属性平台标记存在差异

部分类型被标记为 Android、iOS、tvOS 和 Web 均支持，但使用这些类型的具体组件属性又标记为 iOS 专用。

这是阅读 API 文档时需要区分的两层信息：

- 类型可以被公共 TypeScript API 声明或复用；
- 具体组件属性是否生效，取决于属性自己的平台支持说明。

### 文档未涉及的内容

当前文档未涉及：

- 图标无障碍标签的具体配置方式；
- 自定义 Material Symbols 字体加载；
- 图标缓存策略；
- 服务端渲染行为；
- 图标在不同操作系统版本上的兼容范围；
- 性能基准或大量图标同时渲染的影响；
- 原生工程构建配置细节；
- 测试方法和错误处理策略。

这些内容不能仅根据本页文档作出确定结论。

## React Web 开发者需要特别注意的地方

1. `SymbolView` 不是 DOM 元素，也不是 `<img>` 或 `<svg>`，它遵循 React Native 组件和布局规则。
2. 不存在一个能自动覆盖所有平台的统一图标名称。跨平台映射需要显式维护。
3. `style` 控制组件布局，`size` 控制符号尺寸，两者可能需要同时设置。
4. iOS 的 SF Symbols 功能更丰富，高级效果不能默认在 Android/Web 上等价实现。
5. Android 字重不是简单字符串，需要导入专用对象。
6. 原生 API 可能只接受图片源，不能接收 React 元素；此时需要使用异步图片源方法。
7. “Web 支持”表示该 Expo 组件可以在 Web 目标上使用 Material Symbols，不代表其行为与浏览器中的任意图标库完全相同。

## 实际开发建议

> 以下内容为基于文档内容推导或经验性建议，不是原文逐条规定。

### 集中维护图标映射

基于文档内容推导，建议建立统一的业务图标表：

```ts
export const appSymbols = {
  info: {
    ios: 'info.circle',
    android: 'info',
    web: 'info',
  },
  home: {
    ios: 'house.fill',
    android: 'home',
    web: 'home',
  },
};
```

业务组件只引用 `appSymbols.info`，避免在多个页面重复维护平台名称。

### 为缺失情况提供 fallback

基于文档内容推导，对关键操作图标应准备 fallback，避免某个平台因为名称缺失而完全不显示操作入口。

### 将高级效果视为渐进增强

基于经验建议，可以让基础图标在所有平台正常显示，再在 iOS 上增加 `type`、`colors` 和 `animationSpec`。不要让核心交互依赖仅 iOS 支持的动画或颜色模式。

### 升级时重点检查 Beta API

基于经验建议，升级 Expo SDK 后应运行跨平台验证，至少检查：

- iOS 图标是否存在；
- Android/Web 的 Material Symbol 名称是否有效；
- 字重是否正常；
- fallback 是否触发；
- 使用 `unstable_getMaterialSymbolSourceAsync` 的标签栏等原生区域是否正常。

## 总结

`expo-symbols` 通过 `SymbolView` 为 Expo/React Native 应用提供系统原生符号能力。其核心使用方式是为 iOS、Android 和 Web 分别指定 SF Symbols 与 Material Symbols 名称。

基础尺寸和颜色可以跨平台配置，但符号模式、调色板、缩放和动画等高级能力主要面向 iOS。字符串形式的 `name` 也是 iOS 专用写法，跨平台应用应使用平台名称对象，并在必要时提供 `fallback`。

该库目前处于 Beta，本文档又对应下一版本 SDK，因此实际项目采用前必须核对所用 Expo SDK 的对应版本文档。

---

## 文档导航

- **上一页**：[storereview](./212__storereview.md)
- **下一页**：[system ui](./214__system-ui.md)
