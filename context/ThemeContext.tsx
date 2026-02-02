import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colors: {
    background: string;
    text: string;
    secondaryText: string;
    card: string;
    cardBorder: string;
    primary: string;
    primaryLight: string;
    accent: string;
    tabBar: string;
    tabBarInactive: string;
    navBar: string;
    gradientStart: string;
    gradientEnd: string;
    divider: string;
    modalBackground: string;
  };
};

const lightColors = {
  background: '#f8f9fc', // 230 25% 98%
  text: '#2e3138', // 240 10% 20%
  secondaryText: '#767983', // 240 5% 50%
  card: '#ffffff', // 0 0% 100%
  cardBorder: '#e5e7eb', // 240 6% 90%
  primary: '#9747c4', // 276 57% 60%
  primaryLight: '#b990e2', // 262 57% 75%
  accent: '#b990e2', // 262 57% 75%
  tabBar: '#fafafa', // 0 0% 98%
  tabBarInactive: '#3e4149', // 240 5.3% 26.1%
  navBar: '#f7f7f8', // 240 4.8% 95.9%
  gradientStart: '#9747c4', // primary
  gradientEnd: '#b990e2', // accent
  divider: '#e5e7eb', // border
  modalBackground: 'rgba(0, 0, 0, 0.5)',
};

const darkColors = {
  background: '#0a0a0c', // 240 10% 4%
  text: '#fafafa', // 0 0% 98%
  secondaryText: '#b3b3b3', // 240 5% 70%
  card: '#0a0a0c', // 240 10% 4%
  cardBorder: '#27272a', // 240 3.7% 15.9%
  primary: '#b990e2', // 262 57% 65%
  primaryLight: '#b990e2', // keeping accent color for consistency
  accent: '#b990e2', // 262 57% 65%
  tabBar: '#0a0a0c', // matches background
  tabBarInactive: '#27272a', // 240 3.7% 15.9%
  navBar: '#27272a', // secondary color
  gradientStart: '#b990e2', // primary
  gradientEnd: '#9747c4', // darker variant
  divider: '#27272a', // 240 3.7% 15.9%
  modalBackground: 'rgba(0, 0, 0, 0.7)',
};

const defaultContext: ThemeContextType = {
  theme: 'system',
  currentTheme: 'light',
  setTheme: () => {},
  colors: lightColors,
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('system');

  // Determine the actual theme colors to use based on the selected theme and system setting
  const currentTheme = theme === 'system' 
    ? (deviceTheme === 'dark' ? 'dark' : 'light')
    : theme;

  const colors = currentTheme === 'dark' ? darkColors : lightColors;

  // Load saved theme preference on initial load
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // Only use localStorage on web
        if (Platform.OS === 'web') {
          try {
            const savedTheme = localStorage.getItem('themePreference');
            if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
              setTheme(savedTheme as Theme);
            }
          } catch (e) {
            console.error('Failed to load theme preference from localStorage:', e);
          }
        } else {
          // For native platforms, we would use AsyncStorage
          // For now, we'll just use the default system theme
          // In a real app, you would implement AsyncStorage here:
          // const savedTheme = await AsyncStorage.getItem('themePreference');
          // if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          //   setTheme(savedTheme as Theme);
          // }
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    try {
      if (Platform.OS === 'web') {
        try {
          localStorage.setItem('themePreference', theme);
        } catch (e) {
          console.error('Failed to save theme preference to localStorage:', e);
        }
      } else {
        // For native platforms, we would use AsyncStorage
        // For now, we'll just skip saving on native
        // In a real app, you would implement AsyncStorage here:
        // AsyncStorage.setItem('themePreference', theme);
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [theme]);

  const themeContextValue: ThemeContextType = {
    theme,
    currentTheme,
    setTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};