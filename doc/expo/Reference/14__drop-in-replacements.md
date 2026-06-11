# Drop-in replacements：React Native 社区组件的兼容替代方案

## 文档解决的问题

这篇文档介绍 `@expo/ui` 提供的一组 **Drop-in replacements（可直接替换组件）**。

它们用于替代常见的 React Native 社区组件库，并尽量保持与原库 API 兼容，从而降低迁移成本。

简单理解：

```text
原 React Native 社区组件
        ↓ 替换
@expo/ui 中 API 兼容的组件
```

这不是一篇具体组件的使用教程，而是一个替代组件的索引页。每个组件的具体属性、安装方式和示例代码，需要进入对应的子文档查看。

## 适用场景

这篇文档适合以下情况：

- Expo 项目正在使用 React Native 社区组件，希望迁移到 `@expo/ui`。
- 新项目需要底部面板、日期选择器、滑块等常见移动端 UI。
- 希望 Android 和 iOS 使用各自的现代原生 UI 技术实现组件。
- 需要确认某个社区组件是否存在 `@expo/ui` 兼容替代品。
- 希望所用组件可以运行在 Expo Go 中。

如果项目没有使用文档列出的社区库，不能仅凭本页判断是否可以直接替换，需要继续查阅各组件的详细文档。

## 阅读前需要理解的概念

### React Native 社区库

React Native 本身不会提供所有 UI 组件。日期选择器、分页视图和滑块等功能，经常由独立的社区 npm 包提供，例如：

```text
@react-native-community/datetimepicker
@react-native-community/slider
react-native-pager-view
```

这类似于 React Web 项目引入第三方组件库，但 React Native 社区组件通常还包含 Android 和 iOS 原生代码，不只是 JavaScript 或 CSS。

### `@expo/ui`

`@expo/ui` 是本文介绍的 Expo UI 包。文档列出的替代组件均由该包提供。

这些组件底层使用：

- Android：Jetpack Compose
- iOS：SwiftUI

Jetpack Compose 和 SwiftUI 分别是 Android 与 iOS 的现代原生声明式 UI 框架。对于 React Web 开发者，可以暂时将它们理解为原生平台构建界面的底层技术。

这意味着组件最终呈现的是原生 UI，而不是浏览器 DOM 元素。

### Drop-in replacement

“Drop-in replacement”通常表示：新实现与原组件的 API 足够兼容，可以用较低成本替换原依赖。

例如，原项目可能使用：

```tsx
import Slider from '@react-native-community/slider';
```

迁移时可能改为从 `@expo/ui` 对应入口导入，并继续使用相近的 props 和事件接口。

> **注意：**以上代码只用于解释“替换”的概念，不是原文提供的正式迁移示例。具体导入路径和迁移方式应以对应组件的子文档为准。

“API-compatible”也不应被理解为所有行为、视觉效果和边界情况都完全相同。当前索引页没有说明兼容范围、差异或迁移限制。

## 可替换的组件

文档列出了八组兼容替代关系。

| `@expo/ui` 组件 | 兼容的社区库 | 主要用途 |
|---|---|---|
| `BottomSheet` | `@gorhom/bottom-sheet` | 从屏幕底部展开的面板 |
| `DateTimePicker` | `@react-native-community/datetimepicker` | 选择日期或时间 |
| `MaskedView` | `@react-native-masked-view/masked-view` | 使用内容形状作为遮罩 |
| `Menu` | `@react-native-menu/menu` | 显示原生菜单 |
| `PagerView` | `react-native-pager-view` | 构建可横向或纵向翻页的视图 |
| `Picker` | `@react-native-picker/picker` | 从候选项中选择一个值 |
| `SegmentedControl` | `@react-native-segmented-control/segmented-control` | 在多个互斥选项之间切换 |
| `Slider` | `@react-native-community/slider` | 在连续或离散范围内选择数值 |

用途说明是为了帮助 React Web 开发者理解组件类型；具体功能边界仍应以各组件文档为准。

## 平台支持

文档明确标注这些替代组件支持：

- Android
- iOS
- Web
- Expo Go

### Expo Go 是什么

Expo Go 是用于运行和预览 Expo 项目的移动端应用。文档标注“Included in Expo Go”，说明这些组件已经包含在 Expo Go 的运行环境中。

这通常意味着开发者可以在 Expo Go 中直接调试它们，而不必先为组件原生代码制作自定义开发客户端。

> **基于文档内容推导：**由于页面明确标注 Expo Go 支持，因此这些替代组件适合希望保持 Expo Go 调试流程的项目。具体是否需要安装包、如何导入以及是否存在版本要求，本页没有说明。

### Web 支持不等于 DOM 组件

对于 React Web 开发者，需要特别注意：

- React Native Web 使用 React Native 风格的组件与 API。
- 支持 Web 不代表组件直接等价于 HTML 元素或浏览器 UI 库。
- Android、iOS 和 Web 上的视觉效果与交互细节可能不同。

后两点属于移动端跨平台开发的一般影响。当前文档只明确列出了 Web 支持，没有描述各平台的实现差异。

## 实际迁移流程

当前页面没有提供正式迁移步骤。结合它作为组件索引页的定位，实际使用时应按以下顺序继续确认。

1. 找到项目当前使用的社区组件库。
2. 检查它是否出现在本文的兼容列表中。
3. 打开对应的 `@expo/ui` 组件子文档。
4. 核对安装命令、导入路径、props、事件和平台支持。
5. 检查原项目是否使用了社区库的高级能力或特殊配置。
6. 替换依赖并分别在 Android、iOS 和 Web 上验证行为。

其中第 1、2 步来自本文提供的替代关系；其余步骤是**基于文档内容推导**出的稳妥迁移流程，而不是原文明确给出的操作指南。

## 配置、命令和工程文件

当前文档未涉及以下内容：

- 安装命令
- 卸载旧依赖的命令
- 具体导入语句
- 组件 props
- TypeScript 类型
- Expo 配置
- Config Plugin
- `app.json` 或 `app.config.js`
- Android 原生工程配置
- iOS 原生工程配置
- 权限声明
- 构建命令

因此，不能仅根据本页直接完成组件接入或依赖迁移。相关信息需要在具体组件的子文档中确认。

## 限制与容易踩坑的地方

### API 兼容不一定代表完全相同

原文使用的是“API-compatible replacements”，只明确说明 API 兼容，没有承诺：

- 所有 props 都一一对应。
- 默认值完全相同。
- 动画与手势行为完全相同。
- Android、iOS 和 Web 的外观完全一致。
- 原社区库的扩展插件也能继续使用。
- 可以不修改任何代码直接替换。

因此，迁移前必须查阅具体组件文档，不能只修改包名后就认为迁移完成。

### 原生实现会带来平台差异

Android 使用 Jetpack Compose，iOS 使用 SwiftUI。即使 JavaScript API 相同，底层仍然是两套不同的平台实现。

对 React Web 开发者来说，这类似于一套组件 API 在不同环境中连接了不同的渲染后端。实际项目必须进行多平台测试，而不能只验证一个平台。

### 本页只是索引，不是完整 API 文档

本页的核心作用是告诉开发者：

- 有哪些替代组件。
- 每个组件替代哪个社区库。
- 支持哪些平台。
- 原生实现采用什么技术。

它没有提供足够信息来判断某个复杂项目能否无损迁移。

## React Web 开发者最容易误解的地方

### 不要把这些组件当成普通 Web 组件

React Web 主要操作 DOM，并通过 CSS 控制样式。React Native 组件则需要映射到 Android、iOS 或 Web 的具体实现。

因此，即使组件写法仍然是 JSX，也不能默认以下内容成立：

- 可以传入任意 DOM 属性。
- 可以直接使用普通 CSS。
- 各平台像不同浏览器一样仅存在轻微差异。
- 第三方包只有 JavaScript 代码，不涉及原生运行环境。

### Expo Go 不是浏览器开发服务器

Expo Go 是移动设备上的 Expo 运行容器。它包含一组预先集成的原生模块。本文标注这些组件已包含在 Expo Go 中，但这不表示所有 React Native 社区库也都能直接在 Expo Go 中运行。

### API 兼容不是视觉完全一致

Web 组件库中的“兼容”有时主要关注 props 和行为。这里还需要考虑 Android 与 iOS 的原生交互惯例。相同 API 可能在不同平台上呈现不同的原生外观。

## 实际开发建议

以下内容属于**基于经验建议**：

- 迁移时按组件逐个替换，避免一次更换全部 UI 依赖。
- 为关键交互保留 Android、iOS 和 Web 的回归测试。
- 优先验证项目实际使用的 props，不要只确认组件能够渲染。
- 特别检查手势、动画、焦点、无障碍和受控状态等交互细节。
- 删除旧依赖前，确认代码中没有其他模块继续引用它。
- 不要因为组件支持 Expo Go，就推断所有关联库和扩展能力也支持 Expo Go。

## 文档明确内容与推导内容

### 文档明确说明

- `@expo/ui` 提供 React Native 社区库的 API 兼容替代组件。
- Android 实现由 Jetpack Compose 驱动。
- iOS 实现由 SwiftUI 驡动。
- 页面列出了八个组件及其对应的兼容社区库。
- 页面标注支持 Android、iOS、Web 和 Expo Go。

### 基于文档内容推导

- 已使用对应社区库的项目可能以较低成本迁移到 `@expo/ui`。
- 迁移前仍需逐项核对具体组件 API。
- 使用不同原生 UI 技术意味着需要进行跨平台验证。
- 由于本页是索引页，完整接入方式必须从各组件子文档获取。

## 总结

这篇文档是 `@expo/ui` 可替代组件的总览入口。它说明 Expo 为八个常见 React Native 社区组件提供了 API 兼容方案，并通过 Jetpack Compose 和 SwiftUI 分别实现 Android 与 iOS 原生界面。

它能够帮助开发者确定“是否存在替代方案”，但不能单独回答“如何安装”和“是否能无损迁移”。实际开发中，应进入对应组件的详细文档，继续核对 API、平台差异和迁移限制。

---

## 文档导航

- **上一页**：[ui](./13__ui.md)
- **下一页**：[bottomsheet](./15__bottomsheet.md)
