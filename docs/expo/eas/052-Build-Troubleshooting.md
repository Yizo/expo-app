# 052｜排查 EAS Build 错误与应用崩溃

**翻页：**[上一页：EAS App Version Management](./051-App-Version-Management.md) · [目录](./README.md) · [下一页：同设备安装多个 App Variant](./053-App-Variants.md)

**官方页面：**[Troubleshoot build errors and crashes](https://docs.expo.dev/build-reference/troubleshooting/)

**版本边界：**本页是 EAS Build 排错流程，命令随 Expo CLI / SDK 版本可能更新。针对本地 Expo ~56.0.11 项目，Expo Doctor 与 release build 步骤应按 SDK v56 配套依赖运行。这里仅记录排查命令与思路，没有运行构建、Git 操作或测试。

## 先区分问题发生在哪

EAS Build 问题通常分成两类：

1. **Build failure：**构建机无法完成 app binary。
2. **Runtime error：**构建成功，但安装 / 启动后崩溃、闪退或卡在 splash screen。

先找日志里最早出现的真实错误，再按范围缩小。Android / iOS 的后续阶段经常因第一个错误连带失败。

## 找到正确的错误日志

### App 已构建成功，但运行失败

查看 release / production runtime crash 的日志；若日志暂时没有足够信息，一步步缩小崩溃来源。这个问题与编译是否完成不同，常见表现是 Expo Go 或本地开发正常、独立 build 启动时崩溃。

### Build 阶段失败

在 EAS Build details 展开失败 phase。第一个报错 phase 往往最有价值，后面 phase 的错误可能只是连带结果。

Android / iOS 日志常见 [stderr] 前缀，但很多 CLI 会用 stderr 输出 warning、deprecation 等诊断信息，前缀不代表它一定让 build 失败。

JS bundling error 例子：

```text
Metro encountered an error:
Unable to resolve module ./src/Routes from App.js
```

常见原因是本地 macOS 文件系统不区分大小写、CI 的 Linux 区分大小写；Git 中实际文件名可能是 routes.js，却从代码导入 Routes。也可能漏跑项目生成命令，或源文件被 .gitignore 排除。

iOS build details 页面显示的是精简 Xcode log。若 Metro / JS 错误未在摘要里出现，到 build 页面底部下载或查看完整 xcodebuild 日志。

CNG 项目的 native error 通常应检查 config plugin 和新增依赖。可用 Expo Doctor 校对安装的 Expo SDK packages：

```sh
npx expo-doctor
```

## Monorepo 与 Out-of-Memory

使用 monorepo 时，EAS Build 需要上传和设置完整工作区，再从正确 app directory 进行构建。Yarn workspaces 是 EAS Build 一等支持路径；其他 monorepo 工具还要仔细确认目录、依赖与打包。

Android Gradle log 中出现 Gradle daemon unexpectedly disappeared 可能表示负责 bundle JavaScript 的 Node 进程被 OOM killer 终止。超大的 JS bundle 会增加 native binary 大小和启动时间；把超大 HTML / JSON 字符串当源码导入，也会占用大量内存。

- 用 Expo Atlas 检查 bundle 组成与体积。
- 如项目需要，按 SDK / platform 对应的 resource class 提高 EAS 构建机内存。
- 排查被当作 source code 的大文本或 JSON。

## “None of these files exist” 与被忽略文件

EAS Build 会上传项目文件，但 .gitignore 中的文件不会自动进入云构建 archive。如果 bundle 依赖了被忽略的源文件，Metro 会报告找不到模块。

排查选项：

- 确认导入是否仍被使用；无用代码可以删除。
- 若文件本来就不是秘密且确需随构建上传，可从忽略清单中移除对应路径。
- 若构建需要敏感文件，不要直接把它放进客户端 bundle；可通过 secret 保存 Base64 数据，在 build hook 中还原。
- 若内容属于第三方生成的密钥 / 服务端配置，应改由后端提供，不把秘密编译进 App。
- 使用 EAS 环境变量时，确认 profile 关联的环境正确。

把敏感配置从 .gitignore 移除会让它被打包，并可能进入 Git history；先判断该文件是否可安全公开。

## Compare 两次 Build 日志

如果曾经成功的构建开始失败，EAS Dashboard 的 Compare 按钮可以把失败版本和成功版本的 metadata、配置与 phase log 并排比较：

1. 打开失败 build details。
2. 选择 Compare。
3. 输入一个成功版本的 build ID 或完整 URL。
4. 查看各 phase 的 changed / added / removed 指示。

- Changed：两个 build 都执行过 phase，但输出不同。
- Added：比较对象才出现的 phase；原 build 可能先前失败而没走到这里。
- Removed：原 build 中存在、比较对象中不存在的 phase。

这有助于检查依赖版本、lockfile、环境变量或 build image 差异。

## 更快验证 JavaScript Bundle

如果 Android 出现 Task :app:bundleReleaseJsAndAssets FAILED，或日志有 Metro encountered an error，先只导出 JS / Web bundle，避免重复等待 Gradle / Xcode：

```sh
npx expo export
```

修正导出报错后再重试 EAS Build。

## 本机复现 Release Build

当工具链已安装时，可在本机用与 EAS 相同的 Xcode、Node、npm / Yarn、Java、环境变量和上传源文件运行 release 构建。官方页面列出的包管理器命令：

| 包管理器 | Android Release | iOS Release |
| --- | --- | --- |
| npm / npx | npx expo run:android --variant release | npx expo run:ios --configuration Release |
| Yarn | yarn expo run:android --variant release | yarn expo run:ios --configuration Release |
| pnpm | pnpm expo run:android --variant release | pnpm expo run:ios --configuration Release |
| Bun | bun expo run:android --variant release | bun expo run:ios --configuration Release |

CNG 项目运行 expo run 会先用 prebuild 生成原生工程。若本次只是诊断、不准备从此直接管理生成的原生工程，排查后应清理生成目录的改动。

还可以用 EAS Build Local 模式运行尽量接近托管构建的步骤：

```sh
eas build --local
```

本地若依赖 Xcode / Android Studio 工具链，需与远端镜像对应；没有相应设备或工具的开发机上无法用本机 release build 重现。

如果本机成功、EAS 失败，重点比对 Node / npm / Yarn / Xcode / Java 版本、EAS environment variables，以及上传 archive 包含的实际源码。

## 检查 Production JavaScript 行为

当开发模式和独立 production app 行为不同时，可用 Metro 的 no-dev 模式更快检查经过 minify 的 JS：

```sh
npx expo start --no-dev
```

此模式移除大部分日志、HMR 与 Fast Refresh，代码受 __DEV__ 控制的分支也会不同，所以调试体验会简化。

## 寻求帮助时准备的信息

- EAS build details 链接；只对项目成员或 Expo 支持可见。面向公开渠道时可截图，私密信息可按官方渠道安全传送。
- 相关 build / runtime error logs。
- 可重现问题的最小项目或 repository；若项目资料不能公开，说明限制。
- 使用 eas build --local 时明确说明本机复现。
- 附带 SDK / Node / native build tool versions 与相关 environment variable 名称；不要公开 secret 值。

## 关键名词

- **Build error / Runtime error：**分别指原生 binary 构建失败与安装后运行失败。
- **CNG：**Expo 根据配置插件生成 native project 的工作流。
- **Metro bundler：**打包 JS / assets 的 React Native 工具。
- **OOM：**Out of Memory，构建进程使用内存超过 runner 限制被终止。
- **Resource class：**EAS build runner 的计算资源规格。
- **Release mode：**接近 production bundle / 原生配置的本机构建模式。

## 官方代码主题覆盖

源页的示例与命令主题均覆盖：stderr warning 判读；Metro unresolved import 与文件大小写；Expo Doctor；忽略文件 / secret 恢复处理；expo export；四个包管理器的 Android+iOS release command；eas build --local；expo start --no-dev；EAS Dashboard compare build 的流程和错误信息收集。Git / build 命令均只记录，没有在工作区运行。

## 下一页

官方页脚 **Next** 是 [Install app variants on the same device](https://docs.expo.dev/build-reference/variants/)，解释如何通过唯一 package name / bundle ID 在一台设备并排安装开发、预览和生产 App。

**翻页：**[上一页：EAS App Version Management](./051-App-Version-Management.md) · [返回目录](./README.md) · [下一页：同设备安装多个 App Variant](./053-App-Variants.md)
