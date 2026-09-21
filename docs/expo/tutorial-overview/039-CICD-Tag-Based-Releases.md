# 039｜CI/CD Tutorial：用 Git Tag 触发生产发布

**翻页：**[上一页：生产环境自动部署](./038-CICD-Production-Deployments.md) · [目录](./README.md) · [下一页：Web Deployments](./040-CICD-Web-Deployments.md)

**官方页面：**[Using Git tags to trigger production deployments](https://docs.expo.dev/tutorial/cicd/tag-based-releases/)

**版本边界：**EAS Workflows 的 tag trigger 是云端 CI 功能，和 SDK 56 版本独立。本页保持前一章 production.yml 的 fingerprint / build / update jobs，只将触发器改成标签；例子中的 Git 命令只作说明，没有执行。

## Tag 为什么适合当发布事件

release branch 会因每次提交而触发 production workflow，即便该提交不是一次正式发布。Git tag 是绑定到具体 commit 的命名点，例如 v1.0.0；tag 只在被推送时触发，非常适合让 Git 中的版本号与发布版本一致，并留下明确审计记录。

团队可从 main 直接打版本标签发布，不必一直维护 release 分支。EAS Workflows 用 push 事件的 tags pattern 匹配标签名。

## 将 production.yml 换成 Tag Trigger

其他 workflow jobs 不变；把 on.push.branches 替换成 on.push.tags。以下配置示意完整生产管线：fingerprint 与 get-build 判断原生输入是否变化，有匹配构建时发布 OTA update，否则构建新的 Android / iOS binary。

```yaml
name: Deploy to production

on:
  push:
    tags: ["v*.*.*"]

jobs:
  fingerprint:
    name: Fingerprint
    type: fingerprint
    environment: production

  get_android_build:
    name: Check for existing Android build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}
      profile: production

  get_ios_build:
    name: Check for existing iOS build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}
      profile: production

  build_android:
    name: Build Android
    needs: [get_android_build]
    if: ${{ !needs.get_android_build.outputs.build_id }}
    type: build
    params:
      platform: android
      profile: production

  build_ios:
    name: Build iOS
    needs: [get_ios_build]
    if: ${{ !needs.get_ios_build.outputs.build_id }}
    type: build
    params:
      platform: ios
      profile: production

  update_android:
    name: Publish Android update
    needs: [get_android_build]
    if: ${{ needs.get_android_build.outputs.build_id }}
    type: update
    params:
      branch: production
      platform: android

  update_ios:
    name: Publish iOS update
    needs: [get_ios_build]
    if: ${{ needs.get_ios_build.outputs.build_id }}
    type: update
    params:
      branch: production
      platform: ios
```

常见 pattern 有：

- v*：任何以 v 开头的 tag。
- v*.*.*：匹配三段式语义版本，如 v1.0.0。官方教程推荐用这种更严格格式。

工作流文件提交到 main 不会触发它，因为 trigger 已改为 tags。

## 推送版本 Tag

改完 production.yml 后将 workflow 提交并推到 main，再对希望发布的 commit 打 tag 并推送。官方示例命令如下，仅供了解流程：

```sh
git add .eas/workflows/production.yml
git commit -m "Switch production workflow to tag trigger"
git push origin main
```

之后在 main 上完成产品改动、提交，再创建和推送版本 tag：

```sh
git add .
git commit -m "Fix welcome copy"
git tag v0.1.0
git push origin main --tags
```

EAS Dashboard 的 workflow run 会显示 refs/tags/v0.1.0。第一次对应 fingerprint 没有已有 build 时会编译 Android 与 iOS；后续纯 JS tag 在 fingerprint 匹配后转为 update jobs。

## 排除 Release Candidate Tag

v*.*.* 也可能匹配 v1.0.0-rc.1。若不希望预发布版推给 production 用户，可在生产 workflow 排除带 rc 的版本：

```yaml
on:
  push:
    tags: ["v*.*.*", "!v*.*.*-rc.*"]
```

需要让团队先验收 release candidate 时，可以另外建工作流，只匹配预发布标签：

```yaml
on:
  push:
    tags: ["v*.*.*-rc.*"]
```

release-candidate workflow 可复用 fingerprint、get-build 和 build jobs，但不放 update / submit jobs，以免把候选版本交付给真实用户。

## 关键名词

- **Git Tag：**指向某个 commit 的固定标签；与可继续移动的 branch 不同。
- **Glob Pattern：**用于匹配标签名的通配规则。
- **Semantic Version：**常见的主版本.次版本.修订号形式，例如 v2.3.7。
- **Pre-release：**正式版前的测试版本，例如 rc.1；生产 trigger 应明确排除。
- **Tag trigger：**只有匹配的标签推到远端时才运行工作流。

## 官方代码主题覆盖

源页代码主题均有等价示例：把 release branch trigger 改为 v*.*.* tag pattern；保留生产环境 fingerprint/get-build/条件 build 和 update pipeline；workflow 配置提交到 main 的命令；创建版本 tag 和 push tags；排除 *-rc.* 标签以及独立 candidate workflow 只构建不发布的规则。Git 操作没有执行。

## 下一页

官方页脚 **Next** 是 [Web deployments](https://docs.expo.dev/tutorial/cicd/web-deployments/)，讲如何把 Web 构建部署到 EAS Hosting。

**翻页：**[上一页：生产环境自动部署](./038-CICD-Production-Deployments.md) · [返回目录](./README.md) · [下一页：Web Deployments](./040-CICD-Web-Deployments.md)
