import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsPage } from '@/components/settings-ui';
import { AboutContent, useDocVars } from '@/components/settings-content';
import { useIsWideWeb } from '@/components/responsive';

export default function About() {
  const { t } = useTranslation();
  const vars = useDocVars();
  const wide = useIsWideWeb(720);
  return (
    <SettingsPage kicker={t('settings.groups.support.kicker')} title={t('about.title', vars)} maxWidth={760}>
      <AboutContent wide={wide} />
    </SettingsPage>
  );
}
