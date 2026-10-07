import { useContext, useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Pressable } from "@/components/pressable";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "@/contexts/theme-context";
import { useAppSettings } from "@/contexts/settings-context";
import { useAppTheme } from "@/hooks/use-theme-color";
import { getAppPalette } from "@/constants/theme";
import { Fonts } from "@/constants/typography";
import { ContentWrap, isWeb } from "@/components/responsive";
import { hoverTransition, useHover } from "@/components/program-ui";
import { BackToSettingsButton } from "@/components/back-to-settings-button";
import { changeLanguage } from "@/lib/i18n";

/**
 * Building blocks shared by the Settings tab (phone list + desktop web panels)
 * and the standalone settings screens (appearance, language, accessibility,
 * email, help, about, legal): editorial headings, cards, toggle / link rows,
 * the theme and language pickers and the FAQ accordion.
 */

export type IconName = keyof typeof Ionicons.glyphMap;

/** Muted red for the irreversible "delete account" bits. */
export function useDanger() {
  const { isDark } = useAppTheme();
  return {
    color: isDark ? "#f28b82" : "#b3261e",
    tint: isDark ? "rgba(242,139,130,0.12)" : "rgba(179,38,30,0.07)",
    solid: isDark ? "#c5463d" : "#b3261e",
  };
}

/** Touch feedback for pressables (phones have no hover). */
export const pressFade = ({ pressed }: { pressed: boolean }) => (pressed ? { opacity: 0.82 } : null);

export function Kicker({ label, color, center }: { label: string; color?: string; center?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Text
      style={{
        fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase",
        color: color ?? colors.accent, textAlign: center ? "center" : "left",
      }}
    >
      {label}
    </Text>
  );
}

/** Kicker + serif title + optional hint above a group of settings. */
export function SectionHeading({ icon, kicker, title, hint, size = "md" }: { icon?: IconName; kicker: string; title: string; hint?: string; size?: "md" | "lg" }) {
  const { colors } = useAppTheme();
  const large = size === "lg";
  return (
    <View style={{ marginBottom: large ? 22 : 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        {icon ? <Ionicons name={icon} size={13} color={colors.accent} /> : null}
        <Kicker label={kicker} />
      </View>
      <Text
        accessibilityRole="header"
        style={{ marginTop: 6, fontFamily: Fonts.heading, fontSize: large ? 38 : 26, lineHeight: large ? 42 : 30, color: colors.text }}
      >
        {title}
      </Text>
      {hint ? (
        <Text style={{ marginTop: 6, maxWidth: 560, fontFamily: Fonts.body, fontSize: large ? 15 : 13.5, lineHeight: large ? 23 : 20, color: colors.textSecondary }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Raised card that holds rows; rows draw their own rounded hover wash inside it. */
export function SettingsCard({ children, padded }: { children: ReactNode; padded?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ borderRadius: 22, padding: padded ? 18 : 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder }}>
      {children}
    </View>
  );
}

export function RowDivider({ inset = 70 }: { inset?: number }) {
  const { colors } = useAppTheme();
  return <View style={{ height: 1, marginLeft: inset, marginRight: 14, backgroundColor: colors.softBorder }} />;
}

/** Rounded icon square; fills burgundy when the thing it labels is on/selected. */
export function IconTile({ icon, active, size = 42, color }: { icon: IconName; active?: boolean; size?: number; color?: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          width: size, height: size, borderRadius: size * 0.31, alignItems: "center", justifyContent: "center",
          backgroundColor: active ? colors.accent : colors.accentTint,
        },
        hoverTransition,
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color={active ? "#ffffff" : color ?? colors.accent} />
    </View>
  );
}

/** The on/off pill drawn inside a ToggleRow (the whole row is the switch). */
function SwitchKnob({ value }: { value: boolean }) {
  const { colors, isDark } = useAppTheme();
  const { reduceMotion } = useAppSettings();
  const [position] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    const animation = Animated.timing(position, {
      toValue: value ? 1 : 0, duration: reduceMotion ? 0 : 200, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value, reduceMotion, position]);

  return (
    <View
      style={[
        {
          width: 52, height: 32, borderRadius: 16, padding: 3, justifyContent: "center",
          backgroundColor: value ? colors.accent : isDark ? "rgba(255,255,255,0.18)" : "rgba(32,31,29,0.16)",
        },
        hoverTransition,
      ]}
    >
      <Animated.View
        style={{
          width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff",
          shadowColor: "#000000", shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2,
          transform: [{ translateX: position.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }],
        }}
      >
        {value ? <Ionicons name="checkmark" size={14} color={colors.accent} /> : null}
      </Animated.View>
    </View>
  );
}

/** A whole-row switch: icon, title, plain-language hint and the toggle. */
export function ToggleRow({
  icon, title, hint, value, onValueChange,
}: {
  icon: IconName; title: string; hint: string; value: boolean; onValueChange: (value: boolean) => void;
}) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      {...hover}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      aria-checked={value}
      accessibilityLabel={title}
      accessibilityHint={hint}
      style={(state) => [
        pressFade(state),
        {
          flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 17,
          backgroundColor: hover.hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <IconTile icon={icon} active={value} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: colors.text }}>{title}</Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>{hint}</Text>
      </View>
      <SwitchKnob value={value} />
    </Pressable>
  );
}

/** A link row: icon, title, short "what's in there" hint and a chevron. */
export function NavRow({
  icon, title, hint, onPress, tone, role = "link",
}: {
  icon: IconName; title: string; hint?: string; onPress: () => void; tone?: "danger";
  /** "button" for rows that act (e.g. sign out) rather than open a page. */
  role?: "link" | "button";
}) {
  const { colors } = useAppTheme();
  const danger = useDanger();
  const hover = useHover();
  const accent = tone === "danger" ? danger.color : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole={role}
      accessibilityLabel={title}
      accessibilityHint={hint}
      style={(state) => [
        pressFade(state),
        {
          flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 17,
          backgroundColor: hover.hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <IconTile icon={icon} color={accent} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: hover.hovered ? accent : tone === "danger" ? danger.color : colors.text }}>
          {title}
        </Text>
        {hint ? <Text style={{ fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSecondary }}>{hint}</Text> : null}
      </View>
      <View
        style={[
          {
            width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center",
            backgroundColor: hover.hovered ? accent : "transparent",
          },
          hoverTransition,
        ]}
      >
        <Ionicons name="chevron-forward" size={17} color={hover.hovered ? "#ffffff" : colors.textMuted} />
      </View>
    </Pressable>
  );
}

// ─── Theme ───────────────────────────────────────────────────────────────────

type ThemeChoice = "light" | "dark" | "system";
const THEMES: { key: ThemeChoice; icon: IconName }[] = [
  { key: "light", icon: "sunny-outline" },
  { key: "dark", icon: "moon-outline" },
  { key: "system", icon: "phone-portrait-outline" },
];

/** A tiny drawing of the app in one palette: top bar, a card with a burgundy chip, two text lines. */
function MiniApp({ dark }: { dark: boolean }) {
  const p = getAppPalette(dark);
  return (
    <View style={{ flex: 1, backgroundColor: p.background, padding: 8, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: p.accent }} />
        <View style={{ height: 4, width: "45%", borderRadius: 2, backgroundColor: p.textMuted }} />
      </View>
      <View style={{ borderRadius: 7, padding: 6, gap: 4, backgroundColor: p.card, borderWidth: 1, borderColor: p.softBorder }}>
        <View style={{ height: 4, width: "70%", borderRadius: 2, backgroundColor: p.text, opacity: 0.75 }} />
        <View style={{ height: 8, width: 26, borderRadius: 4, backgroundColor: p.accent }} />
      </View>
      <View style={{ height: 3, width: "85%", borderRadius: 2, backgroundColor: p.textMuted, opacity: 0.6 }} />
      <View style={{ height: 3, width: "60%", borderRadius: 2, backgroundColor: p.textMuted, opacity: 0.6 }} />
    </View>
  );
}

function ThemeTile({ choice, icon, selected, large, onPress }: { choice: ThemeChoice; icon: IconName; selected: boolean; large: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      accessibilityLabel={`${t(`appearance.${choice}`)} — ${t(`appearance.${choice}Hint`)}`}
      style={(state) => [pressFade(state), { flex: 1, minWidth: 0 }]}
    >
      <View
        style={[
          {
            height: large ? 124 : 92, borderRadius: 16, overflow: "hidden", borderWidth: 2,
            borderColor: selected ? colors.accent : hover.hovered ? colors.border : colors.softBorder,
          },
          hoverTransition,
        ]}
      >
        {choice === "system" ? (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <MiniApp dark={false} />
            <MiniApp dark />
          </View>
        ) : (
          <MiniApp dark={choice === "dark"} />
        )}
        {selected ? (
          <View style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.accent }}>
            <Ionicons name="checkmark" size={14} color="#ffffff" />
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 9 }}>
        <Ionicons name={icon} size={15} color={selected ? colors.accent : colors.textSecondary} />
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: selected ? Fonts.bodyMedium : Fonts.body, fontSize: 13.5, color: selected ? colors.accent : colors.text }}>
          {t(`appearance.${choice}`)}
        </Text>
      </View>
    </Pressable>
  );
}

/** Light / Dark / System as little previews of the app; applies on tap. */
export function ThemePicker({ large = false }: { large?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const ctx = useContext(ThemeContext);
  const current = ctx?.theme ?? "system";
  return (
    <View>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: large ? 14 : 10 }}>
        {THEMES.map((theme) => (
          <ThemeTile key={theme.key} choice={theme.key} icon={theme.icon} selected={current === theme.key} large={large} onPress={() => ctx?.setTheme(theme.key)} />
        ))}
      </View>
      <Text style={{ marginTop: 10, fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSecondary, textAlign: "center" }}>
        {t(`appearance.${current}Hint`)}
      </Text>
    </View>
  );
}

// ─── Language ────────────────────────────────────────────────────────────────

/** Each language is named in itself, so people can always find their own. */
const LANGUAGES: { code: "bg" | "en"; badge: string; native: string }[] = [
  { code: "bg", badge: "БГ", native: "Български" },
  { code: "en", badge: "EN", native: "English" },
];

function LanguageTile({ code, badge, native, selected, onPress }: { code: "bg" | "en"; badge: string; native: string; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      accessibilityLabel={native}
      style={(state) => [
        pressFade(state),
        {
          flex: 1, minWidth: 0, alignItems: "center", paddingVertical: 14, paddingHorizontal: 10, borderRadius: 18, borderWidth: 2,
          borderColor: selected ? colors.accent : hover.hovered ? colors.border : colors.softBorder,
          backgroundColor: selected ? colors.accentTint : colors.card,
        },
        hoverTransition,
      ]}
    >
      <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: selected ? colors.accent : colors.mutedSurface }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, letterSpacing: 0.5, color: selected ? "#ffffff" : colors.textSecondary }}>{badge}</Text>
      </View>
      <Text numberOfLines={1} style={{ marginTop: 8, fontFamily: Fonts.bodyMedium, fontSize: 15, color: selected ? colors.accent : colors.text }}>{native}</Text>
      <Text numberOfLines={1} style={{ marginTop: 1, fontFamily: Fonts.body, fontSize: 12.5, color: colors.textSecondary }}>
        {/* The name in the current language, unless that just repeats the native name. */}
        {t(`languages.${code}`) === native ? t("settings.currentLanguage") : t(`languages.${code}`)}
      </Text>
      {selected ? (
        <View style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.accent }}>
          <Ionicons name="checkmark" size={14} color="#ffffff" />
        </View>
      ) : null}
    </Pressable>
  );
}

export function LanguagePicker() {
  const { i18n } = useTranslation();
  const current = i18n.language === "bg" ? "bg" : "en";
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 10 }}>
      {LANGUAGES.map((language) => (
        <LanguageTile key={language.code} {...language} selected={current === language.code} onPress={() => changeLanguage(language.code)} />
      ))}
    </View>
  );
}

/** Small uppercase label above a picker inside a section. */
export function FieldLabel({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <Text style={{ marginBottom: 10, paddingHorizontal: 2, fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.textMuted }}>
      {label}
    </Text>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FaqItem({ index, question, answer, open, onToggle }: { index: number; question: string; answer: string; open: boolean; onToggle: () => void }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <View style={{ borderRadius: 18, backgroundColor: open ? colors.card : "transparent", borderWidth: 1, borderColor: open ? colors.softBorder : "transparent" }}>
      <Pressable
        onPress={onToggle}
        {...hover}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        style={(state) => [
          pressFade(state),
          {
            flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 18,
            backgroundColor: hover.hovered && !open ? colors.mutedSurface : "transparent",
          },
          hoverTransition,
        ]}
      >
        <Text style={{ width: 26, fontFamily: Fonts.number, fontSize: 13, color: colors.accent }}>{String(index + 1).padStart(2, "0")}</Text>
        <Text style={{ flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: open || hover.hovered ? colors.accent : colors.text }}>
          {question}
        </Text>
        <View
          style={[
            { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: open ? colors.accent : colors.mutedSurface },
            hoverTransition,
          ]}
        >
          <Ionicons name={open ? "remove" : "add"} size={17} color={open ? "#ffffff" : colors.text} />
        </View>
      </Pressable>
      {open ? (
        <Text
          style={[
            { paddingLeft: 54, paddingRight: 18, paddingBottom: 16, marginTop: -4, fontFamily: Fonts.body, fontSize: 14.5, lineHeight: 23, color: colors.textSecondary },
            isWeb
              ? ({
                  animationKeyframes: { from: { opacity: 0, transform: [{ translateY: -4 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } },
                  animationDuration: "220ms", animationTimingFunction: "ease-out",
                } as any)
              : null,
          ]}
        >
          {answer}
        </Text>
      ) : null}
    </View>
  );
}

/** Questions that open one at a time, numbered like the program study topics. */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <View style={{ gap: 4 }}>
      {items.map((item, index) => (
        <FaqItem key={item.q} index={index} question={item.q} answer={item.a} open={open === index} onToggle={() => setOpen(open === index ? null : index)} />
      ))}
    </View>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

export function OutlineButton({ label, icon, onPress, tone, disabled }: { label: string; icon: IconName; onPress: () => void; tone?: "danger"; disabled?: boolean }) {
  const { colors } = useAppTheme();
  const danger = useDanger();
  const hover = useHover();
  const accent = tone === "danger" ? danger.color : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      {...hover}
      accessibilityRole="button"
      style={(state) => [
        pressFade(state),
        {
          height: 52, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
          borderColor: hover.hovered ? accent : tone === "danger" ? danger.color : colors.border,
          backgroundColor: hover.hovered ? (tone === "danger" ? danger.tint : colors.accentTint) : "transparent",
          opacity: disabled ? 0.6 : 1,
        },
        hoverTransition,
      ]}
    >
      <Ionicons name={icon} size={18} color={tone === "danger" ? danger.color : colors.text} />
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: tone === "danger" ? danger.color : colors.text }}>{label}</Text>
    </Pressable>
  );
}

// ─── Standalone screen shell ─────────────────────────────────────────────────

/**
 * Solid page-coloured strip behind the phone's status bar (clock, Dynamic
 * Island), so scrolled content disappears under it instead of behind the clock.
 * Renders nothing on web. Place it in an absolutely positioned top layer.
 */
export function StatusBarScrim() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  if (isWeb) return null;
  return <View style={{ height: insets.top, backgroundColor: colors.background }} />;
}

/**
 * Frame for the standalone settings screens: back pill, kicker, serif title,
 * intro and content in a readable column. Native gets the safe-area top inset
 * and keyboard avoidance (the profile editor has inputs).
 */
export function SettingsPage({
  kicker, title, intro, backLabel, maxWidth = 720, children,
}: {
  kicker: string; title: string; intro?: string; backLabel?: string; maxWidth?: number; children: ReactNode;
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/settings" as any));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 56 + (isWeb ? 0 : insets.bottom) }}
      >
        <ContentWrap maxWidth={maxWidth}>
          <View style={{ paddingHorizontal: 20, paddingTop: isWeb ? 32 : insets.top + 14 }}>
            <BackToSettingsButton label={backLabel} onPress={goBack} />
            <View style={{ marginTop: 22, marginBottom: 26 }}>
              <Kicker label={kicker} />
              <Text
                accessibilityRole="header"
                style={{ marginTop: 10, fontFamily: Fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: -0.4, color: colors.text }}
              >
                {title}
              </Text>
              {intro ? (
                <Text style={{ marginTop: 10, maxWidth: 560, fontFamily: Fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary }}>
                  {intro}
                </Text>
              ) : null}
            </View>
            {children}
          </View>
        </ContentWrap>
      </ScrollView>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <StatusBarScrim />
      </View>
    </KeyboardAvoidingView>
  );
}
