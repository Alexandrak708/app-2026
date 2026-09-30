import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  View, Text, ScrollView, TextInput, Pressable, useWindowDimensions,
  type StyleProp, type ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { buildUniversities } from "@/data/university-data";
import type { DegreeLevel, UniversityCategory, UniversityDisplay } from "@/types/university";
import UniversityTile from "@/components/university-tile";
import CompactUniversityCard from "@/components/compact-university-card";
import SiteFooter from "@/components/home/site-footer";
import { WEB_PAGE_GUTTER, WEB_PAGE_MAX_WIDTH } from "@/components/web-top-nav";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import {
  categoriesLabel, categoryCounts, cityOf, groupByCity, searchUniversities,
} from "@/lib/university-groups";

/** University shown large in the hero ("In focus"): the Naval Academy, Varna. */
const FOCUS_UNIVERSITY_ID = "4";
const SIDEBAR_WIDTH = 248;
const SIDEBAR_GAP = 64;
const LIST_COLUMN_GAP = 40;
const GRID_GAP = 24;
/** Collapsed "All universities": this many cities, this many schools each. */
const COLLAPSED_GROUPS = 3;
const COLLAPSED_ROWS = 4;
const SIDEBAR_CITIES = 5;
const SIDEBAR_FIELDS = 6;

type SortMode = "city" | "name";

/** Centred page column shared by every desktop section. */
function Page({ children, style, onLayout }: {
  children: ReactNode; style?: StyleProp<ViewStyle>; onLayout?: (y: number) => void;
}) {
  return (
    <View
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.y) : undefined}
      style={[{ width: "100%", maxWidth: WEB_PAGE_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_PAGE_GUTTER }, style]}
    >
      {children}
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexShrink: 1 }}>
      <Text accessibilityRole="header" style={{ fontFamily: Fonts.displayMedium, fontSize: 48, lineHeight: 52, letterSpacing: -0.4, color: colors.text }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ marginTop: 10, fontFamily: Fonts.body, fontSize: 16, color: colors.textSecondary }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function CircleButton({ icon, label, onPress, disabled, filled }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; disabled?: boolean; filled?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ hovered }: any) => ({
        width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1,
        borderColor: disabled ? colors.softBorder : colors.text,
        backgroundColor: filled && !disabled ? colors.accent : hovered && !disabled ? colors.surface : "transparent",
      })}
    >
      <Ionicons name={icon} size={18} color={disabled ? colors.textMuted : filled ? "#ffffff" : colors.text} />
    </Pressable>
  );
}

function TextLink({ label, onPress, icon = "arrow-forward", size = 15 }: {
  label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap | null; size?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 }}>
      {({ hovered }: any) => (
        <>
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: size, color: hovered ? colors.accentPressed : colors.accent }}>{label}</Text>
          {icon ? <Ionicons name={icon} size={size} color={hovered ? colors.accentPressed : colors.accent} /> : null}
        </>
      )}
    </Pressable>
  );
}

function OptionRow({ label, count, checked, onPress, kind }: {
  label: string; count?: number; checked: boolean; onPress: () => void; kind: "radio" | "checkbox";
}) {
  const { colors } = useAppTheme();
  const radio = kind === "radio";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={kind}
      accessibilityState={{ checked }}
      aria-checked={checked}
      style={{ height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
    >
      {({ hovered }: any) => (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 }}>
            <View
              style={{
                width: 18, height: 18, borderRadius: radio ? 9 : 5, borderWidth: 1.5,
                borderColor: checked ? colors.accent : hovered ? colors.text : colors.textMuted,
                backgroundColor: checked && !radio ? colors.accent : "transparent",
                alignItems: "center", justifyContent: "center",
              }}
            >
              {checked && radio && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />}
              {checked && !radio && <Ionicons name="checkmark" size={13} color="#ffffff" />}
            </View>
            <Text numberOfLines={1} style={{ fontFamily: checked ? Fonts.bodyMedium : Fonts.body, fontSize: 15, color: colors.text }}>
              {label}
            </Text>
          </View>
          {count != null && <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textMuted }}>{count}</Text>}
        </>
      )}
    </Pressable>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View>
      <Text style={{ marginBottom: 8, fontFamily: Fonts.bodyMedium, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: colors.text }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Desktop web Home (≥ 1024px, under the top navigation bar): editorial hero
 * with search, a paged "Most searched" grid, "Explore by city" and the full
 * list with a filter sidebar, grouped by city, then the site footer.
 */
export default function HomeWeb() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const universities = useMemo(() => buildUniversities(t), [t]);
  const cityGroups = useMemo(() => groupByCity(universities), [universities]);
  const fieldCounts = useMemo(() => categoryCounts(universities), [universities]);

  const scrollRef = useRef<ScrollView>(null);
  const listY = useRef(0);

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [fields, setFields] = useState<UniversityCategory[]>([]);
  const [degrees, setDegrees] = useState<DegreeLevel[]>([]);
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("city");
  const [featuredPage, setFeaturedPage] = useState(0);
  const [expandedCities, setExpandedCities] = useState<string[]>([]);
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [moreCities, setMoreCities] = useState(false);
  const [moreFields, setMoreFields] = useState(false);

  // Layout maths (page is capped at WEB_PAGE_MAX_WIDTH, minus the gutters).
  const contentWidth = Math.min(width, WEB_PAGE_MAX_WIDTH) - WEB_PAGE_GUTTER * 2;
  const roomy = contentWidth >= 1100;
  const columns = roomy ? 4 : 3;
  const tileWidth = (contentWidth - GRID_GAP * (columns - 1)) / columns;
  const heroImageWidth = Math.min(500, Math.round(contentWidth * 0.42));
  const headlineSize = roomy ? 92 : 72;
  const listWidth = contentWidth - SIDEBAR_WIDTH - SIDEBAR_GAP;
  const listColumns = listWidth >= 760 ? 2 : 1;
  const rowWidth = (listWidth - LIST_COLUMN_GAP * (listColumns - 1)) / listColumns;

  const focus = universities.find((u) => u.id === FOCUS_UNIVERSITY_ID) ?? universities[0];
  const featured = useMemo(() => [...universities].sort((a, b) => b.rating - a.rating), [universities]);
  const pageCount = Math.max(1, Math.ceil(featured.length / columns));
  const page = Math.min(featuredPage, pageCount - 1);
  const featuredVisible = featured.slice(page * columns, page * columns + columns);

  const hasQuery = query.trim().length > 0;
  const filtersActive = city !== null || fields.length > 0 || degrees.length > 0 || scholarshipOnly;

  const filtered = universities.filter((u) => {
    if (city && cityOf(u) !== city) return false;
    if (fields.length > 0 && !fields.some((f) => u.categories.includes(f))) return false;
    if (degrees.length > 0 && !degrees.some((d) => u.degreeLevels.includes(d))) return false;
    if (scholarshipOnly && !u.scholarship) return false;
    return true;
  });
  const results = hasQuery ? searchUniversities(filtered, query) : filtered;

  const scrollToList = () => {
    setCityMenuOpen(false);
    scrollRef.current?.scrollTo({ y: Math.max(0, listY.current - 24), animated: true });
  };
  const openUniversity = (u: UniversityDisplay) => router.push(`/university/${u.id}` as any);
  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  const clearFilters = () => {
    setCity(null);
    setFields([]);
    setDegrees([]);
    setScholarshipOnly(false);
  };
  const pickCity = (next: string | null) => {
    setCity(next);
    setCityMenuOpen(false);
  };

  // ---- "All universities" body -------------------------------------------
  const renderRows = (items: UniversityDisplay[], showCity: boolean) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: LIST_COLUMN_GAP }}>
      {items.map((item) => (
        <View key={item.id} style={{ width: rowWidth }}>
          <CompactUniversityCard
            item={item}
            thumbSize={76}
            titleSize={21}
            meta={showCity ? undefined : categoriesLabel(item, t)}
            onPress={() => openUniversity(item)}
          />
        </View>
      ))}
    </View>
  );

  let listBody: ReactNode;
  if (results.length === 0) {
    listBody = (
      <View style={{ alignItems: "center", paddingVertical: 56 }}>
        <Ionicons name="search-outline" size={40} color={colors.textMuted} />
        <Text style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 24, marginTop: 12 }}>{t("search.noResults")}</Text>
        <Text style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>{t("search.tryDifferent")}</Text>
      </View>
    );
  } else if (hasQuery || sort === "name") {
    const items = hasQuery ? results : [...results].sort((a, b) => a.name.localeCompare(b.name));
    listBody = renderRows(items, true);
  } else {
    const groups = groupByCity(results);
    const collapsed = !filtersActive && !showAllGroups;
    const visibleGroups = collapsed ? groups.slice(0, COLLAPSED_GROUPS) : groups;
    const hiddenGroups = groups.slice(visibleGroups.length);
    const hiddenCount = hiddenGroups.reduce((sum, g) => sum + g.items.length, 0);

    listBody = (
      <View style={{ gap: 48 }}>
        {visibleGroups.map((group) => {
          const expanded = !collapsed || expandedCities.includes(group.city);
          const items = expanded ? group.items : group.items.slice(0, COLLAPSED_ROWS);
          return (
            <View key={group.city}>
              <View
                style={{
                  paddingBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
                  borderBottomWidth: 1, borderBottomColor: colors.divider,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 14 }}>
                  <Text style={{ fontFamily: Fonts.heading, fontSize: 32, lineHeight: 36, color: colors.text }}>{group.city}</Text>
                  <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.textMuted }}>
                    {t("home.institutions", { count: group.items.length })}
                  </Text>
                </View>
                {!expanded && group.items.length > COLLAPSED_ROWS && (
                  <TextLink
                    size={14}
                    label={t("home.viewAllCount", { count: group.items.length })}
                    onPress={() => setExpandedCities((current) => [...current, group.city])}
                  />
                )}
              </View>
              {renderRows(items, false)}
            </View>
          );
        })}

        {hiddenGroups.length > 0 && (
          <View
            style={{
              paddingVertical: 28, paddingLeft: 32, paddingRight: 28, borderRadius: 18, backgroundColor: colors.surface,
              flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 24,
            }}
          >
            <View style={{ flexShrink: 1 }}>
              <Text style={{ fontFamily: Fonts.heading, fontSize: 27, lineHeight: 31, color: colors.text }}>
                {t("home.andMore", { count: hiddenCount, cities: hiddenGroups.length })}
              </Text>
              <Text numberOfLines={1} style={{ marginTop: 6, fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary }}>
                {hiddenGroups.slice(0, 6).map((g) => g.city).join(", ")}
                {hiddenGroups.length > 6 ? " …" : ""}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowAllGroups(true)}
              accessibilityRole="button"
              style={({ hovered }: any) => ({
                height: 50, paddingHorizontal: 26, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10,
                backgroundColor: colors.solid, opacity: hovered ? 0.88 : 1,
              })}
            >
              <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: colors.onSolid }}>
                {t("home.showAllCount", { count: results.length })}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.onSolid} />
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  const listSubtitle = hasQuery
    ? t("search.found", { count: results.length })
    : sort === "name"
      ? t("home.sortedByName", { count: results.length })
      : t("home.groupedByCity", { count: results.length });

  const sidebarCities = moreCities ? cityGroups : cityGroups.slice(0, SIDEBAR_CITIES);
  const sidebarFields = moreFields ? fieldCounts : fieldCounts.slice(0, SIDEBAR_FIELDS);

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
      {/* ---------------- Hero ---------------- */}
      <View style={{ zIndex: 10 }}>
        <Page style={{ paddingTop: 64, paddingBottom: 88, flexDirection: "row", alignItems: "center", gap: 72 }}>
          <View style={{ flex: 1, minWidth: 0, zIndex: 10 }}>
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: colors.accent }}>
              {t("home.kicker")}
            </Text>
            <Text
              accessibilityRole="header"
              style={{
                marginTop: 22, fontFamily: Fonts.display, fontSize: headlineSize, lineHeight: Math.round(headlineSize * 0.98),
                letterSpacing: -1.2, color: colors.text,
              }}
            >
              {t("home.headlineLead")}
              {"\n"}
              <Text style={{ fontFamily: Fonts.displayItalic, color: colors.accent }}>{t("home.headlineAccent")}</Text>
            </Text>
            <Text style={{ marginTop: 28, maxWidth: 520, fontFamily: Fonts.body, fontSize: 18, lineHeight: 30, color: colors.textSecondary }}>
              {t("home.intro", { count: universities.length, cities: cityGroups.length })}
            </Text>

            {/* Search bar */}
            <View
              style={{
                // zIndex keeps the city dropdown above the chips below (every
                // react-native-web View is its own stacking context).
                zIndex: 20,
                marginTop: 40, height: 68, paddingLeft: 22, paddingRight: 9, borderRadius: 18, borderWidth: 1,
                borderColor: searchFocused ? colors.accent : colors.border, backgroundColor: colors.card,
                flexDirection: "row", alignItems: "center", gap: 14,
                shadowColor: "#21030d", shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 12 },
              }}
            >
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onSubmitEditing={scrollToList}
                placeholder={t("home.searchPlaceholder")}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={t("home.searchPlaceholder")}
                returnKeyType="search"
                style={{ flex: 1, minWidth: 0, height: "100%", fontFamily: Fonts.body, fontSize: 16, color: colors.text, outlineStyle: "none" } as any}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel={t("search.clearAll")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
              <View style={{ width: 1, height: 28, backgroundColor: colors.border }} />
              <Pressable
                onPress={() => setCityMenuOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityState={{ expanded: cityMenuOpen }}
                style={{ height: 48, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="location-outline" size={18} color={colors.accent} />
                <Text numberOfLines={1} style={{ fontFamily: Fonts.body, fontSize: 15, color: colors.text, maxWidth: 170 }}>
                  {city ?? t("home.allCities")}
                </Text>
                <Ionicons name={cityMenuOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
              </Pressable>
              <Pressable
                onPress={scrollToList}
                accessibilityRole="button"
                style={({ hovered }: any) => ({
                  height: 50, paddingHorizontal: 28, borderRadius: 12, justifyContent: "center",
                  backgroundColor: hovered ? colors.accentPressed : colors.accent,
                })}
              >
                <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: "#ffffff" }}>{t("home.searchButton")}</Text>
              </Pressable>

              {cityMenuOpen && (
                <View
                  style={{
                    position: "absolute", top: 74, right: 110, width: 280, maxHeight: 380, zIndex: 30, borderRadius: 14,
                    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingVertical: 6,
                    shadowColor: "#21030d", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 16 },
                  }}
                >
                  <ScrollView>
                    {[{ city: null as string | null, count: universities.length }, ...cityGroups.map((g) => ({ city: g.city, count: g.items.length }))].map((option) => {
                      const selected = option.city === city;
                      return (
                        <Pressable
                          key={option.city ?? "all"}
                          onPress={() => pickCity(option.city)}
                          accessibilityRole="menuitem"
                          style={({ hovered }: any) => ({
                            height: 40, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                            backgroundColor: hovered ? colors.surface : "transparent",
                          })}
                        >
                          <Text style={{ fontFamily: selected ? Fonts.bodyMedium : Fonts.body, fontSize: 14.5, color: selected ? colors.accent : colors.text }}>
                            {option.city ?? t("home.allCities")}
                          </Text>
                          <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textMuted }}>{option.count}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Popular fields */}
            <View style={{ marginTop: 22, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.textMuted, marginRight: 4 }}>{t("home.popularFields")}</Text>
              {fieldCounts.slice(0, 5).map(({ category }) => {
                const selected = fields.length === 1 && fields[0] === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => {
                      setFields(selected ? [] : [category]);
                      if (!selected) scrollToList();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ hovered }: any) => ({
                      height: 36, paddingHorizontal: 16, borderRadius: 18, justifyContent: "center", borderWidth: 1,
                      borderColor: selected ? colors.accent : hovered ? colors.text : colors.border,
                      backgroundColor: selected ? colors.accent : "transparent",
                    })}
                  >
                    <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: selected ? "#ffffff" : colors.text }}>
                      {t(`categories.${category}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Photo, stats and "in focus" caption */}
          <View style={{ width: heroImageWidth, height: 540 }}>
            <View style={{ flex: 1, borderRadius: 24, overflow: "hidden", backgroundColor: colors.surface }}>
              <ExpoImage source={focus.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
            <View
              style={{
                position: "absolute", left: -48, top: 40, width: 172, paddingVertical: 24, paddingHorizontal: 26, borderRadius: 18,
                backgroundColor: colors.inkSurface, gap: 16,
                shadowColor: "#21030d", shadowOpacity: 0.24, shadowRadius: 22, shadowOffset: { width: 0, height: 22 },
              }}
            >
              {[
                [universities.length, t("home.statInstitutions")],
                [cityGroups.length, t("home.statCities")],
                [fieldCounts.length, t("home.statFields")],
              ].map(([value, label], i) => (
                <View key={String(label)} style={{ gap: 16 }}>
                  {i > 0 && <View style={{ height: 1, backgroundColor: "rgba(246,239,233,0.16)" }} />}
                  <View>
                    <Text style={{ fontFamily: Fonts.displayMedium, fontSize: 48, lineHeight: 50, color: colors.onInk }}>{value}</Text>
                    <Text style={{ marginTop: 2, fontFamily: Fonts.body, fontSize: 13, color: colors.onInkMuted }}>{label}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => openUniversity(focus)}
              accessibilityRole="link"
              style={({ hovered }: any) => ({
                position: "absolute", left: 20, right: 20, bottom: 20, paddingVertical: 18, paddingLeft: 22, paddingRight: 18,
                borderRadius: 16, backgroundColor: hovered ? "#ffffff" : "rgba(251,250,250,0.96)",
                flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16,
              })}
            >
              <View style={{ flexShrink: 1 }}>
                <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: "#810B38" }}>
                  {t("home.inFocus")} · {cityOf(focus)}
                </Text>
                <Text numberOfLines={2} style={{ marginTop: 6, fontFamily: Fonts.heading, fontSize: 25, lineHeight: 28, color: "#201f1d" }}>
                  {focus.name}
                </Text>
              </View>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#810B38", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </View>
            </Pressable>
          </View>
        </Page>
      </View>

      {!hasQuery && (
        <>
          {/* ---------------- Most searched ---------------- */}
          <Page style={{ paddingBottom: 104 }}>
            <View style={{ marginBottom: 32, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
              <SectionTitle title={t("home.recommended")} subtitle={t("home.featuredSubtitle")} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ marginRight: 14 }}>
                  <TextLink label={t("home.viewAll")} onPress={scrollToList} />
                </View>
                <CircleButton icon="chevron-back" label={t("home.previous")} disabled={page === 0} onPress={() => setFeaturedPage(page - 1)} />
                <CircleButton icon="chevron-forward" label={t("home.next")} disabled={page >= pageCount - 1} onPress={() => setFeaturedPage(page + 1)} />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: GRID_GAP, alignItems: "flex-start" }}>
              {featuredVisible.map((item) => (
                <UniversityTile key={item.id} item={item} variant="web" width={tileWidth} photoHeight={228} onPress={() => openUniversity(item)} />
              ))}
            </View>
          </Page>

          {/* ---------------- Explore by city ---------------- */}
          <View style={{ backgroundColor: colors.surface }}>
            <Page style={{ paddingVertical: 96 }}>
              <View style={{ marginBottom: 36 }}>
                <SectionTitle
                  title={t("home.byCity")}
                  subtitle={t("home.byCitySubtitle", {
                    first: cityGroups[0]?.city,
                    last: cityGroups[cityGroups.length - 1]?.city,
                    count: universities.length,
                    cities: cityGroups.length,
                  })}
                />
              </View>
              <View style={{ flexDirection: "row", gap: GRID_GAP }}>
                {cityGroups.slice(0, columns).map((group) => (
                  <Pressable
                    key={group.city}
                    onPress={() => { setCity(group.city); scrollToList(); }}
                    accessibilityRole="link"
                    style={({ hovered }: any) => ({
                      width: tileWidth, borderRadius: 18, overflow: "hidden", backgroundColor: colors.card,
                      shadowColor: "#21030d", shadowOpacity: hovered ? 0.12 : 0.04, shadowRadius: hovered ? 20 : 3,
                      shadowOffset: { width: 0, height: hovered ? 12 : 1 },
                    })}
                  >
                    <ExpoImage source={group.items[0].image} style={{ width: "100%", height: 188 }} contentFit="cover" />
                    <View style={{ paddingVertical: 18, paddingLeft: 20, paddingRight: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <View style={{ flexShrink: 1 }}>
                        <Text numberOfLines={1} style={{ fontFamily: Fonts.heading, fontSize: 29, lineHeight: 32, color: colors.text }}>{group.city}</Text>
                        <Text style={{ marginTop: 4, fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary }}>
                          {t("home.institutions", { count: group.items.length })}
                        </Text>
                      </View>
                      <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="arrow-forward" size={16} color={colors.accent} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
              <View style={{ marginTop: 28, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary, marginRight: 6 }}>{t("home.moreCities")}</Text>
                {cityGroups.slice(columns).map((group) => (
                  <Pressable
                    key={group.city}
                    onPress={() => { setCity(group.city); scrollToList(); }}
                    accessibilityRole="link"
                    style={({ hovered }: any) => ({
                      height: 40, paddingLeft: 16, paddingRight: 6, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 10,
                      backgroundColor: colors.card, borderWidth: 1, borderColor: hovered ? colors.text : colors.softBorder,
                    })}
                  >
                    <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.text }}>{group.city}</Text>
                    <View style={{ minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 8, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: colors.textSecondary }}>{group.items.length}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </Page>
          </View>
        </>
      )}

      {/* ---------------- All universities ---------------- */}
      <Page style={{ paddingTop: hasQuery ? 8 : 104, paddingBottom: 112 }} onLayout={(y) => { listY.current = y; }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <SectionTitle title={t("home.allUniversities")} subtitle={listSubtitle} />
          {!hasQuery && (
            <View style={{ flexDirection: "row", padding: 3, gap: 2, borderRadius: 12, backgroundColor: colors.surface }}>
              {(["city", "name"] as const).map((mode) => {
                const selected = sort === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setSort(mode)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={{
                      height: 38, paddingHorizontal: 16, borderRadius: 9, justifyContent: "center",
                      backgroundColor: selected ? colors.card : "transparent",
                      shadowColor: "#21030d", shadowOpacity: selected ? 0.08 : 0, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
                    }}
                  >
                    <Text style={{ fontFamily: selected ? Fonts.bodyMedium : Fonts.body, fontSize: 14, color: selected ? colors.text : colors.textSecondary }}>
                      {mode === "city" ? t("home.sortCity") : t("home.sortName")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ marginTop: 40, flexDirection: "row", alignItems: "flex-start", gap: SIDEBAR_GAP }}>
          {/* Filters */}
          <View style={{ width: SIDEBAR_WIDTH, gap: 28 }}>
            <FilterGroup title={t("home.filterCity")}>
              <OptionRow kind="radio" label={t("home.all")} count={universities.length} checked={city === null} onPress={() => setCity(null)} />
              {sidebarCities.map((group) => (
                <OptionRow key={group.city} kind="radio" label={group.city} count={group.items.length}
                  checked={city === group.city} onPress={() => setCity(group.city)} />
              ))}
              {cityGroups.length > SIDEBAR_CITIES && (
                <TextLink
                  size={14}
                  icon={null}
                  label={moreCities ? t("home.showLess") : t("home.moreCitiesToggle", { count: cityGroups.length - SIDEBAR_CITIES })}
                  onPress={() => setMoreCities((v) => !v)}
                />
              )}
            </FilterGroup>
            <View style={{ height: 1, backgroundColor: colors.softBorder }} />
            <FilterGroup title={t("home.filterField")}>
              {sidebarFields.map(({ category, count }) => (
                <OptionRow key={category} kind="checkbox" label={t(`categories.${category}`)} count={count}
                  checked={fields.includes(category)} onPress={() => setFields((f) => toggle(f, category))} />
              ))}
              {fieldCounts.length > SIDEBAR_FIELDS && (
                <TextLink
                  size={14}
                  icon={null}
                  label={moreFields ? t("home.showLess") : t("home.moreFieldsToggle", { count: fieldCounts.length - SIDEBAR_FIELDS })}
                  onPress={() => setMoreFields((v) => !v)}
                />
              )}
            </FilterGroup>
            <View style={{ height: 1, backgroundColor: colors.softBorder }} />
            <FilterGroup title={t("home.filterDegree")}>
              {(["Bachelor", "Master"] as const).map((d) => (
                <OptionRow key={d} kind="checkbox" label={t(`degrees.${d}`)}
                  count={universities.filter((u) => u.degreeLevels.includes(d)).length}
                  checked={degrees.includes(d)} onPress={() => setDegrees((v) => toggle(v, d))} />
              ))}
            </FilterGroup>
            <View style={{ height: 1, backgroundColor: colors.softBorder }} />
            <FilterGroup title={t("home.filterScholarship")}>
              <OptionRow kind="checkbox" label={t("home.scholarshipOnly")}
                count={universities.filter((u) => u.scholarship).length}
                checked={scholarshipOnly} onPress={() => setScholarshipOnly((v) => !v)} />
            </FilterGroup>
            <Pressable
              onPress={clearFilters}
              disabled={!filtersActive}
              accessibilityRole="button"
              style={({ hovered }: any) => ({
                height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center",
                borderColor: filtersActive && hovered ? colors.text : colors.border, opacity: filtersActive ? 1 : 0.5,
              })}
            >
              <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.text }}>{t("home.clearFilters")}</Text>
            </Pressable>
          </View>

          {/* Results */}
          <View style={{ width: listWidth }}>{listBody}</View>
        </View>
      </Page>

      <SiteFooter onHome={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </ScrollView>
  );
}
