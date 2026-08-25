import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  type KeyboardTypeOptions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { Brand, getAppPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  ensureProfileRecord,
  getAuthErrorMessage,
  getCurrentUser,
  requestPasswordReset,
  updateEmail,
  updatePassword,
  validatePassword,
  verifyPassword,
} from '@/lib/auth';
import { updateProfileAvatarUrl, updateProfileDetails, uploadAvatar } from '@/lib/profile';
import { REGION_OPTIONS, isRegionKey, type RegionKey } from '@/constants/regions';
import type { Profile } from '@/types/profile';

type Palette = ReturnType<typeof getAppPalette>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The editable profile: personal-info + security cards, with debounced
 * auto-save, email change, and password change. Extracted from the /profile
 * route so the web Settings master-detail can render the very same working
 * editor in its Profile panel. Self-contained (owns its state + palette); render
 * it inside any scroll container.
 */
export default function ProfileForm() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const palette = getAppPalette(isDark);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [emailNotice, setEmailNotice] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutoSave = useRef(true);
  const lastAttemptedEmail = useRef('');

  // ── Personal info fields ──
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState<RegionKey | null>(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);

  // ── Password change ──
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Forgot-password: emails the signed-in user a reset link (the same flow the
  // login screen uses), so they can change the password without knowing the
  // current one.
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotNotice, setForgotNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const au = await getCurrentUser();
        setAuthUser(au);
        if (au) {
          const p = (await ensureProfileRecord(au.id)) as Profile;

          let fn = p.first_name ?? '';
          let ln = p.last_name ?? '';
          if (!fn && !ln && p.full_name) {
            const parts = p.full_name.trim().split(/\s+/);
            fn = parts[0] ?? '';
            ln = parts.slice(1).join(' ');
          }

          setFirstName(fn);
          setLastName(ln);
          setPhone(p.phone ?? '');
          setAddress(p.address ?? '');
          setRegion(isRegionKey(p.region) ? p.region : null);
          setAvatarUrl(p.avatar_url ?? null);
          setEmail(au.email ?? '');
          setOriginalEmail(au.email ?? '');
        }
      } catch (err) {
        if (__DEV__) console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Read a picked image into raw bytes — web hands back a File/blob, native a
  // base64 string. (Same conversion the settings header uses.)
  const assetToBytes = async (asset: ImagePicker.ImagePickerAsset) => {
    if (Platform.OS === 'web') {
      const webFile = (asset as ImagePicker.ImagePickerAsset & { file?: File }).file;
      if (webFile) {
        const buffer = await webFile.arrayBuffer();
        return new Uint8Array(buffer);
      }
      const response = await fetch(asset.uri);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    }
    const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    return new Uint8Array(byteNumbers);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return; // no library access — nothing to do

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (result.canceled || !result.assets?.[0] || !authUser) return;

    const asset = result.assets[0];
    setLoadingAvatar(true);
    try {
      const fileExt =
        asset.mimeType?.split('/').pop()?.toLowerCase() ??
        asset.uri.split('.').pop()?.toLowerCase() ??
        'jpeg';
      const contentType = asset.mimeType ?? `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const bytes = await assetToBytes(asset);
      const publicUrl = await uploadAvatar(authUser.id, bytes, contentType, fileExt);
      await updateProfileAvatarUrl(authUser.id, publicUrl);
      setAvatarUrl(publicUrl);
    } catch (err) {
      if (__DEV__) console.error('Avatar upload error:', err);
    } finally {
      setLoadingAvatar(false);
    }
  };

  const persistDetails = useCallback(async () => {
    if (!authUser?.id) return;

    const first = firstName.trim();
    const last = lastName.trim();
    const fullName = [first, last].filter(Boolean).join(' ');

    setSaveStatus('saving');
    try {
      await updateProfileDetails(authUser.id, {
        first_name: first || null,
        last_name: last || null,
        full_name: fullName || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        region,
      });
      setLastSavedAt(Date.now());
      setNowTick(Date.now());
      setSaveStatus('saved');
    } catch (err) {
      if (__DEV__) console.error('Profile auto-save error:', err);
      setSaveStatus('error');
    }
  }, [authUser?.id, firstName, lastName, phone, address, region]);

  useEffect(() => {
    if (loading || !authUser?.id) return;
    if (skipNextAutoSave.current) {
      skipNextAutoSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(persistDetails, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [firstName, lastName, phone, address, region, loading, authUser?.id, persistDetails]);

  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, [saveStatus]);

  const flushDetails = () => {
    if (loading || !authUser?.id || skipNextAutoSave.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    persistDetails();
  };

  const handleEmailBlur = async () => {
    const newEmail = email.trim();
    if (!newEmail || newEmail.toLowerCase() === originalEmail.trim().toLowerCase()) {
      setEmailNotice('');
      return;
    }
    if (newEmail.toLowerCase() === lastAttemptedEmail.current.toLowerCase()) return;
    if (!EMAIL_RE.test(newEmail)) {
      setEmailNotice(t('auth.invalidEmail'));
      return;
    }
    if (!authUser) {
      setEmailNotice(t('auth.errorAuthUnavailable'));
      return;
    }
    lastAttemptedEmail.current = newEmail;
    try {
      const { error } = await updateEmail(newEmail);
      if (error) throw error;
      setEmailNotice(t('profile.emailConfirmSent'));
    } catch (err) {
      if (__DEV__) console.error('Email update error:', err);
      setEmailNotice(err instanceof Error ? err.message : t('profile.failedToSave'));
    }
  };

  const handleForgotPassword = async () => {
    setForgotNotice(null);
    const targetEmail = (authUser?.email ?? originalEmail).trim();
    if (!targetEmail) {
      setForgotNotice({ type: 'err', text: t('auth.errorAuthUnavailable') });
      return;
    }
    setForgotSending(true);
    try {
      const { error } = await requestPasswordReset(targetEmail);
      if (error) {
        setForgotNotice({
          type: 'err',
          text: getAuthErrorMessage(error, {
            authUnavailable: t('auth.errorAuthUnavailable'),
            fallback: t('auth.errorUnexpected'),
          }),
        });
        return;
      }
      setForgotNotice({ type: 'ok', text: t('auth.resetEmailSent', { email: targetEmail }) });
    } catch (err) {
      if (__DEV__) console.error('Forgot password error:', err);
      setForgotNotice({ type: 'err', text: t('auth.errorUnexpected') });
    } finally {
      setForgotSending(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setPwError('');
  };

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');

    if (!authUser?.email) {
      setPwError(t('auth.errorAuthUnavailable'));
      return;
    }
    if (!currentPw) {
      setPwError(t('profile.currentPasswordRequired'));
      return;
    }

    const validation = validatePassword(newPw, confirmPw);
    if (!validation.valid && validation.warningKey) {
      setPwError(t(`auth.${validation.warningKey}`));
      return;
    }
    if (currentPw === newPw) {
      setPwError(t('profile.samePassword'));
      return;
    }

    setPwSaving(true);
    try {
      const { error: verifyError } = await verifyPassword(authUser.email, currentPw);
      if (verifyError) {
        setPwError(t('profile.currentPasswordIncorrect'));
        return;
      }

      const { error: updateError } = await updatePassword(newPw);
      if (updateError) {
        setPwError(
          getAuthErrorMessage(updateError, {
            authUnavailable: t('auth.errorAuthUnavailable'),
            fallback: t('auth.errorUnexpected'),
          })
        );
        return;
      }

      resetPasswordForm();
      setPwSuccess(t('profile.passwordChanged'));
    } catch (err) {
      if (__DEV__) console.error('Change password error:', err);
      setPwError(t('auth.errorUnexpected'));
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ paddingVertical: 48, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={palette.text} />
      </View>
    );
  }

  const regionLabel = region ? t(`profile.regions.${region}`) : t('profile.regionPlaceholder');

  const initials =
    ([firstName, lastName]
      .filter(Boolean)
      .map((s) => s.trim()[0])
      .join('') ||
      (email || 'U').trim()[0] ||
      'U')
      .toUpperCase()
      .slice(0, 2);

  const savedLabel = (() => {
    if (!lastSavedAt) return t('profile.allChangesSaved');
    const mins = Math.floor(Math.max(0, nowTick - lastSavedAt) / 60000);
    if (mins < 1) return t('profile.savedJustNow');
    if (mins < 60) return t('profile.savedMinutesAgo', { mins });
    return t('profile.savedHoursAgo', { hrs: Math.floor(mins / 60) });
  })();

  return (
    <View>
      {/* ── Profile photo ── */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity onPress={handlePickAvatar} disabled={loadingAvatar} activeOpacity={0.85} style={{ position: 'relative' }}>
          <View
            style={{
              width: 104,
              height: 104,
              borderRadius: 52,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.mutedSurface,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {loadingAvatar ? (
              <ActivityIndicator color={Brand.primary} />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 104, height: 104 }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 34, fontWeight: '700', color: palette.textSecondary }}>{initials}</Text>
            )}
          </View>
          {/* Camera badge */}
          <View
            style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: Brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: palette.background,
            }}
          >
            <Ionicons name="camera" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePickAvatar} disabled={loadingAvatar} activeOpacity={0.7}>
          <Text style={{ marginTop: 10, fontSize: 13, fontWeight: '600', color: Brand.primary }}>
            {t('profile.changePhoto', { defaultValue: 'Change photo' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Personal information ── */}
      <Card title={t('profile.personalInfo')} palette={palette}>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field
              label={t('profile.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              onBlur={flushDetails}
              placeholder={t('profile.firstNamePlaceholder')}
              palette={palette}
              autoCapitalize="words"
              textContentType="givenName"
            />
          </View>
          <View style={styles.rowItem}>
            <Field
              label={t('profile.lastName')}
              value={lastName}
              onChangeText={setLastName}
              onBlur={flushDetails}
              placeholder={t('profile.lastNamePlaceholder')}
              palette={palette}
              autoCapitalize="words"
              textContentType="familyName"
            />
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Field
            label={t('profile.email')}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setEmailNotice('');
            }}
            onBlur={handleEmailBlur}
            placeholder={t('profile.emailPlaceholder')}
            palette={palette}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          {emailNotice ? (
            <Text style={[styles.emailNotice, { color: palette.textSecondary }]}>{emailNotice}</Text>
          ) : null}
        </View>

        <Field
          label={t('profile.phone')}
          value={phone}
          onChangeText={setPhone}
          onBlur={flushDetails}
          placeholder={t('profile.phonePlaceholder')}
          palette={palette}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />

        <Field
          label={t('profile.address')}
          value={address}
          onChangeText={setAddress}
          onBlur={flushDetails}
          placeholder={t('profile.addressPlaceholder')}
          palette={palette}
          multiline
          autoCapitalize="sentences"
          textContentType="fullStreetAddress"
        />

        {/* Region selector */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>{t('profile.region')}</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput, { borderColor: palette.border, backgroundColor: palette.mutedSurface }]}
            onPress={() => setRegionModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: region ? palette.text : palette.textMuted, fontSize: 16 }}>{regionLabel}</Text>
            <Ionicons name="chevron-down" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        </View>

        {saveStatus !== 'idle' ? (
          <View style={styles.statusRow}>
            {saveStatus === 'saving' ? (
              <>
                <ActivityIndicator size="small" color={palette.textMuted} />
                <Text style={[styles.statusText, { color: palette.textMuted }]}>{t('profile.saving')}</Text>
              </>
            ) : null}
            {saveStatus === 'saved' ? (
              <>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={[styles.statusText, { color: palette.textSecondary }]}>{savedLabel}</Text>
              </>
            ) : null}
            {saveStatus === 'error' ? (
              <>
                <Ionicons name="alert-circle" size={16} color="#dc2626" />
                <Text style={[styles.statusText, { color: '#dc2626' }]}>{t('profile.saveError')}</Text>
              </>
            ) : null}
          </View>
        ) : null}
      </Card>

      {/* ── Security / password ── */}
      <Card title={t('profile.security')} palette={palette}>
        {!pwOpen ? (
          <TouchableOpacity
            style={styles.changePwRow}
            onPress={() => {
              setPwSuccess('');
              setPwOpen(true);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="lock-outline" size={20} color={palette.text} />
            <Text style={[styles.changePwLabel, { color: palette.text }]}>{t('profile.changePassword')}</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 14 }}>
            <Text style={[styles.helperText, { color: palette.textSecondary }]}>{t('profile.changePasswordHint')}</Text>

            <PasswordInput
              label={t('profile.currentPassword')}
              value={currentPw}
              onChangeText={(v) => {
                setCurrentPw(v);
                setPwError('');
              }}
              placeholder={t('profile.currentPasswordPlaceholder')}
              show={showCurrent}
              onToggle={() => setShowCurrent((s) => !s)}
              palette={palette}
              textContentType="password"
              autoComplete="current-password"
            />
            <PasswordInput
              label={t('profile.newPassword')}
              value={newPw}
              onChangeText={(v) => {
                setNewPw(v);
                setPwError('');
              }}
              placeholder={t('profile.newPasswordPlaceholder')}
              show={showNew}
              onToggle={() => setShowNew((s) => !s)}
              palette={palette}
              textContentType="newPassword"
              autoComplete="password-new"
            />
            <PasswordInput
              label={t('profile.confirmNewPassword')}
              value={confirmPw}
              onChangeText={(v) => {
                setConfirmPw(v);
                setPwError('');
              }}
              placeholder={t('profile.confirmNewPasswordPlaceholder')}
              show={showConfirm}
              onToggle={() => setShowConfirm((s) => !s)}
              palette={palette}
              textContentType="newPassword"
              autoComplete="password-new"
            />

            {pwError ? <Text style={styles.errorText}>{pwError}</Text> : null}

            <View style={styles.pwActions}>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.flex1, { backgroundColor: Brand.primary }, pwSaving && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={pwSaving}
                activeOpacity={0.85}
              >
                {pwSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{t('profile.updatePassword')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, { backgroundColor: palette.mutedSurface }]}
                onPress={() => {
                  resetPasswordForm();
                  setPwOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryBtnText, { color: palette.text }]}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {pwSuccess ? (
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
            <Text style={styles.successText}>{pwSuccess}</Text>
          </View>
        ) : null}

        {/* Forgot password — emails a reset link to the signed-in address. */}
        <View style={{ marginTop: 4, gap: 6 }}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={forgotSending}
            activeOpacity={0.7}
            style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
          >
            {forgotSending ? (
              <ActivityIndicator size="small" color={Brand.primary} />
            ) : (
              <MaterialCommunityIcons name="lock-reset" size={19} color={Brand.primary} />
            )}
            <Text style={{ color: Brand.primary, fontSize: 14, fontWeight: '600' }}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>
          {forgotNotice ? (
            <Text style={{ fontSize: 13, lineHeight: 18, color: forgotNotice.type === 'ok' ? '#16a34a' : '#dc2626' }}>
              {forgotNotice.text}
            </Text>
          ) : null}
        </View>
      </Card>

      {/* Region picker modal */}
      <Modal
        visible={regionModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRegionModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setRegionModalOpen(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: palette.surface }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>{t('profile.region')}</Text>
            {REGION_OPTIONS.map((key) => {
              const selected = region === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.regionOption}
                  onPress={() => {
                    setRegion(key);
                    setRegionModalOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.regionOptionText, { color: palette.text, fontWeight: selected ? '700' : '500' }]}>
                    {t(`profile.regions.${key}`)}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={20} color={Brand.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Reusable pieces ─────────────────────────────────────────────────────────

function Card({ title, palette, children }: { title: string; palette: Palette; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: Brand.primary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: palette.surface, shadowColor: palette.cardShadow }]}>{children}</View>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  palette: Palette;
  onBlur?: () => void;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  textContentType?: React.ComponentProps<typeof TextInput>['textContentType'];
};

function Field({ label, value, onChangeText, placeholder, palette, multiline, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          { color: palette.text, borderColor: palette.border, backgroundColor: palette.mutedSurface },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        multiline={multiline}
        {...inputProps}
      />
    </View>
  );
}

type PasswordInputProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  palette: Palette;
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  textContentType?: React.ComponentProps<typeof TextInput>['textContentType'];
};

function PasswordInput({ label, value, onChangeText, placeholder, show, onToggle, palette, ...inputProps }: PasswordInputProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>{label}</Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          style={[
            styles.input,
            { color: palette.text, borderColor: palette.border, backgroundColor: palette.mutedSurface, paddingRight: 46 },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
          {...inputProps}
        />
        <TouchableOpacity
          onPress={onToggle}
          activeOpacity={0.7}
          style={styles.eyeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={palette.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sections / cards
  section: { marginBottom: 22 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  // Fields
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 16,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top', paddingTop: 12 },
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyeBtn: { position: 'absolute', right: 12, height: '100%', justifyContent: 'center' },
  emailNotice: { fontSize: 12, lineHeight: 16, marginLeft: 2 },

  // Auto-save status
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 20, marginTop: 2 },
  statusText: { fontSize: 13, fontWeight: '600' },

  // Buttons
  primaryBtn: { marginTop: 4, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  secondaryBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
  flex1: { flex: 1 },

  // Password area
  changePwRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  changePwLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  helperText: { fontSize: 13, lineHeight: 18 },
  pwActions: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  successText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },

  // Region modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
    opacity: 0.6,
  },
  regionOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 6 },
  regionOptionText: { fontSize: 16 },
});
