# 078｜EAS Hosting Cache-Control 与响应缓存

**翻页：**[上一页：用 EAS Workflows 自动部署 EAS Hosting](./077-EAS-Hosting-Workflows.md) · [目录](./README.md) · [下一页：Default Responses and Headers](./079-EAS-Hosting-Response-Headers.md)

**官方页面：**[Caching with EAS Hosting deployments](https://docs.expo.dev/eas/hosting/reference/caching/)

**版本边界：**本页使用 HTTP Cache-Control 和 EAS Hosting CDN 当前行为。缓存规则会影响 API response 的新鲜度、用户数据隔离与计费；本文只是整理官方配置语义，没有运行 API route。

## API Route 的 Response Cache-Control

API route 可以用 response header 控制 EAS Hosting 是否缓存以及缓存多久：

```ts
export async function GET(request: Request) {
  return Response.json(
    { message: "Cached result" },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
```

max-age=3600 表示 fresh 3600 秒。缓存可减少重复执行 API route，但要确保 response 对不同用户 / 权限安全共享。

## Cache-Control 语法与公开范围

Cache-Control header 是逗号分隔 directive。Directive 可有参数（max-age=3600），也可单独出现（public）。

| Response directive | EAS Hosting / Browser 语义 |
| --- | --- |
| public | 允许共享 cache（包括 EAS Hosting）保存 response。 |
| private | 只允许单个用户自己的 browser cache 保存，EAS 不在共享 CDN 缓存。 |
| no-store | response 不缓存或存储。 |
| no-cache | 需要重新校验；在本页的 EAS 行为描述中等同于 max-age=0。 |
| max-age=seconds | Browser 与一般缓存的新鲜时间。 |
| s-maxage=seconds | 单独规定 EAS Hosting shared cache 的新鲜时间。 |

无 Authorization request header 的 GET / HEAD 默认可作为 public response 缓存。只有 response header 明确设成 public 时才共享其他私密信息。

如果希望 browser 不缓存但 EAS CDN 缓存，可分开声明：

```ts
export async function GET(request: Request) {
  return Response.json(
    { message: "CDN cached, browser not cached" },
    {
      headers: {
        "Cache-Control": "no-store",
        "CDN-Cache-Control": "max-age=3600",
      },
    }
  );
}
```

CDN-Cache-Control 是面向 Hosting / CDN 的独立 header，会隐含 public 并覆盖 EAS CDN 缓存时长；普通用户 browser 仍遵循 Cache-Control。

## Fresh / Stale 时间

- max-age：response 保持 fresh 的秒数。
- s-maxage：仅对 EAS shared cache 设置 fresh 秒数。
- no-cache：fresh 时间为 0，需要重新验证。
- immutable：response 永不变更；缓存系统尽可能长期保存且不判断 stale。
- stale-while-revalidate：超过 max-age 后的一段窗口仍可先返回旧值，同时后台重新调用 API route 更新 cache。
- stale-if-error：缓存过期后若 API route crash 或返回 500 / 502 / 503 / 504，可在允许时间内先回传旧值而不暴露错误页。

例如缓存 30 分钟，后续 1 小时窗口允许 stale response 返回并在后台更新：

```http
Cache-Control: public, max-age=1800, stale-while-revalidate=3600
```

## Request Cache-Control

Client 也可在 request header 指定自己能否接受缓存结果：

| Request directive | 行为 |
| --- | --- |
| only-if-cached | 只允许返回 cache hit；没有缓存则中止并返回 504 / must-revalidate。 |
| no-store、no-cache、max-age=0 | 跳过缓存并强制直达 API route。 |
| min-fresh=seconds | 跳过过旧缓存；例如 min-fresh=360 不接受缓存超过 6 分钟的 response。 |
| max-stale=seconds | 限制能接受的 stale response 年龄；不改变服务器本来设的 TTL。 |
| stale-if-error=seconds | 设置客户端可接受 API route 出错时 stale response 的最长窗口。 |

Request 的 max-stale / stale-if-error 只会进一步缩短可接受旧内容的时间，不会延长 response 原始 cache 的有效期。

## 哪些 HTTP Methods 可以缓存

GET / HEAD 的响应通常按 URL 做 cache key。EAS Hosting 也支持缓存 POST，但需要 request body 小于 1 MB，并且 response 明确设置 public：

```ts
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json(
    { result: body.input },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    }
  );
}
```

POST 默认用 URL + request body 做 cache key；GET / HEAD 默认只按 URL。若结果会随 request headers 改变，使用 Vary 告诉 cache 还需比较哪些 header：

```http
Vary: custom-header
```

只有 custom-header 值与缓存时一致，才会复用对应 response。

## Expires 与 CORS Preflight

EAS Hosting 也支持旧式 Expires HTTP-date header。它通常用于未认证的 GET response，不会自动让 response 成为 public。

浏览器发 CORS request 前可能先发 OPTIONS preflight。Access-Control-Max-Age: 3600 可把 OPTIONS response 缓存 3600 秒，减少浏览器与 EAS Hosted API route 收到的 OPTIONS 次数。

## Static Assets 的 Cache

静态资源 response 默认给 Browser 3600 秒缓存，并在 EAS 内部永久缓存。因每个 deployment 内容不可变，这样可以安全地长期内部复用。Production alias 指向新 deployment 时，EAS 会忽略旧 deployment 的 assets cache，因此新版本可以立即切换。

## Billing 与 Metrics

EAS Hosting 按 request 数量计费；cache hit 仍然计为 request，也仍在 Dashboard request metrics 中出现。Cache 可以降低 API route 运行频率与响应时间，但不减少 HTTP 请求 quota。

## 关键名词

- **Shared Cache：**EAS Hosting CDN 可以被多个用户共享的缓存。
- **Browser Cache：**单个客户端 browser 本地保存的结果。
- **Cache Key：**决定哪些 request 会复用同一 response 的匹配字段，默认 GET/HEAD 看 URL。
- **TTL：**Time To Live，缓存有效新鲜期。
- **Stale Response：**超过 max-age 的旧缓存响应，受 stale directives 控制是否还能返回。
- **CORS Preflight：**浏览器真正发送跨源请求前先用 OPTIONS 查询允许的 method / headers。
- **Alias Promotion：**改变 production alias 指向的 deployment，EAS 会清理旧 assets cache 并切换到新 build。

## 官方代码主题覆盖

源页所有 code / HTTP header themes 均有示例：Cache-Control public/max-age、浏览器与 CDN 分开的 CDN-Cache-Control、POST 缓存、Vary header、Cache-Control syntax、Expires / CORS max age、max-age / s-maxage / immutable / stale-while-revalidate / stale-if-error、request-only-if-cached / min-fresh / max-stale、static asset 默认 cache 与 alias 切换行为。未请求或缓存任何数据。

## 下一页

官方页脚 **Next** 是 [Default responses and headers](https://docs.expo.dev/eas/hosting/reference/responses-and-headers/)，列出 EAS Hosting 自动附加的 CORS、HSTS、forwarded、地域和 crash response headers。

**翻页：**[上一页：用 EAS Workflows 自动部署 EAS Hosting](./077-EAS-Hosting-Workflows.md) · [返回目录](./README.md) · [下一页：Default Responses and Headers](./079-EAS-Hosting-Response-Headers.md)
