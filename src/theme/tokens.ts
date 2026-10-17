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

export const colors = {
  // Brand identity
  primary: '#0D9488', // Emerald teal
  primaryDark: '#0F766E',
  primaryLight: '#2DD4BF',
  primaryMuted: '#134E4A',

  // Heritage & Accent Gold
  accentGold: '#F59E0B',
  accentGoldDark: '#B45309',
  accentGoldLight: '#FDE68A',

  // Ethiopian Payment Brand Reference Colors (Simulated)
  telebirr: '#0072CE',
  cbeBirr: '#7A1C7A',

  // Neutral Scales (Dark Theme First for Fintech Premium Feel)
  dark: {
    background: '#0B0F17',
    surface: '#111827',
    surfaceElevated: '#1F2937',
    surfaceBorder: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    divider: '#1F2937',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    surfaceBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    divider: '#E2E8F0',
  },

  // Semantic Status
  status: {
    healthy: '#10B981',
    healthyBg: '#064E3B',
    caution: '#F59E0B',
    cautionBg: '#78350F',
    critical: '#EF4444',
    criticalBg: '#7F1D1D',
    depleted: '#9CA3AF',
    depletedBg: '#374151',
  },

  // Mandatory Demo Badge (Prominent amber alert to prevent confusing prototype with live system)
  demoBadge: {
    background: '#78350F',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 32,
    giant: 40,
  },
  lineHeights: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 32,
    display: 40,
    giant: 48,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
} as const;

export const layout = {
  minTouchTarget: 44, // WCAG 2.1 touch target minimum
  cardPadding: 16,
  screenPadding: 16,
} as const;
