# 067 Communication between native and React Native（iOS）

**翻页：** [上一页：066 Running On Simulator](066-RunningOnSimulator.md) · [目录](README.md) · [下一页：068 App Extensions](068-AppExtensions.md)

**官方页面：** [Communication between native and React Native · React Native](https://reactnative.dev/docs/communication-ios)  
**版本范围：** 页面以传统 iOS `RCTRootView`/bridge 混合应用 API 为例。新架构项目要和当前 RN factory/Fabric 集成方式区分。  
**源页代码覆盖：** Objective-C `initialProperties`/`appProperties`、顶层 JS props 和图片展示、原生组件 property setter、events/Native Modules、rootView 固定/灵活尺寸、size flexibility enum 与 delegate 回调。

## 混合应用的数据流

React 的数据通常从父组件经 props 向下流；子组件以 callback 通知父级更新。纯 RN 组件树沿用这个单向数据流。混合应用中，UIKit 原生控件和 RN view 需要互相传值，需明确选择 props、native events 或 Native Modules。

本页代码使用 `RCTRootView` 承载 RN root component。该 API 来自传统 iOS bridge 集成方式；新架构工程应查看与当前 RN 版本匹配的 React Native factory/Fabric 集成指南。

## 原生创建 root view 时传入初始 props

`RCTRootView` 是持有 RN App 的 `UIView`。创建时通过 `initialProperties` 传 `NSDictionary`；内容会转换为 JSON 可表示的数据，并成为 RN 顶层组件的 props。下面用图片 URL 列表演示：

~~~objc
NSArray *imageURLs = @[
  @"https://example.com/guide-a.png",
  @"https://example.com/guide-b.png"
];
NSDictionary *initialProps = @{@"images": imageURLs};

RCTRootView *rootView = [[RCTRootView alloc]
  initWithBridge:bridge
  moduleName:@"ImageGallery"
  initialProperties:initialProps];
~~~

JS/TS root component 读取 props 并渲染成 RN Image：

~~~tsx
import { Image, View } from 'react-native';

type Props = { images: string[] };

export default function ImageGallery({ images }: Props) {
  return (
    <View>
      {images.map(uri => (
        <Image
          key={uri}
          source={{ uri }}
          style={{ width: 160, height: 100 }}
        />
      ))}
    </View>
  );
}
~~~

这个示例表示方向：UIKit host → JSON-like props → 顶层 React component。传入值应是可序列化数据；复杂原生对象不能直接放进 NSDictionary 期待 RN 自动理解。

## 已挂载 RootView 的 props 更新

`RCTRootView.appProperties` 是读写属性。原生设置新属性后，RN 会在数据变化时重新渲染 root component。更新必须在 iOS main thread 执行；读取可在其他线程。每次 setter 都传入一整份 props，因此需要保留仍要使用的键，不能假设它只局部合并几个字段。官方页面也提到，bridge 正在启动时过早写入 appProperties 的变化可能丢失。

~~~objc
NSMutableDictionary *nextProps =
    [rootView.appProperties mutableCopy] ?: [NSMutableDictionary new];

nextProps[@"images"] = updatedImageURLs;

dispatch_async(dispatch_get_main_queue(), ^{
  rootView.appProperties = nextProps;
});
~~~

## RN props 驱动原生视图

若 RN 渲染一个原生自定义组件，旧式 iOS ViewManager 可用 `RCT_CUSTOM_VIEW_PROPERTY` 标记 setter，把 JS prop 转为原生配置。JS 侧便可以像普通 React 组件一样传 prop：

~~~objc
RCT_CUSTOM_VIEW_PROPERTY(isEnabled, BOOL, CustomNativeView) {
  view.enabled = json ? [RCTConvert BOOL:json] : YES;
}
~~~

对于 New Architecture 的 Fabric Component，通常在 TypeScript/Flow spec 声明 prop，再通过 Codegen 生成类型；原生组件在 `updateProps` 中把新值应用到 UIView。前面的 Fabric WebView 页面展示了这套新写法。

Props 不支持任意从子到父的 callback。原生要通知 JS，可用事件；JS 要请求系统能力，可调 Native Module。

## Events 与 Native Modules

原生触发 RN 事件属于异步通信：系统在另一线程调度 JS handler，所以没有精确执行时间保证。事件可以从多个原生位置发送，容易形成隐式依赖和共享名称冲突；若页面里同时有多个同类 RN view，需要传 view ID/`reactTag` 来标记目标。常见做法是让原生 view manager/组件实例负责其事件，而不是把事件散落在全局。

**Native Module** 把原生方法和常量暴露给 JS。旧 bridge 模式通常每个 bridge 创建一个模块单例；若要更新某个原生父视图，模块方法需接收视图 ID 并维护 ID 到 UIView 的映射。模块共享命名空间，命名要避免冲突。新架构项目应优先使用 Turbo Native Module 和 Codegen spec。

## UIKit 和 RN 的尺寸协调

### Native view 嵌入 RN

UIKit 控件都是 `UIView` 子类，嵌入 RN 后常见尺寸/样式可从其 React wrapper 控制。每个平台控件的细节仍以对应 native API 为准。

### RN root view 嵌入原生页面且尺寸固定

原生 host 知道 RN 区域尺寸时，可设置 `RCTRootView.frame`。例如把根视图高度固定为 200 point、宽度匹配宿主：

~~~objc
RCTRootView *root = [[RCTRootView alloc]
  initWithBridge:bridge
  moduleName:@"InlinePanel"
  initialProperties:@{}];

root.frame = CGRectMake(0, 0, hostView.bounds.size.width, 200);
[hostView addSubview:root];
~~~

React 子组件应限制在 root frame 内。若 absolute positioning 让内容溢出，可能覆盖原生控件；触摸反馈也不会越出 root view 边界。原生之后修改 frame，RN 会重新布局。

### RN 内容尺寸在运行时确定

可把 RN 内容包在 `ScrollView` 中滚动，也可用 `RCTRootViewSizeFlexibility` 让 RN 测量宽高，并通过 delegate 将尺寸报告给 UIKit。旧 API 包含以下模式：

~~~objc
typedef NS_ENUM(NSInteger, RCTRootViewSizeFlexibility) {
  RCTRootViewSizeFlexibilityNone = 0,
  RCTRootViewSizeFlexibilityWidth,
  RCTRootViewSizeFlexibilityHeight,
  RCTRootViewSizeFlexibilityWidthAndHeight,
};
~~~

默认 `None` 表示尺寸固定。只让 RN 决定高度时，原生 delegate 可在内容尺寸变化后重设 frame：

~~~objc
rootView.delegate = self;
rootView.sizeFlexibility = RCTRootViewSizeFlexibilityHeight;
rootView.frame = CGRectMake(0, 0, containerWidth, 0);

- (void)rootViewDidChangeIntrinsicSize:(RCTRootView *)rootView {
  CGRect frame = rootView.frame;
  frame.size = rootView.intrinsicContentSize;
  rootView.frame = frame;
}
~~~

不要让原生 flexibility 和 JS Flexbox 同时自由决定同一宽/高，否则尺寸结果未定义。RN layout 在独立线程，UIView 更新在 main thread，尺寸变化时可能短暂不一致。RN 在 root view 加入父视图前不会计算布局；若需等到尺寸确定后显示，可先把 root 加为子视图并隐藏，再在 delegate 回调中显示。

**翻页：** [上一页：066 Running On Simulator](066-RunningOnSimulator.md) · [目录](README.md) · [下一页：068 App Extensions](068-AppExtensions.md)

