# 048 Timers

**翻页：** [上一页：047 JavaScript Environment](047-JavaScriptEnvironment.md) · [目录](README.md) · [下一页：049 Using Hermes](049-UsingHermes.md)

**官方页面：** [Timers · React Native](https://reactnative.dev/docs/timers)  
**源页代码覆盖：** `setTimeout/clearTimeout`、`setInterval/clearInterval`、`setImmediate/clearImmediate`、`requestAnimationFrame/cancelAnimationFrame`，以及 Android 调试时设备/调试器时钟不同步的处理命令。

## RN 的计时 API

RN 提供熟悉的浏览器式计时器：

| 需要 | API |
|---|---|
| 延迟一次执行 | `setTimeout` / `clearTimeout` |
| 定时重复 | `setInterval` / `clearInterval` |
| 当前 JS 执行块结束后尽快回调 | `setImmediate` / `clearImmediate` |
| 在画面帧边界更新 | `requestAnimationFrame` / `cancelAnimationFrame` |

```ts
const timeout = setTimeout(refreshStatus, 1000);
const interval = setInterval(pollStatus, 5000);

clearTimeout(timeout);
clearInterval(interval);
```

组件卸载或停止功能时应清除仍在运行的 timeout/interval，避免重复请求和内存泄漏。

## requestAnimationFrame 与 setTimeout 的区别

`requestAnimationFrame(fn)` 在当前待处理帧绘制完成后安排回调，适合与渲染节奏同步的工作；`setTimeout(fn, 0)` 则尽可能快地排入计时器队列，不保证贴合画面帧，可能远快于屏幕刷新频率。不要用 0ms timer 模拟动画帧。

## setImmediate 与 Promise

`setImmediate` 会在当前 JavaScript 执行块结束、向原生端发送批量更新前调用。若在 `setImmediate` 回调中再次调用它，下一次回调可能立刻执行，不会先让出控制权回到原生层。RN 当前 Promise 实现用 `setImmediate` 作为异步调度机制。

## Android 调试时的系统时间漂移

官方页面提醒：Android 调试器主机与设备时钟漂移时，动画/事件时间结果可能不准。它给出的 shell 命令会用调试机时间校准 Android device clock；实体设备需要 root 权限。这个场景仅适用于确认有时钟漂移的调试环境，普通开发不需要运行带权限的时间修改命令。

**翻页：** [上一页：047 JavaScript Environment](047-JavaScriptEnvironment.md) · [目录](README.md) · [下一页：049 Using Hermes](049-UsingHermes.md)
