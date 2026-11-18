import { isWavFormat, createWavBlob } from './wavFormat';
import { registerBlobUrl, revokeTrackedBlobUrl, revokeAllBlobUrls } from './blobUrlRegistry';
import { resumeAudioContextIfNeeded } from './flipNoiseBuffer';

export interface AudioPlayerOptions {
  mimeType?: string;
  preload?: 'auto' | 'metadata' | 'none';
  loop?: boolean;
  volume?: number;
  autoplay?: boolean;
}

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

export function configureAudioSource(
  audioElement: HTMLAudioElement,
  source: string | Blob,
  mimeTypeHint?: string
): string {
  if (!audioElement || !source) return '';

  const previousRate = audioElement.playbackRate || 1;
  const previousSrc = audioElement.src;

  const isWav = typeof source === 'string'
    ? isWavFormat(source) || mimeTypeHint === 'audio/wav'
    : isWavFormat(mimeTypeHint || '', source);

  const targetMime = isWav ? 'audio/wav' : (mimeTypeHint || 'audio/mpeg');
  let playableUrl = '';

  if (source instanceof Blob) {
    const typedBlob = source.type === targetMime ? source : new Blob([source], { type: targetMime });
    playableUrl = registerBlobUrl(typedBlob);
  } else if (typeof source === 'string' && source.startsWith('data:')) {
    if (isWav) {
      playableUrl = registerBlobUrl(createWavBlob(source));
    } else {
      try {
        const commaIdx = source.indexOf(',');
        const base64 = commaIdx !== -1 ? source.substring(commaIdx + 1) : source;
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        playableUrl = registerBlobUrl(new Blob([bytes], { type: targetMime }));
      } catch {
        playableUrl = source;
      }
    }
  } else {
    playableUrl = source as string;
  }

  if (previousSrc && previousSrc.startsWith('blob:') && previousSrc !== playableUrl) {
    revokeTrackedBlobUrl(previousSrc);
  }

  while (audioElement.firstChild) {
    audioElement.removeChild(audioElement.firstChild);
  }

  audioElement.pause();
  audioElement.src = playableUrl;
  audioElement.load();
  audioElement.playbackRate = previousRate;

  return playableUrl;
}

export async function playAudioPipeline(audioElement: HTMLAudioElement): Promise<void> {
  if (!audioElement) return;
  await resumeAudioContextIfNeeded();
  try {
    await audioElement.play();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, 60));
      await audioElement.play();
      return;
    }
    console.warn('Playback error in audio pipeline:', err);
    throw err;
  }
}

export function cleanupAudioPipeline(audioElement?: HTMLAudioElement | null): void {
  if (audioElement) {
    audioElement.pause();
    if (audioElement.src && audioElement.src.startsWith('blob:')) {
      revokeTrackedBlobUrl(audioElement.src);
    }
    audioElement.removeAttribute('src');
    while (audioElement.firstChild) {
      audioElement.removeChild(audioElement.firstChild);
    }
    audioElement.load();
  }
  revokeAllBlobUrls();
}
