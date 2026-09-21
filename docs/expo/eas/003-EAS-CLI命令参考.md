# 003｜EAS CLI 命令参考导览

**翻页：**[上一页：eas.json 配置](./002-eas-json配置.md) · [目录](./README.md) · [下一页：EAS 环境变量总览](./004-EAS环境变量总览.md)

**官方页面：**[EAS CLI reference](https://docs.expo.dev/eas/cli/)

**版本提示：**访问官方命令参考时，页面显示 EAS CLI `24.7.0`。CLI 会持续更新，与 Expo SDK 的版本号不是一回事；运行命令前应查看当前项目和本机 `eas --version`。

## EAS CLI 是什么

EAS CLI 是终端工具，用来登录 Expo 账号、配置项目、构建、提交、发布 OTA 更新、部署 Web/API Routes 和运行 Workflows。官方页面是全面命令表（数千行），每个命令有 usage、argument 与 flags；本页按命令主题归类，具体 flag 仍可回官方参考逐项查。

## 安装方式

全局安装或临时执行都可以。避免让机器上长期 CLI 版本漂移时，可通过包管理器临时运行：

```sh
npm install --global eas-cli
npx eas-cli@latest --help
```

Yarn / pnpm / Bun 对应 `yarn global add eas-cli` / `pnpm add --global eas-cli` / `bun add --global eas-cli`；临时调用分别使用 `yarn dlx eas-cli@latest`、`pnpm dlx eas-cli@latest`、`bunx eas-cli@latest`。

## 命令按用途分组

| 命令组 | 覆盖的参考命令 | 典型用途 |
| --- | --- | --- |
| 账号与计划 | `account:audit`、`account:login/logout/usage/view`、`login/logout/whoami`、`billing:manage/subscribe` | 登录、查看账号、账单或订阅。 |
| 项目与状态 | `init`、`project:init/new/info/status/delete/icon:set`、`config`、`diagnostics`、`status`、`browse` | 将当前目录关联到 EAS 项目、检查状态和配置。 |
| 构建 | `build`、`build:configure/cancel/delete/dev/download/inspect/list/resign/run/submit/view`、`build:version:get/set/sync` | 创建、跟踪、下载或测试构建，管理 app build number。 |
| 设备与凭证 | `device:create/delete/list/rename/view`、`credentials`、`credentials:configure-build` | 登记 iOS Ad Hoc 测试设备与配置应用签名凭证。 |
| Update / Channel | `channel:create/delete/edit/insights/list/pause/protect/resume/rollout/unprotect/view`、`update`、`update:configure/delete/edit/list/republish/rollback/...`、`upload` | 将 Build 与更新分发通道绑定；管理更新组、回滚和 rollout。 |
| EAS 环境变量 | `env:set/get/list/delete/pull/push/exec` | 管理云端变量、拉取到本机，或在某环境下运行一条命令。 |
| Submit / 商店资料 | `submit`、`submit:cancel/list/retry/status/view`、`metadata:lint/pull/push`、`testflight:crashes/feedback` | 上传、查看提交状态、同步商店元数据和 TestFlight 反馈。 |
| Workflows | `workflow:create/cancel/run/runs/logs/status/validate/insights/view` | 创建并运行自动化流程、查看日志和校验 YAML。 |
| Web 部署与 Webhook | `deploy`、`deploy:alias/alias:delete/delete/promote`、`webhook:create/delete/list/update/view` | 发布站点、管理 URL alias 与回调事件。 |
| 观测与诊断 | `observe:errors/event/events/metrics/metrics-summary/routes/session/versions`、`analytics`、`fingerprint:compare/generate` | 查询运行指标、错误、导航耗时和原生指纹。 |
| 本地 / 云 Simulator | `sim:*`、`simulator:start` | 操作 EAS Simulator 服务；其中部分指令标为 Experimental，应看当前 EAS Simulator 官方说明。 |
| 集成与脚手架 | `integrations:asc:*`、`integrations:convex:*`、`integrations:posthog:*`、`integrations:supabase:*`、`new`、`autocomplete`、`help` | 连接可选集成、生成工程、补全 shell 命令或查询帮助。本文仅记录官方文档范围，不操作任何集成服务。 |

更新该命令表时，可在页脚官方文档的 command index 查完整子命令；有些别名如 `eas whoami` 等同 `eas account:view`。

## 常见用法示例

```sh
# 创建 Android 预览构建
eas build --platform android --profile preview

# 把兼容更新发布到 preview channel / environment
eas update --channel preview --environment preview

# 把 development 环境值拉到 .env.local
eas env:pull --environment development

# 用指定 workflow 文件运行一次工作流
eas workflow:run .eas/workflows/preview.yml
```

命令可带参数（arguments）和 flag。`--json` 常用于机器读取结果，`--non-interactive` 用于 CI；登录、商店上传和凭证配置有外部副作用，必须先确认当前 Expo 项目、目标平台和环境。

## 新手先认清的安全边界

- `eas.json` 中可以引用凭证文件路径，但不要把文件秘密内容直接写进 JSON 或公开仓库。
- `EXPO_PUBLIC_` 值会进入客户端 JS，任何用户都能读取；服务端秘密不要从客户端发出。
- `eas update --environment` 在 SDK 55 或以上项目为指定服务端环境必填；当前本地 SDK56 应按当前环境变量指南显式提供。
- `--non-interactive` 不等于安全审查；它只关闭交互提示。

## 关键名词

- **Argument**：命令要处理的对象，如 build ID。
- **Flag**：控制命令行为的命名参数，如 `--platform android`。
- **Channel**：EAS Update 的分发流。
- **Non-interactive mode**：不暂停等待终端选择的执行模式，适合 CI。
- **Command alias**：同一动作的短写命令，如 `whoami`。

## 官方代码主题覆盖

源页提供 CLI 全局 / 临时安装、账号、branch、Build、channel、credentials、device、deploy、environment variables、fingerprint、integrations、metadata、observe、project、simulator、submit、update、webhook、workflow 等全部命令家族。此页按 TOC 列出命令主题，并为构建、更新、变量和工作流重写了常见示例；因为官方源页含 200 多条命令和逐项 flags，逐命令参数请从链接查阅，不在学习导览里逐字复制整份参考表。

## 下一页

页脚 **Next** 指向 [Environment variables in EAS](https://docs.expo.dev/eas/environment-variables/)，介绍 build / update / workflow 的云端环境变量。

**翻页：**[上一页：eas.json 配置](./002-eas-json配置.md) · [返回目录](./README.md) · [下一页：EAS 环境变量总览](./004-EAS环境变量总览.md)
