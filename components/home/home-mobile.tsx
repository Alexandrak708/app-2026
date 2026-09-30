import { useMemo, useRef, useState } from "react";
import {
  View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable,
  TouchableOpacity, useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildUniversities } from "@/data/university-data";
import UniversityTile from "@/components/university-tile";
import CompactUniversityCard from "@/components/compact-university-card";
import { Wordmark } from "@/components/wordmark";
import { Hairline } from "@/components/editorial";
import { ContentWrap, isWeb } from "@/components/responsive";
import { useAppTheme } from "@/hooks/use-theme-color";
import { useAppSettings } from "@/contexts/settings-context";
import { Fonts } from "@/constants/typography";
import { ALL_CATEGORIES, categoryCounts, groupByCity, searchUniversities } from "@/lib/university-groups";

/** Narrow web shows the phone layout in a centred column this wide. */
const PHONE_MAX_WIDTH = 720;
const GUTTER = 20;
const TILE_WIDTH = 268;
const TILE_GAP = 14;
const FILTER_PANEL_HEIGHT = 340;
const PREVIEW_ROWS = 5;
const CITY_TILES = 6;

type Degree = "Bachelor" | "Master";

/** Rounded filter chip: burgundy fill when selected, hairline outline when not. */
function Chip({ label, selected, onPress, count }: { label: string; selected: boolean; onPress: () => void; count?: number }) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        height: 40, paddingLeft: 16, paddingRight: count != null ? 6 : 16, borderRadius: 20,
        flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1,
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.accent : "transparent",
      }}
    >
      <Text style={{ fontFamily: selected ? Fonts.bodyMedium : Fonts.body, fontSize: 14, color: selected ? "#ffffff" : colors.text }}>
        {label}
      </Text>
      {count != null && (
        <View
          style={{
            minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 7, alignItems: "center", justifyContent: "center",
            backgroundColor: selected ? "rgba(255,255,255,0.18)" : colors.surface,
          }}
        >
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, color: selected ? "#ffffff" : colors.textSecondary }}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, actionLabel, onAction, trailing }: {
  title: string; actionLabel?: string; onAction?: () => void; trailing?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ paddingHorizontal: GUTTER, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
      <Text style={{ fontFamily: Fonts.heading, fontSize: 27, lineHeight: 31, color: colors.text }}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={10} accessibilityRole="link">
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: colors.accent, paddingVertical: 8 }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : trailing ? (
        <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textMuted }}>{trailing}</Text>
      ) : null}
    </View>
  );
}

/**
 * Phone Home (native app + narrow web): wordmark and profile, the editorial
 * headline, search with the slide-down filter panel, field chips, a
 * "Most searched" carousel, city shortcuts and a short preview of the full
 * list, which lives on `/universities`.
 */
export default function HomeMobile() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { reduceMotion } = useAppSettings();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const universities = useMemo(() => buildUniversities(t), [t]);

  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const filterHeight = useSharedValue(0);
  const filterPanelStyle = useAnimatedStyle(() => ({ height: filterHeight.get(), overflow: "hidden" }));

  const toggleFilters = () => {
    const opening = !showFilters;
    setShowFilters(opening);
    filterHeight.set(withTiming(opening ? FILTER_PANEL_HEIGHT : 0, {
      duration: reduceMotion ? 0 : 320, easing: Easing.out(Easing.cubic),
    }));
  };

  const activeFiltersCount = [selectedDegree, selectedScholarship, selectedCategory, selectedCountry]
    .filter((f) => f !== null).length;

  const clearFilters = () => {
    setSelectedDegree(null);
    setSelectedScholarship(null);
    setSelectedCategory(null);
    setSelectedCountry(null);
  };

  const filtered = universities.filter((u) => {
    if (selectedDegree && !u.degreeLevels.includes(selectedDegree)) return false;
    if (selectedScholarship !== null && u.scholarship !== selectedScholarship) return false;
    if (selectedCategory && !u.categories.includes(selectedCategory as any)) return false;
    if (selectedCountry && u.countryKey !== selectedCountry) return false;
    return true;
  });

  const hasQuery = searchText.trim().length > 0;
  const results = hasQuery ? searchUniversities(filtered, searchText) : filtered;

  // "Most searched": the highest-rated schools first, data order within a rating.
  const featured = [...filtered].sort((a, b) => b.rating - a.rating).slice(0, 12);
  const cityGroups = useMemo(() => groupByCity(universities), [universities]);
  const fieldChips = useMemo(() => categoryCounts(universities), [universities]);

  const contentWidth = Math.min(screenWidth || 390, PHONE_MAX_WIDTH);
  const cityTileWidth = (contentWidth - GUTTER * 2 - 10) / 2;

  const openUniversity = (id: string) => router.push(`/university/${id}` as any);
  const openList = (city?: string) => router.push({
    pathname: "/universities",
    params: { ...(city ? { city } : {}), ...(selectedCategory ? { category: selectedCategory } : {}) },
  } as any);

  const panelLabel = {
    fontFamily: Fonts.bodyMedium, fontSize: 11, color: colors.textMuted, letterSpacing: 1.2,
    textTransform: "uppercase" as const, marginBottom: 10,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
       <ContentWrap maxWidth={PHONE_MAX_WIDTH}>
        {/* Wordmark + profile */}
        <View
          style={{
            paddingTop: (isWeb ? 20 : insets.top) + 14, paddingHorizontal: GUTTER,
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Wordmark size={30} />
          <Pressable
            onPress={() => router.push("/profile" as any)}
            accessibilityRole="button"
            accessibilityLabel={t("home.profile")}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="person-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Headline */}
        <View style={{ paddingHorizontal: GUTTER, paddingTop: 22 }}>
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: colors.accent }}>
            {t("home.kicker")}
          </Text>
          <Text
            accessibilityRole="header"
            style={{ marginTop: 12, fontFamily: Fonts.display, fontSize: 44, lineHeight: 44, letterSpacing: -0.4, color: colors.text }}
          >
            {t("home.headlineLead")}
            {"\n"}
            <Text style={{ fontFamily: Fonts.displayItalic, color: colors.accent }}>{t("home.headlineAccent")}</Text>
          </Text>
        </View>

        {/* Search + filters */}
        <View style={{ paddingHorizontal: GUTTER, paddingTop: 22, flexDirection: "row", gap: 10 }}>
          <View
            style={{
              flex: 1, height: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16,
              borderRadius: 14, borderWidth: 1, borderColor: isSearchFocused ? colors.accent : colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              ref={inputRef}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={t("home.searchPlaceholder")}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t("home.searchPlaceholder")}
              returnKeyType="search"
              style={[
                { flex: 1, fontFamily: Fonts.body, fontSize: 15, color: colors.text, paddingVertical: 0 },
                isWeb ? ({ outlineStyle: "none" } as any) : null,
              ]}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("search.clearAll")}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={toggleFilters}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t("home.filters")}
            accessibilityState={{ expanded: showFilters }}
            style={{
              width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center",
              backgroundColor: colors.solid,
            }}
          >
            <Ionicons name="options-outline" size={20} color={colors.onSolid} />
            {activeFiltersCount > 0 && (
              <View
                style={{
                  position: "absolute", top: 7, right: 7, minWidth: 16, height: 16, borderRadius: 8,
                  backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 10, fontFamily: Fonts.bodyMedium }}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Slide-down filter panel */}
        <Animated.View
          style={[
            filterPanelStyle,
            {
              marginHorizontal: GUTTER, marginTop: showFilters ? 12 : 0, borderRadius: 16,
              borderWidth: showFilters ? 1 : 0, borderColor: colors.border, backgroundColor: colors.card,
            },
          ]}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 18 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
          >
            <Text style={panelLabel}>{t("home.filterDegree")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {(["Bachelor", "Master"] as const).map((d) => (
                <Chip key={d} label={t(`degrees.${d}`)} selected={selectedDegree === d}
                  onPress={() => setSelectedDegree(selectedDegree === d ? null : d)} />
              ))}
            </View>
            <Text style={panelLabel}>{t("home.filterScholarship")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <Chip label={t("filters.yes")} selected={selectedScholarship === true}
                onPress={() => setSelectedScholarship(selectedScholarship === true ? null : true)} />
              <Chip label={t("filters.no")} selected={selectedScholarship === false}
                onPress={() => setSelectedScholarship(selectedScholarship === false ? null : false)} />
            </View>
            <Text style={panelLabel}>{t("home.filterField")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ALL_CATEGORIES.map((c) => (
                <Chip key={c} label={t(`categories.${c}`)} selected={selectedCategory === c}
                  onPress={() => setSelectedCategory(selectedCategory === c ? null : c)} />
              ))}
            </View>
            <Text style={panelLabel}>{t("filters.country")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              <Chip label={t("countries.Bulgaria")} selected={selectedCountry === "Bulgaria"}
                onPress={() => setSelectedCountry(selectedCountry === "Bulgaria" ? null : "Bulgaria")} />
            </View>
            <Hairline style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textSecondary }}>
                {t("search.found", { count: filtered.length })}
              </Text>
              {activeFiltersCount > 0 && (
                <TouchableOpacity onPress={clearFilters} hitSlop={10}>
                  <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, color: colors.accent }}>{t("search.clearAll")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Field chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16, flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8 }}
        >
          <Chip label={t("home.all")} selected={selectedCategory === null} onPress={() => setSelectedCategory(null)} />
          {fieldChips.map(({ category }) => (
            <Chip
              key={category}
              label={t(`categories.${category}`)}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
            />
          ))}
        </ScrollView>

        {hasQuery ? (
          <View style={{ paddingTop: 26 }}>
            <SectionHeader title={t("search.found", { count: results.length })} />
            {results.length > 0 ? (
              <View style={{ paddingHorizontal: GUTTER, marginTop: 6 }}>
                {results.map((item, i) => (
                  <CompactUniversityCard key={item.id} item={item} isLast={i === results.length - 1}
                    onPress={() => openUniversity(item.id)} />
                ))}
              </View>
            ) : (
              <View style={{ alignItems: "center", marginTop: 36, paddingHorizontal: GUTTER }}>
                <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                <Text style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 20, marginTop: 12 }}>{t("search.noResults")}</Text>
                <Text style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: "center" }}>
                  {t("search.tryDifferent")}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Most searched */}
            <View style={{ marginTop: 30 }}>
              <SectionHeader title={t("home.recommended")} actionLabel={t("home.viewAll")} onAction={() => openList()} />
              {featured.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={TILE_WIDTH + TILE_GAP}
                  decelerationRate="fast"
                  style={{ marginTop: 8 }}
                  contentContainerStyle={{ paddingHorizontal: GUTTER, gap: TILE_GAP }}
                >
                  {featured.map((item) => (
                    <UniversityTile key={item.id} item={item} width={TILE_WIDTH} onPress={() => openUniversity(item.id)} />
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ paddingHorizontal: GUTTER, marginTop: 10, fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary }}>
                  {t("search.tryDifferent")}
                </Text>
              )}
            </View>

            {/* By city */}
            <View style={{ marginTop: 32 }}>
              <SectionHeader
                title={t("home.byCityShort")}
                actionLabel={t("home.allCount", { count: cityGroups.length })}
                onAction={() => openList()}
              />
              <View style={{ marginTop: 8, paddingHorizontal: GUTTER, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {cityGroups.slice(0, CITY_TILES).map((group) => (
                  <Pressable
                    key={group.city}
                    onPress={() => openList(group.city)}
                    accessibilityRole="link"
                    accessibilityLabel={`${group.city}, ${t("home.institutions", { count: group.items.length })}`}
                    style={({ pressed }) => ({
                      width: cityTileWidth, padding: 12, borderRadius: 16, gap: 10, backgroundColor: colors.card,
                      borderWidth: 1, borderColor: colors.softBorder, opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    {/* Photo + arrow on top so the city name below gets the card's full
                        width — long names like "Благоевград" never break mid-word. */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface }}>
                        <ExpoImage source={group.items[0].image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={colors.accent} />
                    </View>
                    <View>
                      <Text numberOfLines={2} style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 19, color: colors.text }}>
                        {group.city}
                      </Text>
                      <Text numberOfLines={1} style={{ fontFamily: Fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
                        {t("home.institutions", { count: group.items.length })}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* All universities (preview) */}
            <View style={{ marginTop: 32 }}>
              <SectionHeader title={t("home.allUniversities")} trailing={String(filtered.length)} />
              <View style={{ paddingHorizontal: GUTTER, marginTop: 4 }}>
                {filtered.slice(0, PREVIEW_ROWS).map((item, i, arr) => (
                  <CompactUniversityCard key={item.id} item={item} isLast={i === arr.length - 1}
                    onPress={() => openUniversity(item.id)} />
                ))}
                <TouchableOpacity
                  onPress={() => openList()}
                  activeOpacity={0.75}
                  accessibilityRole="link"
                  style={{
                    marginTop: 18, height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.text,
                    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: colors.text }}>
                    {t("home.viewAllCount", { count: filtered.length })}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
       </ContentWrap>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
