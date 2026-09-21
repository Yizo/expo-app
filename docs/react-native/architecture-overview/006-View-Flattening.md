# 006 View Flattening（视图扁平化）

**翻页：** [上一页：005 Cross Platform Implementation](005-跨平台实现.md) · [目录](README.md) · [下一页：007 Threading Model](007-Threading-Model.md)

**官方页面：** [View Flattening · React Native](https://reactnative.dev/architecture/view-flattening)  
**源页代码覆盖：** 嵌套 `View` 的组件示例；官方树结构图说明 layout-only node 合并过程，无其它命令或 API 示例。

## 为什么会有视图扁平化

React 鼓励把 UI 拆成可复用组件，因此 React Element Tree 可能有很多层。有些 `<View>` 只负责 margin、padding 或组织子组件，本身没有背景、边框等独立绘制内容；这类节点称为 **Layout-Only Node（仅布局节点）**。

如果每个 React 元素都创建一个原生 View，深层布局会增加原生视图数量、遍历和布局工作。Fabric Renderer 在 diffing 阶段会把可合并的仅布局节点扁平化，将布局属性合并到相邻可见节点，从而减少实际 Host View 树的深度。

## 组件组合示例

下面将图片和标题放在可复用的标题组件中，再用外层容器添加边距：

```tsx
import { Image, Text, View } from 'react-native';

function TitleBlock() {
  return (
    <View style={{ margin: 10 }}>
      <Image
        source={{ uri: 'https://example.com/product.png' }}
        style={{ width: 96, height: 96 }}
      />
      <Text>商品标题</Text>
    </View>
  );
}

export function ProductCard() {
  return (
    <View>
      <View style={{ margin: 10 }}>
        <TitleBlock />
      </View>
    </View>
  );
}
```

React Element Tree 中可以有多个 View 层，但并不意味着每个都必须成为屏幕上的独立原生 View。Flattening 会根据 `margin`、`padding`、`backgroundColor`、`opacity` 等 props 判断哪些属性可以合并；若某节点确实需要单独绘制或承载交互，它就必须保留。

## 对页面可见效果的影响

扁平化是渲染器内部优化。只要合并后的样式和绘制关系相同，用户看到的 UI 不应发生变化；优化目标是少创建几个不必要的 Host View，而不是改变 React 组件组合方式。

该机制集成在 Renderer 的树差异计算阶段，不需要 app 先跑一遍额外优化器再渲染。实现属于 C++ core，所有受支持的平台共享同一类优化思路。

## 关键名词

- **React Element Tree**：组件执行后得到的 UI 描述树，包含开发者写的组件和 RN Host Component。
- **Layout-Only Node**：只影响排版、自己没有独立可见内容的布局节点。
- **Host View / Host View Tree**：Android / iOS 最终创建并绘制的原生视图及其层级。
- **Diffing**：比较旧树和新树，找出需要对宿主视图做的最小变更集合。
- **View Flattening**：在安全条件下合并布局节点及其属性，减少实际原生视图数量。

## 官方代码主题覆盖

源页的嵌套 React View 示例已用独立 ProductCard / TitleBlock 结构重写；两张官方树图的布局节点合并过程已用文字解释。源页没有其它可执行代码或配置片段。

**翻页：** [上一页：005 Cross Platform Implementation](005-跨平台实现.md) · [目录](README.md) · [下一页：007 Threading Model](007-Threading-Model.md)
