import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { getStory, updateStory } from '@/services/supabase';
import { TChapter, TStory } from '@/types';
import * as Animatable from 'react-native-animatable';
export default function EditStoryScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [story, setStory] = useState<TStory | null>(null);
  const [title, setTitle] = useState('');
  const [chapters, setChapters] = useState<TChapter[]>([]);

  useEffect(() => {
    const fetchStory = async () => {
      const story = await getStory(id);
      if (story) {
        setStory(story);
        setTitle(story.title);
        setChapters([...story.chapters]);
      }
    };
    fetchStory();
  }, [id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleChapterTitleChange = (index: number, newTitle: string) => {
    setChapters(prevChapters => 
      prevChapters.map((chapter, i) => 
        i === index ? { ...chapter, title: newTitle } : chapter
      )
    );
  };

  const handleChapterContentChange = (index: number, newContent: string) => {
    setChapters(prevChapters => 
      prevChapters.map((chapter, i) => 
        i === index ? { ...chapter, content: newContent } : chapter
      )
    );
  };

  const handleSave = async () => {
    try {
      if (title.trim() === '') {
        Alert.alert(t.error, t.titleCannotBeEmpty);
        return;
      }

      // Check if any chapter titles are empty
      const emptyTitleIndex = chapters.findIndex(chapter => chapter.title.trim() === '');
      if (emptyTitleIndex !== -1) {
        Alert.alert(t.error, `${t.chapter} ${emptyTitleIndex + 1} ${t.titleCannotBeEmpty}`);
        return;
      }

      await updateStory({ id, title, chapters });
      
      if (Platform.OS === 'web') {
        alert(t.storyUpdatedSuccessfully);
      } else {
        Alert.alert(t.success, t.storyUpdatedSuccessfully);
      }
    } catch (error) {
      console.error('Error updating story:', error);
      if (Platform.OS === 'web') {
        alert(t.failedToSaveChanges);
      } else {
        Alert.alert(t.error, t.failedToSaveChanges);
      }
    }
  };

  if (!story) {
    return (
      <Animatable.View
      animation="fadeIn"
      duration={800}
      style={styles.loadingContainer}
    >
      <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
        {t.loadingStory}
      </Text>
    </Animatable.View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.edit}</Text>

        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Check size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.storyTitle}</Text>
          <TextInput
            style={[
              styles.titleInput,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.card,
                color: colors.text
              }
            ]}
            value={title}
            onChangeText={handleTitleChange}
            placeholder={t.enterStoryTitle}
            placeholderTextColor={colors.secondaryText}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.chapters}</Text>

          {chapters.map((chapter, index) => (
            <View key={`chapter-${index}`} style={[styles.chapterSection, { backgroundColor: colors.card }]}>
              <Text style={[styles.chapterNumber, { color: colors.text }]}>{t.chapter} {index + 1}</Text>

              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>{t.chapterTitle}</Text>
              <TextInput
                key={`title-${index}`}
                style={[
                  styles.chapterTitleInput,
                  {
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.background,
                    color: colors.text
                  }
                ]}
                value={chapter.title}
                onChangeText={(text) => handleChapterTitleChange(index, text)}
                placeholder={t.enterChapterTitle}
                placeholderTextColor={colors.secondaryText}
              />

              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>{t.chapterContent}</Text>
              <TextInput
                key={`content-${index}`}
                style={[
                  styles.chapterContentInput,
                  {
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.background,
                    color: colors.text
                  }
                ]}
                value={chapter.content}
                onChangeText={(text) => handleChapterContentChange(index, text)}
                placeholder={t.enterChapterContent}
                placeholderTextColor={colors.secondaryText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  chapterSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chapterNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  chapterTitleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  chapterContentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
});