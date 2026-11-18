import { AudioTrack, Book } from '../../types';
import { appState } from '../../state/appState';
import { showToast } from '../../utils/toast';
import { refreshLucideIcons } from '../../utils/icons';
import { saveBookToDB } from '../../services/dbService';
import { syncBookToCloud } from '../../services/firebaseService';
import { detectAudioFormatLabel } from '../../utils/audioHelper';
import { mediaDockState } from './mediaDockState';

export interface PlaylistCallbacks {
  onSelectTrack: (track: AudioTrack) => void;
  onRefreshDock: (book: Book) => void;
}

let registeredCallbacks: PlaylistCallbacks = {
  onSelectTrack: () => {},
  onRefreshDock: () => {}
};

export function registerPlaylistCallbacks(callbacks: PlaylistCallbacks): void {
  registeredCallbacks = callbacks;
}

export function renderPlaylistDrawer(tracks: AudioTrack[]): void {
  const container = document.getElementById('playlist-drawer-tracks-list');
  const countSpan = document.getElementById('playlist-drawer-count');
  if (!container) return;

  if (countSpan) {
    countSpan.innerText = `${tracks.length} bài nghe`;
  }

  if (tracks.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-white/40">Không tìm thấy bài nghe nào.</div>`;
    return;
  }

  const currentTrack = appState.get('currentAudioTrack');
  const query = mediaDockState.currentSearchQuery.toLowerCase().trim();

  const filtered = query
    ? tracks.filter(t => t.name.toLowerCase().includes(query) || (t.folder && t.folder.toLowerCase().includes(query)))
    : tracks;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-white/40">Không có bài nghe khớp với "${mediaDockState.currentSearchQuery}".</div>`;
    return;
  }

  container.innerHTML = filtered.map((t) => {
    const absIdx = tracks.findIndex(item => item.id === t.id);
    const isPlayingThis = currentTrack && currentTrack.id === t.id;
    const format = detectAudioFormatLabel(t.name, t.url);
    const formatColor = format === 'WAV'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

    return `
      <div 
        class="apple-track-row flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
          isPlayingThis
            ? 'bg-purple-600/30 text-white border border-purple-400/40'
            : 'hover:bg-white/10 text-white/80 border border-transparent'
        }"
        data-track-id="${t.id}"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="font-mono text-[10px] ${isPlayingThis ? 'text-purple-300 font-bold' : 'text-white/40'} w-6 shrink-0 text-right">
            ${isPlayingThis ? '▶' : `${absIdx + 1}`}
          </span>
          <div class="min-w-0">
            <p class="font-semibold truncate text-white">${t.name}</p>
            <p class="text-[10px] text-white/40 truncate">${t.folder ? `📁 ${t.folder}` : 'Thư mục chung'}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${formatColor}">
            ${format}
          </span>
          <button 
            type="button" 
            class="btn-delete-track-row p-1 text-white/30 hover:text-rose-400 rounded transition" 
            data-delete-id="${t.id}" 
            title="Xóa bài nghe này"
          >
            <i data-lucide="trash-2" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.apple-track-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.btn-delete-track-row')) return;
      const trackId = row.getAttribute('data-track-id');
      if (!trackId) return;
      const book = appState.get('currentBook');
      if (!book || !book.audioTracks) return;
      const target = book.audioTracks.find(t => t.id === trackId);
      if (target) {
        registeredCallbacks.onSelectTrack(target);
      }
    });
  });

  container.querySelectorAll('.btn-delete-track-row').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const trackId = btn.getAttribute('data-delete-id');
      if (!trackId) return;
      const book = appState.get('currentBook');
      if (!book || !book.audioTracks) return;
      if (!confirm('Bạn có chắc chắn muốn xóa bài nghe này?')) return;
      book.audioTracks = book.audioTracks.filter(t => t.id !== trackId);
      book.lastModified = Date.now();
      await saveBookToDB(book);
      void syncBookToCloud(book, { includePages: false, includeAudio: true });
      registeredCallbacks.onRefreshDock(book);
      showToast('🗑️ Đã xóa bài nghe');
    });
  });

  refreshLucideIcons();
}
