# SwiftUI：在 React Native 中构建原生 iOS 界面

> 原文档修改日期：2026 年 5 月 1 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go  
> 文档状态：面向下一版本 Expo SDK 的未发布版本文档

## 文档解决的问题

本文介绍如何通过 `@expo/ui/swift-ui`，在 React Native 项目中使用 SwiftUI 组件构建原生 iOS 界面，主要包括：

- 安装 `@expo/ui`
- 在 React Native 组件中引入 SwiftUI 组件
- 使用 `Host` 承载 SwiftUI 视图
- 找到基础教程、自定义扩展教程和视频资源

这是一篇入口型文档，不是完整的组件 API 手册。它重点说明如何开始使用，并将更深入的内容链接到其他文档。

## 适用场景

适合以下场景：

- 使用 Expo 或 React Native 开发 iOS 应用
- 希望在 React Native 页面中使用真正的 SwiftUI 原生视图
- 希望逐步扩展自定义 SwiftUI 组件或 modifier
- 希望在 React Native 应用中使用 iOS 特有的界面能力

当前文档未涉及：

- Android 支持
- 具体 SwiftUI 组件的完整清单和属性
- 事件处理、状态同步和数据绑定
- 原生工程构建与发布流程
- 性能对比
- 测试方案
- Web 平台支持
- tvOS 的具体使用差异

## 阅读前需要理解的背景

### React Native

React Native 允许开发者使用 React 的组件模型开发移动应用，但最终界面不是浏览器 DOM。

对于 React Web 开发者，可以这样理解：

| React Web | React Native |
| --- | --- |
| 页面运行在浏览器中 | 应用运行在 iOS 或 Android 原生环境中 |
| 使用 `div`、`button` 等 DOM 元素 | 使用原生视图对应的 React Native 组件 |
| 使用 CSS 控制样式 | 通常使用 JavaScript 样式对象 |
| 浏览器负责渲染 | 移动端原生 UI 系统负责渲染 |

### SwiftUI

SwiftUI 是 Apple 用于声明式构建原生界面的框架，主要面向 iOS、macOS、watchOS 和 tvOS。

它在编程理念上与 React 有相似之处：开发者通过声明组件结构描述界面。但是 SwiftUI 不是 React，也不运行在浏览器或 React Native 的常规视图系统中。

本文中的 `@expo/ui/swift-ui` 负责让 React Native 代码能够使用 SwiftUI 视图。

### `@expo/ui` 与 `@expo/ui/swift-ui`

文档要求安装的 npm 包是：

```text
@expo/ui
```

SwiftUI 相关组件从其子路径导入：

```tsx
import { Host, Button } from '@expo/ui/swift-ui';
```

因此：

- `@expo/ui` 是需要安装的包。
- `@expo/ui/swift-ui` 是 SwiftUI 组件的导入入口，不是另一个需要单独安装的包。

### Expo Go

Expo Go 是一个预先构建好的 Expo 客户端，可用于运行和预览兼容的 Expo 项目。

文档明确标注该功能包含在 Expo Go 中。这意味着文档所示的基础能力可以在 Expo Go 支持范围内使用，但文档没有说明所有自定义 SwiftUI 扩展是否都能直接在 Expo Go 中运行。

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

只需要选择与项目匹配的一条命令，不需要全部执行。

### 为什么使用 `expo install`

这里使用的不是普通 `npm install`，而是 Expo 提供的安装命令。

**基于文档内容推导：**使用 `expo install` 可以让 Expo 根据当前项目的 SDK 环境选择兼容的依赖版本。对于 React Web 开发者，可以将其理解为带有 Expo 版本兼容处理的依赖安装入口。

原文档没有进一步解释其版本解析机制。

### 现有 React Native 项目的额外要求

如果项目是已有的 React Native 应用，即文档所称的 existing React Native app 或 bare app，需要先在项目中安装 Expo 模块支持。

也就是说，`@expo/ui` 虽然可以用于现有 React Native 项目，但它依赖 Expo 的模块基础设施。仅安装 `@expo/ui` 不一定足够。

具体如何向现有 React Native 工程安装 Expo 模块，当前文档未展开说明，而是链接到单独的“Installing Expo modules”文档。

## 基本用法

```tsx
import { Host, Button } from '@expo/ui/swift-ui';

export function SaveButton() {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="Save changes" />
    </Host>
  );
}
```

这段代码完成了三个步骤：

1. 从 `@expo/ui/swift-ui` 导入 `Host` 和 `Button`。
2. 使用 `Host` 创建一个 SwiftUI 视图容器。
3. 将 SwiftUI 的 `Button` 放入 `Host` 中。

## `Host` 的作用

文档明确说明：使用 `@expo/ui/swift-ui` 中的组件时，必须将其包裹在 `Host` 组件中。

```tsx
<Host>
  <Button label="Save changes" />
</Host>
```

`Host` 是 SwiftUI 视图的容器，负责为 SwiftUI 组件提供运行和渲染边界。

对于 React Web 开发者，不应把它简单理解成普通的 `div`。`div` 只是 DOM 层级中的一个元素，而这里的 `Host` 连接了 React Native 与 SwiftUI 两套界面体系。

因此，下面这种省略 `Host` 的写法不符合文档要求：

```tsx
<Button label="Save changes" />
```

### `style={{ flex: 1 }}`

示例为 `Host` 设置了：

```tsx
style={{ flex: 1 }}
```

在 React Native 布局中，`flex: 1` 通常表示组件占用父容器分配给它的可用空间。

**基于文档内容推导：**示例这样设置可能是为了让 SwiftUI 容器获得足够的布局空间。但文档没有将 `flex: 1` 声明为所有 `Host` 的强制配置，也没有讨论其他尺寸设置方式，因此不应将它视为固定写法。

## `Button` 示例

示例中的 SwiftUI 按钮写法为：

```tsx
<Button label="Save changes" />
```

其中 `label` 指定按钮显示的文本。

当前文档没有介绍：

- 点击事件属性
- 禁用状态
- 样式配置
- 图标
- 加载状态
- 可访问性属性

因此，不能仅根据本文确定该组件完整的 API。

## React Web 开发者容易误解的地方

### 这不是在 React 中模拟 SwiftUI 外观

`@expo/ui/swift-ui` 的目标是使用真正的 SwiftUI 原生视图，而不是用普通 React Native 组件模仿 iOS 样式。

这意味着相关组件会受到 Apple 原生平台能力和平台范围的约束。

### SwiftUI 组件不能像普通 JSX 一样随处放置

虽然组件通过 JSX 使用，但文档规定它们必须位于 `Host` 中。JSX 语法相同不代表底层渲染环境相同。

### 安装 npm 包不代表功能支持所有平台

文档只标注：

- iOS
- tvOS
- Expo Go

其中 Expo Go 是运行环境，不是与 iOS、tvOS 并列的操作系统平台。文档没有声明 Android 或 Web 支持，因此不要假设同一套 SwiftUI 界面可以直接跨平台运行。

### React Native 项目不一定天然具备 Expo 模块环境

Expo 项目通常已有相应基础设施；现有的非 Expo React Native 项目则需要先安装 Expo 模块支持。

这类似于在普通 React Web 工程中引入依赖特定构建插件的库：安装业务包之前，必须先具备它所依赖的运行与构建能力。

### `unversioned` 不是当前稳定版文档

原文页面明确警告：这是面向下一版本 Expo SDK 的文档。

截至该页面内容，最新稳定文档对应 SDK 56。下一版本文档中的 API、行为或可用性可能与 SDK 56 不一致。

实际开发时应先确认项目使用的 Expo SDK 版本，再阅读对应版本的文档，避免直接把未发布版本示例应用到稳定项目中。

## 实际开发中的使用方式

根据本文提供的信息，最小接入流程是：

1. 确认目标平台是 iOS 或 tvOS。
2. 确认项目使用的 Expo SDK 版本。
3. 如果是现有 React Native 工程，先安装 Expo 模块支持。
4. 使用对应包管理器执行 `expo install @expo/ui`。
5. 从 `@expo/ui/swift-ui` 导入需要的组件。
6. 创建 `Host`，并将 SwiftUI 组件放在其中。
7. 根据需要继续阅读组件 API 或自定义 SwiftUI 扩展文档。

一个最小组件如下：

```tsx
import { Host, Button } from '@expo/ui/swift-ui';

export function SaveButton() {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="Save changes" />
    </Host>
  );
}
```

## 注意事项与限制

- SwiftUI 组件必须由 `Host` 包裹。
- 当前页面是下一版本 SDK 的文档，不应默认与稳定版 SDK 56 完全一致。
- 文档只明确标注 iOS 和 tvOS，没有声明 Android 或 Web 支持。
- 已有 React Native 应用需要先集成 Expo 模块。
- 本文只是接入入口，没有提供完整组件 API。
- 文档没有说明跨平台降级方案。
- 文档没有说明同一组件如何分别为 iOS 和 Android 提供实现。
- 文档没有说明 `Host` 的嵌套、生命周期、尺寸计算或性能限制。
- 文档没有说明自定义 SwiftUI 组件在 Expo Go 中的支持边界。

最后四项属于“当前文档未涉及”，不能据此断定相关能力存在或不存在。

## 延伸资料

原文提供了三类后续资源：

1. **Expo UI SwiftUI 指南**  
   用于继续学习 `@expo/ui/swift-ui` 的基础知识。

2. **Extending with SwiftUI**  
   用于创建能够与 Expo UI 集成的自定义 SwiftUI 组件和 modifier。  
   modifier 是 SwiftUI 中用于调整视图外观或行为的机制，可类比为对组件逐层附加布局、样式或行为配置，但它不等同于 CSS class。

3. **Expo UI iOS Liquid Glass 视频教程**  
   展示如何在 React Native 应用中构建真实的 SwiftUI 视图。

## 明确信息与推导信息

### 文档明确说明

- `@expo/ui/swift-ui` 可用于从 React Native 构建原生 SwiftUI 界面。
- 安装的包是 `@expo/ui`。
- 支持 iOS、tvOS，并包含在 Expo Go 中。
- SwiftUI 组件必须放在 `Host` 中。
- `Host` 是 SwiftUI 视图的容器。
- 现有 React Native 应用需要安装 Expo 模块支持。
- 当前页面属于下一版本 SDK 文档。
- 页面所指的最新稳定版本是 SDK 56。

### 基于文档内容推导

- `Host` 是 React Native 与 SwiftUI 渲染体系之间的承载边界。
- `expo install` 应用于匹配项目 Expo SDK 的依赖版本。
- 示例中的 `flex: 1` 用于让 `Host` 使用可用布局空间，但并非文档明确规定的必需配置。
- 由于平台列表没有 Android 和 Web，实际项目需要单独考虑这些平台的界面实现。

这些推导用于帮助理解开发影响，不应替代对应版本的完整 API 文档。

## 总结

`@expo/ui/swift-ui` 为 React Native 提供了使用原生 SwiftUI 视图的入口。基本模式是安装 `@expo/ui`，从 `@expo/ui/swift-ui` 导入组件，并使用 `Host` 包裹所有 SwiftUI 内容。

对于 React Web 开发者，最重要的是认识到：这里虽然仍然使用 React 和 JSX，但渲染目标不是 DOM，也不只是普通 React Native 视图，而是 Apple 的 SwiftUI 原生界面。平台支持、Expo SDK 版本以及 `Host` 容器要求都会直接影响组件能否正常使用。

---

## 文档导航

- **上一页**：[usenativestate](./72__usenativestate.md)
- **下一页**：[accessorywidgetbackground](./74__accessorywidgetbackground.md)
