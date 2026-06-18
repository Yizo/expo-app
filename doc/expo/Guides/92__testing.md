> **原始文档地址**：https://docs.expo.dev/router/reference/testing/

# 测试配置

本文档介绍如何为使用 Expo Router 构建的应用编写集成测试（Integration Tests）。由于 Expo Router 深度依赖文件系统来定义路由，直接对路由进行 mock 可能会非常困难。为此，Expo Router 提供了一个专用的测试子模块 `expo-router/testing-library`，它建立在广受欢迎的 React Native Testing Library 之上，帮助你快速启动一个已配置好的内存应用实例用于测试。

> **关键术语解释（面向初学者）**：
>
> - **集成测试（Integration Test）**：与单元测试（只测试单个函数或组件）不同，集成测试验证多个模块组合在一起时的行为是否正确。对于路由来说，就是测试导航、页面切换等完整流程。
> - **Mock（模拟）**：在测试中用假的实现替代真实模块，以隔离被测代码、避免外部依赖的影响。例如，用假组件替代真实的页面组件。
> - **React Native Testing Library**：一个流行的 React Native 测试工具库，提供了渲染组件、查询元素、模拟用户交互等 API。Expo Router 的测试工具正是基于此库扩展而来。
> - **内存应用（In-memory App）**：不需要启动真实的设备或模拟器，而是在 Node.js 进程内存中运行的应用实例，速度更快、资源消耗更少。
> - **Jest**：JavaScript/TypeScript 生态中最流行的测试框架，提供了断言（assertion）、mock、测试运行器（test runner）等核心功能。

## 前置配置

在开始编写路由测试之前，你需要先完成以下两项配置：

1. **配置 Jest Expo 预设（jest-expo preset）**：参考 [单元测试指南](/develop/unit-testing.md) 进行配置。`jest-expo` 是 Expo 官方提供的 Jest 预设包，它自动处理了 Expo 项目中的模块转换、平台模拟等复杂配置。

2. **安装 React Native Testing Library**：参考 [React Native Testing Library 快速入门指南](https://callstack.github.io/react-native-testing-library/docs/start/quick-start) 安装 `@testing-library/react-native` 包。

> **⚠️ 重要警告**：**切勿将测试文件放在 `app` 目录中！** `app` 目录是严格保留给路由和布局文件使用的。测试文件应该放在专门的测试目录中（例如 `__tests__/` 目录）。违反此规则会导致 Expo Router 将测试文件误认为路由，引发意外行为。请参阅 [单元测试结构指南](/develop/unit-testing.md#structure-your-tests) 了解正确的测试目录组织方式。

> **基于经验建议**：建议在项目根目录创建 `__tests__/` 目录来存放所有测试文件，并在 Jest 配置中通过 `testMatch` 或 `testPathPattern` 指定只匹配该目录下的文件，这样可以彻底避免测试文件被误识别为路由。

## `renderRouter` 工具函数

`renderRouter` 是 `expo-router/testing-library` 提供的核心工具函数，它扩展自 React Native Testing Library 的标准 [`render`](https://callstack.github.io/react-native-testing-library/docs/api#render) 方法，专门用于简化路由相关的测试。

### 基本特性

- 返回与标准 `render` 相同的查询对象（query object），支持使用所有标准 [查询 API](https://callstack.github.io/react-native-testing-library/docs/api/queries) 来定位页面元素。
- 支持 [`screen`](https://callstack.github.io/react-native-testing-library/docs/api#screen) 对象，可以通过 `screen.getByText()` 等方式查询渲染结果。
- 接受所有标准的 [渲染选项（render options）](https://callstack.github.io/react-native-testing-library/docs/api#render-options)。
- 额外支持 `initialUrl` 参数，用于模拟深度链接（Deep Linking）场景 —— 即用户通过一个特定 URL 直接进入应用某个页面，而非从首页开始导航。

> **关键术语解释（面向初学者）**：
>
> - **深度链接（Deep Linking）**：通过一个完整的 URL 直接打开应用中的某个特定页面，而不是从首页开始逐级导航。例如 `myapp://profile/123` 直接打开个人资料页。
> - **screen 对象**：React Native Testing Library 提供的全局对象，始终指向当前渲染的最新状态，方便你查询页面上的元素。
> - **查询 API（Query API）**：如 `getByText`、`getByTestId`、`queryByRole` 等方法，用于在渲染的组件树中查找特定元素。

## 四种使用签名

`renderRouter` 支持四种不同的调用方式，适用于不同的测试场景。

### 1. 内联文件系统 Mock（Inline File System Mock）

通过传入一个对象来模拟文件系统，对象的键为文件路径，值为对应的 React 组件。

**路径格式要求**：
- 路径键 **不能** 包含文件扩展名（如 `.tsx`、`.ts`）
- 路径键 **不能** 以 `/` 开头（即不能使用绝对路径或相对路径前缀）
- 路径使用 `/` 作为目录分隔符

```tsx
import { renderRouter, screen } from 'expo-router/testing-library';
import { View } from 'react-native';

it('my-test', async () => {
  const MockComponent = jest.fn(() => <View />);

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

  expect(screen).toHavePathname('/directory/a');
});
```

> **关键术语解释（面向初学者）**：
>
> - **`jest.fn()`**：Jest 提供的模拟函数（mock function），可以追踪被调用的次数和参数，在测试中常用来创建桩组件（stub component）。
> - **`index`**：在 Expo Router 中，`index` 代表目录下的默认路由，即访问 `/` 时加载的页面，类似于网站中的 `index.html`。
> - **`(group)`**：Expo Router 中的路由分组语法。用圆括号包裹的目录名表示一个"分组"，它影响布局结构但不会出现在 URL 路径中。例如 `(group)/b` 对应的 URL 路径是 `/b`，而非 `/(group)/b`。
> - **`initialUrl`**：`renderRouter` 的额外选项，用于设置应用启动时的初始 URL，模拟用户通过深度链接直接进入某个页面的场景。

### 2. 空组件内联 Mock（Null Component Inline Mock）

通过传入一个字符串数组来模拟文件系统，数组中每个字符串代表一个路由路径。所有路径会自动生成返回 `null` 的组件（即不渲染任何可见内容）。

这种方式非常适合 **只关心路由逻辑而不关心页面渲染输出** 的测试场景，例如测试路由匹配、导航跳转、URL 参数解析等。

```tsx
import { renderRouter, screen } from 'expo-router/testing-library';

it('my-test', async () => {
  renderRouter(['index', 'directory/a', '(group)/b'], {
    initialUrl: '/directory/a',
  });

  expect(screen).toHavePathname('/directory/a');
});
```

> **基于经验建议**：在编写路由导航逻辑的测试时，优先使用空组件 Mock 方式（字符串数组）。它比完整组件 Mock 更简洁、运行更快，而且避免了不必要的 UI 渲染。只有当你需要测试页面的具体内容或交互时，才使用第一种带组件的内联 Mock。

### 3. Fixture 目录路径

通过传入一个字符串来指向一个真实的物理目录，从而 Mock 一个已有的 fixture（测试固件/夹具）。该路径必须是 **相对于测试文件** 的相对路径。

```tsx
import { renderRouter } from 'expo-router/testing-library';
import { View } from 'react-native';

it('my-test', async () => {
  const MockComponent = jest.fn(() => <View />);
  renderRouter('./my-test-fixture');
});
```

> **关键术语解释（面向初学者）**：
>
> - **Fixture（测试固件）**：在测试中使用的预定义的、固定的数据或文件集合。在这里指的是一个包含路由文件的目录，其文件结构模拟了真实的 `app` 目录布局。
> - **相对路径**：相对于当前测试文件所在位置的路径。例如 `./my-test-fixture` 表示测试文件同级目录下的 `my-test-fixture` 文件夹。

> **基于经验建议**：Fixture 目录方式适合测试路由结构较复杂且需要在多个测试用例之间共享同一套路由文件的场景。建议在 `__tests__/fixtures/` 目录下组织你的 fixture 文件，保持测试资源的整洁有序。

### 4. Fixture 路径 + 覆盖（Fixture Paths with Overrides）

对于更复杂的测试场景，你可以组合使用物理目录路径和内联覆盖。`appDir` 字符串指向基础 fixture 文件夹，`overrides` 对象用于替换该结构中的特定路由。

```tsx
import { renderRouter } from 'expo-router/testing-library';
import { View } from 'react-native';

it('my-test', async () => {
  const MockAuthLayout = jest.fn(() => <View />);
  renderRouter({
    appDir: './my-test-fixture',
    overrides: {
      'directory/(auth)/_layout': MockAuthLayout,
    },
  });
});
```

> **关键术语解释（面向初学者）**：
>
> - **`_layout`**：Expo Router 中的布局文件，用于定义一组路由的共享 UI 结构（如导航栏、标签栏）。`_layout` 文件不会作为独立路由出现，而是包裹其子路由。
> - **覆盖（Override）**：在测试中用自定义的 Mock 组件替换某个特定的路由组件，而不影响其他路由。这在测试认证流程时非常有用 —— 你可以替换认证布局组件来模拟已登录/未登录状态。

> **基于文档内容推导**：这种 override 模式在测试涉及认证（Authentication）的路由时尤其有用。例如，你可以使用真实的 fixture 目录保持大部分路由不变，只替换认证相关的 `_layout` 组件来控制认证状态，从而测试受保护路由的行为。

## 自定义 Jest 匹配器（Custom Jest Matchers）

`expo-router/testing-library` 为 Jest 的 `expect` 函数添加了多个自定义匹配器，用于直接对 `screen` 对象进行路由相关的断言。

> **关键术语解释（面向初学者）**：
>
> - **匹配器（Matcher）**：Jest 中用于进行断言的方法，如内置的 `toBe()`、`toEqual()` 等。自定义匹配器是第三方库扩展的额外断言方法，专门用于特定领域的测试。
> - **断言（Assertion）**：测试中验证"实际结果是否符合预期"的语句。例如 `expect(x).toBe(1)` 断言 `x` 的值等于 `1`。

### `toHavePathname()`

验证当前的路径名（pathname）字符串。该匹配器基于 [`usePathname`](/versions/latest/sdk/router.md#usepathname) Hook 读取当前路由路径。

```tsx
expect(screen).toHavePathname('/my-router');
```

**适用场景**：验证导航后是否到达了正确的页面路径。

### `toHavePathnameWithParams()`

验证路径名以及 URL 查询参数（query parameters）。这对于验证包含查询字符串的完整 URL 非常有用，类似于浏览器中的完整 URL 格式。

```tsx
expect(screen).toHavePathnameWithParams('/my-router?hello=world');
```

**适用场景**：验证导航后 URL 中是否携带了正确的查询参数，例如搜索关键词、分页信息等。

> **关键术语解释（面向初学者）**：
>
> - **查询参数（Query Parameters）**：URL 中 `?` 后面的键值对部分，用于传递额外的数据。例如 `/search?q=hello&page=1` 中，`q=hello` 和 `page=1` 就是查询参数。
> - **Pathname（路径名）**：URL 中不包含查询参数的路径部分。例如 `/my-router?hello=world` 的路径名是 `/my-router`。

### `toHaveSegments()`

验证当前的路由段（route segments）数组。基于 [`useSegments`](/versions/latest/sdk/router.md#usesegments) Hook 获取数据。

```tsx
expect(screen).toHaveSegments(['[id]']);
```

> **关键术语解释（面向初学者）**：
>
> - **路由段（Route Segments）**：URL 路径按 `/` 分割后的各部分。例如路径 `/user/123` 的路由段是 `['user', '123']`。
> - **动态路由段（Dynamic Segment）**：用方括号表示的路由段，如 `[id]`，表示该段可以匹配任意值。例如 `[id]` 可以匹配 `123`、`abc` 等。

**适用场景**：验证当前匹配的是哪个动态路由模板，而非具体的 URL 值。

### `useLocalSearchParams()`

断言当前路由的局部搜索参数（local search params）是否匹配指定对象。基于 [`useLocalSearchParams`](/versions/latest/sdk/router.md#uselocalsearchparams) Hook。

```tsx
expect(screen).useLocalSearchParams({ first: 'abc' });
```

> **关键术语解释（面向初学者）**：
>
> - **局部搜索参数（Local Search Params）**：仅在当前路由层级内可见的 URL 参数。与全局搜索参数不同，它不会包含父级或子级路由的参数。

### `useGlobalSearchParams()`

验证全局搜索参数（global search params）是否与指定对象匹配。基于 [`useGlobalSearchParams`](/versions/latest/sdk/router.md#useglobalsearchparams) Hook。

```tsx
expect(screen).useGlobalSearchParams({ first: 'abc' });
```

> **关键术语解释（面向初学者）**：
>
> - **全局搜索参数（Global Search Params）**：跨所有路由层级可见的 URL 参数。无论当前在哪个嵌套层级的路由中，都可以访问到全局搜索参数。

### `toHaveRouterState()`

一个高级断言方法，用于验证整个路由器状态对象。适合需要对路由器的内部状态进行精确验证的高级测试场景。

```tsx
expect(screen).toHaveRouterState({
  routes: [{ name: 'index', path: '/' }],
});
```

> **基于经验建议**：`toHaveRouterState` 是一个比较"底层"的断言，直接检查路由器的内部状态结构。由于内部状态的数据格式可能会在 Expo Router 版本升级时发生变化，建议优先使用 `toHavePathname`、`toHaveSegments` 等高层断言。只有在高层断言无法满足需求时（例如需要验证路由栈的完整结构），才使用 `toHaveRouterState`。

## 四种 `renderRouter` 签名对比

| 调用方式 | 参数类型 | 适用场景 | 是否需要真实文件 |
|---|---|---|---|
| 内联文件系统 Mock | `Record<string, Component>` | 需要自定义组件的简单测试 | 否 |
| 空组件内联 Mock | `string[]` | 只关注路由逻辑的测试 | 否 |
| Fixture 目录路径 | `string`（相对路径） | 共享路由结构的复杂测试 | 是 |
| Fixture + 覆盖 | `{ appDir, overrides }` | 大部分复用 fixture，局部替换 | 是 |

> **基于文档内容推导**：对于大多数日常路由测试，推荐使用空组件内联 Mock（字符串数组）方式，因为它最简洁且不需要维护额外的 fixture 文件。当测试场景变得复杂、路由结构需要跨多个测试复用时，再考虑使用 fixture 目录方式。

## 完整测试示例

以下是一个综合示例，展示了如何结合使用 `renderRouter` 和自定义匹配器进行完整的路由测试：

```tsx
import { renderRouter, screen } from 'expo-router/testing-library';

describe('路由导航测试', () => {
  it('应该正确导航到指定路由', async () => {
    // 使用空组件 Mock 定义路由结构
    renderRouter(
      ['index', 'profile/[id]', 'settings'],
      {
        initialUrl: '/profile/123',
      }
    );

    // 验证当前路径
    expect(screen).toHavePathname('/profile/123');

    // 验证路由段（动态路由显示为模板形式）
    expect(screen).toHaveSegments(['profile', '123']);

    // 验证局部搜索参数
    expect(screen).useLocalSearchParams({ id: '123' });
  });

  it('应该正确处理带查询参数的 URL', async () => {
    renderRouter(
      ['index', 'search'],
      {
        initialUrl: '/search?q=expo&page=1',
      }
    );

    // 验证包含查询参数的完整 URL
    expect(screen).toHavePathnameWithParams('/search?q=expo&page=1');
  });
});
```

## 常见问题与注意事项

1. **测试文件不要放在 `app` 目录中**：这是最常见也最严重的错误。`app` 目录中的每个文件都会被 Expo Router 识别为路由，测试文件混入其中会导致路由冲突和不可预测的行为。

2. **路径格式必须正确**：使用内联 Mock 时，路径键不能包含文件扩展名，也不能以 `/` 开头。例如，应该是 `'profile/[id]'` 而非 `'/profile/[id].tsx'`。

3. **`initialUrl` 只在初始化时生效**：`initialUrl` 参数仅在 `renderRouter` 首次调用时用于设置起始 URL，后续的路由变化需要通过导航操作（如 `router.push()`）来触发。

4. **记得配置 Jest Expo 预设**：如果没有正确配置 `jest-expo` 预设，测试中可能会遇到模块解析错误、平台 API 缺失等问题。

> **基于经验建议**：在 CI/CD 环境中运行路由测试时，确保 Jest 配置中正确设置了 `preset: 'jest-expo'`，并且安装了 `@testing-library/react-native`。建议在项目根目录的 `jest.config.js` 中统一管理测试配置，避免在不同环境中出现配置不一致的问题。

---

## 文档导航

- **上一页**：[src directory](./91__src-directory.md)
- **下一页**：[troubleshooting](./93__troubleshooting.md)
