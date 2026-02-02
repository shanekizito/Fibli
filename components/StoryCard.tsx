import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Book, Clock, CreditCard as Edit2, BadgePlus, Sparkles, Star } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

type StoryCardProps = {
  story_id: string;
  title: string;
  coverImage: string;
  chaptersCount: number;
  readingTime: string;
  ageRange?: string;
  mood?: string;
  isEdited?: boolean;
  isInvited?: boolean;
};

export default function StoryCard({
  story_id, 
  title, 
  coverImage, 
  chaptersCount, 
  readingTime, 
  ageRange, 
  mood, 
  isEdited,
  isInvited = false
}: StoryCardProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a pulsing animation for magical sparkle effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animatable.View
      animation="fadeIn"
      duration={800}
      delay={200}
    >
      <TouchableOpacity
        style={[styles.container, { shadowColor: colors.primary }]}
        onPress={() => router.push(`/story/${story_id}`)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: coverImage }} style={styles.coverImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />

        {/* Magical sparkles animation */}
        <Animated.View
          style={[
            styles.sparklesContainer,
            { opacity: sparkleOpacity }
          ]}
        >
          <Sparkles size={18} color="#fff" style={styles.sparkleIcon1} />
          <Sparkles size={12} color="#fff" style={styles.sparkleIcon2} />
          <Star size={10} color="#fff" style={styles.sparkleIcon3} />
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Animatable.Text
              animation="pulse"
              iterationCount={3}
              style={styles.title}
            >
              {title}
            </Animatable.Text>

            <View style={styles.badgeContainer}>
              {isInvited && (
                <Animatable.View
                  animation="bounceIn"
                  duration={1000}
                  style={[styles.badge, { backgroundColor: 'rgba(46, 204, 113, 0.8)' }]}
                >
                  <BadgePlus size={12} color="#fff" />
                  <Text style={styles.badgeText}>{t.invited || 'Invited'}</Text>
                </Animatable.View>
              )}
              
              {isEdited && (
                <Animatable.View
                  animation="bounceIn"
                  duration={1000}
                  style={[styles.badge, { backgroundColor: 'rgba(94, 23, 235, 0.8)' }]}
                >
                  <Edit2 size={12} color="#fff" />
                  <Text style={styles.badgeText}>{t.edited || 'Edited'}</Text>
                </Animatable.View>
              )}
            </View>
          </View>

          <View style={styles.details}>
            <Animatable.View
              animation="fadeIn"
              delay={300}
              style={styles.detailItem}
            >
              <Book size={16} color="#fff" />
              <Text style={styles.detailText}>{chaptersCount} {t.chapters}</Text>
            </Animatable.View>
            <Animatable.View
              animation="fadeIn"
              delay={500}
              style={styles.detailItem}
            >
              <Clock size={16} color="#fff" />
              <Text style={styles.detailText}>{t[readingTime]}</Text>
            </Animatable.View>
          </View>

          {(ageRange || mood) && (
            <View style={styles.tagsContainer}>
              {ageRange && (
                <Animatable.View
                  animation="slideInRight"
                  duration={500}
                  delay={600}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{ageRange} {t.years}</Text>
                </Animatable.View>
              )}
              {mood && (
                <Animatable.View
                  animation="slideInRight"
                  duration={500}
                  delay={800}
                  style={[styles.tag, styles.moodTag]}
                >
                  <Text style={styles.tagText}>{t[mood]}</Text>
                </Animatable.View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: 20,
    marginBottom: 0,
    overflow: 'hidden',
    elevation: 10,
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
    borderRadius: 20,
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkleIcon1: {
    position: 'absolute',
    top: '15%',
    right: '15%',
  },
  sparkleIcon2: {
    position: 'absolute',
    top: '35%',
    left: '25%',
  },
  sparkleIcon3: {
    position: 'absolute',
    bottom: '25%',
    right: '35%',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'LuckiestGuy-Regular',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  moodTag: {
    backgroundColor: 'rgba(94, 23, 235, 0.5)',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});