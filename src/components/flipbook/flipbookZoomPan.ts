import { appState } from '../../state/appState';
import {
  getZoomLevel,
  setZoomLevelState,
  getPanOffset,
  setPanOffset,
  getIsPanToolActive,
  setIsPanToolActive
} from './flipbookState';

export function applyTransform(): void {
  const container = document.getElementById('reader-flipbook-container');
  const panOffset = getPanOffset();
  const zoomLevel = getZoomLevel();
  if (container) {
    container.style.transform = `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`;
  }
}

export function setZoom(lvl: number): void {
  const clamped = Math.max(1.0, Math.min(4.0, lvl));
  setZoomLevelState(clamped);
  if (clamped === 1.0) {
    setPanOffset(0, 0);
  }
  applyTransform();
  appState.set('zoomLevel', clamped);

  const badge = document.getElementById('zoom-badge-indicator');
  const badgeText = document.getElementById('zoom-badge-text');
  const bottomLabel = document.getElementById('bottom-zoom-label');

  if (bottomLabel) {
    bottomLabel.innerText = `${Math.round(clamped * 100)}%`;
  }

  if (badge && badgeText) {
    if (clamped > 1.0) {
      badgeText.innerText = `🔍 Zoom: ${Math.round(clamped * 100)}%`;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

export function zoomIn(): void {
  setZoom(getZoomLevel() + 0.25);
}

export function zoomOut(): void {
  setZoom(getZoomLevel() - 0.25);
}

export function resetReaderZoom(): void {
  setZoom(1.0);
  setPanOffset(0, 0);
  applyTransform();
}

export function togglePanTool(): boolean {
  const nextActive = !getIsPanToolActive();
  setIsPanToolActive(nextActive);
  const stage = document.getElementById('reader-stage');
  const btnTop = document.getElementById('toolbar-btn-pan');
  const btnBottom = document.getElementById('btn-bottom-pan');

  if (stage) {
    stage.style.cursor = nextActive ? 'grab' : 'default';
  }

  if (btnTop) {
    btnTop.classList.toggle('bg-amber-400', nextActive);
    btnTop.classList.toggle('text-slate-900', nextActive);
  }

  if (btnBottom) {
    btnBottom.classList.toggle('bg-amber-100', nextActive);
    btnBottom.classList.toggle('text-amber-900', nextActive);
    btnBottom.classList.toggle('border-amber-400', nextActive);
  }

  return nextActive;
}

export function setupPanListeners(): void {
  const stage = document.getElementById('reader-stage');
  if (!stage) return;

  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panRafId: number | null = null;

  stage.addEventListener('mousedown', (e) => {
    if (getIsPanToolActive() || getZoomLevel() > 1.0) {
      const panOffset = getPanOffset();
      isPanning = true;
      panStartX = e.clientX - panOffset.x;
      panStartY = e.clientY - panOffset.y;
      stage.style.cursor = 'grabbing';
      const container = document.getElementById('reader-flipbook-container');
      if (container) container.style.transition = 'none';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isPanning) {
      setPanOffset(e.clientX - panStartX, e.clientY - panStartY);
      if (panRafId === null) {
        panRafId = requestAnimationFrame(() => {
          panRafId = null;
          applyTransform();
        });
      }
    }
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      stage.style.cursor = getIsPanToolActive() ? 'grab' : 'default';
      const container = document.getElementById('reader-flipbook-container');
      if (container) container.style.transition = '';
    }
  });
}
