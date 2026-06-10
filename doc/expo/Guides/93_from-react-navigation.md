# 从 React Navigation 迁移到 Expo Router

## 文档解决的问题

本文说明如何把手工声明 Navigator、Screen 和 `NavigationContainer` 的 React Navigation 项目迁移为 Expo Router 的文件系统路由。

> **文档明确说明：** 本指南面向 SDK 56 及以上。SDK 56 开始，应用代码不能再直接从 `@react-navigation/*` 导入，示例使用 `expo-router/*` 入口。

Expo Router 保留 React Navigation 的能力，同时提供自动深链接、类型安全路由、延迟打包和 Web 静态渲染。若项目深度依赖自定义 `getPathFromState` 或 `getStateFromPath`，可能不适合迁移；仅用于共享路由时通常可由 Expo Router 内建能力替代。

## 迁移前整理

文档建议先完成以下重构：

- 每个 screen 组件拆成独立文件。
- 转为 TypeScript，便于迁移时发现类型错误。
- 把深层相对导入改为 `tsconfig` 路径别名，避免移动 screen 文件后大面积改路径。
- 逐步移除 `resetRoot`，重构导航，不再通过“重启应用”恢复状态。
- 把初始路由重命名为 `index`，使其对应 URL `/`。

### 参数必须可序列化

Expo Router 的搜索参数只适合顶层 `string`、`number`、`boolean` 等可序列化值。不要传函数、对象、Map 或完整业务实体。

React Navigation 中常见的“把回调函数作为 params 传给下一个页面”应改为让目标 screen 自己调用 Router，或只传实体 ID 后重新读取数据。

### 根 UI 应尽早渲染

不要在根组件等待字体或资源时长期 `return null`，也不要在此期间导航。React Native 0.72 起可先显示默认字体，再在自定义字体加载后替换；若必须隐藏文本，应只让对应 Text 包装组件返回 `null`。

Web 静态渲染时根组件返回 `null` 会让生成 HTML 没有可搜索内容，可通过查看页面源代码或禁用 JavaScript 验证。

## 基础配置与目录迁移

Expo Router 自动提供 `react-native-safe-area-context` 支持，但不会自动加入 `react-native-gesture-handler`。使用 Gesture Handler 或 Drawer 时需自行安装；文档建议避免在 Web 无条件引入它，以免增加不必要 JavaScript。

在项目根目录建立 `src/app`。Expo Router 会自动把它识别为路由根目录。

`tsconfig.json` 示例：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

`app.json` 需要插件：

```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

路由文件名推荐小写和 kebab-case。

## 从 Navigator 声明转为文件结构

React Navigation 中的 Navigator 层级改为目录和 `_layout.tsx`。例如根 Stack 中包含 Home Tabs、Profile、Settings，可迁移为：

```text
src/app/
  _layout.tsx
  (home)/
    _layout.tsx
    index.tsx
    feed.tsx
  profile.tsx
  settings.tsx
```

根布局：

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(home)" options={{ title: 'Home Screen' }} />
    </Stack>
  );
}
```

Tabs 子布局：

```tsx
import { Tabs } from 'expo-router';

export default function HomeLayout() {
  return <Tabs />;
}
```

关键变化是：路由名称和嵌套关系主要由文件路径决定，JSX 中的 `Screen` 更多用于配置，而不是注册任意组件。

## Hooks 与 Link 迁移

- screen 不再自动接收 `{ navigation, route }` props。
- 命令式路由跳转改用 `useRouter()`。
- 路由参数改用 `useLocalSearchParams()`。
- 需要底层 React Navigation `navigation` 对象时，使用 Expo Router 的 `useNavigation()`。
- Expo Router 的 `<Link>` 使用 `href`，不是 `to`。
- 自定义可点击子组件使用 `asChild`，通常不再需要 `useLinkProps`。

```tsx
// React Navigation
<Link to="Settings" />

// Expo Router
<Link href="/settings" />
```

嵌套页面导航改用完整路径：

```tsx
router.push({
  pathname: '/account/settings',
  params: { user: 'jane' },
});
```

## 多导航器共享 Screen

可使用共享路由组，也可创建多个路由文件并重新导出同一个组件。需要明确进入特定组时使用完整路径，例如 `/(home)/settings`，而不是模糊的 `/settings`。

## 替换 `NavigationContainer`

Expo Router 完全管理全局 `NavigationContainer`，应用不应再自行渲染它。

### Ref API 替代

| React Navigation API | Expo Router 替代 |
| --- | --- |
| `resetRoot` | `router.replace('/')`，文档仍建议从架构上减少重置需求。 |
| `getRootState` | `useRootNavigationState()` |
| `getCurrentRoute` | `usePathname()` 或 `useSegments()` |
| `getCurrentOptions` | `useLocalSearchParams()` |
| `ref` | `useNavigationContainerRef()` |

监听 `state` 可组合 `usePathname`/`useSegments` 与 `useEffect`；监听参数变化可组合 `useLocalSearchParams` 与 `useEffect`。

### Props 替代

- `initialState`：使用路由字符串和 Redirect；文档更推荐深链接，而不是恢复完整导航状态。
- `onStateChange`：观察 `usePathname`、`useSegments`、`useGlobalSearchParams`。
- `onReady`：通常无需替代，Expo Router 可假定导航已可用；分析和 Splash Screen 有专门机制。
- `onUnhandledAction`：使用动态路由与 404 页面。
- `linking`：根据 `app` 文件结构自动生成。
- `fallback`：由 Expo Router/Splash Screen 自动处理。
- `children`：由文件路由和当前 URL 自动生成。
- `documentTitle`：Web 使用 Head 设置标题。
- `independent`：不支持，Router 只管理一个全局容器。

### Theme

主题不再传给 `NavigationContainer`，而是直接使用 `ThemeProvider`：

```tsx
import {
  DarkTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Slot />
    </ThemeProvider>
  );
}
```

可以在任意布局层设置局部主题，并用同一入口的 `useTheme` 读取。

## 自定义 Navigator

已有自定义 Navigator 可通过 `withLayoutContext` 接入：

```tsx
import { createCustomNavigator } from './my-navigator';

export const CustomNavigator = withLayoutContext(
  createCustomNavigator().Navigator
);
```

也可使用 Expo Router `Navigator` 重写。它封装 `useNavigationBuilder`：

- `Navigator.useContext()` 取得 `state`、`navigation`、`descriptors`、`router`。
- `Navigator.Slot` 渲染当前选中路由，且只能位于 `Navigator` 内。

仅使用普通 `<Slot />` 不会自动接入自定义 Navigator 的内部 context。

## 其他迁移点

- Splash Screen：改为从 `expo-router` 导入 `SplashScreen`，获得导航挂载和异常时的特殊处理。
- 屏幕分析：使用 Expo Router 的路径/segment hooks 与 screen tracking 方案。
- 平台差异：使用平台专用模块组织 screen UI。
- 深链接初始路由：通过布局设置配置。
- 重置状态：可由 `useNavigation()` dispatch `expo-router/react-navigation` 导出的 `CommonActions.reset`。
- TypeScript：可启用静态 typed routes，只允许跳转到有效路由。
- React Navigation Elements：SDK 56 起从 `expo-router/react-navigation` 重新导出，无需单独安装。

## 注意事项与坑点

- 应用代码在 SDK 56 不能继续从 `@react-navigation/*` 导入。
- 参数必须可序列化，不能把函数或复杂对象当页面通信机制。
- 根组件延迟渲染会破坏 Web 静态内容，也可能导致过早导航。
- `NavigationContainer` 由 Expo Router 独占，不支持额外 independent container。
- 共享路由有歧义时必须使用包含路由组的完整路径。
- Drawer/Gesture Handler 依赖不会由 Router 自动补齐。

## React Web 开发者容易误解的地方

- 文件路径同时定义 URL 和原生导航层级，`_layout.tsx` 类似路由布局，但它还会创建 Stack/Tabs 等原生 Navigator。
- URL 路径是首要身份，不再以任意 screen name 为中心。
- 原生导航栈有返回历史、初始 route 和手势等状态，不能只按 Web 页面组件切换理解。
- `NavigationContainer` 类似全局 Router Provider，但 Expo Router 已替你创建，重复创建会破坏管理关系。

## 实际开发建议

> **基于文档内容推导：** 不要一次性同时移动所有文件并改所有调用。先确定目标 `src/app` 树，再逐层迁移根 Stack、子 Tabs 和页面 Hooks，每层都用真实 URL 验证。

> **基于文档内容推导：** 在移动文件前先完成 TypeScript 与路径别名改造，可以把“导入路径错误”和“导航行为错误”分开处理。

当前文档未涉及：完整依赖安装命令、每种 Navigator 的所有 options 对照表、自动迁移脚本、第三方导航插件兼容清单。
