import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';
import { EmailSupportButton } from '@/components/support-ui';
import { AppInfo } from '@/constants/app-info';

type Faq = { q: string; a: string };

export default function HelpCenter() {
  const { t } = useTranslation();

  const vars = {
    app: AppInfo.appName,
    email: AppInfo.supportEmail,
    website: AppInfo.websiteUrl,
  };

  const faqs = t('helpCenter.faqs', { returnObjects: true, ...vars }) as Faq[];

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
        <ThemedText type="title">{t('helpCenter.title')}</ThemedText>
        <ThemedText style={styles.intro}>{t('helpCenter.intro', vars)}</ThemedText>

        {faqs.map((faq, i) => (
          <View key={i} style={styles.faq}>
            <ThemedText type="subtitle" style={styles.question}>
              {faq.q}
            </ThemedText>
            <ThemedText style={styles.answer}>{faq.a}</ThemedText>
          </View>
        ))}

        <View style={styles.contactBlock}>
          <ThemedText type="subtitle" style={styles.question}>
            {t('helpCenter.contactHeading')}
          </ThemedText>
          <ThemedText style={styles.answer}>{t('helpCenter.contactBody', vars)}</ThemedText>
          <EmailSupportButton
            email={AppInfo.supportEmail}
            label={t('helpCenter.emailButton')}
            subject={t('helpCenter.emailSubject', vars)}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 76, paddingBottom: 48, gap: 14 },
  intro: { opacity: 0.8, lineHeight: 22, marginTop: 2 },
  faq: { gap: 5, marginTop: 6 },
  question: { fontSize: 17 },
  answer: { opacity: 0.85, lineHeight: 22 },
  contactBlock: { gap: 6, marginTop: 12 },
});
