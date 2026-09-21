# 028 DocumentNodes

**翻页：** [上一页：027 TextNodes](027-TextNodes.md) · [目录](README.md) · [下一页：029 ImageStyleProps](029-ImageStyleProps.md)

**官方页面：** [Document nodes · React Native](https://reactnative.dev/docs/document-nodes)  
**源页代码覆盖：** 完整视图树对应一个 Document node、原生导航下每屏 document、Web-compatible Document/Node 属性方法。

## Document node

**Document node** 代表一棵完整的 native view tree。使用原生导航时，通常每个 screen 有自己的 document；没有原生导航时，全 app 可能只有一个 document，类似 Web 单页应用的 document。

它不是浏览器 DOM document 的复制品。可通过 Element node 的 **ownerDocument** 找到所属文档节点，不能向它增删真实原生视图；组件结构仍由 React 管理。

## Web-compatible API

Document node 提供一部分 Document API：

- 属性：childElementCount、children、documentElement、firstElementChild、lastElementChild。
- 方法：getElementById(id)。

它同时继承 Node 属性：childNodes、firstChild、lastChild、nextSibling、isConnected、nodeName、nodeType、nodeValue、ownerDocument、parentElement、parentNode、previousSibling、textContent；以及 compareDocumentPosition()、contains()、getRootNode()、hasChildNodes()。

    const doc = elementRef.current?.ownerDocument;
    const rootElement = doc?.documentElement;
    const target = doc?.getElementById('search-field');

使用该兼容 API 可在调试或平台桥接场景查找节点；界面更新仍应通过 React props/state，而不是把 document API 当作浏览器 DOM mutation 使用。

## 代码覆盖清单

源页是 API 参考页，没有独立 JSX 示例；本文说明 native navigation 下的 document 范围、列出 Document 和继承 Node 的属性/方法，并给出 ref 查询示例。

**翻页：** [上一页：027 TextNodes](027-TextNodes.md) · [目录](README.md) · [下一页：029 ImageStyleProps](029-ImageStyleProps.md)
