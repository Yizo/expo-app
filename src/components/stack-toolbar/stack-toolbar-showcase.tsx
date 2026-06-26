import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";
import { useMemo } from "react";
import { Platform } from "react-native";

import { supportsLiquidGlassToolbar, type LessonId } from "./lessons";

const androidLeftIcon = require("../../../assets/images/tabIcons/home.png");
const androidFavoriteIcon = require("../../../assets/images/tabIcons/explore.png");
const androidShareIcon = require("../../../assets/images/expo-logo.png");
const androidBottomIcon = require("../../../assets/images/icon.png");

type StackToolbarShowcaseProps = {
	activeLesson: LessonId;
	isFavorite: boolean;
	onAction: (message: string) => void;
	onFavoritePress: () => void;
};

export default function StackToolbarShowcase({
	activeLesson,
	isFavorite,
	onAction,
	onFavoritePress,
}: StackToolbarShowcaseProps) {
	const colors = useTheme();

	const toolbarIcons = useMemo(() => {
		if (Platform.OS === "ios") {
			return {
				left: "sidebar.left",
				right: "square.and.arrow.up",
				bottom: "magnifyingglass",
				favorite: isFavorite ? "star.fill" : "star",
			};
		}

		if (Platform.OS === "android") {
			return {
				left: androidLeftIcon,
				right: androidShareIcon,
				bottom: androidBottomIcon,
				favorite: androidFavoriteIcon,
			};
		}

		return null;
	}, [isFavorite]);

	if (!toolbarIcons || (Platform.OS !== "ios" && Platform.OS !== "android")) {
		return null;
	}

	if (activeLesson === "header") {
		return (
			<>
				<Stack.Toolbar placement="left">
					<Stack.Toolbar.Button
						accessibilityLabel="左侧按钮"
						icon={toolbarIcons.left}
						onPress={() => onAction("点击了左侧 header 按钮")}
					/>
				</Stack.Toolbar>
				<Stack.Toolbar placement="right">
					<Stack.Toolbar.Button
						accessibilityLabel="右侧按钮"
						icon={toolbarIcons.right}
						onPress={() => onAction("点击了右侧 header 按钮")}
					/>
				</Stack.Toolbar>
			</>
		);
	}

	if (activeLesson === "bottom") {
		if (!supportsLiquidGlassToolbar()) {
			return null;
		}

		return (
			<Stack.Toolbar backgroundColor={colors.surface} tintColor={colors.text}>
				<Stack.Toolbar.Spacer />
				<Stack.Toolbar.Button
					accessibilityLabel="底部按钮"
					icon={toolbarIcons.bottom}
					onPress={() => onAction("点击了底部 toolbar 按钮")}
				/>
				<Stack.Toolbar.Spacer />
			</Stack.Toolbar>
		);
	}

	return (
		<Stack.Toolbar placement="right">
			<Stack.Toolbar.Button
				accessibilityLabel={isFavorite ? "取消收藏" : "收藏"}
				icon={toolbarIcons.favorite}
				onPress={onFavoritePress}
				selected={Platform.OS === "ios" ? isFavorite : undefined}
			/>
		</Stack.Toolbar>
	);
}
