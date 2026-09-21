# Expo Application Services（EAS）链

本模块从 [Expo Application Services](https://docs.expo.dev/eas/) 开始，继续按官方页脚 **Next** 逐页编写中文说明，并概括每页代码主题。

## 版本与适用范围

EAS 是云端服务与 CLI 工作流，不等同于某个 Expo SDK 版本。项目 Expo 为 `~56.0.11`；涉及 Expo app config、原生依赖、OTA 兼容性的部分，应再以 [SDK v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)校对。EAS 页面可能随服务版本更新，命令和价格也可能变化；本文链接回官方页面供复核。

## 连续页面

| 顺序 | 本地页面 | 官方页面 | 页脚 Next |
| --- | --- | --- | --- |
| 001 | [EAS 总览](./001-EAS总览.md) | [Expo Application Services](https://docs.expo.dev/eas/) | Configuration with eas.json |
| 002 | [eas.json 配置](./002-eas-json配置.md) | [Configuration with eas.json](https://docs.expo.dev/eas/json/) | EAS CLI |
| 003 | [EAS CLI 命令参考](./003-EAS-CLI命令参考.md) | [EAS CLI reference](https://docs.expo.dev/eas/cli/) | Environment variables |
| 004 | [EAS 环境变量总览](./004-EAS环境变量总览.md) | [Environment variables in EAS](https://docs.expo.dev/eas/environment-variables/) | Create and manage |
| 005 | [创建和管理 EAS 环境变量](./005-创建和管理EAS环境变量.md) | [Create and manage](https://docs.expo.dev/eas/environment-variables/manage/) | Usage |
| 006 | [在 EAS 中使用环境变量](./006-在EAS中使用环境变量.md) | [Usage](https://docs.expo.dev/eas/environment-variables/usage/) | Without EAS |
| 007 | [不使用 EAS 时管理环境变量](./007-不使用EAS的环境变量.md) | [Without EAS](https://docs.expo.dev/eas/environment-variables/without-eas/) | FAQ |
| 008 | [EAS 环境变量 FAQ](./008-EAS环境变量FAQ.md) | [FAQ](https://docs.expo.dev/eas/environment-variables/faq/) | EAS Workflows → Introduction |
| 009 | [EAS Workflows 简介](./009-EAS-Workflows简介.md) | [Introduction to EAS Workflows](https://docs.expo.dev/eas/workflows/introduction/) | Get started |
| 010 | [EAS Workflows 入门](./010-EAS-Workflows入门.md) | [Get started with EAS Workflows](https://docs.expo.dev/eas/workflows/get-started/) | Pre-packaged jobs |
| 011 | [Workflow 预打包 Jobs](./011-EAS-Workflows预打包任务.md) | [Pre-packaged jobs](https://docs.expo.dev/eas/workflows/pre-packaged-jobs/) | Syntax |
| 012 | [EAS Workflow YAML 语法](./012-EAS-Workflows语法.md) | [Syntax for EAS Workflows](https://docs.expo.dev/eas/workflows/syntax/) | Custom functions |
| 013 | [EAS Workflow 自定义函数](./013-EAS-Workflows自定义函数.md) | [Custom functions](https://docs.expo.dev/eas/workflows/custom-functions/) | Environment variables |
| 014 | [Workflow 环境变量与上下文](./014-EAS-Workflows环境变量.md) | [Environment variables in EAS Workflows](https://docs.expo.dev/eas/workflows/environment/) | Automating EAS CLI commands |
| 015 | [用 Workflows 自动化 EAS CLI](./015-自动化EAS-CLI命令.md) | [Automating EAS CLI commands](https://docs.expo.dev/eas/workflows/automating-eas-cli/) | REST API |
| 016 | [EAS Workflows REST API](./016-EAS-Workflows-REST-API.md) | [Workflows REST API](https://docs.expo.dev/eas/workflows/rest-api/) | Troubleshooting |
| 017 | [排查 EAS Workflows](./017-EAS-Workflows故障排查.md) | [Troubleshoot EAS Workflows](https://docs.expo.dev/eas/workflows/troubleshooting/) | Limitations |
| 018 | [EAS Workflows 限制](./018-EAS-Workflows限制.md) | [EAS Workflows limitations](https://docs.expo.dev/eas/workflows/limitations/) | Examples → Introduction |
| 019 | [EAS Workflows 示例总览](./019-EAS-Workflows示例总览.md) | [EAS Workflows examples](https://docs.expo.dev/eas/workflows/examples/introduction/) | Create development builds |
| 020 | [用 EAS Workflows 创建 Development Builds](./020-自动创建Development-Builds.md) | [Create development builds](https://docs.expo.dev/eas/workflows/examples/create-development-builds/) | Publish preview updates |
| 021 | [用 EAS Workflows 发布 Preview Updates](./021-发布Preview-Updates.md) | [Publish preview updates](https://docs.expo.dev/eas/workflows/examples/publish-preview-update/) | Clean up update branches |
| 022 | [清理 EAS Update branches](./022-清理EAS-Update-Branches.md) | [Clean up EAS Update branches](https://docs.expo.dev/eas/workflows/examples/branch-cleanup/) | Deploy to production |
| 023 | [用 EAS Workflows 部署到 Production](./023-部署到Production.md) | [Deploy to production](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/) | Run E2E tests |
| 024 | [在 EAS Workflows 中运行 E2E 测试](./024-运行E2E测试.md) | [Run E2E tests with Maestro](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) | EAS Build → Introduction |
| 025 | [EAS Build 导言](./025-EAS-Build导言.md) | [EAS Build](https://docs.expo.dev/build/introduction/) | Create your first build |
| 026 | [用 EAS Build 创建第一个 Build](./026-EAS-Build创建首个Build.md) | [Create your first build](https://docs.expo.dev/build/setup/) | Configure with eas.json |
| 027 | [配置 EAS Build 的 eas.json](./027-eas-json配置.md) | [Configure with eas.json](https://docs.expo.dev/build/eas-json/) | Internal distribution |
| 028 | [EAS Build Internal Distribution](./028-EAS-Build内部测试分发.md) | [Internal distribution](https://docs.expo.dev/build/internal-distribution/) | Automate submissions |
| 029 | [用 EAS Build 自动提交](./029-EAS-Build自动提交.md) | [Automate submissions](https://docs.expo.dev/build/automate-submissions/) | Using EAS Update |
| 030 | [在 EAS Build 中使用 EAS Update](./030-EAS-Build与EAS-Update.md) | [Using EAS Update](https://docs.expo.dev/build/updates/) | Trigger builds from CI |
| 031 | [从 CI 触发 EAS Build](./031-EAS-Build-CI.md) | [Trigger builds from CI](https://docs.expo.dev/build/building-on-ci/) | Trigger builds from GitHub App |
| 032 | [从 Expo GitHub App 触发 EAS Build](./032-EAS-Build-GitHub-App.md) | [Trigger builds from the Expo GitHub App](https://docs.expo.dev/build/building-from-github/) | Expo Orbit |
| 033 | [Expo Orbit：桌面端启动器](./033-Expo-Orbit.md) | [Expo Orbit](https://docs.expo.dev/build/orbit/) | App credentials |
| 034 | [App credentials：Android 与 iOS 应用凭据](./034-App-credentials.md) | [App credentials](https://docs.expo.dev/app-signing/app-credentials/) | Automatically managed credentials |
| 035 | [EAS 自动管理 App 凭据](./035-自动管理Credentials.md) | [Using automatically managed credentials](https://docs.expo.dev/app-signing/managed-credentials/) | Local credentials |
| 036 | [EAS Build 使用本地凭据](./036-本地Credentials.md) | [Using local credentials](https://docs.expo.dev/app-signing/local-credentials/) | Existing credentials |
| 037 | [把已有签名凭据交给 EAS Build](./037-已有Credentials.md) | [Using existing credentials](https://docs.expo.dev/app-signing/existing-credentials/) | Sync credentials between remote and local sources |
| 038 | [同步 EAS 远端与本地凭据](./038-同步Credentials.md) | [Sync credentials between remote and local sources](https://docs.expo.dev/app-signing/syncing-credentials/) | Security |
| 039 | [EAS App Signing：凭据安全与风险边界](./039-Credentials安全.md) | [Security](https://docs.expo.dev/app-signing/security/) | Apple Developer Program roles and permissions |
| 040 | [Apple Developer Program 角色与 EAS Build 权限](./040-Apple-Developer-Program-roles.md) | [Apple Developer Program roles and permissions for EAS Build](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/) | Custom builds → Get started |
| 041 | [EAS Custom Builds 入门](./041-Custom-Builds-入门.md) | [Get started with custom builds](https://docs.expo.dev/custom-builds/get-started/) | Config schema |
| 042 | [Custom Build 配置 Schema：从 YAML 到内置函数](./042-Custom-Build-Config-Schema.md) | [Custom build configuration schema](https://docs.expo.dev/custom-builds/schema/) | TypeScript functions |
| 043 | [Custom Build：编写 TypeScript Functions](./043-Custom-Build-TypeScript-Functions.md) | [TypeScript functions](https://docs.expo.dev/custom-builds/functions/) | Build lifecycle hooks |
| 044 | [EAS Build Lifecycle Hooks](./044-Build-Lifecycle-Hooks.md) | [Build lifecycle hooks](https://docs.expo.dev/build-reference/npm-hooks/) | Using private npm packages |
| 045 | [EAS Build 使用私有 npm Packages](./045-Using-Private-NPM-Packages.md) | [Using private npm packages](https://docs.expo.dev/build-reference/private-npm-packages/) | Git submodules |
| 046 | [EAS Build 初始化 Git Submodules](./046-Git-Submodules.md) | [Using Git submodules](https://docs.expo.dev/build-reference/git-submodules/) | Using npm cache with Yarn 1 (Classic) |
| 047 | [Yarn 1 Classic 使用 EAS npm Cache](./047-Yarn-Classic-Cache.md) | [Using npm cache with Yarn 1 (Classic)](https://docs.expo.dev/build-reference/npm-cache-with-yarn/) | Set up EAS Build with a monorepo |
| 048 | [在 Monorepo 中配置 EAS Build](./048-EAS-Build-Monorepo.md) | [Set up EAS Build with a monorepo](https://docs.expo.dev/build-reference/build-with-monorepos/) | Build APKs for Android Emulators and devices |
| 049 | [用 EAS Build 生成 Android APK](./049-Android-APKs.md) | [Build APKs for Android Emulators and devices](https://docs.expo.dev/build-reference/apk/) | Build for iOS Simulators |
| 050 | [用 EAS Build 构建 iOS Simulator App](./050-iOS-Simulators.md) | [Build for iOS Simulators](https://docs.expo.dev/build-reference/simulators/) | App version management |
| 051 | [EAS App Version Management](./051-App-Version-Management.md) | [App version management](https://docs.expo.dev/build-reference/app-versions/) | Troubleshoot build errors and crashes |
| 052 | [排查 EAS Build 错误与应用崩溃](./052-Build-Troubleshooting.md) | [Troubleshoot build errors and crashes](https://docs.expo.dev/build-reference/troubleshooting/) | Install app variants on the same device |
| 053 | [同一设备安装多个 App Variant](./053-App-Variants.md) | [Install app variants on the same device](https://docs.expo.dev/build-reference/variants/) | iOS capabilities |
| 054 | [EAS Build 自动同步 iOS Capabilities](./054-iOS-Capabilities.md) | [iOS capabilities](https://docs.expo.dev/build-reference/ios-capabilities/) | Run EAS Build locally |
| 055 | [在本机运行 EAS Build](./055-EAS-Build-Locally.md) | [Run EAS Build locally with local flag](https://docs.expo.dev/build-reference/local-builds/) | Cache dependencies |
| 056 | [EAS Build 缓存 Dependencies](./056-Cache-Dependencies.md) | [Cache dependencies](https://docs.expo.dev/build-reference/caching/) | Android build process |
| 057 | [EAS Build 的 Android 构建流程](./057-Android-Build-Process.md) | [Android build process](https://docs.expo.dev/build-reference/android-builds/) | iOS build process |
| 058 | [EAS Build 的 iOS 构建流程](./058-iOS-Build-Process.md) | [iOS build process](https://docs.expo.dev/build-reference/ios-builds/) | Configuration process |
| 059 | [Build Configuration Process：初始化 EAS Build](./059-Build-Configuration-Process.md) | [Build configuration process](https://docs.expo.dev/build-reference/build-configuration/) | Server infrastructure |
| 060 | [EAS Build Server Infrastructure](./060-Build-Server-Infrastructure.md) | [Build server infrastructure](https://docs.expo.dev/build-reference/infrastructure/) | iOS App Extensions |
| 061 | [EAS Build 使用 iOS App Extensions](./061-iOS-App-Extensions.md) | [iOS App Extensions](https://docs.expo.dev/build-reference/app-extensions/) | Ignore files via .easignore |
| 062 | [用 .easignore 控制 EAS Build 上传文件](./062-EASIgnore.md) | [Ignore files via .easignore](https://docs.expo.dev/build-reference/easignore/) | npx testflight |
| 063 | [用 npx testflight 快速构建并提交 iOS TestFlight](./063-NPX-TestFlight.md) | [npx testflight command](https://docs.expo.dev/build-reference/npx-testflight/) | Repack app |
| 064 | [Repack：复用原生 Build 更新 JS Bundle](./064-Repack-App.md) | [Repack app](https://docs.expo.dev/build-reference/repack/) | Limitations |
| 065 | [EAS Build 当前限制](./065-EAS-Build-Limitations.md) | [EAS Build limitations](https://docs.expo.dev/build-reference/limitations/) | EAS Submit → Google Play Store |
| 066 | [用 EAS Submit 上传 Android App 到 Google Play](./066-EAS-Submit-Google-Play.md) | [Submit to the Google Play Store with EAS Submit](https://docs.expo.dev/submit/android/) | Submit to Apple App Store |
| 067 | [用 EAS Submit 上传 iOS App 到 App Store](./067-EAS-Submit-Apple-App-Store.md) | [Submit to the Apple App Store with EAS Submit](https://docs.expo.dev/submit/ios/) | TestFlight |
| 068 | [通过 TestFlight 分发 iOS Beta](./068-TestFlight.md) | [Distribute an iOS app with TestFlight](https://docs.expo.dev/submit/testflight/) | Manual Android submission |
| 069 | [手动在 Google Play Console 提交 Android App](./069-Manual-Android-Submission.md) | [Manually submit an Android app to the Google Play Store](https://docs.expo.dev/submit/android-manual/) | Manual iOS submission |
| 070 | [手动用 Xcode / Transporter 提交 iOS App](./070-Manual-iOS-Submission.md) | [Manually submit an iOS app to the Apple App Store](https://docs.expo.dev/submit/ios-manual/) | Configure with eas.json |
| 071 | [用 eas.json 配置 EAS Submit](./071-EAS-Submit-Config.md) | [Configure EAS Submit with eas.json](https://docs.expo.dev/submit/eas-json/) | EAS Hosting → Introduction |
| 072 | [EAS Hosting Introduction](./072-EAS-Hosting-Introduction.md) | [Introduction to EAS Hosting](https://docs.expo.dev/eas/hosting/introduction/) | Get started with EAS Hosting |
| 073 | [部署第一个 Expo Router / React Web 项目](./073-EAS-Hosting-Get-Started.md) | [Deploy your first Expo Router and React app](https://docs.expo.dev/eas/hosting/get-started/) | Deployments and aliases |
| 074 | [EAS Hosting Deployments 与 Aliases](./074-EAS-Hosting-Deployments-and-Aliases.md) | [Assign aliases and promote to production](https://docs.expo.dev/eas/hosting/deployments-and-aliases/) | Custom domain |
| 075 | [为 EAS Hosting 配置 Custom Domain](./075-EAS-Hosting-Custom-Domain.md) | [Custom domain](https://docs.expo.dev/eas/hosting/custom-domain/) | Monitor API routes |
| 076 | [EAS Hosting API Routes Monitoring](./076-EAS-Hosting-API-Routes.md) | [API Routes](https://docs.expo.dev/eas/hosting/api-routes/) | Web deployments with EAS Workflows |
| 077 | [用 EAS Workflows 自动部署 EAS Hosting](./077-EAS-Hosting-Workflows.md) | [Web deployments with EAS Workflows](https://docs.expo.dev/eas/hosting/workflows/) | Caching with EAS Hosting deployments |
| 078 | [EAS Hosting Cache-Control 与响应缓存](./078-EAS-Hosting-Caching.md) | [Caching with EAS Hosting deployments](https://docs.expo.dev/eas/hosting/reference/caching/) | Responses and headers |
| 079 | [EAS Hosting Default Responses 与 Request Headers](./079-EAS-Hosting-Response-Headers.md) | [Default responses and headers](https://docs.expo.dev/eas/hosting/reference/responses-and-headers/) | Worker runtime |
| 080 | [EAS Hosting Worker Runtime 与 Node.js Compatibility](./080-EAS-Hosting-Worker-Runtime.md) | [EAS Hosting worker runtime](https://docs.expo.dev/eas/hosting/reference/worker-runtime/) | EAS Update → Introduction |
| 081 | [EAS Update Introduction](./081-EAS-Update-Introduction.md) | [EAS Update](https://docs.expo.dev/eas-update/introduction/) | Get started |
| 082 | [开始配置并发布 EAS Update](./082-EAS-Update-Get-Started.md) | [Get started with EAS Update](https://docs.expo.dev/eas-update/getting-started/) | Preview updates |
| 083 | [EAS Update Preview 更新方案](./083-EAS-Update-Preview.md) | [Preview updates](https://docs.expo.dev/eas-update/preview/) | Channel surfing |
| 084 | [Channel Surfing：运行中切换 EAS Update Channel](./084-EAS-Update-Channel-Surfing.md) | [Channel surfing](https://docs.expo.dev/eas-update/channel-surfing/) | Override update configuration at runtime |
| 085 | [运行时 Override EAS Update URL 与 Headers](./085-EAS-Update-Runtime-Override.md) | [Override update configuration at runtime](https://docs.expo.dev/eas-update/override/) | Preview updates in development builds |
| 086 | [在 Development Build 中预览 EAS Update](./086-EAS-Update-Dev-Client.md) | [Preview updates in development builds](https://docs.expo.dev/eas-update/expo-dev-client/) | GitHub PR previews |
| 087 | [GitHub Actions 自动发布 EAS Update PR Preview](./087-EAS-Update-GitHub-PR-Previews.md) | [GitHub Action for PR previews](https://docs.expo.dev/eas-update/github-actions/) | Deploy updates |
| 088 | [EAS Update Deployment：Staging 到 Production](./088-EAS-Update-Deployment.md) | [Deploy updates](https://docs.expo.dev/eas-update/deployment/) | Downloading updates |
| 089 | [EAS Update 检查、下载与应用策略](./089-EAS-Update-Downloading.md) | [Downloading updates](https://docs.expo.dev/eas-update/download-updates/) | Rollouts |
| 090 | [EAS Update Rollouts：分阶段发布](./090-EAS-Update-Rollouts.md) | [Rollouts](https://docs.expo.dev/eas-update/rollouts/) | Rollbacks |
| 091 | [EAS Update Rollbacks](./091-EAS-Update-Rollbacks.md) | [Rollbacks](https://docs.expo.dev/eas-update/rollbacks/) | Bundle diffing |
| 092 | [EAS Update Bundle Diffing](./092-EAS-Update-Bundle-Diffing.md) | [Bundle diffing for EAS Update](https://docs.expo.dev/eas-update/bundle-diffing/) | Optimize assets |
| 093 | [优化 EAS Update JavaScript 与 Image Assets](./093-EAS-Update-Optimize-Assets.md) | [Optimize assets for EAS Update](https://docs.expo.dev/eas-update/optimize-assets/) | Alternative deployment patterns |
| 094 | [EAS Update Alternative Deployment Patterns](./094-EAS-Update-Deployment-Patterns.md) | [Alternative deployment patterns](https://docs.expo.dev/eas-update/deployment-patterns/) | How it works |
| 095 | [How EAS Update Works：Build / Update 兼容关系](./095-EAS-Update-How-It-Works.md) | [How EAS Update works](https://docs.expo.dev/eas-update/how-it-works/) | Manage branches and channels |
| 096 | [用 EAS CLI 管理 Update Branches 和 Channels](./096-EAS-Update-Manage-Branches-Channels.md) | [Manage branches and channels with EAS CLI](https://docs.expo.dev/eas-update/eas-cli/) | Runtime versions |
| 097 | [EAS Update Runtime Versions](./097-EAS-Update-Runtime-Versions.md) | [Runtime versions and updates](https://docs.expo.dev/eas-update/runtime-versions/) | Debugging |
| 098 | [EAS Update Debugging：定位没有收到 Update 的原因](./098-EAS-Update-Debugging.md) | [EAS Update debugging](https://docs.expo.dev/eas-update/debug/) | Error recovery |
| 099 | [EAS Update Error Recovery](./099-EAS-Update-Error-Recovery.md) | [Error recovery](https://docs.expo.dev/eas-update/error-recovery/) | Code signing |
| 100 | [EAS Update 端到端 Code Signing](./100-EAS-Update-Code-Signing.md) | [End-to-end code signing with EAS Update](https://docs.expo.dev/eas-update/code-signing/) | Asset selection and exclusion |
| 101 | [EAS Update Asset Selection 与 Exclusion](./101-EAS-Update-Asset-Selection.md) | [Asset selection and exclusion](https://docs.expo.dev/eas-update/asset-selection/) | Using without other EAS services |
| 102 | [不使用其他 EAS 服务独立接入 EAS Update](./102-EAS-Update-Without-EAS.md) | [Using EAS Update without other EAS services](https://docs.expo.dev/eas-update/standalone-service/) | Request proxying |
| 103 | [EAS Update Request Proxying](./103-EAS-Update-Request-Proxying.md) | [Request proxying](https://docs.expo.dev/eas-update/request-proxying/) | Migrate from CodePush |
| 104 | [从 CodePush 迁移到 EAS Update](./104-从-CodePush迁移.md) | [Migrate from CodePush](https://docs.expo.dev/eas-update/codepush/) | Migrate from Classic Updates |
| 105 | [从 Classic Updates 迁移到 EAS Update](./105-从-Classic-Updates迁移.md) | [Migrate from Classic Updates](https://docs.expo.dev/eas-update/migrate-from-classic-updates/) | Trace update ID back to the EAS dashboard |
| 106 | [从 Update ID 追踪到 EAS Dashboard](./106-追踪Update-ID.md) | [How to trace an update ID back to the EAS dashboard](https://docs.expo.dev/eas-update/trace-update-id-expo-dashboard/) | Estimate bandwidth usage |
| 107 | [估算 EAS Update 带宽用量](./107-估算EAS-Update带宽.md) | [Estimate bandwidth usage](https://docs.expo.dev/eas-update/estimate-bandwidth/) | Integrate in existing native apps |
| 108 | [在已有原生 App 中集成 EAS Update](./108-已有原生App集成Update.md) | [Using EAS Update in an existing native app](https://docs.expo.dev/eas-update/integration-in-existing-native-apps/) | EAS Observe → Introduction |
| 109 | [EAS Observe 导言](./109-EAS-Observe-Introduction.md) | [Introduction to EAS Observe](https://docs.expo.dev/eas/observe/introduction/) | Get started |
| 110 | [设置 EAS Observe](./110-EAS-Observe-Get-Started.md) | [Set up EAS Observe](https://docs.expo.dev/eas/observe/get-started/) | Dashboard |
| 111 | [EAS Observe Dashboard](./111-EAS-Observe-Dashboard.md) | [EAS Observe dashboard](https://docs.expo.dev/eas/observe/dashboard/) | EAS CLI |
| 112 | [用 EAS CLI 查询 Observe 指标](./112-EAS-Observe-CLI.md) | [Querying with EAS CLI](https://docs.expo.dev/eas/observe/eas-cli/) | Update downloads |
| 113 | [EAS Update 下载性能](./113-EAS-Observe-Update-Downloads.md) | [EAS Update download performance](https://docs.expo.dev/eas/observe/eas-update/) | Events |
| 114 | [在 EAS Observe 记录自定义 Events](./114-EAS-Observe-User-Events.md) | [User-defined events](https://docs.expo.dev/eas/observe/events/) | Errors |
| 115 | [EAS Observe 错误报告](./115-EAS-Observe-Errors.md) | [Error reporting](https://docs.expo.dev/eas/observe/errors/) | Configuration |
| 116 | [配置 EAS Observe](./116-EAS-Observe-Configuration.md) | [Configure EAS Observe](https://docs.expo.dev/eas/observe/configuration/) | Expo Router integration |
| 117 | [Expo Router EAS Observe Integration](./117-EAS-Observe-Expo-Router.md) | [Expo Router integration](https://docs.expo.dev/eas/observe/integrations/expo-router/) | React Navigation integration |
| 118 | [React Navigation EAS Observe Integration](./118-EAS-Observe-React-Navigation.md) | [React Navigation integration](https://docs.expo.dev/eas/observe/integrations/react-navigation/) | Expo Image integration |
| 119 | [Expo Image 性能 Integration](./119-EAS-Observe-Expo-Image.md) | [Expo Image integration](https://docs.expo.dev/eas/observe/integrations/expo-image/) | Third-party integration |
| 120 | [为第三方 Package 集成 EAS Observe](./120-EAS-Observe-Third-Party-Integration.md) | [Integrate a third-party package with EAS Observe](https://docs.expo.dev/eas/observe/integrations/third-party/) | Metrics Reference |
| 121 | [EAS Observe Metrics Reference](./121-EAS-Observe-Metrics-Reference.md) | [Metrics reference](https://docs.expo.dev/eas/observe/reference/metrics/) | Client ID |
| 122 | [EAS Observe Client ID](./122-EAS-Observe-Client-ID.md) | [Client ID](https://docs.expo.dev/eas/observe/reference/client-id/) | Troubleshooting |
| 123 | [排查 EAS Observe](./123-EAS-Observe-Troubleshooting.md) | [Troubleshooting EAS Observe](https://docs.expo.dev/eas/observe/reference/troubleshooting/) | Distribution → Overview |
| 124 | [Distribution 总览](./124-Distribution-Overview.md) | [Distribution: Overview](https://docs.expo.dev/distribution/introduction/) | App stores best practices |
| 125 | [App Store 发布最佳实践](./125-App-Stores-Best-Practices.md) | [App stores best practices](https://docs.expo.dev/distribution/app-stores/) | App transfers |
| 126 | [App Ownership Transfers](./126-App-Transfers.md) | [App transfers](https://docs.expo.dev/distribution/app-transfers/) | Understanding app size |
| 127 | [理解 App Size](./127-Understanding-App-Size.md) | [Understanding app size](https://docs.expo.dev/distribution/app-size/) | Webhooks |
| 128 | [EAS Webhooks](./128-EAS-Webhooks.md) | [Webhooks](https://docs.expo.dev/eas/webhooks/) | Account types |
| 129 | [Expo Account Types](./129-Expo-Account-Types.md) | [Account types](https://docs.expo.dev/accounts/account-types/) | Two-factor authentication |
| 130 | [Expo Account 双重认证（2FA）](./130-Expo-Two-Factor-Authentication.md) | [Two-factor authentication](https://docs.expo.dev/accounts/two-factor/) | Programmatic access |
| 131 | [Expo Programmatic Access 与 Access Tokens](./131-Expo-Programmatic-Access.md) | [Programmatic access](https://docs.expo.dev/accounts/programmatic-access/) | Single Sign-On (SSO) |
| 132 | [Expo Organization Single Sign-On](./132-Expo-SSO.md) | [Single Sign-On (SSO)](https://docs.expo.dev/accounts/sso/) | Audit logs |
| 133 | [Expo / EAS Audit Logs](./133-Expo-Audit-Logs.md) | [Audit logs](https://docs.expo.dev/accounts/audit-logs/) | Billing → Overview |
| 134 | [Billing 总览](./134-Billing-Overview.md) | [Billing: Overview](https://docs.expo.dev/billing/overview/) | Subscriptions, plans, and add-ons |
| 135 | [Subscriptions、Plans 与 Add-ons](./135-Billing-Plans.md) | [Subscriptions, plans, and add-ons](https://docs.expo.dev/billing/plans/) | Manage plans and billing |
| 136 | [管理 EAS Plans 与 Billing 信息](./136-Billing-Manage.md) | [Manage plans and billing](https://docs.expo.dev/billing/manage/) | Payment history, invoices, and receipts |
| 137 | [付款历史、Invoices 与 Receipts](./137-Billing-Payment-History.md) | [View payment history, invoices, and receipts](https://docs.expo.dev/billing/invoices-and-receipts/) | Usage-based pricing |
| 138 | [EAS Usage-based Pricing 与用量监控](./138-Billing-Usage-Based-Pricing.md) | [Usage-based pricing](https://docs.expo.dev/billing/usage-based-pricing/) | FAQs |
| 139 | [EAS Plans、Billing 与 Payment FAQs](./139-Billing-FAQ.md) | [Plans, billing, and payment FAQs](https://docs.expo.dev/billing/faq/) | 无 Next，官方链终止 |

**当前进度：**已整理 139 页；官方页脚没有 Next，EAS 连续 Next 链在 [Plans, billing, and payment FAQs](https://docs.expo.dev/billing/faq/) 终止。其他 Expo 文档站分支未因本链自动串入。
