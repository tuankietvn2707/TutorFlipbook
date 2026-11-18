export function renderBottomToolbarHtml(): string {
  return `
  <!-- BOTTOM FLOATING TEACHING DOCK -->
  <div id="flipbook-bottom-toolbar-wrap" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 select-none max-w-[96vw]">
    
    <!-- Ink Color & Stroke Size Popover (Visible when a drawing tool is active) -->
    <div id="drawing-style-popover" class="hidden bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg px-2.5 py-1.5 flex items-center gap-2">
      <div class="flex items-center gap-1.5">
        <button type="button" data-color="#0284C7" class="ink-color-swatch w-5 h-5 rounded-full bg-[#0284C7] cursor-pointer transition-transform ring-2 ring-slate-900 scale-110" title="Mực xanh dương"></button>
        <button type="button" data-color="#DC2626" class="ink-color-swatch w-5 h-5 rounded-full bg-[#DC2626] cursor-pointer transition-transform" title="Mực đỏ sửa bài"></button>
        <button type="button" data-color="#059669" class="ink-color-swatch w-5 h-5 rounded-full bg-[#059669] cursor-pointer transition-transform" title="Mực xanh lá"></button>
        <button type="button" data-color="#D97706" class="ink-color-swatch w-5 h-5 rounded-full bg-[#D97706] cursor-pointer transition-transform" title="Mực cam"></button>
        <button type="button" data-color="#0F172A" class="ink-color-swatch w-5 h-5 rounded-full bg-[#0F172A] cursor-pointer transition-transform" title="Mực đen"></button>
      </div>

      <div class="h-4 w-px bg-slate-200"></div>

      <div class="flex items-center gap-1 text-[11px] font-semibold">
        <button type="button" data-size="2" class="ink-size-btn px-2 py-0.5 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer">Mảnh</button>
        <button type="button" data-size="3" class="ink-size-btn px-2 py-0.5 rounded-md bg-slate-900 text-white cursor-pointer">Vừa</button>
        <button type="button" data-size="6" class="ink-size-btn px-2 py-0.5 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer">Đậm</button>
      </div>
    </div>

    <!-- Main Dock Bar -->
    <div id="flipbook-bottom-toolbar" class="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
      
      <!-- Group 1: Pointer & Drawing Shapes -->
      <div class="flex items-center gap-0.5 shrink-0">
        <button id="btn-tool-none" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-900 text-white shadow-sm transition-all cursor-pointer" title="Con trỏ lật trang bình thường [Esc]">
          <i data-lucide="mouse-pointer-2" class="w-4 h-4"></i>
        </button>

        <button id="btn-tool-pencil" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer" title="Bút vẽ tự do [P]">
          <i data-lucide="pencil" class="w-4 h-4"></i>
        </button>

        <button id="btn-tool-highlighter" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer" title="Bút dạ quang đánh dấu [M]">
          <i data-lucide="highlighter" class="w-4 h-4"></i>
        </button>

        <button id="btn-tool-line" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer" title="Kẻ đường thẳng gạch chân câu">
          <i data-lucide="minus" class="w-4 h-4"></i>
        </button>

        <button id="btn-tool-rect" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer" title="Khoanh khung bài tập">
          <i data-lucide="square" class="w-4 h-4"></i>
        </button>

        <button id="btn-tool-eraser" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer" title="Cục tẩy nét vẽ [E]">
          <i data-lucide="eraser" class="w-4 h-4"></i>
        </button>

        <button id="btn-tool-undo" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer" title="Hoàn tác nét vẽ vừa rồi [U]">
          <i data-lucide="undo-2" class="w-4 h-4"></i>
        </button>

        <button id="btn-tool-clear" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer" title="Xóa toàn bộ nét vẽ trên trang [C]">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="h-5 w-px bg-slate-200 mx-0.5 shrink-0"></div>

      <!-- Group 2: Focus, Curtain & Pan -->
      <div class="flex items-center gap-0.5 shrink-0">
        <button id="btn-laser" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-slate-100 transition-all cursor-pointer" title="Con trỏ Laser đỏ [L]">
          <i data-lucide="disc" class="w-4 h-4"></i>
        </button>

        <button id="btn-spotlight" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-amber-500 hover:bg-slate-100 transition-all cursor-pointer" title="Đèn rọi Spotlight [S] (Nhấn đúp để đổi cỡ)">
          <i data-lucide="sun-medium" class="w-4 h-4"></i>
        </button>

        <button id="btn-bottom-curtain" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer" title="Màn che đáp án kéo lên/xuống [B]">
          <i data-lucide="panel-top" class="w-4 h-4"></i>
        </button>

        <button id="btn-bottom-pan" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-amber-600 hover:bg-slate-100 transition-all cursor-pointer" title="Bàn tay kéo trang [H]">
          <i data-lucide="hand" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="h-5 w-px bg-slate-200 mx-0.5 shrink-0"></div>

      <!-- Group 3: Media, Thumbnails & Reward -->
      <div class="flex items-center gap-0.5 shrink-0">
        <button id="btn-bottom-audio" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-sky-600 hover:bg-sky-50 transition-all cursor-pointer" title="Bật/Tắt Studio bài nghe Audio [A]">
          <i data-lucide="volume-2" class="w-4 h-4"></i>
        </button>

        <button id="btn-bottom-grid" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer" title="Mục lục tất cả trang [G]">
          <i data-lucide="layout-grid" class="w-4 h-4"></i>
        </button>

        <button id="btn-bottom-confetti" type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer" title="Pháo hoa khen thưởng học sinh [R]">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
        </button>
      </div>

    </div>
  </div>
  `;
}
