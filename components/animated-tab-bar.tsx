import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";

type IconName = "heart" | "home" | "settings";

const TAB_ICONS: Record<string, IconName> = {
  favourites: "heart",
  index: "home",
  settings: "settings",
};

/**
 * Flat editorial tab bar: three tabs, a hairline top rule instead of a
 * shadowed/coloured bar, the active tab tinted with the burgundy accent and
 * inactive tabs muted. Navigation + haptics behaviour is unchanged.
 */
export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const handleTabPress = (route: { key: string; name: string; params?: object }, isFocused: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        alignItems: "center",
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
     <View
       style={{
         flexDirection: "row",
         width: "100%",
         // Web: keep the three tabs in a centred, readable cluster instead of
         // stretched across a wide monitor. Native leaves it full-width.
         maxWidth: Platform.OS === "web" ? 560 : undefined,
         paddingTop: 10,
         paddingHorizontal: 12,
       }}
     >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = TAB_ICONS[route.name] ?? "ellipse";
        const label =
          route.name === "favourites"
            ? t("tabs.favourites")
            : route.name === "settings"
              ? t("tabs.settings")
              : t("tabs.home");
        const color = isFocused ? colors.accent : colors.textMuted;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => handleTabPress(route, isFocused)}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <Ionicons name={isFocused ? iconName : (`${iconName}-outline` as any)} size={22} color={color} />
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 10, marginTop: 4, color }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
     </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
