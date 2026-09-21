# 041 ViewToken

**翻页：** [上一页：040 TargetEvent](040-TargetEvent.md) · [目录](README.md) · **无后续页面，已到官方 Next 链终点** · [返回目录](README.md)

**官方页面：** [ViewToken Object Type · React Native](https://reactnative.dev/docs/viewtoken)  
**源页代码覆盖：** onViewableItemsChanged 回调中的 ViewToken 形状、index/isViewable/item/key/section 字段和相关列表组件；页面无额外应用代码。

## 列表可见项标记

**ViewToken** 是 FlatList、SectionList、VirtualizedList 的 onViewableItemsChanged 回调内容之一，描述某个数据项当前是否进入可见区域。它让列表可以做曝光统计、懒加载或当前项状态跟踪。

单个 token 的典型结构如下。`section` 只会在 SectionList 中出现：

    const token = {
      item: { key: 'key-12' },
      key: 'key-12',
      index: 11,
      isViewable: true,
      // section: currentSection, // SectionList 中可选
    };

    function onViewableItemsChanged({ viewableItems, changed }) {
      for (const token of changed) {
        if (token.isViewable) {
          reportImpression(token.key, token.item);
        }
      }
    }

| 字段 | 含义 |
|---|---|
| **index** | 数据项索引；可选数字。 |
| **isViewable** | 是否至少有一部分进入列表视口，必填 boolean。 |
| **item** | 行数据，必填。 |
| **key** | 提取到顶层的 React key，必填字符串。 |
| **section** | 使用 SectionList 时所在分组数据，可选。 |

## 本模块终点

官方 footer 的 Next 链到此结束；本页 footer 未提供 Next。该模块从 ActivityIndicator 延伸到组件、原生组件、refs 节点和对象类型参考，共 41 页。

## 代码覆盖清单

源页提供 ViewToken 数据形状示例而没有独立完整列表应用。本文重写可见项回调并逐项覆盖所有 5 个字段及其适用组件。

**翻页：** [上一页：040 TargetEvent](040-TargetEvent.md) · [目录](README.md) · **无后续页面，已到官方 Next 链终点** · [返回目录](README.md)
