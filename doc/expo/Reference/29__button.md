# Expo UI Jetpack Compose Button 学习笔记

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目的 Android 界面中，通过 `@expo/ui` 使用基于 Jetpack Compose Material 3 的原生按钮。

文档主要解决以下问题：

- 如何安装 `@expo/ui`
- 如何创建 Android 原生 Material 3 按钮
- 如何选择不同视觉层级的按钮
- 如何在按钮中组合文字和图标
- 如何自定义按钮颜色、形状及内部间距
- 如何控制按钮的可用状态并响应点击事件

这不是 React Web 的 HTML `<button>` 封装，而是一组面向 Android 的原生 UI 组件。

## 适用范围

根据原文档明确说明：

- **支持平台：Android**
- **包含在 Expo Go 中**
- 使用的包：`@expo/ui`
- 组件导入路径：`@expo/ui/jetpack-compose`
- 底层设计体系：Jetpack Compose Material 3
- 页面元数据对应 Expo SDK 56

适合以下场景：

- Expo 项目需要在 Android 上显示原生 Material 3 按钮
- 需要按钮外观遵循 Android 官方设计体系
- 需要区分主要、次要和低优先级操作
- 需要在按钮中自由组合文字、图标和间距

如果需要一套能够根据运行平台自动渲染相应原生组件的按钮，原文建议使用通用版 `Button`，而不是本页介绍的 Android 专用实现。

> **限制：**本页介绍的五种按钮组件均只标注支持 Android。文档没有说明它们可以直接用于 iOS 或 Web。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 工具。它在编程方式上与 React 有相似之处：开发者通过组件组合描述界面，而不是手动操作原生视图。

本页并不要求直接编写 Kotlin Compose 代码。Expo UI 提供了 React 组件接口，让开发者可以在 TSX 中使用对应的 Android 原生组件。

可以这样理解：

| React Web | 本文中的 Expo UI |
| --- | --- |
| JSX 描述 DOM | JSX 描述 Android 原生 UI |
| HTML `<button>` | Jetpack Compose Material 3 Button |
| CSS | 组件属性、`Shape`、颜色配置和 modifiers |
| `onClick` | `onClick` |
| `disabled` | `enabled={false}` |

### Material 3

Material 3 是 Google 的 UI 设计体系。它规定了按钮的视觉样式、层级关系和典型使用场景。

本文的按钮类型不是五种互不相关的组件，而是同一种交互控件的五种视觉层级。

### `dp`

`dp` 是 Android 的密度无关像素。它用于降低不同屏幕像素密度对实际显示尺寸的影响。

`contentPadding` 的所有数值以及示例中的图标尺寸、间距，都以 `dp` 为单位。

> React Web 开发者不要将这里的数字简单理解为 CSS `px`。二者都表示界面尺寸，但由不同的布局和屏幕密度体系解释。

### Composable children

原文说明所有按钮都接受 composable children，即按钮内容可以由多个可组合组件构成，而不局限于一个字符串。

例如：

```tsx
<Button onClick={() => {}}>
  <Icon source={addIcon} size={18} />
  <Spacer modifiers={[width(8)]} />
  <Text>Add Item</Text>
</Button>
```

这与 React 的 `children` 组合方式相似，但这里组合的是 Expo UI 映射的原生 Compose 内容。

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

`expo install` 用于安装与当前 Expo 项目兼容的依赖版本。

如果是在已有的裸 React Native 项目中使用，还必须先按照 Expo 文档安装 `expo`，使项目具备使用 Expo Modules 的条件。

> 原文没有提供裸 React Native 工程中 iOS、Android 原生文件的具体配置步骤，只指向了 Expo Modules 的安装文档。

## 五种按钮及其使用层级

五个组件共享相同的 props，主要区别是默认外观和操作强调程度。

| 组件 | 外观 | 适用场景 |
| --- | --- | --- |
| `Button` | 实色背景和对比色文字 | “提交”“保存”等最重要的主要操作 |
| `FilledTonalButton` | 背景颜色会与表面风格协调 | “加入购物车”“登录”等主要或重要操作 |
| `ElevatedButton` | 使用阴影突出按钮 | 与 tonal 按钮用途相近，需要更明显地从界面中凸显时使用 |
| `OutlinedButton` | 有边框、无填充 | 重要但非主要的操作，例如“取消”“返回” |
| `TextButton` | 无背景、无边框 | 导航或低优先级操作，例如“了解更多”“查看详情” |

### 层级选择原则

可以按照操作的重要程度理解：

```text
高强调：Button
       FilledTonalButton
       ElevatedButton
中强调：OutlinedButton
低强调：TextButton
```

`FilledTonalButton` 和 `ElevatedButton` 都可用于较重要的操作。`ElevatedButton` 通过阴影获得更突出的视觉效果。

> **基于文档内容推导：**按钮类型表达的是操作层级，而不仅是装饰风格。选择组件时，应先判断操作的重要性，再决定使用哪种视觉类型。

## 基础用法

```tsx
import { Host, Button, Text } from '@expo/ui/jetpack-compose';

export default function BasicButtonExample() {
  return (
    <Host matchContents>
      <Button onClick={() => alert('Pressed!')}>
        <Text>Press me</Text>
      </Button>
    </Host>
  );
}
```

各部分的作用：

- `Host`：示例中用于承载 Jetpack Compose 组件。
- `matchContents`：示例将它传给 `Host`，使宿主区域与内容尺寸匹配。
- `Button`：默认的实色高强调按钮。
- `Text`：按钮中的原生 Compose 文本内容。
- `onClick`：用户点击按钮时执行的回调。

> `Host` 和 `matchContents` 的完整 API 不在当前文档中，本页只展示了它们的使用方式。

和 React Web 相比，不能直接写成：

```tsx
<Button>Press me</Button>
```

原文示例明确使用了 `Text` 组件：

```tsx
<Button>
  <Text>Press me</Text>
</Button>
```

## 展示多种按钮

```tsx
import {
  Host,
  Button,
  FilledTonalButton,
  OutlinedButton,
  ElevatedButton,
  TextButton,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';

export default function ButtonVariantsExample() {
  return (
    <Host matchContents>
      <Column verticalArrangement={{ spacedBy: 8 }}>
        <Button onClick={() => {}}>
          <Text>Filled</Text>
        </Button>

        <FilledTonalButton onClick={() => {}}>
          <Text>Filled Tonal</Text>
        </FilledTonalButton>

        <OutlinedButton onClick={() => {}}>
          <Text>Outlined</Text>
        </OutlinedButton>

        <ElevatedButton onClick={() => {}}>
          <Text>Elevated</Text>
        </ElevatedButton>

        <TextButton onClick={() => {}}>
          <Text>Text</Text>
        </TextButton>
      </Column>
    </Host>
  );
}
```

示例使用 `Column` 纵向排列按钮，并通过：

```tsx
verticalArrangement={{ spacedBy: 8 }}
```

为相邻内容设置 `8` 的垂直间距。

当前文档没有展开说明 `Column` 的其他属性。

## 带图标的按钮

按钮允许组合多个 children，因此可以放置前置图标、后置图标，或者同时放置两者。

### 图标资源

```tsx
const addIcon = require('./assets/add.png');
const sendIcon = require('./assets/send.png');
```

这里通过相对路径加载本地图片资源，再传给 `Icon` 的 `source`。

原文推荐遵循 Material 3 的按钮图标规范：

- 图标尺寸：`18dp`
- 图标与文字间距：`8dp`

### 前置图标

```tsx
<Button onClick={() => {}}>
  <Icon source={addIcon} size={18} tintColor="#FFFFFF" />
  <Spacer modifiers={[width(8)]} />
  <Text>Add Item</Text>
</Button>
```

内容顺序决定显示顺序：

1. 图标
2. `8dp` 间距
3. 文字

`tintColor="#FFFFFF"` 为图标设置白色着色，使其适应实色按钮背景。

### 后置图标

```tsx
<OutlinedButton onClick={() => {}}>
  <Text>Send</Text>
  <Spacer modifiers={[width(8)]} />
  <Icon source={sendIcon} size={18} />
</OutlinedButton>
```

把图标放到文字之后，即可形成后置图标。

### 同时使用前后图标

```tsx
<FilledTonalButton onClick={() => {}}>
  <Icon source={addIcon} size={18} />
  <Spacer modifiers={[width(8)]} />
  <Text>Create & Send</Text>
  <Spacer modifiers={[width(8)]} />
  <Icon source={sendIcon} size={18} />
</FilledTonalButton>
```

`Spacer` 本身表示空白区域，`width(8)` modifier 为它设置宽度。

> **基于文档内容推导：**按钮没有单独的 `startIcon` 或 `endIcon` 属性。图标位置由 children 的排列顺序控制。

## 自定义颜色

通过 `colors` 属性覆盖按钮的容器颜色和内容颜色：

```tsx
<Button
  onClick={() => {}}
  colors={{
    containerColor: '#6200EE',
    contentColor: '#FFFFFF',
  }}>
  <Text>Purple Button</Text>
</Button>
```

### `ButtonColors`

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `containerColor` | `ColorValue` | 按钮可用状态下的容器背景颜色 |
| `contentColor` | `ColorValue` | 按钮可用状态下的内容颜色 |
| `disabledContainerColor` | `ColorValue` | 按钮禁用状态下的容器颜色 |
| `disabledContentColor` | `ColorValue` | 按钮禁用状态下的内容颜色 |

所有字段都是可选的。

原文只为该类型提供了属性名称，没有进一步解释颜色继承、主题回退或透明度处理规则。

> **基于文档内容推导：**如果自定义了普通状态颜色，同时还会使用禁用状态，应检查禁用后的视觉效果，必要时一并设置 `disabledContainerColor` 和 `disabledContentColor`。

## 自定义形状

通过 `shape` 属性设置按钮形状：

```tsx
import { Host, Button, Shape, Text } from '@expo/ui/jetpack-compose';

export default function CustomShapeExample() {
  return (
    <Host matchContents>
      <Button
        onClick={() => {}}
        shape={Shape.RoundedCorner({
          cornerRadii: {
            topStart: 16,
            bottomEnd: 16,
          },
        })}>
        <Text>Custom Shape</Text>
      </Button>
    </Host>
  );
}
```

该示例设置了：

- 起始方向顶部圆角：`topStart: 16`
- 结束方向底部圆角：`bottomEnd: 16`

这里使用 `start` / `end`，而不是固定的 `left` / `right`。

> **基于文档内容推导：**这种方向命名有利于适配从左到右和从右到左的语言布局。当前文档没有明确描述具体的 RTL 行为。

`ShapeJSXElement` 和其他可用形状不属于本页范围，原文仅链接到独立的 Shape API 文档。

## 通用 API

五种按钮都使用相同的 `ButtonProps`：

```tsx
import {
  Button,
  FilledTonalButton,
  OutlinedButton,
  ElevatedButton,
  TextButton,
} from '@expo/ui/jetpack-compose';
```

### `children`

```ts
children: React.ReactNode
```

按钮内部显示的内容，可以组合 `Text`、`Icon`、`Spacer` 等组件。

### `onClick`

```ts
onClick?: () => void
```

按钮被点击时调用的回调，可用于更新状态、提交数据或触发导航。

该属性是可选的。当前文档没有说明省略 `onClick` 后按钮的具体交互表现。

### `enabled`

```ts
enabled?: boolean
```

默认值为 `true`。

```tsx
<Button enabled={false} onClick={() => {}}>
  <Text>Unavailable</Text>
</Button>
```

`false` 表示按钮不允许用户交互。

React Web 开发者需要注意属性名差异：

```tsx
// React Web
<button disabled={true}>Submit</button>

// 本文组件
<Button enabled={false}>
  <Text>Submit</Text>
</Button>
```

二者的布尔语义相反。

### `colors`

```ts
colors?: ButtonColors
```

控制正常和禁用状态下的容器及内容颜色。

### `contentPadding`

```ts
contentPadding?: ButtonContentPadding
```

控制按钮容器与内部内容之间的距离。原文特别指出，它可用于调整添加前置图标后的内部间距。

支持的字段如下：

| 属性 | 类型 | 方向 |
| --- | --- | --- |
| `top` | `number` | 顶部 |
| `bottom` | `number` | 底部 |
| `start` | `number` | 起始方向 |
| `end` | `number` | 结束方向 |

所有字段都是可选的，数值单位均为 `dp`。

当前文档没有给出默认 padding 值，也没有说明是否必须一次提供全部四个方向。

### `shape`

```ts
shape?: ShapeJSXElement
```

设置按钮轮廓。示例使用 `Shape.RoundedCorner(...)` 创建非对称圆角。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

为组件提供 modifier 配置数组。

在 Jetpack Compose 中，modifier 通常用于配置尺寸、布局和其他组件行为。本页没有列出按钮支持的具体 modifier，也没有解释应用顺序。

当前示例仅展示了 modifier 在 `Spacer` 上的使用：

```tsx
<Spacer modifiers={[width(8)]} />
```

## 与 React Web 按钮的关键差异

### 1. 这是 Android 原生组件

React Web 的 JSX 最终产生 DOM；本页组件最终对应 Android Jetpack Compose UI。

因此，不能假定以下 Web 能力可以直接使用：

- HTML 属性
- CSS class
- DOM 事件对象
- CSS 伪类
- 浏览器开发者工具中的 DOM 检查方式

当前文档没有提供 CSS、`className` 或 `style` 的使用方式。

### 2. 文本使用 `Text` 组件

原文所有按钮标签都通过 `Text` 表达，而不是直接将字符串作为唯一内容。

```tsx
<Button>
  <Text>Save</Text>
</Button>
```

### 3. 禁用状态使用 `enabled`

Web 通常使用 `disabled`；这里使用 `enabled`，且默认值为 `true`。

### 4. 布局依靠可组合 children

按钮图标没有专门的前置或后置属性。开发者通过 `Icon`、`Spacer`、`Text` 的排列顺序组织内容。

### 5. 尺寸单位属于 Android 体系

图标大小、间距和 `contentPadding` 使用密度无关像素 `dp`，不是 CSS `px`、`rem` 或 `em`。

### 6. 平台范围不同

本页组件只明确支持 Android。若代码需要同时服务 iOS，应评估原文提到的 universal `Button`，或者分别处理平台实现。

## 注意事项和限制

1. **仅明确支持 Android。**不要根据组件是 React 写法，就推断它能在 Web 或 iOS 上使用。
2. **需要通过 `Host` 承载。**原文所有完整示例都将 Compose 组件放在 `Host` 中，但本页没有展开其生命周期和布局规则。
3. **五种按钮共享 props。**它们的主要区别是默认视觉表现和强调层级。
4. **图标规范需要手动落实。**示例明确使用 `18dp` 图标和 `8dp` 间距，按钮不会通过单独的图标属性自动完成该结构。
5. **自定义颜色可能影响状态表达。**API 提供普通和禁用状态颜色，但文档没有说明自定义颜色后的对比度保障机制。
6. **modifier 细节不在本文范围内。**不要仅凭本页推断所有 modifier 的行为。
7. **裸 React Native 项目需要额外安装 Expo。**仅安装 `@expo/ui` 可能不足以让现有裸工程具备 Expo Modules 支持。
8. **当前文档未涉及**加载状态、防重复点击、无障碍属性、触觉反馈、测试方式、主题配置、最小触控尺寸和 iOS 替代方案。

## 实际开发中的使用方式

### 主要操作

```tsx
<Button onClick={handleSave}>
  <Text>Save</Text>
</Button>
```

适用于页面最重要的提交或保存操作。

### 主次操作组合

```tsx
<Button onClick={handleSubmit}>
  <Text>Submit</Text>
</Button>

<OutlinedButton onClick={handleCancel}>
  <Text>Cancel</Text>
</OutlinedButton>
```

`Button` 表示主要动作，`OutlinedButton` 表示重要但次要的备选动作。

### 低优先级操作

```tsx
<TextButton onClick={handleViewDetails}>
  <Text>View details</Text>
</TextButton>
```

适用于查看详情、了解更多等低强调操作。

### 防止不可用状态继续交互

```tsx
<Button enabled={canSubmit} onClick={handleSubmit}>
  <Text>Submit</Text>
</Button>
```

通过 `enabled` 将业务状态映射为按钮是否可交互。

> **基于经验建议：**即使按钮已禁用，提交处理函数本身仍应保护关键业务条件，避免其他调用路径绕过界面状态。

### 建立一致的按钮层级

> **基于文档内容推导：**项目应对五种按钮建立统一的语义规则。例如主要提交统一使用 `Button`，取消操作统一使用 `OutlinedButton`，帮助入口统一使用 `TextButton`。这样可以避免同一种业务操作在不同页面呈现不同视觉优先级。

> **基于经验建议：**自定义颜色时应检查文字和背景的对比度，并同时检查 `enabled={false}` 的禁用效果。当前文档没有提供具体的无障碍对比度标准。

## 文档明确内容与推导内容

### 文档明确说明

- `@expo/ui` 提供五种对应 Jetpack Compose Button API 的组件。
- 五种组件共享相同的 props。
- 所有按钮都接受 composable children。
- 组件支持 Android，并包含在 Expo Go 中。
- `Button` 是实色、高强调的主要操作按钮。
- 图标推荐使用 `18dp`，图标与标签之间使用 `8dp` 间距。
- 可以通过 `colors` 自定义容器和内容颜色。
- 可以通过 `shape` 自定义按钮形状。
- `enabled` 默认值为 `true`。
- `contentPadding` 的数值单位为 `dp`。
- 裸 React Native 项目需要先安装 Expo。

### 基于文档内容推导

- 按钮类型应根据操作优先级选择，而不应只根据个人视觉偏好选择。
- 前置和后置图标的位置由 children 的排列顺序决定。
- 使用 `start` / `end` 描述方向有利于方向感知布局。
- 跨平台项目不应直接把本页组件当成通用按钮，应评估 universal `Button` 或平台分支。
- 自定义正常状态颜色时，需要同时关注禁用状态的视觉表达。

## 总结

`@expo/ui/jetpack-compose` 的按钮让 React 开发者能够通过 TSX 使用 Android 原生 Material 3 按钮。其核心不只是提供一个可点击控件，还通过五种组件表达不同的操作优先级。

实际使用时需要重点掌握：

- 使用 `Host` 承载 Compose 内容
- 使用 `Text`、`Icon` 和 `Spacer` 组合按钮内容
- 根据操作层级选择合适的按钮类型
- 使用 `enabled` 控制交互状态
- 使用 `colors`、`shape` 和 `contentPadding` 调整外观
- 注意该 API 当前明确面向 Android，不能直接按 Web 或跨平台组件理解

---

## 文档导航

- **上一页**：[box](./28__box.md)
- **下一页**：[card](./30__card.md)
