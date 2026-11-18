import { APP_VERSION } from '../../version';

export function renderLibraryViewHtml(): string {
  return `
  <section id="view-library" class="max-w-7xl mx-auto space-y-5">
    
    <!-- Workspace Header & Filter Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar shrink-0">
        <button type="button" data-category="all" class="btn-lib-cat px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0">Tất cả</button>
        <button type="button" data-category="textbook" class="btn-lib-cat px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer whitespace-nowrap shrink-0">Giáo trình</button>
        <button type="button" data-category="exercise" class="btn-lib-cat px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer whitespace-nowrap shrink-0">Bài tập</button>
        <button type="button" data-category="reference" class="btn-lib-cat px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer whitespace-nowrap shrink-0">Tham khảo</button>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <span id="library-result-summary" class="text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">0 giáo trình</span>

        <button type="button" id="btn-filter-audio-only" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0">
          <i data-lucide="headphones" class="w-3.5 h-3.5 text-indigo-600"></i>
          <span>Có Audio</span>
        </button>

        <select id="select-library-sort" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer">
          <option value="recent">Mới nhất</option>
          <option value="title">Tên A–Z</option>
          <option value="audio">Nhiều Audio nhất</option>
          <option value="pages">Nhiều trang nhất</option>
        </select>
      </div>
    </div>

    <!-- Book Grid Container -->
    <div id="books-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <!-- Dynamic 3D Book Cards -->
    </div>

    <!-- Empty State Container -->
    <div id="empty-state" class="hidden text-center py-16 px-4 space-y-4">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
        <i data-lucide="book-open" class="w-8 h-8"></i>
      </div>
      <div class="space-y-1">
        <h3 class="font-bold text-base text-slate-900">Không tìm thấy tài liệu phù hợp</h3>
        <p class="text-xs text-slate-500 font-medium max-w-sm mx-auto">
          Hãy thử đổi bộ lọc danh mục hoặc tải lên giáo trình PDF đầu tiên của bạn để mở trình đọc 3D.
        </p>
      </div>
      <button id="btn-empty-upload" class="btn-3d btn-green text-white font-semibold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>Tải Sách PDF Ngay</span>
      </button>
    </div>

    <!-- Quiet Studio Footer -->
    <footer class="pt-8 pb-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 select-none">
      <span class="font-medium">Biblio3D Teaching Studio · Trình đọc giáo trình 3D &amp; Audio ngoại tuyến</span>
      <span class="font-mono text-[11px] text-slate-400 tabular-nums">Phiên bản ${APP_VERSION}</span>
    </footer>

  </section>
  `;
}
