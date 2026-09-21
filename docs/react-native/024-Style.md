# 024 Style

**翻页：** [上一页：023 升级到新版本（Upgrading to New Versions）](023-升级到新版本.md) · [目录](README.md) · [下一页：025 Height and Width](025-HeightAndWidth.md)

**官方页面：** [Style · React Native](https://reactnative.dev/docs/style)  
**源页代码覆盖：** 普通 JavaScript style 对象、camelCase 属性、样式数组最后一项覆盖、`StyleSheet.create` 集中声明，以及组件将外部 style 传给内部视图。

## RN 样式和 CSS 的相似与差异

React Native 核心组件都接受 `style` prop。样式用 JavaScript 值描述，许多属性名和 CSS 类似，但属性名写成 camelCase，例如 `backgroundColor`，而不是 CSS 的 `background-color`。style 对象不等于浏览器 CSS：没有 DOM/CSS cascade 系统，单位、支持的属性、继承行为都按 RN API 理解。

组件复杂后，可以用 `StyleSheet.create` 把多个样式集中定义。样式也可以按数组合并，后面的项优先级更高；常见做法是先放组件默认样式，最后放调用者传来的覆盖样式。

```tsx
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  heading: { fontSize: 20, fontWeight: '700', color: '#263238' },
});

function Card({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.heading}>用户资料</Text>
    </View>
  );
}

export default function Profile() {
  return <Card style={{ backgroundColor: '#edf5ff' }} />;
}
```

这里 `Card` 默认使用白底，父组件传入的样式位于数组最后，会覆盖同名 `backgroundColor`。将 `style` prop 暴露给组件调用方，是 RN 里常见的可组合样式模式；它在视觉上可产生类似 CSS cascade 的覆盖效果，但不是 CSS 继承机制。

文字有专属样式属性，需查看 `Text` 的 API 参考；不要假设所有 CSS 字体属性名和值都与浏览器完全相同。

## 跨平台已知差异

官方页面提醒两处容易从 Web 经验误判的细节：触摸响应区域不会扩展到父视图边界以外；Android 不支持负 margin。遇到布局或触摸边缘问题时，先检查父容器范围与平台能力，再按当前 RN 版本 API 调整。

**翻页：** [上一页：023 升级到新版本（Upgrading to New Versions）](023-升级到新版本.md) · [目录](README.md) · [下一页：025 Height and Width](025-HeightAndWidth.md)
