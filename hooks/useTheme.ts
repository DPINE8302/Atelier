import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = (): { theme: Theme; setTheme: (theme: Theme) => void } => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = window.localStorage.getItem('atelier-theme') as Theme | null;
      return savedTheme || 'system';
    } catch {
      return 'system';
    }
  });

  const applyTheme = useCallback((t: Theme) => {
    const root = window.document.documentElement;
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    try {
      window.localStorage.setItem('atelier-theme', newTheme);
    } catch (e) {
      console.error("Could not save theme", e);
    }
    setThemeState(newTheme);
  };

  return { theme, setTheme };
};
