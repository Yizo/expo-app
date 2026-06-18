# Segmented Control：跨平台的原生分段选择控件

> 原文档修改日期：2026 年 5 月 18 日  
> 包名：`@react-native-segmented-control/segmented-control`  
> 支持平台：Android、iOS、Web、Expo Go  
> 文档状态：面向下一版本 Expo SDK（unversioned）；当前稳定版本为 SDK 56

## 文档解决的问题

在移动端应用中，经常需要用户在几个互斥选项之间切换，例如：

- 在"日 / 周 / 月"视图间切换日历
- 在"地图 / 列表"之间切换搜索结果展示方式
- 在"浅色 / 深色 / 跟随系统"之间切换主题

iOS 系统提供了一个叫 `UISegmentedControl` 的原生控件来实现这个交互。它是一个水平排列的按钮组，每个按钮代表一个选项，用户点击某个按钮即选中对应选项——行为和单选按钮（radio button）类似，但外观更紧凑、更符合 iOS 设计规范。

`@react-native-segmented-control/segmented-control` 这个包将 iOS 的 `UISegmentedControl` 封装为 React Native 组件。在 iOS 上使用原生控件渲染，在 Android 和 Web 上则提供高度还原的视觉复刻。

## 阅读前需要理解的背景

### UISegmentedControl 是什么

`UISegmentedControl` 是 Apple 为 iOS 提供的原生 UI 控件。Apple 的官方定义是：

> A horizontal control that consists of multiple segments, each segment functioning as a discrete button.  
> （一个水平控件，由多个分段组成，每个分段作为一个独立按钮使用。）

它看起来像一排紧挨着的圆角按钮，选中的按钮有高亮背景。如果你用过 iPhone 自带的"地图"App，顶部切换"驾车 / 公交 / 步行"的那排按钮就是 Segmented Control。

### 与 Web 中 Radio Button / Tab 的对比

在 React Web 开发中，类似的功能通常用以下方式实现：

```tsx
// Web 方式一：Radio Button 组
<label>
  <input type="radio" name="view" value="day" checked={view === 'day'} onChange={handleChange} />
  日
</label>
<label>
  <input type="radio" name="view" value="week" checked={view === 'week'} onChange={handleChange} />
  周
</label>

// Web 方式二：Tab 按钮组
<div className="tab-group">
  <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>日</button>
  <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>周</button>
</div>
```

Segmented Control 在功能上等同于上述两种方式，但它是一个独立的封装组件，自带 iOS 原生外观和动画，不需要手动管理样式和选中状态的高亮效果。

### Expo Go 是什么

Expo Go 是 Expo 提供的一个沙盒 App，安装到手机上后可以直接运行 Expo 项目，无需编译原生代码。对于开发阶段来说，它是最快的预览方式。这个包支持在 Expo Go 中直接运行，不需要额外配置原生工程。

## 安装

根据你使用的包管理器，运行以下命令之一：

```sh
# npm
npx expo install @react-native-segmented-control/segmented-control

# yarn
yarn expo install @react-native-segmented-control/segmented-control

# pnpm
pnpm expo install @react-native-segmented-control/segmented-control

# bun
bun expo install @react-native-segmented-control/segmented-control
```

**关于 `npx expo install` 命令**：这是 Expo 推荐的安装方式，和直接 `npm install` 的区别在于，`expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本，并更新 `package.json`。这避免了手动安装时可能出现的版本不兼容问题。

### 已有 React Native 项目的集成

如果要在已有的（非 Expo 创建的）React Native 项目中集成此库，需要先完成以下步骤：

1. **添加 `expo` 模块**：在项目中安装并配置 Expo 的模块系统。这是因为该库依赖 Expo 的原生模块桥接机制。
2. **查阅官方仓库 README**：完成 expo 模块配置后，按照库的 GitHub 仓库中的 README 完成剩余的原生工程配置。

对于从零开始的 Expo 项目，只需运行上述安装命令即可，不需要额外的原生配置。

## 核心概念

### 组件本质：增强的单选按钮

文档将 Segmented Control 描述为"an enhanced radio button"（增强的单选按钮）。这意味着：

- **互斥选择**：同一时刻只能选中一个选项，和 radio button 一样
- **视觉增强**：不是简陋的圆形单选点，而是一个完整的、带有选中高亮和过渡动画的按钮组
- **原生渲染**：在 iOS 上使用系统原生控件，性能和外观与系统其他 App 完全一致

### 跨平台渲染策略

这个库在不同平台上采用不同的渲染策略：

| 平台 | 渲染方式 | 说明 |
| --- | --- | --- |
| iOS | 原生 `UISegmentedControl` | 直接调用 iOS 系统控件，外观和行为与系统完全一致 |
| Android | JavaScript 视觉复刻 | 用 React Native 的基础组件模拟 iOS 分段控件的外观 |
| Web | JavaScript 视觉复刻 | 在浏览器中用 HTML/CSS 模拟相同外观 |
| Expo Go | 同上述对应平台 | 在 Expo Go 沙盒中运行时，遵循当前平台的渲染策略 |

**对开发者的影响**：在 iOS 上你会看到完全原生的外观，但在 Android 和 Web 上，虽然视觉上高度还原，但交互细节（如点击反馈、过渡动画）可能与 iOS 存在微小差异。如果你的 Android 用户期望看到 Material Design 风格的控件，这个组件在 Android 上呈现的仍然是 iOS 风格。

### 替代方案：@expo/ui

文档提到 `@expo/ui` 包提供了一个替代实现，该实现使用：

- **iOS 端**：SwiftUI（Apple 最新的声明式 UI 框架）
- **Android 端**：Jetpack Compose（Google 最新的声明式 UI 框架）

这意味着 `@expo/ui` 的替代方案在两个平台上都使用各自最新的原生 UI 框架渲染，而非 JavaScript 模拟。如果你的项目需要更原生的跨平台体验，可以考虑这个替代方案。不过 `@expo/ui` 目前仅支持 iOS 和 Android，不支持 Web。

## API 和使用方法

当前文档页面未提供完整的 API 属性列表和代码示例。文档将详细的 API 参考指向了该库的 GitHub 仓库。

基于文档内容可确认的核心用法如下：

```tsx
import SegmentedControl from '@react-native-segmented-control/segmented-control';

function MyComponent() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <SegmentedControl
      values={['选项一', '选项二', '选项三']}
      selectedIndex={selectedIndex}
      onChange={(event) => {
        setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
      }}
    />
  );
}
```

（基于文档内容推导：文档将该组件类比为"增强的 radio button"，核心交互是通过 `values` 传入选项、通过 `selectedIndex` 控制选中项、通过 `onChange` 监听切换。）

如需了解完整的 props 列表、类型定义和高级配置（如自定义颜色、启用/禁用某个分段等），请查阅库的 GitHub 仓库 README。

## 注意事项和限制条件

### 文档版本说明

当前文档面向的是 Expo SDK 的下一个版本（unversioned）。如果你正在使用当前稳定版 SDK 56，应查阅 SDK 56 对应的文档页面，因为 API 可能存在差异。

### Android 上的外观一致性

该组件在 Android 上使用 JavaScript 模拟 iOS 分段控件的外观，而非 Android 原生的 Material Design 控件。如果你的 Android 用户习惯了 Material Design 的交互模式（如 TabLayout），可能需要评估这种视觉差异是否会影响用户体验。

### Web 平台支持

虽然该组件支持 Web 平台，但它的设计初衷是移动端。在 Web 上使用时，交互体验可能不如原生的 HTML radio button 或自定义 Tab 组件灵活。

### 已有项目的额外配置

在非 Expo 创建的已有 React Native 项目中使用时，不能只运行安装命令就完成集成。必须先配置 `expo` 模块，这是很多开发者容易忽略的步骤。

## React Web 开发者需要特别注意的地方

1. **事件对象不同**：在 Web 中，`onChange` 事件回调接收的是标准的 DOM 事件对象（`event.target.value`）。在 React Native 的 Segmented Control 中，事件对象的结构不同，选中索引通过 `event.nativeEvent.selectedSegmentIndex` 获取，而不是 `event.target.value`。

2. **没有 `<option>` 子元素**：Web 的 `<select>` 通过 `<option>` 子元素定义选项。Segmented Control 通过 `values` 属性传入一个字符串数组来定义选项，不需要子元素。

3. **样式系统不同**：Web 中通过 CSS 自由定制外观。Segmented Control 的外观由原生控件决定（iOS）或由库预设（Android/Web），自定义空间有限，不能像 Web 中那样用 CSS 随意修改每个细节。

4. **索引而非值**：Web 的 radio button 通常用 `value` 字符串标识选中项。Segmented Control 使用数字索引（0, 1, 2...）标识选中项，类似于数组下标。如果选项列表顺序变化，选中项的含义也会变化。

5. **跨平台视觉差异**：在 Web 开发中，同一段 CSS 在所有浏览器中外观基本一致。但 Segmented Control 在不同平台上的渲染存在差异——iOS 是完全原生的，Android 和 Web 是 JavaScript 模拟的。

## 实际开发建议

- **适合使用的场景**：需要在 iOS 应用中提供简洁的互斥选项切换，且选项数量不多（通常 2-5 个）。例如视图切换、筛选器、简单的设置项。
- **不适合使用的场景**：选项数量多、需要自定义每个分段复杂布局的场景。Web 上的 Tab 组件或导航栏可能更合适。
- **跨平台项目**：如果项目需要同时在 iOS 和 Android 上运行，且希望两个平台都使用各自原生的 UI 风格，可以考虑文档提到的 `@expo/ui` 替代方案。
- **Expo Go 开发阶段**：该库支持 Expo Go，开发阶段可以直接在手机上预览效果，无需编译原生代码。

## 总结

`@react-native-segmented-control/segmented-control` 是一个将 iOS 原生 `UISegmentedControl` 封装为 React Native 组件的库。它在 iOS 上使用原生控件渲染，在 Android 和 Web 上通过 JavaScript 提供高度还原的视觉复刻。安装简单（通过 `npx expo install`），支持 Expo Go，适合需要在移动端提供互斥选项切换功能的场景。对于已有 React Native 项目，需要额外配置 expo 模块。详细的 API 文档请参考库的 GitHub 仓库。

---

## 文档导航

- **上一页**：[picker](./228__picker.md)
- **下一页**：[flash list](./230__flash-list.md)
