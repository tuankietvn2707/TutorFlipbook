import { appState } from '../../state/appState';
import {
  setDrawingTool,
  setInkColor,
  setStrokeSize,
  toggleLaser,
  toggleSpotlight,
  cycleSpotlightRadius,
  clearAllAnnotations,
  undoLastAnnotation,
  getAnnotationState
} from '../../services/annotationService';
import { showToast } from '../../utils/toast';
import { ToolbarCallbacks, updateZoomCheckmarks } from './topToolbarListeners';

export function setupBottomToolbarListeners(callbacks: ToolbarCallbacks): void {
  document.getElementById('btn-tool-none')?.addEventListener('click', () => {
    setDrawingTool('none');
    showToast('🖱️ Đã chuyển về Con trỏ lật trang');
  });

  document.getElementById('btn-tool-pencil')?.addEventListener('click', () => {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'pencil' ? 'none' : 'pencil');
  });

  document.getElementById('btn-tool-highlighter')?.addEventListener('click', () => {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'highlighter' ? 'none' : 'highlighter');
  });

  document.getElementById('btn-tool-line')?.addEventListener('click', () => {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'line' ? 'none' : 'line');
  });

  document.getElementById('btn-tool-rect')?.addEventListener('click', () => {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'rect' ? 'none' : 'rect');
  });

  document.getElementById('btn-tool-eraser')?.addEventListener('click', () => {
    const state = getAnnotationState();
    setDrawingTool(state.currentDrawingTool === 'eraser' ? 'none' : 'eraser');
  });

  document.getElementById('btn-tool-undo')?.addEventListener('click', () => {
    const undone = undoLastAnnotation();
    showToast(undone ? '↩️ Đã hoàn tác nét vẽ' : 'Không còn nét vẽ để hoàn tác');
  });

  document.querySelectorAll('.ink-color-swatch').forEach(el => {
    el.addEventListener('click', () => {
      const color = el.getAttribute('data-color');
      if (color) setInkColor(color);
    });
  });

  document.querySelectorAll('.ink-size-btn').forEach(el => {
    el.addEventListener('click', () => {
      const size = Number(el.getAttribute('data-size'));
      if (size) setStrokeSize(size);
    });
  });

  document.getElementById('btn-bottom-audio')?.addEventListener('click', callbacks.onToggleAudioDock);
  document.getElementById('btn-bottom-grid')?.addEventListener('click', callbacks.onOpenThumbnails);
  document.getElementById('btn-bottom-curtain')?.addEventListener('click', () => callbacks.onToggleCurtain?.());

  document.getElementById('btn-laser')?.addEventListener('click', () => {
    const active = toggleLaser();
    showToast(active ? '🔴 Đã bật con trỏ Laser [L]' : 'Đã tắt con trỏ Laser');
  });

  document.getElementById('btn-spotlight')?.addEventListener('click', () => {
    const active = toggleSpotlight();
    showToast(active ? '💡 Đã bật Đèn rọi Spotlight [S]' : 'Đã tắt Đèn rọi Spotlight');
  });

  document.getElementById('btn-spotlight')?.addEventListener('dblclick', () => {
    const r = cycleSpotlightRadius();
    showToast(`💡 Kích thước Spotlight: ${r}px`);
  });

  document.getElementById('btn-bottom-pan')?.addEventListener('click', () => {
    const active = callbacks.onTogglePan();
    const btn = document.getElementById('btn-bottom-pan');
    if (btn) {
      btn.classList.toggle('bg-amber-500/15', active);
      btn.classList.toggle('text-amber-600', active);
      btn.classList.toggle('ring-1', active);
      btn.classList.toggle('ring-amber-400', active);
      btn.classList.toggle('text-slate-600', !active);
    }
    showToast(active ? '✋ Đã bật Bàn tay kéo trang [H]' : 'Đã tắt Bàn tay kéo trang');
  });

  document.getElementById('btn-tool-clear')?.addEventListener('click', () => {
    clearAllAnnotations();
    showToast('🗑️ Đã xóa sạch nét vẽ trên trang [C]');
  });

  document.getElementById('btn-bottom-confetti')?.addEventListener('click', callbacks.onTriggerConfetti);

  appState.subscribe('currentPage', (page) => {
    const input = document.getElementById('input-page-number') as HTMLInputElement;
    if (input) input.value = String(page);
    const topNum = document.getElementById('top-page-num');
    if (topNum) topNum.innerText = String(page);
  });

  appState.subscribe('totalPages', (total) => {
    const label = document.getElementById('total-pages-label');
    if (label) label.innerText = String(total);
    const topTotal = document.getElementById('top-total-pages');
    if (topTotal) topTotal.innerText = String(total);
  });

  appState.subscribe('zoomLevel', (zoom) => {
    const label = document.getElementById('top-zoom-label');
    if (label) label.innerText = `${Math.round(zoom * 100)}%`;
    updateZoomCheckmarks(String(zoom));
  });
}
