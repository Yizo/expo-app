# 020 VirtualizedList

**翻页：** [上一页：019 View](019-View.md) · [目录](README.md) · [下一页：021 DrawerLayoutAndroid](021-DrawerLayoutAndroid.md)

**官方页面：** [VirtualizedList · React Native](https://reactnative.dev/docs/virtualizedlist)  
**源页代码覆盖：** 自定义 data accessor、getItem/getItemCount/renderItem、separator/header/footer/empty cell、窗口化更新与 PureComponent/extraData、批量渲染和 windowSize 调优、首尾加载/刷新/曝光、索引/偏移滚动与全部 ref 方法。

## 为什么有 VirtualizedList

**VirtualizedList** 是更高层 **FlatList** 与 **SectionList** 的底层通用实现。普通数组和常见列表先用 FlatList；只有数据形状特殊、需要不可变数据或更灵活的数据读取策略时，才直接使用 VirtualizedList。

它只维护有限的渲染窗口：屏幕附近的行转成视图，窗口外以空白占位，因此内存不会随全部数据同时变成原生控件。距离视口远的行会低优先级渐进渲染，靠近屏幕的行优先补齐。但快速滚动仍可能超过填充速度，短暂露出空白，这是内存、填充率和触摸响应之间的取舍。

## 自定义数据读取

与 FlatList 不同，VirtualizedList 不假设 data 是数组。必须提供 **getItem(data, index)** 读取一项、**getItemCount(data)** 返回数量，以及 **renderItem(info)** 绘制一项。key 默认从 item.key、item.id 查找，最好用 **keyExtractor** 返回稳定字符串。

    const records = new Map([
      ['a', { id: 'a', title: '欢迎' }],
      ['b', { id: 'b', title: '新消息' }],
    ]);
    const orderedIds = ['a', 'b'];

    <VirtualizedList
      data={orderedIds}
      getItem={(ids, index) => records.get(ids[index])}
      getItemCount={ids => ids.length}
      keyExtractor={record => record.id}
      renderItem={({ item }) => <MessageRow message={item} />}
    />

每个 row 也可以通过 **ListItemComponent** 指定统一渲染组件。**CellRendererComponent** 可替换包在 row 外面的 cell，不过自定义组件必须把 cell 的布局/滚动事件处理器继续传递给 VirtualizedList，否则行位置追踪会失效。**ItemSeparatorComponent** 绘制相邻行间隔；renderItem 可用 separators 的 highlight/unhighlight/updateProps 控制分隔线的状态。

全局的 **ListHeaderComponent**/**ListFooterComponent** 绘制列表前后内容，并可用各自的 ListHeaderComponentStyle/ListFooterComponentStyle 设置其内部 View；**ListEmptyComponent** 绘制空列表状态。VirtualizedList 也继承 ScrollView props。

## 状态更新与渲染窗口

列表是浅比较组件：若 props 浅比较相等，它就不再渲染。renderItem 若依赖 data 以外的变量，将依赖状态放在 **extraData** 并以不可变方式更新，确保列表看到新引用。窗口外卸载的行不会保存内部 state，行数据应来自 data 或外部 store。

**initialNumToRender** 控制首批行数（默认 10）；**initialScrollIndex** 可从某索引起始，但必须同时提供 **getItemLayout**，并关闭保留顶部初始批次的优化。固定高度行的 getItemLayout 返回 { length, offset, index }，可让长列表快速跳转，不必先测量所有中间行。

**windowSize** 用可视区高度/宽度的倍数设置缓存窗口（默认 21，大约视口加上下各 10 个视口）。减小它可省内存，但快速滚动露空白的可能增大。**maxToRenderPerBatch** 设每批最大行数，增加可提升 fill rate 却会占用 JS 执行时间、影响按键响应；**updateCellsBatchingPeriod** 控制低优先级批次间隔。**debug** 开启额外日志与可视化覆盖层，但性能成本很高。旧 **disableVirtualization** 已弃用，仅供排错时使用。

## 列表行为与加载回调

| 属性 | 行为 |
|---|---|
| **horizontal / inverted** | 横向排列，或翻转滚动方向（基于 scale transform）。 |
| **initialNumToRender / initialScrollIndex / getItemLayout** | 首批数量、起始索引以及行尺寸/偏移计算。 |
| **extraData / keyExtractor** | 通知依赖变化；生成稳定 React key。 |
| **maxToRenderPerBatch / updateCellsBatchingPeriod / windowSize** | 调整一次渲染多少、批次间隔及屏外缓存窗口。 |
| **onEndReached / onEndReachedThreshold** | 接近逻辑末尾时回调；threshold 以可视区长度为单位，默认 2。 |
| **onStartReached / onStartReachedThreshold** | 接近逻辑开头时回调；同样以可视区长度为单位，默认 2。 |
| **onScrollToIndexFailed** | 某行尚未测量时跳转失败回调，包含请求索引、最高测量索引和平均行长，可计算 offset 或先尽量滚动再重试。 |
| **onViewableItemsChanged / viewabilityConfig / viewabilityConfigCallbackPairs** | 行达到可见条件时通知曝光；可注册多组条件及回调。 |
| **onRefresh / refreshing / progressViewOffset** | 使用内建下拉刷新时，refreshing 必须受控；offset 调整加载标记位置。 |
| **refreshControl** | 提供自定义 RefreshControl 后会取代内建控件，同时忽略 onRefresh/refreshing；只支持纵向列表。 |
| **List...Component / List...Style** | 设置空态、头尾、行组件与头尾容器样式。 |
| **removeClippedSubviews** | 从原生父视图卸载离屏节点，可能缺内容；Android 默认 true。 |
| **persistentScrollbar** | 控制滚动条是否保持可见。 |
| **renderScrollComponent** | 替换底层滚动组件，常用于定制刷新包装。 |
| **ItemSeparatorComponent / CellRendererComponent** | 自定义行分隔和单元格包装。 |
| **disableVirtualization** | 已弃用；仅排错时短暂关闭窗口化。 |

## ref 方法

常用方法包括：

- **flashScrollIndicators()**：短暂显示滚动指示条。
- **scrollToEnd({ animated? })**：滚动到内容末尾；没有 getItemLayout 时可能不够平滑。
- **scrollToOffset({ offset, animated? })**：按像素偏移滚动；横向是 x，纵向是 y。
- **scrollToIndex({ index, animated?, viewOffset?, viewPosition? })**：跳到某索引；0 对齐顶部，1 对齐底部，0.5 居中。
- **scrollToItem({ item, animated?, viewOffset?, viewPosition? })**：按数据对象跳转；`item: ItemT` 必填，其余参数可选。可将签名理解为 `scrollToItem(params: { item: ItemT; animated?: boolean; viewOffset?: number; viewPosition?: number })`。它要线性查找项目，知道索引时优先使用 `scrollToIndex`。
- **getScrollableNode() / getScrollRef() / getScrollResponder()**：取得底层原生滚动节点、ref 或 responder。对返回值调用平台/ScrollView 方法前，先确认它确实支持该方法。

    const listRef = useRef<VirtualizedList<Message>>(null);

    listRef.current?.scrollToIndex({
      index: 18,
      animated: true,
      viewPosition: 0.5,
    });

    listRef.current?.scrollToOffset({ offset: 720, animated: false });
    listRef.current?.flashScrollIndicators();

若目标行还未进入渲染窗口，scrollToIndex 依赖 getItemLayout 或 onScrollToIndexFailed 来计算/恢复位置。别依赖列表之外行组件内的本地 state 来保存数据。

## 代码覆盖清单

已写原创的自定义 data accessor 与 renderItem 示例，列出全部专属 props、渲染窗口/PureComponent/extraData 性能主题、固定布局/首批配置、头尾与 separator、两端阈值加载、刷新、viewability、clip/debug/batch/window 设置、滚动失败恢复及 7 个 ref 方法。未在示例中重复整个 ScrollView 继承参考表。

**翻页：** [上一页：019 View](019-View.md) · [目录](README.md) · [下一页：021 DrawerLayoutAndroid](021-DrawerLayoutAndroid.md)
