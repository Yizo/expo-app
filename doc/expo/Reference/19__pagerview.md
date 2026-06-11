# PagerView：Expo UI 横向分页视图

`PagerView` 是 `@expo/ui` 提供的横向分页组件，API 与 `react-native-pager-view` 兼容。它适合实现引导页、图片轮播、分步骤表单等“一次显示一页、通过横向滑动切换”的移动端界面。

> 该组件仅支持 Android 和 iOS，不支持 Web。

## 文档解决的问题

本文主要说明：

- 如何安装和使用 `PagerView`
- 如何通过滑动或代码切换页面
- 如何从 `react-native-pager-view` 迁移
- Android 与 iOS 的功能差异
- 不同 iOS 版本的兼容限制
- `react-native-worklets` 对动画和滚动回调的影响
- 组件 Props、事件和 Ref 方法的具体含义

## 阅读前需要理解的背景知识

### Expo 与 `@expo/ui`

Expo 是构建 React Native 应用的一套工具和运行环境。`@expo/ui` 提供了对原生 UI 能力的 React 封装。

`PagerView` 在两个平台上使用不同的原生实现：

- Android：Jetpack Compose 的 `HorizontalPager`
- iOS：支持分页的 SwiftUI `ScrollView`

对于 React Web 开发者，可以把它理解为：

- React 组件负责声明页面结构和监听事件。
- 真正的滚动、分页吸附和动画由 Android、iOS 的原生 UI 系统执行。
- 两个平台底层实现不同，因此支持的功能和最低系统版本并不完全一致。

### Page 与 Child 的关系

`PagerView` 的每个直接子元素都会成为一个独立页面，并自动拉伸以填满分页容器。

这不同于普通 Web 横向滚动容器：不需要手动设置 `scroll-snap-type` 或计算页面宽度，分页行为由原生组件负责。

每个页面都应具有稳定的 React `key`，以便 React 正确识别页面。

### Ref 与命令式操作

除了用户手势，组件还允许通过 Ref 主动切换页面：

```tsx
const pagerRef = useRef<PagerViewRef>(null);

pagerRef.current?.setPage(1);
```

这类似于在 React Web 中获取 DOM Ref 后调用 `focus()` 或 `scrollIntoView()`，但这里获取的是组件公开的操作句柄，不是 DOM 节点。

## 安装

在 Expo 项目中安装 `@expo/ui`：

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

这些命令的作用相同，只需选择项目正在使用的包管理器。

`expo install` 与普通的 `npm install` 不完全相同：它会根据当前 Expo 项目选择兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用，而不是由 Expo 创建的项目，需要先安装并配置 Expo Modules 所需的 `expo` 包。

### 可选安装 `react-native-worklets`

以下情况需要考虑安装 `react-native-worklets`：

1. 希望 iOS 上的 `setPage()` 带有动画。
2. 希望 `onPageScroll` 每一帧都直接在 UI 线程同步执行。

未安装时：

- Android 的 `setPage()` 仍然具有原生动画。
- iOS 的 `setPage()` 会退化为无动画跳转。
- `onPageScroll` 仍会触发，但处理函数运行在 JavaScript 线程。

安装方法和具体配置流程应参考 `react-native-worklets` 自身文档，当前文档未展开说明。

## 基本用法

```tsx
import { useRef } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PagerView, {
  type PagerViewRef,
} from '@expo/ui/community/pager-view';

export default function PagerViewExample() {
  const pagerRef = useRef<PagerViewRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={event => {
          console.log('selected page', event.nativeEvent.position);
        }}
      >
        <View key="one" style={[styles.page, { backgroundColor: '#fde68a' }]}>
          <Text>Page one</Text>
        </View>

        <View key="two" style={[styles.page, { backgroundColor: '#bfdbfe' }]}>
          <Text>Page two</Text>
        </View>

        <View key="three" style={[styles.page, { backgroundColor: '#bbf7d0' }]}>
          <Text>Page three</Text>
        </View>
      </PagerView>

      <Button
        title="Go to page 2"
        onPress={() => pagerRef.current?.setPage(1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

这段代码的关键流程如下：

1. 创建类型为 `PagerViewRef` 的 Ref。
2. 将 Ref 传给 `PagerView`。
3. 三个直接子 `View` 分别成为三个页面。
4. `initialPage={0}` 表示首次显示索引为 `0` 的第一页。
5. 页面完全选中后，`onPageSelected` 返回新页面索引。
6. 点击按钮时调用 `setPage(1)`，切换到索引为 `1` 的第二页。

页面索引从 `0` 开始，这与 JavaScript 数组索引一致。

## 核心 Props

### `children`

```tsx
<PagerView>
  <View key="page-1" />
  <View key="page-2" />
</PagerView>
```

每个直接子元素都是一个页面，并会拉伸以填满分页容器。

每个子元素都应设置稳定的 `key`。如果页面列表动态变化，不应随意使用会变化的数组位置作为业务页面的永久标识。

最后一句属于**基于经验建议**；原文档只明确要求每个子元素具有稳定的 `key`。

### `initialPage`

```tsx
<PagerView initialPage={2} />
```

- 类型：`number`
- 默认值：`0`
- 支持：Android、iOS

它只在组件挂载时读取一次。组件挂载后再修改 `initialPage` 不会切换页面。

需要在运行过程中跳转时，应使用：

```tsx
pagerRef.current?.setPage(index);
```

或者：

```tsx
pagerRef.current?.setPageWithoutAnimation(index);
```

对于 React Web 开发者，`initialPage` 更接近表单的 `defaultValue`，而不是持续控制状态的 `value`。

### `scrollEnabled`

```tsx
<PagerView scrollEnabled={false} />
```

- 类型：`boolean`
- 默认值：`true`
- 支持：Android、iOS

控制用户能否通过手势滑动页面。它不会影响通过 Ref 主动切换页面的能力。

“不会影响主动切换”是**基于文档内容推导**：文档将该属性定义为控制用户滚动，并单独提供了页面跳转方法。

### `layoutDirection`

```tsx
<PagerView layoutDirection="rtl" />
```

- 可选值：`'ltr'`、`'rtl'`
- 默认值：`'ltr'`
- 仅支持 Android

它控制分页的布局方向：

- `ltr`：从左向右
- `rtl`：从右向左

iOS 不支持该属性。

### `offscreenPageLimit`

```tsx
<PagerView offscreenPageLimit={1} />
```

- 类型：`number`
- 仅支持 Android

表示在当前可见页面两侧，各保留多少个屏外页面。

**基于文档内容推导：**保留更多屏外页面可能减少切换时重新准备页面内容的机会，但也可能占用更多资源。原文档没有提供推荐值或性能数据。

### `pageMargin`

```tsx
<PagerView pageMargin={16} />
```

- 类型：`number`
- 仅支持 Android

用于设置页面之间的间距，文档将其单位描述为像素。

iOS 不支持该属性。如果布局必须跨平台一致，需要在页面内容自身的样式中设计间距；这是**基于经验建议**，不是原文档给出的替代方案。

### 继承的 Props

`PagerView` 还继承 React Native `ViewProps`，因此可以使用 `style` 等常规 `View` 属性。

当前文档未逐项列出所有继承属性。

## 页面事件

React Native 原生事件的数据通常位于 `event.nativeEvent`，而不是 Web 事件常见的 `event.target`。

### `onPageSelected`

```tsx
onPageSelected={event => {
  const index = event.nativeEvent.position;
}}
```

- 支持：Android、iOS
- 页面完全选中时触发
- `position` 是新页面的索引

如果只需要记录当前页，优先使用这个事件，而不是连续触发的 `onPageScroll`。

这项选择属于**基于文档内容推导**：`onPageSelected` 表示完成选择，而 `onPageScroll` 会在滑动过程中持续触发。

### `onPageScroll`

```tsx
onPageScroll={event => {
  const { position, offset } = event.nativeEvent;
}}
```

- 支持：Android、iOS 18 及以上
- 在滑动过程中连续触发
- `position`：当前前侧可见页面的索引
- `offset`：向下一页移动的进度，范围为 `[0, 1)`

例如：

```text
position = 1
offset = 0.4
```

表示当前正在从索引 `1` 的页面向下一页移动，进度约为 `40%`。

如果安装了 `react-native-worklets`，可以把处理函数声明为 worklet：

```tsx
onPageScroll={event => {
  'worklet';
  // 每帧在 UI 线程同步执行
}}
```

这适合驱动需要紧跟手势的逐帧动画。普通业务状态更新是否应放在 worklet 中，当前文档未涉及。

### `onPageScrollStateChanged`

```tsx
onPageScrollStateChanged={event => {
  const state = event.nativeEvent.pageScrollState;
}}
```

支持的状态：

| 状态 | 含义 |
| --- | --- |
| `idle` | 当前没有拖动或动画 |
| `dragging` | 用户正在拖动页面 |
| `settling` | 页面正在完成滚动并吸附到目标位置 |

该事件支持 Android 和 iOS 18 及以上。

## Ref 提供的方法

### `setPage(selectedPage)`

```tsx
pagerRef.current?.setPage(2);
```

以动画方式切换到指定页面。

平台差异：

- Android：使用原生分页动画。
- iOS：动画依赖 `react-native-worklets`。
- iOS 未安装 Worklets：退化为无动画跳转。

超出有效范围的索引会被静默忽略，不会抛出错误。因此，调用方无法依赖异常发现索引错误。

### `setPageWithoutAnimation(selectedPage)`

```tsx
pagerRef.current?.setPageWithoutAnimation(2);
```

直接跳转到指定页面，不播放动画。

适合初始化后的状态恢复，或者明确不需要过渡动画的场景。该使用场景属于**基于经验建议**。

### `setScrollEnabled(scrollEnabled)`

```tsx
pagerRef.current?.setScrollEnabled(false);
```

命令式开启或关闭用户滚动。

调用后组件会重新渲染，使新值作为属性传递给原生视图。该方法适合从基于 Ref 的手势处理器等非 React 状态上下文中切换滚动能力。

需要特别注意声明式 Prop 与命令式调用的优先级：

```tsx
<PagerView
  scrollEnabled={scrollEnabled}
  ref={pagerRef}
/>
```

如果同时传入了 `scrollEnabled` Prop，后续 Prop 更新会覆盖通过 `setScrollEnabled()` 设置的值。

如果准备完全采用命令式控制，应省略 `scrollEnabled` Prop。

## 平台兼容性

### Web 不受支持

`PagerView` 不支持 Web，在 Web 上渲染会在运行时抛出错误。

这意味着它不是能够直接用于 React Native Web 的跨三端组件。如果 Expo 项目同时构建 Web，需要避免让 Web 渲染路径加载或渲染该组件。

后一句是**基于文档内容推导**；文档明确说明的是 Web 渲染会抛出运行时错误。

### Android 与 iOS 差异

| 功能 | Android | iOS |
| --- | --- | --- |
| 分页支持 | 所有受支持版本 | iOS 17 及以上 |
| iOS 16 行为 | 不适用 | 可以横向滚动，但页面不会自动吸附 |
| `onPageSelected` | 支持 | 支持 |
| `onPageScroll` | 支持 | 仅 iOS 18 及以上 |
| `onPageScrollStateChanged` | 支持 | 仅 iOS 18 及以上 |
| 动画 `setPage` | 原生支持 | 依赖 `react-native-worklets` |
| `layoutDirection` | 支持 | 不支持 |
| `offscreenPageLimit` | 支持 | 不支持 |
| `pageMargin` | 支持 | 不支持 |

在 iOS 17 上：

- `onPageScroll` 不会触发。
- `onPageScrollStateChanged` 不会触发。
- 组件挂载时会在开发环境记录警告。

在 iOS 16 上，虽然内容可以横向滚动，但不具备标准分页组件应有的页面吸附行为。因此，如果业务依赖真正的分页体验，应将 iOS 17 视为最低可用版本。这是**基于文档内容推导**。

## 从 `react-native-pager-view` 迁移

迁移时主要修改导入路径：

```tsx
// 迁移前
import PagerView from 'react-native-pager-view';

// 迁移后
import PagerView from '@expo/ui/community/pager-view';
```

虽然它被称为 API 兼容的替代组件，但不代表所有能力完全一致。

### 不支持的功能

以下 `react-native-pager-view` 能力不受支持：

- `orientation="vertical"`
- `keyboardDismissMode`
- `overdrag`
- `overScrollMode`

该组件只支持横向分页。其余不支持的配置会采用平台分页器的默认行为。

### 不提供 `usePagerView`

`@expo/ui` 版本没有 `usePagerView` Hook。

需要改用 Ref：

```tsx
const pagerRef = useRef<PagerViewRef>(null);

<PagerView ref={pagerRef} />;
```

然后通过 Ref 调用：

```tsx
pagerRef.current?.setPage(1);
pagerRef.current?.setPageWithoutAnimation(1);
pagerRef.current?.setScrollEnabled(false);
```

迁移前必须检查原项目是否依赖 `usePagerView`，不能只替换 import 后就认为迁移完成。

## 样式注意事项

`borderRadius` 在 Android 和 iOS 上都可用，但 Android 只支持数值形式：

```tsx
// Android 可以正确裁剪
style={{ borderRadius: 20 }}
```

Android 底层 Compose 宿主会静默丢弃字符串形式的圆角值，例如：

```tsx
// Android 不会按预期裁剪
style={{ borderRadius: '50%' }}
```

“静默丢弃”意味着通常不会出现明确错误，但样式不会生效。这类问题容易被误认为是层级、背景色或 `overflow` 配置错误。

## React Web 开发者最容易误解的地方

### 1. 这不是 Web 轮播组件

它依赖 Android 和 iOS 原生分页实现，没有 DOM，也不支持浏览器环境。不能直接使用 CSS、DOM API 或浏览器滚动事件控制它。

### 2. `initialPage` 不是受控属性

修改 `initialPage` 不会在挂载后切换页面。运行期间必须调用 Ref 方法。

如果需要让 React 状态与当前页面同步，可以通过 `onPageSelected` 更新状态；这是**基于文档内容推导**。

### 3. 事件数据位于 `nativeEvent`

读取页面位置时使用：

```tsx
event.nativeEvent.position
```

不能按 Web 事件习惯从 `event.target` 读取。

### 4. API 兼容不等于平台行为一致

同一个组件在 Android 和 iOS 上由不同原生技术实现。尤其需要关注：

- iOS 最低版本
- iOS 18 以下缺失滚动过程事件
- iOS 动画跳转对 Worklets 的依赖
- 三个仅 Android 支持的 Props

### 5. UI 线程与 JavaScript 线程不同

原生手势和动画主要在 UI 线程运行，React 业务逻辑通常在 JavaScript 线程执行。

未使用 Worklets 时，逐帧 `onPageScroll` 需要从原生侧传递到 JavaScript 线程。使用 Worklets 后，符合要求的处理函数可以留在 UI 线程同步执行，从而更适合逐帧动画。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 在确定使用该组件前，先确认应用是否需要支持 Web 和 iOS 16。
2. 如果只需要知道最终选中的页面，使用 `onPageSelected`，避免无必要地处理逐帧事件。
3. 如果依赖滑动进度驱动动画，应确认 iOS 最低版本为 18，并评估安装 `react-native-worklets`。
4. 将页面索引校验放在调用 `setPage()` 之前，因为越界索引会被静默忽略。
5. 跨平台页面间距不要依赖 Android 独有的 `pageMargin`。
6. 动态页面使用稳定业务 ID 作为 `key`。
7. 不要同时混用 `scrollEnabled` Prop 和 `setScrollEnabled()`，除非已明确设计二者的覆盖关系。
8. 从 `react-native-pager-view` 迁移时，应逐项搜索不受支持的 Props 和 `usePagerView`，并在 Android、iOS 真机或模拟器上分别验证。

## 文档未涉及的内容

当前文档未涉及：

- Web 替代组件
- 垂直分页的替代实现
- 页面指示器的完整实现方式
- 动态增删页面时的页面索引处理
- 页面数量很大时的性能建议
- `react-native-worklets` 的安装和配置步骤
- 原生项目的构建、签名与发布流程
- Android 和 iOS 的完整测试方案

文档只补充提到：如果需要更底层的平台专属分页行为或修饰能力，可以直接使用 `@expo/ui` 的原生 primitives；在 iOS 上，也可以使用带 `page` 样式的 SwiftUI `TabView`，它自带页面指示点，某些场景下可能更合适。

## 总结

`PagerView` 为 Expo/React Native 应用提供横向分页能力，并为从 `react-native-pager-view` 迁移提供了相近的 API。

使用时最重要的约束是：

- 仅支持 Android 和 iOS，Web 渲染会报错。
- 每个直接子元素都是一个页面，并应具有稳定的 `key`。
- `initialPage` 只在挂载时生效。
- 后续页面切换通过 Ref 完成。
- iOS 17 才具备分页吸附能力。
- iOS 的滚动过程事件要求 iOS 18 及以上。
- iOS 动画 `setPage()` 依赖 `react-native-worklets`。
- `layoutDirection`、`offscreenPageLimit` 和 `pageMargin` 仅支持 Android。
- 它不是 `react-native-pager-view` 所有功能的完全复制品。

---

## 文档导航

- **上一页**：[menu](./18__menu.md)
- **下一页**：[picker](./20__picker.md)
