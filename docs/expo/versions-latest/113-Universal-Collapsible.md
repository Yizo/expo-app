# 113｜Expo UI Universal Collapsible

**翻页：**[上一页：Universal Checkbox](./112-Universal-Checkbox.md) · [目录](./README.md) · [下一页：Universal Column](./114-Universal-Column.md)

**官方页面：**[Collapsible · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/collapsible/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/collapsible/)推荐 `~56.0.26`。通用组件支持 Android、iOS、Web，可在 Expo Go 使用。Latest 增加了 `labelStyle` 属性；SDK 56 页面没有该属性。

## 点击标题展开或收起内容

`Collapsible` 是可折叠容器：用户点击标题，就会显示或隐藏 `children`。它由 `isOpen` 和 `onOpenChange` 组成受控状态，每个实例的状态独立管理；若要做只能展开一项的手风琴效果，由父组件统一维护当前项。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本折叠区

~~~tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, Column, Collapsible, Text } from '@expo/ui';

export default function CollapsibleExample() {
  const [open, setOpen] = useState(false);
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <Column spacing={8} style={{ padding: 16 }}>
        <Collapsible isOpen={open} onOpenChange={setOpen} label="About">
          <Text textStyle={ink}>
            A primitive that toggles visibility of its content via a labelled tappable header.
          </Text>
        </Collapsible>
      </Column>
    </Host>
  );
}
~~~

## 手风琴：同一时刻只展开一个分区

官方说明 `Collapsible` 本身不强制互斥。下面把当前打开分区保存在父组件 `openSection` 中；打开 B 或 C 时，状态更新也会自动折叠其他分区：

~~~tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, Column, Collapsible, Text } from '@expo/ui';

type Section = 'a' | 'b' | 'c' | null;

export default function CollapsibleAccordionExample() {
  const [openSection, setOpenSection] = useState<Section>('a');
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <Column spacing={8} style={{ padding: 16 }}>
        <Collapsible
          isOpen={openSection === 'a'}
          onOpenChange={open => setOpenSection(open ? 'a' : null)}
          label="Section A">
          <Text textStyle={ink}>Opening B or C closes this one.</Text>
        </Collapsible>
        <Collapsible
          isOpen={openSection === 'b'}
          onOpenChange={open => setOpenSection(open ? 'b' : null)}
          label="Section B">
          <Text textStyle={ink}>Opening A or C closes this one.</Text>
        </Collapsible>
        <Collapsible
          isOpen={openSection === 'c'}
          onOpenChange={open => setOpenSection(open ? 'c' : null)}
          label="Section C">
          <Text textStyle={ink}>Opening A or B closes this one.</Text>
        </Collapsible>
      </Column>
    </Host>
  );
}
~~~

SDK 56 官方示例也包含这两个模式，但采用固定深色默认文字和 `Host style={{ flex: 1 }}`；上面的版本是 Latest 中的完整示例。

## 属性速查

从 `@expo/ui` 导入：

~~~tsx
import { Collapsible } from '@expo/ui';
~~~

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`（可选） | 仅在 `isOpen` 为 `true` 时显示的内容。 |
| `isOpen` | `boolean` | 当前是否展开。 |
| `label` | `string`（可选） | 可点击标题上显示的文字。 |
| `labelStyle` | 对象（Latest，SDK 56 页面未列出） | 标题文字样式。 |
| `onOpenChange` | `(isOpen: boolean) => void` | 用户点击标题切换状态时调用。 |

Latest 的 `labelStyle` 可配置 `color`、`fontFamily`、`fontSize`、`fontWeight`、`letterSpacing`、`lineHeight`、`textAlign`；字体粗细支持 `normal`、`bold` 和 `'100'` 至 `'900'`，对齐支持 `center`、`left`、`right`。

### 新手术语

- **Collapsible（可折叠区）**：带标题的容器，点击标题可显示或隐藏内部内容。
- **手风琴（accordion）**：多个可折叠分区共享状态，通常同一时刻只打开一个。
- **互斥（exclusive）**：某一项打开时，其他项必须关闭；这个规则由示例的父组件实现，而不是组件默认行为。
- **`null`**：表示当前没有打开的分区。

## 源页代码主题覆盖

已覆盖四种安装命令与官方两个示例：受控基础折叠区、由父 state 保证一次只展开一项的 accordion；另列 API 导入、label、isOpen 和 onOpenChange。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/collapsible/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/collapsible/)

**翻页：**[上一页：Universal Checkbox](./112-Universal-Checkbox.md) · [目录](./README.md) · [下一页：Universal Column](./114-Universal-Column.md)
