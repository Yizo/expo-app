# DOM 组件 -- 在 Expo 原生应用中使用 React DOM

> 原始文档地址：[https://docs.expo.dev/guides/dom-components/](https://docs.expo.dev/guides/dom-components/)

---

## 什么是 DOM 组件？

> **初学者须知**：在开始阅读之前，你需要了解以下关键概念：
>
> - **DOM (Document Object Model)**：即"文档对象模型"，是浏览器中表示网页结构的标准方式。网页中的 `<div>`、`<h1>`、`<p>` 等 HTML 标签都是 DOM 元素。
> - **React Native**：一个使用 JavaScript/TypeScript 构建移动端（iOS 和 Android）应用的框架。它使用自己的组件系统（如 `<View>`、`<Text>`），**而非** HTML 标签。
> - **WebView**：一个可以在原生应用中嵌入并显示网页内容的组件，相当于在 App 内部放了一个小型浏览器。
> - **Expo**：围绕 React Native 构建的工具链和平台，简化了开发、构建和发布流程。
> - **`'use dom'` 指令**：Expo 提供的一种特殊文件标记，告诉构建工具"这个文件应该在 WebView 中以 Web 模式运行"。

Expo 提供了一种创新的方式，让你可以在原生应用内部使用标准的 Web 技术（HTML、CSS、DOM 组件）来渲染界面。这是通过在文件顶部添加 `'use dom'` 指令实现的。

**核心思路**：你可以将整个 Web 项目逐步迁移到跨平台（iOS、Android、Web）的 Expo 项目中，每次迁移一个组件。

> **基于文档内容推导**：由于原生环境（iOS/Android）本身并不支持 `<div>`、`<h1>` 等标准 HTML 标签，DOM 组件通过 WebView 提供了一个实用的桥梁，让 Web 组件可以在原生环境中运行。

---

## 前提条件与环境配置

根据你的 Expo SDK 版本不同，配置步骤有所区别。

### SDK 56 及以上版本

> **关键概念**：`@expo/dom-webview` 是 Expo 官方提供的 WebView 组件包。从 SDK 56 起，它成为 DOM 组件的默认底层实现，取代了之前社区维护的 `react-native-webview`。

SDK 56 默认使用 `@expo/dom-webview`。如果你需要回退到社区版本的 `react-native-webview`，需要先安装它：

```sh
# npm
npx expo install react-native-webview

# yarn
yarn expo install react-native-webview

# pnpm
pnpm expo install react-native-webview

# bun
bun expo install react-native-webview
```

然后在组件中通过配置禁用默认 WebView：

```tsx
import DOMComponent from './my-component';

export default function App() {
  // useExpoDOMWebView: false 表示不使用 Expo 官方的 DOM WebView，
  // 而是使用社区版的 react-native-webview
  return <DOMComponent dom={{ useExpoDOMWebView: false }} />;
}
```

### SDK 55 及以下版本

需要手动安装社区版 WebView 包，使用上面相同的包管理器命令安装 `react-native-webview`。

### CLI 与 Metro 配置

> **关键概念**：
> - **Metro**：React Native 使用的 JavaScript 打包工具（类似 Webpack），负责将你的代码编译打包。
> - **CLI (Command Line Interface)**：命令行工具。Expo CLI 是 Expo 提供的命令行工具集。

如果你使用标准的 Expo CLI 命令（如 `npx expo start`、`npx expo run`），Metro 配置会自动完成。否则，你需要安装 Expo modules 包以启用正确的打包配置：

```sh
# npm
npx install-expo-modules@latest

# yarn
yarn dlx install-expo-modules@latest

# pnpm
pnpm dlx install-expo-modules@latest

# bun
bunx install-expo-modules@latest
```

### 运行时与 Web 依赖

> **关键概念**：
> - **`@expo/metro-runtime`**：Expo 的 Metro 运行时模块，提供 Web 与原生之间的桥接功能。
> - **`react-dom`**：React 的 DOM 渲染库，负责将 React 组件渲染为 HTML 元素（即浏览器中的 Web 渲染）。
> - **`react-native-web`**：将 React Native 组件映射到 Web 等价物的库，使同一份代码可以同时在原生和 Web 上运行。

如果你没有使用 Expo Router（Expo 官方路由库）或标准的 Web 配置，则需要手动安装以下依赖：

```sh
# npm
npx expo install @expo/metro-runtime react-dom react-native-web

# yarn
yarn expo install @expo/metro-runtime react-dom react-native-web

# pnpm
pnpm expo install @expo/metro-runtime react-dom react-native-web

# bun
bun expo install @expo/metro-runtime react-dom react-native-web
```

---

## 基本用法

使用 DOM 组件只需两步：

### 第一步：创建 DOM 组件文件

在文件**最顶部**添加 `'use dom'` 指令，然后像写普通 Web 组件一样编写代码：

```tsx
'use dom';

// 这是一个 DOM 组件，可以使用标准的 HTML 标签
export default function DOMComponent({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
    </div>
  );
}
```

> **说明**：`'use dom'` 是一个**文件级指令**（directive），它必须出现在文件的第一行。它告诉 Expo 的构建系统："这个文件中的组件应该在 WebView 中以 Web 模式运行，而不是作为原生组件渲染。"

### 第二步：在原生组件中导入并使用

```tsx
import DOMComponent from './my-component.tsx';

export default function App() {
  // DOMComponent 虽然是 Web 组件，但可以像普通 React Native 组件一样使用
  return (
    <DOMComponent name="Europa" />
  );
}
```

> **基于文档内容推导**：从原生代码的视角看，DOM 组件和普通 React Native 组件的使用方式完全一致，开发者无需关心底层 WebView 的通信细节。

---

## 功能特性

DOM 组件提供了丰富的功能支持：

| 功能 | 说明 |
|------|------|
| 统一的打包器配置 | DOM 组件与原生组件共享同一套 Metro 构建配置 |
| 完整的 Metro 支持 | 支持 TypeScript、CSS 等所有 Metro 能处理的特性 |
| 终端日志输出 | `console.log` 等输出会转发到开发终端 |
| 热更新 (Hot Reload) | 修改代码后自动刷新，无需手动重新加载 |
| 离线嵌入式导出 | 支持在没有网络的情况下导出和运行 |
| 统一资源管理 | 图片、字体等资源使用与原生相同的处理方式 |
| Atlas 打包分析 | 可使用 Expo Atlas 工具分析打包体积 |
| 无需重新编译原生代码 | Web 功能的修改不需要重新构建原生应用 |
| 开发错误叠加层 | 开发模式下提供友好的错误提示界面 |
| Expo Go 兼容 | 可以在 Expo Go 应用中直接运行和调试 |

---

## WebView 属性 (DOM Props)

你可以使用 `dom` 属性来向底层的 WebView 传递配置选项。

> **关键概念**：`dom` 属性是一个特殊的对象，它会被转发给底层的 WebView 组件。通过它可以控制 WebView 的行为，比如是否允许滚动、样式设置等。

### 传递 WebView 属性

```tsx
import DOMComponent from './my-component';

export default function App() {
  return (
    <DOMComponent
      dom={{
        // scrollEnabled: false 禁止 WebView 内部的滚动行为
        scrollEnabled: false,
      }}
    />
  );
}
```

### 在 DOM 组件中声明类型

为了获得正确的 TypeScript 类型检查，需要在 DOM 组件的 props 类型中包含 `dom` 属性：

```tsx
'use dom';

export default function DOMComponent({}: { dom: import('expo/dom').DOMProps }) {
  return (
    <div>
      <h1>Hello, world!</h1>
    </div>
  );
}
```

> **说明**：`DOMProps` 是从 `expo/dom` 导入的类型定义，包含了所有可用的 WebView 配置项。

---

## 序列化属性传递 (Marshalled Props)

> **关键概念**：**序列化 (Marshalling)** 是指将数据从一种格式转换为另一种可以跨进程传输的格式。在 DOM 组件中，原生端和 Web 端运行在不同的 JavaScript 引擎中（即不同的"进程"），它们之间通过一个**异步桥 (async bridge)** 通信。因此，传递的属性必须是可序列化的数据类型（如字符串、数字、布尔值、普通对象、数组等）。

你可以将可序列化的数据作为 props 从原生组件传递到 DOM 组件：

```tsx
import DOMComponent from './my-component';

export default function App() {
  // 将字符串 'world' 作为 prop 传递给 DOM 组件
  return <DOMComponent hello={'world'} />;
}
```

```tsx
'use dom';

export default function DOMComponent({ hello }: { hello: string }) {
  return <p>Hello, {hello}</p>;
}
```

> **注意**：由于 props 是直接传递给根组件的，每次 props 更新都会触发整个组件树的重新渲染。对于频繁更新的数据，建议使用原生操作 (Native Actions) 来代替。

---

## 原生操作 (Native Actions)

> **关键概念**：**Native Actions**（原生操作）是一种从 DOM 组件（Web 端）调用原生端函数的机制。它类似于 React Server Components 中的 **Server Actions**（服务器操作），只不过这里的调用发生在本地原生代码和 WebView 之间，而非客户端和服务器之间。

Native Actions 允许你将异步的、类型安全的函数作为顶层属性传递给 DOM 组件，在 Web 端调用原生逻辑：

```tsx
import DomComponent from './my-component';

export default function App() {
  return (
    <DomComponent
      // hello 是一个 Native Action：DOM 组件可以调用它，
      // 实际执行在原生端
      hello={(data: string) => {
        console.log('Hello', data);
      }}
    />
  );
}
```

```tsx
'use dom';

// 在 DOM 组件的类型定义中，Native Action 的类型是返回 Promise 的函数
export default function MyComponent({ hello }: { hello: (data: string) => Promise<void> }) {
  // 点击时调用原生端的 hello 函数
  return <p onClick={() => hello('world')}>Click me</p>;
}
```

**使用限制**：
- Native Actions 的参数和返回值必须是**可序列化的数据类型**
- Native Actions 必须是**异步函数**（返回 `Promise`）
- 必须作为组件的**顶层属性**传递

**实际应用场景示例** -- 获取设备名称：

```tsx
// 原生端定义
getDeviceName(): Promise<string> {
  return DeviceInfo.getDeviceName();
}
```

---

## 传递 Refs（引用）

> **注意**：此功能目前处于 **Alpha（早期测试）** 阶段，API 可能会有变化。

> **关键概念**：
> - **Ref (引用)**：React 中用于直接访问 DOM 元素或组件实例的机制。通常用于执行命令式操作，如聚焦输入框、播放动画等。
> - **`useImperativeHandle`**：React 的一个 Hook，允许你自定义通过 ref 暴露给父组件的方法。Expo 提供了专门的 `useDOMImperativeHandle` 用于 DOM 组件场景。
> - **`DOMImperativeFactory`**：从 `expo/dom` 导入的类型，定义了 DOM 组件中命令式句柄的基础接口。

### 原生端使用 ref

```tsx
import { useRef } from 'react';
import { Button, View } from 'react-native';
import MyComponent, { type DOMRef } from './my-component';

export default function App() {
  // 创建一个 ref，类型为 DOMRef
  const ref = useRef<DOMRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <MyComponent ref={ref} />
      <Button
        title="focus"
        onPress={() => {
          // 通过 ref 调用 DOM 组件暴露的 focus 方法
          ref.current?.focus();
        }}
      />
    </View>
  );
}
```

### SDK 53 及以上版本（React 19）

SDK 53 起使用 React 19 的新 ref 语法，ref 直接作为 prop 传递：

```tsx
'use dom';

import { useDOMImperativeHandle, type DOMImperativeFactory } from 'expo/dom';
import { Ref, useRef } from 'react';

// 定义暴露给原生端的方法接口
export interface DOMRef extends DOMImperativeFactory {
  focus: () => void;
}

export default function MyComponent(props: {
  ref: Ref<DOMRef>;
  dom?: import('expo/dom').DOMProps;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // useDOMImperativeHandle 类似于 React 的 useImperativeHandle，
  // 但专门用于跨原生/Web 边界的通信
  useDOMImperativeHandle(
    props.ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }),
    []
  );

  return <input ref={inputRef} />;
}
```

### SDK 52 及以下版本

使用传统的 `forwardRef` 方式：

```tsx
'use dom';

import { useDOMImperativeHandle, type DOMImperativeFactory } from 'expo/dom';
import { forwardRef, useRef } from 'react';

export interface MyRef extends DOMImperativeFactory {
  focus: () => void;
}

// forwardRef 是 React 18 及之前版本中传递 ref 的标准方式
export default forwardRef<MyRef, object>(function MyComponent(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null);

  useDOMImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }),
    []
  );

  return <input ref={inputRef} />;
});
```

> **基于经验建议**：通过回调函数从 DOM 组件向原生端传递数据并不是推荐的做法（non-idiomatic）。如果需要从 Web 端向原生端发送数据，应优先使用 Native Actions。

---

## 环境检测 (Feature Detection)

有时你需要在代码中判断当前是否在 DOM 组件环境中运行。Expo 提供了常量来进行检测：

```ts
import { IS_DOM } from 'expo/dom';

// IS_DOM 为 true 表示当前代码运行在 DOM 组件（WebView）环境中
// IS_DOM 为 false 表示运行在其他环境（如纯 Web 或原生端）
if (IS_DOM) {
  // 仅在 DOM 组件环境中执行的逻辑
}
```

此外，你还可以通过环境变量 `process.env.EXPO_OS` 来判断当前宿主操作系统（如 `ios`、`android`、`web`）。

---

## 公共资源 (Public Assets)

> **注意**：此功能目前处于 **Alpha** 阶段，且**不支持 EAS Update**（Expo 的空中更新服务）。

> **关键概念**：
> - **公共资源**：指放在项目根目录下的静态文件（如图片、字体等），它们会被直接复制到最终的应用安装包中。
> - **EAS Update**：Expo Application Services 提供的空中更新功能，可以在不重新发布应用的情况下推送更新。

在 DOM 组件中使用公共资源时，需要使用 `process.env.EXPO_BASE_URL` 作为路径前缀：

```tsx
// EXPO_BASE_URL 会自动根据运行环境返回正确的基础路径
<img src={`${process.env.EXPO_BASE_URL}img.png`} />
```

---

## 调试 (Debugging)

DOM 组件提供了便捷的调试能力：

- **终端日志**：`console.log`、`console.warn`、`console.error` 等输出会自动转发到开发终端（即运行 `npx expo start` 的命令行窗口）
- **浏览器开发者工具**：
  - **iOS**：可以使用 Safari 的 Web Inspector 来检查 WebView 中的 DOM 内容
  - **Android**：可以使用 Chrome DevTools 来检查和调试 WebView

> **基于经验建议**：使用浏览器开发者工具调试 DOM 组件时，体验与调试普通网页几乎一致，这对有 Web 开发经验的开发者来说非常友好。

---

## 手动使用 WebView

如果你不需要 `'use dom'` 指令提供的完整功能，只是想简单地在应用中嵌入一段 HTML 内容，可以直接使用 `react-native-webview`：

```tsx
import { WebView } from 'react-native-webview';

export default function App() {
  // 直接渲染一段 HTML 字符串
  return <WebView source={{ html: '<h1>Hello, world!</h1>' }} />;
}
```

> **基于文档内容推导**：手动 WebView 适合展示静态或远程加载的 HTML 内容，而 `'use dom'` 指令适合构建完整的、交互式的 Web 组件。

---

## 路由导航 (Routing)

> **关键概念**：**Expo Router** 是 Expo 官方的路由库，基于文件系统的自动路由方案。它提供了类似 Next.js 的路由体验。

### 在 DOM 组件中使用 Link

你可以在 DOM 组件中使用 Expo Router 的 `Link` 组件进行页面导航：

```tsx
'use dom';
import Link from 'expo-router/link';

export default function DOMComponent() {
  return (
    <div>
      <h1>Hello, world!</h1>
      {/* 使用 Expo Router 的 Link 组件进行导航 */}
      <Link href="/about">About</Link>
    </div>
  );
}
```

### 传递路由信息到 DOM 组件

由于 DOM 组件运行在 WebView 中，无法直接使用 Expo Router 的同步路由 Hooks（如 `usePathname`）。需要从原生包装组件手动传递：

```tsx
import DOMComponent from './my-component';
import { usePathname } from 'expo-router';

export default function App() {
  // 在原生端获取当前路径
  const pathname = usePathname();
  // 手动传递给 DOM 组件
  return <DOMComponent pathname={pathname} />;
}
```

### 路由相关限制

- 不支持 `back`（返回）和 `dismiss`（关闭）检查
- **避免使用**标准的 HTML `<a>` 标签进行导航，应使用 Expo Router 的 `Link` 组件
- **布局文件 (layout files) 必须保持为原生组件**，不能使用 `'use dom'` 指令

---

## 测量 DOM 组件尺寸 (Measuring DOM Components)

DOM 组件运行在 WebView 中，其尺寸管理比原生组件更复杂。有三种方式处理尺寸问题：

### 方式一：自动匹配内容尺寸

使用 `matchContents: true` 让 WebView 自动适应其内部内容的尺寸：

```tsx
import DOMComponent from './my-component';

export default function Route() {
  // matchContents 会让 WebView 的尺寸自动匹配内部 DOM 内容
  return <DOMComponent dom={{ matchContents: true }} />;
}
```

### 方式二：手动指定尺寸

通过 `style` 属性手动传递宽高：

```tsx
import DOMComponent from './my-component';

export default function Route() {
  return (
    <DOMComponent
      dom={{
        // 手动指定 WebView 容器的宽高
        style: { width, height },
      }}
    />
  );
}
```

### 方式三：动态跟踪尺寸变化

使用 `ResizeObserver`（浏览器原生 API）监听 DOM 内容尺寸变化，并通过 Native Actions 将尺寸信息传回原生端：

**DOM 组件端**：

```tsx
'use dom';

import { useEffect } from 'react';

// 自定义 Hook：使用 ResizeObserver 监听 body 尺寸变化
function useSize(callback: (size: { width: number; height: number }) => void) {
  useEffect(() => {
    // ResizeObserver 是浏览器 API，可以监听 DOM 元素的尺寸变化
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        callback({ width, height });
      }
    });

    // 监听 document.body 的尺寸变化
    observer.observe(document.body);

    // 初始化时立即回调一次当前尺寸
    callback({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    });

    return () => {
      observer.disconnect();
    };
  }, [callback]);
}

export default function DOMComponent({
  onDOMLayout,
}: {
  dom?: import('expo/dom').DOMProps;
  // onDOMLayout 是一个 Native Action，用于将尺寸信息传回原生端
  onDOMLayout: (size: { width: number; height: number }) => void;
}) {
  useSize(onDOMLayout);

  return <div style={{ width: 500, height: 500, background: 'blue' }} />;
}
```

**原生端**：

```tsx
import DOMComponent from '@/components/my-component';
import { useState } from 'react';
import { View, ScrollView } from 'react-native';

export default function App() {
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <DOMComponent
          // 接收来自 DOM 组件的尺寸更新通知
          onDOMLayout={async ({ width, height }) => {
            if (containerSize?.width !== width || containerSize?.height !== height) {
              setContainerSize({ width, height });
            }
          }}
          dom={{
            // 使用 containerStyle 动态设置 WebView 容器的尺寸
            containerStyle:
              containerSize != null
                ? { width: containerSize.width, height: containerSize.height }
                : null,
          }}
        />
      </ScrollView>
    </View>
  );
}
```

> **说明**：`containerStyle` 与 `style` 不同 -- `containerStyle` 控制的是 WebView 外层容器的大小，而 `style` 控制的是 WebView 内部内容的样式。

---

## 架构原理 (Architecture)

> **关键概念**：
> - **SPA (Single-Page Application，单页应用)**：一种 Web 应用架构，整个应用只有一个 HTML 页面，通过 JavaScript 动态更新内容，而非跳转到新页面。
> - **运行时代理 (Runtime Proxy)**：带有 `'use dom'` 指令的模块在打包时会被替换为一个代理对象，该代理在运行时将组件渲染到 WebView 中。

### 工作原理

1. **渲染方式**：DOM 组件**始终以单页应用 (SPA) 的形式渲染**，而非服务端渲染 (SSR)
2. **模块转换**：带有 `'use dom'` 指令的模块在构建时会被转换为**运行时代理**。当你在原生代码中导入并使用这个组件时，实际创建的是一个 WebView 实例，而非原生视图
3. **Web 平台行为**：当应用运行在 Web 平台（浏览器）上时，`'use dom'` 指令会被忽略，组件正常渲染为普通的 React DOM 组件
4. **概念共享**：DOM 组件的设计借鉴了 React Server Components 的概念模型（如 `'use client'` 指令），两者在理念上有相似之处

---

## 使用建议与考量

> **基于文档内容推导**：DOM 组件并非原生视图的完全替代品，而是一种补充工具。在选择使用 DOM 组件还是原生组件时，需要权衡以下因素：

### 优先使用原生视图的场景

对于性能敏感的 UI（如列表滚动、动画密集型界面），**原生视图始终是首选**。因为：
- 原生与 Web 之间的通信依赖**异步 JSON 序列化**，存在通信开销
- **全局状态无法跨引擎边界共享** -- 原生端的状态（如 Redux store）和 Web 端的状态是相互隔离的

### 适合使用 DOM 组件的场景

- **富文本渲染**：如 Markdown 内容、HTML 格式的文本
- **WebGL 内容**：3D 图形渲染（但注意电池消耗会被系统限制/节流）
- **次要页面**：如关于页面、帮助文档等非核心交互页面
- **现有 Web 组件迁移**：将已有的 Web 组件快速集成到原生应用中

---

## 与 Server Components 的关系

DOM 组件的工作方式类似于 React 的客户端指令 (`'use client'`)：

- 你可以传递序列化后的数据载荷 (payloads) 给 DOM 组件
- 但**无法在原生端进行水合 (hydration)** -- 即原生端不能像服务器那样预先渲染并"激活"组件

> **关键概念**：**水合 (Hydration)** 是 SSR（服务端渲染）中的概念，指在客户端接管服务端预先渲染的 HTML，为其添加交互能力的过程。在 DOM 组件场景中，由于运行在 WebView 中，不存在这种机制。

---

## 限制 (Limitations)

使用 DOM 组件时需要注意以下限制：

| 限制 | 说明 |
|------|------|
| 不支持子元素 | DOM 组件不能接受 `children` prop，即不能在 `<DOMComponent>...</DOMComponent>` 中嵌套子元素 |
| 实例隔离 | 每个 DOM 组件都是独立的 WebView 实例，彼此之间无法共享状态或上下文 |
| 不能嵌入原生视图 | DOM 组件内部不能使用 React Native 的原生组件（如 `<View>`、`<Text>`） |
| 函数属性必须异步 | 传递给 DOM 组件的函数 props 必须是异步的（返回 `Promise`），不支持同步函数 |
| 不支持空中更新 | 目前不支持通过 EAS Update 进行 OTA（Over-the-Air）更新 |

---

## 安全上下文 (Secure Contexts)

> **关键概念**：
> - **安全上下文 (Secure Contexts)**：Web 安全规范中定义的概念。某些敏感的 Web API（如 Clipboard API、Geolocation API 等）只能在安全的环境中运行，即通过 HTTPS 或 `localhost` 访问的页面。
> - **File 协议**：使用 `file://` 协议加载的本地文件。在发布版本中，应用使用 file 协议加载资源，默认被视为安全上下文。

### 发布版本 (Release Builds)

发布版本使用 `file://` 协议加载本地资源，**默认处于安全上下文中**，所有 Web API 均可正常使用。

### 调试版本 (Debug Builds)

调试版本通常通过 HTTP 加载资源，**可能不被视为安全上下文**。某些需要安全上下文的 Web API（如剪贴板 API）将无法使用。

**解决方案**：使用 HTTPS 隧道模式进行调试：

```sh
# 1. 安装 expo-dev-client
# npm
npx expo install expo-dev-client

# yarn
yarn expo install expo-dev-client

# pnpm
pnpm expo install expo-dev-client

# bun
bun expo install expo-dev-client
```

```sh
# 2. 构建并运行（Android）
npx expo run:android

# 3. 以 HTTPS 隧道模式启动开发服务器
npx expo start --tunnel -d -a
```

```sh
# 2. 构建并运行（iOS）
npx expo run:ios

# 3. 以 HTTPS 隧道模式启动开发服务器
npx expo start --tunnel -d -i
```

> **说明**：`--tunnel` 参数会创建一个 HTTPS 隧道（通过 ngrok 或类似工具），使开发服务器通过 HTTPS 访问，从而满足安全上下文的要求。`-d` 表示使用开发构建，`-a` 和 `-i` 分别指定 Android 和 iOS 平台。

---

## 相关资源

- [Expo Web 开发工作流](https://docs.expo.dev/workflow/web/)
- [发布网站指南](https://docs.expo.dev/guides/publishing-websites/)
- [渐进式 Web 应用 (PWA)](https://docs.expo.dev/guides/progressive-web-apps/)
- [Tailwind CSS 集成](https://docs.expo.dev/guides/tailwind/)
- [本地 HTTPS 开发](https://docs.expo.dev/guides/local-https-development/)
- [`@expo/dom-webview` npm 包](https://www.npmjs.com/package/@expo/dom-webview)
- [`react-native-webview` API 参考](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md)
- [React `useImperativeHandle` 文档](https://react.dev/reference/react/useImperativeHandle)
- [MDN: 安全上下文](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
- [MDN: 剪贴板 API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [MDN: 受限于安全上下文的功能列表](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts)

---

## 文档导航

- **上一页**：[publishing websites](./22__publishing-websites.md)
- **下一页**：[progressive web apps](./24__progressive-web-apps.md)
