# Platform-specific extensions and module

## 文档解决的问题

这篇文档讲的是：在 Expo Router 里，如何根据不同平台切换模块或页面实现，让同一套路由在 Web、iOS、Android 上呈现不同内容。

它解决的是“**同一路由，不同平台实现**”的问题。

## 适用场景

- Web 上想用自定义头部布局，原生端想用底部 tabs。
- 某个页面在 iOS、Web 上设计完全不同。
- 你希望保留统一的路由路径，但底层 UI 可以分平台拆开实现。

## 阅读前需要理解的背景知识

- **平台特定扩展名**：如 `.ios.tsx`、`.android.tsx`、`.native.tsx`、`.web.tsx`
- **`Platform` 模块**：React Native 提供的运行时平台判断能力。
- **Metro**：Expo / React Native 默认打包器，会自动选择合适的平台文件。

## 按原文结构整理的核心内容

## 1. 两种分平台方式

文档给出两种方法：

- **平台特定扩展名**
- **`Platform` 模块运行时判断**

前者偏“文件级分支”，后者偏“代码级分支”。

## 2. 在 `src/app` 目录内使用平台扩展名的规则

文档明确指出：

- 在 `src/app` 目录中，平台扩展名只有在**同时存在一个非平台版本文件**时才受支持

例如：

```text
src/app
  _layout.tsx
  _layout.web.tsx
  index.tsx
  about.tsx
  about.web.tsx
```

这里：

- `_layout.web.tsx` 只在 Web 使用
- `_layout.tsx` 作为其他平台默认布局
- `about.web.tsx` 只在 Web 使用
- `about.tsx` 作为其他平台默认页面

文档还明确解释了这样做的原因：**为了保证路由在各平台上仍然是统一、可深链接的**。

## 3. 为什么必须保留“非平台版本”

React Web 开发者很容易觉得：

- 既然只想做 Web 版本，那只保留 `about.web.tsx` 不就行了？

但文档明确不这么允许。原因是 Expo Router 仍然想保持：

- 这个路由在路由层面是“通用存在”的
- 各平台只是实现不同，不是路径定义本身消失

## 4. 在 `src/app` 目录外使用平台扩展名

文档给出的第二种结构是：

```text
src/app
  about.tsx
src/components
  about.tsx
  about.ios.tsx
  about.web.tsx
```

然后在 `src/app/about.tsx` 中简单写：

```tsx
export { default } from '@/components/about';
```

这样做的含义是：

- 路由文件仍保持统一
- 真正分平台的差异放到路由目录之外的组件层
- Metro 会根据当前平台自动选择正确实现

这通常会让路由层更干净。

## 5. 使用 `Platform` 模块做运行时分支

除了文件级分支，文档还给了运行时代码分支的例子：

- Web 时返回自定义 header + `Slot`
- 原生时返回 `Tabs`

也就是：

```tsx
if (Platform.OS === 'web') {
  return <WebLayout />;
}
return <Tabs />;
```

这说明你不一定非要拆成多个文件，也可以在一个布局组件里动态判断平台。

## 关键概念解释

### 平台特定扩展名

通过文件名后缀让 Metro 自动选用：

- `.web.tsx`
- `.ios.tsx`
- `.android.tsx`
- `.native.tsx`

### `src/app`

这是 Expo Router 的路由目录。这里面的文件不只是组件，还直接对应路由定义。

### `Slot`

表示“把当前子路由渲染进来”的位置。

### `Platform.OS`

运行时平台标识，常见值包括 `web`、`ios`、`android`。

## 关键流程 / 命令 / 配置说明

### 在路由目录内分平台

```text
src/app/about.tsx
src/app/about.web.tsx
```

要求：

- 必须保留 `about.tsx` 这种非平台版本

### 在路由目录外分平台

```text
src/components/about.tsx
src/components/about.web.tsx
src/components/about.ios.tsx
```

然后在路由文件中转出：

```tsx
export { default } from '@/components/about';
```

### 运行时分支

```tsx
if (Platform.OS === 'web') {
  return <WebLayout />;
}
return <Tabs />;
```

### 当前文档涉及的命令

当前文档未涉及。

## 注意事项、限制条件和坑点

- 在 `src/app` 目录里使用平台后缀时，**必须同时存在非平台版本文件**。
- 这个限制不是随意的，文档明确说它是为了保证路由的跨平台一致性和深链接能力。
- 如果你的差异实现很多，直接在 `src/app` 里堆大量 `.web.tsx` / `.ios.tsx` 路由文件，长期可能会让路由层很难读。
- 使用 `Platform` 模块虽然灵活，但会把多平台逻辑揉到一个文件里，复杂时可读性会下降。

## React Web 开发者最容易误解的地方

- **误解 1：平台文件就是普通组件替换。**  
  在 `src/app` 中，它还关系到路由是否保持统一定义。

- **误解 2：只写 `about.web.tsx` 也能算完整路由。**  
  文档明确说不行，必须有非平台版本。

- **误解 3：分平台就一定要拆文件。**  
  文档明确给了 `Platform` 运行时分支方案。

- **误解 4：Web 与原生布局差异只能在页面内部处理。**  
  文档示例展示了连 `_layout.tsx` 都可以分平台。

## 实际开发建议

- 基于文档内容推导：如果差异主要是 UI 结构不同，优先把平台特定实现放到 `src/app` 外的组件目录，再由路由文件统一导出，维护性通常更好。
- 基于文档内容推导：如果只是少量细节分支，例如 header 展示不同，用 `Platform.OS` 就够了，不一定要拆多文件。
- 基于经验建议：先确定“差异发生在路由层还是组件层”，再决定用平台文件还是运行时判断，避免过度设计。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- Expo Router 支持平台扩展名和 `Platform` 模块两种方式。
- 在 `src/app` 中，平台扩展名要配合非平台版本文件使用。
- 这样做是为了让路由在所有平台上保持统一并支持深链接。
- 在 `src/app` 外部也可以使用平台文件，然后由路由文件重新导出。

### 基于文档内容推导

- 路由目录更适合承载“稳定路由定义”，而不是大量平台差异实现。
- 如果平台差异越来越大，把差异收敛到组件层，比让路由层充满平台分支更容易维护。
