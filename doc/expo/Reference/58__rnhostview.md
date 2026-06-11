# RNHostView：在 Jetpack Compose 中嵌入 React Native 视图

> 原文档更新时间：2026 年 4 月 29 日  
> 所属包：`@expo/ui`  
> 支持平台：Android  
> Expo Go：已包含  
> 文档版本：下一版本 Expo SDK 的未发布文档；当前稳定版本为 SDK 56

## 文档解决的问题

`RNHostView` 用于在 Expo 的 Jetpack Compose 组件中嵌入 React Native 视图，并协调两套布局系统之间的尺寸信息。

典型场景是：

- 外层使用 `@expo/ui/jetpack-compose` 提供的 `Card`、`Row`、`Column` 或 `ModalBottomSheet`。
- 内层需要放入 React Native 的 `View`、`Pressable`、`Text` 等组件。
- Compose 容器和 React Native 内容需要正确确定彼此的尺寸。

如果没有正确同步尺寸，Compose 父组件可能不知道 React Native 子内容有多大，React Native 内容也可能无法获得 Compose 分配的可用空间。

`RNHostView` 通过更新 React Native **shadow node** 的尺寸，在 Jetpack Compose 与 React Native 的 Yoga 布局系统之间传递布局信息。

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。可以将它类比为 Android 原生 UI 领域中的 React：

- 通过组件组合界面。
- 根据状态重新生成 UI。
- 使用布局组件和 modifier 控制尺寸、间距及排列方式。

本文中的 `Card`、`Row`、`Column`、`ModalBottomSheet` 都是 Compose 侧的 UI 组件，不是 React Native 的同名组件。

### React Native 与 Yoga

React Native 使用 Yoga 进行布局计算。Yoga 支持类似 Web Flexbox 的布局模型，但它不是浏览器 CSS 布局引擎。

React Native 会维护用于布局计算的 shadow node。它不是直接显示在屏幕上的原生 View，而是 React Native 用来计算组件尺寸和位置的数据节点。

### 为什么需要布局桥接

在纯 React Web 中，父子元素通常都由浏览器布局引擎统一计算。这里则同时存在：

1. Jetpack Compose 的布局系统。
2. React Native 的 Yoga 布局系统。

当 Compose 组件包含 React Native 组件时，两边不会天然共享完整的尺寸计算结果。`RNHostView` 的职责就是在这个边界上同步尺寸。

## 核心机制：`matchContents`

`matchContents` 决定尺寸由哪一侧主导。

| 使用方式 | 尺寸来源 | 适用情况 |
| --- | --- | --- |
| `<RNHostView matchContents>` | React Native 子内容的固有尺寸 | 希望 Compose 父组件根据 RN 内容调整大小 |
| `<RNHostView>` | Compose 父组件分配的尺寸 | 希望 RN 内容填满 Compose 提供的空间，例如使用 `flex: 1` |

这里的“固有尺寸”可以理解为 React Native 子组件根据自身明确尺寸和内容计算出的大小。

### 使用 `matchContents`

启用后，`RNHostView` 会把 React Native 子内容的尺寸同步给 Compose 视图树。因此，Compose 父组件可以根据 React Native 内容决定自身大小。

适合：

- 明确设置了 `width` 和 `height` 的按钮。
- 根据文字或内部内容自然撑开的 RN 组件。
- 底部弹窗需要根据 RN 内容高度自动调整的场景。

### 不使用 `matchContents`

默认值为 `false`。此时，React Native shadow node 使用 Compose 父视图的尺寸，RN 内容可以在这块空间中布局。

适合：

- React Native 子组件使用 `flex: 1`。
- Compose 父容器已经通过 modifier 确定了尺寸。
- RN 内容需要占满剩余空间。

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

`expo install` 不只是普通的包安装命令。它会尽量选择与当前 Expo SDK 兼容的依赖版本，因此不应随意替换成直接安装最新版的 `npm install @expo/ui`。

如果是在现有的 React Native 原生项目中使用，而项目原本不是 Expo 项目，需要先按照 Expo 文档安装 `expo` 和 Expo Modules 基础设施。

当前文档没有涉及：

- iOS 安装或配置。
- Android 原生工程的手动配置步骤。
- `@expo/ui` 是否需要重新构建 Development Build。
- 各 Expo SDK 对应的具体 `@expo/ui` 版本号。

## 基本用法：让 Compose 适应 RN 内容

```tsx
<RNHostView matchContents>
  <Pressable
    style={{
      height: 50,
      width: 50,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#9B59B6',
    }}
  >
    <RNText style={{ color: 'white', fontSize: 24 }}>+</RNText>
  </Pressable>
</RNHostView>
```

这里的 `Pressable` 明确设置为 `50 × 50`。启用 `matchContents` 后：

1. React Native 计算出 `Pressable` 的尺寸。
2. `RNHostView` 将该尺寸同步给 Compose。
3. 外层 Compose `Row` 可以按照这个尺寸排列按钮。

完整示例还说明，React Native 组件和 Compose 组件可以在同一个 Compose `Row` 中混合排列：

- 两侧按钮使用 React Native `Pressable`。
- 中间计数文本使用 Compose `Text`。
- React 的 `useState` 仍然负责交互状态。

这意味着嵌入的 React Native 组件仍可使用 React 事件和状态更新，并非只能显示静态内容。

## 弹性内容：让 RN 填满 Compose 空间

当 React Native 内容使用 `flex: 1` 时，应省略 `matchContents`：

```tsx
<Row
  horizontalArrangement={{ spacedBy: 20 }}
  modifiers={[size(100, 100)]}
>
  <RNHostView>
    <View
      style={{
        flex: 1,
        backgroundColor: '#9B59B6',
        borderRadius: 10,
      }}
    />
  </RNHostView>
</Row>
```

该布局的尺寸传递方向是：

1. Compose 的 `Row` 通过 `size(100, 100)` 获得确定尺寸。
2. `RNHostView` 使用 Compose 父视图提供的尺寸。
3. React Native `View` 通过 `flex: 1` 填满该空间。

如果此时启用 `matchContents`，就会产生概念上的循环依赖：

- RN 子组件希望通过 `flex: 1` 获取父组件尺寸。
- Compose 父组件又希望根据 RN 子组件尺寸确定自身大小。

原文没有明确描述这种组合的具体错误表现，但从文档给出的两种模式可以推导出：依赖父空间的 `flex: 1` 内容不应使用 `matchContents`。

## 在 `ModalBottomSheet` 中使用

`ModalBottomSheet` 是从屏幕底部弹出的 Compose 模态面板。文档展示了两种尺寸策略。

### 根据 RN 内容调整弹窗内容尺寸

```tsx
<RNHostView matchContents>
  <View>
    <RNText>React Native Content</RNText>
    <Pressable onPress={hideSheet}>
      <RNText>Close</RNText>
    </Pressable>
  </View>
</RNHostView>
```

这里使用 `matchContents`，因为内部 React Native 内容有自己的自然高度，Compose `Column` 和底部弹窗需要获知该高度。

示例中的关闭流程是：

```tsx
const hideSheet = async () => {
  await sheetRef.current?.hide();
  setVisible(false);
};
```

它先等待底部弹窗完成隐藏操作，再将 `visible` 设为 `false`，从 React 树中卸载弹窗。

`onDismissRequest={() => setVisible(false)}` 则处理用户通过弹窗自身的关闭方式触发的卸载。

### 让 RN 内容填满固定高度

```tsx
<Column modifiers={[height(400), padding(16, 16, 16, 16)]}>
  <RNHostView>
    <View style={{ flex: 1 }}>
      <RNText>React Native Content (flex: 1)</RNText>
    </View>
  </RNHostView>
</Column>
```

这里由 Compose `Column` 的 `height(400)` 决定弹窗内容区域高度。`RNHostView` 不设置 `matchContents`，内部 RN `View` 使用 `flex: 1` 填充可用空间。

示例还为 `ModalBottomSheet` 设置了：

```tsx
skipPartiallyExpanded
```

从命名及示例可知，它用于跳过部分展开状态。不过当前文档没有进一步定义该属性的完整行为；需要查阅 `ModalBottomSheet` 自身的 API 文档。

## API 说明

### 导入

```tsx
import { RNHostView } from '@expo/ui/jetpack-compose';
```

不要从 `react-native` 或 `@expo/ui` 包根路径导入。

### `children`

```ts
children: ReactElement
```

表示由 `RNHostView` 承载的 React Native 视图。

文档使用的是单数 `ReactElement`，不是任意数量的 `ReactNode`。因此需要把多个 RN 子组件包在一个根组件中：

```tsx
<RNHostView matchContents>
  <View>
    <RNText>标题</RNText>
    <Pressable>{/* ... */}</Pressable>
  </View>
</RNHostView>
```

不要直接假设它支持多个并列根节点。当前文档也没有说明是否支持 Fragment、字符串或条件表达式等其他 children 类型。

### `matchContents`

```ts
matchContents?: boolean
```

默认值：

```ts
false
```

行为：

- `true`：Compose 中的 RNHost 尺寸跟随 React Native 子组件尺寸。
- `false`：RNHost 使用 Compose 父视图的尺寸。

最重要的限制是：

> `matchContents` 只能在组件挂载时设置一次。

这意味着不应在同一个 `RNHostView` 实例上动态切换该属性：

```tsx
// 不应依赖这种动态切换
<RNHostView matchContents={isCompact}>
  <View />
</RNHostView>
```

如果业务确实需要切换尺寸策略，当前文档没有给出官方实现方式。

**基于文档内容推导：**可以通过条件渲染不同实例，确保切换时重新挂载，但这可能导致内部 RN 状态丢失，因此需要自行验证：

```tsx
{isCompact ? (
  <RNHostView key="content-sized" matchContents>
    <Content />
  </RNHostView>
) : (
  <RNHostView key="parent-sized">
    <Content />
  </RNHostView>
)}
```

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

用于向 `RNHostView` 应用 Jetpack Compose modifier。

React Web 开发者可以暂时把 modifier 理解为 Compose 侧的样式和布局操作序列，例如：

```tsx
modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}
```

需要注意：

- `modifiers` 控制 Compose 侧组件。
- React Native 的 `style` 控制 RN 子视图。
- 两者属于不同布局系统，不能互相替代。

当前文档没有单独展示在 `RNHostView` 上配置 modifier 的完整示例，也没有列出其支持的全部 modifier。

### 继承属性

`RNHostView` 继承：

```ts
PrimitiveBaseProps
```

当前文档没有展开 `PrimitiveBaseProps` 的具体字段，因此无法仅根据本文确定所有继承属性。

## 容易踩坑的地方

### 仅支持 Android

API 中明确标记 `RNHostView` 只支持 Android。Jetpack Compose 本身也是 Android UI 技术。

不能据此假设相同代码可在 iOS 上运行。本文没有提供 iOS 对应组件或跨平台降级方案。

### 未发布文档与稳定版本文档不同

本文来自 `unversioned` 路径，对应下一版本 Expo SDK，而不是当前稳定版。页面明确指出当前稳定版本是 SDK 56。

实际开发时应以项目使用的 Expo SDK 对应文档为准，避免直接采用未发布版本 API。

### `matchContents` 不是类似 CSS 的“自动宽高”

它决定的是 Compose 与 React Native 之间的尺寸同步方向，不只是一个视觉样式开关。

判断原则是：

- RN 内容能够先算出自己的尺寸：使用 `matchContents`。
- RN 内容依赖父级提供尺寸：不使用 `matchContents`。

### `flex: 1` 不等同于 Web 的 `height: 100%`

React Native 的 `flex: 1` 需要父级提供可分配空间。如果 Compose 父容器没有明确或可推导的尺寸，RN 内容不一定能得到预期空间。

文档示例通过 `size(100, 100)` 或 `height(400)` 给 Compose 父容器建立了明确的尺寸约束。

### Compose `Text` 与 React Native `Text` 不是同一组件

示例使用别名区分两者：

```tsx
import { Text as RNText } from 'react-native';
import { Text } from '@expo/ui/jetpack-compose';
```

两者分别由 React Native 和 Compose 渲染，支持的属性、样式系统以及所在的布局树都不同。

### `Host matchContents` 与 `RNHostView matchContents` 是两个层级

示例同时出现：

```tsx
<Host matchContents>
```

以及：

```tsx
<RNHostView matchContents>
```

它们不是同一个组件上的同一个配置：

- `Host` 是 Compose 内容进入 React Native 页面时的外层宿主。
- `RNHostView` 是 Compose 内容内部再次承载 RN 视图的桥接组件。

当前文档只详细定义了 `RNHostView` 的 `matchContents`，没有解释 `Host` 对应属性的完整语义。不要仅凭同名属性假设两者实现完全相同。

## 实际开发中的选择方法

可以按以下顺序决定是否使用 `matchContents`：

1. 先确定哪一侧拥有明确尺寸。
2. 如果 RN 子内容拥有明确尺寸或能自然测量，使用 `matchContents`。
3. 如果 Compose 父容器拥有明确尺寸，省略 `matchContents`。
4. RN 内容需要填充空间时，在 RN 根视图上使用 `flex: 1`。
5. Compose 内容需要固定空间时，通过 `size`、`height` 等 modifier 提供约束。

常见映射如下：

| 需求 | 推荐方式 |
| --- | --- |
| 在 Compose `Row` 中放一个固定大小的 RN 按钮 | `RNHostView matchContents` |
| RN 卡片根据文字和按钮自然撑开 | `RNHostView matchContents` |
| RN 画布填满 Compose 提供的区域 | 不设置 `matchContents`，RN 根节点使用 `flex: 1` |
| 底部弹窗根据 RN 内容决定高度 | `RNHostView matchContents` |
| 固定高度底部弹窗中的 RN 内容占满剩余区域 | Compose 设置 `height`，`RNHostView` 不设置 `matchContents` |

## 文档明确说明与合理推导

### 文档明确说明

- `RNHostView` 用于在 Jetpack Compose 中承载 React Native 视图。
- 它通过更新 shadow node 尺寸同步 Compose 与 Yoga 的布局信息。
- `matchContents` 默认值为 `false`。
- 启用后，Compose 侧尺寸匹配 RN 子内容尺寸。
- 不启用时，RNHost 使用 Compose 父视图尺寸。
- `flex: 1` 内容应省略 `matchContents`。
- `matchContents` 只能在挂载时设置一次。
- 组件只支持 Android。
- 组件接收一个 `ReactElement` 类型的 `children`。
- 组件支持 `ModifierConfig[]` 类型的 `modifiers`。
- 它可以在 `Card`、`Row`、`Column` 和 `ModalBottomSheet` 等 Compose 组件中使用。

### 基于文档内容推导

- `matchContents` 与 `flex: 1` 的不当组合可能形成父子尺寸相互依赖。
- 动态改变尺寸策略时可能需要重新挂载 `RNHostView`。
- 重新挂载可能导致子树内部状态丢失。
- 在不使用 `matchContents` 时，Compose 父级应具备明确或可推导的尺寸约束。
- 由于仅支持 Android，跨平台业务需要在应用架构中单独处理 iOS 分支。

以上推导用于解释文档所述机制的开发影响，并非本文明确承诺的 API 行为。

## 当前文档未涉及

本文没有说明以下内容：

- iOS 替代方案。
- Web 平台支持。
- 多个 React Native 根子节点的处理方式。
- 动态切换 `matchContents` 后的具体错误或警告。
- 嵌套多个 `RNHostView` 的行为。
- 性能成本及推荐的最大嵌套数量。
- 无障碍、焦点、键盘和手势事件如何跨布局系统传递。
- RN 内容尺寸发生动态变化时的更新时机。
- `PrimitiveBaseProps` 的完整定义。
- 测试 `RNHostView` 的推荐方法。
- `ModalBottomSheet` 其他属性的完整含义。

## 总结

`RNHostView` 的核心不是“显示一个 React Native 组件”，而是解决 React Native Yoga 与 Jetpack Compose 两套布局系统之间的尺寸协调问题。

使用时只需抓住尺寸主导方：

- 内容决定容器大小：使用 `matchContents`。
- 容器决定内容空间：省略 `matchContents`，必要时让 RN 子组件使用 `flex: 1`。

同时需要牢记，它只支持 Android，且 `matchContents` 只能在组件挂载时确定，不能作为普通响应式属性随状态动态切换。

---

## 文档导航

- **上一页**：[radiobutton](./57__radiobutton.md)
- **下一页**：[row](./59__row.md)
