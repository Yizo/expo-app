# Shared routes

## 文档解决的问题

这篇文档讲的是：在 Expo Router 中，如何让**同一个 URL**在**不同布局**下复用，或者用数组语法批量生成“共享路由”。

它解决的核心问题是：

- 页面内容逻辑相同
- 但用户可能从不同导航上下文进入它
- 进入后希望继承不同的头部、tab、stack 布局

## 适用场景

- 像社交 App 一样，用户资料页可以从“首页”“搜索”“个人中心”等不同 tab 进入。
- 你希望 `/[user]` 这个 URL 保持一致，但它在不同入口下有不同导航壳。
- 你不想把同一路由文件复制多份，而是想复用结构。

## 阅读前需要理解的背景知识

- **Group 目录**：`(home)`、`(search)` 这种括号目录不会出现在最终 URL 中，但会影响布局组织。
- **Shared route**：同一路径在不同 route group 下复用。
- **Array syntax**：例如 `(home,search)`，会在内存里为多个 group 复制子路由。
- **segment**：布局组件里可用来识别当前命中的 group。

## 按原文结构整理的核心内容

## 1. 用 groups 让同一个 URL 对应不同布局

文档先给出最直接的方式：在不同 group 下放同名子路由。

例如：

```text
src/app
  _layout.tsx
  (home)
    _layout.tsx
    [user].tsx
  (search)
    _layout.tsx
    [user].tsx
  (profile)
    _layout.tsx
    [user].tsx
```

这些 `[user].tsx` 最终都可以匹配相同 URL，但会套上不同 group 的布局。

文档用 X 这类社交应用举例：同一个 profile 页面可以出现在多个 tab 里，但 URL 还是同一个。

## 2. 页面刷新时会选哪个布局

文档明确提醒：

- **当页面重新加载时，会渲染按字母顺序排在最前面的匹配项**

这是一个很容易忽视的行为，因为共享路由并不代表“刷新后一定还原你上一次所在的导航上下文”。

## 3. 如何显式导航到指定 group 版本

文档说明：

- 共享路由可以通过把 group 名写进路径来直接访问

例如：

```text
/(search)/baconbrix
```

它会导航到搜索布局中的 `/baconbrix`。

也就是说：

- 对外 URL 可以相同
- 但在内部导航时，你仍然可以显式指定“我要进哪个 group 的版本”

## 4. 数组语法：避免重复定义同一路由

文档接着介绍更高级的方式：

```text
src/app/(home,search)/[user].tsx
```

它的意思不是目录里真的有两份文件，而是：

- Expo Router 会在内存里把它视为
  - `src/app/(home)/[user].tsx`
  - `src/app/(search)/[user].tsx`

文档明确说这是一个**偏原生应用开发语境**的高级概念。

## 5. 如何区分当前命中的是哪个 group

数组语法下，同一个文件会被多个 group 复用，所以布局组件里要通过 `segment` 参数区分当前环境。

文档示例：

```tsx
export default function DynamicLayout({ segment }) {
  if (segment === '(search)') {
    return <SearchStack />;
  }

  return <Stack />;
}
```

这表示：

- 同一份动态布局代码
- 可以根据当前 group 决定返回不同的导航器

## 6. 数组语法要配合 `unstable_settings.initialRouteName`

文档明确要求：

- 如果使用数组语法，需要在动态布局里通过 `unstable_settings` 为各 group 指定 `initialRouteName`

例如：

```ts
export const unstable_settings = {
  initialRouteName: 'home',
  search: {
    initialRouteName: 'search',
  },
};
```

这表示：

- `home` group 的默认页是 `home`
- `search` group 的默认页是 `search`

## 7. 文档列出的关键规则

文档最后给了三条重要限制：

- 只能为**当前 navigator** 提供 groups
- 如果是多层 group（例如 `(one)/(two)`），匹配时只使用**最后一个 group**
- 如果至少有两个 group 的 `initialRouteName`，但没有提供默认的 `initialRouteName`，则会使用**第一个 group** 的 `initialRouteName`

## 关键流程 / 命令 / 配置说明

## 共享路由的两种写法

### 方式一：重复定义

```text
src/app/(home)/[user].tsx
src/app/(search)/[user].tsx
```

### 方式二：数组语法

```text
src/app/(home,search)/[user].tsx
```

## 关键配置

```ts
export const unstable_settings = {
  initialRouteName: 'home',
  search: {
    initialRouteName: 'search',
  },
};
```

## 关键参数

- `segment`：当前命中的 group 标识，用来区分不同布局逻辑

## 当前文档涉及的命令

当前文档未涉及。

## 注意事项、限制条件和坑点

- 页面刷新时，会使用**字母顺序最靠前**的匹配项，这可能和用户上一次所在的导航上下文不一致。
- `href` 必须明确指向单一路由；共享路由场景里如果路径有歧义，必须把 group 写出来。
- 数组语法是高级特性，文档明确说这是偏原生应用开发的概念。
- 多层 group 匹配时，只看最后一层 group。
- 如果数组语法下多个 group 都定义了初始页，但默认 `initialRouteName` 没写，Expo Router 会取第一个 group 的配置。

## React Web 开发者最容易误解的地方

- **误解 1：同一个 URL 只能对应一种页面结构。**  
  在 Expo Router 中，同一 URL 可以在不同 group 布局里复用。

- **误解 2：共享路由只是代码复用。**  
  它不只是减少重复文件，更重要的是“保留不同导航上下文”。

- **误解 3：刷新后一定回到原来那个 tab 上下文。**  
  文档明确说刷新时会取字母序最靠前的匹配项。

- **误解 4：数组语法只是目录写法糖。**  
  它还会影响布局判断、初始路由选择和 `segment` 分支逻辑。

## 实际开发建议

- 基于文档内容推导：如果共享页面只是在视觉上不同，但交互和上下文都相同，没必要上 shared routes，普通组件复用可能更简单。
- 基于文档内容推导：如果共享页面强依赖“我是从哪个 tab 进来的”，shared routes 才会真正体现价值。
- 基于经验建议：在团队协作里，数组语法虽然省文件，但理解成本更高；如果成员对 Expo Router 不熟，显式多文件有时更容易维护。
- 基于经验建议：设计刷新后的兜底体验时，要考虑“字母序优先”的行为，避免刷新后落进意外的导航上下文。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- 可以用 groups 让相同 URL 在不同布局下复用。
- 刷新页面时会渲染字母顺序最靠前的匹配项。
- 可以通过把 group 写进路径来显式导航到某个共享路由版本。
- 数组语法会在内存中复制 group 子路由。
- `segment` 可用于区分当前 group。
- 数组语法需要结合 `unstable_settings.initialRouteName` 使用。

### 基于文档内容推导

- shared routes 的真正价值是“同一业务页面在多个导航上下文下复用”，而不是单纯减少代码量。
- 刷新行为意味着 shared routes 更适合原生 App 风格流程，而不是强依赖浏览器刷新还原上下文的 Web 心智模型。

<!-- NAVIGATION START -->
---
[← 上一页：Web modals](./64_web-modals.md) | [下一页：Protected routes →](./66_protected.md)
<!-- NAVIGATION END -->
