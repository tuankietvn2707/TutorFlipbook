import { AudioTrack } from '../../types';
import { showToast } from '../../utils/toast';
import { readFileAsAudioDataURL, detectAudioFormatLabel } from '../../utils/audioHelper';
import { isWavFormat, fileToWavBlob } from '../../services/audioService';

let selectedPdfFile: File | null = null;
let uploadedAudioTracks: AudioTrack[] = [];

export function getSelectedPdfFile(): File | null {
  return selectedPdfFile;
}

export function getUploadedAudioTracks(): AudioTrack[] {
  return uploadedAudioTracks;
}

export function removeUploadedAudioTrack(idx: number): void {
  uploadedAudioTracks.splice(idx, 1);
  updateUploadedTracksList();
}

export function resetUploadForm(): void {
  selectedPdfFile = null;
  uploadedAudioTracks = [];
  const fileInput = document.getElementById('file-pdf-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
  const titleInput = document.getElementById('input-book-title') as HTMLInputElement;
  if (titleInput) titleInput.value = '';
  const videoInput = document.getElementById('input-book-video') as HTMLInputElement;
  if (videoInput) videoInput.value = '';
  const info = document.getElementById('selected-file-info');
  info?.classList.add('hidden');
  updateUploadedTracksList();
}

export function updateUploadedTracksList(): void {
  const list = document.getElementById('upload-audio-tracks-list');
  const count = document.getElementById('upload-tracks-count');
  if (count) count.innerText = String(uploadedAudioTracks.length);
  if (!list) return;

  if (uploadedAudioTracks.length === 0) {
    list.innerHTML = `<div class="text-center py-3 text-xs text-slate-400 font-bold">Chưa có bài nghe audio nào được đính kèm.</div>`;
    return;
  }

  list.innerHTML = uploadedAudioTracks
    .map(
      (t, idx) => `
    <div class="flex items-center justify-between p-2 bg-white rounded-xl border border-purple-200 text-xs font-bold">
      <div class="flex items-center gap-2 truncate">
        <i data-lucide="music" class="w-3.5 h-3.5 text-purple-600"></i>
        <span class="truncate text-slate-800">${t.name}</span>
      </div>
      <button onclick="window.removeUploadAudioTrack(${idx})" class="p-1 text-slate-400 hover:text-red-500 rounded">
        <i data-lucide="trash" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `
    )
    .join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

export function handleSelectedPdf(file: File): void {
  selectedPdfFile = file;
  const info = document.getElementById('selected-file-info');
  const name = document.getElementById('selected-file-name');
  const size = document.getElementById('selected-file-size');
  const titleInput = document.getElementById('input-book-title') as HTMLInputElement;

  if (info && name && size) {
    name.innerText = file.name;
    size.innerText = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    info.classList.remove('hidden');
  }

  if (titleInput && !titleInput.value) {
    titleInput.value = file.name.replace(/\.[^/.]+$/, '');
  }
}

export async function handleBatchAudios(files: File[]): Promise<void> {
  showToast(`⏳ Đang xử lý ${files.length} tệp âm thanh (WAV/MP3)...`);
  for (const file of files) {
    const format = detectAudioFormatLabel(file.name);
    const isWav = isWavFormat(file.name);
    let wavBlob: Blob | undefined;
    if (isWav) {
      try {
        wavBlob = await fileToWavBlob(file);
      } catch {
        // fallback
      }
    }

    try {
      const dataUrl = await readFileAsAudioDataURL(file);
      uploadedAudioTracks.push({
        id: 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: dataUrl,
        blob: wavBlob,
        size: file.size,
        fileType: format
      });
    } catch {
      const url = URL.createObjectURL(file);
      uploadedAudioTracks.push({
        id: 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name.replace(/\.[^/.]+$/, ''),
        url,
        blob: wavBlob,
        size: file.size,
        fileType: format
      });
    }
  }
  updateUploadedTracksList();
  showToast(`🎉 Đã thêm thành công ${files.length} bài nghe Audio!`);
}
