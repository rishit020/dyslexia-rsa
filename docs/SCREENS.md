# SCREENS.md — Screen-by-Screen Specification

> This document defines every screen's exact behavior, state, props, child components, and interactions. When building a screen, read its full section here first.

---

## Screen 1: HomeScreen

**File**: `src/screens/HomeScreen.tsx`
**Navigation route**: `Home`
**Params**: None

### Purpose

First screen the user sees. Single purpose: get the user to the camera as fast as possible. Zero friction.

### Layout

```
┌──────────────────────────────┐
│                              │
│                              │
│                              │
│         (vertical center)    │
│                              │
│          ClearRead           │  ← App name, OpenDyslexic Bold, 36pt, COLORS.primary
│   The physical world,        │  ← Tagline, OpenDyslexic Regular, 16pt, COLORS.textMuted
│        made readable         │
│                              │
│                              │
│   ┌──────────────────────┐   │
│   │     Scan Text  📷    │   │  ← Primary CTA button, COLORS.primary bg, white text
│   └──────────────────────┘   │
│                              │
│                              │
└──────────────────────────────┘
Background: COLORS.bgCream (#FEF9EF)
```

### State

None. This is a stateless screen.

### Interactions

| Action | Result |
|--------|--------|
| Tap "Scan Text" button | `navigation.navigate('Camera')` |

### Component Details

**"Scan Text" Button**:
- Width: 80% of screen width, centered
- Height: 56dp minimum
- Background: `COLORS.primary` (#1B4FD8)
- Text: "Scan Text", OpenDyslexic Bold, 18pt, white
- Border radius: 16
- Press state: slight opacity reduction (0.85)
- Shadow: subtle elevation for depth

### Accessibility

- Button has `accessibilityLabel="Scan text with camera"`
- Button has `accessibilityRole="button"`

---

## Screen 2: CameraScreen

**File**: `src/screens/CameraScreen.tsx`
**Navigation route**: `Camera`
**Params**: None

### Purpose

Captures an image of printed text and runs OCR. The user should be able to capture within 2 seconds of arriving on this screen.

### Layout

```
┌──────────────────────────────┐
│                              │
│                              │
│                              │
│    Full-screen camera        │
│        preview               │
│    (CameraView fills         │
│     entire screen)           │
│                              │
│                              │
│                              │
│                              │
│         ┌────┐               │
│         │ ◉  │               │  ← CaptureButton, centered at bottom
│         └────┘               │
│                              │
└──────────────────────────────┘

Loading state (during OCR):
┌──────────────────────────────┐
│                              │
│    Semi-transparent black    │
│    overlay on camera         │
│                              │
│      ○ (ActivityIndicator)   │
│      "Processing..."         │
│                              │
└──────────────────────────────┘

Permission denied state:
┌──────────────────────────────┐
│                              │
│    📷                        │
│                              │
│    ClearRead needs camera    │
│    access to scan text.      │
│                              │
│    ┌────────────────────┐    │
│    │  Open Settings     │    │
│    └────────────────────┘    │
│    ┌────────────────────┐    │
│    │  Go Back           │    │
│    └────────────────────┘    │
└──────────────────────────────┘
```

### State

| State Variable | Type | Initial | Purpose |
|----------------|------|---------|---------|
| `hasPermission` | `boolean \| null` | `null` | `null` = loading, `false` = denied, `true` = granted |
| `isProcessing` | `boolean` | `false` | Shows loading overlay during OCR |
| `cameraRef` | `RefObject<CameraView>` | `useRef(null)` | Reference to camera for `takePictureAsync()` |

### Logic Flow

```
1. useEffect on mount:
   │  Request camera permission via Camera.requestCameraPermissionsAsync()
   │  Set hasPermission based on result
   │
2. If hasPermission === null → show loading spinner
   If hasPermission === false → show PermissionDeniedView
   If hasPermission === true → show camera preview
   │
3. User taps CaptureButton:
   │  Set isProcessing = true
   │  const photo = await cameraRef.current.takePictureAsync()
   │  const text = await extractText(photo.uri)
   │  Set isProcessing = false
   │  navigation.navigate('Reader', { extractedText: text })
   │
4. Error handling:
   │  try/catch around takePictureAsync and extractText
   │  On error: set isProcessing = false, show Alert with retry option
```

### Child Components

**CaptureButton** (`src/components/CaptureButton.tsx`):
- Props: `onPress: () => void`, `disabled: boolean`
- Appearance: 72dp white circle with 64dp inner circle, 4dp border
- Disabled state: opacity 0.5 (during processing)
- Position: Absolute, bottom: 40, centered horizontally

### Interactions

| Action | Result |
|--------|--------|
| Tap CaptureButton | Capture image → run OCR → navigate to Reader |
| Tap "Open Settings" (permission denied) | `Linking.openSettings()` |
| Tap "Go Back" (permission denied) | `navigation.goBack()` |
| Hardware back button | Navigate back to Home |

---

## Screen 3: ReaderScreen

**File**: `src/screens/ReaderScreen.tsx`
**Navigation route**: `Reader`
**Params**: `{ extractedText: string }`

### Purpose

THE CORE OF THE APP. Displays OCR-extracted text in dyslexia-friendly format with TTS + word highlighting. This screen is the demo centerpiece and must be the most polished screen in the app.

### Layout

```
┌──────────────────────────────┐
│  ←  Back          ⚙ Settings │  ← Header bar
├──────────────────────────────┤
│                              │
│   Extracted text rendered    │  ← ScrollView
│   in OpenDyslexic font      │
│   on tinted background       │
│   with wide spacing          │
│                              │
│   Each word is a separate    │
│   <Text> span for            │
│   highlighting               │
│                              │
│   Active word has yellow     │
│   background (#FEF08A)       │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│                              │
│    ◀◀   ▶ / ⏸   ⏹          │  ← TTS controls bar
│                              │
└──────────────────────────────┘
Background: settings.backgroundColor (default #FEF9EF)

Empty state (if extractedText is empty):
┌──────────────────────────────┐
│  ←  Back          ⚙ Settings │
├──────────────────────────────┤
│                              │
│         🔍                   │
│                              │
│   No text detected.          │
│                              │
│   Try holding your phone     │
│   closer or improving        │
│   the lighting.              │
│                              │
│   ┌────────────────────┐     │
│   │    Try Again        │    │
│   └────────────────────┘     │
│                              │
└──────────────────────────────┘
```

### State

| State Variable | Type | Initial | Purpose |
|----------------|------|---------|---------|
| `words` | `string[]` | `[]` | extractedText split into individual words |
| `currentWordIndex` | `number` | `-1` | Index of currently highlighted word (-1 = none) |
| `isPlaying` | `boolean` | `false` | TTS is actively speaking |
| `isPaused` | `boolean` | `false` | TTS is paused mid-playback |
| `highlightTimerRef` | `RefObject<NodeJS.Timeout \| null>` | `null` | Reference to setInterval timer |

### Settings Integration

All of the following are read from `useSettings()` hook:

| Setting | Applied To | How |
|---------|-----------|-----|
| `fontSize` | Text style `fontSize` property | Direct application |
| `backgroundColor` | Container `backgroundColor` style | Direct application |
| `readingSpeed` | `Speech.speak()` rate parameter AND highlight timer interval | Multiplied into timing calculation |

### Text Rendering Rules

- Split `extractedText` on whitespace: `text.split(/\s+/).filter(Boolean)`
- Render each word as a `<Text>` element inside a wrapping `<Text>` container
- Add a space character after each word (except the last)
- Apply to each word span:
  - `fontFamily: FONTS.regular`
  - `fontSize: settings.fontSize`
  - `letterSpacing: SPACING.letterSpacing`
  - `color: COLORS.textDark`
- Apply to the wrapping container:
  - `lineHeight: settings.fontSize * SPACING.lineHeightMultiplier`
- Active word (`index === currentWordIndex`):
  - `backgroundColor: COLORS.highlight` (#FEF08A)
  - `borderRadius: 4`

### TTS Controls

| Button | State | Action |
|--------|-------|--------|
| Play ▶ | Visible when `!isPlaying && !isPaused` | Start TTS from beginning, start highlight timer |
| Pause ⏸ | Visible when `isPlaying && !isPaused` | Pause TTS, freeze highlight timer |
| Resume ▶ | Visible when `isPaused` | Resume TTS, resume highlight timer |
| Stop ⏹ | Visible when `isPlaying \|\| isPaused` | Stop TTS, reset `currentWordIndex` to -1, clear timer |

### Child Components

**WordHighlighter** (`src/components/WordHighlighter.tsx`):
- Props: `words: string[]`, `currentWordIndex: number`, `fontSize: number`, `backgroundColor: string`
- Renders the formatted text with active word highlighting
- Pure display component — receives state, does not manage it

### Interactions

| Action | Result |
|--------|--------|
| Tap "Back" | Stop TTS if playing, `navigation.navigate('Camera')` |
| Tap Settings gear | `navigation.navigate('Settings')` |
| Tap Play | Start TTS + highlighting (see TTS_HIGHLIGHT_SPEC.md) |
| Tap Pause | Pause TTS + freeze highlight |
| Tap Stop | Stop TTS + reset highlight to start |
| Tap "Try Again" (empty state) | `navigation.navigate('Camera')` |
| Scroll text | Standard ScrollView scroll, does not affect TTS |
| Navigate away | Stop TTS, clear timer (useEffect cleanup) |

### Cleanup

```typescript
useEffect(() => {
  return () => {
    Speech.stop();
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
    }
  };
}, []);
```

---

## Screen 4: SettingsScreen

**File**: `src/screens/SettingsScreen.tsx`
**Navigation route**: `Settings`
**Params**: None

### Purpose

Allows user to customize the reading experience. All changes apply immediately and persist across sessions.

### Layout

```
┌──────────────────────────────┐
│  ←  Back              Settings│  ← Header
├──────────────────────────────┤
│                              │
│  Font Size                   │  ← Section label
│  ┌──────────────────────┐    │
│  │  16 ────●───────── 28│    │  ← Slider, current value shown
│  │         20            │    │
│  └──────────────────────┘    │
│                              │
│  Background Color            │  ← Section label
│  ┌──────────────────────┐    │
│  │ ◉ Cream   ○ Yellow   │    │  ← Four color option buttons
│  │ ○ Blue    ○ White    │    │
│  └──────────────────────┘    │
│                              │
│  Reading Speed               │  ← Section label
│  ┌──────────────────────┐    │
│  │ Slow │ Normal │ Fast │    │  ← Three toggle buttons
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │  Preview Area         │    │  ← Optional: shows sample text
│  │  "The quick brown..." │    │    with current settings applied
│  └──────────────────────┘    │
│                              │
└──────────────────────────────┘
Background: COLORS.bgWhite (#FFFFFF)
```

### State

No local state. All values read from and written to `SettingsContext`.

### Child Components

**FontSizeSlider** (`src/components/FontSizeSlider.tsx`):
- Props: `value: number`, `onValueChange: (size: number) => void`
- React Native `Slider` component
- Range: 16–28, step: 1
- Display current value below slider
- Slider track color: `COLORS.primary`

**ColorPicker** (`src/components/ColorPicker.tsx`):
- Props: `selectedColor: string`, `onColorChange: (color: string) => void`
- Four circular color swatches (40dp each) with labels:
  - Cream (#FEF9EF), Yellow (#FEFCE8), Blue (#EFF6FF), White (#FFFFFF)
- Selected swatch has a 3dp border in `COLORS.primary`
- Unselected swatches have a 1dp border in `COLORS.textMuted`

**SpeedSelector** (`src/components/SpeedSelector.tsx`):
- Props: `selectedSpeed: number`, `onSpeedChange: (speed: number) => void`
- Three segmented buttons: Slow (0.75), Normal (1.0), Fast (1.25)
- Selected button: `COLORS.primary` background, white text
- Unselected buttons: white background, `COLORS.textDark` text, light border

### Interactions

| Action | Result |
|--------|--------|
| Move font size slider | `updateFontSize(value)` → Context updates → AsyncStorage write |
| Tap color option | `updateBackgroundColor(hex)` → Context updates → AsyncStorage write |
| Tap speed option | `updateReadingSpeed(value)` → Context updates → AsyncStorage write |
| Tap "Back" | `navigation.goBack()` |

### Persistence

Every setting change triggers two actions simultaneously:
1. React state update (instant re-render across all consuming components)
2. AsyncStorage.setItem (async, fire-and-forget — no await needed, failures are non-critical)
