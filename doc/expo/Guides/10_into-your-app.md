# Linking into your app

## 文档解决的问题

这篇文档专门讲“别人怎么打开你的 App”：如何给你的应用配置自定义 scheme、如何测试 deep link、如何在代码里接收和解析入站 URL，以及标准 deep link 的限制是什么。

## 适用场景

- 你要让网页、短信、邮件、二维码或其他 App 打开你的应用。
- 你想先用自定义 scheme 建立一套基本 deep link 方案。
- 你在做登录回跳、营销活动页、消息通知落地页等能力。

## 核心概念

### Custom scheme

给应用配置一个自定义协议，例如：

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

之后就可以通过 `myapp://...` 形式打开应用。

### 默认 scheme

如果没显式定义 `scheme`，文档明确说明 Development Build 和生产构建会默认使用：

- `android.package`
- `ios.bundleIdentifier`

作为 scheme。

### Expo Go 的 `exp://`

在 Expo Go 中，应用地址会变成 `exp://127.0.0.1:8081` 这种形式；如果带路径，还会插入 `/--/`。

### 入站 URL 处理

如果不用 Expo Router，可以使用：

- `Linking.useLinkingURL()`
- `Linking.getInitialURL()`
- `Linking.addEventListener('url', ...)`

## 关键流程

### 1. 在 app config 中声明 scheme

设置 `scheme` 后，需要重新创建 Development Build。

### 2. 测试 deep link

文档推荐使用：

```sh
npx uri-scheme open myapp://somepath/details --ios
npx uri-scheme open com.example.app://somepath/details --android
```

### 3. 在 Expo Go 中测试

文档给出示例：

```sh
npx uri-scheme open exp://127.0.0.1:8081/--/somepath/into/app?hello=world --ios
```

### 4. 在应用代码里接收 URL

使用：

```tsx
const url = Linking.useLinkingURL();
```

### 5. 解析 URL

使用：

```tsx
Linking.parse(url)
```

读取：

- `hostname`
- `path`
- `queryParams`

## 命令、配置、文件说明

### 关键配置

- `scheme`

### 关键命令

- `npx uri-scheme open ...`

### 关键 API

- `Linking.useLinkingURL()`
- `Linking.getInitialURL()`
- `Linking.addEventListener('url', callback)`
- `Linking.parse()`

### 涉及文件

- `app.json` / `app.config.*`

## 注意事项、限制条件和坑点

- 改完 scheme 后要重新构建 Development Build，不能只热更新 JS。
- 文档明确提醒：如果大多数业务面向真实用户，通常应优先考虑或同时配置 Android App Links / iOS Universal Links。
- Deep Link 的天然限制是：用户没安装你的 App 时，链接无法工作。
- 在设备浏览器地址栏里直接输入 scheme 链接，不一定表现和点击 `<a href="scheme://">` 一样。
- `exps://` 只能用于受支持的 HTTPS 场景，当前不支持不安全 TLS 证书站点。

## React Web 开发者容易误解的点

- Web 路由通常默认“只要 URL 能到达页面就能打开”；移动端 deep link 前提是设备上已经装了对应 App。
- Expo Go 中的 `exp://` 并不是你正式应用将来对外发布的链接协议。
- 解析 URL 只是拿到参数，真正把它映射到哪个页面，仍要靠你的导航层或路由层处理。

## 实际开发建议

- 如果是开发期快速验证深链，先上自定义 scheme。
- 如果业务要给真实用户投放链接，尽快补齐 Universal Links / App Links。
- 使用 `Linking.parse()` 统一解析参数，避免自己手写字符串拆分。
- 基于文档内容推导：如果项目已采用 Expo Router，入站链接处理会比手写监听器简单很多。

## 文档明确说明

- 通过 app config 的 `scheme` 可配置应用 deep link。
- 配置后需要新的 Development Build。
- 可用 `npx uri-scheme` 进行测试。
- 不使用 Expo Router 时，可用 `Linking.useLinkingURL()` 等 API 处理入站链接。
- 用户未安装 App 时，标准 deep link 不可用。

## 基于文档内容推导

- 自定义 scheme 更适合开发、内部联调和回跳协议，不适合作为唯一的公开链接方案。
- 如果你需要兼顾“已安装打开 App”和“未安装打开网站”，仅靠本文方案不够。
- 当前文档未涉及 Android App Links / iOS Universal Links 的双向验证细节。
