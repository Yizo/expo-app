import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";

export default function AppTabs() {
	const scheme = useColorScheme();
	const themeKey = scheme === "dark" ? "dark" : "light";
	const colors = Colors[themeKey];

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colors.accent,
				tabBarInactiveTintColor: colors.textSecondary,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
				},
			}}
		>
			<Tabs.Screen name="index" options={{ title: "首页" }} />
			<Tabs.Screen name="feed" options={{ title: "Feed" }} />
			<Tabs.Screen name="about" options={{ title: "设置" }} />
		</Tabs>
	);
}
