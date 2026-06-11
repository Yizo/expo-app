# Expo Router 顶层 `src` 目录

## 文档解决的问题

这篇文档讲的是：如何在 Expo Router 项目中使用顶层 `src` 目录，以及为什么一般只推荐 `src/app`，不推荐随意自定义根路由目录。它解决的是项目目录组织、路径别名迁移、工具兼容性这类问题。

## 适用场景

- 你想把代码从项目根移动到 `src/` 下。
- 你在旧项目或自定义模板里还没有 `src` 目录。
- 你要调整 `@/*` 这类 TypeScript 路径别名。

## 核心概念

### 1. SDK 55+ 默认模板已内置 `src`

文档明确说明：SDK 55+ 的默认模板已经包含顶层 `src` 目录，里面通常放 `app`、`components`、`constants`、`hooks`，不需要额外配置。

### 2. `src/app` 是推荐结构

如果你来自旧项目或自定义模板，文档建议把根 `app` 移到 `src/app`。

### 3. `src/app` 优先级高于根 `app`

文档明确说明：如果两者同时存在，只会使用 `src/app`。

### 4. 任意自定义根目录是高风险操作

文档明确警告：修改默认根目录“高度不推荐”，并且 Expo 不接受这类项目的 bug 报告。

## 关键流程

### 1. 移动路由目录

把：

- `app/`

移动为：

- `src/app/`

### 2. 更新 TypeScript 路径别名

文档示例：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

作用：迁移到 `src` 后，继续让 `@/` 指向正确目录。

### 3. 重启开发服务或重新导出

```bash
npx expo start
npx expo export
```

## 文档中的目录与配置规则

### 应继续留在根目录的文件

文档明确说明这些配置文件仍应留在项目根目录：

- `app.config.ts`
- `app.json`
- `package.json`
- `metro.config.js`
- `tsconfig.json`

### `public` 目录位置

文档明确说明：`public` 目录也应继续放在根目录。

### 静态渲染

文档明确说明：如果存在 `src/app`，静态渲染会自动使用它。

## 自定义根目录

文档展示了可以通过插件配置危险地改成例如：

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

但文档同时明确警告：

- 这是 highly discouraged
- 可能导致意外行为
- 许多工具默认只假设根目录是 `app` 或 `src/app`
- 只有精确版本的 Expo CLI 会尊重这个配置插件

## 命令、配置、文件说明

### 命令

```bash
npx expo start
npx expo export
```

### 文件与目录

- `src/app`
  推荐的顶层路由目录。
- `tsconfig.json`
  需要更新路径别名。
- `public`
  仍留在根目录。

### 配置项

- `root`
  自定义 Expo Router 根目录的危险配置项。

## 注意事项、限制条件和坑点

- `src/app` 与根 `app` 同时存在时，只会使用 `src/app`。
- 配置文件和 `public` 不应跟着一起挪进 `src`。
- 自定义 `root` 目录高度不推荐。
- 文档明确表示这类自定义目录项目的 bug 报告不会被接受。
- 只有精确版本的 Expo CLI 会遵守该配置，这意味着工具链一致性风险很高。

## React Web 开发者容易误解的地方

- 不要把 `src` 迁移理解成纯前端工程里的随意目录重组。
  Expo Router 依赖文件系统路由，目录位置会直接影响路由解析。
- 不要把自定义 `root` 当成普通偏好配置。
  文档把它定义成危险且不推荐的能力。
- 不要忘记同步更新 TS alias。
  否则 `@/` 导入会全部偏移。

## 实际开发建议

- 基于经验建议：新项目直接跟随默认模板的 `src/app` 组织方式，不要额外折腾自定义根目录。
- 基于经验建议：老项目迁移时先只做 `app -> src/app` 和 TS alias 更新，不要一次性改太多目录约定。
- 基于文档内容推导：如果团队工具很多，越偏离 `app` / `src/app` 官方约定，后续兼容问题越容易累积。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- SDK 55+ 默认模板已包含顶层 `src` 目录。
- `src/app` 是推荐方案。
- `src/app` 优先于根 `app`。
- `public` 与配置文件应留在根目录。
- 自定义 `root` 高度不推荐，且可能导致意外行为。

### 基于文档内容推导

- `src/app` 是“官方支持的整理方式”，而不是“任意重命名根目录”的许可。
- 越接近官方默认结构，越能减少 Expo CLI、静态渲染与周边工具的兼容性风险。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 屏幕埋点追踪](./88_screen-tracking.md) | [下一页：Expo Router 测试配置 →](./90_testing.md)
<!-- NAVIGATION END -->
