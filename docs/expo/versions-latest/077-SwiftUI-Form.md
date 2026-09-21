# 077｜SwiftUI Form

**翻页：**[上一页：SwiftUI Divider](./076-SwiftUI-Divider.md) · [目录](./README.md) · [下一页：SwiftUI Gauge](./078-SwiftUI-Gauge.md)

**官方页面：**[SwiftUI Form · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/form/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/form/)推荐 `~56.0.26`。`Form` 支持 iOS、tvOS，可在 Expo Go 中使用。`scrollDisabled` modifier 只适用于 iOS 16+ / tvOS 16+。

## 原生表单容器

`Form` 是 SwiftUI 的原生表单容器，用于把输入控件组织成设置页或检查面板的布局。它提供平台风格的背景、分组与滚动行为；`Section` 将相关字段归在一起。它和网页的 `<form>` 用途接近，但不会自动提交 Web 表单或替代业务校验。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 最小表单

~~~tsx
import { Host, Form, TextField } from '@expo/ui/swift-ui';

export default function BasicFormExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <TextField placeholder="Enter your name" />
      </Form>
    </Host>
  );
}
~~~

## 用 Section 分组控件

下面将个人资料、偏好设置和保存动作分成独立 Section。`Toggle` 通过 React state 记录开关状态：

~~~tsx
import { useState } from 'react';
import {
  Host,
  Form,
  Section,
  TextField,
  Toggle,
  Button,
} from '@expo/ui/swift-ui';

export default function FormWithSectionsExample() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section title="Profile">
          <TextField placeholder="Name" />
          <TextField placeholder="Email" />
        </Section>

        <Section title="Preferences">
          <Toggle
            label="Enable notifications"
            isOn={notifications}
            onIsOnChange={setNotifications}
          />
          <Toggle
            label="Dark mode"
            isOn={darkMode}
            onIsOnChange={setDarkMode}
          />
        </Section>
        <Section>
          <Button
            label="Save changes"
            onPress={() => console.log('Saved!')}
          />
        </Section>
      </Form>
    </Host>
  );
}
~~~

## 自定义表单背景

`scrollContentBackground('hidden')` 隐藏系统滚动内容背景，再用 `background` 设置自己的颜色：

~~~tsx
import { Host, Form, Section, TextField } from '@expo/ui/swift-ui';
import {
  scrollContentBackground,
  background,
} from '@expo/ui/swift-ui/modifiers';

export default function FormBackgroundExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Form
        modifiers={[
          scrollContentBackground('hidden'),
          background('#F0F0F0'),
        ]}>
        <Section title="Custom Background">
          <TextField placeholder="Enter text" />
        </Section>
      </Form>
    </Host>
  );
}
~~~

## 禁止表单滚动

使用 `scrollDisabled()` 阻止 Form 滚动。该 modifier 仅适用于 iOS 16 及以上、tvOS 16 及以上：

~~~tsx
import { useState } from 'react';
import {
  Host,
  Form,
  Section,
  TextField,
  Toggle,
} from '@expo/ui/swift-ui';
import { scrollDisabled } from '@expo/ui/swift-ui/modifiers';

export default function NonScrollableFormExample() {
  const [isOn, setIsOn] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Form modifiers={[scrollDisabled()]}>
        <Section title="Settings">
          <Toggle
            label="Enable feature"
            isOn={isOn}
            onIsOnChange={setIsOn}
          />
        </Section>
      </Form>
    </Host>
  );
}
~~~

## 添加下拉刷新

`refreshable` 接收异步刷新回调；原生表单出现拉动刷新手势时会运行它。这里用延时模拟请求，再记录最近刷新时间：

~~~tsx
import { useCallback, useState } from 'react';
import { Host, Form, Section, Text } from '@expo/ui/swift-ui';
import { refreshable } from '@expo/ui/swift-ui/modifiers';

export default function RefreshableFormExample() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = useCallback(async () => {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastRefresh(new Date());
  }, []);

  return (
    <Host style={{ flex: 1 }}>
      <Form modifiers={[refreshable(handleRefresh)]}>
        <Section title="Pull to refresh">
          <Text>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </Text>
        </Section>
      </Form>
    </Host>
  );
}
~~~

## API 与术语

`Form` 从 `@expo/ui/swift-ui` 导入，主要属性为 `children: React.ReactNode`，即表单中放置的控件内容；还继承 `CommonViewModifierProps`。

- **表单容器**：提供系统原生表单布局与交互外观的父视图。
- **Section**：相关表单控件的分组，可以通过标题说明本组用途。
- **scrollContentBackground**：控制滚动区域背后的默认系统背景。
- **scrollDisabled**：关闭容器滚动；会受系统版本限制。
- **refreshable**：把下拉刷新手势与异步回调关联起来；实际网络请求仍需由应用代码实现。

## 源页代码主题覆盖

已覆盖四种安装命令和官方五种表单代码示例：最小输入表单、多个 Section 分组、自定义背景、禁止滚动与下拉刷新。表单 / Section 组件结构及平台版本限制在正文中说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/form/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/form/)

**翻页：**[上一页：SwiftUI Divider](./076-SwiftUI-Divider.md) · [目录](./README.md) · [下一页：SwiftUI Gauge](./078-SwiftUI-Gauge.md)
