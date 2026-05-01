import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  getProgramSummaries,
  getUniversityName,
} from "./university-programs";

// ─── Single program row ───────────────────────────────────────────
function ProgramRow({
  name,
  index,
  onPress,
}: {
  name: string;
  index: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        marginBottom: 10,
        shadowColor: "#000",
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
          backgroundColor: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748b" }}>
          {index + 1}
        </Text>
      </View>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0f172a" }}>
        {name}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ProgramsPage() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();

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

  // Default to whichever tab exists
  const [activeTab, setActiveTab] = useState<"bachelor" | "master">(
    hasBachelor ? "bachelor" : "master"
  );

  const universityName = getUniversityName(activeUniversityId);
  const currentPrograms = activeTab === "bachelor" ? programs.bachelor ?? [] : programs.master ?? [];

  const openProgram = (programSlug: string) => {
    if (!activeUniversityId) {
      return;
    }

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
    <View style={{ flex: 1, backgroundColor: "#f5f0e8" }}>

      {/* ── Header ── */}
      <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 }}>

        {/* Back button */}
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
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a" }}>
            {universityName}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600", letterSpacing: 1 }}>
          EXPLORE
        </Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: "#0f172a", marginTop: 4 }}>
          Programs
        </Text>
      </View>

      {/* ── Tab Buttons ── */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 24,
          backgroundColor: "#e2e8f0",
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
              backgroundColor: activeTab === "bachelor" ? "#0f172a" : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: activeTab === "bachelor" ? "#ffffff" : "#64748b",
              }}
            >
              Bachelor
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
              backgroundColor: activeTab === "master" ? "#0f172a" : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: activeTab === "master" ? "#ffffff" : "#64748b",
              }}
            >
              Master
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Program count ── */}
      <Text
        style={{
          fontSize: 12,
          color: "#94a3b8",
          fontWeight: "600",
          letterSpacing: 0.5,
          marginHorizontal: 24,
          marginBottom: 12,
        }}
      >
        {currentPrograms.length} {currentPrograms.length === 1 ? "PROGRAM" : "PROGRAMS"} AVAILABLE
      </Text>

      {/* ── Programs List ── */}
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
            <Ionicons name="school-outline" size={40} color="#cbd5e1" />
            <Text style={{ color: "#94a3b8", fontSize: 15, fontWeight: "600", marginTop: 12 }}>
              No programs available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}