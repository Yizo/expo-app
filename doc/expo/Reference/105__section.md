# Section：在列表与表单中组织相关内容

`Section` 是 `@expo/ui` 提供的 SwiftUI 风格组件，用于在 `List`、`Form` 或 `Picker` 中对相关内容进行分组。

它底层使用 Apple 原生 SwiftUI 的 `Section`，支持：

- iOS
- tvOS
- Expo Go

> 本文对应 **Expo 下一个 SDK 版本**的未发布文档，修改日期为 **2026 年 5 月 19 日**。文档提示：当前稳定版本应参考 SDK 56 的 latest 文档。  
> 因此，在实际项目中使用前，需要确认当前 Expo SDK 是否已包含本文描述的 API。

## 这篇文档解决什么问题

当列表或表单包含多组不同用途的内容时，可以使用 `Section`：

- 为每组内容添加文本标题。
- 使用自定义视图作为页眉或页脚。
- 将表单控件按业务含义分组。
- 在满足平台和样式要求时，让分组可以展开或折叠。

对于 React Web 开发者，可以把它大致理解为一个具有 iOS 原生语义和样式的“内容分组容器”。它类似于：

```tsx
<section>
  <header>...</header>
  <div>...</div>
  <footer>...</footer>
</section>
```

但这只是帮助理解的类比。`Section` 并不生成 HTML，也不由浏览器负责渲染，而是映射到 Apple SwiftUI 的原生 `Section`。

## 阅读前需要理解的概念

### Expo UI 与 SwiftUI

`@expo/ui` 提供可在 React/React Native 代码中使用的原生 UI 组件。

本文使用的导入路径是：

```tsx
import { Section } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表示组件底层对应 Apple 的 SwiftUI，因此本文中的 `Section` 只支持 iOS 和 tvOS，不是跨 Android、iOS 和 Web 通用的 React Native 组件。

### Host

示例使用 `Host` 包裹 SwiftUI 内容：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

从示例可以确认，`Host` 是承载这些 SwiftUI 组件的外层容器。`flex: 1` 让它占用可用空间。

本文没有进一步说明 `Host` 的完整职责、生命周期或其他属性。

### List、Form 与 Picker

`Section` 用于组织以下组件中的内容：

- `List`：列表容器。
- `Form`：表单容器。
- `Picker`：选择器。

它不是用于替代这些组件，而是放在它们内部，为其中的内容建立逻辑分组。

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

这里使用 `expo install`，而不是普通的 `npm install`。它的作用是让 Expo 按当前项目的 Expo SDK 选择兼容的包版本。

如果是在已有的 React Native 原生项目中使用，还必须先安装并配置 `expo`，使项目能够使用 Expo Modules。

> 文档没有提供已有 React Native 项目的具体配置步骤，只给出了相关安装文档入口。

## 基本用法

### 使用文本标题

对于只需要简单文本页眉的分组，使用 `title`：

```tsx
import { Host, List, Section, Text } from '@expo/ui/swift-ui';

export default function BasicSectionExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section title="Settings">
          <Text>General</Text>
          <Text>Privacy</Text>
          <Text>Notifications</Text>
        </Section>
      </List>
    </Host>
  );
}
```

这里：

- `List` 提供列表环境。
- `Section` 将三项内容分为一组。
- `title="Settings"` 生成该组的文本标题。
- `children` 是该分组中的具体内容。

适合设置列表、导航菜单和分类信息等只需要普通标题的场景。

### 使用自定义页眉和页脚

需要图标、组合布局或说明文字时，可以使用 `header` 和 `footer`：

```tsx
<Section
  header={
    <HStack>
      <Image systemName="location.fill" color="blue" size={16} />
      <Text>Location Services</Text>
    </HStack>
  }
  footer={
    <Text>
      Enabling location services allows the app to provide personalized recommendations.
    </Text>
  }>
  <Toggle
    label="Enable Location"
    isOn={locationEnabled}
    onIsOnChange={setLocationEnabled}
  />
</Section>
```

示例中的组件作用如下：

- `HStack`：让子元素沿水平方向排列。
- `Image systemName="location.fill"`：显示 Apple 系统图标。
- `Text`：显示原生文本。
- `Toggle`：原生开关控件。
- `footer`：在分组底部显示补充说明。

最重要的优先级规则是：

> `header` 和 `footer` 只会在没有提供 `title` 时使用。

因此不要同时依赖 `title` 与自定义 `header`、`footer`。如果需要自定义页眉或页脚，应省略 `title`。

文档没有进一步说明同时传入这些属性时是否会发出警告。

## 可折叠分组

传入 `isExpanded` 后，`Section` 会变成可折叠分组：

```tsx
const [favoritesExpanded, setFavoritesExpanded] = useState(false);

<List listStyle="sidebar">
  <Section
    title="Favorites"
    isExpanded={favoritesExpanded}
    onIsExpandedChange={setFavoritesExpanded}>
    <Text>Home</Text>
    <Text>Work</Text>
    <Text>Gym</Text>
  </Section>
</List>
```

### 状态控制流程

该功能采用 React 开发者熟悉的受控组件模式：

1. 使用 `useState` 保存展开状态。
2. 将状态传给 `isExpanded`。
3. 用户触发展开或折叠。
4. `onIsExpandedChange` 接收新的布尔值。
5. 更新 React 状态并重新渲染。

```tsx
const [isExpanded, setIsExpanded] = useState(false);

<Section
  isExpanded={isExpanded}
  onIsExpandedChange={setIsExpanded}>
  {/* 分组内容 */}
</Section>
```

`false` 表示折叠，`true` 表示展开。

### 使用限制

可折叠分组同时受以下条件限制：

- 仅支持 iOS 17.0 及以上版本。
- 仅支持 tvOS 17.0 及以上版本。
- 外层 `List` 必须设置 `listStyle="sidebar"`。
- 可折叠分组不支持 `footer`。

缺少 `sidebar` 样式时，即使提供 `isExpanded`，也不满足文档规定的可用条件。

> 文档没有说明在低版本系统、错误列表样式或同时提供 `footer` 时的具体表现，例如编译失败、运行时警告或静默忽略。

## 在表单中使用多个 Section

`Section` 可以在 `Form` 中将控件划分为不同业务区域：

```tsx
<Form>
  <Section title="Appearance">
    <Toggle
      label="Dark Mode"
      isOn={darkMode}
      onIsOnChange={setDarkMode}
    />

    <Picker
      label="Language"
      selection={language}
      onSelectionChange={setLanguage}
      modifiers={[pickerStyle('menu')]}>
      {languages.map((lang, index) => (
        <Text key={index} modifiers={[tag(index)]}>
          {lang}
        </Text>
      ))}
    </Picker>
  </Section>

  <Section title="Notifications">
    <Toggle
      label="Push Notifications"
      isOn={notifications}
      onIsOnChange={setNotifications}
    />
  </Section>

  <Section title="Account">
    <Button
      label="Sign Out"
      role="destructive"
      onPress={() => alert('Signed out')}
    />
  </Section>
</Form>
```

这个示例将表单分成：

- 外观设置
- 通知设置
- 账户操作

`Section` 只负责组织和呈现分组。各个控件的值仍由 React 状态管理。

示例还展示了两个 modifier：

```tsx
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
```

- `pickerStyle('menu')`：将 `Picker` 设置为菜单样式。
- `tag(index)`：为选项关联选择值。

这些 modifier 不是 `Section` 自身的 API。本文只在示例中使用它们，没有提供完整说明。

## API 说明

### 导入

```tsx
import { Section } from '@expo/ui/swift-ui';
```

### `children`

```ts
React.ReactNode
```

分组内的内容。

示例中使用了 `Text`、`Toggle`、`Picker` 和 `Button` 等 SwiftUI 组件。

### `title`

```ts
string | undefined
```

为分组设置简单的文本标题。

如果需要自定义页眉或页脚，不应提供 `title`。

### `header`

```ts
React.ReactNode | undefined
```

设置自定义页眉，可以传入由多个 SwiftUI 组件构成的视图。

### `footer`

```ts
React.ReactNode | undefined
```

设置自定义页脚，通常用于说明、提示或补充信息。

可折叠 `Section` 不支持页脚。

### `isExpanded`

```ts
boolean | undefined
```

控制分组是否展开。传入该属性后，分组会成为可折叠分组。

使用条件：

- iOS 17.0+
- tvOS 17.0+
- `List` 使用 `sidebar` 样式

### `onIsExpandedChange`

```ts
(isExpanded: boolean) => void
```

当展开状态发生变化时触发。一般与 `isExpanded` 和 React state 配合使用。

该回调同样只适用于 iOS 17.0+ 和 tvOS 17.0+。

### 继承属性

`SectionProps` 还继承：

```text
CommonViewModifierProps
```

这意味着它可以接收 Expo UI SwiftUI 的通用视图 modifier 属性。

当前文档没有列出这些继承属性的具体内容，需要参考单独的 modifiers 文档。

## React Web 开发者最容易误解的地方

### 它不是 HTML `section`

虽然名称和用途相似，但它不会生成 DOM：

- 不能使用 CSS 选择器定位。
- 不能使用浏览器开发者工具检查 DOM。
- 不适用 HTML 的语义化、ARIA 和默认布局规则。
- 样式及行为由 SwiftUI 和目标系统决定。

### 它不是通用跨平台组件

文档只声明支持 iOS 和 tvOS。不要因为代码使用 TSX，就认为同一组件可以直接用于 Android 或 Web。

如果产品还要支持 Android，需要另外设计对应界面或平台分支。文档没有规定 Android 替代方案。

### `header`、`footer` 不是回调函数

React Web 组件库有时会设计 `renderHeader` 之类的渲染函数。这里的 `header` 和 `footer` 类型是 `React.ReactNode`，应直接传 JSX：

```tsx
header={<Text>Header</Text>}
```

而不是：

```tsx
header={() => <Text>Header</Text>}
```

### 折叠能力不是只由 React 状态决定

`useState` 只负责保存状态。真正启用折叠功能还需要：

- 系统版本满足要求。
- `List` 使用 `sidebar` 样式。
- 不使用不受支持的页脚。

这与 Web 中仅通过状态控制 `display` 或条件渲染不同，它受到原生平台 API 的能力约束。

## 实际开发建议

以下内容属于**基于文档内容推导**：

1. 简单分组优先使用 `title`，只有需要图标、复杂布局或说明文字时再使用 `header`、`footer`。
2. 将 `isExpanded` 与 `onIsExpandedChange` 配对使用，避免 UI 状态与 React 状态不一致。
3. 使用可折叠分组前，应明确应用的最低系统版本，并验证 `sidebar` 列表样式是否符合产品设计。
4. 同时支持 Android 时，应将 `Section` 视为 Apple 平台实现，而不是共享 UI 的唯一实现。
5. 表单应按用户任务或业务含义分组，例如“外观”“通知”“账户”，而不是仅按代码组件类型分组。

以下属于**基于经验建议**：

- 在 iOS 17、较新 iOS 版本及 tvOS 真机或模拟器上分别测试可折叠行为。
- 使用当前项目实际安装的 `@expo/ui` 类型定义核对属性，因为本文描述的是下一个 SDK 版本。
- 如果页面依赖平台分支，应测试 Android 或 Web 构建，确认不会加载仅支持 SwiftUI 的组件。
- 不要只验证折叠状态变化，还应检查标题、点击区域和系统原生样式是否符合交互预期。

## 当前文档未涉及的内容

本文没有说明：

- Android 或 Web 的替代组件。
- `Section` 的无障碍属性和屏幕阅读器行为。
- 动画是否可配置。
- 自定义折叠图标或折叠动画的方法。
- iOS 17 以下系统使用折叠属性时的具体表现。
- `title` 与 `header`、`footer` 同时传入时是否产生警告。
- 可折叠分组使用 `footer` 时的具体错误表现。
- `CommonViewModifierProps` 包含哪些属性。
- `Host`、`List`、`Form` 和 `Picker` 的完整 API。
- 性能、嵌套 `Section` 或动态增删分组方面的限制。

## 总结

`Section` 是 Expo UI 对 Apple SwiftUI `Section` 的 React 封装，主要用于在 `List`、`Form` 或 `Picker` 中组织相关内容。

使用时需要记住三个关键规则：

1. 简单标题使用 `title`；自定义页眉或页脚时不要提供 `title`。
2. 传入 `isExpanded` 可以启用受控折叠，但要求 iOS/tvOS 17+ 和 `sidebar` 列表样式。
3. 可折叠分组不支持 `footer`，并且整个组件仅面向 iOS 和 tvOS。

---

## 文档导航

- **上一页**：[scrollview](./104__scrollview.md)
- **下一页**：[securefield](./106__securefield.md)
