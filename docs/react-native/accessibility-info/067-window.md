# 067 window

**翻页：** [上一页：066 WebSocket](066-WebSocket.md) · [目录](README.md) · [下一页：068 XMLHttpRequest](068-XMLHttpRequest.md)

**官方页面：** [window · React Native](https://reactnative.dev/docs/global-window)  
**源页代码覆盖：** 无代码示例；说明 window 是 globalThis 的旧 alias，推荐 globalThis。

## 全局对象别名

React Native 文档指出 **window** 是依 Web specifications 定义的 **globalThis** 别名。RN 是 native runtime；window 不是浏览器 DOM Window，不能据此推断 document、DOM 查询或浏览器页面能力存在。

新代码推荐使用 **globalThis**。避免把 Web 中访问 window/document 的代码不经平台检查搬进原生模块。

## 代码覆盖清单

源页无代码/API；本文解释 alias 与 native/Web 边界。

**翻页：** [上一页：066 WebSocket](066-WebSocket.md) · [目录](README.md) · [下一页：068 XMLHttpRequest](068-XMLHttpRequest.md)
