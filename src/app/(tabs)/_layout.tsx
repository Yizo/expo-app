import { Colors } from "@/constants/theme";
import { DynamicColorIOS, Platform } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
	const tintColor =
		Platform.OS === "ios"
			? DynamicColorIOS({
					light: Colors.light.accent,
					dark: Colors.dark.accent,
				})
			: Colors.light.accent;

	return (
		<NativeTabs minimizeBehavior="onScrollDown" tintColor={tintColor}>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
				<NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="feed">
				<NativeTabs.Trigger.Icon
					sf={{ default: "newspaper", selected: "newspaper.fill" }}
					md="library_books"
				/>
				<NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="about">
				<NativeTabs.Trigger.Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} md="settings" />
				<NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
