# Expo Router Redirects

## 文档解决的问题

这篇文档讲的是：如何在 Expo Router 中把一个路由重定向到另一个路由。它解决的是登录守卫、首次进入跳转、旧路径迁移、聚焦时替换到新页面这类问题。

## 适用场景

- 用户未登录时跳转到登录页。
- 某个页面只是过渡页，进入后立刻跳转。
- 某个屏幕每次聚焦时都要替换到另一个路径。

## 核心概念

### 1. 声明式重定向：`<Redirect />`

适合“根据当前渲染条件，立即跳转到别处”的场景。

文档示例：

```tsx
import { Redirect } from 'expo-router';

if (!user) {
  return <Redirect href="/login" />;
}
```

### 2. 命令式重定向：`useRouter`

适合在副作用或导航事件中重定向。

文档示例使用了：

- `useRouter`
- `useFocusEffect`
- `router.replace('/profile/settings')`

### 3. `replace` 的意义

文档明确注释说明：`replace` 会重定向到新路由，但不把旧页面加入 history。

对 React Web 开发者来说，这更接近“替换当前历史记录项”，而不是 `push` 一个新记录。

## 关键流程

### 方案一：在渲染阶段直接重定向

```tsx
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function Page() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
```

适合：

- 权限判断
- 条件进入
- 占位页面立即跳转

### 方案二：在聚焦时命令式替换

```tsx
import { Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

function MyScreen() {
  const router = useRouter();

  useFocusEffect(() => {
    router.replace('/profile/settings');
  });

  return <Text>My Screen</Text>;
}
```

文档明确指出：这里放在 `useFocusEffect` 里，是为了保证屏幕每次获得焦点时都执行跳转。

## 命令、配置、文件说明

### 常用 API

- `Redirect`
  声明式跳转组件。
- `useRouter`
  命令式导航入口。
- `router.replace`
  用新路径替换当前历史项。
- `useFocusEffect`
  在屏幕聚焦时执行逻辑。

当前文档未涉及 CLI 命令、app config 或特殊文件命名规则。

## 注意事项、限制条件和坑点

- 文档只覆盖了两种基础重定向模式，没有展开服务端重定向或中间件重定向。
- 使用 `useFocusEffect` 时，跳转会在每次聚焦时执行，不是只执行一次。
- 当前文档未涉及如何保留返回地址、传递来源页信息等更完整登录守卫方案。

## React Web 开发者容易误解的地方

- 不要把 `Redirect` 理解成服务器 3xx 响应。
  这页讲的是应用路由层重定向。
- 不要忽略 `replace` 与 `push` 的区别。
  用户返回行为会受到 history 是否被替换的影响。
- 不要在“每次聚焦都跳”的场景里只写一次性副作用。
  文档示例特意用 `useFocusEffect`，不是普通 `useEffect`。

## 实际开发建议

- 基于经验建议：登录态守卫优先用 `<Redirect />`，语义更直接。
- 基于经验建议：如果你不希望用户按返回键回到旧页面，优先考虑 `replace`。
- 基于文档内容推导：做向导页、过渡页、条件分流页时，声明式与命令式两种重定向都要根据触发时机来选。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo Router 支持用 `Redirect` 组件立即重定向。
- 也支持通过 `useRouter` 命令式跳转。
- `replace` 会跳到新路径且不向 history 追加旧页。
- `useFocusEffect` 方案会在每次屏幕聚焦时执行。

### 基于文档内容推导

- 重定向方案的差异核心不在“能不能跳”，而在“何时跳、是否保留历史、是否随聚焦重复执行”。
- 对复杂鉴权流来说，本页只是最基础的重定向起点。
