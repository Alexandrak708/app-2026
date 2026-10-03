import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  getProgramSummaries,
  getUniversityName,
  type ProgramLevel,
  type ProgramSummaryInfo,
} from "@/data/university-programs";
import { buildUniversities } from "@/data/university-data";
import { useAppTheme } from "@/hooks/use-theme-color";
import { ContentWrap, isWeb, useIsDesktopWeb } from "@/components/responsive";
import { HERO_OVERLAP, HeroTitle, HeroUniversityLine, PhotoHero, hoverTransition, useHover } from "@/components/program-ui";
import { Fonts } from "@/constants/typography";
import { isFreeTuition, programIcon, shortFacultyName, tuitionHeadline } from "@/lib/program-facts";

type IconName = keyof typeof Ionicons.glyphMap;

/** Phone layout column (native + narrow web) and the desktop web page width. */
const PHONE_MAX_WIDTH = 720;
const DESKTOP_MAX_WIDTH = 1200;
const SIDEBAR_WIDTH = 300;
const LEVELS: ProgramLevel[] = ["bachelor", "master"];

type Group = { key: string; title: string | null; items: ProgramSummaryInfo[] };

/** "от 325-375 лв./сем" / "191.00 €" — the short price for a program row; null when free or unknown. */
function usePriceLabel() {
  const { t } = useTranslation();
  return (tuition?: string) => {
    const price = tuitionHeadline(tuition);
    if (!price) return null;
    return price.hasMore ? t("programDetail.fromPrice", { price: price.price }) : price.price;
  };
}

function FreeBadge() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.accentTint }}>
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, color: colors.accent }}>{t("programDetail.free")}</Text>
    </View>
  );
}

/** Bachelor / Master switch that rides over the hero's lower edge. */
function DegreeTile({
  level, count, active, onPress, desktop, interactive,
}: {
  level: ProgramLevel; count: number; active: boolean; onPress: () => void; desktop: boolean; interactive: boolean;
}) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const hover = useHover();
  const label = level === "master" ? t("degrees.Master") : t("degrees.Bachelor");

  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      {...hover}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      aria-selected={active}
      accessibilityLabel={`${label}, ${t("programs.programCount", { count })}`}
      style={[
        {
          flex: 1, flexDirection: "row", alignItems: "center", gap: desktop ? 16 : 12,
          minHeight: desktop ? 92 : 76, paddingHorizontal: desktop ? 22 : 14, paddingVertical: 14,
          borderRadius: desktop ? 24 : 20, borderWidth: 1,
          backgroundColor: active ? colors.accent : colors.card,
          borderColor: active ? colors.accent : hover.hovered && interactive ? colors.accent : colors.softBorder,
          shadowColor: "#21030d", shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.45 : 0.12, shadowRadius: 28, elevation: 8,
        },
        hoverTransition,
      ]}
    >
      <View
        style={{
          width: desktop ? 46 : 38, height: desktop ? 46 : 38, borderRadius: 999, alignItems: "center", justifyContent: "center",
          backgroundColor: active ? "rgba(255,255,255,0.18)" : colors.accentTint,
        }}
      >
        <Ionicons name={level === "master" ? "ribbon-outline" : "school-outline"} size={desktop ? 22 : 18} color={active ? "#ffffff" : colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: Fonts.bodyMedium, fontSize: desktop ? 17 : 15, color: active ? "#ffffff" : colors.text }}>
          {label}
        </Text>
        <Text numberOfLines={1} style={{ marginTop: 2, fontFamily: Fonts.body, fontSize: desktop ? 13.5 : 12.5, color: active ? "rgba(255,255,255,0.8)" : colors.textSecondary }}>
          {t("programs.programCount", { count })}
        </Text>
      </View>
      {desktop ? (
        <Text style={{ fontFamily: Fonts.number, fontSize: 34, lineHeight: 40, color: active ? "#ffffff" : colors.accent }}>{count}</Text>
      ) : null}
    </Pressable>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        {
          flexDirection: "row", alignItems: "center", gap: 10, height: 50, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1,
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

/** Rounded filter chip: burgundy fill when selected, hairline outline when not. */
function Chip({ label, selected, onPress, icon, count }: { label: string; selected: boolean; onPress: () => void; icon?: IconName; count?: number }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-selected={selected}
      style={[
        {
          height: 38, paddingLeft: icon ? 12 : 15, paddingRight: count != null ? 6 : 15, borderRadius: 19, borderWidth: 1,
          flexDirection: "row", alignItems: "center", gap: 7,
          borderColor: selected || hover.hovered ? colors.accent : colors.border,
          backgroundColor: selected ? colors.accent : "transparent",
        },
        hoverTransition,
      ]}
    >
      {icon ? <Ionicons name={icon} size={15} color={selected ? "#ffffff" : colors.accent} /> : null}
      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: selected ? Fonts.bodyMedium : Fonts.body, fontSize: 13.5, color: selected ? "#ffffff" : colors.text }}>
        {label}
      </Text>
      {count != null ? (
        <View style={{ minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 6, alignItems: "center", justifyContent: "center", backgroundColor: selected ? "rgba(255,255,255,0.18)" : colors.surface }}>
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11.5, color: selected ? "#ffffff" : colors.textSecondary }}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Desktop sidebar option: full faculty name with its program count. */
function FacultyOption({ label, count, selected, onPress }: { label: string; count: number; selected: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      style={[
        {
          flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
          backgroundColor: selected ? colors.accentTint : hover.hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: selected ? colors.accent : "transparent" }} />
      <Text style={{ flex: 1, fontFamily: selected ? Fonts.bodyMedium : Fonts.body, fontSize: 14, lineHeight: 19, color: selected ? colors.accent : colors.text }}>
        {label}
      </Text>
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: selected ? colors.accent : colors.textMuted }}>{count}</Text>
    </Pressable>
  );
}

function SidebarLabel({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: colors.textMuted, marginBottom: 8, paddingHorizontal: 4 }}>
      {label}
    </Text>
  );
}

function ProgramIconTile({ title, size }: { title: string; size: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
      <Ionicons name={programIcon(title)} size={size * 0.46} color={colors.accent} />
    </View>
  );
}

/** Phone row inside a group card. */
function ProgramRow({ program, showFaculty, first, onPress }: { program: ProgramSummaryInfo; showFaculty: boolean; first: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  const priceLabel = usePriceLabel();
  const free = isFreeTuition(program.tuition);
  const price = free ? null : priceLabel(program.tuition);
  const meta = [price, showFaculty ? program.faculty : null].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="link"
      accessibilityLabel={program.title}
      style={[
        {
          flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16,
          borderTopWidth: first ? 0 : 1, borderTopColor: colors.softBorder,
          backgroundColor: hover.hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <ProgramIconTile title={program.title} size={42} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: hover.hovered ? colors.accent : colors.text }}>
          {program.title}
        </Text>
        {free ? <FreeBadge /> : null}
        {meta ? (
          <Text numberOfLines={2} style={{ fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.textSecondary }}>{meta}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={hover.hovered ? colors.accent : colors.textMuted} />
    </Pressable>
  );
}

/** Desktop grid card. */
function ProgramCard({ program, showFaculty, onPress }: { program: ProgramSummaryInfo; showFaculty: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  const priceLabel = usePriceLabel();
  const free = isFreeTuition(program.tuition);
  const price = free ? null : priceLabel(program.tuition);

  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="link"
      accessibilityLabel={program.title}
      style={[
        {
          width: "calc(50% - 7px)" as any, minHeight: 168, padding: 20, borderRadius: 20, borderWidth: 1,
          backgroundColor: colors.card, borderColor: hover.hovered ? colors.accent : colors.softBorder,
        },
        hoverTransition,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <ProgramIconTile title={program.title} size={46} />
        <View
          style={[
            {
              width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
              backgroundColor: hover.hovered ? colors.accent : colors.mutedSurface,
            },
            hoverTransition,
          ]}
        >
          <Ionicons name="arrow-forward" size={16} color={hover.hovered ? "#ffffff" : colors.textSecondary} />
        </View>
      </View>
      <Text numberOfLines={3} style={{ marginTop: 16, fontFamily: Fonts.bodyMedium, fontSize: 16, lineHeight: 22, color: hover.hovered ? colors.accent : colors.text }}>
        {program.title}
      </Text>
      <View style={{ marginTop: "auto", paddingTop: 14, gap: 6 }}>
        {showFaculty && program.faculty ? (
          <Text numberOfLines={1} style={{ fontFamily: Fonts.body, fontSize: 12.5, color: colors.textMuted }}>{program.faculty}</Text>
        ) : null}
        {free ? <FreeBadge /> : price ? (
          <Text numberOfLines={1} style={{ fontFamily: Fonts.number, fontSize: 14, color: colors.textSecondary }}>{price}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function GroupHeader({ title, count, desktop }: { title: string; count: number; desktop: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Text accessibilityRole="header" style={{ flex: 1, fontFamily: Fonts.heading, fontSize: desktop ? 26 : 22, lineHeight: desktop ? 30 : 26, color: colors.text }}>
        {title}
      </Text>
      <View style={{ minWidth: 30, height: 26, paddingHorizontal: 9, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, color: colors.accent }}>{count}</Text>
      </View>
    </View>
  );
}

function EmptyState({ title, hint, actionLabel, onAction }: { title: string; hint?: string; actionLabel?: string; onAction?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
      <View style={{ width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
        <Ionicons name="compass-outline" size={32} color={colors.accent} />
      </View>
      <Text style={{ marginTop: 16, fontFamily: Fonts.heading, fontSize: 23, lineHeight: 28, textAlign: "center", color: colors.text }}>{title}</Text>
      {hint ? (
        <Text style={{ marginTop: 6, fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center", color: colors.textSecondary }}>{hint}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={{ marginTop: 18, height: 44, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: colors.accent, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: colors.accent }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * A university's programmes — shared by every university. Photo hero, a
 * Bachelor/Master switch over its lower edge, search + faculty / tuition-free
 * filters, and the programmes grouped by faculty. Desktop web (≥1024) moves the
 * filters into a sticky sidebar and shows the programmes as a two-column grid.
 */
export default function ProgramsPage() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const desktop = useIsDesktopWeb();

  const universityId = (Array.isArray(id) ? id[0] : id) ?? "";
  const university = useMemo(() => buildUniversities(t).find((u) => u.id === universityId), [t, universityId]);
  const universityName = university?.name ?? getUniversityName(universityId);
  const city = university?.location.split(",")[0].trim();

  // `t` changes identity with the language, so the localized titles follow it.
  const programs = useMemo(
    () => ({ bachelor: getProgramSummaries(universityId, "bachelor"), master: getProgramSummaries(universityId, "master") }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [universityId, t],
  );
  const levels = LEVELS.filter((level) => programs[level].length > 0);

  const [level, setLevel] = useState<ProgramLevel>(levels[0] ?? "bachelor");
  const [query, setQuery] = useState("");
  const [faculty, setFaculty] = useState<string | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);

  const levelPrograms = programs[level];
  const faculties = useMemo(() => {
    const counts = new Map<string, number>();
    for (const program of levelPrograms) {
      if (program.faculty) counts.set(program.faculty, (counts.get(program.faculty) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  }, [levelPrograms]);
  const showFacultyFilter = faculties.length >= 2;
  const freeCount = levelPrograms.filter((program) => isFreeTuition(program.tuition)).length;

  const q = query.trim().toLocaleLowerCase();
  const filtered = levelPrograms.filter((program) => {
    if (faculty && program.faculty !== faculty) return false;
    if (freeOnly && !isFreeTuition(program.tuition)) return false;
    if (q && !program.title.toLocaleLowerCase().includes(q) && !(program.faculty ?? "").toLocaleLowerCase().includes(q)) return false;
    return true;
  });
  const isFiltered = Boolean(q || faculty || freeOnly);

  // Group by faculty (in data order) unless one faculty is already picked.
  const grouped = showFacultyFilter && !faculty;
  const groups: Group[] = grouped
    ? [
        ...faculties
          .map((f) => ({ key: f.name, title: f.name, items: filtered.filter((p) => p.faculty === f.name) }))
          .filter((g) => g.items.length > 0),
        ...(filtered.some((p) => !p.faculty)
          ? [{ key: "__other", title: t("programs.otherPrograms"), items: filtered.filter((p) => !p.faculty) }]
          : []),
      ]
    : filtered.length
      ? [{ key: "__all", title: faculty, items: filtered }]
      : [];
  // Rows only repeat the faculty when nothing else on screen names it.
  const showFacultyInRows = !grouped && !faculty && faculties.length === 1;

  const switchLevel = (next: ProgramLevel) => {
    if (next === level) return;
    setLevel(next);
    setFaculty(null);
    setFreeOnly(false);
  };
  const clearFilters = () => {
    setQuery("");
    setFaculty(null);
    setFreeOnly(false);
  };
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/university/${universityId}` as any);
  };
  const openProgram = (slug: string) =>
    router.push({
      pathname: "/university/program/[programId]",
      params: { universityId, level, programId: slug },
    });

  const hero = (
    <PhotoHero
      image={university?.image}
      color={university?.color}
      desktop={desktop}
      topInset={isWeb ? 0 : insets.top}
      height={desktop ? 360 : (isWeb ? 0 : insets.top) + 280}
      backLabel={universityName}
      onBack={goBack}
    >
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: colors.beige }}>
        {t("programs.explore")}
      </Text>
      <HeroTitle title={t("programs.title")} desktop={desktop} />
      <HeroUniversityLine text={[universityName, city].filter(Boolean).join(" · ")} desktop={desktop} />
    </PhotoHero>
  );

  const degreeTiles = levels.length ? (
    <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: desktop ? 16 : 10 }}>
      {levels.map((l) => (
        <DegreeTile
          key={l}
          level={l}
          count={programs[l].length}
          active={l === level}
          interactive={levels.length > 1}
          onPress={() => switchLevel(l)}
          desktop={desktop}
        />
      ))}
    </View>
  ) : null;

  const resultsLine = (
    <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: colors.textMuted }}>
      {isFiltered
        ? t("programs.showing", { count: filtered.length, total: levelPrograms.length })
        : t("programs.available", { count: levelPrograms.length })}
    </Text>
  );

  const emptyState = !levels.length ? (
    <EmptyState title={t("programs.noneAvailable")} />
  ) : filtered.length === 0 ? (
    <EmptyState title={t("programs.noResults")} hint={t("programs.noResultsHint")} actionLabel={t("programs.clearFilters")} onAction={clearFilters} />
  ) : null;

  if (desktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 72 }}>
          <ContentWrap maxWidth={DESKTOP_MAX_WIDTH} style={{ paddingHorizontal: 32, paddingTop: 28 }}>
            {hero}
            {degreeTiles ? <View style={{ marginTop: -HERO_OVERLAP, marginHorizontal: 32 }}>{degreeTiles}</View> : null}

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 40, marginTop: 44 }}>
              {levels.length ? (
                <View
                  style={{
                    width: SIDEBAR_WIDTH, gap: 24,
                    // Sticky, and scrolls on its own when a long faculty list outgrows the window.
                    ...({ position: "sticky", top: 24, maxHeight: "calc(100vh - 48px)", overflowY: "auto" } as any),
                  }}
                >
                  <SearchBar value={query} onChange={setQuery} />
                  {freeCount > 0 ? (
                    <View>
                      <SidebarLabel label={t("programDetail.tuitionShort")} />
                      <View style={{ flexDirection: "row" }}>
                        <Chip label={t("programs.freeOnly")} icon="pricetag-outline" count={freeCount} selected={freeOnly} onPress={() => setFreeOnly(!freeOnly)} />
                      </View>
                    </View>
                  ) : null}
                  {showFacultyFilter ? (
                    <View accessibilityRole="radiogroup">
                      <SidebarLabel label={t("programs.faculties")} />
                      <FacultyOption label={t("programs.allFaculties")} count={levelPrograms.length} selected={!faculty} onPress={() => setFaculty(null)} />
                      {faculties.map((f) => (
                        <FacultyOption key={f.name} label={f.name} count={f.count} selected={faculty === f.name} onPress={() => setFaculty(f.name)} />
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={{ flex: 1, minWidth: 0, gap: 36 }}>
                {levels.length ? resultsLine : null}
                {groups.map((group) => (
                  <View key={group.key} style={{ gap: 16 }}>
                    {group.title ? <GroupHeader title={group.title} count={group.items.length} desktop /> : null}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
                      {group.items.map((program) => (
                        <ProgramCard key={program.slug} program={program} showFaculty={showFacultyInRows} onPress={() => openProgram(program.slug)} />
                      ))}
                    </View>
                  </View>
                ))}
                {emptyState}
              </View>
            </View>
          </ContentWrap>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 40 + (isWeb ? 0 : insets.bottom) }}
      >
        <ContentWrap maxWidth={PHONE_MAX_WIDTH}>
          {hero}
          {degreeTiles ? <View style={{ marginTop: -HERO_OVERLAP, paddingHorizontal: 16 }}>{degreeTiles}</View> : null}

          {levels.length ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
              <SearchBar value={query} onChange={setQuery} />
            </View>
          ) : null}

          {levels.length && (showFacultyFilter || freeCount > 0) ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ marginTop: 12 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              {freeCount > 0 ? (
                <Chip label={t("programs.freeOnly")} icon="pricetag-outline" count={freeCount} selected={freeOnly} onPress={() => setFreeOnly(!freeOnly)} />
              ) : null}
              {freeCount > 0 && showFacultyFilter ? (
                <View style={{ width: 1, marginHorizontal: 4, marginVertical: 8, backgroundColor: colors.divider }} />
              ) : null}
              {showFacultyFilter ? (
                <>
                  <Chip label={t("programs.allFaculties")} selected={!faculty} onPress={() => setFaculty(null)} />
                  {faculties.map((f) => (
                    <Chip
                      key={f.name}
                      label={shortFacultyName(f.name)}
                      count={f.count}
                      selected={faculty === f.name}
                      onPress={() => setFaculty(faculty === f.name ? null : f.name)}
                    />
                  ))}
                </>
              ) : null}
            </ScrollView>
          ) : null}

          <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 26 }}>
            {levels.length ? resultsLine : null}
            {groups.map((group) => (
              <View key={group.key} style={{ gap: 12 }}>
                {group.title ? <GroupHeader title={group.title} count={group.items.length} desktop={false} /> : null}
                <View style={{ borderRadius: 20, overflow: "hidden", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder }}>
                  {group.items.map((program, index) => (
                    <ProgramRow
                      key={program.slug}
                      program={program}
                      showFaculty={showFacultyInRows}
                      first={index === 0}
                      onPress={() => openProgram(program.slug)}
                    />
                  ))}
                </View>
              </View>
            ))}
            {emptyState}
          </View>
        </ContentWrap>
      </ScrollView>
    </View>
  );
}
