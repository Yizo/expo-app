# 037 React Native DevTools

**翻页：** [上一页：036 Debugging Basics](036-DebuggingBasics.md) · [目录](README.md) · [下一页：038 Debugging Native Code](038-DebuggingNativeCode.md)

**官方页面：** [React Native DevTools · React Native](https://reactnative.dev/docs/react-native-devtools)  
**源页代码覆盖：** Console、Sources/断点快捷键与 `debugger;`、Network 覆盖范围/限制和缓冲上限、Performance/User Timing、Memory 快照、React Components/Profiler、断线恢复。

## 它调试哪一层

React Native DevTools 是现代 JS/React 调试器，使用与 Chrome DevTools 相近的界面和交互。它负责理解 JavaScript、React 组件树和 JS 性能；不能代替 Android Studio 或 Xcode 检查原生模块、原生线程和平台构建。

## Console 和断点

Console 可筛选日志、查看对象字段和直接运行 JavaScript。日志多时使用 filter 或调整日志级别；Live Expressions 可持续观察表达式值，Preserve Logs 可在重载间保留记录；`Ctrl + L` 清空视图。

Sources 显示应用源文件，可点击行号设断点。`Cmd/Ctrl + P` 搜文件；暂停时查看当前作用域与调用栈，并用 step controls 单步执行。也可以在代码临时写 `debugger;`：

```ts
function calculateTotal(items: Item[]) {
  debugger; // 开发时暂停并查看参数，调试完成后删除
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

条件断点与 Logpoint 可只在某条件下暂停或记录数据。App 暂停时设备上出现 “Paused in Debugger” 覆盖层，点按后继续运行。

## Network 面板

从 RN 0.83 起，DevTools Network 能观察 `fetch()`、`XMLHttpRequest` 和 `Image` 的请求，记录时间、请求/响应头、预览等元信息。Expo 项目还会显示 Expo Network 面板，以覆盖一些 Expo 专属请求；该面板功能稍少，不支持请求 initiator 与 Performance panel 联动。React Native DevTools 页面还列出未实现能力：WebSocket 事件、响应 mock、网络节流。

Network 面板开启时自动记录请求。Initiator 标签页能追溯调用栈，性能轨迹中也可看到 Network 事件。大响应的内容预览缓存在设备端，最大约 100 MB；缓存超限时最老的响应预览会先被移除，但请求元数据仍保留。

## Performance 和 Memory

Performance 面板录制一段应用运行过程，并把 JS 执行、React commits、网络事件和自定义 User Timing 放在时间线中。可在轨迹上添加注释，记录关注的时间段；应用也能用 `PerformanceObserver` 观察性能事件。

Memory 面板能拍 heap snapshot 并对比 JS 内存对象，帮助定位对象是否长期保留。可在快照中查找特定对象，或录 allocation timeline 观察内存随时间的变化。

## React Components 和 Profiler

Components 面板展示 React 组件树；选中或悬停组件会在设备对应位置高亮。使用元素选择工具后直接点 App UI 可定位到组件，右侧面板查看或编辑 props/state。开启 Highlight updates when components render 后，界面可显示组件重渲染位置；有助于识别多余 render。

Profiler 用 flame graph 查看组件渲染时间和 React commit。与源页链接的 2018 年指南相比，新 DevTools 功能和 React 版本可能不同，应优先看当前页面描述与当前 React Profiler。

## 重新连接

应用关闭、安装了新原生 build、原生进程崩溃、Metro 退出或真机断开，都可能关闭 DevTools 连接。先修复断线原因，再点 Reconnect DevTools；Dismiss 只关闭提示框并保留 DevTools 上次状态。

**翻页：** [上一页：036 Debugging Basics](036-DebuggingBasics.md) · [目录](README.md) · [下一页：038 Debugging Native Code](038-DebuggingNativeCode.md)
