import { AudioTrack } from '../../types';
import { createWavBlob, isWavFormat } from '../audioService';

export const MAX_CHUNK_CHARS = 600000;
export const MAX_COVER_CHARS = 580000;

export function sanitizeFirestoreId(rawId: string): string {
  const cleaned = (rawId || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || `id_${Date.now()}`;
}

export function splitStringIntoChunks(text: string, maxLen: number = MAX_CHUNK_CHARS): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLen) {
    chunks.push(text.slice(i, i + maxLen));
  }
  return chunks;
}

export async function compressCoverImageForCloud(coverUrl: string): Promise<string> {
  if (!coverUrl) return '';
  if (coverUrl.length <= MAX_COVER_CHARS) return coverUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxW = 480;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        resolve(compressed.length <= MAX_COVER_CHARS ? compressed : '');
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = coverUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error || new Error('Blob read failed'));
    reader.readAsDataURL(blob);
  });
}

export async function serializeAudioTrackPayload(track: AudioTrack): Promise<{
  dataString: string;
  externalUrl: string;
  mimeType: string;
  size: number;
}> {
  if (track.blob instanceof Blob) {
    const dataUrl = await blobToDataUrl(track.blob);
    return {
      dataString: dataUrl,
      externalUrl: '',
      mimeType: track.blob.type || (isWavFormat(track.name) ? 'audio/wav' : 'audio/mpeg'),
      size: track.size || track.blob.size
    };
  }

  if (track.url && track.url.startsWith('data:')) {
    const mimeMatch = track.url.match(/^data:([^;]+);/i);
    return {
      dataString: track.url,
      externalUrl: '',
      mimeType: mimeMatch?.[1] || (isWavFormat(track.name) ? 'audio/wav' : 'audio/mpeg'),
      size: track.size || Math.round(track.url.length * 0.75)
    };
  }

  if (track.url && track.url.startsWith('blob:')) {
    try {
      const resp = await fetch(track.url);
      const blob = await resp.blob();
      const dataUrl = await blobToDataUrl(blob);
      return {
        dataString: dataUrl,
        externalUrl: '',
        mimeType: blob.type || (isWavFormat(track.name) ? 'audio/wav' : 'audio/mpeg'),
        size: track.size || blob.size
      };
    } catch {
      return { dataString: '', externalUrl: '', mimeType: 'audio/mpeg', size: track.size || 0 };
    }
  }

  if (track.url && /^https?:\/\//i.test(track.url)) {
    return {
      dataString: '',
      externalUrl: track.url.slice(0, 2048),
      mimeType: isWavFormat(`${track.name} ${track.url}`) ? 'audio/wav' : 'audio/mpeg',
      size: track.size || 0
    };
  }

  return { dataString: '', externalUrl: '', mimeType: 'audio/mpeg', size: track.size || 0 };
}

export function reconstructAudioTrack(
  meta: {
    id: string;
    name: string;
    folder?: string;
    fileType?: string;
    mimeType?: string;
    size?: number;
    externalUrl?: string;
  },
  dataString: string
): AudioTrack {
  const url = dataString || meta.externalUrl || '';
  let blob: Blob | undefined;
  const isWav = isWavFormat(`${meta.name} ${url}`) || meta.mimeType === 'audio/wav';
  if (isWav && url.startsWith('data:')) {
    try {
      blob = createWavBlob(url);
    } catch {
      blob = undefined;
    }
  }

  return {
    id: meta.id,
    name: meta.name,
    url,
    blob,
    size: meta.size,
    folder: meta.folder || undefined,
    fileType: meta.fileType || (isWav ? 'WAV' : 'MP3')
  };
}
