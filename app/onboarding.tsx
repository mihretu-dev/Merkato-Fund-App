/**
 * Merkato Fund — Onboarding Carousel Screen
 *
 * 3-slide educational walkthrough introducing:
 * 1. A Different Approach to Equb (Equb + Draw + Bank Escrow + Capital Markets)
 * 2. Daily 50 ETB Contribution Model
 * 3. 1,000,000 ETB Prize, 6-Month Blocked Escrow & Post-Win Repayments
 *
 * Emphasizes that this is a simulated technology prototype evaluating marketing proposals,
 * with no real financial transactions, guaranteed payouts, or banking commitments.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii, fontFamilies } from '@/src/theme/tokens';
import { Card, AppButton, DemoBadge, DisclaimerNotice, StatusPill } from '@/src/components/ui';
import { useUserStore } from '@/src/stores/useUserStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  badge: string;
  amharicTitle: string;
  title: string;
  subtitle: string;
  bullets: Array<{
    icon: string;
    label: string;
    description: string;
    isProposedClaim?: boolean;
  }>;
  disclaimerText: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    badge: 'PILLAR 1 & 2 • CONCEPT',
    amharicTitle: 'አዲስ የዕቁብ አሠራር ጽንሰ-ሐሳብ',
    title: 'A Different Approach to Equb',
    subtitle: 'The Merkato Fund concept proposes pairing traditional Ethiopian rotating savings with algorithmic draws and institutional bank custody.',
    bullets: [
      {
        icon: '🤝',
        label: 'Social Savings (ዕቁብ) Foundation',
        description: 'Inspired by traditional community Equb, pool participants contribute small daily amounts into a shared pool.',
      },
      {
        icon: '⚡',
        label: '“Get First, Then Pay” Marketing Hook',
        description: 'Instead of waiting months for an Equb round, the marketing proposal uses daily algorithmic draws to deliver capital up front.',
        isProposedClaim: true,
      },
      {
        icon: '🏛️',
        label: '4 Structural Hybrid Pillars',
        description: 'Blends community Equb trust, algorithmic draw speed, 6-month bank escrow custody, and treasury capital yield.',
      },
    ],
    disclaimerText: 'Marketing Hypothesis: The claims of combining zero-debt lottery capital with bank security are evaluated here as a software simulation, not a certified financial vehicle.',
  },
  {
    id: 2,
    badge: 'PILLAR 3 • DAILY PARTICIPATION',
    amharicTitle: 'የ50 ብር የቀን መዋጮ ሞዴል',
    title: 'Daily 50 ETB Micro-Contribution',
    subtitle: 'Active participants contribute a proposed 50 ETB daily payment — roughly equivalent to an everyday coffee in Merkato.',
    bullets: [
      {
        icon: '☕',
        label: '50 ETB Daily Contribution',
        description: 'A manageable micro-contribution that builds the shared pool across an assumed 20,000+ member participant base.',
      },
      {
        icon: '🎟️',
        label: 'Daily Algorithmic Draw Ticket',
        description: 'Each confirmed 50 ETB daily payment issues one algorithmic entry ticket for that evening’s 20:00:00 EAT draw.',
      },
      {
        icon: '🔥',
        label: 'Gamified Payment Streak',
        description: 'Maintain consecutive daily contribution streaks to retain eligibility in subsequent daily draw cycles.',
      },
    ],
    disclaimerText: 'Simulated Only: Payment channels (Telebirr & CBE Birr) within this app are local demonstration mockups. No real money is collected or transferred.',
  },
  {
    id: 3,
    badge: 'PILLAR 4 • WINNER ESCROW & REPAYMENT',
    amharicTitle: 'ዕጣና የአሸናፊው ሒሳብ አያያዝ',
    title: 'Draw, Escrow & Repayment Process',
    subtitle: 'If selected, the proposed 1,000,000 ETB payout is held in a 6-month blocked escrow before full capital release.',
    bullets: [
      {
        icon: '🏦',
        label: '6-Month Blocked Bank Escrow',
        description: 'The 1,000,000 ETB prize is locked in Commercial Bank of Ethiopia (CBE) custody for 180 days at a claimed 22% p.a. interest.',
        isProposedClaim: true,
      },
      {
        icon: '📈',
        label: 'Daily Interest vs Repayment',
        description: 'Deposit accrues ~602.74 ETB/day (ACT/365). The winner owes 500 ETB principal + 50 ETB fee/day, yielding a temporary +52.74 ETB/day surplus in escrow.',
      },
      {
        icon: '🛡️',
        label: '7,500 ETB Operational Buffer',
        description: 'Winners maintain a dedicated buffer replenished every 15 days to guarantee daily debt service obligations.',
      },
    ],
    disclaimerText: 'Reality Check: The positive daily cash flow only applies during the 180-day lock period. Post-lock, ~910,000 ETB principal debt remains to be amortized over ~5.4 years without interest offset.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const setHasCompletedOnboarding = useUserStore((s) => s.setHasCompletedOnboarding);

  const activeSlide = ONBOARDING_SLIDES[currentSlideIndex];
  const isLastSlide = currentSlideIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setHasCompletedOnboarding(true);
    router.replace('/persona-select');
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.header}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {ONBOARDING_SLIDES.map((slide, idx) => (
            <View
              key={slide.id}
              style={[
                styles.stepDot,
                idx === currentSlideIndex && styles.stepDotActive,
                idx < currentSlideIndex && styles.stepDotCompleted,
              ]}
            />
          ))}
          <Text style={styles.stepText}>
            Step {currentSlideIndex + 1} of {ONBOARDING_SLIDES.length}
          </Text>
        </View>

        {/* Skip Action */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding and choose persona"
          onPress={handleComplete}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip to Demo →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Main Slide Card Container */}
        <View style={styles.contentWrapper}>
          {/* Top Badges */}
          <View style={styles.badgeRow}>
            <StatusPill status="info" label={activeSlide.badge} size="small" />
            <DemoBadge label="DEMO PROTOTYPE" />
          </View>

          {/* Titles */}
          <Text style={styles.amharicTitle}>{activeSlide.amharicTitle}</Text>
          <Text style={styles.slideTitle}>{activeSlide.title}</Text>
          <Text style={styles.slideSubtitle}>{activeSlide.subtitle}</Text>

          {/* Interactive Concept Card */}
          <Card style={styles.conceptCard} variant="elevated">
            {activeSlide.bullets.map((b, idx) => (
              <View
                key={idx}
                style={[
                  styles.bulletItem,
                  idx < activeSlide.bullets.length - 1 && styles.bulletItemBorder,
                ]}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{b.icon}</Text>
                </View>
                <View style={styles.bulletContent}>
                  <View style={styles.bulletHeader}>
                    <Text style={styles.bulletLabel}>{b.label}</Text>
                    {b.isProposedClaim && (
                      <StatusPill status="caution" label="MARKETING CLAIM" size="small" />
                    )}
                  </View>
                  <Text style={styles.bulletDesc}>{b.description}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Slide Critical Context Callout */}
          <Card style={styles.disclaimerCard} variant="surface">
            <View style={styles.disclaimerHeader}>
              <Text style={styles.disclaimerIcon}>⚖️</Text>
              <Text style={styles.disclaimerTitle}>Model Integrity Note</Text>
            </View>
            <Text style={styles.disclaimerBody}>{activeSlide.disclaimerText}</Text>
          </Card>

          {/* General Safety Notice */}
          <DisclaimerNotice />
        </View>
      </ScrollView>

      {/* Persistent Bottom Action Bar */}
      <View style={styles.footerBar}>
        <View style={styles.footerInner}>
          {currentSlideIndex > 0 ? (
            <AppButton
              title="← Back"
              variant="outline"
              onPress={handleBack}
              style={styles.backButton}
            />
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <AppButton
            title={isLastSlide ? 'Choose Demo Persona →' : 'Next Concept →'}
            variant={isLastSlide ? 'gold' : 'primary'}
            onPress={handleNext}
            style={styles.primaryActionButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.surfaceBorder,
    backgroundColor: colors.dark.surface,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.surfaceBorder,
  },
  stepDotActive: {
    backgroundColor: colors.primaryLight,
    width: 28,
  },
  stepDotCompleted: {
    backgroundColor: colors.primaryDark,
  },
  stepText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 12,
    marginLeft: 6,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipText: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100, // accommodate bottom action bar
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 620, // clean layout on web / tablets
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  amharicTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  slideTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  slideSubtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.dark.textSecondary,
    marginBottom: spacing.lg,
  },
  conceptCard: {
    backgroundColor: colors.dark.surface,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  bulletItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.divider,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  iconText: {
    fontSize: 20,
  },
  bulletContent: {
    flex: 1,
  },
  bulletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bulletLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  bulletDesc: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.dark.textSecondary,
  },
  disclaimerCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 6,
  },
  disclaimerIcon: {
    fontSize: 18,
  },
  disclaimerTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentGold,
  },
  disclaimerBody: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.dark.textSecondary,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: colors.dark.surfaceBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  footerInner: {
    width: '100%',
    maxWidth: 620,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  backButtonPlaceholder: {
    flex: 1,
  },
  primaryActionButton: {
    flex: 2,
  },
});
