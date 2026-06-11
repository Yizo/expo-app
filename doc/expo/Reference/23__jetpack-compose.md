# Jetpack Compose：在 Expo 中构建原生 Android 界面

## 文档解决的问题

本文介绍如何通过 `@expo/ui/jetpack-compose`，在 React Native 项目中使用 Jetpack Compose 组件构建原生 Android 界面。

核心内容包括：

1. 安装 `@expo/ui`
2. 从 `@expo/ui/jetpack-compose` 导入组件
3. 使用 `Host` 承载 Jetpack Compose 视图

该能力仅面向 Android，并且已经包含在 Expo Go 中。

## 阅读前需要理解的背景知识

### React Native

React Native 允许开发者使用 React 的组件模型编写 iOS 和 Android 应用。

对于 React Web 开发者，可以将它理解为：

- React Web 最终生成 DOM 元素
- React Native 最终渲染移动端原生视图
- React Native 中通常不能使用 `div`、`button` 等 HTML 标签
- 样式、布局和平台能力也不同于浏览器环境

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 工具包。

它与 React 在思想上比较接近：开发者通过声明组件结构描述界面，而不是手动创建和更新原生视图。

不过，本文不是要求你直接编写 Kotlin 或原生 Jetpack Compose 代码，而是通过 `@expo/ui/jetpack-compose` 提供的 React Native 接口使用相应的原生 Android 组件。

### Expo 与 Expo Go

Expo 是围绕 React Native 提供的一套开发工具和原生模块体系。

Expo Go 是 Expo 提供的通用客户端，可以直接运行一部分已经内置原生模块的 Expo 项目。文档标注该功能“Included in Expo Go”，表示 `@expo/ui` 所需的相关原生能力已经包含在 Expo Go 中。

> Expo Go 中已包含原生能力，不等于项目不需要安装 JavaScript 包。代码仍然需要通过 `@expo/ui` 导入组件。

### `@expo/ui`

`@expo/ui` 是本文需要安装的包。Jetpack Compose 相关组件通过以下子路径提供：

```ts
@expo/ui/jetpack-compose
```

本文没有介绍 `@expo/ui` 的其他平台接口或组件。

## 安装

根据项目使用的包管理器执行对应命令。

### npm

```sh
npx expo install @expo/ui
```

### Yarn

```sh
yarn expo install @expo/ui
```

### pnpm

```sh
pnpm expo install @expo/ui
```

### Bun

```sh
bun expo install @expo/ui
```

### 为什么使用 `expo install`

这里使用的是 `expo install`，而不是直接执行 `npm install @expo/ui`。

`expo install` 是 Expo 提供的依赖安装方式。对于 Expo 生态中的包，它可以按照当前项目使用的 Expo SDK 选择兼容版本。

对于 React Web 开发者，可以将它理解为：这不仅是在下载 npm 包，还需要考虑 JavaScript 包与移动端原生实现之间的版本兼容关系。

### 现有 React Native 项目的额外要求

如果是在现有的 React Native 项目中安装，而不是已经配置好的 Expo 项目，文档明确要求先确保项目已经安装并配置 Expo。

这是因为 `@expo/ui` 属于 Expo 模块，普通 React Native 项目不一定已经具备运行 Expo 模块所需的基础设施。

本文没有提供安装 Expo 模块的具体步骤，只指向了“在现有 React Native 应用中安装 Expo 模块”的独立文档。

## 基本用法

文档提供了一个保存按钮示例：

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';

export function SaveButton() {
  return (
    <Host matchContents>
      <Button onClick={() => alert('Saved!')}>Save changes</Button>
    </Host>
  );
}
```

### 导入组件

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';
```

这里从 Jetpack Compose 专用入口导入了两个组件：

- `Host`：Jetpack Compose 视图的容器
- `Button`：原生 Android 按钮组件

不要将这里的 `Button` 理解为浏览器中的 `<button>`。它不是 HTML 元素，而是通过 React Native 与 Android 原生 Jetpack Compose UI 连接的组件。

### 使用 `Host` 包裹组件

```tsx
<Host matchContents>
  <Button>Save changes</Button>
</Host>
```

文档明确要求：使用 `@expo/ui/jetpack-compose` 中的组件时，需要将其包裹在 `Host` 中。

`Host` 的职责是为 Jetpack Compose 视图提供承载容器。Jetpack Compose 组件不能像普通 React Web 子元素一样，脱离对应的原生宿主环境直接渲染。

可以将其近似理解为一个原生渲染边界：

```text
React Native 组件树
└── Host
    └── Jetpack Compose 原生视图
```

这个类比只用于帮助理解，文档没有进一步描述 `Host` 的内部实现。

### `matchContents`

示例向 `Host` 传入了 `matchContents`：

```tsx
<Host matchContents>
```

从示例可以确认，`matchContents` 用于该按钮容器的布局配置。

但是，当前文档没有解释它的精确定义、默认值、尺寸计算规则或与 React Native 布局系统的关系。需要查看 `Host` 的独立 API 文档后才能确定这些细节，不应仅根据属性名称推断具体行为。

### 处理点击事件

```tsx
<Button onClick={() => alert('Saved!')}>
  Save changes
</Button>
```

按钮通过 `onClick` 接收点击处理函数。用户点击后，示例调用 `alert` 显示“Saved!”。

与 React Web 相比：

- React Web 的按钮通常也使用 `onClick`
- 此处事件来自 Android 原生 Jetpack Compose 组件
- 文档没有说明事件对象、回调参数或异步处理规则
- 文档没有说明这里的 `alert` 在不同运行环境中的具体表现

因此，当前示例只能确认 `onClick` 可以接收一个无参数回调。

## 关键流程

使用 Jetpack Compose 组件的最小流程如下：

1. 确认项目运行目标包含 Android。
2. 使用 `expo install` 安装 `@expo/ui`。
3. 如果是现有 React Native 项目，先安装并配置 Expo 模块。
4. 从 `@expo/ui/jetpack-compose` 导入 `Host` 和所需组件。
5. 使用 `Host` 包裹 Jetpack Compose 组件。
6. 通过组件属性和回调实现交互。

最小结构可以概括为：

```tsx
import { Host, SomeComponent } from '@expo/ui/jetpack-compose';

export function Example() {
  return (
    <Host>
      <SomeComponent />
    </Host>
  );
}
```

其中 `SomeComponent` 只是结构示意，不代表包中存在这个具体组件。

## 平台与适用场景

### 文档明确说明的支持范围

文档标注的平台为：

- Android
- Expo Go

因此，这一入口适合需要在 Android 端使用原生 Jetpack Compose 组件的 React Native 或 Expo 项目。

### 适合的场景

**基于文档内容推导：**

- 项目需要构建 Android 原生风格的界面
- 希望继续使用 React 和 TSX 组织界面
- 不希望为了基础界面直接编写 Kotlin Jetpack Compose 代码
- 项目已经使用 Expo，或者能够在现有 React Native 项目中接入 Expo 模块

### 当前文档未说明的场景

当前文档未涉及以下内容：

- iOS 对应组件如何实现
- Web 平台是否有回退方案
- Android 与 iOS 如何共享同一份组件代码
- 服务端渲染支持情况
- Jetpack Compose 组件的完整清单
- 主题、颜色、字体和暗色模式
- 无障碍功能
- 性能特征
- 动画
- 测试方法
- Android 原生工程配置
- Expo 项目构建与发布流程
- 不使用 Expo Go 时是否需要重新构建开发客户端

这些问题不能仅凭当前文档得出结论。

## 注意事项与限制

### 仅面向 Android

`@expo/ui/jetpack-compose` 是 Android Jetpack Compose 接口。不能因为它采用 React 组件形式，就默认同一组件可以直接在 iOS 或 Web 上运行。

**实际开发影响：**

如果项目同时支持 Android、iOS 和 Web，需要额外设计平台分支或替代组件。具体实现方式当前文档未涉及。

### `Host` 是必需的

Jetpack Compose 组件必须放在 `Host` 中。对于 React Web 开发者，这是最容易遗漏的要求。

错误思路：

```tsx
import { Button } from '@expo/ui/jetpack-compose';

export function SaveButton() {
  return <Button>Save changes</Button>;
}
```

根据文档要求，这种写法缺少 `Host`，不应作为正确用法。

### 包含在 Expo Go 不等于自动可用

即使原生能力已经包含在 Expo Go 中，项目代码仍然需要安装 `@expo/ui`，否则无法正常导入组件。

### 普通 React Native 项目需要先接入 Expo

现有 React Native 项目不能只安装 `@expo/ui` 就默认完成所有配置。文档明确要求确保 Expo 已安装到项目中。

### 当前页面只是入口说明

本文只覆盖安装和最小使用方式。`Host`、`Button` 以及其他组件的完整属性、行为和限制，需要继续查看各自的 API 文档。

## React Web 开发者最容易误解的地方

### TSX 不代表 DOM

代码看起来与 React Web 很相似，但它不会生成 HTML：

```tsx
<Button>Save changes</Button>
```

这个 `Button` 对应的是 Android 原生 Jetpack Compose 视图，而不是浏览器按钮。

因此，不应默认以下 Web 能力仍然适用：

- CSS 选择器
- DOM API
- 浏览器事件模型
- HTML 表单语义
- `className`
- 浏览器开发者工具中的元素检查方式

当前文档没有说明该组件支持哪些样式和属性，应以组件 API 文档为准。

### `Host` 不是普通布局标签

`Host` 不只是为了让 JSX 结构更整齐。它是 React Native 与 Jetpack Compose 视图之间所需的容器。

不能因为 Web 组件通常可以自由嵌套，就省略这个原生承载层。

### npm 包可能包含原生实现

Web 项目中的 npm 包通常只包含 JavaScript、TypeScript、CSS 或 WebAssembly。React Native 和 Expo 包则可能同时依赖 Android、iOS 原生代码。

这也是现有 React Native 项目需要先配置 Expo，以及依赖版本兼容性更加重要的原因。

## 实际开发建议

以下内容属于**基于经验建议**，不是当前文档明确给出的要求：

1. 将 `Host` 和平台判断封装在业务组件内部，避免业务页面到处重复处理原生容器。
2. 在跨平台项目中，为 Android、iOS 和 Web 明确设计组件替代关系。
3. 不要依据 React Web 中同名属性的行为猜测原生组件行为，应查阅对应 API 文档。
4. 升级 Expo SDK 后，使用 `expo install` 检查和安装与当前 SDK 兼容的 `@expo/ui` 版本。
5. 在真机或 Android 模拟器中验证布局、点击区域、字体缩放和系统主题，而不能只根据 TSX 结构判断最终效果。

## 信息来源边界

### 文档明确说明

- `@expo/ui/jetpack-compose` 可用于从 React Native 构建原生 Android 界面。
- 这些组件基于 Jetpack Compose。
- 功能支持 Android，并包含在 Expo Go 中。
- 使用前需要安装 `@expo/ui`。
- 现有 React Native 项目需要先安装 Expo。
- Jetpack Compose 组件需要由 `Host` 包裹。
- `Host` 是 Jetpack Compose 视图的容器。
- 示例中的 `Button` 支持通过 `onClick` 注册点击回调。

### 基于文档内容推导

- `Host` 构成 React Native 组件树与 Jetpack Compose 原生视图之间的承载边界。
- 跨平台项目需要为非 Android 平台准备其他实现。
- “Included in Expo Go”不代表可以省略 JavaScript 包安装。
- 当前页面是安装与入门入口，完整组件行为需要参考各组件的独立文档。

### 当前文档未涉及

当前文档没有提供完整 API、原生工程细节、跨平台方案、样式系统、测试方式、性能说明或生产构建流程，因此本文不对这些内容作进一步推断。

## 总结

`@expo/ui/jetpack-compose` 让 React Native 开发者能够通过 React 组件形式使用原生 Android Jetpack Compose 界面。

最关键的使用规则是：

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';

<Host matchContents>
  <Button onClick={handleClick}>Save changes</Button>
</Host>
```

对于 React Web 开发者，需要建立两个基本认知：

1. 这些组件虽然使用 TSX 编写，但渲染目标是 Android 原生界面，不是 DOM。
2. Jetpack Compose 组件必须由 `Host` 承载，不能按普通 Web 组件的方式脱离原生上下文使用。

---

## 文档导航

- **上一页**：[slider](./22__slider.md)
- **下一页**：[alertdialog](./24__alertdialog.md)
