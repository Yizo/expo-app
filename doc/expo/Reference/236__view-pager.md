# react-native-pager-view -- 可滑动分页视图组件

## 文档解决的问题

在移动端应用中，"左右滑动切换页面"是一种非常常见的交互模式，例如引导页、图片轮播、Tab 页签内容切换等。在 React Web 中，我们通常会用 Swiper.js、Splide 等第三方库来实现类似效果。而在 React Native / Expo 生态中，`react-native-pager-view` 就是用来解决这个需求的组件库。

它提供了一个名为 `PagerView` 的组件，能够处理分页布局和滑动手势，让你可以像翻书一样在多页内容之间滑动切换。

**适用场景：**

- 新手引导页（Onboarding）：多页介绍左右滑动
- 图片 / 内容轮播（Carousel）
- Tab 页签下的滑动切换内容
- 任何需要"分页 + 滑动手势"的 UI

## 阅读前需要理解的背景知识

### 什么是 PagerView？

`PagerView` 是一个原生组件，它在底层调用了 Android 的 `ViewPager` 和 iOS 的 `UIPageViewController`（或等效原生实现）。你可以把它理解为一个"可以左右滑动来切换子页面"的容器。

与 React Web 中的实现对比：

| 概念 | React Web | React Native (PagerView) |
|---|---|---|
| 实现方式 | CSS overflow + transform / JS 动画 | 原生手势系统 + 原生布局 |
| 性能 | 依赖浏览器渲染引擎 | 由操作系统原生渲染，更流畅 |
| 手势处理 | 需要自己监听 touch 事件或使用库 | 原生内置，无需额外配置 |
| 动画效果 | 需要 CSS transition 或动画库 | 原生页面切换动画 |

### 什么是 "unversioned" 文档？

原文档标注为 "unversioned"，意味着这是即将发布的 SDK 版本的文档。文档中提示当前稳定版本为 SDK 56，如果你使用的是当前稳定版，应以 SDK 56 的文档为准。

### @expo/ui 替代方案

文档中提到 `@expo/ui` 包提供了该库的"直接替换方案"（drop-in replacement），它在 Android 上使用 Jetpack Compose、在 iOS 上使用 SwiftUI 实现。这意味着：

- 如果你正在启动新项目，可以考虑使用 `@expo/ui` 中的对应组件，它基于更现代的 UI 框架。
- 如果你已有项目使用 `react-native-pager-view`，可以较为平滑地迁移到 `@expo/ui`。

> **基于文档内容推导：** `@expo/ui` 的底层实现从传统的 Android View / UIKit 切换到了 Jetpack Compose / SwiftUI，这通常意味着更好的性能和更现代的 API 设计，但可能要求更高的系统版本。

## 安装

### 在 Expo 项目中安装

根据你的包管理器选择对应命令：

```sh
# 使用 npm
npx expo install react-native-pager-view

# 使用 yarn
yarn expo install react-native-pager-view

# 使用 pnpm
pnpm expo install react-native-pager-view

# 使用 bun
bun expo install react-native-pager-view
```

**命令说明：**

- `npx expo install` 是 Expo 提供的安装命令，它不仅会安装 npm 包，还会自动选择与当前 Expo SDK 版本兼容的包版本。这与直接运行 `npm install` 不同 -- 直接 `npm install` 可能安装到不兼容的版本，导致运行时报错。
- 在 Expo 项目中，**始终推荐使用 `expo install` 而不是裸 `npm install`** 来添加依赖。

### 在已有 React Native 项目中安装

如果你的项目不是 Expo 项目，而是一个已有的裸 React Native 项目（即不使用 Expo 托管工作流的项目），文档要求你：

1. 先安装 `expo` 包本身
2. 然后按照 `react-native-pager-view` 的 [GitHub 仓库 README](https://github.com/callstack/react-native-pager-view) 中的安装说明进行操作

> **对 React Web 开发者的解释：** "已有的 React Native 项目"（existing React Native app）指的是不使用 Expo 托管工作流、而是自行管理原生 Android / iOS 工程的项目。这类项目需要手动链接原生代码（类似 Web 项目中配置 Webpack 插件），安装步骤更复杂。

### 支持的平台

| 平台 | 是否支持 |
|---|---|
| Android | 支持 |
| iOS | 支持 |
| Expo Go | 支持 |

**Expo Go 说明：** Expo Go 是 Expo 提供的一个"沙盒"应用，可以让你不编译原生代码就在手机上预览项目。`react-native-pager-view` 已被预装在 Expo Go 中，所以你可以直接在 Expo Go 里测试，无需额外的原生构建步骤。

## 核心用法与代码示例

### 基础示例：三页轮播

以下是一个完整的三页轮播组件实现：

```jsx
import { StyleSheet, View, Text } from 'react-native';
import PagerView from 'react-native-pager-view';

export default function MyPager() {
  return (
    <View style={styles.container}>
      <PagerView style={styles.container} initialPage={0}>
        <View style={styles.page} key="1">
          <Text>First page</Text>
          <Text>Swipe ➡️</Text>
        </View>
        <View style={styles.page} key="2">
          <Text>Second page</Text>
        </View>
        <View style={styles.page} key="3">
          <Text>Third page</Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 代码逐行解析

**导入部分：**

```jsx
import { StyleSheet, View, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
```

- `StyleSheet`：React Native 的样式工具，类似于在 Web 中写 CSS，但使用 JavaScript 对象来定义。它会对样式进行优化和验证。
- `View`：React Native 中最基础的布局容器，类似于 Web 中的 `<div>`。
- `Text`：用于显示文本的组件，类似于 Web 中的 `<span>` 或 `<p>`。在 React Native 中，**文本必须放在 `<Text>` 组件内**，不能直接写在 `<View>` 里（这和 Web 不同）。
- `PagerView`：从 `react-native-pager-view` 导入的分页视图组件。

**组件结构：**

```jsx
<View style={styles.container}>
  <PagerView style={styles.container} initialPage={0}>
    <View style={styles.page} key="1">...</View>
    <View style={styles.page} key="2">...</View>
    <View style={styles.page} key="3">...</View>
  </PagerView>
</View>
```

- 外层 `View` 作为容器，设置了 `flex: 1` 使其占满父空间。
- `PagerView` 也设置了 `flex: 1`，占满外层容器。`initialPage={0}` 表示初始显示第一页（索引从 0 开始）。
- `PagerView` 的每个直接子元素就是一个"页面"。**每个子页面必须有唯一的 `key` 属性**，这是 React 用于识别列表元素的标准做法。

**样式部分：**

```jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,  // 占满可用空间，类似 Web 中 height: 100%
  },
  page: {
    justifyContent: 'center',  // 垂直居中（注意：React Native 默认主轴是纵向的）
    alignItems: 'center',      // 水平居中
  },
});
```

> **React Web 开发者注意：** React Native 中 `flexDirection` 默认值是 `column`（纵向），而不是 Web 中的 `row`（横向）。所以 `justifyContent: 'center'` 在 React Native 中是垂直居中，而在 Web 的默认 `flex-direction: row` 下是水平居中。这是一个非常容易混淆的地方。

### 关键属性说明

| 属性 | 类型 | 说明 |
|---|---|---|
| `initialPage` | `number` | 初始显示的页面索引（从 0 开始）。例如 `initialPage={0}` 表示打开时显示第一页。 |
| `style` | `ViewStyle` | 组件样式。通常需要设置 `flex: 1` 或明确的宽高，否则组件可能不显示。 |

> **注意：** 原文档仅展示了 `initialPage` 和 `style` 两个属性。完整的 API（如 `onPageSelected`、`onPageScroll`、`setPage()` 方法等）请参阅库的 [GitHub 仓库文档](https://github.com/callstack/react-native-pager-view)。

## 注意事项、限制条件和坑点

### 1. 样式必须设置尺寸

`PagerView` 和它的外层容器必须有明确的尺寸（通过 `flex: 1` 或固定的 `width` / `height`）。如果忘记设置，组件可能完全不可见 -- 这在 React Native 中是常见问题，因为组件默认没有尺寸。

在 Web 中，一个空的 `<div>` 至少还有浏览器默认样式或者内容撑开高度；但在 React Native 中，如果一个 `View` 没有设置尺寸也没有内容，它的宽高就是 0。

### 2. 每个子页面必须有 key

`PagerView` 要求每个直接子元素都有唯一的 `key` 属性。缺少 `key` 会导致 React 发出警告，甚至可能导致页面渲染异常。这和 Web 中渲染列表需要 `key` 的原理相同。

### 3. 子元素必须是 View 类型

`PagerView` 的直接子元素应当是 `View` 或其变体（如 `ScrollView`），不能是 `Text` 或其他非容器组件。每一"页"都应当用一个容器组件包裹。

### 4. SDK 版本差异

原文档标注为 "unversioned"（即将发布的 SDK 版本），具体 API 行为可能与你当前使用的 SDK 版本存在差异。建议以你项目中实际安装的 SDK 版本对应的文档为准。

### 5. @expo/ui 替代方案的存在

如果你正在开始一个新项目，文档建议使用 `@expo/ui` 中的对应组件作为替代。这意味着 `react-native-pager-view` 虽然仍可使用，但在 Expo 生态中的长期推荐方案可能会转向 `@expo/ui`。

## React Web 开发者需要特别注意的地方

### 1. 布局思维转换

在 Web 中实现轮播，你通常会用 CSS 的 `overflow: hidden` 配合 `transform: translateX()` 来移动内容，或者使用 Swiper.js 等库。在 React Native 中，`PagerView` 把这些细节封装为原生组件，你不需要（也不应该）手动实现滑动逻辑。

### 2. 没有 DOM，没有 CSS 文件

示例中使用 `StyleSheet.create()` 来定义样式，这是 React Native 特有的方式。样式属性名使用驼峰命名（如 `justifyContent` 而非 `justify-content`），且不支持所有 CSS 属性（例如不支持 `float`、`display: grid` 等）。

### 3. 组件不是 HTML 标签

`<View>`、`<Text>` 不是 HTML 标签，它们不会渲染为 DOM 元素。你不能在 `<View>` 上设置 `onClick`，而应该用 `onPress`（不过 `PagerView` 的手势处理是内置的，不需要你自己绑定事件）。

### 4. 默认 flex 方向不同

再次强调：React Native 的 `flexDirection` 默认是 `column`，而 Web 是 `row`。当你从 Web 转向 React Native 时，这是最容易导致布局"看起来不对"的原因之一。

### 5. 调试方式不同

React Native 没有浏览器开发者工具中的 Elements 面板。调试布局和样式时，通常使用 Expo Go 中的调试工具或 React Native 的 Flipper 调试器。

## 实际开发建议

1. **从示例出发快速验证：** 上面的三页示例是一个很好的起点。复制到项目中跑通后，再逐步替换为实际页面内容。

2. **结合状态管理实现动态页面：** 实际项目中，页面数量通常是动态的（例如从 API 获取数据后渲染）。你可以用 `.map()` 来生成页面列表，但记得为每个页面设置唯一的 `key`。

3. **结合 Tab 指示器使用：** `PagerView` 本身只提供滑动功能，不包含底部的"小圆点"指示器或顶部 Tab 标签。你需要自己实现指示器 UI，或使用 `react-native-tab-view` 等库来获得完整的 Tab + 分页体验。

4. **关注 @expo/ui 的发展：** 如果你使用 Expo 且追求最新的原生 UI 技术栈（Jetpack Compose / SwiftUI），可以关注 `@expo/ui` 中的 `HorizontalPager` 组件，它是 `react-native-pager-view` 的现代替代方案。

5. **始终使用 `expo install`：** 在 Expo 项目中安装任何包时，都应该使用 `npx expo install` 而非裸 `npm install`，以确保版本兼容性。

## 深入学习

原文档提供的信息较为基础，主要是一个简介和入门示例。要深入了解 `PagerView` 的完整 API（包括事件回调、编程式页面切换、动画配置等），请访问库的官方 GitHub 仓库文档：

- **源码仓库：** [github.com/callstack/react-native-pager-view](https://github.com/callstack/react-native-pager-view)

> **基于经验建议：** 在 GitHub 仓库的 README 中，你通常可以找到完整的 Props 列表、方法说明、更复杂的代码示例，以及已知问题和平台差异。

## 总结

`react-native-pager-view` 是 React Native / Expo 生态中实现"分页滑动"功能的核心组件库。它通过原生手势系统提供了流畅的页面切换体验，用法简单直观 -- 将每个页面作为 `PagerView` 的子元素即可。

对于有 React Web 经验的开发者来说，核心概念并不难理解，主要需要注意的是：React Native 的布局默认方向与 Web 不同、样式系统的差异、以及组件必须有明确尺寸等移动端特有的约束。

随着 `@expo/ui` 的发展，Expo 生态正在向基于 Jetpack Compose / SwiftUI 的现代组件迁移，新项目可以关注 `@expo/ui` 中的替代方案。

---

## 文档导航

- **上一页**：[map view](./235__map-view.md)
- **下一页**：[reanimated](./237__reanimated.md)
