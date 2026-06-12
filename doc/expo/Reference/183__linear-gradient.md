# Expo LinearGradient 学习文档

`expo-linear-gradient` 提供一个跨平台 React 组件，用于在视图中渲染沿直线方向变化的多色渐变。

支持平台：

- Android
- iOS
- tvOS
- Web
- Expo Go

> 本文原始页面属于“下一版本 SDK”的未发布文档。原文提示：当前最新稳定文档对应 Expo SDK 56。实际项目应优先查阅与项目 Expo SDK 版本匹配的文档。

## 文档解决的问题

在 React Web 中，通常可以直接使用 CSS 创建渐变：

```css
background: linear-gradient(to right, red, blue);
```

React Native 的样式系统并不等同于浏览器 CSS。`expo-linear-gradient` 提供了一个 React Native 组件，让开发者可以通过属性指定：

- 参与渐变的颜色
- 每种颜色出现的位置
- 渐变的起点和终点
- Android 上的颜色抖动策略

它适合以下场景：

- 渐变按钮
- 页面顶部或底部的渐变遮罩
- 卡片、容器或页面背景
- 图片上的透明度渐变覆盖层
- 需要同时运行于 Android、iOS、tvOS 和 Web 的渐变 UI

如果只需要纯色背景，不应使用渐变组件，直接设置 `View` 的 `style.backgroundColor` 即可。

## React Web 开发者需要了解的背景

### `LinearGradient` 是组件，不是 CSS 样式值

`LinearGradient` 的使用方式更接近一个负责绘制背景的容器组件：

```tsx
<LinearGradient colors={['red', 'blue']}>
  <Text>内容</Text>
</LinearGradient>
```

它既可以：

- 作为没有子元素的背景图层
- 作为包含文本或其他组件的容器

这与 Web 中给普通元素添加 `background-image: linear-gradient(...)` 的思路不同。

### React Native 样式不是完整 CSS

示例使用 `StyleSheet.create()` 创建样式：

```tsx
const styles = StyleSheet.create({
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
});
```

这些样式通过 JavaScript 对象描述。虽然部分属性名称与 CSS 相似，但不能假设所有 CSS 属性或语法都可以直接使用。

### 原生视图的含义

文档将 `LinearGradient` 描述为一个原生 React 视图。在 Android、iOS 等原生平台上，它最终会映射到相应的平台视图和绘制能力，而不是浏览器 DOM 元素。

在 Expo Go 中，该模块已经包含，因此使用兼容的 Expo 项目时可以直接安装并运行，不需要手动修改 iOS 或 Android 原生代码。

## 安装

根据项目使用的包管理器执行对应命令。

### npm

```sh
npx expo install expo-linear-gradient
```

### Yarn

```sh
yarn expo install expo-linear-gradient
```

### pnpm

```sh
pnpm expo install expo-linear-gradient
```

### Bun

```sh
bun expo install expo-linear-gradient
```

这里使用的是 `expo install`，而不是普通的 `npm install`。它负责为当前 Expo SDK 选择兼容的软件包版本。

如果是在已有的裸 React Native 项目中安装该模块，必须先在项目中安装并配置 Expo Modules，也就是原文所说的先安装 `expo`。

> 裸 React Native 项目是指项目直接包含并管理 Android、iOS 原生工程，而不是完全由 Expo 托管。当前文档没有展开 Expo Modules 的具体安装步骤，需要参考其链接指向的独立文档。

当前文档未涉及：

- iOS CocoaPods 的具体处理方式
- Android Gradle 配置
- Expo 项目的创建流程
- 具体 SDK 兼容版本表

## 基本用法

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.background}
      />

      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.button}
      >
        <Text style={styles.text}>Sign in with Facebook</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#fff',
  },
});
```

这个示例展示了两种典型用途。

### 作为独立背景层

```tsx
<LinearGradient
  colors={['rgba(0,0,0,0.8)', 'transparent']}
  style={styles.background}
/>
```

该组件没有子元素，并通过绝对定位覆盖父容器顶部的 300 个布局单位。颜色从半透明黑色过渡到完全透明，因此下方的橙色背景会逐渐显现。

React Web 开发者可以将它理解为一个绝对定位的渐变覆盖层。

### 作为内容容器

```tsx
<LinearGradient
  colors={['#4c669f', '#3b5998', '#192f6a']}
  style={styles.button}
>
  <Text style={styles.text}>Sign in with Facebook</Text>
</LinearGradient>
```

这里的渐变组件直接包含文本，并通过内边距、圆角和对齐样式表现为按钮。

需要注意，示例只是视觉上将其设计成按钮。文档没有说明它自动具备点击行为、无障碍按钮语义或按压反馈。实际需要交互时，应结合 React Native 的按压组件处理。

## API 导入

```tsx
import { LinearGradient } from 'expo-linear-gradient';
```

`LinearGradient` 是一个 React 组件，并继承 React Native `View` 的属性。因此，除了本文列出的渐变专属属性，还可以向它传入适用的 `ViewProps`，例如 `style`。

## `LinearGradient` 属性

### `colors`

```tsx
<LinearGradient colors={['#ff0000', '#0000ff']} />
```

`colors` 是必填属性，表示渐变中的颜色节点。它至少需要包含两个颜色。

类型可以概括为：

```ts
readonly [ColorValue, ColorValue, ...ColorValue[]]
```

这表示数组中必须有前两个颜色，之后可以继续添加任意数量的颜色。

```tsx
colors={['red', 'yellow', 'blue']}
```

如果只需要单一颜色，应使用普通 `View`：

```tsx
<View style={{ backgroundColor: 'red' }} />
```

#### TypeScript 注意事项

为了让 TypeScript 确认数组至少有两个元素，文档建议：

1. 直接内联数组：

```tsx
<LinearGradient colors={['red', 'blue']} />
```

2. 或者将变量声明为只读元组：

```tsx
const gradientColors = ['red', 'blue'] as const;

<LinearGradient colors={gradientColors} />
```

普通变量可能被推断为长度不确定的 `string[]`：

```tsx
const gradientColors = ['red', 'blue'];
```

即使运行时确实有两个值，TypeScript 也无法从 `string[]` 类型保证它始终至少包含两个元素，因此可能出现类型错误。

### `locations`

`locations` 用于精确控制每种颜色在渐变轴上的位置。

```tsx
<LinearGradient
  colors={['red', 'blue']}
  locations={[0.5, 0.8]}
/>
```

规则如下：

- 每个值必须在 `0` 到 `1` 之间，包括 `0` 和 `1`
- 数组长度必须与 `colors` 相同
- 数值必须按从小到大的顺序排列
- 未指定时，各颜色会均匀分布

对于以下配置：

```tsx
colors={['red', 'blue']}
locations={[0.5, 0.8]}
```

渲染结果是：

- 从渐变起点到 50%：保持第一种颜色
- 从 50% 到 80%：由第一种颜色渐变到第二种颜色
- 从 80% 到终点：保持第二种颜色

因此，`locations` 不是颜色所占比例，而是每个颜色节点在完整渐变轴上的位置。

错误示例：

```tsx
locations={[0.8, 0.5]}
```

该数组不是升序，不符合文档要求。

```tsx
colors={['red', 'yellow', 'blue']}
locations={[0, 1]}
```

颜色与位置数量不一致，同样不符合要求。

### `start`

`start` 指定渐变的起点，可以使用对象或元组：

```tsx
start={{ x: 0, y: 0 }}
```

```tsx
start={[0, 0]}
```

坐标采用相对于组件整体尺寸的比例值，`x` 和 `y` 都应位于 `0` 到 `1` 之间。

原文示例：

```tsx
start={{ x: 0.1, y: 0.2 }}
```

表示起点位于距离左侧 10%、距离顶部 20% 的位置。

### `end`

`end` 指定渐变的终点，同样接受对象或元组：

```tsx
end={{ x: 1, y: 1 }}
```

```tsx
end={[1, 1]}
```

原文示例：

```tsx
end={{ x: 0.1, y: 0.2 }}
```

文档将其描述为距离左侧 10%、距离底部 20% 的位置。本文保留这一原文表述，不进一步推断其与 `start` 坐标描述之间的差异。

### 使用起点和终点控制方向

```tsx
<LinearGradient
  colors={['red', 'blue']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
/>
```

**基于文档内容推导：** 起点和终点定义了一条渐变轴。上面的配置从组件左侧指向右侧，因此形成水平方向的渐变。

```tsx
<LinearGradient
  colors={['red', 'blue']}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
/>
```

**基于文档内容推导：** 该配置形成从上到下的垂直渐变。

#### Web 平台限制

在 Web 上，`start` 和 `end` 只能改变渐变角度，不能真正修改渐变起点或终点的位置。

原因是 Web 端底层使用的 CSS 渐变不支持按照该组件的坐标模型任意移动起止位置。

这意味着相同配置在原生平台与 Web 平台上可能具有不同的精细定位效果。开发跨平台界面时，不应只在浏览器中检查结果。

### `dither`

```tsx
<LinearGradient dither={false} colors={['#000', '#222']} />
```

该属性：

- 仅支持 Android
- 类型为 `boolean`
- 默认值为 `true`

颜色抖动可以减少渐变中的色带问题。所谓色带，是指本应平滑变化的颜色呈现出一层层明显分界。

将其设置为 `false` 可能改善渐变渲染性能，但也可能让色带更明显。因此，这是画质与性能之间的权衡。

文档没有提供具体性能数据，也没有要求开发者默认关闭它。没有明确性能问题时，可以保留默认值。

## 坐标类型

### `LinearGradientPoint`

渐变起点和终点可以写成对象：

```ts
{
  x: number;
  y: number;
}
```

也可以写成数组元组：

```ts
[x, y]
```

两个值都表示相对于渐变组件整体尺寸的比例，范围为 `0` 到 `1`。

例如：

```tsx
{ x: 0.5, y: 0.5 }
```

表示组件尺寸中的中间位置，而不是 `0.5px`。

### `NativeLinearGradientPoint`

其类型为：

```ts
[x: number, y: number]
```

这是 `LinearGradientPoint` 接受的元组形式。

对于 React Web 开发者，最容易误解的是这些值不是 CSS 像素、百分数字符串或页面绝对坐标。不要写成：

```tsx
start={{ x: '10%', y: '20%' }}
```

应使用数值比例：

```tsx
start={{ x: 0.1, y: 0.2 }}
```

## React Native 自带渐变能力

原文指出，React Native 的 `View` 还提供了另一种方案：

- Android 和 iOS：`experimental_backgroundImage`
- Web：`backgroundImage`

这些样式属性支持类似 CSS 的渐变语法，包括：

- `linear-gradient()`
- `radial-gradient()`

这种方案可能不需要额外安装 `expo-linear-gradient`。

不过，Android 和 iOS 上对应的属性仍属于实验能力。遇到问题时，原文建议向 React Native 项目报告。

选择时可以考虑：

| 方案 | 特点 |
| --- | --- |
| `expo-linear-gradient` | 独立组件，支持 Android、iOS、tvOS 和 Web，具有明确的跨平台属性 API |
| React Native `backgroundImage` 相关样式 | 使用接近 CSS 的渐变语法，可能不需要额外依赖，但原生平台能力仍处于实验状态 |

文档只说明两者都可以用于渐变背景，没有给出迁移规则、性能对比或优先级结论。

## 容易踩坑的地方

### `colors` 至少包含两个值

即使希望显示单色，也不能只传一个颜色。单色应使用 `backgroundColor`。

### 变量形式的颜色数组可能无法通过 TypeScript 检查

需要内联传递，或者通过 `as const` 保留元组类型。

### `locations` 必须与 `colors` 一一对应

颜色数量与位置数量不一致不符合 API 要求，而且所有位置必须是 `0` 到 `1` 范围内的升序值。

### Web 端起止点能力有限

Web 上的 `start` 和 `end` 只影响角度。依赖精确起止位置的视觉效果必须进行跨平台验证。

### Android 的 `dither` 不是通用属性

它只影响 Android。关闭后可能提高性能，也可能增加色带，不能将其当作所有平台通用的性能开关。

### 渐变组件不等于交互组件

将 `LinearGradient` 做成按钮外观，并不会自动获得点击处理、键盘操作、按压反馈或无障碍语义。

**基于文档内容推导：** 实际按钮通常需要与 React Native 的按压组件组合，而不是只依赖 `LinearGradient`。

### 未发布版本文档可能发生变化

当前页面对应下一 SDK 版本，并非稳定版本页面。API 在正式发布前存在变化可能。

**基于经验建议：** 安装和开发时，应核对项目所使用的 Expo SDK，并阅读对应版本的文档，避免直接按照未发布版本页面修改生产项目。

## 实际开发中的使用方式

### 简单背景

只需要均匀分布的颜色时，传入 `colors` 即可：

```tsx
<LinearGradient
  colors={['#4c669f', '#192f6a']}
  style={{ flex: 1 }}
>
  <Text>页面内容</Text>
</LinearGradient>
```

### 自定义方向

通过 `start` 和 `end` 设置渐变轴：

```tsx
<LinearGradient
  colors={['#ff8a00', '#e52e71']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{ padding: 16, borderRadius: 8 }}
>
  <Text style={{ color: '#fff' }}>渐变内容</Text>
</LinearGradient>
```

### 控制颜色节点

```tsx
<LinearGradient
  colors={['#000', '#666', '#fff']}
  locations={[0, 0.3, 1]}
  style={{ height: 200 }}
/>
```

这里第二种颜色出现在渐变轴 30% 的位置，而不是默认的中间位置。

**基于经验建议：**

- 将复用的颜色数组声明为 `as const`，同时满足 TypeScript 类型要求。
- 对设计要求严格的渐变，同时在 Android、iOS 和 Web 上进行视觉检查。
- 只有确认 Android 渐变造成性能问题时，才考虑关闭 `dither`。
- 需要点击交互时，让专门的按压组件负责行为和无障碍语义，让 `LinearGradient` 负责视觉效果。

## 文档未涉及的内容

当前文档没有说明：

- 渐变动画的实现方式
- 径向渐变或圆锥渐变的组件 API
- 图片与渐变的混合模式
- 渐变的无障碍要求
- 大面积渐变的性能基准
- `LinearGradient` 与按压组件的具体组合代码
- 自动化测试渐变效果的方法
- Expo SDK 各版本的详细兼容范围
- 裸 React Native 项目的完整原生配置过程

这些问题需要参考其他文档，不能从当前页面直接得出确定结论。

## 信息性质说明

### 文档明确说明

- `expo-linear-gradient` 渲染线性多色渐变视图。
- 支持 Android、iOS、tvOS 和 Web，并包含在 Expo Go 中。
- `colors` 至少需要两个颜色。
- `locations` 必须与颜色数量一致，范围为 `0` 到 `1`，并按升序排列。
- `start` 和 `end` 使用相对尺寸坐标。
- Web 上的起点和终点配置只能改变渐变角度。
- `dither` 仅支持 Android，默认开启。
- 关闭颜色抖动可能提高性能，但可能影响色带表现。
- React Native 还提供实验性的渐变背景样式作为替代方案。
- 已有裸 React Native 项目需要先安装 Expo Modules。

### 基于文档内容推导

- `start` 和 `end` 共同定义渐变方向。
- 横向或纵向排列起止点，可以得到相应方向的渐变。
- 只在 Web 上验证，可能无法发现原生平台的定位差异。
- 示例中的渐变“按钮”只提供视觉结构，本身不代表完整交互组件。

## 总结

`expo-linear-gradient` 将线性渐变封装成了一个跨平台 React 组件。使用时最重要的是理解四组属性：

- `colors`：定义参与渐变的颜色，至少两个
- `locations`：定义各颜色节点的位置
- `start`、`end`：定义渐变方向和原生平台上的起止位置
- `dither`：控制 Android 的颜色抖动策略

对于 React Web 开发者，核心思维变化是：渐变不再只是普通元素上的一条 CSS 声明，而是一个可以参与 React Native 布局、包含子元素并接收 `ViewProps` 的组件。同时必须注意 Web 与原生平台在起止点能力上的差异，并确保安装的包版本与项目 Expo SDK 匹配。

---

## 文档导航

- **上一页**：[light sensor](./182__light-sensor.md)
- **下一页**：[linking](./184__linking.md)
