import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, Animated, Easing, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { User } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { deleteAccount } from "@/lib/account";
import { useAppTheme } from "@/hooks/use-theme-color";
import { useAppSettings } from "@/contexts/settings-context";
import { useFavourites } from "@/contexts/favourites-context";
import { Fonts } from "@/constants/typography";
import { ContentWrap, isWeb, useIsDesktopWeb } from "@/components/responsive";
import { hoverTransition, useHover } from "@/components/program-ui";
import SettingsWeb, { type PanelKey } from "@/components/settings-web";
import SiteFooter from "@/components/home/site-footer";
import { WEB_PAGE_GUTTER, WEB_PAGE_MAX_WIDTH } from "@/components/web-top-nav";
import { Wordmark } from "@/components/wordmark";
import {
  FieldLabel, LanguagePicker, NavRow, OutlineButton, RowDivider, SectionHeading, SettingsCard, ThemePicker, ToggleRow,
  pressFade, type IconName,
} from "@/components/settings-ui";
import { DangerZone, DeleteAccountDialog, NotificationsFootnote, ProfileCard } from "@/components/settings-parts";
import { ensureProfileRecord, getCurrentUser, signOutLocal } from "@/lib/auth";
import { updateProfileAvatarUrl, updateProfileFullName, uploadAvatar } from "@/lib/profile";
import type { Profile } from "@/types/profile";

/** Phone layout column (native + narrow web). */
const PHONE_MAX_WIDTH = 720;

type SectionKey = "appearance" | "accessibility" | "notifications" | "support" | "account";
const SECTIONS: { key: SectionKey; icon: IconName }[] = [
  { key: "appearance", icon: "color-palette-outline" },
  { key: "accessibility", icon: "accessibility-outline" },
  { key: "notifications", icon: "notifications-outline" },
  { key: "support", icon: "help-buoy-outline" },
  { key: "account", icon: "person-circle-outline" },
];

/** Shortcut pill under the profile card that scrolls to a section. */
function JumpChip({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      style={(state) => [
        pressFade(state),
        {
          height: 38, paddingLeft: 12, paddingRight: 15, borderRadius: 19, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 7,
          borderColor: hover.hovered ? colors.accent : colors.border, backgroundColor: hover.hovered ? colors.accentTint : colors.card,
        },
        hoverTransition,
      ]}
    >
      <Ionicons name={icon} size={15} color={colors.accent} />
      <Text style={{ fontFamily: Fonts.body, fontSize: 13.5, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}

/**
 * Settings — one shared screen for phone and web. Phones (and narrow web) get a
 * single scrolling page: a burgundy profile card, shortcut chips, then Look
 * (theme + language, applied on tap), Accessibility, Notifications, Help and
 * Account, each explained in a line. Desktop web (≥1024) gets the page header
 * with the profile card and a labelled sidebar + panel layout (`SettingsWeb`).
 */
export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useAppTheme();
  const settings = useAppSettings();
  const { reduceMotion } = settings;
  const { favouriteIds } = useFavourites();
  const insets = useSafeAreaInsets();
  const desktop = useIsDesktopWeb();
  const scrollRef = useRef<ScrollView>(null);
  const columnY = useRef(0);
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({});
  const scrollY = useRef(0);
  const panelTop = useRef(0);
  const [panel, setPanel] = useState<PanelKey>("profile");
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

  const [pulseAnim] = useState(() => new Animated.Value(1));

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

  // Load the signed-in user and their profile once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const au = await getCurrentUser();

        if (au && active) {
          setAuthUser(au);
          const data = await ensureProfileRecord(au.id);

          if (data && active) {
            setUser(data);
            setEditedName(data.full_name || "");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        if (active) setInitialLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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

  // Opens the confirmation dialog (an in-app overlay: Alert.alert doesn't
  // render on react-native-web).
  const handleDeleteAccount = () => {
    setDeleteError("");
    setConfirmDeleteOpen(true);
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
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
  const go = (path: string) => router.push(path as any);

  // Desktop: switching section while scrolled past the panel's top brings its heading back into view.
  const selectPanel = (key: PanelKey) => {
    setPanel(key);
    const top = Math.max(0, panelTop.current - 24);
    if (scrollY.current > top) scrollRef.current?.scrollTo({ y: top, animated: !reduceMotion });
  };

  const profileCard = (
    <ProfileCard
      name={user?.full_name}
      email={authUser?.email}
      avatarUrl={user?.avatar_url}
      initials={initials}
      loadingAvatar={loadingAvatar}
      onPickAvatar={handlePickAvatar}
      pulse={pulseAnim}
      editing={isEditingName}
      editedName={editedName}
      onChangeName={setEditedName}
      savingName={loadingName}
      onStartEdit={() => setIsEditingName(true)}
      onSaveName={handleSaveName}
      onCancelEdit={handleCancelEdit}
      favouritesCount={favouriteIds.length}
      onEditProfile={() => (desktop ? selectPanel("profile") : go("/profile"))}
      onFavourites={() => router.navigate("/(tabs)/favourites" as any)}
      desktop={desktop}
    />
  );

  const dialog = confirmDeleteOpen ? (
    <DeleteAccountDialog deleting={deleting} error={deleteError} onCancel={() => setConfirmDeleteOpen(false)} onConfirm={performDeleteAccount} />
  ) : null;

  const pageTitle = (big: boolean) => (
    <View>
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: big ? 12 : 11, letterSpacing: 1.9, textTransform: "uppercase", color: colors.accent }}>
        {t("settings.kicker")}
      </Text>
      <Text
        accessibilityRole="header"
        style={{
          marginTop: big ? 18 : 12, fontFamily: Fonts.display, fontSize: big ? 84 : 46,
          lineHeight: big ? 84 : 48, letterSpacing: big ? -1.2 : -0.4, color: colors.text,
        }}
      >
        {t("settings.title")}
      </Text>
      <Text style={{ marginTop: big ? 18 : 10, maxWidth: 520, fontFamily: Fonts.body, fontSize: big ? 18 : 15, lineHeight: big ? 29 : 23, color: colors.textSecondary }}>
        {t("settings.subtitle")}
      </Text>
    </View>
  );

  if (desktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={64}
          onScroll={(e) => (scrollY.current = e.nativeEvent.contentOffset.y)}
        >
          <View style={{ width: "100%", maxWidth: WEB_PAGE_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_PAGE_GUTTER, paddingTop: 64, paddingBottom: 96 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 56 }}>
              <View style={{ flex: 1, minWidth: 0 }}>{pageTitle(true)}</View>
              <View style={{ width: 480 }}>{profileCard}</View>
            </View>
            <View style={{ height: 1, backgroundColor: colors.divider, marginTop: 48, marginBottom: 44 }} />
            <View onLayout={(e) => (panelTop.current = e.nativeEvent.layout.y)}>
              <SettingsWeb selected={panel} onSelect={selectPanel} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} deleting={deleting} />
            </View>
          </View>
          <SiteFooter onHome={() => router.push("/" as any)} />
        </ScrollView>
        {dialog}
      </View>
    );
  }

  const jumpTo = (key: SectionKey) => {
    const y = sectionY.current[key];
    if (y == null) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, columnY.current + y - 16), animated: !reduceMotion });
  };

  const section = (key: SectionKey, children: ReactNode, hint?: string) => (
    <View key={key} onLayout={(e) => (sectionY.current[key] = e.nativeEvent.layout.y)}>
      <SectionHeading
        icon={SECTIONS.find((s) => s.key === key)?.icon}
        kicker={t(`settings.groups.${key}.kicker`)}
        title={t(`settings.groups.${key}.title`)}
        hint={hint}
      />
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <ContentWrap maxWidth={PHONE_MAX_WIDTH}>
          <View style={{ paddingHorizontal: 20, paddingTop: (isWeb ? 20 : insets.top) + 22 }}>
            {pageTitle(false)}
            <View style={{ marginTop: 22 }}>{profileCard}</View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 16, marginHorizontal: -20 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              {SECTIONS.map((s) => (
                <JumpChip key={s.key} icon={s.icon} label={t(`settings.groups.${s.key}.kicker`)} onPress={() => jumpTo(s.key)} />
              ))}
            </ScrollView>

            <View onLayout={(e) => (columnY.current = e.nativeEvent.layout.y)} style={{ marginTop: 38, gap: 42 }}>
              {section(
                "appearance",
                <SettingsCard padded>
                  <FieldLabel label={t("settings.theme")} />
                  <ThemePicker />
                  <View style={{ height: 1, backgroundColor: colors.softBorder, marginVertical: 18 }} />
                  <FieldLabel label={t("settings.language")} />
                  <LanguagePicker />
                </SettingsCard>,
                t("settings.groups.appearance.hint"),
              )}

              {section(
                "accessibility",
                <SettingsCard>
                  <ToggleRow
                    icon="pulse-outline"
                    title={t("accessibility.reduceMotion")}
                    hint={t("accessibility.reduceMotionHint")}
                    value={settings.reduceMotion}
                    onValueChange={settings.setReduceMotion}
                  />
                  <RowDivider />
                  <ToggleRow
                    icon="text-outline"
                    title={t("accessibility.largeText")}
                    hint={t("accessibility.largeTextHint")}
                    value={settings.largeText}
                    onValueChange={settings.setLargeText}
                  />
                </SettingsCard>,
                t("accessibility.intro"),
              )}

              {section(
                "notifications",
                <>
                  <SettingsCard>
                    <ToggleRow
                      icon="megaphone-outline"
                      title={t("emailNotifications.marketing")}
                      hint={t("emailNotifications.marketingHint")}
                      value={settings.emailMarketing}
                      onValueChange={settings.setEmailMarketing}
                    />
                    <RowDivider />
                    <ToggleRow
                      icon="sparkles-outline"
                      title={t("emailNotifications.productUpdates")}
                      hint={t("emailNotifications.productUpdatesHint")}
                      value={settings.emailUpdates}
                      onValueChange={settings.setEmailUpdates}
                    />
                  </SettingsCard>
                  <NotificationsFootnote />
                </>,
                t("emailNotifications.intro"),
              )}

              {section(
                "support",
                <SettingsCard>
                  <NavRow icon="help-buoy-outline" title={t("settings.items.helpCenter")} hint={t("settings.hints.help")} onPress={() => go("/help-center")} />
                  <RowDivider />
                  <NavRow icon="information-circle-outline" title={t("about.title", { app: "U&I" })} hint={t("settings.hints.about")} onPress={() => go("/about")} />
                  <RowDivider />
                  <NavRow icon="document-text-outline" title={t("settings.items.termsOfService")} hint={t("settings.hints.terms")} onPress={() => go("/terms")} />
                  <RowDivider />
                  <NavRow icon="shield-checkmark-outline" title={t("settings.items.privacyPolicy")} hint={t("settings.hints.privacy")} onPress={() => go("/privacy")} />
                  <RowDivider />
                  <NavRow icon="images-outline" title={t("photoCredits.title")} hint={t("settings.hints.photoCredits")} onPress={() => go("/photo-credits")} />
                </SettingsCard>,
              )}

              {section(
                "account",
                <View style={{ gap: 14 }}>
                  <SettingsCard>
                    <NavRow icon="person-outline" title={t("settings.items.profileSecurity")} hint={t("settings.hints.profile")} onPress={() => go("/profile")} />
                  </SettingsCard>
                  <OutlineButton label={t("settings.logout")} icon="log-out-outline" onPress={handleLogout} />
                  <DangerZone onDelete={handleDeleteAccount} deleting={deleting} />
                </View>,
              )}
            </View>

            <View style={{ alignItems: "center", marginTop: 48, gap: 6 }}>
              <Wordmark size={30} />
              <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, color: colors.textMuted }}>{t("settings.appVersion", { version })}</Text>
            </View>
          </View>
        </ContentWrap>
      </ScrollView>
      {dialog}
    </View>
  );
}
