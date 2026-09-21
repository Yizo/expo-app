# 069 Publishing to Apple App Store

**翻页：** [上一页：068 App Extensions](068-AppExtensions.md) · [目录](README.md) · [下一页：054 Native Modules: Introduction（已覆盖，导航回到重复页面）](054-NativeModulesIntroduction.md)

**官方页面：** [Publishing to Apple App Store · React Native](https://reactnative.dev/docs/publishing-to-app-store)  
**源页代码覆盖：** Xcode Debug 脚本 `SKIP_BUNDLING` 设置、CLI Release 构建命令、Xcode Archive/Upload/App Store Connect 发布流程与设备截图要求。

## 发布流程和 RN 的区别

React Native iOS App 的签名、Archive 和 App Store 上传流程与其他原生 iOS App 相同；RN 额外需要把 JavaScript 与图片 bundle 打进 App。本页介绍手动 Xcode 工程流程。Expo 项目应看 Expo 的 App Store 部署文档。

## 将 Scheme 设为 Release

在 Xcode 里进入 Product > Scheme > Edit Scheme，选 Run tab，把 Build Configuration 设为 `Release`。Release 会禁用 Dev Menu，并把 JS 本地打包，使安装后的应用无需连接开发机上的 Metro。

若希望调试真机时节省 bundle 构建时间，可在 Xcode Build Phase 的 “Bundle React Native code and images” 脚本中，仅对 Debug 设置 `SKIP_BUNDLING`。不要让此设置影响 Release，否则产物可能缺少 JS bundle：

```sh
if [ "${CONFIGURATION}" = "Debug" ]; then
  export SKIP_BUNDLING=true
fi
```

## 构建并测试 Release

Xcode 可用 Product > Build 或 `Cmd+B` 构建 Release。RN CLI 也提供 `--mode=Release`：

```sh
npm run ios -- --mode="Release"
# 或
yarn ios --mode Release
```

安装 Release 包到设备测试，验证它在没有开发 Metro 的情况下能启动并执行核心流程。提交前还要确认签名、entitlements、Bundle Identifier、版本号和资源符合目标工程配置。

## Archive 并上传到 App Store Connect

1. 打开 `ios` 文件夹中的 CocoaPods workspace（`YOUR_APP_NAME.xcworkspace`）。
2. 将运行目标切到 `Any iOS Device (arm64)`，再选 Product > Archive。
3. 确认 Bundle Identifier 与 Apple Developer 后台注册的 Identifier 完全一致。
4. Archive 完成后，在 Organizer 选 Distribute App > App Store Connect > Upload。
5. 根据团队签名流程选择自动或手动管理签名，上传到 App Store Connect。
6. 在 App Store Connect 的 TestFlight/Builds 中确认构建可用，再补齐商店资料、选择该构建并提交审核。

不同的 Apple/Xcode 版本可能调整菜单名称或签名表单，以当前 Xcode 和 App Store Connect 页面为准。

## App Store 截图

商店页面需要最新设备尺寸的截图。可从 Xcode Simulator 为对应设备生成截图；Apple 会说明哪些屏幕尺寸必须提交，以及哪些可以由其他尺寸的截图覆盖。

## Next 单链的重复边界

本页底部的官方 Next 回到 **Native Modules: Introduction**，该页面已在 [054](054-NativeModulesIntroduction.md) 整理过。本轮按用户的逐页规则在此停止，避免重复编号同一官方页面。

**翻页：** [上一页：068 App Extensions](068-AppExtensions.md) · [目录](README.md) · [下一页：054 Native Modules: Introduction（已覆盖，导航回到重复页面）](054-NativeModulesIntroduction.md)
