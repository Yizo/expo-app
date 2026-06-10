# Expo Router 中的页面导航

## 文档解决的问题

这篇文档解决的是：在 Expo Router 里怎样跳转页面、传递动态参数和查询参数、做重定向、预取页面、处理 deep link，以及如何控制初始路由行为。

## 适用场景

- 你已经有页面和 layout，接下来要让页面之间真的“跳起来”。
- 你想知道 `Link` 和 `useRouter` 分别怎么用。
- 你需要在 URL 中传递动态参数或 query 参数。
- 你在做 deep link 或栈返回逻辑时遇到困惑。

## React Web 开发者先要补的背景

- Expo Router 的跳转目标统一用 URL 表达，这一点和 Web 非常接近。
- 但原生端默认是 stack 导航，所以同一个 URL 跳转还会带来“压栈 / 出栈”的历史行为差异。
- `Link` 在 Expo Router 中不是浏览器 `<a>` 的简单复制，而是跨平台导航组件。

## 核心导航方式

## 1. 通过 `useRouter` 命令式导航

文档给出的基础写法：

```tsx
import { useRouter } from 'expo-router';

router.navigate('/about');
```

文档说明了几种常见方法：

- `router.navigate`
- `router.push`
- `router.back`
- `router.replace`

### 它们的区别

文档明确说明：

- `navigate`：会 push 新页面，或者回退到栈中已存在页面
- `push`：显式 push 一个新页面
- `back`：返回上一个页面
- `replace`：替换当前页面

## 2. 通过 `Link` 声明式导航

文档给出的基础写法：

```tsx
import { Link } from 'expo-router';

<Link href="/about">About</Link>
```

这是更接近 Web 心智的方式。

### `asChild`

文档特别提醒：

- `Link` 默认把子内容渲染进 `<Text>`
- 如果子元素不是文本，布局可能异常

所以如果你想让 `Pressable` 等组件自己作为可点击元素，应使用：

```tsx
<Link href="/other" asChild>
  <Pressable>...</Pressable>
</Link>
```

## 相对路径导航

文档明确说明，你不一定非要写绝对路径：

- `./article`
- `../something`

它们会相对于当前已渲染路由解析。

这和 Web 的相对 URL 概念一致。

## 动态路由与参数

假设存在：

- `src/app/user/[id].tsx`

文档给出三种跳转到同一页面的方式：

1. 直接写完整 URL：`/user/bacon`
2. `href` 对象：`pathname + params`
3. 命令式 `router.navigate({ pathname, params })`

## Query 参数

文档说明 query 参数既可以：

- 写进 URL：`/users?limit=20`
- 也可以通过 `params` 对象传入

而在接收页面里，可以统一通过：

```tsx
useLocalSearchParams()
```

读取。

文档明确说明：URL 中的所有变量，包括动态路径段和 query 参数，都会出现在这个 hook 返回对象里。

## 更新 query 参数而不跳转新页面

文档给出两种方式：

- 使用同一路径但不同 query 的 `Link`
- 调用 `router.setParams({ ... })`

这点对 React Web 开发者很重要，因为它说明“参数变化”和“导航到新页面”不是一回事。

## Redirect

文档提供 `Redirect` 组件：

```tsx
<Redirect href="/about" />
```

文档明确说明它的行为类似 `replace`：

- 不渲染当前页
- 直接跳去目标页

## Prefetch

文档说明：

```tsx
<Link href="/about" prefetch />
```

可以提前预取目标页。

### 预取的限制

当页面在 stack 中被预加载时，文档明确列出几个限制：

- 不能使用命令式 `router` API
- 不能通过 `useNavigation().setOptions()` 更新 options
- 不能监听 navigator 事件，如 `focus`、`tabPress`

只有真正导航过去后，这些能力才会恢复。

## Deep links

文档明确说明 Expo Router 默认支持 deep linking。

### Web

在浏览器里打开目标 URL 就是 deep link。

### Native

要在 app config 中定义 `scheme`，例如：

- `myapp://about`
- `myapp://profile`

这让原生 App 也能通过 URL 精确打开某一页。

## Initial routes 与返回行为

文档解释了一个非常容易踩坑的问题：

- 用户通过 deep link 直接进入某个栈深处页面时，返回按钮可能不对

解决方式是在对应 `_layout.tsx` 中设置：

```tsx
export const unstable_settings = {
  initialRouteName: 'index',
};
```

文档还说明：

- 默认只在 deep linking 场景考虑 `initialRouteName`
- 如果你在应用内直接跳到另一个 stack 的深层页，可用 `withAnchor`

例如：

```tsx
<Link href="/stack/second" withAnchor>
  Go to second
</Link>
```

这样目标 stack 会先加载其初始页，再进入深层页，返回行为更合理。

## React Web 开发者最容易误解的点

### 1. URL 一样，不代表历史行为一样

在 Web 中你更关注地址变化；在这里还要关注 stack 的 push / replace / back 行为。

### 2. `Link` 默认不是任意容器包装器

它默认走 `<Text>`，这是原生环境带来的特殊点。

### 3. 参数读取统一走 `useLocalSearchParams`

不是分别拆成 path params 和 search params 两套 API。

### 4. 预取页面并不等于“完全进入页面”

文档明确列出了预取态下不能做的事。

## 注意事项、限制与坑点

- 预加载页面时不能安全使用某些导航 API。
- 如果 deep link 进来的页面没有返回按钮，优先检查 `initialRouteName`。
- 某些参数名被 Expo Router / React Navigation 保留，不能随意占用。
- 在原生端要先配置 `scheme`，否则 deep link 前缀无法成立。

## 实际开发建议

- 基于经验建议：业务跳转优先用 `Link`，只有按钮事件或流程控制场景再用 `useRouter`。
- 基于经验建议：涉及 deep link 的 stack 页面，尽早补 `initialRouteName`，不要等到返回行为出错再修。
- 基于文档内容推导：如果一个页面在预取阶段就要执行复杂导航副作用，这个页面结构可能需要重新设计。

## 文档明确说明

- 可通过 `useRouter` 和 `Link` 进行导航。
- 支持绝对路径与相对路径。
- 支持动态路由参数与 query 参数。
- 参数通过 `useLocalSearchParams` 读取。
- 可用 `Redirect` 做无渲染重定向。
- `prefetch` 可提前预加载页面，但有若干限制。
- 默认支持 deep linking。
- `initialRouteName` 与 `withAnchor` 可改善 deep link 和返回行为。

## 基于文档内容推导

- Expo Router 之所以适合跨平台，是因为它把“页面地址”作为统一语言，而不是只依赖原生 navigator 名称。
- 对复杂导航流程来说，URL 设计和栈历史设计需要一起考虑。
- Web 开发者如果只盯着 `href`，很容易忽略 stack 语义带来的行为差异。

## 当前文档未涉及

- 鉴权保护路由的完整实现。
- 各类 navigator 的完整配置项。
- SEO 或 Web 静态渲染细节。
