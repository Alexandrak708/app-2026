import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { changeLanguage } from "@/lib/i18n";
import { Wordmark } from "@/components/wordmark";

/** Nav order on desktop web: Home first, unlike the phone tab bar. */
const NAV_ORDER = ["index", "favourites", "settings"] as const;

export const WEB_NAV_HEIGHT = 76;
export const WEB_PAGE_MAX_WIDTH = 1280;
export const WEB_PAGE_GUTTER = 40;

function NavLink({ label, focused, onPress }: { label: string; focused: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityState={focused ? { selected: true } : {}}
      style={{
        height: WEB_NAV_HEIGHT,
        justifyContent: "center",
        borderTopWidth: 2,
        borderTopColor: "transparent",
        borderBottomWidth: 2,
        borderBottomColor: focused ? colors.accent : "transparent",
      }}
    >
      <Text
        style={{
          fontFamily: focused ? Fonts.bodyMedium : Fonts.body,
          fontSize: 15,
          color: focused || hovered ? colors.text : colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Desktop web navigation: the tab bar rendered as a top bar (wordmark, the
 * three tab destinations, language switch and profile) instead of the phone's
 * bottom tabs. Rendered by `AnimatedTabBar` when `useIsDesktopWeb()` is true.
 */
export function WebTopNav({ state, navigation }: BottomTabBarProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  const focusedName = state.routes[state.index]?.name;
  const labels: Record<string, string> = {
    index: t("tabs.home"),
    favourites: t("tabs.favourites"),
    settings: t("tabs.settings"),
  };

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (focusedName !== name && !event.defaultPrevented) navigation.navigate(route.name, route.params);
  };

  const isBulgarian = i18n.language === "bg";

  return (
    <View style={{ backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.softBorder }}>
      <View
        style={{
          width: "100%",
          maxWidth: WEB_PAGE_MAX_WIDTH,
          alignSelf: "center",
          paddingHorizontal: WEB_PAGE_GUTTER,
          height: WEB_NAV_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 52 }}>
          <Pressable onPress={() => go("index")} accessibilityRole="link" accessibilityLabel="U&I">
            <Wordmark size={34} />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 34 }}>
            {NAV_ORDER.map((name) => (
              <NavLink key={name} label={labels[name]} focused={focusedName === name} onPress={() => go(name)} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => changeLanguage(isBulgarian ? "en" : "bg")}
            accessibilityRole="button"
            accessibilityLabel={t("settings.language")}
            style={({ hovered }: any) => ({
              height: 44, paddingHorizontal: 16, borderRadius: 22, flexDirection: "row", alignItems: "center",
              gap: 8, borderWidth: 1, borderColor: hovered ? colors.text : colors.border,
            })}
          >
            <Ionicons name="globe-outline" size={17} color={colors.text} />
            <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.text }}>{isBulgarian ? "БГ" : "EN"}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/profile" as any)}
            accessibilityRole="link"
            style={({ hovered }: any) => ({
              height: 44, paddingLeft: 16, paddingRight: 20, borderRadius: 22, flexDirection: "row",
              alignItems: "center", gap: 10, backgroundColor: colors.solid, opacity: hovered ? 0.88 : 1,
            })}
          >
            <Ionicons name="person-outline" size={17} color={colors.onSolid} />
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: colors.onSolid }}>{t("home.profile")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default WebTopNav;
