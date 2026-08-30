import { appState } from '../state/appState';
import {
  setDrawingTool,
  toggleLaser,
  toggleSpotlight,
  clearAllAnnotations,
  getAnnotationState
} from '../services/annotationService';
import { showToast } from '../utils/toast';
import { openShortcutsModal } from './ShortcutsModal';
import { toggleSoundEffects, getSoundEffectsEnabled } from '../services/audioService';

/**
 * Top Toolbar (Height: 48px)
 * Aesthetic: Minimalist, glass-morphism inspired, Apple spacious + Duolingo clean
 * Structure: [◀ Page 2 of 178 ▶] ——— [100% Zoom Button] [⋮ More Tools]
 */
export function renderTopToolbarHtml(): string {
  return `
  <!-- TOP TOOLBAR (Height: 48px / h-12) -->
  <header id="flipbook-top-toolbar" class="w-full h-12 bg-white/85 backdrop-blur-md border-b border-black/[0.08] px-4 flex items-center justify-between z-40 select-none shrink-0 transition-all">
    
    <!-- Left Side: Back to Library & Page Navigation -->
    <div class="flex items-center gap-3">
      
      <!-- Back to Library Button -->
      <button 
        id="btn-top-back-lib" 
        type="button"
        class="h-8 px-2.5 rounded-[8px] text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Quay lại thư viện sách"
        aria-label="Quay lại thư viện"
      >
        <i data-lucide="arrow-left" class="w-4 h-4 text-[#666666]"></i>
        <span class="text-[13px] font-medium text-[#2C2C2A] hidden sm:inline">Thư viện</span>
      </button>

      <div class="h-4 w-px bg-black/10 hidden sm:block"></div>

      <!-- Page Navigation Group -->
      <div class="flex items-center gap-3">
        <!-- Previous Page Arrow Button -->
        <button 
          id="btn-top-prev-page" 
          type="button"
          class="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
          title="Trang trước [←] hoặc [K]" 
          aria-label="Trang trước"
        >
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>

        <!-- Page Counter: "Page 2 of 178" -->
        <div class="text-[13px] font-medium text-[#2C2C2A] select-none tracking-tight whitespace-nowrap min-w-[84px] text-center">
          Page <span id="top-page-num" class="font-semibold text-[#2C2C2A]">1</span> of <span id="top-total-pages" class="text-[#666666]">1</span>
        </div>

        <!-- Next Page Arrow Button -->
        <button 
          id="btn-top-next-page" 
          type="button"
          class="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
          title="Trang sau [→] hoặc [J]" 
          aria-label="Trang sau"
        >
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </div>

    </div>

    <!-- Right Side: Zoom Control & More Tools Menu -->
    <div class="flex items-center gap-2">
      
      <!-- Zoom Control Button (60px x 32px, rounded 8px, light gray bg) -->
      <div class="relative" id="zoom-dropdown-container">
        <button 
          id="btn-top-zoom" 
          type="button"
          class="w-[60px] h-[32px] bg-[#F5F5F0] hover:bg-[#EBEBE6] border border-black/[0.08] rounded-[8px] flex items-center justify-center text-[12px] font-medium text-[#2C2C2A] cursor-pointer transition-all active:scale-[0.98] select-none focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none"
          title="Tùy chỉnh độ thu phóng (+/-)"
          aria-label="Tùy chỉnh thu phóng"
        >
          <span id="top-zoom-label">100%</span>
        </button>

        <!-- Zoom Menu Dropdown -->
        <div 
          id="zoom-menu-dropdown" 
          class="hidden absolute top-full right-0 mt-1.5 w-36 bg-white/95 backdrop-blur-md border border-black/[0.08] rounded-xl shadow-xl p-1 z-50 text-[13px] text-[#2C2C2A]"
        >
          <button data-zoom="0.5" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center justify-between cursor-pointer">
            <span>50%</span>
            <i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-[#378ADD] hidden"></i>
          </button>
          <button data-zoom="0.75" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center justify-between cursor-pointer">
            <span>75%</span>
            <i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-[#378ADD] hidden"></i>
          </button>
          <button data-zoom="1.0" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center justify-between cursor-pointer font-medium">
            <span>100%</span>
            <i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-[#378ADD]"></i>
          </button>
          <button data-zoom="1.5" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center justify-between cursor-pointer">
            <span>150%</span>
            <i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-[#378ADD] hidden"></i>
          </button>
          <button data-zoom="2.0" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center justify-between cursor-pointer">
            <span>200%</span>
            <i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-[#378ADD] hidden"></i>
          </button>
          <div class="h-px bg-black/[0.06] my-1"></div>
          <button data-zoom="fit" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center justify-between cursor-pointer text-[#378ADD] font-medium">
            <span>Fit to Screen</span>
          </button>
        </div>
      </div>

      <!-- More Tools Menu Button (Three-dot vertical icon ⋮) -->
      <div class="relative" id="more-tools-dropdown-container">
        <button 
          id="btn-top-more-tools" 
          type="button"
          class="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none"
          title="Tùy chọn công cụ khác"
          aria-label="Tùy chọn công cụ khác"
        >
          <i data-lucide="more-vertical" class="w-4 h-4"></i>
        </button>

        <!-- More Tools Dropdown -->
        <div 
          id="more-tools-dropdown" 
          class="hidden absolute top-full right-0 mt-1.5 w-52 bg-white/95 backdrop-blur-md border border-black/[0.08] rounded-xl shadow-2xl p-1.5 z-50 text-[13px] text-[#2C2C2A] space-y-0.5"
        >
          <button id="menu-item-thumbnails" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center gap-2.5 cursor-pointer text-[#2C2C2A] transition-all">
            <i data-lucide="layout-grid" class="w-4 h-4 text-[#378ADD]"></i>
            <span>Mục lục trang [G]</span>
          </button>

          <button id="menu-item-audio" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center gap-2.5 cursor-pointer text-[#2C2C2A] transition-all">
            <i data-lucide="headphones" class="w-4 h-4 text-[#378ADD]"></i>
            <span>Studio bài nghe [A]</span>
          </button>

          <button id="menu-item-fullscreen" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center gap-2.5 cursor-pointer text-[#2C2C2A] transition-all">
            <i data-lucide="maximize" class="w-4 h-4 text-[#666666]"></i>
            <span>Toàn màn hình [F]</span>
          </button>

          <button id="menu-item-sound" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center justify-between cursor-pointer text-[#2C2C2A] transition-all">
            <div class="flex items-center gap-2.5">
              <i data-lucide="volume-2" class="w-4 h-4 text-[#666666]"></i>
              <span>Âm thanh lật sách</span>
            </div>
            <span id="menu-sound-state" class="text-[11px] font-semibold text-emerald-600">Bật</span>
          </button>

          <div class="h-px bg-black/[0.06] my-1"></div>

          <button id="menu-item-timer" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center gap-2.5 cursor-pointer text-[#2C2C2A] transition-all">
            <i data-lucide="clock" class="w-4 h-4 text-amber-500"></i>
            <span>Đếm giờ làm bài (5p)</span>
          </button>

          <button id="menu-item-confetti" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center gap-2.5 cursor-pointer text-[#2C2C2A] transition-all">
            <i data-lucide="sparkles" class="w-4 h-4 text-purple-500"></i>
            <span>Khen thưởng 🎉</span>
          </button>

          <button id="menu-item-shortcuts" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center gap-2.5 cursor-pointer text-[#2C2C2A] transition-all">
            <i data-lucide="keyboard" class="w-4 h-4 text-emerald-600"></i>
            <span>Bảng phím tắt [?]</span>
          </button>

          <button id="menu-item-share" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F5F0] flex items-center gap-2.5 cursor-pointer text-[#2C2C2A] transition-all">
            <i data-lucide="link" class="w-4 h-4 text-sky-600"></i>
            <span>Sao chép liên kết</span>
          </button>
        </div>
      </div>

    </div>

  </header>
  `;
}

/**
 * Bottom Floating Toolbar (Height: 48px)
 * Position: Fixed at bottom center, above any scroll areas
 * Structure: [✏️] [🖍️] [⚫] | [🔊] [⋱] | [🔴] [💡] [✋] [🗑️] [🎉]
 */
export function renderBottomToolbarHtml(): string {
  return `
  <!-- BOTTOM FLOATING TOOLBAR (Height: 48px / h-12) -->
  <div 
    id="flipbook-bottom-toolbar" 
    class="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-black/[0.08] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] p-1.5 h-12 flex items-center gap-1.5 select-none transition-all"
  >
    
    <!-- Group 1: Drawing Tools (Pencil, Marker/Highlighter, Eraser) -->
    <div class="flex items-center gap-1">
      
      <!-- Pencil (✏️) - Primary Drawing Tool -->
      <button 
        id="btn-tool-pencil" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Bút vẽ chính [P]" 
        aria-label="Bút vẽ chính"
      >
        <i data-lucide="pencil" class="w-4 h-4"></i>
      </button>

      <!-- Marker / Highlighter (🖍️) - Highlight/Markup Tool -->
      <button 
        id="btn-tool-highlighter" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Bút dạ quang đánh dấu [M]" 
        aria-label="Bút dạ quang"
      >
        <i data-lucide="highlighter" class="w-4 h-4"></i>
      </button>

      <!-- Eraser (⚫) - Remove Annotations -->
      <button 
        id="btn-tool-eraser" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Cục tẩy nét vẽ [E]" 
        aria-label="Cục tẩy nét vẽ"
      >
        <i data-lucide="eraser" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- Divider 1 -->
    <div class="h-5 w-[1px] bg-black/[0.08]"></div>

    <!-- Group 2: Media Controls (Audio & Grid View) -->
    <div class="flex items-center gap-1">
      
      <!-- Audio / Volume Button (🔊) - Accent blue color -->
      <button 
        id="btn-bottom-audio" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#378ADD] hover:bg-[#378ADD]/10 active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Bật/Tắt Studio bài nghe Audio [A] hoặc [Space]" 
        aria-label="Studio bài nghe"
      >
        <i data-lucide="volume-2" class="w-4 h-4 text-[#378ADD]"></i>
      </button>

      <!-- Grid View (⋱) - Toggle page thumbnails modal -->
      <button 
        id="btn-bottom-grid" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#2C2C2A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Mục lục xem tất cả trang [G]" 
        aria-label="Mục lục xem trang"
      >
        <i data-lucide="layout-grid" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- Divider 2 -->
    <div class="h-5 w-[1px] bg-black/[0.08]"></div>

    <!-- Group 3: Additional Teaching & Focus Tools -->
    <div class="flex items-center gap-1">
      <!-- Laser Pointer -->
      <button 
        id="btn-laser" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-red-500 hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Con trỏ Laser đỏ [L]" 
        aria-label="Con trỏ Laser"
      >
        <i data-lucide="disc" class="w-4 h-4"></i>
      </button>

      <!-- Spotlight Focus -->
      <button 
        id="btn-spotlight" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-amber-500 hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Đèn rọi Spotlight [S]" 
        aria-label="Đèn rọi Spotlight"
      >
        <i data-lucide="sun-medium" class="w-4 h-4"></i>
      </button>

      <!-- Pan Hand Tool -->
      <button 
        id="btn-bottom-pan" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-amber-600 hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Bàn tay kéo trang (Pan/Hand) [H]" 
        aria-label="Bàn tay kéo trang"
      >
        <i data-lucide="hand" class="w-4 h-4"></i>
      </button>

      <!-- Clear Canvas Annotations -->
      <button 
        id="btn-tool-clear" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#666666] hover:text-[#E24B4A] hover:bg-[#F5F5F0] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Xóa toàn bộ nét vẽ trên trang [C]" 
        aria-label="Xóa nét vẽ"
      >
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>

      <!-- Confetti Reward -->
      <button 
        id="btn-bottom-confetti" 
        type="button"
        class="w-9 h-9 rounded-[8px] flex items-center justify-center text-purple-600 hover:bg-purple-50 active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD] focus-visible:outline-none" 
        title="Bắn pháo hoa khen thưởng học sinh 🎉" 
        aria-label="Khen thưởng học sinh"
      >
        <i data-lucide="sparkles" class="w-4 h-4"></i>
      </button>
    </div>

  </div>
  `;
}

// Backwards compatibility alias
export function renderTeachingToolbarHtml(): string {
  return '';
}

/**
 * Setup listeners for Top and Bottom Toolbars
 */
export function setupToolbarListeners(callbacks: {
  onBackToLibrary: () => void;
  onFlipPrev: () => void;
  onFlipNext: () => void;
  onJumpPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSetZoomLevel: (lvl: number) => void;
  onTogglePan: () => boolean;
  onToggleAudioDock: () => void;
  onOpenThumbnails: () => void;
  onStartTimer: (minutes: number) => void;
  onTriggerConfetti: () => void;
  onToggleFullscreen: () => void;
  onCopyShareLink: () => void;
}): void {

  // --- Top Toolbar Listeners ---
  document.getElementById('btn-top-back-lib')?.addEventListener('click', callbacks.onBackToLibrary);
  document.getElementById('btn-top-prev-page')?.addEventListener('click', callbacks.onFlipPrev);
  document.getElementById('btn-top-next-page')?.addEventListener('click', callbacks.onFlipNext);

  // Zoom Dropdown Toggle
  const btnZoom = document.getElementById('btn-top-zoom');
  const zoomMenu = document.getElementById('zoom-menu-dropdown');
  btnZoom?.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomMenu?.classList.toggle('hidden');
    document.getElementById('more-tools-dropdown')?.classList.add('hidden');
  });

  // Zoom Preset Item Selection
  document.querySelectorAll('.btn-zoom-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const zoomVal = (item as HTMLElement).getAttribute('data-zoom');
      if (zoomVal === 'fit' || zoomVal === '1.0') {
        callbacks.onResetZoom();
      } else {
        const lvl = parseFloat(zoomVal || '1.0');
        callbacks.onSetZoomLevel(lvl);
      }
      zoomMenu?.classList.add('hidden');
      updateZoomCheckmarks(zoomVal || '1.0');
    });
  });

  // More Tools Dropdown Toggle
  const btnMore = document.getElementById('btn-top-more-tools');
  const moreMenu = document.getElementById('more-tools-dropdown');
  btnMore?.addEventListener('click', (e) => {
    e.stopPropagation();
    moreMenu?.classList.toggle('hidden');
    zoomMenu?.classList.add('hidden');
  });

  // Close dropdowns when clicking outside
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('#zoom-dropdown-container')) {
      zoomMenu?.classList.add('hidden');
    }
    if (!target.closest('#more-tools-dropdown-container')) {
      moreMenu?.classList.add('hidden');
    }
  });

  // More Tools Menu Items
  document.getElementById('menu-item-thumbnails')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onOpenThumbnails();
  });

  document.getElementById('menu-item-audio')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onToggleAudioDock();
  });

  document.getElementById('menu-item-fullscreen')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onToggleFullscreen();
  });

  document.getElementById('menu-item-sound')?.addEventListener('click', () => {
    const enabled = toggleSoundEffects();
    const soundState = document.getElementById('menu-sound-state');
    if (soundState) {
      soundState.innerText = enabled ? 'Bật' : 'Tắt';
      soundState.className = enabled ? 'text-[11px] font-semibold text-emerald-600' : 'text-[11px] font-semibold text-slate-400';
    }
    showToast(enabled ? '🔊 Đã bật âm thanh lật sách' : '🔇 Đã tắt âm thanh');
  });

  document.getElementById('menu-item-timer')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onStartTimer(5);
  });

  document.getElementById('menu-item-confetti')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onTriggerConfetti();
  });

  document.getElementById('menu-item-shortcuts')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    openShortcutsModal();
  });

  document.getElementById('menu-item-share')?.addEventListener('click', () => {
    moreMenu?.classList.add('hidden');
    callbacks.onCopyShareLink();
  });

  // --- Bottom Floating Toolbar Listeners ---
  
  // Pencil Tool (✏️) - Click again to toggle off
  document.getElementById('btn-tool-pencil')?.addEventListener('click', () => {
    const state = getAnnotationState();
    if (state.currentDrawingTool === 'pencil') {
      setDrawingTool('none');
      showToast('Đã tắt Bút vẽ');
    } else {
      setDrawingTool('pencil');
      showToast('✏️ Đã chọn Bút vẽ [P]');
    }
  });

  // Marker / Highlighter Tool (🖍️) - Click again to toggle off
  document.getElementById('btn-tool-highlighter')?.addEventListener('click', () => {
    const state = getAnnotationState();
    if (state.currentDrawingTool === 'highlighter') {
      setDrawingTool('none');
      showToast('Đã tắt Bút dạ quang');
    } else {
      setDrawingTool('highlighter');
      showToast('🖍️ Đã chọn Bút dạ quang [M]');
    }
  });

  // Eraser Tool (⚫) - Click again to toggle off
  document.getElementById('btn-tool-eraser')?.addEventListener('click', () => {
    const state = getAnnotationState();
    if (state.currentDrawingTool === 'eraser') {
      setDrawingTool('none');
      showToast('Đã tắt Cục tẩy');
    } else {
      setDrawingTool('eraser');
      showToast('🧹 Đã chọn Cục tẩy [E]');
    }
  });

  // Media Controls: Audio Dock Toggle
  document.getElementById('btn-bottom-audio')?.addEventListener('click', callbacks.onToggleAudioDock);

  // Media Controls: Grid View Thumbnails
  document.getElementById('btn-bottom-grid')?.addEventListener('click', callbacks.onOpenThumbnails);

  // Laser Pointer Tool
  document.getElementById('btn-laser')?.addEventListener('click', () => {
    const active = toggleLaser();
    showToast(active ? '🔴 Đã bật con trỏ Laser [L]' : 'Đã tắt con trỏ Laser');
  });

  // Spotlight Focus Tool
  document.getElementById('btn-spotlight')?.addEventListener('click', () => {
    const active = toggleSpotlight();
    showToast(active ? '💡 Đã bật Đèn rọi Spotlight [S]' : 'Đã tắt Đèn rọi Spotlight');
  });

  // Pan Hand Tool
  document.getElementById('btn-bottom-pan')?.addEventListener('click', () => {
    const active = callbacks.onTogglePan();
    const btn = document.getElementById('btn-bottom-pan');
    if (btn) {
      if (active) {
        btn.classList.add('bg-amber-500/15', 'text-amber-600', 'ring-1', 'ring-amber-400');
        btn.classList.remove('text-[#666666]');
      } else {
        btn.classList.remove('bg-amber-500/15', 'text-amber-600', 'ring-1', 'ring-amber-400');
        btn.classList.add('text-[#666666]');
      }
    }
    showToast(active ? '✋ Đã bật Bàn tay kéo trang [H]' : 'Đã tắt Bàn tay kéo trang');
  });

  // Clear Annotations
  document.getElementById('btn-tool-clear')?.addEventListener('click', () => {
    clearAllAnnotations();
    showToast('🗑️ Đã xóa sạch nét vẽ trên trang [C]');
  });

  // Confetti Reward
  document.getElementById('btn-bottom-confetti')?.addEventListener('click', callbacks.onTriggerConfetti);

  // --- Sync State Subscriptions ---
  appState.subscribe('currentPage', (page) => {
    const topNum = document.getElementById('top-page-num');
    if (topNum) topNum.innerText = String(page);
  });

  appState.subscribe('totalPages', (total) => {
    const topTotal = document.getElementById('top-total-pages');
    if (topTotal) topTotal.innerText = String(total);
  });

  appState.subscribe('zoomLevel', (zoom) => {
    const label = document.getElementById('top-zoom-label');
    if (label) label.innerText = `${Math.round(zoom * 100)}%`;
    updateZoomCheckmarks(String(zoom));
  });
}

function updateZoomCheckmarks(activeZoom: string): void {
  document.querySelectorAll('.btn-zoom-item').forEach(item => {
    const z = (item as HTMLElement).getAttribute('data-zoom');
    const check = item.querySelector('.zoom-check');
    if (check) {
      if (z === activeZoom || (activeZoom === '1' && z === '1.0')) {
        check.classList.remove('hidden');
        (item as HTMLElement).classList.add('font-medium');
      } else {
        check.classList.add('hidden');
        (item as HTMLElement).classList.remove('font-medium');
      }
    }
  });
}

// Backwards compatibility alias
export function setupTeachingToolbarListeners(callbacks: any): void {
  setupToolbarListeners(callbacks);
}
