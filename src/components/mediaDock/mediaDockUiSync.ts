import { AudioTrack } from '../../types';
import { refreshLucideIcons } from '../../utils/icons';
import { detectAudioFormatLabel } from '../../utils/audioHelper';
import { mediaDockState } from './mediaDockState';

export function updatePlayButtonUI(playing: boolean): void {
  const icon = document.getElementById('icon-audio-play');
  const miniIcon = document.getElementById('mini-pill-play-icon');
  const playBtn = document.getElementById('btn-audio-play');
  const eqBars = document.getElementById('apple-equalizer-bars');
  const miniEq = document.getElementById('mini-pill-eq');

  if (icon) icon.setAttribute('data-lucide', playing ? 'pause' : 'play');
  if (playBtn) playBtn.setAttribute('title', playing ? 'Tạm dừng [Space]' : 'Phát bài nghe [Space]');
  if (miniIcon) miniIcon.setAttribute('data-lucide', playing ? 'pause' : 'play');

  eqBars?.classList.toggle('apple-eq-playing', playing);
  miniEq?.classList.toggle('animate-pulse', playing);
  refreshLucideIcons();
}

export function resetAbLoopUI(): void {
  mediaDockState.abLoopStart = null;
  mediaDockState.abLoopEnd = null;
  const abBtn = document.getElementById('btn-ab-loop');
  if (abBtn) {
    abBtn.innerText = 'A-B';
    abBtn.className = 'h-8 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/75 text-[11px] font-mono font-bold transition active:scale-95 cursor-pointer shrink-0 border border-white/10 whitespace-nowrap';
  }
}

export function syncTrackMetadataUI(track: AudioTrack, positionIndex: number, totalTracks: number): void {
  const select = document.getElementById('media-track-select') as HTMLSelectElement;
  const miniTrackName = document.getElementById('mini-pill-track-name');
  const playerTrackName = document.getElementById('player-track-name');
  const playerTrackFolder = document.getElementById('player-track-folder');
  const playerTrackTag = document.getElementById('player-track-format-tag');
  const topFormatBadge = document.getElementById('media-track-format-badge');
  const trackPositionEl = document.getElementById('media-track-position');
  const progressBar = document.getElementById('audio-progress-bar') as HTMLInputElement;
  const timeCur = document.getElementById('audio-time-current');
  const timeTot = document.getElementById('audio-time-total');

  const format = detectAudioFormatLabel(track.name, track.url);

  if (select && track.id) select.value = track.id;
  if (miniTrackName) miniTrackName.innerText = track.name;
  if (playerTrackName) playerTrackName.innerText = track.name;
  if (playerTrackFolder) playerTrackFolder.innerText = track.folder || 'Thư mục chung';
  if (progressBar) progressBar.value = '0';
  if (timeCur) timeCur.innerText = '00:00';
  if (timeTot) timeTot.innerText = '00:00';

  if (trackPositionEl && totalTracks > 0) {
    trackPositionEl.innerText = `Bài ${positionIndex + 1} / ${totalTracks}`;
  }

  if (playerTrackTag) {
    playerTrackTag.innerText = format;
    playerTrackTag.className = `text-[10px] font-mono font-bold uppercase shrink-0 ${
      format === 'WAV' ? 'text-emerald-300' : 'text-sky-300'
    }`;
  }

  if (topFormatBadge) {
    topFormatBadge.innerText = format;
    topFormatBadge.classList.remove('hidden');
  }
}
