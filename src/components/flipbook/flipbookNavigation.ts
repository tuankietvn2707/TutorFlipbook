import confetti from 'canvas-confetti';
import { appState } from '../../state/appState';
import { resizeAnnotationCanvas } from '../../services/annotationService';
import { showToast } from '../../utils/toast';
import { getPageFlipInstance } from './flipbookState';
import { updateVirtualPageImages } from './flipbookVirtualizer';
import { initPageFlip } from './flipbookInitializer';

export function flipNextPage(): void {
  const instance = getPageFlipInstance();
  if (instance) instance.flipNext();
}

export function flipPrevPage(): void {
  const instance = getPageFlipInstance();
  if (instance) instance.flipPrev();
}

export function flipFirstPage(): void {
  const activeBook = appState.get('currentBook');
  if (activeBook && activeBook.pages) {
    updateVirtualPageImages(0, activeBook.pages);
  }
  const instance = getPageFlipInstance();
  if (instance) instance.flip(0);
}

export function flipLastPage(): void {
  const total = appState.get('totalPages');
  const target = Math.max(0, total - 1);
  const activeBook = appState.get('currentBook');
  if (activeBook && activeBook.pages) {
    updateVirtualPageImages(target, activeBook.pages);
  }
  const instance = getPageFlipInstance();
  if (instance) instance.flip(target);
}

export function jumpToPage(pageNum: number): void {
  const total = appState.get('totalPages');
  const target = Math.max(1, Math.min(total, pageNum));
  const activeBook = appState.get('currentBook');
  if (activeBook && activeBook.pages) {
    updateVirtualPageImages(target - 1, activeBook.pages);
  }
  const instance = getPageFlipInstance();
  if (instance) instance.flip(target - 1);
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
