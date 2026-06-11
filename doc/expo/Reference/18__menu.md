# Expo UI Menu：跨 iOS 与 Android 的原生菜单组件

## 文档解决的问题

`MenuView` 用于在 React Native / Expo 应用中实现原生弹出菜单，并提供与 `@react-native-menu/menu` 基本兼容的 API。

它支持：

- 单击触发菜单，默认行为。
- 长按触发上下文菜单。
- 菜单图标。
- 子菜单与分组。
- 可勾选菜单项。
- 禁用、隐藏和危险操作样式。
- 从 `@react-native-menu/menu` 迁移。

支持平台：

- Android
- iOS
- Expo Go

Web 并不具备完整功能：触发器会正常渲染，但菜单操作不会执行，并且控制台会输出一次警告。

## 适用场景

适合用于以下移动端交互：

- 文件列表中的“重命名、排序、分享”等操作。
- 卡片或列表项的长按上下文菜单。
- 页面右上角的“更多操作”菜单。
- 带勾选状态的筛选或设置菜单。
- 将现有 `@react-native-menu/menu` 代码迁移到 Expo UI。

如果需要精细控制菜单的原生行为，文档建议直接使用底层组件：

- Android：Jetpack Compose `DropdownMenu`
- iOS 单击菜单：SwiftUI `Menu`
- iOS 长按菜单：SwiftUI `ContextMenu`

## 阅读前需要理解的背景知识

### `@expo/ui`

`@expo/ui` 是 Expo 提供的 UI 组件包。这里的 `MenuView` 不是用 JavaScript 模拟出来的网页式下拉菜单，而是对 Android 和 iOS 原生菜单组件的封装。

这意味着：

- 两个平台的菜单外观会遵循各自系统风格。
- 两个平台的能力并不完全一致。
- 某些属性或回调只能在一个平台工作。

对于 React Web 开发者，可以将它理解为一个统一的 React API，底层分别调用两套不同的系统组件，而不是统一渲染一份 DOM。

### 触发器 `children`

`MenuView` 本身负责菜单逻辑，其 `children` 是用户实际点击或长按的触发区域，例如：

```tsx
<MenuView actions={actions}>
  <Pressable>
    <Text>Open menu</Text>
  </Pressable>
</MenuView>
```

`Pressable` 类似 Web 中可响应点击、按下和长按的交互容器，但它不是 HTML `button`。

### 原生事件结构

选中菜单项时，不是直接向回调传递菜单项对象，而是通过以下结构返回标识符：

```tsx
event.nativeEvent.event
```

这里的第二个 `event` 是菜单项的 `id`；如果没有设置 `id`，则默认使用菜单项的 `title`。

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

`expo install` 与普通的 `npm install` 类似，但 Expo 会帮助选择与当前 Expo SDK 兼容的依赖版本。

如果是已有的原生 React Native 项目，而不是标准 Expo 项目，需要先按照 Expo Modules 的安装流程将 `expo` 安装到项目中。

## 基本用法

```tsx
import { Icon } from '@expo/ui';
import { MenuView } from '@expo/ui/community/menu';
import { Pressable, Text } from 'react-native';

const editIcon = Icon.select({
  ios: 'pencil',
  android: import('@expo/material-symbols/edit.xml'),
});

const deleteIcon = Icon.select({
  ios: 'trash',
  android: import('@expo/material-symbols/delete.xml'),
});

export default function MenuExample() {
  return (
    <MenuView
      actions={[
        { id: 'edit', title: 'Edit', image: editIcon },
        {
          id: 'delete',
          title: 'Delete',
          image: deleteIcon,
          attributes: { destructive: true },
        },
      ]}
      onPressAction={event => {
        console.log(event.nativeEvent.event);
      }}>
      <Pressable>
        <Text>Open menu</Text>
      </Pressable>
    </MenuView>
  );
}
```

核心组成：

- `actions`：定义菜单项。
- `id`：菜单项的稳定标识。
- `title`：用户看到的文字。
- `image`：平台对应的图标。
- `attributes.destructive`：将删除等危险操作显示为破坏性操作。
- `onPressAction`：处理菜单项选择。
- `children`：菜单的触发区域。

## 跨平台图标

菜单图标是这套 API 中最容易产生平台差异的部分。

### iOS

iOS 菜单只接受 SF Symbols 名称，例如：

```tsx
image: 'trash'
```

SF Symbols 是 Apple 提供的系统图标集合。

### Android

Android 需要传入 React Native 的 `ImageSourcePropType`，例如 XML 图标资源：

```tsx
image: require('@expo/material-symbols/delete.xml')
```

文档示例使用动态导入：

```tsx
image: import('@expo/material-symbols/delete.xml')
```

### 使用 `Icon.select`

推荐通过 `Icon.select` 在同一处声明平台图标：

```tsx
const deleteIcon = Icon.select({
  ios: 'trash',
  android: import('@expo/material-symbols/delete.xml'),
});
```

未被当前平台使用的图标分支可以在构建时被移除。

需要注意：

- SF Symbol 字符串只会在 iOS 渲染。
- `ImageSourcePropType` 只会在 Android 渲染。
- 给错平台的图标类型不会自动转换，只会被忽略。
- `imageColor` 在 Android 会作为图标 tint 生效；iOS 系统菜单可能忽略单个菜单项的颜色设置。

## 长按上下文菜单

设置 `shouldOpenOnLongPress` 后，触发方式会从单击变为长按：

```tsx
<MenuView
  shouldOpenOnLongPress
  actions={[
    { id: 'copy', title: 'Copy' },
    { id: 'share', title: 'Share' },
  ]}
  onPressAction={event => {
    console.log(event.nativeEvent.event);
  }}>
  <Pressable>
    <Text>Long-press me</Text>
  </Pressable>
</MenuView>
```

平台实现存在差异：

- Android 仍使用受控的 `DropdownMenu`，但由 `onLongPress` 打开。
- iOS 改用 SwiftUI `ContextMenu`，并将触发内容显示为模糊预览。

对 React Web 开发者来说，长按不是右键菜单的简单同义词。它是移动设备上的触摸手势，iOS 还会提供系统管理的预览效果。

## 子菜单与内联分组

### 子菜单

给菜单项添加 `subactions`，默认会创建嵌套子菜单：

```tsx
{
  id: 'sort',
  title: 'Sort by',
  subactions: [
    { id: 'sort-name', title: 'Name' },
    { id: 'sort-date', title: 'Date' },
    { id: 'sort-size', title: 'Size' },
  ],
}
```

### 内联分组

在包含 `subactions` 的父项上添加 `displayInline: true`：

```tsx
{
  id: 'share-section',
  title: 'Share',
  displayInline: true,
  subactions: [
    { id: 'share-airdrop', title: 'AirDrop' },
    { id: 'share-message', title: 'Message' },
  ],
}
```

此时子项不会作为嵌套菜单打开，而是直接显示在当前菜单中。

平台表现：

- iOS：父项的 `title` 会显示为分组标题。
- Android：只显示分隔线，不显示分组标题，因为 Material `DropdownMenu` 没有对应的 section 能力。

因此，不应依赖分组标题传递 Android 用户必须看到的信息。

## 带勾选状态的菜单项

菜单项的 `state` 可以是：

- `'on'`：显示勾选标记。
- `'off'`：不显示勾选标记。

```tsx
const [pinned, setPinned] = useState(false);

<MenuView
  actions={[
    {
      id: 'pin',
      title: 'Pin to top',
      state: pinned ? 'on' : 'off',
    },
  ]}
  onPressAction={event => {
    if (event.nativeEvent.event === 'pin') {
      setPinned(current => !current);
    }
  }}>
  <Pressable>
    <Text>{pinned ? 'Pinned' : 'Not pinned'}</Text>
  </Pressable>
</MenuView>
```

`MenuView` 不会自动修改状态。用户选择菜单项后，它只触发 `onPressAction`，调用方需要更新 React state，再将新的 `state` 传回组件。

这与 React Web 的受控组件模式相同：菜单展示状态由业务组件持有。

`state: 'mixed'` 不受支持。

## `MenuView` 属性

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `actions` | Android、iOS | 定义菜单项树。 |
| `children` | Android、iOS | 可选的菜单触发视图。 |
| `onPressAction` | Android、iOS | 菜单项被选中时调用。 |
| `shouldOpenOnLongPress` | Android、iOS | 是否改为长按触发，默认为 `false`。 |
| `style` | Android、iOS | 应用于触发器外层包装视图。 |
| `testID` | Android、iOS | 传递给触发视图的测试标识。 |
| `title` | 仅 iOS | 显示在菜单顶部的标题。 |
| `onOpenMenu` | 仅 Android | 菜单打开时调用。 |
| `onCloseMenu` | 仅 Android | 菜单关闭或操作执行后调用。 |

iOS 的 SwiftUI `Menu` 和 `ContextMenu` 没有可供该封装转发的打开、关闭钩子，因此 `onOpenMenu` 和 `onCloseMenu` 不会在 iOS 执行。

## `MenuAction` 菜单项配置

| 属性 | 作用与限制 |
| --- | --- |
| `title` | 必填，菜单项显示文字。 |
| `id` | 可选，选择后通过 `nativeEvent.event` 返回；省略时使用 `title`。 |
| `image` | 菜单图标；iOS 使用 SF Symbol，Android 使用 `ImageSourcePropType`。 |
| `imageColor` | 图标颜色；Android 生效，iOS 系统菜单可能忽略。 |
| `titleColor` | 菜单文字颜色，仅 Android 支持。 |
| `attributes` | 配置危险、禁用或隐藏状态。 |
| `state` | `'on'` 显示勾选，`'off'` 不显示。 |
| `subactions` | 定义嵌套菜单项。 |
| `displayInline` | 将 `subactions` 作为当前菜单中的内联分组显示。 |

### `attributes`

```ts
type MenuAttributes = {
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
};
```

含义如下：

- `destructive`：使用危险操作样式，通常表现为红色文字或图标。
- `disabled`：显示菜单项，但不允许用户执行。
- `hidden`：完全隐藏菜单项。

## 编程式打开菜单

可以通过 `ref` 获取 `MenuView` 的命令式句柄：

```tsx
menuRef.current?.show();
```

但是 `show()` 只有 Android 支持：

- Android：以编程方式打开锚定的 `DropdownMenu`。
- iOS：调用不会产生效果，开发环境会输出一次 `console.warn`。

原因是 SwiftUI 的 `Menu` 和 `ContextMenu` 没有编程式打开 API。

因此，不能设计一个必须依靠 `ref.show()` 才能使用的跨平台流程。

## 从 `@react-native-menu/menu` 迁移

### 修改导入路径

迁移前：

```tsx
import { MenuView } from '@react-native-menu/menu';
```

迁移后：

```tsx
import { MenuView } from '@expo/ui/community/menu';
```

### Android 图标资源不兼容

原来的 `@react-native-menu/menu` 允许传入 drawable 资源名称：

```tsx
image: 'ic_menu_add'
```

它会从以下原生 Android 目录中解析资源：

```text
android/app/src/main/res/drawable/
```

Expo UI 的替代组件不会解析这种字符串资源名称。Android 必须改为传入 `ImageSourcePropType`，例如：

```tsx
image: require('@expo/material-symbols/edit.xml')
```

字符串仍可以在 iOS 上作为 SF Symbol 名称使用。

### 触发器事件会被 Android 外层组件接管

在 Android 上，`MenuView` 会用自己的 `Pressable` 包裹触发器并接管手势。

因此，以下内部处理函数不会执行：

```tsx
<MenuView actions={actions}>
  <Pressable onPress={handlePress} onLongPress={handleLongPress}>
    <Text>Open</Text>
  </Pressable>
</MenuView>
```

可选处理方式：

- 将相关逻辑移动到 `onPressAction` 的菜单项分支中。
- 如果触发器必须同时保留独立的单击和长按操作，直接使用底层 Android `DropdownMenu`。

### 不支持的上游属性

以下来自 `@react-native-menu/menu` 的属性不受支持：

- `themeVariant`
- `hitSlop`
- `isAnchoredToRight`
- `subtitle`
- `keepsMenuPresented`
- `preferredElementSize`
- `state: 'mixed'`

迁移时不能只修改 import，还需要搜索并处理这些属性。

## 注意事项与限制

### 平台能力并不对称

统一 API 不代表行为完全一致：

- `title` 只有 iOS 显示。
- 内联分组标题只有 iOS 显示。
- `titleColor` 只有 Android 支持。
- `onOpenMenu` 和 `onCloseMenu` 只有 Android执行。
- `ref.show()` 只有 Android有效。
- `imageColor` 在 iOS 可能被系统菜单忽略。
- Android 和 iOS 使用不同的图标来源。

### Web 不受完整支持

Web 上只会渲染触发内容，菜单操作不会执行，并输出一次警告。

因此，这不是 React Web 菜单组件，不能作为 Expo Web 的跨平台菜单方案使用。

### `id` 最好显式设置

文档明确说明，省略 `id` 时会使用 `title`。

**基于文档内容推导：** 如果将 `title` 用作文案并进行国际化，切换语言后事件值也会发生变化。因此业务逻辑更适合依赖稳定的 `id`，而不是依赖显示文字。

### 菜单状态由调用方维护

`state` 只描述当前显示状态，不会因点击而自动在 `'on'` 和 `'off'` 之间切换。业务组件必须在 `onPressAction` 中更新状态。

### 系统菜单样式不完全可控

iOS 菜单由系统 UI 绘制，可能忽略单个菜单项的颜色修饰。不要将颜色作为表达状态或业务含义的唯一方式。

## React Web 开发者最容易误解的地方

1. **它不是 DOM 弹层。**  
   菜单由 Android Compose 或 iOS SwiftUI 原生组件渲染，不能按照网页 `div`、Portal 或 CSS 下拉菜单的思路理解。

2. **同一属性可能只在一个平台有效。**  
   React Native API 可以接受某个属性，不代表两个平台都会展示相同结果。

3. **内部 `Pressable` 的事件不一定执行。**  
   Android 上外层 `MenuView` 会接管触发手势，这与 Web 中事件自然冒泡到内部处理器的预期不同。

4. **图标不是一套资源走遍所有平台。**  
   iOS 依赖 SF Symbols，Android 依赖图片或 XML 资源，需要显式提供平台分支。

5. **`ref.show()` 不是可靠的跨平台能力。**  
   它在 iOS 上是无操作，不能把它当作类似 Web 中调用弹层 `open()` 的通用方案。

6. **菜单开关状态不会自动维护。**  
   勾选项仍然遵循 React 受控状态模式，需要业务代码更新。

## 实际开发建议

以下属于**基于经验建议**：

- 为每个菜单项设置稳定、与显示文案无关的 `id`。
- 将菜单动作集中在一个 `onPressAction` 分发函数中。
- 为 Android 和 iOS 分别验证图标、分组、颜色和触发行为。
- 不要让核心流程依赖 `onOpenMenu`、`onCloseMenu` 或 `ref.show()`，除非产品明确只支持 Android。
- 删除等不可逆操作使用 `destructive`，但仍应根据风险考虑二次确认。
- 迁移前全局搜索不支持的属性以及 Android drawable 字符串。
- 如果项目同时运行在 Web，单独提供 Web 菜单实现或平台分支。

一个较稳定的事件处理方式如下：

```tsx
onPressAction={event => {
  switch (event.nativeEvent.event) {
    case 'edit':
      handleEdit();
      break;
    case 'delete':
      handleDelete();
      break;
  }
}}
```

## 文档未涉及的内容

当前文档未涉及：

- 菜单动画的自定义。
- 菜单位置、尺寸和偏移量的详细控制。
- 键盘操作与无障碍行为的具体说明。
- 自动化测试示例。
- 大量菜单项的性能表现。
- Expo Web 的替代实现。
- Android 和 iOS 原生工程的手动配置步骤。
- `@expo/material-symbols` 的单独安装要求。
- 菜单项选中后是否可以阻止菜单关闭。
- 不同系统版本之间的兼容差异。

这些内容不能仅根据当前文档确定。

## 明确说明与推导结论

### 文档明确说明

- `MenuView` 兼容 `@react-native-menu/menu` 的主要 API。
- 默认单击打开，设置 `shouldOpenOnLongPress` 后长按打开。
- Android 和 iOS 使用不同的原生菜单组件。
- Web 只渲染触发器，菜单动作不会执行。
- 菜单图标的类型和支持情况因平台而异。
- `onOpenMenu`、`onCloseMenu` 和 `ref.show()` 仅在 Android 有效。
- 内联分组在 Android 只显示分隔线。
- 勾选状态需要调用方自行更新。
- 部分上游属性不受支持。

### 基于文档内容推导

- 业务逻辑应依赖稳定的 `id`，避免使用可能变化或被翻译的 `title`。
- 跨平台产品不应依赖仅 Android 可用的生命周期回调和命令式打开能力。
- 重要信息不能只放在 iOS 的菜单标题、分组标题或颜色中。
- 如果触发器需要菜单之外的独立手势逻辑，`MenuView` 的高层封装可能不够，需要使用底层原生组件。

## 总结

`MenuView` 为 Expo 应用提供了接近 `@react-native-menu/menu` 的跨平台菜单 API，适合实现单击菜单、长按上下文菜单、子菜单、分组和勾选操作。

它最大的开发重点不是 API 写法，而是平台差异：Android 与 iOS 使用不同的原生实现，在图标、标题、颜色、生命周期回调、手势接管和编程式打开方面并不对等。实际开发中应以 Android 和 iOS 的共同能力设计核心流程，再将平台专属能力作为渐进增强。

---

## 文档导航

- **上一页**：[maskedview](./17__maskedview.md)
- **下一页**：[pagerview](./19__pagerview.md)
