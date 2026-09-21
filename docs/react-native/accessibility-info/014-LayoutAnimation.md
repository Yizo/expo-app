# 014 LayoutAnimation

**翻页：** [上一页：013 Keyboard](013-Keyboard.md) · [目录](README.md) · [下一页：015 Linking](015-Linking.md)

**官方页面：** [LayoutAnimation · React Native](https://reactnative.dev/docs/layoutanimation)  
**源页代码覆盖：** 下一次 layout 前排程动画、Android 实验开关、create/update/delete 变更类型配置、create helper、Type/Properties 枚举和 Presets。

## 自动动画布局变化

**LayoutAnimation** 在“下一次布局计算”时，自动把新增/修改/删除视图的布局变化过渡成动画。用法是先调用 **configureNext(config)**，再更新 React state；configureNext 可接收完成/失败回调。它与逐帧控制 Animated.Value 不同，适合列表增删、面板展开这种布局结构变化。

Android 上使用前需通过 UIManager 开启实验开关：

    if (Platform.OS === 'android' &&
        UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    function ToggleDetails() {
      const [expanded, setExpanded] = useState(false);

      function toggle() {
        LayoutAnimation.configureNext(
          LayoutAnimation.Presets.easeInEaseOut,
          () => console.log('布局动画完成'),
          () => console.log('布局动画失败'),
        );
        setExpanded(value => !value);
      }

      return (
        <View>
          <Button title="展开/收起" onPress={toggle} />
          {expanded && <Details />}
        </View>
      );
    }

## 自定义配置

configureNext 的配置可包含 duration，以及新增/更新/删除三种变更各自的动画配置。每类配置都可以设 type、property、springDamping、initialVelocity、delay、duration；property 对 create/delete 尤其推荐明确设置。

- 动画 **Types**：spring、linear、easeInEaseOut、easeIn、easeOut、keyboard。
- 可动画 **Properties**：opacity、scaleX、scaleY、scaleXY。
- **create(duration, type, creationProp)**：生成含 create/update/delete 的配置对象。
- 预设 **Presets**：easeInEaseOut、linear、spring；快捷方法 LayoutAnimation.easeInEaseOut()、linear()、spring() 会调用 configureNext 对应预设。

    const config = LayoutAnimation.create(
      260,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity,
    );

    LayoutAnimation.configureNext(config);
    setRows(current => current.filter(row => row.id !== removedId));

自定义对象适用于只要某些变更淡入、其他变更采用 spring 的场景。动画只影响之后一次布局，应在状态更新之前安排好配置。

## 代码覆盖清单

已重写源页 Android 开关、state 更新前 configureNext、完成/失败回调、create helper 和属性配置示例。方法、config 字段、Types、Properties、预设对象与快捷函数均已列出。

**翻页：** [上一页：013 Keyboard](013-Keyboard.md) · [目录](README.md) · [下一页：015 Linking](015-Linking.md)
