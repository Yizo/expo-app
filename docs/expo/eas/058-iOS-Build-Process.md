# 058｜EAS Build 的 iOS 构建流程

**翻页：**[上一页：EAS Build 的 Android 构建流程](./057-Android-Build-Process.md) · [目录](./README.md) · [下一页：Build Configuration Process](./059-Build-Configuration-Process.md)

**官方页面：**[iOS build process](https://docs.expo.dev/build-reference/ios-builds/)

**版本边界：**本页解释 EAS Build 当前 iOS builder / Fastlane 流程。Xcode image、Pods 与 EAS CLI 会变化；本地 Expo ~56.0.11 项目需要匹配 SDK v56 的原生依赖。示例只用于理解构建步骤，没有登录 Apple、调用 EAS 或执行 Git。

## 本地准备

EAS CLI 先在开发机准备 iOS build request：

1. eas.json 设置 cli.requireCommit: true 时检查 Git index；存在未提交改动可选择提交或中止。
2. 根据 profile 的 credentialsSource 从本地 credentials.json 或 EAS remote 读取证书 / profile；remote 尚无凭据时提示创建。
3. 对直接维护 android / ios 原生目录的项目，检查 Xcode project 已设正确 Bundle Identifier 和 Apple Team ID。
4. 根据 VCS workflow 打包 repository，上传到 EAS 私有 Google Cloud Storage，并提交 build request。

这里的步骤只说明构建机制。EAS build 的真实 Apple Developer 凭据和 signing profile 必须由有权限的账号配置。

## 云端 iOS Builder 阶段

EAS 为每次 build 建立独立 macOS VM，安装 Xcode / Fastlane 工具，再下载项目 tarball。主要顺序：

1. 若存在 NPM_TOKEN，创建访问 npm 的 .npmrc。
2. 运行 eas-build-pre-install。
3. 项目根目录安装依赖：npm install，或检测到 yarn.lock 时 yarn install。
4. 执行 npx expo-doctor。
5. 还原签名凭据：新建 Keychain、导入 Distribution Certificate，把 Provisioning Profile 写入 Apple 指定目录，并检查 profile 与 certificate 相匹配。
6. CNG 项目用 versioned Expo CLI 执行 npx expo prebuild。
7. 以 eas.json profile 的 cache.key 还原缓存；执行 pod install。
8. 运行 eas-build-post-install。
9. 将 Provisioning Profile 的 ID 写入 Xcode project。
10. 如果 ios/Gymfile 不存在，生成一份默认 Gymfile。
11. 在 ios 目录运行 fastlane gym。
12. 运行已弃用的 eas-build-pre-upload-artifacts hook（若项目仍定义）。
13. 缓存 build profile 指定内容；Podfile.lock 默认也会进入缓存。
14. 上传 IPA。可通过 applicationArchivePath 改路径 / glob，默认是 ios/build/App.ipa。
15. 按结果运行 eas-build-on-success 或 eas-build-on-error；最后 eas-build-on-complete，并设置 EAS_BUILD_STATUS 为 finished / errored。
16. 若 profile 设置 buildArtifactPaths，再上传附加 artifacts archive。

## Fastlane Gymfile

EAS 用 fastlane gym 编译 iOS app；Gymfile 可以由 EAS 自动生成，也可在项目 ios 目录提供自定义文件。默认 template 会包含 scheme、App Store export method、profile 与 bundle identifier 的映射、Keychain 参数、Xcode log 输出目录和 archive 输出目录。

简化后的示例：

```ruby
suppress_xcode_output(true)
clean(true)

scheme("MyApp")

export_options({
  method: "app-store",
  provisioningProfiles: {
    "com.example.myapp" => "PROFILE_UUID"
  }
})

export_xcargs "OTHER_CODE_SIGN_FLAGS=\"--keychain /tmp/build.keychain\""
disable_xcpretty(true)
output_directory("./build")
output_name("App")
```

Profile UUID、bundle identifier、temporary keychain path 和 output directory 应从当前 build credentials / app target 对应值解析；此处使用占位符。

## 关键名词

- **macOS VM：**EAS 每份 iOS build 使用的临时 macOS 虚拟机，预装 Xcode / Fastlane。
- **Provisioning Profile：**连接 App ID、证书和 entitlement 的 Apple 签名配置。
- **Keychain：**macOS 保存并供 Xcode 使用证书私钥的凭据库。
- **CocoaPods / pod install：**安装 iOS 原生依赖的工具与命令。
- **Fastlane gym / Gymfile：**iOS archive / IPA 构建工具及其配置。
- **IPA：**iOS app 安装 / 商店分发包。

## 官方代码主题覆盖

源页代码流程均已覆盖：本地 requireCommit 与 credentialsSource；云端 .npmrc、hooks、npm/yarn、expo-doctor、prebuild、Pods、profile 写入；Gymfile 与 fastlane gym；archive path、Podfile.lock cache、status hooks、buildArtifactPaths。官方默认 Gymfile 的 export_options / provisioningProfiles / Keychain / output 主题也有安全化的占位示例。

## 下一页

官方页脚 **Next** 是 [Build configuration process](https://docs.expo.dev/build-reference/build-configuration/)，解释 eas build:configure 如何初始化 EAS project 与写入默认 eas.json。

**翻页：**[上一页：EAS Build 的 Android 构建流程](./057-Android-Build-Process.md) · [返回目录](./README.md) · [下一页：Build Configuration Process](./059-Build-Configuration-Process.md)
