# 100｜EAS Update 端到端 Code Signing

**翻页：**[上一页：EAS Update Error Recovery](./099-EAS-Update-Error-Recovery.md) · [目录](./README.md) · [下一页：Asset Selection and Exclusion](./101-EAS-Update-Asset-Selection.md)

**官方页面：**[End-to-end code signing with EAS Update](https://docs.expo.dev/eas-update/code-signing/)

**版本边界：**EAS Update Code Signing 仅供官方标明的 Production / Enterprise subscription。Expo SDK v56.0.0 Updates config 含 codeSigningCertificate / codeSigningMetadata；务必以本地 SDK 的相同配置键为准。本文只说明 key lifecycle，不创建、上传或运行真实私钥。

## Code Signing 提供什么

一般 HTTPS 能保护网络传输，但一套 update 仍经过 CDN / cloud delivery。EAS Update end-to-end code signing 让发布者用自己的 private key 对 update 签名，再把签名和 update 一同分发。客户端 binary 内嵌 public certificate，在 apply update 之前验签，以检测内容被篡改。

私钥只在本机发布命令签名时使用，不应上传到 repository 或 Expo。

## 1. 生成 Private Key 和 Public Certificate

把 private key directory 放在源码控制范围外，避免意外入库。certificate 可放项目中，因为它包含 public key 和验签所需 metadata：

```sh
npx expo-updates codesigning:generate \
  --key-output-directory ../keys \
  --certificate-output-directory certs \
  --certificate-validity-duration-years 10 \
  --certificate-common-name "Example Organization"
```

大致产生：

| 文件 | 内容 | 是否机密 |
| --- | --- | --- |
| ../keys/private-key.pem | 签名 update 的 private key。 | 是；使用密码库 / KMS / 安全备份保存，不能提交代码仓库。 |
| ../keys/public-key.pem | 同一密钥对的 public key。 | 不敏感。 |
| certs/certificate.pem | 嵌入 App 供客户端验签的 certificate。 | 含 public key，可随 App config 版本控制。 |

有效期限短会缩短泄漏 private key 后的暴露窗口，但需要更频繁地轮换；已嵌入过期 certificate 的 binary 不能验证过期后新发布的签名 updates。

## 2. 将 Certificate 配置进 App

接着用 Expo Updates CLI 把 certificate / private key metadata 写进 app config：

```sh
npx expo-updates codesigning:configure \
  --certificate-input-directory certs \
  --key-input-directory ../keys
```

CNG 项目 app.json 的重点字段是：

```json
{
  "expo": {
    "updates": {
      "codeSigningCertificate": "./certs/certificate.pem",
      "codeSigningMetadata": {
        "keyid": "main",
        "alg": "rsa-v1_5-sha256"
      }
    }
  }
}
```

Config plugin / Prebuild 会将 certificate 与 key metadata 生成到 AndroidManifest.xml / iOS Expo.plist，随后需要创建一个新 build，让 certificate 嵌入 device binary。

### Existing Native Project 的 Android 配置

AndroidManifest.xml 的 application 中写 Expo Updates Certificate 和 Metadata。Certificate PEM 中的换行 / 回车在 XML attribute 内须 escape；官方演示用 Node 读取文件进行转义：

```sh
node -e "console.log(require('fs').readFileSync('./certs/certificate.pem', 'utf8').replace(/\r/g, '&#xD;').replace(/\n/g, '&#xA;'))"
```

然后将输出填入证书 metadata；metadata field 值按官方约定：

```xml
<meta-data
  android:name="expo.modules.updates.CODE_SIGNING_CERTIFICATE"
  android:value="XML_ESCAPED_CERTIFICATE" />
<meta-data
  android:name="expo.modules.updates.CODE_SIGNING_METADATA"
  android:value="{&quot;keyid&quot;:&quot;main&quot;,&quot;alg&quot;:&quot;rsa-v1_5-sha256&quot;}" />
```

### Existing Native Project 的 iOS 配置

在 ios/<project>/Supporting/Expo.plist 的 dictionary 中写入 certificate 与 metadata。iOS 字符串要把 carriage return 以 XML entity 表示：

```xml
<key>EXUpdatesCodeSigningCertificate</key>
<string>-----BEGIN CERTIFICATE-----&#xD;
XML_ESCAPED_CERTIFICATE
-----END CERTIFICATE-----&#xD;</string>
<key>EXUpdatesCodeSigningMetadata</key>
<dict>
  <key>keyid</key>
  <string>main</string>
  <key>alg</key>
  <string>rsa-v1_5-sha256</string>
</dict>
```

## 3. 用 Private Key 发布 Signed Update

在项目目录用本机 private key 签名并发布：

```sh
eas update --private-key-path ../keys/private-key.pem
```

EAS CLI 检测项目 app config 的 codeSigning 设置，使用本地 key 对 update 签名，并将 signature 同 update metadata 上传；private key 不会随 bundle 发送到 EAS。

## 4. Client Verify Signature

App 下载 manifest / assets 后、apply update 之前，使用 binary 内嵌 public certificate 验证服务器返回的数字签名。证书和签名相符则加载 update；不匹配 / 内容被修改则拒绝应用。

## Key Rotation

常见轮换原因：certificate 即将过期、private key 可能泄漏，或按组织安全策略定期替换。

1. 先备份旧 key 与 certificate。
2. 生成新 keypair / certificate。为便于诊断可更新 app config 的 codeSigningMetadata.keyid。
3. 新 certificate 是 binary runtime 一部分；将 runtimeVersion 更新，再创建包含新 certificate 的 native build。
4. 后续 updates 使用新 private key 签名。

过期前完成轮换，能确保旧 binary 还有窗口接收 signed transition / fix。private key 泄漏后应停止使用旧 key，并及时让新 binary 切到新证书。

## Removing Code Signing

撤销 code signing 可视为换成 null signing key：

1. 安全备份旧 private key / certificate。
2. 从 app config 移除 updates.codeSigningMetadata。
3. 把 runtimeVersion 设为新的兼容集，再创建不带签名的 App binary；旧签名 binary 不应接收该新 runtime update。

## 关键名词

- **Public-key cryptography：**使用 public / private key pair 签名和验签的密码学体系。
- **Digital signature：**发布端 private key 对 bundle manifest 生成的签名，客户端用 certificate 内 public key 检查。
- **keyid / alg：**标明使用哪把 key 和签名算法的 metadata。
- **Certificate validity duration：**certificate 的有效期限；到期后旧 binary 无法以它验证之后签名的 update。
- **RuntimeVersion：**隔离新旧 certificate binary 的兼容标识。

## 官方代码主题覆盖

源页所有 code / command themes 均已改写：生成 private/public key 与 PEM certificate；两个目录 flag 和有效期限 / Common Name 参数；codesigning:configure；CNG app.json；Android XML escaping node command 与 metadata tags；iOS Expo.plist；eas update --private-key-path；新 runtime build、key rotation 和移除配置步骤。所有 key 内容仅用占位文字。

## 下一页

官方页脚 **Next** 是 [Asset selection and exclusion](https://docs.expo.dev/eas-update/asset-selection/)，介绍 update publish 时选择、排除要上传的静态资源。

**翻页：**[上一页：EAS Update Error Recovery](./099-EAS-Update-Error-Recovery.md) · [返回目录](./README.md) · [下一页：Asset Selection and Exclusion](./101-EAS-Update-Asset-Selection.md)
