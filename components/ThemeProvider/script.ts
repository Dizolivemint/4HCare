import { ThemeScriptOptions } from './types';
export const script = ({
  attribute,
  storageKey,
  defaultTheme,
  forcedTheme,
  themes,
  value,
  enableSystem,
  enableColorScheme
}: ThemeScriptOptions) => {
  const el = document.documentElement;
  const systemThemes = ['light', 'dark'];
  const isClass = attribute === 'class';
  const classes = isClass && value ? themes.map(t => value[t] || t) : themes;

  const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const updateDOM = (theme: string) => {
    if (isClass) {
      el.classList.remove(...classes);
      el.classList.add(theme);
    } else {
      el.setAttribute(attribute, theme);
    }
    setColorScheme(theme);
  }

  const setColorScheme = (theme: string) => {
    if (enableColorScheme && systemThemes.includes(theme)) {
      el.style.colorScheme = theme;
    }
  }

  const applyTheme = (theme: string) => {
    const finalTheme = enableSystem && theme === 'system' ? getSystemTheme() : theme;
    updateDOM(finalTheme);
  }

  if (forcedTheme) {
    applyTheme(forcedTheme);
  } else {
    try {
      const savedTheme = localStorage.getItem(storageKey) || defaultTheme;
      applyTheme(savedTheme);
    } catch (e) {
      console.error("Failed to retrieve theme from localStorage:", e);
      applyTheme(defaultTheme);
    }
  }
};
