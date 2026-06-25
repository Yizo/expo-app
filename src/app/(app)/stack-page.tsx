import ScreenShell from "@/components/ui/screen-shell";
import { FontSizes, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignSelf: "stretch",
		justifyContent: "center",
		alignItems: "center",
	},
	item: {
		padding: Spacing.two,
		borderRadius: Spacing.one,
		fontSize: FontSizes.body,
	},
});

export default function StackPage() {
	const colors = useTheme();

	return (
		<>
			<Stack.Screen />
			<ScreenShell fill>
				<View style={[styles.container]}>
					<Text style={[styles.item, { color: colors.success }]}>Item 1</Text>
				</View>
			</ScreenShell>
		</>
	);
}
