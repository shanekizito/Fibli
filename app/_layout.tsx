import { useCallback, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import * as SplashScreen from 'expo-splash-screen';
import { LanguageProvider } from '@/context/LanguageContext';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { endPurchaseConnection, initializePurchases } from '@/services/purchase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'LuckiestGuy-Regular': LuckiestGuy_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    initializePurchases();

    return () => {
      endPurchaseConnection();
    };
  }, []);
  
  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserPreferencesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="story/[id]" />
            <Stack.Screen name="share/[id]" />
            <Stack.Screen name="edit/[id]" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </UserPreferencesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}