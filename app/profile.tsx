import React from 'react';
import { useTranslation } from 'react-i18next';
import ProfileForm from '@/components/profile-form';
import { SettingsPage } from '@/components/settings-ui';

export default function ProfileScreen() {
  const { t } = useTranslation();
  return (
    <SettingsPage kicker={t('settings.groups.account.kicker')} title={t('profile.title')} intro={t('settings.panels.profile')}>
      <ProfileForm />
    </SettingsPage>
  );
}
