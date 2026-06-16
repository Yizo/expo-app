import * as Linking from "expo-linking";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	headerText: {
		fontSize: 30,
		fontWeight: "bold",
		marginBottom: 10,
	},
});

/**
 * 深度链接
 */
export default function LinkingPage() {
	return (
		<ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
			<View style={styles.header}>
				<Text style={styles.headerText}>深度链接</Text>
			</View>
			<Button
				title="打开官网"
				onPress={() => {
					Linking.openURL("https://expo.dev");
				}}
			/>
			<Button
				title="打电话"
				onPress={() => {
					Linking.openURL("tel:10086");
				}}
			/>
			<Link href="https://expo.dev">Go to Expo</Link>
			<Button
				title="打开网页(百度)"
				onPress={() => WebBrowser.openBrowserAsync("https://www.baidu.com")}
			/>
		</ScrollView>
	);
}
