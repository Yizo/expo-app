# Expo Router 中的认证与受保护路由

## 文档解决的问题

这篇文档解决的是：如何在 Expo Router 中实现登录态管理、如何保护路由、如何在原生端与 Web 端持久化会话，以及在 modal 登录模式下如何保留页面上下文。

## 适用场景

- 你的应用有“登录后才能访问”的页面。
- 你需要让未登录用户访问 `/sign-in`，但拦住其他业务页。
- 你想支持 deep link 进入业务页时自动根据登录态重定向。
- 你想在登录前展示 splash，避免鉴权状态未加载就闪错页面。

## React Web 开发者先要补的背景

- Expo Router 中“路由存在”与“用户是否允许访问”是两回事。
- 文档明确说明：所有路由始终是定义好的，你要用运行时逻辑决定用户能否进入。
- 这和一些 Web 框架依赖服务端中间件提前拦截请求的方式不同。

## 两种认证思路

文档开头明确说明有两类技术路径：

- Protected Routes
- Modal + 局部认证处理

整篇文档主要展开的是第一类，并给出第二类的基本结构。

## 一、使用 Protected Routes

### 目标结构

文档给出的示意：

- `sign-in.tsx`：始终可访问
- `(app)`：需要认证的路由组

这是一种很清晰的结构分层：

- 公共入口页放外面
- 业务私有页放到受保护 group 里

## 二、建立认证上下文

文档要求使用 React Context 暴露认证信息。

示例上下文提供：

- `signIn`
- `signOut`
- `session`
- `isLoading`

文档还明确说明这是 mock 实现，你可以换成自己的认证提供者。

### `useStorageState`

文档提供了一个基础 hook，用来持久化 token / session。

关键点：

- Native：使用 `expo-secure-store`
- Web：使用 `localStorage`

这对 React Web 开发者非常关键，因为它清楚说明了跨平台“存储层”并不统一。

## 三、启动阶段保留 Splash Screen

文档专门创建了 `SplashScreenController`。

逻辑是：

- `SplashScreen.preventAutoHideAsync()`
- 在 `isLoading` 结束前保持 splash
- 加载完成后 `SplashScreen.hide()`

为什么这很重要：

- 认证状态通常是异步读取的
- 如果不挡住首屏，页面可能先短暂渲染错误路由，再被重定向

## 四、在根布局挂载认证上下文

文档要求：

- 在 root layout 中包 `SessionProvider`
- `SplashScreenController` 必须放在 `SessionProvider` 内部

这意味着：

- 整个路由树都能访问认证状态
- splash 控制器也能读取 `isLoading`

## 五、创建登录页

文档示例中的 `/sign-in`：

- 放在 `(app)` 外部
- 调用 `signIn()`
- 成功后 `router.replace('/')`

文档还提醒，这里你可能需要根据自己的真实登录流程调整“何时导航”。

## 六、用 `Stack.Protected` 保护路由

这是整篇文档最核心的 API。

文档示例：

```tsx
<Stack>
  <Stack.Protected guard={!!session}>
    <Stack.Screen name="(app)" />
  </Stack.Protected>

  <Stack.Protected guard={!session}>
    <Stack.Screen name="sign-in" />
  </Stack.Protected>
</Stack>
```

### 它解决什么

文档明确说明：

- 未登录时，受保护页面不可访问
- 如果用户试图进入受保护页面，会被重定向到 anchor route 或当前 stack 中第一个可访问页面
- 即使当前正在看的页面后来变成受保护，也会被重定向

## 七、已登录页面如何退出

文档示例在受保护页面中调用 `signOut()`。

因为 `RootNavigator` 的 guard 会重新计算，所以退出后会自动回到登录页。

这说明：

- 页面跳转不一定要在业务代码中手写
- 有时只要改变 session 状态，路由结构就会自动切换

## 八、`(app)/_layout.tsx` 的角色

文档给出：

```tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  return <Stack />;
}
```

它的作用是给已认证区域再建立自己的内部导航栈。

## 九、deep link 行为

文档明确说明：

- 如果用户通过 deep link 直接进入受保护页面
- 仍然会被重定向到登录页

这说明保护逻辑不只覆盖应用内点击跳转，也覆盖外部链接进入。

## 十、Modal 登录模式

文档还介绍了另一种结构：

- app 主内容先渲染
- `sign-in` 作为 modal 盖在上面

文档给出的例子中：

- `(root)` 代表需要授权的主内容
- `sign-in` 作为 `presentation: 'modal'`

### 这种模式的意义

文档明确说明：

- 可在认证完成后更容易恢复 deep link 上下文
- 但要求后台页面也能在未认证状态下正确处理数据加载

这是和“直接重定向到登录页”最大的区别。

## 十一、Web 上的 middleware 现状

文档明确说明：

- Expo Router 的 Web 目前只支持构建期静态生成
- 不支持自定义 middleware 或 serving

因此当前的鉴权方式主要是：

- 客户端重定向
- 加载态处理

## 文件、配置与依赖说明

### 关键文件

- `ctx.tsx`：认证上下文与 `useSession`
- `useStorageState`：会话持久化 hook
- `SplashScreenController`：splash 控制
- `src/app/_layout.tsx`：挂 Provider
- `src/app/sign-in.tsx`：登录页
- `src/app/(app)/_layout.tsx`：认证后业务区 layout

### 关键依赖

文档直接使用到：

- `expo-secure-store`
- `expo-router`
- React Context
- `localStorage`（Web）

## 注意事项、限制与坑点

### 1. 所有路由始终存在

不要把“路由受保护”误解成“未登录时路由不会被定义”。

### 2. splash 控制非常重要

如果你不在 session 加载完成前挡住首屏，可能出现闪屏或错误重定向。

### 3. modal 登录模式要求更高

文档明确提醒：后台主页面会先渲染，因此未认证状态下的数据加载逻辑必须安全。

### 4. Web 没有服务端 middleware 兜底

这篇文档明确指出当前只能主要依赖客户端方案。

## React Web 开发者最容易误解的点

### 1. 这不是传统“路由守卫 + 服务端重定向”模式

至少当前文档场景下，核心是客户端 guard。

### 2. native 与 Web 的会话存储位置不同

Web 用 `localStorage`，native 用 `SecureStore`。

### 3. 改变登录态本身就会触发导航结果变化

不一定每次都要手工 `navigate`。

## 实际开发建议

- 基于经验建议：先用 `SessionProvider + Stack.Protected` 跑通最小闭环，再替换成真实鉴权接口。
- 基于经验建议：如果产品要求登录后回到用户原本访问的内容，优先评估 modal 登录模式是否更合适。
- 基于文档内容推导：如果你的 Web 站点非常依赖服务端鉴权与中间件，当前 Expo Router Web 鉴权模式可能需要额外基础设施补齐。

## 文档明确说明

- 所有路由始终定义存在，访问控制靠运行时逻辑。
- 可通过 `Stack.Protected` 实现受保护路由。
- 推荐用 React Context 暴露认证状态。
- Native 使用 `expo-secure-store`，Web 使用 `localStorage`。
- 认证加载期间可借助 splash 防止错误首屏。
- deep link 到受保护页面时也会被重定向。
- 还可使用 modal 登录模式保留更多页面上下文。
- Web 目前不支持自定义 middleware 或 serving。

## 基于文档内容推导

- Expo Router 的认证设计更接近“前端状态驱动的导航裁剪”，而不是“请求级拦截”。
- 认证模块要尽早抽象成独立 provider，否则后续在多个 layout 中复用会很乱。
- 对跨平台项目来说，统一 `session` 抽象、分平台存储实现，是非常自然的分层方式。

## 当前文档未涉及

- 真实 OAuth / JWT / 刷新 token 流程。
- 后端接口设计。
- 服务端渲染或边缘中间件层面的认证实现。
