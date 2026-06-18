# MaskedView -- 遮罩视图组件

## 文档解决的问题

在移动端 UI 开发中，有时我们需要让一个视图只显示特定形状区域内的内容，超出该形状的部分被"裁剪"掉。这种效果叫做**遮罩（Mask）**。例如：

- 文字内部显示渐变色彩（文字作为遮罩形状）
- 图片以不规则形状显示（如星形、心形裁切）
- 动画中逐步揭示内容（擦除、淡入效果）

在 Web 端，我们可以通过 CSS 的 `mask-image` 或 `clip-path` 来实现类似效果。但在 React Native 中，CSS 能力有限，需要借助原生组件来完成。`@react-native-masked-view/masked-view` 就是 Expo 生态中提供这一能力的官方组件。

## 阅读前需要理解的背景知识

### 什么是 Mask（遮罩）

如果你熟悉 CSS，可以类比 `mask-image` 属性：你定义一个"遮罩层"（mask），只有遮罩层中不透明的区域才会显示下方内容，透明区域则被隐藏。

在 React Native 中，`MaskedView` 组件的工作方式类似：你提供一个 `maskElement`（遮罩元素），组件只渲染与遮罩元素相交（重叠）的像素区域。

### 原生组件 vs Web 组件

在 React Web 中，所有 UI 都是 HTML + CSS 渲染的。而在 React Native 中，UI 由原生平台（iOS 的 UIKit / Android 的 View 系统）渲染。`MaskedView` 就是一个封装了原生遮罩能力的 React 组件，它在 iOS 和 Android 上分别调用各自平台的原生实现。

### Expo Go

Expo Go 是 Expo 提供的一个"沙盒"应用，可以让你在不编译原生代码的情况下测试 Expo 项目。`@react-native-masked-view/masked-view` 兼容 Expo Go，意味着你可以直接在 Expo Go 中使用它，无需自行编译原生代码。

## 核心内容

### 包名与定位

该组件的 npm 包名为：

```
@react-native-masked-view/masked-view
```

它是 Expo 官方维护的遮罩视图组件，兼容以下平台：

| 平台 | 支持情况 |
|------|---------|
| iOS | 支持 |
| Android | 支持（实验性） |
| tvOS | 支持 |
| Expo Go | 支持 |

### 基本工作原理

`MaskedView` 组件接收一个 `maskElement` 属性作为遮罩形状，然后只渲染与该遮罩元素相交区域内的子内容。

类比 Web 开发：

```css
/* Web 端的等价概念 */
.masked-container {
  mask-image: url('mask-shape.png');
  /* 只有 mask 不透明区域内的内容才可见 */
}
```

在 React Native 中的用法：

```jsx
import MaskedView from '@react-native-masked-view/masked-view';
import { Text, View } from 'react-native';

<MaskedView
  maskElement={<Text style={{ fontSize: 60, fontWeight: 'bold' }}>Hello</Text>}
>
  {/* 以下 View 只会在 "Hello" 文字形状区域内显示 */}
  <View style={{ flex: 1, backgroundColor: 'blue' }} />
</MaskedView>
```

效果：蓝色方块只会在 "Hello" 文字的笔画区域内显示，形成"蓝色文字"的视觉效果。

### 安装

根据你使用的包管理器，执行以下命令之一：

```sh
# 使用 npm
npx expo install @react-native-masked-view/masked-view

# 使用 yarn
yarn expo install @react-native-masked-view/masked-view

# 使用 pnpm
pnpm expo install @react-native-masked-view/masked-view

# 使用 bun
bun expo install @react-native-masked-view/masked-view
```

**关于 `expo install` 命令的说明：**

对于 React Web 开发者来说，你可能习惯了直接用 `npm install` 来安装依赖。但在 Expo 项目中，推荐使用 `expo install` 命令，它的作用是：

1. 自动选择与当前 Expo SDK 版本兼容的包版本（避免版本不匹配导致的原生模块报错）
2. 将依赖添加到 `package.json` 中

这类似于 Web 开发中某些框架提供的 "add" 命令（如 `next add`），会帮你处理版本兼容问题。

### 在非 Expo 管理的 React Native 项目中安装

如果你有一个已经存在的、不使用 Expo 管理工具链的 React Native 项目（也叫 "bare workflow" 项目），需要先确保项目中已经安装了 `expo` 模块，然后参照该包 GitHub 仓库 README 中的安装说明进行操作。

> **什么是 bare workflow？** Expo 项目有两种模式：Managed workflow（Expo 管理，不需要接触原生代码）和 Bare workflow（开发者自行管理原生代码）。如果你是从零开始用 Expo 创建的项目，通常不需要关心这个区别。

### 替代方案：@expo/ui

文档提到，`@expo/ui` 模块提供了一个基于 **SwiftUI**（iOS 声明式 UI 框架）和 **Jetpack Compose**（Android 声明式 UI 框架）的替代实现。这意味着：

- 如果你使用的是 Expo 的声明式 UI 体系（`@expo/ui`），可以使用该模块提供的 MaskedView 替代方案
- 这个替代方案使用了各平台最新的声明式 UI 技术栈，可能在未来成为推荐方式

（基于文档内容推导）目前阶段，对于大多数使用传统 React Native 组件体系的项目，仍然应该使用 `@react-native-masked-view/masked-view`。

## 注意事项、限制条件和坑点

### 1. 不要同时安装旧版社区包

文档明确警告：应用中**不能同时包含**已废弃的社区版本和当前这个官方包。

历史背景（基于文档内容推导）：在 Expo 官方接管之前，`masked-view` 曾是一个社区维护的包（可能名为 `@react-native-community/masked-view`）。如果你的项目从旧版本迁移过来，必须先卸载旧的社区包，再安装新的官方包。

**开发影响：** 如果两个包同时存在，会导致原生模块冲突，应用可能编译失败或运行时崩溃。迁移时应检查 `package.json` 中是否存在旧包并移除。

### 2. React Navigation 6+ 强制依赖此包

文档明确指出：React Navigation 6 及更高版本**要求**使用这个特定的库（`@react-native-masked-view/masked-view`）。

**开发影响：** 如果你的项目使用了 React Navigation 6+（这是目前主流的 React Native 导航库），那么安装此包是必需的，不是可选的。某些导航动画和过渡效果内部依赖 MaskedView 组件。如果你遗漏了此依赖，导航切换时可能出现报错或动画异常。

### 3. Android 实现为实验性

文档明确说明 Android 平台的实现仍然是"实验性的"（experimental），可能存在与 iOS 之间的行为差异。

**开发影响：**

- 在 Android 上可能遇到与 iOS 不一致的渲染效果
- 某些边界情况下可能出现 Bug
- 如果在 Android 上发现问题，应前往该包的 GitHub 仓库提交 Bug 报告

**给 React Web 开发者的提醒：** 这和 Web 开发中"浏览器兼容性"问题类似。在 Web 端你可能需要处理 Chrome 和 Firefox 的差异；在 React Native 中，你需要关注 iOS 和 Android 之间的行为差异。对于 MaskedView，建议始终在两个平台上都进行测试。

### 4. 文档版本说明

原文档注明当前内容适用于即将发布的 SDK 版本（unversioned），如需了解当前稳定版的详情，应参考 SDK 56 的文档。

**开发影响：** API 可能在后续版本中发生变化。如果你在生产项目中使用，建议以稳定版 SDK 文档为准。

## React Web 开发者需要特别注意的地方

### 1. 遮罩不是通过 CSS 实现的

在 Web 端，遮罩效果通过 CSS 属性（`mask-image`、`mask`、`clip-path`）实现，是样式层面的事。但在 React Native 中，遮罩需要通过一个专门的**原生组件**来实现，它是一个包裹组件（wrapper component），而不是一个样式属性。

### 2. 遮罩元素必须是 React 元素

`maskElement` 属性需要传入一个 React 元素（如 `<Text>`、`<View>`、`<Image>`），而不是一张图片的路径或一个 CSS 值。遮罩元素的**不透明区域**决定了哪些内容可见。

### 3. 布局行为

`MaskedView` 本身是一个容器组件，它的布局行为和普通 `<View>` 类似。遮罩元素决定了可见区域的形状，但不影响布局尺寸。子内容的尺寸和布局仍然按照正常的 flexbox 规则计算。

### 4. 性能考量

（基于经验建议）由于遮罩是在原生层面实现的，通常性能较好。但如果遮罩元素过于复杂（例如包含大量嵌套视图或动画），可能会影响渲染性能。建议在真机上测试复杂遮罩场景的性能表现。

## API 参考

当前文档页面本身是一个概述页，未列出详细的 API 参数表。完整的 API 文档和使用指南需要查阅该包的 GitHub 官方仓库。

根据文档内容和组件的通用用法，核心属性如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| `maskElement` | `ReactElement` | 遮罩元素，定义可见区域的形状。遮罩元素中不透明的部分会显示子内容，透明部分则隐藏 |

子元素（`children`）为被遮罩裁剪的内容区域，可以是任何 React Native 视图组件。

## 实际开发建议

### 典型使用场景

1. **渐变文字效果：** 用 `<Text>` 作为遮罩，下方放一个渐变色 `<View>`，实现文字填充渐变色
2. **图片形状裁切：** 用自定义形状作为遮罩，让图片以不规则形状显示
3. **导航过渡动画：** React Navigation 内部使用此组件实现页面切换时的遮罩动画效果
4. **骨架屏/加载动画：** 用遮罩实现内容逐步揭示的加载效果

### 安装时机

如果你的项目使用了 React Navigation 6+，在安装导航库时就应确保此包已安装。可以检查 `package.json` 或运行以下命令确认：

```sh
npx expo install --check
```

### 迁移检查清单

如果你从旧版社区包迁移：

1. 卸载旧包：`npm uninstall @react-native-community/masked-view`
2. 安装新包：`npx expo install @react-native-masked-view/masked-view`
3. 更新所有 `import` 语句中的包名
4. 在 iOS 和 Android 上分别测试遮罩效果

### 调试建议

（基于经验建议）如果遮罩效果不符合预期：

- 先给子内容添加明显的背景色，确认布局尺寸是否正确
- 检查 `maskElement` 中的元素是否有正确的尺寸（宽/高不为 0）
- 在 iOS 和 Android 上分别测试，观察差异

## 总结

`@react-native-masked-view/masked-view` 是 Expo 生态中实现遮罩裁剪效果的核心组件。它将 iOS 和 Android 原生的遮罩能力封装为 React 组件，让开发者可以通过声明式的 `maskElement` 属性实现各种遮罩效果。

对于从 React Web 转过来的开发者，最关键的理解是：遮罩在 React Native 中不是样式属性，而是一个专门的包裹组件。此外，由于 React Navigation 6+ 依赖此包，它几乎是每个 Expo 项目的必装依赖。使用时需要特别注意 Android 平台的实验性状态，确保在两个平台上都进行充分测试。

---

## 文档导航

- **上一页**：[slider](./226__slider.md)
- **下一页**：[picker](./228__picker.md)
