import { appState } from '../../state/appState';
import {
  EMPTY_PAGE_DATA_URL,
  getPageFlipInstance,
  setPageFlipInstance
} from './flipbookState';

export function updateVirtualPageImages(pageIndex: number, pages: string[]): void {
  const container = document.getElementById('flipbook-book');
  if (!container || !pages || pages.length === 0) return;

  const imgs = container.querySelectorAll<HTMLImageElement>('.page-flip-sheet img');
  imgs.forEach((img) => {
    const rawIdx = img.getAttribute('data-page-index');
    if (rawIdx === null) return;
    const idx = parseInt(rawIdx, 10);
    if (isNaN(idx) || idx < 0 || idx >= pages.length) return;

    const dist = Math.abs(idx - pageIndex);
    if (dist <= 3) {
      if (img.getAttribute('data-loaded') !== 'true') {
        const safeUrl = pages[idx] ? pages[idx].replace(/"/g, '%22') : EMPTY_PAGE_DATA_URL;
        img.src = safeUrl;
        img.setAttribute('data-loaded', 'true');
      }
    } else if (dist > 5) {
      if (img.getAttribute('data-loaded') === 'true') {
        img.src = EMPTY_PAGE_DATA_URL;
        img.removeAttribute('data-loaded');
      }
    }
  });
}

export function cleanupFlipbookReader(): void {
  const instance = getPageFlipInstance();
  if (instance) {
    try {
      instance.destroy();
    } catch (e) {
      console.warn('PageFlip destroy warning:', e);
    }
    setPageFlipInstance(null);
  }
  const flipbookParent = document.getElementById('reader-flipbook-container');
  if (flipbookParent) {
    flipbookParent.innerHTML = '<div id="flipbook-book" class="flip-book shadow-2xl"></div>';
  }
  const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }
}

export function updateReaderMeta(): void {
  const metaEl = document.getElementById('reader-book-meta');
  const book = appState.get('currentBook');
  const page = appState.get('currentPage');
  const total = appState.get('totalPages');
  const audioCount = book && book.audioTracks ? book.audioTracks.length : 0;
  if (metaEl) {
    metaEl.innerText = `${page} / ${total} trang • ${audioCount} Audio`;
  }
}
