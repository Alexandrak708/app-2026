import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { User } from '@supabase/supabase-js';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';
import { ensureProfileRecord, getCurrentUser } from '@/lib/auth';
import { updateProfileFullName } from '@/lib/profile';
import type { Profile } from '@/types/profile';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [, setUser] = useState<Profile | null>(null);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const au = await getCurrentUser();
        setAuthUser(au);
        if (au) {
          const data = await ensureProfileRecord(au.id);
          setUser(data);
          setEditedName(data?.full_name || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!authUser?.id) {
      Alert.alert(t('profile.errorTitle'), t('auth.errorAuthUnavailable'));
      return;
    }
    if (!editedName.trim()) return Alert.alert(t('profile.errorTitle'), t('profile.nameRequired'));
    setSaving(true);
    try {
      await updateProfileFullName(authUser.id, editedName.trim());
      setUser((p) => (p ? { ...p, full_name: editedName.trim() } : p));
      Alert.alert(t('profile.savedTitle'));
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : t('profile.failedToSave');
      Alert.alert(t('profile.errorTitle'), message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <View style={styles.card}>
        <ThemedText type="title">{t('profile.title')}</ThemedText>

        <ThemedText type="subtitle">{t('profile.name')}</ThemedText>
        <TextInput
          value={editedName}
          onChangeText={setEditedName}
          style={styles.input}
          placeholder={t('profile.namePlaceholder')}
        />

        <ThemedText type="subtitle">{t('profile.email')}</ThemedText>
        <ThemedText>{authUser?.email || ''}</ThemedText>

        <TouchableOpacity style={styles.save} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator /> : <ThemedText type="defaultSemiBold">{t('profile.save')}</ThemedText>}
        </TouchableOpacity>

      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 76 },
  card: { gap: 12 },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    borderColor: '#e6e9ee',
  },
  save: { marginTop: 18 },
});
