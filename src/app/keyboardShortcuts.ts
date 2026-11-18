import { appState } from '../state/appState';
import { toggleLaser, toggleSpotlight, clearAllAnnotations } from '../services/annotationService';
import { showToast } from '../utils/toast';
import {
  openBookInReader,
  flipNextPage,
  flipPrevPage,
  flipFirstPage,
  flipLastPage,
  zoomIn,
  zoomOut,
  resetReaderZoom,
  togglePanTool,
  toggleFullscreenTeachingMode,
  triggerRewardConfetti
} from '../components/FlipbookReader';
import {
  togglePlayAudio,
  playNextTrack,
  playPrevTrack,
  toggleMediaDockVisibility
} from '../components/MediaDock';
import { showReaderView } from './viewRouter';
import { handleToolToggleKey, handleModalAndEscapeKey } from './shortcutActions';

function ensureReaderView(): boolean {
  const readerContainer = document.getElementById('view-reader-container');
  if (readerContainer && !readerContainer.classList.contains('hidden')) return true;

  const cur = appState.get('currentBook');
  const all = appState.get('allBooks');
  if (cur) {
    showReaderView();
    return true;
  }
  if (all && all.length > 0) {
    showReaderView();
    openBookInReader(all[0]);
    return true;
  }
  showToast('📚 Thư viện chưa có sách. Vui lòng tải sách lên để trải nghiệm!');
  return false;
}

export function createGlobalKeyDownHandler(): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
      if (e.key === 'Escape' || e.code === 'Escape') target.blur();
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (key === 'arrowright' || key === 'pagedown' || key === 'j' || code === 'ArrowRight' || code === 'PageDown' || code === 'KeyJ') {
      if (ensureReaderView()) { e.preventDefault(); flipNextPage(); }
      return;
    }
    if (key === 'arrowleft' || key === 'pageup' || key === 'k' || code === 'ArrowLeft' || code === 'PageUp' || code === 'KeyK') {
      if (ensureReaderView()) { e.preventDefault(); flipPrevPage(); }
      return;
    }
    if (key === 'home' || code === 'Home') {
      if (ensureReaderView()) { e.preventDefault(); flipFirstPage(); }
      return;
    }
    if (key === 'end' || code === 'End') {
      if (ensureReaderView()) { e.preventDefault(); flipLastPage(); }
      return;
    }

    if (key === '+' || key === '=' || code === 'Equal' || code === 'NumpadAdd') {
      if (ensureReaderView()) { e.preventDefault(); zoomIn(); }
      return;
    }
    if (key === '-' || key === '_' || code === 'Minus' || code === 'NumpadSubtract') {
      if (ensureReaderView()) { e.preventDefault(); zoomOut(); }
      return;
    }
    if (key === '0' || key === 'z' || code === 'Digit0' || code === 'Numpad0' || code === 'KeyZ') {
      if (ensureReaderView()) { e.preventDefault(); resetReaderZoom(); }
      return;
    }
    if (key === 'h' || code === 'KeyH') {
      if (ensureReaderView()) {
        e.preventDefault();
        const active = togglePanTool();
        showToast(active ? '✋ Đã bật Bàn tay kéo trang [H]' : 'Đã tắt Bàn tay kéo trang');
      }
      return;
    }

    if (key === 'l' || code === 'KeyL') {
      if (ensureReaderView()) {
        e.preventDefault();
        showToast(toggleLaser() ? '🔴 Đã bật con trỏ Laser [L]' : 'Đã tắt con trỏ Laser');
      }
      return;
    }
    if (key === 's' || code === 'KeyS') {
      if (ensureReaderView()) {
        e.preventDefault();
        showToast(toggleSpotlight() ? '💡 Đã bật Đèn rọi Spotlight [S]' : 'Đã tắt Đèn rọi Spotlight');
      }
      return;
    }

    if (ensureReaderView() && handleToolToggleKey(key, code)) {
      e.preventDefault();
      return;
    }

    if (key === 'c' || key === 'delete' || code === 'KeyC' || code === 'Delete' || code === 'Backspace') {
      if (ensureReaderView()) {
        e.preventDefault();
        clearAllAnnotations();
        showToast('🗑️ Đã xóa sạch nét vẽ trên trang [C]');
      }
      return;
    }

    if (key === ' ' || code === 'Space') {
      e.preventDefault();
      const curBook = appState.get('currentBook');
      if (curBook && curBook.audioTracks && curBook.audioTracks.length > 0) togglePlayAudio();
      else if (ensureReaderView()) flipNextPage();
      return;
    }
    if (key === 'a' || code === 'KeyA') { e.preventDefault(); toggleMediaDockVisibility(); return; }
    if (key === '[' || code === 'BracketLeft') { e.preventDefault(); playPrevTrack(); return; }
    if (key === ']' || code === 'BracketRight') { e.preventDefault(); playNextTrack(false); return; }
    if (key === 'f' || code === 'KeyF') {
      if (ensureReaderView()) { e.preventDefault(); toggleFullscreenTeachingMode(); }
      return;
    }
    if (key === 'r' || code === 'KeyR') { e.preventDefault(); triggerRewardConfetti(); return; }

    if (handleModalAndEscapeKey(key, code, ensureReaderView)) {
      e.preventDefault();
    }
  };
}
