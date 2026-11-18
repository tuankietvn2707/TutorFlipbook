import { showToast } from '../../utils/toast';

let isCurtainVisible = false;
let curtainPercent = 55;

export function toggleCurtainOverlay(): boolean {
  const overlay = document.getElementById('teaching-curtain-overlay');
  if (!overlay) return false;
  isCurtainVisible = !isCurtainVisible;
  overlay.classList.toggle('hidden', !isCurtainVisible);
  if (isCurtainVisible) {
    overlay.style.height = `${curtainPercent}%`;
    showToast('🪟 Đã bật Màn che đáp án — kéo thanh dưới để mở dần nội dung');
  } else {
    showToast('Đã tắt Màn che đáp án');
  }
  return isCurtainVisible;
}

export function renderCurtainOverlayHtml(): string {
  return `
  <div id="teaching-curtain-overlay" class="hidden" style="height: 55%;">
    <div class="w-full h-full flex flex-col items-center justify-center text-white/80 pointer-events-none px-4 text-center">
      <p class="text-xs font-semibold tracking-wide text-sky-300">MÀN CHE ĐÁP ÁN</p>
      <p class="text-[11px] text-white/55 mt-1">Kéo thanh bên dưới để hé lộ từng dòng bài học</p>
    </div>
    <div id="teaching-curtain-handle" class="absolute bottom-0 left-0 right-0 h-6 bg-slate-800/95 hover:bg-sky-700/90 border-t border-white/15 flex items-center justify-center cursor-ns-resize transition-colors">
      <div class="w-12 h-1 rounded-full bg-sky-400"></div>
    </div>
  </div>
  `;
}

export function setupCurtainListeners(): void {
  const overlay = document.getElementById('teaching-curtain-overlay');
  const handle = document.getElementById('teaching-curtain-handle');
  const stage = document.getElementById('reader-stage');
  if (!overlay || !handle || !stage) return;

  let dragging = false;

  handle.addEventListener('pointerdown', (e: PointerEvent) => {
    dragging = true;
    try { handle.setPointerCapture(e.pointerId); } catch {}
  });

  handle.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragging) return;
    const rect = stage.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    curtainPercent = Math.max(12, Math.min(92, (relY / rect.height) * 100));
    overlay.style.height = `${curtainPercent}%`;
  });

  const stopDrag = (e: PointerEvent) => {
    dragging = false;
    try { if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId); } catch {}
  };
  handle.addEventListener('pointerup', stopDrag);
  handle.addEventListener('pointercancel', stopDrag);
}
