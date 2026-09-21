# 037｜把已有签名凭据交给 EAS Build

**翻页：**[上一页：EAS Build 使用本地凭据](./036-本地Credentials.md) · [目录](./README.md) · [下一页：同步远端与本地凭据](./038-同步Credentials.md)

**官方页面：**[Using existing credentials](https://docs.expo.dev/app-signing/existing-credentials/)

**版本边界：**本页是签名材料迁移说明，未版本化且不依赖特定 Expo SDK API。项目 Expo ~56.0.11 的原生构建仍按 SDK 56 项目配置执行；本文只说明凭据数据流，未上传任何密钥。

## 两种凭据来源

EAS Build 可从两处读取签名凭据：

| 来源 | 工作方式 | 适合场景 |
| --- | --- | --- |
| 自动管理 / Remote | 将签名凭据保存在 Expo 服务器，EAS 在构建 job 中获取；具有足够权限的协作者可共享项目凭据。 | 希望减少本地密钥分发和 CI 密钥恢复工作。 |
| Local | 在项目的 credentials.json 中引用 keystore、provisioning profile、distribution certificate 的文件路径和密码；构建运行时从本地上传文件，job 完成后临时副本会被释放。 | 组织要求自行保管签名文件，或需要固定本地签名流程。 |

无论选择哪一种，迁移已有的 Android keystore 或 iOS 证书时，先按[本地凭据页](./036-本地Credentials.md)把它们填入 credentials.json。文件本身应加入忽略清单并安全备份。

## 把本地凭据上传至 EAS

配置完成后运行 EAS CLI 的凭据管理向导，选择对应平台，并选择用 credentials.json 中的值更新 Expo 服务器。完成后可以让 build profile 使用 remote 凭据，减少每次 CI 都恢复本地密钥文件的工作：

```sh
eas credentials
```

CLI 提供的平台菜单可选择类似 “Update credentials on Expo servers with values from credentials.json” 的上传操作。应在确认目标 EAS project 与平台后操作，以免把其他应用的签名材料关联错项目。

## 关键名词

- **Remote credentials：**存在 EAS 账户服务器侧的签名材料。
- **Local credentials：**由本地 credentials.json 指向的签名材料。
- **构建 job 临时上传：**使用 local 模式时，CLI 在启动 build 时提供本地文件；构建结束后 EAS 不会把它当成长期托管凭据保留。
- **同步 / 迁移：**将本地已有签名材料上传为 remote，或将 remote 凭据取到本地；不是重新生成新的密钥。

## 官方代码主题覆盖

原页面没有独立代码块；所有代码主题是 credentials.json 的本地路径配置与 EAS CLI 凭据命令。两种凭据来源和通过 eas credentials 选择平台后上传至 Expo 服务器的操作都已解释，没有复制任何实际秘密值。

## 下一页

官方页脚 **Next** 转入 [Sync credentials between remote and local sources](https://docs.expo.dev/app-signing/syncing-credentials/)，比较并同步 EAS 服务器与本地凭据。

**翻页：**[上一页：EAS Build 使用本地凭据](./036-本地Credentials.md) · [返回目录](./README.md) · [下一页：同步远端与本地凭据](./038-同步Credentials.md)
