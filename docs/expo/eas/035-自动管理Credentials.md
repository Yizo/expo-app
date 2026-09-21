# 035｜EAS 自动管理 App 凭据

**翻页：**[上一页：App credentials](./034-App-credentials.md) · [目录](./README.md) · [下一页：本地凭据](./036-本地Credentials.md)

**官方页面：**[Using automatically managed credentials](https://docs.expo.dev/app-signing/managed-credentials/)

**版本边界：**这是 EAS Build 的凭据管理流程，未绑定某个 Expo SDK 版本。EAS 服务与其权限可能变化；本地项目 SDK 56 的构建仍需按项目的原生平台和 [SDK v56.0.0 文档](https://docs.expo.dev/versions/v56.0.0/)校对。本文没有登录 Apple 账户、创建或修改任何凭据。

## EAS 如何代管签名凭据

第一次运行 EAS Build、项目还没有签名凭据时，EAS CLI 会询问是否生成。按照交互提示完成后，所需凭据会安全保存在 Expo 服务器，并在后续构建中重复使用。

Android 应用商店分发通常需要签名 keystore。iOS 需要 distribution certificate 与 provisioning profile；创建 iOS 签名凭据时需要 Apple Developer Program 账号，并且首次可能要求通过 EAS CLI 登录 Apple。

如果不希望凭据由 Expo 保存或不愿通过 CLI 登录 Apple，可改为[本地凭据](./036-本地Credentials.md)工作流。凭据如何加密和保护，见官方 [Security](https://docs.expo.dev/app-signing/security/) 页面。

## 推送通知凭据不是签名凭据

应用签名与推送通知使用不同材料。Android push notifications 通常需要配置 FCM API Key；通过 EAS CLI 进入 Android 凭据菜单，再选择推送通知凭据管理并按向导添加 key。

iOS push notifications 使用 Apple Push Notifications Key。若还没配置，CLI 会在下一次 EAS Build 时提示；也可以打开凭据管理菜单，选 iOS，再进入 Apple Push Notifications Key 管理选项。

两类推送 key 负责应用运行时投递通知，不会替代 build-time 的 distribution certificate / keystore。

## 团队共享

项目成员在 EAS Dashboard 中加入正确的 Expo project 并有足够权限后，也可以运行 build。首次生成 iOS 凭据后，凭据会由 EAS project 共享；其他协作者不一定要能访问 Apple Developer Team，仍可通过自己的 Expo 账号启动后续构建。

这不代表任意项目成员都能管理所有凭据。项目角色、操作权限和凭据可见性仍受组织与 EAS 权限控制。

## 查看与修改

运行 EAS CLI 的凭据命令可以查看当前平台及 build profile 的配置，也能进入向导修改或删除凭据：

```sh
eas credentials
```

通常不需频繁修改已工作的签名凭据。如有需要，CLI 菜单也提供把云端凭据同步到本地，以及将已有凭据迁移到自动管理的操作入口。

## 关键名词

- **自动管理（automatically managed）：**让 EAS 为构建生成并保存签名材料，减少手动准备与路径配置。
- **FCM API Key：**Firebase Cloud Messaging 配置中的 Android 推送凭据。
- **APNs Key：**Apple Push Notification service 用来授权通知服务端向 Apple 投递推送的 key。
- **构建凭据与推送凭据：**前者在构建/签名时使用，后者在应用运行后发送通知时使用。
- **Project collaboration：**EAS 项目成员及权限配置，让协作者可触发构建并共享项目级资源。

## 官方代码主题覆盖

源页没有代码块；内嵌 CLI 用法都已覆盖：首次 eas build 的自动签名向导、用 eas credentials 查看/调整凭据、Android FCM 凭据管理菜单、iOS APNs 凭据管理菜单，以及协作成员后续构建的权限前提。命令和菜单是说明性示例，没有在本机运行。

## 下一页

官方页脚 **Next** 是 [Using local credentials](https://docs.expo.dev/app-signing/local-credentials/)，介绍如何在本地项目中引用自管 keystore、证书和 profile。

**翻页：**[上一页：App credentials](./034-App-credentials.md) · [返回目录](./README.md) · [下一页：本地凭据](./036-本地Credentials.md)
