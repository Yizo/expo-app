# Expo Router 学习文档

> 原文版本：Expo SDK 56  
> 包名：`expo-router`  
> 支持平台：Android、iOS、tvOS、Web、Expo Go

## 文档解决的问题

Expo Router 是面向 React Native 和 Web 应用的**文件系统路由库**，主要解决以下问题：

- 根据项目中的文件和目录自动生成路由。
- 管理页面跳转、返回、替换和导航历史。
- 提供 Stack、Tabs 等原生导航组件。
- 统一处理 URL 路径、动态参数和查询参数。
- 支持深链接、静态重定向、重写、站点地图以及服务端渲染等能力。
- 让同一套路由结构同时服务于 Android、iOS、tvOS 和 Web。

对于 React Web 开发者，可以先把它理解为：

> Expo Router 类似 Next.js 的文件路由，加上 React Router 的导航 API，再结合移动端原生的页面栈和标签栏。

但它并不只是浏览器路由。移动端没有浏览器标签页和传统 DOM History，Expo Router 会把路径转换为原生导航器中的页面栈、标签页和抽屉等结构。

## 适用场景

这篇 API 文档适合用于：

- 配置 Expo Router。
- 查询 Router 组件、Hook 和类型定义。
- 编写页面跳转和返回逻辑。
- 读取动态路由与查询参数。
- 在页面获得焦点时执行副作用。
- 创建自定义导航器。
- 处理第三方深链接和旧版 URL。
- 配置 Web 重定向、重写、响应头和服务端渲染。
- 从 Expo SDK 55 迁移到 SDK 56。

如果是第一次学习 Expo Router，原文建议先阅读：

- Expo Router 安装指南。
- Router 101 核心概念。
- Expo Router guides 中的导航模式和布局说明。

当前页面更接近**配置与 API 索引**，不是一篇从零搭建应用的完整教程。

## 阅读前需要理解的概念

### 文件系统路由

文件系统路由表示页面路径由文件位置决定，例如：

```text
app/
├── index.tsx
├── settings.tsx
└── profile/
    └── [id].tsx
```

可以对应为：

```text
/                 -> app/index.tsx
/settings         -> app/settings.tsx
/profile/123      -> app/profile/[id].tsx
```

`[id]` 是动态路径段，访问 `/profile/123` 时，`id` 的值为 `"123"`。

### 路由与屏幕

Web 开发中通常称为页面或 Route；移动端导航中常称为 Screen（屏幕）。

在 Expo Router 中，一个路由文件通常会成为导航器中的一个 Screen。页面跳转可能不是简单替换 DOM，而是将新屏幕压入原生导航栈。

### 导航栈

Stack 可以理解为一个页面历史栈：

```text
首页 -> 商品列表 -> 商品详情
```

进入详情页通常执行 `push`，返回时从栈顶移除详情页。

这与浏览器 History 相似，但移动端还会涉及：

- 原生返回手势。
- Android 系统返回键。
- 模态页面的关闭。
- 原生转场动画。
- 页面仍挂载但暂时失去焦点的情况。

### 页面焦点

移动端页面进入后台导航栈后，不一定立即卸载。

因此要区分：

- **mounted**：组件是否已经挂载。
- **focused**：当前页面是否正显示并接收用户操作。
- **blurred/unfocused**：页面仍可能存在，但被另一个页面覆盖。

这也是 `useFocusEffect` 与普通 `useEffect` 的关键区别。

### 深链接

深链接是从应用外部打开指定页面的 URL，例如：

```text
acme://profile/baconbrix?extra=info
```

它可能来自：

- 浏览器。
- 邮件或短信。
- 推送通知。
- 第三方支付、认证或营销平台。
- 旧版本应用保存的链接。

## 安装与基础配置

原文没有展开安装命令，只要求按照 Expo Router installation guide 完成安装。

如果使用 Expo 默认模板创建新项目，配置插件通常已经加入应用配置。

### `app.json` 示例

```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

Expo config plugin 用于在构建 Expo 应用时调整所需的原生项目配置。它不是 React Web 中的 Vite 或 Webpack 插件，而是 Expo 原生构建配置系统的一部分。

## Config Plugin 配置项

配置项可以直接使用字符串形式，也可以在需要传入属性时使用插件数组形式。

下面是文档列出的全部属性。

| 属性 | 默认值 | 作用与开发影响 |
| --- | --- | --- |
| `root` | `"app"` | 修改路由根目录。文档明确建议除非有具体需要，否则不要修改。 |
| `origin` | `undefined` | 生产环境中 `public` 资源的来源 URL。生产环境的 `fetch` 会被补充实现，以支持相对此来源发起请求；开发环境来源由 Expo CLI 开发服务器推断。 |
| `headOrigin` | `undefined` | `expo-router/head` 在 iOS handoff 场景使用的更具体来源 URL，默认继承 `origin`。 |
| `asyncRoutes` | `undefined` | 启用异步路由和懒加载。支持布尔值、`"development"`、`"production"` 或按平台配置的对象。 |
| `platformRoutes` | `true` | 控制是否支持 `index.android.tsx`、`index.ios.tsx` 等平台专用路由。 |
| `sitemap` | `true` | 控制是否在 `/_sitemap` 自动生成站点地图。 |
| `partialRouteTypes` | `true` | 启用部分类型化路由，使 TypeScript 在无法静态获知全部路由时仍能进行一定的路由检查。 |
| `redirects` | `undefined` | 静态重定向规则数组。 |
| `rewrites` | `undefined` | 静态重写规则数组。 |
| `headers` | `undefined` | 为服务器返回的所有路由响应设置统一响应头。 |
| `disableSynchronousScreensUpdates` | `false` | 禁用原生 Screen 的同步布局更新；文档说明某些情况下可能改善性能。 |
| `unstable_useServerMiddleware` | `false` | 实验功能：启用 `+middleware.ts` 服务端中间件，需要 `web.output: "server"`。 |
| `unstable_useServerDataLoaders` | `false` | 实验功能：启用数据 Loader，目前只支持 `web.output: "static"`。 |
| `unstable_useServerRendering` | `false` | 实验功能：配合 `web.output: "server"`，在请求发生时渲染 HTML，而不是构建时预渲染。 |

### `asyncRoutes` 的限制

可以按平台配置：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "asyncRoutes": {
            "android": "development",
            "ios": "development",
            "web": "production",
            "default": false
          }
        }
      ]
    ]
  }
}
```

原文明确说明：

- `"production"` 当前仅支持 Web。
- 在原生平台上会被禁用。

因此不能因为 Web 生产环境可以懒加载路由，就假设 Android 和 iOS 构建具有完全相同的行为。

### 重定向与重写

`redirects` 中每条规则包括：

- `source`
- `destination`
- 可选的 `permanent`，默认 `false`
- 可选的 `methods`，限制生效的 HTTP 方法

`rewrites` 中每条规则包括：

- `source`
- `destination`
- 可选的 `methods`

二者的概念区别与 Web 服务端常见行为一致：

- 重定向让客户端转到新的 URL。
- 重写在服务器内部改变匹配目标，通常不改变用户看到的 URL。

后一句是**基于文档内容推导**出的通用开发含义；当前页面没有详细解释其运行机制和状态码。

## SDK 56 的重要迁移限制

原文明确警告：

> 从 SDK 56 开始，应用代码不能再直接从外部 `@react-navigation/*` 包导入 Expo Router 对应的导航 API。

需要将相关导入改为对应的 `expo-router` 入口。

迁移方式包括：

- 执行官方 codemod。
- 按照 SDK 55 到 SDK 56 迁移指南手动修改。

例如，使用导航对象时直接导入：

```tsx
import { useNavigation } from 'expo-router';
```

文档同时说明，完整导航 API 已经由 `expo-router` 提供，不需要为了使用这些 API 单独安装 `@react-navigation/*`。

需要注意，文档后面的 `withLayoutContext` 示例仍从 `@react-navigation/*` 导入创建自定义导航器所需的构造函数和类型。由此可见，迁移警告针对的是 Expo Router 已提供对应入口的应用层 API，并不代表所有自定义导航器依赖都可以删除。

这段边界说明属于**基于文档示例推导**。

## 主要导航组件

### `Stack` 与 `ExperimentalStack`

`Stack` 是标准栈导航器，管理具有前进、返回关系的屏幕。

`ExperimentalStack` 使用新的 `react-native-screens/experimental` 原生栈：

- 它与 `Stack` 是同级替代方案。
- 在原生平台使用实验性原生实现。
- Web 会回退到标准 `Stack`。
- 可以按导航器逐步采用，不需要一次替换整个应用。

```tsx
<ExperimentalStack />
```

实验版本当前接受的 Screen 配置范围较窄：

- `headerBackVisible`
- `headerShown`
- `headerTransparent`
- `title`

超出支持范围的选项会被忽略，并在开发环境产生警告。

因此不能默认标准 `Stack` 的所有选项都能原样迁移到 `ExperimentalStack`。

### `Tabs`

`Tabs` 渲染标签页导航器。

对 Web 开发者来说，它不是普通的网页 Tab 组件，而是管理不同 Screen 和导航状态的导航器。每个标签页可能拥有独立的页面历史。

可以通过 `Tabs.Screen` 配置具体屏幕。

### `Slot`

`Slot` 渲染当前被选中的子路由内容，作用与 Web 路由中的 `<Outlet />` 相近。

它有两种内部用途：

- 在 `_layout` 中作为导航器使用。
- 在自定义 `Navigator` 中作为当前内容使用。

自定义 Navigator 会通过 `NavigatorContext.contextKey` 标识当前 `_layout`，从而判断 `Slot` 所处的导航上下文。

### `ExperimentalStack.Screen.BackButton`

用于配置返回按钮，可以放在 Layout 的 Screen 配置中：

```tsx
<Stack.Screen name="detail">
  <Stack.Screen.BackButton displayMode="minimal">
    Back
  </Stack.Screen.BackButton>
</Stack.Screen>
```

也可以直接放在页面组件中：

```tsx
<>
  <Stack.Screen.BackButton hidden />
  <ScreenContent />
</>
```

同一个 Screen 渲染多个实例时，组件树中最后渲染的实例生效。

原文在该条目后标记了 Deprecated，并写明使用 `Stack.Title`，但这与“返回按钮”的语义不完全一致。这里应以迁移后的具体 API 页面为准，不应仅凭当前条目自行替换。

### 其他组件

| 组件 | 作用 |
| --- | --- |
| `Badge` | 导航标签或工具栏中的徽标，属性继承自 Native Tabs 和 Stack Toolbar 的 Badge。 |
| `Icon` | 导航标签或工具栏图标。 |
| `Label` | 导航标签或工具栏文字。 |
| `ThemeProvider` | 向导航系统提供主题。 |
| `ScrollViewStyleReset` | 为以根 `<ScrollView />` 构建的 React Native Web 全屏应用重置样式，保持与原生行为接近。 |
| `Sitemap` | 站点地图组件。 |
| `SuspenseFallback` | 路由导出的 Suspense 回退组件所接收的属性。 |
| `ErrorBoundary` | 页面导出的错误边界所接收的属性。 |

### 页面错误恢复

页面的 `ErrorBoundary` 会收到：

- `error`：页面抛出的 `Error`。
- `retry`：清除错误状态并重新渲染当前路由的异步函数。

这与 React Error Boundary 的思路相近，但 Expo Router 将错误恢复能力直接与路由页面结合。

### `VectorIcon`

`VectorIcon` 用于从指定矢量图标族加载图标：

```tsx
import { Icon, VectorIcon } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

<Icon
  src={
    <VectorIcon
      family={MaterialCommunityIcons}
      name="home"
    />
  }
/>
```

文档明确建议：

- 优先使用 `Icon` 的 `md` 和 `sf` 属性。
- 只有必须指定某个矢量图标族时，才直接使用 `VectorIcon`。

## 路由跳转 API

### `Href`

`Href` 是 Expo Router 的核心路由类型，支持字符串和对象两种形式。

字符串形式：

```tsx
router.push('/profile/settings');
router.push('../settings');
```

对象形式：

```tsx
router.push({
  pathname: '/profile/[id]',
  params: { id: '123' }
});
```

对象中的字段：

| 字段 | 说明 |
| --- | --- |
| `pathname` | 绝对路径或相对路径 |
| `params` | 可选路由参数 |

启用类型化路由后，`Href` 可以检查可用路径和参数。

### `useRouter`

`useRouter()` 返回命令式导航对象：

```tsx
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

export default function Route() {
  const router = useRouter();

  return (
    <Text onPress={() => router.push('/home')}>
      Go Home
    </Text>
  );
}
```

也可以直接导入全局 `router`：

```tsx
import { router } from 'expo-router';

router.push('/home');
```

### `ImperativeRouter` 方法

| 方法 | 作用 |
| --- | --- |
| `push(href, options)` | 将新页面压入历史栈。 |
| `navigate(href, options)` | 导航到目标路由，具体历史行为由导航器决定。 |
| `replace(href, options)` | 用目标路由替换当前路由，不追加历史记录。 |
| `back()` | 返回上一条导航历史。 |
| `canGoBack()` | 检查当前导航器是否支持返回。原文属性说明中出现了“Navigates”字样，但从方法签名看它返回布尔值。 |
| `dismiss(count)` | 从当前 Stack 关闭指定数量的屏幕；不能满足时按文档规则至少关闭一层，单一路由时关闭整个 Stack。 |
| `dismissAll()` | 返回最近 Stack 的第一个屏幕，类似 `popToTop`。 |
| `canDismiss()` | 判断当前 Stack 是否存在可关闭的上层页面。 |
| `dismissTo(href, options)` | 持续关闭屏幕直到目标路由；找不到目标时，改为替换当前路由。 |
| `prefetch(href)` | 在导航前后台预取目标 Screen。 |
| `setParams(params)` | 更新当前路由的查询参数。 |

### React Web 开发者容易混淆的地方

`push`、`navigate`、`replace` 不应全部理解成 `window.location` 操作：

- `push` 明确新增一层历史。
- `replace` 明确替换当前历史。
- `navigate` 的具体处理与当前导航器及已有历史有关。
- `dismiss` 表达的是关闭当前原生 Stack 中的页面，Web 路由库通常没有完全相同的概念。

## URL 与路由参数

假设 URL 为：

```text
acme://profile/baconbrix?extra=info
```

其中：

- `baconbrix` 可能来自 `[user]` 动态路径段。
- `extra=info` 是查询参数。

### `useLocalSearchParams`

读取当前上下文中获得焦点的路由参数：

```tsx
const { user, extra } = useLocalSearchParams();
```

对于 Stack 页面，文档建议优先使用它，因为它只会在当前路由获得焦点时更新。

### `useGlobalSearchParams`

读取全局选中路由的参数，即使调用 Hook 的页面当前没有焦点，也会继续更新。

适合：

- Analytics。
- 后台操作。
- 不直接参与当前页面绘制的逻辑。

不适合无条件代替 `useLocalSearchParams`，否则后台 Stack 页面也可能因为参数变化重新执行逻辑或渲染。

### `usePathname`

返回不包含查询参数的规范化路径：

```text
/acme?foo=bar -> /acme
/[id]?id=normal -> /normal
```

这里返回的是解析后的 URL 路径，不是原始文件名。

### `useSegments`

返回当前路由对应的原始文件片段，不进行规范化：

```text
/[id]?id=normal -> ["[id]"]
```

例如：

```tsx
const segments = useSegments<
  ['settings'] |
  ['[user]'] |
  ['[user]', 'followers']
>();
```

关键区别：

- `usePathname()` 面向用户实际访问的 URL。
- `useSegments()` 面向项目中的路由文件结构。

### 其他路由信息 Hook

| Hook | 作用 |
| --- | --- |
| `useCurrentRouteInfo()` | 返回当前 Screen 的路由信息，可能为 `undefined`。 |
| `useRoute()` | 在任意位置读取父 Screen 的 route prop。 |
| `useRoutePath()` | 根据 linking 配置获得当前路由路径，可能为 `undefined`。 |
| `useSitemap()` | 返回站点地图数据，可能为 `null`。 |

## 页面焦点与副作用

### `useFocusEffect`

`useFocusEffect` 在 Screen 每次获得焦点时执行，在失去焦点时执行清理函数。

```tsx
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function Route() {
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused');

      return () => {
        console.log('Screen unfocused');
      };
    }, [])
  );

  return null;
}
```

适合用于：

- 返回页面时重新请求数据。
- 页面重新可见时恢复订阅。
- 页面失焦时停止临时任务。
- 每次进入页面时重置临时状态。

文档明确要求回调使用 `useCallback` 包装，否则可能执行得过于频繁。

需要特别注意：

> 清理函数在页面失去焦点时执行，而不是只在组件卸载时执行。

这与普通 `useEffect` 的生命周期语义不同。

### `useIsFocused`

返回当前 Screen 是否获得焦点：

```tsx
const focused = useIsFocused();
```

适用于需要根据页面可见状态决定渲染内容的组件。

### `useScrollToTop`

接收可滚动组件的 Ref，用于配合导航行为滚动到顶部。当前页面只给出了类型签名，没有详细说明触发时机和完整用法。

## 导航器对象与状态

### `useNavigation`

返回当前路由所属导航器的 navigation 对象，适合调用特定导航器能力，例如打开 Drawer：

```tsx
const navigation = useNavigation();

navigation.openDrawer();
```

嵌套 Layout 中可以指定目标父级：

```tsx
const rootLayout = useNavigation('/');
const ordersLayout = useNavigation('/orders');
const parentLayout = useNavigation('/orders/menu');
```

如果目标 Layout 不存在，会直接抛出错误，例如：

```text
Could not find parent navigation with route "/non-existent"
```

因此传入的 Layout 路径需要与项目路由结构一致。

### `useNavigationContainerRef`

返回根 `<NavigationContainer />` 的 Ref。

在容器尚未挂载时：

```tsx
ref.current === null
```

调用导航方法前必须考虑这个状态。

### `useRootNavigationState`

返回顶层导航器的当前状态，可以读取其中的 `routes`：

```tsx
const { routes } = useRootNavigationState();
```

这是导航器内部状态，不只是浏览器 URL。具体结构遵循 React Navigation 的 navigation state。

### `useRootNavigation`

返回根导航容器或 `null`。

原文在相邻位置给出“使用 `useNavigationContainerRef` 代替”的 Deprecated 提示，但页面排版无法完全确认提示归属。实践中应优先使用文档明确推荐的 `useNavigationContainerRef`，并在迁移时核对对应版本的类型定义。

## 数据 Loader 与服务端文档

### `useLoaderData`

返回当前路由导出的 `loader` 函数结果：

```tsx
export function loader() {
  return Promise.resolve({ foo: 'bar' });
}

export default function Route() {
  const data = useLoaderData<typeof loader>();

  return <Text>{JSON.stringify(data)}</Text>;
}
```

配置中的 `unstable_useServerDataLoaders` 目前只支持：

```text
web.output: "static"
```

原文示例存在一个多余的 `}`，上面的示例已按其意图修正。

### `useServerDocumentContext`

用于服务端渲染 HTML 文档，返回：

- `htmlAttributes`
- `bodyAttributes`
- `headNodes`
- `bodyNodes`

```tsx
import { useServerDocumentContext } from 'expo-router/html';

export default function Root({ children }) {
  const {
    htmlAttributes,
    bodyAttributes,
    headNodes,
    bodyNodes
  } = useServerDocumentContext();

  return (
    <html {...htmlAttributes}>
      <head>{headNodes}</head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
```

这是 Web 服务端文档能力，不应理解为 Android 或 iOS 上存在真实的 `<html>` 和 `<body>`。

## 自定义导航器

### `withLayoutContext`

`withLayoutContext` 将 React Navigation 导航器包装为能够识别 Expo Router 文件路由的导航器。

它会：

- 自动注入匹配到的路由 Screen。
- 没有子 Screen 时不渲染内容。
- 提供 `Screen` 和 `Protected` 等静态成员。
- 支持 React Navigation 内置导航器和自定义 Navigator API。

主要参数：

| 参数 | 作用 |
| --- | --- |
| `Nav` | 要包装的 Navigator 组件。 |
| `processor` | 在 Screen 传给 Navigator 前进行处理。 |
| `useOnlyUserDefinedScreens` | 为 `true` 时，忽略没有被显式声明为子组件的 Screen；默认 `false`。 |

这是高级扩展 API。只使用标准 Stack 或 Tabs 时通常不需要它。

## 主题与样式

Expo Router 提供：

- `DefaultTheme`
- `DarkTheme`
- `ThemeProvider`
- `useTheme()`

`useTheme()` 返回当前导航主题。

这里的主题主要服务于导航组件，不代表它会自动替代应用自己的 CSS、React Native StyleSheet 或设计系统。

## Native Intent 与外部链接

在 `app` 顶层创建：

```text
app/+native-intent.tsx
```

可以导出：

- `redirectSystemPath`
- `legacy_subscribe`

它用于处理第三方传入 URL、旧版链接或不符合当前路由结构的路径。

### `redirectSystemPath`

接收：

```ts
{
  path: string;
  initial: boolean;
}
```

其中：

- `path`：待处理 URL 或路径。
- `initial`：它是否为应用启动时收到的初始 URL。

返回值可以是：

- `string`
- `Promise<string | null>`
- `null`

返回 `null` 等假值时不发生重定向，应用停留在当前路径。

文档明确警告：该函数抛出异常可能导致应用崩溃，应使用 `try/catch` 和 Promise `.catch()` 处理错误。

### `legacy_subscribe`

用于兼容只支持 React Navigation `Linking.subscribe()`、但不直接支持 Expo Router 的旧项目或第三方平台。

文档不建议新项目使用，因为它：

- 不兼容 Server Side Routing。
- 不兼容 Static Rendering。
- 在离线或弱网环境下可能难以管理。

## 预加载与导航事件

`unstable_navigationEvents` 提供：

- `enable()`
- `isEnabled()`
- `addListener()`
- `emit()`

从 `unstable_` 命名可以看出这是非稳定 API，不应假定其接口长期保持不变。

支持的分析事件包括：

| 事件 | 含义 |
| --- | --- |
| `pagePreloaded` | 页面因 `router.prefetch()` 等操作被预加载，但尚未获得焦点。 |
| `pageFocused` | 页面获得焦点。 |
| `pageBlurred` | 页面失去焦点。 |
| `pageRemoved` | 页面被移除。 |
| `actionDispatched` | 导航 Action 被派发，包含 Action 类型、payload 和导航状态。 |

预加载页面后不保证一定会进入该页面：

- 后续导航成功时才会触发对应 `pageFocused`。
- 预加载可能失效。
- 页面可能直接卸载并触发 `pageRemoved`。

因此 Analytics 不应把 `pagePreloaded` 当成真实页面浏览。

## Screen 配置

`ScreenProps` 中的重要属性包括：

| 属性 | 作用 |
| --- | --- |
| `name` | Screen 名称；在 Layout 内使用时必填。 |
| `initialParams` | 初始参数。 |
| `options` | 导航器选项，也可以是根据 `navigation`、`route` 计算的函数。 |
| `listeners` | Screen 事件监听器。 |
| `getId` | 根据参数生成 Screen 实例 ID。 |
| `redirect` | 重定向到最近的同级路由。 |
| `dangerouslySingular` | 控制 Screen 的单实例行为。当前页面没有展开完整语义。 |

如果所有子 Screen 都设置：

```tsx
redirect={true}
```

Layout 会因为没有可渲染子项而返回 `null`。

## 路径相关类型

文档列出的主要路径类型包括：

| 类型 | 可接受形式 |
| --- | --- |
| `RelativePathString` | `./...`、`../...`、`..` |
| `ExternalPathString` | `scheme:value` 或 `//...` |
| `SearchOrHash` | `?...` 或 `#...` |
| `Href` | 字符串路径或 `{ pathname, params }` 对象 |
| `RoutePath` | 排除相对路径和外部路径后的内部路由路径 |

这些类型用于在 TypeScript 中区分站内路由、相对路由和外部 URL。

## 平台能力索引

当前页面还提供以下子 API 文档入口：

| API | 用途 |
| --- | --- |
| Stack | 栈导航器、工具栏和 Screen 组件 |
| Link | `Link` 与 `Redirect` 组件 |
| Color | 平台颜色工具 |
| Native Tabs | 原生标签栏导航 |
| Split View | 分栏布局 |
| UI | 无样式、无预设外观的 Headless Tabs 组件 |

当前文档没有详细展开这些子模块的属性和使用流程，需要阅读对应独立页面。

## 限制、警告与坑点

1. **SDK 56 导入路径发生变化**  
   应用代码中 Expo Router 已提供的导航 API 应从 `expo-router` 导入。

2. **生产异步路由目前仅支持 Web**  
   原生生产构建不能照搬 Web 的 `asyncRoutes: "production"` 配置。

3. **实验 API 不保证稳定**  
   `ExperimentalStack`、`unstable_useServerMiddleware`、`unstable_useServerDataLoaders`、`unstable_useServerRendering` 和 `unstable_navigationEvents` 都需要谨慎采用。

4. **实验 Stack 的配置范围有限**  
   不支持的 Screen option 会被丢弃，并只在开发环境警告。

5. **页面失焦不等于卸载**  
   返回页面时重新请求数据，应考虑 `useFocusEffect`，不能只依赖 `useEffect`。

6. **全局参数会更新后台页面**  
   Stack 场景优先使用 `useLocalSearchParams`；只有确实需要后台观察时才使用全局参数。

7. **父级 Layout 路径错误会抛异常**  
   `useNavigation(parent)` 不是找不到就返回 `undefined`。

8. **根导航 Ref 可能尚未就绪**  
   `useNavigationContainerRef().current` 在容器挂载前可能为 `null`。

9. **Native Intent 必须处理异常**  
   `redirectSystemPath` 内抛错可能造成应用崩溃。

10. **旧式链接订阅存在架构限制**  
    `legacy_subscribe` 不适合新项目，也不兼容服务端路由和静态渲染。

11. **预加载不等于页面访问**  
    `pagePreloaded` 不能直接计为页面曝光。

12. **修改路由根目录应有明确理由**  
    文档明确建议避免随意配置 `root`。

13. **部分 API 条目存在生成文档歧义**  
    Deprecated 标记和个别描述可能与相邻条目的语义不完全对应，迁移前应核对对应子 API 页面和实际类型定义。

## React Web 开发者的实践建议

以下为**基于经验建议**：

- 初期先使用标准 `Stack`、`Tabs`、`Slot` 和 `useRouter`，不要直接从实验性 Stack 或自定义 Navigator 开始。
- 将 `app` 目录视为路由定义，不要把所有普通组件都放进去。
- 普通可复用组件放在独立的 `components` 等目录，避免意外形成路由。
- 页面刷新型逻辑明确区分“首次挂载”和“每次重新获得焦点”。
- 默认使用 `useLocalSearchParams`，只有 Analytics 等后台场景才使用 `useGlobalSearchParams`。
- 对登录跳转等不希望返回原页面的流程使用 `replace`，普通前进导航使用 `push`。
- 接入支付、认证和推送深链接时，对所有外部路径进行校验，并保证 `redirectSystemPath` 不向外抛错。
- 在真实 Android、iOS 设备或模拟器上验证返回键、返回手势、深链接和页面焦点，不能只测试 Web。
- 实验性服务端能力应在小范围验证后再用于关键生产流程。

## 文档明确内容与推导内容

### 文档明确说明

- Expo Router 是 React Native 和 Web 的文件系统路由库。
- 支持 Android、iOS、tvOS、Web 和 Expo Go。
- SDK 56 不再支持应用代码直接导入外部 `@react-navigation/*` 对应 API。
- 默认模板已经配置 Expo Router config plugin。
- `asyncRoutes: "production"` 当前只支持 Web。
- `useFocusEffect` 应使用 `useCallback`。
- Stack 场景优先使用 `useLocalSearchParams`。
- `ExperimentalStack` 在 Web 回退到标准 Stack。
- `redirectSystemPath` 抛错可能造成应用崩溃。
- `legacy_subscribe` 不推荐用于新项目。
- 服务端中间件、数据 Loader 和服务端渲染配置仍属于实验能力。

### 基于文档内容推导

- Expo Router 可以类比为文件路由、Web 导航 API 与移动端原生导航器的组合。
- `Slot` 在概念上接近 React Router 的 `<Outlet />`。
- 全局参数更新可能给后台 Screen 带来不必要的逻辑执行或重新渲染。
- `pagePreloaded` 不应直接作为页面曝光事件。
- SDK 56 的导入限制不意味着自定义导航器所需的所有 React Navigation 包都必须删除。
- 原生与 Web 的导航表现不能仅凭相同 API 名称判断为完全一致。

## 当前文档未涉及的内容

当前页面没有完整讲解：

- 创建 Expo 项目的具体命令。
- Expo Router 的完整安装命令。
- `_layout.tsx` 的完整编写方式。
- 路由组、共享路由和 Not Found 页面。
- Stack、Tabs、Drawer 的完整配置选项。
- 身份认证和受保护路由的完整实现。
- Android、iOS 深链接原生工程配置。
- 应用商店构建和发布流程。
- 测试 Expo Router 的推荐方案。
- redirects、rewrites 的完整匹配语法和服务器状态码。
- `dangerouslySingular` 的详细行为。
- Sitemap 数据的完整使用示例。

这些内容需要继续阅读 Expo Router guides 和对应子 API 页面，不能从当前文档自行补全。

## 总结

Expo Router 的核心是让文件结构成为跨平台导航结构，同时提供原生 Stack、Tabs、焦点生命周期、深链接和 Web 服务端能力。

对 React Web 开发者而言，最重要的认知变化是：

- 路由对应的是原生 Screen，不只是浏览器中的页面内容。
- Screen 失去焦点后可能仍然挂载。
- URL 参数存在当前页面与全局导航状态两种观察方式。
- `dismiss`、原生返回手势和嵌套 Navigator 没有完全对应的传统 Web 概念。
- 同一个 API 支持多平台，不代表各平台的底层实现和限制完全相同。
- SDK 56 项目应优先通过 `expo-router` 入口使用导航 API，并谨慎采用实验功能。

---

## 文档导航

- **上一页**：[package json](./4__package-json.md)
- **下一页**：[color](./6__color.md)
