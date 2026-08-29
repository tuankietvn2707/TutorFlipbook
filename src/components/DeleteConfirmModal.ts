import { Book } from '../types';
import { deleteBookFromDB } from '../services/dbService';
import { showToast } from '../utils/toast';

let bookToDelete: Book | null = null;

export function renderDeleteConfirmModalHtml(): string {
  return `
  <!-- MODAL: DELETE BOOK CONFIRMATION MODAL -->
  <div id="modal-delete-book" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="card-3d w-full max-w-md p-6 shadow-2xl space-y-4 bg-white text-center">
      
      <!-- Delete Warning Icon -->
      <div class="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-500 border-2 border-red-200 flex items-center justify-center shadow-inner">
        <i data-lucide="trash-2" class="w-7 h-7"></i>
      </div>

      <!-- Header Title -->
      <div class="space-y-1">
        <h3 class="font-black text-base sm:text-lg text-slate-800">Xác Nhận Xóa Sách</h3>
        <p class="text-xs font-bold text-slate-500">Bạn có chắc chắn muốn xóa cuốn sách này khỏi thư viện?</p>
      </div>

      <!-- Selected Book Item Preview -->
      <div class="p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center gap-3 text-left">
        <div id="delete-modal-cover-preview" class="w-12 h-14 rounded-lg bg-duoGreen flex items-center justify-center text-white text-[9px] font-black shadow-sm flex-shrink-0 text-center px-1">
          3D
        </div>
        <div class="flex-1 min-w-0">
          <p id="delete-modal-book-title" class="font-black text-xs text-slate-800 truncate">Tên sách</p>
          <p id="delete-modal-book-info" class="text-[10px] font-bold text-slate-500 mt-0.5">0 trang • 0 Audio</p>
        </div>
      </div>

      <!-- Caution Alert Box -->
      <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 text-left flex items-start gap-2">
        <i data-lucide="alert-triangle" class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"></i>
        <span>Hành động này sẽ xóa toàn bộ các trang sách và bài nghe audio gắn kèm khỏi bộ nhớ thiết bị.</span>
      </div>

      <!-- Modal Action Buttons -->
      <div class="grid grid-cols-2 gap-3 pt-2">
        <button type="button" id="btn-cancel-delete" class="btn-3d btn-white font-black py-2.5 rounded-xl text-xs text-slate-600 cursor-pointer">
          Hủy bỏ
        </button>
        <button type="button" id="btn-confirm-delete" class="btn-3d btn-red font-black py-2.5 rounded-xl text-xs text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
          <span>Xác nhận xóa</span>
        </button>
      </div>
    </div>
  </div>
  `;
}

export function openDeleteConfirmModal(book: Book): void {
  bookToDelete = book;
  const modal = document.getElementById('modal-delete-book');
  const title = document.getElementById('delete-modal-book-title');
  const info = document.getElementById('delete-modal-book-info');

  if (title) title.innerText = book.title;
  if (info) {
    const audioCount = book.audioTracks ? book.audioTracks.length : 0;
    info.innerText = `${book.totalPages} trang • ${audioCount} Audio`;
  }

  modal?.classList.remove('hidden');
}

export function closeDeleteConfirmModal(): void {
  bookToDelete = null;
  const modal = document.getElementById('modal-delete-book');
  modal?.classList.add('hidden');
}

export function setupDeleteConfirmListeners(onBookDeleted: (id: string) => void): void {
  document.getElementById('btn-cancel-delete')?.addEventListener('click', closeDeleteConfirmModal);
  document.getElementById('btn-confirm-delete')?.addEventListener('click', async () => {
    if (bookToDelete) {
      const id = bookToDelete.id;
      await deleteBookFromDB(id);
      closeDeleteConfirmModal();
      showToast('🗑️ Đã xóa cuốn sách khỏi thư viện');
      onBookDeleted(id);
    }
  });
}
