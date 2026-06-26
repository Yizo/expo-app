import { Colors } from "@/constants/theme";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function AppTabs() {
	return (
		<NativeTabs
			backBehavior="history"
			indicatorColor={Colors.light.accentSoft}
			labelVisibilityMode="labeled"
			rippleColor={Colors.light.accentSoft}
			tintColor={Colors.light.accent}
		>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon md="home" />
				<NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="feed">
				<NativeTabs.Trigger.Icon md="library_books" />
				<NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="about">
				<NativeTabs.Trigger.Icon md="settings" />
				<NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
