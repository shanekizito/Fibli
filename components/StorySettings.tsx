import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ArrowRight, Clock, Users, SunMoon, Sparkles, Star } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { StorySettings as Settings } from '@/context/UserPreferencesContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

type StorySettingsProps = {
  title: string;
  initialSettings: Settings;
  onSubmit: (settings: Settings) => void;
};

const { width } = Dimensions.get('window');

export default function StorySettings({ title, initialSettings, onSubmit }: StorySettingsProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [settings, setSettings] = useState<Settings>(initialSettings);
  
  const handleLengthSelect = (length: Settings['length']) => {
    setSettings(prev => ({ ...prev, length }));
  };
  
  const handleAgeRangeSelect = (ageRange: Settings['ageRange']) => {
    setSettings(prev => ({ ...prev, ageRange }));
  };
  
  const handleMoodSelect = (mood: Settings['mood']) => {
    setSettings(prev => ({ ...prev, mood }));
  };

  const getLengthIcon = (length: string) => {
    return (
      <Animatable.View 
        animation={settings.length === length ? "pulse" : undefined}
        iterationCount={settings.length === length ? "infinite" : undefined}
        duration={2000}
      >
        <Clock 
          size={20} 
          color={settings.length === length ? colors.primary : colors.secondaryText} 
        />
      </Animatable.View>
    );
  };

  const getAgeIcon = (age: string) => {
    return (
      <Animatable.View 
        animation={settings.ageRange === age ? "pulse" : undefined}
        iterationCount={settings.ageRange === age ? "infinite" : undefined}
        duration={2000}
      >
        <Users 
          size={18} 
          color={settings.ageRange === age ? colors.primary : colors.secondaryText} 
        />
      </Animatable.View>
    );
  };

  const getMoodIcon = (mood: Settings['mood']) => {
    const icons: Record<Settings['mood'], React.ReactNode> = {
      'happy': <Star size={16} color={settings.mood === 'happy' ? colors.primary : colors.secondaryText} />,
      'adventurous': <ArrowRight size={16} color={settings.mood === 'adventurous' ? colors.primary : colors.secondaryText} />,
      'educational': <Users size={16} color={settings.mood === 'educational' ? colors.primary : colors.secondaryText} />,
      'calming': <SunMoon size={16} color={settings.mood === 'calming' ? colors.primary : colors.secondaryText} />,
      'magical': <Sparkles size={16} color={settings.mood === 'magical' ? colors.primary : colors.secondaryText} />
    };
    
    return (
      <Animatable.View 
        animation={settings.mood === mood ? "pulse" : undefined}
        iterationCount={settings.mood === mood ? "infinite" : undefined}
        duration={2000}
      >
        {icons[mood]}
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="fadeIn" 
        duration={800}
        style={styles.header}
      >
        <Animatable.Text 
          animation="bounceIn" 
          duration={1200}
          style={[styles.title, { color: colors.primary }]}
        >
          {title}
        </Animatable.Text>
        <Animatable.Text 
          animation="fadeIn" 
          delay={400}
          style={[styles.subtitle, { color: colors.secondaryText }]}
        >
          {t.storySettings}
        </Animatable.Text>
      </Animatable.View>
      
      <Animatable.View 
        animation="fadeInUp" 
        duration={600}
        delay={500}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.storyLength}</Text>
        <View style={styles.optionsGrid}>
          <Animatable.View animation="bounceIn" delay={600} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: colors.card },
                settings.length === 'short' && [
                  styles.selectedOption, 
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                ]
              ]}
              onPress={() => handleLengthSelect('short')}
            >
              {getLengthIcon('short')}
              <Text 
                style={[
                  styles.optionText,
                  { color: colors.text },
                  settings.length === 'short' && [
                    styles.selectedOptionText, 
                    { color: colors.primary }
                  ]
                ]}
              >
                {t.short}
              </Text>
              <Text style={[styles.optionDescription, { color: colors.secondaryText }]}>3-5 {t.min}</Text>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View animation="bounceIn" delay={700} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: colors.card },
                settings.length === 'medium' && [
                  styles.selectedOption, 
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                ]
              ]}
              onPress={() => handleLengthSelect('medium')}
            >
              {getLengthIcon('medium')}
              <Text 
                style={[
                  styles.optionText,
                  { color: colors.text },
                  settings.length === 'medium' && [
                    styles.selectedOptionText, 
                    { color: colors.primary }
                  ]
                ]}
              >
                {t.medium}
              </Text>
              <Text style={[styles.optionDescription, { color: colors.secondaryText }]}>8-10 {t.min}</Text>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View animation="bounceIn" delay={800} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: colors.card },
                settings.length === 'long' && [
                  styles.selectedOption, 
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                ]
              ]}
              onPress={() => handleLengthSelect('long')}
            >
              {getLengthIcon('long')}
              <Text 
                style={[
                  styles.optionText,
                  { color: colors.text },
                  settings.length === 'long' && [
                    styles.selectedOptionText, 
                    { color: colors.primary }
                  ]
                ]}
              >
                {t.long}
              </Text>
              <Text style={[styles.optionDescription, { color: colors.secondaryText }]}>15+ {t.min}</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Animatable.View>
      
      <Animatable.View 
        animation="fadeInUp" 
        duration={600}
        delay={900}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.ageRange}</Text>
        <View style={styles.optionsGrid}>
          <Animatable.View animation="bounceIn" delay={1000} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: colors.card },
                settings.ageRange === '3-5' && [
                  styles.selectedOption, 
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                ]
              ]}
              onPress={() => handleAgeRangeSelect('3-5')}
            >
              {getAgeIcon('3-5')}
              <Text 
                style={[
                  styles.optionText,
                  { color: colors.text },
                  settings.ageRange === '3-5' && [
                    styles.selectedOptionText, 
                    { color: colors.primary }
                  ]
                ]}
              >
                3-5{'\n'} {t.years}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View animation="bounceIn" delay={1100} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: colors.card },
                settings.ageRange === '6-8' && [
                  styles.selectedOption, 
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                ]
              ]}
              onPress={() => handleAgeRangeSelect('6-8')}
            >
              {getAgeIcon('6-8')}
              <Text 
                style={[
                  styles.optionText,
                  { color: colors.text },
                  settings.ageRange === '6-8' && [
                    styles.selectedOptionText, 
                    { color: colors.primary }
                  ]
                ]}
              >
                6-8{'\n'} {t.years}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View animation="bounceIn" delay={1200} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: colors.card },
                settings.ageRange === '9-12' && [
                  styles.selectedOption, 
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                ]
              ]}
              onPress={() => handleAgeRangeSelect('9-12')}
            >
              {getAgeIcon('9-12')}
              <Text 
                style={[
                  styles.optionText,
                  { color: colors.text },
                  settings.ageRange === '9-12' && [
                    styles.selectedOptionText, 
                    { color: colors.primary }
                  ]
                ]}
              >
                9-12{'\n'} {t.years}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Animatable.View>
      
      <Animatable.View
        animation="fadeInUp" 
        duration={600}
        delay={1300}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.storyMood}</Text>
        <View style={styles.moodContainer}>
          {(['happy', 'adventurous', 'educational', 'calming', 'magical'] as const).map((mood, index) => (
            <Animatable.View 
              key={mood}
              animation="bounceIn" 
              delay={1400 + (index * 100)}
              style={styles.moodWrapper}
            >
              <TouchableOpacity
                style={[
                  styles.moodButton,
                  { backgroundColor: colors.card },
                  settings.mood === mood && [
                    styles.selectedMood, 
                    { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                  ]
                ]}
                onPress={() => handleMoodSelect(mood)}
              >
                {getMoodIcon(mood)}
                <Text 
                  style={[
                    styles.moodText,
                    { color: colors.text },
                    settings.mood === mood && [
                      styles.selectedMoodText, 
                      { color: colors.primary }
                    ]
                  ]}
                >
                  {t[mood]}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </Animatable.View>
      
      <Animatable.View 
        animation="fadeInUp" 
        duration={600}
        delay={1800}
      >
        <TouchableOpacity 
          style={[styles.submitButton, { shadowColor: colors.primary }]} 
          onPress={() => onSubmit(settings)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>{t.next}</Text>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <ArrowRight size={20} color="#fff" />
            </Animatable.View>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'LuckiestGuy-Regular',
    marginBottom: 8,
    textShadowColor: 'rgba(94, 23, 235, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6, // Compensate for the padding in optionWrapper
  },
  optionWrapper: {
    width: '33.33%', // Each option takes up 1/3 of the container width
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  optionButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 120, // Ensure consistent height
  },
  selectedOption: {
    borderWidth: 2,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedOptionText: {},
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6, // Compensate for the padding in moodWrapper
  },
  moodWrapper: {
    width: '50%', // Each mood button takes up half of the container width
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 50, // Ensure consistent height
  },
  selectedMood: {
    borderWidth: 2,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  moodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  selectedMoodText: {},
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginRight: 8,
  },
});