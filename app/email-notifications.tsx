import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/contexts/settings-context';
import { RowDivider, SettingsCard, SettingsPage, ToggleRow } from '@/components/settings-ui';
import { NotificationsFootnote } from '@/components/settings-parts';

export default function EmailNotifications() {
  const { t } = useTranslation();
  const { emailMarketing, emailUpdates, setEmailMarketing, setEmailUpdates } = useAppSettings();

  return (
    <SettingsPage kicker={t('settings.title')} title={t('emailNotifications.title')} intro={t('emailNotifications.intro')}>
      <SettingsCard>
        <ToggleRow
          icon="megaphone-outline"
          title={t('emailNotifications.marketing')}
          hint={t('emailNotifications.marketingHint')}
          value={emailMarketing}
          onValueChange={setEmailMarketing}
        />
        <RowDivider />
        <ToggleRow
          icon="sparkles-outline"
          title={t('emailNotifications.productUpdates')}
          hint={t('emailNotifications.productUpdatesHint')}
          value={emailUpdates}
          onValueChange={setEmailUpdates}
        />
      </SettingsCard>
      <NotificationsFootnote />
    </SettingsPage>
  );
}
