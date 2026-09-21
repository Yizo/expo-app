# 036｜EAS Build 使用本地凭据

**翻页：**[上一页：EAS 自动管理 App 凭据](./035-自动管理Credentials.md) · [目录](./README.md) · [下一页：迁移已有凭据](./037-已有Credentials.md)

**官方页面：**[Using local credentials](https://docs.expo.dev/app-signing/local-credentials/)

**版本边界：**本页介绍 EAS Build 如何读取本机文件系统里的签名凭据，与 SDK 版本无直接关系。配置格式依官方当前页面；本地项目 Expo ~56.0.11 的 build profile 仍应按 [SDK v56.0.0 文档](https://docs.expo.dev/versions/v56.0.0/)校对。所有密码、证书与私钥均用占位符表示，不要把示例秘密值当成真实凭据。

## 何时使用本地凭据

通常可以让 EAS 管理签名密钥。若团队必须在自己的安全设施中保管凭据，或需要自管构建签名过程，可以通过项目根目录的 credentials.json 把相对路径和密码交给 EAS Build。路径相对于项目根目录，也可以使用绝对路径。

本地凭据意味着 CI 构建环境也必须安全地拿到对应密钥文件。credentials.json 与所有凭据文件都应加入 .gitignore，避免被提交进源代码仓库。

## credentials.json 结构

Android 需要 keystore 路径、store password、alias 和 key password；iOS 需要 provisioning profile 路径、distribution certificate 文件路径与证书密码。下面用明显占位符表示秘密值：

```json
{
  "android": {
    "keystore": {
      "keystorePath": "android/keystores/release.keystore",
      "keystorePassword": "<KEYSTORE_PASSWORD>",
      "keyAlias": "<KEY_ALIAS>",
      "keyPassword": "<KEY_PASSWORD>"
    }
  },
  "ios": {
    "provisioningProfilePath": "ios/certs/profile.mobileprovision",
    "distributionCertificate": {
      "path": "ios/certs/dist.p12",
      "password": "<DISTRIBUTION_CERTIFICATE_PASSWORD>"
    }
  }
}
```

若只为一种平台构建，只需配置该平台的凭据，不要把不存在的文件路径写入配置。

## Android 凭据

发布 Android 应用需要 keystore。若尚无 release keystore，可用 keytool 生成 JKS 格式文件；将命令中的密码、key alias、包名换成自己的值：

```sh
keytool \
  -genkey -v \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass <KEYSTORE_PASSWORD> \
  -keypass <KEY_PASSWORD> \
  -alias <KEY_ALIAS> \
  -keystore release.keystore \
  -dname "CN=com.example.app,OU=,O=,L=,S=,C=US"
```

生成后建议放进 android/keystores/。credentials.json 中的 keystorePath 指向此文件，其他密码和 alias 字段应与创建时使用的值一致。

## iOS 凭据

iOS 真机分发需要 Apple Developer Program 付费账号，并为 App 生成 distribution certificate 与 provisioning profile。可在 Apple Developer Portal 创建，之后把文件放到例如 ios/certs/：

```json
{
  "ios": {
    "provisioningProfilePath": "ios/certs/profile.mobileprovision",
    "distributionCertificate": {
      "path": "ios/certs/dist.p12",
      "password": "<DISTRIBUTION_CERTIFICATE_PASSWORD>"
    }
  }
}
```

iOS app 使用 Share Extension、Widget 等 App Extension 时，每个 Xcode target 有自己的 bundle identifier，都需要匹配的 provisioning profile 与签名信息。多 target 的配置形状如下：

```json
{
  "ios": {
    "mainapp": {
      "provisioningProfilePath": "ios/certs/main-profile.mobileprovision",
      "distributionCertificate": {
        "path": "ios/certs/dist.p12",
        "password": "<MAIN_CERTIFICATE_PASSWORD>"
      }
    },
    "shareextension": {
      "provisioningProfilePath": "ios/certs/share-profile.mobileprovision",
      "distributionCertificate": {
        "path": "ios/certs/extension-dist.p12",
        "password": "<EXTENSION_CERTIFICATE_PASSWORD>"
      }
    }
  }
}
```

属性名 mainapp / shareextension 必须对应项目真实的 Xcode target 名称； profile 还必须与对应 App ID 及签名证书匹配。

## 忽略秘密文件

将 credentials.json 与平台密钥加入根目录的 .gitignore。示意：

```gitignore
credentials.json
android/keystores/release.keystore
ios/certs/*
```

禁止把生产私钥、证书密码放进 Git。备份应使用受控的密码库或团队安全存储。

## 选择 local 或 remote 凭据来源

在 eas.json 的 build profile 中，credentialsSource 可设为 local 让 EAS 读取 credentials.json，或设为 remote 从 EAS 云端取凭据。没有明确设置时默认是 remote：

```json
{
  "build": {
    "amazon-production": {
      "credentialsSource": "local",
      "android": {
        "buildType": "app-bundle"
      }
    },
    "google-production": {
      "credentialsSource": "remote",
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

示例用两个 Android profile 分别说明本地和云端来源。实际项目的 profile 应采用真实商店与 application ID 配置；local / remote 选择凭据从哪里解析，并不会自动生成或同步密钥。

## 在 CI 中恢复本地凭据

CI 虚拟机在每次运行时可能是全新的，所以构建开始前必须还原 credentials.json、keystore、provisioning profile 与证书文件，并放在配置所引用的路径。教程给出把 JSON 编成 Base64，再用 CI secret 环境变量传递的方案：

```sh
base64 credentials.json
```

把编码结果保存在名为 CREDENTIALS_JSON_BASE64 的受保护 CI secret 中，在 CI job 写回文件：

```sh
echo "$CREDENTIALS_JSON_BASE64" | base64 -d > credentials.json
```

Base64 只是编码，不是加密；拥有变量值的人仍可还原凭据。CI 平台应将该变量设为 secret，并另外安全恢复 keystore、profile 与 p12 文件。所有文件需要与 credentials.json 中路径一致，之后再按 EAS CI 构建指南触发 build。

## 关键名词

- **credentials.json：**描述本地签名文件路径及密码的项目配置文件；本身也含敏感信息，不能公开。
- **Local credentials：**由开发者保管在文件系统或 CI secret store 中的密钥。
- **Remote credentials：**由 Expo EAS 账户远端管理的签名材料。
- **App Extension target：**iOS 主应用之外的分享扩展、小组件等独立构建目标，通常有独立 bundle ID 与 profile。
- **Base64：**文本编码方式，不提供保密性；要用 CI secret 权限保护原始内容。

## 官方代码主题覆盖

源页全部代码主题均有改写示例：Android+iOS credentials.json 结构；keytool 创建 JKS keystore；Android credentials 字段解释；iOS profile 与 distribution certificate 路径；主 App + App Extension 多 target 配置；.gitignore 秘密路径；eas.json 的 local/remote profile 来源；在 CI 中 Base64 编码 credentials.json、设置 secret 环境变量并解码恢复文件。密码只用占位符，不复制源页里的示例口令。

## 下一页

官方页脚 **Next** 是 [Using existing credentials](https://docs.expo.dev/app-signing/existing-credentials/)，说明把已有 keystore、distribution certificate 或 profile 迁入 EAS 管理。

**翻页：**[上一页：EAS 自动管理 App 凭据](./035-自动管理Credentials.md) · [返回目录](./README.md) · [下一页：迁移已有凭据](./037-已有Credentials.md)
