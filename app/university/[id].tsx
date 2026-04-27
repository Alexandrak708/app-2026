import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── This must match the UNIVERSITIES array in index.tsx exactly ──
const UNIVERSITIES = [
  {
    id: "1",
    name: "Technical University",
    description: "Leading engineering and technology programs with state-of-the-art research facilities.",
    longDescription: "Technical University of Varna is the second-largest state technical university in Bulgaria. It holds institutional accreditation with the highest rating of Very Good for a six-year period, awarded by the National Evaluation and Accreditation Agency (NEAA). Furthermore, it is the first university in Bulgaria to receive institutional accreditation from the European University Association. The university maintains a high standard of education, certified under ISO 9001:2008, and boasts an extensive international network with mutual cooperation agreements with over 120 foreign universities.",
    rating: 5,
    color: "#1a3a5c",
    image: require("../../assets/images/TU_Picture_01.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Engineering",
    scholarship: true,
    degree: "Bachelor and Master",
  },
  {
    id: "2",
    name: "Medical University",
    description: "World-class medical education with top-ranked clinical training programs.",
    longDescription: "The Medical University of Varna is a leading institution in Bulgarian medical education, known for its high-quality clinical training and research programs.",
    rating: 5,
    color: "#1a4a3a",
    image: require("../../assets/images/mediczinski-universitet-varna-1.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Medical",
    scholarship: true,
    degree: "Master",
  },
  {
    id: "3",
    name: "Economics University",
    description: "Premier business and economics programs shaping future leaders.",
    longDescription: "The Economics University of Varna is a leading institution in Bulgarian economic education, known for its comprehensive programs and research initiatives.",
    rating: 4,
    color: "#3a1a4a",
    image: require("../../assets/images/v4ZW_infe-uev.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Economics",
    scholarship: false,
    degree: "Bachelor",
  },
  {
    id: "4",
    name: "Naval University",
    description: "Pioneering maritime intelligence: Specialized education and research for a global industry.",
    longDescription: "The Naval University of Varna is a leading institution in Bulgarian maritime education, known for its specialized programs and research initiatives.",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/DJI_0181.webp"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Engineering",
    scholarship: false,
    degree: "Bachelor",
  },
  {
    id: "5",
    name: "Free University",
    description: "Specialized maritime education with cutting-edge naval research and training.",
    longDescription: "The Free University of Varna is a leading institution in Bulgarian maritime education, known for its specialized programs and research initiatives.",
    rating: 4,
    color: "#4a2a1a",
    image: require("../../assets/images/svoboden.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Economics",
    scholarship: true,
    degree: "Master",
  },
  {
    id: "6",
    name: "University of Management",
    description: "Where theory meets practice: Shaping the next generation of global business and tourism leaders.",
    longDescription: "The University of Management of Varna is a leading institution in Bulgarian business education, known for its comprehensive programs and research initiatives.",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/vum.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Business",
    scholarship: false,
    degree: "Master",
  },
];

// ─── Star Rating ─────────────────────────────────────────────────
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

// ─── Info Badge ───────────────────────────────────────────────────
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

// ─── Section Card ─────────────────────────────────────────────────
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

// ─── Action Button ────────────────────────────────────────────────
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
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: primary ? "#0f172a" : "#f1f5f9",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flex: 1,
      }}
    >
      <Ionicons name={icon} size={18} color={primary ? "#ffffff" : "#475569"} />
      <Text
        style={{
          color: primary ? "#ffffff" : "#475569",
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function UniversityPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const university = UNIVERSITIES.find((u) => u.id === id);

  // Safety net — if somehow the ID doesn't match
  if (!university) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f0e8" }}>
        <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
        <Text style={{ color: "#94a3b8", fontSize: 16, marginTop: 12 }}>University not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#0f172a", fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0e8" }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero Image ── */}
        <View style={{ height: 320, width: SCREEN_WIDTH }}>
          <ImageBackground
            source={university.image}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            {/* Dark overlay */}
            <View
              style={{
                position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0,
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            />

            {/* Back button */}
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

            {/* Hero content at bottom */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
              {/* Category pill */}
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
                  {university.category.toUpperCase()}
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

              {/* Info badges row */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
                <InfoBadge icon="location-sharp" label={university.location} />
                <InfoBadge icon="school-outline" label={university.degree} />
                <InfoBadge
                  icon={university.scholarship ? "ribbon-outline" : "close-circle-outline"}
                  label={university.scholarship ? "Scholarship available" : "No scholarship"}
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* ── Content ── */}
        <View style={{ padding: 20 }}>

          {/* About */}
        <SectionCard>
         <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 10 }}>
         About
         </Text>
         <Text style={{ fontSize: 14, color: "#475569", lineHeight: 22 }} numberOfLines={expanded ? undefined : 3}>
            {university.longDescription || university.description}
         </Text>
         <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#0f172a" }}>
            {expanded ? "Show less" : "Read more"}
          </Text>
       </TouchableOpacity>
      </SectionCard>

          {/* Quick Info */}
          <SectionCard>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 14 }}>
              Quick Info
            </Text>

            {[
              { icon: "earth-outline" as const, label: "Location", value: university.location },
              { icon: "book-outline" as const, label: "Degree", value: university.degree },
              { icon: "grid-outline" as const, label: "Category", value: university.category },
              {
                icon: "ribbon-outline" as const,
                label: "Scholarship",
                value: university.scholarship ? "Available" : "Not available",
              },
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
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#f8fafc",
                    alignItems: "center",
                    justifyContent: "center",
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

          {/* 
            ── ADD YOUR SECTIONS BELOW THIS LINE ──
            Copy a <SectionCard> block and fill it with whatever you need:
            programs list, campus map, contacts, gallery, etc.
          */}

          {/* Placeholder for future sections */}
          <SectionCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
    <View>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a" }}>
        Programs
      </Text>
    </View>
  <TouchableOpacity
    onPress={() => router.push({ pathname: "/university/project", params: { id } })}
    style={{ alignItems: "center" }}
  >
  <Text style={{ fontSize: 11, color: "#0f172a", fontWeight: "600" }}>View more</Text>
  <Ionicons name="grid-outline" size={18} color="#0f172a" style={{ marginTop: 2 }} />
</TouchableOpacity>
  </View>
          </SectionCard>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 32 }}>
            <ActionButton icon="globe-outline" label="Website" primary={false} />
            <ActionButton icon="paper-plane-outline" label="Apply Now" primary={true} />
          </View>

        </View>
      </ScrollView>
    </View>
  );
}