import { appState } from '../state/appState';
import { resizeAnnotationCanvas, setupAnnotationListeners } from '../services/annotationService';
import { setupToolbarListeners } from './TeachingToolbar';
import { showToast } from '../utils/toast';
import { updateReaderMeta } from './flipbook/flipbookVirtualizer';
import { initPageFlip } from './flipbook/flipbookInitializer';
import {
  setupTeachingToolsListeners,
  openAndStartTimer,
  toggleTimerWidget,
  toggleNotesWidget,
  toggleScoreboardWidget,
  toggleCurtainOverlay
} from './teachingTools/teachingToolsController';
import {
  zoomIn,
  zoomOut,
  resetReaderZoom,
  setZoom,
  togglePanTool,
  setupPanListeners
} from './flipbook/flipbookZoomPan';
import {
  flipNextPage,
  flipPrevPage,
  jumpToPage,
  triggerRewardConfetti,
  toggleFullscreenTeachingMode
} from './flipbook/flipbookNavigation';

export { renderFlipbookReaderHtml } from './flipbook/flipbookTemplate';
export { updateVirtualPageImages, cleanupFlipbookReader } from './flipbook/flipbookVirtualizer';
export { openBookInReader } from './flipbook/flipbookLoader';
export { initPageFlip } from './flipbook/flipbookInitializer';
export { zoomIn, zoomOut, resetReaderZoom, setZoom, togglePanTool } from './flipbook/flipbookZoomPan';
export {
  flipNextPage,
  flipPrevPage,
  flipFirstPage,
  flipLastPage,
  jumpToPage,
  triggerRewardConfetti,
  toggleFullscreenTeachingMode
} from './flipbook/flipbookNavigation';
export {
  toggleTimerWidget,
  toggleNotesWidget,
  toggleScoreboardWidget,
  toggleCurtainOverlay
} from './teachingTools/teachingToolsController';

export function setupFlipbookReaderListeners(callbacks: {
  onBackToLibrary: () => void;
  onOpenThumbnails: () => void;
  onOpenBatchAudio?: () => void;
  onOpenVideo?: (url: string, title?: string) => void;
}): void {
  document.getElementById('btn-stage-prev')?.addEventListener('click', flipPrevPage);
  document.getElementById('btn-stage-next')?.addEventListener('click', flipNextPage);

  setupPanListeners();
  setupTeachingToolsListeners();

  setupToolbarListeners({
    onBackToLibrary: callbacks.onBackToLibrary,
    onFlipPrev: flipPrevPage,
    onFlipNext: flipNextPage,
    onJumpPage: jumpToPage,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetZoom: resetReaderZoom,
    onSetZoomLevel: setZoom,
    onTogglePan: () => togglePanTool(),
    onToggleAudioDock: () => {
      appState.set('isMediaDockOpen', !appState.get('isMediaDockOpen'));
    },
    onOpenThumbnails: callbacks.onOpenThumbnails,
    onStartTimer: (mins) => openAndStartTimer(mins),
    onToggleTimer: toggleTimerWidget,
    onToggleNotes: toggleNotesWidget,
    onToggleScoreboard: toggleScoreboardWidget,
    onToggleCurtain: toggleCurtainOverlay,
    onTriggerConfetti: triggerRewardConfetti,
    onToggleFullscreen: toggleFullscreenTeachingMode,
    onCopyShareLink: () => {
      navigator.clipboard?.writeText(window.location.href);
      showToast('🔗 Đã sao chép liên kết bài học!');
    }
  });

  setupAnnotationListeners();

  appState.subscribe('currentPage', () => updateReaderMeta());
  appState.subscribe('totalPages', () => updateReaderMeta());
  appState.subscribe('currentBook', () => updateReaderMeta());

  let resizeTimer: any = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeAnnotationCanvas();
      const curBook = appState.get('currentBook');
      const curPage = appState.get('currentPage');
      const readerContainer = document.getElementById('view-reader-container');
      if (curBook && readerContainer && !readerContainer.classList.contains('hidden')) {
        initPageFlip(curBook, Math.max(0, curPage - 1));
      }
    }, 250);
  });
}
