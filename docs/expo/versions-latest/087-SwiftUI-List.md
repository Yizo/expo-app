# 087｜SwiftUI List

**翻页：**[上一页：SwiftUI Link](./086-SwiftUI-Link.md) · [目录](./README.md) · [下一页：SwiftUI Menu](./088-SwiftUI-Menu.md)

**官方页面：**[SwiftUI List · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/list/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/list/)推荐 `~56.0.24`。控件支持 iOS / tvOS，可在 Expo Go 使用。SwiftUI List 呈现原生分组行，不会延迟创建 React children；大数据列表应选虚拟列表库。

## 原生分组列表

Expo UI `List` 使用 SwiftUI 原生 List，适合设置页、选择页等分组行界面。通常用 `Section` 分组，支持列表样式、选中、删除、拖动重排、下拉刷新和行样式。它不是 React Native `FlatList`：官方明确说明 List 会先创建全部 React row，数据很多时首屏可能变慢。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基础分组列表

~~~tsx
import { Host, List, Text, Section } from '@expo/ui/swift-ui';

export default function BasicListExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section title="Fruits">
          <Text>Apple</Text>
          <Text>Banana</Text>
          <Text>Orange</Text>
        </Section>
        <Section title="Vegetables">
          <Text>Carrot</Text>
          <Text>Broccoli</Text>
          <Text>Spinach</Text>
        </Section>
      </List>
    </Host>
  );
}
~~~

## 行标签与系统图标

`Label` 把文字和 SF Symbol 组合成设置行：

~~~tsx
import { Host, List, Label, Section } from '@expo/ui/swift-ui';

export default function ListWithLabelsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section title="Settings">
          <Label title="Wi-Fi" systemImage="wifi" />
          <Label
            title="Bluetooth"
            systemImage="antenna.radiowaves.left.and.right"
          />
          <Label
            title="Cellular"
            systemImage="antenna.radiowaves.left.and.right.circle"
          />
        </Section>
      </List>
    </Host>
  );
}
~~~

## 切换列表外观

`listStyle` 支持 `automatic`、`plain`、`inset`、`insetGrouped`、`grouped`、`sidebar`。`inset`、`insetGrouped`、`sidebar` 在 tvOS 不可用。示例把 Picker 放在列表内即时切换样式：

~~~tsx
import { useState } from 'react';
import {
  Host,
  List,
  Text,
  Section,
  Picker,
} from '@expo/ui/swift-ui';
import {
  listStyle,
  pickerStyle,
  tag,
} from '@expo/ui/swift-ui/modifiers';

const styles = [
  'automatic',
  'plain',
  'inset',
  'insetGrouped',
  'grouped',
  'sidebar',
] as const;

export default function ListStylesExample() {
  const [styleIndex, setStyleIndex] = useState(0);

  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[listStyle(styles[styleIndex])]}>
        <Section title="Style Picker">
          <Picker
            label="List Style"
            selection={styleIndex}
            onSelectionChange={setStyleIndex}
            modifiers={[pickerStyle('menu')]}>
            {styles.map((style, index) => (
              <Text key={style} modifiers={[tag(index)]}>
                {style}
              </Text>
            ))}
          </Picker>
        </Section>
        <Section title="Sample Items">
          <Text>Item 1</Text>
          <Text>Item 2</Text>
          <Text>Item 3</Text>
        </Section>
      </List>
    </Host>
  );
}
~~~

## 选择、删除与重排

`List.ForEach` 是 List 的复合子组件：`tag` 为每行提供稳定标识，`selection` 控制选中项，`onDelete` 收到要删除的行索引，`onMove` 收到来源索引与插入位置。`environment('editMode', ...)` 控制原生列表编辑状态：

~~~tsx
import { useState } from 'react';
import {
  Host,
  List,
  Label,
  Section,
  Toggle,
} from '@expo/ui/swift-ui';
import { environment, tag } from '@expo/ui/swift-ui/modifiers';

type Task = { id: string; title: string };

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Task 1' },
  { id: '2', title: 'Task 2' },
  { id: '3', title: 'Task 3' },
  { id: '4', title: 'Task 4' },
];

export default function EditableListExample() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);

  const handleDelete = (indices: number[]) => {
    setTasks(prev => prev.filter((_, i) => !indices.includes(i)));
  };

  const handleMove = (sourceIndices: number[], destination: number) => {
    setTasks(prev => {
      const newTasks = [...prev];
      const [removed] = newTasks.splice(sourceIndices[0], 1);
      const adjustedDest =
        sourceIndices[0] < destination ? destination - 1 : destination;
      newTasks.splice(adjustedDest, 0, removed);
      return newTasks;
    });
  };

  return (
    <Host style={{ flex: 1 }}>
      <List
        selection={selectedIds}
        onSelectionChange={ids => setSelectedIds(ids.map(String))}
        modifiers={[
          environment('editMode', editMode ? 'active' : 'inactive'),
        ]}>
        <Section title="Settings">
          <Toggle
            label="Edit mode"
            isOn={editMode}
            onIsOnChange={setEditMode}
          />
        </Section>
        <Section title="Tasks">
          <List.ForEach onDelete={handleDelete} onMove={handleMove}>
            {tasks.map(task => (
              <Label
                key={task.id}
                title={task.title}
                modifiers={[tag(task.id)]}
              />
            ))}
          </List.ForEach>
        </Section>
      </List>
    </Host>
  );
}
~~~

`moveDisabled` 和 `deleteDisabled` modifier 可关闭单独行的重排或删除动作。

## 下拉刷新

`refreshable` modifier 接收异步函数；下面使用延时模拟网络数据刷新，并显示上次刷新时间：

~~~tsx
import { useState } from 'react';
import { Host, List, Text, Section } from '@expo/ui/swift-ui';
import { refreshable } from '@expo/ui/swift-ui/modifiers';

export default function RefreshableListExample() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = async () => {
    // 模拟异步数据请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastRefresh(new Date());
  };

  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[refreshable(handleRefresh)]}>
        <Section title="Data">
          <Text>Pull down to refresh</Text>
          {lastRefresh && (
            <Text>Last refresh: {lastRefresh.toLocaleTimeString()}</Text>
          )}
        </Section>
      </List>
    </Host>
  );
}
~~~

## 自定义行背景、分隔线和边距

用 `listRowBackground`、`listRowSeparator`、`listRowSeparatorTint`、`listRowInsets` 和 `alignmentGuide` 定制各行外观：

~~~tsx
import { Host, List, Text, Section } from '@expo/ui/swift-ui';
import {
  alignmentGuide,
  listRowBackground,
  listRowSeparator,
  listRowSeparatorTint,
  listRowInsets,
} from '@expo/ui/swift-ui/modifiers';

export default function RowStylingExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section title="Styled Rows">
          <Text modifiers={[listRowBackground('blue')]}>Blue background</Text>
          <Text modifiers={[listRowSeparator('hidden')]}>Hidden separator</Text>
          <Text modifiers={[listRowSeparatorTint('red')]}>Red separator</Text>
          <Text modifiers={[listRowInsets({ leading: 40 })]}>
            Extra leading inset
          </Text>
          <Text modifiers={[listRowInsets({ leading: 0, trailing: 0 })]}>
            No horizontal insets
          </Text>
          <Text
            modifiers={[
              alignmentGuide('listRowSeparatorLeading', 32),
            ]}>
            Separator starts 32 points in
          </Text>
        </Section>
      </List>
    </Host>
  );
}
~~~

## 滚动时收起键盘

`scrollDismissesKeyboard('interactively')` 让键盘随滚动手势交互式收起：

~~~tsx
import { Host, List, Section, TextField } from '@expo/ui/swift-ui';
import { scrollDismissesKeyboard } from '@expo/ui/swift-ui/modifiers';

export default function KeyboardDismissExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[scrollDismissesKeyboard('interactively')]}>
        <Section title="Form">
          <TextField placeholder="Name" />
          <TextField placeholder="Email" />
          <TextField placeholder="Phone" />
        </Section>
      </List>
    </Host>
  );
}
~~~

## 增强 Section 标题

`headerProminence('increased')` 提升分组标题的视觉强调程度：

~~~tsx
import { Host, List, Text, Section } from '@expo/ui/swift-ui';
import { headerProminence } from '@expo/ui/swift-ui/modifiers';

export default function HeaderProminenceExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[headerProminence('increased')]}>
        <Section title="Important Section">
          <Text>This section has increased header prominence</Text>
        </Section>
        <Section title="Another Section">
          <Text>Headers are more prominent</Text>
        </Section>
      </List>
    </Host>
  );
}
~~~

## API 速查

| 组件 / 属性 | 类型 | 说明 |
| --- | --- | --- |
| `List.children` | `React.ReactNode` | List 中的原生行与 Section。 |
| `List.selection` | `(string \| number)[]`（可选） | 当前已选行的 tag 集合。 |
| `List.onSelectionChange` | `(selection: (string \| number)[]) => void`（可选） | 选择集合变化时调用，返回行 tag。 |
| `List.ForEach` | 复合子组件 | 必须放在 List 内；为行启用删除和重排。 |
| `List.ForEach.children` | `React.ReactNode` | 可编辑项目。 |
| `List.ForEach.onDelete` | `(indices: number[]) => void`（可选） | 删除时给出被删项目索引。 |
| `List.ForEach.onMove` | `(sourceIndices: number[], destination: number) => void`（可选） | 重排时给出来源索引与目标位置。 |

### 新手术语

- **SwiftUI List**：iOS / tvOS 的原生分组列表控件，外观适合设置项；Expo UI 版不会虚拟化 React 数据。
- **Section**：列表中的分组区块，可用 `title` 显示分组标题。
- **tag**：用于标识选项的值；List 用它记录与回传所选行。
- **Edit mode**：系统列表的编辑状态，可显示选择、删除和拖动重排等操作。
- **leading / trailing inset**：相对阅读方向的起始边距 / 结束边距。

大数据、无限滚动或需要复用 cell 时，使用 FlashList、Legend List 或 React Native `FlatList`，而不是 SwiftUI Expo UI `List`。

## 源页代码主题覆盖

已覆盖四种安装命令和官方八个示例：分组列表、Label / SF Symbol 行、样式选择、选择 / 删除 / 重排、下拉刷新、行背景 / 分隔线 / 边距、滚动时收起键盘、增强 Section 标题。另说明 List 当前不虚拟化大量行。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/list/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/list/)

**翻页：**[上一页：SwiftUI Link](./086-SwiftUI-Link.md) · [目录](./README.md) · [下一页：SwiftUI Menu](./088-SwiftUI-Menu.md)
