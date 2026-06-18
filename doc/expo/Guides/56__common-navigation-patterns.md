# 常见导航模式

> 原文地址：[https://docs.expo.dev/router/basics/common-navigation-patterns/](https://docs.expo.dev/router/basics/common-navigation-patterns/)

利用 Expo Router 的基础概念，在你的应用中实现实用的导航配置。

---

## 目录

- [Tab 内嵌 Stack：嵌套导航器](#tab-内嵌-stack嵌套导航器)
- [不同平台不同 Tab：平台专属标签栏](#不同平台不同-tab平台专属标签栏)
- [一个页面，两个 Tab：共享路由](#一个页面两个-tab共享路由)
- [仅限已认证用户：受保护路由](#仅限已认证用户受保护路由)
- [有时候最好的路由根本不是路由](#有时候最好的路由根本不是路由)

---

## Tab 内嵌 Stack：嵌套导航器

> **关键术语解释**
> - **Tab（标签栏）**：底部或顶部的标签式导航组件，用户可以在几个主要页面之间切换，类似于浏览器中的标签页。
> - **Stack（栈导航器）**：一种"先进后出"的导航方式，新页面压入栈顶，返回时弹出栈顶页面，类似于一摞卡片。
> - **嵌套导航器（Nested Navigator）**：在一个导航器内部放置另一个导航器，例如在 Tab 的某个标签页内部再放一个 Stack。

当你的应用以标签栏界面开始，但某些标签页内包含多个子页面时，在 Tab 内放置一个 Stack 导航器是非常有效的做法。这种方式会生成合理的 URL 结构，并且在桌面 Web 环境中也能良好适配——主标签栏始终保持可见。

查看以下目录结构：

```text
src
└── app
    └── (tabs)
        ├── _layout.tsx
        ├── index.tsx              # 单页面标签
        ├── feed
        │   ├── _layout.tsx        # 内嵌 Stack 的标签
        │   ├── index.tsx
        │   └── [postId].tsx
        └── settings.tsx           # 单页面标签
```

> **关键术语解释**
> - **`(tabs)`**：带括号的目录名在 Expo Router 中被称为**路由分组（Route Group）**，它不会出现在 URL 路径中，仅用于组织和共享布局。
> - **`_layout.tsx`**：布局文件，定义该目录下所有页面的公共导航结构（如 Tab 栏、Stack 头部等）。
> - **`[postId].tsx`**：带方括号的文件名表示**动态路由（Dynamic Route）**，可以匹配任意值，例如 `/feed/123`、`/feed/abc` 等。

在主标签栏的布局文件中，渲染一个 `Tabs` 组件：

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

在 `feed` 目录的布局文件中，输出一个 `Stack` 组件：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function FeedLayout() {
  return <Stack />;
}
```

> **关键术语解释**
> - **`unstable_settings`**：一个实验性的导出配置对象，用于设置该导航器的初始路由名称等选项。名称中的 `unstable` 表示此 API 可能会在未来版本中发生变化。
> - **`initialRouteName`**：指定 Stack 导航器的初始（默认）路由，即栈底的页面。

在 `feed` 文件夹内，`Link` 组件可以指向特定的帖子，例如 `/feed/123`。这些链接会将动态帖子路由添加到 Stack 中，同时保持标签栏在屏幕上可见。

从其他标签页导航到 feed 中的帖子时，使用相同的 URL 即可。结合 `withAnchor` 和 `initialRouteName` 可以确保 feed 的首页始终位于 Stack 的底部：

```tsx
<Link href="/feed/123" withAnchor>
  Go to post
</Link>
```

> **关键术语解释**
> - **`withAnchor`**：`Link` 组件的一个属性。当设置为 `true` 时，它会将目标路由"锚定"到导航栈的底部，确保 `initialRouteName` 指定的页面始终作为栈底页面存在。这对于从外部标签页跳转到嵌套 Stack 内部时非常有用，可以保证返回导航行为正确。

你也可以将标签栏放置在一个更大的 Stack 导航器内部，这在需要在标签栏上方渲染模态框（Modal）时特别有用。

> **基于经验建议**：在桌面 Web 环境中，嵌套导航器的 URL 结构尤其重要。合理的 URL 可以让用户直接使用浏览器的后退按钮、书签功能和分享链接，大幅提升用户体验。

有关嵌套导航器的更深入说明，请参阅官方的"嵌套导航器（Nested Navigators）"文档。

---

## 不同平台不同 Tab：平台专属标签栏

> **关键术语解释**
> - **平台专属文件扩展名（Platform-specific file extensions）**：Expo / React Native 支持根据目标平台自动选择不同文件的机制。例如，`app-tabs.native.tsx` 仅在 Android 和 iOS 上使用，而 `app-tabs.tsx` 在 Web 上使用。这类似于 React Native 中的 `.ios.tsx` 和 `.android.tsx` 约定。

对于多平台项目，你可能希望在移动设备上使用原生标签组件以获得更原生的手感，同时在 Web 端使用自定义标签组件以拥有完全的样式控制权。平台专属文件扩展名使得这一切成为可能。

```text
src
├── app
│   ├── _layout.tsx          # 导入 AppTabs
│   ├── index.tsx
│   ├── feed.tsx
│   └── profile.tsx
└── components
    ├── app-tabs.native.tsx  # 用于 Android 和 iOS 的原生标签栏
    └── app-tabs.tsx         # 用于 Web 的自定义标签栏
```

主布局文件只需渲染 `AppTabs` 组件。模块解析系统会自动为移动端选择 `.native.tsx` 文件，为 Web 端选择 `.tsx` 文件，确保每个环境都能获得合适的标签栏设置。

> **基于文档内容推导**：这种模式的核心优势在于代码分离——你不需要在组件内部写大量的 `Platform.select` 或条件判断逻辑，文件级别的分离使得代码更清晰、更易维护。

请参阅布局指南中的"平台专属标签栏（Platform-specific tabs）"部分，获取完整的编码示例。

---

## 一个页面，两个 Tab：共享路由

> **关键术语解释**
> - **路由分组（Route Group）**：用括号命名的目录（如 `(feed)`、`(search)`），用于组织路由和共享布局，但不会出现在最终的 URL 路径中。多个路由分组可以共享相同的子路由。

你可以利用路由分组让多个标签页访问同一个页面。假设有一个包含"Feed"和"Search"两个标签的应用，它们都需要展示用户个人资料页：

```text
src
└── app
    └── (tabs)
        ├── _layout.tsx
        ├── (feed)
        │   └── index.tsx             # 默认路由
        ├── (search)
        │   └── search.tsx
        └── (feed,search)
            ├── _layout.tsx           # 两个标签共享的布局
            └── users
                └── [username].tsx    # 共享的用户资料页
```

> **关键术语解释**
> - **`(feed,search)`**：这是 Expo Router 中的**多分组路由**语法。目录名中包含逗号分隔的多个分组名称，表示该目录下的路由同时属于这些分组。这样，两个分组都可以访问这些共享页面。

对每个标签进行分组后，可以为两者创建一个共享目录。尽管多了这一层文件夹，feed 的 `index.tsx` 仍然是最近的默认路由。

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="(feed)" options={{ title: 'Feed' }} />
      <Tabs.Screen name="(search)" options={{ title: 'Search' }} />
    </Tabs>
  );
}
```

由于两个分组都使用 Stack，它们可以共享一个布局文件：

```tsx
import { Stack } from 'expo-router';

export default function SharedLayout() {
  return <Stack />;
}
```

或者，共享分组也可以只存放公共页面，而各个独立分组维护自己的布局。

因此，两个标签页都可以访问相同的用户资料 URL。

在标签页内部导航到用户页面时，会保持在当前分组中。但是，外部深度链接（deep link）会迫使路由器选择一个分组，默认选择按字母顺序排列的第一个分组。因此，指向该用户资料 URL 的外部链接会在 Feed 标签页中打开。

> **基于经验建议**：如果你的应用有多个共享页面，务必注意外部深度链接的分组选择行为。可以通过调整分组名称的字母顺序，或者在根布局中添加自定义的路由逻辑来控制外部链接的默认目标分组。

请查阅"共享路由（Shared routes）"文档，了解不同路由如何使用相同 URL 的更多细节。

---

## 仅限已认证用户：受保护路由

> **关键术语解释**
> - **受保护路由（Protected Route）**：一种路由保护机制，只有满足特定条件（如已登录）的用户才能访问。未满足条件的用户会被自动重定向到其他页面（如登录页）。
> - **`Stack.Protected`** / **`Tabs.Protected`**：Expo Router 提供的受保护组件，通过 `guard` 属性控制子路由的可访问性。

需要登录验证的移动应用通常会将某些路径限制为仅已验证用户可访问。

假设一个结构包含底部标签栏、登录和注册页面，以及一个仅限已登录用户访问的模态框：

```text
src
└── app
    ├── _layout.tsx           # 根布局
    ├── (tabs)
    │   ├── _layout.tsx
    │   ├── index.tsx         # 受保护
    │   └── settings.tsx      # 受保护
    ├── sign-in.tsx
    ├── create-account.tsx
    └── modal.tsx             # 受保护
```

应用启动时，路由器会尝试加载主页 `index`。将其包裹在一个 `guard` 为 `false` 的 `Stack.Protected` 组件中会阻止访问，并重定向到下一个有效页面——在这里就是登录页。

```tsx
import { Stack } from 'expo-router';
import { useAuthState } from '@/utils/authState';

export default function RootLayout() {
  const { isLoggedIn } = useAuthState();

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="create-account" />
      </Stack.Protected>
    </Stack>
  );
}
```

> **关键术语解释**
> - **`guard`**：`Stack.Protected` 和 `Tabs.Protected` 组件的布尔属性。当值为 `true` 时，子路由可访问；当值为 `false` 时，子路由不可访问，路由器会自动寻找下一个可访问的路由。
> - **`useAuthState`**：这是一个自定义 Hook（非 Expo Router 内置），用于获取当前的认证状态。你需要自行实现它，通常从 AsyncStorage、SecureStore 或远程 API 获取认证信息。

这种方式允许从存储中获取认证状态来显示正确的视图。状态变化会触发重新渲染，登录成功后会自动切换到主标签组。

这些受保护的路由也会验证外部深度链接。如果一个未验证的用户直接通过链接访问模态框页面，会被重定向到登录页面。

你还可以利用这些保护机制有条件地显示底部标签。例如，下面的代码中，一个特殊标签仅对已验证的 VIP 会员显示：

```tsx
import { Tabs } from 'expo-router';
import { useAuthState } from '@/utils/authState';

export default function TabsLayout() {
  const { isVip } = useAuthState();

  return (
    <Tabs>
      <Tabs.Screen name="index" />

      <Tabs.Protected guard={isVip}>
        <Tabs.Screen name="vip" />
      </Tabs.Protected>

      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
```

> **基于经验建议**：受保护路由机制非常适合"全有或全无"的访问控制场景。但如果你的需求更复杂——比如未登录用户可以浏览部分内容但不能执行操作——那么结合下面"有时候最好的路由根本不是路由"一节中的覆盖层方案可能更合适。

请查阅"Expo Router 身份认证"指南，了解使用受保护路由的详细实现步骤。

---

## 有时候最好的路由根本不是路由

将导航状态拆分为独立的路由路径应当对项目有益。但有时候，最佳方案完全不涉及路由切换。因为布局文件本身就是标准的 React 组件，它们可以在导航器旁边或替代导航器渲染各种界面。

在身份认证方面，受保护路由非常适合完全阻止访问的场景。但是，如果未验证的用户可以以只读模式浏览应用，那么显示一个登录覆盖层可能比直接重定向他们更好：

```tsx
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function Layout() {
  const isAuthenticated = /* 检查有效的认证令牌 / 会话 */

  return (
    <SafeAreaView>
      <Stack />
      <Modal visible={!isAuthenticated}>{/* 登录界面 */}</Modal>
    </SafeAreaView>
  );
}
```

> **关键术语解释**
> - **`SafeAreaView`**：来自 `react-native-safe-area-context` 的组件，用于确保内容不会被设备的状态栏、刘海屏（notch）或底部手势条遮挡。在 iPhone X 及以后的机型上尤其重要。
> - **覆盖层模式（Overlay Pattern）**：不改变路由，而是在当前页面上方叠加一个 UI 层（如 Modal）。用户的 URL 和导航状态保持不变，但视觉上被引导去完成特定操作（如登录）。

> **基于文档内容推导**：这种模式的核心思想是"路由不是万能的"。布局文件作为 React 组件的全部能力意味着你可以自由组合导航器和非导航 UI，实现更灵活的用户体验。选择路由跳转还是覆盖层，取决于你的业务逻辑是否需要不同的 URL 状态。

请探索"Expo Router 中的模态框"文档，了解各种模态框展示技巧，包括在布局文件中嵌入模态框的方法。

---

## 总结

本文介绍了 Expo Router 中五种常见的导航模式：

| 模式 | 适用场景 | 核心 API |
|------|---------|---------|
| Tab 内嵌 Stack | 标签页内有多个子页面 | `Tabs` + `Stack`，`withAnchor` |
| 平台专属标签栏 | 多平台需要不同的标签栏样式 | `.native.tsx` / `.tsx` 文件扩展名 |
| 共享路由 | 多个标签页需要访问相同页面 | 路由分组 `(feed,search)` |
| 受保护路由 | 需要登录验证的页面 | `Stack.Protected` / `Tabs.Protected` + `guard` |
| 非路由方案 | 只读浏览 + 登录提示等场景 | 布局组件 + `Modal` 覆盖层 |

> **基于经验建议**：在实际项目中，这五种模式经常组合使用。例如，一个典型的电商应用可能同时使用 Tab 内嵌 Stack（商品列表 → 商品详情）、受保护路由（个人中心需要登录）、以及覆盖层模式（未登录时弹出登录框）。理解每种模式的适用场景和局限性，是构建良好导航体验的关键。

---

## 文档导航

- **上一页**：[navigation](./55__navigation.md)
- **下一页**：[stack](./57__stack.md)
