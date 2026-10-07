import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Pressable } from "@/components/pressable";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { buildUniversities } from "@/data/university-data";
import type { UniversityDisplay, UniversityId } from "@/types/university";
import UniversityTile from "@/components/university-tile";
import SiteFooter from "@/components/home/site-footer";
import { WEB_PAGE_GUTTER, WEB_PAGE_MAX_WIDTH } from "@/components/web-top-nav";
import { useFavourites } from "@/contexts/favourites-context";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { ContentWrap, isWeb, useIsDesktopWeb } from "@/components/responsive";
import { cityOf } from "@/lib/university-groups";

/** Phone layout column; narrow web shows two tiles per row inside it. */
const PHONE_MAX_WIDTH = 860;
const GRID_GAP = 24;

/** Deep burgundy strip with the shortlist's numbers, like the Home hero's stats card. */
function StatsCard({ list, desktop }: { list: UniversityDisplay[]; desktop: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const cities = new Set(list.map(cityOf)).size;
  const fields = new Set(list.flatMap((u) => u.categories)).size;
  const stats: [number, string][] = [
    [list.length, t("favourites.statSaved", { count: list.length })],
    [cities, t("favourites.statCities", { count: cities })],
    [fields, t("favourites.statFields", { count: fields })],
  ];

  return (
    <View
      style={{
        flexDirection: "row", borderRadius: desktop ? 20 : 18, backgroundColor: colors.inkSurface,
        paddingVertical: desktop ? 24 : 18,
        shadowColor: "#21030d", shadowOpacity: 0.2, shadowRadius: 22, shadowOffset: { width: 0, height: 16 }, elevation: 6,
      }}
    >
      {stats.map(([value, label], index) => (
        <View
          key={label}
          style={{
            flex: 1, paddingHorizontal: desktop ? 26 : 14,
            borderLeftWidth: index ? 1 : 0, borderLeftColor: "rgba(246,239,233,0.16)",
          }}
        >
          <Text style={{ fontFamily: Fonts.displayMedium, fontSize: desktop ? 46 : 34, lineHeight: desktop ? 48 : 36, color: colors.onInk }}>
            {value}
          </Text>
          <Text style={{ marginTop: 4, fontFamily: Fonts.body, fontSize: desktop ? 13 : 12, lineHeight: desktop ? 18 : 16, color: colors.onInkMuted }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function CompareHint() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, backgroundColor: colors.accentTint }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.card }}>
        <Ionicons name="swap-horizontal-outline" size={19} color={colors.accent} />
      </View>
      <Text style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, color: colors.text }}>{t("favourites.compareHint")}</Text>
    </View>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 24 }}>
      <View style={{ width: 92, height: 92, borderRadius: 46, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
        <Ionicons name="heart-outline" size={40} color={colors.accent} />
      </View>
      <Text style={{ marginTop: 20, fontFamily: Fonts.heading, fontSize: 28, lineHeight: 32, textAlign: "center", color: colors.text }}>
        {t("favourites.emptyTitle")}
      </Text>
      <Text style={{ marginTop: 8, maxWidth: 340, fontFamily: Fonts.body, fontSize: 15, lineHeight: 23, textAlign: "center", color: colors.textSecondary }}>
        {t("favourites.emptyMessage")}
      </Text>
      <Pressable
        onPress={onBrowse}
        accessibilityRole="button"
        style={({ pressed }) => ({
          marginTop: 24, height: 52, paddingHorizontal: 24, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 10,
          backgroundColor: colors.solid, opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="search-outline" size={18} color={colors.onSolid} />
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: colors.onSolid }}>{t("favourites.browse")}</Text>
      </Pressable>
    </View>
  );
}

/** Floating bar once a university is picked for comparison: thumbnails, status, go + clear. */
function CompareBar({ selected, onCompare, onClear }: { selected: UniversityDisplay[]; onCompare: () => void; onClear: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const ready = selected.length === 2;

  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, paddingLeft: 8, paddingRight: 8,
        borderRadius: 999, backgroundColor: colors.inkSurface, maxWidth: 520,
        shadowColor: "#21030d", shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {[0, 1].map((slot) => {
          const university = selected[slot];
          return (
            <View
              key={slot}
              style={{
                width: 40, height: 40, borderRadius: 20, overflow: "hidden", marginLeft: slot ? -12 : 0,
                borderWidth: 2, borderColor: colors.inkSurface,
                backgroundColor: university ? colors.surface : "rgba(246,239,233,0.12)",
                alignItems: "center", justifyContent: "center",
              }}
            >
              {university ? (
                <ExpoImage source={university.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              ) : (
                <Ionicons name="add" size={18} color={colors.onInkMuted} />
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={onCompare}
        disabled={!ready}
        accessibilityRole="button"
        accessibilityState={{ disabled: !ready }}
        style={{ flexShrink: 1, flexDirection: "row", alignItems: "center", gap: 10 }}
      >
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: 14, color: colors.onInk }}>
          {ready ? t("favourites.compareReady") : t("favourites.selectOneMore")}
        </Text>
        {ready ? (
          <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.beige }}>
            <Ionicons name="arrow-forward" size={17} color={colors.accentInk} />
          </View>
        ) : (
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, color: colors.onInkMuted }}>{selected.length}/2</Text>
        )}
      </Pressable>

      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel={t("favourites.clearSelection")}
        hitSlop={6}
        style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(246,239,233,0.12)" }}
      >
        <Ionicons name="close" size={17} color={colors.onInk} />
      </Pressable>
    </View>
  );
}

/**
 * Favourites — the saved shortlist, in the redesigned Home's language: serif
 * header with a burgundy stats strip, photo tiles (heart + "Compare" pill), a
 * compare hint and a floating compare bar. Desktop web gets the Home page frame,
 * a three-column grid and the site footer; phones get one column (two on
 * mid-size web).
 */
export default function Favourites() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const desktop = useIsDesktopWeb();
  const { width } = useWindowDimensions();
  const universities = useMemo(() => buildUniversities(t), [t]);
  const { favouriteIds } = useFavourites();
  const [pickedIds, setPickedIds] = useState<UniversityId[]>([]);
  // A university removed from favourites drops out of the comparison too.
  const compareIds = pickedIds.filter((id) => favouriteIds.includes(id));

  // Most recently saved first.
  const favouriteUniversities = useMemo(
    () =>
      [...favouriteIds]
        .reverse()
        .map((id) => universities.find((university) => university.id === id))
        .filter((university): university is UniversityDisplay => university != null),
    [favouriteIds, universities]
  );

  const toggleCompare = (id: UniversityId) => {
    setPickedIds((picked) => {
      const current = picked.filter((pickedId) => favouriteIds.includes(pickedId));
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id);
      }

      // Compare is a two-way, side-by-side view, so cap the selection at two.
      // Picking a third replaces the one chosen first, keeping the two most
      // recent picks selected — no error prompt needed.
      if (current.length >= 2) {
        return [current[current.length - 1], id];
      }

      return [...current, id];
    });
  };

  const selectedForCompare = compareIds
    .map((id) => universities.find((university) => university.id === id))
    .filter((university): university is UniversityDisplay => university != null);

  const openCompare = () => {
    if (compareIds.length !== 2) return;
    router.push({ pathname: "/compare", params: { ids: compareIds.join(",") } } as any);
  };
  const openUniversity = (id: string) => router.push(`/university/${id}` as any);
  // Desktop Home already lists every university; phones have the dedicated list screen.
  const browse = () => router.push((desktop ? "/" : "/universities") as any);

  const columns = desktop ? 3 : isWeb && width >= 640 ? 2 : 1;
  const count = favouriteUniversities.length;

  const header = (
    <View style={desktop ? { flexDirection: "row", alignItems: "flex-end", gap: 56 } : undefined}>
      <View style={{ flex: desktop ? 1 : undefined, minWidth: 0 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: desktop ? 12 : 11, letterSpacing: 1.9, textTransform: "uppercase", color: colors.accent }}>
          {t("favourites.kicker")}
        </Text>
        <Text
          accessibilityRole="header"
          style={{
            marginTop: desktop ? 18 : 12, fontFamily: Fonts.display, fontSize: desktop ? 84 : 46,
            lineHeight: desktop ? 84 : 48, letterSpacing: desktop ? -1.2 : -0.4, color: colors.text,
          }}
        >
          {t("favourites.title")}
        </Text>
        <Text style={{ marginTop: desktop ? 18 : 10, maxWidth: 520, fontFamily: Fonts.body, fontSize: desktop ? 18 : 15, lineHeight: desktop ? 29 : 23, color: colors.textSecondary }}>
          {t("favourites.subtitle")}
        </Text>
      </View>
      {count > 0 ? (
        <View style={desktop ? { width: 480 } : { marginTop: 22 }}>
          <StatsCard list={favouriteUniversities} desktop={desktop} />
        </View>
      ) : null}
    </View>
  );

  const grid = (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: GRID_GAP, rowGap: desktop ? 44 : 32 }}>
      {favouriteUniversities.map((item) => (
        <View
          key={item.id}
          style={{ width: columns > 1 ? (`calc((100% - ${(columns - 1) * GRID_GAP}px) / ${columns})` as any) : "100%" }}
        >
          <UniversityTile
            item={item}
            variant={desktop ? "web" : "phone"}
            photoHeight={desktop ? 250 : 210}
            details
            onPress={() => openUniversity(item.id)}
            compareSelected={compareIds.includes(item.id)}
            onCompareToggle={() => toggleCompare(item.id)}
          />
        </View>
      ))}
    </View>
  );

  const body = count === 0 ? (
    <EmptyState onBrowse={browse} />
  ) : (
    <View style={{ gap: desktop ? 36 : 24 }}>
      {count >= 2 ? <CompareHint /> : null}
      {grid}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: desktop ? 0 : 120 }}>
        {desktop ? (
          <>
            <View style={{ width: "100%", maxWidth: WEB_PAGE_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_PAGE_GUTTER, paddingTop: 64, paddingBottom: 96 }}>
              {header}
              <View style={{ height: 1, backgroundColor: colors.divider, marginTop: 48, marginBottom: 40 }} />
              {body}
            </View>
            <SiteFooter onHome={() => router.push("/" as any)} />
          </>
        ) : (
          <ContentWrap maxWidth={PHONE_MAX_WIDTH}>
            <View style={{ paddingHorizontal: 20, paddingTop: (isWeb ? 20 : insets.top) + 22 }}>
              {header}
              <View style={{ marginTop: 28 }}>{body}</View>
            </View>
          </ContentWrap>
        )}
      </ScrollView>

      {selectedForCompare.length > 0 ? (
        <View
          pointerEvents="box-none"
          style={{ position: "absolute", left: 16, right: 16, bottom: 24, alignItems: "center", zIndex: 20 }}
        >
          <CompareBar selected={selectedForCompare} onCompare={openCompare} onClear={() => setPickedIds([])} />
        </View>
      ) : null}
    </View>
  );
}
