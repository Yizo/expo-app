# 237｜Expo Structured Field Values（HTTP 结构化字段值）

**翻页：**[上一页：Expo Updates v1 OTA 更新协议](./236-Expo-Updates-v1.md) · [目录](./README.md) · [下一页：Expo CLI](./238-Expo-CLI.md)

**官方页面：**[Expo Structured Field Values](https://docs.expo.dev/technical-specs/expo-sfv-0/)

**规范版本：**Version 0。官方页面注明其基于 IETF RFC 8941 的工作版本，只实现其中一部分；官方页面标注最后更新：2026-07-27。

## 它是什么

HTTP header 通常是字符串，但有时一个头需要表达布尔值、数值、多个键值或嵌套信息。**Structured Field Values（SFV，结构化字段值）**为这类 HTTP 字段规定统一语法，减少不同服务器和客户端各自解析字符串产生的歧义。

Expo 维护此规范的自定义版本，因为 RFC 8941 当时仍在演进。Expo SFV v0 只支持下列 RFC 子集：

- 所有 key/value 形式。
- 字符串、整数和小数项目。
- Dictionaries（字典）。

它不是一个独立的网络传输协议，而是约定 HTTP header 中结构化数据如何书写和解析的语法。

## 与 Expo Updates 的关系

Expo Updates v1 使用 Expo SFV 表示 `expo-expect-signature`、`expo-signature`、`expo-manifest-filters` 和 `expo-server-defined-headers` 等 HTTP 字段。比如：

```http
expo-expect-signature: sig, keyid="root", alg="rsa-v1_5-sha256"
```

这条 header 表示一个字典：`sig` 是一个 key；`keyid` 和 `alg` 后跟字符串值。具体字段的协议语义由 Expo Updates 规范定义，SFV 只负责规范这些值的语法。

## 给应用开发者的说明

通常不需要在普通 Expo 应用代码中直接实现 SFV。阅读 Expo Updates 协议、开发自建更新服务器，或处理相关请求头时，才需要了解 Expo 支持的字段格式。不要假定 Expo SFV v0 等同于完整 RFC 8941；实现时应只依赖 Expo 页面列出的子集。

## 本页代码覆盖

官方页面没有独立代码示例；本文引用 Expo Updates v1 中的 `expo-expect-signature` 请求头，说明 SFV 字典在实际更新协议中的用法。

**翻页：**[上一页：Expo Updates v1 OTA 更新协议](./236-Expo-Updates-v1.md) · [目录](./README.md) · [下一页：Expo CLI](./238-Expo-CLI.md)
