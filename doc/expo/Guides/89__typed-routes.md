> 原始文档来源：https://docs.expo.dev/router/reference/typed-routes/

# 类型化路由（Typed Routes）

本文档详细介绍如何在 Expo Router 中使用**静态类型化的导航链接**。此功能要求项目使用 **TypeScript**，并依赖 CLI 自动生成类型定义文件。

> **重要提示**：此功能目前仍处于 **Beta（测试）阶段**，默认处于关闭状态，需要手动启用。

---

## 关键术语说明

| 术语 | 说明 |
|------|------|
| **Typed Routes（类型化路由）** | 一种在编译阶段对路由路径进行类型检查的机制，能在你编写代码时就发现路径拼写错误，而非等到运行时才崩溃。 |
| **Href** | 超文本引用（Hypertext Reference），即导航目标地址。在 Expo Router 中，`href` 属性接受字符串路径或包含路径与参数的对象。 |
| **Dynamic Segment（动态路由段）** | 路由路径中以方括号标记的可变部分，如 `[id]`，代表运行时会被实际值替换的占位符。 |
| **Autocompletion（自动补全）** | IDE/编辑器在你输入代码时，根据类型定义自动提示可用的属性或路径，减少拼写错误。 |
| **CI（持续集成）** | Continuous Integration，自动化构建和测试流程的环境，通常没有交互式开发服务器。 |

---

## 初始配置

### 快速初始化

通过官方快速入门教程创建的项目已**预先配置**好此功能。必要的类型定义文件会在**首次启动开发服务器时自动生成**，随后 `.tsx` 文件中即可获得属性的自动补全功能。

> **基于经验建议**：如果你是新项目，强烈建议直接使用官方模板初始化，省去手动配置的麻烦。

### 手动启用

在 Beta 阶段，你需要在应用配置文件（`app.json` 或 `app.config.js`）中将 `"experiments.typedRoutes"` 设为 `true`：

```json
{
  "expo": {
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

然后运行以下命令来更新 TypeScript 配置：

```bash
npx expo customize tsconfig.json
```

最后启动本地开发服务器：

```bash
npx expo start
```

启动后即可在代码中获得 `"href"` 属性的自动补全支持。

---

## 类型生成与 CI 环境

### 自动生成时机

类型定义文件在**本地开发服务器启动时自动生成**，且**不会被 Git 跟踪**（untracked），以避免版本控制中出现不必要的文件变更。

### CI 环境处理

在持续集成（CI）环境中，通常没有交互式开发服务器。你需要手动运行以下命令来生成类型定义：

```bash
npx expo customize tsconfig.json
```

> **基于经验建议**：在 CI 流水线中，建议将上述命令放在 `npm install` 之后、`tsc --noEmit`（类型检查）之前执行，确保类型文件在类型检查前已就绪。可以在 `package.json` 中添加如下脚本：
> ```json
> {
>   "scripts": {
>     "typecheck": "npx expo customize tsconfig.json && tsc --noEmit"
>   }
> }
> ```

---

## 严格路由类型校验

### 字符串路径校验

使用泛型 `Link` 组件时，**标准字符串路径必须匹配项目中实际存在的路由文件**。

```tsx
// ✅ 正确：路径存在
<Link href="/about" />

// ✅ 正确：动态路由的字符串写法
<Link href="/user/1" />

// ✅ 正确：模板字符串拼接动态路由
<Link href={`/user/${id}`} />

// ✅ 正确：使用类型断言处理复杂拼接
<Link href={("/user" + id) as Href} />

// ❌ TypeScript 报错：路径拼写错误，不存在此路由
<Link href="/usser/1" />
```

> **说明**：Expo Router 同时导出了一个泛型路由类型 `Href`，它匹配项目中所有合法路径。当你需要进行字符串拼接等复杂操作时，可以使用 `as Href` 进行类型断言。

### 动态路由段的对象写法

当导航到包含**动态路由段**的页面时，必须使用对象形式，提供 `pathname`（路径模板）和 `params`（参数对象），参数对象的键名会被严格校验：

```tsx
// ✅ 正确：pathname 使用路径模板，params 提供动态参数
<Link href={{ pathname: "/user/[id]", params: { id: 1 } }} />

// ❌ TypeScript 报错：路径本身合法，但含动态段时应使用 HrefObject 并传入 params
<Link href="/user/[id]" />

// ❌ TypeScript 报错：params 中包含无效的键名（_id 应为 id）
<Link href={{ pathname: "/user/[id]", params: { _id: 1 } }} />

// ❌ TypeScript 报错：params 中包含未知的多余键名
<Link href={{ pathname: "/user/[id]", params: { id: 1, id2: 2 } }} />
```

> **初学者提示**：动态路由段 `[id]` 对应文件系统中的 `[id].tsx` 文件。`params` 对象中的键名必须与方括号中的名称**完全一致**。例如 `[userId]` 对应 `params: { userId: ... }`。

---

## 上下文感知与相对路由

### 绝对路径要求

类型化路由**强制使用绝对路径**，不支持相对路径导航。但你可以通过 Hook 获取当前 URL 的路由段，从而构建上下文感知的路径。

### 场景示例：共享组件中的上下文导航

假设有以下目录结构，其中 `(feed)` 和 `(search)` 是两个独立的标签页分组，共享部分组件：

```text
src
  app
    (feed)
      _layout.tsx
      feed.tsx
      search.tsx
      profile.tsx
    (search)
      profile.tsx
  components
    button.tsx
```

在共享的 `button.tsx` 组件中，你可以通过 `useSegments` 获取当前所在的路由分组，确保导航始终在**当前活跃的标签页内**进行：

```tsx
import { Link, useSegments } from 'expo-router';

export function Button() {
  const [
    // 此值可能是 `(feed)` 或 `(search)`，取决于当前所在的标签页
    first,
  ] = useSegments();

  return <Link href={`/${first}/profile`}>Push profile</Link>;
}
```

> **基于文档内容推导**：通过 `useSegments()` 获取当前路由段并拼接到目标路径中，本质上是一种**运行时动态构建绝对路径**的方式。它既满足了类型化路由对绝对路径的要求，又实现了类似"相对导航"的效果。

### 带泛型约束的 useSegments

你还可以向 `useSegments` 传入完整的路由字符串，以获得特定的类型推断：

```tsx
import { Link, useSegments } from 'expo-router';

export function useMySegments() {
  const segments = useSegments<'/(search)/profile'>();
  //    ^? segments 的类型为 ['(search)', 'profile']
  return segments;
}
```

> **初学者提示**：`useSegments` 返回当前 URL 按 `/` 分割后的各段数组。例如路径 `/(search)/profile` 会被拆分为 `['(search)', 'profile']`。传入泛型参数可以让 TypeScript 推断出具体的元组类型，而非宽泛的 `string[]`。

---

## 编程式导航

除了声明式的 `<Link>` 组件，你还可以使用导出的 `router` 实例或 `useRouter` Hook 进行**命令式导航**：

### 使用 router 实例

```tsx
import { router } from 'expo-router';

router.push('/about');
```

### 使用 useRouter Hook

```tsx
import { useRouter } from 'expo-router';

function Page() {
  const router = useRouter();

  router.push('/about');

  // ...
}
```

> **基于经验建议**：在组件内部推荐使用 `useRouter()` Hook，因为它遵循 React 的 Hook 模式，便于测试和上下文管理。而 `router` 实例更适合在组件外部（如工具函数、服务层）使用。两者的 API 完全一致，均支持 `push`、`replace`、`back`、`navigate` 等方法。

---

## 提取路由参数

### 使用路径路由字符串获取强类型参数

通过向 `useLocalSearchParams` 或 `useGlobalSearchParams` 传入完整的路由字符串，可以获得**强类型的参数推断**：

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const {
    profile, // string 类型
    search,  // string[] 类型
  } = useLocalSearchParams<'/(search)/[profile]/[...search]'>();

  return (
    <>
      <Text>Profile: {profile}</Text>
      <Text>Search: {search.join(',')}</Text>
    </>
  );
}
```

> **初学者提示**：
> - `[profile]` 是**单个动态路由段**，参数类型为 `string`。
> - `[...search]` 是**捕获所有（catch-all）动态路由段**，参数类型为 `string[]`（数组），因为它可以匹配多层路径。

### 查询字符串（Query String）参数

由于查询字符串（URL 中 `?` 后面的部分）**没有对应的文件系统表示**，类型系统无法自动推断它们。你需要手动定义泛型类型参数：

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { query } = useLocalSearchParams<{ query?: string }>();

  return <Text>Search: {query ?? 'unset'}</Text>;
}
```

### 组合使用：路径参数 + 查询参数

你可以同时传入**路由字符串**（第一个泛型参数）和**查询参数类型**（第二个泛型参数），实现完整的类型推断：

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { query, profile, search } = useLocalSearchParams<
    '/[profile]/[...search]',
    { query?: string }
  >();

  return <Text>Search: {query ?? 'unset'}</Text>;
}
```

> **基于文档内容推导**：`useLocalSearchParams` 支持两个泛型参数——第一个是路由路径字符串（用于推断路径中的动态段参数），第二个是查询参数对象的类型（用于定义 URL 查询字符串参数）。当你的页面既从路径中获取参数，又从查询字符串中获取参数时，这种组合写法非常有用。

---

## 环境文件变更

启用类型化路由功能后，系统会进行以下自动操作：

1. **在项目根目录生成 `expo-env.d.ts` 文件**——此文件会被添加到 `.gitignore`（Git 忽略列表）中。
2. **更新 `.gitignore`**——将 `expo-env.d.ts` 加入忽略列表，防止其被提交到版本控制。
3. **修改 `tsconfig.json`**——将隐藏目录加入 TypeScript 的 `include` 范围，确保类型定义能被正确识别。

> **警告**：自动生成的 `expo-env.d.ts` 文件**不应被手动修改**，也**不应被提交到版本控制**。它的类型定义会随项目路由结构的变化而自动更新。

### 全局类型定义

CLI 会注入以下全局类型定义：

- **环境变量**的类型声明（如 `process.env` 中的自定义变量）
- **样式表导入**的类型支持
- **CSS 模块导出**的类型声明
- **Metro 打包器上下文**所需的类型定义

### Web 平台增强类型

在 Web 平台上，Expo Router 会为原生组件的类型定义添加额外的 Web 专属属性，包括：

- 额外的**样式属性**（如 Web 特有的 CSS 属性）
- **文本组件**的无障碍（accessibility）属性增强
- **可按压组件（Pressable）** 的悬停状态（hover）支持
- **className** 属性支持（用于 Web 端的 CSS 类名）

> **基于经验建议**：如果你同时开发移动端和 Web 端，这些 Web 增强类型可以让你在 React Native 组件上直接使用 Web 专属属性，而无需额外的类型声明或类型断言。但要注意，这些属性仅在 Web 平台上生效，在原生端会被忽略。

---

## 常见问题与注意事项

### 类型未生效？

1. 确认 `app.json` 中已启用 `experiments.typedRoutes`。
2. 确认已运行 `npx expo customize tsconfig.json`。
3. 确认开发服务器至少启动过一次（用于生成类型文件）。
4. 尝试重启编辑器的 TypeScript 服务（VS Code 中按 `Cmd+Shift+P` → "TypeScript: Restart TS Server"）。

### 类型不更新？

类型文件在开发服务器启动时生成。如果你**新增了路由文件**，需要**重启开发服务器**以重新生成类型定义。

> **基于经验建议**：在大型项目中，频繁重启开发服务器可能影响开发效率。建议在添加完所有新路由文件后再重启，或在 `package.json` 中设置一个专门的脚本来单独触发类型生成。

---

## 文档导航

- **上一页**：[link preview](./88__link-preview.md)
- **下一页**：[screen tracking](./90__screen-tracking.md)
