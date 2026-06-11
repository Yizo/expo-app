# Form：使用 SwiftUI 风格的表单容器

> 文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已内置

## 文档解决的问题

`Form` 是 Expo UI 提供的 SwiftUI 表单容器，用来按照原生平台的布局方式组织文本框、开关、按钮等数据录入控件。

它适合以下场景：

- 设置页面
- 用户资料编辑页面
- 偏好配置页面
- 检查面板或属性编辑面板
- 其他需要分组展示输入控件的 iOS、tvOS 页面

`Form` 主要负责表单的**结构和原生布局**。当前文档没有涉及表单校验、数据提交、错误提示或表单状态管理方案。

## 阅读前需要理解的背景

### `@expo/ui` 是什么

`@expo/ui` 提供可在 React Native 中使用的平台原生 UI 组件。

本文使用的是：

```tsx
import { Form } from '@expo/ui/swift-ui';
```

其中 `swift-ui` 表示这些组件对应 Apple 的 SwiftUI 组件体系。虽然开发代码仍然使用 React 和 TSX，但最终呈现的是 SwiftUI 风格的原生界面。

### SwiftUI 是什么

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的框架。

Expo UI 的 `Form` 与 Apple 官方 SwiftUI `Form` API 对应，因此其布局和交互行为更接近 Apple 平台的原生表单，而不是浏览器中的 HTML `<form>`。

### `Form` 与 HTML `<form>` 的区别

React Web 开发者不能把这里的 `Form` 理解成 HTML `<form>`：

- 它没有浏览器的 `submit` 事件。
- 它没有 `action`、`method` 等 HTML 属性。
- 文档没有提供自动收集字段值的机制。
- 输入状态仍需通过 React state 或其他状态管理方式维护。
- 提交操作需要通过按钮的 `onPress` 等事件自行实现。

换言之，Expo UI `Form` 更接近一个具有 Apple 原生表单样式和行为的**布局容器**。

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

这里使用 `expo install`，而不是直接使用包管理器的普通安装命令。它用于安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先在项目中安装并配置 `expo`，才能使用 Expo Modules，包括 `@expo/ui`。

当前文档没有展开已有 React Native 项目的原生配置步骤，只提供了相关安装文档入口。

## 基础用法

```tsx
import { Host, Form, TextField } from '@expo/ui/swift-ui';

export default function BasicFormExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <TextField placeholder="Enter your name" />
      </Form>
    </Host>
  );
}
```

组件层级如下：

```text
Host
└── Form
    └── TextField
```

### `Host`

`Host` 是 SwiftUI 内容的承载容器。示例通过：

```tsx
style={{ flex: 1 }}
```

让它占满父级可用空间。

对 React Web 开发者而言，可以将其大致理解为 SwiftUI 组件树与 React Native 页面之间的宿主边界，但它不是浏览器 DOM 中的 `<div>`。

### `Form`

`Form` 负责组织表单内容。需要显示的输入控件通过 `children` 放在其中。

### `TextField`

`TextField` 是文本输入控件。示例只设置了占位文本，没有演示字段值的读取、更新或校验。

## 使用 `Section` 对控件分组

表单内容较多时，可以通过 `Section` 将相关控件划分为不同区域：

```tsx
import { useState } from 'react';
import {
  Host,
  Form,
  Section,
  TextField,
  Toggle,
  Button,
} from '@expo/ui/swift-ui';

export default function FormWithSectionsExample() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section title="Profile">
          <TextField placeholder="Name" />
          <TextField placeholder="Email" />
        </Section>

        <Section title="Preferences">
          <Toggle
            label="Enable notifications"
            isOn={notifications}
            onIsOnChange={setNotifications}
          />
          <Toggle
            label="Dark mode"
            isOn={darkMode}
            onIsOnChange={setDarkMode}
          />
        </Section>

        <Section>
          <Button
            label="Save Changes"
            onPress={() => console.log('Saved!')}
          />
        </Section>
      </Form>
    </Host>
  );
}
```

### 分组关系

示例将表单划分为三个区域：

| 分组 | 内容 |
|---|---|
| `Profile` | 姓名和邮箱输入框 |
| `Preferences` | 通知和深色模式开关 |
| 无标题分组 | 保存按钮 |

`Section` 的作用类似设置页面中的分组，而不只是普通的视觉间距容器。

### `Toggle` 的状态控制

```tsx
<Toggle
  label="Enable notifications"
  isOn={notifications}
  onIsOnChange={setNotifications}
/>
```

这里采用 React 的受控状态模式：

- `isOn`：当前是否开启。
- `onIsOnChange`：用户切换状态时调用。
- `setNotifications`：把新值写回 React state。

这与 React Web 中受控的 checkbox 类似：

```tsx
<input
  type="checkbox"
  checked={notifications}
  onChange={event => setNotifications(event.target.checked)}
/>
```

但 React Native 和 Expo UI 不使用 DOM 事件，也不存在 `event.target.checked`。组件通过 `onIsOnChange` 直接传递新的开关状态。

### 保存操作

示例通过按钮的 `onPress` 处理保存：

```tsx
<Button
  label="Save Changes"
  onPress={() => console.log('Saved!')}
/>
```

点击按钮不会触发 `Form` 的统一提交事件。实际项目需要在 `onPress` 中自行读取状态、校验数据并发送请求。

## 自定义表单背景

`Form` 默认具有原生表单背景。可以组合 `scrollContentBackground` 和 `background` modifier 修改背景：

```tsx
import { Host, Form, Section, TextField } from '@expo/ui/swift-ui';
import {
  scrollContentBackground,
  background,
} from '@expo/ui/swift-ui/modifiers';

export default function FormBackgroundExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Form
        modifiers={[
          scrollContentBackground('hidden'),
          background('#F0F0F0'),
        ]}>
        <Section title="Custom Background">
          <TextField placeholder="Enter text" />
        </Section>
      </Form>
    </Host>
  );
}
```

两个 modifier 分别承担不同职责：

- `scrollContentBackground('hidden')`：隐藏表单滚动内容区域原本的背景。
- `background('#F0F0F0')`：设置新的背景颜色。

只设置 `background` 而不隐藏原生滚动背景时，新背景可能被默认背景覆盖。

### 什么是 modifier

SwiftUI 使用 modifier 修改组件的外观和行为。Expo UI 将这种模式映射为 `modifiers` 数组：

```tsx
<Form modifiers={[modifierA(), modifierB()]}>
```

它与 React Web 的 `className` 或内联 `style` 不完全相同。modifier 不仅能控制样式，也能加入滚动、刷新等行为。

## 禁止表单滚动

使用 `scrollDisabled` modifier 可以禁止表单滚动：

```tsx
import { useState } from 'react';
import {
  Host,
  Form,
  Section,
  Toggle,
} from '@expo/ui/swift-ui';
import { scrollDisabled } from '@expo/ui/swift-ui/modifiers';

export default function NonScrollableFormExample() {
  const [isOn, setIsOn] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Form modifiers={[scrollDisabled()]}>
        <Section title="Settings">
          <Toggle
            label="Enable feature"
            isOn={isOn}
            onIsOnChange={setIsOn}
          />
        </Section>
      </Form>
    </Host>
  );
}
```

### 平台版本限制

`scrollDisabled` 仅支持：

- iOS 16 及以上版本
- tvOS 16 及以上版本

如果应用需要支持更低版本，不能假设该 modifier 始终可用。当前文档没有说明低版本上的具体表现，也没有提供兼容写法。

**基于文档内容推导：**决定最低系统版本时，需要把 modifier 的系统版本要求纳入兼容性检查，而不能只检查 `Form` 组件本身是否支持该平台。

## 添加下拉刷新

通过 `refreshable` modifier，可以为表单增加下拉刷新行为：

```tsx
import { useState, useCallback } from 'react';
import { Host, Form, Section, Text } from '@expo/ui/swift-ui';
import { refreshable } from '@expo/ui/swift-ui/modifiers';

export default function RefreshableFormExample() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastRefresh(new Date());
  }, []);

  return (
    <Host style={{ flex: 1 }}>
      <Form modifiers={[refreshable(handleRefresh)]}>
        <Section title="Pull to Refresh">
          <Text>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </Text>
        </Section>
      </Form>
    </Host>
  );
}
```

`refreshable` 接收一个刷新函数：

```tsx
refreshable(handleRefresh)
```

示例中的处理流程是：

1. 用户执行下拉刷新操作。
2. `handleRefresh` 开始执行。
3. 异步等待 1.5 秒，模拟网络请求。
4. 更新 `lastRefresh`。
5. React 根据新状态重新渲染刷新时间。

刷新函数是 `async` 函数。示例表明它可以等待异步任务完成，但当前文档没有说明错误处理、超时或并发刷新策略。

**基于经验建议：**真实请求应使用 `try/catch` 处理失败，并避免刷新失败时产生未处理的 Promise rejection。

## API 说明

### 导入方式

```tsx
import { Form } from '@expo/ui/swift-ui';
```

不要从 `@expo/ui` 根路径或 React Native 中导入本文介绍的 `Form`。

### `Form` 组件

支持平台：

- iOS
- tvOS

类型：

```tsx
React.Element<FormProps>
```

它是一个 React 组件，其属性类型为 `FormProps`。

### `children`

类型：

```tsx
ReactNode
```

`children` 表示放入表单中的内容，例如：

- `Section`
- `TextField`
- `Toggle`
- `Button`
- `Text`

当前文档没有列出对 `children` 类型或数量的额外限制。

### 继承属性

`Form` 继承：

```text
CommonViewModifierProps
```

这意味着它可以接收通用的 SwiftUI modifier 相关属性。本文中的背景、禁止滚动和下拉刷新功能，都是通过 `modifiers` 使用的。

当前文档没有完整列出 `CommonViewModifierProps` 的全部可用 modifier，需要查阅单独的 SwiftUI modifiers 文档。

## 限制与容易踩坑的地方

### 平台范围有限

文档只声明支持 iOS 和 tvOS，没有声明支持：

- Android
- Web

因此，不能把这个组件直接视为跨 iOS、Android 和 Web 的通用表单方案。

**基于文档内容推导：**如果同一业务页面需要支持 Android，应设计平台分支或选择具有对应平台支持的组件方案。

### 当前页面属于下一版本 SDK 文档

本文来源是 `unversioned` 文档，即下一 SDK 版本的文档。原文明确指出，当前稳定版本是 SDK 56，并建议通过 `latest` 页面查看最新稳定文档。

这意味着本文展示的 API 可能尚未与当前项目使用的稳定 SDK 完全一致。开发前应先确认项目的 Expo SDK 版本。

### `Form` 不管理业务数据

`Form` 只提供容器和布局。文档没有说明它会：

- 自动保存字段值
- 自动执行字段校验
- 自动生成提交数据
- 自动阻止无效提交
- 自动显示错误信息

这些能力需要应用代码或其他表单库实现。

### modifier 可能有系统版本要求

文档明确说明 `scrollDisabled` 仅支持 iOS 16+ 和 tvOS 16+。其他 modifier 是否存在额外版本限制，当前页面未说明，应查阅各 modifier 自身的 API 文档。

### 示例不是完整业务表单

示例中的 `TextField` 没有连接 React state，因此不能仅根据示例判断文本值的受控方式。表单校验、键盘处理、焦点管理、无障碍配置及网络提交也都不在本文范围内。

## React Web 开发者的使用思路

可以用下面的关系建立初步理解：

| React Web 概念 | 本文中的近似对应概念 |
|---|---|
| 页面或区域容器 | `Host` |
| 表单布局容器 | `Form` |
| `fieldset` 或设置分组 | `Section` |
| 文本输入框 | `TextField` |
| checkbox/switch | `Toggle` |
| click handler | `onPress` |
| CSS 与行为增强 | SwiftUI modifiers |
| `onChange` 后写入 state | `onIsOnChange` 后写入 state |

这些只是帮助理解的近似关系，并非一一等价。Expo UI 操作的是原生 SwiftUI 组件，不存在 DOM、CSS 级联或浏览器表单提交机制。

## 实际开发中的组合方式

一个典型设置页面可以按以下职责拆分：

1. 使用 `Host` 承载 SwiftUI 内容。
2. 使用 `Form` 建立原生表单结构。
3. 使用 `Section` 按业务含义分组。
4. 使用 React state 保存字段状态。
5. 通过 `Toggle`、`TextField` 等控件更新状态。
6. 在按钮的 `onPress` 中执行校验和保存。
7. 根据需要添加背景、滚动或刷新 modifier。
8. 检查目标平台和最低系统版本。

**基于经验建议：**应将网络请求和复杂业务逻辑放在独立函数或业务层中，避免把所有处理直接写进 `onPress`。

## 文档未涉及的内容

当前文档未涉及：

- Android 和 Web 的替代实现
- `TextField` 的完整受控输入 API
- 表单校验规则
- 错误信息展示
- 焦点与键盘管理
- 表单提交状态和重复提交防护
- 数据持久化
- 无障碍配置
- 自动化测试
- 低于 iOS 16 或 tvOS 16 时 `scrollDisabled` 的具体行为

这些内容不能从当前页面直接确定，需要查阅对应组件、modifier 或平台兼容性文档。

## 总结

Expo UI 的 `Form` 是面向 iOS 和 tvOS 的 SwiftUI 原生表单布局容器。它可以通过 `Section` 组织输入控件，并通过 modifiers 调整背景、禁止滚动或增加下拉刷新。

对 React Web 开发者而言，最关键的是不要把它当作 HTML `<form>`：它不会自动提交或管理字段数据。React state、校验、请求和错误处理仍然需要由应用自行实现。同时，使用前必须确认 Expo SDK、目标平台以及最低 Apple 系统版本是否满足要求。

---

## 文档导航

- **上一页**：[divider](./84__divider.md)
- **下一页**：[gauge](./86__gauge.md)
