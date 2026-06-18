# 顶层 src 目录

> 原始文档地址：https://docs.expo.dev/router/reference/src-directory/

本文档介绍如何在 Expo Router 的路由设置中使用顶层 `src` 主源文件夹（top-level source directory）。

---

## 什么是 src 目录？

在 Expo 项目中，`src` 目录是一个位于项目根目录下的顶层文件夹，用于集中存放应用的核心源代码，包括路由文件、组件、常量和自定义 Hooks 等。使用 `src` 目录可以让项目结构更加清晰，将源代码与配置文件、构建产物等分隔开来。

> **关键术语解释（面向初学者）**
>
> - **src 目录**：`src` 是 "source"（源代码）的缩写，是项目中存放主要代码文件的文件夹。
> - **路由文件夹（app 目录）**：Expo Router 使用基于文件系统的路由方案，`app` 文件夹中的每个文件自动对应一个页面/路由。
> - **TypeScript 路径别名（Path Aliases）**：允许你使用简写（如 `@/components/Button`）代替冗长的相对路径（如 `../../components/Button`）来导入模块。
> - **tsconfig.json**：TypeScript 的配置文件，用于设定编译选项和路径映射。

---

## SDK 55 及以上版本的默认行为

使用 SDK 55 或更新版本的标准模板生成的应用，**自动采用** `src` 目录结构。以下子文件夹默认就位于 `src` 内部：

- `app` — 路由文件夹
- `components` — 可复用组件
- `constants` — 常量定义
- `hooks` — 自定义 React Hooks

如果你使用的是标准模板且 SDK 版本 >= 55，则**无需额外配置**即可享受此结构。

---

## 使用顶层 src 目录

如果你使用的是自定义模板，或者从旧版 SDK 升级后项目尚未采用 `src` 结构，可以按照以下步骤手动迁移。

### 第一步：迁移路由文件夹

将你的路由文件夹（`app`）移动到 `src/app` 下。推荐的项目目录结构如下：

```text
src/
  app/
    _layout.tsx
    index.tsx
  components/
    button.tsx
package.json
```

> **目录结构说明**
>
> - `src/app/` — 路由文件夹，Expo Router 会从中读取所有路由定义
> - `src/app/_layout.tsx` — 根布局文件，定义全局导航结构
> - `src/app/index.tsx` — 首页路由（对应 `/` 路径）
> - `src/components/` — 存放可复用的 UI 组件
> - `package.json` — 保留在项目根目录，不要移动

### 第二步：更新 TypeScript 路径别名

修改 `tsconfig.json` 中的 TypeScript 路径别名配置，使其指向新的 `src` 目录，而非项目根目录。

如果你使用标准的 `@/*` 别名快捷方式，需要将其配置为 `./src/*`：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> **为什么需要修改路径别名？**
>
> 在迁移到 `src` 目录之前，`@/components/Button` 可能映射到根目录下的 `./components/Button`。迁移后，组件实际位于 `./src/components/Button`，所以必须更新映射关系，否则所有使用 `@/` 前缀的导入语句都会因找不到文件而报错。

这一步确保所有使用 `@` 符号的导入在文件夹迁移后仍然能够正常工作。

### 第三步：重启开发服务器

修改完成后，需要使用对应的包管理器命令**重启本地开发环境**：

```sh
# npm
npx expo start
npx expo export

# yarn
yarn expo start
yarn expo export

# pnpm
pnpm expo start
pnpm expo export

# bun
bun expo start
bun expo export
```

> **提示**：`expo start` 用于启动开发服务器，`expo export` 用于导出生产构建。日常开发中通常使用 `expo start`。

---

## 重要注意事项

以下几点在使用 `src` 目录时**必须牢记**：

### 配置文件必须留在根目录

以下配置文件**必须**保留在项目根目录中，**不能**移入 `src` 文件夹：

- `app.config.ts` — Expo 应用配置
- `app.json` — Expo 应用元数据
- `package.json` — 项目依赖和脚本定义
- `metro.config.js` — Metro 打包器配置
- `tsconfig.json` — TypeScript 编译配置

> **基于经验建议**：将这些配置文件移入 `src` 会导致 Expo CLI 和 Metro 打包器无法正确识别项目，引发难以排查的错误。始终保持它们位于项目根目录。

### src/app 优先级高于根目录 app

`src/app` 路径会**覆盖**根目录下的 `app` 路径。如果两者同时存在，Expo Router **只会使用** `src` 内部的那个。

> **基于文档内容推导**：这意味着如果你正在从旧的 `app/` 结构迁移到 `src/app/`，需要确保删除或清空根目录下的旧 `app/` 文件夹，避免两个路由目录共存造成的混淆。虽然 Expo Router 只会读取 `src/app/`，但保留废弃的根目录 `app/` 可能让团队成员产生误解。

### public 文件夹必须留在根目录

`public` 文件夹（存放静态资源）也**必须**保留在项目根目录中，不能移入 `src`。

### 静态渲染自动检测

静态渲染（Static Rendering）会**自动检测**并使用 `src` 目录下的路由文件夹，无需额外配置。

### 类型别名需同步更新

> **基于经验建议**：除了 `tsconfig.json` 中的 `paths` 配置外，还应检查以下位置是否需要同步更新路径引用：
>
> - `babel.config.js` 中的模块解析插件配置
> - `metro.config.js` 中的 `watchFolders` 或 `extraNodeModules` 设置
> - 任何硬编码的相对路径导入（如 `../components/...`）

---

## 自定义路由目录

> **警告**：官方文档**强烈建议不要**修改默认的路由文件夹位置（`app` 或 `src/app`）。对于使用自定义路由文件夹的项目，官方**不接受**问题报告（issue reports）。

如果你仍然需要修改路由目录的位置，可以通过 **Expo Router Config Plugin**（Expo Router 配置插件）来实现，但需要自行承担风险。

以下示例展示了如何将路由文件夹修改为 `src/routes`（相对于项目根目录）：

```json
{
  "plugins": [
    [
      "expo-router",
      {
        "root": "./src/routes"
      }
    ]
  ]
}
```

> **关键术语解释**
>
> - **Config Plugin（配置插件）**：Expo 的一种扩展机制，允许你在预构建（prebuild）过程中修改原生项目的配置。`expo-router` 作为一个 Config Plugin，可以在 `app.json` 或 `app.config.ts` 中通过 `plugins` 字段进行配置。
> - **root 选项**：`expo-router` 插件的 `root` 参数用于指定路由文件夹的位置，默认值为 `./app` 或 `./src/app`。

### 自定义目录的潜在问题

> **基于经验建议**：使用自定义路由目录可能会遇到以下问题：
>
> - **工具兼容性**：许多第三方工具和 IDE 插件默认期望路由文件夹为 `app` 或 `src/app`，自定义路径可能导致自动补全、代码跳转等功能失效。
> - **CLI 版本要求**：只有与当前 Expo CLI 版本**精确匹配**的工具才会正确读取此插件配置。版本不一致时，CLI 可能会忽略自定义设置。
> - **团队协作成本**：新加入项目的开发者可能不熟悉自定义路由目录的配置，增加上手难度。
> - **调试困难**：遇到路由相关问题时，排查范围会扩大，因为问题可能出在自定义路径配置上。

> **基于文档内容推导**：除非有非常明确且充分的技术理由（例如大型单仓项目中需要隔离多个应用的路由），否则建议始终使用默认的 `app` 或 `src/app` 路径，以获得最佳的工具支持和社区帮助。

---

## 完整迁移清单

> **基于经验建议**：以下是从根目录 `app/` 迁移到 `src/` 结构的完整操作清单，供参考：

1. 创建 `src` 目录
2. 将 `app/` 移动到 `src/app/`
3. 将 `components/` 移动到 `src/components/`（如有）
4. 将 `constants/` 移动到 `src/constants/`（如有）
5. 将 `hooks/` 移动到 `src/hooks/`（如有）
6. 更新 `tsconfig.json` 中的 `paths` 映射，指向 `./src/*`
7. 检查并更新 `babel.config.js`、`metro.config.js` 中的路径引用
8. 确认 `app.config.ts`、`app.json`、`package.json`、`metro.config.js`、`tsconfig.json` 仍在根目录
9. 确认 `public/` 文件夹仍在根目录
10. 删除或清空根目录下旧的 `app/` 文件夹（避免混淆）
11. 重启开发服务器：`npx expo start`
12. 验证所有页面路由正常工作
13. 验证所有 `@/` 导入路径正常工作

---

## 常见问题

### 同时存在 `app/` 和 `src/app/` 会怎样？

Expo Router 只会使用 `src/app/`，根目录下的 `app/` 会被完全忽略。建议删除多余的根目录 `app/` 以避免团队成员的困惑。

### 迁移后导入路径全部报错怎么办？

检查 `tsconfig.json` 中的 `paths` 配置是否已更新为 `./src/*`。如果使用 Babel 的模块解析插件（如 `babel-plugin-module-resolver`），也需要同步更新其配置。

### 可以不使用 `src` 目录吗？

可以。`src` 目录是推荐的项目结构，但不是强制要求。如果你的项目使用根目录下的 `app/` 结构，Expo Router 同样能正常工作。

---

## 文档导航

- **上一页**：[screen tracking](./90__screen-tracking.md)
- **下一页**：[testing](./92__testing.md)
