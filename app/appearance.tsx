import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsCard, SettingsPage, ThemePicker } from '@/components/settings-ui';

export default function AppearanceScreen() {
  const { t } = useTranslation();
  return (
    <SettingsPage kicker={t('settings.title')} title={t('appearance.title')} intro={t('appearance.subtitle')}>
      <SettingsCard padded>
        <ThemePicker />
      </SettingsCard>
    </SettingsPage>
  );
}
