# ModalBottomSheet：Android 原生底部弹层

> 原文档更新时间：2026 年 6 月 10 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本；稳定版本请参考 SDK 56 对应文档。

## 文档解决的问题

`ModalBottomSheet` 用于在 Android 应用中，从屏幕底部以动画方式弹出一个模态内容面板。

它适合：

- 操作菜单、筛选条件、详情预览等临时内容。
- 需要半展开或完全展开状态的底部面板。
- 需要阻止用户通过返回键、点击遮罩或滑动关闭的强制流程。
- 在 Jetpack Compose 布局中嵌入 React Native 组件。
- 在底部面板中展示可滚动的 React Native 列表。

它不是普通 React Web DOM 组件，而是 Expo UI 对 Android Jetpack Compose 官方 Bottom Sheet API 的封装。

如果需要同时支持 Android 和其他平台，原文档建议使用通用版 `BottomSheet`。通用版会根据运行平台选择合适的原生组件。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架，可以类比为 Android 原生开发中的 React：

- React 使用 JSX 描述 Web UI。
- Jetpack Compose 使用声明式组件描述 Android 原生 UI。
- `@expo/ui/jetpack-compose` 允许 React Native 代码使用部分 Compose 组件。

`ModalBottomSheet` 因此是 Android 原生 Compose 组件，而不是跨平台的 React Native `View`。

### 模态底部面板

“模态”表示面板出现后，用户通常需要先处理面板，才能继续操作其后的页面。

面板背后会显示一层 `scrim`，即半透明遮罩。用户默认可以通过以下方式关闭面板：

- 向下滑动面板。
- 按 Android 返回键。
- 点击面板外的遮罩区域。

### 展开状态

底部面板可能具有以下状态：

- 隐藏。
- 部分展开，文档描述为大约 50% 高度。
- 完全展开。

`skipPartiallyExpanded` 决定是否跳过部分展开状态。

### `Host` 与 `RNHostView`

`Host` 是承载 Jetpack Compose UI 的宿主组件。示例使用：

```tsx
<Host matchContents>{/* Compose 内容 */}</Host>
```

`matchContents` 表示宿主尺寸跟随其内容。

`RNHostView` 的作用方向相反：它在 Compose 组件树中提供一个区域，用来嵌入 React Native 组件，例如：

- `View`
- `Text`
- `Pressable`
- `FlatList`
- `ScrollView`

可以将它理解为 Compose 与 React Native 两套 UI 系统之间的容器边界。

## 安装

使用项目当前的包管理器执行相应命令：

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

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它由 Expo 选择与当前项目兼容的依赖版本。

如果是在已有的裸 React Native 项目中安装，还必须先配置 `expo`，使项目具备加载 Expo Modules 的能力。当前文档没有展开具体配置步骤。

## 基础使用流程

### 1. 控制组件是否挂载

示例使用 React 状态决定是否渲染面板：

```tsx
const [visible, setVisible] = useState(false);

{visible && (
  <ModalBottomSheet onDismissRequest={() => setVisible(false)}>
    {/* 内容 */}
  </ModalBottomSheet>
)}
```

这里的 `visible` 不是 `ModalBottomSheet` 的属性，而是应用自己维护的挂载状态。

这与 Web 中使用 `<dialog open={visible}>` 不完全相同：面板关闭后，示例直接将整个组件从 React 树中卸载。

### 2. 使用 `ref` 操作面板

```tsx
const sheetRef = useRef<ModalBottomSheetRef>(null);
```

然后通过异步方法关闭面板：

```tsx
const hideSheet = async () => {
  await sheetRef.current?.hide();
  setVisible(false);
};
```

必须先等待 `hide()` 完成，再设置 `visible` 为 `false`。

如果立即卸载组件，原生关闭动画可能来不及播放。`hide()` 返回的 Promise 会在关闭动画完成后才结束。

### 3. 响应用户关闭行为

```tsx
<ModalBottomSheet
  ref={sheetRef}
  onDismissRequest={() => setVisible(false)}
>
  {/* 内容 */}
</ModalBottomSheet>
```

当用户滑动关闭、按返回键或点击遮罩时，组件调用 `onDismissRequest`。应用仍需在回调中更新 React 状态，否则 React 层的挂载状态可能没有同步更新。

## 展开状态控制

### 跳过部分展开状态

```tsx
<ModalBottomSheet skipPartiallyExpanded>
  {/* 内容 */}
</ModalBottomSheet>
```

默认值为 `false`。启用后，面板打开时会直接进入完全展开状态，不先停留在约半屏高度的位置。

API 表格将该行为描述为“立即以全屏方式打开”，而示例正文使用“完全展开”。应将其理解为进入 Bottom Sheet 的完整展开状态；当前文档没有明确保证内容一定覆盖整个物理屏幕。

### 通过 `ref` 改变状态

`ModalBottomSheetRef` 提供三个异步方法：

| 方法 | 作用 | 限制 |
| --- | --- | --- |
| `expand()` | 以动画展开到完整高度 | 当前文档未说明其他前置条件 |
| `hide()` | 以动画隐藏面板 | Promise 在关闭动画结束后完成 |
| `partialExpand()` | 收缩到约 50% 的部分展开状态 | 仅在 `skipPartiallyExpanded={false}` 时有效 |

调用示例：

```tsx
await sheetRef.current?.expand();
await sheetRef.current?.partialExpand();
await sheetRef.current?.hide();
```

## 自定义外观

### 颜色

组件提供三个颜色属性：

```tsx
<ModalBottomSheet
  containerColor="#1a1a2e"
  contentColor="#e0e0e0"
  scrimColor="#806200EE"
>
  {/* 内容 */}
</ModalBottomSheet>
```

| 属性 | 含义 |
| --- | --- |
| `containerColor` | 面板容器的背景色 |
| `contentColor` | 面板内部内容的首选颜色 |
| `scrimColor` | 面板后方遮罩层的颜色 |

这些属性类型均为 React Native 的 `ColorValue`。

`contentColor` 是传递给内部内容的“首选颜色”，不等价于 Web CSS 中强制继承的 `color`。当前文档没有说明它对嵌入的 React Native 组件是否自动生效，因此不要假设 `RNText` 会自动使用该颜色。

### 拖动手柄

默认情况下，面板顶部显示拖动手柄：

```tsx
<ModalBottomSheet showDragHandle={false}>
  {/* 不显示默认手柄 */}
</ModalBottomSheet>
```

也可以通过专用插槽提供自定义手柄：

```tsx
<ModalBottomSheet>
  <ModalBottomSheet.DragHandle>
    {/* 自定义 Compose UI */}
  </ModalBottomSheet.DragHandle>

  {/* 面板正文 */}
</ModalBottomSheet>
```

如果提供了自定义 `ModalBottomSheet.DragHandle`，`showDragHandle` 会被忽略。

这里的“插槽”可以类比 React Web 组件中的命名子组件或专用 children 区域，并不是一个普通配置字符串。

## 布局与 Modifier

组件支持：

```tsx
modifiers?: ModifierConfig[]
```

示例通过 Modifier 设置间距、尺寸、背景和形状：

```tsx
<Column modifiers={[paddingAll(24), height(600)]}>
  {/* 内容 */}
</Column>
```

常见 Modifier 包括：

| Modifier | 作用 |
| --- | --- |
| `paddingAll(24)` | 四个方向使用相同内边距 |
| `padding(left, top, right, bottom)` | 分别设置四个方向的内边距 |
| `height(400)` | 设置固定高度 |
| `width(60)` | 设置固定宽度 |
| `fillMaxWidth()` | 占满可用宽度 |
| `fillMaxHeight()` | 占满可用高度 |
| `background(color)` | 设置背景色 |
| `clip(shape)` | 按指定形状裁剪 |

Modifier 更接近 Compose 的链式布局配置，不是 Web 的 CSS，也不是 React Native 的 `style` 对象。具体 Modifier 的完整行为不在当前文档范围内。

## 嵌入 React Native 内容

### 基本嵌入

Compose 容器内不能把普通 React Native 组件当作 Compose 组件直接混用，需要通过 `RNHostView`：

```tsx
<RNHostView>
  <View>
    <RNText>React Native Content</RNText>
    <Pressable onPress={hideSheet}>
      <RNText>Close</RNText>
    </Pressable>
  </View>
</RNHostView>
```

注意示例中的两个 `Text` 来自不同模块：

```tsx
import { Text } from '@expo/ui/jetpack-compose';
import { Text as RNText } from 'react-native';
```

- `Text` 是 Compose 组件。
- `RNText` 是 React Native 组件。
- 二者属于不同的原生 UI 层级，不能随意互换。

### 让 React Native 内容填充剩余空间

文档建议：

1. 不给 `RNHostView` 设置 `matchContents`。
2. 给父级 Compose `Column` 设置固定高度。
3. 在内部 React Native 视图上使用 `flex: 1`。

```tsx
<Column modifiers={[height(400), padding(16, 16, 16, 16)]}>
  <Text>RN View with flex: 1</Text>

  <RNHostView>
    <View style={{ flex: 1 }}>
      <RNText>React Native Content</RNText>
    </View>
  </RNHostView>
</Column>
```

父级固定高度为 React Native 的弹性布局提供了明确的可用空间。否则，`flex: 1` 可能缺少可用于扩展的尺寸约束。

当前文档没有介绍 `RNHostView.matchContents` 的完整 API，只明确说明省略它可让 React Native View 填充面板中的剩余空间。

## 可滚动 React Native 内容

底部面板自身响应纵向拖动，而 `FlatList`、`ScrollView` 等列表也响应纵向拖动，因此需要处理嵌套滚动。

文档要求在滚动组件上启用：

```tsx
<FlatList
  nestedScrollEnabled
  style={{ flex: 1 }}
  data={data}
  renderItem={renderItem}
/>
```

推荐结构如下：

```tsx
<ModalBottomSheet onDismissRequest={() => setVisible(false)}>
  <Column modifiers={[fillMaxHeight(), padding(16, 16, 16, 16)]}>
    <RNHostView>
      <FlatList nestedScrollEnabled style={{ flex: 1 }} />
    </RNHostView>
  </Column>
</ModalBottomSheet>
```

启用后的手势顺序是：

1. 列表优先滚动自己的内容。
2. 当列表到达顶部边界后，剩余的向下拖动手势交给 Bottom Sheet。
3. 用户可以继续拖动或关闭面板。

如果没有设置 `nestedScrollEnabled`，列表会消耗拖动手势，Bottom Sheet 将保持不动。

文档明确提到可以使用：

- `FlatList`
- `ScrollView`
- FlashList
- Legend List

其中后两者属于第三方高性能列表库，不包含在 `@expo/ui` 中。

## 创建只能通过代码关闭的面板

要禁止所有常见的用户关闭方式，需要同时配置手势和模态窗口属性：

```tsx
<ModalBottomSheet
  ref={sheetRef}
  onDismissRequest={() => setVisible(false)}
  sheetGesturesEnabled={false}
  properties={{
    shouldDismissOnBackPress: false,
    shouldDismissOnClickOutside: false,
  }}
>
  {/* 必须提供程序化关闭入口 */}
</ModalBottomSheet>
```

三个配置分别阻止：

| 配置 | 阻止的关闭方式 |
| --- | --- |
| `sheetGesturesEnabled={false}` | 滑动关闭 |
| `shouldDismissOnBackPress: false` | Android 返回键关闭 |
| `shouldDismissOnClickOutside: false` | 点击遮罩关闭 |

仅设置其中一项并不能创建不可由用户关闭的面板。

此时必须在面板内部提供按钮等操作入口，并调用：

```tsx
await sheetRef.current?.hide();
setVisible(false);
```

否则用户可能被困在该界面中。

## API 属性速查

```tsx
import { ModalBottomSheet } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | 必填 | 面板内容，也可包含自定义拖动手柄插槽 |
| `containerColor` | `ColorValue` | 未说明 | 面板背景色 |
| `contentColor` | `ColorValue` | 未说明 | 内部内容的首选颜色 |
| `modifiers` | `ModifierConfig[]` | 未说明 | Compose Modifier 配置 |
| `onDismissRequest` | `() => void` | 必填 | 用户请求关闭时触发 |
| `properties` | `ModalBottomSheetProperties` | 未说明 | 模态窗口行为 |
| `ref` | `Ref<ModalBottomSheetRef>` | 未说明 | 命令式控制面板状态 |
| `scrimColor` | `ColorValue` | 未说明 | 背景遮罩颜色 |
| `sheetGesturesEnabled` | `boolean` | `true` | 是否允许滑动手势 |
| `showDragHandle` | `boolean` | `true` | 是否显示默认拖动手柄 |
| `skipPartiallyExpanded` | `boolean` | `false` | 是否跳过部分展开状态 |

`properties` 支持：

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `shouldDismissOnBackPress` | `true` | 是否允许通过 Android 返回键关闭 |
| `shouldDismissOnClickOutside` | `true` | 是否允许点击遮罩关闭 |

当前文档中的全部 API 均只标注支持 Android。

## React Web 开发者容易误解的地方

### 1. 这不是跨平台组件

导入路径中明确包含：

```text
@expo/ui/jetpack-compose
```

这意味着它使用 Android Jetpack Compose。不要因为代码使用 TSX，就认为它能在 Web 或 iOS 上运行。

需要跨平台时，应评估文档提到的通用版 `BottomSheet`。

### 2. 隐藏动画和 React 卸载是两件事

`hide()` 控制原生面板的隐藏动画，`setVisible(false)` 控制 React 组件卸载。

正确顺序是：

```tsx
await sheetRef.current?.hide();
setVisible(false);
```

这类似于 Web 中先等待退出动画完成，再从 DOM 中删除节点。

### 3. `onDismissRequest` 不会替你维护状态

该回调只是通知 React：用户请求关闭面板。应用必须自行更新 `visible` 等状态。

### 4. Compose Modifier 不是 CSS

Compose 组件使用 `modifiers` 数组；React Native 组件仍使用 `style`：

```tsx
<Column modifiers={[height(400)]}>
  <RNHostView>
    <View style={{ flex: 1 }} />
  </RNHostView>
</Column>
```

同一个面板中可能同时出现两套布局配置方式。

### 5. 嵌套滚动需要显式协调

Web 浏览器通常会自动处理大量嵌套滚动行为。这里同时存在 React Native 列表手势和 Compose Bottom Sheet 手势，必须设置 `nestedScrollEnabled`。

### 6. “不可关闭”需要组合配置

禁用滑动并不代表用户不能按返回键或点击遮罩。三种关闭路径必须分别处理。

## 注意事项与限制

1. 当前组件只支持 Android，不能直接用于 iOS 或 Web。
2. 当前页面属于下一个 SDK 版本的文档，不一定与已安装的稳定 SDK 完全一致。
3. 裸 React Native 项目必须先安装并配置 Expo Modules。
4. 程序化关闭时应等待 `hide()` 动画完成后再卸载组件。
5. `partialExpand()` 仅在 `skipPartiallyExpanded={false}` 时有效。
6. 自定义拖动手柄会使 `showDragHandle` 配置失效。
7. React Native 滚动列表需要设置 `nestedScrollEnabled`，否则面板无法接收剩余拖动手势。
8. 不可关闭面板必须提供明确的程序化关闭入口。
9. 当前文档未说明无障碍、键盘避让、系统栏、横竖屏切换和尺寸变化处理方式。
10. 当前文档未提供错误处理、测试方式或 iOS 降级方案。

## 实际开发建议

以下内容为**基于文档内容推导**：

- 将 `visible` 作为面板是否挂载的唯一状态来源，并统一封装异步关闭函数，避免不同按钮采用不同的关闭顺序。
- 需要同时支持多个平台时，不应在业务组件中直接大量依赖 `@expo/ui/jetpack-compose`，否则 Android 原生实现会扩散到跨平台业务代码。
- 混合 Compose 和 React Native 内容时，应先明确尺寸由哪一层控制。文档示例采用 Compose 父容器控制高度、React Native 子视图使用 `flex: 1`。
- 滚动列表进入联调后，应重点测试“列表已到顶部时继续向下拖动”这一边界，这是列表手势移交给面板的关键路径。

以下属于**基于经验建议**：

- 对不可关闭的面板，除了提供关闭按钮，还应考虑异步操作失败时的恢复入口，避免界面无法退出。
- 应在 Android 真机或模拟器上测试返回键、快速连续点击、重复开关和拖动中断，Web 调试经验无法覆盖这些原生手势行为。
- 可以为 `hideSheet` 增加重复调用保护，防止用户连续点击关闭按钮触发并发动画。
- 自定义深色面板时，应检查文字、按钮和遮罩的对比度及可访问性。

## 文档明确内容与推导内容

### 原文档明确说明

- 组件对应 Jetpack Compose 官方 Bottom Sheet API。
- 组件只支持 Android，并包含在 Expo Go 中。
- 可以跳过部分展开状态。
- 可以自定义容器、内容和遮罩颜色。
- 可以隐藏或替换拖动手柄。
- 可以通过 `RNHostView` 嵌入 React Native 内容。
- React Native 列表需要 `nestedScrollEnabled`。
- 可以分别禁止滑动、返回键和点击遮罩关闭。
- `hide()` 的 Promise 在关闭动画完成后结束。
- `partialExpand()` 仅在未跳过部分展开状态时有效。

### 基于文档内容推导

- `visible` 负责 React 生命周期，而 `ref` 方法负责原生动画和面板状态。
- Compose 与 React Native 是两个需要通过宿主组件衔接的 UI 系统。
- 固定父容器高度可以为内部 React Native 弹性布局提供明确约束。
- 跨平台业务应优先评估通用版 `BottomSheet`，减少 Android 专属代码。

## 总结

`ModalBottomSheet` 是 Expo UI 提供的 Android Jetpack Compose 原生底部弹层。其核心使用模式是：

1. 使用 React 状态控制组件挂载。
2. 使用 `onDismissRequest`同步用户关闭行为。
3. 使用 `ref` 执行带动画的展开、部分展开和隐藏。
4. 使用 Modifier 配置 Compose 布局。
5. 通过 `RNHostView` 嵌入 React Native 内容。
6. 为滚动列表启用 `nestedScrollEnabled`。
7. 组合多个配置控制用户可以采用哪些方式关闭面板。

对 React Web 开发者而言，最关键的认知是：虽然代码写在 TSX 中，但这里同时涉及 React 状态、React Native 视图和 Android Compose 原生 UI，三者的布局、生命周期和手势职责需要分别处理。

---

## 文档导航

- **上一页**：[datetimepicker](./117__datetimepicker.md)
- **下一页**：[slider](./119__slider.md)
