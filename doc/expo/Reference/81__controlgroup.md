# ControlGroup：在 Expo SwiftUI 中组合交互控件

> 原文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go

## 文档解决的问题

`ControlGroup` 用于把多个相关的交互控件组织成一个控件组。

它对应 Apple SwiftUI 的原生 `ControlGroup` API。根据文档，当它被放在 `Menu` 中时，子控件会紧凑地排列成一行横向按钮，适合放置一组语义相关的快捷操作，例如：

- 添加
- 收藏
- 分享

这不是 React Web 中单纯用于布局的 `<div>`。它是对 SwiftUI 原生组件的 React 封装，最终外观和行为由 Apple 平台决定。

## 版本与平台限制

这篇页面属于 Expo **下一个 SDK 版本**的未发布文档，而不是当前稳定版本文档。

原文明确指出：

- 当前稳定版本是 Expo SDK 56。
- 组件支持 iOS 和 tvOS。
- 可以在 Expo Go 中使用。
- tvOS 必须为 **17.0 或更高版本**。
- `label` 和 `systemImage` 在 iOS 上必须为 **16.0 或更高版本**。
- `label` 和 `systemImage` 在 tvOS 上必须为 **17.0 或更高版本**。

因此，使用当前页面中的 API 前，需要确认项目实际采用的 Expo SDK 版本是否已经包含这些能力。

## 阅读前需要理解的概念

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的 UI 框架。

在这里，React 组件并不会被渲染成浏览器 DOM，而是通过 `@expo/ui` 对接 SwiftUI 原生组件。

可以用下面的方式建立初步类比：

| React Web | 本文中的 Expo SwiftUI |
|---|---|
| 浏览器 DOM 元素 | Apple 原生 SwiftUI 视图 |
| CSS 布局与样式 | SwiftUI 的布局和平台样式 |
| `<button>` | `@expo/ui/swift-ui` 的 `Button` |
| 点击事件 | `onPress` |
| Material Icons 等图标库 | Apple SF Symbols |

这个类比仅用于理解角色，并不表示两者的布局和样式机制完全相同。

### `ControlGroup`

`ControlGroup` 表示一组相关的交互控件。它的子节点可以是：

- `Button`
- `Toggle`
- `Picker`
- 其他交互控件

文档重点展示了它位于 `Menu` 内部的用法。在该场景中，多个子按钮会显示为紧凑的横向按钮行。

### `Menu`

示例使用 `Menu` 作为操作菜单，并将 `ControlGroup` 放在菜单内部。

当前文档没有完整介绍 `Menu` 的属性和行为，只能确认：

- `label` 用于设置菜单文本。
- `systemImage` 用于设置菜单的 SF Symbol 图标。
- `Menu` 可以包含 `ControlGroup` 和单独的 `Button`。

需要了解更多 `Menu` 行为时，应查阅对应的 `Menu` 文档。

### SF Symbols

SF Symbols 是 Apple 提供的系统图标集合。示例中的以下字符串都是 SF Symbol 名称：

```text
ellipsis.circle
plus
star
square.and.arrow.up
```

`systemImage` 不是任意图片 URL，也不是 React Web 中的 CSS 图标类名。传入值必须是组件类型定义允许的 SF Symbol 名称。

## 安装

根据项目使用的包管理器执行对应命令。

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

`expo install` 用于安装与当前 Expo SDK 兼容的依赖版本。它的作用不只是调用普通包管理器安装最新版软件包。

四条命令只需要选择一条，不需要全部执行。

### 已有 React Native 项目的额外要求

如果是在不以 Expo 为基础的现有 React Native 项目中安装 `@expo/ui`，原文要求先在项目中安装并配置 `expo`。

这意味着：

- `@expo/ui` 不能被当作一个完全独立的普通 React 组件库使用。
- 已有 React Native 原生工程需要具备 Expo Modules 的运行环境。
- 当前文档未提供该配置的完整步骤，需要参考 Expo 的“在现有 React Native 项目中安装 Expo Modules”文档。

当前文档未涉及 iOS 原生工程、CocoaPods 或构建配置的具体操作。

## 基本用法

```tsx
import { Host, Menu, ControlGroup, Button } from '@expo/ui/swift-ui';

export default function BasicControlGroupExample() {
  return (
    <Host matchContents>
      <Menu label="Options" systemImage="ellipsis.circle">
        <ControlGroup>
          <Button
            systemImage="plus"
            label="Add"
            onPress={() => console.log('Add')}
          />
          <Button
            systemImage="star"
            label="Favorite"
            onPress={() => console.log('Favorite')}
          />
          <Button
            systemImage="square.and.arrow.up"
            label="Share"
            onPress={() => console.log('Share')}
          />
        </ControlGroup>

        <Button
          label="Other Action"
          onPress={() => console.log('Other')}
        />
      </Menu>
    </Host>
  );
}
```

示例形成的组件层级为：

```text
Host
└── Menu
    ├── ControlGroup
    │   ├── Button：Add
    │   ├── Button：Favorite
    │   └── Button：Share
    └── Button：Other Action
```

其中：

- `ControlGroup` 中的三个按钮显示为紧凑的横向图标按钮行。
- `Other Action` 不属于控件组，是菜单中的独立操作。
- 每个按钮通过 `onPress` 响应用户操作。
- 示例使用 `console.log` 演示事件处理，实际项目可以在其中执行状态更新、导航或业务操作。

`Host` 是示例运行 SwiftUI 内容的外层容器，`matchContents` 表明容器尺寸与其内容匹配。当前文档只展示了这一用法，没有进一步说明 `Host` 或 `matchContents` 的完整语义和限制。

## API

组件从以下入口导入：

```tsx
import { ControlGroup } from '@expo/ui/swift-ui';
```

不要从 `react-native` 或 `@expo/ui` 根路径直接推断导入位置。当前文档明确使用的是 SwiftUI 子路径：

```text
@expo/ui/swift-ui
```

### `ControlGroup`

类型：

```tsx
React.Element<ControlGroupProps>
```

支持平台：

- iOS
- tvOS

它是一个 React 元素，但底层对应 SwiftUI 的原生 `ControlGroup`。

## 属性说明

### `children`

```tsx
children: ReactNode
```

平台要求：

- iOS
- tvOS 17.0 及以上

`children` 是控件组中的内容，可以包含：

- `Button`
- `Toggle`
- `Picker`
- 其他交互控件

文档没有说明：

- 子控件数量上限
- 是否允许普通文本节点
- 不同控件混合排列时的具体外观
- `ControlGroup` 位于 `Menu` 之外时的具体呈现方式

因此不能根据本页假设所有 React 节点都能获得合理的原生显示效果。文档明确推荐的是交互控件。

### `label`

```tsx
label?: ReactNode
```

平台要求：

- iOS 16.0 及以上
- tvOS 17.0 及以上

`label` 是控件组的可选标签：

- 可以传入字符串，显示简单文本。
- 可以传入 `Label` 组件，提供自定义标签内容。
- 省略时，控件组没有标签。

示意写法：

```tsx
<ControlGroup label="Editing">
  {/* 交互控件 */}
</ControlGroup>
```

原文没有展示 `Label` 组件的具体代码，也没有说明标签在各个上下文中的准确显示位置。

### `systemImage`

```tsx
systemImage?: SFSymbols7_0
```

平台要求：

- iOS 16.0 及以上
- tvOS 17.0 及以上

该属性用于在标签旁显示 SF Symbol。

关键限制是：

> `systemImage` 只在 `label` 为字符串时使用。

例如：

```tsx
<ControlGroup label="Editing" systemImage="pencil">
  {/* 交互控件 */}
</ControlGroup>
```

如果 `label` 使用自定义 `Label` 组件，则不能假设 `systemImage` 仍会生效。此时应由自定义标签内容负责图标呈现。

其类型来自 `SFSymbols7_0`，表示可使用的名称受到 SF Symbols 类型定义约束，而不是任意字符串。

### 继承属性

`ControlGroup` 还继承：

```text
CommonViewModifierProps
```

这些属性对应 Expo UI SwiftUI 的通用视图修饰能力。

当前页面没有列出具体修饰属性、优先级或平台限制，需要查阅单独的 modifiers 文档，不能从本页推断其完整用法。

## 容易踩坑的地方

### 不要将它当作通用横向布局组件

`ControlGroup` 的核心语义是“组织交互控件”，而不是替代 Web 中的 Flexbox。

原文只明确保证：当它位于 `Menu` 中时，子控件会呈现为紧凑的横向按钮行。不要据此推断它在任何父组件中都会产生相同布局。

### 平台版本要求并不完全一致

虽然组件整体支持 iOS 和 tvOS，但具体属性有更细的版本限制：

| 功能 | iOS | tvOS |
|---|---:|---:|
| `ControlGroup` / `children` | 支持 | 17.0+ |
| `label` | 16.0+ | 17.0+ |
| `systemImage` | 16.0+ | 17.0+ |

仅检查“支持 tvOS”是不够的，还需要检查最低系统版本。

### `systemImage` 依赖字符串标签

下面这种组合符合文档描述：

```tsx
<ControlGroup label="Actions" systemImage="ellipsis">
  {/* ... */}
</ControlGroup>
```

但如果 `label` 是自定义 React 节点，`systemImage` 不会按照字符串标签的规则使用。

### 当前页面不是稳定版文档

页面属于 `unversioned` 路径，面向下一个 Expo SDK。项目使用 SDK 56 或其他稳定版本时，应核对对应版本页面，避免照搬尚未进入当前 SDK 的 API。

### Web 平台不在支持范围内

文档只列出 iOS 和 tvOS，没有列出 Web 或 Android。因此不能将该组件当作跨 iOS、Android 和 Web 的通用 UI 方案。

如项目同时支持其他平台，需要在更高层考虑平台分支或替代组件。不过具体分支实现方式属于工程设计，当前文档未涉及。

## React Web 开发者需要特别注意的地方

1. `ControlGroup` 不是 DOM 容器，不能使用 CSS Flexbox 的思维控制其内部布局。
2. 组件外观遵循 SwiftUI 和操作系统规范，不应假设能够像 Web 组件一样进行任意样式覆盖。
3. `systemImage` 引用的是 Apple 系统图标名称，不是图片路径或 Web 图标组件。
4. `onPress` 类似 Web 的 `onClick`，但名称和移动端组件约定不同。
5. JSX 结构仍然由 React 描述，但最终渲染目标是原生 SwiftUI 视图。
6. “支持某个平台”不等于支持该平台的所有系统版本，必须同时检查属性级版本要求。
7. Expo Go 中包含该组件，并不意味着 Android 或 Web 也支持它；Expo Go 只是文档声明的可用运行环境之一。

## 实际开发中的使用方式

适合使用 `ControlGroup` 的场景包括：

- 菜单中的一组快捷操作
- 一组语义相关的按钮
- 需要统一组织的 `Toggle` 或 `Picker`
- 希望界面遵循 Apple 原生控件组表现的 iOS、tvOS 功能

示例中将高频且相关的“添加、收藏、分享”放入同一组，将“其他操作”作为独立菜单项。这体现了控件分组的实际用途：通过视觉和结构表达操作之间的关系。

**基于文档内容推导：** 如果项目要求 iOS 和 Android 界面保持完全一致，`ControlGroup` 可能不适合作为唯一实现，因为当前文档没有声明 Android 支持。应先设计平台兼容策略。

**基于经验建议：** 分组时应保持操作数量适中，并确保图标语义清晰。紧凑的图标行如果包含过多操作，会降低可识别性和可点击性。

## 文档明确内容与推导内容

### 文档明确说明

- `ControlGroup` 对应官方 SwiftUI `ControlGroup` API。
- 位于 `Menu` 中时，子节点显示为紧凑的横向按钮行。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- tvOS 要求 17.0 或更高版本。
- 可以包含 `Button`、`Toggle`、`Picker` 等交互控件。
- `label` 可以是字符串或自定义 `Label` 组件。
- `label` 可以省略。
- `systemImage` 只在 `label` 为字符串时使用。
- 组件继承 `CommonViewModifierProps`。
- 现有 React Native 项目需要安装 Expo Modules。
- 当前页面面向下一个 SDK 版本，稳定版为 SDK 56。

### 基于文档内容推导

- 跨 Android 或 Web 的项目需要准备其他实现，因为这些平台未被列入支持范围。
- 不能依赖 `ControlGroup` 充当通用横向布局容器。
- 使用前需要同时检查 Expo SDK 版本和操作系统版本。
- 自定义 `Label` 场景应自行管理标签中的图标内容。

上述推导建立在平台列表、版本说明和属性行为之上，不是原文直接给出的工程实现方案。

## 当前文档未涉及的内容

当前文档没有说明：

- Android 和 Web 的替代方案
- `ControlGroup` 在 `Menu` 外部的详细视觉效果
- 子控件数量限制
- 无障碍属性和屏幕阅读器行为
- 样式定制示例
- `Label`、`Host`、`Menu` 和通用 modifiers 的完整 API
- iOS 原生工程的构建或签名配置
- 测试方式
- 状态管理方式
- 错误处理方式

这些内容不能仅凭本页确定，需要查阅相应组件或工程配置文档。

## 总结

`ControlGroup` 是 `@expo/ui/swift-ui` 提供的 Apple 平台原生控件组。它最明确的用途是在 `Menu` 中将多个相关操作显示成紧凑的横向按钮行。

实际使用时最重要的是确认三个条件：

1. 从 `@expo/ui/swift-ui` 正确导入组件。
2. 项目的 Expo SDK 包含当前 API。
3. 目标 iOS 或 tvOS 系统版本满足组件和属性的最低要求。

对于 React Web 开发者，应把它理解为具有平台语义和系统行为的原生 SwiftUI 组件，而不是一个可以通过 CSS 任意控制的 React 布局容器。

---

## 文档导航

- **上一页**：[contextmenu](./80__contextmenu.md)
- **下一页**：[datepicker](./82__datepicker.md)
