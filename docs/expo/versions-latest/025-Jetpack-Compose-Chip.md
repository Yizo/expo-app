# 025｜Jetpack Compose Chip

**翻页：**[上一页：Jetpack Compose Checkbox](./024-Jetpack-Compose-Checkbox.md) · [目录](./README.md) · [下一页：Jetpack Compose Column](./026-Jetpack-Compose-Column.md)

**官方页面：**[Jetpack Compose Chip](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/chip/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.12；SDK v56 精确 reference [Chip](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/chip/) bundled 版本为 ~56.0.17。这里的四种 chip 是 Android Jetpack Compose 组件，也可在 Expo Go 中试用。

## 四类 Material Chip

Chip 是紧凑的标签式操作控件，通常放在过滤器、输入标签、轻量动作或动态建议中。Expo UI 按用途提供四种组件：

- **AssistChip**：帮助用户执行临时操作，例如打开地图、预订航班。
- **FilterChip**：切换一个过滤选项，selected 状态会反映当前是否启用过滤条件。
- **InputChip**：表示一段用户输入（如标签），通常可点击移除。
- **SuggestionChip**：展示系统或页面上下文生成的快捷建议。

跨平台项目可以使用 Expo UI 的 universal Chip；本页介绍的是 Android 原生 Compose variants。

## 安装

用 Expo CLI 安装与当前 SDK 匹配的 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

已有 bare React Native 工程还需先添加 Expo package。

## AssistChip：动作和图标

Chip 的内容用 Label、LeadingIcon、TrailingIcon 等 slot 组件组合，而不是用普通字符串 children：

```tsx
import {
  AssistChip,
  Host,
  Icon,
  Text,
} from '@expo/ui/jetpack-compose';

export default function FlightActionChip() {
  return (
    <Host matchContents>
      <AssistChip onClick={() => console.log('打开航班预订')}>
        <AssistChip.Label>
          <Text>预订航班</Text>
        </AssistChip.Label>
        <AssistChip.LeadingIcon>
          <Icon source={require('./assets/flight.xml')} size={18} />
        </AssistChip.LeadingIcon>
      </AssistChip>
    </Host>
  );
}
```

图标可作为 leading 或 trailing 内容；XML vector asset 示例会显示在文字旁边。onClick 是 Compose chip 的交互回调。

## FilterChip：选择或取消过滤条件

FilterChip 通常受 React state 控制。selected 决定视觉状态，onClick 更新这个 state：

```tsx
import { useState } from 'react';
import { FilterChip, Host, Text } from '@expo/ui/jetpack-compose';

export default function ImageFilterChip() {
  const [selected, setSelected] = useState(false);

  return (
    <Host matchContents>
      <FilterChip
        selected={selected}
        onClick={() => setSelected(value => !value)}>
        <FilterChip.Label>
          <Text>图片</Text>
        </FilterChip.Label>
      </FilterChip>
    </Host>
  );
}
```

## InputChip：展示和移除用户输入

InputChip 常用在搜索条件或编辑器标签区域；此例把 chips 保存为数组，点击某项从数组移除它。FlowRow 会在水平空间不足时自动换行：

```tsx
import { useState } from 'react';
import {
  FlowRow,
  Host,
  Icon,
  InputChip,
  Text,
} from '@expo/ui/jetpack-compose';

export default function TagInputChips() {
  const [tags, setTags] = useState(['Work', 'Travel', 'News']);

  return (
    <Host matchContents>
      <FlowRow horizontalArrangement={{ spacedBy: 8 }}>
        {tags.map(tag => (
          <InputChip
            key={tag}
            selected
            onClick={() => setTags(previous => previous.filter(item => item !== tag))}>
            <InputChip.Label><Text>{tag}</Text></InputChip.Label>
            <InputChip.TrailingIcon>
              <Icon source={require('./assets/close.xml')} size={18} />
            </InputChip.TrailingIcon>
          </InputChip>
        ))}
      </FlowRow>
    </Host>
  );
}
```

InputChip 还可组合 Avatar slot，表达当前用户、联系人或标签来源。关闭图标通过 onClick 完成移除操作。

## SuggestionChip：提供下一步建议

SuggestionChip 适合动态建议，例如搜索范围或快速回复：

```tsx
import { Host, SuggestionChip, Text } from '@expo/ui/jetpack-compose';

export default function NearbySuggestion() {
  return (
    <Host matchContents>
      <SuggestionChip onClick={() => console.log('搜索附近地点')}>
        <SuggestionChip.Label>
          <Text>附近</Text>
        </SuggestionChip.Label>
      </SuggestionChip>
    </Host>
  );
}
```

## API 属性

四种组件共享多数属性：

| 属性 | 适用范围 | 含义 |
| --- | --- | --- |
| border | 全部 | 设置边线颜色和 dp 宽度；ChipBorder.width 默认 1。 |
| children | 全部 | 由 Label、图标或 Avatar slot 组成的内容。 |
| colors | 全部 | 分别设置容器、文字、图标和 selected 状态颜色。 |
| elevation | 全部 | Compose 表面高度，单位 dp。 |
| enabled | 全部 | 是否可交互，默认启用。 |
| modifiers | 全部 | Compose layout / drawing modifier 列表。 |
| onClick | 全部 | 用户点击后的回调。 |
| selected | FilterChip / InputChip | 当前选择状态；InputChip 默认 false。 |

不同类型可用的 child slot：

| 组件 | child slot |
| --- | --- |
| AssistChip | Label、LeadingIcon、TrailingIcon |
| FilterChip | Label、LeadingIcon、TrailingIcon |
| InputChip | Label、Avatar、TrailingIcon |
| SuggestionChip | Label、Icon |

## 颜色与边框类型

| 类型 | 常用字段 |
| --- | --- |
| AssistChipColors | containerColor、labelColor、leadingIconContentColor、trailingIconContentColor。 |
| FilterChipColors | containerColor、iconColor、labelColor，以及 selectedContainerColor / selectedLabelColor / selectedLeadingIconColor / selectedTrailingIconColor。 |
| InputChipColors | containerColor、labelColor、leadingIconColor / trailingIconColor，以及 selectedContainerColor、selectedLabelColor 和 selected icon colors。 |
| SuggestionChipColors | containerColor、iconContentColor、labelColor。 |
| ChipBorder | color、width；width 单位 dp，默认值 1。 |

## 关键名词

- **Assist**：帮助用户快速完成某项操作的辅助入口。
- **Filter**：用于切换搜索 / 内容过滤条件，选中状态是可见 UI 状态。
- **Input chip**：将用户已输入的短内容显示为可操作标签。
- **Suggestion**：基于当前上下文提供的快速操作或搜索建议。
- **Slot component**：专门插入到 chip 预留位置的 Label、Icon 或 Avatar 组件。
- **FlowRow**：横向排列 children，超出可用宽度时换行的 Compose 布局。
- **dp / elevation**：Android 逻辑尺寸与表面层级 / 阴影高度。

## 官方代码主题覆盖

源页代码均已重写：@expo/ui 的包管理器安装与 Expo 前置条件、AssistChip + Label + LeadingIcon、FilterChip selected state、InputChip 数组删除 / FlowRow / TrailingIcon、SuggestionChip 点击处理；Assist / Filter / Input / Suggestion 的共享 API props、专属 selected 属性、颜色类型和 ChipBorder 也有归纳。

## 下一页

官方页脚 **Next** 指向 [Jetpack Compose Column](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/column/)，介绍 Compose 纵向布局容器。

**翻页：**[上一页：Jetpack Compose Checkbox](./024-Jetpack-Compose-Checkbox.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Column](./026-Jetpack-Compose-Column.md)
