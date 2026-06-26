import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { Platform } from "react-native";

export default function useStackHeaderOptions() {
	const colors = useTheme();
	const scheme = useColorScheme();

	const sharedOptions = {
		headerShadowVisible: false,
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
	};

	if (Platform.OS === "android") {
		return {
			...sharedOptions,
			statusBarHidden: false,
			statusBarStyle: scheme === "dark" ? ("light" as const) : ("dark" as const),
		};
	}

	if (Platform.OS === "web") {
		return {
			...sharedOptions,
			headerBackTitle: "返回",
			headerTitleAlign: "center" as const,
		};
	}

	return {
		...sharedOptions,
		headerBackTitle: "返回",
		headerBackButtonDisplayMode: "generic" as const,
	};
}
