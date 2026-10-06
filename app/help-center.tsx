import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsPage } from '@/components/settings-ui';
import { HelpContent, useDocVars } from '@/components/settings-content';

export default function HelpCenter() {
  const { t } = useTranslation();
  const vars = useDocVars();
  return (
    <SettingsPage kicker={t('settings.groups.support.kicker')} title={t('helpCenter.title')} intro={t('helpCenter.intro', vars)} maxWidth={760}>
      <HelpContent />
    </SettingsPage>
  );
}
