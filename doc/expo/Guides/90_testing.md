# Expo Router 测试配置

## 文档解决的问题

这篇文档讲的是：如何为 Expo Router 编写集成测试。它解决的是“文件系统路由很难 mock”“怎么在内存里搭一个 Router 测试环境”“怎么断言当前路径、段、参数与路由状态”这些问题。

## 适用场景

- 你在用 Jest 和 `@testing-library/react-native`。
- 你希望对 Expo Router 路由行为做集成测试，而不只是测试单个组件。
- 你要模拟深链接初始 URL、fixture 路由目录或内存文件系统。

## 先建立正确心智模型

- Expo Router 强依赖文件系统，因此测试难点不是普通组件渲染，而是“如何模拟路由文件结构”。
- 官方提供 `expo-router/testing-library`，本质上是在 `@testing-library/react-native` 之上增加一层路由测试能力。
- 对 React Web 开发者来说，它类似“内存里的测试路由应用”，但依然遵守 Expo Router 的文件路由规则。

## 核心概念

### 1. 前置依赖

文档明确要求先配置：

- `jest-expo`
- `@testing-library/react-native`

### 2. 测试文件不要放进 `app` 目录

文档明确警告：`app` 目录下的文件必须是路由或布局文件，测试文件应放到 `__tests__` 或单独目录。

### 3. `renderRouter`

这是本页最核心的 API。

它基于测试库的 `render` 扩展而来：

- 返回与 `render` 相同的查询对象
- 与 `screen` 兼容
- 额外支持 `initialUrl`

`initialUrl` 的作用是模拟深链接起始路由。

## 关键流程

### 方案一：内联 mock 文件系统

```tsx
renderRouter(
  {
    index: MockComponent,
    'directory/a': MockComponent,
    '(group)/b': MockComponent,
  },
  {
    initialUrl: '/directory/a',
  }
);
```

文档明确说明：

- key 是 mock 的文件系统路径
- 不要写 `./` 或 `/`
- 不要带文件扩展名

### 方案二：只给路径数组，组件全部为 `null`

```tsx
renderRouter(['index', 'directory/a', '(group)/b'], {
  initialUrl: '/directory/a',
});
```

适合：

- 你只想测试路由流转
- 不关心页面 UI 输出

### 方案三：使用 fixture 目录

```tsx
renderRouter('./my-test-fixture');
```

文档说明：路径应相对于当前测试文件。

### 方案四：fixture + overrides

```tsx
renderRouter({
  appDir: './my-test-fixture',
  overrides: {
    'directory/(auth)/_layout': MockAuthLayout,
  },
});
```

适合：

- 真实 fixture 为主
- 只覆盖其中少量路由或布局

## Jest Matchers

文档为 `expect(screen)` 增加了多种匹配器：

### `toHavePathname()`

断言当前 pathname。

```tsx
expect(screen).toHavePathname('/my-router');
```

### `toHavePathnameWithParams()`

断言包含 query 的完整路径。

```tsx
expect(screen).toHavePathnameWithParams('/my-router?hello=world');
```

### `toHaveSegments()`

断言当前 segments。

```tsx
expect(screen).toHaveSegments(['[id]']);
```

### `useLocalSearchParams()`

断言当前本地 URL 参数。

```tsx
expect(screen).useLocalSearchParams({ first: 'abc' });
```

### `useGlobalSearchParams()`

断言当前全局 URL 参数。

```tsx
expect(screen).useGlobalSearchParams({ first: 'abc' });
```

### `toHaveRouterState()`

高级断言，用来直接校验 router state 对象。

```tsx
expect(screen).toHaveRouterState({
  routes: [{ name: 'index', path: '/' }],
});
```

## 命令、配置、文件说明

### 依赖与工具

- `jest-expo`
- `@testing-library/react-native`
- `expo-router/testing-library`

### 目录建议

- `__tests__/`
  放测试文件
- `app/`
  不要放测试文件

### API

- `renderRouter`
- `screen`
- 自定义 matcher：`toHavePathname`、`toHavePathnameWithParams`、`toHaveSegments`、`useLocalSearchParams`、`useGlobalSearchParams`、`toHaveRouterState`

当前文档未涉及 E2E 测试工具、设备级自动化或 CI 配置。

## 注意事项、限制条件和坑点

- 测试文件不能放在 `app` 目录。
- mock 文件系统路径不能以 `./` 或 `/` 开头，也不能带扩展名。
- fixture 路径则要求相对当前测试文件。
- 当前文档主要是集成测试配置，不是端到端测试方案。

## React Web 开发者容易误解的地方

- 不要把它只看作 `render` 的简单包装。
  它真正解决的是文件系统路由的测试模拟。
- 不要混淆“内联文件系统 mock 路径”和“fixture 目录路径”的规则。
  前者不能带 `./`，后者反而是相对路径字符串。
- 不要把 URL 断言只停留在 pathname。
  Expo Router 已提供 query、segments、router state 级别的断言能力。

## 实际开发建议

- 基于经验建议：先从 `renderRouter + initialUrl` 开始，把深链接入口测稳定，再逐步增加复杂 fixture。
- 基于经验建议：页面 UI 不重要时，优先用字符串数组 mock 文件系统，测试更轻量。
- 基于文档内容推导：路由守卫、分组布局、参数传递这些能力，最适合用 fixture + overrides 的方式覆盖测试。
- 基于文档内容推导：如果你的问题是“页面跳到了哪”“参数对不对”，优先用官方 matcher，不必自己手写很多路由断言工具。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo Router 提供 `expo-router/testing-library`。
- 测试前应配置 `jest-expo` 与 `@testing-library/react-native`。
- 测试文件不能放在 `app` 目录。
- `renderRouter` 支持内联 mock、`null` 组件数组、fixture、fixture + overrides。
- 官方提供多种 router 专用 Jest matcher。

### 基于文档内容推导

- Expo Router 测试的核心不是“组件能不能 render”，而是“路由文件系统能否被可靠模拟”。
- 官方 matcher 足以覆盖大部分路由行为验证，能减少重复造轮子。
