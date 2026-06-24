import { Fonts, FontSizes, Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActionButtonProps = {
	caption?: string;
	disabled?: boolean;
	label: string;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	variant?: "primary" | "secondary" | "ghost";
};

export default function ActionButton({
	caption,
	disabled,
	label,
	onPress,
	style,
	variant = "primary",
}: ActionButtonProps) {
	const colors = useTheme();

	const palette =
		variant === "primary"
			? {
					backgroundColor: colors.accent,
					borderColor: colors.accent,
					labelColor: colors.accentContrast,
					captionColor: "rgba(247, 255, 253, 0.76)",
				}
			: variant === "secondary"
				? {
						backgroundColor: colors.surface,
						borderColor: colors.border,
						labelColor: colors.text,
						captionColor: colors.textSecondary,
					}
				: {
						backgroundColor: "transparent",
						borderColor: "transparent",
						labelColor: colors.accent,
						captionColor: colors.textSecondary,
					};

	return (
		<Pressable
			accessibilityRole="button"
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				{
					backgroundColor: palette.backgroundColor,
					borderColor: palette.borderColor,
					opacity: disabled ? 0.55 : 1,
					transform: [{ scale: pressed ? 0.985 : 1 }],
				},
				style,
			]}
		>
			<View style={styles.copy}>
				<Text style={[styles.label, { color: palette.labelColor }]}>{label}</Text>
				{caption ? <Text style={[styles.caption, { color: palette.captionColor }]}>{caption}</Text> : null}
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: 56,
		paddingHorizontal: Spacing.four,
		paddingVertical: Spacing.three,
		borderRadius: Radii.md,
		borderWidth: 1,
		justifyContent: "center",
	},
	copy: {
		gap: 4,
	},
	label: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.callout,
		fontWeight: "700",
	},
	caption: {
		fontSize: FontSizes.footnote,
		lineHeight: 18,
	},
});
