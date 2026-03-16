/**
 * Design Tokens and Constants
 * All visual values in the app flow from this file.
 * This is the single source of truth for colors, fonts, spacing, and dimensions.
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Brand Colors
  primary: '#1B4FD8',
  primaryLight: '#3B6EE6',
  primaryDark: '#153DA6',

  // Reader Background Tints
  bgCream: '#FEF9EF',
  bgYellow: '#FEFCE8',
  bgBlue: '#EFF6FF',
  bgWhite: '#FFFFFF',

  // Highlight
  highlight: '#FEF08A',

  // Text Colors
  textDark: '#1F2937',
  textMuted: '#6B7280',
  textWhite: '#FFFFFF',

  // UI Colors
  surfaceWhite: '#FFFFFF',
  border: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.5)',
  error: '#EF4444',
  success: '#22C55E',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FONTS = {
  regular: 'OpenDyslexic-Regular',
  bold: 'OpenDyslexic-Bold',
} as const;

export const FONT_SIZES = {
  // App UI Font Sizes
  appTitle: 36,
  screenTitle: 24,
  body: 16,
  button: 18,
  caption: 14,
  small: 12,

  // Reader Font Sizes (User-Adjustable)
  readerDefault: 20,
  readerMin: 16,
  readerMax: 28,
  readerStep: 1,
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  // Reader-Specific Spacing
  letterSpacing: 2.5,
  wordSpacing: 4,
  lineHeightMultiplier: 1.9,

  // Layout Spacing (in dp)
  screenPadding: 24,
  sectionGap: 32,
  itemGap: 16,
  smallGap: 8,
} as const;

// ============================================================================
// DIMENSIONS
// ============================================================================

export const DIMENSIONS = {
  // Buttons
  ctaHeight: 56,
  ctaRadius: 16,
  ttsControlSize: 48,
  ttsControlRadius: 24,
  minTouchTarget: 48,

  // Camera Screen
  captureButtonOuter: 72,
  captureButtonInner: 64,
  captureButtonBorder: 4,
  captureButtonBottom: 40,

  // Settings Components
  colorSwatchSize: 40,
  colorSwatchBorderSelected: 3,
  colorSwatchBorderUnselected: 1,
  sliderTrackHeight: 4,
} as const;

// ============================================================================
// READING SPEED
// ============================================================================

export const SPEED = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25,
} as const;

// ============================================================================
// BACKGROUND COLOR OPTIONS
// ============================================================================

export const BACKGROUND_OPTIONS = [
  { key: 'cream', hex: '#FEF9EF', label: 'Cream' },
  { key: 'yellow', hex: '#FEFCE8', label: 'Light Yellow' },
  { key: 'blue', hex: '#EFF6FF', label: 'Light Blue' },
  { key: 'white', hex: '#FFFFFF', label: 'White' },
] as const;

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

export const DEFAULT_SETTINGS = {
  fontSize: FONT_SIZES.readerDefault, // 20
  backgroundColor: COLORS.bgCream, // '#FEF9EF'
  readingSpeed: SPEED.normal, // 1.0
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  fontSize: '@clearread/fontSize',
  backgroundColor: '@clearread/backgroundColor',
  readingSpeed: '@clearread/readingSpeed',
} as const;

// ============================================================================
// ELEVATION (Shadows)
// ============================================================================

export const ELEVATION = {
  small: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medium: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
} as const;
