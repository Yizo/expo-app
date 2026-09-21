# 009｜Expo Router Link、预览与跳转 API

**翻页：**[上一页：Experimental Stack](./008-Experimental-Stack.md) · [目录](./README.md) · [下一页：Native Tabs API](./010-Native-Tabs.md)

**官方页面：**[Expo Router Link](https://docs.expo.dev/versions/latest/sdk/router/link/)

**版本说明：**Latest page 显示 `expo-router ~57.0.22`。本地 SDK56 要以 [SDK v56 Router API](https://docs.expo.dev/versions/v56.0.0/sdk/router/)为准；iOS Link menu / zoom transition 尤其可能依赖较新原生系统或 SDK。

## `Link` 是什么

`Link` 以 `href` 表示目标路由。Native 平台默认包裹 RN `<Text>` 并触发客户端导航；Web 输出 `<a>`，保留浏览器链接行为同时使用客户端导航：

```tsx
import { Link } from 'expo-router';

<Link href={'/about'}>About</Link>
<Link href={{ pathname: '/users/[id]', params: { id: '42' } }}>
  User 42
</Link>
```

`href` 可以是绝对 `/profile` 路径、相对路径或 `{ pathname, params }` 对象。

## 包装可点击组件与 history

`asChild` 把 href / role / press handler 转交给第一个子组件，适合把自定义 RN Pressable 做成 link。导航 history 行为可由 `push`、`replace`、`dismissTo` 改写：

```tsx
import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';

<Link href={'/home'} asChild replace>
  <Pressable><Text>Home</Text></Pressable>
</Link>
```

- `push` 总是向 Stack 压入新页面，不复用已有路由。
- `replace` 从 history 移除当前屏幕再换到目标，常用于登录重定向。
- `dismissTo` 关闭 Stack 上层屏幕直到目标，找不到目标时替换当前屏幕。
- `dangerouslySingular` 指定 Stack 历史中哪些重复 screen 应被清理。
- `prefetch` 可在 link 所在 screen 聚焦时提前获取目标 route。
- `withAnchor` 可把当前 route 替换为 history 的 initial screen。

Web-only anchor props `target`、`rel`、`download` 会透传到 `<a>`。

## Redirect / Preview / Context menu

`Redirect` 在组件挂载时立即跳到 `href`，例如认证 guard：

```tsx
import { Redirect } from 'expo-router';

if (!session) return <Redirect href={'/login'} />;
```

Latest Link API 还列出 iOS 的 `Link.Preview`、`Link.Menu` / `Link.MenuAction` 和 `Link.Trigger`，可为长按 link 显示 context menu / preview；Apple Zoom Transition 提供从图片列表放大进入详情的 native 转场。`useIsPreview()` 检查当前 route 是否在预览；`usePreventZoomTransitionDismissal()` 限制通过手势退出的可触摸区域。

```tsx
<Link href={'/about'}>
  <Link.Trigger><Text>打开 About</Text></Link.Trigger>
  <Link.Preview><Text>页面预览</Text></Link.Preview>
</Link>
```

这组 Apple preview / zoom API 受平台版本约束，不是普通 Android / Web Link 的必备功能。

## 关键名词

- **Href / route object**：Router 使用的 URL / 参数目标。
- **Client-side navigation**：Web 不整页刷新、Native 不重建 JS app 的内部导航。
- **History**：导航栈中用于 Back / dismiss 的页面序列。
- **Preview / context menu**：iOS long press 时系统展示的 link preview 与操作菜单。
- **Zoom transition**：iOS 图片等元素从列表放大切换到详情的系统转场。

## 官方代码主题覆盖

源页主要代码主题均有改写覆盖：基本 href、`asChild` 包装 Pressable、动态 href / params、push / replace / dismissTo 等 history 选项、认证 `Redirect`、iOS Preview / Trigger 与相关 Hook、Web anchor attributes。iOS 新 API 的系统版本要求按官方 API reference 核对。

## 下一页

页脚 **Next** 指向 [Expo Router Native tabs](https://docs.expo.dev/versions/latest/sdk/router/native-tabs/)，介绍系统原生标签栏 API。

**翻页：**[上一页：Experimental Stack](./008-Experimental-Stack.md) · [返回目录](./README.md) · [下一页：Native Tabs API](./010-Native-Tabs.md)
