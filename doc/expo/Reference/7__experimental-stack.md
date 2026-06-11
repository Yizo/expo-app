# Expo Router Experimental Stack 学习指南

> `ExperimentalStack` 是 Expo Router 提供的 Alpha 阶段原生导航栈，仅适合测试。目前支持 iOS 和 Android，要求 **Expo SDK 56 或更高版本**，不应直接用于生产环境。

## 文档解决的问题

这篇文档介绍如何在 Expo Router 项目中试用 `ExperimentalStack`。

它是标准 `Stack` 的同级替代方案，底层使用新的 `react-native-screens/experimental` gamma stack。开发者可以将某个布局中的 `<Stack />` 替换为 `<ExperimentalStack />`，测试新的原生导航栈实现。

当前版本主要用于：

- 提前测试新的原生导航栈。
- 验证基础页面跳转和标题栏功能。
- 在 Android 上测试预测性返回手势。
- 向 Expo 团队反馈缺失功能或问题。

它目前不适合：

- 依赖复杂标题栏定制的页面。
- Modal、透明 Modal 或 Sheet 页面。
- 需要自定义转场动画或状态栏的页面。
- 稳定性要求较高的生产应用。
- Android 中必须同时使用标准 `Stack` 和 `ExperimentalStack` 的项目。

## 阅读前需要理解的背景

### Expo Router

Expo Router 是 Expo 提供的文件路由系统。它根据项目中的文件和目录生成页面路由。

这和 React Web 中常见的 React Router 有一些区别：

- React Router 通常在 JSX 中集中声明路由。
- Expo Router 主要根据文件目录组织路由。
- `_layout.tsx` 用于配置某一组路由采用什么导航方式。
- `Stack` 表示页面按栈结构进行导航。

例如，从列表页进入详情页时，详情页被压入导航栈；点击返回按钮后，详情页出栈，重新显示列表页。

### 原生导航栈

React Web 中的路由切换主要发生在浏览器和 DOM 中。React Native 没有浏览器页面，需要由 iOS 或 Android 的原生导航系统负责页面转场、返回手势和标题栏等行为。

`ExperimentalStack` 底层使用 `react-native-screens/experimental` 提供的新原生栈。

这意味着它不只是切换 React 组件，还涉及：

- iOS 和 Android 原生页面容器。
- 系统返回手势。
- 原生导航栏。
- 原生页面转场生命周期。

### Alpha API

`ExperimentalStack` 是 Alpha API，意味着：

- API 可能发生变化。
- 功能集合尚不完整。
- 行为可能不稳定。
- Expo 团队仍在收集反馈。

文档明确说明它仅供测试，尚未准备好用于生产环境。

## 核心使用方式

### 导入组件

```tsx
import { ExperimentalStack } from 'expo-router';
```

为了减少迁移时的代码改动，也可以在导入时将它重命名为 `Stack`：

```tsx
import { ExperimentalStack as Stack } from 'expo-router';
```

这里的 `as Stack` 只是 JavaScript 模块导入别名，不会把它变成标准 `Stack`。实际使用的仍然是 `ExperimentalStack`。

### 在布局中使用

```tsx
import { ExperimentalStack as Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="details" options={{ title: 'Details' }} />
    </Stack>
  );
}
```

代码含义：

- `<Stack>` 创建一个实验性导航栈。
- `screenOptions` 设置该导航栈中页面的通用选项。
- `headerShown: true` 显示原生标题栏。
- `<Stack.Screen name="index">` 配置 `index` 路由。
- `<Stack.Screen name="details">` 配置 `details` 路由。
- `options.title` 设置页面标题。

在 Expo Router 中，这段代码通常位于对应路由目录的 `_layout.tsx` 中。

### 按导航器选择性启用

文档将 `ExperimentalStack` 描述为标准 `Stack` 的 sibling，即两者是并列的导航器实现，而不是继承或嵌套关系。

原则上，可以只迁移特定布局：

```tsx
// 原来
import { Stack } from 'expo-router';

// 替换后
import { ExperimentalStack as Stack } from 'expo-router';
```

其他布局可以继续使用标准 `Stack`。

但是 Android 存在额外限制：目前标准 `Stack` 与 `ExperimentalStack` 不能在同一个应用中共存。因此，“按导航器逐步迁移”的策略当前不能完整应用于 Android。

## 当前支持的页面配置

`ExperimentalStack` 目前只支持四个 screen option。

| 配置项 | 类型 | 作用 |
| --- | --- | --- |
| `title` | `string` | 设置页面标题 |
| `headerShown` | `boolean` | 控制是否显示标题栏 |
| `headerTransparent` | `boolean` | 控制标题栏是否透明 |
| `headerBackVisible` | `boolean` | 控制标题栏中的返回按钮是否可见 |

既可以通过 `screenOptions` 设置默认值，也可以通过某个 `Stack.Screen` 的 `options` 设置页面级值：

```tsx
<Stack
  screenOptions={{
    headerShown: true,
    headerTransparent: false,
  }}
>
  <Stack.Screen
    name="details"
    options={{
      title: 'Details',
      headerBackVisible: true,
    }}
  />
</Stack>
```

对于上述四项之外的配置，当前实现会：

1. 在开发环境输出警告。
2. 丢弃配置。
3. 不产生实际效果。

因此，配置通过 TypeScript 检查或能正常传入 JSX，并不意味着运行时一定支持。

## Screen 与 Protected 的组合

文档明确说明，以下组件可以按照标准 `Stack` 的方式组合使用：

- `ExperimentalStack.Screen`
- `ExperimentalStack.Protected`

`Screen` 用于为具体路由配置导航选项。

`Protected` 在本文档中没有进一步介绍其参数、权限判断方式或完整示例。因此，当前文档只能确认它可以与 `ExperimentalStack` 组合，不能据此推断具体的鉴权实现方式。

## 返回按钮和标题组件

### `ExperimentalStack.Screen.BackButton`

该组件用于配置页面的返回按钮，可以放在布局中的 `Stack.Screen` 内，也可以直接放在页面组件中。

在布局中配置：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="detail">
        <Stack.Screen.BackButton displayMode="minimal">
          Back
        </Stack.Screen.BackButton>
      </Stack.Screen>
    </Stack>
  );
}
```

在页面组件中隐藏返回按钮：

```tsx
import { Stack } from 'expo-router';

export default function Page() {
  return (
    <>
      <Stack.Screen.BackButton hidden />
      <ScreenContent />
    </>
  );
}
```

如果同一个页面渲染了多个 `BackButton`，组件树中最后渲染的实例生效。

### 文档中的弃用提示

原文在 `ExperimentalStack.Screen.BackButton` 下明确标记：

> Deprecated: Use `Stack.Title` instead.

但按照组件名称和职责理解，标题组件与返回按钮并不是直接对应关系。本文档没有进一步解释这条弃用说明，也没有提供迁移示例。

因此，应将它视为原文当前记录的 API 提示，不宜自行推导迁移方式。实际使用前应核对对应 Expo SDK 版本的类型定义和后续文档。

### `ExperimentalStack.Screen.Title`

该组件用于页面标题，支持 Android 和 iOS。

当前文档只给出了组件名称和类型，没有提供属性表或使用示例。因此无法仅根据本文确定它支持哪些标题定制能力。

另外，文档的 `BackButton` 示例导入的是标准 `Stack`：

```tsx
import { Stack } from 'expo-router';
```

示例没有明确展示 `ExperimentalStack` 下的实际写法。不能仅凭这些示例认定所有返回按钮配置都已被实验栈完整支持。

## Android 预测性返回手势

Android 版本的 `ExperimentalStack` 支持 predictive back gesture，即预测性返回手势。

它允许用户执行系统返回手势时，提前看到即将返回的页面或应用状态，而不是等手势完成后才突然切换。

仅使用 `ExperimentalStack` 还不够，必须在 Expo 应用配置中显式启用：

```json
{
  "expo": {
    "android": {
      "predictiveBackGestureEnabled": true
    }
  }
}
```

配置项作用：

| 配置路径 | 值 | 作用 |
| --- | --- | --- |
| `android.predictiveBackGestureEnabled` | `true` | 为 Android 应用启用预测性返回手势 |

它属于应用级原生配置，不是某个 React 组件的 prop。

对于 React Web 开发者，可以将其理解为构建配置，而不是运行时页面状态。修改后通常需要重新生成或构建原生应用，文档本身没有给出具体重建命令。

## 平台行为

### iOS 和 Android

`ExperimentalStack` 的原生实现支持：

- Android
- iOS

文档 API 表中的组件和类型也都标记为支持这两个平台。

### Web

`ExperimentalStack` 是 native-only，即实验实现本身只运行在原生平台。

在 Web 上，它会自动回退为 Expo Router 的标准 `Stack`：

```tsx
<ExperimentalStack />
```

因此，同一个布局可以跨平台运行，不需要编写条件分支：

```tsx
// 不需要自行判断 Platform.OS
return <ExperimentalStack />;
```

但需要注意：

- Web 上使用的是标准 `Stack`，不是实验性原生栈。
- 原生专属配置不会在 Web 上生效。
- Web 测试无法验证 Android 或 iOS 的真实导航行为。
- Web 正常运行不能证明实验栈在原生平台也正常。

## 已知限制

### 仅支持四个 screen option

以下常见配置目前均不生效：

- `headerLeft`
- `headerRight`
- `headerTitle`
- `headerStyle`
- `headerTintColor`
- 自定义动画配置
- 状态栏配置

开发环境会输出警告，并忽略这些配置。

需要上述能力的页面应继续使用标准 `Stack`，但还要同时考虑 Android 不能混用两种 Stack 的限制。

### 不支持 Modal 展示模式

目前不支持：

```tsx
options={{ presentation: 'modal' }}
```

也不支持：

```tsx
options={{ presentation: 'transparentModal' }}
```

所有页面都会按普通栈页面的方式压入导航栈。

对 React Web 开发者来说，这意味着不能把 `presentation` 简单理解成 CSS 展示样式。它控制的是原生页面的导航呈现方式。

### 不支持 Sheet

目前不支持：

- `formSheet`
- Sheet 尺寸配置
- Detent 配置

Detent 可以理解为原生底部面板允许停留的高度档位，例如半屏或全屏。本文档未列出相关配置的完整名称。

### 不支持自定义 Header

目前不能：

- 提供自定义 Header 组件。
- 自定义 Header 颜色。
- 自定义 Header 样式。
- 自定义 Header tint。

目前只有前述四个 Header 相关 option 生效。

### 不支持动画和状态栏定制

以下页面级动画配置不会生效：

- `animation`
- `animationDuration`

页面级状态栏选项同样不会生效。

如果应用依赖品牌化转场效果、特殊状态栏颜色或明暗模式切换，当前实验栈无法满足这些要求。

### Android 不能混用两种 Stack

在 Android 上，标准 `Stack` 和 `ExperimentalStack` 不能存在于同一个应用中。

这与文档前面描述的“按导航器选择性启用”存在平台层面的约束：

- iOS 可以按导航器进行试用或迁移。
- Android 当前必须为原生 Stack 统一选择一种类型。
- 跨平台应用需要按照 Android 的限制设计迁移方案。

Expo 团队希望未来解除这一限制，但文档没有提供明确时间表。

## 安装要求

`ExperimentalStack` 随 `expo-router` 一起提供，不需要安装独立的实验栈包。

如果项目已经正确安装 Expo Router，可以直接导入：

```tsx
import { ExperimentalStack } from 'expo-router';
```

如果项目尚未安装 Expo Router，需要先按照 Expo Router 安装指南进行配置。

当前文档没有列出具体安装命令，也没有说明：

- 如何新建 Expo Router 项目。
- 如何向现有 React Native 项目添加 Expo Router。
- Babel、入口文件或原生工程需要哪些配置。

这些内容需要查阅单独的 Expo Router 安装文档。

## 导航事件和类型

### 导航事件

`ExperimentalStackNavigationEventMap` 定义了当前实验栈能够发出的导航器级事件。

| 事件 | 数据 | 含义 |
| --- | --- | --- |
| `gestureCancel` | `undefined` | 用户取消了导航手势 |
| `transitionStart` | `{ closing: boolean }` | 页面转场开始 |
| `transitionEnd` | `{ closing: boolean }` | 页面转场结束 |

`closing` 用于表示当前转场是否正在关闭页面：

- `true`：通常表示页面正在退出或返回。
- `false`：通常表示页面正在进入。

以上事件只是原生栈事件的一部分。文档明确说明，它们对应 gamma `Stack.Screen` 生命周期回调目前能够驱动的子集。

### 组件属性

`ExperimentalStack.Screen.Title` 的 API 部分列出了：

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `navigation` | `ExperimentalStackNavigationProp` | 当前导航器的操作对象 |
| `route` | `RouteProp` | 当前页面对应的路由信息 |

原文类型定义较复杂，主要服务于 TypeScript 类型检查。对于初次接触 React Native 的开发者，关键是理解：

- `navigation` 用于执行导航操作。
- `route` 表示当前页面及其路由参数。
- 实验栈的 navigation 类型包含栈操作能力、页面配置类型和导航事件类型。

本文档没有给出通过 `navigation` 跳转、返回或传递参数的具体代码示例。

## React Web 开发者最容易误解的地方

### `Stack` 不是普通的 React 组件容器

虽然语法类似：

```tsx
<Stack>
  <Stack.Screen />
</Stack>
```

但它不只是负责 JSX 排版。它还会建立原生导航器，管理页面历史、原生转场、系统手势和标题栏。

### Web 回退不等于跨平台行为相同

同一份 JSX 可以在 Web、iOS 和 Android 上运行，但底层实现不同：

- Web：标准 Expo Router `Stack`。
- iOS、Android：实验性原生 Stack。

因此必须在真实原生环境或对应模拟器中测试。

### 不支持的配置不是“部分生效”

实验栈会直接丢弃不支持的 option。即使配置对象语法正确，也不会产生效果。

遇到标题栏样式或动画没有变化时，应先检查该配置是否属于当前支持的四项，而不是优先排查 CSS 或 React 状态。

### `headerTransparent` 不等同于 Web 的透明背景

原生 Header 透明后，页面内容与系统导航栏之间可能发生视觉重叠。它不是简单给某个 DOM 元素设置：

```css
background: transparent;
```

当前文档没有介绍透明 Header 下如何处理内容安全区域，因此不能从本文推断具体布局方案。

### Android 的迁移限制是应用级限制

不能认为只要两个 Stack 位于不同 `_layout.tsx` 文件中，就可以安全共存。文档明确说明，在 Android 上二者不能存在于同一个应用中。

## 实际开发中的使用策略

以下内容为**基于文档内容推导**。

### 先筛选适合测试的导航器

适合试用实验栈的页面组应当只依赖：

- 普通 push 和返回。
- 基础标题。
- Header 显示或隐藏。
- Header 透明。
- 返回按钮显示或隐藏。

如果导航器依赖 Modal、Sheet、自定义 Header、动画或状态栏配置，则不适合作为当前测试目标。

### 将平台差异纳入测试范围

至少应分别验证：

- iOS 页面进入和返回。
- Android 页面进入和返回。
- Android 预测性返回手势。
- Web 回退到标准 `Stack` 后的行为。
- 开发控制台中是否出现 option 被忽略的警告。

不要只在 Web 浏览器中完成验证。

### Android 迁移前检查全项目

由于 Android 不允许两种 Stack 共存，迁移前应检查所有路由布局使用的是哪一种 Stack。

这是应用级决策，而不是只修改当前 `_layout.tsx` 就能完成的局部决策。

### 不要依赖 Alpha API 的稳定性

**基于经验建议：**

- 将试验性改动放在独立分支中。
- 记录当前 Expo SDK 和 `expo-router` 版本。
- 升级 Expo SDK 后重新检查 API 和限制。
- 不要围绕实验 API 建立大量难以替换的封装。
- 发现明确问题时，通过 Expo Discord、GitHub Issue 或文档反馈入口提交反馈。

## 文档明确内容与推导内容

### 文档明确说明

- `ExperimentalStack` 从 Expo SDK 56 开始提供。
- 它是 Alpha API，仅供测试。
- 它基于 `react-native-screens/experimental` gamma stack。
- 它与标准 `Stack` 是同级导航器。
- 当前只支持四个 screen option。
- 不支持 Modal、Sheet、自定义 Header、动画和状态栏定制。
- Android 支持预测性返回手势，但需要显式启用配置。
- Android 不能混用标准 `Stack` 和 `ExperimentalStack`。
- Web 会回退到标准 `Stack`。
- `Screen` 和 `Protected` 可以按照标准 `Stack` 的方式组合。
- 不支持的 option 会在开发环境警告并被丢弃。

### 基于文档内容推导

- 只依赖基础 Header 和普通 push 导航的页面最适合作为测试对象。
- Web 测试不能代替 iOS 和 Android 原生测试。
- Android 上启用实验栈前，应检查整个应用中的 Stack 使用情况。
- 跨平台项目的迁移方案需要优先满足 Android 的共存限制。
- 依赖高级导航表现的生产页面暂时不适合迁移。

## 总结

`ExperimentalStack` 是 Expo Router 下一代原生导航栈的早期测试入口。它允许开发者以接近标准 `Stack` 的写法体验新的底层实现，但当前功能范围非常有限。

现阶段最重要的判断标准不是“能否替换组件名称”，而是目标导航器是否只需要基础页面入栈、返回和简单 Header 配置。同时必须关注 Android 无法混用两种 Stack、Web 使用标准 Stack 回退实现，以及 Alpha API 随时可能变化这三项限制。

---

## 文档导航

- **上一页**：[color](./6__color.md)
- **下一页**：[link](./8__link.md)
