# 090｜EAS Update Rollouts：分阶段发布

**翻页：**[上一页：EAS Update 检查、下载与应用策略](./089-EAS-Update-Downloading.md) · [目录](./README.md) · [下一页：EAS Update Rollbacks](./091-EAS-Update-Rollbacks.md)

**官方页面：**[Rollouts](https://docs.expo.dev/eas-update/rollouts/)

**版本边界：**本页的 Update / branch rollout 命令属于 EAS Update 发布服务。具体 EAS CLI 交互可能改变；项目 Expo ~56.0.11 要先保证 runtimeVersion / platform 兼容，然后再考虑逐步发布。

## Rollout 的目标

Rollout 是把变更先发送给一部分用户，观察是否有 crash / adoption 问题，再逐渐扩大比例。EAS 支持两种机制：

- **Per-update rollout：**指定一个具体 update，按百分比逐步向更多用户开放。
- **Branch-based rollout：**让某个 channel 的一部分用户逐渐改为从另一条 update branch 接收内容。

这两种 rollout 的目标不同：前者针对单次 update ID；后者把一串更新 branch 作为发布对象。

## Per-update Rollout

启动一次只开放给 10% 用户的 update：

```sh
eas update --rollout-percentage=10
```

继续或调整百分比时运行 eas update:edit，CLI 会提示选择 update 并输入新比例。完成 rollout 可把比例调到 100；如果撤销，用：

```sh
eas update:revert-update-rollout
```

状态可用 eas update:list 或 eas update:view 查看。限制如下：

- 一个 branch 同时只能 rollout 一个 update。
- rollout 未结束前，不能再给相同 runtimeVersion 发布新 update，否则可能覆盖当前 rollout。
- 若 branch 原本已有 update，revert 会 republish control update，把客户端送回之前状态。
- 若 branch 没有旧 update，撤销时会生成 rollback-to-embedded update，让客户端退回 binary 内置 JS。

## Branch-based Rollout

启动交互式 branch rollout：

```sh
eas channel:rollout
```

CLI 引导选择 channel、待 rollout 的新 branch 和百分比；之后再次运行同命令可以选择 Edit 修改比例。

结束时有两类动作：

- **Republish and revert：**在确认新 branch 状态后，将该 branch 最近的 update republish 到原 branch，使所有用户最终都指向同一份 update。
- **Revert：**放弃新 branch 的 update，并把用户流量退回旧 branch。

一个 channel 同时只能有一个 branch rollout。运行 eas channel:rollout 可查看状态。rollout 期间如需发布到具体参与的 branch，使用 eas update --branch [branch]；不能仅用 eas update --channel [channel]，因为命令无法判断要关联 rollout 的哪条 branch。

## 关键名词

- **Control Update：**已有 branch / channel 上维持原行为的 update；rollback 可能把它重新发布到用户。
- **Embedded Update：**随 native binary 一起打包的 JS / assets，用户安装时即存在。
- **Per-update Rollout：**按一个 update ID 设置受众比例。
- **Branch-based Rollout：**在一条 channel 下按百分比切换 update branch。
- **RuntimeVersion：**rollback / rollout 都只能给兼容 runtime 的 binary 分发相应 update。

## 官方代码主题覆盖

源页所有 command / process topics 均已整理：--rollout-percentage 启动 per-update rollout；update:edit 调整百分比；100% 结束或 update:revert-update-rollout 回退；update:list / view 查看状态；eas channel:rollout 启动、编辑、结束 branch rollout；eas update --branch 发布到 rollout 内指定 branch 与 channel 命令不适用的边界。

## 下一页

官方页脚 **Next** 是 [Rollbacks](https://docs.expo.dev/eas-update/rollbacks/)，区分恢复到以前发布的 update 与退回 app 内 embedded update。

**翻页：**[上一页：EAS Update 检查、下载与应用策略](./089-EAS-Update-Downloading.md) · [返回目录](./README.md) · [下一页：EAS Update Rollbacks](./091-EAS-Update-Rollbacks.md)
