# Expo GlassEffect 学习文档

## 文档解决的问题

`expo-glass-effect` 提供 React 组件，用于在 Expo / React Native 应用中渲染 iOS 原生的 Liquid Glass（液态玻璃）视觉效果。

它基于 Apple UIKit 的 `UIVisualEffectView`，主要解决以下问题：

- 在 React Native 中使用原生 iOS 玻璃效果。
- 配置玻璃样式、色调和明暗外观。
- 组合多个玻璃元素，使其产生相互影响和融合效果。
- 以原生方式动画切换玻璃样式。
- 判断当前系统、编译环境和运行时 API 是否支持玻璃效果。
- 规避 `opacity` 动画导致玻璃效果不渲染的问题。

> 本文对应 Expo 的“下一个 SDK 版本”文档，而不是当前稳定版文档。原文标明当前最新稳定文档为 SDK 56。使用前应确认项目所采用的 Expo SDK 版本是否包含这里介绍的 API。

## 适用平台与场景

包元数据显示该模块支持：

- iOS
- tvOS
- Expo Go

不过，具体组件和方法的平台支持范围并不完全相同，应以各 API 的说明为准。

典型使用场景包括：

- 图片或视频上方的半透明控制面板。
- 浮动工具栏、按钮组或卡片。
- 需要适配 iOS Liquid Glass 设计语言的界面。
- 多个玻璃元素靠近时需要融合效果的布局。
- 应用内部拥有独立主题切换，需要覆盖系统明暗模式。
- 需要动画显示、隐藏或切换玻璃效果。

### 最重要的平台限制

`GlassView` 只在 **iOS 26 及以上版本**提供玻璃效果。在不支持的平台上，它会回退为普通的 React Native `View`。

这意味着：

- 应用通常不会仅因为系统不支持玻璃效果而无法渲染该组件。
- 回退后的 `View` 不会拥有原生玻璃视觉效果。
- 不应让核心功能依赖玻璃效果本身。
- Android 等不支持平台需要接受普通视图，或者由应用自行提供替代样式。

后两点属于**基于文档内容推导**。

## React Web 开发者需要了解的背景

### React Native 的 `View`

`View` 可以大致理解为 React Web 中的 `div`，是 React Native 最基础的布局容器。

但它不是 DOM 元素：

- 样式通过 JavaScript 对象传递。
- 不使用普通 CSS 文件和 CSS 选择器。
- 最终会映射到 iOS、Android 等平台的原生视图。

`GlassView` 和 `GlassContainer` 都继承了 React Native 的 `ViewProps`，因此可以接收常见的布局、事件和无障碍属性。

### `StyleSheet`

```tsx
const styles = StyleSheet.create({
  glassView: {
    width: 200,
    height: 100,
    borderRadius: 12,
  },
});
```

`StyleSheet.create` 用于声明 React Native 样式。虽然写法接近 React Web 的行内样式，但属性和值遵循 React Native 规则。

例如：

- 数字尺寸通常不写 `px`。
- `borderRadius: 12` 不是字符串 `"12px"`。
- Flexbox 是 React Native 的主要布局方式。
- `StyleSheet.absoluteFill` 是用于绝对铺满父容器的预定义样式。

### 原生组件与 Expo 模块

`expo-glass-effect` 不只是使用 JavaScript 模拟模糊效果。它调用了 iOS 原生的 `UIVisualEffectView`。

因此其可用性不仅取决于 React 组件是否成功导入，还可能取决于：

- iOS 系统版本。
- 应用编译时所用的工具链。
- 原生工程的 `Info.plist` 配置。
- 设备运行时是否实际提供相关 API。
- 用户的无障碍设置。

这与 React Web 中主要检查浏览器 API 是否存在的模式有所不同。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-glass-effect

# yarn
yarn expo install expo-glass-effect

# pnpm
pnpm expo install expo-glass-effect

# bun
bun expo install expo-glass-effect
```

`expo install` 会根据项目的 Expo SDK 版本选择兼容的依赖版本。它不是简单等同于安装 npm 上的任意最新版本。

如果项目是已有的普通 React Native 原生工程，还必须先按照 Expo 文档安装 `expo` 和 Expo Modules 支持，否则不能直接使用这个包。

文档没有涉及以下内容：

- 原生 iOS 工程的手动链接步骤。
- Android 的替代实现。
- EAS Build 或本地原生构建的详细配置。
- `Info.plist` 需要如何手动修改。

## 基础用法：`GlassView`

导入组件：

```tsx
import { GlassView } from 'expo-glass-effect';
```

基本结构如下：

```tsx
<View style={styles.container}>
  <Image style={styles.backgroundImage} source={{ uri: imageUrl }} />

  <GlassView style={styles.glassView} />

  <GlassView
    style={styles.tintedGlassView}
    glassEffectStyle="clear"
  />
</View>
```

`GlassView` 会在其所在区域渲染原生玻璃效果。原文示例先放置一张背景图片，再将玻璃视图以绝对定位方式覆盖在图片上。

玻璃效果需要对下层视觉内容进行处理。因此，将它放在图片、渐变或其他有明显细节的内容上，更容易观察效果。这个结论属于**基于文档内容推导**。

### `GlassView` 属性

#### `glassEffectStyle`

类型：

```ts
GlassStyle | GlassEffectStyleConfig
```

默认值：

```ts
'regular'
```

可以直接传入字符串：

```tsx
<GlassView glassEffectStyle="regular" />
<GlassView glassEffectStyle="clear" />
<GlassView glassEffectStyle="none" />
```

支持的样式为：

| 值 | 含义 |
| --- | --- |
| `'regular'` | 常规玻璃效果，也是默认值 |
| `'clear'` | 清透样式 |
| `'none'` | 不应用玻璃效果 |

文档没有进一步说明 `regular` 与 `clear` 在视觉参数上的具体差异。

也可以传入配置对象：

```tsx
<GlassView
  glassEffectStyle={{
    style: 'clear',
    animate: true,
    animationDuration: 0.5,
  }}
/>
```

配置字段如下：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `style` | `GlassStyle` | 是 | 要应用的玻璃样式 |
| `animate` | `boolean` | 否 | 是否为样式变化添加动画，默认 `false` |
| `animationDuration` | `number` | 否 | 动画持续时间，单位为秒；未设置时使用系统默认值 |

注意 `animationDuration: 0.5` 表示 **0.5 秒**，不是 Web 动画中常见的 500 毫秒。

#### `tintColor`

```tsx
<GlassView tintColor="#007AFF" />
```

类型为 `string`，用于为玻璃效果设置色调颜色。

文档没有明确列出支持的颜色格式，也没有说明不同玻璃样式下色调的具体混合规则。

#### `colorScheme`

```tsx
<GlassView colorScheme="auto" />
```

支持：

```ts
'auto' | 'light' | 'dark'
```

默认值为 `'auto'`。

该属性控制玻璃效果的明暗外观。当应用拥有自己的主题切换机制时，可以用它覆盖系统外观：

```tsx
<GlassView colorScheme={appTheme === 'dark' ? 'dark' : 'light'} />
```

React Web 开发者可以把它理解为组件级的明暗模式选择，但它控制的是原生玻璃效果，而不是浏览器的 `color-scheme` CSS 属性。

#### `isInteractive`

```tsx
<GlassView isInteractive />
```

类型为 `boolean`，默认值为 `false`，用于决定玻璃效果是否具有交互性。

原文没有进一步说明“交互性”包含哪些具体视觉反馈或手势行为，因此不应假设它等同于 React Native 的点击事件。需要处理点击时，仍应使用 `Pressable` 等交互组件或对应的 `ViewProps`。

#### `ref`

类型为：

```ts
Ref<View>
```

可通过 React ref 获取底层视图引用。

## 组合玻璃元素：`GlassContainer`

`GlassContainer` 用于组合多个 `GlassView`，使它们形成统一的玻璃效果：

```tsx
import {
  GlassContainer,
  GlassView,
} from 'expo-glass-effect';

<GlassContainer spacing={10} style={styles.containerStyle}>
  <GlassView style={styles.glass1} isInteractive />
  <GlassView style={styles.glass2} />
  <GlassView style={styles.glass3} />
</GlassContainer>
```

它支持 iOS 和 tvOS，并继承 `ViewProps`。

### `spacing`

```tsx
<GlassContainer spacing={10}>
  {/* GlassView 子元素 */}
</GlassContainer>
```

类型为 `number`，默认值是 `undefined`。

`spacing` 表示玻璃元素从多远的距离开始相互影响，控制它们何时开始融合。

它不是普通 Flexbox 的子元素间距。原文示例同时使用了：

```tsx
<GlassContainer spacing={10} style={{ gap: 5 }}>
```

两者作用不同：

- `gap` 控制布局中子元素的实际间距。
- `spacing` 控制玻璃效果开始相互影响的距离。

不要把 `spacing` 当成 Web CSS 的 `gap`。

### `ref`

与 `GlassView` 一样，类型为：

```ts
Ref<View>
```

## 动画切换玻璃样式

文档推荐通过 `glassEffectStyle` 配置对象中的 `animate` 和 `animationDuration` 动画切换玻璃样式：

```tsx
const [visible, setVisible] = useState(true);

<GlassView
  style={styles.glassView}
  glassEffectStyle={{
    style: visible ? 'clear' : 'none',
    animate: true,
    animationDuration: 0.5,
  }}
/>
```

这里的显示和隐藏不是卸载组件，也不是把整个视图透明度改为零，而是在 `'clear'` 和 `'none'` 之间切换原生玻璃样式。

推荐流程是：

1. 保留 `GlassView`。
2. 用状态决定 `style` 是目标玻璃样式还是 `'none'`。
3. 设置 `animate: true`。
4. 根据需要通过 `animationDuration` 指定动画秒数。

这是文档推荐的淡入、淡出玻璃效果方式。

## `opacity` 的已知问题

文档明确指出：

> 对 `GlassView` 或它任意父视图设置 `opacity: 0`，会导致玻璃效果完全不渲染。

因此，下面这种 React Web 中很常见的做法可能失效：

```tsx
<View style={{ opacity: visible ? 1 : 0 }}>
  <GlassView />
</View>
```

问题不仅限于 `GlassView` 自身。只要祖先视图的透明度变成零，也可能触发该行为。

### 首选方案

使用组件提供的原生样式动画：

```tsx
glassEffectStyle={{
  style: visible ? 'regular' : 'none',
  animate: true,
  animationDuration: 0.5,
}}
```

### 必须使用 `opacity` 时的规避方案

文档给出的方案需要 `react-native-reanimated`：

1. 使用共享值保存透明度。
2. 让外层 `Animated.View` 执行透明度动画。
3. 同时根据透明度，把 `GlassView` 的样式在 `'regular'` 和 `'none'` 之间切换。
4. 在透明度接近零时主动禁用玻璃效果。

核心逻辑如下：

```tsx
const fadeOpacity = useSharedValue(0);

const glassViewProps = useAnimatedProps(() => {
  const glassEffectStyle =
    fadeOpacity.value > 0.01 ? 'regular' : 'none';

  return {
    glassEffectStyle,
  };
});

const fadeOpacityStyle = useAnimatedStyle(() => ({
  opacity: fadeOpacity.value,
}));
```

启动动画：

```tsx
fadeOpacity.value = withTiming(
  fadeOpacity.value > 0.5 ? 0 : 1,
  { duration: 500 }
);
```

这里存在两个不同的时间单位：

- `glassEffectStyle.animationDuration` 使用秒。
- Reanimated 的 `withTiming({ duration })` 使用毫秒。

文档的规避示例标注为 **iOS 26.1+**。原文没有解释该方案在 iOS 26.0 上的具体表现，因此不能据此断言它适用于所有 iOS 26 版本。

## 可用性检查

该模块提供两个名称相近但检查目标不同的函数。

### `isGlassEffectAPIAvailable()`

```tsx
import {
  isGlassEffectAPIAvailable,
} from 'expo-glass-effect';

const apiAvailable = isGlassEffectAPIAvailable();
```

支持平台：iOS。

它检查当前设备运行时是否存在 Liquid Glass API。

某些 iOS 26 Beta 版本没有该 API，直接使用 `GlassView` 或 `GlassContainer` 可能导致崩溃。因此，文档要求在使用这些组件前执行检查。

推荐的条件渲染方式：

```tsx
return isGlassEffectAPIAvailable() ? (
  <GlassView style={styles.glass} />
) : (
  <View style={styles.fallback} />
);
```

这类似于 Web 开发中的特性检测，但检测的是设备上的原生 API。

### `isLiquidGlassAvailable()`

```tsx
import {
  isLiquidGlassAvailable,
} from 'expo-glass-effect';

const liquidGlassAvailable = isLiquidGlassAvailable();
```

支持平台：iOS、tvOS。

该函数判断当前编译出的应用中是否提供 Liquid Glass 组件。文档说明它会涉及：

- 系统版本。
- 编译器版本。
- `Info.plist` 设置。

它只检查组件可用性，不保证用户最终能看到完整的玻璃视觉效果。

即使返回 `true`，用户也可能启用了限制 Liquid Glass 效果的无障碍设置。

### 两个检查不能相互替代

| 函数 | 检查目标 | 主要用途 |
| --- | --- | --- |
| `isGlassEffectAPIAvailable()` | 设备运行时是否存在原生 API | 避免部分 iOS 26 Beta 系统发生崩溃 |
| `isLiquidGlassAvailable()` | 编译后的应用是否包含并可使用 Liquid Glass 组件 | 判断应用构建和系统环境是否支持该设计 |

**基于文档内容推导**：稳妥的组件渲染条件应同时关注应用中的组件可用性和设备运行时 API 可用性，而不是只检查其中一个。

例如：

```tsx
const canRenderGlass =
  isLiquidGlassAvailable() &&
  isGlassEffectAPIAvailable();
```

需要注意，`isGlassEffectAPIAvailable()` 只标记支持 iOS。如果代码同时面向 tvOS，应按平台设计判断逻辑，不能直接假设两个函数在所有平台上的行为一致。

## 无障碍设置：降低透明度

用户可能在 iOS 中启用减少透明效果的无障碍设置。此时：

```tsx
isLiquidGlassAvailable()
```

仍可能返回 `true`，因为它只表示组件可用，并不表示用户允许完整显示玻璃效果。

要检查用户是否启用了降低透明度，应使用 React Native 的：

```tsx
AccessibilityInfo.isReduceTransparencyEnabled()
```

因此需要区分：

- **技术上可用**：组件和 API 存在。
- **用户视觉偏好允许**：用户没有要求减少透明效果。

**基于文档内容推导**：应用的替代样式应保持足够的文字对比度和信息可读性，不能把半透明效果作为理解界面的必要条件。

## API 总览

统一导入方式：

```tsx
import {
  GlassView,
  GlassContainer,
  isLiquidGlassAvailable,
  isGlassEffectAPIAvailable,
} from 'expo-glass-effect';
```

### 组件

| API | 平台 | 作用 |
| --- | --- | --- |
| `GlassView` | iOS、tvOS | 渲染单个原生玻璃视图 |
| `GlassContainer` | iOS、tvOS | 组合多个玻璃视图并控制其融合距离 |

### 方法

| API | 平台 | 返回值 | 作用 |
| --- | --- | --- | --- |
| `isGlassEffectAPIAvailable()` | iOS | `boolean` | 检查设备运行时 API |
| `isLiquidGlassAvailable()` | iOS、tvOS | `boolean` | 检查应用中的 Liquid Glass 组件可用性 |

### 类型

```ts
type GlassColorScheme = 'auto' | 'light' | 'dark';

type GlassStyle = 'clear' | 'regular' | 'none';

type GlassEffectStyleConfig = {
  style: GlassStyle;
  animate?: boolean;
  animationDuration?: number;
};
```

## 实际开发中的推荐使用流程

以下流程部分属于文档明确要求，部分属于**基于文档内容推导**：

1. 使用 `expo install` 安装与当前 Expo SDK 兼容的模块版本。
2. 如果是已有 React Native 原生项目，先完成 Expo Modules 的安装。
3. 在渲染玻璃组件前检查运行时 API，避免部分 iOS 26 Beta 版本崩溃。
4. 根据业务需要检查 `isLiquidGlassAvailable()`。
5. 为不支持玻璃效果的情况准备普通 `View` 替代界面。
6. 显示或隐藏效果时，优先在玻璃样式与 `'none'` 之间切换。
7. 不要直接让 `GlassView` 或其父视图的 `opacity` 变为零。
8. 必须使用透明度动画时，采用文档中的 Reanimated 组合方案。
9. 检查降低透明度的无障碍设置，并保证替代界面可读。
10. 在真实 iOS 设备和实际支持版本上测试原生视觉效果。

第 5、9、10 点属于**基于文档内容推导**。

## React Web 开发者容易误解的地方

### 回退为 `View` 不代表视觉完全一致

组件在不支持的平台上虽然可以回退为普通 `View`，但原生玻璃效果不会自动被 CSS 或其他跨平台样式模拟。

### `spacing` 不是布局间距

`GlassContainer.spacing` 控制玻璃元素开始相互影响的距离。实际布局间距仍应通过 `gap`、`margin` 等样式控制。

### `isInteractive` 不等于 `onClick`

它描述的是玻璃效果是否交互，并不意味着组件自动获得完整的按钮语义。需要按钮行为时仍应考虑 `Pressable`、事件处理和无障碍属性。

### 不能照搬 Web 的透明度动画

Web 中常见的 `opacity: 0` 淡出方案可能导致原生 `UIVisualEffectView` 不渲染。应优先使用模块提供的样式动画。

### API 检查不等于版本字符串判断

文档提供的是能力检查函数。与手动判断“是不是 iOS 26”相比，能力检查还能覆盖编译环境、配置以及部分 Beta 系统缺少 API 的情况。

### `isLiquidGlassAvailable()` 不代表实际视觉效果未被削弱

它只检查组件是否可用。用户的降低透明度设置需要通过 `AccessibilityInfo` 另行检查。

## 明确限制与未涉及内容

文档明确说明的限制包括：

- `GlassView` 仅在 iOS 26 及以上提供玻璃效果。
- 不支持的平台回退为普通 `View`。
- 某些 iOS 26 Beta 版本缺少运行时 API，可能造成崩溃。
- `opacity: 0` 会使玻璃效果不渲染。
- `isLiquidGlassAvailable()` 不检查用户是否启用了降低透明度。
- 透明度动画规避示例标注为 iOS 26.1+。

当前文档未涉及：

- Android 玻璃效果的实现方案。
- 各种玻璃样式的精确视觉规范。
- `isInteractive` 的具体反馈行为。
- 性能消耗和同时渲染数量限制。
- 服务端渲染或 React Native Web 支持。
- 单元测试和端到端测试方法。
- 原生 `Info.plist` 的具体配置步骤。
- `react-native-reanimated` 的安装和原生配置流程。
- tvOS 上的详细交互和视觉差异。

## 总结

`expo-glass-effect` 将 iOS 原生 Liquid Glass 能力包装为 React Native 组件。单个效果使用 `GlassView`，多个需要相互融合的元素使用 `GlassContainer`。

开发中最关键的不是基础渲染代码，而是兼容性处理：

- iOS 26 以下没有原生玻璃效果。
- 部分 iOS 26 Beta 版本需要运行时 API 检查。
- `opacity: 0` 会破坏玻璃效果渲染。
- 显隐动画应优先切换 `glassEffectStyle`。
- 组件可用不代表用户没有启用降低透明度。
- 不支持时必须允许界面以普通 `View` 正常工作。

---

## 文档导航

- **上一页**：[font](./172__font.md)
- **下一页**：[gl view](./174__gl-view.md)
