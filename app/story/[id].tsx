import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Volume2,
  VolumeOff as Volume2Off,
  ChevronRight,
  Sparkles,
  Heart,
  Pause,
  Play
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import ChapterView from '@/components/ChapterView';
import { useLanguage } from '@/context/LanguageContext';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTheme } from '@/context/ThemeContext';
import { getStory } from '@/services/supabase';
import { TStory } from '@/types';

export default function StoryScreen() {
  const { t, getLocaleForSpeech } = useLanguage();
  const { preferences } = useUserPreferences();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [story, setStory] = useState<TStory | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0); // 0 to 1 for progress

  const scrollViewRef = useRef<ScrollView>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Find the story with the matching ID
    const foundStory = async () => {
      try {
        const story = await getStory(id);
        setStory(story);
      } catch (error) {
        console.error('Error getting story:', error);
        if (Platform.OS === 'web') {
          alert(t.errorGettingStory);
        } else {
          Alert.alert(t.error, t.errorGettingStory);
        }
      }
    }
    foundStory();

    // Cleanup function to stop any speech and reset state when component unmounts
    return () => {
      const cleanup = async () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setReadingProgress(0);
        if (Platform.OS !== 'web' && await Speech.isSpeakingAsync()) {
          Speech.stop();
        }
      };
      cleanup();
    };
  }, [id]);

  // Add an effect to handle speech when chapter changes
  useEffect(() => {
    // Scroll to top when chapter changes
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    // Reset reading progress
    setReadingProgress(0);
  }, [currentChapterIndex]);

  useEffect(() => {
    // Button pulse animation
    const startButtonAnimation = () => {
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.15,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isSpeaking) {
          startButtonAnimation();
        }
      });
    };

    if (isSpeaking) {
      startButtonAnimation();
    } else {
      buttonScale.setValue(1);
    }
  }, [isSpeaking]);

  const currentChapter = story?.chapters[currentChapterIndex];

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      stopSpeaking();
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (story && currentChapterIndex < story.chapters.length - 1) {
      stopSpeaking();
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  // Function to handle advancing to the next chapter
  const advanceToNextChapter = () => {
    if (story && currentChapterIndex < story.chapters.length - 1) {
      // Small delay to let the UI update first
      setTimeout(() => {
        setCurrentChapterIndex(prevIndex => prevIndex + 1);
        // Auto-start speaking for the next chapter
        setTimeout(() => {
          startSpeaking();
        }, 500);
      }, 500);
    }
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  const startSpeaking = () => {
    if (currentChapter) {
      // Get the appropriate language locale for speech
      const locale = getLocaleForSpeech();

      // First stop any ongoing speech
      Speech.stop().then(() => {
        // Check if speech is available
        Speech.isSpeakingAsync().then(() => {
          setIsSpeaking(true);
          setIsPaused(false);

          if (Platform.OS !== 'web') {
            // For iOS/Android, we need to handle the speech options more carefully
            const speechOptions = {
              language: locale,
              rate: Platform.OS === 'ios' ? preferences.speechSettings.rate * 0.7 : preferences.speechSettings.rate, // iOS rate needs adjustment
              pitch: preferences.speechSettings.pitch,
              onDone: () => {
                setIsSpeaking(false);
                setReadingProgress(1);

                if (story && currentChapterIndex < story.chapters.length - 1) {
                  advanceToNextChapter();
                }
              },
              onError: (error: any) => {
                console.error('Speech error:', error);
                setIsSpeaking(false);
              },
              onStopped: () => {
                setIsSpeaking(false);
              }
            };

            Speech.speak(currentChapter.content, speechOptions);
          } else {
            // For web, we'll just simulate speech with a timeout
            const simulatedReadingTime = currentChapter.content.length * 50; // Rough approximation

            // Start progress animation
            let startTime = Date.now();
            const updateProgress = () => {
              if (!isSpeaking) return;

              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / simulatedReadingTime, 1);
              setReadingProgress(progress);

              if (progress < 1) {
                requestAnimationFrame(updateProgress);
              } else {
                setIsSpeaking(false);
                setReadingProgress(1);

                // When reading completes, advance to next chapter after a delay
                if (story && currentChapterIndex < story.chapters.length - 1) {
                  advanceToNextChapter();
                }
              }
            };

            updateProgress();
          }
        }).catch(error => {
          console.error('Speech not available:', error);
          if (Platform.OS === 'ios') {
            Alert.alert(
              'Speech Error',
              'Text-to-speech is not available. Please check your device settings.'
            );
          }
        });
      });
    }
  };

  const pauseSpeaking = () => {
    setIsSpeaking(false);
    setIsPaused(true);
    if (Platform.OS !== 'web') {
      Speech.pause();
    }
  };

  const resumeSpeaking = () => {
    setIsSpeaking(true);
    setIsPaused(false);
    if (Platform.OS !== 'web') {
      Speech.resume();
    }
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
    setIsPaused(false);
    if (Platform.OS !== 'web') {
      Speech.stop();
    }
    setReadingProgress(0);
  };

  const togglePlayPause = () => {
    if (isSpeaking) {
      pauseSpeaking();
    } else if (isPaused) {
      resumeSpeaking();
    } else {
      startSpeaking();
    }
  };

  const resetReading = () => {
    stopSpeaking();
    setReadingProgress(0);
  };

  if (!story || !currentChapter) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <Text style={[styles.loadingText, { color: colors.primary }]}>{t.loadingStory}</Text>
          <View style={styles.loadingIndicator}>
            <Sparkles size={24} color={colors.primary} />
          </View>
        </Animatable.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.navBar, colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/library')} style={[styles.backButton, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Animatable.Text
              animation="fadeIn"
              style={[styles.storyTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {story.title}
            </Animatable.Text>
            <Animatable.Text
              animation="fadeIn"
              delay={300}
              style={[styles.chapterIndicator, { color: colors.secondaryText }]}
            >
              {t.chapter} {currentChapterIndex + 1} {t.of} {story.chapters.length}
            </Animatable.Text>
          </View>

          <View style={styles.controlButtons}>
            {/* Favorite button */}
            <TouchableOpacity
              onPress={toggleFavorite}
              style={[styles.controlButton, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}
            >
              <Animatable.View animation={favorite ? "pulse" : undefined} iterationCount="infinite">
                <Heart
                  size={22}
                  color="#ff3b30"
                  fill={favorite ? "#ff3b30" : "transparent"}
                />
              </Animatable.View>
            </TouchableOpacity>

            {/* Start/Stop button */}
            <TouchableOpacity
              onPress={isSpeaking || isPaused ? stopSpeaking : startSpeaking}
              style={[styles.controlButton, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}
            >
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                {isSpeaking || isPaused ? (
                  <Volume2Off size={22} color={colors.primary} />
                ) : (
                  <Volume2 size={22} color={colors.primary} />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Pause/Resume button */}
            <TouchableOpacity
              onPress={togglePlayPause}
              style={[
                styles.controlButton,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  opacity: !isSpeaking && !isPaused ? 0.5 : 1
                }
              ]}
              disabled={!isSpeaking && !isPaused}
            >
              <Animated.View>
                {isSpeaking ? (
                  <Pause size={22} color={colors.primary} />
                ) : (
                  <Play size={22} color={colors.primary} />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reading progress indicator */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.primaryLight,
                width: `${readingProgress * 100}%`
              }
            ]}
          />
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <ChapterView
          title={currentChapter.title}
          content={currentChapter.content}
          imageUrl={currentChapter.image}
        />
        {/* Add extra bottom padding to avoid content being cut off by navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LinearGradient
        colors={[colors.background, colors.navBar]}
        style={styles.navigationContainer}
      >
        <View style={styles.navigation}>
          <Animatable.View animation="bounceIn" delay={200}>
            <TouchableOpacity
              onPress={handlePrevChapter}
              style={[
                styles.navButton,
                { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
                currentChapterIndex === 0 && styles.navButtonDisabled
              ]}
              disabled={currentChapterIndex === 0}
            >
              <ChevronLeft size={24} color={currentChapterIndex === 0 ? "#ccc" : colors.primary} />
              <Text style={[
                styles.navText,
                { color: colors.primary },
                currentChapterIndex === 0 && styles.navTextDisabled
              ]}>
                {t.previous}
              </Text>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="bounceIn" delay={600}>
            <TouchableOpacity
              onPress={handleNextChapter}
              style={[
                styles.navButton,
                { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
                currentChapterIndex >= story.chapters.length - 1 && styles.navButtonDisabled
              ]}
              disabled={currentChapterIndex >= story.chapters.length - 1}
            >
              <Text style={[
                styles.navText,
                { color: colors.primary },
                currentChapterIndex >= story.chapters.length - 1 && styles.navTextDisabled
              ]}>
                {t.next}
              </Text>
              <ChevronRight
                size={24}
                color={currentChapterIndex >= story.chapters.length - 1 ? "#ccc" : colors.primary}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  chapterIndicator: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  bottomSpacer: {
    height: 50, // Add extra space at the bottom to avoid navigation overlap
  },
  navigationContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(240, 240, 240, 0.5)',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
  },
  navButtonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  navText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  navTextDisabled: {
    color: '#ccc',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 100,
  },
  loadingIndicator: {
    alignItems: 'center',
    marginTop: 20,
  },
});