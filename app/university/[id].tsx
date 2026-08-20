import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Linking,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { buildUniversities } from "@/data/university-data";
import { useFavourites } from "@/contexts/favourites-context";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";

/** An editorial tag: outlined-accent, or a plain neutral tint. */
function Tag({ label, outline = false }: { label: string; outline?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: outline ? colors.accent : "transparent",
        backgroundColor: outline ? "transparent" : colors.mutedSurface,
      }}
    >
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, color: outline ? colors.accent : colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );
}

/** Quiet bordered section container — hairline border, no shadow. */
function SectionCard({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 4,
        padding: 18,
        marginBottom: 14,
        backgroundColor: "transparent",
      }}
    >
      {children}
    </View>
  );
}

/** Section heading — serif, semibold. */
function SectionTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  const { colors } = useAppTheme();
  return (
    <Text style={[{ fontFamily: Fonts.heading, fontSize: 19, color: colors.text }, style]}>{children}</Text>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 4,
        padding: 14,
        alignItems: "center",
        minWidth: 80,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.accent} style={{ marginBottom: 6 }} />
      <Text style={{ fontFamily: Fonts.number, fontSize: 18, color: colors.text }}>{value}</Text>
      <Text style={{ fontFamily: Fonts.body, fontSize: 10, color: colors.textMuted, textAlign: "center", marginTop: 3 }}>{label}</Text>
    </View>
  );
}

/** Outlined action button — accent (primary) or neutral (secondary). */
function ActionButton({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  primary?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: primary ? colors.accent : colors.divider,
        borderRadius: 4,
        paddingVertical: 13,
        paddingHorizontal: 20,
        flex: 1,
      }}
    >
      <Ionicons name={icon} size={17} color={primary ? colors.accent : colors.text} />
      <Text style={{ fontFamily: Fonts.heading, color: primary ? colors.accent : colors.text, fontSize: 15 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ExpandableSection({ title, icon, children, colors }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode; colors: any }) {
  const [open, setOpen] = useState(false);
  return (
    <SectionCard>
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name={icon} size={18} color={colors.accent} />
        <Text style={{ fontFamily: Fonts.heading, fontSize: 17, color: colors.text, flex: 1 }}>{title}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {open && <View style={{ marginTop: 14 }}>{children}</View>}
    </SectionCard>
  );
}

function InfoRow({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
      <Text style={{ color: colors.accent, fontSize: 12, lineHeight: 18 }}>•</Text>
      <Text style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 }}>{label}</Text>
    </View>
  );
}

export default function UniversityPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const universities = buildUniversities(t);
  const pageWidth = Math.min(screenWidth, 1100);
  const { colors, isDark } = useAppTheme();

  const university = universities.find((u) => u.id === id);

  const { toggleFavourite, isFavourite: checkFavourite } = useFavourites();

  if (!university) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontSize: 16, marginTop: 12 }}>
          {t("university.notFound")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>
            {t("university.goBack")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryLabel = t(`categories.${university.category}`);
  const scholarshipLabel = university.scholarship
    ? t("university.scholarshipAvailable")
    : t("university.noScholarship");

  const quickInfoRows = [
    { icon: "earth-outline" as const, label: t("filters.location"), value: university.location },
    { icon: "book-outline" as const, label: t("filters.degree"), value: university.degreeLabel },
    { icon: "grid-outline" as const, label: t("filters.category"), value: categoryLabel },
    {
      icon: "ribbon-outline" as const,
      label: t("filters.scholarship"),
      value: university.scholarship
        ? t("university.available")
        : t("university.notAvailable"),
    },
    {
      icon: "cash-outline" as const,
      label: t("filters.tuition"),
      value: university.tuitionRange,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={{ alignItems: "center" }}>

        {/* Hero — full photo (contain) over a blurred fill of itself, so nothing is cropped */}
        <View style={{ height: 280, width: "100%", maxWidth: pageWidth, backgroundColor: university.color, overflow: "hidden" }}>
          <ExpoImage
            source={university.image}
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            contentFit="cover"
            blurRadius={12}
          />
          <View
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: 0, right: 0,
              backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.38)",
            }}
          />
          <ExpoImage
            source={university.image}
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            contentFit="contain"
          />
          {/* Warm plate tint + bottom gradient for legible title */}
          <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(129,11,56,0.06)" }} />
          <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160, backgroundColor: "rgba(0,0,0,0.42)" }} />

          {/* Back pill */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute", top: 56, left: 20,
              width: 38, height: 38, borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.9)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#201f1d" />
          </TouchableOpacity>

          {/* Favourite pill */}
          <TouchableOpacity
            onPress={() => toggleFavourite(id as any)}
            style={{
              position: "absolute", top: 56, right: 20,
              width: 38, height: 38, borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.9)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons
              name={checkFavourite(id as any) ? "heart" : "heart-outline"}
              size={19}
              color={colors.accent}
            />
          </TouchableOpacity>

          <View style={{ position: "absolute", left: 24, right: 24, bottom: 20 }}>
            <Text style={{ fontFamily: Fonts.heading, color: "#fff", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 }}>
              {categoryLabel}
            </Text>
            <Text style={{ fontFamily: Fonts.heading, color: "#fff", fontSize: 27, lineHeight: 31, marginTop: 4 }}>
              {university.name}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, width: "100%", maxWidth: pageWidth }}>

          {/* Location line */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
            <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textSecondary }}>
              {university.location}
            </Text>
          </View>

          {/* Tags */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 14 }}>
            {university.degreeLevels.map((level) => (
              <Tag key={level} label={t(`degrees.${level}`)} outline />
            ))}
            <Tag label={scholarshipLabel} />
          </View>

          {/* 3-column stat strip */}
          {id && (() => {
            const sv = t(`universityStatsValues.${id}`, { returnObjects: true }) as Record<string, string> | string | undefined;
            if (!sv || typeof sv === "string") return null;
            const cells = [
              { value: sv.yearsTradition, label: t("universityStats.yearsTradition") },
              { value: sv.bachelorPrograms, label: t("universityStats.bachelorPrograms") },
              { value: sv.studentsGraduated, label: t("universityStats.studentsGraduated") },
            ].filter((c) => c.value);
            if (cells.length === 0) return null;
            return (
              <View style={{ flexDirection: "row", borderWidth: 1, borderColor: colors.divider, borderRadius: 4, overflow: "hidden", marginTop: 22 }}>
                {cells.map((c, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1, paddingVertical: 14, alignItems: "center",
                      borderRightWidth: i < cells.length - 1 ? 1 : 0, borderRightColor: colors.divider,
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.number, fontSize: 19, color: colors.text }}>{c.value}</Text>
                    <Text style={{ fontFamily: Fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 3, textAlign: "center", paddingHorizontal: 4 }}>{c.label}</Text>
                  </View>
                ))}
              </View>
            );
          })()}

          <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 22 }} />

          {/* About */}
          <SectionTitle style={{ marginBottom: 8 }}>{t("university.about")}</SectionTitle>
          <Text
            style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 23, textAlign: "justify" }}
            numberOfLines={expanded ? undefined : 4}
          >
            {university.longDescription || university.description}
          </Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginTop: 8, marginBottom: 22 }}>
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, color: colors.accent }}>
              {expanded ? t("university.showLess") : t("university.readMore")}
            </Text>
          </TouchableOpacity>

          {/* Quick Info */}
          <SectionCard>
            <SectionTitle style={{ marginBottom: 8 }}>{t("university.quickInfo")}</SectionTitle>

            {quickInfoRows.map((row, i) => (
              <View
                key={row.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: i === quickInfoRows.length - 1 ? 0 : 1,
                  borderBottomColor: colors.divider,
                  gap: 12,
                }}
              >
                <Ionicons name={row.icon} size={18} color={colors.accent} />
                <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textSecondary, flex: 1 }}>
                  {row.label}
                </Text>
                <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, color: colors.text, textAlign: "right", flexShrink: 1 }}>
                  {row.value}
                </Text>
              </View>
            ))}

            {id && (() => {
              const tiers = t(`tuitionTiers.${id}`, { returnObjects: true }) as Array<{ range: string; label: string }> | string | undefined;
              if (!tiers || typeof tiers === "string") return null;
              return (
                <View style={{ marginTop: 16, borderWidth: 1, borderColor: colors.divider, borderRadius: 4, padding: 12 }}>
                  <Text style={{ fontFamily: Fonts.heading, fontSize: 11, color: colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                    {t("tuitionTiersHeader")}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {tiers.map((tier) => (
                      <View key={tier.range} style={{ borderWidth: 1, borderColor: colors.divider, borderRadius: 3, padding: 8, minWidth: "45%", flex: 1 }}>
                        <Text style={{ fontFamily: Fonts.number, fontSize: 14, color: colors.text }}>{tier.range}</Text>
                        <Text style={{ fontFamily: Fonts.body, fontSize: 10, color: colors.textMuted, marginTop: 1 }}>{tier.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}
          </SectionCard>

          {/* Stats / Key Facts */}
          {id && (() => {
            const sv = t(`universityStatsValues.${id}`, { returnObjects: true }) as Record<string, string> | string | undefined;
            if (!sv || typeof sv === "string") return null;
            return (
              <SectionCard>
                <SectionTitle style={{ marginBottom: 14 }}>{t("universityStats.title")}</SectionTitle>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  <StatCard value={sv.yearsTradition} label={t("universityStats.yearsTradition")} icon="time-outline" />
                  <StatCard value={sv.bachelorPrograms} label={t("universityStats.bachelorPrograms")} icon="school-outline" />
                  <StatCard value={sv.masterPrograms} label={t("universityStats.masterPrograms")} icon="book-outline" />
                  <StatCard value={sv.internationalPartners} label={t("universityStats.internationalPartners")} icon="globe-outline" />
                  <StatCard value={sv.countries} label={t("universityStats.fromCountries", { count: parseInt(sv.countries) || 0 })} icon="flag-outline" />
                  <StatCard value={sv.studentsGraduated} label={t("universityStats.studentsGraduated")} icon="people-outline" />
                  <StatCard value={sv.labs} label={sv.labsText || t("universityStats.labs")} icon="flask-outline" />
                  <StatCard value={sv.tuitionFreeLabel} label={sv.tuitionFreeText || t("universityStats.tuitionFree")} icon="cash-outline" />
                </View>
              </SectionCard>
            );
          })()}

          {/* Programs */}
          <SectionCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <SectionTitle>{t("university.programs")}</SectionTitle>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/university/project", params: { id } })}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, color: colors.accent }}>
                  {t("university.viewMore")}
                </Text>
                <Ionicons name="grid-outline" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </SectionCard>

          {(id === "1" || id === "2" || id === "3" || id === "4" || id === "5" || id === "6" || id === "7" || id === "8" || id === "9" || id === "10" || id === "11" || id === "12" || id === "13" || id === "14" || id === "15" || id === "16" || id === "17" || id === "18" || id === "19" || id === "20" || id === "21" || id === "22" || id === "23" || id === "24" || id === "25" || id === "26") && (
            <>
              {id === "1" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.evrika")} colors={colors} />
                    <InfoRow label={t("universityExtra.erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.youngScientists")} colors={colors} />
                    <InfoRow label={t("universityExtra.smartPHD")} colors={colors} />
                    <InfoRow label={t("universityExtra.stateScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.earlyStages")} colors={colors} />
                    <InfoRow label={t("universityExtra.mainRound")} colors={colors} />
                    <InfoRow label={t("universityExtra.drawingExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.onlineTest")} colors={colors} />
                    <InfoRow label={t("universityExtra.appFees")} colors={colors} />
                    <InfoRow label={t("universityExtra.appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.maritimeMedical")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.masterSDR")} colors={colors} />
                    <InfoRow label={t("universityExtra.masterNSDO")} colors={colors} />
                    <InfoRow label={t("universityExtra.masterDistance")} colors={colors} />
                    <InfoRow label={t("universityExtra.masterSiemens")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.openDoors")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.openDoorsDesc")}</Text>
                    <InfoRow label={t("universityExtra.siemensHub")} colors={colors} />
                    <InfoRow label={t("universityExtra.mtgDelfin")} colors={colors} />
                    <InfoRow label={t("universityExtra.schwarzIT")} colors={colors} />
                    <InfoRow label={t("universityExtra.autodesk")} colors={colors} />
                    <InfoRow label={t("universityExtra.expressbank")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.industryPartners")} colors={colors} />
                    <InfoRow label={t("universityExtra.academicPartners")} colors={colors} />
                    <InfoRow label={t("universityExtra.ceepus")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>{t("universityExtra.internationalDesc")}</Text>
                  </ExpandableSection>
                </>
              )}
              {id === "2" && (
                <>
                  <ExpandableSection title={t("universityExtra.mu_scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mu_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.mu_excellentScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.mu_applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mu_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.mu_appBiology")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_appOnline")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_appDeadlines")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_appInternational")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_appFees")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.mu_masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mu_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.mu_integratedMed")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_integratedDent")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_integratedPharm")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_mph")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_healthMgmt")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.mu_openDoors")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mu_openDoorsDesc")}</Text>
                    <InfoRow label={t("universityExtra.mu_universityHospital")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_simulationCenter")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_researchLabs")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_clinicalRotations")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.mu_partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mu_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.mu_euPartners")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_asphr")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_who")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.mu_internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mu_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.mu_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_dormitories")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_languagePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.mu_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "3" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ue_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.ue_excellentScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ue_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.ue_appEarly")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_appOnline")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_appMainRound")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_appFees")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_appExams")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_appInternational")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ue_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.ue_masterRegular")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_masterEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_masterDistance")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.openDoors")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ue_openDoorsDesc")}</Text>
                    <InfoRow label={t("universityExtra.ue_businessAccelerator")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_careerCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_uebn")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_alumni")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ue_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.ue_erasmusPartners")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_dukenet")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_businet")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_ceepus")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_doubleDegrees")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_magellan")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ue_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.ue_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_dormitories")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_languageCourses")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_recognition")} colors={colors} />
                    <InfoRow label={t("universityExtra.ue_internationalOffice")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "4" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.na_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.na_militaryCadets")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_stateScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_dualCitizenship")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.na_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.na_appBachelor")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_appDeadlineBachelor")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_appMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_appPrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_appPortal")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.na_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.na_feeEuFull")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_feeEuPart")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_feeNonEu")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_feeDual")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_feeContract")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.na_facilities")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.na_facilitiesDesc")}</Text>
                    <InfoRow label={t("universityExtra.na_simulators")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_lngSimulator")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_cyberCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_seaPractice")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_dormitory")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.na_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.na_navalAcademies")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_maritimeUnis")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_imo")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_ranking")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.na_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.na_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_foreignTradition")} colors={colors} />
                    <InfoRow label={t("universityExtra.na_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "5" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vfu_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.vfu_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_earlyPaymentDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_familyDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_installments")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vfu_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.vfu_appRoutes")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_appArchitecture")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_appMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_appLanguages")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_appContact")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vfu_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.vfu_feeSocial")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_feeLaw")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_feeArch")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_feeIntl")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_feeDiscount")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.vfu_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vfu_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.vfu_digitalCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_mootCourt")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_studios")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_sportsHousing")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vfu_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.vfu_eua")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_qualityLabels")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_employers")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_smolyan")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vfu_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.vfu_englishTurkish")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_housing")} colors={colors} />
                    <InfoRow label={t("universityExtra.vfu_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "6" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vum_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.vum_newStudents")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_partnerCompany")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_meritSports")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_earlyDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_referFriend")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_studentLoans")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vum_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.vum_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_appIntakes")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_appDualDiploma")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_appNacid")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vum_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.vum_feeBachelorEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_feeCulinary")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_feeBachelorBg")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_feeDistance")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_feeMasters")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_feeCardiff")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.vum_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vum_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.vum_culinaryStudios")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_itLabs")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_careerCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_accommodation")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vum_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.vum_cardiff")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_ucBirmingham")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_stenden")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_globalNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_erasmus")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vum_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.vum_englishTaught")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_prep")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_multicultural")} colors={colors} />
                    <InfoRow label={t("universityExtra.vum_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "7" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.su_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.su_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_phdScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_studentLoans")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.su_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.su_appEuExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_appNonEu")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_appMedicine")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_appDeadlines")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.su_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.su_feeSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_feeForeignBachelor")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_feeForeignMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_feeMedicine")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_feePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.su_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.su_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.su_rectorate")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_libraries")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_insait")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_botanicalGarden")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.su_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.su_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_transform4europe")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_researchRankings")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_alumni")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.su_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.su_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_bulgarianPrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.su_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "8" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.tus_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.tus_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_companyScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_studentLoans")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.tus_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.tus_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_appMatriculation")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_appDeadlines")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.tus_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.tus_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_feePaid")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_feePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.tus_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.tus_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.tus_labs")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_technologyPark")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_dormitories")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_sports")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.tus_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.tus_eut")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_industryPartners")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_branches")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_ranking")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.tus_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.tus_englishGermanFrench")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.tus_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "9" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.unwe_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.unwe_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_companyScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_studentLoans")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.unwe_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.unwe_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_appMatriculation")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.unwe_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.unwe_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_feeForeignBg")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_feeForeignEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_feeLawMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_feePrep")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.unwe_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.unwe_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.unwe_auditoriums")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_dormitories")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_sports")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_careerCentre")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.unwe_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.unwe_engage")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_accreditation")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_alumni")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.unwe_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.unwe_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.unwe_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "10" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mus_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.mus_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mus_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.mus_appExams")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_appDeadlines")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_appFees")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mus_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.mus_feeMedicineEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_feeDentalEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_feePharmacyEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.mus_facilities")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mus_facilitiesDesc")}</Text>
                    <InfoRow label={t("universityExtra.mus_hospitals")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_alexandrovska")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_simulationCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_researchLabs")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_library")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mus_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.mus_euPartners")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_ranking")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_who")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mus_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.mus_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.mus_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "11" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nbu_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.nbu_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_familyDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_socialDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_alumniDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nbu_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.nbu_appTest")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_appCreditSystem")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nbu_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.nbu_feeBachelor")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_feeMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_feeUnchanged")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_feeDiscounts")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.nbu_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nbu_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.nbu_halls")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_studios")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_theatre")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_sports")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nbu_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.nbu_openUniversity")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_accreditation")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_honorary")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_cognitiveScience")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nbu_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.nbu_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.nbu_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "12" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uacg_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.uacg_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uacg_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.uacg_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_appArchitecture")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uacg_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.uacg_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_feeEuArch")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_feeNonEu")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_feePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.uacg_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uacg_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.uacg_labs")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_studios")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_testingCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uacg_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.uacg_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_feani")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_ranking")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_industry")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uacg_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.uacg_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.uacg_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "13" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uctm_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.uctm_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uctm_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.uctm_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_appLanguages")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uctm_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.uctm_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_feeLanguages")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_feePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.uctm_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uctm_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.uctm_labs")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_pilot")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_dormitories")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_sports")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uctm_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.uctm_jointDegrees")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_feani")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_francophone")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.uctm_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.uctm_englishFrenchGerman")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.uctm_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "14" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mgu_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.mgu_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_companyScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mgu_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.mgu_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_appMatriculation")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mgu_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.mgu_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_feeForeignBg")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_feeForeignEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_feePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.mgu_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mgu_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.mgu_labs")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_museum")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_kardzhali")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mgu_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.mgu_industry")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_feani")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_research")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.mgu_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.mgu_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.mgu_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "15" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ltu_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.ltu_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ltu_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.ltu_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_appVeterinary")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ltu_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.ltu_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_feeVeterinaryEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_feePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.ltu_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ltu_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.ltu_forests")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_arboretum")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_clinic")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ltu_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.ltu_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_veterinaryEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_industry")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_research")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ltu_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.ltu_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.ltu_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "16" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ulsit_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.ulsit_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ulsit_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.ulsit_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_appMatriculation")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ulsit_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.ulsit_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_feeMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_feePrep")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.ulsit_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ulsit_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.ulsit_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_computerLabs")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_atanasoffLab")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_museum")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ulsit_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.ulsit_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_unesco")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_accreditation")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_balkanNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.ulsit_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.ulsit_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.ulsit_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "17" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vtu_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.vtu_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_erasmusGrants")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_doctoralScholarships")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vtu_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.vtu_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_appMatriculation")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vtu_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.vtu_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_feeEngineering")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_feeExempt")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.vtu_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vtu_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.vtu_labs")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_roadSafetyLab")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_museum")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_ravda")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vtu_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.vtu_industry")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_accreditation")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_conferences")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vtu_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.vtu_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.vtu_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "18" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.utp_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.utp_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_corporateScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.utp_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.utp_appDiploma")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_appNoExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.utp_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.utp_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_feePaid")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_feeExempt")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.utp_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.utp_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.utp_labs")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_ciscoAws")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_elearning")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.utp_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.utp_industry")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_academic")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_employment")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_eurashe")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.utp_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.utp_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_sixCountries")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.utp_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "19" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vuzf_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.vuzf_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_earlyPaymentDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_familyDiscount")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_corporateScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_installments")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vuzf_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.vuzf_appDiploma")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_appRolling")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vuzf_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.vuzf_feeBachelorBg")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_feeBachelorEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_feeMasterEn")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_feeIntlBanking")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.vuzf_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vuzf_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.vuzf_lab")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_moodle")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_careerCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_location")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vuzf_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.vuzf_bac")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_acca")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_industry")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_ranking")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vuzf_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.vuzf_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_coburg")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.vuzf_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "20" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nsa_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.nsa_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_athleteSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nsa_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.nsa_appPhysicalExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_appMatriculation")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nsa_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.nsa_feeSport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_feeKinesitherapy")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_feeExempt")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.nsa_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nsa_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.nsa_stadiums")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_olympicCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_researchCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_clinics")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nsa_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.nsa_olympicCommittee")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_federations")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_enssee")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_champions")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nsa_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.nsa_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.nsa_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "21" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vsu_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.vsu_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_militaryCadets")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vsu_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.vsu_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_appArchitecture")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_appEnglish")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vsu_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.vsu_feeStateSubsidised")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_feeArchitecture")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_feeExempt")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_feePayment")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.vsu_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vsu_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.vsu_labs")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_studios")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_testingCentre")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_dormitories")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vsu_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.vsu_industry")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_militaryLink")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_engineerArchitect")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.vsu_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.vsu_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_prepCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.vsu_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "22" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nha_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.nha_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_talentAwards")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nha_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.nha_appDrawingExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_appPortfolio")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nha_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.nha_feeAnnual")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_feeSemester")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_feeExempt")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_feeApplication")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.nha_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nha_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.nha_building")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_studios")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_gallery")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_burgas")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_residences")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nha_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.nha_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_chinaAcademy")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_exhibitions")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_alumni")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nha_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.nha_foreignStudents")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_englishSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.nha_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "23" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nma_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.nma_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_talentAwards")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nma_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.nma_appExam")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_appAudition")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nma_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.nma_feeState")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_feeSemester")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_feeRefund")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_feeApplication")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.nma_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nma_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.nma_building")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_concertHalls")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_operaTheatre")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_studios")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nma_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.nma_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_competitions")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_concerts")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_alumni")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_bilateral")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.nma_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.nma_foreignStudents")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_englishSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.nma_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "24" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.rndc_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.rndc_militaryFunding")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.rndc_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.rndc_appMilitary")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_appCivilian")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_appMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.rndc_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.rndc_feeMilitary")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_feeState")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_feePaid")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_feeApplication")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.rndc_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.rndc_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.rndc_building")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_simulation")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_dari")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_dormitory")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.rndc_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.rndc_nato")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_ministries")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_alumni")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_international")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.rndc_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.rndc_foreignStudents")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_englishSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.rndc_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "25" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.natfa_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.natfa_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_talentAwards")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.natfa_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.natfa_appAudition")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_appPortfolio")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_appForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.natfa_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.natfa_feeState")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_feeMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_feeExempt")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_feeApplication")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.natfa_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.natfa_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.natfa_theatre")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_puppetTheatre")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_avComplex")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_dormitory")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.natfa_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.natfa_cilect")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_elia")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_festivals")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_alumni")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.natfa_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.natfa_englishPrograms")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_bulgarianCourse")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.natfa_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
              {id === "26" && (
                <>
                  <ExpandableSection title={t("universityExtra.scholarships")} icon="ribbon-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.amvr_scholarshipsDesc")}</Text>
                    <InfoRow label={t("universityExtra.amvr_cadetFunding")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_meritScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_socialScholarships")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_exemptCategories")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_erasmusGrants")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.applicationInfo")} icon="document-text-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.amvr_applicationDesc")}</Text>
                    <InfoRow label={t("universityExtra.amvr_appCadets")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_appCivilian")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_appMaster")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_appDocuments")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_appOnline")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.masterFees")} icon="cash-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.amvr_masterFeesDesc")}</Text>
                    <InfoRow label={t("universityExtra.amvr_feeCadets")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_feeState")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_feePaid")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_feeForeign")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_feeApplication")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.amvr_campus")} icon="business-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.amvr_campusDesc")}</Text>
                    <InfoRow label={t("universityExtra.amvr_building")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_ranges")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_institute")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_library")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_dormitory")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.partners")} icon="globe-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.amvr_partnersDesc")}</Text>
                    <InfoRow label={t("universityExtra.amvr_ministry")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_cepol")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_erasmusNetwork")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_alumni")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_international")} colors={colors} />
                  </ExpandableSection>

                  <ExpandableSection title={t("universityExtra.internationalStudents")} icon="airplane-outline" colors={colors}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 }}>{t("universityExtra.amvr_internationalDesc")}</Text>
                    <InfoRow label={t("universityExtra.amvr_foreignStudents")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_englishSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_visaSupport")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_accommodation")} colors={colors} />
                    <InfoRow label={t("universityExtra.amvr_recognition")} colors={colors} />
                  </ExpandableSection>
                </>
              )}
            </>
          )}

          {id !== "3" ? (
            <View style={{ flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 32 }}>
              <ActionButton icon="globe-outline" label={t("university.website")} primary={false} onPress={() => Linking.openURL(university.website)} />
              <ActionButton icon="paper-plane-outline" label={t("university.applyNow")} primary={true} onPress={() => Linking.openURL(university.applyUrl)} />
            </View>
          ) : (
            <View style={{ marginBottom: 32 }} />
          )}

        </View>
      </ScrollView>
    </View>
  );
} 