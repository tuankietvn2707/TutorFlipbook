import { Book } from '../types';
import { appState } from '../state/appState';
import { jumpToPage } from './FlipbookReader';

export function renderThumbnailsModalHtml(): string {
  return `
  <!-- MODAL: THUMBNAILS MODAL -->
  <div id="modal-thumbnails" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="card-3d w-full max-w-3xl max-h-[85vh] p-6 shadow-2xl flex flex-col space-y-4 bg-white">
      <div class="flex items-center justify-between pb-2 border-b-2 border-slate-100">
        <div class="flex items-center gap-2">
          <i data-lucide="layout-grid" class="w-5 h-5 text-duoBlue"></i>
          <h3 class="font-black text-base text-slate-800">Danh Sách Tất Cả Trang</h3>
        </div>
        <button id="btn-close-thumbnails" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div id="thumbnails-container" class="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1"></div>
    </div>
  </div>
  `;
}

export function openThumbnailsModal(): void {
  const modal = document.getElementById('modal-thumbnails');
  const container = document.getElementById('thumbnails-container');
  const book = appState.get('currentBook');
  const curPage = appState.get('currentPage');

  if (!modal || !container || !book) return;

  container.innerHTML = book.pages
    .map(
      (pageImg, idx) => `
    <div 
      onclick="window.onThumbnailClick(${idx + 1})" 
      class="border-2 rounded-xl p-1 bg-slate-50 hover:bg-sky-50 cursor-pointer transition flex flex-col items-center gap-1 ${
        idx + 1 === curPage ? 'border-duoBlue ring-2 ring-duoBlue' : 'border-slate-200'
      }"
    >
      <div class="aspect-[3/4] w-full bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
        <img src="${pageImg}" alt="Trang ${idx + 1}" class="w-full h-full object-contain pointer-events-none" />
      </div>
      <span class="font-black text-xs ${idx + 1 === curPage ? 'text-duoBlue' : 'text-slate-600'}">Trang ${idx + 1}</span>
    </div>
  `
    )
    .join('');

  modal.classList.remove('hidden');
}

export function closeThumbnailsModal(): void {
  const modal = document.getElementById('modal-thumbnails');
  modal?.classList.add('hidden');
}

export function setupThumbnailsListeners(): void {
  document.getElementById('btn-close-thumbnails')?.addEventListener('click', closeThumbnailsModal);
  (window as any).onThumbnailClick = (pageNum: number) => {
    jumpToPage(pageNum);
    closeThumbnailsModal();
  };
}
