# 166｜Expo SDK GLView OpenGL 渲染视图

**翻页：**[上一页：Expo SDK GlassEffect Liquid Glass 效果](./165-Expo-SDK-GlassEffect.md) · [目录](./README.md) · [下一页：Expo SDK Gyroscope 陀螺仪](./167-Expo-SDK-Gyroscope.md)

**官方页面：**[GLView · Latest](https://docs.expo.dev/versions/latest/sdk/gl-view/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/gl-view/)

**版本与平台：**Latest 推荐 `expo-gl ~57.0.2`；SDK v56.0.0 推荐 `~56.0.6`。支持 Android、iOS、Web，并标记可在 Expo Go 中使用。

## GLView 在 React Native 里的作用

`GLView` 是一个显示 OpenGL ES 渲染结果的 React Native 视图。组件挂载后创建 GLContext（图形上下文）；`onContextCreate(gl)` 收到绘图对象。应用调用图形 API 绘制后，要用 `gl.endFrameEXP()` 通知 Expo 提交当前帧。

如果你熟悉 React Web，可把它理解为一个由原生层管理的 canvas-like render target，但它不是 DOM canvas：

- 绘图通过 WebGL 兼容接口完成，顶点 / 片元 shader 是 GPU 执行的小程序。
- 上下文创建与帧提交依赖原生同步调用；Remote JS Debugging 会把 JS 搬到电脑浏览器中运行，因此 GLView 不能正常工作。
- 纯 WebGL 很底层。Expo 页面推荐 `expo-three` 渲染 three.js，或 `expo-processing` 渲染 Processing；其它要求 `WebGLRenderingContext` 的库也可能可用，但假设存在 `document` 等浏览器接口的部分需要适配。

安装：

```sh
npx expo install expo-gl
```

## 基本绘制流程：清屏并画一个点

源页示例的主题是完整的 GL 初始化链：创建 GLView、设置 viewport、设定清屏颜色、编译 vertex / fragment shader、链接 program、清画布、绘制点并提交帧。下面保留各步骤，省去样式细节：

```tsx
import { View } from 'react-native';
import { GLView } from 'expo-gl';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <GLView style={{ width: 300, height: 300 }} onContextCreate={drawScene} />
    </View>
  );
}

function drawScene(gl) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 1, 1, 1);

  // Vertex shader 定义几何体的位置与点大小。
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `
    void main(void) {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 150.0;
    }
  `);
  gl.compileShader(vertexShader);

  // Fragment shader 为绘制出的片元设置颜色。
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `
    void main(void) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);
  gl.flush();
  gl.endFrameEXP();
}
```

`viewport` 指定绘制区域；`clearColor` 是清屏背景色；`VERTEX_SHADER` 与 `FRAGMENT_SHADER` 分工描述顶点位置和像素颜色；`program` 把二者链接起来。此最小例子从原点画一个黑点，背景为青色。

## 在 Reanimated worklet 中绘图

Worklet 是 Reanimated 在 UI 线程运行的独立 JS 函数。GLContext 不能直接跨运行时传递，因此先把 `gl.contextId` 传入 worklet，再使用 `GLView.getWorkletContext(contextId)` 重建这个工作线程可用的上下文。组件必须开启 `enableExperimentalWorkletSupport`：

```tsx
import { View } from 'react-native';
import { runOnUI } from 'react-native-reanimated';
import { GLView } from 'expo-gl';

function render(gl) {
  'worklet';
  // 在此放置只依赖 GL API / worklet 允许函数的 WebGL 绘图逻辑。
  gl.clearColor(0.1, 0.2, 0.4, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.endFrameEXP();
}

function onContextCreate(gl) {
  runOnUI((contextId) => {
    'worklet';
    const workletGl = GLView.getWorkletContext(contextId);
    if (workletGl) render(workletGl);
  })(gl.contextId);
}

export default function WorkletCanvas() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <GLView
        style={{ width: 300, height: 300 }}
        enableExperimentalWorkletSupport
        onContextCreate={onContextCreate}
      />
    </View>
  );
}
```

Worklet 限制：通常的 Three.js / Pixi.js 第三方代码不能直接搬入 worklet；工作线程只能运行适当标记、且不依赖浏览器 DOM 的函数。需要加载图片等资源时，先在主 JS 线程加载，再把可用引用传入 worklet。绘制循环使用 `requestAnimationFrame`，`setTimeout` 不受支持。

## 截图与无视图 GL 上下文

`GLView.takeSnapshotAsync(options?)` 对当前组件的 framebuffer 截图；静态 `GLView.takeSnapshotAsync(context, options?)` 可从指定 GL context 截图。静态 `createContextAsync()` 创建无对应 View 的 headless context，适用于后台渲染或多个组件共享一个 context；headless context 需自己创建 viewport、framebuffer 和 texture，之后再取快照。

```ts
import { GLView } from 'expo-gl';

const gl = await GLView.createContextAsync();
gl.viewport(0, 0, 256, 256);
// 创建并绑定自己的 framebuffer / texture，再绘制内容……
const snapshot = await GLView.takeSnapshotAsync(gl, {
  format: 'png',
  flip: true,
});
console.log(snapshot.uri, snapshot.width, snapshot.height);
await GLView.destroyContextAsync(gl);
```

`SnapshotOptions` 可设 `compress`（0 到 1，默认 1）、`flip`（默认 false）、`format`（jpeg/png/webp，默认 jpeg）、读取用 `framebuffer` 和裁切 `rect`。iOS 下请求 webp 会警告并输出 png。`GLSnapshot` 包含 `width` / `height`、`uri`、`localUri`（适用于 `texImage2D`）等字段。

## GLView API 参考

### 组件 props

| 属性 | 平台 / 默认 | 作用 |
| --- | --- | --- |
| `onContextCreate(gl)` | Android / iOS / Web | Context 创建后调用；参数实现 Expo 的 WebGL2 context 接口。 |
| `enableExperimentalWorkletSupport` | 默认 `false` | 允许 Reanimated worklet 与 GL 对象交互。 |
| `msaaSamples` | 仅 iOS；默认 `4` | 多重采样抗锯齿样本数；`0` 关闭。 |
| `ViewProps` | 继承属性 | `style` / 布局等标准 React Native View 属性。 |

### 静态方法、组件方法和 worklet 方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `GLView.createContextAsync()` | `Promise<ExpoWebGLRenderingContext>` | 创建 headless 上下文。 |
| `GLView.destroyContextAsync(exgl?)` | `Promise<boolean>` | 销毁 context；成功销毁时为 `true`。 |
| `GLView.takeSnapshotAsync(exgl?, options?)` | `Promise<GLSnapshot>` | 截图指定上下文的 framebuffer 并写入 cache。 |
| `view.createCameraTextureAsync(cameraRefOrHandle)` | `Promise<WebGLTexture>` | 从 Camera 组件创建纹理。 |
| `view.destroyObjectAsync(glObject)` | `Promise<boolean>` | 销毁 GL 对象。 |
| `view.takeSnapshotAsync(options?)` | `Promise<GLSnapshot>` | 截图与该视图关联的 context。 |
| `GLView.getWorkletContext(contextId)` | `ExpoWebGLRenderingContext \| undefined` | 由 context id 在 worklet 中重建 context。 |

### context 的 Expo 扩展

`ExpoWebGLRenderingContext` 扩展 WebGL2RenderingContext 并有 `contextId`。另外提供：`gl.endFrameEXP()` 提交当前帧；`gl.flushEXP()` 刷新指令；`gl.__expoSetLogging(option)` 配置日志；`gl._expo_texImage2D(...)` 与 `gl._expo_texSubImage2D(...)` 是 Expo 纹理上传辅助接口。

`ComponentOrHandle` 接受 `null`、数字 handle、React Component 或 ComponentClass；`SurfaceCreateEvent` 是 `{ nativeEvent: { exglCtxId: number } }`；`WebGLObject` 有数值 `id`。

## GL 日志枚举

| `GLLoggingOption` | 值 | 说明 |
| --- | ---: | --- |
| `DISABLED` | `0` | 禁用全部日志。 |
| `METHOD_CALLS` | `1` | 记录调用、参数和返回值。 |
| `GET_ERRORS` | `2` | 每次调用后执行 `gl.getError()`；同步检查会明显降低性能。 |
| `RESOLVE_CONSTANTS` | `4` | 将数字参数反查为 GL 常量名。 |
| `TRUNCATE_STRINGS` | `8` | 截断长字符串，避免 shader 日志影响性能。 |
| `ALL` | `15` | 开启以上选项，也包含高开销的 `GET_ERRORS`。 |

## WebGL 能力边界

- 一些旧 Android 设备不支持全部 WebGL2 特性；可以通过 `gl instanceof WebGL2RenderingContext` 检查。
- 当前未实现的 WebGL2 API 包括：`getFramebufferAttachmentParameter`、`getRenderbufferParameter`、`compressedTexImage2D`、`compressedTexSubImage2D`、`getTexParameter`、`getUniform`、`getVertexAttrib`、`getVertexAttribOffset`、`getBufferSubData`、`getInternalformatParameter`、`renderbufferStorageMultisample`、`compressedTexImage3D`、`compressedTexSubImage3D`、`fenceSync`、`isSync`、`deleteSync`、`clientWaitSync`、`waitSync`、`getSyncParameter`、`getActiveUniformBlockParameter`。
- `texImage2D()` 的 pixels 参数接受 `null`、像素 `ArrayBuffer`，或 `{ localUri }`（设备本地 `file://` URI）。Expo Asset 需先完成 `.downloadAsync()`，再使用其本地 URI。
- 为性能着想，当前实现不会对所有 GL 方法的参数类型 / bounds 做校验。传入无效参数可能导致 native crash；开发时应先验证资源与上下文。
- Remote debugging 不受支持：调试器在电脑 Chrome 上运行 JavaScript，而 GLView 要同步调用设备原生上下文。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-gl ~57.0.2`，SDK v56 推荐 `~56.0.6`。
- 两版的基本 WebGL 示例、worklet 支持、静态 / 组件 API、WebGL2 未实现方法列表和 Next 均一致，下一页都是 Gyroscope。

## 源页代码主题覆盖

- Installation：覆盖 `expo-gl` 安装命令。
- Basic GL：覆盖 GLView 布局、onContextCreate、viewport、清屏颜色、vertex / fragment shader 编译、程序 link、draw、flush 与 endFrameEXP 帧提交。
- Reanimated worklet：覆盖 contextId 从 JS 传入 UI worklet、`getWorkletContext` 重建 GL context、`enableExperimentalWorkletSupport` 与 `render` 调用。
- API 用法：补充 headless context 创建 / framebuffer 准备 / 快照 / 销毁示例，原始 API 方法逐一列出。
- Reference：覆盖 props、静态方法、组件方法、worklet 方法、ExpoWebGLRenderingContext 扩展、日志枚举、SnapshotOptions / GLSnapshot 和其他 API 类型。
- Limitations：覆盖高层库集成、Worklet / Remote Debug 限制、WebGL2 部分方法未实现、纹理资源格式约束及 native 参数校验风险。

**翻页：**[上一页：Expo SDK GlassEffect Liquid Glass 效果](./165-Expo-SDK-GlassEffect.md) · [目录](./README.md) · [下一页：Expo SDK Gyroscope 陀螺仪](./167-Expo-SDK-Gyroscope.md)
