export function renderMediaDockBodyHtml(): string {
  return `
    <!-- Main Player Body -->
    <div id="media-dock-player-content" class="space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        <!-- Column 1: Now Playing Artwork & Meta -->
        <div class="md:col-span-4 flex items-center gap-3 min-w-0 bg-white/[0.06] p-2 rounded-xl border border-white/10">
          <div 
            id="apple-artwork-container"
            class="w-11 h-11 rounded-lg bg-slate-800 border border-white/15 flex items-center justify-center relative overflow-hidden shrink-0"
          >
            <div id="apple-equalizer-bars" class="flex items-end gap-0.5 h-5">
              <span class="eq-bar w-1 bg-sky-400 rounded-full h-1.5 transition-all"></span>
              <span class="eq-bar w-1 bg-sky-400 rounded-full h-3 transition-all"></span>
              <span class="eq-bar w-1 bg-sky-400 rounded-full h-2 transition-all"></span>
              <span class="eq-bar w-1 bg-sky-400 rounded-full h-3.5 transition-all"></span>
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <span id="player-track-format-tag" class="text-[10px] font-mono font-bold uppercase text-emerald-300 shrink-0">
                WAV
              </span>
              <span class="text-white/30 text-xs shrink-0" aria-hidden="true">·</span>
              <h5 id="player-track-name" class="font-semibold text-xs sm:text-sm text-white truncate tracking-tight">
                Chọn bài nghe
              </h5>
            </div>
            <p id="player-track-folder" class="text-[11px] text-white/55 truncate font-medium mt-0.5">
              Thư mục chung
            </p>
          </div>

          <button 
            type="button"
            id="btn-track-delete" 
            class="p-1.5 rounded-lg text-white/35 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95 shrink-0 cursor-pointer" 
            title="Xóa bài nghe này khỏi sách"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Column 2: Transport Controls, A-B Repeat & Scrubber -->
        <div class="md:col-span-5 flex flex-col items-center gap-1.5">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <button type="button" id="btn-audio-loop" class="h-8 px-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center gap-1 shrink-0 text-[11px] font-semibold whitespace-nowrap" title="Chế độ lặp: Tự chuyển tiếp / Lặp tất cả / Lặp 1 bài [L]">
              <i data-lucide="repeat" id="icon-audio-loop" class="w-3.5 h-3.5"></i>
              <span id="label-audio-loop" class="hidden sm:inline">Tuần tự</span>
            </button>

            <button type="button" id="btn-audio-rewind" class="w-8 h-8 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0" title="Tua lùi 5 giây [←]">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            </button>

            <button type="button" id="btn-track-prev" class="w-8 h-8 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition active:scale-95 shrink-0 cursor-pointer flex items-center justify-center" title="Bài trước [Shift + ←]">
              <i data-lucide="skip-back" class="w-4 h-4"></i>
            </button>

            <button type="button" id="btn-audio-play" class="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-[0_4px_16px_rgba(255,255,255,0.22)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0" title="Phát / Tạm dừng [Space]">
              <i data-lucide="play" id="icon-audio-play" class="w-5 h-5 fill-current ml-0.5"></i>
            </button>

            <button type="button" id="btn-track-next" class="w-8 h-8 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition active:scale-95 shrink-0 cursor-pointer flex items-center justify-center" title="Bài kế tiếp [Shift + →]">
              <i data-lucide="skip-forward" class="w-4 h-4"></i>
            </button>

            <button type="button" id="btn-audio-forward" class="w-8 h-8 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0" title="Tua tới 5 giây [→]">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>

            <button type="button" id="btn-ab-loop" class="h-8 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/75 text-[11px] font-mono font-bold transition active:scale-95 cursor-pointer shrink-0 border border-white/10 whitespace-nowrap" title="Đánh dấu lặp đoạn A–B để nghe lại câu khó">
              A-B
            </button>

            <button type="button" id="btn-speed-cycle" class="h-8 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-sky-300 text-[11px] font-mono font-bold transition active:scale-95 cursor-pointer shrink-0 border border-white/10 whitespace-nowrap" title="Đổi tốc độ phát (0.75x - 2.0x)">
              1.0×
            </button>
          </div>

          <div class="w-full flex items-center gap-2">
            <span id="audio-time-current" class="text-[11px] font-mono font-medium text-white/70 shrink-0 w-10 text-right select-none tabular-nums">
              00:00
            </span>
            <div class="flex-1 relative flex items-center min-w-0 group py-1">
              <input type="range" id="audio-progress-bar" value="0" min="0" max="100" step="0.1" class="apple-slider w-full h-1.5 group-hover:h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-sky-400 transition-all focus:outline-none" />
            </div>
            <button type="button" id="btn-toggle-time-mode" class="text-[11px] font-mono font-medium text-white/70 hover:text-white shrink-0 w-11 text-left select-none tabular-nums cursor-pointer" title="Nhấn để đổi giữa Tổng thời lượng và Thời gian còn lại">
              <span id="audio-time-total">00:00</span>
            </button>
          </div>
        </div>

        <!-- Column 3: Volume & Quick Track Select -->
        <div class="md:col-span-3 flex items-center justify-end gap-2">
          <div class="flex items-center gap-1.5 bg-white/[0.06] px-2.5 py-1.5 rounded-xl border border-white/10">
            <button type="button" id="btn-volume-toggle" class="text-white/70 hover:text-white transition cursor-pointer" title="Bật/Tắt âm lượng [M]">
              <i data-lucide="volume-2" id="icon-volume-speaker" class="w-4 h-4"></i>
            </button>
            <input type="range" id="audio-volume-slider" min="0" max="1" step="0.05" value="1" class="apple-slider w-16 sm:w-20 h-1 bg-white/25 rounded-full appearance-none cursor-pointer accent-white focus:outline-none" title="Thanh chỉnh âm lượng" />
          </div>

          <div class="relative w-32 sm:w-40">
            <select id="media-track-select" class="w-full px-2.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl font-medium text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer truncate" title="Chọn bài nghe nhanh">
              <option value="">-- Bài nghe --</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  `;
}
