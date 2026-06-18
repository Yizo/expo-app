> 原文地址：https://docs.expo.dev/router/advanced/custom-navigators

# 自定义导航器（Custom Navigators）

本文档介绍如何在 Expo Router 中构建自定义导航组件，以及如何集成第三方导航库。

---

> **警告：此功能目前处于 Alpha 阶段，需要 SDK 56 或更高版本。**
>
> 该 API 可能会发生破坏性变更（breaking changes）。在生产环境中使用时请谨慎，建议在升级前仔细阅读更新日志。

## 概述

Expo Router 提供了常见的导航模式，如堆栈（Stack）、抽屉（Drawer）和标签页（Tabs）。但在某些场景下，你可能需要自定义导航布局——例如自定义底部标签栏、侧边栏切换器、或其他独特的导航交互方式。

自定义导航器支持以下核心能力：

- **深度链接（Deep Linking）**：自定义导航器中的路由可以正常响应外部链接跳转。
- **类型化路由（Typed Routes）**：与框架内置导航器一样享受路由类型检查。
- **基于文件的路由发现（File-based Discovery）**：路由仍然由文件系统自动发现，无需手动注册。

### 关键术语说明（面向初学者）

| 术语 | 英文 | 说明 |
|------|------|------|
| 导航器 | Navigator | 管理多个屏幕之间切换逻辑的组件。例如 Tabs 导航器负责在多个标签页之间切换。 |
| 路由 | Route | 应用中的一个页面路径，通常与文件系统中的文件一一对应。 |
| 描述符 | Descriptor | 包含某个路由的渲染函数、配置选项等元信息的对象，导航器通过它来渲染对应的屏幕。 |
| 路由器 | Router | 定义导航状态如何变化的底层逻辑，例如 `TabRouter` 定义了标签页切换的行为规则。 |
| 深度链接 | Deep Linking | 通过 URL 直接跳转到应用内部的某个特定页面。 |
| 事件派发器 | Emitter / Event Dispatcher | 用于在导航器内部触发和监听自定义事件的机制。 |

---

## 在应用内创建自定义导航器

Expo Router 提供了 `unstable_createStandardRouterNavigator` 钩子来创建自定义导航器。该钩子接收两个核心参数：

1. **UI 组件**：负责渲染导航界面（如标签栏、侧边栏等）。
2. **路由行为（Router）**：定义导航状态如何变化（如 `TabRouter` 定义了标签页切换逻辑）。

### 完整示例：自定义标签栏

```tsx
import {
  unstable_createStandardRouterNavigator,
  TabRouter,
  type NavigatorContentProps,
} from 'expo-router';
import { Pressable, Text, View } from 'react-native';

// 第一个类型参数是每个屏幕可以设置的选项（options）
type TabsContentProps = NavigatorContentProps<{ title?: string }>;

function TabsContent({ state, descriptors, actions }: TabsContentProps) {
  // 获取当前聚焦的路由
  const focusedRoute = state.routes[state.index];

  return (
    <View style={{ flex: 1 }}>
      {/* 渲染当前聚焦路由对应的屏幕 */}
      <View style={{ flex: 1 }}>{descriptors[focusedRoute.key].render()}</View>

      {/* 一个简单的标签栏 */}
      <View style={{ flexDirection: 'row' }}>
        {state.routes.map(route => (
          <Pressable
            key={route.key}
            style={{ flex: 1, padding: 16 }}
            onPress={() => actions.navigate(route.name)}>
            <Text>{descriptors[route.key].options.title ?? route.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// 使用 TabRouter 创建自定义标签导航器
export const Tabs = unstable_createStandardRouterNavigator(TabsContent, TabRouter);
```

### 在布局文件中使用

创建完成后，导出的导航器对象包含一个 `Screen` 属性，用于在布局文件中声明路由：

```tsx
import { Tabs } from '../components/Tabs';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

> **基于经验建议**：虽然上面的示例使用了简单的 `Pressable` + `Text` 来构建标签栏，但在实际项目中，你可能需要使用 `Animated`、`Reanimated` 或其他动画库来实现更丰富的切换效果和视觉反馈。

---

## 接收的属性（Props）详解

自定义导航器的 UI 组件会接收以下四个核心属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `state` | 对象 | 包含当前导航状态，如路由索引（`index`）、路由列表（`routes`）、每个路由的 `key` 和参数（`params`）等。 |
| `descriptors` | 映射 | 以路由 `key` 为键的映射对象，每个值包含该路由的渲染函数（`render()`）和已解析的配置选项（`options`）。 |
| `actions` | 对象 | 提供导航操作函数，如 `navigate`（跳转到指定路由）等。 |
| `emitter` | 对象 | 事件派发器，用于触发自定义事件。 |

> **基于文档内容推导**：`descriptors[route.key].render()` 是渲染对应屏幕的核心方法，调用它会返回该路由对应的 React 元素。而 `descriptors[route.key].options` 包含了用户在 `<Tabs.Screen>` 中通过 `options` 传入的配置。

---

## 类型化事件（Typed Events）

你可以通过 `NavigatorContentProps` 的第二个类型参数来定义自定义事件，从而实现事件载荷（payload）的类型安全。

每个事件的键（key）代表事件名称，值是一个对象，包含：
- `data`：事件携带的数据类型
- `canPreventDefault`：是否允许调用 `preventDefault()` 阻止默认行为

```tsx
type TabsContentProps = NavigatorContentProps<
  { title?: string },
  { tabPress: { data: undefined; canPreventDefault: true } }
>;

function TabsContent({ emitter }: TabsContentProps) {
  // 触发一个可阻止默认行为的 tabPress 事件
  emitter.emit({ type: 'tabPress', canPreventDefault: true });
  // ...
}
```

> **基于经验建议**：类型化事件在构建复杂交互时非常有用。例如，你可以在用户点击某个标签时触发 `tabPress` 事件，并通过 `canPreventDefault` 机制来决定是否阻止默认的跳转行为（如表单未保存时弹出确认对话框）。

`unstable_createStandardRouterNavigator` 会自动推断事件映射类型，通常无需手动声明。

---

## 配置选项

`unstable_createStandardRouterNavigator` 的第三个参数接受一个配置对象，支持以下选项：

### `useOnlyUserDefinedScreens`

当设置为 `true` 时，导航器将仅渲染通过 `<Tabs.Screen>` 显式声明的路由，忽略文件系统自动发现的其他路由。

### `createProps`

允许你基于原始导航状态注入自定义属性到 UI 组件中。

```tsx
export const Tabs = unstable_createStandardRouterNavigator(TabsContent, TabRouter, {
  useOnlyUserDefinedScreens: true,
  createProps: ({ state, dispatch }) => ({
    // 注入当前活跃路由的 key
    activeRouteKey: state.routes[state.index].key,
    // 注入一个预加载函数
    preload: (name: string) => dispatch({ type: 'PRELOAD', payload: { name } }),
  }),
});
```

当使用 `createProps` 注入自定义属性时，需要在 `NavigatorContentProps` 的第三个类型参数中声明它们：

```tsx
type TabsContentProps = NavigatorContentProps<
  { title?: string },
  // 本示例中没有自定义事件
  Record<string, never>,
  // 由 createProps 注入的属性
  { activeRouteKey: string; preload: (name: string) => void }
>;

function TabsContent({ activeRouteKey, preload }: TabsContentProps) {
  // 可以直接使用 activeRouteKey 和 preload
  // ...
}
```

> **注意**：官方文档建议优先使用 `state` 和 `actions` 属性，而非直接使用原始状态（raw state）。原始状态属于内部实现细节，可能在后续版本中发生变化。

> **基于经验建议**：`createProps` 适合用于封装可复用的导航逻辑。例如，你可以在这里统一处理路由预加载、路由动画触发等逻辑，让 UI 组件保持简洁。

---

## 库集成（Library Integration）

如果你是一个**包维护者**（package maintainer），希望构建一个可以跨框架使用的导航组件库，Expo Router 提供了框架无关（framework-agnostic）的集成方案。

### 核心思路

将 UI 组件与特定框架解耦，维护一个统一的逻辑核心，然后针对不同框架提供各自的入口文件。

### 第一步：创建框架无关的导航器

使用 `standard-navigation` 包中的 `createStandardNavigator` 函数（而非 Expo Router 的专用钩子）：

```tsx
import { createStandardNavigator } from 'standard-navigation';
import { TabsContent } from './TabsContent';

// 框架无关：此导航器遵循标准导航协议，不绑定任何特定宿主框架
// 第一个类型参数是每个屏幕的选项类型；第二个是事件映射
export const navigator = createStandardNavigator<
  { title?: string },
  { tabPress: { data: undefined; canPreventDefault: true } }
>(TabsContent);
```

### 第二步：在 Expo Router 中连接

使用 `unstable_integrateWithRouter` 钩子将框架无关的导航器连接到 Expo Router：

```tsx
import { unstable_integrateWithRouter, TabRouter } from 'expo-router';
import { navigator } from './index';

export const Tabs = unstable_integrateWithRouter(navigator, TabRouter);
```

此函数返回的对象与 `unstable_createStandardRouterNavigator` 返回的对象具有相同的 `Screen` 属性和配置选项。

> **基于文档内容推导**：`unstable_integrateWithRouter` 和 `unstable_createStandardRouterNavigator` 的最终产出是等价的——都返回带有 `Screen` 属性的导航器对象。区别在于：前者适用于已有框架无关导航器核心逻辑的库作者；后者适用于仅在 Expo Router 中使用的应用开发者。

### 第三步：配置包入口点

为了让消费者能够针对不同框架导入正确的集成文件，需要在 `package.json` 中配置子路径导出（subpath exports）：

```json
{
  "exports": {
    ".": {
      "types": "./lib/typescript/index.d.ts",
      "default": "./lib/module/index.js"
    },
    "./react-navigation": {
      "types": "./lib/typescript/react-navigation.d.ts",
      "default": "./lib/module/react-navigation.js"
    },
    "./expo-router": {
      "types": "./lib/typescript/expo-router.d.ts",
      "default": "./lib/module/expo-router.js"
    }
  }
}
```

这样，用户可以按需导入对应框架的集成：

- 核心逻辑（框架无关）：`import { navigator } from 'your-lib'`
- Expo Router 集成：`import { Tabs } from 'your-lib/expo-router'`
- React Navigation 集成：`import { Tabs } from 'your-lib/react-navigation'`

> **基于经验建议**：这种架构设计非常适合需要同时支持 React Navigation 和 Expo Router 的开源导航组件库。通过将 UI 和交互逻辑集中在核心模块中，你可以避免为每个框架维护独立的代码副本，降低维护成本。

---

## 重要提醒与限制

1. **Alpha 状态**：所有带 `unstable_` 前缀的 API 均表示该功能尚未稳定，后续版本可能会发生破坏性变更。在生产项目中使用时，建议锁定 Expo SDK 版本并在升级前充分测试。

2. **应用开发者 vs. 库作者**：
   - 如果你只是在自己的应用中使用自定义导航器，直接使用 `unstable_createStandardRouterNavigator` 即可。
   - 如果你要发布一个供他人使用的导航组件库，请使用 `standard-navigation` + `unstable_integrateWithRouter` 的框架无关方案。

3. **优先使用高层 API**：文档明确建议优先使用 `state` 和 `actions` 属性，避免直接操作原始状态（raw state），因为原始状态的内部结构可能在未来版本中改变。

4. **类型安全**：充分利用 `NavigatorContentProps` 的三个类型参数来确保选项、事件和注入属性的类型安全，这在大型项目中尤为重要。

> **基于经验建议**：在决定是否使用自定义导航器之前，先评估内置的 Stack、Tabs、Drawer 是否已经能满足需求。自定义导航器虽然灵活，但意味着你需要自行处理更多的边界情况（如动画过渡、无障碍访问、键盘导航等）。

---

## 文档导航

- **上一页**：[custom tabs](./72__custom-tabs.md)
- **下一页**：[stack toolbar](./74__stack-toolbar.md)
