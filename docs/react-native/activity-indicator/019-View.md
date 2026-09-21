# 019 View

**翻页：** [上一页：018 TouchableWithoutFeedback](018-TouchableWithoutFeedback.md) · [目录](README.md) · [下一页：020 VirtualizedList](020-VirtualizedList.md)

**官方页面：** [View · React Native](https://reactnative.dev/docs/view)  
**源页代码覆盖：** 基础原生容器、合成式触摸/responder 事件、无障碍与 ARIA、键盘/TV 焦点、pointerEvents 与 hitSlop、布局/测试 ID、裁剪和 GPU 栅格化性能选项。

## View 是原生布局容器

**View** 是 RN 中最基础的视觉容器，可对应 Android View 和 iOS UIView。它用于布局、背景、边框、触摸处理和容纳其他组件，常被类比成 Web 的 div；但 View 是原生视图，不支持 DOM API，也不意味着每个 React 元素最终都一定有一个独立原生 View。

大多数页面通过 Flexbox 组织 View。通常不必把每个 Text 再套一层 View；只有确实需要布局、背景、交互或无障碍边界时才添加容器。

    function ProfileCard({ person }) {
      return (
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{person.name}</Text>
          <Text>{person.description}</Text>
        </View>
      );
    }

## 原生触摸与 responder 系统

View 可以通过 responder props 参与触摸仲裁。RN 会沿视图树询问谁要响应触摸；捕获阶段从祖先向下决定是否让子项接手，命中阶段再决定由谁成为 responder。对于按钮或卡片，优先使用 **Pressable**，它已经处理点击、长按、触摸取消和 pressed 状态。

常见流程为 **onStartShouldSetResponder** / **onMoveShouldSetResponder** 表示当前 View 想接管开始或移动手势；Capture 版本让父节点在子节点之前拦截。获得响应后触发 **onResponderGrant**，移动时触发 **onResponderMove**，松手触发 **onResponderRelease**。系统或其他视图抢走手势时会触发 **onResponderTerminate**；交接之前可由 **onResponderTerminationRequest** 决定是否同意让出。

    <View
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => setDragging(true)}
      onResponderMove={event => {
        const { pageX, pageY } = event.nativeEvent;
        movePreview(pageX, pageY);
      }}
      onResponderRelease={() => setDragging(false)}
      onResponderTerminate={() => setDragging(false)}
      onResponderTerminationRequest={() => true}
    >
      <Text>仅在确实要管理整段手势时才直接接 responder</Text>
    </View>

响应事件一般带有 **nativeEvent**，其中坐标是设备界面中的原生触摸坐标。Responder 接口较底层，多个视图同时响应时需要仔细设计捕获规则；普通点击尽量交给 Pressable，拖动/捏合等复杂手势再选择对应手势方案。

## 触摸命中、事件穿透和聚焦

**hitSlop** 可扩大可开始触摸的区域，但不能越过父 View 边界；重叠视图会按绘制层级决定命中者。**pointerEvents** 控制 View 及其 children 是否参与命中：auto、none、box-none（仅 children 可被命中）、box-only（仅容器命中）。

Android **focusable** 控制是否接受非触摸焦点，如硬件键盘；**tabIndex** 可用 0 允许聚焦、-1 排除。Android TV 方向键可用 **nextFocusDown/Forward/Left/Right/Up** 指定下个焦点。**ref** 用于取得挂载节点；**id/nativeID** 用于原生代码定位，其中 id 优先于 nativeID。**testID** 是端到端测试查找标签，但会让该视图跳过 layout-only 优化。

## 无障碍属性

View 的无障碍接口可分为名称/角色、状态/值和动作：

| prop | 说明 |
|---|---|
| **accessible** | 是否作为 VoiceOver/TalkBack 可聚焦元素。 |
| **accessibilityLabel / Hint / Role / State / Value** | 名称、操作结果提示、用途角色、禁用/勾选/选中等状态、文字或范围值。 |
| **accessibilityActions / onAccessibilityAction** | 声明辅助技术可以调用的动作，并处理对应动作名称。 |
| **accessibilityElementsHidden** | iOS：隐藏本元素及后代，不让 VoiceOver 聚焦。 |
| **accessibilityLanguage** | iOS：设置朗读语言。 |
| **accessibilityIgnoresInvertColors** | iOS：系统反色时保持视觉原色。 |
| **accessibilityLiveRegion** | Android：none、polite 或 assertive，描述更新播报方式。 |
| **accessibilityViewIsModal** | iOS：使 VoiceOver 忽略此视图以外的同级元素。 |
| **aria-busy / checked / disabled / expanded / hidden / label / selected** | 用常见 aria 语义描述更新、勾选、禁用、展开、隐藏、名称及选中态。 |
| **aria-labelledby** | Android：引用另一无障碍元素的 nativeID 作为标签来源。 |
| **aria-live** | Android：控制动态区域是否及何时播报变化。 |
| **aria-modal** | iOS：声明模态区域；优先于 accessibilityViewIsModal。 |
| **aria-valuemin/max/now/text** | 声明范围控件的边界、当前值或文字说明。 |
| **onAccessibilityEscape / onAccessibilityTap / onMagicTap** | iOS：处理辅助技术手势，如逃出当前模式或两指双击。 |
| **importantForAccessibility** | Android：控制本节点及后代是否参与无障碍导航。 |
| **experimental_accessibilityOrder** | 显式指定无障碍导航顺序；实验属性，设置前应核对目标 RN 版本行为。 |

无障碍 API 应表达真实状态：例如折叠面板使用 expanded，开关用 checked/selected；避免只通过颜色或图标形状传达状态。

## 原生视图创建、裁剪与图形性能

RN 会尝试把只承担布局作用的 View 优化掉（layout-only view removal）。**collapsable={false}** 会强制创建对应原生 View，常用于需要可测量/有原生 id 的节点；**collapsableChildren** 控制 children 的优化。默认保留默认优化即可，只有原生交互或测量确有需要再关掉。

**removeClippedSubviews** 把边界外的原生子视图从父视图移除，适用于有很多屏外子项的滚动区域；它不会减少 React 数据本身，而且可能导致内容缺失。Android **renderToHardwareTextureAndroid** 会把视图及子项先画入一张 GPU 纹理，适合仅改变透明度/旋转/位移/缩放的动画，但纹理占显存，动画结束应关闭。**needsOffscreenAlphaCompositing** 在复杂透明度叠加时可改用离屏合成，但更耗时。iOS **shouldRasterizeIOS** 将静态子树缓存为位图，可优化移动静态图层；栅格化会额外离屏绘制和占内存，要实测再启用。

## 布局和示例属性

**onLayout** 在挂载及布局变化时提供 x/y/width/height。**style** 接受 View 样式。**id**/nativeID 可被原生侧检索。平台 UI 组件另有平台特定 props；此页的 View props 会被许多 RN 组件继承。

## 代码覆盖清单

已重写官方正文中 View/responder 基础交互主题，覆盖开始捕获、获得/移动/释放/终止/让出事件。参考中的无障碍与 ARIA、TV/键盘焦点、hitSlop/pointerEvents、布局/测试标识、collapsable、屏外裁剪和 Android/iOS 图形优化属性均有分组说明。源页没有给出统一独立应用实现；示例按概念编写。

**翻页：** [上一页：018 TouchableWithoutFeedback](018-TouchableWithoutFeedback.md) · [目录](README.md) · [下一页：020 VirtualizedList](020-VirtualizedList.md)
