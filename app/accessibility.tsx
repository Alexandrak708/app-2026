import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/contexts/settings-context';
import { RowDivider, SettingsCard, SettingsPage, ToggleRow } from '@/components/settings-ui';

export default function AccessibilityScreen() {
  const { t } = useTranslation();
  const { reduceMotion, largeText, setReduceMotion, setLargeText } = useAppSettings();

  return (
    <SettingsPage kicker={t('settings.title')} title={t('accessibility.title')} intro={t('accessibility.intro')}>
      <SettingsCard>
        <ToggleRow
          icon="pulse-outline"
          title={t('accessibility.reduceMotion')}
          hint={t('accessibility.reduceMotionHint')}
          value={reduceMotion}
          onValueChange={setReduceMotion}
        />
        <RowDivider />
        <ToggleRow
          icon="text-outline"
          title={t('accessibility.largeText')}
          hint={t('accessibility.largeTextHint')}
          value={largeText}
          onValueChange={setLargeText}
        />
      </SettingsCard>
    </SettingsPage>
  );
}
