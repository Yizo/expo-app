# 059 Appendix

**翻页：** [上一页：058 Advanced Topics on Native Components](058-AdvancedNativeComponents.md) · [目录](README.md) · [下一页：060 Create a Library for Your Module](060-CreateLibraryForModule.md)

**官方页面：** [Appendix · React Native](https://reactnative.dev/docs/appendix)  
**源页代码覆盖：** 页面无独立可运行代码块；本地表格整理了 Flow/TypeScript spec 类型、nullable 写法与 Android Java/iOS Objective-C 对应类型，并释义 Native Module/Component 术语。

## Codegen 术语

- **Spec（规范）**：用 TypeScript 或 Flow 编写、描述 Turbo Native Module / Fabric Native Component JS API 的类型文件。Codegen 以此生成原生样板代码。
- **Native Module**：无 UI 的原生库，JS 侧通过函数和对象调用，例如存储、通知和网络事件。
- **Native Component**：以 React Component API 暴露给 JS 的原生 platform view。
- **Legacy Native Module/Component**：基于旧架构的实现；RN 新架构为许多旧库提供 interop，但长期应看社区库和迁移支持。

## Spec 类型与平台类型映射

不同类型能否出现在 Turbo Module spec 中、是否可空，以及最终映射为 Android/iOS 类型都不同。下表按页面中的 Codegen typings 重新排版；请以目标 RN 版本 Codegen 支持列表为准。

| Spec 类型 | Flow 可空形式 | TypeScript 可空形式 | Android/Java 映射 | iOS/Objective-C 映射 |
|---|---|---|---|---|
| `string` | `?string` | `string \| null` | `String` | `NSString` |
| `boolean` | `?boolean` | `boolean \| null` | `Boolean` | `NSNumber` |
| Object literal | `?{\| foo: string \|}` | nullable object literal | 表格未给出直接映射 | 表格未给出直接映射 |
| `Object` | `?Object` | `Object \| null` | `ReadableMap` | 未类型化字典（`NSDictionary` / `@` 映射） |
| `Array<T>` | `?Array<T>` | `Array<T> \| null` | `ReadableArray` | `NSArray` |
| `Function` | `?Function` | `Function \| null` | 表格未给出 | 表格未给出 |
| `Promise<T>` | `?Promise<T>` | `Promise<T> \| null` | React Native `Promise` | resolve/reject block |
| Type union（如 `'SUCCESS' \| 'FAIL'`） | 通常用于 callback 限定 | 通常用于 callback 限定 | 限制较多 | 限制较多 |
| Callback（如 `() =>`） | 可空支持 | 可空支持 | `Callback` | `RCTResponseSenderBlock` |
| `number` | 不支持可空写法 | 不支持可空写法 | `double` | `NSNumber` |

**Nullable（可空类型）** 表示这个值除指定类型外还可能为 null。Flow 用前缀 `?`；TypeScript 常写 `T | null`。平台端 API 类型不完全一样，Codegen 帮助生成互通边界。

官方建议尽量使用带明确字段的 **Object literal**，而不是含糊的 `Object`；例如 `{ foo: string }` 能让 spec 清楚声明结构。`Object` 更像任意 map，在原生边界上会退化成较弱类型（Android `ReadableMap` / iOS 字典）。

JSI/Codegen 类型支持范围不是“TypeScript 可写什么，原生都能接收什么”。写自定义模块时，先选 Codegen 支持的类型，随后根据 Android/iOS API 处理为对应平台对象。

**翻页：** [上一页：058 Advanced Topics on Native Components](058-AdvancedNativeComponents.md) · [目录](README.md) · [下一页：060 Create a Library for Your Module](060-CreateLibraryForModule.md)
