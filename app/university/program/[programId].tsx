import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next"; // 👈 ADDED
import { buildProgramDetail, ProgramLevel } from "../university-programs";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 18,
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

function Pill({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: "#f1f5f9",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: "#0f172a", fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

export default function ProgramDetailPage() {
  const router = useRouter();
  const { t } = useTranslation(); // 👈 ADDED
  const { universityId, level, programId } = useLocalSearchParams<{
    universityId?: string | string[];
    level?: string | string[];
    programId?: string | string[];
  }>();

  const detail = buildProgramDetail(universityId, level, programId);
  const partnersValue = detail?.partners?.length
    ? detail.partners.join(", ")
    : detail?.studyMode;

  if (!detail) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FCFBF7", padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "800", marginTop: 12, textAlign: "center" }}>
          {t("programDetail.notFound")} {/* 👈 CHANGED */}
        </Text>
        <Text style={{ color: "#64748b", fontSize: 14, marginTop: 8, textAlign: "center" }}>
          {t("programDetail.notFoundDesc")} {/* 👈 CHANGED */}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: "#0f172a", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>
            {t("university.goBack")} {/* 👈 REUSED from university section */}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FCFBF7" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 18 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 20 }}
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a" }}>
              {t("programDetail.backToPrograms")} {/* 👈 CHANGED */}
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "700", letterSpacing: 1 }}>
            {t("programDetail.label")} {/* 👈 CHANGED */}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#0f172a", marginTop: 4 }}>
            {detail.title}
          </Text>
          <Text style={{ fontSize: 15, color: "#475569", marginTop: 8, lineHeight: 22 }}>
            {detail.universityName} • {detail.level === "master" ? t("degrees.Master") : t("degrees.Bachelor")} {/* 👈 CHANGED */}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 10 }}>
              {t("programDetail.overview")} {/* 👈 CHANGED */}
            </Text>
            <Text style={{ fontSize: 14, color: "#475569", lineHeight: 22 }}>
              {detail.overview}
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 14 }}>
              {t("programDetail.snapshot")} {/* 👈 CHANGED */}
            </Text>
            {[
              { icon: "business-outline" as const, label: t("programDetail.university"), value: detail.universityName },
              { icon: "book-outline" as const, label: t("programDetail.level"), value: detail.level === "master" ? t("degrees.Master") : t("degrees.Bachelor") },
              { icon: "time-outline" as const, label: t("programDetail.duration"), value: detail.duration },
              { icon: "layers-outline" as const, label: t("programDetail.studyMode"), value: partnersValue ?? "" },
            ].map((row) => (
              <View
                key={row.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f1f5f9",
                  gap: 12,
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
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

          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 10 }}>
              {t("programDetail.keyFocus")} {/* 👈 CHANGED */}
            </Text>
            <Text style={{ fontSize: 14, color: "#475569", lineHeight: 22 }}>{detail.keyFocus}</Text>
          </SectionCard>

          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 }}>
              {t("programDetail.highlights")} {/* 👈 CHANGED */}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {detail.highlights.map((highlight) => (
                <Pill key={highlight} label={highlight} />
              ))}
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 }}>
              {t("programDetail.careers")} {/* 👈 CHANGED */}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {detail.careers.map((career) => (
                <Pill key={career} label={career} />
              ))}
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 }}>
              {t("programDetail.admissionNotes")} {/* 👈 CHANGED */}
            </Text>
            {detail.admissionNotes.map((note) => (
              <View key={note} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color="#0f172a" style={{ marginTop: 1 }} />
                <Text style={{ flex: 1, fontSize: 14, color: "#475569", lineHeight: 21 }}>{note}</Text>
              </View>
            ))}
          </SectionCard>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: "#0f172a", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 4 }}
          >
            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "800" }}>
              {t("programDetail.returnToPrograms")} {/* 👈 CHANGED */}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
