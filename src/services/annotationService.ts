import { AnnotationDrawingTool } from '../types';

let currentDrawingTool: AnnotationDrawingTool = 'none';
let isLaserActive = false;
let isSpotlightActive = false;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let listenersInitialized = false;

export function setDrawingTool(tool: AnnotationDrawingTool): void {
  currentDrawingTool = tool;
  isLaserActive = false;
  isSpotlightActive = false;
  updateVisualToolStyles();
}

export function toggleLaser(): boolean {
  isLaserActive = !isLaserActive;
  if (isLaserActive) {
    currentDrawingTool = 'none';
    isSpotlightActive = false;
  }
  updateVisualToolStyles();
  return isLaserActive;
}

export function toggleSpotlight(): boolean {
  isSpotlightActive = !isSpotlightActive;
  if (isSpotlightActive) {
    currentDrawingTool = 'none';
    isLaserActive = false;
  }
  updateVisualToolStyles();
  return isSpotlightActive;
}

export function getAnnotationState() {
  return {
    currentDrawingTool,
    isLaserActive,
    isSpotlightActive
  };
}

export function clearAllAnnotations(): void {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }
}

export function resizeAnnotationCanvas(): void {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  const stage = document.getElementById('reader-stage');
  const readerContainer = document.getElementById('view-reader-container');
  if (!canvas || !stage) return;
  // If reader view is hidden, skip expensive canvas resizing
  if (readerContainer && readerContainer.classList.contains('hidden')) return;

  const width = stage.clientWidth || window.innerWidth;
  const height = stage.clientHeight || window.innerHeight;

  if (width <= 0 || height <= 0) return;

  if (canvas.width !== width || canvas.height !== height) {
    // Preserve existing drawings across resizes
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx && tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }
}

export function updateVisualToolStyles(): void {
  const laserDot = document.getElementById('laser-pointer-dot');
  const spotlightMask = document.getElementById('spotlight-overlay');
  const canvas = document.getElementById('annotation-canvas');

  if (laserDot) {
    laserDot.style.display = isLaserActive ? 'block' : 'none';
  }

  if (spotlightMask) {
    spotlightMask.style.display = isSpotlightActive ? 'block' : 'none';
  }

  if (canvas) {
    if (currentDrawingTool !== 'none') {
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = currentDrawingTool === 'eraser' ? 'cell' : 'crosshair';
    } else {
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
    }
  }

  // Update button active state styling
  const pencilBtn = document.getElementById('btn-tool-pencil');
  if (pencilBtn) {
    if (currentDrawingTool === 'pencil') {
      pencilBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#378ADD] text-white shadow-sm ring-2 ring-[#378ADD]/30 transition-all cursor-pointer';
    } else {
      pencilBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer';
    }
  }

  const highlighterBtn = document.getElementById('btn-tool-highlighter');
  if (highlighterBtn) {
    if (currentDrawingTool === 'highlighter') {
      highlighterBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center bg-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-300 transition-all cursor-pointer font-bold';
    } else {
      highlighterBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer';
    }
  }

  const eraserBtn = document.getElementById('btn-tool-eraser');
  if (eraserBtn) {
    if (currentDrawingTool === 'eraser') {
      eraserBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center bg-slate-800 text-white shadow-sm ring-2 ring-slate-400 transition-all cursor-pointer';
    } else {
      eraserBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer';
    }
  }

  const laserBtn = document.getElementById('btn-laser');
  if (laserBtn) {
    if (isLaserActive) {
      laserBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center bg-red-500 text-white shadow-sm ring-2 ring-red-300 transition-all cursor-pointer';
    } else {
      laserBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-red-500 hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer';
    }
  }

  const spotlightBtn = document.getElementById('btn-spotlight');
  if (spotlightBtn) {
    if (isSpotlightActive) {
      spotlightBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 transition-all cursor-pointer';
    } else {
      spotlightBtn.className = 'w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-amber-500 hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer';
    }
  }
}

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

  // 1. Global pointer tracking for Laser & Spotlight (RAF Throttled + GPU Transforms)
  let pointerRafId: number | null = null;
  let lastPointerX = 0;
  let lastPointerY = 0;

  window.addEventListener('pointermove', (e: PointerEvent) => {
    // Early exit if neither laser nor spotlight is active (avoids CPU wakeups on every mousemove)
    if (!isLaserActive && !isSpotlightActive) return;

    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    if (pointerRafId === null) {
      pointerRafId = requestAnimationFrame(() => {
        pointerRafId = null;
        if (isLaserActive && laserDot) {
          laserDot.style.transform = `translate3d(${lastPointerX}px, ${lastPointerY}px, 0) translate(-50%, -50%)`;
        }

        if (isSpotlightActive && spotlightMask) {
          spotlightMask.style.background = `radial-gradient(circle 140px at ${lastPointerX}px ${lastPointerY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.68) 100%)`;
        }
      });
    }
  }, { passive: true });

  // 2. High-performance Hardware-Accelerated Canvas Drawing
  if (canvas) {
    const ctx = canvas.getContext('2d');

    const getCanvasCoords = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (currentDrawingTool === 'none') return;
      isDrawing = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}

      const coords = getCanvasCoords(e);
      lastX = coords.x;
      lastY = coords.y;

      if (ctx) {
        ctx.beginPath();
        if (currentDrawingTool === 'pencil') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = '#378ADD';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.arc(lastX, lastY, 1.75, 0, Math.PI * 2);
          ctx.fillStyle = '#378ADD';
          ctx.fill();
        } else if (currentDrawingTool === 'highlighter') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.lineWidth = 24;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.arc(lastX, lastY, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.fill();
        } else if (currentDrawingTool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = 32;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.arc(lastX, lastY, 16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawing || currentDrawingTool === 'none' || !ctx) return;

      const coords = getCanvasCoords(e);
      const x = coords.x;
      const y = coords.y;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);

      if (currentDrawingTool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#378ADD';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else if (currentDrawingTool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.lineWidth = 24;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else if (currentDrawingTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 32;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      ctx.stroke();
      lastX = x;
      lastY = y;
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDrawing = false;
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
  }

  window.addEventListener('resize', resizeAnnotationCanvas);
}

