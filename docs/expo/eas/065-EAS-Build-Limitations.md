# 065｜EAS Build 当前限制

**翻页：**[上一页：Repack：复用原生 Build 更新 JS Bundle](./064-Repack-App.md) · [目录](./README.md) · [下一页：提交至 Google Play Store](./066-EAS-Submit-Google-Play.md)

**官方页面：**[EAS Build limitations](https://docs.expo.dev/build-reference/limitations/)

**版本说明：**该页面记录 EAS Build 当前服务计划与环境限制，会随 Expo 定价 / runner 改动。具体 build duration 和 IP / resource specification 以官方最新页为准。

## 当前服务边界

- **CPU / 内存：**应用编译内存需求超过当前 builder 时可能失败；可以在 eas.json 为 build profile 使用 large resource class。
- **依赖缓存：**Android 会缓存 npm 和 Maven，iOS 会缓存 npm 与 CocoaPods；node_modules 本身不会基于 lockfile 自动打包 / 恢复，提交进 repository 才会随着源码上传，但通常不是推荐做法。
- **最长 Build 时间：**达到当前 Expo plan 允许的最长 build duration 后会被取消；额度可能随套餐变更。
- **排队数量：**每个 Expo account 每个平台最多 50 个 pending builds；超出会拒绝新请求，等队列下降后再运行。
- **Workspace / Monorepo：**Bun、npm、pnpm、Yarn workspaces 受支持；其他第三方 monorepo 工具可能需额外配置，不保证自动工作。

## 跟踪更新

如需收到这些服务限制有变化的通知，可以订阅 Expo newsletter。SDK、资源规格或套餐信息有变动时，以 EAS 当前官方说明为准。

## 关键名词

- **Resource class：**build worker 的 CPU / RAM 等资源规格；large 可处理更高内存需要，但可能有套餐 / 费用差异。
- **Pending build：**已排队、尚未开始分配 worker 的构建。
- **Workspace：**由同一 package manager 安装与管理的多个本地 package / project。
- **Dependency cache：**复用上次安装 / 编译成果的机制，不等于把整个 node_modules 放进 archive。

## 官方代码主题覆盖

源页没有代码块或终端命令；主要配置概念是在 eas.json 选 large resource class、依赖缓存、查看套餐最长构建时长与每平台 pending 上限、确认 monorepo package manager。本页已逐项说明。

## 下一页

官方页脚 **Next** 离开 EAS Build Reference，进入 [Submit to Google Play Store](https://docs.expo.dev/submit/android/)，开始按官方 Next 链记录 EAS Submit 章节。

**翻页：**[上一页：Repack：复用原生 Build 更新 JS Bundle](./064-Repack-App.md) · [返回目录](./README.md) · [下一页：提交至 Google Play Store](./066-EAS-Submit-Google-Play.md)
