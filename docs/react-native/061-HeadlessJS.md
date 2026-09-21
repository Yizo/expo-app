# 061 Headless JS

**翻页：** [上一页：060 Create a Library for Your Module](060-CreateLibraryForModule.md) · [目录](README.md) · [下一页：062 Publishing to Google Play Store](062-PublishingGooglePlayStore.md)

**官方页面：** [Headless JS · React Native](https://reactnative.dev/docs/headless-js-android)  
**平台范围：** 本页只讲 Android Headless JS。  
**源页代码覆盖：** AppRegistry headless task 注册、async taskData、Android Java/Kotlin HeadlessJsTaskService 配置、Manifest service、启动 Intent/Bundle、线性重试与 HeadlessJsTaskError、网络变化 BroadcastReceiver/foreground 检查/WakeLock。

## 什么是 Headless JS

Headless JS 是 Android 后台任务运行方式：系统事件触发后，RN 可启动 JavaScript 去同步数据、响应推送或做音频相关工作。**Headless task 不负责绘制 UI**，只能做后台逻辑；完成后 Promise resolve，RN runtime 会暂停，除非还有其他任务或 App 正在前台。

它不是通用的“App 在后台永远运行”机制。Android 后台执行与电池策略有限制，应只在系统事件、已注册 service 等合法入口启动，并确保任务有界、可重复且能处理取消/失败。

## 在 JS 注册后台任务

先通过 `AppRegistry.registerHeadlessTask` 关联稳定 task name 与模块。task module 导出一个异步函数，参数来自原生 `Intent` extras：

```tsx
import { AppRegistry } from 'react-native';

AppRegistry.registerHeadlessTask('SyncTask', () => require('./SyncTask').default);
```

```ts
export default async function syncTask(taskData: { accountId?: string }) {
  await synchronizeAccount(taskData.accountId);
  // 任务结束：返回/resolve 后 RN 可暂停运行时
}
```

可使用网络请求、定时器等非 UI API；不能挂载 React 组件、更新屏幕控件或访问依赖前台 Activity 的 UI。

## Android 原生 Service 连接 JS task

### Java/Kotlin HeadlessJsTaskService

原生服务继承 `HeadlessJsTaskService`，从 Intent extras 取参数并创建 `HeadlessJsTaskConfig`。Config 指定 JS task name、序列化数据、超时时间（毫秒）以及是否允许 App 前台运行；默认不允许前台，避免后台任务拖慢 UI。

```java
public final class SyncTaskService extends HeadlessJsTaskService {
  @Override
  protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras == null) return null;

    return new HeadlessJsTaskConfig(
        "SyncTask",
        Arguments.fromBundle(extras),
        5_000,
        false);
  }
}
```

Kotlin 版本同样将 `intent.extras` 转为 Arguments：

```kotlin
class SyncTaskService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? =
    intent?.extras?.let { extras ->
      HeadlessJsTaskConfig("SyncTask", Arguments.fromBundle(extras), 5_000, false)
    }
}
```

并在现有 AndroidManifest `<application>` 内注册 service：

```xml
<service android:name=".SyncTaskService" android:exported="false" />
```

### 用 Intent 启动任务

系统触发条件满足时，原生代码创建指向 service 的 Intent，把简单 extras 放入 Bundle，再启动服务。Java/Kotlin 轮廓相同：

```kotlin
val intent = Intent(applicationContext, SyncTaskService::class.java)
intent.putExtra("accountId", "demo-account")
applicationContext.startForegroundService(intent)
```

```java
Intent intent = new Intent(getApplicationContext(), SyncTaskService.class);
intent.putExtra("accountId", "demo-account");
getApplicationContext().startForegroundService(intent);
```

Bundle 只适合可 Parcelable/基础类型的轻量数据；不要把大型文件内容塞进 Intent。认证令牌等敏感数据需避免写日志或不受控持久化。

## 重试策略

Headless task 默认不自动重试。原生 config 可以提供 `HeadlessJsTaskRetryPolicy`；`LinearCountingRetryPolicy` 设置最大次数和每次之间固定延迟。JS task 在需要重试的失败条件下必须抛出 RN 的 `HeadlessJsTaskError`。一般网络错误应区分可重试和永久失败，避免无限重试。

```kotlin
val retryPolicy = LinearCountingRetryPolicy(3, 1_000)
return HeadlessJsTaskConfig(
  "SyncTask",
  Arguments.fromBundle(extras),
  5_000,
  false,
  retryPolicy,
)
```

```ts
import { HeadlessJsTaskError } from 'HeadlessJsTask';

export default async function syncTask() {
  const result = await trySync();
  if (!result.retryable) return;
  throw new HeadlessJsTaskError();
}
```

## Caveat 与 WakeLock

- 默认禁止前台运行。如果确实要让任务在前台执行，可在 config 显式传 `true`，但要评估它对交互和电量的影响。
- 若由 `BroadcastReceiver` 启动 Headless service，应在 `onReceive()` 返回前调用 `HeadlessJsTaskService.acquireWakeLockNow(context)`，否则 CPU 可能在 JS 完成前休眠。
- 源页用网络变化广播演示触发方式：在 Manifest 注册 receiver，检查 App 是否前台；若在后台，读取当前网络状态、构造带 `hasInternet` 的 service Intent 并获取 WakeLock。
- 该示例中的 `CONNECTIVITY_CHANGE`、foreground 检测与网络 API 会受 Android 版本/后台限制影响；新 App 要按当前 Android 目标版本选择后台任务机制，不要把示例当作任意后台循环许可。

网络变化触发流程简图（对应官方 Java/Kotlin receiver 代码）：

```text
系统广播 → BroadcastReceiver
  → 确认 App 在后台
  → 查询网络可用状态
  → Intent.putExtra("hasInternet", ...)
  → 启动 HeadlessJsTaskService
  → acquireWakeLockNow()
  → JS task 处理数据并结束
```

**翻页：** [上一页：060 Create a Library for Your Module](060-CreateLibraryForModule.md) · [目录](README.md) · [下一页：062 Publishing to Google Play Store](062-PublishingGooglePlayStore.md)
