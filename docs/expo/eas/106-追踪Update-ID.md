# 106｜从 Update ID 追踪到 EAS Dashboard

**翻页：**[上一页：从 Classic Updates 迁移](./105-从-Classic-Updates迁移.md) · [目录](./README.md) · [下一页：估算 EAS Update 带宽用量](./107-估算EAS-Update带宽.md)

**官方页面：**[How to trace an update ID back to the EAS dashboard](https://docs.expo.dev/eas-update/trace-update-id-expo-dashboard/)

**版本边界：**这是未版本化的 EAS Update 使用说明。项目使用 Expo ~56.0.11；SDK v56.0.0 的 `expo-updates` API 提供 `Updates.isEmbeddedLaunch` 和 `Updates.updateId`，并推荐安装 `expo-updates ~56.0.27`。Dashboard 的路由和展示界面可能随服务调整。

## 为什么 Update ID 有时无法在 Dashboard 查到

`Updates.updateId` 始终能返回当前 update 的 ID，但当前代码可能来自 binary 安装时就包含的 **Embedded Update**，而不是之后从网络下载的更新。内置更新没有作为远端 update 发布到 EAS Dashboard，拿该 ID 搜索时会找不到记录。

先检查 `Updates.isEmbeddedLaunch`：`true` 表示 App 正在运行打包进 binary 的更新；`false` 表示当前使用从更新服务下载的版本，可继续用 ID 追踪远端记录。

## 在界面标记当前 Update 来源

下面组件按 v56 `expo-updates` API 展示当前状态，避免把没有 Dashboard 记录的 embedded ID 当作发布故障：

```tsx
import { Text } from 'react-native';
import * as Updates from 'expo-updates';

export default function UpdateStatus() {
  const message = Updates.isEmbeddedLaunch
    ? '当前运行的是 App 内置更新，无法在 EAS Dashboard 查找。'
    : '当前运行的是已下载更新，可以在 EAS Dashboard 追踪。';

  return <Text>{message}</Text>;
}
```

`isEmbeddedLaunch` 是对运行来源的判断，不等于网络状态，也不直接说明用户安装的 App build 是否是最新。

## 用 Update ID 打开 Dashboard

在 Dashboard 中打开某次更新组时，URL 的组成形式如下：

```text
https://expo.dev/accounts/ACCOUNT/projects/PROJECT/updates/UPDATE_GROUP_ID
```

把最后一段 `UPDATE_GROUP_ID` 替换为代码读取的 `Updates.updateId`，可以打开对应平台 update 所属的 update group：

```text
https://expo.dev/accounts/ACCOUNT/projects/PROJECT/updates/UPDATE_ID
```

Update ID 对应平台更新；浏览器会打开该 update 所属的 group。账号名、项目 slug 与 update ID 应从自己的 Expo 项目中读取，不要把上面占位内容照抄到生产链接。

## 关键名词

- **Embedded Update：**随原生 binary 一起打包的初始 JS / 静态资源版本，即使设备尚未联网也能启动。
- **Downloaded Update：**binary 安装之后，从 EAS Update 服务下载并应用的版本。
- **Update ID：**标识一个平台 update 的唯一 ID，可从 `Updates.updateId` 读取。
- **Update Group：**Dashboard 中聚合同一次发布多个平台 update 的记录；点开 group 后可以检查各平台状态。
- **`isEmbeddedLaunch`：**`expo-updates` 的只读状态，指出本次 App launch 当前使用 embedded 还是远端下载的 update。

## 官方代码主题覆盖

源页的代码主题均已覆盖：用 `Updates.isEmbeddedLaunch` 区分 embedded 与 downloaded update 的 React Native 展示示例；EAS Dashboard 的 account / project / update group URL 结构；以及用 `Updates.updateId` 替换 URL 中 group ID、跳转到对应平台 update 的方式。

## 下一页

官方页脚 **Next** 是 [Estimate bandwidth usage](https://docs.expo.dev/eas-update/estimate-bandwidth/)，解释如何估算 Update 下载带宽、测量 bundle 的压缩体积并优化用量。

**翻页：**[上一页：从 Classic Updates 迁移](./105-从-Classic-Updates迁移.md) · [返回目录](./README.md) · [下一页：估算 EAS Update 带宽用量](./107-估算EAS-Update带宽.md)
