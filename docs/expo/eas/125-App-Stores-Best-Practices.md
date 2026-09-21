# 125｜App Store 发布最佳实践

**翻页：**[上一页：Distribution 总览](./124-Distribution-Overview.md) · [目录](./README.md) · [下一页：App transfers](./126-App-Transfers.md)

**官方页面：**[App stores best practices](https://docs.expo.dev/distribution/app-stores/)

**版本边界：**这是会随 Apple 审核与隐私披露规则变化的未版本化指南，当前来源页最后更新于 2026-09-17。文中政策日期与示例反映该官方页面口径；提交商店时仍应回官方当前 App Review 和 App Store Connect 内容复核。

## 多种屏幕尺寸都要能用

在小屏与大屏设备上检查界面，例如较小手机、较大手机与 iPad。重点不是像素完全相同，而是确认文字字段可访问、按钮没有被遮挡、主要信息不会挤出屏幕，排版能适应不同宽高比。

即使设置 `ios.supportsTablet: false`，应用仍可能以手机分辨率在 iPad 上呈现。Apple 可能因为元素布局不正确拒绝 App，因此仍要实际检查 iPad 或 iPad Simulator 上的 UI。

## Privacy Policy 与 App Privacy 问卷

官方页面说明，Apple 从 2018-10-03 起要求所有新 iOS App 与 App 更新提供 Privacy Policy；从 2020-12-08 起，提交 app 时还需要在 App Store Connect 填写 App Privacy 数据收集说明。

问卷答案取决于 App 本身与依赖。页面以 `expo-updates` 为例：其指导是披露“是，App 收集数据”，并选择 Crash Data 类别。回答前应检查使用的 SDK / package 实际收集的数据和 Apple 表单定义，不能只凭依赖名自动照填；隐私政策与问卷也应保持一致。

## 审核结果并非完全可预测

审核规则会变，具体规则执行也可能不完全一致，无法保证某个提交一定一次通过。被拒后通常需要按 Review feedback 调整行为或说明，再重新提交。先运行小 / 大屏布局检查和隐私信息核对，可以减少常见的拒审原因。

## 与官方其他发布指南的关系

本页链接了 App versioning、App Store Metadata、权限说明、App icon、Splash screen、Store screenshots / previews、本地化与 Apple Review guidelines 等并列主题。本文按 Next 链继续到 App transfers；这些辅助页面不是本页的页脚 Next 子链。

## 关键名词

- **Responsive design：**布局随可用尺寸变化而调整；原生项目同样要考虑手机、平板、横竖屏和输入可用性。
- **App Privacy details：**App Store Connect 中对数据收集与用途的披露问卷。
- **Privacy Policy：**向用户说明应用与依赖收集、使用和共享数据方式的隐私政策页面。
- **Review feedback：**商店审核给出的拒绝原因或补充要求；根据反馈修复并重新提审是正常流程的一部分。
- **`ios.supportsTablet`：**Expo app config 中控制 iOS App 是否声明适配 iPad 的配置项；设为 false 不代表 iPad 上完全不会显示 App。

## 官方代码主题覆盖

源页唯一的 config code theme 是 `ios.supportsTablet: false` 与 iPad 仍需能以手机分辨率使用的关系，已说明。其余内容是响应式检查、隐私披露与审查建议，没有其他源代码块。

## 下一页

官方页脚 **Next** 是 [App transfers](https://docs.expo.dev/distribution/app-transfers/)，介绍将 EAS 项目与 App Store / Google Play 中的应用记录分别转移给其他组织。

**翻页：**[上一页：Distribution 总览](./124-Distribution-Overview.md) · [返回目录](./README.md) · [下一页：App transfers](./126-App-Transfers.md)
