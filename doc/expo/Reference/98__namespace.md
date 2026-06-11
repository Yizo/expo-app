# Namespace：在 Expo SwiftUI 中协调动画与视图几何效果

> 原文修改日期：2026 年 4 月 29 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含

> **版本提示：**原文属于“下一个 Expo SDK 版本”的未发布版本文档。文档明确指出，当前最新稳定版本是 SDK 56。实际开发时，应优先核对 SDK 56 对应页面中的 API 是否一致。

## 文档解决的问题

`Namespace` 组件用于在 React 组件树中创建一个 SwiftUI `Namespace`，让多个原生 SwiftUI 视图共享同一个命名空间，从而协调：

- 动画效果；
- 视图之间的几何匹配；
- 具有连续视觉关系的平滑过渡；
- 示例中的玻璃效果元素标识。

可以把它理解为一个“动画关联作用域”：处于同一 `Namespace` 中，并使用同一个 namespace ID 的视图，可以被 SwiftUI 识别为属于同一组动画协调关系。

这不同于 CSS `namespace`、JavaScript 模块命名空间或 React Context。它对应的是 Apple SwiftUI 中专门用于动画协调的原生机制。

## 适用场景

文档展示的主要场景是：一组工具图标会随着状态变化展开或收起，需要让 SwiftUI 协调这些图标及玻璃效果的动画。

它适合以下需求：

- 两个或多个视图需要建立几何或动画关联；
- 视图会在不同状态、位置或布局之间切换；
- 使用 `glassEffectId` 等需要 namespace ID 的 modifier；
- 希望由 SwiftUI 原生动画系统生成更连贯的过渡效果。

如果页面仅包含普通的显示、隐藏或不需要跨视图协调的动画，当前文档没有说明必须使用 `Namespace`。

## 阅读前需要理解的概念

### Expo 与 React Native

React Native 使用 React 编写界面，但最终渲染的是移动平台的原生视图，而不是浏览器 DOM。

Expo 是建立在 React Native 之上的开发平台，提供依赖管理、原生模块和开发工具。文档中的 `@expo/ui` 允许 React 代码使用部分原生 UI 能力。

### SwiftUI

SwiftUI 是 Apple 为 iOS、tvOS 等平台提供的声明式 UI 框架。它在理念上与 React 相似：开发者根据状态描述界面，框架负责更新视图。

这里使用的组件来自：

```tsx
@expo/ui/swift-ui
```

这表示它们背后对应 SwiftUI 原生视图，而不是 React Web 元素或常规 DOM 节点。

### Namespace

SwiftUI 的 `Namespace` 会生成一个可用于关联视图的唯一作用域。关联动画时，通常需要同时确定：

1. 视图属于哪个 namespace；
2. 视图在该 namespace 中使用什么局部标识。

在示例中：

```tsx
const namespaceId = useId();
```

生成 namespace ID；随后：

```tsx
<Namespace id={namespaceId}>
```

建立作用域；最后：

```tsx
glassEffectId('paintbrush', namespaceId)
```

把具体效果标识 `'paintbrush'` 与该 namespace 关联起来。

### Modifier

`modifier` 可以类比 React Web 中的样式与行为配置组合，但它不等同于 CSS。它对应 SwiftUI 对视图进行布局、外观和动画修饰的机制。

示例使用了以下 modifier：

| Modifier | 作用 |
| --- | --- |
| `animation(...)` | 为状态变化配置动画 |
| `padding(...)` | 设置内边距 |
| `frame(...)` | 设置视图尺寸 |
| `background(...)` | 设置背景 |
| `cornerRadius(...)` | 设置圆角 |
| `glassEffect(...)` | 应用玻璃视觉效果 |
| `glassEffectId(...)` | 在指定 namespace 中标识玻璃效果元素 |

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

这里使用 `expo install`，而不是直接使用包管理器的普通安装命令。它负责选择与当前 Expo SDK 兼容的依赖版本。

如果是在已有的裸 React Native 项目中使用，还需要先安装并配置 `expo`，使该工程能够加载 Expo Modules。当前文档没有展开具体配置步骤。

## 基本用法

### 1. 导入组件

```tsx
import { Namespace } from '@expo/ui/swift-ui';
```

`Namespace` 不是 React Native 核心组件，而是 `@expo/ui` 提供的 SwiftUI 组件。

### 2. 生成稳定的 ID

```tsx
const namespaceId = React.useId();
```

文档明确推荐使用 React 的 `useId` 生成 namespace ID。

`useId` 返回字符串，并且遵守 Hook 调用规则，因此应在组件顶层调用，不能放进条件分支或事件处理函数中。

### 3. 创建 Namespace 作用域

```tsx
<Namespace id={namespaceId}>
  {/* 需要共享该 namespace 的视图 */}
</Namespace>
```

`Namespace` 通过 `children` 包裹需要使用该命名空间的原生 SwiftUI 视图。

### 4. 将具体效果关联到 Namespace

```tsx
<Image
  systemName="paintbrush.fill"
  modifiers={[
    glassEffect({
      glass: {
        variant: 'clear',
      },
    }),
    glassEffectId('paintbrush', namespaceId),
  ]}
/>
```

这里存在两类 ID：

- `namespaceId`：表示整个动画协调作用域；
- `'paintbrush'`：表示该作用域中的具体效果元素。

不要把二者理解成 HTML 的 `id` 属性。它们服务于 SwiftUI 的原生效果协调，而不是 DOM 查询、CSS 选择器或 URL 锚点。

## 完整示例的执行过程

原文示例通过以下状态控制工具栏展开：

```tsx
const [isGlassExpanded, setIsGlassExpanded] = useState(false);
```

按钮点击后切换状态：

```tsx
onPress={() => setIsGlassExpanded(!isGlassExpanded)}
```

当状态为 `true` 时，额外渲染第二排图标：

```tsx
{isGlassExpanded && (
  <HStack>{/* 更多图标 */}</HStack>
)}
```

主要组件的职责如下：

| 组件 | 作用 |
| --- | --- |
| `Host` | 承载 SwiftUI 组件树，并通过 React Native `style` 设置外层布局 |
| `VStack` | 按垂直方向排列子视图 |
| `HStack` | 按水平方向排列子视图 |
| `Namespace` | 为子视图提供 SwiftUI namespace |
| `GlassEffectContainer` | 承载和组织玻璃效果 |
| `Image` | 显示 Apple 系统符号图标 |
| `Button` | 响应用户操作 |
| `Text` | 显示按钮文字 |

示例为布局和玻璃效果容器配置了弹簧动画：

```tsx
animation(Animation.spring({ duration: 0.8 }), isGlassExpanded)
```

其含义是：当 `isGlassExpanded` 变化时，相关视图使用持续时间为 `0.8` 的 spring 动画处理变化。

各个图标则通过不同的局部标识加入同一个 namespace：

```tsx
glassEffectId('paintbrush', namespaceId)
glassEffectId('scribble', namespaceId)
glassEffectId('pencil', namespaceId)
```

新增图标同样使用该 `namespaceId`，但各自拥有不同的效果 ID。

## API 说明

### `Namespace`

```tsx
import { Namespace } from '@expo/ui/swift-ui';
```

类型：

```tsx
React.Element<NamespaceProps>
```

作用：向其子组件提供一个 SwiftUI `Namespace`。

支持平台：

- iOS
- tvOS

### `NamespaceProps`

#### `id`

```tsx
id: string
```

namespace 的 ID。文档明确说明可以使用 React 的 `useId` 生成：

```tsx
const namespaceId = React.useId();
```

#### `children`

```tsx
children: React.ReactNode
```

需要共享该 namespace 的子组件内容。

### 当前文档未涉及的 API 信息

原文没有说明以下内容：

- `id` 是否允许为空字符串；
- namespace ID 重复时的具体行为；
- `Namespace` 是否允许嵌套；
- 子组件跨越多个 `Namespace` 时如何处理；
- namespace 的销毁和底层生命周期；
- Android 或 Web 的降级行为；
- 完整的 matched geometry API 用法；
- 动画性能指标及优化方式；
- `GlassEffectContainer` 和 `glassEffectId` 的完整参数定义。

遇到这些需求时，需要查阅相应组件、modifier 或 Apple SwiftUI 文档，不能仅凭本页作出结论。

## 注意事项与限制

### 仅支持 Apple 平台

文档明确标注 `Namespace` 支持：

- iOS；
- tvOS。

文档没有列出 Android 和 Web，因此不能假设示例能够直接跨平台运行。即使项目本身是跨平台 Expo 项目，也需要为不支持的平台规划组件拆分或条件渲染。

### 本页属于下一版本文档

当前页面描述的是下一个 SDK 版本，而不是稳定版 SDK 56 页面。未发布版本的 API、类型或行为可能在正式发布前发生变化。

实际项目应以自身安装的 Expo SDK 版本对应文档为准。

### 裸 React Native 项目需要 Expo Modules 支持

已有 React Native 原生工程不能只安装 `@expo/ui` 就默认完成集成。文档明确要求这类项目先安装 `expo`。

这通常意味着原生工程需要具备 Expo Modules 的构建和链接环境，而不只是增加一个 JavaScript 依赖。

### ID 必须保持一致

`Namespace` 的 `id` 和 `glassEffectId` 接收的 namespace 参数必须来自同一个值：

```tsx
const namespaceId = useId();

<Namespace id={namespaceId}>
  <Image modifiers={[glassEffectId('paintbrush', namespaceId)]} />
</Namespace>
```

**基于文档内容推导：**如果 modifier 使用了另一个 namespace ID，SwiftUI 将无法把它识别为当前 `Namespace` 下的同一组关联效果。

### `Namespace` 不会单独创建动画

`Namespace` 提供的是协调作用域。示例仍然显式使用了：

```tsx
animation(Animation.spring(...), isGlassExpanded)
```

以及：

```tsx
glassEffectId(...)
```

因此不能把 `Namespace` 理解成“包裹后自动产生动画”的组件。具体动画和效果仍需通过状态、modifier 及对应视图结构配置。

## React Web 开发者最容易误解的地方

### 它不是 DOM 命名空间

Web 开发中的 namespace 可能让人想到 XML、SVG 或模块作用域。本页的 `Namespace` 与这些概念无关，它属于 SwiftUI 动画系统。

### `id` 不是 HTML 元素 ID

它不用于：

- CSS 选择器；
- `document.getElementById`；
- 锚点跳转；
- 测试定位。

这里的 `id` 用于把 React 侧的组件与 SwiftUI namespace 关联起来。

### `Host` 和 SwiftUI 组件不是普通 HTML 标签

`Host`、`VStack`、`HStack` 和 `Image` 最终面向原生 SwiftUI。诸如 `frame`、`padding` 和 `glassEffect` 的行为由原生布局与渲染系统决定，不能完全按照 CSS 盒模型推断。

### 条件渲染会改变原生视图树

下面的写法与 React Web 的条件渲染语法相同：

```tsx
{isGlassExpanded && <HStack>...</HStack>}
```

但实际变化发生在原生 SwiftUI 视图树中。动画是否连贯，不只取决于 JSX，还取决于 namespace、效果 ID 和 modifier 配置。

### 平台能力不是自动跨平台的

React 组件形式不代表该 API 能在所有 React Native 平台运行。平台支持必须以文档标注为准，本页仅列出 iOS 和 tvOS。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 将 `useId()` 放在组件顶层，避免手工生成每次渲染都会变化的随机 ID。
2. 为 `glassEffectId` 使用能够表达元素身份的稳定字符串，例如 `'paintbrush'`，不要使用数组下标或会随状态变化的值。
3. 将确实需要协调动画的视图放入同一个 `Namespace`，避免扩大作用域造成代码关系不清晰。
4. 在跨平台项目中，将 SwiftUI 专用界面隔离到 iOS/tvOS 文件或平台分支中。
5. 升级 Expo SDK 后，重新核对 `@expo/ui`、`Namespace` 和相关 modifier 的版本文档。
6. 优先在真实 iOS 设备或对应原生运行环境中验证动画效果。Web 浏览器无法准确代表 SwiftUI 的布局和动画行为。

## 明确结论与推导结论

### 文档明确说明

- `Namespace` 用于创建 SwiftUI namespace。
- namespace 可以协调视图间的动画和 matched geometry 效果。
- `Namespace` 来自 `@expo/ui/swift-ui`。
- 安装包为 `@expo/ui`。
- 组件支持 iOS 和 tvOS。
- `Namespace` 包含 `id` 与 `children` 两个属性。
- `id` 类型为 `string`，可以通过 React `useId` 生成。
- 裸 React Native 项目需要先安装 Expo Modules 所需的 `expo`。
- 当前页面属于下一 SDK 版本文档，稳定版本为 SDK 56。

### 基于文档内容推导

- `Namespace` 本身主要提供关联作用域，不会替代具体动画 modifier。
- 关联效果所使用的 namespace ID 应与外层 `Namespace` 的 `id` 保持一致。
- Android 和 Web 需要采用其他实现或平台分支，因为本页未声明支持这两个平台。
- 同一 namespace 中的具体效果 ID 应保持稳定且能够区分不同元素。

## 总结

`Namespace` 是 React 代码访问 SwiftUI 动画协调机制的桥梁。标准使用方式是：

1. 安装 `@expo/ui`；
2. 使用 `useId()` 创建 namespace ID；
3. 用 `<Namespace id={namespaceId}>` 包裹相关 SwiftUI 视图；
4. 将同一个 namespace ID 传给 `glassEffectId` 等相关 modifier；
5. 通过 React 状态和 `animation` modifier 驱动界面变化。

使用时最重要的是区分 React 的组件状态、SwiftUI 的 namespace 作用域以及具体元素的效果 ID，同时注意该 API 当前只声明支持 iOS 和 tvOS。

---

## 文档导航

- **上一页**：[modifiers](./97__modifiers.md)
- **下一页**：[overlay](./99__overlay.md)
