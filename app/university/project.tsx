import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next"; // 👈 ADDED
import {
  getProgramSummaries,
  getUniversityName,
} from "./university-programs";
import { useAppTheme } from "@/hooks/use-theme-color";

function ProgramRow({
  name,
  index,
  onPress,
}: {
  name: string;
  index: number;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderRadius: 14,
        marginBottom: 10,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: colors.mutedSurface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary }}>
          {index + 1}
        </Text>
      </View>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text }}>
        {name}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProgramsPage() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { t } = useTranslation(); // 👈 ADDED

  const universityId = Array.isArray(id) ? id[0] : id;
  const activeUniversityId = universityId ?? "";

  const bachelorPrograms = getProgramSummaries(activeUniversityId, "bachelor");
  const masterPrograms = getProgramSummaries(activeUniversityId, "master");
  const programs = {
    bachelor: bachelorPrograms,
    master: masterPrograms,
  };
  const hasBachelor = !!programs.bachelor && programs.bachelor.length > 0;
  const hasMaster = !!programs.master && programs.master.length > 0;

  const [activeTab, setActiveTab] = useState<"bachelor" | "master">(
    hasBachelor ? "bachelor" : "master"
  );
  const { colors, isDark } = useAppTheme();

  const universityName = getUniversityName(activeUniversityId);
  const currentPrograms = activeTab === "bachelor" ? programs.bachelor ?? [] : programs.master ?? [];

  const openProgram = (programSlug: string) => {
    if (!activeUniversityId) return;
    router.push({
      pathname: "/university/program/[programId]",
      params: {
        universityId: activeUniversityId,
        level: activeTab,
        programId: programSlug,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 20,
            alignSelf: "flex-start",
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
            {universityName}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: "600", letterSpacing: 1 }}>
          {t("programs.explore")} {/* 👈 CHANGED */}
        </Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 4 }}>
          {t("programs.title")} {/* 👈 CHANGED */}
        </Text>
      </View>

      {/* Tab Buttons */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 24,
          backgroundColor: colors.mutedSurface,
          borderRadius: 14,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {hasBachelor && (
          <TouchableOpacity
            onPress={() => setActiveTab("bachelor")}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 11,
              alignItems: "center",
              backgroundColor: activeTab === "bachelor" ? (isDark ? "#e2e8f0" : "#0f172a") : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: activeTab === "bachelor" ? (isDark ? "#0f172a" : "#ffffff") : colors.textSecondary }}>
              {t("degrees.Bachelor")} {/* 👈 CHANGED */}
            </Text>
          </TouchableOpacity>
        )}

        {hasMaster && (
          <TouchableOpacity
            onPress={() => setActiveTab("master")}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 11,
              alignItems: "center",
              backgroundColor: activeTab === "master" ? (isDark ? "#e2e8f0" : "#0f172a") : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: activeTab === "master" ? (isDark ? "#0f172a" : "#ffffff") : colors.textSecondary }}>
              {t("degrees.Master")} {/* 👈 CHANGED */}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Program count */}
      <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "600", letterSpacing: 0.5, marginHorizontal: 24, marginBottom: 12 }}>
        {t("programs.available", { count: currentPrograms.length })} {/* 👈 CHANGED */}
      </Text>

      {/* Programs List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {currentPrograms.map((program, index) => (
          <ProgramRow
            key={program.slug}
            name={program.title}
            index={index}
            onPress={() => openProgram(program.slug)}
          />
        ))}

        {currentPrograms.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="school-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: "600", marginTop: 12 }}>
              {t("programs.noneAvailable")} {/* 👈 CHANGED */}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}