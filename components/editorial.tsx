import React from "react";
import { View, Text, type TextStyle, type ViewStyle, type StyleProp } from "react-native";
import { Fonts } from "@/constants/typography";
import { useAppTheme } from "@/hooks/use-theme-color";

/**
 * Small shared building blocks for the Burgundy Editorial language:
 *  - `Kicker`     — the uppercase accent label above headings.
 *  - `ScreenHeader` — kicker + large serif H1 (the Home/Favourites/Settings top).
 *  - `Hairline`   — a 1px divider used instead of card shadows.
 */

export function Kicker({
  children,
  style,
  size = 11,
  spacing = 1.4,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  size?: number;
  spacing?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <Text
      style={[
        {
          fontFamily: Fonts.heading,
          color: colors.accent,
          fontSize: size,
          letterSpacing: spacing,
          textTransform: "uppercase",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function ScreenHeader({
  kicker,
  title,
  subtitle,
  titleSize = 32,
  style,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  titleSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={style}>
      <Kicker>{kicker}</Kicker>
      <Text
        style={{
          fontFamily: Fonts.display,
          color: colors.text,
          fontSize: titleSize,
          lineHeight: titleSize * 1.08,
          letterSpacing: -0.3,
          marginTop: 8,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: Fonts.body,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
            marginTop: 6,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return <View style={[{ height: 1, backgroundColor: colors.divider }, style]} />;
}
