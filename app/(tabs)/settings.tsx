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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { deleteAccount } from "@/lib/account";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/use-theme-color";
import { useAppSettings } from "@/contexts/settings-context";
import { Fonts } from "@/constants/typography";
import { ScreenHeader } from "@/components/editorial";
import { useIsWideWeb } from "@/components/responsive";
import SettingsWeb from "@/components/settings-web";
import { ensureProfileRecord, getCurrentUser, signOutLocal } from "@/lib/auth";
import { updateProfileAvatarUrl, updateProfileFullName, uploadAvatar } from "@/lib/profile";
import type { Profile } from "@/types/profile";

// ── Reusable hairline row ──────────────────────────────────────────────────────
function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isLast,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14, color: colors.text }}>{label}</Text>
      {value ? <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: colors.textMuted }}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function SectionLabel({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.heading,
        fontSize: 11,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: colors.textMuted,
        marginTop: 22,
        marginBottom: 2,
      }}
    >
      {children}
    </Text>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { reduceMotion } = useAppSettings();
  const wide = useIsWideWeb(900); // web ≥900px: two-column, wider settings
  const scrollRef = useRef<ScrollView>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
    if (reduceMotion) return; // Respect the Reduce Motion accessibility setting.
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
      const au = await getCurrentUser();

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
      const contentType = asset.mimeType ?? `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;
      const byteArray = await assetToBytes(asset);

      const publicUrl = await uploadAvatar(authUser.id, byteArray, contentType, fileExt);
      await updateProfileAvatarUrl(authUser.id, publicUrl);

      setUser((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    } catch (err) {
      console.error("Avatar upload error:", err);
      const message = err instanceof Error ? err.message : t("settings.failedToUploadPhoto");
      Alert.alert(t("settings.errorTitle"), message);
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
      await updateProfileFullName(authUser.id, editedName.trim());

      setUser((prev) => (prev ? { ...prev, full_name: editedName.trim() } : prev));
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

  const handleLogout = async () => {
    try {
      await signOutLocal();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.replace("/login");
    }
  };

  const performDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      // Account + data are gone server-side and the local session is cleared;
      // send the user back to the auth flow.
      setConfirmDeleteOpen(false);
      router.replace("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      // Keep the dialog open and surface the failure inline (works on web, where
      // RN Alert dialogs don't render).
      setDeleteError(t("settings.deleteAccountError"));
    } finally {
      setDeleting(false);
    }
  };

  // Opens the confirmation dialog. Uses a cross-platform <Modal> rather than
  // Alert.alert, which react-native-web does not render.
  const handleDeleteAccount = () => {
    setDeleteError("");
    setConfirmDeleteOpen(true);
  };

  if (initialLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const initials = (user?.full_name || authUser?.email || "U")
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const version = Constants.expoConfig?.version ?? "1.0.0";

  // Editable avatar + name + email. Shared between the native/narrow list (top
  // of the page) and the web master-detail's Profile panel.
  const profileBlock = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 8, marginBottom: 4 }}>
      <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} disabled={loadingAvatar}>
        <Animated.View
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            transform: [{ scale: pulseAnim }],
          }}
        >
          {loadingAvatar ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={{ width: 56, height: 56 }} />
          ) : (
            <Text style={{ fontFamily: Fonts.heading, fontSize: 20, color: colors.accent }}>{initials}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        {isEditingName ? (
          <View style={{ gap: 8 }}>
            <TextInput
              style={{
                fontFamily: Fonts.heading,
                fontSize: 17,
                color: colors.text,
                borderBottomWidth: 1,
                borderBottomColor: colors.accent,
                paddingBottom: 4,
              }}
              value={editedName}
              onChangeText={setEditedName}
              placeholder={t("settings.yourNamePlaceholder")}
              placeholderTextColor={colors.textMuted}
              editable={!loadingName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={{
                  borderWidth: 1, borderColor: colors.accent, borderRadius: 4,
                  paddingHorizontal: 16, paddingVertical: 7, minWidth: 60, alignItems: "center",
                }}
                onPress={handleSaveName}
                disabled={loadingName}
              >
                {loadingName ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <Text style={{ fontFamily: Fonts.heading, color: colors.accent, fontSize: 13 }}>{t("settings.save")}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderWidth: 1, borderColor: colors.divider, borderRadius: 4,
                  paddingHorizontal: 14, paddingVertical: 7,
                }}
                onPress={handleCancelEdit}
              >
                <Text style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 13 }}>{t("settings.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditingName(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            activeOpacity={0.7}
          >
            <Text style={{ fontFamily: Fonts.heading, fontSize: 17, color: colors.text }}>
              {user?.full_name || t("settings.addYourName")}
            </Text>
            <Ionicons name="pencil-outline" size={13} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
          {authUser?.email || ""}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: "100%", maxWidth: wide ? 1180 : 640, paddingHorizontal: 24, paddingTop: 64 }}>
        <ScreenHeader kicker={t("settings.sections.account")} title={t("settings.title")} titleSize={30} />

        {wide ? (
          /* Web: icon rail + content pane (Profile shown first). */
          <View style={{ marginTop: 18 }}>
            <SettingsWeb
              version={version}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              deleting={deleting}
            />
          </View>
        ) : (
          /* Native / narrow web: the original single-column list (unchanged). */
          <>
            <View style={{ marginTop: 14 }}>{profileBlock}</View>

            <View style={{ height: 1, backgroundColor: colors.divider, marginTop: 18 }} />

            {/* ── Account ── */}
            <SectionLabel colors={colors}>{t("settings.sections.account")}</SectionLabel>
            <SettingsRow icon="person-outline" label={t("settings.items.profile")} onPress={() => router.push("/profile")} colors={colors} />
            <SettingsRow icon="notifications-outline" label={t("settings.items.emailNotifications")} onPress={() => router.push("/email-notifications")} isLast colors={colors} />

            {/* ── Preferences ── */}
            <SectionLabel colors={colors}>{t("settings.sections.preferences")}</SectionLabel>
            <SettingsRow icon="sunny-outline" label={t("settings.items.appearance")} onPress={() => router.push("/appearance")} colors={colors} />
            <SettingsRow icon="globe-outline" label={t("settings.language")} onPress={() => router.push("/language")} colors={colors} />
            <SettingsRow icon="accessibility-outline" label={t("settings.items.accessibility")} onPress={() => router.push("/accessibility")} isLast colors={colors} />

            {/* ── Support ── */}
            <SectionLabel colors={colors}>{t("settings.sections.support")}</SectionLabel>
            <SettingsRow icon="help-circle-outline" label={t("settings.items.helpCenter")} onPress={() => router.push("/help-center")} colors={colors} />
            <SettingsRow icon="information-circle-outline" label={t("settings.items.about")} onPress={() => router.push("/about")} colors={colors} />
            <SettingsRow icon="document-text-outline" label={t("settings.items.termsOfService")} onPress={() => router.push("/terms")} colors={colors} />
            <SettingsRow icon="shield-checkmark-outline" label={t("settings.items.privacyPolicy")} onPress={() => router.push("/privacy")} isLast colors={colors} />

            {/* ── Sign out ── */}
            <TouchableOpacity
              style={{
                borderWidth: 1, borderColor: colors.divider, borderRadius: 4,
                paddingVertical: 13, alignItems: "center", marginTop: 26, marginBottom: 18,
              }}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={{ fontFamily: Fonts.heading, fontSize: 15, color: colors.accent }}>{t("settings.logout") || "Log Out"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ padding: 12, alignItems: "center", marginBottom: 12 }} onPress={handleDeleteAccount} activeOpacity={0.7} disabled={deleting}>
              {deleting ? (
                <ActivityIndicator color={isDark ? "#fca5a5" : "#dc2626"} size="small" />
              ) : (
                <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: isDark ? "#fca5a5" : "#dc2626", textDecorationLine: "underline" }}>
                  {t("settings.deleteAccount")}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={{ textAlign: "center", fontFamily: Fonts.body, fontSize: 12, color: colors.textMuted }}>
              {t("settings.appVersion", { version })}
            </Text>
          </>
        )}
      </View>
    </ScrollView>

      {/* Delete-account confirmation. An explicit absolute overlay (not RN
          <Modal>, which does not reliably stack above the app on
          react-native-web). Confirming permanently deletes the account + data
          via the delete-account Edge Function. */}
      {confirmDeleteOpen ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            elevation: 1000,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View style={{ width: "100%", maxWidth: 440, backgroundColor: colors.surface, borderRadius: 16, padding: 24, gap: 12 }}>
            <Text style={{ fontFamily: Fonts.heading, fontSize: 20, color: colors.text }}>
              {t("settings.deleteAccountConfirmTitle")}
            </Text>
            <Text style={{ fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
              {t("settings.deleteAccountConfirmMessage")}
            </Text>
            {deleteError ? (
              <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: "#dc2626" }}>{deleteError}</Text>
            ) : null}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8, justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
                activeOpacity={0.7}
                style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 8, borderWidth: 1, borderColor: colors.divider }}
              >
                <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: colors.text }}>{t("settings.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={performDeleteAccount}
                disabled={deleting}
                activeOpacity={0.85}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  borderRadius: 8,
                  backgroundColor: isDark ? "#7f1d1d" : "#dc2626",
                  minWidth: 132,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: deleting ? 0.85 : 1,
                }}
              >
                {deleting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: "#ffffff" }}>
                    {t("settings.deleteAccountConfirm")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
