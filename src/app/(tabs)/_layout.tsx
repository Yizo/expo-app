import { Tabs } from "expo-router";

export default function TabsLayout() {
	return (
		<Tabs>
			<Tabs.Screen name="index" options={{ title: "首页" }} />
			<Tabs.Screen name="about" options={{ title: "关于" }} />
		</Tabs>
	);
}
