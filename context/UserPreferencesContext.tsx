import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { useLanguage } from './LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StorySettings = {
  length: 'short' | 'medium' | 'long';
  ageRange: '3-5' | '6-8' | '9-12';
  mood: 'happy' | 'adventurous' | 'educational' | 'calming' | 'magical';
};

export type SpeechSettings = {
  rate: number; // 0.5-2.0
  pitch: number; // 0.5-2.0
};

export type UserPreferences = {
  speechSettings: SpeechSettings;
  lastUsedStorySettings: StorySettings;
  favoriteThemes: string[];
};

type UserPreferencesContextType = {
  preferences: UserPreferences;
  updateSpeechSettings: (settings: SpeechSettings) => void;
  updateLastUsedStorySettings: (settings: StorySettings) => void;
  addFavoriteTheme: (theme: string) => void;
  removeFavoriteTheme: (theme: string) => void;
};

const defaultPreferences: UserPreferences = {
  speechSettings: {
    rate: 0.8,
    pitch: 1.0,
  },
  lastUsedStorySettings: {
    length: 'medium',
    ageRange: '6-8',
    mood: 'happy',
  },
  favoriteThemes: [],
};

const UserPreferencesContext = createContext<UserPreferencesContextType>({
  preferences: defaultPreferences,
  updateSpeechSettings: () => {},
  updateLastUsedStorySettings: () => {},
  addFavoriteTheme: () => {},
  removeFavoriteTheme: () => {},
});

export const useUserPreferences = () => useContext(UserPreferencesContext);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  
  // Load preferences on first render
  useEffect(() => {
    // In a real app, we would load preferences from AsyncStorage or similar
    // For this demo, we'll just use the defaults
    loadPreferences();
  }, []);
  
  // Load preferences from storage
  const loadPreferences = async () => {
    if (Platform.OS === 'web') {
      try {
        const storedPrefs = localStorage.getItem('userPreferences');
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        }
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    } else {
      // In a real app, we would use AsyncStorage
      const storedPrefs = await AsyncStorage.getItem('userPreferences');
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }
    }
  };
  
  // Save preferences when they change
  useEffect(() => {
    // In a real app, we would save to AsyncStorage or similar
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
      } catch (e) {
        console.error('Failed to save preferences:', e);
      }
    } else {
      // For native platforms:
      AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
    }
  }, [preferences]);
  
  const updateSpeechSettings = (settings: SpeechSettings) => {
    setPreferences(prev => ({
      ...prev,
      speechSettings: settings,
    }));
  };
  
  const updateLastUsedStorySettings = (settings: StorySettings) => {
    setPreferences(prev => ({
      ...prev,
      lastUsedStorySettings: settings,
    }));
  };
  
  const addFavoriteTheme = (theme: string) => {
    setPreferences(prev => {
      // Don't add duplicates
      if (prev.favoriteThemes.includes(theme)) return prev;
      
      return {
        ...prev,
        favoriteThemes: [...prev.favoriteThemes, theme],
      };
    });
  };
  
  const removeFavoriteTheme = (theme: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteThemes: prev.favoriteThemes.filter(t => t !== theme),
    }));
  };
  
  return (
    <UserPreferencesContext.Provider 
      value={{ 
        preferences, 
        updateSpeechSettings, 
        updateLastUsedStorySettings, 
        addFavoriteTheme, 
        removeFavoriteTheme 
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};