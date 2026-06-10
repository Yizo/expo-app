# 在 Expo Modules 中 Mock 原生调用

## 为什么需要 mock

Expo 项目推荐使用 Jest 和 `jest-expo` preset 做单元测试。原生代码只能在 Android/iOS 原生环境中运行，本地 Jest 进程不能直接执行，因此要用假的 JavaScript 实现替代原生调用。

Mock 的目的不是验证 Swift/Kotlin 实现，而是验证 JS/TS 包装层是否以正确参数调用原生 API、处理返回值、异常和 React 生命周期。

Expo SDK 的社区包带默认 mocks；普通 JS 仍可使用 Jest mock API。自定义 Expo Module 也可把默认 mock 随包发布，让使用者运行测试时自动获得替代实现。

## 为模块提供默认 mock

在模块的 `mocks` 目录中创建与原生模块同名的文件并导出假实现。例如原生模块名为 `ExpoClipboard`：

```ts
// mocks/ExpoClipboard.ts
export async function hasStringAsync(): Promise<boolean> {
  return false;
}
```

测试环境中，`jest-expo` 会让 `requireNativeModule` 返回这些导出，因此 `ExpoClipboard.hasStringAsync()` 得到 `false`。

文件名匹配的是原生模块名，不一定是 npm 包名或 JS 包装文件名。

## 自动生成 mock

自动生成器根据模块的 **Swift 实现** 生成 TypeScript/JavaScript mocks。仅存在于 Android/Kotlin 的 API 不会自动生成，必须手动补充或调整。

先安装 SourceKitten，然后在含 `expo-module.config.json` 的模块目录运行：

```sh
brew install sourcekitten
npx expo-modules-test-core generate-ts-mocks
```

生成器在 `mocks` 目录创建 `ExpoModuleName.ts`，为原生方法和视图生成桩。要生成 JavaScript，使用：

```sh
npx expo-modules-test-core generate-js-mocks
```

生成内容通常返回 `any` 或空函数，因此它提供接口骨架，不会自动模拟真实业务语义。

## 测试模式

### 验证委托参数

导入 JS 包装模块和 mocked native module，用 `toHaveBeenCalledWith`、`toHaveBeenCalledTimes` 验证调用；异步 API 可用 `resolves`/`rejects` 验证结果与错误路径。

### 测试 React hooks

使用 `@testing-library/react-native` 的 `renderHook`。可用 `jest.mock` 为启动/停止方法设置 `jest.fn().mockResolvedValue()`，然后检查：

- mount 时是否启动。
- unmount 时是否停止。
- props 改变时是否清理旧订阅并启动新订阅。

这与 Web 的 hook 测试思路相同，但测试库和组件环境是 React Native。

## 最佳实践

- 在 `beforeEach`/`afterEach` 重置 mock，避免测试相互污染。
- 覆盖原生函数抛错、返回异常值等边界情况。
- 使用能描述具体行为的测试名。
- 用 `describe` 对相关能力分组。

## 易误解点与建议

- 默认 mock 不会运行原生代码，测试通过不代表 iOS/Android 实现正确。
- 自动生成只读取 Swift，Android-only API 会缺失。
- 生成的空实现需要按测试场景补充可观察的返回值或错误。
- **基于文档内容推导：** 把原生桥接包装层与业务逻辑分开，单测更容易精确验证参数和错误处理。
- **基于文档内容推导：** 对跨平台 API 比较生成 mock 与真实公开接口，防止 Kotlin-only 方法在 Jest 中被遗漏。

## 信息边界

文档未涉及 Swift/Kotlin 原生单元测试、设备集成测试、Jest 配置全过程、覆盖率阈值、定时器/事件 emitter mock 和 CI。

