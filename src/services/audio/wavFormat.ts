export const WAV_MIME_TYPE = 'audio/wav';

export const SUPPORTED_WAV_MIMES = [
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/vnd.wave'
] as const;

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

export function canBrowserPlayWav(): boolean {
  const testAudio = new Audio();
  const canPlay = testAudio.canPlayType('audio/wav');
  return canPlay === 'probably' || canPlay === 'maybe';
}

export function createWavBlob(source: Blob | ArrayBuffer | Uint8Array | string): Blob {
  if (source instanceof Blob) {
    if (source.type === 'audio/wav') {
      return source;
    }
    return new Blob([source], { type: 'audio/wav' });
  }

  if (typeof source === 'string') {
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
    return new Blob([source], { type: 'audio/wav' });
  }

  return new Blob([source], { type: 'audio/wav' });
}

export async function fileToWavBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
