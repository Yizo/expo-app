# Customizing links

## 文档解决的问题

这篇文档讲的是：在 Expo Router 中，如何改写进入应用的链接、处理第三方深链接、以及在应用运行时监听并重写 URL。

它解决的核心问题是：**现实中的原生链接输入并不总是干净、标准、可直接映射到页面路由的 URL**。

## 适用场景

- 第三方 SDK 会把用户通过特殊 schema 或 referral URL 拉起 App。
- 老版本 App 发出的链接在新版本里已经失效，需要兼容重写。
- App 已经打开时，你要按业务规则把某些路径改写到别的页面。
- 你要把导航事件同步给第三方分析或日志服务。

## 阅读前需要理解的背景知识

- **深链接**：把用户直接带到 App 内某个页面的链接。
- **`+native-intent.tsx`**：Expo Router 用来处理原生传入链接的特殊文件。
- **`redirectSystemPath`**：在 App 被系统链接唤起时执行的重写函数。
- **`usePathname()`**：读取当前路径，可在布局中对路径变化作响应。

## 按原文结构整理的核心内容

## 1. 为什么需要“自定义链接”

文档先解释背景：

- Expo Router 更接近 Web 标准，假设输入的是一个指向某页面的 URL
- 但原生应用世界里，外部输入不一定真的是标准 URL

例如：

- 第三方服务可能传入某种特殊 schema
- 旧版本遗留链接可能已经不再对应当前路由

所以你需要在“进入路由系统之前”做重写。

## 2. 两种场景：App 关闭 vs App 已打开

文档把链接定制分成两类：

### App Closed

当 App 尚未打开时，传入的深链接可能需要先被改写，才能正确落到某个路由。

### App Open

当 App 已经打开时，路径变化也可能需要根据业务逻辑做重定向。这个逻辑可以：

- 全局生效
- 也可以只作用于某一组路由

## 3. 原生端如何重写进入链接：`+native-intent.tsx`

文档明确要求：

- 在 `src/app` 顶层创建 `+native-intent.tsx`

它导出一个特殊函数：

```ts
redirectSystemPath({ path, initial })
```

其中：

- `path`：传入路径，但文档明确提醒，**它不保证真的是合法 path 或合法 URL**
- `initial`：表示这次处理是不是“应用初次被拉起”场景

## 4. `redirectSystemPath` 的实践要点

文档给出的示例最重要的不是具体第三方 SDK，而是以下原则：

- 用 `try/catch` 包裹整个处理过程
- 不要在这里抛异常导致 App 崩溃
- 出错时返回一个安全的兜底路径，例如 `/unexpected-error`
- 对第三方 URL 先识别 hostname，再决定如何转换

文档明确提醒：

- 即使参数名字叫 `path`，也不要假设它一定能被直接当作 URL 解析

## 5. Web 上没有 `+native-intent` 对等能力

文档明确说：

- Web 的初始路由解析发生在网站 JavaScript 运行之前
- 所以 Expo Router 无法提供一个和原生 `+native-intent` 完全对等的 Web 机制

因此文档建议 Web 选择以下两种模式之一：

### Server Redirect

- 用部署平台提供的服务端重定向或 middleware
- 更适合 server / static 输出

### Client Redirect

- 在应用根 `_layout` 中自行重定向
- 更适合单一客户端渲染输出

## 6. App 已打开时如何改写路径

文档推荐在 `_layout` 中使用 `usePathname()`：

- 根布局里写，就是全局监听
- 某个目录下写 `_layout`，就是局部监听

示例逻辑是：

- 读取当前 `pathname`
- 如果用户不允许访问该路径，则 `<Redirect href="/home" />`

这说明 URL 改写不一定非得发生在系统链接入口，也可以在运行时路由层处理。

## 7. 运行时改写 vs `redirectSystemPath`

文档专门比较了两者：

`redirectSystemPath` 的优点：

- 原生入口改写更直接

缺点：

- **只支持原生**
- **缺乏上下文**

这里的“缺乏上下文”是文档明确说的：

- 它在 App 外部上下文中执行
- 拿不到登录状态、当前路由状态等应用内部信息

## 8. 向第三方服务发送导航事件

文档还展示了另一个常见需求：

- 用 `usePathname()` 监听路径变化
- 在 `useEffect()` 中把路径发送给第三方分析或日志服务

还包括：

- 初始化第三方服务
- 在组件销毁时注销

这说明 Expo Router 路由变化不仅能拿来做重写，也适合做埋点。

## 9. Universal Links 和多域名

文档明确说：

- Expo Router 对 Universal Links 和多个域名**不需要额外配置**
- 所有传给 App 的 URL 都会被评估

如果要自定义 App URL scheme，则需要在 app config 里设置 `scheme`。

## 10. 强制按网页链接打开

如果你希望某个链接优先交给浏览器，而不是当前 App 路由系统，文档建议写成完整 URL：

```tsx
<Link href="https://my-website.com/router/introduction" />
```

关键点是：

- 必须是带 `http` / `https` 的完整域名 URL

## 11. `legacy_subscribe`

文档最后提到一个 alpha API：`legacy_subscribe`

适用场景：

- 第三方提供方不支持 Expo Router，但支持 React Navigation 的 `Linking.subscribe`

但文档明确不推荐新项目使用，因为它：

- 不兼容 Server Side Routing
- 不兼容 Static Rendering
- 在离线或弱网场景下更难管理

## 关键流程 / 命令 / 配置说明

### 关键文件

```text
src/app/+native-intent.tsx
```

### 关键函数

```ts
redirectSystemPath({ path, initial })
```

### 运行时重写入口

- 根 `_layout.tsx`：全局重写
- 某个子目录 `_layout.tsx`：局部重写
- `usePathname()`：读取当前路径
- `<Redirect />`：执行客户端跳转

### 配置项

- app config 里的 `scheme`：自定义 App URL scheme

### 当前文档涉及的命令

当前文档未涉及。

## 注意事项、限制条件和坑点

- `path` 参数不保证是合法 URL，直接解析前要做好兜底。
- 文档明确要求：不要在 `redirectSystemPath` 中崩溃，出错时应重定向到安全路径。
- `+native-intent` 只适用于原生，不适用于 Web。
- `redirectSystemPath` 缺乏登录态、当前路由等应用内部上下文。
- `legacy_subscribe` 是 alpha，且文档不推荐新项目使用。

## React Web 开发者最容易误解的地方

- **误解 1：所有链接问题都能在前端运行时统一处理。**  
  Web 上初始路由在 JS 执行前就已解析，文档明确说没有 `+native-intent` 对等能力。

- **误解 2：传入的 `path` 一定是干净 URL。**  
  文档明确说不能这样假设。

- **误解 3：链接重写一定能读到当前用户状态。**  
  `redirectSystemPath` 运行在应用上下文之外，拿不到这些信息。

- **误解 4：`legacy_subscribe` 是推荐方案。**  
  文档明确说不推荐新项目用。

## 实际开发建议

- 基于文档内容推导：如果你要兼容第三方 referral 链接，先把“输入合法化”作为第一步，不要一上来就假设它能直接匹配路由。
- 基于文档内容推导：凡是依赖登录态、用户角色、当前页面上下文的重写规则，优先放到 `_layout` + `usePathname()`，不要硬塞进 `redirectSystemPath`。
- 基于经验建议：为所有重写失败场景准备一个明确错误页，而不是静默失败。
- 基于经验建议：埋点逻辑与重写逻辑最好分开，避免某个第三方 SDK 异常影响路由可用性。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- 原生端可以用 `+native-intent.tsx` 的 `redirectSystemPath` 改写输入链接。
- Web 上没有完全对等的 `+native-intent` 机制。
- App 已打开时可以在 `_layout` 里用 `usePathname()` 做 URL 重写。
- `redirectSystemPath` 是 native-only，且缺少应用内部上下文。
- 完整 `http/https` URL 会优先作为网页链接由浏览器处理。
- `legacy_subscribe` 不推荐新项目使用。

### 基于文档内容推导

- 链接改写应该分为“系统入口清洗”和“应用内部策略重定向”两层，而不是只靠一个入口。
- Web 与原生在初始路由解析时机不同，所以链接处理策略天然会分叉。
