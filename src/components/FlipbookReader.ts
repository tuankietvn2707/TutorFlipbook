import { Book } from '../types';
import { appState } from '../state/appState';
import { playFlipSound, toggleSoundEffects, getSoundEffectsEnabled } from '../services/audioService';
import { resizeAnnotationCanvas, setupAnnotationListeners } from '../services/annotationService';
import { 
  renderTopToolbarHtml, 
  renderBottomToolbarHtml, 
  setupToolbarListeners 
} from './TeachingToolbar';
import { showToast } from '../utils/toast';
import { openShortcutsModal } from './ShortcutsModal';
import { PageFlip } from 'page-flip';
import confetti from 'canvas-confetti';

let pageFlipInstance: any = null;
let zoomLevel = 1.0;
let panOffset = { x: 0, y: 0 };
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let isPanToolActive = false;

export function renderFlipbookReaderHtml(): string {
  return `
  <section id="view-reader" class="flex-1 flex flex-col justify-between select-none relative h-full w-full bg-[#F7F9FC] overflow-hidden rounded-2xl border border-black/[0.08] shadow-sm">
    
    <!-- 1. TOP TOOLBAR (Height: 48px) -->
    ${renderTopToolbarHtml()}

    <!-- 2. MAIN 3D FLIPBOOK VIEWPORT STAGE -->
    <div id="reader-stage" class="relative flex-1 w-full min-h-0 bg-[#F0F2F5] overflow-hidden flex items-center justify-center p-2 sm:p-4">
      
      <!-- Annotation Canvas Layer -->
      <canvas id="annotation-canvas" class="absolute inset-0 z-30 pointer-events-none w-full h-full"></canvas>

      <!-- Zoom Badge Indicator -->
      <div id="zoom-badge-indicator" class="hidden absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md text-amber-300 px-3 py-1 rounded-xl text-xs font-black border border-slate-700 pointer-events-none">
        <span id="zoom-badge-text">🔍 Zoom: 100%</span>
      </div>

      <!-- Arrow Navigation Buttons on Stage -->
      <button 
        id="btn-stage-prev" 
        type="button"
        class="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/90 hover:bg-white text-[#2C2C2A] border border-black/[0.08] shadow-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD]" 
        title="Trang trước [←]"
        aria-label="Trang trước"
      >
        <i data-lucide="chevron-left" class="w-6 h-6"></i>
      </button>

      <button 
        id="btn-stage-next" 
        type="button"
        class="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/90 hover:bg-white text-[#2C2C2A] border border-black/[0.08] shadow-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#378ADD]" 
        title="Trang sau [→]"
        aria-label="Trang sau"
      >
        <i data-lucide="chevron-right" class="w-6 h-6"></i>
      </button>

      <!-- Flipbook Render Target Wrapper (Transformed with Zoom/Pan) -->
      <div id="reader-flipbook-container" class="relative z-10 transition-transform duration-75 origin-center flex items-center justify-center w-full h-full">
        <div id="flipbook-book" class="flip-book shadow-2xl">
          <!-- Dynamically generated St.PageFlip sheets -->
        </div>
      </div>

      <!-- 3. BOTTOM FLOATING TOOLBAR (Height: 48px) -->
      ${renderBottomToolbarHtml()}

    </div>

  </section>
  `;
}

export function openBookInReader(book: Book, initialPage = 0): void {
  appState.update({
    currentBook: book,
    totalPages: book.totalPages,
    currentPage: initialPage + 1
  });

  // Allow DOM layout to complete before sizing canvas and flipbook
  requestAnimationFrame(() => {
    setTimeout(() => {
      initPageFlip(book, initialPage);
    }, 60);
  });
}

export function initPageFlip(book: Book, initialPage = 0): void {
  const flipbookParent = document.getElementById('reader-flipbook-container');
  if (!flipbookParent) return;

  if (pageFlipInstance) {
    try {
      pageFlipInstance.destroy();
    } catch (e) {
      console.warn('PageFlip destroy warning:', e);
    }
    pageFlipInstance = null;
  }

  // Always recreate the book target div inside flipbookParent
  flipbookParent.innerHTML = '<div id="flipbook-book" class="flip-book shadow-2xl"></div>';
  const container = document.getElementById('flipbook-book');
  if (!container) return;

  // Update book header info
  const titleEl = document.getElementById('reader-book-title');
  const metaEl = document.getElementById('reader-book-meta');
  const totalPagesLabel = document.getElementById('total-pages-label');
  const inputPageNum = document.getElementById('input-page-number') as HTMLInputElement;

  if (titleEl) titleEl.textContent = book.title;
  if (metaEl) metaEl.textContent = `${initialPage + 1} / ${book.totalPages} trang • ${book.audioTracks ? book.audioTracks.length : 0} Audio`;
  if (totalPagesLabel) totalPagesLabel.textContent = `${book.totalPages}`;
  if (inputPageNum) {
    inputPageNum.max = `${book.totalPages}`;
    inputPageNum.value = `${initialPage + 1}`;
  }

  // Safe calculation for stage width and height
  const stageEl = document.getElementById('reader-stage');
  const isMobile = window.innerWidth < 768;
  const stageWidth = (stageEl && stageEl.clientWidth > 100) ? stageEl.clientWidth : (isMobile ? window.innerWidth - 24 : window.innerWidth - 320);
  const stageHeight = (stageEl && stageEl.clientHeight > 100) ? stageEl.clientHeight : (window.innerHeight - 220);

  let pageWidth: number;
  let pageHeight: number;

  if (isMobile) {
    pageWidth = Math.max(260, Math.min(stageWidth - 24, Math.floor((stageHeight - 20) / 1.414)));
    pageHeight = Math.floor(pageWidth * 1.414);
    if (pageHeight > stageHeight - 20) {
      pageHeight = stageHeight - 20;
      pageWidth = Math.floor(pageHeight / 1.414);
    }
  } else {
    // 2-page spread
    pageWidth = Math.max(260, Math.floor(Math.min((stageWidth - 48) / 2, (stageHeight - 40) / 1.414)));
    pageHeight = Math.floor(pageWidth * 1.414);
    if (pageHeight > stageHeight - 40) {
      pageHeight = stageHeight - 40;
      pageWidth = Math.floor(pageHeight / 1.414);
    }
  }

  // Generate page sheets for PageFlip
  book.pages.forEach((pageDataUrl, idx) => {
    const pageDiv = document.createElement('div');
    const isCover = idx === 0 || idx === book.pages.length - 1;
    pageDiv.className = 'page-flip-sheet bg-white shadow-md overflow-hidden flex items-center justify-center select-none';
    if (isCover) {
      pageDiv.setAttribute('data-density', 'hard');
    }
    pageDiv.innerHTML = `
      <img src="${pageDataUrl}" alt="Trang ${idx + 1}" class="w-full h-full object-contain pointer-events-none select-none" />
    `;
    container.appendChild(pageDiv);
  });

  const PageFlipConstructor = PageFlip || (window.St && window.St.PageFlip);
  if (PageFlipConstructor) {
    try {
      pageFlipInstance = new PageFlipConstructor(container, {
        width: pageWidth,
        height: pageHeight,
        size: 'fixed',
        minWidth: 260,
        maxWidth: 1200,
        minHeight: 360,
        maxHeight: 1600,
        maxShadowOpacity: 0.4,
        showCover: true,
        mobileScrollSupport: false,
        usePortrait: isMobile,
        startPage: initialPage,
        flippingTime: 400,
        useMouseEvents: true,
        swipeDistance: 30
      });

      pageFlipInstance.loadFromHTML(container.querySelectorAll('.page-flip-sheet'));

      pageFlipInstance.on('flip', (e: any) => {
        const pageIndex = e.data;
        const displayPage = pageIndex + 1;
        appState.set('currentPage', displayPage);
        const curInput = document.getElementById('input-page-number') as HTMLInputElement;
        if (curInput) curInput.value = `${displayPage}`;
        const curMeta = document.getElementById('reader-book-meta');
        const activeBook = appState.get('currentBook');
        if (curMeta && activeBook) {
          curMeta.textContent = `${displayPage} / ${activeBook.totalPages} trang • ${activeBook.audioTracks ? activeBook.audioTracks.length : 0} Audio`;
        }
        playFlipSound();
      });

      appState.set('pageFlipInstance', pageFlipInstance);
    } catch (err) {
      console.error('Error constructing PageFlip instance:', err);
    }
  }

  appState.update({
    currentBook: book,
    totalPages: book.totalPages,
    currentPage: initialPage + 1
  });

  resetReaderZoom();
  resizeAnnotationCanvas();
}

export function flipNextPage(): void {
  if (pageFlipInstance) {
    pageFlipInstance.flipNext();
  }
}

export function flipPrevPage(): void {
  if (pageFlipInstance) {
    pageFlipInstance.flipPrev();
  }
}

export function flipFirstPage(): void {
  if (pageFlipInstance) {
    pageFlipInstance.flip(0);
  }
}

export function flipLastPage(): void {
  if (pageFlipInstance) {
    const total = appState.get('totalPages');
    pageFlipInstance.flip(Math.max(0, total - 1));
  }
}

export function jumpToPage(pageNum: number): void {
  const total = appState.get('totalPages');
  const target = Math.max(1, Math.min(total, pageNum));
  if (pageFlipInstance) {
    pageFlipInstance.flip(target - 1);
  }
}

export function zoomIn(): void {
  setZoom(zoomLevel + 0.25);
}

export function zoomOut(): void {
  setZoom(zoomLevel - 0.25);
}

export function resetReaderZoom(): void {
  setZoom(1.0);
  panOffset = { x: 0, y: 0 };
  applyTransform();
}

export function setZoom(lvl: number): void {
  zoomLevel = Math.max(1.0, Math.min(4.0, lvl));
  if (zoomLevel === 1.0) {
    panOffset = { x: 0, y: 0 };
  }
  applyTransform();
  appState.set('zoomLevel', zoomLevel);

  const badge = document.getElementById('zoom-badge-indicator');
  const badgeText = document.getElementById('zoom-badge-text');
  const bottomLabel = document.getElementById('bottom-zoom-label');

  if (bottomLabel) {
    bottomLabel.innerText = `${Math.round(zoomLevel * 100)}%`;
  }

  if (badge && badgeText) {
    if (zoomLevel > 1.0) {
      badgeText.innerText = `🔍 Zoom: ${Math.round(zoomLevel * 100)}%`;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

export function togglePanTool(): boolean {
  isPanToolActive = !isPanToolActive;
  const stage = document.getElementById('reader-stage');
  const btnTop = document.getElementById('toolbar-btn-pan');
  const btnBottom = document.getElementById('btn-bottom-pan');

  if (stage) {
    stage.style.cursor = isPanToolActive ? 'grab' : 'default';
  }

  if (btnTop) {
    if (isPanToolActive) {
      btnTop.classList.add('bg-amber-400', 'text-slate-900');
    } else {
      btnTop.classList.remove('bg-amber-400', 'text-slate-900');
    }
  }

  if (btnBottom) {
    if (isPanToolActive) {
      btnBottom.classList.add('bg-amber-100', 'text-amber-900', 'border-amber-400');
    } else {
      btnBottom.classList.remove('bg-amber-100', 'text-amber-900', 'border-amber-400');
    }
  }

  return isPanToolActive;
}

function applyTransform(): void {
  const container = document.getElementById('reader-flipbook-container');
  if (container) {
    container.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`;
  }
}

export function triggerRewardConfetti(): void {
  const confettiFn = confetti || (window as any).confetti;
  if (confettiFn) {
    confettiFn({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    showToast('🎉 Khen ngợi học sinh hoàn thành xuất sắc bài học!');
  }
}

export function toggleFullscreenTeachingMode(): void {
  const isTeaching = !appState.get('isTeachingMode');
  appState.set('isTeachingMode', isTeaching);

  if (isTeaching) {
    document.body.classList.add('teaching-mode-active');
    showToast('🖥️ Đã bật Chế độ Giảng Dạy Toàn Màn Hình (Phím Esc để thoát)');
  } else {
    document.body.classList.remove('teaching-mode-active');
    showToast('Đã thoát Chế độ Giảng Dạy');
  }

  setTimeout(() => {
    resizeAnnotationCanvas();
    const curBook = appState.get('currentBook');
    const curPage = appState.get('currentPage');
    if (curBook) {
      initPageFlip(curBook, Math.max(0, curPage - 1));
    }
  }, 150);
}

export function setupFlipbookReaderListeners(callbacks: {
  onBackToLibrary: () => void;
  onOpenThumbnails: () => void;
  onOpenBatchAudio?: () => void;
  onOpenVideo?: (url: string, title?: string) => void;
}): void {
  // Arrow buttons on Stage
  document.getElementById('btn-stage-prev')?.addEventListener('click', flipPrevPage);
  document.getElementById('btn-stage-next')?.addEventListener('click', flipNextPage);

  // Pan dragging on stage
  const stage = document.getElementById('reader-stage');
  if (stage) {
    stage.addEventListener('mousedown', (e) => {
      if (isPanToolActive || zoomLevel > 1.0) {
        isPanning = true;
        panStartX = e.clientX - panOffset.x;
        panStartY = e.clientY - panOffset.y;
        stage.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isPanning) {
        panOffset.x = e.clientX - panStartX;
        panOffset.y = e.clientY - panStartY;
        applyTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        if (stage) {
          stage.style.cursor = isPanToolActive ? 'grab' : 'default';
        }
      }
    });
  }

  // Setup Top & Bottom Minimalist Toolbars
  setupToolbarListeners({
    onBackToLibrary: callbacks.onBackToLibrary,
    onFlipPrev: flipPrevPage,
    onFlipNext: flipNextPage,
    onJumpPage: jumpToPage,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetZoom: resetReaderZoom,
    onSetZoomLevel: setZoom,
    onTogglePan: () => togglePanTool(),
    onToggleAudioDock: () => {
      const isOpen = appState.get('isMediaDockOpen');
      appState.set('isMediaDockOpen', !isOpen);
    },
    onOpenThumbnails: callbacks.onOpenThumbnails,
    onStartTimer: (mins) => {
      showToast(`⏱️ Đã bắt đầu đếm ngược ${mins} phút`);
    },
    onTriggerConfetti: triggerRewardConfetti,
    onToggleFullscreen: toggleFullscreenTeachingMode,
    onCopyShareLink: () => {
      const url = window.location.href;
      navigator.clipboard?.writeText(url);
      showToast('🔗 Đã sao chép liên kết bài học!');
    }
  });

  // Initialize Canvas Drawing and Annotation Listeners
  setupAnnotationListeners();

  // AppState subscriptions for labels
  appState.subscribe('currentPage', (page) => {
    updateReaderMeta();
  });

  appState.subscribe('totalPages', (total) => {
    updateReaderMeta();
  });

  appState.subscribe('currentBook', (book) => {
    updateReaderMeta();
  });

  // Window resize handler to maintain flipbook layout
  let resizeTimer: any = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeAnnotationCanvas();
      const curBook = appState.get('currentBook');
      const curPage = appState.get('currentPage');
      const readerContainer = document.getElementById('view-reader-container');
      if (curBook && readerContainer && !readerContainer.classList.contains('hidden')) {
        initPageFlip(curBook, Math.max(0, curPage - 1));
      }
    }, 250);
  });
}

function updateReaderMeta(): void {
  const metaEl = document.getElementById('reader-book-meta');
  const book = appState.get('currentBook');
  const page = appState.get('currentPage');
  const total = appState.get('totalPages');
  const audioCount = book && book.audioTracks ? book.audioTracks.length : 0;
  if (metaEl) {
    metaEl.innerText = `${page} / ${total} trang • ${audioCount} Audio`;
  }
}
