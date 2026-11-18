import { getAudioContext, createVelvetBreezeNoiseBuffer } from './flipNoiseBuffer';

let soundEffectsEnabled = true;
let lastSoundIndex = -1;

function playVariation(ctx: AudioContext, variation: number, now: number, jitter: number): void {
  const durations = [0.32, 0.38, 0.35, 0.42, 0.28];
  const dur = (durations[variation] ?? 0.28) * jitter;
  const noise = ctx.createBufferSource();
  noise.buffer = createVelvetBreezeNoiseBuffer(ctx, dur + 0.05);

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);

  if (variation === 0) {
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(0.8, now);
    filter.frequency.setValueAtTime(450 * jitter, now);
    filter.frequency.exponentialRampToValueAtTime(1400 * jitter, now + dur * 0.45);
    filter.frequency.exponentialRampToValueAtTime(350 * jitter, now + dur);
    gain.gain.exponentialRampToValueAtTime(0.16, now + dur * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(filter);
    filter.connect(gain);
  } else if (variation === 1) {
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.0, now);
    filter.frequency.setValueAtTime(600 * jitter, now);
    filter.frequency.linearRampToValueAtTime(1600 * jitter, now + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(500 * jitter, now + dur);
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2200, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(filter);
    filter.connect(lowpass);
    lowpass.connect(gain);
  } else if (variation === 2) {
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(0.9, now);
    filter.frequency.setValueAtTime(500 * jitter, now);
    filter.frequency.linearRampToValueAtTime(1500 * jitter, now + dur * 0.3);
    filter.frequency.linearRampToValueAtTime(900 * jitter, now + dur * 0.6);
    filter.frequency.linearRampToValueAtTime(400 * jitter, now + dur);
    gain.gain.exponentialRampToValueAtTime(0.08, now + dur * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.05, now + dur * 0.38);
    gain.gain.exponentialRampToValueAtTime(0.15, now + dur * 0.58);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(filter);
    filter.connect(gain);
  } else if (variation === 3) {
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(0.6, now);
    filter.frequency.setValueAtTime(380 * jitter, now);
    filter.frequency.exponentialRampToValueAtTime(1100 * jitter, now + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(300 * jitter, now + dur);
    gain.gain.exponentialRampToValueAtTime(0.13, now + dur * 0.38);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(filter);
    filter.connect(gain);
  } else {
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.1, now);
    filter.frequency.setValueAtTime(700 * jitter, now);
    filter.frequency.exponentialRampToValueAtTime(1800 * jitter, now + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(550 * jitter, now + dur);
    gain.gain.exponentialRampToValueAtTime(0.15, now + dur * 0.32);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(filter);
    filter.connect(gain);
  }

  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + dur);
}

export function playFlipSound(): void {
  if (!soundEffectsEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    let variation: number;
    do {
      variation = Math.floor(Math.random() * 5);
    } while (variation === lastSoundIndex);
    lastSoundIndex = variation;

    const now = ctx.currentTime;
    const jitter = 0.96 + Math.random() * 0.08;
    playVariation(ctx, variation, now, jitter);
  } catch {
    // Gracefully handle browser auto-play or context restrictions
  }
}

export function toggleSoundEffects(): boolean {
  soundEffectsEnabled = !soundEffectsEnabled;
  return soundEffectsEnabled;
}

export function getSoundEffectsEnabled(): boolean {
  return soundEffectsEnabled;
}
