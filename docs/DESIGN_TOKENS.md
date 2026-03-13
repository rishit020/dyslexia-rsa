# DESIGN_TOKENS.md — Visual Design Constants

> Every visual value in the app flows from `src/utils/constants.ts`. This document defines what goes in that file. No magic numbers anywhere else in the codebase.

---

## Colors

### Brand Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `COLORS.primary` | `#1B4FD8` | 27, 79, 216 | CTA buttons, accents, active states, app branding |
| `COLORS.primaryLight` | `#3B6EE6` | 59, 110, 230 | Button hover/press states |
| `COLORS.primaryDark` | `#153DA6` | 21, 61, 166 | Header accents if needed |

### Reader Background Tints

| Token | Hex | RGB | Label (shown in Settings) |
|-------|-----|-----|---------------------------|
| `COLORS.bgCream` | `#FEF9EF` | 254, 249, 239 | "Cream" — default |
| `COLORS.bgYellow` | `#FEFCE8` | 254, 252, 232 | "Light Yellow" |
| `COLORS.bgBlue` | `#EFF6FF` | 239, 246, 255 | "Light Blue" |
| `COLORS.bgWhite` | `#FFFFFF` | 255, 255, 255 | "White" |

### Highlight

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `COLORS.highlight` | `#FEF08A` | 254, 240, 138 | Active word highlight during TTS playback |

### Text Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `COLORS.textDark` | `#1F2937` | 31, 41, 55 | Primary text on light backgrounds |
| `COLORS.textMuted` | `#6B7280` | 107, 114, 128 | Secondary text, labels, placeholders |
| `COLORS.textWhite` | `#FFFFFF` | 255, 255, 255 | Text on primary-colored backgrounds |

### UI Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `COLORS.surfaceWhite` | `#FFFFFF` | 255, 255, 255 | Settings screen background, card backgrounds |
| `COLORS.border` | `#E5E7EB` | 229, 231, 235 | Subtle borders, dividers |
| `COLORS.overlay` | `rgba(0,0,0,0.5)` | — | Camera loading overlay |
| `COLORS.error` | `#EF4444` | 239, 68, 68 | Error states (rarely used) |
| `COLORS.success` | `#22C55E` | 34, 197, 94 | Success indicators (rarely used) |

---

## Typography

### Font Families

| Token | Value | File |
|-------|-------|------|
| `FONTS.regular` | `'OpenDyslexic-Regular'` | `assets/fonts/OpenDyslexic-Regular.ttf` |
| `FONTS.bold` | `'OpenDyslexic-Bold'` | `assets/fonts/OpenDyslexic-Bold.ttf` |

### Font Sizes

| Token | Value (pt) | Usage |
|-------|-----------|-------|
| `FONT_SIZES.appTitle` | `36` | Home Screen app name |
| `FONT_SIZES.screenTitle` | `24` | Screen headers |
| `FONT_SIZES.body` | `16` | App UI body text |
| `FONT_SIZES.button` | `18` | Button labels |
| `FONT_SIZES.caption` | `14` | Taglines, helper text, captions |
| `FONT_SIZES.small` | `12` | Fine print, labels |

### Reader Font Sizes (User-Adjustable)

| Token | Value | Usage |
|-------|-------|-------|
| `FONT_SIZES.readerDefault` | `20` | Default reader text size |
| `FONT_SIZES.readerMin` | `16` | Minimum slider value |
| `FONT_SIZES.readerMax` | `28` | Maximum slider value |
| `FONT_SIZES.readerStep` | `1` | Slider step increment |

---

## Spacing

### Reader-Specific Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `SPACING.letterSpacing` | `2.5` | Additional letter spacing on reader text (px) |
| `SPACING.wordSpacing` | `4` | Additional word spacing — apply by adding extra spaces or marginRight on word spans |
| `SPACING.lineHeightMultiplier` | `1.9` | Multiply by fontSize to get lineHeight value |

### Layout Spacing

| Token | Value (dp) | Usage |
|-------|-----------|-------|
| `SPACING.screenPadding` | `24` | Horizontal padding on all screens |
| `SPACING.sectionGap` | `32` | Vertical gap between major sections |
| `SPACING.itemGap` | `16` | Vertical gap between related items |
| `SPACING.smallGap` | `8` | Small spacing between tightly grouped elements |

---

## Component Dimensions

### Buttons

| Token | Value | Usage |
|-------|-------|-------|
| `DIMENSIONS.ctaHeight` | `56` | Primary CTA button height (Home Screen "Scan Text") |
| `DIMENSIONS.ctaRadius` | `16` | CTA button border radius |
| `DIMENSIONS.ttsControlSize` | `48` | TTS play/pause/stop button dimensions |
| `DIMENSIONS.ttsControlRadius` | `24` | TTS button border radius (circular) |
| `DIMENSIONS.minTouchTarget` | `48` | Minimum touch target per Android accessibility guidelines |

### Camera Screen

| Token | Value | Usage |
|-------|-------|-------|
| `DIMENSIONS.captureButtonOuter` | `72` | Outer ring diameter |
| `DIMENSIONS.captureButtonInner` | `64` | Inner circle diameter |
| `DIMENSIONS.captureButtonBorder` | `4` | Border width between outer and inner |
| `DIMENSIONS.captureButtonBottom` | `40` | Distance from bottom of screen |

### Settings Components

| Token | Value | Usage |
|-------|-------|-------|
| `DIMENSIONS.colorSwatchSize` | `40` | Color picker circle diameter |
| `DIMENSIONS.colorSwatchBorderSelected` | `3` | Border width when selected |
| `DIMENSIONS.colorSwatchBorderUnselected` | `1` | Border width when not selected |
| `DIMENSIONS.sliderTrackHeight` | `4` | Slider track thickness |

---

## Reading Speed

| Token | Value | Label (shown in UI) |
|-------|-------|---------------------|
| `SPEED.slow` | `0.75` | "Slow" |
| `SPEED.normal` | `1.0` | "Normal" |
| `SPEED.fast` | `1.25` | "Fast" |

---

## Background Color Options Map

This map is used by the ColorPicker component and SettingsContext:

```typescript
export const BACKGROUND_OPTIONS = [
  { key: 'cream',  hex: '#FEF9EF', label: 'Cream' },
  { key: 'yellow', hex: '#FEFCE8', label: 'Light Yellow' },
  { key: 'blue',   hex: '#EFF6FF', label: 'Light Blue' },
  { key: 'white',  hex: '#FFFFFF', label: 'White' },
] as const;
```

---

## Default Settings Values

These are used when no persisted value exists in AsyncStorage (first launch):

```typescript
export const DEFAULT_SETTINGS = {
  fontSize: FONT_SIZES.readerDefault,     // 20
  backgroundColor: COLORS.bgCream,        // '#FEF9EF'
  readingSpeed: SPEED.normal,             // 1.0
} as const;
```

---

## AsyncStorage Keys

| Key | Stores | Type |
|-----|--------|------|
| `@clearread/fontSize` | Font size number | `string` (parsed to number) |
| `@clearread/backgroundColor` | Hex color string | `string` |
| `@clearread/readingSpeed` | Speed multiplier | `string` (parsed to number) |

---

## Shadow / Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `ELEVATION.small` | `{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }` | Subtle depth on buttons |
| `ELEVATION.medium` | `{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }` | Cards, floating elements |

---

## constants.ts Template

The file `src/utils/constants.ts` should export all of the above as named exports:

```typescript
export const COLORS = { ... };
export const FONTS = { ... };
export const FONT_SIZES = { ... };
export const SPACING = { ... };
export const DIMENSIONS = { ... };
export const SPEED = { ... };
export const BACKGROUND_OPTIONS = [ ... ];
export const DEFAULT_SETTINGS = { ... };
export const STORAGE_KEYS = { ... };
export const ELEVATION = { ... };
```

Every component in the app imports from this file. No hex codes, font sizes, spacing values, or dimensions should appear as literals anywhere else in the codebase.
