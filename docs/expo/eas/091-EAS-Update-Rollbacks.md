# 091｜EAS Update Rollbacks

**翻页：**[上一页：EAS Update Rollouts：分阶段发布](./090-EAS-Update-Rollouts.md) · [目录](./README.md) · [下一页：Bundle Diffing for EAS Update](./092-EAS-Update-Bundle-Diffing.md)

**官方页面：**[Rollbacks](https://docs.expo.dev/eas-update/rollbacks/)

**版本说明：**Rollback 是 EAS Update 的服务端发布操作，可切换客户端下次启动要加载的 JS / assets。它不会更改已安装 App 的原生 binary；如果原生兼容性变化，应先发布新的 EAS Build。

## 两种回退目标

EAS Update 支持两种 rollback：

- 回到以前已经发布过的 update。
- 回到设备当前 binary 内嵌的 embedded update。

## 启动回退向导

CLI 命令会进入交互流程，先选目标 branch / update，再选择 rollback 类型：

```sh
eas update:rollback
```

选择 previously published update 时，EAS 会将那份旧 update 重新 publish，让兼容客户端之后拉取稳定版。选择 embedded update 时，服务端告诉客户端运行当前 build 中自带的 JS / assets。

## 回退后继续发布

回退是一次新的远端指向 / rollback operation；之后再次发布的 update 仍会发给 channel 上兼容的所有客户端。

## 关键名词

- **Previously Published Update：**此前在同一 branch / channel 发布且兼容当前 runtime 的 update。
- **Embedded Update：**构建时包含在 APK / IPA 内的初始 bundle。
- **Rollback：**服务端改变下一次 update check 结果；不会回滚 native code / binary。
- **Update Runtime Compatibility：**设备仅能接收 platform 与 runtimeVersion 相符的 update。

## 官方代码主题覆盖

源页只有 eas update:rollback 一个 CLI 命令主题；本页保留该命令，并说明回到旧 update 与回到 embedded bundle 的两种交互选项，以及回退后再次发布会如何影响用户。

## 下一页

官方页脚 **Next** 是 [Bundle diffing for EAS Update](https://docs.expo.dev/eas-update/bundle-diffing/)，讲如何为既有 bundle 生成仅含差异的 update patch。

**翻页：**[上一页：EAS Update Rollouts：分阶段发布](./090-EAS-Update-Rollouts.md) · [返回目录](./README.md) · [下一页：Bundle Diffing for EAS Update](./092-EAS-Update-Bundle-Diffing.md)
