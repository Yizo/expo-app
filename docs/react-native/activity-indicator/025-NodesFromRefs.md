# 025 NodesFromRefs

**翻页：** [上一页：024 SafeAreaView](024-SafeAreaView.md) · [目录](README.md) · [下一页：026 ElementNodes](026-ElementNodes.md)

**官方页面：** [Nodes from refs · React Native](https://reactnative.dev/docs/nodes)  
**源页代码覆盖：** 原生视图树与 ref、Element/Text/Document 三种节点、Scrollable 容器的内部 native refs、与 Web DOM 的差异、树遍历/布局读取/命令式操作。

## RN 原生视图树中的节点

React Native 最终把 UI 画到原生视图树上，可以通过 React **ref** 读取挂载的原生组件节点。这与 Web 的 DOM ref 有相似之处，但 RN 元素是 native component，不是浏览器 DOM 对象。

源页区分三种 node：

- **Element node** 表示原生组件节点，例如 View；下页详细列出其 ref 属性和方法。
- **Text node** 表示文字内容，不能单独通过 ref 拿到，需从元素的 childNodes 遍历。
- **Document node** 表示完整原生视图树；例如使用原生导航时每个 screen 可能有独立 document。

这些节点可用来遍历渲染树、读布局、调用 focus 等命令式操作。与 Web DOM 不同，RN refs 不允许通过 appendChild 等方式变更 React 管理的树；视图结构仍由 React renderer 管理。

    const cardRef = useRef<View>(null);

    function inspectCard() {
      const root = cardRef.current?.getRootNode();
      const textNodes = cardRef.current?.childNodes;
      console.log(root, textNodes);
    }

    <View ref={cardRef}>
      <Text>原生节点内容</Text>
    </View>

像 ScrollView 这类包装组件内部可能包含不止一个 native view，例如滚动器和内容容器；ref 上的 getNativeScrollRef()/getInnerViewRef() 可取到具体内部节点，不要认为包装组件 ref 永远等于最里层的原生对象。

## 代码覆盖清单

源页无独立可运行代码示例，主要解释 node 类型和 ref；本文用 View ref 展示 getRootNode/childNodes 概念，列出三种节点以及不可通过手动 DOM mutation 修改树的限制。ScrollView 内部 refs 作为特殊场景说明。

**翻页：** [上一页：024 SafeAreaView](024-SafeAreaView.md) · [目录](README.md) · [下一页：026 ElementNodes](026-ElementNodes.md)
