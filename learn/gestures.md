# Expo 手势教程：为贴纸添加双击缩放与拖动能力

> 原文标题：Add gestures  
> 文档修改日期：2026 年 6 月 2 日  
> 本文严格基于所提供的官方文档原文整理，不引入其他资料。

## 文档解决的问题

这篇教程介绍如何在 Expo 应用中使用以下两个库实现手势交互：

- `react-native-gesture-handler`：识别用户的触摸手势。
- `react-native-reanimated`：根据手势状态更新界面，并产生动画效果。

最终实现两个功能：

1. 双击 Emoji 贴纸，将贴纸放大；再次双击，将其缩小。
2. 拖动 Emoji 贴纸，使用户可以把贴纸放到图片上的任意位置。

教程面向 Android、iOS 和 Web 三个平台，但没有分别介绍各平台的差异。

---

## 适用场景

本文内容适合以下需求：

- 图片编辑器中的贴纸移动与缩放。
- 画布、海报或头像编辑功能。
- 需要通过双击切换元素尺寸的交互。
- 需要拖动 UI 元素的 Expo 应用。
- 希望在 Android、iOS 和 Web 中使用统一手势代码的项目。

当前文档只实现了：

- 双击手势。
- 单指平移或拖动手势。
- 基于弹簧效果的尺寸动画。

当前文档未涉及：

- 单击、长按、捏合缩放和旋转。
- 拖动边界限制。
- 手势冲突处理。
- 拖动后的吸附或回弹。
- 手势状态持久化。
- 不同平台之间的具体行为差异。
- 相关依赖的安装命令和配置流程。

---

## React Web 开发者需要先理解的背景

### 手势不是普通的 Web 点击事件

在 React Web 中，通常使用：

```tsx
<div onClick={handleClick} />
```

或者通过 Pointer Events、Mouse Events 处理交互。

本文使用的是 React Native Gesture Handler。它通过平台原生的触摸处理系统识别：

- `pan`：平移或拖动。
- `tap`：点击。
- `rotation`：旋转。
- 其他手势。

这意味着手势不是通过给组件直接添加 `onClick` 或 `onMouseMove` 实现的，而是：

1. 使用 `Gesture` 创建手势定义。
2. 使用 `GestureDetector` 指定需要监听该手势的组件区域。
3. 在手势回调中修改共享值。
4. 使用 Reanimated 把共享值映射为动画样式。

### React Native 没有 HTML 元素

代码中的组件可以这样理解：

| React Native / Reanimated | React Web 中的近似概念 |
|---|---|
| `View` | `div` |
| `Image` | `img` |
| `Animated.View` | 可由动画系统直接更新样式的 `div` |
| `Animated.Image` | 可由动画系统直接更新样式的 `img` |
| `style` | 类似行内 CSS，但语法和能力不完全相同 |
| `transform` | 类似 CSS `transform` |

这些只是帮助理解的近似对应，并不表示它们的底层实现完全相同。

### 手势识别与动画是两个职责

本文使用的两个库分工不同：

- Gesture Handler 负责判断用户做了什么。
- Reanimated 负责保存动画相关状态，并更新组件样式。

例如，双击被识别后，Gesture Handler 的回调修改贴纸尺寸；Reanimated 再把这个尺寸变化以弹簧动画显示出来。

---

# 实现流程

## 第一步：添加手势根容器

在 `app/(tabs)/index.tsx` 中，从 `react-native-gesture-handler` 导入：

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
```

然后将 `Index` 组件最外层原有的 `View` 替换为：

```tsx
export default function Index() {
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* 其余代码保持不变 */}
    </GestureHandlerRootView>
  );
}
```

### `GestureHandlerRootView` 的作用

文档明确说明，要让应用中的手势交互正常工作，需要在 `Index` 组件顶层渲染 `GestureHandlerRootView`。

可以将它理解为 Gesture Handler 的根运行环境。后续的 `GestureDetector` 位于这个根容器内部，才能处理手势。

### 容易踩坑

不能只修改 `EmojiSticker.tsx`，而忘记添加根容器。否则即使贴纸组件中定义了手势，手势交互也可能无法正常工作。

替换根组件时应保留：

```tsx
style={styles.container}
```

否则原来由根 `View` 承担的布局样式可能丢失。

---

## 第二步：将图片改为动画组件

打开：

```text
components/EmojiSticker.tsx
```

导入 Reanimated：

```tsx
import Animated from 'react-native-reanimated';
```

将普通 `Image` 替换为：

```tsx
<Animated.Image
  source={stickerSource}
  resizeMode="contain"
  style={{ width: imageSize, height: imageSize }}
/>
```

### 为什么要使用 `Animated.Image`

Reanimated 提供了可以参与动画的组件，例如：

- `Animated.View`
- `Animated.Text`
- `Animated.ScrollView`
- `Animated.Image`

动画组件会读取其 `style`，判断哪些值需要动画更新。

这里需要动态修改图片的 `width` 和 `height`，因此将普通图片改成 `Animated.Image`。

> 文档明确说明：本教程通过改变 `width` 和 `height` 实现贴纸缩放，而不是使用 `transform: scale(...)`。

---

## 第三步：创建双击手势状态

需要新增以下导入：

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
```

在 `EmojiSticker` 组件中创建共享值：

```tsx
const scaleImage = useSharedValue(imageSize);
```

### `useSharedValue` 是什么

`useSharedValue()` 用来保存会被动画或手势持续修改的数据。

它与 React Web 中的 `useState()` 有一些概念上的相似之处，但使用方式不同：

```tsx
scaleImage.value
```

通过 `.value` 读取和修改共享值。

文档指出，共享值可以：

- 保存可变数据。
- 根据当前值运行动画。
- 在动画样式中被读取。

初始值使用 `imageSize`：

```tsx
useSharedValue(imageSize)
```

因此贴纸初始宽高与组件收到的 `imageSize` 一致。

---

## 第四步：定义双击行为

创建双击手势：

```tsx
const doubleTap = Gesture.Tap()
  .numberOfTaps(2)
  .onStart(() => {
    if (scaleImage.value !== imageSize * 2) {
      scaleImage.value = scaleImage.value * 2;
    } else {
      scaleImage.value = Math.round(scaleImage.value / 2);
    }
  });
```

### 调用链说明

#### `Gesture.Tap()`

创建一个点击手势定义。

#### `.numberOfTaps(2)`

要求连续点击两次才识别为成功手势。

如果没有这个配置，它就不能表达本文所需的“双击”条件。

#### `.onStart(...)`

当手势开始并被识别时执行回调。

回调中的逻辑是：

```tsx
if (当前尺寸不是初始尺寸的两倍) {
  当前尺寸 = 当前尺寸 * 2;
} else {
  当前尺寸 = 当前尺寸 / 2;
}
```

第一次双击时，尺寸从 `imageSize` 变为：

```tsx
imageSize * 2
```

再次双击时，尺寸恢复为原值。

缩小时使用了：

```tsx
Math.round(scaleImage.value / 2)
```

也就是在除以 2 后进行四舍五入。

### 需要注意的行为

这段代码并不是通用的“在两个固定尺寸之间切换”。

它的放大分支使用：

```tsx
scaleImage.value * 2
```

而不是直接设置：

```tsx
imageSize * 2
```

不过在本文给定的交互流程中，共享值只会在初始尺寸和两倍尺寸之间变化，因此最终效果仍然是双击放大、再次双击还原。

---

## 第五步：创建弹簧缩放动画

使用 `useAnimatedStyle()` 创建动画样式：

```tsx
const imageStyle = useAnimatedStyle(() => {
  return {
    width: withSpring(scaleImage.value),
    height: withSpring(scaleImage.value),
  };
});
```

### `useAnimatedStyle`

它根据共享值生成可以交给动画组件的样式对象。

当 `scaleImage.value` 改变时，`width` 和 `height` 会随之更新。

### `withSpring`

`withSpring()` 使用基于弹簧物理效果的动画完成数值过渡。

如果不使用动画，尺寸变化会直接跳到目标值。使用 `withSpring()` 后，放大和缩小会表现为连续的弹簧式过渡。

当前文档未涉及：

- 弹簧动画的参数。
- 动画时长配置。
- 阻尼、质量和刚度。
- 如何取消动画。
- 如何监听动画结束。

---

## 第六步：把双击手势绑定到贴纸

使用 `GestureDetector` 包裹图片：

```tsx
<GestureDetector gesture={doubleTap}>
  <Animated.Image
    source={stickerSource}
    resizeMode="contain"
    style={[imageStyle, { width: imageSize, height: imageSize }]}
  />
</GestureDetector>
```

### `GestureDetector` 的作用

`GestureDetector` 把手势定义和具体的组件区域关联起来：

```tsx
gesture={doubleTap}
```

表示用户在其内部贴纸图片上双击时，触发 `doubleTap`。

### React Native 样式数组

这里的 `style` 不是单个对象，而是数组：

```tsx
style={[imageStyle, { width: imageSize, height: imageSize }]}
```

React Native 允许通过数组组合多组样式。

其中：

- `imageStyle` 提供动画宽高。
- 普通样式对象提供基于 `imageSize` 的宽高。

文档没有进一步解释同名样式属性的合并优先级，也没有讨论这种写法的其他组合方式。

---

## 第七步：为拖动创建位置状态

为了让贴纸在水平和垂直方向移动，创建两个共享值：

```tsx
const translateX = useSharedValue(0);
const translateY = useSharedValue(0);
```

含义分别是：

- `translateX`：水平方向位移。
- `translateY`：垂直方向位移。

初始值都是 `0`，表示贴纸最初没有额外位移。

同时，将包裹图片的普通 `View` 替换为：

```tsx
<Animated.View>
```

这是因为拖动时需要动态更新外层容器的 `transform` 样式。

### 为什么缩放图片、拖动外层容器

本文采用两层结构：

```text
Animated.View：负责位置变化
└── Animated.Image：负责尺寸变化
```

这样拖动样式和缩放样式分别作用于不同组件：

- 外层修改 `translateX`、`translateY`。
- 内层修改 `width`、`height`。

**基于文档内容推导：** 这种拆分让两种动画职责更清晰，也避免把位置与尺寸动画全部混在同一个样式对象中。

---

## 第八步：定义拖动手势

创建平移手势：

```tsx
const drag = Gesture.Pan().onChange(event => {
  translateX.value += event.changeX;
  translateY.value += event.changeY;
});
```

### `Gesture.Pan()`

用于识别拖动或平移操作。

### `.onChange(event => ...)`

当手势处于活动状态并持续移动时执行。

这与双击手势使用的 `onStart()` 不同：

- 双击只需在识别成功时修改一次尺寸。
- 拖动需要随着手指移动持续修改位置。

### `event.changeX` 与 `event.changeY`

文档明确说明：

- `changeX` 是相对上一次事件的水平位置变化。
- `changeY` 是相对上一次事件的垂直位置变化。

因此代码使用累加：

```tsx
translateX.value += event.changeX;
translateY.value += event.changeY;
```

假设连续收到三次水平变化：

```text
+2、+4、-1
```

最终水平位移就是：

```text
0 + 2 + 4 - 1 = 5
```

这里处理的是“每次事件新增了多少位移”，不是直接把位置设置成当前手指坐标。

---

## 第九步：将位置状态转换为动画样式

定义外层容器样式：

```tsx
const containerStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateX: translateX.value,
      },
      {
        translateY: translateY.value,
      },
    ],
  };
});
```

通过 `transform` 应用两个方向的位移：

- `translateX` 控制左右移动。
- `translateY` 控制上下移动。

这与 Web CSS 的以下思路类似：

```css
transform: translate(x, y);
```

但 React Native 使用对象数组表达多个 transform 操作。

拖动没有使用 `withSpring()`，因此位置直接跟随手势变化。文档只对尺寸变化添加了弹簧动画。

---

## 第十步：组合拖动与双击手势

最终组件结构如下：

```tsx
<GestureDetector gesture={drag}>
  <Animated.View style={[containerStyle, { top: -350 }]}>
    <GestureDetector gesture={doubleTap}>
      <Animated.Image
        source={stickerSource}
        resizeMode="contain"
        style={[imageStyle, { width: imageSize, height: imageSize }]}
      />
    </GestureDetector>
  </Animated.View>
</GestureDetector>
```

组件层级可以表示为：

```text
GestureDetector（识别拖动）
└── Animated.View（应用 X/Y 位移）
    └── GestureDetector（识别双击）
        └── Animated.Image（应用宽高动画）
```

外层拖动检测器负责整个贴纸区域的移动，内层检测器负责图片的双击缩放。

文档要求拖动检测器成为 `EmojiSticker` 返回内容的最外层组件。

---

## 完整实现

`components/EmojiSticker.tsx` 的最终代码为：

```tsx
import { ImageSourcePropType } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  imageSize: number;
  stickerSource: ImageSourcePropType;
};

export default function EmojiSticker({
  imageSize,
  stickerSource,
}: Props) {
  const scaleImage = useSharedValue(imageSize);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scaleImage.value !== imageSize * 2) {
        scaleImage.value = scaleImage.value * 2;
      } else {
        scaleImage.value = Math.round(scaleImage.value / 2);
      }
    });

  const imageStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(scaleImage.value),
      height: withSpring(scaleImage.value),
    };
  });

  const drag = Gesture.Pan().onChange(event => {
    translateX.value += event.changeX;
    translateY.value += event.changeY;
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={drag}>
      <Animated.View style={[containerStyle, { top: -350 }]}>
        <GestureDetector gesture={doubleTap}>
          <Animated.Image
            source={stickerSource}
            resizeMode="contain"
            style={[imageStyle, { width: imageSize, height: imageSize }]}
          />
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

# 文件、组件与 API 速查

## 涉及的文件

| 文件 | 修改目的 |
|---|---|
| `app/(tabs)/index.tsx` | 添加手势系统的根容器 |
| `components/EmojiSticker.tsx` | 实现贴纸的双击缩放和拖动 |

当前文档没有要求创建新文件或目录。

## Gesture Handler API

| API | 作用 |
|---|---|
| `GestureHandlerRootView` | 为应用中的手势交互提供根容器 |
| `GestureDetector` | 将手势定义绑定到某个组件区域 |
| `Gesture.Tap()` | 创建点击手势 |
| `numberOfTaps(2)` | 要求双击 |
| `onStart()` | 手势开始时执行回调 |
| `Gesture.Pan()` | 创建拖动手势 |
| `onChange()` | 手势移动过程中持续执行回调 |

## Reanimated API

| API | 作用 |
|---|---|
| `Animated.Image` | 可通过动画样式更新的图片 |
| `Animated.View` | 可通过动画样式更新的容器 |
| `useSharedValue()` | 保存手势或动画使用的可变值 |
| `useAnimatedStyle()` | 将共享值转换成动画样式 |
| `withSpring()` | 使用弹簧动画过渡到目标值 |

## Props 和样式

| 项目 | 作用 |
|---|---|
| `imageSize` | 贴纸的初始宽度和高度 |
| `stickerSource` | 贴纸图片来源 |
| `resizeMode="contain"` | 让图片在指定尺寸内保持比例显示 |
| `top: -350` | 保留教程原有的垂直位置偏移 |
| `translateX` | 水平位移 |
| `translateY` | 垂直位移 |

---

# 注意事项与限制

## 必须添加根容器

手势要正常工作，需要在 `Index` 顶层使用：

```tsx
<GestureHandlerRootView>
```

这是本文最重要的前置条件之一。

## 手势定义本身不会自动生效

仅创建：

```tsx
const doubleTap = Gesture.Tap();
```

还不够。必须通过：

```tsx
<GestureDetector gesture={doubleTap}>
```

把它绑定到具体组件区域。

## 普通组件不能直接接收本文的动画样式

本文先把：

```tsx
Image
```

替换为：

```tsx
Animated.Image
```

又把拖动容器从：

```tsx
View
```

替换为：

```tsx
Animated.View
```

需要动态改变样式的组件，应使用对应的 Animated 组件。

## 共享值通过 `.value` 操作

正确写法是：

```tsx
scaleImage.value = scaleImage.value * 2;
```

不能按普通变量方式直接重新赋值给 `scaleImage`。

这是 React Web 开发者刚接触 Reanimated 时很容易混淆的地方。

## 拖动没有边界限制

当前代码会不断累加位移：

```tsx
translateX.value += event.changeX;
translateY.value += event.changeY;
```

因此贴纸可以被拖出图片或屏幕可见区域。

这是文档当前实现的直接结果。文档没有提供边界检测方案。

## 拖动结果没有持久化

共享值保存在当前组件的运行状态中。当前文档没有介绍：

- 将坐标写入 React state。
- 保存到本地存储。
- 上传到服务器。
- 重新打开页面后恢复位置。

## 没有说明手势冲突规则

组件嵌套了拖动与双击检测器，但文档没有解释：

- 两种手势同时发生时如何仲裁。
- 拖动是否可能影响双击识别。
- 如何配置同时识别或互斥。
- 多个贴纸之间如何处理手势。

因此不能根据本文推断更复杂场景中的手势行为。

## 没有安装和工程配置说明

本文直接从以下包导入：

```text
react-native-gesture-handler
react-native-reanimated
```

但没有给出安装命令，也没有说明 Reanimated 是否需要额外工程配置。

必须将其理解为教程已有项目基础上的功能增量，而不是从空项目开始的完整接入指南。

---

# React Web 开发者最容易误解的地方

## 不要把共享值等同于 `useState`

React state 主要用于驱动 React 重新渲染，而本文的共享值直接服务于手势与动画样式。

本文没有使用：

```tsx
const [scale, setScale] = useState(imageSize);
```

而是：

```tsx
const scaleImage = useSharedValue(imageSize);
```

因此不要照搬 React Web 中“所有 UI 状态都必须放入 `useState`”的习惯。

## `onChange` 提供的是增量

代码中的：

```tsx
event.changeX
event.changeY
```

表示自上一次事件以来的位置变化，不是贴纸的最终坐标。

所以需要使用 `+=` 累加。

## 缩放通过宽高实现

尽管变量名叫：

```tsx
scaleImage
```

本文实际上修改的是：

```tsx
width
height
```

并没有设置 `transform: [{ scale: ... }]`。

变量名表达的是视觉效果，而不是实际使用的样式属性。

## 外层和内层承担不同交互职责

不能只关注 `Animated.Image`。最终实现实际上包含两个动画组件：

- 图片负责尺寸变化。
- 外层容器负责位置变化。

这种组件层级是理解最终代码的关键。

## 移动端交互没有鼠标悬停概念

本文关注的是触摸输入：

- 双击。
- 手指拖动。

即使教程提到 Web，也没有讨论鼠标悬停、右键或键盘操作。

---

# 实际开发中的使用方式

## 文档明确给出的实现策略

实际接入时按照以下顺序进行：

1. 在页面顶层添加 `GestureHandlerRootView`。
2. 把需要动画的普通组件替换为 Animated 组件。
3. 使用 `useSharedValue()` 保存尺寸与坐标。
4. 使用 `Gesture.Tap()` 定义双击。
5. 使用 `withSpring()` 为尺寸变化添加动画。
6. 使用 `Gesture.Pan()` 监听拖动。
7. 使用 `useAnimatedStyle()` 生成动画样式。
8. 使用 `GestureDetector` 将手势绑定到贴纸。
9. 用外层容器处理位置，用内部图片处理尺寸。

## 基于文档内容推导

在类似的贴纸编辑功能中，可以沿用本文的状态划分：

```text
尺寸状态：scaleImage
水平位置：translateX
垂直位置：translateY
```

每种状态只负责一个明确维度，之后再通过动画样式组合到组件上。

## 基于经验建议

以下内容并非当前文档明确说明，但在真实项目中通常需要额外考虑：

- 限制贴纸拖动范围，避免贴纸移出画布。
- 保存最终尺寸和坐标，以支持截图、编辑恢复或数据提交。
- 测试双击和拖动是否会产生手势冲突。
- 处理多个贴纸同时存在时的选中状态和层级。
- 考虑无障碍操作，避免功能只能通过手势完成。
- 分别在 Android、iOS 和 Web 真机环境验证触摸体验。

---

# 明确内容与推导内容的边界

## 文档明确说明

- Gesture Handler 使用平台原生触摸处理系统识别手势。
- 本教程实现双击缩放和拖动。
- Reanimated 用于在手势状态之间产生动画。
- 必须添加 `GestureHandlerRootView`。
- 图片和容器需要替换为 Animated 组件。
- 共享值通过 `.value` 访问和修改。
- 双击次数通过 `numberOfTaps(2)` 配置。
- 缩放动画使用 `withSpring()`。
- 拖动过程中通过 `changeX` 和 `changeY` 累加位移。
- 使用 `transform` 将 X/Y 位移应用到外层容器。
- 实现目标覆盖 Android、iOS 和 Web。

## 基于文档内容推导

- 外层容器与内部图片的拆分可以隔离拖动和缩放职责。
- 当前贴纸可以被拖出可见区域，因为代码没有边界判断。
- 当前实现的尺寸状态只在原始尺寸和两倍尺寸之间切换。
- 当前拖动结果只存在于组件运行期间，因为文档没有保存逻辑。
- 本文假设项目已经具备相关依赖和基础配置。

---

# 总结

这篇教程建立了一套清晰的手势处理流程：

```text
用户触摸
→ Gesture Handler 识别双击或拖动
→ 回调修改 Reanimated 共享值
→ useAnimatedStyle 读取共享值
→ Animated 组件更新尺寸或位置
```

最终的职责划分是：

```text
GestureHandlerRootView：提供手势根环境
GestureDetector：绑定手势与组件
Gesture.Tap：识别双击
Gesture.Pan：识别拖动
useSharedValue：保存尺寸和位置
useAnimatedStyle：生成动态样式
withSpring：为缩放添加弹簧动画
Animated.View：移动贴纸
Animated.Image：缩放贴纸
```

本文完成的是基础手势能力。它没有覆盖依赖安装、边界限制、状态保存、复杂手势冲突以及平台差异。原教程下一章将继续介绍如何对图片和贴纸进行截图，并保存到设备图库。
