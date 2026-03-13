# EAS_BUILD_GUIDE.md — Build Configuration & APK Generation

> Follow this guide exactly. Build issues at the end of Day 2 are the #1 competition-killer.

---

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Expo account created at https://expo.dev
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged in: `eas login`
- [ ] Physical Android device with USB debugging enabled

---

## eas.json Configuration

Create this file in the project root:

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {}
}
```

**Key detail**: The `preview` profile uses `"buildType": "apk"` — this produces a `.apk` file (not `.aab`). The RSA competition requires an APK upload to Devpost.

---

## app.json Configuration

Ensure these fields are set in `app.json`:

```json
{
  "expo": {
    "name": "ClearRead",
    "slug": "clearread",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FEF9EF"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1B4FD8"
      },
      "package": "com.clearread.app",
      "permissions": ["CAMERA"]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "ClearRead needs camera access to scan printed text and make it readable for you."
        }
      ]
    ]
  }
}
```

**Critical fields**:
- `android.package`: Must be set. Use `com.clearread.app`.
- `android.permissions`: Include `CAMERA`.
- `plugins`: The expo-camera plugin with a custom permission message string.

---

## Build Commands

### 1. Dev Client Build (Day 1 — for testing)

This creates a development APK that connects to your local Expo dev server, giving you hot reload while using native modules like ML Kit.

```bash
# Generate native Android project files
npx expo prebuild

# Build dev client APK in the cloud
eas build --profile development --platform android
```

After the build completes (~10-20 min in free tier):
1. Download the APK from the Expo dashboard or use the QR code / URL printed in terminal.
2. Transfer to your Android phone (ADB, email, Google Drive, or direct download).
3. Install the APK on the device.
4. Start the Expo dev server: `npx expo start --dev-client`
5. Open the dev client app on your phone — it should discover and connect to the dev server.

### 2. Preview Build (Day 2 — final APK for submission)

This creates a standalone APK that works without a dev server. This is what you upload to Devpost.

```bash
eas build --platform android --profile preview
```

After the build completes:
1. Download the `.apk` file from the Expo dashboard.
2. Install on your physical device.
3. Test the full flow — this APK must work completely standalone.
4. **This is the file you upload to Devpost.**

### 3. Quick Check: Verify Build Config

Before triggering any build, verify your config is valid:

```bash
# Check that eas.json is valid
eas build:configure

# Verify project config
npx expo-doctor
```

---

## Build Timeline Strategy

| When | Action | Why |
|------|--------|-----|
| Day 1, Block 1 | Trigger dev client build | Build while coding so it's ready when you need to test on device |
| Day 1, end of day | Verify dev client works on device | Catch config issues early |
| Day 2, Block 8 start | Trigger preview build | Final APK for submission |
| Day 2, Block 8 +20min | Download and test APK | Must verify standalone operation |
| Day 2, if fixes needed | Trigger second preview build | Budget time for one retry build |

**Free tier queue times**: Builds can take 10-20 minutes depending on queue. During peak times it may be longer. Always trigger builds early and continue working on other tasks while waiting.

---

## Common Build Errors & Fixes

### Error: "Missing android.package in app.json"

```
Fix: Add "package": "com.clearread.app" under expo.android in app.json
```

### Error: "SDK version mismatch"

```
Fix: Run `npx expo install --fix` to align all dependency versions with your SDK
```

### Error: "@react-native-ml-kit/text-recognition not found"

This package requires prebuild. It won't work in a bare Expo Go build.

```
Fix: 
1. npx expo prebuild --clean
2. Verify android/ folder was generated
3. Rebuild: eas build --profile development --platform android
```

### Error: "Gradle build failed" with font loading issues

```
Fix: Ensure .ttf files are in assets/fonts/ (not nested deeper)
Ensure app.json doesn't have conflicting font configuration
```

### Error: Build succeeds but camera doesn't work on device

```
Fix: Check that expo-camera plugin is in app.json plugins array
Check that CAMERA permission is in android.permissions
On the device, manually grant camera permission in Settings > Apps > ClearRead > Permissions
```

### Error: APK installs but crashes on launch

```
Fix: Check Expo dashboard build logs for warnings
Run `npx expo-doctor` to find dependency conflicts
Ensure all native dependencies are compatible with your SDK version:
  npx expo install --fix
```

### Error: "EAS Build queue is full" / build takes >30 minutes

```
Workaround: If you have Android Studio installed locally, you can build locally instead:
  npx expo run:android
This produces an APK in android/app/build/outputs/apk/
Much faster but requires local Android SDK setup.
```

---

## Pre-Submission APK Checklist

Before uploading the APK to Devpost, verify ALL of the following on the standalone APK (not the dev client):

- [ ] App installs without errors
- [ ] App opens to Home Screen with ClearRead branding
- [ ] "Scan Text" navigates to camera
- [ ] Camera permission dialog appears with custom message
- [ ] Camera preview is live and responsive
- [ ] Capture button takes photo and shows loading
- [ ] OCR extracts text from a real printed page
- [ ] Reader Screen shows text in OpenDyslexic with tinted background
- [ ] Play button triggers TTS with word highlighting
- [ ] Pause/Resume works (or graceful fallback)
- [ ] Stop resets highlighting
- [ ] Settings changes (font size, color, speed) persist after app kill
- [ ] Back navigation works on all screens
- [ ] No crashes during the full demo flow
- [ ] APK file size is reasonable (<50MB)

---

## File Naming for Devpost Upload

Name the APK file clearly for the judges:

```
ClearRead_v1.0_GreenLevelHS.apk
```

Upload this file in the Devpost submission form under the APK/file upload field.
