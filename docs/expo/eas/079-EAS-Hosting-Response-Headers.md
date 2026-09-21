# 079｜EAS Hosting Default Responses 与 Request Headers

**翻页：**[上一页：EAS Hosting Cache-Control 与响应缓存](./078-EAS-Hosting-Caching.md) · [目录](./README.md) · [下一页：EAS Hosting Worker Runtime](./080-EAS-Hosting-Worker-Runtime.md)

**官方页面：**[Default responses and headers](https://docs.expo.dev/eas/hosting/reference/responses-and-headers/)

**版本边界：**本页列 EAS Hosting 对 assets、CORS、request / crash page 默认处理的当前行为。API routes 的具体 header 适配可能随 Hosting runtime 更新。

## Asset response

EAS Hosting 为静态 asset 自动添加 ETag。浏览器可在后续请求发送 If-None-Match，从而使用缓存重新验证是否需要下载完整资源。

## 未自行处理 OPTIONS 时的 Default CORS

如果 API route 没实现 OPTIONS，Hosting 会自动返回较宽松的 CORS preflight response：

```http
Access-Control-Allow-Origin: <incoming-origin-or-*>
Access-Control-Allow-Headers: <requested-headers-or-*>
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: *
Access-Control-Max-Age: 3600
Vary: Origin, Access-Control-Request-Headers
```

这允许广泛 origin、headers 和 credentials。需要更严格的 allowlist 时，应在 route 中自行处理 OPTIONS 并返回项目需要的 headers。

## Transport Security 与常见 Headers

- 未被应用覆盖时，EAS Hosting 自动添加 Strict-Transport-Security: max-age=31536000; includeSubDomains; preload，建议浏览器未来都使用 HTTPS。
- Hosting 默认删除 X-Powered-By 与 X-Aspnet-Version，避免泄露服务端框架信息；不要再自行添加同类 headers。
- 若 API route 返回 X-Frame-Options，Hosting 会将它转换为 Content-Security-Policy directives。

## Crash Response

API route 出现未捕获 JavaScript error 时，Hosting 视作 crash 并返回 error page。请求 Accept: text/html 时返回 HTML 错误页；其他请求收到纯文本。

## EAS Hosting 添加的 Request Headers

转发到 route 前，Hosting 会添加请求来源 / network metadata：

| Header | 含义 |
| --- | --- |
| Forwarded | 多级 proxy 的标准化 for / host / proto 参数列表。第一个 for 通常是原始客户端 IP。 |
| X-Forwarded-For | 经过转发链的 client / proxy IP 地址列表。 |
| X-Forwarded-Proto | 原始请求协议，通常是 https。 |
| X-Forwarded-Host | 客户端访问时使用的 hostname。 |
| X-Real-IP | 原始请求客户端 IP。 |
| Origin | 发起请求的 Web origin。 |
| Host | 传给 worker 的 hostname，通常与 Request URL hostname 相同。 |
| eas-colo | 处理请求的 Cloudflare data center code，例如 lhr。 |
| eas-ip-continent | 两字母大洲代码：AF、AN、AS、EU、NA、OC、SA。 |
| eas-ip-country | 国家 / 地区代码，例如 US、JP。 |
| eas-ip-region | 最长约三字符的 ISO-3166-2 区域码。 |
| eas-ip-city | 粗略推测的城市名，如 London / Chicago；可为空。 |
| eas-ip-latitude / eas-ip-longitude | 估算的请求地理坐标；可为空。 |
| eas-ip-timezone | 估算的 timezone，例如 Europe/London。 |
| eas-ip-eu | 若推测来源在 EU jurisdiction，值为 1。 |

## URL、Origin 与 Alias

如果请求从 staging alias 进入，路由接收的内部 Request URL 可能使用 deployment ID；Origin 和 X-Forwarded-Host 会保留用户实际访问的 alias/custom domain。示意：

```ts
export async function GET(request: Request) {
  const workerUrl = request.url;
  const incomingOrigin = request.headers.get("Origin");
  const incomingHost = request.headers.get("X-Forwarded-Host");

  return Response.json({ workerUrl, incomingOrigin, incomingHost });
}
```

不要只用 request.url 来构建需要返回给用户的公开链接，应优先根据经过验证的 forwarded / origin headers 选择外部主机。

需要查看调用者 IP 时，可读取 X-Real-IP：

```ts
export async function GET(request: Request) {
  const clientIp = request.headers.get("X-Real-IP");
  return Response.json({ clientIp });
}
```

转发头是 proxy 提供的信息；若 API 暴露权限控制或审计逻辑，应结合应用信任边界检查使用，不要把用户可伪造的输入视为身份凭据。

## 关键名词

- **ETag / If-None-Match：**资源版本校验机制，可避免重复传输未变化的 asset。
- **CORS Preflight：**浏览器真正发跨源请求前先用 OPTIONS 检查许可。
- **HSTS：**要求 browser 对该 host / 子域持续使用 HTTPS。
- **Forwarded Headers：**由 Hosting proxy 添加的原始用户连接信息。
- **Origin 与 Host：**Origin 表示 browser origin；Worker 内部 Host 可能是具体 deployment hostname，X-Forwarded-Host / Origin 保留 incoming URL。

## 官方代码主题覆盖

源页全部代码 / header themes 均已覆盖：ETag 验证；默认 CORS OPTIONS headers；HSTS default；移除服务信息头和 X-Frame-Options 转 CSP；HTML / plaintext crash response；route 读取 Request URL、Origin、X-Forwarded-Host、X-Real-IP 示例；完整 request geo / forwarded header 分类。

## 下一页

官方页脚 **Next** 是 [EAS Hosting worker runtime](https://docs.expo.dev/eas/hosting/reference/worker-runtime/)，列出 V8 isolate 和 Node.js compatibility shim 的支持边界。

**翻页：**[上一页：EAS Hosting Cache-Control 与响应缓存](./078-EAS-Hosting-Caching.md) · [返回目录](./README.md) · [下一页：EAS Hosting Worker Runtime](./080-EAS-Hosting-Worker-Runtime.md)
