let audioCtx: AudioContext | null = null;
let soundEffectsEnabled = true;
let lastSoundIndex = -1;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Creates an ultra-soft, warm brown/pink noise buffer with smooth air texture.
 * Free of harsh highs, mimicking the natural friction of velvety paper fibers.
 */
function createVelvetBreezeNoiseBuffer(ctx: AudioContext, duration: number = 0.5): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;

    // Pink noise filter (warm and balanced)
    b0 = 0.99765 * b0 + white * 0.0990460;
    b1 = 0.96300 * b1 + white * 0.2965164;
    b2 = 0.57000 * b2 + white * 1.0526913;
    b3 = -0.2495 * b3 - white * 0.29;
    const pink = b0 + b1 + b2 + b3 + b4 + white * 0.1848;
    b4 = white * 0.3;

    // Blend into a soft brownian glide for velvet smoothness
    lastOut = (lastOut + (0.04 * pink)) / 1.04;

    // Micro airy flutter (gentle breeze turbulence)
    const airyBreeze = Math.sin(i * 0.015) * 0.05 * lastOut;

    data[i] = (lastOut * 0.7 + airyBreeze);
  }
  return buffer;
}

/**
 * 5 Soft, Natural Page-Turn Sounds with Smooth Fade-In & Fade-Out (Like a gentle breeze):
 * 0: Whisper Breeze Page Turn (Làn gió lật trang nhẹ)
 * 1: Silky Paper Glide (Tiếng lướt giấy lụa mượt mà)
 * 2: Soft Aerodynamic Flutter (Gió thoảng 2 nhịp êm đềm)
 * 3: Velvet Book Page Sough (Tiếng lá sách nhung mềm dịu)
 * 4: Gentle Page Air Whisper (Tiếng thì thầm của trang giấy)
 */
export function playFlipSound(): void {
  if (!soundEffectsEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Cycle without consecutive repetition
    let variation: number;
    do {
      variation = Math.floor(Math.random() * 5);
    } while (variation === lastSoundIndex && 5 > 1);
    lastSoundIndex = variation;

    const now = ctx.currentTime;
    const jitter = 0.96 + Math.random() * 0.08; // Subtle pitch variation

    switch (variation) {
      // --- Variation 0: Whisper Breeze Page Turn (Làn gió lật trang nhẹ) ---
      case 0: {
        const dur = 0.32 * jitter;
        const noise = ctx.createBufferSource();
        noise.buffer = createVelvetBreezeNoiseBuffer(ctx, dur + 0.05);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(0.8, now);
        filter.frequency.setValueAtTime(450 * jitter, now);
        filter.frequency.exponentialRampToValueAtTime(1400 * jitter, now + dur * 0.45);
        filter.frequency.exponentialRampToValueAtTime(350 * jitter, now + dur);

        const gain = ctx.createGain();
        // Gentle Fade-in
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + dur * 0.35);
        // Soft Fade-out like a breeze tapering off
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }

      // --- Variation 1: Silky Paper Glide (Tiếng lướt giấy lụa mượt mà) ---
      case 1: {
        const dur = 0.38 * jitter;
        const noise = ctx.createBufferSource();
        noise.buffer = createVelvetBreezeNoiseBuffer(ctx, dur + 0.05);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(1.0, now);
        filter.frequency.setValueAtTime(600 * jitter, now);
        filter.frequency.linearRampToValueAtTime(1600 * jitter, now + dur * 0.5);
        filter.frequency.exponentialRampToValueAtTime(500 * jitter, now + dur);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(2200, now);

        const gain = ctx.createGain();
        // Smooth swell
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.14, now + dur * 0.4);
        // Long gentle tail fade
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }

      // --- Variation 2: Soft Aerodynamic Flutter (Gió thoảng 2 nhịp êm đềm) ---
      case 2: {
        const dur = 0.35 * jitter;
        const noise = ctx.createBufferSource();
        noise.buffer = createVelvetBreezeNoiseBuffer(ctx, dur + 0.05);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(0.9, now);
        filter.frequency.setValueAtTime(500 * jitter, now);
        filter.frequency.linearRampToValueAtTime(1500 * jitter, now + dur * 0.3);
        filter.frequency.linearRampToValueAtTime(900 * jitter, now + dur * 0.6);
        filter.frequency.linearRampToValueAtTime(400 * jitter, now + dur);

        const gain = ctx.createGain();
        // First subtle air breath
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + dur * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.05, now + dur * 0.38);
        // Second main soft page landing
        gain.gain.exponentialRampToValueAtTime(0.15, now + dur * 0.58);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }

      // --- Variation 3: Velvet Book Page Sough (Tiếng lá sách nhung mềm dịu) ---
      case 3: {
        const dur = 0.42 * jitter;
        const noise = ctx.createBufferSource();
        noise.buffer = createVelvetBreezeNoiseBuffer(ctx, dur + 0.05);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(0.6, now);
        filter.frequency.setValueAtTime(380 * jitter, now);
        filter.frequency.exponentialRampToValueAtTime(1100 * jitter, now + dur * 0.4);
        filter.frequency.exponentialRampToValueAtTime(300 * jitter, now + dur);

        const gain = ctx.createGain();
        // Warm, slow swell
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.13, now + dur * 0.38);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }

      // --- Variation 4: Gentle Page Air Whisper (Tiếng thì thầm của trang giấy) ---
      case 4:
      default: {
        const dur = 0.28 * jitter;
        const noise = ctx.createBufferSource();
        noise.buffer = createVelvetBreezeNoiseBuffer(ctx, dur + 0.05);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(1.1, now);
        filter.frequency.setValueAtTime(700 * jitter, now);
        filter.frequency.exponentialRampToValueAtTime(1800 * jitter, now + dur * 0.4);
        filter.frequency.exponentialRampToValueAtTime(550 * jitter, now + dur);

        const gain = ctx.createGain();
        // Smooth swell & fade
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + dur * 0.32);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }
    }
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
