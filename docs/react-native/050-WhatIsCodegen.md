# 050 What is Codegen?

**翻页：** [上一页：049 Using Hermes](049-UsingHermes.md) · [目录](README.md) · [下一页：051 Using Codegen](051-UsingCodegen.md)

**官方页面：** [What is Codegen? · React Native](https://reactnative.dev/docs/the-new-architecture/what-is-codegen)  
**源页代码覆盖：** 官方页面没有代码块；说明 RN build 自动运行 Codegen、`package.json` 指定 spec 搜索目录、Flow/TypeScript 规范文件生成 C++ glue 与平台 Java/Objective-C++ 桥接代码。

## Codegen 的作用

**Codegen（代码生成）** 根据类型化规范文件生成重复性的原生样板代码。它可节省原生模块/组件作者手写桥接代码的工作，但不是必须使用的工具：团队也可以自己维护所有原生代码。

## 它什么时候运行

React Native 每次构建 Android 或 iOS 应用都会自动调用 Codegen。一般应用开发者不用手动运行；Turbo Native Module 或 Fabric Native Component 开发者，有时会手工生成一次来查看实际产生的类型和文件。

## 它从哪里读取定义

Codegen 脚本随 `react-native` npm package 提供，在 App 构建时执行。它从 `package.json` 指定的目录开始扫描符合命名/位置规则的 spec（规范）文件。Spec 是带类型的 JS 文件，目前官方流程支持 Flow 或 TypeScript。

找到 spec 后，Codegen 先生成公共 C++ glue code，再根据平台生成原生包装代码：Android 使用 Java，iOS 使用 Objective-C++。**Glue code** 是连接 JS API 与原生实现的重复桥接层。

**翻页：** [上一页：049 Using Hermes](049-UsingHermes.md) · [目录](README.md) · [下一页：051 Using Codegen](051-UsingCodegen.md)
