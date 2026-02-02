import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import InputTitle from '@/components/InputTitle';
import GistView from '@/components/GistView';
import StorySettings from '@/components/StorySettings';
import { generateStoryGist, generateStory } from '@/services/openai';
import { useLanguage } from '@/context/LanguageContext';
import { StorySettings as StorySettingsType, useUserPreferences } from '@/context/UserPreferencesContext';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { saveStoryGist, saveStory, removeGist } from '@/services/supabase';
import { TStoryGist } from '@/types';
import { getUserId } from '@/services/getUserId';
import { consumeGeneration, getPurchaseState } from '@/services/purchase';
import * as SecureStore from 'expo-secure-store';
import PurchaseModal from '@/components/PurchaseModal';

type AppState = 'input' | 'settings' | 'gist';

export default function NewStoryScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { preferences, updateLastUsedStorySettings } = useUserPreferences();
  const [state, setState] = useState<AppState>('input');
  const [title, setTitle] = useState<string>('');
  const [gist, setGist] = useState<TStoryGist>({} as TStoryGist);
  const [isGistGenerating, setIsGistGenerating] = useState(false);
  const [isStoryGenerating, setIsStoryGenerating] = useState(false);
  const [settings, setSettings] = useState<StorySettingsType>(preferences.lastUsedStorySettings);
  const [user_id, setUserId] = useState<string | null>(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getUserId(setUserId);
  }, []);

  const handleTitleSubmit = async (submittedTitle: string) => {
    setTitle(submittedTitle);
    const purchaseState = await getPurchaseState();
    if (purchaseState?.isSubscribed || purchaseState!.freeGenerations! < 3 || purchaseState!.purchasedUses! < 20) {
      setState('settings');
    } else {
      setPurchaseModalVisible(true);
    }
  };

  const handleSettingsSubmit = async (storySettings: StorySettingsType) => {
    try {
      setSettings(storySettings);
      updateLastUsedStorySettings(storySettings);
      setIsGistGenerating(true);
      setState('gist');

      const storyGist = await generateStoryGist({
        title,
        length: storySettings.length,
        ageRange: storySettings.ageRange,
        mood: storySettings.mood
      });
      // In a real app, this would call an API to generate a gist based on title AND settings
      if (storyGist) {
        const savedGist = await saveStoryGist({
          title,
          preview: storyGist.preview,
          image: storyGist.image,
          chapters: storyGist.chapters,
          user_id: user_id!,
          age_range: storySettings.ageRange,
          length: storySettings.length,
          mood: storySettings.mood,
        });
        setGist({
          id: savedGist.id,
          title,
          preview: storyGist.preview,
          image: savedGist.image,
          chapters: storyGist.chapters,
          user_id: user_id!,
          age_range: storySettings.ageRange,
          length: storySettings.length,
          mood: storySettings.mood,
        });
      } else {
        if (Platform.OS === 'web') {
          alert('Failed to generate story. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to generate story. Please try again.');
        }
        setState('settings');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      if (Platform.OS === 'web') {
        alert('Failed to generate story. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to generate story. Please try again.');
      }
      setState('settings');
    } finally {
      setIsGistGenerating(false);
    }
  };

  const handleStartGeneration = async () => {
    try {
      setIsStoryGenerating(true);
      const chapters = await generateStory({
        gist
      });
      const story = await saveStory({
        gist_id: gist.id!,
        title,
        preview: gist.preview,
        image: gist.image,
        chapters,
        user_id: user_id!,
      });
      await consumeGeneration();

      router.push(`/story/${story.id}`);
    } catch (error) {
      console.error('Error generating story:', error);
      if (Platform.OS === 'web') {
        alert('Failed to generate story. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to generate story. Please try again.');
      }
      setState('gist');
    } finally {
      setIsStoryGenerating(false);
    }
  };

  const handleCancelGeneration = async () => {
    try {
      await removeGist(gist.id!);
      setState('input');
    } catch (error) {
      console.error('Error generating story:', error);
      if (Platform.OS === 'web') {
        alert('Failed to generate story. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to generate story. Please try again.');
      }
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Animatable.View animation="bounceIn" duration={1200}>
            <Text style={styles.title}>{t.newStory}</Text>
          </Animatable.View>
          <Animatable.View animation="fadeIn" delay={400}>
            <Text style={styles.subtitle}>{t.createNewStory}</Text>
          </Animatable.View>
          <Animatable.View animation="fadeIn" delay={800} style={styles.headerIcon}>
            <Sparkles size={24} color="#fff" />
          </Animatable.View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {state === 'input' && (
            <InputTitle onSubmit={handleTitleSubmit} />
          )}

          {state === 'settings' && (
            <StorySettings
              title={title}
              initialSettings={settings}
              onSubmit={handleSettingsSubmit}
            />
          )}

          {state === 'gist' && (
            isGistGenerating ? (
              <View style={styles.loadingContainer}>
                <Image
                  source={require('@/assets/images/loading.gif')}
                  style={styles.loadingImage}
                />
                <Text style={[styles.loadingText, { color: colors.primary }]}>{t.generatingStory}</Text>
                <Text style={[styles.loadingSubtext, { color: colors.secondaryText }]}>{title}</Text>
              </View>
            ) : (
              <GistView
                title={title}
                preview={gist.preview}
                settings={settings}
                coverImage={gist.image}
                isStoryGenerating={isStoryGenerating}
                onStartGeneration={handleStartGeneration}
                onCancelGeneration={handleCancelGeneration}
              />
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <PurchaseModal 
        visible={purchaseModalVisible}
        onClose={() => setPurchaseModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    paddingHorizontal: 20,
    position: 'relative',
  },
  title: {
    fontSize: 30,
    fontFamily: 'LuckiestGuy-Regular',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});