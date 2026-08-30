import { AnnotationDrawingTool } from '../types';

let currentDrawingTool: AnnotationDrawingTool = 'none';
let isLaserActive = false;
let isSpotlightActive = false;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

export function resizeAnnotationCanvas(): void {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  const container = document.getElementById('reader-flipbook-container');
  if (!canvas || !container) return;

  const rect = container.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      // Save content if needed or resize
      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tempCtx = temp.getContext('2d');
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      if (ctx && temp.width > 0 && temp.height > 0) {
        ctx.drawImage(temp, 0, 0);
      }
    }
  }
}

function updateVisualToolStyles(): void {
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
    if (currentDrawingTool !== 'none' || isLaserActive || isSpotlightActive) {
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = isLaserActive
        ? 'none'
        : isSpotlightActive
        ? 'crosshair'
        : currentDrawingTool === 'eraser'
        ? 'cell'
        : 'crosshair';
    } else {
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
    }
  }

  // Update button active state badges
  const tools = ['pencil', 'highlighter', 'pen-red', 'pen-blue', 'eraser'];
  tools.forEach(t => {
    const btns = document.querySelectorAll(`[id="btn-tool-${t}"]`);
    btns.forEach(btn => {
      if (currentDrawingTool === t) {
        btn.classList.add('bg-[#378ADD]/15', 'text-[#378ADD]', 'ring-1', 'ring-[#378ADD]/40', 'scale-[0.98]');
        btn.classList.remove('text-[#666666]', 'text-slate-600', 'text-slate-300');
      } else {
        btn.classList.remove('bg-[#378ADD]/15', 'text-[#378ADD]', 'ring-1', 'ring-[#378ADD]/40', 'scale-[0.98]');
        btn.classList.add('text-[#666666]');
      }
    });
  });

  const laserBtns = document.querySelectorAll('[id="btn-laser"]');
  laserBtns.forEach(btnLaser => {
    if (isLaserActive) {
      btnLaser.classList.add('bg-red-500/15', 'text-red-500', 'ring-1', 'ring-red-400', 'scale-[0.98]');
      btnLaser.classList.remove('text-[#666666]');
    } else {
      btnLaser.classList.remove('bg-red-500/15', 'text-red-500', 'ring-1', 'ring-red-400', 'scale-[0.98]');
      btnLaser.classList.add('text-[#666666]');
    }
  });

  const spotlightBtns = document.querySelectorAll('[id="btn-spotlight"]');
  spotlightBtns.forEach(btnSpotlight => {
    if (isSpotlightActive) {
      btnSpotlight.classList.add('bg-amber-500/15', 'text-amber-500', 'ring-1', 'ring-amber-400', 'scale-[0.98]');
      btnSpotlight.classList.remove('text-[#666666]');
    } else {
      btnSpotlight.classList.remove('bg-amber-500/15', 'text-amber-500', 'ring-1', 'ring-amber-400', 'scale-[0.98]');
      btnSpotlight.classList.add('text-[#666666]');
    }
  });
}

export function setupAnnotationListeners(): void {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  const container = document.getElementById('reader-flipbook-container');
  const laserDot = document.getElementById('laser-pointer-dot');
  const spotlightMask = document.getElementById('spotlight-overlay');

  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (isLaserActive && laserDot) {
      laserDot.style.left = `${clientX}px`;
      laserDot.style.top = `${clientY}px`;
    }

    if (isSpotlightActive && spotlightMask) {
      spotlightMask.style.background = `radial-gradient(circle 120px at ${clientX}px ${clientY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)`;
    }

    if (isDrawing && currentDrawingTool !== 'none') {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);

      if (currentDrawingTool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#378ADD';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else if (currentDrawingTool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.45)';
        ctx.lineWidth = 22;
        ctx.lineCap = 'square';
      } else if (currentDrawingTool === 'pen-red') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
      } else if (currentDrawingTool === 'pen-blue') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
      } else if (currentDrawingTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 28;
        ctx.lineCap = 'round';
      }

      ctx.stroke();
      lastX = x;
      lastY = y;
    }
  };

  const handlePointerStart = (e: MouseEvent | TouchEvent) => {
    if (currentDrawingTool === 'none') return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    isDrawing = true;
    lastX = clientX - rect.left;
    lastY = clientY - rect.top;
  };

  const handlePointerEnd = () => {
    isDrawing = false;
  };

  canvas.addEventListener('mousedown', handlePointerStart);
  canvas.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerEnd);

  canvas.addEventListener('touchstart', handlePointerStart, { passive: true });
  canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
  window.addEventListener('touchend', handlePointerEnd);

  // Window resize tracking
  window.addEventListener('resize', resizeAnnotationCanvas);
}
