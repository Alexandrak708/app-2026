import { ActivityIndicator, Animated, Image, Text, TextInput, View } from "react-native";
import { Pressable } from "@/components/pressable";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { isWeb } from "@/components/responsive";
import { hoverTransition, useHover } from "@/components/program-ui";
import { pressFade, useDanger, type IconName } from "@/components/settings-ui";

/**
 * Pieces of the Settings tab that need its account state (profile card, delete
 * account) — shared by the phone page and the desktop web layout.
 */

function InkButton({
  icon, label, onPress, primary, compactLabel,
}: {
  icon: IconName; label: string; onPress: () => void; primary?: boolean;
  /** Shorter text shown instead of `label` (which stays the accessibility label). */
  compactLabel?: string;
}) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(state) => [
        pressFade(state),
        {
          ...(compactLabel ? { flexShrink: 0 } : { flex: 1, minWidth: 0 }),
          height: 44, paddingHorizontal: compactLabel ? 16 : 12, borderRadius: 22, borderWidth: 1,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
          backgroundColor: primary ? (hover.hovered ? colors.onInk : colors.beige) : hover.hovered ? "rgba(246,239,233,0.14)" : "transparent",
          borderColor: primary ? "transparent" : "rgba(246,239,233,0.3)",
        },
        hoverTransition,
      ]}
    >
      <Ionicons name={icon} size={16} color={primary ? colors.accentInk : colors.onInk} />
      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: Fonts.bodyMedium, fontSize: 13.5, color: primary ? colors.accentInk : colors.onInk }}>
        {compactLabel ?? label}
      </Text>
    </Pressable>
  );
}

/**
 * Deep burgundy "who's signed in" card: tap the photo to change it, tap the
 * name to rename, plus shortcuts to the full profile and to Favourites.
 */
export function ProfileCard({
  name, email, avatarUrl, initials, loadingAvatar, onPickAvatar, pulse,
  editing, editedName, onChangeName, savingName, onStartEdit, onSaveName, onCancelEdit,
  favouritesCount, onEditProfile, onFavourites, desktop,
}: {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  initials: string;
  loadingAvatar: boolean;
  onPickAvatar: () => void;
  pulse: Animated.Value;
  editing: boolean;
  editedName: string;
  onChangeName: (value: string) => void;
  savingName: boolean;
  onStartEdit: () => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  favouritesCount: number;
  onEditProfile: () => void;
  onFavourites: () => void;
  desktop?: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const avatar = desktop ? 76 : 68;

  return (
    <View
      style={{
        borderRadius: desktop ? 26 : 24, padding: desktop ? 24 : 20, overflow: "hidden", backgroundColor: colors.inkSurface,
        shadowColor: "#21030d", shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 6,
      }}
    >
      <View pointerEvents="none" style={{ position: "absolute", right: -4, bottom: desktop ? -50 : -44 }}>
        <Text style={{ fontFamily: Fonts.heading, fontSize: desktop ? 170 : 150, color: colors.beige, opacity: 0.08 }}>U&I</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Pressable
          onPress={onPickAvatar}
          disabled={loadingAvatar}
          accessibilityRole="button"
          accessibilityLabel={t("settings.changePhoto")}
          style={pressFade}
        >
          <Animated.View
            style={{
              width: avatar, height: avatar, borderRadius: avatar / 2, borderWidth: 2, borderColor: colors.beige, overflow: "hidden",
              alignItems: "center", justifyContent: "center", backgroundColor: "rgba(246,239,233,0.08)",
              transform: [{ scale: pulse }],
            }}
          >
            {loadingAvatar ? (
              <ActivityIndicator color={colors.beige} size="small" />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: avatar, height: avatar }} />
            ) : (
              <Text style={{ fontFamily: Fonts.heading, fontSize: avatar * 0.38, color: colors.beige }}>{initials}</Text>
            )}
          </Animated.View>
          <View
            style={{
              position: "absolute", right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center",
              backgroundColor: colors.beige, borderWidth: 2, borderColor: colors.inkSurface,
            }}
          >
            <Ionicons name="camera" size={12} color={colors.accentInk} />
          </View>
        </Pressable>

        <View style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <TextInput
              value={editedName}
              onChangeText={onChangeName}
              placeholder={t("settings.yourNamePlaceholder")}
              placeholderTextColor="rgba(246,239,233,0.45)"
              editable={!savingName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSaveName}
              accessibilityLabel={t("settings.yourNamePlaceholder")}
              style={[
                {
                  fontFamily: Fonts.heading, fontSize: 22, color: colors.onInk, paddingVertical: 4,
                  borderBottomWidth: 1.5, borderBottomColor: colors.beige,
                },
                isWeb ? ({ outlineStyle: "none" } as any) : null,
              ]}
            />
          ) : (
            <Pressable
              onPress={onStartEdit}
              accessibilityRole="button"
              accessibilityLabel={t("settings.editName")}
              style={(state) => [pressFade(state), { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", maxWidth: "100%" }]}
            >
              <Text numberOfLines={2} style={{ flexShrink: 1, fontFamily: Fonts.heading, fontSize: desktop ? 27 : 24, lineHeight: desktop ? 31 : 28, color: colors.onInk }}>
                {name || t("settings.addYourName")}
              </Text>
              <Ionicons name="pencil" size={14} color={colors.onInkMuted} />
            </Pressable>
          )}
          {email ? (
            <Text numberOfLines={1} style={{ marginTop: 4, fontFamily: Fonts.body, fontSize: 13, color: colors.onInkMuted }}>{email}</Text>
          ) : null}
        </View>
      </View>

      {editing ? (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <Pressable
            onPress={onSaveName}
            disabled={savingName}
            accessibilityRole="button"
            style={(state) => [pressFade(state), { height: 40, paddingHorizontal: 18, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.beige }]}
          >
            {savingName ? (
              <ActivityIndicator color={colors.accentInk} size="small" />
            ) : (
              <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13.5, color: colors.accentInk }}>{t("settings.save")}</Text>
            )}
          </Pressable>
          <Pressable
            onPress={onCancelEdit}
            accessibilityRole="button"
            style={(state) => [
              pressFade(state),
              { height: 40, paddingHorizontal: 18, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(246,239,233,0.3)" },
            ]}
          >
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13.5, color: colors.onInk }}>{t("settings.cancel")}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={{ height: 1, backgroundColor: "rgba(246,239,233,0.14)", marginVertical: 18 }} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <InkButton icon="create-outline" label={t("settings.editProfile")} onPress={onEditProfile} primary />
        {/* Phones show just ♥ + count so "Edit profile" keeps its full label. */}
        <InkButton
          icon="heart-outline"
          label={t("settings.favouritesCount", { count: favouritesCount })}
          compactLabel={desktop ? undefined : String(favouritesCount)}
          onPress={onFavourites}
        />
      </View>
    </View>
  );
}

/** "Delete account" explained in plain words, kept apart from everything else. */
export function DangerZone({ onDelete, deleting }: { onDelete: () => void; deleting: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const danger = useDanger();
  const hover = useHover();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, backgroundColor: danger.tint }}>
      <View style={{ width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.card }}>
        <Ionicons name="trash-outline" size={19} color={danger.color} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: danger.color }}>{t("settings.deleteAccount")}</Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textSecondary }}>{t("settings.dangerHint")}</Text>
      </View>
      <Pressable
        onPress={onDelete}
        disabled={deleting}
        {...hover}
        accessibilityRole="button"
        accessibilityLabel={t("settings.deleteAccount")}
        style={(state) => [
          pressFade(state),
          {
            height: 38, minWidth: 38, paddingHorizontal: 14, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1,
            borderColor: danger.color, backgroundColor: hover.hovered ? danger.solid : "transparent",
          },
          hoverTransition,
        ]}
      >
        {deleting ? (
          <ActivityIndicator color={danger.color} size="small" />
        ) : (
          <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, color: hover.hovered ? "#ffffff" : danger.color }}>{t("settings.deleteAccountConfirm")}</Text>
        )}
      </Pressable>
    </View>
  );
}

export function NotificationsFootnote() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 12, paddingHorizontal: 6 }}>
      <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
      <Text style={{ flex: 1, fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 19, color: colors.textMuted }}>{t("emailNotifications.footnote")}</Text>
    </View>
  );
}

/**
 * Confirmation before deleting the account. An absolute overlay rather than RN
 * `<Modal>`, which doesn't stack above the app on react-native-web.
 */
export function DeleteAccountDialog({
  deleting, error, onCancel, onConfirm,
}: {
  deleting: boolean; error: string; onCancel: () => void; onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const danger = useDanger();
  return (
    <View
      style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, elevation: 1000,
        backgroundColor: "rgba(18,6,10,0.55)", justifyContent: "center", alignItems: "center", padding: 24,
        ...(isWeb ? ({ animationKeyframes: { from: { opacity: 0 }, to: { opacity: 1 } }, animationDuration: "160ms" } as any) : null),
      }}
    >
      <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={deleting ? undefined : onCancel} accessibilityLabel={t("settings.cancel")} />
      <View style={{ width: "100%", maxWidth: 420, borderRadius: 26, padding: 24, backgroundColor: colors.card }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: danger.tint }}>
          <Ionicons name="warning-outline" size={26} color={danger.color} />
        </View>
        <Text accessibilityRole="header" style={{ marginTop: 16, fontFamily: Fonts.heading, fontSize: 26, lineHeight: 30, color: colors.text }}>
          {t("settings.deleteAccountConfirmTitle")}
        </Text>
        <Text style={{ marginTop: 8, fontFamily: Fonts.body, fontSize: 14.5, lineHeight: 22, color: colors.textSecondary }}>
          {t("settings.deleteAccountConfirmMessage")}
        </Text>
        {error ? <Text style={{ marginTop: 10, fontFamily: Fonts.bodyMedium, fontSize: 13, lineHeight: 19, color: danger.color }}>{error}</Text> : null}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
          <Pressable
            onPress={onCancel}
            disabled={deleting}
            accessibilityRole="button"
            style={(state) => [
              pressFade(state),
              { flex: 1, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: colors.text }}>{t("settings.cancel")}</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            disabled={deleting}
            accessibilityRole="button"
            style={(state) => [
              pressFade(state),
              { flex: 1, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: danger.solid },
            ]}
          >
            {deleting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: "#ffffff" }}>{t("settings.deleteAccountConfirm")}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
