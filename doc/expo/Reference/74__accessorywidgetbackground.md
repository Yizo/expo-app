# AccessoryWidgetBackground

`AccessoryWidgetBackground` 是 `@expo/ui` 提供的 SwiftUI 组件，用于为 iOS 配件型小组件（Accessory Widget）创建能够根据 Widget 运行环境自动适配的标准背景。

> 文档修改日期：2026 年 4 月 29 日  
> 适用平台：iOS  
> Expo Go：已包含  
> 软件包：`@expo/ui`

## 版本提示

原文是**下一个 Expo SDK 版本**的未版本化文档，不代表当前稳定版本。

当前稳定文档对应 **SDK 56**：

```text
/versions/latest/sdk/ui/swift-ui/accessorywidgetbackground
```

如果项目使用稳定版 Expo SDK，应优先查阅与项目 SDK 版本一致的文档，避免因为 API 尚未发布或发生变化而出现兼容性问题。

## 文档解决的问题

在 iOS Widget 中，背景外观可能受到 Widget 所处环境的影响。`AccessoryWidgetBackground` 提供一个标准的自适应背景，无需开发者自行判断环境并实现对应样式。

它与 Apple 官方 SwiftUI 的 [`AccessoryWidgetBackground`](https://developer.apple.com/documentation/widgetkit/accessorywidgetbackground) API 对应。

适合以下场景：

- 使用 Expo UI 的 SwiftUI 组件开发 iOS 界面。
- 为 iOS 配件型 Widget 添加符合系统规范的背景。
- 希望背景根据 Widget 环境自动调整，而不是写死颜色或形状。
- 希望通过 React JSX 组合 SwiftUI 原生视图。

不适合或无法确认的场景：

- **Android**：当前组件只支持 iOS。
- **普通 React Web 页面**：它不是 DOM 元素或 CSS 背景组件。
- **具体支持哪些 Widget 家族和系统位置**：当前文档未涉及。
- **不同环境下的具体视觉差异**：当前文档未涉及。

## 阅读前需要理解的概念

### Expo UI

`@expo/ui` 是该组件所属的软件包。本页使用的是它提供的 SwiftUI 接口：

```tsx
import { AccessoryWidgetBackground } from '@expo/ui/swift-ui';
```

这里的 `/swift-ui` 表示这些组件对应 Apple 的 SwiftUI 原生视图。虽然代码使用 JSX 编写，但最终使用的不是浏览器 DOM。

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS 等平台原生界面的声明式 UI 框架。

对 React Web 开发者而言，可以将其理解为：

- React 负责以 JSX 形式描述组件结构。
- `@expo/ui/swift-ui` 将相应组件映射到 SwiftUI 原生视图。
- 组件最终由 iOS 原生界面系统渲染，而不是浏览器渲染。

因此，不能把 SwiftUI 组件直接等同于 `<div>`、CSS 或普通 React Native `View`。

### Widget 环境

文档所说的“widget's environment”指 Widget 当前所处的系统显示环境。`AccessoryWidgetBackground` 会根据这个环境生成具有标准外观的自适应背景。

当前文档没有列出：

- 环境包含哪些具体状态。
- 每种环境对应什么颜色或形状。
- 开发者是否可以覆盖背景样式。

因此，不应根据本页内容假设具体视觉效果。

## 安装

根据项目使用的包管理器执行其中一条命令。

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

这些命令的作用都是安装 `@expo/ui`。

`expo install` 与 React Web 项目中常见的直接 `npm install` 不完全相同：它会结合 Expo 项目的 SDK 环境选择兼容的依赖版本。因此，在 Expo 项目中应使用文档给出的安装方式。

### 现有 React Native 项目的额外要求

如果是在已有的 React Native 原生项目中使用该组件，需要先安装并配置 `expo`，使项目能够使用 Expo Modules。

这类项目通常被称为 existing React Native app 或 bare React Native app。它与通过 Expo 模板创建、已经集成 Expo 能力的项目不同。

当前文档只说明了这一前置条件，没有提供具体的原生工程配置步骤。

## 基础用法

```tsx
import {
  AccessoryWidgetBackground,
  VStack,
  Text,
  ZStack,
} from '@expo/ui/swift-ui';

export default function BasicAccessoryWidgetBackground() {
  return (
    <ZStack>
      <AccessoryWidgetBackground />
      <VStack>
        <Text>MON</Text>
      </VStack>
    </ZStack>
  );
}
```

### 组件结构

示例使用 `ZStack` 将背景和内容叠放在一起：

1. `AccessoryWidgetBackground` 创建自适应背景。
2. `VStack` 以纵向布局承载内容。
3. `Text` 显示文本 `MON`。
4. `ZStack` 按层叠关系组合背景和前景内容。

可以将 `ZStack` 类比为 Web 中将多个元素放入同一个定位上下文并叠加显示，但它是 SwiftUI 的原生布局容器，不是设置了 `position` 的 DOM 元素。

组件顺序在这里具有实际意义：背景先声明，内容随后声明并显示在背景上方。

### 为什么不能只使用 CSS

`AccessoryWidgetBackground` 不是一个固定颜色的背景样式，而是由 iOS Widget 环境决定外观的原生视图。

React Web 中可能通过以下方式设置背景：

```css
background: #fff;
```

这里则通过一个独立的 SwiftUI 视图表达系统语义：

```tsx
<AccessoryWidgetBackground />
```

两者的主要差异是：前者由开发者指定视觉属性，后者将标准背景的具体呈现交给 iOS 系统处理。

## API

### 导入方式

```tsx
import { AccessoryWidgetBackground } from '@expo/ui/swift-ui';
```

必须从 `@expo/ui/swift-ui` 导入，而不是仅从 `@expo/ui` 导入。

### `AccessoryWidgetBackground`

支持平台：

```text
iOS
```

类型：

```tsx
React.Element<CommonViewModifierProps>
```

这说明它可以作为 React JSX 元素使用，并接受 `CommonViewModifierProps` 类型定义的通用视图修饰属性。

“Modifier”是 SwiftUI 中用于调整视图布局、外观或行为的机制。可以将其粗略类比为 React 组件属性与部分 CSS 能力的组合，但两者的语义和执行方式并不相同。

当前文档没有列出 `CommonViewModifierProps` 的具体字段，需要查阅单独的 SwiftUI Modifiers 文档。本文也没有定义 `AccessoryWidgetBackground` 专属属性。

## 限制与注意事项

### 仅支持 iOS

API 明确标注支持平台为 iOS。不要在 Android 代码路径中无条件使用它。

当前文档没有说明在 Android 上使用时会：

- 编译失败；
- 运行时报错；
- 返回空视图；
- 还是由框架自动忽略。

因此，跨平台项目应在架构上明确区分平台代码，不能假设它具有 Android 降级行为。

### Expo Go 已包含不等于跨平台可用

页面上的 “Included in Expo Go” 表示相关原生能力已包含在 Expo Go 客户端中，不等于该组件支持 Expo Go 所运行的所有平台。组件本身仍然仅支持 iOS。

### 文档属于未来 SDK

这是最重要的版本风险：本页描述的是下一个 SDK 版本中的 API。

**基于文档内容推导：** 如果当前项目所用 SDK 尚未包含对应版本的 `@expo/ui`，即使安装成功，也可能没有该导出或具有不同的类型定义。实际开发时应核对项目 SDK 和稳定版文档。

### 不要假设它是完整 Widget 容器

示例将它放在 `ZStack` 中作为背景层。本页只说明它创建自适应背景，并没有说它能够：

- 创建或注册一个 Widget；
- 配置 Widget Extension；
- 定义 Widget 数据刷新逻辑；
- 处理时间线或系统生命周期；
- 替代 WidgetKit 的其他工程配置。

因此，它只是 Widget 界面中的一个视图组件，而不是完整的 Widget 开发方案。

### 当前文档未涉及的配置

本页没有提供以下内容：

- `app.json` 或 `app.config.js` 配置。
- Expo Config Plugin 配置。
- iOS 原生文件或目录修改。
- Widget Extension 创建流程。
- 构建、运行或发布命令。
- 组件专属参数。
- Android 替代实现。
- 错误处理或故障排查方式。

这些内容不能根据本页自行补全或推断。

## React Web 开发者容易误解的地方

### JSX 不代表 Web UI

代码看起来与 React Web 相似，但组件不会生成 HTML。`ZStack`、`VStack` 和 `AccessoryWidgetBackground` 都对应 SwiftUI 原生视图。

因此，以下 Web 概念不能直接套用：

- DOM 层级。
- CSS 选择器。
- `className`。
- 浏览器兼容性。
- `z-index` 的完整行为模型。

### 背景是一个视图，而不是样式属性

示例将背景作为 `ZStack` 的一个子组件，而不是传给容器的 `style.background`。理解这一点有助于正确阅读 SwiftUI 的声明式布局结构。

### React Native、Expo 与 SwiftUI 不是同一层

可以按以下层次理解：

- React：提供组件化和 JSX 表达方式。
- React Native / Expo：负责 JavaScript 与移动端原生能力的集成。
- Expo UI SwiftUI：暴露可通过 React 使用的 SwiftUI 原生组件。
- SwiftUI / WidgetKit：Apple 平台的原生 UI 和 Widget 能力。

`AccessoryWidgetBackground` 位于最后两层的交界处，因此会受到 iOS 平台和系统 Widget 规则限制。

## 实际开发建议

以下建议不属于当前文档直接给出的 API 说明。

### 核对 SDK 与依赖版本

**基于文档内容推导：** 在使用前应确认项目 SDK 对应版本确实包含该 API，因为当前页面属于未来 SDK 文档。不要只根据未版本化页面判断项目中一定可用。

### 将平台边界表达在代码中

**基于经验建议：** 跨平台项目可以使用 `.ios.tsx` 文件或已有的平台分支机制隔离该组件，避免 Android 构建或运行路径意外引用 iOS 专属 API。

### 保持系统背景的语义

**基于文档内容推导：** 该组件的价值是提供由 Widget 环境决定的标准外观。若业务目标正是遵循系统 Widget 视觉规范，应优先使用它，而不是自行复刻一个固定背景。

### 在真实目标环境验证效果

**基于经验建议：** 由于文档没有展示不同 Widget 环境中的具体效果，开发时应在实际支持的 iOS Widget 环境中验证视觉表现，不要仅以普通应用页面或单一预览结果作为判断依据。

## 总结

`AccessoryWidgetBackground` 是 `@expo/ui/swift-ui` 中的 iOS 专属组件，对应 Apple 官方 SwiftUI API。它的职责很单一：在 Widget 界面中提供能够根据环境自动适配的系统标准背景。

典型用法是把它作为 `ZStack` 的底层视图，再将文字等内容叠放在其上。安装时使用 `expo install @expo/ui`；现有 React Native 项目还需要先集成 Expo Modules。

需要重点记住：

- 它只支持 iOS。
- Expo Go 已包含该能力，但这不代表 Android 可用。
- 它是背景视图，不是完整的 Widget 创建或配置方案。
- 当前页面属于下一个 SDK 版本，项目开发应核对实际 SDK 对应的稳定文档。
- 本页没有说明组件专属参数、原生工程配置、Widget 注册流程或不同环境下的具体视觉效果。

---

## 文档导航

- **上一页**：[swift ui](./73__swift-ui.md)
- **下一页**：[alert](./75__alert.md)
