# 038｜CI/CD Tutorial：生产环境自动部署

**翻页：**[上一页：用 Maestro 自动执行 E2E 测试](./037-CICD-E2E-Tests.md) · [目录](./README.md) · [下一页：Tag-based Releases](./039-CICD-Tag-Based-Releases.md)

**官方页面：**[Automate production deployments with EAS Workflows](https://docs.expo.dev/tutorial/cicd/production/)

**版本边界：**本文示例基于 EAS Workflows 当前的 fingerprint、get-build、build、update 和 submit job；它们是 EAS 云端工作流能力，不对应某个单独 Expo SDK 版本。本地项目 Expo ~56.0.11 的 build profile、原生模块与 runtime 兼容性仍以 [SDK v56.0.0 参考](https://docs.expo.dev/versions/v56.0.0/)及项目配置为准。命令和 Git 流程只作文档示例，没有执行。

## 为什么生产发布用 Release Branch

开发 CI 通常在 main 的每次 push 运行。生产 CD 如果也针对 main 每次 push，merge 一个改动就可能直接变成发布。使用 release/* 分支可以把“持续集成”与“有意交付到生产”分开：main 执行测试或 development builds；release/版本号 分支触发 production workflow。

| Workflow | 触发分支 | Build profile | 目的 |
| --- | --- | --- | --- |
| build.yml | main | development | 每次推送的 CI，可跑单测和开发构建。 |
| preview.yml | main | preview | 为团队及 stakeholder 提供内部预览构建。 |
| production.yml | release/* | production | 准备好的 release branch 才开始生产交付。 |

这几个 YAML 文件放在同一 GitHub repository 不冲突，因为触发器和 profile 不同。

首次发布前，先为 production profile 手动构建 Android 和 iOS，确保 EAS 凭据已经就绪：

```sh
eas build --profile production --platform all
```

## 第一阶段：Release Branch 上做双平台构建

production.yml 监听 release/*，并行创建 Android / iOS production build：

```yaml
name: Deploy to production

on:
  push:
    branches: ["release/*"]

jobs:
  build_android:
    name: Build Android
    type: build
    params:
      platform: android
      profile: production

  build_ios:
    name: Build iOS
    type: build
    params:
      platform: ios
      profile: production
```

Android 产物通常是 AAB，iOS 产物是 IPA。只是这份初始 workflow 每次推送都会重建，原生代码未变也一样。

## 加 Fingerprint，跳过不需要的原生构建

新增 fingerprint job，用 production EAS environment 计算原生特征；environment 会影响 fingerprint，因为生产 API URL、feature flags 等值可能进入 native build。随后 get-build 查找同平台、同 profile、同 fingerprint 的历史构建：

```yaml
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
```

只在 get-build 没返回 build ID 时创建新 binary：

```yaml
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
```

没有相同 fingerprint 的历史 build 时，条件为 true，两个平台的 build 并行执行；匹配时跳过 build job。

## 原生改动 Build，JS 改动用 OTA Update

纯 JavaScript / TypeScript 变更通常不需要重编原生二进制。若已有与 production fingerprint 匹配的 build，就让 update job 向生产分支发布 OTA 更新：

```yaml
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

分支逻辑如下：没有兼容 build ID → 构建新的 Android/iOS binary；已有兼容 build ID → 发布对应平台 OTA update。新增 native module、权限或不兼容的运行时改动仍要生成新的 build。

## 测试 Release Branch 流程

先确保 workflow 文件已经存在于 GitHub 默认分支，然后从 main 创建 release/1.0.0 并推送：

```sh
git checkout -b release/1.0.0
git push origin release/1.0.0
```

初次该 fingerprint 没有历史构建，因此 build jobs 运行，update jobs 被跳过。再做一处纯 JS 改动并推送，预期 fingerprint 匹配后跳过构建，改走两个平台的 update job：

```sh
git add .
git commit -m "Update welcome text"
git push origin release/1.0.0
```

此处仅解释官方演示命令和预期结果，没有实际创建分支、提交或发布。

## 可选：构建后提交 App Store

自动提交还需要 EAS Submit 凭据和商店端准备。Android 第一次上架前，可能需要先手动上传首个 AAB；iOS 需 Apple Developer Program 账号和相应签名资料。

满足要求后可在 build job 后添加 submit job，使用上一步 build ID 指定提交哪个产物：

```yaml
  submit_android:
    name: Submit Android
    needs: [build_android]
    type: submit
    params:
      build_id: ${{ needs.build_android.outputs.build_id }}

  submit_ios:
    name: Submit iOS
    needs: [build_ios]
    type: submit
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
```

submit job 依赖 build job，因此只有新建了 production binary 才会提交。只有 JS 改动而使用 OTA update 时，不会生成新 build，也不会运行商店提交步骤。

## 关键名词

- **Release Branch：**明确准备发布的分支，例如 release/1.0.0。
- **CI / CD：**CI 对每次变化执行集成检查；CD 在准备好时自动交付发布。
- **Production environment：**EAS 环境变量集合；本页把它用于 production fingerprint/build。
- **Fingerprint / get-build：**检测原生输入是否改变，并查询能否复用已有 binary。
- **OTA Update：**向已有且兼容的 production 安装包发布 JS 与资源，不会替代原生编译。
- **Submit job：**用 EAS Submit 把 EAS build ID 对应的 binary 上传应用商店。

## 官方代码主题覆盖

源页所有 code / configuration 主题都覆盖：手动 production build；release/* push trigger 与 Android/iOS production build；fingerprint production environment；双平台 get-build 哈希输出；仅缺少兼容 build 时运行的条件 build；已有 build ID 时运行 Android/iOS update；release/1.0.0 创建、推送与后续 JS commit/push 命令；通过 build_id 把新产物交给两个 submit jobs。商店凭据和首个 AAB 手动上传条件也已说明。

## 下一页

官方 **Next** 是 [Tag-based releases](https://docs.expo.dev/tutorial/cicd/tag-based-releases/)，展示如何由版本标签触发生产发布，而不是维护长期 release branch。

**翻页：**[上一页：用 Maestro 自动执行 E2E 测试](./037-CICD-E2E-Tests.md) · [返回目录](./README.md) · [下一页：Tag-based Releases](./039-CICD-Tag-Based-Releases.md)
