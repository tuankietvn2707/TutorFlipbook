import { showToast } from '../../utils/toast';
import { openShortcutsModal } from '../ShortcutsModal';
import { toggleSoundEffects } from '../../services/audioService';

export interface ToolbarCallbacks {
  onBackToLibrary: () => void;
  onFlipPrev: () => void;
  onFlipNext: () => void;
  onJumpPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSetZoomLevel: (lvl: number) => void;
  onTogglePan: () => boolean;
  onToggleAudioDock: () => void;
  onOpenThumbnails: () => void;
  onStartTimer: (minutes: number) => void;
  onToggleTimer?: () => void;
  onToggleNotes?: () => void;
  onToggleScoreboard?: () => void;
  onToggleCurtain?: () => void;
  onTriggerConfetti: () => void;
  onToggleFullscreen: () => void;
  onCopyShareLink: () => void;
}

export function updateZoomCheckmarks(activeZoom: string): void {
  document.querySelectorAll('.btn-zoom-item').forEach(item => {
    const z = (item as HTMLElement).getAttribute('data-zoom');
    const check = item.querySelector('.zoom-check');
    if (check) {
      const matched = z === activeZoom || (activeZoom === '1' && z === '1.0');
      check.classList.toggle('hidden', !matched);
      (item as HTMLElement).classList.toggle('font-medium', matched);
    }
  });
}

export function setupTopToolbarListeners(callbacks: ToolbarCallbacks): void {
  document.getElementById('btn-top-back-lib')?.addEventListener('click', callbacks.onBackToLibrary);
  document.getElementById('btn-top-prev-page')?.addEventListener('click', callbacks.onFlipPrev);
  document.getElementById('btn-top-next-page')?.addEventListener('click', callbacks.onFlipNext);
  document.getElementById('btn-top-audio')?.addEventListener('click', callbacks.onToggleAudioDock);
  document.getElementById('btn-top-timer')?.addEventListener('click', () => callbacks.onToggleTimer?.());
  document.getElementById('btn-top-notes')?.addEventListener('click', () => callbacks.onToggleNotes?.());
  document.getElementById('btn-top-scoreboard')?.addEventListener('click', () => callbacks.onToggleScoreboard?.());
  document.getElementById('btn-top-zoom-in')?.addEventListener('click', callbacks.onZoomIn);
  document.getElementById('btn-top-zoom-out')?.addEventListener('click', callbacks.onZoomOut);

  const pageInput = document.getElementById('input-page-number') as HTMLInputElement;
  const submitPageJump = () => {
    if (!pageInput) return;
    const val = parseInt(pageInput.value, 10);
    if (!isNaN(val) && val >= 1) callbacks.onJumpPage(val);
  };
  pageInput?.addEventListener('change', submitPageJump);
  pageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitPageJump(); pageInput.blur(); }
  });

  const btnZoom = document.getElementById('btn-top-zoom');
  const zoomMenu = document.getElementById('zoom-menu-dropdown');
  btnZoom?.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomMenu?.classList.toggle('hidden');
    document.getElementById('more-tools-dropdown')?.classList.add('hidden');
  });

  document.querySelectorAll('.btn-zoom-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const zoomVal = (item as HTMLElement).getAttribute('data-zoom');
      if (zoomVal === 'fit' || zoomVal === '1.0') callbacks.onResetZoom();
      else callbacks.onSetZoomLevel(parseFloat(zoomVal || '1.0'));
      zoomMenu?.classList.add('hidden');
      updateZoomCheckmarks(zoomVal || '1.0');
    });
  });

  const btnMore = document.getElementById('btn-top-more-tools');
  const moreMenu = document.getElementById('more-tools-dropdown');
  btnMore?.addEventListener('click', (e) => {
    e.stopPropagation();
    moreMenu?.classList.toggle('hidden');
    zoomMenu?.classList.add('hidden');
  });

  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('#zoom-dropdown-container')) zoomMenu?.classList.add('hidden');
    if (!target.closest('#more-tools-dropdown-container')) moreMenu?.classList.add('hidden');
  });

  document.getElementById('menu-item-thumbnails')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onOpenThumbnails();
  });
  document.getElementById('menu-item-audio')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onToggleAudioDock();
  });
  document.getElementById('menu-item-curtain')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onToggleCurtain?.();
  });
  document.getElementById('menu-item-fullscreen')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onToggleFullscreen();
  });
  document.getElementById('menu-item-sound')?.addEventListener('click', () => {
    const enabled = toggleSoundEffects();
    const soundState = document.getElementById('menu-sound-state');
    if (soundState) {
      soundState.innerText = enabled ? 'Bật' : 'Tắt';
      soundState.className = enabled ? 'text-[11px] font-semibold text-emerald-600' : 'text-[11px] font-semibold text-slate-400';
    }
    showToast(enabled ? '🔊 Đã bật âm thanh lật sách' : '🔇 Đã tắt âm thanh');
  });
  document.getElementById('menu-item-timer')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onStartTimer(5);
  });
  document.getElementById('menu-item-confetti')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onTriggerConfetti();
  });
  document.getElementById('menu-item-shortcuts')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    openShortcutsModal();
  });
  document.getElementById('menu-item-share')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onCopyShareLink();
  });
}
