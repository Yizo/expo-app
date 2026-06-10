# Router settings

## 文档解决的问题

这篇文档讲的是：如何通过 `unstable_settings` 这样的静态配置，为 Expo Router 的布局补充一些路由行为设置。

当前页面内容非常聚焦，核心只讲了一个设置：`initialRouteName`。

## 适用场景

- 你希望用户通过深链接直达某个页面时，仍然能看到合理的“返回”路径。
- 你在共享路由 / 数组语法场景下，需要为不同 group 指定默认入口页。
- 你想控制进入新布局时，是否要强制使用该布局的初始路由。

## 阅读前需要理解的背景知识

- **`unstable_settings`**：导出在布局文件中的静态配置对象。
- **`initialRouteName`**：某个 stack 的默认初始 screen 名称。
- **深链接**：用户不是从首页逐步点进来，而是直接打开某个深层页面。

## 按原文结构整理的核心内容

## 1. 这是一个“不稳定”配置能力

文档一开始就给出警告：

- `unstable_settings` 当前**不能和 async routes 一起工作**
- async routes 还是开发期能力
- 这也是它叫 `unstable` 的原因

所以这不是完全稳定无风险的长期 API。

## 2. `initialRouteName` 是做什么的

文档说明：

- 当用户通过深链接直接进入某个路由时
- 你可能仍然希望他看到“返回按钮”

此时可以在布局里设置：

```ts
export const unstable_settings = {
  initialRouteName: 'index',
};
```

它必须匹配一个**合法文件名**，但不带扩展名。

例如：

- `index.tsx`
- `other.tsx`

那么 `initialRouteName: 'index'` 指向的就是 `index.tsx`

## 3. 它解决的具体体验是什么

文档明确说明：

- 即使用户直接打开 `/other`
- 或者刷新页面

仍然可以继续显示“返回到 `/` 的返回箭头”

对 React Web 开发者来说，可以把它理解成：为深层页面补出一个导航栈的起点，而不是只把当前页面孤零零打开。

## 4. 数组语法下如何配置不同 group 的初始页

文档还提到 shared routes 的数组语法 `(foo,bar)` 场景。

此时可以在 `unstable_settings` 中按 group 名配置：

```ts
export const unstable_settings = {
  initialRouteName: 'first',
  bar: {
    initialRouteName: 'second',
  },
};
```

表示：

- 默认 group 用 `first`
- `(bar)` 这个 group 用 `second`

## 5. 它只在“深链接进入布局”时生效

这是最容易误解的一点。文档明确说：

- `initialRouteName` **只在 deep linking 到某个 route 时使用**
- 正常应用内导航时，你导航到哪个 route，它就会成为初始页面

换句话说：

- 它不是“永远强行先开 index 再去目标页”
- 它只是在特定进入方式下提供一个默认栈起点

## 6. 如何关闭这种行为

文档还提供了关闭方式：

### `Link` 组件

```tsx
<Link href="/route" initial={false} />
```

### 命令式导航

```ts
router.push('/route', { overrideInitialScreen: false });
```

文档的意思是：

- 如果跳到一个新布局
- 但你不想让 router 用这个布局的初始页覆盖导航语义
- 就显式关闭它

## 关键流程 / 命令 / 配置说明

### 静态配置写法

```ts
export const unstable_settings = {
  initialRouteName: 'index',
};
```

### group 专属配置

```ts
export const unstable_settings = {
  initialRouteName: 'first',
  bar: {
    initialRouteName: 'second',
  },
};
```

### 关闭初始页覆盖

```tsx
<Link href="/route" initial={false} />
```

```ts
router.push('/route', { overrideInitialScreen: false });
```

### 当前文档涉及的命令

当前文档未涉及。

## 注意事项、限制条件和坑点

- `unstable_settings` 目前不支持 async routes，这一点是文档直接警告的。
- `initialRouteName` 必须对应一个有效文件名，不带扩展名。
- 它只在深链接进入时生效，不要误以为所有应用内导航都会先走初始页。
- 如果你在数组语法场景下没有明确设置不同 group 的初始页，实际返回体验可能不符合预期。

## React Web 开发者最容易误解的地方

- **误解 1：`initialRouteName` 等于默认首页。**  
  这里更准确地说，是“在深链接进入某个布局时，为导航栈补一个默认起点”。

- **误解 2：它会影响所有普通导航。**  
  文档明确说只在 deep linking 时使用。

- **误解 3：这个 API 已经稳定。**  
  文档明确标为 `unstable_settings`，而且还提示与 async routes 不兼容。

## 实际开发建议

- 基于文档内容推导：如果你有很多“可分享的详情页”，设置合理的 `initialRouteName` 会让用户从深链接进入后仍然保留自然的返回体验。
- 基于文档内容推导：在 shared routes / 数组语法场景里，`initialRouteName` 往往不是可选优化，而是维持正确导航语义的重要配置。
- 基于经验建议：如果某个路径作为弹窗、透明层或特殊入口打开，不一定适合继承默认初始页，必要时用 `initial={false}` 或 `overrideInitialScreen: false` 显式关闭。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- `unstable_settings` 不能与 async routes 一起工作。
- `initialRouteName` 用来为深链接提供默认 screen。
- 它必须匹配有效文件名。
- 在数组语法场景下可以为特定 group 配置独立初始页。
- `Link initial={false}` 和 `overrideInitialScreen: false` 可以关闭该行为。

### 基于文档内容推导

- `initialRouteName` 的核心价值不在“默认打开哪个页面”，而在“让深链接进来的页面拥有合理的导航上下文”。
