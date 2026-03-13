# ARCHITECTURE.md — ClearRead Technical Architecture

---

## Navigation Graph

```
┌─────────────┐     "Scan Text"     ┌────────────────┐
│             │ ──────────────────► │                │
│  HomeScreen │                     │  CameraScreen  │
│             │ ◄────── (back) ──── │                │
└─────────────┘                     └───────┬────────┘
                                            │
                                            │ navigate('Reader', { extractedText })
                                            │ (after OCR completes)
                                            ▼
┌─────────────────┐    gear icon    ┌────────────────┐
│                 │ ◄──────────── │                │
│  SettingsScreen │                 │  ReaderScreen  │
│                 │ ──── (back) ──►│                │
└─────────────────┘                 └────────────────┘
                                            │
                                            │ "Rescan" button
                                            ▼
                                    ┌────────────────┐
                                    │  CameraScreen  │
                                    └────────────────┘
```

**Navigator type**: `@react-navigation/native-stack` (native stack navigator for performance).

**Typed param list**:

```typescript
export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Reader: { extractedText: string };
  Settings: undefined;
};
```

---

## Component Tree

```
App.tsx
├── FontLoadingGate (useFonts hook — blocks render until OpenDyslexic loaded)
│   └── SettingsProvider (React Context — loads settings from AsyncStorage on mount)
│       └── NavigationContainer
│           └── Stack.Navigator
│               ├── HomeScreen
│               │   └── Pressable ("Scan Text" CTA)
│               │
│               ├── CameraScreen
│               │   ├── CameraView (expo-camera live preview)
│               │   ├── CaptureButton (circular capture trigger)
│               │   ├── ActivityIndicator (shown during OCR processing)
│               │   └── PermissionDeniedView (fallback if camera denied)
│               │
│               ├── ReaderScreen
│               │   ├── ScrollView
│               │   │   └── WordHighlighter (renders text as word spans)
│               │   ├── TTS Controls (Play/Pause/Resume/Stop)
│               │   ├── EmptyStateView (if extractedText is empty)
│               │   └── Header (Back button + Settings gear)
│               │
│               └── SettingsScreen
│                   ├── FontSizeSlider
│                   ├── ColorPicker
│                   └── SpeedSelector
```

---

## Data Flow

### Primary Flow: Camera → OCR → Reader

```
1. CameraScreen
   │
   │  User taps CaptureButton
   ▼
2. cameraRef.takePictureAsync()
   │
   │  Returns { uri: string } — local file path to captured image
   ▼
3. ocrProcessor.extractText(uri)
   │
   │  Calls TextRecognition.recognize(uri)
   │  ML Kit processes image on-device
   │  Returns RecognizedText object with blocks → lines → text
   │  extractText() concatenates all block.text with newlines
   │  Returns single string (or empty string on failure)
   ▼
4. navigation.navigate('Reader', { extractedText: result })
   │
   │  Text string passed as navigation parameter
   ▼
5. ReaderScreen receives route.params.extractedText
   │
   │  Reads fontSize, backgroundColor, readingSpeed from SettingsContext
   │  Applies OpenDyslexic font + spacing + tint
   ▼
6. WordHighlighter renders text as array of <Text> spans
   │
   │  User taps Play → ttsEngine starts Speech.speak()
   │  Timer advances currentWordIndex
   │  Active word gets highlight background
   ▼
7. User reads in dyslexia-friendly format with synchronized audio
```

### Settings Flow

```
1. SettingsScreen
   │
   │  User changes a setting (fontSize, backgroundColor, readingSpeed)
   ▼
2. SettingsContext.updateSetting(key, value)
   │
   │  Updates React state (immediate re-render)
   │  Writes to AsyncStorage (async, fire-and-forget)
   ▼
3. Any consuming component re-renders with new value
   │
   │  ReaderScreen reads from useSettings() hook
   │  TTS engine reads speed from useSettings() hook
   ▼
4. On next app launch:
   │
   │  SettingsProvider.useEffect loads from AsyncStorage
   │  Sets state with persisted values (or defaults if first launch)
```

---

## State Management

### Global State: SettingsContext

**Pattern**: React Context + `useReducer` + AsyncStorage persistence.

```typescript
interface Settings {
  fontSize: number;          // 16–28, default 20
  backgroundColor: string;   // hex string, default '#FEF9EF'
  readingSpeed: number;       // 0.75 | 1.0 | 1.25, default 1.0
}

interface SettingsContextValue {
  settings: Settings;
  updateFontSize: (size: number) => void;
  updateBackgroundColor: (color: string) => void;
  updateReadingSpeed: (speed: number) => void;
  isLoaded: boolean;  // false until AsyncStorage read completes
}
```

**AsyncStorage keys**:
- `@clearread/fontSize`
- `@clearread/backgroundColor`
- `@clearread/readingSpeed`

**Loading behavior**: `SettingsProvider` reads all three keys in a `useEffect` on mount. Until the read completes, `isLoaded` is `false` and consuming components should show a loading state or use defaults.

### Local State (Per-Screen)

| Screen | State | Type | Purpose |
|--------|-------|------|---------|
| CameraScreen | `hasPermission` | `boolean \| null` | Camera permission status |
| CameraScreen | `isProcessing` | `boolean` | Show loading spinner during OCR |
| CameraScreen | `cameraRef` | `RefObject<CameraView>` | Reference to camera for capture |
| ReaderScreen | `currentWordIndex` | `number` | Which word is currently highlighted |
| ReaderScreen | `isPlaying` | `boolean` | TTS playback state |
| ReaderScreen | `isPaused` | `boolean` | TTS paused state |
| ReaderScreen | `words` | `string[]` | Text split into word array |
| ReaderScreen | `highlightTimerRef` | `RefObject<NodeJS.Timeout>` | Timer for advancing highlight |

---

## Dependency Map

### Production Dependencies

| Package | Purpose | Native Module? |
|---------|---------|----------------|
| `expo` (~52.x) | Expo SDK core | Yes |
| `expo-camera` | Camera access, preview, capture | Yes |
| `@react-native-ml-kit/text-recognition` | On-device OCR via Google ML Kit | **Yes — requires dev client** |
| `expo-font` | Load custom fonts (OpenDyslexic) | Yes |
| `expo-speech` | Android TTS engine wrapper | Yes |
| `@react-native-async-storage/async-storage` | Local key-value persistence | Yes |
| `@react-navigation/native` | Navigation container | No |
| `@react-navigation/native-stack` | Native stack navigator | Yes |
| `react-native-screens` | Native screen optimization (nav dep) | Yes |
| `react-native-safe-area-context` | Safe area insets (nav dep) | Yes |

### Dev / Build Dependencies

| Tool | Purpose |
|------|---------|
| `eas-cli` (global) | Expo Application Services — triggers cloud builds |
| `typescript` | Type checking |
| `@types/react` | React type definitions |

### External Assets

| Asset | Source | License |
|-------|--------|---------|
| OpenDyslexic-Regular.ttf | opendyslexic.org | SIL Open Font License (free, commercial OK) |
| OpenDyslexic-Bold.ttf | opendyslexic.org | SIL Open Font License (free, commercial OK) |

---

## Build Architecture

### Development

```
Source Code (TypeScript)
        │
        ▼
npx expo prebuild          ← Generates native Android project from Expo config
        │
        ▼
eas build --profile development --platform android
        │
        ▼
Dev Client APK             ← Install on physical device for testing
        │                     Connects to Expo dev server for hot reload
        ▼
Test on Physical Device    ← ML Kit requires real camera hardware
```

### Production (Final Submission)

```
Source Code (TypeScript)
        │
        ▼
eas build --profile preview --platform android
        │
        ▼
Standalone APK (.apk)     ← Self-contained, no dev server needed
        │
        ▼
Upload to Devpost          ← Competition submission
```

---

## Key Architectural Decisions

### 1. No Backend

All processing happens on-device. Zero network calls at runtime. This eliminates: API key management, network failure handling, server costs, latency, and authentication — none of which are worth the complexity for a 2-day MVP.

### 2. Navigation Params for Data Passing

The extracted text string is passed from CameraScreen to ReaderScreen via navigation params, not global state. This keeps the data flow explicit and traceable. If the text were in global state, any screen could modify it, creating debugging complexity.

### 3. Context Instead of State Library

Three settings values do not justify Redux, Zustand, or MobX. React Context with AsyncStorage persistence is the right tool for this scale. The context provider handles loading, persistence, and provides typed update functions.

### 4. Word Array Rendering for Highlighting

The WordHighlighter component renders each word as an individual `<Text>` element inside a `<Text>` container (for proper line wrapping). This allows targeting a specific word with a background color style. The alternative (using a single `<Text>` with substrings) creates line-wrapping issues when split mid-word.

### 5. Timer-Based Highlight Sync

Since `expo-speech` doesn't provide per-word callbacks on Android, highlight advancement is timer-based. The timer interval is calculated from speech rate and estimated word duration. This is an approximation — it won't be frame-perfect but is visually convincing for a demo. See `TTS_HIGHLIGHT_SPEC.md` for the full algorithm.
