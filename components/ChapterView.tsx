import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Star, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

type ChapterViewProps = {
  title: string;
  content: string;
  imageUrl: string;
};

const { width } = Dimensions.get('window');

export default function ChapterView({ title, content, imageUrl }: ChapterViewProps) {
  const { colors } = useTheme();
  
  // Split content into paragraphs for animation
  const paragraphs = content.split('\n\n');

  return (
    <View style={styles.container}>
      <Animatable.Text 
        animation="fadeIn" 
        duration={1000} 
        style={[styles.chapterTitle, { color: colors.primary }]}
      >
        <Sparkles size={24} color={colors.primary} style={{marginRight: 8}} />
        {title}
      </Animatable.Text>

      <Animatable.View 
        animation="fadeIn" 
        duration={1200}
        delay={300}
        style={[styles.imageContainer, { borderColor: colors.primaryLight }]}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
        
        {/* Decorative stars around image */}
        <View style={styles.decorations}>
          <Animatable.View animation="pulse" iterationCount="infinite" style={[styles.star, styles.star1]}>
            <Star size={18} color="#FFD700" fill="#FFD700" />
          </Animatable.View>
          <Animatable.View animation="pulse" iterationCount="infinite" delay={400} style={[styles.star, styles.star2]}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
          </Animatable.View>
          <Animatable.View animation="pulse" iterationCount="infinite" delay={800} style={[styles.star, styles.star3]}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
          </Animatable.View>
        </View>
      </Animatable.View>

      {paragraphs.map((paragraph, index) => (
        <Animatable.Text 
          key={index}
          animation="fadeIn" 
          duration={800}
          delay={600 + (index * 150)}
          style={[styles.content, { color: colors.text }]}
        >
          {paragraph}
          {index < paragraphs.length - 1 && '\n\n'}
        </Animatable.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  chapterTitle: {
    fontSize: 26,
    fontFamily: 'LuckiestGuy-Regular',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(94, 23, 235, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  imageContainer: {
    width: width - 32,
    height: width * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: 3,
    elevation: 8,
    shadowColor: '#5e17eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    lineHeight: 28,
  },
  decorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: 10,
    right: 15,
  },
  star2: {
    bottom: 15,
    right: 25,
  },
  star3: {
    top: 45,
    left: 15,
  },
});