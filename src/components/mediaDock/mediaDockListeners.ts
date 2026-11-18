import { appState } from '../../state/appState';
import { naturalSortAudioTracks } from '../../utils/sorting';
import { showToast } from '../../utils/toast';
import { refreshLucideIcons } from '../../utils/icons';
import { saveBookToDB } from '../../services/dbService';
import { syncBookToCloud } from '../../services/firebaseService';
import { cleanupAudioPipeline } from '../../services/audioService';
import { mediaDockState, formatTime } from './mediaDockState';
import { renderPlaylistDrawer, registerPlaylistCallbacks } from './mediaDockPlaylist';
import {
  ensureAudioElement,
  registerAudioElementBinder,
  initMediaDock,
  loadTrack,
  minimizeMediaDock,
  expandMediaDock,
  updatePlayButtonUI
} from './mediaDockController';
import {
  togglePlayAudio,
  playLoadedTrack,
  playNextTrack,
  playPrevTrack,
  seekAudioRelative,
  seekAudio,
  cyclePlaybackSpeed,
  cycleLoopMode,
  toggleAbLoopPoint
} from './mediaDockTransport';
import { handleAddAudioFilesToBook } from './mediaDockFileUpload';
import {
  bindAudioElementEvents,
  setupVolumeListeners,
  setupKeyboardAndStateSubscriptions
} from './mediaDockEvents';

export function setupMediaDockListeners(callbacks: { onOpenBatchMedia?: () => void }): void {
  registerAudioElementBinder(bindAudioElementEvents);
  registerPlaylistCallbacks({
    onSelectTrack: (target) => {
      loadTrack(target);
      playLoadedTrack();
    },
    onRefreshDock: (book) => initMediaDock(book, true)
  });

  const audioEl = ensureAudioElement();
  if (audioEl) bindAudioElementEvents(audioEl);
  setupVolumeListeners();

  document.getElementById('btn-audio-play')?.addEventListener('click', togglePlayAudio);
  document.getElementById('btn-mini-play')?.addEventListener('click', togglePlayAudio);
  document.getElementById('btn-audio-rewind')?.addEventListener('click', () => seekAudioRelative(-5));
  document.getElementById('btn-audio-forward')?.addEventListener('click', () => seekAudioRelative(5));
  document.getElementById('btn-mini-rewind')?.addEventListener('click', () => seekAudioRelative(-5));
  document.getElementById('btn-mini-forward')?.addEventListener('click', () => seekAudioRelative(5));
  document.getElementById('btn-track-prev')?.addEventListener('click', playPrevTrack);
  document.getElementById('btn-track-next')?.addEventListener('click', () => playNextTrack(false));
  document.getElementById('btn-speed-cycle')?.addEventListener('click', cyclePlaybackSpeed);
  document.getElementById('btn-audio-loop')?.addEventListener('click', () => {
    cycleLoopMode();
    refreshLucideIcons();
  });
  document.getElementById('btn-ab-loop')?.addEventListener('click', toggleAbLoopPoint);

  document.getElementById('btn-toggle-time-mode')?.addEventListener('click', () => {
    mediaDockState.showRemainingTime = !mediaDockState.showRemainingTime;
    const el = mediaDockState.audioElement;
    if (el && el.duration) {
      const timeTot = document.getElementById('audio-time-total');
      if (timeTot) {
        timeTot.innerText = mediaDockState.showRemainingTime
          ? `-${formatTime(Math.max(0, el.duration - el.currentTime))}`
          : formatTime(el.duration);
      }
    }
  });

  const playlistDrawer = document.getElementById('apple-audio-playlist-drawer');
  const toggleDrawerBtn = document.getElementById('btn-toggle-playlist-drawer');
  const togglePlaylistDrawer = () => {
    mediaDockState.isPlaylistDrawerOpen = !mediaDockState.isPlaylistDrawerOpen;
    if (mediaDockState.isPlaylistDrawerOpen) {
      playlistDrawer?.classList.remove('hidden');
      toggleDrawerBtn?.classList.add('bg-white/25', 'text-white');
      const book = appState.get('currentBook');
      if (book && book.audioTracks) renderPlaylistDrawer(naturalSortAudioTracks(book.audioTracks));
    } else {
      playlistDrawer?.classList.add('hidden');
      toggleDrawerBtn?.classList.remove('bg-white/25', 'text-white');
    }
  };
  toggleDrawerBtn?.addEventListener('click', togglePlaylistDrawer);
  document.getElementById('btn-close-playlist-drawer')?.addEventListener('click', togglePlaylistDrawer);

  document.getElementById('input-search-playlist-tracks')?.addEventListener('input', (e: any) => {
    mediaDockState.currentSearchQuery = e.target.value;
    const book = appState.get('currentBook');
    if (book && book.audioTracks) renderPlaylistDrawer(naturalSortAudioTracks(book.audioTracks));
  });

  document.getElementById('btn-track-delete')?.addEventListener('click', async () => {
    const book = appState.get('currentBook');
    const currentTrack = appState.get('currentAudioTrack');
    if (!book || !book.audioTracks || !currentTrack) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa bài nghe "${currentTrack.name}" khỏi sách?`)) return;
    book.audioTracks = book.audioTracks.filter(t => t.id !== currentTrack.id);
    book.lastModified = Date.now();
    await saveBookToDB(book);
    void syncBookToCloud(book, { includePages: false, includeAudio: true });
    const allBooks = appState.get('allBooks');
    const idx = allBooks.findIndex(b => b.id === book.id);
    if (idx !== -1) {
      allBooks[idx] = { ...book };
      appState.set('allBooks', [...allBooks]);
    }
    initMediaDock(book, true);
    showToast('🗑️ Đã xóa bài nghe khỏi sách');
  });

  document.getElementById('btn-sort-audio-tracks')?.addEventListener('click', async () => {
    const book = appState.get('currentBook');
    if (!book || !book.audioTracks || book.audioTracks.length === 0) {
      showToast('⚠️ Không có bài nghe để sắp xếp');
      return;
    }
    book.audioTracks = naturalSortAudioTracks(book.audioTracks);
    book.lastModified = Date.now();
    await saveBookToDB(book);
    void syncBookToCloud(book, { includePages: false, includeAudio: true });
    initMediaDock(book);
    showToast('🔢 Đã sắp xếp lại bài nghe theo thứ tự tự nhiên (1..10)!');
  });

  document.getElementById('btn-minimize-media-dock')?.addEventListener('click', minimizeMediaDock);
  document.getElementById('btn-mini-expand')?.addEventListener('click', expandMediaDock);
  document.getElementById('mini-pill-expand-trigger')?.addEventListener('click', expandMediaDock);
  document.getElementById('btn-close-media-dock')?.addEventListener('click', () => {
    appState.set('isMediaDockOpen', false);
    appState.set('isPlayingAudio', false);
    updatePlayButtonUI(false);
    cleanupAudioPipeline(mediaDockState.audioElement);
  });
  document.getElementById('btn-mini-close')?.addEventListener('click', () => {
    document.getElementById('media-mini-pill')?.classList.add('hidden');
    appState.set('isMediaDockOpen', false);
    appState.set('isPlayingAudio', false);
    updatePlayButtonUI(false);
    cleanupAudioPipeline(mediaDockState.audioElement);
  });

  document.getElementById('btn-open-batch-media-from-dock')?.addEventListener('click', () => {
    callbacks.onOpenBatchMedia?.();
  });

  document.getElementById('audio-progress-bar')?.addEventListener('input', (e: any) => {
    seekAudio(parseFloat(e.target.value));
  });

  document.getElementById('media-track-select')?.addEventListener('change', (e: any) => {
    const book = appState.get('currentBook');
    const found = book?.audioTracks?.find(t => t.id === e.target.value);
    if (found) {
      loadTrack(found);
      playLoadedTrack();
    }
  });

  document.getElementById('input-add-audio-files')?.addEventListener('change', (e: any) => {
    handleAddAudioFilesToBook(e.target.files);
    e.target.value = '';
  });
  document.getElementById('input-add-audio-files-empty')?.addEventListener('change', (e: any) => {
    handleAddAudioFilesToBook(e.target.files);
    e.target.value = '';
  });

  setupKeyboardAndStateSubscriptions();
}
