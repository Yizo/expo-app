# 007 AppRegistry

**翻页：** [上一页：006 Appearance](006-Appearance.md) · [目录](README.md) · [下一页：008 AppState](008-AppState.md)

**官方页面：** [AppRegistry · React Native](https://reactnative.dev/docs/appregistry)  
**源页代码覆盖：** 根组件注册/启动/卸载、registry 查询、多个 section/runnable 配置、无 UI headless task 与取消、组件 provider instrumentation/wrapper hooks、所有关联类型。

## RN 应用入口注册表

**AppRegistry** 是 RN JavaScript 应用的注册入口。应用根组件调用 **registerComponent(appKey, provider)** 注册，原生启动代码使用相同 appKey 加载 bundle 并调用 runApplication。可以把 appKey 理解为“原生侧启动哪个 JS root 的名称”。

    function App() {
      return <RootNavigator />;
    }

    AppRegistry.registerComponent('main', () => App);

    // 原生启动时会用同名 key 调用 runApplication。
    // 当原生容器被销毁时，以同一 rootTag 卸载。
    AppRegistry.unmountApplicationComponentAtRootTag(rootTag);

AppRegistry 应在 require 顺序较早时初始化，让 JS execution environment 在其他模块加载前准备好。根视图生命周期需要成对管理：runApplication 启动后，销毁时使用传入的 rootTag 调用卸载 API。

## 单个入口、多入口与查询

**registerComponent** 注册返回 React root component 的 provider。**registerConfig(config[])** 一次注册多个 AppConfig；每项必须有 appKey，并提供 component 或 run 其中之一，可选 section 用于把入口归类。**registerSection**/**registerRunnable** 可分别注册分组和自定义运行函数。

| 查询 API | 返回 |
|---|---|
| **getAppKeys()** | 已注册 app keys 字符串数组。 |
| **getSectionKeys()** | section 名数组。 |
| **getRunnable(appKey)** | 某 key 对应的 runnable 或 undefined。 |
| **getSections()** | section 到 runnable 的映射。 |
| **getRegistry()** | 包含 sections 与 runnables 的整体注册表。 |

**setComponentProviderInstrumentationHook(hook)** 可包装组件 provider 以接入性能统计；hook 收到 ComponentProvider 和性能 logger，返回一个 React Component。**setWrapperComponentProvider(provider)** 可设置包装 provider。

## 无 UI 后台任务

**Headless task** 是没有界面的 JS 工作。例如应用在后台同步数据或处理推送通知。**registerHeadlessTask(taskKey, taskProvider)** 注册可由 native side 启动的异步任务；provider 返回接收 native data 并解析 Promise 的函数。**startHeadlessTask(taskId, taskKey, data)** 只由原生侧调用，用指定 id/key/data 启动任务。

需要响应取消时，使用 **registerCancellableHeadlessTask(taskKey, taskProvider, taskCancelProvider)**。taskCancelProvider 提供取消处理器；运行任务收到取消后应尽快收尾并返回。

    AppRegistry.registerHeadlessTask(
      'sync-records',
      () => async data => {
        await syncRecords(data.accountId);
      },
    );

    AppRegistry.registerCancellableHeadlessTask(
      'upload-batch',
      () => async data => uploadBatch(data),
      () => () => abortCurrentUpload(),
    );

## 类型定义

| 类型 | 结构 |
|---|---|
| **AppConfig** | appKey 必填，component 或 run 二选一，可设 section。 |
| **Registry** | runnables 数组与 section 名数组。 |
| **Runnable** | component provider 或 run 函数。 |
| **Runnables** | 按 appKey 作为键映射 Runnable。 |
| **Task** | 接收 data 并返回 Promise<void> 的函数。 |
| **TaskCanceller** | 无参数并返回 void 的取消函数。 |
| **TaskCancelProvider** | 返回 TaskCanceller 的函数。 |
| **TaskProvider** | 返回 Task 的函数。 |

## 代码覆盖清单

已重写官方根组件 registerComponent/entry key 示例、rootTag 卸载生命周期和两种 headless task 注册。全部 16 个 API、AppConfig/Registry/Runnable/Runnables 与任务相关 4 类类型均按作用覆盖；startHeadlessTask 标明仅由 native 调用。

**翻页：** [上一页：006 Appearance](006-Appearance.md) · [目录](README.md) · [下一页：008 AppState](008-AppState.md)
