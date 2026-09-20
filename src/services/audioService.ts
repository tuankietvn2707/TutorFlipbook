/**
 * Centralized Audio Service for Tutor Flipbook
 * 
 * Provides:
 * 1. Native Audio object instantiation & audio pipeline management with
 *    full support for the 'audio/wav' MIME type (and MP3, M4A, etc.).
 * 2. Proper handling of Blob objects created from WAV files (including memory-safe
 *    Blob URL generation and lifecycle cleanup).
 * 3. Robust playback logic with user-activation error recovery.
 * 4. Realistic page-flip sound effect synthesis via Web Audio API.
 */

// ==========================================
// 1. WAV MIME TYPES & FORMAT DETECTION
// ==========================================

export const WAV_MIME_TYPE = 'audio/wav';

export const SUPPORTED_WAV_MIMES = [
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/vnd.wave'
] as const;

/**
 * Checks if a filename, MIME string, or Blob represents a WAV audio file.
 */
export function isWavFormat(sourceInfo: string, blob?: Blob): boolean {
  if (blob) {
    if (blob.type === 'audio/wav' || blob.type === 'audio/x-wav' || blob.type === 'audio/wave') {
      return true;
    }
  }
  const clean = sourceInfo.toLowerCase().trim();
  return (
    clean.includes('audio/wav') ||
    clean.includes('audio/x-wav') ||
    clean.includes('audio/wave') ||
    clean.endsWith('.wav') ||
    clean.endsWith('.wave')
  );
}

/**
 * Checks if the current browser environment can play the 'audio/wav' MIME type.
 */
export function canBrowserPlayWav(): boolean {
  const testAudio = new Audio();
  const canPlay = testAudio.canPlayType('audio/wav');
  return canPlay === 'probably' || canPlay === 'maybe';
}

// ==========================================
// 2. WAV BLOB CONVERSION & LIFECYCLE MANAGEMENT
// ==========================================

// Track active Object URLs created by the audio service to revoke them and avoid memory leaks
const activeBlobUrls = new Set<string>();

/**
 * Converts a raw source (Blob, ArrayBuffer, Uint8Array, or base64 DataURL)
 * into a verified Blob with the explicit 'audio/wav' MIME type.
 */
export function createWavBlob(source: Blob | ArrayBuffer | Uint8Array | string): Blob {
  if (source instanceof Blob) {
    if (source.type === 'audio/wav') {
      return source;
    }
    // Re-wrap Blob ensuring explicit 'audio/wav' MIME type
    return new Blob([source], { type: 'audio/wav' });
  }

  if (typeof source === 'string') {
    // If it's a data URL
    if (source.startsWith('data:')) {
      const commaIdx = source.indexOf(',');
      const base64Data = commaIdx !== -1 ? source.substring(commaIdx + 1) : source;
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new Blob([bytes], { type: 'audio/wav' });
    }
    // If it's plain string or binary data
    return new Blob([source], { type: 'audio/wav' });
  }

  // ArrayBuffer or Uint8Array
  return new Blob([source], { type: 'audio/wav' });
}

/**
 * Converts a File object (e.g. from an <input type="file">) into an explicit 'audio/wav' Blob.
 */
export async function fileToWavBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Creates a trackable Blob URL and registers it for future memory cleanup.
 */
export function registerBlobUrl(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  activeBlobUrls.add(url);
  return url;
}

/**
 * Revokes a specific Blob URL and removes it from the tracking set.
 */
export function revokeTrackedBlobUrl(url: string | null | undefined): void {
  if (!url) return;
  if (activeBlobUrls.has(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
    activeBlobUrls.delete(url);
  }
}

/**
 * Revokes all active Blob URLs managed by the audio service.
 */
export function revokeAllBlobUrls(): void {
  for (const url of activeBlobUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
  activeBlobUrls.clear();
}

// ==========================================
// 3. AUDIO OBJECT INSTANTIATION & PIPELINE
// ==========================================

export interface AudioPlayerOptions {
  mimeType?: string;
  preload?: 'auto' | 'metadata' | 'none';
  loop?: boolean;
  volume?: number;
  autoplay?: boolean;
}

/**
 * Instantiates an Audio object configured with support for the 'audio/wav' MIME type
 * and ensures the audio pipeline correctly handles Blob objects created from WAV files.
 */
export function instantiateAudioPlayer(
  source?: string | Blob,
  options?: AudioPlayerOptions
): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = options?.preload || 'auto';
  if (options?.loop !== undefined) audio.loop = options.loop;
  if (options?.volume !== undefined) audio.volume = options.volume;
  if (options?.autoplay !== undefined) audio.autoplay = options.autoplay;

  if (source) {
    configureAudioSource(audio, source, options?.mimeType);
  }

  return audio;
}

/**
 * Configures the audio pipeline of an HTMLAudioElement or Audio object.
 * Correctly handles:
 * - Blob objects created from WAV files (applying 'audio/wav' MIME type).
 * - Base64 Data URLs (converting to Blob for instant seekability & low latency).
 * - Appending <source> elements with explicit type="audio/wav" for decoder precision.
 * 
 * Returns the playable URL assigned to the audio element.
 */
export function configureAudioSource(
  audioElement: HTMLAudioElement,
  source: string | Blob,
  mimeTypeHint?: string
): string {
  if (!audioElement || !source) return '';

  // Determine if this is a WAV format
  const isWav = typeof source === 'string'
    ? isWavFormat(source) || mimeTypeHint === 'audio/wav'
    : isWavFormat(mimeTypeHint || '', source);

  const targetMime = isWav ? 'audio/wav' : (mimeTypeHint || 'audio/mpeg');

  let playableUrl = '';

  // Case A: source is a Blob object (e.g. created from WAV file)
  if (source instanceof Blob) {
    // Ensure the Blob has the target MIME type
    const typedBlob = source.type === targetMime
      ? source
      : new Blob([source], { type: targetMime });

    // Revoke previous blob URL if assigned directly
    if (audioElement.src && audioElement.src.startsWith('blob:')) {
      revokeTrackedBlobUrl(audioElement.src);
    }

    playableUrl = registerBlobUrl(typedBlob);
  }
  // Case B: source is a Base64 data URL
  else if (typeof source === 'string' && source.startsWith('data:')) {
    if (isWav) {
      const wavBlob = createWavBlob(source);
      if (audioElement.src && audioElement.src.startsWith('blob:')) {
        revokeTrackedBlobUrl(audioElement.src);
      }
      playableUrl = registerBlobUrl(wavBlob);
    } else {
      // Non-WAV data URL
      try {
        const commaIdx = source.indexOf(',');
        const base64 = commaIdx !== -1 ? source.substring(commaIdx + 1) : source;
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: targetMime });
        if (audioElement.src && audioElement.src.startsWith('blob:')) {
          revokeTrackedBlobUrl(audioElement.src);
        }
        playableUrl = registerBlobUrl(blob);
      } catch {
        playableUrl = source;
      }
    }
  }
  // Case C: source is already an HTTP URL or Blob URL
  else {
    playableUrl = source as string;
  }

  // Clear existing <source> elements to avoid decoder confusion
  while (audioElement.firstChild) {
    audioElement.removeChild(audioElement.firstChild);
  }

  // Append explicit <source> element with MIME type for highest decoder compliance
  const sourceElement = document.createElement('source');
  sourceElement.src = playableUrl;
  sourceElement.type = targetMime;
  audioElement.appendChild(sourceElement);

  // Also assign directly to src for universal browser support
  audioElement.src = playableUrl;

  // Load the new source into media buffer
  audioElement.load();

  return playableUrl;
}

/**
 * Robust playback execution for an Audio object or HTMLAudioElement.
 * Resumes AudioContext if suspended and handles user-activation promise rejections.
 */
export async function playAudioPipeline(audioElement: HTMLAudioElement): Promise<void> {
  if (!audioElement) return;

  // If AudioContext exists and is suspended, resume it
  if (audioCtx && audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {
      // ignore
    }
  }

  try {
    await audioElement.play();
  } catch (err: any) {
    console.warn('Playback error in audio pipeline:', err);
    throw err;
  }
}

/**
 * Tears down and cleans up the audio pipeline of an HTMLAudioElement.
 */
export function cleanupAudioPipeline(audioElement?: HTMLAudioElement | null): void {
  if (audioElement) {
    audioElement.pause();
    if (audioElement.src && audioElement.src.startsWith('blob:')) {
      revokeTrackedBlobUrl(audioElement.src);
    }
    audioElement.src = '';
    while (audioElement.firstChild) {
      audioElement.removeChild(audioElement.firstChild);
    }
    audioElement.load();
  }
  revokeAllBlobUrls();
}

// ==========================================
// 4. REALISTIC PAGE-FLIP SOUND EFFECTS
// ==========================================

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

let cachedNoiseBuffer: AudioBuffer | null = null;

function createVelvetBreezeNoiseBuffer(ctx: AudioContext, duration: number = 0.5): AudioBuffer {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }

  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * Math.max(0.6, duration));
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

  cachedNoiseBuffer = buffer;
  return buffer;
}

/**
 * 5 Soft, Natural Page-Turn Sounds with Smooth Fade-In & Fade-Out
 */
export function playFlipSound(): void {
  if (!soundEffectsEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    let variation: number;
    do {
      variation = Math.floor(Math.random() * 5);
    } while (variation === lastSoundIndex && 5 > 1);
    lastSoundIndex = variation;

    const now = ctx.currentTime;
    const jitter = 0.96 + Math.random() * 0.08;

    switch (variation) {
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
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + dur * 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }

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
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.14, now + dur * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }

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
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + dur * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.05, now + dur * 0.38);
        gain.gain.exponentialRampToValueAtTime(0.15, now + dur * 0.58);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
        break;
      }

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
