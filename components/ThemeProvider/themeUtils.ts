// themeUtils.ts

// Function to retrieve the theme from localStorage with fallback support
export function getTheme(key: string, fallback?: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  let theme;
  try {
    theme = localStorage.getItem(key) || undefined;
  } catch (e) {
    console.error("Failed to retrieve theme from localStorage:", e);
  }
  return theme || fallback;
}

// Function to disable CSS transitions temporarily
export function disableTransition(): () => void {
  const css = document.createElement('style');
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
    )
  );
  document.head.appendChild(css);

  return () => {
    window.getComputedStyle(document.body);
    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  }
}

// Function to get the system theme preference
export function getSystemTheme(e?: MediaQueryList | MediaQueryListEvent): 'light' | 'dark' {
  if (!e) e = window.matchMedia('(prefers-color-scheme: dark)');
  return e.matches ? 'dark' : 'light';
}

