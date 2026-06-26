import { Colors } from "@/constants/theme";
import { DynamicColorIOS } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function AppTabs() {
	const tintColor = DynamicColorIOS({
		light: Colors.light.accent,
		dark: Colors.dark.text,
	});

	return (
		<NativeTabs
			disableTransparentOnScrollEdge
			minimizeBehavior="onScrollDown"
			tintColor={tintColor}
		>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon
					sf={{ default: "house", selected: "house.fill" }}
				/>
				<NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="feed">
				<NativeTabs.Trigger.Icon
					sf={{ default: "newspaper", selected: "newspaper.fill" }}
				/>
				<NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="about">
				<NativeTabs.Trigger.Icon
					sf={{ default: "gearshape", selected: "gearshape.fill" }}
				/>
				<NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
