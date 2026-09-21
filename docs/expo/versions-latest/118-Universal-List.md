# 118｜Expo UI Universal List

**翻页：**[上一页：Universal Icon](./117-Universal-Icon.md) · [目录](./README.md) · [下一页：Universal Picker](./119-Universal-Picker.md)

**官方 Latest 页面：**[List](https://docs.expo.dev/versions/latest/sdk/ui/universal/list/)

**SDK 56 对照：**[SDK v56.0.0 List](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/list/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；SDK v56.0.0 参考推荐 `~56.0.26`。基础 List / ListItem / pull-to-refresh 示例在两版都存在；Latest 的 `ListItem.modifiers` 是 v56 页面没有列出的 API，别在本地 SDK56 默认使用。

## List 是什么

`List` 提供平台风格的纵向行容器，适合 Settings 类设置项、信息列表、用户资料 / 菜单行。它提供原生分隔线、inset 风格和 pull-to-refresh；配套 `ListItem` 提供可点击 row、headline、leading / trailing、supporting text 等内容槽。

底层渲染随平台变化：Android 用 Jetpack Compose `LazyColumn`；iOS 用 SwiftUI `List`；Web 用带 overflow scroll 的 React Native `View`。

> **新手注意：**即使 Android 底层叫 `LazyColumn`，目前这个 React 包装仍会在 mount 时创建所有 React rows，还没有 React 级惰性渲染。大量数据不要把它当成 `FlatList`；考虑 Shopify `FlashList` 或 Legend List 等虚拟化列表。

## 安装

通过 Expo 安装当前 SDK 对应版本的 `@expo/ui`：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

已有 React Native 工程还需要先安装 Expo `expo` package。SDK56 项目使用与 Expo 56 匹配的 `@expo/ui ~56.0.26`，不要直接固定 Latest ~57.0.19。

## 基本 List 与选中状态

`ListItem` 的 `children` 默认作为主标题；点击 row 可以更新 React state。把 List 放在 `Host` 中，外层应用需要可滚动占满屏幕时给 Host `flex: 1`：

```tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, List, ListItem, Text } from '@expo/ui';

const ITEMS = [
  { id: 1, name: 'Avocado toast' },
  { id: 2, name: 'Bagel with cream cheese' },
  { id: 3, name: 'Cappuccino' },
];

export default function BreakfastList() {
  const [selected, setSelected] = useState<string | null>(null);
  const dark = useColorScheme() === 'dark';

  return (
    <Host style={{ flex: 1 }}>
      <List>
        {ITEMS.map(item => (
          <ListItem key={item.id} onPress={() => setSelected(item.name)}>
            {item.name}
          </ListItem>
        ))}
      </List>
      {selected !== null && (
        <Text textStyle={{ color: dark ? '#fff' : '#000' }}>
          Selected: {selected}
        </Text>
      )}
    </Host>
  );
}
```

List rows仍是 React elements，所以 `key` 应和普通 React `.map()` 列表一样提供。

## Shorthand Slots：leading / trailing / supportingText

常见的一行副标题可以通过 `supportingText`，前导内容放 `leading`，末端 action / disclosure icon 放 `trailing`。同一个 slot 也可以传 ReactNode：

```tsx
import { Host, Icon, List, ListItem } from '@expo/ui';

const CHEVRON = Icon.select({
  ios: 'chevron.right',
  android: require('@expo/material-symbols/chevron_right.xml'),
});

export default function SettingsList() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <ListItem
          onPress={() => openProfile()}
          trailing={<Icon name={CHEVRON} size={14} color="gray" />}
          supportingText="Secondary line below the headline"
        >
          Profile
        </ListItem>
        <ListItem trailing={<Icon name={CHEVRON} size={14} color="gray" />}>
          Settings
        </ListItem>
      </List>
    </Host>
  );
}
```

用实际交互 handler 替代示例中的 `openProfile()`；点击行任意空隙也会触发整个 row 的 `onPress`。

## Compound API：用子组件组织槽位

要在槽里放更复杂的内容（例如 icon、两个拼接的文本）可使用 `<ListItem.Leading>`、`<ListItem.Trailing>`、`<ListItem.Supporting>` 子组件。未包在槽里的 children 会组成 headline：

```tsx
import { useColorScheme } from 'react-native';
import { Host, Icon, List, ListItem, Row, Text } from '@expo/ui';

const STAR = Icon.select({
  ios: 'star.fill',
  android: require('@expo/material-symbols/star.xml'),
});

export default function RankedItem() {
  const dark = useColorScheme() === 'dark';
  const headlineColor = { color: dark ? '#fff' : '#000' };

  return (
    <Host style={{ flex: 1 }}>
      <List>
        <ListItem onPress={() => {}}>
          <ListItem.Leading>
            <Icon name={STAR} size={20} color="#FFD60A" />
          </ListItem.Leading>
          <Row spacing={0}>
            <Text textStyle={{ color: 'gray' }}>#42: </Text>
            <Text textStyle={headlineColor}>Composite headline</Text>
          </Row>
          <ListItem.Supporting>Richer slot content</ListItem.Supporting>
        </ListItem>
      </List>
    </Host>
  );
}
```

如果同时传 shorthand prop 与同名 compound slot，compound slot 优先；例如 `<ListItem.Leading>` 会覆盖 `leading`。

## Pull-to-refresh

传入 async `onRefresh` 返回 Promise。原生 refresh indicator 会一直展示，直到 Promise resolve 或 reject。以下用短延时模拟请求并在完成时加一行数据：

```tsx
import { useState } from 'react';
import { Host, List, ListItem } from '@expo/ui';

export default function RefreshableList() {
  const [items, setItems] = useState([1, 2, 3]);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setItems(previous => [Math.max(...previous) + 1, ...previous]);
  };

  return (
    <Host style={{ flex: 1 }}>
      <List onRefresh={handleRefresh}>
        {items.map(id => (
          <ListItem key={id}>Item #{id}</ListItem>
        ))}
      </List>
    </Host>
  );
}
```

Pull-to-refresh 目前只在 Android / iOS 显示平台 indicator；Web 端为 API parity 接受 `onRefresh`，但不会渲染手势 indicator。

## List / ListItem API

### List

| Prop | 平台 / 类型 | 说明 |
| --- | --- | --- |
| `children` | Android / iOS / Web；`ReactNode` | 通常放 `ListItem`，也接受其他 React node。 |
| `onRefresh` | Android / iOS；`() => Promise<void>` | 可选刷新函数；Promise 状态控制原生 indicator 显示时间。 |
| `testID` | Android / iOS / Web；`string` | UI / E2E 定位标识。 |

### ListItem

| Prop / slot | 平台 / 类型 | 说明 |
| --- | --- | --- |
| `children` | Android / iOS / Web；`ReactNode` | 主标题；未分槽 children 进入 headline。 |
| `leading` | Android / iOS / Web；`ReactNode` | 简写开头槽；compound `<ListItem.Leading>` 可覆盖。 |
| `trailing` | Android / iOS / Web；`ReactNode` | 简写结尾槽；compound `<ListItem.Trailing>` 可覆盖。 |
| `supportingText` | Android / iOS / Web；`ReactNode` | 标题下的辅助文字；compound `<ListItem.Supporting>` 可覆盖。 |
| `onPress` | Android / iOS / Web；`() => void` | 按下 row 回调，点击整行矩形（包括槽间空白）都会触发。 |
| `testID` | Android / iOS / Web；`string` | UI / E2E 定位标识。 |
| `modifiers` | **Latest**：Android / iOS / Web，`ModifierConfig[]` | 平台 modifier escape hatch；iOS modifier 会应用到 SwiftUI Button，可覆盖默认 `buttonStyle(.plain)`。此 prop 未见于 SDK v56.0.0 ListItem props 清单，不要默认认为 v56 支持。 |

Compound slot children 也是 `ReactNode`，分别渲染 leading（开头）、supporting（标题下）和 trailing（末端）位置。

## 新手要记住的性能与平台边界

- 这不是可无限扩展的数据列表：所有 React rows 仍会先创建。大数据列表请选择 `FlashList` / `Legend List` 等真正面向大列表的组件。
- iOS / Android 是原生列表视觉；Web 是 React Native scrolling View，不是完整的原生 List 控件。
- pull-to-refresh 仅 Android / iOS 呈现 indicator。
- Icon slots 与 Host 使用 Expo UI native tree；SDK56 应安装匹配 `@expo/ui ~56.0.26`。

## 关键名词

- **Virtualized list：**只维护可视范围附近行数据的列表方式；该 Expo UI `List` 当前虽然底层容器名有 virtualized，但 React 子行仍全部创建，所以不适合大量 items。
- **ListItem slot：**列表行中预留的开始、标题、辅助文本、末端区域。
- **Compound API：**通过子组件声明槽位，可放任意 ReactNode，不限字符串简写。
- **Pull-to-refresh：**用户从列表顶端向下拖动触发的原生刷新手势。
- **SwiftUI `List` / Compose `LazyColumn`：**对应 iOS / Android 原生列表实现。

## 官方代码主题覆盖

源页全部代码示例均已覆盖：package-manager 安装；基本 list + state / key / dark-mode text；shorthand leading / trailing / supportingText；compound slots 与 Row / Icon / Text 内容；async pull-to-refresh 和列表更新。源页 props 也已覆盖 `children`、`onRefresh`、`testID`、ListItem slots / `onPress` / modifiers 版本差异。

## 下一页

官方页脚 **Next** 是 [Universal Picker](https://docs.expo.dev/versions/latest/sdk/ui/universal/picker/)，讲单选输入及菜单 / 转轮两种选择器外观。

**翻页：**[上一页：Universal Icon](./117-Universal-Icon.md) · [返回目录](./README.md) · [下一页：Universal Picker](./119-Universal-Picker.md)
