import { getAnnotationState } from './annotation/annotationState';
import { updateVisualToolStyles } from './annotation/annotationStyles';
import { resizeAnnotationCanvas, setupCanvasDrawing } from './annotation/annotationCanvas';

export {
  setDrawingTool,
  setInkColor,
  setStrokeSize,
  toggleLaser,
  toggleSpotlight,
  cycleSpotlightRadius,
  getAnnotationState
} from './annotation/annotationState';
export { updateVisualToolStyles } from './annotation/annotationStyles';
export {
  clearAllAnnotations,
  undoLastAnnotation,
  switchAnnotationPage,
  resizeAnnotationCanvas
} from './annotation/annotationCanvas';

let listenersInitialized = false;

export function setupAnnotationListeners(): void {
  if (listenersInitialized) {
    resizeAnnotationCanvas();
    updateVisualToolStyles();
    return;
  }
  listenersInitialized = true;

  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  const laserDot = document.getElementById('laser-pointer-dot');
  const spotlightMask = document.getElementById('spotlight-overlay');

  resizeAnnotationCanvas();

  let pointerRafId: number | null = null;
  let lastPointerX = 0;
  let lastPointerY = 0;

  window.addEventListener('pointermove', (e: PointerEvent) => {
    const { isLaserActive, isSpotlightActive } = getAnnotationState();
    if (!isLaserActive && !isSpotlightActive) return;

    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    if (pointerRafId === null) {
      pointerRafId = requestAnimationFrame(() => {
        pointerRafId = null;
        const state = getAnnotationState();
        if (state.isLaserActive && laserDot) {
          laserDot.style.transform = `translate3d(${lastPointerX}px, ${lastPointerY}px, 0) translate(-50%, -50%)`;
        }
        if (state.isSpotlightActive && spotlightMask) {
          spotlightMask.style.background = `radial-gradient(circle ${state.spotlightRadius}px at ${lastPointerX}px ${lastPointerY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 100%)`;
        }
      });
    }
  }, { passive: true });

  if (canvas) {
    setupCanvasDrawing(canvas);
  }

  window.addEventListener('resize', resizeAnnotationCanvas);
}
