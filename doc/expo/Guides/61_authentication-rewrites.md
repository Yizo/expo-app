# Authentication in Expo Router using redirects

## 文档解决的问题

这篇文档讲的是：在 Expo Router 中，如何用“运行时重定向”实现登录态控制，避免未登录用户进入需要鉴权的页面。

文档特别强调，这种方案主要面向 **SDK 52 及更早版本**。文档开头明确说明：**SDK 53 起更推荐使用 Protected routes**。所以这篇内容更像“旧版或兼容场景下的鉴权实现方式”。

## 适用场景

- 你在维护 Expo Router 旧项目，仍然使用 SDK 52 或更早版本。
- 你的路由已经是文件系统路由，不想手写一套 React Navigation 鉴权逻辑。
- 你希望未登录时跳去 `/sign-in`，登录后再回到应用主区。
- 你需要处理深链接访问受保护页面时的重定向。

如果你正在用较新的 Expo SDK，当前文档已经明确建议优先看 `Protected routes`。这不是推测，是文档直接说明。

## 阅读前需要理解的背景

- **Expo Router 的路由默认总是存在**：这和很多 React Web 项目里“只有满足条件才渲染某个路由”不完全一样。文档明确说，Expo Router 中所有路由始终是已定义、可访问的，权限控制通常靠运行时逻辑处理。
- **Route Group**：也就是 `(app)` 这种带括号的目录，用来组织页面，不直接体现在 URL 中。
- **Layout Route**：`_layout.tsx` 不是页面本身，而是这一层路由的导航容器或守卫。
- **Redirect**：不是服务器 302，而是客户端运行时跳转。
- **深链接**：用户可能直接通过 URL 或系统链接进入某个受保护页面。

## 按原文逻辑整理的核心内容

## 1. 用 React Context + Route Group 管理登录态

文档的主方案是：

1. 用 React Context 在全局保存 `session`、`signIn()`、`signOut()`、`isLoading`
2. 在根布局里挂上 `SessionProvider`
3. 把需要鉴权的页面放进 `(app)` 组
4. 在 `(app)/_layout.tsx` 里判断是否登录，未登录就 `<Redirect href="/sign-in" />`

文档给出的结构大意如下：

```text
app
  _layout.tsx
  sign-in.tsx
  (app)
    _layout.tsx
    index.tsx
```

这里 `sign-in.tsx` 永远可访问，而 `(app)` 里的页面需要登录。

## 2. SessionProvider 的职责

文档示例里的 `SessionProvider` 暴露四类信息：

- `session`：当前登录态
- `isLoading`：初始化时是否还在读取登录态
- `signIn()`：登录后写入 session
- `signOut()`：退出后清空 session

文档示例只是 mock 实现，明确说明你可以替换成自己的认证提供方。

## 3. 登录态持久化：原生和 Web 的差异

文档给了一个 `useStorageState` 示例：

- **原生端**：用 `expo-secure-store` 安全保存 token
- **Web**：用 `localStorage`

这对 React Web 开发者很重要，因为在 Expo 里“同一套业务逻辑”底层存储实现可能是分平台的。文档明确展示了这种差异，而不是默认所有平台都能直接用浏览器存储。

## 4. 根布局必须先挂载 `<Slot />`

文档反复强调一个关键点：**在触发任何导航之前，根布局必须已经渲染出 `<Slot />` 或其他 navigator**。

如果根布局还没挂载导航容器就执行跳转，会报错：

`Attempted to navigate before mounting the Root Layout component`

所以：

- 根布局适合做“提供上下文”
- 不适合在还没挂载导航树前就做跳转判断
- 真正的鉴权判断更适合放到下一层嵌套路由的 `_layout.tsx`

## 5. 受保护布局如何工作

`(app)/_layout.tsx` 中的逻辑是：

- `isLoading === true` 时先渲染加载态
- 没有 `session` 时重定向到 `/sign-in`
- 有 `session` 时再渲染 `<Stack />`

文档还特别指出：

- 在 Web 上，**静态渲染**遇到未登录时，会停在这里，因为构建/渲染页面的无头 Node 进程里没有用户登录态。

这意味着这套方案在 Web 上本质仍然是“客户端重定向 + 加载态”的思路。

## 6. 为什么登录页要放在保护组外面

因为如果登录页也放进 `(app)` 保护组，那么未登录用户永远无法进入登录页，会造成逻辑自锁。

文档明确说明：

- `/sign-in` 在 `(app)` 外
- 所以访问它时，不会触发 `(app)` 组的鉴权检查

## 7. 登录后和退出后的导航

- 登录后，示例中调用 `signIn()`，然后 `router.replace('/')`
- 退出后，只需要 `signOut()`，因为 `(app)/_layout.tsx` 会自动把用户重定向回登录页

这体现出一个关键思路：

- 登录是“先改状态，再显式导航”
- 退出是“改状态，让守卫布局接管后续重定向”

## 8. 加载态的另一种组织方式

文档说，初始化认证状态时，屏幕上必须渲染点什么。除了在布局里显示 `Loading...`，也可以把 `index` 路由当成加载入口，再把真正首页放到 `/home` 之类的路径。

当前文档没有展开更多实现细节，但明确给出了这种替代组织思路。

## 9. “登录弹窗覆盖应用”的另一种模式

文档还介绍了另一种常见模式：把登录页做成 **modal**，覆盖在应用上层，而不是直接把未登录用户完全踢去单独页面。

这种模式的价值是：

- 登录完成后更容易恢复深链接上下文
- 后台页面仍然会被渲染

但文档明确提醒：这要求后台路由能处理“未登录时也先被渲染”的情况，尤其是数据加载逻辑要能接受这种状态。

这个方案还需要在布局里设置：

```ts
export const unstable_settings = {
  anchor: '(root)',
};
```

这里的 `anchor` 用来保证 modal 背后保留正确的导航基底。

## 10. 如何修复“根布局未挂载就导航”的错误

文档给了 before/after 对比，核心结论是：

- 不要在根布局里一边判断 `isLoading`，一边立刻 `router.push()`
- 应该把条件逻辑下沉到分组后的嵌套布局

也就是：

- 根布局只负责先把导航树挂起来
- 子布局再决定是否显示加载态、是否重定向

## 11. Web 端没有中间件式鉴权

文档最后明确说明：

- Expo Router 在 Web 上目前主要支持 **构建时静态生成**
- **没有自定义 middleware 或 serving 支持**

所以当前推荐做法仍然是：

- 客户端重定向
- 配合加载态

## 关键流程 / 文件 / 配置说明

### 关键文件结构

```text
app/
  _layout.tsx                # 根布局，挂 SessionProvider
  sign-in.tsx                # 始终可访问
  (app)/
    _layout.tsx              # 鉴权守卫
    index.tsx                # 受保护页面
```

### 关键组件和 API

- `SessionProvider`：向整棵应用树提供登录态
- `useSession()`：读取登录态和登录/退出方法
- `Slot`：渲染当前子路由
- `Stack`：当前布局下的导航容器
- `Redirect`：未登录时做客户端重定向
- `router.replace()`：登录成功后替换当前历史记录
- `expo-secure-store`：原生端安全存储
- `localStorage`：Web 端本地存储

### 关键配置

- `unstable_settings.anchor`：在“登录 modal”方案中，用来保留 modal 背后的导航锚点

### 当前文档涉及的命令

当前文档未涉及。

## 注意事项、限制条件和坑点

- 文档明确建议：**SDK 53+ 优先用 Protected routes**，不要把这篇旧方案当成最新最佳实践。
- 根布局必须先渲染 `<Slot />` 或其他 navigator，否则会出现“导航发生得太早”的运行时错误。
- Web 上未登录时，静态渲染会停在受保护布局的重定向分支，这是文档直接说明的行为。
- 登录 modal 方案虽然能保留上下文，但会要求后台页面在“尚未认证”时也能安全渲染。
- 当前 Web 方案没有服务端 middleware 兜底，不能把它理解成真正的服务端访问控制。

## React Web 开发者最容易误解的地方

- **误解 1：重定向等于服务端鉴权。**  
  这里的 `Redirect` 是客户端导航控制，不是像 Next.js Middleware 或服务器 302 那样的后端访问控制。

- **误解 2：根布局里最适合做所有鉴权逻辑。**  
  在 Expo Router 中，根布局有“先挂载导航容器”的硬约束，过早导航会直接报错。

- **误解 3：Web 和原生可以共用完全一样的存储方案。**  
  文档明确示例了 Web 用 `localStorage`，原生用 `expo-secure-store`。

- **误解 4：只要页面被保护，就等于资源也被保护。**  
  当前文档没有提供服务端访问控制能力，尤其 Web 端没有 middleware。

## 实际开发建议

- 基于文档内容推导：如果你是新项目，而且 SDK 足够新，优先评估 `Protected routes`，不要再默认从 redirect 方案开始。
- 基于文档内容推导：把“全局上下文”与“具体权限判断”拆层处理，根布局专注挂 provider，子布局专注做守卫，结构会更稳定。
- 基于经验建议：如果页面初始化要请求用户信息，最好让 `isLoading` 与 token 校验过程绑定，避免闪一下受保护页面再跳走。
- 基于经验建议：如果要做“登录后恢复原目标页”，可以在跳登录前记录原始目标路径，再在登录完成后恢复，但当前文档未展开这一实现。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- 所有 Expo Router 路由始终是已定义且可访问的。
- SDK 53 引入了更强的 `Protected routes`，SDK 52 及更早版本才建议按本文方案处理。
- 可以用 React Context 和 Route Groups 组织鉴权。
- 根布局必须先挂载 `<Slot />`，否则过早导航会报错。
- Web 当前没有 custom middleware / serving 支持。
- 登录 modal 方案需要后台路由在未认证时也能处理数据加载。

### 基于文档内容推导

- 这套方案更像“导航层鉴权”，不是“资源层鉴权”。
- 如果项目认证规则变复杂，redirect 方案会比 `Protected routes` 更容易散落在多个布局文件里。
- `anchor` 的作用本质上是在 modal 场景下保住导航栈上下文，避免深链接直达 modal 时失去返回基础页面的能力。
