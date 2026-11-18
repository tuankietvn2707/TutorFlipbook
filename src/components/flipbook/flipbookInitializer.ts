import { Book } from '../../types';
import { appState } from '../../state/appState';
import { playFlipSound } from '../../services/audioService';
import { resizeAnnotationCanvas, switchAnnotationPage } from '../../services/annotationService';
import { showToast } from '../../utils/toast';
import {
  EMPTY_PAGE_DATA_URL,
  getPageFlipConstructor,
  getPageFlipInstance,
  setPageFlipInstance
} from './flipbookState';
import { updateVirtualPageImages } from './flipbookVirtualizer';
import { resetReaderZoom } from './flipbookZoomPan';

function computePageDimensions(): { pageWidth: number; pageHeight: number; isMobile: boolean } {
  const stageEl = document.getElementById('reader-stage');
  const isMobile = window.innerWidth < 768;
  const stageWidth = (stageEl && stageEl.clientWidth > 100)
    ? stageEl.clientWidth
    : (isMobile ? window.innerWidth - 16 : window.innerWidth - 48);
  const stageHeight = (stageEl && stageEl.clientHeight > 100)
    ? stageEl.clientHeight
    : (window.innerHeight - 120);

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
    pageWidth = Math.max(260, Math.floor(Math.min((stageWidth - 48) / 2, (stageHeight - 40) / 1.414)));
    pageHeight = Math.floor(pageWidth * 1.414);
    if (pageHeight > stageHeight - 40) {
      pageHeight = stageHeight - 40;
      pageWidth = Math.floor(pageHeight / 1.414);
    }
  }

  return { pageWidth, pageHeight, isMobile };
}

export function initPageFlip(book: Book, initialPage = 0): void {
  const flipbookParent = document.getElementById('reader-flipbook-container');
  if (!flipbookParent) return;

  const existing = getPageFlipInstance();
  if (existing) {
    try {
      existing.destroy();
    } catch (e) {
      console.warn('PageFlip destroy warning:', e);
    }
    setPageFlipInstance(null);
  }

  flipbookParent.innerHTML = '<div id="flipbook-book" class="flip-book shadow-2xl"></div>';
  const container = document.getElementById('flipbook-book');
  if (!container) return;

  const safePages = Array.isArray(book.pages) && book.pages.length > 0
    ? book.pages
    : [book.coverImage || EMPTY_PAGE_DATA_URL, book.coverImage || EMPTY_PAGE_DATA_URL];
  const pagesToRender = safePages.length === 1 ? [safePages[0], safePages[0]] : safePages;

  const titleEl = document.getElementById('reader-book-title');
  const metaEl = document.getElementById('reader-book-meta');
  const totalPagesLabel = document.getElementById('total-pages-label');
  const inputPageNum = document.getElementById('input-page-number') as HTMLInputElement;

  if (titleEl) titleEl.textContent = book.title;
  if (metaEl) metaEl.textContent = `${initialPage + 1} / ${pagesToRender.length} trang • ${book.audioTracks ? book.audioTracks.length : 0} Audio`;
  if (totalPagesLabel) totalPagesLabel.textContent = `${pagesToRender.length}`;
  if (inputPageNum) {
    inputPageNum.max = `${pagesToRender.length}`;
    inputPageNum.value = `${initialPage + 1}`;
  }

  const { pageWidth, pageHeight, isMobile } = computePageDimensions();

  pagesToRender.forEach((pageDataUrl, idx) => {
    const pageDiv = document.createElement('div');
    const isCover = idx === 0 || idx === pagesToRender.length - 1;
    pageDiv.className = 'page-flip-sheet bg-white shadow-md overflow-hidden flex items-center justify-center select-none';
    if (isCover) pageDiv.setAttribute('data-density', 'hard');

    const isNear = Math.abs(idx - initialPage) <= 3;
    const safeDataUrl = pageDataUrl ? pageDataUrl.replace(/"/g, '%22') : EMPTY_PAGE_DATA_URL;
    pageDiv.innerHTML = `
      <img 
        src="${isNear ? safeDataUrl : EMPTY_PAGE_DATA_URL}" 
        data-page-index="${idx}"
        ${isNear ? 'data-loaded="true"' : ''}
        alt="Trang ${idx + 1}" 
        loading="${isNear ? 'eager' : 'lazy'}" 
        decoding="async" 
        class="w-full h-full object-contain pointer-events-none select-none" 
      />
    `;
    container.appendChild(pageDiv);
  });

  const PageFlipConstructor = getPageFlipConstructor();
  if (PageFlipConstructor) {
    try {
      const instance = new PageFlipConstructor(container, {
        width: pageWidth,
        height: pageHeight,
        size: 'fixed',
        minWidth: 260,
        maxWidth: 1400,
        minHeight: 360,
        maxHeight: 1800,
        maxShadowOpacity: 0.25,
        showCover: true,
        mobileScrollSupport: false,
        usePortrait: isMobile,
        startPage: initialPage,
        flippingTime: 320,
        useMouseEvents: true,
        swipeDistance: 30
      });

      instance.loadFromHTML(container.querySelectorAll('.page-flip-sheet'));
      instance.on('flip', (e: any) => {
        const pageIndex = e.data;
        const displayPage = pageIndex + 1;
        appState.set('currentPage', displayPage);
        const curInput = document.getElementById('input-page-number') as HTMLInputElement;
        if (curInput) curInput.value = `${displayPage}`;
        const curMeta = document.getElementById('reader-book-meta');
        const activeBook = appState.get('currentBook');
        if (curMeta && activeBook) {
          curMeta.textContent = `${displayPage} / ${pagesToRender.length} trang • ${activeBook.audioTracks ? activeBook.audioTracks.length : 0} Audio`;
        }
        if (activeBook && activeBook.pages) {
          updateVirtualPageImages(pageIndex, activeBook.pages);
          switchAnnotationPage(activeBook.id, pageIndex);
        }
        playFlipSound();
      });

      setPageFlipInstance(instance);
      appState.set('pageFlipInstance', instance);
    } catch (err) {
      console.error('Error constructing PageFlip instance:', err);
    }
  } else {
    console.error('PageFlip constructor not available!');
    showToast('⚠️ Không thể khởi tạo thư viện lật sách 3D');
  }

  appState.update({
    currentBook: book,
    totalPages: book.pages.length,
    currentPage: initialPage + 1
  });

  resetReaderZoom();
  resizeAnnotationCanvas();
  switchAnnotationPage(book.id, initialPage);
}
