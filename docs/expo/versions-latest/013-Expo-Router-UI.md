# 013｜Expo Router UI：自定义 Tab Layout

**翻页：**[上一页：Expo Router Stack](./012-Stack.md) · [目录](./README.md) · [下一页：Expo UI 概览](./014-Expo-UI概览.md)

**官方页面：**[Expo Router UI](https://docs.expo.dev/versions/latest/sdk/router/ui/)

**版本边界：**Latest reference 推荐 Expo Router ~57.0.19；SDK v56 exact reference [Router UI](https://docs.expo.dev/versions/v56.0.0/sdk/router/ui/) 推荐 ~56.2.21，确认这组组件在 SDK56 也有记录。当前项目 Expo ~56.0.11；请按已安装版本校对。

## Headless Tabs 解决什么问题

默认 Expo Router Tabs navigator 提供系统导航栏，但如果设计需要自定义 tab 外观，可以从 expo-router/ui 导入 headless tab 组件：它管理 active route 和 tab 触发逻辑，把 route 当前页面放进 TabSlot；开发者自己渲染底部列表、圆形按钮、图片或任何其它 React UI。

它不同于 Stack Toolbar：Router UI 的 Tabs 是导航状态和 UI 触发的基础组件，不替你预设平台 tab bar 视觉。

## 安装与 Expo Router 插件

需要在项目中安装 expo-router。Expo 默认 template 已配置其 config plugin；若自建 app config，插件基本形状为：

```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

基础 tabs 使用四个常见部件：Tabs 是容器，TabSlot 渲染当前 route，TabList 收集触发器，TabTrigger 指向 route：

```tsx
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

export default function CustomTabs() {
  return (
    <Tabs>
      <TabSlot />
      <TabList>
        <TabTrigger name="home" href="/">
          Home
        </TabTrigger>
        <TabTrigger name="settings" href="/settings">
          Settings
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
```

TabTrigger 放在 TabList 里必须提供 href；它也定义 Tabs 中有哪些 route。TabTrigger 放在 TabList 之外可引用已有 tab，通常不需要再定义 href。

## 自己画 TabTrigger

TabList / Tabs / TabTrigger 支持 asChild：把 Router props 转交给自定义 Pressable，同时避免增加多余 View wrapper。以下例子把当前 route 放在 TabSlot，并使用自己的 pressable：

```tsx
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';

export default function CustomTabs() {
  return (
    <Tabs>
      <View style={{ flex: 1 }}>
        <TabSlot />
      </View>
      <TabList asChild>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TabTrigger name="home" href="/" asChild>
            <Pressable accessibilityRole="tab">
              <Text>Home</Text>
            </Pressable>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <Pressable accessibilityRole="tab">
              <Text>Settings</Text>
            </Pressable>
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}
```

TabTrigger 可通过 resetOnFocus 在用户切回 tab 时重置其路由。TabSlot 的 detachInactiveScreens 会卸载非当前 screen；renderFn 可覆写当前 screen 的渲染方式。

## Hooks：自行组合导航树

- useTabSlot(options) 返回当前 active tab 对应的 React element，可放进手写页面壳。
- useTabsWithChildren({ children }) 是 Tabs 的 Hook 版本；要渲染返回值中的 NavigationContent。
- useTabsWithTriggers({ triggers }) 用显式 ScreenTrigger 列表代替 children 定义 tabs。
- useTabTrigger(options) 把 tab 触发行为用于自定义按钮，返回 triggerProps、trigger、getTrigger 和 switchTab。

将路由 slot 与自己的页面边框放在一起：

```tsx
import { useTabSlot } from 'expo-router/ui';
import { View } from 'react-native';

export function MyTabSlot() {
  const activeScreen = useTabSlot();
  return <View style={{ flex: 1 }}>{activeScreen}</View>;
}
```

Hook 方式保留 children 驱动的 tabs：

```tsx
import { useTabsWithChildren } from 'expo-router/ui';
import { TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { Text } from 'react-native';

export function MyTabs({ children }: { children: React.ReactNode }) {
  const { NavigationContent } = useTabsWithChildren({
    children: (
      <>
        {children}
        <TabList>
          <TabTrigger name="home" href="/"><Text>Home</Text></TabTrigger>
        </TabList>
        <TabSlot />
      </>
    ),
  });

  return <NavigationContent />;
}
```

当触发列表保存在数据中时，useTabsWithTriggers 接受明确的 triggers：

```tsx
import { useTabsWithTriggers } from 'expo-router/ui';

export function ConfiguredTabs() {
  const { NavigationContent } = useTabsWithTriggers({
    triggers: [
      { name: 'home', href: '/' },
      { name: 'settings', href: '/settings' },
    ],
  });

  return <NavigationContent />;
}
```

自定义 tab button 也可用 useTabTrigger 获取 pressable props；switchTab 的 options 可携带 resetOnFocus：

```tsx
import { useTabTrigger } from 'expo-router/ui';
import { Pressable, Text } from 'react-native';

export function HomeButton() {
  const { triggerProps, switchTab } = useTabTrigger({ name: 'home', href: '/' });
  return (
    <Pressable
      {...triggerProps}
      onPress={(event) => {
        triggerProps.onPress?.(event);
        switchTab('home', { resetOnFocus: true });
      }}>
      <Text>Home</Text>
    </Pressable>
  );
}
```

## 组件属性与 Types

| API | 核心含义 | 常见属性 / 返回值 |
| --- | --- | --- |
| Tabs | headless tab navigator root | asChild、options（含 backBehavior）；也有 TabContext |
| TabList | 在导航 UI 中声明 tabs 的包裹器 | asChild 可转发到自定义容器 |
| TabSlot | 渲染当前 tab route | detachInactiveScreens、renderFn |
| TabTrigger | 触发切换 tab 的控件 | name、href、resetOnFocus、asChild |
| useTabSlot | 返回当前 route 的 ReactElement | 参数沿用 TabSlot props |
| useTabsWithChildren | 根据 children 建立 Tabs navigator | 返回 NavigationContent 与 navigation state |
| useTabsWithTriggers | 根据 ScreenTrigger[] 建立 navigator | 返回 NavigationContent；显式 triggers 是 options 属性 |
| useTabTrigger | 创建自定义 tab trigger | trigger / triggerProps、getTrigger(name)、switchTab(name, options) |

类型参考还列出 ExpoTabsNavigationProp、ExpoTabsNavigatorOptions、ExpoTabsNavigatorScreenOptions、ExpoTabsScreenOptions、TabsContextValue、TabsSlotRenderOptions、TabTriggerOptions、Trigger、UseTabsOptions、UseTabsWithChildrenOptions、UseTabsWithTriggersOptions 和 UseTabTriggerResult。Screen options 包含 lazy、freezeOnBlur、unmountOnBlur 等；TabNavigationEventMap 有 tabPress / tabLongPress；switchTab options 可以在切换时 reset route history。

以上组件与 Hooks 在 Android、iOS、tvOS、Web reference 均列出；具体 screen container 性能属性、Route 和 native component 能力仍依平台实现不同。

## 关键名词

- **Headless UI**：只提供交互和状态逻辑、不规定视觉皮肤的组件；Tab UI 可以完全自己设计。
- **TabList**：自定义 tab 导航条里声明可切换页面的容器。
- **TabTrigger**：以 name 和 href 把自定义按钮关联到一个 Router route。
- **TabSlot**：路由页面 outlet，展示当前选中的 tab screen。
- **NavigationContent**：Hook API 返回的 navigator 内容根组件。
- **asChild**：合并组件行为与自定义子元素，而不是多渲染一层 wrapper。

## 官方代码主题覆盖

源页每个代码主题都有重写示例：安装 / import expo-router/ui、app config plugin、Tabs / TabList / TabTrigger / TabSlot 基础组合、自定义 wrapper 的 asChild、slot 的 detachInactiveScreens / renderFn、useTabSlot、useTabsWithChildren、useTabsWithTriggers、useTabTrigger 和 switchTab。所有源页 Types family、backBehavior、resetOnFocus、tabPress / tabLongPress 事件和跨平台能力也归入上表说明。Latest 推荐版本 ~57.0.19；SDK56 精确页确认 Router UI API 存在，推荐版本 ~56.2.21。

## 下一页

页脚 **Next** 从 Expo Router 转到 [Expo UI overview](https://docs.expo.dev/versions/latest/sdk/ui/)，介绍由 React 组件调用 SwiftUI / Jetpack Compose 绘制的原生界面库。

**翻页：**[上一页：Expo Router Stack](./012-Stack.md) · [返回目录](./README.md) · [下一页：Expo UI 概览](./014-Expo-UI概览.md)
