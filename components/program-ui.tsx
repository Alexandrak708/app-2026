import { useId, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { isWeb } from "@/components/responsive";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";

/**
 * Pieces shared by the program list (`app/university/project.tsx`), program
 * detail (`app/university/program/[programId].tsx`) and compare (`app/compare.tsx`)
 * screens: the university photo hero with its scrim, badges and back button,
 * plus web hover helpers.
 */

export const FILL = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as const;

/** How far the card row under a hero (glance strip / degree tiles) rides up over the photo. */
export const HERO_OVERLAP = 36;

/** Hover fades on web (react-native-web CSS props; native ignores them). */
export const hoverTransition = isWeb
  ? ({ transitionProperty: "background-color, border-color, opacity", transitionDuration: "160ms" } as any)
  : null;

export function useHover() {
  const [hovered, setHovered] = useState(false);
  return { hovered, onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false) };
}

/** Darkens the top (controls) and bottom (title) of a hero photo, fading into brand ink. */
export function HeroScrim() {
  // On web every gradient id lives in one document: the list and detail screens are
  // both mounted while the stack animates, and `url(#id)` resolving to the hidden
  // screen's gradient paints nothing. A per-instance id keeps them apart.
  const gradientId = `heroScrim${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <View pointerEvents="none" style={FILL}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.38" />
            <Stop offset="0.22" stopColor="#000000" stopOpacity="0.06" />
            <Stop offset="0.42" stopColor="#21030d" stopOpacity="0.32" />
            <Stop offset="0.7" stopColor="#21030d" stopOpacity="0.78" />
            <Stop offset="1" stopColor="#21030d" stopOpacity="0.94" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

export function HeroBackButton({ desktop, label, top, onPress }: { desktop: boolean; label: string; top: number; onPress: () => void }) {
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={[
        {
          position: "absolute", top, left: desktop ? 28 : 16, height: 42, minWidth: 42, maxWidth: desktop ? 420 : undefined,
          borderRadius: 21, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
          paddingHorizontal: desktop ? 16 : 0,
          backgroundColor: hover.hovered ? "#ffffff" : "rgba(255,255,255,0.9)",
        },
        hoverTransition,
      ]}
    >
      <Ionicons name={desktop ? "arrow-back" : "chevron-back"} size={desktop ? 18 : 21} color="#201f1d" />
      {desktop ? (
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: 14, color: "#201f1d" }}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

/**
 * The university photo with the scrim, a back button in the top-left corner and
 * `children` anchored to the bottom-left. `bottomInset` leaves room for the card
 * row that overlaps the hero's lower edge.
 */
export function PhotoHero({
  image, color, desktop, topInset, height, backLabel, onBack, children,
}: {
  image?: number;
  color?: string;
  desktop: boolean;
  topInset: number;
  height: number;
  backLabel: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        height,
        borderRadius: desktop ? 28 : 0,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        overflow: "hidden",
        backgroundColor: color ?? colors.inkSurface,
      }}
    >
      {image ? <ExpoImage source={image} style={FILL} contentFit="cover" transition={200} /> : null}
      <HeroScrim />
      <HeroBackButton desktop={desktop} label={backLabel} top={desktop ? 24 : topInset + 12} onPress={onBack} />
      <View style={{ position: "absolute", left: desktop ? 48 : 20, right: desktop ? 48 : 20, bottom: HERO_OVERLAP + (desktop ? 44 : 24) }}>
        {children}
      </View>
    </View>
  );
}

export function HeroBadge({ label, filled }: { label: string; filled?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
        backgroundColor: filled ? colors.beige : "rgba(255,255,255,0.14)",
        borderColor: filled ? colors.beige : "rgba(255,255,255,0.4)",
      }}
    >
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: filled ? colors.accentInk : "#ffffff" }}>
        {label}
      </Text>
    </View>
  );
}

/** Serif white headline for a hero; long titles step down a size. */
export function HeroTitle({ title, desktop }: { title: string; desktop: boolean }) {
  const long = title.length > 38;
  const size = desktop ? (long ? 50 : 62) : (long ? 32 : 40);
  return (
    <Text
      accessibilityRole="header"
      numberOfLines={3}
      style={{
        marginTop: desktop ? 16 : 12, fontFamily: Fonts.displayMedium, fontSize: size,
        lineHeight: size * 1.06, letterSpacing: -0.4, color: "#ffffff",
        textShadowColor: "rgba(0,0,0,0.35)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 14,
      }}
    >
      {title}
    </Text>
  );
}

/** "🎓 Технически университет · Варна" under a hero title. */
export function HeroUniversityLine({ text, desktop }: { text: string; desktop: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: desktop ? 14 : 10 }}>
      <Ionicons name="school-outline" size={desktop ? 18 : 16} color="rgba(255,255,255,0.85)" style={{ marginTop: 2 }} />
      <Text numberOfLines={2} style={{ flexShrink: 1, fontFamily: Fonts.body, fontSize: desktop ? 16 : 14, lineHeight: desktop ? 22 : 20, color: "rgba(255,255,255,0.88)" }}>
        {text}
      </Text>
    </View>
  );
}
