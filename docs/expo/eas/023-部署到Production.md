# 023｜用 EAS Workflows 部署到 Production

**翻页：**[上一页：清理 EAS Update branches](./022-清理EAS-Update-Branches.md) · [目录](./README.md) · [下一页：运行 E2E 测试](./024-运行E2E测试.md)

**官方页面：**[Deploy to production with EAS Workflows](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/)

**版本说明：**此工作流需要 EAS Build、Submit、Update 均已设置，且 EAS Update branch / production profile 与 app runtime 兼容。它只作为 YAML 教程示例，没有运行 EAS、访问商店或发布更新。

## 根据 Fingerprint 选择发布方式

每次 main 分支收到新 commit 后，流程先计算原生项目 fingerprint，然后 Android / iOS 各自查找 production profile 中是否已有相同 fingerprint 的构建：

- 找不到兼容 build：生成新 production build，再提交到应用商店。
- 已存在兼容 build：说明 native characteristics 未变化，可发布 OTA update 到 production branch。

发布之前需要完成 EAS Build profile / credentials、EAS Submit 的商店凭证，以及 EAS Update 的配置。EAS Update 首次设置命令：

```sh
eas update:configure
```

## main push 的自动 workflow

示意配置保留源页的每个阶段与平台分支：

```yaml
name: Deploy to production

on:
  push:
    branches: ['main']

jobs:
  fingerprint:
    type: fingerprint
    environment: production

  find_android_build:
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}
      profile: production

  find_ios_build:
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}
      profile: production

  build_android:
    needs: [find_android_build]
    if: ${{ !needs.find_android_build.outputs.build_id }}
    type: build
    params:
      platform: android
      profile: production

  build_ios:
    needs: [find_ios_build]
    if: ${{ !needs.find_ios_build.outputs.build_id }}
    type: build
    params:
      platform: ios
      profile: production

  submit_android:
    needs: [build_android]
    type: submit
    params:
      build_id: ${{ needs.build_android.outputs.build_id }}

  submit_ios:
    needs: [build_ios]
    type: submit
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}

  update_android:
    needs: [find_android_build]
    if: ${{ needs.find_android_build.outputs.build_id }}
    type: update
    params:
      branch: production
      platform: android

  update_ios:
    needs: [find_ios_build]
    if: ${{ needs.find_ios_build.outputs.build_id }}
    type: update
    params:
      branch: production
      platform: ios
```

Fingerprint job 为 Android / iOS 分别输出 hash；Get Build job 查询已有 build。后续的 if 条件基于 build_id 判断，因此只会走 build+submit 或 update 的相应分支。Android 与 iOS 的流程互不阻塞，可并行执行。

## 关键名词

- **Fingerprint**：描述 native project 特征的 hash；原生配置或模块变化可能导致新 fingerprint。
- **get-build**：按 fingerprint / profile 查找可复用的已成功构建。
- **build_id**：EAS Build 产物 ID，Submit job 用它指定要上传的 binary。
- **OTA update**：只更新兼容 binary 的 JavaScript / assets，不改变 native code。
- **Production branch**：EAS Update 的正式发布分支；还需确保 production channel 指向目标 branch。

## 官方代码主题覆盖

源页所有工作流代码主题均已改写：main 分支 push trigger、EAS Update configure 命令、Fingerprint jobs 和平台 hash、按 production profile 查询 Android / iOS build、按 build_id 是否存在条件执行 Build + Submit 或 Update，以及两个平台分别发往 production branch 的更新流程。未提交商店或发布 OTA。

## 下一页

页脚 **Next** 指向 [Run E2E tests](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)，展示如何在 EAS workflow 中执行端到端测试。

**翻页：**[上一页：清理 EAS Update branches](./022-清理EAS-Update-Branches.md) · [返回目录](./README.md) · [下一页：运行 E2E 测试](./024-运行E2E测试.md)
