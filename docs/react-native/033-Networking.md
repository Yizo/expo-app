# 033 Networking

**翻页：** [上一页：032 手势响应系统（Gesture Responder System）](032-GestureResponderSystem.md) · [目录](README.md) · [下一页：034 Security](034-Security.md)

**官方页面：** [Networking · React Native](https://reactnative.dev/docs/network)  
**源页代码覆盖：** Fetch GET/POST 与 JSON body、Promise/async-await 错误处理、XMLHttpRequest、WebSocket 生命周期、iOS/Android 明文 HTTP 限制、iOS NSURLSession 自定义配置。

## 手机网络请求与 Web 有一个关键差别

RN 提供标准 Fetch API，语法与 Web `fetch` 相近；`XMLHttpRequest` 也在 RN 中可用，所以建立在 XHR 上的库（如 Axios）也能工作。原生 iOS/Android 没有浏览器的同源策略/CORS 概念；React Native Web 则仍运行在浏览器规则内。这里的网络安全限制主要来自 TLS、iOS ATS、Android Network Security Config 和应用权限。

## GET、POST 和响应处理

基本 GET 可把 URL 传给 `fetch`。第二个参数用来设 method、headers、body。POST JSON 时常设置 `Accept`、`Content-Type` 并 `JSON.stringify` 请求对象。

```ts
const response = await fetch('https://api.example.com/search', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'weather', limit: 10 }),
});
```

Fetch 返回 Promise，网络读取是异步的；可以用 `.then()` 链或 `async`/`await`。网络错误要 catch。Fetch 通常只会在网络层失败时 reject，HTTP 404/500 不一定 reject；实际应用还要检查 `response.ok`。

```ts
type Movie = { id: string; title: string };

async function loadMovies(): Promise<Movie[]> {
  try {
    const response = await fetch('https://reactnative.dev/movies.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload.movies;
  } catch (error) {
    console.error('电影列表加载失败', error);
    throw error;
  }
}
```

页面另给了 Promise 写法：`fetch(url).then(r => r.json()).then(data => data.movies).catch(error => ...)`。两种写法都要处理异常，避免 Promise 的错误被静默丢弃。

## 纯 XHR 和第三方客户端

如果需要 XHR 本身，可设置 `onreadystatechange`，等 `readyState === 4` 后检查 `status` 并读取 `responseText`，再 `open` 和 `send`。不少客户端库基于这一 API。

```ts
const request = new XMLHttpRequest();
request.onreadystatechange = () => {
  if (request.readyState !== 4) return;
  if (request.status >= 200 && request.status < 300) {
    console.log('响应正文', request.responseText);
  } else {
    console.warn('HTTP 请求失败', request.status);
  }
};
request.open('GET', 'https://api.example.com/data');
request.send();
```

## HTTPS 和明文 HTTP

iOS ATS 默认要求网络请求使用 HTTPS。确实需要访问 HTTP 时，可配置 ATS exception；已知服务域名时只为这些域名添加最小例外更安全，全面禁用 ATS 需要合理说明，可能受到 App Store 审核关注。Android API 28 起默认阻止明文流量，可通过 manifest 的 `android:usesCleartextTraffic` 覆盖；生产项目应配置具体需要的域名，而不是全局开放。

开发期 Metro 的 HTTP 调试地址属于开发配置，不能直接推导出生产 API 也可用 HTTP。

## WebSocket

WebSocket 在单条 TCP 连接上双向通信，适合实时消息。RN 支持标准 `WebSocket` API，常见事件为 `onopen`、`onmessage`、`onerror`、`onclose`；建连后可发送字符串或 JSON 文本。

```ts
const socket = new WebSocket('wss://api.example.com/live');

socket.onopen = () => socket.send(JSON.stringify({ type: 'subscribe' }));
socket.onmessage = event => console.log('收到消息', event.data);
socket.onerror = event => console.warn('连接错误', event.message);
socket.onclose = event => console.log('连接结束', event.code, event.reason);
```

真实应用要在页面卸载、登出或切换账号时关闭连接，并处理断线恢复与鉴权过期。

## Fetch 页面列出的兼容问题

官方页列出一些当前限制，可能随 RN 版本改动；遇到相关行为先在目标版本实际确认：

- `redirect: 'manual'` 与 `credentials: 'omit'` 当前不支持。
- Android 同名 header 可能只保留最后一项。
- Cookie 认证不稳定。iOS 对带 Set-Cookie 的 302 redirect 处理可能导致 cookie 未正确保存；过期会话的重定向可能反复请求。

Cookie 会话复杂时，应检查平台网络层、服务端重定向和 RN 版本；不要只用浏览器里的 Fetch 行为推断原生运行时。

## iOS 定制 NSURLSession

需要全局自定义 iOS `NSURLSessionConfiguration`（例如 User-Agent 或 ephemeral 临时会话）时，React Native 提供 `RCTSetCustomNSURLSessionConfigurationProvider`。官方示例在 AppDelegate 早期调用，返回配置，再初始化 RN。页面代码用旧 `RCTBridge` 建立运行时；新工程可能通过更新的 RN factory/API 启动，应在当前模板中确认调用位置。

```objc
#import <React/RCTHTTPRequestHandler.h>

RCTSetCustomNSURLSessionConfigurationProvider(^NSURLSessionConfiguration *{
  NSURLSessionConfiguration *config =
      [NSURLSessionConfiguration ephemeralSessionConfiguration];
  config.HTTPAdditionalHeaders = @{ @"User-Agent": @"ExampleMobileApp" };
  return config;
});
```

该回调应在 RN 网络请求开始前设置；服务端地址、证书校验与 ATS 仍需正确配置。

**翻页：** [上一页：032 手势响应系统（Gesture Responder System）](032-GestureResponderSystem.md) · [目录](README.md) · [下一页：034 Security](034-Security.md)
