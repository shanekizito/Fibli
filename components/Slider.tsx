import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { useTheme } from '@/context/ThemeContext';

type CustomSliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  trackColor?: { false: string; true: string };
  thumbTintColor?: string;
};

const Slider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.1,
  trackColor = { false: '#d8d8d8', true: '#a87cff' },
  thumbTintColor = '#5e17eb',
}) => {
  const { colors } = useTheme();
  
  const defaultTrackColor = { 
    false: colors.cardBorder, 
    true: colors.primaryLight 
  };
  
  const actualTrackColor = {
    false: trackColor.false || defaultTrackColor.false,
    true: trackColor.true || defaultTrackColor.true
  };
  
  const actualThumbColor = thumbTintColor || colors.primary;
  
  if (Platform.OS === 'web') {
    // Web implementation using HTML input range
    return (
      <View style={styles.container}>
        <input
          type="range"
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          min={minimumValue}
          max={maximumValue}
          step={step}
          style={{
            width: '100%',
            height: 40,
            accentColor: actualTrackColor.true,
          }}
        />
      </View>
    );
  }
  
  // Native implementation using @react-native-community/slider
  return (
    <View style={styles.container}>
      <RNSlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={actualTrackColor.true}
        maximumTrackTintColor={actualTrackColor.false}
        thumbTintColor={actualThumbColor}
        style={styles.slider}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default Slider;