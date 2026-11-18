import { appState } from '../../state/appState';
import { refreshLucideIcons } from '../../utils/icons';
import { mediaDockState, formatTime } from './mediaDockState';
import { initMediaDock, updatePlayButtonUI } from './mediaDockController';
import {
  togglePlayAudio,
  playNextTrack,
  playPrevTrack,
  seekAudioRelative
} from './mediaDockTransport';

export function bindAudioElementEvents(audioEl: HTMLAudioElement): void {
  if (!audioEl) return;

  audioEl.onloadedmetadata = () => {
    const dur = audioEl.duration;
    const timeTot = document.getElementById('audio-time-total');
    if (timeTot && Number.isFinite(dur) && dur > 0) {
      timeTot.innerText = mediaDockState.showRemainingTime ? `-${formatTime(dur)}` : formatTime(dur);
    }
  };

  audioEl.ontimeupdate = () => {
    const activeEl = mediaDockState.audioElement;
    if (!activeEl || !activeEl.duration) return;

    if (
      mediaDockState.abLoopStart !== null &&
      mediaDockState.abLoopEnd !== null &&
      activeEl.currentTime >= mediaDockState.abLoopEnd
    ) {
      activeEl.currentTime = mediaDockState.abLoopStart;
    }

    const cur = activeEl.currentTime;
    const dur = activeEl.duration;
    const progress = document.getElementById('audio-progress-bar') as HTMLInputElement;
    const timeCur = document.getElementById('audio-time-current');
    const timeTot = document.getElementById('audio-time-total');
    const miniTime = document.getElementById('mini-pill-time');

    if (progress && !progress.matches(':active')) progress.value = String((cur / dur) * 100);
    if (timeCur) timeCur.innerText = formatTime(cur);
    if (timeTot) {
      timeTot.innerText = mediaDockState.showRemainingTime
        ? `-${formatTime(Math.max(0, dur - cur))}`
        : formatTime(dur);
    }
    if (miniTime) miniTime.innerText = formatTime(cur);
  };

  audioEl.onended = () => {
    playNextTrack(true);
  };
}

export function setupVolumeListeners(): void {
  const volumeSlider = document.getElementById('audio-volume-slider') as HTMLInputElement;
  const volumeBtn = document.getElementById('btn-volume-toggle');
  const volumeIcon = document.getElementById('icon-volume-speaker');

  const updateVolumeIcon = (vol: number) => {
    if (!volumeIcon) return;
    volumeIcon.setAttribute('data-lucide', vol === 0 ? 'volume-x' : vol < 0.5 ? 'volume-1' : 'volume-2');
    refreshLucideIcons();
  };

  volumeSlider?.addEventListener('input', (e: any) => {
    if (!mediaDockState.audioElement) return;
    const val = parseFloat(e.target.value);
    mediaDockState.audioElement.volume = val;
    mediaDockState.isMuted = val === 0;
    updateVolumeIcon(val);
  });

  volumeBtn?.addEventListener('click', () => {
    const audioEl = mediaDockState.audioElement;
    if (!audioEl) return;
    if (mediaDockState.isMuted) {
      audioEl.volume = mediaDockState.previousVolume || 1;
      if (volumeSlider) volumeSlider.value = String(audioEl.volume);
      mediaDockState.isMuted = false;
      updateVolumeIcon(audioEl.volume);
    } else {
      mediaDockState.previousVolume = audioEl.volume;
      audioEl.volume = 0;
      if (volumeSlider) volumeSlider.value = '0';
      mediaDockState.isMuted = true;
      updateVolumeIcon(0);
    }
  });
}

export function setupKeyboardAndStateSubscriptions(): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) return;
    if (!appState.get('isMediaDockOpen')) return;

    if (e.code === 'ArrowLeft' && e.shiftKey) {
      e.preventDefault();
      playPrevTrack();
    } else if (e.code === 'ArrowRight' && e.shiftKey) {
      e.preventDefault();
      playNextTrack();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      seekAudioRelative(-5);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      seekAudioRelative(5);
    }
  });

  appState.subscribe('isMediaDockOpen', (isOpen) => {
    const dock = document.getElementById('media-player-dock');
    const mini = document.getElementById('media-mini-pill');
    if (isOpen) {
      dock?.classList.remove('hidden');
      mini?.classList.add('hidden');
      initMediaDock(appState.get('currentBook'));
      refreshLucideIcons();
    } else {
      dock?.classList.add('hidden');
    }
  });

  appState.subscribe('currentBook', (book) => {
    if (!book) {
      updatePlayButtonUI(false);
    }
    initMediaDock(book);
  });
}
