# Using React DOM in Expo native apps 学习整理

## 文档解决的问题

这篇文档解决的是：如何在 Expo 原生应用中直接运行 React DOM 组件，也就是把一段 Web 代码嵌入到原生 App 里，而不是把它完全重写成 React Native 组件。

对 React Web 开发者来说，这个能力很像“把现有网页组件逐块迁移进原生 App”，因此它特别适合增量迁移，而不是从零开始重写。

## 适用场景

- 你有现成 React Web 组件，想快速放进 Expo 原生应用。
- 你要做增量迁移，不想一次性把整个网站重写成 React Native。
- 你需要使用浏览器侧能力、富文本、Markdown 或 WebGL 这类更适合 DOM 的内容。
- 你愿意接受 WebView / 跨 JS 引擎通信带来的限制。

## 核心概念

### `'use dom'` 指令

文档的核心就是在模块顶部加：

```tsx
'use dom';
```

当模块被这样标记后，它不再按普通 React Native 组件处理，而会变成一个 DOM component。

### DOM component 的本质

文档明确说明：

- 在原生侧导入 DOM component 时，实际拿到的是一个包装后的 `WebView`
- Web 代码运行在自己的 DOM / WebView 环境里
- 原生侧与 DOM 侧之间通过异步桥接通信

所以这不是“React Native 直接支持 `<div>`”，而是“Expo 让 Web 组件以一种框架化方式嵌入原生 App”。

## 前置条件

### 1. WebView 运行时

文档说明：

- Expo SDK 55 及更早版本默认使用 `@expo/dom-webview`
- 如果你想改用 `react-native-webview`，需要安装它，并通过 `dom` prop 关闭 Expo 默认实现

示例：

```tsx
<DOMComponent dom={{ useExpoDOMWebView: false }} />
```

### 2. Expo CLI 与 Expo Metro Config

如果项目本来就通过 `npx expo [command]` 运行，通常已经满足。

如果项目还没接入 `expo` 包，文档要求安装 Expo 模块并切换到 Expo CLI / Metro 流程。

### 3. Web 相关依赖

若不是 Expo Router + Expo Web 场景，需要安装：

```sh
npx expo install @expo/metro-runtime react-dom react-native-web
```

## 基础使用流程

### 1. 在 Web 组件文件中添加 `'use dom'`

```tsx
'use dom';

export default function DOMComponent({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
    </div>
  );
}
```

### 2. 在原生组件里直接导入它

```tsx
import DOMComponent from './my-component.tsx';

export default function App() {
  return <DOMComponent name="Europa" />;
}
```

文档强调，这时它背后会重新导出一个包裹过的 `react-native-webview`。

## DOM components 提供的能力

文档列出的特性包括：

- 统一的 bundler 配置
- 支持 React、TypeScript、CSS 及 Metro 其他特性
- 终端日志和 Safari / Chrome 调试
- Fast Refresh 与 HMR
- 离线嵌入式导出
- 资源在 Web 与 Native 之间统一
- 可在 Expo Atlas 里分析 DOM component bundle
- 不需要原生重编译就能访问 Web 功能
- 开发期运行时错误覆盖层
- 支持 Expo Go

## 数据与能力传递方式

### 1. `dom` prop：控制底层 WebView

所有 DOM component 都内置 `dom` prop，可传入 `WebView` props：

```tsx
<DOMComponent dom={{ scrollEnabled: false }} />
```

如果你要在 TypeScript 中声明这个 prop，文档建议：

```tsx
dom?: import('expo/dom').DOMProps
```

### 2. 可序列化 props

文档明确限制：

- 只支持可序列化类型：`number`、`string`、`boolean`、`null`、`undefined`、`Array`、`Object`
- 这些 props 经过**异步桥**传输
- 更新时会重新渲染整个 React root tree

这和 React Web 的同步 props 心智模型不一样，性能和时序都要更谨慎。

### 3. Native actions

你可以把异步函数作为**顶层 props**传给 DOM component：

```tsx
<DomComponent
  hello={async (data: string) => {
    console.log('Hello', data);
  }}
/>
```

文档强调：

- 只能作为顶层 props 传递，不能嵌套在对象里
- 必须是异步函数
- 参数必须可序列化
- 也可以返回可序列化数据

这可以理解成“在 DOM 组件里调用原生侧能力的 RPC”。

### 4. refs

文档把 ref 支持标成 **alpha**。它通过 `useDOMImperativeHandle` 暴露 DOM 侧的命令式方法。

但文档同时提醒：

- React 更推崇单向数据流
- 这种回调式向上交互可能不稳定，未来甚至可能被弱化
- 更推荐使用 native actions + 状态更新

## 路由、资源、调试与测量

### 路由

文档说明：

- `expo-router` 的 `<Link />`、`useRouter` 可在 DOM components 中使用
- 但 `usePathname()`、`useSegments()`、`useLocalSearchParams()` 等同步读取路由信息的 API **不自动支持**
- 这些值应在原生侧读取，再通过 props 传给 DOM component

此外还有几条很重要的限制：

- `router.canGoBack()` / `router.canDismiss()` 不支持自动使用
- 不要用普通 Web 的 `<a />` 做导航
- `_layout` 路由不能本身就是 DOM component，因为 DOM component 不能渲染 native children

### 资源

文档把 public assets 标为 **alpha**，并且明确说：

- **EAS Update 不支持**
- 推荐用 `require()` 加载本地资源

如果必须访问 `public/` 下资源，需要用：

```tsx
process.env.EXPO_BASE_URL
```

拼出资源路径。

### 调试

文档明确说明：

- `console.log` 会从 WebView 转发到终端
- 开发模式下可用 Safari 的 Develop 菜单检查 WebView

### 尺寸测量

有三种方式：

- `dom={{ matchContents: true }}` 自动跟随内容大小
- 直接通过 `dom.style` 手动给宽高
- 用 `ResizeObserver` + native action 把尺寸变化回传到原生侧

## 架构与限制

### 架构层面的定义

文档说明：

- DOM components 只以 **SPA** 形式渲染
- 不支持 SSR / SSG
- 被 `'use dom'` 标记的模块会在运行时替换成代理引用
- DOM component 在网站或其他 DOM component 内部渲染时，会退化成普通组件，`dom` prop 会被忽略

### 重要限制

- 不能向 DOM components 传 `children`
- 不同 DOM component 实例之间不会自动共享数据
- 不能把 native view 放进 DOM component 内部
- function props 不能同步返回值
- 当前只能嵌入使用，且不支持 OTA updates
- 全局状态不能跨 JS 引擎共享
- DOM components 比真正的 native view 更不优

### 文档推荐的使用态度

文档明确建议：**能用真正的原生通用组件（`View`、`Image`、`Text`）时，优先用原生方案**。

DOM components 更适合：

- rich text
- markdown
- 某些 WebGL 场景
- 博客、帮助页、设置页等次要页面

## Secure Context 常见问题

文档末尾专门解释了安全上下文问题：

- **Release builds**：`file://` 提供的 DOM components 默认是 secure context
- **Debug builds**：开发服务器默认是 `http://`，如果你需要 Clipboard API 这类安全上下文能力，应通过 tunneling 让它走 HTTPS

示例命令围绕：

- `expo-dev-client`
- `expo run:*`
- `expo start --tunnel -d -a`
- `expo start --tunnel -d -i`

## React Web 开发者最容易误解的点

- **误解 1：`'use dom'` 后，原生端就真的直接支持 DOM。**
  实际上还是 WebView + 桥接。
- **误解 2：props 传递和普通 React 组件一样同步。**
  文档明确说是异步桥接。
- **误解 3：既然能用 Web，就可以像网页一样自由嵌套布局和路由。**
  文档列出大量限制，尤其是路由、children、native children、全局状态共享。
- **误解 4：这会比原生组件更优。**
  文档明确不这么建议。

## 实际开发建议

- 基于经验建议：把 DOM components 当成“迁移桥梁”或“局部特例”，不要默认当作主要 UI 技术栈。
- 基于文档内容推导：如果你要传很多高频数据，优先重新评估是否应该改写成真正的 React Native 组件，因为异步桥接会带来额外成本。
- 基于文档内容推导：富文本、文档阅读、帮助页这类内容型界面，是 DOM components 更合理的使用场景。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- `'use dom'` 用于把 React DOM 组件运行在 Expo 原生应用里
- 底层通过 WebView 工作
- props 和函数通信都有可序列化、异步桥接限制
- refs、public assets 属于 alpha 能力
- 不支持 children、SSR / SSG、OTA updates
- 推荐优先使用真正的 native views

### 基于文档内容推导

- 这套能力的价值主要在迁移效率，而不是运行时纯性能。
- 只要业务强依赖同步共享状态或深层路由整合，DOM components 的复杂度就会明显上升。
- DOM components 适合“网页能力很强、原生交互要求较弱”的局部界面。

## 当前文档未涉及

- 与普通 `react-native-webview` 手写方案的完整性能对比
- DOM components 的完整生产监控方案
- OTA updates 未来支持时间表
