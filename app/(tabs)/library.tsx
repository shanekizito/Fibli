import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard as Edit2, Trash2, BookOpen, Sparkles, Share } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import StoryCard from '@/components/StoryCard';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { TStoryGist } from '@/types';
import { getGists, deleteStory, addInvitedStory } from '@/services/supabase';
import * as Clipboard from 'expo-clipboard';
import { getUserId } from '@/services/getUserId';

export default function LibraryScreen() {
  const { t, getLocaleForSpeech } = useLanguage();
  const { colors } = useTheme();
  const [loadingGists, setLoadingGists] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [gists, setGists] = useState<TStoryGist[]>([]);
  const [animationKey, setAnimationKey] = useState(0);
  const [previewGist, setPreviewGist] = useState<TStoryGist | null>(null);
  const router = useRouter();
  const { error, success } = useLocalSearchParams<{ error?: string, success?: string }>();

  useFocusEffect(
    useCallback(() => {
      if (error) {
        if (Platform.OS === 'web') {
          if (error === 'alreadyExists') {
            alert(t.storyAlreadyExists);
          } else if (error === 'storyNotFound') {
            alert(t.storyNotFound);
          } else {
            alert(error);
          }
        } else {
          if (error === 'alreadyExists') {
            Alert.alert(t.error, t.storyAlreadyExists);
          } else if (error === 'storyNotFound') {
            Alert.alert(t.error, t.storyNotFound);
          } else {
            Alert.alert(t.error, error);
          }
        }
        router.replace({ pathname: '/library' });
      }
    }, [error])
  );

  useFocusEffect(
    useCallback(() => {
      if (success) {
        if (Platform.OS === 'web') {
          if (success === 'storyAdded') { 
            alert(t.storyAdded);
          } else {
            alert(success);
          }
        } else {
          if (success === 'storyAdded') {
            Alert.alert(t.success, t.storyAdded);
          } else {
            Alert.alert(t.success, success);
          }
        }
        router.replace({ pathname: '/library' });
      }
    }, [success])
  );

  // Refresh animation when stories change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [gists.length]);

  useEffect(() => {
    getUserId(setUserId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const getAllGists = async () => {
        if (!userId) return;
        try {
          setLoadingGists(true);
          const gists = await getGists(userId);
          setGists(gists);
        } catch (error) {
          console.error('Error getting gists:', error);
        } finally {
          setLoadingGists(false);
        }
      };
      getAllGists();
    }, [userId])
  );

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      if (Platform.OS === 'web') {
        const confirm = window.confirm(t.deleteConfirmation);
        console.log('confirm', confirm);
        if (!confirm) return;
        setGists(gists.filter(gist => gist.story_id !== id));
        await deleteStory(id);
      } else {
        Alert.alert(t.deleteConfirmation, t.deleteConfirmationMessage, [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.delete, style: 'destructive', onPress: async () => {
              setGists(gists.filter(gist => gist.story_id !== id));
              await deleteStory(id);
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleShare = async (gistId: string) => {
    try {
      const inviteUrl = `https://fibli.app/story/${gistId}`;
      await Clipboard.setStringAsync(inviteUrl);

      if (Platform.OS === 'web') {
        alert(t.urlCopied || 'Invite link copied to clipboard!');
      } else {
        Alert.alert(
          t.shareSuccess || 'Success',
          t.urlCopied || 'Invite link copied to clipboard!'
        );
      }
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const handleAddToLibrary = async (gist_id: string) => {
    try {
      if (!previewGist) return;

      // Add the new story to the library
      console.log('userId', userId);
      await addInvitedStory({ gist_id, user_id: userId! });
      setGists(prev => [previewGist, ...prev]);

      setPreviewGist(null);

      if (Platform.OS === 'web') {
        alert(t.storyAdded || 'Story added to your library!');
      } else {
        Alert.alert(t.success || 'Success', t.storyAdded || 'Story added to your library!');
      }
    } catch (error) {
      console.error('Error adding story to library:', error);
      if (Platform.OS === 'web') {
        alert(t.errorAddingStory || 'Error adding story to library. Please try again.');
      } else {
        Alert.alert(t.error || 'Error', t.errorAddingStory || 'Error adding story to library. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(getLocaleForSpeech(), {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStoryActions = (gist: TStoryGist) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={300}
      style={[styles.storyActions, { backgroundColor: colors.card }]}
    >
      <Text style={[styles.createdDate, { color: colors.secondaryText }]}>
        {formatDate(gist.created_at!)}
      </Text>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={() => handleShare(gist.id!)}
        >
          <Share size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={() => handleEdit(gist.story_id!)}
        >
          <Edit2 size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={() => handleDelete(gist.story_id!)}
        >
          <Trash2 size={18} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

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
            <Text style={styles.title}>{t.myLibrary}</Text>
          </Animatable.View>
          <Animatable.View animation="fadeIn" delay={400}>
            <Text style={styles.subtitle}>{t.librarySubtitle}</Text>
          </Animatable.View>
          <Animatable.View animation="fadeIn" delay={800} style={styles.headerActions}>
            <View style={styles.headerIcon}>
              <Sparkles size={24} color="#fff" />
            </View>
          </Animatable.View>
        </View>
      </LinearGradient>

      {loadingGists ? (
        <Animatable.View
          animation="fadeIn"
          duration={800}
          style={styles.loadingContainer}
        >
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            {t.loadingStory}
          </Text>
        </Animatable.View>
      ) : (
        <FlatList
          data={gists}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Animatable.View
              key={`story-${animationKey}-${item.id}`}
              animation="fadeInUp"
              duration={600}
              delay={index * 150}
              style={styles.storyContainer}
            >
              <StoryCard
                story_id={item.story_id!}
                title={item.title}
                coverImage={item.image}
                chaptersCount={item.chapters.length}
                readingTime={item.length}
                ageRange={item.age_range}
                mood={item.mood}
                isEdited={item.isEdited}
                isInvited={item.invited}
              />
              {renderStoryActions(item)}
            </Animatable.View>
          )}
          ListEmptyComponent={
            <Animatable.View
              animation="fadeIn"
              duration={1000}
              style={styles.emptyContainer}
            >
              <BookOpen size={64} color={colors.primaryLight} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                {t.emptyLibrary}
              </Text>
            </Animatable.View>
          }
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 20,
  },
  headerIcon: {
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom
  },
  storyContainer: {
    marginBottom: 20,
  },
  storyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
  },
  createdDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 50,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '45%',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  previewContainer: {
    width: '100%',
    marginBottom: 16,
  },
  previewCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewDetails: {
    padding: 16,
  },
  previewLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 6,
  },
  previewText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  previewMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metadataLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginRight: 4,
  },
  metadataValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});