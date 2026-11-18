import { AudioTrack, Book } from '../../types';
import { appState } from '../../state/appState';
import { naturalSortAudioTracks } from '../../utils/sorting';
import { refreshLucideIcons } from '../../utils/icons';
import {
  instantiateAudioPlayer,
  configureAudioSource,
  isWavFormat
} from '../../services/audioService';
import { mediaDockState, SPEED_OPTIONS } from './mediaDockState';
import { renderPlaylistDrawer } from './mediaDockPlaylist';
import { updatePlayButtonUI, resetAbLoopUI, syncTrackMetadataUI } from './mediaDockUiSync';

export { updatePlayButtonUI, resetAbLoopUI } from './mediaDockUiSync';

let onBindAudioElement: ((el: HTMLAudioElement) => void) | null = null;

export function registerAudioElementBinder(fn: (el: HTMLAudioElement) => void): void {
  onBindAudioElement = fn;
}

export function ensureAudioElement(): HTMLAudioElement | null {
  if (!mediaDockState.audioElement) {
    const domEl = document.getElementById('global-audio-player') as HTMLAudioElement;
    mediaDockState.audioElement = domEl || instantiateAudioPlayer();
    onBindAudioElement?.(mediaDockState.audioElement);
  }
  return mediaDockState.audioElement;
}

export function loadTrack(track: AudioTrack): void {
  const audioEl = ensureAudioElement();
  if (!audioEl || !track) return;

  const book = appState.get('currentBook');
  const sorted = book?.audioTracks ? naturalSortAudioTracks(book.audioTracks) : [];
  const foundIdx = sorted.findIndex(t => t.id === track.id);
  if (foundIdx !== -1) {
    mediaDockState.currentTrackIndex = foundIdx;
  }
  mediaDockState.currentTrackId = track.id;
  resetAbLoopUI();

  const isWav = isWavFormat(track.name, track.blob) || track.fileType === 'WAV' || track.url?.startsWith('data:audio/wav');
  const mimeType = isWav ? 'audio/wav' : undefined;
  const sourceToConfigure: string | Blob = track.blob || track.url;
  configureAudioSource(audioEl, sourceToConfigure, mimeType);
  audioEl.playbackRate = SPEED_OPTIONS[mediaDockState.currentSpeedIndex] || 1.0;

  const pos = foundIdx !== -1 ? foundIdx : mediaDockState.currentTrackIndex;
  syncTrackMetadataUI(track, pos, sorted.length);

  appState.set('currentAudioTrack', track);
  if (sorted.length > 0) renderPlaylistDrawer(sorted);
}

export function initMediaDock(book: Book | null, forceResetTrack = false): void {
  const audioEl = ensureAudioElement();
  const select = document.getElementById('media-track-select') as HTMLSelectElement;
  const trackCountBadge = document.getElementById('media-track-count-badge');
  const trackPositionEl = document.getElementById('media-track-position');
  const bookLabel = document.getElementById('media-current-book-label');
  const emptyState = document.getElementById('media-dock-empty-state');
  const playerContent = document.getElementById('media-dock-player-content');
  const miniTrackName = document.getElementById('mini-pill-track-name');

  if (bookLabel) bookLabel.innerText = book ? book.title : 'Chưa chọn sách';
  if (!select) return;
  select.innerHTML = '';

  const tracks = book?.audioTracks || [];
  const trackCount = tracks.length;
  if (trackCountBadge) trackCountBadge.innerText = `${trackCount} bài nghe`;

  if (trackCount === 0) {
    mediaDockState.loadedBookId = book?.id || null;
    mediaDockState.currentTrackId = null;
    mediaDockState.currentTrackIndex = 0;
    select.innerHTML = `<option value="">-- Chưa có bài nghe --</option>`;
    emptyState?.classList.remove('hidden');
    playerContent?.classList.add('hidden');
    if (trackPositionEl) trackPositionEl.innerText = 'Bài 0 / 0';
    if (miniTrackName) miniTrackName.innerText = 'Không có audio';
    renderPlaylistDrawer([]);
    return;
  }

  emptyState?.classList.add('hidden');
  playerContent?.classList.remove('hidden');

  const sortedTracks = naturalSortAudioTracks(tracks);
  const folders: Record<string, typeof sortedTracks> = {};
  sortedTracks.forEach(t => {
    const f = t.folder || 'Khác';
    if (!folders[f]) folders[f] = [];
    folders[f].push(t);
  });

  Object.keys(folders).sort().forEach(folderName => {
    const group = document.createElement('optgroup');
    group.label = folderName === 'Khác' ? 'Thư mục chung' : folderName;
    folders[folderName].forEach(track => {
      const absIdx = sortedTracks.findIndex(t => t.id === track.id);
      const opt = document.createElement('option');
      opt.value = track.id;
      opt.innerText = `${absIdx + 1}. ${track.name}`;
      opt.dataset.index = String(absIdx);
      group.appendChild(opt);
    });
    select.appendChild(group);
  });

  const isSameBook = Boolean(book?.id && book.id === mediaDockState.loadedBookId);
  const existingIdx = mediaDockState.currentTrackId
    ? sortedTracks.findIndex(t => t.id === mediaDockState.currentTrackId)
    : -1;

  mediaDockState.loadedBookId = book?.id || null;

  if (!forceResetTrack && isSameBook && existingIdx !== -1) {
    mediaDockState.currentTrackIndex = existingIdx;
    select.value = sortedTracks[existingIdx].id;
    if (trackPositionEl) trackPositionEl.innerText = `Bài ${existingIdx + 1} / ${sortedTracks.length}`;
    if (audioEl) updatePlayButtonUI(!audioEl.paused);
    renderPlaylistDrawer(sortedTracks);
  } else {
    mediaDockState.currentTrackIndex = 0;
    loadTrack(sortedTracks[0]);
  }
  refreshLucideIcons();
}

export function toggleMediaDockVisibility(): boolean {
  const nextState = !appState.get('isMediaDockOpen');
  appState.set('isMediaDockOpen', nextState);
  return nextState;
}

export function minimizeMediaDock(): void {
  document.getElementById('media-player-dock')?.classList.add('hidden');
  document.getElementById('media-mini-pill')?.classList.remove('hidden');
}

export function expandMediaDock(): void {
  document.getElementById('media-mini-pill')?.classList.add('hidden');
  document.getElementById('media-player-dock')?.classList.remove('hidden');
  appState.set('isMediaDockOpen', true);
}
