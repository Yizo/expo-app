import { Stack } from "expo-router";
import { Button, StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

export default function AnimatedStyleUpdateExample() {
	const randomWidth = useSharedValue(10);

	const config = {
		duration: 500,
		easing: Easing.bezier(0.5, 0.01, 0, 1),
	};

	const style = useAnimatedStyle(() => {
		return {
			width: withTiming(randomWidth.value, config),
		};
	});

	return (
		<>
			<Stack.Screen options={{ title: "Animation" }} />
			<View style={styles.container}>
				<Animated.View style={[styles.box, style]} />
				<Button
					title="toggle"
					onPress={() => {
						randomWidth.value = Math.random() * 350;
					}}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	box: {
		width: 100,
		height: 80,
		backgroundColor: "black",
		margin: 30,
	},
});
