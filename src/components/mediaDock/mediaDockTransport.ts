import { appState } from '../../state/appState';
import { naturalSortAudioTracks } from '../../utils/sorting';
import { showToast } from '../../utils/toast';
import { playAudioPipeline } from '../../services/audioService';
import { mediaDockState, SPEED_OPTIONS, AudioLoopMode, formatTime } from './mediaDockState';
import { ensureAudioElement, loadTrack, updatePlayButtonUI, resetAbLoopUI } from './mediaDockController';

function getActiveTrackIndex(sortedLength: number, sortedTracks: { id: string }[]): number {
  const activeId = mediaDockState.currentTrackId || appState.get('currentAudioTrack')?.id;
  if (activeId) {
    const idx = sortedTracks.findIndex(t => t.id === activeId);
    if (idx !== -1) {
      mediaDockState.currentTrackIndex = idx;
      return idx;
    }
  }
  const clamped = Math.max(0, Math.min(sortedLength - 1, mediaDockState.currentTrackIndex));
  return clamped;
}

export function playLoadedTrack(): void {
  const audioEl = ensureAudioElement();
  if (!audioEl) return;

  if (!audioEl.src || audioEl.src === '' || audioEl.src.endsWith('undefined')) {
    const book = appState.get('currentBook');
    if (book && book.audioTracks && book.audioTracks.length > 0) {
      loadTrack(naturalSortAudioTracks(book.audioTracks)[0]);
    } else {
      showToast('⚠️ Sách chưa có bài nghe nào. Hãy nhấn "Thêm Audio"');
      return;
    }
  }

  playAudioPipeline(audioEl).then(() => {
    updatePlayButtonUI(true);
    appState.set('isPlayingAudio', true);
  }).catch(e => {
    console.warn('Audio play error:', e);
    updatePlayButtonUI(false);
    appState.set('isPlayingAudio', false);
    showToast('⚠️ Đang tải hoặc giải mã tệp âm thanh...');
  });
}

export function togglePlayAudio(): void {
  const audioEl = ensureAudioElement();
  if (!audioEl) return;
  if (audioEl.paused) {
    playLoadedTrack();
  } else {
    audioEl.pause();
    updatePlayButtonUI(false);
    appState.set('isPlayingAudio', false);
  }
}

export function playNextTrack(isAutoAdvance = false): void {
  const book = appState.get('currentBook');
  if (!book || !book.audioTracks || book.audioTracks.length === 0) return;

  const sorted = naturalSortAudioTracks(book.audioTracks);
  const currentIdx = getActiveTrackIndex(sorted.length, sorted);

  if (isAutoAdvance && mediaDockState.loopMode === 'single') {
    const audioEl = ensureAudioElement();
    if (audioEl) {
      audioEl.currentTime = 0;
      playLoadedTrack();
    }
    return;
  }

  const nextIdx = currentIdx + 1;
  if (nextIdx >= sorted.length) {
    if (isAutoAdvance && mediaDockState.loopMode === 'sequential') {
      updatePlayButtonUI(false);
      appState.set('isPlayingAudio', false);
      showToast('✅ Đã phát hết danh sách bài nghe');
      return;
    }
    mediaDockState.currentTrackIndex = 0;
    loadTrack(sorted[0]);
    playLoadedTrack();
    return;
  }

  mediaDockState.currentTrackIndex = nextIdx;
  loadTrack(sorted[nextIdx]);
  playLoadedTrack();
}

export function playPrevTrack(): void {
  const book = appState.get('currentBook');
  if (!book || !book.audioTracks || book.audioTracks.length === 0) return;
  const sorted = naturalSortAudioTracks(book.audioTracks);
  const currentIdx = getActiveTrackIndex(sorted.length, sorted);
  const prevIdx = (currentIdx - 1 + sorted.length) % sorted.length;
  mediaDockState.currentTrackIndex = prevIdx;
  loadTrack(sorted[prevIdx]);
  playLoadedTrack();
}

export function seekAudioRelative(seconds: number): void {
  const audioEl = mediaDockState.audioElement;
  if (!audioEl) return;
  const dur = audioEl.duration || 0;
  audioEl.currentTime = Math.max(0, Math.min(dur, audioEl.currentTime + seconds));
}

export function seekAudio(value: number): void {
  const audioEl = mediaDockState.audioElement;
  if (!audioEl || !audioEl.duration) return;
  audioEl.currentTime = (value / 100) * audioEl.duration;
}

export function setPlaybackRate(rate: number): void {
  const audioEl = mediaDockState.audioElement;
  if (!audioEl) return;
  audioEl.playbackRate = rate;
  const speedBtn = document.getElementById('btn-speed-cycle');
  if (speedBtn) speedBtn.innerText = `${rate}×`;
}

export function cyclePlaybackSpeed(): void {
  mediaDockState.currentSpeedIndex = (mediaDockState.currentSpeedIndex + 1) % SPEED_OPTIONS.length;
  const speed = SPEED_OPTIONS[mediaDockState.currentSpeedIndex];
  setPlaybackRate(speed);
  showToast(`⚡ Tốc độ phát: ${speed}×`);
}

export function cycleLoopMode(): void {
  const order: AudioLoopMode[] = ['sequential', 'all', 'single'];
  const nextMode = order[(order.indexOf(mediaDockState.loopMode) + 1) % order.length];
  mediaDockState.loopMode = nextMode;

  const btn = document.getElementById('btn-audio-loop');
  const icon = document.getElementById('icon-audio-loop');
  const label = document.getElementById('label-audio-loop');
  if (btn && icon && label) {
    if (nextMode === 'sequential') {
      icon.setAttribute('data-lucide', 'arrow-right-circle');
      label.innerText = 'Tuần tự';
      btn.className = 'h-8 px-2 rounded-lg text-white/65 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center gap-1 shrink-0 text-[11px] font-semibold whitespace-nowrap';
      showToast('➡️ Chế độ phát: Tuần tự sang bài kế tiếp');
    } else if (nextMode === 'all') {
      icon.setAttribute('data-lucide', 'repeat');
      label.innerText = 'Lặp hết';
      btn.className = 'h-8 px-2 rounded-lg bg-sky-500/25 text-sky-200 border border-sky-400/40 transition cursor-pointer flex items-center gap-1 shrink-0 text-[11px] font-semibold whitespace-nowrap';
      showToast('🔁 Chế độ phát: Lặp lại toàn bộ danh sách');
    } else {
      icon.setAttribute('data-lucide', 'repeat-1');
      label.innerText = 'Lặp 1 bài';
      btn.className = 'h-8 px-2 rounded-lg bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 transition cursor-pointer flex items-center gap-1 shrink-0 text-[11px] font-semibold whitespace-nowrap';
      showToast('🔂 Chế độ phát: Lặp lại bài nghe hiện tại');
    }
  }
}

export function toggleAbLoopPoint(): void {
  const audioEl = mediaDockState.audioElement;
  const abBtn = document.getElementById('btn-ab-loop');
  if (!audioEl || !audioEl.duration) {
    showToast('⚠️ Vui lòng phát bài nghe trước khi đánh dấu A–B');
    return;
  }

  if (mediaDockState.abLoopStart === null) {
    mediaDockState.abLoopStart = audioEl.currentTime;
    if (abBtn) {
      abBtn.innerText = `A:${formatTime(mediaDockState.abLoopStart)}`;
      abBtn.className = 'h-8 px-2 rounded-lg bg-amber-500/25 text-amber-200 border border-amber-400/50 text-[11px] font-mono font-bold transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap';
    }
    showToast(`📍 Đã đặt điểm A (${formatTime(mediaDockState.abLoopStart)}). Nhấn lại để đặt điểm B`);
  } else if (mediaDockState.abLoopEnd === null) {
    if (audioEl.currentTime <= mediaDockState.abLoopStart + 0.5) {
      showToast('⚠️ Điểm B phải nằm sau điểm A ít nhất 0.5 giây');
      return;
    }
    mediaDockState.abLoopEnd = audioEl.currentTime;
    if (abBtn) {
      abBtn.innerText = 'A↔B';
      abBtn.className = 'h-8 px-2 rounded-lg bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 text-[11px] font-mono font-bold transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap';
    }
    audioEl.currentTime = mediaDockState.abLoopStart;
    playLoadedTrack();
    showToast(`🔁 Đang lặp đoạn ${formatTime(mediaDockState.abLoopStart)} – ${formatTime(mediaDockState.abLoopEnd)}`);
  } else {
    resetAbLoopUI();
    showToast('Đã tắt lặp đoạn A–B');
  }
}
