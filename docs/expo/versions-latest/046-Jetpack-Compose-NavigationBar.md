# 046｜Jetpack Compose NavigationBar

**翻页：**[上一页：Jetpack Compose Modifiers](./045-Jetpack-Compose-Modifiers.md) · [目录](./README.md) · [下一页：Jetpack Compose Progress indicators](./047-Jetpack-Compose-Progress-Indicators.md)

**官方页面：**[Jetpack Compose NavigationBar · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/navigationbar/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 精确文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/navigationbar/)推荐 `~56.0.26`。Latest 示例的 `Host.matchContents` 写成 `{ vertical: true }`；SDK 56 示例用无参数布尔形式。使用项目当前 Expo 版本对应的写法。

## Material 3 底部导航栏

`NavigationBar` 是放在应用底部的一排顶层目的地。每个 `NavigationBarItem` 表示一个可选项，通常由图标和文字标签构成。适合切换首页、搜索、设置这类并列主区域。

先安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 保存选中项

官方示例在 React state 保存当前选中的 tab，并把布尔值传入每个 item 的 `selected` 属性：

```tsx
import { useState } from 'react';
import {
  Host,
  Icon,
  NavigationBar,
  NavigationBarItem,
  Text,
} from '@expo/ui/jetpack-compose';

const HOME_ICON = require('./assets/home.xml');
const SEARCH_ICON = require('./assets/search.xml');
const SETTINGS_ICON = require('./assets/settings.xml');

export default function BasicNavigationBar() {
  const [selectedTab, setSelectedTab] = useState('home');

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <NavigationBar>
        <NavigationBarItem
          selected={selectedTab === 'home'}
          onClick={() => setSelectedTab('home')}>
          <NavigationBarItem.Icon>
            <Icon source={HOME_ICON} />
          </NavigationBarItem.Icon>
          <NavigationBarItem.Label>
            <Text>Home</Text>
          </NavigationBarItem.Label>
        </NavigationBarItem>

        <NavigationBarItem
          selected={selectedTab === 'search'}
          onClick={() => setSelectedTab('search')}>
          <NavigationBarItem.Icon>
            <Icon source={SEARCH_ICON} />
          </NavigationBarItem.Icon>
          <NavigationBarItem.Label>
            <Text>Search</Text>
          </NavigationBarItem.Label>
        </NavigationBarItem>

        <NavigationBarItem
          selected={selectedTab === 'settings'}
          onClick={() => setSelectedTab('settings')}>
          <NavigationBarItem.Icon>
            <Icon source={SETTINGS_ICON} />
          </NavigationBarItem.Icon>
          <NavigationBarItem.Label>
            <Text>Settings</Text>
          </NavigationBarItem.Label>
        </NavigationBarItem>
      </NavigationBar>
    </Host>
  );
}
```

`require()` 指向项目里的图标 XML vector drawable 文件；该资源路径必须真实存在。这个示例只改变选中状态，不会自动执行 Expo Router 或 React Navigation 路由切换；真实 app 通常还会在点击回调中切换屏幕，或将选中项绑定到当前路由。

SDK 56 文档里的 Host 写法是 `matchContents`；如果你的项目仍运行 SDK 56，把上例 Host 开头改为：

```tsx
<Host matchContents style={{ width: '100%' }}>
```

## API

```tsx
import {
  NavigationBar,
  NavigationBarItem,
} from '@expo/ui/jetpack-compose';
```

| 组件 / 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `NavigationBar` | `ReactElement<NavigationBarProps>` | Material 3 底部导航容器。 |
| `NavigationBar.children` | `ReactNode`，可选 | 放入多个 NavigationBarItem。 |
| `NavigationBar.containerColor` | `ColorValue`，默认 `NavigationBarDefaults.containerColor` | 导航栏背景色。 |
| `NavigationBar.contentColor` | `ColorValue`，默认 `contentColorFor(containerColor)` | 栏内内容默认色。 |
| `NavigationBar.modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `NavigationBar.tonalElevation` | `number`，默认 `NavigationBarDefaults.Elevation` | 色调高度，单位 dp。 |
| `NavigationBarItem` | `ReactElement<NavigationBarItemProps>` | 必须用作 NavigationBar 的子项。 |
| `NavigationBarItem.alwaysShowLabel` | `boolean`，默认 `true` | 是否总是显示文字标签。 |
| `NavigationBarItem.children` | `ReactNode`，可选 | 包含 `Icon`、`SelectedIcon`、`Label` 内容槽。 |
| `NavigationBarItem.colors` | `NavigationBarItemColors`，可选 | 设置不同选择 / 禁用状态的颜色。 |
| `NavigationBarItem.enabled` | `boolean`，默认 `true` | 是否允许交互。 |
| `NavigationBarItem.modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `NavigationBarItem.onClick` | `() => void`，可选 | 用户点击回调。 |
| `NavigationBarItem.selected` | `boolean` | 当前是否选中。 |

`NavigationBarItemColors` 可分别设置 `disabledIconColor`、`disabledTextColor`、`selectedIconColor`、`selectedIndicatorColor`、`selectedTextColor`、`unselectedIconColor` 和 `unselectedTextColor`，全部类型为 `ColorValue`。

## 关键名词

- **顶层目的地**：应用主导航里的并列区域，切换时通常不会形成内容之间的父子关系。
- **NavigationBarItem**：导航栏中的单个选项。它的 `selected` 是受控的布尔属性，组件不会替你决定业务状态。
- **受控状态 / Controlled state**：父 React 组件持有 `selectedTab`，点击回调更新 state，然后把新值通过 props 传回原生视图。
- **内容槽 / Slot**：以复合子组件标注的区域。`Icon`、`SelectedIcon`、`Label` 分别声明普通图标、选中态图标和标签。
- **Tonal elevation**：Material 3 表面层级参数，单位 dp；除阴影外还影响表面的主题色调。
- **Expo UI `Icon` 资源**：Android 原生图标常以 XML vector drawable 文件提供；文件必须能被 Metro `require()` 找到。
- **Expo Router / React Navigation**：导航状态管理和屏幕路由库；只变更 `selected` 外观不会自动跳转路由。

## 官方代码主题覆盖

保留官方安装命令、包含 Home / Search / Settings 三项的完整 React state 示例、图标 XML 资源引用与 Compose Icon / Label slots。API 表包含 NavigationBar 和 NavigationBarItem 的全部属性，以及 item 七种状态颜色字段。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Progress indicators](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/)，介绍线性、圆形和波浪样式的进度指示器。

**翻页：**[上一页：Jetpack Compose Modifiers](./045-Jetpack-Compose-Modifiers.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Progress indicators](./047-Jetpack-Compose-Progress-Indicators.md)
