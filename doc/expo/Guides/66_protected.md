# Protected routes

## 文档解决的问题

这篇文档讲的是：如何在 Expo Router 里把某些页面标记为“受保护页面”，让用户在客户端导航时无法进入，或者在权限变化后自动被移走。

和旧式“进入页面后再 `Redirect`”相比，这篇文档提供的是更直接的导航层能力。

## 适用场景

- 登录后才能访问个人页、订单页、管理页。
- 未登录用户只能看到登录页，登录后登录页反而不应该再出现。
- 权限会动态变化，例如用户退出登录、管理员权限被撤销。
- 你使用 `Stack`、`Tabs`、`Drawer` 或自定义 navigator，需要统一做路由可见性控制。

## 阅读前需要理解的背景知识

- **Protected screen**：不是文件不存在，而是“当前导航条件下不可进入”。
- **guard**：一个布尔条件，决定这一组 screen 当前是否可用。
- **anchor route**：被拒绝访问时的回退目标，通常是 index 或第一个可用页面。
- **客户端导航保护**：控制的是前端导航行为，不等于服务器鉴权。

## 按原文结构整理的核心内容

## 1. 受保护页面的基本行为

文档明确说：

- 如果用户尝试进入受保护页面
- 或者某个页面当前正开着，但随后变成受保护状态

那么用户会被自动重定向到：

- anchor route，通常是 index
- 或当前 stack 里第一个仍然可用的页面

这比“页面内自己判断然后重定向”更靠近导航系统本身。

## 2. 最基础的写法：`Stack.Protected`

文档示例中：

- `login` 只在未登录时可见
- `private` 只在已登录时可见

写法形态是：

```tsx
<Stack.Protected guard={!isLoggedIn}>
  <Stack.Screen name="login" />
</Stack.Protected>

<Stack.Protected guard={isLoggedIn}>
  <Stack.Screen name="private" />
</Stack.Protected>
```

文档还特别提醒：Expo Router 默认会包含所有路由，`Stack.Protected` 的作用就是为这些页面建立“当前不可访问”的例外规则。

## 3. 访问失败时会回退到哪里

文档示例中，`/private` 被保护后，如果 `guard` 为 `false`，用户会被带回锚点页，也就是 `index`。

如果锚点页本身也不可用，则会回退到 stack 中第一个可用页面。

## 4. 权限变化时历史记录也会被清理

这是文档里非常重要的一点：

- 当某个 screen 的 `guard` 从 `true` 变为 `false`
- 这个 screen 的历史记录也会从导航历史中移除

这意味着用户不能通过“返回”重新回到一个已经失去权限的页面。

## 5. 一个 screen 不能同时出现在多个激活分组里

文档明确限制：

- 一个 screen 在任意时刻只能属于一个激活中的 route group

因此：

- 不要重复声明同一个页面
- 如果可见性取决于条件，应该把它包在不同的 `Protected` 分组里控制，而不是复制 screen 声明

文档还给了一个错误示例：同一个 `profile` 页面既在 `Protected` 里声明，又在外面再声明一次，这是不允许的。

## 6. 可以嵌套保护逻辑

文档支持把 `Protected` 嵌套起来，形成分层权限控制。

例如：

- 外层 `isLoggedIn`
- 内层 `isAdmin`

那么：

- `/private` 需要同时满足“已登录 + 管理员”
- `/about` 只需要“已登录”

这很适合做权限等级递进。

## 7. 如何指定被拒绝后的具体落点

文档给出一个变体：

- 把 `index` 和 `private` 都放在同一个受保护组中
- `login` 单独放在外面

这样当 `guard` 为 `false` 时，router 会跳去第一个可用页面，也就是 `login`

也就是说，“回退目标”不一定非得是 index，它取决于当前 stack 中哪些 screen 仍然开放。

## 8. Tabs 和 Drawer 也支持

文档明确说：

- `Tabs.Protected`
- `Drawer.Protected`

也适用相同思路。

例如：

- 首页始终可见
- `private`、`profile` 只在登录后显示
- `login` 只在未登录时显示

这不仅影响“能不能进入”，还影响“导航入口本身是否出现”。

## 9. 自定义 navigator 也支持

文档说明：通过 `withLayoutContext` 构建的自定义 navigator 也可以使用 `Protected`。

当前文档没有展开完整自定义示例，但明确说明能力是存在的。

## 10. 静态渲染的边界

文档最后特别强调：

- Protected screens 的判断是**纯客户端**的
- 在静态站点生成时，不会为 protected routes 生成 HTML 页面
- 但如果用户知道这些 URL，仍然可能直接请求到对应的 HTML 或 JS 文件

所以文档明确给出结论：

- **Protected routes 不是服务器认证，也不是真正的访问控制替代品**

## 关键流程 / 命令 / 配置说明

### 核心 API

- `Stack.Protected`
- `Tabs.Protected`
- `Drawer.Protected`
- `guard`

### 典型组织方式

```tsx
<Stack>
  <Stack.Protected guard={!isLoggedIn}>
    <Stack.Screen name="login" />
  </Stack.Protected>

  <Stack.Protected guard={isLoggedIn}>
    <Stack.Screen name="private" />
  </Stack.Protected>
</Stack>
```

### 当前文档涉及的命令

当前文档未涉及。

### 当前文档涉及的文件结构

文档示例涉及：

- `src/app/_layout.tsx`
- `src/app/index.tsx`
- `src/app/login.tsx`
- `src/app/private/_layout.tsx`
- `src/app/private/index.tsx`
- `src/app/private/page.tsx`

## 注意事项、限制条件和坑点

- 一个 screen 不能被重复声明到多个激活 group 中。
- `guard` 一旦从 `true` 变成 `false`，对应页面历史记录会被删除。
- 这是客户端导航保护，不是服务端权限控制。
- 静态渲染时不会生成 protected routes 的 HTML，但这不代表资源绝对不可被请求。
- 如果你把锚点页也保护掉，router 会退到第一个可用 screen，而不是强制退回 index。

## React Web 开发者最容易误解的地方

- **误解 1：Protected routes 等于后端鉴权。**  
  文档明确说不是，它只控制客户端导航。

- **误解 2：只要 screen 写在文件系统里，就一定会出现在当前导航中。**  
  有了 `Protected` 后，screen 的“已定义”与“当前可达”是两回事。

- **误解 3：失去权限后用户还能点返回回去。**  
  文档明确说明历史记录会被清掉。

- **误解 4：受保护逻辑只能做一层。**  
  文档明确支持嵌套保护。

## 实际开发建议

- 基于文档内容推导：如果你用的是较新 Expo SDK，优先用 `Protected`，比旧式布局里写大量 `Redirect` 更集中、更清晰。
- 基于文档内容推导：把“登录态”和“角色态”分层写成嵌套 `Protected`，会比在一个 guard 里塞复杂布尔表达式更易读。
- 基于经验建议：如果还涉及真正的数据权限控制，后端 API 仍要独立校验，不要因为前端有 `Protected` 就省掉服务端校验。
- 基于经验建议：在 Tabs 场景里，Protected 不只是保护页面，也是在动态管理 tab 是否出现，设计交互时要考虑入口突然消失对用户的影响。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- `Protected` 可以阻止用户通过客户端导航访问某些页面。
- 页面变为受保护时，会自动跳转到 anchor 或第一个可用页面。
- 历史记录会在 `guard` 变为 `false` 时被移除。
- screen 不能重复出现在多个激活 group 中。
- `Protected` 支持 Stack、Tabs、Drawer 和自定义 navigator。
- 它不是服务器认证或访问控制的替代品。

### 基于文档内容推导

- `Protected` 更适合描述“导航层可见性规则”，而不是页面内逻辑判断。
- 复杂权限体系下，把 screen 的“显示条件”集中到 navigator 层，会比散落在页面组件里更容易维护。
