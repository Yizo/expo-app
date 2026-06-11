# Badge

`Badge` 是 `@expo/ui` 提供的 Android 徽标组件，用于展示状态提示、未读数量或简短标签。它对应 Jetpack Compose 官方的 `Badge` API。

> 平台支持：Android  
> Expo Go：已内置支持  
> 包名：`@expo/ui`

## 文档解决的问题

本文档说明如何在 Expo 或 React Native 项目中：

- 安装 `@expo/ui`
- 渲染一个不包含内容的状态圆点
- 在徽标中显示数字或简短文本
- 设置徽标背景色与内容颜色
- 通过 `modifiers` 配置原生 Jetpack Compose 修饰符

这类组件适合未读消息数、通知状态、购物车数量等需要紧凑提示信息的场景。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 工具包。可以将它类比为 Android 原生开发中的 React：

- React 通过组件描述 Web UI。
- Jetpack Compose 通过可组合函数描述 Android 原生 UI。
- `@expo/ui/jetpack-compose` 让 React Native 代码能够使用部分 Compose 原生组件。

本文的 `Badge` 与 Jetpack Compose 官方 `Badge` API 保持对应关系，但在 React Native 中通过 JSX 使用。

### Badge

Badge 是一种尺寸较小的视觉提示：

- 没有子元素时，显示为小圆点。
- 有子元素时，可以显示数字或简短标签。

它通常只是提示信息，不应承载复杂内容或主要交互。

### `Host`

示例中的 `Host` 是 `@expo/ui/jetpack-compose` 导出的原生 Compose 内容宿主：

```tsx
<Host matchContents>
  <Badge />
</Host>
```

原文只展示了这种用法，没有进一步解释 `Host` 的完整 API。

**基于文档内容推导：** 使用这些 Jetpack Compose 组件时，需要将它们放在 `Host` 中，使 Compose 原生内容能够嵌入 React Native 组件树。`matchContents` 在示例中用于让宿主尺寸匹配内部内容，但本文档没有正式说明其行为和限制。

## 安装

使用项目对应的包管理器执行以下任一命令：

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

这里使用的是 `expo install`，而不是普通的 `npm install`。它负责为当前 Expo SDK 选择兼容的依赖版本。

### 已有 React Native 项目

如果这是一个没有预先使用 Expo 的现有 React Native 项目，需要先安装并配置 `expo`，才能使用 Expo Modules。

这不代表必须把整个项目迁移成 Expo 托管项目，但原生工程必须具备运行 Expo 模块所需的基础设施。

### 文件和目录

当前文档没有要求创建或修改特定文件、Android 目录或原生配置文件，也没有涉及 Gradle、AndroidManifest 或 iOS 工程配置。

## 基本用法

组件从以下入口导入：

```tsx
import { Badge } from '@expo/ui/jetpack-compose';
```

完整示例还会使用同一入口导出的 `Host` 和 `Text`。

### 状态圆点

当 `Badge` 没有子元素时，会显示为一个小型状态圆点：

```tsx
import { Host, Badge } from '@expo/ui/jetpack-compose';

export default function BadgeDot() {
  return (
    <Host matchContents>
      <Badge />
    </Host>
  );
}
```

这种形式适用于只需要表达“存在新状态”，但不需要展示具体数量的场景。

例如：

- 有新消息
- 当前在线
- 存在待处理事项
- 某项内容已更新

### 显示数量或标签

向 `Badge` 传入 `Text` 子元素，可以展示数字或标签：

```tsx
import { Host, Badge, Text } from '@expo/ui/jetpack-compose';

export default function BadgeCount() {
  return (
    <Host matchContents>
      <Badge containerColor="#EF5350" contentColor="#FFFFFF">
        <Text>3</Text>
      </Badge>
    </Host>
  );
}
```

这个示例设置了：

- 背景色 `#EF5350`
- 内容颜色 `#FFFFFF`
- 显示内容 `3`

需要注意，这里使用的是 `@expo/ui/jetpack-compose` 提供的 `Text`，而不是 HTML 的 `<span>` 或 `<div>`。

## `Badge` API

### 组件定义

```tsx
import { Badge } from '@expo/ui/jetpack-compose';
```

`Badge` 是一个仅支持 Android 的 React 元素，对应 Jetpack Compose 的 `Badge` 组件。

### 属性说明

| 属性 | 类型 | 是否必需 | 默认值 | 作用 |
|---|---|---:|---|---|
| `children` | `React.ReactNode` | 否 | 无 | 徽标中的内容；省略时显示圆点 |
| `containerColor` | `ColorValue` | 否 | `BadgeDefaults.containerColor` | 设置徽标背景色 |
| `contentColor` | `ColorValue` | 否 | `BadgeDefaults.contentColor` | 设置文字颜色或图标着色 |
| `modifiers` | `ModifierConfig[]` | 否 | 文档未说明 | 为组件配置 Compose modifiers |

以上属性均仅支持 Android。

### `children`

```tsx
<Badge>
  <Text>3</Text>
</Badge>
```

`children` 是可选的，可以放置数量或标签等内容。不提供时，`Badge` 会自动呈现为小圆点。

原文明确举出的内容类型是 `Text`。文档没有列出其他子组件的兼容范围，因此不应据此假定任意 React Native 组件都能作为其子元素正常工作。

### `containerColor`

```tsx
<Badge containerColor="#EF5350" />
```

控制徽标的背景色，类型为 React Native 的 `ColorValue`。

如果不设置，则使用 Jetpack Compose `BadgeDefaults.containerColor` 对应的默认颜色。本文档没有给出该默认颜色的具体值。

### `contentColor`

```tsx
<Badge contentColor="#FFFFFF">
  <Text>3</Text>
</Badge>
```

控制徽标内部内容的颜色，包括：

- 文字颜色
- 图标着色

如果不设置，则使用 `BadgeDefaults.contentColor`。本文档没有说明自定义子组件是否一定会自动采用该颜色。

### `modifiers`

```tsx
<Badge modifiers={/* ModifierConfig[] */} />
```

`modifiers` 的类型为 `ModifierConfig[]`，用于向组件传递 Jetpack Compose 风格的修饰配置。

在 Compose 中，modifier 通常用于控制尺寸、间距、位置或其他布局与行为。不过当前文档没有列出 `Badge` 支持哪些 modifier，也没有提供使用示例。

因此，仅根据本文无法确定：

- 可用的 modifier 类型
- modifier 的执行顺序
- 如何控制 Badge 的偏移或定位
- modifier 与 React Native 样式系统如何配合

需要这些能力时，应查阅 `@expo/ui` 的 modifiers 专门文档，而不是直接套用 Web CSS 或 React Native `style` 的写法。

## 注意事项与限制

### 仅支持 Android

`Badge` 的组件及全部属性都标记为 Android 平台支持。

这意味着它不是一个可以直接跨 iOS 和 Android 使用的通用 React Native Badge。文档没有提供 iOS 对应实现或跨平台降级方案。

**实际开发影响：** 如果应用同时支持 Android 和 iOS，需要自行设计平台分支或封装统一组件，并为 iOS 提供其他实现。

### 不能按 Web 组件理解

它不是 DOM 元素，不支持 CSS、className 或浏览器布局规则。样式入口来自组件属性以及 Compose modifiers。

React Web 开发者容易写出类似下面的代码，但本文没有说明这种写法受到支持：

```tsx
<Badge className="badge" style={{ backgroundColor: 'red' }} />
```

本文明确提供的颜色配置方式是：

```tsx
<Badge containerColor="red" contentColor="white" />
```

### 文档未说明定位方式

Badge 通常需要覆盖在图标、头像或按钮的角落，但本文档只演示了单独渲染 Badge，没有说明：

- 如何将 Badge 放在其他组件右上角
- 是否应与 `BadgedBox` 配合
- 如何设置重叠、对齐或偏移
- 如何处理较大的计数值

这些内容不能仅凭本文确定。

### 文档未涉及无障碍处理

当前文档没有说明 Badge 的可访问性标签、屏幕阅读器行为或仅使用颜色表达状态时的处理方式。

**基于经验建议：** 不要让颜色成为传递重要状态的唯一方式。对于会影响用户操作的信息，应在外层交互组件上提供清晰的无障碍描述。

### 文档未说明交互能力

本文没有描述点击、长按或其他事件属性。应将 Badge 视为状态展示组件，而不是独立按钮。

**基于文档内容推导：** 如果徽标需要响应点击，更合理的做法通常是让它依附的外层按钮、图标或列表项负责交互。

## React Web 开发者最容易误解的地方

1. `Badge` 渲染的是 Android 原生 Compose UI，而不是 HTML。
2. `Host` 是 Compose 内容的宿主，不等同于普通的 React Fragment 或 `<div>`。
3. 颜色使用 React Native `ColorValue`，不是完整的 CSS 样式系统。
4. `modifiers` 属于 Compose 的布局和修饰机制，不能直接当作 CSS class 或 React Native `style`。
5. Expo 包可以用在已有 React Native 项目中，但项目必须先配置 Expo Modules。
6. “Included in Expo Go”表示 Expo Go 已包含该原生模块，不表示该组件支持 Web 或 iOS。
7. React 组件 API 看起来熟悉，并不代表其子元素、布局和样式规则与 React Web 相同。

## 实际开发建议

以下为基于经验的使用建议，不是当前文档明确规定的 API：

- 只表示“有新状态”时使用无子元素圆点，避免展示没有实际意义的数字。
- 有明确数量时传入 `Text`，并保持内容简短。
- 对较大数字预先定义显示策略，例如将 `100` 以上显示为 `99+`。
- 为 Android 和 iOS 封装统一的业务层 Badge API，在内部选择不同平台实现。
- 使用主题颜色代替散落在组件中的硬编码颜色，方便适配深色模式和品牌主题。
- Badge 通常应依附于图标、头像或导航项，不应单独承担主要交互。
- 验证文字与背景色的对比度，保证数量清晰可读。

## 明确内容与推导内容

### 文档明确说明

- `Badge` 来自 `@expo/ui/jetpack-compose`。
- 组件对应 Jetpack Compose 官方 `Badge` API。
- 组件仅支持 Android，并包含在 Expo Go 中。
- 没有子元素时显示为小圆点。
- 可以传入 `Text` 显示数量或标签。
- 可以通过 `containerColor` 设置背景色。
- 可以通过 `contentColor` 设置内容颜色。
- 可以通过 `modifiers` 传入 `ModifierConfig[]`。
- 已有 React Native 项目需要先安装和配置 `expo`。

### 基于文档内容推导

- Jetpack Compose 组件需要通过 `Host` 嵌入 React Native 组件树。
- 跨平台应用需要为 iOS 准备替代实现。
- Badge 更适合作为状态展示元素，而不是独立交互组件。
- 不能直接将 Web CSS 和 DOM 使用习惯套用到该组件上。

## 总结

`Badge` 是 `@expo/ui` 面向 Android 提供的 Jetpack Compose 原生徽标组件。它有两种基本形态：无子元素时显示状态圆点，传入 `Text` 时显示数量或标签。

它的 API 很精简，主要配置项是 `children`、`containerColor`、`contentColor` 和 `modifiers`。实际使用时最重要的限制是它仅支持 Android；如果项目同时支持 iOS，需要在业务层提供平台适配。本文档没有覆盖徽标定位、复杂 modifier、无障碍支持和大数字处理策略，这些能力不能从当前页面的示例中直接推断。

---

## 文档导航

- **上一页**：[alertdialog](./24__alertdialog.md)
- **下一页**：[badgedbox](./26__badgedbox.md)
