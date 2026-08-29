import { appState } from '../state/appState';
import {
  setDrawingTool,
  toggleLaser,
  toggleSpotlight,
  clearAllAnnotations
} from '../services/annotationService';
import { showToast } from '../utils/toast';

let isMinimized = false;

export function renderTeachingToolbarHtml(): string {
  return `
  <!-- TOP TEACHING STUDIO DOCK (BALANCED 3-PILL FLOATING TRANSLUCENT HUD) -->
  <header id="fullscreen-top-hud" class="hidden absolute top-2.5 left-3 right-3 z-40 flex items-center justify-between pointer-events-none transition-all duration-300 gap-2">
    
    <!-- 1. LEFT CAPSULE: Book Title & Quick Navigation -->
    <div id="fullscreen-left-hud" class="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/20 text-white shadow-2xl transition-all shrink-0">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm animate-pulse shrink-0" title="Đang mở bài học"></span>
      <span id="fullscreen-hud-title" class="text-xs font-black truncate max-w-[110px] sm:max-w-[170px] md:max-w-xs text-slate-100">Tên Sách</span>
      <span class="text-white/25">|</span>
      
      <!-- Page Navigation In Top Corner -->
      <div class="flex items-center gap-1 text-xs">
        <button id="toolbar-btn-prev" class="p-1 hover:bg-white/15 rounded-lg text-slate-300 hover:text-white transition active:scale-95 cursor-pointer" title="Trang trước (Mũi tên Trái)">
          <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
        </button>

        <div class="flex items-center gap-1">
          <input 
            type="number" 
            id="fullscreen-page-input" 
            value="1" 
            min="1" 
            max="1" 
            class="w-9 text-center bg-white/15 border border-white/20 rounded-lg text-xs font-black text-amber-300 focus:outline-none focus:border-amber-400 py-0.5"
            title="Nhập số trang để nhảy tới"
          />
          <span class="text-[11px] font-extrabold text-slate-400">/ <span id="fullscreen-total-pages">1</span></span>
        </div>

        <button id="toolbar-btn-next" class="p-1 hover:bg-white/15 rounded-lg text-slate-300 hover:text-white transition active:scale-95 cursor-pointer" title="Trang sau (Mũi tên Phải)">
          <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      <!-- Quick Share Link Button -->
      <button id="toolbar-btn-share" class="p-1 sm:px-2 sm:py-0.5 hover:bg-white/15 rounded-xl text-slate-300 hover:text-sky-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer" title="Sao chép link sách và trang này">
        <i data-lucide="link" class="w-3.5 h-3.5 text-sky-400"></i>
        <span class="hidden lg:inline text-[11px]">Link</span>
      </button>
    </div>

    <!-- 2. CENTER CAPSULE: Zoom & Teaching / Annotation Tools -->
    <div id="fullscreen-center-hud" class="flex items-center gap-1 sm:gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-xl px-2 py-1.5 rounded-2xl border border-white/20 shadow-2xl text-slate-200 overflow-x-auto no-scrollbar transition-all shrink-0">
      
      <!-- Zoom & Pan Controls -->
      <div class="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
        <button id="toolbar-btn-zoom-out" class="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition cursor-pointer" title="Thu nhỏ (-)">
          <i data-lucide="minus" class="w-3.5 h-3.5"></i>
        </button>

        <div class="relative group">
          <button id="toolbar-zoom-label" class="px-1.5 sm:px-2 py-0.5 font-black text-[11px] sm:text-xs text-sky-300 hover:underline min-w-[38px] sm:min-w-[44px] text-center cursor-pointer" title="Đặt lại zoom 100%">
            100%
          </button>
          <!-- Zoom Dropdown -->
          <div class="hidden group-hover:flex absolute top-full left-1/2 -translate-x-1/2 mt-1.5 flex-col bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-2xl text-xs font-bold z-50 min-w-[80px]">
            <button data-zoom="1.0" class="btn-zoom-preset px-2 py-1 hover:bg-white/15 rounded text-left text-slate-200 hover:text-sky-300 cursor-pointer">100%</button>
            <button data-zoom="1.5" class="btn-zoom-preset px-2 py-1 hover:bg-white/15 rounded text-left text-slate-200 hover:text-sky-300 cursor-pointer">150%</button>
            <button data-zoom="2.0" class="btn-zoom-preset px-2 py-1 hover:bg-white/15 rounded text-left text-slate-200 hover:text-sky-300 cursor-pointer">200%</button>
            <button data-zoom="3.0" class="btn-zoom-preset px-2 py-1 hover:bg-white/15 rounded text-left text-slate-200 hover:text-sky-300 cursor-pointer">300%</button>
          </div>
        </div>

        <button id="toolbar-btn-zoom-in" class="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition cursor-pointer" title="Phóng to (+)">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        </button>

        <!-- Hand/Pan Tool Toggle -->
        <button id="toolbar-btn-pan" class="p-1 sm:px-2 sm:py-1 rounded-lg text-slate-300 hover:bg-white/20 flex items-center gap-1 transition cursor-pointer" title="Công cụ kéo di chuyển trang (H)">
          <i data-lucide="hand" class="w-3.5 h-3.5 text-amber-400"></i>
          <span class="hidden md:inline text-[11px] font-bold">Kéo</span>
        </button>
      </div>

      <div class="h-4 w-px bg-white/20 mx-0.5"></div>

      <!-- Annotation Tools Group -->
      <div class="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
        <button id="btn-laser" class="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:bg-white/20 hover:text-red-400 transition cursor-pointer" title="Con trỏ Laser đỏ (L)">
          <i data-lucide="disc" class="w-3.5 h-3.5 text-red-400"></i>
        </button>

        <button id="btn-spotlight" class="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:bg-white/20 hover:text-amber-300 transition cursor-pointer" title="Đèn rọi Spotlight (S)">
          <i data-lucide="sun-medium" class="w-3.5 h-3.5 text-amber-300"></i>
        </button>

        <button id="btn-tool-highlighter" class="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:bg-white/20 hover:text-amber-300 transition cursor-pointer" title="Bút dạ quang vàng (P)">
          <i data-lucide="highlighter" class="w-3.5 h-3.5 text-amber-300"></i>
        </button>

        <button id="btn-tool-pen-red" class="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:bg-white/20 hover:text-red-400 transition cursor-pointer" title="Bút vẽ đỏ (D)">
          <i data-lucide="pencil" class="w-3.5 h-3.5 text-red-400"></i>
        </button>

        <button id="btn-tool-pen-blue" class="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:bg-white/20 hover:text-sky-400 transition cursor-pointer" title="Bút vẽ xanh">
          <i data-lucide="pencil" class="w-3.5 h-3.5 text-sky-400"></i>
        </button>

        <button id="btn-tool-eraser" class="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:bg-white/20 hover:text-white transition cursor-pointer" title="Tẩy nét vẽ (E)">
          <i data-lucide="eraser" class="w-3.5 h-3.5"></i>
        </button>

        <button id="btn-tool-clear" class="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:bg-white/20 hover:text-red-400 transition cursor-pointer" title="Xóa toàn bộ nét vẽ">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>

    </div>

    <!-- 3. RIGHT CAPSULE: Audio, Utilities & Fullscreen Exit -->
    <div id="fullscreen-right-hud" class="flex items-center gap-1 sm:gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-xl px-2.5 py-1.5 rounded-2xl border border-white/20 shadow-2xl text-slate-200 shrink-0">
      
      <!-- Audio Box Trigger -->
      <button id="toolbar-btn-audio" class="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/40 flex items-center gap-1.5 transition shadow-md active:scale-95 cursor-pointer" title="Bật/Tắt Hộp điều khiển bài nghe Audio">
        <i data-lucide="headphones" class="w-3.5 h-3.5 text-purple-200"></i>
        <span class="font-extrabold text-[11px] sm:text-xs">Audio</span>
        <span id="toolbar-audio-badge" class="hidden text-[10px] bg-purple-800 text-purple-200 px-1.5 py-0.2 rounded-full font-black">0</span>
      </button>

      <!-- Thumbnails Grid -->
      <button id="toolbar-btn-thumbnails" class="p-1.5 rounded-xl hover:bg-white/15 text-sky-400 hover:text-sky-300 transition active:scale-95 cursor-pointer" title="Mục lục xem tất cả trang">
        <i data-lucide="layout-grid" class="w-4 h-4"></i>
      </button>

      <!-- 5-Min Timer -->
      <button id="toolbar-btn-timer" class="p-1.5 rounded-xl hover:bg-white/15 text-amber-300 hover:text-amber-200 transition active:scale-95 cursor-pointer" title="Đếm ngược 5 phút làm bài">
        <i data-lucide="clock" class="w-4 h-4"></i>
      </button>

      <!-- Confetti Reward -->
      <button id="toolbar-btn-confetti" class="p-1.5 rounded-xl hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition active:scale-95 cursor-pointer" title="Bắn pháo hoa khen ngợi học sinh 🎉">
        <i data-lucide="party-popper" class="w-4 h-4"></i>
      </button>

      <!-- Exit Fullscreen Button -->
      <button id="toolbar-btn-exit" class="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-400/30 flex items-center gap-1 transition shadow-sm ml-0.5 active:scale-95 cursor-pointer" title="Thu nhỏ / Thoát toàn màn hình (Esc)">
        <i data-lucide="minimize-2" class="w-3.5 h-3.5"></i>
        <span class="hidden md:inline text-[11px]">Thoát</span>
      </button>
    </div>

  </header>
  `;
}

export function setupTeachingToolbarListeners(callbacks: {
  onFlipPrev: () => void;
  onFlipNext: () => void;
  onJumpPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSetZoomLevel: (lvl: number) => void;
  onTogglePan: () => void;
  onToggleAudioDock: () => void;
  onOpenThumbnails: () => void;
  onStartTimer: (minutes: number) => void;
  onTriggerConfetti: () => void;
  onExitFullscreen: () => void;
  onCopyShareLink: () => void;
}): void {
  // Page Navigation
  document.getElementById('toolbar-btn-prev')?.addEventListener('click', callbacks.onFlipPrev);
  document.getElementById('toolbar-btn-next')?.addEventListener('click', callbacks.onFlipNext);
  document.getElementById('fullscreen-page-input')?.addEventListener('change', (e: any) => {
    callbacks.onJumpPage(parseInt(e.target.value, 10));
  });
  document.getElementById('toolbar-btn-share')?.addEventListener('click', callbacks.onCopyShareLink);

  // Zoom Controls
  document.getElementById('toolbar-btn-zoom-out')?.addEventListener('click', callbacks.onZoomOut);
  document.getElementById('toolbar-btn-zoom-in')?.addEventListener('click', callbacks.onZoomIn);
  document.getElementById('toolbar-zoom-label')?.addEventListener('click', callbacks.onResetZoom);
  document.querySelectorAll('.btn-zoom-preset').forEach(btn => {
    btn.addEventListener('click', (e: any) => {
      const lvl = parseFloat(e.target.getAttribute('data-zoom') || '1.0');
      callbacks.onSetZoomLevel(lvl);
    });
  });
  document.getElementById('toolbar-btn-pan')?.addEventListener('click', callbacks.onTogglePan);

  // Teaching Annotation Tools
  document.getElementById('btn-laser')?.addEventListener('click', () => {
    const active = toggleLaser();
    showToast(active ? '🔴 Đã bật con trỏ Laser đỏ' : 'Đã tắt con trỏ Laser');
  });

  document.getElementById('btn-spotlight')?.addEventListener('click', () => {
    const active = toggleSpotlight();
    showToast(active ? '💡 Đã bật Đèn rọi Spotlight' : 'Đã tắt Đèn rọi');
  });

  document.getElementById('btn-tool-highlighter')?.addEventListener('click', () => {
    setDrawingTool('highlighter');
    showToast('🖍️ Đã chọn Bút dạ quang vàng');
  });

  document.getElementById('btn-tool-pen-red')?.addEventListener('click', () => {
    setDrawingTool('pen-red');
    showToast('✏️ Đã chọn Bút vẽ đỏ');
  });

  document.getElementById('btn-tool-pen-blue')?.addEventListener('click', () => {
    setDrawingTool('pen-blue');
    showToast('✏️ Đã chọn Bút vẽ xanh');
  });

  document.getElementById('btn-tool-eraser')?.addEventListener('click', () => {
    setDrawingTool('eraser');
    showToast('🧹 Đã chọn Cục tẩy');
  });

  document.getElementById('btn-tool-clear')?.addEventListener('click', () => {
    clearAllAnnotations();
    showToast('🗑️ Đã xóa toàn bộ nét vẽ');
  });

  // Utilities
  document.getElementById('toolbar-btn-audio')?.addEventListener('click', callbacks.onToggleAudioDock);
  document.getElementById('toolbar-btn-thumbnails')?.addEventListener('click', callbacks.onOpenThumbnails);
  document.getElementById('toolbar-btn-timer')?.addEventListener('click', () => callbacks.onStartTimer(5));
  document.getElementById('toolbar-btn-confetti')?.addEventListener('click', callbacks.onTriggerConfetti);
  document.getElementById('toolbar-btn-exit')?.addEventListener('click', callbacks.onExitFullscreen);

  // Sync with AppState
  appState.subscribe('currentPage', (page) => {
    const input = document.getElementById('fullscreen-page-input') as HTMLInputElement;
    if (input) input.value = String(page);
  });

  appState.subscribe('totalPages', (total) => {
    const totalEl = document.getElementById('fullscreen-total-pages');
    if (totalEl) totalEl.innerText = String(total);
    const input = document.getElementById('fullscreen-page-input') as HTMLInputElement;
    if (input) input.max = String(total);
  });

  appState.subscribe('zoomLevel', (zoom) => {
    const label = document.getElementById('toolbar-zoom-label');
    if (label) label.innerText = `${Math.round(zoom * 100)}%`;
  });

  appState.subscribe('currentBook', (book) => {
    const titleEl = document.getElementById('fullscreen-hud-title');
    if (titleEl) titleEl.innerText = book ? book.title : 'Tên Sách';
  });
}
