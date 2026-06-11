# DropdownMenu

`DropdownMenu` 是 `@expo/ui` 提供的 Android 下拉菜单组件。它基于 Jetpack Compose 的官方 Menu API，用于在用户按下触发元素后显示一组可选择的菜单项。

- **支持平台**：Android
- **Expo Go**：已包含
- **所属包**：`@expo/ui`
- **底层 UI 技术**：Jetpack Compose

## 文档解决的问题

本文说明如何在 Expo 或 React Native 项目中：

1. 安装 `@expo/ui`。
2. 使用 Jetpack Compose 组件创建下拉菜单。
3. 通过 React state 控制菜单的显示和关闭。
4. 将 React Native 的 `Pressable` 用作菜单触发器。
5. 配置 `DropdownMenu` 及其相关子组件。

它适合需要在 Android 界面中实现操作菜单、更多选项菜单或简单选择列表的场景。

当前文档只介绍下拉菜单组件本身，未涉及：

- iOS 下拉菜单的实现方式。
- Web 平台支持。
- 菜单定位、动画、尺寸和阴影的详细控制。
- 无障碍属性和键盘操作。
- 多级子菜单。
- 动态数据、超长列表或性能优化。
- `ModifierConfig` 的具体结构与可用配置。

## 阅读前需要理解的背景知识

### Jetpack Compose 是什么

Jetpack Compose 是 Android 官方的声明式 UI 框架。对 React Web 开发者来说，可以把它理解为 Android 原生开发中的一种“组件化 UI 系统”：

- React 使用 JSX 描述 DOM 或 React Native 组件。
- Jetpack Compose 使用可组合组件描述 Android 原生界面。
- `@expo/ui/jetpack-compose` 允许开发者通过 React JSX 使用部分 Compose 原生组件。

这里渲染的不是浏览器 DOM，也不是普通 HTML 下拉框，而是 Android 原生 Compose UI。

### `Host` 的作用

示例中的 Compose 组件被放在 `Host` 内：

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

`Host` 用于承载 Jetpack Compose 内容，是 React Native 与 Compose UI 之间的宿主容器。

`matchContents` 表示宿主区域根据内部内容匹配尺寸。当前文档使用了该属性，但未进一步解释其完整行为。

### 受控展开状态

菜单是否显示由 React state 控制：

```tsx
const [isExpanded, setIsExpanded] = useState(false);
```

然后将状态传给菜单：

```tsx
<DropdownMenu
  expanded={isExpanded}
  onDismissRequest={() => setIsExpanded(false)}
>
```

这与 React Web 中的受控弹窗或下拉菜单类似：

- `expanded` 决定菜单当前是否可见。
- 点击触发器时将其设为 `true`。
- 点击菜单外部或选择菜单项时将其设为 `false`。

`DropdownMenu`不会自行维护完整的开关状态，调用方需要正确更新 state。

## 安装

根据使用的包管理器执行对应命令：

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

推荐使用 `expo install`，因为它会按照当前 Expo SDK 选择兼容的依赖版本，而不是直接安装任意最新版本。

如果是在现有的裸 React Native 项目中安装，还必须先为项目配置并安装 `expo`，使项目能够使用 Expo Modules。

> 文档没有提供裸 React Native 项目安装 Expo Modules 的具体步骤，只给出了相关文档入口。

## 基本用法

### 组件结构

一个基本菜单由以下部分组成：

```tsx
<Host>
  <DropdownMenu>
    <DropdownMenu.Trigger>
      {/* 触发元素 */}
    </DropdownMenu.Trigger>

    <DropdownMenu.Items>
      {/* 菜单项 */}
    </DropdownMenu.Items>
  </DropdownMenu>
</Host>
```

各层职责如下：

| 组件 | 作用 |
| --- | --- |
| `Host` | 承载 Jetpack Compose UI |
| `DropdownMenu` | 管理菜单容器和展开状态 |
| `DropdownMenu.Trigger` | 声明打开菜单的触发元素 |
| `DropdownMenu.Items` | 容纳菜单项 |
| `DropdownMenuItem` | 表示一个可点击的菜单项 |
| `DropdownMenuItem.Text` | 菜单项的文字区域 |
| `DropdownMenuItem.LeadingIcon` | 菜单项前方的图标区域 |

### 完整示例

```tsx
import {
  Host,
  DropdownMenu,
  DropdownMenuItem,
  Button,
  Text,
  Icon,
} from '@expo/ui/jetpack-compose';
import { useState } from 'react';

export default function BasicDropdownMenuExample() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={isExpanded}
        onDismissRequest={() => setIsExpanded(false)}
      >
        <DropdownMenu.Trigger>
          <Button
            variant="bordered"
            onClick={() => setIsExpanded(true)}
          >
            Show Menu
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Items>
          <DropdownMenuItem
            onClick={() => {
              setIsExpanded(false);
              console.log('Home pressed');
            }}
          >
            <DropdownMenuItem.Text>
              <Text>Home</Text>
            </DropdownMenuItem.Text>

            <DropdownMenuItem.LeadingIcon>
              <Icon source={homeIcon} size={24} />
            </DropdownMenuItem.LeadingIcon>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
```

### 交互流程

1. 初始状态下，`isExpanded` 为 `false`，菜单不可见。
2. 用户点击 Compose `Button`。
3. `setIsExpanded(true)` 更新状态。
4. `DropdownMenu` 收到 `expanded={true}`，显示菜单。
5. 用户点击菜单项时，业务逻辑先将状态改回 `false`，然后执行相应操作。
6. 用户点击菜单外部时，组件调用 `onDismissRequest`，调用方将状态改为 `false`。

菜单项的 `onClick` 和菜单的 `onDismissRequest` 是两条不同的关闭路径。实际使用时应同时处理，否则部分交互可能无法关闭菜单。

## 使用 React Native 组件作为触发器

`DropdownMenu.Trigger` 默认展示的是 Compose 组件。如果要把 React Native 的 `Pressable` 等组件放入 Compose 组件树，需要使用 `RNHostView` 包装。

```tsx
import {
  Host,
  DropdownMenu,
  DropdownMenuItem,
  Text as ComposeText,
  RNHostView,
} from '@expo/ui/jetpack-compose';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

export default function RNTriggerDropdownMenuExample() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={isExpanded}
        onDismissRequest={() => setIsExpanded(false)}
      >
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <Pressable
              onPress={() => setIsExpanded(true)}
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: '#9B59B6',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                RN Pressable Trigger
              </Text>
            </Pressable>
          </RNHostView>
        </DropdownMenu.Trigger>

        <DropdownMenu.Items>
          <DropdownMenuItem onClick={() => setIsExpanded(false)}>
            <DropdownMenuItem.Text>
              <ComposeText>Item 1</ComposeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsExpanded(false)}>
            <DropdownMenuItem.Text>
              <ComposeText>Item 2</ComposeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
```

这里同时存在两套 UI 组件：

- `Pressable` 和 React Native `Text` 来自 `react-native`。
- `DropdownMenuItem` 和 Compose `Text` 来自 `@expo/ui/jetpack-compose`。

为了避免两个 `Text` 重名，示例将 Compose 版本重命名为：

```tsx
import { Text as ComposeText } from '@expo/ui/jetpack-compose';
```

### 为什么需要 `RNHostView`

React Native View 和 Jetpack Compose 组件属于不同的原生 UI 体系，不能假设它们可以在任意位置直接互相嵌套。

`RNHostView` 在这里承担桥接和承载 React Native 内容的作用：

```tsx
<DropdownMenu.Trigger>
  <RNHostView matchContents>
    <Pressable>{/* ... */}</Pressable>
  </RNHostView>
</DropdownMenu.Trigger>
```

对 React Web 开发者来说，这不同于在普通 DOM 中把一个 React 组件放进另一个组件。这里涉及两套原生视图体系之间的嵌套边界。

## API 说明

导入方式：

```tsx
import { DropdownMenu } from '@expo/ui/jetpack-compose';
```

### `DropdownMenu`

`DropdownMenu` 是菜单的顶层容器，仅支持 Android。

#### `expanded`

```ts
expanded?: boolean
```

控制菜单是否展开：

- `true`：菜单可见。
- `false`：菜单隐藏。

这是可选属性，但实际交互中通常需要显式传入并通过 React state 管理。

#### `onDismissRequest`

```ts
onDismissRequest?: () => void
```

当菜单请求关闭时执行，例如用户点击菜单外部。

文档明确要求：当 `expanded` 为 `true` 时，必须提供该回调，菜单才能正常关闭。

典型写法：

```tsx
onDismissRequest={() => setIsExpanded(false)}
```

这个回调表示“菜单希望关闭”，不会替开发者自动修改 React state。

#### `color`

```ts
color?: ColorValue
```

设置承载菜单项的容器颜色。

这里使用的是 React Native 的 `ColorValue` 类型，而不是 Web CSS 中任意形式的颜色声明。当前文档没有列出支持的颜色格式细节。

#### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

为组件设置 Modifier 配置。

Compose Modifier 通常用于控制布局、外观或行为，但当前文档没有说明 `ModifierConfig` 支持哪些具体配置，因此不能仅根据本文确定其用法。

#### `style`

```ts
style?: StyleProp<ViewStyle>
```

为 `DropdownMenu` 应用可选的 React Native View 样式。

需要注意，它接受的是 React Native `ViewStyle`，不是 Web CSS：

```tsx
style={{ marginTop: 8 }}
```

不能直接使用 CSS class、选择器或带单位的字符串写法。

#### `children`

```ts
children: ReactNode
```

文档描述称，子内容会作为下拉菜单的锚点，并被包装在可点击元素中以触发菜单打开。

但页面示例同时使用了明确的 `DropdownMenu.Trigger` 和 `DropdownMenu.Items` 结构。本文没有进一步解释直接传入普通 `children` 与使用这两个结构化子组件之间的差异。

因此，按本文示例实现时，应优先遵循：

```tsx
<DropdownMenu.Trigger />
<DropdownMenu.Items />
```

上述建议是**基于文档示例推导**，不是文档明确给出的优先级规则。

### `DropdownMenu.Trigger`

```ts
{
  children: ReactNode;
}
```

触发菜单打开的元素容器。

它可以承载：

- `@expo/ui/jetpack-compose` 提供的 Compose 组件。
- 经 `RNHostView` 包装后的 React Native 组件。

`Trigger` 本身只声明触发区域。示例仍然在按钮的点击事件中显式调用：

```tsx
setIsExpanded(true);
```

因此不要把它理解为 Web 原生 `<select>` 那样自动管理展开状态的组件。

### `DropdownMenu.Items`

```ts
{
  children: ReactNode;
}
```

菜单内容容器，其子元素通常为：

- `DropdownMenuItem`
- 其他原生视图

文档没有说明放入任意其他原生视图时的布局约束或交互行为。

### `DropdownMenuItem`

菜单中的单个可点击项目，对应 Jetpack Compose 的 `DropdownMenuItem`。

它应放在：

- `DropdownMenu.Items` 中。
- `ExposedDropdownMenu` 中。

本页只展示了 `onClick` 以及文本、前置图标等组合方式，没有列出完整的 `DropdownMenuItemProps` 属性表。

选择菜单项时，示例显式关闭菜单：

```tsx
<DropdownMenuItem onClick={() => setIsExpanded(false)}>
```

如果还需要执行业务操作，可以放在同一个回调中：

```tsx
onClick={() => {
  setIsExpanded(false);
  performAction();
}}
```

### `DropdownMenu.Preview`

```ts
{
  children: ReactNode;
}
```

API 表将其标为 Android 支持，但描述又称它是“长按时显示的预览内容，仅限 iOS”。

这两处信息相互矛盾，而且当前组件页面整体标明仅支持 Android。根据本文无法确认 `Preview` 在此组件中的实际可用性。

在获得其他官方资料或实际验证之前，不应依赖该 API。这是当前文档本身存在的信息不一致，并非对其行为的推测。

## 注意事项与限制

### 仅支持 Android

本文所有主要组件都标明支持平台为 Android。不要假设相同代码能在以下平台运行：

- iOS
- Web

如果项目是跨平台应用，需要在架构上考虑平台判断或其他平台的替代组件。本文没有给出替代方案。

### 展开状态需要由 React 管理

菜单的打开和关闭依赖调用方更新 `expanded`：

```tsx
const [isExpanded, setIsExpanded] = useState(false);
```

只传入固定值会使交互失效。例如：

```tsx
<DropdownMenu expanded={true}>
```

菜单将一直处于展开状态；即使触发了关闭请求，如果没有对应的状态更新，它也无法真正关闭。

### `onDismissRequest` 不能遗漏

文档明确指出，当 `expanded` 为 `true` 时必须提供 `onDismissRequest`，否则菜单无法响应点击外部等关闭请求。

这与菜单项点击后的关闭处理不同，两者都需要根据交互需求配置。

### React Native 触发器需要桥接

不能根据 React Web 的组件嵌套经验，默认 `Pressable` 可以直接放入 Compose `Trigger`。文档要求使用：

```tsx
<RNHostView matchContents>
  <Pressable />
</RNHostView>
```

### 事件属性名称取决于组件体系

示例中的事件名称不同：

```tsx
// Compose Button
<Button onClick={...} />

// React Native Pressable
<Pressable onPress={...} />
```

这不是两种等价拼写可以任意替换，而是不同组件 API 的约定：

- Compose 风格组件使用 `onClick`。
- React Native `Pressable` 使用 `onPress`。
- Web 中常见的 DOM `onClick` 经验不能直接套用到所有 React Native 组件。

### 样式不是 CSS

`style` 使用 React Native 的 `ViewStyle`。以下 Web 写法不能直接照搬：

```tsx
// Web CSS 思维，不应直接套用
style={{
  padding: '10px 16px',
  borderRadius: '8px',
}}
```

React Native 示例使用无单位数值和拆分后的方向属性：

```tsx
style={{
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 8,
}}
```

### 文档未说明的能力

当前文档没有说明以下行为，不能仅凭本文作出确定判断：

- 多个菜单同时打开时如何协调。
- 菜单超出屏幕时如何定位。
- 菜单项禁用状态。
- 菜单的最大高度和滚动行为。
- 焦点管理及无障碍支持。
- `color` 与系统主题之间的关系。
- `style` 和 `modifiers` 同时存在时的优先级。
- 菜单项是否会在点击后自动关闭。
- `DropdownMenuItem` 的完整属性。

## React Web 开发者最容易误解的地方

### 它不是 DOM 下拉菜单

`DropdownMenu` 不是 `<select>`，也不是基于绝对定位 `<div>` 实现的 Web 弹层。它最终使用 Android Jetpack Compose 原生 UI。

因此：

- 没有 DOM 节点。
- 不能使用 CSS class 和 CSS 选择器。
- 不能使用浏览器开发者工具按 DOM 结构调试。
- 事件、布局和渲染行为遵循 React Native 与 Compose 的规则。

### `Trigger` 不等于自动状态管理

`DropdownMenu.Trigger` 表示菜单锚点和触发区域，但示例仍然需要在按钮事件中执行：

```tsx
setIsExpanded(true);
```

关闭时也需要显式更新状态。它更接近一个结构化的组合组件，而不是自行完成全部交互的原生控件。

### 页面中混用了两套组件

下面两个 `Text` 名称相同，但来源和渲染体系不同：

```tsx
import { Text as ComposeText } from '@expo/ui/jetpack-compose';
import { Text } from 'react-native';
```

开发时需要确认当前组件所在的宿主环境，并使用正确来源的组件。React Native 内容进入 Compose 结构时，需要通过 `RNHostView` 承载。

### 平台支持必须显式考虑

React Web 项目通常默认代码运行在浏览器中，而此组件只能运行在 Android。共享组件如果无条件导入和渲染它，可能影响其他平台构建或运行。

如何进行平台拆分不在当前文档范围内。

## 实际开发建议

以下内容属于**基于文档内容推导**或**基于经验建议**，不是当前页面明确规定的 API 行为。

### 将开关逻辑集中管理

**基于经验建议**：为避免不同关闭路径遗漏状态更新，可以定义统一关闭函数：

```tsx
const closeMenu = () => setIsExpanded(false);
```

然后同时用于：

```tsx
<DropdownMenu
  expanded={isExpanded}
  onDismissRequest={closeMenu}
>
  <DropdownMenuItem
    onClick={() => {
      closeMenu();
      performAction();
    }}
  />
</DropdownMenu>
```

### 菜单项执行后显式关闭

**基于文档内容推导**：示例中的每个菜单项都调用了 `setIsExpanded(false)`，说明业务代码不应依赖菜单项自动关闭。

推荐在所有选择分支中显式处理关闭状态，除非后续通过其他官方文档或实际测试确认了不同的行为。

### 优先保持单一 UI 体系

**基于经验建议**：如果触发器可以直接使用 Compose `Button` 实现，就不必额外引入 `RNHostView`。只有需要复用现有 React Native 组件时，再使用 React Native 触发器。

这样可以减少跨 UI 体系嵌套带来的布局和调试复杂度。

### 为跨平台项目封装平台实现

**基于经验建议**：由于该组件仅支持 Android，可以在业务层定义统一菜单接口，再为 Android 和其他平台提供不同实现，避免平台特有组件扩散到整个业务代码中。

## 信息性质说明

### 文档明确说明的内容

- `DropdownMenu` 基于 Jetpack Compose 官方 Menu API。
- 组件用于在触发元素被按下时显示下拉菜单。
- 组件支持 Android，并包含在 Expo Go 中。
- 安装包名为 `@expo/ui`。
- 裸 React Native 项目需要先安装 Expo Modules。
- React Native View 作为触发器时需要使用 `RNHostView`。
- `expanded` 控制菜单是否显示。
- 菜单展开时必须提供 `onDismissRequest` 才能正常关闭。
- `DropdownMenuItem` 应用于 `DropdownMenu.Items` 或 `ExposedDropdownMenu` 中。
- `DropdownMenu.Items` 可以包含菜单项或其他原生视图。

### 基于文档内容推导的内容

- 应按照示例优先使用 `Trigger` 和 `Items` 组织菜单结构。
- 不应依赖菜单项点击后自动关闭菜单。
- 跨平台项目需要为非 Android 平台准备其他实现。
- React Native 与 Compose 组件的混合使用存在明确的宿主边界。

### 当前无法从文档确定的内容

- `DropdownMenu.Preview` 的真实平台支持情况。
- `children` 属性描述与 `Trigger`、`Items` 组合 API 的准确关系。
- `ModifierConfig` 的具体配置方式。
- 菜单定位、滚动、无障碍和动画行为。
- `DropdownMenuItem` 的完整属性列表。

## 总结

使用 `DropdownMenu` 的核心是一个由 React state 控制的组合结构：

```tsx
<Host>
  <DropdownMenu
    expanded={isExpanded}
    onDismissRequest={() => setIsExpanded(false)}
  >
    <DropdownMenu.Trigger>
      {/* 打开菜单的 Compose 组件 */}
    </DropdownMenu.Trigger>

    <DropdownMenu.Items>
      <DropdownMenuItem
        onClick={() => setIsExpanded(false)}
      >
        {/* 菜单项内容 */}
      </DropdownMenuItem>
    </DropdownMenu.Items>
  </DropdownMenu>
</Host>
```

需要记住三个关键限制：

1. 该组件仅支持 Android。
2. 菜单展开和关闭状态需要由 React state 管理。
3. React Native 组件作为触发器时必须通过 `RNHostView` 嵌入 Compose 组件树。

---

## 文档导航

- **上一页**：[dockedsearchbar](./37__dockedsearchbar.md)
- **下一页**：[exposeddropdownmenubox](./39__exposeddropdownmenubox.md)
