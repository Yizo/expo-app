# 096｜用 EAS CLI 管理 Update Branches 和 Channels

**翻页：**[上一页：How EAS Update Works：Build / Update 兼容关系](./095-EAS-Update-How-It-Works.md) · [目录](./README.md) · [下一页：Runtime Versions and Updates](./097-EAS-Update-Runtime-Versions.md)

**官方页面：**[Manage branches and channels with EAS CLI](https://docs.expo.dev/eas-update/eas-cli/)

**版本边界：**下列 EAS Update CLI commands 属于 cloud service 管理接口，项目 Expo ~56.0.11 需要确保 branch 上的 update 与对应 platform / runtimeVersion 匹配。本文仅记录命令，不读取或改变 EAS project 状态。

## Channel 和 Branch

- **Channel：**build 中固定的 update route label，例如 production。
- **Branch：**按时间排序的一串 EAS Update；最新 update 是 active update。
- 任意 channel 可链接到任意 branch；默认创建同名链接，例如 production channel → production branch。

通过切换 mapping，同一批 build 可改为接收新 branch 的更新。

## 查询 Channels

```sh
eas channel:list
eas channel:view production
eas channel:create production
```

list 查看全部 channels，view 查看特定 channel 指向哪个 branch，create 只在不存在该 channel 时用。

## 查询 Branches 与 Update

```sh
eas branch:list
eas branch:view version-1.0
eas update:view <update-group-id>
```

branch:view 还会列出该 branch 上的 update；update:view 则查看单个 Update Group。

## 发布 Update

显式指定 EAS Update branch 与 message：

```sh
eas update --branch version-1.0 --message "Fixes typo"
```

如果项目使用 Git，--auto 会从当前 Git branch 和最新 commit 自动提取 branch 名及 message：

```sh
eas update --auto
```

EAS branch 与 Git branch 类似但互不相同：Git 保存源码 commits；EAS branch 保存发布的 update groups。

## 删除或重命名 Branch

```sh
eas branch:delete version-1.0
eas branch:rename --from version-1.0 --to version-1.0-new
```

重命名不会断开现有 channel mapping；channel 会继续指向重命名后的 branch。

## Republish Previous Update

如需让 branch 上以前发布的 update 再次变为 active，可按 update group ID 或 branch 选择：

```sh
eas update:republish --group <update-group-id>
eas update:republish --branch version-1.0
```

使用 group ID 需要先查询对应 ID；使用 branch 时 CLI 会列出最近 update 让你选。Republish 将该 update 放在当前 branch history 顶部，使客户端下次检查时下载。

## 官方代码主题覆盖

源页所有 CLI themes 均覆盖：channel list / view / create；branch list / view；update:view；eas update --branch 与 --auto；branch delete / rename；按 group ID / branch eas update:republish。命令没有执行。

## 下一页

官方页脚 **Next** 是 [Runtime versions and updates](https://docs.expo.dev/eas-update/runtime-versions/)，说明怎样防止 update 调用 build 中不存在的 native API。

**翻页：**[上一页：How EAS Update Works：Build / Update 兼容关系](./095-EAS-Update-How-It-Works.md) · [返回目录](./README.md) · [下一页：Runtime Versions and Updates](./097-EAS-Update-Runtime-Versions.md)
