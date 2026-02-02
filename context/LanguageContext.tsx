import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { getTranslations, languages, languageCodes, getSpeechLocale } from '@/data/languages';

type LanguageContextType = {
  language: string;
  setLanguage: (code: string) => void;
  t: Record<string, string>;
  getLocaleForSpeech: () => string;
};

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: getTranslations('en'),
  getLocaleForSpeech: () => 'en-US',
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState(getTranslations('en'));

  useEffect(() => {
    // Load saved language preference or detect device language
    const loadLanguagePreference = async () => {
      try {
        // Try to get saved language preference
        const savedLanguage = Platform.OS === 'web' 
          ? localStorage.getItem('language')
          : await AsyncStorage.getItem('language');

        if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
          setLanguage(savedLanguage);
          return;
        }

        // If no saved preference, detect device language
        const locale = await Localization.getLocalizationAsync();
        const deviceLang = locale.locale.split('-')[0];
        const isSupported = languages.some(lang => lang.code === deviceLang);
        setLanguage(isSupported ? deviceLang : 'en');
      } catch (error) {
        console.error('Error loading language preference:', error);
        setLanguage('en');
      }
    };
    
    loadLanguagePreference();
  }, []);
  
  const setLanguage = (code: string) => {
    setLanguageState(code);
    setTranslations(getTranslations(code));
    
    // Save language preference
    if (Platform.OS !== 'web') {
      AsyncStorage.setItem('language', code)
        .catch(e => console.error('Failed to save language preference:', e));
    } else {
      try {
        localStorage.setItem('language', code);
      } catch (e) {
        console.error('Failed to save language preference:', e);
      }
    }
  };

  // Get the appropriate locale for speech based on the current language
  const getLocaleForSpeech = () => {
    return getSpeechLocale(language);
  };
  
  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t: translations,
      getLocaleForSpeech
    }}>
      {children}
    </LanguageContext.Provider>
  );
};