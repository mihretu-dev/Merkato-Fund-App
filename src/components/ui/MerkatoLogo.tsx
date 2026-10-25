/**
 * Merkato Fund — Official Brand Emblem Logo Component
 *
 * Displays the authentic Merkato Fund emblem (gold scales, seed money bags,
 * reaching community figures, and tagline "No more pay-to-get. Just get-to-pay.")
 * with polished styling for both light and dark themes.
 */

import React from 'react';
import { StyleSheet, View, Image, StyleProp, ViewStyle, ImageStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme/tokens';

export interface MerkatoLogoProps {
  size?: number;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  showBorder?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function MerkatoLogo({
  size = 40,
  rounded = true,
  style,
  imageStyle,
  showBorder = true,
  onPress,
  accessibilityLabel = 'Merkato Fund Official Logo',
}: MerkatoLogoProps) {
  const { theme, isDark } = useTheme();

  const borderRadius = rounded ? Math.round(size * 0.22) : 0;

  const content = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: isDark ? '#1C1917' : '#F5EEDB',
          borderColor: showBorder ? (isDark ? '#44403C' : '#D6C7A1') : 'transparent',
          borderWidth: showBorder ? 1 : 0,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}>
      <Image
        source={require('@/assets/images/merkato_logo.png')}
        style={[
          styles.image,
          {
            width: size - (showBorder ? 4 : 0),
            height: size - (showBorder ? 4 : 0),
            borderRadius: rounded ? borderRadius - 2 : 0,
          },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} - View company profile`}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    overflow: 'hidden',
  },
});
