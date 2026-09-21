# 035｜CI/CD Tutorial：自动化 Development Builds

**翻页：**[上一页：运行第一个 EAS Workflows Job](./034-运行首个EAS-Workflow.md) · [目录](./README.md) · [下一页：Preview Builds](./036-CICD-Preview-Builds.md)

**官方页面：**[Automate development builds with EAS Workflows](https://docs.expo.dev/tutorial/cicd/development-builds/)

**版本边界：**示例用 EAS Workflows 的 fingerprint / get-build 预打包 job 和 development build profile；这些属于未版本化的 EAS 教程。项目 Expo ~56.0.11 的原生依赖与 build 工具版本仍要按 [SDK v56.0.0 参考](https://docs.expo.dev/versions/v56.0.0/)确认。下列 Git / build 命令与 YAML 是原创改写后的学习示例，没有实际运行。

## 为什么自动化开发构建

开发期新增原生库、修改权限或升级 SDK 时，需要重新生成 development build；每次 push 都重建 Android / iOS 会让团队等待。反之，如果只是改 TypeScript、JavaScript 或屏幕文案，已有的开发客户端通常仍兼容。

本章用 Expo Fingerprint 比较本次源码的原生特征与之前 build。匹配时复用已有构建；不匹配时创建新原生构建。工作流还会在 fingerprint 前运行 Jest 单元测试，测试失败就不会继续到构建。

**Development build** 是带有开发工具的原生客户端，除 Expo Go 内置模块外，还能容纳项目需要的原生库。团队成员可安装同一兼容构建，再用 Metro 加载各自的 JS 变更。

## 先为两个平台创建一次 Development Build

EAS 第一次为 profile 构建时可能需要生成签名凭据。教程先手动为 Android 与 iOS 建立 development build：

```sh
eas build --profile development --platform all
```

成功后云端已有可供团队复用的初始构建。eas build:dev 可以获取并安装最新兼容的开发构建；若 fingerprint 匹配已存在的构建，EAS 可以下载它而不重建。

## 初始工作流：并行构建 Android 与 iOS

在 Expo 项目根目录的 .eas/workflows/build.yml 中定义两个 build job。两个 job 没有 needs 依赖，所以默认并行执行：

```yaml
name: Development builds

jobs:
  build_android:
    name: Build Android
    type: build
    params:
      platform: android
      profile: development

  build_ios:
    name: Build iOS
    type: build
    params:
      platform: ios
      profile: development
```

platform 选择目标操作系统；profile 指向 eas.json 中的构建 profile。运行工作流：

```sh
eas workflow:run .eas/workflows/build.yml
```

在 Dashboard 的 workflow graph 与 build 日志查看运行状态。构建完成后可以用 Orbit 的 Install/Open 按钮，或下载 artifacts 手动安装到设备、Android emulator 或 iOS simulator。

## 添加 fingerprint 与查找复用构建

先加 fingerprint job。它会分别计算 Android 与 iOS 原生特征哈希：

```yaml
fingerprint:
  name: Fingerprint
  type: fingerprint
  environment: development
```

environment 选择 EAS 环境变量集合；它与 profile 不同。profile 决定如何构建，environment 决定在构建中注入哪些 EAS 环境变量。

然后加两个 get-build job。每个 job 等待 fingerprint，使用对应平台的哈希和 development profile 查找已有 binary：

```yaml
get_android_build:
  name: Check for existing Android build
  needs: [fingerprint]
  type: get-build
  params:
    fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}
    profile: development

get_ios_build:
  name: Check for existing iOS build
  needs: [fingerprint]
  type: get-build
  params:
    fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}
    profile: development
```

若找到兼容构建，输出包含 build_id；未找到时 build_id 为空。workflow expression 会从依赖 job 输出中读取哈希。

## 有条件地构建

让 build job 依赖对应的 get-build job；只有匹配构建不存在时才启动新 build：

```yaml
build_android:
  name: Build Android
  needs: [get_android_build]
  if: ${{ !needs.get_android_build.outputs.build_id }}
  type: build
  params:
    platform: android
    profile: development

build_ios:
  name: Build iOS
  needs: [get_ios_build]
  if: ${{ !needs.get_ios_build.outputs.build_id }}
  type: build
  params:
    platform: ios
    profile: development
```

表达式中的 ! 表示取反：没有 build ID 才构建。如果找到可复用的构建，if 为 false，两个 build job 都跳过。

## 完整自动 workflow

把 on.push、fingerprint、get-build 和条件 build 合到一起：

```yaml
name: Development builds

on:
  push:
    branches: [main]

jobs:
  fingerprint:
    name: Fingerprint
    type: fingerprint
    environment: development

  get_android_build:
    name: Check for existing Android build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}
      profile: development

  get_ios_build:
    name: Check for existing iOS build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}
      profile: development

  build_android:
    name: Build Android
    needs: [get_android_build]
    if: ${{ !needs.get_android_build.outputs.build_id }}
    type: build
    params:
      platform: android
      profile: development

  build_ios:
    name: Build iOS
    needs: [get_ios_build]
    if: ${{ !needs.get_ios_build.outputs.build_id }}
    type: build
    params:
      platform: ios
      profile: development
```

团队代码 push 到 main 会触发检查。只改 JS 时若存在匹配的构建，Build jobs 跳过；安装现有 development build 后，启动 Metro 即可使用最新 JS：

```sh
npx expo start
```

## 把单元测试设为构建门槛

需要项目已配置 Jest。自定义 run_tests job 先 checkout 源码、安装 node_modules 并运行 Jest CI 模式；fingerprint 必须等待测试通过，所以失败时后面的指纹和 build 任务不执行：

```yaml
run_tests:
  name: Run unit tests
  steps:
    - uses: eas/checkout
    - uses: eas/install_node_modules
    - run: npx jest --ci

fingerprint:
  name: Fingerprint
  needs: [run_tests]
  type: fingerprint
  environment: development
```

eas/checkout 把 repository 内容取到新的 workflow 虚拟机；自定义 job 默认没有项目文件。eas/install_node_modules 按项目检测到的包管理器安装依赖。Jest 的 --ci 模式运行完就退出，不进入交互式 watch。

单元测试门槛工作流的 push 触发器仍是 main。教程随后展示为 workflow 和测试文件提交并推送的代码；这里仅记录指令，不执行：

```sh
git add .
git commit -m "Add unit tests to development builds workflow"
git push origin main
```

## 关键名词

- **Fingerprint：**对依赖、配置、原生目录等原生特征生成的标识；不等于 Git commit hash。
- **get-build：**按 fingerprint 和 profile 查找可复用构建，输出 build ID 或空值。
- **Job dependency：**needs 表达任务先后关系；测试失败会阻止后续 job。
- **Build profile 与 environment：**前者定义构建类型 / 参数，后者选择云端环境变量集合，可以同名但用途不同。
- **Development client：**用于项目日常开发的原生客户端；与面向普通用户发布的 production 应用不同。

## 官方代码主题覆盖

源页各段代码主题都在本页有示例：初始 EAS build Android+iOS 命令；Android / iOS 并行 build jobs；eas workflow:run；fingerprint 与 platform 哈希输出；get-build 及 needs 表达式；只在 build ID 不存在时执行的 if；push-main 的完整串联 workflow；git add / git commit / git push 与 npx expo start；Jest custom job 的 checkout、依赖安装、npx jest --ci 和测试成功后再 fingerprint。代码根据官方当前教程重写，未执行。

## 下一页

官方 **Next** 转入 [Preview builds](https://docs.expo.dev/tutorial/cicd/preview-builds/)，继续扩展 workflow 为团队提供预览构建与 PR 预览更新。

**翻页：**[上一页：运行第一个 EAS Workflows Job](./034-运行首个EAS-Workflow.md) · [返回目录](./README.md) · [下一页：Preview Builds](./036-CICD-Preview-Builds.md)
