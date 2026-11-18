export function renderMediaDockDrawerHtml(): string {
  return `
    <!-- APPLE-STYLE TRACK PLAYLIST DRAWER -->
    <div 
      id="apple-audio-playlist-drawer" 
      class="hidden mt-3 pt-3 border-t border-white/10 space-y-2"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="relative flex-1 max-w-sm">
          <i data-lucide="search" class="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2"></i>
          <input 
            type="text" 
            id="input-search-playlist-tracks" 
            placeholder="Tìm nhanh bài nghe theo tên hoặc số (VD: 15, Unit 1)..." 
            class="w-full pl-8 pr-3 py-1.5 bg-white/10 focus:bg-white/15 border border-white/10 focus:border-sky-400 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none transition"
          />
        </div>
        <div class="flex items-center gap-1.5">
          <span id="playlist-drawer-count" class="text-[11px] font-mono text-white/60 font-medium tabular-nums">0 bài</span>
          <button 
            type="button" 
            id="btn-close-playlist-drawer" 
            class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Đóng danh sách"
          >
            <i data-lucide="chevron-up" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <div 
        id="playlist-drawer-tracks-list" 
        class="max-h-56 overflow-y-auto space-y-1 pr-1"
      ></div>
    </div>

    <!-- Empty State -->
    <div id="media-dock-empty-state" class="hidden p-5 text-center bg-white/5 rounded-xl border border-dashed border-white/20 space-y-2.5">
      <div class="w-11 h-11 rounded-xl bg-white/10 text-sky-300 flex items-center justify-center mx-auto border border-white/10">
        <i data-lucide="music" class="w-5 h-5"></i>
      </div>
      <div>
        <p class="font-bold text-xs sm:text-sm text-white">Sách này chưa có bài nghe nào</p>
        <p class="text-[11px] text-white/55 max-w-md mx-auto mt-0.5">
          Hỗ trợ đầy đủ định dạng chuẩn .WAV, .MP3, .M4A... để giáo viên phát luyện nghe trực tiếp trong bài học.
        </p>
      </div>
      <label class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95">
        <i data-lucide="upload" class="w-4 h-4"></i>
        <span>Chọn File Audio (.WAV / .MP3) Từ Máy Tính</span>
        <input type="file" id="input-add-audio-files-empty" multiple accept="audio/*,audio/wav,audio/x-wav,audio/wave,.wav,.wave,.mp3,.m4a,.aac,.ogg,.flac" class="hidden" />
      </label>
    </div>
  `;
}

export function renderMediaMiniPillHtml(): string {
  return `
  <!-- MINI FLOATING AUDIO REMOTE -->
  <div 
    id="media-mini-pill" 
    class="hidden fixed bottom-16 right-4 sm:right-6 z-50 bg-slate-900/95 backdrop-blur-2xl text-white border border-white/15 rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-3 select-none"
  >
    <div class="flex items-center gap-2 cursor-pointer" id="mini-pill-expand-trigger" title="Nhấn để mở rộng toàn bộ Audio Studio">
      <div id="mini-pill-eq" class="flex items-end gap-0.5 h-3">
        <span class="w-0.5 bg-sky-400 rounded-full h-1"></span>
        <span class="w-0.5 bg-sky-400 rounded-full h-2.5"></span>
        <span class="w-0.5 bg-sky-400 rounded-full h-1.5"></span>
      </div>
      <span id="mini-pill-track-name" class="text-xs font-semibold max-w-[120px] sm:max-w-[180px] truncate text-white">Track 1</span>
      <span id="mini-pill-time" class="text-[10px] font-mono text-sky-300 tabular-nums">00:00</span>
    </div>

    <div class="flex items-center gap-1 border-l border-white/15 pl-2">
      <button type="button" id="btn-mini-rewind" class="p-1 hover:text-sky-300 text-white/70 transition cursor-pointer" title="Tua -5s">
        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-play" class="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center shadow transition active:scale-95 cursor-pointer" title="Phát/Dừng">
        <i data-lucide="play" id="mini-pill-play-icon" class="w-3.5 h-3.5 fill-current ml-0.5"></i>
      </button>
      <button type="button" id="btn-mini-forward" class="p-1 hover:text-sky-300 text-white/70 transition cursor-pointer" title="Tua +5s">
        <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-expand" class="p-1 hover:text-sky-300 text-white/70 transition cursor-pointer" title="Mở rộng Audio Studio">
        <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-close" class="p-1 hover:text-rose-400 text-white/50 transition cursor-pointer" title="Đóng">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  </div>
  `;
}
