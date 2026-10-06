import React, { useMemo } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/typography';
import { RowDivider, SettingsCard, SettingsPage } from '@/components/settings-ui';
import { hoverTransition, useHover } from '@/components/program-ui';
import { PHOTO_CREDITS } from '@/data/photo-credits';

type CreditRow = (typeof PHOTO_CREDITS)[number] & { name: string };

function Credit({ credit }: { credit: CreditRow }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  const commons = credit.kind === 'commons';
  return (
    <Pressable
      onPress={() => Linking.openURL(credit.sourceUrl).catch(() => {})}
      {...hover}
      accessibilityRole="link"
      accessibilityLabel={`${credit.name} — ${commons ? t('photoCredits.viewOnCommons') : t('photoCredits.viewWebsite')}`}
      style={({ pressed }) => [
        {
          flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 17,
          backgroundColor: hover.hovered ? colors.mutedSurface : 'transparent', opacity: pressed ? 0.82 : 1,
        },
        hoverTransition,
      ]}
    >
      <View style={{ width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentTint }}>
        <Ionicons name={commons ? 'images-outline' : 'business-outline'} size={19} color={colors.accent} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, lineHeight: 20, color: hover.hovered ? colors.accent : colors.text }}>{credit.name}</Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textSecondary }}>
          {commons ? t('photoCredits.byAuthor', { author: credit.author, license: credit.license }) : t('photoCredits.byInstitution')}
        </Text>
      </View>
      <Ionicons name="open-outline" size={17} color={hover.hovered ? colors.accent : colors.textMuted} />
    </Pressable>
  );
}

/**
 * Attribution for every university photo. Most photos come from Wikimedia
 * Commons under Creative Commons licences, which require crediting the author
 * and naming the licence; the rest are the institutions' own photos.
 */
export default function PhotoCredits() {
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      PHOTO_CREDITS.map((c) => ({ ...c, name: t(`universities.${c.universityId}.name`) })).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [t],
  );

  return (
    <SettingsPage kicker={t('settings.groups.support.kicker')} title={t('photoCredits.title')} intro={t('photoCredits.intro')} backLabel={t('photoCredits.back')} maxWidth={760}>
      <SettingsCard>
        {rows.map((credit, index) => (
          <View key={credit.universityId}>
            {index ? <RowDivider /> : null}
            <Credit credit={credit} />
          </View>
        ))}
      </SettingsCard>
    </SettingsPage>
  );
}
