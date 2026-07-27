import { useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '@/contexts/theme-context';

/**
 * Web color-scheme resolver.
 *
 * Honours the in-app ThemeContext choice (light / dark / system) exactly like
 * the native hook, with one web-only addition: static rendering has no client
 * DOM, so we return 'light' until after hydration to avoid a server/client
 * mismatch, then re-calculate on the client.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const ctx = useContext(ThemeContext);
  const system = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }

  // No provider yet, or the user chose "follow the system" — use the OS scheme.
  if (!ctx || ctx.theme === 'system') {
    return (ctx?.resolvedScheme ?? system) ?? 'light';
  }

  // Explicit light / dark choice wins.
  return ctx.theme;
}

export default useColorScheme;
