# 038 ReactNode

**翻页：** [上一页：037 PressEvent](037-PressEvent.md) · [目录](README.md) · [下一页：039 Rect](039-Rect.md)

**官方页面：** [React Node Object Type · React Native](https://reactnative.dev/docs/react-node)  
**源页代码覆盖：** React Node 可接受值类型；该类型页没有 API 示例。

## RN children 可以是什么

**React Node** 是 React 渲染树中可作为 children 的值。RN 中允许：

- boolean（不会输出 UI）
- null 或 undefined（不会输出 UI）
- number
- string
- JSX 产生的 React element
- 上述值构成的数组，包括嵌套数组

    const content: React.ReactNode = [
      '已加载 ',
      3,
      <Text key="unit"> 条结果</Text>,
      false,
      null,
    ];

布尔值常用于条件渲染，但注意 **{count && <Text>...</Text>}** 在 count 为 0 时可能把数字 0 渲染出来；可显式转成布尔条件或用三元表达式。

## 代码覆盖清单

官方页没有代码块；本文以原创 ReactNode 示例覆盖类型清单并说明 boolean/nullish 不输出内容。

**翻页：** [上一页：037 PressEvent](037-PressEvent.md) · [目录](README.md) · [下一页：039 Rect](039-Rect.md)
