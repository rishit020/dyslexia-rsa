# TASKS.md — ClearRead Phased Build Plan

> **How to use this file**: Work through phases in order. For each phase, copy the prompt in the code block under "PROMPT" and paste it directly into Claude Code CLI. Review the output. Fix anything broken. Move to the next phase. Do not skip phases.

> **Complexity balancing**: Phases are designed so each one takes roughly the same amount of AI effort. Simple phases bundle more tasks. Complex phases have fewer tasks but harder problems.

---

## PRE-BUILD: Manual Setup (You Do This Yourself)

These steps require your accounts and device. Do them before Phase 1.

- [ ] Create Expo account at https://expo.dev
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Run `eas login` and authenticate
- [ ] Download OpenDyslexic font files from https://opendyslexic.org/ — you need `OpenDyslexic-Regular.ttf` and `OpenDyslexic-Bold.ttf`
- [ ] Have a physical Android phone ready with USB debugging enabled
- [ ] Create GitHub repo for the project
- [ ] Create the project directory and cd into it: `mkdir clearread && cd clearread`
- [ ] Create docs/ folder and copy all doc files into it: `mkdir docs`
- [ ] Place font files somewhere accessible (Phase 1 will set up assets/fonts/)

---

# DAY 1

---

## PHASE 1 — Project Initialization & Scaffold

**Complexity**: Low per task, many tasks bundled
**What this does**: Creates the entire project skeleton — Expo project, all dependencies, folder structure, config files, placeholder screens, and navigation. After this phase you have a running app with four empty screens you can tap between.

**Checklist**:
- [ ] Expo project initialized with TypeScript
- [ ] All 10 dependencies installed
- [ ] Full directory structure created
- [ ] constants.ts with all design tokens
- [ ] eas.json configured for dev + preview builds
- [ ] app.json configured with Android package, permissions, camera plugin
- [ ] tsconfig.json with strict mode
- [ ] Four placeholder screen files
- [ ] AppNavigator with typed param list
- [ ] Font files placed in assets/fonts/
- [ ] App.tsx with font loading gate and NavigationContainer

**PROMPT** — Copy and paste into Claude Code CLI:

```
Read the files docs/CLAUDE.md, docs/ARCHITECTURE.md, and docs/DESIGN_TOKENS.md first. Then execute all of the following in order:

1. Initialize a new Expo project in the current directory:
   npx create-expo-app . --template expo-template-blank-typescript

2. Install all production dependencies:
   npx expo install expo-camera @react-native-ml-kit/text-recognition expo-font expo-speech @react-native-async-storage/async-storage
   npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context

3. Create the full directory structure:
   src/screens/, src/components/, src/context/, src/utils/, src/navigation/

4. Copy the font files from assets/fonts/ (OpenDyslexic-Regular.ttf and OpenDyslexic-Bold.ttf should already be there — if not, create placeholder comments noting they need to be added manually).

5. Create src/utils/constants.ts — export ALL design tokens exactly as specified in docs/DESIGN_TOKENS.md: COLORS, FONTS, FONT_SIZES, SPACING, DIMENSIONS, SPEED, BACKGROUND_OPTIONS, DEFAULT_SETTINGS, STORAGE_KEYS, ELEVATION. Every value must match the doc precisely.

6. Create eas.json in the project root with three profiles (development, preview, production) exactly as specified in docs/EAS_BUILD_GUIDE.md. The preview profile must use "buildType": "apk".

7. Update app.json: set name to "ClearRead", slug to "clearread", android.package to "com.clearread.app", android.permissions to ["CAMERA"], add the expo-camera plugin with the custom permission message "ClearRead needs camera access to scan printed text and make it readable for you.", set splash backgroundColor to "#FEF9EF", set orientation to "portrait".

8. Create src/navigation/AppNavigator.tsx:
   - Define RootStackParamList type: Home (undefined), Camera (undefined), Reader ({ extractedText: string }), Settings (undefined)
   - Create a native stack navigator with all four routes
   - Home is the initial route
   - Hide headers on all screens (we'll build custom headers)
   - Export the navigator as default

9. Create four placeholder screens in src/screens/:
   - HomeScreen.tsx, CameraScreen.tsx, ReaderScreen.tsx, SettingsScreen.tsx
   - Each should be a functional component that renders a View with a Text saying the screen name
   - Each should use the correct navigation typing (NativeStackScreenProps<RootStackParamList, 'ScreenName'>)
   - Use COLORS and FONTS from constants.ts for styling
   - Export as both named and default export

10. Create App.tsx:
    - Use useFonts hook from expo-font to load OpenDyslexic-Regular and OpenDyslexic-Bold
    - While fonts are loading, show expo-splash-screen or a simple loading view
    - Once loaded, render NavigationContainer wrapping AppNavigator
    - Do NOT add SettingsProvider yet — that comes in the next phase

Make sure everything compiles with no TypeScript errors. Run npx tsc --noEmit to verify.
```

**After this phase**: Run `npx expo start` and verify in Expo Go that you can navigate between four placeholder screens and the OpenDyslexic font loads without errors. Expo Go works for this phase since we haven't added ML Kit yet.

---

## PHASE 2 — Settings Context & Persistence

**Complexity**: Medium — single file but involves async logic, context API, and typed interfaces
**What this does**: Creates the SettingsContext provider that manages fontSize, backgroundColor, and readingSpeed globally with AsyncStorage persistence. Every subsequent screen will consume this context.

**Checklist**:
- [ ] SettingsContext.tsx with full typed interface
- [ ] AsyncStorage load on mount with loading state
- [ ] Three update functions that sync state + AsyncStorage
- [ ] SettingsProvider wrapping the app in App.tsx
- [ ] useSettings custom hook exported

**PROMPT**:

```
Read docs/CLAUDE.md and docs/ARCHITECTURE.md (the State Management section). Then:

1. Create src/context/SettingsContext.tsx:

   - Define the Settings interface: fontSize (number), backgroundColor (string), readingSpeed (number)
   - Define the SettingsContextValue interface: settings (Settings), updateFontSize, updateBackgroundColor, updateReadingSpeed (each takes the appropriate value type and returns void), isLoaded (boolean)
   - Import DEFAULT_SETTINGS and STORAGE_KEYS from constants.ts
   - Create the context with React.createContext
   - Create the SettingsProvider component:
     - State: settings (initialized with DEFAULT_SETTINGS), isLoaded (initialized false)
     - useEffect on mount: read all three keys from AsyncStorage, parse them, update state, set isLoaded to true. Wrap in try/catch — if any read fails, keep defaults.
     - updateFontSize: update state immediately, then fire-and-forget AsyncStorage.setItem (no await)
     - updateBackgroundColor: same pattern
     - updateReadingSpeed: same pattern
     - Render context provider wrapping children. If !isLoaded, render null or a minimal loading view (just a View with the cream background, no text needed).
   - Export a useSettings custom hook: calls useContext(SettingsContext), throws if used outside provider
   - Export SettingsProvider as named export

2. Update App.tsx:
   - Wrap NavigationContainer with SettingsProvider (inside the font loading gate, outside NavigationContainer)

3. Verify: update one of the placeholder screens (e.g., HomeScreen) to call useSettings() and display settings.fontSize as text. Run npx tsc --noEmit to confirm no type errors.
```

**After this phase**: The settings infrastructure is ready. Any screen can call `useSettings()` to read/write settings, and values persist across app kills.

---

## PHASE 3 — Home Screen

**Complexity**: Low — pure UI, no logic
**What this does**: Builds the polished Home Screen with ClearRead branding and the "Scan Text" CTA button. This is the first thing judges see.

**Checklist**:
- [ ] ClearRead app name in OpenDyslexic Bold
- [ ] Tagline beneath it
- [ ] Large "Scan Text" CTA button
- [ ] Cream background, blue accent
- [ ] Navigation to Camera on button press
- [ ] Proper accessibility labels

**PROMPT**:

```
Read docs/SCREENS.md (the HomeScreen section) and docs/DESIGN_TOKENS.md. Then:

Build src/screens/HomeScreen.tsx as the polished landing screen:

- Full screen cream background (COLORS.bgCream)
- Content vertically and horizontally centered
- App name "ClearRead" in OpenDyslexic Bold (FONTS.bold), 36pt (FONT_SIZES.appTitle), primary blue (COLORS.primary)
- Tagline "The physical world, made readable" below it in OpenDyslexic Regular (FONTS.regular), 14pt (FONT_SIZES.caption), muted text (COLORS.textMuted), centered
- Generous spacing between title and tagline (SPACING.itemGap)
- Large "Scan Text" button below with more spacing (SPACING.sectionGap):
  - 80% screen width, centered
  - Height: DIMENSIONS.ctaHeight (56dp)
  - Background: COLORS.primary
  - Text: "Scan Text" in FONTS.bold, FONT_SIZES.button (18pt), white
  - Border radius: DIMENSIONS.ctaRadius (16)
  - Apply ELEVATION.small for subtle shadow
  - Use Pressable with opacity feedback on press (opacity 0.85)
  - onPress: navigation.navigate('Camera')
  - accessibilityLabel="Scan text with camera"
  - accessibilityRole="button"
- All styles in StyleSheet.create at the bottom of the file
- No magic numbers — everything from constants.ts
- Named export HomeScreen + default export
```

**After this phase**: The Home Screen looks clean and branded. Tapping "Scan Text" navigates to the camera placeholder.

---

## PHASE 4 — Camera Screen + OCR Pipeline

**Complexity**: HIGH — camera hardware, permissions, ML Kit OCR, async image processing, navigation with params. Most things that can go wrong happen here.
**What this does**: Builds the camera viewfinder, capture button, OCR processing pipeline, permission handling, and loading state.

**Checklist**:
- [ ] CameraScreen with live preview
- [ ] CaptureButton component
- [ ] ocrProcessor.ts utility
- [ ] Permission request with friendly rationale
- [ ] Permission denied fallback UI
- [ ] Loading overlay during OCR
- [ ] Navigation to Reader with extracted text

**PROMPT**:

```
Read docs/SCREENS.md (CameraScreen section), docs/ARCHITECTURE.md (Data Flow section), and docs/CLAUDE.md (Key Technical Gotchas). Then:

1. Create src/utils/ocrProcessor.ts:
   - Import TextRecognition from @react-native-ml-kit/text-recognition
   - Export async function extractText(imageUri: string): Promise<string>
   - Call TextRecognition.recognize(imageUri)
   - Concatenate all result.blocks[].text with newlines between blocks
   - Trim the final string
   - Wrap in try/catch: on any error, log to console and return empty string (never throw)

2. Create src/components/CaptureButton.tsx:
   - Props: onPress: () => void, disabled: boolean
   - Render a circular button: outer ring 72dp white, inner circle 64dp white, 4dp border of COLORS.primary between them
   - Position absolute, bottom: DIMENSIONS.captureButtonBottom (40), alignSelf center
   - When disabled: opacity 0.5
   - Use Pressable with scale feedback on press
   - accessibilityLabel="Capture photo of text"
   - All styles in StyleSheet.create using DIMENSIONS constants

3. Build src/screens/CameraScreen.tsx:
   - State: hasPermission (boolean | null, init null), isProcessing (boolean, init false), cameraRef (useRef)
   - useEffect on mount: call Camera.requestCameraPermissionsAsync(), set hasPermission from result.granted
   - Three render paths:
     a. hasPermission === null: centered ActivityIndicator on cream background
     b. hasPermission === false: Permission denied view — camera emoji or text, message "ClearRead needs camera access to scan text. Please enable it in Settings.", two buttons: "Open Settings" (calls Linking.openSettings()) and "Go Back" (navigation.goBack()). Style nicely with padding, centered text, FONTS.regular.
     c. hasPermission === true: Full camera view
   - Camera view layout:
     - CameraView from expo-camera filling the entire screen (flex: 1, use 'back' facing)
     - CaptureButton overlaid at the bottom
   - Capture flow (onPress of CaptureButton):
     - Set isProcessing = true
     - try: const photo = await cameraRef.current.takePictureAsync()
     - const text = await extractText(photo.uri)
     - navigation.navigate('Reader', { extractedText: text })
     - catch: Alert.alert('Capture Error', 'Something went wrong. Please try again.')
     - finally: set isProcessing = false
   - Loading overlay: when isProcessing is true, render a semi-transparent black overlay (COLORS.overlay) on top of the camera with a white ActivityIndicator and "Processing..." text in FONTS.regular
   - Pass disabled={isProcessing} to CaptureButton

Important: This screen will NOT work in Expo Go because of ML Kit. The code should compile cleanly though — run npx tsc --noEmit to verify no type errors.
```

**After this phase**: The camera + OCR pipeline is built. Once you install the dev client on your phone, the core capture flow will work.

---

## PHASE 5 — Reader Screen (Core Display)

**Complexity**: HIGH — demo centerpiece. Text formatting, settings integration, word-level rendering, empty state, navigation.
**What this does**: Builds the Reader Screen that displays OCR text in dyslexia-friendly format. Does NOT include TTS yet — separating display from TTS reduces blast radius.

**Checklist**:
- [ ] Reader Screen receives extractedText from nav params
- [ ] WordHighlighter component renders words as individual spans
- [ ] Settings integration (fontSize, backgroundColor)
- [ ] Empty state for no text
- [ ] Back button and Settings gear in header
- [ ] ScrollView for long text
- [ ] TTS controls bar placeholder at bottom

**PROMPT**:

```
Read docs/SCREENS.md (ReaderScreen section) and docs/DESIGN_TOKENS.md. This is the most important screen in the app — it must look beautiful. Then:

1. Create src/components/WordHighlighter.tsx:
   - Props: words (string[]), currentWordIndex (number), fontSize (number), letterSpacing (number), lineHeight (number), highlightColor (string), textColor (string)
   - Render a wrapping <Text> component with lineHeight set
   - Inside: map over words array, render each as an individual <Text> span
   - Each span contains the word + a space (except last word)
   - Apply: fontFamily FONTS.regular, fontSize, letterSpacing, color textColor
   - If index === currentWordIndex: add backgroundColor highlightColor with borderRadius 4
   - This is a pure display component

2. Build src/screens/ReaderScreen.tsx:
   - Receive route.params.extractedText (typed via NativeStackScreenProps)
   - Read settings from useSettings(): fontSize, backgroundColor, readingSpeed
   - useMemo to split extractedText into words: text.split(/\s+/).filter(Boolean)
   - State: currentWordIndex (number, init -1)

   HEADER BAR:
   - Custom header row at top
   - Left: "< Back" text button — onPress: navigation.navigate('Camera')
   - Right: Settings gear "⚙" — onPress: navigation.navigate('Settings')
   - Height ~56dp, SPACING.screenPadding horizontal
   - Background: settings.backgroundColor
   - Text: FONTS.regular, COLORS.textDark

   MAIN CONTENT (if words.length > 0):
   - ScrollView filling remaining space
   - Padding: SPACING.screenPadding horizontal, SPACING.itemGap vertical
   - Background: settings.backgroundColor
   - Render <WordHighlighter> with all props from settings and state
   
   EMPTY STATE (if words.length === 0):
   - Centered layout on COLORS.bgCream background
   - Magnifying glass "🔍" large
   - "No text detected." in FONTS.bold
   - "Try holding your phone closer or improving the lighting." in FONTS.regular, COLORS.textMuted
   - "Try Again" button — navigates to Camera

   TTS CONTROLS BAR (placeholder):
   - Fixed bar at bottom, outside ScrollView
   - Height ~72dp, subtle top border
   - Single disabled Play button "▶" centered — we wire it in Phase 6
   - Hide entirely if words.length === 0

   All styles in StyleSheet.create. No magic numbers.

Run npx tsc --noEmit to verify.
```

**After this phase**: Scanning text produces a beautifully formatted display. The visual difference from plain text should be dramatic.

---

## PHASE 6 — Text-to-Speech + Word Highlighting

**Complexity**: HIGH — the hardest feature. Timer-based sync, TTS coordination, pause/resume state machine, cleanup.
**What this does**: Wires TTS read-aloud with word-by-word yellow highlighting. The "magic moment."

**Checklist**:
- [ ] ttsEngine.ts with timeline builder and highlight controller
- [ ] TTS plays via expo-speech
- [ ] Words highlight in yellow synced to speech
- [ ] Play / Pause / Stop controls
- [ ] Reading speed applied
- [ ] Cleanup on unmount

**PROMPT**:

```
Read docs/TTS_HIGHLIGHT_SPEC.md in its entirety — it contains the complete algorithm. Also read docs/SCREENS.md (ReaderScreen TTS Controls). Then:

1. Create src/utils/ttsEngine.ts implementing the full algorithm from TTS_HIGHLIGHT_SPEC.md:

   - Export constants: BASE_WPM = 150, BASE_WORD_DURATION_MS = 400, MIN_WORD_DURATION_MS = 200, CHAR_WEIGHT_MS = 30, TICK_INTERVAL_MS = 100
   - Export function estimateWordDuration(word: string, speechRate: number): number — character-weighted formula from the spec
   - Export interface WordTiming { word: string; startMs: number; durationMs: number; }
   - Export function buildTimeline(words: string[], speechRate: number): WordTiming[]
   - Export interface HighlightControls { pause: () => void; resume: () => void; stop: () => void; }
   - Export function startHighlighting(timeline: WordTiming[], setCurrentWordIndex: (index: number) => void, onComplete: () => void): HighlightControls — uses setInterval with Date.now() per the spec

2. Update src/screens/ReaderScreen.tsx to integrate TTS + highlighting:

   - Add state: isPlaying (boolean, false), isPaused (boolean, false)
   - Add ref: highlightControlsRef (useRef<HighlightControls | null>)

   - handlePlay:
     Build timeline, start highlighting, call Speech.speak with settings.readingSpeed as rate.
     onDone/onStopped/onError callbacks all: stop controls, reset state.
     Set isPlaying true, isPaused false.

   - handlePause:
     Use the stop-and-restart fallback from TTS_HIGHLIGHT_SPEC.md since Speech.pause() is unreliable on Android.
     Call Speech.stop(), pause highlight controls, set isPaused true.

   - handleResume:
     Get remaining words from currentWordIndex, build new timeline for them, start new highlight timer with offset, Speech.speak remaining text. Set isPaused false.

   - handleStop:
     Speech.stop(), stop highlight controls, reset all state to initial.

   - Update TTS controls bar:
     Show Play "▶" when !isPlaying && !isPaused
     Show Pause "⏸" when isPlaying && !isPaused
     Show Resume "▶" when isPaused
     Show Stop "⏹" when isPlaying || isPaused
     Buttons: DIMENSIONS.ttsControlSize (48dp), circular, COLORS.primary bg, white text
     Hide if words.length === 0

   - useEffect cleanup: on unmount, Speech.stop() + clear timer

Run npx tsc --noEmit to verify.
```

**After this phase**: Play reads aloud with word-by-word highlighting. Pause/Resume/Stop all work. This is the wow moment.

---

## PHASE 7 — Settings Screen UI

**Complexity**: Medium — three interactive components wired to context
**What this does**: Builds the Settings Screen with all three controls. Changes apply instantly and persist.

**Checklist**:
- [ ] FontSizeSlider component
- [ ] ColorPicker component
- [ ] SpeedSelector component
- [ ] Settings screen layout
- [ ] Preview area with sample text
- [ ] All changes sync to SettingsContext

**PROMPT**:

```
Read docs/SCREENS.md (SettingsScreen section) and docs/DESIGN_TOKENS.md. Then:

1. Create src/components/FontSizeSlider.tsx:
   - Props: value (number), onValueChange (size: number) => void
   - Simple implementation: a row with "-" button, current value displayed in center (bold), "+" button
   - Buttons decrement/increment by 1, clamped to FONT_SIZES.readerMin (16) and readerMax (28)
   - Make the buttons DIMENSIONS.minTouchTarget size (48dp), circular
   - Show "16" label on left end, "28" on right end, current value large in center
   - Use COLORS.primary for the active value text

2. Create src/components/ColorPicker.tsx:
   - Props: selectedColor (string), onColorChange (color: string) => void
   - Import BACKGROUND_OPTIONS from constants.ts
   - Horizontal row of four circular swatches (DIMENSIONS.colorSwatchSize = 40dp)
   - Each: backgroundColor from option hex
   - Selected: 3dp border COLORS.primary
   - Unselected: 1dp border COLORS.border
   - Label below each swatch (FONTS.regular, FONT_SIZES.small)
   - onPress calls onColorChange with the hex

3. Create src/components/SpeedSelector.tsx:
   - Props: selectedSpeed (number), onSpeedChange (speed: number) => void
   - Three horizontal toggle buttons: "Slow" (0.75), "Normal" (1.0), "Fast" (1.25)
   - Selected: COLORS.primary bg, white text
   - Unselected: white bg, COLORS.textDark text, COLORS.border border
   - All flex: 1, height 44dp, border radius 8

4. Build src/screens/SettingsScreen.tsx:
   - useSettings() for all values
   - Custom header: "< Back" left (navigation.goBack()), "Settings" centered
   - White background (COLORS.surfaceWhite)
   - Three labeled sections: "Font Size", "Background Color", "Reading Speed"
   - Each label: FONTS.bold, FONT_SIZES.body
   - SPACING.sectionGap between sections, SPACING.screenPadding padding
   - Preview area at bottom: small rounded box with current backgroundColor showing "The quick brown fox jumps over the lazy dog" in FONTS.regular at current fontSize with SPACING.letterSpacing
   - Each onChange calls the corresponding update function from useSettings()

Run npx tsc --noEmit to verify.
```

**After this phase**: Settings fully functional. Changes reflect instantly on the Reader Screen and persist across sessions.

---

# DAY 2

---

## PHASE 8 — Edge Cases, Error Handling & Robustness

**Complexity**: Medium — many small fixes, no single hard problem
**What this does**: Hardens the app. No crashes, no blank screens, no unhandled errors.

**Checklist**:
- [ ] All edge cases from SCREENS.md handled
- [ ] try/catch on every async call
- [ ] Loading states on all async ops
- [ ] Rapid tapping doesn't crash
- [ ] Navigation cleanup stops TTS
- [ ] Empty/null text handled gracefully

**PROMPT**:

```
Read docs/CLAUDE.md ("What NOT To Do" and "Key Technical Gotchas"). Do a robustness pass across the entire codebase:

1. CameraScreen:
   - Polish the permission denied view: proper padding, centered, FONTS/COLORS consistent
   - Guard: if cameraRef.current is null on capture, show alert, don't crash
   - Verify isProcessing prevents double-tap on capture button

2. ReaderScreen:
   - Guard: const text = route.params?.extractedText ?? '' — handle undefined/null
   - Disable/hide Play button when words.length === 0
   - Guard in handlePlay: if words.length === 0, return early
   - Guard in handleResume: if currentWordIndex >= words.length, call handleStop
   - handleStop wrapped in try/catch — never throws
   - useEffect cleanup: Speech.stop() + clear timers on unmount
   - Verify navigating away during TTS stops everything cleanly

3. SettingsScreen:
   - Clamp font size to 16-28 even with rapid tapping
   - Color picker constrained to BACKGROUND_OPTIONS values only

4. ocrProcessor.ts:
   - try/catch returns "" on ANY error including TextRecognition being undefined

5. ttsEngine.ts:
   - Guard: if timeline is empty, call onComplete immediately, return no-op controls
   - stop() in HighlightControls safe to call multiple times (guard with a stopped flag)

6. App.tsx:
   - Font loading error: still render app (system font fallback, not crash)

7. Search entire codebase for any await without try/catch. Add error handling to every one.

Run npx tsc --noEmit to verify.
```

**After this phase**: Crash-proof. Every error has a friendly UI.

---

## PHASE 9 — Visual Polish Pass

**Complexity**: Medium — many small tweaks, each is simple
**What this does**: Makes the app look like a finished product, not a prototype.

**Checklist**:
- [ ] StatusBar styling per screen
- [ ] OpenDyslexic on ALL visible text
- [ ] Press feedback on all touchables
- [ ] Smooth screen transitions
- [ ] Professional TTS control bar
- [ ] Header separators
- [ ] Word highlight looks like marker pen

**PROMPT**:

```
Do a visual polish pass across the entire app. Reference docs/DESIGN_TOKENS.md.

1. App-wide:
   - StatusBar: dark-content on light screens (Home, Reader, Settings), light-content on Camera
   - Verify EVERY user-visible text uses OpenDyslexic (FONTS.regular or FONTS.bold). No system font anywhere — buttons, headers, errors, empty states, labels, everything.
   - All Pressable components have press feedback (opacity or scale)

2. HomeScreen:
   - Add simple opacity fade-in on mount (Animated.timing, 300ms)
   - "Scan Text" press state: opacity 0.85 + scale 0.98

3. CameraScreen:
   - Capture button: scale 0.9 on press, spring back
   - Loading overlay: COLORS.overlay bg, white ActivityIndicator, "Processing..." in FONTS.regular
   - Camera preview fills edge to edge — no gaps

4. ReaderScreen:
   - TTS controls: circular buttons, proper spacing, large centered symbols (▶ ⏸ ⏹)
   - Header: subtle bottom border (COLORS.border, 1px) to separate from content
   - Word highlight: add paddingHorizontal 2 and borderRadius 4 to highlighted word for marker-pen effect
   - Long text scrolls smoothly

5. SettingsScreen:
   - Consistent section spacing
   - Preview area: subtle border, rounded corners
   - Color swatches: SPACING.smallGap gap between them

6. Navigation:
   - Stack.Navigator screenOptions: animation 'slide_from_right'

Run npx tsc --noEmit to verify.
```

**After this phase**: The app looks and feels like a real product.

---

## PHASE 10 — Dev Client Build & Device Testing

**Complexity**: Low code, critical verification
**What this does**: Generates native project and prepares for on-device testing.

**Checklist**:
- [ ] Prebuild generates Android native project
- [ ] Config verified
- [ ] Build commands printed

**PROMPT**:

```
Prepare the project for native Android building:

1. Run: npx expo prebuild --clean

2. Verify android/ folder was created with android/app/build.gradle

3. Check @react-native-ml-kit/text-recognition is linked in the native project — look in android/app/build.gradle and android/settings.gradle

4. Run: npx expo-doctor — report any issues

5. Verify app.json: android.package set, CAMERA permission, expo-camera plugin present

6. Print the exact step-by-step commands I need to run manually:
   - EAS build command for dev client
   - How to download the APK from Expo dashboard
   - How to install on device via ADB: adb install path/to/apk
   - How to start dev server: npx expo start --dev-client
   - How to connect from the phone
```

**After this phase**: You run the commands manually, install on your phone, and test the full flow on real hardware. This is where you find out if everything works for real.

---

## PHASE 11 — Final APK & Submission Prep

**Complexity**: Low code, high stakes
**What this does**: Builds the standalone APK and prepares all submission materials.

**Checklist**:
- [ ] Devpost description written
- [ ] Video script/outline created
- [ ] Build command ready
- [ ] Submission checklist referenced

**PROMPT**:

```
Prepare everything for final submission:

1. Write docs/DEVPOST_DESCRIPTION.md — a Devpost project description for ClearRead:
   - Compelling one-liner opening
   - "Inspiration" section: the problem, statistics (1 in 5 people, ~400 students at Green Level, 85% unidentified)
   - "What it does" section: core loop explained simply
   - "How we built it" section: React Native, Expo, ML Kit, OpenDyslexic, expo-speech, TypeScript
   - "Challenges we ran into": TTS word sync timing, OCR accuracy in varied lighting, 2-day time constraint
   - "Accomplishments we're proud of": five simultaneous dyslexia interventions, fully on-device processing, zero network dependencies
   - "What we learned": team growth points
   - "What's next": scan history, multi-language, handwriting, iOS version
   - "Built with" tags: React Native, Expo, TypeScript, Google ML Kit, expo-camera, expo-speech, AsyncStorage, OpenDyslexic

2. Create docs/VIDEO_SCRIPT.md with the pitch video outline:
   - 0:00–1:00 Problem statement with statistics
   - 1:00–2:00 Solution introduction: what ClearRead does, how it's different
   - 2:00–4:00 Live demo on real printed text: full flow from scan to read-aloud
   - 4:00–4:30 Team introduction and roles
   - 4:30–6:00 Group reflection: what we learned, challenges, how teamwork helped
   - Key talking points for each section
   - Demo tips: use good lighting, hold phone steady, use a textbook with dense text for max impact

3. Print the final build command: eas build --platform android --profile preview

4. Print the Devpost submission checklist from docs/SUBMISSION_CHECKLIST.md as a reminder.
```

**After this phase**: Trigger the build, film the video, submit to Devpost. Done.

---

# HOW TO GO FROM DOCS → RUNNING PROJECT

Your exact startup sequence:

1. **Create project folder**: `mkdir clearread && cd clearread`
2. **Create docs/ folder**: `mkdir docs`
3. **Copy all 8 doc files** into `docs/` (CLAUDE.md, TASKS.md, ARCHITECTURE.md, SCREENS.md, TTS_HIGHLIGHT_SPEC.md, EAS_BUILD_GUIDE.md, DESIGN_TOKENS.md, SUBMISSION_CHECKLIST.md)
4. **Place font files** in the root for now (Phase 1 moves them to assets/fonts/)
5. **Open terminal** in the clearread directory
6. **Start Claude Code CLI**: `claude`
7. **Paste the Phase 1 prompt** — Claude Code reads your docs, scaffolds everything
8. **Review output** — check for errors, verify it runs
9. **Paste Phase 2 prompt** — continue phase by phase

**The docs ARE the development plan.** You don't need to tell Claude Code to "plan" anything. Each phase prompt tells it exactly what to read and what to build. Just paste and go.
