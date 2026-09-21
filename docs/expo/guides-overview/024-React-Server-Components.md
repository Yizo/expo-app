# 024｜Expo Router 中的 React Server Components

**翻页：**[上一页：在 Expo Native App 中使用 DOM](./023-Expo-DOM组件.md) · [目录](./README.md) · [下一页：测试 React Server Components](./025-测试React-Server-Components.md)

**官方页面：**[Using React Server Components in Expo Router apps](https://docs.expo.dev/guides/server-components/)

**版本边界：**这是未锁定 SDK 的 Beta / experimental 指南。它以 React Canary 的 RSC 能力为基础，并要求 React Native New Architecture；本地应用是 Expo SDK 56。SDK56 精确版本参考中没有可访问的这篇专题页，因此本文示例用于理解官方 Latest 教程，不能据此断言当前项目的所有 API 都已稳定可用。采用前须核对当前 Expo Router / React 版本，并在目标平台验证。

## 先区分 Server Component 与 Client Component

React Server Components（RSC）让部分 React 组件在服务器环境运行，再把渲染结果流式传给 app。它可以在服务端取数据、读取不公开给用户端的密钥，也能为 Web 生成 HTML、完成静态计算。

- **Server Component** 默认在 server environment 执行，可以是 async；不能调用 useState、useEffect、useContext 等客户端 Hooks，也不能读取 browser / device API。
- **Client Component** 在文件开头写 use client，用于有 state、event handler、React Context 或原生交互的界面；它通过可序列化 props 接收 server 侧数据。
- **Server Function** 是可由客户端调用的异步函数。用 use server 标记 Server Function 文件或函数；它不是 Server Component 的开关。

Expo Router 的 RSC 支持仍在早期预览。使用前需要 Expo Router 工程和 React Native New Architecture（SDK 52 起默认启用）；Latest 指南要求安装 RSC 运行时依赖、使用 expo-router/entry，并在 app config 中启用 server functions：

```sh
npx expo install react-server-dom-webpack
```

package.json 的 app entry 保持为 Expo Router 默认入口；app.json 中设置实验开关，并避免把 origin 配成 boolean：

```json
{
  "main": "expo-router/entry"
}
```

```json
{
  "expo": {
    "web": {
      "output": "single"
    },
    "experiments": {
      "reactServerFunctions": true
    }
  }
}
```

首屏可由一个 Client Component 包住异步 server result。RSC 暂时要求 web.output 设为 single：

```tsx
// app/index.tsx：客户端入口
/// <reference types="react/canary" />

import React from 'react';
import { ActivityIndicator } from 'react-native';
import renderInfo from '../actions/render-info';

export default function Index() {
  return (
    <React.Suspense fallback={<ActivityIndicator />}>
      {renderInfo({ name: 'World' })}
    </React.Suspense>
  );
}
```

```tsx
// actions/render-info.tsx：服务端函数文件
'use server';

import { Text } from 'react-native';

export default async function renderInfo({ name }: { name: string }) {
  // 在服务器安全读取数据或私密环境变量，再返回可序列化 UI。
  return <Text>Hello, {name}!</Text>;
}
```

页面内容不是从服务器拿到任意 JS 对象，而是通过 React 维护的 RSC payload stream 返回客户端。

## Server Component：服务端取数与渲染

服务端组件能访问 Node.js built-ins（本地开发时）、服务端 API 和异步数据。下面的组件在服务器取 Pokémon 数据，再用 React Native primitives 描述界面；server-only 用来阻止模块意外进入客户端 bundle：

```tsx
import 'server-only';

import { Image, Text, View } from 'react-native';

export async function PokemonCard() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon/2');
  const pokemon = await response.json();

  return (
    <View style={{ padding: 8, borderWidth: 1 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 24 }}>{pokemon.name}</Text>
      <Image
        source={{ uri: pokemon.sprites.front_default }}
        style={{ width: 100, height: 100 }}
      />
      {pokemon.abilities.map((item: { ability: { name: string } }) => (
        <Text key={item.ability.name}>- {item.ability.name}</Text>
      ))}
    </View>
  );
}
```

use server 用来导出 Server Function，不表示本文件里的所有内容都是 Server Components。Server Component 返回的节点会被 RSC 协议序列化，而不是在 server 和 native client 之间共享同一组 React 对象。

## Client Component：交互与平台 API

要使用点击事件、state 或 native capability，在模块顶层标记 use client：

```tsx
'use client';

import { Text } from 'react-native';

export default function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return <Text onPress={onPress}>{title}</Text>;
}
```

Client module 可以被 Server Component 使用；普通函数不能作为 props 穿过 Server Component 边界。能跨边界传递的是字符串、数字、数组、普通对象等可序列化数据，或 Server Functions action。

## Server Functions 与安全的数据读取

Server Function 必须是 async，可定义为 inline action 或单独放在带 use server 的文件。调用参数与返回值必须可序列化；服务端内部可读取私密环境变量，因此不要把 token 或 Secret 从服务端返回给客户端：

```tsx
// Client Component 中的 inline Server Function
export default function Page() {
  return (
    <PrimaryButton
      title="发送"
      onPress={async () => {
        'use server';
        console.log('该逻辑在服务器执行');
        return 'done';
      }}
    />
  );
}
```

单独文件导出的 action 也能由 Client Component 引入：

```tsx
// components/server-actions.tsx
'use server';

export async function saveDraft({ title }: { title: string }) {
  // 写入服务器数据库；参数是可序列化对象。
  return { saved: true, title };
}
```

```tsx
// components/save-button.tsx
'use client';

import { Text } from 'react-native';
import { saveDraft } from './server-actions';

export function SaveButton({ title }: { title: string }) {
  return <Text onPress={() => saveDraft({ title })}>保存草稿</Text>;
}
```

Server Function 也可以在服务器安全读取 API / access token，并直接返回 React Native elements。客户端用 Suspense 显示加载态：

```tsx
// components/server-actions.tsx
'use server';

import 'server-only';
import { Image, Text, View } from 'react-native';

export async function renderProfile({
  username,
  accessToken,
}: {
  username: string;
  accessToken: string;
}) {
  const response = await fetch('https://api.example.com/profile/' + username, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'X-Secret': process.env.SECRET,
    },
  });
  const profile = await response.json();

  return (
    <View>
      <Image source={{ uri: profile.image }} />
      <Text>{profile.name}</Text>
    </View>
  );
}
```

```tsx
// components/profile.tsx
'use client';

import * as React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { renderProfile } from './server-actions';

function Loading() {
  return <Text>正在读取个人资料…</Text>;
}

export default function Profile() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const accessToken = useCustomAuthProvider();

  const profile = React.useMemo(
    () => renderProfile({ username, accessToken }),
    [username, accessToken]
  );

  return <React.Suspense fallback={<Loading />}>{profile}</React.Suspense>;
}
```

Server action 可以读取服务器密钥，但传给客户端的结果必须安全。当前官方说明 Server Functions 还不能在 DOM component 内运行。

## 兼容尚未支持 RSC 的库

某些第三方库仍假设只能在客户端运行。可以通过一个 use client 适配文件显式转发需要的 exports，让 server tree 把它当成 client reference：

```tsx
// lib/client-library.tsx
'use client';

export { One, Two, Three } from 'react-native-unoptimized';
```

避免用 export * 代替显式导出，因为它可能破坏 server / client interop。标记成 Client Component 的模块也不一定能在 Server Component 里使用静态成员，例如 StyleSheet.create 或 Platform.OS；平台条件优先使用 process.env.EXPO_OS。

## Suspense 与分段加载

Suspense 可以让 shell 先显示，再按 server task 完成时间逐段替换 loading UI：

```tsx
// app/index.tsx：客户端控制整体加载状态
import { Suspense } from 'react';
import { Text } from 'react-native';
import { renderTasks } from '../actions/tasks';

export default function Index() {
  return (
    <Suspense fallback={<Text>正在准备页面…</Text>}>
      {renderTasks()}
    </Suspense>
  );
}
```

```tsx
// actions/tasks.tsx：服务端按子任务分段返回
'use server';

import { Suspense } from 'react';
import { Text } from 'react-native';

export async function renderTasks() {
  return (
    <Suspense fallback={<Text>正在读取内容…</Text>}>
      <>
        <MediumTask />
        <Suspense fallback={<Text>还在加载大内容…</Text>}>
          <ExpensiveTask />
        </Suspense>
      </>
    </Suspense>
  );
}

async function MediumTask() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return <Text>较快的任务已完成</Text>;
}

async function ExpensiveTask() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return <Text>较慢的任务已完成</Text>;
}
```

内层 boundary 让较慢子树显示自己的 fallback，不必阻塞已经准备好的兄弟内容。删掉内层 Suspense 后，整体 fallback 可能要等所有组件完成。

## Secrets 与环境变量

Server Components 在服务器上执行，可以通过 process.env 读取 server-only secrets。导入 server-only 可在模块误进入客户端时触发保护；服务端变量不需要 EXPO_PUBLIC_ 前缀：

```tsx
import 'server-only';

import { Text } from 'react-native';

export async function renderPrivateData() {
  const response = await fetch('https://api.example.com/private', {
    headers: {
      Authorization: 'Bearer ' + process.env.SECRET,
    },
  });

  const data = await response.json();
  return <Text>{data.label}</Text>;
}
```

```dotenv
SECRET=仅放在服务器环境中的值
```

官方指南说明本地开发期间，环境变量会在后续 request 自动重新加载，无需为每次更改手动重启开发服务器。生产环境仍需在 Hosting provider 安全配置变量。

## 平台与 server 环境检测

RSC 下要判断编译目标平台，应使用 process.env.EXPO_OS，而不是依赖尚未完全优化的 Platform.OS。检测当前代码是否处于 server runtime，可用 typeof window === 'undefined'：

```ts
const isServer = typeof window === 'undefined';
const isIOSBuild = process.env.EXPO_OS === 'ios';
```

## 在 Web 中输出 Metadata

Expo CLI 为当前 RSC 预览使用特殊 React Canary 构建。指南示例可在 Web route 的任意位置返回 meta 元素；此能力目前只对 Web route 起作用：

```tsx
export default function Index() {
  return (
    <>
      {process.env.EXPO_OS === 'web' && (
        <>
          <meta name="description" content="Hello, world!" />
          <meta property="og:image" content="/og-image.png" />
        </>
      )}
      <MyComponent />
    </>
  );
}
```

它可替代部分页面的 expo-router/head 写法，但 native 平台不会处理 HTML metadata。

## 读取 Request Headers

服务端 action 可从 expo-router/rsc/headers 读取当前 HTTP request headers：

```tsx
import { unstable_headers } from 'expo-router/rsc/headers';

export async function renderHome() {
  const authorization = (await unstable_headers()).get('authorization');
  return <Text>{authorization}</Text>;
}
```

unstable_headers() 返回 Promise，解析为只读 Headers 对象。它只在 server runtime 运行；header 会按 request 动态变化，因此不能和 build-time static rendering 一起使用。

## Full React Server Components mode

单独启用 reactServerFunctions 是使用 Server Functions；再加上 reactServerComponentRoutes，会让所有 route 默认进入 Server Component 模式。官方称其 experimental：Router / React Navigation 尚未支持并发路由所需能力；目前不支持 Stack、Tabs、Drawer，也只有部分 Link props 可用。

```json
{
  "expo": {
    "experiments": {
      "reactServerFunctions": true,
      "reactServerComponentRoutes": true
    }
  }
}
```

### 开发期重载

Full RSC mode 下，开发环境每次 request 都会重新 render Server Component。要在客户端主动重取，可在 Client Component 调用 router.reload()：

```tsx
'use client';

import { useRouter } from 'expo-router';
import { Text } from 'react-native';

export function ReloadButton() {
  const router = useRouter();

  return <Text onPress={() => router.reload()}>重新读取当前页面</Text>;
}
```

build-time 生成并塞进原生 binary 的页面没有 server render source，不会在客户端被 router.reload() 重新执行。

### Build-time 与 request-time rendering

可以用 route 的 unstable_settings.render 选择渲染时机：

- static：构建时计算并嵌入产物；线上不会每次 request 重算，适合可预先确定的内容，也能离线查看。
- dynamic：收到 request 时运行，类似 SSR；默认模式。

```tsx
// app/index.tsx
import { Text, View } from 'react-native';

export const unstable_settings = {
  render: 'static',
};

export default function Index() {
  return (
    <View>
      <Text>构建时生成的页面</Text>
    </View>
  );
}
```

带动态 route 时，可用 generateStaticParams() 枚举构建期页面：

```tsx
// app/shapes/[shape].tsx
import { Text } from 'react-native';

export const unstable_settings = { render: 'static' };

export async function generateStaticParams() {
  return [{ shape: 'square' }];
}

export default function ShapeRoute({ shape }: { shape: string }) {
  return <Text>{shape}</Text>;
}
```

文档提示 generateStaticParams 在 full RSC mode 中仍只部分支持。

### CSS

full RSC mode 支持在 Server Component 中导入全局 CSS 和 CSS Modules；样式会从 server bundle 提升到 client bundle：

```tsx
import './styles.css';
import styles from './styles.module.css';

export default function Index() {
  return <div className={styles.container}>Hello, world!</div>;
}
```

## 测试、部署与限制

官方另有 [Testing React Server Components](https://docs.expo.dev/guides/testing-rsc/) 指南，使用 jest-expo 的 RSC runner 做 server render 测试。本页只指向该教程，没有在页面内提供运行测试命令。

Web 端可运行 npx expo export -p web 生成产物，再本地 serve 或部署到 EAS Hosting；native RSC server 部署则参见 Expo 的 native server 部署指南。官方仍将 Universal RSC 标记为 Beta，生产部署范围有限。

当前专题页列出的限制包括：

- Expo Snack 还不能 bundle Server Components。
- EAS Update 暂不支持 Server Components。
- DOM component 在生产环境还不能使用 React Server Functions。
- Server RSC payload 还不能渲染成 HTML，因此 static / server web output 仍不完整。
- generateStaticParams 仅部分支持；HTML form 与 Server Functions 的集成尚不安全。
- native RSC 下 StyleSheet.create 和 Platform.OS 不可用，使用普通 style object 与 process.env.EXPO_OS。
- Hermes 不支持 Server Function 再调用另一个 Server Function。
- full RSC mode 目前没有完整 Stack / Tabs / Drawer 导航支持。
- 这是持续开发的 early preview，发布前要复核官方状态并在目标平台验证。

## 关键名词

- **RSC Payload / Flight**：React 用于将服务端组件树传输到客户端的协议数据，不是普通 JSON API response。
- **Server Component**：在服务器 / 构建环境执行的组件；没有客户端 Hooks 和 native API 能力。
- **Client Component**：用 use client 标记、在客户端可交互执行的模块。
- **Server Function**：用 use server 标记的 async action，可由 Client Component 调用。
- **Suspense**：为异步子树设置 fallback，支持分段返回 UI。
- **New Architecture**：React Native 新渲染 / 模块系统；该 RSC 预览要求此架构。
- **Static / Dynamic rendering**：在 build time 预生成，或在 request time 动态生成。
- **React Canary**：React 的实验构建；RSC API 与标准稳定版可能不同。
- **server-only**：保护只能在服务端加载的模块，避免意外进入客户端 bundle。

## 官方代码主题覆盖

源页代码主题均已转换为本地等价示例：安装 RSC dependency、Router entry 与 app config flags、初始 Suspense route 和 Server Function；异步 Server Component fetch / render、Client Component、inline 与单文件 Server Function；服务器私密 API 读取和客户端 Suspense profile；第三方库 use client adapter；多层 Suspense 延迟；server-only 与 .env secrets；EXPO_OS / window 判断、meta tags、request headers；full RSC flag、router.reload()、static/dynamic route、generateStaticParams、CSS imports、Web export。Beta 前置条件、SSR / deployment 限制与已知平台边界均有说明。

## 下一页

官方页脚 **Next** 指向 [Testing React Server Components](https://docs.expo.dev/guides/testing-rsc/)，讲解用 jest-expo 为 React Server Components 编写平台化单元测试。

**翻页：**[上一页：在 Expo Native App 中使用 DOM](./023-Expo-DOM组件.md) · [返回目录](./README.md) · [下一页：测试 React Server Components](./025-测试React-Server-Components.md)
