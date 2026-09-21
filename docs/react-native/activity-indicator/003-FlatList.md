# 003 FlatList

**翻页：** [上一页：002 Button](002-Button.md) · [目录](README.md) · [下一页：004 Image](004-Image.md)

**官方页面：** [FlatList · React Native](https://reactnative.dev/docs/flatlist)  
**源页代码覆盖：** 可选择列表示例、`data`/`renderItem`/separators、`extraData`、多列、分隔/空/头/尾组件、固定尺寸/滚动方法、下拉刷新、viewability 配置、窗口性能 props 与 `memo` 行组件。

## FlatList 的定位

`FlatList` 用于显示扁平的同类数据行，支持 iOS/Android、横向滚动、分隔线、header/footer、下拉刷新、滚动加载、多列、可见项回调和跳转到指定行。需要分组标题时用 `SectionList`。

`FlatList` 是 `VirtualizedList` 的方便封装，并继承其 props 和很多 `ScrollView` 能力。**Virtualization（虚拟化）**只在当前可见区域附近挂载行，节省内存；列表滚出渲染窗口的行，其内部组件 state 不会保留，应把需要保留的数据放在 `data` 或外部 store。

## `data` 和 `renderItem`

`data` 是数组/array-like item 集合；`renderItem` 接收 `item`、数组序号 `index` 和 separator 控制器 `separators`，返回一行 UI。`data` 和 `renderItem` 是必需 props。

```tsx
const renderItem = ({ item, index, separators }) => (
  <Pressable
    onPress={() => selectItem(item.id)}
    onPressIn={separators.highlight}
    onPressOut={separators.unhighlight}
  >
    <Text>{index + 1}. {item.title}</Text>
  </Pressable>
);

<FlatList data={items} renderItem={renderItem} keyExtractor={item => item.id} />
```

`separators.highlight/unhighlight` 可切换行分隔器的 highlighted 状态；`separators.updateProps('leading' | 'trailing', props)` 可以给前/后分隔项设置自定义 props。

## 头、尾、空状态和分隔线

- `ItemSeparatorComponent` 放在每两行之间，不在首行前或末行后显示。
- `ListEmptyComponent` 在列表为空时呈现。
- `ListHeaderComponent` / `ListFooterComponent` 是整份列表的首部和尾部；相应的 `ListHeaderComponentStyle` / `ListFooterComponentStyle` 设置它们内部 View 的样式。
- `columnWrapperStyle` 设置 `numColumns > 1` 时的一行 wrapper。

```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ddd' }} />}
  ListEmptyComponent={<Text>还没有内容</Text>}
  ListHeaderComponent={<Text>我的清单</Text>}
  ListFooterComponent={<Text>没有更多内容</Text>}
/>
```

多列通过 `numColumns` 实现；它不能与 `horizontal` 一起使用，行项目应等高，布局以行 zig-zag 排列而非瀑布流。RN 文档提醒，手动把 `flexWrap` 当多列布局可能破坏 FlatList 对行高度的假设。

## PureComponent 与外部 state

`FlatList` 是 `PureComponent`：若 props 浅比较没有变化，它不会重绘。`renderItem` 若依赖 `data` 外的 state（如当前选中行），把该值通过 `extraData` 传入；不可原地改变 `extraData` 对象，否则引用不变，浅比较看不到更新。

```tsx
<FlatList
  data={items}
  extraData={selectedId}
  keyExtractor={item => item.id}
  renderItem={({ item }) => (
    <Text>{item.id === selectedId ? '✓ ' : ''}{item.title}</Text>
  )}
/>
```

默认 keyExtractor 先读 item.key，再读 item.id，最后退回数组 index。发生排序或插入时，最好用稳定 ID，以便 React 正确追踪行。

## 尺寸、视口和滚动 props

| prop | 用途/注意事项 |
|---|---|
| `horizontal` | 横向列表；默认竖向 |
| `initialNumToRender` | 首批行数，默认 10。够铺满初始 viewport 即可；这些行会保留挂载来优化滚回顶部 |
| `initialScrollIndex` | 初始从某一行开始；必须提供 `getItemLayout`，且会关闭回到顶部优化 |
| `inverted` | 用 scale transform -1 反转滚动方向，常用于聊天消息 |
| `numColumns` | 竖向多列；项目高度应一致，不支持 masonry |
| `progressViewOffset` | 调整 pull-to-refresh loading indicator 的起始偏移 |
| `removeClippedSubviews` | 把可视区域外的原生 view 从 superview detach；Android 默认 true。可能丢失内容，尤其带 transform/absolute position 时须谨慎 |

若每行高度/宽度固定，`getItemLayout(data, index)` 给出 `length`、`offset`、`index`，可跳过异步测量。使用 ItemSeparatorComponent 时也要把分隔线尺寸算进 offset：

```tsx
const ROW = 56;
const getItemLayout = (_data, index) => ({ length: ROW, offset: ROW * index, index });
```

## 下拉刷新和 Viewability

提供 `onRefresh` 会呈现标准 RefreshControl；请求期间还要将 `refreshing` 设为 true，完成后复位。`onViewableItemsChanged` 根据 `viewabilityConfig` 报告变为可见或离开的项目。

```tsx
const viewabilityConfig = useRef({
  itemVisiblePercentThreshold: 70,
  minimumViewTime: 250,
  waitForInteraction: false,
}).current;

const onViewableItemsChanged = useCallback(({ viewableItems }) => {
  recordVisibleIds(viewableItems.map(token => token.item.id));
}, []);

<FlatList
  data={items}
  renderItem={renderItem}
  refreshing={refreshing}
  onRefresh={refresh}
  viewabilityConfig={viewabilityConfig}
  onViewableItemsChanged={onViewableItemsChanged}
/>
```

`viewabilityConfig` 至少要设置 `viewAreaCoveragePercentThreshold` 或 `itemVisiblePercentThreshold`；前者看 item 覆盖 viewport 的比例，后者看 item 自身有多少比例可见。`minimumViewTime` 指需要保持可见多久才通知，`waitForInteraction` 表示首次用户滚动或 `recordInteraction()` 后才算可见。配置对象应保持稳定，不要每次 render 新建，否则列表会报不支持更换配置的错误。还可用 `viewabilityConfigCallbackPairs` 绑定多组规则和 handler。

## 行组件与滚动方法

列表行常常上百个，应尽量简单轻量，图片尽量用合适尺寸的缩略图。`React.memo` 可减少无关重渲染；比较函数要判断所有影响输出的 props。

```tsx
const Row = memo(({ title, selected }: RowProps) => (
  <Text>{selected ? '✓ ' : ''}{title}</Text>
), (previous, next) =>
  previous.title === next.title && previous.selected === next.selected
);
```

通过 ref 可以调用列表方法：`flashScrollIndicators()` 闪现滚动条；`getNativeScrollRef()`/`getScrollResponder()`/`getScrollableNode()` 取得底层句柄。`scrollToEnd({animated})` 滚到底；`scrollToOffset({offset, animated})` 按内容像素偏移；`scrollToIndex({index, viewOffset, viewPosition, animated})` 按序号定位；`scrollToItem({item, viewPosition, animated})` 会线性扫描数据，通常优先用 `scrollToIndex`。

视口外的 index/item 要精确滚动时需 `getItemLayout`；否则列表无法事先算出远处项目位置。下一页继续按 Components 的 Next 链查看 `Image`。

**翻页：** [上一页：002 Button](002-Button.md) · [目录](README.md) · [下一页：004 Image](004-Image.md)
