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

        {/* Hero Image — full photo (contain) over a blurred fill of itself, so nothing is cropped */}
        <View style={{ height: 320, width: "100%", maxWidth: pageWidth, backgroundColor: university.color, overflow: "hidden" }}>
          {/* Blurred backdrop fills the frame edges */}
          <ExpoImage
            source={university.image}
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            contentFit="cover"
            blurRadius={12}
          />
          {/* Dim the blurred backdrop for contrast (keeps the sharp photo below bright) */}
          <View
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: 0, right: 0,
              backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.38)",
            }}
          />
          {/* Sharp, fully-visible photo */}
          <ExpoImage
            source={university.image}
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            contentFit="contain"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 56,
              left: 20,
              backgroundColor: "rgba(0,0,0,0.35)",
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
              backgroundColor: "rgba(0,0,0,0.35)",
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
                backgroundColor: "rgba(0,0,0,0.4)",
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

            <Text
              style={{
                color: "#ffffff",
                fontSize: 26,
                fontWeight: "800",
                letterSpacing: 0.3,
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              {university.name}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
              <StarRating rating={university.rating} />
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 12,
                  textShadowColor: "rgba(0,0,0,0.6)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 5,
                }}
              >
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
                  <StatCard value={sv.labs} label={sv.labsText || t("universityStats.labs")} icon="flask-outline" />
                  <StatCard value={sv.tuitionFreeLabel} label={sv.tuitionFreeText || t("universityStats.tuitionFree")} icon="cash-outline" />
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

          {(id === "1" || id === "2" || id === "3" || id === "4" || id === "5" || id === "6" || id === "7" || id === "8" || id === "9" || id === "10" || id === "11" || id === "12") && (
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