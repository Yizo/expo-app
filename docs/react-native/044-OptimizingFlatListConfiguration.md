# 044 Optimizing FlatList Configuration

**翻页：** [上一页：043 Speeding up your Build phase](043-SpeedingUpBuildPhase.md) · [目录](README.md) · [下一页：045 Optimizing JavaScript loading](045-OptimizingJavaScriptLoading.md)

**官方页面：** [Optimizing FlatList Configuration · React Native](https://reactnative.dev/docs/optimizing-flatlist-configuration)  
**源页代码覆盖：** `removeClippedSubviews`、`maxToRenderPerBatch`、`updateCellsBatchingPeriod`、`initialNumToRender`、`windowSize` 默认值与取舍、React.memo、自定义比较函数、getItemLayout、keyExtractor、稳定 renderItem/useCallback。

## 先理解 VirtualizedList 的几个词

`FlatList` 由 `VirtualizedList` 支撑，只在列表周围有限的窗口挂载行，不会一次创建整份列表。

- **Viewport：** 用户屏幕上当前看见的列表区域。
- **Window：** 当前挂载到视图树、供滚动使用的项目范围，通常比 viewport 大。
- **Memory consumption：** 为已挂载行和数据保留的内存；过大可能引起内存压力或崩溃。
- **Responsiveness：** 点按等交互得到及时响应的程度。
- **Blank area：** 列表滑动太快、下一批项目还未渲染时短暂出现的空白。

优化时常常要在内存、空白风险、初始渲染速度和 JS 响应性之间权衡，不能把所有参数都调大。

## FlatList 窗口参数

| 属性 | 默认值 | 作用和权衡 |
|---|---:|---|
| `removeClippedSubviews` | Android `true`，iOS `false` | 把 viewport 以外的视图从原生层级 detach，降低主线程绘制工作；并不会释放相应 JS/React 内存。transform/absolute 布局可能出现内容丢失 |
| `maxToRenderPerBatch` | 10 | 每批最多渲染多少行；增大可减少空白，但 JS 一次忙更久，交互可能卡住 |
| `updateCellsBatchingPeriod` | 50 ms | 两批渲染之间等待时间；更频繁可减轻空白但工作更碎，也可能挤占交互处理 |
| `initialNumToRender` | 10 | 首次渲染行数；按各种设备一屏实际需要的行数设置，过小首屏会露白 |
| `windowSize` | 21 个 viewport 单位 | 约为视口上方 10 屏、可视 1 屏、下方 10 屏；更大能降低快速滚动露白，但同时挂载行更多、更占内存 |

先实测滚动速度和行内容，再调整这些属性；尤其 `removeClippedSubviews` 可能造成缺失内容，不能盲目启用。

## 让列表行轻量、避免重复 render

列表行会大量重复创建，因此应尽量使用简单组件，少做复杂嵌套、重计算、阴影/动画和大图。缩略图应先裁切到显示尺寸；昂贵数据可在点开详情时加载。

`React.memo` 可在 props 没有变化时跳过函数组件重新渲染。自定义比较函数需要检查影响输出的全部 props；只比较某一个值而忽略 callback/其他视觉状态，可能让画面保持旧值。

```tsx
const ContactRow = memo(function ContactRow({ name, selected }: Props) {
  return <Text>{selected ? `✓ ${name}` : name}</Text>;
}, (previous, next) =>
  previous.name === next.name && previous.selected === next.selected
);
```

列表图片可考虑带本地缓存的图片库。源页举例 `@d11/react-native-fast-image`；选择第三方库前检查维护状态、平台覆盖、Expo/RN 版本兼容和新架构支持。

## 固定尺寸列表与稳定 keys

所有行高度相同（水平列表则所有宽度相同）时，用 `getItemLayout` 告诉 FlatList 每行精确尺寸与偏移，可跳过异步测量。动态尺寸列表不能返回虚假的固定高度。

```tsx
const ROW_HEIGHT = 60;

<FlatList
  data={records}
  getItemLayout={(_, index) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  })}
  keyExtractor={item => item.id}
  renderItem={renderItem}
/>
```

`keyExtractor` 提供稳定标识，供缓存和重排追踪使用；也可在行组件上提供 key，但不要用会随列表顺序变化的数组索引作为稳定业务 ID。

## 保持 renderItem 稳定

在函数组件中，把 `renderItem` 提到 JSX 外，并使用 `useCallback`，避免父组件每次 render 都创建一个新函数。class 组件则把它定义在 `render` 方法之外。

```tsx
const renderItem = useCallback(
  ({ item }: { item: RecordItem }) => (
    <View><Text>{item.title}</Text></View>
  ),
  []
);

return <FlatList data={items} renderItem={renderItem} />;
```

空依赖数组只适用于回调不读取会变化的外层值；若 renderItem 用到 props/state，应列入依赖，否则回调会捕获旧值。

**翻页：** [上一页：043 Speeding up your Build phase](043-SpeedingUpBuildPhase.md) · [目录](README.md) · [下一页：045 Optimizing JavaScript loading](045-OptimizingJavaScriptLoading.md)
