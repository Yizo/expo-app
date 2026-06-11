# 使用 React Native 与 Expo 构建 StickerSmash 首屏

> 原文标题：**Build a screen**  
> 文档更新时间：**2026 年 5 月 18 日**  
> 本文仅基于所提供的官方文档原文整理。

## 文档解决的问题

这篇教程介绍如何构建 StickerSmash 应用的第一个页面。页面包含：

- 居中显示的一张大图
- 页面下半部分的两个按钮
- 一个带图标和黄色边框的主要按钮
- 一个样式较简单的普通按钮

本章重点是完成页面结构和视觉样式，还没有实现真正的图片选择功能。

最终预期交互是：

1. 用户可以从设备中选择图片。
2. 或者继续使用应用提供的默认图片。
3. 选择图片后，可以向图片添加贴纸。

但在当前章节中，点击按钮只会显示提示框。访问设备媒体库的功能将在下一章实现。

## 适用场景

这篇文档适合以下场景：

- 第一次使用 Expo 或 React Native 构建页面
- 学习 React Native 的基本布局和样式写法
- 使用 `expo-image` 显示本地图片
- 使用 `Pressable` 创建可点击控件
- 将页面拆分为可复用组件
- 为同一个按钮组件提供不同的视觉主题
- 在 Expo Router 项目中区分路由文件和普通组件

当前文档未涉及：

- 从设备媒体库选择图片
- 权限申请
- 图片上传
- 贴纸编辑功能
- 页面导航实现
- iOS 或 Android 原生工程配置
- 状态管理
- 自动化测试
- 应用构建和发布

---

## 一、先拆解页面结构

文档在编写代码前，先将页面拆成两个主要区域：

1. 页面中间的大图区域
2. 页面下半部分的按钮区域

第一个按钮还可以继续拆分：

- 外层容器：负责黄色边框
- 内层可点击区域
- 图标
- 按钮文字

这种思路与 React Web 中先拆解 DOM 和组件层级类似：

```text
页面容器
├── 图片区域
│   └── 图片组件
└── 底部按钮区域
    ├── 主要按钮
    │   ├── 图标
    │   └── 文本
    └── 普通按钮
```

**文档明确说明：** 在开始写代码前，应先将 UI 拆成较小的组成部分。

**基于文档内容推导：** 这种拆分可以帮助开发者识别哪些部分适合成为独立组件，以及每一层容器分别负责什么样式。

---

## 二、使用 `expo-image` 显示图片

### 1. `expo-image` 是什么

文档使用 `expo-image` 中的 `Image` 组件显示图片：

```tsx
import { Image } from 'expo-image';
```

`expo-image` 提供了一个跨平台的图片组件，可以在 Android、iOS 和 Web 上加载并渲染图片。

文档说明，该依赖已经包含在当前教程使用的默认项目模板中，因此本章没有安装依赖的命令。

> 当前文档未说明：如果项目中没有安装 `expo-image`，应该执行什么安装命令。

### 2. 图片来源

`Image` 的 `source` 属性可以接收两类图片来源：

- 静态资源
- 网络 URL

本章使用的是项目内静态图片：

```tsx
const PlaceholderImage = require('@/assets/images/background-image.png');
```

然后将它传给 `Image`：

```tsx
<Image source={PlaceholderImage} style={styles.image} />
```

网络图片则可以通过包含 `uri` 属性的对象提供，但当前文档没有给出具体网络图片代码。

### 3. 与 React Web 的区别

在 React Web 中，通常会这样显示图片：

```tsx
<img src="/images/background-image.png" />
```

React Native 没有 HTML 的 `<img>` 标签。本章使用的是 `expo-image` 提供的 `<Image>` 组件。

本地静态图片也不是简单地传入浏览器路径，而是通过：

```tsx
require('@/assets/images/background-image.png')
```

获得可传给 `source` 的静态资源引用。

### 4. 图片样式

```tsx
const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
```

这里定义了：

- `width: 320`：图片宽度
- `height: 440`：图片高度
- `borderRadius: 18`：圆角

React Native 样式使用 JavaScript 对象，不使用独立 CSS 文件。属性采用驼峰命名，例如：

- CSS 的 `border-radius`
- React Native 的 `borderRadius`

数字值直接写成数字，不需要写 `"320px"`。

---

## 三、把图片封装成独立组件

随着页面组件增多，文档要求创建顶层的 `components` 目录：

```text
expo-app/
├── app/
│   └── (tabs)/
│       └── index.tsx
├── assets/
│   └── images/
│       └── background-image.png
└── components/
    └── ImageViewer.tsx
```

### 1. 创建 `ImageViewer`

```tsx
import { ImageSourcePropType, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  imgSource: ImageSourcePropType;
};

export default function ImageViewer({ imgSource }: Props) {
  return <Image source={imgSource} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
```

组件通过 `imgSource` 属性接收图片来源：

```tsx
type Props = {
  imgSource: ImageSourcePropType;
};
```

`ImageSourcePropType` 用来描述 React Native 图片组件可以接受的图片来源类型。

在页面中使用：

```tsx
<ImageViewer imgSource={PlaceholderImage} />
```

这与 React Web 中通过 props 封装图片组件的方式基本一致。

### 2. 为什么不能放进 `app` 目录

文档明确指出：

> 普通自定义组件应该放在 `app` 目录之外。

原因是 `app` 目录中的每个文件都应当是：

- 布局文件
- 路由文件

`ImageViewer` 只是普通 UI 组件，不是页面或布局，因此放入顶层 `components` 目录。

### 3. React Web 开发者容易误解的地方

在普通 React Web 项目中，`src/pages` 或 `app` 目录的具体语义取决于项目结构。但在这里，`app` 目录由路由系统使用，文件位置会影响路由。

**基于文档内容推导：** 不应为了方便而把任意组件都放入 `app`，否则会混淆路由文件与普通组件的职责。

---

## 四、理解 `@` 路径别名

页面通过以下方式导入组件：

```tsx
import ImageViewer from '@/components/ImageViewer';
```

这里的 `@` 是自定义路径别名，用于代替较长的相对路径。

例如，它避免了类似这样的写法：

```tsx
import ImageViewer from '../../components/ImageViewer';
```

文档说明 Expo CLI 会在 `tsconfig.json` 中自动配置这个别名。

### 对开发的影响

使用路径别名可以：

- 减少 `../../` 形式的相对路径
- 让移动文件后的导入路径更稳定
- 让导入语句更容易理解

当前文档没有展示 `tsconfig.json` 的具体配置内容，也没有要求手动修改该文件。

---

## 五、使用 `Pressable` 创建按钮

### 1. 为什么使用 `Pressable`

React Native 提供了多种处理触摸事件的组件。文档推荐使用 `Pressable`，因为它比较灵活，可以检测：

- 单次点击
- 长按
- 按下事件
- 释放事件
- 其他触摸状态

本章只使用了最基础的 `onPress`。

### 2. 初始按钮组件

创建文件：

```text
components/Button.tsx
```

按钮组件接收一个 `label`：

```tsx
type Props = {
  label: string;
};
```

组件结构如下：

```tsx
<View style={styles.buttonContainer}>
  <Pressable
    style={styles.button}
    onPress={() => alert('You pressed a button.')}
  >
    <Text style={styles.buttonLabel}>{label}</Text>
  </Pressable>
</View>
```

各组件的职责是：

- `View`：外层布局容器
- `Pressable`：处理用户触摸或点击
- `Text`：显示按钮文字

React Native 中的文字通常需要放在 `Text` 组件里，而不是像 Web 那样直接把文本放进任意元素。

### 3. 当前按钮并未实现业务功能

```tsx
onPress={() => alert('You pressed a button.')}
```

用户点击按钮后只会显示提示框。

**文档明确说明：** 两个按钮都会触发这个提示，因为它们使用了相同的 `Pressable` 点击处理逻辑。

因此：

- “Choose a photo” 目前不会打开相册
- “Use this photo” 目前不会确认图片
- 两个按钮目前没有不同的业务行为

---

## 六、组织页面布局

页面中添加两个按钮：

```tsx
<View style={styles.footerContainer}>
  <Button label="Choose a photo" />
  <Button label="Use this photo" />
</View>
```

页面主要容器样式：

```tsx
container: {
  flex: 1,
  backgroundColor: '#25292e',
  alignItems: 'center',
},
```

含义如下：

- `flex: 1`：占满父容器可用空间
- `backgroundColor`：设置深色背景
- `alignItems: 'center'`：在横向轴上居中子元素

底部按钮区域：

```tsx
footerContainer: {
  flex: 1 / 3,
  alignItems: 'center',
},
```

图片区域使用：

```tsx
imageContainer: {
  flex: 1,
}
```

### Flex 布局说明

React Native 主要依赖 Flexbox 布局，但不能完全按照浏览器 CSS 的默认行为理解。

在当前结构中：

- 图片区域的 `flex` 是 `1`
- 底部区域的 `flex` 是 `1 / 3`
- 两者按照相对比例分配父容器中的可用空间

**基于文档内容推导：** `1 / 3` 在 JavaScript 中会先计算成数值，然后作为 `flex` 值使用；它不是 CSS 字符串。

文档中间版本曾为图片区域添加：

```tsx
paddingTop: 28
```

但最终展示的代码中只保留了：

```tsx
imageContainer: {
  flex: 1,
}
```

原文没有解释为什么在最终代码中移除了 `paddingTop`，因此不能从当前文档确定其原因。

---

## 七、增强按钮组件并支持主题

两个按钮的外观不同：

- “Choose a photo”：黄色边框、白色背景、深色文字、图片图标
- “Use this photo”：普通样式

为了复用同一个组件，文档添加了可选的 `theme` 属性：

```tsx
type Props = {
  label: string;
  theme?: 'primary';
};
```

这里表示：

- `label` 必须传入
- `theme` 可以不传
- 如果传入，当前只允许值为 `'primary'`

页面中的用法：

```tsx
<Button theme="primary" label="Choose a photo" />
<Button label="Use this photo" />
```

组件根据主题选择不同的渲染结果：

```tsx
if (theme === 'primary') {
  return /* 主要按钮 */;
}

return /* 普通按钮 */;
```

### 与 React Web 的对应关系

这种方式类似于 Web 组件中的变体属性：

```tsx
<Button variant="primary" />
<Button variant="default" />
```

不过当前文档将属性命名为 `theme`，并且只定义了 `'primary'` 一种显式主题。没有传入 `theme` 时使用默认按钮。

---

## 八、使用 `@expo/vector-icons` 添加图标

主要按钮需要在文字前显示图标，因此导入：

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
```

然后渲染：

```tsx
<FontAwesome
  name="picture-o"
  size={18}
  color="#25292e"
  style={styles.buttonIcon}
/>
```

各属性作用：

- `name="picture-o"`：选择图标
- `size={18}`：图标尺寸
- `color="#25292e"`：图标颜色
- `style`：补充布局样式

图标与文字之间通过右侧内边距分隔：

```tsx
buttonIcon: {
  paddingRight: 8,
}
```

文档直接使用了 `@expo/vector-icons`，没有提供安装命令或额外配置。

---

## 九、使用样式数组和内联样式

主要按钮需要覆盖默认按钮的部分样式，因此使用样式数组：

```tsx
<View
  style={[
    styles.buttonContainer,
    {
      borderWidth: 4,
      borderColor: '#ffd33d',
      borderRadius: 18,
    },
  ]}
/>
```

`Pressable` 同样如此：

```tsx
<Pressable
  style={[
    styles.button,
    { backgroundColor: '#fff' },
  ]}
/>
```

文字颜色也进行了覆盖：

```tsx
<Text
  style={[
    styles.buttonLabel,
    { color: '#25292e' },
  ]}
>
  {label}
</Text>
```

### 覆盖规则

文档明确说明，内联样式会覆盖 `StyleSheet.create()` 中的默认样式。

例如默认文字颜色为白色：

```tsx
buttonLabel: {
  color: '#fff',
  fontSize: 16,
}
```

主要按钮又传入：

```tsx
{ color: '#25292e' }
```

因此主要按钮最终显示深色文字。

这与 React Web 中后应用的样式覆盖前面样式的思路相似，但这里不是 CSS 选择器优先级，而是 React Native 的样式数组合并。

### 为什么不直接修改默认样式

文档特别指出，如果把白色背景写进：

```tsx
styles.button
```

那么主要按钮和普通按钮都会得到白色背景。

因此，只属于主要按钮的样式应当作为条件样式传入。

---

## 十、最终文件结构与职责

根据文档，相关文件大致如下：

```text
expo-app/
├── app/
│   └── (tabs)/
│       └── index.tsx
├── assets/
│   └── images/
│       └── background-image.png
└── components/
    ├── Button.tsx
    └── ImageViewer.tsx
```

### `app/(tabs)/index.tsx`

负责：

- 组合整个页面
- 引入默认图片
- 布置图片区域和按钮区域
- 决定哪个按钮使用主要主题

### `components/ImageViewer.tsx`

负责：

- 接收图片来源
- 使用 `expo-image` 显示图片
- 管理图片尺寸和圆角样式

### `components/Button.tsx`

负责：

- 显示按钮文字
- 响应点击事件
- 根据 `theme` 切换样式
- 在主要按钮中显示图标

### `assets/images/background-image.png`

作为应用内置的默认静态图片。

### `tsconfig.json`

文档只提到 Expo CLI 会在这里自动配置 `@` 路径别名，没有要求本章修改该文件。

---

## 十一、注意事项与容易踩坑的地方

### 1. `app` 目录不是通用组件目录

`app` 中的文件具有路由或布局语义。普通组件应放到 `components` 等外部目录。

### 2. React Native 不使用 HTML 标签

对应关系可以粗略理解为：

| React Web | 本章 React Native / Expo |
|---|---|
| `<div>` | `<View>` |
| `<span>` / 文本节点 | `<Text>` |
| `<img>` | `expo-image` 的 `<Image>` |
| `<button>` | 使用 `<Pressable>` 组合按钮结构 |
| `onClick` | `onPress` |

这些只是帮助理解的近似对应，不代表组件行为完全相同。

### 3. 样式不是普通 CSS

React Native 样式：

- 使用 JavaScript 对象
- 属性名使用驼峰格式
- 数字尺寸不写 `px`
- 可以通过样式数组覆盖属性
- 本章通过 `StyleSheet.create()` 组织样式

### 4. 按钮功能尚未完成

目前两个按钮都只调用 `alert()`。不要把本章结果理解为已经完成图片选择。

### 5. 本地图片通过 `require()` 引用

本章的静态图片写法是：

```tsx
require('@/assets/images/background-image.png')
```

不能直接照搬 Web 项目中的 `<img src="...">` 思维。

### 6. `theme` 是可选且受限的

```tsx
theme?: 'primary';
```

当前只支持 `'primary'`，文档没有定义其他主题值。

### 7. 主要按钮存在重复 JSX

主要按钮和普通按钮分别返回了一套 JSX。文档没有进一步抽象，也没有讨论如何减少重复代码。

因此，学习本章时应优先理解条件渲染和样式覆盖，不应自行假定文档要求进行额外重构。

### 8. 没有原生工程配置

本章展示的代码全部位于 TypeScript/React Native 层，没有修改：

- iOS 原生项目
- Android 原生项目
- 权限声明
- 原生构建配置

---

## 十二、React Web 开发者最需要建立的认知

### 页面文件位置可能决定路由

`app/(tabs)/index.tsx` 不只是普通 React 组件文件，它位于具有路由含义的 `app` 目录中。

### 移动端交互使用 `onPress`

本章使用：

```tsx
onPress={() => alert('You pressed a button.')}
```

而不是 Web 中常见的 `onClick`。

### 按钮是多个组件组合出来的

文档没有使用 HTML `<button>`。一个按钮由外层 `View`、可交互的 `Pressable`、`Text` 和可选图标共同组成。

### 图片组件和图片来源都有专门类型

`ImageViewer` 使用：

```tsx
imgSource: ImageSourcePropType
```

这比简单把图片路径声明为 `string` 更符合 React Native 图片 API 的数据形式。

### 同一套代码面向多个平台

文档明确展示该页面可以在 Android、iOS 和 Web 上查看。`expo-image` 和 React Native 组件承担了跨平台适配的职责。

当前文档没有讨论三个平台之间可能存在的样式或行为差异。

---

## 十三、实际开发中如何使用这些知识

按照本章的做法，开发类似页面时可以遵循以下流程：

1. 先将设计稿拆成图片区、操作区等主要结构。
2. 使用 `View` 建立布局层级。
3. 使用 `expo-image` 的 `Image` 显示本地或网络图片。
4. 将图片、按钮等独立 UI 提取到 `components` 目录。
5. 使用 TypeScript 为组件 props 定义类型。
6. 使用 `Pressable` 处理点击或触摸交互。
7. 通过可选属性控制同一组件的不同视觉样式。
8. 将公共样式放入 `StyleSheet.create()`。
9. 使用样式数组添加或覆盖特定变体的样式。
10. 保持普通组件在 `app` 路由目录之外。

**基于经验建议：** 当按钮以后需要执行不同操作时，可以为 `Button` 增加回调属性，例如 `onPress`，由页面决定每个按钮的具体行为。但这不是当前文档已经实现的内容。

**基于经验建议：** 当按钮主题继续增加时，可以考虑把每种主题的样式放入命名样式对象中，减少 JSX 内的内联样式。当前文档没有要求这样修改。

---

## 总结

本章完成了 StickerSmash 的初始页面设计，核心知识包括：

- 使用 `expo-image` 显示静态图片
- 使用 `View` 和 Flexbox 组织页面
- 使用 `Pressable` 构建可交互按钮
- 使用 `@expo/vector-icons` 添加图标
- 使用 props 和条件渲染实现按钮主题
- 使用样式数组覆盖默认样式
- 将普通组件放在 `app` 路由目录之外
- 使用 `@` 路径别名导入模块

本章只完成了 UI 和临时点击反馈。真正从设备媒体库选择图片的功能不在当前文档范围内，将在下一章 **Use an image picker** 中实现。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 应用中添加导航](./2_add-navigation.md) | [下一页：使用 Expo Image Picker 选择并显示图片 →](./4_image-picker.md)
<!-- NAVIGATION END -->
