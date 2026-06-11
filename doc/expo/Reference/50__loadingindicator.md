# LoadingIndicator：Jetpack Compose 加载指示器

> 本文整理自 Expo `@expo/ui` 的未发布 SDK 文档，原文修改日期为 **2026 年 5 月 19 日**。  
> 原文明确提示：这是下一版本 SDK 的文档；当前稳定版本应参考 **SDK 56** 对应页面。因此，未发布版本中的 API 在正式发布前可能发生变化。

## 文档解决的问题

`LoadingIndicator` 用于在 Android 应用中展示加载状态，例如：

- 请求数据但无法确定完成时间；
- 上传、下载等可以计算完成比例的任务；
- 按钮提交或页面初始化时提示用户任务仍在进行。

Expo UI 提供了两个与官方 Jetpack Compose Loading Indicator API 对应的 React 组件：

| 组件 | 用途 |
| --- | --- |
| `LoadingIndicator` | 展示不带背景容器的变形动画加载指示器 |
| `ContainedLoadingIndicator` | 在有颜色的背景容器中展示加载指示器 |

两者都采用 Material 3 Expressive 的形状变换动画。

## 平台和使用范围

文档标注的平台支持情况如下：

- 仅支持 Android；
- 已包含在 Expo Go 中；
- npm 包为 `@expo/ui`；
- 组件从 `@expo/ui/jetpack-compose` 导入。

这意味着它不是跨平台加载组件。虽然 React Native 代码通常同时运行于 Android 和 iOS，但这里的组件对应的是 Android 原生 Jetpack Compose UI。

> **基于文档内容推导：** 如果同一个页面还需要支持 iOS 或 Web，不能直接假设这些组件会在其他平台正常工作，需要为不同平台准备替代实现或进行平台分支处理。

## 阅读前需要理解的背景知识

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。可以将它类比为：

- React 使用组件描述 Web UI；
- Jetpack Compose 使用可组合函数描述 Android 原生 UI。

这里虽然使用 TSX 编写组件，但最终呈现的是 Jetpack Compose 原生组件，而不是浏览器 DOM 元素。

### Expo UI

`@expo/ui` 为 React Native 应用提供对原生 UI 组件的访问能力。本文组件位于：

```tsx
@expo/ui/jetpack-compose
```

路径中的 `jetpack-compose` 表明这些组件采用 Android Jetpack Compose 实现。

### `Host`

示例中的 `Host` 是承载 Jetpack Compose 内容的宿主组件：

```tsx
<Host matchContents>
  <LoadingIndicator />
</Host>
```

React Web 开发者可以将其理解为 React Native 与 Android 原生 Compose UI 之间的承载边界。Jetpack Compose 组件需要放在这个宿主环境中。

示例设置了 `matchContents`，表示宿主尺寸匹配其内部内容。

> 当前文档只展示了 `Host matchContents` 的用法，没有完整说明 `Host` 的其他属性、布局机制或嵌套限制。

### `Row`

`Row` 用于将多个原生 Compose 组件沿水平方向排列：

```tsx
<Row horizontalArrangement={{ spacedBy: 16 }}>
```

其中 `spacedBy: 16` 表示子项之间保持一定间距。它在概念上类似于 Web 中的：

```css
display: flex;
flex-direction: row;
gap: 16px;
```

但两者属于不同的布局系统，不能将 Compose 的布局值直接理解为 CSS 像素。

## 安装

根据项目使用的包管理器选择一条命令：

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

`expo install` 与普通的 `npm install` 不完全相同。它会根据当前 Expo SDK 选择兼容的依赖版本，因此在 Expo 项目中应优先使用文档给出的命令。

如果是在已有的纯 React Native 工程中安装，还必须先为工程安装 Expo Modules 所需的 `expo` 包。仅安装 `@expo/ui` 并不代表普通 React Native 原生工程已经具备 Expo 模块运行环境。

当前文档未涉及：

- iOS 原生工程配置；
- Android Gradle 配置；
- Expo 配置插件；
- 权限配置；
- 具体目录或文件修改；
- 是否需要重新生成原生工程。

## 基础用法

### 普通加载指示器

```tsx
import { Host, LoadingIndicator } from '@expo/ui/jetpack-compose';

export default function LoadingIndicatorExample() {
  return (
    <Host matchContents>
      <LoadingIndicator />
    </Host>
  );
}
```

`LoadingIndicator` 使用 Material 3 Expressive 的形状变换动画展示加载状态，本身没有带颜色的背景容器。

### 带容器的加载指示器

```tsx
import {
  Host,
  ContainedLoadingIndicator,
} from '@expo/ui/jetpack-compose';

export default function ContainedLoadingIndicatorExample() {
  return (
    <Host matchContents>
      <ContainedLoadingIndicator />
    </Host>
  );
}
```

`ContainedLoadingIndicator` 会将加载动画放在一个带颜色的容器中，适合需要更明显视觉区域或希望加载状态与周围内容区分开的场景。

## 不确定进度模式

不传递 `progress` 属性时，组件会持续播放动画，但不会表示具体完成比例：

```tsx
import {
  ContainedLoadingIndicator,
  Host,
  LoadingIndicator,
  Row,
} from '@expo/ui/jetpack-compose';

export default function IndeterminateExample() {
  return (
    <Host matchContents>
      <Row horizontalArrangement={{ spacedBy: 16 }}>
        <LoadingIndicator />
        <ContainedLoadingIndicator />
      </Row>
    </Host>
  );
}
```

这种模式称为 **Indeterminate（不确定进度）**，适合：

- 不知道任务总量；
- 后端没有提供完成比例；
- 操作时间较短，只需告知用户系统仍在工作。

关键规则是：

```tsx
<LoadingIndicator />
```

只要省略 `progress`，组件就进入持续动画模式。

## 确定进度模式

当任务具有明确进度时，需要通过 `useNativeState` 创建原生可观察状态，再将其作为 `progress` 传给组件：

```tsx
import {
  ContainedLoadingIndicator,
  Host,
  LoadingIndicator,
  Row,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { useEffect } from 'react';

export default function DeterminateExample() {
  const progress = useNativeState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      progress.value = (progress.value + 0.05) % 1;
    }, 500);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <Host matchContents>
      <Row horizontalArrangement={{ spacedBy: 16 }}>
        <LoadingIndicator progress={progress} />
        <ContainedLoadingIndicator progress={progress} />
      </Row>
    </Host>
  );
}
```

### 进度范围

文档要求将 `progress.value` 更新为 `0` 到 `1` 之间的数值：

| 数值 | 含义 |
| --- | --- |
| `0` | 0%，尚未完成 |
| `0.5` | 50% |
| `1` | 100%，全部完成 |

例如，将百分比转换为组件所需数值：

```tsx
progress.value = percent / 100;
```

文档示例每 500 毫秒增加 `0.05`，并通过取模让进度到达 `1` 后重新开始。这只是为了演示持续变化，并不代表真实业务进度应该循环。

> **基于文档内容推导：** 实际开发中应将 `progress` 与上传、下载或任务处理的真实完成比例连接，而不是使用定时器模拟。

### 为什么不能直接传普通数字

`progress` 的类型不是 `number`，而是：

```ts
ObservableState<number | null>
```

因此下面的写法不符合文档 API：

```tsx
<LoadingIndicator progress={0.5} />
```

应先创建可观察状态：

```tsx
const progress = useNativeState(0);

<LoadingIndicator progress={progress} />
```

这与 React Web 常见的受控属性有所不同。普通 React 组件可能接收一个数字，并在 state 更新后重新渲染；这里传递的是 JavaScript 与原生 UI 共享的状态对象，原生 Compose 视图可以直接观察它的变化。

## 组件 API

组件可通过以下方式导入：

```tsx
import {
  LoadingIndicator,
  ContainedLoadingIndicator,
} from '@expo/ui/jetpack-compose';
```

### `LoadingIndicator`

仅支持 Android，用变形形状展示加载状态，对应 Jetpack Compose 的 `LoadingIndicator`。

支持以下公共属性：

| 属性 | 类型 | 是否可选 | 作用 |
| --- | --- | --- | --- |
| `color` | `ColorValue` | 是 | 设置加载指示器颜色 |
| `modifiers` | `ModifierConfig[]` | 是 | 为原生 Compose 组件应用 Modifier 配置 |
| `progress` | `ObservableState<number \| null>` | 是 | 提供当前进度；省略时使用不确定进度模式 |

### `ContainedLoadingIndicator`

仅支持 Android，用容器包裹变形形状加载动画，对应 Jetpack Compose 的 `ContainedLoadingIndicator`。

除公共属性外，它还支持：

| 属性 | 类型 | 是否可选 | 作用 |
| --- | --- | --- | --- |
| `containerColor` | `ColorValue` | 是 | 设置加载指示器背景容器的颜色 |

示意用法：

```tsx
<ContainedLoadingIndicator
  color="#ffffff"
  containerColor="#6750a4"
/>
```

`ColorValue` 是 React Native 的颜色类型，不是 CSS 样式对象。当前文档没有列出其全部颜色格式，应以 React Native 的颜色文档为准。

### `modifiers`

`modifiers` 的类型为：

```ts
ModifierConfig[]
```

Compose Modifier 通常负责尺寸、间距、布局和交互等组件修饰能力。

当前文档只列出了该属性，没有说明：

- 支持哪些 Modifier；
- Modifier 的执行顺序；
- 具体配置结构；
- 如何通过 Modifier 设置尺寸或间距。

因此，仅凭本页不足以编写完整的 `modifiers` 配置，需要结合 Expo UI 的 Modifier 文档。

## `ObservableState` 详解

`ObservableState` 是 JavaScript 与原生视图共享的可观察状态。Android 端由 Jetpack Compose 使用，iOS 端则可供 SwiftUI 使用；但本页的加载指示器组件本身仍然只支持 Android。

它继承自 Expo 的 `SharedObject`，并提供以下成员。

### `value`

```ts
value: T
```

用于读取或修改当前值：

```tsx
const progress = useNativeState(0);

progress.value = 0.5;
```

线程行为需要特别注意：

- 在 UI worklet 中写入时是同步的，可以立即读到新值；
- 从 JavaScript 线程写入时，更新会异步调度到 UI 线程；
- JavaScript 写入后，在原生更新真正应用之前，不保证立即读取到新值。

这不同于 React Web 中普通 JavaScript 对象属性的同步赋值。虽然语法同样是 `.value = ...`，但它背后涉及 JavaScript 线程与原生 UI 线程之间的通信。

### `get()`

```ts
get(): T
```

读取当前值，是符合 React Compiler 要求的 `.value` 替代方案：

```tsx
const current = progress.get();
```

### `set(value)`

```ts
set(value: T): void
```

设置新值，是符合 React Compiler 要求的 `.value` 赋值替代方案：

```tsx
progress.set(0.5);
```

如果项目启用了 React Compiler，可以优先使用 `get()` 和 `set()`，避免直接读写 `.value` 带来的编译兼容问题。

### `onChange`

`onChange` 用于监听值在原生 UI 运行时中的变化：

```tsx
const state = useNativeState(0);

useEffect(() => {
  state.onChange = (value) => {
    'worklet';
    console.log('changed to', value);
  };

  return () => {
    state.onChange = null;
  };
}, [state]);
```

其行为和限制包括：

- 只能保存一个监听器；
- 再次赋值会替换已有监听器；
- 设置为 `null` 可以清除监听器；
- 初始值不会触发 `onChange`；
- 回调必须是 worklet，以便在 UI 线程同步运行；
- 应在 `useEffect` 中注册；
- 应在 cleanup 中清除，使监听器生命周期与组件保持一致。

文档原始示例展示了注册方式，但文字说明明确要求在 cleanup 中清除监听器，因此实际代码应包含：

```tsx
return () => {
  state.onChange = null;
};
```

`onChange` 不是浏览器 DOM 事件，也不是 React 组件常见的 `onChange` 属性。它是共享状态对象上的单一原生运行时监听器。

## React Web 开发者容易误解的地方

### 这不是 Web 加载动画

组件不会生成 `<div>`、SVG 或 CSS 动画，而是调用 Android Jetpack Compose 原生组件。因此：

- CSS 规则不适用；
- DOM 调试方式不适用；
- 不能因为代码使用 TSX 就认定它支持 Web；
- 不能默认 iOS 会自动获得相同实现。

### `progress` 不是 React state

下面是普通 React state：

```tsx
const [progress, setProgress] = useState(0);
```

本页 API 要求的则是：

```tsx
const progress = useNativeState(0);
```

组件需要的是共享状态对象，而不是普通数字。更新方式也是 `progress.value = ...` 或 `progress.set(...)`，不是直接将 React state 数字传给 `progress`。

### JS 线程写入不是立即生效

从 JavaScript 线程修改共享状态时，更新需要调度到原生 UI 线程。不能依赖“写入后立刻读取一定得到新值”的普通对象思维。

如果业务要求同步更新和读取，文档建议从 worklet 写入。

### `onChange` 只能有一个监听器

它不是可以通过 `addEventListener` 重复添加的事件系统。后一次赋值会覆盖前一次监听器，因此多个模块不能在没有协调的情况下各自修改同一个状态对象的 `onChange`。

### Android 支持不等于 React Native 全平台支持

本页组件明确只支持 Android。Expo Go 包含该组件，只表示可以在相应的 Android Expo Go 环境中使用，不代表 iOS Expo Go 也支持它。

## 注意事项与限制

1. **当前页面属于下一 SDK 版本文档。**  
   稳定项目应核对 SDK 56 页面，避免直接依赖尚未正式发布的 API。

2. **组件仅支持 Android。**  
   跨平台页面需要考虑 iOS 和 Web 的替代实现。

3. **确定进度必须使用 `ObservableState`。**  
   不能将普通 `number` 直接传给 `progress`。

4. **进度值应在 `0` 到 `1` 之间更新。**  
   文档没有说明超出范围后的行为，因此不应依赖自动截断或异常处理。

5. **省略 `progress` 才是不确定进度模式。**  
   不需要为了持续动画而手动创建循环进度。

6. **`onChange` 的初始值不会触发回调。**  
   如果初始化逻辑依赖当前值，需要主动读取 `value` 或调用 `get()`。

7. **监听器必须是 worklet。**  
   回调内需要包含 `'worklet';` 指令，并遵守 UI 线程执行环境的限制。

8. **监听器需要随组件卸载清理。**  
   使用 `state.onChange = null`，避免状态对象继续持有不再需要的回调。

9. **已有 React Native 工程需要先具备 Expo Modules 环境。**  
   当前文档只提供了相关安装入口，没有展开原生集成步骤。

## 实际开发中的使用方式

### 无法计算进度的请求

直接省略 `progress`：

```tsx
<Host matchContents>
  <LoadingIndicator />
</Host>
```

适合页面初始化、普通 API 请求等无法得到明确完成比例的任务。

### 可以计算进度的任务

创建共享状态，并将业务进度换算成 `0` 到 `1`：

```tsx
const progress = useNativeState(0);

function handleProgress(completed: number, total: number) {
  progress.set(total > 0 ? completed / total : 0);
}
```

```tsx
<Host matchContents>
  <ContainedLoadingIndicator progress={progress} />
</Host>
```

> **基于文档内容推导：** 在真实项目中还应确保换算结果不会因异常数据超出有效范围，例如处理 `total` 为零的问题。文档没有提供数据校验方案。

### 跨平台项目

> **基于经验建议：** 在公共页面中，可以通过 React Native 的平台判断，为 Android 使用本文组件，为其他平台提供相应加载组件。不要在没有平台边界的共享代码中假设 `@expo/ui/jetpack-compose` 组件可以跨平台渲染。

### 选择两种视觉形式

- 使用 `LoadingIndicator`：周围界面已经提供了清晰的视觉区域；
- 使用 `ContainedLoadingIndicator`：希望加载状态更加突出，或需要通过 `containerColor` 与背景形成区分。

具体颜色、尺寸和 Modifier 选择属于产品设计与主题系统范畴，当前文档未给出统一规范。

## 文档明确说明与推导内容

### 文档明确说明

- 组件来自 `@expo/ui/jetpack-compose`；
- 组件仅支持 Android，并包含在 Expo Go 中；
- API 与官方 Jetpack Compose Loading Indicator 对应；
- `LoadingIndicator` 使用变形形状展示加载状态；
- `ContainedLoadingIndicator` 在容器内展示加载状态；
- 省略 `progress` 时为不确定进度；
- 确定进度使用 `useNativeState`，值在 `0` 到 `1` 之间；
- `ObservableState` 在 JavaScript 与原生视图之间共享；
- JavaScript 线程写入会异步调度到 UI 线程；
- `onChange` 只支持一个 worklet 监听器，且初始值不会触发它；
- `get()` 和 `set()` 是兼容 React Compiler 的读写方式。

### 基于文档内容推导

- 跨平台应用需要为 iOS 或 Web 准备其他实现；
- 真实业务应使用实际任务进度，而不是复制示例中的循环定时器；
- 共享状态的线程行为会影响“写入后立即读取”的代码逻辑；
- 进度数据应在传入前进行范围和异常值处理。

## 总结

`LoadingIndicator` 和 `ContainedLoadingIndicator` 是 Expo UI 提供的 Android 原生加载组件。最基本的使用规则是：

- 放在 `Host` 中渲染；
- 不传 `progress` 表示无法确定完成比例的持续加载；
- 传入 `useNativeState` 创建的共享状态表示确定进度；
- 进度范围为 `0` 到 `1`；
- 使用时要认识到它是 Jetpack Compose 原生 UI，不是跨平台 Web 风格组件；
- 项目采用稳定 Expo SDK 时，应核对对应稳定版本文档，而不是直接依据未发布版本 API。

---

## 文档导航

- **上一页**：[listitem](./49__listitem.md)
- **下一页**：[colors](./51__colors.md)
