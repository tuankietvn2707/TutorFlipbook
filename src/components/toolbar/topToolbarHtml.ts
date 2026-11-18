export function renderTopToolbarHtml(): string {
  return `
  <!-- TOP STUDIO TOOLBAR (h-12) -->
  <header id="flipbook-top-toolbar" class="w-full h-12 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-2 z-40 select-none shrink-0">
    
    <!-- Left: Back, Book Title & Editable Page Jump -->
    <div class="flex items-center gap-2 sm:gap-3 min-w-0">
      <button 
        id="btn-top-back-lib" 
        type="button"
        class="h-8 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0" 
        title="Quay lại thư viện sách"
      >
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span class="text-xs font-semibold hidden sm:inline">Thư viện</span>
      </button>

      <div class="h-4 w-px bg-slate-200 hidden sm:block shrink-0"></div>

      <span id="reader-book-title" class="hidden lg:inline text-xs font-bold text-slate-900 truncate max-w-[200px]">Giáo trình 3D</span>

      <div class="flex items-center gap-1 shrink-0">
        <button id="btn-top-prev-page" type="button" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer" title="Trang trước [←]">
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>

        <div class="flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap">
          <span class="hidden sm:inline">Trang</span>
          <input id="input-page-number" type="number" min="1" value="1" class="w-11 h-7 text-center font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded-md focus:outline-none focus:border-sky-500 tabular-nums select-text" title="Nhập số trang rồi nhấn Enter để nhảy nhanh" />
          <span class="text-slate-400">/</span>
          <span id="total-pages-label" class="font-mono text-slate-600 tabular-nums">1</span>
          <span id="top-page-num" class="hidden">1</span>
          <span id="top-total-pages" class="hidden">1</span>
          <span id="reader-book-meta" class="hidden"></span>
        </div>

        <button id="btn-top-next-page" type="button" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer" title="Trang sau [→]">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <!-- Center/Right: Classroom Support Tools, Zoom & Menu -->
    <div class="flex items-center gap-1.5 shrink-0">
      <button id="btn-top-timer" type="button" class="h-8 px-2 rounded-lg text-slate-600 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap" title="Đồng hồ đếm giờ lớp học">
        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
        <span class="hidden md:inline">Đếm giờ</span>
      </button>

      <button id="btn-top-notes" type="button" class="h-8 px-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap" title="Bảng từ vựng & Ghi chú bài giảng">
        <i data-lucide="notebook-pen" class="w-3.5 h-3.5"></i>
        <span class="hidden md:inline">Từ vựng</span>
      </button>

      <button id="btn-top-scoreboard" type="button" class="h-8 px-2 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap" title="Bảng điểm & Gọi tên ngẫu nhiên">
        <i data-lucide="trophy" class="w-3.5 h-3.5"></i>
        <span class="hidden xl:inline">Bảng điểm</span>
      </button>

      <button id="btn-top-audio" type="button" class="h-8 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap" title="Mở Audio Studio [A]">
        <i data-lucide="headphones" class="w-3.5 h-3.5"></i>
        <span class="hidden sm:inline">Audio</span>
      </button>

      <div class="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>

      <div class="relative flex items-center gap-0.5" id="zoom-dropdown-container">
        <button id="btn-top-zoom-out" type="button" class="w-7 h-8 rounded-lg hover:bg-slate-100 text-slate-600 hidden sm:flex items-center justify-center cursor-pointer" title="Thu nhỏ [-]">
          <i data-lucide="minus" class="w-3.5 h-3.5"></i>
        </button>
        <button id="btn-top-zoom" type="button" class="w-14 h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-mono font-semibold text-slate-800 cursor-pointer tabular-nums" title="Chọn mức thu phóng">
          <span id="top-zoom-label">100%</span>
        </button>
        <button id="btn-top-zoom-in" type="button" class="w-7 h-8 rounded-lg hover:bg-slate-100 text-slate-600 hidden sm:flex items-center justify-center cursor-pointer" title="Phóng to [+]">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        </button>

        <div id="zoom-menu-dropdown" class="hidden absolute top-full right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 text-xs text-slate-800">
          <button data-zoom="0.5" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 flex items-center justify-between cursor-pointer"><span>50%</span><i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-sky-600 hidden"></i></button>
          <button data-zoom="0.75" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 flex items-center justify-between cursor-pointer"><span>75%</span><i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-sky-600 hidden"></i></button>
          <button data-zoom="1.0" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 flex items-center justify-between cursor-pointer font-medium"><span>100%</span><i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-sky-600"></i></button>
          <button data-zoom="1.5" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 flex items-center justify-between cursor-pointer"><span>150%</span><i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-sky-600 hidden"></i></button>
          <button data-zoom="2.0" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 flex items-center justify-between cursor-pointer"><span>200%</span><i data-lucide="check" class="zoom-check w-3.5 h-3.5 text-sky-600 hidden"></i></button>
          <div class="h-px bg-slate-100 my-1"></div>
          <button data-zoom="fit" class="btn-zoom-item w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 flex items-center justify-between cursor-pointer text-sky-600 font-semibold"><span>Vừa màn hình</span></button>
        </div>
      </div>

      <div class="relative" id="more-tools-dropdown-container">
        <button id="btn-top-more-tools" type="button" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer" title="Thêm công cụ giảng dạy">
          <i data-lucide="more-vertical" class="w-4 h-4"></i>
        </button>

        <div id="more-tools-dropdown" class="hidden absolute top-full right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 z-50 text-xs text-slate-800 space-y-0.5">
          <button id="menu-item-thumbnails" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="layout-grid" class="w-4 h-4 text-sky-600"></i><span>Mục lục trang [G]</span></button>
          <button id="menu-item-audio" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="headphones" class="w-4 h-4 text-sky-600"></i><span>Studio bài nghe [A]</span></button>
          <button id="menu-item-curtain" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="panel-top" class="w-4 h-4 text-indigo-600"></i><span>Màn che đáp án [B]</span></button>
          <button id="menu-item-fullscreen" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="maximize" class="w-4 h-4 text-slate-600"></i><span>Toàn màn hình [F]</span></button>
          <button id="menu-item-sound" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center justify-between cursor-pointer">
            <span class="flex items-center gap-2.5"><i data-lucide="volume-2" class="w-4 h-4 text-slate-600"></i><span>Âm thanh lật sách</span></span>
            <span id="menu-sound-state" class="text-[11px] font-semibold text-emerald-600">Bật</span>
          </button>
          <div class="h-px bg-slate-100 my-1"></div>
          <button id="menu-item-timer" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="clock" class="w-4 h-4 text-amber-500"></i><span>Bắt đầu đếm giờ 5p</span></button>
          <button id="menu-item-confetti" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="sparkles" class="w-4 h-4 text-indigo-500"></i><span>Pháo hoa khen thưởng [R]</span></button>
          <button id="menu-item-shortcuts" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="keyboard" class="w-4 h-4 text-emerald-600"></i><span>Bảng phím tắt [?]</span></button>
          <button id="menu-item-share" class="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"><i data-lucide="link" class="w-4 h-4 text-sky-600"></i><span>Sao chép liên kết</span></button>
        </div>
      </div>
    </div>

  </header>
  `;
}
