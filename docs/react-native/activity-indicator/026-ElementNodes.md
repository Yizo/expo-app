# 026 ElementNodes

**翻页：** [上一页：025 NodesFromRefs](025-NodesFromRefs.md) · [目录](README.md) · [下一页：027 TextNodes](027-TextNodes.md)

**官方页面：** [Element nodes · React Native](https://reactnative.dev/docs/element-nodes)  
**源页代码覆盖：** ref 提供原生元素节点、DOM-compatible 属性/方法、ScrollView 内部 node refs、测量布局的 legacy API 与 setNativeProps。

## 元素节点与 ref

**Element node** 代表 native view tree 里的一个原生组件。大多数原生组件以及一些内建 wrapper 都能通过 ref 取得对应 node。不要直接修改节点树；ref 的用途主要是读布局、聚焦、查找 children 或执行特定原生命令。

    const panelRef = useRef<View>(null);

    function measurePanel() {
      panelRef.current?.measureInWindow((x, y, width, height) => {
        console.log({ x, y, width, height });
      });
    }

    <View ref={panelRef}><Text>内容</Text></View>

部分包装组件代表多个原生节点。例如 ScrollView 可通过 **getNativeScrollRef()** 取得滚动器、**getInnerViewRef()** 取得内容容器。

## Web-compatible Element/HTMLElement/Node API

React Native 为 ref 节点提供一部分 DOM 兼容访问：

| API 类别 | 属性/方法 |
|---|---|
| HTMLElement 布局 | offsetHeight、offsetLeft、offsetParent、offsetTop、offsetWidth |
| HTMLElement 焦点 | blur()、focus()；focus(options) 中的 options 不支持 |
| Element 子项/尺寸 | childElementCount、children、clientHeight、clientLeft、clientTop、clientWidth |
| Element 遍历 | firstElementChild、lastElementChild、nextElementSibling、previousElementSibling |
| Element 标识 | id 返回 id 或 nativeID prop；nodeName、nodeType、nodeValue、tagName；tagName 类似 RN:View |
| Element 滚动/文字 | scrollHeight、scrollLeft、scrollTop、scrollWidth、textContent；内建组件中只有 ScrollView 的 scrollLeft/Top 可返回非零值 |
| Element 方法 | getBoundingClientRect()、hasPointerCapture()、setPointerCapture()、releasePointerCapture() |
| Node 遍历 | childNodes、firstChild、lastChild、nextSibling、previousSibling、parentElement、parentNode、ownerDocument、isConnected |
| Node 信息 | nodeName、nodeType、nodeValue、textContent |
| Node 方法 | compareDocumentPosition()、contains()、getRootNode()、hasChildNodes() |

未挂载时，getRootNode() 返回节点自己。上述接口帮助 Web 开发者理解 ref，但并不是完整的浏览器 DOM。

## Legacy 原生命令式 API

Element refs 还保留以下 legacy API：

- **measure(callback)**：读取相对最近原生祖先的布局坐标和尺寸。
- **measureInWindow(callback)**：读取相对应用窗口的坐标和尺寸。
- **measureLayout(relativeToNativeNode, onSuccess, onFail?)**：相对指定原生节点测量。
- **setNativeProps(props)**：绕过 React reconciliation 直接设原生 props；应谨慎使用，避免 React state 和视图值失去同步。

优先使用布局回调/React state 表达可声明 UI，只在需要原生测量或高频直接更新时使用 ref 命令。

## 代码覆盖清单

页面没有单一完整示例；本文重写 measureInWindow 场景，并逐项列出参考 API 所有 Web-compatible 属性/方法及 4 个 legacy 原生命令。

**翻页：** [上一页：025 NodesFromRefs](025-NodesFromRefs.md) · [目录](README.md) · [下一页：027 TextNodes](027-TextNodes.md)
