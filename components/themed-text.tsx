import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppSettings } from '@/contexts/settings-context';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { fontScale } = useAppSettings();

  // Flatten the type preset + caller style, then enlarge whatever font size /
  // line height ends up applied so the "Large Text" accessibility setting has a
  // consistent, correct effect (line height scales with the type).
  const flat: TextStyle =
    StyleSheet.flatten([
      type === 'default' ? styles.default : undefined,
      type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
      type === 'title' ? styles.title : undefined,
      type === 'subtitle' ? styles.subtitle : undefined,
      type === 'link' ? styles.link : undefined,
      style,
    ]) ?? {};

  const scaled =
    fontScale === 1
      ? null
      : {
          ...(typeof flat.fontSize === 'number'
            ? { fontSize: flat.fontSize * fontScale }
            : null),
          ...(typeof flat.lineHeight === 'number'
            ? { lineHeight: flat.lineHeight * fontScale }
            : null),
        };

  return <Text style={[{ color }, flat, scaled]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
