import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Send, Sparkles, Star as Stars } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useLanguage } from '@/context/LanguageContext';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTheme } from '@/context/ThemeContext';
import { suggestTitles } from '@/services/openai';
import { useFocusEffect } from '@react-navigation/native';
import { getUserId } from '@/services/getUserId';

type InputTitleProps = {
  onSubmit: (title: string) => void;
};

export default function InputTitle({ onSubmit }: InputTitleProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { preferences } = useUserPreferences();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [user_id, setUserId] = useState<string>('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
    }
  };

  useEffect(() => {
    getUserId(setUserId);
  }, []);

  useFocusEffect(useCallback(() => {
    const fetchSuggestedTitles = async () => {
      if (user_id) {
        setIsLoading(true);
        const titles = await suggestTitles(user_id);
        setSuggestedTitles(titles);
        setIsLoading(false);
      }
    };
    fetchSuggestedTitles();
  }, [user_id]));

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <Animatable.View
        animation="fadeInUp"
        duration={800}
        delay={400}
        style={styles.inputContainer}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={focusInput}
          style={[styles.inputWrapper]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.input, {
              borderColor: colors.primaryLight,
              backgroundColor: colors.card,
              color: colors.text
            }]}
            value={title}
            onChangeText={setTitle}
            placeholder={t.enterTitle}
            placeholderTextColor={colors.secondaryText}
          />

          <Animatable.View
            animation="fadeIn"
            delay={600}
            style={styles.inputDecoration}
          >
            <Stars size={16} color={colors.primary} style={styles.inputStar1} />
            <Stars size={14} color={colors.primary} style={styles.inputStar2} />
          </Animatable.View>
        </TouchableOpacity>

        <Animatable.View
          animation="fadeIn"
          delay={600}
          style={styles.buttonsContainer}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              !title.trim() && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!title.trim()}
            activeOpacity={0.7}
          >
            <Send size={24} color="#fff" />
          </TouchableOpacity>
        </Animatable.View>
      </Animatable.View>

      <Animatable.View
        animation="fadeIn"
        duration={800}
        delay={800}
        style={styles.examplesContainer}
      >
        <View style={styles.examplesHeader}>
          <Text style={[styles.examplesTitle, { color: colors.text }]}>{t.exampleTitle}</Text>
          <Sparkles size={18} color={colors.primary} />
        </View>

        <View style={styles.exampleChips}>
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 6 }).map((_, index) => (
              <Animatable.View
                key={index}
                animation="pulse"
                iterationCount="infinite"
                duration={1500}
              >
                <View
                  style={[
                    styles.exampleChip,
                    styles.skeletonChip,
                    { backgroundColor: colors.primaryLight + '40' }
                  ]}
                >
                  <View style={{ width: 80, height: 16 }} />
                </View>
              </Animatable.View>
            ))
          ) : (
            suggestedTitles.map((example, index) => (
              <Animatable.View
                key={index}
                animation="zoomIn"
                delay={1000 + (index * 100)}
              >
                <TouchableOpacity
                  style={[styles.exampleChip, { backgroundColor: colors.primaryLight }]}
                  onPress={() => setTitle(example)}
                >
                  <Text style={[styles.exampleText, { color: 'white' }]}>{example}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))
          )}
        </View>
      </Animatable.View>

      {preferences.favoriteThemes.length > 0 && (
        <Animatable.View
          animation="fadeIn"
          duration={800}
          delay={1200}
          style={styles.favoritesContainer}
        >
          <Text style={[styles.examplesTitle, { color: colors.text }]}>{t.yourFavorites}</Text>
          <View style={styles.exampleChips}>
            {preferences.favoriteThemes.map((theme, index) => (
              <Animatable.View
                key={index}
                animation="zoomIn"
                delay={1400 + (index * 100)}
              >
                <TouchableOpacity
                  style={[styles.exampleChip, styles.favoriteChip]}
                  onPress={() => setTitle(theme)}
                >
                  <Text style={[styles.exampleText, { color: colors.text }]}>{theme}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  titleBackground: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'LuckiestGuy-Regular',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleIcon: {
    marginLeft: 10,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
  inputDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  inputStar1: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  inputStar2: {
    position: 'absolute',
    bottom: 10,
    left: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  submitButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#5e17eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#c0c0c0',
    elevation: 0,
    shadowOpacity: 0,
  },
  examplesContainer: {
    marginTop: 24,
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  exampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exampleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#5e17eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  favoriteChip: {
    backgroundColor: '#ffe5f0',
  },
  exampleText: {
    fontFamily: 'Inter-Medium',
  },
  favoritesContainer: {
    marginTop: 24,
  },
  skeletonChip: {
    minWidth: 200,
    opacity: 0.7,
  },
});