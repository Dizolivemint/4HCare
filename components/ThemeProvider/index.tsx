'use client'

import * as React from 'react';
import { script } from './script';
import { getTheme, disableTransition, getSystemTheme } from './themeUtils';
import type { Attribute, ThemeProviderProps, UseThemeProps, ThemeName } from './types';
import ErrorBoundary from '../ErrorBoundary'; // Assuming ErrorBoundary is implemented

const colorSchemes: string[] = ['light', 'dark'];
const MEDIA = '(prefers-color-scheme: dark)';
const ThemeContext = React.createContext<UseThemeProps | undefined>(undefined);
const defaultContext: UseThemeProps = { setTheme: () => {}, themes: [] };

export const useTheme = (): UseThemeProps => React.useContext(ThemeContext) ?? defaultContext;

export const ThemeProvider = (props: ThemeProviderProps): React.ReactNode => {
  const context = React.useContext(ThemeContext);

  if (context) return props.children;
  return (
    <ErrorBoundary>
      <Theme {...props} />
    </ErrorBoundary>
  );
};

const defaultThemes: string[] = ['light', 'dark'];

const Theme = ({
  forcedTheme,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = 'theme',
  themes = defaultThemes,
  defaultTheme = enableSystem ? 'system' : 'light',
  attribute = 'data-theme',
  value,
  children,
  nonce
}: ThemeProviderProps): JSX.Element => {
  const [theme, setThemeState] = React.useState(() => getTheme(storageKey, defaultTheme));
  const [resolvedTheme, setResolvedTheme] = React.useState(() => getTheme(storageKey));
  const attrs = !value ? themes : Object.values(value);

  const applyTheme = React.useCallback((theme: ThemeName) => {
    let resolved = theme;
    if (!resolved) return;

    if (theme === 'system' && enableSystem) {
      resolved = getSystemTheme();
    }

    const name = value ? value[resolved] : resolved;
    const enable = disableTransitionOnChange ? disableTransition() : null;
    const d = document.documentElement;

    const handleAttribute = (attr: Attribute) => {
      if (attr === 'class') {
        d.classList.remove(...attrs);
        if (name) d.classList.add(name);
      } else if (attr.startsWith('data-')) {
        if (name) {
          d.setAttribute(attr, name);
        } else {
          d.removeAttribute(attr);
        }
      }
    };

    if (Array.isArray(attribute)) attribute.forEach(handleAttribute);
    else handleAttribute(attribute);

    if (enableColorScheme) {
      const fallback = colorSchemes.includes(defaultTheme) ? defaultTheme : null;
      const colorScheme = colorSchemes.includes(resolved) ? resolved : fallback;
      d.style.colorScheme = colorScheme || '';
    }

    enable?.();

    // Adding aria-live for accessibility
    d.setAttribute('aria-live', 'polite');
  }, [attrs, disableTransitionOnChange, enableColorScheme, enableSystem, value, attribute, defaultTheme]);

  const setTheme = React.useCallback(
    (value: string | ((theme: string) => string)) => {
      const newTheme = typeof value === 'function' ? value(theme || 'system') : value;
      setThemeState(newTheme);

      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        console.error("Failed to set theme in localStorage:", e);
      }
    },
    [theme, storageKey]
  );

  const handleMediaQuery = React.useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      const resolved = getSystemTheme(e);
      setResolvedTheme(resolved);

      if (theme === 'system' && enableSystem && !forcedTheme) {
        applyTheme('system');
      }
    },
    [theme, forcedTheme, applyTheme, enableSystem]
  );

  React.useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addListener(handleMediaQuery);
    handleMediaQuery(media);

    return () => media.removeListener(handleMediaQuery);
  }, [handleMediaQuery]);

  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;

      const theme = e.newValue || defaultTheme;
      setTheme(theme);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [setTheme, storageKey, defaultTheme]);

  React.useEffect(() => {
    applyTheme(forcedTheme ?? theme ?? 'system');
  }, [forcedTheme, theme, applyTheme]);

  const providerValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme: theme === 'system' ? resolvedTheme : theme,
      themes: enableSystem ? [...themes, 'system'] : themes,
      systemTheme: enableSystem ? (resolvedTheme as 'light' | 'dark' | undefined) : undefined
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, enableSystem, themes]
  );

  return (
    <ThemeContext.Provider value={providerValue}>
      <ThemeScript
        {...{
          forcedTheme,
          storageKey,
          attribute,
          enableSystem,
          enableColorScheme,
          defaultTheme,
          value,
          themes,
          nonce
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
};

const ThemeScript = React.memo(
  ({
    forcedTheme,
    storageKey,
    attribute,
    enableSystem,
    enableColorScheme,
    defaultTheme,
    value,
    themes,
    nonce
  }: Omit<ThemeProviderProps, 'children'> & { defaultTheme: string }): JSX.Element => {
    const scriptArgs = JSON.stringify([
      attribute,
      storageKey,
      defaultTheme,
      forcedTheme,
      themes,
      value,
      enableSystem,
      enableColorScheme
    ]).slice(1, -1);

    return (
      <script
        suppressHydrationWarning
        nonce={typeof window === 'undefined' ? nonce : ''}
        dangerouslySetInnerHTML={{ __html: `(${script.toString()})(${scriptArgs})` }}
      />
    );
  }
);

ThemeScript.displayName = 'ThemeScript';