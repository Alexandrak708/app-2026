import React, { createContext, useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeChoice = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
  resolvedScheme: 'light' | 'dark' | null;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app:theme';

// React Native reports 'unspecified' (older versions: null) when the OS has
// no preference; anything that isn't explicitly dark is treated as light.
function toScheme(scheme: ColorSchemeName | null | undefined): 'light' | 'dark' {
  return scheme === 'dark' ? 'dark' : 'light';
}

function setDocumentTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>('system');
  const [resolvedScheme, setResolvedScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'light' || raw === 'dark' || raw === 'system') {
          setThemeState(raw);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    const update = () => {
      setResolvedScheme(toScheme(Appearance.getColorScheme()));
    };

    update();
    const sub = Appearance.addChangeListener(update);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const activeScheme = theme === 'system' ? (resolvedScheme ?? 'light') : theme;
    setDocumentTheme(activeScheme);
  }, [theme, resolvedScheme]);

  const setTheme = (t: ThemeChoice) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
    const active = t === 'system' ? toScheme(Appearance.getColorScheme()) : t;
    setDocumentTheme(active);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
