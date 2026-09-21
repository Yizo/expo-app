# 075｜SwiftUI DisclosureGroup

**翻页：**[上一页：SwiftUI DatePicker](./074-SwiftUI-DatePicker.md) · [目录](./README.md) · [下一页：SwiftUI Divider](./076-SwiftUI-Divider.md)

**官方页面：**[SwiftUI DisclosureGroup · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/disclosuregroup/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/disclosuregroup/)列出 SDK 56 配套 `~56.0.15`。该组件仅支持 iOS，并可在 Expo Go 中使用。版本表中的“Recommended”与 SDK 56 页面写的“Bundled”含义不同，请使用 `npx expo install @expo/ui` 让工具按当前 SDK 选择依赖。

## 可展开和收起的内容组

`DisclosureGroup` 显示一个带展开指示器的标题；用户点标题后显示或隐藏其子内容。常放在 `Form` 里，获得系统设置页常见的列表和箭头样式。`isExpanded` 与 `onIsExpandedChange` 让 React 状态控制展开状态。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基础折叠组

~~~tsx
import { useState } from 'react';
import {
  DisclosureGroup,
  Form,
  Host,
  Section,
  Text,
} from '@expo/ui/swift-ui';

export default function BasicDisclosureGroupExample() {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <DisclosureGroup
            label="Advanced settings"
            isExpanded={isExpanded}
            onIsExpandedChange={setIsExpanded}>
            <Text>Auto-update apps</Text>
            <Text>App downloads</Text>
            <Text>Offload unused apps</Text>
          </DisclosureGroup>
        </Section>
      </Form>
    </Host>
  );
}
~~~

## 默认展开

将初始 state 设为 `true`，内容会在初次渲染时显示：

~~~tsx
import { useState } from 'react';
import { Host, DisclosureGroup, Text } from '@expo/ui/swift-ui';

export default function InitiallyExpandedExample() {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <Host style={{ flex: 1 }}>
      <DisclosureGroup
        label="Details"
        isExpanded={isExpanded}
        onIsExpandedChange={setIsExpanded}>
        <Text>This content is visible by default.</Text>
      </DisclosureGroup>
    </Host>
  );
}
~~~

## 自定义标题内容

若 `label` 字符串不足以表达复杂标题，可以用 `DisclosureGroup.Label` 包裹自定义 SwiftUI 内容，并对标题 Text 加 modifier：

~~~tsx
import { useState } from 'react';
import {
  DisclosureGroup,
  Form,
  Host,
  Section,
  Text,
} from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function CustomLabelDisclosureGroupExample() {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <DisclosureGroup
            isExpanded={isExpanded}
            onIsExpandedChange={setIsExpanded}>
            <DisclosureGroup.Label>
              <Text
                modifiers={[
                  font({ weight: 'semibold' }),
                  foregroundStyle('#0a7ea4'),
                ]}>
                Network options
              </Text>
            </DisclosureGroup.Label>
            <Text>Wi-Fi</Text>
            <Text>Bluetooth</Text>
            <Text>Cellular data</Text>
          </DisclosureGroup>
        </Section>
      </Form>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 展开后显示的子内容。 |
| `isExpanded` | `boolean`（可选） | 控制当前是否展开。 |
| `label` | `string`（可选） | 简单文本标题；复杂标题使用 `DisclosureGroup.Label`。 |
| `onIsExpandedChange` | `(isExpanded: boolean) => void`（可选） | 展开状态变化时调用，可直接传 React state setter。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **折叠组 / DisclosureGroup**：类似网页里的手风琴区域，收起时隐藏内容，展开时显示内容。
- **受控展开状态**：React state 保存展开值，用户点开合指示器后用回调同步新值。
- **Form / Section**：SwiftUI 表单容器和表单分组；在设置型页面里会提供系统列表布局。
- **自定义 label**：不用简单字符串，而是放入嵌套视图来自定义标题外观和内容。

## 源页代码主题覆盖

已覆盖四种安装命令与官方三种示例：Form 中的基础折叠组、初始展开的独立内容组，以及使用 `DisclosureGroup.Label` 和 modifiers 自定义标题。展开状态、标签和变化回调已列入 API 说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/disclosuregroup/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/disclosuregroup/)

**翻页：**[上一页：SwiftUI DatePicker](./074-SwiftUI-DatePicker.md) · [目录](./README.md) · [下一页：SwiftUI Divider](./076-SwiftUI-Divider.md)
