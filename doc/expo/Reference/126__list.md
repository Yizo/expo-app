# List：跨平台原生风格列表与可点击列表项

`List` 和 `ListItem` 来自 `@expo/ui`：

- `List`：纵向排列列表行的容器。
- `ListItem`：可点击的列表行，支持前置内容、标题、辅助内容和后置内容。
- 支持 Android、iOS 和 Web。
- 包含在 Expo Go 中。

> 本页属于**下一个 Expo SDK 版本**的未发布版本文档，不代表当前稳定版本。文档指出，当前最新稳定版本为 SDK 56。实际项目应根据所使用的 Expo SDK 版本查阅对应文档。

## 文档解决的问题

这篇文档主要说明如何使用 `@expo/ui` 创建具有平台原生外观和交互行为的列表，包括：

- 渲染基础列表。
- 响应整行点击。
- 为列表项添加前置、后置和辅助内容。
- 使用复合组件精细控制列表项结构。
- 在 Android 和 iOS 上实现下拉刷新。
- 了解相关组件的 Props、平台支持范围和性能限制。

它适合设置页、个人资料页、功能菜单、选项列表等由多行内容构成的界面。

对于数据量很大的信息流或长列表，当前 `List` 并不合适，因为它还不能按需创建 React 列表行。

## 阅读前需要理解的概念

### `@expo/ui`

`@expo/ui` 是 Expo 提供的 UI 组件包。这里使用的 `List`、`ListItem`、`Host`、`Icon`、`Row` 和 `Text` 都从该包导入。

它与 React Web 中的 DOM 组件库不同：这些组件面向 Android、iOS 和 Web，并尝试提供符合各平台习惯的外观和行为。

### `Host`

示例都将组件放在 `Host` 内：

```tsx
<Host style={{ flex: 1 }}>
  {/* @expo/ui 组件 */}
</Host>
```

当前文档没有详细解释 `Host` 的完整职责。根据示例可以确认，`Host` 是承载这些 `@expo/ui` 组件的上层容器，`flex: 1` 表示让它占据可用空间。

对于 React Web 开发者，可以暂时将它理解为 `@expo/ui` 组件所需的宿主边界，但不要直接等同于普通 `<div>`。

### 平台原生外观

`List` 会提供平台原生的列表表现，例如：

- 列表项分隔线。
- 缩进样式。
- 下拉刷新交互。

这意味着同一段代码在不同平台上可能不会具有完全一致的视觉效果。这里追求的是符合各平台的设计习惯，而不是像素级一致。

### `ReactNode`

多个 Props 接受 `ReactNode`，即可以被 React 渲染的内容，例如：

- 字符串。
- React 元素。
- 多个组件组合。
- 根据条件生成的内容。

因此，插槽并不局限于纯文本，也可以放置图标或更复杂的布局。

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

这里使用 `expo install` 而不是直接执行 `npm install`。它负责安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生工程，而不是标准 Expo 项目，还必须先按照 Expo 文档将 `expo` 安装到该工程中。当前文档未展开这部分原生工程配置流程。

## 基础列表

```tsx
import { useState } from 'react';
import { Host, List, ListItem, Text } from '@expo/ui';

const ITEMS = [
  { id: 1, name: 'Avocado toast' },
  { id: 2, name: 'Bagel with cream cheese' },
  { id: 3, name: 'Cappuccino' },
];

export default function ListExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Host style={{ flex: 1 }}>
      <List>
        {ITEMS.map(item => (
          <ListItem
            key={item.id}
            onPress={() => setSelected(item.name)}>
            {item.name}
          </ListItem>
        ))}
      </List>

      {selected != null && <Text>Selected: {selected}</Text>}
    </Host>
  );
}
```

其数据渲染方式与 React Web 基本一致：

1. 使用 `map` 将数据转换为组件。
2. 使用稳定且唯一的 `key` 标识列表项。
3. 通过 `useState` 保存选中状态。
4. 点击列表项时调用 `onPress` 更新状态。

需要注意，移动端通常使用 `onPress` 表示点击或触摸操作，而不是 React DOM 中常见的 `onClick`。

`ListItem` 的整个矩形区域都可以触发 `onPress`，包括前置内容、标题、后置内容之间的空白区域。用户不需要准确点中其中的文字。

## 列表项的内容区域

一个 `ListItem` 可以包含四个主要区域：

| 区域 | 简写 Prop | 复合组件 | 作用 |
| --- | --- | --- | --- |
| 前置区域 | `leading` | `ListItem.Leading` | 显示在行开头，例如头像或图标 |
| 标题区域 | `children` | 无单独标记 | 列表行的主要内容 |
| 辅助区域 | `supportingText` | `ListItem.Supporting` | 显示在标题下方 |
| 后置区域 | `trailing` | `ListItem.Trailing` | 显示在行末尾，例如箭头或状态 |

这里的“前置”和“后置”应理解为布局的开始端与结束端，而不应简单理解为固定的左侧和右侧。

### 使用简写 Props

内容较简单时，可以直接传入 `leading`、`trailing` 和 `supportingText`：

```tsx
import { Host, Icon, List, ListItem } from '@expo/ui';

const CHEVRON = Icon.select({
  ios: 'chevron.right',
  android: require('@expo/material-symbols/chevron_right.xml'),
});

export default function ListItemSlotsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <ListItem
          onPress={() => {}}
          trailing={
            <Icon name={CHEVRON} size={14} color="gray" />
          }
          supportingText="Secondary line below the headline">
          Profile
        </ListItem>

        <ListItem
          onPress={() => {}}
          trailing={
            <Icon name={CHEVRON} size={14} color="gray" />
          }>
          Settings
        </ListItem>
      </List>
    </Host>
  );
}
```

示例通过 `Icon.select` 为 iOS 和 Android 选择不同的图标资源：

- iOS 使用 `'chevron.right'`。
- Android 使用 `@expo/material-symbols` 中的 XML 图标资源。

这体现了跨平台开发中的一个重要特点：组件 API 可以统一，但底层资源和平台惯例可能不同。

当前文档没有说明这个图标配置在 Web 上的回退行为，因此不能仅根据本页确认该示例在 Web 上会选择哪个图标。

### 使用复合插槽组件

内容结构较复杂时，可以使用：

- `<ListItem.Leading>`
- `<ListItem.Supporting>`
- `<ListItem.Trailing>`

示例：

```tsx
import { Host, Icon, List, ListItem, Row, Text } from '@expo/ui';

export default function ListItemCompoundExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <ListItem onPress={() => {}}>
          <ListItem.Leading>
            <Icon
              name="star.fill"
              size={20}
              color="#FFD60A"
            />
          </ListItem.Leading>

          <Row spacing={0}>
            <Text textStyle={{ color: 'gray' }}>
              {`#42: `}
            </Text>
            <Text>Composite headline</Text>
          </Row>

          <ListItem.Supporting>
            Richer slot content
          </ListItem.Supporting>
        </ListItem>
      </List>
    </Host>
  );
}
```

在复合 API 中，没有被任何插槽组件包裹的子节点会进入标题区域。因此，上例中的 `Row` 是标题，而 `Icon` 和辅助文本分别进入对应插槽。

### 简写与复合组件的优先级

同一区域同时使用两种写法时，复合组件会覆盖简写 Prop：

- `ListItem.Leading` 覆盖 `leading`。
- `ListItem.Supporting` 覆盖 `supportingText`。
- `ListItem.Trailing` 覆盖 `trailing`。

实际开发中应尽量避免同时提供两种写法，否则简写内容不会生效，容易产生“传入了内容但没有显示”的误判。

## 下拉刷新

为 `List` 提供异步的 `onRefresh`：

```tsx
import { useState } from 'react';
import { Host, List, ListItem } from '@expo/ui';

export default function ListRefreshExample() {
  const [items, setItems] = useState([1, 2, 3]);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    setItems(prev => [
      Math.max(...prev) + 1,
      ...prev,
    ]);
  };

  return (
    <Host style={{ flex: 1 }}>
      <List onRefresh={handleRefresh}>
        {items.map(id => (
          <ListItem key={id}>
            {`Item #${id}`}
          </ListItem>
        ))}
      </List>
    </Host>
  );
}
```

处理流程如下：

1. 用户在列表顶部执行平台支持的下拉刷新手势。
2. `List` 调用 `onRefresh`。
3. `onRefresh` 返回一个 `Promise<void>`。
4. 原生刷新指示器保持显示。
5. Promise 无论成功解决还是因错误拒绝，指示器都会结束显示。

这与 React Web 中手动维护 `isLoading` 状态有所不同：当前 API 直接使用返回 Promise 的生命周期控制刷新指示器。

### Web 平台限制

Web 尚未实现下拉刷新：

- Web 端可以接收 `onRefresh`，以保持跨平台 API 形式一致。
- 但 Web 上不会显示刷新指示器。
- 原生刷新交互只在 Android 和 iOS 上生效。

因此，不能因为 TypeScript 接受该 Prop，就认为 Web 端具备相同功能。

## API 说明

```tsx
import { List, ListItem } from '@expo/ui';
```

### `List`

`List` 是纵向的列表行容器。通常包含 `ListItem`，但文档明确说明它也接受其他 React 节点。

| Prop | 类型 | 平台 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Android、iOS、Web | 列表内容，通常是多个 `ListItem` |
| `onRefresh` | `() => Promise<void>` | Android、iOS | 下拉刷新处理函数，Promise 控制刷新指示器 |
| `testID` | `string` | Android、iOS、Web | 在端到端测试中定位组件 |

所有这些 Props 都是可选的。

### `ListItem`

`ListItem` 是可点击的列表行，通常作为 `List` 的子节点。

| Prop | 类型 | 平台 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Android、iOS、Web | 行的标题内容；未包装为插槽的子节点都会进入标题区域 |
| `leading` | `ReactNode` | Android、iOS、Web | 前置内容的简写形式 |
| `trailing` | `ReactNode` | Android、iOS、Web | 后置内容的简写形式 |
| `supportingText` | `ReactNode` | Android、iOS、Web | 标题下方的辅助内容 |
| `onPress` | `() => void` | Android、iOS、Web | 整行的点击或触摸处理函数 |
| `testID` | `string` | Android、iOS、Web | 在端到端测试中定位组件 |

`supportingText` 传入字符串时，会自动使用符合当前平台习惯的次要文本样式。需要复杂内容时，可以传入其他 React 节点。

文档没有说明 `onPress` 支持异步返回值、事件对象或点击事件参数；按照当前类型，它只是一个无参数、无返回值要求的回调。

### 复合插槽组件

以下三个组件都接受可选的 `children: ReactNode`，并支持 Android、iOS 和 Web：

| 组件 | 渲染位置 |
| --- | --- |
| `ListItem.Leading` | 行的开始端 |
| `ListItem.Supporting` | 标题下方 |
| `ListItem.Trailing` | 行的结束端 |

它们是插槽标记组件，用于告诉 `ListItem` 应将子内容放在哪个区域，而不是独立使用的普通列表组件。

## 性能限制

文档将 `List` 描述为虚拟化纵向容器，但同时明确警告：

> 当前 `List` 尚未延迟渲染列表行，React 会预先创建所有行。

对 React Web 开发者而言，需要区分两个层面：

- 组件可能在原生展示或滚动机制上使用虚拟化容器。
- React 层目前仍会一次性创建所有行的元素。

所以，不能把它直接等同于 React Web 中只渲染可视区域项目的成熟虚拟列表。数据量较大时，初次挂载可能较慢。

官方对大型列表推荐使用：

- FlashList
- Legend List

当前文档没有给出“大型列表”的具体数量标准，也没有提供从 `List` 迁移到这两个库的示例。

## React Web 开发者容易误解的地方

### `onPress` 不是 `onClick`

移动端组件通常统一使用 `onPress` 表达手指点击、鼠标点击等激活动作。不要将 React DOM 的事件名称和事件对象模型直接套用到这里。

### 跨平台不等于表现完全相同

统一的 JSX API 不代表三个平台的视觉效果和功能完全一致。例如：

- 分隔线和缩进样式会遵循平台习惯。
- 图标资源可能需要按平台选择。
- 下拉刷新目前只在 Android 和 iOS 上实现。

### “接受 Prop”不等于“平台已实现功能”

Web 可以接收 `onRefresh`，但不会出现刷新指示器。这种设计称为 API parity，即保持 API 形式一致，而不是保证底层能力一致。

### `List` 暂时不能解决大型列表性能问题

即使文档使用了“virtualized”描述，当前实现仍会让 React 预先创建每一行。大量数据不能仅通过换用 `List` 获得按需渲染能力。

### 列表项不是 HTML 元素

`ListItem` 不能简单视为 `<li>`，`List` 也不能简单视为 `<ul>`。它们是跨平台 React 组件，并提供原生样式和交互能力。

当前文档未涉及 Web 端最终生成的 DOM、HTML 语义结构、键盘导航和无障碍角色，因此不能从本页推断其 Web 语义与原生 `<ul>`、`<li>` 完全等价。

## 实际开发中的使用方式

以下结论均为**基于文档内容推导**：

1. 设置页和功能菜单可以使用 `List` 配合 `ListItem`，因为这类页面通常数据量有限，并且需要整行点击和平台原生样式。
2. 简单文本、图标和箭头优先使用简写 Props；标题需要多个组件组合时再使用复合插槽 API。
3. 跨平台图标应显式考虑各平台资源，不应假定同一个图标名称或文件能在所有平台工作。
4. 使用 `onRefresh` 时，应让刷新函数返回代表完整刷新过程的 Promise，否则刷新指示器可能在数据更新完成前结束。
5. 同时面向 Web 时，需要为刷新数据提供其他入口，因为原生下拉刷新在 Web 上不会显示。
6. 在数据规模可能持续增长的业务中，应尽早评估 FlashList 或 Legend List，避免列表扩大后才处理首次挂载性能问题。

**基于经验建议：**

- 在 `onRefresh` 内处理请求失败，避免 Promise 拒绝后没有用户可见的错误反馈。
- 为可交互的关键列表项设置稳定的 `testID`，方便端到端测试。
- 保持列表项 `key` 稳定，不要在数据会重排时使用数组索引。
- 对 Android、iOS 和 Web 分别验证布局、图标、点击范围及刷新行为，不要只在单个平台检查。

## 当前文档未涉及的内容

本页没有说明以下内容：

- `List` 和 `ListItem` 的详细样式定制 API。
- 列表的横向排列方式。
- 分组列表、分区标题或粘性标题。
- 分页加载和触底加载。
- 空列表、加载失败和骨架屏组件。
- 列表项滑动操作。
- 列表项禁用状态或选中状态。
- 键盘导航与完整无障碍配置。
- Web 端生成的具体 DOM 结构。
- 原生工程所需的 iOS、Android 额外配置。
- FlashList 和 Legend List 的具体集成方法。

这些能力不能仅依据当前文档判断是否存在，需要查阅相应组件或库的其他文档。

## 总结

`List` 和 `ListItem` 提供了一套适用于 Android、iOS 和 Web 的列表 API，重点是平台原生外观、整行点击、结构化内容插槽和原生下拉刷新。

开发时需要重点记住三个边界：

- `ListItem` 的简写 Props 适合常见布局，复合插槽适合复杂内容，且复合插槽优先级更高。
- 下拉刷新只在 Android 和 iOS 上实际生效，并由 `onRefresh` 返回的 Promise 控制指示器。
- 当前 `List` 会预先创建所有 React 列表行，不适合大型列表；大型列表应评估 FlashList 或 Legend List。

---

## 文档导航

- **上一页**：[icon](./125__icon.md)
- **下一页**：[picker](./127__picker.md)
