# CLAUDE.md — ClearRead Project Context

## What Is This Project

ClearRead is an Android app that turns any smartphone camera into a real-time dyslexia accessibility tool for the physical world. The user points their phone at printed text (textbook, handout, menu, whiteboard), the app extracts the text via on-device OCR, and re-renders it in a dyslexia-optimized format with synchronized read-aloud and word-by-word highlighting.

This app is being built for the **NC Ready Set App (RSA) Competition, Cycle 7, 2025–2026** by a team from Green Level High School in Cary, NC. The competition requires an **Android APK** submitted to Devpost along with a ≤6 minute pitch/demo video and a group reflection worksheet.

**Build window: 2 days. This is an MVP sprint. Speed and reliability over feature count.**

---

## Competition Constraints (Non-Negotiable)

- **Platform**: Android only. Final deliverable is a `.apk` file.
- **Submission**: APK + pitch/demo/reflection video (≤6 min) + Group Reflection Worksheet + all Devpost fields.
- **Content rules**: No explicit, violent, derogatory, or politically promotional content. No copyrighted materials without permission. No malicious code.
- **Judging criteria** (all equally weighted): Problem Relevance, Adequacy of Solution, UX Quality, Pitch Video Quality, Collaboration/Team Development, Reflection, Presentation & Distinctiveness.

---

## Tech Stack

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| Framework | React Native (Expo) | SDK 52+, managed workflow with prebuild |
| Language | TypeScript | Strict mode enabled |
| OCR | `@react-native-ml-kit/text-recognition` | On-device Google ML Kit. **Requires dev client, NOT Expo Go.** |
| Camera | `expo-camera` | Handles permissions, preview, capture |
| Font | `expo-font` | Loads OpenDyslexic .ttf from assets/fonts/ |
| TTS | `expo-speech` | Android native TTS wrapper. Supports rate control. |
| Storage | `@react-native-async-storage/async-storage` | Key-value persistence for settings |
| Navigation | `@react-navigation/native` + `@react-navigation/native-stack` | Simple 4-screen stack |
| Build | EAS Build | Cloud build → `.apk` output. Profile: `preview` |

### Critical: Dev Client Requirement

`@react-native-ml-kit/text-recognition` includes native Android modules that are NOT compatible with Expo Go. Before any real testing:

1. Run `npx expo prebuild` to generate native Android project files.
2. Run `eas build --profile development --platform android` to create a dev client APK.
3. Install that dev client on the physical test device.
4. All subsequent testing uses this dev client, NOT Expo Go.

---

## Project Structure

```
clearread/
├── docs/                          # Project documentation (you are here)
│   ├── CLAUDE.md
│   ├── TASKS.md
│   ├── ARCHITECTURE.md
│   ├── SCREENS.md
│   ├── TTS_HIGHLIGHT_SPEC.md
│   ├── EAS_BUILD_GUIDE.md
│   ├── DESIGN_TOKENS.md
│   └── SUBMISSION_CHECKLIST.md
├── assets/
│   └── fonts/
│       ├── OpenDyslexic-Regular.ttf
│       └── OpenDyslexic-Bold.ttf
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── ReaderScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── CaptureButton.tsx
│   │   ├── WordHighlighter.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── FontSizeSlider.tsx
│   │   └── SpeedSelector.tsx
│   ├── context/
│   │   └── SettingsContext.tsx
│   ├── utils/
│   │   ├── ocrProcessor.ts
│   │   ├── ttsEngine.ts
│   │   └── constants.ts
│   └── navigation/
│       └── AppNavigator.tsx
├── app.json
├── eas.json
├── tsconfig.json
└── package.json
```

---

## Code Conventions

### File & Naming Rules

- All components and screens are **functional components with hooks**. No class components.
- File names: PascalCase for components/screens (`ReaderScreen.tsx`), camelCase for utils (`ocrProcessor.ts`).
- One component per file. Named export matching filename, plus a default export.
- All style values come from `src/utils/constants.ts` — **no magic numbers or inline hex codes** anywhere else.

### TypeScript Rules

- Strict mode. No `any` types unless absolutely unavoidable (and if so, add a `// TODO: type this properly` comment).
- All navigation params are typed via a `RootStackParamList` type in `src/navigation/AppNavigator.tsx`.
- Props interfaces are defined in the same file as the component, named `{ComponentName}Props`.

### Component Patterns

- Use `StyleSheet.create()` for all styles. No inline style objects.
- All async operations (OCR, AsyncStorage reads) must have try/catch with user-facing error handling.
- Loading states must be shown during OCR processing (ActivityIndicator or similar).
- All touchable areas must be minimum 48x48dp for accessibility.

### State Management

- **Global state**: `SettingsContext` (React Context + AsyncStorage) for user preferences (fontSize, backgroundColor, readingSpeed).
- **Local state**: Screen-level `useState`/`useRef` for UI state (camera ref, TTS playback state, current word index).
- **Navigation params**: OCR result text is passed from CameraScreen → ReaderScreen via `navigation.navigate('Reader', { extractedText })`.
- No Redux. No Zustand. No external state libraries. React Context is sufficient for 3 settings values.

### Import Order

```typescript
// 1. React / React Native
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

// 2. Third-party libraries
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';

// 3. Internal navigation / context
import { useSettings } from '../context/SettingsContext';

// 4. Internal components
import { CaptureButton } from '../components/CaptureButton';

// 5. Utils / constants
import { COLORS, FONTS, SPACING } from '../utils/constants';
```

---

## Design Tokens (Quick Reference)

All values are defined in `src/utils/constants.ts`. Reference that file as the source of truth. Summary:

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `COLORS.primary` | `#1B4FD8` | Buttons, accents, branding |
| `COLORS.bgCream` | `#FEF9EF` | Default reader background |
| `COLORS.bgYellow` | `#FEFCE8` | Alt reader background |
| `COLORS.bgBlue` | `#EFF6FF` | Alt reader background |
| `COLORS.bgWhite` | `#FFFFFF` | Alt reader background, settings bg |
| `COLORS.highlight` | `#FEF08A` | Active word highlight during TTS |
| `COLORS.textDark` | `#1F2937` | Primary text |
| `COLORS.textMuted` | `#6B7280` | Secondary text |

### Typography
| Token | Value |
|-------|-------|
| `FONTS.regular` | `'OpenDyslexic-Regular'` |
| `FONTS.bold` | `'OpenDyslexic-Bold'` |
| `FONT_SIZES.readerDefault` | `20` (pt) |
| `FONT_SIZES.readerMin` | `16` |
| `FONT_SIZES.readerMax` | `28` |
| `SPACING.letterSpacing` | `2.5` (px) |
| `SPACING.lineHeightMultiplier` | `1.9` |

### Reading Speed
| Token | Value |
|-------|-------|
| `SPEED.slow` | `0.75` |
| `SPEED.normal` | `1.0` |
| `SPEED.fast` | `1.25` |

---

## The Four Screens (Summary)

1. **HomeScreen** — App branding (ClearRead name + tagline in OpenDyslexic), single large "Scan Text" button. Zero friction. No onboarding, no accounts.

2. **CameraScreen** — Full-screen live camera viewfinder. Large circular capture button at bottom center. Handles camera permission request with friendly rationale. On capture: runs ML Kit OCR → navigates to ReaderScreen with extracted text.

3. **ReaderScreen** — THE CORE. Extracted text rendered in OpenDyslexic with tinted background, wide letter/word spacing, tall line height. Play button triggers TTS with word-by-word yellow highlighting. Pause/Resume/Stop controls. Back button to rescan. Empty state if OCR returned nothing.

4. **SettingsScreen** — Font size slider (16–28pt), background color picker (4 tint options), reading speed selector (Slow/Normal/Fast). All settings persist via AsyncStorage. Changes apply in real-time.

---

## What NOT To Do

These are hard rules. Do not violate them.

- **DO NOT use Expo Go for testing.** ML Kit requires a custom dev client. Build it on Day 1.
- **DO NOT add a backend, database, cloud API, or auth system.** Everything runs on-device. Zero network dependencies at runtime.
- **DO NOT install Redux, Zustand, MobX, or any state management library.** React Context handles this.
- **DO NOT add features not listed in the PRD.** No scan history, no favorites, no multi-language, no sharing, no export. This is a 2-day MVP.
- **DO NOT use inline styles.** Use `StyleSheet.create()` and import values from `constants.ts`.
- **DO NOT hardcode color hex values or font sizes outside of `constants.ts`.** Every visual value has one source of truth.
- **DO NOT create class components.** Functional components with hooks only.
- **DO NOT skip error handling on async operations.** Every `await` needs a try/catch. Every camera/OCR/TTS call needs a failure path.
- **DO NOT over-engineer.** Simple, readable code that works > clever abstractions that might break. We have 2 days.
- **DO NOT use `console.log` for user-facing errors.** Show proper UI error states.

---

## Task Tracking Rule

Whenever a task or phase item is completed **and confirmed working** (TypeScript clean + visible/functional on device or emulator), immediately check it off in `docs/TASKS.md` by replacing `[ ]` with `[x]`. Do this proactively — do not wait to be asked.

---

## Priority Tiers

When in doubt about what to build or how much to polish, reference these tiers:

**P0 — Must Ship (core loop or submission is invalid):**
Camera capture, OCR extraction, OpenDyslexic rendering, tinted background, increased spacing + line height, TTS read-aloud, word highlighting, Home Screen, basic Settings, APK build.

**P1 — Should Ship (drop only under severe time pressure):**
Pause/Resume/Stop TTS controls, reading speed setting, first-launch camera tip, settings persistence, error states for empty OCR and permission denial.

**P2 — Nice to Have (skip if any Day 2 time pressure):**
Flash toggle, smooth highlight animations, splash screen animation, granular font size increments.

---

## Key Technical Gotchas

1. **ML Kit + Expo = dev client required.** Cannot stress this enough. `npx expo prebuild` then `eas build --profile development --platform android` before real testing begins.

2. **expo-speech has no word-boundary callbacks on Android.** You must estimate word timing using speech rate and word length, then advance the highlight on a timer. Re-sync at sentence boundaries. See `docs/TTS_HIGHLIGHT_SPEC.md` for the full algorithm.

3. **Camera permission must be requested at runtime on Android 6+.** `expo-camera` handles this, but you need a friendly fallback UI if denied — not just a crash or blank screen.

4. **AsyncStorage is async.** Settings must be loaded before the first render of ReaderScreen. Use a loading state or load settings in the SettingsContext provider at app startup.

5. **OpenDyslexic font must finish loading before any screen renders text.** Use `expo-font`'s `useFonts` hook or `Font.loadAsync` in the app root with a splash/loading gate.

6. **EAS Build can take 10–20 minutes in the free tier queue.** Trigger your first build early on Day 1 to validate the config. Don't wait until Day 2 afternoon.

7. **The final APK must be a `.apk`, not `.aab`.** Set `"buildType": "apk"` in `eas.json` under the preview profile.

---

## Reference Documents

- `docs/TASKS.md` — Hour-by-hour build checklist. Start each session here.
- `docs/ARCHITECTURE.md` — Component tree, data flow, navigation graph, dependency list.
- `docs/SCREENS.md` — Detailed per-screen spec with exact props, state, interactions.
- `docs/TTS_HIGHLIGHT_SPEC.md` — Full algorithm for word-by-word highlight sync.
- `docs/EAS_BUILD_GUIDE.md` — Build configuration, commands, troubleshooting.
- `docs/DESIGN_TOKENS.md` — Complete visual constants (colors, fonts, spacing, dimensions).
- `docs/SUBMISSION_CHECKLIST.md` — Final Devpost submission requirements.
- `docs/ClearRead_PRD_v1.0.docx` — Full Product Requirements Document (source of truth).
