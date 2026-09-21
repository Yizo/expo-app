# 005 使用 `ScrollView`（Using a ScrollView）

**翻页：** [上一页：004 处理文本输入（Handling Text Input）](004-处理文本输入.md) · [目录](README.md) · [下一页：006 使用列表视图（Using List Views）](006-使用列表视图.md)

**官方页面：** [Using a ScrollView · React Native](https://reactnative.dev/docs/using-a-scrollview)
**源页代码覆盖：** 竖向混排 ScrollView、horizontal 横向滚动、pagingEnabled 分页、iOS minimumZoomScale/maximumZoomScale 缩放。
**说明：** 中文释义与重写代码；官方组件属性的兼容平台信息请查对应版本 API。

## 用途与重要性能差异

`ScrollView` 是可以滚动的容器，内部能够混排多种组件，比如文字、图片和卡片；可以竖向滚动，也可以设置 `horizontal` 做横向滚动。用 `pagingEnabled` 时，滑动可按页面/子视图分页。在 iOS 上，页面也说明了对单个子内容设置 `minimumZoomScale` 与 `maximumZoomScale` 来允许捏合缩放。

关键限制：`ScrollView` 会一次渲染其中所有子元素，即便某些元素还在屏幕外。因此它适合内容数量有限、总量可控的页面。若要显示大量同构数据，优先学习下一页的 `FlatList`；列表虚拟化可避免把所有行同时挂在原生视图树里。

## 混排内容示例

```tsx
import { Image, ScrollView, Text, View } from 'react-native';

const photos = [
  { id: 'north', label: '山间清晨', uri: 'https://example.com/morning.jpg' },
  { id: 'shore', label: '海边傍晚', uri: 'https://example.com/evening.jpg' },
];

export default function TravelStory() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text>旅途片段</Text>
      {photos.map(photo => (
        <View key={photo.id} style={{ marginTop: 16 }}>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: '100%', height: 220 }}
            resizeMode="cover"
          />
          <Text>{photo.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```

## 横向分页与 iOS 缩放

横向分页是容器级设置；iOS 图片缩放也通过 `ScrollView` 属性配置。平台专属属性需要查看 RN 当前版本 API，并在其他系统上验证降级行为。

```tsx
import { Image, ScrollView, View } from 'react-native';

function StoryPager() {
  return (
    <ScrollView horizontal pagingEnabled>
      <View style={{ width: 320 }}><Image source={require('./page-one.png')} /></View>
      <View style={{ width: 320 }}><Image source={require('./page-two.png')} /></View>
    </ScrollView>
  );
}

function ZoomablePhoto() {
  return (
    <ScrollView minimumZoomScale={1} maximumZoomScale={3}>
      <Image source={require('./large-photo.png')} />
    </ScrollView>
  );
}
```

**翻页：** [上一页：004 处理文本输入（Handling Text Input）](004-处理文本输入.md) · [目录](README.md) · [下一页：006 使用列表视图（Using List Views）](006-使用列表视图.md)
