# 页面导航

> 原文地址：https://docs.expo.dev/router/basics/navigation/

一旦建立了布局（layouts）和页面（pages），就可以开始进行导航了。每个页面天然拥有一个 URL，因此可以像 Web 一样使用各种导航模式。

---

## 核心概念速览

> **给初学者的说明**：
> - **导航（Navigation）**：从一个页面跳转到另一个页面的过程。
> - **路由（Route）**：页面的路径标识，例如 `/about` 或 `/profile/friends`。
> - **堆栈导航（Stack Navigation）**：像一摞卡片一样管理页面——新页面"压入"（push）栈顶，返回时从栈顶"弹出"（pop）。
> - **深度链接（Deep Linking）**：通过一个 URL 直接打开应用内部的某个特定页面，而不是先打开首页再跳转。

---

## 一、使用 Router Hook 进行基础原生导航

与 React Navigation 类似，你可以在按钮的点击事件处理函数中触发导航。使用 `useRouter` Hook 来获取导航相关的函数。

```tsx
import { useRouter } from 'expo-router';
import { Button } from 'react-native';

export default function Home() {
  const router = useRouter();

  return <Button title="Go to About" onPress={() => router.navigate('/about')} />;
}
```

> **给初学者的说明**：
> - **Hook**：React 中一种特殊的函数，允许你在函数组件中使用状态（state）和其他 React 特性。`useRouter` 就是 Expo Router 提供的一个 Hook。
> - **`useRouter()`**：返回一个 `router` 对象，上面挂载了 `navigate`、`push`、`back`、`replace` 等导航方法。

### 导航方法一览

默认的导航方式是**堆栈导航**——跳转到新路由时会将页面压入栈，返回时则弹出页面。各方法说明：

| 方法 | 说明 |
|------|------|
| `router.navigate(path)` | 标准导航方法。如果目标页面在栈中已存在，会自动回退到该页面（unwind）；否则压入新页面 |
| `router.push(path)` | 显式压入新页面，即使栈中已有相同页面也会新增一个实例 |
| `router.back()` | 返回上一页 |
| `router.replace(path)` | 用新页面替换当前页面，不增加栈深度 |

> **基于经验建议**：大多数场景下使用 `router.navigate()` 即可，它会自动判断应该 push 还是 unwind。只有在你明确需要"强制新增一层"（如向导流程）时才用 `push`，需要"替换当前页、不让用户返回"时用 `replace`。

### 路由引用方式

路由路径可以是 URL 字符串，也可以相对于 `app` 目录来引用。下表展示了文件路径与路由的映射关系：

| 文件路径 | 路由调用 |
|----------|----------|
| `src/app/index.tsx` | `router.navigate("/")` |
| `src/app/about.tsx` | `router.navigate("/about")` |
| `src/app/profile/index.tsx` | `router.navigate("/profile")` |
| `src/app/profile/friends.tsx` | `router.navigate("/profile/friends")` |

---

## 二、超链接与可交互按钮

Expo Router 支持 Web 风格的链接。`Link` 组件用于声明式导航，其 `href` 属性与 `router.navigate` 的路由参数一致。

```tsx
import { View } from 'react-native';
import { Link } from 'expo-router';

export default function Page() {
  return (
    <View>
      <Link href="/about">About</Link>
    </View>
  );
}
```

> **给初学者的说明**：
> - **`Link` 组件**：Expo Router 提供的导航组件，类似于 HTML 中的 `<a>` 标签。
> - **`href`**：目标路由的路径，与 `router.navigate()` 中的参数格式相同。

### 使用 `asChild` 自定义链接外观

默认情况下，`Link` 的子元素会渲染在一个 `<Text>` 元素内部。如果你在 `Link` 中放置了非文本元素（如图片、自定义组件），可能会导致布局问题。此时可以使用 `asChild` 属性，搭配 `Pressable` 来获得完全的布局控制权。

```tsx
import { Pressable, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Page() {
  return (
    <Link href="/other" asChild>
      <Pressable>
        <Text>Home</Text>
      </Pressable>
    </Link>
  );
}
```

> **基于经验建议**：在需要自定义按钮样式、添加图标或嵌套复杂布局时，始终使用 `asChild` + `Pressable` 的组合，避免默认的 `<Text>` 包裹带来的样式冲突。

---

## 三、相对路径导航

路由路径不必总是使用绝对路径（如 `/about`）。你可以使用 `./`（当前目录）或 `../`（上级目录）前缀来进行相对于当前屏幕的导航。

```tsx
<Link href="./article">Go to article</Link>
```

```ts
router.navigate('./article');
```

> **给初学者的说明**：
> - `./article` 表示"当前路径下的 article 页面"。
> - `../settings` 表示"上一级路径下的 settings 页面"。
> - 这与文件系统中的相对路径概念一致。

> **基于文档内容推导**：相对路径在嵌套路由结构中特别有用。例如，当你在 `/profile` 页面中想跳转到 `/profile/settings`，可以直接使用 `./settings`，代码更简洁且不容易因路径重构而出错。

---

## 四、动态路由与 URL 参数

动态路由允许你在 URL 中传递变量。假设存在文件 `src/app/user/[id].tsx`（方括号表示动态路由段），以下三种链接方式效果完全相同：

```tsx
import { Link, router } from 'expo-router';
import { View, Pressable, Text } from 'react-native';

export default function Page() {
  return (
    <View>
      {/* 方式一：直接在 URL 中内联参数 */}
      <Link href="/user/bacon">
        View user (id inline)
      </Link>

      {/* 方式二：在 href 对象中使用 params */}
      <Link
        href={{
          pathname: '/user/[id]',
          params: { id: 'bacon' }
        }}
      >
        View user (id in params in href)
      </Link>

      {/* 方式三：命令式导航 */}
      <Pressable
        onPress={() =>
          router.navigate({
            pathname: '/user/[id]',
            params: { id: 'bacon' }
          })
        }
      >
        <Text>View user (imperative)</Text>
      </Pressable>
    </View>
  );
}
```

> **给初学者的说明**：
> - **动态路由段**：文件名中使用方括号 `[id]` 表示该段是动态的，可以匹配任意值。例如 `[id].tsx` 可以匹配 `/user/123`、`/user/bacon` 等。
> - **`pathname`**：路由模板路径，保留方括号占位符。
> - **`params`**：一个对象，其键名与方括号中的变量名对应，值会自动替换到 URL 中。

> **注意**：某些参数名被框架内部保留使用，自定义参数时请避免使用框架保留字。

### 4.1 传递查询参数（Query Variables）

查询参数可以直接拼接在 URL 中，也可以通过 `params` 对象传递。未匹配到动态路由段的参数会自动成为查询参数。

```tsx
{/* 直接在 URL 中拼接查询参数 */}
<Link href="/users?limit=20">View users</Link>

{/* 通过 params 对象传递查询参数 */}
<Link
  href={{
    pathname: '/users',
    params: { limit: 20 }
  }}>
  View users
</Link>
```

> **给初学者的说明**：
> - **查询参数（Query Parameters）**：URL 中 `?` 后面的键值对，如 `?limit=20&sort=name`。它们不是路径的一部分，通常用于传递过滤、排序、分页等辅助信息。
> - 动态路由参数和查询参数的区别：动态路由参数（如 `[id]`）是路径的组成部分，而查询参数是附加信息。

### 4.2 在目标页面获取路由参数和查询参数

在目标页面中，使用 `useLocalSearchParams` Hook 获取所有 URL 参数，它会返回一个包含全部参数的对象。

```tsx
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function Users() {
  const { id, limit } = useLocalSearchParams();

  return (
    <View>
      <Text>User ID: {id}</Text>
      <Text>Limit: {limit}</Text>
    </View>
  );
}
```

> **给初学者的说明**：
> - **`useLocalSearchParams()`**：Expo Router 提供的 Hook，用于在当前页面中读取 URL 中的参数（包括动态路由参数和查询参数）。
> - 返回值是一个普通对象，可以通过解构赋值直接获取所需参数。

### 4.3 不跳转页面，仅修改查询参数

有时你需要在当前页面更新查询参数（例如切换分页、改变过滤条件），而无需导航到其他页面。可以通过以下两种方式实现：

```tsx
{/* 声明式：使用 Link 指向同一页面但携带新参数 */}
<Link href="/users?limit=50">View more users</Link>

{/* 命令式：使用 router.setParams */}
<Pressable onPress={() => router.setParams({ limit: 50 })}>
  <Text>View more users</Text>
</Pressable>
```

> **基于经验建议**：`router.setParams` 在需要响应用户交互（如切换筛选条件、翻页）时更为灵活，推荐在命令式逻辑中使用。`Link` 方式更适合静态的、可点击的预置选项。

---

## 五、路由重定向

使用 `Redirect` 组件可以立即从当前布局或页面重定向到另一个页面。其行为类似于命令式的 `router.replace()`，不会渲染当前页面的视图内容。

```tsx
import { Redirect } from 'expo-router';

export default function Page() {
  return <Redirect href="/about" />;
}
```

> **给初学者的说明**：
> - **重定向（Redirect）**：用户访问 A 页面时，自动跳转到 B 页面，用户不会看到 A 页面的任何内容。
> - 常见场景：未登录用户访问需鉴权页面时重定向到登录页；旧路由迁移到新路由等。

> **基于经验建议**：`Redirect` 组件适合在组件的 render 阶段使用（例如条件渲染）。如果在 `useEffect` 等副作用中进行重定向，建议使用 `router.replace()` 代替，因为组件已经挂载后再返回 `<Redirect>` 可能产生闪烁。

---

## 六、屏幕预加载

在 `Link` 组件上添加 `prefetch` 属性，可以提前准备目标屏幕的数据和资源，从而加快导航切换速度。

```tsx
import { Link } from 'expo-router';

export default function Page() {
  return <Link href="/about" prefetch />;
}
```

Expo Router 会尝试进行离屏渲染（off-screen rendering）。Expo 内置的导航器（如 Stack、Tabs）支持预加载，但自定义导航器可能不支持。

### 预加载屏幕的限制

被预加载的堆栈屏幕存在以下限制：

- **不能使用命令式路由 API**（如 `router.navigate`、`router.push` 等）
- **不能通过 navigation 更新选项**（如 `navigation.setOptions`）
- **不能监听事件**（如 `navigation.addListener`）

这些功能只有在屏幕真正被导航到时才可用。

### 正确处理预加载屏幕的事件监听

如果你需要在 Tab 屏幕中监听 `tabPress` 事件，应在 `useEffect` 中正确设置和清理监听器：

```tsx
const navigation = useNavigation();

useEffect(() => {
  const unsubscribe = navigation.addListener('tabPress', () => {
    // 执行相关操作
  });

  return () => {
    unsubscribe();
  };
}, [navigation]);
```

### 操作前检查屏幕是否处于聚焦状态

在对导航选项进行操作之前，应先检查当前屏幕是否获得焦点：

```tsx
const navigation = useNavigation();

if (navigation.isFocused()) {
  navigation.setOptions({ title: 'Updated title' });
}
```

> **给初学者的说明**：
> - **预加载（Prefetch）**：在用户尚未访问某页面时，提前在后台加载该页面的资源和数据，使后续跳转更流畅。
> - **`navigation.isFocused()`**：判断当前屏幕是否是用户正在查看的屏幕。未聚焦的屏幕（如被预加载但还未显示的屏幕）不应执行 UI 更新操作。

> **基于经验建议**：预加载能显著提升用户体验，尤其是在列表页跳转到详情页的场景中。但务必注意上述限制——在屏幕组件中，所有依赖 `navigation` 的副作用逻辑都应先用 `isFocused()` 做守卫检查，避免在预加载阶段产生报错或意外行为。

---

## 七、外部深度链接

URL 可以直接打开应用内的特定页面。Expo Router 原生支持此功能——外部 URL 的行为与内部链接一致。

- **Web 端**：直接使用标准的浏览器 URL。
- **移动端**：需要在应用配置中设置 `scheme`（URL 方案），外部链接将以该 scheme 作为前缀。

假设应用的 scheme 配置为 `myapp`，则路由映射关系如下：

| 文件路径 | 深度链接 URL |
|----------|-------------|
| `src/app/about.tsx` | `myapp://about` |
| `src/app/profile/index.tsx` | `myapp://profile` |
| `src/app/users/[username].tsx` | `myapp://users/evanbacon` |

此外，还可以通过 **Universal Links**（iOS）和 **App Links**（Android）使用标准的 HTTPS URL 来打开应用。

> **给初学者的说明**：
> - **Scheme**：URL 的协议前缀，如 `myapp://`。它是操作系统用来识别"这个链接应该由哪个应用打开"的标识。
> - **Universal Links / App Links**：允许你使用标准的 `https://` 链接直接打开应用，而不需要自定义 scheme。这是更推荐的做法，因为它更安全可靠，且在应用未安装时可以优雅地回退到网页。

---

## 八、初始路由配置（深度链接的回退行为）

当用户通过深度链接进入应用时，返回按钮的行为应该模拟"从首页开始导航"的体验。你可以通过配置 `initialRouteName` 来确保某个布局在深度链接时先加载指定的初始页面。

假设一个 Stack 文件夹包含 `index.tsx`、`second.tsx` 和 `_layout.tsx`，你可以在布局文件中配置如下，以确保栈的首页（index）总是先被加载：

```tsx
export const unstable_settings = {
  // 确保任何深度链接都能回退到 `/`
  initialRouteName: 'index',
};
```

> **给初学者的说明**：
> - **`unstable_settings`**：Expo Router 导出的配置对象，用于设置布局级别的行为。名字中的 "unstable" 表示该 API 仍在演进中，后续版本可能会有调整。
> - **`initialRouteName`**：指定在深度链接场景下，布局应该先加载哪个子页面作为"起点"。

> **注意**：此配置默认仅对深度链接生效。如果你希望在应用内部导航时也强制此行为（即让用户可以一直返回到初始路由），需要在 `Link` 上使用 `withAnchor` 属性：

```tsx
<Link href="/stack/second" withAnchor>
  Go to second
</Link>
```

> **基于经验建议**：如果你在测试深度链接时发现返回按钮缺失或行为异常，最常见的原因就是没有定义 `initialRouteName`。建议在每个布局的 `_layout.tsx` 中都显式配置此项，可以省去大量调试时间。

---

## 九、导航方法速查表

| 场景 | 推荐方式 | 代码示例 |
|------|---------|---------|
| 声明式跳转（文字链接） | `<Link>` | `<Link href="/about">About</Link>` |
| 声明式跳转（自定义 UI） | `<Link asChild>` | `<Link href="/about" asChild><Pressable>...</Pressable></Link>` |
| 按钮点击跳转 | `router.navigate()` | `router.navigate('/about')` |
| 强制新增页面层级 | `router.push()` | `router.push('/about')` |
| 返回上一页 | `router.back()` | `router.back()` |
| 替换当前页面 | `router.replace()` | `router.replace('/login')` |
| 立即重定向 | `<Redirect>` | `<Redirect href="/login" />` |
| 更新当前页面参数 | `router.setParams()` | `router.setParams({ page: 2 })` |
| 携带参数跳转 | `params` 对象 | `router.navigate({ pathname: '/user/[id]', params: { id: '123' } })` |
| 预加载目标页面 | `prefetch` | `<Link href="/detail" prefetch>` |
| 深度链接锚定初始路由 | `withAnchor` | `<Link href="/stack/second" withAnchor>` |

---

## 文档导航

- **上一页**：[navigation layouts](./54__navigation-layouts.md)
- **下一页**：[common navigation patterns](./56__common-navigation-patterns.md)
