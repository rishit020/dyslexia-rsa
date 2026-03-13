# TTS_HIGHLIGHT_SPEC.md — Word-by-Word Highlight Synchronization

> This is the single hardest feature in ClearRead and the demo "wow factor." Read this entire document before implementing.

---

## The Problem

`expo-speech` (which wraps Android's native TTS engine) does **not** provide per-word callbacks on Android. There is no `onWord` or `onBoundary` event that fires each time the TTS engine starts speaking a new word. The only reliable callbacks are:

| Callback | When It Fires |
|----------|--------------|
| `onStart` | When speech begins |
| `onDone` | When the entire utterance finishes |
| `onStopped` | When speech is manually stopped |
| `onError` | On TTS error |

There is **no** `onBoundary` / `onWord` event available on Android through expo-speech.

This means we must **estimate** which word is currently being spoken and advance the highlight on a timer.

---

## The Algorithm

### Overview

1. Split the text into a word array.
2. Calculate an estimated duration for each word based on its character length and the speech rate.
3. Start a `setInterval` timer that advances the `currentWordIndex` based on accumulated time.
4. When the TTS finishes (`onDone`), snap the highlight to the end.

### Step 1: Text Preprocessing

```typescript
function prepareWords(text: string): string[] {
  return text
    .split(/\s+/)          // Split on any whitespace
    .filter(word => word.length > 0);  // Remove empty strings
}
```

### Step 2: Word Duration Estimation

The key insight: TTS engines speak at roughly **150 words per minute** at normal speed (rate = 1.0). Shorter words are spoken faster than longer words, but the relationship is roughly linear with character count.

**Base constants:**

```typescript
const BASE_WPM = 150;                         // Words per minute at rate 1.0
const BASE_WORD_DURATION_MS = 60000 / BASE_WPM; // ~400ms per word at rate 1.0
const MIN_WORD_DURATION_MS = 200;               // Floor — even short words take some time
const CHAR_WEIGHT_MS = 30;                       // Additional ms per character beyond 4 chars
```

**Duration formula for a single word:**

```typescript
function estimateWordDuration(word: string, speechRate: number): number {
  // Base duration, adjusted for word length
  const lengthFactor = word.length <= 4
    ? BASE_WORD_DURATION_MS
    : BASE_WORD_DURATION_MS + (word.length - 4) * CHAR_WEIGHT_MS;

  // Adjust for speech rate (faster rate = shorter duration)
  const adjusted = lengthFactor / speechRate;

  // Apply floor
  return Math.max(adjusted, MIN_WORD_DURATION_MS / speechRate);
}
```

**Example durations at rate 1.0:**

| Word | Chars | Estimated Duration |
|------|-------|--------------------|
| "a" | 1 | 400ms |
| "the" | 3 | 400ms |
| "read" | 4 | 400ms |
| "camera" | 6 | 460ms |
| "dyslexia" | 8 | 520ms |
| "accessibility" | 13 | 670ms |

### Step 3: Build a Timeline

Before starting playback, pre-compute the cumulative start time for each word:

```typescript
interface WordTiming {
  word: string;
  startMs: number;   // When this word should start being highlighted
  durationMs: number; // How long this word stays highlighted
}

function buildTimeline(words: string[], speechRate: number): WordTiming[] {
  const timeline: WordTiming[] = [];
  let cumulativeMs = 0;

  for (const word of words) {
    const duration = estimateWordDuration(word, speechRate);
    timeline.push({
      word,
      startMs: cumulativeMs,
      durationMs: duration,
    });
    cumulativeMs += duration;
  }

  return timeline;
}
```

### Step 4: Timer-Based Highlight Advancement

Use a single `setInterval` with a 100ms tick rate. On each tick, check elapsed time against the timeline and update the highlighted word index.

```typescript
const TICK_INTERVAL_MS = 100; // Check every 100ms — smooth enough, low CPU cost

function startHighlighting(
  timeline: WordTiming[],
  setCurrentWordIndex: (index: number) => void,
  onComplete: () => void
): { pause: () => void; resume: () => void; stop: () => void } {

  let elapsedMs = 0;
  let isPaused = false;
  let lastTickTime = Date.now();

  const intervalId = setInterval(() => {
    if (isPaused) {
      lastTickTime = Date.now(); // Reset so we don't accumulate paused time
      return;
    }

    const now = Date.now();
    elapsedMs += now - lastTickTime;
    lastTickTime = now;

    // Find which word should be highlighted at this elapsed time
    let wordIndex = -1;
    for (let i = 0; i < timeline.length; i++) {
      if (elapsedMs >= timeline[i].startMs) {
        wordIndex = i;
      } else {
        break;
      }
    }

    if (wordIndex >= 0) {
      setCurrentWordIndex(wordIndex);
    }

    // Check if we've passed the last word
    const lastWord = timeline[timeline.length - 1];
    if (elapsedMs >= lastWord.startMs + lastWord.durationMs) {
      clearInterval(intervalId);
      onComplete();
    }
  }, TICK_INTERVAL_MS);

  return {
    pause: () => { isPaused = true; },
    resume: () => { isPaused = false; lastTickTime = Date.now(); },
    stop: () => {
      clearInterval(intervalId);
      setCurrentWordIndex(-1);
    }
  };
}
```

### Step 5: Coordinating TTS + Highlight

```typescript
// In ReaderScreen:

const handlePlay = () => {
  const timeline = buildTimeline(words, settings.readingSpeed);

  // Start highlight timer
  const controls = startHighlighting(
    timeline,
    setCurrentWordIndex,
    () => {
      // Highlight reached the end
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    }
  );

  highlightControlsRef.current = controls;

  // Start TTS
  Speech.speak(extractedText, {
    rate: settings.readingSpeed,
    language: 'en-US',
    onDone: () => {
      // TTS finished — snap highlight to end and clean up
      controls.stop();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    },
    onStopped: () => {
      controls.stop();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    },
    onError: () => {
      controls.stop();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    },
  });

  setIsPlaying(true);
  setIsPaused(false);
};

const handlePause = () => {
  Speech.pause();  // Note: Speech.pause() may not work on all Android versions
  highlightControlsRef.current?.pause();
  setIsPaused(true);
};

const handleResume = () => {
  Speech.resume();
  highlightControlsRef.current?.resume();
  setIsPaused(false);
};

const handleStop = () => {
  Speech.stop();
  highlightControlsRef.current?.stop();
  setIsPlaying(false);
  setIsPaused(false);
  setCurrentWordIndex(-1);
};
```

---

## Edge Cases

### Very Short Text (1–5 words)

The timer still works, but durations are so short that highlight flashes quickly. This is acceptable — short text reads fast.

### Very Long Text (500+ words)

Timer drift may accumulate over several minutes. Since TTS `onDone` fires at the end, the highlight will snap to completion regardless. For a demo, drift of ±2-3 words after a full page is acceptable.

### Punctuation Attached to Words

Words like `"hello,"` or `"world."` will have punctuation included. This is fine — the TTS engine reads them as part of the word, and the highlight should cover the full token including punctuation.

### Speech.pause() Not Working on Some Devices

`Speech.pause()` is not reliably supported on all Android versions. If pause doesn't work:

**Fallback**: Use `Speech.stop()` for pause, and on "resume," restart from the current word index. Re-splice the text from the current word onward and restart both TTS and the timer with an adjusted offset.

```typescript
const handlePauseWithFallback = () => {
  Speech.stop(); // Force stop instead of pause
  highlightControlsRef.current?.pause();
  setIsPaused(true);
  // currentWordIndex is preserved — resume will use it
};

const handleResumeWithFallback = () => {
  const remainingText = words.slice(currentWordIndex).join(' ');
  const remainingTimeline = buildTimeline(
    words.slice(currentWordIndex),
    settings.readingSpeed
  );

  // Restart highlighting from the current position
  const controls = startHighlighting(
    remainingTimeline,
    (relativeIndex) => setCurrentWordIndex(currentWordIndex + relativeIndex),
    () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    }
  );

  highlightControlsRef.current = controls;

  Speech.speak(remainingText, {
    rate: settings.readingSpeed,
    language: 'en-US',
    onDone: () => {
      controls.stop();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    },
  });

  setIsPaused(false);
};
```

### Empty Text

If `words.length === 0`, the Play button should be hidden or disabled. Do not attempt to start TTS or the timer on empty text.

### App Backgrounded During Playback

`expo-speech` will continue playing audio in the background on most Android devices. The highlight timer (running in JS) may be throttled by the OS. When the app returns to foreground, the timer will "catch up" in the next tick because we're using `Date.now()` for elapsed time, not counting ticks. This is already handled by the implementation above.

---

## Tuning Guide

If the highlight appears to drift during testing, adjust these constants:

| Constant | Effect of Increasing | Effect of Decreasing |
|----------|---------------------|---------------------|
| `BASE_WPM` | Highlight advances faster | Highlight advances slower |
| `CHAR_WEIGHT_MS` | Long words highlighted longer | Long words highlighted shorter |
| `MIN_WORD_DURATION_MS` | Short words stay highlighted longer | Short words flash faster |
| `TICK_INTERVAL_MS` | Choppier but lower CPU | Smoother but higher CPU |

**Tuning strategy**: 
1. Start with the defaults above.
2. Record a screen capture of a paragraph being read with highlighting.
3. Watch for where the highlight leads or lags the speech.
4. If highlight leads (advances before word is spoken): decrease `BASE_WPM` by 10.
5. If highlight lags (word spoken before highlight reaches it): increase `BASE_WPM` by 10.
6. Repeat until visually convincing. ±1 word accuracy is the target — not perfection.

---

## Implementation Priority

If time is tight, implement in this order:

1. **Basic timer with uniform word duration** — Every word gets the same duration (400ms / speechRate). Simple, works for demos.
2. **Character-weighted duration** — Longer words get more time. Improves accuracy noticeably.
3. **Pause/Resume support** — Use the stop-and-restart fallback if `Speech.pause()` fails.
4. **Smooth transitions** — Animate the background color fade on highlight change. P2 only.
