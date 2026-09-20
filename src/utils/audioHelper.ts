/**
 * Audio Helper for Robust Multi-Format Support (.WAV, .MP3, .M4A, .AAC, .OGG, .FLAC)
 * Includes Apple-style Blob ObjectURL management for zero-latency seeking,
 * uncompressed PCM WAV decoding, and memory leak prevention.
 */

let activeBlobUrl: string | null = null;

/**
 * Normalizes and converts any data URL or Audio source to a high-performance Blob URL.
 * Essential for .WAV files: data URLs for WAV cannot seek reliably in HTML5 <audio>,
 * while blob: URLs provide instant byte-level seeking and instant duration calculation.
 */
export function getPlayableAudioUrl(rawUrl: string, filenameHint?: string): string {
  if (!rawUrl) return '';

  // If it's already a blob or remote HTTP link, return directly
  if (rawUrl.startsWith('blob:') || rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  // If it's a data URL
  if (rawUrl.startsWith('data:')) {
    try {
      // Clean up previous blob URL to keep memory low
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        activeBlobUrl = null;
      }

      const commaIndex = rawUrl.indexOf(',');
      if (commaIndex === -1) return rawUrl;

      const header = rawUrl.substring(0, commaIndex);
      const base64Data = rawUrl.substring(commaIndex + 1);

      // Determine MIME type
      let mimeType = 'audio/mpeg';
      const mimeMatch = header.match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1] && mimeMatch[1] !== 'application/octet-stream') {
        mimeType = mimeMatch[1];
      }

      // Check filename hint or WAV header
      if (filenameHint && /\.(wav|wave)$/i.test(filenameHint)) {
        mimeType = 'audio/wav';
      } else if (base64Data.startsWith('UklGR')) {
        // 'UklGR' in base64 is 'RIFF' in ASCII (Standard WAV file header)
        mimeType = 'audio/wav';
      }

      // Convert Base64 to Binary Array
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mimeType });
      activeBlobUrl = URL.createObjectURL(blob);
      return activeBlobUrl;
    } catch (err) {
      console.warn('Could not convert data URL to Blob URL, fallback to raw:', err);
      return rawUrl;
    }
  }

  return rawUrl;
}

/**
 * Revokes active blob URL when switching books or closing player
 */
export function cleanupActiveBlobUrl(): void {
  if (activeBlobUrl) {
    try {
      URL.revokeObjectURL(activeBlobUrl);
    } catch {
      // ignore
    }
    activeBlobUrl = null;
  }
}

/**
 * Reads any audio file as DataURL and ensures correct audio MIME type (especially for WAV).
 */
export function readFileAsAudioDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      let result = reader.result as string;
      const isWav = /\.(wav|wave)$/i.test(file.name);
      if (isWav) {
        // Enforce audio/wav MIME header so browser audio engines parse it natively
        if (!result.startsWith('data:audio/wav') && !result.startsWith('data:audio/wave') && !result.startsWith('data:audio/x-wav')) {
          result = result.replace(/^data:[^;]*;base64,/, 'data:audio/wav;base64,');
        }
      }
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Detects the file format label (WAV, MP3, M4A, etc.)
 */
export function detectAudioFormatLabel(filename: string = '', url: string = ''): string {
  const cleanName = filename.toLowerCase();
  if (cleanName.endsWith('.wav') || cleanName.endsWith('.wave')) return 'WAV';
  if (cleanName.endsWith('.mp3')) return 'MP3';
  if (cleanName.endsWith('.m4a')) return 'M4A';
  if (cleanName.endsWith('.aac')) return 'AAC';
  if (cleanName.endsWith('.ogg')) return 'OGG';
  if (cleanName.endsWith('.flac')) return 'FLAC';

  if (url.startsWith('data:audio/wav') || url.startsWith('data:audio/x-wav')) return 'WAV';
  if (url.startsWith('data:audio/mpeg') || url.startsWith('data:audio/mp3')) return 'MP3';
  if (url.startsWith('data:audio/mp4') || url.startsWith('data:audio/m4a')) return 'M4A';

  return 'AUDIO';
}

/**
 * Determines if a file is an audio file (supporting WAV, MP3, M4A, AAC, OGG, FLAC, WMA)
 */
export function isAudioFile(file: File): boolean {
  if (!file) return false;
  if (file.type && file.type.startsWith('audio/')) return true;
  return /\.(wav|wave|mp3|m4a|aac|ogg|flac|wma|aiff)$/i.test(file.name);
}
