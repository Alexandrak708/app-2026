import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [authUser, setAuthUser] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user: au },
        } = await supabase.auth.getUser();
        setAuthUser(au);
        if (au) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', au.id)
            .single();
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
    if (!editedName.trim()) return Alert.alert(t('profile.errorTitle'), t('profile.nameRequired'));
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editedName.trim() })
        .eq('id', authUser.id);
      if (error) throw error;
      setUser((p: any) => ({ ...p, full_name: editedName.trim() }));
      Alert.alert(t('profile.savedTitle'));
    } catch (err: any) {
      console.error(err);
      Alert.alert(t('profile.errorTitle'), err.message || t('profile.failedToSave'));
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
