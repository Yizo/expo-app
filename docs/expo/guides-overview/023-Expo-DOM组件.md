# 023｜在 Expo Native App 中使用 React DOM

**翻页：**[上一页：发布 Expo Web 网站](./022-发布网站.md) · [目录](./README.md) · [下一页：React Server Components](./024-React-Server-Components.md)

**官方页面：**[Using React DOM in Expo native apps](https://docs.expo.dev/guides/dom-components/)

**版本边界：**项目使用 Expo SDK 56（`expo ~56.0.11`）。官方当前指南说明 SDK 56 及之后默认通过 `@expo/dom-webview` 运行 DOM component；SDK 55 及之前需要 `react-native-webview`。这是一个适合渐进迁移的 WebView 能力，不代表原生端可以直接把 `div`、`img` 当作普通 RN view 使用。

## DOM Component 是什么

DOM Component 把一段浏览器 React / HTML 放进原生应用里的 WebView 中。给 Web component 文件顶部加 `'use dom'`，Expo Metro 会把该模块转换为可嵌入原生视图的代理。它适合把现有 Web 部件逐个搬进 Expo app，例如富文本、帮助页面、WebGL 内容；主界面仍建议使用 RN 原生组件，启动和交互效率更好。

在 SDK 56+，新建项目一般不用额外安装 WebView。想改用 `react-native-webview` 时，可安装匹配 SDK 的包，并在该 DOM component 的 `dom` 配置中关闭 Expo 默认实现：

```sh
npx expo install react-native-webview
yarn expo install react-native-webview
pnpm expo install react-native-webview
bun expo install react-native-webview
```

```tsx
import DOMComponent from './my-component';

export default function App() {
  return <DOMComponent dom={{ useExpoDOMWebView: false }} />;
}
```

### Expo / Metro 前置设置

使用 `npx expo start` 的 Expo 工程（例如 `create-expo-app` 创建的项目）已经具备 Expo CLI 和 Metro 配置。既有 React Native 项目若还没有 Expo package，可用安装脚本接入 Expo Modules：

```sh
npx install-expo-modules@latest
yarn dlx install-expo-modules@latest
pnpm dlx install-expo-modules@latest
bunx install-expo-modules@latest
```

若项目没有同时配置 Expo Router 与 Expo Web，还需安装浏览器渲染所需依赖；SDK 配套版本应通过 `expo install` 选择：

```sh
npx expo install @expo/metro-runtime react-dom react-native-web
yarn expo install @expo/metro-runtime react-dom react-native-web
pnpm expo install @expo/metro-runtime react-dom react-native-web
bun expo install @expo/metro-runtime react-dom react-native-web
```

## 把 Web component 放进原生 screen

Web 文件用 `'use dom'` 标记，内部可以写 HTML / CSS / 浏览器 API；native 文件像导入普通 React component 一样引入它：

```tsx
// my-component.tsx：在 DOM/WebView 侧运行
'use dom';

export default function DOMComponent({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
    </div>
  );
}
```

```tsx
// App.tsx：由 React Native 原生 renderer 渲染
import DOMComponent from './my-component';
import { View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <DOMComponent name="Europa" />
    </View>
  );
}
```

DOM component 是独立的 Web 运行环境。不同于一般 RN 子组件，native component 与 DOM component 不能共享任意 JS 对象或 React context；传递的数据必须经过异步序列化桥接。

## 传入 WebView 配置

每个 DOM component 都内建 `dom` prop，可把底层 WebView 支持的选项传过去。Web 文件的 props 类型中也应声明这个字段，供 TypeScript 检查：

```tsx
// App.tsx
import DOMComponent from './my-component';

export default function App() {
  return <DOMComponent dom={{ scrollEnabled: false }} />;
}
```

```tsx
// my-component.tsx
'use dom';

import type { DOMProps } from 'expo/dom';

export default function DOMComponent({ dom }: { dom?: DOMProps }) {
  return <div style={{ minHeight: 160 }}>Web content</div>;
}
```

## Native 与 DOM 之间传值

Native 可以传 number、string、boolean、null、undefined、数组和普通对象等可序列化值。数据异步经过 bridge，抵达 Web component 的 React root props；更新会让 DOM component 的 React tree 重新渲染。

```tsx
// App.tsx
import DOMComponent from './my-component';

export default function App() {
  return <DOMComponent greeting="你好" retryCount={2} />;
}
```

```tsx
// my-component.tsx
'use dom';

export default function DOMComponent({
  greeting,
  retryCount,
}: {
  greeting: string;
  retryCount: number;
}) {
  return <p>{greeting}，这是第 {retryCount} 次尝试。</p>;
}
```

复杂类实例、函数（除下文 native action）、DOM 节点等不可直接序列化；应传入 id / 普通对象等数据，并在对应运行环境重新查找资源。

## Native Actions：让 Web 调用原生能力

可以把异步函数作为顶层 prop 从 native 传入 Web component。Web 一侧会得到返回 Promise 的函数；调用时参数必须可序列化，函数返回值也必须可序列化。不能把 native action 嵌套在普通对象 prop 里。

```tsx
// App.tsx：函数在原生应用侧执行
import DOMComponent from './my-component';

export default function App() {
  return (
    <DOMComponent
      sayHello={async (name: string) => {
        console.log('DOM component 请求问候：', name);
        return '你好，' + name;
      }}
    />
  );
}
```

```tsx
// my-component.tsx：调用桥接来的异步 native action
'use dom';

export default function DOMComponent({
  sayHello,
}: {
  sayHello: (name: string) => Promise<string>;
}) {
  return (
    <button
      onClick={async () => {
        const message = await sayHello('Expo');
        console.log(message);
      }}>
      调用原生函数
    </button>
  );
}
```

比如 Web content 想读取设备信息时，可由原生一侧调用拥有权限的模块，并将字符串结果经 action 回传；DOM 运行时本身不应直接访问原生模块：

```ts
export async function getDeviceName(): Promise<string> {
  return DeviceInfo.getDeviceName();
}
```

Native action 类似本地 API 边界：它只能异步通信，返回值不是可直接同步读取的变量。不要把它当作同一 JS 引擎内的普通 callback。

## 从 native 侧调用 DOM ref

`useDOMImperativeHandle` 允许 Web component 暴露少量必要命令（例如聚焦输入框），行为类似 React 的 `useImperativeHandle`。当前 SDK 56 使用 React 19，`ref` 可以作为 component prop：

```tsx
// App.tsx
import { useRef } from 'react';
import { Button, View } from 'react-native';
import DOMComponent, { type DOMRef } from './my-component';

export default function App() {
  const domRef = useRef<DOMRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <DOMComponent ref={domRef} />
      <Button title="聚焦网页输入框" onPress={() => domRef.current?.focus()} />
    </View>
  );
}
```

```tsx
// my-component.tsx
'use dom';

import { useRef, type Ref } from 'react';
import {
  useDOMImperativeHandle,
  type DOMImperativeFactory,
  type DOMProps,
} from 'expo/dom';

export interface DOMRef extends DOMImperativeFactory {
  focus: () => void;
}

export default function DOMComponent(props: {
  ref: Ref<DOMRef>;
  dom?: DOMProps;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useDOMImperativeHandle(
    props.ref,
    () => ({ focus: () => inputRef.current?.focus() }),
    []
  );

  return <input ref={inputRef} />;
}
```

旧版 Expo SDK 52 及更早使用 React 18，需由 `forwardRef` 接收 ref；当前项目以 SDK56 / React19 的形式为准：

```tsx
'use dom';

import { forwardRef, useRef } from 'react';
import {
  useDOMImperativeHandle,
  type DOMImperativeFactory,
} from 'expo/dom';

interface DOMRef extends DOMImperativeFactory {
  focus: () => void;
}

export default forwardRef<DOMRef, object>(function DOMComponent(_props, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  useDOMImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }), []);
  return <input ref={inputRef} />;
});
```

只暴露少量且必要的命令；频繁来回调度 ref 会造成两侧状态难以理解。

## 判断运行位置与读取静态资源

DOM component 内的 `process.env.EXPO_OS` 会是 `'web'`。若还需要知道最外层原生宿主平台，可读取 `process.env.EXPO_DOM_HOST_OS`：它在 Android / iOS 宿主中分别是 `'android'` / `'ios'`，普通 Web 页面中为 undefined。Expo 还提供 `IS_DOM` 标志：

```ts
import { IS_DOM } from 'expo/dom';

if (IS_DOM) {
  console.log('当前模块作为 DOM component 运行');
}
```

原生 binary 会把项目根 `public` 目录里的资源复制给 DOM component。相对地址可以加上 Expo 提供的 `EXPO_BASE_URL` 前缀。Public 文件目前不能通过 EAS Update 更新；需要随 OTA 更新的图片应使用 `require()` 本地打包：

```tsx
'use dom';

export default function Banner() {
  return <img src={process.env.EXPO_BASE_URL + 'img.png'} alt="横幅" />;
}
```

## 调试与手动 WebView

开发时，WebView 的 `console.log` 会转发到终端；可以在 Safari 的 Develop 菜单（或 Chrome 对应调试工具）检查 WebView DOM 与控制台。Expo Atlas 也能查看 DOM component bundle。

需要直接渲染远端 HTML 时，也可以不用 `'use dom'`，手动创建传统 WebView：

```tsx
import { WebView } from 'react-native-webview';

export default function RemoteHtml() {
  return <WebView source={{ html: '<h1>独立的网页视图</h1>' }} />;
}
```

## DOM 内的 Expo Router 路由

`expo-router` 的 `Link`、`useRouter` 可在 DOM component 中用于 Router 导航；外部 URL 不要随意用普通 HTML `<a>`，它会改变 DOM origin，可能导致返回行为异常，可调用 `expo-web-browser` 展示外部网站。

```tsx
'use dom';

import Link from 'expo-router/link';

export default function DOMPage() {
  return (
    <div>
      <h1>帮助中心</h1>
      <Link href="/about">关于</Link>
    </div>
  );
}
```

部分 Router Hooks 会同步读取当前路由，不能直接跨 DOM 边界使用；在 native component 中读取后作为普通 serializable prop 传入：

```tsx
// App.tsx
import { usePathname } from 'expo-router';
import DOMPage from './my-component';

export default function App() {
  const pathname = usePathname();
  return <DOMPage pathname={pathname} />;
}
```

`useLocalSearchParams`、`useGlobalSearchParams`、`usePathname`、`useSegments`、`useRootNavigation` 和 `useRootNavigationState` 属于需留在 native router tree 读取的同步信息。`router.canGoBack()` / `router.canDismiss()` 也不能直接跨桥使用。DOM component 无法渲染 native children，所以文件路由的 `_layout` 必须仍然是 native；可以在原生 layout 中把 DOM component 当作 header 或背景。

## 测量 DOM Component 的布局

通常 WebView 要有明确尺寸。需要按内容自适应时，可用 `matchContents`：

```tsx
<DOMComponent dom={{ matchContents: true }} />
```

也可以直接通过 `dom.style` 设置宽高：

```tsx
<DOMComponent dom={{ style: { width: 320, height: 240 } }} />
```

如果网页内容高度持续变化，可在 DOM 一侧用 `ResizeObserver` 观察 `document.body`，再通过 native action 报告尺寸；native 收到后更新 `containerStyle`，让滚动容器重新布局：

```tsx
// my-component.tsx
'use dom';

import { useEffect } from 'react';
import type { DOMProps } from 'expo/dom';

type Size = { width: number; height: number };

export default function DOMComponent({
  onDOMLayout,
}: {
  dom?: DOMProps;
  onDOMLayout: (size: Size) => void;
}) {
  useEffect(() => {
    const body = document.body;
    const report = () => {
      onDOMLayout({
        width: body.clientWidth,
        height: body.clientHeight,
      });
    };
    const observer = new ResizeObserver(report);
    observer.observe(body);
    report();
    return () => observer.disconnect();
  }, [onDOMLayout]);

  return <div style={{ width: 500, height: 500, background: 'lightblue' }} />;
}
```

```tsx
// App.tsx
import { useState } from 'react';
import { ScrollView } from 'react-native';
import DOMComponent from './my-component';

type Size = { width: number; height: number };

export default function App() {
  const [size, setSize] = useState<Size | null>(null);
  return (
    <ScrollView>
      <DOMComponent
        onDOMLayout={({ width, height }) => {
          setSize(previous =>
            previous?.width === width && previous?.height === height
              ? previous
              : { width, height }
          );
        }}
        dom={{
          containerStyle: size ? { width: size.width, height: size.height } : null,
        }}
      />
    </ScrollView>
  );
}
```

通过避免尺寸未变化时重复 setState，减少 Web 与 native 之间的无效重新渲染。

## 性能与适用范围

- DOM component 目前以 SPA 方式渲染，不支持 SSR / SSG。它标记 `'use dom'` 后会在 bundle 阶段变成运行时代理。
- Web 和 native 有各自的 JavaScript 引擎；Context、全局 store 与组件实例之间不会自动共享数据。
- 两侧只通过异步 JSON bridge 交换可序列化值；DOM component 不能接收原生 children，native views 也不能直接嵌进 Web DOM。
- Native actions 必须异步；Server Functions 当前不能在 DOM component 内运行。
- 页面可在 native 中运行，但 HTML / JS 需要 WebView 解析，启动和耗电通常不如 Text / Image / View 等原生组件。
- DOM component 适合复用 Web 特有能力或低频辅助页面；如需最佳滚动、启动和手势体验，优先选择真正原生的实现。
- Expo Router 针对 Expo Router app 开发 / 测试 DOM 组件；复杂深层 URL 或跨引擎共享状态不属于其自动支持范围。
- 当前嵌入模式不支持 EAS Update 对 DOM bundle 的 OTA 更新；静态 `public` 资源也不能随 EAS Update 一同替换。

## 在 secure context 中访问 Web API

剪贴板等浏览器 API 可能要求 secure context。Release app 使用 `file://` scheme 的内嵌资源默认处于安全上下文；开发 server 默认 HTTP，可开启 Expo tunnel。先安装开发客户端，再用对应设备启动：

```sh
npx expo install expo-dev-client
npx expo run:android
npx expo start --tunnel -d -a
# 停止 server 后：
npx expo run:ios
npx expo start --tunnel -d -i
```

Yarn / pnpm / Bun 项目的对应形式：

```sh
yarn expo install expo-dev-client
yarn expo run:android
yarn expo start --tunnel -d -a
yarn expo run:ios
yarn expo start --tunnel -d -i
```

```sh
pnpm expo install expo-dev-client
pnpm expo run:android
pnpm expo start --tunnel -d -a
pnpm expo run:ios
pnpm expo start --tunnel -d -i
```

```sh
bun expo install expo-dev-client
bun expo run:android
bun expo start --tunnel -d -a
bun expo run:ios
bun expo start --tunnel -d -i
```

## 关键名词

- **DOM component**：由 Web React / HTML 组成、通过 WebView 显示在原生 app 中的组件。
- **WebView**：应用内嵌的浏览器容器；与 RN renderer 原生绘制的 `View` / `Text` 不同。
- **Marshalling / bridge**：两套 JavaScript 环境之间把可序列化数据异步传递的边界。
- **Native action**：Web 侧以 Promise 形式调用、实际在原生 JS 侧执行的顶层异步函数 prop。
- **`'use dom'`**：Expo Metro 识别的指令，声明文件应作为 DOM component 打包。
- **`'use client'` / Server Component**：React Server Components 架构中的客户端模块 / 服务端模块概念；当前 DOM component 本身不支持 SSR / SSG。
- **Secure context**：浏览器认为可信的执行上下文，剪贴板等 API 会因此决定能否使用。
- **matchContents / ResizeObserver**：自动同步 Web 内容尺寸，以及浏览器观察元素大小变化的 API。

## 官方代码主题覆盖

源页所有代码块主题均已用等价示例覆盖：SDK 55 及以前安装 WebView、SDK 56+ 切换默认 WebView 的 prop、Expo Modules / Metro / React DOM 的四种包管理器安装命令、`'use dom'` 组件与 native import、WebView props 类型、可序列化 props、双向 native actions 与 device-info 示例、React19 ref 与旧版 forwardRef、`IS_DOM` 和宿主 OS 判断、`EXPO_BASE_URL` 公共资源、手动 WebView、Expo Router Link 与路由信息 marshalling、`matchContents` / 显式尺寸 / ResizeObserver + native state、Android / iOS tunnel 的四种包管理器命令。能力清单、架构、限制、secure-context 与性能说明也已逐项归纳。

## 下一页

官方页脚 **Next** 指向 [Using React Server Components in Expo Router apps](https://docs.expo.dev/guides/server-components/)，开始介绍 Expo Router 的实验性 React Server Components。

**翻页：**[上一页：发布 Expo Web 网站](./022-发布网站.md) · [返回目录](./README.md) · [下一页：React Server Components](./024-React-Server-Components.md)
