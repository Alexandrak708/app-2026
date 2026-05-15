import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeContext } from '@/components/theme-provider';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

export default function AppearanceScreen() {
  const router = useRouter();
  const ctx = useContext(ThemeContext)!;
  const { t } = useTranslation();

  const set = (t: 'light' | 'dark' | 'system') => {
    ctx.setTheme(t);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="subtitle">{t('appearance.title')}</ThemedText>

        <TouchableOpacity style={styles.row} onPress={() => set('light')}>
          <ThemedText type="defaultSemiBold">{t('appearance.light')}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => set('dark')}>
          <ThemedText type="defaultSemiBold">{t('appearance.dark')}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => set('system')}>
          <ThemedText type="defaultSemiBold">{t('appearance.system')}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.close} onPress={() => router.back()}>
          <ThemedText type="link">{t('appearance.done')}</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  card: { gap: 18, marginTop: 18 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e9ee',
  },
  close: { marginTop: 28 },
});
