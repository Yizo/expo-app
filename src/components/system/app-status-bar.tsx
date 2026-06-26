import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function AppStatusBar() {
	const scheme = useColorScheme();

	if (Platform.OS === "web") {
		return null;
	}

	return (
		<StatusBar
			animated
			hidden={false}
			hideTransitionAnimation={Platform.OS === "ios" ? "fade" : undefined}
			style={scheme === "dark" ? "light" : "dark"}
		/>
	);
}
