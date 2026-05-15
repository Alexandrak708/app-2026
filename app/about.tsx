import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title">{t('about.title')}</ThemedText>
        <ThemedText type="subtitle">{t('about.version')}</ThemedText>
        <ThemedText>{t('about.description')}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  card: { gap: 12 },
});
