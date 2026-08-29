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
  const tools = ['highlighter', 'pen-red', 'pen-blue', 'eraser'];
  tools.forEach(t => {
    const btn = document.getElementById(`btn-tool-${t}`);
    if (btn) {
      if (currentDrawingTool === t) {
        btn.classList.add('bg-amber-100', 'border-amber-400', 'text-amber-900', 'ring-2', 'ring-amber-400');
      } else {
        btn.classList.remove('bg-amber-100', 'border-amber-400', 'text-amber-900', 'ring-2', 'ring-amber-400');
      }
    }
  });

  const btnLaser = document.getElementById('btn-laser');
  if (btnLaser) {
    if (isLaserActive) {
      btnLaser.classList.add('bg-red-100', 'text-red-600', 'ring-2', 'ring-red-500');
    } else {
      btnLaser.classList.remove('bg-red-100', 'text-red-600', 'ring-2', 'ring-red-500');
    }
  }

  const btnSpotlight = document.getElementById('btn-spotlight');
  if (btnSpotlight) {
    if (isSpotlightActive) {
      btnSpotlight.classList.add('bg-amber-100', 'text-amber-700', 'ring-2', 'ring-amber-500');
    } else {
      btnSpotlight.classList.remove('bg-amber-100', 'text-amber-700', 'ring-2', 'ring-amber-500');
    }
  }
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

      if (currentDrawingTool === 'highlighter') {
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
