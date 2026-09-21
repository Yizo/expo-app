# 005 ImageBackground

**翻页：** [上一页：004 Image](004-Image.md) · [目录](README.md) · [下一页：006 KeyboardAvoidingView](006-KeyboardAvoidingView.md)

**官方页面：** [ImageBackground · React Native](https://reactnative.dev/docs/imagebackground)  
**源页代码覆盖：** 网页 background-image 对应场景、children 图层、必须设置的尺寸，以及 Image props / `imageStyle` / `imageRef` / View `style`。

## 页面状态：已弃用

RN 0.87 官方页标题带弃用标记，正文建议用 `View` 作为容器，并把 `Image` 绝对定位为背景。`ImageBackground` 曾是给熟悉 CSS `background-image` 的 Web 开发者的方便封装：图片在后，children 作为内容覆盖其上；本身实现较基础。新 UI 优先按下方 `View + Image` 的层次写法。

```tsx
import { Image, Text, View } from 'react-native';

export function HeroCard() {
  return (
    <View style={{ width: '100%', height: 220, justifyContent: 'flex-end' }}>
      <Image
        source={require('./assets/hero.jpg')}
        resizeMode="cover"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        accessible={false}
      />
      <Text style={{ color: 'white', padding: 16 }}>山间旅程</Text>
    </View>
  );
}
```

旧代码仍可用 `ImageBackground` 并嵌套子组件，但必须给它明确 width/height 或可计算的尺寸，不能期待它像 CSS 背景那样自动填充任意父级：

```tsx
<ImageBackground
  source={require('./assets/hero.jpg')}
  resizeMode="cover"
  style={{ width: '100%', height: 220 }}
  imageStyle={{ borderRadius: 16 }}
  imageRef={imageRef}
>
  <Text>叠加内容</Text>
</ImageBackground>
```

`ImageBackground` 继承 `Image` 的 source、网络加载和显示 props，额外提供 `imageStyle` 给内层图片、`imageRef` 给内层 Image 的 ref；自身 `style` 是外层 View 的样式。

**翻页：** [上一页：004 Image](004-Image.md) · [目录](README.md) · [下一页：006 KeyboardAvoidingView](006-KeyboardAvoidingView.md)
