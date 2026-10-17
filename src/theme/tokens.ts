/**
 * Merkato Fund — Design System & Theme Tokens
 *
 * Tailored color palette, typography scale, spacing, radii, and elevation
 * reflecting an Ethiopian fintech aesthetic (trust emerald, warm gold, deep obsidian).
 *
 * ACCESSIBILITY STANDARDS:
 * - Minimum touch target size: 44x44 pt (Apple HIG & Android WCAG 2.1 AA)
 * - Contrast ratios: >= 4.5:1 for normal text, >= 3:1 for large text & UI controls
 * - High-visibility DEMO DATA pill colors for regulatory clarity
 */

import { Platform } from 'react-native';

export const colors = {
  // Brand identity
  primary: '#0D9488', // Emerald teal
  primaryDark: '#0F766E',
  primaryLight: '#2DD4BF',
  primaryVibrant: '#14B8A6',
  primaryMuted: '#134E4A',

  // Heritage & Accent Gold
  accentGold: '#F59E0B',
  accentGoldDark: '#B45309',
  accentGoldLight: '#FDE68A',

  // Ethiopian Payment Brand Reference Colors (Simulated)
  telebirr: '#0072CE',
  cbeBirr: '#8A208A',

  // Neutral Scales (Dark Theme First for Fintech Premium Feel)
  dark: {
    background: '#0A0E17',
    surface: '#121826',
    surfaceElevated: '#1A2234',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    surfaceBorderFocused: '#0D9488',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    divider: 'rgba(255, 255, 255, 0.06)',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    surfaceBorder: '#E2E8F0',
    surfaceBorderFocused: '#0D9488',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    divider: '#E2E8F0',
  },

  // Semantic Status
  status: {
    healthy: '#10B981',
    healthyBg: 'rgba(16, 185, 129, 0.12)',
    caution: '#F59E0B',
    cautionBg: 'rgba(245, 158, 11, 0.12)',
    critical: '#EF4444',
    criticalBg: 'rgba(239, 68, 68, 0.12)',
    depleted: '#94A3B8',
    depletedBg: 'rgba(148, 163, 184, 0.12)',
  },

  // Mandatory Demo Badge (Prominent amber alert to prevent confusing prototype with live system)
  demoBadge: {
    background: 'rgba(245, 158, 11, 0.15)',
    border: '#D97706',
    text: '#FDE68A',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
} as const;

export const fontFamilies = {
  sans: Platform.select({
    web: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  mono: Platform.select({
    web: "'JetBrains Mono', 'SF Mono', Consolas, Menlo, monospace",
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    display: 34,
    giant: 42,
  },
  lineHeights: {
    xs: 18,
    sm: 20,
    md: 24,
    lg: 26,
    xl: 30,
    xxl: 34,
    display: 42,
    giant: 50,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  h1: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700' as const,
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700' as const,
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: fontFamilies.sans,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400' as const,
    fontFamily: fontFamilies.sans,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400' as const,
    fontFamily: fontFamilies.sans,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400' as const,
    fontFamily: fontFamilies.sans,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    fontFamily: fontFamilies.sans,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export const layout = {
  minTouchTarget: 48, // WCAG 2.1 touch target minimum
  cardPadding: 16,
  screenPadding: 16,
} as const;

