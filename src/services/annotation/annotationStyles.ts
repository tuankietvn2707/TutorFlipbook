import { getAnnotationState } from './annotationState';

const INACTIVE_BTN =
  'w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer';

function setActiveBtn(id: string, isActive: boolean, activeClass: string, inactiveClass = INACTIVE_BTN): void {
  const btn = document.getElementById(id);
  if (btn) btn.className = isActive ? activeClass : inactiveClass;
}

export function updateVisualToolStyles(): void {
  const { currentDrawingTool, inkColor, strokeSize, isLaserActive, isSpotlightActive } = getAnnotationState();
  const laserDot = document.getElementById('laser-pointer-dot');
  const spotlightMask = document.getElementById('spotlight-overlay');
  const canvas = document.getElementById('annotation-canvas');
  const stylePopover = document.getElementById('drawing-style-popover');

  if (laserDot) laserDot.style.display = isLaserActive ? 'block' : 'none';
  if (spotlightMask) spotlightMask.style.display = isSpotlightActive ? 'block' : 'none';

  if (canvas) {
    if (currentDrawingTool !== 'none') {
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = currentDrawingTool === 'eraser' ? 'cell' : 'crosshair';
    } else {
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
    }
  }

  const showPalette = currentDrawingTool !== 'none' && currentDrawingTool !== 'eraser';
  if (stylePopover) {
    stylePopover.classList.toggle('hidden', !showPalette);
  }

  setActiveBtn('btn-tool-none', currentDrawingTool === 'none' && !isLaserActive && !isSpotlightActive,
    'w-9 h-9 rounded-lg flex items-center justify-center bg-slate-900 text-white shadow-sm transition-all cursor-pointer');
  setActiveBtn('btn-tool-pencil', currentDrawingTool === 'pencil',
    'w-9 h-9 rounded-lg flex items-center justify-center bg-sky-600 text-white shadow-sm ring-2 ring-sky-200 transition-all cursor-pointer');
  setActiveBtn('btn-tool-highlighter', currentDrawingTool === 'highlighter',
    'w-9 h-9 rounded-lg flex items-center justify-center bg-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-200 transition-all cursor-pointer');
  setActiveBtn('btn-tool-line', currentDrawingTool === 'line',
    'w-9 h-9 rounded-lg flex items-center justify-center bg-sky-600 text-white shadow-sm ring-2 ring-sky-200 transition-all cursor-pointer');
  setActiveBtn('btn-tool-rect', currentDrawingTool === 'rect',
    'w-9 h-9 rounded-lg flex items-center justify-center bg-sky-600 text-white shadow-sm ring-2 ring-sky-200 transition-all cursor-pointer');
  setActiveBtn('btn-tool-eraser', currentDrawingTool === 'eraser',
    'w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 text-white shadow-sm ring-2 ring-slate-300 transition-all cursor-pointer');

  setActiveBtn('btn-laser', isLaserActive,
    'w-9 h-9 rounded-lg flex items-center justify-center bg-red-500 text-white shadow-sm ring-2 ring-red-200 transition-all cursor-pointer',
    'w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-slate-100 transition-all cursor-pointer');

  setActiveBtn('btn-spotlight', isSpotlightActive,
    'w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500 text-white shadow-sm ring-2 ring-amber-200 transition-all cursor-pointer',
    'w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-amber-500 hover:bg-slate-100 transition-all cursor-pointer');

  document.querySelectorAll('.ink-color-swatch').forEach(el => {
    const c = el.getAttribute('data-color');
    el.classList.toggle('ring-2', c === inkColor);
    el.classList.toggle('ring-slate-900', c === inkColor);
    el.classList.toggle('scale-110', c === inkColor);
  });

  document.querySelectorAll('.ink-size-btn').forEach(el => {
    const s = Number(el.getAttribute('data-size'));
    el.classList.toggle('bg-slate-900', s === strokeSize);
    el.classList.toggle('text-white', s === strokeSize);
    el.classList.toggle('text-slate-600', s !== strokeSize);
  });
}
