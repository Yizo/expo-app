# 083｜EAS Update Preview 更新方案

**翻页：**[上一页：开始配置并发布 EAS Update](./082-EAS-Update-Get-Started.md) · [目录](./README.md) · [下一页：Channel Surfing](./084-EAS-Update-Channel-Surfing.md)

**官方页面：**[Preview updates](https://docs.expo.dev/eas-update/preview/)

**版本边界：**本页概述 update preview 场景，没有 SDK API code example；具体 Expo Router / expo-updates / EAS Update channels 需保持与本地 Expo ~56.0.11 binary runtime 兼容。

## 在 Development Build 中预览

开发者 build 通常适合团队验证 Pull Request 或按 EAS Dashboard / Expo Orbit 打开 update。开发客户端自带开发入口，也可通过 GitHub Actions 自动发布 PR preview。

主要路径：

- Development build 的 Extensions tab 加载兼容 update。
- EAS Dashboard 查看 update 并在已安装 development build 中打开。
- Expo Orbit 在模拟器 / 设备管理 preview update。
- GitHub Actions 把 PR code 发布到指定 channel 后提供 reviewer preview link / QR。

Development build 适合技术团队，不要求普通 tester checkout branch 或操作本机 development server。

## 在 Preview Build 中预览

非技术利益相关者通常更适合使用 production-like preview build，在 TestFlight、Play testing track 或 internal distribution 安装。

小团队可以常备一个 preview build，并持续向同一 channel 发布新的 update。若 native runtime 不变，同一份 preview binary 可以反复接收多个 JS-only preview。

另一种方法是把 channel switching 功能做进 preview client，让同一个已安装 preview build 临时切换多个更新来源；这种做法适合 native runtime 很少变化、QA 需要并排比较很多 bundle 的团队。

## 在 Production Build 上灰度预览

有些团队先让少量内部用户使用尚未全量发布的 production update。可以通过 channel surfing 让已知小组在 production build 上暂时请求另一个 compatible channel，或使用 Persistent Staging flow，常备一个指向 staging channel 的 production-style build。

⚠️ 小范围生产预览要选择可信、能反馈问题的人。如果他们切到 broken bundle 后无法进 App UI 恢复原 channel，可能需要重新安装 build。

## 三种 Build 的选择

| Build | 主要受众 | 可预览方式 |
| --- | --- | --- |
| Development | 工程师 / QA | Expo Dev Client 的 update picker、dashboard、Orbit、PR Preview workflow。 |
| Preview | PM、设计、用户测试者 | TestFlight / Play testing / internal distribution + 稳定 preview channel。 |
| Production | 少量 canary / 内部用户 | 限定 channel、channel surfing 或持续 staging build。 |

## 关键名词

- **Development Build：**开发者客户端，可自带 expo-dev-client UI 与调试能力。
- **Preview Build：**独立安装的测试 native binary，面向不参与源码开发的 tester。
- **Channel Surfing：**运行中的 App 有意从一个 EAS Update channel 切换到另一个。
- **Staging Channel：**与 production 类似但面向预发布验证的 update channel。
- **Compatible Runtime：**设备所装 binary 中已有 update 所需 native modules 和 matching runtimeVersion。

## 官方代码主题覆盖

源页是 workflow choices / documentation links，没有 code block 或命令，本页按 development / preview / production 三类预览路径完整整理。

## 下一页

官方页脚 **Next** 是 [Channel surfing](https://docs.expo.dev/eas-update/channel-surfing/)，说明如何在 release build 中切换 channel 和切回 build 默认频道。

**翻页：**[上一页：开始配置并发布 EAS Update](./082-EAS-Update-Get-Started.md) · [返回目录](./README.md) · [下一页：Channel Surfing](./084-EAS-Update-Channel-Surfing.md)
