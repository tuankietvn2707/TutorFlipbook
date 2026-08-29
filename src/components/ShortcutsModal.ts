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

      <!-- Shortcuts Grid List -->
      <div class="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        
        <!-- Category 1: Lật Trang & Điều Hướng -->
        <div class="space-y-2">
          <h4 class="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-duoBlue"></i>
            <span>Lật Trang & Điều Hướng Sách</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Lật trang kế tiếp</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">→</kbd>
                <span class="text-slate-400">hoặc</span>
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">J</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">PgDn</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Lật trang trước</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">←</kbd>
                <span class="text-slate-400">hoặc</span>
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">K</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">PgUp</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Về trang đầu / Đến trang cuối</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">Home</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">End</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Mở mục lục ảnh tất cả trang</span>
              <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">G</kbd>
            </div>
          </div>
        </div>

        <!-- Category 2: Công Cụ Bút Vẽ & Giảng Dạy -->
        <div class="space-y-2">
          <h4 class="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i data-lucide="pen-tool" class="w-3.5 h-3.5 text-rose-500"></i>
            <span>Công Cụ Tương Tác & Giảng Dạy</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span class="font-bold text-slate-700">Con trỏ Laser đỏ</span>
              </div>
              <kbd class="px-2 py-0.5 bg-red-50 border border-b-2 border-red-300 rounded text-[11px] font-mono font-black text-red-600 shadow-xs">L</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span class="font-bold text-slate-700">Đèn rọi Spotlight</span>
              </div>
              <kbd class="px-2 py-0.5 bg-amber-50 border border-b-2 border-amber-300 rounded text-[11px] font-mono font-black text-amber-700 shadow-xs">S</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span class="font-bold text-slate-700">Bút dạ quang vàng</span>
              </div>
              <kbd class="px-2 py-0.5 bg-yellow-50 border border-b-2 border-yellow-300 rounded text-[11px] font-mono font-black text-yellow-800 shadow-xs">P</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span class="font-bold text-slate-700">Bút vẽ đỏ (Ghi chú)</span>
              </div>
              <kbd class="px-2 py-0.5 bg-rose-50 border border-b-2 border-rose-300 rounded text-[11px] font-mono font-black text-rose-700 shadow-xs">D</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span class="font-bold text-slate-700">Bút vẽ xanh</span>
              </div>
              <kbd class="px-2 py-0.5 bg-sky-50 border border-b-2 border-sky-300 rounded text-[11px] font-mono font-black text-sky-700 shadow-xs">B</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span class="font-bold text-slate-700">Cục tẩy nét vẽ</span>
              </div>
              <kbd class="px-2 py-0.5 bg-slate-100 border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">E</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Xóa toàn bộ nét vẽ trên trang</span>
              <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">C</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Công cụ kéo di chuyển trang</span>
              <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">H</kbd>
            </div>
          </div>
        </div>

        <!-- Category 3: Audio & Chế Độ Giảng Dạy -->
        <div class="space-y-2">
          <h4 class="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i data-lucide="headphones" class="w-3.5 h-3.5 text-purple-500"></i>
            <span>Audio & Chế Độ Giảng Dạy Meet</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Phát / Tạm dừng bài nghe Audio</span>
              <kbd class="px-2 py-0.5 bg-purple-50 border border-b-2 border-purple-300 rounded text-[11px] font-mono font-black text-purple-800 shadow-xs">Space</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Bật/Tắt Hộp Studio Bài Nghe</span>
              <kbd class="px-2 py-0.5 bg-purple-50 border border-b-2 border-purple-300 rounded text-[11px] font-mono font-black text-purple-800 shadow-xs">A</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Bài nghe trước / sau</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">[</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">]</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Toàn Màn Hình Giảng Dạy 3D</span>
              <kbd class="px-2 py-0.5 bg-sky-50 border border-b-2 border-sky-300 rounded text-[11px] font-mono font-black text-sky-700 shadow-xs">F</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Thoát Toàn Màn Hình / Đóng Modal</span>
              <kbd class="px-2 py-0.5 bg-white border border-b-2 border-slate-300 rounded text-[11px] font-mono font-black text-slate-700 shadow-xs">Esc</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-bold text-slate-700">Mở Bảng Phím Tắt Trợ Giảng</span>
              <kbd class="px-2 py-0.5 bg-amber-50 border border-b-2 border-amber-300 rounded text-[11px] font-mono font-black text-amber-800 shadow-xs">?</kbd>
            </div>
          </div>
        </div>

      </div>

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
