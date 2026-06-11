# Divider：使用 SwiftUI 原生分隔线组织内容

> 原文档修改日期：2026 年 5 月 19 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go
>
> **版本提醒：**该页面描述的是下一个 Expo SDK 版本，并非当前稳定版本。原文指出，当前最新稳定文档对应 **SDK 56**。实际项目应根据所用 Expo SDK 版本查阅匹配的文档。

## 文档解决的问题

`Divider` 是 `@expo/ui` 提供的 SwiftUI 组件，用于在相邻内容之间创建原生视觉分隔线。

它适合以下场景：

- 分隔页面中的不同内容区域。
- 分隔垂直列表里的相邻项目。
- 在上下文菜单中区分不同类型的操作。
- 将普通操作与删除等危险操作进行视觉分组。

它的作用类似于 React Web 中的 `<hr>` 或带边框的分隔元素，但底层使用的是 Apple 原生 SwiftUI `Divider`，而不是 HTML 和 CSS。

## 阅读前需要理解的背景

### Expo UI 与 SwiftUI

`@expo/ui` 允许 React Native 应用通过 React 组件使用原生平台 UI。

本页使用的导入路径是：

```tsx
import { Divider } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表明组件底层对应 Apple 的 SwiftUI，因此本页明确支持的平台只有：

- iOS
- tvOS

文档没有说明 Android 或 Web 支持情况。不能因为它以 React 组件形式使用，就推断它可以跨所有 React Native 平台运行。

### `Host` 的作用

示例中的 SwiftUI 组件都放在 `Host` 内：

```tsx
<Host matchContents>
  {/* SwiftUI 内容 */}
</Host>
```

对于 React Web 开发者，可以将 `Host` 理解为 React Native 与原生 SwiftUI 视图之间的承载容器。

示例都使用了 `matchContents`，说明容器需要根据内部 SwiftUI 内容匹配尺寸。不过，当前文档没有进一步解释该属性的完整行为。

### `VStack` 与 `Text`

`VStack` 是 SwiftUI 风格的垂直布局容器，作用近似于：

```css
display: flex;
flex-direction: column;
```

`Text` 是 SwiftUI 文本组件，不是 HTML 的文本节点，也不是 React Native 核心包中的 `Text`。

这些组件与 `Divider` 一样，都从下面的入口导入：

```tsx
import { Host, Divider, VStack, Text } from '@expo/ui/swift-ui';
```

## 安装

在 Expo 项目中安装 `@expo/ui`：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

### 为什么使用 `expo install`

`expo install` 会根据项目使用的 Expo SDK 选择兼容的依赖版本。它与直接执行 `npm install` 的关注点不同：后者通常安装包管理器解析出的版本，不一定与当前 Expo SDK 匹配。

选择与项目包管理器对应的一条命令即可，不需要全部执行。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生工程，而不是标准 Expo 项目，需要先在项目中安装并配置 `expo`，才能使用 Expo Modules，包括 `@expo/ui`。

当前文档只指出了这项前置要求，没有展开原生工程的具体配置步骤。

## 基础用法

```tsx
import { Host, Divider, VStack, Text } from '@expo/ui/swift-ui';

export default function BasicDividerExample() {
  return (
    <Host matchContents>
      <VStack>
        <Text>First section</Text>
        <Divider />
        <Text>Second section</Text>
      </VStack>
    </Host>
  );
}
```

组件结构为：

1. 使用 `Host` 承载 SwiftUI 内容。
2. 使用 `VStack` 垂直排列内容。
3. 将 `Divider` 放在需要分隔的两个组件之间。

`Divider` 是一个视觉元素，本身没有文本内容，因此采用自闭合写法：

```tsx
<Divider />
```

## 在列表中使用

```tsx
import { Host, Divider, VStack, Text } from '@expo/ui/swift-ui';

export default function DividerInListExample() {
  return (
    <Host matchContents>
      <VStack spacing={8}>
        <Text>Item 1</Text>
        <Divider />
        <Text>Item 2</Text>
        <Divider />
        <Text>Item 3</Text>
        <Divider />
        <Text>Item 4</Text>
      </VStack>
    </Host>
  );
}
```

这里通过 `VStack spacing={8}` 设置垂直排列元素之间的间距，并在相邻项目之间插入分隔线。

需要注意，示例没有在最后一个项目之后添加 `Divider`。这体现了分隔线的语义：它用于分隔两个相邻项目，而不是为整个列表绘制外边框。

当前文档没有介绍：

- 如何自动为大量列表项插入分隔线。
- 如何配合虚拟列表使用。
- 大型列表中的性能处理方式。
- 如何隐藏指定项目后的分隔线。

因此，本例应理解为静态内容结构示范，而不是完整的列表组件方案。

## 在上下文菜单中使用

```tsx
import { Host, ContextMenu, Button, Text, Divider } from '@expo/ui/swift-ui';

export default function DividerInContextMenuExample() {
  return (
    <Host matchContents>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Edit" onPress={() => console.log('Edit')} />
          <Button
            label="Duplicate"
            onPress={() => console.log('Duplicate')}
          />
          <Divider />
          <Button
            label="Delete"
            role="destructive"
            onPress={() => console.log('Delete')}
          />
        </ContextMenu.Items>

        <ContextMenu.Trigger>
          <Text>Long press me</Text>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
```

这个例子展示了 `Divider` 的另一种用途：对菜单操作进行语义分组。

菜单结构包括：

- `ContextMenu.Items`：定义菜单中显示的操作。
- `ContextMenu.Trigger`：定义触发上下文菜单的内容。
- `Divider`：将普通操作和删除操作分开。
- `role="destructive"`：将删除按钮声明为破坏性操作。

用户长按 `ContextMenu.Trigger` 中的文本后，可以打开上下文菜单。

这里的分隔线不是普通页面布局中的装饰线，而是上下文菜单原生内容结构的一部分。

## API 说明

### 导入方式

```tsx
import { Divider } from '@expo/ui/swift-ui';
```

不要从 React Native 核心包或 `@expo/ui` 根入口进行未经文档说明的导入。

### 组件类型

文档给出的类型为：

```tsx
React.Element<CommonViewModifierProps>
```

这表示 `Divider` 是一个 React 元素，并支持 `CommonViewModifierProps`。

`CommonViewModifierProps` 对应 Expo UI SwiftUI 组件的通用视图修饰能力。当前页面没有列出这些修饰属性，需要查阅单独的 SwiftUI Modifiers 文档。

本页没有定义 `Divider` 专属属性，也没有展示用于直接设置颜色、粗细或样式的专属参数。

### 原生实现

Expo UI 的 `Divider` 使用 Apple 原生 SwiftUI `Divider` 组件。

这意味着：

- 它不是通过 React Native 普通 `View` 手动绘制的线条。
- 它会参与 SwiftUI 原生布局。
- 其基础行为与 Apple 官方 SwiftUI `Divider` API 对齐。

文档只说明 API 与原生 SwiftUI `Divider` 匹配，没有进一步承诺所有平台表现、样式定制方式或不同系统版本的视觉结果完全一致。

## React Web 开发者容易误解的地方

### 它不是 DOM 元素

虽然代码使用 TSX 编写，但运行环境中没有浏览器 DOM。以下 Web 技术不能直接应用：

- `<hr>`
- CSS 选择器
- `border-bottom`
- `className`
- 浏览器开发者工具中的盒模型

`Divider` 最终创建的是原生 SwiftUI 视图。

### React 写法不代表跨平台支持

React 只负责声明组件结构，具体渲染能力仍由底层平台决定。本组件明确支持 iOS 和 tvOS，不能仅凭 TSX 写法推断它支持 Android 或 Web。

### `VStack` 不是 CSS Flexbox

`VStack` 的效果类似纵向 Flexbox，但它属于 SwiftUI 布局系统。`spacing={8}` 也不是 CSS 的 `gap: 8px`。

当前文档没有说明该数值对应的精确单位，不应擅自将其解释为 CSS 像素。

### 上下文菜单不等同于浏览器右键菜单

示例通过长按触发 `ContextMenu`。这更接近移动设备上的原生长按菜单，而不是 Web 页面依赖鼠标右键触发的菜单。

## 注意事项与限制

1. **平台有限制。**组件文档明确标注支持 iOS 和 tvOS，没有声明支持 Android 或 Web。

2. **文档版本具有前瞻性。**当前页面属于下一个 Expo SDK 版本。使用 SDK 56 或其他稳定版本时，应查看对应版本的文档和 API。

3. **已有 React Native 工程需要 Expo Modules。**如果不是 Expo 项目，需要先安装和配置 `expo`。

4. **必须使用 SwiftUI 入口。**文档指定从 `@expo/ui/swift-ui` 导入组件。

5. **没有记录专属配置项。**本页没有列出颜色、粗细、方向或样式等 `Divider` 专属属性。

6. **通用修饰属性未在本页展开。**虽然类型包含 `CommonViewModifierProps`，但具体可用属性需要查阅 Modifiers 文档。

7. **动态列表方案未涉及。**文档仅展示手动插入多个 `Divider` 的静态示例。

8. **无障碍行为未涉及。**当前文档没有说明分隔线是否会进入无障碍树，以及是否需要额外配置。

9. **测试与原生构建流程未涉及。**文档没有提供 iOS 模拟器、tvOS 模拟器、原生构建或自动化测试相关说明。

## 实际开发建议

以下内容是对文档示例的应用性整理，不是原文直接给出的 API 承诺。

### 基于文档内容推导

- `Divider` 应放在两个需要分组或分隔的内容之间，而不是机械地放在容器末尾。
- 在菜单中，它适合区分普通操作和破坏性操作。
- 如果应用需要同时支持 Android，应为该页面准备平台适配方案，因为本文没有提供 Android 版本的 `Divider`。
- 由于组件使用原生 SwiftUI 实现，修改样式前应先确认 `CommonViewModifierProps` 和对应 SDK 版本实际支持的能力。

### 基于经验建议

- 对少量静态内容，可以像文档示例一样直接插入 `<Divider />`。
- 对动态数据列表，宜通过数据渲染逻辑控制分隔线位置，避免在最后一项后显示多余分隔线。
- 不要只依赖分隔线表达危险操作。删除按钮还应像示例一样使用 `role="destructive"` 等语义信息。
- 在多平台项目中，应尽早验证 Android 和 Web 的替代实现，避免在业务组件中无条件引用仅支持 Apple 平台的组件。
- 升级 Expo SDK 后，应重新检查 `@expo/ui`、SwiftUI Modifiers 和平台支持范围。

## 信息边界

### 文档明确说明

- `Divider` 用于创建内容之间的视觉分隔线。
- 它与 Apple 官方 SwiftUI `Divider` API 对齐。
- 底层使用原生 SwiftUI `Divider`。
- 包名是 `@expo/ui`。
- 从 `@expo/ui/swift-ui` 导入。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 可以用于普通内容、列表和上下文菜单。
- 已有 React Native 项目必须先安装 `expo`。
- 组件支持 `CommonViewModifierProps`。

### 当前文档未说明

- Android 和 Web 的替代组件。
- 分隔线颜色、粗细和方向的专属配置。
- `CommonViewModifierProps` 的完整字段。
- 具体系统版本要求。
- 动态列表和虚拟列表集成方式。
- 无障碍行为。
- 性能特征。
- 测试、调试和原生构建流程。

## 总结

`Divider` 是 `@expo/ui/swift-ui` 提供的原生视觉分隔组件。基本使用方式是在 `Host` 承载的 SwiftUI 组件树中，将 `<Divider />` 放到两个内容或两组操作之间。

对于 React Web 开发者，最重要的是区分“React 声明语法”和“底层渲染平台”：它虽然使用 TSX，但不是 HTML `<hr>`，也不使用 CSS，而是创建原生 SwiftUI 视图。由于该组件仅明确支持 iOS 和 tvOS，多平台项目还需要额外考虑 Android 与 Web 的实现。

---

## 文档导航

- **上一页**：[disclosuregroup](./83__disclosuregroup.md)
- **下一页**：[form](./85__form.md)
