# SUBMISSION_CHECKLIST.md — Final Devpost Submission

> Use this checklist in the final hour of Day 2. Go through every item. A missed deliverable means disqualification.

---

## Devpost Submission Requirements

The RSA competition requires ALL of the following submitted via the Devpost hackathon page. Incomplete submissions risk disqualification.

### 1. APK File

- [ ] Final APK built with `eas build --platform android --profile preview`
- [ ] APK downloaded from Expo dashboard
- [ ] APK installed and tested on a physical Android device
- [ ] Full test pass completed (see test checklist below)
- [ ] APK file renamed to `ClearRead_v1.0_GreenLevelHS.apk`
- [ ] APK uploaded to Devpost submission form

### 2. Pitch + Demo + Reflection Video (≤6 minutes)

The video is a single combined video containing all three parts. It must be **6 minutes or less**.

**Part A: App Pitch (~1–1.5 min)**
- [ ] Problem statement with supporting data:
  - 1 in 5 people worldwide have dyslexia (IDA)
  - ~400 students at Green Level alone are statistically affected
  - 85% of students with reading disabilities go unidentified
  - Existing tools only work on digital content, not the physical world
- [ ] Solution overview: what ClearRead does in one sentence
- [ ] What makes ClearRead different from competitors

**Part B: Live App Demo (~2 min)**
- [ ] Show the Home Screen with ClearRead branding
- [ ] Tap "Scan Text" — show camera opening
- [ ] Point at a **real printed textbook page or handout** (this is the hero moment)
- [ ] Capture and show OCR processing
- [ ] Show the Reader Screen with the dramatic before/after:
  - OpenDyslexic font
  - Tinted background
  - Wide spacing and line height
- [ ] Tap Play — show TTS reading aloud with word-by-word highlighting
- [ ] Show Settings: change font size, background color, reading speed
- [ ] Demonstrate settings taking effect on the Reader Screen

**Part C: Group Reflection (~1.5 min)**
- [ ] All team members visible on camera
- [ ] Address all three required reflection questions (from the RSA project workbook):
  1. What did you learn during the app development process?
  2. What challenges did you face and how did you overcome them?
  3. How did working as a team contribute to the final product?
- [ ] Answers are specific (reference actual decisions, bugs, or team moments — not generic)

**Video Technical Requirements**
- [ ] Video is ≤6 minutes total
- [ ] Audio is clear and audible
- [ ] Demo shows the app running on a real device (not an emulator)
- [ ] Video uploaded to YouTube (unlisted) or similar platform
- [ ] Video link added to Devpost submission

### 3. Group Reflection Worksheet

- [ ] Downloaded the RSA Group Reflection Worksheet from the Devpost resources page
- [ ] All questions answered completely
- [ ] All team members' names included
- [ ] Answers demonstrate genuine thought about the process (not surface-level)
- [ ] Worksheet uploaded to Devpost submission

### 4. Devpost Submission Form Fields

- [ ] **Project Name**: ClearRead
- [ ] **Short Description**: A dyslexia-friendly camera reader that transforms printed text into an accessible, optimized reading experience with read-aloud and word highlighting.
- [ ] **Full Description**: Detailed write-up of the problem, solution, features, and technical approach (write in Devpost's markdown editor)
- [ ] **Built With Tags**: React Native, Expo, TypeScript, Google ML Kit, expo-camera, expo-speech, AsyncStorage, OpenDyslexic
- [ ] **Thumbnail Image**: Screenshot of the Reader Screen showing formatted text (3:2 ratio, JPG/PNG, <5MB)
- [ ] **Screenshots**: Include at least 3:
  1. Home Screen
  2. Camera Screen capturing text
  3. Reader Screen with formatted text and highlighting active
  4. Settings Screen (optional 4th)
- [ ] **Video Link**: YouTube (unlisted) or Vimeo link to the pitch/demo/reflection video
- [ ] **APK File**: Uploaded via the file upload field
- [ ] **Group Reflection Worksheet**: Uploaded via the file upload field
- [ ] All required fields are filled — no empty required fields

### 5. Final Verification

- [ ] **Preview the submission** using Devpost's "View" button before finalizing
- [ ] Verify video link works (open in incognito browser)
- [ ] Verify APK file downloaded correctly from Devpost (re-download and check file size)
- [ ] Verify all team members are listed on the Devpost project
- [ ] **Mark submission as SUBMITTED** (not just saved as draft)
- [ ] Confirm submission timestamp is before the deadline

---

## APK Test Checklist (Pre-Submission)

Run this full test on the **standalone preview APK**, not the dev client:

### Core Flow
- [ ] App opens to Home Screen
- [ ] "ClearRead" branding and tagline visible in OpenDyslexic
- [ ] "Scan Text" button navigates to Camera Screen
- [ ] Camera permission dialog shows custom message
- [ ] Camera preview is live
- [ ] Capture button takes photo
- [ ] Loading indicator shows during OCR
- [ ] Reader Screen displays extracted text
- [ ] Text is in OpenDyslexic font
- [ ] Background is cream tint (default)
- [ ] Letter spacing is visibly wider than normal
- [ ] Line height is visibly taller than normal
- [ ] Play button starts TTS
- [ ] Words highlight in yellow as TTS speaks
- [ ] Pause freezes speech and highlight
- [ ] Resume continues from paused position
- [ ] Stop resets to beginning
- [ ] Back button returns to Camera Screen

### Settings
- [ ] Font size slider changes text size on Reader
- [ ] Color picker changes Reader background
- [ ] Speed selector changes TTS speed
- [ ] Kill app and relaunch — all settings persist

### Edge Cases
- [ ] Deny camera permission → friendly fallback screen shown
- [ ] Capture a blank/non-text surface → "No text detected" message
- [ ] Rapidly tap capture button → no crash
- [ ] Rapidly tap Play/Stop → no crash
- [ ] Background the app during TTS → audio continues
- [ ] Return to app → highlight is in reasonable position

### Quality
- [ ] No crashes during entire test session
- [ ] No blank screens or unhandled errors
- [ ] All text throughout the app uses OpenDyslexic
- [ ] Touch targets are easily tappable (≥48dp)
- [ ] Overall visual impression is polished, not "hackathon rough"

---

## Emergency: What If Something Is Broken at Submission Time?

| Problem | Action |
|---------|--------|
| APK crashes on launch | Rebuild with `--profile preview`. If EAS queue is slow, use `npx expo run:android` locally. |
| TTS doesn't work on standalone APK | Submit anyway. Demonstrate TTS in the video using a screen recording from the dev client. Note in the description that TTS requires device-specific TTS engine. |
| Video exceeds 6 minutes | Cut the reflection section to bare minimum. The demo is the highest-value section — protect it. |
| Devpost upload fails | Try a different browser. Try uploading via the Devpost mobile app. Email the APK to ciera.tucker@nc.gov with your team name if upload is totally broken. |
| Missing the Group Reflection Worksheet | Download it from the Devpost resources tab, fill it out quickly, upload immediately. |

---

## Timeline: Last 3 Hours

| Time | Action |
|------|--------|
| T-3:00 | Trigger final APK build. Begin video planning. |
| T-2:30 | Download APK. Run full test checklist above. |
| T-2:00 | Film video. Keep it under 6 minutes. |
| T-1:00 | Upload video to YouTube (unlisted). Complete Devpost form. Upload APK + worksheet. |
| T-0:30 | Preview submission. Verify all links work. Verify all files uploaded. |
| T-0:15 | **SUBMIT.** Do not wait until the last minute. |
| T-0:00 | Deadline. Breathe. |
