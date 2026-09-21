# 058 Advanced Topics on Native Components

**翻页：** [上一页：057 Fabric Native Components Introduction](057-FabricNativeComponentsIntroduction.md) · [目录](README.md) · [下一页：059 Appendix](059-CodegenAppendix.md)

**官方页面：** [Advanced Topics on Native Modules Development · React Native](https://reactnative.dev/docs/the-new-architecture/advanced-topics-components)  
**源页代码覆盖：** 官方索引页没有代码块；列出 Fabric Native Component 的直接操作、测量布局、从 JS 调用原生组件方法三个后续专题。

## 进阶组件主题

此页假定已经阅读 React Native Codegen 与 Fabric Native Components 入门。它把复杂 Native Component 需求拆为三条独立专题：

- **Direct Manipulation：** 绕过 React props/state 更新原生视图实例。用于少数必须频繁直接操作的情况；一般组件状态仍应通过 React 更新。
- **Measuring the Layout：** 在 JS 获取原生组件的屏幕位置/尺寸，常用于定位浮层或计算锚点。
- **Invoking native functions：** 从 JS 调用原生组件提供的命令式方法。

本页自身没有实现示例。按官方 Next 导航，下一页是 Codegen 附录；上述三个链接属于侧栏补充分支，未插入 Next 单链。

**翻页：** [上一页：057 Fabric Native Components Introduction](057-FabricNativeComponentsIntroduction.md) · [目录](README.md) · [下一页：059 Appendix](059-CodegenAppendix.md)
