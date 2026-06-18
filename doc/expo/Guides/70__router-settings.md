# 路由设置 (Router Settings)

> **原文地址**：[https://docs.expo.dev/router/advanced/router-settings/](https://docs.expo.dev/router/advanced/router-settings/)

本文档介绍如何通过**静态属性**（static properties）来配置 Expo Router 的布局（Layout）行为。这些配置通过导出一个名为 `unstable_settings` 的对象来实现，允许开发者调整路由栈的默认行为，尤其是在深度链接（Deep Link）场景下的表现。

---

## 重要警告

> **⚠️ 注意：** `unstable_settings` 目前在**开发模式**下无法与**异步路由**（async routes）一起使用，这正是它被标记为 `unstable`（不稳定）的原因。在生产环境中可以正常使用，但在开发阶段如果你使用了异步路由，需要注意此限制。

**关键术语解释：**

- **unstable_settings**：一个可以从布局文件中导出的静态配置对象。"unstable"前缀意味着该 API 尚处于实验阶段，未来版本可能会发生变化。
- **异步路由（Async Routes）**：指通过异步方式（如动态 `import()`）加载的路由组件。在开发模式下使用异步路由时，`unstable_settings` 将不会生效。
- **静态属性**：指在模块顶层通过 `export const` 导出的常量值，在模块加载时即可确定，不需要等到组件渲染。

---

## initialRouteName：设置默认路由屏幕

### 为什么需要 initialRouteName？

在正常的导航流程中，用户从首页逐步进入各个页面，路由栈（navigation stack）会自然地记录完整的导航历史。但是当用户通过**外部链接**（如浏览器 URL、其他应用的深度链接）直接进入某个非首页的页面时，路由栈中没有之前的页面记录，因此不会显示"返回"按钮。

`initialRouteName` 的作用就是：为路由栈设定一个**默认的初始屏幕**，使得即使用户通过外部链接直接访问了某个页面，栈中依然有一个"底层"页面，从而正确显示返回按钮。

### 基本用法

该值必须与路由目录中一个**实际存在的文件名**相对应，且**不包含文件扩展名**。

**项目目录结构：**

```text
src
  app
    _layout.tsx
    index.tsx
    other.tsx
```

**配置代码：**

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  // 确保任何路由都可以链接回 `/`（首页）
  initialRouteName: 'index',
};

export default function Layout() {
  return <Stack />;
}
```

**效果说明：**

配置完成后，当用户通过外部链接直接访问 `/other` 页面，或者在浏览器中刷新 `/other` 页面时，页面顶部仍然会显示返回箭头（←），点击后可以返回到 `index`（首页）。如果没有此配置，用户将看到一个没有返回按钮的孤立页面。

---

## 嵌套配置与数组语法

### 路由分组（Route Groups）中的 initialRouteName

Expo Router 支持使用**路由分组**（以括号命名的目录，如 `(foo)`、`(bar)`）来组织路由。当你使用数组语法（例如 `(foo,bar)`）创建多个分组共享同一个布局时，可以在 `unstable_settings` 中为每个分组分别指定初始路由。

**配置代码：**

```tsx
export const unstable_settings = {
  // 用于 `(foo)` 分组
  initialRouteName: 'first',
  // 用于 `(bar)` 分组
  bar: {
    initialRouteName: 'second',
  },
};
```

**关键术语解释：**

- **路由分组（Route Group）**：以 `(name)` 形式命名的目录，用于组织路由而不影响 URL 路径。例如 `(auth)/login` 的实际 URL 路径是 `/login`，分组名称 `auth` 不会出现在 URL 中。
- **数组语法 `(foo,bar)`**：一种让多个路由分组共享同一个布局文件的写法。例如 `(foo,bar)/_layout.tsx` 会同时为 `(foo)` 和 `(bar)` 两个分组提供布局。
- **segment（路由段）**：这里指 URL 路径或路由分组中的一个具体部分。在嵌套配置中，通过分组名称作为键（key）来定位特定分段的配置。

**配置逻辑说明：**

- 顶层的 `initialRouteName` 作为默认值，应用于没有被单独指定的分组（如上面例子中的 `(foo)`）。
- 使用分组名称作为对象的键（如 `bar`），可以为该分组单独指定 `initialRouteName`。
- 这种机制允许在同一个布局文件中，为不同的路由分组设置不同的初始屏幕。

---

## 链接行为与覆盖机制

### 深度链接 vs 应用内导航

> **⚠️ 重要提示：** `initialRouteName` 配置**仅对深度链接（deep links）生效**。对于应用内部的常规导航，目标路由本身即被视为起始路由。

这意味着：

| 导航场景 | initialRouteName 是否生效 | 行为说明 |
|---------|------------------------|---------|
| 外部深度链接（如从浏览器或其他应用跳转） | ✅ 生效 | 路由栈中包含 initialRouteName 指定的初始页面，显示返回按钮 |
| 应用内部导航（如按钮点击跳转） | ❌ 不生效 | 目标页面直接作为起始页，不会自动插入初始页面 |

### 覆盖默认行为

在某些情况下，你可能希望在应用内部导航时也保留返回到初始路由的能力，或者反过来——在深度链接时不覆盖初始路由。Expo Router 提供了两种方式来控制这一行为：

#### 方式一：通过 Link 组件的 initial 属性

```js
// 当导航到新的 _layout 时，不覆盖初始路由
<Link href="/route" initial={false} />
```

将 `initial` 设为 `false`，可以阻止 Link 组件在导航到新布局时覆盖 `initialRouteName` 的配置。

#### 方式二：通过编程式导航的 overrideInitialScreen 选项

```js
router.push('/route', { overrideInitialScreen: false });
```

在调用 `router.push` 等编程式导航方法时，传入 `overrideInitialScreen: false` 选项，可以达到相同的效果。

**关键术语解释：**

- **深度链接（Deep Link）**：从应用外部直接跳转到应用内某个特定页面的链接。例如从邮件中的链接直接打开应用的某个详情页。
- **编程式导航（Imperative Navigation）**：通过代码（如 `router.push()`、`router.replace()`）而非声明式组件（如 `<Link>`）来触发页面跳转。
- **overrideInitialScreen**：一个导航选项，用于控制是否用目标路由覆盖由 `initialRouteName` 设定的初始屏幕。设为 `false` 时保留初始屏幕配置。

---

## 完整示例汇总

以下将本文档中所有代码示例集中展示，方便查阅：

### 示例 1：基本的 initialRouteName 配置

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  // 确保任何路由都可以链接回 `/`（首页）
  initialRouteName: 'index',
};

export default function Layout() {
  return <Stack />;
}
```

### 示例 2：路由分组的嵌套 initialRouteName 配置

```tsx
export const unstable_settings = {
  // 用于 `(foo)` 分组
  initialRouteName: 'first',
  // 用于 `(bar)` 分组
  bar: {
    initialRouteName: 'second',
  },
};
```

### 示例 3：Link 组件中禁用初始路由覆盖

```js
// 当导航到新的 _layout 时，不覆盖初始路由
<Link href="/route" initial={false} />
```

### 示例 4：编程式导航中禁用初始路由覆盖

```js
router.push('/route', { overrideInitialScreen: false });
```

---

## 基于经验建议

> **基于经验建议：** 在实际项目中，建议始终为根布局（root layout）的 `_layout.tsx` 设置 `initialRouteName: 'index'`。这是一个低成本但收益显著的配置——它能确保所有通过深度链接进入应用的用户都拥有正常的返回导航体验，避免出现"无法返回"的孤立页面。

> **基于经验建议：** 如果你的项目使用了路由分组并且多个分组共享布局，务必为每个分组分别配置 `initialRouteName`。不要依赖顶层的默认值来覆盖所有分组，因为不同分组下的路由文件名可能不同，一个通用的默认值可能在某些分组中不存在而导致意外行为。

> **基于经验建议：** 虽然 `unstable_settings` 带有"unstable"前缀，但 `initialRouteName` 这个配置项本身已经相当稳定且被广泛使用。不必因为这个前缀就回避使用它，只需关注后续版本更新中是否有 API 变更即可。

---

## 基于文档内容推导

> **基于文档内容推导：** 从 `initialRouteName` 仅对深度链接生效这一设计可以看出，Expo Router 在内部区分了"外部进入"和"内部导航"两种场景。外部进入时需要构建完整的导航栈（包含初始路由），而内部导航时用户已经在应用上下文中，导航栈由用户的实际操作路径自然形成。这种设计既保证了深度链接的可用性，又不会干扰应用内正常的导航流程。

> **基于文档内容推导：** `Link` 组件的 `initial` 属性和 `router.push` 的 `overrideInitialScreen` 选项提供了两个层面的控制——声明式和编程式。这体现了 Expo Router 一贯的设计哲学：对于简单场景使用声明式组件（`<Link>`），对于需要更多控制的场景使用编程式 API（`router`）。开发者应根据具体场景选择合适的方式。

---

## 总结

| 配置项 / API | 用途 | 适用场景 |
|-------------|------|---------|
| `unstable_settings.initialRouteName` | 设置路由栈的默认初始屏幕 | 深度链接场景下显示返回按钮 |
| 嵌套分组配置（如 `bar: { initialRouteName: '...' }`） | 为特定路由分组设置初始屏幕 | 多个路由分组共享布局时 |
| `<Link initial={false}>` | 阻止 Link 导航时覆盖初始路由 | 声明式导航中保留初始路由配置 |
| `router.push(url, { overrideInitialScreen: false })` | 阻止编程式导航覆盖初始路由 | 编程式导航中保留初始路由配置 |

---

## 文档导航

- **上一页**：[native intent](./69__native-intent.md)
- **下一页**：[apple handoff](./71__apple-handoff.md)
