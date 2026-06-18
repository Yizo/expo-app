import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		color: "#000",
	},
});

export default function Index() {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Index</Text>
		</View>
	);
}
