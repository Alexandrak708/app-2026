import React, { createContext, useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeChoice = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
  resolvedScheme: ColorSchemeName | null;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app:theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>('system');
  const [resolvedScheme, setResolvedScheme] = useState<ColorSchemeName | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'light' || raw === 'dark' || raw === 'system') {
          setThemeState(raw);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    const update = () => {
      const system = Appearance.getColorScheme();
      setResolvedScheme(system ?? 'light');
    };

    update();
    const sub = Appearance.addChangeListener(update);
    return () => sub.remove();
  }, []);

  const setTheme = (t: ThemeChoice) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
