import * as React from 'react'

interface ValueObject {
  [themeName: string]: string
}

export interface UseThemeProps {
  /** List of all available theme names */
  themes: string[]
  /** Forced theme name for the current page */
  forcedTheme?: string | undefined
  /** Update the theme */
  setTheme: React.Dispatch<React.SetStateAction<string>>
  /** Active theme name */
  theme?: string | undefined
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?: string | undefined
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  systemTheme?: 'dark' | 'light' | undefined
}

export type Attribute = `data-${string}` | 'class'

export interface ThemeProviderProps extends React.PropsWithChildren {
  /** List of all available theme names */
  themes?: string[] | undefined
  /** Forced theme name for the current page */
  forcedTheme?: string | undefined
  /** Whether to switch between dark and light themes based on prefers-color-scheme */
  enableSystem?: boolean | undefined
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean | undefined
  /** Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons */
  enableColorScheme?: boolean | undefined
  /** Key used to store theme setting in localStorage */
  storageKey?: string | undefined
  /** Default theme name (for v0.0.12 and lower the default was light). If `enableSystem` is false, the default theme is light */
  defaultTheme?: string | undefined
  /** HTML attribute modified based on the active theme. Accepts `class`, `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.), or an array which could include both */
  attribute?: Attribute | Attribute[] | undefined
  /** Mapping of theme name to HTML attribute value. Object where key is the theme name and value is the attribute value */
  value?: ValueObject | undefined
  /** Nonce string to pass to the inline script for CSP headers */
  nonce?: string | undefined
}

// Define a type for the theme names
export type ThemeName = 'light' | 'dark' | 'system' | string;

// Interface for the script parameters
export interface ThemeScriptOptions {
  attribute: Attribute;             // 'class' or a data attribute like 'data-theme'
  storageKey: string;               // Key used in localStorage to save the theme
  defaultTheme: ThemeName;          // Default theme to be used ('light', 'dark', 'system', or a custom theme name)
  forcedTheme?: ThemeName;          // A theme that is forced across the app, overriding others
  themes: ThemeName[];              // List of available themes
  value?: Record<string, string>;   // Mapping of theme names to class names, if 'attribute' is 'class'
  enableSystem: boolean;            // Whether to enable system theme detection
  enableColorScheme: boolean;       // Whether to enable the color-scheme property in the browser
}