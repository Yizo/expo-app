# 052｜Jetpack Compose SearchBar

**翻页：**[上一页：Jetpack Compose Row](./051-Jetpack-Compose-Row.md) · [目录](./README.md) · [下一页：Jetpack Compose SegmentedButton](./053-Jetpack-Compose-SegmentedButton.md)

**官方页面：**[Jetpack Compose SearchBar · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/searchbar/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.12`；[SDK 56 reference](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/searchbar/)推荐 `~56.0.26`。SDK 56 文档的 `modifiers` 类型是旧 `ExpoModifier[]`，Latest 已使用 `ModifierConfig[]`；升级项目时以对应版本 API 为准。

## Android 原生搜索输入

Expo UI 的 `SearchBar` 对应 Android Jetpack Compose 搜索控件，包含文本输入、提交搜索和占位提示。Latest API 还定义了展开全屏搜索的内容槽组件。

安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 监听搜索提交

使用 `onSearch` 接收用户提交的搜索文本：

```tsx
import { useState } from 'react';
import { Host, SearchBar } from '@expo/ui/jetpack-compose';

export default function BasicSearchBarExample() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <SearchBar onSearch={searchText => setQuery(searchText)} />
    </Host>
  );
}
```

以上示例把提交值放入 `query` state；真实应用可以用这个值发起搜索或更新结果列表。官方说明是 onSearch 在提交搜索文本时触发；不要把它误认为每次键入字符都会触发的文本变化回调。

## 显示占位提示

通过 `SearchBar.Placeholder` 内容槽显示输入框为空时的提示：

```tsx
import { useState } from 'react';
import { Host, SearchBar, Text } from '@expo/ui/jetpack-compose';

export default function SearchBarPlaceholderExample() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <SearchBar onSearch={searchText => setQuery(searchText)}>
        <SearchBar.Placeholder>
          <Text>Search items...</Text>
        </SearchBar.Placeholder>
      </SearchBar>
    </Host>
  );
}
```

## API

```tsx
import { SearchBar } from '@expo/ui/jetpack-compose';
```

| API | 类型 / 说明 |
| --- | --- |
| `SearchBar` | 接收 `SearchBarProps` 并渲染原生搜索栏。 |
| `SearchBar.children` | `ReactNode`，可选。用于挂载搜索栏子槽。 |
| `SearchBar.modifiers` | Latest 为 `ModifierConfig[]`，可选。SDK 56 页列为 `ExpoModifier[]`。 |
| `SearchBar.onSearch` | `(searchText: string) => void`，可选。用户提交搜索内容时回调。 |
| `SearchBar.Placeholder` / `SearchBarPlaceholder` | 占位槽组件，将 children 放到搜索栏 placeholder 位置。 |
| `ExpandedFullScreenSearchBar` | 组件内容标记：将 children 渲染到展开后的全屏搜索界面。 |

官方页面没有提供 ExpandedFullScreenSearchBar 的用法代码或属性清单，仅说明它标记 full-screen expanded search 的 children。

## 关键名词

- **SearchBar**：Material 3 风格搜索入口，展示搜索输入区域；Android 上由 Jetpack Compose 渲染。
- **搜索提交 / Submit**：用户确认本次搜索时发出的动作。示例用 `onSearch(searchText)` 处理提交。
- **占位符 / Placeholder**：字段为空时出现的提示，不是实际输入值；通过专用内容槽插入文字。
- **全屏展开搜索**：搜索 UI 展开到全屏时显示的搜索内容区域；`ExpandedFullScreenSearchBar` 是该内容的标记组件。
- **槽 / Slot**：由父组件命名、供子组件填充的区域。本页的 Placeholder 子组件指定了提示文字的位置。
- **受控状态 / State**：示例使用 `useState` 保存已提交查询，父 React 组件负责后续搜索业务。
- **Modifier API 版本差异**：Expo SDK 56 暴露 `ExpoModifier[]`，Latest 文档改用 `ModifierConfig[]`；两者均用于 Compose 布局和外观修饰，应按安装版本编写。

## 官方代码主题覆盖

保留安装命令和两个官方示例：`onSearch` 提交回调及 SearchBar.Placeholder 文本槽。API 摘要覆盖 SearchBar、ExpandedFullScreenSearchBar、SearchBarPlaceholder、children、modifiers、onSearch，并标记 SDK 56 / Latest modifier 类型变化。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose SegmentedButton](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/segmentedbutton/)，介绍一组选项中单选或多选的分段按钮。

**翻页：**[上一页：Jetpack Compose Row](./051-Jetpack-Compose-Row.md) · [返回目录](./README.md) · [下一页：Jetpack Compose SegmentedButton](./053-Jetpack-Compose-SegmentedButton.md)
