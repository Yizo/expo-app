# Expo GLView 学习笔记

> 本文对应 Expo 下一版本 SDK 的未发布文档。原文提示：需要稳定、最新的生产文档时，应查看 Expo SDK 56 对应的 latest 页面。

## GLView 解决什么问题

`expo-gl` 提供 `GLView` 组件，使 React Native 视图可以充当 OpenGL ES 的渲染目标，并向 JavaScript 暴露一个类似 WebGL 的 `GLContext`。

它主要适用于：

- 在 Expo 或 React Native 应用中绘制 2D、3D 图形。
- 运行基于 WebGL 的渲染逻辑。
- 集成 Three.js、Processing 等高级图形 API。
- 将 GPU 渲染结果保存为图片。
- 创建没有可见视图的离屏渲染上下文。
- 配合 Reanimated worklet，在 UI 线程执行图形渲染。

支持的平台包括 Android、iOS 和 Web，并包含在 Expo Go 中。

## React Web 开发者需要先理解的概念

### GLView 不是 DOM Canvas

在 React Web 中，通常通过 `<canvas>` 获取 WebGL 上下文：

```js
const gl = canvas.getContext('webgl2');
```

在 React Native 中不存在浏览器 DOM，也不能依赖 `document` 或普通的 `<canvas>`。`GLView` 承担了类似 Canvas 的职责：

1. `GLView` 挂载。
2. 原生平台创建 OpenGL ES 上下文。
3. `onContextCreate` 收到 `gl` 对象。
4. 应用通过 `gl` 发出 WebGL 风格的绘图命令。
5. 调用 `gl.endFrameEXP()`，通知 Expo 当前帧可以显示。

因此，`GLView` 可以理解为“由原生 OpenGL ES 支撑、向 JavaScript 提供 WebGL 接口的 React Native 视图”。

### OpenGL ES、WebGL 与 GLContext

- **OpenGL ES**：面向移动设备和嵌入式设备的底层图形 API。
- **WebGL**：浏览器面向 JavaScript 暴露的图形 API，其设计基于 OpenGL ES。
- **GLContext**：保存当前 GPU 渲染状态和资源的上下文，例如着色器、纹理、缓冲区、帧缓冲区等。
- **渲染目标**：GPU 最终写入像素的区域。`GLView` 的底层绘图缓冲区就是一个可显示的渲染目标。
- **帧缓冲区（framebuffer）**：保存一帧渲染结果的缓冲区，可以显示在视图中，也可以用于离屏渲染。

`expo-gl` 返回的 `ExpoWebGLRenderingContext` 类似 `WebGL2RenderingContext`，但并没有实现全部 WebGL 2 API。

### 着色器

着色器是运行在 GPU 上的小程序：

- **顶点着色器**决定顶点的位置、大小等。
- **片段着色器**决定最终像素的颜色。

着色器通常使用 GLSL 编写，而不是 JavaScript。JavaScript 的职责是创建、编译、连接着色器并提交绘图命令。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-gl

# yarn
yarn expo install expo-gl

# pnpm
pnpm expo install expo-gl

# bun
bun expo install expo-gl
```

这里使用 `expo install`，是为了让 Expo 根据当前 SDK 选择兼容的依赖版本。

如果是在已有的纯 React Native 工程中安装，而不是在 Expo 项目中使用，需要先按照 Expo Modules 的安装流程将 `expo` 接入原生工程。当前文档没有展开 iOS CocoaPods、Android Gradle 等具体配置步骤。

## 基础渲染流程

原文示例渲染了一个黑色点：

```jsx
import { View } from 'react-native';
import { GLView } from 'expo-gl';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <GLView
        style={{ width: 300, height: 300 }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

function onContextCreate(gl) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 1, 1, 1);

  const vert = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(
    vert,
    `
      void main(void) {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        gl_PointSize = 150.0;
      }
    `
  );
  gl.compileShader(vert);

  const frag = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(
    frag,
    `
      void main(void) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    `
  );
  gl.compileShader(frag);

  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);

  gl.flush();
  gl.endFrameEXP();
}
```

### 代码执行顺序

#### 1. 创建可显示区域

```jsx
<GLView
  style={{ width: 300, height: 300 }}
  onContextCreate={onContextCreate}
/>
```

`GLView` 挂载后创建 OpenGL ES 上下文，然后调用 `onContextCreate`。

React Web 开发者容易误以为 React 每次重新渲染都会执行 GPU 绘制。实际上，GPU 绘制从 `onContextCreate` 回调开始，属于命令式流程，不是 React 声明式渲染流程。

#### 2. 设置视口

```js
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
```

视口定义绘图结果映射到绘图缓冲区的哪个区域。这里使用完整缓冲区，而不是直接写死 React Native 样式中的 `300 × 300`。

`GLView` 的布局尺寸和 GPU 绘图缓冲区尺寸不一定应被视为同一个概念，因此应使用 `drawingBufferWidth` 和 `drawingBufferHeight` 设置视口。

#### 3. 设置清屏颜色

```js
gl.clearColor(0, 1, 1, 1);
```

四个参数依次是红、绿、蓝、透明度，取值范围通常为 `0` 到 `1`。这里设置为青色。

#### 4. 创建并编译着色器

```js
const vert = gl.createShader(gl.VERTEX_SHADER);
const frag = gl.createShader(gl.FRAGMENT_SHADER);
```

示例顶点着色器把点放在中心，并设置为 `150` 像素；片段着色器把它绘制为黑色。

#### 5. 创建 GPU 程序

```js
const program = gl.createProgram();
gl.attachShader(program, vert);
gl.attachShader(program, frag);
gl.linkProgram(program);
gl.useProgram(program);
```

GPU 程序由顶点着色器和片段着色器连接而成。调用 `useProgram` 后，后续绘图使用该程序。

#### 6. 清屏并绘制

```js
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```

`clear` 使用之前配置的青色清理颜色缓冲区，`drawArrays` 绘制一个点。

#### 7. 提交并显示当前帧

```js
gl.flush();
gl.endFrameEXP();
```

`endFrameEXP()` 是 Expo 增加的方法，用来通知上下文当前帧已经可以显示，类似其他 OpenGL 平台中的交换缓冲区操作。

原文示例同时调用了 `flush()` 和 `endFrameEXP()`，但没有进一步说明所有场景下两者分别是否必需。

## 使用高级图形库

WebGL API 非常底层。实际项目可以使用构建在 `GLView` 之上的高级库：

- `expo-three`：用于集成 Three.js。
- `expo-processing`：用于集成 Processing。

原则上，任何只需要 `WebGLRenderingContext` 的库都有可能与 `GLView` 配合使用。

但 Web 图形库可能隐含依赖浏览器环境，例如：

- 使用 `document` 创建元素。
- 使用 DOM 事件处理输入。
- 通过浏览器 API 加载图片或其他资源。

这些部分在 React Native 中不可用。库的核心渲染代码如果只依赖 WebGL，通常可以通过适配继续使用。Expo 提供的集成库已经处理了部分常见兼容问题。

**基于文档内容推导：** 评估一个 WebGL 库能否迁移到 `GLView` 时，不能只看它是否支持 WebGL，还要检查资源加载、事件处理和 DOM 访问方式。

## 与 Reanimated Worklet 集成

### 为什么需要额外处理

Reanimated worklet 是运行在独立运行时中的函数，通常用于在 UI 线程执行动画或交互逻辑。它不能直接复用主 JavaScript 运行时中的普通 `gl` 对象。

正确流程是：

1. 在主线程的 `onContextCreate` 中取得 `gl.contextId`。
2. 将这个数字 ID 传给 `runOnUI`。
3. 在 worklet 中调用 `GLView.getWorkletContext(contextId)`。
4. 根据 ID 重新取得 worklet 可使用的 GL 对象。

```jsx
import { View } from 'react-native';
import { runOnUI } from 'react-native-reanimated';
import { GLView } from 'expo-gl';

function render(gl) {
  'worklet';
  // 在这里添加 WebGL 绘制代码
}

function onContextCreate(gl) {
  runOnUI((contextId) => {
    'worklet';

    const workletGl = GLView.getWorkletContext(contextId);
    render(workletGl);
  })(gl.contextId);
}

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <GLView
        style={{ width: 300, height: 300 }}
        enableExperimentalWorkletSupport
        onContextCreate={onContextCreate}
      />
    </View>
  );
}
```

必须通过 `enableExperimentalWorkletSupport` 开启实验性支持，其默认值为 `false`。

### Worklet 限制

Worklet 运行时会限制可以执行的代码，已有 WebGL 代码通常需要修改：

- Pixi.js、Three.js 等第三方库不能直接在 worklet 中运行。
- 只有函数开头包含 `'worklet'` 的函数才能在该环境中使用。
- 资源必须在主线程加载，再通过引用传给 worklet。
- 使用 `expo-asset` 时，可以把 `Asset.fromModule` 或 `useAssets` 返回的资源对象传给 `runOnUI`。
- 渲染循环必须使用 `requestAnimationFrame`。
- `setTimeout` 等 API 不受支持。

`GLView.getWorkletContext()` 的返回类型包含 `undefined`，因此实际代码应考虑没有找到对应上下文的情况。

**基于文档内容推导：** Worklet 更适合自行编写、范围明确的 WebGL 绘制逻辑，不适合直接搬入依赖复杂 JavaScript 运行时的完整图形引擎。

## 远程调试限制

开启传统 React Native 远程调试时，`GLView` 无法按预期工作。

原因是远程调试会让 JavaScript 在开发电脑上运行，而不是在移动设备上运行；`GLView` 需要同步调用设备上的原生能力，Chrome 远程调试环境不支持这种调用方式。

这与 React Web 中“浏览器开发者工具就是代码实际运行环境”的情况不同。排查 `GLView` 问题时，应首先确认 JavaScript 是否仍然运行在设备端。

当前文档没有说明应使用哪一种替代调试工具或具体调试步骤。

## GLView 组件 API

```js
import { GLView } from 'expo-gl';
```

`GLView` 是一个 React 组件，并继承 React Native `View` 的属性。

### `onContextCreate`

```ts
(gl: ExpoWebGLRenderingContext) => void
```

当 OpenGL ES 上下文创建完成后调用，是开始初始化着色器、纹理及其他 GPU 资源的主要入口。

支持 Android、iOS 和 Web。

### `enableExperimentalWorkletSupport`

```ts
boolean
```

默认值为 `false`，用于允许 Reanimated worklet 线程与 `gl` 对象交互。

支持 Android、iOS 和 Web。

### `msaaSamples`

```ts
number
```

仅支持 iOS，默认值为 `4`。

该属性控制多重采样抗锯齿的采样数量。多重采样可以改善图形边缘的锯齿，但通常也会增加 GPU 和内存开销。设置为 `0` 会关闭多重采样。

## 上下文管理与快照

### 创建无视图上下文

```ts
GLView.createContextAsync(): Promise<ExpoWebGLRenderingContext>
```

该方法创建一个没有底层 `GLView` 的 headless context，即离屏上下文。

适合：

- 在不显示 `GLView` 的情况下渲染。
- 整个应用只保留一个上下文。
- 在多个组件之间共享同一个上下文。

它不需要交换帧缓冲区，也不会把内容直接呈现在视图中，因此比普通上下文稍快。但使用者必须自行：

1. 设置 viewport。
2. 创建 framebuffer。
3. 创建作为渲染目标的 texture。
4. 将结果绘制到该目标。
5. 必要时通过快照输出结果。

### 销毁上下文

```ts
GLView.destroyContextAsync(exgl): Promise<boolean>
```

销毁指定上下文。返回 `true` 表示该上下文存在并成功销毁。

原文参数表的类型与描述排版存在不一致：表格展示为可选 `number`，描述又指向 `ExpoWebGLRenderingContext`。仅根据当前文档无法进一步确定调用时应传上下文对象还是上下文 ID，应结合对应 SDK 的类型声明确认。

### 静态快照

```ts
GLView.takeSnapshotAsync(exgl, options): Promise<GLSnapshot>
```

读取指定上下文的帧缓冲区，将结果保存到应用缓存目录，并返回快照信息。

### 组件实例快照

```ts
glViewRef.takeSnapshotAsync(options): Promise<GLSnapshot>
```

作用与静态方法相同，但自动使用当前 `GLView` 关联的上下文。

### `SnapshotOptions`

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `compress` | `number` | `1.0` | 压缩级别，范围为 `0` 到 `1.0`；`1.0` 表示不压缩，`0` 表示最高压缩 |
| `flip` | `boolean` | `false` | 是否垂直翻转快照 |
| `format` | `'jpeg' \| 'png' \| 'webp'` | `'jpeg'` | 输出格式 |
| `framebuffer` | `WebGLFramebuffer` | 见下文 | 指定读取的帧缓冲区 |
| `rect` | `{ x, y, width, height }` | 未指定 | 裁剪区域，直接传递给 `glReadPixels` |

未指定 `framebuffer` 时：

- 普通 `GLView` 使用呈现在视图中的底层帧缓冲区。
- headless context 使用当前帧缓冲区。

格式方面：

- PNG 无损，但速度较慢。
- JPEG 较快，但可能产生可见压缩痕迹。
- iOS 使用 WebP 时会打印警告，并改为生成 PNG 文件。原文建议为此编写平台特定代码。

### `GLSnapshot`

快照结果包含：

| 属性 | 含义 |
| --- | --- |
| `width` | 快照宽度 |
| `height` | 快照高度 |
| `uri` | 快照 URI、Blob 或 `null` |
| `localUri` | `uri` 的同义字段，可直接用于 `texImage2D` |

## 其他组件方法

### `createCameraTextureAsync(cameraRefOrHandle)`

```ts
createCameraTextureAsync(
  cameraRefOrHandle: ComponentOrHandle
): Promise<WebGLTexture>
```

根据摄像头组件的引用或原生句柄创建 WebGL 纹理。

当前文档只给出了签名，没有说明摄像头权限、组件兼容条件、纹理更新方式和生命周期管理流程。

### `destroyObjectAsync(glObject)`

```ts
destroyObjectAsync(glObject: WebGLObject): Promise<boolean>
```

异步销毁指定 GL 对象。

当前文档没有说明它与 `deleteTexture`、`deleteBuffer` 等标准 WebGL 删除方法之间的选择关系。

### `ComponentOrHandle`

可接受：

```ts
null | number | Component<any, any> | ComponentClass<any>
```

### `WebGLObject`

该类型包含数字属性：

```ts
{
  id: number;
}
```

## ExpoWebGLRenderingContext

`ExpoWebGLRenderingContext` 类似并扩展 WebGL 2 上下文，额外具有：

```ts
contextId: number;
```

`contextId` 可用于把上下文身份传递给 Reanimated worklet。

文档同时在 `onContextCreate` 说明中使用了“扩展 `WebGLRenderingContext`”的表述，在接口部分则写明扩展 `WebGL2RenderingContext`。实际能力应以运行时检测和当前 SDK 类型声明为准。

### Expo 扩展方法

#### `endFrameEXP()`

通知上下文当前帧已经准备好显示。普通 WebGL Canvas 通常由浏览器处理呈现流程，而 `GLView` 需要这个 Expo 扩展方法明确结束当前帧。

#### `flushEXP()`

Expo 提供的 flush 扩展方法。当前文档只列出了签名，没有解释它与标准 `gl.flush()` 的具体区别。

#### `__expoSetLogging(option)`

设置 GL 调试日志选项。

#### `_expo_texImage2D()` 与 `_expo_texSubImage2D()`

Expo 内部扩展的纹理上传方法。当前文档没有提供使用说明，因此不应根据方法名称自行假定其稳定用法。

## GL 日志选项

`GLLoggingOption` 是位标志枚举：

| 选项 | 值 | 作用 |
| --- | ---: | --- |
| `DISABLED` | `0` | 完全关闭日志 |
| `METHOD_CALLS` | `1` | 记录方法调用、参数和结果 |
| `GET_ERRORS` | `2` | 每次方法调用后执行 `gl.getError()` |
| `RESOLVE_CONSTANTS` | `4` | 将数字参数解析为对应常量名称 |
| `TRUNCATE_STRINGS` | `8` | 截断较长字符串，例如大型着色器源码 |
| `ALL` | `15` | 启用全部选项 |

`GET_ERRORS` 会在每次调用后执行阻塞式错误检查，对性能有显著影响。`ALL` 包含 `GET_ERRORS`，同样会导致明显减速。

**基于经验建议：** 这些日志选项适合开发阶段定位 GL 调用问题，不应在性能敏感的正式渲染循环中长期启用。

## WebGL 兼容性和限制

### WebGL 2 设备兼容性

`gl` 对象整体类似 WebGL 2 上下文，但部分较旧 Android 设备可能不支持 WebGL 2 特性。

原文建议通过以下方式检测：

```js
gl instanceof WebGL2RenderingContext
```

不能仅因为 TypeScript 类型为 `ExpoWebGLRenderingContext`，就假定所有运行设备都支持完整 WebGL 2 功能。

### 未实现的方法

以下 `WebGL2RenderingContext` 方法当前未实现：

```text
getFramebufferAttachmentParameter()
getRenderbufferParameter()
compressedTexImage2D()
compressedTexSubImage2D()
getTexParameter()
getUniform()
getVertexAttrib()
getVertexAttribOffset()
getBufferSubData()
getInternalformatParameter()
renderbufferStorageMultisample()
compressedTexImage3D()
compressedTexSubImage3D()
fenceSync()
isSync()
deleteSync()
clientWaitSync()
waitSync()
getSyncParameter()
getActiveUniformBlockParameter()
```

这会影响：

- 压缩纹理上传。
- WebGL 3D 压缩纹理。
- GPU 同步对象。
- 部分缓冲区数据读取。
- 部分状态、Uniform 和顶点属性查询。
- Uniform Block 的状态查询。
- WebGL 2 多重采样 Renderbuffer 的创建。

**基于文档内容推导：** 引入第三方图形库前，应检查它是否调用这些 API；即使库声明支持 WebGL 2，也不代表能在 `expo-gl` 中完整运行。

### `texImage2D()` 的像素来源限制

`texImage2D()` 的 `pixels` 参数只能是：

- `null`
- 包含像素数据的 `ArrayBuffer`
- `{ localUri }` 对象，其中 `localUri` 必须是设备文件系统中的 `file://` 图片 URI

使用 Expo `Asset` 时，需要先完成：

```js
await asset.downloadAsync();
```

资源下载完成后，才能使用其本地文件信息上传纹理。

这与浏览器 WebGL 可直接接收 `HTMLImageElement`、`HTMLCanvasElement` 等 DOM 对象不同。

### 参数错误可能导致原生崩溃

出于效率考虑，当前实现不会对方法参数执行完整的类型检查或边界检查。传入无效参数可能不是抛出普通 JavaScript 异常，而是直接造成原生崩溃。

原文表示未来 SDK 计划增加参数检查，但目前错误检查的优先级较低，因为图形引擎通常不会依赖 OpenGL API 代替应用检查参数，底层 OpenGL ES 实现也会执行部分检查。

实际开发中需要特别检查：

- Buffer、Texture 和 Framebuffer 是否仍然有效。
- 数组长度、偏移量和写入范围是否正确。
- 枚举值是否适用于当前方法。
- 着色器是否成功编译。
- GPU 程序是否成功连接。
- 上下文是否已创建或销毁。
- 当前设备是否支持正在使用的 WebGL 2 特性。

## React Web 开发者最容易误解的地方

1. **它不是 React 的声明式绘图组件。** React 负责创建和布局 `GLView`，GL 内容则通过命令式 API 绘制。

2. **不能默认存在浏览器环境。** `document`、DOM 图片元素和 DOM 事件系统在 React Native 中不可用。

3. **样式尺寸不等于绘图缓冲区尺寸。** 设置 viewport 时应读取 `gl.drawingBufferWidth` 和 `gl.drawingBufferHeight`。

4. **一帧绘制结束后需要显式呈现。** 绘制完成后需要调用 Expo 提供的 `endFrameEXP()`。

5. **WebGL 2 类型不代表完整实现。** 老旧 Android 设备可能不支持 WebGL 2，部分 WebGL 2 方法也明确尚未实现。

6. **远程调试可能改变 JavaScript 的运行位置。** 当代码转移到电脑上的 Chrome 运行时，同步原生 GL 调用无法正常工作。

7. **Worklet 不是普通 JavaScript 环境。** 不能直接将 Three.js 等第三方库搬入其中，资源也要在主线程加载。

8. **错误不一定表现为可捕获异常。** 无效 GL 参数可能导致原生应用崩溃。

## 实际开发中的使用方式

### 简单、自定义渲染

直接使用 `GLView`：

1. 在 `onContextCreate` 中初始化 GL 状态。
2. 编译着色器并创建 GPU 资源。
3. 绘制每一帧。
4. 调用 `endFrameEXP()` 呈现。
5. 在组件或上下文结束使用时释放资源。

### 复杂 3D 场景

优先评估 `expo-three` 等高级封装，同时检查：

- 是否依赖 DOM。
- 是否使用未实现的 WebGL 2 API。
- 资源加载方式是否支持本地 `file://` URI。
- 目标 Android 设备是否支持所需特性。

### 高频手势或动画驱动渲染

可以考虑 Reanimated worklet，但必须接受以下约束：

- 绘制函数需要声明为 worklet。
- 上下文通过 `contextId` 重新获取。
- 资源在主线程加载。
- 渲染循环使用 `requestAnimationFrame`。
- 不能直接运行常规第三方图形库。

### 离屏渲染或生成图片

使用 `createContextAsync()` 创建 headless context，自行配置 viewport、framebuffer 和 texture，再使用 `takeSnapshotAsync()` 输出缓存文件。

## 文档未涉及的内容

当前文档没有详细说明：

- OpenGL/WebGL 的系统入门知识。
- 连续动画循环的完整基础示例。
- 着色器编译和程序连接失败时的错误处理代码。
- GL 资源在 React 组件卸载时的完整清理模式。
- Context Lost 的处理方式。
- 摄像头纹理的权限和更新流程。
- Android、iOS 原生工程的手动配置细节。
- 性能基准、设备兼容矩阵和内存占用。
- 替代远程调试的具体工具与操作流程。
- `flushEXP()` 及内部纹理扩展方法的详细语义。

## 总结

`expo-gl` 的核心价值，是在 Expo 和 React Native 中提供一个类似 WebGL 的 OpenGL ES 渲染环境。基本使用路径是：挂载 `GLView`、通过 `onContextCreate` 获取上下文、执行 WebGL 绘制命令，再通过 `endFrameEXP()` 显示当前帧。

它与浏览器 WebGL 接近，但不能视为完全相同：React Native 没有 DOM，纹理资源来源受到限制，部分 WebGL 2 API 尚未实现，老旧 Android 设备存在兼容性差异，无效参数还可能引发原生崩溃。涉及 Reanimated worklet 时，还需要通过上下文 ID 重建 GL 对象，并遵守独立运行时的代码和资源限制。

---

## 文档导航

- **上一页**：[glass effect](./173__glass-effect.md)
- **下一页**：[gyroscope](./175__gyroscope.md)
