# Expo Router Typed Routes

## 文档解决的问题

这篇文档讲的是：如何让 Expo Router 的链接、路由参数与导航 API 具备静态类型检查。它解决的是“路径写错只能运行时报错”“动态参数名拼错没人发现”“`href` 自动补全缺失”这些问题。

## 适用场景

- 你在项目里使用 TypeScript。
- 你希望 `<Link href>`、导航 hook、参数读取都能获得类型保护。
- 你的路由越来越多，希望减少字符串硬编码带来的错误。

## 先建立正确心智模型

- 这是 Expo CLI 基于文件系统路由自动生成类型，而不是你手写一整套路由类型表。
- 它属于“构建时/开发时类型增强”，不是运行时路由守卫。
- React Web 开发者可以把它理解为：让文件系统路由像类型化的 URL schema。

文档明确说明：

- 需要 TypeScript 项目
- 当前功能处于 beta
- 默认不启用

## 核心概念

### 1. Expo CLI 自动生成类型

文档说明，当 typed routes 启用后，Expo CLI 会自动为 `<Link>` 和 hooks API 生成静态类型。

### 2. 首次运行会生成所需类型文件

如果项目按 Expo Router quick start 创建，首次执行 `npx expo start` 时就会生成需要的类型文件。

### 3. `href` 会得到自动补全与校验

这会显著降低路径字符串写错的概率。

### 4. 路径参数可以被强类型化

`useLocalSearchParams` 和 `useGlobalSearchParams` 可通过泛型拿到更精确的参数类型。

### 5. Query 参数很多时候需要手动标注

文档明确说明：大多数 query 参数不会体现在文件系统里，因此不能自动推导，需要手动写泛型。

## 关键流程

### 快速开始

文档明确说明：如果你使用 Expo Router quick start 创建项目，通常已经配置好 typed routes。首次运行：

```bash
npx expo start
```

就会生成类型文件。

### 手动配置

文档说明该能力默认不启用，需要手动打开。当前页面明确存在“Manual configuration”章节，但你在使用时应以当前项目实际配置为准。

### 获取强类型路径参数

```tsx
const { profile, search } = useLocalSearchParams<'/(search)/[profile]/[...search]'>();
```

这类写法会让：

- `profile` 推断为 `string`
- `search` 推断为 `string[]`

### 获取 query 参数

```tsx
const { query } = useLocalSearchParams<{ query?: string }>();
```

### 同时类型化路径参数与 query 参数

```tsx
const { query, profile, search } = useLocalSearchParams<
  '/[profile]/[...search]',
  { query?: string }
>();
```

## 环境改动

文档明确说明，启用 typed routes 后 Expo CLI 会自动做这些事情：

- 在项目根目录生成 `expo-env.d.ts`
- 修改 `.gitignore`，忽略 `expo-env.d.ts`
- 修改 `tsconfig.json`，把 `expo-env.d.ts` 和隐藏的 `.expo` 目录加入 `includes`

文档还明确强调：

- 这些 `includes` 不能删除
- `expo-env.d.ts` 不应删除、不应修改、也不应提交到版本控制

## 对 React Native Web 类型的增强

文档说明，typed routes 开启后还会顺带增强 `react-native` 的 Web 类型，例如：

- 给 `ViewStyle`、`TextStyle`、`ImageStyle` 增加更多 Web 专用样式
- 给 `TextProps` 增加 `tabIndex`、`aria-level`、`lang`
- 给 `Pressable` 的状态回调增加 `hovered`
- 增加 `className`

这对 React Web 开发者很重要，因为它不仅是“路由类型化”，还改善了 RN Web 的类型体验。

## 命令、配置、文件说明

### 命令

```bash
npx expo start
```

作用：首次生成 typed routes 相关类型文件。

### 文件

- `expo-env.d.ts`
  CLI 生成的环境与路由类型声明文件。
- `tsconfig.json`
  会被自动更新 `includes`。
- `.gitignore`
  会被自动更新以忽略 `expo-env.d.ts`。

### 常用 API

- `<Link />`
- `useLocalSearchParams`
- `useGlobalSearchParams`

## 注意事项、限制条件和坑点

- 当前功能是 beta。
- 需要 TypeScript。
- 默认不启用。
- 大多数 query 参数不能自动从文件系统推出，需要手动标注类型。
- `expo-env.d.ts` 不应删除、修改或提交。
- `tsconfig.json` 中新增的 `includes` 不应移除。

## React Web 开发者容易误解的地方

- 不要以为 typed routes 只影响 `<Link href>`。
  它还影响参数 hook、环境类型、RN Web 类型扩展。
- 不要把 query 参数和路径参数的自动类型推导混为一谈。
  文档明确说 query 参数很多时候需要手动写泛型。
- 不要手动管理 `expo-env.d.ts`。
  这是 CLI 生成文件，不是给你手写维护的。

## 实际开发建议

- 基于经验建议：中大型项目应尽早开启 typed routes，避免路由越多越难收敛字符串错误。
- 基于经验建议：对 query 参数保持显式类型声明，能让页面状态流转更稳定。
- 基于文档内容推导：如果团队大量使用 React Native Web，typed routes 带来的 Web 类型增强也会提升日常开发体验。
- 基于文档内容推导：出现类型异常时，先检查 `expo-env.d.ts` 与 `tsconfig.json` 的自动修改是否被误删。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- typed routes 依赖 TypeScript。
- 该功能为 beta，默认不启用。
- Expo CLI 会自动生成 `expo-env.d.ts`，并修改 `.gitignore` 与 `tsconfig.json`。
- query 参数大多需要手动标注类型。
- 会增强 React Native Web 的相关类型。

### 基于文档内容推导

- typed routes 的价值不只是“更安全的 href”，还包括更完整的编辑器体验和参数契约。
- 只要项目依赖文件系统路由，类型生成就应被视为 CLI 管理资产，而不是手工资产。
