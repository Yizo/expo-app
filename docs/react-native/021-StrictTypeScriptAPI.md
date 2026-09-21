# 021 Strict TypeScript API

**翻页：** [上一页：020 使用 TypeScript（Using TypeScript）](020-使用TypeScript.md) · [目录](README.md) · [下一页：022 Release Levels](022-ReleaseLevels.md)

**官方页面：** [Strict TypeScript API · React Native](https://reactnative.dev/docs/strict-typescript-api)  
**版本范围：** 新行为从 React Native 0.87 起默认启用；Expo SDK 57 项目使用 RN 0.86，不应直接假设已经采用 0.87 的默认类型变化。  
**源页代码覆盖：** 临时 opt-out 的 `customConditions`、deep import 到根导出迁移、CodegenTypes、ref 的 `*Instance` 类型、`*Static` 移除、第三方/Jest 类型绕过、`InitializeCore` 替换以及过时 props/types 处理。

## Strict TypeScript API 做了什么

从 RN 0.87 起，Strict TypeScript API 默认打开（RN 0.80–0.86 曾可选启用）。它是 React Native 当前严格化的公共类型 API，用源码生成类型，替代早期分开手工维护的定义。变化只影响 TypeScript 编译期解析的类型契约，不直接改变组件的 JS 执行方式。

最核心的边界：

- 不再支持从 `react-native/Libraries/...` 等内部深层路径导入公共 RN API；从 `react-native` 包的根导入。内部文件可能重排，依赖它们会破坏兼容性。
- 类型由 React Native 源码生成，覆盖率和定义更贴近实际实现。React Native 源码使用 Flow，生成的 TS 类型会与实现保持一致。
- 0.87 的深层导入类型收紧与私有路径运行时导出移除不是一回事；后者会影响实际打包运行，需分开排查。

## 暂时退回旧定义

若依赖或项目暂时无法迁移，RN 0.87 仍提供临时旧定义兼容条件，但官方计划之后移除。此设置应是迁移过渡，而不是长期绕过：

```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "customConditions": ["react-native", "react-native-legacy-deep-imports"]
  }
}
```

迁移前保持 RN 配置默认开启的 `skipLibCheck`，避免第三方 `.d.ts` 文件内部错误充斥项目报告；若类型错误属于某个依赖，先更新到已修复版本。直接被项目导入的第三方 TS 源码会作为项目代码检查。官方页面还放了一个可选命令，用 RN Community migration skill 自动辅助迁移；它不是 RN 运行时命令，也不影响 App 本身：

```sh
npx skills add react-native-community/skills --skill migrate-to-strict-api
```

如确实需要临时排除某个依赖的未类型化内部模块，可将那个精确子路径映射到 `.d.ts` stub。stub 应尽量标为 `unknown`，避免 `any` 扩散；同时把不兼容反馈给库维护者。

```json
{
  "compilerOptions": {
    "paths": { "legacy-library/jest/mock": ["./types/untyped-module.d.ts"] }
  }
}
```

```ts
declare const exportedValue: unknown;
export default exportedValue;
```

## Codegen 类型和导入方式

Codegen（代码生成）使用的 `Int32`、`Double`、`WithDefault` 等类型现在放在 `CodegenTypes` 命名空间下。`codegenNativeComponent` 和 `codegenNativeCommands` 应从 `react-native` 根导入，不再深层导入其内部文件。

```tsx
import { CodegenTypes, codegenNativeComponent, type ViewProps } from 'react-native';

interface NativeProps extends ViewProps {
  enabled?: CodegenTypes.WithDefault<boolean, true>;
  size?: CodegenTypes.Int32;
}

export default codegenNativeComponent<NativeProps>('RNCustomPanel');
```

Strict API 未启用时这些根导出仍被提供，用于逐步兼容库。Codegen 主要是编写自定义原生组件/模块的人会用；日常 RN 应用作者通常不需要自己调用。

## Refs 改用 `*Instance` 类型

旧定义把 `View`、`TextInput` 等组件名当作 ref 类型。新定义中组件是函数类型，不能再把组件函数类型当作原生实例。改用对应实例别名，例如 `ViewInstance`、`TextInputInstance`；同样适用于 `Animated.View`，无需另设 Animated 专用实例类型。

```tsx
import { useRef } from 'react';
import { TextInput, View, type TextInputInstance, type ViewInstance } from 'react-native';

export function FocusExample() {
  const containerRef = useRef<ViewInstance>(null);
  const fieldRef = useRef<TextInputInstance>(null);

  return (
    <>
      <View ref={containerRef} />
      <TextInput ref={fieldRef} />
    </>
  );
}
```

RN 官方提供许多 `*Instance` 类型，例如 `ButtonInstance`、`FlatListInstance`、`ImageInstance`、`ScrollViewInstance`、`TextInstance`、`TextInputInstance` 和 `ViewInstance`。不支持 ref 的组件没有这类实例类型。`React.ComponentRef<typeof View>` 仍可用，也等价于 `ViewInstance`。旧 `Animated.LegacyRef` 应迁到相应实例类型。

## 清理旧类型名和深层导入

旧定义中有时把运行时单例对象 `Linking` 的类型写作 `LinkingStatic`。Strict API 移除多数 `*Static` 类型，应直接用 API 同名类型；页面也列举了 Alert、Platform、AppState、Keyboard、NativeModules、Vibration 等受影响类型。少数没有同名现代类型的项需按照官方当前类型声明处理。

```tsx
import { Linking } from 'react-native';

function configureLinking(api: typeof Linking) {
  // 使用运行时导出对应的类型
}
```

同类清理还包括：旧 `ViewProperties`/`TextInputProperties` 改用 `ViewProps`/`TextInputProps`，图片源旧别名改用 `ImageSourcePropType`；去掉从未实现或已废弃的组件 props 和只供内部使用的辅助类型。严格类型下，所有 optional prop 也会准确包含 `undefined`。

## 测试代码和环境初始化

`jest.mock('react-native/...')` 的路径字符串不会因为 Strict API 自动失效；但如果 TS 文件直接导入深层路径，TypeScript 会发现它不属于公开类型 API。只有确实要包装 RN 内部实现时，测试代码才可能需要局部 `@ts-expect-error`，优先使用公开根导出。

```ts
// @ts-expect-error 仅用于测试 RN 内部实现，生产应用不应依赖此路径
import internalModule from 'react-native/Libraries/AppState/NativeAppState';
```

旧初始化副作用入口 `react-native/Libraries/Core/InitializeCore` 从 0.87 弃用，替换为 `react-native/setup-env`：

```ts
import 'react-native/setup-env';
```

## 版本迁移检查表

- 应用和库可各自在自己的 `tsconfig.json` 迁移，不需要等所有依赖一起改。
- 先更新库版本；移除 App 代码和测试里的 deep import。
- Codegen 类型改从根 API 的 `CodegenTypes` 命名空间使用。
- ref 从组件名类型改为 `*Instance`。
- 清理 `*Static`、`*Properties`、过时 props 和内部 helper types。
- 把 `InitializeCore` 测试入口切换到 `react-native/setup-env`。
- Strict API 本身不会改变 JavaScript runtime；RN 0.87 同时移除私有路径 exports 的行为变化需要单独检查。

**翻页：** [上一页：020 使用 TypeScript（Using TypeScript）](020-使用TypeScript.md) · [目录](README.md) · [下一页：022 Release Levels](022-ReleaseLevels.md)
