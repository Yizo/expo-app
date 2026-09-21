# 007 Threading Model（线程模型）

**翻页：** [上一页：006 View Flattening](006-View-Flattening.md) · [目录](README.md) · [下一页：008 Bundled Hermes](008-Bundled-Hermes.md)

**官方页面：** [Threading Model · React Native](https://reactnative.dev/architecture/threading-model)  
**源页代码覆盖：** 官方页没有代码块；覆盖 UI / JavaScript thread、正常 JS render、高优先级 UI 事件、连续/离散事件打断，以及跳过 Render 的 C++ State 更新情形。

## 为什么 RN 有多个线程

New Architecture 的 Renderer 会把一次渲染管线中的工作分配到不同线程。**Thread（线程）**是进程内可并行执行任务的执行路径；不同线程不能随意同时改写同一份 UI 数据。

官方页面概括两个重要线程：

| 线程 | 常见职责 | 初学者理解 |
|---|---|---|
| **JavaScript thread** | 执行 React render 阶段和相关布局工作 | 运行组件函数、计算 React UI 更新 |
| **UI thread / main thread** | 创建、更新和操作 Android / iOS Host View | 系统真正绘制屏幕原生控件的线程 |

Renderer 通过不可变数据结构和 C++ `const` 规则确保线程安全：更新时创建新对象或克隆需要变化的节点，而不是同时原地改写正在被其他线程读取的数据。

## 常见渲染场景

### 通常由 JS thread 渲染

多数更新从 JavaScript 开始：React 计算新的组件树，Renderer 建立 Shadow Tree，提交布局结果，再安排 UI thread 把 Host View 变化挂载到屏幕。这是最常见路径。

### 高优先级 UI 事件

当 UI thread 上有需要尽快响应的离散交互时，Renderer 可以在 UI thread 同步执行必要的 render pipeline 工作，减少用户感觉到的延迟。高优先级不意味着所有应用逻辑都永久迁移到 UI thread；具体工作仍由 React 和 Renderer 调度。

### 连续事件打断低优先级渲染

拖动、滚动等连续事件会持续发生。若 JS thread 正在做低优先级 render，UI thread 上较低优先级事件可以触发中断并合并状态；之后 render 通常继续在 JS thread 完成。这样有机会丢弃过时的中间状态。

### 离散事件打断当前 render

点击等离散事件优先级较高。如果它在 render 中途到达，Renderer 能打断当前工作、合并最新状态，并在 UI thread 同步处理高优先级更新。完成后再继续或重新开始剩余的低优先级工作。

## C++ State 更新

少数来自原生组件的状态不由 React JS 直接拥有，例如 ScrollView 的当前原生滚动位置。**C++ State** 可从 UI thread 更新；这类更新会跳过 React Render 阶段，但仍要经过 Commit / Mount，使 Shadow Tree 和屏幕视图保持一致。来源与边界见前一页及原生通信页面。

## 关键名词

- **UI thread**：Android/iOS 系统操作原生视图的主线程；在此执行耗时任务会阻塞交互和绘制。
- **JavaScript thread**：运行 RN JavaScript、React 组件和常见 render 工作的线程。
- **Immutable data structure（不可变数据结构）**：修改时创建新对象，而不是原地覆写共享内容；方便多线程安全读取。
- **Continuous event（连续事件）**：高频持续发生的输入，如拖动或滚动。
- **Discrete event（离散事件）**：一次性明确的交互，如点击；通常需要高优先级响应。
- **C++ State**：由 Fabric / 原生 Host Component 维护、并非由 JS React state 作为唯一来源的状态。

## 官方代码主题覆盖

源页没有代码块或终端命令，主体由线程时序图解释不同事件优先级。上文已按五种场景逐项解释；图示不对应缺失的源代码。

**翻页：** [上一页：006 View Flattening](006-View-Flattening.md) · [目录](README.md) · [下一页：008 Bundled Hermes](008-Bundled-Hermes.md)
