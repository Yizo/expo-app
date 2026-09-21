# 037｜CI/CD Tutorial：用 Maestro 自动执行 E2E 测试

**翻页：**[上一页：Preview Builds 与 PR 预览](./036-CICD-Preview-Builds.md) · [目录](./README.md) · [下一页：Production Deployments](./038-CICD-Production-Deployments.md)

**官方页面：**[Run E2E tests with Maestro on EAS Workflows](https://docs.expo.dev/tutorial/cicd/e2e-tests/)

**版本边界：**Maestro job type 在官方当前页面仍标记为 alpha；EAS Workflows 和云构建镜像也会变化。本文按官方教程展示开发阶段的测试 workflow。针对本地 Expo ~56.0.11，请让 eas.json 的 native build 配置匹配 SDK v56；代码和命令只做文档重写，没有运行测试或触发构建。

## E2E 测试的作用

**端到端测试（E2E）**模拟真实用户点击、输入、跳转并断言屏幕内容。Maestro 在 Android Emulator 或 iOS Simulator 上对已构建 App 运行 flow 文件。它能发现只看代码 review 不容易暴露的导航断链、启动崩溃或屏幕内容问题。

Maestro job type 在 EAS Workflows 目前是 alpha；用于团队管线前，先核对官方当前支持状态。

## 新增测试专用 build profile

在 eas.json 的 build 下添加 e2e-test profile。Android 使用无需签名的 APK；iOS 使用 simulator build。这样 workflow 能在云端测试环境安装产物：

```json
{
  "build": {
    "e2e-test": {
      "withoutCredentials": true,
      "android": {
        "buildType": "apk",
        "image": "latest"
      },
      "ios": {
        "simulator": true,
        "image": "latest"
      }
    }
  }
}
```

这里 Android 的 withoutCredentials: true 表示测试包不需要应用商店签名；ios.simulator 选择模拟器产物而不是给真机分发的 IPA。

## 编写 Maestro flow

在项目根目录建立 .maestro/，以 appId 指定 Expo app config 中的 Android package 或 iOS bundle identifier。下面两个 flow 分别检查首页标题和 Settings 导航：

```yaml
appId: com.example.myapp
---
- launchApp
- assertVisible: "Welcome"
```

```yaml
appId: com.example.myapp
---
- launchApp
- tapOn: "Settings"
- assertVisible: "Settings"
```

第一个 appId 要替换成自己的包标识。launchApp 启动构建出的应用，tapOn 模拟点击，assertVisible 在屏幕上找可见内容。

## Android 与 iOS 测试 Workflow

build jobs 为两个平台创建 e2e-test 产物。每个平台对应一个 Maestro job，依赖本平台 build 完成，并传入 build_id 和 flow_path：

```yaml
name: E2E Tests

jobs:
  build_android:
    name: Build Android for E2E
    type: build
    params:
      platform: android
      profile: e2e-test

  build_ios:
    name: Build iOS for E2E
    type: build
    params:
      platform: ios
      profile: e2e-test

  test_android:
    name: Run Maestro tests (Android)
    needs: [build_android]
    type: maestro
    params:
      build_id: ${{ needs.build_android.outputs.build_id }}
      flow_path: [".maestro/home.yml", ".maestro/navigate.yml"]

  test_ios:
    name: Run Maestro tests (iOS)
    needs: [build_ios]
    type: maestro
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
      flow_path: [".maestro/home.yml", ".maestro/navigate.yml"]
```

没有 job 依赖的两个 build 可以并行启动；每个平台的 test job 则等待对应 build。flow_path 可列多个 YAML flow 文件。手动运行：

```sh
eas workflow:run .eas/workflows/e2e-tests.yml
```

Dashboard 中查看两边构建，再查看 Maestro 的 flow 结果和日志。

## 自动触发 E2E workflow

若要在每个 PR 自动运行，给 workflow 添加 pull_request 触发器：

```yaml
on:
  pull_request:
    branches: ["*"]
```

如果 E2E 测试较慢，希望需要时再运行，可以只在有人为 PR 加上 test 标签时触发：

```yaml
on:
  pull_request_labeled:
    labels: ["test"]
```

这两个触发规则是替代方案：第一个适合所有 PR 的持续检查，第二个让维护者按需启动。

## 关键名词

- **Maestro Flow：**用简洁 YAML 描述启动、点击、输入与断言的自动化测试步骤。
- **build_id：**EAS Build 产生的构建记录标识；Maestro 使用它选择待测应用。
- **flow_path：**项目中需要运行的 Maestro flow 文件列表。
- **Simulator build / APK：**面向自动测试设备的构建产物；无需为应用商店分发进行正式签名。
- **Alpha：**仍在早期开发的功能状态；API 或行为可能变化。

## 官方代码主题覆盖

源页全部代码主题均有等价示例：e2e-test build profile 的免凭据 Android APK 和 iOS Simulator 设置；首页 Welcome flow 与 Settings 导航 flow；Android/iOS build + Maestro jobs、build_id 表达式与多个 flow_path；手动 eas workflow:run；每个 PR 的 pull_request 触发器和仅在 test label 时触发的 pull_request_labeled 配置。示例 package ID 以占位应用标识呈现。

## 下一页

官方页脚 **Next** 是 [Production deployments](https://docs.expo.dev/tutorial/cicd/production-deployments/)，将前面的构建与 EAS Update 组合成生产发布工作流。

**翻页：**[上一页：Preview Builds 与 PR 预览](./036-CICD-Preview-Builds.md) · [返回目录](./README.md) · [下一页：Production Deployments](./038-CICD-Production-Deployments.md)
