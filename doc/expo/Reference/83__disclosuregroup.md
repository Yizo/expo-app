# DisclosureGroup：SwiftUI 可展开内容组件

> 文档更新时间：2026 年 5 月 26 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、Expo Go  
> 文档状态：面向下一个 SDK 版本的未发布文档；当前最新稳定文档对应 SDK 56。

## 文档解决的问题

`DisclosureGroup` 用于在 iOS 界面中显示一组可以展开和收起的内容。用户点击标签区域后，组件会显示或隐藏内部内容，并提供符合 iOS 风格的展开指示符。

它适合以下场景：

- 展开“高级设置”等不常用选项
- 显示或隐藏详情信息
- 对表单中的配置项进行分组
- 减少页面初始展示的信息量

它在交互概念上类似于 Web 中的 `<details>` 元素或受控 Accordion，但实际渲染的是 SwiftUI 原生组件。

## 阅读前需要理解的背景知识

### Expo UI 与 SwiftUI

`@expo/ui` 是 Expo 提供的 UI 包。本文使用的是其 SwiftUI 组件：

```tsx
import { DisclosureGroup } from '@expo/ui/swift-ui';
```

SwiftUI 是 Apple 用于构建 iOS 等平台原生界面的框架。这里虽然使用 React 和 TSX 编写组件，但最终对应的是 SwiftUI 原生 UI，而不是浏览器 DOM。

因此，不能假设 Web 平台中的 CSS、HTML 属性或事件模型可以直接用于该组件。

### Host

`Host` 是承载 SwiftUI 内容的容器。示例会先创建 `Host`，再把 `DisclosureGroup` 等 SwiftUI 组件放在里面：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

示例中出现了两种布局方式：

- `style={{ flex: 1 }}`：让宿主容器填充可用空间。
- `matchContents`：让宿主容器的尺寸匹配内部内容。

本文没有进一步说明二者的完整布局规则。

### Form 与 Section

`Form` 和 `Section` 都来自 `@expo/ui/swift-ui`。

文档明确指出，`DisclosureGroup` 最常放在 `Form` 中。这样它可以获得标准的 iOS 列表样式以及 Chevron 展开指示符。

Chevron 是 iOS 界面中常见的箭头形指示图标，用来表示某个区域可以展开、收起或进入下一层。

## 安装

根据项目使用的包管理器执行相应命令。

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

这些命令的目的都是安装 `@expo/ui`，实际使用时只需要选择其中一条。

这里使用 `expo install`，而不是直接使用 `npm install`。在 Expo 项目中，该命令通常用于安装与当前 Expo SDK 兼容的依赖版本。

> **文档明确说明：**如果是在已有的 React Native 原生项目中安装 `@expo/ui`，必须先为项目安装并配置 `expo`，使其能够使用 Expo Modules。

本文没有提供现有 React Native 项目安装 Expo Modules 的具体步骤，只链接到了对应的独立文档。

## 基本用法

下面是文档推荐的典型结构：

```tsx
import { useState } from 'react';
import {
  DisclosureGroup,
  Form,
  Host,
  Section,
  Text,
} from '@expo/ui/swift-ui';

export default function BasicDisclosureGroupExample() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <DisclosureGroup
            label="Advanced settings"
            isExpanded={isExpanded}
            onIsExpandedChange={setIsExpanded}
          >
            <Text>Auto-update apps</Text>
            <Text>App downloads</Text>
            <Text>Offload unused apps</Text>
          </DisclosureGroup>
        </Section>
      </Form>
    </Host>
  );
}
```

组件的状态变化流程如下：

1. React 通过 `isExpanded` 将当前展开状态传给组件。
2. 用户操作展开指示符或标签区域。
3. `DisclosureGroup` 调用 `onIsExpandedChange`，并传入新的布尔值。
4. `setIsExpanded` 更新 React 状态。
5. 组件根据新的 `isExpanded` 值重新渲染。

这是一种 React Web 开发者熟悉的“受控组件”模式，类似：

```tsx
<input checked={checked} onChange={handleChange} />
```

`DisclosureGroup` 不使用 `checked`，而是使用：

- `isExpanded`：当前是否展开
- `onIsExpandedChange`：展开状态变化回调

## 控制初始展开状态

如果希望组件首次渲染时默认展开，可以把 React 状态初始化为 `true`：

```tsx
const [isExpanded, setIsExpanded] = useState(true);
```

完整结构如下：

```tsx
<Host matchContents>
  <DisclosureGroup
    label="Details"
    isExpanded={isExpanded}
    onIsExpandedChange={setIsExpanded}
  >
    <Text>This content is visible by default.</Text>
  </DisclosureGroup>
</Host>
```

这里的“初始展开”不是单独的组件配置，而是由传入 `isExpanded` 的初始值决定。

同理，默认收起可以写成：

```tsx
const [isExpanded, setIsExpanded] = useState(false);
```

## 自定义标签

如果只需要文本标签，可以使用 `label` 属性：

```tsx
<DisclosureGroup label="Advanced settings">
  {/* 可展开内容 */}
</DisclosureGroup>
```

如果标签需要自定义 SwiftUI 内容或 Modifier，应使用 `DisclosureGroup.Label`：

```tsx
import { useState } from 'react';
import {
  DisclosureGroup,
  Form,
  Host,
  Section,
  Text,
} from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function CustomLabelDisclosureGroupExample() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <DisclosureGroup
            isExpanded={isExpanded}
            onIsExpandedChange={setIsExpanded}
          >
            <DisclosureGroup.Label>
              <Text
                modifiers={[
                  font({ weight: 'semibold' }),
                  foregroundStyle('#0a7ea4'),
                ]}
              >
                Network options
              </Text>
            </DisclosureGroup.Label>

            <Text>Wi-Fi</Text>
            <Text>Bluetooth</Text>
            <Text>Cellular data</Text>
          </DisclosureGroup>
        </Section>
      </Form>
    </Host>
  );
}
```

### Modifier 的作用

示例使用了两个 SwiftUI Modifier：

```tsx
font({ weight: 'semibold' })
foregroundStyle('#0a7ea4')
```

它们分别设置：

- 标签字体粗细为 `semibold`
- 标签前景色为 `#0a7ea4`

Modifier 可以理解为 SwiftUI 的视图修饰机制。它与 CSS 的目标部分相似，都是改变显示效果，但其 API、组合方式和底层机制并不是 CSS。

多个 Modifier 通过数组传入：

```tsx
modifiers={[
  font({ weight: 'semibold' }),
  foregroundStyle('#0a7ea4'),
]}
```

> **文档明确说明：**当标签需要自定义 SwiftUI 内容或 Modifier 时，应使用 `DisclosureGroup.Label`，而不是字符串形式的 `label`。

## API 说明

### 导入方式

```tsx
import { DisclosureGroup } from '@expo/ui/swift-ui';
```

### `DisclosureGroup`

类型：

```tsx
React.Element<DisclosureGroupProps>
```

支持平台：

```text
iOS
```

它接收以下属性。

### `children`

类型：

```tsx
ReactNode
```

支持平台：iOS。

`children` 是组件展开后显示的内容，例如：

```tsx
<DisclosureGroup label="Details">
  <Text>First item</Text>
  <Text>Second item</Text>
</DisclosureGroup>
```

文档没有规定 `children` 的数量，也没有列出只能使用哪些具体子组件。

### `isExpanded`

类型：

```tsx
boolean
```

是否必填：否。

用于控制内容当前是否展开：

```tsx
<DisclosureGroup isExpanded={isExpanded}>
```

虽然该属性是可选的，但文档中的所有交互示例都将它与 `onIsExpandedChange` 和 React 状态配合使用。

### `label`

类型：

```tsx
string
```

是否必填：否。

设置组件的文本标签：

```tsx
<DisclosureGroup label="Advanced settings">
```

需要自定义标签结构或样式时，改用 `DisclosureGroup.Label`。

### `onIsExpandedChange`

类型：

```tsx
(isExpanded: boolean) => void
```

是否必填：否。

展开状态发生变化时调用，回调参数是变化后的状态：

```tsx
onIsExpandedChange={(nextIsExpanded) => {
  setIsExpanded(nextIsExpanded);
}}
```

由于 React 的状态更新函数可以直接接收新的布尔值，示例将其简写为：

```tsx
onIsExpandedChange={setIsExpanded}
```

### 继承属性

`DisclosureGroup` 继承 `CommonViewModifierProps`。

这意味着它可以使用 `@expo/ui` SwiftUI 组件共有的 Modifier 相关属性。当前页面没有列出这些继承属性的具体内容，需要查阅单独的 Modifiers API 文档。

## 注意事项与限制

### 仅支持 iOS

API 部分明确将支持平台标记为 iOS。不能根据 React 组件的写法推断它也能在 Android 或 Web 上工作。

如果项目同时支持多个平台，需要自行考虑非 iOS 平台的实现。当前文档没有提供跨平台替代方案或降级策略。

### Expo Go 支持不等于跨平台支持

页面标记为“Included in Expo Go”，表示它可以在 Expo Go 提供的相应运行环境中使用。这并没有改变组件本身仅支持 iOS 的限制。

### 当前页面属于下一个 SDK 版本

本文内容来自 `unversioned` 文档，面向下一个 Expo SDK 版本。页面明确提示，当前最新稳定版本为 SDK 56。

实际项目使用 SDK 56 时，应核对 SDK 56 对应页面，避免使用只存在于后续 SDK 的 API 或行为。

### 自定义标签不要与字符串标签混用

文档给出的两种标签方式是：

```tsx
label="Details"
```

以及：

```tsx
<DisclosureGroup.Label>
  {/* 自定义标签 */}
</DisclosureGroup.Label>
```

> **基于文档内容推导：**两者用于解决同一个标签位置的不同需求。实际开发中应选择其中一种，避免同时提供后产生不明确的渲染结果。当前文档没有明确说明同时使用时的优先级。

### 可选属性不代表所有组合都有明确行为

`isExpanded`、`label` 和 `onIsExpandedChange` 在 API 中均标记为可选，但本文没有说明：

- 只提供 `isExpanded` 而不提供回调时，用户能否改变状态
- 只提供回调而不提供 `isExpanded` 时如何管理内部状态
- 完全不提供状态属性时的默认展开状态
- 不提供任何标签时如何展示
- 状态切换是否带有动画以及动画能否配置

对于这些行为，不应仅凭 Web 组件经验作出假设。

## React Web 开发者容易误解的地方

### 这不是 DOM 组件

虽然代码形式是 React TSX，但它不是浏览器中的 `<details>`、`<div>` 或其他 HTML 元素。因此：

- 不能直接使用 CSS 类名控制它
- 不能假设存在 DOM 事件
- 不能使用浏览器开发者工具按 DOM 结构检查它
- 平台能力由 SwiftUI 和 Expo UI 的实现决定

### `Text` 不是 HTML 文本节点

示例中的 `Text` 来自：

```tsx
@expo/ui/swift-ui
```

它不是 React Native 核心包中的 `Text`，也不是 HTML 的 `<span>` 或 `<p>`。开发时需要特别注意组件的导入来源。

### 样式不完全由 Flexbox 决定

`Host` 可以接收 React Native 风格的布局属性，但 `Host` 内部承载的是 SwiftUI 组件。示例还使用 SwiftUI Modifier 修改标签。

因此，一个界面中可能同时涉及：

- React Native 宿主布局
- SwiftUI 原生组件布局
- SwiftUI Modifier

不要把所有视觉问题都当成 CSS 或 Flexbox 问题处理。

### `Form` 会影响原生外观

Web 中，组件放进 `<form>` 通常主要改变语义和提交行为；这里的 SwiftUI `Form` 会让 `DisclosureGroup` 获得标准 iOS 列表样式和 Chevron 指示符。

这说明父级容器会影响组件呈现方式。脱离 `Form` 使用时，不应假设外观一定与文档的基本示例相同。

## 实际开发中的使用方式

对于设置页面，可以采用以下状态管理结构：

```tsx
const [advancedSettingsExpanded, setAdvancedSettingsExpanded] =
  useState(false);

<DisclosureGroup
  label="高级设置"
  isExpanded={advancedSettingsExpanded}
  onIsExpandedChange={setAdvancedSettingsExpanded}
>
  {/* 高级设置内容 */}
</DisclosureGroup>
```

如果有多个互不关联的分组，可以分别维护状态：

```tsx
const [networkExpanded, setNetworkExpanded] = useState(false);
const [privacyExpanded, setPrivacyExpanded] = useState(false);
```

> **基于文档内容推导：**每个 `DisclosureGroup` 都接收独立的 `isExpanded`，因此可以分别控制多个分组。文档没有提供只允许一个分组展开的 Accordion 管理组件。

### 选择标签方式

使用普通文本时：

```tsx
<DisclosureGroup label="网络设置">
```

需要颜色、字重或更复杂内容时：

```tsx
<DisclosureGroup>
  <DisclosureGroup.Label>
    <Text modifiers={[font({ weight: 'semibold' })]}>
      网络设置
    </Text>
  </DisclosureGroup.Label>
</DisclosureGroup>
```

### 跨平台项目

> **基于经验建议：**在同时面向 iOS 和 Android 的项目中，应在组件边界处处理平台差异，并为 Android 提供其他可展开组件。本文只说明了 iOS API，没有指定 Android 应使用什么替代方案。

### 版本核对

> **基于经验建议：**开发稳定版本项目时，应根据项目中的 Expo SDK 版本查看对应版本文档，而不是直接照搬 `unversioned` 页面。安装完成后，也应通过 TypeScript 类型检查确认当前版本是否提供相关组件和属性。

## 当前文档未涉及的内容

当前文档没有说明以下内容：

- Android 和 Web 的替代组件
- 无障碍属性及屏幕阅读器行为
- 展开和收起动画的配置方式
- 默认展开状态
- 非受控模式的具体行为
- 同时使用 `label` 与 `DisclosureGroup.Label` 时的处理规则
- 嵌套 `DisclosureGroup` 的行为
- 自动化测试方式
- 性能特征
- SwiftUI 原生工程配置
- iOS 最低系统版本要求
- 自定义 Chevron 图标的方法
- 展开状态持久化方式

这些内容不能从当前页面直接得出，需要查阅其他 Expo UI 或 SwiftUI 文档。

## 明确结论与推导结论

### 文档明确说明

- `DisclosureGroup` 用于显示可以展开和隐藏的内容。
- 它匹配 Apple 官方 SwiftUI `DisclosureGroup` API。
- 它支持 iOS，并包含在 Expo Go 中。
- 推荐在 `Form` 中使用，以获得标准 iOS 列表样式和 Chevron 指示符。
- `isExpanded` 控制展开状态。
- `onIsExpandedChange` 在展开状态变化时触发。
- 初始 `isExpanded` 为 `true` 时，内容默认可见。
- 简单标签使用 `label` 字符串属性。
- 自定义标签使用 `DisclosureGroup.Label`。
- 组件继承 `CommonViewModifierProps`。
- 已有 React Native 项目需要先安装 Expo Modules。
- 当前页面面向下一个 SDK 版本，当前最新稳定版本为 SDK 56。

### 基于文档内容推导

- 该组件可以按照 React 受控组件模式管理展开状态。
- 多个组件可以使用不同状态分别控制。
- `label` 与 `DisclosureGroup.Label` 应按需求二选一。
- 跨平台项目需要为非 iOS 平台准备其他实现。

## 总结

`DisclosureGroup` 是 `@expo/ui` 提供的 iOS SwiftUI 可展开内容组件。其核心用法是通过 `isExpanded` 和 `onIsExpandedChange` 将原生展开交互接入 React 状态。

对于 React Web 开发者，最重要的是认识到：它虽然使用 TSX 编写，但并不是 DOM 组件。组件样式和行为来自 SwiftUI，`Form` 等原生容器也会影响其最终外观。

当前页面属于下一个 SDK 版本文档，并且该组件只明确支持 iOS。实际使用前，应确认项目的 Expo SDK 版本，并单独规划 Android 或 Web 平台的实现。

---

## 文档导航

- **上一页**：[datepicker](./82__datepicker.md)
- **下一页**：[divider](./84__divider.md)
