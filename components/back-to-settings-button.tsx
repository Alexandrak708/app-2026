import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/typography';
import { hoverTransition, useHover } from '@/components/program-ui';

/** Hairline pill "‹ Back to Settings" used at the top of every settings screen. */
export function BackToSettingsButton({ label, onPress }: { label?: string; onPress?: () => void } = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const hover = useHover();
  const text = label ?? t('settings.backToSettings');

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      {...hover}
      accessibilityRole="button"
      accessibilityLabel={text}
      hitSlop={10}
      style={({ pressed }) => [
        {
          alignSelf: 'flex-start',
          height: 42,
          paddingLeft: 10,
          paddingRight: 16,
          borderRadius: 21,
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderColor: hover.hovered ? colors.accent : colors.border,
          backgroundColor: hover.hovered ? colors.accentTint : colors.card,
          opacity: pressed ? 0.8 : 1,
        },
        hoverTransition,
      ]}
    >
      <Ionicons name="chevron-back" size={18} color={hover.hovered ? colors.accent : colors.text} />
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14, color: hover.hovered ? colors.accent : colors.text }}>{text}</Text>
    </Pressable>
  );
}
