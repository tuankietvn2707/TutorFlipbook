export function renderShortcutsCategoriesHtml(): string {
  return `
      <!-- Shortcuts Grid List -->
      <div class="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        
        <!-- Category 1: Lật Trang & Điều Hướng -->
        <div class="space-y-2">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-sky-600"></i>
            <span>Lật Trang &amp; Điều Hướng Sách</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Lật trang kế tiếp</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">→</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">J</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Lật trang trước</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">←</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">K</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Trang đầu / Trang cuối</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">Home</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">End</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Phóng to / Thu nhỏ / 100%</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">+</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">-</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">0</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Mở mục lục tất cả trang</span>
              <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">G</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Bàn tay kéo trang</span>
              <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">H</kbd>
            </div>
          </div>
        </div>

        <!-- Category 2: Công Cụ Bút Vẽ & Giảng Dạy -->
        <div class="space-y-2">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i data-lucide="pen-tool" class="w-3.5 h-3.5 text-rose-500"></i>
            <span>Công Cụ Vẽ &amp; Hỗ Trợ Giảng Dạy</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Con trỏ Laser đỏ</span>
              <kbd class="px-2 py-0.5 bg-red-50 border border-red-200 rounded text-[11px] font-mono font-bold text-red-600">L</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Đèn rọi Spotlight</span>
              <kbd class="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[11px] font-mono font-bold text-amber-700">S</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Màn che đáp án</span>
              <kbd class="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[11px] font-mono font-bold text-indigo-700">B</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Bút vẽ / Dạ quang / Tẩy</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">P</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">M</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">E</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Hoàn tác nét vẽ vừa rồi</span>
              <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">U</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Xóa nét vẽ trên trang</span>
              <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">C</kbd>
            </div>
          </div>
        </div>

        <!-- Category 3: Audio & Chế Độ Trình Chiếu -->
        <div class="space-y-2">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i data-lucide="headphones" class="w-3.5 h-3.5 text-sky-600"></i>
            <span>Audio Studio &amp; Trình Chiếu Meet</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Phát / Tạm dừng Audio</span>
              <kbd class="px-2 py-0.5 bg-sky-50 border border-sky-200 rounded text-[11px] font-mono font-bold text-sky-700">Space</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Mở / Đóng Audio Studio</span>
              <kbd class="px-2 py-0.5 bg-sky-50 border border-sky-200 rounded text-[11px] font-mono font-bold text-sky-700">A</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Bài nghe trước / kế tiếp</span>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">[</kbd>
                <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">]</kbd>
              </div>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Toàn màn hình Meet 3D</span>
              <kbd class="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-mono font-bold text-emerald-700">F</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Pháo hoa khen thưởng</span>
              <kbd class="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[11px] font-mono font-bold text-indigo-700">R</kbd>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="font-semibold text-slate-700">Thoát toàn màn hình / Đóng bảng</span>
              <kbd class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-700">Esc</kbd>
            </div>
          </div>
        </div>

      </div>
  `;
}
