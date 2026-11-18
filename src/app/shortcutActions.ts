import { appState } from '../state/appState';
import {
  toggleLaser,
  toggleSpotlight,
  setDrawingTool,
  undoLastAnnotation,
  getAnnotationState
} from '../services/annotationService';
import { showToast } from '../utils/toast';
import { toggleFullscreenTeachingMode, toggleCurtainOverlay } from '../components/FlipbookReader';
import { openThumbnailsModal, closeThumbnailsModal } from '../components/ThumbnailsModal';
import { openShortcutsModal, closeShortcutsModal } from '../components/ShortcutsModal';

export function handleToolToggleKey(key: string, code: string): boolean {
  if (key === 'p' || key === '1' || code === 'KeyP' || code === 'Digit1' || code === 'Numpad1') {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'pencil' ? 'none' : 'pencil');
    showToast(state.currentDrawingTool === 'pencil' ? 'Đã tắt Bút vẽ' : '✏️ Đã chọn Bút vẽ chính [P]');
    return true;
  }

  if (key === 'm' || key === '2' || code === 'KeyM' || code === 'Digit2' || code === 'Numpad2') {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'highlighter' ? 'none' : 'highlighter');
    showToast(state.currentDrawingTool === 'highlighter' ? 'Đã tắt Bút dạ quang' : '🖍️ Đã chọn Bút dạ quang [M]');
    return true;
  }

  if (key === 'e' || key === '3' || code === 'KeyE' || code === 'Digit3' || code === 'Numpad3') {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'eraser' ? 'none' : 'eraser');
    showToast(state.currentDrawingTool === 'eraser' ? 'Đã tắt Cục tẩy' : '🧹 Đã chọn Cục tẩy [E]');
    return true;
  }

  if (key === 'u' || code === 'KeyU') {
    const ok = undoLastAnnotation();
    showToast(ok ? '↩️ Đã hoàn tác nét vẽ [U]' : 'Không còn nét vẽ để hoàn tác');
    return true;
  }

  if (key === 'b' || code === 'KeyB') {
    toggleCurtainOverlay();
    return true;
  }

  return false;
}

export function handleModalAndEscapeKey(key: string, code: string, ensureReaderView: () => boolean): boolean {
  if (key === 'g' || key === 't' || code === 'KeyG' || code === 'KeyT') {
    if (ensureReaderView()) {
      const modal = document.getElementById('modal-thumbnails');
      if (modal && !modal.classList.contains('hidden')) closeThumbnailsModal();
      else openThumbnailsModal();
    }
    return true;
  }

  if (key === '?' || key === '/' || code === 'Slash' || key === 'f1' || code === 'F1') {
    const modal = document.getElementById('modal-shortcuts');
    if (modal && !modal.classList.contains('hidden')) closeShortcutsModal();
    else openShortcutsModal();
    return true;
  }

  if (key === 'escape' || code === 'Escape') {
    closeShortcutsModal();
    closeThumbnailsModal();
    [
      'modal-upload',
      'modal-batch-media',
      'modal-drive',
      'modal-video',
      'modal-delete-confirm',
      'modal-pwa-install',
      'zoom-menu-dropdown',
      'more-tools-dropdown'
    ].forEach(id => document.getElementById(id)?.classList.add('hidden'));

    const state = getAnnotationState();
    if (state.currentDrawingTool !== 'none') {
      setDrawingTool('none');
      showToast('Đã tắt công cụ vẽ');
    }
    if (state.isLaserActive) toggleLaser();
    if (state.isSpotlightActive) toggleSpotlight();
    if (appState.get('isTeachingMode')) toggleFullscreenTeachingMode();
    return true;
  }

  return false;
}
