import { useRouter } from "expo-router";
import { Button, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default function About() {
	const router = useRouter();
	return (
		<View style={styles.container}>
			<Button title="权限设置" onPress={() => router.push("/settings/permissions")} />
			<Button title="深度链接" onPress={() => router.push("/linking")} />
		</View>
	);
}
