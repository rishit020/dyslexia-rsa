// ============================================================================
// TTS ENGINE — Word-by-word highlight synchronization
// See docs/TTS_HIGHLIGHT_SPEC.md for full algorithm details
// ============================================================================

export const BASE_WPM = 150;
export const BASE_WORD_DURATION_MS = 60000 / BASE_WPM; // ~400ms at rate 1.0
export const MIN_WORD_DURATION_MS = 200;
export const CHAR_WEIGHT_MS = 30;
export const TICK_INTERVAL_MS = 100;

/**
 * Estimates how long (ms) a word takes to be spoken at the given speech rate.
 * Longer words get more time via character weighting.
 */
export function estimateWordDuration(word: string, speechRate: number): number {
  const lengthFactor =
    word.length <= 4
      ? BASE_WORD_DURATION_MS
      : BASE_WORD_DURATION_MS + (word.length - 4) * CHAR_WEIGHT_MS;

  const adjusted = lengthFactor / speechRate;
  return Math.max(adjusted, MIN_WORD_DURATION_MS / speechRate);
}

// ============================================================================
// TIMELINE
// ============================================================================

export interface WordTiming {
  word: string;
  startMs: number;
  durationMs: number;
}

/**
 * Pre-computes cumulative start time for each word before playback begins.
 */
export function buildTimeline(words: string[], speechRate: number): WordTiming[] {
  const timeline: WordTiming[] = [];
  let cumulativeMs = 0;

  for (const word of words) {
    const duration = estimateWordDuration(word, speechRate);
    timeline.push({ word, startMs: cumulativeMs, durationMs: duration });
    cumulativeMs += duration;
  }

  return timeline;
}

// ============================================================================
// HIGHLIGHT CONTROLLER
// ============================================================================

export interface HighlightControls {
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

/**
 * Starts a setInterval that advances currentWordIndex based on elapsed time.
 * Uses Date.now() so paused time is not counted and background throttling
 * is automatically compensated on resume.
 */
export function startHighlighting(
  timeline: WordTiming[],
  setCurrentWordIndex: (index: number) => void,
  onComplete: () => void
): HighlightControls {
  // Guard: empty timeline
  if (timeline.length === 0) {
    onComplete();
    return { pause: () => {}, resume: () => {}, stop: () => {} };
  }

  let elapsedMs = 0;
  let isPaused = false;
  let stopped = false;
  let lastTickTime = Date.now();

  const intervalId = setInterval(() => {
    if (stopped) return;

    if (isPaused) {
      lastTickTime = Date.now(); // Don't accumulate paused time
      return;
    }

    const now = Date.now();
    elapsedMs += now - lastTickTime;
    lastTickTime = now;

    // Find the word that should be highlighted at this elapsed time
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
      stopped = true;
      onComplete();
    }
  }, TICK_INTERVAL_MS);

  return {
    pause: () => {
      isPaused = true;
    },
    resume: () => {
      isPaused = false;
      lastTickTime = Date.now();
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      clearInterval(intervalId);
      setCurrentWordIndex(-1);
    },
  };
}
