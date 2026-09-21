# 014 Text

**翻页：** [上一页：013 Switch](013-Switch.md) · [目录](README.md) · [下一页：015 TextInput](015-TextInput.md)

**官方页面：** [Text · React Native](https://reactnative.dev/docs/text)  
**源页代码覆盖：** 文本内联嵌套与样式、Text 与 View 的布局差异、文本节点限制、有限的样式继承/自定义字体包装、可访问性/ARIA、动态字体与截断、按压/Responder 回调、排版测量和 TextLayout 类型。

## Text 与 HTML 标签不同

在 Web 里，文字通常是 DOM 文本节点并能继承祖先 CSS。RN 中显示文字必须放进 **Text**；不能把原始字符串直接放在 **View** 下。Text 内部使用文字排版：嵌套 Text 是行内片段，文字会在可用宽度处换行；View 内的多个 Text 则是各自的块元素，按 Flexbox 布局。

    // 正确：纯文本必须由 Text 容纳
    <View>
      <Text>标题</Text>
    </View>

    // 同一个 Text 子树内可行内排版，并局部覆写样式
    <Text style={{ fontSize: 16, color: '#20252b' }}>
      欢迎，
      <Text style={{ fontWeight: '700', color: '#a12b20' }}>林先生</Text>
      ！
    </Text>

不要期待从 View 或全局 CSS 自动继承字体。RN 的文字样式继承仅发生在 Text 子树中，而且 **fontFamily** 一次指定一个字体族名称，不接受 CSS 中的字体回退列表。常用做法是建立 Typography 包装组件，把默认样式作为明确 props 放到组件内：

    function AppText({ style, ...props }) {
      return <Text {...props} style={[{ fontSize: 16, color: '#222' }, style]} />;
    }

    function Heading({ children }) {
      return <AppText style={{ fontSize: 22, fontWeight: '700' }}>{children}</AppText>;
    }

这种组合让应用共享一套排版默认值，同时允许标题等语义组件局部覆盖。

## 字体、截断与平台换行

| prop | 作用与注意点 |
|---|---|
| **allowFontScaling** | 默认 true，跟随系统辅助功能字号；优先保留以支持大字用户。 |
| **maxFontSizeMultiplier** | 设置字号放大的最大倍率；0 表示不设上限，未提供时继承上层/全局值。 |
| **adjustsFontSizeToFit** | 默认 false；空间不足时缩小文字以适配样式约束。 |
| **minimumFontScale** | 仅当自动缩小时限制最小倍率，范围 0.01 到 1。 |
| **dynamicTypeRamp** | iOS 的系统字号等级，从 caption 到 largeTitle。 |
| **numberOfLines** | 限制最大显示行数；0 表示不限制。 |
| **ellipsizeMode** | 与 numberOfLines 配合，头部/中间/尾部省略或直接裁切。多行 Android 最可靠的是尾部省略。 |
| **android_hyphenationFrequency** | Android API 23+ 断词连字符策略：none、normal、full，默认 none。 |
| **textBreakStrategy** | Android API 23+ 换行策略：simple、highQuality、balanced，默认 highQuality。 |
| **lineBreakStrategyIOS** | iOS 14+ 的断行策略：none、standard、hangul-word、push-out。 |
| **dataDetectorType** | Android 把文本中的电话、链接、邮箱转换成可交互项目；默认不检测。 |

    <Text
      numberOfLines={2}
      ellipsizeMode="tail"
      allowFontScaling
      style={{ fontSize: 16, lineHeight: 23 }}
    >
      这是一段可能超过两行的简介，超出的部分会按省略模式隐藏。
    </Text>

## 无障碍、选择与触摸行为

| prop / callback | 用途 |
|---|---|
| **accessibilityLabel** / **aria-label** | 自定义屏幕阅读器朗读名称；默认 label 会汇总子 Text。 |
| **accessibilityHint** | 解释执行某操作的结果，适用于结果不明显的控件。 |
| **accessibilityRole** / **role** | 描述用途；role 优先于 accessibilityRole。 |
| **accessibilityState** | 将 selected、disabled 等一个或多个状态报告给辅助技术。 |
| **accessibilityActions** / **onAccessibilityAction** | 声明并响应辅助技术可触发的动作。 |
| **accessible** | 默认 true，表示当前组件作为无障碍元素聚焦。 |
| **accessibilityLanguage** | iOS：指定朗读语言，使用 BCP 47 语言标签。 |
| **aria-busy** | 更新期间提示辅助技术可暂缓播报变化。 |
| **aria-checked** | 报告可选控件状态，可用 true/false 或 mixed。 |
| **aria-disabled** | 表明元素仍可感知但不能操作。 |
| **aria-expanded** | 报告折叠/展开状态。 |
| **aria-selected** | 报告是否已选中。 |
| **selectable** | 默认 false；true 时允许原生选中、复制文字。 |
| **selectionColor** | Android 选中文字高亮色。 |
| **onPress / onLongPress / onPressIn / onPressOut** | 直接为 Text 设置点击、长按、按下和松开的处理。 |
| **onMoveShouldSetResponder / onStartShouldSetResponderCapture** | 参与 RN responder 协商，决定触摸由谁接管。 |
| **onResponderGrant / Move / Release / Terminate / TerminationRequest** | responder 获得、移动、释放、被中断以及是否同意让出时触发。 |
| **pressRetentionOffset** | 在滚动容器禁用时，定义手指离开文本区域多少仍保留按压激活。 |
| **suppressHighlighting** | iOS：关闭默认按压高亮效果。 |
| **ref** | 获得已挂载的元素节点；Text ref 是组件节点，不是单独文字节点。 |

按钮式文字应为屏幕阅读器提供明确角色与 label。颜色只是附加信息，不能用它单独表达 selected/disabled：

    <Text
      accessible
      accessibilityRole="button"
      accessibilityLabel="打开帮助中心"
      accessibilityHint="会切换到帮助页面"
      accessibilityState={{ disabled: false }}
      onPress={openHelp}
      onLongPress={showHelpPreview}
      suppressHighlighting={false}
    >
      帮助
    </Text>

## 布局、样式和测量属性

**style** 接受 Text 样式，以及部分 View 通用样式。边框宽度和各角 radius 并非所有平台都支持在文字本身绘制；需要背景或边框时可把 Text 放进 View。**disabled** 是 Android 面向测试的文本视图属性，不等于通用按钮禁用 API。**id** 与 **nativeID** 用于原生侧定位；id 优先。**testID** 用于端到端测试查找。

**onLayout** 在首次挂载及布局改变时返回尺寸和坐标。**onTextLayout** 更细：每个排版行都能读到宽、高、位置、基线相关测量值，适合按行截断/排版诊断。例：

    <Text
      onTextLayout={event => {
        const lineCount = event.nativeEvent.lines.length;
        setNeedsMoreButton(lineCount > 3);
      }}
    >
      {description}
    </Text>

每个 **TextLayout** 行的数值包括 **ascender**（基线上方高度）、**capHeight**（大写字母高度）、**descender**（基线下方高度）、**height**、**width**、组件内坐标 **x/y** 和 **xHeight**（基线到小写中部的高度）。事件对象的 **lines** 是行测量数组，**target** 是原生节点 id。

## 代码覆盖清单

已重写官方正文代码主题：Text 内联嵌套、Text 与 View 排版差异、Text 子节点约束、通过 Typography 包装实现应用默认字样、文本片段样式继承。参考区里所有无障碍/ARIA、字体缩放/换行/截断、点击与 responder 回调、选择、ID/style、布局回调和 TextLayout 数据结构均在表格或片段中覆盖。

**翻页：** [上一页：013 Switch](013-Switch.md) · [目录](README.md) · [下一页：015 TextInput](015-TextInput.md)
