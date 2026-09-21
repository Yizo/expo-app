# 056 Advanced Topics on Native Modules Development

**翻页：** [上一页：055 Cross-Platform Native Modules (C++)](055-CrossPlatformNativeModulesCpp.md) · [目录](README.md) · [下一页：057 Fabric Native Components Introduction](057-FabricNativeComponentsIntroduction.md)

**官方页面：** [Advanced Topics on Native Modules Development · React Native](https://reactnative.dev/docs/the-new-architecture/advanced-topics-modules)  
**源页代码覆盖：** 官方页本身没有代码块；它是高级 Native Module 主题索引，列出自定义 C++ 类型、Module 中使用 Swift、自定义事件和 Native Module 生命周期四个后续主题。

## 什么时候读这部分

本页假定读者已经了解 React Native Codegen 与 Turbo Native Module。它汇总编写复杂模块时的后续专题；做普通 RN App 页面不需要先学这些原生层内容。

## 四个高级主题

- **自定义 C++ 类型：** 让 Turbo Module spec/native 实现传递基础类型之外的数据结构。
- **在 Module 使用 Swift：** 用 Swift 写 iOS 模块实现并连接 RN 原生入口。
- **从 Native Module 发事件：** 当原生数据变化需要通知 JS 时建立事件路径。
- **Native Module 生命周期：** 处理模块何时创建、启动、停用/销毁以及相关资源清理。

每项都有独立 Next/侧栏文档。本轮继续按当前页面的 Next 单链导航进入 **Android & iOS** 页面；以上其他链接作为该页面的补充分支，不纳入本次单链编号。

**翻页：** [上一页：055 Cross-Platform Native Modules (C++)](055-CrossPlatformNativeModulesCpp.md) · [目录](README.md) · [下一页：057 Fabric Native Components Introduction](057-FabricNativeComponentsIntroduction.md)
