# 027 TextNodes

**翻页：** [上一页：026 ElementNodes](026-ElementNodes.md) · [目录](README.md) · [下一页：028 DocumentNodes](028-DocumentNodes.md)

**官方页面：** [Text nodes · React Native](https://reactnative.dev/docs/text-nodes)  
**源页代码覆盖：** 文本节点不能独立 ref、从 element 的 childNodes 访问、CharacterData 与 Node 的兼容属性/方法。

## 文本节点

Text node 表示原生视图树中的原始文字片段。它类似 DOM 中的 Text node，不是可独立接 ref 的原生组件。需要读取文字节点时，先拿到父级 Element ref，再从它的 **childNodes** 查找；正常显示文字仍应使用 RN 的 Text 组件。

    const labelRef = useRef<Text>(null);

    function readChildTree() {
      const nodes = labelRef.current?.childNodes;
      console.log(nodes);
    }

    <Text ref={labelRef}>状态：已完成</Text>

## Web-compatible API

| 节点接口 | 可访问项 |
|---|---|
| **CharacterData 属性** | data、length、nextElementSibling、previousElementSibling。 |
| **CharacterData 方法** | substringData()。 |
| **Node 属性** | childNodes、firstChild、lastChild、nextSibling、previousSibling、isConnected、nodeName、nodeType、nodeValue、ownerDocument、parentElement、parentNode、textContent。 |
| **Node 方法** | compareDocumentPosition()、contains()、getRootNode()、hasChildNodes()。 |

未挂载节点调用 getRootNode() 时会返回节点本身。ownerDocument 指向渲染该组件的 document node。

## 代码覆盖清单

源页只有 API 参考，没有独立代码块；本文示范从元素 ref 访问 childNodes，并列出 CharacterData 和 Node 的全部属性/方法分类。

**翻页：** [上一页：026 ElementNodes](026-ElementNodes.md) · [目录](README.md) · [下一页：028 DocumentNodes](028-DocumentNodes.md)
