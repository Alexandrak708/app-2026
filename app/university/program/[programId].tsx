import { useMemo } from "react";
import { Linking, Pressable, ScrollView, Text, View, type DimensionValue } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { buildProgramDetail, getProgramSummaries, type ProgramDetail } from "@/data/university-programs";
import { buildUniversities, type UniversityDisplay } from "@/data/university-data";
import { useAppTheme } from "@/hooks/use-theme-color";
import { ContentWrap, isWeb, useIsDesktopWeb } from "@/components/responsive";
import {
  HERO_OVERLAP, HeroBadge, HeroTitle, HeroUniversityLine, PhotoHero, hoverTransition, useHover,
} from "@/components/program-ui";
import { Fonts } from "@/constants/typography";
import {
  durationHeadline, highlightIcon, isFreeTuition, softenLeadingCaps, splitTopics, tuitionHeadline,
} from "@/lib/program-facts";

type IconName = keyof typeof Ionicons.glyphMap;

/** Phone layout column (native + narrow web) and the desktop web page width. */
const PHONE_MAX_WIDTH = 720;
const DESKTOP_MAX_WIDTH = 1200;
const SIDEBAR_WIDTH = 380;

function Hero({
  detail, university, desktop, topInset, levelLabel, free, onBack,
}: {
  detail: ProgramDetail;
  university?: UniversityDisplay;
  desktop: boolean;
  topInset: number;
  levelLabel: string;
  free: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const city = university?.location.split(",")[0].trim();
  const universityLine = [university?.name ?? detail.universityName, city].filter(Boolean).join(" · ");

  return (
    <PhotoHero
      image={university?.image}
      color={university?.color}
      desktop={desktop}
      topInset={topInset}
      height={desktop ? 440 : topInset + 320}
      backLabel={t("programDetail.backToPrograms")}
      onBack={onBack}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <HeroBadge label={levelLabel} />
        {free ? <HeroBadge label={t("programDetail.free")} filled /> : null}
      </View>
      <HeroTitle title={detail.title} desktop={desktop} />
      <HeroUniversityLine text={universityLine} desktop={desktop} />
    </PhotoHero>
  );
}

type Fact = { icon: IconName; label: string; value: string; highlight?: boolean };

/** The floating "at a glance" strip: short duration / tuition / degree (+ faculty on desktop). */
function GlanceCard({ facts, desktop }: { facts: Fact[]; desktop: boolean }) {
  const { colors, isDark } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: desktop ? 24 : 20,
        borderWidth: 1, borderColor: colors.softBorder,
        paddingVertical: desktop ? 22 : 16,
        shadowColor: "#21030d", shadowOffset: { width: 0, height: 12 },
        shadowOpacity: isDark ? 0.45 : 0.12, shadowRadius: 28, elevation: 8,
      }}
    >
      {facts.map((fact, index) => (
        <View
          key={fact.label}
          style={{
            // Phone columns size to their content (long labels like "Продължителност"
            // need the room); desktop has space for equal columns.
            ...(desktop ? { flex: 1 } : { flexGrow: 1, flexShrink: 1, flexBasis: "auto", maxWidth: "46%" as DimensionValue }),
            paddingHorizontal: desktop ? 24 : 10,
            borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.divider,
          }}
        >
          <View
            style={{
              width: desktop ? 36 : 30, height: desktop ? 36 : 30, borderRadius: 999,
              alignItems: "center", justifyContent: "center",
              backgroundColor: fact.highlight ? colors.accent : colors.accentTint,
            }}
          >
            <Ionicons name={fact.icon} size={desktop ? 18 : 15} color={fact.highlight ? "#ffffff" : colors.accent} />
          </View>
          <Text numberOfLines={1} style={{ marginTop: 10, fontFamily: Fonts.body, fontSize: desktop ? 13 : 11.5, color: colors.textSecondary }}>
            {fact.label}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              marginTop: 3, fontFamily: Fonts.number, fontSize: desktop ? 19 : 15, lineHeight: desktop ? 25 : 20,
              color: fact.highlight ? colors.accent : colors.text,
            }}
          >
            {fact.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SectionTitle({ title, desktop }: { title: string; desktop: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Text
      accessibilityRole="header"
      style={{ marginBottom: desktop ? 20 : 16, fontFamily: Fonts.heading, fontSize: desktop ? 32 : 27, lineHeight: desktop ? 36 : 31, color: colors.text }}
    >
      {title}
    </Text>
  );
}

function Kicker({ label, color }: { label: string; color: string }) {
  return (
    <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color }}>
      {label}
    </Text>
  );
}

function Overview({ text, desktop }: { text: string; desktop: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  // Short overviews read as a big serif lead; long ones step down so they don't swamp the page.
  const long = text.length > 180;
  const fontSize = desktop ? (long ? 23 : 27) : (long ? 19 : 22);
  return (
    <View style={{ flexDirection: "row", gap: desktop ? 20 : 14 }}>
      <View style={{ width: 3, borderRadius: 2, backgroundColor: colors.accent }} />
      <View style={{ flex: 1 }}>
        <Kicker label={t("programDetail.overview")} color={colors.accent} />
        <Text
          style={{
            marginTop: 10, fontFamily: Fonts.displayMedium, fontSize, lineHeight: Math.round(fontSize * 1.38), color: colors.text,
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

/** Key-focus topics as numbered tiles; a single unsplittable sentence stays a paragraph. */
function StudyTopics({ keyFocus, desktop }: { keyFocus: string; desktop: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const topics = splitTopics(keyFocus);

  if (topics.length < 2) {
    return (
      <View>
        <SectionTitle title={t("programDetail.keyFocus")} desktop={desktop} />
        <Text style={{ fontFamily: Fonts.body, fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>{topics[0] ?? keyFocus}</Text>
      </View>
    );
  }

  return (
    <View>
      <SectionTitle title={t("programDetail.whatYouStudy")} desktop={desktop} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: desktop ? 12 : 10 }}>
        {topics.map((topic, index) => (
          <View
            key={topic}
            style={{
              flexBasis: desktop ? "30%" : "46%", flexGrow: 1,
              minHeight: desktop ? 118 : 104, justifyContent: "space-between",
              padding: desktop ? 18 : 15, borderRadius: 18,
              backgroundColor: colors.accentTint,
            }}
          >
            <Text style={{ fontFamily: Fonts.number, fontSize: desktop ? 19 : 17, lineHeight: desktop ? 24 : 22, letterSpacing: 0.5, color: colors.accent }}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={{ marginTop: 12, fontFamily: Fonts.bodyMedium, fontSize: desktop ? 15 : 14, lineHeight: desktop ? 21 : 19, color: colors.text }}>
              {topic}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Highlights({ items, desktop }: { items: string[]; desktop: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  if (!items.length) return null;
  return (
    <View>
      <SectionTitle title={t("programDetail.highlights")} desktop={desktop} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: desktop ? 12 : 10 }}>
        {items.map((item) => (
          <View
            key={item}
            style={{
              flexBasis: desktop ? "45%" : "100%", flexGrow: 1,
              flexDirection: "row", alignItems: "center", gap: 14,
              padding: 16, borderRadius: 18,
              backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder,
            }}
          >
            <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
              <Ionicons name={highlightIcon(item)} size={20} color={colors.accent} />
            </View>
            <Text style={{ flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 14.5, lineHeight: 21, color: colors.text }}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Careers({ items, desktop }: { items: string[]; desktop: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  if (!items.length) return null;
  return (
    <View>
      <SectionTitle title={t("programDetail.careers")} desktop={desktop} />
      <View style={{ borderRadius: 22, paddingHorizontal: desktop ? 22 : 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder }}>
        {items.map((career, index) => (
          <View
            key={career}
            style={{
              flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: desktop ? 18 : 15,
              borderTopWidth: index ? 1 : 0, borderTopColor: colors.softBorder,
            }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.mutedSurface }}>
              <Ionicons name="briefcase-outline" size={18} color={colors.accent} />
            </View>
            <Text style={{ flex: 1, fontFamily: Fonts.heading, fontSize: desktop ? 22 : 20, lineHeight: desktop ? 26 : 24, color: colors.text }}>{career}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type KeyFactRow = { icon: IconName; label: string; value: string };

function KeyFacts({
  rows, university, universityName, onOpenUniversity,
}: {
  rows: KeyFactRow[];
  university?: UniversityDisplay;
  universityName: string;
  onOpenUniversity: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();

  const label = (text: string) => (
    <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted }}>{text}</Text>
  );

  return (
    <View style={{ borderRadius: 22, padding: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder }}>
      <Text accessibilityRole="header" style={{ fontFamily: Fonts.heading, fontSize: 24, lineHeight: 28, color: colors.text, marginBottom: 8 }}>
        {t("programDetail.keyFacts")}
      </Text>

      <Pressable
        onPress={onOpenUniversity}
        {...hover}
        accessibilityRole="link"
        accessibilityLabel={`${t("programDetail.viewUniversity")}: ${universityName}`}
        style={[
          {
            flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: -10, padding: 10, borderRadius: 16,
            backgroundColor: hover.hovered ? colors.mutedSurface : "transparent",
          },
          hoverTransition,
        ]}
      >
        <View style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", backgroundColor: university?.color ?? colors.mutedSurface }}>
          {university ? <ExpoImage source={university.image} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
        </View>
        <View style={{ flex: 1 }}>
          {label(t("programDetail.university"))}
          <Text style={{ marginTop: 2, fontFamily: Fonts.bodyMedium, fontSize: 14.5, lineHeight: 20, color: hover.hovered ? colors.accent : colors.text }}>
            {universityName}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      {rows.map((row) => (
        <View key={row.label} style={{ flexDirection: "row", gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.softBorder }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.mutedSurface }}>
            <Ionicons name={row.icon} size={17} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            {label(row.label)}
            <Text style={{ marginTop: 2, fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: colors.text }}>{row.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Deep burgundy admission card: the checklist plus the way out to the university's site. */
function Admission({ notes, url }: { notes: string[]; url?: string }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  if (!notes.length && !url) return null;

  return (
    <View style={{ borderRadius: 24, padding: 22, overflow: "hidden", backgroundColor: colors.inkSurface }}>
      <View pointerEvents="none" style={{ position: "absolute", right: -26, top: -22, opacity: 0.09 }}>
        <Ionicons name="school" size={150} color={colors.beige} />
      </View>
      <Kicker label={t("programDetail.admissionKicker")} color={colors.beige} />
      <Text accessibilityRole="header" style={{ marginTop: 8, fontFamily: Fonts.heading, fontSize: 27, lineHeight: 31, color: colors.onInk }}>
        {t("programDetail.admissionNotes")}
      </Text>

      <View style={{ marginTop: 16, gap: 12 }}>
        {notes.map((note) => (
          <View key={note} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, marginTop: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.beige }}>
              <Ionicons name="checkmark" size={14} color={colors.accentInk} />
            </View>
            <Text style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14.5, lineHeight: 22, color: colors.onInk }}>{note}</Text>
          </View>
        ))}
      </View>

      {url ? (
        <Pressable
          onPress={() => Linking.openURL(url)}
          {...hover}
          accessibilityRole="link"
          accessibilityLabel={t("programDetail.visitWebsite")}
          style={[
            {
              marginTop: 22, height: 52, borderRadius: 16, paddingHorizontal: 18,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
              backgroundColor: hover.hovered ? colors.beige : colors.onInk,
            },
            hoverTransition,
          ]}
        >
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: colors.accentInk }}>{t("programDetail.visitWebsite")}</Text>
          <Ionicons name="open-outline" size={17} color={colors.accentInk} />
        </Pressable>
      ) : null}
    </View>
  );
}

function RelatedProgramRow({
  title, faculty, free, first, onPress,
}: {
  title: string; faculty?: string; free: boolean; first: boolean; onPress: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="link"
      accessibilityLabel={title}
      style={[
        {
          flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 18,
          borderTopWidth: first ? 0 : 1, borderTopColor: colors.softBorder,
          backgroundColor: hover.hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: hover.hovered ? colors.accent : colors.text }}>{title}</Text>
        {faculty ? (
          <Text numberOfLines={1} style={{ marginTop: 2, fontFamily: Fonts.body, fontSize: 12.5, color: colors.textMuted }}>{faculty}</Text>
        ) : null}
      </View>
      {free ? (
        <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.accentTint }}>
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, color: colors.accent }}>{t("programDetail.free")}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={hover.hovered ? colors.accent : colors.textMuted} />
    </Pressable>
  );
}

function OutlineButton({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      style={[
        {
          height: 52, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
          borderColor: hover.hovered ? colors.accent : colors.border,
          backgroundColor: hover.hovered ? colors.accentTint : "transparent",
        },
        hoverTransition,
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}

/**
 * Program detail — shared by every program of every university. A photo hero of
 * the university with the program title, a floating "at a glance" strip, then
 * the overview, study topics, highlights, careers, key facts and admission.
 * Desktop web (≥1024) moves key facts + admission into a sticky sidebar; phones
 * and narrow web stack everything in one column.
 */
export default function ProgramDetailPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const desktop = useIsDesktopWeb();
  const { universityId, level, programId } = useLocalSearchParams<{
    universityId?: string | string[];
    level?: string | string[];
    programId?: string | string[];
  }>();

  const detail = buildProgramDetail(universityId, level, programId);
  const university = useMemo(
    () => buildUniversities(t).find((u) => u.id === detail?.universityId),
    [t, detail?.universityId],
  );

  const goToPrograms = () => {
    if (router.canGoBack()) router.back();
    else if (detail) router.replace({ pathname: "/university/project", params: { id: detail.universityId } } as any);
    else router.replace("/" as any);
  };

  if (!detail) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
          <Ionicons name="compass-outline" size={34} color={colors.accent} />
        </View>
        <Text style={{ fontFamily: Fonts.heading, fontSize: 26, color: colors.text, marginTop: 16, textAlign: "center" }}>
          {t("programDetail.notFound")}
        </Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 8, textAlign: "center", maxWidth: 360 }}>
          {t("programDetail.notFoundDesc")}
        </Text>
        <Pressable
          onPress={goToPrograms}
          accessibilityRole="button"
          style={{ marginTop: 22, backgroundColor: colors.solid, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 16 }}
        >
          <Text style={{ fontFamily: Fonts.bodyMedium, color: colors.onSolid }}>{t("university.goBack")}</Text>
        </Pressable>
      </View>
    );
  }

  const levelLabel = detail.level === "master" ? t("degrees.Master") : t("degrees.Bachelor");
  const universityName = university?.name ?? detail.universityName;
  const free = isFreeTuition(detail.tuition);
  const price = tuitionHeadline(detail.tuition);
  const websiteUrl = university?.applyUrl || university?.website || undefined;

  const glance: Fact[] = [
    { icon: "time-outline", label: t("programDetail.duration"), value: durationHeadline(detail.duration) },
    ...(free
      ? [{ icon: "pricetag-outline" as IconName, label: t("programDetail.tuitionShort"), value: t("programDetail.free"), highlight: true }]
      : price
        ? [{
            icon: "cash-outline" as IconName,
            label: t("programDetail.tuitionShort"),
            value: price.hasMore ? t("programDetail.fromPrice", { price: price.price }) : price.price,
          }]
        : []),
    { icon: "school-outline", label: t("programDetail.level"), value: levelLabel },
    ...(desktop && detail.faculty ? [{ icon: "layers-outline" as IconName, label: t("programDetail.faculty"), value: detail.faculty }] : []),
  ];

  const keyFactRows: KeyFactRow[] = [
    ...(detail.faculty ? [{ icon: "layers-outline" as IconName, label: t("programDetail.faculty"), value: detail.faculty }] : []),
    { icon: "time-outline", label: t("programDetail.duration"), value: detail.duration },
    { icon: "cash-outline", label: t("programDetail.tuition"), value: detail.tuition ? softenLeadingCaps(detail.tuition) : t("programDetail.tuitionUnknown") },
    {
      icon: "people-outline",
      label: t("programDetail.studyMode"),
      value: detail.partners?.length ? detail.partners.join(", ") : detail.studyMode,
    },
  ];

  const currentSlug = Array.isArray(programId) ? programId[0] : programId;
  const related = getProgramSummaries(detail.universityId, detail.level)
    .filter((program) => program.slug !== currentSlug)
    .slice(0, 5);

  const openUniversity = () => router.push(`/university/${detail.universityId}` as any);
  // Replace (not push) so "back to programs" still lands on the programme list.
  const openProgram = (slug: string) =>
    router.replace({
      pathname: "/university/program/[programId]",
      params: { universityId: detail.universityId, level: detail.level, programId: slug },
    });

  const keyFacts = (
    <KeyFacts rows={keyFactRows} university={university} universityName={universityName} onOpenUniversity={openUniversity} />
  );
  const admission = <Admission notes={detail.admissionNotes} url={websiteUrl} />;

  const morePrograms = related.length ? (
    <View>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <SectionTitle title={t("programDetail.morePrograms")} desktop={desktop} />
        <Pressable onPress={goToPrograms} hitSlop={10} accessibilityRole="link">
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: colors.accent }}>{t("programDetail.allPrograms")}</Text>
        </Pressable>
      </View>
      <View style={{ borderRadius: 22, overflow: "hidden", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder }}>
        {related.map((program, index) => (
          <RelatedProgramRow
            key={program.slug}
            title={program.title}
            faculty={program.faculty}
            free={isFreeTuition(program.tuition)}
            first={index === 0}
            onPress={() => openProgram(program.slug)}
          />
        ))}
      </View>
    </View>
  ) : null;

  const backButton = <OutlineButton label={t("programDetail.returnToPrograms")} icon="arrow-back" onPress={goToPrograms} />;

  const hero = (
    <Hero
      detail={detail}
      university={university}
      desktop={desktop}
      topInset={isWeb ? 0 : insets.top}
      levelLabel={levelLabel}
      free={free}
      onBack={goToPrograms}
    />
  );

  if (desktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 72 }}>
          <ContentWrap maxWidth={DESKTOP_MAX_WIDTH} style={{ paddingHorizontal: 32, paddingTop: 28 }}>
            {hero}
            <View style={{ marginTop: -HERO_OVERLAP, marginHorizontal: 32 }}>
              <GlanceCard facts={glance} desktop />
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 48, marginTop: 52 }}>
              <View style={{ flex: 1, minWidth: 0, gap: 56 }}>
                <Overview text={detail.overview} desktop />
                <StudyTopics keyFocus={detail.keyFocus} desktop />
                <Highlights items={detail.highlights} desktop />
                <Careers items={detail.careers} desktop />
                {morePrograms}
              </View>
              <View style={{ width: SIDEBAR_WIDTH, gap: 20, ...({ position: "sticky", top: 24 } as any) }}>
                {keyFacts}
                {admission}
                {backButton}
              </View>
            </View>
          </ContentWrap>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 + (isWeb ? 0 : insets.bottom) }}>
        <ContentWrap maxWidth={PHONE_MAX_WIDTH}>
          {hero}
          <View style={{ marginTop: -HERO_OVERLAP, paddingHorizontal: 16 }}>
            <GlanceCard facts={glance} desktop={false} />
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 32, gap: 40 }}>
            <Overview text={detail.overview} desktop={false} />
            <StudyTopics keyFocus={detail.keyFocus} desktop={false} />
            <Highlights items={detail.highlights} desktop={false} />
            <Careers items={detail.careers} desktop={false} />
            <View style={{ gap: 16 }}>
              {keyFacts}
              {admission}
            </View>
            {morePrograms}
            {backButton}
          </View>
        </ContentWrap>
      </ScrollView>
    </View>
  );
}
