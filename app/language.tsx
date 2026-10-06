import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguagePicker, SettingsPage } from '@/components/settings-ui';

export default function LanguageScreen() {
  const { t } = useTranslation();
  return (
    <SettingsPage kicker={t('settings.title')} title={t('settings.language')}>
      <LanguagePicker />
    </SettingsPage>
  );
}
