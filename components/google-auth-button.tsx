import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Fonts } from "@/constants/typography";

// The auth screens (login/register) use a fixed light "paper" card in both
// themes, so these tones are pinned to match rather than read from the palette.
const LINE = "rgba(32,31,29,0.16)";
const TEXT = "#201f1d";
const MUTED = "rgba(32,31,29,0.55)";
const ACCENT = "#810B38";

/**
 * "Continue with Google" button for the login/register cards, preceded by an
 * "or" divider. Presentation only — the caller wires `onPress` to the Supabase
 * Google OAuth flow (`signInWithGoogle`).
 */
export function GoogleAuthButton({
  onPress,
  loading,
  label,
  dividerLabel,
}: {
  onPress: () => void;
  loading?: boolean;
  label: string;
  dividerLabel: string;
}) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18, marginBottom: 14 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
        <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: MUTED }}>{dividerLabel}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
      </View>
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          borderWidth: 1,
          borderColor: LINE,
          borderRadius: 4,
          paddingVertical: 12,
          backgroundColor: "#ffffff",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={ACCENT} />
        ) : (
          <>
            <MaterialCommunityIcons name="google" size={18} color="#4285F4" />
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: TEXT }}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
