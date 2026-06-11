# Expo UI：Universal 跨平台组件

> 原文档更新时间：2026 年 5 月 23 日  
> 包名：`@expo/ui`  
> 支持平台：Android、iOS、Web、Expo Go

> **版本提醒：**当前页面属于 Expo **下一个 SDK 版本**的未发布版本文档，不是当前稳定版文档。原文指出，当前最新稳定版本为 **SDK 56**。实际项目应优先核对所使用 Expo SDK 对应的文档和 API。

## 文档解决的问题

`@expo/ui` 的 Universal 组件用于通过同一套 React 组件 API，为 Android、iOS 和 Web 构建共享界面。

它主要解决以下问题：

- 避免为 Android、iOS 和 Web 分别维护完全不同的 UI 组件树。
- 在移动端继续使用平台原生 UI：
  - Android 底层委托给 Jetpack Compose。
  - iOS 底层委托给 SwiftUI。
- 在 Web 端使用基于 `react-dom` 或 `react-native-web` 的 JavaScript 实现。
- 当通用 API 不够用时，仍允许开发者直接使用平台专属组件。

这不是一套要求各平台视觉效果完全一致的 Web 风格组件库。它提供的是**统一 API**，Android 和 iOS 上仍会保留对应平台的原生外观与交互感受。

## 阅读前需要理解的背景

### Expo 与 React Native

React Native 使用 React 的组件模型开发 Android 和 iOS 应用，但最终渲染的不是 HTML DOM。

Expo 是围绕 React Native 提供的一套开发工具和运行环境。`@expo/ui` 属于 Expo 提供的 UI 包。

对 React Web 开发者来说，可以暂时这样理解：

| React Web 概念 | 此处对应概念 |
|---|---|
| React 组件树 | Android、iOS、Web 共享的 Universal 组件树 |
| `react-dom` 渲染 HTML | 移动端由原生 UI 工具包完成渲染 |
| 跨浏览器兼容层 | Android、iOS、Web 的跨平台 API 层 |
| 平台专属实现 | SwiftUI 或 Jetpack Compose 组件 |

### SwiftUI 与 Jetpack Compose

- **SwiftUI**：Apple 的声明式 UI 框架，用于构建 iOS 等 Apple 平台的原生界面。
- **Jetpack Compose**：Android 的声明式 UI 框架。
- **声明式 UI**：通过组件描述界面应该是什么样子，而不是逐步操作具体视图。这一点与 React 的开发方式相似。

Universal 组件在移动端并没有用 WebView 渲染 HTML：

```text
Universal API
├── Android → @expo/ui/jetpack-compose → Jetpack Compose
├── iOS     → @expo/ui/swift-ui        → SwiftUI
└── Web     → react-dom 或 react-native-web
```

Web 端具体采用 `react-dom` 还是 `react-native-web`，由 `@expo/ui` 根据组件特性选择，而不是由业务代码统一指定。

## 安装

根据项目使用的包管理器执行对应命令：

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

这里使用的是 `expo install`，而不是直接执行 `npm install @expo/ui`。

`expo install` 是 Expo 提供的依赖安装方式。对 React Web 开发者而言，可以将它理解为带有 Expo 项目兼容性处理的包安装命令。

原文档没有进一步说明具体的版本选择机制，因此不能仅根据当前页面断言它将安装哪个确切版本。

### 已有 React Native 项目

如果项目是已有的 React Native 原生项目，而不是已经配置好的 Expo 项目，需要先按照 Expo 的说明安装 `expo`，然后才能使用该模块。

这意味着 `@expo/ui` 虽然能用于已有 React Native 应用，但它依赖 Expo Modules 环境，不能假设任何纯 React Native 工程安装该包后都会直接工作。

### 当前文档未涉及

原文没有提供以下信息：

- 最低 Android 或 iOS 系统版本。
- 对应的 React Native 最低版本。
- TypeScript 配置要求。
- iOS CocoaPods 或 Android Gradle 的具体操作。
- Web bundler 的额外配置。
- 是否需要重新生成或编译原生工程。
- 使用旧版 Expo SDK 时应安装的确切包版本。

这些问题应以项目所用 Expo SDK 的稳定版文档为准。

## 基本用法

```tsx
import { Host, Column, Button, Text } from '@expo/ui';

export default function Example() {
  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={12} alignment="center">
        <Text>Hello, world!</Text>
        <Button label="Press me" onPress={() => alert('Pressed')} />
      </Column>
    </Host>
  );
}
```

这段代码构建了一个简单的跨平台界面：

1. 从 `@expo/ui` 包根路径导入所有组件。
2. 用 `Host` 建立 Universal 组件子树的根容器。
3. 使用 `Column` 纵向排列内容。
4. 显示一段 `Text`。
5. 渲染一个 `Button`，点击后触发 `onPress`。

### `Host` 是必需的

每一棵 Universal 组件子树都必须包裹在 `Host` 中：

```tsx
<Host>
  {/* Universal components */}
</Host>
```

Universal `Host` 会根据运行平台进行分发：

- Android 使用对应的原生 Host。
- iOS 使用对应的原生 Host。
- 业务代码不需要自行导入平台专属 Host。

因此，使用 Universal API 时，应从包根路径统一导入：

```tsx
import { Host } from '@expo/ui';
```

不需要为了建立 Host 而直接访问：

```tsx
@expo/ui/swift-ui
@expo/ui/jetpack-compose
```

### 示例中的布局属性

```tsx
<Host style={{ flex: 1 }}>
```

`flex: 1` 表示让 `Host` 占用其父布局分配的可用空间。它属于 Flexbox 布局思维，不等同于 Web 中固定的 `width: 100%; height: 100%`。

```tsx
<Column spacing={12} alignment="center">
```

- `Column`：让子元素按纵向排列。
- `spacing={12}`：设置子元素之间的间距。
- `alignment="center"`：设置对齐方式。

原文只展示了这些属性的用法，没有在本页完整定义其取值范围和单位。具体属性行为需要查看 `Column` 的独立 API 页面。

### React Web 开发者容易误解的事件名称

按钮使用：

```tsx
<Button onPress={handler} />
```

而不是 Web 原生按钮常见的：

```tsx
<button onClick={handler} />
```

`onPress` 是 React Native 和移动端跨平台组件常用的交互事件命名。它抽象的是用户“按下并触发控件”的行为，不只是浏览器鼠标点击。

## 组件分类

本页提供的是 Universal 组件索引，没有详细列出各组件的完整 Props。

### 根容器

| 组件 | 作用 |
|---|---|
| `Host` | 每棵 Universal 组件子树必需的根容器 |

### 布局组件

| 组件 | 作用 |
|---|---|
| `Column` | 纵向排列子元素 |
| `Row` | 横向排列子元素 |
| `Spacer` | 在布局中创建可用间隔 |
| `ScrollView` | 提供可滚动区域 |

`Column` 和 `Row` 可以类比为预先表达排列方向的 Flexbox 容器，但不能因此假设它们支持所有 CSS Flexbox 属性。

### 展示组件

| 组件 | 作用 |
|---|---|
| `Text` | 显示文本 |
| `Icon` | 显示图标 |

在 React Native 风格的组件体系中，文本通常需要放进专门的 `Text` 组件，不能照搬 Web 中把字符串放进任意 HTML 容器的习惯。

### 交互控件

| 组件 | 作用 |
|---|---|
| `Button` | 按钮 |
| `Switch` | 开关 |
| `Checkbox` | 复选框 |
| `Slider` | 滑块 |
| `TextInput` | 文本输入 |
| `Picker` | 选项选择器 |

这些组件在 Android 和 iOS 上由各自的原生 UI 工具包承载，因此相同组件在不同平台上可能呈现不同的平台原生外观。

### 展开与呈现

| 组件 | 作用 |
|---|---|
| `BottomSheet` | 从界面底部呈现内容的面板 |
| `Collapsible` | 可以展开和收起内容的容器 |

`BottomSheet` 是移动端常见的交互形式。它不能简单等同于 Web 中固定定位在底部的普通 `<div>`，通常还涉及原生手势和呈现行为。不过，本页没有说明其具体手势、层级或生命周期规则。

### 集合与表单

| 组件 | 作用 |
|---|---|
| `List` | 列表容器，可配合 `ListItem` 使用 |
| `FieldGroup` | 对表单字段进行分组 |

本页仅说明 `List` 包含 `ListItem`，没有给出列表数据结构、渲染方式或性能特征。

## Universal 与平台专属 API 的选择

### 适合使用 Universal 的场景

当目标是让同一棵组件树不经修改地运行在 Android、iOS 和 Web 上时，优先使用 Universal 组件。

适合的典型场景包括：

- 三个平台共享结构一致的表单。
- 通用设置页面。
- 基础按钮、文本、输入框和列表界面。
- 希望共享业务组件，同时在移动端保留原生观感的功能。

Universal 的重点是**共享组件结构和 API**，并不承诺三个平台渲染出像素级一致的界面。

### 适合直接使用平台专属 API 的场景

当 Universal API 没有暴露所需的以下能力时，应直接使用对应平台的包：

```text
@expo/ui/swift-ui
@expo/ui/jetpack-compose
```

例如：

- 平台专属控件。
- Universal API 未暴露的修饰能力。
- 平台独有的交互行为。

选择逻辑可以概括为：

```text
是否需要同一组件树运行于 Android、iOS、Web？
├── 是 → 优先使用 Universal
└── 否，或通用 API 无法满足需求
    ├── iOS → @expo/ui/swift-ui
    └── Android → @expo/ui/jetpack-compose
```

原文没有说明 Universal 组件与平台专属组件可以如何嵌套，也没有说明平台分支代码的推荐组织方式。

## 注意事项与限制

### 当前页面不是稳定版文档

页面明确说明其对应下一个 SDK 版本。API 在正式进入稳定版前可能与 SDK 56 中可用的 API 不同。

**开发影响：**不要仅凭本页代码判断当前项目一定能够导入相同组件。应首先确认项目的 Expo SDK 版本，然后查看对应版本文档。

### `Host` 不能省略

`Host` 是每棵 Universal 子树必需的根节点，并非仅用于示例布局的普通容器。

**开发影响：**如果将 Universal 组件直接放入现有组件树而没有对应 `Host`，就不符合文档要求。

### 跨平台不代表跨平台完全一致

Android 和 iOS 分别使用 Jetpack Compose 和 SwiftUI，Web 则使用 JavaScript 实现。

**开发影响：**

- 外观可能存在平台差异。
- 控件行为可能遵循各平台习惯。
- 不应把某个平台上的实际效果自动当作其他平台的效果。

这里关于具体差异的表现属于**基于文档内容推导**；原文没有逐项列出哪些组件会产生何种差异。

### Universal API 不是平台 API 的完整合集

通用 API 只提供三端都适合共享的一层接口。平台专属的控件、修饰能力或行为可能不会被暴露。

**开发影响：**复杂需求不能假设全部由 Universal 组件完成。是否需要转向平台专属 API，应根据组件独立文档进行判断。

### 本页是入口索引，不是完整 API 参考

页面介绍了安装方式、基础用法、组件分类和技术选型，但没有完整列出组件 Props。

**开发影响：**实现具体功能前，还需要继续阅读 `Host`、`Column`、`Button` 等组件各自的文档，不能从示例推断未展示的属性。

## React Web 开发者需要调整的认识

1. **不要寻找对应 HTML 标签。**  
   `Button`、`TextInput` 等组件是跨平台抽象，不是对 `<button>`、`<input>` 的简单封装。

2. **不要假设可以使用任意 CSS。**  
   示例中的 `style={{ flex: 1 }}` 与 React 的内联样式写法相似，但不代表全部 CSS 属性都可用。

3. **事件模型不是 DOM 事件模型。**  
   示例使用 `onPress`，而不是 `onClick`。移动端还可能涉及触摸、手势和原生控件行为。

4. **组件共享不等于视觉完全相同。**  
   Android 和 iOS 会保留各自平台的原生观感。共享的是 React 组件树和 API，而不是最终像素。

5. **原生依赖会影响安装流程。**  
   在已有 React Native 工程中，需要先安装并配置 Expo Modules 环境。这与在普通 React Web 项目中安装纯 JavaScript npm 包不同。

## 实际开发中的使用方式

以下步骤是**基于文档内容推导**的落地流程：

1. 确认项目当前使用的 Expo SDK 版本。
2. 阅读该 SDK 对应的 `@expo/ui` 文档，避免混用未发布版本 API。
3. 使用 `expo install` 安装 `@expo/ui`。
4. 如果是已有 React Native 工程，先完成 Expo Modules 的安装。
5. 从 `@expo/ui` 包根路径导入 Universal 组件。
6. 使用 `Host` 包裹 Universal 组件子树。
7. 优先通过 `Column`、`Row`、`Text`、`Button` 等 Universal 组件搭建共享界面。
8. 分别在 Android、iOS 和 Web 上验证布局、外观与交互。
9. 当 Universal API 缺少必要能力时，再针对具体平台使用 SwiftUI 或 Jetpack Compose 接口。

### 基于经验建议

- 先用 Universal API 完成共享界面的主体，再把确实存在平台差异的部分隔离到平台专属组件中。
- 不要为了追求三端像素级一致而抵消原生控件的价值；应优先保证功能和交互语义一致。
- 对表单、弹层和输入控件进行真机测试，因为这些组件更容易受到键盘、触摸行为和平台交互习惯的影响。
- 在使用 `BottomSheet`、`Picker`、`TextInput` 等组件前，阅读其独立页面，确认属性、事件和平台限制。

这些建议不是当前页面明确给出的规则。

## 明确信息与推导信息

### 文档明确说明

- Universal 组件使用一套 API 支持 Android、iOS 和 Web。
- Android 底层委托给 Jetpack Compose。
- iOS 底层委托给 SwiftUI。
- Web 端按组件选择 `react-dom` 或 `react-native-web` 实现。
- Universal 组件子树必须包裹在 `Host` 中。
- 所有 Universal 组件和 `Host` 都从 `@expo/ui` 包根路径导入。
- 需要一套跨平台组件树时使用 Universal API。
- 需要通用 API 未暴露的平台能力时，直接使用平台专属包。
- 已有 React Native 项目需要先安装 `expo`。
- 当前页面属于下一个 SDK 版本，而稳定版文档对应 SDK 56。

### 基于文档内容推导

- 三个平台能够共享业务组件结构，但最终视觉和部分交互细节可能不同。
- 项目应根据 Expo SDK 版本选择对应文档和包版本。
- 可以先以 Universal API 为主，在能力不足时再引入平台分支。
- 跨平台功能应分别在 Android、iOS 和 Web 上验证，不能只测试一个平台。

## 总结

`@expo/ui` Universal 提供了 Android、iOS 和 Web 共用的 React UI API。它在移动端连接到 Jetpack Compose 和 SwiftUI，在 Web 端使用 `react-dom` 或 `react-native-web` 实现，因此能够同时提供代码复用和移动端原生体验。

使用时需要记住三个关键点：

- 通过 `expo install` 安装，并确认文档版本与项目 Expo SDK 匹配。
- 每棵 Universal 组件子树都必须放在 `Host` 中。
- Universal API 适合共享界面；当它没有暴露所需的平台能力时，再使用 `@expo/ui/swift-ui` 或 `@expo/ui/jetpack-compose`。

---

## 文档导航

- **上一页**：[zstack](./134__zstack.md)
- **下一页**：[bottomsheet](./136__bottomsheet.md)
