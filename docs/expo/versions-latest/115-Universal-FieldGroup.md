# 115｜Expo UI Universal FieldGroup

**翻页：**[上一页：Universal Column](./114-Universal-Column.md) · [目录](./README.md) · [下一页：Universal Host](./116-Universal-Host.md)

**官方页面：**[FieldGroup · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/fieldgroup/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/fieldgroup/)推荐 `~56.0.26`。两版均支持 Android、iOS、Web，并可在 Expo Go 使用。SDK 56 文档特别说明：`FieldGroup` 自身没有固有高度，必须放在高度有界的父容器中（例如 `Host flex: 1`）；`matchContents` 这种按内容收缩的容器不适用。

## 可滚动的设置分组表单

`FieldGroup` 是可滚动、按分组排列的设置行容器，视觉上类似 iOS Settings。把 `FieldGroup.Section` 放在里面定义显式分区；标题和说明文字可分别通过 `SectionHeader`、`SectionFooter` 插槽自定义。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 分组设置行

示例用 `Switch` 控制推送和邮件通知，并用第二个分区显示版本信息：

~~~tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, FieldGroup, Switch, Text } from '@expo/ui';

export default function FieldGroupExample() {
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section title="Notifications">
          <Switch label="Push" value={notifications} onValueChange={setNotifications} />
          <Switch label="Email" value={analytics} onValueChange={setAnalytics} />
        </FieldGroup.Section>

        <FieldGroup.Section title="About">
          <Text textStyle={ink}>Version 1.0.0</Text>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
~~~

## 自定义分区标题与页脚

有自定义内容时使用 `FieldGroup.SectionHeader` 和 `FieldGroup.SectionFooter`，替代简单文字 `title`：

~~~tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, FieldGroup, Switch, Text } from '@expo/ui';

export default function FieldGroupSlotsExample() {
  const [enabled, setEnabled] = useState(false);
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section>
          <FieldGroup.SectionHeader>
            <Text textStyle={{ ...ink, fontSize: 16, fontWeight: '700' }}>Privacy</Text>
          </FieldGroup.SectionHeader>

          <Switch label="Share usage" value={enabled} onValueChange={setEnabled} />

          <FieldGroup.SectionFooter>
            <Text textStyle={{ fontSize: 12, color: '#8E8E93' }}>
              Helps us improve the app. You can disable this at any time.
            </Text>
          </FieldGroup.SectionFooter>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
~~~

## 组件与属性速查

导入入口：

~~~tsx
import { FieldGroup } from '@expo/ui';
~~~

### `FieldGroup`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`（可选） | 分区集合。直接放入的非 Section 子项会被作为隐式分区，匹配 SwiftUI Form 行为。 |
| `disabled` / `hidden` | `boolean`（可选） | 禁用交互 / 隐藏容器。 |
| `modifiers` | `ModifierConfig[]`（可选） | 传平台专用的 SwiftUI / Compose modifier。 |
| `onAppear` / `onDisappear` / `onPress` | `() => void`（可选） | 生命周期 / 按压回调。 |
| `style` | 受限 `ViewStyle`（可选） | 跨平台支持的 padding、背景色、边框、透明度、宽高等。 |
| `testID` | `string`（可选） | 端到端测试定位标识。 |

### `FieldGroup.Section`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`（可选） | 分区行，可包含一个自定义 Header 和 / 或 Footer。 |
| `title` | `string`（可选） | 默认样式的分区标题；自定义 Header 存在时忽略。 |
| `titleUppercase` | `boolean`（默认 `false`） | 是否将默认标题转为大写；有自定义 Header 时忽略；iOS 上由 SwiftUI Form 列表样式决定大小写。 |
| `disabled` / `hidden` / `modifiers` / 生命周期回调 / `style` / `testID` | 与通用容器类似 | 控制该分区本身。 |

`FieldGroup.SectionHeader` 和 `FieldGroup.SectionFooter` 以 `children` 指定标题 / 页脚内容。`FieldGroup.getFieldItemPosition(index, total)` 返回 `FieldItemPosition`，帮助根据一段中的行顺序决定圆角位置；结果取 `'leading'`、`'middle'`、`'trailing'`、`'only'` 之一。

### 新手术语

- **Field / 表单字段**：一行设置或输入项，例如开关、选择器、文本框。
- **Section（分区）**：把同类字段归在一起的列表区块。
- **插槽（slot）**：在组件预留的位置放自定义 React 内容；这里可以自定义标题和页脚。
- **隐式分区**：没有显式创建 `FieldGroup.Section` 时，容器自动把直接子项作为一个分区。
- **有界高度**：父容器明确提供可计算的高度；滚动容器需要这个边界来判断哪些内容可见。

## 源页代码主题覆盖

已覆盖四种安装命令和官方两种表单示例：分组设置行、自定义 SectionHeader / SectionFooter 槽位；父 FieldGroup、Section 的组件关系与常用属性均有说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/fieldgroup/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/fieldgroup/)

**翻页：**[上一页：Universal Column](./114-Universal-Column.md) · [目录](./README.md) · [下一页：Universal Host](./116-Universal-Host.md)
