import { AnnotationDrawingTool } from '../../types';
import { getAnnotationState } from './annotationState';

let isDrawing = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let activePageKey = '';
let shapeSnapshot: ImageData | null = null;
const pageSnapshots = new Map<string, string>();
const undoHistory = new Map<string, string[]>();

function pushUndoSnapshot(canvas: HTMLCanvasElement): void {
  if (!activePageKey || canvas.width <= 0 || canvas.height <= 0) return;
  const stack = undoHistory.get(activePageKey) || [];
  stack.push(canvas.toDataURL('image/png'));
  if (stack.length > 15) stack.shift();
  undoHistory.set(activePageKey, stack);
}

export function clearAllAnnotations(): void {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  pushUndoSnapshot(canvas);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  if (activePageKey) pageSnapshots.delete(activePageKey);
}

export function undoLastAnnotation(): boolean {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  if (!canvas || !activePageKey) return false;
  const stack = undoHistory.get(activePageKey);
  if (!stack || stack.length === 0) return false;

  const prevDataUrl = stack.pop()!;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    pageSnapshots.set(activePageKey, canvas.toDataURL('image/png'));
  };
  img.src = prevDataUrl;
  return true;
}

export function switchAnnotationPage(bookId: string, pageIndex: number): void {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  const nextKey = `${bookId}:${pageIndex}`;
  if (activePageKey === nextKey) return;

  if (canvas && activePageKey && canvas.width > 0 && canvas.height > 0) {
    pageSnapshots.set(activePageKey, canvas.toDataURL('image/png'));
  }

  activePageKey = nextKey;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const saved = pageSnapshots.get(nextKey);
  if (saved) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = saved;
  }
}

export function resizeAnnotationCanvas(): void {
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  const stage = document.getElementById('reader-stage');
  const readerContainer = document.getElementById('view-reader-container');
  if (!canvas || !stage) return;
  if (readerContainer && readerContainer.classList.contains('hidden')) return;

  const width = stage.clientWidth || window.innerWidth;
  const height = stage.clientHeight || window.innerHeight;
  if (width <= 0 || height <= 0) return;

  if (canvas.width !== width || canvas.height !== height) {
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tempCtx = temp.getContext('2d');
    if (tempCtx && canvas.width > 0 && canvas.height > 0) tempCtx.drawImage(canvas, 0, 0);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx && temp.width > 0 && temp.height > 0) ctx.drawImage(temp, 0, 0, width, height);
  }
}

function configureStrokeStyle(ctx: CanvasRenderingContext2D, tool: AnnotationDrawingTool): void {
  const { inkColor, strokeSize } = getAnnotationState();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (tool === 'highlighter') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.42)';
    ctx.fillStyle = 'rgba(250, 204, 21, 0.42)';
    ctx.lineWidth = strokeSize * 6;
  } else if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 28;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = inkColor;
    ctx.fillStyle = inkColor;
    ctx.lineWidth = strokeSize;
  }
}

export function setupCanvasDrawing(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  const coords = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.addEventListener('pointerdown', (e: PointerEvent) => {
    const { currentDrawingTool, strokeSize } = getAnnotationState();
    if (currentDrawingTool === 'none' || !ctx) return;
    pushUndoSnapshot(canvas);
    isDrawing = true;
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    const pt = coords(e);
    startX = pt.x; startY = pt.y; lastX = pt.x; lastY = pt.y;

    if (currentDrawingTool === 'line' || currentDrawingTool === 'rect') {
      shapeSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
      ctx.beginPath();
      configureStrokeStyle(ctx, currentDrawingTool);
      const r = currentDrawingTool === 'highlighter' ? strokeSize * 3 : currentDrawingTool === 'eraser' ? 14 : strokeSize / 2;
      ctx.arc(lastX, lastY, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  canvas.addEventListener('pointermove', (e: PointerEvent) => {
    const { currentDrawingTool } = getAnnotationState();
    if (!isDrawing || currentDrawingTool === 'none' || !ctx) return;
    const pt = coords(e);

    if ((currentDrawingTool === 'line' || currentDrawingTool === 'rect') && shapeSnapshot) {
      ctx.putImageData(shapeSnapshot, 0, 0);
      ctx.beginPath();
      configureStrokeStyle(ctx, currentDrawingTool);
      if (currentDrawingTool === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(pt.x, pt.y);
      } else {
        ctx.rect(startX, startY, pt.x - startX, pt.y - startY);
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pt.x, pt.y);
      configureStrokeStyle(ctx, currentDrawingTool);
      ctx.stroke();
      lastX = pt.x; lastY = pt.y;
    }
  });

  const endStroke = (e: PointerEvent) => {
    if (!isDrawing) return;
    isDrawing = false;
    shapeSnapshot = null;
    if (activePageKey && canvas.width > 0 && canvas.height > 0) {
      pageSnapshots.set(activePageKey, canvas.toDataURL('image/png'));
    }
    try { if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); } catch {}
  };
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
}
