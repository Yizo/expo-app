import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";

const navigationThemes = {
	light: {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			primary: Colors.light.accent,
			background: Colors.light.background,
			card: Colors.light.surface,
			text: Colors.light.text,
			border: Colors.light.border,
			notification: Colors.light.danger,
		},
	},
	dark: {
		...DarkTheme,
		colors: {
			...DarkTheme.colors,
			primary: Colors.dark.accent,
			background: Colors.dark.background,
			card: Colors.dark.surface,
			text: Colors.dark.text,
			border: Colors.dark.border,
			notification: Colors.dark.danger,
		},
	},
} as const;

export default function ThemedRootStack() {
	const scheme = useColorScheme();
	const themeKey = scheme === "dark" ? "dark" : "light";
	const colors = Colors[themeKey];

	return (
		<ThemeProvider value={navigationThemes[themeKey]}>
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
				<Stack.Screen
					name="auth-sheet"
					options={{
						title: "",
						presentation: "formSheet",
						headerTransparent: true,
						contentStyle: { backgroundColor: "transparent" },
						sheetGrabberVisible: true,
						sheetAllowedDetents: [0.72, 0.9],
						sheetInitialDetentIndex: 0,
						sheetCornerRadius: 24,
					}}
				/>
				<Stack.Screen name="linking" options={{ title: "深度链接" }} />
				<Stack.Screen name="sign-in" options={{ headerShown: false }} />
				<Stack.Screen name="create-account" options={{ headerShown: false }} />
				<Stack.Screen
					name="stack-page"
					options={{
						title: "Stack页面",
						presentation: "modal",
						headerShown: false,
					}}
				/>
			</Stack>
		</ThemeProvider>
	);
}
