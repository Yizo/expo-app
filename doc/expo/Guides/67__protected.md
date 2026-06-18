# 受保护路由（Protected Routes）

> 原始文档地址：https://docs.expo.dev/router/advanced/protected/
>
> 本文档基于 Expo Router 官方文档翻译整理，适用于 Expo SDK v56。

---

## 概述

在应用中，某些页面不应该被未授权的用户访问。例如，登录页面只在未登录时展示，而私密页面只在登录后才能查看。**受保护路由（Protected Routes）** 就是一种在前端路由层面限制屏幕访问的机制。

**关键术语解释：**

- **受保护路由（Protected Route）**：指那些需要满足特定条件（如用户已登录）才能访问的页面路由。如果条件不满足，用户将被自动重定向到其他页面。
- **守卫（Guard）**：一个布尔值（`true` 或 `false`），用于控制路由是否可访问。当 `guard` 为 `true` 时路由可访问，为 `false` 时路由被保护（不可访问）。
- **回退（Fallback）**：当用户尝试访问受保护路由但条件不满足时，应用自动跳转到的目标页面。

当未授权用户尝试访问受保护的页面，或者用户在浏览某个受保护页面时权限发生变化（例如登出），应用会自动将用户重定向到根回退页面（通常是 `index` 页面）或导航栈中第一个可用的页面。

### 项目结构示例

以下是一个典型的使用受保护路由的项目目录结构：

```text
src/
  app/
    _layout.tsx
    index.tsx
    about.tsx
    login.tsx          （仅在未登录时可访问）
    private/
      _layout.tsx      （仅在已登录时可访问）
      index.tsx
      page.tsx
```

### 基本用法

```tsx
import { Stack } from 'expo-router';

const isLoggedIn = false;

export function AppLayout() {
  return (
    <Stack>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="private" />
      </Stack.Protected>
      {/* Expo Router 默认包含所有路由。添加 Stack.Protected 会为这些屏幕创建访问限制。 */}
    </Stack>
  );
}
```

**代码解析：**

- `Stack.Protected` 是一个包裹组件，用于将一组 `Stack.Screen` 标记为受保护的。
- `guard` 属性接收一个布尔值。当值为 `true` 时，被包裹的屏幕可以正常访问；当值为 `false` 时，屏幕被隐藏且用户会被重定向。
- 在上面的示例中，`isLoggedIn` 为 `false`，因此：
  - `!isLoggedIn` 为 `true` → `login` 页面可以访问
  - `isLoggedIn` 为 `false` → `private` 目录下的页面不可访问，用户会被重定向到 `index` 页面

> **基于文档内容推导：** 当 `guard` 条件从 `true` 变为 `false`（即权限被撤销）时，如果用户正在浏览受保护组内的页面，应用会立即重定向用户，并从导航历史中清除该受保护组的所有历史记录。这意味着用户无法通过返回按钮回到之前的受保护页面。

---

## 多个受保护屏幕组（Multiple Protected Screens）

每个屏幕在同一时刻只能属于一个活跃的受保护组。开发者应该在最合适的容器中只定义一次屏幕，使用条件包裹器而非重复声明。

**错误示例 —— 重复声明屏幕：**

```tsx
import { Stack } from 'expo-router';

const isLoggedIn = true;
const isAdmin = true;

export function AppLayout() {
  return (
    <Stack>
      <Stack.Protected guard={true}>
        <Stack.Screen name="profile" />
      </Stack.Protected>
      <Stack.Screen name="profile" /> // ❌ 不允许：屏幕重复声明
    </Stack>
  );
}
```

> **注意：** 同一个屏幕不能在导航栈中被声明两次，即使一次在 `Protected` 内、一次在外部也不行。每个屏幕只应出现在一个位置。

**正确做法 —— 使用条件包裹器：**

将每个屏幕只定义一次，放在最符合其访问权限的 `Protected` 组中。

> **基于经验建议：** 在实际项目中，建议将 `isLoggedIn`、`isAdmin` 等状态从 React Context 或状态管理库（如 Zustand、Redux）中获取，而非硬编码为常量。这样可以确保登录状态变化时自动触发路由保护的重新评估。

---

## 嵌套受保护屏幕（Nesting Protected Screens）

可以通过将受保护容器嵌套在彼此内部来实现多层级的权限控制逻辑。

```tsx
import { Stack } from 'expo-router';

const isLoggedIn = true;
const isAdmin = true;

export function AppLayout() {
  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Protected guard={isAdmin}>
          <Stack.Screen name="private" />
        </Stack.Protected>

        <Stack.Screen name="about" />
      </Stack.Protected>
    </Stack>
  );
}
```

**代码解析：**

- 最内层的 `private` 目录需要同时满足 `isLoggedIn` 和 `isAdmin` 两个条件才能访问。
- 同级的 `about` 页面只需要满足 `isLoggedIn` 即可访问。
- 这种嵌套模式非常适合实现"普通用户"和"管理员"的多级权限体系。

> **基于文档内容推导：** 嵌套保护是层层递进的——外层 `guard` 为 `false` 时，无论内层 `guard` 是什么值，内层的所有屏幕都不可访问。权限检查从外向内逐层评估。

---

## 回退到特定屏幕（Falling Back to a Specific Screen）

路由系统允许为被拒绝的访问指定一个精确的回退目标页面。

### 项目结构

```text
src/
  app/
    _layout.tsx
    index.tsx
    about.tsx
    login.tsx
    private/
      _layout.tsx
      index.tsx
      page.tsx
```

### 代码示例

```tsx
import { Stack } from 'expo-router';

const isLoggedIn = false;

export function AppLayout() {
  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="private" />
      </Stack.Protected>

      <Stack.Screen name="login" />
    </Stack>
  );
}
```

**代码解析：**

- 在这个示例中，`isLoggedIn` 为 `false`，因此 `index` 和 `private` 都被保护。
- 由于 `index`（首页）也被保护了，框架会默认跳转到第一个可用的页面，即 `login`。
- `login` 页面没有被任何 `Protected` 包裹，因此始终可访问。

> **基于经验建议：** 将登录页面（`login`）放在 `Protected` 组外面是一个常见的最佳实践，确保用户在未登录时总能访问到登录页面。反之，如果希望登录页面仅在未登录时显示，可以用 `guard={!isLoggedIn}` 包裹它。

---

## Tabs 和 Drawer 中的受保护路由

受保护路由的包裹器在 Tab（标签页）布局和 Drawer（抽屉菜单）布局中的使用方式与 Stack 完全一致。

### Tabs 标签页示例

```tsx
import { Tabs } from 'expo-router';

const isLoggedIn = false;

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen name="private" options={{ tabBarLabel: 'Private' }} />
        <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
      </Tabs.Protected>

      <Tabs.Protected guard={!isLoggedIn}>
        <Tabs.Screen name="login" options={{ tabBarLabel: 'Login' }} />
      </Tabs.Protected>
    </Tabs>
  );
}
```

**代码解析：**

- `Tabs.Protected` 的用法与 `Stack.Protected` 完全一致。
- 当 `isLoggedIn` 为 `false` 时：
  - `private` 和 `profile` 标签页被隐藏（不可访问）
  - `login` 标签页可见（因为 `!isLoggedIn` 为 `true`）
  - 底部标签栏中只会显示 "Home" 和 "Login" 两个标签

> **基于文档内容推导：** Drawer（抽屉导航）同样支持 `Drawer.Protected` 包裹器，用法与上述示例一致。只需将 `Tabs` 替换为 `Drawer` 即可，即 `Drawer.Protected` + `Drawer.Screen`。

---

## 自定义导航器（Custom Navigators）

对于使用自定义导航器的场景，开发者可以通过 `withLayoutContext` 工具函数来应用受保护路由功能。

**关键术语解释：**

- **`withLayoutContext`**：Expo Router 提供的一个高阶函数（Higher-Order Function），用于将自定义导航器与 Expo Router 的布局系统集成。通过它包裹后的自定义导航器将获得 `Protected` 等内置功能的支持。

> **基于经验建议：** 如果你正在构建自定义导航器（例如一个自定义的底部导航栏），务必使用 `withLayoutContext` 进行包裹，否则 `Protected` 功能将无法正常工作。这是自定义导航器与 Expo Router 深度集成的关键步骤。

---

## 静态渲染注意事项（Static Rendering Considerations）

> **警告：** 受保护屏幕的检查仅在客户端（client-side）执行。

**关键术语解释：**

- **静态渲染（Static Rendering）**：在构建时预先生成 HTML 页面的技术。对于 Web 端应用，Expo Router 支持将页面静态导出为 HTML 文件，以提升首屏加载速度和 SEO 效果。
- **客户端检查（Client-side Evaluation）**：指权限判断逻辑只在用户的浏览器或设备上运行，而不是在服务器端运行。

具体行为说明：

1. **静态生成时会跳过受保护页面**：当使用静态渲染时，系统不会为受保护的路由生成 HTML 文件。
2. **但原始资源仍可能被直接访问**：如果有人猜到或发现了受保护页面的 URL 地址，他们仍然可能直接请求对应的 JavaScript 或 HTML 资源文件。
3. **前端保护不能替代后端安全**：这意味着受保护路由只是一种用户体验层面的优化（隐藏不应看到的页面、自动重定向），而非真正的安全措施。

> **基于经验建议：** 始终在服务端（后端 API）进行真正的权限验证。前端路由保护只是为了提升用户体验（避免看到 404 或空白页面），绝不能作为唯一的安全手段。例如，即使前端隐藏了 `/admin` 路由，攻击者仍可通过直接请求 API 接口获取数据——因此 API 层面必须有独立的身份验证和授权检查。

---

## API 参考摘要

| 组件 | 所属导航器 | 关键属性 | 说明 |
|------|-----------|---------|------|
| `Stack.Protected` | Stack（堆栈导航） | `guard: boolean` | 包裹 `Stack.Screen`，当 `guard` 为 `false` 时隐藏并重定向 |
| `Tabs.Protected` | Tabs（标签导航） | `guard: boolean` | 包裹 `Tabs.Screen`，当 `guard` 为 `false` 时隐藏标签页 |
| `Drawer.Protected` | Drawer（抽屉导航） | `guard: boolean` | 包裹 `Drawer.Screen`，当 `guard` 为 `false` 时隐藏抽屉项 |

**通用规则：**

- `guard` 属性为 `true` 时，被包裹的屏幕可正常访问
- `guard` 属性为 `false` 时，被包裹的屏幕不可访问，用户被重定向到回退页面
- 动态修改 `guard` 的值会触发重新评估，如果新的值导致屏幕不可访问，导航历史中该组的所有记录将被清除
- 每个屏幕在导航树中只能声明一次
- 受保护容器可以嵌套，实现多层级权限控制

---

## 完整实践示例

以下是一个综合示例，展示了如何在实际项目中组织受保护路由：

```tsx
import { Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth'; // 自定义 Hook，获取登录状态

export default function RootLayout() {
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <Stack>
      {/* 公开页面：始终可访问 */}
      <Stack.Screen name="index" />
      <Stack.Screen name="about" />

      {/* 未登录时可访问 */}
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      {/* 已登录时可访问 */}
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />

        {/* 已登录且为管理员时可访问 */}
        <Stack.Protected guard={isAdmin}>
          <Stack.Screen name="admin" />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  );
}
```

> **基于经验建议：** 在实际项目中，推荐创建一个自定义 Hook（如上面的 `useAuth`）来集中管理认证状态。这样所有布局文件都可以简洁地引用同一套状态，避免在多个文件中重复获取或同步登录信息。

---

## 常见问题

**Q：`guard` 的值可以是一个异步函数吗？**
A：不可以。`guard` 属性只接受同步的布尔值。如果需要异步判断（例如从服务器验证 token），应先在 Hook 或 Context 中完成异步操作，然后将结果作为布尔值传递给 `guard`。

**Q：受保护路由被拒绝后，URL 会变化吗？**
A：是的。当用户尝试访问受保护页面被拒绝时，Expo Router 会自动重定向到回退页面，URL 也会相应更新。

**Q：Web 端的受保护路由安全吗？**
A：不完全安全。如上文"静态渲染注意事项"所述，受保护路由的检查仅在客户端执行，不能替代后端安全验证。

---

## 文档导航

- **上一页**：[shared routes](./66__shared-routes.md)
- **下一页**：[platform specific modules](./68__platform-specific-modules.md)
