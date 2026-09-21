# 080｜EAS Hosting Worker Runtime 与 Node.js Compatibility

**翻页：**[上一页：EAS Hosting Default Responses 与 Request Headers](./079-EAS-Hosting-Response-Headers.md) · [目录](./README.md) · [下一页：EAS Update Introduction](./081-EAS-Update-Introduction.md)

**官方页面：**[EAS Hosting worker runtime](https://docs.expo.dev/eas/hosting/reference/worker-runtime/)

**版本边界：**EAS Hosting Server Functions / API Routes 运行在 Cloudflare Workers V8 isolates，而不是 EAS Build 的 Node.js runner。下方模块支持与 shims 是官方当前清单，可能随 runtime 更新；不能据此假定完整 Node API 可用。

## EAS Hosting 是什么 Runtime

EAS Hosting 基于 Cloudflare Workers。JavaScript 在 V8 引擎的小型 isolate 中执行，而不是为每个 request 运行一个完整的 Node.js process。Workers 设计为按 request 弹性运行，所以没有完整的长期进程、stdin、原生扩展与服务端 socket 环境。

## 可用的 Node.js Built-ins

EAS Hosting 提供一部分 Node.js compatibility modules。对原生完整度有明显差异的项目，优先用标准 Web API：

| Module | 支持情况 / 限制 |
| --- | --- |
| node:assert | 官方列出支持。 |
| node:async_hooks | 官方列出支持。 |
| node:buffer | 支持；全局 Buffer 来源于此模块。 |
| node:crypto | 有支持，但部分已弃用算法不可用。 |
| node:console | 通过 JS shim 部分支持。 |
| node:constants | 官方列出支持。 |
| node:diagnostics_channel | 部分内容 / 已弃用算法并非完整实现。 |
| node:dns | Resolver 未实现，DNS 请求由 Cloudflare 处理。 |
| node:events | 官方列出支持；全局 EventEmitter 从此模块提供。 |
| node:fs | 支持 in-memory filesystem，不是可持久写入的完整磁盘文件系统。 |
| node:http / node:https | 支持 client request 部分；server functionality 不支持。 |
| node:http2 | 部分支持；server functionality 不支持。 |
| node:module | SourceMap 未实现，其余为部分兼容。 |
| node:net | Server / BlockList 未实现，client sockets 部分支持。 |
| node:os | JS stubs 返回近似 Node.js Linux 环境的 mock 值。 |
| node:path、node:path/posix、node:path/win32 | 官方列出支持。 |
| node:process | 由 JS stubs 提供。 |
| node:punycode | 官方列出支持。 |
| node:querystring | 官方列出支持。 |
| node:readline | 无 stdin，因此仅有非功能性 stubs。 |
| node:stream、node:stream/consumers、node:stream/web | 官方列出支持。 |
| node:string_decoder | 官方列出支持。 |
| node:test | 官方列出支持。 |
| node:timers | 官方列出支持。 |
| node:tls | 支持 client 侧部分，不支持 server functionality。 |
| node:trace_events | 非功能性 stubs。 |
| node:tty | JS shims 将输出转到 Console API。 |
| node:url、node:util、node:util/types | 官方列出支持。 |
| node:worker_threads | 无 threading，因此是非功能性 stubs。 |
| node:zlib | 官方列出支持。 |

即便表格中列为 supported，也不代表 API 的所有 Node 行为完全相同。fs / http / https / os 等 compatibility layer 有 Worker 特有限制，可能只有 shim 或近似实现。

未列出的 Node.js built-in 视为不可用 / 不受支持；Route 代码和依赖都不应假设它存在。依赖库如果使用原生 addon、完整 Node file system、开 server socket 或 worker thread，应换成支持 Web runtimes 的依赖，或把任务移到完整 Node 后端。

## Runtime Globals

| Global | Worker 中的含义 |
| --- | --- |
| origin | 等于当前 request 的 Origin header。 |
| process | 可用的 Worker 兼容对象；process.env 由 EAS Hosting environment variables 填充。 |
| process.stdout / process.stderr | 输出会重定向到 Console API，分别相当于 console.log / console.error。 |
| setImmediate / clearImmediate | Worker 兼容实现。 |
| Buffer | node:buffer 的 Buffer。 |
| EventEmitter | node:events 的 EventEmitter。 |
| global | 指向 globalThis。 |
| WeakRef / FinalizationRegistry | V8 globals。 |
| require / require.cache | 可以有限加载已随部署上传的 JS 文件和 built-ins；不支持传统 Node.js node_modules module resolution。 |

## 关键名词

- **V8 Isolate：**共享 V8 引擎进程中的轻量隔离执行单元，区别于为单 request 建完整 Node.js process。
- **Compatibility shim：**为减少迁移工作模拟部分 Node API 的包装层，不代表完整行为一致。
- **Built-in module：**Node.js 自带的模块，如 fs / http / crypto；Workers 只支持官方标注的一部分。
- **Server functionality：**传统 Node.js 可绑定本地端口的 HTTP / TLS server；EAS Hosting 使用平台 request handler，不能起任意本地 server。
- **In-memory filesystem：**运行时内存里的临时文件接口，不是持久本地磁盘。

## 官方代码主题覆盖

源页是运行时兼容性参考，没有实际代码块；Node.js 模块兼容 table、各自限制和运行时 global 表都已覆盖，并标明 partial / stub 与 Node package resolution 之间的边界。

## 下一页

官方页脚 **Next** 离开 EAS Hosting Reference，进入 [EAS Update Introduction](https://docs.expo.dev/eas-update/introduction/)。

**翻页：**[上一页：EAS Hosting Default Responses 与 Request Headers](./079-EAS-Hosting-Response-Headers.md) · [返回目录](./README.md) · [下一页：EAS Update Introduction](./081-EAS-Update-Introduction.md)
