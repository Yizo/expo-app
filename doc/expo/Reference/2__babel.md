# `babel.config.js`：Expo 项目的 Babel 配置参考

## 文档解决的问题

本文说明 Expo 项目中的 Babel 配置机制，主要解决以下问题：

- Babel 在 Expo 项目中负责什么工作？
- 新建 Expo 项目是否需要手动配置 Babel？
- 什么时候需要创建 `babel.config.js`？
- 如何生成并修改该配置文件？
- 修改配置后，如何确保 Metro 使用最新配置？
- Expo 默认的 `babel-preset-expo` 提供了哪些能力？

这是一篇配置参考文档，适合需要自定义 Babel 行为的 Expo 项目。当前文档未涉及具体 Babel 插件的安装、插件参数配置、配置迁移或故障排查。

---

## 阅读前需要理解的背景知识

### Babel 是什么

Babel 是 JavaScript 编译器。它可以把现代 JavaScript 语法转换成目标 JavaScript 引擎能够执行的形式。

在 React Web 项目中，Babel 通常隐藏在 Vite、Webpack、Next.js 等构建工具背后。例如，你编写 JSX 或较新的 JavaScript 语法，构建工具会在打包过程中完成转换。

Expo 项目中的作用类似，但目标运行环境有所不同：

- React Web 的主要目标通常是浏览器。
- React Native / Expo 的主要目标包括移动设备上的 JavaScript 引擎。
- Expo 也支持 Web，因此其 Babel 预设还包含部分针对 Web 构建的处理。

原文明确说明：Babel 会将现代 JavaScript（ES6 及以上）转换成与移动设备 JavaScript 引擎兼容的版本。

### Metro 是什么

Metro 是 React Native 和 Expo 项目常用的 JavaScript 打包工具。

对 React Web 开发者，可以把它大致理解成 React Native 生态中的 Vite 或 Webpack：它会读取应用代码、处理模块依赖，并生成可供应用运行的 JavaScript 包。

不过，Metro 与 Vite、Webpack 并不是完全等价的工具，配置格式和运行机制也不同。本文只涉及如何在修改 Babel 配置后重启 Metro 并清除其缓存，没有展开 Metro 的其他功能。

### Preset 是什么

Babel 的 preset（预设）是一组预先组合好的 Babel 配置和转换规则。

使用 preset 的目的，是避免开发者逐个安装和配置大量 Babel 插件。Expo 默认使用 `babel-preset-expo`，因此通常不需要手动决定如何转换 React Native 和 Expo 代码。

---

## Expo 默认如何配置 Babel

使用以下命令创建新的 Expo 项目时，Expo 会自动完成 Babel 配置：

```sh
npx create-expo-app
```

新项目默认使用：

```text
babel-preset-expo
```

因此，在没有自定义需求的情况下，不需要手动创建 `babel.config.js`。

这是本文最重要的默认原则：

> 不要仅仅因为项目使用了 Babel，就主动创建 `babel.config.js`。只有需要自定义 Babel 配置时才需要创建它。

对于习惯 React Web 工具链的开发者，这一点尤其重要。某些 Web 项目会在仓库中直接提供 Babel 配置文件，但 Expo 可以通过默认约定提供配置，因此项目根目录没有 `babel.config.js` 并不代表 Babel 没有工作。

---

## 创建 `babel.config.js`

当项目需要自定义 Babel 配置时，在项目根目录运行：

```sh
npx expo customize babel.config.js
```

该命令会在项目根目录生成：

```text
babel.config.js
```

这里的“项目根目录”通常是包含 `package.json` 的目录。

生成的默认配置如下：

```js
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
  };
};
```

### 配置结构说明

#### `module.exports`

```js
module.exports = function (api) {
  // ...
};
```

配置使用 CommonJS 模块格式导出一个函数。Babel 调用该函数并传入 `api` 对象，函数返回最终配置。

不要因为业务代码使用 ES Modules，就直接假定这里也应该改成 `export default`。原文给出的标准配置使用 `module.exports`。

#### `api.cache(true)`

```js
api.cache(true);
```

这一行启用 Babel 配置结果缓存。

这样 Babel 不必在每次处理文件时都重新计算配置，有助于减少重复工作。

原文只给出了该默认写法，没有介绍其他缓存策略或动态配置方式。

#### `presets`

```js
presets: ['babel-preset-expo']
```

`presets` 用于声明 Babel 预设。Expo 默认预设必须保留为：

```text
babel-preset-expo
```

原文没有说明删除或替换该预设会产生什么具体结果。因此，除非所使用的工具或插件明确要求，否则不应仅凭猜测移除它。

---

## 修改配置后的必要操作

修改 `babel.config.js` 后，需要重启 Metro，并清除 Metro 缓存：

```sh
npx expo start --clear
```

其中：

- `npx expo start`：启动 Expo 开发服务器和 Metro。
- `--clear`：清除 Metro 已有缓存，使其重新读取并应用 Babel 配置。

建议先停止当前正在运行的 Metro 进程，再执行该命令。

如果修改配置后只刷新应用，Metro 可能继续使用缓存中的旧转换结果，导致开发者误以为配置无效。原文因此明确要求同时重启 Metro并使用 `--clear`。

---

## `babel-preset-expo`

`babel-preset-expo` 是 Expo 项目的默认 Babel 预设。

它建立在 React Native 默认预设之上：

```text
@react-native/babel-preset
```

可以将两者的关系理解为：

```text
@react-native/babel-preset
          ↓ 扩展
babel-preset-expo
          ↓ 默认用于
       Expo 项目
```

除了继承 React Native 的基础转换能力，`babel-preset-expo` 还增加了以下支持。

### Decorators

Decorators 通常译为“装饰器”，是一种用于声明式修改类及其成员行为的语法或编程模式。

原文只说明该预设提供装饰器支持，没有说明支持的具体装饰器版本、配置选项或使用示例。因此，不能仅根据本文判断某个装饰器库是否可以直接使用。

### Web 库的 Tree Shaking

Tree shaking 是构建过程中删除未使用代码的优化机制。

`babel-preset-expo` 支持对 Web 库进行 tree shaking，从而帮助减少 Expo Web 构建中不必要的代码。

需要注意，这不等于“项目中的所有未使用代码都会被 Babel 自动删除”。原文只明确提到对 Web 库 tree shaking 的支持，没有提供覆盖范围和效果保证。

### 加载字体图标

该预设支持字体图标的加载。

字体图标通常是把图标字形存放在字体文件中，再通过图标名称或字符映射进行显示。原文没有介绍具体图标库、字体文件配置方式或加载 API。

---

## 完整操作流程

需要自定义 Expo 项目的 Babel 配置时，可以按以下流程操作：

1. 确认确实存在自定义需求。
2. 进入包含 `package.json` 的项目根目录。
3. 生成配置文件：

```sh
npx expo customize babel.config.js
```

4. 保留默认的 `babel-preset-expo`，在此基础上添加所需配置。
5. 修改完成后停止当前 Metro 进程。
6. 清除缓存并重新启动：

```sh
npx expo start --clear
```

7. 在应用中验证相关语法或插件行为是否生效。

第 7 步属于**基于文档内容推导**：原文要求重启并清除缓存，但没有描述具体的验证方法。

---

## 注意事项与容易踩坑的地方

### 没有配置文件不代表没有 Babel

Expo 新项目已经自动配置 Babel。只有需要定制时，才需要显式生成 `babel.config.js`。

### 配置文件必须位于项目根目录

生成命令会把文件放到项目根目录。不要随意将它放到 `src`、`app` 或其他业务代码目录。

### 不要随意删除默认 preset

默认配置中的：

```js
presets: ['babel-preset-expo']
```

承载了 Expo 和 React Native 所需的基础转换能力。

“应优先保留默认 preset”是**基于文档内容推导**：原文说明它是 Expo 默认预设并扩展了 React Native 预设，但没有逐项说明删除后的后果。

### 修改配置后不能只刷新页面或应用

Babel 配置属于构建工具配置，不是普通的 React 组件代码。修改后需要重启 Metro，并通过 `--clear` 清除缓存。

这类似于 React Web 项目修改 Vite 或 Webpack 配置后，通常需要重新启动开发服务器，而不是只依赖热更新。

### 不要从本文推断所有 Babel 插件都与 Expo 兼容

本文只介绍默认配置和默认预设，没有说明第三方 Babel 插件的兼容性、安装方式及其与 Metro 的关系。使用第三方插件时，需要查阅对应插件及 Expo 的相关文档。

---

## React Web 开发者需要特别注意的地方

| React Web 中可能形成的认知 | Expo 中需要建立的认知 |
| --- | --- |
| JavaScript 主要编译给浏览器执行 | Expo 代码还需要适配移动设备上的 JavaScript 引擎 |
| Babel 配置文件通常由 Web 框架或脚手架生成 | Expo 默认配置可能存在，但项目中没有显式配置文件 |
| 修改构建配置后重启 Vite 或 Webpack | 修改 Babel 配置后需要重启 Metro，并使用 `--clear` |
| 常见预设可能是 `@babel/preset-env`、`@babel/preset-react` | Expo 默认使用 `babel-preset-expo` |
| Tree shaking 通常让人联想到 Web 打包器 | Expo 的默认 Babel 预设也包含针对 Web 库 tree shaking 的支持 |

还要避免把 Metro 理解为浏览器开发服务器。它承担 React Native JavaScript 模块打包工作，最终代码并不一定运行在浏览器环境中。

---

## 实际开发中如何使用这些知识

正常创建 Expo 项目后，优先使用默认 Babel 配置。只有当第三方库、编译插件或项目语法明确要求修改 Babel 时，再生成 `babel.config.js`。

**基于经验建议：**

- 修改前查阅相关工具对 Expo 和 React Native 的官方配置说明。
- 在默认配置上做最小增量修改。
- 一次只引入一项配置，随后清除缓存并验证。
- 不要直接复制普通 React Web 项目的 Babel 配置覆盖 Expo 默认配置。
- 将 `babel.config.js` 纳入版本控制，确保团队和构建环境使用同一配置。

这些建议不是原文逐条给出的要求，而是根据其默认配置方式和 Metro 缓存机制整理出的实践建议。

---

## 文档明确说明与推导内容

### 文档明确说明

- Babel 用于将现代 JavaScript 转换为移动设备 JavaScript 引擎兼容的版本。
- `npx create-expo-app` 创建的 Expo 项目会自动配置 Babel。
- Expo 默认使用 `babel-preset-expo`。
- 没有自定义需求时，不需要创建 `babel.config.js`。
- 可以通过 `npx expo customize babel.config.js` 生成配置文件。
- 配置文件生成在项目根目录。
- 修改配置后需要重启 Metro，并使用 `npx expo start --clear` 清除缓存。
- `babel-preset-expo` 扩展了 `@react-native/babel-preset`。
- 该预设增加了装饰器、Web 库 tree shaking 和字体图标加载支持。

### 基于文档内容推导

- 应以默认配置为基础进行增量修改。
- 不应在不了解影响的情况下删除 `babel-preset-expo`。
- 清除缓存后，还应通过实际代码验证配置是否生效。
- Expo 项目中没有 `babel.config.js` 并不表示 Babel 未启用。

### 当前文档未涉及

- Babel 插件的安装和配置示例。
- 装饰器的具体版本及语法。
- `babel-preset-expo` 的完整配置参数。
- Metro 的详细工作原理和配置方式。
- Babel 配置错误的故障排查。
- iOS 与 Android 之间是否存在 Babel 配置差异。
- 生产构建中的缓存和优化策略。
- 第三方 Babel 插件的 Expo 兼容性。

---

## 总结

Expo 默认已经配置 Babel，并通过 `babel-preset-expo` 提供 React Native 基础转换以及 Expo 需要的额外能力。大多数项目不需要显式的 `babel.config.js`。

当项目确实需要自定义 Babel 时，使用：

```sh
npx expo customize babel.config.js
```

生成配置文件，并保留默认的：

```js
presets: ['babel-preset-expo']
```

每次修改配置后，通过以下命令重启 Metro 并清除缓存：

```sh
npx expo start --clear
```

---

## 文档导航

- **上一页**：[app](./1__app.md)
- **下一页**：[metro](./3__metro.md)
