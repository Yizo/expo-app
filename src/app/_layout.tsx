import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname } from "expo-router";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

function getTabsHeaderTitle(pathname: string) {
	if (pathname === "/") {
		return "Home";
	}

	if (pathname.startsWith("/explore")) {
		return "Explore";
	}

	if (pathname.startsWith("/more")) {
		return "More";
	}

	return "Expo App";
}

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const pathname = usePathname();
	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<AnimatedSplashOverlay />
			<Stack>
				<Stack.Screen
					name="(tabs)"
					options={{
						title: getTabsHeaderTitle(pathname),
						headerBackVisible: false,
					}}
				/>
			</Stack>
			<AppTabs />
		</ThemeProvider>
	);
}
