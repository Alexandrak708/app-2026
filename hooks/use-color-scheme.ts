import { useContext } from 'react';
import { Appearance, useColorScheme as _useColorScheme } from 'react-native';
import { ThemeContext } from '@/components/theme-provider';

export function useColorScheme() {
	const ctx = useContext(ThemeContext);
	const system = _useColorScheme();

	if (!ctx) return system;

	if (ctx.theme === 'system') return system ?? 'light';
	return ctx.theme;
}

export default useColorScheme;
