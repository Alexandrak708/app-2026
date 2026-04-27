import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Programs data per university ────────────────────────────────
// Add or remove programs here whenever you need to update them
const PROGRAMS: Record<string, { bachelor?: string[]; master?: string[] }> = {
  "1": {
    // Technical University
    bachelor: [
      "Automation, Information and Control Computer Systems (AICCS)",
      "Automotive Engineering (AE)",
      "Agronomy (A)",
      "Renewable Energy Sources (RES)",
      "Electric Power Engineering (EPE)",
      "Electronics (E)",
      "Ship Electrical Equipment (SEE)",
      "Electric Power Supply and Electrical Equipment (EPSEE)",
      "Electrical Engineering and Electrical Technologies (EEET)",
      "Civil Protection in Disasters and Emergencies (CPDE)",
      "Artificial Intelligence (AI)",
      "Industrial Design (ID)",
      "Industrial Management (IM)",
      "Environmental (Ecological) Engineering (EE)",
      "Intelligent Transport Systems (ITS)",
      "Information and Communication Technologies (ICT)",
      "Cybersecurity (CS)",
      "Computerized Technologies in Mechanical Engineering (CTME)",
      "Computer Systems and Technologies (CST)",
      "Marine Engineering (Ship Machines and Mechanisms)",
      "Navigation (Ship Maneuvering)",
      "Naval Architecture and Marine Technology (NAMT)",
      "Water Transport Logistics (WTL)",
      "Mechanical Engineering and Technologies (MET)",
      "Robotics and Mechatronics (RM)",
      "Software and Internet Technologies (SIT)",
      "Social Management (SM)",
      "Construction Management (CM)",
      "Technological Entrepreneurship and Innovation (TEI)",
      "Heat Power Engineering and Investment Design (HPEID)",
      "Transport Equipment and Technologies (TET)",
    ],
    master: [
      "Data Analysis and Network Technologies (DANT)",
      "Health and Safety at Work (HSW)",
      "Renewable Energy Sources (RES)",
      "Internal Combustion Engines and Automotive Engineering (ICEAE – Post-Professional Bachelor track)",
      "Operation of Fleet and Ports (OFP)",
      "Electric Power Systems (EPS)",
      "Electronics (E)",
      "Ship Electrical Equipment (SEE)",
      "Electric Power Supply and Electrical Equipment in Water Transport (EPSEEWT)",
      "Electric Power Supply and Electrical Equipment in Industry (EPSEEI)",
      "Electrical Engineering (EE)",
      "Industrial Design (ID)",
      "Industrial Management (IM)",
      "Environmental Engineering (EE)",
      "Smart Cities",
      "Cybersecurity (CS)",
      "Computerized Technologies in Mechanical Engineering (CTME)",
      "Computer Networks and Communications (CNC)",
      "Marine Engineering (Ship Machines and Mechanisms)",
      "Navigation",
      "Naval Architecture and Marine Technology (NAMT)",
      "Corporate Management (CM)",
      "Water Transport Logistics (WTL)",
      "Mechanical Engineering and Technologies (MET)",
      "Design of Renewable Energy Facilities (DREF)",
      "Seed Production and Plant Protection (SPPP)",
      "Building Automation Systems (BAS)",
      "Artificial Intelligence Systems (AIS)",
      "Software Engineering (SE)",
      "Social Management (SM)",
      "Social Work with Individuals with Deviant Behavior (SWIDB)",
      "Social Work with Children (SWC)",
      "Social Entrepreneurship (SE)",
      "Modern Systems in Agriculture (MSA)",
      "Modern Technologies in Agriculture (MTA)",
      "Telecommunications and Mobile Technologies (TMT)",
      "Materials Processing Equipment and Technologies (MPET)",
      "Technical and Insurance Expertise in Transport (TIET)",
      "Heat Engineering and Renewable Energy Sources (HERES)",
      "Transport Equipment and Technologies (TET)",
      "Chemical Engineering (CE)",
      "Siemens PLC Control Technologies (SIEMENS)",
    ],
  },
  "2": {
    // Medical University
    bachelor: [
      "Medicine",
      "Dental Medicine",
      "Pharmacy",
      "Nursing",
      "Midwifery",
    ],
    master: [
      "Public Health",
      "Health Management",
      "Clinical Pharmacy",
    ],
  },
  "3": {
    // Economics University
    bachelor: [
      "Economics",
      "Finance",
      "Accounting",
      "Marketing",
      "International Business",
    ],
  },
  "4": {
    // Naval University
    bachelor: [
      "Navigation",
      "Marine Engineering",
      "Naval Architecture",
      "Port Management",
    ],
  },
  "5": {
    // Free University
    master: [
      "Business Administration",
      "International Relations",
      "Public Administration",
      "European Studies",
    ],
  },
  "6": {
    // University of Management
    master: [
      "Tourism Management",
      "Hotel Management",
      "Event Management",
      "Digital Marketing",
    ],
  },
};

// ─── University names for the header ─────────────────────────────
const UNIVERSITY_NAMES: Record<string, string> = {
  "1": "Technical University",
  "2": "Medical University",
  "3": "Economics University",
  "4": "Naval University",
  "5": "Free University",
  "6": "University of Management",
};

// ─── Single program row ───────────────────────────────────────────
function ProgramRow({ name, index }: { name: string; index: number }) {
  return (
    <View
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
    </View>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ProgramsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const programs = PROGRAMS[id] ?? {};
  const hasBachelor = !!programs.bachelor && programs.bachelor.length > 0;
  const hasMaster = !!programs.master && programs.master.length > 0;

  // Default to whichever tab exists
  const [activeTab, setActiveTab] = useState<"bachelor" | "master">(
    hasBachelor ? "bachelor" : "master"
  );

  const universityName = UNIVERSITY_NAMES[id] ?? "University";
  const currentPrograms =
    activeTab === "bachelor" ? programs.bachelor ?? [] : programs.master ?? [];

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
          <ProgramRow key={program} name={program} index={index} />
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