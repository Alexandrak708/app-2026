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
  Platform,
  type ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { deleteAccount } from "../../lib/account";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ensureProfileRecord } from "../../lib/auth";

// ── Reusable row ──────────────────────────────────────────────────────────────
type SettingsRowProps = {
  label: string;
  onPress?: () => void;
  labelColor: string;
  chevronColor: string;
};

function SettingsRow({ label, onPress, labelColor, chevronColor }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.rowChevron, { color: chevronColor }]}>›</Text>
    </TouchableOpacity>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
  titleColor: string;
  cardStyle: ViewStyle;
};

function Section({ title, children, titleColor, cardStyle }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: titleColor }]}>{title}</Text>
      <View style={[styles.sectionCard, cardStyle]}>{children}</View>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const basePalette = Colors[isDark ? "dark" : "light"];
  const palette = {
    ...basePalette,
    border: isDark ? "#2a303c" : "#e6e9ee",
    surface: isDark ? "#171a21" : "#ffffff",
    surfaceMuted: isDark ? "#222733" : "#f1f5f9",
  };
  const scrollRef = useRef<ScrollView>(null);
  const [user, setUser] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const assetToBytes = async (asset: ImagePicker.ImagePickerAsset) => {
    if (Platform.OS === "web") {
      const webFile = (asset as ImagePicker.ImagePickerAsset & { file?: File }).file;

      if (webFile) {
        const buffer = await webFile.arrayBuffer();
        return new Uint8Array(buffer);
      }

      const response = await fetch(asset.uri);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    }

    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Uint8Array(byteNumbers);
  };

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
        const data = await ensureProfileRecord(au.id);

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
      Alert.alert(t("settings.permissionNeededTitle"), t("settings.photoLibraryPermission"));
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
    if (!authUser) {
      Alert.alert(t("settings.errorTitle"), t("settings.failedToUploadPhoto"));
      return;
    }

    startPulse();
    setLoadingAvatar(true);

    try {
      const fileExt =
        asset.mimeType?.split("/").pop()?.toLowerCase() ??
        asset.uri.split(".").pop()?.toLowerCase() ??
        "jpeg";
      const filePath = `${authUser.id}/avatar.${fileExt}`;
      const contentType = asset.mimeType ?? `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;
      const byteArray = await assetToBytes(asset);

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
      Alert.alert(t("settings.errorTitle"), err.message || t("settings.failedToUploadPhoto"));
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    if (!authUser?.id) {
      Alert.alert(t("settings.errorTitle"), t("auth.errorAuthUnavailable"));
      return;
    }
    if (!editedName.trim()) {
      Alert.alert(t("settings.errorTitle"), t("settings.nameCannotBeEmpty"));
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
      Alert.alert(t("settings.errorTitle"), t("settings.failedToUpdateName"));
      console.error(error);
    } finally {
      setLoadingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.full_name || "");
    setIsEditingName(false);
  };

  const handleComingSoon = (featureName: string) => {
    Alert.alert(featureName, `${featureName} is not connected yet.`);
  };

  const handleProfilePress = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setIsEditingName(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.replace("/login");
    }
  };

  const performDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      Alert.alert(t("settings.deleteAccountSuccess"));
      router.replace("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert(t("settings.errorTitle"), t("settings.deleteAccountError"));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("settings.deleteAccountConfirmTitle"),
      t("settings.deleteAccountConfirmMessage"),
      [
        { text: t("settings.cancel"), style: "cancel" },
        {
          text: t("settings.deleteAccountConfirm"),
          style: "destructive",
          onPress: performDeleteAccount,
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="large" color={palette.text} />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={[styles.scrollContent, { alignItems: "center" }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: "100%", maxWidth: 980, paddingHorizontal: 12 }}>
        <Text style={[styles.pageTitle, { color: palette.text }]}>{t("settings.title")}</Text>

        {/* ── Profile Card — all logic unchanged ── */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? "#171a21" : "#ffffff",
              shadowColor: palette.text,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickAvatar}
            activeOpacity={0.85}
            disabled={loadingAvatar}
          >
            <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
              {loadingAvatar ? (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: palette.tint }]}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              ) : (
                <Image
                  source={{
                    uri:
                      user?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.full_name || "U"
                      )}&background=${isDark ? "ECEDEE" : "1a1a2e"}&color=${isDark ? "151718" : "fff"}&size=200`,
                  }}
                  style={styles.avatar}
                />
              )}
            </Animated.View>
            <View style={[styles.cameraOverlay, { backgroundColor: palette.background, borderColor: palette.border }]}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            {isEditingName ? (
              <View style={styles.editBlock}>
                <TextInput
                  style={[styles.nameInput, { color: palette.text, borderBottomColor: palette.text }]}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder={t("settings.yourNamePlaceholder")}
                  placeholderTextColor={palette.icon}
                  editable={!loadingName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: palette.text }]}
                    onPress={handleSaveName}
                    disabled={loadingName}
                  >
                    {loadingName ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>{t("settings.save")}</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { backgroundColor: isDark ? "#222733" : "#f1f5f9" }]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={[styles.cancelBtnText, { color: palette.tint }]}>{t("settings.cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingName(true)}
                style={styles.nameRow}
                activeOpacity={0.7}
              >
                <Text style={[styles.profileName, { color: palette.text }]}>{user?.full_name || t("settings.addYourName")}</Text>
                <Text style={styles.editPencil}>✏️</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.profileEmail, { color: palette.tint }]}>{authUser?.email || ""}</Text>
          </View>
        </View>

        {/* ── Account ── */}
        <Section
          title={t("settings.sections.account")}
          titleColor={palette.tint}
          cardStyle={{ backgroundColor: isDark ? "#171a21" : "#ffffff", shadowColor: palette.text }}
        >
          <SettingsRow
            label={t("settings.items.profile")}
            onPress={() => router.push('/profile')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <SettingsRow
            label={t("settings.items.emailNotifications")}
            onPress={() => router.push('/email-notifications')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
        </Section>

        {/* ── Preferences ── */}
        <Section
          title={t("settings.sections.preferences")}
          titleColor={palette.tint}
          cardStyle={{ backgroundColor: isDark ? "#171a21" : "#ffffff", shadowColor: palette.text }}
        >
          <SettingsRow
            label={t("settings.items.appearance")}
            onPress={() => router.push('/appearance')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <SettingsRow
            label={t("settings.language")}
            onPress={() => router.push('/language')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <SettingsRow
            label={t("settings.items.accessibility")}
            onPress={() => router.push('/accessibility')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
        </Section>

        {/* ── Support ── */}
        <Section
          title={t("settings.sections.support")}
          titleColor={palette.tint}
          cardStyle={{ backgroundColor: isDark ? "#171a21" : "#ffffff", shadowColor: palette.text }}
        >
          <SettingsRow
            label={t("settings.items.helpCenter")}
            onPress={() => router.push('/help-center')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <SettingsRow
            label={t("settings.items.about")}
            onPress={() => router.push('/about')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <SettingsRow
            label={t("settings.items.termsOfService")}
            onPress={() => router.push('/terms')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <SettingsRow
            label={t("settings.items.privacyPolicy")}
            onPress={() => router.push('/privacy')}
            labelColor={palette.text}
            chevronColor={palette.tint}
          />
        </Section>

        {/* ── Log Out — logic unchanged ── */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: isDark ? "#2a1719" : "#fff0f0",
              borderColor: isDark ? "#7f1d1d" : "#fecaca",
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutText, { color: isDark ? "#fca5a5" : "#dc2626" }]}>{t("settings.logout") || "Log Out"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAccountBtn}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={isDark ? "#fca5a5" : "#dc2626"} size="small" />
          ) : (
            <Text style={[styles.deleteAccountText, { color: isDark ? "#fca5a5" : "#dc2626" }]}>
              {t("settings.deleteAccount")}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: palette.tint }]}>{t("settings.appVersion", { version: Constants.expoConfig?.version ?? "1.0.0" })}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFBF7",
  },
  container: {
    flex: 1,
    backgroundColor: "#FCFBF7",
  },
  scrollContent: {
    padding: 12,
    paddingTop: 64,
    paddingBottom: 48,
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 28,
    marginLeft: 2,
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
  profileEmail: { fontSize: 13, color: "#810B38", fontWeight: "500" },
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
  cancelBtnText: { color: "#810B38", fontWeight: "600", fontSize: 13 },

  // ── Sections ──
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#810B38",
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
    paddingHorizontal: 14,
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
  rowChevron: { fontSize: 22, color: "#810B38", fontWeight: "300" },
  separator: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 14 },

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

  deleteAccountBtn: {
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    textDecorationLine: "underline",
    letterSpacing: 0.2,
  },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#810B38",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});