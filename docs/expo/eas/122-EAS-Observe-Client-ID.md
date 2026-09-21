# 122｜EAS Observe Client ID

**翻页：**[上一页：EAS Observe Metrics Reference](./121-EAS-Observe-Metrics-Reference.md) · [目录](./README.md) · [下一页：排查 EAS Observe](./123-EAS-Observe-Troubleshooting.md)

**官方页面：**[Client ID](https://docs.expo.dev/eas/observe/reference/client-id/)

**版本边界：**此 reference 是当前未版本化页面。SDK v56.0.0 的 versioned Observe API 参考没有列出 `Observe.clientId`，因此下面的 API 以当前 EAS Observe 页面为准，不保证本地 `expo-observe ~56.0.29` 可直接使用。项目升级时按目标 SDK 对应的 Expo Observe reference 校验。

## EAS Client ID 是什么

每条 EAS Observe metric、event 和 log record 都带一个 EAS client ID，用来指代**单个 App installation**。Dashboard 和 EAS CLI 用它将多条指标归到同一次安装；应用代码可用 `Observe.clientId` 读出同一个字符串，以便与崩溃监控、业务 analytics 或自己的服务端数据关联。

Android / iOS 返回 string；Web 返回 `null`。导入 `expo-observe` 后即能读取，不必先调用 `Observe.configure()`：

```ts
import { Observe } from 'expo-observe';

console.log(Observe.clientId);
```

## 将 Client ID 附到自己的服务数据

下面示例把用户反馈和对应 installation id 一起发送到业务后台：

```ts
import { Observe } from 'expo-observe';

async function reportFeedback(message: string) {
  await fetch('https://api.example.com/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      easClientId: Observe.clientId,
    }),
  });
}
```

连接后可从后台记录反查 Observe 内该安装对应的 sessions；也可反向从 EAS CLI 查询结果查看 `easClientId`。Crash / analytics SDK 通常也有 tag、custom property、context 等字段可一次设置这个 ID。

```sh
eas observe:metrics --json
eas observe:events --json
```

JSON 查询中的 sample 会包含 `easClientId`，可用于与其他系统中同一安装的记录比对。

## ID 的生命周期

- 需要首次生成 EAS client ID 时在设备上创建随机值，保存在原生 preferences 中；不从硬件或账号 ID 推导。
- 多次启动、App 更新和 EAS Update 后保持稳定。
- 同一 App installation 中 EAS client libraries（例如 `expo-updates`）共享该 ID。
- 清除 App data 或卸载重装会生成新值；但 Android Auto Backup 在重装恢复数据时可能恢复旧值。
- `sampleRate` 的采样决定由 client ID 派生，所以设备始终处于 in-sample 或 out-of-sample，不会在每次启动改变。
- 即使 installation 在 out-of-sample、不会派发 metrics，应用仍可读取 `Observe.clientId`。

## 隐私边界

Client ID 是“安装实例”而非“自然人”ID，不代表 EAS 识别了用户身份，但仍是 pseudonymous identifier。把它发送到第三方服务前，应确认产品的隐私说明覆盖这种跨系统关联；不要把它当作脱敏凭证或账号认证 token。

## 关键名词

- **EAS Client ID：**Expo client libraries 为一次安装生成的随机关联 ID，跨 session 稳定。
- **Installation identity：**标识某个安装实例，而非某个具体自然人、硬件或 EAS account。
- **In-sample / out-of-sample：**根据 ID 稳定分配到的 Observe 采样状态；out-of-sample 不上传指标，但本地 API 仍可能读出 ID。
- **Pseudonymous data：**没有直接显示姓名等身份，但能稳定关联同一实例活动的数据；仍应按隐私数据管理。

## 官方代码主题覆盖

源页的代码主题全部覆盖：通过 `Observe.clientId` 读取、把 ID 和反馈数据一同 POST 到自有后端、通过 `eas observe:metrics/events --json` 反向查 ID。installation 生命周期、采样关联、Expo client libraries 共用、Web 返回 null 及隐私处理都已说明。

## 下一页

官方页脚 **Next** 是 [Troubleshooting EAS Observe](https://docs.expo.dev/eas/observe/reference/troubleshooting/)，汇总 dashboard 无数据、TTR / TTI 不显示以及旧 preview 包迁移问题。

**翻页：**[上一页：EAS Observe Metrics Reference](./121-EAS-Observe-Metrics-Reference.md) · [返回目录](./README.md) · [下一页：排查 EAS Observe](./123-EAS-Observe-Troubleshooting.md)
