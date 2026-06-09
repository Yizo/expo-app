const fs = require('fs');
const path = require('path');

const workspace = '/Users/yizuohua/Desktop/Test/expo-app';
const llmsPath = path.join(workspace, '.tmp-reactnative-llms.txt');
const outputPath = path.join(workspace, 'react-native-docs-cn.html');

const topSectionLabels = {
  docs: '文档',
  architecture: '架构',
  community: '社区',
  showcase: '案例展示',
  contributing: '贡献指南',
  versions: '版本',
  blog: 'Blog',
};

const groupNotes = {
  docs: '这是 `llms.txt` 中最核心的学习与查阅部分，包含入门、组件、API、调试、性能、原生开发与发布等页面。',
  architecture: '这一部分解释 React Native 内部实现与 New Architecture 相关背景，适合在已经会用之后继续深入。',
  community: '社区部分主要告诉你如何获得帮助、如何跟进动态，以及 React Native 社区入口在哪里。',
  showcase: '案例展示不是 API 参考，而是生态与应用案例入口，适合了解 React Native 的落地范围。',
  contributing: '贡献指南面向想参与 React Native 仓库、提 Issue、提 PR、跑测试和阅读源码的开发者。',
  versions: '版本页是版本目录入口，适合确认文档版本与历史版本分布。',
  blog: 'Blog 记录了重要版本发布、架构变化和官方策略更新。对理解“为什么现在推荐某种做法”非常有帮助。',
  legacy: '这是 `docs` 下的 Legacy Architecture 文档。适合维护旧库、旧原生桥接代码，或做迁移时参考。',
  'the-new-architecture': '这是 `docs` 下的 New Architecture 文档分组，覆盖 `Codegen`、`Turbo Native Modules`、`Fabric Native Components` 等主题。',
  releases: '这里是版本发布策略与版本政策入口，适合在升级前后对照阅读。',
};

const zhTitleMap = {
  'Introduction': '入门说明',
  'Get Started with React Native': '开始使用 React Native',
  'Set Up Your Environment': '设置开发环境',
  'Integration with Existing Apps': '集成到现有应用',
  'Integration with an Android Fragment': '集成到 Android Fragment',
  'Core Components and Native Components': '核心组件与原生组件',
  'React Fundamentals': 'React 基础',
  'Handling Text Input': '处理文本输入',
  'Using a ScrollView': '使用 ScrollView',
  'Using List Views': '使用列表视图',
  Troubleshooting: '常见问题排查',
  'Platform-Specific Code': '平台特定代码',
  'Out-of-Tree Platforms': '树外平台',
  'More Resources': '更多资源',
  Accessibility: '无障碍访问',
  AccessibilityInfo: '屏幕阅读器状态访问',
  ActionSheetIOS: 'iOS 操作面板',
  ActivityIndicator: '加载指示器',
  Alert: '弹窗提醒',
  Animated: '动画系统',
  Animations: '动画指南',
  Appearance: '外观偏好',
  AppRegistry: '应用注册',
  AppState: '应用状态',
  BackHandler: '返回键处理',
  Button: '基础按钮',
  'Color Reference': '颜色参考',
  'Core Components and APIs': '核心组件与 API',
  'Debugging Basics': '调试基础',
  Dimensions: '窗口尺寸',
  'Layout with Flexbox': '使用 Flexbox 布局',
  'Get Started Without a Framework': '不使用 Framework 的入门方式',
  'Handling Touches': '处理触摸交互',
  'Using Hermes': '使用 Hermes',
  Image: '图片组件',
  Images: '静态图片资源',
  'Improving User Experience': '改善用户体验',
  'JavaScript Environment': 'JavaScript 运行时',
  Keyboard: '键盘 API',
  KeyboardAvoidingView: '键盘避让视图',
  'LayoutAnimation': '布局动画',
  Linking: '深链接与外部链接',
  Metro: 'Metro 打包器',
  Modal: '模态层',
  'Native Platform': '原生平台扩展',
  'Navigating Between Screens': '跨屏导航',
  Networking: '网络请求',
  'Nodes from refs': '通过 ref 访问节点',
  'Optimizing FlatList Configuration': '优化 FlatList 配置',
  'Optimizing JavaScript loading': '优化 JavaScript 加载',
  PanResponder: '手势协调器',
  'Performance Overview': '性能概览',
  PermissionsAndroid: 'Android 权限',
  Platform: '平台判断',
  PlatformColor: '原生平台颜色',
  Pressable: '按压交互组件',
  Profiling: '性能剖析',
  Props: 'Props',
  'Publishing to Apple App Store': '发布到 Apple App Store',
  'React Native DevTools': 'React Native DevTools',
  RefreshControl: '下拉刷新',
  'Releases Overview': '版本发布概览',
  'Release Levels': '发布级别',
  RootTag: '根视图标识',
  'Running On Device': '真机运行',
  'Running On Simulator': '在模拟器运行',
  ScrollView: '滚动视图',
  SectionList: '分组列表',
  Security: '安全',
  Settings: 'iOS 设置存储',
  Share: '系统分享',
  'Publishing to Google Play Store': '发布到 Google Play Store',
  State: 'State',
  StatusBar: '状态栏',
  'Strict TypeScript API (opt in)': '严格 TypeScript API（可选开启）',
  Style: '样式',
  StyleSheet: '样式表',
  Switch: '开关',
  Testing: '测试',
  Text: '文本组件',
  TextInput: '文本输入组件',
  'Learn the Basics': '学习基础',
  'Using TypeScript': '使用 TypeScript',
  'Upgrading to new versions': '升级到新版本',
  useColorScheme: '系统主题 Hook',
  useWindowDimensions: '窗口尺寸 Hook',
  Vibration: '振动',
  View: '视图容器',
  VirtualizedList: '虚拟化列表基类',
  'About the New Architecture': '关于 New Architecture',
  Fabric: 'Fabric 渲染器',
  'Architecture Overview': '架构概览',
  'Render, Commit, and Mount': '渲染、提交与挂载',
  'Threading Model': '线程模型',
  'View Flattening': '视图扁平化',
  'Cross Platform Implementation': '跨平台实现',
  Communities: '社区入口',
  Overview: '概览',
  'Staying up to date': '保持更新',
  'Where to get help': '获取帮助',
  'Who is using React Native?': '谁在使用 React Native',
  'Contributing Overview': '贡献概览',
};

const curatedDetails = {
  '/docs/getting-started.md': {
    overview:
      '官方把这页定义为真正的起点。它说明文档如何阅读、读者需要具备哪些 JavaScript 基础、以及可以先用浏览器里的互动示例快速上手。',
    concepts: [
      '`React Native` 面向多种背景的开发者，不假设你一定有 Android、iOS 或 React 经验。',
      '官方建议把文档当作“按需查阅的参考书”或“线性阅读的教程”两种方式来使用。',
      '互动示例默认基于 Expo 的 Snack，适合先理解组件和语法，再决定是否配置本地环境。',
    ],
    scenarios: [
      '第一次接触 React Native，需要先知道文档该从哪里看起。',
      '团队新人入门，需要统一最小前置知识和阅读路径。',
    ],
    sample: {
      lang: 'text',
      code: '建议阅读顺序：Introduction -> Core Components and Native Components -> React Fundamentals -> Handling Text Input -> Using List Views',
    },
    notes: [
      '官方明确要求至少具备 JavaScript fundamentals。',
      '如果你已经熟悉 React，可以跳过 `React Fundamentals`，但仍需要掌握 React Native 的原生组件心智模型。',
    ],
    relations: [
      '它与 `environment-setup`、`set-up-your-environment` 相邻，但职责不同：本页讲“如何阅读与入门”，后两页讲“如何搭环境与创建项目”。',
    ],
  },
  '/docs/environment-setup.md': {
    overview:
      '这页说明“今天应该怎样开始一个 React Native 项目”。官方在近年的指导里把“使用 Framework”作为默认推荐，同时保留“不使用 Framework”的入口。',
    concepts: [
      '如果没有特殊约束，官方更推荐使用 Framework 方案来开始新项目。',
      '如果你需要完全自己掌控原生工程、CLI、构建细节，可以继续看 `getting-started-without-a-framework`。',
    ],
    scenarios: [
      '从零创建新应用，需要判断是走 Framework 还是裸 React Native 路线。',
      '团队要统一新项目模板时，需要明确官方当前推荐。',
    ],
    notes: [
      '这页与当前生态趋势高度相关，遇到创建项目问题时应同时确认你所用 Framework 的官方文档。',
      '在 Expo 项目里，具体操作还应以对应 SDK 文档为准。',
    ],
    relations: [
      '与 `set-up-your-environment` 的关系是：先决定路线，再进入具体环境配置。',
    ],
  },
  '/docs/getting-started-without-a-framework.md': {
    overview:
      '这页是官方给“不使用 Framework”场景保留的入口。它适合对原生工程、打包、模板、依赖版本有更强控制需求的团队。',
    concepts: [
      '`without a Framework` 并不是更“高级”，而是更底层、更需要自行承担配置与维护成本。',
      '一旦走这条路线，就要自己处理更多 Android、iOS、CLI、升级和依赖兼容细节。',
    ],
    scenarios: [
      '公司已有自己的工程模板或平台约束。',
      '需要把 React Native 深度嵌入现有原生应用。',
    ],
    notes: [
      '如果你的目标只是高效开发业务应用，官方通常更建议优先考虑 Framework。',
      '涉及原生目录时，升级成本与构建调试成本会更高。',
    ],
    relations: [
      '与 `integration-with-existing-apps`、`native-platform`、`upgrading` 联系非常紧密。',
    ],
  },
  '/docs/tutorial.md': {
    overview:
      '这是一份围绕 `Hello World`、`components`、`props`、`state` 展开的基础教程。它帮助你建立“React Native 像 React，但用的是原生组件”这一核心认知。',
    concepts: [
      '`View` 是容器，`Text` 负责渲染文本，UI 是由组件组合出来的。',
      '`props` 用于从父组件传入配置，`state` 用于表示会变化的数据。',
      '`JSX` 在 React Native 中描述的是原生组件树，而不是 DOM。',
    ],
    scenarios: [
      '想快速建立组件、Props、State 的最小心智模型。',
      '要把 Web React 经验迁移到移动端时，先确认相同点和不同点。',
    ],
    sample: {
      lang: 'tsx',
      code: "import {Text, View} from 'react-native';\n\nexport default function HelloWorldApp() {\n  return (\n    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>\n      <Text>Hello world!</Text>\n    </View>\n  );\n}",
    },
    notes: [
      '教程层面的代码偏简单，真实项目通常需要拆分组件、状态管理与导航。',
      '其中 `flex: 1`、`justifyContent`、`alignItems` 直接关联 `flexbox` 页面。',
    ],
    relations: [
      '后续应继续阅读 `intro-react-native-components`、`style`、`flexbox`、`handling-touches`。',
    ],
  },
  '/docs/components-and-apis.md': {
    overview:
      '这是官方的总览页，用来告诉你核心组件和 API 有哪些、如何按类别进入。它本身不是单个 API 的完整参考，而是检索入口。',
    concepts: [
      '官方把常用内容分为 `Basic Components`、`User Interface`、`List Views`、`Android-specific`、`iOS-specific` 和 `Others`。',
      '学习时优先掌握 `View`、`Text`、`Image`、`TextInput`、`Pressable`、`ScrollView`、`FlatList`、`StyleSheet`。',
    ],
    scenarios: [
      '不知道某个能力属于组件、API、平台组件还是列表组件。',
      '要从总览跳到具体组件文档。',
    ],
    notes: [
      '官方明确指出：如果内置能力不够，可以去 `Using Libraries` 或 `reactnative.directory` 找社区库。',
      '`SafeAreaView` 等个别内置组件已经不再是官方优先推荐方案。',
    ],
    relations: [
      '这页与 `intro-react-native-components` 共同构成 UI 查阅入口；前者偏概览，后者偏入门解释。',
    ],
  },
  '/docs/style.md': {
    overview:
      '这页解释 React Native 如何用 JavaScript 写样式。核心结论是：样式写在 `style` prop 中，命名多采用 camelCase，和 CSS 相似但并不完全相同。',
    concepts: [
      '`style` 可以是普通对象，也可以是数组；数组中后面的样式优先级更高。',
      '随着组件复杂度上升，官方建议使用 `StyleSheet.create` 统一管理样式。',
      '可以把组件对外暴露的 `style` 继续传给内部子元素，形成类似 CSS“级联”的复用模式。',
    ],
    scenarios: [
      '刚从 Web 迁移，需要知道哪些 CSS 习惯可以沿用、哪些不能。',
      '要给可复用组件设计可覆盖样式接口。',
    ],
    sample: {
      lang: 'tsx',
      code: "const styles = StyleSheet.create({\n  container: {padding: 16},\n  title: {fontSize: 20, fontWeight: '600'},\n});\n\n<Text style={[styles.title, props.style]}>Hello</Text>",
    },
    notes: [
      '官方特别提醒：React Native 与 Web CSS 存在差异，例如触摸区域不会超出父视图边界，Android 不支持 negative margin 的一些场景。',
      '布局和尺寸应继续配合 `height-and-width`、`flexbox`、`layout-props` 阅读。',
    ],
    relations: [
      '这是 `colors`、`image-style-props`、`text-style-props`、`view-style-props` 的上游基础页。',
    ],
  },
  '/docs/flexbox.md': {
    overview:
      '这是 React Native 布局最重要的页面之一。官方强调你通常会组合 `flexDirection`、`alignItems`、`justifyContent` 来完成大多数布局。',
    concepts: [
      'React Native 的 `Flexbox` 与 Web 类似，但默认值不同：`flexDirection` 默认是 `column`，`flexShrink` 默认是 `0`。',
      '`flex` 决定主轴空间分配；`justifyContent` 控制主轴对齐；`alignItems` 控制交叉轴对齐。',
      '`Layout direction` 还会影响 `start` / `end` 与 RTL 语言布局。',
    ],
    scenarios: [
      '做页面结构布局、卡片栅格、纵向/横向排列。',
      '处理 RTL、空间分布与居中问题。',
    ],
    sample: {
      lang: 'tsx',
      code: "const styles = StyleSheet.create({\n  row: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n  },\n});",
    },
    notes: [
      '如果你沿用 Web 默认 `row` 的直觉，很容易在 React Native 里把布局方向想反。',
      '复杂布局应同时参考 `layout-props` 和 Yoga 相关说明。',
    ],
    relations: [
      '它与 `height-and-width`、`style`、`layout-props` 一起构成布局基础。',
    ],
  },
  '/docs/navigation.md': {
    overview:
      '官方并没有把导航放进 `react-native` 核心包，而是明确建议大多数项目使用社区方案 `React Navigation`。如果你的应用原本由原生层负责导航，也可以使用原生导航型库。',
    concepts: [
      '`React Navigation` 是默认推荐的跨平台导航方案，适合大多数新项目。',
      '如果应用已存在原生导航系统，或者对原生导航栈有更强控制需求，可考虑 `react-native-navigation`。',
      '`createNativeStackNavigator` 会使用 iOS `UINavigationController` 和 Android `Fragment` 的原生能力。',
    ],
    scenarios: [
      '新项目需要快速建立 Stack、Tab、Drawer 导航。',
      '已有原生 App 中嵌入 React Native 页面，导航仍由原生管理。',
    ],
    sample: {
      lang: 'tsx',
      code: "import {createStaticNavigation} from '@react-navigation/native';\nimport {createNativeStackNavigator} from '@react-navigation/native-stack';\n\nconst RootStack = createNativeStackNavigator({\n  screens: {\n    Home: {screen: HomeScreen, options: {title: 'Welcome'}},\n    Profile: {screen: ProfileScreen},\n  },\n});\n\nconst Navigation = createStaticNavigation(RootStack);\nexport default function App() {\n  return <Navigation />;\n}",
    },
    notes: [
      'Expo managed 项目与 bare React Native 项目安装 peer dependencies 的命令不同，官方文档中分别给出 `npx expo install` 与 `npm install`。',
      'iOS bare 项目通常还要执行 `pod install`。',
    ],
    relations: [
      '导航页与 `linking`、`backhandler`、`running-on-device` 和性能页中的 native-stack 表现讨论有关。',
    ],
  },
  '/docs/network.md': {
    overview:
      '官方把网络请求的首选入口放在标准 `Fetch API`。同时说明 `XMLHttpRequest` 也可用，因此依赖它的第三方库例如 `axios` 也能工作。',
    concepts: [
      '`fetch` 返回 `Promise`，可以配合 `.then()` 或 `async/await` 使用。',
      '移动端网络请求除了业务逻辑，还必须关注平台安全策略，例如 iOS `ATS` 和 Android 明文流量限制。',
      '如果只是换一个请求库，本质仍然依赖 React Native 提供的底层网络能力。',
    ],
    scenarios: [
      '调用 REST API、拉取 JSON、上传表单、接第三方 SDK 接口。',
      '排查为什么某些 `http` 接口在真机上请求失败。',
    ],
    sample: {
      lang: 'tsx',
      code: "const getMoviesFromApiAsync = async () => {\n  try {\n    const response = await fetch('https://reactnative.dev/movies.json');\n    const json = await response.json();\n    return json.movies;\n  } catch (error) {\n    console.error(error);\n  }\n};",
    },
    notes: [
      'iOS 9+ 默认要求 HTTPS；如果要访问 `http`，必须正确配置 `ATS`。',
      'Android API 28+ 默认也会阻止 clear text traffic，需要明确配置。',
      '不要遗漏 `catch`，否则错误可能被静默丢弃。',
    ],
    relations: [
      '与 `security`、`debugging`、`react-native-devtools` 中的 Network 面板紧密相关。',
    ],
  },
  '/docs/debugging.md': {
    overview:
      '这是开发期调试总入口。官方强调：`Dev Menu`、`LogBox`、`React Native DevTools` 都只在开发构建中可用，release build 默认关闭。',
    concepts: [
      '`Dev Menu` 是调试功能入口；可以通过摇一摇、模拟器快捷键或 `adb shell input keyevent 82` 打开。',
      '`React Native DevTools` 是现代官方调试前端；`LogBox` 则负责应用内错误/警告展示。',
      '`Perf Monitor` 是开发期参考工具，精确性能问题仍建议使用 Android Studio 和 Xcode 原生工具。',
    ],
    scenarios: [
      '查看日志、打开 DevTools、处理红屏与黄屏、暂时忽略噪声警告。',
      '在性能或交互问题出现时先做开发期定位。',
    ],
    sample: {
      lang: 'tsx',
      code: "import {LogBox} from 'react-native';\n\nLogBox.ignoreLogs([\n  'Warning: componentWillReceiveProps has been renamed',\n  /GraphQL error: .*/,\n]);",
    },
    notes: [
      '官方建议把 DevTools Console 当作更可靠的日志真相来源。',
      '`ignoreAllLogs()` 适合 Demo，不适合长期开发。',
    ],
    relations: [
      '它的下一步通常是进入 `react-native-devtools`、`debugging-native-code`、`debugging-release-builds`。',
    ],
  },
  '/docs/react-native-devtools.md': {
    overview:
      '这是 React Native 0.76 之后的现代官方调试体验。官方明确说明它基于 Chrome DevTools 前端，但不是简单地“在 Chrome 里调 RN”。',
    concepts: [
      'React Native DevTools 只支持运行在 `Hermes` 上的 React Native 应用。',
      '它取代了此前的 Flipper、Experimental Debugger、Hermes debugger (Chrome) 前端。',
      '它适合调 React/JavaScript 层问题，不替代 Android Studio、Xcode 对原生层的调试。',
    ],
    scenarios: [
      '下断点、查看源代码、观察网络请求、录制 JS 性能时间线。',
      '需要统一团队调试工具链时，优先选择官方支持方案。',
    ],
    notes: [
      '官方明确写明 `chrome://inspect` 不再受支持。',
      '`Network` 与 `Performance` 面板在较新版本中才逐步完善，查问题时注意版本条件。',
    ],
    relations: [
      '它是 `debugging` 页里“Open DevTools”的具体展开页，也和 `performance`、`network`、`profiling` 有交叉。',
    ],
  },
  '/docs/performance.md': {
    overview:
      '官方把性能问题分成 `JS thread` 与 `UI thread` 两条主线来理解，这是阅读 React Native 性能文档时最重要的框架。',
    concepts: [
      '移动端通常以 60 FPS 为基线，每帧大约只有 `16.67ms` 预算。',
      '`JS frame rate` 反映 JavaScript 线程是否繁忙；`UI frame rate` 反映主线程上的动画和绘制是否流畅。',
      '很多“卡顿”并不是同一种卡顿：列表渲染、导航动画、图片缩放、日志过多都会造成不同类型的掉帧。',
    ],
    scenarios: [
      '动画卡顿、长列表滚动掉帧、按钮按下反馈不灵敏。',
      '需要在性能优化前建立统一的排查语言。',
    ],
    sample: {
      lang: 'json',
      code: '{\n  "env": {\n    "production": {\n      "plugins": ["transform-remove-console"]\n    }\n  }\n}',
    },
    notes: [
      '官方反复提醒：不要只在 `dev=true` 模式下判断性能。',
      '`console.log` 会显著拖慢 JS 线程，发布前应清理。',
      '涉及动画时，要理解 `Animated`、`useNativeDriver`、`LayoutAnimation` 的差异。',
    ],
    relations: [
      '继续深挖时，应顺着官方结构阅读 `build-speed`、`optimizing-flatlist-configuration`、`optimizing-javascript-loading`、`profiling`。',
    ],
  },
  '/docs/accessibility.md': {
    overview:
      '这是 React Native 官方无障碍访问总览页。它不仅讲常见的 `accessible`、`accessibilityLabel`，还覆盖焦点顺序、Accessibility Actions、TalkBack/VoiceOver 测试方法等。',
    concepts: [
      '无障碍访问不是单个属性，而是一组语义、焦点、朗读、状态与动作约定。',
      'Android 和 iOS 在部分属性上并不完全相同，文档会明确标注平台差异。',
      '`Accessibility Actions` 允许辅助技术主动触发组件动作，是复杂交互控件的重要能力。',
    ],
    scenarios: [
      '需要让按钮、输入框、自定义组件被屏幕阅读器正确识别。',
      '需要控制重叠视图的无障碍焦点，或自定义朗读顺序。',
    ],
    notes: [
      '官方提供了 TalkBack 与 VoiceOver 的实际测试方法；无障碍访问不能只靠代码猜测。',
      '对于动态更新的内容，尤其要关注 `accessibilityLiveRegion` 等属性。',
    ],
    relations: [
      '它和 `accessibilityinfo`、`textinput`、`pressable`、`view`、`testing-overview` 中“以用户视角测试组件”有关。',
    ],
  },
  '/docs/typescript.md': {
    overview:
      '官方明确说明：新的 React Native 项目默认以 TypeScript 为目标，但仍支持 JavaScript 和 Flow。Bundling 时由 Babel 转换，`tsc` 更适合作为类型检查工具。',
    concepts: [
      '给已有项目加 TypeScript 的核心步骤是：安装依赖、创建 `tsconfig.json`、把文件改成 `*.ts`/`*.tsx`、运行 `tsc`。',
      '`./index.js` 入口文件官方建议保留原样，以免影响生产构建打包。',
      '如果要用自定义路径别名，需要同时配置 TypeScript 与 Babel。',
    ],
    scenarios: [
      '新项目默认走 TS，需要理解默认工具链。',
      '老项目从 JS 逐步迁移到 TS，需要确认最小改造步骤。',
    ],
    sample: {
      lang: 'json',
      code: '{\n  "extends": "@react-native/typescript-config"\n}',
    },
    notes: [
      '文档中列出的依赖版本只是“最新版本”示意，真实项目要与当前 React Native 版本对齐。',
      '官方建议用 Upgrade Helper 对照版本差异。',
    ],
    relations: [
      '它与 `strict-typescript-api`、`upgrading`、`metro`、`javascript-environment` 有直接联系。',
    ],
  },
  '/docs/testing-overview.md': {
    overview:
      '官方测试指南按“为什么测试 -> 静态分析 -> 可测试代码 -> 单元测试 -> 集成测试 -> 组件测试 -> E2E”这一脉络展开。重点是让你从用户视角去验证行为，而不是只盯实现细节。',
    concepts: [
      'React Native 默认模板就带有 `ESLint` 与 `TypeScript` 这两类静态分析能力。',
      'Jest 是官方默认测试框架，适合做单元与组件级测试。',
      '组件测试时，官方更推荐用用户能看到/听到的内容断言，而不是直接查 props、state 或滥用 `testID`。',
    ],
    scenarios: [
      '为新项目建立最小测试策略。',
      '重构旧组件时，希望减少回归风险。',
    ],
    sample: {
      lang: 'js',
      code: "it('given a date in the past, colorForDueDate() returns red', () => {\n  expect(colorForDueDate('2000-10-20')).toBe('red');\n});",
    },
    notes: [
      '组件测试运行在 Node.js，不会覆盖原生层 bug；所以不能把它当成 100% 真实用户保证。',
      '测试描述推荐遵循 `Given / When / Then` 或 `AAA`。',
    ],
    relations: [
      '与 `debugging`、`accessibility`、`native-platform` 和发布前质量控制流程都有关。',
    ],
  },
  '/docs/upgrading.md': {
    overview:
      '官方把升级拆成 Expo 项目与普通 React Native 项目两条路径。Expo 路线强调按 SDK 逐个升级；裸 React Native 路线强调对照 `Upgrade Helper`。',
    concepts: [
      'Expo 项目升级时，`react-native`、`react`、`expo` 版本需要一起协调。',
      '裸 React Native 项目除了升级 `package.json`，还要手工比对 Android/iOS 工程生成文件差异。',
      '`Upgrade Helper` 是官方推荐的版本差异对照工具。',
    ],
    scenarios: [
      '项目要从旧版本升到新版本。',
      '团队需要评估一次升级影响范围与改动方式。',
    ],
    notes: [
      '升级是高风险操作，建议一次只跨一个可控版本区间。',
      'Expo 项目请同时确认对应 Expo SDK 升级文档。',
    ],
    relations: [
      '与 `releases`、`versioning-policy`、`typescript`、`metro`、`native-platform` 联系紧密。',
    ],
  },
  '/docs/native-platform.md': {
    overview:
      '这页是原生扩展总入口。官方把原生扩展分成两大类：`Native Modules`（无 UI 的原生能力）和 `Native Components`（把原生视图暴露给 JS）。',
    concepts: [
      '如果需求在 `react-native` 与社区库中都找不到，就要考虑自己写原生扩展。',
      '官方当前推荐的现代方案是 `Turbo Native Modules` 与 `Fabric Native Components`。',
      '旧的 Legacy Native Modules / Components 仍可能通过互操作层继续工作，但不再是首选。',
    ],
    scenarios: [
      '要接系统能力、硬件能力、已有原生 SDK 或高性能算法。',
      '要把已有的 Android/iOS 视图控件包装成 React 组件。',
    ],
    notes: [
      '这部分明显更偏原生工程，适合已经熟悉普通 React Native 开发之后再深入。',
      '如果只是业务功能缺失，先确认是否已有成熟社区库，避免过早自建原生桥接。',
    ],
    relations: [
      '与 `the-new-architecture/*`、`fabric-native-components-*`、`turbo-native-modules-*`、`using-codegen` 成体系阅读效果最好。',
    ],
  },
  '/architecture/landing-page.md': {
    overview:
      '这是官方解释 New Architecture 背景与价值的总览页。它的核心任务不是教 API，而是回答“为什么 React Native 要重构底层架构”。',
    concepts: [
      'New Architecture 旨在提升平台互操作性、同步布局能力、并发渲染支持以及整体一致性。',
      '官方举例说明：同步测量与 `useLayoutEffect` 可以避免某些 tooltip / layout 场景的视觉跳动。',
      '这套架构也是 React 18 并发能力在 React Native 中落地的基础。',
    ],
    scenarios: [
      '理解新版 React Native 的内部方向与设计取舍。',
      '判断一个原生库是否需要迁移到 New Architecture。',
    ],
    notes: [
      '这是“概念总览页”，具体实现仍要继续看 `Fabric`、`render-pipeline`、`threading-model` 等页面。',
      '业务开发者不需要先学完架构页再写应用，但升级和原生扩展开发时会很有帮助。',
    ],
    relations: [
      '与 `native-platform`、`fabric-renderer`、`overview`、`the-new-architecture/*` 组成一套完整的进阶阅读链路。',
    ],
  },
  '/docs/running-on-device.md': {
    overview:
      '这页专门讲如何在真机上运行应用。官方同时覆盖 Android 与 iOS，并区分 USB、`adb reverse`、Wi-Fi 等开发联调方式。',
    concepts: [
      '真机验证是发布前必须做的步骤，不能只停留在模拟器。',
      'Android 侧最常见的联调路径是：开启 USB debugging -> `adb devices` -> `npm run android` -> `adb reverse tcp:8081 tcp:8081`。',
      '如果你用 `create-expo-app` 创建项目，真机运行路径会和 Expo 文档关联起来。',
    ],
    scenarios: [
      '在物理设备上验证摄像头、推送、性能或系统权限相关行为。',
      '模拟器正常、真机异常时的联调排查。',
    ],
    sample: {
      lang: 'bash',
      code: 'adb devices\nadb -s <device name> reverse tcp:8081 tcp:8081\nnpm run android',
    },
    notes: [
      'Android 真机联调非常依赖 `adb` 状态；看到 `unauthorized` 时要先处理授权。',
      'Wi-Fi 联调要保证手机和电脑在同一网络下，并正确填写 `Debug server host & port for device`。',
    ],
    relations: [
      '与 `fast-refresh`、`debugging`、`signed-apk-android`、`publishing-to-app-store` 一起构成从开发到发布的链路。',
    ],
  },
  '/docs/releases.md': {
    overview:
      '这页解释 React Native 的发布节奏。官方说明通常每两个月发布一个 minor 版本，大约每年六个 minor。',
    concepts: [
      '理解发布节奏有助于安排升级窗口和依赖兼容性验证。',
      '`Release Levels` 和 `Versioning Policy` 是升级策略的配套页面。',
    ],
    scenarios: [
      '准备长期维护项目，需要安排升级和验证节奏。',
      '遇到新特性是否可用、是否稳定的问题时，用来定位版本语义。',
    ],
    notes: [
      '版本信息具有时间敏感性，具体版本状态应以官方当前页面为准。',
    ],
    relations: [
      '与 `upgrading`、`versioning-policy`、Blog 中的版本发布文章形成互补。',
    ],
  },
};

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseLlms(text) {
  const lines = text.split(/\r?\n/);
  const root = {
    type: 'root',
    title: 'React Native · Learn once, write anywhere',
    links: [],
    children: [],
  };
  const stack = [root];
  let currentNode = root;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].trim();
      const node = {
        type: 'heading',
        level,
        title,
        slug: title,
        descriptionLines: [],
        links: [],
        children: [],
      };
      while (stack.length > level - 1) {
        stack.pop();
      }
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      currentNode = node;
      continue;
    }

    const link = line.match(/^- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/);
    if (link) {
      currentNode.links.push({
        title: link[1].trim(),
        url: link[2].trim(),
        description: (link[3] || '').trim(),
      });
      continue;
    }

    if (!line || line.startsWith('> ') || line.startsWith('# ')) {
      continue;
    }

    if (currentNode && currentNode.type === 'heading') {
      currentNode.descriptionLines.push(line.trim());
    }
  }

  const clean = node => {
    if (node.descriptionLines) {
      node.description = node.descriptionLines.join(' ').replace(/\s+/g, ' ').trim();
      delete node.descriptionLines;
    }
    node.children.forEach(clean);
  };
  clean(root);
  return root;
}

function enrichNode(node, lineage = []) {
  if (node.type === 'root') {
    node.children = node.children.map(child => enrichNode(child, lineage));
    return node;
  }

  const pathParts = [...lineage, node.title];
  node.id = slugify(pathParts.join('-'));
  node.label = topSectionLabels[node.title] || groupNotes[node.title] ? topSectionLabels[node.title] || node.title : node.title;
  const primaryLink = node.links[0] || null;
  node.primaryLink = primaryLink;
  node.kind = primaryLink ? 'page' : 'group';
  node.children = node.children.map(child => enrichNode(child, [...lineage, node.title]));
  return node;
}

function sectionStats(root) {
  const rows = [];
  for (const child of root.children) {
    let pageCount = 0;
    let groupCount = 0;
    const visit = node => {
      if (node.kind === 'page') pageCount += 1;
      if (node.kind === 'group') groupCount += 1;
      node.children.forEach(visit);
    };
    visit(child);
    rows.push({
      title: child.title,
      zhTitle: topSectionLabels[child.title] || child.title,
      pageCount,
      groupCount,
    });
  }
  return rows;
}

function getDisplayTitle(node) {
  if (node.primaryLink) {
    return node.primaryLink.title;
  }
  return node.title;
}

function getZhTitle(node) {
  const displayTitle = getDisplayTitle(node);
  return zhTitleMap[displayTitle] || zhTitleMap[node.title] || displayTitle;
}

function getOfficialUrl(node) {
  return node.primaryLink ? `https://reactnative.dev${node.primaryLink.url.replace(/\.md$/, '')}` : null;
}

function getSourceDescription(node) {
  if (node.primaryLink && node.primaryLink.description) return node.primaryLink.description;
  return node.description || '';
}

function detectBadges(node) {
  const badges = [];
  const source = `${getDisplayTitle(node)} ${getSourceDescription(node)} ${node.title}`.toLowerCase();
  if (source.includes('❌') || source.includes('use one of the community packages instead')) {
    badges.push({ label: '已弃用/改用社区包', className: 'warn' });
  }
  if (source.includes('🗑️') || source.includes('deprecated')) {
    badges.push({ label: '已弃用', className: 'warn' });
  }
  if (source.includes('🚧') || source.includes('work in progress')) {
    badges.push({ label: '文档未完成', className: 'muted' });
  }
  if (source.includes('🧪')) {
    badges.push({ label: '实验性', className: 'accent' });
  }
  if (node.primaryLink && node.primaryLink.url.includes('/legacy/')) {
    badges.push({ label: 'Legacy', className: 'muted' });
  }
  if (node.primaryLink && node.primaryLink.url.includes('/the-new-architecture/')) {
    badges.push({ label: 'New Architecture', className: 'accent' });
  }
  if (getSourceDescription(node).includes('Project with Native Code Required')) {
    badges.push({ label: '需要原生工程', className: 'warn' });
  }
  return badges;
}

function autoOverview(node) {
  const desc = getSourceDescription(node);
  const title = getDisplayTitle(node);
  const url = node.primaryLink ? node.primaryLink.url : '';

  if (url.includes('/docs/global-')) {
    return '这是 React Native 运行时暴露的全局接口页面。许多条目更接近 Web / Node 风格 API，而不是典型的 React Native 组件文档；查阅时应同时确认 Hermes 与平台支持情况。';
  }
  if (url.includes('/docs/legacy/')) {
    return '这是 Legacy Architecture 时代的说明页，主要服务于维护旧桥接代码、旧原生组件或做迁移对照。若你在开发新能力，应优先评估 New Architecture 对应页面。';
  }
  if (url.includes('/docs/the-new-architecture/')) {
    return '这是 New Architecture 专题页面，适合在需要 `Codegen`、`Turbo Native Modules` 或 `Fabric Native Components` 时按官方步骤展开阅读。';
  }
  if (/Use one of the community packages instead\./.test(desc)) {
    return '官方已不再把这项能力作为当前推荐的内置方案，建议优先选择维护活跃的社区包，并回到官方页面确认推荐语义没有变化。';
  }
  if (/work in progress/i.test(desc)) {
    return '官方明确说明该页仍在建设中。离线文档保留入口与定位说明，但具体 API 细节需要参考官方原文以及页面中提到的 MDN / Web 规范。';
  }
  if (/Examples?$/.test(desc) || /Object Type/.test(title) || /Props/.test(title)) {
    return '这是偏参考性质的页面，通常用于说明样式字段、对象结构、事件对象或某类 Props 的含义。实际使用时，应与对应组件或 API 主页面配套阅读。';
  }
  if (/A React component|Component/.test(desc)) {
    return '这是组件页，重点通常是组件的用途、常见 Props、平台差异和适用场景。学习时可以先掌握它的角色，再回到官方原文查看完整属性表。';
  }
  if (/API/.test(title) || /module/i.test(desc) || /provides/i.test(desc)) {
    return '这是 API 或模块页，适合在你已经明确需求后查方法、事件、平台限制和示例用法。';
  }
  if (/guide|learn|overview|introduction/i.test(title + ' ' + desc)) {
    return '这是指南型页面，适合在配置、排错、迁移或理解整体概念时顺着官方步骤阅读。';
  }
  return '这是官方索引中的页面入口。本离线文档先给出定位与阅读建议；如果你需要完整 API 列表、平台矩阵或更长示例，应继续打开官方原文。';
}

function autoConcepts(node) {
  const desc = getSourceDescription(node);
  const url = node.primaryLink ? node.primaryLink.url : '';
  const concepts = [];

  if (url.includes('/docs/global-')) {
    concepts.push('重点确认这个全局接口是否只是“可用”，还是已经有完整的 React Native 文档说明。');
    concepts.push('如果官方页面写明参考 MDN，那么语义解释应以 Web 规范为主。');
  } else if (url.includes('/docs/legacy/')) {
    concepts.push('这类页面通常服务于旧架构维护或迁移，而不是新项目的首选方案。');
    concepts.push('阅读时建议同步查看 New Architecture 的对应能力。');
  } else if (url.includes('/docs/the-new-architecture/')) {
    concepts.push('这类页面通常围绕 Codegen、类型声明、原生桥接生成代码和平台实现步骤展开。');
    concepts.push('它们通常要求你具备 Android / iOS 原生工程背景。');
  } else if (/Use one of the community packages instead\./.test(desc)) {
    concepts.push('官方保留此页主要是为了迁移和兼容性提示，不代表应继续优先使用内置方案。');
  } else if (/Project with Native Code Required/.test(desc)) {
    concepts.push('这页默认面向含原生目录的项目。');
    concepts.push('如果你使用的是 Framework 管理的工作流，应先确认该能力是否被框架封装或限制。');
  } else if (/Examples?$/.test(desc) || /Object Type/.test(getDisplayTitle(node))) {
    concepts.push('把它当成“字段字典”或“对象结构参考”来看最合适。');
  } else {
    concepts.push('先理解它在官方结构中的位置，再决定是快速查用法还是深入看完整参考。');
  }

  if (desc) {
    concepts.push(`索引信号：${desc}`);
  }
  return concepts;
}

function autoScenarios(node) {
  const url = node.primaryLink ? node.primaryLink.url : '';
  if (url.includes('/docs/global-')) {
    return ['需要确认某个浏览器风格全局对象在 React Native 运行时是否可用时。'];
  }
  if (url.includes('/docs/legacy/')) {
    return ['维护历史项目、老库互操作、或做旧架构到新架构迁移时。'];
  }
  if (url.includes('/docs/the-new-architecture/')) {
    return ['自定义原生模块、原生组件，或为库适配 New Architecture 时。'];
  }
  if (/Use one of the community packages instead\./.test(getSourceDescription(node))) {
    return ['排查旧代码仍在使用该能力，准备替换为社区包时。'];
  }
  return ['当你已经知道要找哪个组件 / API，但还不确定它的角色、限制和后续阅读方向时。'];
}

function autoNotes(node) {
  const desc = getSourceDescription(node);
  const notes = [];
  if (/Use one of the community packages instead\./.test(desc)) {
    notes.push('迁移前先确认社区替代包的维护状态、平台支持与 New Architecture 兼容性。');
  }
  if (/work in progress/i.test(desc)) {
    notes.push('官方文档尚未完全展开，本离线文档不应替代原文。');
  }
  if (/Project with Native Code Required/.test(desc)) {
    notes.push('如果你的项目没有原生目录或未暴露原生工程，这页内容可能暂时无法直接落地。');
  }
  if (node.primaryLink && node.primaryLink.url.includes('/blog/')) {
    notes.push('Blog 更适合用来理解背景与版本变化，不应替代正式 API 文档。');
  }
  if (!notes.length) {
    notes.push('需要参数表、平台支持矩阵或完整示例时，请回到官方原文确认。');
  }
  return notes;
}

function autoRelations(node) {
  const url = node.primaryLink ? node.primaryLink.url : '';
  if (url.includes('/docs/global-')) {
    return ['常与 `javascript-environment`、`hermes` 和具体业务 API 页面一起查阅。'];
  }
  if (url.includes('/docs/the-new-architecture/')) {
    return ['建议与 `native-platform`、`architecture/landing-page`、`fabric-renderer` 联合阅读。'];
  }
  if (url.includes('/docs/legacy/')) {
    return ['建议同时查找是否存在对应的 New Architecture 文档或社区迁移方案。'];
  }
  return ['它在官方结构中的上下游页面，通常就是最好的继续阅读入口。'];
}

function renderBadge(badge) {
  return `<span class="badge ${badge.className}">${escapeHtml(badge.label)}</span>`;
}

function renderSample(sample) {
  if (!sample) return '';
  return `<div class="detail-block"><h5>示例代码或命令</h5><pre><code class="language-${escapeHtml(
    sample.lang || 'text',
  )}">${escapeHtml(sample.code)}</code></pre></div>`;
}

function renderList(title, items) {
  if (!items || !items.length) return '';
  return `<div class="detail-block"><h5>${escapeHtml(title)}</h5><ul>${items
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul></div>`;
}

function renderPage(node) {
  const officialUrl = getOfficialUrl(node);
  const title = getDisplayTitle(node);
  const zhTitle = getZhTitle(node);
  const details =
    (node.primaryLink && curatedDetails[node.primaryLink.url]) || null;
  const badges = detectBadges(node);
  const sourceDesc = getSourceDescription(node);
  const overview = details ? details.overview : autoOverview(node);
  const concepts = details ? details.concepts : autoConcepts(node);
  const scenarios = details ? details.scenarios : autoScenarios(node);
  const notes = details ? details.notes : autoNotes(node);
  const relations = details ? details.relations : autoRelations(node);
  const sourceNote = sourceDesc
    ? `<details class="source-note"><summary>查看索引原文说明</summary><p>${escapeHtml(
        sourceDesc,
      )}</p></details>`
    : '<p class="muted-text">未展开，需要参考官方原文确认。</p>';

  return `
    <article class="page-card" id="${escapeHtml(node.id)}">
      <header class="page-card-header">
        <div>
          <h4>${escapeHtml(zhTitle)}</h4>
          <p class="en-title">${escapeHtml(title)}</p>
        </div>
        <div class="badges">${badges.map(renderBadge).join('')}</div>
      </header>
      ${
        officialUrl
          ? `<p class="official-link">官方文档：<a href="${escapeHtml(
              officialUrl,
            )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              officialUrl,
            )}</a></p>`
          : ''
      }
      <div class="detail-block">
        <h5>内容概述</h5>
        <p>${escapeHtml(overview)}</p>
      </div>
      ${renderList('核心概念', concepts)}
      ${renderList('使用场景', scenarios)}
      ${renderSample(details ? details.sample : null)}
      ${renderList('注意事项', notes)}
      ${renderList('与其他章节的关系', relations)}
      ${sourceNote}
    </article>
  `;
}

function renderGroup(node, depth = 0) {
  const title = getDisplayTitle(node);
  const zhTitle = getZhTitle(node);
  const note = groupNotes[node.title] || groupNotes[title] || autoOverview(node);
  const officialUrl = getOfficialUrl(node);
  const childPages = node.children.filter(child => child.kind === 'page');
  const childGroups = node.children.filter(child => child.kind === 'group');
  const headingTag = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';

  return `
    <section class="group-section" id="${escapeHtml(node.id)}">
      <${headingTag}>${escapeHtml(zhTitle)} <span class="muted-heading">${escapeHtml(
    title,
  )}</span></${headingTag}>
      <p class="group-note">${escapeHtml(note)}</p>
      ${
        officialUrl
          ? `<p class="official-link">官方文档：<a href="${escapeHtml(
              officialUrl,
            )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              officialUrl,
            )}</a></p>`
          : ''
      }
      ${
        node.description
          ? `<p class="group-description">${escapeHtml(node.description)}</p>`
          : ''
      }
      ${childPages.length ? `<div class="page-grid">${childPages.map(renderPage).join('')}</div>` : ''}
      ${childGroups.map(child => renderGroup(child, depth + 1)).join('')}
    </section>
  `;
}

function renderNav(node, depth = 0) {
  const title = getDisplayTitle(node);
  const zhTitle = getZhTitle(node);
  const itemLabel = depth === 0 ? `${zhTitle}` : zhTitle;
  const children = node.children || [];
  return `
    <li>
      <a href="#${escapeHtml(node.id)}">${escapeHtml(itemLabel)}</a>
      ${
        children.length
          ? `<ul>${children.map(child => renderNav(child, depth + 1)).join('')}</ul>`
          : ''
      }
    </li>
  `;
}

function compressNode(node) {
  return [
    node.title,
    node.id,
    node.primaryLink ? node.primaryLink.title : '',
    node.primaryLink ? node.primaryLink.url : '',
    getSourceDescription(node),
    node.children.map(compressNode),
  ];
}

function main() {
  const llms = fs.readFileSync(llmsPath, 'utf8');
  const parsed = enrichNode(parseLlms(llms));
  const stats = sectionStats(parsed);
  const treeData = parsed.children.map(compressNode);
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Native 官方文档索引中文离线整理</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7fb;
      --panel: #ffffff;
      --panel-2: #eef3fa;
      --text: #1a2433;
      --muted: #5e6b7f;
      --line: #d6dfeb;
      --accent: #0b66ff;
      --accent-soft: #e7f0ff;
      --warn: #b85b00;
      --warn-soft: #fff1e1;
      --shadow: 0 12px 30px rgba(20, 41, 67, 0.08);
      --code: #101827;
      --code-text: #ebf2ff;
      --max: 1320px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: linear-gradient(180deg, #f8fbff 0%, #f3f6fb 32%, #eef2f8 100%);
      color: var(--text);
      line-height: 1.7;
    }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .layout {
      display: grid;
      grid-template-columns: 320px minmax(0, 1fr);
      gap: 24px;
      max-width: var(--max);
      margin: 0 auto;
      padding: 24px;
    }

    .sidebar {
      position: sticky;
      top: 16px;
      align-self: start;
      height: calc(100vh - 32px);
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(12px);
      border: 1px solid var(--line);
      border-radius: 20px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .sidebar-header {
      padding: 18px 18px 14px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, #ffffff 0%, #f3f7ff 100%);
    }

    .sidebar-header h2 {
      margin: 0 0 8px;
      font-size: 1rem;
    }

    .sidebar-header p {
      margin: 0;
      color: var(--muted);
      font-size: 0.92rem;
    }

    .toc {
      overflow: auto;
      height: calc(100% - 106px);
      padding: 12px 10px 24px 14px;
    }

    .toc ul {
      list-style: none;
      margin: 0;
      padding-left: 12px;
      border-left: 1px solid rgba(214, 223, 235, 0.85);
    }

    .toc > ul {
      padding-left: 0;
      border-left: 0;
    }

    .toc li { margin: 4px 0; }

    .toc a {
      display: block;
      padding: 6px 10px;
      color: var(--muted);
      border-radius: 10px;
      transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
      font-size: 0.94rem;
    }

    .toc a:hover,
    .toc a.active {
      color: var(--text);
      background: var(--accent-soft);
      text-decoration: none;
      transform: translateX(2px);
    }

    .content {
      min-width: 0;
    }

    .hero {
      background: radial-gradient(circle at top left, #eef5ff 0%, #ffffff 42%, #f8fbff 100%);
      border: 1px solid var(--line);
      border-radius: 24px;
      box-shadow: var(--shadow);
      padding: 32px;
      margin-bottom: 24px;
    }

    .hero h1 {
      margin: 0 0 12px;
      font-size: clamp(1.8rem, 3vw, 2.75rem);
      line-height: 1.15;
      letter-spacing: -0.03em;
    }

    .hero p {
      margin: 12px 0;
      color: var(--muted);
      font-size: 1rem;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 20px;
    }

    .meta-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px;
    }

    .meta-card h3 {
      margin: 0 0 8px;
      font-size: 1rem;
    }

    .meta-card p,
    .meta-card li {
      margin: 0;
      color: var(--muted);
      font-size: 0.95rem;
    }

    .meta-card ul {
      margin: 0;
      padding-left: 18px;
    }

    .stats-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 20px;
      box-shadow: var(--shadow);
      padding: 22px;
      margin-bottom: 24px;
    }

    .stats-card h2 {
      margin: 0 0 8px;
      font-size: 1.2rem;
    }

    .stats-card p {
      margin: 0 0 16px;
      color: var(--muted);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--line);
      overflow: hidden;
      border-radius: 16px;
      background: var(--panel);
    }

    th, td {
      text-align: left;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }

    th {
      background: #f2f6fd;
      font-weight: 600;
    }

    tr:last-child td,
    tr:last-child th {
      border-bottom: 0;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 600;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .badge.accent {
      background: var(--accent-soft);
      color: var(--accent);
      border-color: #c7dcff;
    }

    .badge.warn {
      background: var(--warn-soft);
      color: var(--warn);
      border-color: #ffd3a7;
    }

    .badge.muted {
      background: #f3f5f8;
      color: #6b7280;
      border-color: #dfe4ea;
    }

    .group-section {
      background: rgba(255,255,255,0.9);
      border: 1px solid var(--line);
      border-radius: 22px;
      box-shadow: var(--shadow);
      padding: 26px;
      margin-bottom: 24px;
      scroll-margin-top: 18px;
    }

    .group-section h2,
    .group-section h3,
    .group-section h4 {
      margin: 0 0 10px;
      line-height: 1.25;
      letter-spacing: -0.02em;
      scroll-margin-top: 18px;
    }

    .muted-heading {
      color: var(--muted);
      font-size: 0.78em;
      font-weight: 500;
      margin-left: 6px;
    }

    .group-note,
    .group-description,
    .official-link {
      margin: 8px 0 0;
    }

    .group-note,
    .group-description {
      color: var(--muted);
    }

    .page-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 16px;
      margin-top: 18px;
    }

    .page-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 8px 24px rgba(20, 41, 67, 0.05);
      scroll-margin-top: 18px;
    }

    .page-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
    }

    .page-card h4 {
      margin: 0;
      font-size: 1.05rem;
    }

    .en-title {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 0.92rem;
    }

    .detail-block + .detail-block {
      margin-top: 12px;
    }

    .detail-block h5 {
      margin: 0 0 6px;
      font-size: 0.92rem;
      color: var(--text);
    }

    .detail-block p,
    .detail-block li {
      margin: 0;
      color: var(--muted);
      font-size: 0.93rem;
    }

    .detail-block ul {
      margin: 0;
      padding-left: 18px;
    }

    .source-note {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed var(--line);
    }

    .source-note summary {
      cursor: pointer;
      color: var(--accent);
      font-size: 0.92rem;
    }

    .muted-text {
      color: var(--muted);
      font-size: 0.92rem;
    }

    .top-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }

    .pill-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      font-size: 0.9rem;
      box-shadow: 0 4px 16px rgba(20, 41, 67, 0.05);
    }

    .pill-link:hover {
      background: var(--accent-soft);
      text-decoration: none;
    }

    pre {
      margin: 0;
      background: var(--code);
      color: var(--code-text);
      padding: 14px 16px;
      border-radius: 14px;
      overflow: auto;
      border: 1px solid rgba(255,255,255,0.08);
    }

    code {
      font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 0.9rem;
    }

    .back-top {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 20;
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      background: var(--accent);
      color: #fff;
      box-shadow: var(--shadow);
      cursor: pointer;
    }

    .mobile-toc-toggle {
      display: none;
      position: sticky;
      top: 12px;
      z-index: 25;
      width: 100%;
      margin-bottom: 12px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(10px);
      border-radius: 14px;
      padding: 12px 14px;
      box-shadow: var(--shadow);
      color: var(--text);
      text-align: left;
    }

    @media (max-width: 1080px) {
      .layout {
        grid-template-columns: 1fr;
      }

      .mobile-toc-toggle {
        display: block;
      }

      .sidebar {
        position: static;
        height: auto;
        display: none;
      }

      .sidebar.open {
        display: block;
      }

      .toc {
        height: auto;
        max-height: 60vh;
      }
    }

    @media (max-width: 720px) {
      .layout {
        padding: 14px;
        gap: 14px;
      }

      .hero,
      .stats-card,
      .group-section {
        padding: 18px;
        border-radius: 18px;
      }

      .meta-grid {
        grid-template-columns: 1fr;
      }

      .page-grid {
        grid-template-columns: 1fr;
      }

      .page-card-header {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <h2>目录导航</h2>
        <p>结构直接来自 React Native 官方 <code>llms.txt</code>，并保留原始层级与页面入口。</p>
      </div>
      <nav class="toc" id="toc" aria-label="目录"></nav>
    </aside>

    <main class="content" id="top">
      <button class="mobile-toc-toggle" id="mobileTocToggle" type="button">显示 / 隐藏目录</button>

      <section class="hero">
        <h1>React Native 官方文档索引中文离线整理</h1>
        <p>这是一份面向系统学习与快速查阅的单文件离线 HTML。结构来源于 React Native 官方 <code>llms.txt</code>，并优先按官方索引中的章节、页面和层级关系来组织内容，而不是重新发明一套学习大纲。</p>
        <p>文档目标是帮助你在离线状态下快速理解：React Native 的文档到底如何组织、每个页面主要讲什么、什么时候该读哪一页、哪些页面是关键指南、哪些只是对象类型或索引入口、哪些能力已被官方标记为 <code>deprecated</code> / 建议改用社区包。</p>

        <div class="meta-grid">
          <div class="meta-card">
            <h3>生成依据</h3>
            <ul>
              <li>React Native 官方索引：<a href="https://reactnative.dev/llms.txt" target="_blank" rel="noopener noreferrer">https://reactnative.dev/llms.txt</a></li>
              <li>重点页面使用 React Native 官方页面做了进一步整理，例如 <code>Introduction</code>、<code>Style</code>、<code>Flexbox</code>、<code>Networking</code>、<code>Performance</code>、<code>Testing</code>、<code>Native Platform</code>、<code>React Native DevTools</code> 等。</li>
              <li>本文不依赖外部 CSS、JS、图片或构建工具，可直接本地打开。</li>
            </ul>
            <div class="top-links">
              <a class="pill-link" href="https://reactnative.dev/llms.txt" target="_blank" rel="noopener noreferrer">打开官方索引</a>
              <a class="pill-link" href="https://reactnative.dev/docs/getting-started" target="_blank" rel="noopener noreferrer">打开 Introduction</a>
              <a class="pill-link" href="https://reactnative.dev/docs/components-and-apis" target="_blank" rel="noopener noreferrer">打开 Components and APIs</a>
            </div>
          </div>
          <div class="meta-card">
            <h3>使用说明</h3>
            <ul>
              <li>左侧目录支持锚点跳转，移动端可折叠显示。</li>
              <li>重点页面会补充“是什么、用于什么、如何使用、注意事项、关联页面”。</li>
              <li>未完全展开的页面会明确标注需要回到官方原文确认。</li>
              <li>遇到 <code>❌</code>、<code>🗑️</code>、<code>🚧</code>、<code>🧪</code> 标签时，优先按官方当前语义理解其状态。</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="stats-card">
        <h2>官方索引结构概览</h2>
        <p>下表统计的是本次从 <code>llms.txt</code> 恢复出来的主要层级。<code>页面数</code> 指有明确官方链接的页面入口，<code>分组数</code> 指仅作为结构容器的层级节点。</p>
        <table id="stats-table">
          <thead>
            <tr>
              <th>中文章节</th>
              <th>原始章节</th>
              <th>分组数</th>
              <th>页面数</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <div class="legend">
          <span class="badge accent">实验性 / New Architecture</span>
          <span class="badge warn">已弃用 / 建议改用社区包 / 需要原生工程</span>
          <span class="badge muted">Legacy / 文档未完成</span>
        </div>
      </section>

      <div id="content-root"></div>
    </main>
  </div>

  <button class="back-top" id="backTop" type="button" aria-label="返回顶部">返回顶部</button>

  <script>
    (function () {
      const topSectionLabels = ${JSON.stringify(topSectionLabels)};
      const groupNotes = ${JSON.stringify(groupNotes)};
      const zhTitleMap = ${JSON.stringify(zhTitleMap)};
      const curatedDetails = ${JSON.stringify(curatedDetails)};
      const stats = ${JSON.stringify(stats)};
      const tree = ${JSON.stringify(treeData)};

      const escapeHtml = input => String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

      const getDisplayTitle = node => node[2] || node[0];
      const getZhTitle = node => zhTitleMap[getDisplayTitle(node)] || zhTitleMap[node[0]] || getDisplayTitle(node);
      const getOfficialUrl = node => node[3] ? 'https://reactnative.dev' + node[3].replace(/\\.md$/, '') : '';
      const getSourceDescription = node => node[4] || '';
      const getBadges = node => {
        const source = (getDisplayTitle(node) + ' ' + getSourceDescription(node) + ' ' + node[0]).toLowerCase();
        const badges = [];
        if (source.includes('❌') || source.includes('use one of the community packages instead')) badges.push(['已弃用/改用社区包', 'warn']);
        if (source.includes('🗑️') || source.includes('deprecated')) badges.push(['已弃用', 'warn']);
        if (source.includes('🚧') || source.includes('work in progress')) badges.push(['文档未完成', 'muted']);
        if (source.includes('🧪')) badges.push(['实验性', 'accent']);
        if ((node[3] || '').includes('/legacy/')) badges.push(['Legacy', 'muted']);
        if ((node[3] || '').includes('/the-new-architecture/')) badges.push(['New Architecture', 'accent']);
        if (getSourceDescription(node).includes('Project with Native Code Required')) badges.push(['需要原生工程', 'warn']);
        return badges;
      };

      const autoOverview = node => {
        const desc = getSourceDescription(node);
        const title = getDisplayTitle(node);
        const url = node[3] || '';
        if (url.includes('/docs/global-')) return '这是 React Native 运行时暴露的全局接口页面。许多条目更接近 Web / Node 风格 API，而不是典型的 React Native 组件文档；查阅时应同时确认 Hermes 与平台支持情况。';
        if (url.includes('/docs/legacy/')) return '这是 Legacy Architecture 时代的说明页，主要服务于维护旧桥接代码、旧原生组件或做迁移对照。若你在开发新能力，应优先评估 New Architecture 对应页面。';
        if (url.includes('/docs/the-new-architecture/')) return '这是 New Architecture 专题页面，适合在需要 Codegen、Turbo Native Modules 或 Fabric Native Components 时按官方步骤展开阅读。';
        if (/Use one of the community packages instead\\./.test(desc)) return '官方已不再把这项能力作为当前推荐的内置方案，建议优先选择维护活跃的社区包，并回到官方页面确认推荐语义没有变化。';
        if (/work in progress/i.test(desc)) return '官方明确说明该页仍在建设中。离线文档保留入口与定位说明，但具体 API 细节需要参考官方原文以及页面中提到的 MDN / Web 规范。';
        if (/Examples?$/.test(desc) || /Object Type/.test(title) || /Props/.test(title)) return '这是偏参考性质的页面，通常用于说明样式字段、对象结构、事件对象或某类 Props 的含义。实际使用时，应与对应组件或 API 主页面配套阅读。';
        if (/A React component|Component/.test(desc)) return '这是组件页，重点通常是组件的用途、常见 Props、平台差异和适用场景。学习时可以先掌握它的角色，再回到官方原文查看完整属性表。';
        if (/API/.test(title) || /module/i.test(desc) || /provides/i.test(desc)) return '这是 API 或模块页，适合在你已经明确需求后查方法、事件、平台限制和示例用法。';
        if (/guide|learn|overview|introduction/i.test(title + ' ' + desc)) return '这是指南型页面，适合在配置、排错、迁移或理解整体概念时顺着官方步骤阅读。';
        return '这是官方索引中的页面入口。本离线文档先给出定位与阅读建议；如果你需要完整 API 列表、平台矩阵或更长示例，应继续打开官方原文。';
      };

      const autoConcepts = node => {
        const desc = getSourceDescription(node);
        const url = node[3] || '';
        const concepts = [];
        if (url.includes('/docs/global-')) {
          concepts.push('重点确认这个全局接口是否只是“可用”，还是已经有完整的 React Native 文档说明。');
          concepts.push('如果官方页面写明参考 MDN，那么语义解释应以 Web 规范为主。');
        } else if (url.includes('/docs/legacy/')) {
          concepts.push('这类页面通常服务于旧架构维护或迁移，而不是新项目的首选方案。');
          concepts.push('阅读时建议同步查看 New Architecture 的对应能力。');
        } else if (url.includes('/docs/the-new-architecture/')) {
          concepts.push('这类页面通常围绕 Codegen、类型声明、原生桥接生成代码和平台实现步骤展开。');
          concepts.push('它们通常要求你具备 Android / iOS 原生工程背景。');
        } else if (/Use one of the community packages instead\\./.test(desc)) {
          concepts.push('官方保留此页主要是为了迁移和兼容性提示，不代表应继续优先使用内置方案。');
        } else if (/Project with Native Code Required/.test(desc)) {
          concepts.push('这页默认面向含原生目录的项目。');
          concepts.push('如果你使用的是 Framework 管理的工作流，应先确认该能力是否被框架封装或限制。');
        } else if (/Examples?$/.test(desc) || /Object Type/.test(getDisplayTitle(node))) {
          concepts.push('把它当成“字段字典”或“对象结构参考”来看最合适。');
        } else {
          concepts.push('先理解它在官方结构中的位置，再决定是快速查用法还是深入看完整参考。');
        }
        if (desc) concepts.push('索引信号：' + desc);
        return concepts;
      };

      const autoScenarios = node => {
        const url = node[3] || '';
        if (url.includes('/docs/global-')) return ['需要确认某个浏览器风格全局对象在 React Native 运行时是否可用时。'];
        if (url.includes('/docs/legacy/')) return ['维护历史项目、老库互操作、或做旧架构到新架构迁移时。'];
        if (url.includes('/docs/the-new-architecture/')) return ['自定义原生模块、原生组件，或为库适配 New Architecture 时。'];
        if (/Use one of the community packages instead\\./.test(getSourceDescription(node))) return ['排查旧代码仍在使用该能力，准备替换为社区包时。'];
        return ['当你已经知道要找哪个组件 / API，但还不确定它的角色、限制和后续阅读方向时。'];
      };

      const autoNotes = node => {
        const desc = getSourceDescription(node);
        const notes = [];
        if (/Use one of the community packages instead\\./.test(desc)) notes.push('迁移前先确认社区替代包的维护状态、平台支持与 New Architecture 兼容性。');
        if (/work in progress/i.test(desc)) notes.push('官方文档尚未完全展开，本离线文档不应替代原文。');
        if (/Project with Native Code Required/.test(desc)) notes.push('如果你的项目没有原生目录或未暴露原生工程，这页内容可能暂时无法直接落地。');
        if ((node[3] || '').includes('/blog/')) notes.push('Blog 更适合用来理解背景与版本变化，不应替代正式 API 文档。');
        if (!notes.length) notes.push('需要参数表、平台支持矩阵或完整示例时，请回到官方原文确认。');
        return notes;
      };

      const autoRelations = node => {
        const url = node[3] || '';
        if (url.includes('/docs/global-')) return ['常与 javascript-environment、hermes 和具体业务 API 页面一起查阅。'];
        if (url.includes('/docs/the-new-architecture/')) return ['建议与 native-platform、architecture/landing-page、fabric-renderer 联合阅读。'];
        if (url.includes('/docs/legacy/')) return ['建议同时查找是否存在对应的 New Architecture 文档或社区迁移方案。'];
        return ['它在官方结构中的上下游页面，通常就是最好的继续阅读入口。'];
      };

      const renderList = (title, items) => {
        if (!items || !items.length) return '';
        return '<div class="detail-block"><h5>' + escapeHtml(title) + '</h5><ul>' + items.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul></div>';
      };

      const renderSample = sample => {
        if (!sample) return '';
        return '<div class="detail-block"><h5>示例代码或命令</h5><pre><code class="language-' + escapeHtml(sample.lang || 'text') + '">' + escapeHtml(sample.code) + '</code></pre></div>';
      };

      const renderPage = node => {
        const details = curatedDetails[node[3]] || null;
        const overview = details ? details.overview : autoOverview(node);
        const concepts = details ? details.concepts : autoConcepts(node);
        const scenarios = details ? details.scenarios : autoScenarios(node);
        const notes = details ? details.notes : autoNotes(node);
        const relations = details ? details.relations : autoRelations(node);
        const sample = details ? details.sample : null;
        const officialUrl = getOfficialUrl(node);
        const badges = getBadges(node).map(([label, cls]) => '<span class="badge ' + cls + '">' + escapeHtml(label) + '</span>').join('');
        const sourceDesc = getSourceDescription(node);

        return '<article class="page-card" id="' + escapeHtml(node[1]) + '">' +
          '<header class="page-card-header"><div><h4>' + escapeHtml(getZhTitle(node)) + '</h4><p class="en-title">' + escapeHtml(getDisplayTitle(node)) + '</p></div><div class="badges">' + badges + '</div></header>' +
          (officialUrl ? '<p class="official-link">官方文档：<a href="' + escapeHtml(officialUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(officialUrl) + '</a></p>' : '') +
          '<div class="detail-block"><h5>内容概述</h5><p>' + escapeHtml(overview) + '</p></div>' +
          renderList('核心概念', concepts) +
          renderList('使用场景', scenarios) +
          renderSample(sample) +
          renderList('注意事项', notes) +
          renderList('与其他章节的关系', relations) +
          (sourceDesc ? '<details class="source-note"><summary>查看索引原文说明</summary><p>' + escapeHtml(sourceDesc) + '</p></details>' : '<p class="muted-text">未展开，需要参考官方原文确认。</p>') +
        '</article>';
      };

      const renderGroup = (node, depth) => {
        const title = getDisplayTitle(node);
        const zhTitle = getZhTitle(node);
        const note = groupNotes[node[0]] || groupNotes[title] || autoOverview(node);
        const officialUrl = getOfficialUrl(node);
        const tag = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';
        const children = node[5] || [];
        const pages = children.filter(child => child[3]);
        const groups = children.filter(child => !child[3]);
        return '<section class="group-section" id="' + escapeHtml(node[1]) + '">' +
          '<' + tag + '>' + escapeHtml(zhTitle) + ' <span class="muted-heading">' + escapeHtml(title) + '</span></' + tag + '>' +
          '<p class="group-note">' + escapeHtml(note) + '</p>' +
          (officialUrl ? '<p class="official-link">官方文档：<a href="' + escapeHtml(officialUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(officialUrl) + '</a></p>' : '') +
          (node[4] && !node[3] ? '<p class="group-description">' + escapeHtml(node[4]) + '</p>' : '') +
          (pages.length ? '<div class="page-grid">' + pages.map(renderPage).join('') + '</div>' : '') +
          groups.map(child => renderGroup(child, depth + 1)).join('') +
        '</section>';
      };

      const renderNav = node => {
        const children = node[5] || [];
        return '<li><a href="#' + escapeHtml(node[1]) + '">' + escapeHtml(getZhTitle(node)) + '</a>' +
          (children.length ? '<ul>' + children.map(renderNav).join('') + '</ul>' : '') +
        '</li>';
      };

      const toc = document.getElementById('toc');
      const contentRoot = document.getElementById('content-root');
      const statsBody = document.querySelector('#stats-table tbody');
      if (toc) toc.innerHTML = '<ul>' + tree.map(renderNav).join('') + '</ul>';
      if (contentRoot) contentRoot.innerHTML = tree.map(node => renderGroup(node, 0)).join('');
      if (statsBody) {
        statsBody.innerHTML = stats.map(row =>
          '<tr><th>' + escapeHtml(row.zhTitle) + '</th><td>' + escapeHtml(row.title) + '</td><td>' + row.groupCount + '</td><td>' + row.pageCount + '</td></tr>'
        ).join('');
      }

      const sidebar = document.getElementById('sidebar');
      const mobileTocToggle = document.getElementById('mobileTocToggle');
      const backTop = document.getElementById('backTop');

      if (mobileTocToggle && sidebar) {
        mobileTocToggle.addEventListener('click', () => {
          sidebar.classList.toggle('open');
        });
      }

      if (backTop) {
        backTop.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      const tocLinks = Array.from(document.querySelectorAll('.toc a'));
      const targets = tocLinks
        .map(link => {
          const id = decodeURIComponent(link.getAttribute('href').slice(1));
          const el = document.getElementById(id);
          return el ? { link, el } : null;
        })
        .filter(Boolean);

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (!entry.isIntersecting) return;
              const id = entry.target.getAttribute('id');
              tocLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
              });
            });
          },
          {
            rootMargin: '-20% 0px -65% 0px',
            threshold: [0, 1],
          },
        );

        targets.forEach(item => observer.observe(item.el));
      }
    })();
  </script>
</body>
</html>
`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Generated ${outputPath}`);
}

main();
