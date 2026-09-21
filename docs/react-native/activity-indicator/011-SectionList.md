# 011 SectionList

**翻页：** [上一页：010 ScrollView](010-ScrollView.md) · [目录](README.md) · [下一页：012 StatusBar](012-StatusBar.md)

**官方页面：** [SectionList · React Native](https://reactnative.dev/docs/sectionlist)  
**源页代码覆盖：** 分组数据、`renderItem` 参数、各类分隔线和头尾、空态、刷新、可见项回调、`extraData`、section 类型、吸顶标题、列表窗口化注意事项，以及 `flashScrollIndicators`、`recordInteraction`、`scrollToLocation` 方法。

## SectionList 适合什么数据

`SectionList` 用于“分组的长列表”，例如联系人按字母、设置按类别、订单按月份。它相当于分组版的高性能虚拟列表：只渲染接近视口的部分。只有普通的一维列表时使用 `FlatList` 会更简单。

`sections` 是数组，每个 section 至少含 `data` 数组；可选 `key` 稳定标识分组，也可为某一组单独覆盖 `renderItem`、`ItemSeparatorComponent`、`keyExtractor`。列表级 `renderItem` 接收 `item`、该组内的 `index`、完整的 `section` 对象和 `separators` 操作器。

```tsx
type Contact = { id: string; name: string };
type ContactSection = { title: string; data: Contact[]; key: string };

const contacts: ContactSection[] = [
  {
    key: 'team',
    title: '团队',
    data: [{ id: 'c1', name: '林' }, { id: 'c2', name: '周' }],
  },
  {
    key: 'friends',
    title: '朋友',
    data: [{ id: 'c3', name: '陈' }],
  },
];

<SectionList
  sections={contacts}
  keyExtractor={person => person.id}
  renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
  renderItem={({ item, index, section, separators }) => (
    <Pressable
      onPress={() => openContact(item.id)}
      onPressIn={separators.highlight}
      onPressOut={separators.unhighlight}
    >
      <Text>{index + 1}. {item.name}（{section.key}）</Text>
    </Pressable>
  )}
/>
```

`keyExtractor` 生成每一行的 React key。默认会依次尝试 `item.key`、`item.id`，再退回数组下标；每个 section 也需要稳定 key，避免分组增删或重排时错配。

## 标题、分隔线、空态与刷新

- `renderSectionHeader` / `renderSectionFooter` 分别绘制每组上下内容。iOS 默认让组标题吸顶；`stickySectionHeadersEnabled` 可明确开关。Android 默认不吸顶。
- `ItemSeparatorComponent` 只画相邻行之间的分隔；`SectionSeparatorComponent` 画每组头尾分隔。前者会收到行所在 section、leading/trailing 和高亮状态等 props；自定义 separator 可在 `renderItem` 里经 `separators.updateProps` 增加样式数据。
- `ListHeaderComponent` / `ListFooterComponent` 绘制列表全局首尾内容；`ListEmptyComponent` 在没有可显示行时提供空态。
- 提供 `onRefresh` 就可支持下拉刷新，但要用 `refreshing` 明确保持指示器状态。`progressViewOffset` 可调整指示器离顶部的位置。

```tsx
<SectionList
  sections={sections}
  renderItem={renderContact}
  renderSectionHeader={({ section }) => <SectionHeading title={section.title} />}
  renderSectionFooter={({ section }) => <SectionTail count={section.data.length} />}
  ItemSeparatorComponent={ContactDivider}
  SectionSeparatorComponent={SectionDivider}
  ListHeaderComponent={<Text>最近联系人</Text>}
  ListFooterComponent={<Text>已显示全部</Text>}
  ListEmptyComponent={<Text>暂无联系人</Text>}
  refreshing={refreshing}
  onRefresh={reloadContacts}
  progressViewOffset={12}
/>
```

每组可通过 `renderItem` 单独绘制异构数据；`ItemSeparatorComponent` / `keyExtractor` 也都支持 per-section 覆盖。`inverted` 可反转滚动方向，常用在聊天；`initialNumToRender` 控制首次批量渲染数量（默认 10，首屏批次为回顶体验保留）。

## 更新、可见性与虚拟化

`SectionList` 按窗口异步创建屏外内容来省内存。快速滚动可能暂时跑到渲染进度前面而看到空白，这是性能和预渲染耗时的折中。离开渲染窗口的行组件本地 state 不保证保留；重要数据放在源数据或列表之外的状态管理中。

它按浅比较判断是否更新。若 `renderItem`、标题、页脚依赖 `sections` 以外的状态，必须传入不可变更新的 `extraData`，否则父组件变了但列表 props 表面相同，行可能不刷新。`onViewableItemsChanged` 与 `viewabilityConfig` 组合用于曝光统计或懒加载；触摸或导航引发了交互时可调用 `recordInteraction()` 触发待处理的可见性计算。

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
const listRef = useRef<SectionList<Contact>>(null);

<SectionList
  ref={listRef}
  sections={sections}
  extraData={selectedId}
  renderItem={({ item }) => (
    <ContactRow selected={item.id === selectedId} person={item} />
  )}
  viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
  onViewableItemsChanged={({ viewableItems, changed }) => {
    reportExposure(viewableItems.map(token => token.item.id));
  }}
  onScrollBeginDrag={() => listRef.current?.recordInteraction()}
/>
```

`removeClippedSubviews` 让离屏 native 子视图脱离原生父视图，可能改善大列表滚动；但部分布局下会有内容漏绘问题。Android 默认启用，出现缺项时应先检查此项。

## 命令式方法与 Section 类型

- `flashScrollIndicators()`（iOS）短暂显示滚动条。
- `recordInteraction()` 告知列表已有交互，触发依赖交互状态的可见项计算。
- `scrollToLocation({ sectionIndex, itemIndex, animated, viewOffset, viewPosition })` 滚动到指定组/行。`viewPosition` 从 `0`（顶部）到 `1`（底部），`0.5` 表示居中；吸顶头可能遮住顶部行，可加 `viewOffset`。跳到尚未渲染的窗口外位置时，提供 `getItemLayout` 或 `onScrollToIndexFailed`，以便列表计算或恢复定位。

```tsx
listRef.current?.scrollToLocation({
  sectionIndex: 1,
  itemIndex: 0,
  animated: true,
  viewPosition: 0,
  viewOffset: 44,
});
```

一个 section 的数据形状如下，`data` 必须是该组实际渲染的行数组：

```tsx
type Section<T> = {
  data: T[];
  key?: string;
  renderItem?: (info: { item: T; index: number; section: Section<T> }) => React.ReactElement;
  ItemSeparatorComponent?: React.ComponentType | React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
};
```

SectionList 还继承 `VirtualizedList` 和 `ScrollView` 中未单独覆盖的 props，因此可以使用滚动事件、窗口配置和 ScrollView 的常用行为。若只需普通线性列表，参考 `FlatList`；下一页是状态栏 API。

## 代码覆盖清单

已覆盖官方页面示例/签名主题：分组 sections 与 item renderer、section 与 item key、headers/footers/两类 separator、列表全局头尾与空状态、刷新 props、可见性回调与配置、`extraData` 与窗口化、section 类型定义、吸顶行为、`flashScrollIndicators()`、`recordInteraction()`、`scrollToLocation()` 与渲染窗口外定位限制。页面参考项中继承的虚拟列表/滚动 props 以说明方式覆盖。

**翻页：** [上一页：010 ScrollView](010-ScrollView.md) · [目录](README.md) · [下一页：012 StatusBar](012-StatusBar.md)
