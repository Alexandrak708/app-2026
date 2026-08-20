import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { buildUniversities } from "@/data/university-data";
import { buildProgramDetail, getProgramSummaries } from "@/data/university-programs";
import type { ProgramLevel, UniversityDisplay } from "@/types/university";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { Plate } from "@/components/plate";
import { Kicker } from "@/components/editorial";

/** A single program picked for a university: which level it lives in + its slug. */
type SelectedProgram = { level: ProgramLevel; slug: string };

/**
 * Ordered list of the "Key Facts" numbers shown on each university detail page.
 * `valueKey` reads the number from `universityStatsValues.<id>`; `overrideKey`
 * is the optional per-university label override (so e.g. one school can call
 * the row "Laboratories" and another "Doctoral programs"). When the two
 * universities disagree on a row's label, the row renders each label under its
 * own value instead of a single shared heading.
 */
type StatMetric = { valueKey: string; labelKey: string; overrideKey?: string };

const STAT_METRICS: StatMetric[] = [
  { valueKey: "yearsTradition", labelKey: "universityStats.yearsTradition" },
  { valueKey: "bachelorPrograms", labelKey: "universityStats.bachelorPrograms" },
  { valueKey: "masterPrograms", labelKey: "universityStats.masterPrograms" },
  { valueKey: "internationalPartners", labelKey: "universityStats.internationalPartners" },
  { valueKey: "countries", labelKey: "compare.countries" },
  { valueKey: "studentsGraduated", labelKey: "universityStats.studentsGraduated" },
  { valueKey: "labs", labelKey: "universityStats.labs", overrideKey: "labsText" },
  { valueKey: "tuitionFreeLabel", labelKey: "universityStats.tuitionFree", overrideKey: "tuitionFreeText" },
];

function HeaderColumn({
  uni,
  onPress,
  viewLabel,
  colors,
}: {
  uni: UniversityDisplay;
  onPress: () => void;
  viewLabel: string;
  colors: any;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ flex: 1, alignItems: "center" }}>
      <Plate source={uni.image} style={{ width: "100%", height: 96 }} />
      <Text
        numberOfLines={2}
        style={{ fontFamily: Fonts.heading, marginTop: 10, fontSize: 15, color: colors.text, textAlign: "center", lineHeight: 19 }}
      >
        {uni.name}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 8 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 11, color: colors.accent }}>{viewLabel}</Text>
        <Ionicons name="chevron-forward" size={12} color={colors.accent} />
      </View>
    </TouchableOpacity>
  );
}

function Cell({ caption, value, colors }: { caption?: string; value: string; colors: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 4 }}>
      {caption ? (
        <Text
          style={{
            fontFamily: Fonts.heading,
            fontSize: 10,
            color: colors.textMuted,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            marginBottom: 4,
          }}
        >
          {caption}
        </Text>
      ) : null}
      <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.text, textAlign: "center" }}>{value}</Text>
    </View>
  );
}

/**
 * One comparison row: two values side by side. When both sides share the same
 * label it sits centred above the pair; when they differ, each label drops
 * under its own value so nothing is mislabelled.
 */
function CompareAttr({
  labelA,
  labelB,
  valueA,
  valueB,
  colors,
}: {
  labelA: string;
  labelB: string;
  valueA: string;
  valueB: string;
  colors: any;
}) {
  const sameLabel = labelA === labelB;
  return (
    <View style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.divider }}>
      {sameLabel ? (
        <Text
          style={{
            fontFamily: Fonts.heading,
            fontSize: 11,
            color: colors.textMuted,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 10,
          }}
        >
          {labelA}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Cell caption={sameLabel ? undefined : labelA} value={valueA} colors={colors} />
        <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.divider, marginHorizontal: 6 }} />
        <Cell caption={sameLabel ? undefined : labelB} value={valueB} colors={colors} />
      </View>
    </View>
  );
}

function Section({ title, children, colors }: { title: string; children: ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: Fonts.heading, fontSize: 19, color: colors.text, marginBottom: 2 }}>{title}</Text>
      {children}
    </View>
  );
}

/**
 * Bottom-sheet program chooser for a single university. Mirrors the programs
 * list screen (Bachelor / Master tabs) but taps select a program instead of
 * navigating. Rendered once and toggled via `university` being non-null.
 */
function ProgramPicker({
  university,
  onClose,
  onSelect,
}: {
  university: UniversityDisplay | null;
  onClose: () => void;
  onSelect: (level: ProgramLevel, slug: string) => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const bachelor = university ? getProgramSummaries(university.id, "bachelor") : [];
  const master = university ? getProgramSummaries(university.id, "master") : [];
  const hasBachelor = bachelor.length > 0;
  const hasMaster = master.length > 0;

  const [tab, setTab] = useState<ProgramLevel>("bachelor");

  // Reset to a level that actually has programs each time the sheet opens.
  useEffect(() => {
    if (!university) return;
    setTab(hasBachelor ? "bachelor" : "master");
  }, [university?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nothing to show when closed — unmount so no empty state flashes on close.
  if (!university) return null;

  const list = tab === "bachelor" ? bachelor : master;

  const tabButton = (value: ProgramLevel, label: string) => {
    const active = tab === value;
    return (
      <TouchableOpacity
        onPress={() => setTab(value)}
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 11,
          alignItems: "center",
          backgroundColor: active ? colors.accent : "transparent",
        }}
      >
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: active ? "#ffffff" : colors.textSecondary }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "82%",
            paddingBottom: 24,
          }}
        >
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.softBorder, alignSelf: "center", marginTop: 10, marginBottom: 6 }} />

          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 8, gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
                {university?.name}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{t("compare.chooseProgram")}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.mutedSurface, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {hasBachelor && hasMaster && (
            <View style={{ flexDirection: "row", marginHorizontal: 20, backgroundColor: colors.mutedSurface, borderRadius: 14, padding: 4, marginTop: 6 }}>
              {tabButton("bachelor", t("degrees.Bachelor"))}
              {tabButton("master", t("degrees.Master"))}
            </View>
          )}

          <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "600", letterSpacing: 0.5, marginHorizontal: 20, marginTop: 14, marginBottom: 8 }}>
            {t("programs.available", { count: list.length })}
          </Text>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
            {list.map((program, index) => (
              <TouchableOpacity
                key={program.slug}
                onPress={() => onSelect(tab, program.slug)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  marginBottom: 10,
                }}
              >
                <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.mutedSurface, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary }}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                    {program.title}
                  </Text>
                  {(program.tuition || program.faculty) && (
                    <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {[program.tuition, program.faculty].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
            {list.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="school-outline" size={36} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: "600", marginTop: 10 }}>{t("programs.noneAvailable")}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function CompareScreen() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  // One program per university, plus which picker (if any) is open.
  const [programA, setProgramA] = useState<SelectedProgram | null>(null);
  const [programB, setProgramB] = useState<SelectedProgram | null>(null);
  const [pickerFor, setPickerFor] = useState<"A" | "B" | null>(null);

  const universities = buildUniversities(t);
  const idList = (typeof ids === "string" ? ids : "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const selected = idList
    .map((id) => universities.find((u) => u.id === id))
    .filter((u): u is UniversityDisplay => Boolean(u));

  const backButton = (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.divider,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="chevron-back" size={18} color={colors.text} />
    </TouchableOpacity>
  );

  // Guard against a stale/short link (e.g. a favourite was removed after the
  // link was built) so the screen never renders half a comparison.
  if (selected.length < 2) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56, paddingHorizontal: 20 }}>
        {backButton}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Ionicons name="swap-horizontal-outline" size={42} color={colors.textMuted} />
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", maxWidth: 260 }}>
            {t("compare.notFound")}
          </Text>
        </View>
      </View>
    );
  }

  const [a, b] = selected;

  const svA = t(`universityStatsValues.${a.id}`, { returnObjects: true }) as Record<string, string> | string;
  const svB = t(`universityStatsValues.${b.id}`, { returnObjects: true }) as Record<string, string> | string;
  const statsA: Record<string, string> = typeof svA === "object" ? svA : {};
  const statsB: Record<string, string> = typeof svB === "object" ? svB : {};

  const scholarshipValue = (u: UniversityDisplay) =>
    u.scholarship ? t("university.available") : t("university.notAvailable");

  const overviewRows = [
    { label: t("compare.category"), a: t(`categories.${a.category}`), b: t(`categories.${b.category}`) },
    { label: t("compare.location"), a: a.location, b: b.location },
    { label: t("compare.degreeLevels"), a: a.degreeLabel, b: b.degreeLabel },
    { label: t("compare.scholarship"), a: scholarshipValue(a), b: scholarshipValue(b) },
    { label: t("compare.tuitionRange"), a: a.tuitionRange, b: b.tuitionRange },
  ];

  // Resolve the picked programs to full detail objects for the lower section.
  const detailA = programA ? buildProgramDetail(a.id, programA.level, programA.slug) : null;
  const detailB = programB ? buildProgramDetail(b.id, programB.level, programB.slug) : null;

  const levelLabel = (level: ProgramLevel) => (level === "master" ? t("degrees.Master") : t("degrees.Bachelor"));
  const studyModeValue = (d: NonNullable<typeof detailA>) => (d.partners?.length ? d.partners.join(", ") : d.studyMode);

  const pickerUniversity = pickerFor === "A" ? a : pickerFor === "B" ? b : null;

  const handleSelectProgram = (level: ProgramLevel, slug: string) => {
    if (pickerFor === "A") setProgramA({ level, slug });
    else if (pickerFor === "B") setProgramB({ level, slug });
    setPickerFor(null);
  };

  const openProgramDetail = (uni: UniversityDisplay, program: SelectedProgram | null) => {
    if (!program) return;
    router.push({
      pathname: "/university/program/[programId]",
      params: { universityId: uni.id, level: program.level, programId: program.slug },
    } as any);
  };

  // One university's program picker button (empty prompt or the chosen program).
  const renderPickerColumn = (
    uni: UniversityDisplay,
    detail: typeof detailA,
    which: "A" | "B"
  ) => (
    <View style={{ flex: 1 }}>
      <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, textAlign: "center", marginBottom: 8 }}>
        {uni.name}
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setPickerFor(which)}
        style={{
          minHeight: 104,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: detail ? colors.mutedSurface : "transparent",
          borderWidth: detail ? 0 : 1.5,
          borderStyle: detail ? "solid" : "dashed",
          borderColor: colors.softBorder,
        }}
      >
        {detail ? (
          <>
            <View style={{ backgroundColor: colors.background, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: colors.textSecondary, letterSpacing: 0.4, textTransform: "uppercase" }}>
                {levelLabel(detail.level)}
              </Text>
            </View>
            <Text numberOfLines={3} style={{ fontSize: 13, fontWeight: "700", color: colors.text, textAlign: "center", lineHeight: 17 }}>
              {detail.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 8 }}>
              <Ionicons name="swap-horizontal-outline" size={12} color={colors.textMuted} />
              <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: "600" }}>{t("compare.tapToChange")}</Text>
            </View>
          </>
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginTop: 6, textAlign: "center" }}>
              {t("compare.selectProgram")}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const programRows = detailA && detailB
    ? [
        { label: t("programDetail.level"), a: levelLabel(detailA.level), b: levelLabel(detailB.level) },
        { label: t("programDetail.duration"), a: detailA.duration, b: detailB.duration },
        { label: t("programDetail.tuition"), a: detailA.tuition || "—", b: detailB.tuition || "—" },
        { label: t("programDetail.faculty"), a: detailA.faculty || "—", b: detailB.faculty || "—" },
        { label: t("programDetail.studyMode"), a: studyModeValue(detailA), b: studyModeValue(detailB) },
      ]
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 56, paddingBottom: 60, paddingHorizontal: 20, alignItems: "center" }}
      >
        <View style={{ width: "100%", maxWidth: 820 }}>
          {/* Top bar */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 }}>
            {backButton}
            <View style={{ flex: 1 }}>
              <Kicker>{t("compare.subtitle")}</Kicker>
              <Text style={{ fontFamily: Fonts.display, fontSize: 24, color: colors.text, letterSpacing: -0.3, marginTop: 2 }}>
                {t("compare.title")}
              </Text>
            </View>
          </View>

          {/* Header: the two universities with a VS badge */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <HeaderColumn
                uni={a}
                onPress={() => router.push(`/university/${a.id}` as any)}
                viewLabel={t("compare.viewProfile")}
                colors={colors}
              />
              <View style={{ width: 40, alignItems: "center", marginTop: 30 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: colors.accentInk,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: Fonts.heading, color: "#ffffff", fontSize: 12 }}>VS</Text>
                </View>
              </View>
              <HeaderColumn
                uni={b}
                onPress={() => router.push(`/university/${b.id}` as any)}
                viewLabel={t("compare.viewProfile")}
                colors={colors}
              />
            </View>
            <Text style={{ fontFamily: Fonts.body, fontSize: 11, color: colors.textMuted, textAlign: "center", marginTop: 14 }}>
              {t("compare.openHint")}
            </Text>
          </View>

          {/* Overview */}
          <Section title={t("compare.overview")} colors={colors}>
            {overviewRows.map((row) => (
              <CompareAttr
                key={row.label}
                labelA={row.label}
                labelB={row.label}
                valueA={row.a}
                valueB={row.b}
                colors={colors}
              />
            ))}
          </Section>

          {/* Key Facts */}
          <Section title={t("compare.keyFacts")} colors={colors}>
            {STAT_METRICS.map((m) => {
              const labelA = (m.overrideKey && statsA[m.overrideKey]) || t(m.labelKey);
              const labelB = (m.overrideKey && statsB[m.overrideKey]) || t(m.labelKey);
              const valueA = statsA[m.valueKey] ?? "—";
              const valueB = statsB[m.valueKey] ?? "—";
              return (
                <CompareAttr key={m.valueKey} labelA={labelA} labelB={labelB} valueA={valueA} valueB={valueB} colors={colors} />
              );
            })}
          </Section>

          {/* Program pickers — one program from each university */}
          <Section title={t("compare.programsTitle")} colors={colors}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 14 }}>
              {t("compare.programsHint")}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {renderPickerColumn(a, detailA, "A")}
              {renderPickerColumn(b, detailB, "B")}
            </View>
          </Section>

          {/* Program comparison — appears once both programs are chosen */}
          {detailA && detailB && (
            <Section title={t("compare.programComparison")} colors={colors}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", paddingBottom: 2 }}>
                <TouchableOpacity style={{ flex: 1, paddingHorizontal: 4 }} activeOpacity={0.8} onPress={() => openProgramDetail(a, programA)}>
                  <Text numberOfLines={3} style={{ fontSize: 14, fontWeight: "800", color: colors.text, textAlign: "center", lineHeight: 18 }}>
                    {detailA.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, textAlign: "center", marginTop: 3 }}>
                    {a.name}
                  </Text>
                </TouchableOpacity>
                <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.softBorder, marginHorizontal: 6 }} />
                <TouchableOpacity style={{ flex: 1, paddingHorizontal: 4 }} activeOpacity={0.8} onPress={() => openProgramDetail(b, programB)}>
                  <Text numberOfLines={3} style={{ fontSize: 14, fontWeight: "800", color: colors.text, textAlign: "center", lineHeight: 18 }}>
                    {detailB.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, textAlign: "center", marginTop: 3 }}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              </View>

              {programRows.map((row) => (
                <CompareAttr key={row.label} labelA={row.label} labelB={row.label} valueA={row.a} valueB={row.b} colors={colors} />
              ))}

              {/* Key focus — full sentences read better left-aligned than centred */}
              <View style={{ paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.softBorder }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.textMuted,
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                  }}
                >
                  {t("programDetail.keyFocus")}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "flex-start", paddingBottom: 8 }}>
                  <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18, paddingHorizontal: 6 }}>
                    {detailA.keyFocus}
                  </Text>
                  <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.softBorder, marginHorizontal: 6 }} />
                  <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18, paddingHorizontal: 6 }}>
                    {detailB.keyFocus}
                  </Text>
                </View>
              </View>
            </Section>
          )}
        </View>
      </ScrollView>

      <ProgramPicker university={pickerUniversity} onClose={() => setPickerFor(null)} onSelect={handleSelectProgram} />
    </View>
  );
}
