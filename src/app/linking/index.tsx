import { ScrollView, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

/**
 * 深度链接
 */
export default function Linking() {
	return (
		<ScrollView
			style={styles.scrollView}
			contentContainerStyle={styles.contentContainer}
		>
			<View>
				<Text>深度链接</Text>
			</View>
		</ScrollView>
	);
}
