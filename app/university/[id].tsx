import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { buildUniversities } from "./university-data";
import { supabase } from "../../lib/supabase";

const { width: SCREEN_WIDTH } = Dimensions.get("window");


function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={16}
          color={star <= rating ? "#f59e0b" : "rgba(255,255,255,0.4)"}
          style={{ marginRight: star === 5 ? 0 : 4 }}
        />
      ))}
    </View>
  );
}

function InfoBadge({ icon, label }: { icon: any; label: string }) {
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
        // use margin on icon for spacing instead of unsupported `gap`
      }}
    >
      <Ionicons name={icon} size={13} color="#ffffff" style={{ marginRight: 6 }} />
      <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
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

function ActionButton({
  icon,
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: disabled ? "#e6e7eb" : primary ? "#0f172a" : "#f1f5f9",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flex: 1,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <Ionicons name={icon} size={18} color={disabled ? "#9ca3af" : primary ? "#ffffff" : "#475569"} style={{ marginRight: 8 }} />
      <Text style={{ color: disabled ? "#9ca3af" : primary ? "#ffffff" : "#475569", fontSize: 14, fontWeight: "700" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function UniversityPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const universities = buildUniversities(t);

  const university = universities.find((u) => u.id === id);

  const [admissionsEmail, setAdmissionsEmail] = useState<string | null | undefined>(
    university?.admissionsEmail ?? undefined,
  );

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("universities")
          .select("id, admissions_email")
          .eq("id", id)
          .single();

        if (cancelled) return;

        if (error || !data) {
          // do not overwrite a local demo value with null — only clear if we explicitly have no local fallback
          if (university?.admissionsEmail === undefined) setAdmissionsEmail(null);
        } else {
          setAdmissionsEmail(data.admissions_email ?? null);
        }
      } catch {
        setAdmissionsEmail(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, university?.admissionsEmail]);

  if (!university) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f0e8" }}>
        <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
        <Text style={{ color: "#94a3b8", fontSize: 16, marginTop: 12 }}>
          {t("university.notFound")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#0f172a", fontWeight: "700" }}>
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
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0e8" }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* Hero Image */}
        <View style={{ height: 320, width: SCREEN_WIDTH }}>
          <ImageBackground source={university.image} style={{ flex: 1 }} resizeMode="cover">
            <View
              style={{
                position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0,
                backgroundColor: "rgba(0,0,0,0.45)",
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

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <StarRating rating={university.rating} />
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginLeft: 8 }}>
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
        <View style={{ padding: 20 }}>

          {/* About */}
          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 10 }}>
              {t("university.about")}
            </Text>
            <Text style={{ fontSize: 14, color: "#475569", lineHeight: 22 }} numberOfLines={expanded ? undefined : 3}>
              {university.longDescription || university.description}
            </Text>
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#0f172a" }}>
                {expanded ? t("university.showLess") : t("university.readMore")}
              </Text>
            </TouchableOpacity>
          </SectionCard>

          {/* Quick Info */}
          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 14 }}>
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
                  borderBottomColor: "#f1f5f9",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#f8fafc",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={row.icon} size={18} color="#64748b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "600", letterSpacing: 0.5 }}>
                    {row.label.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "600", marginTop: 1 }}>
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </SectionCard>

          {/* Programs */}
          <SectionCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a" }}>
                {t("university.programs")}
              </Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/university/project", params: { id } })}
                style={{ alignItems: "center" }}
              >
                <Text style={{ fontSize: 11, color: "#0f172a", fontWeight: "600" }}>
                  {t("university.viewMore")}
                </Text>
                <Ionicons name="grid-outline" size={18} color="#0f172a" style={{ marginTop: 2 }} />
              </TouchableOpacity>
            </View>
          </SectionCard>

          <View style={{ flexDirection: "row", marginTop: 4, marginBottom: 32 }}>
            <View style={{ marginRight: 12, flex: 1 }}>
              <ActionButton icon="globe-outline" label={t("university.website")} primary={false} />
            </View>
            <View style={{ flex: 1 }}>
              {admissionsEmail === undefined ? (
                <View style={{ paddingVertical: 14, alignItems: "center" }}>
                  <ActivityIndicator />
                </View>
              ) : admissionsEmail === null ? (
                <ActionButton
                  icon="paper-plane-outline"
                  label={t("university.applyNotAvailable")}
                  primary={true}
                  disabled={true}
                />
              ) : (
                <ActionButton
                  icon="paper-plane-outline"
                  label={t("university.applyNow")}
                  primary={true}
                  onPress={() => router.push({ pathname: "/apply/[universityId]", params: { universityId: university.id } })}
                />
              )}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}