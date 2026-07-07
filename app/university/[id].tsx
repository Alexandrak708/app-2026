import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { buildUniversities } from "./university-data";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useAppTheme } from "@/hooks/use-theme-color";

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={16}
          color={star <= rating ? "#f59e0b" : "rgba(255,255,255,0.4)"}
        />
      ))}
    </View>
  );
}

function InfoBadge({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        gap: 6,
      }}
    >
      <Ionicons name={icon} size={13} color="#ffffff" />
      <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.mutedSurface,
        borderRadius: 16,
        padding: 14,
        alignItems: "center",
        minWidth: 80,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.text} style={{ marginBottom: 6 }} />
      <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{value}</Text>
      <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center", marginTop: 2 }}>{label}</Text>
    </View>
  );
}

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
  const { colors, isDark } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: primary ? (isDark ? "#e2e8f0" : "#0f172a") : colors.mutedSurface,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flex: 1,
      }}
    >
      <Ionicons name={icon} size={18} color={primary ? (isDark ? "#0f172a" : "#ffffff") : colors.textSecondary} />
      <Text style={{ color: primary ? (isDark ? "#0f172a" : "#ffffff") : colors.textSecondary, fontSize: 14, fontWeight: "700" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ExpandableSection({ title, icon, children, colors }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode; colors: any }) {
  const [open, setOpen] = useState(false);
  return (
    <SectionCard>
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name={icon} size={18} color={colors.text} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 }}>{title}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {open && <View style={{ marginTop: 14 }}>{children}</View>}
    </SectionCard>
  );
}

function InfoRow({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
      <Text style={{ color: colors.text, fontSize: 12 }}>•</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18, flex: 1 }}>{label}</Text>
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

        {/* Hero Image */}
        <View style={{ height: 320, width: "100%", maxWidth: pageWidth }}>
          <ImageBackground source={university.image} style={{ flex: 1 }} resizeMode="cover">
            <View
              style={{
                position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0,
                backgroundColor: isDark ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.45)",
              }}
            />

            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                top: 56,
                left: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>

            {/* Heart button in top-right of hero */}
            <TouchableOpacity
              onPress={() => toggleFavourite(id as any)}
              style={{
                position: "absolute",
                top: 56,
                right: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons
                name={checkFavourite(id as any) ? "heart" : "heart-outline"}
                size={22}
                color={checkFavourite(id as any) ? "#ef4444" : "#ffffff"}
              />
            </TouchableOpacity>

            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>
                  {categoryLabel.toUpperCase()}
                </Text>
              </View>

              <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: "800", letterSpacing: 0.3 }}>
                {university.name}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
                <StarRating rating={university.rating} />
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                  {university.rating}.0 / 5.0
                </Text>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
                <InfoBadge icon="location-sharp" label={university.location} />
                <InfoBadge icon="school-outline" label={university.degreeLabel} />
                <InfoBadge
                  icon={university.scholarship ? "ribbon-outline" : "close-circle-outline"}
                  label={scholarshipLabel}
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={{ padding: 20, width: "100%", maxWidth: pageWidth }}>

          {/* About */}
          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 10 }}>
              {t("university.about")}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }} numberOfLines={expanded ? undefined : 3}>
              {university.longDescription || university.description}
            </Text>
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                {expanded ? t("university.showLess") : t("university.readMore")}
              </Text>
            </TouchableOpacity>
          </SectionCard>

          {/* Quick Info */}
          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 14 }}>
              {t("university.quickInfo")}
            </Text>

            {quickInfoRows.map((row) => (
              <View
                key={row.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.softBorder,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.mutedSurface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={row.icon} size={18} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600", letterSpacing: 0.5 }}>
                    {row.label.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: "600", marginTop: 1 }}>
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}

            {id && (() => {
              const tiers = t(`tuitionTiers.${id}`, { returnObjects: true }) as Array<{ range: string; label: string }> | string | undefined;
              if (!tiers || typeof tiers === "string") return null;
              return (
                <View style={{ marginTop: 14, backgroundColor: colors.mutedSurface, borderRadius: 12, padding: 12 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600", letterSpacing: 0.5, marginBottom: 8 }}>
                    {t("tuitionTiersHeader")}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                    {tiers.map((tier) => (
                      <View key={tier.range} style={{ backgroundColor: colors.background, borderRadius: 8, padding: 8, minWidth: "45%", flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{tier.range}</Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>{tier.label}</Text>
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
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 14 }}>
                  {t("universityStats.title")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  <StatCard value={sv.yearsTradition} label={t("universityStats.yearsTradition")} icon="time-outline" />
                  <StatCard value={sv.bachelorPrograms} label={t("universityStats.bachelorPrograms")} icon="school-outline" />
                  <StatCard value={sv.masterPrograms} label={t("universityStats.masterPrograms")} icon="book-outline" />
                  <StatCard value={sv.internationalPartners} label={t("universityStats.internationalPartners")} icon="globe-outline" />
                  <StatCard value={sv.countries} label={t("universityStats.fromCountries", { count: parseInt(sv.countries) || 0 })} icon="flag-outline" />
                  <StatCard value={sv.studentsGraduated} label={t("universityStats.studentsGraduated")} icon="people-outline" />
                  <StatCard value={sv.labs} label={t("universityStats.labs")} icon="flask-outline" />
                  <StatCard value={sv.tuitionFreeLabel} label={t("universityStats.tuitionFree")} icon="cash-outline" />
                </View>
              </SectionCard>
            );
          })()}

          {/* Programs */}
          <SectionCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                {t("university.programs")}
              </Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/university/project", params: { id } })}
                style={{ alignItems: "center" }}
              >
                <Text style={{ fontSize: 11, color: colors.text, fontWeight: "600" }}>
                  {t("university.viewMore")}
                </Text>
                <Ionicons name="grid-outline" size={18} color={colors.text} style={{ marginTop: 2 }} />
              </TouchableOpacity>
            </View>
          </SectionCard>

          {(id === "1" || id === "2" || id === "3") && (
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