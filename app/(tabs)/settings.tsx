import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { useState, useEffect, useRef } from "react";
import i18n from "../i18n";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";

// ── Reusable row ──────────────────────────────────────────────────────────────
type SettingsRowProps = {
  label: string;
  onPress?: () => void;
};

function SettingsRow({ label, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [user, setUser] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const startPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.06,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user: au },
      } = await supabase.auth.getUser();

      if (au) {
        setAuthUser(au);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", au.id)
          .single();

        if (data) {
          setUser(data);
          setEditedName(data.full_name || "");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    startPulse();
    setLoadingAvatar(true);

    try {
      const fileExt = asset.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const filePath = `${authUser.id}/avatar.${fileExt}`;
      const contentType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, byteArray, { upsert: true, contentType });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", authUser.id);

      if (updateError) throw updateError;

      setUser((prev: any) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      Alert.alert("Error", err.message || "Failed to upload photo.");
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setLoadingName(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editedName.trim() })
        .eq("id", authUser?.id);

      if (error) throw error;

      setUser((prev: any) => ({ ...prev, full_name: editedName.trim() }));
      setIsEditingName(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update name. Please try again.");
      console.error(error);
    } finally {
      setLoadingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.full_name || "");
    setIsEditingName(false);
  };

  const handleLanguageChange = async (lang: "en" | "bg") => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  const handleComingSoon = (featureName: string) => {
    Alert.alert(featureName, `${featureName} is not connected yet.`);
  };

  const handleProfilePress = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setIsEditingName(true);
  };

  const handleLogout = async () => {
    Alert.alert(
      t("settings.logout"),
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: t("settings.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();

              if (error) throw error;

              router.replace("/login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>{t("settings.title") || "Settings"}</Text>

      {/* ── Profile Card — all logic unchanged ── */}
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handlePickAvatar}
          activeOpacity={0.85}
          disabled={loadingAvatar}
        >
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
            {loadingAvatar ? (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : (
              <Image
                source={{
                  uri:
                    user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.full_name || "U"
                    )}&background=1a1a2e&color=fff&size=200`,
                }}
                style={styles.avatar}
              />
            )}
          </Animated.View>
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          {isEditingName ? (
            <View style={styles.editBlock}>
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Your name"
                placeholderTextColor="#94a3b8"
                editable={!loadingName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveName}
                  disabled={loadingName}
                >
                  {loadingName ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingName(true)}
              style={styles.nameRow}
              activeOpacity={0.7}
            >
              <Text style={styles.profileName}>{user?.full_name || "Add your name"}</Text>
              <Text style={styles.editPencil}>✏️</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.profileEmail}>{authUser?.email || ""}</Text>
        </View>
      </View>

      {/* ── Account ── */}
      <Section title="ACCOUNT">
        <SettingsRow label="Profile" onPress={() => router.push('/profile')} />
        <View style={styles.separator} />
        <SettingsRow label="Security" onPress={() => router.push('/security')} />
        <View style={styles.separator} />
        <SettingsRow label="Email Notifications" onPress={() => router.push('/email-notifications')} />
      </Section>

      {/* ── Preferences ── */}
      <Section title="PREFERENCES">
        <SettingsRow label="Appearance" onPress={() => router.push('/appearance')} />
        <View style={styles.separator} />

        {/* Language row — logic unchanged, restyled as inline pills */}
        <View style={styles.settingsRow}>
          <Text style={styles.rowLabel}>{t("settings.language") || "Language"}</Text>
          <View style={styles.langPills}>
            <TouchableOpacity
              style={[styles.langPill, currentLang === "en" && styles.langPillActive]}
              onPress={() => handleLanguageChange("en")}
              activeOpacity={0.8}
            >
              <Text style={styles.langPillFlag}>🇬🇧</Text>
              <Text style={[styles.langPillText, currentLang === "en" && styles.langPillTextActive]}>
                EN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langPill, currentLang === "bg" && styles.langPillActive]}
              onPress={() => handleLanguageChange("bg")}
              activeOpacity={0.8}
            >
              <Text style={styles.langPillFlag}>🇧🇬</Text>
              <Text style={[styles.langPillText, currentLang === "bg" && styles.langPillTextActive]}>
                BG
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.separator} />
        <SettingsRow label="Accessibility" onPress={() => router.push('/accessibility')} />
      </Section>

      {/* ── Support ── */}
      <Section title="SUPPORT">
        <SettingsRow label="Help Center" onPress={() => router.push('/help-center')} />
        <View style={styles.separator} />
        <SettingsRow label="About" onPress={() => router.push('/about')} />
        <View style={styles.separator} />
        <SettingsRow label="Terms of Service" onPress={() => router.push('/terms')} />
      </Section>

      {/* ── Log Out — logic unchanged ── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>{t("settings.logout") || "Log Out"}</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f0e8",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f0e8",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 48,
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 28,
    letterSpacing: -0.5,
  },

  // ── Profile Card (identical to original) ──
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#1a1a2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: 20,
    marginBottom: 28,
  },
  avatarWrapper: { position: "relative" },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    backgroundColor: "#1a1a2e",
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarPlaceholder: {
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraIcon: { fontSize: 13 },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    letterSpacing: -0.3,
  },
  editPencil: { fontSize: 14, opacity: 0.5 },
  profileEmail: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  editBlock: { gap: 8 },
  nameInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a2e",
    paddingBottom: 4,
    letterSpacing: -0.3,
  },
  editActions: { flexDirection: "row", gap: 8 },
  saveBtn: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  cancelBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cancelBtnText: { color: "#64748b", fontWeight: "600", fontSize: 13 },

  // ── Sections ──
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1a1a2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  // ── Settings Row ──
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
    minHeight: 58,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    letterSpacing: -0.1,
  },
  rowChevron: { fontSize: 22, color: "#cbd5e1", fontWeight: "300" },
  separator: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 18 },

  // ── Language pills ──
  langPills: { flexDirection: "row", gap: 6 },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  langPillActive: { backgroundColor: "#1a1a2e", borderColor: "#1a1a2e" },
  langPillFlag: { fontSize: 14 },
  langPillText: { fontSize: 12, fontWeight: "700", color: "#64748b", letterSpacing: 0.5 },
  langPillTextActive: { color: "#ffffff" },

  // ── Logout (identical to original) ──
  logoutBtn: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    marginTop: 8,
    marginBottom: 20,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#dc2626", letterSpacing: 0.2 },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});