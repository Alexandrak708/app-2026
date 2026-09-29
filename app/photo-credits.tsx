import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BackToSettingsButton } from '@/components/back-to-settings-button';
import { ContentWrap } from '@/components/responsive';
import { useAppTheme } from '@/hooks/use-theme-color';
import { PHOTO_CREDITS } from '@/data/photo-credits';

/**
 * Attribution for every university photo. Most photos come from Wikimedia
 * Commons under Creative Commons licences, which require crediting the author
 * and naming the licence; the rest are the institutions' own photos.
 */
export default function PhotoCredits() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const rows = useMemo(
    () =>
      PHOTO_CREDITS.map((c) => ({ ...c, name: t(`universities.${c.universityId}.name`) })).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [t],
  );

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton label={t('photoCredits.back')} />
      <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
        <ContentWrap maxWidth={760} style={{ width: '100%', gap: 10 }}>
          <ThemedText type="title">{t('photoCredits.title')}</ThemedText>
          <ThemedText style={styles.paragraph}>{t('photoCredits.intro')}</ThemedText>

          {rows.map((c) => (
            <View key={c.universityId} style={[styles.row, { borderColor: colors.border }]}>
              <ThemedText type="defaultSemiBold" style={styles.name}>
                {c.name}
              </ThemedText>
              <ThemedText style={styles.meta}>
                {c.kind === 'commons'
                  ? t('photoCredits.byAuthor', { author: c.author, license: c.license })
                  : t('photoCredits.byInstitution')}
              </ThemedText>
              <ThemedText
                style={styles.link}
                lightColor={colors.accent}
                darkColor={colors.accent}
                onPress={() => Linking.openURL(c.sourceUrl).catch(() => {})}
                accessibilityRole="link"
              >
                {c.kind === 'commons' ? t('photoCredits.viewOnCommons') : t('photoCredits.viewWebsite')}
              </ThemedText>
            </View>
          ))}
        </ContentWrap>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 76, paddingBottom: 48, gap: 10 },
  paragraph: { opacity: 0.85, lineHeight: 22, marginBottom: 6 },
  row: { paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 2 },
  name: { fontSize: 15 },
  meta: { opacity: 0.7, fontSize: 13, lineHeight: 19 },
  link: { fontSize: 13, fontWeight: '600', marginTop: 2 },
});
