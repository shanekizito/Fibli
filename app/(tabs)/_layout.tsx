import { Tabs } from 'expo-router';
import { CirclePlus as PlusCircle, BookOpen, Settings } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  const renderTabBarIcon = (color: string, size: number, Component: any) => {
    return (
      <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
        <Component size={size} color={color} />
      </Animatable.View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          height: 75,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          backgroundColor: colors.tabBar,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        tabBarBackground: () => (
          <View style={[styles.tabBarBackground, { backgroundColor: colors.tabBar }]} />
        ),
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.newStory,
          tabBarIcon: ({ color, size }) => renderTabBarIcon(color, size, PlusCircle),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t.myLibrary,
          tabBarIcon: ({ color, size }) => renderTabBarIcon(color, size, BookOpen),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ color, size }) => renderTabBarIcon(color, size, Settings),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});