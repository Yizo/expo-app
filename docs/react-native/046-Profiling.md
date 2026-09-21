# 046 Profiling

**翻页：** [上一页：045 Optimizing JavaScript loading](045-OptimizingJavaScriptLoading.md) · [目录](README.md) · [下一页：047 JavaScript Environment](047-JavaScriptEnvironment.md)

**官方页面：** [Profiling · React Native](https://reactnative.dev/docs/profiling)  
**源页代码覆盖：** Android System Trace/16ms VSync、JS/UI/Native Modules/Render threads 识别、硬件纹理/离屏合成属性、Java/Kotlin CPU hotspot profile 与录制步骤。

## 测量前先做准备

**Profiling（性能剖析）** 是录制应用运行、资源使用和行为数据，再定位耗时瓶颈。iOS 用 Xcode Instruments；Android 用 Android Studio Profiler。RN 官方提醒：先关掉 Development Mode，以 Release/profileable 构建测用户实际性能。Dev mode 的警告与检查会显著拖慢 JS。

## Android：录制 System Trace

Android 设备型号和 GPU 差异很大；卡顿时先回答“每个 16ms 帧的时间花在了哪里”。使用 Android Studio Profiler 的 System Tracing（旧独立 `systrace` 已从 platform-tools 移除）：

1. USB 连接出现卡顿的设备，在 Android Studio 选择该设备并用 profileable build 启动应用。
2. 把应用操作到要测的动画/转场前，在 Profiler 选择 Capture System Activities 开始录制。
3. 执行动作后停止录制，在 Android Studio 看时间线；也可导出并用 Perfetto 查看。
4. 打开 VSync 标记，观察每 16ms 帧边界，再定位越过边界的线程任务。

线程名与职责大致如下：

| 时间线线程 | 主要工作 | 常见事件线索 |
|---|---|---|
| UI Thread | Android 原生 measure/layout/draw 与界面事件 | `Choreographer`、`traversals`、`DispatchUI` |
| JS Thread | JavaScript 逻辑与事件处理 | `mqt_js`、`JSCall`、`Bridge.executeJSCall` |
| Native Modules | 原生模块方法调用 | `mqt_native_modules`、`NativeCall`、`callJavaModuleMethod` |
| Render Thread（Android 5+） | 生成实际 GPU/OpenGL 绘制命令 | `DrawFrame`、`queueBuffer` |

## 从 trace 判断 JS 还是原生 UI

若 JS 工作跨过帧边界、UI thread 本身很空闲，问题更可能在 JS 端：例如每帧重复发事件或重渲染，查看 JS thread 的调用栈并找高频触发，检查是否能减少事件次数或无用 React render（如 `shouldComponentUpdate`）。

若 UI Thread/Render Thread 的绘制或 `DrawFrame` 跨越边界，问题更像是要绘制的原生视图太复杂，或交互期间新建了很多视图。

### GPU 与视图合成

Android 上复杂但静止、随后整体平移/淡入淡出的内容，可试 `renderToHardwareTextureAndroid` 把它缓存为硬件纹理。避免无必要启用 `needsOffscreenAlphaCompositing`：离屏透明合成会大幅增加每帧 GPU 工作。

```tsx
<View
  renderToHardwareTextureAndroid={isBeingAnimated}
  style={{ opacity: fade }}
>
  {complexStaticContent}
</View>
```

这会增加内存；性能 trace 证明有帮助后再使用，并在动画结束后释放不再需要的硬件纹理。

### 交互期间创建新视图

如果 trace 显示先有 JS 工作，再有 native modules 调用和昂贵 UI traversal，说明滚动/动画期间正生成新 UI。通常只能延后创建新内容，或减少该 UI 复杂度；这类问题不像单纯调一个 prop 就一定能解决。

### 查原生 CPU 热点

若线索在 Java/Kotlin 代码，可从 Android Studio Profiler 选 “Find CPU Hotspots (Java/Kotlin Method Recording)” 录制短时间交互。此录制本身较耗资源，数值不如 System Trace 精确；但可以看哪些原生方法调用最多、时间比例如何。长时间录制可能影响被测行为。

**翻页：** [上一页：045 Optimizing JavaScript loading](045-OptimizingJavaScriptLoading.md) · [目录](README.md) · [下一页：047 JavaScript Environment](047-JavaScriptEnvironment.md)
