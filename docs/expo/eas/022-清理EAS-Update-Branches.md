# 022｜用 EAS Workflows 清理 Update branches

**翻页：**[上一页：用 EAS Workflows 发布 Preview Updates](./021-发布Preview-Updates.md) · [目录](./README.md) · [下一页：部署到 Production](./023-部署到Production.md)

**官方页面：**[Clean up EAS Update branches with EAS Workflows](https://docs.expo.dev/eas/workflows/examples/branch-cleanup/)

**版本说明：**本例会监听 GitHub ref_delete 并实际删除 EAS Update branch。使用前先检查 EAS Update 映射和要保护的 branch pattern；本文只是文档示例，没有触发删除操作。

## 清理什么

如果更新分支按 GitHub branch 命名，删除 Git branch 后，对应的 EAS Update branch 会成为孤儿记录。可以由 EAS workflow 在收到 ref_delete 事件时删除同名 Update branch。

前置条件：

1. 已运行 eas update:configure 为项目配置 EAS Update。
2. EAS project 已关联 GitHub repo。
3. branch cleanup workflow 文件放在仓库默认分支上，因为 branch 删除后已无法从被删 branch 读取 workflow。

## Workflow 示例

下列模式监听所有分支删除，但排除 main。branch-delete job 删除名为 GitHub ref name 的 EAS Update branch：

```yaml
name: Branch cleanup

on:
  ref_delete:
    branches: ['*', '!main']

jobs:
  delete_update_branch:
    type: branch-delete
    params:
      branch_name: ${{ github.ref_name }}
```

若希望保留 release 分支，可追加否定 filter，例如 !release/**。workflow 只在匹配模式的 Git branch 删除时触发。

## 运行语义与保护条件

- GitHub 删除分支时，EAS 从默认分支 HEAD 读取 workflow 配置；所以要先把 workflow 文件放到 default branch。
- ref_delete event 的 github.sha 表示默认分支当前提交，不是刚被删分支的最后一个 commit。
- branch-delete job 默认 fail_on_missing 为 false；Update branch 不存在 / 已被删除时 job 仍成功。
- 如果 EAS Update channel 仍指向待删 branch，删除会失败并提示 channel mapping 冲突；先调整映射再清理。
- 只应清理与 Git branch 一一对应的 Update branch。若生产 channel / 发布策略也使用该名称，应加 branch 排除规则。

## 关键名词

- **ref_delete**：GitHub 在 branch / ref 删除时发给 EAS 的事件。
- **Update branch**：EAS Update 中保存某条 JS 更新序列的分支，可由 channel 指向。
- **Orphan branch**：Git branch 删除后遗留、但没人再更新或引用的 EAS Update branch。
- **Default branch HEAD**：默认分支当前 commit；删除事件读取配置时使用它，而不是已消失的 branch。
- **Branch pattern**：筛选触发范围的分支 glob / negation，例如 !main。

## 官方代码主题覆盖

源页所有代码主题均有重写示例：EAS Update configure 命令、ref_delete branches 过滤器、默认分支配置要求、branch-delete job、branch_name 与 GitHub ref_name 映射、fail_on_missing 默认行为、channel mapping 阻止删除及 main / release branch 排除 pattern。

## 下一页

页脚 **Next** 指向 [Deploy to production](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/)，将 Build / Submit 或 OTA 更新接入 main 分支发布流程。

**翻页：**[上一页：用 EAS Workflows 发布 Preview Updates](./021-发布Preview-Updates.md) · [返回目录](./README.md) · [下一页：部署到 Production](./023-部署到Production.md)
