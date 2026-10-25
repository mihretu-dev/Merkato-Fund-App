/**
 * Merkato Fund — Onboarding Screen
 *
 * 4-Slide interactive swipeable onboarding experience:
 * - Slide 1: Community Savings (The 4-Model Hybrid Financial Engine)
 * - Slide 2: Daily 50 ETB Equb (50 Birr: Two Worlds & micro-contributions)
 * - Slide 3: Transparent Algorithmic Draws (4-Step Process & cryptographic verification)
 * - Slide 4: 1,000,000 ETB Escrow Vault (1M ETB balance, ACT/365 yield & Winner's Buffer)
 *
 * Features:
 * - High-resolution authentic Merkato Fund infographics
 * - Official Merkato Fund emblem logo
 * - Horizontal swipeable carousel with pagingEnabled
 * - Interactive pagination dots (tap to jump)
 * - Dynamic CTA ("Next →" vs "Get Started →")
 * - Top "Skip" ("ዝለል") button with guaranteed unclipped layout
 * - Instant language toggle (English / አማርኛ)
 * - Full Dark & Light theme compliance
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { AppButton, MerkatoLogo, MerkatoBrandModal } from '@/src/components/ui';
import { useUserStore } from '@/src/stores/useUserStore';
import { useTranslation } from '@/src/i18n/useTranslation';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, setThemePreference } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const setHasCompletedOnboarding = useUserStore((s) => s.setHasCompletedOnboarding);
  const { t, language, setLanguage } = useTranslation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const handleGetStarted = () => {
    setHasCompletedOnboarding(true);
    router.replace('/persona-select');
  };

  const handleNext = () => {
    if (activeIndex < 3) {
      const nextIdx = activeIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIdx * windowWidth, animated: true });
      setActiveIndex(nextIdx);
    } else {
      handleGetStarted();
    }
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * windowWidth, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / windowWidth);
    if (index >= 0 && index <= 3 && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const slideImages = [
    require('@/assets/images/onboarding/slide_0_hybrid.png'),
    require('@/assets/images/onboarding/slide_1_habit.png'),
    require('@/assets/images/onboarding/slide_2_draw.png'),
    require('@/assets/images/onboarding/slide_3_escrow.png'),
  ];

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 18),
        },
      ]}>
      {/* 1. Header Row: Official Brand Emblem Logo, Theme Toggle, Lang Switcher & Skip Button */}
      <View style={styles.topHeaderRow}>
        <View style={styles.brandRowLeft}>
          <MerkatoLogo
            size={38}
            rounded={true}
            showBorder={true}
            onPress={() => setShowBrandModal(true)}
          />
          <View style={styles.brandTextContainer}>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {t.common.brandName}
            </Text>
            <Text style={[styles.brandTagline, { color: theme.textSecondary }]} numberOfLines={1}>
              {t.common.brandTagline}
            </Text>
          </View>
        </View>

        <View style={styles.topHeaderRight}>
          {/* Quick Tiny Dark/Light Mode Selector */}
          <TouchableOpacity
            style={[
              styles.themeMiniPill,
              {
                backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                borderColor: theme.surfaceBorder,
              },
            ]}
            onPress={() => setThemePreference(isDark ? 'light' : 'dark')}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
            <Text style={styles.themeMiniIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          {/* Quick Language Toggle Pill */}
          <TouchableOpacity
            style={[
              styles.langPill,
              {
                backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                borderColor: theme.surfaceBorder,
              },
            ]}
            onPress={() => setLanguage(language === 'en' ? 'am' : 'en')}
            accessibilityRole="button"
            accessibilityLabel="Switch language">
            <Text style={[styles.langPillText, { color: theme.textPrimary }]}>
              {language === 'en' ? 'አማርኛ 🇪🇹' : 'English 🇬🇧'}
            </Text>
          </TouchableOpacity>

          {/* Skip Button - Always displays full text with unconstrained width */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleGetStarted}
            accessibilityRole="button"
            accessibilityLabel={language === 'am' ? 'ዝለል' : 'Skip onboarding'}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>
              {language === 'am' ? 'ዝለል' : t.common.skip}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Swipeable 4-Page Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carouselScrollView}
        contentContainerStyle={styles.carouselContentContainer}>
        {/* Slide 0: Community Savings & Hybrid Ecosystem */}
        <View style={[styles.slidePage, { width: windowWidth }]}>
          <View style={styles.heroIllustrationContainer}>
            <View
              style={[
                styles.illustrationCard,
                {
                  backgroundColor: isDark ? '#111C28' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}>
              <Image
                source={slideImages[0]}
                style={styles.illustrationImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.copyContainer}>
            <View
              style={[
                styles.slideBadge,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.12)' },
              ]}>
              <Text style={[styles.slideBadgeText, { color: theme.primary }]}>
                {t.onboarding.slides[0].badge}
              </Text>
            </View>
            <Text style={[styles.headline, { color: theme.textPrimary }]}>
              {t.onboarding.slides[0].title}
            </Text>
            <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
              {t.onboarding.slides[0].subtitle}
            </Text>
          </View>
        </View>

        {/* Slide 1: Daily 50 ETB Equb Savings */}
        <View style={[styles.slidePage, { width: windowWidth }]}>
          <View style={styles.heroIllustrationContainer}>
            <View
              style={[
                styles.illustrationCard,
                {
                  backgroundColor: isDark ? '#111C28' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}>
              <Image
                source={slideImages[1]}
                style={styles.illustrationImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.copyContainer}>
            <View
              style={[
                styles.slideBadge,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.12)' },
              ]}>
              <Text style={[styles.slideBadgeText, { color: theme.primary }]}>
                {t.onboarding.slides[1].badge}
              </Text>
            </View>
            <Text style={[styles.headline, { color: theme.textPrimary }]}>
              {t.onboarding.slides[1].title}
            </Text>
            <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
              {t.onboarding.slides[1].subtitle}
            </Text>
          </View>
        </View>

        {/* Slide 2: Transparent Algorithmic Draws */}
        <View style={[styles.slidePage, { width: windowWidth }]}>
          <View style={styles.heroIllustrationContainer}>
            <View
              style={[
                styles.illustrationCard,
                {
                  backgroundColor: isDark ? '#111C28' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}>
              <Image
                source={slideImages[2]}
                style={styles.illustrationImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.copyContainer}>
            <View
              style={[
                styles.slideBadge,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.12)' },
              ]}>
              <Text style={[styles.slideBadgeText, { color: theme.primary }]}>
                {t.onboarding.slides[2].badge}
              </Text>
            </View>
            <Text style={[styles.headline, { color: theme.textPrimary }]}>
              {t.onboarding.slides[2].title}
            </Text>
            <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
              {t.onboarding.slides[2].subtitle}
            </Text>
          </View>
        </View>

        {/* Slide 3: 1,000,000 ETB Escrow Vault */}
        <View style={[styles.slidePage, { width: windowWidth }]}>
          <View style={styles.heroIllustrationContainer}>
            <View
              style={[
                styles.illustrationCard,
                {
                  backgroundColor: isDark ? '#111C28' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}>
              <Image
                source={slideImages[3]}
                style={styles.illustrationImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.copyContainer}>
            <View
              style={[
                styles.slideBadge,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.12)' },
              ]}>
              <Text style={[styles.slideBadgeText, { color: theme.primary }]}>
                {t.onboarding.slides[3].badge}
              </Text>
            </View>
            <Text style={[styles.headline, { color: theme.textPrimary }]}>
              {t.onboarding.slides[3].title}
            </Text>
            <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
              {t.onboarding.slides[3].subtitle}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 3. Bottom Controls: Interactive Pagination Dots & CTA Buttons */}
      <View style={styles.actionsContainer}>
        {/* Pagination Dots (4 dots, active dot is elongated pill, tappable) */}
        <View style={styles.paginationDotsRow}>
          {[0, 1, 2, 3].map((index) => {
            const isActive = activeIndex === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Go to onboarding page ${index + 1}`}>
                <View
                  style={[
                    styles.dot,
                    isActive && styles.dotActive,
                    {
                      backgroundColor: isActive
                        ? theme.primary
                        : isDark
                        ? '#334155'
                        : '#CBD5E1',
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary CTA (Changes from "Next →" on slides 0..2 to "Get Started →" on slide 3) */}
        <AppButton
          title={activeIndex === 3 ? t.onboarding.getStarted : t.onboarding.nextSlide}
          variant="primary"
          onPress={handleNext}
          style={styles.ctaButton}
        />

        {/* Sign In Alternative Link */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleGetStarted}
          accessibilityRole="button"
          accessibilityLabel="Choose demo persona or sign in">
          <Text style={[styles.signInText, { color: theme.textSecondary }]}>
            {t.onboarding.alreadyAccount}{' '}
            <Text style={[styles.signInHighlight, { color: theme.primary }]}>
              {t.onboarding.signIn}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Merkato Brand Profile Modal */}
      <MerkatoBrandModal
        visible={showBrandModal}
        onClose={() => setShowBrandModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topHeaderRow: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 6,
  },
  brandTextContainer: {
    flexShrink: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  themeMiniPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeMiniIcon: {
    fontSize: 14,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  carouselScrollView: {
    flex: 1,
    width: '100%',
  },
  carouselContentContainer: {
    alignItems: 'center',
  },
  slidePage: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  heroIllustrationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  illustrationCard: {
    width: '100%',
    height: 205,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  copyContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  slideBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  slideBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 31,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subheadline: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  actionsContainer: {
    width: '100%',
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
    borderRadius: 4,
  },
  ctaButton: {
    width: '100%',
    minHeight: 52,
  },
  signInButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  signInText: {
    fontSize: 13,
    fontWeight: '500',
  },
  signInHighlight: {
    fontWeight: '700',
  },
});
