# ListItem：在 Expo 中使用 Jetpack Compose 列表项

`ListItem` 是 `@expo/ui` 提供的 Android UI 组件，用于展示结构化列表条目。它对应 Jetpack Compose Material 3 的官方 `ListItem` API，可以组织标题、辅助说明、上方标签、前置图标和尾部操作等内容。

> **版本提示：**原文档属于“下一个 SDK 版本”的未发布版本文档，修改日期为 **2026 年 5 月 19 日**。文档明确指出，当前稳定版本应查看 **SDK 56** 对应的最新文档。使用本文 API 前，应确认项目采用的 Expo SDK 是否已经支持它。

## 文档解决的问题

这篇文档主要说明：

- 如何安装 `@expo/ui`。
- 如何在 React Native 中渲染 Android 原生 Jetpack Compose `ListItem`。
- 如何通过复合组件填充列表项的不同内容区域。
- 如何给列表项添加点击行为。
- 如何自定义颜色、阴影高度和色调高度。

它适合设置页面、账户菜单、通知选项等需要展示结构化条目的 Android 界面。

该组件只支持 **Android**，并包含在 **Expo Go** 中。当前文档未提供 iOS 对应实现。

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。对 React Web 开发者来说，可以将它理解为 Android 平台上类似 React 的声明式 UI 系统。

这里虽然使用 TSX 编写组件，但最终呈现的是 Compose 原生组件，不是浏览器中的 DOM，也不是 HTML `<li>`。

### Expo UI

`@expo/ui` 是 Expo 提供的 UI 包。本文使用其 Jetpack Compose 入口：

```tsx
import { ListItem } from '@expo/ui/jetpack-compose';
```

导入路径中的 `jetpack-compose` 表明这些组件面向 Android Compose，而不是跨平台通用组件。

### Slot 与复合组件

Compose 的 `ListItem` 将内容划分成多个位置，也就是 slot（插槽）。`@expo/ui` 通过复合组件表达这些插槽：

| 复合组件 | 作用 |
| --- | --- |
| `ListItem.HeadlineContent` | 主要标题，示例中始终提供 |
| `ListItem.OverlineContent` | 标题上方的小标签或分类文字 |
| `ListItem.SupportingContent` | 标题下方的辅助说明 |
| `ListItem.LeadingContent` | 条目前方的内容，通常是图标 |
| `ListItem.TrailingContent` | 条目末尾的内容，例如箭头或状态图标 |

这和 React Web 中通过 `props` 分别传入 `title`、`description`、`icon` 不同：这里将子组件放进 `ListItem`，由组件根据子组件类型识别其位置。

## 安装

根据项目使用的包管理器选择一条命令：

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

`expo install` 会按照项目的 Expo SDK 版本选择兼容的依赖版本。不要同时执行四条命令。

如果是在已有的裸 React Native 工程中安装，还必须先配置 `expo`，使项目能够使用 Expo Modules。本文没有展开裸工程的具体安装步骤。

## 基础用法

最简单的列表项只包含标题：

```tsx
import { Host, ListItem, Text } from '@expo/ui/jetpack-compose';

export default function BasicListItem() {
  return (
    <Host matchContents>
      <ListItem>
        <ListItem.HeadlineContent>
          <Text>Settings</Text>
        </ListItem.HeadlineContent>
      </ListItem>
    </Host>
  );
}
```

示例中的结构包括：

- `Host`：承载 Jetpack Compose 内容。
- `matchContents`：示例中用于让 Host 匹配内部内容尺寸。
- `ListItem`：列表条目的容器。
- `ListItem.HeadlineContent`：声明标题所在的插槽。
- `Text`：Jetpack Compose 体系中的文本组件。

原文档没有进一步说明 `Host` 和 `matchContents` 的完整 API，因此不能仅依据本文推断它们的其他行为。

## 填充完整的列表结构

```tsx
import { Host, ListItem, Icon, Text } from '@expo/ui/jetpack-compose';

export default function ListItemWithSlots() {
  return (
    <Host matchContents>
      <ListItem>
        <ListItem.HeadlineContent>
          <Text>Notifications</Text>
        </ListItem.HeadlineContent>

        <ListItem.OverlineContent>
          <Text>ACCOUNT</Text>
        </ListItem.OverlineContent>

        <ListItem.SupportingContent>
          <Text>Manage notification preferences</Text>
        </ListItem.SupportingContent>

        <ListItem.LeadingContent>
          <Icon source={require('./assets/notifications.xml')} />
        </ListItem.LeadingContent>

        <ListItem.TrailingContent>
          <Icon source={require('./assets/chevron.xml')} />
        </ListItem.TrailingContent>
      </ListItem>
    </Host>
  );
}
```

`notifications.xml` 和 `chevron.xml` 是相对于当前源码文件的本地资源。示例假定它们位于 `./assets/` 目录中，但原文档没有给出 XML 文件的具体格式和创建方法。

与 React Web 的 `<img src="...">` 不同，这里通过 React Native/Expo 的 `require()` 加载打包进应用的静态资源。

## 添加点击行为

`ListItem` 本身通过 `modifiers` 接收交互和布局修饰，其中 `clickable` 用于处理点击：

```tsx
import { Host, ListItem, Text } from '@expo/ui/jetpack-compose';
import { clickable } from '@expo/ui/jetpack-compose/modifiers';

export default function ClickableListItem() {
  return (
    <Host matchContents>
      <ListItem modifiers={[clickable(() => console.log('Tapped!'))]}>
        <ListItem.HeadlineContent>
          <Text>Tap me</Text>
        </ListItem.HeadlineContent>
      </ListItem>
    </Host>
  );
}
```

需要注意两个不同的导入路径：

```tsx
import { ListItem } from '@expo/ui/jetpack-compose';
import { clickable } from '@expo/ui/jetpack-compose/modifiers';
```

`modifiers` 的类型是 `ModifierConfig[]`，因此即使只有一个修饰器，也要通过数组传入。

对 React Web 开发者来说，它不像下面这种 DOM 风格：

```tsx
<ListItem onClick={handleClick} />
```

本文明确展示的点击方式是：

```tsx
<ListItem modifiers={[clickable(handleClick)]} />
```

原文档没有说明键盘操作、无障碍语义、长按、禁用状态以及事件对象，因此不要假设其行为与浏览器 `onClick` 完全一致。

## 自定义标题内容

标题插槽不局限于纯文字，也可以放入可组合的布局：

```tsx
import { Host, ListItem, Text, Row, Icon } from '@expo/ui/jetpack-compose';

export default function ListItemCustomHeadline() {
  return (
    <Host matchContents>
      <ListItem>
        <ListItem.HeadlineContent>
          <Row
            horizontalArrangement={{ spacedBy: 8 }}
            verticalAlignment="center"
          >
            <Text>Premium Feature</Text>
            <Icon source={require('./assets/star.xml')} size={16} />
          </Row>
        </ListItem.HeadlineContent>
      </ListItem>
    </Host>
  );
}
```

这里的 `Row` 类似 Web 中的横向 Flexbox 容器：

- `horizontalArrangement={{ spacedBy: 8 }}`：子元素之间保持 8 单位间距。
- `verticalAlignment="center"`：子元素在垂直方向居中。
- `Icon size={16}`：设置图标尺寸。

以上类比用于帮助理解，并不表示 `Row` 会生成 DOM 或完全遵循 CSS Flexbox 规则。

## `ListItem` API

```tsx
import { ListItem } from '@expo/ui/jetpack-compose';
```

组件类型为 React Element，只支持 Android。

### Props

| 属性 | 类型 | 是否必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 否 | 未说明 | 放置各个 slot 复合组件 |
| `colors` | `ListItemColors` | 否 | 未说明 | 设置列表项各区域的颜色 |
| `modifiers` | `ModifierConfig[]` | 否 | 未说明 | 添加点击等 Compose 修饰行为 |
| `shadowElevation` | `number` | 否 | `ListItemDefaults.Elevation` | 设置阴影高度，单位为 `dp` |
| `tonalElevation` | `number` | 否 | `ListItemDefaults.Elevation` | 设置色调高度，单位为 `dp` |

### `dp` 是什么

`dp` 是 Android 的 density-independent pixel，即密度无关像素。它用于让界面在不同像素密度的 Android 设备上保持接近的物理尺寸。

它不是浏览器 CSS 中的 `px`，虽然数值在部分设备或预览环境中可能看起来相近。

### 两种 elevation

- `shadowElevation` 控制视觉阴影所表达的高度。
- `tonalElevation` 控制 Material 设计中通过颜色变化表达的表面层级。

原文档只给出了二者的用途、类型和默认值，没有说明推荐取值范围或组合规则。

## 颜色配置

`colors` 接收 `ListItemColors`，其设计与 Compose 的 `ListItemDefaults.colors()` 对应。

```tsx
<ListItem
  colors={{
    containerColor: '#FFFFFF',
    contentColor: '#111111',
  }}
>
  {/* slots */}
</ListItem>
```

> 上面的代码仅用于展示 `colors` 的对象结构；原文档没有提供这组具体颜色值。

所有颜色属性均为可选的 `ColorValue`：

| 属性 | 控制区域 |
| --- | --- |
| `containerColor` | 列表项容器背景 |
| `contentColor` | 主要内容 |
| `leadingContentColor` | 前置内容 |
| `overlineContentColor` | 标题上方内容 |
| `supportingContentColor` | 辅助说明内容 |
| `trailingContentColor` | 尾部内容 |

原文 API 表格没有为这些颜色属性提供详细说明。上表中的区域对应关系是根据属性命名和插槽结构得出的，属于**基于文档内容推导**。

文档也没有说明：

- 未传入颜色时的具体颜色值。
- 深色模式下颜色如何变化。
- 子组件自行设置颜色时与 `ListItemColors` 的优先级。
- `contentColor` 是否会影响所有未单独配置的插槽。

## 限制与容易踩坑的地方

### 仅支持 Android

这是本文最重要的平台限制。`ListItem`、其 Props 和 `ListItemColors` 都明确标记为 Android。

如果同一页面还需要运行在 iOS 上，不能直接假定该组件会自动转换成 iOS 原生列表项。跨平台替代方案不在当前文档范围内。

### 文档对应未来 SDK

本文来源是 `unversioned` 文档，即下一个 SDK 版本的文档。项目使用 SDK 56 或更早版本时，实际可用 API 可能与本文不同，应以对应版本文档和项目安装结果为准。

### 交互通过 Modifier 配置

点击处理不是普通 React Web 的 `onClick`，而是通过 `modifiers={[clickable(...)]}` 配置。忘记导入 `clickable`、传错导入路径或没有使用数组，都会导致代码无法按示例工作。

### Slot 必须使用对应复合组件

内容不是通过 `headline`、`supportingText` 等字符串 Props 传入，而是放入对应的 `ListItem.*Content` 子组件中。

当前文档没有说明：

- 每种 slot 是否可以重复出现。
- slot 的排列顺序是否影响渲染。
- headline 是否为运行时必填项。
- 各 slot 对子组件类型是否有限制。

因此应优先遵循示例所展示的“一种 slot 一个子组件”的结构。

### 不要将 Compose API 当作 DOM API

`Row`、`Text`、`Icon` 和 `ListItem` 是 Compose UI 的 React 接口，并不会渲染成 HTML。CSS 类名、DOM 事件和浏览器布局规则不能直接套用。

## 实际开发中的使用方式

一个典型设置列表可以将结构拆分为：

- `HeadlineContent`：设置项名称。
- `SupportingContent`：解释该设置的作用。
- `LeadingContent`：用于快速识别功能的图标。
- `TrailingContent`：箭头、状态图标或其他尾部内容。
- `modifiers`：点击后执行导航或业务操作。

**基于文档内容推导：**可以进一步封装项目自己的业务组件，统一 slot、颜色和点击行为。但封装时仍需保留 Android 平台限制，不能将其误标为通用的 React Native 跨平台组件。

**基于经验建议：**

- 使用前锁定项目 Expo SDK 版本，并查看同版本 API。
- 将 Android 专用组件放在平台专用文件中，例如 `SettingsItem.android.tsx`。
- 通过统一组件封装常用颜色、图标尺寸和间距，避免列表中每一项分别配置。
- 为点击项补充移动端无障碍验证；本文没有覆盖无障碍 API，需查阅对应组件和 Modifier 文档。
- 在真实设备上检查长辅助文字、不同屏幕密度以及深色模式效果。

## 当前文档未涉及的内容

原文档没有说明以下内容：

- iOS 或 Web 实现。
- 列表容器以及大量数据的虚拟化方式。
- 分割线、选中态、禁用态和加载态。
- 无障碍属性和自动化测试方法。
- 各 slot 的完整独立 API。
- Modifier 的组合顺序和更多 Modifier 类型。
- 图标 XML 资源的创建规范。
- 主题、动态颜色及深色模式的详细行为。
- 裸 React Native 工程安装 Expo Modules 的完整步骤。

`ListItem` 只代表一个列表条目。需要渲染大量数据时应使用什么列表组件，当前文档没有给出结论。

## 信息边界总结

### 文档明确说明

- `ListItem` 对应官方 Jetpack Compose Material 3 `ListItem`。
- 组件来自 `@expo/ui/jetpack-compose`。
- 支持 headline、supporting、overline、leading 和 trailing 插槽。
- 可以通过 `clickable` Modifier 处理点击。
- 支持 `colors`、`modifiers`、`shadowElevation` 和 `tonalElevation`。
- elevation 的单位是 `dp`。
- 组件仅支持 Android，并包含在 Expo Go 中。
- 裸 React Native 工程需要安装并配置 `expo`。
- 当前页面属于下一个 SDK 版本，稳定文档指向 SDK 56。

### 基于文档内容推导

- 各 `ListItemColors` 属性分别对应同名内容插槽。
- 该组件适合设置项、账户菜单等结构化列表场景。
- 可以封装业务层列表项组件来统一视觉和交互。
- 跨平台项目需要为非 Android 平台准备其他实现。

---

## 文档导航

- **上一页**：[lazyrow](./48__lazyrow.md)
- **下一页**：[loadingindicator](./50__loadingindicator.md)
