# 013 Switch

**翻页：** [上一页：012 StatusBar](012-StatusBar.md) · [目录](README.md) · [下一页：014 Text](014-Text.md)

**官方页面：** [Switch · React Native](https://reactnative.dev/docs/switch)  
**源页代码覆盖：** 受控布尔输入、onValueChange 与 onChange 两种事件形式、禁用态、thumb/track 色彩、iOS 背景色和 ref。

## 受控开关

**Switch** 是原生布尔输入，用于开/关某项设置。和 Web 中受控 checkbox 类似，**value** 是唯一数据来源：交互时调用 **onValueChange(nextValue)**，应用必须更新 state；若 state 不改，组件仍按旧 value 绘制。

    function NotificationsSetting() {
      const [enabled, setEnabled] = useState(false);

      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text>接收通知</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
      );
    }

**onValueChange** 直接收到新的 boolean，适合更新 React 状态。**onChange** 则接收包含 **nativeEvent.value** 的原生事件；需要事件信息时选它，不要把两个回调误认为互相调用。

    <Switch
      value={enabled}
      onChange={event => {
        const next = event.nativeEvent.value;
        savePreference(next);
        setEnabled(next);
      }}
    />

## 状态、颜色与 ref

| prop | 作用 | 平台 |
|---|---|---|
| **value** | 当前是否打开，默认 false | all |
| **onValueChange** | 用户切换时收到新 boolean | all |
| **onChange** | 用户切换时收到原生 change event | all |
| **disabled** | 禁用交互，默认 false | all |
| **thumbColor** | 前景滑块颜色；iOS 设置此值会移除默认投影 | all |
| **trackColor** | 轨道颜色对象 { false, true }，按开关状态区分 | all |
| **ios_backgroundColor** | 关闭或禁用时，iOS 轨道收缩后露出的背景色 | iOS |
| **ref** | 挂载后指向原生元素节点 | all |

平台默认样式可能不完全相同。**disabled** 只阻止用户切换，不改变受控 state；需要说明当前设置含义时，最好在开关旁同时放清楚的 **Text** 标签，而不只依赖颜色。

    <Switch
      value={enabled}
      disabled={saving}
      thumbColor={enabled ? '#ffffff' : '#d4d9df'}
      trackColor={{ false: '#8a949f', true: '#25845f' }}
      ios_backgroundColor="#8a949f"
      onValueChange={setEnabled}
      accessibilityLabel="接收通知"
    />

颜色使用 RN 支持的颜色格式。视觉状态与开关的受控值必须同步；如果同时维护一份互相矛盾的业务状态，会造成开关跳回。

## 代码覆盖清单

已用原创 JSX 展示受控 value/state、onValueChange、onChange event 读取、disabled、thumb/track/iOS 背景色、ref 的作用及可访问标签；全部官方参考 props 均已在表格说明。

**翻页：** [上一页：012 StatusBar](012-StatusBar.md) · [目录](README.md) · [下一页：014 Text](014-Text.md)
