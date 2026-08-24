import React from 'react';
import { View, StyleSheet, Switch, Platform } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';
import { useAppSettings } from '@/contexts/settings-context';
import { Brand } from '@/constants/theme';

export default function AccessibilityScreen() {
  const { t } = useTranslation();
  const { reduceMotion, largeText, setReduceMotion, setLargeText } = useAppSettings();

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <View style={styles.card}>
        <ThemedText type="title">{t('accessibility.title')}</ThemedText>
        <ThemedText style={styles.intro}>{t('accessibility.intro')}</ThemedText>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText type="defaultSemiBold">{t('accessibility.reduceMotion')}</ThemedText>
            <ThemedText style={styles.hint}>{t('accessibility.reduceMotionHint')}</ThemedText>
          </View>
          <Switch
            value={reduceMotion}
            onValueChange={setReduceMotion}
            trackColor={{ true: Brand.primary }}
            {...(Platform.OS !== 'android' ? { ios_backgroundColor: '#d1d5db' } : {})}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText type="defaultSemiBold">{t('accessibility.largeText')}</ThemedText>
            <ThemedText style={styles.hint}>{t('accessibility.largeTextHint')}</ThemedText>
          </View>
          <Switch
            value={largeText}
            onValueChange={setLargeText}
            trackColor={{ true: Brand.primary }}
            {...(Platform.OS !== 'android' ? { ios_backgroundColor: '#d1d5db' } : {})}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 76 },
  card: { gap: 20 },
  intro: { opacity: 0.7, marginTop: -4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  rowText: { flex: 1, gap: 3 },
  hint: { fontSize: 13, opacity: 0.6 },
});
