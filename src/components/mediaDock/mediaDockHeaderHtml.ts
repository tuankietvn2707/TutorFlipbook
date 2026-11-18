export function renderMediaDockHeaderHtml(): string {
  return `
    <!-- Top Bar: Studio Header, Track Counter & Actions -->
    <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-2.5">
      
      <!-- Left: Studio Identity, Counter & Format -->
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-white/10 text-sky-300 border border-white/15 flex items-center justify-center shrink-0">
          <i data-lucide="headphones" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 text-xs text-white min-w-0">
            <h4 class="font-bold tracking-tight whitespace-nowrap">Audio Studio</h4>
            <span class="text-white/30" aria-hidden="true">·</span>
            <span id="media-track-position" class="text-[11px] font-mono text-sky-300 font-semibold tabular-nums whitespace-nowrap">
              Bài 0 / 0
            </span>
            <span id="media-track-count-badge" class="hidden">0 bài nghe</span>
            <span id="media-track-format-badge" class="hidden text-[10px] font-mono font-bold text-emerald-300 whitespace-nowrap">
              WAV
            </span>
          </div>
          <p id="media-current-book-label" class="text-[11px] text-white/55 truncate font-medium">Chưa chọn sách</p>
        </div>
      </div>

      <!-- Right: Playlist, Sort, Upload & Window Controls -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button 
          type="button"
          id="btn-toggle-playlist-drawer" 
          class="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/10 whitespace-nowrap shrink-0"
          title="Mở danh sách tất cả bài nghe kèm tìm kiếm nhanh"
        >
          <i data-lucide="list-music" class="w-3.5 h-3.5 text-sky-300"></i>
          <span class="hidden sm:inline">Danh sách</span>
        </button>

        <button 
          type="button"
          id="btn-sort-audio-tracks" 
          class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer border border-white/10 whitespace-nowrap shrink-0" 
          title="Sắp xếp tự nhiên theo thứ tự số (Track 1, 2... 10)"
        >
          <i data-lucide="arrow-down-1-0" class="w-3.5 h-3.5 text-sky-300"></i>
          <span class="hidden md:inline">Xếp 1-9</span>
        </button>

        <label 
          class="px-2.5 sm:px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 transition active:scale-95 whitespace-nowrap shrink-0" 
          title="Thêm file bài nghe .WAV, .MP3 vào sách này"
        >
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Thêm Audio</span>
          <input type="file" id="input-add-audio-files" multiple accept="audio/*,audio/wav,audio/x-wav,audio/wave,.wav,.wave,.mp3,.m4a,.aac,.ogg,.flac" class="hidden" />
        </label>

        <button 
          type="button"
          id="btn-open-batch-media-from-dock" 
          class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition active:scale-95 hidden lg:flex items-center justify-center cursor-pointer border border-white/10"
          title="Quản lý media hàng loạt"
        >
          <i data-lucide="layers" class="w-3.5 h-3.5 text-sky-300"></i>
        </button>

        <div class="h-4 w-px bg-white/15 mx-0.5"></div>

        <button 
          type="button"
          id="btn-minimize-media-dock" 
          class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition flex items-center justify-center cursor-pointer" 
          title="Thu gọn thành thanh nổi nhỏ"
        >
          <i data-lucide="minus" class="w-3.5 h-3.5"></i>
        </button>

        <button 
          type="button"
          id="btn-close-media-dock" 
          class="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/30 text-white/70 hover:text-rose-300 transition flex items-center justify-center cursor-pointer" 
          title="Đóng bảng điều khiển âm thanh"
        >
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>

    </div>
  `;
}
