# Expo Inline Modules 参考

## 解决的问题

Inline modules 允许把 Kotlin/Swift 原生模块源码直接放进 Expo 应用目录，不必创建独立 Expo module package。Expo 自动发现文件并加入原生构建。

该能力从 **Expo SDK 56** 提供，当前为实验性 API，可能有破坏性变更。

## 适用场景

适合只服务单个应用、暂不需要独立发布复用的原生能力。文档未涉及具体模块 API、调试、测试、发布或迁移为独立包。

## 启用

```json
{
  "expo": {
    "experiments": {
      "inlineModules": {}
    }
  }
}
```

这会同时为 Expo CLI 和 Expo Modules Autolinking 启用功能。

## `watchedDirectories`

```json
{
  "expo": {
    "experiments": {
      "inlineModules": {
        "watchedDirectories": ["app", "src"]
      }
    }
  }
}
```

嵌套目录也会被扫描。监听目录必须：

- 位于某个 JS/TS 项目中，即祖先目录存在 `package.json`。
- 不能是项目根 `./` 或项目祖先目录。
- 不能与另一监听目录互相包含；配置 `app` 后不要再配置 `app/nested`。
- 路径不能含空格、`(`、`)`、`$` 等特殊字符。可监听 `app` 并自然覆盖 `app/(tabs)`。

修改 app config 后必须运行：

```sh
npx expo prebuild
```

只重启 Metro 不会更新原生工程。

## 命名约定

文件名必须与原生模块名一致，模块名在整个应用中唯一。例如 `SimpleModule.kt` 中类名必须是 `SimpleModule`。DSL 的 `Name("SimpleModule")` 也必须一致，因此可省略让 Expo 推断。

## 限制与建议

- 自动发现依赖显式启用、合法目录和严格命名，并非任意原生文件都会构建。
- SDK 升级时要检查实验性 API 变化。
- **基于文档内容推导：** 监听足够高但仍具体的目录，避免重复嵌套项。
- **基于文档内容推导：** 使用项目级清晰模块名，降低全局重名风险。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Modules API 参考](./107_module-api.md) | [下一页：Expo Swift 模块 TypeScript 类型生成参考 →](./109_type-generation-reference.md)
<!-- NAVIGATION END -->
