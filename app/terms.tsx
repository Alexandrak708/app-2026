import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsPage } from '@/components/settings-ui';
import { LegalContent, useDocVars } from '@/components/settings-content';

export default function Terms() {
  const { t } = useTranslation();
  const vars = useDocVars();
  return (
    <SettingsPage kicker={t('settings.groups.support.kicker')} title={t('terms.title')} intro={t('terms.intro', vars)} maxWidth={760}>
      <LegalContent ns="terms" showIntro={false} />
    </SettingsPage>
  );
}
