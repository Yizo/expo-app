import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ReactNode } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";

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

type NavigationThemeProviderProps = {
	children: ReactNode;
};

export default function NavigationThemeProvider({
	children,
}: NavigationThemeProviderProps) {
	const scheme = useColorScheme();
	const themeKey = scheme === "dark" ? "dark" : "light";

	return (
		<ThemeProvider value={navigationThemes[themeKey]}>
			{children}
		</ThemeProvider>
	);
}
