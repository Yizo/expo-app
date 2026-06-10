# 为 Expo 模块生成 TypeScript 接口

> 对应文档：`https://docs.expo.dev/modules/type-generation-tutorial.md`（页面修改日期：2026-05-18）

## 解决的问题与前提

Expo 模块的契约常要在 Swift、Kotlin 和 TypeScript 中重复描述。`expo-type-information` 从 Swift 实现提取类型并生成 TypeScript 接口，以减少手写重复和类型漂移。

> 当前工具只支持 macOS，并依赖 SourceKitten。

```sh
npm install expo-type-information
brew install sourcekitten
```

教程分别覆盖 Inline Module 和标准 Expo Module。当前文档只说明从 Swift 生成，没有介绍从 Kotlin 生成。

## 为 Inline Module 生成接口

直接使用 `requireNativeModule`、`requireNativeView` 而没有泛型时会得到 `any`，缺少自动补全和类型安全。项目根目录执行：

```sh
npx expo-type-information inline-modules-interface --app-json ./app.json --watcher
```

- `--app-json` / `-a`：app config 路径，工具从中读取 `watchedDirectories`。
- `--watcher` / `-w`：监听 app config 和 watched directories，变化后重新生成接口。

每个 Inline Module 会得到两类文件：

```text
FirstInlineModule.generated.ts
FirstInlineModule.tsx
FirstInlineView.generated.ts
FirstInlineView.tsx
```

### `*.generated.ts`

这是可再生的类型事实文件，包含从 Swift 解析出的常量、函数、视图 props 等。重新运行或 watcher 触发时会覆盖，因此不要手工修改，除非以后不再使用生成命令。

### 稳定包装文件

不带 `.generated` 的 `.tsx` 文件负责加载原生模块或视图，并导出对应用代码更友好的 API。CLI 在文件头保存 hash 检测手工变化：一旦开发者自定义该文件，CLI 会停止覆盖它，而生成类型文件仍可继续同步。

这允许把“机器维护的原生类型”与“人工维护的公开 API/辅助逻辑”分开。

## 无法解析的类型

教程中的 Swift 视图使用原生 `URL`。由于该类型不是工具内置基础映射，且定义不在输入文件中，生成结果会出现：

```ts
export type URL = unknown;
```

这表示工具不能可靠推断，而不是原生属性真的接受任意值。事件处理器示例也可能退化为 `any`。

稳定视图文件使用 default export。文档指出，为使该默认生成形态正确工作，一个 Inline Module 中只能定义一个视图。

## Watcher 更新行为

给 Swift 模块新增 `ConcatStrings(str1: String, strings: [String]) -> String` 后，生成类型会变为 `ConcatStrings(str1: string, strings: string[]): string`，稳定文件也会增加包装函数。

如果稳定文件没有更新，很可能它已被手工修改、hash 不再匹配。若想恢复自动生成，需要删除稳定文件，再修改 Swift 模块触发 watcher。

## 为标准 Expo Module 生成接口

教程基于 `expo-settings`，先删除原手写的 types、Module 和 index 文件，然后执行：

```sh
npx expo-type-information module-interface --module ./expo-settings
```

监听模式：

```sh
npx expo-type-information module-interface --module ./expo-settings -w
```

`--module` / `-m` 指向模块根目录。工具生成：

- `src/ExpoSettings.types.ts`：Swift 中声明的类型，例如 `Theme` enum。
- `src/ExpoSettingsModule.ts`：原生模块 class 类型与 `requireNativeModule` 实例。
- `src/index.ts`：重新导出类型和模块对象。

## 已知限制

- 仅支持 macOS，并要求安装 SourceKitten。
- 工具较新，并非所有 Expo Modules API 能力都已实现。
- 教程明确指出：标准模块事件类型尚不能生成。
- 未解析的原生类型会降级为 `unknown`，部分事件可能为 `any`。
- 标准模块生成的 `index.ts` 直接导出模块对象，不会自动按原教程风格为每个方法写包装函数。

## React Web 开发者易误解点

- 这更像从后端 schema 生成客户端类型，而不是 TypeScript 自己检查 Swift/Kotlin。
- 生成类型不会改变运行时原生模块，也不能替代跨平台实现一致性检查。
- `unknown` 是需要人工收窄或补充的信号；把它随意断言为目标类型会失去生成工具的价值。
- “稳定文件”可编辑不意味着永远会继续自动更新，hash 机制会主动保护人工修改。

## 文档边界

**文档明确说明**：安装要求、两种生成命令、watcher、生成文件职责、hash 覆盖规则、未解析类型和事件生成限制。

**基于文档内容推导**：应把 `.generated.ts` 视为不可编辑产物，把稳定文件作为公开 API 适配层，并在 CI 或开发脚本中检查生成结果是否同步。

**当前文档未涉及**：Kotlin 类型来源、多 Swift 文件的复杂解析规则、CI 集成、版本兼容矩阵和自定义类型映射配置。
