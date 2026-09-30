import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, Text } from "react-native";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { useIsDesktopWeb } from "@/components/responsive";
import { WebTopNav } from "@/components/web-top-nav";

type IconName = "heart" | "home" | "settings";

const TAB_ICONS: Record<string, IconName> = {
  favourites: "heart",
  index: "home",
  settings: "settings",
};

/**
 * Tab bar. On desktop web it becomes the top navigation bar (`WebTopNav`,
 * positioned by `tabBarPosition: "top"` in the tabs layout). On phones it is a
 * flat bottom bar: hairline top rule, the active tab's icon sat in a soft
 * burgundy pill, inactive tabs muted.
 */
export function AnimatedTabBar(props: BottomTabBarProps) {
  const desktopWeb = useIsDesktopWeb();
  if (desktopWeb) return <WebTopNav {...props} />;
  return <PhoneTabBar {...props} />;
}

function PhoneTabBar({ state, navigation }: BottomTabBarProps) {
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
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.softBorder,
        alignItems: "center",
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
     <View
       style={{
         flexDirection: "row",
         width: "100%",
         // Narrow web: keep the three tabs in a centred cluster.
         maxWidth: Platform.OS === "web" ? 560 : undefined,
         paddingTop: 8,
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
            accessibilityLabel={label}
            onPress={() => handleTabPress(route, isFocused)}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <View
              style={{
                width: 56,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isFocused ? colors.accentTint : "transparent",
              }}
            >
              <Ionicons name={isFocused ? iconName : (`${iconName}-outline` as any)} size={21} color={color} />
            </View>
            <Text
              style={{
                fontFamily: isFocused ? Fonts.bodyMedium : Fonts.body,
                fontSize: 11,
                marginTop: 3,
                color,
              }}
            >
              {label}
            </Text>
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
    minHeight: 50,
  },
});
