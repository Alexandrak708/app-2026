import { Text, type StyleProp, type TextStyle } from "react-native";
import { Fonts } from "@/constants/typography";
import { useAppTheme } from "@/hooks/use-theme-color";

/**
 * The U&I wordmark set in the display serif: burgundy "U" and "I" with the
 * beige ampersand from the app icon.
 */
export function Wordmark({
  size = 30,
  color,
  ampersandColor,
  style,
}: {
  size?: number;
  color?: string;
  ampersandColor?: string;
  style?: StyleProp<TextStyle>;
}) {
  const { colors } = useAppTheme();
  return (
    <Text
      accessibilityLabel="U&I"
      style={[
        {
          fontFamily: Fonts.heading,
          fontSize: size,
          lineHeight: Math.round(size * 1.08),
          letterSpacing: -0.2,
          color: color ?? colors.accent,
        },
        style,
      ]}
    >
      U<Text style={{ color: ampersandColor ?? colors.beige }}>{"&"}</Text>I
    </Text>
  );
}

export default Wordmark;
