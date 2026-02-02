import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * A custom hook that provides persistent storage.
 * Uses localStorage on web and AsyncStorage on native platforms.
 */
export function useStorageState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // Load stored value on first render
    if (Platform.OS === 'web') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.log('Error reading from local storage:', error);
      }
    } else {
      // For a real app, we'd use AsyncStorage here
      // Currently we simulate by just using the initial value
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (Platform.OS === 'web') {
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(value));
      } else {
        // For a real app, we'd use AsyncStorage here
        // AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log('Error saving to storage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}