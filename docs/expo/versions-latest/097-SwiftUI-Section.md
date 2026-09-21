# 097｜SwiftUI Section

**翻页：**[上一页：SwiftUI ScrollView](./096-SwiftUI-ScrollView.md) · [目录](./README.md) · [下一页：SwiftUI SecureField](./098-SwiftUI-SecureField.md)

**官方页面：**[SwiftUI Section · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/section/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/section/)推荐 `~56.0.21`。Section 支持 iOS、tvOS，并可在 Expo Go 使用。可折叠 Section 需要 iOS / tvOS 17+、List `sidebar` 样式，且不支持 footer。

## 将表单或列表内容分组

`Section` 是 SwiftUI 的内容分组容器，常放在 `List`、`Form` 或 `Picker` 中。它可以有简单文本 `title`，也可以用 `header` / `footer` 传入自定义视图。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 带标题的基本分组

~~~tsx
import { Host, List, Section, Text } from '@expo/ui/swift-ui';

export default function BasicSectionExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section title="Settings">
          <Text>General</Text>
          <Text>Privacy</Text>
          <Text>Notifications</Text>
        </Section>
      </List>
    </Host>
  );
}
~~~

## 自定义 header 与 footer

使用 `header` / `footer` 传 React 元素；它们只有在未提供 `title` 时才使用：

~~~tsx
import {
  Host,
  List,
  Section,
  Toggle,
  Text,
  HStack,
  Image,
} from '@expo/ui/swift-ui';
import { useState } from 'react';

export default function CustomHeaderFooterExample() {
  const [locationEnabled, setLocationEnabled] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section
          header={
            <HStack>
              <Image systemName="location.fill" color="blue" size={16} />
              <Text>Location Services</Text>
            </HStack>
          }
          footer={
            <Text>
              Enabling location services allows the app to provide personalized recommendations.
            </Text>
          }>
          <Toggle
            label="Enable location"
            isOn={locationEnabled}
            onIsOnChange={setLocationEnabled}
          />
        </Section>
      </List>
    </Host>
  );
}
~~~

## 可折叠 Sidebar 分组

提供 `isExpanded` 后，Section 变成可展开 / 收起分组；用 `onIsExpandedChange` 同步 React 状态。可折叠样式只适用于 List 的 `sidebar` style，并且 footer 不支持：

~~~tsx
import { useState } from 'react';
import { Host, List, Section, Text } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';

export default function CollapsibleSectionExample() {
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);
  const [recentsExpanded, setRecentsExpanded] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[listStyle('sidebar')]}>
        <Section
          title="Favorites"
          isExpanded={favoritesExpanded}
          onIsExpandedChange={setFavoritesExpanded}>
          <Text>Home</Text>
          <Text>Work</Text>
          <Text>Gym</Text>
        </Section>
        <Section
          title="Recents"
          isExpanded={recentsExpanded}
          onIsExpandedChange={setRecentsExpanded}>
          <Text>Coffee Shop</Text>
          <Text>Library</Text>
          <Text>Park</Text>
        </Section>
      </List>
    </Host>
  );
}
~~~

## 在 Form 中组合多个 Section

一个 Form 可以包含多个有不同目的的分组；Picker 的 menu style 用 tag 索引来保存选择：

~~~tsx
import { useState } from 'react';
import {
  Host,
  Form,
  Section,
  Toggle,
  Picker,
  Text,
  Button,
} from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

export default function FormSectionsExample() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState(0);
  const languages = ['English', 'Spanish', 'French', 'German'];

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section title="Appearance">
          <Toggle
            label="Dark Mode"
            isOn={darkMode}
            onIsOnChange={setDarkMode}
          />
          <Picker
            label="Language"
            selection={language}
            onSelectionChange={setLanguage}
            modifiers={[pickerStyle('menu')]}>
            {languages.map((lang, index) => (
              <Text key={index} modifiers={[tag(index)]}>
                {lang}
              </Text>
            ))}
          </Picker>
        </Section>
        <Section title="Notifications">
          <Toggle
            label="Push Notifications"
            isOn={notifications}
            onIsOnChange={setNotifications}
          />
        </Section>
        <Section title="Account">
          <Button
            label="Sign out"
            role="destructive"
            onPress={() => alert('Signed out')}
          />
        </Section>
      </Form>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 版本 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 分组内容。 |
| `title` | `string`（可选） | 简单文本标题。提供后，自定义 `header`、`footer` 不用于当前 Section header/footer。 |
| `header` | `React.ReactNode`（可选） | 自定义标题视图；仅在未提供 `title` 时使用。 |
| `footer` | `React.ReactNode`（可选） | 自定义页脚说明；折叠分组不支持 footer。 |
| `isExpanded` | `boolean`（可选；iOS/tvOS 17+） | 展开状态；只有 List `sidebar` 样式支持折叠。 |
| `onIsExpandedChange` | `(isExpanded: boolean) => void`（可选；iOS/tvOS 17+） | 折叠状态变化时调用。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **Section / 分组**：把列表或表单相关选项归类，通常搭配标题。
- **Header / Footer**：分组上方的标题区域 / 下方的说明区域。
- **Sidebar List**：SwiftUI List 的侧栏呈现样式；可折叠 Section 只在该样式中可用。

## 源页代码主题覆盖

已覆盖四种安装命令和官方四类示例：基本标题分组、自定义 header / footer、sidebar 折叠区块、Form 多分区表单；并记录折叠 section 的 iOS / tvOS 17+ 与 sidebar 样式限制。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/section/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/section/)

**翻页：**[上一页：SwiftUI ScrollView](./096-SwiftUI-ScrollView.md) · [目录](./README.md) · [下一页：SwiftUI SecureField](./098-SwiftUI-SecureField.md)
