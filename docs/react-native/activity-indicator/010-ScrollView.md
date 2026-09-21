# 010 ScrollView

**翻页：** [上一页：009 RefreshControl](009-RefreshControl.md) · [目录](README.md) · [下一页：011 SectionList](011-SectionList.md)

**官方页面：** [ScrollView · React Native](https://reactnative.dev/docs/scrollview)  
**源页代码覆盖：** 内容容器样式、粘性头部、滚动事件数据结构、横向/分页/吸附、键盘交互、刷新控件、缩放、可见内容保持、滚动到指定位置/末尾/闪烁滚动条；并覆盖全部 ScrollView 专属 props 与方法。

## 什么时候用 ScrollView

`ScrollView` 是原生滚动容器，可以纵向或横向放置不同类型的子视图。它会一次性创建所有子元素；内容很长或数据很多时，这会增加首次渲染时间和内存。大列表应优先用 `FlatList` 或分组列表 `SectionList`，它们会按窗口分批渲染。

滚动容器必须有明确的有限高度。通常让父容器一路传递 `flex: 1`，而不是给每层写死高度；任意一层高度没有约束，都可能导致滚动区域无法正确计算。

```tsx
function DetailsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Hero />
        <Text>可以滚动浏览的详情内容</Text>
        <RelatedCards />
      </ScrollView>
    </View>
  );
}
```

`style` 控制滚动视图本身；`contentContainerStyle` 控制包住所有 children 的内部内容容器，例如内边距、内容最小高度或布局方向。

## 常见布局与滚动效果

### 横向、分页与吸附

`horizontal` 让子项按水平方向排列。`pagingEnabled` 按容器宽度或高度停在整页边界，适合整屏轮播。卡片宽度不等时用 `snapToOffsets`；等宽卡片可用 `snapToInterval`，并常搭配 `decelerationRate="fast"`、`snapToAlignment`。`snapToStart` 和 `snapToEnd` 控制首尾是否也作为吸附点；`disableIntervalMomentum` 限制快甩手势一次跨过太多间隔。

```tsx
<ScrollView
  horizontal
  snapToInterval={CARD_WIDTH + GAP}
  snapToAlignment="start"
  decelerationRate="fast"
  snapToStart
  snapToEnd={false}
  showsHorizontalScrollIndicator={false}
>
  {cards.map(card => <PromoCard key={card.id} card={card} />)}
</ScrollView>
```

`snapToOffsets={[0, 180, 420]}` 可表达不等宽项目的位置；它比 `pagingEnabled` 和 `snapToInterval` 更精确。`disableScrollViewPanResponder` 会把拖动处理更多交给子项，只在特殊吸附交互下考虑，否则可能产生意外触摸行为。

### 粘性头部与聊天内容

`stickyHeaderIndices` 用子元素的从零开始的索引指定吸顶项；横向滚动不支持此功能。`StickyHeaderComponent` 可替换头部实现，例如需要自定义 transform/动画时。`stickyHeaderHiddenOnScroll` 让头部随下滚隐藏、上滚时重新吸顶；`invertStickyHeaders` 可让倒置滚动视图的头部贴在底部。

```tsx
<ScrollView stickyHeaderIndices={[0]} stickyHeaderHiddenOnScroll>
  <View style={{ backgroundColor: 'white', padding: 12 }}>
    <Text>吸顶筛选栏</Text>
  </View>
  <ArticleBody />
</ScrollView>
```

聊天或上下双向加载的内容可设置 `maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 24 }}`，尽量保持用户当前看到的第一项位置稳定，并可在接近顶部时自动滚到顶部。不要在启用它时随意重排子项；变换、遮挡等复杂布局也不一定能被可见性计算准确理解。

### 下拉刷新与键盘

纵向 ScrollView 可通过 `refreshControl={<RefreshControl ... />}` 放入刷新指示器。输入框场景中，`keyboardDismissMode` 决定拖动如何关闭键盘：`none` 不关闭，`on-drag` 开始拖动就关闭；iOS 另支持与手势同步的 `interactive`。`keyboardShouldPersistTaps` 的 `never`、`always`、`handled` 决定键盘显示时子项点击是否先关闭键盘或继续传递。

```tsx
<ScrollView
  keyboardDismissMode="on-drag"
  keyboardShouldPersistTaps="handled"
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={reload} />
  }
>
  <TextInput placeholder="搜索" />
  <Pressable onPress={submit}><Text>提交</Text></Pressable>
</ScrollView>
```

iOS 的 `automaticallyAdjustKeyboardInsets` 可在键盘尺寸变化时更新内容 inset；`automaticallyAdjustContentInsets` 与 `contentInsetAdjustmentBehavior` 用于控制导航栏、安全区等对内容区域的自动调整。内容 inset 和滚动指示条 inset 可分别用 `contentInset`、`scrollIndicatorInsets` 设置。

### 缩放、嵌套滚动及填充

iOS 的 `pinchGestureEnabled` 控制双指缩放手势，`minimumZoomScale`/`maximumZoomScale` 设范围，`zoomScale` 是当前缩放比例，`bouncesZoom` 控制超出范围后是否回弹。`nestedScrollEnabled` 在 Android API 21 及以上启用嵌套滚动。Android 还有 `endFillColor`（内容未铺满时填充剩余背景）、`fadingEdgeLength`、`overScrollMode`、`persistentScrollbar`、`scrollPerfTag` 和 `scrollsChildToFocus` 等平台属性。

## 滚动事件与命令式方法

`onScroll` 最多每帧触发一次，`scrollEventThrottle` 控制事件间隔（毫秒；小于等于 16 时不节流）。事件里的 `nativeEvent` 包含内容尺寸、滚动偏移、视口尺寸、速度、缩放比例等；`targetContentOffset` 仅 iOS 提供。拖动开始/结束与惯性滚动开始/结束可分别用 `onScrollBeginDrag`、`onScrollEndDrag`、`onMomentumScrollBegin`、`onMomentumScrollEnd` 监听。`onContentSizeChange(width, height)` 在可滚内容大小改变时触发。

```tsx
const scrollRef = useRef<ScrollView>(null);

<ScrollView
  ref={scrollRef}
  onScroll={event => {
    const { contentOffset, contentSize, layoutMeasurement, velocity } =
      event.nativeEvent;
    console.log(contentOffset.y, contentSize.height, layoutMeasurement.height, velocity?.y);
  }}
  scrollEventThrottle={32}
  onContentSizeChange={(width, height) => setContentHeight(height)}
>
  {content}
</ScrollView>

// 使用 options 对象；旧的位置参数重载已弃用。
scrollRef.current?.scrollTo({ x: 0, y: 300, animated: true });
scrollRef.current?.scrollToEnd({ animated: true });
scrollRef.current?.flashScrollIndicators();
```

当前推荐的 `scrollTo` 形状是 `scrollTo(options?: { x?: number; y?: number; animated?: boolean } | number, deprecatedX?: number, deprecatedAnimated?: boolean)`；对象参数中，垂直视图主要改变 `y`，水平视图主要改变 `x`。签名保留旧式独立位置参数只是历史兼容；旧参数顺序是 y 在 x 前，存在歧义，已弃用，不要再使用。`scrollToEnd(options?: { animated?: boolean })` 滚至纵向底部或横向右端；`flashScrollIndicators()` 短暂显示滚动条。iOS 的 `scrollsToTop` 允许点按状态栏回到顶部，`onScrollToTop` 可监听该动作。

## 属性速查

下表按用途归类页面参考区中的 ScrollView 专属属性；ScrollView 也继承 `View` 的属性。

| 类别 | 属性 | 说明与平台 |
|---|---|---|
| 方向/布局 | `horizontal` | 横向排列子项，默认纵向。 |
| 方向/布局 | `contentContainerStyle` | 设置包裹 children 的内容容器样式。 |
| 方向/布局 | `centerContent` | iOS：内容较小时在视口居中。 |
| 初始/边距 | `contentOffset` | 指定初始 `{x, y}` 滚动位置。 |
| 初始/边距 | `contentInset` | iOS：内容与边缘间距。 |
| 初始/边距 | `automaticallyAdjustContentInsets` | iOS：自动考虑导航栏/工具栏对内容边距的影响。 |
| 初始/边距 | `contentInsetAdjustmentBehavior` | iOS：选择如何使用安全区调整内容范围。 |
| 初始/边距 | `automaticallyAdjustsScrollIndicatorInsets` | iOS：自动调整滚动指示条边距。 |
| 初始/边距 | `scrollIndicatorInsets` | iOS：滚动指示条的边距。 |
| 回弹/惯性 | `bounces`、`alwaysBounceHorizontal`、`alwaysBounceVertical` | iOS：控制到达边缘时及内容较短时是否回弹。 |
| 回弹/惯性 | `decelerationRate` | 松手后减速速度；可用 `normal`、`fast` 或数值。两平台数值不同。 |
| 手势 | `directionalLockEnabled` | iOS：尝试将拖动锁定为单一方向。 |
| 手势 | `canCancelContentTouches` | iOS：判断滚动开始后是否可取消子项触摸跟踪。 |
| 手势 | `disableScrollViewPanResponder` | 关闭默认 JS 拖动 responder；特殊交互谨慎使用。 |
| 手势 | `nestedScrollEnabled` | Android：启用嵌套滚动。 |
| 键盘 | `keyboardDismissMode` | 拖动时是否关闭键盘；iOS 另有 `interactive`。 |
| 键盘 | `keyboardShouldPersistTaps` | 控制键盘打开时的点击传递行为。 |
| 键盘 | `automaticallyAdjustKeyboardInsets` | iOS：键盘变化时自动调整内容 inset。 |
| 吸顶 | `stickyHeaderIndices`、`StickyHeaderComponent` | 指定吸顶子项及可替换的吸顶头实现；不支持横向模式。 |
| 吸顶 | `stickyHeaderHiddenOnScroll`、`invertStickyHeaders` | 控制滚动隐藏和倒置列表中的吸顶方向。 |
| 刷新/维护 | `refreshControl` | 垂直滚动视图中的下拉刷新组件。 |
| 刷新/维护 | `maintainVisibleContentPosition` | 插入/追加内容时尝试保持可见项的位置。 |
| 缩放 | `pinchGestureEnabled`、`minimumZoomScale`、`maximumZoomScale`、`zoomScale`、`bouncesZoom` | iOS：双指缩放开关、范围、当前缩放和回弹。 |
| 平台呈现 | `indicatorStyle` | iOS：滚动条采用默认、黑色或白色样式。 |
| 平台呈现 | `endFillColor`、`fadingEdgeLength` | Android：剩余区域填色和边缘渐隐。 |
| 平台呈现 | `overScrollMode`、`persistentScrollbar` | Android：过滚动效果和常驻滚动条。 |
| 平台呈现 | `scrollsChildToFocus` | Android：聚焦子项时是否自动滚入可见区域。 |
| 平台诊断 | `scrollPerfTag` | Android：性能日志标签；还需原生 FPS 监听器实现才有诊断效果。 |
| 滚动开关 | `scrollEnabled` | 禁止用户手势滚动；代码仍可调用 `scrollTo`。 |
| 指示条 | `showsHorizontalScrollIndicator`、`showsVerticalScrollIndicator` | 显示或隐藏对应方向滚动条。 |
| 事件 | `onContentSizeChange`、`onScroll` | 内容尺寸变化和滚动位置变化通知。 |
| 事件 | `onScrollBeginDrag`、`onScrollEndDrag` | 用户拖动开始/结束。 |
| 事件 | `onMomentumScrollBegin`、`onMomentumScrollEnd` | 惯性滚动开始/停止。 |
| 事件 | `onScrollToTop` | iOS：点状态栏回顶后的通知。 |
| 节流 | `scrollEventThrottle` | 滚动事件最小时间间隔，单位毫秒。 |
| 性能/绘制 | `removeClippedSubviews` | 移除屏幕外原生子视图；可能造成内容缺失，需实测。 |
| 分页吸附 | `pagingEnabled` | 按视口整页停靠。 |
| 分页吸附 | `disableIntervalMomentum` | 开启后快速甩动也只停在相邻间隔。 |
| 分页吸附 | `snapToAlignment`、`snapToInterval`、`snapToOffsets` | 定义等距或不等距吸附点及对齐方式。 |
| 分页吸附 | `snapToStart`、`snapToEnd` | 控制吸附偏移列表是否包含首端/尾端。 |
| 命令式 | `flashScrollIndicators()`、`scrollTo()`、`scrollToEnd()` | 短暂显示滚动条、滚至坐标、滚至内容末端。 |

## 代码覆盖清单

本页代码主题已以原创片段覆盖：有界布局及内容样式、横向卡片吸附、索引吸顶、刷新与键盘共存、滚动事件读取、内容尺寸通知、滚到坐标/末端和滚动条提示。其余平台专属行为在“属性速查”逐项列出。官方原页没有一个统一的完整应用例子；这里把参考区中的 API 行为拆成可学习片段。

**翻页：** [上一页：009 RefreshControl](009-RefreshControl.md) · [目录](README.md) · [下一页：011 SectionList](011-SectionList.md)
