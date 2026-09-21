# 042 global

**翻页：** [上一页：041 FormData](041-FormData.md) · [目录](README.md) · [下一页：043 Headers](043-Headers.md)

**官方页面：** [global · React Native](https://reactnative.dev/docs/global-global)  
**源页代码覆盖：** global 是 globalThis 的 legacy alias，推荐全局对象 globalThis；源页无独立代码示例。

## 全局对象的名称

RN globals 中的 **global** 是历史兼容别名，语义相当于 **globalThis**。React Native 官方建议新代码使用 globalThis。

    const host = globalThis;

不需要为了普通模块状态而把数据挂到全局对象；优先用模块作用域、React context 或明确的状态管理。

## 代码覆盖清单

源页只有 alias 关系和推荐命名，没有代码块；本文提供最小原创示例并标注 global 的 legacy 身份。

**翻页：** [上一页：041 FormData](041-FormData.md) · [目录](README.md) · [下一页：043 Headers](043-Headers.md)
