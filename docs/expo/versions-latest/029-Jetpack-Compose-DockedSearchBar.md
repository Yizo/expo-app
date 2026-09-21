# 029｜Jetpack Compose DockedSearchBar

**翻页：**[上一页：Jetpack Compose Divider](./028-Jetpack-Compose-Divider.md) · [目录](./README.md) · [下一页：Jetpack Compose DropdownMenu](./030-Jetpack-Compose-DropdownMenu.md)

**官方页面：**[Jetpack Compose DockedSearchBar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dockedsearchbar/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.15；SDK v56 精确 reference [DockedSearchBar](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/dockedsearchbar/) 推荐 ~56.0.26。此为 Android Jetpack Compose 控件，可在 Expo Go 里预览。

## Docked Search Bar 是什么

DockedSearchBar 是停留在当前布局里的搜索输入框；用户输入时不会像全屏搜索页那样遮住整个界面。Expo UI 将输入字符串通过 onQueryChange 回调交给 React 侧的 state。

## 最简搜索栏

```tsx
import { useState } from 'react';
import { DockedSearchBar, Host } from '@expo/ui/jetpack-compose';

export default function InlineSearch() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <DockedSearchBar onQueryChange={setQuery} />
    </Host>
  );
}
```

query state 需要时可用于筛选列表、发起搜索或显示加载状态；本控件只负责收集并回传输入，不会自动调用 API。

## 添加 Placeholder 与 Leading Icon

children slots 可修改搜索栏外观。Placeholder 放提示文本，LeadingIcon 放左侧图标或 symbol：

```tsx
import { useState } from 'react';
import {
  DockedSearchBar,
  Host,
  Text,
} from '@expo/ui/jetpack-compose';

export function SearchWithPlaceholder() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <DockedSearchBar onQueryChange={setQuery}>
        <DockedSearchBar.Placeholder>
          <Text>搜索项目…</Text>
        </DockedSearchBar.Placeholder>
        <DockedSearchBar.LeadingIcon>
          <Text>🔍</Text>
        </DockedSearchBar.LeadingIcon>
      </DockedSearchBar>
    </Host>
  );
}
```

## API

| API | 说明 |
| --- | --- |
| DockedSearchBar | Android 内嵌式 Compose 搜索输入框。 |
| children | 可传 Placeholder / LeadingIcon 等专用 slots。 |
| modifiers | Compose ModifierConfig[]，用于布局与绘制修饰。 |
| onQueryChange | 查询文本改变时调用，回调参数是 string。 |
| DockedSearchBarPlaceholder | 搜索栏内的提示内容容器。 |
| DockedSearchBarLeadingIcon | 搜索栏左侧图标容器。 |

## 关键名词

- **Docked**：搜索控件锚定在当前页面布局中，不自动切成全屏搜索页。
- **Query**：用户输入的查询字符串。
- **Placeholder**：输入为空时出现的提示文字。
- **LeadingIcon**：输入框开头位置的图标内容。
- **Slot component**：嵌入到原生 Compose 控件特定区域的专用子组件。
- **onQueryChange**：每次搜索字符串改变时，将最新值交回 JavaScript 层的回调。

## 官方代码主题覆盖

源页代码主题均已重写：四种包管理器安装 @expo/ui、已有 React Native app 的 Expo 前置条件、React useState 与 onQueryChange、DockedSearchBar.Placeholder 与 LeadingIcon slots。API 的 children、modifiers、onQueryChange 和两个 slot component 均有说明。

## 下一页

官方页脚 **Next** 指向 [Jetpack Compose DropdownMenu](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dropdownmenu/)，介绍点击或长按触发的下拉菜单。

**翻页：**[上一页：Jetpack Compose Divider](./028-Jetpack-Compose-Divider.md) · [返回目录](./README.md) · [下一页：Jetpack Compose DropdownMenu](./030-Jetpack-Compose-DropdownMenu.md)
