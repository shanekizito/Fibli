import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { Play, Star, Sparkles, ArrowRight, Magnet as Magic } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { StorySettings } from '@/context/UserPreferencesContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

type GistViewProps = {
  title: string;
  preview: string;
  coverImage: string;
  settings: StorySettings;
  isStoryGenerating: boolean;
  onStartGeneration: () => void;
  onCancelGeneration?: () => void;
};

export default function GistView({
  title,
  preview,
  coverImage,
  settings,
  onStartGeneration,
  onCancelGeneration,
  isStoryGenerating
}: GistViewProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create pulsing animation for the start button
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // If story is generating, show loading screen
  if (isStoryGenerating) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={[styles.loadingImageContainer, { shadowColor: colors.primary }]}
        >
          <Image
            source={{ uri: coverImage }}
            style={styles.loadingImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.loadingOverlay}
          />

          {/* Floating elements */}
          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            duration={2000}
            style={[styles.floatingElement, styles.topRight]}
          >
            <Sparkles size={24} color="#fff" />
          </Animatable.View>

          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            duration={2500}
            delay={300}
            style={[styles.floatingElement, styles.bottomLeft]}
          >
            <Star size={24} color="#fff" fill="#fff" />
          </Animatable.View>

          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            duration={3000}
            delay={600}
            style={[styles.floatingElement, styles.topLeft]}
          >
            <Magic size={24} color="#fff" />
          </Animatable.View>
        </Animatable.View>

        <Animatable.View
          animation="fadeIn"
          duration={1000}
          style={styles.loadingTextContainer}
        >
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingSpinner}
          />
          <Animatable.Text
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            style={[styles.loadingText, { color: colors.primary }]}
          >
            {t.generatingStory}
          </Animatable.Text>
          <Text style={[styles.loadingSubtext, { color: colors.secondaryText }]}>
            {title}
          </Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animatable.View
        animation="fadeIn"
        duration={1000}
        style={[styles.imageContainer, { shadowColor: colors.primary }]}
      >
        <Image source={{ uri: coverImage }} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />

        {/* Animated magic elements */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={[styles.decoration, styles.decoration1]}
        >
          <Sparkles size={24} color="#fff" />
        </Animatable.View>

        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2500}
          delay={300}
          style={[styles.decoration, styles.decoration2]}
        >
          <Star size={20} color="#fff" fill="#fff" />
        </Animatable.View>

        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={3000}
          delay={600}
          style={[styles.decoration, styles.decoration3]}
        >
          <Magic size={18} color="#fff" />
        </Animatable.View>

        <Animatable.Text
          animation="fadeIn"
          duration={1200}
          delay={300}
          style={styles.title}
        >
          {title}
        </Animatable.Text>
      </Animatable.View>

      <Animatable.View
        animation="fadeInUp"
        duration={800}
        delay={500}
        style={[styles.gistContainer, {
          backgroundColor: colors.card,
          shadowColor: colors.primary
        }]}
      >
        <View style={styles.gistHeader}>
          <Text style={[styles.gistTitle, { color: colors.primary }]}>{t.storyPreview}</Text>
          <Sparkles size={18} color={colors.primary} />
        </View>
        <Text style={[styles.gistContent, { color: colors.text }]}>{preview}</Text>
      </Animatable.View>

      <Animatable.View
        animation="fadeInUp"
        duration={800}
        delay={800}
        style={[styles.settingsContainer, {
          backgroundColor: colors.card,
          shadowColor: colors.primary
        }]}
      >
        <Animatable.View animation="fadeIn" delay={1000} style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.secondaryText }]}>{t.storyLength}</Text>
            <ArrowRight size={12} color={colors.secondaryText} />
          </View>
          <LinearGradient
            colors={[colors.primary, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.settingValue}
          >
            <Text style={styles.settingValueText}>{t[settings.length]}</Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={1200} style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.secondaryText }]}>{t.ageRange}</Text>
            <ArrowRight size={12} color={colors.secondaryText} />
          </View>
          <LinearGradient
            colors={[colors.primary, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.settingValue}
          >
            <Text style={styles.settingValueText}>{settings.ageRange} {t.years}</Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={1400} style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.secondaryText }]}>{t.storyMood}</Text>
            <ArrowRight size={12} color={colors.secondaryText} />
          </View>
          <LinearGradient
            colors={[colors.primary, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.settingValue}
          >
            <Text style={styles.settingValueText}>{t[settings.mood]}</Text>
          </LinearGradient>
        </Animatable.View>
      </Animatable.View>

      <Animatable.View
        animation="fadeInUp"
        duration={800}
        delay={1600}
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.cancelButtonContainer, { shadowColor: colors.secondaryText, flex: 1 }]}
            onPress={() => onCancelGeneration?.()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF4757']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>{t.cancel}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonContainer, { shadowColor: colors.primary, flex: 2 }]}
            onPress={onStartGeneration}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                  <Play size={24} color="#fff" style={styles.buttonIcon} />
                </Animatable.View>
                <Text style={styles.buttonText}>{t.startGeneration}</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  decoration: {
    position: 'absolute',
  },
  decoration1: {
    top: 20,
    right: 20,
  },
  decoration2: {
    bottom: 60,
    right: 40,
  },
  decoration3: {
    top: 60,
    left: 20,
  },
  title: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: '#fff',
    fontSize: 32,
    fontFamily: 'LuckiestGuy-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  gistContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gistTitle: {
    fontSize: 20,
    fontFamily: 'LuckiestGuy-Regular',
    marginRight: 10,
  },
  gistContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  settingsContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
  settingValue: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  settingValueText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  buttonContainer: {
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    height: 60,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingImageContainer: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  loadingImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingTextContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  floatingElement: {
    position: 'absolute',
    zIndex: 2,
  },
  topRight: {
    top: 20,
    right: 20,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
  },
  topLeft: {
    top: 20,
    left: 20,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 24,
    fontFamily: 'LuckiestGuy-Regular',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingSubtext: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cancelButtonContainer: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    height: 60,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});