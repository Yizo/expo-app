# Android App Links

## 文档解决的问题

这篇文档讲的是如何把标准 `https` 网站链接和 Android 原生应用绑定起来，让用户点击网页链接时优先直接打开你的 App，而不是弹出“用哪个应用打开”的选择框。

## 适用场景

- 你有自己的域名，希望链接在 Android 上直接拉起 App。
- 你不想只依赖 `myapp://` 这类自定义 scheme。
- 你需要让“没装 App 的用户打开网站、装了 App 的用户直接进 App”这两种情况同时成立。

## 核心概念

### App Links 与普通 Deep Link 的区别

文档明确说明，Android App Links：

- 使用标准 `http` / `https`
- 只针对 Android
- 依赖域名验证

它和普通自定义 scheme deep link 的最大差别是：它不要求用户理解某个私有协议，而是直接基于你的网页链接工作。

### 双向关联

要让 App Links 生效，必须做两件事：

1. 网站验证 App
2. App 也声明它信任这个网站

这就是文档所说的 two-way association。

## 关键流程

### 1. 在 app config 中添加 `intentFilters`

核心点是：

- 使用 `android.intentFilters`
- `autoVerify` 必须设为 `true`

示例：

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "*.webapp.io",
              "pathPrefix": "/records"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 2. 创建 `assetlinks.json`

需要在网站的：

```text
/.well-known/assetlinks.json
```

放置 Digital Asset Links 文件。

文件里至少要有：

- `package_name`
- `sha256_cert_fingerprints`

### 3. 获取签名指纹

如果使用 EAS Build，文档建议构建后运行：

```sh
eas credentials -p android
```

再复制 `SHA256 Fingerprint`。

### 4. 以 HTTPS 和 `application/json` 提供文件

`assetlinks.json` 必须：

- 通过 HTTPS 提供
- Content-Type 为 `application/json`

### 5. 安装 App 触发验证

安装应用到 Android 设备后，系统会触发 App Link 验证流程。

## 命令、配置、文件说明

### 关键配置

- `android.intentFilters`
- `autoVerify`

### 关键文件与目录

- `app.json` / `app.config.*`
- `public/.well-known/assetlinks.json`
- `web/.well-known/assetlinks.json`（旧版 Expo webpack 项目）

### 关键命令

- `eas credentials -p android`
- `npx expo start --tunnel`
- `npx expo run:android`
- `adb shell am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://my-custom-domain.ngrok.io/"`

## 注意事项、限制条件和坑点

- `autoVerify` 不开，Android App Links 不能按文档描述正常工作。
- 网站和 App 的关联是严格校验的，不只是写个 `https` 域名就行。
- `assetlinks.json` 必须放在 `/.well-known/` 路径，而不是任意位置。
- Android 验证可能要 20 秒甚至更久，不是改完立刻生效。
- 文档明确提醒：如果更新了网站文件，需要重新构建原生 App 以触发 Google 侧刷新。

## React Web 开发者容易误解的点

- 这不是网站路由配置问题，而是“网站域名所有权”和“Android 应用签名身份”的绑定问题。
- 不是所有 `https://your-domain/...` 链接都会自动进 App，必须匹配 `intentFilters` 里的 host 和 path 规则。
- `public/.well-known/assetlinks.json` 是给 Android 系统验证用的，不是给前端页面本身消费的。

## 实际开发建议

- 从一开始就规划稳定的域名和路径前缀，不要把 App Links 建在临时测试域名上。
- 如果项目有多变体、多签名，尽早规划多个 `sha256_cert_fingerprints`。
- 联调阶段可使用 `--tunnel` 和固定子域名验证流程，再切到正式域名。
- 基于文档内容推导：App Links 的问题常常是“配置链路不一致”而不是“代码没写对”，排查时要同时看 App、网站和签名。

## 文档明确说明

- Android App Links 需要 `intentFilters` 和双向关联。
- `assetlinks.json` 要部署在 `/.well-known/` 下。
- `autoVerify` 是必需项。
- 需要通过 HTTPS 提供验证文件。
- Expo CLI 可借助 `--tunnel` 做开发期调试。

## 基于文档内容推导

- App Links 更适合正式对外链接入口，而不是只用于开发自测。
- 这类问题通常无法只靠前端浏览器调试工具解决，因为验证主体是 Android 系统。
- 当前文档未涉及应用内收到链接后如何导航到具体页面，只链接到入站处理文档。

<!-- NAVIGATION START -->
---
[← 上一页：Linking into your app](./10_into-your-app.md) | [下一页：iOS Universal Links →](./12_ios-universal-links.md)
<!-- NAVIGATION END -->
