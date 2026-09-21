# 047 JavaScript Environment

**翻页：** [上一页：046 Profiling](046-Profiling.md) · [目录](README.md) · [下一页：048 Timers](048-Timers.md)

**官方页面：** [JavaScript Environment · React Native](https://reactnative.dev/docs/javascript-environment)  
**源页代码覆盖：** Hermes/JSC/V8 运行时说明、Babel 语法转换清单（ES5 至 ES2022/提案及 JSX/Flow/TS）、RN 常用 polyfill 与 `__DEV__`。

## 运行时、Babel 与 Polyfill 是三件事

- **JavaScript Runtime（运行时）** 执行 JS 程序。RN 新项目默认用 Hermes；关闭 Hermes 时可用 JavaScriptCore（JSC）。网页调试器历史上还可能让 JS 在 Chrome/V8 内执行，但 RN 0.79 已删除远程 JS Debugging，所以不能在当前工程里假设这一调试模式可用。
- **Babel** 在构建时改写新语法，令 bundle 能运行在项目支持的 JavaScript 引擎上。RN 项目通过 `@react-native/babel-preset` 管理转换能力。
- **Polyfill（填充实现）** 是在目标运行时缺少某 API 时补上的兼容实现。它和语法转换不同：前者补运行时能力，后者改写代码语法。

同一 JavaScript 代码可能在 Hermes、JSC、Web/V8 环境的边缘行为不同。尽量使用标准语言能力，别依赖某个引擎的私有细节。官方页面中提到 Chrome runtime 的说明与 0.79 已移除远程调试页面存在历史文档不一致，应以前者“remote debugging removed”的当前调试指南为准。

## RN/Babel 转换语法范围

RN 使用 Babel，可以较早使用常见 JS 语法，再转换以兼容目标 runtime。官方列出如下转换类别，项目实际版本以 `@react-native/babel-preset` 为准：

| 语法阶段 | 页面列出的主要特性 | 示例 |
|---|---|---|
| ES5 / 兼容细节 | 保留字处理 | `promise.catch(function () {})` |
| ES2015 / ES6 | 箭头函数、块级作用域、spread、class、计算属性、常量、解构、for-of、函数名、二进制/八进制/Unicode 字面量、模块、简写方法/属性、默认/剩余参数、sticky/Unicode 正则、模板字符串 | `const {id} = props; const next = [...items, item];` |
| ES2016 / ES7 | 幂运算符 | `const square = value ** 2;` |
| ES2017 / ES8 | async/await、函数尾逗号 | `const result = await loadData();` |
| ES2018 / ES9 | 对象 spread | `const copy = {...source, active: true};` |
| ES2019 / ES10 | 可省略 catch 参数 | `try { run(); } catch { recover(); }` |
| ES2020 / ES11 | 动态 import、nullish coalescing、optional chaining | `const title = item?.title ?? '未命名';` |
| ES2022 / ES13 | class fields | `class Cache { value = new Map(); }` |
| 提案与其他语法 | export default from、Babel template、Flow、ESM-to-CJS、JSX、Object.assign、React display name、TypeScript | `const title = <Text>RN</Text>;` |

Transpiler 只保证语法可被处理，不会自动让 Node.js 专用 API（例如直接访问本机文件系统）出现在手机里；语法兼容不等于环境 API 兼容。

## 常用运行时 API 与 Polyfills

RN 默认环境包含浏览器常见的开发 API：CommonJS `require`、`console`、`XMLHttpRequest`、`fetch`、timeout/interval/immediate timers、`requestAnimationFrame`/取消动画帧。

页面列出的标准语言补充包括：

| 标准 | 提供的常用 API |
|---|---|
| ES2015 / ES6 | `Array.from`、`Array.find`、`findIndex`、`Object.assign`、字符串 `startsWith`/`endsWith`/`repeat`/`includes` |
| ES2016 / ES7 | `Array.prototype.includes` |
| ES2017 / ES8 | `Object.entries`、`Object.values` |
| RN 开发变量 | `__DEV__` 表示当前是否为开发构建，可用于只在开发期启用日志或提示 |

示意：

```ts
if (__DEV__) {
  console.info('调试信息仅在开发构建输出');
}

const normalized = Object.fromEntries(
  Object.entries(config).filter(([key]) => key.startsWith('feature'))
);
```

这份列表是 RN 文档页面列出的环境能力，不意味着浏览器的 `window`、DOM、`localStorage` 或 Node 的任意内建模块都存在。

**翻页：** [上一页：046 Profiling](046-Profiling.md) · [目录](README.md) · [下一页：048 Timers](048-Timers.md)
