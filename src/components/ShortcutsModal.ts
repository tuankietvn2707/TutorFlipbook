import { renderShortcutsCategoriesHtml } from './shortcuts/shortcutsCategoriesHtml';

export function renderShortcutsModalHtml(): string {
  return `
  <!-- MODAL: ONLINE TEACHING SHORTCUTS CHEAT SHEET -->
  <div id="modal-shortcuts" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
    <div class="card-3d w-full max-w-2xl max-h-[90vh] p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 bg-white rounded-3xl border-2 border-slate-200">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b-2 border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
            <i data-lucide="keyboard" class="w-4 h-4 text-purple-600"></i>
          </div>
          <div>
            <h3 class="font-black text-base text-slate-800">Phím Tắt Trợ Giảng & Lật Sách Online</h3>
            <p class="text-xs text-slate-500 font-bold">Thao tác nhanh trên bàn phím khi dạy học Google Meet / Zoom</p>
          </div>
        </div>
        <button id="btn-close-shortcuts" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      ${renderShortcutsCategoriesHtml()}

      <!-- Footer Note -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[11px] text-slate-400 font-bold">Mẹo: Bạn có thể bấm phím <kbd class="font-mono bg-slate-100 px-1 rounded">?</kbd> bất cứ lúc nào để xem nhanh</span>
        <button id="btn-done-shortcuts" class="btn-3d btn-green text-white font-black px-4 py-1.5 rounded-xl text-xs cursor-pointer shadow-sm">
          Đã Hiểu
        </button>
      </div>

    </div>
  </div>
  `;
}

export function openShortcutsModal(): void {
  const modal = document.getElementById('modal-shortcuts');
  modal?.classList.remove('hidden');
}

export function closeShortcutsModal(): void {
  const modal = document.getElementById('modal-shortcuts');
  modal?.classList.add('hidden');
}

export function setupShortcutsListeners(): void {
  document.getElementById('btn-close-shortcuts')?.addEventListener('click', closeShortcutsModal);
  document.getElementById('btn-done-shortcuts')?.addEventListener('click', closeShortcutsModal);
}
