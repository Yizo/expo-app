# Expo UI：FloatingActionButton 学习指南

> 文档更新时间：2026 年 5 月 19 日  
> 包名：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 当前页面属于“下一 SDK 版本”的文档；Expo 提示稳定使用时应参考最新版本 SDK 56 的对应页面。

## 文档解决的问题

本文介绍如何通过 Expo UI 在 React Native 应用中使用符合 Material Design 3 规范的 Android 悬浮操作按钮（Floating Action Button，简称 FAB），包括：

- 四种 FAB 组件的选择和使用
- 图标、文字等内容的组合方式
- 点击事件处理
- 展开式 FAB 的状态控制
- 将 FAB 浮动放置在滚动内容上方
- 自定义按钮背景色

FAB 通常用来承载当前页面最主要、最常用的操作，例如新建、添加或编辑。

> **基于文档内容推导：** FAB 适合表达页面中的核心操作，不适合把大量同级操作全部做成多个独立悬浮按钮。文档明确建议：需要包含多个操作按钮的悬浮工具栏时，应使用 `HorizontalFloatingToolbar`。

## 阅读前需要理解的背景知识

### Expo UI 与 Jetpack Compose

`@expo/ui` 是 Expo 提供的 UI 组件包。本文使用的是其 Jetpack Compose 入口：

```tsx
import {
  FloatingActionButton,
  Host,
  Icon,
} from '@expo/ui/jetpack-compose';
```

Jetpack Compose 是 Android 的声明式原生 UI 工具包。对 React Web 开发者来说，可以将它类比为一种 Android 原生的组件化 UI 系统：

- React 使用 JSX 描述界面。
- Compose 使用声明式组件描述 Android 原生界面。
- `@expo/ui/jetpack-compose` 允许在 React Native JSX 中使用由 Compose 实现的原生组件。

这些组件不是浏览器中的 DOM 元素，也不是普通的 React Native `View` 样式组件，而是对 Android Material 3 Compose 组件的封装。

### Material Design 3

Material Design 3 是 Google 的界面设计体系。本文中的 FAB 组件对应 Android Jetpack Compose Material 3 提供的同名组件。

### `Host`

示例都使用 `Host` 包裹 Compose 组件：

```tsx
<Host matchContents>
  <FloatingActionButton>{/* ... */}</FloatingActionButton>
</Host>
```

根据文档示例可以确认，Compose FAB 需要放在 `Host` 中。

- `matchContents`：示例在单独展示按钮时使用，让 `Host` 的尺寸匹配内部内容。
- `style={{ flex: 1 }}`：需要让 Compose 内容占满可用空间时使用，例如 FAB 覆盖在滚动列表上方。

> `Host` 的完整 API 和布局行为不在当前文档的说明范围内。上述含义来自示例的使用方式，属于**基于文档内容推导**。

### Slot-based children

FAB 不直接接收任意排列的普通子元素，而是通过具名子组件定义内容：

```tsx
<FloatingActionButton.Icon>
  <Icon source={require('./assets/add.xml')} />
</FloatingActionButton.Icon>
```

展开式 FAB 还提供文字插槽：

```tsx
<ExtendedFloatingActionButton.Text>
  <Text>Edit</Text>
</ExtendedFloatingActionButton.Text>
```

这类似于 React Web 组件库中的 compound components（复合组件）模式。`.Icon` 和 `.Text` 明确告诉父组件每段内容的语义和放置位置。

## 安装

根据使用的包管理器执行其中一条命令：

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

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它负责安装与当前 Expo SDK 兼容的包版本。

如果项目是现有的 React Native 原生项目，即没有以完整 Expo 项目开始的项目，需要先按照 Expo Modules 的安装说明将 `expo` 安装到工程中。

> 当前文档未提供 iOS 安装或使用方式，因为这些 FAB 组件仅声明支持 Android。

## 四种 FAB 组件

Expo UI 提供四种符合 Material Design 3 API 的 FAB。

| 组件 | 用途 | 内容 |
| --- | --- | --- |
| `SmallFloatingActionButton` | 紧凑型操作按钮 | 图标 |
| `FloatingActionButton` | 标准尺寸，也是默认选择 | 图标 |
| `LargeFloatingActionButton` | 需要更突出显示的较大按钮 | 图标 |
| `ExtendedFloatingActionButton` | 同时显示图标和文字标签 | 图标、文字 |

前三种组件共享相同的主要 Props，只是在原生组件类型和视觉尺寸上不同。

### 标准 FAB

```tsx
import { FloatingActionButton, Host, Icon } from '@expo/ui/jetpack-compose';

export default function StandardFABExample() {
  return (
    <Host matchContents>
      <FloatingActionButton onClick={() => console.log('FAB pressed')}>
        <FloatingActionButton.Icon>
          <Icon source={require('./assets/add.xml')} />
        </FloatingActionButton.Icon>
      </FloatingActionButton>
    </Host>
  );
}
```

关键结构：

1. 使用 `Host` 建立 Compose 容器。
2. 使用 `FloatingActionButton` 创建标准 FAB。
3. 将 `Icon` 放入 `FloatingActionButton.Icon` 插槽。
4. 通过 `onClick` 响应点击。

示例中的图标通过 `require('./assets/add.xml')` 加载 XML 资源。当前文档没有进一步说明 XML 图标的格式要求或其他可用资源类型。

### 不同尺寸的 FAB

```tsx
import {
  FloatingActionButton,
  Host,
  Icon,
  LargeFloatingActionButton,
  SmallFloatingActionButton,
} from '@expo/ui/jetpack-compose';
import { View } from 'react-native';

export default function FABVariantsExample() {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Host matchContents>
        <SmallFloatingActionButton onClick={() => {}}>
          <SmallFloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </SmallFloatingActionButton.Icon>
        </SmallFloatingActionButton>
      </Host>

      <Host matchContents>
        <FloatingActionButton onClick={() => {}}>
          <FloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      </Host>

      <Host matchContents>
        <LargeFloatingActionButton onClick={() => {}}>
          <LargeFloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </LargeFloatingActionButton.Icon>
        </LargeFloatingActionButton>
      </Host>
    </View>
  );
}
```

这个示例同时使用两套布局系统：

- 外层 `View` 是 React Native 布局。
- 每个 `Host` 内部是 Compose 组件。
- `flexDirection` 和 `gap` 控制多个 `Host` 之间的排列。
- 每个 `Host matchContents` 匹配各自按钮的大小。

对 React Web 开发者而言，外层 `View` 可以近似理解为使用 Flexbox 的容器，但它不是 DOM 中的 `<div>`。

### 展开式 FAB

```tsx
import {
  ExtendedFloatingActionButton,
  Host,
  Icon,
  Text,
} from '@expo/ui/jetpack-compose';
import { useState } from 'react';

export default function ExtendedFABExample() {
  const [expanded, setExpanded] = useState(true);

  return (
    <Host matchContents>
      <ExtendedFloatingActionButton
        expanded={expanded}
        onClick={() => setExpanded(value => !value)}
      >
        <ExtendedFloatingActionButton.Icon>
          <Icon source={require('./assets/edit.xml')} />
        </ExtendedFloatingActionButton.Icon>

        <ExtendedFloatingActionButton.Text>
          <Text>Edit</Text>
        </ExtendedFloatingActionButton.Text>
      </ExtendedFloatingActionButton>
    </Host>
  );
}
```

`ExtendedFloatingActionButton` 可以显示图标和文字标签。

`expanded` 控制标签是否可见：

- `true`：展开，显示文字标签。
- `false`：折叠，隐藏文字标签。
- 默认值：`true`。

标签的展开和折叠带有动画，该动画由底层 Material 3 组件提供。业务代码只需要更新 `expanded` 状态。

这与 React Web 中的受控组件类似：按钮自身不会替你决定何时展开，当前状态由 React state 传入。

> 示例为了演示功能，在点击按钮时切换展开状态。文档没有要求所有展开式 FAB 都必须采用这种交互，实际项目可以根据页面状态控制 `expanded`。

## 将 FAB 浮动在内容上方

文档推荐在 Compose 层内使用 `Box`，并通过 `align('bottomEnd')` 将按钮放在滚动内容上方：

```tsx
import {
  Box,
  FloatingActionButton,
  Host,
  Icon,
  LazyColumn,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  offset,
} from '@expo/ui/jetpack-compose/modifiers';

export default function FloatingFABExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Box modifiers={[fillMaxSize()]}>
        <LazyColumn modifiers={[fillMaxSize()]}>
          {/* ...list items... */}
        </LazyColumn>

        <FloatingActionButton
          modifiers={[align('bottomEnd'), offset(-16, -16)]}
          onClick={() => console.log('pressed')}
        >
          <FloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      </Box>
    </Host>
  );
}
```

布局关系如下：

1. `Host` 使用 `flex: 1` 占据 React Native 父布局中的可用空间。
2. `Box` 使用 `fillMaxSize()` 填满 `Host`。
3. `LazyColumn` 同样填满 `Box`，作为可滚动内容。
4. FAB 也是 `Box` 的子组件，因此可以覆盖在列表上方。
5. `align('bottomEnd')` 将 FAB 对齐到容器末端底部。
6. `offset(-16, -16)` 让按钮从右下边界向内偏移。

`bottomEnd` 使用的是逻辑方向，而不是固定的“右下角”。当前文档没有进一步解释其在不同文字方向下的行为。

### `modifiers` 与 Web 样式的区别

Compose 使用 Modifier 描述尺寸、对齐、偏移等行为：

```tsx
modifiers={[
  align('bottomEnd'),
  offset(-16, -16),
]}
```

它不能简单等同于 CSS class 或 React Native `style`：

- `style` 用在 React Native 层，例如 `Host style={{ flex: 1 }}`。
- `modifiers` 传给 Compose 组件，作用于 Compose 布局层。
- Modifier 由 `@expo/ui/jetpack-compose/modifiers` 导入。

> Modifier 的执行顺序、完整类型和所有可用函数，当前文档未涉及。

## 自定义背景色

使用 `containerColor` 设置按钮容器的背景色：

```tsx
<ExtendedFloatingActionButton
  containerColor="#E8DEF8"
  onClick={() => console.log('pressed')}
>
  <ExtendedFloatingActionButton.Icon>
    <Icon source={require('./assets/add.xml')} />
  </ExtendedFloatingActionButton.Icon>

  <ExtendedFloatingActionButton.Text>
    <Text>New item</Text>
  </ExtendedFloatingActionButton.Text>
</ExtendedFloatingActionButton>
```

`containerColor` 的类型是 React Native `ColorValue`。

如果不传入，组件使用 Material 3 的：

```text
FloatingActionButtonDefaults.containerColor
```

文档将其描述为 primary container（主色容器）默认颜色。

当前文档没有提供单独配置文字颜色、图标颜色、形状、阴影或 elevation 的 Props。虽然底层 Compose API 具备更多参数，也不能据此认定 Expo 封装已经暴露了这些能力。

## API 说明

### 公共 Props

`SmallFloatingActionButton`、`FloatingActionButton` 和 `LargeFloatingActionButton` 使用 `FloatingActionButtonProps`。`ExtendedFloatingActionButtonProps` 也继承这些属性。

| Prop | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 文档未标记为可选 | 通过 `.Icon`，以及扩展按钮的 `.Text` 插槽提供内容 |
| `containerColor` | `ColorValue` | 否 | 设置按钮容器背景色 |
| `modifiers` | `ModifierConfig[]` | 否 | 设置 Compose Modifier |
| `onClick` | `() => void` | 否 | 点击按钮时调用 |

文档将 `onClick` 标记为可选。这意味着从 TypeScript API 角度可以不传，但一个没有点击行为的 FAB 通常无法执行页面操作。

> **基于经验建议：** 实际开发中应为可见的 FAB 提供明确的点击行为，并确认其无障碍语义。当前文档没有介绍禁用状态、无障碍标签或测试标识的配置方式，需要查阅相关组件文档后再决定实现。

### `ExtendedFloatingActionButton` 独有 Prop

| Prop | 类型 | 必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `expanded` | `boolean` | 否 | `true` | 控制文字标签显示或隐藏 |

`expanded` 隐藏的是标签，文档没有说明它会隐藏图标或整个按钮。

## 平台与版本限制

### 仅支持 Android

所有组件的 API 都明确标记：

```text
Supported platforms: Android
```

因此不能将它们当作跨 iOS、Android 和 Web 的通用 React Native 组件。

对需要多平台运行的项目，调用方必须考虑平台差异。具体应采用条件渲染、平台文件还是其他替代组件，当前文档未给出方案。

### 可在 Expo Go 中使用

页面元数据显示这些组件包含在 Expo Go 中。这表示在文档对应的支持环境中，可以通过 Expo Go 使用它们。

不过，当前页面属于下一 SDK 版本文档，而稳定版本链接指向 SDK 56。开发时应以项目实际 Expo SDK 对应的文档和 API 为准，不能直接假设未发布版本中的接口已经存在于当前项目。

### 多按钮场景

文档明确指出：如果需要在悬浮工具栏中放置多个操作按钮，应改用 `HorizontalFloatingToolbar`。

这不是让多个 `FloatingActionButton` 横向排列的示例，而是另一个专门面向多操作场景的组件。

## React Web 开发者容易误解的地方

### 1. 这不是 CSS `position: fixed`

FAB 覆盖在列表上方的示例使用 Compose `Box`、`align` 和 `offset`。它没有使用 CSS，也没有浏览器 viewport。

按钮的定位范围是其 Compose 容器，而不是整个页面或设备屏幕。

### 2. React Native 布局和 Compose 布局是两层系统

下面两段配置作用于不同层：

```tsx
<Host style={{ flex: 1 }}>
```

```tsx
<Box modifiers={[fillMaxSize()]}>
```

前者控制 `Host` 在 React Native 布局中的尺寸，后者控制 Compose 组件在 `Host` 内部的布局。只设置其中一层，不一定能得到预期的全屏覆盖效果。

### 3. `.Icon` 和 `.Text` 不是普通 DOM 包装元素

它们是组件定义的内容插槽。应按照父组件对应的命名使用：

```tsx
<LargeFloatingActionButton.Icon>
```

不要把标准 FAB 的插槽机械地写成其他组件的子组件。文档展示的是每种 FAB 使用自己的 `.Icon`。

### 4. `Text` 和 `Icon` 来自 Compose 入口

展开式示例中的 `Text` 来源是：

```tsx
import { Text } from '@expo/ui/jetpack-compose';
```

它不是 HTML `<span>`，也不是示例中从 `react-native` 导入的 `Text`。

### 5. `expanded` 是受 React 状态控制的输入

组件提供展开和折叠动画，但业务代码仍负责传入最新的布尔值。若一直传入 `true`，按钮就不会折叠。

### 6. 底层原生 API 不等于 Expo 已公开的 API

文档说明这些组件包装了 Android Compose Material 3 的同名组件，但实际可用能力应以本文列出的 React Props 为准。不能直接把 Kotlin API 参数写进 TSX。

## 实际开发使用思路

一个典型使用流程是：

1. 确认项目目标平台包含 Android，并核对项目 Expo SDK 版本。
2. 使用 `expo install @expo/ui` 安装兼容版本。
3. 从 `@expo/ui/jetpack-compose` 导入 FAB、`Host` 和内容组件。
4. 根据操作的重要程度选择标准、小型、大型或展开式 FAB。
5. 使用组件自己的 `.Icon`，必要时再使用 `.Text` 插槽。
6. 通过 `onClick` 连接业务行为。
7. 需要覆盖在列表上方时，把列表和 FAB 放入同一个 Compose `Box`。
8. 使用 `modifiers` 完成 Compose 层的对齐和偏移。
9. 多操作悬浮工具栏改用 `HorizontalFloatingToolbar`。
10. 在真实 Android 环境中验证尺寸、位置、点击行为和展开动画。

> **基于经验建议：** FAB 应对应清晰且高频的主要操作。避免仅为了视觉突出而使用 FAB，也不要在同一页面堆叠多个独立 FAB。

## 文档未涉及的内容

当前文档没有说明以下内容，因此不能仅根据本文确定其实现方式：

- iOS 或 Web 的替代组件
- 禁用状态
- 加载状态
- 无障碍标签和屏幕阅读器配置
- 测试标识
- 图标 XML 文件的具体格式要求
- 图标与文字颜色配置
- 形状、阴影和 elevation 配置
- FAB 的精确尺寸
- Modifier 的执行顺序和完整 API
- 主题系统如何影响默认颜色
- 跨平台条件渲染方案

## 明确信息与推导信息

### 文档明确说明

- 提供四种 Material Design 3 FAB。
- 四种组件仅支持 Android。
- 组件包含在 Expo Go 中。
- FAB 内容采用 `.Icon` 和 `.Text` 插槽组织。
- `ExtendedFloatingActionButton` 支持带动画的标签展开和折叠。
- `expanded` 默认值为 `true`。
- `containerColor` 用于设置容器背景色。
- `modifiers` 接收 `ModifierConfig[]`。
- FAB 可以使用 Compose `Box` 浮动在滚动内容上方。
- 多操作悬浮工具栏应使用 `HorizontalFloatingToolbar`。
- 现有 React Native 项目需要先安装 Expo Modules 支持。

### 基于文档内容推导

- `Host matchContents` 用于让单个组件的宿主尺寸匹配内容。
- `Host style={{ flex: 1 }}` 与 `fillMaxSize()` 分别处理 React Native 层和 Compose 层的尺寸。
- `ExtendedFloatingActionButton` 可视为由 React state 控制的受控组件。
- FAB 的浮动位置相对于 Compose `Box`，而不是浏览器 viewport。
- 选用小型、标准或大型 FAB，主要是在操作强调程度和可用空间之间做选择。

## 总结

Expo UI 的 FAB 是 Android 专用的 Jetpack Compose Material 3 原生组件封装。标准使用结构是：

```tsx
<Host>
  <FloatingActionButton onClick={handleClick}>
    <FloatingActionButton.Icon>
      <Icon source={iconSource} />
    </FloatingActionButton.Icon>
  </FloatingActionButton>
</Host>
```

开发时最重要的是区分 React Native 和 Compose 两套布局体系，正确使用具名插槽，并根据项目 Expo SDK 版本核对 API。需要让按钮覆盖在滚动内容上方时，应在同一个 Compose `Box` 中通过 Modifier 完成布局；需要多个悬浮操作时，则应使用专门的 `HorizontalFloatingToolbar`。

---

## 文档导航

- **上一页**：[exposeddropdownmenubox](./39__exposeddropdownmenubox.md)
- **下一页**：[flowrow](./41__flowrow.md)
