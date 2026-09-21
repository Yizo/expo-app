# 009 RefreshControl

**翻页：** [上一页：008 Pressable](008-Pressable.md) · [目录](README.md) · [下一页：010 ScrollView](010-ScrollView.md)

**官方页面：** [RefreshControl · React Native](https://reactnative.dev/docs/refreshcontrol)  
**源页代码覆盖：** ScrollView/List pull-to-refresh、受控 `refreshing`、`onRefresh`、Android colors/enabled/background/offset/size 与 iOS tint/title/titleColor。

## 下拉刷新如何工作

`RefreshControl` 是嵌入 `ScrollView`（也可由列表封装使用）的原生下拉指示器。内容滚到顶端后继续向下拉会触发 `onRefresh`。关键点是 `refreshing` 为**受控 prop**：事件回调里要立刻设 true，异步工作结束再设 false，否则指示器会立即停止。

```tsx
function Feed() {
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<Post[]>([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setItems(await fetchLatestPosts());
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {items.map(post => <PostCard key={post.id} post={post} />)}
    </ScrollView>
  );
}
```

该组件继承 `View` props。

## 可配置属性

| prop | 平台 | 说明 |
|---|---|---|
| `refreshing` | all，必需 | 正在刷新的状态，boolean，由外部 state 控制 |
| `onRefresh` | all | 开始下拉刷新时回调 |
| `colors` | Android | 旋转指示器可轮转使用的一种或多种颜色 |
| `enabled` | Android，默认 true | 是否启用下拉刷新手势 |
| `progressBackgroundColor` | Android | 指示器圆环背景色 |
| `size` | Android，默认 `default` | `default` 或 `large` |
| `progressViewOffset` | all，默认 0 | 指示器距顶部偏移，适配导航栏/内容顶部位置 |
| `tintColor` | iOS | 指示器颜色 |
| `title` | iOS | 指示器下方显示的文字 |
| `titleColor` | iOS | 标题颜色 |

颜色属性使用 RN color 值；iOS 和 Android 的外观/行为不能完全互换，需要两端验证。

**翻页：** [上一页：008 Pressable](008-Pressable.md) · [目录](README.md) · [下一页：010 ScrollView](010-ScrollView.md)
