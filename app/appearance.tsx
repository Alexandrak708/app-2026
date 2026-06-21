import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeContext } from '@/components/theme-provider';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';

type ThemeChoice = 'light' | 'dark' | 'system';

export default function AppearanceScreen() {
  const router = useRouter();
  const ctx = useContext(ThemeContext)!;
  const { t } = useTranslation();

  const [draftTheme, setDraftTheme] = useState<ThemeChoice>(ctx.theme);
  const previewResolvedScheme =
    draftTheme === 'system' ? ctx.resolvedScheme : draftTheme;
  const isDark = (previewResolvedScheme ?? 'light') === 'dark';

  useEffect(() => {
    setDraftTheme(ctx.theme);
  }, [ctx.theme]);

  const handleDone = () => {
    if (draftTheme !== ctx.theme) {
      ctx.setTheme(draftTheme);
    }

    router.back();
  };

  const rowStyle = (choice: ThemeChoice) => [styles.row, draftTheme === choice && styles.rowSelected];

  return (
    <ThemeContext.Provider
      value={{
        theme: draftTheme,
        setTheme: setDraftTheme,
        resolvedScheme: previewResolvedScheme,
      }}
    >
      <ThemedView style={styles.container}>
        <BackToSettingsButton />
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#171a21' : '#ffffff',
              borderColor: isDark ? '#2a303c' : '#e6e9ee',
            },
          ]}
        >
          <ThemedText type="subtitle">{t('appearance.title')}</ThemedText>

          <TouchableOpacity style={rowStyle('light')} onPress={() => setDraftTheme('light')}>
            <ThemedText type="defaultSemiBold">{t('appearance.light')}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={rowStyle('dark')} onPress={() => setDraftTheme('dark')}>
            <ThemedText type="defaultSemiBold">{t('appearance.dark')}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={rowStyle('system')} onPress={() => setDraftTheme('system')}>
            <ThemedText type="defaultSemiBold">{t('appearance.system')}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.close} onPress={handleDone}>
            <ThemedText type="link">{t('appearance.done')}</ThemedText>
          </TouchableOpacity>

        </View>
      </ThemedView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 76 },
  card: { gap: 18, marginTop: 16 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: 'rgba(10, 126, 164, 0.08)',
  },
  close: { marginTop: 28 },
});
