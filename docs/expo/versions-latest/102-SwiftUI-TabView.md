# 102｜SwiftUI TabView

**翻页：**[上一页：SwiftUI SwipeActions](./101-SwiftUI-SwipeActions.md) · [目录](./README.md) · [下一页：SwiftUI Text](./103-SwiftUI-Text.md)

**官方页面：**[SwiftUI TabView · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/tabview/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/tabview/)推荐 `~56.0.26`。TabView 支持 iOS、tvOS，可在 Expo Go 中使用。若是在 Expo Router 中为完整页面建立路由式底部标签，应使用官方提及的 `expo-router/unstable-native-tabs`，TabView 更适合单个组件内部的分页或选项视图。

## SwiftUI 页面分页或标签页

`TabView` 根据样式切换页面或 tab bar：

- `tabViewStyle({ type: 'page' })`：可横向滑动的分页器。
- `tabViewStyle({ type: 'automatic' })`：SwiftUI 默认标签栏。
- `tabViewStyle({ type: 'sidebarAdaptable' })`：iPad 侧栏 / iPhone 底部栏样式。

每个 `<TabView.Tab>` 用 `value` 唯一标记。TabView 不自动决定高度，应由 modifier 或父容器设置尺寸。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 可滑动分页

`defaultSelection` 让 SwiftUI 原生容器管理当前页并设置初始页面。此例给每页 320 点固定高度：

~~~tsx
import {
  Host,
  Spacer,
  TabView,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  background,
  font,
  foregroundStyle,
  frame,
  tabViewStyle,
} from '@expo/ui/swift-ui/modifiers';

const fillFrame = frame({
  maxWidth: Infinity,
  maxHeight: Infinity,
});
const pageFrame = frame({ minHeight: 320, maxHeight: 320 });

export default function PagerExample() {
  return (
    <Host style={{ flex: 1 }}>
      <TabView
        defaultSelection="1"
        modifiers={[pageFrame, tabViewStyle({ type: 'page' })]}>
        <TabView.Tab value="0">
          <Page label="Page 1" color="#6200EE" />
        </TabView.Tab>
        <TabView.Tab value="1">
          <Page label="Page 2" color="#03DAC5" />
        </TabView.Tab>
        <TabView.Tab value="2">
          <Page label="Page 3" color="#FF5722" />
        </TabView.Tab>
      </TabView>
    </Host>
  );
}

function Page({ label, color }: { label: string; color: string }) {
  return (
    <VStack alignment="center" modifiers={[fillFrame, background(color)]}>
      <Spacer />
      <Text
        modifiers={[
          font({ size: 28, weight: 'bold' }),
          foregroundStyle('#FFFFFF'),
        ]}>
        {label}
      </Text>
      <Spacer />
    </VStack>
  );
}
~~~

## 用 React state 控制所选 Tab

传 `selection` 和 `onSelectionChange` 时 TabView 成为受控组件。JS 端改变 selection 可用 `animation` modifier 让切换带动画：

~~~tsx
import { useState } from 'react';
import {
  Button,
  Host,
  Spacer,
  TabView,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  animation,
  Animation,
  background,
  font,
  foregroundStyle,
  frame,
  tabViewStyle,
} from '@expo/ui/swift-ui/modifiers';

const fillFrame = frame({
  maxWidth: Infinity,
  maxHeight: Infinity,
});
const pageFrame = frame({ minHeight: 320, maxHeight: 320 });

export default function ControlledTabViewExample() {
  const [selected, setSelected] = useState('0');

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <Text>Selected: {selected}</Text>
        <Button label="Go to page 3" onPress={() => setSelected('2')} />
        <TabView
          selection={selected}
          onSelectionChange={setSelected}
          modifiers={[
            pageFrame,
            tabViewStyle({ type: 'page' }),
            animation(Animation.default, Number(selected)),
          ]}>
          <TabView.Tab value="0">
            <Page label="Page 1" color="#6200EE" />
          </TabView.Tab>
          <TabView.Tab value="1">
            <Page label="Page 2" color="#03DAC5" />
          </TabView.Tab>
          <TabView.Tab value="2">
            <Page label="Page 3" color="#FF5722" />
          </TabView.Tab>
        </TabView>
      </VStack>
    </Host>
  );
}

function Page({ label, color }: { label: string; color: string }) {
  return (
    <VStack alignment="center" modifiers={[fillFrame, background(color)]}>
      <Spacer />
      <Text
        modifiers={[
          font({ size: 28, weight: 'bold' }),
          foregroundStyle('#FFFFFF'),
        ]}>
        {label}
      </Text>
      <Spacer />
    </VStack>
  );
}
~~~

## 分页圆点样式

对 page 样式，`indexDisplayMode` 控制圆点指标是否显示，`indexViewStyle` 控制圆点背后的胶囊背景：

~~~tsx
import {
  Host,
  Spacer,
  TabView,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  background,
  font,
  foregroundStyle,
  frame,
  indexViewStyle,
  tabViewStyle,
} from '@expo/ui/swift-ui/modifiers';

const fillFrame = frame({
  maxWidth: Infinity,
  maxHeight: Infinity,
});
const pageFrame = frame({ minHeight: 320, maxHeight: 320 });

export default function PageIndicatorExample() {
  return (
    <Host style={{ flex: 1 }}>
      <TabView
        modifiers={[
          pageFrame,
          tabViewStyle({
            type: 'page',
            indexDisplayMode: 'always',
          }),
          indexViewStyle({ backgroundDisplayMode: 'always' }),
        ]}>
        <TabView.Tab value="0">
          <Page label="Page 1" color="#4F8DF6" />
        </TabView.Tab>
        <TabView.Tab value="1">
          <Page label="Page 2" color="#34C759" />
        </TabView.Tab>
        <TabView.Tab value="2">
          <Page label="Page 3" color="#FF9F0A" />
        </TabView.Tab>
      </TabView>
    </Host>
  );
}

function Page({ label, color }: { label: string; color: string }) {
  return (
    <VStack alignment="center" modifiers={[fillFrame, background(color)]}>
      <Spacer />
      <Text
        modifiers={[
          font({ size: 28, weight: 'bold' }),
          foregroundStyle('#FFFFFF'),
        ]}>
        {label}
      </Text>
      <Spacer />
    </VStack>
  );
}
~~~

## 原生底部 Tab bar

使用 `tabViewStyle({ type: 'automatic' })`，每个 Tab 的 `label` 和 `systemImage` 组成系统栏项目，`badge('3')` 可添加徽标：

~~~tsx
import { useState } from 'react';
import {
  Host,
  Spacer,
  TabView,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  background,
  badge,
  font,
  foregroundStyle,
  frame,
  tabViewStyle,
} from '@expo/ui/swift-ui/modifiers';

const fillFrame = frame({
  maxWidth: Infinity,
  maxHeight: Infinity,
});

export default function BottomTabsExample() {
  const [selected, setSelected] = useState('inbox');

  return (
    <Host style={{ flex: 1 }}>
      <TabView
        selection={selected}
        onSelectionChange={setSelected}
        modifiers={[tabViewStyle({ type: 'automatic' })]}>
        <TabView.Tab
          value="inbox"
          label="Inbox"
          systemImage="tray.fill"
          modifiers={[badge('3')]}>
          <Page label="Inbox" color="#4F8DF6" />
        </TabView.Tab>
        <TabView.Tab
          value="sent"
          label="Sent"
          systemImage="paperplane.fill">
          <Page label="Sent" color="#34C759" />
        </TabView.Tab>
        <TabView.Tab
          value="drafts"
          label="Drafts"
          systemImage="square.and.pencil">
          <Page label="Drafts" color="#FF9F0A" />
        </TabView.Tab>
      </TabView>
    </Host>
  );
}

function Page({ label, color }: { label: string; color: string }) {
  return (
    <VStack alignment="center" modifiers={[fillFrame, background(color)]}>
      <Spacer />
      <Text
        modifiers={[
          font({ size: 28, weight: 'bold' }),
          foregroundStyle('#FFFFFF'),
        ]}>
        {label}
      </Text>
      <Spacer />
    </VStack>
  );
}
~~~

## API 速查

| 属性 / 子组件 | 类型 | 说明 |
| --- | --- | --- |
| `TabView.Tab.value` | `string` | 标识某个 tab；也用于和父级 selection 匹配。 |
| `TabView.Tab.children` | React 元素或元素数组 | 所选 tab 的页面内容。 |
| `TabView.Tab.label` | `string`（可选） | Tab bar / Sidebar 中的标题。 |
| `TabView.Tab.systemImage` | SF Symbol 名称（可选） | 与标题一起显示的系统图标。 |
| `TabView.children` | `TabView.Tab` 元素 | 定义可选页面。 |
| `defaultSelection` | `string`（可选） | 非受控模式的初始值；传 `selection` 时忽略。 |
| `selection` | `string`（可选） | 当前选中项；与 `onSelectionChange` 配对使用以受控。 |
| `onSelectionChange` | `(selection: string) => void`（可选） | 用户切换页面时回调。 |

### 新手术语

- **分页 TabView**：在一个局部区域滑动切换几页内容。
- **受控 / 非受控选择**：受控模式由 React state 决定；非受控模式传 `defaultSelection` 后由原生视图管理选择状态。
- **Expo Router 原生标签页**：针对全屏路由的底部导航方案；TabView 不负责完整页面的路由栈。

## 源页代码主题覆盖

已覆盖四种安装命令和官方四类示例：滑动分页、React 受控选择、分页圆点样式、原生底部 Tab bar 及 badge。Tab / TabView 标识、选中态与建议使用 Router 原生 tabs 的场景已说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/tabview/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/tabview/)

**翻页：**[上一页：SwiftUI SwipeActions](./101-SwiftUI-SwipeActions.md) · [目录](./README.md) · [下一页：SwiftUI Text](./103-SwiftUI-Text.md)
