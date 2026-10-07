import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Pressable } from "@/components/pressable";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { buildUniversities } from "@/data/university-data";
import { buildProgramDetail, getProgramSummaries } from "@/data/university-programs";
import type { ProgramDetail, ProgramLevel, ProgramSummaryInfo, UniversityDisplay } from "@/types/university";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { ContentWrap, isWeb, useIsDesktopWeb } from "@/components/responsive";
import { FILL, HERO_OVERLAP, HeroBackButton, HeroScrim, hoverTransition, useHover } from "@/components/program-ui";
import { durationHeadline, isFreeTuition, programIcon, splitTopics, tuitionHeadline } from "@/lib/program-facts";
import { cityOf } from "@/lib/university-groups";

type IconName = keyof typeof Ionicons.glyphMap;
/** 0 = the left university (burgundy), 1 = the right one (sand). */
type Side = 0 | 1;
type SelectedProgram = { level: ProgramLevel; slug: string };
type Suggestion = { program: ProgramSummaryInfo; level: ProgramLevel };
type CellValue = { text: string; icon?: IconName; tone?: "accent" | "muted" };

/** Phone layout column (native + narrow web) and the desktop web page width. */
const PHONE_MAX_WIDTH = 720;
const DESKTOP_MAX_WIDTH = 1200;
const LEVELS: ProgramLevel[] = ["bachelor", "master"];

/** The "Key Facts" numbers every university has; drawn as a head-to-head bar chart. */
const NUMBER_METRICS: { key: string; label: string; icon: IconName }[] = [
  { key: "yearsTradition", label: "universityStats.yearsTradition", icon: "hourglass-outline" },
  { key: "bachelorPrograms", label: "universityStats.bachelorPrograms", icon: "school-outline" },
  { key: "masterPrograms", label: "universityStats.masterPrograms", icon: "ribbon-outline" },
  { key: "internationalPartners", label: "universityStats.internationalPartners", icon: "globe-outline" },
  { key: "countries", label: "compare.countries", icon: "flag-outline" },
  { key: "studentsGraduated", label: "universityStats.studentsGraduated", icon: "people-outline" },
];

/** Fade + rise for blocks that appear after a pick (web CSS animation; native ignores it). */
const fadeUp = isWeb
  ? ({
      animationKeyframes: { from: { opacity: 0, transform: [{ translateY: 14 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } },
      animationDuration: "460ms",
      animationTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      animationFillMode: "both",
    } as any)
  : null;

/**
 * The two colours that tell the universities apart everywhere on the page:
 * burgundy for the left one, sand for the right. `text` variants stay readable
 * on light surfaces; `tint` is for card backgrounds.
 */
function useSides() {
  const { colors, isDark } = useAppTheme();
  return {
    fill: [colors.accent, colors.beige] as const,
    text: [colors.accent, isDark ? "#d9b99a" : "#8a6440"] as const,
    tint: [colors.accentTint, isDark ? "rgba(217,185,154,0.12)" : "rgba(194,154,116,0.16)"] as const,
  };
}

/** "60K+" → 60000, "2 000" → 2000, "140+" → 140; NaN when there is no number in it. */
function statNumber(value?: string) {
  const match = value?.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)([KК])?/i);
  if (!match) return NaN;
  return parseFloat(match[1].replace(",", ".")) * (match[2] ? 1000 : 1);
}

/** Word stems too common in program titles to say two programs are alike. */
const GENERIC_STEMS = new Set(["прило", "систе", "техно", "специ", "appli", "syste", "techn", "studi"]);

function titleStems(title: string) {
  return new Set(
    title
      .toLocaleLowerCase()
      .split(/[^a-zа-я0-9]+/)
      .filter((word) => word.length >= 4)
      .map((word) => word.slice(0, 5))
      .filter((stem) => !GENERIC_STEMS.has(stem)),
  );
}

/**
 * Programs at `universityId` that look like `title` (picked at the other
 * university): shared word stems count most, then the same field icon, and the
 * same degree level breaks ties.
 */
function similarPrograms(title: string, level: ProgramLevel, universityId: string, limit: number): Suggestion[] {
  const target = titleStems(title);
  const icon = programIcon(title);
  return LEVELS.flatMap((l) => getProgramSummaries(universityId, l).map((program) => ({ program, level: l })))
    .map((entry) => {
      let score = 0;
      for (const stem of titleStems(entry.program.title)) if (target.has(stem)) score += 2;
      if (icon !== "school-outline" && programIcon(entry.program.title) === icon) score += 1;
      if (score > 0 && entry.level === level) score += 0.5;
      return { ...entry, score };
    })
    .filter((entry) => entry.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ program, level: l }) => ({ program, level: l }));
}

/** "от 325-375 лв./сем" / "191.00 €" — the short price for a program; null when unknown. */
function priceLabel(tuition: string | undefined, t: TFunction) {
  const price = tuitionHeadline(tuition);
  if (!price) return null;
  return price.hasMore ? t("programDetail.fromPrice", { price: price.price }) : price.price;
}

// ─── Small pieces ────────────────────────────────────────────────────────────

function Kicker({ label, color, center }: { label: string; color: string; center?: boolean }) {
  return (
    <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color, textAlign: center ? "center" : "left" }}>
      {label}
    </Text>
  );
}

function SideDot({ side, size = 10, ring }: { side: Side; size?: number; ring?: string }) {
  const sides = useSides();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: sides.fill[side],
        borderWidth: ring ? 2 : 0, borderColor: ring,
      }}
    />
  );
}

/** Round university photo with a ring in its side colour. */
function Thumb({ uni, side, size }: { uni: UniversityDisplay; side: Side; size: number }) {
  const sides = useSides();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, padding: 2, backgroundColor: sides.fill[side] }}>
      <View style={{ flex: 1, borderRadius: size / 2, overflow: "hidden", backgroundColor: uni.color }}>
        <ExpoImage source={uni.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      </View>
    </View>
  );
}

function ProgramIconTile({ title, size, side }: { title: string; size: number; side?: Side }) {
  const { colors } = useAppTheme();
  const sides = useSides();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size * 0.3, alignItems: "center", justifyContent: "center",
        backgroundColor: side == null ? colors.accentTint : sides.tint[side],
      }}
    >
      <Ionicons name={programIcon(title)} size={size * 0.46} color={side == null ? colors.accent : sides.text[side]} />
    </View>
  );
}

function MiniBadge({ label, accent }: { label: string; accent?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: accent ? colors.accentTint : colors.mutedSurface }}>
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 10.5, letterSpacing: 0.3, color: accent ? colors.accent : colors.textSecondary }}>{label}</Text>
    </View>
  );
}

/** The burgundy "vs" coin; on web a soft ring keeps pulsing out of it. */
function VsMedallion({ size }: { size: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {isWeb ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: colors.beige,
            animationKeyframes: { from: { opacity: 0.8, transform: [{ scale: 1 }] }, to: { opacity: 0, transform: [{ scale: 1.8 }] } },
            animationDuration: "2600ms", animationIterationCount: "infinite", animationTimingFunction: "ease-out",
          } as any}
        />
      ) : null}
      <View
        style={{
          width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center",
          backgroundColor: colors.accentInk, borderWidth: 2, borderColor: colors.beige,
          shadowColor: "#000000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10,
        }}
      >
        <Text style={{ fontFamily: Fonts.displayItalic, fontSize: size * 0.42, lineHeight: size * 0.52, color: colors.beige, marginTop: -size * 0.05 }}>
          vs
        </Text>
      </View>
    </View>
  );
}

/** Centred kicker (between two short rules) + serif title + optional hint. */
function SectionHeading({ kicker, title, hint, desktop }: { kicker: string; title: string; hint?: string; desktop: boolean }) {
  const { colors } = useAppTheme();
  const rule = <View style={{ width: desktop ? 32 : 20, height: 1, backgroundColor: colors.accent, opacity: 0.5 }} />;
  return (
    <View style={{ alignItems: "center", marginBottom: desktop ? 26 : 18, paddingHorizontal: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {rule}
        <Kicker label={kicker} color={colors.accent} />
        {rule}
      </View>
      <Text
        accessibilityRole="header"
        style={{ marginTop: 10, fontFamily: Fonts.heading, fontSize: desktop ? 38 : 28, lineHeight: desktop ? 42 : 32, color: colors.text, textAlign: "center" }}
      >
        {title}
      </Text>
      {hint ? (
        <Text style={{ marginTop: 8, maxWidth: 520, fontFamily: Fonts.body, fontSize: desktop ? 15 : 13.5, lineHeight: desktop ? 23 : 20, color: colors.textSecondary, textAlign: "center" }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Raised card that holds head-to-head rows; rows get a rounded hover wash inside it. */
function Card({ children, desktop, raised, style }: { children: ReactNode; desktop: boolean; raised?: boolean; style?: object }) {
  const { colors, isDark } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card, borderRadius: desktop ? 26 : 22, borderWidth: 1, borderColor: colors.softBorder,
          padding: desktop ? 10 : 6,
        },
        raised
          ? {
              shadowColor: "#21030d", shadowOffset: { width: 0, height: 12 },
              shadowOpacity: isDark ? 0.45 : 0.12, shadowRadius: 28, elevation: 8,
            }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function RowDivider() {
  const { colors } = useAppTheme();
  return <View style={{ height: 1, marginHorizontal: 14, backgroundColor: colors.softBorder }} />;
}

/** Hover state for plain views; web only, so a finger on a phone never leaves a row lit. */
function usePointerHover() {
  const [hovered, setHovered] = useState(false);
  const props = isWeb ? { onPointerEnter: () => setHovered(true), onPointerLeave: () => setHovered(false) } : {};
  return { hovered, props };
}

/** Touch feedback for pressables (phones have no hover). */
const pressFade = ({ pressed }: { pressed: boolean }) => (pressed ? { opacity: 0.82 } : null);

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroHalf({ uni, side, desktop, onPress }: { uni: UniversityDisplay; side: Side; desktop: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  const end = side === 1;
  const long = uni.name.length > 30;
  const size = desktop ? (long ? 36 : 44) : long ? 19 : 22;

  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="link"
      accessibilityLabel={`${t("compare.viewProfile")}: ${uni.name}`}
      style={(state) => [{ flex: 1, overflow: "hidden", backgroundColor: uni.color }, pressFade(state)]}
    >
      <View
        style={[
          FILL,
          isWeb
            ? ({
                transform: [{ scale: hover.hovered ? 1.06 : 1 }],
                transitionProperty: "transform", transitionDuration: "900ms", transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
              } as any)
            : null,
        ]}
      >
        <ExpoImage source={uni.image} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={200} />
      </View>
      <HeroScrim />

      <View
        style={{
          position: "absolute", left: desktop ? 44 : 16, right: desktop ? 44 : 16, bottom: HERO_OVERLAP + (desktop ? 40 : 22),
          alignItems: end ? "flex-end" : "flex-start",
        }}
      >
        <View style={{ flexDirection: end ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
          <SideDot side={side} size={desktop ? 13 : 11} ring="#ffffff" />
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 12 : 10.5, letterSpacing: 1.6, textTransform: "uppercase",
              color: "#ead3bd", textShadowColor: "rgba(0,0,0,0.55)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8,
            }}
          >
            {cityOf(uni)}
          </Text>
        </View>
        <Text
          numberOfLines={3}
          style={{
            marginTop: desktop ? 12 : 8, maxWidth: desktop ? 440 : undefined,
            fontFamily: Fonts.displayMedium, fontSize: size, lineHeight: size * 1.08, letterSpacing: -0.3,
            color: "#ffffff", textAlign: end ? "right" : "left",
            textShadowColor: "rgba(0,0,0,0.35)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 14,
          }}
        >
          {uni.name}
        </Text>
        {desktop ? (
          <Text numberOfLines={1} style={{ marginTop: 8, fontFamily: Fonts.body, fontSize: 15, color: "rgba(255,255,255,0.82)", textAlign: end ? "right" : "left" }}>
            {t(`categories.${uni.category}`)}
          </Text>
        ) : null}
        <View
          style={[
            {
              marginTop: desktop ? 18 : 10, height: desktop ? 38 : 30, paddingHorizontal: desktop ? 16 : 11, borderRadius: 19,
              flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1,
              backgroundColor: hover.hovered ? "#ffffff" : "rgba(255,255,255,0.14)",
              borderColor: hover.hovered ? "#ffffff" : "rgba(255,255,255,0.42)",
            },
            hoverTransition,
          ]}
        >
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: desktop ? 13.5 : 11.5, color: hover.hovered ? colors.accentInk : "#ffffff" }}>
            {t("compare.viewProfile")}
          </Text>
          <Ionicons name="arrow-forward" size={desktop ? 15 : 13} color={hover.hovered ? colors.accentInk : "#ffffff"} />
        </View>
      </View>
    </Pressable>
  );
}

/** Two university photos side by side, split by an ink seam with the "vs" coin on it. */
function CompareHero({
  a, b, desktop, topInset, height, onBack, onOpen,
}: {
  a: UniversityDisplay;
  b: UniversityDisplay;
  desktop: boolean;
  topInset: number;
  height: number;
  onBack: () => void;
  onOpen: (uni: UniversityDisplay) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const vs = desktop ? 76 : 54;

  return (
    <View
      style={{
        height, flexDirection: "row", gap: 3, overflow: "hidden", backgroundColor: colors.accentInk,
        borderRadius: desktop ? 28 : 0, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}
    >
      <HeroHalf uni={a} side={0} desktop={desktop} onPress={() => onOpen(a)} />
      <HeroHalf uni={b} side={1} desktop={desktop} onPress={() => onOpen(b)} />

      <View pointerEvents="none" style={{ position: "absolute", top: desktop ? 30 : topInset + 18, left: 0, right: 0, alignItems: "center" }}>
        <View
          style={{
            height: 30, paddingHorizontal: 14, borderRadius: 15, justifyContent: "center",
            backgroundColor: "rgba(33,3,13,0.55)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
          }}
        >
          <Kicker label={t("compare.kicker")} color={colors.beige} />
        </View>
      </View>

      <View pointerEvents="none" style={{ position: "absolute", left: "50%", top: desktop ? 140 : topInset + 72, marginLeft: -vs / 2 }}>
        <VsMedallion size={vs} />
      </View>

      <HeroBackButton desktop={desktop} label={t("compare.goBack")} top={desktop ? 24 : topInset + 12} onPress={onBack} />
    </View>
  );
}

/** Slim bar that slides in once the hero scrolls away, so you always know which side is which. */
function StickyBar({ a, b, desktop, topInset, onBack }: { a: UniversityDisplay; b: UniversityDisplay; desktop: boolean; topInset: number; onBack: () => void }) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const back = useHover();

  const name = (uni: UniversityDisplay, side: Side) => (
    <View style={{ flex: 1, minWidth: 0, flexDirection: side === 0 ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
      <Thumb uni={uni} side={side} size={desktop ? 36 : 30} />
      <Text
        numberOfLines={desktop ? 1 : 2}
        style={{
          flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 14.5 : 11.5, lineHeight: desktop ? 20 : 14.5,
          color: colors.text, textAlign: side === 0 ? "right" : "left",
        }}
      >
        {uni.name}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        {
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 30, paddingTop: topInset,
          backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.softBorder,
          shadowColor: "#21030d", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.4 : 0.08, shadowRadius: 20, elevation: 6,
        },
        isWeb
          ? ({
              animationKeyframes: { from: { opacity: 0, transform: [{ translateY: -12 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } },
              animationDuration: "220ms", animationTimingFunction: "ease-out",
            } as any)
          : null,
      ]}
    >
      <ContentWrap maxWidth={desktop ? DESKTOP_MAX_WIDTH : PHONE_MAX_WIDTH} style={{ paddingHorizontal: desktop ? 32 : 0 }}>
        <View style={{ height: desktop ? 64 : 56, flexDirection: "row", alignItems: "center", gap: desktop ? 14 : 8, paddingHorizontal: desktop ? 0 : 12 }}>
          <Pressable
            onPress={onBack}
            {...back}
            accessibilityRole="button"
            accessibilityLabel={t("compare.goBack")}
            hitSlop={6}
            style={[
              {
                width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1,
                borderColor: back.hovered ? colors.accent : colors.border, backgroundColor: back.hovered ? colors.accentTint : "transparent",
              },
              hoverTransition,
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>
          {name(a, 0)}
          <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentInk }}>
            <Text style={{ fontFamily: Fonts.displayItalic, fontSize: 14, lineHeight: 17, color: colors.beige, marginTop: -2 }}>vs</Text>
          </View>
          {name(b, 1)}
          {/* Balances the back button so the "vs" sits in the middle. */}
          <View style={{ width: 38 }} />
        </View>
      </ContentWrap>
    </View>
  );
}

// ─── Head-to-head rows ───────────────────────────────────────────────────────

function Value({ value, side, desktop, lines }: { value: CellValue; side: Side; desktop: boolean; lines?: number }) {
  const { colors } = useAppTheme();
  const color = value.tone === "accent" ? colors.accent : value.tone === "muted" ? colors.textMuted : colors.text;
  // Values hug the centre column: the left one is right-aligned, the right one left-aligned.
  return (
    <View style={{ flexDirection: side === 0 ? "row-reverse" : "row", alignItems: "center", gap: 6, maxWidth: "100%" }}>
      {value.icon ? <Ionicons name={value.icon} size={desktop ? 17 : 15} color={color} /> : null}
      <Text
        numberOfLines={lines}
        style={{ flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 16.5 : 14, lineHeight: desktop ? 23 : 19, color, textAlign: side === 0 ? "right" : "left" }}
      >
        {value.text}
      </Text>
    </View>
  );
}

/** One "value · icon + label · value" row. */
function VersusRow({ icon, label, a, b, desktop, lines }: { icon: IconName; label: string; a: CellValue; b: CellValue; desktop: boolean; lines?: number }) {
  const { colors } = useAppTheme();
  const { hovered, props } = usePointerHover();
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: "row", alignItems: "center", borderRadius: 16,
          paddingVertical: desktop ? 16 : 13, paddingHorizontal: desktop ? 24 : 8,
          backgroundColor: hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Value value={a} side={0} desktop={desktop} lines={lines} />
      </View>
      <View style={{ width: desktop ? 210 : 106, alignItems: "center", paddingHorizontal: desktop ? 12 : 0 }}>
        <View
          style={[
            {
              width: desktop ? 40 : 32, height: desktop ? 40 : 32, borderRadius: 999, alignItems: "center", justifyContent: "center",
              backgroundColor: hovered ? colors.accent : colors.accentTint,
            },
            hoverTransition,
          ]}
        >
          <Ionicons name={icon} size={desktop ? 18 : 15} color={hovered ? "#ffffff" : colors.accent} />
        </View>
        {/* Small caps on desktop; phones keep normal case so long words ("Продължителност") fit the column. */}
        <Text
          numberOfLines={2}
          style={{
            marginTop: 6, fontFamily: Fonts.bodyMedium, fontSize: 10.5, lineHeight: 14,
            letterSpacing: desktop ? 1.2 : 0, textTransform: desktop ? "uppercase" : "none", textAlign: "center", color: colors.textMuted,
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flex: 1, alignItems: "flex-start" }}>
        <Value value={b} side={1} desktop={desktop} lines={lines} />
      </View>
    </View>
  );
}

type VersusRowData = { icon: IconName; label: string; a: CellValue; b: CellValue };

function VersusRows({ rows, desktop, lines }: { rows: VersusRowData[]; desktop: boolean; lines?: number }) {
  return (
    <>
      {rows.map((row, index) => (
        <View key={row.label}>
          {index ? <RowDivider /> : null}
          <VersusRow {...row} desktop={desktop} lines={lines} />
        </View>
      ))}
    </>
  );
}

/** A bar that grows out from the chart's centre line once the chart scrolls into view. */
function GrowBar({ share, color, anchor, revealed, delay, thick }: { share: number; color: string; anchor: "start" | "end"; revealed: boolean; delay: number; thick: number }) {
  const { colors } = useAppTheme();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!revealed) return;
    const animation = Animated.timing(progress, {
      toValue: share, duration: 1000, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [revealed, share, delay, progress]);

  return (
    <View
      style={{
        flex: 1, height: thick, borderRadius: thick / 2, overflow: "hidden", flexDirection: "row",
        justifyContent: anchor === "end" ? "flex-end" : "flex-start", backgroundColor: colors.softBorder,
      }}
    >
      <Animated.View
        style={{
          height: "100%", borderRadius: thick / 2, backgroundColor: color,
          width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
        }}
      />
    </View>
  );
}

/** "140+ ━━━━━━━━|━━━━━ 110+": the bigger number gets its side colour. */
function DuelRow({
  icon, label, a, b, desktop, revealed, delay,
}: {
  icon: IconName; label: string; a: string; b: string; desktop: boolean; revealed: boolean; delay: number;
}) {
  const { colors } = useAppTheme();
  const sides = useSides();
  const { hovered, props } = usePointerHover();

  const na = statNumber(a);
  const nb = statNumber(b);
  const max = Math.max(na, nb);
  const hasBars = Number.isFinite(na) && Number.isFinite(nb) && max > 0;
  const share = (n: number) => (hasBars ? Math.max(n / max, n > 0 ? 0.05 : 0) : 0);
  const lead: Side | null = hasBars && na !== nb ? (na > nb ? 0 : 1) : null;
  const thick = desktop ? 12 : 9;

  const value = (text: string, side: Side) => (
    <Text
      numberOfLines={1}
      style={{
        width: desktop ? 84 : 58, fontFamily: Fonts.number, fontSize: desktop ? 20 : 15.5,
        textAlign: side === 0 ? "left" : "right", color: lead === side ? sides.text[side] : colors.text,
      }}
    >
      {text}
    </Text>
  );

  const caption = (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <Ionicons name={icon} size={desktop ? 15 : 13} color={hovered ? colors.accent : colors.textMuted} />
      <Text
        numberOfLines={2}
        style={{
          flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 10.5 : 9.5, lineHeight: desktop ? 14 : 13,
          letterSpacing: 1.1, textTransform: "uppercase", textAlign: "center", color: hovered ? colors.text : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );

  const barA = <GrowBar share={share(na)} color={sides.fill[0]} anchor="end" revealed={revealed} delay={delay} thick={thick} />;
  const barB = <GrowBar share={share(nb)} color={sides.fill[1]} anchor="start" revealed={revealed} delay={delay + 70} thick={thick} />;

  return (
    <View
      {...props}
      style={[
        {
          borderRadius: 16, paddingVertical: desktop ? 15 : 12, paddingHorizontal: desktop ? 18 : 10,
          backgroundColor: hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      {desktop ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {value(a, 0)}
          {barA}
          <View style={{ width: 200 }}>{caption}</View>
          {barB}
          {value(b, 1)}
        </View>
      ) : (
        <>
          {caption}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 }}>
            {value(a, 0)}
            {barA}
            <View style={{ width: 2, height: 16, borderRadius: 1, backgroundColor: colors.divider }} />
            {barB}
            {value(b, 1)}
          </View>
        </>
      )}
    </View>
  );
}

/** "● Military Academy ……… Naval University ●" — which colour is which. */
function Legend({ a, b, desktop }: { a: UniversityDisplay; b: UniversityDisplay; desktop: boolean }) {
  const { colors } = useAppTheme();
  const item = (uni: UniversityDisplay, side: Side) => (
    <View style={{ flex: 1, minWidth: 0, flexDirection: side === 0 ? "row" : "row-reverse", alignItems: "center", gap: 8 }}>
      <SideDot side={side} size={desktop ? 12 : 10} />
      <Text
        numberOfLines={1}
        style={{ flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 13.5 : 12, color: colors.textSecondary, textAlign: side === 0 ? "left" : "right" }}
      >
        {uni.name}
      </Text>
    </View>
  );
  return (
    <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: desktop ? 18 : 10, paddingTop: desktop ? 12 : 10, paddingBottom: desktop ? 8 : 4 }}>
      {item(a, 0)}
      {item(b, 1)}
    </View>
  );
}

/** One university's two "signature" stats (their own labels), on a card in its side colour. */
function StandoutCard({ uni, side, facts, desktop }: { uni: UniversityDisplay; side: Side; facts: { value: string; label: string }[]; desktop: boolean }) {
  const { colors } = useAppTheme();
  const sides = useSides();
  return (
    <View style={{ flex: 1, minWidth: 0, borderRadius: desktop ? 26 : 22, padding: desktop ? 26 : 16, overflow: "hidden", backgroundColor: sides.tint[side] }}>
      <View pointerEvents="none" style={{ position: "absolute", right: desktop ? -20 : -28, bottom: desktop ? -30 : -30, opacity: 0.12 }}>
        <Ionicons name="sparkles" size={desktop ? 160 : 112} color={sides.fill[side]} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: desktop ? 12 : 9 }}>
        <Thumb uni={uni} side={side} size={desktop ? 42 : 32} />
        <Text numberOfLines={2} style={{ flex: 1, fontFamily: Fonts.heading, fontSize: desktop ? 21 : 15.5, lineHeight: desktop ? 24 : 18.5, color: colors.text }}>
          {uni.name}
        </Text>
      </View>
      <View style={{ marginTop: desktop ? 24 : 16, gap: desktop ? 24 : 14, flexDirection: desktop ? "row" : "column" }}>
        {facts.map((fact) => (
          <View key={fact.label} style={desktop ? { flex: 1 } : undefined}>
            <Text style={{ fontFamily: Fonts.number, fontSize: desktop ? 32 : 22, lineHeight: desktop ? 38 : 27, color: sides.text[side] }}>{fact.value}</Text>
            <Text style={{ marginTop: 3, fontFamily: Fonts.body, fontSize: desktop ? 14 : 12.5, lineHeight: desktop ? 20 : 17, color: colors.textSecondary }}>
              {fact.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Programs ────────────────────────────────────────────────────────────────

function SlotButton({ label, icon, onPress, solid, side }: { label?: string; icon: IconName; onPress: () => void; solid?: boolean; side: Side }) {
  const { colors } = useAppTheme();
  const sides = useSides();
  const hover = useHover();
  const filled = solid || hover.hovered;
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(state) => [
        pressFade(state),
        {
          height: 38, minWidth: 38, paddingHorizontal: label ? 13 : 0, borderRadius: 19, borderWidth: 1,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
          borderColor: solid ? colors.solid : hover.hovered ? sides.fill[side] : colors.border,
          backgroundColor: solid ? colors.solid : filled ? sides.tint[side] : "transparent",
        },
        hoverTransition,
      ]}
    >
      <Ionicons name={icon} size={15} color={solid ? colors.onSolid : colors.text} />
      {label ? <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: solid ? colors.onSolid : colors.text }}>{label}</Text> : null}
    </Pressable>
  );
}

/** One university's program slot: a dashed "pick a program" prompt, or the picked program. */
function ProgramSlot({
  uni, side, detail, desktop, total, onPick, onOpen,
}: {
  uni: UniversityDisplay; side: Side; detail: ProgramDetail | null; desktop: boolean; total: number; onPick: () => void; onOpen: () => void;
}) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const sides = useSides();
  const hover = useHover();

  const header = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, paddingHorizontal: 4 }}>
      <SideDot side={side} />
      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 13 : 11.5, color: colors.textSecondary }}>
        {uni.name}
      </Text>
    </View>
  );

  if (!detail) {
    return (
      <View style={{ flex: 1, minWidth: 0 }}>
        {header}
        <Pressable
          onPress={onPick}
          {...hover}
          accessibilityRole="button"
          accessibilityLabel={`${t("compare.selectProgram")}: ${uni.name}`}
          style={(state) => [
            pressFade(state),
            {
              flexGrow: 1, minHeight: desktop ? 220 : 178, borderRadius: desktop ? 24 : 20, borderWidth: 1.5, borderStyle: "dashed",
              borderColor: hover.hovered ? sides.fill[side] : isDark ? "rgba(255,255,255,0.24)" : "rgba(32,31,29,0.24)",
              backgroundColor: hover.hovered ? sides.tint[side] : colors.card,
              alignItems: "center", justifyContent: "center", padding: 16, gap: 10,
            },
            hoverTransition,
          ]}
        >
          <View
            style={[
              {
                width: desktop ? 58 : 48, height: desktop ? 58 : 48, borderRadius: 999, alignItems: "center", justifyContent: "center",
                backgroundColor: hover.hovered ? sides.fill[side] : sides.tint[side],
              },
              hoverTransition,
            ]}
          >
            <Ionicons name="add" size={desktop ? 28 : 24} color={hover.hovered ? "#ffffff" : sides.text[side]} />
          </View>
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: desktop ? 15.5 : 13.5, color: colors.text, textAlign: "center" }}>
            {t("compare.selectProgram")}
          </Text>
          {total > 0 ? (
            <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
              {t("programs.programCount", { count: total })}
            </Text>
          ) : null}
        </Pressable>
      </View>
    );
  }

  const free = isFreeTuition(detail.tuition);
  const levelLabel = detail.level === "master" ? t("degrees.Master") : t("degrees.Bachelor");

  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      {header}
      <View
        style={[
          {
            flexGrow: 1, minHeight: desktop ? 220 : 178, borderRadius: desktop ? 24 : 20, padding: desktop ? 20 : 14,
            backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder, borderTopWidth: 4, borderTopColor: sides.fill[side],
          },
          fadeUp,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <ProgramIconTile title={detail.title} size={desktop ? 44 : 34} side={side} />
          <MiniBadge label={levelLabel} />
          {free ? <MiniBadge label={t("programDetail.free")} accent /> : null}
        </View>
        <Text numberOfLines={4} style={{ marginTop: 12, fontFamily: Fonts.heading, fontSize: desktop ? 23 : 17, lineHeight: desktop ? 27 : 20.5, color: colors.text }}>
          {detail.title}
        </Text>
        {detail.faculty ? (
          <Text numberOfLines={2} style={{ marginTop: 4, fontFamily: Fonts.body, fontSize: desktop ? 13 : 11.5, lineHeight: desktop ? 18 : 16, color: colors.textMuted }}>
            {detail.faculty}
          </Text>
        ) : null}
        <View style={{ flexGrow: 1 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          <SlotButton icon="swap-horizontal" label={t("compare.change")} onPress={onPick} side={side} />
          <SlotButton icon="arrow-forward" label={desktop ? t("compare.openProgram") : undefined} onPress={onOpen} solid side={side} />
        </View>
      </View>
    </View>
  );
}

function SuggestionChip({ suggestion, side, onPress }: { suggestion: Suggestion; side: Side; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const sides = useSides();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      accessibilityLabel={suggestion.program.title}
      style={(state) => [
        pressFade(state),
        {
          flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingLeft: 8, paddingRight: 12, borderRadius: 16,
          maxWidth: "100%", borderWidth: 1, backgroundColor: colors.card,
          borderColor: hover.hovered ? sides.fill[side] : colors.softBorder,
        },
        hoverTransition,
      ]}
    >
      <ProgramIconTile title={suggestion.program.title} size={30} side={side} />
      <View style={{ flexShrink: 1 }}>
        <Text numberOfLines={2} style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: hover.hovered ? sides.text[side] : colors.text }}>
          {suggestion.program.title}
        </Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 11, color: colors.textMuted }}>
          {suggestion.level === "master" ? t("degrees.Master") : t("degrees.Bachelor")}
        </Text>
      </View>
      <Ionicons name="add-circle" size={20} color={sides.fill[side]} />
    </Pressable>
  );
}

/** "Similar programs" quick picks for the empty side, based on the side already picked. */
function SuggestionStrip({ side, items, desktop, onPick }: { side: Side; items: Suggestion[]; desktop: boolean; onPick: (s: Suggestion) => void }) {
  const { t } = useTranslation();
  const sides = useSides();
  const { colors } = useAppTheme();
  return (
    <View style={[{ marginTop: desktop ? 18 : 14, borderRadius: desktop ? 22 : 20, padding: desktop ? 18 : 14, backgroundColor: sides.tint[side] }, fadeUp]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="sparkles" size={15} color={sides.text[side]} />
        <Kicker label={t("compare.similar")} color={sides.text[side]} />
      </View>
      <Text style={{ marginTop: 4, fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textSecondary }}>{t("compare.similarHint")}</Text>
      <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => (
          <SuggestionChip key={`${item.level}-${item.program.slug}`} suggestion={item} side={side} onPress={() => onPick(item)} />
        ))}
      </View>
    </View>
  );
}

/** A centred caption with each university's take on it underneath, split by a hairline. */
function SplitCard({ icon, title, left, right, desktop }: { icon: IconName; title: string; left: ReactNode; right: ReactNode; desktop: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Card desktop={desktop}>
      <View style={{ alignItems: "center", paddingTop: desktop ? 14 : 12, paddingBottom: desktop ? 10 : 8 }}>
        <View style={{ width: desktop ? 40 : 32, height: desktop ? 40 : 32, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
          <Ionicons name={icon} size={desktop ? 18 : 15} color={colors.accent} />
        </View>
        <Text style={{ marginTop: 6, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 10.5 : 9.5, letterSpacing: 1.2, textTransform: "uppercase", color: colors.textMuted }}>
          {title}
        </Text>
      </View>
      <View style={{ flexDirection: "row", paddingHorizontal: desktop ? 14 : 6, paddingBottom: desktop ? 16 : 10 }}>
        <View style={{ flex: 1, minWidth: 0, alignItems: "flex-end", paddingRight: desktop ? 20 : 10 }}>{left}</View>
        <View style={{ width: 1, backgroundColor: colors.softBorder }} />
        <View style={{ flex: 1, minWidth: 0, alignItems: "flex-start", paddingLeft: desktop ? 20 : 10 }}>{right}</View>
      </View>
    </Card>
  );
}

/** Study topics as chips (mirrored towards the centre); a lone sentence stays text. */
function TopicChips({ keyFocus, side, desktop }: { keyFocus: string; side: Side; desktop: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const sides = useSides();
  const topics = splitTopics(keyFocus);
  const limit = desktop ? 8 : 6;

  if (topics.length < 2) {
    return (
      <Text style={{ fontFamily: Fonts.body, fontSize: desktop ? 14.5 : 12.5, lineHeight: desktop ? 22 : 18, color: colors.textSecondary, textAlign: side === 0 ? "right" : "left" }}>
        {topics[0] ?? keyFocus}
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: side === 0 ? "flex-end" : "flex-start" }}>
      {topics.slice(0, limit).map((topic) => (
        // A pill on one line; a long topic that wraps becomes a rounded box (a 999 radius would cut into its lines).
        <View key={topic} style={{ paddingHorizontal: desktop ? 12 : 10, paddingVertical: desktop ? 6 : 5, borderRadius: desktop ? 17 : 14, backgroundColor: sides.tint[side], maxWidth: "100%" }}>
          <Text style={{ fontFamily: Fonts.body, fontSize: desktop ? 13 : 11.5, lineHeight: desktop ? 18 : 15.5, color: colors.text }}>{topic}</Text>
        </View>
      ))}
      {topics.length > limit ? (
        <View style={{ paddingHorizontal: 9, paddingVertical: desktop ? 6 : 5 }}>
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: desktop ? 12.5 : 11, color: colors.textMuted }}>{t("compare.more", { count: topics.length - limit })}</Text>
        </View>
      ) : null}
    </View>
  );
}

function CareerList({ items, side, desktop }: { items: string[]; side: Side; desktop: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const sides = useSides();
  const limit = 5;
  if (!items.length) return <Text style={{ fontFamily: Fonts.body, color: colors.textMuted }}>—</Text>;
  return (
    <View style={{ gap: desktop ? 10 : 8, alignItems: side === 0 ? "flex-end" : "flex-start" }}>
      {items.slice(0, limit).map((career) => (
        <View key={career} style={{ flexDirection: side === 0 ? "row-reverse" : "row", alignItems: "flex-start", gap: 8, maxWidth: "100%" }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, marginTop: desktop ? 8 : 6, backgroundColor: sides.fill[side] }} />
          <Text style={{ flexShrink: 1, fontFamily: Fonts.body, fontSize: desktop ? 14.5 : 12.5, lineHeight: desktop ? 21 : 17.5, color: colors.text, textAlign: side === 0 ? "right" : "left" }}>
            {career}
          </Text>
        </View>
      ))}
      {items.length > limit ? (
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, color: colors.textMuted }}>{t("compare.more", { count: items.length - limit })}</Text>
      ) : null}
    </View>
  );
}

function OutlineButton({
  label, icon, onPress, side, compact,
}: {
  label: string; icon: IconName; onPress: () => void; side?: Side;
  /** Half-width phone buttons: no trailing icon and the label may wrap, so it never gets cut off. */
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  const sides = useSides();
  const hover = useHover();
  const accent = side == null ? colors.accent : sides.fill[side];
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      style={(state) => [
        pressFade(state),
        {
          flex: 1, minHeight: 50, paddingHorizontal: compact ? 10 : 14, paddingVertical: compact ? 8 : 0, borderRadius: 16, borderWidth: 1,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9,
          borderColor: hover.hovered ? accent : colors.border,
          backgroundColor: hover.hovered ? (side == null ? colors.accentTint : sides.tint[side]) : "transparent",
        },
        hoverTransition,
      ]}
    >
      {side != null ? <SideDot side={side} size={9} /> : <Ionicons name={icon} size={17} color={colors.text} />}
      <Text numberOfLines={compact ? 2 : 1} style={{ flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: 14, lineHeight: 19, color: colors.text, textAlign: "center" }}>{label}</Text>
      {side != null && !compact ? <Ionicons name={icon} size={16} color={colors.text} /> : null}
    </Pressable>
  );
}

// ─── Program picker ──────────────────────────────────────────────────────────

function PickerSearch({ value, onChange, autoFocus }: { value: string; onChange: (text: string) => void; autoFocus?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        {
          flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1,
          backgroundColor: colors.card, borderColor: focused ? colors.accent : colors.softBorder,
        },
        hoverTransition,
      ]}
    >
      <Ionicons name="search-outline" size={18} color={focused ? colors.accent : colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        placeholder={t("programs.searchPlaceholder")}
        placeholderTextColor={colors.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={t("programs.searchPlaceholder")}
        style={[
          { flex: 1, height: "100%", paddingVertical: 0, fontFamily: Fonts.body, fontSize: 15, color: colors.text },
          isWeb ? ({ outlineStyle: "none" } as any) : null,
        ]}
      />
      {value ? (
        <Pressable onPress={() => onChange("")} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("programs.clearSearch")}>
          <Ionicons name="close-circle" size={19} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function PickerRow({
  program, level, showLevel, selected, first, onPress,
}: {
  program: ProgramSummaryInfo; level: ProgramLevel; showLevel: boolean; selected: boolean; first: boolean; onPress: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  const free = isFreeTuition(program.tuition);
  const meta = [free ? null : priceLabel(program.tuition, t), program.faculty].filter(Boolean).join(" · ");
  const active = selected || hover.hovered;

  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-selected={selected}
      accessibilityLabel={program.title}
      style={(state) => [
        pressFade(state),
        {
          flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14,
          borderTopWidth: first ? 0 : 1, borderTopColor: colors.softBorder,
          backgroundColor: selected ? colors.accentTint : hover.hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <ProgramIconTile title={program.title} size={40} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, lineHeight: 20, color: active ? colors.accent : colors.text }}>{program.title}</Text>
        {showLevel || free || meta ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            {showLevel ? <MiniBadge label={level === "master" ? t("degrees.Master") : t("degrees.Bachelor")} /> : null}
            {free ? <MiniBadge label={t("programDetail.free")} accent /> : null}
            {meta ? (
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: Fonts.body, fontSize: 12, color: colors.textSecondary }}>{meta}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <Ionicons name={selected ? "checkmark-circle" : "add-circle-outline"} size={22} color={active ? colors.accent : colors.textMuted} />
    </Pressable>
  );
}

function LevelSwitch({ levels, counts, value, onChange }: { levels: ProgramLevel[]; counts: Record<ProgramLevel, number>; value: ProgramLevel; onChange: (l: ProgramLevel) => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 4, padding: 4, borderRadius: 15, backgroundColor: colors.mutedSurface }}>
      {levels.map((level) => {
        const active = level === value;
        return (
          <Pressable
            key={level}
            onPress={() => onChange(level)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            aria-selected={active}
            style={[
              {
                flex: 1, height: 38, borderRadius: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                backgroundColor: active ? colors.accent : "transparent",
              },
              hoverTransition,
            ]}
          >
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13.5, color: active ? "#ffffff" : colors.textSecondary }}>
              {level === "master" ? t("degrees.Master") : t("degrees.Bachelor")}
            </Text>
            <View style={{ minWidth: 22, height: 20, paddingHorizontal: 6, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: active ? "rgba(255,255,255,0.2)" : colors.card }}>
              <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, color: active ? "#ffffff" : colors.textSecondary }}>{counts[level]}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function PickerContent({
  university, side, other, selected, desktop, onClose, onSelect,
}: {
  university: UniversityDisplay;
  side: Side;
  /** The program already picked at the other university, for "similar" suggestions. */
  other: ProgramDetail | null;
  selected: SelectedProgram | null;
  desktop: boolean;
  onClose: () => void;
  onSelect: (level: ProgramLevel, slug: string) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const close = useHover();

  const lists = useMemo(
    () => ({ bachelor: getProgramSummaries(university.id, "bachelor"), master: getProgramSummaries(university.id, "master") }),
    // `t` changes with the language, so the localized titles follow it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [university.id, t],
  );
  const levels = LEVELS.filter((l) => lists[l].length > 0);
  const [levelChoice, setLevelChoice] = useState<ProgramLevel>(selected?.level ?? other?.level ?? "bachelor");
  const level = levels.includes(levelChoice) ? levelChoice : (levels[0] ?? "bachelor");
  const [query, setQuery] = useState("");

  const q = query.trim().toLocaleLowerCase();
  // Searching looks through both degree levels at once.
  const rows: Suggestion[] = q
    ? LEVELS.flatMap((l) =>
        lists[l]
          .filter((p) => p.title.toLocaleLowerCase().includes(q) || (p.faculty ?? "").toLocaleLowerCase().includes(q))
          .map((program) => ({ program, level: l })),
      )
    : lists[level].map((program) => ({ program, level }));

  const suggestions = useMemo(
    () => (other ? similarPrograms(other.title, other.level, university.id, 3) : []),
    [other, university.id],
  );
  const isSelected = (row: Suggestion) => selected?.slug === row.program.slug && selected.level === row.level;

  return (
    <>
      <View style={{ paddingHorizontal: desktop ? 24 : 18, paddingTop: desktop ? 22 : 10, gap: 14 }}>
        {!desktop ? <View style={{ width: 42, height: 5, borderRadius: 3, alignSelf: "center", backgroundColor: colors.border }} /> : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Thumb uni={university} side={side} size={desktop ? 52 : 46} />
          <View style={{ flex: 1 }}>
            <Kicker label={t("compare.chooseProgram")} color={colors.accent} />
            <Text numberOfLines={2} style={{ marginTop: 3, fontFamily: Fonts.heading, fontSize: desktop ? 24 : 21, lineHeight: desktop ? 27 : 24, color: colors.text }}>
              {university.name}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            {...close}
            accessibilityRole="button"
            accessibilityLabel={t("compare.close")}
            hitSlop={8}
            style={[
              {
                width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
                backgroundColor: close.hovered ? colors.accentTint : colors.mutedSurface,
              },
              hoverTransition,
            ]}
          >
            <Ionicons name="close" size={20} color={close.hovered ? colors.accent : colors.text} />
          </Pressable>
        </View>
        <PickerSearch value={query} onChange={setQuery} autoFocus={desktop} />
        {levels.length > 1 && !q ? (
          <LevelSwitch levels={levels} counts={{ bachelor: lists.bachelor.length, master: lists.master.length }} value={level} onChange={setLevelChoice} />
        ) : null}
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: desktop ? 24 : 18, paddingBottom: 28, gap: 18 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {suggestions.length && !q ? (
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, paddingHorizontal: 4 }}>
              <Ionicons name="sparkles" size={14} color={colors.accent} />
              <Kicker label={t("compare.similar")} color={colors.accent} />
            </View>
            <View style={{ borderRadius: 18, overflow: "hidden", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent }}>
              {suggestions.map((row, index) => (
                <PickerRow
                  key={`s-${row.level}-${row.program.slug}`}
                  program={row.program}
                  level={row.level}
                  showLevel
                  selected={isSelected(row)}
                  first={index === 0}
                  onPress={() => onSelect(row.level, row.program.slug)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View>
          <Text style={{ marginBottom: 8, paddingHorizontal: 4, fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: colors.textMuted }}>
            {t("programs.available", { count: rows.length })}
          </Text>
          {rows.length ? (
            <View style={{ borderRadius: 18, overflow: "hidden", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder }}>
              {rows.map((row, index) => (
                <PickerRow
                  key={`${row.level}-${row.program.slug}`}
                  program={row.program}
                  level={row.level}
                  showLevel={Boolean(q) && levels.length > 1}
                  selected={isSelected(row)}
                  first={index === 0}
                  onPress={() => onSelect(row.level, row.program.slug)}
                />
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40, gap: 10 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
                <Ionicons name="compass-outline" size={28} color={colors.accent} />
              </View>
              <Text style={{ fontFamily: Fonts.heading, fontSize: 20, color: colors.text, textAlign: "center" }}>
                {q ? t("programs.noResults") : t("programs.noneAvailable")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

/**
 * The program chooser: a bottom sheet on phones, a centred dialog on desktop web.
 * Native uses `Modal` (slide-in + Android back); web uses an absolute overlay
 * because RN `Modal` doesn't stack above react-native-screens there.
 */
function ProgramPicker({
  university, side, other, selected, desktop, onClose, onSelect,
}: {
  university: UniversityDisplay | null;
  side: Side;
  other: ProgramDetail | null;
  selected: SelectedProgram | null;
  desktop: boolean;
  onClose: () => void;
  onSelect: (level: ProgramLevel, slug: string) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const open = university != null;

  // Escape closes the dialog on web.
  useEffect(() => {
    if (!isWeb || !open || typeof window === "undefined") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!university) return null;

  const content = (
    <PickerContent
      key={`${university.id}-${side}`}
      university={university}
      side={side}
      other={other}
      selected={selected}
      desktop={desktop}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
  const backdrop = (
    <Pressable style={FILL} onPress={onClose} accessibilityRole="button" accessibilityLabel={t("compare.close")} />
  );

  if (!isWeb) {
    return (
      <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(18,6,10,0.5)" }}>
          {backdrop}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View
              style={{
                height: Math.round(height * 0.86), paddingBottom: insets.bottom,
                borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", backgroundColor: colors.background,
              }}
            >
              {content}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  }

  return (
    <View
      style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        alignItems: "center", justifyContent: desktop ? "center" : "flex-end", backgroundColor: "rgba(18,6,10,0.5)",
        animationKeyframes: { from: { opacity: 0 }, to: { opacity: 1 } }, animationDuration: "180ms",
      } as any}
    >
      {backdrop}
      <View
        style={{
          width: desktop ? 620 : "100%", maxWidth: desktop ? undefined : PHONE_MAX_WIDTH,
          height: desktop ? Math.min(Math.round(height * 0.84), 780) : Math.round(height * 0.88),
          borderRadius: desktop ? 28 : 0, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          overflow: "hidden", backgroundColor: colors.background,
          shadowColor: "#000000", shadowOpacity: 0.3, shadowRadius: 40, shadowOffset: { width: 0, height: 20 },
          animationKeyframes: {
            from: { opacity: 0, transform: [{ translateY: desktop ? 18 : 60 }, { scale: desktop ? 0.98 : 1 }] },
            to: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
          },
          animationDuration: "280ms", animationTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        } as any}
      >
        {content}
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

/**
 * Compare two universities (picked in Favourites) head to head: a split photo
 * hero with a "vs" coin, an "at a glance" card, a bar chart of the key numbers,
 * each school's signature facts, then a program-vs-program comparison with a
 * searchable picker and "similar program" suggestions. A slim bar keeps both
 * names on screen once the hero scrolls away. Desktop web (≥1024) gets a wider
 * page; phones and narrow web use one column.
 */
export default function CompareScreen() {
  const { ids } = useLocalSearchParams<{ ids?: string | string[] }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const desktop = useIsDesktopWeb();
  const { height: windowHeight } = useWindowDimensions();

  const [programs, setPrograms] = useState<[SelectedProgram | null, SelectedProgram | null]>([null, null]);
  const [pickerSide, setPickerSide] = useState<Side | null>(null);
  const [showBar, setShowBar] = useState(false);
  const [numbersRevealed, setNumbersRevealed] = useState(false);
  const showBarRef = useRef(false);
  const revealedRef = useRef(false);
  const numbersRef = useRef<View>(null);

  const universities = useMemo(() => buildUniversities(t), [t]);
  const idList = ((Array.isArray(ids) ? ids[0] : ids) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const selected = idList
    .map((id) => universities.find((u) => u.id === id))
    .filter((u): u is UniversityDisplay => Boolean(u));

  const topInset = isWeb ? 0 : insets.top;
  const heroHeight = desktop ? 440 : topInset + 340;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/favourites" as any);
  };

  // Start the bar chart once its top edge is on screen.
  const checkReveal = () => {
    if (revealedRef.current) return;
    numbersRef.current?.measureInWindow((_x, y, _w, h) => {
      if (h > 0 && y < windowHeight - 80) {
        revealedRef.current = true;
        setNumbersRevealed(true);
      }
    });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const show = event.nativeEvent.contentOffset.y > (desktop ? 28 : 0) + heroHeight - 72;
    if (show !== showBarRef.current) {
      showBarRef.current = show;
      setShowBar(show);
    }
    checkReveal();
  };

  // Guard against a stale/short link (e.g. a favourite was removed after the
  // link was built) so the screen never renders half a comparison.
  if (selected.length < 2) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={{ position: "absolute", top: topInset + 16, left: 16 }}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={t("compare.goBack")}
            style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}
          >
            <Ionicons name="chevron-back" size={19} color={colors.text} />
          </Pressable>
        </View>
        <View style={{ width: 92, height: 92, borderRadius: 46, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
          <Ionicons name="swap-horizontal-outline" size={40} color={colors.accent} />
        </View>
        <Text style={{ marginTop: 20, fontFamily: Fonts.heading, fontSize: 28, lineHeight: 32, textAlign: "center", color: colors.text }}>
          {t("compare.emptyTitle")}
        </Text>
        <Text style={{ marginTop: 8, maxWidth: 340, fontFamily: Fonts.body, fontSize: 15, lineHeight: 23, textAlign: "center", color: colors.textSecondary }}>
          {t("compare.notFound")}
        </Text>
        <Pressable
          onPress={() => router.replace("/favourites" as any)}
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginTop: 24, height: 52, paddingHorizontal: 24, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 10,
            backgroundColor: colors.solid, opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="heart-outline" size={18} color={colors.onSolid} />
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: colors.onSolid }}>{t("compare.backToFavourites")}</Text>
        </Pressable>
      </View>
    );
  }

  const [a, b] = selected;
  const pair = [a, b] as const;

  const statsOf = (uni: UniversityDisplay): Record<string, string> => {
    const raw = t(`universityStatsValues.${uni.id}`, { returnObjects: true }) as Record<string, string> | string;
    return typeof raw === "object" ? raw : {};
  };
  const statsA = statsOf(a);
  const statsB = statsOf(b);

  const scholarship = (uni: UniversityDisplay): CellValue =>
    uni.scholarship
      ? { text: t("university.available"), icon: "checkmark-circle", tone: "accent" }
      : { text: t("university.notAvailable"), icon: "close-circle-outline", tone: "muted" };

  const glanceRows: VersusRowData[] = [
    { icon: "compass-outline", label: t("compare.category"), a: { text: t(`categories.${a.category}`) }, b: { text: t(`categories.${b.category}`) } },
    { icon: "location-outline", label: t("compare.location"), a: { text: cityOf(a) }, b: { text: cityOf(b) } },
    { icon: "school-outline", label: t("compare.degreeLevels"), a: { text: a.degreeLabel }, b: { text: b.degreeLabel } },
    { icon: "ribbon-outline", label: t("compare.scholarship"), a: scholarship(a), b: scholarship(b) },
    { icon: "cash-outline", label: t("compare.tuitionRange"), a: { text: a.tuitionRange }, b: { text: b.tuitionRange } },
  ];

  const standoutFacts = (stats: Record<string, string>) =>
    [
      { value: stats.labs, label: stats.labsText || t("universityStats.labs") },
      { value: stats.tuitionFreeLabel, label: stats.tuitionFreeText || t("universityStats.tuitionFree") },
    ].filter((fact) => Boolean(fact.value));
  const factsA = standoutFacts(statsA);
  const factsB = standoutFacts(statsB);

  // Resolve the picked programs to full detail objects.
  const details = [0, 1].map((i) => {
    const pick = programs[i];
    return pick ? buildProgramDetail(pair[i].id, pick.level, pick.slug) : null;
  }) as [ProgramDetail | null, ProgramDetail | null];
  const [detailA, detailB] = details;
  const totals = pair.map((uni) => getProgramSummaries(uni.id, "bachelor").length + getProgramSummaries(uni.id, "master").length);

  const pickProgram = (side: Side, level: ProgramLevel, slug: string) => {
    setPrograms((current) => {
      const next: [SelectedProgram | null, SelectedProgram | null] = [...current];
      next[side] = { level, slug };
      return next;
    });
  };
  const openProgram = (side: Side) => {
    const pick = programs[side];
    if (!pick) return;
    router.push({
      pathname: "/university/program/[programId]",
      params: { universityId: pair[side].id, level: pick.level, programId: pick.slug },
    } as any);
  };
  const openUniversity = (uni: UniversityDisplay) => router.push(`/university/${uni.id}` as any);

  // Exactly one side picked → suggest look-alikes on the other side.
  const emptySide: Side | null = detailA && !detailB ? 1 : detailB && !detailA ? 0 : null;
  const suggestions =
    emptySide == null ? [] : similarPrograms((details[emptySide === 1 ? 0 : 1] as ProgramDetail).title, (details[emptySide === 1 ? 0 : 1] as ProgramDetail).level, pair[emptySide].id, desktop ? 4 : 3);

  const levelLabel = (level: ProgramLevel) => (level === "master" ? t("degrees.Master") : t("degrees.Bachelor"));
  const tuitionValue = (detail: ProgramDetail): CellValue => {
    if (isFreeTuition(detail.tuition)) return { text: t("programDetail.free"), icon: "pricetag", tone: "accent" };
    const price = priceLabel(detail.tuition, t);
    return price ? { text: price } : { text: "—", tone: "muted" };
  };
  const programRows: VersusRowData[] =
    detailA && detailB
      ? [
          { icon: "school-outline", label: t("programDetail.level"), a: { text: levelLabel(detailA.level) }, b: { text: levelLabel(detailB.level) } },
          { icon: "time-outline", label: t("programDetail.duration"), a: { text: durationHeadline(detailA.duration) }, b: { text: durationHeadline(detailB.duration) } },
          { icon: "cash-outline", label: t("programDetail.tuitionShort"), a: tuitionValue(detailA), b: tuitionValue(detailB) },
          {
            icon: "layers-outline", label: t("programDetail.faculty"),
            a: detailA.faculty ? { text: detailA.faculty } : { text: "—", tone: "muted" },
            b: detailB.faculty ? { text: detailB.faculty } : { text: "—", tone: "muted" },
          },
          {
            icon: "people-outline", label: t("programDetail.studyMode"),
            a: { text: detailA.partners?.length ? detailA.partners.join(", ") : detailA.studyMode },
            b: { text: detailB.partners?.length ? detailB.partners.join(", ") : detailB.studyMode },
          },
        ]
      : [];

  // ── Sections ──

  const hero = (
    <CompareHero a={a} b={b} desktop={desktop} topInset={topInset} height={heroHeight} onBack={goBack} onOpen={openUniversity} />
  );

  const glance = (
    <Card desktop={desktop} raised>
      <View style={{ paddingTop: desktop ? 10 : 8, paddingBottom: desktop ? 2 : 0 }}>
        <Kicker label={t("compare.atAGlance")} color={colors.accent} center />
      </View>
      <VersusRows rows={glanceRows} desktop={desktop} />
    </Card>
  );

  const numbers = (
    <View>
      <SectionHeading kicker={t("compare.byNumbers")} title={t("compare.keyFacts")} desktop={desktop} />
      <View
        ref={numbersRef}
        collapsable={false}
        onLayout={checkReveal}
      >
        <Card desktop={desktop}>
          <Legend a={a} b={b} desktop={desktop} />
          {NUMBER_METRICS.map((metric, index) => (
            <View key={metric.key}>
              {index ? <RowDivider /> : null}
              <DuelRow
                icon={metric.icon}
                label={t(metric.label)}
                a={statsA[metric.key] ?? "—"}
                b={statsB[metric.key] ?? "—"}
                desktop={desktop}
                revealed={numbersRevealed}
                delay={index * 110}
              />
            </View>
          ))}
        </Card>
      </View>
    </View>
  );

  const standout =
    factsA.length && factsB.length ? (
      <View>
        <SectionHeading kicker={t("compare.standOutKicker")} title={t("compare.standOut")} desktop={desktop} />
        <View style={{ flexDirection: "row", gap: desktop ? 20 : 10 }}>
          <StandoutCard uni={a} side={0} facts={factsA} desktop={desktop} />
          <StandoutCard uni={b} side={1} facts={factsB} desktop={desktop} />
        </View>
      </View>
    ) : null;

  const programSection = (
    <View>
      <SectionHeading kicker={t("compare.programsKicker")} title={t("compare.programsTitle")} hint={t("compare.programsHint")} desktop={desktop} />
      <View style={{ flexDirection: "row", alignItems: "stretch", gap: desktop ? 24 : 10 }}>
        {pair.map((uni, i) => (
          <ProgramSlot
            key={uni.id}
            uni={uni}
            side={i as Side}
            detail={details[i]}
            desktop={desktop}
            total={totals[i]}
            onPick={() => setPickerSide(i as Side)}
            onOpen={() => openProgram(i as Side)}
          />
        ))}
        {desktop ? (
          <View pointerEvents="none" style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -24, marginTop: -10 }}>
            <VsMedallion size={48} />
          </View>
        ) : null}
      </View>

      {emptySide != null && suggestions.length ? (
        <SuggestionStrip
          key={`${emptySide}-${programs[emptySide === 1 ? 0 : 1]?.slug}`}
          side={emptySide}
          items={suggestions}
          desktop={desktop}
          onPick={(s) => pickProgram(emptySide, s.level, s.program.slug)}
        />
      ) : null}

      {detailA && detailB ? (
        <View key={`${programs[0]?.slug}-${programs[1]?.slug}`} style={[{ marginTop: desktop ? 40 : 28, gap: desktop ? 18 : 12 }, fadeUp]}>
          <SectionHeading kicker={t("compare.programsKickerPair")} title={t("compare.programComparison")} desktop={desktop} />
          <Card desktop={desktop}>
            <VersusRows rows={programRows} desktop={desktop} lines={4} />
          </Card>
          <SplitCard
            icon="book-outline"
            title={t("programDetail.whatYouStudy")}
            left={<TopicChips keyFocus={detailA.keyFocus} side={0} desktop={desktop} />}
            right={<TopicChips keyFocus={detailB.keyFocus} side={1} desktop={desktop} />}
            desktop={desktop}
          />
          <SplitCard
            icon="briefcase-outline"
            title={t("programDetail.careers")}
            left={<CareerList items={detailA.careers} side={0} desktop={desktop} />}
            right={<CareerList items={detailB.careers} side={1} desktop={desktop} />}
            desktop={desktop}
          />
          <View style={{ flexDirection: "row", gap: desktop ? 16 : 10 }}>
            <OutlineButton label={desktop ? `${t("compare.openProgram")}: ${detailA.title}` : t("compare.openProgram")} icon="arrow-forward" side={0} compact={!desktop} onPress={() => openProgram(0)} />
            <OutlineButton label={desktop ? `${t("compare.openProgram")}: ${detailB.title}` : t("compare.openProgram")} icon="arrow-forward" side={1} compact={!desktop} onPress={() => openProgram(1)} />
          </View>
        </View>
      ) : null}
    </View>
  );

  const footer = (
    <View style={{ flexDirection: "row", justifyContent: "center" }}>
      <View style={{ width: desktop ? 320 : "100%", flexDirection: "row" }}>
        <OutlineButton label={t("compare.backToFavourites")} icon="heart-outline" onPress={goBack} />
      </View>
    </View>
  );

  const picker = (
    <ProgramPicker
      university={pickerSide == null ? null : pair[pickerSide]}
      side={pickerSide ?? 0}
      other={pickerSide == null ? null : details[pickerSide === 0 ? 1 : 0]}
      selected={pickerSide == null ? null : programs[pickerSide]}
      desktop={desktop}
      onClose={() => setPickerSide(null)}
      onSelect={(level, slug) => {
        if (pickerSide != null) pickProgram(pickerSide, level, slug);
        setPickerSide(null);
      }}
    />
  );

  const stickyBar = showBar ? <StickyBar a={a} b={b} desktop={desktop} topInset={topInset} onBack={goBack} /> : null;

  if (desktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={32} contentContainerStyle={{ paddingBottom: 88 }}>
          <ContentWrap maxWidth={DESKTOP_MAX_WIDTH} style={{ paddingHorizontal: 32, paddingTop: 28 }}>
            {hero}
            <View style={{ marginTop: -HERO_OVERLAP, marginHorizontal: 32 }}>{glance}</View>
            <View style={{ marginTop: 80, gap: 80 }}>
              {numbers}
              {standout}
              {programSection}
              {footer}
            </View>
          </ContentWrap>
        </ScrollView>
        {stickyBar}
        {picker}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: 48 + (isWeb ? 0 : insets.bottom) }}
      >
        <ContentWrap maxWidth={PHONE_MAX_WIDTH}>
          {hero}
          <View style={{ marginTop: -HERO_OVERLAP, paddingHorizontal: 14 }}>{glance}</View>
          <View style={{ paddingHorizontal: 14, marginTop: 48, gap: 52 }}>
            {numbers}
            {standout}
            {programSection}
            {footer}
          </View>
        </ContentWrap>
      </ScrollView>
      {stickyBar}
      {picker}
    </View>
  );
}
