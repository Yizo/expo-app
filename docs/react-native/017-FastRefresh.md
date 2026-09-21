# 017 Fast Refresh

**翻页：** [上一页：016 在设备上运行（Running On Device）](016-在设备上运行.md) · [目录](README.md) · [下一页：018 Metro](018-Metro.md)

**官方页面：** [Fast Refresh · React Native](https://reactnative.dev/docs/fast-refresh)
**源页代码覆盖：** 模块导出与刷新边界；语法/初始化/组件运行时错误恢复；`// @refresh reset` 文件指令；`useState`、`useRef` 与依赖型 Hooks 的刷新行为，并重写 `useMemo` 示例。

## Fast Refresh 是什么

Fast Refresh 是开发期功能，默认启用；可从 RN Dev Menu 开关。保存组件改动后，它尽量只刷新有关模块，使界面在很短时间内反馈。它不是生产环境热更新服务，也不是每次都保证保留 state。

## 模块变化如何传播

- 文件只导出 React 组件时，RN 通常只更新该模块并重新渲染组件；样式、渲染、事件函数和 Effect 的修改都在此范围内。
- 模块还导出普通值（例如主题常量）时，修改它可能会重新执行该模块及其导入者。
- 若文件既导出组件又被 React 树外的普通工具模块导入，更新可能退化成整页/整应用 reload。把组件与常量拆成独立模块，能建立更清晰的刷新边界。

## 错误时如何恢复

语法错误会让错误模块暂时不运行；修正并保存后，红屏应消失，不一定要手动重载。模块初始化阶段的运行时错误（例如把 `StyleSheet.create` 拼错）修复后也可恢复刷新。组件渲染内部的运行时错误修复后，React 可能重新挂载应用或组件，因此有些临时状态会重置。Error Boundary 可在生产 UI 中承接一部分渲染错误，设计上应按实际边界使用。

## 本地 state 与 Hook 行为

函数组件和 Hooks 的局部 state 通常可在刷新期间保留；类组件 state 不保留。含有额外非组件导出、或高阶组件返回类组件等情况，也可能令 state 复位。用 `// @refresh reset` 可以明确要求该文件里的组件每次编辑都重新挂载，适合检查首次挂载动画：

```tsx
// @refresh reset
import { useState } from 'react';

export function PulseDemo() {
  const [count, setCount] = useState(0);
  return <Button title={`计数 ${count}`} onPress={() => setCount(count + 1)} />;
}
```

`useState` 和 `useRef` 在 Hook 调用顺序及初始参数没有改变时可保留原值。`useEffect`、`useMemo`、`useCallback` 这类带依赖项的 Hook 在 Fast Refresh 时会更新；调试期间依赖数组暂时不会阻止重新执行。例如把 memo 计算由乘 2 改成乘 10 时，即便依赖变量没变也要重新计算，开发者才能看到代码修改：

```tsx
const doubled = useMemo(() => quantity * 2, [quantity]);
// 编辑期间把计算逻辑改为乘 10，Fast Refresh 会重新执行它。
```

因此，开发时 Effect 可能在依赖没有变化、甚至依赖数组为空时再次执行。Effect 应能承受重复执行，清理订阅、计时器和网络副作用；这也是常规 React 稳健性要求。

**翻页：** [上一页：016 在设备上运行（Running On Device）](016-在设备上运行.md) · [目录](README.md) · [下一页：018 Metro](018-Metro.md)
