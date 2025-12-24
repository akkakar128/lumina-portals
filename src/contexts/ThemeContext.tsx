import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeName = 'light' | 'dark' | 'cyberpunk' | 'minimal' | 'glass' | 'neon';

export interface ThemeInfo {
  name: ThemeName;
  label: string;
  description: string;
  preview: {
    background: string;
    primary: string;
    accent: string;
  };
}

export const AVAILABLE_THEMES: ThemeInfo[] = [
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon-lit noir with cyan and magenta accents',
    preview: { background: '#0a0d14', primary: '#00ffff', accent: '#ff00ff' },
  },
  {
    name: 'dark',
    label: 'Dark',
    description: 'Clean, modern dark mode with blue accents',
    preview: { background: '#0a0a0b', primary: '#3b82f6', accent: '#3f3f46' },
  },
  {
    name: 'light',
    label: 'Light',
    description: 'Bright and professional with subtle shadows',
    preview: { background: '#ffffff', primary: '#2563eb', accent: '#f4f4f5' },
  },
  {
    name: 'minimal',
    label: 'Minimal',
    description: 'Black and white elegance, distraction-free',
    preview: { background: '#fafafa', primary: '#171717', accent: '#f5f5f5' },
  },
  {
    name: 'glass',
    label: 'Glass',
    description: 'Frosted glass effects with soft gradients',
    preview: { background: '#141a26', primary: '#33ccff', accent: '#9966ff' },
  },
  {
    name: 'neon',
    label: 'Neon',
    description: 'Vibrant electric colors on deep purple',
    preview: { background: '#0d0517', primary: '#ff3399', accent: '#ffff00' },
  },
];

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: ThemeInfo[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}

export function ThemeProvider({ children, defaultTheme = 'cyberpunk' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
  }, []);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('portfolio-theme') as ThemeName | null;
    if (savedTheme && AVAILABLE_THEMES.find(t => t.name === savedTheme)) {
      setTheme(savedTheme);
    } else {
      setTheme(defaultTheme);
    }
  }, [defaultTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: AVAILABLE_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
