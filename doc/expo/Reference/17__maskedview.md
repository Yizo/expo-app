# MaskedView：使用遮罩控制内容的可见区域

`MaskedView` 是 `@expo/ui` 提供的遮罩组件，其 API 与 `@react-native-masked-view/masked-view` 兼容。

它通过 `maskElement` 的透明度决定子内容的哪些部分可见：

- 遮罩中的不透明像素：显示后面的内容。
- 遮罩中的透明像素：隐藏后面的内容。
- 半透明像素：产生相应程度的半透明效果。

支持平台：

- Android
- iOS

Web 端目前没有真正实现遮罩功能。

## 文档解决的问题

这篇文档主要说明：

1. 如何安装 `@expo/ui`。
2. 如何通过 `MaskedView` 实现文字、形状或渐变遮罩。
3. 如何从 `@react-native-masked-view/masked-view` 迁移。
4. Android、iOS 和 Web 上的实现差异。
5. `MaskedView` 组件及其 Props 的用法。

适合以下场景：

- 让渐变、图片或其他视图只显示在文字轮廓内。
- 让内容沿某个方向逐渐消失。
- 用任意 React Native 元素的形状裁剪内容。
- 已经使用 `@react-native-masked-view/masked-view`，希望迁移到 Expo UI。
- 同时开发 Android 和 iOS，并希望使用统一的 React Native API。

## 阅读前需要理解的概念

### React Native 的 `View`

对于 React Web 开发者，可以把 React Native 的 `View` 大致理解为布局容器，作用类似 Web 中的 `div`。

但它最终不是普通 DOM 元素，而是由 React Native 映射到移动平台的原生视图系统。

### 遮罩与普通覆盖层的区别

普通覆盖层是在内容上方再绘制一个元素；遮罩则决定内容本身的哪些像素可以显示。

可以将遮罩想象为一张透明度模板：

```text
maskElement 不透明区域 -> 显示 children
maskElement 透明区域   -> 隐藏 children
```

决定结果的是遮罩的 **Alpha 通道**，即每个像素的透明程度，而不是它显示为红色、黑色还是其他颜色。

### `children` 与 `maskElement`

`MaskedView` 包含两个关键部分：

- `children`：被遮罩的实际内容。
- `maskElement`：控制内容可见范围的遮罩元素。

可以类比为：

```text
最终画面 = children × maskElement 的透明度
```

这里的“×”只是帮助理解，并非实际代码。

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

这些命令会安装包含 `MaskedView` 的 `@expo/ui` 包。

与常见的 `npm install` 相比，`expo install` 会按照当前 Expo 项目的依赖环境选择合适的软件包版本。在 Expo 项目中应优先使用文档给出的命令。

### 现有 React Native 项目的额外要求

如果项目不是以 Expo 项目开始，而是现有的 React Native 原生项目，需要先按照 Expo 的说明安装 `expo` 和 Expo Modules 支持，然后才能使用 `@expo/ui`。

这意味着安装 `@expo/ui` 本身不一定足够。现有 React Native 工程还需要具备运行 Expo 原生模块的基础设施。

文档没有展开说明具体原生配置步骤，需要参考其链接的“在现有 React Native 应用中安装 Expo Modules”文档。

## 基础用法：在文字中显示渐变

```tsx
import { MaskedView } from '@expo/ui/community/masked-view';
import { StyleSheet, Text, View } from 'react-native';

export default function MaskedViewExample() {
  return (
    <MaskedView
      style={{ width: 300, height: 80 }}
      maskElement={
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 64, fontWeight: 'bold' }}>
            EXPO
          </Text>
        </View>
      }>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            experimental_backgroundImage:
              'linear-gradient(135deg, #FF3B30, #FF9500, #FFCC00, #34C759, #007AFF, #AF52DE)',
          },
        ]}
      />
    </MaskedView>
  );
}
```

### 代码执行逻辑

`MaskedView` 的尺寸被设置为：

```tsx
style={{ width: 300, height: 80 }}
```

`maskElement` 中包含文字 `EXPO`。文字的不透明像素形成遮罩，所以只有文字轮廓对应的位置可以显示后面的内容。

`children` 是一个铺满 `MaskedView` 的渐变视图：

```tsx
StyleSheet.absoluteFill
```

因此最终看到的是填充了渐变颜色的 `EXPO` 文字，而不是普通文字颜色。

### `StyleSheet.absoluteFill`

对于 React Web 开发者，可以将它近似理解为：

```css
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
```

它让子视图铺满父级区域。

### `experimental_backgroundImage`

示例使用了：

```tsx
experimental_backgroundImage: 'linear-gradient(...)'
```

从命名可以看出，这是实验性样式属性。当前文档只将其用于示例，没有进一步说明：

- 具体支持哪些 React Native 或 Expo 版本。
- 是否适合生产环境。
- Android 与 iOS 是否存在显示差异。
- 未来 API 是否可能变化。

因此不能仅根据本页内容把它视为稳定的跨平台 API。`MaskedView` 的核心能力并不依赖必须使用该属性，`children` 也可以是其他 React Native 内容。

## Alpha 渐隐遮罩

`maskElement` 不仅可以使用文字或形状，也可以使用透明度渐变。

文档使用 `expo-linear-gradient` 创建从不透明到透明的遮罩：

```tsx
import { MaskedView } from '@expo/ui/community/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export default function AlphaFadeExample() {
  return (
    <MaskedView
      style={{
        width: 300,
        height: 80,
        flexDirection: 'row',
      }}
      maskElement={
        <LinearGradient
          colors={['black', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      }>
      <View style={{ flex: 1, backgroundColor: '#3D5A80' }} />
      <View style={{ flex: 1, backgroundColor: '#DAA520' }} />
      <View style={{ flex: 1, backgroundColor: '#E07A5F' }} />
    </MaskedView>
  );
}
```

### 渐隐过程

遮罩颜色配置为：

```tsx
colors={['black', 'transparent']}
```

这里使用黑色并不是因为黑色具有特殊的遮罩语义，而是因为 `'black'` 默认不透明。

真正起作用的是：

- `'black'` 的 Alpha 值是不透明。
- `'transparent'` 的 Alpha 值是完全透明。
- 两者之间由 `LinearGradient` 生成连续的透明度变化。

渐变方向为：

```tsx
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 0 }}
```

这表示渐变从左向右进行。因此，后面的三个色块会从左侧可见逐渐变为右侧不可见。

### 颜色不等于可见性

在这个遮罩中，把 `'black'` 换成其他完全不透明的颜色，原则上仍会显示内容，因为组件只关心 Alpha 通道。

对 React Web 开发者来说，这与某些图像编辑软件中“黑色隐藏、白色显示”的亮度遮罩不同。本组件使用的是透明度遮罩，不是颜色亮度遮罩。

## API

### 导入方式

```tsx
import { MaskedView } from '@expo/ui/community/masked-view';
```

需要注意：

- 它是具名导出，必须使用花括号。
- 导入路径是 `@expo/ui/community/masked-view`。
- 不是直接从 `@expo/ui` 根路径导入。

### `MaskedView`

类型：

```tsx
React.Element<MaskedViewProps>
```

支持：

- Android
- iOS

它会将 `maskElement` 的 Alpha 通道作为遮罩应用到 `children`。

组件兼容 `@react-native-masked-view/masked-view` 的 Props，但文档明确指出 `androidRenderingMode` 除外。

### `children`

类型：

```tsx
ReactNode
```

是否必填：否。

作用：作为被遮罩的内容，绘制在遮罩后面。

`children` 可以包含一个或多个 React Native 节点，例如：

- `View`
- `Text`
- 图片
- 渐变
- 多个组合视图

文档没有进一步列出复杂子元素的性能限制。

### `maskElement`

类型：

```tsx
ReactElement
```

是否必填：是。

作用：提供遮罩的像素透明度信息。

注意 `ReactElement` 与 `ReactNode` 的范围不同：`maskElement` 需要是一个实际的 React 元素，不能直接传普通字符串等更宽泛的节点类型。

### 继承的 `ViewProps`

`MaskedViewProps` 继承 React Native 的 `ViewProps`。

因此它可以使用常见的 View 属性，例如样式、布局和事件相关属性。不过本页没有逐项列出这些继承属性，应以 React Native 的 `ViewProps` 文档为准。

## 从旧组件迁移

### 修改导入语句

迁移前：

```tsx
import MaskedView from '@react-native-masked-view/masked-view';
```

迁移后：

```tsx
import { MaskedView } from '@expo/ui/community/masked-view';
```

这里同时发生了两个变化：

1. 包名和模块路径发生变化。
2. 默认导入变成具名导入。

只修改包名但继续使用默认导入，会导致导入方式错误。

### 不支持 `androidRenderingMode`

旧组件中的 `androidRenderingMode` Prop 在 Expo UI 实现中不受支持。

原因是 Expo UI 的 Android 实现始终使用离屏图形层，所以不存在需要调用者选择的对应模式。该属性也没有包含在公开 TypeScript 类型中。

迁移代码时应删除：

```tsx
androidRenderingMode={...}
```

这不是属性改名，也没有替代属性。

### API 兼容的边界

文档称其 API 与 `@react-native-masked-view/masked-view` 兼容，但同时明确排除了：

- `androidRenderingMode`
- Web 上真正的遮罩实现

因此，“可直接替换”主要指 Android 和 iOS 上的组件调用方式及 Props，而不代表所有平台和所有旧属性都完全一致。

## 各平台底层实现

调用方使用相同的 React Native API，但 Android 和 iOS 的实际渲染机制不同。

### Android

Android 使用：

- Jetpack Compose 图形层合成
- `BlendMode.DstIn`
- 离屏图形层

Jetpack Compose 是 Android 的现代声明式 UI 工具包，可以类比为 Android 原生 UI 层中的声明式组件体系，但它不是 React，也不运行在浏览器中。

`DstIn` 是一种图像混合模式。其效果是保留目标内容与遮罩不透明区域重叠的部分。

### iOS

iOS 使用 SwiftUI 的 `.mask` 修饰符。

SwiftUI 是 Apple 平台的声明式 UI 框架。Expo UI 在底层把 React Native 子元素桥接到 SwiftUI 的遮罩能力。

### 开发影响

文档明确说明两端底层技术不同，但没有列出视觉差异或兼容性差异。

**基于文档内容推导：** 即使 JavaScript/TypeScript 代码相同，复杂遮罩仍应分别在 Android 和 iOS 真机或模拟器中验证，因为最终由不同原生图形系统完成渲染。

## Web 平台限制

Web 端目前没有实现遮罩功能。

在 Web 上运行时：

- `children` 会直接显示，不应用遮罩。
- 控制台会记录一次警告。
- 应用不会因为缺少遮罩而自动隐藏 `children`。

这属于明显的视觉降级。例如，原本应显示为渐变文字的内容，在 Web 上可能直接显示完整的背景内容。

### Web 替代方案

文档根据场景推荐使用不同的 CSS 能力。

#### 渐变文字

使用：

```css
background-clip: text;
color: transparent;
```

然后将渐变或图片设置为背景。

#### Alpha 渐隐

使用：

```css
mask-image: linear-gradient(...);
```

也可以使用：

```css
-webkit-mask-image: linear-gradient(...);
```

#### 形状遮罩

可使用：

```css
clip-path: circle(...);
clip-path: inset(...);
clip-path: path(...);
```

简单圆角裁剪还可以使用：

```css
border-radius: ...;
overflow: hidden;
```

Web 并不存在一个适合所有情况的统一替代方案，需要根据渐变文字、透明度渐隐或形状裁剪等具体目标选择 CSS。

## React Web 开发者容易误解的地方

### 1. `maskElement` 不是覆盖在内容上的普通组件

它不是一个最终需要直接显示给用户的前景层，而是为原生图形系统提供透明度模板。

### 2. 遮罩判断的是透明度，不是颜色

黑色并不表示隐藏，白色也不天然表示显示。只要像素完全不透明，就会显示后面的内容。

### 3. React Native 组件不是 DOM

Android 和 iOS 上没有可直接操作的 `div`、CSS `mask-image` 或 `clip-path`。`MaskedView` 会调用平台特定的原生图形能力。

### 4. Web 不会自动获得同样效果

虽然 React Native 项目可能通过 React Native Web 运行在浏览器中，但这个组件在 Web 上不会执行遮罩。跨平台项目需要单独设计 Web 实现。

### 5. API 兼容不等于完全相同

迁移时仍需要处理 `androidRenderingMode` 和 Web 行为差异，不能只全局替换导入路径后就认为迁移完成。

### 6. 遮罩和内容都需要正确布局

遮罩只对其覆盖到的区域产生作用。如果 `MaskedView`、`maskElement` 或 `children` 没有得到预期尺寸，最终可能显示为空白或只显示部分内容。

示例通过固定宽高、`flex: 1` 和 `StyleSheet.absoluteFill` 保证各层覆盖同一区域。

其中关于错误布局表现的描述属于 **基于文档示例推导**，本页没有提供专门的布局故障排查说明。

## 实际开发中的使用方式

### 文字填充效果

将 `Text` 放入 `maskElement`，将渐变、图片或其他视图放入 `children`。

适合：

- 渐变标题
- 图片纹理文字
- 品牌文字效果

### 内容渐隐

将带透明度变化的 `LinearGradient` 放入 `maskElement`。

适合：

- 横向或纵向淡出
- 内容边缘过渡
- 视觉上的渐隐区域

### 任意形状遮罩

`maskElement` 可以是任意 React 元素，因此可以组合多个 React Native 视图来形成遮罩。

不过当前文档没有提供复杂形状、动画遮罩或图片遮罩的具体示例，也没有说明相应性能表现。

## 注意事项与限制

1. 组件正式支持的平台只有 Android 和 iOS。
2. Web 只显示未遮罩的 `children`，并输出一次控制台警告。
3. Web 项目应根据场景使用 CSS，而不是依赖该组件实现一致效果。
4. `maskElement` 依赖 Alpha 通道，颜色本身不决定内容是否可见。
5. 从旧库迁移时必须修改导入路径和导入形式。
6. `androidRenderingMode` 不受支持，也没有对应替代属性。
7. 现有 React Native 原生工程需要先具备 Expo Modules 支持。
8. 示例使用了 `experimental_backgroundImage`，但本页没有说明其稳定性和完整兼容范围。
9. 当前文档没有涉及无障碍行为、动画支持、渲染性能、测试方案、服务端渲染或复杂交互限制。

## 明确信息与推导信息

### 文档明确说明

- `MaskedView` 来自 `@expo/ui/community/masked-view`。
- API 与 `@react-native-masked-view/masked-view` 兼容。
- 不透明遮罩像素显示内容，透明像素隐藏内容。
- 只有 `maskElement` 的 Alpha 通道影响遮罩。
- Android 使用 Jetpack Compose 和 `BlendMode.DstIn`。
- iOS 使用 SwiftUI `.mask`。
- `androidRenderingMode` 不受支持。
- Web 没有实现遮罩，只会显示未遮罩的子内容并输出一次警告。
- `MaskedViewProps` 继承 `ViewProps`。
- `children` 可选，`maskElement` 必填。

### 基于文档内容推导

- 应分别测试 Android 和 iOS 的最终视觉效果，因为两端使用不同的原生渲染机制。
- 跨平台项目需要为 Web 准备独立实现或可接受的降级效果。
- 遮罩、内容和容器的布局尺寸需要保持一致，否则可能出现空白或裁剪异常。
- 使用 TypeScript 时，未受支持的 `androidRenderingMode` 会因不在公开类型中而产生类型错误。
- 迁移不能只修改依赖包，还需要检查旧属性和 Web 行为。

### 基于经验建议

- 优先使用明确宽高或稳定的 Flex 布局，确保遮罩和内容覆盖相同区域。
- 在 Android 和 iOS 上分别进行截图或视觉回归测试。
- 如果项目同时支持 Web，可以封装平台组件，在原生端使用 `MaskedView`，在 Web 端使用对应 CSS。
- 对大尺寸、动画或多层复杂遮罩进行真机性能测试。本页没有提供这类场景的性能保证。
- 不要把示例中的实验性背景属性直接视为生产环境的唯一渐变实现方案。

## 总结

`MaskedView` 的核心模型很简单：`children` 提供内容，`maskElement` 的透明度决定内容的可见范围。

在 Android 和 iOS 上，它为两个不同的原生遮罩系统提供了统一的 React Native API。对于从 `@react-native-masked-view/masked-view` 迁移的项目，大部分调用方式可以保留，但必须更改导入方式并删除 `androidRenderingMode`。

最大的跨平台限制是 Web 未实现遮罩。面向 Android、iOS 和 Web 的项目，需要根据具体效果使用 CSS 为 Web 单独实现，或者明确接受未遮罩内容的降级表现。

---

## 文档导航

- **上一页**：[datetimepicker](./16__datetimepicker.md)
- **下一页**：[menu](./18__menu.md)
