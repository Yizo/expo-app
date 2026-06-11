# ProgressView：在 Expo 中使用 SwiftUI 进度指示器

> 原文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS，并包含在 Expo Go 中

> **版本提醒：**原文是下一版本 Expo SDK 的未正式发布文档。当前稳定版本为 SDK 56。实际开发时，应以项目所使用 SDK 版本对应的文档为准。

## 文档解决的问题

`ProgressView` 用于在 Expo 应用中显示任务进度，例如：

- 数据正在加载，但无法确定完成时间。
- 文件上传已完成 50%。
- 倒计时还剩多少时间。
- 某个定时任务已经运行了多久。

这里的 `ProgressView` 来自 `@expo/ui/swift-ui`，在 React 代码中封装了苹果原生 SwiftUI 的 `ProgressView`。它与官方 SwiftUI API 保持一致，并可以通过 Expo UI 提供的 modifier 调整样式。

它不是浏览器中的 `<progress>` 元素，也不是纯 JavaScript 或 CSS 模拟的进度条，而是通过 React 组件调用 iOS 或 tvOS 原生 SwiftUI 视图。

## 适用场景与平台限制

### 适合的场景

- 在 iOS 或 tvOS 应用中展示原生风格的加载指示器。
- 展示取值范围为 `0` 到 `1` 的确定进度。
- 展示无法计算具体完成比例的加载状态。
- 展示自动变化的计时进度。
- 需要为进度指示器添加标签、颜色或 SwiftUI 样式。

### 不适用或未涉及的场景

- **Android：**当前组件 API 不支持 Android。
- **React Web：**当前文档未说明 Web 支持，不能将它作为浏览器组件使用。
- **自定义动画算法：**当前文档未涉及。
- **进度状态管理和异步任务监听：**当前文档未涉及，需要应用自行实现。
- **无障碍属性配置：**当前文档未涉及。
- **错误、暂停或重试状态：**当前文档未涉及。

## 阅读前需要理解的概念

### SwiftUI

SwiftUI 是苹果用于构建 iOS、macOS、tvOS 等平台界面的声明式 UI 框架。

对于 React Web 开发者，可以把它理解为苹果原生平台的一套声明式组件系统。SwiftUI 的 `ProgressView` 类似 React 中的一个 UI 组件，但最终渲染的是苹果原生界面，而不是 HTML DOM。

### Expo UI

Expo UI 提供可以在 React Native/Expo 代码中使用的原生 UI 组件。本组件的导入路径是：

```tsx
import { ProgressView } from '@expo/ui/swift-ui';
```

路径中的 `swift-ui` 表明这是 SwiftUI 组件，因此其平台范围和行为受到苹果系统及 SwiftUI API 的约束。

### Host

示例中的 `Host` 是承载 SwiftUI 组件的容器：

```tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';
```

对于 React Web 开发者，可以把它近似理解为 React Native 与 SwiftUI 视图树之间的宿主容器。SwiftUI 组件需要放在这个宿主环境中展示。

需要注意，`Host` 不是普通的 HTML `<div>`，其尺寸计算方式也不能完全按照浏览器布局经验理解。

### Modifier

SwiftUI 常通过 modifier 修改视图的外观和布局。Expo UI 将这种模式映射成 `modifiers` 数组：

```tsx
<ProgressView
  modifiers={[
    progressViewStyle('linear'),
    tint('red'),
  ]}
/>
```

这与 React Web 中使用 `className` 或 `style` 有一定相似性，但 modifier 是 SwiftUI 的视图修饰机制，不等同于 CSS。

## 安装

根据项目使用的包管理器执行对应命令：

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

`expo install` 会按照当前 Expo SDK 版本选择兼容的软件包版本。对于 Expo 项目，应优先使用它，而不是直接运行普通的 `npm install`。

如果是在已有的裸 React Native 项目中安装，还必须先为项目安装并配置 `expo`，使该项目能够使用 Expo Modules。文档没有展开原生工程的具体配置步骤。

## 基本用法

### 不确定进度

不传入 `value` 时，`ProgressView` 显示无法确定完成比例的旋转指示器：

```tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';

export default function IndeterminateExample() {
  return (
    <Host matchContents>
      <ProgressView />
    </Host>
  );
}
```

适合以下状态：

- 正在请求数据，但不知道何时完成。
- 正在初始化服务。
- 任务没有提供可计算的完成比例。

这里的“不确定”不是状态未知或发生错误，而是任务正在执行，但没有具体百分比。

### 确定进度

传入 `0` 到 `1` 之间的 `value`，可以显示明确的完成比例：

```tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';

export default function DeterminateExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ProgressView value={0.5} />
    </Host>
  );
}
```

常见数值对应关系：

| `value` | 含义 |
|---:|---|
| `0` | 0% |
| `0.25` | 25% |
| `0.5` | 50% |
| `1` | 100% |

`value` 接收 `number` 或 `null`，并且是可选属性。文档明确要求有效进度值位于 `0` 到 `1` 之间，但未说明超出范围时会被截断、报错还是产生其他行为，因此不应传入越界值。

## 进度样式

通过 `progressViewStyle` modifier 可以切换外观：

```tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';
import { progressViewStyle } from '@expo/ui/swift-ui/modifiers';

export default function ProgressViewStylesExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ProgressView
        value={0.5}
        modifiers={[progressViewStyle('linear')]}
      />
    </Host>
  );
}
```

可用样式包括：

| 样式 | 作用 |
|---|---|
| `automatic` | 由系统根据上下文自动选择样式 |
| `linear` | 线性进度条 |
| `circular` | 圆形进度指示器 |

对于确定进度，默认采用 `linear` 样式。

### 线性样式的宽度问题

`linear` 是弹性宽度组件，会扩展并填满可用的水平空间。

当 `Host` 使用 `matchContents` 时，宿主容器希望根据子内容计算尺寸；但线性进度条又希望根据容器的可用宽度扩展，两者之间缺少明确的宽度依据。

此时应选择以下方案之一。

为 `ProgressView` 添加明确的 `frame` 宽度：

```tsx
<ProgressView
  value={0.5}
  modifiers={[
    frame({ width: 300 }),
    progressViewStyle('linear'),
  ]}
/>
```

或者直接设置 `Host` 的尺寸：

```tsx
<Host style={{ width: 300 }}>
  <ProgressView value={0.5} />
</Host>
```

也可以让 `Host` 占据可用空间：

```tsx
<Host style={{ flex: 1 }}>
  <ProgressView value={0.5} />
</Host>
```

圆形样式和不确定状态的旋转指示器具有固定尺寸，因此可以直接配合 `matchContents` 使用。

> **React Web 开发者容易误解的地方：**这不是普通的 CSS `width: 100%` 问题，而是 React Native 宿主布局与 SwiftUI 内容尺寸之间的协调问题。`matchContents` 类似“根据内容收缩”，而线性进度条需要父容器先给出可扩展的宽度。

## 添加标签

可以将自定义组件作为 `children` 传入，为进度指示器添加说明：

```tsx
import { Host, ProgressView, Text } from '@expo/ui/swift-ui';

export default function LabelExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ProgressView value={0.25}>
        <Text>Loading...</Text>
      </ProgressView>
    </Host>
  );
}
```

`children` 的类型是 `React.ReactNode`，在这里表示描述进度用途的标签。

该标签不是单独摆放在旁边的任意 DOM 内容，而是 `ProgressView` 原生 API 的一部分，其具体布局由 SwiftUI 和当前进度样式决定。

## 修改颜色

使用 `tint` modifier 修改进度指示器的颜色：

```tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';
import { tint } from '@expo/ui/swift-ui/modifiers';

export default function TintedExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ProgressView
        value={0.7}
        modifiers={[tint('red')]}
      />
    </Host>
  );
}
```

这里应从 `@expo/ui/swift-ui/modifiers` 导入 `tint`，然后放入 `modifiers` 数组，而不是给组件传递类似 Web CSS 的 `color` 属性。

## 基于时间的自动进度

`timerInterval` 可以让进度条在指定时间范围内自动变化，适合倒计时或定时操作：

```tsx
import { Host, ProgressView, Text, VStack } from '@expo/ui/swift-ui';

export default function TimerExample() {
  const startDate = new Date();
  const endDate = new Date(Date.now() + 10000);

  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16}>
        <ProgressView
          timerInterval={{
            lower: startDate,
            upper: endDate,
          }}
        />

        <ProgressView
          timerInterval={{
            lower: startDate,
            upper: endDate,
          }}
          countsDown={false}
        >
          <Text>Counting up</Text>
        </ProgressView>
      </VStack>
    </Host>
  );
}
```

`timerInterval` 包含两个边界：

| 字段 | 含义 |
|---|---|
| `lower` | 开始时间 |
| `upper` | 结束时间 |

示例创建了从当前时间到十秒后的时间范围。

### `countsDown`

`countsDown` 决定进度视图随时间流逝时是变空还是填满：

| 值 | 行为 |
|---|---|
| `true` | 随时间流逝逐渐变空 |
| `false` | 随时间流逝逐渐填满 |

默认值是 `true`。

计时进度只支持：

- iOS 16.0 及以上版本
- tvOS 16.0 及以上版本

> **基于文档内容推导：**如果应用最低系统版本低于 iOS 16 或 tvOS 16，不能假设所有用户都可以使用计时进度。应用需要根据运行环境决定是否显示该功能或提供替代实现。文档没有给出具体的版本检测代码。

## API 参考

### 导入

```tsx
import { ProgressView } from '@expo/ui/swift-ui';
```

### `ProgressView`

渲染一个原生 SwiftUI `ProgressView`。

支持平台：

- iOS
- tvOS

### 属性

| 属性 | 类型 | 默认值 | 平台 | 作用 |
|---|---|---|---|---|
| `children` | `React.ReactNode` | 未指定 | iOS、tvOS | 提供描述进度用途的标签 |
| `value` | `number \| null` | `undefined` | iOS、tvOS | 设置 `0` 到 `1` 的当前进度；未提供时显示不确定进度 |
| `timerInterval` | `ClosedRangeDate` | 未指定 | iOS 16+、tvOS 16+ | 设置自动计时进度的开始和结束时间 |
| `countsDown` | `boolean` | `true` | iOS 16+、tvOS 16+ | 控制计时进度随时间变空还是填满 |

组件还继承 `CommonViewModifierProps`，因此可以使用 Expo UI SwiftUI 的通用 modifier 属性。当前文档没有逐项列出这些继承属性。

## 注意事项与常见坑点

### 1. 当前页面不是稳定版本文档

原文属于下一版本 SDK 的文档，而不是当前稳定 SDK 56 页面。API 在正式发布前可能发生变化。

### 2. 不支持 Android 和 Web

文档只声明支持 iOS 和 tvOS。即使项目本身是跨平台 Expo 项目，也不能据此认为该组件会自动在 Android 或 Web 上工作。

### 3. `value` 使用小数比例

`value={50}` 不表示 50%，正确写法是：

```tsx
<ProgressView value={0.5} />
```

### 4. 省略 `value` 会切换显示模式

```tsx
<ProgressView />
```

这不是 0% 进度，而是不确定进度指示器。若要表示确定的 0%，应显式传入：

```tsx
<ProgressView value={0} />
```

### 5. `linear` 与 `matchContents` 需要明确宽度

线性进度条需要可用的水平空间。`Host matchContents` 与弹性宽度组件组合时，必须为进度条或宿主容器提供明确宽度。

### 6. 计时进度存在系统版本要求

`timerInterval` 和 `countsDown` 只能用于 iOS 16+ 和 tvOS 16+。普通的 `value` 进度和不确定进度没有这一额外版本要求。

### 7. `countsDown` 只影响计时进度方向

该属性用于控制基于时间的进度是逐渐变空还是填满。文档没有说明它可以改变普通 `value` 进度的方向，因此不应将其当作通用反向进度选项。

## 实际开发中的使用方式

一个典型业务流程是由应用状态计算进度，然后传给组件：

```tsx
const progress =
  totalBytes > 0
    ? uploadedBytes / totalBytes
    : undefined;

return (
  <Host style={{ width: 300 }}>
    <ProgressView value={progress}>
      <Text>Uploading</Text>
    </ProgressView>
  </Host>
);
```

这里需要区分两种业务状态：

- 能计算进度时，传入 `0` 到 `1` 的数字。
- 不能计算进度时，不传 `value`，显示不确定指示器。

> **基于经验建议：**业务计算得到的比例最好限制在 `0` 到 `1` 之间，避免后端数据异常或浮点计算导致越界。该处理方式不是当前文档明确要求的实现。

> **基于经验建议：**跨平台项目可以在平台组件层封装 `ProgressView`，iOS/tvOS 使用 SwiftUI 版本，Android 和 Web 使用各自支持的进度组件。当前文档只描述苹果平台组件，没有提供跨平台封装方案。

## 文档明确内容与推导内容

### 文档明确说明

- `ProgressView` 对应 SwiftUI 官方 `ProgressView` API。
- 组件属于 `@expo/ui`，从 `@expo/ui/swift-ui` 导入。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 不传 `value` 时显示不确定进度指示器。
- `value` 应位于 `0` 到 `1` 之间。
- 支持 `automatic`、`linear` 和 `circular` 三种样式。
- 可以使用 `children` 添加标签。
- 可以使用 `tint` 修改颜色。
- `linear` 样式是弹性宽度组件。
- `linear` 与 `Host matchContents` 一起使用时需要明确宽度。
- `timerInterval` 可以创建自动变化的计时进度。
- `countsDown` 默认为 `true`。
- 计时进度仅支持 iOS 16+ 和 tvOS 16+。
- 裸 React Native 项目需要先安装和配置 Expo Modules。

### 基于文档内容推导

- 低于 iOS 16 或 tvOS 16 时，需要为计时进度准备兼容处理。
- 跨平台项目不能直接将该组件作为 Android 或 Web 的统一实现。
- 进度值应由业务层计算，`ProgressView` 主要负责原生展示。
- `Host` 的尺寸配置会直接影响线性进度条能否得到正确宽度。

## 总结

`ProgressView` 是 Expo UI 对苹果 SwiftUI 进度组件的 React 封装，主要有三种使用模式：

1. 不传 `value`，显示不确定进度。
2. 传入 `0` 到 `1` 的 `value`，显示确定进度。
3. 传入 `timerInterval`，显示自动变化的计时进度。

实际开发时最需要注意平台范围、系统版本以及线性进度条的宽度约束。对于 React Web 开发者，关键是不要将 `Host`、SwiftUI modifier 和原生视图布局直接等同于 DOM、CSS 与浏览器布局。

---

## 文档导航

- **上一页**：[popover](./101__popover.md)
- **下一页**：[rnhostview](./103__rnhostview.md)
