import React from 'react';
import { View, StyleSheet, Switch, Platform } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';
import { useAppSettings } from '@/contexts/settings-context';
import { Brand } from '@/constants/theme';

export default function EmailNotifications() {
  const { t } = useTranslation();
  const { emailMarketing, emailUpdates, setEmailMarketing, setEmailUpdates } = useAppSettings();

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <View style={styles.card}>
        <ThemedText type="title">{t('emailNotifications.title')}</ThemedText>
        <ThemedText style={styles.intro}>{t('emailNotifications.intro')}</ThemedText>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText type="defaultSemiBold">{t('emailNotifications.marketing')}</ThemedText>
            <ThemedText style={styles.hint}>{t('emailNotifications.marketingHint')}</ThemedText>
          </View>
          <Switch
            value={emailMarketing}
            onValueChange={setEmailMarketing}
            trackColor={{ true: Brand.primary }}
            {...(Platform.OS !== 'android' ? { ios_backgroundColor: '#d1d5db' } : {})}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText type="defaultSemiBold">{t('emailNotifications.productUpdates')}</ThemedText>
            <ThemedText style={styles.hint}>{t('emailNotifications.productUpdatesHint')}</ThemedText>
          </View>
          <Switch
            value={emailUpdates}
            onValueChange={setEmailUpdates}
            trackColor={{ true: Brand.primary }}
            {...(Platform.OS !== 'android' ? { ios_backgroundColor: '#d1d5db' } : {})}
          />
        </View>

        <ThemedText style={styles.footnote}>{t('emailNotifications.footnote')}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 76 },
  card: { gap: 20, width: '100%', maxWidth: 640, alignSelf: 'center' },
  intro: { opacity: 0.7, marginTop: -4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  rowText: { flex: 1, gap: 3 },
  hint: { fontSize: 13, opacity: 0.6 },
  footnote: { fontSize: 12, opacity: 0.5, marginTop: 4 },
});
