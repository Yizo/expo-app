# Column：跨平台垂直布局容器

> 本文对应 Expo **下一版本 SDK** 的未发布文档，原文修改日期为 **2026 年 5 月 6 日**。  
> 当前稳定版本为 **SDK 56**。实际项目应优先查阅与项目 SDK 版本对应的文档，避免使用尚未发布或 API 已发生变化的能力。

## 文档解决的问题

`Column` 是 `@expo/ui` 提供的跨平台垂直布局组件，用于将多个子元素按照**从上到下**的顺序排列。

它适合以下场景：

- 垂直排列文本、按钮、表单项等 UI 元素。
- 统一控制子元素之间的垂直间距。
- 统一设置子元素在水平方向上的对齐方式。
- 希望通过一套 React 组件代码同时支持 Android、iOS 和 Web。
- 需要使用平台原生 UI 布局能力，同时尽量减少平台分支代码。

对于 React Web 开发者，可以暂时把它理解为一个方向固定为纵向的 Flexbox 容器：

```css
display: flex;
flex-direction: column;
```

但这只是概念类比。`Column` 并不在所有平台上都直接对应 DOM 和 CSS。

## 跨平台实现原理

同一个 `Column` 会根据运行平台映射到不同实现：

| 平台 | 底层实现 |
|---|---|
| iOS | SwiftUI 的 `VStack` |
| Android | Jetpack Compose 的 `Column` |
| Web | 使用 Flex 布局的 React Native `View` |

其中：

- **SwiftUI** 是 Apple 的声明式原生 UI 框架。
- **Jetpack Compose** 是 Android 的声明式原生 UI 框架。
- **React Native `View`** 是 React Native 中的基础容器，作用近似于 Web 中的 `div`，但使用 React Native 样式系统。

这意味着 `Column` 提供的是跨平台统一接口，而不是要求三端拥有完全相同的底层组件。

**基于文档内容推导：** 使用 `Column` 可以减少开发者直接编写 SwiftUI、Jetpack Compose 和 Web Flex 布局代码的需要，但仍应关注平台支持范围以及平台专属的 `modifiers`。

## 安装

`Column` 属于 `@expo/ui` 包。根据项目使用的包管理器，选择一条命令执行：

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

这里使用的是 `expo install`，而不是直接使用包管理器的普通安装命令。

对于 React Web 开发者，可以将它理解为 Expo 项目中的依赖安装入口。它负责安装适合当前 Expo SDK 环境的依赖版本。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生工程，而不是标准 Expo 项目，必须先在项目中安装并配置 `expo`，才能使用 `@expo/ui`。

这类项目通常也称为 **bare React Native 项目**：开发者直接维护 `ios` 和 `android` 原生工程，而不是完全由 Expo 管理。

本文只提出了这一前置要求，没有展开说明：

- 如何给已有 React Native 项目安装 Expo Modules。
- iOS 和 Android 原生工程需要进行哪些具体配置。
- 安装后是否需要重新生成或编译原生工程。

## 基础用法

```tsx
import { Host, Column, Text } from '@expo/ui';

export default function ColumnExample() {
  return (
    <Host matchContents>
      <Column spacing={8}>
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </Column>
    </Host>
  );
}
```

该示例表达了三个核心关系：

1. 从 `@expo/ui` 导入 `Host`、`Column` 和 `Text`。
2. 使用 `Column` 包裹需要垂直排列的子元素。
3. 使用 `spacing={8}` 在相邻子元素之间设置垂直间距。

最终排列顺序为：

```text
First
Second
Third
```

### `Host` 在示例中的作用

示例将 `Column` 放在了 `Host` 中，并使用了 `matchContents`。

当前文档没有解释：

- `Host` 的完整职责。
- `matchContents` 的具体布局规则。
- 哪些场景必须使用 `Host`。

因此不能仅根据本文推断 `Host` 的完整行为。实际使用前需要查阅 `Host` 的独立文档。

**基于文档内容推导：** `Host` 是 `@expo/ui` 组件与宿主平台 UI 系统之间的承载容器，因为文档中的两个示例都通过它包裹 `Column`。但本文没有明确说明 `Column` 是否在所有场景下都必须直接放在 `Host` 内。

## 水平对齐

虽然 `Column` 的排列方向是垂直方向，但 `alignment` 控制的是与排列方向垂直的轴，也就是**水平方向**。

```tsx
import { Host, Column, Text } from '@expo/ui';

export default function ColumnAlignmentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8} alignment="center">
        <Text>Centered</Text>
        <Text>Centered</Text>
      </Column>
    </Host>
  );
}
```

可用值如下：

| 值 | 含义 |
|---|---|
| `'start'` | 沿水平方向的起始侧对齐，也是默认值 |
| `'center'` | 水平居中 |
| `'end'` | 沿水平方向的结束侧对齐 |

对于熟悉 CSS Flexbox 的开发者，可以将其近似理解为纵向 Flex 容器上的 `align-items`：

```css
align-items: flex-start;
align-items: center;
align-items: flex-end;
```

需要注意，文档使用的是逻辑方向 `start` 和 `end`，而不是直接写 `left` 和 `right`。

**基于文档内容推导：** 子元素的对齐效果还会受到容器可用宽度影响。如果容器宽度与内容宽度完全相同，`start`、`center` 和 `end` 之间可能看不出明显区别。本文没有进一步说明 `Column` 的宽度测量规则。

## API 引入方式

```tsx
import { Column } from '@expo/ui';
```

`Column` 是一个 React 组件，其属性类型为 `ColumnProps`，支持 Android、iOS 和 Web。

## `ColumnProps` 属性说明

### `alignment`

```ts
alignment?: 'start' | 'center' | 'end';
```

- 支持平台：Android、iOS、Web
- 默认值：`'start'`
- 作用：设置子元素在交叉轴，也就是水平方向上的对齐方式

该属性不控制上下排列顺序，也不控制垂直方向上的空间分配。

### `children`

```ts
children?: ReactNode;
```

- 支持平台：Android、iOS、Web
- 作用：指定需要在 `Column` 内渲染的内容

`children` 可以是文本组件、其他通用 UI 组件或者嵌套布局组件。本文没有规定子元素数量上限，也没有列出不能作为子元素的组件类型。

### `spacing`

```ts
spacing?: number;
```

- 支持平台：Android、iOS、Web
- 作用：设置相邻子元素之间的垂直间距
- 单位：密度无关像素

例如：

```tsx
<Column spacing={8}>
  <Text>First</Text>
  <Text>Second</Text>
</Column>
```

对于 Web 开发者，可将 `spacing` 的效果近似理解为纵向 Flexbox 的 `gap`，但本文没有说明 Web 端是否直接使用 CSS `gap` 实现。

“密度无关像素”表示布局尺寸会考虑设备像素密度，而不是简单对应屏幕上的物理像素。本文没有进一步说明三端的具体单位换算规则。

### `style`

```ts
style?: Pick<
  ViewStyle,
  | 'padding'
  | 'paddingHorizontal'
  | 'paddingVertical'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'backgroundColor'
  | 'borderRadius'
  | 'borderWidth'
  | 'borderColor'
  | 'opacity'
  | 'width'
  | 'height'
>;
```

- 支持平台：Android、iOS、Web
- 作用：设置跨平台样式
- iOS：转换为 SwiftUI modifiers
- Android：转换为 Jetpack Compose modifiers

支持的样式仅限于：

- 内边距：`padding` 及各方向变体
- 背景色：`backgroundColor`
- 圆角：`borderRadius`
- 边框：`borderWidth`、`borderColor`
- 透明度：`opacity`
- 尺寸：`width`、`height`

这与 React Web 中可以传入任意 `CSSProperties` 不同，也不是完整的 React Native `ViewStyle`。

例如，本文列出的类型中不包括：

- `margin`
- `display`
- `flex`
- `flexDirection`
- `justifyContent`
- `alignItems`
- `position`
- `overflow`

因此不能假设这些属性可以直接用于 `Column` 的 `style`。

### `disabled`

```ts
disabled?: boolean;
```

- 支持平台：Android、iOS、Web
- 作用：禁用组件
- 禁用后：组件不响应用户交互

`Column` 同时支持 `onPress`，因此它本身可以参与用户交互。设置 `disabled` 后，相关交互不会响应。

本文没有说明禁用状态是否会自动改变透明度、颜色、无障碍语义或子元素状态，不应自行假设存在这些效果。

### `hidden`

```ts
hidden?: boolean;
```

- 支持平台：Android、iOS、Web
- 作用：控制组件是否隐藏

本文没有说明隐藏后：

- 是否仍然占据布局空间。
- 子组件是否仍然保持挂载。
- 是否会触发 `onDisappear`。
- 各平台的隐藏行为是否完全一致。

如果业务依赖这些细节，需要查阅更完整的组件实现或通过测试确认。

### `onPress`

```ts
onPress?: () => void;
```

- 支持平台：Android、iOS、Web
- 触发时机：组件被按下时

它类似 React Web 中的点击处理函数，但移动端通常将这类抽象称为“按压”，因为输入可能来自触摸操作，而不只是鼠标点击。

本文没有说明：

- 键盘交互行为。
- 长按行为。
- 事件对象。
- 事件冒泡规则。
- 无障碍角色。

该回调不接收参数，不能按照 React Web 的 `MouseEvent` 处理函数使用。

### `onAppear`

```ts
onAppear?: () => void;
```

- 支持平台：Android、iOS、Web
- 触发时机：组件出现在屏幕上时

本文没有将“出现”精确定义为组件挂载、进入可视区域还是完成原生渲染，因此不应直接将它等同于 React 的 `useEffect(() => {}, [])`。

### `onDisappear`

```ts
onDisappear?: () => void;
```

- 支持平台：Android、iOS、Web
- 触发时机：组件从屏幕上移除时

同样，本文没有明确它与 React 卸载、条件渲染、页面切换或滚动离开可视区域之间的对应关系。

### `modifiers`

```ts
modifiers?: ModifierConfig[];
```

- 支持平台：Android、iOS
- Web 不支持
- 作用：作为平台专属能力的扩展入口

配置来源根据平台不同而不同：

```ts
@expo/ui/swift-ui/modifiers
```

用于 iOS 的 SwiftUI modifiers。

```ts
@expo/ui/jetpack-compose/modifiers
```

用于 Android 的 Jetpack Compose modifiers。

“escape hatch”表示：当跨平台 `style` 或通用属性不足以表达某个平台的能力时，可以通过 `modifiers` 进入平台专属配置。

使用它需要特别注意：

- 配置不是三端通用的。
- Web 平台不支持该属性。
- SwiftUI 与 Jetpack Compose 的 modifier 配置不是同一套 API。
- 本文没有列出任何具体 modifier，也没有说明平台分支的组织方式。

**基于文档内容推导：** 一旦依赖 `modifiers`，代码的跨平台一致性就会降低。应优先使用通用属性，仅在确实需要原生平台能力时使用该扩展入口。

### `testID`

```ts
testID?: string;
```

- 支持平台：Android、iOS、Web
- 作用：为组件提供端到端测试定位标识

它的用途近似于 Web 测试中的稳定选择器，但本文没有说明：

- 最终映射成什么平台属性。
- 推荐使用哪一种端到端测试框架。
- `testID` 是否必须全局唯一。

## React Web 开发者容易误解的地方

### `Column` 不是普通的 `div`

Web 端使用 Flex `View`，但 iOS 和 Android 分别使用各自的原生声明式布局组件。不能假设浏览器 DOM、CSS 选择器或 DOM 事件 API 在原生端可用。

### `alignment` 不是垂直对齐

`Column` 的主轴是垂直方向，因此 `alignment` 控制的是交叉轴，也就是水平方向。垂直排列间距由 `spacing` 控制。

### `style` 不是完整 CSS

这里只支持文档明确列出的少量跨平台属性。尤其不能将 Web 项目中的 CSS 对象未经检查直接传给 `Column`。

### 回调不提供 Web 事件对象

`onPress`、`onAppear` 和 `onDisappear` 的类型都是：

```ts
() => void
```

因此不能从参数中读取 `event.target`、鼠标坐标或者调用 `preventDefault()`。

### `modifiers` 会引入平台差异

通用 `style` 会由 Expo 转换到各平台，而 `modifiers` 本身就是平台专属入口。使用前需要理解 SwiftUI 或 Jetpack Compose 对应概念，并处理 Web 不支持的问题。

### 生命周期名称不能直接套用 React 语义

`onAppear` 和 `onDisappear` 描述的是组件出现在屏幕上和从屏幕移除，但本文没有明确其与 React 挂载和卸载的对应关系。涉及数据请求、资源释放或统计埋点时，需要先验证实际触发行为。

## 限制与注意事项

1. 本文属于下一 SDK 版本文档，不一定适用于当前稳定项目。
2. `Column` 支持 Android、iOS 和 Web，并包含在 Expo Go 中。
3. `modifiers` 仅支持 Android 和 iOS。
4. `style` 只接受类型中列出的属性，不是任意 React Native 或 CSS 样式。
5. 已有 React Native 工程必须先安装并配置 `expo`。
6. `hidden`、`onAppear` 和 `onDisappear` 的精确生命周期及布局语义，当前文档未涉及。
7. `Host` 和 `matchContents` 的完整作用，当前文档未涉及。
8. 文档没有提供复杂嵌套、响应式布局、动画、无障碍和性能方面的说明。
9. 文档没有说明 `spacing` 的默认值。
10. 文档没有说明 `disabled` 的默认视觉表现。

## 实际开发建议

以下内容属于**基于经验建议**：

- 根据项目实际使用的 Expo SDK 版本查阅对应版本文档，不要直接复制未发布版本的 API。
- 优先使用 `alignment`、`spacing` 和受支持的 `style`，保持 Android、iOS 和 Web 行为一致。
- 将 `modifiers` 限制在平台适配层中，避免平台专属配置散落在通用业务组件内。
- 不要依靠 `onAppear` 和 `onDisappear` 执行关键资源管理，除非已经通过目标平台测试确认其触发语义。
- 为 `testID` 制定稳定命名规则，避免测试依赖文本内容或组件层级。
- 同时在 Android、iOS 和 Web 上验证对齐、尺寸、边框以及隐藏行为，不能仅凭 Web 预览判断原生端结果。

## 总结

`Column` 是 `@expo/ui` 中用于纵向排列子元素的跨平台布局容器：

- 使用 `spacing` 控制子元素之间的垂直间距。
- 使用 `alignment` 控制子元素的水平对齐。
- 使用受限制的 `style` 设置通用外观和尺寸。
- 使用 `modifiers` 扩展 Android 或 iOS 的平台专属能力。
- 使用 `onPress`、`onAppear` 和 `onDisappear` 处理文档定义的交互与显示回调。
- 使用 `testID` 支持端到端测试定位。

它在 Web 上接近纵向 Flexbox，但在 iOS 和 Android 上会映射为各自的原生声明式布局组件。开发时应以 `Column` 公开的跨平台 API 为边界，不要默认 DOM、完整 CSS 或 Web 事件模型同样适用于移动端。

---

## 文档导航

- **上一页**：[collapsible](./121__collapsible.md)
- **下一页**：[fieldgroup](./123__fieldgroup.md)
