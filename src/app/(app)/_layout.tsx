import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";

export default function AppLayout() {
	const scheme = useColorScheme();
	const themeKey = scheme === "dark" ? "dark" : "light";
	const colors = Colors[themeKey];

	return (
		<Stack
			screenOptions={{
				headerBackTitle: "返回",
				headerBackButtonDisplayMode: "generic",
				headerStyle: {
					backgroundColor: colors.surface,
				},
				headerTintColor: colors.text,
				headerTitleStyle: {
					color: colors.text,
				},
				contentStyle: {
					backgroundColor: colors.background,
				},
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="linking" options={{ title: "深度链接" }} />
			<Stack.Screen
				name="stack-page"
				options={{
					title: "Stack页面",
					presentation: "modal",
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="drawer-page"
				options={{
					title: "Drawer页面",
				}}
			/>
		</Stack>
	);
}
