# 030｜EAS Tutorial：用 EAS Update 分享 Preview

**翻页：**[上一页：EAS Tutorial：构建 iOS Production](./029-EAS-TutorialiOS-Production-Build.md) · [目录](./README.md) · [下一页：EAS Tutorial：从 GitHub 构建](./031-EAS-Tutorial从GitHub构建.md)

**官方页面：**[Share previews with your team](https://docs.expo.dev/tutorial/eas/team-development/)

**版本边界：**EAS Update 分享的是非 native 内容，例如 JavaScript、样式和图片；如果修改 native library / app config，需要新建 binary。项目为 SDK56，runtimeVersion 和 expo-updates 需保持 SDK56 兼容。

## 安装 EAS Update

要在已有 app 上发布 OTA update，需要 expo-updates：

```sh
npx expo install expo-updates
```

然后运行配置命令：

```sh
eas update:configure
```

动态 app.config.js 项目需将命令给出的 updates 与 runtimeVersion 属性和值复制到 app.config.js；app.json 静态配置会由命令自动写入。再次运行命令完成 project 配置后，eas.json 的每个 build profile 会有 channel 字段，例如 development / preview / production。继承 development 的 ios-simulator profile 通常不必再重复设置 channel。

**Channel** 是同一类已安装 binary 的 update 入口。若 Android / iOS production app 指向 production channel，发布到这个 channel 的更新可同步交付到兼容的平台 build。一个 channel 会映射到一个 branch。

## 创建包含 expo-updates 的 Development Build

若旧 binary 中没有 expo-updates，要先 build 一次新的 development client：

```sh
eas build --platform android --profile development
```

也可传 platform ios / all。下载并安装后，之后对 JS / style / image 的改动能通过 OTA update 预览。

## 发布与查看 Development Update

下面用首页按钮文案变更示意修改 app UI：

```tsx
<Button
  theme="primary"
  label="Select a photo"
  onPress={pickImageAsync}
/>
```

发布 update 到 development channel：

```sh
eas update --channel development --message "Adjust first button label"
```

development build 内查看预览：

1. 在 Development Client 里登录同一 Expo account。
2. 打开 Extensions 标签页。
3. 在 EAS Update 区找到 Branch: development。
4. 点 Open 查看刚发布的 update。

页面上 channel 名会映射到同名 update branch；channel 和 runtime 不匹配的 JS 更新不会成为兼容的发布组合。

## 分享 Preview / Production build 的更新

preview / production binary 会在启动并请求新 update 时自动下载它所属 channel 的 update。将当前 preview branch 的修改发给测试团队：

```sh
eas update --channel preview --message "Review new home button"
```

团队打开 preview binary 时可获取已兼容的新 JS / assets；若客户端尚未请求更新，可强制退出再重开两次以确认更新下载与生效。Native runtime 变化必须重新构建，不可只发 OTA JS 代码。

## 关键名词

- **EAS Update**：分发与原生 binary 兼容的 JS bundle、样式和图片。
- **runtimeVersion**：声明一个 binary 兼容哪组原生接口的标识。
- **channel**：装在 binary 中的更新订阅名；通常映射到同名 branch。
- **Branch**：保存一条 update 发布历史的 EAS Update 版本线。
- **OTA update**：不重新编译 app binary，通过网络传送 JavaScript / assets 的 app 更新。
- **Native change**：新增 / 移除 native dependency 或改原生配置，必须产出新 binary。

## 官方代码主题覆盖

源页所有 command / config / React snippet 均有改写示例：安装 expo-updates、动态 app config / app.json 的 configure 差别、各 profile channel、ios-simulator 继承、创建新 development build、按钮文案 JS 更新、eas update development / preview 命令、Development Client Extensions 预览步骤和发布版本后如何重启 preview app。

## 下一页

页脚 **Next** 指向 [Builds from GitHub](https://docs.expo.dev/tutorial/eas/builds-from-github/)，继续学习把 EAS build 接入 GitHub workflow。

**翻页：**[上一页：EAS Tutorial：构建 iOS Production](./029-EAS-TutorialiOS-Production-Build.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：从 GitHub 构建](./031-EAS-Tutorial从GitHub构建.md)
