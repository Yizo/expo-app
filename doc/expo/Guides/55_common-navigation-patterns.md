# Expo Router 常见导航模式

## 文档解决的问题

这篇文档解决的是：把 Expo Router 的基础规则应用到真实导航设计中，包括 tabs 内嵌 stack、跨平台 tabs、共享路由、受保护路由，以及“不一定要把状态做成路由”的场景。

## 适用场景

- 你已经学会基础路由，但还不会设计中大型应用的导航结构。
- 你想知道常见产品需求在 Expo Router 中应如何建模。
- 你在思考鉴权、共享页面、跨平台差异时应该如何组织目录。

## React Web 开发者先要补的背景

- 路由设计不只是“页面能不能打开”，还包括返回行为、tab 可见性、deep link 行为和鉴权。
- Expo Router 的很多高级模式是靠目录结构和 layout 组合表达出来的，而不是只靠一个“中控路由文件”。

## 1. Tabs 里嵌 Stack

这是文档列出的第一个真实模式。

### 适用场景

- 应用首页是 tabs
- 某些 tab 内部又有详情页、列表页等多层页面

### 目录结构思路

- `(tabs)/_layout.tsx` 定义 Tabs
- `feed/_layout.tsx` 定义该 tab 内部的 Stack

文档说明这样做的结果是：

- tab 始终可见
- tab 内部页面可以继续压栈
- URL 也会保持直观，例如 `/feed/123`

### `withAnchor` 与 `initialRouteName`

文档特别说明：从其他 tab 或 deep link 进入 `/feed/123` 时，可配合：

- `initialRouteName`
- `withAnchor`

确保 `feed/index` 成为该 tab 内部的首屏，从而让返回行为更合理。

## 2. 每个平台使用不同 tabs

文档给出的场景是：

- Android / iOS 用 native tabs
- Web 用 custom tabs

实现方式是平台特定文件扩展名：

- `app-tabs.native.tsx`
- `app-tabs.tsx`

root layout 统一渲染 `AppTabs`，实际平台选择由模块解析完成。

这非常符合“统一路由结构，分平台优化实现”的思路。

## 3. 两个 tab 共享同一个页面

文档给出的例子是：

- Feed tab
- Search tab
- 两者都能进入同一个用户资料页

### 关键做法

使用 route groups：

- `(feed)`
- `(search)`
- `(feed,search)`

共享页面放在 `(feed,search)` 下。

### 深链行为的一个重要细节

文档明确说明：

- 当你已经在某个 tab 中，再去用户页，会停留在当前 tab 所属 group
- 但如果从应用外部 deep link 到用户页，Expo Router 需要在两个 group 中选一个
- 它会按字母顺序选第一个

因此 `/users/evanbacon` 会落到 Feed tab。

这是很容易被忽略的行为规则。

## 4. 受保护路由

文档用登录态为例说明 `Stack.Protected` 和 `Tabs.Protected`。

### Stack 层保护

通过：

```tsx
<Stack.Protected guard={isLoggedIn}>...</Stack.Protected>
```

可以让某些路由仅在已登录时可见。

文档明确说明：

- 未登录时，根 index 若不可访问，会自动打开下一个可用页面
- 登录状态变化时，layout 重新渲染，应用会自动跳到可访问的根页面
- deep link 进入受保护页面时，同样会被重定向

### Tabs 层保护

文档还给出：

```tsx
<Tabs.Protected guard={isVip}>...</Tabs.Protected>
```

可基于条件动态显示某些 tab，例如仅给 VIP 用户展示 `vip` tab。

## 5. 有时最好的方案不是新增路由

这是这篇文档很有价值的一段。

文档指出：

- 不一定所有状态变化都值得建成独立路由
- layout 本身是 React 组件
- 所以你完全可以在 layout 里叠加 UI

例如：

- 允许未登录用户浏览内容
- 但在页面上方弹出登录 modal

而不是强制跳到一个独立登录页

这适合“只读模式”或“半开放内容”的产品。

## 目录、文件与关键 API 说明

### `Tabs`

负责顶层 tab 分区。

### 子目录 `_layout.tsx`

负责 tab 内 stack 等二级关系。

### `Stack.Protected`

按 guard 决定某组路由是否可访问。

### `Tabs.Protected`

按 guard 决定某些 tab 是否可见。

### `withAnchor`

强制进入另一个 stack 时先加载其初始页。

## 注意事项、限制与坑点

### 1. deep link 到共享页面时，group 选择不是“当前意图智能判断”

文档明确说明会按字母顺序选第一个 group。

### 2. 鉴权不一定非要“重定向到登录页”

文档明确给出了 modal over app 的另一种模式，适用于可读不可写场景。

### 3. nested navigators 是真实导航层级，不只是目录层级

tabs 里加 stack 会改变历史栈行为，不能只按文件夹划分来想。

## React Web 开发者最容易误解的点

### 1. 共享页面不等于复制两份页面文件

Expo Router 允许通过 route groups 让两个导航分区复用同一路由。

### 2. 鉴权与“页面是否存在”是两回事

路由仍然存在，但通过 protected 机制控制用户能否进入。

### 3. 不要过度路由化

有些体验更适合通过 layout 中的 modal、overlay 或局部 UI 解决。

## 实际开发建议

- 基于经验建议：底部主导航通常优先建成 tabs，详情页再放进对应 tab 的 stack。
- 基于经验建议：如果内容跨多个 tab 共享，先设计 deep link 落点规则，避免后期行为不一致。
- 基于文档内容推导：只读浏览 + 登录弹层这种需求，不必强行拆成完整认证子站点式结构。

## 文档明确说明

- tabs 内可嵌套 stack。
- 不同平台可使用不同 tab 实现。
- route groups 可让多个 tab 共享同一个页面。
- deep link 到共享页面时会按字母顺序选择 group。
- `Stack.Protected` / `Tabs.Protected` 可基于条件保护页面或 tab。
- 有些交互更适合在 layout 中用 modal 等方式处理，而不是新增路由。

## 基于文档内容推导

- 真正好的导航结构往往同时考虑 URL、视觉结构、返回行为和权限控制。
- Expo Router 的 route groups 不只是目录整理工具，也是导航语义表达工具。
- 对复杂产品来说，“哪些状态值得成为路由”本身就是架构决策。

## 当前文档未涉及

- 完整认证上下文实现。
- 各 navigator 的全部配置选项。
- SEO、静态渲染或服务端能力。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 中的页面导航](./54_navigation.md) | [下一页：Expo Router 的 Stack 导航 →](./56_stack.md)
<!-- NAVIGATION END -->
